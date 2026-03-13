/**
 * XPCalculator.js - Deterministic XP Calculation Engine
 *
 * Replaces the accumulator-based XP model with a pure function that derives
 * XP entirely from completion state. XP is always recomputed from scratch —
 * never accumulated. This eliminates drift, inflation, and formula mismatches.
 *
 * Dependencies (optional, graceful fallback if missing):
 *   - XPMasterLedger (canonical XP values — falls back to hardcoded defaults if missing)
 *   - ProgressManager (for getProgress, LEVEL_TIERS)
 *   - ContentCatalog (for type resolution of ambiguous module IDs)
 *   - AchievementSystem (for badge count)
 *   - GameTracker (not used directly — reads hexworth_game_tracker from localStorage)
 *
 * Load order: after XPMasterLedger (optional), ProgressManager, ContentCatalog (optional)
 *
 * Usage:
 *   const result = XPCalculator.recalculate();
 *   // { xp: 4200, level: 7, tier: {...}, breakdown: {...} }
 */
const XPCalculator = (function () {
    'use strict';

    // Known house prefixes for module ID validation
    const _KNOWN_HOUSES = ['web','shield','forge','script','cloud','code','key','eye','ai','linux','arena'];

    /**
     * Validate a module ID: must be {knownHouse}-{key} or dark-arts-{key}.
     * Rejects garbage like "module_XXXXXX", numeric keys, or house-only strings.
     *
     * WHY: Early Firestore sync bugs allowed garbage entries into completedModules
     * arrays (e.g. flat-format reconstruction created "forge-forge-..." double-prefixed
     * IDs). Without this filter, 942+ garbage entries inflated XP by 10-30K per user.
     * The migration script (migrate-xp.js) cleaned existing data; this filter prevents
     * re-introduction from stale sync blobs or cached localStorage on other devices.
     */
    function _isValidId(id) {
        if (!id || typeof id !== 'string') return false;
        if (id.startsWith('dark-arts-') && id.length > 10) return true;
        const dash = id.indexOf('-');
        if (dash < 1) return false;
        const house = id.slice(0, dash);
        const key = id.slice(dash + 1);
        if (!key || !_KNOWN_HOUSES.includes(house)) return false;
        if (key.startsWith(house + '-')) return false;  // double-prefixed
        if (_KNOWN_HOUSES.includes(key)) return false;  // house-house pair
        return true;
    }

    /**
     * Detect cheating: count garbage entries in completedModules and house_completions.
     * If > 5 garbage entries, stores hexworth_integrity in localStorage.
     * Returns integrity object if violated, null otherwise.
     */
    function _checkIntegrity(progress) {
        let garbageCount = 0;

        // Check completedModules for invalid IDs
        const completed = Array.isArray(progress.completedModules) ? progress.completedModules : [];
        const garbage = completed.filter(id => !_isValidId(id));
        garbageCount += garbage.length;

        // Check hexworth_house_completions for non-house keys
        try {
            const raw = localStorage.getItem('hexworth_house_completions');
            if (raw) {
                const completions = JSON.parse(raw);
                const badKeys = Object.keys(completions).filter(k => !_KNOWN_HOUSES.includes(k) && k !== 'dark-arts');
                garbageCount += badKeys.length;
            }
        } catch (e) { /* ignore */ }

        // Cross-reference TripWire log for storage tampering
        try {
            var tripLog = JSON.parse(localStorage.getItem('hexworth_tripwire_log') || '[]');
            var storageTamps = tripLog.filter(function(e) { return e.sensor === 'storage'; });
            if (storageTamps.length > 0) {
                garbageCount += storageTamps.length;
            }
        } catch (e) { /* ignore */ }

        // Threshold: > 5 garbage entries = cheating
        const THRESHOLD = 5;
        if (garbageCount > THRESHOLD) {
            const existing = JSON.parse(localStorage.getItem('hexworth_integrity') || 'null');
            const integrity = {
                status: 'violated',
                detectedAt: existing?.detectedAt || new Date().toISOString(),
                garbageCount,
                peakGarbage: Math.max(garbageCount, existing?.peakGarbage || 0)
            };
            localStorage.setItem('hexworth_integrity', JSON.stringify(integrity));
            return integrity;
        } else if (garbageCount === 0) {
            // Clean — but don't clear if Firestore has integrity (let server be authoritative)
            localStorage.removeItem('hexworth_integrity');
        }
        return null;
    }

    // ─── XP rate resolution ────────────────────────────────────
    // XPMasterLedger is the single source of truth for XP values.
    // If it is not loaded (script tag missing), fall back to hardcoded defaults
    // so XPCalculator continues to work standalone.

    const _FALLBACK_RATES = {
        PRESENTATION_VIEW: 100,
        TOOL_EXPLORE: 100,
        QUIZ_PASS: 100,
        QUIZ_PERFECT: 200,
        GATE_CLEARED: 500,
        LAB_COMPLETE: 500,
        GAME_PLAYED: 100,
        MODULE_COMPLETE: 1000,
        COURSE_COMPLETE: 10000,
        DAILY_LOGIN: 25
    };

    // Maps XP_RATES keys to XPMasterLedger.values keys
    const _RATE_TO_LEDGER = {
        PRESENTATION_VIEW: 'presentation',
        TOOL_EXPLORE: 'tool',
        QUIZ_PASS: 'quiz_pass',
        QUIZ_PERFECT: 'quiz_perfect',
        GATE_CLEARED: 'gate',
        LAB_COMPLETE: 'lab',
        GAME_PLAYED: 'game',
        MODULE_COMPLETE: 'module',
        COURSE_COMPLETE: 'course_completion',
        DAILY_LOGIN: 'daily_login'
    };

    /**
     * Resolve an XP rate by key. Checks XPMasterLedger first, falls back to hardcoded.
     * @param {string} key - XP_RATES key (e.g. 'QUIZ_PASS')
     * @returns {number}
     */
    function _rate(key) {
        if (typeof XPMasterLedger !== 'undefined' && XPMasterLedger.values) {
            var ledgerKey = _RATE_TO_LEDGER[key];
            if (ledgerKey && XPMasterLedger.values[ledgerKey] !== undefined) {
                return XPMasterLedger.values[ledgerKey];
            }
        }
        return _FALLBACK_RATES[key] || 0;
    }

    /**
     * Resolve gate XP for a specific gate number. Uses XPMasterLedger.getXP()
     * to pick up per-gate overrides (e.g. gates 6-8 have escalating XP).
     * Falls back to flat GATE_CLEARED rate if ledger is not loaded.
     * @param {number} gateNum - Gate number (1-10)
     * @returns {number}
     */
    function _gateXP(gateNum) {
        if (typeof XPMasterLedger !== 'undefined' && XPMasterLedger.getXP) {
            return XPMasterLedger.getXP('dark-arts-gate-' + gateNum, 'gate');
        }
        return _FALLBACK_RATES.GATE_CLEARED;
    }

    // XP_RATES proxy: reads from ledger at access time so callers always
    // get current ledger values. External code that reads XPCalculator.XP_RATES.QUIZ_PASS
    // (e.g. ProgressManager, FirestoreManager) continues to work unchanged.
    const XP_RATES = new Proxy(_FALLBACK_RATES, {
        get: function(target, prop) {
            if (typeof prop === 'string' && prop in _RATE_TO_LEDGER) {
                return _rate(prop);
            }
            return target[prop];
        }
    });

    // Max daily login days for XP cap
    const MAX_LOGIN_DAYS = 365;

    /**
     * The one true level formula (quadratic).
     * Inverse of: Level N requires 50 * N * (N-1) cumulative XP
     */
    function calculateLevel(xp) {
        if (!xp || xp <= 0) return 1;
        return Math.max(1, Math.floor((1 + Math.sqrt(1 + xp / 12.5)) / 2));
    }

    /**
     * Get tier info for a level. Delegates to ProgressManager if available.
     */
    function getLevelTier(level) {
        if (typeof ProgressManager !== 'undefined' && ProgressManager.getLevelTier) {
            return ProgressManager.getLevelTier(level);
        }
        // Inline fallback (first few tiers only)
        const tiers = [
            { min: 1, max: 10, name: 'Initiate', color: '#6b7280' },
            { min: 11, max: 20, name: 'Apprentice', color: '#3b82f6' },
            { min: 21, max: 30, name: 'Journeyman', color: '#22c55e' },
            { min: 31, max: 50, name: 'Specialist', color: '#14b8a6' },
            { min: 51, max: 100, name: 'Expert', color: '#a855f7' },
            { min: 101, max: Infinity, name: 'Ascendant', color: '#8b5cf6' }
        ];
        for (const t of tiers) {
            if (level >= t.min && level <= t.max) return t;
        }
        return tiers[tiers.length - 1];
    }

    /**
     * Main entry point. Derives XP deterministically from completion state.
     * @returns {{ xp: number, level: number, tier: object, breakdown: object }}
     */
    function recalculate() {
        const progress = _getProgress();
        const integrity = _checkIntegrity(progress);
        const breakdown = {
            presentations: 0,
            tools: 0,
            quizzes: 0,
            quizPerfect: 0,
            labs: 0,
            badges: 0,
            gates: 0,
            games: 0,
            courses: 0,
            dailyLogins: 0,
            // counts for display
            _counts: {
                presentations: 0,
                tools: 0,
                quizzes: 0,
                quizPerfect: 0,
                labs: 0,
                badges: 0,
                gates: 0,
                games: 0,
                courses: 0,
                dailyLogins: 0
            }
        };

        // 1. Categorize completedModules by type
        _categorizeCompletions(progress, breakdown);

        // 2. Game high scores (tiered rank XP)
        _countGameXP(breakdown);

        // 3. Achievement/badge XP
        _countBadgeXP(breakdown);

        // 4. Gate completions
        _countGateXP(breakdown);

        // 5. Course completions (full house paths)
        _checkCourseCompletions(progress, breakdown);

        // 6. Daily login streak
        _countLoginXP(breakdown);

        // Sum all XP
        const xp = breakdown.presentations
            + breakdown.tools
            + breakdown.quizzes
            + breakdown.quizPerfect
            + breakdown.labs
            + breakdown.badges
            + breakdown.gates
            + breakdown.games
            + breakdown.courses
            + breakdown.dailyLogins;

        const level = calculateLevel(xp);
        const tier = getLevelTier(level);

        // Push to Firestore if XP changed (throttled, non-blocking)
        _syncToFirestore(xp);

        return { xp, level, tier, breakdown, integrity };
    }

    /**
     * Read progress data from ProgressManager or localStorage directly.
     */
    function _getProgress() {
        if (typeof ProgressManager !== 'undefined' && ProgressManager.getProgress) {
            return ProgressManager.getProgress();
        }
        try {
            const raw = localStorage.getItem('hexworth_progress');
            return raw ? JSON.parse(raw) : {};
        } catch (e) {
            return {};
        }
    }

    /**
     * Calculate total XP for a module with diminishing returns on repeat completions.
     * Formula: floor(baseXP * 0.5^n) for each completion n (0-indexed).
     * First completion = full XP, each repeat halves, floors to 0.
     */
    function _diminishingXPSum(baseXP, count) {
        if (count <= 1) return baseXP;
        let total = 0;
        for (let n = 0; n < count; n++) {
            const xp = Math.floor(baseXP * Math.pow(0.5, n));
            if (xp === 0) break;
            total += xp;
        }
        return total;
    }

    /**
     * Categorize completed modules into type buckets using multi-tier resolution.
     * Mutates breakdown in-place.
     */
    function _categorizeCompletions(progress, breakdown) {
        const completed = Array.isArray(progress.completedModules)
            ? progress.completedModules.filter(_isValidId) : [];
        const quizHistory = Array.isArray(progress.quizHistory)
            ? progress.quizHistory : [];
        const labsCompleted = Array.isArray(progress.labsCompleted)
            ? progress.labsCompleted : [];
        const counts = progress.completionCounts || {};

        // Build lookup sets for fast classification
        const quizIds = new Set(quizHistory.map(q => q.moduleId));
        const labIds = new Set(labsCompleted);

        // Build quiz score map for perfect bonus detection
        const quizScores = {};
        quizHistory.forEach(q => {
            if (!quizScores[q.moduleId] || q.score > quizScores[q.moduleId]) {
                quizScores[q.moduleId] = q.score;
            }
        });

        // Deduplicate completed modules
        const seen = new Set();

        for (const id of completed) {
            if (seen.has(id)) continue;
            seen.add(id);

            const type = _resolveType(id, quizIds, labIds);
            const viewCount = counts[id] || 1;

            switch (type) {
                case 'quiz': {
                    // Quizzes: one-and-done, no diminishing returns
                    const score = quizScores[id] || 0;
                    if (score >= 90) {
                        breakdown.quizPerfect += _rate('QUIZ_PERFECT');
                        breakdown._counts.quizPerfect++;
                    } else {
                        breakdown.quizzes += _rate('QUIZ_PASS');
                        breakdown._counts.quizzes++;
                    }
                    break;
                }
                case 'lab':
                    breakdown.labs += _diminishingXPSum(_rate('LAB_COMPLETE'), viewCount);
                    breakdown._counts.labs++;
                    break;
                case 'tool':
                    breakdown.tools += _diminishingXPSum(_rate('TOOL_EXPLORE'), viewCount);
                    breakdown._counts.tools++;
                    break;
                default: // presentation (conservative fallback)
                    breakdown.presentations += _diminishingXPSum(_rate('PRESENTATION_VIEW'), viewCount);
                    breakdown._counts.presentations++;
            }
        }

        // Also count quizzes that appear in quizHistory but NOT in completedModules
        // (some pages write to quizHistory without calling completeModule)
        for (const q of quizHistory) {
            if (seen.has(q.moduleId)) continue;
            seen.add(q.moduleId);
            if (q.score >= 90) {
                breakdown.quizPerfect += _rate('QUIZ_PERFECT');
                breakdown._counts.quizPerfect++;
            } else if (q.score >= 70) {
                breakdown.quizzes += _rate('QUIZ_PASS');
                breakdown._counts.quizzes++;
            }
        }

        // Also count labs in labsCompleted but NOT in completedModules
        for (const labId of labsCompleted) {
            if (seen.has(labId)) continue;
            seen.add(labId);
            breakdown.labs += _rate('LAB_COMPLETE');
            breakdown._counts.labs++;
        }
    }

    /**
     * Multi-tier type resolution for a module ID.
     * 1. quizHistory → quiz
     * 2. labsCompleted → lab
     * 3. LearningPaths → explicit type field
     * 4. ContentCatalog → check href suffix
     * 5. ID suffix heuristic
     * 6. Default: presentation
     */
    function _resolveType(id, quizIds, labIds) {
        // Tier 1: explicit quiz/lab sets
        if (quizIds.has(id)) return 'quiz';
        if (labIds.has(id)) return 'lab';

        // Tier 2: LearningPaths lookup (has explicit type field)
        if (typeof LearningPaths !== 'undefined' && LearningPaths.getModule) {
            const mod = LearningPaths.getModule(id);
            if (mod && mod.type) {
                const t = mod.type.toLowerCase();
                if (t === 'quiz') return 'quiz';
                if (t === 'lab') return 'lab';
                if (t === 'tool' || t === 'applet') return 'tool';
                return 'presentation'; // presentation, module, or any other type
            }
        }

        // Tier 3: ContentCatalog lookup
        if (typeof ContentCatalog !== 'undefined' && ContentCatalog.getModule) {
            const mod = ContentCatalog.getModule(id);
            if (mod && mod.href) {
                const href = mod.href.toLowerCase();
                if (href.endsWith('.quiz.html') || href.includes('/quiz')) return 'quiz';
                if (href.endsWith('.lab.html') || href.includes('/lab')) return 'lab';
                if (href.endsWith('.tool.html') || href.includes('/tool') || href.includes('/applet')) return 'tool';
                if (href.endsWith('.presentation.html') || href.includes('/presentation')) return 'presentation';
            }
            if (mod && mod.type) {
                const t = mod.type.toLowerCase();
                if (t === 'quiz') return 'quiz';
                if (t === 'lab') return 'lab';
                if (t === 'tool' || t === 'applet') return 'tool';
                if (t === 'presentation') return 'presentation';
            }
        }

        // Tier 4: ID suffix heuristic
        const lower = id.toLowerCase();
        if (lower.endsWith('-quiz') || lower.includes('-quiz-')) return 'quiz';
        if (lower.endsWith('-lab') || lower.includes('-lab-')) return 'lab';
        if (lower.endsWith('-tool') || lower.endsWith('-applet')) return 'tool';
        if (lower.endsWith('-presentation') || lower.endsWith('-pres')) return 'presentation';

        // Tier 5: conservative default
        return 'presentation';
    }

    /**
     * Read hexworth_game_tracker and award flat GAME_PLAYED XP per unique game.
     */
    function _countGameXP(breakdown) {
        try {
            const raw = localStorage.getItem('hexworth_game_tracker');
            if (!raw) return;
            const tracker = JSON.parse(raw);
            if (typeof tracker !== 'object' || tracker === null) return;

            let gamesWithScores = 0;

            for (const gameId of Object.keys(tracker)) {
                const game = tracker[gameId];
                if (!game || typeof game !== 'object') continue;
                if (game.bestScore > 0 || game.highScore > 0 ||
                    game.bestTime > 0 || game.wins > 0 ||
                    game.result === 'success') {
                    gamesWithScores++;
                }
            }

            breakdown.games = gamesWithScores * _rate('GAME_PLAYED');
            breakdown._counts.games = gamesWithScores;
        } catch (e) {
            // Silent fail — game XP is a bonus, not critical
        }
    }

    /**
     * Count achievement/badge XP using each badge's own .points value.
     * Delegates to AchievementSystem.getTotalPoints() when available.
     */
    function _countBadgeXP(breakdown) {
        let totalPoints = 0;
        let badgeCount = 0;

        // Primary: AchievementSystem has per-badge point values (10-500 each)
        if (typeof AchievementSystem !== 'undefined' && AchievementSystem.getTotalPoints) {
            totalPoints = AchievementSystem.getTotalPoints() || 0;
            badgeCount = (AchievementSystem.getUnlockedAchievements
                ? AchievementSystem.getUnlockedAchievements().length : 0);
        } else {
            // Fallback: read from localStorage, estimate conservatively
            try {
                const raw = localStorage.getItem('hexworth_achievements');
                if (raw) {
                    const parsed = JSON.parse(raw);
                    if (Array.isArray(parsed)) {
                        badgeCount = parsed.length;
                        // Sum points if stored with objects, else estimate 50 avg
                        totalPoints = parsed.reduce((sum, a) => {
                            return sum + (typeof a === 'object' && a ? (a.points || 50) : 50);
                        }, 0);
                    }
                }
            } catch (e) { /* ignore */ }

            // Also check v2 format
            try {
                const v2Raw = localStorage.getItem('hexworth_achievements_v2');
                if (v2Raw) {
                    const v2 = JSON.parse(v2Raw);
                    if (v2 && v2.unlocked) {
                        const v2Count = Object.keys(v2.unlocked).length;
                        if (v2Count > badgeCount) {
                            badgeCount = v2Count;
                            // v2 doesn't store points inline — estimate 50 avg per badge
                            totalPoints = v2Count * 50;
                        }
                    }
                }
            } catch (e) { /* ignore */ }
        }

        breakdown.badges = totalPoints;
        breakdown._counts.badges = badgeCount;
    }

    /**
     * Scan localStorage for gate_N_complete keys.
     * Gate keys use pattern: gate{N}_complete = 'true'
     */
    function _countGateXP(breakdown) {
        let gateCount = 0;
        let gateXP = 0;

        for (let i = 1; i <= 10; i++) {
            if (localStorage.getItem(`gate${i}_complete`) === 'true') {
                gateCount++;
                gateXP += _gateXP(i);
            }
        }

        breakdown.gates = gateXP;
        breakdown._counts.gates = gateCount;
    }

    /**
     * Detect fully-completed house paths via house completion tracking.
     * Reads hexworth_house_completions for already-awarded completions,
     * plus checks per-house progress against ContentCatalog module counts.
     */
    function _checkCourseCompletions(progress, breakdown) {
        let courseCount = 0;

        // Check stored house completions first
        try {
            const raw = localStorage.getItem('hexworth_house_completions');
            if (raw) {
                const completions = JSON.parse(raw);
                const validKeys = Object.keys(completions).filter(k => _KNOWN_HOUSES.includes(k) || k === 'dark-arts');
                courseCount = validKeys.length;
            }
        } catch (e) { /* ignore */ }

        // Also check dynamically via ContentCatalog + progress
        if (typeof ContentCatalog !== 'undefined' && ContentCatalog.getHouseModules) {
            const houses = progress.houses || {};
            for (const houseId of Object.keys(houses)) {
                const house = houses[houseId];
                if (!house || !Array.isArray(house.modulesCompleted)) continue;

                try {
                    const totalModules = ContentCatalog.getHouseModules(houseId)
                        .filter(m => !m.status || m.status === 'available');
                    if (totalModules.length > 0 && house.modulesCompleted.length >= totalModules.length) {
                        // Check if already counted from hexworth_house_completions
                        try {
                            const raw = localStorage.getItem('hexworth_house_completions');
                            const completions = raw ? JSON.parse(raw) : {};
                            if (!completions[houseId]) {
                                courseCount++;
                            }
                        } catch (e) {
                            courseCount++; // Count it if we can't verify
                        }
                    }
                } catch (e) { /* ContentCatalog may not have this house */ }
            }
        }

        breakdown.courses = courseCount * _rate('COURSE_COMPLETE');
        breakdown._counts.courses = courseCount;
    }

    /**
     * Count daily login XP from streak data.
     * Reads hexworth_streak or hexworth_stats for login day count.
     * Capped at MAX_LOGIN_DAYS (365) = 9,125 XP max.
     */
    function _countLoginXP(breakdown) {
        let loginDays = 0;

        // Try streak key first
        const streak = parseInt(localStorage.getItem('hexworth_streak') || '0', 10);
        if (streak > 0) {
            loginDays = streak;
        }

        // Also check stats for total login count
        try {
            const raw = localStorage.getItem('hexworth_stats');
            if (raw) {
                const stats = JSON.parse(raw);
                if (stats.totalLogins > loginDays) {
                    loginDays = stats.totalLogins;
                }
            }
        } catch (e) { /* ignore */ }

        loginDays = Math.min(loginDays, MAX_LOGIN_DAYS);
        breakdown.dailyLogins = loginDays * _rate('DAILY_LOGIN');
        breakdown._counts.dailyLogins = loginDays;
    }

    // ─── Throttled Firestore XP sync ───────────────────────────
    // After recalculate(), push xp+level to Firestore if the value changed.
    // Throttled: max once per 10 seconds to avoid write storms.
    let _lastSyncedXP = null;
    let _syncThrottleTimer = null;
    const _SYNC_THROTTLE_MS = 10000; // 10 seconds

    /**
     * Push current XP to Firestore if it changed since the last push.
     * Called internally after recalculate(). Uses FirestoreManager.recalculateXP()
     * which routes through the syncProgress Cloud Function.
     */
    function _syncToFirestore(xp) {
        // Skip if XP hasn't changed since last successful sync
        if (xp === _lastSyncedXP) return;

        // Skip if no auth or no FirestoreManager
        if (typeof FirebaseAuth === 'undefined' || !FirebaseAuth.isSignedIn ||
            !FirebaseAuth.isSignedIn()) return;
        if (typeof FirestoreManager === 'undefined' || !FirestoreManager.recalculateXP) return;

        // Throttle: clear any pending sync and schedule a new one
        if (_syncThrottleTimer) clearTimeout(_syncThrottleTimer);

        _syncThrottleTimer = setTimeout(function () {
            _syncThrottleTimer = null;
            const user = FirebaseAuth.getUser();
            if (!user) return;

            FirestoreManager.recalculateXP(user.uid).then(function () {
                _lastSyncedXP = xp;
            }).catch(function (err) {
                console.warn('[XPCalculator] Firestore XP sync failed:', err.message);
            });
        }, _SYNC_THROTTLE_MS);
    }

    // Public API
    return {
        XP_RATES,
        recalculate,
        calculateLevel,
        getLevelTier,
        isValidModuleId: _isValidId
    };

})();

// Make globally available
window.XPCalculator = XPCalculator;
