/* ═══════════════════════════════════════════════════════════════════════════════════════════════
 * mdfinal-grade.js — answer key and grading for the MD-100 final.
 *
 * Design spec: _docs/operations/md100-final-exam-spec-v2-2026-11-03.md, sections 3 and 5, 13.3.
 *
 * D1 SCOPE: buildAnswerKey only. The key is built by the generator from the same draft as the
 * state (mdfinal-core.js), so the two cannot disagree; this module is where graders read it from.
 * grade, retotal, studentReport, toCsv and objectiveTotals arrive at D5.
 * ═══════════════════════════════════════════════════════════════════════════════════════════════ */
(function () {
    'use strict';

    var CORE = require('./mdfinal-core.js');

    module.exports = { buildAnswerKey: CORE.buildAnswerKey };
})();
