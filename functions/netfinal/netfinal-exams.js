/* ═══════════════════════════════════════════════════════════════════════════════════════════════
 * netfinal-exams.js — which exam identities exist, and the one place that decides.
 *
 * WHY THIS IS ITS OWN FILE. The check used to live inline in functions/index.js as a regex on the
 * client's `examId`, which validated the SHAPE of a string and nothing about whether that exam
 * exists. `examId` is folded into the seed (netfinal-core.js: secret|studentId|examId) and the
 * session is addressed as uid + '::' + examId, so a new string is a whole new lab -- new clock, new
 * faults, new answer key -- under a session id that cannot collide with the real one. Passing
 * examId:'attempt2' from devtools bought a second attempt against a spec that allows one.
 *
 * It lives HERE rather than in index.js so it can be tested without loading firebase-functions.
 * The rule that stops a student getting a second attempt should not be the one rule that only runs
 * in production.
 * ═══════════════════════════════════════════════════════════════════════════════════════════════ */
(function () {
    'use strict';

    /* Every exam identity the callables will serve. Adding one mints a new lab population and a new
     * session namespace, so it is deliberately a code change plus a deploy -- the right amount of
     * friction for creating an exam. A second sitting or a make-up cohort goes here. */
    var EXAM_IDS = ['net-final-2026'];

    var DEFAULT_EXAM_ID = EXAM_IDS[0];

    /* ═══ HOW LONG EACH EXAM RUNS, DECIDED BY THE SERVER ═════════════════════════════════════════
     *
     * The duration used to come from the client: `netfinalStart` forwarded `c.data.minutes` into
     * `startExam`, which multiplied it by 60000 and stored it as `durationMs` -- the field the
     * expiry check reads on every later call. No allowlist, no ceiling, no sanity check. A student
     * who called the callable from devtools before the page's own call got an exam that never ends:
     *
     *   startExam(store, { studentId, examId, minutes: 999999999 })
     *     -> remainingMs 59999999939998, durationMs stored 59999999940000  (694,444 days)
     *
     * And permanently, because resume returns the same session with the duration fixed at creation.
     * Spec section 9 says "One attempt, server-timed. The timer runs on the server" -- a timer whose
     * length the client chooses is not server-timed, it is server-enforced against a client's number.
     *
     * This is the SAME defect as the examId format check, in the same file, found by a different
     * reviewer a few hours later: a client-supplied value trusted into session state. The remedy is
     * the same one -- which exams exist and how long they run are both server knowledge, so they
     * live together. A different sitting length is a deliberate edit here plus a deploy. */
    var DURATION_MINUTES = { 'net-final-2026': 120 };

    /* Hard bounds, applied to whatever reaches the engine from any caller including a test. The
     * allowlist above stops the CALLABLE forwarding a forged value; this stops any other path
     * storing an absurd one, because a single guard at the edge is a guard that one new caller
     * removes. 240 is four hours -- generous for a 100-minute pilot, and finite. */
    var MIN_MINUTES = 1;
    var MAX_MINUTES = 240;
    var FALLBACK_MINUTES = 120;

    function durationMinutes(examId) {
        var m = DURATION_MINUTES[String(examId)];
        return clampMinutes(m === undefined ? FALLBACK_MINUTES : m);
    }

    function clampMinutes(value) {
        var n = Number(value);
        if (!isFinite(n) || n <= 0) { return FALLBACK_MINUTES; }
        return Math.min(MAX_MINUTES, Math.max(MIN_MINUTES, Math.floor(n)));
    }

    /* Returns the exam id to serve, or null if the caller named one that does not exist. Null rather
     * than a throw, so the caller owns the error type (HttpsError in production, a plain assertion
     * in a test) and this module stays free of both. */
    function resolveExamId(raw) {
        if (raw === undefined || raw === null || raw === '') { return DEFAULT_EXAM_ID; }
        var id = String(raw);
        return EXAM_IDS.indexOf(id) >= 0 ? id : null;
    }

    module.exports = {
        EXAM_IDS: EXAM_IDS, DEFAULT_EXAM_ID: DEFAULT_EXAM_ID, resolveExamId: resolveExamId,
        DURATION_MINUTES: DURATION_MINUTES, durationMinutes: durationMinutes,
        clampMinutes: clampMinutes,
        MIN_MINUTES: MIN_MINUTES, MAX_MINUTES: MAX_MINUTES, FALLBACK_MINUTES: FALLBACK_MINUTES
    };
})();
