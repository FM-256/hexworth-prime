#!/usr/bin/env node
/**
 * completion-validation.test.js — BUG-264 validation, asserted rather than asserted-about
 *
 * @catalog what    Proves the completion registry accepts every id real students hold, rejects
 * @catalog what    fabricated ids, and that every live writer of modulesCompleted/labsCompleted
 * @catalog what    actually calls the guard. Runs offline against the committed snapshot.
 * @catalog run     node _tools/content/completion-validation.test.js
 * @catalog status  TOOL
 *
 * WHY THIS EXISTS
 * ---------------
 * Twice in one session I wrote "all fabricated ids rejected" and "all three callables validate"
 * into a commit message, and a reviewer proved both false by reading the source. The second time,
 * the guard had landed INSIDE an `if (type === 'quiz')` branch, so it protected one field and left
 * the two the bug is actually about wide open -- while the commit claimed the sweep was complete.
 *
 * The reviewer's question was the right one: WHERE DID THAT VERIFICATION ACTUALLY RUN? It ran as an
 * ad-hoc one-liner against a Set, never against the code path. So it could not have caught a guard
 * in the wrong scope, and it didn't.
 *
 * This file exists so the claim has an artifact. It fails loudly rather than being re-typed into a
 * commit message.
 *
 * WHAT IT CHECKS
 *   1. STRUCTURAL: every live writer of modulesCompleted/labsCompleted calls _isKnownCompletion,
 *      and in syncClassProgress the call is OUTSIDE the type branches. That is the specific defect
 *      that shipped, so it gets a specific test.
 *   2. ACCEPTANCE: every completion id in the committed snapshot is accepted. A rejection here
 *      means enforcement would delete work a student already earned.
 *   3. REJECTION: fabricated ids are refused.
 *
 * EXIT: 0 pass, 1 a check failed, 2 could not run.
 */
const fs = require('fs');
const path = require('path');

const REPO = path.resolve(__dirname, '../..');
let pass = 0, fail = 0;
const chk = (name, cond, detail) => {
    cond ? pass++ : fail++;
    console.log(`  ${cond ? 'ok  ' : 'FAIL'} ${name}${cond ? '' : '  <- ' + String(detail).slice(0, 160)}`);
};

function main() {
    const idx = fs.readFileSync(path.join(REPO, 'functions/index.js'), 'utf8');

    // ---- 1. STRUCTURAL -----------------------------------------------------------------
    // recordProgress: module and lab branches each guarded.
    const rec = idx.slice(idx.indexOf('exports.recordProgress = onCall'));
    const recBody = rec.slice(0, rec.indexOf('\n});'));
    chk('recordProgress module branch is guarded',
        /case 'module':[\s\S]{0,600}?_isKnownCompletion/.test(recBody), 'no guard before modulesCompleted');
    chk('recordProgress lab branch is guarded',
        /case 'lab':[\s\S]{0,600}?_isKnownCompletion/.test(recBody), 'no guard before labsCompleted');

    // syncProgress: incoming payload filtered.
    chk('syncProgress filters incoming modules',
        /localModules = [\s\S]{0,200}?_isKnownCompletion/.test(idx), 'localModules not filtered');
    chk('syncProgress filters incoming labs',
        /localLabs = [\s\S]{0,200}?_isKnownCompletion/.test(idx), 'localLabs not filtered');

    // submitEDTLab: guard immediately before the write.
    /* ORDERING, NOT PROXIMITY. This first asserted the guard appeared within 400 characters of the
       labsCompleted write. That is the wrong property twice over: it FAILED when the guard was
       moved EARLIER (which was the fix — the guard belongs with the input validation, before
       `edt_submissions` is written at all), and it would PASS a guard sitting after some other
       side effect as long as it was near the arrayUnion. Assert what actually matters: the guard
       runs before EVERY write in the function. Positions are computed from the function slice, and
       from the WRITE (`db.doc(...).set`), never from a mention of the collection name — an earlier
       version of this check matched a comment that merely named `edt_submissions`. */
    const edtStart = idx.indexOf('exports.submitEDTLab');
    const edt = idx.slice(edtStart, idx.indexOf('\n});', edtStart));
    const edtGuard = edt.indexOf('!_isKnownCompletion');
    const edtSubWrite = edt.search(/db\.doc\(`edt_submissions\//);
    const edtLabWrite = edt.indexOf('labsCompleted: FieldValue.arrayUnion');
    chk('submitEDTLab guard is present', edtGuard !== -1, 'no _isKnownCompletion call');
    chk('submitEDTLab guard runs BEFORE the edt_submissions write (no orphan doc)',
        edtGuard !== -1 && edtSubWrite !== -1 && edtGuard < edtSubWrite,
        `guard at ${edtGuard}, edt_submissions write at ${edtSubWrite}`);
    chk('submitEDTLab guard runs BEFORE the labsCompleted write',
        edtGuard !== -1 && edtLabWrite !== -1 && edtGuard < edtLabWrite,
        `guard at ${edtGuard}, labsCompleted write at ${edtLabWrite}`);

    /* syncClassProgress: THE ONE THAT SHIPPED WRONG. The guard must sit OUTSIDE the type branches.
       Asserting merely that _isKnownCompletion appears in the function would have PASSED the
       broken version, because it was present -- just scoped to the quiz branch. So assert ordering:
       the guard must appear BEFORE the first `if (type ===` in the function body. */
    const scpStart = idx.indexOf('exports.syncClassProgress');
    const scp = idx.slice(scpStart, idx.indexOf('\n});', scpStart));
    const guardAt = scp.indexOf('!_isKnownCompletion');
    const firstTypeBranch = scp.indexOf("if (type ===");
    chk('syncClassProgress guard is present', guardAt !== -1, 'no _isKnownCompletion call');
    chk('syncClassProgress guard runs BEFORE the type branches (not inside one)',
        guardAt !== -1 && firstTypeBranch !== -1 && guardAt < firstTypeBranch,
        `guard at ${guardAt}, first type branch at ${firstTypeBranch} — guard is inside a branch`);

    // ---- 2. ACCEPTANCE -----------------------------------------------------------------
    const reg = JSON.parse(fs.readFileSync(path.join(REPO, 'functions/completion-registry.json'), 'utf8'));
    const R = new Set(reg.ids);
    const snapDir = path.join(REPO, '_tools/progress-snapshot/snapshots');
    if (!fs.existsSync(snapDir) || !fs.readdirSync(snapDir).length) {
        console.log('  SKIP acceptance — no snapshot present (run snapshot.js snapshot)');
    } else {
        const S = JSON.parse(fs.readFileSync(path.join(snapDir, fs.readdirSync(snapDir).sort()[0]), 'utf8'));
        let total = 0; const rejected = new Set();
        for (const u of Object.values(S.users)) {
            for (const f of ['modulesCompleted', 'labsCompleted'])
                for (const id of (u[f] || [])) { total++; if (!R.has(id)) rejected.add(id); }
            for (const q of Object.keys(u.quizzes || {})) { total++; if (!R.has(q)) rejected.add(q); }
        }
        chk(`every id a student already holds is accepted (${total} checked)`,
            rejected.size === 0, [...rejected].slice(0, 6).join(', '));
    }

    // ---- 3. REJECTION ------------------------------------------------------------------
    const forged = ['shield-fabricated-xyz-999', 'web-not-a-real-thing', 'lab_totally_made_up',
                    'ctf_fake99', 'anything-i-want-not-even-house-shaped', 'module_XXXXXX'];
    for (const f of forged) chk(`fabricated id rejected: ${f}`, !R.has(f), 'ACCEPTED by the registry');

    console.log(`\n  ${pass}/${pass + fail} passed`);
    return fail ? 1 : 0;
}

try { process.exit(main()); }
catch (e) { console.error('  completion-validation.test could not run:', e && e.message); process.exit(2); }
