/**
 * ObservatoryTelemetry.js
 *
 * Completion capture for the Hexworth Observatory's consented research cohort,
 * running INSIDE the courses rather than only on the Observatory house index.
 *
 * Batch 1 records exactly one event type: content_complete (a chapter, lab, quiz,
 * or game finished). It derives that from the platform wide 'completionStamp:marked'
 * window event that ModuleProgress fires on every completion (ModuleProgress.js:461),
 * so it taps a signal the pages already emit instead of re wiring each page.
 *
 * Transport is the same logObservatoryEvent Cloud Function the house tracker uses.
 * The function verifies the ID token, derives a server authoritative classId, and
 * admits the event ONLY when the uid has a server side consent or enrollment record.
 * Per the operator consent decision (2026-07-04) the client sends for any signed in
 * user and the Cloud Function is the authoritative consent gate: permissive send
 * plus server side drop.
 *
 * Auth note: these course pages load FirebaseAuth.js, not ArenaFirebase (which is
 * only present on the Observatory house index). The uid comes from
 * FirebaseAuth.waitForAuth() and the beacon ID token from FirebaseAuth.refreshToken().
 *
 * Analytics is best effort: it must never block render, block navigation, or throw
 * into the page. Exposed as window.ObservatoryTelemetry; auto inits on DOMContentLoaded.
 */
window.ObservatoryTelemetry = (function () {
    'use strict';

    // All events POST here via sendBeacon. The Cloud Function verifies the ID token,
    // derives the uid server side, and gates on a consent/enrollment record.
    const EVENT_ENDPOINT = 'https://us-central1-hexworth-prime.cloudfunctions.net/logObservatoryEvent';

    let _uid = null;
    let _classId = null;
    let _idToken = null;   // cached Firebase ID token, refreshed on a timer
    let _wired = false;

    // Cache a fresh Firebase ID token for the beacon. Tokens last about an hour, so
    // we refresh on a timer to keep a late completion verifiable.
    async function refreshToken() {
        try {
            if (typeof FirebaseAuth !== 'undefined' && FirebaseAuth.refreshToken) {
                const t = await FirebaseAuth.refreshToken();
                if (t) _idToken = t;
            }
        } catch (e) { /* keep the previous token */ }
    }

    // Best effort classId from the local consent mirror. The Cloud Function overrides
    // this with the server authoritative value; it is only a fallback hint.
    function readLocalClassId() {
        try {
            const raw = localStorage.getItem('observatory_consent_' + (_uid || 'preview'));
            if (raw) return JSON.parse(raw).classId || null;
        } catch (e) { /* ignore */ }
        return null;
    }

    // Fire and forget beacon. No op without a uid and token (the endpoint would reject
    // anyway). sendBeacon is used so the write survives page unload.
    function emit(type, payload) {
        if (!_uid || !_idToken) return;
        try {
            const body = JSON.stringify({
                idToken: _idToken,
                type: type,
                classId: _classId || null,
                path: location.pathname,
                clientTs: new Date().toISOString(),
                payload: payload || {}
            });
            // text/plain keeps this a CORS simple request (no preflight), a requirement
            // for navigator.sendBeacon.
            const blob = new Blob([body], { type: 'text/plain' });
            if (navigator.sendBeacon) {
                navigator.sendBeacon(EVENT_ENDPOINT, blob);
            } else {
                // Fallback: keepalive fetch survives unload on browsers without beacon.
                fetch(EVENT_ENDPOINT, { method: 'POST', body: blob, keepalive: true }).catch(function () {});
            }
        } catch (e) { /* best effort; never surface */ }
    }

    // Translate a completion stamp into a content_complete event. score is a number
    // for a passed quiz and null for a module/lab/game (which complete without a score).
    function onCompletionStamp(e) {
        const d = (e && e.detail) || {};
        if (!d.moduleId) return;
        emit('content_complete', {
            moduleId: d.moduleId,
            score: (typeof d.score === 'number') ? d.score : null
        });
    }

    // Resolve identity, seed a token, then wire the single completion listener.
    async function init() {
        if (_wired) return;
        let user = null;
        try {
            if (typeof FirebaseAuth !== 'undefined' && FirebaseAuth.waitForAuth) {
                user = await FirebaseAuth.waitForAuth();
            }
        } catch (e) { /* leave user null */ }
        // No signed in user means nothing to attribute. Stay a silent no op.
        if (!user || !user.uid) return;
        _uid = user.uid;
        _classId = readLocalClassId();
        await refreshToken();
        // Keep the token fresh for a completion that happens late in the session.
        setInterval(refreshToken, 30 * 60 * 1000);
        window.addEventListener('completionStamp:marked', onCompletionStamp);
        _wired = true;
    }

    return { init: init };
})();

// Auto init once the DOM is ready. FirebaseAuth runs its own DOMContentLoaded init;
// waitForAuth() awaits that readiness, so listener order does not matter.
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { window.ObservatoryTelemetry.init(); });
} else {
    window.ObservatoryTelemetry.init();
}
