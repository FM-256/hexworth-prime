/**
 * ObservatoryTelemetry.js
 *
 * Activity capture for the Hexworth Observatory's consented research cohort, running
 * INSIDE the courses rather than only on the Observatory house index.
 *
 * Events emitted (all fire-and-forget beacons to the logObservatoryEvent Cloud
 * Function, which verifies the ID token, derives a server-authoritative classId,
 * gates on a consent/enrollment record, and for the Phase 2 behavioral events below
 * additionally requires the participant's consent record to be on the current form
 * version):
 *
 *   Phase 1 (completion):
 *     content_complete : a chapter/lab/quiz/game was finished (from the platform-wide
 *                        completionStamp:marked event, ModuleProgress.js:461).
 *   Phase 2 (behavioral, gated on re-consent to form version cerbi-v2):
 *     page_view    : arrival on a course page.
 *     session_end  : time on the page, how much was active (idle excluded), and how far
 *                    the student scrolled. Sent as monotonic snapshots (see below).
 *     client_error : a JS error the student hit (doubles as live QA).
 *     device       : viewport / platform / connection / reduced-motion, once per session.
 *
 * session_end and tab-switching: visibilitychange:hidden is the only reliable "last
 * chance to send" on mobile, but it also fires on a mere tab-switch. So we do NOT treat
 * the first hidden as the end of the session. Instead each hidden (and the real pagehide)
 * sends a session_end SNAPSHOT tagged with a per-page-load sessionId, and we only send
 * when the elapsed time has grown since the last snapshot. The dashboard keeps the
 * largest snapshot per sessionId, so time after a tab-switch is never lost.
 *
 * Consent model (operator decision 2026-07-04): the client sends for any signed-in
 * user (permissive) and the Cloud Function is the authoritative gate. The client does
 * not decide consent, so no consent logic can be spoofed here.
 *
 * Auth note: course pages load FirebaseAuth.js (not ArenaFirebase, which is only on the
 * Observatory house index). uid via FirebaseAuth.waitForAuth(); token via
 * FirebaseAuth.refreshToken().
 *
 * Analytics is best effort: it must never block render, block navigation, or throw into
 * the page. Exposed as window.ObservatoryTelemetry; auto inits on DOMContentLoaded.
 */
window.ObservatoryTelemetry = (function () {
    'use strict';

    const EVENT_ENDPOINT = 'https://us-central1-hexworth-prime.cloudfunctions.net/logObservatoryEvent';
    const IDLE_MS = 30 * 1000;        // no interaction for this long counts as idle
    const HEARTBEAT_MS = 5 * 1000;    // active-time accounting tick
    const MAX_ERRORS = 5;             // cap client_error emits per page

    let _uid = null;
    let _classId = null;
    let _idToken = null;   // cached Firebase ID token, refreshed on a timer
    let _wired = false;

    // Session/engagement accounting.
    let _sessionId = null;
    let _startTs = 0;
    let _activeMs = 0;
    let _lastInteract = 0;
    let _maxScrollPct = 0;
    let _lastSentDuration = -1;   // monotonic guard for session_end snapshots
    let _errorEmits = 0;

    // Cache a fresh Firebase ID token for the beacon. Tokens last about an hour, so we
    // refresh on a timer to keep a late event verifiable.
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

    // Coarse course slug from the path (e.g. comptia-aplus/core-1), a convenience for
    // the dashboard; the full path is always stored server-side too. Null if unknown.
    function courseFromPath() {
        try {
            const m = location.pathname.match(/\/applets\/([^/]+\/[^/]+)/) ||
                      location.pathname.match(/\/modules\/([^/]+)/);
            return m ? m[1] : null;
        } catch (e) { return null; }
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
                fetch(EVENT_ENDPOINT, { method: 'POST', body: blob, keepalive: true }).catch(function () {});
            }
        } catch (e) { /* best effort; never surface */ }
    }

    // Translate a completion stamp into a content_complete event. score is a number for
    // a passed quiz and null for a module/lab/game (which complete without a score).
    function onCompletionStamp(e) {
        const d = (e && e.detail) || {};
        if (!d.moduleId) return;
        emit('content_complete', {
            moduleId: d.moduleId,
            score: (typeof d.score === 'number') ? d.score : null
        });
    }

    // Any real interaction marks the student active (resets the idle clock).
    function markInteract() { _lastInteract = Date.now(); }

    // Active-time tick: count this interval as active only if the page is visible and the
    // student has interacted within the idle window.
    function tick() {
        if (document.visibilityState === 'visible' && (Date.now() - _lastInteract) < IDLE_MS) {
            _activeMs += HEARTBEAT_MS;
        }
    }

    // Track how far down the page the student has scrolled (max reached).
    function onScroll() {
        try {
            const doc = document.documentElement;
            const reached = (window.scrollY || doc.scrollTop || 0) + window.innerHeight;
            const total = doc.scrollHeight || 1;
            const pct = Math.min(100, Math.round((reached / total) * 100));
            if (pct > _maxScrollPct) _maxScrollPct = pct;
        } catch (e) { /* ignore */ }
        markInteract();
    }

    // A JS error the student actually hit. Capped per page.
    function onError(e) {
        if (_errorEmits >= MAX_ERRORS) return;
        _errorEmits++;
        emit('client_error', {
            message: (e && e.message ? String(e.message) : 'error'),
            source: (e && e.filename ? String(e.filename) : location.pathname)
        });
    }

    // Send a session_end SNAPSHOT. Called on every visibilitychange:hidden and on
    // pagehide. It never permanently ends the session: it only sends when elapsed time
    // has grown, and each snapshot carries the sessionId so the dashboard keeps the
    // largest per session. A tab-switch therefore sends an interim value and the real
    // leave sends the final, larger one, with no lost engagement time.
    function sendSessionEnd() {
        if (!_uid) return;
        const durationSec = Math.round((Date.now() - _startTs) / 1000);
        if (durationSec <= _lastSentDuration) return;
        _lastSentDuration = durationSec;
        emit('session_end', {
            sessionId: _sessionId,
            durationSec: durationSec,
            activeSec: Math.round(_activeMs / 1000),
            maxScrollPct: _maxScrollPct
        });
    }

    // Device context, once per browser session (across pages) via a sessionStorage guard.
    function emitDeviceOnce() {
        try {
            if (sessionStorage.getItem('obs_tele_device')) return;
            sessionStorage.setItem('obs_tele_device', '1');
        } catch (e) { /* if storage is blocked, emit anyway */ }
        let connection = null;
        try { connection = (navigator.connection && navigator.connection.effectiveType) || null; } catch (e) { /* ignore */ }
        let reduced = false;
        try { reduced = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches); } catch (e) { /* ignore */ }
        emit('device', {
            viewport: (window.innerWidth || 0) + 'x' + (window.innerHeight || 0),
            platform: (navigator.platform || navigator.userAgent || '').slice(0, 60),
            connection: connection,
            reducedMotion: reduced
        });
    }

    // Build a per-page-load session id (browser-only; Math.random is fine here).
    function makeSessionId() {
        return Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10);
    }

    // Wire the behavioral listeners once identity is known. Kept separate from the
    // completion listener so a page with no auth still no-ops cleanly.
    function wireBehavior() {
        _sessionId = makeSessionId();
        _startTs = Date.now();
        _lastInteract = _startTs;
        emit('page_view', { course: courseFromPath() });
        emitDeviceOnce();
        ['mousemove', 'keydown', 'touchstart', 'pointerdown', 'click'].forEach(function (ev) {
            window.addEventListener(ev, markInteract, { passive: true });
        });
        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('error', onError);
        setInterval(tick, HEARTBEAT_MS);
        // session_end snapshots. visibilitychange:hidden is the reliable last-chance on
        // mobile; pagehide is the real leave. Both send a monotonic snapshot.
        document.addEventListener('visibilitychange', function () {
            if (document.visibilityState === 'hidden') sendSessionEnd();
        });
        window.addEventListener('pagehide', sendSessionEnd);
    }

    // Load a script once (idempotent): skip if a tag for it is already on the page.
    // Resolves on load or error (best effort; a failed load just means no auth source).
    function loadScriptOnce(src) {
        return new Promise(function (resolve) {
            if (document.querySelector('script[src*="' + src + '"]')) { resolve(); return; }
            var s = document.createElement('script');
            s.src = src;
            s.onload = function () { resolve(); };
            s.onerror = function () { resolve(); };
            (document.head || document.documentElement).appendChild(s);
        });
    }

    // Cheap gate before loading anything: is there a cached, signed-in (non-anonymous)
    // user? FirebaseAuth persists its user to localStorage ('hexworth_firebase_user') and
    // clears it on sign-out. A consented Observatory student has signed in (the consent
    // gate requires a real account), so the persisted user is present across ALL pages on
    // the origin, including bare content pages that never load Firebase. A public or
    // never-signed-in visitor has none, so we skip the FirebaseAuth + Firebase SDK load
    // entirely and add zero third-party cost to those visits. If FirebaseAuth is already
    // on the page, proceed regardless.
    function hasSignedInHint() {
        if (typeof FirebaseAuth !== 'undefined') return true;
        try {
            var raw = localStorage.getItem('hexworth_firebase_user');
            if (!raw) return false;
            var u = JSON.parse(raw);
            return !!(u && u.uid && u.isAnonymous === false);
        } catch (e) { return false; }
    }

    // Lazy-load FirebaseAuth.js when the page does not already include it, so this single
    // telemetry tag is self-sufficient on any Observatory content page (no separate auth
    // include required for the rollout). FirebaseAuth.waitForAuth() self-initializes the
    // SDK and resolves to the signed-in user or null; it never creates an anonymous
    // account, so a page with no signed-in student stays a silent no-op.
    async function ensureFirebaseAuth() {
        if (typeof FirebaseAuth !== 'undefined') return;
        await loadScriptOnce('/components/FirebaseAuth.js');
    }

    // Resolve identity, seed a token, then wire the completion + behavioral capture.
    async function init() {
        if (_wired) return;
        // No cached signed-in user means nothing to attribute and no reason to pay the
        // SDK-load cost; stay a fully silent no-op (Nancy 2026-07-05 cost review).
        if (!hasSignedInHint()) return;
        await ensureFirebaseAuth();
        let user = null;
        try {
            if (typeof FirebaseAuth !== 'undefined' && FirebaseAuth.waitForAuth) {
                user = await FirebaseAuth.waitForAuth();
            }
        } catch (e) { /* leave user null */ }
        // No signed in user means nothing to attribute. Stay a silent no op.
        if (!user || !user.uid) return;
        _wired = true;
        _uid = user.uid;
        _classId = readLocalClassId();
        await refreshToken();
        setInterval(refreshToken, 30 * 60 * 1000);
        // Completion capture (Phase 1) and behavioral capture (Phase 2). The Cloud
        // Function admits the behavioral events only for participants re-consented to
        // the current form version, so this client stays permissive by design.
        window.addEventListener('completionStamp:marked', onCompletionStamp);
        wireBehavior();
    }

    return { init: init };
})();

// Auto init once the DOM is ready. FirebaseAuth runs its own DOMContentLoaded init;
// waitForAuth() awaits that readiness, so listener order does not matter.
// Skip telemetry entirely during an ephemeral level replay (window.__replaying, set by a module's inline
// loadProgress before this auto-init runs). Replay is a practice re-run of an ALREADY-complete module, so
// there is no genuine completion or fresh visit to record - tracking it would inject a synthetic extra
// "session" (visit count, time-on-task) into the consented research dataset.
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { if (!window.__replaying) window.ObservatoryTelemetry.init(); });
} else {
    if (!window.__replaying) window.ObservatoryTelemetry.init();
}
