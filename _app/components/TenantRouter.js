/**
 * TenantRouter.js — Tenant Navigation Router
 *
 * PURPOSE:
 * Single source of truth for navigation destinations. When a tenant
 * context exists in sessionStorage, ALL navigation (dashboard, sorting,
 * unauthorized, home) routes to the tenant hub instead of Hexworth Prime
 * pages. This prevents tenant users from leaking into the general
 * Hexworth experience.
 *
 * USAGE:
 * Instead of hardcoding:
 *   window.location.href = '/dashboard.html';
 * Use:
 *   window.location.href = TenantRouter.getUrl('dashboard');
 *
 * If no tenant context exists, returns the normal Hexworth Prime URL.
 * Complete no-op for direct users — zero behavior change.
 *
 * LOADING:
 * Loaded automatically by TenantShell.js when tenant context exists.
 * Also safe to load on any page — does nothing without tenant context.
 *
 * @version 1.0.0
 * @feature WL-4
 */
/* IDEMPOTENT BY CONSTRUCTION. This file can legitimately load TWICE on one page: two pages outside
   /tenant/ include it with a static <script src> (wireshark/index.html and
   houses/eye/forensics/index.html) while tenant-sw.js ALSO injects it into every navigation
   outside /tenant/ and /admin/. A bare top-level `const TenantRouter = ...` throws
   "Identifier 'TenantRouter' has already been declared" on the second load -- verified in a
   browser, not inferred. The first copy survives and stays functional, so this was console noise
   rather than a break, but it is an uncaught error on two live pages for white-label students.

   tenant-sw.js:100 has asserted "These are idempotent: TenantRouter checks for existing instance"
   the whole time. It did not. TenantShell.js genuinely does (window.__tenantShellExecuted at :627);
   TenantRouter never had a guard. Same defect class as BUG-243 in the same subsystem: a comment
   describing safety the code does not implement.

   The guard is a plain assignment rather than a lexical const so a re-entry is a no-op instead of
   a parse error, and the public API is untouched. */
window.TenantRouter = window.TenantRouter || (function() {
    'use strict';

    // ── Tenant context cache ────────────────────────────
    var _tenant = null;
    var _active = false;
    var _hubUrl = null;

    // ── Dashboard variant file mapping ──────────────────
    // Maps the branding.dashboardVariant config value to the actual HTML file.
    // When a variant isn't in this map, falls back to index.html (the default loader).
    var VARIANT_FILES = {
        'command-center': 'dashboard-command-center.html',
        'clean-ops':      'dashboard-clean-ops.html',
        'tactical-hud':   'dashboard-tactical-hud.html',
        'enterprise':     'dashboard-enterprise.html',
        'academy':        'dashboard-academy.html',
        'federal':        'dashboard-federal.html',
        'nightshift':     'dashboard-nightshift.html',
        'minimalist':     'dashboard-minimalist.html',
        'campus':         'dashboard-campus.html'
    };

    // ── Initialize from sessionStorage ──────────────────
    function _init() {
        try {
            var raw = sessionStorage.getItem('hexworth_tenant') || localStorage.getItem('hexworth_tenant');
            if (!raw) return;
            _tenant = JSON.parse(raw);
            if (!_tenant || !_tenant.slug) return;
            _active = true;

            // Determine the dashboard URL based on variant config
            var variant = _tenant.branding && _tenant.branding.dashboardVariant;
            var variantFile = VARIANT_FILES[variant] || 'index.html';
            _hubUrl = '/tenant/' + variantFile + '?slug=' + encodeURIComponent(_tenant.slug);
        } catch (e) {
            _active = false;
        }
    }

    // Run immediately
    _init();

    // ── Default Hexworth Prime paths ────────────────────
    // Used when no tenant context exists (direct users)
    var DEFAULT_PATHS = {
        dashboard:    '/dashboard.html',
        sorting:      '/sorting.html',
        unauthorized: '/unauthorized.html',
        home:         '/',
        hub:          '/dashboard.html'
    };

    // ── Public API ──────────────────────────────────────

    /**
     * Get the appropriate URL for a destination.
     * When tenant context exists, most destinations route to the tenant hub.
     * When no tenant context, returns the normal Hexworth Prime path.
     *
     * @param {string} destination - One of: 'dashboard', 'sorting', 'unauthorized', 'home', 'hub'
     * @param {string} [relativeFallback] - Optional relative path fallback for non-tenant mode
     * @returns {string} The URL to navigate to
     */
    function getUrl(destination, relativeFallback) {
        if (_active) {
            // All tenant navigation routes to the hub.
            // Tenant users should never see sorting, unauthorized, or the
            // Hexworth Prime dashboard. Their hub IS their dashboard.
            return _hubUrl;
        }

        // Non-tenant: use the relative fallback if provided, otherwise absolute
        return relativeFallback || DEFAULT_PATHS[destination] || DEFAULT_PATHS.dashboard;
    }

    /**
     * Get the hub URL specifically (for back buttons, breadcrumbs).
     * When no tenant, returns the dashboard path.
     *
     * @param {string} [relativeFallback] - Relative path for non-tenant mode (e.g., '../../dashboard.html')
     * @returns {string}
     */
    function getHubUrl(relativeFallback) {
        if (_active) return _hubUrl;
        return relativeFallback || DEFAULT_PATHS.dashboard;
    }

    /**
     * Navigate to the hub/dashboard. Convenience method.
     */
    function goToHub() {
        window.location.href = getUrl('dashboard');
    }

    /**
     * Check if tenant routing is active.
     * @returns {boolean}
     */
    function isActive() {
        return _active;
    }

    /**
     * Get the tenant slug (or null if not active).
     * @returns {string|null}
     */
    function getSlug() {
        return _active ? _tenant.slug : null;
    }

    /**
     * Get the tenant display name.
     * @returns {string}
     */
    function getName() {
        if (!_active) return 'Hexworth Prime';
        return (_tenant.branding && _tenant.branding.platformName) || _tenant.name || 'Tenant';
    }

    /**
     * Get the full tenant config object (or null).
     * @returns {object|null}
     */
    function getTenant() {
        return _active ? _tenant : null;
    }

    /**
     * Re-initialize from sessionStorage. Call this if tenant context
     * was set after TenantRouter loaded (e.g., on the tenant loader page).
     */
    function refresh() {
        _tenant = null;
        _active = false;
        _hubUrl = null;
        _init();
    }

    return {
        getUrl:    getUrl,
        getHubUrl: getHubUrl,
        goToHub:   goToHub,
        isActive:  isActive,
        getSlug:   getSlug,
        getName:   getName,
        getTenant: getTenant,
        refresh:   refresh
    };
})();
