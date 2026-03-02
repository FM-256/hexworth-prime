/**
 * ReviewEngine.js - Reusable Jeopardy-Style Review Component
 *
 * A solo self-assessment review board. Click cells, answer multiple choice
 * questions, earn points. Includes Daily Doubles and Final Jeopardy.
 *
 * Usage:
 *   ReviewEngine.init({
 *       containerId: 'review-root',
 *       title: 'Windows Server Review',
 *       storageKey: 'hexworth_review_wsa',
 *       houseId: 'cloud',
 *       categories: [
 *           {
 *               name: 'Active Directory',
 *               questions: [
 *                   { value: 100, question: '...', options: ['A','B','C','D'], correct: 0, explanation: '...' },
 *                   ...
 *               ]
 *           },
 *           ...
 *       ],
 *       onComplete: (results) => { ... }
 *   });
 *
 * @version 1.0.0
 */
window.ReviewEngine = (function () {
    'use strict';

    // ═══════════════════════════════════════════════════════════════
    // STATE
    // ═══════════════════════════════════════════════════════════════
    let config = null;
    let state = {
        score: 0,
        answered: {},       // { 'catIdx-qIdx': { correct: bool, value: int } }
        totalQuestions: 0,
        answeredCount: 0,
        dailyDoubles: [],   // ['catIdx-qIdx', ...]
        startTime: null,
        endTime: null,
        finalJeopardyDone: false,
        finalJeopardyCorrect: null
    };
    let currentCell = null; // { catIdx, qIdx }

    // ═══════════════════════════════════════════════════════════════
    // AUDIO (Web Audio API tones)
    // ═══════════════════════════════════════════════════════════════
    let audioCtx = null;

    function getAudioCtx() {
        if (!audioCtx) {
            try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); }
            catch (e) { return null; }
        }
        return audioCtx;
    }

    function playTone(freq, duration, type) {
        const ctx = getAudioCtx();
        if (!ctx) return;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = type || 'sine';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + duration);
    }

    function playCorrect() {
        playTone(523, 0.12, 'sine');
        setTimeout(() => playTone(659, 0.12, 'sine'), 100);
        setTimeout(() => playTone(784, 0.25, 'sine'), 200);
    }

    function playWrong() {
        playTone(200, 0.3, 'sawtooth');
        setTimeout(() => playTone(180, 0.4, 'sawtooth'), 200);
    }

    function playDailyDouble() {
        playTone(392, 0.1, 'square');
        setTimeout(() => playTone(494, 0.1, 'square'), 100);
        setTimeout(() => playTone(587, 0.1, 'square'), 200);
        setTimeout(() => playTone(784, 0.3, 'square'), 300);
    }

    function playBoardClear() {
        const notes = [523, 587, 659, 784, 880, 1047];
        notes.forEach((f, i) => setTimeout(() => playTone(f, 0.15, 'sine'), i * 80));
    }

    // ═══════════════════════════════════════════════════════════════
    // STORAGE
    // ═══════════════════════════════════════════════════════════════
    function saveState() {
        if (!config || !config.storageKey) return;
        try {
            localStorage.setItem(config.storageKey, JSON.stringify(state));
        } catch (e) { /* quota */ }
    }

    function loadState() {
        if (!config || !config.storageKey) return false;
        try {
            const raw = localStorage.getItem(config.storageKey);
            if (raw) {
                const saved = JSON.parse(raw);
                Object.assign(state, saved);
                return true;
            }
        } catch (e) { /* corrupted */ }
        return false;
    }

    function clearState() {
        if (config && config.storageKey) {
            localStorage.removeItem(config.storageKey);
        }
    }

    // ═══════════════════════════════════════════════════════════════
    // DAILY DOUBLES
    // ═══════════════════════════════════════════════════════════════
    function pickDailyDoubles() {
        const total = config.categories.length * 5;
        const count = total >= 20 ? 2 : 1;
        const keys = [];
        const all = [];
        config.categories.forEach((cat, ci) => {
            cat.questions.forEach((q, qi) => {
                if (qi >= 1) all.push(ci + '-' + qi); // not 100-point questions
            });
        });
        // Fisher-Yates on candidates
        for (let i = all.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            const tmp = all[i]; all[i] = all[j]; all[j] = tmp;
        }
        for (let i = 0; i < count && i < all.length; i++) {
            keys.push(all[i]);
        }
        return keys;
    }

    function isDailyDouble(catIdx, qIdx) {
        return state.dailyDoubles.indexOf(catIdx + '-' + qIdx) !== -1;
    }

    // ═══════════════════════════════════════════════════════════════
    // RENDER
    // ═══════════════════════════════════════════════════════════════
    function getContainer() {
        return document.getElementById(config.containerId || 'review-root');
    }

    function render() {
        const root = getContainer();
        if (!root) return;

        const answeredCount = Object.keys(state.answered).length;
        const totalQ = config.categories.length * 5;
        const pct = totalQ > 0 ? Math.round((answeredCount / totalQ) * 100) : 0;

        let elapsed = '';
        if (state.startTime) {
            const ms = (state.endTime || Date.now()) - state.startTime;
            const mins = Math.floor(ms / 60000);
            const secs = Math.floor((ms % 60000) / 1000);
            elapsed = mins + ':' + (secs < 10 ? '0' : '') + secs;
        }

        root.innerHTML = '';

        // Score bar
        const scoreBar = el('div', 'review-scorebar');
        scoreBar.innerHTML =
            '<div class="review-score-block">' +
                '<div class="review-score-label">SCORE</div>' +
                '<div class="review-score-value" id="reviewScoreVal">' + state.score + '</div>' +
            '</div>' +
            '<div class="review-score-block">' +
                '<div class="review-score-label">PROGRESS</div>' +
                '<div class="review-score-value review-score-small">' + answeredCount + '/' + totalQ + ' (' + pct + '%)</div>' +
            '</div>' +
            (elapsed ? '<div class="review-score-block"><div class="review-score-label">TIME</div><div class="review-score-value review-score-small">' + elapsed + '</div></div>' : '');
        root.appendChild(scoreBar);

        // Board grid
        const board = el('div', 'review-board');
        board.style.gridTemplateColumns = 'repeat(' + config.categories.length + ', 1fr)';

        // Headers
        config.categories.forEach(function (cat) {
            const header = el('div', 'review-cat-header');
            header.textContent = cat.name;
            board.appendChild(header);
        });

        // Rows (5 point tiers)
        var pointValues = [100, 200, 300, 400, 500];
        for (var row = 0; row < 5; row++) {
            config.categories.forEach(function (cat, ci) {
                var qi = row;
                var key = ci + '-' + qi;
                var cell = el('div', 'review-cell');

                if (state.answered[key]) {
                    cell.classList.add('review-cell-done');
                    cell.classList.add(state.answered[key].correct ? 'review-cell-correct' : 'review-cell-wrong');
                    cell.innerHTML = state.answered[key].correct ? '&#10003;' : '&#10007;';
                } else {
                    cell.textContent = '$' + pointValues[row];
                    cell.classList.add('review-cell-active');
                    cell.addEventListener('click', (function (catIdx, qIdx) {
                        return function () { openQuestion(catIdx, qIdx); };
                    })(ci, qi));
                }
                board.appendChild(cell);
            });
        }
        root.appendChild(board);

        // Controls
        var controls = el('div', 'review-controls');
        var resetBtn = el('button', 'review-reset-btn');
        resetBtn.textContent = 'Reset Board';
        resetBtn.addEventListener('click', resetGame);
        controls.appendChild(resetBtn);
        root.appendChild(controls);

        // Check if board is cleared
        if (answeredCount >= totalQ && !state.finalJeopardyDone) {
            showFinalJeopardy();
        } else if (answeredCount >= totalQ && state.finalJeopardyDone) {
            showResults();
        }
    }

    function el(tag, cls) {
        var e = document.createElement(tag);
        if (cls) e.className = cls;
        return e;
    }

    // ═══════════════════════════════════════════════════════════════
    // QUESTION MODAL
    // ═══════════════════════════════════════════════════════════════
    function openQuestion(catIdx, qIdx) {
        var cat = config.categories[catIdx];
        var q = cat.questions[qIdx];
        currentCell = { catIdx: catIdx, qIdx: qIdx };
        var isDD = isDailyDouble(catIdx, qIdx);

        if (isDD) playDailyDouble();

        // Create overlay
        var overlay = el('div', 'review-modal-overlay');
        overlay.id = 'reviewModal';

        var modal = el('div', 'review-modal');

        // Daily Double banner
        if (isDD) {
            var ddBanner = el('div', 'review-dd-banner');
            ddBanner.innerHTML = '<img src="/assets/images/icons/icon-star.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle;display:inline-block;object-fit:contain"> DAILY DOUBLE <img src="/assets/images/icons/icon-star.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle;display:inline-block;object-fit:contain">';
            modal.appendChild(ddBanner);
        }

        // Points & category
        var pointsDiv = el('div', 'review-modal-points');
        pointsDiv.textContent = '$' + q.value + (isDD ? ' (x2)' : '');
        modal.appendChild(pointsDiv);

        var catDiv = el('div', 'review-modal-category');
        catDiv.textContent = cat.name;
        modal.appendChild(catDiv);

        // Question
        var questionDiv = el('div', 'review-modal-question');
        questionDiv.textContent = q.question;
        modal.appendChild(questionDiv);

        // Options
        var optionsDiv = el('div', 'review-modal-options');
        var labels = ['A', 'B', 'C', 'D'];
        q.options.forEach(function (opt, idx) {
            var btn = el('button', 'review-option-btn');
            btn.innerHTML = '<span class="review-option-letter">' + labels[idx] + '</span><span class="review-option-text">' + escHtml(opt) + '</span>';
            btn.addEventListener('click', function () {
                answerQuestion(catIdx, qIdx, idx, isDD);
            });
            optionsDiv.appendChild(btn);
        });
        modal.appendChild(optionsDiv);

        overlay.appendChild(modal);
        document.body.appendChild(overlay);

        // Animate in
        requestAnimationFrame(function () {
            overlay.classList.add('review-modal-active');
        });

        // Escape key
        overlay._escHandler = function (e) {
            if (e.key === 'Escape') closeModal();
        };
        document.addEventListener('keydown', overlay._escHandler);
    }

    function answerQuestion(catIdx, qIdx, chosenIdx, isDD) {
        var cat = config.categories[catIdx];
        var q = cat.questions[qIdx];
        var correct = (chosenIdx === q.correct);
        var multiplier = isDD ? 2 : 1;
        var pointsEarned = correct ? q.value * multiplier : -Math.floor(q.value / 2);

        state.score += pointsEarned;
        state.answered[catIdx + '-' + qIdx] = { correct: correct, value: pointsEarned, chosen: chosenIdx };
        saveState();

        if (correct) playCorrect(); else playWrong();

        // Show feedback in modal
        showFeedback(cat, q, chosenIdx, correct, pointsEarned);
    }

    function showFeedback(cat, q, chosenIdx, correct, pointsEarned) {
        var modal = document.querySelector('.review-modal');
        if (!modal) return;

        // Disable option buttons
        var btns = modal.querySelectorAll('.review-option-btn');
        btns.forEach(function (btn, idx) {
            btn.disabled = true;
            btn.classList.add('review-option-disabled');
            if (idx === q.correct) btn.classList.add('review-option-correct');
            if (idx === chosenIdx && !correct) btn.classList.add('review-option-wrong');
        });

        // Result banner
        var result = el('div', correct ? 'review-feedback-correct' : 'review-feedback-wrong');
        result.innerHTML =
            '<div class="review-feedback-title">' + (correct ? 'CORRECT!' : 'INCORRECT') + '</div>' +
            '<div class="review-feedback-points">' + (pointsEarned > 0 ? '+' : '') + pointsEarned + ' points</div>' +
            '<div class="review-feedback-explain">' + escHtml(q.explanation) + '</div>';
        modal.appendChild(result);

        // Continue button
        var continueBtn = el('button', 'review-continue-btn');
        continueBtn.textContent = 'Continue';
        continueBtn.addEventListener('click', function () {
            closeModal();
            render();
        });
        modal.appendChild(continueBtn);
    }

    function closeModal() {
        var overlay = document.getElementById('reviewModal');
        if (overlay) {
            if (overlay._escHandler) {
                document.removeEventListener('keydown', overlay._escHandler);
            }
            overlay.classList.remove('review-modal-active');
            setTimeout(function () {
                if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
            }, 250);
        }
        currentCell = null;
    }

    // ═══════════════════════════════════════════════════════════════
    // FINAL JEOPARDY
    // ═══════════════════════════════════════════════════════════════
    function showFinalJeopardy() {
        playBoardClear();

        var fj = config.finalJeopardy;
        if (!fj) {
            state.finalJeopardyDone = true;
            state.endTime = Date.now();
            saveState();
            showResults();
            return;
        }

        var overlay = el('div', 'review-modal-overlay');
        overlay.id = 'reviewModal';

        var modal = el('div', 'review-modal');

        var title = el('div', 'review-fj-title');
        title.innerHTML = '<img src="/assets/images/icons/icon-star.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle;display:inline-block;object-fit:contain"> FINAL JEOPARDY <img src="/assets/images/icons/icon-star.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle;display:inline-block;object-fit:contain">';
        modal.appendChild(title);

        var subtitle = el('div', 'review-modal-category');
        subtitle.textContent = fj.category || 'Final Round';
        modal.appendChild(subtitle);

        var wagerInfo = el('div', 'review-fj-wager');
        wagerInfo.textContent = 'Wager up to your current score: $' + Math.max(state.score, 0);
        modal.appendChild(wagerInfo);

        var questionDiv = el('div', 'review-modal-question');
        questionDiv.textContent = fj.question;
        modal.appendChild(questionDiv);

        var optionsDiv = el('div', 'review-modal-options');
        var labels = ['A', 'B', 'C', 'D'];
        fj.options.forEach(function (opt, idx) {
            var btn = el('button', 'review-option-btn');
            btn.innerHTML = '<span class="review-option-letter">' + labels[idx] + '</span><span class="review-option-text">' + escHtml(opt) + '</span>';
            btn.addEventListener('click', function () {
                answerFinalJeopardy(idx);
            });
            optionsDiv.appendChild(btn);
        });
        modal.appendChild(optionsDiv);

        overlay.appendChild(modal);
        document.body.appendChild(overlay);
        requestAnimationFrame(function () { overlay.classList.add('review-modal-active'); });

        overlay._escHandler = function (e) { if (e.key === 'Escape') return; }; // no escape during final
        document.addEventListener('keydown', overlay._escHandler);
    }

    function answerFinalJeopardy(chosenIdx) {
        var fj = config.finalJeopardy;
        var correct = (chosenIdx === fj.correct);
        var wager = Math.max(state.score, 0);
        var pointsEarned = correct ? wager : -wager;

        state.score += pointsEarned;
        state.finalJeopardyDone = true;
        state.finalJeopardyCorrect = correct;
        state.endTime = Date.now();
        saveState();

        if (correct) playCorrect(); else playWrong();

        // Show feedback
        var modal = document.querySelector('.review-modal');
        if (!modal) return;

        var btns = modal.querySelectorAll('.review-option-btn');
        btns.forEach(function (btn, idx) {
            btn.disabled = true;
            btn.classList.add('review-option-disabled');
            if (idx === fj.correct) btn.classList.add('review-option-correct');
            if (idx === chosenIdx && !correct) btn.classList.add('review-option-wrong');
        });

        var result = el('div', correct ? 'review-feedback-correct' : 'review-feedback-wrong');
        result.innerHTML =
            '<div class="review-feedback-title">' + (correct ? 'CORRECT!' : 'INCORRECT') + '</div>' +
            '<div class="review-feedback-points">' + (pointsEarned > 0 ? '+' : '') + pointsEarned + ' points</div>' +
            '<div class="review-feedback-explain">' + escHtml(fj.explanation) + '</div>';
        modal.appendChild(result);

        var continueBtn = el('button', 'review-continue-btn');
        continueBtn.textContent = 'See Final Results';
        continueBtn.addEventListener('click', function () {
            closeModal();
            render();
        });
        modal.appendChild(continueBtn);
    }

    // ═══════════════════════════════════════════════════════════════
    // RESULTS SCREEN
    // ═══════════════════════════════════════════════════════════════
    function showResults() {
        var root = getContainer();
        if (!root) return;

        var totalQ = config.categories.length * 5;
        var correctCount = 0;
        Object.keys(state.answered).forEach(function (k) {
            if (state.answered[k].correct) correctCount++;
        });
        if (state.finalJeopardyCorrect) correctCount++;
        var totalWithFJ = config.finalJeopardy ? totalQ + 1 : totalQ;
        var pct = Math.round((correctCount / totalWithFJ) * 100);

        var elapsed = '';
        if (state.startTime && state.endTime) {
            var ms = state.endTime - state.startTime;
            var mins = Math.floor(ms / 60000);
            var secs = Math.floor((ms % 60000) / 1000);
            elapsed = mins + ':' + (secs < 10 ? '0' : '') + secs;
        }

        var grade = pct >= 90 ? 'S' : pct >= 80 ? 'A' : pct >= 70 ? 'B' : pct >= 60 ? 'C' : 'D';
        var gradeColor = grade === 'S' ? '#fbbf24' : grade === 'A' ? '#22c55e' : grade === 'B' ? '#3b82f6' : grade === 'C' ? '#f97316' : '#ef4444';

        // Build results panel
        var results = el('div', 'review-results');
        results.innerHTML =
            '<div class="review-results-header">REVIEW COMPLETE</div>' +
            '<div class="review-results-grade" style="color:' + gradeColor + '">' + grade + '</div>' +
            '<div class="review-results-score">Final Score: $' + state.score + '</div>' +
            '<div class="review-results-stats">' +
                '<div class="review-stat"><span class="review-stat-val">' + correctCount + '/' + totalWithFJ + '</span><span class="review-stat-label">Correct</span></div>' +
                '<div class="review-stat"><span class="review-stat-val">' + pct + '%</span><span class="review-stat-label">Accuracy</span></div>' +
                (elapsed ? '<div class="review-stat"><span class="review-stat-val">' + elapsed + '</span><span class="review-stat-label">Time</span></div>' : '') +
            '</div>' +
            '<div class="review-results-breakdown"></div>';

        root.appendChild(results);

        // Category breakdown
        var breakdown = results.querySelector('.review-results-breakdown');
        config.categories.forEach(function (cat, ci) {
            var catCorrect = 0;
            for (var qi = 0; qi < 5; qi++) {
                var k = ci + '-' + qi;
                if (state.answered[k] && state.answered[k].correct) catCorrect++;
            }
            var bar = el('div', 'review-breakdown-row');
            bar.innerHTML =
                '<span class="review-breakdown-name">' + escHtml(cat.name) + '</span>' +
                '<span class="review-breakdown-bar"><span class="review-breakdown-fill" style="width:' + (catCorrect * 20) + '%;background:' + (catCorrect >= 4 ? '#22c55e' : catCorrect >= 3 ? '#3b82f6' : catCorrect >= 2 ? '#f97316' : '#ef4444') + '"></span></span>' +
                '<span class="review-breakdown-count">' + catCorrect + '/5</span>';
            breakdown.appendChild(bar);
        });

        // Buttons
        var btns = el('div', 'review-results-actions');
        var retryBtn = el('button', 'review-retry-btn');
        retryBtn.textContent = 'Try Again';
        retryBtn.addEventListener('click', resetGame);
        btns.appendChild(retryBtn);

        var reviewBtn = el('button', 'review-missed-btn');
        reviewBtn.textContent = 'Review Missed Questions';
        reviewBtn.addEventListener('click', showMissedQuestions);
        btns.appendChild(reviewBtn);
        results.appendChild(btns);

        // Fire completion callback
        if (config.onComplete) {
            config.onComplete({
                score: state.score,
                correct: correctCount,
                total: totalWithFJ,
                accuracy: pct,
                grade: grade,
                elapsed: elapsed
            });
        }

        // Achievement integration
        try {
            if (typeof AchievementManager !== 'undefined' && config.achievementId) {
                AchievementManager.unlock(config.achievementId);
            }
            if (typeof AchievementRegistry !== 'undefined' && config.achievementId) {
                AchievementRegistry.unlock(config.achievementId);
            }
        } catch (e) { /* no achievement system */ }

        // Save progress
        try {
            var progress = JSON.parse(localStorage.getItem('hexworth_progress') || '{}');
            var hid = config.houseId || 'general';
            if (!progress[hid]) progress[hid] = {};
            progress[hid][config.storageKey] = {
                completed: true,
                score: state.score,
                accuracy: pct,
                grade: grade,
                timestamp: Date.now()
            };
            localStorage.setItem('hexworth_progress', JSON.stringify(progress));
        } catch (e) { /* storage full */ }
    }

    function showMissedQuestions() {
        var root = getContainer();
        if (!root) return;

        var missed = [];
        config.categories.forEach(function (cat, ci) {
            cat.questions.forEach(function (q, qi) {
                var k = ci + '-' + qi;
                if (state.answered[k] && !state.answered[k].correct) {
                    missed.push({ category: cat.name, q: q, chosen: state.answered[k].chosen });
                }
            });
        });

        if (config.finalJeopardy && state.finalJeopardyCorrect === false) {
            missed.push({ category: 'Final Jeopardy', q: config.finalJeopardy, chosen: -1 });
        }

        if (missed.length === 0) {
            alert('Perfect score - no missed questions!');
            return;
        }

        var overlay = el('div', 'review-modal-overlay');
        overlay.id = 'reviewModal';

        var modal = el('div', 'review-modal review-missed-modal');
        var title = el('div', 'review-fj-title');
        title.textContent = 'Missed Questions (' + missed.length + ')';
        modal.appendChild(title);

        var list = el('div', 'review-missed-list');
        var labels = ['A', 'B', 'C', 'D'];
        missed.forEach(function (item) {
            var card = el('div', 'review-missed-card');
            card.innerHTML =
                '<div class="review-missed-cat">' + escHtml(item.category) + '</div>' +
                '<div class="review-missed-q">' + escHtml(item.q.question) + '</div>' +
                '<div class="review-missed-correct">Correct: ' + labels[item.q.correct] + ') ' + escHtml(item.q.options[item.q.correct]) + '</div>' +
                '<div class="review-missed-explain">' + escHtml(item.q.explanation) + '</div>';
            list.appendChild(card);
        });
        modal.appendChild(list);

        var closeBtn = el('button', 'review-continue-btn');
        closeBtn.textContent = 'Close';
        closeBtn.addEventListener('click', closeModal);
        modal.appendChild(closeBtn);

        overlay.appendChild(modal);
        document.body.appendChild(overlay);
        requestAnimationFrame(function () { overlay.classList.add('review-modal-active'); });
        overlay._escHandler = function (e) { if (e.key === 'Escape') closeModal(); };
        document.addEventListener('keydown', overlay._escHandler);
    }

    // ═══════════════════════════════════════════════════════════════
    // RESET
    // ═══════════════════════════════════════════════════════════════
    function resetGame() {
        if (!confirm('Reset all progress? Your score and answers will be cleared.')) return;
        closeModal();
        state = {
            score: 0,
            answered: {},
            totalQuestions: config.categories.length * 5,
            answeredCount: 0,
            dailyDoubles: pickDailyDoubles(),
            startTime: Date.now(),
            endTime: null,
            finalJeopardyDone: false,
            finalJeopardyCorrect: null
        };
        saveState();
        render();
    }

    // ═══════════════════════════════════════════════════════════════
    // UTILITY
    // ═══════════════════════════════════════════════════════════════
    function escHtml(str) {
        if (!str) return '';
        return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    // ═══════════════════════════════════════════════════════════════
    // STYLES (injected once)
    // ═══════════════════════════════════════════════════════════════
    var stylesInjected = false;

    function injectStyles() {
        if (stylesInjected) return;
        stylesInjected = true;

        var css = document.createElement('style');
        css.id = 'review-engine-styles';
        css.textContent = [
            /* Score bar */
            '.review-scorebar{display:flex;justify-content:center;gap:24px;flex-wrap:wrap;margin-bottom:20px}',
            '.review-score-block{background:rgba(15,23,42,0.8);border:1px solid rgba(56,189,248,0.2);border-radius:12px;padding:14px 28px;text-align:center;min-width:130px}',
            '.review-score-label{color:#94a3b8;font-size:0.7rem;letter-spacing:0.15em;text-transform:uppercase;margin-bottom:4px}',
            '.review-score-value{font-size:2rem;font-weight:800;color:#38bdf8;font-family:"Courier New",monospace}',
            '.review-score-small{font-size:1.1rem}',

            /* Board */
            '.review-board{display:grid;gap:10px;margin-bottom:20px}',
            '.review-cat-header{background:linear-gradient(180deg,rgba(56,189,248,0.15),rgba(14,165,233,0.08));border:1px solid rgba(56,189,248,0.25);border-radius:10px;padding:14px 8px;text-align:center;font-weight:700;font-size:0.82rem;color:#38bdf8;min-height:64px;display:flex;align-items:center;justify-content:center;line-height:1.3}',
            '.review-cell{border-radius:10px;padding:18px 10px;text-align:center;font-weight:800;font-size:1.35rem;min-height:72px;display:flex;align-items:center;justify-content:center;transition:all 0.25s ease;user-select:none}',
            '.review-cell-active{background:linear-gradient(180deg,#1e3a8a,#1e40af);border:2px solid #3b82f6;color:#fbbf24;cursor:pointer}',
            '.review-cell-active:hover{transform:scale(1.06);box-shadow:0 0 24px rgba(59,130,246,0.5)}',
            '.review-cell-done{border:2px solid rgba(255,255,255,0.08);font-size:1.4rem;cursor:default}',
            '.review-cell-correct{background:rgba(34,197,94,0.15);color:#22c55e;border-color:rgba(34,197,94,0.25)}',
            '.review-cell-wrong{background:rgba(239,68,68,0.15);color:#ef4444;border-color:rgba(239,68,68,0.25)}',

            /* Controls */
            '.review-controls{text-align:center;margin:16px 0 30px}',
            '.review-reset-btn{padding:10px 22px;background:rgba(239,68,68,0.15);border:1px solid #ef4444;border-radius:8px;color:#ef4444;cursor:pointer;font-weight:600;font-size:0.9rem;transition:all 0.2s}',
            '.review-reset-btn:hover{background:rgba(239,68,68,0.25)}',

            /* Modal overlay */
            '.review-modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.92);z-index:10000;display:flex;align-items:center;justify-content:center;padding:20px;opacity:0;transition:opacity 0.25s ease}',
            '.review-modal-active{opacity:1}',

            /* Modal */
            '.review-modal{background:linear-gradient(180deg,#0f1729 0%,#1e293b 100%);border:2px solid #3b82f6;border-radius:20px;padding:36px 32px;max-width:700px;width:100%;text-align:center;transform:scale(0.92);transition:transform 0.25s ease;max-height:90vh;overflow-y:auto}',
            '.review-modal-active .review-modal{transform:scale(1)}',
            '.review-missed-modal{max-width:800px;text-align:left}',
            '.review-modal-points{font-size:2.8rem;font-weight:800;color:#fbbf24;margin-bottom:12px;font-family:"Courier New",monospace}',
            '.review-modal-category{color:#38bdf8;font-size:0.85rem;text-transform:uppercase;letter-spacing:0.12em;margin-bottom:16px}',
            '.review-modal-question{font-size:1.2rem;color:#f1f5f9;margin-bottom:28px;line-height:1.6}',

            /* Options */
            '.review-modal-options{display:flex;flex-direction:column;gap:10px;margin-bottom:8px}',
            '.review-option-btn{display:flex;align-items:center;gap:14px;background:rgba(30,41,59,0.8);border:1px solid rgba(148,163,184,0.2);border-radius:12px;padding:14px 18px;color:#e2e8f0;cursor:pointer;font-size:1rem;text-align:left;transition:all 0.2s;width:100%}',
            '.review-option-btn:hover:not(:disabled){background:rgba(56,189,248,0.1);border-color:#38bdf8;transform:translateX(4px)}',
            '.review-option-letter{flex-shrink:0;width:32px;height:32px;border-radius:8px;background:rgba(56,189,248,0.15);color:#38bdf8;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:0.9rem}',
            '.review-option-text{flex:1;line-height:1.4}',
            '.review-option-disabled{cursor:default;opacity:0.7}',
            '.review-option-disabled:hover{transform:none;background:rgba(30,41,59,0.8);border-color:rgba(148,163,184,0.2)}',
            '.review-option-correct{border-color:#22c55e !important;background:rgba(34,197,94,0.15) !important;opacity:1 !important}',
            '.review-option-correct .review-option-letter{background:#22c55e;color:#fff}',
            '.review-option-wrong{border-color:#ef4444 !important;background:rgba(239,68,68,0.15) !important;opacity:1 !important}',
            '.review-option-wrong .review-option-letter{background:#ef4444;color:#fff}',

            /* Feedback */
            '.review-feedback-correct,.review-feedback-wrong{border-radius:12px;padding:18px;margin-top:18px;text-align:center}',
            '.review-feedback-correct{background:rgba(34,197,94,0.1);border:1px solid rgba(34,197,94,0.3)}',
            '.review-feedback-wrong{background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.3)}',
            '.review-feedback-title{font-size:1.3rem;font-weight:800;margin-bottom:6px}',
            '.review-feedback-correct .review-feedback-title{color:#22c55e}',
            '.review-feedback-wrong .review-feedback-title{color:#ef4444}',
            '.review-feedback-points{font-size:1.1rem;font-weight:700;color:#fbbf24;margin-bottom:10px;font-family:"Courier New",monospace}',
            '.review-feedback-explain{color:#94a3b8;font-size:0.92rem;line-height:1.5}',

            /* Continue button */
            '.review-continue-btn{display:block;margin:18px auto 0;padding:12px 36px;background:linear-gradient(135deg,#3b82f6,#2563eb);border:none;border-radius:10px;color:#fff;font-weight:700;font-size:1rem;cursor:pointer;transition:all 0.2s}',
            '.review-continue-btn:hover{filter:brightness(1.15);transform:translateY(-2px)}',

            /* Daily Double */
            '.review-dd-banner{background:linear-gradient(135deg,#fbbf24,#f59e0b);color:#0f172a;font-weight:800;font-size:1.4rem;padding:12px;border-radius:10px;margin-bottom:16px;letter-spacing:0.1em;animation:reviewPulse 0.6s ease 2}',
            '@keyframes reviewPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.04)}}',

            /* Final Jeopardy */
            '.review-fj-title{font-size:1.8rem;font-weight:800;color:#fbbf24;margin-bottom:16px;letter-spacing:0.08em}',
            '.review-fj-wager{color:#94a3b8;font-size:0.9rem;margin-bottom:20px}',

            /* Results */
            '.review-results{background:rgba(15,23,42,0.9);border:2px solid rgba(56,189,248,0.3);border-radius:16px;padding:32px;text-align:center;max-width:700px;margin:0 auto}',
            '.review-results-header{font-size:0.85rem;letter-spacing:0.2em;color:#38bdf8;margin-bottom:12px;text-transform:uppercase}',
            '.review-results-grade{font-size:5rem;font-weight:900;margin-bottom:8px;font-family:"Courier New",monospace}',
            '.review-results-score{font-size:1.6rem;font-weight:700;color:#fbbf24;margin-bottom:24px;font-family:"Courier New",monospace}',
            '.review-results-stats{display:flex;justify-content:center;gap:32px;flex-wrap:wrap;margin-bottom:28px}',
            '.review-stat{text-align:center}',
            '.review-stat-val{display:block;font-size:1.4rem;font-weight:700;color:#e2e8f0}',
            '.review-stat-label{font-size:0.75rem;color:#64748b;text-transform:uppercase;letter-spacing:0.1em}',

            /* Breakdown */
            '.review-results-breakdown{margin-bottom:24px}',
            '.review-breakdown-row{display:flex;align-items:center;gap:12px;margin-bottom:8px}',
            '.review-breakdown-name{flex:0 0 160px;text-align:right;color:#94a3b8;font-size:0.85rem;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
            '.review-breakdown-bar{flex:1;height:10px;background:rgba(255,255,255,0.08);border-radius:5px;overflow:hidden}',
            '.review-breakdown-fill{height:100%;border-radius:5px;transition:width 0.5s ease}',
            '.review-breakdown-count{flex:0 0 36px;color:#64748b;font-size:0.8rem;text-align:left}',

            /* Result actions */
            '.review-results-actions{display:flex;gap:12px;justify-content:center;flex-wrap:wrap}',
            '.review-retry-btn{padding:12px 28px;background:linear-gradient(135deg,#3b82f6,#2563eb);border:none;border-radius:10px;color:#fff;font-weight:700;cursor:pointer;font-size:0.95rem;transition:all 0.2s}',
            '.review-retry-btn:hover{filter:brightness(1.15);transform:translateY(-2px)}',
            '.review-missed-btn{padding:12px 28px;background:rgba(248,113,113,0.15);border:1px solid #f87171;border-radius:10px;color:#f87171;font-weight:700;cursor:pointer;font-size:0.95rem;transition:all 0.2s}',
            '.review-missed-btn:hover{background:rgba(248,113,113,0.25)}',

            /* Missed questions */
            '.review-missed-list{max-height:60vh;overflow-y:auto;margin-bottom:16px}',
            '.review-missed-card{background:rgba(30,41,59,0.6);border:1px solid rgba(239,68,68,0.2);border-radius:10px;padding:16px;margin-bottom:10px}',
            '.review-missed-cat{color:#38bdf8;font-size:0.75rem;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:6px}',
            '.review-missed-q{color:#e2e8f0;font-size:1rem;margin-bottom:10px;line-height:1.5}',
            '.review-missed-correct{color:#22c55e;font-weight:600;margin-bottom:6px;font-size:0.95rem}',
            '.review-missed-explain{color:#94a3b8;font-size:0.85rem;line-height:1.5}',

            /* Responsive */
            '@media(max-width:768px){.review-board{gap:6px}.review-cat-header{font-size:0.7rem;padding:10px 4px;min-height:52px}.review-cell{font-size:1rem;padding:12px 4px;min-height:56px}.review-breakdown-name{flex:0 0 100px;font-size:0.75rem}.review-modal{padding:24px 18px}.review-modal-question{font-size:1.05rem}}'
        ].join('\n');
        document.head.appendChild(css);
    }

    // ═══════════════════════════════════════════════════════════════
    // PUBLIC API
    // ═══════════════════════════════════════════════════════════════
    function init(cfg) {
        config = cfg;
        config.containerId = config.containerId || 'review-root';

        injectStyles();

        var hadState = loadState();
        if (!hadState) {
            state.dailyDoubles = pickDailyDoubles();
            state.startTime = Date.now();
            state.totalQuestions = config.categories.length * 5;
        }

        render();
    }

    return {
        init: init,
        getScore: function () { return state.score; },
        getProgress: function () {
            var total = config ? config.categories.length * 5 : 0;
            var answered = Object.keys(state.answered).length;
            return { answered: answered, total: total, pct: total > 0 ? Math.round((answered / total) * 100) : 0 };
        },
        reset: resetGame
    };
})();
