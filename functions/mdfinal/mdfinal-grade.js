/* ═══════════════════════════════════════════════════════════════════════════════════════════════
 * mdfinal-grade.js — answer key and grading for the MD-100 final.
 *
 * Design spec: _docs/operations/md100-final-exam-spec-v2-2026-11-03.md, sections 3 and 5, 13.3.
 *
 * The key is built by the generator from the same draft as the state (mdfinal-core.js), so the two
 * cannot disagree; graders read it from here. grade() runs every CHECKS row whose check() exists
 * and reports the rest as not implemented, never as 0. Part values stay unrounded; only displayed
 * values are rounded to 0.01 (3.1). Penalties deduct within their phase, floor 0.
 * gradeSitting() grades a stored sitting, including a provisioned one (2.5).
 * ═══════════════════════════════════════════════════════════════════════════════════════════════ */
(function () {
    'use strict';

    var CORE = require('./mdfinal-core.js');
    var CH = require('./mdfinal-checks.js');

    /* Rounds a displayed value to 0.01. */
    function r2(x) { return Math.round(x * 100) / 100; }

    /* Grades a sitting against the frozen key. `state` is the handover snapshot (or the final state
     * when never handed over); `final` is the final state, read by the P7 and P8 rows. */
    function grade(state, key, final) {
        var view = { s: state, k: key, f: final || state };
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
        return tally(rows, penalties, view.f);
    }

    /* Phase scores, total and the declared P7 reason from graded rows and penalties. Shared by grade()
     * and gradeSitting(), so a merged report is totalled by the same code as a plain one. */
    function tally(rows, penalties, f) {
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
        /* declared reasons for a P7 row of 0 (spec 3.3) */
        var reason = null;
        if (!f.handedOver) { reason = 'no-handover'; } else if (!f.fault) { reason = 'no-os'; }
        else if (f.sys && f.sys.reset) { reason = 'reset'; } else if (f.fault.reinstalled) { reason = 'reinstalled'; }
        return { rows: rows, penalties: penalties, phases: phases, total: total, display: r2(total), implementedMax: implementedMax, p7Reason: reason };
    }

    /* Grades one sitting from its stored parts: `final`, the handover `snapshot` (null when never
     * handed over) and the provision `p1Snapshot` (null unless staff provisioned the PC, spec 2.5).
     * A provisioned sitting takes its P1 rows and P1 penalties from the PC as it stood before the
     * rescue; every other row is graded as usual. `carriedPenalties` lists penalty ids an earlier,
     * self-reset attempt incurred. */
    function gradeSitting(parts, key) {
        var final = parts.final;
        var g = grade(parts.snapshot || final, key, final);
        var carried = Array.isArray(parts.carriedPenalties) ? parts.carriedPenalties : [];
        if (!parts.p1Snapshot && !carried.length) { return g; }
        var g1 = parts.p1Snapshot ? grade(parts.p1Snapshot, key, final) : g;
        var rows = g.rows.map(function (r, i) { return r.phase === 'P1' ? g1.rows[i] : r; });
        /* A penalty an earlier attempt of this sitting incurred still applies after a self-reset
         * (13.5 item 6.4), so a reset cannot erase a destructive act. */
        var pens = g.penalties.map(function (p, i) {
            var q = p.phase === 'P1' ? g1.penalties[i] : p;
            return carried.indexOf(q.id) >= 0 && !q.applied ? { id: q.id, phase: q.phase, points: q.points, applied: true, carried: true } : q;
        });
        var out = tally(rows, pens, final);
        if (parts.p1Snapshot) { out.provisioned = true; }
        return out;
    }

    /* Ids of the penalties a state incurs as it stands (what a reset carries forward), optionally one phase's. */
    function appliedPenalties(state, key, phase) {
        return grade(state, key, state).penalties.filter(function (p) { return p.applied && (!phase || p.phase === phase); }).map(function (p) { return p.id; });
    }

    /* Points earned and available per syllabus objective (primary tags, 3.6). */
    function objectiveTotals(g) {
        var out = {};
        g.rows.forEach(function (r) {
            var o = out[r.objective] || (out[r.objective] = { earned: 0, max: 0 });
            o.max += r.max; if (r.implemented) { o.earned += r.score; }
        });
        Object.keys(out).forEach(function (k) { out[k].earned = r2(out[k].earned); });
        return out;
    }

    /* What a student is shown after submit: totals per phase and objective, never per check (spec R5/R7). */
    function studentReport(g) {
        var phases = {};
        Object.keys(g.phases).forEach(function (k) { phases[k] = { score: r2(g.phases[k].score || 0), max: g.phases[k].max }; });
        return { total: g.display, outOf: 100, phases: phases, objectives: objectiveTotals(g) };
    }

    /* One CSV line per sitting for the instructor: id, total, every row's score, applied penalties. */
    function toCsv(rows) {
        var head = ['studentId', 'total'].concat(CH.CHECKS.map(function (c) { return 'row' + c.id; })).concat(['penalties', 'flags']);
        var esc = function (v) { var t = String(v === undefined || v === null ? '' : v); return /[",\n]/.test(t) ? '"' + t.split('"').join('""') + '"' : t; };
        return [head.join(',')].concat(rows.map(function (x) {
            var g = x.grade;
            return [x.studentId, g.display].concat(g.rows.map(function (r) { return r.implemented ? r2(r.score) : ''; }))
                .concat([g.penalties.filter(function (p) { return p.applied; }).map(function (p) { return p.id; }).join(' '), (x.flags || []).join(' ')]).map(esc).join(',');
        })).join('\n');
    }

    module.exports = { buildAnswerKey: CORE.buildAnswerKey, grade: grade, gradeSitting: gradeSitting, appliedPenalties: appliedPenalties, r2: r2, objectiveTotals: objectiveTotals, studentReport: studentReport, toCsv: toCsv };
})();
