#!/usr/bin/env node
/**
 * mdfinal-walkthrough.js — QC runner for the MD-100 final engine.
 *
 * @catalog what    --qc N: every profile x variant class plus N random seeds must score 100.00 by
 * @catalog what    the canonical walk; --print-steps: per-variant step counts (Chris's step-count
 * @catalog what    proxy, spec 13.5 item 1); --print-weights: the 3.5/3.6 tables derived from CHECKS.
 * @catalog run     node _tools/mdfinal/mdfinal-walkthrough.js --qc 300 | --print-steps | --print-weights
 * @catalog status  TOOL
 */
const kit = require('./mdfinal-test-kit.js');
const W = require('./mdfinal-walk.js');
const G = kit.req('mdfinal-grade.js');
const CH = kit.req('mdfinal-checks.js');
const CORE = kit.req('mdfinal-core.js');

const argv = process.argv.slice(2);
const flag = (f) => argv.indexOf(f) >= 0;

if (flag('--print-weights')) {
    const ph = {}, ob = {};
    CH.CHECKS.forEach((r) => { ph[r.phase] = (ph[r.phase] || 0) + r.points; ob[r.objective] = (ob[r.objective] || 0) + r.points; });
    console.log('Phase totals:     ' + Object.keys(ph).map((k) => k + ' ' + ph[k]).join(' · ') + ' = ' + Object.values(ph).reduce((a, b) => a + b, 0));
    console.log('Objective totals: ' + Object.keys(ob).map((k) => k + ':' + ob[k]).join(' ') + ' = ' + Object.values(ob).reduce((a, b) => a + b, 0));
    CH.CHECKS.forEach((r) => console.log('  ' + r.id.padEnd(4) + ' ' + r.phase + ' obj ' + r.objective + ' ' + String(r.points).padStart(2) + '  ' + r.title + '  [' + r.parts.map((p) => p.id + ' ' + p.points).join(', ') + ']'));
}

if (flag('--print-steps')) {
    for (const c of CORE.variantSpace()) {
        const r = W.perfect('steps-' + c.profileIndex + c.variantIndex, [c.profileIndex, c.variantIndex]);
        const L = r.state.ledger;
        const ho = L.findIndex((e) => e.k === 'handover');
        console.log(c.profile.padEnd(11) + ' ' + c.variant + '  P1-P6 ledger steps ' + String(ho).padStart(4) + '  P7 steps ' + String(L.length - ho - 1).padStart(3));
    }
}

const qi = argv.indexOf('--qc');
if (qi >= 0) {
    const n = Number(argv[qi + 1] || 0);
    let bad = 0, runs = 0;
    const check = (uid, forced) => {
        runs++;
        try { const r = W.perfect(uid, forced); const g = G.grade(r.snapshot, r.key, r.state); if (g.total !== 100) { bad++; console.log('NOT 100: ' + uid + ' ' + g.total); } }
        catch (e) { bad++; console.log('THREW: ' + uid + ' ' + e.message.slice(0, 160)); }
    };
    CORE.variantSpace().forEach((c) => check('qc-class-' + c.profileIndex + c.variantIndex, [c.profileIndex, c.variantIndex]));
    for (let i = 0; i < n; i++) check('qc-seed-' + i);
    console.log('qc: ' + runs + ' sittings, ' + bad + ' not 100');
    process.exitCode = bad ? 1 : 0;
}
