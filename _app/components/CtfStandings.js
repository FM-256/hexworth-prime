/*
 * CtfStandings — the ONE canonical ranking rule for Hexworth CTF tournament standings.
 *
 * WHY THIS EXISTS (BUG-022): tournament positions were ranked by score alone
 * (Firestore orderBy('score','desc')). Score TIES then fell back to document-id
 * order, which is meaningless for standings, so the wrong team could take a podium
 * slot. Positions feed the Hexworth Credential Authority (HCA), so a wrong tie mints
 * a wrong-place trophy/credential. Every standings surface must agree, so the rule
 * lives here once instead of being re-implemented (differently) per surface. The
 * admin console even had a tooltip promising this rule while not implementing it.
 * See _docs/architecture/hexworth-credential-authority.md ("Tournament position
 * integrity") and _docs/operations/BUG_TRACKER.md (BUG-022).
 *
 * CANONICAL RULE: score DESC, then earliest lastSolveTime ASC (the team that reached
 * a given score FIRST outranks a later team at the same score). A team with no
 * lastSolveTime (e.g. score 0 / no solves) sorts LAST among equal scores. Final
 * fallback to team id keeps ordering STABLE across real-time re-renders.
 *
 * Correctness of the rule (verified by tracing, not assumed): lastSolveTime is
 * written via FieldValue.serverTimestamp() on every correct submission alongside
 * score += pointsAwarded (functions/index.js ~6570), so it always marks WHEN a team
 * last changed its score. There is no hint-cost/penalty field competing for the
 * tiebreak, and no manual score-edit path that could create a nonzero tie without a
 * lastSolveTime. So earliest-lastSolveTime-at-equal-score == reached-the-score-first.
 *
 * SCOPE: this is the DISPLAY ranking. The credential-of-record position must come
 * from a frozen, tie-broken snapshot taken at tournament end (the HCA finalization
 * service), computed server-side with this IDENTICAL rule — not a live re-sort.
 */
(function () {
    'use strict';

    /*
     * Normalize a lastSolveTime to epoch milliseconds. Accepts a Firestore Timestamp
     * ({ toDate() }), a plain { seconds } object, a numeric ms value, or an ISO string.
     * Missing / unparseable -> Infinity so the team sorts LAST among equal scores.
     */
    function solveMs(v) {
        if (v == null) return Infinity;   // null/undefined only — a literal 0 (epoch ms) is a real time, not "missing"
        if (typeof v.toDate === 'function') return v.toDate().getTime();   // Firestore Timestamp
        if (typeof v.seconds === 'number') return v.seconds * 1000;        // plain {seconds,nanoseconds}
        var n = new Date(v).getTime();
        return isNaN(n) ? Infinity : n;
    }

    /*
     * Return a NEW array of teams ordered by the canonical rule. Pure — does not
     * mutate the input. Each team is expected to have { id, score?, lastSolveTime? }.
     */
    function rankTeams(teams) {
        return (teams || []).slice().sort(function (a, b) {
            // 1) score DESC
            var sd = (b.score || 0) - (a.score || 0);
            if (sd !== 0) return sd;
            // 2) earliest lastSolveTime ASC. Compare for EQUALITY before subtracting:
            //    Infinity - Infinity = NaN would corrupt Array.sort and silently bypass
            //    the id fallback (the normal pre-solve state has many 0-score/no-time
            //    teams). (Nancy, BUG-022 round 1.)
            var am = solveMs(a.lastSolveTime), bm = solveMs(b.lastSolveTime);
            if (am !== bm) return am - bm;   // earlier ranks higher; a missing time sorts last
            // 3) stable fallback so real-time re-renders don't reorder a genuine tie
            return String(a.id || '').localeCompare(String(b.id || ''));
        });
    }

    window.CtfStandings = { rankTeams: rankTeams, solveMs: solveMs };
})();
