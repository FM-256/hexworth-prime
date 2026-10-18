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

    /* Returns the exam id to serve, or null if the caller named one that does not exist. Null rather
     * than a throw, so the caller owns the error type (HttpsError in production, a plain assertion
     * in a test) and this module stays free of both. */
    function resolveExamId(raw) {
        if (raw === undefined || raw === null || raw === '') { return DEFAULT_EXAM_ID; }
        var id = String(raw);
        return EXAM_IDS.indexOf(id) >= 0 ? id : null;
    }

    module.exports = {
        EXAM_IDS: EXAM_IDS, DEFAULT_EXAM_ID: DEFAULT_EXAM_ID, resolveExamId: resolveExamId
    };
})();
