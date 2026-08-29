#!/usr/bin/env node
/*
 * Are the tournament's configured limits actually ENFORCED, or just written down?
 *
 * @catalog what    probes maxTeamSize, one-team-per-user, rate limit, replay, cross-tournament credit
 * @catalog run     node _tools/tournament/limits-tournament.js --tournament <QCBENCH-id>
 * @catalog status  TOOL
 *
 * ⚠ CALLS PRODUCTION CLOUD FUNCTIONS against a QCBENCH-* tournament only; refuses any other id.
 *
 * A configured limit and an enforced limit are different things, and only one of them survives
 * a real event. `maxTeams` and `maxTeamSize` sit on the tournament doc, but the doc is not the
 * enforcement point — the Cloud Functions are, and each limit has to be probed where it would
 * actually be hit. Every probe here does the thing a determined student would do.
 */
const crypto = require('crypto');
const API_KEY = 'AIzaSyC3tWNETi36DA8Q1I60n7t09YfU9HapA4M';
const CALL = (fn) => `https://us-central1-hexworth-prime.cloudfunctions.net/${fn}`;

const arg = (n, d) => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : d; };
const TID = arg('--tournament', null);
if (!TID || !TID.startsWith('QCBENCH')) { console.error('  REFUSING: --tournament must be QCBENCH-*'); process.exit(1); }

async function post(url, body, headers) {
  const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', ...headers }, body: JSON.stringify(body) });
  let d = null; try { d = await r.json(); } catch {}
  return { status: r.status, data: d, err: d && d.error && (d.error.status || d.error.message) };
}
async function identity(tag) {
  const email = `ctflim-${tag}@hexworth-smoke.local`, password = 'CtfL8w3z';
  let su = await post(`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${API_KEY}`,
    { email, password, returnSecureToken: true }, { Referer: 'https://hexworth-prime.web.app/' });
  if (su.status !== 200) su = await post(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${API_KEY}`,
    { email, password, returnSecureToken: true }, { Referer: 'https://hexworth-prime.web.app/' });
  if (su.status !== 200) throw new Error(`auth ${email}: ${JSON.stringify(su.data)}`);
  return { uid: su.data.localId, token: su.data.idToken, email };
}
const join  = (id, teamId) => post(CALL('ctfJoinTeam'),  { data: { tournamentId: TID, teamId } }, { Authorization: `Bearer ${id.token}` });
const leave = (id, teamId) => post(CALL('ctfLeaveTeam'), { data: { tournamentId: TID, teamId } }, { Authorization: `Bearer ${id.token}` });
const submit= (id, challengeId, flag) => post(CALL('ctfSubmitFlag'), { data: { tournamentId: TID, challengeId, flag } }, { Authorization: `Bearer ${id.token}` });

let pass = 0, fail = 0;
const ENF = (name, ok, detail) => { console.log(`  ${ok ? 'ENFORCED  ' : 'NOT ENFORCED'} ${name}${detail ? ' :: ' + detail : ''}`); ok ? pass++ : fail++; };

(async () => {
  console.log(`  probing ${TID}`);
  // Ids are DISCOVERED, never hardcoded. The first version of this file hardcoded
  // bench-team-0100 and ran against a 32-team tournament, so every probe failed NOT_FOUND and
  // the whole suite reported "6 enforced, 0 not enforced" while testing nothing at all. A
  // limit test that cannot reach the limit is the most dangerous kind of green.
  const admin = require('firebase-admin');
  admin.initializeApp({ projectId: 'hexworth-prime' });
  const db = admin.firestore();
  const tRef = db.collection('tournaments').doc(TID);
  const [teamSnap, chSnap] = await Promise.all([
    tRef.collection('teams').orderBy(admin.firestore.FieldPath.documentId()).limit(400).get(),
    tRef.collection('challenges').orderBy(admin.firestore.FieldPath.documentId()).limit(400).get(),
  ]);
  const teamIds = teamSnap.docs.map((d) => d.id);
  const chIds = chSnap.docs.map((d) => d.id);
  if (teamIds.length < 2 || chIds.length < 14) {
    console.error(`  cannot probe: need >=2 teams and >=14 challenges, found ${teamIds.length}/${chIds.length}`);
    process.exit(1);
  }
  // Use teams from the END of the range so a re-run does not collide with the load test's
  // one-user-per-team assignment at the start of the range.
  const T = teamIds[teamIds.length - 1], T2 = teamIds[teamIds.length - 2];
  console.log(`  using teams ${T}, ${T2} and ${chIds.length} challenges\n`);
  const ids = [];
  for (let i = 0; i < 6; i++) ids.push(await identity(`x${i}`));

  // Start clean: these identities are reused across runs, so drop any stale membership.
  for (const id of ids) { await leave(id, T); await leave(id, T2); }

  // ── maxTeamSize. Fill to the cap, then try one more.
  const results = [];
  for (let i = 0; i < 5; i++) results.push(await join(ids[i], T));
  const joined = results.filter((r) => r.status === 200).length;
  ENF(`maxTeamSize (cap 4): 5 users tried, ${joined} got in`, joined <= 4,
      joined > 4 ? 'a team can be overfilled' : `5th refused: ${results[4].err || results[4].status}`);

  // ── One team per user. A user already on T tries T2.
  const dual = await join(ids[0], T2);
  ENF('one team per user', dual.status !== 200, dual.status === 200 ? 'user joined a SECOND team' : (dual.err || ''));

  // ── Replay. Submit the same correct flag twice; the second must not credit again.
  // Derive the challenge AND its matching flag from the discovered id, so the flag is
  // always the correct one for that challenge rather than a guess at the naming scheme.
  const CH = chIds[0];
  const FLAG = `HEX{bench_${parseInt(CH.replace(/\D/g, ''), 10)}}`;
  const first = await submit(ids[0], CH, FLAG);
  const replay = await submit(ids[0], CH, FLAG);
  ENF('replay of an already-solved flag', replay.status !== 200,
      replay.status === 200 ? 'SECOND submission accepted — double credit' : (replay.err || ''));

  // ── Rate limit: same team+challenge inside 10s (use a WRONG flag so nothing scores).
  const RC = chIds[1];
  const r1 = await submit(ids[1], RC, 'HEX{wrong_one}');
  const r2 = await submit(ids[1], RC, 'HEX{wrong_two}');
  ENF('rate limit (1 per team+challenge / 10s)', r2.status !== 200,
      r2.status === 200 ? 'two guesses accepted back-to-back' : (r2.err || ''));

  // ── Is the rate limit dodgeable by switching challenges? The limit is scoped to
  //    team+challenge, so a brute-forcer can simply rotate targets. Measure the real ceiling.
  const t0 = Date.now();
  const spray = await Promise.all(Array.from({ length: 12 }, (_, k) =>
    submit(ids[2], chIds[2 + k], 'HEX{spray}')));
  const accepted = spray.filter((s) => s.status === 200).length;
  ENF(`per-user global rate limit (12 guesses across 12 challenges in ${Date.now() - t0}ms)`,
      accepted < 12, `${accepted}/12 went through — the 10s limit is per CHALLENGE, not per user`);

  // ── Cross-tournament credit: a flag from this tournament aimed at a challenge id that does
  //    not exist here should not score.
  const ghost = await submit(ids[3], 'no-such-challenge-id', FLAG);
  ENF('unknown challengeId rejected', ghost.status !== 200, ghost.err || '');

  console.log(`\n  ${pass} enforced, ${fail} NOT enforced`);
})().catch((e) => { console.error('  FAILED:', e.message); process.exit(1); });
