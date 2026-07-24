/*
 * Regression tests for the canonical CTF standings rule (BUG-022).
 * Run: node _app/components/CtfStandings.test.js   (exits non-zero on any failure)
 *
 * This is the persisted gate Chris asked for — the rule that decides tournament
 * positions (and therefore trophies / HCA credentials) must never silently regress.
 * No test runner / build step; plain node against the shipped browser helper.
 */
'use strict';

// Load the browser IIFE in a node shim (it assigns window.CtfStandings).
global.window = {};
require('./CtfStandings.js');
const { rankTeams, solveMs } = global.window.CtfStandings;

let failures = 0;
function ok(name, cond) {
    console.log((cond ? 'PASS' : 'FAIL') + '  ' + name);
    if (!cond) failures++;
}

// Timestamp shapes the field can arrive in.
const ts = (iso) => ({ toDate: () => new Date(iso) });   // Firestore Timestamp
const sec = (s) => ({ seconds: s });                     // plain {seconds}

// ── solveMs normalization ──
ok('solveMs(null) = Infinity (missing)', solveMs(null) === Infinity);
ok('solveMs(undefined) = Infinity', solveMs(undefined) === Infinity);
ok('solveMs("") = Infinity (unparseable)', solveMs('') === Infinity);
ok('solveMs(0) = 0 (literal epoch ms is a real time, NOT missing)', solveMs(0) === 0);
ok('solveMs("1970-01-01T00:00:00Z") = 0', solveMs('1970-01-01T00:00:00Z') === 0);
ok('solveMs(Timestamp) uses toDate()', solveMs(ts('2026-01-01T00:00:00Z')) === Date.parse('2026-01-01T00:00:00Z'));
ok('solveMs({seconds}) = seconds*1000', solveMs(sec(3)) === 3000);

// ── rankTeams ordering ──
ok('score DESC dominates',
    rankTeams([{ id: 'a', score: 100 }, { id: 'b', score: 300 }, { id: 'c', score: 200 }])
        .map(t => t.id).join() === 'b,c,a');

ok('tie on score -> earliest lastSolveTime wins',
    rankTeams([{ id: 'x', score: 500, lastSolveTime: ts('2026-01-01T10:02:00Z') },
               { id: 'y', score: 500, lastSolveTime: ts('2026-01-01T10:01:00Z') }])[0].id === 'y');

ok('tie: a team with NO lastSolveTime sorts AFTER one with a time',
    rankTeams([{ id: 'm', score: 100 }, { id: 'n', score: 100, lastSolveTime: ts('2026-01-01T10:00:00Z') }])
        .map(t => t.id).join() === 'n,m');

ok('mixed shapes: {seconds:1} (1000ms) before Timestamp(3000ms)',
    rankTeams([{ id: 'p', score: 50, lastSolveTime: ts(new Date(3000).toISOString()) },
               { id: 'q', score: 50, lastSolveTime: sec(1) }])[0].id === 'q');

// THE ORIGINAL BUG (Nancy R1): two teams tied on score, BOTH missing lastSolveTime,
// must not produce Infinity - Infinity = NaN (which corrupts Array.sort). Must fall
// through to the stable id tiebreak.
ok('all-zero pre-solve state: no NaN, id-stable',
    rankTeams([{ id: 'zzz', score: 0 }, { id: 'aaa', score: 0 }, { id: 'mmm', score: 0 }])
        .map(t => t.id).join() === 'aaa,mmm,zzz');

ok('epoch-0 solver still outranks a no-solve team at equal score',
    rankTeams([{ id: 'nosolve', score: 0 }, { id: 'epoch', score: 0, lastSolveTime: 0 }])[0].id === 'epoch');

ok('deterministic/stable across repeated calls on a full tie', (() => {
    const inp = [{ id: 'c', score: 0 }, { id: 'a', score: 0 }, { id: 'b', score: 0 }];
    const r1 = rankTeams(inp).map(t => t.id).join();
    const r2 = rankTeams(inp).map(t => t.id).join();
    return r1 === 'a,b,c' && r1 === r2;
})());

ok('pure: input array not mutated', (() => {
    const orig = [{ id: 'b', score: 1 }, { id: 'a', score: 2 }];
    rankTeams(orig);
    return orig[0].id === 'b';
})());

// ── End-to-end: the exact bug, broken then fixed ──
// Two teams tie for 1st on 500; Zulu reached it 3 min before Alpha. The OLD behavior
// (Firestore orderBy score desc, then __name__/doc-id asc) crowned Alpha because its id
// sorts first. The rule crowns Zulu (reached the score first).
(function () {
    const teams = [
        { id: 'team_alpha', name: 'Alpha', score: 500, lastSolveTime: ts('2026-10-01T10:05:00Z') },
        { id: 'team_zulu', name: 'Zulu', score: 500, lastSolveTime: ts('2026-10-01T10:02:00Z') },
        { id: 'team_bravo', name: 'Bravo', score: 400, lastSolveTime: ts('2026-10-01T10:07:00Z') },
        { id: 'team_papa', name: 'Papa', score: 300, lastSolveTime: ts('2026-10-01T10:09:00Z') },
        { id: 'team_mike', name: 'Mike', score: 300, lastSolveTime: ts('2026-10-01T10:01:00Z') },
    ];
    const oldOrder = teams.slice().sort((a, b) => (b.score - a.score) || a.id.localeCompare(b.id));
    const now = rankTeams(teams);
    ok('regression: OLD doc-id tiebreak crowned the wrong team (Alpha)', oldOrder[0].name === 'Alpha');
    ok('regression: rule crowns the correct champion (Zulu, earlier solve)', now[0].name === 'Zulu');
    ok('regression: podium top-3 = Zulu, Alpha, Bravo', now.slice(0, 3).map(t => t.name).join() === 'Zulu,Alpha,Bravo');
    ok('regression: 3rd-place tie resolved to Mike (10:01 < 10:09)', now[3].name === 'Mike');
})();

console.log('\n' + (failures === 0 ? 'ALL PASS' : (failures + ' FAILURE(S)')));
process.exit(failures === 0 ? 0 : 1);
