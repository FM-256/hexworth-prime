/**
 * ProgressRestore.js — Universal Cross-Device Progress Sync Trigger
 *
 * Drop this script on ANY page that shows progress-dependent UI.
 * On auth ready, it calls FirestoreManager.syncBidirectional() and
 * dispatches hexworth:progressRestored so the page can re-render.
 *
 * COMPLETION MONOTONICITY RULE:
 *   This component enforces that cloud progress always merges into
 *   the local device on page load. Combined with SyncUtils.deepMerge
 *   (truthy-wins for booleans, Math.max for numbers), completion data
 *   can never revert to an earlier state during sync.
 *
 * Usage:
 *   <script src="components/ProgressRestore.js"></script>
 *   <!-- or from a nested page: -->
 *   <script src="../../../../components/ProgressRestore.js"></script>
 *
 *   // Listen for sync completion:
 *   window.addEventListener('hexworth:progressRestored', (e) => {
 *       console.log('Sync done, added to local:', e.detail.addedToLocal);
 *       // Re-render your progress UI here
 *   });
 *
 * Dependencies (loaded before this script):
 *   - FirebaseAuth.js (auth state)
 *   - FirestoreManager.js (sync logic)
 *   - SyncUtils.js (merge utilities)
 */
(function() {
    'use strict';

    // Only run once per page load
    if (window._progressRestoreInitialized) return;
    window._progressRestoreInitialized = true;

    let _syncing = false;

    async function restore(user) {
        if (_syncing) return;
        if (!user || !user.uid) return;
        if (typeof FirestoreManager === 'undefined' || !FirestoreManager.syncBidirectional) return;

        _syncing = true;
        try {
            const result = await FirestoreManager.syncBidirectional(user.uid);

            window.dispatchEvent(new CustomEvent('hexworth:progressRestored', {
                detail: {
                    synced: result?.synced || false,
                    addedToLocal: result?.addedToLocal || 0,
                    addedToCloud: result?.addedToCloud || 0,
                    totalModules: result?.modulesCount || 0
                }
            }));

            if (result?.addedToLocal > 0) {
                console.log(`[ProgressRestore] Restored ${result.addedToLocal} item(s) from cloud`);
            }
        } catch (err) {
            console.warn('[ProgressRestore] Sync failed:', err.message);
        } finally {
            _syncing = false;
        }
    }

    // Trigger on auth state change
    window.addEventListener('firebaseAuthStateChanged', (e) => {
        if (e.detail && e.detail.user) {
            restore(e.detail.user);
        }
    });

    // Also try immediately if auth is already resolved
    if (typeof FirebaseAuth !== 'undefined') {
        const user = FirebaseAuth.getUser();
        if (user) {
            restore(user);
        }
    }
})();
