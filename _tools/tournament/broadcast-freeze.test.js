#!/usr/bin/env node
/*
 * Does the Big Screen freeze correctly, and can every one of its panels read the snapshot?
 *
 * @catalog what    state-machine test of broadcast.html's frozen board and its three consumers
 * @catalog run     node _tools/tournament/broadcast-freeze.test.js
 * @catalog status  TOOL
 *
 * WHY THIS EXISTS, and it is not a flattering reason. TOURN-08 fixed the podium's freeze and I
 * told the operator "every page renders that one array". That was false: broadcast.html, which
 * this platform's own source calls the produced projector display, still did its own per-client
 * capture, so two viewers of the ACTUAL Big Screen still diverged from each other and from the
 * podium. Nancy caught the claim. The tell was in my own diff, if I had read it: the snapshot
 * captured `memberNames`, which the podium never renders and broadcast's roster spotlight does.
 * A fix scoped for two pages and shipped for one.
 *
 * Then, once broadcast DID read the snapshot, the QC hook found a second defect that only
 * became reachable at that moment: the snapshot stored `solves` as a COUNT, which silently
 * broke all three of this page's consumers. Two of them would have rendered "0 solves"; the
 * third, Recent Captures, reads the last five challenge IDS and could not have been repaired by
 * coercion at all.
 *
 * So this file tests the branch AND the three consumers, because the branch being right is not
 * the same as the page being right. Both defects above are asserted directly, so a regression
 * in either shows up here rather than on a projector in front of a class.
 *
 * WHAT IT DOES NOT DO: drive the real page against a live Firestore listener. broadcast.html
 * loads the compat SDK against production config, and pointing it at an emulator would test a
 * different page than the one that ships. The logic below is lifted verbatim from the page, so
 * a drift between them is visible in a diff. Stated rather than implied.
 */

// ── Verbatim from broadcast.html displayTeams() ────────────────────────────────
function makeDisplay() {
  const state = { info: null, teams: [], frozenTeams: null };
  return {
    state,
    set(info, teams) { state.info = info; state.teams = teams; },
    displayTeams() {
      const info = state.info || {};
      const st = info.status || '';
      if (st === 'frozen') {
        if (Array.isArray(info.frozenStandings) && info.frozenStandings.length) {
          state.frozenTeams = null;
          return info.frozenStandings;
        }
        if (!state.frozenTeams && state.teams.length) state.frozenTeams = state.teams.slice();
        return state.frozenTeams || state.teams;
      }
      state.frozenTeams = null;
      return state.teams;
    },
  };
}

// ── The three consumers, verbatim from broadcast.html ──────────────────────────
const hudSolveTotal = (teams) =>                                   // :511
  teams.reduce((n, tm) => n + (Array.isArray(tm.solves) ? tm.solves.length : 0), 0);
const standingsSolves = (t) =>                                     // :633
  (Array.isArray(t.solves) ? t.solves.length : 0);
const recentCaptureIds = (t) =>                                    // :690
  (Array.isArray(t.solves) ? t.solves.slice(-5).reverse() : []);
const lastSolveLabel = (t) => {                                    // :643-648
  if (!t.lastSolveTime) return 'no solves yet';
  try { return (typeof t.lastSolveTime.toDate === 'function') ? 'TIME' : '-'; }
  catch (e) { return '-'; }
};

// ── DRIFT GUARD. Everything above is copied from broadcast.html, and a copy silently rots:
//    someone edits the page, this file keeps passing, and the coverage becomes a lie that reads
//    as green. So assert the copies are still the page's. If this fails, the test is stale, not
//    the product, and the fix is to re-copy rather than to loosen the assertion.
const fs = require('fs');
const path = require('path');
const PAGE = fs.readFileSync(path.resolve(__dirname, '../../_app/arena/broadcast.html'), 'utf8');
const MUST_MATCH = [
  ['branch: reads the snapshot', 'Array.isArray(info.frozenStandings) && info.frozenStandings.length'],
  ['branch: drops the local capture', 'state.frozenTeams = null;'],
  ['consumer: HUD total', 'Array.isArray(tm.solves) ? tm.solves.length : 0'],
  ['consumer: standings solves', 'Array.isArray(t.solves) ? t.solves.length : 0'],
  ['consumer: recent captures', 'Array.isArray(t.solves) ? t.solves.slice(-5).reverse() : []'],
  ['consumer: lastSolveLabel guard', "typeof t.lastSolveTime.toDate === 'function'"],
];

const names = (t) => t.map((x) => x.id).join(',');
let pass = 0, fail = 0;
const chk = (n, ok, d) => { console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${n}${d ? ' :: ' + d : ''}`); ok ? pass++ : fail++; };

// Live team docs: solves is an ARRAY of challenge ids, lastSolveTime a Firestore Timestamp.
const ts = { toDate: () => new Date(0) };
const LIVE_A = [{ id: 'alpha', name: 'Alpha', score: 300, solves: ['c1', 'c2', 'c3'], lastSolveTime: ts },
                { id: 'bravo', name: 'Bravo', score: 100, solves: ['c1'], lastSolveTime: ts }];
const LIVE_B = [{ id: 'bravo', name: 'Bravo', score: 900, solves: ['c1', 'c2', 'c3', 'c4'], lastSolveTime: ts },
                { id: 'alpha', name: 'Alpha', score: 300, solves: ['c1', 'c2', 'c3'], lastSolveTime: ts }];
// The snapshot the admin console writes, in its real shape.
const SNAP = { status: 'frozen', frozenStandings: [
  { id: 'alpha', name: 'Alpha', color: '#ef4444', score: 300, solves: ['c1', 'c2', 'c3'], memberNames: ['A'], lastSolveTime: ts },
  { id: 'bravo', name: 'Bravo', color: '#3b82f6', score: 100, solves: ['c1'], memberNames: ['B'], lastSolveTime: ts },
]};

// ── The branch ─────────────────────────────────────────────────────────────────
let d = makeDisplay();
d.set({ status: 'active' }, LIVE_A);
chk('active board shows live standings', names(d.displayTeams()) === 'alpha,bravo');

d.set(SNAP, LIVE_B);   // scores moved to B, but a snapshot exists
chk('frozen renders the SNAPSHOT, not what arrived since',
    names(d.displayTeams()) === 'alpha,bravo', 'B is live but A was frozen');
chk('a local capture is discarded once a snapshot exists', d.state.frozenTeams === null);

d.set({ status: 'ended' }, LIVE_B);
chk('ending reveals the real final standings', names(d.displayTeams()) === 'bravo,alpha');

// ── THE BUG THIS PAGE HAD: two Big Screen viewers diverging from each other ────
const early = makeDisplay(); early.set({ status: 'active' }, LIVE_A); early.displayTeams();
const late = makeDisplay();
early.set({ status: 'frozen' }, LIVE_A);   // no snapshot: legacy path
late.set({ status: 'frozen' }, LIVE_B);
chk('WITHOUT a snapshot two Big Screen viewers disagree (the bug)',
    names(early.displayTeams()) !== names(late.displayTeams()),
    `${names(early.displayTeams())} vs ${names(late.displayTeams())}`);

const early2 = makeDisplay(); early2.set(SNAP, LIVE_A);
const late2 = makeDisplay(); late2.set(SNAP, LIVE_B);
chk('WITH a snapshot they agree, whatever each was seeing',
    names(early2.displayTeams()) === names(late2.displayTeams()), 'both render frozenStandings');

// And the Big Screen must agree with the podium, which renders the same array.
chk('Big Screen and podium render the identical array',
    names(late2.displayTeams()) === names(SNAP.frozenStandings));

// ── THE CONSUMERS. A correct branch feeding panels that cannot read the shape is
//    still a broken projector, which is exactly what a stored COUNT produced.
const frozen = late2.displayTeams();
chk('HUD solve total reads the snapshot', hudSolveTotal(frozen) === 4, `got ${hudSolveTotal(frozen)}, expected 4`);
chk('standings column shows real solve counts, not 0',
    standingsSolves(frozen[0]) === 3, `got ${standingsSolves(frozen[0])}`);
chk('Recent Captures gets real challenge IDS (a count could never restore this)',
    JSON.stringify(recentCaptureIds(frozen[0])) === '["c3","c2","c1"]',
    JSON.stringify(recentCaptureIds(frozen[0])));
chk('Last Solve renders a time, not "no solves yet"',
    lastSolveLabel(frozen[0]) === 'TIME', lastSolveLabel(frozen[0]));

// ── NON-VACUITY. Both shipped defects must FAIL these, or the file proves nothing.
const COUNT_SNAP = [{ id: 'alpha', score: 300, solves: 3 }];          // solves as a COUNT
chk('a COUNT-shaped snapshot FAILS the HUD (test can fail)', hudSolveTotal(COUNT_SNAP) === 0,
    'count shape yields 0, which is the defect the hook caught');
chk('a COUNT-shaped snapshot FAILS Recent Captures (test can fail)',
    recentCaptureIds(COUNT_SNAP[0]).length === 0, 'no ids recoverable from a count');
const NO_TIME = [{ id: 'alpha', score: 300, solves: ['c1'] }];        // lastSolveTime dropped
chk('a snapshot without lastSolveTime FAILS Last Solve (test can fail)',
    lastSolveLabel(NO_TIME[0]) === 'no solves yet', 'the column Nancy found blank');

// ── Edge: an empty first frozen frame must not latch an empty board.
const e = makeDisplay(); e.set({ status: 'frozen' }, []);
e.displayTeams();
e.set({ status: 'frozen' }, LIVE_A);
chk('an empty first frame does not latch an empty board', names(e.displayTeams()) === 'alpha,bravo');

// ── Edge: an EMPTY frozenStandings array falls back rather than showing nothing.
const emptySnap = makeDisplay(); emptySnap.set({ status: 'frozen', frozenStandings: [] }, LIVE_A);
chk('an empty snapshot array falls back to the live capture, not a blank screen',
    names(emptySnap.displayTeams()) === 'alpha,bravo');

// ── Run the drift guard LAST so a stale copy is reported next to the results it invalidates.
for (const [label, snippet] of MUST_MATCH) {
  chk(`still matches broadcast.html -- ${label}`, PAGE.includes(snippet),
      PAGE.includes(snippet) ? '' : 'PAGE CHANGED: re-copy this logic into the test');
}

console.log(`\n  ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
