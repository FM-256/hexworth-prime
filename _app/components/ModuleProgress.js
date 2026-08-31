/**
 * ModuleProgress.js - Unified Module Completion Handler
 *
 * Core completion tracking component for Hexworth Prime. Every module, quiz,
 * lab, and presentation calls into this IIFE to record progress. It is the
 * single source of truth for "did the student finish this thing?"
 *
 * == Architecture ==
 * ModuleProgress writes to TWO localStorage formats simultaneously:
 *   1. FLAT format:   progress[houseId][moduleId] = { completed, date, score, ... }
 *      - Legacy format, still read by older pages and some quiz UIs
 *   2. STRUCTURED format: progress.houses[houseId].modulesCompleted = [...]
 *      - Used by HouseProgressPanel, XP/leveling, and the dashboard
 *      - Bridged here so pages that don't load ProgressManager.js still update it
 *
 * It also syncs to three remote destinations (all non-blocking, fail-silent):
 *   - Firestore user profile (cross-device sync via FirestoreManager)
 *   - Firestore instructor dashboard (via ProgressManager.syncToFirestore)
 *   - Tenant class progress (via syncClassProgress Cloud Function)
 *
 * == Public API ==
 *   ModuleProgress.complete(houseId, moduleId, options)   - Mark a module done
 *   ModuleProgress.completeQuiz(houseId, quizId, score, options) - Mark quiz done
 *   ModuleProgress.isCompleted(houseId, moduleId)         - Check completion
 *   ModuleProgress.getModuleProgress(houseId, moduleId)   - Get full record
 *   ModuleProgress.getStats()                             - Streak, counts, progress
 *   ModuleProgress.updateStreak()                         - Manually bump streak
 *   ModuleProgress.trackVisit(houseId, moduleId, meta)    - Record last location
 *   ModuleProgress._goToDashboard()                       - Navigate to dashboard
 *
 * == Side Effects ==
 *   - Writes to localStorage keys: hexworth_progress, hexworth_streak,
 *     hexworth_last_study, hexworth_modules_completed, hexworth_quizzes_passed,
 *     hexworth_activity_queue, hexworth_completion_stamps, hexworth_last_visited
 *   - Lazy-loads Firebase/Firestore scripts into <head> when syncing
 *   - Injects CSS styles and DOM overlay for completion UI
 *   - Dispatches 'completionStamp:marked' CustomEvent on window
 *   - Auto-tracks page visits on DOMContentLoaded
 *   - Auto-loads TenantRouter.js / TenantShell.js if tenant context is active
 *
 * @author Hexworth Prime
 * @version 1.0.0
 */

const ModuleProgress = (function() {
    'use strict';

    // ── localStorage Key Constants ──────────────────────────────
    // Central registry of all keys this module owns. Other components
    // (dashboard, HouseProgressPanel) read these but never write them.
    const PROGRESS_KEY = 'hexworth_progress';           // Main progress blob (flat + structured)
    const STREAK_KEY = 'hexworth_streak';               // Consecutive study-day count
    const LAST_STUDY_KEY = 'hexworth_last_study';       // Date string of last study day
    const MODULES_COMPLETED_KEY = 'hexworth_modules_completed'; // Lifetime module count
    const QUIZZES_PASSED_KEY = 'hexworth_quizzes_passed';       // Lifetime passed-quiz count

    // Cached promise for Firestore dependency loading, initialized once on first sync
    let firestoreSyncReady = null; // Promise that resolves when deps are loaded

    /**
     * Queue an activity event for the dashboard ActivityFeed.
     * Module pages don't load ActivityFeed.js, so we write to a
     * localStorage queue that gets drained on dashboard load.
     *
     * @param {string} type - Event type (e.g. 'module_complete')
     * @param {object} data - Event payload (moduleId, title, etc.)
     * @sideeffect Writes to localStorage key 'hexworth_activity_queue'
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
            // Silent fail: activity logging is non-critical
        }
    }

    /**
     * Lazy-load Firebase/Firestore dependencies and sync to instructor dashboard.
     * Loads scripts once, caches the result, fails silently if offline or unauthenticated.
     *
     * Loads these scripts in order (skipping any already present):
     *   FirebaseAuth -> FirestoreManager -> ClassManager -> AssignmentManager -> ProgressManager
     *
     * After loading, initializes FirebaseAuth and waits up to 5s for auth state
     * to resolve (the user may not be signed in yet when this runs).
     *
     * @returns {Promise<boolean>} true if ProgressManager.syncToFirestore is available
     * @sideeffect Injects up to 5 <script> tags into <head>
     */
    /**
     * The ONE memoized "Firestore deps are loaded" promise.
     *
     * Exists because two separate places need it and one of them lives in a DIFFERENT top-level
     * IIFE (reconcileProgressBootstrap, further down this file). That IIFE cannot see
     * `firestoreSyncReady` or `ensureFirestoreDeps`: they are locals of this one, so it was
     * throwing `ReferenceError: firestoreSyncReady is not defined` on every auth-state change,
     * silently killing the cloud pull on sign-in (BUG-072). It reaches this via the exported
     * `_ensureFirestoreReady` instead.
     *
     * Sharing the single memo also matters: two independent caches would load the Firebase
     * deps twice.
     */
    function ensureFirestoreReady() {
        if (!firestoreSyncReady) {
            firestoreSyncReady = ensureFirestoreDeps().catch(() => false);
        }
        return firestoreSyncReady;
    }

    async function ensureFirestoreDeps() {
        // Short-circuit if ProgressManager is already loaded from another path
        if (typeof ProgressManager !== 'undefined' && ProgressManager.syncToFirestore) {
            return true;
        }

        // Determine components path relative to this script's location,
        // so it works regardless of how deep the calling page is nested
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

        // Load each dependency sequentially (order matters: ProgressManager needs FirebaseAuth)
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
     *
     * Routes to the appropriate FirestoreManager method based on type:
     *   - 'quiz' -> passQuiz (includes score)
     *   - 'lab'  -> completeLab
     *   - other  -> completeModule
     *
     * The compound ID "{houseId}-{moduleId}" is constructed here. Callers
     * pass the short moduleId only.
     *
     * @param {string} houseId - House slug
     * @param {string} moduleId - Short module key
     * @param {string} type - 'quiz', 'lab', or 'presentation'
     * @param {object} metadata - Extra data (e.g. { score } for quizzes)
     * @sideeffect Writes to Firestore users/{uid}/progress document
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

    /**
     * [TENANT] Sync completion to tenant class progress (if student is enrolled).
     *
     * Reads tenant/class context from sessionStorage (set by the tenant lobby
     * when a student enters a class) or localStorage (fallback for older sessions).
     * Calls the syncClassProgress Cloud Function so the instructor's class
     * dashboard reflects the student's progress in real time.
     *
     * This is a no-op if the student is not in a tenant class context.
     *
     * @param {string} moduleId - Short module key
     * @param {string} moduleType - 'module', 'quiz', 'lab', etc.
     * @param {object} metadata - { score } for quizzes, empty otherwise
     * @sideeffect Calls syncClassProgress Cloud Function (Firestore write server-side)
     */
    function tryClassProgressSync(moduleId, moduleType, metadata) {
        try {
            // Build payload. Tenant/class info is optional. The CF looks up
            // the student's enrollment from Firestore (enrollments/{uid}) if
            // not provided. This eliminates the localStorage dependency.
            var payload = {
                moduleId: moduleId,
                type: moduleType || 'module',
                score: metadata && metadata.score != null ? metadata.score : undefined
            };

            // Include tenant/class if available in storage (speeds up CF, skips lookup)
            var tenantRaw = sessionStorage.getItem('hexworth_tenant') || localStorage.getItem('hexworth_tenant') || localStorage.getItem('hexworth_tenant_slug');
            if (tenantRaw) {
                try { payload.tenantSlug = JSON.parse(tenantRaw).slug; } catch(e) { payload.tenantSlug = tenantRaw; }
            }
            var classId = sessionStorage.getItem('hexworth_class') || localStorage.getItem('hexworth_class_id');
            if (classId) payload.classId = classId;

            // If FirebaseAuth is already loaded, call immediately
            if (typeof FirebaseAuth !== 'undefined' && FirebaseAuth.callFunction) {
                FirebaseAuth.callFunction('syncClassProgress', payload).catch(function(err) {
                    console.warn('[ModuleProgress] Class progress sync failed:', err.message);
                });
            } else {
                // Lazy-load FirebaseAuth for tenant students on pages that don't
                // include it directly (e.g., Network+ content after FluxCapacitor removal).
                // This ensures progress syncs to Firestore even without FluxCapacitor.
                // Poll for readiness, then sync.
                var callWhenReady = function() {
                    var attempts = 0;
                    var waitForAuth = setInterval(function() {
                        attempts++;
                        if (typeof FirebaseAuth !== 'undefined' && FirebaseAuth.callFunction) {
                            clearInterval(waitForAuth);
                            FirebaseAuth.callFunction('syncClassProgress', payload).catch(function(err) {
                                console.warn('[ModuleProgress] Class progress sync failed:', err.message);
                            });
                        } else if (attempts > 20) {
                            // Give up after ~4 seconds; do not block the page
                            clearInterval(waitForAuth);
                            console.warn('[ModuleProgress] FirebaseAuth did not initialize in time');
                        }
                    }, 200);
                };
                // Guard against a duplicate <script> tag: another loader (e.g.
                // ObservatoryTelemetry) may already have appended FirebaseAuth.js. A second
                // tag would re-execute FirebaseAuth's top-level `const` declaration and throw
                // a SyntaxError into the page. If a tag exists, just wait for it; matches the
                // querySelector guard already used by ensureFirestoreDeps above.
                if (document.querySelector('script[src*="FirebaseAuth.js"]')) {
                    callWhenReady();
                } else {
                    var script = document.createElement('script');
                    script.src = '/components/FirebaseAuth.js';
                    script.onload = callWhenReady;
                    script.onerror = function() {
                        console.warn('[ModuleProgress] Failed to lazy-load FirebaseAuth.js');
                    };
                    document.head.appendChild(script);
                }
            }
        } catch (e) {
            // Silent fail: localStorage progress is already saved
        }
    }

    /**
     * Sync completion to Firestore for the instructor dashboard.
     *
     * Lazily loads all Firebase dependencies on first call (ensureFirestoreDeps),
     * then delegates to ProgressManager.syncToFirestore. Returns a promise so
     * callers (complete/completeQuiz) can wait for sync before navigating away,
     * preventing data loss on fast page transitions.
     *
     * @param {string} moduleId - Short module key
     * @param {string} houseId - House slug
     * @param {string} moduleType - 'presentation', 'quiz', 'lab'
     * @param {object} metadata - Extra data (e.g. { score })
     * @returns {Promise<void>} Resolves when sync completes or fails
     * @sideeffect May inject Firebase scripts; writes to Firestore
     */
    function tryFirestoreSync(moduleId, houseId, moduleType, metadata) {
        // Return a promise so callers can wait for sync before redirecting
        return ensureFirestoreReady().then(ready => {
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
     * [TENANT] Navigate to dashboard with relative path detection.
     * Tenant users go to their tenant hub instead of the Hexworth Prime dashboard.
     *
     * For non-tenant users, calculates the relative path to dashboard.html based
     * on the current URL depth (number of path segments).
     *
     * @sideeffect Sets window.location.href (page navigation)
     */
    function navigateToDashboard() {
        // Tenant routing: go to tenant hub if active
        if (typeof TenantRouter !== 'undefined' && TenantRouter.isActive()) {
            window.location.href = TenantRouter.getUrl('dashboard');
            return;
        }
        // Count slashes in path to determine how many "../" we need
        const depth = (window.location.pathname.match(/\//g) || []).length;
        const prefix = '../'.repeat(Math.max(0, depth - 1));
        window.location.href = prefix + 'dashboard.html';
    }

    // ═══════════════════════════════════════════════════════════════
    // STRUCTURED FORMAT BRIDGE
    // HouseProgressPanel reads from progress.houses[houseId].modulesCompleted
    // and progress.completedModules, the structured format that
    // ProgressManager writes. ModuleProgress historically only wrote
    // flat format (progress[houseId][moduleId] = { completed: true }).
    // These bridge functions ensure both formats stay in sync so
    // "Continue Learning" advances correctly and XP is awarded
    // even when ProgressManager.js hasn't been loaded on the page.
    // ═══════════════════════════════════════════════════════════════

    /**
     * Bridge flat progress writes to ProgressManager's structured format.
     * Awards XP and recalculates level on first completion. On repeat
     * completions, awards diminishing XP (50% decay per repeat).
     *
     * This exists because module pages load ModuleProgress but NOT
     * ProgressManager, yet the dashboard reads the structured format.
     * Without this bridge, completing a module wouldn't update XP or
     * house progress until the student returned to the dashboard.
     *
     * == XP Reward Table (first completion) ==
     *   presentation/tool/applet: 100 XP
     *   quiz (70-89%): 100 XP | quiz (90%+): 200 XP
     *   lab: 500 XP
     *   module: 1000 XP
     *
     * == Repeat Completion ==
     *   Quizzes: no repeat XP (one-and-done)
     *   Others: baseXP * 0.5^repeatCount (diminishing returns)
     *
     * @param {object} progress - The full progress object (mutated in place)
     * @param {string} houseId - House slug
     * @param {string} moduleId - Short module key
     * @param {string} moduleType - 'presentation', 'quiz', 'lab', 'tool', 'applet', 'module'
     * @param {object} [metadata] - { score } for quizzes
     * @sideeffect Mutates the progress object (caller must save to localStorage)
     */
    function bridgeStructuredProgress(progress, houseId, moduleId, moduleType, metadata) {
        // Initialize structured arrays if missing (first-ever completion)
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

        // Track per-module completion count for diminishing XP calculation
        if (!progress.completionCounts) progress.completionCounts = {};
        const prevCount = progress.completionCounts[moduleId] || 0;
        progress.completionCounts[moduleId] = prevCount + 1;

        const isFirstCompletion = !progress.completedModules.includes(moduleId);

        if (isFirstCompletion) {
            // First completion: push to global + house arrays, award full XP
            progress.completedModules.push(moduleId);
            if (!house.modulesCompleted.includes(moduleId)) {
                house.modulesCompleted.push(moduleId);
            }

            // Track type-specific lists (used by house progress panels)
            if (moduleType === 'quiz') {
                if (!Array.isArray(house.quizzesPassed)) house.quizzesPassed = [];
                if (!house.quizzesPassed.includes(moduleId)) house.quizzesPassed.push(moduleId);
            } else if (moduleType === 'lab') {
                if (!Array.isArray(house.labsCompleted)) house.labsCompleted = [];
                if (!house.labsCompleted.includes(moduleId)) house.labsCompleted.push(moduleId);
                // Labs also tracked at top-level for cross-house lab counting
                if (!Array.isArray(progress.labsCompleted)) progress.labsCompleted = [];
                if (!progress.labsCompleted.includes(moduleId)) progress.labsCompleted.push(moduleId);
            }

            // Award full XP (mirrors ProgressManager.XP_REWARDS, keep in sync!)
            const XP_BY_TYPE = {
                presentation: 100, tool: 100, applet: 100,
                quiz: 100, lab: 500, module: 1000
            };
            let xpReward = XP_BY_TYPE[moduleType] || XP_BY_TYPE.presentation;

            // Quiz scoring bonus: 90%+ gets double XP as excellence incentive
            if (moduleType === 'quiz' && metadata && metadata.score >= 90) {
                xpReward = 200;
            }

            progress.xp = (Number(progress.xp) || 0) + xpReward;
            progress.level = calculateLevelFromXP(progress.xp);
        } else {
            // Repeat completion: quizzes are one-and-done (no re-farming XP)
            if (moduleType === 'quiz') return;

            // Non-quiz repeat: award diminishing XP using exponential decay
            // e.g. 2nd time = 50%, 3rd = 25%, 4th = 12.5%, ...
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
     *
     * Stamps use compound IDs ("{houseId}-{moduleId}") and are read by
     * course hub pages to show checkmarks next to completed items.
     *
     * @param {string} houseId - House slug
     * @param {string} moduleId - Short module key
     * @param {number|null} score - Quiz score or null for non-quiz modules
     * @sideeffect Writes to localStorage 'hexworth_completion_stamps'
     * @sideeffect Dispatches 'completionStamp:marked' CustomEvent
     */
    function bridgeCompletionStamp(houseId, moduleId, score) {
        const STAMP_KEY = 'hexworth_completion_stamps';

        try {
            const stamps = JSON.parse(localStorage.getItem(STAMP_KEY) || '{}');
            const stampId = houseId + '-' + moduleId;

            // Don't overwrite existing stamps (idempotent)
            if (stamps[stampId] && stamps[stampId].completed) return;

            stamps[stampId] = {
                completed: true,
                timestamp: new Date().toISOString(),
                score: (typeof score === 'number') ? score : null
            };
            localStorage.setItem(STAMP_KEY, JSON.stringify(stamps));

            // Notify any listening UI (e.g. course hub sidebar) of the new stamp
            window.dispatchEvent(new CustomEvent('completionStamp:marked', {
                detail: { moduleId: stampId, score }
            }));
        } catch (e) {
            console.warn('[ModuleProgress] CompletionStamp bridge failed:', e.message);
        }
    }

    /**
     * Calculate level from XP (mirrors ProgressManager formula, uncapped).
     *
     * Uses the inverse of the triangular number formula:
     *   XP needed for level N = 25 * N * (N - 1)
     *   Solving for N: N = floor((1 + sqrt(1 + xp/12.5)) / 2)
     *
     * This is duplicated here (rather than calling ProgressManager) because
     * ProgressManager may not be loaded on module pages.
     *
     * @param {number} xp - Total XP earned
     * @returns {number} Current level (minimum 1)
     */
    function calculateLevelFromXP(xp) {
        if (!xp || xp <= 0) return 1;
        return Math.max(1, Math.floor((1 + Math.sqrt(1 + xp / 12.5)) / 2));
    }

    /**
     * Complete a module (presentation, tool, applet, or generic content).
     *
     * This is the primary entry point called by every completable page.
     * It orchestrates the full completion pipeline:
     *   1. Write flat progress to localStorage
     *   2. Bridge to structured format (XP, levels, house arrays)
     *   3. Bridge to CompletionStamp (visual checkmarks)
     *   4. Sync to Firestore (instructor dashboard + user profile)
     *   5. Sync to tenant class progress (if enrolled)
     *   6. Update streak + achievement checks
     *   7. Show completion overlay UI
     *   8. Queue activity event for dashboard feed
     *   9. Handle Arctic path auto-navigation (if applicable)
     *
     * IMPORTANT: Argument order convention: (houseId, moduleId, ...).
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
     * @param {string} options.type - Content type ('presentation', 'tool', 'lab', etc.)
     * @returns {boolean} Always returns true (completion always succeeds locally)
     * @sideeffect Writes to multiple localStorage keys (see file header)
     * @sideeffect May inject DOM overlay and CSS styles
     * @sideeffect May trigger Firestore writes (non-blocking)
     * @sideeffect May navigate away (Arctic path or returnUrl)
     */
    function complete(houseId, moduleId, options = {}) {
        const { silent = false, returnToDashboard = true, returnUrl = null, timeSpent = 0, type = 'presentation' } = options;

        // FAIL LOUDLY, BEFORE ANY WRITE. Prospective guard only. After BUG-045 there is
        // exactly ZERO one-arg caller left in the repo (grepped), so this protects against a
        // future regression, not a current fragility. It deliberately BAILS rather than
        // substituting a placeholder: the BUG-045 shape wrote a bad bucket, synced an undefined
        // moduleId to Firestore and bumped the counter BEFORE crashing at :604, and a guard that
        // merely suppressed that crash would have made partial garbage permanent and silent.
        // Refusing early keeps the bug visible to whoever introduced it and leaves state clean.
        if (typeof houseId !== 'string' || !houseId || typeof moduleId !== 'string' || !moduleId) {
            console.error('[ModuleProgress] complete(houseId, moduleId) requires both as non-empty strings; refused:',
                { houseId: houseId, moduleId: moduleId });
            return false;
        }

        // Load current progress
        const progress = JSON.parse(localStorage.getItem(PROGRESS_KEY) || '{}');
        progress[houseId] = progress[houseId] || {};

        // Detect if this is a first completion (before bridge mutates arrays)
        const isFirstCompletion = !Array.isArray(progress.completedModules)
            || !progress.completedModules.includes(moduleId);

        // Check if this is first completion ever (for 'first_module' achievement)
        const isFirstModule = !hasCompletedAnyModule(progress);

        // Save this module's progress (flat format, the legacy format still
        // read by quiz UIs and older pages)
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

        // ── Remote Sync (all non-blocking, fail-silent) ─────────
        // Sync to Firestore for instructor dashboard
        const syncPromise = tryFirestoreSync(moduleId, houseId, 'presentation', {});

        // Sync to tenant class progress (if enrolled)
        tryClassProgressSync(moduleId, type || 'presentation', {});

        // Push to user's Firestore profile (cross-device sync)
        // Only on first completion: CF FieldValue.increment isn't diminishing-aware
        if (isFirstCompletion) {
            pushToUserProfile(houseId, moduleId, type || 'presentation');
        }

        // Update completion counter (lifetime total, used by stats panel).
        //
        // GATED ON isFirstCompletion, like pushToUserProfile above. It was unconditional,
        // so any lab that could call complete() twice for the same module permanently
        // inflated this number (taskboard #296).
        //
        // The invariant this restores is not a matter of taste: resetModule() at the bottom
        // of this file decrements the counter by EXACTLY ONE per module, with the comment
        // "the lifetime counter only ever increments, so undo exactly one". That is only
        // correct if a module contributes exactly one increment. Complete a lab twice and
        // reset it, and the counter keeps a phantom module that no reset can ever remove.
        // The student's stats panel reports more modules completed than they have completed,
        // permanently, with no way back.
        //
        // Fixed HERE rather than in the labs. An audit
        // (_tools/eduscan/finish-double-award-audit.js) found 589 call sites across 592 lab
        // files, of which 19 carry a sticky guard. Patching the other 570 would be the same
        // fix written 570 times, and the 571st lab would arrive without it.
        //
        // This does NOT make complete() fully idempotent, and it is not claimed to. A second
        // call still shows the completion overlay and still re-syncs. What it stops is the
        // one effect that is cumulative, permanent and unrecoverable.
        if (isFirstCompletion) {
            const completedCount = parseInt(localStorage.getItem(MODULES_COMPLETED_KEY) || '0', 10);
            localStorage.setItem(MODULES_COMPLETED_KEY, (completedCount + 1).toString());
        }

        // Update streak (consecutive study days)
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

        // Show completion UI (overlay with Next/Stay/Dashboard choices)
        if (!silent) {
            showCompletionOverlay(houseId, moduleId, returnUrl);
        }

        console.log(`<img src="/assets/images/icons/icon-books.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle"> Module completed: ${houseId}/${moduleId}`);

        // Queue activity event for dashboard feed (always available)
        const prettyTitle = moduleId.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
        queueActivityEvent('module_complete', { moduleId, title: prettyTitle });
        // Also fire live if ActivityFeed is loaded (dashboard context)
        if (typeof ActivityFeed !== 'undefined') {
            ActivityFeed.moduleComplete(moduleId, prettyTitle);
        }

        // ── Arctic Path Override ────────────────────────────────
        // Arctic is a guided learning path that auto-navigates between modules.
        // If the student came FROM an Arctic path, the next destination was
        // stashed in localStorage by the Arctic navigator. We honor it here
        // but ONLY if the current module is actually in an Arctic path.
        // Prevents stale hexworth_arctic_next values from hijacking unrelated modules.
        if (returnToDashboard || returnUrl) {
            let arcticDest = null;
            try {
                const arcticNext = localStorage.getItem('hexworth_arctic_next');
                if (arcticNext) {
                    const parsed = JSON.parse(arcticNext);
                    // Only honor Arctic nav if current module is actually in an Arctic path
                    const isArcticModule = houseId === 'arctic' || houseId.startsWith('arctic-');
                    if (parsed.href && isArcticModule) {
                        arcticDest = parsed.href;
                    }
                    // Always clean up to prevent stale redirects
                    localStorage.removeItem('hexworth_arctic_next');
                }
            } catch (e) { /* ignore */ }

            // Only auto-navigate for Arctic paths. Everything else gets the overlay
            if (arcticDest) {
                const navigateFn = () => { window.location.href = arcticDest; };
                if (silent) {
                    navigateFn();
                } else {
                    // Wait for Firestore sync (max 8s) before navigating,
                    // so the instructor dashboard doesn't miss the completion
                    const timeout = new Promise(r => setTimeout(r, 8000));
                    Promise.race([syncPromise, timeout]).then(navigateFn, navigateFn);
                }
            }
        }

        return true;
    }

    /**
     * Complete a quiz with score tracking.
     *
     * Similar to complete() but adds quiz-specific behavior:
     *   - Pass/fail determination against passingScore threshold (default 70%)
     *   - Score stored in progress record
     *   - Attempt counter incremented each call (even on failure)
     *   - XP and stamps only awarded on pass
     *   - Shows pass/fail notification instead of completion overlay
     *   - Auto-navigates to returnUrl/dashboard on pass (not on fail)
     *
     * Same (houseId, moduleId) convention as complete(). See note there.
     *
     * @param {string} houseId - The house ID
     * @param {string} quizId - The SHORT quiz key (no house prefix)
     * @param {number} score - Score percentage (0-100)
     * @param {object} options - Additional options
     * @param {boolean} options.silent - Don't show notification
     * @param {boolean} options.returnToDashboard - Navigate to dashboard after passing
     * @param {string} options.returnUrl - Custom URL to navigate to after passing
     * @param {number} options.passingScore - Minimum passing score (default 70)
     * @returns {boolean} true if passed, false if failed
     * @sideeffect Same as complete() plus attempt tracking
     */
    function completeQuiz(houseId, quizId, score, options = {}) {
        const { silent = false, returnToDashboard = true, returnUrl = null, passingScore = 70 } = options;

        const passed = score >= passingScore;

        // Load current progress
        const progress = JSON.parse(localStorage.getItem(PROGRESS_KEY) || '{}');
        progress[houseId] = progress[houseId] || {};

        // Check if this is first passing quiz ever (for 'first_quiz' achievement)
        const isFirstQuiz = passed && !hasPassedAnyQuiz(progress);

        // Save quiz progress (flat format), written even on failure for attempt tracking
        const now = new Date().toISOString();
        progress[houseId][quizId] = {
            completed: passed,
            score: score,
            date: now,
            completedAt: now,
            attempts: (progress[houseId][quizId]?.attempts || 0) + 1
        };

        // Bridge to ProgressManager structured format (XP, levels, house progress)
        // Only on pass: failed quizzes don't earn XP or stamps
        if (passed) {
            bridgeStructuredProgress(progress, houseId, quizId, 'quiz', { score });
            bridgeCompletionStamp(houseId, quizId, score);
        }

        localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));

        // ── Remote Sync (all non-blocking, fail-silent) ─────────
        // Sync to Firestore for instructor dashboard
        const syncPromise = tryFirestoreSync(quizId, houseId, 'quiz', { score });

        // Sync to tenant class progress (if enrolled)
        tryClassProgressSync(quizId, 'quiz', { score: score });

        // Push to user's Firestore profile (cross-device sync), only on pass
        if (passed) {
            pushToUserProfile(houseId, quizId, 'quiz', { score });
        }

        // Update quiz counter if passed
        if (passed) {
            const passedCount = parseInt(localStorage.getItem(QUIZZES_PASSED_KEY) || '0', 10);
            localStorage.setItem(QUIZZES_PASSED_KEY, (passedCount + 1).toString());

            // Update streak (quizzes count as study activity)
            updateStreak();

            // Trigger achievements
            if (typeof AchievementManager !== 'undefined') {
                if (isFirstQuiz) {
                    AchievementManager.unlock('first_quiz');
                }
            }
        }

        // Show notification (pass or fail)
        if (!silent) {
            showQuizNotification(passed, score);
        }

        console.log(`<img src="/assets/images/icons/icon-notepad.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle"> Quiz completed: ${houseId}/${quizId} - Score: ${score}% (${passed ? 'PASS' : 'FAIL'})`);

        // Queue activity event for dashboard feed (only on pass)
        if (passed) {
            const quizTitle = quizId.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
            queueActivityEvent('module_complete', { moduleId: quizId, title: `${quizTitle} (${score}%)` });
        }

        // Return to destination if passed. Wait for Firestore sync first (max 8s timeout)
        // On failure, the student stays on the quiz page to retry
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
     * Check if user has completed any module (any house, any type).
     * Used to detect the very first completion for the 'first_module' achievement.
     *
     * Scans the flat progress format, looks for any object with completed: true
     * inside any house sub-object. Skips non-house keys (arrays, primitives)
     * that exist at the top level of the progress blob.
     *
     * @param {object} progress - The full progress object
     * @returns {boolean} true if at least one module has completed: true
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
     * Check if user has passed any quiz (any house).
     * Used to detect the very first quiz pass for the 'first_quiz' achievement.
     *
     * Differentiates quizzes from modules by checking for a 'score' property:
     * only quiz records include a score field.
     *
     * @param {object} progress - The full progress object
     * @returns {boolean} true if at least one quiz has completed: true + score
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
     * Check for the 'explorer' achievement, awarded when a student has
     * completed at least one module in every core house.
     *
     * Only checks the 7 core academic houses (web, shield, forge, script,
     * cloud, code, key). Special houses (arctic, dark-arts, arena) are excluded.
     *
     * @param {object} progress - The full progress object
     * @sideeffect May call AchievementManager.unlock('explorer')
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
     * Update the learning streak (consecutive study days).
     *
     * Streak logic:
     *   - Same day as last study: no change (already counted today)
     *   - Yesterday was last study: increment streak (consecutive)
     *   - Any other day: reset to 1 (streak broken)
     *
     * Also checks streak-based achievements at 3, 7, and 30 day milestones.
     *
     * @returns {number} Current streak count
     * @sideeffect Writes to localStorage STREAK_KEY and LAST_STUDY_KEY
     * @sideeffect May call AchievementManager.unlock('streak_3/7/30')
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
     *
     * Scrapes the current page's DOM for navigation buttons (Next Module,
     * Course Home) so the completion overlay can offer contextual choices.
     * This avoids hardcoding nav URLs: each module page defines its own
     * navigation via .nav-btn links in a footer.
     *
     * @returns {{ nextUrl: string|null, nextLabel: string|null, courseHomeUrl: string|null, indexUrl: string|null }}
     */
    function detectNavLinks() {
        const result = { nextUrl: null, nextLabel: null, courseHomeUrl: null, indexUrl: null };

        // Look for nav-btn links in the footer
        const navBtns = document.querySelectorAll('.nav-footer a.nav-btn, .nav-btn.primary, a[class*="nav-btn"]');
        navBtns.forEach(a => {
            const text = (a.textContent || '').trim();
            const href = a.getAttribute('href');
            if (!href || a.classList.contains('disabled')) return;

            // "Next:" links (e.g. "Next: Subnetting >")
            if (/next/i.test(text) && !a.classList.contains('disabled')) {
                result.nextUrl = href;
                result.nextLabel = text.replace(/^Next:\s*/i, '').replace(/\s*>\s*$/, '').trim();
            }
        });

        // Look for index.html link (course home), used as "Course Home" button
        const allLinks = document.querySelectorAll('a[href]');
        allLinks.forEach(a => {
            const href = a.getAttribute('href') || '';
            if (href === 'index.html' || href.endsWith('/index.html')) {
                result.indexUrl = href;
            }
        });

        // Use detected indexUrl as courseHomeUrl (no blind directory guess,
        // that was removed per QC-20 to prevent broken links)
        if (result.indexUrl) {
            result.courseHomeUrl = result.indexUrl;
        }

        return result;
    }

    /**
     * Inject the shared progress stylesheet exactly once.
     *
     * Extracted so BOTH the completion overlay and the quiz notification can reach it.
     * showQuizNotification used to call `showCompletionNotification('', '')` here, a
     * function that does not exist anywhere in this file, so completeQuiz() threw a
     * ReferenceError on the first notification of every quiz page (BUG-074). The score and
     * the Firestore sync survived because they happen earlier, but the activity-feed event
     * and the return-to-destination navigation were skipped: a passing student was never
     * sent back to their hub.
     */
    function ensureProgressStyles() {
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
    }

    /**
     * Show the completion overlay, a modal with navigation choices.
     *
     * Displays a centered card with up to 4 buttons:
     *   1. "Next: [Module Name]", only if a next link was found in the page nav
     *   2. "Stay & Explore", dismisses the overlay, keeps the student on the page
     *   3. "Course Home", only if an index.html link was found on the page
     *   4. "Dashboard", suppressed inside course hubs (hub isolation pattern)
     *
     * Injects its own CSS on first call (styles are shared with quiz notification).
     * The overlay is a fixed-position backdrop with blur effect.
     *
     * @param {string} houseId - House slug (used for context, not displayed)
     * @param {string} moduleId - Module slug (used for context, not displayed)
     * @param {string} [returnUrl] - The module-provided next target. Used ONLY as a fallback for
     *   the Next button when the footer scrape finds no "Next"-labeled link AND returnUrl is a bare
     *   same-directory content file. NOTE: returnUrl semantically means "return to" and is used
     *   across houses for hub/dashboard/capstone-return too; the same-dir-content-file guard below
     *   deliberately excludes those so a "return" target is never mislabeled a forward step.
     * @sideeffect Injects <style id="module-progress-styles"> into <head>
     * @sideeffect Appends overlay div to document.body
     */
    function showCompletionOverlay(houseId, moduleId, returnUrl) {
        ensureProgressStyles();

        // Detect available navigation from the page's own nav footer
        const nav = detectNavLinks();

        // Build action buttons based on what's available
        let actionsHtml = '';

        // Next Module (if available, scraped from the page's nav footer)
        if (nav.nextUrl) {
            const label = nav.nextLabel || 'Next Module';
            actionsHtml += `<a href="${nav.nextUrl}" class="mp-btn mp-btn-next">Next: ${label} &rarr;</a>`;
        } else if (returnUrl) {
            // Fallback: many script-house modules label their forward button with the topic name
            // (e.g. "Regular Expressions >") instead of "Next", so detectNavLinks misses it and no
            // forward button appears. Use the module-provided returnUrl ONLY when it is a bare
            // SAME-DIRECTORY content file (.module/.lab/.quiz.html, no path) and not the current
            // page. This EXCLUDES hub/dashboard/capstone-return returnUrls (directory roots, ../
            // climbs, index.html) whose semantics are "return", not "next". Neutral "Continue"
            // label so a lab/quiz target is never mislabeled a "module". WARNING to future editors:
            // if you author a same-dir content-file returnUrl that means "go back / review", this
            // fallback will wrongly present it as forward. Do not rely on returnUrl for back-nav.
            const curFile = (window.location.pathname.split('/').pop() || '');
            const ruPath = returnUrl.split(/[?#]/)[0];
            if (/^[^/]+\.(?:module|lab|quiz)\.html$/i.test(ruPath) && ruPath !== curFile) {
                actionsHtml += `<a href="${returnUrl}" class="mp-btn mp-btn-next">Continue &rarr;</a>`;
            }
        }

        // Stay & Explore (always available, dismisses overlay)
        actionsHtml += '<button class="mp-btn mp-btn-stay" onclick="this.closest(\'.mp-overlay\').remove()">Stay &amp; Explore</button>';

        // Course Home (if detected on the page)
        if (nav.indexUrl || nav.courseHomeUrl) {
            const courseUrl = nav.indexUrl || nav.courseHomeUrl;
            actionsHtml += `<a href="${courseUrl}" class="mp-btn mp-btn-course">Course Home</a>`;
        }

        // Dashboard, suppressed inside course hubs (hub isolation pattern:
        // self-contained directories like network-plus/ should not link out)
        var isInsideHub = /\/network-plus\/(?:modules|labs|presentations|quizzes|exams|tools)\//.test(window.location.pathname);
        if (!isInsideHub) {
            actionsHtml += '<a href="javascript:void(0)" class="mp-btn mp-btn-dash" onclick="ModuleProgress._goToDashboard()">Dashboard</a>';
        }

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
     * Show quiz result notification (pass or fail).
     *
     * Unlike showCompletionOverlay, this is a simple centered notification
     * showing the score percentage and pass/fail status. Failed notifications
     * auto-dismiss after 3 seconds; passed notifications persist (the student
     * will be navigated away shortly).
     *
     * @param {boolean} passed - Whether the quiz was passed
     * @param {number} score - Score percentage (0-100)
     * @sideeffect Appends notification div to document.body
     */
    function showQuizNotification(passed, score) {
        const notification = document.createElement('div');
        notification.className = `quiz-notification ${passed ? 'passed' : 'failed'}`;
        notification.innerHTML = `
            <div class="qn-score">${score}%</div>
            <div class="qn-text">${passed ? 'Quiz Passed!' : 'Try Again'}</div>
        `;

        // Ensure styles are loaded (reuses the same stylesheet as completion overlay).
        // This used to call showCompletionNotification('', ''), which does not exist anywhere in
        // this file, and then remove '.module-complete-notification', which is not the overlay's
        // class either (it is .mp-overlay). Two renames that never propagated, leaving a
        // guaranteed ReferenceError on the first quiz notification of every page. See BUG-074.
        ensureProgressStyles();

        document.body.appendChild(notification);

        // Auto-dismiss failure notifications. Pass notifications stay
        // because the page will navigate away after Firestore sync
        if (!passed) {
            setTimeout(() => notification.remove(), 3000);
        }
    }

    /**
     * Get current user stats, streak, lifetime counts, and full progress blob.
     * Used by the dashboard stats panel and profile page.
     *
     * @returns {{ streak: number, modulesCompleted: number, quizzesPassed: number, progress: object }}
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
     * Get the full progress record for a specific module.
     * Returns the flat-format object with completed, date, score, attempts, etc.
     *
     * @param {string} houseId - House slug
     * @param {string} moduleId - Short module key
     * @returns {object|null} Progress record or null if never visited
     */
    function getModuleProgress(houseId, moduleId) {
        const progress = JSON.parse(localStorage.getItem(PROGRESS_KEY) || '{}');
        return progress[houseId]?.[moduleId] || null;
    }

    /**
     * Check if a module is completed. Convenience wrapper around getModuleProgress.
     * Used by module pages to show "already completed" badges or skip re-completion.
     *
     * @param {string} houseId - House slug
     * @param {string} moduleId - Short module key
     * @returns {boolean} true if the module has completed: true in progress
     */
    function isCompleted(houseId, moduleId) {
        const module = getModuleProgress(houseId, moduleId);
        return module?.completed || false;
    }

    /**
     * Track module visit for "Continue Learning" on the dashboard.
     * Call from any module/lab page to record the user's last location.
     *
     * The dashboard's "Continue Learning" card reads hexworth_last_visited
     * to show a quick-resume link. This is separate from completion tracking:
     * it fires on page load (via auto-track below), not on completion.
     *
     * @param {string} houseId - House slug (e.g. 'script', 'shield')
     * @param {string} moduleId - Module slug (e.g. 'db-12-inner-join')
     * @param {object} [meta] - Optional: { section, returnUrl }
     * @sideeffect Writes to localStorage 'hexworth_last_visited'
     */
    function trackVisit(houseId, moduleId, meta) {
        try {
            /* Extract a clean title from document.title (strip site name suffix).
               ⚠ THE SEPARATOR BELOW IS DATA, NOT PUNCTUATION. 856 pages put U+2014 in their
               <title> as a separator, and this splits on it. The no-em-dash style rule is
               about prose and does not reach a delimiter: "fixing" this one silently breaks
               title extraction on all 856. Written as the escape \u2014 rather than the
               literal character, so the source carries no em dash for a reader or a linter to
               trip over, and so the intent reads as a code point instead of typography. Same
               class as the beep-code glyph in the A+ lab, where the dash carried meaning. */
            var title = document.title.split('|')[0].split(' \u2014 ')[0].trim();
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

    // ── Public API ──────────────────────────────────────────────
    /**
     * One-time legacy progress key migration.
     *
     * When a moduleId is renamed (e.g., the 5 web-troubleshooting files moved
     * from a shared 'web-troubleshooting' key to 5 unique catalog-canonical
     * keys per STR-30), existing student progress would orphan under the old
     * key. This shim transfers their data to the new key so they don't see
     * any lost progress.
     *
     * Idempotent: deletes the old key after migrating, so subsequent calls are
     * no-ops. Safe to call from multiple module pages: each call only affects
     * the new key passed in.
     *
     * Migrates BOTH formats (flat + structured completedModules array) plus
     * the completion stamp registry.
     *
     * @param {string} houseId  - house owning the progress (e.g., 'web')
     * @param {string} oldKey   - legacy moduleId previously used
     * @param {string} newKey   - canonical moduleId to migrate to
     * @returns {boolean} true if migration happened, false if no legacy data
     */
    function migrateLegacyKey(houseId, oldKey, newKey) {
        if (!houseId || !oldKey || !newKey || oldKey === newKey) return false;
        try {
            const progress = JSON.parse(localStorage.getItem(PROGRESS_KEY) || '{}');
            const houseBlock = progress[houseId];
            if (!houseBlock || !houseBlock[oldKey]) return false;

            // Skip if new key already has data. Don't clobber
            if (houseBlock[newKey]) {
                delete houseBlock[oldKey];
                localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
                return true;
            }

            // Copy flat-format entry
            houseBlock[newKey] = houseBlock[oldKey];
            delete houseBlock[oldKey];

            // Update completedModules structured array
            if (Array.isArray(progress.completedModules)) {
                const idx = progress.completedModules.indexOf(oldKey);
                if (idx !== -1) {
                    if (!progress.completedModules.includes(newKey)) {
                        progress.completedModules[idx] = newKey;
                    } else {
                        progress.completedModules.splice(idx, 1);
                    }
                }
            }

            // Update completion stamps registry (visual tracking)
            try {
                const stampKey = 'hexworth_completion_stamps';
                const stamps = JSON.parse(localStorage.getItem(stampKey) || '{}');
                const oldStampId = `${houseId}/${oldKey}`;
                const newStampId = `${houseId}/${newKey}`;
                if (stamps[oldStampId] && !stamps[newStampId]) {
                    stamps[newStampId] = stamps[oldStampId];
                    delete stamps[oldStampId];
                    localStorage.setItem(stampKey, JSON.stringify(stamps));
                }
            } catch (_) { /* completion stamps are visual-only; failure is non-critical */ }

            localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
            return true;
        } catch (_) {
            return false;
        }
    }

    /**
     * Copy progress data from oldKey to newKey WITHOUT removing the source.
     *
     * Companion to migrateLegacyKey. Designed for N-way splits: when one
     * legacy progress key needs to credit MULTIPLE new keys (each a distinct
     * file that previously shared the legacy key), call copyLegacyKey N-1
     * times with the same oldKey. Each call writes a new flat-format entry
     * + a new completion stamp. The source key is preserved so subsequent
     * copies can read it.
     *
     * IMPORTANT: what this does NOT touch (deliberately):
     *   - progress.completedModules array. That array drives count-based
     *     consumers (FirestoreManager sync, instructor dashboards, badges,
     *     XP totals). Pushing newKey here would inflate "modules completed"
     *     metrics across the platform. The student officially completed ONE
     *     module under the legacy key; the secondary keys get progress-bar
     *     visual credit only.
     *   - progress.houses[houseId].modulesCompleted array, same reason.
     *
     * Order-of-operations contract: when used alongside migrateLegacyKey
     * for the same oldKey, ALL copyLegacyKey calls MUST run before any
     * migrateLegacyKey call. Migrate deletes the source; subsequent copies
     * would silently no-op.
     *
     * @param {string} houseId  - house owning the progress (e.g., 'forge')
     * @param {string} oldKey   - legacy moduleId to read progress FROM
     * @param {string} newKey   - additional moduleId to ALSO credit
     * @returns {string} 'copied' on success, 'already-set' if newKey already
     *                   has progress (no-op), 'no-source' if oldKey has no
     *                   progress data, '' on caller error
     */
    function copyLegacyKey(houseId, oldKey, newKey) {
        if (!houseId || !oldKey || !newKey || oldKey === newKey) return '';
        try {
            const progress = JSON.parse(localStorage.getItem(PROGRESS_KEY) || '{}');
            const houseBlock = progress[houseId];
            if (!houseBlock || houseBlock[oldKey] === undefined) return 'no-source';

            // Strict undefined check. Don't overwrite an existing entry even
            // if its value is falsy (e.g., a partially-initialized record with
            // percentComplete: 0). Any truthy/falsy non-undefined value means
            // the key has been touched and we must not clobber.
            if (houseBlock[newKey] !== undefined) return 'already-set';

            // Copy the flat-format entry. JSON.stringify below produces an
            // independent serialization, so the brief reference-share between
            // the two keys is invisible to any future read.
            houseBlock[newKey] = houseBlock[oldKey];

            // Copy completion stamp (visual stamp on the secondary file's card).
            try {
                const stampKey = 'hexworth_completion_stamps';
                const stamps = JSON.parse(localStorage.getItem(stampKey) || '{}');
                const oldStampId = `${houseId}/${oldKey}`;
                const newStampId = `${houseId}/${newKey}`;
                if (stamps[oldStampId] && stamps[newStampId] === undefined) {
                    stamps[newStampId] = stamps[oldStampId];
                    localStorage.setItem(stampKey, JSON.stringify(stamps));
                }
            } catch (_) { /* completion stamps are visual-only; failure is non-critical */ }

            localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
            return 'copied';
        } catch (_) {
            return '';
        }
    }

    /**
     * Clear local completion for one module so it can be run again (classroom demos,
     * retakes, instructor walkthroughs).
     *
     * WHY THIS IS KEY-BASED AND NOT PAGE-BASED: 691 pages write hexworth_progress
     * directly instead of calling complete(), so a reset that trusted each page's
     * contract would silently miss most of the platform (audit:
     * _tools/audit/progress-write-audit.js). But those 691 pages write only 159
     * distinct house/module keys into ONE blob, so clearing by key covers all of them.
     *
     * THE LEGACY VARIANTS ARE NOT OPTIONAL. The CLH course hub copies old keys forward
     * into the canonical one and its own comment says "Never deletes old keys, only
     * copies forward". Clear the canonical key alone and the next hub visit RESURRECTS
     * the completion. That regression shipped once already on CLH-030.
     *
     * Deliberately does NOT touch Firestore: progress syncs one way UP for the
     * instructor dashboard and is never read back, so the grading record survives and a
     * student cannot destroy it locally.
     *
     * @param {string} houseId  e.g. 'script'
     * @param {string} moduleId canonical key, e.g. 'clh-030'
     * @param {Object} [opts]   {alsoClear: ['extra-key']} for ranks/achievements the
     *                          caller explicitly wants gone. Empty by default: a rank
     *                          earned across many modules is not this module's to erase.
     * @returns {Object} {cleared, keys, stamps}: what was actually removed
     */
    function reset(houseId, moduleId, opts) {
        opts = opts || {};
        const removed = { cleared: false, keys: [], stamps: [] };
        if (!houseId || !moduleId) return removed;

        // Canonical + the legacy spellings the hub migration copies forward.
        const candidates = [moduleId,
                            'script-' + moduleId + '-intro',
                            'script-' + moduleId + '-lab',
                            houseId + '-' + moduleId + '-intro',
                            houseId + '-' + moduleId + '-lab'
                           ].concat(opts.alsoClear || []);

        let progress = {};
        try { progress = JSON.parse(localStorage.getItem(PROGRESS_KEY) || '{}'); } catch (_) { progress = {}; }
        const house = progress[houseId] || {};
        const wasComplete = !!(house[moduleId] && house[moduleId].completed);
        candidates.forEach(function (k) {
            if (Object.prototype.hasOwnProperty.call(house, k)) { delete house[k]; removed.keys.push(k); }
        });
        // Clear the STRUCTURED arrays too, not just the flat per-house keys above.
        //
        // These were left behind, and it was already a bug before #296 touched this file:
        // bridgeStructuredProgress() gates full XP and every array push on
        // `!progress.completedModules.includes(moduleId)`. So resetting a module and then
        // redoing it awarded NO XP and re-added nothing. The module was reset everywhere a
        // student can see, and still "already completed" everywhere the awarding logic looks.
        //
        // #296 made it matter twice over: the lifetime counter is now gated on the same
        // array, so without this cleanup a reset would decrement the counter and the redo
        // could never restore it. A reset has to undo the completion in BOTH formats or it
        // undoes it in neither.
        //
        // completionCounts is cleared for the same reason: it drives diminishing XP, and a
        // genuinely reset module should not return at a reduced rate.
        candidates.forEach(function (k) {
            ['completedModules', 'labsCompleted'].forEach(function (arr) {
                if (Array.isArray(progress[arr])) {
                    const i = progress[arr].indexOf(k);
                    if (i !== -1) { progress[arr].splice(i, 1); removed.keys.push(arr + ':' + k); }
                }
            });
            ['modulesCompleted', 'labsCompleted', 'quizzesPassed'].forEach(function (arr) {
                if (Array.isArray(house[arr])) {
                    const i = house[arr].indexOf(k);
                    if (i !== -1) { house[arr].splice(i, 1); removed.keys.push(houseId + '.' + arr + ':' + k); }
                }
            });
            if (progress.completionCounts && Object.prototype.hasOwnProperty.call(progress.completionCounts, k)) {
                delete progress.completionCounts[k];
            }
        });

        progress[houseId] = house;
        try { localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress)); } catch (_) {}

        // Stamps are keyed houseId + '-' + whatever module id was passed to complete(),
        // so every candidate needs its stamp cleared too, not just the canonical one.
        let stamps = {};
        try { stamps = JSON.parse(localStorage.getItem('hexworth_completion_stamps') || '{}'); } catch (_) { stamps = {}; }
        candidates.forEach(function (k) {
            const sid = houseId + '-' + k;
            if (Object.prototype.hasOwnProperty.call(stamps, sid)) { delete stamps[sid]; removed.stamps.push(sid); }
        });
        try { localStorage.setItem('hexworth_completion_stamps', JSON.stringify(stamps)); } catch (_) {}

        // The lifetime counter only ever increments, so undo exactly one, and only if
        // this module really was complete, or repeated resets would drive it negative.
        if (wasComplete) {
            const n = parseInt(localStorage.getItem(MODULES_COMPLETED_KEY) || '0', 10);
            if (n > 0) localStorage.setItem(MODULES_COMPLETED_KEY, String(n - 1));
        }
        removed.cleared = wasComplete || removed.keys.length > 0;
        return removed;
    }

    /* BUG-099 RESOLVED. 93 pages across two courses called `ModuleProgress.init({moduleId,
       hubKey})` and it did not exist. Not a regression, an integration that never happened:
       `init:` was NEVER in this file (git log -S confirms). Every one of those pages threw
       TypeError on load, and the real damage was worse than a console error:
       WiresharkEngine._loadProgress() READS `hexworth_wireshark_progress` and renders the hub's
       bars from it, and NOTHING WROTE THAT KEY (0 setItem platform-wide). Both Wireshark and
       Digital Forensics showed 0% progress permanently.

       THE CONTRACT, decided rather than aliased (my 2026-08-12 note said not to paper over it):
       these two courses keep a COURSE-LOCAL progress store keyed by moduleId, separate from
       hexworth_progress, and WiresharkEngine._isComplete(id) treats ANY truthy entry as
       complete. Those pages carry NO completion trigger of any kind. init is their only
       ModuleProgress call, so either opening a module completes it or nothing ever does.
       This restores the intended behaviour: opening a module records it.

       ⚠ OPERATOR DECISION OWED, and it is a pedagogy call, not a bug: "opened" counting as
       "complete" is weak for anything graded. It is defensible for these reference/reading
       modules and it is what the architecture already assumes, but if you want a real gate the
       fix is a Mark Complete button on the module pages calling completeModule() below,
       at which point _isComplete should check `.completed` rather than truthiness.

       ⚠ IT REFUSES TO GUESS A KEY. `houseId: 'eye'` (7 callers) is ambiguous: Eye owns BOTH
       affected courses, so the key is resolved from an explicit hubKey, else from the page's
       own path, and otherwise NOT AT ALL. Writing a module into the wrong course's store would
       be worse than not writing it, and would be invisible. */
    function init(options) {
        const opts = options || {};
        const moduleId = opts.moduleId;
        if (!moduleId) { console.warn('[ModuleProgress.init] no moduleId; nothing recorded'); return null; }

        let hubKey = opts.hubKey;
        if (!hubKey) {
            // Derive from where the page actually lives. Never from houseId, which is ambiguous.
            const path = (typeof location !== 'undefined' && location.pathname) || '';
            if (path.indexOf('/wireshark/') !== -1) hubKey = 'hexworth_wireshark_progress';
            else if (path.indexOf('/forensics/') !== -1) hubKey = 'hexworth_forensics_progress';
        }
        if (!hubKey) {
            console.warn('[ModuleProgress.init] cannot resolve a hub key for "' + moduleId +
                         '"; refusing to guess. Pass hubKey explicitly.');
            return null;
        }

        let store = {};
        try { store = JSON.parse(localStorage.getItem(hubKey) || '{}') || {}; } catch (e) { store = {}; }
        // Idempotent and never downgrades: a module already recorded keeps its first timestamp.
        if (!store[moduleId]) {
            store[moduleId] = { completed: true, at: new Date().toISOString() };
            try { localStorage.setItem(hubKey, JSON.stringify(store)); } catch (e) {}
        }
        return { moduleId: moduleId, hubKey: hubKey, entry: store[moduleId] };
    }

    return {
        init,
        complete,
        reset,
        completeQuiz,
        getStats,
        getModuleProgress,
        isCompleted,
        updateStreak,
        trackVisit,
        migrateLegacyKey,
        copyLegacyKey,
        _goToDashboard: navigateToDashboard,  // Exposed for onclick in overlay HTML
        // Exposed for the reconcileProgressBootstrap IIFE below, which is a separate top-level
        // scope and cannot see this one's locals. See BUG-072.
        _ensureFirestoreReady: ensureFirestoreReady
    };
})();

// Make globally available (window.ModuleProgress)
if (typeof window !== 'undefined') {
    window.ModuleProgress = ModuleProgress;
}

// ── Reconcile drift between completion_stamps and hexworth_progress ──
// Two stores accumulate completion data:
//   - hexworth_completion_stamps: single writer (CompletionStamp._save), no race
//   - hexworth_progress: 12 writers using read-mutate-write, races can drop updates
// When drift happens stamps stays correct and progress lags. The progress UI
// reads hexworth_progress, so the lag is visible to students. This unions the
// two stores so the UI reflects what the user actually completed.
//
// Eager (not lazy), runs on every page load. Idempotent: when there's no drift
// the function early-returns without touching localStorage. When drift exists,
// it patches both stores and fires a fire-and-forget cloud sync so the user
// profile and class_progress doc reflect the merged state.
(function reconcileProgressBootstrap() {
    var STAMP_KEY = 'hexworth_completion_stamps';
    var PROG_KEY  = 'hexworth_progress';

    // Sorted longest-first so 'dark-arts' matches before any single-word house
    // that happens to start with 'dark'. parseStampKey relies on this order.
    var KNOWN_HOUSES = [
        'dark-arts', 'divergent', 'matrix', 'script', 'shield',
        'cloud', 'forge', 'code', 'web', 'key', 'eye'
    ];

    // Set when reconcile finds drift but auth/Firestore deps aren't ready yet.
    // The auth-state listener clears it once the cloud push succeeds.
    var pendingCloudSync = false;

    // Per-uid debounce for the auth-state pull. Token refresh and multi-tab
    // sessions can fire firebaseAuthStateChanged many times per minute;
    // without this guard each fire triggers a full Firestore profile read +
    // merge. 60s is long enough to suppress refresh storms, short enough that
    // a deliberate sign-out/sign-in still pulls fresh data.
    var _lastCloudPullByUid = Object.create(null);
    var CLOUD_PULL_DEBOUNCE_MS = 60 * 1000;

    function parseStampKey(key) {
        for (var i = 0; i < KNOWN_HOUSES.length; i++) {
            var h = KNOWN_HOUSES[i];
            if (key.indexOf(h + '-') === 0) {
                return { houseId: h, moduleId: key.slice(h.length + 1) };
            }
        }
        return null;
    }

    function tryCloudPush() {
        if (!pendingCloudSync) return;
        try {
            if (typeof FirebaseAuth === 'undefined' || typeof FirestoreManager === 'undefined') return;
            var u = FirebaseAuth.getUser && FirebaseAuth.getUser();
            if (!u || !u.uid || !FirestoreManager.syncBidirectional) return;
            pendingCloudSync = false;
            FirestoreManager.syncBidirectional(u.uid).catch(function () {
                // On failure, re-arm so the next auth-state event retries
                pendingCloudSync = true;
            });
        } catch (e) { /* silent */ }
    }

    function reconcile() {
        var stamps, progress;
        try {
            stamps   = JSON.parse(localStorage.getItem(STAMP_KEY) || '{}');
            progress = JSON.parse(localStorage.getItem(PROG_KEY)  || '{}');
        } catch (e) { return; }
        if (!stamps   || typeof stamps   !== 'object') return;
        if (!progress || typeof progress !== 'object') return;

        if (!progress.houses) progress.houses = {};
        if (!Array.isArray(progress.completedModules)) progress.completedModules = [];

        var patches = 0;

        // Direction 1: stamps → progress (the common drift case)
        for (var stampKey in stamps) {
            if (!Object.prototype.hasOwnProperty.call(stamps, stampKey)) continue;
            var record = stamps[stampKey];
            if (!record || !record.completed) continue;
            var parsed = parseStampKey(stampKey);
            if (!parsed) continue;
            var hid = parsed.houseId, mid = parsed.moduleId;

            if (!progress.houses[hid]) {
                progress.houses[hid] = {
                    unlocked: true, modulesCompleted: [], quizzesPassed: [],
                    labsCompleted: [], currentModule: null, progressPercent: 0,
                    lastAccessed: null
                };
            }
            var house = progress.houses[hid];
            if (!Array.isArray(house.modulesCompleted)) house.modulesCompleted = [];

            if (house.modulesCompleted.indexOf(mid) === -1) {
                house.modulesCompleted.push(mid);
                patches++;
            }
            if (progress.completedModules.indexOf(mid) === -1) {
                progress.completedModules.push(mid);
                patches++;
            }
            if (!progress[hid]) progress[hid] = {};
            if (!progress[hid][mid] || !progress[hid][mid].completed) {
                progress[hid][mid] = {
                    completed: true,
                    date: record.timestamp || new Date().toISOString(),
                    completedAt: record.timestamp || new Date().toISOString(),
                    score: typeof record.score === 'number' ? record.score : null,
                    restoredFromStamps: true
                };
                patches++;
            }
        }

        // Direction 2: progress → stamps (covers older clients that wrote
        // progress without bridging to stamps, or any future code path that
        // writes progress without going through ModuleProgress.complete).
        for (var i = 0; i < KNOWN_HOUSES.length; i++) {
            var hid2 = KNOWN_HOUSES[i];
            var house2 = progress.houses[hid2];
            if (!house2 || !Array.isArray(house2.modulesCompleted)) continue;
            for (var j = 0; j < house2.modulesCompleted.length; j++) {
                var mid2 = house2.modulesCompleted[j];
                var stampKey2 = hid2 + '-' + mid2;
                if (!stamps[stampKey2] || !stamps[stampKey2].completed) {
                    var flat = (progress[hid2] || {})[mid2] || {};
                    stamps[stampKey2] = {
                        completed: true,
                        timestamp: flat.date || flat.completedAt || new Date().toISOString(),
                        score: typeof flat.score === 'number' ? flat.score : null,
                        restoredFromProgress: true
                    };
                    patches++;
                }
            }
        }

        if (patches === 0) return;

        try {
            localStorage.setItem(STAMP_KEY, JSON.stringify(stamps));
            localStorage.setItem(PROG_KEY,  JSON.stringify(progress));
        } catch (e) {
            console.warn('[ModuleProgress] Reconcile save failed:', e.message);
            return;
        }
        console.log('[ModuleProgress] Reconciled ' + patches + ' drift entries between progress and stamps');

        // Mark that a cloud push is needed and try to fire it now.
        // If auth isn't ready, the auth-state listener will retry.
        pendingCloudSync = true;
        tryCloudPush();
    }

    // Run eagerly. Auth-state listener handles the deferred cloud push
    // for cases where the eager run fires before auth resolves.
    reconcile();
    if (typeof window !== 'undefined' && window.addEventListener) {
        window.addEventListener('firebaseAuthStateChanged', function (e) {
            reconcile();      // catch any new drift
            tryCloudPush();   // push pending changes if there are any

            // Always-pull: even when local has zero drift to push, we want to
            // pull cloud → local. This is the cache-cleared / new-device case
            // local is empty, reconcile finds no patches, tryCloudPush's
            // pendingCloudSync gate skips the sync, and cloud progress never
            // gets pulled. Fix that here unconditionally, with a per-uid
            // debounce to suppress token-refresh / multi-tab amplification.
            var u = (e && e.detail && e.detail.user) ||
                    (typeof FirebaseAuth !== 'undefined' && FirebaseAuth.getUser && FirebaseAuth.getUser()) ||
                    null;
            if (!u || !u.uid) return;

            var now = Date.now();
            var last = _lastCloudPullByUid[u.uid] || 0;
            if (now - last < CLOUD_PULL_DEBOUNCE_MS) return;
            _lastCloudPullByUid[u.uid] = now;

            // Use the memoized deps-ready promise. ensureFirestoreDeps lazy-
            // loads FirebaseAuth + FirestoreManager + ClassManager + ...
            // on first call. If deps were already loaded (typical for hubs
            // that loaded ModuleProgress.js synchronously), the promise
            // resolves immediately.
            // Reach the memo through the public API: `firestoreSyncReady` and
            // `ensureFirestoreDeps` are locals of the ModuleProgress IIFE and are NOT in scope
            // here. Referencing them directly threw on every sign-in, and because the throw
            // landed AFTER the debounce write above, the 60s per-uid gate then suppressed the
            // retry too (BUG-072). window.ModuleProgress is assigned before this IIFE runs.
            ModuleProgress._ensureFirestoreReady().then(function () {
                if (typeof FirestoreManager !== 'undefined' &&
                    FirestoreManager.syncBidirectional) {
                    FirestoreManager.syncBidirectional(u.uid).catch(function () {
                        // Best-effort; failure is logged inside FirestoreManager.
                        // Re-arm the debounce so the next event can retry.
                        _lastCloudPullByUid[u.uid] = 0;
                    });
                }
            });
        });
    }
})();

// ── Auto-Track Page Visit ───────────────────────────────────────
// Automatically records the student's current location for "Continue Learning".
// Fires on DOMContentLoaded so document.title is available. Detects the house
// from URL patterns: /houses/{house}/ or /signal/, /arena/, /dispatch/, /dark-arts/.
// Skips index pages (course home) and non-trackable paths.
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
        // Extract module ID from filename (strip .html extension)
        var file = p.split('/').pop().replace(/\.html$/, '');
        if (!file || file === 'index') return;
        // Derive human-readable section name from path
        // (e.g. "databases" -> "Databases", "linux-mastery" -> "Linux Mastery")
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

// ── Tenant Auto-Loaders ─────────────────────────────────────
// [TENANT] If tenant context exists in sessionStorage, dynamically load
// TenantRouter.js and TenantShell.js so navigateToDashboard() can route
// to the tenant hub. This is duplicated from AccessGuard.js for pages
// that load ModuleProgress but not AccessGuard (e.g. standalone labs).
// Uses window flags (__tenantRouterRequested, __tenantShellRequested) to
// prevent double-loading if both ModuleProgress and AccessGuard are present.
(function() {
    try {
        /* Reads the localStorage fallback too, matching the two other auto-loaders
           (AccessGuard.js and FirebaseAuth.js). Without it this one -- which exists for
           standalone labs that load ModuleProgress but not AccessGuard -- was the only
           gate that could not see cross-tab tenant context, so a tenant student's branding
           stayed broken on exactly those pages while everything else looked fixed.
           BUG-242. */
        if (sessionStorage.getItem('hexworth_tenant') || localStorage.getItem('hexworth_tenant')) {
            if (typeof TenantRouter === 'undefined' && !window.__tenantRouterRequested) {
                window.__tenantRouterRequested = true;
                var r = document.createElement('script');
                r.src = '/components/TenantRouter.js';
                document.head.appendChild(r);
            }
            if (!window.__tenantShellRequested) {
                window.__tenantShellRequested = true;
                var s = document.createElement('script');
                s.src = '/components/TenantShell.js';
                document.head.appendChild(s);
            }
        }
    } catch(e) {}
})();
