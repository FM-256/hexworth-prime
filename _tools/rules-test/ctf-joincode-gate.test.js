// Does ctfJoinTeam ACTUALLY check the join code? Calls the real function, not the rules.
//
// @catalog what    Functions-emulator test of the ctfJoinTeam join-code gate (right/wrong/absent)
// @catalog run     firebase emulators:exec --only firestore,functions,auth --project=demo-hexworth "NODE_PATH=$(pwd)/functions/node_modules node _tools/rules-test/ctf-joincode-gate.test.js"
// @catalog status  TOOL
//
// WHY THIS FILE EXISTS, and it is not a flattering reason. TOURN-03 was submitted for review
// with "11/11 passing" — but every one of those assertions was "can a client read or write
// tournaments/{id}/private/config". Not one of them called ctfJoinTeam with a code. The rules
// test even said so in its own header, promising the function half was "exercised separately",
// and that separate test did not exist. Nancy caught it: the safe was proven shut, the lock was
// never tried. A security fix whose security decision has never executed is not verified.
//
// So this drives the DEPLOYED-SHAPE function against the emulator and asserts the four things
// that are the whole point:
//   right code           -> admitted
//   wrong code           -> refused
//   omitted code         -> refused
//   hasJoinCode, no doc  -> refused (the orphaned-tournament case, not opened up)
// plus the legacy path, which must keep working so a live event does not break mid-flight.
const admin = require('firebase-admin');

process.env.FIRESTORE_EMULATOR_HOST = process.env.FIRESTORE_EMULATOR_HOST || '127.0.0.1:8181';
process.env.FIREBASE_AUTH_EMULATOR_HOST = process.env.FIREBASE_AUTH_EMULATOR_HOST || '127.0.0.1:9099';
const FN_HOST = process.env.FUNCTIONS_EMULATOR_HOST || '127.0.0.1:5001';
const PROJECT = 'demo-hexworth';

admin.initializeApp({ projectId: PROJECT });
const db = admin.firestore();

// Callable endpoint on the Functions emulator.
const CALL = (fn) => `http://${FN_HOST}/${PROJECT}/us-central1/${fn}`;

// A signed ID token from the Auth emulator: the emulator accepts unsigned tokens, so this
// mints a real user and exchanges for a token the callable will accept.
async function identity(_label) {
  // Anonymous sign-up: the emulator mints a fresh uid per call, which is exactly what each
  // case needs (ctfJoinTeam refuses a uid already on a team, so cases must not share one).
  // Passing localId is rejected by the emulator with UNEXPECTED_PARAMETER.
  const r = await fetch(`http://${process.env.FIREBASE_AUTH_EMULATOR_HOST}/identitytoolkit.googleapis.com/v1/accounts:signUp?key=fake`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ returnSecureToken: true }),
  });
  const d = await r.json();
  if (!d.idToken) throw new Error('auth emulator did not mint a token: ' + JSON.stringify(d).slice(0, 160));
  return d.idToken;
}

async function join(token, tournamentId, teamId, joinCode) {
  const body = { data: { tournamentId, teamId, ...(joinCode === undefined ? {} : { joinCode }) } };
  const r = await fetch(CALL('ctfJoinTeam'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  });
  const d = await r.json().catch(() => ({}));
  return { status: r.status, ok: r.status === 200, err: d && d.error && (d.error.status || d.error.message) };
}

let pass = 0, fail = 0;
const chk = (n, ok, d) => { console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${n}${d ? ' :: ' + d : ''}`); ok ? pass++ : fail++; };

async function seed(id, tournamentFields, privateCode) {
  const tRef = db.collection('tournaments').doc(id);
  await tRef.set({ name: id, status: 'lobby', maxTeamSize: 4, maxTeams: 4, ...tournamentFields });
  await tRef.collection('teams').doc('team-red').set({ name: 'Red', members: [], memberNames: [], score: 0, solves: [] });
  if (privateCode !== undefined) await tRef.collection('private').doc('config').set({ joinCode: privateCode });
}

(async () => {
  // ── The modern shape: code in the private doc, nothing on the public doc.
  await seed('T_GATED', { hasJoinCode: true }, 'HEX-SECRET-42');

  const u1 = await identity('userGateWrong');
  chk('WRONG code is refused', !(await join(u1, 'T_GATED', 'team-red', 'not-the-code')).ok);

  const u2 = await identity('userGateOmitted');
  chk('OMITTED code is refused', !(await join(u2, 'T_GATED', 'team-red')).ok);

  const u3 = await identity('userGateEmpty');
  chk('EMPTY code is refused', !(await join(u3, 'T_GATED', 'team-red', '   ')).ok);

  const u4 = await identity('userGateRight');
  const right = await join(u4, 'T_GATED', 'team-red', 'HEX-SECRET-42');
  chk('RIGHT code is admitted', right.ok, right.err || `status ${right.status}`);

  // Case-insensitive by design: students retype these off a projector. Asserted so a future
  // "tighten it" change has to notice it is breaking something deliberate.
  const u5 = await identity('userGateCase');
  const cased = await join(u5, 'T_GATED', 'team-red', '  hex-secret-42  ');
  chk('right code in the wrong case, with whitespace, is admitted', cased.ok, cased.err || '');

  // ── The orphan Nancy found: the doc claims a code, but creation half-failed and none exists.
  //    Falling through to "ungated" here would silently reopen the finding.
  await seed('T_ORPHAN', { hasJoinCode: true }, undefined);
  const u6 = await identity('userOrphan');
  const orphan = await join(u6, 'T_ORPHAN', 'team-red', 'anything');
  chk('hasJoinCode with NO code anywhere refuses instead of opening up', !orphan.ok,
      orphan.ok ? 'JOINED AN UNCONFIGURED TOURNAMENT' : (orphan.err || ''));

  // ── Legacy: pre-fix tournaments keep their public field and must keep working, or this
  //    deploy breaks a live event.
  await seed('T_LEGACY', { joinCode: 'OLD-CODE-9' }, undefined);
  const u7 = await identity('userLegacyRight');
  const legacyOk = await join(u7, 'T_LEGACY', 'team-red', 'OLD-CODE-9');
  chk('LEGACY tournament still admits its correct code', legacyOk.ok, legacyOk.err || '');
  const u8 = await identity('userLegacyWrong');
  chk('LEGACY tournament still refuses a wrong code', !(await join(u8, 'T_LEGACY', 'team-red', 'nope')).ok);

  // ── A tournament that genuinely never had a code stays open, as before this change.
  await seed('T_OPEN', {}, undefined);
  const u9 = await identity('userOpen');
  const open = await join(u9, 'T_OPEN', 'team-red');
  chk('a tournament with no code at all is still joinable', open.ok, open.err || '');

  console.log(`\n  ${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.error('  FAILED:', e.message); process.exit(1); });
