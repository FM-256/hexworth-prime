/* ═══════════════════════════════════════════════════════════════════════════════════════════════
 * mdfinal-exams.js — which MD-100 final exam identities exist, when they open, how long they run,
 * what passes, and how often a sitting may be reset. The one place that decides.
 *
 * Design spec: _docs/operations/md100-final-exam-spec-v2-2026-11-03.md, sections 1.1, 1.4, R2,
 * 13.5 item 6 (reset policy). Same reasoning as netfinal-exams.js, whose header explains why exam
 * identity and duration are server knowledge: examId is folded into the HMAC derivation, so a new
 * string is a whole new lab, and a client-chosen duration is not a server timer.
 *
 * Pure: no clock, no Firestore, no firebase-functions. The window check takes `now` as an argument
 * so the tests can stand at any instant.
 * ═══════════════════════════════════════════════════════════════════════════════════════════════ */
(function () {
    'use strict';

    var NF_EXAMS = require('../netfinal/netfinal-exams.js');
    var LIM = require('./mdfinal-limits.js');

    /* Every constant below is deep-frozen (Mallory D1 R1): an unfrozen WINDOWS let any in-process
     * holder of windowFor()'s result move opensAt and open the exam early, and a push onto EXAM_IDS
     * minted a new exam id. */
    var freeze = LIM.deepFreeze;

    /* The real sitting and the rehearsal. The rehearsal is a different examId, so it derives a
     * different lab for the same account (R2): a dry run never reveals that account's real exam. */
    var EXAM_IDS = freeze(['md100-final-2026', 'md100-final-rehearsal']);
    var DEFAULT_EXAM_ID = EXAM_IDS[0];
    var REHEARSAL_EXAM_ID = EXAM_IDS[1];

    var DURATION_MINUTES = freeze({ 'md100-final-2026': 150, 'md100-final-rehearsal': 150 });

    /* The rehearsal has NO catalog id, so its grade is recorded nowhere (R2). */
    var CATALOG_IDS = freeze({ 'md100-final-2026': 'forge-md100-final' });

    /* Release window for a NEW start (R2). Resume is always allowed; the session clock governs it.
     * Operator, 2026-11-05 ("let people take the final"): open now, last new start unchanged at
     * 6:30 pm Thursday 2026-11-19, Eastern (EST, UTC-5). Was 5:30-6:30 pm that day only. The
     * rehearsal has no window; its gate is the admin claim or the allowlist. */
    var WINDOWS = freeze({
        'md100-final-2026': {
            opensAt: Date.parse('2026-11-05T17:00:00Z'),   /* 12:00 EST, 2026-11-05 */
            closesAt: Date.parse('2026-11-19T23:30:00Z')   /* 18:30 EST, last new start */
        }
    });

    var PASS_PERCENT = 70;

    /* Reset policy, spec 13.5 item 6. Constants, so the operator can adjust a cap with one edit and
     * a deploy, and the tests read the same number the engine enforces. */
    var SELF_RESET_CAP = 2;
    var ADMIN_RESET_CAP = 1;
    var ADMIN_RESET_GRACE_MINUTES = 30;
    var PLATFORM_FAULT_CODES = freeze(['vm_unreachable', 'provision_failed', 'engine_error', 'outage']);

    /* Own-property test, so a prototype key such as '__proto__' never resolves to an exam. */
    function own(o, k) { return Object.prototype.hasOwnProperty.call(o, k); }

    /* Null rather than a throw for an unknown id, so the caller owns the error type. */
    function resolveExamId(raw) {
        if (raw === undefined || raw === null || raw === '') { return DEFAULT_EXAM_ID; }
        var id = String(raw);
        return EXAM_IDS.indexOf(id) >= 0 ? id : null;
    }

    /* Sitting length in minutes for an exam id, clamped 1..240 by netfinal's shared bounds. */
    function durationMinutes(examId) {
        var id = String(examId);
        return NF_EXAMS.clampMinutes(own(DURATION_MINUTES, id) ? DURATION_MINUTES[id] : 150);
    }

    /* The gradebook id an exam records under, or null (the rehearsal is recorded nowhere). */
    function catalogId(examId) {
        var id = String(examId);
        return own(CATALOG_IDS, id) ? CATALOG_IDS[id] : null;
    }

    /* The {opensAt, closesAt} release window for an exam id, or null when it has none. */
    function windowFor(examId) {
        var id = String(examId);
        return own(WINDOWS, id) ? WINDOWS[id] : null;
    }

    /* May a NEW sitting be created now? Resume is decided elsewhere and is always allowed.
     *   real id:      uid in allowUids, or (armed and opensAt <= now < closesAt)
     *   rehearsal id: caller is admin, or uid in allowUids
     * `control` is the mdfinal_control/{examId} document read fresh by the caller (13.2 item 4);
     * a missing document is { armed:false, allowUids:[] }. */
    function mayCreate(examId, uid, isAdmin, control, now) {
        var id = resolveExamId(examId);
        if (!id || typeof uid !== 'string' || !uid) { return false; }
        var c = control || {};
        var allow = Array.isArray(c.allowUids) ? c.allowUids : [];
        if (allow.indexOf(uid) >= 0) { return true; }
        if (id === REHEARSAL_EXAM_ID) { return isAdmin === true; }
        var w = windowFor(id);
        if (!w || c.armed !== true) { return false; }
        /* A real number only: a numeric string, a Date or [t] is refused, so the caller must pass
         * Date.now() and nothing coerced (Mallory D1 residual). */
        if (typeof now !== 'number' || !isFinite(now)) { return false; }
        return w.opensAt <= now && now < w.closesAt;
    }

    /* True when total/outOf reaches PASS_PERCENT; malformed or zero totals never pass. The percent
     * is rounded to 0.01 first (spec 3.1 rounds displayed totals to 0.01), so a sum of sixths that
     * lands on 69.99999999999999 passes as the 70.00 the student is shown (Nancy D1). */
    function passed(total, outOf) {
        var t = Number(total), o = Number(outOf);
        if (!isFinite(t) || !isFinite(o) || o <= 0) { return false; }
        return Math.round((t / o) * 10000) / 100 >= PASS_PERCENT;
    }

    module.exports = {
        EXAM_IDS: EXAM_IDS, DEFAULT_EXAM_ID: DEFAULT_EXAM_ID, REHEARSAL_EXAM_ID: REHEARSAL_EXAM_ID,
        DURATION_MINUTES: DURATION_MINUTES, CATALOG_IDS: CATALOG_IDS, WINDOWS: WINDOWS,
        PASS_PERCENT: PASS_PERCENT, SELF_RESET_CAP: SELF_RESET_CAP, ADMIN_RESET_CAP: ADMIN_RESET_CAP,
        ADMIN_RESET_GRACE_MINUTES: ADMIN_RESET_GRACE_MINUTES, PLATFORM_FAULT_CODES: PLATFORM_FAULT_CODES,
        resolveExamId: resolveExamId, durationMinutes: durationMinutes, catalogId: catalogId,
        windowFor: windowFor, mayCreate: mayCreate, passed: passed,
        clampMinutes: NF_EXAMS.clampMinutes
    };
})();
