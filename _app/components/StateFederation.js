/**
 * StateFederation.js — Platform-Wide Federated State Sync Service
 *
 * Replaces repeated cross-device sync boilerplate across modules.
 * Each module registers once and gets automatic:
 *   - Dual save (full state + lightweight sync key)
 *   - Cascading load with merge (local → sync → course completion)
 *   - Late-arriving sync handling via hexworth:progressRestored
 *   - Resume text generation
 *   - Reset cleanup
 *
 * Usage:
 *   const fed = StateFederation.register({
 *       storageKey: 'wsa-gauntlet-state',
 *       syncKey: 'wsa-gauntlet-sync',                  // optional, defaults to storageKey + '-sync'
 *       courseProgressKey: 'gauntlet',                  // module ID in WSAProgress
 *       courseProgressProvider: 'wsa',                  // 'wsa' | courseId | null
 *       courseProgressComponent: 'guiLab',              // component to check
 *       extract: (fullState) => ({...}),                // full → lightweight sync data
 *       merge: (fullState, syncData) => {...},          // merge sync completions into full state (mutate)
 *       fromSync: (syncData) => ({...}),                // construct usable state from sync data alone
 *       fromCompletion: (courseData) => ({...}),         // construct from course completion record
 *       resumeText: (data, source) => '...',            // generate resume display text
 *   });
 *
 *   fed.save(fullState)     // writes both full + lightweight keys
 *   fed.load()              // → { data, source: 'local'|'sync'|'completion'|null }
 *   fed.getResume()         // → { hasResume, text, source, data }
 *   fed.reset()             // clears both keys
 *   fed.refresh()           // re-read sync key, merge into current
 *
 * Dependencies (loaded before this script):
 *   - None required (uses typeof guards for WSAProgress, CourseProgress)
 *   - ProgressRestore.js dispatches hexworth:progressRestored (listened for)
 */
(function() {
    'use strict';

    const _handles = [];

    // ── Course Progress Lookup ──────────────────────────────────
    function _getCourseData(provider, moduleKey, component) {
        if (!provider || !moduleKey || !component) return null;
        try {
            if (provider === 'wsa' && typeof WSAProgress !== 'undefined') {
                const mod = WSAProgress.getModule(moduleKey);
                if (mod && mod[component] && typeof mod[component] === 'object') return mod[component];
            } else if (typeof CourseProgress !== 'undefined') {
                const mod = CourseProgress.getModule(provider, moduleKey);
                if (mod && mod[component] && typeof mod[component] === 'object') return mod[component];
            }
        } catch(e) {}
        return null;
    }

    // ── FederatedHandle ─────────────────────────────────────────
    function FederatedHandle(config) {
        this._storageKey = config.storageKey;
        this._syncKey = config.syncKey || (config.storageKey + '-sync');
        this._courseProgressKey = config.courseProgressKey || null;
        this._courseProgressProvider = config.courseProgressProvider || null;
        this._courseProgressComponent = config.courseProgressComponent || null;
        this._extract = config.extract || null;
        this._merge = config.merge || null;
        this._fromSync = config.fromSync !== undefined ? config.fromSync : null;
        this._fromCompletion = config.fromCompletion || null;
        this._resumeText = config.resumeText || null;
    }

    /**
     * Dual save: writes full state to storageKey, lightweight extract to syncKey.
     * @param {*} fullState - The full state object to persist
     */
    FederatedHandle.prototype.save = function(fullState) {
        // Write full state
        try {
            localStorage.setItem(this._storageKey, JSON.stringify(fullState));
        } catch(e) { /* storage full */ }

        // Write lightweight sync key
        if (this._extract) {
            try {
                localStorage.setItem(this._syncKey, JSON.stringify(this._extract(fullState)));
            } catch(e) { /* non-critical */ }
        }

        // Queue a debounced cloud push of the FULL state so a second device restores the whole
        // environment, not just the completion flags (all the 10KB-capped bulk sync can carry).
        if (window.LabStateSync && typeof window.LabStateSync.queuePush === 'function') {
            try { window.LabStateSync.queuePush(this._storageKey); } catch(e) { /* optional dependency */ }
        }
    };

    /**
     * Cascading load with 4-tier fallback.
     *
     * Why 4 tiers: A user may arrive on a new device where only the lightweight
     * sync key exists (restored by Firestore blob sync), or on a device where
     * they completed a course module but never opened this specific tool.
     * The cascade ensures we always recover the best available starting state.
     * Tier 1 also merges sync data into local state because another device may
     * have completed items that this device's full state doesn't reflect.
     *
     * @returns {{ data: *, source: 'local'|'sync'|'completion'|null }}
     */
    FederatedHandle.prototype.load = function() {
        // Tier 1: Full local state
        try {
            const raw = localStorage.getItem(this._storageKey);
            if (raw) {
                const fullState = JSON.parse(raw);
                // Merge sync completions into full state
                if (this._merge) {
                    try {
                        const syncRaw = localStorage.getItem(this._syncKey);
                        if (syncRaw) this._merge(fullState, JSON.parse(syncRaw));
                    } catch(e) { /* non-critical */ }
                }
                return { data: fullState, source: 'local' };
            }
        } catch(e) { /* corrupt storage */ }

        // Tier 2: Sync key only (from another device)
        if (this._fromSync) {
            try {
                const syncRaw = localStorage.getItem(this._syncKey);
                if (syncRaw) {
                    const syncData = JSON.parse(syncRaw);
                    return { data: this._fromSync(syncData), source: 'sync' };
                }
            } catch(e) { /* corrupt sync */ }
        }

        // Tier 3: Course completion record
        if (this._fromCompletion) {
            const courseData = _getCourseData(
                this._courseProgressProvider,
                this._courseProgressKey,
                this._courseProgressComponent
            );
            if (courseData) {
                return { data: this._fromCompletion(courseData), source: 'completion' };
            }
        }

        // Tier 4: Nothing found
        return { data: null, source: null };
    };

    /**
     * Generate resume info for UI display.
     * @returns {{ hasResume: boolean, text: string, source: string|null, data: * }}
     */
    FederatedHandle.prototype.getResume = function() {
        var result = this.load();
        if (!result.data) return { hasResume: false, text: '', source: null, data: null };
        var text = '';
        if (this._resumeText) {
            try { text = this._resumeText(result.data, result.source); } catch(e) { text = ''; }
        }
        return { hasResume: true, text: text, source: result.source, data: result.data };
    };

    /**
     * Clear both full state and sync keys.
     */
    FederatedHandle.prototype.reset = function() {
        localStorage.removeItem(this._storageKey);
        localStorage.removeItem(this._syncKey);
    };

    /**
     * Clear full state only; preserve sync key for other devices.
     */
    FederatedHandle.prototype.clearFull = function() {
        localStorage.removeItem(this._storageKey);
    };

    /**
     * Re-read sync key and merge into current localStorage state.
     * Used when late-arriving sync data may have new completions.
     * @returns {{ merged: boolean, source: string|null, data: * }}
     */
    FederatedHandle.prototype.refresh = function() {
        // If full state exists, merge sync into it
        try {
            var raw = localStorage.getItem(this._storageKey);
            if (raw && this._merge) {
                var fullState = JSON.parse(raw);
                var syncRaw = localStorage.getItem(this._syncKey);
                if (syncRaw) {
                    this._merge(fullState, JSON.parse(syncRaw));
                    return { merged: true, source: 'local', data: fullState };
                }
            }
        } catch(e) {}

        // No full state — try loading from cascade
        var result = this.load();
        if (result.data) return { merged: true, source: result.source, data: result.data };

        return { merged: false, source: null, data: null };
    };

    // ── Static API ──────────────────────────────────────────────

    /**
     * Register a module for federated state management.
     * @param {Object} config - Registration config
     * @returns {FederatedHandle}
     */
    function register(config) {
        if (!config || !config.storageKey) {
            throw new Error('[StateFederation] storageKey is required');
        }
        var handle = new FederatedHandle(config);
        _handles.push(handle);
        // Register the full-state key for cross-device sync (its own Firestore doc, no 10KB cap).
        // No-op if LabStateSync isn't loaded on this page, so existing labs are unaffected.
        if (window.LabStateSync && typeof window.LabStateSync.register === 'function') {
            try { window.LabStateSync.register(config.storageKey); } catch (e) { /* optional dependency */ }
        }
        return handle;
    }

    /**
     * Get all registered handles (for debugging/testing).
     * @returns {FederatedHandle[]}
     */
    function getHandles() {
        return _handles.slice();
    }

    // ── Late Sync Event Handling ────────────────────────────────
    // When ProgressRestore.js completes cloud sync, refresh all handles
    // and dispatch per-handle events for modules listening.
    window.addEventListener('hexworth:progressRestored', function(e) {
        if (!e.detail || !e.detail.addedToLocal) return;

        _handles.forEach(function(handle) {
            var result = handle.refresh();
            if (result.merged && result.data) {
                window.dispatchEvent(new CustomEvent('stateFederation:restored', {
                    detail: {
                        storageKey: handle._storageKey,
                        source: result.source,
                        data: result.data
                    }
                }));
            }
        });
    });

    // ── Export ───────────────────────────────────────────────────
    window.StateFederation = {
        register: register,
        getHandles: getHandles
    };

})();
