// BUG-123: setAdminClaim must NOT erase a non-admin's `handler` claim.
// Fires the ACTUAL Cloud Function against the functions+firestore+auth emulators.
// Run: firebase emulators:exec --only functions,firestore,auth --project=demo-hexworth \
//        "NODE_PATH=$(pwd)/node_modules node _tools/rules-test/setadminclaim-preserves-handler.test.js"
//
// WHY THIS EXISTS
//   setAdminClaim runs on EVERY standard sign-in (FirebaseAuth.js:329,510,558,622, each followed
//   by a forced token refresh) and used to write `handler: isAdmin` unconditionally, where isAdmin
//   is a 2-address allowlist check. Any non-admin holding handler:true therefore lost it at their
//   next login, silently. `handler` gates five Cloud Functions including gradeEDTSubmission, so
//   the claim granting instructor access erased itself on the way in.
//
//   The identical stomping bug was fixed for the Firestore `role` field three lines below on
//   2026-08-03; the claim write above it kept doing what that fix stopped.
//
//   Both directions matter and are asserted here:
//     preserve  -- a non-admin's existing handler survives (the bug)
//     downgrade -- an EX-ADMIN still loses `admin` on sign-in (the security property that must
//                  NOT be broken by "preserve everything")
//
// @catalog what    prove setAdminClaim preserves a handler grant but still downgrades ex-admins
// @catalog run     firebase emulators:exec --only functions,firestore,auth --project=demo-hexworth "NODE_PATH=$(pwd)/node_modules node _tools/rules-test/setadminclaim-preserves-handler.test.js"
// @catalog status  TOOL
const { initializeApp } = require('firebase/app');
const { getAuth, connectAuthEmulator, signInWithEmailAndPassword, createUserWithEmailAndPassword } = require('firebase/auth');
const { getFunctions, connectFunctionsEmulator, httpsCallable } = require('firebase/functions');
const admin = require('firebase-admin');

process.env.FIRESTORE_EMULATOR_HOST = '127.0.0.1:8181';
process.env.FIREBASE_AUTH_EMULATOR_HOST = '127.0.0.1:9099';
admin.initializeApp({ projectId: 'demo-hexworth' });

let pass = 0, fail = 0; const log = [];
const check = (name, cond, detail) => {
  log.push([cond ? 'PASS' : 'FAIL', name + (cond || !detail ? '' : `  -- ${detail}`)]);
  cond ? pass++ : fail++;
};

// A NON-admin address. The allowlist in functions/index.js is a 2-address literal; this is not it.
const TEACHER = 'teacher-not-on-allowlist@example.test';
const PW = 'test-password-123';

(async () => {
  const app = initializeApp({ projectId: 'demo-hexworth', apiKey: 'fake',
    authDomain: 'demo-hexworth.firebaseapp.com' }, 'cli-' + Date.now());
  const auth = getAuth(app);
  connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
  const fns = getFunctions(app, 'us-central1');
  connectFunctionsEmulator(fns, '127.0.0.1', 5001);
  const setAdminClaim = httpsCallable(fns, 'setAdminClaim');

  // ── Case 1: non-admin WITH an existing handler grant ───────────────────────
  const cred = await createUserWithEmailAndPassword(auth, TEACHER, PW).catch(
    () => signInWithEmailAndPassword(auth, TEACHER, PW));
  const uid = cred.user.uid;

  // Grant handler out-of-band, exactly as grantHandler() would.
  await admin.auth().setCustomUserClaims(uid, { handler: true, admin: false });
  const before = (await admin.auth().getUser(uid)).customClaims || {};
  check('setup: handler granted before sign-in', before.handler === true, JSON.stringify(before));

  // This is the sign-in path: force a token refresh, then call the function.
  await cred.user.getIdToken(true);
  await setAdminClaim();

  const after = (await admin.auth().getUser(uid)).customClaims || {};
  check('THE BUG: non-admin KEEPS handler after setAdminClaim',
        after.handler === true, `claims now ${JSON.stringify(after)}`);
  check('non-admin is still NOT admin', after.admin !== true, JSON.stringify(after));

  // ── Case 2: the security property that must survive the fix ────────────────
  // An EX-ADMIN (claim says admin, address is not on the allowlist) must be downgraded.
  await admin.auth().setCustomUserClaims(uid, { handler: true, admin: true });
  await cred.user.getIdToken(true);
  await setAdminClaim();
  const after2 = (await admin.auth().getUser(uid)).customClaims || {};
  check('EX-ADMIN is still downgraded (admin:false)',
        after2.admin !== true, `claims now ${JSON.stringify(after2)}`);
  check('...while their handler grant is retained',
        after2.handler === true, JSON.stringify(after2));

  // ── Case 3: a plain student gains nothing ──────────────────────────────────
  await admin.auth().setCustomUserClaims(uid, {});
  await cred.user.getIdToken(true);
  await setAdminClaim();
  const after3 = (await admin.auth().getUser(uid)).customClaims || {};
  check('plain user does NOT gain handler', after3.handler !== true, JSON.stringify(after3));
  check('plain user does NOT gain admin', after3.admin !== true, JSON.stringify(after3));

  for (const [v, n] of log) console.log(`  ${v}  ${n}`);
  console.log(`\n  ${pass} passed, ${fail} failed`);
  process.exit(fail === 0 ? 0 : 1);
})().catch(e => { console.error('harness error:', e && (e.message || e)); process.exit(2); });
