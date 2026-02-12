/**
 * FavoritesManager.js - Content Favorites System
 *
 * Lets students bookmark/save content they want to return to.
 * Stores in localStorage with hexworth_ prefix, syncs to Firestore.
 *
 * Storage key: hexworth_favorites (JSON array of objects)
 */

const FavoritesManager = (function() {
    'use strict';

    const STORAGE_KEY = 'hexworth_favorites';

    function _load() {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
        } catch {
            return [];
        }
    }

    function _save(favorites) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
        // Push to Firestore if signed in
        _syncToCloud(favorites);
    }

    function _syncToCloud(favorites) {
        if (typeof FirestoreManager === 'undefined') return;
        const uid = typeof FirebaseAuth !== 'undefined' ? FirebaseAuth.getUser()?.uid : null;
        if (!uid) return;
        FirestoreManager.setUserProfile(uid, { favorites }).catch(() => {});
    }

    /**
     * Get all favorites
     * @returns {Array} Array of favorite objects
     */
    function getAll() {
        return _load();
    }

    /**
     * Check if an item is favorited
     * @param {string} id - Module/game ID
     * @returns {boolean}
     */
    function isFavorite(id) {
        return _load().some(f => f.id === id);
    }

    /**
     * Toggle favorite state
     * @param {string} id - Module/game ID
     * @param {object} meta - Metadata: { title, house, icon, type, href }
     * @returns {boolean} New favorited state (true = added, false = removed)
     */
    function toggle(id, meta) {
        const favorites = _load();
        const index = favorites.findIndex(f => f.id === id);
        if (index >= 0) {
            favorites.splice(index, 1);
            _save(favorites);
            return false;
        } else {
            favorites.push({
                id,
                title: meta.title || id,
                house: meta.house || '',
                icon: meta.icon || '',
                type: meta.type || '',
                href: meta.href || '',
                addedAt: Date.now()
            });
            _save(favorites);
            return true;
        }
    }

    /**
     * Add a favorite (no-op if already exists)
     */
    function add(id, meta) {
        if (!isFavorite(id)) toggle(id, meta);
    }

    /**
     * Remove a favorite
     */
    function remove(id) {
        const favorites = _load();
        const index = favorites.findIndex(f => f.id === id);
        if (index >= 0) {
            favorites.splice(index, 1);
            _save(favorites);
        }
    }

    /**
     * Get count of favorites
     * @returns {number}
     */
    function count() {
        return _load().length;
    }

    /**
     * Merge cloud favorites with local (union, deduplicate by ID)
     * @param {Array} cloudFavorites - Favorites array from Firestore
     */
    function mergeFromCloud(cloudFavorites) {
        if (!Array.isArray(cloudFavorites)) return;
        const local = _load();
        const idSet = new Set(local.map(f => f.id));
        let added = 0;
        cloudFavorites.forEach(cf => {
            if (cf.id && !idSet.has(cf.id)) {
                local.push(cf);
                idSet.add(cf.id);
                added++;
            }
        });
        if (added > 0) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(local));
        }
        return added;
    }

    return { getAll, isFavorite, toggle, add, remove, count, mergeFromCloud };
})();
