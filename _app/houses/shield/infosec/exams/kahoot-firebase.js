/* ============================================================
   KahootFirebase — Firebase adapter for PIS Live Kahoot
   _app/houses/shield/infosec/exams/kahoot-firebase.js

   Mirrors the pattern from _app/arena/firebase-init.js:
   - Same Firebase config and SDK version (12.7.0)
   - Idempotent init (safe to call multiple times)
   - Exposes KahootFirebase.auth / .db / .isReady()
   - Ensures anonymous sign-in on first call (player path)
   - Host path: FirebaseAuth.js will already have a non-anon
     user in auth.currentUser; this adapter defers to that
     existing session instead of overriding with anon auth.

   Loading order (host page):
     FirebaseAuth.js  -> full tenant auth (must be sorted)
     AccessGuard.js   -> blocks unauthenticated users
     kahoot-firebase.js -> grabs existing app, adds Firestore

   Loading order (join page):
     kahoot-firebase.js -> bootstraps everything from scratch,
                           signs in anonymously for Firestore writes
   ============================================================ */

window.KahootFirebase = (function() {
    'use strict';

    // ─── Constants ──────────────────────────────────────────────

    const FIREBASE_VERSION = '12.7.0';

    // Same canonical config used across all Hexworth Firebase surfaces
    const FIREBASE_CONFIG = {
        apiKey:            "AIzaSyC3tWNETi36DA8Q1I60n7t09YfU9HapA4M",
        authDomain:        "hexworth-prime.firebaseapp.com",
        projectId:         "hexworth-prime",
        storageBucket:     "hexworth-prime.firebasestorage.app",
        messagingSenderId: "11726236962",
        appId:             "1:11726236962:web:1829ea0839f2587121497b"
    };

    // ─── Private state ───────────────────────────────────────────

    let _auth         = null;
    let _db           = null;
    let _ready        = false;
    let _initializing = false;

    let _readyResolve = null;
    const _readyPromise = new Promise(resolve => { _readyResolve = resolve; });

    // ─── SDK loaders ─────────────────────────────────────────────

    async function _ensureApp() {
        if (!window.firebaseApp) {
            window.firebaseApp = await import(
                `https://www.gstatic.com/firebasejs/${FIREBASE_VERSION}/firebase-app.js`
            );
        }
    }

    async function _ensureAuth() {
        if (!window.firebaseAuth) {
            window.firebaseAuth = await import(
                `https://www.gstatic.com/firebasejs/${FIREBASE_VERSION}/firebase-auth.js`
            );
        }
    }

    async function _ensureFirestore() {
        if (!window.firebaseFirestore) {
            window.firebaseFirestore = await import(
                `https://www.gstatic.com/firebasejs/${FIREBASE_VERSION}/firebase-firestore.js`
            );
        }
    }

    // ─── Core init ───────────────────────────────────────────────

    /**
     * Initialize KahootFirebase.
     * Safe to call multiple times — subsequent calls return the
     * existing _readyPromise without re-running setup.
     *
     * @returns {Promise<boolean>} true on success, false on failure
     */
    async function init() {
        if (_ready || _initializing) return _readyPromise;
        _initializing = true;

        try {
            await Promise.all([
                _ensureApp(),
                _ensureAuth(),
                _ensureFirestore()
            ]);

            const { getApps, initializeApp } = window.firebaseApp;
            const { getAuth, onAuthStateChanged, signInAnonymously } = window.firebaseAuth;
            const { getFirestore } = window.firebaseFirestore;

            // Reuse existing Firebase app instance if FirebaseAuth.js
            // already called initializeApp (host page scenario)
            const app = getApps().length > 0
                ? getApps()[0]
                : initializeApp(FIREBASE_CONFIG);

            _auth = getAuth(app);
            _db   = getFirestore(app);

            // Ensure a user is authenticated. On the host page FirebaseAuth
            // has already resolved a tenant user — we defer to that. On the
            // join page (no FirebaseAuth.js loaded) we sign in anonymously.
            await _ensureSignedIn(_auth, signInAnonymously, onAuthStateChanged);

            _ready = true;
            _readyResolve(true);
            console.log('%c[KahootFirebase] Ready — uid: ' + (_auth.currentUser ? _auth.currentUser.uid : 'none'),
                'color: #3b82f6; font-weight: bold');
            return true;

        } catch (error) {
            console.error('[KahootFirebase] Initialization failed:', error);
            _readyResolve(false);
            return false;
        }
    }

    /**
     * Ensure the auth instance has a signed-in user.
     *
     * Host path: FirebaseAuth.js is present and has already
     * resolved a tenant (non-anonymous) user. We wait for it
     * and avoid overwriting with an anonymous credential.
     *
     * Player path: no FirebaseAuth.js loaded. We wait for the
     * first onAuthStateChanged callback, then sign in
     * anonymously if no persisted session is found.
     */
    async function _ensureSignedIn(authInstance, signInAnonymouslyFn, onAuthStateChanged) {
        // Host path: FirebaseAuth.js present
        if (typeof FirebaseAuth !== 'undefined') {
            await FirebaseAuth.waitForAuth();
            // Host is a logged-in tenant user — do not override with anon
            return;
        }

        // Player path: wait for persistence restore then anon-sign if needed
        await new Promise((resolve) => {
            const unsub = onAuthStateChanged(authInstance, (user) => {
                unsub();
                resolve(user);
            });
        });

        if (!authInstance.currentUser) {
            await signInAnonymouslyFn(authInstance);
            console.log('[KahootFirebase] Anonymous sign-in complete (player)');
        }
    }

    // ─── Public API ──────────────────────────────────────────────

    /**
     * Wait for KahootFirebase to be fully initialized.
     *
     * Usage:
     *   const ok = await KahootFirebase.isReady();
     *   if (ok) { // use KahootFirebase.db / .auth }
     *
     * @returns {Promise<boolean>}
     */
    async function isReady() {
        if (_ready) return true;
        return _readyPromise;
    }

    return {
        /** firebase.auth.Auth instance. Available after isReady() resolves. */
        get auth() { return _auth; },

        /** firebase.firestore.Firestore instance. Available after isReady() resolves. */
        get db() { return _db; },

        /**
         * Returns true synchronously if already initialized,
         * otherwise returns a Promise<boolean>.
         */
        isReady,

        /**
         * Explicit init entry point.
         * Also called automatically on DOMContentLoaded.
         */
        init
    };
})();

// Auto-initialize when DOM is ready.
document.addEventListener('DOMContentLoaded', function() {
    KahootFirebase.init();
});
