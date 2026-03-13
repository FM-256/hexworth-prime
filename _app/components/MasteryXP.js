/**
 * MasteryXP.js - Mastery Tier System for Hexworth Prime
 *
 * Tracks repeated engagement with modules and awards visual tier badges.
 * Tiers escalate based on completion count and quiz performance.
 *
 * Tiers:
 *   Bronze   — 1 completion                          → 10 XP
 *   Silver   — 3 completions (or reviews)            → 25 XP
 *   Gold     — 5 completions + quiz score >= 80%     → 50 XP
 *   Platinum — 10 completions + perfect quiz (100%)  → 100 XP
 *
 * Storage key per module: hexworth_mastery_{moduleId}
 * Stored shape: { tier: 'bronze', completions: 3, bestQuiz: 85 }
 *
 * Usage:
 *   MasteryXP.recordCompletion('forge-md100-m01', 92);
 *   MasteryXP.getTier('forge-md100-m01');             // 'silver'
 *   MasteryXP.renderBadge('forge-md100-m01', el);
 *   MasteryXP.getTotalXP();                           // sum across all modules
 *
 * @version 1.0.0
 */
const MasteryXP = (function() {
    'use strict';

    // ─── Constants ─────────────────────────────────────────────────

    const STORAGE_PREFIX = 'hexworth_mastery_';

    /**
     * Tier definitions. Order matters: highest tier is evaluated first.
     * @type {Array<{ id: string, label: string, xp: number, minCompletions: number, minQuiz: number|null }>}
     */
    const TIERS = [
        { id: 'platinum', label: 'Platinum', xp: 100, minCompletions: 10, minQuiz: 100 },
        { id: 'gold',     label: 'Gold',     xp: 50,  minCompletions: 5,  minQuiz: 80  },
        { id: 'silver',   label: 'Silver',   xp: 25,  minCompletions: 3,  minQuiz: null },
        { id: 'bronze',   label: 'Bronze',   xp: 10,  minCompletions: 1,  minQuiz: null }
    ];

    const TIER_INDEX = {};
    TIERS.forEach(function(t) { TIER_INDEX[t.id] = t; });

    // ─── CSS (injected once) ────────────────────────────────────────

    function _ensureStyles() {
        if (document.getElementById('mastery-xp-styles')) { return; }
        var style = document.createElement('style');
        style.id = 'mastery-xp-styles';
        style.textContent = [
            /* Badge container */
            '.mxp-badge {',
            '  display: inline-flex;',
            '  align-items: center;',
            '  gap: 5px;',
            '  padding: 2px 8px;',
            '  border-radius: 10px;',
            '  font-size: 0.7rem;',
            '  font-weight: 700;',
            '  letter-spacing: 0.06em;',
            '  text-transform: uppercase;',
            '  line-height: 1.6;',
            '  white-space: nowrap;',
            '  user-select: none;',
            '  transition: transform 0.15s ease, box-shadow 0.15s ease;',
            '}',
            '.mxp-badge:hover {',
            '  transform: scale(1.05);',
            '}',

            /* Tier: Bronze — warm brown */
            '.mxp-badge.mxp-bronze {',
            '  background: rgba(180, 100, 40, 0.18);',
            '  color: #cd7f32;',
            '  border: 1px solid rgba(205, 127, 50, 0.4);',
            '  box-shadow: 0 0 6px rgba(205, 127, 50, 0.15);',
            '}',

            /* Tier: Silver — cool grey-white */
            '.mxp-badge.mxp-silver {',
            '  background: rgba(180, 180, 200, 0.14);',
            '  color: #b0b8c8;',
            '  border: 1px solid rgba(176, 184, 200, 0.4);',
            '  box-shadow: 0 0 6px rgba(176, 184, 200, 0.15);',
            '}',

            /* Tier: Gold — vivid amber */
            '.mxp-badge.mxp-gold {',
            '  background: rgba(234, 179, 8, 0.16);',
            '  color: #eab308;',
            '  border: 1px solid rgba(234, 179, 8, 0.45);',
            '  box-shadow: 0 0 8px rgba(234, 179, 8, 0.2);',
            '}',

            /* Tier: Platinum — icy cyan-white with glow */
            '.mxp-badge.mxp-platinum {',
            '  background: rgba(103, 232, 249, 0.12);',
            '  color: #67e8f9;',
            '  border: 1px solid rgba(103, 232, 249, 0.45);',
            '  box-shadow: 0 0 10px rgba(103, 232, 249, 0.25);',
            '}',

            /* Animated Platinum shimmer */
            '@keyframes mxp-shimmer {',
            '  0%   { opacity: 1; }',
            '  50%  { opacity: 0.7; }',
            '  100% { opacity: 1; }',
            '}',
            '.mxp-badge.mxp-platinum {',
            '  animation: mxp-shimmer 2.4s ease-in-out infinite;',
            '}',

            /* Icon pip (CSS-only shape per tier) */
            '.mxp-icon {',
            '  display: inline-block;',
            '  width: 8px;',
            '  height: 8px;',
            '  border-radius: 50%;',
            '  flex-shrink: 0;',
            '}',
            '.mxp-bronze  .mxp-icon { background: #cd7f32; }',
            '.mxp-silver  .mxp-icon { background: #b0b8c8; }',
            '.mxp-gold    .mxp-icon { background: #eab308; box-shadow: 0 0 4px #eab308; }',
            '.mxp-platinum .mxp-icon {',
            '  background: #67e8f9;',
            '  box-shadow: 0 0 6px #67e8f9;',
            '  border-radius: 3px;', /* diamond-ish */
            '  transform: rotate(45deg);',
            '}',

            /* XP label inline */
            '.mxp-xp-label {',
            '  display: inline-block;',
            '  font-size: 0.65rem;',
            '  color: #8a8a8a;',
            '  margin-left: 4px;',
            '  font-weight: 500;',
            '  letter-spacing: 0.04em;',
            '}',

            /* Wrapper injected into module cards */
            '.mxp-card-footer {',
            '  display: flex;',
            '  align-items: center;',
            '  gap: 6px;',
            '  margin-top: 10px;',
            '  padding-top: 8px;',
            '  border-top: 1px solid rgba(255,255,255,0.04);',
            '  flex-wrap: wrap;',
            '}'
        ].join('\n');
        document.head.appendChild(style);
    }

    // ─── Storage helpers ────────────────────────────────────────────

    function _storageKey(moduleId) {
        return STORAGE_PREFIX + moduleId;
    }

    function _loadRecord(moduleId) {
        try {
            var raw = localStorage.getItem(_storageKey(moduleId));
            if (!raw) { return null; }
            return JSON.parse(raw);
        } catch (e) {
            return null;
        }
    }

    function _saveRecord(moduleId, record) {
        try {
            localStorage.setItem(_storageKey(moduleId), JSON.stringify(record));
        } catch (e) {
            console.error('[MasteryXP] Failed to save:', e);
        }
    }

    // ─── Tier logic ─────────────────────────────────────────────────

    /**
     * Compute the earned tier string from a record object.
     * Evaluates from highest tier down; returns the first that qualifies.
     * @param {{ completions: number, bestQuiz: number|null }} record
     * @returns {string} tier id, e.g. 'gold'
     */
    function _computeTier(record) {
        var completions = record.completions || 0;
        var bestQuiz    = (typeof record.bestQuiz === 'number') ? record.bestQuiz : null;

        for (var i = 0; i < TIERS.length; i++) {
            var t = TIERS[i];
            if (completions < t.minCompletions) { continue; }
            if (t.minQuiz !== null && (bestQuiz === null || bestQuiz < t.minQuiz)) { continue; }
            return t.id;
        }
        return 'none';
    }

    // ─── Public API ─────────────────────────────────────────────────

    /**
     * Record one completion event for a module, optionally with a quiz score.
     * Updates the stored record and recomputes the tier.
     * Dispatches 'masteryXP:tierChanged' if the tier advances.
     *
     * @param {string} moduleId
     * @param {number|null} [quizScore] - 0-100 quiz score, or omit if no quiz
     */
    function recordCompletion(moduleId, quizScore) {
        if (!moduleId) { return; }
        var record = _loadRecord(moduleId) || { tier: 'none', completions: 0, bestQuiz: null };
        record.completions = (record.completions || 0) + 1;

        if (typeof quizScore === 'number' && quizScore >= 0 && quizScore <= 100) {
            record.bestQuiz = (record.bestQuiz === null || quizScore > record.bestQuiz)
                ? quizScore
                : record.bestQuiz;
        }

        var oldTier = record.tier || 'none';
        var newTier = _computeTier(record);
        record.tier = newTier;

        _saveRecord(moduleId, record);

        /* Award XP via ProgressManager if available and tier has advanced */
        if (newTier !== oldTier && newTier !== 'none') {
            var tierDef = TIER_INDEX[newTier];
            if (tierDef && typeof ProgressManager !== 'undefined' && ProgressManager.addXP) {
                try {
                    ProgressManager.addXP(tierDef.xp, 'mastery:' + moduleId + ':' + newTier);
                } catch (e) {
                    /* ProgressManager may not expose addXP — silent fail */
                }
            }
            window.dispatchEvent(new CustomEvent('masteryXP:tierChanged', {
                detail: { moduleId: moduleId, oldTier: oldTier, newTier: newTier, xp: tierDef ? tierDef.xp : 0 }
            }));
        }
    }

    /**
     * Get the current tier string for a module.
     * Returns 'none' if no record exists.
     * @param {string} moduleId
     * @returns {string}
     */
    function getTier(moduleId) {
        var record = _loadRecord(moduleId);
        if (!record) { return 'none'; }
        /* Lazily recompute in case tier field is stale */
        return _computeTier(record);
    }

    /**
     * Get the full stored record for a module.
     * @param {string} moduleId
     * @returns {{ tier: string, completions: number, bestQuiz: number|null }|null}
     */
    function getRecord(moduleId) {
        return _loadRecord(moduleId);
    }

    /**
     * Get the XP value for a tier string.
     * @param {string} tierId - 'bronze'|'silver'|'gold'|'platinum'|'none'
     * @returns {number}
     */
    function getXPForTier(tierId) {
        var def = TIER_INDEX[tierId];
        return def ? def.xp : 0;
    }

    /**
     * Sum all mastery XP across every module tracked in localStorage.
     * Iterates all hexworth_mastery_* keys.
     * @returns {number}
     */
    function getTotalXP() {
        var total = 0;
        try {
            for (var i = 0; i < localStorage.length; i++) {
                var key = localStorage.key(i);
                if (key && key.indexOf(STORAGE_PREFIX) === 0) {
                    var record = JSON.parse(localStorage.getItem(key) || '{}');
                    var tier = record.tier || _computeTier(record);
                    total += getXPForTier(tier);
                }
            }
        } catch (e) {
            console.error('[MasteryXP] getTotalXP error:', e);
        }
        return total;
    }

    /**
     * Render a tier badge into a container element.
     * Clears the container and appends the badge (or nothing if tier is 'none').
     *
     * @param {string} moduleId
     * @param {HTMLElement} containerEl - target DOM element
     * @param {object} [opts]
     * @param {boolean} [opts.showXP=false]      - append "+N XP" label
     * @param {boolean} [opts.showCount=false]   - append completions count
     */
    function renderBadge(moduleId, containerEl, opts) {
        if (!containerEl) { return; }
        _ensureStyles();
        opts = opts || {};

        var tier = getTier(moduleId);
        containerEl.innerHTML = '';

        if (tier === 'none') { return; }

        var tierDef = TIER_INDEX[tier];
        var badge = document.createElement('span');
        badge.className = 'mxp-badge mxp-' + tier;
        badge.setAttribute('title', tierDef.label + ' tier — ' + tierDef.xp + ' XP');

        badge.innerHTML = '<span class="mxp-icon"></span>' + tierDef.label;

        if (opts.showXP) {
            badge.innerHTML += '<span class="mxp-xp-label">+' + tierDef.xp + ' XP</span>';
        }

        if (opts.showCount) {
            var record = _loadRecord(moduleId);
            var completions = record ? (record.completions || 0) : 0;
            badge.innerHTML += '<span class="mxp-xp-label">' + completions + 'x</span>';
        }

        containerEl.appendChild(badge);
    }

    /**
     * Expose tier definitions for external consumers (StampRollout, dashboard widgets).
     * @returns {Array}
     */
    function getTierDefs() {
        return TIERS.slice();
    }

    // Public API
    return {
        recordCompletion: recordCompletion,
        getTier:          getTier,
        getRecord:        getRecord,
        getXPForTier:     getXPForTier,
        getTotalXP:       getTotalXP,
        renderBadge:      renderBadge,
        getTierDefs:      getTierDefs
    };

})();

if (typeof window !== 'undefined') {
    window.MasteryXP = MasteryXP;
}
