/**
 * DifficultyMetrics.js - Module Difficulty Analytics & Grant Reporting
 *
 * Tracks per-module learning analytics for difficulty analysis:
 *   - Time-to-complete (start to completion)
 *   - Retry rate (attempts before success)
 *   - Hint usage (CTF boxes)
 *   - Score distribution (quizzes, games)
 *   - Abandonment (started but not completed)
 *
 * Storage: localStorage key 'hexworth_difficulty_metrics' (JSON object keyed by moduleId)
 *
 * Dependencies (optional, graceful fallback if missing):
 *   - ContentCatalog (for module titles, house assignments)
 *   - ProgressManager (for completion state cross-reference)
 *
 * Load order: after ContentCatalog (optional)
 *
 * Usage:
 *   DifficultyMetrics.startModule('shield-firewall-quiz')
 *   DifficultyMetrics.recordRetry('shield-firewall-quiz')
 *   DifficultyMetrics.completeModule('shield-firewall-quiz', 85)
 *   var report = DifficultyMetrics.exportForGrant()
 */
var DifficultyMetrics = (function () {
    'use strict';

    var STORAGE_KEY = 'hexworth_difficulty_metrics';

    // Expected durations (minutes) by module type when ContentCatalog has no duration field.
    // These are conservative estimates used as baselines for difficulty scoring.
    var DEFAULT_DURATIONS = {
        presentation: 15,
        quiz: 10,
        lab: 30,
        applet: 20,
        tool: 15,
        module: 20,
        game: 10
    };

    // Known houses for validation
    var KNOWN_HOUSES = ['web', 'shield', 'forge', 'script', 'cloud', 'code', 'key', 'eye', 'ai', 'linux', 'arena'];

    // ── Persistence ────────────────────────────────────────────────

    function _load() {
        try {
            var raw = localStorage.getItem(STORAGE_KEY);
            return raw ? JSON.parse(raw) : {};
        } catch (e) {
            return {};
        }
    }

    function _save(data) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        } catch (e) {
            console.warn('[DifficultyMetrics] Failed to save:', e.message);
        }
    }

    function _ensureEntry(data, moduleId) {
        if (!data[moduleId]) {
            data[moduleId] = {
                startTimes: [],        // timestamps of each start
                completions: [],       // array of { timestamp, score, duration }
                retries: 0,            // total retry count
                hints: 0,              // total hint views
                abandoned: false       // marked if started but session ended without completion
            };
        }
        return data[moduleId];
    }

    // ── Module Type Resolution ─────────────────────────────────────

    /**
     * Resolve a module type from ContentCatalog or ID heuristics.
     * Returns 'presentation', 'quiz', 'lab', 'applet', 'tool', 'module', or 'game'.
     */
    function _resolveType(moduleId) {
        // Try ContentCatalog first
        if (typeof ContentCatalog !== 'undefined' && ContentCatalog.getHouseModules) {
            try {
                var allModules = ContentCatalog.getAllModules();
                for (var i = 0; i < allModules.length; i++) {
                    if (allModules[i].id === moduleId) {
                        var mod = allModules[i];
                        if (mod.href) {
                            var href = mod.href.toLowerCase();
                            if (href.indexOf('.quiz.html') !== -1) return 'quiz';
                            if (href.indexOf('.lab.html') !== -1) return 'lab';
                            if (href.indexOf('.applet.html') !== -1) return 'applet';
                            if (href.indexOf('.tool.html') !== -1) return 'tool';
                            if (href.indexOf('.module.html') !== -1) return 'module';
                            if (href.indexOf('.presentation.html') !== -1) return 'presentation';
                        }
                        if (mod.components && mod.components.length === 1) {
                            return mod.components[0];
                        }
                        break;
                    }
                }
            } catch (e) { /* fallback to heuristics */ }
        }

        // ID suffix heuristics
        var lower = moduleId.toLowerCase();
        if (lower.indexOf('-quiz') !== -1) return 'quiz';
        if (lower.indexOf('-lab') !== -1) return 'lab';
        if (lower.indexOf('-applet') !== -1) return 'applet';
        if (lower.indexOf('-tool') !== -1) return 'tool';
        if (lower.indexOf('-module') !== -1) return 'module';
        if (lower.indexOf('-pres') !== -1) return 'presentation';

        return 'presentation'; // conservative default
    }

    /**
     * Get expected duration in minutes for a module.
     * Uses type-based defaults since ContentCatalog does not store duration.
     */
    function _getExpectedDuration(moduleId) {
        var type = _resolveType(moduleId);
        return DEFAULT_DURATIONS[type] || 15;
    }

    /**
     * Extract house from a module ID.
     */
    function _getHouse(moduleId) {
        if (!moduleId || typeof moduleId !== 'string') return 'unknown';
        if (moduleId.indexOf('dark-arts') === 0) return 'dark-arts';
        var dash = moduleId.indexOf('-');
        if (dash < 1) return 'unknown';
        var house = moduleId.slice(0, dash);
        if (KNOWN_HOUSES.indexOf(house) !== -1) return house;
        return 'unknown';
    }

    /**
     * Get module title from ContentCatalog or fall back to moduleId.
     */
    function _getTitle(moduleId) {
        if (typeof ContentCatalog !== 'undefined' && ContentCatalog.getAllModules) {
            try {
                var allModules = ContentCatalog.getAllModules();
                for (var i = 0; i < allModules.length; i++) {
                    if (allModules[i].id === moduleId) {
                        return allModules[i].title || moduleId;
                    }
                }
            } catch (e) { /* fallback */ }
        }
        return moduleId;
    }

    // ── Public API ─────────────────────────────────────────────────

    /**
     * Mark the start of a module session.
     * Records a start timestamp and marks as potentially abandoned.
     */
    function startModule(moduleId) {
        if (!moduleId) return;
        var data = _load();
        var entry = _ensureEntry(data, moduleId);
        entry.startTimes.push(Date.now());
        entry.abandoned = true; // will be cleared on completeModule
        // Keep only last 50 start times to limit storage growth
        if (entry.startTimes.length > 50) {
            entry.startTimes = entry.startTimes.slice(-50);
        }
        _save(data);
    }

    /**
     * Mark a module as completed with an optional score.
     * Calculates duration from the most recent startModule call.
     */
    function completeModule(moduleId, score) {
        if (!moduleId) return;
        var data = _load();
        var entry = _ensureEntry(data, moduleId);
        var now = Date.now();

        // Calculate duration from last start time
        var duration = null;
        if (entry.startTimes.length > 0) {
            var lastStart = entry.startTimes[entry.startTimes.length - 1];
            duration = Math.round((now - lastStart) / 1000); // seconds
            // Sanity check: cap at 4 hours (14400s) to filter out stale starts
            if (duration > 14400) {
                duration = null;
            }
        }

        entry.completions.push({
            timestamp: now,
            score: (score != null) ? score : null,
            duration: duration
        });

        // Keep only last 20 completions
        if (entry.completions.length > 20) {
            entry.completions = entry.completions.slice(-20);
        }

        entry.abandoned = false;
        _save(data);
    }

    /**
     * Record a hint view for a module (CTF boxes, labs).
     */
    function recordHint(moduleId) {
        if (!moduleId) return;
        var data = _load();
        var entry = _ensureEntry(data, moduleId);
        entry.hints++;
        _save(data);
    }

    /**
     * Record a retry attempt for a module (quizzes, labs).
     */
    function recordRetry(moduleId) {
        if (!moduleId) return;
        var data = _load();
        var entry = _ensureEntry(data, moduleId);
        entry.retries++;
        _save(data);
    }

    /**
     * Get all tracked metrics for a specific module.
     * Returns a computed summary object.
     */
    function getMetrics(moduleId) {
        if (!moduleId) return null;
        var data = _load();
        var entry = data[moduleId];
        if (!entry) return null;

        var completionCount = entry.completions.length;
        var avgScore = null;
        var avgDuration = null;
        var scores = [];
        var durations = [];

        for (var i = 0; i < entry.completions.length; i++) {
            var c = entry.completions[i];
            if (c.score != null) scores.push(c.score);
            if (c.duration != null) durations.push(c.duration);
        }

        if (scores.length > 0) {
            var sum = 0;
            for (var j = 0; j < scores.length; j++) sum += scores[j];
            avgScore = Math.round(sum / scores.length);
        }

        if (durations.length > 0) {
            var dSum = 0;
            for (var k = 0; k < durations.length; k++) dSum += durations[k];
            avgDuration = Math.round(dSum / durations.length);
        }

        return {
            moduleId: moduleId,
            title: _getTitle(moduleId),
            house: _getHouse(moduleId),
            type: _resolveType(moduleId),
            completions: completionCount,
            retries: entry.retries,
            hints: entry.hints,
            abandoned: entry.abandoned,
            avgScore: avgScore,
            avgDuration: avgDuration,         // seconds
            avgDurationMinutes: avgDuration != null ? Math.round(avgDuration / 60 * 10) / 10 : null,
            scores: scores,
            durations: durations,
            firstStarted: entry.startTimes.length > 0 ? entry.startTimes[0] : null,
            lastCompleted: completionCount > 0 ? entry.completions[completionCount - 1].timestamp : null
        };
    }

    /**
     * Get all tracked metrics across all modules.
     * Returns an object keyed by moduleId.
     */
    function getAllMetrics() {
        var data = _load();
        var result = {};
        var keys = Object.keys(data);
        for (var i = 0; i < keys.length; i++) {
            var m = getMetrics(keys[i]);
            if (m) result[keys[i]] = m;
        }
        return result;
    }

    /**
     * Compute a difficulty score (1-10) for a module.
     *
     * Formula:
     *   - Base: ratio of avg time-to-complete vs expected duration (scaled 1-5)
     *   - +1 per retry beyond the first attempt
     *   - +1 if hint usage > 2
     *   - -1 if average score > 90%
     *   - Clamped to 1-10
     */
    function getDifficultyScore(moduleId) {
        var metrics = getMetrics(moduleId);
        if (!metrics) return null;

        // If never completed, score based on abandonment and retries
        if (metrics.completions === 0) {
            var score = 5; // neutral baseline for uncompleted
            if (metrics.abandoned) score += 2;
            score += Math.min(metrics.retries, 3);
            if (metrics.hints > 2) score += 1;
            return Math.max(1, Math.min(10, score));
        }

        // Base: time ratio (avg actual / expected)
        var expectedMinutes = _getExpectedDuration(moduleId);
        var expectedSeconds = expectedMinutes * 60;
        var base = 3; // neutral default if no duration data

        if (metrics.avgDuration != null && expectedSeconds > 0) {
            var ratio = metrics.avgDuration / expectedSeconds;
            // ratio < 0.5 = very easy (1-2), ratio ~1 = normal (3), ratio > 2 = hard (5+)
            base = Math.round(ratio * 3);
            base = Math.max(1, Math.min(5, base));
        }

        var difficulty = base;

        // +1 per retry beyond the first attempt (cap contribution at +3)
        var retryBonus = Math.min(metrics.retries, 3);
        difficulty += retryBonus;

        // +1 if hint usage > 2
        if (metrics.hints > 2) {
            difficulty += 1;
        }

        // -1 if average score > 90% (module is easy for this learner)
        if (metrics.avgScore != null && metrics.avgScore > 90) {
            difficulty -= 1;
        }

        return Math.max(1, Math.min(10, difficulty));
    }

    /**
     * Get structured data for a difficulty analytics dashboard panel.
     * Returns top/bottom modules, house averages, abandonment, and score distribution.
     */
    function getDashboardData() {
        var allMetrics = getAllMetrics();
        var moduleIds = Object.keys(allMetrics);

        // Build scored list
        var scored = [];
        for (var i = 0; i < moduleIds.length; i++) {
            var id = moduleIds[i];
            var m = allMetrics[id];
            var diff = getDifficultyScore(id);
            if (diff != null) {
                scored.push({
                    moduleId: id,
                    title: m.title,
                    house: m.house,
                    type: m.type,
                    difficulty: diff,
                    avgTime: m.avgDurationMinutes,
                    avgScore: m.avgScore,
                    retries: m.retries,
                    hints: m.hints,
                    completions: m.completions,
                    abandoned: m.abandoned
                });
            }
        }

        // Sort by difficulty descending
        var sorted = scored.slice().sort(function (a, b) { return b.difficulty - a.difficulty; });

        // Top 10 hardest
        var hardest = sorted.slice(0, 10);

        // Top 10 easiest (sort ascending, take first 10)
        var easiest = scored.slice().sort(function (a, b) { return a.difficulty - b.difficulty; }).slice(0, 10);

        // Average completion time by house
        var houseTimeSum = {};
        var houseTimeCount = {};
        var houseDiffSum = {};
        var houseDiffCount = {};
        var houseCompletions = {};
        var houseTotal = {};

        for (var j = 0; j < scored.length; j++) {
            var s = scored[j];
            var h = s.house;
            if (!houseTimeSum[h]) {
                houseTimeSum[h] = 0;
                houseTimeCount[h] = 0;
                houseDiffSum[h] = 0;
                houseDiffCount[h] = 0;
                houseCompletions[h] = 0;
                houseTotal[h] = 0;
            }
            houseTotal[h]++;
            if (s.avgTime != null) {
                houseTimeSum[h] += s.avgTime;
                houseTimeCount[h]++;
            }
            houseDiffSum[h] += s.difficulty;
            houseDiffCount[h]++;
            if (s.completions > 0) houseCompletions[h]++;
        }

        var houseAverages = {};
        var houseKeys = Object.keys(houseTimeSum);
        for (var k = 0; k < houseKeys.length; k++) {
            var hk = houseKeys[k];
            houseAverages[hk] = {
                avgTime: houseTimeCount[hk] > 0 ? Math.round(houseTimeSum[hk] / houseTimeCount[hk] * 10) / 10 : null,
                avgDifficulty: houseDiffCount[hk] > 0 ? Math.round(houseDiffSum[hk] / houseDiffCount[hk] * 10) / 10 : null,
                completionRate: houseTotal[hk] > 0 ? Math.round(houseCompletions[hk] / houseTotal[hk] * 100) : 0,
                totalModules: houseTotal[hk]
            };
        }

        // Abandonment rates
        var abandonedCount = 0;
        var startedCount = 0;
        for (var a = 0; a < scored.length; a++) {
            startedCount++;
            if (scored[a].abandoned && scored[a].completions === 0) {
                abandonedCount++;
            }
        }

        // Score distribution histogram (buckets: 0-9, 10-19, ..., 90-100)
        var scoreBuckets = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]; // 10 buckets
        var totalScores = 0;
        for (var b = 0; b < moduleIds.length; b++) {
            var bm = allMetrics[moduleIds[b]];
            if (bm.scores) {
                for (var c = 0; c < bm.scores.length; c++) {
                    var sc = bm.scores[c];
                    var bucket = Math.min(Math.floor(sc / 10), 9);
                    scoreBuckets[bucket]++;
                    totalScores++;
                }
            }
        }

        return {
            hardest: hardest,
            easiest: easiest,
            houseAverages: houseAverages,
            abandonment: {
                started: startedCount,
                abandoned: abandonedCount,
                rate: startedCount > 0 ? Math.round(abandonedCount / startedCount * 100) : 0
            },
            scoreDistribution: {
                buckets: ['0-9', '10-19', '20-29', '30-39', '40-49', '50-59', '60-69', '70-79', '80-89', '90-100'],
                counts: scoreBuckets,
                total: totalScores
            },
            totalModulesTracked: moduleIds.length,
            generatedAt: new Date().toISOString()
        };
    }

    /**
     * Export analytics in a structured format suitable for grant reporting.
     * Returns a JSON-serializable object with aggregate and per-module data.
     */
    function exportForGrant() {
        var allMetrics = getAllMetrics();
        var moduleIds = Object.keys(allMetrics);

        // Aggregate counters
        var totalCompletions = 0;
        var totalTimeSeconds = 0;
        var timeCount = 0;

        // Per-module rows
        var moduleMetrics = [];

        for (var i = 0; i < moduleIds.length; i++) {
            var id = moduleIds[i];
            var m = allMetrics[id];
            var diff = getDifficultyScore(id);

            totalCompletions += m.completions;
            if (m.avgDuration != null) {
                totalTimeSeconds += m.avgDuration;
                timeCount++;
            }

            moduleMetrics.push({
                moduleId: id,
                title: m.title,
                house: m.house,
                difficulty: diff,
                avgTime: m.avgDurationMinutes != null ? m.avgDurationMinutes + 'm' : 'N/A',
                avgScore: m.avgScore != null ? m.avgScore : 'N/A',
                retryRate: m.completions > 0 ? Math.round(m.retries / m.completions * 100) / 100 : 0,
                completionRate: (m.completions > 0 || !m.abandoned) ? 100 : 0
            });
        }

        // Sort by difficulty descending for the report
        moduleMetrics.sort(function (a, b) {
            return (b.difficulty || 0) - (a.difficulty || 0);
        });

        // House-level aggregation
        var houseMap = {};
        for (var j = 0; j < moduleMetrics.length; j++) {
            var mm = moduleMetrics[j];
            var h = mm.house;
            if (!houseMap[h]) {
                houseMap[h] = { diffSum: 0, diffCount: 0, timeSum: 0, timeCount: 0, completed: 0, total: 0 };
            }
            houseMap[h].total++;
            if (mm.difficulty != null) {
                houseMap[h].diffSum += mm.difficulty;
                houseMap[h].diffCount++;
            }
            if (mm.avgTime !== 'N/A') {
                houseMap[h].timeSum += parseFloat(mm.avgTime);
                houseMap[h].timeCount++;
            }
            if (mm.completionRate > 0) houseMap[h].completed++;
        }

        var houseMetrics = [];
        var houseKeys = Object.keys(houseMap);
        for (var k = 0; k < houseKeys.length; k++) {
            var hk = houseKeys[k];
            var hd = houseMap[hk];
            houseMetrics.push({
                house: hk,
                avgDifficulty: hd.diffCount > 0 ? Math.round(hd.diffSum / hd.diffCount * 10) / 10 : null,
                avgTime: hd.timeCount > 0 ? Math.round(hd.timeSum / hd.timeCount * 10) / 10 + 'm' : 'N/A',
                completionRate: hd.total > 0 ? Math.round(hd.completed / hd.total * 100) + '%' : '0%'
            });
        }

        // Estimate unique students from completion patterns
        // Since this is localStorage (single user), totalStudents is 1.
        // Firestore aggregation would give multi-student counts.
        var totalStudents = moduleIds.length > 0 ? 1 : 0;

        var avgTimeMinutes = timeCount > 0 ? Math.round(totalTimeSeconds / timeCount / 60 * 10) / 10 : 0;

        return {
            reportDate: new Date().toISOString().slice(0, 10),
            totalStudents: totalStudents,
            totalCompletions: totalCompletions,
            averageTimeToComplete: avgTimeMinutes + 'm',
            moduleMetrics: moduleMetrics,
            houseMetrics: houseMetrics
        };
    }

    /**
     * Clear all difficulty metrics data.
     */
    function reset() {
        localStorage.removeItem(STORAGE_KEY);
    }

    // Public API
    return {
        startModule: startModule,
        completeModule: completeModule,
        recordHint: recordHint,
        recordRetry: recordRetry,
        getMetrics: getMetrics,
        getAllMetrics: getAllMetrics,
        getDifficultyScore: getDifficultyScore,
        getDashboardData: getDashboardData,
        exportForGrant: exportForGrant,
        reset: reset
    };

})();

// Make globally available
window.DifficultyMetrics = DifficultyMetrics;
