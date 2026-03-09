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

    let firestoreSyncReady = null; // Promise that resolves when deps are loaded

    /**
     * Queue an activity event for the dashboard ActivityFeed.
     * Module pages don't load ActivityFeed.js, so we write to a
     * localStorage queue that gets drained on dashboard load.
     */
    function queueActivityEvent(type, data) {
        try {
            const key = 'hexworth_activity_queue';
            const queue = JSON.parse(localStorage.getItem(key) || '[]');
            queue.push({ type, data, timestamp: Date.now() });
            // Cap queue at 50 to prevent unbounded growth
            if (queue.length > 50) queue.splice(0, queue.length - 50);
            localStorage.setItem(key, JSON.stringify(queue));
        } catch (e) {
            // Silent fail — activity logging is non-critical
        }
    }

    /**
     * Lazy-load Firebase/Firestore dependencies and sync to instructor dashboard.
     * Loads scripts once, caches the result, fails silently if offline or unauthenticated.
     */
    async function ensureFirestoreDeps() {
        if (typeof ProgressManager !== 'undefined' && ProgressManager.syncToFirestore) {
            return true;
        }

        // Determine components path relative to this script
        const scripts = document.querySelectorAll('script[src*="ModuleProgress"]');
        let basePath = '';
        if (scripts.length > 0) {
            const src = scripts[0].getAttribute('src');
            basePath = src.substring(0, src.lastIndexOf('/') + 1);
        }

        const deps = [
            'FirebaseAuth.js',
            'FirestoreManager.js',
            'ClassManager.js',
            'AssignmentManager.js',
            'ProgressManager.js'
        ];

        for (const dep of deps) {
            if (document.querySelector(`script[src*="${dep}"]`)) continue;
            await new Promise((resolve, reject) => {
                const s = document.createElement('script');
                s.src = basePath + dep;
                s.onload = resolve;
                s.onerror = () => reject(new Error(`Failed to load ${dep}`));
                document.head.appendChild(s);
            });
        }

        // Initialize FirebaseAuth and wait for auth state to resolve
        if (typeof FirebaseAuth !== 'undefined' && FirebaseAuth.init) {
            await FirebaseAuth.init();
            // Wait for auth state callback (up to 5s) if user not yet available
            if (!FirebaseAuth.getUser()) {
                await new Promise(resolve => {
                    const handler = () => {
                        window.removeEventListener('firebaseAuthStateChanged', handler);
                        resolve();
                    };
                    window.addEventListener('firebaseAuthStateChanged', handler);
                    setTimeout(() => {
                        window.removeEventListener('firebaseAuthStateChanged', handler);
                        resolve();
                    }, 5000);
                });
            }
        }

        return typeof ProgressManager !== 'undefined' && ProgressManager.syncToFirestore;
    }

    /**
     * Push completion to user's Firestore profile for cross-device sync.
     * Non-blocking, fails silently if offline or not signed in.
     */
    function pushToUserProfile(houseId, moduleId, type, metadata = {}) {
        try {
            if (typeof FirestoreManager === 'undefined' || typeof FirebaseAuth === 'undefined') return;
            const user = FirebaseAuth.getUser();
            if (!user) return;
            const fullId = `${houseId}-${moduleId}`;
            if (type === 'quiz' && metadata.score != null) {
                FirestoreManager.passQuiz(user.uid, fullId, metadata.score, houseId).catch(() => {});
            } else if (type === 'lab') {
                FirestoreManager.completeLab(user.uid, fullId, houseId).catch(() => {});
            } else {
                FirestoreManager.completeModule(user.uid, fullId, houseId).catch(() => {});
            }
        } catch (e) {
            // Silent fail - local progress is already saved
        }
    }

    function tryFirestoreSync(moduleId, houseId, moduleType, metadata) {
        if (!firestoreSyncReady) {
            firestoreSyncReady = ensureFirestoreDeps().catch(() => false);
        }

        // Return a promise so callers can wait for sync before redirecting
        return firestoreSyncReady.then(ready => {
            if (!ready) {
                console.warn('[ModuleProgress] Firestore deps not available, sync skipped');
                return;
            }
            return ProgressManager.syncToFirestore(moduleId, houseId, moduleType, metadata);
        }).catch(err => {
            console.warn('[ModuleProgress] Firestore sync skipped:', err.message);
        });
    }

    /**
     * Navigate to dashboard with relative path detection
     */
    function navigateToDashboard() {
        const depth = (window.location.pathname.match(/\//g) || []).length;
        const prefix = '../'.repeat(Math.max(0, depth - 1));
        window.location.href = prefix + 'dashboard.html';
    }

    // ═══════════════════════════════════════════════════════════════
    // STRUCTURED FORMAT BRIDGE
    // HouseProgressPanel reads from progress.houses[houseId].modulesCompleted
    // and progress.completedModules — the structured format that
    // ProgressManager writes. ModuleProgress historically only wrote
    // flat format (progress[houseId][moduleId] = { completed: true }).
    // These bridge functions ensure both formats stay in sync so
    // "Continue Learning" advances correctly and XP is awarded
    // even when ProgressManager.js hasn't been loaded on the page.
    // ═══════════════════════════════════════════════════════════════

    /**
     * Bridge to ProgressManager structured format.
     * Awards XP and recalculates level on first completion.
     */
    function bridgeStructuredProgress(progress, houseId, moduleId, moduleType, metadata) {
        if (!Array.isArray(progress.completedModules)) progress.completedModules = [];
        if (!progress.houses) progress.houses = {};
        if (!progress.houses[houseId]) {
            progress.houses[houseId] = {
                unlocked: true,
                modulesCompleted: [],
                quizzesPassed: [],
                labsCompleted: [],
                currentModule: null,
                progressPercent: 0,
                lastAccessed: null
            };
        }

        const house = progress.houses[houseId];
        if (!Array.isArray(house.modulesCompleted)) house.modulesCompleted = [];
        house.lastAccessed = Date.now();

        // Track completion counts for diminishing XP
        if (!progress.completionCounts) progress.completionCounts = {};
        const prevCount = progress.completionCounts[moduleId] || 0;
        progress.completionCounts[moduleId] = prevCount + 1;

        const isFirstCompletion = !progress.completedModules.includes(moduleId);

        if (isFirstCompletion) {
            // First completion: push to arrays + full XP
            progress.completedModules.push(moduleId);
            if (!house.modulesCompleted.includes(moduleId)) {
                house.modulesCompleted.push(moduleId);
            }

            // Track type-specific lists
            if (moduleType === 'quiz') {
                if (!Array.isArray(house.quizzesPassed)) house.quizzesPassed = [];
                if (!house.quizzesPassed.includes(moduleId)) house.quizzesPassed.push(moduleId);
            } else if (moduleType === 'lab') {
                if (!Array.isArray(house.labsCompleted)) house.labsCompleted = [];
                if (!house.labsCompleted.includes(moduleId)) house.labsCompleted.push(moduleId);
                if (!Array.isArray(progress.labsCompleted)) progress.labsCompleted = [];
                if (!progress.labsCompleted.includes(moduleId)) progress.labsCompleted.push(moduleId);
            }

            // Award full XP (mirrors ProgressManager.XP_REWARDS)
            const XP_BY_TYPE = {
                presentation: 100, tool: 100, applet: 100,
                quiz: 100, lab: 500, module: 1000
            };
            let xpReward = XP_BY_TYPE[moduleType] || XP_BY_TYPE.presentation;

            // Quiz scoring: 70-89% = 100 XP, 90%+ = 200 XP
            if (moduleType === 'quiz' && metadata && metadata.score >= 90) {
                xpReward = 200;
            }

            progress.xp = (Number(progress.xp) || 0) + xpReward;
            progress.level = calculateLevelFromXP(progress.xp);
        } else {
            // Repeat completion — quizzes are one-and-done
            if (moduleType === 'quiz') return;

            // Non-quiz repeat: award diminishing XP
            const XP_BY_TYPE = { presentation: 100, tool: 100, applet: 100, lab: 500 };
            const baseXP = XP_BY_TYPE[moduleType] || XP_BY_TYPE.presentation;
            const repeatXP = Math.floor(baseXP * Math.pow(0.5, prevCount));
            if (repeatXP > 0) {
                progress.xp = (Number(progress.xp) || 0) + repeatXP;
                progress.level = calculateLevelFromXP(progress.xp);
            }
        }
    }

    /**
     * Bridge to CompletionStamp system.
     * Writes directly to hexworth_completion_stamps localStorage.
     * Per-module stamps are visual tracking only (no XP).
     * House mastery XP (500k) is awarded by ProgressManager when
     * all modules in a house path are completed.
     */
    function bridgeCompletionStamp(houseId, moduleId, score) {
        const STAMP_KEY = 'hexworth_completion_stamps';

        try {
            const stamps = JSON.parse(localStorage.getItem(STAMP_KEY) || '{}');
            const stampId = houseId + '-' + moduleId;

            if (stamps[stampId] && stamps[stampId].completed) return;

            stamps[stampId] = {
                completed: true,
                timestamp: new Date().toISOString(),
                score: (typeof score === 'number') ? score : null
            };
            localStorage.setItem(STAMP_KEY, JSON.stringify(stamps));

            window.dispatchEvent(new CustomEvent('completionStamp:marked', {
                detail: { moduleId: stampId, score }
            }));
        } catch (e) {
            console.warn('[ModuleProgress] CompletionStamp bridge failed:', e.message);
        }
    }

    /**
     * Calculate level from XP (mirrors ProgressManager formula, uncapped)
     * Formula inverse: N = floor((1 + sqrt(1 + xp/12.5)) / 2)
     */
    function calculateLevelFromXP(xp) {
        if (!xp || xp <= 0) return 1;
        return Math.max(1, Math.floor((1 + Math.sqrt(1 + xp / 12.5)) / 2));
    }

    /**
     * Complete a module
     * @param {string} houseId - The house ID (forge, shield, web, etc.)
     * @param {string} moduleId - The module ID
     * @param {object} options - Additional options
     * @param {boolean} options.silent - Don't show notification
     * @param {boolean} options.returnToDashboard - Navigate to dashboard after
     * @param {string} options.returnUrl - Custom URL to navigate to instead of dashboard
     * @param {number} options.timeSpent - Time spent in minutes
     */
    function complete(houseId, moduleId, options = {}) {
        const { silent = false, returnToDashboard = true, returnUrl = null, timeSpent = 0, type = 'presentation' } = options;

        // Load current progress
        const progress = JSON.parse(localStorage.getItem(PROGRESS_KEY) || '{}');
        progress[houseId] = progress[houseId] || {};

        // Detect if this is a first completion (before bridge mutates arrays)
        const isFirstCompletion = !Array.isArray(progress.completedModules)
            || !progress.completedModules.includes(moduleId);

        // Check if this is first completion ever
        const isFirstModule = !hasCompletedAnyModule(progress);

        // Save this module's progress (flat format)
        progress[houseId][moduleId] = {
            completed: true,
            date: new Date().toISOString(),
            timeSpent: timeSpent
        };

        // Bridge to ProgressManager structured format (XP, levels, house progress)
        bridgeStructuredProgress(progress, houseId, moduleId, type);

        // Bridge to CompletionStamp system (visual tracking)
        bridgeCompletionStamp(houseId, moduleId, null);

        localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));

        // Sync to Firestore for instructor dashboard
        const syncPromise = tryFirestoreSync(moduleId, houseId, 'presentation', {});

        // Push to user's Firestore profile (cross-device sync)
        // Only on first completion — CF FieldValue.increment isn't diminishing-aware
        if (isFirstCompletion) {
            pushToUserProfile(houseId, moduleId, type || 'presentation');
        }

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

        console.log(`<img src="/assets/images/icons/icon-books.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle"> Module completed: ${houseId}/${moduleId}`);

        // Queue activity event for dashboard feed (always available)
        const prettyTitle = moduleId.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
        queueActivityEvent('module_complete', { moduleId, title: prettyTitle });
        // Also fire live if ActivityFeed is loaded (dashboard context)
        if (typeof ActivityFeed !== 'undefined') {
            ActivityFeed.moduleComplete(moduleId, prettyTitle);
        }

        // Return to destination — wait for Firestore sync first (max 8s timeout)
        // Arctic path override: if user came from Arctic, go to next module in sequence
        if (returnToDashboard || returnUrl) {
            let destination = returnUrl || null;
            try {
                const arcticNext = localStorage.getItem('hexworth_arctic_next');
                if (arcticNext) {
                    const parsed = JSON.parse(arcticNext);
                    if (parsed.href) {
                        destination = parsed.href;
                    }
                    localStorage.removeItem('hexworth_arctic_next');
                }
            } catch (e) { /* ignore */ }

            const navigateFn = destination
                ? () => { window.location.href = destination; }
                : navigateToDashboard;
            if (silent) {
                navigateFn();
            } else {
                const timeout = new Promise(r => setTimeout(r, 8000));
                Promise.race([syncPromise, timeout]).then(() => navigateFn());
            }
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
        const { silent = false, returnToDashboard = true, returnUrl = null, passingScore = 70 } = options;

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

        // Bridge to ProgressManager structured format (XP, levels, house progress)
        if (passed) {
            bridgeStructuredProgress(progress, houseId, quizId, 'quiz', { score });
            bridgeCompletionStamp(houseId, quizId, score);
        }

        localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));

        // Sync to Firestore for instructor dashboard
        const syncPromise = tryFirestoreSync(quizId, houseId, 'quiz', { score });

        // Push to user's Firestore profile (cross-device sync)
        if (passed) {
            pushToUserProfile(houseId, quizId, 'quiz', { score });
        }

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

        console.log(`<img src="/assets/images/icons/icon-notepad.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle"> Quiz completed: ${houseId}/${quizId} - Score: ${score}% (${passed ? 'PASS' : 'FAIL'})`);

        // Queue activity event for dashboard feed
        if (passed) {
            const quizTitle = quizId.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
            queueActivityEvent('module_complete', { moduleId: quizId, title: `${quizTitle} (${score}%)` });
        }

        // Return to destination if passed — wait for Firestore sync first (max 8s timeout)
        if ((returnToDashboard || returnUrl) && passed) {
            const navigateFn = returnUrl
                ? () => { window.location.href = returnUrl; }
                : navigateToDashboard;
            if (silent) {
                navigateFn();
            } else {
                const timeout = new Promise(r => setTimeout(r, 8000));
                Promise.race([syncPromise, timeout]).then(() => navigateFn());
            }
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
