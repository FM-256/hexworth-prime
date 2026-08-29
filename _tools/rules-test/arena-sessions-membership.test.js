// arena_sessions: can a stranger write a room they never joined? And can members still play?
//
// @catalog what    both-directions proof for the arena_sessions update rule (membership boundary)
// @catalog run     firebase emulators:exec --only firestore --project=demo-hexworth "NODE_PATH=$(pwd)/node_modules node _tools/rules-test/arena-sessions-membership.test.js"
// @catalog status  TOOL
//
// THE BUG. `allow update: if request.auth != null` was scoped by nothing, so any signed-in user
// could write any session. `allow read: if request.auth != null` lets the same account LIST every
// session id, so the two together made every live room writable by anyone who bothered to
// enumerate them: flip `status` to disbanded, overwrite `winner`, corrupt the shared `state`.
//
// ASSERT BOTH DIRECTIONS. "Attack denied" alone is half a test, and the half that breaks users is
// the other one -- this rule sits on a live multiplayer feature, so every legitimate write shape
// the engine performs is exercised here, lifted from CoOpSync.js rather than imagined:
//   join (both modes)      CoOpSync.js:274, 299
//   heartbeat              CoOpSync.js:826
//   going offline          CoOpSync.js:872
//   state sync             CoOpSync.js:442-446
//   start / disband        CoOpSync.js:324, 641
//   surrender (NON-host)   CoOpSync.js:938   <- why the rule is membership, not host-only
//
// Players are keyed by _getPlayerId(), which returns the Firebase uid when signed in
// (CoOpSync.js:956-961), so `uid in players` is a genuine identity check.
const { initializeTestEnvironment, assertSucceeds, assertFails } = require('@firebase/rules-unit-testing');
const { doc, setDoc, updateDoc, getDoc } = require('firebase/firestore');
const fs = require('fs');
const path = require('path');

// RULES_FILE lets this run against the PRE-FIX ruleset to prove the attacks actually land
// there. A security test that has only ever been seen passing is not evidence: if it cannot
// fail, it is not measuring the thing it claims to measure.
const RULES = fs.readFileSync(
  process.env.RULES_FILE || path.resolve(__dirname, '../../firestore.rules'), 'utf8');

let pass = 0, fail = 0; const out = [];
async function ok(name, p) {
  try { await assertSucceeds(p); out.push(['PASS', name]); pass++; }
  catch (e) { out.push(['FAIL (expected ALLOW, got DENY)', name + ' :: ' + ((e && e.message) || e).toString().slice(0, 150)]); fail++; }
}
async function no(name, p) {
  try { await assertFails(p); out.push(['PASS', name + ' [denied]']); pass++; }
  catch (e) { out.push(['FAIL (expected DENY, got ALLOW)', name]); fail++; }
}

const player = (name, isHost) => ({ name, joinedAt: 1, online: true, isHost: !!isHost, lastSeen: 1 });

(async () => {
  const testEnv = await initializeTestEnvironment({
    projectId: 'demo-hexworth',
    firestore: { rules: RULES, host: '127.0.0.1', port: 8181 },
  });

  const host    = testEnv.authenticatedContext('hostUser').firestore();     // created the room
  const member  = testEnv.authenticatedContext('memberUser').firestore();   // joined the room
  const stranger= testEnv.authenticatedContext('strangerUser').firestore(); // never joined
  const anon    = testEnv.unauthenticatedContext().firestore();

  // Seed exactly what CoOpSync writes at creation (CoOpSync.js:153-200).
  const seedCoop = () => testEnv.withSecurityRulesDisabled((c) =>
    setDoc(doc(c.firestore(), 'arena_sessions/COOP1'), {
      boxId: 'box-1', mode: 'coop', config: { maxPlayers: 4 }, status: 'waiting', createdAt: 1,
      state: { flags: [] },
      players: { hostUser: player('Host', true), memberUser: player('Member', false) },
    }));
  const seedVs = () => testEnv.withSecurityRulesDisabled((c) =>
    setDoc(doc(c.firestore(), 'arena_sessions/VS1'), {
      boxId: 'box-1', mode: 'vs', config: { maxPlayers: 4 }, status: 'active', createdAt: 1, winner: null,
      teams: {
        alpha: { name: 'Team Alpha', players: { hostUser: player('Host', true) }, state: { flags: [] } },
        bravo: { name: 'Team Bravo', players: { memberUser: player('Member', false) }, state: { flags: [] } },
      },
    }));

  // ── THE ATTACK: a stranger writing a room they never joined ─────────────────
  await seedCoop();
  await no('co-op: stranger disbands a room they never joined',
    updateDoc(doc(stranger, 'arena_sessions/COOP1'), { status: 'disbanded' }));
  await no('co-op: stranger corrupts the shared state every player renders',
    updateDoc(doc(stranger, 'arena_sessions/COOP1'), { state: { flags: ['pwned'] } }));
  await no('co-op: stranger evicts the real players',
    updateDoc(doc(stranger, 'arena_sessions/COOP1'), { players: {} }));

  await seedVs();
  await no('VS: stranger declares a winner in a match they are not in',
    updateDoc(doc(stranger, 'arena_sessions/VS1'), { winner: 'alpha', status: 'completed' }));
  await no('VS: stranger overwrites a team\'s state',
    updateDoc(doc(stranger, 'arena_sessions/VS1'), { 'teams.alpha.state': { flags: ['pwned'] } }));

  await no('unauthenticated write is refused',
    updateDoc(doc(anon, 'arena_sessions/COOP1'), { status: 'disbanded' }));

  // ── THE OTHER HALF: every legitimate path the engine actually performs ──────
  await seedCoop();
  await ok('co-op: host starts the game (CoOpSync.js:324)',
    updateDoc(doc(host, 'arena_sessions/COOP1'), { status: 'active' }));
  await ok('co-op: member syncs shared state (CoOpSync.js:446)',
    updateDoc(doc(member, 'arena_sessions/COOP1'), { state: { flags: ['f1'] } }));
  await ok('co-op: member heartbeat (CoOpSync.js:826)',
    updateDoc(doc(member, 'arena_sessions/COOP1'), {
      'players.memberUser.lastSeen': 2, 'players.memberUser.online': true }));
  await ok('co-op: member goes offline (CoOpSync.js:872)',
    updateDoc(doc(member, 'arena_sessions/COOP1'), { 'players.memberUser.online': false }));
  await ok('co-op: host disbands (CoOpSync.js:641)',
    updateDoc(doc(host, 'arena_sessions/COOP1'), { status: 'disbanded' }));

  // Joining is OPEN BY DESIGN -- the room code is the ticket. What must not be possible is
  // writing a room without ending up in it, which the attack cases above cover.
  await seedCoop();
  await ok('co-op: a new player JOINS by adding themselves (CoOpSync.js:299)',
    updateDoc(doc(stranger, 'arena_sessions/COOP1'), {
      'players.strangerUser': player('Newcomer', false) }));

  await seedVs();
  await ok('VS: alpha member syncs their team state (CoOpSync.js:442)',
    updateDoc(doc(host, 'arena_sessions/VS1'), { 'teams.alpha.state': { flags: ['f1'] } }));
  await ok('VS: bravo member heartbeat (CoOpSync.js:826)',
    updateDoc(doc(member, 'arena_sessions/VS1'), {
      'teams.bravo.players.memberUser.lastSeen': 2 }));
  // THE CASE THAT RULES OUT HOST-ONLY. memberUser is NOT the host; surrender legitimately sets
  // winner and status. A host-only rule would deny this and break VS mode.
  await ok('VS: NON-HOST surrenders, setting winner + status (CoOpSync.js:938)',
    updateDoc(doc(member, 'arena_sessions/VS1'), { winner: 'alpha', status: 'completed' }));
  await ok('VS: a new player JOINS team bravo (CoOpSync.js:274)',
    updateDoc(doc(stranger, 'arena_sessions/VS1'), {
      'teams.bravo.players.strangerUser': player('Newcomer', false) }));

  // ── BUG-234: WHICH fields a member may write ────────────────────────────────────────────
  // Membership stops outsiders. These stop a member from cheating inside a room they joined.
  await seedVs();
  await no('BUG-234: alpha member overwrites BRAVO\'s state (forging opponent progress)',
    updateDoc(doc(host, 'arena_sessions/VS1'), { 'teams.bravo.state': { flags: ['forged'] } }));
  // Must inject SOMEBODY ELSE. Writing your OWN uid into the other team is a team switch,
  // which vsTeamOk permits by design -- the first version of this case used the writer's own
  // uid and so merely re-tested the join path while claiming to test infiltration.
  await no('BUG-234: alpha member writes ANOTHER person into BRAVO\'s roster',
    updateDoc(doc(host, 'arena_sessions/VS1'), {
      'teams.bravo.players.strangerUser': player('Infiltrator', false) }));
  await no('BUG-234: member repoints the session at different lab content',
    updateDoc(doc(host, 'arena_sessions/VS1'), { boxId: 'some-other-box' }));
  await no('BUG-234: member rewrites config (e.g. maxPlayers)',
    updateDoc(doc(host, 'arena_sessions/VS1'), { config: { maxPlayers: 99 } }));
  await no('BUG-234: member parks the room in an undefined status',
    updateDoc(doc(host, 'arena_sessions/VS1'), { status: 'rigged' }));

  // ── THE LAUNDERING ATTACK Nancy reproduced against the first version of vsTeamOk.
  //    The membership branch constrained the players sub-map but not `state`, and an attacker
  //    satisfies "is a member of bravo" by ADDING THEMSELVES. Both the single-write form and
  //    the two-step form are asserted, because the first fix attempt would have stopped
  //    neither and a test of only one shape would have looked green for the wrong reason.
  await seedVs();
  await no('LAUNDERING: alpha member self-joins bravo AND rewrites bravo state in ONE write',
    updateDoc(doc(host, 'arena_sessions/VS1'), {
      'teams.bravo.players.hostUser': player('Mole', false),
      'teams.bravo.state': { flags: ['forged'], score: -99999 } }));
  await no('LAUNDERING step 1: alpha member self-joins bravo at all (dual membership)',
    updateDoc(doc(host, 'arena_sessions/VS1'), {
      'teams.bravo.players.hostUser': player('Mole', false) }));
  // Even a genuine bravo member may not edit bravo state in the SAME write that joins them --
  // joining and editing are decoupled, so a future regression in dual-membership alone is not
  // enough to reopen this.
  await no('LAUNDERING: a joining player edits that team\'s state in the joining write',
    updateDoc(doc(stranger, 'arena_sessions/VS1'), {
      'teams.bravo.players.strangerUser': player('Newcomer', false),
      'teams.bravo.state': { flags: ['forged'] } }));

  // A decided match is IMMUTABLE. This is the theft the report named.
  const seedDecided = () => testEnv.withSecurityRulesDisabled((c) =>
    setDoc(doc(c.firestore(), 'arena_sessions/VSDONE'), {
      boxId: 'box-1', mode: 'vs', config: { maxPlayers: 4 }, status: 'completed', createdAt: 1,
      winner: 'bravo',
      teams: {
        alpha: { name: 'Team Alpha', players: { hostUser: player('Host', true) }, state: { flags: [] } },
        bravo: { name: 'Team Bravo', players: { memberUser: player('Member', false) }, state: { flags: [] } },
      },
    }));
  await seedDecided();
  await no('BUG-234: the LOSER overwrites a decided winner',
    updateDoc(doc(host, 'arena_sessions/VSDONE'), { winner: 'alpha' }));

  // ── BOTH legitimate ways a VS match ends must still work. The first draft of winnerOk()
  //    allowed only surrender and would have broken the primary win path outright.
  await seedVs();
  await ok('VS: submitFlag declares the writer\'s OWN team winner (CoOpSync.js:544)',
    updateDoc(doc(host, 'arena_sessions/VS1'), {
      'teams.alpha.state': { flags: ['f1'], completed: true }, winner: 'alpha', status: 'completed' }));
  await seedVs();
  await ok('VS: surrender declares the OPPONENT winner (CoOpSync.js:957)',
    updateDoc(doc(member, 'arena_sessions/VS1'), { winner: 'alpha', status: 'completed' }));

  // ── Host migration writes TWO player entries in one transaction and the writer may be
  //    neither. A per-player constraint on co-op would have broken recovery from a host
  //    disconnect, which is why co-op players are deliberately left unscoped.
  await seedCoop();
  await ok('co-op: host migration demotes one player and promotes another (CoOpSync.js:811)',
    updateDoc(doc(member, 'arena_sessions/COOP1'), {
      'players.hostUser.isHost': false, 'players.memberUser.isHost': true }));

  // ── LEGACY DOCS: sessions whose players are keyed by the pre-fix `anon_*` localStorage id.
  //    Nancy's concern, and the one 9ec369431 named on 2026-08-04: a uid-membership rule
  //    "would lock out a legitimately racing player". Measured here instead of assumed, because
  //    the answer decides whether this can deploy at all.
  const seedLegacy = () => testEnv.withSecurityRulesDisabled((c) =>
    setDoc(doc(c.firestore(), 'arena_sessions/LEGACY1'), {
      boxId: 'box-1', mode: 'coop', config: { maxPlayers: 4 }, status: 'active', createdAt: 1,
      state: { flags: [] },
      // The same human as `memberUser`, but keyed by the localStorage fallback id.
      players: { anon_abc123: player('LegacyPlayer', true) },
    }));

  await seedLegacy();
  // CONFIRMS THE RISK IS REAL: their in-flight heartbeat is denied, because the doc records
  // them under a key that is not their uid. This is the breakage Nancy blocked on.
  await no('legacy: mis-keyed player heartbeat is DENIED (the real transition cost)',
    updateDoc(doc(member, 'arena_sessions/LEGACY1'), { 'players.anon_abc123.lastSeen': 2 }));

  // BUT IT SELF-HEALS ON REJOIN: once the client re-derives identity, join writes the uid key,
  // and isJoining() permits exactly that. So a page reload repairs the session rather than
  // requiring a migration -- which bounds the blast radius to players who stay mid-game across
  // the deploy without reloading.
  await ok('legacy: the same player REJOINS under their uid and is repaired',
    updateDoc(doc(member, 'arena_sessions/LEGACY1'), {
      'players.memberUser': player('LegacyPlayer', true) }));
  await ok('legacy: after repair, their heartbeat works again',
    updateDoc(doc(member, 'arena_sessions/LEGACY1'), { 'players.memberUser.lastSeen': 3 }));

  // ── activity subcollection. Subcollection rules do NOT inherit the parent's conditions, so
  //    this is asserted separately or the fix has a window next to its closed door.
  await seedCoop();
  await no('activity: stranger forges an entry into a room they never joined',
    setDoc(doc(stranger, 'arena_sessions/COOP1/activity/a1'),
      { player: 'Ghost', playerId: 'strangerUser', action: 'cheat', detail: 'x', timestamp: 1 }));
  await no('activity: MEMBER forges an entry attributed to somebody else',
    setDoc(doc(member, 'arena_sessions/COOP1/activity/a2'),
      { player: 'Host', playerId: 'hostUser', action: 'forged', detail: 'x', timestamp: 1 }));
  await ok('activity: member logs their own action (CoOpSync.js:620)',
    setDoc(doc(member, 'arena_sessions/COOP1/activity/a3'),
      { player: 'Member', playerId: 'memberUser', action: 'flag_found', detail: 'x', timestamp: 1 }));

  // Reads are unchanged by this fix; asserted so a future edit cannot silently narrow them.
  await seedCoop();
  await ok('read still works for any signed-in user (unchanged)',
    getDoc(doc(stranger, 'arena_sessions/COOP1')));
  await ok('activity read still works for any signed-in user (unchanged)',
    getDoc(doc(stranger, 'arena_sessions/COOP1/activity/a3')));

  for (const [s, n] of out) console.log(`  ${s.padEnd(32)} ${n}`);
  console.log(`\n  ${pass} passed, ${fail} failed`);
  await testEnv.cleanup();
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
