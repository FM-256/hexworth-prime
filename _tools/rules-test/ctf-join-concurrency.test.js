// Concurrency + recovery test for ctfJoinTeam / ctfLeaveTeam (BUG-024/BUG-026, Model B).
// Fires the ACTUAL Cloud Functions against the functions+firestore+auth emulators — this exercises
// the code path the roster-lock is claimed to fix (unlike the rules test, which only checks rules).
// Run: firebase emulators:exec --only functions,firestore,auth --project=demo-hexworth \
//        "NODE_PATH=$(pwd)/node_modules node _tools/rules-test/ctf-join-concurrency.test.js"
const { initializeTestEnvironment } = require('@firebase/rules-unit-testing');
const { initializeApp } = require('firebase/app');
const { getAuth, connectAuthEmulator, signInAnonymously } = require('firebase/auth');
const { getFunctions, connectFunctionsEmulator, httpsCallable } = require('firebase/functions');
const { doc, setDoc, getDoc, collection, getDocs, deleteDoc } = require('firebase/firestore');

const TEAMS = ['team-a', 'team-b', 'team-c', 'team-d', 'team-e'];

(async () => {
  const env = await initializeTestEnvironment({ projectId: 'demo-hexworth', firestore: { host: '127.0.0.1', port: 8181 } });
  const seed = () => env.withSecurityRulesDisabled(async (c) => {
    const db = c.firestore();
    await setDoc(doc(db, 'tournaments/T1'), { name: 'Test', status: 'lobby', maxTeamSize: 4 });
    for (const t of TEAMS) await setDoc(doc(db, `tournaments/T1/teams/${t}`),
      { name: t, color: '#112233', captain: null, members: [], memberNames: [], score: 0, solves: [] });
    const locks = await getDocs(collection(db, 'tournaments/T1/rosterLocks'));
    for (const d of locks.docs) await deleteDoc(d.ref);
  });
  await seed();

  const app = initializeApp({ projectId: 'demo-hexworth', apiKey: 'fake', authDomain: 'demo-hexworth.firebaseapp.com' }, 'client');
  const auth = getAuth(app); connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
  const fns = getFunctions(app, 'us-central1'); connectFunctionsEmulator(fns, '127.0.0.1', 5001);
  const uid = (await signInAnonymously(auth)).user.uid;
  const join = httpsCallable(fns, 'ctfJoinTeam');
  const leave = httpsCallable(fns, 'ctfLeaveTeam');

  let pass = 0, fail = 0; const log = [];
  const check = (name, cond) => { log.push([cond ? 'PASS' : 'FAIL', name]); cond ? pass++ : fail++; };
  const stateOfUid = async () => {
    let out;
    await env.withSecurityRulesDisabled(async (c) => {
      const db = c.firestore();
      const snap = await getDocs(collection(db, 'tournaments/T1/teams'));
      const inTeams = []; snap.forEach(d => { if ((d.data().members || []).includes(uid)) inTeams.push(d.id); });
      const lock = await getDoc(doc(db, `tournaments/T1/rosterLocks/${uid}`));
      out = { inTeams, lock: lock.exists() ? lock.data().teamId : null };
    });
    return out;
  };

  // TEST 1 — the flood: N concurrent joins to DIFFERENT teams, same uid. Exactly one may win.
  const results = await Promise.allSettled(TEAMS.map(t => join({ tournamentId: 'T1', teamId: t })));
  const ok = results.filter(r => r.status === 'fulfilled').length;
  const rej = results.filter(r => r.status === 'rejected').length;
  let s = await stateOfUid();
  check(`flood: uid ends on exactly ONE team (got ${s.inTeams.length}: [${s.inTeams}])`, s.inTeams.length === 1);
  check(`flood: exactly one lock, pointing at that team (lock=${s.lock})`, s.lock !== null && s.lock === s.inTeams[0]);
  check(`flood: ${ok} fulfilled / ${rej} rejected, all ${TEAMS.length} accounted for`, ok >= 1 && ok + rej === TEAMS.length);

  // TEST 2 — leave releases membership + lock.
  await leave({ tournamentId: 'T1', teamId: s.inTeams[0] });
  s = await stateOfUid();
  check(`leave: uid removed from all teams ([${s.inTeams}])`, s.inTeams.length === 0);
  check(`leave: lock released (lock=${s.lock})`, s.lock === null);

  // TEST 3 — orphaned-lock recovery: join, admin deletes the team doc, user leaves -> lock freed.
  await seed();
  await join({ tournamentId: 'T1', teamId: 'team-a' });
  await env.withSecurityRulesDisabled(c => deleteDoc(doc(c.firestore(), 'tournaments/T1/teams/team-a')));
  s = await stateOfUid(); check(`recovery precheck: lock stranded after team delete (lock=${s.lock})`, s.lock === 'team-a');
  await leave({ tournamentId: 'T1', teamId: 'team-a' });
  s = await stateOfUid(); check(`recovery: leave frees the stranded lock though team doc is gone (lock=${s.lock})`, s.lock === null);
  await join({ tournamentId: 'T1', teamId: 'team-b' });
  s = await stateOfUid(); check(`recovery: user can join again afterward ([${s.inTeams}])`, s.inTeams.length === 1 && s.inTeams[0] === 'team-b');

  // TEST 4 — team-full enforced inside the transaction.
  await seed();
  await env.withSecurityRulesDisabled(c => setDoc(doc(c.firestore(), 'tournaments/T1/teams/team-a'),
    { name: 'a', color: '#112233', captain: null, members: ['m1', 'm2', 'm3', 'm4'], memberNames: ['m1', 'm2', 'm3', 'm4'], score: 0, solves: [] }));
  let fullErr = false; try { await join({ tournamentId: 'T1', teamId: 'team-a' }); } catch (e) { fullErr = true; }
  s = await stateOfUid();
  check(`team-full: join rejected at maxSize (rejected=${fullErr}, inTeams=[${s.inTeams}])`, fullErr && s.inTeams.length === 0);

  // TEST 5 — leave a team you were never on, with no lock -> rejected (not a silent success).
  await seed();
  let leaveErr = false; try { await leave({ tournamentId: 'T1', teamId: 'team-c' }); } catch (e) { leaveErr = true; }
  check(`leave-never-joined: rejected when no membership and no stale lock (rejected=${leaveErr})`, leaveErr);

  console.log('\n=== ctfJoinTeam / ctfLeaveTeam concurrency + recovery ===');
  log.forEach(r => console.log('  ' + r[0].padEnd(6) + r[1]));
  console.log(`\n${pass} passed, ${fail} failed`);
  await env.cleanup();
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('HARNESS ERROR:', e); process.exit(2); });
