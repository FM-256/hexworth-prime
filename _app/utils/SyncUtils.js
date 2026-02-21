/**
 * SyncUtils — Merge utilities for cross-device sync.
 *
 * Extracted from FirestoreManager._restoreSyncBlob() so the merge logic
 * can be tested independently without Firestore dependencies.
 *
 * Merge rules:
 *   - Arrays:  union by JSON equality (dedup, preserve order: local first)
 *   - Objects: recursive merge (cloud as base, local overwrites leaf values)
 *   - Scalars: local always wins
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
        if (cloud && local
            && typeof cloud === 'object' && typeof local === 'object'
            && !Array.isArray(cloud) && !Array.isArray(local)) {
            const result = { ...cloud };
            for (const [k, v] of Object.entries(local)) {
                if (k in result && result[k] && v
                    && typeof result[k] === 'object' && typeof v === 'object') {
                    result[k] = SyncUtils.deepMerge(result[k], v);
                } else {
                    result[k] = v;
                }
            }
            return result;
        }

        // Scalar: local wins
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
                    if (typeof cloudParsed === 'object' && cloudParsed !== null
                        && typeof localParsed === 'object' && localParsed !== null) {
                        const merged = SyncUtils.deepMerge(cloudParsed, localParsed);
                        result[key] = JSON.stringify(merged);
                        mergedCount++;
                    }
                    // Scalars or type mismatch: keep local (no overwrite)
                } catch (e) {
                    // Not JSON — keep local value
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
