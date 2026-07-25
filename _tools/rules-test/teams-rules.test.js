// Firestore security-rules test for tournaments/*/teams (BUG-024 lockdown).
// Run against the Firestore emulator:
//   firebase emulators:exec --only firestore --project=demo-hexworth \
//     "NODE_PATH=$(pwd)/node_modules node _tools/rules-test/teams-rules.test.js"
// Asserts the lockdown: teams are admin-write-only. Any non-admin create or update (including a
// client self-join attempt, field tampering, or crafted doc id) is denied. Self-service join/leave
// (Model B) is delivered separately via a ctfJoinTeam/ctfLeaveTeam Cloud Function (admin SDK), so it
// is intentionally DENIED at the rules layer here.
const { initializeTestEnvironment, assertSucceeds, assertFails } = require('@firebase/rules-unit-testing');
const { doc, setDoc, updateDoc, getDoc, arrayUnion } = require('firebase/firestore');
const fs = require('fs');
const path = require('path');

const RULES = fs.readFileSync(path.resolve(__dirname, '../../firestore.rules'), 'utf8');
const TEAM = 'tournaments/T1/teams/team-red';
const BASE = { name:'Red Cell', color:'#ef4444', captain:null, members:['existing'],
  memberNames:['Existing Person'], score:100, solves:['a','b'], hintPenalty:0, lastSolveTime:null };
const NEWTEAM = { name:'Blue Shield', color:'#3b82f6', captain:null, members:[], memberNames:[],
  score:0, solves:[], hintPenalty:0, lastSolveTime:null };

let pass = 0, fail = 0; const out = [];
async function ok(name, p){ try { await assertSucceeds(p); out.push(['PASS', name]); pass++; }
  catch(e){ out.push(['FAIL (expected ALLOW, got DENY)', name]); fail++; } }
async function no(name, p){ try { await assertFails(p); out.push(['PASS', name + ' [denied]']); pass++; }
  catch(e){ out.push(['FAIL (expected DENY, got ALLOW)', name]); fail++; } }

(async () => {
  const testEnv = await initializeTestEnvironment({
    projectId: 'demo-hexworth',
    firestore: { rules: RULES, host: '127.0.0.1', port: 8181 },
  });
  const reseed = () => testEnv.withSecurityRulesDisabled(c => setDoc(doc(c.firestore(), TEAM), BASE));
  const admin = testEnv.authenticatedContext('adminUid', { email: 'f.mora80@gmail.com' }).firestore();
  const stu   = testEnv.authenticatedContext('stu1').firestore();
  const anon  = testEnv.unauthenticatedContext().firestore();

  await reseed();

  // ── CREATE: admin-only (this is the BUG-024 root-cause close) ──
  await no('student creates a team with crafted fields',
    setDoc(doc(stu, 'tournaments/T1/teams/evil'), { name:'x', score:'<img src=x onerror=alert(1)>' }));
  await no('student creates a team with a crafted (XSS-shaped) doc id',
    setDoc(doc(stu, 'tournaments/T1/teams/x-img-onerror'), NEWTEAM));
  await ok('admin creates a well-formed team', setDoc(doc(admin, 'tournaments/T1/teams/team-blue'), NEWTEAM));

  // ── UPDATE: admin-only (self-join denied at rules; comes via ctfJoinTeam CF) ──
  await reseed();
  await no('student self-joins via client update (denied — CF path next)',
    updateDoc(doc(stu, TEAM), { members: arrayUnion('stu1'), memberNames: arrayUnion('Stu One') }));
  await reseed();
  await no('student tampers score', updateDoc(doc(stu, TEAM), { score: 99999 }));
  await reseed();
  await no('student tampers color', updateDoc(doc(stu, TEAM), { color: 'red;x:url(y)' }));
  await reseed();
  await no('student tampers team name', updateDoc(doc(stu, TEAM), { name: 'Pwned' }));
  await reseed();
  await no('student adds someone else to members', updateDoc(doc(stu, TEAM), { members: arrayUnion('victim') }));
  await reseed();
  await no('unauthenticated updates team', updateDoc(doc(anon, TEAM), { score: 1 }));

  // ── ADMIN can still manage anything (console flow) ──
  await reseed();
  await ok('admin updates score + solves', updateDoc(doc(admin, TEAM), { score: 4200, solves: arrayUnion('c') }));
  await ok('admin updates roster', updateDoc(doc(admin, TEAM), { members: arrayUnion('assigned'), memberNames: arrayUnion('Assigned Player') }));

  // ── Roster locks are Cloud-Function-only (client cannot read or write; admin SDK bypasses) ──
  await no('client reads a rosterLock', getDoc(doc(stu, 'tournaments/T1/rosterLocks/stu1')));
  await no('client writes a rosterLock', setDoc(doc(stu, 'tournaments/T1/rosterLocks/stu1'), { teamId: 'team-red' }));
  await no('admin (client SDK) writes a rosterLock too', setDoc(doc(admin, 'tournaments/T1/rosterLocks/adminUid'), { teamId: 'team-red' }));

  console.log('\n=== teams rules test (BUG-024 lockdown) ===');
  out.forEach(r => console.log('  ' + r[0].padEnd(34) + r[1]));
  console.log(`\n${pass} passed, ${fail} failed`);
  await testEnv.cleanup();
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('TEST HARNESS ERROR:', e); process.exit(2); });
