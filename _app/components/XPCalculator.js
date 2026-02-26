/**
 * XPCalculator.js - Deterministic XP Calculation Engine
 *
 * Replaces the accumulator-based XP model with a pure function that derives
 * XP entirely from completion state. XP is always recomputed from scratch —
 * never accumulated. This eliminates drift, inflation, and formula mismatches.
 *
 * Dependencies (optional, graceful fallback if missing):
 *   - ProgressManager (for getProgress, LEVEL_TIERS)
 *   - ContentCatalog (for type resolution of ambiguous module IDs)
 *   - AchievementSystem (for badge count)
 *   - GameTracker (not used directly — reads hexworth_game_tracker from localStorage)
 *
 * Load order: after ProgressManager, ContentCatalog (optional)
 *
 * Usage:
 *   const result = XPCalculator.recalculate();
 *   // { xp: 4200, level: 7, tier: {...}, breakdown: {...} }
 */
const XPCalculator = (function () {
    'use strict';

    // Canonical XP rates — single source of truth
    const XP_RATES = {
        PRESENTATION_VIEW: 50,
        TOOL_EXPLORE: 50,
        QUIZ_PASS: 100,        // 70-89%
        QUIZ_PERFECT: 200,     // 90%+
        BADGE_EARNED: 250,
        GATE_CLEARED: 500,
        LAB_COMPLETE: 500,
        GAME_HIGH_SCORE: 1000,
        MODULE_COMPLETE: 1000,
        COURSE_COMPLETE: 10000,
        DAILY_LOGIN: 25
    };

    // Tiered game rank XP
    const RANK_XP = [1000, 750, 500, 250, 100]; // #1-#5

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

        return { xp, level, tier, breakdown };
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
     * Categorize completed modules into type buckets using multi-tier resolution.
     * Mutates breakdown in-place.
     */
    function _categorizeCompletions(progress, breakdown) {
        const completed = Array.isArray(progress.completedModules)
            ? progress.completedModules : [];
        const quizHistory = Array.isArray(progress.quizHistory)
            ? progress.quizHistory : [];
        const labsCompleted = Array.isArray(progress.labsCompleted)
            ? progress.labsCompleted : [];

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

            switch (type) {
                case 'quiz': {
                    const score = quizScores[id] || 0;
                    if (score >= 90) {
                        breakdown.quizPerfect += XP_RATES.QUIZ_PERFECT;
                        breakdown._counts.quizPerfect++;
                    } else {
                        breakdown.quizzes += XP_RATES.QUIZ_PASS;
                        breakdown._counts.quizzes++;
                    }
                    break;
                }
                case 'lab':
                    breakdown.labs += XP_RATES.LAB_COMPLETE;
                    breakdown._counts.labs++;
                    break;
                case 'tool':
                    breakdown.tools += XP_RATES.TOOL_EXPLORE;
                    breakdown._counts.tools++;
                    break;
                default: // presentation (conservative fallback)
                    breakdown.presentations += XP_RATES.PRESENTATION_VIEW;
                    breakdown._counts.presentations++;
            }
        }

        // Also count quizzes that appear in quizHistory but NOT in completedModules
        // (some pages write to quizHistory without calling completeModule)
        for (const q of quizHistory) {
            if (seen.has(q.moduleId)) continue;
            seen.add(q.moduleId);
            if (q.score >= 90) {
                breakdown.quizPerfect += XP_RATES.QUIZ_PERFECT;
                breakdown._counts.quizPerfect++;
            } else if (q.score >= 70) {
                breakdown.quizzes += XP_RATES.QUIZ_PASS;
                breakdown._counts.quizzes++;
            }
        }

        // Also count labs in labsCompleted but NOT in completedModules
        for (const labId of labsCompleted) {
            if (seen.has(labId)) continue;
            seen.add(labId);
            breakdown.labs += XP_RATES.LAB_COMPLETE;
            breakdown._counts.labs++;
        }
    }

    /**
     * Multi-tier type resolution for a module ID.
     * 1. quizHistory → quiz
     * 2. labsCompleted → lab
     * 3. ContentCatalog → check href suffix
     * 4. ID suffix heuristic
     * 5. Default: presentation
     */
    function _resolveType(id, quizIds, labIds) {
        // Tier 1: explicit quiz/lab sets
        if (quizIds.has(id)) return 'quiz';
        if (labIds.has(id)) return 'lab';

        // Tier 2: ContentCatalog lookup
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

        // Tier 3: ID suffix heuristic
        const lower = id.toLowerCase();
        if (lower.endsWith('-quiz') || lower.includes('-quiz-')) return 'quiz';
        if (lower.endsWith('-lab') || lower.includes('-lab-')) return 'lab';
        if (lower.endsWith('-tool') || lower.endsWith('-applet')) return 'tool';
        if (lower.endsWith('-presentation') || lower.endsWith('-pres')) return 'presentation';

        // Tier 4: conservative default
        return 'presentation';
    }

    /**
     * Read hexworth_game_tracker and sum tiered RANK_XP for top-5 placements.
     * Only counts unique game entries (not per-session).
     */
    function _countGameXP(breakdown) {
        try {
            const raw = localStorage.getItem('hexworth_game_tracker');
            if (!raw) return;
            const tracker = JSON.parse(raw);

            // GameTracker stores per-game data keyed by gameId
            // Each game entry has a bestScore/highScore and potentially a rank from Firestore
            // For local-only calculation, we count each unique game with a recorded score
            // as a placement (tiered by relative performance isn't possible locally,
            // so we award base GAME_HIGH_SCORE for each game with a high score)
            let gamesWithScores = 0;

            if (typeof tracker === 'object' && tracker !== null) {
                for (const gameId of Object.keys(tracker)) {
                    const game = tracker[gameId];
                    if (!game || typeof game !== 'object') continue;
                    // Check if this game has a recorded score
                    if (game.bestScore > 0 || game.highScore > 0 ||
                        game.bestTime > 0 || game.wins > 0 ||
                        game.result === 'success') {
                        gamesWithScores++;
                    }
                }
            }

            // Award tiered XP: first 5 games get decreasing tiers, rest get base
            for (let i = 0; i < gamesWithScores; i++) {
                const tierXP = i < RANK_XP.length ? RANK_XP[i] : RANK_XP[RANK_XP.length - 1];
                breakdown.games += tierXP;
                breakdown._counts.games++;
            }
        } catch (e) {
            // Silent fail — game XP is a bonus, not critical
        }
    }

    /**
     * Count achievement/badge XP from AchievementSystem.
     */
    function _countBadgeXP(breakdown) {
        let badgeCount = 0;

        if (typeof AchievementSystem !== 'undefined' && AchievementSystem.getUnlockedAchievements) {
            badgeCount = AchievementSystem.getUnlockedAchievements().length;
        } else {
            // Fallback: read directly from localStorage
            try {
                const raw = localStorage.getItem('hexworth_achievements');
                if (raw) {
                    const parsed = JSON.parse(raw);
                    badgeCount = Array.isArray(parsed) ? parsed.length : 0;
                }
            } catch (e) { /* ignore */ }

            // Also check v2 format
            try {
                const v2Raw = localStorage.getItem('hexworth_achievements_v2');
                if (v2Raw) {
                    const v2 = JSON.parse(v2Raw);
                    if (v2 && v2.unlocked) {
                        badgeCount = Math.max(badgeCount, Object.keys(v2.unlocked).length);
                    }
                }
            } catch (e) { /* ignore */ }
        }

        breakdown.badges = badgeCount * XP_RATES.BADGE_EARNED;
        breakdown._counts.badges = badgeCount;
    }

    /**
     * Scan localStorage for gate_N_complete keys.
     * Gate keys use pattern: gate{N}_complete = 'true'
     */
    function _countGateXP(breakdown) {
        let gateCount = 0;

        for (let i = 1; i <= 10; i++) {
            if (localStorage.getItem(`gate${i}_complete`) === 'true') {
                gateCount++;
            }
        }

        breakdown.gates = gateCount * XP_RATES.GATE_CLEARED;
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
                courseCount = Object.keys(completions).length;
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

        breakdown.courses = courseCount * XP_RATES.COURSE_COMPLETE;
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
        breakdown.dailyLogins = loginDays * XP_RATES.DAILY_LOGIN;
        breakdown._counts.dailyLogins = loginDays;
    }

    // Public API
    return {
        XP_RATES,
        RANK_XP,
        recalculate,
        calculateLevel,
        getLevelTier
    };

})();

// Make globally available
window.XPCalculator = XPCalculator;
