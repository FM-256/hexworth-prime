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
const { doc, setDoc, updateDoc, deleteDoc, getDoc, getDocs, collection } = require('firebase/firestore');
const fs = require('fs');
const path = require('path');

const RULES_PATH = path.resolve(__dirname, '../../firestore.rules');
const RULES_NOW = fs.readFileSync(RULES_PATH, 'utf8');

// Reconstruct the vulnerable version by restoring the exact line that was removed.
// TWO changes are under test now, so the PRE-FIX baseline must restore BOTH original lines.
// A baseline that only undoes one of them would make the other change's "denied" result look
// like a fix when it was already denied before.
const ANCHOR_W = `        // WAS: \`allow write: if request.auth != null && request.auth.uid == studentUid;\``;
const ANCHOR_R = `        // WAS: \`allow read: if request.auth != null;\` — narrowed 2026-09-27.`;
for (const [name, a] of [['tenant write', ANCHOR_W], ['legacy read', ANCHOR_R]]) {
    if (!RULES_NOW.includes(a)) {
        console.error(`SETUP FAILED: could not find the ${name} removal marker in firestore.rules.`);
        console.error('The A/B cannot be constructed, so this test would only prove "denied" against');
        console.error('an unknown baseline. Refusing to report a pass.');
        process.exit(2);
    }
}
// Rebuild the PRE-FIX rules by restoring BOTH original lines. This is done by SPAN SPLICE, not
// by regex-matching the rule body: the first version of this used a regex keyed to the exact
// clause order, and when the clauses were reordered the match silently stopped firing while the
// exit-2 guard ALSO missed it (the guard was keyed on a "|| " prefix that reordering removed).
// The result was a PRE-FIX run that was not pre-fix at all. Find the anchor, find the `allow read`
// that follows it, replace through its terminating `);`.
function restoreLegacyRead(rules) {
    const a = rules.indexOf(ANCHOR_R);
    if (a === -1) return null;
    // Search from AFTER the anchor line, not from its start. The anchor is a comment that QUOTES
    // the removed rule ("// WAS: `allow read: if ...`"), so searching from `a` matched inside the
    // comment and the splice swallowed the entire comment block plus the real rule — producing a
    // PRE-FIX file whose read rule was commented out, which denied everything and looked like a
    // test failure rather than a harness bug. A near-match is not a match.
    const rStart = rules.indexOf('allow read: if', a + ANCHOR_R.length);
    if (rStart === -1) return null;
    const rEnd = rules.indexOf(');', rStart);
    if (rEnd === -1) return null;
    return rules.slice(0, rStart) + 'allow read: if request.auth != null;' + rules.slice(rEnd + 2);
}
let RULES_PREFIX = RULES_NOW
    .replace(ANCHOR_W, `        allow write: if request.auth != null && request.auth.uid == studentUid;\n${ANCHOR_W}`);
const restored = restoreLegacyRead(RULES_PREFIX);
if (!restored) { console.error('SETUP FAILED: could not splice the legacy read rule.'); process.exit(2); }
RULES_PREFIX = restored;

// Guards. Each states a property of the baseline, not a text form, so reordering the rule cannot
// silently defeat them.
const guards = [
    ['pre-fix restores the unrestricted tenant write',
     RULES_PREFIX.includes('allow write: if request.auth != null && request.auth.uid == studentUid;')],
    ['pre-fix restores the wide-open legacy read',
     RULES_PREFIX.includes('allow read: if request.auth != null;')],
    ['pre-fix no longer contains the narrowed admin clause',
     !RULES_PREFIX.includes("request.auth.token.get('admin', false) == true\n          || get(")],
    ['pre-fix differs from current', RULES_PREFIX !== RULES_NOW],
    ['current still HAS the narrowed admin clause',
     RULES_NOW.includes("request.auth.token.get('admin', false) == true\n          || get(")]
];
for (const [what, held] of guards) {
    if (!held) {
        console.error(`SETUP FAILED: ${what} — the A/B baseline is wrong, so a "denied" result would`);
        console.error('prove nothing. Refusing to report a pass.');
        process.exit(2);
    }
}

const TENANT = 'acme-college', CLASS = 'net-101', STUDENT = 'student-uid-1', OTHER = 'student-uid-2', ADMIN = 'admin-uid-1', HANDLER = 'handler-uid-1';
const PROG = `tenants/${TENANT}/classes/${CLASS}/progress/${STUDENT}`;
const LEGACY = `classes/${CLASS}/progress/${STUDENT}`;
const LEGACY_OTHER = `classes/${CLASS}/progress/${OTHER}`;
const LEGACY_COLL = `classes/${CLASS}/progress`;

let pass = 0, fail = 0; const out = [];
async function ok(name, p){ try { await assertSucceeds(p); out.push(['PASS', name]); pass++; }
  catch(e){ out.push(['FAIL (expected ALLOW, got DENY)', `${name} :: ${(e&&e.message||e).toString().replace(/\n/g,' ').slice(0,180)}`]); fail++; } }
async function no(name, p){ try { await assertFails(p); out.push(['PASS', `${name} [denied]`]); pass++; }
  catch(e){ out.push(['FAIL (expected DENY, got ALLOW)', name]); fail++; } }
// assertFails() passes on ANY failure, an evaluation error included — so a rule that is simply
// BROKEN for everyone would satisfy every `no()` above. Where a denial is the security claim, the
// denial must be a real PERMISSION_DENIED and not a "Null value error" or an undefined-field throw.
async function noClean(name, p){
  try { await p; out.push(['FAIL (expected DENY, got ALLOW)', name]); fail++; return; }
  catch(e){
    const msg = (e && e.message || '').toString();
    if (/PERMISSION_DENIED|false for '(list|get|create|update|delete|write)'/.test(msg)
        && !/Null value error|is undefined on object|Invalid resource path|Failed to parse/i.test(msg)) {
      out.push(['PASS', `${name} [clean deny]`]); pass++;
    } else {
      out.push(['FAIL (denied, but NOT cleanly — rule may be erroring for everyone)',
                `${name} :: ${msg.replace(/\n/g,' ').slice(0,190)}`]); fail++;
    }
  }
}

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
        // Legacy non-tenant class: HANDLER is a third party, not either student.
        await setDoc(doc(db, `classes/${CLASS}`), { handlerUid: HANDLER, name: 'Net 101' });
        await setDoc(doc(db, LEGACY), { uid: STUDENT, completions: {} });
        await setDoc(doc(db, LEGACY_OTHER), { uid: OTHER, completions: {} });
    });
    const student = env.authenticatedContext(STUDENT).firestore();
    const other   = env.authenticatedContext(OTHER).firestore();
    const admin   = env.authenticatedContext(ADMIN, { admin: true }).firestore();
    const handler = env.authenticatedContext(HANDLER).firestore();

    const t = (n) => `[${label}] ${n}`;
    if (expectForgery === 'allow') {
        await ok(t('THE ATTACK: student overwrites own gradebook row with a forged 100%'), setDoc(doc(student, PROG), FORGERY, { merge: true }));
        await ok(t('THE ATTACK via updateDoc: student sets quizScores directly'), updateDoc(doc(student, PROG), { quizScores: { 'web-security-quiz': 100 } }));
    } else {
        await noClean(t('THE ATTACK: student overwrites own gradebook row with a forged 100%'), setDoc(doc(student, PROG), FORGERY, { merge: true }));
        await noClean(t('THE ATTACK via updateDoc: student sets quizScores directly'), updateDoc(doc(student, PROG), { quizScores: { 'web-security-quiz': 100 } }));
    }
    // These must hold in BOTH versions — the fix must not cost legitimate access.
    await ok(t('student still READS own progress'), getDoc(doc(student, PROG)));
    await ok(t('tenant admin still READS student progress'), getDoc(doc(admin, PROG)));
    await no(t('another student CANNOT read this row'), getDoc(doc(other, PROG)));
    // DELETE on the tenant path — Mallory's coverage gap. The removed `allow write` covered
    // create/update/delete uniformly, so delete must follow the same direction as the writes.
    if (expectForgery === 'allow') {
        await ok(t('student DELETES own gradebook row'), deleteDoc(doc(student, PROG)));
    } else {
        await no(t('student DELETES own gradebook row'), deleteDoc(doc(student, PROG)));
    }

    // The legacy non-tenant path has a real client writer (AssignmentManager.js:276) and is a
    // SEPARATE rule block. Its WRITE is deliberately still open; this pins that it stays working.
    await ok(t('legacy classes/{id}/progress client write still works'), setDoc(doc(student, LEGACY), { uid: STUDENT, completions: {} }, { merge: true }));

    // LEGACY READ NARROWING. Pre-fix `allow read: if request.auth != null` granted GET *and*
    // LIST to anyone signed in, so a student could enumerate the whole class.
    if (expectForgery === 'allow') {
        await ok(t('THE LEAK: any student LISTS every classmate row'), getDocs(collection(student, LEGACY_COLL)));
        await ok(t('THE LEAK: any student GETS a classmate row'), getDoc(doc(student, LEGACY_OTHER)));
    } else {
        // LIST is asserted with no(), not noClean(), and that is deliberate: a denied LIST on this
        // collection cannot produce a clean `false`, because the {studentUid} wildcard is unbound
        // and the handlerUid get() cannot resolve on the deny path. Measured one clause at a time
        // against the emulator; a `studentUid != null` guard does not help either. See the comment
        // on the rule itself. GET has no such excuse and must deny cleanly.
        await no(t('THE LEAK: any student LISTS every classmate row'), getDocs(collection(student, LEGACY_COLL)));
        await noClean(t('THE LEAK: any student GETS a classmate row'), getDoc(doc(student, LEGACY_OTHER)));
    }
    // ...while the three legitimate readers must keep working in BOTH versions.
    await ok(t('student still GETS own legacy row'), getDoc(doc(student, LEGACY)));
    await ok(t('class HANDLER still lists the roster progress'), getDocs(collection(handler, LEGACY_COLL)));
    await ok(t('ADMIN still lists the roster progress'), getDocs(collection(admin, LEGACY_COLL)));
    await env.cleanup();
}

(async () => {
    await run('PRE-FIX', RULES_PREFIX, 'allow');   // must ALLOW — proves the test measures the fix
    await run('CURRENT', RULES_NOW,   'deny');     // must DENY  — proves the fix works
    for (const [v, n] of out) console.log(`  ${v.startsWith('PASS') ? '\x1b[32m' + v + '\x1b[0m' : '\x1b[31m' + v + '\x1b[0m'}  ${n}`);
    console.log(`\n${pass} passed, ${fail} failed`);
    process.exit(fail ? 1 : 0);
})().catch(e => { console.error('HARNESS ERROR:', e); process.exit(2); });
