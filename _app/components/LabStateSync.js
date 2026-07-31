/**
 * LabStateSync.js — Cross-Device Full Lab-State Sync
 *
 * Problem: the platform's bulk localStorage sync (FirestoreManager) drops any single value over
 * 10 KB (SYNC_MAX_VALUE_SIZE). Simulated multi-stage labs (WSA gauntlets, capstones) serialize
 * their entire environment — AD forest, DNS zones, servers, created OUs — into one ~12-24 KB
 * localStorage value, so it never travels cross-device. Only the small completion-flags key does,
 * so on a second device the student sees "stage 3 done" over a fresh, empty environment.
 *
 * This module carries each registered full-state key as its OWN doc under the existing
 * users/{uid}/sync/{docId} subcollection (already owner read/write per firestore.rules; Firestore's
 * real limit is ~1 MB). It never touches FirestoreManager's core sync path.
 *
 * ORDERING (clock-free): each key has a monotonic version counter `<key>__lsv` in localStorage,
 * NOT a wall-clock timestamp — so a device with a skewed clock cannot out-rank or lose another
 * device's newer work. A device adopts the cloud counter when it pulls, and bumps its own counter
 * on every save (queuePush). Because the resume flow pulls BEFORE the student can work (see the
 * lab's boot gate + LabStateSync.ready), a device's counter always starts >= cloud, then increments,
 * so a genuine save always out-ranks the cloud and an empty/unrestored box never can.
 *
 * SAFETY (learned from adversarial review):
 *  - A save that has not incorporated the cloud copy cannot overwrite it (counter comparison).
 *  - Corrupt (unparseable) local state is never pushed as the canonical cloud copy.
 *  - ready(key) lets the lab wait for the initial pull so a fast click can't act on a pre-pull box.
 *
 * Deps (loaded first): FirestoreManager (getDb), FirebaseAuth (getUser), window.firebaseFirestore.
 * All via presence guards — absence is a no-op.
 */
(function () {
    'use strict';

    const KEYS = new Set();          // registered full-state localStorage keys
    const _timers = {};              // per-key debounce timers for push
    const MAX_VALUE_SIZE = 700000;   // 700 KB ceiling per doc (well under Firestore's ~1 MB limit)
    const PUSH_DEBOUNCE_MS = 3500;   // coalesce rapid saves into one cloud write

    // Live Firestore db handle (reuses FirestoreManager's — null until FirestoreManager.init ran).
    function _db() {
        try { return ((typeof FirestoreManager !== 'undefined' && FirestoreManager) && FirestoreManager.getDb && FirestoreManager.getDb()) || null; }
        catch (e) { return null; }
    }

    // Current signed-in uid, or null.
    function _uid() {
        try { const u = (typeof FirebaseAuth !== 'undefined' && FirebaseAuth) && FirebaseAuth.getUser && FirebaseAuth.getUser(); return (u && u.uid) || null; }
        catch (e) { return null; }
    }

    // Firestore doc id for a full-state key (sanitized — no '/' or exotic chars).
    function _docId(key) { return 'labstate_' + String(key).replace(/[^a-zA-Z0-9_-]/g, '_'); }

    // Monotonic version counter for a key. Absent counter: an existing local value is treated as
    // version 0 (older than any cloud push, which starts at 1); no local value at all is -1.
    function _getLsv(key) {
        const raw = localStorage.getItem(key + '__lsv');
        if (raw !== null) { const n = Number(raw); return isNaN(n) ? 0 : n; }
        return localStorage.getItem(key) !== null ? 0 : -1;
    }
    function _setLsv(key, v) { try { localStorage.setItem(key + '__lsv', String(v)); } catch (e) { /* storage full */ } }

    // Notify listeners (StateFederation.refresh → the lab) that local state was restored from cloud.
    function _announceRestore() {
        try { window.dispatchEvent(new CustomEvent('hexworth:progressRestored', { detail: { addedToLocal: true, source: 'labState' } })); }
        catch (e) { /* ignore */ }
    }

    // Attempt to restore one key from cloud. Returns 'restored' | 'nodoc' | 'skip'.
    //  - 'restored': cloud was newer (by counter) and different, and we wrote it to localStorage.
    //  - 'nodoc':    signed in + db ready, but the cloud has no doc for this key (nothing to restore).
    //  - 'skip':     could not attempt (db/uid not ready) or local is already current/newer.
    async function _attemptPull(key) {
        const db = _db(), uid = _uid();
        if (!db || !uid || !window.firebaseFirestore) return 'skip';
        try {
            const { doc, getDoc } = window.firebaseFirestore;
            const snap = await getDoc(doc(db, 'users', uid, 'sync', _docId(key)));
            if (!snap.exists()) return 'nodoc';
            const data = snap.data();
            if (!data || typeof data.value !== 'string') return 'nodoc';
            const cloudLsv = Number(data.lastSaved) || 0;
            // Re-read local AFTER the await (TOCTOU-safe): only restore if the cloud counter still
            // exceeds the current local counter and the content actually differs.
            const localLsv = _getLsv(key);
            if (cloudLsv > localLsv && data.value !== localStorage.getItem(key)) {
                localStorage.setItem(key, data.value);
                _setLsv(key, cloudLsv);
                return 'restored';
            }
            return 'skip';
        } catch (e) { return 'skip'; }
    }

    // Public single-key pull (boolean restored), announces on success.
    async function _pullKey(key) {
        const status = await _attemptPull(key);
        if (status === 'restored') _announceRestore();
        return status === 'restored';
    }

    // Push one key's local copy to the cloud if the local counter is strictly newer. Refuses to push
    // corrupt state, and adopts the cloud copy instead of clobbering it if the cloud advanced past us.
    async function _pushKey(key) {
        const db = _db(), uid = _uid();
        if (!db || !uid || !window.firebaseFirestore) return false;
        try {
            const value = localStorage.getItem(key);
            if (value === null || value.length > MAX_VALUE_SIZE) return false;
            try { JSON.parse(value); } catch (e) { return false; }   // never push unparseable state
            const { doc, getDoc, setDoc, serverTimestamp } = window.firebaseFirestore;
            const ref = doc(db, 'users', uid, 'sync', _docId(key));
            const snap = await getDoc(ref);
            const cloudVal = snap.exists() ? snap.data().value : null;
            const cloudLsv = snap.exists() ? (Number(snap.data().lastSaved) || 0) : -1;
            if (value === cloudVal) return false;                     // identical — nothing to write
            const localLsv = _getLsv(key);
            if (localLsv <= cloudLsv) {
                // Cloud advanced beyond our version (another device). Adopt it rather than clobber.
                if (typeof cloudVal === 'string' && cloudLsv > localLsv) {
                    localStorage.setItem(key, cloudVal); _setLsv(key, cloudLsv); _announceRestore();
                }
                return false;
            }
            await setDoc(ref, { type: 'labState', key, value, lastSaved: localLsv, updatedAt: serverTimestamp() });
            return true;
        } catch (e) { return false; }
    }

    // Pull every registered key; announce once if anything was restored.
    async function pull() {
        if (!KEYS.size) return 0;
        let restored = 0;
        for (const key of KEYS) { if (await _pullKey(key)) restored++; }
        return restored;
    }

    // Register a full-state key; kick an immediate pull (covers labs that register after auth fired).
    function register(key) {
        if (!key || KEYS.has(key)) return;
        KEYS.add(key);
        _pullKey(key);
    }

    // Debounced cloud push for one key — called on every save. Bumps the local counter SYNCHRONOUSLY
    // so a genuine save always out-ranks the cloud, then coalesces the actual write.
    function queuePush(key) {
        if (!key) return;
        KEYS.add(key);
        _setLsv(key, _getLsv(key) + 1);
        if (_timers[key]) clearTimeout(_timers[key]);
        _timers[key] = setTimeout(function () { delete _timers[key]; _pushKey(key); }, PUSH_DEBOUNCE_MS);
    }

    // Resolve once the initial cross-device restore for `key` has SETTLED — the lab awaits this
    // before deciding what to resume, so a fast click cannot act on a pre-pull (empty) box.
    // Resolves 'pulled' (restored newer cloud state), 'nodoc' (cloud has nothing — proceed fresh),
    // or 'timeout' (auth/network too slow — proceed with whatever is local). Never rejects.
    function ready(key, timeoutMs) {
        KEYS.add(key);
        return new Promise(function (resolve) {
            let done = false, timer = null;
            function fin(r) {
                if (done) return; done = true;
                if (timer) clearTimeout(timer);
                window.removeEventListener('hexworth:progressRestored', onR);
                resolve(r);
            }
            function tryPull() {
                _attemptPull(key).then(function (status) {
                    if (status === 'restored') { _announceRestore(); fin('pulled'); }
                    else if (status === 'nodoc') { fin('nodoc'); }
                    // 'skip' (db/uid not ready): wait for a later trigger or the timeout.
                });
            }
            // Re-attempt when the platform's main sync completes (db is initialized by then).
            function onR(e) { if (e && e.detail && e.detail.source === 'labState') return; tryPull(); }
            window.addEventListener('hexworth:progressRestored', onR);
            tryPull();
            timer = setTimeout(function () { fin('timeout'); }, timeoutMs || 4500);
        });
    }

    // On sign-in (or auth restore), pull all registered keys so a fresh device gets full state.
    window.addEventListener('firebaseAuthStateChanged', function (e) {
        if (e && e.detail && e.detail.user) { pull(); }
    });

    // Also pull after the platform's main sync completes (db handle is ready by then). Skip our OWN
    // restore dispatch to avoid a loop.
    window.addEventListener('hexworth:progressRestored', function (e) {
        if (e && e.detail && e.detail.source === 'labState') return;
        pull().then(function (n) { if (n > 0) _announceRestore(); });
    });

    // Clear a key's version counter — call alongside clearing the state value so the two stay
    // coupled (a device must never look "caught up" while holding no content).
    function clearVersion(key) { try { localStorage.removeItem(key + '__lsv'); } catch (e) { /* ignore */ } }

    // Deliberate reset ("Reset" / "Start Fresh"): remove the CLOUD doc and the local counter. A mere
    // local clear is not enough — the counter guard would let the old cloud copy be re-adopted on the
    // next pull/push, silently undoing the reset. Clears local synchronously, returns a promise for the
    // cloud delete so callers that reload (e.g. resetGauntlet) can await it first.
    function deleteCloud(key) {
        clearVersion(key);
        return (async function () {
            const db = _db(), uid = _uid();
            if (!db || !uid || !window.firebaseFirestore || !window.firebaseFirestore.deleteDoc) return false;
            try {
                const { doc, deleteDoc } = window.firebaseFirestore;
                await deleteDoc(doc(db, 'users', uid, 'sync', _docId(key)));
                return true;
            } catch (e) { return false; }
        })();
    }

    window.LabStateSync = {
        register: register,
        queuePush: queuePush,
        pull: pull,
        ready: ready,
        clearVersion: clearVersion,
        deleteCloud: deleteCloud,
        _keys: function () { return Array.from(KEYS); }
    };

})();
