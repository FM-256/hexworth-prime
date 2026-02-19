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
 *       questions: [ { question: '...', options: ['A','B','C','D'], correct: 1, explanation: '...' } ]
 *   });
 */
const WSAQuiz = (() => {
    let config = null;
    let shuffledQuestions = [];
    let currentQuestion = 0;
    let userAnswers = [];     // stores shuffled index per question
    let submitted = false;
    let reviewMode = false;

    function init(cfg) {
        config = cfg;
        shuffledQuestions = cfg.questions.map(q => shuffleQuestion(q));
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
                cls += userAnswers[i] === shuffledQuestions[i].correct ? ' correct' : ' incorrect';
            }
            return `<button class="${cls}" onclick="WSAQuiz.goTo(${i})" title="Question ${i + 1}">${i + 1}</button>`;
        }).join('');
    }

    function renderQuestion() {
        const q = shuffledQuestions[currentQuestion];
        const area = document.getElementById('wqQuestionArea');
        const isReview = submitted;

        const optionsHtml = q.options.map((opt, i) => {
            let cls = 'wq-option';
            if (userAnswers[currentQuestion] === i) cls += ' selected';
            if (isReview) {
                if (i === q.correct) cls += ' correct';
                else if (userAnswers[currentQuestion] === i && i !== q.correct) cls += ' incorrect';
                cls += ' disabled';
            }
            const letter = String.fromCharCode(65 + i);
            return `<div class="${cls}" ${!isReview ? `onclick="WSAQuiz.select(${i})"` : ''}>
                <span class="wq-option-letter">${letter}</span>
                <span class="wq-option-text">${opt}</span>
                ${isReview && i === q.correct ? '<span class="wq-check">&#10003;</span>' : ''}
                ${isReview && userAnswers[currentQuestion] === i && i !== q.correct ? '<span class="wq-cross">&#10007;</span>' : ''}
            </div>`;
        }).join('');

        area.innerHTML = `
            <div class="wq-question-card">
                <div class="wq-question-num">Question ${currentQuestion + 1} of ${shuffledQuestions.length}</div>
                <div class="wq-question-text">${q.question}</div>
                <div class="wq-options">${optionsHtml}</div>
                ${isReview ? `<div class="wq-explanation"><strong>${userAnswers[currentQuestion] === q.correct ? '&#10003; Correct' : '&#10007; Incorrect'}</strong><p>${q.explanation}</p></div>` : ''}
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
                showResults();
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

    function showResults() {
        let correct = 0;
        shuffledQuestions.forEach((q, i) => {
            if (userAnswers[i] === q.correct) correct++;
        });

        const total = shuffledQuestions.length;
        const pct = Math.round((correct / total) * 100);
        const passed = pct >= 70;

        // Track progress
        if (passed && typeof WSAProgress !== 'undefined') {
            WSAProgress.markQuizPassed(config.moduleId, pct);
        }

        // Hide question area, show results
        document.getElementById('wqBody').style.display = 'none';
        const results = document.getElementById('wqResults');
        results.style.display = 'block';

        // Build per-question review summary
        const reviewRows = shuffledQuestions.map((q, i) => {
            const isCorrect = userAnswers[i] === q.correct;
            const userLetter = userAnswers[i] !== null ? String.fromCharCode(65 + userAnswers[i]) : '-';
            const correctLetter = String.fromCharCode(65 + q.correct);
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
        shuffledQuestions = config.questions.map(q => shuffleQuestion(q));
        userAnswers = new Array(shuffledQuestions.length).fill(null);
        submitted = false;
        reviewMode = false;
        currentQuestion = 0;
        render();
        renderQuestion();
    }

    return { init, select, next, prev, goTo, reviewQuestion, retake };
})();
