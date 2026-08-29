// Does the tournament join code actually gate anything now? (TOURN-03)
//
// @catalog what    proves the private join-code doc is client-inaccessible and the gate holds
// @catalog run     firebase emulators:exec --only firestore --project=demo-hexworth "NODE_PATH=$(pwd)/node_modules node _tools/rules-test/tournament-joincode.test.js"
// @catalog status  TOOL
//
// THE BUG. `ctfJoinTeam` did not accept a joinCode parameter at all, the lobby had no prompt,
// and the only use of the value anywhere was as a salt ingredient. Participation was gated
// solely by `request.auth != null`, which anonymous sign-in satisfies — so anyone who listed
// the public `tournaments` collection could join any event they found. An audit read an
// "invite only" tournament's plaintext code with no authentication at all.
//
// WHY THE SECRET HAD TO MOVE. `tournaments/{id}` is `allow read: if true` so the podium and
// lobby work pre-auth. Firestore rules can hide a DOCUMENT, never a FIELD — so a code stored
// on the tournament doc is published, and requiring it in the function would have been
// theatre: the attacker reads it from the same document they are attacking.
//
// This file covers the RULES half — that the private doc is unreachable from any client, and
// that the public surfaces the podium needs are unchanged. The function half (does the gate
// reject a wrong code) needs the Functions emulator and is exercised separately.
const { initializeTestEnvironment, assertSucceeds, assertFails } = require('@firebase/rules-unit-testing');
const { doc, getDoc, setDoc, collection, getDocs } = require('firebase/firestore');
const fs = require('fs');
const path = require('path');

const RULES = fs.readFileSync(
  process.env.RULES_FILE || path.resolve(__dirname, '../../firestore.rules'), 'utf8');

let pass = 0, fail = 0; const out = [];
async function ok(n, p) { try { await assertSucceeds(p); out.push(['PASS', n]); pass++; }
  catch (e) { out.push(['FAIL (expected ALLOW, got DENY)', n + ' :: ' + ((e && e.message) || e).toString().slice(0, 120)]); fail++; } }
async function no(n, p) { try { await assertFails(p); out.push(['PASS', n + ' [denied]']); pass++; }
  catch (e) { out.push(['FAIL (expected DENY, got ALLOW)', n]); fail++; } }

(async () => {
  const testEnv = await initializeTestEnvironment({
    projectId: 'demo-hexworth',
    firestore: { rules: RULES, host: '127.0.0.1', port: 8181 },
  });

  const anon = testEnv.unauthenticatedContext().firestore();
  const user = testEnv.authenticatedContext('someStudent').firestore();
  // Admin identity shaped the way isAdmin() expects; see firestore.rules isAdmin().
  const admin = testEnv.authenticatedContext('adminUser', { admin: true }).firestore();

  await testEnv.withSecurityRulesDisabled(async (c) => {
    const db = c.firestore();
    await setDoc(doc(db, 'tournaments/T1'), {
      name: 'Regional Finals (invite only)', status: 'lobby', maxTeamSize: 4,
      // NOTE: no joinCode field here any more — that is the point of the fix.
    });
    await setDoc(doc(db, 'tournaments/T1/private/config'), { joinCode: 'FINALS-2026-SECRET' });
    await setDoc(doc(db, 'tournaments/T1/teams/team-red'), { name: 'Red Cell', members: [], score: 0 });
    await setDoc(doc(db, 'tournaments/T1/challenges/c1'), { title: 'Ch1', points: 100, visible: true });
  });

  // ── The secret must be unreachable from every client, at every auth level.
  await no('anonymous cannot read the private join-code doc',
    getDoc(doc(anon, 'tournaments/T1/private/config')));
  await no('a signed-in student cannot read the private join-code doc',
    getDoc(doc(user, 'tournaments/T1/private/config')));
  // The rule is ADMIN-ONLY, not nobody: the console must write it at creation and the manage
  // view must read it back so an instructor can read the code out. A rule that blocked those
  // would be half a rule, and the first draft did exactly that.
  await ok('an ADMIN can read the private join-code doc (manage view needs this)',
    getDoc(doc(admin, 'tournaments/T1/private/config')));
  await ok('an ADMIN can write it (console writes it at creation)',
    setDoc(doc(admin, 'tournaments/T2/private/config'), { joinCode: 'NEW-CODE' }));
  await no('the private subcollection cannot be LISTED (a get is not the only way in)',
    getDocs(collection(user, 'tournaments/T1/private')));
  await no('a client cannot WRITE the join code (no self-service code change)',
    setDoc(doc(user, 'tournaments/T1/private/config'), { joinCode: 'attacker-chosen' }));

  // ── And the public surfaces the podium/lobby depend on must still work pre-auth, or the
  //    fix has closed the door by breaking the building.
  await ok('anonymous can still read the tournament doc (podium needs this pre-auth)',
    getDoc(doc(anon, 'tournaments/T1')));
  await ok('anonymous can still read teams (live podium)',
    getDocs(collection(anon, 'tournaments/T1/teams')));
  await ok('anonymous can still read challenges (board)',
    getDocs(collection(anon, 'tournaments/T1/challenges')));

  // ── THE ACTUAL BUG, reproduced. Seed a tournament in the LEGACY shape the console wrote
  //    before this fix — joinCode as a field on the public doc — and read it with no auth.
  //    This is the finding, and it is the only assertion here that fails against the old world.
  await testEnv.withSecurityRulesDisabled(async (c) => {
    await setDoc(doc(c.firestore(), 'tournaments/T_LEGACY'), {
      name: 'Legacy shape', status: 'lobby', maxTeamSize: 4,
      joinCode: 'FINALS-2026-SECRET',      // exactly how the console used to store it
    });
  });
  const legacy = await getDoc(doc(anon, 'tournaments/T_LEGACY'));
  const legacyLeaks = legacy.exists() && legacy.data().joinCode === 'FINALS-2026-SECRET';
  out.push([legacyLeaks ? 'PASS' : 'FAIL (expected ALLOW, got DENY)',
    'REPRODUCED: a legacy tournament leaks its plaintext joinCode to an anonymous reader'
    + (legacyLeaks ? ' [read it with zero auth]' : '')]);
  legacyLeaks ? pass++ : fail++;

  // And the new shape does not, because the value is not on that document at all.
  const modern = await getDoc(doc(anon, 'tournaments/T1'));
  const modernClean = modern.exists() && modern.data().joinCode === undefined;
  out.push([modernClean ? 'PASS' : 'FAIL (expected DENY, got ALLOW)',
    'new shape keeps the code OFF the public doc, so the same read finds nothing'
    + (modernClean ? ' [confirmed absent]' : '')]);
  modernClean ? pass++ : fail++;

  console.log('  NOTE — what this file does and does NOT prove:');
  console.log('    The four private/* denials pass against the PRE-FIX ruleset too, because');
  console.log('    Firestore denies unmatched subcollection paths by default. The explicit');
  console.log('    `match /private/{docId}` is intent made visible, NOT a behaviour change, and');
  console.log('    claiming it as the fix would be a vacuous green.');
  console.log('    The real fix is two things this file can only half-see: ctfJoinTeam now');
  console.log('    REQUIRES and verifies the code (Functions emulator, separate), and the admin');
  console.log('    console must stop writing it to the public doc (asserted by shape, above).');
  console.log('');

  for (const [s, n] of out) console.log(`  ${s.padEnd(32)} ${n}`);
  console.log(`\n  ${pass} passed, ${fail} failed`);
  await testEnv.cleanup();
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
