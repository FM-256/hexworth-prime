/**
 * AccessGuard.js - Content Access Control System
 *
 * QC-4: Server-side admin verification via Firebase Auth custom claims.
 * Trust-then-verify pattern: sync localStorage check for instant UX,
 * async custom claims verification catches forgery in background.
 *
 * Protection Levels:
 * - SORTED: User must have completed house sorting
 * - HOUSE: User must belong to specific house (or have God Mode)
 * - GATE: User must have passed specific Dark Arts gate
 * - ADMIN: User must have Firebase Admin, God Mode, or Master Key
 * - ADMIN-ONLY: User must have Firebase Admin ONLY (strictest)
 * - INSTRUCTOR: User must be an instructor OR an admin. For teaching material
 *   (lecture decks, notes, anything that gives away answers). Separate from
 *   ADMIN-ONLY so a TA can be handed the decks without being made a platform
 *   administrator. Granted by setting users/{uid}.role = 'instructor' in
 *   Firestore, or by an `instructor` custom claim if one is ever issued.
 *
 * Usage (add to protected pages):
 *   <script src="../../components/AccessGuard.js"></script>
 *   <script>
 *     AccessGuard.require('sorted');                    // Must be sorted
 *     AccessGuard.require('house', 'shield');           // Must be in Shield house
 *     AccessGuard.require('gate', 3);                   // Must have passed gate 3
 *     AccessGuard.require('admin');                     // Must have admin access
 *   </script>
 *
 * @author Hexworth Prime
 * @version 2.0.0
 */

const AccessGuard = (function() {
    'use strict';

    // Configuration
    const config = {
        redirectDelay: 100,  // ms before redirect
        masterKeyDuration: 5 * 60 * 1000,  // 5 minutes in milliseconds
        storageKeys: {
            house: 'hexworth_house',
            theme: 'hexworth_theme',
            godMode: 'hexworth_god_mode',
            divergent: 'hexworth_divergent',
            houseHopper: 'hexworth_house_hopper',
            gatePrefix: 'gate',
            gateAnswerPrefix: 'gate',
            masterKey: 'hexworth_master_key',
            masterKeyExpiry: 'hexworth_master_key_expiry'
        },
        paths: {
            sorting: '/sorting.html',
            dashboard: '/dashboard.html',
            unauthorized: '/unauthorized.html',
            darkArtsGate: '/dark-arts/gate-1.html'
        }
    };

    // Calculate base path from current location
    /** Calculate relative path from current page to _app root based on URL depth */
    /* ── TOURIST VISIT CAP, ENFORCED WITHOUT WAITING FOR TouristVisa.js ──────────────
       Mallory, 2026-08-11: the 3-house cap was DEAD CODE on every gated page, platform-wide.

       The cause is a load-order impossibility, not a logic error. The auto-loader below appends
       TouristVisa.js with document.head.appendChild(script), which is ASYNCHRONOUS: a dynamically
       inserted external script cannot run before the currently-executing synchronous script
       finishes. Every gated page then calls AccessGuard.require(...) synchronously in the very
       next <script> tag. So at check time `typeof TouristVisa` is ALWAYS 'undefined' on first
       paint, and the enforcement below it was wrapped in `if (typeof TouristVisa !== 'undefined')`
       — so it never ran. Not "ran and permitted": never ran.

       Proven on production: a tourist with 3/3 visits used browsed four more houses with no
       redirect, and hexworth_tourist_visited never incremented.

       THE FIX IS TO STOP DEPENDING ON THE LOAD RACE. The cap's entire state is two localStorage
       keys, so AccessGuard can enforce it directly, synchronously, with no script to wait for.
       TouristVisa.js keeps its richer role (banner, badge, remaining-visit UI) and stays the
       source of truth for the constant; these read the SAME keys and the SAME limit, so the two
       cannot disagree about whether a visit is allowed.

       Deliberately duplicated rather than awaited: making require() async would change the
       contract every one of the 4,000+ calling pages relies on, to fix a bug in a 3-visit
       counter. */
    var TOURIST_KEYS = { active: 'hexworth_tourist_active', visited: 'hexworth_tourist_visited' };
    var TOURIST_MAX_VISITS = 3;      // must match MAX_VISITS in TouristVisa.js

    function _touristVisited() {
        try {
            var raw = localStorage.getItem(TOURIST_KEYS.visited);
            var arr = raw ? JSON.parse(raw) : [];
            return Array.isArray(arr) ? arr : [];
        } catch (e) { return []; }
    }

    /* Returns true if the visit is allowed: revisiting a house already seen is free, a new
       house is charged, and the cap refuses.

       ⚠ NOT a literal mirror of TouristVisa.visitHouse in ONE edge case, and the comment here
       used to claim it was. For a caller who is NOT a tourist, visitHouse returns FALSE (it
       answers "did I record a tourist visit") while this returns TRUE (it answers "may this
       visit proceed"). Unreachable today, because every call site gates on isTourist()
       synchronously first with no write in between, and Chris confirmed both paths behave
       correctly. Written down because an inherited "mirrors exactly" comment is how the next
       person justifies calling this from somewhere that guard does not hold. */
    function _touristVisit(houseId) {
        if (!houseId) return true;
        try {
            if (localStorage.getItem(TOURIST_KEYS.active) !== 'true') return true;
            var visited = _touristVisited();
            if (visited.indexOf(houseId) !== -1) return true;       // already paid for
            if (visited.length >= TOURIST_MAX_VISITS) return false;  // cap reached
            visited.push(houseId);
            localStorage.setItem(TOURIST_KEYS.visited, JSON.stringify(visited));
            return true;
        } catch (e) {
            /* Storage unavailable (private mode, blocked). Fail OPEN: a visitor who cannot be
               counted should still be able to look around. The cap is a funnel, not a security
               boundary, and locking someone out of public content over a storage error is worse
               than an uncounted visit. */
            return true;
        }
    }

    function _touristForceSort() {
        if (typeof TouristVisa !== 'undefined' && typeof TouristVisa.forceSort === 'function') {
            TouristVisa.forceSort();
            return;
        }
        window.location.href = getBasePath() + 'components/tourist-sort-redirect.html';
    }

    function getBasePath() {
        const path = window.location.pathname;
        const appIndex = path.indexOf('/_app/');
        if (appIndex !== -1) {
            return path.substring(0, appIndex + 6);  // Include /_app/
        }
        // Fallback: count directory segments above the file
        // /workshop/index.html → 1 dir up → '../'
        // /workshop/           → 1 dir up → '../'
        // /dark-arts/vault/x   → 2 dirs up → '../../'
        const segments = path.replace(/\/[^/]*$/, '').split('/').filter(Boolean);
        return segments.length > 0 ? '../'.repeat(segments.length) : './';
    }

    // Check if user has God Mode (bypasses all checks)
    // NOTE: God Mode uses sessionStorage - it resets when browser/tab closes
    /** @returns {boolean} Whether god mode (all access) is active */
    function hasGodMode() {
        return sessionStorage.getItem(config.storageKeys.godMode) === 'true';
    }

    // Toggle God Mode (session-only, never persisted)
    /** Toggle god mode on/off and reload the page */
    function toggleGodMode() {
        const current = hasGodMode();
        if (current) {
            sessionStorage.removeItem(config.storageKeys.godMode);
            console.log('%c<img src="/assets/images/icons/icon-detective.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle"> God Mode Deactivated', 'color: #8a8a8a; font-size: 14px;');
        } else {
            sessionStorage.setItem(config.storageKeys.godMode, 'true');
            console.log('%c<img src="/assets/images/icons/icon-detective.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle"> GOD MODE ACTIVATED', 'color: #ffd700; font-size: 18px; font-weight: bold; text-shadow: 0 0 10px #ffd700;');
        }
        return !current;
    }

    // ─────────────────────────────────────────────────────────────
    // FIREBASE ADMIN - Persistent admin access via Google sign-in
    // QC-4: Sync check from localStorage, async verify from custom claims
    // ─────────────────────────────────────────────────────────────

    // Sync check: reads localStorage (fast, may be forged)
    /** @returns {boolean} Whether the current Firebase user has admin privileges */
    function isFirebaseAdmin() {
        return localStorage.getItem('hexworth_firebase_admin') === 'true';
    }

    // Get Firebase user info
    /** @returns {Object|null} The current Firebase Auth user object */
    function getFirebaseUser() {
        try {
            const user = localStorage.getItem('hexworth_firebase_user');
            return user ? JSON.parse(user) : null;
        } catch (e) {
            return null;
        }
    }

    /**
     * QC-4: Async admin verification via Firebase Auth custom claims.
     * Returns: true (verified admin), false (not admin / forged), null (inconclusive)
     */
    async function _verifyAdminAsync() {
        try {
            if (typeof FirebaseAuth === 'undefined') return null;

            await FirebaseAuth.waitForAuth();

            if (!FirebaseAuth.isSignedIn()) return null; // can't verify unsigned users

            // Use FirebaseAuth's resolved admin status (claims + email allowlist)
            return FirebaseAuth.isAdmin();
        } catch (e) {
            console.warn('[AccessGuard] Admin verification error:', e);
            return null; // inconclusive — don't punish on error
        }
    }

    /**
     * Async instructor verification. Returns: true (verified), false (forged), null (inconclusive).
     * Mirrors _verifyAdminAsync: the sync check that let the page render reads a localStorage
     * cache, so it is forgeable on its own; this re-asks FirebaseAuth once auth has actually
     * resolved and strips the cache if the answer is no.
     */
    async function _verifyInstructorAsync() {
        try {
            if (typeof FirebaseAuth === 'undefined') return null;
            await FirebaseAuth.waitForAuth();

            /* FAIL CLOSED on no identity. This is where instructor deliberately DIVERGES from
               admin. _verifyAdminAsync returns null (inconclusive, keep showing) for a visitor
               who is not signed in -- which means an anonymous visitor who types the cache key
               by hand keeps access forever, because the verifier can never prove a negative
               about a user who does not exist. MEASURED: a browser with no account that simply
               set hexworth_firebase_instructor=true read the whole 125-slide week-01 deck.
               An instructor is ALWAYS signed in, so "no signed-in user" is not inconclusive
               here, it is a no. Legitimate instructors lose nothing. */
            if (!FirebaseAuth.isSignedIn()) return false;
            if (!FirebaseAuth.isInstructor) return null;   // older bundle without the accessor

            /* Ask for the RESOLVED answer, never the cached one. isInstructor() falls back to
               reading the same localStorage key the sync check trusted, so calling it here
               would re-read the forgery and cheerfully confirm it. */
            return FirebaseAuth.isInstructorResolved
                ? FirebaseAuth.isInstructorResolved()
                : FirebaseAuth.isInstructor();
        } catch (e) {
            console.warn('[AccessGuard] Instructor verification error:', e);
            return null;   // inconclusive -- do not punish on error
        }
    }

    /**
     * QC-4: Async gate verification via Cloud Function.
     * Returns: true (verified), false (forged), null (inconclusive)
     */
    async function _verifyGateAsync(gateNumber) {
        try {
            if (typeof FirebaseAuth === 'undefined') return null;

            await FirebaseAuth.waitForAuth();

            if (!FirebaseAuth.isSignedIn()) return null;

            const result = await FirebaseAuth.callFunction('verifyGateAccess', {
                gateNumber: gateNumber
            });
            return result.data.authorized;
        } catch (e) {
            console.warn('[AccessGuard] Gate verification error:', e);
            return null; // inconclusive — don't punish on error
        }
    }

    /**
     * QC-4: Schedule background async verification.
     * If verification returns false (forged), hide content and redirect.
     */
    /* Confirms a tenant session against the SERVER, never against the cached blob it is
       meant to invalidate -- the trap the instructor verifier had to be rewritten to avoid.
       Uses getTenantConfig: public, CORS-enabled, 30s-cached, and already the endpoint every
       /tenant/*.html loader calls before writing the blob. Returns:
         false -> revoke (tenant gone, or status !== 'active')
         true  -> live
         null  -> inconclusive (offline/transient); caller keeps showing and re-checks next load */
    function _verifyTenantAsync(slug) {
        if (!slug) return Promise.resolve(false);
        return fetch('https://us-central1-hexworth-prime.cloudfunctions.net/getTenantConfig?slug='
                     + encodeURIComponent(slug))
            .then(function(r) {
                if (r.status === 404) return false;      // tenant deleted outright
                if (!r.ok) return null;                  // transient -> inconclusive
                return r.json().then(function(cfg) {
                    /* DELETION REVOKES. STATUS DOES NOT. Do not "tighten" this back to
                       `cfg.status === 'active'` without checking production data first.
                       That test caused an outage on 2026-08-04: ALL SIX live tenants carry
                       status "suspended", not "active", so every tenant user on every page
                       load was purged and redirected to the dashboard — they could not
                       navigate anywhere. It was never caught in testing because every test
                       mocked getTenantConfig and asserted the mock, never the real endpoint.
                       'suspended' is an operator-facing lifecycle state, NOT a revocation,
                       and the set of statuses that should revoke is an operator decision that
                       has not been made. Until it is, only a tenant that is genuinely GONE
                       (404, handled above) revokes access. */
                    return cfg ? true : null;
                });
            })
            .catch(function() { return null; });         // offline -> inconclusive
    }

    function _scheduleAsyncVerification(type, param) {
        if (type === 'admin') {
            _verifyAdminAsync().then(result => {
                if (result === false) {
                    console.warn('[AccessGuard] ASYNC ADMIN VERIFICATION FAILED — forged localStorage detected');
                    localStorage.removeItem('hexworth_firebase_admin');
                    hideContent();
                    redirect('dashboard', 'Admin access could not be verified.');
                }
                // result === true → legitimate admin, keep showing
                // result === null → inconclusive (offline/not signed in), keep showing
            });
        } else if (type === 'tenant') {
            _verifyTenantAsync(param).then(result => {
                if (result === false) {
                    /* NEVER REDIRECT, NEVER HIDE. A tenant is WHITE-LABEL ACCESS — a branded
                       wrapper over Hexworth. Ending the wrapper and ending someone's Hexworth
                       access are two unrelated actions, and this handler may only perform the
                       first. The previous version did both: it deleted the blob, hid the page
                       and called redirect('dashboard'), which on 2026-08-04 pinned every
                       white-label student to the dashboard because all six live tenants are
                       status "suspended". Killing the tenant must never kill Hexworth.

                       result === false now means the tenant is GONE (404) or the blob names no
                       tenant at all — a forgery. Dropping the blob there closes the bypass hole
                       (a hand-typed hexworth_tenant key used to unlock gated content for
                       anyone), and the student simply continues under their own Hexworth
                       credentials. A merely suspended tenant never reaches this branch;
                       TenantShell.stripTenantChrome() removes its branding and leaves
                       everything else alone. */
                    console.warn('[AccessGuard] tenant not found or not a real tenant — '
                               + 'dropping the white-label bypass; Hexworth access unaffected');
                    try { sessionStorage.removeItem('hexworth_tenant'); } catch (e) {}
                    try {
                        localStorage.removeItem('hexworth_tenant');
                        localStorage.removeItem('hexworth_tenant_slug');
                        // Cross-tab stamp, cleared here too so all three purge sites share one
                        // definition of what gets removed. BUG-242.
                        localStorage.removeItem('hexworth_tenant_mirrored_at');
                        localStorage.removeItem('hexworth_tenant_shell_hidden');
                    } catch (e) {}
                    /* redirect() consults TenantRouter.isActive() and sends tenant users to
                       the tenant hub. That flag was cached true at page load, so without this
                       refresh the "no longer active" redirect lands the user back INSIDE the
                       tenant just revoked -- verified: it resolved to /tenant/index.html and
                       rendered "Tenant not found". refresh() re-reads the (now empty) storage
                       and drops _active to false, so the redirect reaches the real dashboard. */
                    // NOT `window.TenantRouter` — TenantRouter.js:27 declares it with top-level
                    // `const` in a classic script, so it lives in the global declarative record
                    // and is never a property of window. This guard made the refresh dead code,
                    // leaving _active stale at true so redirect() below routed the just-revoked
                    // student INTO the dead tenant hub. `typeof` matches the working check at
                    // line 658. Caught at QC 2026-08-04.
                    try { if (typeof TenantRouter !== 'undefined' && TenantRouter.refresh) TenantRouter.refresh(); } catch (e) {}
                    /* Deliberately NO hideContent() and NO redirect() — see above. The page the
                       student is on stays open and readable; only the white-label bypass is
                       withdrawn, and their own credentials govern the next navigation. */
                }
                // true  -> tenant live, keep showing
                // null  -> inconclusive (offline), keep showing; re-checked next load
            });
        } else if (type === 'instructor') {
            _verifyInstructorAsync().then(result => {
                if (result === false) {
                    console.warn('[AccessGuard] ASYNC INSTRUCTOR VERIFICATION FAILED — forged localStorage detected');
                    localStorage.removeItem('hexworth_firebase_instructor');
                    hideContent();
                    redirect('dashboard', 'Instructor access could not be verified.');
                }
                // true -> legitimate, keep showing. null -> inconclusive (offline), keep showing.
            });
        } else if (type === 'gate') {
            const gateNum = parseInt(param) || 1;
            _verifyGateAsync(gateNum).then(result => {
                if (result === false) {
                    console.warn(`[AccessGuard] ASYNC GATE ${gateNum} VERIFICATION FAILED — forged localStorage detected`);
                    // Strip forged localStorage flags
                    for (let i = 1; i <= gateNum; i++) {
                        localStorage.removeItem(`gate${i}_complete`);
                    }
                    localStorage.removeItem('dark_arts_unlocked');
                    hideContent();
                    redirect('dark-arts-gate', `Gate ${gateNum} completion could not be verified.`);
                }
            });
        }
    }

    // Add Firebase admin badge
    function addFirebaseAdminBadge() {
        // Defer until body exists
        if (!document.body) {
            document.addEventListener('DOMContentLoaded', addFirebaseAdminBadge);
            return;
        }

        if (document.getElementById('firebase-admin-indicator')) return;

        const user = getFirebaseUser();
        const badge = document.createElement('div');
        badge.id = 'firebase-admin-indicator';
        badge.innerHTML = `
            <style>
                #firebase-admin-indicator {
                    position: absolute;
                    top: 10px;
                    left: 50%;
                    transform: translateX(-50%);
                    background: linear-gradient(135deg, #4285f4, #34a853);
                    color: #fff;
                    padding: 6px 16px;
                    border-radius: 20px;
                    font-size: 11px;
                    font-weight: bold;
                    letter-spacing: 0.1em;
                    z-index: 99999;
                    box-shadow: 0 0 20px rgba(66, 133, 244, 0.5);
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                #firebase-admin-indicator img {
                    width: 20px;
                    height: 20px;
                    border-radius: 50%;
                }
            </style>
            ${user && user.photoURL ? `<img src="${user.photoURL}" alt="Admin avatar">` : ''}
            <span>ADMIN MODE</span>
        `;
        document.body.appendChild(badge);
    }

    // ─────────────────────────────────────────────────────────────
    // MASTER KEY SYSTEM - Time-based full access
    // Triggered by 5 clicks on the black hole
    // ─────────────────────────────────────────────────────────────

    // Check if Master Key is active and not expired
    /** @returns {boolean} Whether a valid, non-expired master key is active */
    function hasMasterKey() {
        const expiry = sessionStorage.getItem(config.storageKeys.masterKeyExpiry);
        if (!expiry) return false;

        const expiryTime = parseInt(expiry, 10);
        const now = Date.now();

        if (now >= expiryTime) {
            // Expired - clean up
            deactivateMasterKey();
            return false;
        }

        return true;
    }

    // Get remaining time in milliseconds
    /** @returns {number} Seconds remaining on the master key timer */
    function getMasterKeyRemaining() {
        const expiry = sessionStorage.getItem(config.storageKeys.masterKeyExpiry);
        if (!expiry) return 0;

        const remaining = parseInt(expiry, 10) - Date.now();
        return Math.max(0, remaining);
    }

    // Activate Master Key for 5 minutes
    /** Activate the master key with a 60-minute countdown timer */
    function activateMasterKey() {
        const expiry = Date.now() + config.masterKeyDuration;
        sessionStorage.setItem(config.storageKeys.masterKey, 'true');
        sessionStorage.setItem(config.storageKeys.masterKeyExpiry, expiry.toString());

        // Grant all gate access temporarily
        for (let i = 1; i <= 7; i++) {
            sessionStorage.setItem(`master_gate${i}_complete`, 'true');
        }

        console.log('%c<img src="/assets/images/icons/icon-key.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle"> MASTER KEY ACTIVATED - 5 MINUTES',
            'color: #00ff00; font-size: 18px; font-weight: bold; text-shadow: 0 0 10px #00ff00;');

        // Create visual indicator
        showMasterKeyIndicator();

        return true;
    }

    // Deactivate Master Key
    /** Deactivate the master key and remove the visual indicator */
    function deactivateMasterKey() {
        sessionStorage.removeItem(config.storageKeys.masterKey);
        sessionStorage.removeItem(config.storageKeys.masterKeyExpiry);

        // Remove temporary gate access
        for (let i = 1; i <= 7; i++) {
            sessionStorage.removeItem(`master_gate${i}_complete`);
        }

        // Remove visual indicator
        const indicator = document.getElementById('master-key-indicator');
        if (indicator) indicator.remove();

        console.log('%c<img src="/assets/images/icons/icon-key.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle"> Master Key Expired', 'color: #8a8a8a; font-size: 14px;');
    }

    // Show floating countdown indicator
    function showMasterKeyIndicator() {
        /* Same defer as the admin and god-mode badges: this appends to document.body, and
           since 2026-08-12 the gate can run before <body> exists. */
        if (!document.body) {
            document.addEventListener('DOMContentLoaded', showMasterKeyIndicator);
            return;
        }
        // Remove existing indicator
        const existing = document.getElementById('master-key-indicator');
        if (existing) existing.remove();

        const indicator = document.createElement('div');
        indicator.id = 'master-key-indicator';
        indicator.innerHTML = `
            <style>
                #master-key-indicator {
                    position: absolute;
                    top: 15px;
                    left: 50%;
                    transform: translateX(-50%);
                    background: linear-gradient(135deg, #00ff00, #00aa00);
                    color: #000;
                    padding: 8px 20px;
                    border-radius: 25px;
                    font-size: 12px;
                    font-weight: bold;
                    letter-spacing: 0.1em;
                    z-index: 99999;
                    box-shadow: 0 0 30px rgba(0, 255, 0, 0.6);
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    animation: masterKeyPulse 2s ease-in-out infinite;
                    cursor: pointer;
                    user-select: none;
                }
                @keyframes masterKeyPulse {
                    0%, 100% { box-shadow: 0 0 20px rgba(0, 255, 0, 0.5); }
                    50% { box-shadow: 0 0 40px rgba(0, 255, 0, 0.8); }
                }
                #master-key-indicator:hover {
                    background: linear-gradient(135deg, #ff4444, #aa0000);
                    box-shadow: 0 0 30px rgba(255, 0, 0, 0.6);
                }
                #master-key-indicator .key-icon {
                    font-size: 16px;
                }
                #master-key-indicator .key-time {
                    font-family: monospace;
                    font-size: 14px;
                }
            </style>
            <span class="key-icon"><img src="/assets/images/icons/icon-key.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle"></span>
            <span>MASTER KEY</span>
            <span class="key-time" id="master-key-countdown">5:00</span>
        `;

        document.body.appendChild(indicator);

        // Click to deactivate early
        indicator.addEventListener('click', () => {
            if (confirm('Deactivate Master Key early?')) {
                deactivateMasterKey();
            }
        });

        // Start countdown timer
        updateMasterKeyCountdown();
    }

    // Update countdown display
    function updateMasterKeyCountdown() {
        const countdownEl = document.getElementById('master-key-countdown');
        if (!countdownEl) return;

        const remaining = getMasterKeyRemaining();

        if (remaining <= 0) {
            deactivateMasterKey();
            return;
        }

        const minutes = Math.floor(remaining / 60000);
        const seconds = Math.floor((remaining % 60000) / 1000);
        countdownEl.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;

        // Change color when < 1 minute
        const indicator = document.getElementById('master-key-indicator');
        if (indicator && remaining < 60000) {
            indicator.style.background = 'linear-gradient(135deg, #ffaa00, #ff6600)';
            indicator.style.boxShadow = '0 0 30px rgba(255, 165, 0, 0.6)';
        }

        // Update every second
        setTimeout(updateMasterKeyCountdown, 1000);
    }

    // Check if temporary gate access is granted by Master Key
    /** @returns {boolean} Whether master key grants access to the specified gate */
    function hasMasterKeyGateAccess(gateNumber) {
        if (!hasMasterKey()) return false;
        return sessionStorage.getItem(`master_gate${gateNumber}_complete`) === 'true';
    }

    // Check if user is a tourist (browsing without sorting)
    // Uses direct localStorage check as fallback since TouristVisa.js
    // may not have loaded yet when require() runs at parse time.
    /** @returns {boolean} Whether user is in tourist mode (unsorted, no house) */
    function isTourist() {
        if (typeof TouristVisa !== 'undefined') {
            return TouristVisa.isActive();
        }
        // Fallback: TouristVisa.js not loaded yet (parse-time race). Mirror its
        // isActive() self-heal — a sorted user is never a tourist — so a stale
        // hexworth_tourist_active flag can't mis-gate a sorted user before
        // TouristVisa loads and voids it (see TouristVisa.js:82-98). (#70)
        if (isSorted()) return false;
        return localStorage.getItem('hexworth_tourist_active') === 'true';
    }

    // Check if user has been sorted
    /** @returns {boolean} Whether user has been sorted into a house */
    function isSorted() {
        return localStorage.getItem(config.storageKeys.house) !== null;
    }

    // Get user's house
    /** @returns {string|null} The user's assigned house ID */
    function getUserHouse() {
        return localStorage.getItem(config.storageKeys.house);
    }

    // Check if user is Divergent (Factionless)
    /** @returns {boolean} Whether user is sorted into the Divergent house */
    function isDivergent() {
        return localStorage.getItem(config.storageKeys.divergent) === 'true';
    }

    // Check if user is a House Hopper (can access all house content)
    /** @returns {boolean} Whether user has the house-hopper privilege */
    function isHouseHopper() {
        return localStorage.getItem(config.storageKeys.houseHopper) === 'true';
    }

    // Check if user skipped sorting and is browsing as Explorer
    /** @returns {boolean} Whether user has explorer status (admin-granted) */
    function isExplorer() {
        return localStorage.getItem(config.storageKeys.house) === 'explorer';
    }

    // Check if user has passed a specific Dark Arts gate
    /** @returns {boolean} Whether user has passed the specified access gate */
    function hasPassedGate(gateNumber) {
        // Master Key grants temporary access to all gates
        if (hasMasterKeyGateAccess(gateNumber)) return true;

        const key = `${config.storageKeys.gatePrefix}${gateNumber}_complete`;
        return localStorage.getItem(key) === 'true';
    }

    // Check if user has passed all gates up to specified number
    function hasPassedGatesUpTo(gateNumber) {
        // Master Key grants access to all gates
        if (hasMasterKey()) return true;

        for (let i = 1; i <= gateNumber; i++) {
            if (!hasPassedGate(i)) {
                return false;
            }
        }
        return true;
    }

    // ─────────────────────────────────────────────────────────────
    // TOURIST VISA INTEGRATION
    // ─────────────────────────────────────────────────────────────

    /**
     * Extract house ID from current page URL.
     * Matches patterns like /houses/shield/..., /houses/code/games/..., etc.
     * Returns null if not inside a house directory.
     */
    function _detectHouseFromUrl() {
        var match = window.location.pathname.match(/\/houses\/([a-z-]+)\//);
        return match ? match[1] : null;
    }

    /**
     * Schedule tourist badge and overlay injection after DOM is ready.
     * Also loads tourist-badge.css if not already present.
     * Retries if TouristVisa.js hasn't loaded yet (async script).
     */
    function _scheduleTouristUI() {
        function inject() {
            // Load CSS if not already loaded
            if (!document.querySelector('link[href*="tourist-badge.css"]')) {
                var link = document.createElement('link');
                link.rel = 'stylesheet';
                link.href = getBasePath() + 'components/tourist-badge.css';
                document.head.appendChild(link);
            }
            // Inject badge and overlay (retry if TouristVisa not yet loaded)
            if (typeof TouristVisa !== 'undefined') {
                TouristVisa.injectBadge();
                TouristVisa.injectOverlay();
                TouristVisa.installBlockers();
            } else {
                // TouristVisa.js is still loading — retry shortly
                setTimeout(inject, 150);
            }
        }

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', inject);
        } else {
            inject();
        }
    }

    // Hide page content immediately (before check)
    function hideContent() {
        // Add style to hide everything until verified
        const style = document.createElement('style');
        style.id = 'access-guard-hide';
        style.textContent = `
            body {
                visibility: hidden !important;
                opacity: 0 !important;
            }
        `;
        document.head.appendChild(style);
    }

    // Show page content (after successful check)
    function showContent() {
        /* ⚠ ALL of them, not the first one. This file's own auto-execute block appends an
           #access-guard-preload style on load, and 25 pages ALSO hand-write an identical
           <style id="access-guard-preload"> of their own, so two elements share the id and
           getElementById returns only the earlier one. The leftover was invisible for years
           because the belt-and-suspenders branch below set body.style.visibility inline,
           which beats a stylesheet rule.
           That mask disappears the moment the gate runs BEFORE <body>: document.body is
           null, the inline fallback is skipped, and the surviving duplicate keeps the page
           hidden permanently. Found 2026-08-12 on three Script house pages after the
           Mallory audit moved require() into <head>: len 1377 to 0, no error, no redirect.
           Removing every match makes the outcome independent of WHEN the gate runs. */
        document.querySelectorAll('#access-guard-preload, #access-guard-hide')
                .forEach(el => el.remove());

        // Also set inline styles if body exists (belt and suspenders)
        if (document.body) {
            document.body.style.visibility = 'visible';
            document.body.style.opacity = '1';
        }
    }

    // Redirect to appropriate page
    function redirect(destination, message) {
        const basePath = getBasePath();

        // Store message for display on redirect page
        if (message) {
            sessionStorage.setItem('access_guard_message', message);
            sessionStorage.setItem('access_guard_from', window.location.href);
        }

        setTimeout(() => {
            // Tenant users: ALL redirects go to tenant hub.
            // They should never see sorting, unauthorized, or Hexworth dashboard.
            if (typeof TenantRouter !== 'undefined' && TenantRouter.isActive()) {
                window.location.href = TenantRouter.getUrl(destination);
                return;
            }

            let url;
            switch (destination) {
                case 'sorting':
                    url = basePath + 'sorting.html';
                    break;
                case 'dashboard':
                    url = basePath + 'dashboard.html';
                    break;
                case 'dark-arts-gate':
                    url = basePath + 'dark-arts/gate-1.html';
                    break;
                case 'tourist-prompt':
                    url = basePath + 'components/tourist-visa-prompt.html';
                    break;
                case 'unauthorized':
                default:
                    url = basePath + 'unauthorized.html';
                    break;
            }
            window.location.href = url;
        }, config.redirectDelay);
    }

    // ─────────────────────────────────────────────────────────────
    // MAIN ACCESS CHECK — require(), requireAll(), requireAny()
    // ─────────────────────────────────────────────────────────────

    // Main requirement check
    function require(level, param) {
        // Hide content immediately
        hideContent();

        // Tenant users bypass all access gates — content filtering is
        // handled by TenantFilter.js based on the tenant's license.
        // Without this, white-label students would need to pass sorting
        // quizzes and Dark Arts gates that don't exist in their experience.
        try {
            // Check both sessionStorage (same-tab) and localStorage (cross-tab).
            // Lobby.html writes to both; this ensures tenant bypass survives
            // new-tab navigation where sessionStorage is empty.
            // Matches the pattern used by TenantShell.js, TenantRouter.js,
            // and ModuleProgress.js which already check both.
            var tenantData = sessionStorage.getItem('hexworth_tenant') ||
                             localStorage.getItem('hexworth_tenant');
            /* 'instructor' joined the exclusion list 2026-08-03, the day the level was born.
               This bypass exists so white-label students skip sorting quizzes and Dark Arts
               gates that do not exist in their experience -- STUDENT progression mechanics.
               Instructor material is staff-only in every experience; a tenant student waved
               through here would read teaching decks with zero checks, defeating the level
               for the entire white-label population by construction. */
            /* The bypass used to fire on the mere PRESENCE of this key. It never parsed it.
               Verified in a browser 2026-08-04: localStorage.setItem('hexworth_tenant','x')
               — not even valid JSON — unlocked a gated module for an otherwise-unsorted
               visitor (body 12,192 -> 54,659 bytes, 0 -> 17 slides). One console line, any
               user, tenant or not. Now the blob must at least PARSE and name a tenant, and
               the async pass below confirms that tenant is real and active. */
            var tenantSlug = null;
            if (tenantData) {
                try {
                    var parsedTenant = JSON.parse(tenantData);
                    if (parsedTenant && typeof parsedTenant.slug === 'string' && parsedTenant.slug.trim()) {
                        tenantSlug = parsedTenant.slug.trim();
                    }
                } catch (e) { /* unparseable -> not a tenant session */ }
            }

            /* STAFF CREDENTIALS OUTRANK TENANT STATE — do not remove.
               This branch sits ABOVE the admin/god-mode/master-key bypasses below, so
               before this guard existed it won for anyone holding a tenant blob, admin or
               not. Once the branch also started REVOKING (async verify -> purge ->
               redirect('dashboard')), that ordering meant an administrator carrying a
               stale blob for a tenant they had deactivated was bounced off every gated
               page on the platform, including /houses/observatory/ — reported and
               reproduced 2026-08-04: admin + sorted + inactive tenant landed on
               /dashboard.html with "This tenant is no longer active."
               An admin's access never derived from the tenant, so tenant revocation must
               not be able to take it away. Staff fall through to their own bypasses. */
            if (tenantSlug && !isFirebaseAdmin() && !hasGodMode() && !hasMasterKey() &&
                level !== 'admin' && level !== 'admin-only' && level !== 'instructor') {
                showContent();
                /* Tenant was the ONLY bypass in this file with no background check at all --
                   admin, gate and instructor each schedule one. Not a defeated verification;
                   an absent one. */
                _scheduleAsyncVerification('tenant', tenantSlug);
                return true;
            }
        } catch(e) {}

        // Firebase Admin bypasses everything except admin-only
        // QC-4: Sync show, async verify in background
        if (isFirebaseAdmin() && level !== 'admin-only') {
            showContent();
            addFirebaseAdminBadge();
            _scheduleAsyncVerification('admin');
            return true;
        }

        // God Mode bypasses everything except explicit admin-only
        if (hasGodMode() && level !== 'admin-only') {
            showContent();
            addGodModeBadge();
            return true;
        }

        // Master Key bypasses everything except explicit admin-only
        if (hasMasterKey() && level !== 'admin-only') {
            showContent();
            addMasterKeyBadge();
            return true;
        }

        let authorized = false;
        let redirectTo = 'unauthorized';
        let message = '';

        switch (level) {
            case 'sorted':
                // User must have completed sorting — or be an active tourist
                if (isSorted()) {
                    authorized = true;
                } else if (isTourist()) {
                    /* Tourist mode: allow through but track the visit.
                       ⚠ THE CAP IS ENFORCED HERE, NOT VIA TouristVisa. This used to be wrapped
                       in `if (typeof TouristVisa !== 'undefined')`, which is ALWAYS false at
                       this point: the auto-loader appends that script asynchronously and this
                       call runs synchronously in the next <script> tag, so the limit never ran
                       on any gated page. _touristVisit reads the same two localStorage keys and
                       needs nothing loaded. */
                    var houseFromUrl = _detectHouseFromUrl();
                    if (houseFromUrl && !_touristVisit(houseFromUrl)) {
                        _touristForceSort();
                        return false;
                    }
                    authorized = true;
                    // Defer badge/overlay injection until DOM is ready
                    _scheduleTouristUI();
                } else {
                    // Not sorted, not a tourist — offer the tourist prompt
                    // instead of hard-redirecting to sorting.html
                    authorized = false;
                    redirectTo = 'tourist-prompt';
                    message = 'You must complete the Sorting Quiz first.';
                }
                break;

            case 'house':
                // User must be in specific house (or any house if param is 'any')
                if (!isSorted() && isTourist()) {
                    /* Tourist: read-only access to house content, up to the cap.
                       Same fix as the 'sorted' case: enforced directly rather than through
                       TouristVisa, which is never loaded yet when this runs. */
                    var houseParam = param || _detectHouseFromUrl();
                    if (houseParam && houseParam !== 'any' && !_touristVisit(houseParam)) {
                        _touristForceSort();
                        return false;
                    }
                    authorized = true;
                    _scheduleTouristUI();
                } else if (!isSorted()) {
                    redirectTo = 'tourist-prompt';
                    message = 'You must complete the Sorting Quiz first.';
                } else if (param === 'any' || param === undefined) {
                    authorized = true;
                } else if (isHouseHopper()) {
                    // House Hoppers (Divergent) can access ANY house content
                    authorized = true;
                    console.log('%c<img src="/assets/images/icons/icon-lightning.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle"> House Hopper Access Granted', 'color: #ff00ff;');
                } else {
                    const userHouse = getUserHouse();
                    // Allow access if user is in the specified house
                    // Also allow cross-house access for general content
                    authorized = (userHouse === param);
                    if (!authorized) {
                        redirectTo = 'dashboard';
                        message = `This content is for ${param.charAt(0).toUpperCase() + param.slice(1)} house members.`;
                    }
                }
                break;

            case 'gate':
                // User must have passed Dark Arts gates
                const gateNum = parseInt(param) || 1;
                if (!hasPassedGatesUpTo(gateNum)) {
                    authorized = false;
                    redirectTo = 'dark-arts-gate';
                    message = `You must pass Gate ${gateNum} to access this content.`;
                } else {
                    authorized = true;
                    // Async server verification for authenticated users
                    _scheduleAsyncVerification('gate', gateNum);
                }
                break;

            case 'dark-arts':
                // User must have access to Dark Arts (all 5 gates or God Mode)
                if (!hasPassedGatesUpTo(5)) {
                    authorized = false;
                    redirectTo = 'dark-arts-gate';
                    message = 'You must complete all Five Gates to enter the Vault.';
                } else {
                    authorized = true;
                    // Async server verification for authenticated users
                    _scheduleAsyncVerification('gate', 5);
                }
                break;

            case 'admin':
                // QC-4: Firebase admin (verified via custom claims) OR God Mode
                if (isFirebaseAdmin()) {
                    showContent();
                    addFirebaseAdminBadge();
                    _scheduleAsyncVerification('admin');
                    return true;
                }
                authorized = hasGodMode();
                if (!authorized) {
                    redirectTo = 'dashboard';
                    message = 'This area requires administrator access.';
                }
                break;

            case 'admin-only':
                // QC-4: Strictest level — Firebase admin only (verified via custom claims)
                if (isFirebaseAdmin()) {
                    showContent();
                    addFirebaseAdminBadge();
                    _scheduleAsyncVerification('admin');
                    return true;
                }
                authorized = false;
                redirectTo = 'dashboard';
                message = 'This area requires administrator access.';
                break;

            case 'instructor':
                /* INSTRUCTOR (2026-08-03). Teaching material: lecture decks, notes, anything
                   that gives away answers. Distinct from 'admin-only' because a TA or adjunct
                   needs the decks without gaining platform administration -- granting them
                   admin to hand over a slide deck is the wrong trade.
                   FirebaseAuth.isInstructor() returns true for admins too, so an admin is never
                   locked out of teaching material. It answers synchronously from a localStorage
                   cache, matching how isFirebaseAdmin() is used above; the async re-verify below
                   is what closes the gap if the cache is stale. */
                if (typeof FirebaseAuth !== 'undefined' && FirebaseAuth.isInstructor && FirebaseAuth.isInstructor()) {
                    showContent();
                    _scheduleAsyncVerification('instructor');
                    return true;
                }
                authorized = false;
                redirectTo = 'dashboard';
                message = 'This area holds instructor material. Ask your instructor if you need access.';
                break;

            default:
                console.warn('AccessGuard: Unknown protection level:', level);
                authorized = true;
        }

        if (authorized) {
            showContent();
            return true;
        } else {
            redirect(redirectTo, message);
            return false;
        }
    }

    // Add a visual indicator when God Mode is active
    function addGodModeBadge() {
        /* Defer until body exists, exactly as addFirebaseAdminBadge has always done. require()
           now runs inside <head> on 118 pages (Mallory audit, 2026-08-12), so document.body is
           null on the bypass paths and the appendChild below would throw. The content still
           showed, because showContent() runs first, so the only symptom was staff losing
           their badge and a console error: precisely the kind of thing nobody reports. */
        if (!document.body) {
            document.addEventListener('DOMContentLoaded', addGodModeBadge);
            return;
        }
        if (document.getElementById('god-mode-indicator')) return;

        const badge = document.createElement('div');
        badge.id = 'god-mode-indicator';
        badge.innerHTML = '<img src="/assets/images/icons/icon-detective.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle"> GOD MODE';
        badge.style.cssText = `
            position: absolute;
            top: ${window.scrollY + 10}px;
            left: 50%;
            transform: translateX(-50%);
            background: linear-gradient(135deg, #ffd700, #ff6b00);
            color: #000;
            padding: 5px 15px;
            border-radius: 20px;
            font-size: 11px;
            font-weight: bold;
            letter-spacing: 0.1em;
            z-index: 99999;
            box-shadow: 0 0 20px rgba(255, 215, 0, 0.5);
            pointer-events: none;
        `;
        document.body.appendChild(badge);
    }

    // Add Master Key indicator (shows on protected pages when active)
    function addMasterKeyBadge() {
        // Check if indicator already exists
        if (document.getElementById('master-key-indicator')) return;

        // Show the full indicator with countdown
        showMasterKeyIndicator();
    }

    // Check multiple requirements (all must pass)
    function requireAll(...requirements) {
        hideContent();

        // Firebase Admin bypass — QC-4: with async verification
        if (isFirebaseAdmin()) {
            showContent();
            addFirebaseAdminBadge();
            _scheduleAsyncVerification('admin');
            return true;
        }

        // God Mode bypass
        if (hasGodMode()) {
            showContent();
            addGodModeBadge();
            return true;
        }

        // Master Key bypass
        if (hasMasterKey()) {
            showContent();
            addMasterKeyBadge();
            return true;
        }

        for (const req of requirements) {
            const [level, param] = Array.isArray(req) ? req : [req];
            // Don't hide/show during iteration, just check
            let passed = false;

            switch (level) {
                case 'sorted':
                    passed = isSorted() || isTourist();
                    break;
                case 'house':
                    // House hoppers can access any house; tourists can browse any house
                    passed = isTourist() || (isSorted() && (param === 'any' || isHouseHopper() || getUserHouse() === param));
                    break;
                case 'gate':
                    passed = hasPassedGatesUpTo(parseInt(param) || 1);
                    break;
                case 'dark-arts':
                    passed = hasPassedGatesUpTo(5);
                    break;
                case 'admin':
                    // QC-4: Firebase admin OR God Mode
                    passed = hasGodMode() || isFirebaseAdmin();
                    break;
                default:
                    passed = true;
            }

            if (!passed) {
                return require(level, param);  // Use single require for proper redirect
            }
        }

        // If tourist passed through requireAll, inject UI
        if (isTourist()) {
            _scheduleTouristUI();
        }

        showContent();
        return true;
    }

    // Allow any of multiple requirements (first match wins)
    function requireAny(...requirements) {
        hideContent();

        // Firebase Admin bypass — QC-4: with async verification
        if (isFirebaseAdmin()) {
            showContent();
            addFirebaseAdminBadge();
            _scheduleAsyncVerification('admin');
            return true;
        }

        // God Mode bypass
        if (hasGodMode()) {
            showContent();
            addGodModeBadge();
            return true;
        }

        // Master Key bypass
        if (hasMasterKey()) {
            showContent();
            addMasterKeyBadge();
            return true;
        }

        for (const req of requirements) {
            const [level, param] = Array.isArray(req) ? req : [req];
            let passed = false;

            switch (level) {
                case 'sorted':
                    passed = isSorted() || isTourist();
                    break;
                case 'house':
                    // House hoppers can access any house; tourists can browse any house
                    passed = isTourist() || (isSorted() && (param === 'any' || isHouseHopper() || getUserHouse() === param));
                    break;
                case 'gate':
                    passed = hasPassedGatesUpTo(parseInt(param) || 1);
                    break;
                case 'dark-arts':
                    passed = hasPassedGatesUpTo(5);
                    break;
                case 'admin':
                    // QC-4: Firebase admin OR God Mode
                    passed = hasGodMode() || isFirebaseAdmin();
                    break;
                default:
                    passed = true;
            }

            if (passed) {
                if (isTourist()) {
                    _scheduleTouristUI();
                }
                showContent();
                return true;
            }
        }

        // None passed - redirect based on first requirement
        const [level, param] = Array.isArray(requirements[0]) ? requirements[0] : [requirements[0]];
        return require(level, param);
    }

    // Show indicator if Master Key or Firebase Admin is active (for page navigation)
    function showIndicatorIfActive() {
        // Firebase Admin badge
        if (isFirebaseAdmin() && !document.getElementById('firebase-admin-indicator')) {
            addFirebaseAdminBadge();
        }
        // Master Key indicator
        if (hasMasterKey() && !document.getElementById('master-key-indicator')) {
            showMasterKeyIndicator();
        }
    }

    // Public API
    return {
        require,
        requireAll,
        requireAny,
        hasGodMode,
        toggleGodMode,
        // Firebase Admin system
        isFirebaseAdmin,
        getFirebaseUser,
        // Master Key system
        hasMasterKey,
        activateMasterKey,
        deactivateMasterKey,
        getMasterKeyRemaining,
        showIndicatorIfActive,
        // User status
        isTourist,
        isSorted,
        getUserHouse,
        isDivergent,
        isExplorer,
        isHouseHopper,
        hasPassedGate,
        hasPassedGatesUpTo,
        showContent,
        hideContent
    };
})();

// Auto-execute: Hide content immediately on script load
(function() {
    // Immediately hide to prevent flash of content
    const style = document.createElement('style');
    style.id = 'access-guard-preload';
    style.textContent = 'body { visibility: hidden; }';
    document.head.appendChild(style);
})();

// Auto-show Master Key indicator on any page if active
document.addEventListener('DOMContentLoaded', function() {
    AccessGuard.showIndicatorIfActive();
});


// ── Tourist Visa Auto-Loader ─────────────────────────────────
// Dynamically load TouristVisa.js so AccessGuard can check tourist
// status without requiring every page to manually include it.
// No-op if TouristVisa is already loaded.
(function() {
    if (typeof TouristVisa !== 'undefined') return;
    try {
        var s = document.createElement('script');
        s.src = '/components/TouristVisa.js';
        document.head.appendChild(s);
    } catch(e) {}
})();

// ── Tenant Auto-Loaders ─────────────────────────────────────
// If tenant context exists in sessionStorage, dynamically load
// TenantRouter.js (navigation routing) and TenantShell.js (branded header).
// No-op when no tenant context (direct Hexworth Prime users).
(function() {
    try {
        // Check both storage types for tenant context (cross-tab resilience)
        if (sessionStorage.getItem('hexworth_tenant') || localStorage.getItem('hexworth_tenant')) {
            // Load TenantRouter first (synchronous navigation decisions)
            if (typeof TenantRouter === 'undefined' && !window.__tenantRouterRequested) {
                window.__tenantRouterRequested = true;
                var r = document.createElement('script');
                r.src = '/components/TenantRouter.js';
                document.head.appendChild(r);
            }
            // Load TenantShell (branded header bar)
            if (!window.__tenantShellRequested) {
                window.__tenantShellRequested = true;
                var s = document.createElement('script');
                s.src = '/components/TenantShell.js';
                document.head.appendChild(s);
            }
        }
    } catch(e) {}
})();
