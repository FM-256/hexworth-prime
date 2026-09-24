#!/usr/bin/env node
'use strict';
/**
 * ctf-perteam-plan.test.js
 *
 * @catalog what   Proves the admin console's per-team flag RESOLVER maps each pasted box key to the
 *                 right team, and refuses rather than guessing on any near-match or ambiguity
 * @catalog run    node _tools/rules-test/ctf-perteam-plan.test.js
 * @catalog status TOOL
 *
 * WHY THIS IS THE DANGEROUS HALF. ctfSubmitFlag grades each team against its own perTeam entry and
 * that is tested against the real function elsewhere (ctf-perteam-flags.test.js). But the entries get
 * there by matching a pasted MACHINE name to a TEAM, and a resolver that matched the wrong one would
 * write team A's flag under team B's id -- grading would then work perfectly and hand each team
 * someone else's flag, which is the exact defect per-team flags exist to remove, wearing a different
 * hat. It would also be invisible to every test on the grading side.
 *
 * The function is EXTRACTED from the shipped page, not reimplemented, so this cannot pass while the
 * console does something else.
 */
const path = require('path');
const { extractDecl } = require('./lib/extract-shipped');

const PAGE = process.env.CONSOLE_PATH || path.join(__dirname, '..', '..', '_app', 'admin', 'console.html');
/* A Function wrapper rather than eval: this file is 'use strict', which scopes declarations made
 * inside an eval to the eval itself, so the extracted function came out invisible. */
const planPerTeamFlags = new Function(extractDecl(PAGE, 'planPerTeamFlags')
    + '\nreturn planPerTeamFlags;')();

let pass = 0, fail = 0;
const chk = (n, ok, d) => { console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${n}${d ? ' :: ' + d : ''}`); ok ? pass++ : fail++; };

const H = (n) => 'sha256:' + String(n).repeat(64).slice(0, 64).replace(/[^0-9a-f]/g, 'a');
const SALT = (n) => String(n).repeat(32).slice(0, 32).replace(/[^0-9a-f]/g, 'b');
const entry = (n) => ({ flagSalt: SALT(n), flagHash: H(n) });

/* A fresh fixture per case: a shared one let an earlier case's mutation decide a later case. */
function fx() {
    const teams = [
        { id: 'team-red', name: 'Red Cell' },
        { id: 'team-blue', name: 'Blue Shield' },
        { id: 'team-green', name: 'Green Ops' },
    ];
    const pool = new Map([
        ['team-red', 'engine1-red-cell'],
        ['team-blue', 'engine1-blue-shield-v3'],
        ['team-green', 'engine1-green-ops'],
    ]);
    return { teams, pool };
}
const GOOD = () => JSON.stringify({
    'red-cell': entry(1), 'blue-shield-v3': entry(2), 'green-ops': entry(3),
});

console.log('\n== per-team flag resolver (admin console) ==');

// 1. HAPPY PATH: short names resolve through each team's pool label.
{
    const { teams, pool } = fx();
    const r = planPerTeamFlags(GOOD(), teams, pool);
    chk('short box names resolve to the right teams', r.refusals.length === 0 && r.plan.length === 3, r.refusals.join(' | '));
    const map = Object.fromEntries(r.plan.map(p => [p.teamId, p.key]));
    chk('each team gets ITS OWN box key, not a neighbour\'s',
        map['team-red'] === 'red-cell' && map['team-blue'] === 'blue-shield-v3' && map['team-green'] === 'green-ops',
        JSON.stringify(map));
    chk('the plan carries the salt and hash pasted for that key',
        r.plan.find(p => p.teamId === 'team-red').flagHash === H(1)
        && r.plan.find(p => p.teamId === 'team-blue').flagHash === H(2));
}

// 2. Full pool labels also resolve, and so do raw team ids.
{
    const { teams, pool } = fx();
    const r = planPerTeamFlags(JSON.stringify({
        'engine1-red-cell': entry(1), 'engine1-blue-shield-v3': entry(2), 'team-green': entry(3),
    }), teams, pool);
    chk('full pool labels and raw team ids both resolve', r.refusals.length === 0 && r.plan.length === 3, r.refusals.join(' | '));
}

/* 3. THE ONE THAT MATTERS MOST. "cell" is a suffix of "engine1-red-cell" but it is not the box's
 * name, and a loose suffix match would silently assign a flag on a coincidence. */
{
    const { teams, pool } = fx();
    const r = planPerTeamFlags(JSON.stringify({ 'cell': entry(1), 'blue-shield-v3': entry(2), 'green-ops': entry(3) }), teams, pool);
    chk('a NEAR-match ("cell" for engine1-red-cell) is refused, not guessed',
        r.plan.length === 0 && r.refusals.some(x => /matches no team/.test(x)) && r.refusals.some(x => /Red Cell/.test(x)),
        r.refusals.join(' | ').slice(0, 130));
}

// 4. Ambiguity in both directions must refuse.
{
    const { teams, pool } = fx();
    const r = planPerTeamFlags(JSON.stringify({
        'red-cell': entry(1), 'team-red': entry(4), 'blue-shield-v3': entry(2), 'green-ops': entry(3),
    }), teams, pool);
    chk('TWO keys matching one team is refused', r.plan.length === 0 && r.refusals.some(x => /Ambiguous/.test(x)), r.refusals.join(' | ').slice(0, 120));
}
{
    const { teams } = fx();
    const shared = new Map([['team-red', 'engine1-red-cell'], ['team-blue', 'engine1-red-cell'], ['team-green', 'engine1-green-ops']]);
    const r = planPerTeamFlags(JSON.stringify({ 'red-cell': entry(1), 'green-ops': entry(3) }), teams, shared);
    chk('ONE key matching two teams is refused', r.plan.length === 0 && r.refusals.some(x => /cannot be two teams/.test(x)), r.refusals.join(' | ').slice(0, 120));
}

// 5. ALL OR NOTHING: a missing team must refuse, because absence means REFUSE at grading time.
{
    const { teams, pool } = fx();
    const r = planPerTeamFlags(JSON.stringify({ 'red-cell': entry(1), 'blue-shield-v3': entry(2) }), teams, pool);
    chk('a team with NO entry refuses the whole write', r.plan.length === 0 && r.refusals.some(x => /Green Ops/.test(x)), r.refusals.join(' | ').slice(0, 120));
}
{
    const { teams, pool } = fx();
    const r = planPerTeamFlags(JSON.stringify({ 'red-cell': entry(1), 'blue-shield-v3': entry(2), 'green-ops': entry(3), 'purple-haze': entry(5) }), teams, pool);
    chk('an EXTRA key matching no team refuses', r.plan.length === 0 && r.refusals.some(x => /purple-haze/.test(x)), r.refusals.join(' | ').slice(0, 120));
}
{
    const { teams } = fx();
    const missing = new Map([['team-red', 'engine1-red-cell'], ['team-blue', 'engine1-blue-shield-v3']]);
    const r = planPerTeamFlags(GOOD(), teams, missing);
    chk('a team with no box ASSIGNMENT says to wire the pool first',
        r.plan.length === 0 && r.refusals.some(x => /wire the pool first/.test(x)), r.refusals.join(' | ').slice(0, 130));
}

// 6. THE COLLISION. Two boxes on one hash is the original defect arriving through the paste box.
{
    const { teams, pool } = fx();
    const r = planPerTeamFlags(JSON.stringify({ 'red-cell': entry(1), 'blue-shield-v3': entry(1), 'green-ops': entry(3) }), teams, pool);
    chk('the SAME flagHash on two boxes is refused (one flag on two machines)',
        r.plan.length === 0 && r.refusals.some(x => /SAME flagHash/.test(x)), r.refusals.join(' | ').slice(0, 130));
}

// 7. Shape. A subtly wrong salt or hash writes fine and then rejects every flag the team submits.
const badShapes = [
    ['not json at all', 'not valid JSON'],
    ['[]', 'an array'],
    ['{"red-cell": 5}', 'expected an object'],
    [JSON.stringify({ 'red-cell': { flagSalt: SALT(1) } }), 'flagHash is not'],
    [JSON.stringify({ 'red-cell': { flagSalt: SALT(1), flagHash: 'sha256:ABCDEF' } }), 'flagHash is not'],
    [JSON.stringify({ 'red-cell': { flagSalt: SALT(1), flagHash: H(1).replace('sha256:', '') } }), 'flagHash is not'],
    [JSON.stringify({ 'red-cell': { flagSalt: 'xyz', flagHash: H(1) } }), 'flagSalt is not'],
    ['{}', 'empty'],
];
let shapeOk = true, shapeBad = [];
for (const [raw, needle] of badShapes) {
    const { teams, pool } = fx();
    const r = planPerTeamFlags(raw, teams, pool);
    const said = r.refusals.join(' | ');
    if (r.plan.length !== 0 || !said.includes(needle)) { shapeOk = false; shapeBad.push(`${JSON.stringify(raw).slice(0, 34)} -> ${said.slice(0, 60)}`); }
}
chk('malformed salt, hash, or JSON is refused with a reason', shapeOk, shapeBad.join(' ;; '));

/* THE INVARIANT ACROSS ALL OF IT is that every refusal path returns an EMPTY plan, because a team
 * absent from perTeam cannot submit at all -- a partial write benches that team for the whole event
 * rather than degrading. It is asserted inside each case above with `r.plan.length === 0`, and NOT
 * restated here as a summary line: `chk('...', true, ...)` cannot fail, and a check that cannot fail
 * is an unearned pass padding the count. */

console.log(`\n  ${pass} passed, ${fail} failed\n`);
process.exitCode = fail === 0 ? 0 : 1;
