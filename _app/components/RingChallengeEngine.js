/**
 * OASIS Ring Challenge Engine
 * Shared UI engine for 60-second rapid-fire ring challenges
 */

const RingChallengeEngine = (function() {
    'use strict';

    // Engine state
    let config = null;
    let state = {
        phase: 'idle', // idle, countdown, playing, complete
        questions: [],
        currentIndex: 0,
        score: 0,
        streak: 0,
        bestStreak: 0,
        correct: 0,
        total: 0,
        startTime: null,
        timeLeft: 60,
        questionTimes: [],
        timer: null,
        countdownPhase: 0
    };

    let elements = {
        container: null,
        preChallenge: null,
        countdown: null,
        challenge: null,
        postChallenge: null
    };

    /**
     * Initialize the challenge engine
     * @param {Object} cfg - Configuration object
     */
    function init(cfg) {
        config = {
            containerId: cfg.containerId || 'challenge-container',
            ringId: cfg.ringId,
            questions: cfg.questions || [],
            onComplete: cfg.onComplete || function() {},
            houseColor: cfg.houseColor || '#8b5cf6'
        };

        elements.container = document.getElementById(config.containerId);
        if (!elements.container) {
            console.error('Challenge container not found:', config.containerId);
            return;
        }

        reset();
        renderPreChallenge();
    }

    /**
     * Reset engine state
     */
    function reset() {
        state = {
            phase: 'idle',
            questions: shuffleAndPick(config.questions, 20),
            currentIndex: 0,
            score: 0,
            streak: 0,
            bestStreak: 0,
            correct: 0,
            total: 0,
            startTime: null,
            timeLeft: 60,
            questionTimes: [],
            timer: null,
            countdownPhase: 0
        };
    }

    /**
     * Shuffle array and pick n items
     */
    function shuffleAndPick(arr, n) {
        const shuffled = [...arr].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, Math.min(n, shuffled.length));
    }

    /**
     * Start the challenge (after countdown)
     */
    function start() {
        if (state.phase !== 'idle') return;
        state.phase = 'countdown';
        renderCountdown();
        startCountdown();
    }

    /**
     * Start countdown sequence (3-2-1-GO)
     */
    function startCountdown() {
        state.countdownPhase = 3;
        updateCountdownDisplay();

        const countdownInterval = setInterval(() => {
            state.countdownPhase--;
            if (state.countdownPhase > 0) {
                updateCountdownDisplay();
            } else {
                clearInterval(countdownInterval);
                beginChallenge();
            }
        }, 1000);
    }

    /**
     * Update countdown display
     */
    function updateCountdownDisplay() {
        const countdownEl = document.getElementById('countdown-number');
        if (!countdownEl) return;

        const colors = { 3: '#ef4444', 2: '#f59e0b', 1: '#22c55e' };
        const labels = { 3: 'RED', 2: 'YELLOW', 1: 'GREEN' };

        countdownEl.textContent = state.countdownPhase;
        countdownEl.style.color = colors[state.countdownPhase];

        const labelEl = document.getElementById('countdown-label');
        if (labelEl) {
            labelEl.textContent = labels[state.countdownPhase];
            labelEl.style.color = colors[state.countdownPhase];
        }
    }

    /**
     * Begin the actual challenge
     */
    function beginChallenge() {
        state.phase = 'playing';
        state.startTime = Date.now();
        renderChallenge();
        showQuestion();
        startTimer();
    }

    /**
     * Start 60-second timer
     */
    function startTimer() {
        const timerBar = document.getElementById('timer-bar');
        const timerText = document.getElementById('timer-text');

        state.timer = setInterval(() => {
            const elapsed = (Date.now() - state.startTime) / 1000;
            state.timeLeft = Math.max(0, 60 - elapsed);

            if (timerBar) {
                const percent = (state.timeLeft / 60) * 100;
                timerBar.style.width = percent + '%';

                // Color changes: green -> yellow -> red
                if (percent > 50) {
                    timerBar.style.background = '#22c55e';
                } else if (percent > 20) {
                    timerBar.style.background = '#f59e0b';
                } else {
                    timerBar.style.background = '#ef4444';
                }
            }

            if (timerText) {
                timerText.textContent = Math.ceil(state.timeLeft) + 's';
            }

            if (state.timeLeft <= 0) {
                endChallenge();
            }
        }, 50);
    }

    /**
     * Show current question
     */
    function showQuestion() {
        if (state.currentIndex >= state.questions.length) {
            // Perfect run - answered all questions before time expired
            state.score += 500;
            endChallenge(true);
            return;
        }

        const q = state.questions[state.currentIndex];
        const questionEl = document.getElementById('question-text');
        const answerContainer = document.getElementById('answer-buttons');

        if (questionEl) {
            questionEl.textContent = q.q;
            questionEl.style.animation = 'slideIn 0.25s ease-out';
        }

        if (answerContainer) {
            answerContainer.innerHTML = '';
            // Shuffle answers so correct isn't always first
            const indices = q.a.map((_, i) => i);
            for (let i = indices.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [indices[i], indices[j]] = [indices[j], indices[i]];
            }
            q._shuffledCorrect = indices.indexOf(q.correct);
            indices.forEach((origIdx, displayIdx) => {
                const btn = document.createElement('button');
                btn.className = 'answer-btn';
                btn.textContent = `${displayIdx + 1}. ${q.a[origIdx]}`;
                btn.onclick = () => submitAnswer(displayIdx);
                answerContainer.appendChild(btn);
            });
        }

        // Track question start time
        state.questionTimes[state.currentIndex] = { start: Date.now() };
    }

    /**
     * Submit an answer
     */
    function submitAnswer(answerIndex) {
        const q = state.questions[state.currentIndex];
        const timeTaken = (Date.now() - state.questionTimes[state.currentIndex].start) / 1000;
        state.questionTimes[state.currentIndex].end = Date.now();
        state.questionTimes[state.currentIndex].duration = timeTaken;

        const isCorrect = answerIndex === (q._shuffledCorrect !== undefined ? q._shuffledCorrect : q.correct);
        state.total++;

        if (isCorrect) {
            state.correct++;
            state.streak++;
            if (state.streak > state.bestStreak) {
                state.bestStreak = state.streak;
            }

            const points = calculatePoints(timeTaken, state.streak);
            state.score += points;

            flashFeedback(true, points);
        } else {
            state.streak = 0;
            flashFeedback(false);
        }

        updateScoreDisplay();
        updateStreakDisplay();

        state.currentIndex++;
        setTimeout(() => showQuestion(), 250);
    }

    /**
     * Calculate points for correct answer
     */
    function calculatePoints(timeTaken, streak) {
        let points = 100;

        // Speed bonus
        if (timeTaken <= 3) {
            points += 50;
        } else if (timeTaken <= 5) {
            points += 25;
        }

        // Streak multiplier
        let multiplier = 1;
        if (streak >= 10) {
            multiplier = 3;
        } else if (streak >= 6) {
            multiplier = 2;
        } else if (streak >= 3) {
            multiplier = 1.5;
        }

        return Math.floor(points * multiplier);
    }

    /**
     * Flash visual feedback for answer
     */
    function flashFeedback(correct, points = 0) {
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: ${correct ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'};
            pointer-events: none;
            z-index: 9999;
            animation: flashFade 0.25s ease-out;
        `;
        document.body.appendChild(overlay);

        if (correct && points > 0) {
            const pointsText = document.createElement('div');
            pointsText.textContent = `+${points}`;
            pointsText.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                color: #22c55e;
                font-size: 48px;
                font-weight: bold;
                font-family: 'Courier New', monospace;
                pointer-events: none;
                z-index: 10000;
                animation: floatUp 0.5s ease-out;
            `;
            document.body.appendChild(pointsText);
            setTimeout(() => pointsText.remove(), 500);
        } else if (!correct) {
            const xMark = document.createElement('div');
            xMark.textContent = 'X';
            xMark.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                color: #ef4444;
                font-size: 72px;
                font-weight: bold;
                font-family: 'Courier New', monospace;
                pointer-events: none;
                z-index: 10000;
                animation: flashFade 0.25s ease-out;
            `;
            document.body.appendChild(xMark);
            setTimeout(() => xMark.remove(), 250);
        }

        setTimeout(() => overlay.remove(), 250);
    }

    /**
     * Update score display
     */
    function updateScoreDisplay() {
        const scoreEl = document.getElementById('score-value');
        if (scoreEl) {
            scoreEl.textContent = state.score.toLocaleString();
        }
    }

    /**
     * Update streak display
     */
    function updateStreakDisplay() {
        const streakEl = document.getElementById('streak-value');
        if (streakEl) {
            if (state.streak > 0) {
                streakEl.innerHTML = `<img src="/assets/images/icons/icon-explosion.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle"> x${state.streak}`;
                streakEl.style.opacity = '1';
            } else {
                streakEl.style.opacity = '0.3';
                streakEl.textContent = '—';
            }
        }
    }

    /**
     * End the challenge
     */
    function endChallenge(perfectRun = false) {
        if (state.timer) {
            clearInterval(state.timer);
            state.timer = null;
        }

        state.phase = 'complete';

        const avgTime = state.questionTimes
            .filter(qt => qt.duration)
            .reduce((sum, qt) => sum + qt.duration, 0) / state.total || 0;

        const result = {
            ringId: config.ringId,
            score: state.score,
            correct: state.correct,
            total: state.total,
            accuracy: Math.round((state.correct / state.total) * 100) || 0,
            avgTime: avgTime.toFixed(1),
            bestStreak: state.bestStreak,
            perfectRun: perfectRun,
            timestamp: Date.now()
        };

        renderPostChallenge(result);
        config.onComplete(result);
    }

    /**
     * Get current state
     */
    function getState() {
        return {
            phase: state.phase,
            score: state.score,
            timeLeft: state.timeLeft,
            streak: state.streak,
            currentIndex: state.currentIndex,
            totalQuestions: state.questions.length
        };
    }

    // ==================== RENDER FUNCTIONS ====================

    /**
     * Render pre-challenge screen
     */
    function renderPreChallenge() {
        elements.container.innerHTML = `
            <div id="pre-challenge" style="text-align: center; padding: 60px 20px;">
                <div style="font-size: 64px; margin-bottom: 20px;">${getRingIcon(config.ringId)}</div>
                <h1 style="color: ${config.houseColor}; font-size: 36px; margin-bottom: 40px; text-transform: uppercase;">
                    ${config.ringId} Ring Challenge
                </h1>

                <div style="max-width: 600px; margin: 0 auto 40px;">
                    <h2 style="color: #fff; font-size: 24px; margin-bottom: 20px;">Rules of Engagement</h2>
                    <p style="color: #94a3b8; font-size: 18px; line-height: 1.6;">
                        60 seconds. Answer fast. Answer right. Streak multipliers apply.
                    </p>
                    <div style="margin-top: 30px; padding: 20px; background: rgba(255,255,255,0.05); border-radius: 8px;">
                        <p style="color: #cbd5e1; margin-bottom: 10px;"><strong>Base Points:</strong> 100 per correct answer</p>
                        <p style="color: #cbd5e1; margin-bottom: 10px;"><strong>Speed Bonus:</strong> +50 (&lt;3s) or +25 (&lt;5s)</p>
                        <p style="color: #cbd5e1; margin-bottom: 10px;"><strong>Streak Multiplier:</strong> 1.5x (3-5), 2x (6-9), 3x (10+)</p>
                        <p style="color: #cbd5e1;"><strong>Wrong Answer:</strong> Streak resets to 0</p>
                    </div>
                </div>

                <button id="begin-btn" style="
                    background: ${config.houseColor};
                    color: #fff;
                    border: none;
                    padding: 20px 60px;
                    font-size: 24px;
                    font-weight: bold;
                    cursor: pointer;
                    border-radius: 8px;
                    text-transform: uppercase;
                    font-family: 'Courier New', monospace;
                    animation: pulse 2s ease-in-out infinite;
                    box-shadow: 0 0 20px ${config.houseColor}80;
                ">
                    BEGIN CHALLENGE
                </button>
            </div>

            <style>
                @keyframes pulse {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.05); }
                }
            </style>
        `;

        document.getElementById('begin-btn').onclick = start;
    }

    /**
     * Render countdown screen
     */
    function renderCountdown() {
        elements.container.innerHTML = `
            <div id="countdown-screen" style="
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                height: 60vh;
            ">
                <div id="countdown-number" style="
                    font-size: 120px;
                    font-weight: bold;
                    font-family: 'Courier New', monospace;
                    margin-bottom: 20px;
                ">3</div>
                <div id="countdown-label" style="
                    font-size: 36px;
                    font-weight: bold;
                    font-family: 'Courier New', monospace;
                ">RED</div>
            </div>
        `;
    }

    /**
     * Render challenge screen
     */
    function renderChallenge() {
        elements.container.innerHTML = `
            <div id="challenge-screen">
                <!-- Timer Bar -->
                <div style="margin-bottom: 40px;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                        <span style="color: #94a3b8; font-family: 'Courier New', monospace;">TIME REMAINING</span>
                        <span id="timer-text" style="color: #fff; font-family: 'Courier New', monospace; font-weight: bold;">60s</span>
                    </div>
                    <div style="height: 12px; background: rgba(255,255,255,0.1); border-radius: 6px; overflow: hidden;">
                        <div id="timer-bar" style="
                            height: 100%;
                            width: 100%;
                            background: #22c55e;
                            transition: width 0.05s linear, background 0.3s;
                        "></div>
                    </div>
                </div>

                <!-- Score and Streak -->
                <div style="display: flex; justify-content: space-between; margin-bottom: 40px;">
                    <div style="color: #fff; font-family: 'Courier New', monospace; font-size: 24px;">
                        Score: <span id="score-value" style="color: ${config.houseColor}; font-weight: bold;">0</span>
                    </div>
                    <div id="streak-value" style="
                        color: #f59e0b;
                        font-family: 'Courier New', monospace;
                        font-size: 24px;
                        font-weight: bold;
                        opacity: 0.3;
                    ">—</div>
                </div>

                <!-- Question -->
                <div id="question-text" style="
                    color: #fff;
                    font-size: 28px;
                    margin-bottom: 40px;
                    min-height: 100px;
                    font-family: 'Courier New', monospace;
                    line-height: 1.4;
                "></div>

                <!-- Answers -->
                <div id="answer-buttons" style="
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 20px;
                "></div>
            </div>

            <style>
                .answer-btn {
                    background: rgba(255,255,255,0.05);
                    border: 2px solid rgba(255,255,255,0.2);
                    color: #fff;
                    padding: 20px;
                    font-size: 18px;
                    cursor: pointer;
                    border-radius: 8px;
                    transition: all 0.2s;
                    font-family: 'Courier New', monospace;
                    text-align: left;
                }
                .answer-btn:hover {
                    background: ${config.houseColor}40;
                    border-color: ${config.houseColor};
                    box-shadow: 0 0 20px ${config.houseColor}40;
                    transform: translateY(-2px);
                }
                @keyframes slideIn {
                    from { opacity: 0; transform: translateX(-20px); }
                    to { opacity: 1; transform: translateX(0); }
                }
                @keyframes flashFade {
                    from { opacity: 1; }
                    to { opacity: 0; }
                }
                @keyframes floatUp {
                    from { opacity: 1; transform: translate(-50%, -50%); }
                    to { opacity: 0; transform: translate(-50%, -150%); }
                }
            </style>
        `;

        // Keyboard shortcuts (1-4)
        document.addEventListener('keydown', handleKeyboard);
    }

    /**
     * Handle keyboard input
     */
    function handleKeyboard(e) {
        if (state.phase !== 'playing') return;
        const key = e.key;
        if (['1', '2', '3', '4'].includes(key)) {
            submitAnswer(parseInt(key) - 1);
        }
    }

    /**
     * Render post-challenge screen
     */
    function renderPostChallenge(result) {
        // Remove keyboard listener
        document.removeEventListener('keydown', handleKeyboard);

        const isNewRecord = checkIfNewRecord(result);

        elements.container.innerHTML = `
            <div id="post-challenge" style="text-align: center; padding: 60px 20px;">
                ${isNewRecord ? `
                    <div style="margin-bottom: 40px;">
                        <div style="font-size: 72px; margin-bottom: 20px; animation: celebrate 1s ease-out;"><img src="/assets/images/icons/icon-trophy.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle"></div>
                        <h1 style="color: #fbbf24; font-size: 48px; margin-bottom: 20px; animation: glow 1s ease-out;">
                            RING CLAIMED!
                        </h1>
                    </div>
                ` : `
                    <h1 style="color: ${config.houseColor}; font-size: 36px; margin-bottom: 40px;">
                        Challenge Complete
                    </h1>
                `}

                <!-- Final Score -->
                <div id="final-score" style="
                    font-size: 64px;
                    font-weight: bold;
                    color: ${config.houseColor};
                    margin-bottom: 40px;
                    font-family: 'Courier New', monospace;
                ">0</div>

                <!-- Stats Grid -->
                <div style="
                    max-width: 600px;
                    margin: 0 auto 40px;
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 20px;
                ">
                    <div style="padding: 20px; background: rgba(255,255,255,0.05); border-radius: 8px;">
                        <div style="color: #94a3b8; margin-bottom: 10px;">Correct / Total</div>
                        <div style="color: #fff; font-size: 24px; font-weight: bold;">${result.correct} / ${result.total}</div>
                    </div>
                    <div style="padding: 20px; background: rgba(255,255,255,0.05); border-radius: 8px;">
                        <div style="color: #94a3b8; margin-bottom: 10px;">Accuracy</div>
                        <div style="color: #fff; font-size: 24px; font-weight: bold;">${result.accuracy}%</div>
                    </div>
                    <div style="padding: 20px; background: rgba(255,255,255,0.05); border-radius: 8px;">
                        <div style="color: #94a3b8; margin-bottom: 10px;">Avg Time</div>
                        <div style="color: #fff; font-size: 24px; font-weight: bold;">${result.avgTime}s</div>
                    </div>
                    <div style="padding: 20px; background: rgba(255,255,255,0.05); border-radius: 8px;">
                        <div style="color: #94a3b8; margin-bottom: 10px;">Best Streak</div>
                        <div style="color: #fff; font-size: 24px; font-weight: bold;"><img src="/assets/images/icons/icon-explosion.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle"> ${result.bestStreak}</div>
                    </div>
                </div>

                ${result.perfectRun ? `
                    <div style="
                        padding: 20px;
                        background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
                        border-radius: 8px;
                        margin-bottom: 40px;
                        max-width: 600px;
                        margin-left: auto;
                        margin-right: auto;
                    ">
                        <div style="font-size: 28px; font-weight: bold; margin-bottom: 10px;"><img src="/assets/images/icons/icon-lightning.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle"> PERFECT RUN <img src="/assets/images/icons/icon-lightning.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle"></div>
                        <div style="font-size: 18px;">All questions answered before time expired! +500 Bonus</div>
                    </div>
                ` : ''}

                <div style="margin-bottom: 40px;">
                    ${getComparisonMessage(result)}
                </div>

                <!-- Action Buttons -->
                <div style="display: flex; gap: 20px; justify-content: center;">
                    <button id="retry-btn" style="
                        background: ${config.houseColor};
                        color: #fff;
                        border: none;
                        padding: 15px 40px;
                        font-size: 18px;
                        font-weight: bold;
                        cursor: pointer;
                        border-radius: 8px;
                        font-family: 'Courier New', monospace;
                    ">
                        TRY AGAIN
                    </button>
                    <button id="return-btn" style="
                        background: rgba(255,255,255,0.1);
                        color: #fff;
                        border: 2px solid rgba(255,255,255,0.3);
                        padding: 15px 40px;
                        font-size: 18px;
                        font-weight: bold;
                        cursor: pointer;
                        border-radius: 8px;
                        font-family: 'Courier New', monospace;
                    ">
                        RETURN TO GALLERY
                    </button>
                </div>
            </div>

            <style>
                @keyframes celebrate {
                    0% { transform: scale(0) rotate(0deg); }
                    50% { transform: scale(1.2) rotate(180deg); }
                    100% { transform: scale(1) rotate(360deg); }
                }
                @keyframes glow {
                    0%, 100% { text-shadow: 0 0 10px #fbbf24; }
                    50% { text-shadow: 0 0 30px #fbbf24, 0 0 60px #fbbf24; }
                }
            </style>
        `;

        // Animate score count-up
        animateScore(0, result.score, 2000);

        // Button handlers
        document.getElementById('retry-btn').onclick = () => {
            reset();
            renderPreChallenge();
        };

        document.getElementById('return-btn').onclick = () => {
            window.location.href = 'gallery.html';
        };

        // Trigger confetti if new record
        if (isNewRecord) {
            triggerConfetti();
        }
    }

    /**
     * Animate score count-up
     */
    function animateScore(start, end, duration) {
        const scoreEl = document.getElementById('final-score');
        if (!scoreEl) return;

        const startTime = Date.now();
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const current = Math.floor(start + (end - start) * progress);
            scoreEl.textContent = current.toLocaleString();

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        animate();
    }

    /**
     * Check if score is a new record
     */
    function checkIfNewRecord(result) {
        // This would check against RingManager's stored scores
        // For now, just check if score > 7000 (high bar)
        return result.score > 7000;
    }

    /**
     * Get comparison message
     */
    function getComparisonMessage(result) {
        const currentHolder = { callsign: 'PHANTOM-7', score: 9200 }; // Mock data
        if (result.score > currentHolder.score) {
            return `<p style="color: #22c55e; font-size: 20px;">You surpassed ${currentHolder.callsign}'s score of ${currentHolder.score.toLocaleString()}!</p>`;
        } else {
            const gap = currentHolder.score - result.score;
            return `<p style="color: #94a3b8; font-size: 20px;">You scored ${result.score.toLocaleString()}. ${currentHolder.callsign} holds the ring with ${currentHolder.score.toLocaleString()}. ${gap.toLocaleString()} points away!</p>`;
        }
    }

    /**
     * Get ring icon by ID
     */
    function getRingIcon(ringId) {
        const icons = {
            shield: '<img src="/assets/images/icons/icon-shield.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle">',
            web: '<img src="/assets/images/icons/icon-globe.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle">',
            forge: '<img src="/assets/images/icons/icon-tools.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle;display:inline-block;object-fit:contain">',
            script: '<img src="/assets/images/icons/icon-scroll.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle">',
            cloud: '<img src="/assets/images/icons/icon-globe.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle">',
            code: '<img src="/assets/images/icons/icon-gear.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle">',
            key: '<img src="/assets/images/icons/icon-key.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle">',
            eye: '<img src="/assets/images/icons/icon-detective.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle">'
        };
        return icons[ringId] || '<img src="/assets/images/icons/icon-diamond.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle;display:inline-block;object-fit:contain">';
    }

    /**
     * Trigger confetti effect
     */
    function triggerConfetti() {
        // Simple confetti particle effect
        for (let i = 0; i < 50; i++) {
            setTimeout(() => {
                const particle = document.createElement('div');
                particle.innerHTML = ['<img src="/assets/images/icons/icon-star.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle;display:inline-block;object-fit:contain">', '<img src="/assets/images/icons/icon-star.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle">', '<img src="/assets/images/icons/icon-star.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle;display:inline-block;object-fit:contain">', '<img src="/assets/images/icons/icon-star.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle;display:inline-block;object-fit:contain">'][Math.floor(Math.random() * 4)];
                particle.style.cssText = `
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    font-size: 24px;
                    pointer-events: none;
                    z-index: 10000;
                    animation: confettiFall ${2 + Math.random() * 2}s ease-out forwards;
                `;
                document.body.appendChild(particle);

                const style = document.createElement('style');
                style.textContent = `
                    @keyframes confettiFall {
                        to {
                            transform: translate(${(Math.random() - 0.5) * 400}px, ${Math.random() * 600 + 200}px) rotate(${Math.random() * 720}deg);
                            opacity: 0;
                        }
                    }
                `;
                document.head.appendChild(style);

                setTimeout(() => {
                    particle.remove();
                    style.remove();
                }, 4000);
            }, i * 30);
        }
    }

    // Public API
    return {
        init: init,
        start: start,
        getState: getState,
        reset: reset
    };
})();
