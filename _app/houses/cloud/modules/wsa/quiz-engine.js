/**
 * WSA Quiz Engine v2.0
 *
 * Exam-mode quiz engine for WSA modules.
 * - Answer choices shuffled on each load (eliminates position bias)
 * - No per-question feedback — answers collected, reviewed at the end
 * - Full post-quiz review with explanations
 * - Progress tracking via WSAProgress
 *
 * Usage:
 *   WSAQuiz.init({
 *       moduleId: 'm01',
 *       title: 'Server Installation & Configuration',
 *       nextModule: '../m02-active-directory/cloud-presentation.module.html',
 *       displayCount: 10,   // QC-8: question pooling (draw N from larger bank, null = all)
 *       questions: [ { question: '...', options: ['A','B','C','D'], correct: 1, explanation: '...' } ]
 *   });
 */
window.WSAQuiz = (() => {
    let config = null;
    let shuffledQuestions = [];
    let currentQuestion = 0;
    let userAnswers = [];     // stores shuffled index per question
    let submitted = false;
    let reviewMode = false;
    // Populated by showResults() after a successful server-grading call.
    // Index matches shuffledQuestions. null = local-grading path (offline/preview).
    // Shape per entry: { isCorrect: <bool>, correctShuffledIdx: <int|null>, explanation: <string|null> }
    //   correctShuffledIdx is null for failing students (server withholds reveal).
    let serverReview = null;

    function init(cfg) {
        config = cfg;

        // QC-8: Question pooling — shuffle full bank, then draw displayCount
        let pool = [...cfg.questions];
        // Fisher-Yates shuffle the question order
        for (let i = pool.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [pool[i], pool[j]] = [pool[j], pool[i]];
        }
        if (cfg.displayCount && pool.length > cfg.displayCount) {
            pool = pool.slice(0, cfg.displayCount);
        }

        shuffledQuestions = pool.map(q => shuffleQuestion(q));
        userAnswers = new Array(shuffledQuestions.length).fill(null);
        submitted = false;
        reviewMode = false;
        currentQuestion = 0;
        render();
        renderQuestion();
    }

    // Shuffle answer choices, remap correct index
    function shuffleQuestion(q) {
        const indices = q.options.map((_, i) => i);
        // Fisher-Yates shuffle
        for (let i = indices.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [indices[i], indices[j]] = [indices[j], indices[i]];
        }
        return {
            question: q.question,
            options: indices.map(i => q.options[i]),
            correct: indices.indexOf(q.correct),
            explanation: q.explanation
        };
    }

    function render() {
        const container = document.getElementById('wsaQuizRoot');
        if (!container) return;

        container.innerHTML = `
            <div class="wq-header">
                <h1>${config.title} Quiz</h1>
                <p>${shuffledQuestions.length} questions &middot; 70% to pass &middot; Exam mode (no peeking)</p>
                <div class="wq-progress-bar">
                    <div class="wq-progress-fill" id="wqProgressFill"></div>
                </div>
                <div class="wq-progress-text" id="wqProgressText"></div>
            </div>

            <div class="wq-question-map" id="wqQuestionMap"></div>

            <div id="wqBody">
                <div id="wqQuestionArea"></div>
                <div class="wq-nav" id="wqNav">
                    <button class="wq-btn wq-btn-secondary" id="wqPrev" onclick="WSAQuiz.prev()">&#8592; Previous</button>
                    <button class="wq-btn wq-btn-primary" id="wqNext" onclick="WSAQuiz.next()">Next &#8594;</button>
                </div>
            </div>

            <div id="wqResults" class="wq-results" style="display:none"></div>
        `;

        renderQuestionMap();
    }

    function renderQuestionMap() {
        const map = document.getElementById('wqQuestionMap');
        if (!map) return;
        map.innerHTML = shuffledQuestions.map((_, i) => {
            let cls = 'wq-map-dot';
            if (i === currentQuestion) cls += ' current';
            if (userAnswers[i] !== null) cls += ' answered';
            if (submitted) {
                // Use server-authoritative right/wrong when available; fall back to local q.correct.
                const isCorrect = serverReview
                    ? serverReview[i].isCorrect
                    : userAnswers[i] === shuffledQuestions[i].correct;
                cls += isCorrect ? ' correct' : ' incorrect';
            }
            return `<button class="${cls}" onclick="WSAQuiz.goTo(${i})" title="Question ${i + 1}">${i + 1}</button>`;
        }).join('');
    }

    function renderQuestion() {
        const q = shuffledQuestions[currentQuestion];
        const area = document.getElementById('wqQuestionArea');
        const isReview = submitted;

        // In review mode, resolve right/wrong and correct-option reveal from server data when available.
        // sr is null when using local grading (offline/preview); sr.correctShuffledIdx is null for failing
        // students (server withholds the answer reveal — only isCorrect is authoritative in that case).
        const sr = (isReview && serverReview) ? serverReview[currentQuestion] : null;
        // Authoritative right/wrong for THIS question (server when available, else local key).
        // Used for marking the student's own answer — independent of whether the correct
        // option is revealed (failers get right/wrong but no reveal).
        const userIsCorrect = isReview
            ? (sr ? sr.isCorrect : userAnswers[currentQuestion] === q.correct)
            : false;

        const optionsHtml = q.options.map((opt, i) => {
            let cls = 'wq-option';
            const isSelected = userAnswers[currentQuestion] === i;
            if (isSelected) cls += ' selected';
            // Correct option index for the highlight/check: server reveal (null = withheld) or local key.
            const correctIdx = sr ? sr.correctShuffledIdx : q.correct;
            if (isReview) {
                if (correctIdx !== null && i === correctIdx) cls += ' correct';
                // Mark the student's OWN choice wrong ONLY when their answer was actually incorrect —
                // never cross a correct answer, even when the correct option is withheld for failers.
                else if (isSelected && !userIsCorrect) cls += ' incorrect';
                cls += ' disabled';
            }
            const letter = String.fromCharCode(65 + i);
            const showCheck = isReview && correctIdx !== null && i === correctIdx;
            const showCross = isReview && isSelected && !userIsCorrect;
            return `<div class="${cls}" ${!isReview ? `onclick="WSAQuiz.select(${i})"` : ''}>
                <span class="wq-option-letter">${letter}</span>
                <span class="wq-option-text">${opt}</span>
                ${showCheck ? '<span class="wq-check">&#10003;</span>' : ''}
                ${showCross ? '<span class="wq-cross">&#10007;</span>' : ''}
            </div>`;
        }).join('');

        // Build the post-question explanation block for review mode.
        let explanationHtml = '';
        if (isReview) {
            const isCorrect = userIsCorrect;
            const resultLabel = isCorrect ? '&#10003; Correct' : '&#10007; Incorrect';

            if (sr) {
                // Server-graded path: show explanation only when the server revealed it (passers).
                // Failing students see a guidance note instead — never reveal the correct answer.
                if (sr.correctShuffledIdx !== null) {
                    // Answer reveal available (student passed).
                    const explText = sr.explanation
                        ? `<p>${sr.explanation}</p>`
                        : '';
                    explanationHtml = `<div class="wq-explanation"><strong>${resultLabel}</strong>${explText}</div>`;
                } else {
                    // No reveal (student failed) — show right/wrong only with a retake prompt.
                    explanationHtml = `<div class="wq-explanation"><strong>${resultLabel}</strong><p>Review the material and retake to see the full explanation.</p></div>`;
                }
            } else {
                // Local-grading fallback path (offline/preview): use client-side explanation as before.
                explanationHtml = `<div class="wq-explanation"><strong>${resultLabel}</strong><p>${q.explanation || ''}</p></div>`;
            }
        }

        area.innerHTML = `
            <div class="wq-question-card">
                <div class="wq-question-num">Question ${currentQuestion + 1} of ${shuffledQuestions.length}</div>
                <div class="wq-question-text">${q.question}</div>
                <div class="wq-options">${optionsHtml}</div>
                ${explanationHtml}
            </div>
        `;

        // Update nav buttons
        const prevBtn = document.getElementById('wqPrev');
        const nextBtn = document.getElementById('wqNext');
        prevBtn.disabled = currentQuestion === 0;

        if (submitted) {
            nextBtn.textContent = currentQuestion === shuffledQuestions.length - 1 ? 'Back to Results' : 'Next \u2192';
        } else if (currentQuestion === shuffledQuestions.length - 1) {
            const allAnswered = userAnswers.every(a => a !== null);
            nextBtn.textContent = 'Submit Quiz';
            nextBtn.disabled = !allAnswered;
            nextBtn.classList.toggle('wq-btn-submit', allAnswered);
        } else {
            nextBtn.textContent = 'Next \u2192';
            nextBtn.disabled = false;
        }

        // Update progress
        const answeredCount = userAnswers.filter(a => a !== null).length;
        const pct = (answeredCount / shuffledQuestions.length) * 100;
        document.getElementById('wqProgressFill').style.width = pct + '%';
        document.getElementById('wqProgressText').textContent =
            submitted ? `Review: Question ${currentQuestion + 1} of ${shuffledQuestions.length}`
                      : `${answeredCount} of ${shuffledQuestions.length} answered`;

        renderQuestionMap();
    }

    function select(idx) {
        if (submitted) return;
        userAnswers[currentQuestion] = idx;
        renderQuestion();
    }

    function next() {
        if (submitted) {
            if (currentQuestion < shuffledQuestions.length - 1) {
                currentQuestion++;
                renderQuestion();
            } else {
                // Back to results: already graded once on submit — just re-show the
                // results panel (re-calling showResults would re-invoke gradeQuiz and
                // log a duplicate attempt).
                document.getElementById('wqBody').style.display = 'none';
                document.getElementById('wqResults').style.display = 'block';
            }
            return;
        }
        if (currentQuestion === shuffledQuestions.length - 1) {
            submitQuiz();
        } else {
            currentQuestion++;
            renderQuestion();
        }
    }

    function prev() {
        if (currentQuestion > 0) {
            currentQuestion--;
            renderQuestion();
        }
    }

    function goTo(idx) {
        currentQuestion = idx;
        renderQuestion();
    }

    function submitQuiz() {
        const unanswered = userAnswers.filter(a => a === null).length;
        if (unanswered > 0) {
            if (!confirm(`You have ${unanswered} unanswered question${unanswered > 1 ? 's' : ''}. Submit anyway?`)) return;
        }
        submitted = true;
        showResults();
    }

    /**
     * showResults — Server-side grading when available (QC-21).
     *
     * The quiz shuffles both question ORDER and answer ORDER. The server
     * stores keys in ORIGINAL order. So we need to:
     *   1. Map each shuffled question back to its original index in config.questions
     *   2. Map the user's shuffled answer index back to the original option index
     *   3. Send { originalQuestionIndex: originalAnswerIndex } to the server
     *
     * If FirebaseAuth isn't available, falls back to local grading (the
     * shuffledQuestions still have correct: for offline/preview mode).
     */
    async function showResults() {
        let correct = 0;
        const total = shuffledQuestions.length;
        let pct = 0;
        let passed = false;
        let serverGraded = false;

        // Try server-side grading first
        const quizId = 'wsa-' + config.moduleId;
        try {
            if (typeof FirebaseAuth !== 'undefined') {
                await FirebaseAuth.waitForAuth();

                // Build answer map in ORIGINAL question/answer order
                // shuffledQuestions were drawn from config.questions, so find original index
                const answerMap = {};
                shuffledQuestions.forEach((sq, i) => {
                    if (userAnswers[i] === null) return;
                    // Find which original question this shuffled question came from
                    const origIdx = config.questions.findIndex(oq => oq.question === sq.question);
                    if (origIdx === -1) return;
                    // Map shuffled answer index back to original option index
                    // sq.options[userAnswers[i]] is the text the user selected
                    // Find that text in the original question's options
                    const selectedText = sq.options[userAnswers[i]];
                    const origAnswerIdx = config.questions[origIdx].options.indexOf(selectedText);
                    answerMap[String(origIdx)] = origAnswerIdx;
                });

                const response = await FirebaseAuth.callFunction('gradeQuiz', {
                    quizId: quizId, answers: answerMap
                });
                correct = response.data.score;
                pct = response.data.percentage;
                passed = response.data.passed;
                serverGraded = true;

                // Build serverReview[] — one entry per shuffled question, in shuffled order.
                // results[] from the server is in ORIGINAL question order.
                // We already computed origIdx per shuffled slot above; recompute it here for
                // all questions (including unanswered ones that were skipped in answerMap).
                const serverResults = response.data.results;
                if (Array.isArray(serverResults)) {
                    serverReview = shuffledQuestions.map((sq, i) => {
                        // Find this shuffled question's original index by matching question text.
                        const origIdx = config.questions.findIndex(oq => oq.question === sq.question);
                        if (origIdx === -1 || !serverResults[origIdx]) {
                            // Guard: original question not found or result missing — treat as incorrect, no reveal.
                            return { isCorrect: false, correctShuffledIdx: null, explanation: null };
                        }
                        const r = serverResults[origIdx];
                        let correctShuffledIdx = null;
                        let explanation = null;

                        if (r.correctAnswer !== undefined) {
                            // Server revealed the correct answer (student passed).
                            // r.correctAnswer is the index into config.questions[origIdx].options.
                            // Translate to the shuffled option order for this question.
                            const correctText = config.questions[origIdx].options[r.correctAnswer];
                            const shuffledIdx = sq.options.indexOf(correctText);
                            // Guard: if text not found in shuffled options, leave null (no reveal).
                            correctShuffledIdx = shuffledIdx !== -1 ? shuffledIdx : null;
                            explanation = r.explanation || null;
                        }

                        return {
                            isCorrect: !!r.correct,       // authoritative right/wrong from server
                            correctShuffledIdx,            // null = not revealed (failer)
                            explanation                    // null = not revealed or not provided
                        };
                    });
                }
            }
        } catch (e) {
            console.warn('WSAQuiz: Server grading failed, falling back to local:', e.message);
        }

        // Fallback: local grading if server unavailable (offline/preview — client-side keys present).
        if (!serverGraded) {
            serverReview = null;  // ensure local path uses q.correct throughout
            shuffledQuestions.forEach((q, i) => {
                if (userAnswers[i] === q.correct) correct++;
            });
            pct = Math.round((correct / total) * 100);
            passed = pct >= 70;
        }

        // Track progress
        if (passed && typeof WSAProgress !== 'undefined') {
            WSAProgress.markQuizPassed(config.moduleId, pct);
        }

        // Hide question area, show results
        document.getElementById('wqBody').style.display = 'none';
        const results = document.getElementById('wqResults');
        results.style.display = 'block';

        // Build per-question review summary table rows.
        // When serverReview is populated: use it for right/wrong and for the correct-letter column.
        // The correct letter is only shown when the server revealed it (passers); failers see '-'.
        const reviewRows = shuffledQuestions.map((q, i) => {
            const sr = serverReview ? serverReview[i] : null;
            // Right/wrong: authoritative from server when available; local q.correct otherwise.
            const isCorrect = sr ? sr.isCorrect : userAnswers[i] === q.correct;
            const userLetter = userAnswers[i] !== null ? String.fromCharCode(65 + userAnswers[i]) : '-';
            // Correct-letter column: show only when revealed (sr.correctShuffledIdx !== null),
            // fall back to local q.correct for offline path, dash when server withholds reveal.
            let correctLetter;
            if (sr) {
                correctLetter = sr.correctShuffledIdx !== null
                    ? String.fromCharCode(65 + sr.correctShuffledIdx)
                    : '-';
            } else {
                correctLetter = String.fromCharCode(65 + q.correct);
            }
            return `<tr class="${isCorrect ? 'wq-row-correct' : 'wq-row-incorrect'}" onclick="WSAQuiz.reviewQuestion(${i})" style="cursor:pointer">
                <td>${i + 1}</td>
                <td class="wq-review-q">${q.question.substring(0, 60)}${q.question.length > 60 ? '...' : ''}</td>
                <td>${userLetter}</td>
                <td>${correctLetter}</td>
                <td>${isCorrect ? '&#10003;' : '&#10007;'}</td>
            </tr>`;
        }).join('');

        results.innerHTML = `
            <div class="wq-results-header">
                <div class="wq-results-icon">${passed ? '\uD83C\uDFC6' : '\uD83D\uDCDA'}</div>
                <h2>${passed ? 'Congratulations!' : 'Keep Studying'}</h2>
                <div class="wq-score ${passed ? 'pass' : 'fail'}">${pct}%</div>
                <p class="wq-score-detail">${correct} of ${total} correct</p>
                <p class="wq-results-msg">${passed
                    ? 'You passed! Review your answers below or continue to the next module.'
                    : `You need 70% to pass. Review your answers below, study the explanations, and try again.`}</p>
            </div>
            <div class="wq-review-table-wrap">
                <table class="wq-review-table">
                    <thead><tr><th>#</th><th>Question</th><th>Yours</th><th>Correct</th><th>Result</th></tr></thead>
                    <tbody>${reviewRows}</tbody>
                </table>
            </div>
            <div class="wq-results-actions">
                <button class="wq-btn wq-btn-secondary" onclick="WSAQuiz.retake()">Retake Quiz</button>
                ${passed && config.nextModule ? `<a class="wq-btn wq-btn-primary" href="${config.nextModule}">Next Module &#8594;</a>` : ''}
            </div>
        `;

        document.getElementById('wqProgressFill').style.width = '100%';
        document.getElementById('wqProgressText').textContent = `Score: ${pct}% (${correct}/${total})`;
        renderQuestionMap();
    }

    function reviewQuestion(idx) {
        reviewMode = true;
        currentQuestion = idx;
        document.getElementById('wqResults').style.display = 'none';
        document.getElementById('wqBody').style.display = 'block';
        renderQuestion();
    }

    function retake() {
        // QC-8: Re-pool and re-shuffle on retake
        let pool = [...config.questions];
        for (let i = pool.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [pool[i], pool[j]] = [pool[j], pool[i]];
        }
        if (config.displayCount && pool.length > config.displayCount) {
            pool = pool.slice(0, config.displayCount);
        }
        shuffledQuestions = pool.map(q => shuffleQuestion(q));
        userAnswers = new Array(shuffledQuestions.length).fill(null);
        submitted = false;
        reviewMode = false;
        serverReview = null;   // clear server review data from previous attempt
        currentQuestion = 0;
        render();
        renderQuestion();
    }

    return { init, select, next, prev, goTo, reviewQuestion, retake };
})();
