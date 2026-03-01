/**
 * HandlerDirectives.js - Smart Nudges & Intel Reports for Handler Comms
 *
 * Analyzes user progress on dashboard load and injects personalized
 * "handler messages" into the ActivityFeed as directive/intel events.
 *
 * Phase 1: Smart Nudges (directive events)
 * Phase 4: Intel Reports (intel events)
 *
 * All data sourced from localStorage — no new APIs required.
 */

const HandlerDirectives = (function() {
    'use strict';

    const MAX_DIRECTIVES = 3;
    const SHOWN_KEY = 'hexworth_directives_shown';
    const INTEL_SHOWN_KEY = 'hexworth_intel_shown';
    const SESSION_KEY = 'hexworth_session_stats';

    // ═══════════════════════════════════════════════════════════════
    // PHASE 1: SMART NUDGES
    // ═══════════════════════════════════════════════════════════════

    /**
     * Get today's date string for dedup tracking
     */
    function todayKey() {
        return new Date().toDateString();
    }

    /**
     * Hash a string into a short numeric hash for dedup
     */
    function hashStr(str) {
        let h = 0;
        for (let i = 0; i < str.length; i++) {
            h = ((h << 5) - h + str.charCodeAt(i)) | 0;
        }
        return Math.abs(h).toString(36);
    }

    /**
     * Get already-shown directive hashes for today
     */
    function getShownToday() {
        try {
            const data = JSON.parse(localStorage.getItem(SHOWN_KEY) || '{}');
            if (data.date === todayKey()) return data.hashes || [];
            return [];
        } catch { return []; }
    }

    /**
     * Save shown hashes for today
     */
    function saveShown(hashes) {
        localStorage.setItem(SHOWN_KEY, JSON.stringify({
            date: todayKey(),
            hashes: hashes
        }));
    }

    /**
     * Safely read progress from ProgressManager or localStorage
     */
    function getProgress() {
        if (typeof ProgressManager !== 'undefined' && ProgressManager.getProgress) {
            return ProgressManager.getProgress();
        }
        try {
            return JSON.parse(localStorage.getItem('hexworth_progress') || '{}');
        } catch { return {}; }
    }

    /**
     * Get XP/level from XPCalculator or progress
     */
    function getXPData() {
        if (typeof XPCalculator !== 'undefined' && XPCalculator.recalculate) {
            return XPCalculator.recalculate();
        }
        const p = getProgress();
        return { xp: p.xp || 0, level: p.level || 1 };
    }

    /**
     * Get house display name from ID
     */
    function houseName(id) {
        const names = {
            shield: 'Shield House', forge: 'The Forge', web: 'Web House',
            script: 'Script House', cloud: 'Cloud House', code: 'Code House',
            key: 'Key House', machine: 'House of the Machine', matrix: 'Matrix House'
        };
        return names[id] || id;
    }

    // ─────────────────────────────────────────────────────────────
    // NUDGE GENERATORS (priority order)
    // ─────────────────────────────────────────────────────────────

    function nudgeInactivity() {
        const lastVisit = localStorage.getItem('hexworth_last_visit');
        if (!lastVisit) return null;
        const days = Math.floor((Date.now() - new Date(lastVisit).getTime()) / 86400000);
        if (days >= 3) {
            return { priority: 100, message: `Radio silence detected. ${days} days since last contact.` };
        }
        return null;
    }

    function nudgeStreakAtRisk() {
        const streak = parseInt(localStorage.getItem('hexworth_streak') || '0');
        if (streak <= 0) return null;
        const lastVisit = localStorage.getItem('hexworth_last_visit');
        if (!lastVisit) return null;
        const lastDate = new Date(lastVisit).toDateString();
        const today = new Date().toDateString();
        if (lastDate === today) return null; // Already visited today
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        if (lastDate === yesterday.toDateString()) {
            return { priority: 90, message: `Your ${streak}-day streak is on the line. Don't break the chain.` };
        }
        return null;
    }

    function nudgeNearCompletion() {
        const progress = getProgress();
        if (!progress.houses) return null;
        for (const [id, house] of Object.entries(progress.houses)) {
            const pct = house.progressPercent || 0;
            if (pct >= 70 && pct < 100) {
                const completed = (house.modulesCompleted || []).length;
                const totalEstimate = Math.round(completed / (pct / 100));
                const remaining = totalEstimate - completed;
                return {
                    priority: 80,
                    message: `You're ${pct}% through ${houseName(id)}. ${remaining > 0 ? remaining : 'A few'} modules to mastery.`
                };
            }
        }
        return null;
    }

    function nudgeResume() {
        const progress = getProgress();
        if (!progress.houses) return null;
        let mostRecent = null;
        let mostRecentTime = 0;

        for (const [id, house] of Object.entries(progress.houses)) {
            const t = house.lastAccessed || 0;
            if (t > mostRecentTime && (house.modulesCompleted || []).length > 0) {
                mostRecentTime = t;
                mostRecent = id;
            }
        }

        if (!mostRecent) return null;

        // Try to get next incomplete module
        if (typeof LearningPaths !== 'undefined' && LearningPaths.getNextIncompleteModule) {
            const completedIds = progress.houses[mostRecent].modulesCompleted || [];
            const next = LearningPaths.getNextIncompleteModule(mostRecent, completedIds);
            if (next) {
                return {
                    priority: 70,
                    message: `Resume mission: ${next.title || next.id} in ${houseName(mostRecent)}.`
                };
            }
        }

        return {
            priority: 70,
            message: `Resume operations in ${houseName(mostRecent)}.`
        };
    }

    function nudgeNewContent() {
        const lastVersion = localStorage.getItem('hexworth_last_version');
        try {
            // Compare against loaded version if available
            if (typeof UpdateManager !== 'undefined' && UpdateManager.getCurrentVersion) {
                const current = UpdateManager.getCurrentVersion();
                if (lastVersion && lastVersion !== current) {
                    return { priority: 85, message: 'New intel available. Platform updated — check the changelog.' };
                }
            }
        } catch { /* ignore */ }
        return null;
    }

    function nudgeMilestone() {
        const { xp, level } = getXPData();
        const targets = [10, 20, 30, 50, 75, 100];
        for (const target of targets) {
            if (level < target && target - level <= 2) {
                // Estimate XP needed: level N requires N*(N-1)*25 XP
                const xpForTarget = target * (target - 1) * 25;
                const needed = Math.max(0, xpForTarget - xp);
                return {
                    priority: 50,
                    message: `Level ${target} within reach. ${needed.toLocaleString()} XP remaining.`
                };
            }
        }
        return null;
    }

    function nudgeQuizRetry() {
        const progress = getProgress();
        if (!Array.isArray(progress.quizHistory)) return null;
        for (const quiz of progress.quizHistory) {
            if (quiz.score < 80) {
                const name = (quiz.moduleId || 'unknown').replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
                return {
                    priority: 40,
                    message: `Suboptimal performance on ${name}. Consider retesting.`
                };
            }
        }
        return null;
    }

    function nudgeExplorePrompt() {
        const progress = getProgress();
        if (!progress.houses) return null;
        const knownHouses = ['shield', 'forge', 'web', 'script', 'cloud', 'code', 'key'];
        const unexplored = knownHouses.filter(h => {
            const house = progress.houses[h];
            return !house || (house.modulesCompleted || []).length === 0;
        });
        // Only show if user has started some houses but 3+ remain unexplored
        const explored = knownHouses.length - unexplored.length;
        if (explored > 0 && unexplored.length >= 3) {
            const pick = unexplored[Math.floor(Math.random() * unexplored.length)];
            return {
                priority: 30,
                message: `Uncharted territory: ${houseName(pick)} awaits your first mission.`
            };
        }
        return null;
    }

    // ─────────────────────────────────────────────────────────────
    // ANALYSIS ENGINE
    // ─────────────────────────────────────────────────────────────

    /**
     * Run all nudge generators, return top MAX_DIRECTIVES by priority.
     * Deduplicates against already-shown directives for today.
     */
    function analyze() {
        const generators = [
            nudgeInactivity,
            nudgeStreakAtRisk,
            nudgeNearCompletion,
            nudgeResume,
            nudgeNewContent,
            nudgeMilestone,
            nudgeQuizRetry,
            nudgeExplorePrompt
        ];

        const shownHashes = getShownToday();
        const candidates = [];

        for (const gen of generators) {
            try {
                const result = gen();
                if (result) {
                    const h = hashStr(result.message);
                    if (!shownHashes.includes(h)) {
                        candidates.push({ ...result, hash: h });
                    }
                }
            } catch (e) {
                console.warn('[HandlerDirectives] Nudge generator error:', e);
            }
        }

        // Sort by priority descending, pick top N
        candidates.sort((a, b) => b.priority - a.priority);
        return candidates.slice(0, MAX_DIRECTIVES);
    }

    /**
     * Inject directives into ActivityFeed
     */
    function inject() {
        if (typeof ActivityFeed === 'undefined') return;

        const directives = analyze();
        if (directives.length === 0) return;

        const shownHashes = getShownToday();
        directives.forEach(d => {
            ActivityFeed.record('directive', { message: d.message });
            shownHashes.push(d.hash);
        });
        saveShown(shownHashes);
    }

    // ═══════════════════════════════════════════════════════════════
    // PHASE 4: INTEL REPORTS
    // ═══════════════════════════════════════════════════════════════

    /**
     * Get intel-shown hashes for today
     */
    function getIntelShownToday() {
        try {
            const data = JSON.parse(localStorage.getItem(INTEL_SHOWN_KEY) || '{}');
            if (data.date === todayKey()) return data.hashes || [];
            return [];
        } catch { return []; }
    }

    function saveIntelShown(hashes) {
        localStorage.setItem(INTEL_SHOWN_KEY, JSON.stringify({
            date: todayKey(),
            hashes: hashes
        }));
    }

    /**
     * Session summary — fires when last visit > 1 hour ago
     */
    function intelSessionSummary() {
        const lastSession = JSON.parse(localStorage.getItem(SESSION_KEY) || 'null');
        if (!lastSession) return null;

        const elapsed = Date.now() - (lastSession.timestamp || 0);
        if (elapsed < 3600000) return null; // Less than 1 hour

        const parts = [];
        if (lastSession.modules > 0) parts.push(`${lastSession.modules} module${lastSession.modules > 1 ? 's' : ''}`);
        if (lastSession.xpGained > 0) parts.push(`+${lastSession.xpGained.toLocaleString()} XP`);

        if (parts.length === 0) return null;

        const { level } = getXPData();
        return {
            message: `Last session: ${parts.join(', ')}. Current level: ${level}.`
        };
    }

    /**
     * Weekly debrief — Monday, first visit of the week
     */
    function intelWeeklyDebrief() {
        const now = new Date();
        if (now.getDay() !== 1) return null; // Monday only

        // Check if already shown this week
        const weekNum = getWeekNumber(now);
        const lastWeekly = localStorage.getItem('hexworth_last_weekly_debrief');
        if (lastWeekly === String(weekNum)) return null;

        // Calculate last 7 days of activity from feed
        const events = (typeof ActivityFeed !== 'undefined') ? ActivityFeed.getEvents() : [];
        const weekAgo = Date.now() - 7 * 86400000;
        const weekEvents = events.filter(e => e.timestamp > weekAgo);

        const modules = weekEvents.filter(e => e.type === 'module_complete').length;
        const quizzes = weekEvents.filter(e => e.type === 'module_complete' && e.data?.score).length;
        const xp = weekEvents.filter(e => e.type === 'xp_gain').reduce((sum, e) => sum + (e.data?.amount || 0), 0);

        localStorage.setItem('hexworth_last_weekly_debrief', String(weekNum));

        const weekLabel = `Week ${weekNum}`;
        return {
            message: `${weekLabel} report: ${modules} modules, ${quizzes} quizzes, ${xp.toLocaleString()} XP earned.`
        };
    }

    /**
     * Overall status — daily, first visit
     */
    function intelOverallStatus() {
        const progress = getProgress();
        const { level } = getXPData();
        const streak = parseInt(localStorage.getItem('hexworth_streak') || '0');

        let totalModules = 0;
        if (Array.isArray(progress.completedModules)) {
            totalModules = progress.completedModules.length;
        }

        if (totalModules === 0 && level <= 1) return null;

        const parts = [`${totalModules} modules complete`, `Level ${level}`];
        if (streak > 1) parts.push(`${streak}-day streak`);

        return { message: parts.join('. ') + '.' };
    }

    /**
     * Get ISO week number
     */
    function getWeekNumber(date) {
        const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
        const dayNum = d.getUTCDay() || 7;
        d.setUTCDate(d.getUTCDate() + 4 - dayNum);
        const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
        return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    }

    /**
     * Generate and inject intel reports into ActivityFeed
     */
    function injectIntel() {
        if (typeof ActivityFeed === 'undefined') return;

        const generators = [intelSessionSummary, intelWeeklyDebrief, intelOverallStatus];
        const shownHashes = getIntelShownToday();

        for (const gen of generators) {
            try {
                const report = gen();
                if (report) {
                    const h = hashStr(report.message);
                    if (!shownHashes.includes(h)) {
                        ActivityFeed.record('intel', { message: report.message });
                        shownHashes.push(h);
                    }
                }
            } catch (e) {
                console.warn('[HandlerDirectives] Intel report error:', e);
            }
        }

        saveIntelShown(shownHashes);
    }

    // ═══════════════════════════════════════════════════════════════
    // SESSION TRACKING (for intel reports)
    // ═══════════════════════════════════════════════════════════════

    /**
     * Snapshot current stats so next session can compare
     */
    function snapshotSession() {
        const progress = getProgress();
        const { xp } = getXPData();
        const modules = Array.isArray(progress.completedModules) ? progress.completedModules.length : 0;

        const prev = JSON.parse(localStorage.getItem(SESSION_KEY) || 'null');
        const prevModules = prev ? (prev.totalModules || 0) : modules;
        const prevXP = prev ? (prev.totalXP || 0) : xp;

        localStorage.setItem(SESSION_KEY, JSON.stringify({
            timestamp: Date.now(),
            totalModules: modules,
            totalXP: xp,
            modules: modules - prevModules,
            xpGained: xp - prevXP
        }));
    }

    // Public API
    return {
        analyze,
        inject,
        injectIntel,
        snapshotSession
    };
})();

window.HandlerDirectives = HandlerDirectives;
