#!/usr/bin/env node
/*
 * Drive the REAL deployed tournament Cloud Functions under load. Where does it actually break?
 *
 * @catalog what    end-to-end load test of ctfJoinTeam/ctfSubmitFlag against a benchmark tournament
 * @catalog run     node _tools/tournament/load-tournament.js --tournament <QCBENCH-id> [--users N]
 * @catalog status  TOOL
 *
 * ⚠ CALLS PRODUCTION CLOUD FUNCTIONS. Operator authorised on 2026-08-29, scoped to a QCBENCH-*
 * tournament only. It REFUSES any other tournament id, because a load test pointed at a real
 * event would corrupt a live scoreboard.
 *
 * WHY THE EMULATOR CANNOT ANSWER THIS. The interesting failures are cold starts, per-instance
 * concurrency, the 256MB memory ceiling, and Firestore contention — none of which the emulator
 * reproduces. ctfSubmitFlag loads the ENTIRE teams collection on every call (index.js:6958), so
 * the cost per submission grows with roster size; that is a property of the real service.
 *
 * IT VERIFIES CORRECTNESS, NOT JUST SPEED. After the load phase it recomputes every team's score
 * from the submission log. A fast system that double-credits is worse than a slow correct one,
 * and the double-credit bug this codebase already fixed once was invisible on the board.
 */
const admin = require('firebase-admin');
const crypto = require('crypto');

const API_KEY = 'AIzaSyC3tWNETi36DA8Q1I60n7t09YfU9HapA4M';
const REGION = 'us-central1';
const PROJECT = 'hexworth-prime';
const CALL = (fn) => `https://${REGION}-${PROJECT}.cloudfunctions.net/${fn}`;

const arg = (n, d) => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : d; };
const TID = arg('--tournament', null);
const USERS = parseInt(arg('--users', '20'), 10);

if (!TID || !TID.startsWith('QCBENCH')) {
  console.error('  REFUSING: --tournament must be a QCBENCH-* id. This tool will not load-test a real event.');
  process.exit(1);
}

admin.initializeApp({ projectId: PROJECT });
const db = admin.firestore();

async function post(url, body, headers) {
  const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', ...headers }, body: JSON.stringify(body) });
  let data = null; try { data = await r.json(); } catch { /* non-JSON */ }
  return { status: r.status, data };
}

// Fixed identities, reused every run. A random identity per run would create a new Firebase user
// each time and leave permanent debris; the arena work already learned that the hard way.
async function identity(i) {
  const email = `ctfbench-${String(i).padStart(3, '0')}@hexworth-smoke.local`;
  const password = 'CtfB9x2q';   // project policy caps passwords at 10 chars
  let su = await post(`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${API_KEY}`,
    { email, password, returnSecureToken: true }, { Referer: 'https://hexworth-prime.web.app/' });
  if (su.status !== 200) {
    su = await post(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${API_KEY}`,
      { email, password, returnSecureToken: true }, { Referer: 'https://hexworth-prime.web.app/' });
  }
  if (su.status !== 200) throw new Error(`auth ${email}: ${su.status} ${JSON.stringify(su.data)}`);
  return { email, uid: su.data.localId, token: su.data.idToken };
}

const pct = (arr, p) => { const s = [...arr].sort((a, b) => a - b); return s[Math.min(s.length - 1, Math.floor(s.length * p))]; };

(async () => {
  const tRef = db.collection('tournaments').doc(TID);
  const tSnap = await tRef.get();
  if (!tSnap.exists) { console.error(`  ${TID} not found.`); process.exit(1); }
  const teamCount = (await tRef.collection('teams').count().get()).data().count;
  const chCount = (await tRef.collection('challenges').count().get()).data().count;
  console.log(`  tournament ${TID}: ${teamCount} teams, ${chCount} challenges`);
  console.log(`  driving ${USERS} real identities against the DEPLOYED functions\n`);

  console.log('  [1/4] authenticating...');
  const ids = [];
  for (let i = 0; i < USERS; i++) ids.push(await identity(i));
  console.log(`        ${ids.length} authenticated`);

  // ── JOIN. One user per team, so no two contend for the same roster.
  console.log('  [2/4] ctfJoinTeam, all at once...');
  let t0 = Date.now();
  const joins = await Promise.all(ids.map(async (id, i) => {
    const teamId = `bench-team-${String(i).padStart(4, '0')}`;
    const s = Date.now();
    try {
      const r = await post(CALL('ctfJoinTeam'), { data: { tournamentId: TID, teamId } },
        { Authorization: `Bearer ${id.token}` });
      return { ok: r.status === 200, ms: Date.now() - s, status: r.status, teamId, id,
               err: r.data && r.data.error && r.data.error.message };
    } catch (e) { return { ok: false, ms: Date.now() - s, status: 0, teamId, id, err: e.message }; }
  }));
  const joinOk = joins.filter((j) => j.ok);
  const joinMs = joins.map((j) => j.ms);
  console.log(`        ${joinOk.length}/${USERS} joined in ${Date.now() - t0}ms wall`);
  console.log(`        latency p50 ${pct(joinMs, 0.5)}ms  p95 ${pct(joinMs, 0.95)}ms  max ${Math.max(...joinMs)}ms`);
  for (const f of joins.filter((j) => !j.ok).slice(0, 5)) console.log(`        FAIL ${f.teamId}: ${f.status} ${f.err}`);

  // ── SUBMIT. Every joined user submits a CORRECT flag simultaneously, each to its own
  //    challenge, so failures are load-related rather than rate-limit-related (the limit is
  //    per team per challenge).
  console.log('  [3/4] ctfSubmitFlag, all at once (correct flags, distinct challenges)...');
  t0 = Date.now();
  const subs = await Promise.all(joinOk.map(async (j, i) => {
    const challengeId = `bench-ch-${String(i).padStart(4, '0')}`;
    const flag = `HEX{bench_${i}}`;
    const s = Date.now();
    try {
      const r = await post(CALL('ctfSubmitFlag'), { data: { tournamentId: TID, challengeId, flag } },
        { Authorization: `Bearer ${j.id.token}` });
      const res = r.data && r.data.result;
      return { ok: r.status === 200, correct: res && res.correct, ms: Date.now() - s, status: r.status,
               teamId: j.teamId, err: r.data && r.data.error && r.data.error.message };
    } catch (e) { return { ok: false, ms: Date.now() - s, status: 0, teamId: j.teamId, err: e.message }; }
  }));
  const subOk = subs.filter((s) => s.ok);
  const subMs = subs.map((s) => s.ms);
  console.log(`        ${subOk.length}/${joinOk.length} accepted in ${Date.now() - t0}ms wall`);
  console.log(`        latency p50 ${pct(subMs, 0.5)}ms  p95 ${pct(subMs, 0.95)}ms  max ${Math.max(...subMs)}ms`);
  const errs = {};
  for (const f of subs.filter((s) => !s.ok)) errs[f.err || f.status] = (errs[f.err || f.status] || 0) + 1;
  for (const [e, n] of Object.entries(errs)) console.log(`        FAIL x${n}: ${e}`);

  // ── CORRECTNESS. Speed means nothing if the scoreboard is wrong afterwards.
  console.log('  [4/4] reconciling scores against the submission log...');
  const [teams, submissions] = await Promise.all([
    tRef.collection('teams').get(), tRef.collection('submissions').get(),
  ]);
  const expected = new Map();
  for (const s of submissions.docs) {
    const d = s.data();
    if (d.correct === true) expected.set(d.teamId, (expected.get(d.teamId) || 0) + (d.points || 0));
  }
  let mismatches = 0, scored = 0;
  for (const t of teams.docs) {
    const stored = t.data().score || 0;
    if (stored > 0) scored++;
    const exp = expected.get(t.id) || 0;
    if (stored !== exp) { mismatches++; if (mismatches <= 5) console.log(`        MISMATCH ${t.id}: stored ${stored} != ${exp} from log`); }
  }
  console.log(`        ${scored} team(s) scored; ${mismatches} score mismatch(es)`);
  const dupes = new Map();
  for (const s of submissions.docs) { const d = s.data(); if (d.correct === true) { const k = `${d.teamId}|${d.challengeId}`; dupes.set(k, (dupes.get(k) || 0) + 1); } }
  const dbl = [...dupes.values()].filter((n) => n > 1).length;
  console.log(`        ${dbl} double-credited team/challenge pair(s)`);
  console.log(mismatches === 0 && dbl === 0 ? '\n  CORRECTNESS: clean under load.' : '\n  CORRECTNESS: FAILED under load.');
})().catch((e) => { console.error('  FAILED:', e.message); process.exit(1); });
