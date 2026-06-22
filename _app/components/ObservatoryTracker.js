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

    let _ctx = null;       // { uid, classId }
    let _enterTs = 0;
    let _leaveSent = false; // dwell should fire once

    // Resolve the live Firestore handle + modular SDK fns, or null (offline/preview).
    function getDb() {
        if (typeof ArenaFirebase !== 'undefined' && ArenaFirebase.db && window.firebaseFirestore) {
            return { db: ArenaFirebase.db, fs: window.firebaseFirestore };
        }
        return null;
    }

    // Build the tracking context: uid from auth, classId from the consent record.
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
        try {
            const raw = localStorage.getItem('observatory_consent_' + (uid || 'preview'));
            if (raw) classId = JSON.parse(raw).classId || null;
        } catch (e) { /* ignore */ }
        return { uid, classId };
    }

    // Fire-and-forget event write. No-op without a uid (rules would reject anyway).
    async function emit(type, payload) {
        const conn = getDb();
        if (!conn || !_ctx || !_ctx.uid) return;
        try {
            const { collection, addDoc, serverTimestamp } = conn.fs;
            await addDoc(collection(conn.db, 'observatory_activity'), {
                uid: _ctx.uid,
                classId: _ctx.classId || null,
                type: type,
                path: location.pathname,
                at: serverTimestamp(),
                clientTs: new Date().toISOString(),
                ...(payload || {})
            });
        } catch (e) { /* analytics is best-effort — never surface */ }
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
        _enterTs = Date.now();
        emit('house_enter', {});

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

    return { init: init };
})();

// Browser global for script-tag consumers.
window.ObservatoryTracker = ObservatoryTracker;
