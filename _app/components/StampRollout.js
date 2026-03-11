/**
 * StampRollout.js - Universal Completion Stamp + Mastery Badge Rollout
 *
 * A single-call utility that decorates every module card on a house index page
 * with:
 *   1. A CompletionStamp indicator (green check / completed state)
 *   2. A MasteryXP tier badge (Bronze → Platinum)
 *
 * Attaches to cards via data-module-id attribute (set by HouseRenderer).
 * Re-runs on 'completionStamp:marked' and 'masteryXP:tierChanged' events
 * so the UI stays current within a single page session.
 *
 * Also auto-detects the current house from the URL path and can expose a
 * house-level progress summary.
 *
 * Usage (add to any house index page, after HouseRenderer.js):
 *
 *   <script src="../../components/CompletionStamp.js"></script>
 *   <script src="../../components/MasteryXP.js"></script>
 *   <script src="../../components/StampRollout.js"></script>
 *   <script>
 *     document.addEventListener('DOMContentLoaded', function() {
 *       StampRollout.init();
 *     });
 *   </script>
 *
 * Or more simply — call StampRollout.init() after HouseRenderer.init():
 *
 *   HouseRenderer.init({ ... });
 *   StampRollout.init();
 *
 * Dependencies (lazy-loaded if missing):
 *   - CompletionStamp.js  — completion state storage + rendering
 *   - MasteryXP.js        — tier computation + badge rendering
 *
 * @version 1.0.0
 */
const StampRollout = (function() {
    'use strict';

    var _initialized = false;

    // ─── CSS (injected once) ────────────────────────────────────────

    function _ensureStyles() {
        if (document.getElementById('stamp-rollout-styles')) { return; }
        var style = document.createElement('style');
        style.id = 'stamp-rollout-styles';
        style.textContent = [
            /* Footer row appended inside each .module-card */
            '.sr-card-row {',
            '  display: flex;',
            '  align-items: center;',
            '  gap: 6px;',
            '  margin-top: 10px;',
            '  padding-top: 8px;',
            '  border-top: 1px solid rgba(255,255,255,0.04);',
            '  flex-wrap: wrap;',
            '  min-height: 22px;',     /* Reserve space; prevents layout jump */
            '}',

            /* Completion stamp inline within the footer row */
            '.sr-done-stamp {',
            '  display: inline-flex;',
            '  align-items: center;',
            '  gap: 4px;',
            '  padding: 2px 8px;',
            '  border-radius: 10px;',
            '  font-size: 0.7rem;',
            '  font-weight: 600;',
            '  letter-spacing: 0.05em;',
            '  background: rgba(34, 197, 94, 0.13);',
            '  color: #22c55e;',
            '  border: 1px solid rgba(34, 197, 94, 0.3);',
            '  white-space: nowrap;',
            '}',

            /* SVG check icon inside the stamp */
            '.sr-done-stamp svg {',
            '  width: 10px;',
            '  height: 10px;',
            '  flex-shrink: 0;',
            '}',

            /* Score text appended to the stamp */
            '.sr-score {',
            '  font-size: 0.65rem;',
            '  color: #16a34a;',
            '  margin-left: 2px;',
            '}',

            /* Completed card gets a subtle green border accent */
            '.module-card.sr-completed {',
            '  border-color: rgba(34, 197, 94, 0.2) !important;',
            '  background: rgba(34, 197, 94, 0.03) !important;',
            '}'
        ].join('\n');
        document.head.appendChild(style);
    }

    // ─── Dependency loader ──────────────────────────────────────────

    /**
     * Dynamically inject a script tag if the global it provides is absent.
     * Resolves when the script has loaded (or immediately if already present).
     *
     * @param {string} globalName - e.g. 'CompletionStamp'
     * @param {string} relPath    - path relative to /components/
     * @returns {Promise<void>}
     */
    function _loadScript(globalName, relPath) {
        return new Promise(function(resolve) {
            if (typeof window[globalName] !== 'undefined') {
                resolve();
                return;
            }
            var s = document.createElement('script');
            /* Derive the base URL from any existing component script tag, or use /components/ */
            var base = '/components/';
            var existingTag = document.querySelector('script[src*="/components/"]');
            if (existingTag) {
                base = existingTag.getAttribute('src').replace(/\/[^/]+$/, '/');
            }
            s.src = base + relPath;
            s.onload = function() { resolve(); };
            s.onerror = function() {
                console.warn('[StampRollout] Could not load', relPath);
                resolve(); /* Non-fatal — degrade gracefully */
            };
            document.head.appendChild(s);
        });
    }

    // ─── House detection ────────────────────────────────────────────

    /**
     * Detect the current house from the URL path.
     * e.g. /houses/forge/index.html → 'forge'
     * Falls back to the HOUSE_ID global that HouseRenderer consumers define.
     *
     * @returns {string|null}
     */
    function detectHouse() {
        /* First: check the HOUSE_ID global set in every house index */
        if (typeof window.HOUSE_ID === 'string' && window.HOUSE_ID) {
            return window.HOUSE_ID;
        }
        /* Second: parse URL */
        var match = window.location.pathname.match(/\/houses\/([^/]+)\//);
        if (match) { return match[1]; }
        /* Third: meta tag (fallback for pages that set one) */
        var meta = document.querySelector('meta[name="house-id"]');
        if (meta) { return meta.getAttribute('content'); }
        return null;
    }

    // ─── Core decoration ────────────────────────────────────────────

    /**
     * Build the SVG checkmark used in completion stamps (CSS-only, no images).
     * @returns {string} SVG HTML string
     */
    function _checkSVG() {
        return '<svg viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">' +
               '<polyline points="1.5,6 4.5,9 10.5,3" stroke="#22c55e" stroke-width="2" ' +
               'stroke-linecap="round" stroke-linejoin="round"/>' +
               '</svg>';
    }

    /**
     * Decorate a single .module-card element with a completion stamp
     * and/or a mastery tier badge.
     *
     * @param {HTMLElement} card - a .module-card element
     */
    function _decorateCard(card) {
        var moduleId = card.dataset.moduleId;
        if (!moduleId) { return; }

        /* Find or create the footer row */
        var row = card.querySelector('.sr-card-row');
        if (!row) {
            row = document.createElement('div');
            row.className = 'sr-card-row';
            card.appendChild(row);
        }
        row.innerHTML = '';

        /* CompletionStamp check */
        if (typeof CompletionStamp !== 'undefined' && CompletionStamp.isComplete(moduleId)) {
            card.classList.add('sr-completed');

            var record = CompletionStamp.getRecord(moduleId);
            var stamp = document.createElement('span');
            stamp.className = 'sr-done-stamp';
            stamp.innerHTML = _checkSVG() + 'Done';

            if (record && typeof record.score === 'number') {
                stamp.innerHTML += '<span class="sr-score">' + record.score + '%</span>';
            }

            row.appendChild(stamp);
        } else {
            card.classList.remove('sr-completed');
        }

        /* MasteryXP badge */
        if (typeof MasteryXP !== 'undefined') {
            var tier = MasteryXP.getTier(moduleId);
            if (tier !== 'none') {
                var badgeContainer = document.createElement('span');
                row.appendChild(badgeContainer);
                MasteryXP.renderBadge(moduleId, badgeContainer, { showCount: true });
            }
        }
    }

    /**
     * Scan the page for all .module-card elements that have a data-module-id
     * and decorate each one.
     */
    function decorateAll() {
        var cards = document.querySelectorAll('[data-module-id].module-card');
        /* Also catch any card-like element that carries data-module-id */
        if (cards.length === 0) {
            cards = document.querySelectorAll('[data-module-id]');
        }
        for (var i = 0; i < cards.length; i++) {
            _decorateCard(cards[i]);
        }
    }

    // ─── Event listeners ────────────────────────────────────────────

    /**
     * Wire live-update handlers: re-decorate a single card when a completion
     * or mastery event fires for it.
     */
    function _bindEvents() {
        window.addEventListener('completionStamp:marked', function(e) {
            if (!e.detail || !e.detail.moduleId) { return; }
            var card = document.querySelector('[data-module-id="' + e.detail.moduleId + '"].module-card');
            if (!card) {
                card = document.querySelector('[data-module-id="' + e.detail.moduleId + '"]');
            }
            if (card) { _decorateCard(card); }
        });

        window.addEventListener('masteryXP:tierChanged', function(e) {
            if (!e.detail || !e.detail.moduleId) { return; }
            var card = document.querySelector('[data-module-id="' + e.detail.moduleId + '"].module-card');
            if (!card) {
                card = document.querySelector('[data-module-id="' + e.detail.moduleId + '"]');
            }
            if (card) { _decorateCard(card); }
        });

        /* HouseRenderer injects cards asynchronously in some tab-switch scenarios.
         * Re-run decorateAll() 500ms after DOMContentLoaded as a safety net. */
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', function() {
                setTimeout(decorateAll, 500);
            });
        } else {
            setTimeout(decorateAll, 500);
        }
    }

    // ─── Public API ─────────────────────────────────────────────────

    /**
     * Initialize StampRollout on the current page.
     *
     * Lazy-loads CompletionStamp.js and MasteryXP.js if not already present,
     * then decorates all module cards and binds live-update events.
     *
     * Safe to call multiple times — only initializes once per page.
     *
     * @param {object} [opts]
     * @param {boolean} [opts.force=false] - Re-initialize even if already run
     */
    function init(opts) {
        opts = opts || {};
        if (_initialized && !opts.force) { return; }
        _initialized = true;

        _ensureStyles();

        /* Load dependencies, then decorate */
        Promise.all([
            _loadScript('CompletionStamp', 'CompletionStamp.js'),
            _loadScript('MasteryXP',       'MasteryXP.js')
        ]).then(function() {
            decorateAll();
            _bindEvents();
        });
    }

    /**
     * Get a summary of completion and mastery stats for the current house.
     * Returns null if house cannot be detected.
     *
     * @returns {{ houseId: string, completed: number, total: number, percent: number, masteryXP: number }|null}
     */
    function getHouseSummary() {
        var houseId = detectHouse();
        if (!houseId) { return null; }

        var progress = (typeof CompletionStamp !== 'undefined' && CompletionStamp.getProgress)
            ? CompletionStamp.getProgress(houseId)
            : { completed: 0, total: 0, percent: 0 };

        var masteryXP = (typeof MasteryXP !== 'undefined')
            ? MasteryXP.getTotalXP()
            : 0;

        return {
            houseId:   houseId,
            completed: progress.completed,
            total:     progress.total,
            percent:   progress.percent,
            masteryXP: masteryXP
        };
    }

    return {
        init:           init,
        decorateAll:    decorateAll,
        detectHouse:    detectHouse,
        getHouseSummary: getHouseSummary
    };

})();

if (typeof window !== 'undefined') {
    window.StampRollout = StampRollout;
}
