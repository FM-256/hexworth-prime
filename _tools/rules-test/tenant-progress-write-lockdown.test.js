// Mallory follow-up — verification for the 2026-09-27 firestore.rules tenant-progress WRITE lockdown.
//   - allow write: if request.auth != null && request.auth.uid == studentUid;
//   + (removed — denied by omission; every writer is Admin SDK inside a Cloud Function)
//
// @catalog what    Proves a student cannot forge their own gradebook row, and that the fix is what stops them
// @catalog run     firebase emulators:exec --only firestore --project=demo-hexworth "NODE_PATH=$(pwd)/node_modules node _tools/rules-test/tenant-progress-write-lockdown.test.js"
// @catalog status  TOOL
//
// WHY AN A/B AND NOT JUST A DENIAL TEST. A test that only asserts "denied" passes just as well
// against a rules file that denies everything, or one with a typo'd path that matches nothing. So
// every attack here runs TWICE: once against the real current rules (must DENY) and once against
// the pre-fix rules, reconstructed by putting the removed line back (must ALLOW). If the pre-fix
// run does not allow the write, the test is not measuring the fix and says so.
//
// --only firestore is deliberate: it keeps the functions emulator out, which loads functions/.env
// and would fire real webhooks (memory: feedback_tests_must_not_reach_production_side_effects).
const { initializeTestEnvironment, assertSucceeds, assertFails } = require('@firebase/rules-unit-testing');
const { doc, setDoc, updateDoc, getDoc } = require('firebase/firestore');
const fs = require('fs');
const path = require('path');

const RULES_PATH = path.resolve(__dirname, '../../firestore.rules');
const RULES_NOW = fs.readFileSync(RULES_PATH, 'utf8');

// Reconstruct the vulnerable version by restoring the exact line that was removed.
const ANCHOR = `        // WAS: \`allow write: if request.auth != null && request.auth.uid == studentUid;\``;
if (!RULES_NOW.includes(ANCHOR)) {
    console.error('SETUP FAILED: could not find the removal marker in firestore.rules.');
    console.error('The A/B cannot be constructed, so this test would only prove "denied" against an');
    console.error('unknown baseline. Refusing to report a pass.');
    process.exit(2);
}
const RULES_PREFIX = RULES_NOW.replace(ANCHOR,
    `        allow write: if request.auth != null && request.auth.uid == studentUid;\n${ANCHOR}`);
if (RULES_PREFIX === RULES_NOW) { console.error('SETUP FAILED: rules reconstruction was a no-op.'); process.exit(2); }

const TENANT = 'acme-college', CLASS = 'net-101', STUDENT = 'student-uid-1', OTHER = 'student-uid-2', ADMIN = 'admin-uid-1';
const PROG = `tenants/${TENANT}/classes/${CLASS}/progress/${STUDENT}`;
const LEGACY = `classes/${CLASS}/progress/${STUDENT}`;

let pass = 0, fail = 0; const out = [];
async function ok(name, p){ try { await assertSucceeds(p); out.push(['PASS', name]); pass++; }
  catch(e){ out.push(['FAIL (expected ALLOW, got DENY)', `${name} :: ${(e&&e.message||e).toString().replace(/\n/g,' ').slice(0,180)}`]); fail++; } }
async function no(name, p){ try { await assertFails(p); out.push(['PASS', `${name} [denied]`]); pass++; }
  catch(e){ out.push(['FAIL (expected DENY, got ALLOW)', name]); fail++; } }

// The forged row a student would write: a perfect score on a quiz never attempted.
const FORGERY = {
    modulesCompleted: ['forged-module-1', 'forged-module-2'],
    quizScores: { 'web-security-quiz': 100 },
    labsCompleted: ['forged-lab-1'],
    totalTimeSpent: 999999999
};

async function run(label, rules, expectForgery /* 'allow' | 'deny' */) {
    const env = await initializeTestEnvironment({
        projectId: 'demo-hexworth',
        firestore: { rules, host: '127.0.0.1', port: 8181 }
    });
    await env.clearFirestore();
    // Seed the tenant (for the adminUids read check) and an existing progress doc, rules off.
    await env.withSecurityRulesDisabled(async (ctx) => {
        const db = ctx.firestore();
        await setDoc(doc(db, `tenants/${TENANT}`), { adminUids: [ADMIN], name: 'Acme' });
        await setDoc(doc(db, PROG), { modulesCompleted: ['real-module'], quizScores: {} });
    });
    const student = env.authenticatedContext(STUDENT).firestore();
    const other   = env.authenticatedContext(OTHER).firestore();
    const admin   = env.authenticatedContext(ADMIN).firestore();

    const t = (n) => `[${label}] ${n}`;
    if (expectForgery === 'allow') {
        await ok(t('THE ATTACK: student overwrites own gradebook row with a forged 100%'), setDoc(doc(student, PROG), FORGERY, { merge: true }));
        await ok(t('THE ATTACK via updateDoc: student sets quizScores directly'), updateDoc(doc(student, PROG), { quizScores: { 'web-security-quiz': 100 } }));
    } else {
        await no(t('THE ATTACK: student overwrites own gradebook row with a forged 100%'), setDoc(doc(student, PROG), FORGERY, { merge: true }));
        await no(t('THE ATTACK via updateDoc: student sets quizScores directly'), updateDoc(doc(student, PROG), { quizScores: { 'web-security-quiz': 100 } }));
    }
    // These must hold in BOTH versions — the fix must not cost legitimate access.
    await ok(t('student still READS own progress'), getDoc(doc(student, PROG)));
    await ok(t('tenant admin still READS student progress'), getDoc(doc(admin, PROG)));
    await no(t('another student CANNOT read this row'), getDoc(doc(other, PROG)));
    // The legacy non-tenant path has a real client writer (AssignmentManager.js:277) and is a
    // SEPARATE rule block. Untouched by this change, and this pins that.
    await ok(t('legacy classes/{id}/progress client write still works'), setDoc(doc(student, LEGACY), { uid: STUDENT, completions: {} }, { merge: true }));
    await env.cleanup();
}

(async () => {
    await run('PRE-FIX', RULES_PREFIX, 'allow');   // must ALLOW — proves the test measures the fix
    await run('CURRENT', RULES_NOW,   'deny');     // must DENY  — proves the fix works
    for (const [v, n] of out) console.log(`  ${v.startsWith('PASS') ? '\x1b[32m' + v + '\x1b[0m' : '\x1b[31m' + v + '\x1b[0m'}  ${n}`);
    console.log(`\n${pass} passed, ${fail} failed`);
    process.exit(fail ? 1 : 0);
})().catch(e => { console.error('HARNESS ERROR:', e); process.exit(2); });
