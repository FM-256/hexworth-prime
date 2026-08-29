// Does dynamic scoring actually decay, and does it respect what the admin authored? (TOURN-05)
//
// @catalog what    Functions-emulator test of ctfSubmitFlag dynamic point decay
// @catalog run     firebase emulators:exec --only firestore,functions,auth --project=demo-hexworth "NODE_PATH=$(pwd)/functions/node_modules node _tools/rules-test/ctf-dynamic-scoring.test.js"
// @catalog status  TOOL
//
// TWO DEFECTS, and the second is why the first could not be fixed by writing a config doc.
//
// 1. The decay branch required `tournament.dynamicConfig` to exist. The admin console never
//    wrote one, so a tournament set to `dynamic` silently scored FLAT STATIC points forever.
//    The live "Special Event" is in exactly that state and nothing looks wrong from the UI.
// 2. It decayed from a tournament-wide `initialPoints` (default 500), ignoring each
//    challenge's authored value. Special Event's challenges are worth 60 and 90, so merely
//    writing a config would have made them JUMP to ~425 on first solve. Dynamic scoring would
//    have overwritten the admin's own numbers, which is worse than not decaying at all.
//
// The second case is asserted with Special Event's REAL point values, because "60 must not
// become 425" is the concrete thing that would have gone wrong in production.
const admin = require('firebase-admin');
const crypto = require('crypto');

process.env.FIRESTORE_EMULATOR_HOST = process.env.FIRESTORE_EMULATOR_HOST || '127.0.0.1:8181';
process.env.FIREBASE_AUTH_EMULATOR_HOST = process.env.FIREBASE_AUTH_EMULATOR_HOST || '127.0.0.1:9099';
const FN_HOST = process.env.FUNCTIONS_EMULATOR_HOST || '127.0.0.1:5001';
const PROJECT = 'demo-hexworth';

admin.initializeApp({ projectId: PROJECT });
const db = admin.firestore();
const CALL = (fn) => `http://${FN_HOST}/${PROJECT}/us-central1/${fn}`;

async function identity() {
  const r = await fetch(`http://${process.env.FIREBASE_AUTH_EMULATOR_HOST}/identitytoolkit.googleapis.com/v1/accounts:signUp?key=fake`,
    { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ returnSecureToken: true }) });
  const d = await r.json();
  if (!d.idToken) throw new Error('no token');
  return { token: d.idToken, uid: d.localId };
}
async function submit(tok, tid, cid, flag) {
  const r = await fetch(CALL('ctfSubmitFlag'), {
    method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tok}` },
    body: JSON.stringify({ data: { tournamentId: tid, challengeId: cid, flag } }),
  });
  const d = await r.json().catch(() => ({}));
  return { ok: r.status === 200, res: d && d.result, err: d && d.error && (d.error.status || d.error.message) };
}

let pass = 0, fail = 0;
const chk = (n, ok, d) => { console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${n}${d ? ' :: ' + d : ''}`); ok ? pass++ : fail++; };

const TID = 'T_DYN';
// One team per solver: dynamic decay is driven by DISTINCT teams solving, and a team cannot
// solve the same challenge twice.
async function seed(model, dynamicConfig, challenges, teamUids) {
  const tRef = db.collection('tournaments').doc(TID);
  for (const c of ['rateLimits', 'submissions', 'teams', 'challenges']) {
    const old = await tRef.collection(c).get();
    await Promise.all(old.docs.map((d) => d.ref.delete()));
  }
  const doc = { name: 'Dyn', status: 'active', maxTeamSize: 4, maxTeams: 20, scoringModel: model };
  if (dynamicConfig) doc.dynamicConfig = dynamicConfig;
  await tRef.set(doc);
  for (const [i, uid] of teamUids.entries()) {
    await tRef.collection('teams').doc('team-' + i).set({
      name: 'T' + i, members: [uid], memberNames: ['P'], score: 0, solves: [],
    });
  }
  for (const c of challenges) {
    const salt = crypto.randomBytes(8).toString('hex');
    await tRef.collection('challenges').doc(c.id).set({
      title: c.id, points: c.points, currentPoints: c.points, visible: true, solveCount: 0,
      flagSalt: salt,
      flagHash: 'sha256:' + crypto.createHash('sha256').update(salt + ':' + `HEX{${c.id}}`).digest('hex'),
    });
  }
  return tRef;
}
const currentPoints = async (tRef, cid) => (await tRef.collection('challenges').doc(cid).get()).data().currentPoints;

(async () => {
  // ── 1. THE SILENT-STATIC BUG: dynamic with NO config must still decay.
  //    This is the live "Special Event" shape exactly.
  const u = [await identity(), await identity(), await identity()];
  let tRef = await seed('dynamic', null, [{ id: 'c60', points: 60 }], u.map((x) => x.uid));
  const first = await submit(u[0].token, TID, 'c60', 'HEX{c60}');
  chk('a solve on a dynamic tournament with NO config still succeeds', first.ok, first.err || '');
  const after1 = await currentPoints(tRef, 'c60');
  chk('dynamic with no config DECAYS (was silently flat static)', after1 < 60, `60 -> ${after1}`);

  // ── 3. The award for the FIRST solver is the pre-decay value; later teams get less.
  chk('first solver is awarded the full authored value', first.res && first.res.points === 60,
      `awarded ${first.res && first.res.points}`);
  const second = await submit(u[1].token, TID, 'c60', 'HEX{c60}');
  chk('a second team is awarded LESS than the first', second.ok && second.res.points < 60,
      `first=60 second=${second.res && second.res.points}`);

  // ── 4. The floor is a fraction of the authored value, not a flat 50 that would exceed it.
  let t2 = await seed('dynamic', { decayRate: 0.1 }, [{ id: 'c60b', points: 60 }], u.map((x) => x.uid));
  await submit(u[0].token, TID, 'c60b', 'HEX{c60b}');
  await submit(u[1].token, TID, 'c60b', 'HEX{c60b}');
  const floored = await currentPoints(t2, 'c60b');
  chk('the floor scales to the challenge (60 -> floor 12, not a flat 50)',
      floored === 12, `currentPoints=${floored}`);

  // ── 5. An explicit minPoints stays ABSOLUTE, for tournaments already configured that way.
  let t3 = await seed('dynamic', { decayRate: 0.1, minPoints: 40 }, [{ id: 'c500', points: 500 }], u.map((x) => x.uid));
  await submit(u[0].token, TID, 'c500', 'HEX{c500}');
  await submit(u[1].token, TID, 'c500', 'HEX{c500}');
  chk('an explicit minPoints is honoured as an absolute floor',
      (await currentPoints(t3, 'c500')) === 40, `currentPoints=${await currentPoints(t3, 'c500')}`);

  // ── 6. STATIC must be untouched by all of this.
  let t4 = await seed('static', null, [{ id: 'cs', points: 100 }], u.map((x) => x.uid));
  await submit(u[0].token, TID, 'cs', 'HEX{cs}');
  chk('static scoring does not decay', (await currentPoints(t4, 'cs')) === 100,
      `currentPoints=${await currentPoints(t4, 'cs')}`);

  // ── 7. THE NAIVE FIX'S DAMAGE. Deliberately LAST: seed() wipes the tournament, and
  //    placing this between cases 1 and 3 destroyed the team case 3 depended on, so a
  //    genuine assertion reported `second=undefined` and failed for a harness reason
  //    rather than a product one. Order matters when fixtures share a document.
  //    would pass for the wrong reason.
  const uN = [await identity(), await identity()];
  const tN = await seed('dynamic', { initialPoints: 500, minPoints: 50, decayRate: 0.85 },
                        [{ id: 'c60n', points: 60 }], uN.map((x) => x.uid));
  await submit(uN[0].token, TID, 'c60n', 'HEX{c60n}');
  const naive = await currentPoints(tN, 'c60n');
  chk('a 60-point challenge does NOT jump to 425 under the old tournament-wide base',
      naive <= 60, `currentPoints=${naive}, must stay <= its authored 60`);


  // ── 8. decayRate: 0 must be HONOURED, not clobbered to 0.85 by `||`.
  //    The same falsy-zero bug this commit fixed for minPoints was left on decayRate; Nancy
  //    caught it. Zero means "collapse to the floor on the first solve", which is a legitimate
  //    setting, and it is unreachable from the UI today only because the console hardcodes
  //    0.85 — a landmine for whoever adds a control or edits a config by hand.
  const uZ = [await identity(), await identity()];
  const tZ = await seed('dynamic', { decayRate: 0 }, [{ id: 'cz', points: 100 }], uZ.map((x) => x.uid));
  await submit(uZ[0].token, TID, 'cz', 'HEX{cz}');
  const zeroed = await currentPoints(tZ, 'cz');
  chk('decayRate 0 collapses to the floor instead of silently becoming 0.85',
      zeroed === 20, `currentPoints=${zeroed} (0.85 would give 85, floor of 100 is 20)`);

  // ── NON-VACUITY, in the file rather than in a commit message (Nancy, concern 5).
  //    The prose A/B claimed 4/8 against the pre-fix function; that claim lived only in a
  //    commit body, in a file whose own history includes two harness mistakes. This recomputes
  //    the OLD formula directly and asserts it disagrees with the shipped one, so the suite
  //    itself demonstrates it can distinguish them.
  const oldFormula = (cfg, chPoints, solveCount) => {
      if (!cfg) return chPoints;                    // old code required a config to decay at all
      const initial = cfg.initialPoints || 500;     // tournament-wide base, ignoring chPoints
      const floorAbs = cfg.minPoints || 50;
      const d = cfg.decayRate || 0.85;
      return Math.max(floorAbs, Math.floor(initial * Math.pow(d, solveCount)));
  };
  chk('OLD formula would not decay at all with no config (test can fail)',
      oldFormula(null, 60, 1) === 60, `old=${oldFormula(null, 60, 1)} vs shipped 51`);
  chk('OLD formula would put a 60-point challenge at 425 with the naive config (test can fail)',
      oldFormula({ initialPoints: 500, minPoints: 50, decayRate: 0.85 }, 60, 1) === 425,
      `old=${oldFormula({ initialPoints: 500, minPoints: 50, decayRate: 0.85 }, 60, 1)}`);

  console.log(`\n  ${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.error('  FAILED:', e.message); process.exit(1); });
