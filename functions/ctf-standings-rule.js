/*
 * ctf-standings-rule.js — the ONE server-side copy of the canonical CTF ranking rule.
 *
 * CANONICAL RULE (identical to _app/components/CtfStandings.js):
 *   score DESC, then earliest lastSolveTime ASC (the team that reached a given score FIRST
 *   outranks a later team at the same score), a team with no lastSolveTime sorts LAST among
 *   equal scores, and a final fallback to team id keeps ordering stable.
 *
 * WHY THIS FILE EXISTS
 * --------------------
 * Two reasons, and the second one is the incident.
 *
 * 1. Cloud Functions bundle only `functions/`. The deployed package cannot reach `_app/`, so the
 *    browser helper cannot be imported and the rule MUST be duplicated across the two runtimes.
 *    That is a constraint of the platform, not a choice.
 *
 * 2. IT WAS ALREADY DUPLICATED TWICE ON THE SERVER, AND THE COPIES HAD DRIFTED. Before this file,
 *    the rule existed inline inside `discordInteraction` (functions/index.js, the /leaderboard
 *    command) carrying the comment "Rule kept BYTE-IDENTICAL to the browser canonical helper."
 *    **That claim was false when it was written.** The browser tested `typeof v.toDate === 'function'`
 *    and called `.toDate().getTime()`; the server tested `typeof v.toMillis === 'function'` and
 *    called `.toMillis()`. Different method, different branch.
 *
 *    The drift was LATENT, not live, and the distinction matters: a real Firestore Timestamp — from
 *    either SDK — carries BOTH methods, so on production data the two implementations agreed. They
 *    diverge on a Timestamp-shaped object carrying only one of the two, which is exactly the fixture
 *    shape `_app/components/CtfStandings.test.js` constructs (`{ toDate: () => new Date(iso) }`).
 *    On that input the server fell through to `new Date({})` -> NaN -> Infinity and ranked the team
 *    LAST, while the browser ranked it correctly.
 *
 *    So the rule was protected by a comment asserting a property nothing checked, and the property
 *    was not true. That is the failure named in _docs/operations/critical-guards-registry.md: "A
 *    comment carrying a FALSE incident is worse than a thin one."
 *
 *    THE REMEDY IS A GATE, NOT A BETTER COMMENT. A parity check that runs both implementations over
 *    a fixture corpus — covering every input shape either helper claims to accept — and fails the
 *    build when their orderings differ. A promise in a comment is not a guarantee; a failing build
 *    is. (This very file's first draft asserted that gate already existed and that both consumers
 *    already used it. Neither was true when written, and the repo's QC hook blocked it for exactly
 *    the reason above. Left on the record because it is the same mistake, made while documenting
 *    the mistake.)
 *
 * WHY IT ACCEPTS BOTH `toDate` AND `toMillis`
 * -------------------------------------------
 * Widening both helpers to a superset is what makes them behaviourally identical across every
 * shape, rather than merely on the shapes production happens to emit today. Narrowing either one
 * instead would have kept a real divergence alive behind a green test, since production data would
 * never exercise it. Err toward accepting a valid time: reading a real timestamp as "missing"
 * silently demotes a team in the standings, and standings mint credentials.
 *
 * INTENDED CONSUMERS: the tournament results-of-record finalizer, and `discordInteraction`'s
 * `/standings` command (which currently carries the inline copy described above). This module
 * exists so there is ONE server-side copy rather than one per call site. Any new server-side code
 * that ranks teams must require this file rather than re-implement the rule — that re-implementation
 * is precisely how the drift above happened.
 *
 * See: _docs/architecture/hexworth-credential-authority.md ("Tournament position integrity"),
 *      _docs/operations/BUG_TRACKER.md (BUG-022), taskboard 362.
 */
'use strict';

/*
 * Normalize a lastSolveTime to epoch milliseconds.
 *
 * Accepts, in order: a Firestore Timestamp from EITHER SDK (admin exposes toMillis(), web exposes
 * toDate(); real Timestamps have both, one-sided fakes appear in fixtures), a plain
 * {seconds, nanoseconds} object as produced by raw REST/JSON reads, a numeric ms value, or an ISO
 * string. Missing or unparseable -> Infinity, so the team sorts LAST among equal scores.
 */
function solveMs(v) {
    // null/undefined ONLY. A literal 0 is epoch ms — a real time, not "missing" — and `!v` would
    // have swallowed it into Infinity and demoted the team.
    if (v == null) return Infinity;
    if (typeof v.toMillis === 'function') return v.toMillis();      // Firestore Timestamp (admin)
    if (typeof v.toDate === 'function') return v.toDate().getTime(); // Firestore Timestamp (web)
    if (typeof v.seconds === 'number') return v.seconds * 1000;     // plain {seconds, nanoseconds}
    const n = new Date(v).getTime();                                 // numeric ms, or ISO string
    return isNaN(n) ? Infinity : n;
}

/*
 * Return a NEW array of teams ordered by the canonical rule. Pure — does not mutate the input.
 * Each team is expected to have { id, score?, lastSolveTime? }.
 */
function rankTeams(teams) {
    return (teams || []).slice().sort(function (a, b) {
        // 1) score DESC
        const sd = (b.score || 0) - (a.score || 0);
        if (sd !== 0) return sd;
        // 2) earliest lastSolveTime ASC. Compare for EQUALITY before subtracting: Infinity minus
        //    Infinity is NaN, which corrupts Array.sort and silently bypasses the id fallback —
        //    and "many teams at 0 score with no solves" is the NORMAL pre-solve state, not an edge
        //    case, so this path is hit every tournament. (Nancy, BUG-022 round 1.)
        const am = solveMs(a.lastSolveTime), bm = solveMs(b.lastSolveTime);
        if (am !== bm) return am - bm;   // earlier ranks higher; a missing time sorts last
        // 3) stable fallback so re-renders don't reorder a genuine tie
        return String(a.id || '').localeCompare(String(b.id || ''));
    });
}

module.exports = { rankTeams, solveMs };
