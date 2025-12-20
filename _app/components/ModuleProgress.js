/**
 * ModuleProgress.js - Unified Module Completion Handler
 *
 * Handles:
 * - Saving module progress
 * - Triggering achievements (first_module, first_quiz)
 * - Updating learning streaks
 * - Tracking time spent
 *
 * Usage:
 *   ModuleProgress.complete('forge', 'windows-editions');
 *   ModuleProgress.completeQuiz('shield', 'security-quiz', 85);
 *
 * @author Hexworth Prime
 * @version 1.0.0
 */

const ModuleProgress = (function() {
    'use strict';

    const PROGRESS_KEY = 'hexworth_progress';
    const STREAK_KEY = 'hexworth_streak';
    const LAST_STUDY_KEY = 'hexworth_last_study';
    const MODULES_COMPLETED_KEY = 'hexworth_modules_completed';
    const QUIZZES_PASSED_KEY = 'hexworth_quizzes_passed';

    /**
     * Complete a module
     * @param {string} houseId - The house ID (forge, shield, web, etc.)
     * @param {string} moduleId - The module ID
     * @param {object} options - Additional options
     * @param {boolean} options.silent - Don't show notification
     * @param {boolean} options.returnToDashboard - Navigate to dashboard after
     * @param {number} options.timeSpent - Time spent in minutes
     */
    function complete(houseId, moduleId, options = {}) {
        const { silent = false, returnToDashboard = true, timeSpent = 0 } = options;

        // Load current progress
        const progress = JSON.parse(localStorage.getItem(PROGRESS_KEY) || '{}');
        progress[houseId] = progress[houseId] || {};

        // Check if this is first completion ever
        const isFirstModule = !hasCompletedAnyModule(progress);

        // Save this module's progress
        progress[houseId][moduleId] = {
            completed: true,
            date: new Date().toISOString(),
            timeSpent: timeSpent
        };

        localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));

        // Update completion counter
        const completedCount = parseInt(localStorage.getItem(MODULES_COMPLETED_KEY) || '0', 10);
        localStorage.setItem(MODULES_COMPLETED_KEY, (completedCount + 1).toString());

        // Update streak
        updateStreak();

        // Trigger achievements
        if (typeof AchievementManager !== 'undefined') {
            // First module ever
            if (isFirstModule) {
                AchievementManager.unlock('first_module');
            }

            // Check for explorer achievement (visited all houses)
            checkExplorerAchievement(progress);
        }

        // Show notification
        if (!silent) {
            showCompletionNotification(houseId, moduleId);
        }

        console.log(`📚 Module completed: ${houseId}/${moduleId}`);

        // Return to dashboard
        if (returnToDashboard) {
            setTimeout(() => {
                // Navigate relative to current location
                const depth = (window.location.pathname.match(/\//g) || []).length;
                const prefix = '../'.repeat(Math.max(0, depth - 2));
                window.location.href = prefix + 'dashboard.html';
            }, silent ? 0 : 1500);
        }

        return true;
    }

    /**
     * Complete a quiz with score
     * @param {string} houseId - The house ID
     * @param {string} quizId - The quiz ID
     * @param {number} score - Score percentage (0-100)
     * @param {object} options - Additional options
     */
    function completeQuiz(houseId, quizId, score, options = {}) {
        const { silent = false, returnToDashboard = true, passingScore = 70 } = options;

        const passed = score >= passingScore;

        // Load current progress
        const progress = JSON.parse(localStorage.getItem(PROGRESS_KEY) || '{}');
        progress[houseId] = progress[houseId] || {};

        // Check if this is first passing quiz ever
        const isFirstQuiz = passed && !hasPassedAnyQuiz(progress);

        // Save quiz progress
        progress[houseId][quizId] = {
            completed: passed,
            score: score,
            date: new Date().toISOString(),
            attempts: (progress[houseId][quizId]?.attempts || 0) + 1
        };

        localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));

        // Update quiz counter if passed
        if (passed) {
            const passedCount = parseInt(localStorage.getItem(QUIZZES_PASSED_KEY) || '0', 10);
            localStorage.setItem(QUIZZES_PASSED_KEY, (passedCount + 1).toString());

            // Update streak
            updateStreak();

            // Trigger achievements
            if (typeof AchievementManager !== 'undefined') {
                if (isFirstQuiz) {
                    AchievementManager.unlock('first_quiz');
                }
            }
        }

        // Show notification
        if (!silent) {
            showQuizNotification(passed, score);
        }

        console.log(`📝 Quiz completed: ${houseId}/${quizId} - Score: ${score}% (${passed ? 'PASS' : 'FAIL'})`);

        // Return to dashboard if passed
        if (returnToDashboard && passed) {
            setTimeout(() => {
                const depth = (window.location.pathname.match(/\//g) || []).length;
                const prefix = '../'.repeat(Math.max(0, depth - 2));
                window.location.href = prefix + 'dashboard.html';
            }, silent ? 0 : 2000);
        }

        return passed;
    }

    /**
     * Check if user has completed any module
     */
    function hasCompletedAnyModule(progress) {
        for (const house of Object.values(progress)) {
            if (typeof house === 'object') {
                for (const module of Object.values(house)) {
                    if (module.completed) return true;
                }
            }
        }
        return false;
    }

    /**
     * Check if user has passed any quiz
     */
    function hasPassedAnyQuiz(progress) {
        for (const house of Object.values(progress)) {
            if (typeof house === 'object') {
                for (const module of Object.values(house)) {
                    if (module.completed && module.score !== undefined) return true;
                }
            }
        }
        return false;
    }

    /**
     * Check for explorer achievement
     */
    function checkExplorerAchievement(progress) {
        const housesToVisit = ['web', 'shield', 'forge', 'script', 'cloud', 'code', 'key'];
        const visitedHouses = Object.keys(progress).filter(h =>
            housesToVisit.includes(h) &&
            Object.values(progress[h]).some(m => m.completed)
        );

        if (visitedHouses.length >= housesToVisit.length) {
            AchievementManager.unlock('explorer');
        }
    }

    /**
     * Update learning streak
     */
    function updateStreak() {
        const today = new Date().toDateString();
        const lastStudy = localStorage.getItem(LAST_STUDY_KEY);
        let streak = parseInt(localStorage.getItem(STREAK_KEY) || '0', 10);

        if (lastStudy === today) {
            // Already studied today, streak unchanged
            return streak;
        }

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        if (lastStudy === yesterday.toDateString()) {
            // Studied yesterday, increment streak
            streak++;
        } else if (lastStudy !== today) {
            // Streak broken, reset to 1
            streak = 1;
        }

        localStorage.setItem(STREAK_KEY, streak.toString());
        localStorage.setItem(LAST_STUDY_KEY, today);

        // Check streak achievements
        if (typeof AchievementManager !== 'undefined') {
            if (streak >= 3) AchievementManager.unlock('streak_3');
            if (streak >= 7) AchievementManager.unlock('streak_7');
            if (streak >= 30) AchievementManager.unlock('streak_30');
        }

        return streak;
    }

    /**
     * Show module completion notification
     */
    function showCompletionNotification(houseId, moduleId) {
        const notification = document.createElement('div');
        notification.className = 'module-complete-notification';
        notification.innerHTML = `
            <div class="mcn-icon">✓</div>
            <div class="mcn-text">Module Complete!</div>
            <div class="mcn-subtext">Progress saved</div>
        `;

        // Add styles if not present
        if (!document.getElementById('module-progress-styles')) {
            const styles = document.createElement('style');
            styles.id = 'module-progress-styles';
            styles.textContent = `
                .module-complete-notification {
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    background: linear-gradient(135deg, rgba(34, 197, 94, 0.95), rgba(22, 163, 74, 0.95));
                    border-radius: 16px;
                    padding: 30px 50px;
                    text-align: center;
                    z-index: 100000;
                    animation: mcnAppear 0.5s ease-out;
                    box-shadow: 0 0 50px rgba(34, 197, 94, 0.5);
                }

                @keyframes mcnAppear {
                    from { transform: translate(-50%, -50%) scale(0.5); opacity: 0; }
                    to { transform: translate(-50%, -50%) scale(1); opacity: 1; }
                }

                .mcn-icon {
                    font-size: 4rem;
                    margin-bottom: 10px;
                    animation: mcnBounce 0.5s ease-out 0.3s;
                }

                @keyframes mcnBounce {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.2); }
                }

                .mcn-text {
                    font-size: 1.5rem;
                    font-weight: bold;
                    color: #fff;
                    margin-bottom: 5px;
                }

                .mcn-subtext {
                    font-size: 0.9rem;
                    color: rgba(255,255,255,0.8);
                }

                .quiz-notification {
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    border-radius: 16px;
                    padding: 30px 50px;
                    text-align: center;
                    z-index: 100000;
                    animation: mcnAppear 0.5s ease-out;
                }

                .quiz-notification.passed {
                    background: linear-gradient(135deg, rgba(34, 197, 94, 0.95), rgba(22, 163, 74, 0.95));
                    box-shadow: 0 0 50px rgba(34, 197, 94, 0.5);
                }

                .quiz-notification.failed {
                    background: linear-gradient(135deg, rgba(239, 68, 68, 0.95), rgba(185, 28, 28, 0.95));
                    box-shadow: 0 0 50px rgba(239, 68, 68, 0.5);
                }

                .qn-score {
                    font-size: 3rem;
                    font-weight: bold;
                    color: #fff;
                    margin-bottom: 10px;
                }

                .qn-text {
                    font-size: 1.2rem;
                    color: #fff;
                }
            `;
            document.head.appendChild(styles);
        }

        document.body.appendChild(notification);
    }

    /**
     * Show quiz result notification
     */
    function showQuizNotification(passed, score) {
        const notification = document.createElement('div');
        notification.className = `quiz-notification ${passed ? 'passed' : 'failed'}`;
        notification.innerHTML = `
            <div class="qn-score">${score}%</div>
            <div class="qn-text">${passed ? 'Quiz Passed!' : 'Try Again'}</div>
        `;

        // Ensure styles are loaded
        if (!document.getElementById('module-progress-styles')) {
            showCompletionNotification('', ''); // Load styles
            document.querySelector('.module-complete-notification')?.remove();
        }

        document.body.appendChild(notification);

        if (!passed) {
            setTimeout(() => notification.remove(), 3000);
        }
    }

    /**
     * Get current stats
     */
    function getStats() {
        const progress = JSON.parse(localStorage.getItem(PROGRESS_KEY) || '{}');
        const streak = parseInt(localStorage.getItem(STREAK_KEY) || '0', 10);
        const modulesCompleted = parseInt(localStorage.getItem(MODULES_COMPLETED_KEY) || '0', 10);
        const quizzesPassed = parseInt(localStorage.getItem(QUIZZES_PASSED_KEY) || '0', 10);

        return {
            streak,
            modulesCompleted,
            quizzesPassed,
            progress
        };
    }

    /**
     * Get progress for a specific module
     */
    function getModuleProgress(houseId, moduleId) {
        const progress = JSON.parse(localStorage.getItem(PROGRESS_KEY) || '{}');
        return progress[houseId]?.[moduleId] || null;
    }

    /**
     * Check if a module is completed
     */
    function isCompleted(houseId, moduleId) {
        const module = getModuleProgress(houseId, moduleId);
        return module?.completed || false;
    }

    // Public API
    return {
        complete,
        completeQuiz,
        getStats,
        getModuleProgress,
        isCompleted,
        updateStreak
    };
})();

// Make globally available
if (typeof window !== 'undefined') {
    window.ModuleProgress = ModuleProgress;
}
