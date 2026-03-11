/* ============================================================
   ArenaFirebase — Shared Firebase initialization for arena pages
   _app/arena/firebase-init.js

   Provides a single, idempotent entry point for Firebase auth
   and Firestore across the arena hub and all box pages.

   Loading order on box pages:
     FirebaseAuth.js  → initializes firebase-app + firebase-auth
     firebase-init.js → loads firebase-firestore, grabs the live
                        app instance, ensures anonymous sign-in,
                        exposes ArenaFirebase.auth / .db / .isReady()

   Loading order on the arena hub (index.html):
     firebase-init.js → self-contained; bootstraps everything

   No build step — all Firebase SDKs loaded via ESM dynamic import
   from gstatic CDN (same version used across the codebase: 12.7.0).

   ─── Firestore rules note ───────────────────────────────────────
   The `runs/{runId}` collection (individual solo run records) is
   NOT yet defined in firestore.rules. If future features write to
   it, add a rule such as:

     match /runs/{runId} {
       allow read:   if request.auth != null
                     && resource.data.uid == request.auth.uid;
       allow create: if request.auth != null
                     && request.resource.data.uid == request.auth.uid;
       allow update: if request.auth != null
                     && resource.data.uid == request.auth.uid;
     }

   The existing `arena_sessions/{sessionId}` collection is already
   covered by firestore.rules lines 113-124.
   ─────────────────────────────────────────────────────────────────
   ============================================================ */

const ArenaFirebase = (function() {
    'use strict';

    // ─── Private state ───────────────────────────────────────────

    const FIREBASE_VERSION = '12.7.0';

    // Same config used by FirebaseAuth.js and CoOpSync.js
    const FIREBASE_CONFIG = {
        apiKey:            "AIzaSyC3tWNETi36DA8Q1I60n7t09YfU9HapA4M",
        authDomain:        "hexworth-prime.firebaseapp.com",
        projectId:         "hexworth-prime",
        storageBucket:     "hexworth-prime.firebasestorage.app",
        messagingSenderId: "11726236962",
        appId:             "1:11726236962:web:1829ea0839f2587121497b"
    };

    let _auth = null;       // firebase.auth.Auth instance
    let _db   = null;       // firebase.firestore.Firestore instance
    let _ready = false;     // true once both auth and db are live
    let _initializing = false;

    // Promise that resolves when initialization completes (success or failure).
    // Callers awaiting isReady() block on this.
    let _readyResolve = null;
    const _readyPromise = new Promise(resolve => { _readyResolve = resolve; });

    // ─── SDK loaders ─────────────────────────────────────────────

    /**
     * Load firebase-app module if not already available.
     * FirebaseAuth.js populates window.firebaseApp on box pages —
     * this is a no-op in that case.
     */
    async function _ensureApp() {
        if (!window.firebaseApp) {
            window.firebaseApp = await import(
                `https://www.gstatic.com/firebasejs/${FIREBASE_VERSION}/firebase-app.js`
            );
        }
    }

    /**
     * Load firebase-auth module if not already available.
     * Again, FirebaseAuth.js will have done this on box pages.
     */
    async function _ensureAuth() {
        if (!window.firebaseAuth) {
            window.firebaseAuth = await import(
                `https://www.gstatic.com/firebasejs/${FIREBASE_VERSION}/firebase-auth.js`
            );
        }
    }

    /**
     * Load firebase-firestore module.
     * CoOpSync.js also does this lazily — whichever runs first wins;
     * the second check is a no-op because the module object is cached.
     */
    async function _ensureFirestore() {
        if (!window.firebaseFirestore) {
            window.firebaseFirestore = await import(
                `https://www.gstatic.com/firebasejs/${FIREBASE_VERSION}/firebase-firestore.js`
            );
        }
    }

    // ─── Core init ───────────────────────────────────────────────

    /**
     * Initialize ArenaFirebase.
     *
     * Safe to call multiple times — subsequent calls return the
     * existing _readyPromise without re-running setup.
     *
     * @returns {Promise<boolean>} true on success, false on failure
     */
    async function init() {
        // Already done or in-flight — hand back the shared promise
        if (_ready || _initializing) return _readyPromise;
        _initializing = true;

        try {
            // 1. Load all required SDK modules
            await Promise.all([
                _ensureApp(),
                _ensureAuth(),
                _ensureFirestore()
            ]);

            const { getApps, initializeApp } = window.firebaseApp;
            const { getAuth, onAuthStateChanged, signInAnonymously } = window.firebaseAuth;
            const { getFirestore } = window.firebaseFirestore;

            // 2. Initialize the Firebase app (reuse existing instance if
            //    FirebaseAuth.js already called initializeApp on this page)
            const app = getApps().length > 0
                ? getApps()[0]
                : initializeApp(FIREBASE_CONFIG);

            // 3. Get auth + Firestore from the same app instance
            _auth = getAuth(app);
            _db   = getFirestore(app);

            // 4. Ensure the user is signed in (anonymous is sufficient for arena).
            //    FirebaseAuth.js handles full Google auth on box pages; we just
            //    need any UID so Firestore rules can apply.
            await _ensureSignedIn(_auth, signInAnonymously);

            // 5. Verify the Firestore connection with a lightweight ping
            await _verifyFirestore(_db);

            _ready = true;
            _readyResolve(true);
            console.log('%c[ArenaFirebase] Ready — auth uid: ' + _auth.currentUser?.uid,
                'color: #e74c3c; font-weight: bold');
            return true;

        } catch (error) {
            console.error('[ArenaFirebase] Initialization failed:', error);
            _readyResolve(false);
            return false;
        }
    }

    /**
     * Sign in anonymously if no user is currently authenticated.
     *
     * On box pages, FirebaseAuth.js may already have a signed-in
     * user (anonymous or Google). We only call signInAnonymously
     * when auth.currentUser is null — i.e., when the SDK has not
     * yet resolved its persisted session.
     *
     * We wait for onAuthStateChanged to fire once before deciding,
     * which handles the async persistence-restore case correctly.
     *
     * @param {object} authInstance
     * @param {function} signInAnonymously - Firebase signInAnonymously fn
     */
    async function _ensureSignedIn(authInstance, signInAnonymouslyFn) {
        // If FirebaseAuth is present and already tracking auth state,
        // defer to it rather than calling signInAnonymously ourselves.
        if (typeof FirebaseAuth !== 'undefined') {
            await FirebaseAuth.waitForAuth();
            if (!FirebaseAuth.isSignedIn()) {
                await FirebaseAuth.signInAnonymously();
            }
            return;
        }

        // Standalone path (arena hub, no FirebaseAuth.js loaded):
        // wait for the first onAuthStateChanged callback, then sign
        // in anonymously if still no user.
        await new Promise((resolve) => {
            const unsubscribe = onAuthStateChanged(authInstance, (user) => {
                unsubscribe();
                resolve(user);
            });
        });

        if (!authInstance.currentUser) {
            await signInAnonymouslyFn(authInstance);
            console.log('[ArenaFirebase] Anonymous sign-in complete');
        }
    }

    /**
     * Verify Firestore is reachable by reading a public document.
     * Uses the leaderboards collection which already allows
     * authenticated reads in firestore.rules.
     *
     * Failure is non-fatal — we log a warning but do not throw,
     * so arena pages still load even on flaky connections.
     *
     * @param {object} firestoreInstance
     */
    async function _verifyFirestore(firestoreInstance) {
        try {
            const { doc, getDoc } = window.firebaseFirestore;
            // Attempt a read against a known-safe path.
            // arena_sessions is readable by any authenticated user.
            await getDoc(doc(firestoreInstance, '_arena_probe_', 'ping'))
                .catch(() => {
                    // Expected to be "not found" or "permission-denied" on a
                    // non-existent doc — either proves the connection is live.
                });
            console.log('[ArenaFirebase] Firestore connection verified');
        } catch (error) {
            // Network error (offline, DNS failure, etc.)
            console.warn('[ArenaFirebase] Firestore ping failed — continuing offline:', error.message);
        }
    }

    // ─── Public API ──────────────────────────────────────────────

    /**
     * Wait for ArenaFirebase to be fully initialized.
     *
     * Usage:
     *   const ok = await ArenaFirebase.isReady();
     *   if (ok) { // use ArenaFirebase.db / .auth }
     *
     * @returns {Promise<boolean>}
     */
    async function isReady() {
        if (_ready) return true;
        return _readyPromise;
    }

    return {
        /**
         * firebase.auth.Auth instance.
         * Available after isReady() resolves.
         * @type {object|null}
         */
        get auth() { return _auth; },

        /**
         * firebase.firestore.Firestore instance.
         * Available after isReady() resolves.
         * @type {object|null}
         */
        get db() { return _db; },

        /**
         * Returns true synchronously if already initialized,
         * otherwise returns a Promise<boolean>.
         *
         * @returns {boolean|Promise<boolean>}
         */
        isReady,

        /**
         * Explicit init entry point.
         * Called automatically on DOMContentLoaded, but can be
         * called earlier by any arena script that needs Firebase first.
         *
         * @returns {Promise<boolean>}
         */
        init
    };
})();

// Auto-initialize when DOM is ready.
// On box pages this fires after FirebaseAuth.js has already loaded
// (it is listed first in every box index.html), so the Firebase app
// instance will already exist and _ensureApp()/_ensureAuth() are no-ops.
document.addEventListener('DOMContentLoaded', function() {
    ArenaFirebase.init();
});
