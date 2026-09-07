#!/usr/bin/env node
/**
 * standings-parity.test.js — the browser and server CTF ranking rules must agree
 *
 * @catalog what    Runs the browser standings rule (_app/components/CtfStandings.js) and the server
 * @catalog what    rule (functions/ctf-standings-rule.js) over one fixture corpus and fails if their
 * @catalog what    orderings differ. Catches the duplicated-rule drift that a comment cannot.
 * @catalog run     node _tools/tournament/standings-parity.test.js
 * @catalog status  GATE
 *
 * WHY THIS EXISTS
 * ---------------
 * The canonical tie-break (BUG-022) must be implemented TWICE — once for the browser, once for
 * Cloud Functions — because Firebase bundles only `functions/` and the deployed package cannot
 * reach `_app/`. That duplication is forced by the platform.
 *
 * It had already drifted. The server copy lived inline inside `discordInteraction` carrying the
 * comment "Rule kept BYTE-IDENTICAL to the browser canonical helper", and that claim was FALSE when
 * written: the browser branched on `typeof v.toDate === 'function'`, the server on
 * `typeof v.toMillis === 'function'`. The divergence was LATENT — a real Firestore Timestamp from
 * either SDK carries both methods, so production data never exercised it — which is exactly why
 * nobody noticed for as long as it existed.
 *
 * This is the same failure shape as GUARD-07, where three copies of the house list held 15, 11 and
 * 13 entries: each individually present, each individually commented, all three disagreeing, and
 * nothing comparing them. A per-file check passes happily on all of them. Only a CROSS-file
 * comparison catches drift, so that is what this does.
 *
 * WHY THE FIXTURE CORPUS LOOKS LIKE THIS
 * --------------------------------------
 * The adversarial review asked the right question: can the two agree on every fixture and still
 * diverge in production? The answer is that the risk lives entirely in the INPUT SHAPES, because
 * both helpers are a shape-dispatch followed by identical comparison logic. So the corpus must
 * carry every shape either helper claims to accept — including the one-sided Timestamp fakes that
 * production never produces but that expose exactly the drift that existed. A corpus of only
 * realistic Timestamps would have passed against the drifted implementation and proved nothing.
 *
 * Ranking is compared by ORDER OF TEAM IDS, not by internal values: two implementations may compute
 * different intermediate ms values and still rank identically, and it is the RANK that mints a
 * credential. Comparing what matters, not a proxy for it.
 *
 * EXIT: 0 the two rules agree on every case, 1 they diverge, 2 could not run.
 */
'use strict';
const fs = require('fs');
const path = require('path');

const REPO = path.resolve(__dirname, '../..');

/* Load the BROWSER helper in Node. It is an IIFE that assigns to `window`, so provide one — the
   same trick _app/components/CtfStandings.test.js already uses. Loaded by executing the real file
   rather than by copying its source here: a copy would be a third implementation of the rule, which
   is the very thing under test. */
function loadBrowserRule() {
    const src = fs.readFileSync(path.join(REPO, '_app/components/CtfStandings.js'), 'utf8');
    const sandbox = { window: {} };
    // eslint-disable-next-line no-new-func
    new Function('window', src)(sandbox.window);
    if (!sandbox.window.CtfStandings || typeof sandbox.window.CtfStandings.rankTeams !== 'function') {
        throw new Error('CtfStandings.js did not expose window.CtfStandings.rankTeams');
    }
    return sandbox.window.CtfStandings;
}

const ts = (iso) => ({ toDate: () => new Date(iso) });                    // web-SDK-shaped fake
const tm = (iso) => ({ toMillis: () => new Date(iso).getTime() });        // admin-SDK-shaped fake
const both = (iso) => ({ toDate: () => new Date(iso), toMillis: () => new Date(iso).getTime() });

/* Each case is a team list. Only the ORDER the two rules produce is compared. Names describe the
   property under test so a failure says what broke, not merely that something did. */
const CASES = [
    ['plain score ordering', [
        { id: 'a', score: 100 }, { id: 'b', score: 300 }, { id: 'c', score: 200 }]],

    ['score tie broken by earliest solve (REAL Timestamp, both methods)', [
        { id: 'late', score: 300, lastSolveTime: both('2026-10-01T10:09:00Z') },
        { id: 'early', score: 300, lastSolveTime: both('2026-10-01T10:01:00Z') }]],

    /* THE TWO DRIFT CASES. Each pits a ONE-SIDED Timestamp against a REAL (both-method) one that
       solved LATER. If a helper fails to read the one-sided shape it scores it Infinity, demoting it
       BELOW the real timestamp — so the two implementations return different orders and the gate
       fires.

       THE FIRST DRAFT OF THESE FIXTURES PROVED NOTHING. It paired the one-sided timestamp against a
       team with NO timestamp at all. Under the broken helper BOTH became Infinity, the tie fell to
       the stable id fallback, and that fallback happened to emit the same order the correct
       implementation does. All 13 cases passed against a rule that genuinely diverged. A green
       detector on known-drifted inputs is the smell — the fixture must make a demoted team actually
       CHANGE PLACES, or it measures the id fallback rather than the drift. */
    ['toDate-only Timestamp must not sort as missing', [
        { id: 'realLater', score: 300, lastSolveTime: both('2026-10-01T10:09:00Z') },
        { id: 'oneSidedEarlier', score: 300, lastSolveTime: ts('2026-10-01T10:01:00Z') }]],

    /* The mirror shape. Symmetry matters: widening only one helper leaves the other blind, and the
       browser is the one that still lacks `toMillis`. */
    ['toMillis-only Timestamp must not sort as missing', [
        { id: 'realLater', score: 300, lastSolveTime: both('2026-10-01T10:09:00Z') },
        { id: 'oneSidedEarlier', score: 300, lastSolveTime: tm('2026-10-01T10:01:00Z') }]],

    ['plain {seconds} (raw REST/JSON read shape)', [
        { id: 'early', score: 50, lastSolveTime: { seconds: 1790000000 } },
        { id: 'late', score: 50, lastSolveTime: { seconds: 1790000600 } }]],

    ['numeric epoch ms, and literal 0 is a REAL time not "missing"', [
        { id: 'epoch0', score: 10, lastSolveTime: 0 },
        { id: 'later', score: 10, lastSolveTime: 1790000000000 },
        { id: 'missing', score: 10 }]],

    ['ISO string', [
        { id: 'early', score: 10, lastSolveTime: '2026-10-01T10:00:00Z' },
        { id: 'late', score: 10, lastSolveTime: '2026-10-01T11:00:00Z' }]],

    ['null vs undefined vs absent all sort last, stably by id', [
        { id: 'c', score: 5, lastSolveTime: null },
        { id: 'a', score: 5, lastSolveTime: undefined },
        { id: 'b', score: 5 }]],

    /* The Infinity - Infinity = NaN guard. This is the NORMAL pre-solve state of every tournament,
       not an edge case: many teams at score 0 with no solves. NaN corrupts Array.sort and silently
       bypasses the id fallback, so both helpers compare for equality before subtracting. */
    ['all-missing times must fall to stable id order (NaN guard)', [
        { id: 'zulu', score: 0 }, { id: 'alpha', score: 0 }, { id: 'mike', score: 0 }]],

    ['unparseable garbage sorts last, not first', [
        { id: 'junk', score: 7, lastSolveTime: { nonsense: true } },
        { id: 'real', score: 7, lastSolveTime: both('2026-10-01T10:00:00Z') }]],

    ['missing score treated as 0', [
        { id: 'noscore' }, { id: 'scored', score: 1 }]],

    ['empty list', []],

    /* The BUG-022 regression fixture, mirroring _app/components/CtfStandings.test.js. Doc-id order
       would crown Alpha; the canonical rule crowns Zulu on the earlier solve. */
    ['BUG-022 regression: earlier solve outranks alphabetical doc id', [
        { id: 'team_alpha', score: 500, lastSolveTime: both('2026-10-01T10:05:00Z') },
        { id: 'team_zulu', score: 500, lastSolveTime: both('2026-10-01T10:02:00Z') },
        { id: 'team_bravo', score: 400, lastSolveTime: both('2026-10-01T10:03:00Z') },
        { id: 'team_mike', score: 300, lastSolveTime: both('2026-10-01T10:01:00Z') },
        { id: 'team_kilo', score: 300, lastSolveTime: both('2026-10-01T10:09:00Z') }]],
];

function main() {
    let browser, server;
    try {
        browser = loadBrowserRule();
        server = require(path.join(REPO, 'functions/ctf-standings-rule.js'));
    } catch (e) {
        // Exit 2, not 1: a harness that cannot load the rules has PROVEN NOTHING, and reporting
        // that as a pass is how a broken gate goes unnoticed.
        console.error('  standings-parity could not run:', e && e.message);
        return 2;
    }

    let pass = 0;
    const diffs = [];
    for (const [name, teams] of CASES) {
        const b = browser.rankTeams(teams).map(t => t.id).join(',');
        const s = server.rankTeams(teams).map(t => t.id).join(',');
        if (b === s) { pass++; console.log(`  ok   ${name}`); }
        else {
            // `CRITICAL:` prefix is REQUIRED: the EduScan smoke runner filters validator output
            // through /^\s*(CRITICAL|HIGH|MEDIUM|MISSING|drift|...):/ and drops anything else, so a
            // diagnosis in any other shape reaches the operator as a bare red line with no reason.
            console.log(`  CRITICAL: standings rule drift — ${name}`);
            console.log(`  FAIL ${name}`);
            console.log(`         browser: ${b || '(empty)'}`);
            console.log(`         server : ${s || '(empty)'}`);
            diffs.push(name);
        }
    }

    console.log(`\n  ${pass}/${CASES.length} cases agree`);
    if (diffs.length) {
        console.log('  The browser and server ranking rules DISAGREE. Standings mint credentials,');
        console.log('  so a divergence here is a wrong team on the podium and a wrong-place award.');
        console.log('  Fix BOTH _app/components/CtfStandings.js and functions/ctf-standings-rule.js.');
        return 1;
    }
    return 0;
}

try { process.exit(main()); }
catch (e) { console.error('  standings-parity failed:', e && e.message); process.exit(2); }
