/**
 * TenantFilter.js — Content Access Control for White Label Tenants
 *
 * Reads the tenant context from sessionStorage (set by the branded
 * loader page) and provides filtering functions for all content-serving
 * pages: arena, dashboard, houses, hubs, games.
 *
 * When no tenant is active (direct Hexworth Prime users), all content
 * is allowed. The filter is purely additive — it never blocks direct users.
 *
 * Usage:
 *   // Check if a specific content item is allowed
 *   if (TenantFilter.isAllowed('a1-ancient-ledger', 'box')) { ... }
 *
 *   // Filter an array of items
 *   const filtered = TenantFilter.filterBoxes(BOXES);
 *   const filtered = TenantFilter.filterHouses(houseList);
 *
 *   // Check if a feature is enabled
 *   if (TenantFilter.hasFeature('vsMode')) { ... }
 *
 *   // Get tenant branding (or null if no tenant)
 *   const branding = TenantFilter.getBranding();
 *
 * @version 1.0.0
 * @feature WL-3
 */

const TenantFilter = (function() {
    'use strict';

    let _tenant = null;
    let _loaded = false;

    // ── Load tenant context from sessionStorage ──────────
    function _load() {
        if (_loaded) return;
        _loaded = true;
        try {
            var raw = sessionStorage.getItem('hexworth_tenant');
            if (raw) {
                _tenant = JSON.parse(raw);
            }
        } catch (e) {
            _tenant = null;
        }
    }

    // ── Core filter: is this content allowed? ────────────
    /**
     * Check if a content item is allowed for the current tenant.
     * Returns true if:
     *   - No tenant is active (direct Hexworth Prime user)
     *   - Tenant has no restrictions for this content type
     *   - Content matches the tenant's licensed access list
     *
     * @param {string} contentId - e.g., 'a1-ancient-ledger', 'shield', 'wireshark'
     * @param {string} contentType - 'box' | 'house' | 'hub' | 'feature'
     * @returns {boolean}
     */
    function isAllowed(contentId, contentType) {
        _load();
        if (!_tenant) return true; // No tenant = all access

        var access = _tenant.licensing && _tenant.licensing.contentAccess;
        if (!access) return true;

        switch (contentType) {
            case 'box': {
                // Extract series letter from box ID: 'a1-ancient-ledger' → 'a'
                var series = contentId.match(/^([a-z])/);
                if (!series) return true;
                var seriesList = access.series || [];
                if (seriesList.length === 0) return true; // Empty = all
                return seriesList.includes(series[1]);
            }
            case 'house': {
                var houseList = access.houses || [];
                if (houseList.length === 0) return true;
                return houseList.includes(contentId);
            }
            case 'hub': {
                var hubList = access.hubs || [];
                if (hubList.length === 0) return true;
                return hubList.includes(contentId);
            }
            case 'feature': {
                var features = access.features || {};
                return features[contentId] !== false;
            }
            default:
                return true;
        }
    }

    // ── Batch filters ────────────────────────────────────

    /**
     * Filter an array of CTF boxes (arena BOXES array).
     * Each box must have an 'id' property like 'a1', 'c15', etc.
     */
    function filterBoxes(boxes) {
        _load();
        if (!_tenant) return boxes;
        return boxes.filter(function(box) {
            return isAllowed(box.id, 'box');
        });
    }

    /**
     * Filter an array of house IDs or house objects.
     * Accepts either strings ('shield') or objects ({ id: 'shield' }).
     */
    function filterHouses(houses) {
        _load();
        if (!_tenant) return houses;
        return houses.filter(function(h) {
            var id = typeof h === 'string' ? h : h.id;
            return isAllowed(id, 'house');
        });
    }

    /**
     * Filter an array of hub IDs or hub objects.
     */
    function filterHubs(hubs) {
        _load();
        if (!_tenant) return hubs;
        return hubs.filter(function(h) {
            var id = typeof h === 'string' ? h : h.id;
            return isAllowed(id, 'hub');
        });
    }

    // ── Feature checks ───────────────────────────────────

    /**
     * Check if a feature is enabled for this tenant.
     * Returns true if no tenant is active (direct users get everything).
     *
     * @param {string} featureName - 'vsMode' | 'chatbots' | 'bugHunting' | 'codeRunner' | etc.
     */
    function hasFeature(featureName) {
        return isAllowed(featureName, 'feature');
    }

    // ── Tenant info ──────────────────────────────────────

    /**
     * Get tenant branding config, or null if no tenant.
     */
    function getBranding() {
        _load();
        return _tenant ? _tenant.branding : null;
    }

    /**
     * Get the full tenant config, or null.
     */
    function getTenant() {
        _load();
        return _tenant;
    }

    /**
     * Check if we're in a tenant context.
     */
    function isActive() {
        _load();
        return _tenant !== null;
    }

    /**
     * Get the tenant's display name.
     */
    function getName() {
        _load();
        return _tenant ? (_tenant.branding.platformName || _tenant.name) : 'Hexworth Prime';
    }

    /**
     * Apply tenant branding to the current page.
     * Call this from any page that should respect tenant theming.
     * Safe to call when no tenant is active (no-op).
     */
    function applyBranding() {
        _load();
        if (!_tenant) return;

        var b = _tenant.branding;
        var root = document.documentElement;
        if (b.primaryColor) root.style.setProperty('--brand-primary', b.primaryColor);
        if (b.secondaryColor) root.style.setProperty('--brand-secondary', b.secondaryColor);
        if (b.backgroundColor) root.style.setProperty('--brand-bg', b.backgroundColor);
        if (b.headerColor) root.style.setProperty('--brand-header', b.headerColor);
        if (b.fontFamily) root.style.setProperty('--brand-font', b.fontFamily);

        // Update page title
        if (b.platformName) {
            document.title = document.title.replace('Hexworth Prime', b.platformName);
        }
    }

    // ── Public API ────────────────────────────────────────

    return {
        isAllowed: isAllowed,
        filterBoxes: filterBoxes,
        filterHouses: filterHouses,
        filterHubs: filterHubs,
        hasFeature: hasFeature,
        getBranding: getBranding,
        getTenant: getTenant,
        isActive: isActive,
        getName: getName,
        applyBranding: applyBranding
    };

})();
