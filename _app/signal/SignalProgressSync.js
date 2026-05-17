/**
 * SignalProgressSync — Firestore sync for Signal hub project completions
 *
 * Bridges localStorage (key "hexworth_signal_progress") and Firestore
 * (doc /signal_progress/{uid}). Stores a flat completed map keyed by
 * project id: { "sg-NN": <epoch ms when marked complete> }.
 *
 * Lifecycle:
 *   1. Auth ready  -> pull cloud doc, union with local, write merged
 *                     back to both. SignalEngine.reloadProgress() is
 *                     called so the live UI reflects the union.
 *   2. SignalEngine.toggleComplete (via _saveProgress) -> calls
 *                     SignalProgressSync.push(), which debounces a
 *                     Firestore upsert.
 *   3. Offline / unauthenticated -> everything is a no-op. Next
 *                     successful auth-ready bootstrap reconciles via
 *                     idempotent union.
 *
 * Merge rule: older-wins. If sg-103 was marked complete on laptop A
 * at T1 and laptop B at T2 > T1, the canonical timestamp is T1 (first
 * completion wins). Prevents a stale device from clobbering a record.
 *
 * Uses Firebase v12.7.0 modular SDK via dynamic import. Depends on
 * window.firebaseApp / window.firebaseAuth being populated by
 * FirebaseAuth.js (which SignalEngine auto-loads).
 *
 * Firestore rule (firestore.rules):
 *   match /signal_progress/{userId} {
 *     allow read, write: if request.auth.uid == userId;
 *   }
 */
(function () {
    'use strict';

    const STORAGE_KEY = 'hexworth_signal_progress';
    const COLLECTION  = 'signal_progress';
    const DEBOUNCE_MS = 1500;

    let _firestoreModule = null;
    let _db = null;
    let _debounceTimer = null;
    let _busy = false;
    let _authBootstrapped = false;

    function _readLocal() {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') || {};
        } catch (e) {
            return {};
        }
    }

    function _writeLocal(progress) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
        } catch (e) {
            console.warn('[SignalProgressSync] localStorage write failed:', e);
        }
    }

    // Older-wins union merge. Returns a new object.
    function _merge(local, cloud) {
        const out = { ...cloud };
        for (const [id, ts] of Object.entries(local)) {
            const a = Number(out[id]) || 0;
            const b = Number(ts) || 0;
            if (!(id in out)) {
                out[id] = ts;
            } else if (a === 0) {
                out[id] = b;
            } else if (b > 0) {
                out[id] = Math.min(a, b);
            }
        }
        return out;
    }

    async function _ensureFirestore() {
        if (_db) return _db;
        if (!window.firebaseApp || !window.firebaseApp.getApps) return null;
        const apps = window.firebaseApp.getApps();
        if (!apps.length) return null;

        if (!_firestoreModule) {
            try {
                _firestoreModule = await import('https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js');
            } catch (e) {
                console.warn('[SignalProgressSync] firestore module load failed:', e.message || e);
                return null;
            }
        }
        const { getFirestore } = _firestoreModule;
        _db = getFirestore(apps[0]);
        return _db;
    }

    function _user() {
        if (typeof FirebaseAuth !== 'undefined' && FirebaseAuth.getUser) {
            try { return FirebaseAuth.getUser(); } catch (e) { /* fall through */ }
        }
        return null;
    }

    // Pull cloud doc, union with local, write back. Called once per page
    // load when auth becomes ready.
    async function bootstrap() {
        if (_authBootstrapped) return;
        const user = _user();
        if (!user) return;
        const db = await _ensureFirestore();
        if (!db) return;

        _authBootstrapped = true;

        const { doc, getDoc, setDoc, serverTimestamp } = _firestoreModule;
        const ref = doc(db, COLLECTION, user.uid);

        let cloud = {};
        try {
            const snap = await getDoc(ref);
            if (snap.exists()) {
                const data = snap.data() || {};
                cloud = data.completed || {};
            }
        } catch (e) {
            console.warn('[SignalProgressSync] pull failed:', e.message || e);
            _authBootstrapped = false;
            return;
        }

        const local = _readLocal();
        const merged = _merge(local, cloud);

        const cloudKeys = Object.keys(cloud);
        const mergedKeys = Object.keys(merged);
        const cloudChanged =
            cloudKeys.length !== mergedKeys.length ||
            mergedKeys.some(k => cloud[k] !== merged[k]);
        const localChanged =
            Object.keys(local).length !== mergedKeys.length ||
            mergedKeys.some(k => local[k] !== merged[k]);

        if (localChanged) {
            _writeLocal(merged);
            if (typeof SignalEngine !== 'undefined' && SignalEngine.reloadProgress) {
                try { SignalEngine.reloadProgress(); } catch (e) { /* not fatal */ }
            }
        }

        if (cloudChanged) {
            try {
                await setDoc(ref, {
                    completed: merged,
                    updatedAt: serverTimestamp(),
                }, { merge: true });
            } catch (e) {
                console.warn('[SignalProgressSync] post-bootstrap write failed:', e.message || e);
            }
        }
    }

    // Debounced push: called by SignalEngine._saveProgress on every
    // toggle. Writes the full local state to Firestore so the union is
    // the same on every device's next bootstrap. No-op if offline or
    // unauthenticated.
    function push() {
        if (_debounceTimer) clearTimeout(_debounceTimer);
        _debounceTimer = setTimeout(async () => {
            _debounceTimer = null;
            if (_busy) return;
            const user = _user();
            if (!user) return;
            const db = await _ensureFirestore();
            if (!db) return;

            const { doc, setDoc, serverTimestamp } = _firestoreModule;
            const ref = doc(db, COLLECTION, user.uid);

            _busy = true;
            try {
                await setDoc(ref, {
                    completed: _readLocal(),
                    updatedAt: serverTimestamp(),
                }, { merge: true });
            } catch (e) {
                console.warn('[SignalProgressSync] push failed:', e.message || e);
            } finally {
                _busy = false;
            }
        }, DEBOUNCE_MS);
    }

    function _hookAuth() {
        if (typeof FirebaseAuth !== 'undefined' && FirebaseAuth.waitForAuth) {
            FirebaseAuth.waitForAuth().then(user => { if (user) bootstrap(); }).catch(() => {});
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', _hookAuth);
    } else {
        _hookAuth();
    }

    window.SignalProgressSync = { bootstrap, push };
})();
