/**
 * CompletionStamp.js - Visual Completion Tracking System
 *
 * Provides persistent completion stamps for modules, labs, and courses.
 * Stamps persist in localStorage and render visual indicators on index pages.
 *
 * House-agnostic: works for Eye (CyberOps) now, expandable to all houses.
 *
 * Usage:
 *   CompletionStamp.mark('eye-soc-lab', 92);
 *   CompletionStamp.isComplete('eye-soc-lab');
 *   CompletionStamp.getProgress('eye');
 *   CompletionStamp.renderStamps(containerEl, modules);
 *   CompletionStamp.renderProgressBar(containerEl, 'eye');
 *
 * @version 1.0.0
 */
const CompletionStamp = (function() {
    'use strict';

    const STORAGE_KEY = 'hexworth_completion_stamps';

    // ─── Storage helpers ───────────────────────────────────────────

    function _load() {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
        } catch (e) {
            console.error('[CompletionStamp] Failed to load:', e);
            return {};
        }
    }

    function _save(data) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        } catch (e) {
            console.error('[CompletionStamp] Failed to save:', e);
        }
    }

    // ─── Core API ──────────────────────────────────────────────────

    /**
     * Mark a module as complete.
     * @param {string} moduleId - Unique module identifier (e.g. 'eye-soc-lab')
     * @param {number|null} score - Optional score (0-100), null if no score
     */
    function mark(moduleId, score) {
        if (!moduleId) return;
        const data = _load();
        data[moduleId] = {
            completed: true,
            timestamp: new Date().toISOString(),
            score: (typeof score === 'number') ? score : null
        };
        _save(data);

        window.dispatchEvent(new CustomEvent('completionStamp:marked', {
            detail: { moduleId, score }
        }));
    }

    /**
     * Remove a completion stamp (for reset flows).
     * @param {string} moduleId
     */
    function unmark(moduleId) {
        const data = _load();
        delete data[moduleId];
        _save(data);
    }

    /**
     * Check if a module is complete.
     * @param {string} moduleId
     * @returns {boolean}
     */
    function isComplete(moduleId) {
        const data = _load();
        return !!(data[moduleId] && data[moduleId].completed);
    }

    /**
     * Get the stored record for a module.
     * @param {string} moduleId
     * @returns {object|null}
     */
    function getRecord(moduleId) {
        const data = _load();
        return data[moduleId] || null;
    }

    /**
     * Get progress counts for a given house using ContentCatalog.
     * @param {string} houseId - e.g. 'eye', 'shield', 'forge'
     * @returns {{ completed: number, total: number, percent: number }}
     */
    function getProgress(houseId) {
        const data = _load();
        let modules = [];

        if (typeof ContentCatalog !== 'undefined' && ContentCatalog.getHouseModules) {
            modules = ContentCatalog.getHouseModules(houseId)
                .filter(function(m) { return m.status === 'available'; });
        }

        const total = modules.length;
        let completed = 0;

        for (let i = 0; i < modules.length; i++) {
            if (data[modules[i].id] && data[modules[i].id].completed) {
                completed++;
            }
        }

        return {
            completed: completed,
            total: total,
            percent: total > 0 ? Math.round((completed / total) * 100) : 0
        };
    }

    /**
     * Get all stamps (raw data).
     * @returns {object}
     */
    function getAll() {
        return _load();
    }

    /**
     * Reset all stamps (with confirmation guard — caller should confirm).
     */
    function resetAll() {
        localStorage.removeItem(STORAGE_KEY);
    }

    /**
     * Reset stamps for a specific house.
     * @param {string} houseId
     */
    function resetHouse(houseId) {
        const data = _load();
        const prefix = houseId + '-';
        const keys = Object.keys(data);
        for (let i = 0; i < keys.length; i++) {
            if (keys[i].indexOf(prefix) === 0) {
                delete data[keys[i]];
            }
        }
        _save(data);
    }

    // ─── Rendering ─────────────────────────────────────────────────

    /**
     * Inject stamp styles into the page (idempotent).
     */
    function _ensureStyles() {
        if (document.getElementById('completion-stamp-styles')) return;
        var style = document.createElement('style');
        style.id = 'completion-stamp-styles';
        style.textContent = [
            '.cs-stamp { display: inline-flex; align-items: center; gap: 6px; padding: 3px 10px; border-radius: 12px; font-size: 0.75rem; font-weight: 600; letter-spacing: 0.05em; vertical-align: middle; }',
            '.cs-stamp.complete { background: rgba(34, 197, 94, 0.15); color: #22c55e; border: 1px solid rgba(34, 197, 94, 0.3); }',
            '.cs-stamp.incomplete { background: rgba(156, 163, 175, 0.1); color: #9ca3af; border: 1px solid rgba(156, 163, 175, 0.2); }',
            '.cs-stamp-icon { font-size: 0.85rem; }',
            '.cs-progress-wrap { width: 100%; }',
            '.cs-progress-bar { height: 8px; background: rgba(156, 163, 175, 0.2); border-radius: 4px; overflow: hidden; }',
            '.cs-progress-fill { height: 100%; border-radius: 4px; transition: width 0.5s ease; background: linear-gradient(90deg, #22c55e, #16a34a); }',
            '.cs-progress-text { display: flex; justify-content: space-between; font-size: 0.8rem; margin-top: 6px; color: #9ca3af; }',
            '.cs-progress-text .cs-count { color: #22c55e; font-weight: 600; }',
            '.cs-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 12px; margin-top: 12px; }',
            '.cs-grid-item { display: flex; align-items: center; gap: 10px; padding: 10px 14px; border-radius: 8px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); transition: all 0.2s; }',
            '.cs-grid-item.done { border-color: rgba(34, 197, 94, 0.2); background: rgba(34, 197, 94, 0.05); }',
            '.cs-grid-item .cs-item-icon { font-size: 1.1rem; flex-shrink: 0; }',
            '.cs-grid-item .cs-item-title { font-size: 0.85rem; color: #ccc; flex: 1; }',
            '.cs-grid-item.done .cs-item-title { color: #a7f3d0; }',
            '.cs-grid-item .cs-item-score { font-size: 0.75rem; color: #22c55e; font-weight: 600; }',
            '.cs-dashboard-card { background: rgba(20, 20, 30, 0.4); border: 1px solid #222; border-radius: 8px; padding: 16px 20px; }',
            '.cs-dashboard-card .cs-header { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; }',
            '.cs-dashboard-card .cs-header-icon { font-size: 1.2rem; }',
            '.cs-dashboard-card .cs-header-title { font-size: 0.85rem; color: #ccc; font-weight: 500; }',
            '.cs-dashboard-card .cs-header-count { margin-left: auto; font-size: 0.8rem; color: #22c55e; font-weight: 600; }'
        ].join('\n');
        document.head.appendChild(style);
    }

    /**
     * Render stamp badges into a container for a list of modules.
     * @param {HTMLElement} containerEl
     * @param {Array} modules - Array of { id, title, icon } objects
     */
    function renderStamps(containerEl, modules) {
        if (!containerEl || !modules) return;
        _ensureStyles();
        var data = _load();
        var grid = document.createElement('div');
        grid.className = 'cs-grid';

        for (var i = 0; i < modules.length; i++) {
            var m = modules[i];
            var record = data[m.id];
            var done = record && record.completed;

            var item = document.createElement('div');
            item.className = 'cs-grid-item' + (done ? ' done' : '');

            var icon = done ? '<span class="cs-item-icon">&#10003;</span>' : '<span class="cs-item-icon" style="opacity:0.4">&#9711;</span>';
            var title = '<span class="cs-item-title">' + (m.icon || '') + ' ' + (m.title || m.id) + '</span>';
            var score = (done && record.score !== null && record.score !== undefined)
                ? '<span class="cs-item-score">' + record.score + '%</span>'
                : '';

            item.innerHTML = icon + title + score;
            grid.appendChild(item);
        }

        containerEl.innerHTML = '';
        containerEl.appendChild(grid);
    }

    /**
     * Render a progress bar for a house.
     * @param {HTMLElement} containerEl
     * @param {string} houseId
     */
    function renderProgressBar(containerEl, houseId) {
        if (!containerEl) return;
        _ensureStyles();
        var p = getProgress(houseId);

        var wrap = document.createElement('div');
        wrap.className = 'cs-progress-wrap';
        wrap.innerHTML =
            '<div class="cs-progress-bar"><div class="cs-progress-fill" style="width:' + p.percent + '%"></div></div>' +
            '<div class="cs-progress-text"><span class="cs-count">' + p.completed + '/' + p.total + ' complete</span><span>' + p.percent + '%</span></div>';

        containerEl.innerHTML = '';
        containerEl.appendChild(wrap);
    }

    /**
     * Render a compact dashboard summary card for a house.
     * @param {HTMLElement} containerEl
     * @param {string} houseId
     * @param {object} opts - { icon, label, linkUrl }
     */
    function renderDashboardCard(containerEl, houseId, opts) {
        if (!containerEl) return;
        _ensureStyles();
        opts = opts || {};
        var p = getProgress(houseId);

        var card = document.createElement('div');
        card.className = 'cs-dashboard-card';

        var header = '<div class="cs-header">' +
            '<span class="cs-header-icon">' + (opts.icon || '<img src="/assets/images/icons/icon-barchart.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle">') + '</span>' +
            '<span class="cs-header-title">' + (opts.label || houseId) + '</span>' +
            '<span class="cs-header-count">' + p.completed + '/' + p.total + '</span>' +
            '</div>';

        var bar = '<div class="cs-progress-bar"><div class="cs-progress-fill" style="width:' + p.percent + '%"></div></div>';

        card.innerHTML = header + bar;

        if (opts.linkUrl) {
            card.style.cursor = 'pointer';
            card.addEventListener('click', function() {
                window.location.href = opts.linkUrl;
            });
        }

        containerEl.innerHTML = '';
        containerEl.appendChild(card);
    }

    // Public API
    return {
        mark: mark,
        unmark: unmark,
        isComplete: isComplete,
        getRecord: getRecord,
        getProgress: getProgress,
        getAll: getAll,
        resetAll: resetAll,
        resetHouse: resetHouse,
        renderStamps: renderStamps,
        renderProgressBar: renderProgressBar,
        renderDashboardCard: renderDashboardCard
    };
})();

if (typeof window !== 'undefined') {
    window.CompletionStamp = CompletionStamp;
}
