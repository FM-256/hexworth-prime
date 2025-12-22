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
            onQuestionAnswer: config.onQuestionAnswer || null
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

        // Trigger achievement if passed
        if (results.passed && this.config.achievement) {
            this.triggerAchievement(this.config.achievement);
        }

        // Callback
        if (this.config.onComplete) {
            this.config.onComplete(results);
        }

        this.renderResults(results, timedOut);
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

                    ${results.passed && this.config.achievement ? `
                        <div class="results-achievement">
                            🏆 Achievement Unlocked: <strong>${this.config.achievement}</strong>
                        </div>
                    ` : ''}

                    <div class="results-actions">
                        ${this.config.retryAllowed ? `
                            <button class="quiz-btn quiz-retry-btn">${results.passed ? 'Try Again' : 'Retry Challenge'}</button>
                        ` : ''}
                        <button class="quiz-btn quiz-review-btn">Review Answers</button>
                    </div>
                </div>
            </div>
        `;

        // Attach event listeners
        const retryBtn = this.container.querySelector('.quiz-retry-btn');
        if (retryBtn) {
            retryBtn.addEventListener('click', () => this.start());
        }

        const reviewBtn = this.container.querySelector('.quiz-review-btn');
        if (reviewBtn) {
            reviewBtn.addEventListener('click', () => this.renderReview(results));
        }
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
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = QuizEngine;
}
