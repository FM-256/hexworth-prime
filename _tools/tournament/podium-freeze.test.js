#!/usr/bin/env node
/*
 * Does the podium freeze actually hold standings, or just print a banner over live ones?
 *
 * @catalog what    state-machine test of the TOURN-08 podium freeze + the listener bound
 * @catalog run     node _tools/tournament/podium-freeze.test.js
 * @catalog status  TOOL
 *
 * THE BUG. tournament-podium.html's frozen branch only prepended "Scoreboard is frozen" while
 * its onSnapshot listener kept pushing live scores straight into the render. So the documented
 * "final standings will be revealed when the tournament ends" was false on the single page most
 * likely to be projected in a room. broadcast.html already implemented a real hard freeze; the
 * podium never got it.
 *
 * WHAT THIS COVERS AND WHAT IT DOES NOT. The freeze is a small state machine over
 * (status, incoming standings) and that is what is asserted here, lifted verbatim from the
 * page. It does NOT drive the real page against a real Firestore listener: the podium loads the
 * compat SDK against production config, and pointing it at an emulator would be testing a
 * different page than the one that ships. So this proves the LOGIC is right; a human watching a
 * projector during an actual freeze is what would prove the wiring. That gap is stated rather
 * than papered over.
 */

// Verbatim from tournament-podium.html renderLeaderboard(). Kept as a standalone reducer so a
// drift between the two is visible in a diff rather than silently untested.
function makeFreeze() {
  let frozenTeams = null;
  return function step(status, ranked) {
    let teams;
    if (status === 'frozen') {
      if (!frozenTeams && ranked.length) frozenTeams = ranked.slice();
      teams = frozenTeams || ranked;
    } else {
      frozenTeams = null;
      teams = ranked;
    }
    return teams;
  };
}

const names = (t) => t.map((x) => x.id).join(',');
let pass = 0, fail = 0;
const chk = (n, ok, d) => { console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${n}${d ? ' :: ' + d : ''}`); ok ? pass++ : fail++; };

const A = [{ id: 'alpha', score: 300 }, { id: 'bravo', score: 100 }];
const B = [{ id: 'bravo', score: 900 }, { id: 'alpha', score: 300 }];   // bravo overtakes

// ── Live before the freeze: the board tracks reality.
let f = makeFreeze();
chk('active board shows live standings', names(f('active', A)) === 'alpha,bravo');

// ── The freeze captures, and then HOLDS. This is the assertion the old code failed.
f('frozen', A);
chk('freeze captures the standings at first frozen observation',
    names(f('frozen', A)) === 'alpha,bravo');
chk('a score change DURING the freeze does not move the board',
    names(f('frozen', B)) === 'alpha,bravo', 'bravo overtook but must not show');

// ── Ending reveals the truth.
chk('ending the tournament reveals the real final standings',
    names(f('ended', B)) === 'bravo,alpha');

// ── Re-freezing later starts a fresh capture rather than resurrecting the old one.
chk('a later freeze captures the CURRENT board, not the stale one',
    names(f('frozen', B)) === 'bravo,alpha');

// ── Opening the page mid-freeze: nothing to compare against, so snapshot from first sight.
//    It cannot recover the pre-freeze board, but it must still stop further movement.
const g = makeFreeze();
chk('opening mid-freeze snapshots from first sight', names(g('frozen', A)) === 'alpha,bravo');
chk('and holds it against later updates', names(g('frozen', B)) === 'alpha,bravo');

// ── An empty first frame must not latch an empty board forever.
const h = makeFreeze();
h('frozen', []);
chk('an empty first frame does not latch an empty board', names(h('frozen', A)) === 'alpha,bravo');

// ── NON-VACUITY: the OLD behaviour (render whatever arrives) must fail the freeze assertions,
//    or these tests would pass against the code they are meant to catch.
const old = (status, ranked) => ranked;
old('frozen', A);
chk('the OLD render-live behaviour FAILS the freeze assertion (test can fail)',
    names(old('frozen', B)) !== 'alpha,bravo', 'old code moves the board mid-freeze');

console.log(`\n  ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
