#!/usr/bin/env node
/**
 * home-directory-rules.test.js
 *
 * @catalog what    Runs the REAL firestore.rules against the Firestore emulator and proves a
 * @catalog what    student can read every subcollection the Home Directory page needs, and still
 * @catalog what    cannot write the server-issued ones.
 * @catalog run     node _tools/hexos/home-directory-rules.test.js
 * @catalog status  GATE
 *
 * WHY THIS EXISTS
 * ---------------
 * The Home Directory page reads four subcollections under users/{uid}. Two of them --
 * server_awards and quiz_attempts -- had NO match block in firestore.rules at all, and Firestore
 * is deny-by-default for anything unmatched. So every signed-in student reading their OWN records
 * would have received permission-denied, forever: zero server-proven badges and zero ledger
 * quizzes on every load, for everyone.
 *
 * Nothing caught it, and the reason is the point of this file. The page's own gate asserts on
 * source text (does home.html contain 'server_awards', is it assigned to src.serverAwards). My
 * browser verification stubbed window.firebaseFirestore wholesale, which bypasses Security Rules
 * entirely -- a mocked SDK cannot fail a rules check, so it reported success against a
 * configuration that could never work in production. A reviewer found it by running the real rules
 * against the emulator, which is what this file now does on every deploy.
 *
 * NO PRODUCTION CONTACT. `firebase emulators:exec --only firestore` starts a local Firestore and
 * nothing else -- no functions codebase, so functions/.env is never loaded and no webhook can
 * fire. That distinction matters here: the standing rule is that tests must not reach production
 * side effects, and an emulator run that loaded functions would violate it.
 *
 * SKIPS, LOUDLY, if the firebase CLI is unavailable. A gate that silently passes when it could not
 * run is worse than no gate; this one exits non-zero and says what it could not verify.
 */

'use strict';
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const REPO = path.resolve(__dirname, '../..');

// The four the page reads, plus what each must permit. Writes are Cloud-Function-only for the
// server-issued stores: granting the owner READ must not have granted write.
const PROBE = `
const { initializeTestEnvironment, assertSucceeds, assertFails } =
    require('${path.join(REPO, 'node_modules/@firebase/rules-unit-testing')}');
const fs = require('fs');

(async () => {
    const env = await initializeTestEnvironment({
        projectId: 'hexworth-rules-probe',
        firestore: { rules: fs.readFileSync('${path.join(REPO, 'firestore.rules')}', 'utf8'), host: '127.0.0.1', port: 8080 }
    });
    // Seed as admin so the documents exist regardless of write rules.
    await env.withSecurityRulesDisabled(async (ctx) => {
        const db = ctx.firestore();
        for (const c of ['server_awards', 'quiz_attempts', 'gates', 'flag_captures']) {
            await db.doc('users/student1/' + c + '/doc1').set({ seeded: true });
        }
    });
    const mine = env.authenticatedContext('student1').firestore();
    const other = env.authenticatedContext('student2').firestore();
    const out = { read: {}, otherRead: {}, write: {} };
    for (const c of ['server_awards', 'quiz_attempts', 'gates', 'flag_captures']) {
        try { await assertSucceeds(mine.collection('users/student1/' + c).get()); out.read[c] = true; }
        catch (e) { out.read[c] = false; }
        try { await assertFails(other.collection('users/student1/' + c).get()); out.otherRead[c] = 'denied'; }
        catch (e) { out.otherRead[c] = 'ALLOWED'; }
        try { await assertFails(mine.doc('users/student1/' + c + '/forged').set({ x: 1 })); out.write[c] = 'denied'; }
        catch (e) { out.write[c] = 'ALLOWED'; }
    }
    console.log('PROBE_RESULT ' + JSON.stringify(out));
    await env.cleanup();
})().catch((e) => { console.log('PROBE_ERROR ' + e.message); process.exit(3); });
`;

let pass = 0, fail = 0;
const chk = (n, c, d) => {
    c ? pass++ : fail++;
    console.log(`  ${c ? 'ok  ' : 'FAIL'} ${n}${c ? '' : '  <- ' + String(d).slice(0, 110)}`);
};

if (!fs.existsSync(path.join(REPO, 'node_modules/@firebase/rules-unit-testing'))) {
    console.error('  @firebase/rules-unit-testing not installed; the real rules cannot be exercised.');
    console.error('  Refusing to report a pass for a check that did not run.');
    process.exit(2);
}

const probeFile = path.join(os.tmpdir(), 'hexworth-rules-probe-' + process.pid + '.js');
fs.writeFileSync(probeFile, PROBE);

let raw = '';
try {
    raw = execFileSync('firebase',
        ['emulators:exec', '--only', 'firestore', '--project', 'hexworth-rules-probe',
         `node ${probeFile}`],
        { cwd: REPO, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], timeout: 240000 });
} catch (e) {
    raw = (e.stdout || '') + (e.stderr || '');
    if (!/PROBE_RESULT/.test(raw)) {
        console.error('  emulator run failed, so the rules were NOT verified:');
        console.error('  ' + String(raw).split('\n').filter(Boolean).slice(-4).join('\n  '));
        try { fs.unlinkSync(probeFile); } catch (x) {}
        process.exit(2);
    }
} finally {
    try { fs.unlinkSync(probeFile); } catch (x) {}
}

const m = raw.match(/PROBE_RESULT (\{.*\})/);
if (!m) { console.error('  no probe result; nothing verified.'); process.exit(2); }
const r = JSON.parse(m[1]);

['server_awards', 'quiz_attempts', 'gates', 'flag_captures'].forEach((c) => {
    chk(`a student CAN read their own users/{uid}/${c}`, r.read[c] === true,
        'deny-by-default: the Home Directory would show a permanent read failure for this');
    chk(`another student CANNOT read it`, r.otherRead[c] === 'denied', r.otherRead[c]);
});
// The server-issued stores must stay write-protected. Granting read must not have granted write.
['server_awards', 'quiz_attempts'].forEach((c) => {
    chk(`${c} is still NOT client-writable`, r.write[c] === 'denied',
        'tamper-evidence depends on this being Cloud-Function-only');
});

console.log(`\n  ${pass}/${pass + fail} passed`);
process.exitCode = fail ? 1 : 0;
