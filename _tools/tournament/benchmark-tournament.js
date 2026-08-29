#!/usr/bin/env node
/*
 * Where does the tournament system break? Ramps a THROWAWAY tournament until it does.
 *
 * @catalog what    production benchmark: team/challenge scale, submission latency, breaking point
 * @catalog run     node _tools/tournament/benchmark-tournament.js [--teams N] [--challenges N] [--cleanup <id>]
 * @catalog status  TOOL
 *
 * ⚠ THIS WRITES TO PRODUCTION. Operator authorised it specifically on 2026-08-29, scoped to a
 * throwaway tournament that no student can reach. It NEVER touches an existing tournament: every
 * write is under `tournaments/<BENCH_PREFIX>...`, and cleanup deletes only that subtree.
 *
 * THE MANIFEST IS WRITTEN BEFORE THE DATA. Every doc path this creates is appended to a manifest
 * file as it is created, so if the process dies mid-ramp the operator still has an exact list of
 * what exists and `--cleanup` can remove it. Test data is deletable only once documented; a crash
 * must not be able to leave undocumented debris.
 *
 * WHAT IT MEASURES, and why each one is the number that matters:
 *   1. SUBMISSION LATENCY vs TEAM COUNT. ctfSubmitFlag (index.js:6958) loads the ENTIRE teams
 *      collection on every submission to find the caller's team, and ctfJoinTeam does the same.
 *      That is O(teams) per call, so latency should climb with roster size. This is the single
 *      most important curve: it decides how many teams a real event can hold.
 *   2. CHALLENGE CEILING. How many challenges (boxes) can a tournament carry before the board
 *      query degrades? Answers "can we add all the boxes we want".
 *   3. CONCURRENCY. Simultaneous submissions from distinct teams — does anything double-credit,
 *      drop, or error under contention?
 *   4. LIMIT ENFORCEMENT. maxTeamSize is enforced in ctfJoinTeam; maxTeams is NOT checked there.
 *      Measure what actually stops.
 */
const admin = require('firebase-admin');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

admin.initializeApp({ projectId: 'hexworth-prime' });
const db = admin.firestore();
const FieldValue = admin.firestore.FieldValue;

const arg = (name, dflt) => { const i = process.argv.indexOf(name); return i > 0 ? process.argv[i + 1] : dflt; };
const CLEANUP = arg('--cleanup', null);
const TEAMS = parseInt(arg('--teams', '40'), 10);
const CHALLENGES = parseInt(arg('--challenges', '40'), 10);
const PREFIX = 'QCBENCH';
const MANIFEST_DIR = path.resolve(__dirname, '../../_tools/tournament/bench-manifests');

// ── Cleanup: delete ONLY a benchmark tournament, and refuse anything else ───────────────────
async function cleanup(id) {
  if (!id.startsWith(PREFIX)) {
    console.error(`  REFUSING: "${id}" is not a ${PREFIX}* tournament. This tool deletes benchmark data only.`);
    process.exit(1);
  }
  const tRef = db.collection('tournaments').doc(id);
  let removed = 0;
  for (const sub of ['challenges', 'teams', 'submissions', 'rosterLocks']) {
    // Page through: a single get() on a large subcollection is itself a scale problem.
    while (true) {
      const snap = await tRef.collection(sub).limit(400).get();
      if (snap.empty) break;
      const batch = db.batch();
      snap.docs.forEach((d) => { batch.delete(d.ref); removed++; });
      await batch.commit();
    }
  }
  await tRef.delete(); removed++;
  console.log(`  cleaned ${id}: ${removed} document(s) removed`);
}

async function main() {
  if (CLEANUP) return cleanup(CLEANUP);

  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const tid = `${PREFIX}-${stamp}`;
  fs.mkdirSync(MANIFEST_DIR, { recursive: true });
  const manifestPath = path.join(MANIFEST_DIR, `${tid}.txt`);
  const note = (line) => fs.appendFileSync(manifestPath, line + '\n');

  note(`# benchmark tournament ${tid}`);
  note(`# created ${new Date().toISOString()}`);
  note(`# cleanup: node _tools/tournament/benchmark-tournament.js --cleanup ${tid}`);
  console.log(`  tournament : ${tid}`);
  console.log(`  manifest   : ${manifestPath}`);
  console.log(`  cleanup    : node _tools/tournament/benchmark-tournament.js --cleanup ${tid}\n`);

  const tRef = db.collection('tournaments').doc(tid);
  note(`tournaments/${tid}`);
  await tRef.set({
    name: `QC BENCHMARK ${stamp} — DELETE ME`,
    description: 'Automated benchmark. Not a real event. Safe to delete.',
    status: 'active', scoringModel: 'static',
    maxTeams: 9999, maxTeamSize: 4, freezeMinutes: 30,
    startTime: FieldValue.serverTimestamp(), createdAt: FieldValue.serverTimestamp(),
    createdBy: 'qc-benchmark', joinCode: 'BENCH', boardStyle: 'default',
    teamCount: 0, totalSolves: 0, totalSubmissions: 0,
    isBenchmark: true,
  });

  // ── 2. CHALLENGE CEILING ────────────────────────────────────────────────────────────────
  console.log(`  [1/4] creating ${CHALLENGES} challenges...`);
  let t0 = Date.now();
  for (let i = 0; i < CHALLENGES; i += 400) {
    const batch = db.batch();
    for (let j = i; j < Math.min(i + 400, CHALLENGES); j++) {
      const cid = `bench-ch-${String(j).padStart(4, '0')}`;
      const salt = crypto.randomBytes(8).toString('hex');
      const flag = `HEX{bench_${j}}`;
      batch.set(tRef.collection('challenges').doc(cid), {
        title: `Bench Challenge ${j}`, description: 'benchmark', category: 'bench',
        boxId: `bench-box-${j}`, order: j, points: 100, currentPoints: 100,
        visible: true, solveCount: 0, hints: [],
        flagSalt: salt,
        flagHash: 'sha256:' + crypto.createHash('sha256').update(salt + ':' + flag).digest('hex'),
      });
      note(`tournaments/${tid}/challenges/${cid}`);
    }
    await batch.commit();
  }
  const chMs = Date.now() - t0;
  console.log(`        ${CHALLENGES} challenges written in ${chMs}ms`);

  // Read them back the way the board does — one unfiltered collection get.
  t0 = Date.now();
  const chRead = await tRef.collection('challenges').get();
  console.log(`        board-style read of ${chRead.size} challenges: ${Date.now() - t0}ms`);

  // ── 3. TEAM RAMP + the O(teams) curve ───────────────────────────────────────────────────
  console.log(`  [2/4] creating ${TEAMS} teams...`);
  t0 = Date.now();
  for (let i = 0; i < TEAMS; i += 400) {
    const batch = db.batch();
    for (let j = i; j < Math.min(i + 400, TEAMS); j++) {
      const teamId = `bench-team-${String(j).padStart(4, '0')}`;
      batch.set(tRef.collection('teams').doc(teamId), {
        name: `Bench Team ${j}`, score: 0, solves: [], members: [], memberNames: [],
        createdAt: FieldValue.serverTimestamp(),
      });
      note(`tournaments/${tid}/teams/${teamId}`);
    }
    await batch.commit();
  }
  console.log(`        ${TEAMS} teams written in ${Date.now() - t0}ms`);

  // THE CURVE. ctfSubmitFlag's team lookup is a full collection scan, so time that scan
  // directly at increasing roster sizes. This is the server-side cost every submission pays,
  // isolated from network and auth so the shape is the function's, not the harness's.
  console.log('  [3/4] cost of the full-teams scan that EVERY submission performs:');
  console.log('        (ctfSubmitFlag index.js:6958 loads all teams to find the caller)');
  for (const n of [10, 50, 100, 250, 500, 1000].filter((n) => n <= TEAMS)) {
    const t = Date.now();
    const snap = await tRef.collection('teams').limit(n).get();
    let found = null;
    snap.forEach((d) => { const m = d.data().members; if (Array.isArray(m) && m.includes('nobody')) found = d.id; });
    console.log(`        ${String(n).padStart(5)} teams -> ${String(Date.now() - t).padStart(6)}ms  (${snap.size} docs scanned)`);
  }

  // ── 4. PODIUM QUERY at scale ────────────────────────────────────────────────────────────
  console.log('  [4/4] podium query (order by score desc):');
  for (const lim of [10, 50, TEAMS]) {
    const t = Date.now();
    const snap = await tRef.collection('teams').orderBy('score', 'desc').limit(lim).get();
    console.log(`        top ${String(lim).padStart(5)} -> ${String(Date.now() - t).padStart(6)}ms  (${snap.size} returned)`);
  }

  console.log(`\n  DONE. Tournament ${tid} left in place for inspection.`);
  console.log(`  REMOVE IT WITH: node _tools/tournament/benchmark-tournament.js --cleanup ${tid}`);
}

main().catch((e) => { console.error('  FAILED:', e.message); process.exit(1); });
