// Does the submission throttle actually throttle? (TOURN-04)
//
// @catalog what    Functions-emulator test of the ctfSubmitFlag rate limit, both bypasses
// @catalog run     firebase emulators:exec --only firestore,functions,auth --project=demo-hexworth "NODE_PATH=$(pwd)/functions/node_modules node _tools/rules-test/ctf-ratelimit.test.js"
// @catalog status  TOOL
//
// TWO PROVEN BYPASSES, both closed here, and they needed different mechanisms:
//   1. SCOPE. The old rule was per team+challenge, so rotating the challenge escaped it.
//      Measured against PRODUCTION: 12 guesses across 12 challenges in 922ms, ~13/s, unbounded.
//      A per-user window closes it. A per-team+challenge lock never could.
//   2. RACE. The old rule was check-then-act with nothing serialising callers. Measured in the
//      emulator: five teammates on one challenge, all five accepted, the limit held for zero of
//      five. A transaction closes it. A per-user budget never could, because five different
//      users have five different budgets.
//
// THE OTHER HALF MATTERS AS MUCH. A throttle that stops attacks and also stops a student
// playing is not a fix, so the legitimate cases are asserted alongside: a normal solve goes
// through, and two different players on the same team can work different challenges at once.
const admin = require('firebase-admin');

process.env.FIRESTORE_EMULATOR_HOST = process.env.FIRESTORE_EMULATOR_HOST || '127.0.0.1:8181';
process.env.FIREBASE_AUTH_EMULATOR_HOST = process.env.FIREBASE_AUTH_EMULATOR_HOST || '127.0.0.1:9099';
const FN_HOST = process.env.FUNCTIONS_EMULATOR_HOST || '127.0.0.1:5001';
const PROJECT = 'demo-hexworth';
const crypto = require('crypto');

admin.initializeApp({ projectId: PROJECT });
const db = admin.firestore();
const CALL = (fn) => `http://${FN_HOST}/${PROJECT}/us-central1/${fn}`;

async function identity() {
  const r = await fetch(`http://${process.env.FIREBASE_AUTH_EMULATOR_HOST}/identitytoolkit.googleapis.com/v1/accounts:signUp?key=fake`,
    { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ returnSecureToken: true }) });
  const d = await r.json();
  if (!d.idToken) throw new Error('no token: ' + JSON.stringify(d).slice(0, 140));
  // localId is the uid the callable will see; needed to seed team membership.
  return { token: d.idToken, uid: d.localId };
}
async function submit(tok, tournamentId, challengeId, flag) {
  const r = await fetch(CALL('ctfSubmitFlag'), {
    method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tok}` },
    body: JSON.stringify({ data: { tournamentId, challengeId, flag } }),
  });
  const d = await r.json().catch(() => ({}));
  return { status: r.status, ok: r.status === 200, err: d && d.error && (d.error.status || d.error.message) };
}

let pass = 0, fail = 0;
const chk = (n, ok, d) => { console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${n}${d ? ' :: ' + d : ''}`); ok ? pass++ : fail++; };

const TID = 'T_RL';
async function seed(members, challengeCount) {
  const tRef = db.collection('tournaments').doc(TID);
  // Wipe ALL throttle state so a re-run starts clean rather than inheriting the previous
  // window. Both collections, deliberately: the NEW limiter reads rateLimits/*, the OLD one
  // read the submissions log. Clearing only rateLimits made the A/B against the pre-fix
  // function lie — leftover submissions tripped its 10s cooldown, so "5 teammates raced" came
  // back 0/5 and looked like the limit HOLDING when it was stale state doing the work. A
  // harness that carries state reports the wrong verdict in the direction that flatters it.
  for (const coll of ['rateLimits', 'submissions']) {
    const old = await tRef.collection(coll).get();
    await Promise.all(old.docs.map((d) => d.ref.delete()));
  }
  await tRef.set({ name: 'RL', status: 'active', maxTeamSize: 8, maxTeams: 4, scoringModel: 'static' });
  await tRef.collection('teams').doc('team-red').set({
    name: 'Red', members, memberNames: members.map(() => 'P'), score: 0, solves: [],
  });
  for (let i = 0; i < challengeCount; i++) {
    const cid = 'c' + i, salt = crypto.randomBytes(8).toString('hex');
    await tRef.collection('challenges').doc(cid).set({
      title: 'C' + i, points: 100, currentPoints: 100, visible: true, solveCount: 0,
      flagSalt: salt,
      flagHash: 'sha256:' + crypto.createHash('sha256').update(salt + ':' + `HEX{f${i}}`).digest('hex'),
    });
  }
  return tRef;
}

(async () => {
  // ── BYPASS 1: one user rotating challenges. This is the production-measured one.
  const a = await identity();
  await seed([a.uid], 20);
  const spray = await Promise.all(Array.from({ length: 12 }, (_, k) =>
    submit(a.token, TID, 'c' + k, 'HEX{wrong}')));
  const accepted = spray.filter((s) => s.ok).length;
  const throttled = spray.filter((s) => s.err === 'RESOURCE_EXHAUSTED').length;
  chk('BYPASS 1: 12 guesses across 12 DIFFERENT challenges are throttled',
      accepted < 12, `${accepted}/12 accepted, ${throttled} throttled`);

  // ── BYPASS 2: teammates racing the SAME challenge. Different users, so a per-user budget
  //    cannot help; only the serialised team+challenge lock can.
  const mates = [];
  for (let i = 0; i < 5; i++) mates.push(await identity());
  await seed(mates.map((m) => m.uid), 5);
  const race = await Promise.all(mates.map((m) => submit(m.token, TID, 'c0', 'HEX{wrong}')));
  const raceOk = race.filter((r) => r.ok).length;
  // EXACTLY one, not "at most one". `<= 1` also passes at ZERO, which is what a stale-state
  // false pass looks like — the limit appearing to hold while nothing was actually tested.
  // Serialisation means precisely one winner.
  chk('BYPASS 2: 5 teammates racing ONE challenge -> exactly one lands',
      raceOk === 1, `${raceOk}/5 accepted`);

  // ── THE OTHER HALF: a student must still be able to play.
  const s1 = await identity();
  await seed([s1.uid], 5);
  const solve = await submit(s1.token, TID, 'c0', 'HEX{f0}');
  chk('a normal correct submission still succeeds', solve.ok, solve.err || `status ${solve.status}`);

  const p1 = await identity(), p2 = await identity();
  await seed([p1.uid, p2.uid], 5);
  const [w1, w2] = await Promise.all([
    submit(p1.token, TID, 'c1', 'HEX{f1}'),
    submit(p2.token, TID, 'c2', 'HEX{f2}'),
  ]);
  chk('two teammates working DIFFERENT challenges at once both succeed',
      w1.ok && w2.ok, `c1=${w1.ok ? 'ok' : w1.err} c2=${w2.ok ? 'ok' : w2.err}`);

  console.log(`\n  ${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.error('  FAILED:', e.message); process.exit(1); });
