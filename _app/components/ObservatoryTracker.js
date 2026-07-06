/**
 * ObservatoryTracker.js — self-built activity instrumentation for the Hexworth
 * Observatory's consented research cohort.
 *
 * Records what happens in the Observatory to Firestore `observatory_activity`
 * (admin-readable; the operator's research/analytics data). It runs ONLY after
 * consent is confirmed (ObservatoryConsent.ensureConsent → onGranted → init),
 * so every event belongs to a student who opted in.
 *
 * Events emitted:
 *   - house_enter : on arrival (with the enrolled classId)
 *   - course_click: a scheduled-course card was clicked (best-effort — the page
 *                   navigates away, so a slow write may not land; enter/dwell are
 *                   the reliable signals)
 *   - house_dwell : seconds spent in the house, on leave (pagehide/hidden)
 *
 * Each event doc: { uid, classId, type, path, at(serverTimestamp), clientTs, ...payload }.
 * The Firestore rule requires create-only with uid == auth.uid (see firestore.rules).
 * Fire-and-forget: analytics must never block or break the page.
 *
 * Exposed as window.ObservatoryTracker.  ObservatoryTracker.init().
 */
const ObservatoryTracker = (function () {
    'use strict';

    // All activity events POST here via sendBeacon. The endpoint (a Cloud
    // Function, admin-SDK write) verifies the ID token, derives the uid
    // server-side, and validates classId against the enrollment doc — so
    // unload-time events (click/dwell) survive navigation AND no client can
    // spoof another uid or an unenrolled classId.
    const EVENT_ENDPOINT = 'https://us-central1-hexworth-prime.cloudfunctions.net/logObservatoryEvent';

    let _ctx = null;        // { uid, classId }
    let _idToken = null;    // cached Firebase ID token, refreshed periodically
    let _enterTs = 0;
    let _leaveSent = false; // dwell should fire once

    // Resolve the live Firestore handle + modular SDK fns, or null (offline/preview).
    function getDb() {
        if (typeof ArenaFirebase !== 'undefined' && ArenaFirebase.db && window.firebaseFirestore) {
            return { db: ArenaFirebase.db, fs: window.firebaseFirestore };
        }
        return null;
    }

    // Build the tracking context: uid from auth, classId from Firestore.
    // classId is read from the enrollment/consent doc (authoritative) so a
    // student on a SECOND device — with no localStorage mirror — is still
    // attributed to their class. localStorage is only a last-resort fallback.
    async function buildContext() {
        let uid = null;
        try {
            if (typeof ArenaFirebase !== 'undefined') {
                await ArenaFirebase.isReady();
                uid = (ArenaFirebase.auth && ArenaFirebase.auth.currentUser)
                    ? ArenaFirebase.auth.currentUser.uid : null;
            }
        } catch (e) { /* leave uid null */ }

        let classId = null;
        const conn = getDb();
        if (conn && uid) {
            try {
                const { doc, getDoc } = conn.fs;
                let snap = await getDoc(doc(conn.db, 'observatory_enrollment', uid));
                if (!snap.exists()) snap = await getDoc(doc(conn.db, 'observatory_consent', uid));
                if (snap.exists()) classId = snap.data().classId || null;
            } catch (e) { /* fall through to localStorage */ }
        }
        if (!classId) {
            try {
                const raw = localStorage.getItem('observatory_consent_' + (uid || 'preview'));
                if (raw) classId = JSON.parse(raw).classId || null;
            } catch (e) { /* ignore */ }
        }
        return { uid, classId };
    }

    // Cache a fresh Firebase ID token for the beacon. Tokens last ~1h; we
    // refresh on a timer so a late unload-time event still verifies.
    async function refreshToken() {
        try {
            if (typeof ArenaFirebase !== 'undefined') {
                await ArenaFirebase.isReady();
                const u = ArenaFirebase.auth && ArenaFirebase.auth.currentUser;
                if (u) _idToken = await u.getIdToken();
            }
        } catch (e) { /* keep the previous token */ }
    }

    // Fire-and-forget beacon. No-op without a uid + token (the endpoint would
    // reject anyway). Uses sendBeacon so the write survives page unload.
    function emit(type, payload) {
        if (!_ctx || !_ctx.uid || !_idToken) return;
        try {
            const body = JSON.stringify({
                idToken: _idToken,
                type: type,
                classId: _ctx.classId || null,
                path: location.pathname,
                clientTs: new Date().toISOString(),
                payload: payload || {}
            });
            // text/plain keeps this a CORS "simple request" (no preflight) —
            // a requirement for navigator.sendBeacon.
            const blob = new Blob([body], { type: 'text/plain' });
            if (navigator.sendBeacon) {
                navigator.sendBeacon(EVENT_ENDPOINT, blob);
            } else {
                // Fallback: keepalive fetch survives unload on browsers w/o beacon.
                fetch(EVENT_ENDPOINT, { method: 'POST', body: blob, keepalive: true }).catch(function () {});
            }
        } catch (e) { /* analytics is best-effort — never surface */ }
    }

    // Public: record a sandbox launch (called by the Observatory sandbox card on a
    // successful launch). No-ops before init() or after abort() via emit()'s guards.
    function logSandbox(labId) {
        emit('sandbox_launch', { labId: typeof labId === 'string' ? labId : null });
    }

    // Emit the dwell event once, on the first leave signal.
    function sendDwell() {
        if (_leaveSent) return;
        _leaveSent = true;
        emit('house_dwell', { seconds: Math.round((Date.now() - _enterTs) / 1000) });
    }

    // Start tracking. Called from the house boot, after consent is granted.
    async function init() {
        _ctx = await buildContext();
        // Seed _idToken NOW so the house_enter emit below isn't silently dropped
        // (emit() no-ops when _idToken is null).
        await refreshToken();
        _enterTs = Date.now();
        emit('house_enter', {});

        // Keep the cached token fresh so a late dwell/click at unload still
        // verifies server-side (Firebase ID tokens expire after ~1h).
        setInterval(refreshToken, 30 * 60 * 1000);

        // Course-card clicks (capture phase so we see it before navigation starts).
        document.addEventListener('click', function (e) {
            const card = e.target.closest && e.target.closest('.path-card, .hr-hub-card');
            if (!card) return;
            emit('course_click', {
                target: card.dataset.pathHref || card.dataset.href || null,
                name: (card.querySelector('.path-name, .hr-hub-name') || {}).innerText || null
            });
        }, true);

        // Dwell on leave (pagehide is the reliable signal; visibility hidden as backup).
        window.addEventListener('pagehide', sendDwell);
        document.addEventListener('visibilitychange', function () {
            if (document.visibilityState === 'hidden') sendDwell();
        });
    }

    // Stop all tracking immediately and drop the context/token so NO further
    // event (including the unload-time dwell/click beacon) can fire. Called on
    // withdrawal — the user's data was just deleted server-side, and a late
    // beacon would strand a stray event under their uid.
    function abort() {
        _leaveSent = true;   // sendDwell() becomes a no-op
        _ctx = null;         // emit() no-ops (guards on _ctx && _ctx.uid)
        _idToken = null;     // emit() no-ops (guards on _idToken)
    }

    return { init: init, abort: abort, logSandbox: logSandbox };
})();

// Browser global for script-tag consumers.
window.ObservatoryTracker = ObservatoryTracker;
