#!/usr/bin/env node
/**
 * ctf-joincode-migration.test.js
 *
 * @catalog what   Runs the SHIPPED migrateJoinCode from console.html against a rules-enforced
 *                 Firestore emulator: COPY moves a legacy public join code into private/config
 *                 and marks the tournament gated, PURGE removes the public field only after
 *                 verifying the private copy, and neither invents a code for an ungated event.
 * @catalog run    firebase emulators:exec --only firestore --project=demo-hexworth "NODE_PATH=$(pwd)/node_modules node _tools/rules-test/ctf-joincode-migration.test.js"
 * @catalog status TOOL
 *
 * WHY IT EXISTS (taskboard 411). TOURN-03 proved the join code gated nothing, built the fix —
 * `tournaments/{id}/private/config`, rules-denied to every NON-ADMIN client, with `hasJoinCode` as the
 * public boolean — and wired CREATION to it. Nothing ever migrated the tournaments that already
 * existed. Measured against production 2026-09-19: BOTH live tournaments had no private doc and a
 * 7-character code sitting on an `allow read: if true` document, so `ctfJoinTeam` took its legacy
 * fallback and a stranger could read the code with one unauthenticated REST GET and join an
 * ACTIVE event. Rotating the code does not fix that; a new value in the same field is equally
 * published.
 *
 * WHY IT EXTRACTS RATHER THAN REIMPLEMENTS. The function under test lives in a 508KB inline
 * script in an HTML file. A test that reimplements its logic proves the test author's
 * understanding, not the shipped behaviour, and the two drift the moment someone edits the page.
 * This brace-matches the real `window.migrateJoinCode` out of `_app/admin/console.html` and
 * executes it unmodified, which is the same discipline Chris applied to migrateFlagSecrets.
 *
 * WHAT THIS HARNESS CANNOT SEE, measured rather than assumed. Chris checked the eval-of-extracted
 * -source technique and found a real blind spot: the shim's `document.getElementById` returns the
 * SAME mock object whatever id string it is passed, so an id MISMATCH between the page's markup and
 * the code reading it would be completely invisible here — every assertion would still pass while
 * the real console rendered nothing. What this proves is control flow, transaction semantics and
 * prompt branching under enforced rules; it does NOT prove DOM wiring. That half was closed by
 * inspection instead: the onclick attributes name these exact functions, and `ctfJoinCodeMigrateReport`
 * and `ctfEditJoinCode` both exist in the markup. If you add a new element id to these handlers,
 * this suite will not catch you mistyping it.
 * Also inherited, not new: the emulator's authenticatedContext(..., {admin:true}) injects the admin
 * claim directly rather than minting a real Firebase Auth token — the same assumption the
 * already-passed flag-secrets suite relies on.
 *
 * WHAT THIS FILE DOES NOT COVER, deliberately. That the gate still REJECTS a wrong code once the
 * value lives in private/config is already proven by `ctf-joincode-gate.test.js`, which drives
 * the real ctfJoinTeam ("right code -> admitted, wrong -> refused, hasJoinCode with no doc ->
 * refused"). Post-migration state is exactly that suite's primary fixture, so duplicating it here
 * would add a second place to maintain the same assertion. Rules-level inaccessibility of the
 * private doc is covered by `tournament-joincode.test.js`.
 */
const { initializeTestEnvironment } = require('@firebase/rules-unit-testing');
const { doc, getDoc, getDocs, collection, setDoc, runTransaction, deleteField, serverTimestamp } = require('firebase/firestore');
const fs = require('fs');
const path = require('path');

let pass = 0, fail = 0;
const chk = (n, ok, d) => { console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${n}${d ? ' :: ' + d : ''}`); ok ? pass++ : fail++; };

/* Pull the real function out of the page by matching braces from its declaration. Regex alone
 * cannot find the end of a function containing nested braces and template strings. */
function extractShipped(name) {
    /* CONSOLE_PATH exists so this suite can be pointed at a deliberately broken copy of the
     * page to prove it is sensitive to the behaviour it claims to check. A suite that has
     * never been shown to fail is not evidence. */
    const src = fs.readFileSync(process.env.CONSOLE_PATH || path.join(__dirname, '..', '..', '_app', 'admin', 'console.html'), 'utf8');
    const start = src.indexOf(`window.${name} = async function(`);
    if (start === -1) throw new Error(`${name} not found in console.html — did it get renamed?`);
    /* MUST SKIP COMMENTS, NOT JUST STRINGS. The first version tracked quotes only, so an
     * apostrophe inside a block comment ("the card's own claim") opened a phantom string, brace
     * tracking desynchronised, and extraction ran 43230 chars past the end of the function —
     * failing loudly with a SyntaxError rather than silently, which is the only reason it was
     * caught. A heavily commented codebase makes this the common case, not an edge one. */
    let i = src.indexOf('{', start), depth = 0, inStr = null;
    for (; i < src.length; i++) {
        const c = src[i], next2 = src.substr(i, 2);
        if (inStr) {
            if (c === '\\') { i++; continue; }          // escape: skip the next char entirely
            if (c === inStr) inStr = null;
            continue;
        }
        if (next2 === '//') { const nl = src.indexOf('\n', i); if (nl === -1) break; i = nl; continue; }
        if (next2 === '/*') { const close = src.indexOf('*/', i + 2); if (close === -1) break; i = close + 1; continue; }
        if (c === '"' || c === "'" || c === '`') { inStr = c; continue; }
        if (c === '{') depth++;
        else if (c === '}') { depth--; if (depth === 0) { i++; break; } }
    }
    return src.slice(start, i) + ';';
}

(async () => {
    console.log('\n== ctf join code migration (shipped code, rules enforced) ==');

    const testEnv = await initializeTestEnvironment({
        projectId: 'demo-hexworth',
        firestore: { rules: fs.readFileSync(path.join(__dirname, '..', '..', 'firestore.rules'), 'utf8') },
    });

    const adminDb = testEnv.authenticatedContext('adminUser', { admin: true }).firestore();
    const studentDb = testEnv.authenticatedContext('someStudent').firestore();

    /* FIXTURES — one per shape that exists or can exist in real data. */
    await testEnv.withSecurityRulesDisabled(async (c) => {
        const d = c.firestore();
        // legacy: exactly production's two tournaments
        await setDoc(doc(d, 'tournaments/t-legacy'), { name: 'Legacy Event', status: 'active', joinCode: 'HEX-LEG' });
        // already migrated: private holds it, public field already gone
        await setDoc(doc(d, 'tournaments/t-migrated'), { name: 'Migrated', status: 'lobby', hasJoinCode: true });
        await setDoc(doc(d, 'tournaments/t-migrated/private/config'), { joinCode: 'HEX-MIG' });
        // both present: private written but public never cleaned
        await setDoc(doc(d, 'tournaments/t-both'), { name: 'Both', status: 'lobby', hasJoinCode: true, joinCode: 'HEX-BOTH' });
        await setDoc(doc(d, 'tournaments/t-both/private/config'), { joinCode: 'HEX-BOTH' });
        // half-written creation: claims a code, has none anywhere (Nancy's case)
        await setDoc(doc(d, 'tournaments/t-orphan'), { name: 'Orphan', status: 'lobby', hasJoinCode: true });
        // genuinely ungated: never had a code
        await setDoc(doc(d, 'tournaments/t-open'), { name: 'Open Event', status: 'lobby' });
        // private/config carrying unrelated config, to prove merge does not clobber
        await setDoc(doc(d, 'tournaments/t-extra'), { name: 'Extra', status: 'lobby', joinCode: 'HEX-EXT' });
        await setDoc(doc(d, 'tournaments/t-extra/private/config'), { somethingElse: 'keep-me' });
    });

    /* Shims. The report element and toast are the only browser surfaces the function touches. */
    const report = { textContent: '' };
    global.document = { getElementById: () => report };
    global.showToast = () => {};
    global.window = global;
    global._firestoreModule = { doc, getDoc, getDocs, collection, setDoc, runTransaction, deleteField, serverTimestamp };
    global._ctfEditingId = null;
    global.db = adminDb;

    const shipped = extractShipped('migrateJoinCode');
    chk('extracted the shipped function, not a copy', shipped.includes('NO_CODE_AND_NO_SOURCE') && shipped.length > 1500, `${shipped.length} chars`);
    eval(shipped);

    // ── COPY ────────────────────────────────────────────────────────────────
    report.textContent = '';
    await global.migrateJoinCode('copy', true);
    const copyOut = report.textContent;

    const priv = async (id) => {
        let got = null;
        await testEnv.withSecurityRulesDisabled(async (c) => {
            const s = await getDoc(doc(c.firestore(), `tournaments/${id}/private/config`));
            got = s.exists() ? s.data() : null;
        });
        return got;
    };
    const pub = async (id) => {
        let got = null;
        await testEnv.withSecurityRulesDisabled(async (c) => {
            const s = await getDoc(doc(c.firestore(), `tournaments/${id}`));
            got = s.exists() ? s.data() : null;
        });
        return got;
    };

    const legacyPriv = await priv('t-legacy'), legacyPub = await pub('t-legacy');
    chk('COPY: legacy code now in private/config', legacyPriv && legacyPriv.joinCode === 'HEX-LEG');
    chk('COPY: legacy tournament marked hasJoinCode (fails CLOSED later)', legacyPub.hasJoinCode === true);
    chk('COPY: public field LEFT in place, so a running event keeps working', legacyPub.joinCode === 'HEX-LEG');
    chk('COPY: reported it', /copied t-legacy/.test(copyOut), copyOut.split('\n').find(l => l.includes('t-legacy')) || '');

    chk('COPY: already-private tournament untouched', (await priv('t-migrated')).joinCode === 'HEX-MIG' && /already private: /.test(copyOut));

    const openPub = await pub('t-open');
    chk('COPY: ungated event did NOT get an invented code', (await priv('t-open')) === null);
    chk('COPY: ungated event was NOT marked gated (would lock joins)', openPub.hasJoinCode !== true);
    chk('COPY: ungated event is REPORTED, not silently skipped', /NO CODE AT ALL/.test(copyOut) && /t-open/.test(copyOut));

    chk('COPY: orphan claiming a code it lacks is flagged for attention', /NEEDS ATTENTION/.test(copyOut) && /t-orphan/.test(copyOut) && /CLAIMS a code/.test(copyOut));

    const extraPriv = await priv('t-extra');
    chk('COPY: merge preserved unrelated private config', extraPriv && extraPriv.somethingElse === 'keep-me' && extraPriv.joinCode === 'HEX-EXT');

    // ── PURGE ───────────────────────────────────────────────────────────────
    report.textContent = '';
    await global.migrateJoinCode('purge', true);
    const purgeOut = report.textContent;

    const legacyPub2 = await pub('t-legacy');
    chk('PURGE: public joinCode removed', legacyPub2.joinCode === undefined, `got ${JSON.stringify(legacyPub2.joinCode)}`);
    chk('PURGE: private copy still intact', (await priv('t-legacy')).joinCode === 'HEX-LEG');
    chk('PURGE: hasJoinCode still true, so the gate is still declared', legacyPub2.hasJoinCode === true);
    chk('PURGE: t-both cleaned too', (await pub('t-both')).joinCode === undefined && (await priv('t-both')).joinCode === 'HEX-BOTH');

    chk('PURGE: refuses the orphan rather than deleting evidence', /t-orphan/.test(purgeOut) && /no code anywhere/.test(purgeOut));
    chk('PURGE: ungated event left completely alone', (await pub('t-open')).joinCode === undefined && (await priv('t-open')) === null);
    chk('PURGE: run reports zero backfills on a clean sequence', /BACKFILLED: 0/.test(purgeOut), purgeOut.split('\n').find(l => l.includes('purged:')) || '');

    // ── The backfill path must actually work, not just be unreached ─────────
    await testEnv.withSecurityRulesDisabled(async (c) => {
        const d = c.firestore();
        await setDoc(doc(d, 'tournaments/t-straggler'), { name: 'Straggler', status: 'lobby', joinCode: 'HEX-STR' });
    });
    report.textContent = '';
    await global.migrateJoinCode('purge', true);
    const backfillOut = report.textContent;
    chk('PURGE: a pre-fix tournament appearing AFTER copy is backfilled, then purged',
        (await priv('t-straggler')).joinCode === 'HEX-STR' && (await pub('t-straggler')).joinCode === undefined);
    chk('PURGE: that backfill is reported as NOT clean', /BACKFILLED: 1/.test(backfillOut) && /NOT clean/.test(backfillOut));

    // ── The point of the whole exercise ─────────────────────────────────────
    let studentCanRead = true;
    try { const s = await getDoc(doc(studentDb, 'tournaments/t-legacy/private/config')); studentCanRead = s.exists(); }
    catch (e) { studentCanRead = false; }
    chk('a signed-in student CANNOT read the migrated code', studentCanRead === false);

    let pubHasCode = null;
    try { const s = await getDoc(doc(studentDb, 'tournaments/t-legacy')); pubHasCode = s.data().joinCode; } catch (e) { pubHasCode = 'READ_FAILED'; }
    chk('the public doc a student CAN read no longer carries the code', pubHasCode === undefined, `got ${JSON.stringify(pubHasCode)}`);

    /* ── COPY MUST BE ATOMIC AND MUST NOT LET ONE FAILURE KILL THE BATCH ──────────────────
     * Nancy's finding: the first version did two bare awaits outside any try/catch, so a throw on
     * the second aborted the for...of and the run never printed its summary — a silent partial
     * migration that looked complete. These two cases are the regression tests for that. */
    await testEnv.withSecurityRulesDisabled(async (c) => {
        const d = c.firestore();
        await setDoc(doc(d, 'tournaments/t-batch-a'), { name: 'Batch A', status: 'lobby', joinCode: 'HEX-AAA' });
        await setDoc(doc(d, 'tournaments/t-batch-boom'), { name: 'Batch Boom', status: 'lobby', joinCode: 'HEX-BOOM' });
        await setDoc(doc(d, 'tournaments/t-batch-z'), { name: 'Batch Z', status: 'lobby', joinCode: 'HEX-ZZZ' });
    });

    /* Make the FIRST transaction of the run throw, leaving every later one to succeed. That is
     * precisely the shape of the bug: one tournament blips, and the question is whether the rest of
     * the batch still runs and whether the operator is told. Tournament ids are processed sorted,
     * so the casualty is t-batch-a and t-batch-z comes after it. */
    const realRunTransaction = runTransaction;
    let calls = 0;
    global._firestoreModule = {
        doc, getDoc, getDocs, collection, setDoc, deleteField, serverTimestamp,
        runTransaction: async (dbArg, fn) => {
            calls++;
            if (calls === 1) throw new Error('simulated network blip');
            return realRunTransaction(dbArg, fn);
        },
    };
    eval(shipped);              // re-bind the shipped function to the wrapped module
    report.textContent = '';
    /* Capture instead of propagating: an UNPROTECTED copy rejects out of the handler, which in the
     * browser is an unhandled rejection with a dead loop. Swallowing it here lets the assertions
     * below measure what the OPERATOR would have seen, rather than killing the suite. */
    let batchRejected = null;
    try { await global.migrateJoinCode('copy', true); } catch (e) { batchRejected = e.message; }
    const batchOut = report.textContent;
    global._firestoreModule = { doc, getDoc, getDocs, collection, setDoc, runTransaction, deleteField, serverTimestamp };
    eval(shipped);              // restore

    chk('COPY: the run did not reject out of the handler', batchRejected === null, batchRejected || 'no rejection');
    chk('COPY: a failing tournament is NAMED, not silent', /FAILED |copy failed/.test(batchOut), batchOut.split('\n').find(l => /FAILED|failed:/.test(l)) || '(nothing)');
    chk('COPY: the batch CONTINUED past the failure (summary line printed)', /copied: \d+/.test(batchOut), batchOut.split('\n').find(l => l.startsWith('copied:')) || '(no summary — batch died)');
    chk('COPY: tournaments after the failure were still migrated', (await priv('t-batch-z')) !== null && (await priv('t-batch-z')).joinCode === 'HEX-ZZZ');

    /* Atomicity: no tournament may end up with a private copy but hasJoinCode still unset, which is
     * the state that voided the fail-closed guarantee. */
    let halfStates = [];
    for (const id of ['t-batch-a', 't-batch-boom', 't-batch-z', 't-legacy']) {
        const pv = await priv(id), pb = await pub(id);
        if (pv && pv.joinCode && pb && pb.hasJoinCode !== true) halfStates.push(id);
    }
    chk('COPY: no tournament has a private code without hasJoinCode (fail-closed holds)', halfStates.length === 0, halfStates.join(',') || 'none');

    /* ── ROTATE ───────────────────────────────────────────────────────────────────────────
     * Until this existed there was NO way to change a live code, and editing the public field
     * post-purge would have done nothing but re-publish a stale value. */
    const rotate = extractShipped('rotateJoinCode');
    chk('extracted the shipped rotate function', rotate.includes('getRandomValues') && rotate.includes('deleteField'), `${rotate.length} chars`);
    /* Recording shim: the WARNING text is part of the behaviour under test, not decoration. Nancy
     * found rotate told the operator "anyone holding the old code can no longer join" even when
     * there was no old code, which is how an intentionally-open event gets silently gated. */
    let lastPrompt = '', confirmAnswer = true;
    global.confirm = (msg) => { lastPrompt = msg; return confirmAnswer; };
    global._ctfEditingId = 't-legacy';
    eval(rotate);
    const beforeRotate = (await priv('t-legacy')).joinCode;
    await global.rotateJoinCode();
    const afterPriv = await priv('t-legacy'), afterPub = await pub('t-legacy');
    chk('ROTATE: the private code actually changed', afterPriv.joinCode !== beforeRotate, `${beforeRotate} -> (changed: ${afterPriv.joinCode !== beforeRotate})`);
    chk('ROTATE: new code matches the projector-safe format', /^HEX-[ABCDEFGHJKMNPQRSTUVWXYZ23456789]{4}$/.test(afterPriv.joinCode), afterPriv.joinCode);
    chk('ROTATE: ambiguous characters excluded (O,0,I,1,L)', !/[O0I1L]/.test(afterPriv.joinCode.slice(4)), afterPriv.joinCode);
    chk('ROTATE: public joinCode field absent afterwards', afterPub.joinCode === undefined);
    chk('ROTATE: hasJoinCode still true, so the gate is still declared', afterPub.hasJoinCode === true);
    chk('ROTATE: recorded when it happened', !!afterPriv.rotatedAt);

    /* A rotation on a tournament with a public field still present must also clear it — that is
     * the trap Nancy identified, where "rotating" re-publishes a value. */
    await testEnv.withSecurityRulesDisabled(async (c) => {
        await setDoc(doc(c.firestore(), 'tournaments/t-rot-legacy'), { name: 'Rot Legacy', status: 'lobby', joinCode: 'HEX-OLD' });
    });
    global._ctfEditingId = 't-rot-legacy';
    await global.rotateJoinCode();
    const rlPub = await pub('t-rot-legacy'), rlPriv = await priv('t-rot-legacy');
    chk('ROTATE: on a legacy tournament it removes the public field too', rlPub.joinCode === undefined, `got ${JSON.stringify(rlPub.joinCode)}`);
    chk('ROTATE: and the new code is private, not the old public one', rlPriv.joinCode !== 'HEX-OLD' && /^HEX-/.test(rlPriv.joinCode));
    chk('ROTATE: a coded tournament is warned about the OLD code dying', /old code can no longer join/.test(lastPrompt), lastPrompt.slice(0, 70));

    /* ── THE UNGATED CASE, which rotate used to decide silently ───────────────────────────
     * Every other path here treats "no code anywhere" as needing a human decision. Rotate forced
     * hasJoinCode:true and wrote a code regardless, so one click could gate a deliberately open
     * event with a code nobody had been told. */
    await testEnv.withSecurityRulesDisabled(async (c) => {
        await setDoc(doc(c.firestore(), 'tournaments/t-rot-open'), { name: 'Rot Open', status: 'lobby' });
    });
    global._ctfEditingId = 't-rot-open';
    confirmAnswer = false;                 // operator reads the warning and backs out
    lastPrompt = '';
    await global.rotateJoinCode();
    chk('ROTATE: ungated event gets a DISTINCT warning, not the old-code wording',
        /has NO join code/.test(lastPrompt) && /GATE it/.test(lastPrompt) && !/old code can no longer join/.test(lastPrompt),
        lastPrompt.slice(0, 90));
    const openAfterDecline = await pub('t-rot-open');
    chk('ROTATE: declining changes NOTHING', (await priv('t-rot-open')) === null && openAfterDecline.hasJoinCode !== true);

    confirmAnswer = true;                  // and it is still possible on purpose
    await global.rotateJoinCode();
    chk('ROTATE: accepting the warning does gate it', (await priv('t-rot-open')).joinCode && (await pub('t-rot-open')).hasJoinCode === true);

    /* ── THE ORPHAN CASE: claims a code, has none, so ctfJoinTeam refuses EVERY join.
     * Rotating is the repair, and the dialog should say so rather than talking about an old code. */
    await testEnv.withSecurityRulesDisabled(async (c) => {
        await setDoc(doc(c.firestore(), 'tournaments/t-rot-orphan'), { name: 'Rot Orphan', status: 'lobby', hasJoinCode: true });
    });
    global._ctfEditingId = 't-rot-orphan';
    lastPrompt = '';
    await global.rotateJoinCode();
    chk('ROTATE: orphan is described as BROKEN and repaired, not as a rotation',
        /NOBODY can/.test(lastPrompt) && /repair it/.test(lastPrompt), lastPrompt.slice(0, 90));
    chk('ROTATE: the orphan now actually has a code', !!(await priv('t-rot-orphan')).joinCode);

    await testEnv.cleanup();
    console.log(`\n  ${pass} passed, ${fail} failed\n`);
    process.exitCode = fail === 0 ? 0 : 1;
})().catch(e => { console.error('SUITE FAILED:', e); process.exit(1); });
