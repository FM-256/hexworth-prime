/**
 * QuizEngine.js - Reusable Quiz Component for Hexworth Prime
 *
 * Usage:
 *   const quiz = new QuizEngine({
 *       containerId: 'quiz-container',
 *       title: 'CIA Triad Challenge',
 *       description: 'Test your knowledge of security fundamentals',
 *       questions: [...],
 *       passingScore: 70,
 *       showFeedback: true,
 *       randomize: true,
 *       timeLimit: null, // seconds, or null for untimed
 *       achievement: 'shield-cia-master',
 *       onComplete: (results) => { ... }
 *   });
 *   quiz.start();
 */

class QuizEngine {
    constructor(config) {
        this.config = {
            containerId: config.containerId || 'quiz-container',
            title: config.title || 'Knowledge Check',
            description: config.description || '',
            questions: config.questions || [],
            passingScore: config.passingScore || 70,
            showFeedback: config.showFeedback !== false,
            randomize: config.randomize !== false,
            timeLimit: config.timeLimit || null,
            achievement: config.achievement || null,
            retryAllowed: config.retryAllowed !== false,
            theme: config.theme || 'default', // default, dark, house-specific
            onComplete: config.onComplete || null,
            onQuestionAnswer: config.onQuestionAnswer || null,
            // NEW: Progress tracking integration
            moduleId: config.moduleId || config.achievement || null,  // Unique ID for this quiz
            houseId: config.houseId || this.detectHouseFromUrl(),     // Auto-detect from URL
            trackProgress: config.trackProgress !== false             // Enable progress tracking
        };

        this.state = {
            currentQuestion: 0,
            answers: [],
            score: 0,
            startTime: null,
            endTime: null,
            timeRemaining: this.config.timeLimit,
            timerInterval: null,
            isComplete: false,
            attempts: 0
        };

        this.container = null;
        this.originalQuestions = [...this.config.questions];
        this.progressResult = null;  // Store progress result for UI
    }

    /**
     * Detect house from current URL path
     */
    detectHouseFromUrl() {
        const path = window.location.pathname.toLowerCase();
        const houses = ['web', 'shield', 'forge', 'script', 'cloud', 'code', 'key', 'eye'];
        for (const house of houses) {
            if (path.includes(`/houses/${house}/`) || path.includes(`/${house}/`)) {
                return house;
            }
        }
        // Also check for theme in config
        if (this.config && this.config.theme) {
            const theme = this.config.theme.toLowerCase();
            if (houses.includes(theme)) {
                return theme;
            }
        }
        return null;
    }

    /**
     * Initialize and start the quiz
     */
    start() {
        this.container = document.getElementById(this.config.containerId);
        if (!this.container) {
            console.error(`QuizEngine: Container #${this.config.containerId} not found`);
            return;
        }

        // Reset state for retry
        this.state = {
            currentQuestion: 0,
            answers: [],
            score: 0,
            startTime: Date.now(),
            endTime: null,
            timeRemaining: this.config.timeLimit,
            timerInterval: null,
            isComplete: false,
            attempts: this.state.attempts + 1
        };

        // Randomize questions if enabled
        if (this.config.randomize) {
            this.config.questions = this.shuffleArray([...this.originalQuestions]);
            // Also randomize answer options for each question
            this.config.questions.forEach(q => {
                if (q.options && !q.preserveOrder) {
                    const correctAnswer = q.options[q.correct];
                    q.options = this.shuffleArray([...q.options]);
                    q.correct = q.options.indexOf(correctAnswer);
                }
            });
        }

        this.render();
        this.startTimer();
    }

    /**
     * Shuffle array (Fisher-Yates)
     */
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    /**
     * Start countdown timer if timeLimit is set
     */
    startTimer() {
        if (!this.config.timeLimit) return;

        this.state.timerInterval = setInterval(() => {
            this.state.timeRemaining--;
            this.updateTimerDisplay();

            if (this.state.timeRemaining <= 0) {
                this.endQuiz(true); // Force end
            }
        }, 1000);
    }

    /**
     * Update timer display
     */
    updateTimerDisplay() {
        const timerEl = this.container.querySelector('.quiz-timer');
        if (timerEl) {
            const mins = Math.floor(this.state.timeRemaining / 60);
            const secs = this.state.timeRemaining % 60;
            timerEl.textContent = `${mins}:${secs.toString().padStart(2, '0')}`;

            // Warning colors
            if (this.state.timeRemaining <= 30) {
                timerEl.classList.add('warning');
            }
            if (this.state.timeRemaining <= 10) {
                timerEl.classList.add('critical');
            }
        }
    }

    /**
     * Main render function
     */
    render() {
        if (this.state.isComplete) {
            this.renderResults();
        } else {
            this.renderQuestion();
        }
    }

    /**
     * Render current question
     */
    renderQuestion() {
        const q = this.config.questions[this.state.currentQuestion];
        const progress = ((this.state.currentQuestion) / this.config.questions.length) * 100;
        const questionNum = this.state.currentQuestion + 1;
        const totalQuestions = this.config.questions.length;

        this.container.innerHTML = `
            <div class="quiz-engine theme-${this.config.theme}">
                <div class="quiz-header">
                    <h2 class="quiz-title">${this.config.title}</h2>
                    <div class="quiz-meta">
                        <span class="quiz-progress-text">Question ${questionNum} of ${totalQuestions}</span>
                        ${this.config.timeLimit ? `<span class="quiz-timer">${this.formatTime(this.state.timeRemaining)}</span>` : ''}
                    </div>
                    <div class="quiz-progress-bar">
                        <div class="quiz-progress-fill" style="width: ${progress}%"></div>
                    </div>
                </div>

                <div class="quiz-body">
                    <div class="quiz-question">
                        <p class="question-text">${q.question}</p>
                        ${q.code ? `<pre class="question-code"><code>${this.escapeHtml(q.code)}</code></pre>` : ''}
                        ${q.image ? `<img src="${q.image}" alt="Question image" class="question-image">` : ''}
                    </div>

                    <div class="quiz-options">
                        ${q.options.map((opt, idx) => `
                            <button class="quiz-option" data-index="${idx}">
                                <span class="option-letter">${String.fromCharCode(65 + idx)}</span>
                                <span class="option-text">${opt}</span>
                            </button>
                        `).join('')}
                    </div>
                </div>

                <div class="quiz-footer">
                    <div class="quiz-score-preview">
                        Score: ${this.state.score}/${this.state.currentQuestion}
                    </div>
                </div>
            </div>
        `;

        // Attach event listeners
        this.container.querySelectorAll('.quiz-option').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleAnswer(e));
        });
    }

    /**
     * Handle answer selection
     */
    handleAnswer(e) {
        const selectedIndex = parseInt(e.currentTarget.dataset.index);
        const q = this.config.questions[this.state.currentQuestion];
        const isCorrect = selectedIndex === q.correct;

        // Record answer
        this.state.answers.push({
            questionIndex: this.state.currentQuestion,
            selected: selectedIndex,
            correct: q.correct,
            isCorrect: isCorrect
        });

        if (isCorrect) {
            this.state.score++;
        }

        // Callback
        if (this.config.onQuestionAnswer) {
            this.config.onQuestionAnswer({
                question: q,
                selected: selectedIndex,
                isCorrect: isCorrect,
                currentScore: this.state.score
            });
        }

        // Show feedback or move to next
        if (this.config.showFeedback) {
            this.showFeedback(e.currentTarget, selectedIndex, q, isCorrect);
        } else {
            this.nextQuestion();
        }
    }

    /**
     * Show feedback after answer
     */
    showFeedback(selectedBtn, selectedIndex, question, isCorrect) {
        // Disable all options
        this.container.querySelectorAll('.quiz-option').forEach(btn => {
            btn.disabled = true;
            const idx = parseInt(btn.dataset.index);
            if (idx === question.correct) {
                btn.classList.add('correct');
            } else if (idx === selectedIndex && !isCorrect) {
                btn.classList.add('incorrect');
            }
        });

        // Show explanation
        const feedbackHtml = `
            <div class="quiz-feedback ${isCorrect ? 'correct' : 'incorrect'}">
                <div class="feedback-icon">${isCorrect ? '✓' : '✗'}</div>
                <div class="feedback-text">
                    <strong>${isCorrect ? 'Correct!' : 'Not quite...'}</strong>
                    ${question.explanation ? `<p>${question.explanation}</p>` : ''}
                </div>
                <button class="quiz-next-btn">${this.state.currentQuestion < this.config.questions.length - 1 ? 'Next Question →' : 'See Results →'}</button>
            </div>
        `;

        const quizBody = this.container.querySelector('.quiz-body');
        quizBody.insertAdjacentHTML('beforeend', feedbackHtml);

        this.container.querySelector('.quiz-next-btn').addEventListener('click', () => {
            this.nextQuestion();
        });
    }

    /**
     * Move to next question or end quiz
     */
    nextQuestion() {
        this.state.currentQuestion++;

        if (this.state.currentQuestion >= this.config.questions.length) {
            this.endQuiz();
        } else {
            this.render();
        }
    }

    /**
     * End the quiz and show results
     */
    endQuiz(timedOut = false) {
        if (this.state.timerInterval) {
            clearInterval(this.state.timerInterval);
        }

        this.state.endTime = Date.now();
        this.state.isComplete = true;

        const results = this.calculateResults(timedOut);

        // Trigger quiz-specific achievement if passed
        if (results.passed && this.config.achievement) {
            this.triggerAchievement(this.config.achievement);
        }

        // Process general quiz achievements (first_quiz, perfect_score, etc.)
        this.processQuizAchievements(results);

        // NEW: Track progress through ProgressManager
        if (results.passed && this.config.trackProgress && this.config.moduleId) {
            this.progressResult = this.trackQuizCompletion(results);
            results.progressResult = this.progressResult;
        }

        // Callback
        if (this.config.onComplete) {
            this.config.onComplete(results);
        }

        this.renderResults(results, timedOut);
    }

    /**
     * Track quiz completion in ProgressManager
     */
    trackQuizCompletion(results) {
        // Check if ProgressManager is available
        if (typeof ProgressManager === 'undefined') {
            console.warn('QuizEngine: ProgressManager not available, progress not tracked');
            return null;
        }

        const houseId = this.config.houseId || this.detectHouseFromUrl();
        if (!houseId) {
            console.warn('QuizEngine: Could not determine house ID for progress tracking');
            return null;
        }

        // Complete the module and get result
        return ProgressManager.completeModule(
            this.config.moduleId,
            houseId,
            'quiz',
            {
                score: results.percentage,
                attempts: results.attempts,
                time: results.duration,
                passed: results.passed
            }
        );
    }

    /**
     * Calculate final results
     */
    calculateResults(timedOut = false) {
        const totalQuestions = this.config.questions.length;
        const percentage = Math.round((this.state.score / totalQuestions) * 100);
        const passed = percentage >= this.config.passingScore;
        const duration = Math.round((this.state.endTime - this.state.startTime) / 1000);

        return {
            score: this.state.score,
            total: totalQuestions,
            percentage: percentage,
            passed: passed,
            passingScore: this.config.passingScore,
            duration: duration,
            timedOut: timedOut,
            answers: this.state.answers,
            attempts: this.state.attempts
        };
    }

    /**
     * Render results screen
     */
    renderResults(results = null, timedOut = false) {
        if (!results) {
            results = this.calculateResults(timedOut);
        }

        const gradeClass = results.passed ? 'passed' : 'failed';
        const gradeEmoji = results.passed ? '🎉' : '💪';
        const gradeMessage = results.passed
            ? this.getPassMessage(results.percentage)
            : this.getFailMessage(results.percentage);

        // Get progress info for display
        const progressResult = this.progressResult || results.progressResult;
        const xpEarned = progressResult ? progressResult.xpEarned : 0;
        const nextModule = progressResult ? progressResult.nextModule : this.getNextModuleFallback();

        this.container.innerHTML = `
            <div class="quiz-engine theme-${this.config.theme}">
                <div class="quiz-results ${gradeClass}">
                    <div class="results-header">
                        <span class="results-emoji">${gradeEmoji}</span>
                        <h2 class="results-title">${results.passed ? 'Challenge Complete!' : 'Keep Training!'}</h2>
                    </div>

                    <div class="results-score">
                        <div class="score-circle ${gradeClass}">
                            <span class="score-percentage">${results.percentage}%</span>
                            <span class="score-fraction">${results.score}/${results.total}</span>
                        </div>
                    </div>

                    <p class="results-message">${gradeMessage}</p>

                    ${timedOut ? '<p class="results-timeout">⏱️ Time ran out!</p>' : ''}

                    <div class="results-stats">
                        <div class="stat">
                            <span class="stat-value">${this.formatTime(results.duration)}</span>
                            <span class="stat-label">Time</span>
                        </div>
                        <div class="stat">
                            <span class="stat-value">${results.passingScore}%</span>
                            <span class="stat-label">Passing</span>
                        </div>
                        <div class="stat">
                            <span class="stat-value">${results.attempts}</span>
                            <span class="stat-label">Attempts</span>
                        </div>
                    </div>

                    ${results.passed && xpEarned > 0 ? `
                        <div class="results-xp">
                            <span class="xp-icon">✨</span>
                            <span class="xp-earned">+${xpEarned} XP</span>
                            ${progressResult && progressResult.levelUp ? `<span class="level-up">🎉 Level Up! Now Level ${progressResult.newLevel}</span>` : ''}
                        </div>
                    ` : ''}

                    ${results.passed && this.config.achievement ? `
                        <div class="results-achievement">
                            🏆 Achievement Unlocked: <strong>${this.config.achievement}</strong>
                        </div>
                    ` : ''}

                    <div class="results-actions">
                        ${results.passed && nextModule ? `
                            <button class="quiz-btn quiz-next-module-btn primary">
                                Continue → ${nextModule.title || 'Next Module'}
                            </button>
                        ` : ''}
                        ${results.passed ? `
                            <button class="quiz-btn quiz-house-btn">
                                ← Back to House
                            </button>
                        ` : ''}
                        ${this.config.retryAllowed ? `
                            <button class="quiz-btn quiz-retry-btn">${results.passed ? 'Try Again' : 'Retry Challenge'}</button>
                        ` : ''}
                        <button class="quiz-btn quiz-review-btn">Review Answers</button>
                    </div>
                </div>
            </div>
        `;

        // Add additional styles for new elements
        this.addResultsStyles();

        // Attach event listeners
        const retryBtn = this.container.querySelector('.quiz-retry-btn');
        if (retryBtn) {
            retryBtn.addEventListener('click', () => this.start());
        }

        const reviewBtn = this.container.querySelector('.quiz-review-btn');
        if (reviewBtn) {
            reviewBtn.addEventListener('click', () => this.renderReview(results));
        }

        // Next module button
        const nextBtn = this.container.querySelector('.quiz-next-module-btn');
        if (nextBtn && nextModule) {
            nextBtn.addEventListener('click', () => {
                // Calculate correct path - hrefs in LearningPaths are relative to house root
                // If we're in a subfolder (quizzes/, applets/, etc.), need to go up first
                const currentPath = window.location.pathname;
                const houseMatch = currentPath.match(/\/houses\/\w+\//);
                if (houseMatch) {
                    // Navigate relative to house root
                    const houseBase = currentPath.substring(0, currentPath.indexOf(houseMatch[0]) + houseMatch[0].length);
                    window.location.href = houseBase + nextModule.href;
                } else {
                    // Fallback: go up one level and try
                    window.location.href = '../' + nextModule.href;
                }
            });
        }

        // Back to house button
        const houseBtn = this.container.querySelector('.quiz-house-btn');
        if (houseBtn) {
            houseBtn.addEventListener('click', () => {
                // Navigate to house index
                const houseId = this.config.houseId || this.detectHouseFromUrl();
                if (houseId) {
                    // Go up to house index
                    window.location.href = '../index.html';
                } else {
                    window.history.back();
                }
            });
        }
    }

    /**
     * Fallback to get next module if ProgressManager isn't available
     */
    getNextModuleFallback() {
        if (typeof LearningPaths === 'undefined') return null;

        const houseId = this.config.houseId || this.detectHouseFromUrl();
        if (!houseId || !this.config.moduleId) return null;

        return LearningPaths.getNextModule(houseId, this.config.moduleId);
    }

    /**
     * Add styles for new results elements
     */
    addResultsStyles() {
        if (document.getElementById('quiz-results-enhanced-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'quiz-results-enhanced-styles';
        styles.textContent = `
            .results-xp {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 10px;
                padding: 12px 20px;
                background: linear-gradient(135deg, rgba(34, 197, 94, 0.15), rgba(34, 197, 94, 0.05));
                border: 1px solid rgba(34, 197, 94, 0.3);
                border-radius: 10px;
                margin: 15px 0;
            }

            .xp-icon {
                font-size: 1.3rem;
            }

            .xp-earned {
                font-size: 1.4rem;
                font-weight: 700;
                color: #22c55e;
            }

            .level-up {
                font-size: 1rem;
                font-weight: 600;
                color: #fbbf24;
                background: rgba(251, 191, 36, 0.15);
                padding: 4px 12px;
                border-radius: 20px;
            }

            .quiz-next-module-btn.primary {
                background: linear-gradient(135deg, #7c3aed, #a855f7) !important;
                color: white !important;
                font-weight: 600;
                padding: 14px 24px !important;
                font-size: 1.05rem;
                border: none;
                box-shadow: 0 4px 15px rgba(168, 85, 247, 0.3);
                animation: pulseGlow 2s infinite;
            }

            .quiz-next-module-btn.primary:hover {
                background: linear-gradient(135deg, #8b5cf6, #c084fc) !important;
                transform: translateY(-2px);
                box-shadow: 0 6px 20px rgba(168, 85, 247, 0.4);
            }

            @keyframes pulseGlow {
                0%, 100% { box-shadow: 0 4px 15px rgba(168, 85, 247, 0.3); }
                50% { box-shadow: 0 4px 25px rgba(168, 85, 247, 0.5); }
            }

            .quiz-house-btn {
                background: rgba(100, 100, 120, 0.3) !important;
                color: #a0a0b0 !important;
            }

            .quiz-house-btn:hover {
                background: rgba(100, 100, 120, 0.5) !important;
                color: #e0e0e0 !important;
            }

            .results-actions {
                display: flex;
                flex-direction: column;
                gap: 10px;
                margin-top: 20px;
            }

            @media (min-width: 480px) {
                .results-actions {
                    flex-direction: row;
                    flex-wrap: wrap;
                    justify-content: center;
                }
            }
        `;
        document.head.appendChild(styles);
    }

    /**
     * Render answer review
     */
    renderReview(results) {
        const reviewHtml = this.config.questions.map((q, idx) => {
            const answer = results.answers[idx];
            const statusClass = answer ? (answer.isCorrect ? 'correct' : 'incorrect') : 'unanswered';

            return `
                <div class="review-item ${statusClass}">
                    <div class="review-header">
                        <span class="review-num">Q${idx + 1}</span>
                        <span class="review-status">${answer ? (answer.isCorrect ? '✓' : '✗') : '—'}</span>
                    </div>
                    <p class="review-question">${q.question}</p>
                    <div class="review-options">
                        ${q.options.map((opt, optIdx) => `
                            <div class="review-option ${optIdx === q.correct ? 'correct-answer' : ''} ${answer && optIdx === answer.selected && !answer.isCorrect ? 'wrong-selected' : ''}">
                                <span class="option-letter">${String.fromCharCode(65 + optIdx)}</span>
                                ${opt}
                                ${optIdx === q.correct ? ' ✓' : ''}
                                ${answer && optIdx === answer.selected && !answer.isCorrect ? ' (your answer)' : ''}
                            </div>
                        `).join('')}
                    </div>
                    ${q.explanation ? `<p class="review-explanation">💡 ${q.explanation}</p>` : ''}
                </div>
            `;
        }).join('');

        this.container.innerHTML = `
            <div class="quiz-engine theme-${this.config.theme}">
                <div class="quiz-review">
                    <div class="review-header-bar">
                        <h2>Answer Review</h2>
                        <button class="quiz-btn quiz-back-btn">← Back to Results</button>
                    </div>
                    <div class="review-list">
                        ${reviewHtml}
                    </div>
                    <div class="review-footer">
                        <button class="quiz-btn quiz-back-btn">← Back to Results</button>
                        ${this.config.retryAllowed ? `<button class="quiz-btn quiz-retry-btn">Try Again</button>` : ''}
                    </div>
                </div>
            </div>
        `;

        this.container.querySelectorAll('.quiz-back-btn').forEach(btn => {
            btn.addEventListener('click', () => this.renderResults(results));
        });

        const retryBtn = this.container.querySelector('.quiz-retry-btn');
        if (retryBtn) {
            retryBtn.addEventListener('click', () => this.start());
        }
    }

    /**
     * Get encouraging pass message based on score
     */
    getPassMessage(percentage) {
        if (percentage === 100) return "Perfect score! You've mastered this material!";
        if (percentage >= 90) return "Excellent work! You really know your stuff!";
        if (percentage >= 80) return "Great job! Solid understanding demonstrated.";
        return "You passed! Consider reviewing the questions you missed.";
    }

    /**
     * Get encouraging fail message
     */
    getFailMessage(percentage) {
        if (percentage >= 60) return "So close! Review the material and try again.";
        if (percentage >= 40) return "Good effort! Spend more time with the content.";
        return "No worries - learning takes practice. Review and retry!";
    }

    /**
     * Format seconds to mm:ss
     */
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    /**
     * Escape HTML for code display
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Trigger achievement (integrate with existing system)
     */
    triggerAchievement(achievementId) {
        // Check if AchievementManager exists
        if (typeof AchievementManager !== 'undefined') {
            AchievementManager.unlock(achievementId);
        } else {
            // Fallback: Store in localStorage
            const achievements = JSON.parse(localStorage.getItem('hexworth_achievements') || '[]');
            if (!achievements.includes(achievementId)) {
                achievements.push(achievementId);
                localStorage.setItem('hexworth_achievements', JSON.stringify(achievements));
                console.log(`Achievement unlocked: ${achievementId}`);
            }
        }
    }

    /**
     * Process quiz achievements based on results
     * Called after quiz completion to check and unlock various achievements
     */
    processQuizAchievements(results) {
        if (!results.passed) return;

        // Get and update quiz stats
        const stats = this.getQuizStats();
        stats.quizzesPassed++;
        stats.lastQuizDate = Date.now();

        // Track this specific quiz
        const quizId = this.config.achievement || this.config.title;
        if (!stats.quizzesCompleted.includes(quizId)) {
            stats.quizzesCompleted.push(quizId);
        }

        this.saveQuizStats(stats);

        // First Quiz Achievement
        if (stats.quizzesPassed === 1) {
            this.triggerAchievement('first_quiz');
        }

        // Perfect Score Achievement
        if (results.percentage === 100) {
            this.triggerAchievement('perfect_score');
        }

        // Quiz Master Achievements (cumulative)
        if (stats.quizzesPassed >= 10) {
            this.triggerAchievement('quiz_master_10');
        }
        if (stats.quizzesPassed >= 25) {
            this.triggerAchievement('quiz_master_25');
        }

        // Persistence Achievement (passed after 3+ attempts)
        if (results.attempts >= 3) {
            this.triggerAchievement('persistence');
        }

        // Speed Demon Achievement (timed quiz with 50%+ time remaining)
        if (this.config.timeLimit && this.state.timeRemaining) {
            const timeUsedPercent = ((this.config.timeLimit - this.state.timeRemaining) / this.config.timeLimit) * 100;
            if (timeUsedPercent <= 50) {
                this.triggerAchievement('speed_demon');
            }
        }
    }

    /**
     * Get quiz statistics from localStorage
     */
    getQuizStats() {
        try {
            const stats = JSON.parse(localStorage.getItem('hexworth_quiz_stats'));
            return stats || {
                quizzesPassed: 0,
                quizzesCompleted: [],
                perfectScores: 0,
                lastQuizDate: null
            };
        } catch {
            return {
                quizzesPassed: 0,
                quizzesCompleted: [],
                perfectScores: 0,
                lastQuizDate: null
            };
        }
    }

    /**
     * Save quiz statistics to localStorage
     */
    saveQuizStats(stats) {
        localStorage.setItem('hexworth_quiz_stats', JSON.stringify(stats));
    }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = QuizEngine;
}
