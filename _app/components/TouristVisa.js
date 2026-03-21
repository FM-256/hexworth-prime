/**
 * TouristVisa.js - Sorting Quiz Bypass for Unsorted Explorers
 *
 * Lets unsorted users explore house content with limited access.
 * Tourist mode is stored entirely in localStorage (no Firebase required).
 * Progress is NOT saved to Firestore -- users must complete the Sorting
 * Quiz to persist progress and earn XP.
 *
 * Limits:
 *   - Max 3 house visits before forced sorting redirect
 *   - "TOURIST" badge replaces house badge in headers
 *   - No XP, no leaderboard, no achievements
 *
 * Integration with AccessGuard:
 *   When AccessGuard.require('sorted') is called on a page, check
 *   TouristVisa.isActive() first. If active, allow entry but inject
 *   the tourist badge and decrement remaining visits.
 *
 *   Example (in AccessGuard or page-level script):
 *     if (!AccessGuard.isSorted() && TouristVisa.isActive()) {
 *         TouristVisa.visitHouse(houseId);
 *         if (TouristVisa.getRemainingVisits() <= 0) {
 *             TouristVisa.forceSort();
 *         }
 *         // show page with tourist badge
 *     }
 *
 * Storage keys:
 *   hexworth_tourist_active   — 'true' if tourist mode on
 *   hexworth_tourist_visited  — JSON array of visited house IDs
 *
 * @author Hexworth Prime
 * @version 1.0.0
 */

const TouristVisa = (function () {
    'use strict';

    const STORAGE_KEYS = {
        active: 'hexworth_tourist_active',
        visited: 'hexworth_tourist_visited'
    };

    const MAX_VISITS = 3;

    // All 11 sortable houses (excludes divergent which is a meta-result)
    const HOUSES = [
        { id: 'shield',    name: 'House of the Shield',    domain: 'Security & Defense',           emblem: '/assets/images/emblems/shield.webp' },
        { id: 'dark-arts', name: 'House of the Dark Arts', domain: 'Offensive Security & Research', emblem: '/assets/images/emblems/dark-arts.webp' },
        { id: 'eye',       name: 'House of the Eye',       domain: 'Monitoring & Analysis',        emblem: '/assets/images/emblems/eye.webp' },
        { id: 'cloud',     name: 'House of the Cloud',     domain: 'Infrastructure & Scale',       emblem: '/assets/images/emblems/cloud.webp' },
        { id: 'forge',     name: 'House of the Forge',     domain: 'Hardware & Systems',            emblem: '/assets/images/emblems/forge.webp' },
        { id: 'web',       name: 'House of the Web',       domain: 'Networking & Connections',      emblem: '/assets/images/emblems/web.webp' },
        { id: 'code',      name: 'House of the Code',      domain: 'Development & DevOps',         emblem: '/assets/images/emblems/code.webp' },
        { id: 'key',       name: 'House of the Key',       domain: 'Cryptography & Identity',      emblem: '/assets/images/emblems/key.webp' },
        { id: 'script',    name: 'House of the Script',    domain: 'Automation & Efficiency',      emblem: '/assets/images/emblems/script.webp' },
        { id: 'ai',        name: 'House of AI',            domain: 'Machine Learning & Agents',    emblem: '/assets/images/emblems/ai.webp' },
        { id: 'matrix',    name: 'House of the Matrix',    domain: 'Mechanics & Operations',       emblem: '/assets/images/emblems/matrix.webp' }
    ];

    // ─────────────────────────────────────────────────
    // CORE API
    // ─────────────────────────────────────────────────

    /** Activate tourist mode */
    function enable() {
        localStorage.setItem(STORAGE_KEYS.active, 'true');
        // Initialize empty visited list if not present
        if (!localStorage.getItem(STORAGE_KEYS.visited)) {
            localStorage.setItem(STORAGE_KEYS.visited, '[]');
        }
        installBlockers();
        console.log('[TouristVisa] Tourist mode activated — ' + MAX_VISITS + ' house visits available');
    }

    /** Deactivate tourist mode and clear state */
    function disable() {
        localStorage.removeItem(STORAGE_KEYS.active);
        localStorage.removeItem(STORAGE_KEYS.visited);
    }

    /** Returns true if tourist mode is currently active */
    function isActive() {
        return localStorage.getItem(STORAGE_KEYS.active) === 'true';
    }

    /** Returns array of house IDs already visited */
    function getVisitedHouses() {
        try {
            var raw = localStorage.getItem(STORAGE_KEYS.visited);
            return raw ? JSON.parse(raw) : [];
        } catch (e) {
            return [];
        }
    }

    /**
     * Record a visit to a house. Returns true if visit was allowed,
     * false if limit already reached.
     */
    function visitHouse(houseId) {
        if (!isActive()) return false;

        var visited = getVisitedHouses();

        // Already visited this house -- no charge
        if (visited.indexOf(houseId) !== -1) return true;

        // Limit reached
        if (visited.length >= MAX_VISITS) return false;

        visited.push(houseId);
        localStorage.setItem(STORAGE_KEYS.visited, JSON.stringify(visited));
        console.log('[TouristVisa] Visited ' + houseId + ' (' + visited.length + '/' + MAX_VISITS + ')');

        return true;
    }

    /** How many NEW houses can the tourist still visit */
    function getRemainingVisits() {
        var visited = getVisitedHouses();
        return Math.max(0, MAX_VISITS - visited.length);
    }

    /** Redirect to force-sort page (visa expired) */
    function forceSort() {
        // Calculate base path relative to current page
        var basePath = _getBasePath();
        window.location.href = basePath + 'components/tourist-sort-redirect.html';
    }

    /** Redirect to sorting quiz directly */
    function goToSorting() {
        var basePath = _getBasePath();
        window.location.href = basePath + 'sorting.html';
    }

    /** Redirect to tourist prompt */
    function goToPrompt() {
        var basePath = _getBasePath();
        window.location.href = basePath + 'components/tourist-visa-prompt.html';
    }

    /** Return list of all houses (for rendering cards) */
    function getAllHouses() {
        return HOUSES.slice();
    }

    // ─────────────────────────────────────────────────
    // BADGE INJECTION
    // ─────────────────────────────────────────────────

    /**
     * Inject the tourist badge into the page.
     * Call after confirming TouristVisa.isActive().
     * Requires tourist-badge.css to be loaded.
     */
    function injectBadge() {
        if (document.getElementById('tourist-badge-indicator')) return;

        var remaining = getRemainingVisits();
        var visited = getVisitedHouses();
        var warningClass = remaining <= 1 ? ' tourist-badge--warning' : '';

        var badge = document.createElement('div');
        badge.id = 'tourist-badge-indicator';
        badge.className = 'tourist-badge' + warningClass;
        badge.innerHTML =
            '<span class="tourist-badge__label">TOURIST</span>' +
            '<span class="tourist-badge__counter">' + visited.length + '/' + MAX_VISITS + ' visits</span>';

        // Inject at top of body
        if (document.body) {
            document.body.appendChild(badge);
        } else {
            document.addEventListener('DOMContentLoaded', function () {
                document.body.appendChild(badge);
            });
        }
    }

    /**
     * Inject a subtle overlay banner at the top of house content
     * reminding the tourist that progress is not saved.
     */
    function injectOverlay() {
        if (document.getElementById('tourist-overlay-banner')) return;

        var banner = document.createElement('div');
        banner.id = 'tourist-overlay-banner';
        banner.className = 'tourist-overlay';
        banner.innerHTML =
            '<span class="tourist-overlay__text">' +
            'Tourist Mode -- progress will not be saved. ' +
            '<a href="javascript:void(0)" onclick="TouristVisa.goToSorting()" class="tourist-overlay__link">Take the Sorting Quiz</a>' +
            ' to unlock full access.' +
            '</span>';

        if (document.body) {
            document.body.insertBefore(banner, document.body.firstChild);
        } else {
            document.addEventListener('DOMContentLoaded', function () {
                document.body.insertBefore(banner, document.body.firstChild);
            });
        }
    }

    // ─────────────────────────────────────────────────
    // PROGRESS BLOCKING
    // Intercept XP/achievement/progress saves for tourists
    // ─────────────────────────────────────────────────

    var _interceptsInstalled = false;

    /**
     * Install no-op interceptors on ModuleProgress and AchievementManager
     * so tourists cannot accumulate XP, achievements, or progress.
     * Safe to call multiple times — only installs once.
     */
    function installBlockers() {
        if (_interceptsInstalled) return;
        _interceptsInstalled = true;

        function wrapIfExists(obj, methodName, label) {
            if (!obj || typeof obj[methodName] !== 'function') return;
            var original = obj[methodName];
            obj[methodName] = function () {
                if (isActive()) {
                    console.log('[TouristVisa] Blocked ' + label + ' — tourist mode');
                    return false;
                }
                return original.apply(obj, arguments);
            };
        }

        // Defer until the globals are defined (they load after AccessGuard)
        function tryInstall() {
            if (typeof ModuleProgress !== 'undefined') {
                wrapIfExists(ModuleProgress, 'complete', 'ModuleProgress.complete');
                wrapIfExists(ModuleProgress, 'completeQuiz', 'ModuleProgress.completeQuiz');
            }
            if (typeof AchievementManager !== 'undefined') {
                wrapIfExists(AchievementManager, 'unlock', 'AchievementManager.unlock');
                wrapIfExists(AchievementManager, 'check', 'AchievementManager.check');
            }
        }

        // Try immediately, then retry after DOM ready in case scripts load later
        tryInstall();
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', tryInstall);
        }
        // Also try after a short delay for async-loaded scripts
        setTimeout(tryInstall, 1000);
    }

    // ─────────────────────────────────────────────────
    // INTERNAL HELPERS
    // ─────────────────────────────────────────────────

    /** Calculate /_app/ base path from current URL */
    function _getBasePath() {
        var path = window.location.pathname;
        var idx = path.indexOf('/_app/');
        if (idx !== -1) {
            return path.substring(0, idx + 6); // include /_app/
        }
        // Fallback: walk up from current depth
        var segments = path.replace(/\/[^/]*$/, '').split('/').filter(Boolean);
        return segments.length > 0 ? '../'.repeat(segments.length) : './';
    }

    // ─────────────────────────────────────────────────
    // PUBLIC API
    // ─────────────────────────────────────────────────

    // Auto-install blockers if tourist mode is already active on load
    if (isActive()) {
        installBlockers();
    }

    return {
        enable: enable,
        disable: disable,
        isActive: isActive,
        getVisitedHouses: getVisitedHouses,
        visitHouse: visitHouse,
        getRemainingVisits: getRemainingVisits,
        forceSort: forceSort,
        goToSorting: goToSorting,
        goToPrompt: goToPrompt,
        getAllHouses: getAllHouses,
        injectBadge: injectBadge,
        injectOverlay: injectOverlay,
        installBlockers: installBlockers,
        MAX_VISITS: MAX_VISITS
    };
})();
