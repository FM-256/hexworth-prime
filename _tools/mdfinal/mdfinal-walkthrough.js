#!/usr/bin/env node
/**
 * mdfinal-walkthrough.js — QC runner for the MD-100 final engine.
 *
 * @catalog what    --qc N: every profile x variant class plus N random seeds must score 100.00 by
 * @catalog what    the canonical walk; --print-steps: per-variant step counts (Chris's step-count
 * @catalog what    proxy, spec 13.5 item 1); --print-weights: the 3.5/3.6 tables derived from CHECKS.
 * @catalog what    --student <uid> [--rehearsal]: one student's answer sheet (edition, channel, key,
 * @catalog what    resiliency, fault, ticket, accepted evidence and verification) for staff marking
 * @catalog what    and disputes. Needs the bound secret in MDFINAL_SEED_SECRET; never prints it.
 * @catalog run     node _tools/mdfinal/mdfinal-walkthrough.js --qc 300 | --print-steps | --print-weights
 * @catalog run     MDFINAL_SEED_SECRET=... node _tools/mdfinal/mdfinal-walkthrough.js --student <uid>
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

/* ── one student's answer sheet (spec 8 D10: "Solutions key doc (--student <uid>), run by the
 * operator with the secret"). The secret comes ONLY from the environment, never an argument (an
 * argument lands in shell history), and is never printed. The sheet is the student's key: print it
 * to a private place, never to a shared channel. ── */
const si = argv.indexOf('--student');
if (si >= 0) {
    const FAULTS = kit.req('mdfinal-faults.js');
    const ANS = kit.req('mdfinal-answers.js');
    const EXAMS = kit.req('mdfinal-exams.js');
    const uid = argv[si + 1];
    const examId = flag('--rehearsal') ? EXAMS.REHEARSAL_EXAM_ID : EXAMS.DEFAULT_EXAM_ID;
    const rawSecret = process.env.MDFINAL_SEED_SECRET || '';
    /* trimmed as the engine trims it (deriveKey), so stray whitespace cannot produce a silently wrong
     * sheet or slip a test secret past the refusal (Mallory R5 L5) */
    const secret = rawSecret.trim();
    if (secret !== rawSecret) { console.log('Note: MDFINAL_SEED_SECRET had leading or trailing whitespace; it was trimmed.'); }
    if (!uid || uid[0] === '-') { console.log('Usage: MDFINAL_SEED_SECRET=... node mdfinal-walkthrough.js --student <uid> [--rehearsal]'); process.exit(2); }
    if (!secret || secret === kit.TEST_SECRET || secret === kit.ALT_SECRET) { console.log('Set MDFINAL_SEED_SECRET to the bound exam secret (the test secrets are refused).'); process.exit(2); }
    const opts = { secret };
    const key = CORE.buildAnswerKey(uid, examId, opts);
    const state = CORE.generate(uid, examId, opts);
    const wo = state.wo, f = FAULTS.CATALOGUE[key.variant];
    /* the evidence set as it will stand for this student: domain events only on a domain work order */
    const probe = { identity: { membership: { type: wo.join.type, pending: null } } };
    const evidence = FAULTS.evidenceSet(probe, key);
    const lines = [
        'MD-100 final answer sheet: ' + uid + ' (' + examId + ', generator ' + key.version + ')',
        'Work order ' + wo.ticket + ', hostname ' + wo.hostname + ', technician ' + key.technician,
        'Edition: Windows 11 ' + key.edition + '; channel ' + key.channel + '; expected key ' + (key.channel === 'KMS' ? key.productKey + ' with /skms ' + wo.network.kms.fqdn + ' or ' + wo.network.kms.ip : wo.mak + ' (the work order MAK)'),
        'Storage space resiliency: ' + key.resiliency,
        'Fault ' + key.variant + ' (' + f.category + '): "' + f.ticket + '"',
        '  KB-B ' + key.fault.kb + ', driver ' + key.fault.driverInf + ', decoy IP ' + key.fault.decoyIp,
        '  I1 accepted: ' + f.category,
        '  I2 accepted (normalised): ' + evidence.join(', '),
        '  I3 accepted: ' + Object.keys(f.verify).join(' | ') + ' (with the matching event after the fix)',
        '  qualifying diagnostics: ' + f.diag.join(', '),
        '  credited fix events: ' + f.fix.join(', '),
        'B1: the first 8 characters of the recovery-password protector ID the student created (read from their sitting); B2: the method they set (expected XTS-AES 256).',
        'P8 field labels: ' + Object.keys(ANS.FIELDS).map((k) => k + ' ' + ANS.FIELDS[k].label).join('; ')
    ];
    console.log(lines.join('\n'));
}

