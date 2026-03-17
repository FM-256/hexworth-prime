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
     * Complete a module.
     *
     * IMPORTANT — Argument order convention: (houseId, moduleId, ...).
     * This matches the Firestore compound ID format "{house}-{module}" and is
     * consistent across ModuleProgress, FirestoreManager, and ProgressManager.
     * The `moduleId` here is the SHORT key (e.g. "security-quiz"), NOT the
     * compound ID (e.g. "shield-security-quiz"). The house prefix is added
     * internally when writing to Firestore.
     *
     * @param {string} houseId - The house ID (forge, shield, web, script, etc.)
     * @param {string} moduleId - The SHORT module key (no house prefix)
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
        const now = new Date().toISOString();
        progress[houseId][moduleId] = {
            completed: true,
            date: now,
            completedAt: now,
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

        // Show completion UI
        if (!silent) {
            showCompletionOverlay(houseId, moduleId);
        }

        console.log(`<img src="/assets/images/icons/icon-books.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle"> Module completed: ${houseId}/${moduleId}`);

        // Queue activity event for dashboard feed (always available)
        const prettyTitle = moduleId.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
        queueActivityEvent('module_complete', { moduleId, title: prettyTitle });
        // Also fire live if ActivityFeed is loaded (dashboard context)
        if (typeof ActivityFeed !== 'undefined') {
            ActivityFeed.moduleComplete(moduleId, prettyTitle);
        }

        // Arctic path override: if user came from Arctic, navigate directly
        if (returnToDashboard || returnUrl) {
            let arcticDest = null;
            try {
                const arcticNext = localStorage.getItem('hexworth_arctic_next');
                if (arcticNext) {
                    const parsed = JSON.parse(arcticNext);
                    if (parsed.href) arcticDest = parsed.href;
                    localStorage.removeItem('hexworth_arctic_next');
                }
            } catch (e) { /* ignore */ }

            // Only auto-navigate for Arctic paths — everything else gets the overlay
            if (arcticDest) {
                const navigateFn = () => { window.location.href = arcticDest; };
                if (silent) {
                    navigateFn();
                } else {
                    const timeout = new Promise(r => setTimeout(r, 8000));
                    Promise.race([syncPromise, timeout]).then(navigateFn, navigateFn);
                }
            }
        }

        return true;
    }

    /**
     * Complete a quiz with score.
     * Same (houseId, moduleId) convention as complete() — see note there.
     *
     * @param {string} houseId - The house ID
     * @param {string} quizId - The SHORT quiz key (no house prefix)
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
        const now = new Date().toISOString();
        progress[houseId][quizId] = {
            completed: passed,
            score: score,
            date: now,
            completedAt: now,
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
                Promise.race([syncPromise, timeout]).then(navigateFn, navigateFn);
            }
        }

        return passed;
    }

    /**
     * Check if user has completed any module
     */
    function hasCompletedAnyModule(progress) {
        for (const house of Object.values(progress)) {
            if (typeof house === 'object' && house !== null && !Array.isArray(house)) {
                for (const module of Object.values(house)) {
                    if (module && typeof module === 'object' && module.completed) return true;
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
            if (typeof house === 'object' && house !== null && !Array.isArray(house)) {
                for (const module of Object.values(house)) {
                    if (module && typeof module === 'object' && module.completed && module.score !== undefined) return true;
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
     * Detect navigation links from the page's nav footer.
     * Returns { nextUrl, nextLabel, courseHomeUrl, indexUrl }.
     */
    function detectNavLinks() {
        const result = { nextUrl: null, nextLabel: null, courseHomeUrl: null, indexUrl: null };

        // Look for nav-btn links in the footer
        const navBtns = document.querySelectorAll('.nav-footer a.nav-btn, .nav-btn.primary, a[class*="nav-btn"]');
        navBtns.forEach(a => {
            const text = (a.textContent || '').trim();
            const href = a.getAttribute('href');
            if (!href || a.classList.contains('disabled')) return;

            // "Next:" links
            if (/next/i.test(text) && !a.classList.contains('disabled')) {
                result.nextUrl = href;
                result.nextLabel = text.replace(/^Next:\s*/i, '').replace(/\s*>\s*$/, '').trim();
            }
        });

        // Look for index.html link (course home)
        const allLinks = document.querySelectorAll('a[href]');
        allLinks.forEach(a => {
            const href = a.getAttribute('href') || '';
            if (href === 'index.html' || href.endsWith('/index.html')) {
                result.indexUrl = href;
            }
        });

        // Derive course home from current path
        const path = window.location.pathname;
        const lastSlash = path.lastIndexOf('/');
        if (lastSlash > 0) {
            result.courseHomeUrl = path.substring(0, lastSlash + 1) + 'index.html';
        }

        return result;
    }

    /**
     * Show completion overlay with navigation choices.
     * Options: Next Module, Stay & Explore, Course Home, Dashboard
     */
    function showCompletionOverlay(houseId, moduleId) {
        // Inject styles if not present
        if (!document.getElementById('module-progress-styles')) {
            const styles = document.createElement('style');
            styles.id = 'module-progress-styles';
            styles.textContent = `
                .mp-overlay {
                    position: fixed;
                    inset: 0;
                    z-index: 100000;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: rgba(0, 0, 0, 0.75);
                    backdrop-filter: blur(4px);
                    animation: mpFadeIn 0.3s ease-out;
                }
                @keyframes mpFadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                .mp-card {
                    background: #161822;
                    border: 1px solid rgba(34, 197, 94, 0.3);
                    border-radius: 16px;
                    padding: 32px 40px;
                    text-align: center;
                    max-width: 420px;
                    width: 90%;
                    box-shadow: 0 0 60px rgba(34, 197, 94, 0.2);
                    animation: mpScaleIn 0.4s ease-out;
                }
                @keyframes mpScaleIn {
                    from { transform: scale(0.85); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
                .mp-check {
                    width: 56px;
                    height: 56px;
                    margin: 0 auto 16px;
                    background: linear-gradient(135deg, #22c55e, #16a34a);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 28px;
                    color: #fff;
                    font-weight: bold;
                }
                .mp-title {
                    font-size: 1.4rem;
                    font-weight: 700;
                    color: #22c55e;
                    margin-bottom: 6px;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                }
                .mp-subtitle {
                    font-size: 0.85rem;
                    color: #94a3b8;
                    margin-bottom: 24px;
                }
                .mp-actions {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                }
                .mp-btn {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    padding: 12px 20px;
                    border: none;
                    border-radius: 8px;
                    font-size: 0.9rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.15s;
                    font-family: inherit;
                    text-decoration: none;
                    color: #fff;
                }
                .mp-btn:hover { filter: brightness(1.15); transform: translateY(-1px); }
                .mp-btn-next {
                    background: linear-gradient(135deg, #22c55e, #16a34a);
                }
                .mp-btn-stay {
                    background: rgba(99, 102, 241, 0.2);
                    border: 1px solid rgba(99, 102, 241, 0.4);
                    color: #a5b4fc;
                }
                .mp-btn-course {
                    background: rgba(245, 158, 11, 0.15);
                    border: 1px solid rgba(245, 158, 11, 0.3);
                    color: #fbbf24;
                }
                .mp-btn-dash {
                    background: rgba(255, 255, 255, 0.06);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    color: #94a3b8;
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
                    animation: mpScaleIn 0.4s ease-out;
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

        const nav = detectNavLinks();

        // Build action buttons
        let actionsHtml = '';

        // Next Module (if available)
        if (nav.nextUrl) {
            const label = nav.nextLabel || 'Next Module';
            actionsHtml += `<a href="${nav.nextUrl}" class="mp-btn mp-btn-next">Next: ${label} &rarr;</a>`;
        }

        // Stay & Explore
        actionsHtml += `<button class="mp-btn mp-btn-stay" onclick="this.closest('.mp-overlay').remove()">Stay &amp; Explore</button>`;

        // Course Home
        if (nav.indexUrl || nav.courseHomeUrl) {
            const courseUrl = nav.indexUrl || nav.courseHomeUrl;
            actionsHtml += `<a href="${courseUrl}" class="mp-btn mp-btn-course">Course Home</a>`;
        }

        // Dashboard
        actionsHtml += `<a href="javascript:void(0)" class="mp-btn mp-btn-dash" onclick="ModuleProgress._goToDashboard()">Dashboard</a>`;

        const overlay = document.createElement('div');
        overlay.className = 'mp-overlay';
        overlay.innerHTML = `
            <div class="mp-card">
                <div class="mp-check">&check;</div>
                <div class="mp-title">Module Complete!</div>
                <div class="mp-subtitle">Progress saved. What's next?</div>
                <div class="mp-actions">
                    ${actionsHtml}
                </div>
            </div>
        `;

        document.body.appendChild(overlay);
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

    /**
     * Track module visit for "Continue Learning" on the dashboard.
     * Call from any module/lab page to record the user's last location.
     *
     * @param {string} houseId - House slug (e.g. 'script', 'shield')
     * @param {string} moduleId - Module slug (e.g. 'db-12-inner-join')
     * @param {object} [meta] - Optional: { section, returnUrl }
     */
    function trackVisit(houseId, moduleId, meta) {
        try {
            var title = document.title.split('|')[0].split(' — ')[0].trim();
            var entry = {
                houseId: houseId,
                moduleId: moduleId,
                title: title,
                url: location.pathname,
                section: (meta && meta.section) || '',
                returnUrl: (meta && meta.returnUrl) || '',
                timestamp: Date.now()
            };
            localStorage.setItem('hexworth_last_visited', JSON.stringify(entry));
        } catch (e) { /* silent */ }
    }

    // Public API
    return {
        complete,
        completeQuiz,
        getStats,
        getModuleProgress,
        isCompleted,
        updateStreak,
        trackVisit,
        _goToDashboard: navigateToDashboard
    };
})();

// Make globally available
if (typeof window !== 'undefined') {
    window.ModuleProgress = ModuleProgress;
}

// Auto-track page visit from URL pattern: /houses/{house}/.../{file}.html
// or /signal/..., /arena/..., /dispatch/..., etc.
// Deferred to DOMContentLoaded so document.title is available.
document.addEventListener('DOMContentLoaded', function autoTrackVisit() {
    try {
        var p = location.pathname;
        // Match module/lab pages under /houses/{house}/
        var m = p.match(/\/houses\/([^/]+)\//);
        var houseId = m ? m[1] : '';
        // Fallback: detect from other top-level sections
        if (!houseId) {
            if (p.indexOf('/signal/') !== -1) houseId = 'signal';
            else if (p.indexOf('/arena/') !== -1) houseId = 'arena';
            else if (p.indexOf('/dispatch/') !== -1) houseId = 'dispatch';
            else if (p.indexOf('/dark-arts/') !== -1) houseId = 'dark-arts';
            else return; // Not a trackable page
        }
        // Extract module ID from filename
        var file = p.split('/').pop().replace(/\.html$/, '');
        if (!file || file === 'index') return;
        // Derive section from path (e.g. "databases", "linux-mastery")
        var parts = p.split('/');
        var section = '';
        for (var i = parts.length - 2; i >= 0; i--) {
            if (parts[i] && parts[i] !== 'modules' && parts[i] !== 'houses' && parts[i] !== houseId) {
                section = parts[i].replace(/-/g, ' ').replace(/\b\w/g, function(c) { return c.toUpperCase(); });
                break;
            }
        }
        ModuleProgress.trackVisit(houseId, file, { section: section });
    } catch (e) { /* silent */ }
});
