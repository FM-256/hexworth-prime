/* ═══════════════════════════════════════════════════════════════════════════════════════════════
 * mdfinal-grade.js — answer key and grading for the MD-100 final.
 *
 * Design spec: _docs/operations/md100-final-exam-spec-v2-2026-11-03.md, sections 3 and 5, 13.3.
 *
 * The key is built by the generator from the same draft as the state (mdfinal-core.js), so the two
 * cannot disagree; graders read it from here. grade() runs every CHECKS row whose check() exists
 * and reports the rest as not implemented, never as 0. Part values stay unrounded; only displayed
 * values are rounded to 0.01 (3.1). Penalties deduct within their phase, floor 0.
 * studentReport, toCsv and objectiveTotals arrive with D5.
 * ═══════════════════════════════════════════════════════════════════════════════════════════════ */
(function () {
    'use strict';

    var CORE = require('./mdfinal-core.js');
    var CH = require('./mdfinal-checks.js');

    /* Rounds a displayed value to 0.01. */
    function r2(x) { return Math.round(x * 100) / 100; }

    /* Grades the given state (the handover snapshot for P1-P6) against the frozen key. */
    function grade(state, key) {
        var view = { s: state, k: key };
        var rows = CH.CHECKS.map(function (row) {
            if (typeof row.check !== 'function') {
                return { id: row.id, phase: row.phase, objective: row.objective, max: row.points, implemented: false, score: null, parts: null };
            }
            var parts = row.check(view);
            if (!Array.isArray(parts) || parts.length !== row.parts.length) {
                throw new Error('mdfinal-grade: row ' + row.id + ' returned ' + (Array.isArray(parts) ? parts.length : typeof parts) + ' parts');
            }
            parts.forEach(function (p, i) {
                if (!(typeof p === 'number' && p >= 0 && p <= row.parts[i].points + 1e-9)) {
                    throw new Error('mdfinal-grade: row ' + row.id + ' part ' + row.parts[i].id + ' out of range');
                }
            });
            var score = parts.reduce(function (a, b) { return a + b; }, 0);
            return { id: row.id, phase: row.phase, objective: row.objective, max: row.points, implemented: true, score: score, parts: parts };
        });
        var penalties = CH.PENALTIES.map(function (p) {
            return { id: p.id, phase: p.phase, points: p.points, applied: p.applies(view) === true };
        });
        var phases = {};
        rows.forEach(function (r) {
            var ph = phases[r.phase] || (phases[r.phase] = { raw: 0, max: 0, penalty: 0, implemented: true });
            ph.max += r.max;
            if (r.implemented) { ph.raw += r.score; } else { ph.implemented = false; }
        });
        penalties.forEach(function (p) { if (p.applied) { phases[p.phase].penalty += p.points; } });
        var total = 0, implementedMax = 0;
        Object.keys(phases).forEach(function (k) {
            var ph = phases[k];
            ph.score = ph.implemented ? Math.max(0, ph.raw - ph.penalty) : null;
            if (ph.implemented) { total += ph.score; implementedMax += ph.max; }
        });
        return { rows: rows, penalties: penalties, phases: phases, total: total, display: r2(total), implementedMax: implementedMax };
    }

    module.exports = { buildAnswerKey: CORE.buildAnswerKey, grade: grade, r2: r2 };
})();
