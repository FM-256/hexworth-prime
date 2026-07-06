/**
 * LabStateSync.js — Cross-Device Full Lab-State Sync
 *
 * Problem this solves: the platform's bulk localStorage sync (FirestoreManager) drops any single
 * value over 10 KB (SYNC_MAX_VALUE_SIZE). Simulated multi-stage labs (WSA gauntlets, capstones)
 * serialize their entire environment — the AD forest, DNS zones, servers, created OUs — into one
 * localStorage value that is ~12-24 KB, so it never travels across devices. Only the small
 * completion-flags key does, so on a second device the student sees "stage 3 done" over a fresh,
 * empty environment and later stages have nothing to act on.
 *
 * This module carries each registered full-state key as its OWN Firestore doc under the existing
 * users/{uid}/sync/{docId} subcollection (already owner read/write per firestore.rules), which has
 * no 10 KB cap (Firestore's real limit is ~1 MB per doc — orders of magnitude of headroom). It
 * leaves the core FirestoreManager sync path completely untouched.
 *
 * Merge policy: last-write-wins by the state's embedded `lastSaved` timestamp. A student uses one
 * device at a time, so this is safe and avoids clobbering newer work with an older device's copy.
 *
 * Usage (via StateFederation, which registers its storageKey automatically):
 *   LabStateSync.register('wsa-advanced-gauntlet-state');   // pulls cloud copy if newer
 *   LabStateSync.queuePush('wsa-advanced-gauntlet-state');  // debounced cloud push on save
 *
 * When a newer cloud copy is pulled into localStorage, this dispatches hexworth:progressRestored
 * (the same event ProgressRestore uses), so StateFederation.refresh() re-hydrates the lab.
 *
 * Dependencies (loaded before this script): FirestoreManager (getDb), FirebaseAuth (getUser),
 * window.firebaseFirestore (modular SDK fns). All accessed via typeof guards — absence is a no-op.
 */
(function () {
    'use strict';

    const KEYS = new Set();          // registered full-state localStorage keys
    const _timers = {};              // per-key debounce timers for push
    const MAX_VALUE_SIZE = 700000;   // 700 KB ceiling per doc (well under Firestore's ~1 MB limit)
    const PUSH_DEBOUNCE_MS = 3500;   // coalesce rapid saves into one cloud write

    // Live Firestore db handle (reuses FirestoreManager's — null until FirestoreManager.init ran).
    function _db() {
        try { return (window.FirestoreManager && FirestoreManager.getDb && FirestoreManager.getDb()) || null; }
        catch (e) { return null; }
    }

    // Current signed-in uid, or null.
    function _uid() {
        try {
            const u = window.FirebaseAuth && FirebaseAuth.getUser && FirebaseAuth.getUser();
            return (u && u.uid) || null;
        } catch (e) { return null; }
    }

    // Firestore doc id for a full-state key (sanitized — no '/' or exotic chars).
    function _docId(key) {
        return 'labstate_' + String(key).replace(/[^a-zA-Z0-9_-]/g, '_');
    }

    // The embedded lastSaved timestamp of a serialized lab state (0 if absent/unparseable).
    function _lastSaved(json) {
        try { const o = JSON.parse(json); return Number(o && o.lastSaved) || 0; }
        catch (e) { return 0; }
    }

    // Pull one key's cloud copy into localStorage if it is newer than the local copy.
    // Returns true if localStorage was updated.
    async function _pullKey(key) {
        const db = _db(), uid = _uid();
        if (!db || !uid || !window.firebaseFirestore) return false;
        try {
            const { doc, getDoc } = window.firebaseFirestore;
            const snap = await getDoc(doc(db, 'users', uid, 'sync', _docId(key)));
            if (!snap.exists()) return false;
            const data = snap.data();
            if (!data || typeof data.value !== 'string') return false;
            const local = localStorage.getItem(key);
            const localSaved = local ? _lastSaved(local) : -1;
            if ((data.lastSaved || 0) > localSaved) {
                localStorage.setItem(key, data.value);
                return true;
            }
        } catch (e) { /* best-effort; a failed pull just leaves local state as-is */ }
        return false;
    }

    // Push one key's local copy to the cloud if the local copy is newer.
    async function _pushKey(key) {
        const db = _db(), uid = _uid();
        if (!db || !uid || !window.firebaseFirestore) return false;
        try {
            const value = localStorage.getItem(key);
            if (value === null || value.length > MAX_VALUE_SIZE) return false;
            const { doc, getDoc, setDoc, serverTimestamp } = window.firebaseFirestore;
            const ref = doc(db, 'users', uid, 'sync', _docId(key));
            const localSaved = _lastSaved(value);
            const snap = await getDoc(ref);
            const cloudSaved = snap.exists() ? (snap.data().lastSaved || 0) : -1;
            if (localSaved <= cloudSaved) return false;   // cloud same/newer — don't clobber
            await setDoc(ref, { type: 'labState', key, value, lastSaved: localSaved, updatedAt: serverTimestamp() });
            return true;
        } catch (e) { /* best-effort */ }
        return false;
    }

    // Notify listeners (StateFederation.refresh → the lab) that local state was restored from cloud.
    function _announceRestore() {
        try { window.dispatchEvent(new CustomEvent('hexworth:progressRestored', { detail: { addedToLocal: true, source: 'labState' } })); }
        catch (e) { /* ignore */ }
    }

    // Pull every registered key; announce once if anything was restored.
    async function pull() {
        if (!KEYS.size) return 0;
        let restored = 0;
        for (const key of KEYS) { if (await _pullKey(key)) restored++; }
        if (restored > 0) _announceRestore();
        return restored;
    }

    // Register a full-state key. Adds it to the sync set and immediately pulls a newer cloud copy
    // (covers labs that load and register AFTER the auth-state sync already fired).
    function register(key) {
        if (!key || KEYS.has(key)) return;
        KEYS.add(key);
        _pullKey(key).then(function (restored) { if (restored) _announceRestore(); });
    }

    // Debounced cloud push for one key — called on every save; coalesces bursts into one write.
    function queuePush(key) {
        if (!key) return;
        KEYS.add(key);
        if (_timers[key]) clearTimeout(_timers[key]);
        _timers[key] = setTimeout(function () { delete _timers[key]; _pushKey(key); }, PUSH_DEBOUNCE_MS);
    }

    // On sign-in (or auth restore), pull all registered keys so a fresh device gets full state.
    window.addEventListener('firebaseAuthStateChanged', function (e) {
        if (e && e.detail && e.detail.user) { pull(); }
    });

    // Also pull after the platform's main sync completes — by then FirestoreManager has initialized
    // its db handle (which our auth listener may have raced ahead of). Skip our OWN restore dispatch
    // to avoid a loop.
    window.addEventListener('hexworth:progressRestored', function (e) {
        if (e && e.detail && e.detail.source === 'labState') return;
        pull();
    });

    window.LabStateSync = {
        register: register,
        queuePush: queuePush,
        pull: pull,
        _keys: function () { return Array.from(KEYS); }
    };

})();
