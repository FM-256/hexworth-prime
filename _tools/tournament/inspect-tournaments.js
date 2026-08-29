#!/usr/bin/env node
/*
 * What is the tournament system ACTUALLY tracking in production, as opposed to what the code
 * says it tracks?
 *
 * @catalog what    read-only audit of live tournaments: boxes, teams, scores, podium accuracy
 * @catalog run     node _tools/tournament/inspect-tournaments.js [--tournament <id>]
 * @catalog status  TOOL
 *
 * READ-ONLY. Every operation here is a .get(). It never writes, never deletes, and touches no
 * subcollection it does not print. Operator authorised this specific inspection 2026-08-29.
 *
 * WHY IT EXISTS. Auditing the CODE tells you what the system is designed to track. It cannot
 * tell you which boxes are silently not tracking right now, whether a team's stored `score`
 * still agrees with the submissions that produced it, or whether the podium is ordering by a
 * number that drifted. Those are questions only the live data answers, and every one of them
 * is a way the tournament can look healthy while being wrong.
 *
 * THE CENTRAL CHECK is score reconciliation: recompute each team's score from its accepted
 * submissions and compare to the stored value. A stored score is a CACHE of the submission
 * log. If they disagree, the podium is lying, and it will keep lying quietly.
 */
const admin = require('firebase-admin');
admin.initializeApp({ projectId: 'hexworth-prime' });
const db = admin.firestore();

const only = (() => {
  const i = process.argv.indexOf('--tournament');
  return i > 0 ? process.argv[i + 1] : null;
})();

const pad = (s, n) => String(s === undefined || s === null ? '' : s).padEnd(n);

(async () => {
  const snap = await db.collection('tournaments').get();
  if (snap.empty) {
    console.log('  NO TOURNAMENTS in production.');
    console.log('  Nothing is tracking because nothing exists — which is itself the answer to');
    console.log('  "what is not tracking": the system has never been exercised with real data.');
    return;
  }

  console.log(`  ${snap.size} tournament(s) in production\n`);
  const problems = [];

  for (const doc of snap.docs) {
    if (only && doc.id !== only) continue;
    const t = doc.data();
    console.log(`  ══ ${doc.id} ══`);
    console.log(`     name    : ${t.name || '(unnamed)'}`);
    console.log(`     status  : ${t.status || '(none)'}`);
    console.log(`     created : ${t.createdAt && t.createdAt.toDate ? t.createdAt.toDate().toISOString() : t.createdAt || '(none)'}`);
    console.log(`     fields  : ${Object.keys(t).sort().join(', ')}`);

    const [challenges, teams, submissions] = await Promise.all([
      doc.ref.collection('challenges').get(),
      doc.ref.collection('teams').get(),
      doc.ref.collection('submissions').get(),
    ]);
    console.log(`     challenges ${challenges.size} · teams ${teams.size} · submissions ${submissions.size}`);
    console.log(`     limits  : maxTeams=${t.maxTeams} maxTeamSize=${t.maxTeamSize} scoringModel=${t.scoringModel} freezeMinutes=${t.freezeMinutes}`);

    // ── DENORMALISED COUNTERS on the tournament doc. The board and podium can render these
    //    instead of counting, so a drifted counter is a display that is confidently wrong.
    //    A counter is a cache; caches drift; this is the cheapest place to catch it.
    const accepted = submissions.docs.filter((s) => {
      const d = s.data();
      return d.correct === true || d.accepted === true || d.status === 'accepted';
    }).length;
    const counters = [
      ['teamCount', t.teamCount, teams.size],
      ['totalSubmissions', t.totalSubmissions, submissions.size],
      ['totalSolves', t.totalSolves, accepted],
    ];
    for (const [name, stored, actual] of counters) {
      const bad = stored !== actual;
      console.log(`     counter ${pad(name, 18)} stored=${pad(stored, 6)} actual=${pad(actual, 6)}${bad ? '  <-- DRIFTED' : ''}`);
      if (bad) problems.push(`${doc.id}: ${name} says ${stored} but the collection holds ${actual} — anything rendering this counter is wrong`);
    }

    // solveCount per challenge is the same class of cache, and it drives "how many teams solved
    // this" on the board.
    const solvesByChallenge = new Map();
    for (const s of submissions.docs) {
      const d = s.data();
      if (d.correct === true || d.accepted === true || d.status === 'accepted') {
        solvesByChallenge.set(d.challengeId, (solvesByChallenge.get(d.challengeId) || 0) + 1);
      }
    }
    for (const c of challenges.docs) {
      const stored = c.data().solveCount;
      const actual = solvesByChallenge.get(c.id) || 0;
      if (typeof stored === 'number' && stored !== actual) {
        problems.push(`${doc.id}/${c.id}: solveCount says ${stored}, submissions show ${actual}`);
      }
    }

    // ── Challenges. A challenge with no points, or no flagHash, cannot score: it will accept
    //    nothing or award nothing, and either way a student's work vanishes silently.
    const noHash = [], noPoints = [], hasRawFlag = [];
    for (const c of challenges.docs) {
      const d = c.data();
      if (!d.flagHash) noHash.push(c.id);
      if (typeof d.points !== 'number' || d.points <= 0) noPoints.push(`${c.id}(${d.points})`);
      // A raw flag in a world-readable doc is a giveaway, not a hash.
      if (d.flag || d.answer || d.solution) hasRawFlag.push(c.id);
    }
    if (challenges.size) {
      console.log(`     challenge fields: ${[...new Set(challenges.docs.flatMap((c) => Object.keys(c.data())))].sort().join(', ')}`);
    }
    if (noHash.length)     { problems.push(`${doc.id}: ${noHash.length} challenge(s) have NO flagHash — unsolvable: ${noHash.slice(0, 8)}`); }
    if (noPoints.length)   { problems.push(`${doc.id}: ${noPoints.length} challenge(s) have no positive points — solving them scores nothing: ${noPoints.slice(0, 8)}`); }
    if (hasRawFlag.length) { problems.push(`${doc.id}: ${hasRawFlag.length} challenge(s) carry a RAW flag field in a world-readable doc: ${hasRawFlag.slice(0, 8)}`); }

    // ── THE RECONCILIATION. Recompute each team's score from accepted submissions.
    const byTeam = new Map();
    const dupes = new Map();      // teamId|challengeId -> count, to catch double-credit
    const orphanTeam = [], orphanChallenge = [];
    const challengeIds = new Set(challenges.docs.map((c) => c.id));
    const teamIds = new Set(teams.docs.map((t) => t.id));
    const points = new Map(challenges.docs.map((c) => [c.id, c.data().points || 0]));

    for (const s of submissions.docs) {
      const d = s.data();
      const accepted = d.correct === true || d.accepted === true || d.status === 'accepted';
      if (!accepted) continue;
      if (d.teamId && !teamIds.has(d.teamId)) orphanTeam.push(s.id);
      if (d.challengeId && !challengeIds.has(d.challengeId)) orphanChallenge.push(s.id);
      const key = `${d.teamId}|${d.challengeId}`;
      dupes.set(key, (dupes.get(key) || 0) + 1);
      byTeam.set(d.teamId, (byTeam.get(d.teamId) || 0) + (points.get(d.challengeId) || 0));
    }

    const doubleCredited = [...dupes.entries()].filter(([, n]) => n > 1);
    if (doubleCredited.length) problems.push(`${doc.id}: ${doubleCredited.length} team/challenge pair(s) have MORE THAN ONE accepted submission — double credit: ${doubleCredited.slice(0, 5).map(([k, n]) => `${k}×${n}`)}`);
    if (orphanTeam.length)      problems.push(`${doc.id}: ${orphanTeam.length} accepted submission(s) reference a team that does not exist`);
    if (orphanChallenge.length) problems.push(`${doc.id}: ${orphanChallenge.length} accepted submission(s) reference a challenge that does not exist`);

    if (teams.size) {
      console.log('     team                       stored  recomputed  solves  members');
      for (const tm of teams.docs) {
        const d = tm.data();
        const recomputed = byTeam.get(tm.id) || 0;
        const stored = typeof d.score === 'number' ? d.score : null;
        const flag = stored === null ? ' NO SCORE FIELD' : (stored !== recomputed ? '  <-- MISMATCH' : '');
        console.log(`     ${pad(d.name || tm.id, 26)} ${pad(stored, 7)} ${pad(recomputed, 11)} ${pad((d.solves || []).length ?? '', 7)} ${pad((d.members || []).length, 7)}${flag}`);
        if (stored !== null && stored !== recomputed) {
          problems.push(`${doc.id}/${tm.id}: stored score ${stored} != ${recomputed} recomputed from submissions — the podium is showing a number the log does not support`);
        }
        if (stored === null) problems.push(`${doc.id}/${tm.id}: team has NO score field — podium cannot rank it`);
        // members[] and memberNames[] are parallel arrays; drift means the board shows wrong names.
        if (d.members && d.memberNames && d.members.length !== d.memberNames.length) {
          problems.push(`${doc.id}/${tm.id}: members(${d.members.length}) and memberNames(${d.memberNames.length}) are OUT OF SYNC — displayed names do not match the roster`);
        }
      }
    }
    console.log('');
  }

  console.log('  ── findings ──');
  if (!problems.length) console.log('     none: stored scores reconcile with the submission log, and every challenge can score.');
  for (const p of problems) console.log(`     ${p}`);
})().catch((e) => { console.error('  FAILED:', e.message); process.exit(1); });
