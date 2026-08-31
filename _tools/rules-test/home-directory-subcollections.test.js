// Firestore security-rules test for the four subcollections the Home Directory page reads.
//
// @catalog what    pin owner-read + no-client-write on server_awards, quiz_attempts, gates, flag_captures
// @catalog run     firebase emulators:exec --only firestore --project=demo-hexworth "NODE_PATH=$(pwd)/node_modules node _tools/rules-test/home-directory-subcollections.test.js"
// @catalog status  TOOL
//
// WHY THIS EXISTS
//   HEXOS-4's page (_app/home.html) reads four subcollections under users/{uid}. Two of them --
//   server_awards and quiz_attempts -- had NO match block in firestore.rules at all. Firestore is
//   deny-by-default for anything unmatched, so every signed-in student reading their OWN records
//   got permission-denied. In production that page would have shown zero server-proven badges and
//   zero ledger quizzes to everyone, permanently, while reporting a read failure on every load.
//
//   NOTHING CAUGHT IT, and the reason is the point of this file. The page's own gate asserts on
//   source text: does home.html contain 'server_awards', is it assigned to src.serverAwards. Both
//   were true. And the browser verification stubbed window.firebaseFirestore wholesale, which
//   BYPASSES SECURITY RULES ENTIRELY -- a mocked SDK cannot fail a rules check, so it reported
//   success against a configuration that could never work. Only the real rules against a real
//   emulator can see this class of defect.
//
//   Both directions are pinned, because they fail oppositely and both are bad:
//     too tight -> the page shows a permanent read failure and a student never sees their badges
//     too open  -> another student reads someone's records, or a client forges a badge proof
//
//   The write half matters most for server_awards: it is the tamper-evident store, and its
//   protection is that NO write rule exists. Granting the owner read must not have granted write.
//
// NO PRODUCTION CONTACT. emulators:exec --only firestore starts Firestore alone -- no functions
// codebase, so functions/.env is never loaded and no webhook can fire.

const { initializeTestEnvironment, assertSucceeds, assertFails } = require('@firebase/rules-unit-testing');
const { doc, getDocs, collection, setDoc } = require('firebase/firestore');
const fs = require('fs');
const path = require('path');

// Overridable so this test CAN BE PROVEN TO FAIL. A rules test only ever run against the fixed
// rules has not been shown to detect the bug it exists for. Point it at a pre-fix copy to confirm
// it goes red. Convention borrowed from users-read-scope.test.js.
const RULES_PATH = process.env.HEXWORTH_RULES_PATH
  || path.resolve(__dirname, '../../firestore.rules');
const RULES = fs.readFileSync(RULES_PATH, 'utf8');

const ALICE = 'alice-uid-0000000000000001';   // owns the records
const BOB   = 'bob-uid-00000000000000000002'; // another ordinary student
const BOSS  = 'admin-uid-000000000000000004';

// The four the page reads. server_awards and quiz_attempts are the two that were missing.
const SUBS = ['server_awards', 'quiz_attempts', 'gates', 'flag_captures'];

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

  // Seed with rules disabled, so the documents exist regardless of how restrictive writes are.
  await env.withSecurityRulesDisabled(async (ctx) => {
    const db = ctx.firestore();
    for (const c of SUBS) {
      await setDoc(doc(db, 'users', ALICE, c, 'doc1'), { seeded: true });
    }
  });

  const alice = env.authenticatedContext(ALICE).firestore();
  const bob   = env.authenticatedContext(BOB).firestore();
  const boss  = env.authenticatedContext(BOSS, { admin: true, handler: true }).firestore();
  const anon  = env.unauthenticatedContext().firestore();

  for (const c of SUBS) {
    // ── READ: the owner must be able to, or the Home Directory shows a permanent failure ──
    await ok(`owner lists their own ${c}`,        getDocs(collection(alice, 'users', ALICE, c)));
    await ok(`admin lists a student's ${c}`,      getDocs(collection(boss,  'users', ALICE, c)));
    await no(`another student lists ${c}`,        getDocs(collection(bob,   'users', ALICE, c)));
    await no(`signed-out lists ${c}`,             getDocs(collection(anon,  'users', ALICE, c)));

    // ── WRITE: Cloud-Function-only. Read access must not have granted write access. ──
    await no(`owner cannot forge a ${c} record`,
      setDoc(doc(alice, 'users', ALICE, c, 'forged'), { forged: true }));
    await no(`another student cannot write ${c}`,
      setDoc(doc(bob, 'users', ALICE, c, 'forged2'), { forged: true }));
  }

  await env.cleanup();

  out.forEach(([s, n]) => console.log(`  ${s.startsWith('PASS') ? 'ok  ' : s} ${n}`));
  console.log(`\n  ${pass}/${pass + fail} passed`);
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.error('  harness error, nothing verified:', e.message); process.exit(2); });
