/**
 * SyncUtils — Merge utilities for cross-device sync.
 *
 * Extracted from FirestoreManager._restoreSyncBlob() so the merge logic
 * can be tested independently without Firestore dependencies.
 *
 * Merge rules:
 *   - Arrays:  union by JSON equality (dedup, preserve order: local first)
 *   - Objects: recursive merge (cloud as base, local overwrites leaf values)
 *   - Booleans: truthy wins (completion monotonicity — true never reverts)
 *   - Numbers: Math.max (XP, scores, timestamps always grow)
 *   - Other scalars: local wins
 *
 * COMPLETION MONOTONICITY RULE:
 *   Once a completion field is true, it MUST stay true across all devices.
 *   This is enforced at the deepMerge level so every sync path inherits it.
 */
const SyncUtils = {

    /**
     * Recursively merge cloud and local data.
     *
     * @param {*} cloud - Data from Firestore (the "base")
     * @param {*} local - Data from localStorage (takes priority)
     * @returns {*} Merged result
     */
    deepMerge(cloud, local) {
        // Null/undefined: take whichever exists
        if (cloud == null) return local;
        if (local == null) return cloud;

        // Arrays: union by JSON equality
        if (Array.isArray(cloud) && Array.isArray(local)) {
            const seen = new Set(local.map(i => JSON.stringify(i)));
            const result = [...local];
            for (const item of cloud) {
                if (!seen.has(JSON.stringify(item))) result.push(item);
            }
            return result;
        }

        // Objects: recursive merge
        if (typeof cloud === 'object' && typeof local === 'object'
            && !Array.isArray(cloud) && !Array.isArray(local)) {
            const result = { ...cloud };
            for (const [k, v] of Object.entries(local)) {
                if (k in result) {
                    result[k] = SyncUtils.deepMerge(result[k], v);
                } else {
                    result[k] = v;
                }
            }
            return result;
        }

        // ── COMPLETION MONOTONICITY ──
        // Booleans: truthy wins (true never reverts to false)
        if (typeof cloud === 'boolean' || typeof local === 'boolean') {
            return cloud || local;
        }

        // Numbers: take the larger value (XP, scores, timestamps grow monotonically)
        if (typeof cloud === 'number' && typeof local === 'number') {
            return Math.max(cloud, local);
        }

        // Object beats primitive (metadata object > bare true/false)
        if (typeof cloud === 'object' && typeof local !== 'object') return cloud;
        if (typeof local === 'object' && typeof cloud !== 'object') return local;

        // Other scalars (strings, etc.): local wins
        return local;
    },

    /**
     * Simulate the full sync-blob restore logic: for each key in the cloud
     * blob, restore missing keys and deep-merge existing ones.
     *
     * This mirrors FirestoreManager._restoreSyncBlob() but operates on
     * plain objects instead of Firestore snapshots, making it testable.
     *
     * @param {Object} cloudBlob - { key: jsonString, ... } from Firestore
     * @param {Object} localState - { key: jsonString, ... } from localStorage
     * @returns {Object} { merged: {key: jsonString}, restored: number, mergedCount: number }
     */
    restoreSyncBlob(cloudBlob, localState) {
        const result = { ...localState };
        let restored = 0;
        let mergedCount = 0;

        for (const [key, value] of Object.entries(cloudBlob)) {
            if (typeof value !== 'string') continue;

            const local = localState[key];
            if (local === undefined || local === null) {
                // Key missing locally — restore from cloud
                result[key] = value;
                restored++;
            } else if (local !== value) {
                // Key exists locally with different value — try to deep merge
                try {
                    const cloudParsed = JSON.parse(value);
                    const localParsed = JSON.parse(local);
                    const merged = SyncUtils.deepMerge(cloudParsed, localParsed);
                    result[key] = JSON.stringify(merged);
                    mergedCount++;
                } catch (e) {
                    // Not JSON — apply scalar monotonicity:
                    // 'true' beats 'false', larger numbers win, else local wins
                    if (value === 'true' && local !== 'true') {
                        result[key] = value;
                        mergedCount++;
                    } else if (/^\d+$/.test(value) && /^\d+$/.test(local)) {
                        const cloudNum = parseInt(value, 10);
                        const localNum = parseInt(local, 10);
                        if (cloudNum > localNum) {
                            result[key] = value;
                            mergedCount++;
                        }
                    }
                    // else: local wins (strings, other types)
                }
            }
        }

        return { merged: result, restored, mergedCount };
    }
};

// Support both browser (window) and Node.js (module.exports)
if (typeof window !== 'undefined') {
    window.SyncUtils = SyncUtils;
}
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SyncUtils;
}
