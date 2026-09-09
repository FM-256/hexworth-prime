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
    // Deferred sign-in, armed by init(). See the task-372 note at step 4 below: loading a page
    // must not create an account, so the sign-in waits here until something actually needs a uid.
    let _lazyAuth = null;

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

            /* 4. ARM the sign-in; do NOT perform it. (task 372, 2026-09-09)
               This used to `await _ensureSignedIn(...)` right here, on DOMContentLoaded. 276
               pages load this file and 274 also load FirebaseAuth.js, so simply OPENING a lab
               page minted a Firebase Auth account AND a users/{uid} profile — no click, no
               sign-in, no consent. Measured against production: 6306 of 6603 accounts (95.5%)
               are anonymous, 99.5% of them never active beyond 24h, and the real identified
               population is 297. It is still happening at roughly 45/day.

               Nothing on the load path needs a uid: the only Firestore call in init() is
               _verifyFirestore, which pings a nonexistent doc and treats permission-denied as
               SUCCESS (see its comment) because it is testing the network, not the session.
               The flows that genuinely need auth already sign in for themselves —
               CoOpSync.js:103 does exactly this, VS sits behind _launchVsMode(), and HatRating
               is guarded by FirebaseAuth.isSignedIn().

               An EXISTING session is unaffected: the SDK restores it via onAuthStateChanged
               regardless of this call, which only ever fired when there was no session at all.

               Proven before shipping, not argued:
                 _tools/hexos/anon-load-signin.test.js           274/277 -> 0/277 accounts at load
                 _tools/hexos/anon-load-signin-emulator.test.js  0/277 pages denied without it
                 _tools/hexos/anon-lazy-auth-clickthrough.test.js co-op + VS still create rooms,
                                                                  existing session survives reload */
            _lazyAuth = function () {
                return _ensureSignedIn(_auth, signInAnonymously, onAuthStateChanged);
            };

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
    // onAuthStateChanged is PASSED IN, like signInAnonymouslyFn beside it. It used to be
    // referenced as a free variable here while being destructured from window.firebaseAuth
    // inside init() -- a different function -- so this threw
    // "ReferenceError: onAuthStateChanged is not defined" every time the standalone path ran.
    // The error was visible in the console on pages that otherwise worked, because callers
    // catch init failures, which is exactly what made it survive: it looked cosmetic.
    async function _ensureSignedIn(authInstance, signInAnonymouslyFn, onAuthStateChanged) {
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
     * Verify Firestore is REACHABLE. This is a network check, not an auth check.
     *
     * It pings `_arena_probe_/ping`, a path that deliberately does not exist, and treats BOTH
     * "not found" and "permission-denied" as success — either answer proves the round trip
     * completed. It therefore needs no session, which is why removing the load-time sign-in
     * (step 4 in init()) does not affect it.
     *
     * CORRECTED 2026-09-09: this comment previously claimed the probe read the `leaderboards`
     * collection and needed authenticated reads. Neither was true of the code below, and
     * `leaderboards` is auth-gated (firestore.rules:401-402) — so the stale text implied a
     * dependency on the session that does not exist. During task 372 it sent a reviewer to audit
     * the wrong rule, which is precisely the cost of a comment that outlives its code.
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
        init,

        /**
         * Acquire a session on demand (task 372).
         *
         * init() no longer signs anyone in — opening a page must not create an account. Any
         * caller that genuinely needs a uid asks for one here. Safe to call repeatedly:
         * _ensureSignedIn defers to an existing FirebaseAuth session and only signs in
         * anonymously when there is none.
         *
         * Resolves harmlessly if init() has not run yet, so a caller never has to guard.
         *
         * @returns {Promise<void>}
         */
        /* NO CALLER TODAY, AND THAT IS A TRAP WORTH NAMING (Nancy, 2026-09-09 review).
           274 of the 276 pages that load this file also load FirebaseAuth.js and get their
           session from the flow that needs it — CoOpSync.js:90-108 signs in for Co-Op and VS
           alike. The exceptions are `catalog.html` and `arena/index.html`, which load this file
           WITHOUT FirebaseAuth.js. Those two now run with no session at all, not even an
           anonymous one. That is correct today: catalog reads `hubRegistry`, whose rule
           (firestore.rules:1453) is `isAdmin() || resource.data.status == 'published'` and never
           checks request.auth; arena/index.html touches neither .auth nor .db.
           If you add ANY auth-gated Firestore call to either page, await ensureAuth() first.
           Skip it and you get a silent permission-denied with nothing at build time to warn you.

           WAITS FOR init() FIRST, and that is load-bearing (Mallory, 2026-09-09 review).
           `_lazyAuth` is armed deep inside init(), after three awaited dynamic import()s. The
           first version of this function read `_lazyAuth ? _lazyAuth() : Promise.resolve()`
           directly, so a caller who did not already await isReady() got Promise.resolve(undefined)
           — no sign-in, no error, no signal. `await ensureAuth()` would have LOOKED like "I now
           have a uid" and handed back nothing. Reproduced as control flow, unreachable today only
           because the function has no callers yet. Awaiting isReady() here means the very first
           caller cannot fall into it. */
        ensureAuth: async function () {
            await isReady();
            if (!_lazyAuth) {
                // init() ran and failed (SDK load or app init threw). Say so rather than
                // resolving quietly — a caller asking for auth must not read silence as success.
                throw new Error('[ArenaFirebase] ensureAuth: initialization did not complete; no session available');
            }
            return _lazyAuth();
        }
    };
})();

// Auto-initialize when DOM is ready.
// On box pages this fires after FirebaseAuth.js has already loaded
// (it is listed first in every box index.html), so the Firebase app
// instance will already exist and _ensureApp()/_ensureAuth() are no-ops.
document.addEventListener('DOMContentLoaded', function() {
    ArenaFirebase.init();
});
