// Firestore security-rules test for the users/{userId} READ scope.
// Run against the Firestore emulator:
//   firebase emulators:exec --only firestore --project=demo-hexworth \
//     "NODE_PATH=$(pwd)/node_modules node _tools/rules-test/users-read-scope.test.js"
//
// WHY THIS EXISTS
//   users/{userId} carried `allow read: if request.auth != null;` until 2026-08-21. In Firestore
//   `read` grants GET *and* LIST, so that one line let ANY signed-in account enumerate the whole
//   users collection and read every document. Those documents carry `email` and `displayName`,
//   and anonymous sign-in is enabled because it is how students join a class. The practical
//   effect: anybody could list every student's name and email address.
//
//   The rule was replaced with a split get/list. This test pins BOTH halves, because the two
//   failure directions are opposite and equally bad:
//     too open  -> the exposure above returns
//     too tight -> instructor dashboards break (handler-dashboard.js:4279 and
//                  attendance-heatmap.html:396 both read OTHER users' docs via .doc(uid).get())
//
//   The list half matters on its own: Firestore proves every returnable doc satisfies the rule
//   and cannot post-filter, so an unconstrained list by a non-admin must be denied WHOLESALE.
//
// @catalog what    pin the users/{userId} get+list scope (self / handler / admin)
// @catalog run     firebase emulators:exec --only firestore --project=demo-hexworth "NODE_PATH=$(pwd)/node_modules node _tools/rules-test/users-read-scope.test.js"
// @catalog status  TOOL
const { initializeTestEnvironment, assertSucceeds, assertFails } = require('@firebase/rules-unit-testing');
const { doc, getDoc, getDocs, collection, setDoc } = require('firebase/firestore');
const fs = require('fs');
const path = require('path');

// Path is overridable SO THAT THIS TEST CAN BE PROVEN TO FAIL. A rules test that has only ever
// been run against the fixed rules has not been shown to detect the bug it exists for.
const RULES_PATH = process.env.HEXWORTH_RULES_PATH
  || path.resolve(__dirname, '../../firestore.rules');
const RULES = fs.readFileSync(RULES_PATH, 'utf8');

const ALICE = 'alice-uid-0000000000000001';   // ordinary student
const BOB   = 'bob-uid-00000000000000000002'; // another ordinary student
const TEACH = 'handler-uid-0000000000000003'; // instructor tier (handler claim)
const BOSS  = 'admin-uid-000000000000000004'; // admin claim

let pass = 0, fail = 0; const out = [];
async function ok(name, p){ try { await assertSucceeds(p); out.push(['PASS', name]); pass++; }
  catch(e){ out.push(['FAIL (expected ALLOW, got DENY)', name]); fail++; } }
async function no(name, p){ try { await assertFails(p); out.push(['PASS', name + ' [denied]']); pass++; }
  catch(e){ out.push(['FAIL (expected DENY, got ALLOW)', name]); fail++; } }

(async () => {
  const env = await initializeTestEnvironment({
    projectId: 'demo-hexworth',
    firestore: { rules: RULES, host: '127.0.0.1', port: 8181 }
  });
  await env.clearFirestore();

  // Seed two real-looking profiles with the admin context (bypasses rules).
  await env.withSecurityRulesDisabled(async (ctx) => {
    const db = ctx.firestore();
    await setDoc(doc(db, 'users', ALICE), { email: 'alice@example.test', displayName: 'Alice', xp: 10 });
    await setDoc(doc(db, 'users', BOB),   { email: 'bob@example.test',   displayName: 'Bob',   xp: 20 });
  });

  const alice     = env.authenticatedContext(ALICE).firestore();
  const anon      = env.authenticatedContext('anon-uid-000000000000000005', { provider_id: 'anonymous' }).firestore();
  const teacher   = env.authenticatedContext(TEACH, { handler: true }).firestore();
  const boss      = env.authenticatedContext(BOSS,  { admin: true, handler: true }).firestore();
  const outsider  = env.unauthenticatedContext().firestore();

  // ── GET ────────────────────────────────────────────────────────────────────
  await ok('student reads their OWN doc',              getDoc(doc(alice, 'users', ALICE)));
  await no('signed-out reads a student doc',           getDoc(doc(outsider, 'users', ALICE)));

  /* ⚠ PHASE 1 KNOWN-OPEN. These two assert the CURRENT behaviour, which is still the exposed
     behaviour: any signed-in account (anonymous included) can GET any single user doc. They are
     written as ok() deliberately so this file cannot be mistaken for proof that GET is fixed.
     PHASE 2 flips both to no() at the same time as the rule change.
     GET was held back because 3 of 4 live tenants/{id}.adminUids instructors carry no handler
     claim and no accountType, and would have lost profile access silently. */
  await ok('PHASE1 KNOWN-OPEN: student reads ANOTHER student doc',  getDoc(doc(alice, 'users', BOB)));
  await ok('PHASE1 KNOWN-OPEN: ANONYMOUS reads a student doc',      getDoc(doc(anon,  'users', ALICE)));

  // ── GET: the instructor surfaces that must keep working ───────────────────
  await ok('handler reads another user doc',           getDoc(doc(teacher, 'users', ALICE)));
  await ok('admin reads another user doc',             getDoc(doc(boss,    'users', ALICE)));

  // ── LIST: enumeration is the actual exposure. Nothing client-side needs it. ─
  await no('student LISTS the users collection',       getDocs(collection(alice,    'users')));
  await no('ANONYMOUS LISTS the users collection',     getDocs(collection(anon,     'users')));
  await no('signed-out LISTS the users collection',    getDocs(collection(outsider, 'users')));
  await no('handler LISTS the users collection',       getDocs(collection(teacher,  'users')));
  await ok('admin LISTS the users collection',         getDocs(collection(boss,     'users')));

  await env.cleanup();

  for (const [verdict, name] of out) console.log(`  ${verdict.padEnd(32)} ${name}`);
  console.log(`\n  ${pass} passed, ${fail} failed`);
  process.exit(fail === 0 ? 0 : 1);
})().catch(e => { console.error('harness error:', e); process.exit(2); });
