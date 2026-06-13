/**
 * ProjectsProgressSync.js — cross-device sync for Projects-hub progress (P4b).
 *
 * Parallels signal/SignalProgressSync.js. Project pages already persist per-project phase
 * state in localStorage under keys "hex_project_<id>" = { "1": true, "2": true, ... }. This
 * bridges those keys with Firestore doc /projects_progress/{uid} (field `projects`), so a
 * learner's progress follows them across devices.
 *
 * Sync model: INDEX-VISIT. The hub (index.html) calls bootstrap() on load (pull cloud, union
 * with local, write back) and push() to persist. Individual project pages write localStorage
 * only; their progress is captured on the next hub visit. Merge is a UNION per phase (done on
 * either device stays done) — you never un-complete a phase, so older-wins is wrong here.
 *
 * Requires FirebaseAuth.js (sets window.firebaseApp + FirebaseAuth) loaded first.
 * Firestore rule: match /projects_progress/{userId} { allow read,write: if auth.uid==userId }.
 */
(function () {
    'use strict';

    var KEY_PREFIX = 'hex_project_';
    var COLLECTION = 'projects_progress';
    var DEBOUNCE_MS = 1500;

    var _firestoreModule = null, _db = null, _bootstrapped = false, _busy = false, _timer = null;

    // Gather every hex_project_<id> localStorage key into { id: {phase:bool} }.
    function _readLocalAll() {
        var out = {};
        try {
            for (var i = 0; i < localStorage.length; i++) {
                var k = localStorage.key(i);
                if (k && k.indexOf(KEY_PREFIX) === 0) {
                    var id = k.slice(KEY_PREFIX.length);
                    try { out[id] = JSON.parse(localStorage.getItem(k)) || {}; } catch (e) { /* skip bad */ }
                }
            }
        } catch (e) { /* localStorage unavailable */ }
        return out;
    }

    // Write a { id: {phase:bool} } map back to per-project localStorage keys.
    function _writeLocalAll(map) {
        try {
            Object.keys(map).forEach(function (id) {
                localStorage.setItem(KEY_PREFIX + id, JSON.stringify(map[id]));
            });
        } catch (e) { /* ignore */ }
    }

    // Union merge: a phase true on either side stays true (additive progress, never un-done).
    function _merge(local, cloud) {
        var out = {}, ids = {};
        [local, cloud].forEach(function (src) { Object.keys(src || {}).forEach(function (id) { ids[id] = 1; }); });
        Object.keys(ids).forEach(function (id) {
            var a = local[id] || {}, b = cloud[id] || {}, m = {};
            Object.keys(a).forEach(function (ph) { if (a[ph]) m[ph] = true; });
            Object.keys(b).forEach(function (ph) { if (b[ph]) m[ph] = true; });
            out[id] = m;
        });
        return out;
    }

    // Lazy-load the Firestore module against the app FirebaseAuth.js initialized.
    function _ensureFirestore() {
        if (_db) return Promise.resolve(_db);
        if (!window.firebaseApp || !window.firebaseApp.getApps) return Promise.resolve(null);
        var apps = window.firebaseApp.getApps();
        if (!apps.length) return Promise.resolve(null);
        var load = _firestoreModule
            ? Promise.resolve(_firestoreModule)
            : import('https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js')
                .then(function (m) { _firestoreModule = m; return m; })
                .catch(function (e) { console.warn('[ProjectsProgressSync] firestore load failed:', e && e.message); return null; });
        return load.then(function (m) {
            if (!m) return null;
            _db = m.getFirestore(apps[0]);
            return _db;
        });
    }

    // Current authenticated user (or null) via FirebaseAuth, guarded if it isn't loaded.
    function _user() {
        if (typeof FirebaseAuth !== 'undefined' && FirebaseAuth.getUser) {
            try { return FirebaseAuth.getUser(); } catch (e) { /* fall through */ }
        }
        return null;
    }

    // Pull cloud, union with local, write back to both. Re-renders hub badges if anything changed.
    function bootstrap() {
        if (_bootstrapped) return;
        var user = _user();
        if (!user) return;
        return _ensureFirestore().then(function (db) {
            if (!db) return;
            _bootstrapped = true;
            var fx = _firestoreModule;
            var ref = fx.doc(db, COLLECTION, user.uid);
            return fx.getDoc(ref).then(function (snap) {
                var cloud = (snap.exists() && (snap.data() || {}).projects) || {};
                var local = _readLocalAll();
                var merged = _merge(local, cloud);
                _writeLocalAll(merged);
                // Notify the hub so completion badges reflect the merged state.
                if (typeof window.__hexProjectsProgressChanged === 'function') {
                    try { window.__hexProjectsProgressChanged(); } catch (e) { /* not fatal */ }
                }
                // Only write back if local had progress the cloud lacked (avoids a write on every
                // hub load; mirrors SignalProgressSync's cloudChanged guard). Order-independent.
                var changed = false;
                Object.keys(local).forEach(function (id) {
                    var a = local[id] || {}, b = cloud[id] || {};
                    Object.keys(a).forEach(function (ph) { if (a[ph] && !b[ph]) changed = true; });
                });
                if (!changed) return;
                return fx.setDoc(ref, { projects: merged, updatedAt: fx.serverTimestamp() }, { merge: true });
            }).catch(function (e) {
                console.warn('[ProjectsProgressSync] bootstrap failed:', e && e.message);
                _bootstrapped = false;
            });
        });
    }

    // Debounced push of full local state to cloud. No-op if offline/unauthenticated.
    function push() {
        if (_timer) clearTimeout(_timer);
        _timer = setTimeout(function () {
            _timer = null;
            if (_busy) return;
            var user = _user();
            if (!user) return;
            _ensureFirestore().then(function (db) {
                if (!db) return;
                _busy = true;
                var fx = _firestoreModule;
                var ref = fx.doc(db, COLLECTION, user.uid);
                return fx.setDoc(ref, { projects: _readLocalAll(), updatedAt: fx.serverTimestamp() }, { merge: true })
                    .catch(function (e) { console.warn('[ProjectsProgressSync] push failed:', e && e.message); })
                    .then(function () { _busy = false; });
            });
        }, DEBOUNCE_MS);
    }

    // Auto-bootstrap once auth is ready (FirebaseAuth.js drives this).
    function _hookAuth() {
        if (typeof FirebaseAuth !== 'undefined' && FirebaseAuth.waitForAuth) {
            FirebaseAuth.waitForAuth().then(function (user) { if (user) bootstrap(); }).catch(function () {});
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', _hookAuth);
    } else {
        _hookAuth();
    }

    window.ProjectsProgressSync = { bootstrap: bootstrap, push: push, readLocalAll: _readLocalAll };
})();
