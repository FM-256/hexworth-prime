/**
 * XPMasterLedger.js - Canonical XP Value Registry for Hexworth Prime
 *
 * Single source of truth for ALL XP values in the platform.
 * Every XP-granting action maps to a category with a default value.
 * Specific items can override the default via the overrides map.
 *
 * The XP formula is: totalXP = SUM(item.xp WHERE item.completed)
 *
 * This file does NOT replace XPCalculator.js — it feeds it.
 * XPCalculator reads completion state from localStorage/ProgressManager
 * and uses this ledger to determine how much each item is worth.
 *
 * Dependencies: none (standalone, no imports)
 * Optional: ContentCatalog (for audit method)
 *
 * Load order: before XPCalculator
 *
 * @version 1.0.0
 */
var XPMasterLedger = (function() {
    'use strict';

    // ═══════════════════════════════════════════════════════════════════
    // VERSION
    // ═══════════════════════════════════════════════════════════════════

    var VERSION = '1.0.0';

    // ═══════════════════════════════════════════════════════════════════
    // CATEGORY XP VALUES
    // ═══════════════════════════════════════════════════════════════════
    //
    // These are the canonical XP values per category. Every XP-granting
    // item in the platform belongs to exactly one category. If an item
    // needs a different value, add it to the overrides map below.
    //
    // Values are calibrated against existing XPCalculator.XP_RATES:
    //   PRESENTATION_VIEW: 100  |  QUIZ_PASS: 100  |  QUIZ_PERFECT: 200
    //   LAB_COMPLETE: 500       |  GAME_PLAYED: 100 |  GATE_CLEARED: 500
    //   TOOL_EXPLORE: 100       |  MODULE_COMPLETE: 1000
    //   COURSE_COMPLETE: 10000  |  DAILY_LOGIN: 25

    var values = {
        // --- Content completions ---
        presentation: 100,      // viewing/completing a presentation
        quiz_pass: 100,         // passing a quiz (70-89%)
        quiz_perfect: 200,      // perfect quiz score (90%+)
        lab: 500,               // completing a hands-on lab
        applet: 100,            // completing an applet/interactive tool
        tool: 100,              // exploring a tool
        module: 100,            // completing a standalone module (e.g. Linux Mastery lessons)
        game: 100,              // playing a game (any recorded score)
        review: 100,            // completing a review (Jeopardy-style)
        reference: 0,           // reference pages grant no XP (passive content)

        // --- Progression milestones ---
        gate: 500,              // clearing a Dark Arts gate
        course_completion: 10000, // finishing all modules in a house/course
        house_completion: 10000,  // alias for course_completion (same concept)

        // --- Meta rewards ---
        achievement: 50,        // earning an achievement (default; most have custom points)
        daily_login: 25,        // per day of login streak (capped at 365 days)
        streak_day: 25,         // alias for daily_login

        // --- CTF Arena ---
        box_flag: 100,          // capturing a CTF flag in the arena
        box_complete: 500       // completing an entire CTF box
    };

    // ═══════════════════════════════════════════════════════════════════
    // ITEM OVERRIDES
    // ═══════════════════════════════════════════════════════════════════
    //
    // Override the category default for specific items.
    // Key: module ID or item identifier
    // Value: XP amount (replaces the category default entirely)
    //
    // Use this sparingly. The whole point of the ledger is that most
    // items use category defaults. Overrides are for exceptional cases.

    var overrides = {
        // Dark Arts gates scale with difficulty
        // (gates 1-5 use default 500, gates 6+ are harder)
        'dark-arts-gate-6': 600,
        'dark-arts-gate-7': 700,
        'dark-arts-gate-8': 800
    };

    // ═══════════════════════════════════════════════════════════════════
    // CATEGORY MAPPING
    // ═══════════════════════════════════════════════════════════════════
    //
    // Maps ContentCatalog component types and href suffixes to ledger
    // categories. Used by getXP() and the audit tool.

    var componentToCategory = {
        'presentation': 'presentation',
        'quiz': 'quiz_pass',       // default; quiz_perfect resolved at runtime by score
        'lab': 'lab',
        'applet': 'applet',
        'tool': 'tool',
        'module': 'module',
        'game': 'game',
        'review': 'review',
        'reference': 'reference',
        'guide': 'reference',
        'textbook': 'reference',
        'notes': 'reference',
        'exam': 'quiz_pass',
        'challenge': 'lab'
    };

    var hrefToCategory = {
        '.presentation.html': 'presentation',
        '.quiz.html': 'quiz_pass',
        '.lab.html': 'lab',
        '.applet.html': 'applet',
        '.tool.html': 'tool',
        '.module.html': 'module'
    };

    // ═══════════════════════════════════════════════════════════════════
    // PUBLIC METHODS
    // ═══════════════════════════════════════════════════════════════════

    /**
     * Get XP value for a specific item.
     *
     * Resolution order:
     * 1. Check overrides map for exact item ID
     * 2. Use category default from values map
     * 3. Return 0 if category is unknown
     *
     * @param {string} itemId - Module/item identifier
     * @param {string} category - Category key (e.g. 'presentation', 'quiz_pass', 'lab')
     * @returns {number} XP value
     */
    function getXP(itemId, category) {
        // Check overrides first
        if (itemId && overrides[itemId] !== undefined) {
            return overrides[itemId];
        }
        // Fall back to category default
        if (category && values[category] !== undefined) {
            return values[category];
        }
        return 0;
    }

    /**
     * Calculate total XP for an array of completed items.
     *
     * @param {Array<{id: string, category: string}>} completedItems
     * @returns {number} Total XP
     */
    function calculateTotal(completedItems) {
        if (!Array.isArray(completedItems)) return 0;
        var total = 0;
        for (var i = 0; i < completedItems.length; i++) {
            var item = completedItems[i];
            total += getXP(item.id, item.category);
        }
        return total;
    }

    /**
     * Resolve a ContentCatalog module to its XP category.
     *
     * Uses the module's primary component type, falling back to href
     * suffix analysis if the component list is ambiguous.
     *
     * @param {Object} mod - ContentCatalog module object
     * @returns {string} Category key from the values map
     */
    function resolveCategory(mod) {
        if (!mod) return 'presentation';

        var comps = mod.components || [];
        var href = (mod.href || '').toLowerCase();

        // Priority order: quiz > lab > game > applet > tool > module > presentation
        // This matches XPCalculator's resolution logic
        if (comps.indexOf('quiz') !== -1) return 'quiz_pass';
        if (comps.indexOf('lab') !== -1) return 'lab';
        if (comps.indexOf('game') !== -1) return 'game';
        if (comps.indexOf('applet') !== -1) return 'applet';
        if (comps.indexOf('tool') !== -1) return 'tool';
        if (comps.indexOf('module') !== -1) return 'module';
        if (comps.indexOf('review') !== -1) return 'review';
        if (comps.indexOf('reference') !== -1) return 'reference';
        if (comps.indexOf('presentation') !== -1) return 'presentation';

        // Fallback: check href suffix
        var suffixes = Object.keys(hrefToCategory);
        for (var i = 0; i < suffixes.length; i++) {
            if (href.indexOf(suffixes[i]) !== -1) {
                return hrefToCategory[suffixes[i]];
            }
        }

        return 'presentation'; // conservative default
    }

    /**
     * Get total count of XP-granting categories defined in the ledger.
     *
     * @returns {number}
     */
    function getCategoryCount() {
        return Object.keys(values).length;
    }

    /**
     * Get count of item-specific overrides.
     *
     * @returns {number}
     */
    function getOverrideCount() {
        return Object.keys(overrides).length;
    }

    /**
     * Audit the ledger against ContentCatalog.
     * Returns a report of discrepancies and stats.
     *
     * Requires ContentCatalog to be loaded (browser context).
     *
     * @returns {Object} Audit report
     */
    function audit() {
        var report = {
            totalModules: 0,
            availableModules: 0,
            categoryCounts: {},
            categoryXPTotals: {},
            theoreticalMaxXP: 0,
            unmappedComponents: [],
            overrideItems: Object.keys(overrides).length,
            errors: []
        };

        if (typeof ContentCatalog === 'undefined') {
            report.errors.push('ContentCatalog not loaded -- cannot audit');
            return report;
        }

        var modules = ContentCatalog.getAllModules();
        report.totalModules = modules.length;

        for (var i = 0; i < modules.length; i++) {
            var mod = modules[i];
            if (mod.status !== 'available') continue;
            report.availableModules++;

            var category = resolveCategory(mod);
            var xp = getXP(mod.id, category);

            // Track counts per category
            if (!report.categoryCounts[category]) {
                report.categoryCounts[category] = 0;
                report.categoryXPTotals[category] = 0;
            }
            report.categoryCounts[category]++;
            report.categoryXPTotals[category] += xp;
            report.theoreticalMaxXP += xp;

            // Check for unmapped component types
            var comps = mod.components || [];
            for (var j = 0; j < comps.length; j++) {
                if (!componentToCategory[comps[j]]) {
                    var entry = comps[j] + ' (in ' + mod.id + ')';
                    if (report.unmappedComponents.indexOf(entry) === -1) {
                        report.unmappedComponents.push(entry);
                    }
                }
            }
        }

        // Add non-catalog XP sources to theoretical max
        // Gates (10 max)
        for (var g = 1; g <= 10; g++) {
            var gateId = 'dark-arts-gate-' + g;
            report.theoreticalMaxXP += getXP(gateId, 'gate');
        }

        // Daily logins (365 max)
        report.theoreticalMaxXP += 365 * values.daily_login;

        // House completions (11 houses)
        var houses = ContentCatalog.getAllHouses();
        var houseCount = Object.keys(houses).length;
        report.theoreticalMaxXP += houseCount * values.course_completion;

        return report;
    }

    // ═══════════════════════════════════════════════════════════════════
    // PUBLIC API
    // ═══════════════════════════════════════════════════════════════════

    return {
        version: VERSION,
        values: values,
        overrides: overrides,
        componentToCategory: componentToCategory,
        hrefToCategory: hrefToCategory,
        getXP: getXP,
        calculateTotal: calculateTotal,
        resolveCategory: resolveCategory,
        getCategoryCount: getCategoryCount,
        getOverrideCount: getOverrideCount,
        audit: audit
    };
})();

// Make globally available
window.XPMasterLedger = XPMasterLedger;
