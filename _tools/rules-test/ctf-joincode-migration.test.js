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
 * `tournaments/{id}/private/config`, rules-denied to every client, with `hasJoinCode` as the
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
    let i = src.indexOf('{', start), depth = 0, inStr = null, prev = '';
    for (; i < src.length; i++) {
        const c = src[i];
        if (inStr) {
            if (c === inStr && prev !== '\\') inStr = null;
        } else if (c === '"' || c === "'" || c === '`') inStr = c;
        else if (c === '{') depth++;
        else if (c === '}') { depth--; if (depth === 0) { i++; break; } }
        prev = c;
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

    await testEnv.cleanup();
    console.log(`\n  ${pass} passed, ${fail} failed\n`);
    process.exitCode = fail === 0 ? 0 : 1;
})().catch(e => { console.error('SUITE FAILED:', e); process.exit(1); });
