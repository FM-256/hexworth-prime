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

    /* Which physical box each team is wired to, per challenge. Read here so a per-team flag can be
     * checked against the machine the team is ACTUALLY on: a hash is only meaningful relative to a
     * box, and the pairing is the thing that silently rots. One read per team, and a tournament has
     * a handful of teams. */
    const assignmentBox = new Map();   // `${teamId}|${challengeId}` -> fromPool (may be undefined)
    for (const tm of teams.docs) {
      const asg = await tm.ref.collection('assignments').get();
      for (const a of asg.docs) assignmentBox.set(`${tm.id}|${a.id}`, a.data().fromPool || null);
    }
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

    /* ── Challenges. A challenge with no points, or no stored secret, cannot score: it will
     *    accept nothing or award nothing, and either way a student's work vanishes silently.
     *
     *    THE SECRET MOVED (taskboard 401). flagHash/flagSalt used to live on this doc, which is
     *    publicly readable, so they were published rather than protected and all 5 live flags
     *    were recovered from them. They now live in tournaments/{id}/flagSecrets/{chId}.
     *    Reading the old location here would report EVERY migrated challenge as unsolvable, and
     *    a tool that cries wolf about correct data is worse than no tool.
     *
     *    The inverse is now a finding in its own right: crypto still sitting on the challenge
     *    doc means this tournament has not been migrated, or something wrote the old shape
     *    after the migration ran. */
    /*    AND THE SECRET CAN NOW BE PER TEAM (taskboard 419), which this check got wrong in BOTH
     *    directions until Chris caught it. A real-box challenge stores
     *    flagSecrets/{chId}.perTeam = { teamId: {flagSalt, flagHash, box} } and correctly has NO
     *    top-level flagSalt/flagHash at all -- so the doc-level test alone reported a perfectly
     *    configured challenge as having no secret, which is exactly the crying-wolf failure the
     *    comment above warns against, reintroduced one paragraph below it.
     *
     *    The inverse was worse because it was silent: a PARTIAL perTeam (four of six teams) passed
     *    without comment, and a team with no entry is REFUSED by ctfSubmitFlag rather than graded,
     *    so those teams could not score at all for the whole event and this tool said nothing.
     *    Completeness is therefore checked per team, not per challenge.
     *
     *    Provenance too: each entry records the box it was minted against, and an entry whose box
     *    no longer matches that team's assignment means the team is playing a machine whose flag
     *    belongs to someone else -- they cannot score, and their correct flag gets logged as a
     *    flag-match against them. That is a pre-flight finding, not a runtime surprise. */
    const secretsSnap = await doc.ref.collection('flagSecrets').get();
    const secretShape = new Map();
    for (const d of secretsSnap.docs) {
      const v = d.data();
      const hasShared = !!(v.flagHash && v.flagSalt);
      const perTeam = (v.perTeam && typeof v.perTeam === 'object') ? v.perTeam : null;
      secretShape.set(d.id, { hasShared, perTeam });
    }
    const rosterIds = teams.docs.map((t) => t.id);
    const teamLabel = new Map(teams.docs.map((t) => [t.id, t.data().name || t.id]));
    const noHash = [], noPoints = [], hasRawFlag = [], stillPublic = [];
    const partialPerTeam = [], staleProvenance = [], unverifiablePerTeam = [];
    for (const c of challenges.docs) {
      const d = c.data();
      if (d.flagHash || d.flagSalt) stillPublic.push(c.id);
      const shape = secretShape.get(c.id);
      /* A challenge is gradeable if it has a shared secret OR a per-team map. Either shape alone is
       * correct: one box for everyone means one flag, per-team boxes mean per-team flags. */
      if (!shape || (!shape.hasShared && !shape.perTeam)) noHash.push(c.id);
      if (shape && shape.perTeam) {
        const missing = rosterIds.filter((id) => {
          const e = shape.perTeam[id];
          return !e || !e.flagSalt || !e.flagHash;
        });
        if (missing.length) {
          partialPerTeam.push(`${c.id} missing ${missing.length}/${rosterIds.length}: `
            + missing.slice(0, 6).map((id) => teamLabel.get(id) || id).join(', '));
        }
        for (const id of rosterIds) {
          const e = shape.perTeam[id];
          if (!e || !e.flagSalt || !e.flagHash) continue;
          /* A MISSING assignment document counts as drift, and gating this on `asg !== undefined`
           * was a blind spot Nancy reproduced: a team holding a per-team flag with NO assignment at
           * all passed with zero findings here, while describePerTeamDrift in the console correctly
           * reports it as "now on NO box". Two consumers built from one root cause disagreeing on one
           * input is worse than either behaviour alone, because the runbook offers them as equivalent
           * ways to check the same thing. Not contrived either: releasePoolFromTournament DELETES
           * assignment documents, so this is the ordinary residue of a documented admin action. */
          const asg = assignmentBox.has(`${id}|${c.id}`) ? assignmentBox.get(`${id}|${c.id}`) : null;
          if (!e.box) unverifiablePerTeam.push(`${c.id}/${teamLabel.get(id) || id}`);
          else if (e.box !== asg) {
            staleProvenance.push(`${c.id}/${teamLabel.get(id) || id}: flag minted on ${e.box}, team now wired to ${asg || 'NO box'}`);
          }
        }
      }
      if (typeof d.points !== 'number' || d.points <= 0) noPoints.push(`${c.id}(${d.points})`);
      // A raw flag in a world-readable doc is a giveaway, not a hash.
      if (d.flag || d.answer || d.solution) hasRawFlag.push(c.id);
    }
    if (challenges.size) {
      console.log(`     challenge fields: ${[...new Set(challenges.docs.flatMap((c) => Object.keys(c.data())))].sort().join(', ')}`);
    }
    if (noHash.length)     { problems.push(`${doc.id}: ${noHash.length} challenge(s) have NO flagSecrets entry, so ctfSubmitFlag REFUSES them: ${noHash.slice(0, 8)}`); }
    if (stillPublic.length) { problems.push(`${doc.id}: ${stillPublic.length} challenge(s) STILL carry flagHash/flagSalt on the world-readable doc, run the Flag Secrets Migration (taskboard 401): ${stillPublic.slice(0, 8)}`); }
    if (noPoints.length)   { problems.push(`${doc.id}: ${noPoints.length} challenge(s) have no positive points — solving them scores nothing: ${noPoints.slice(0, 8)}`); }
    if (hasRawFlag.length) { problems.push(`${doc.id}: ${hasRawFlag.length} challenge(s) carry a RAW flag field in a world-readable doc: ${hasRawFlag.slice(0, 8)}`); }
    if (partialPerTeam.length) { problems.push(`${doc.id}: ${partialPerTeam.length} challenge(s) have an INCOMPLETE perTeam map, and a team with no entry is REFUSED rather than graded, so those teams cannot score at all: ${partialPerTeam.slice(0, 6).join(' | ')}`); }
    if (staleProvenance.length) { problems.push(`${doc.id}: ${staleProvenance.length} per-team flag(s) were minted on a DIFFERENT box than the team is wired to now, so those teams cannot score and their correct flag will be logged as a flag-match against them — re-mint and re-register (taskboard 419): ${staleProvenance.slice(0, 6).join(' | ')}`); }
    if (unverifiablePerTeam.length) { problems.push(`${doc.id}: ${unverifiablePerTeam.length} per-team flag(s) record no box provenance, so drift against the current wiring CANNOT be checked — re-register them to record it: ${unverifiablePerTeam.slice(0, 6).join(' | ')}`); }

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
