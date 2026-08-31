/**
 * HomeDirectory.js — HEXOS-4. One addressable per-user record, assembled by READING.
 *
 * ============================== THIS MODULE NEVER WRITES ==============================
 * Not to Firestore, not to localStorage, not to sessionStorage. Not once. Every function here
 * takes state and returns a value. That is enforced by a gate, not by intention:
 * _tools/hexos/home-directory.test.js fails if this file acquires a write call of any kind.
 *
 * WHY A READ MODEL AND NOT A MIGRATION
 * ------------------------------------
 * HEXOS-4 was specified as "unify ModuleProgress, badges and transcript into one addressable
 * per-user object". The survey that preceded it found the stores it would unify ALREADY DISAGREE
 * with each other, in six ways serious enough to log as bugs (BUG-236..242). Writing a unified
 * store over disagreeing sources does not resolve the disagreement, it LAUNDERS it: one record
 * would then assert a single number where two systems visibly hold two, and the wrongness becomes
 * authoritative and unattributable.
 *
 * So this surfaces the disagreement instead of hiding it. Where sources conflict it reports BOTH
 * and marks which is authoritative. A conflict count is also the cheapest regression detector this
 * class of defect has ever had: five of the six logged bugs survived for months precisely because
 * nothing displayed the contradiction.
 *
 * The pattern is TrophyCabinet.js's, which states its own contract at its top: "this combines the
 * VIEW, not the plumbing. It READS from the existing systems and never migrates or re-awards. No
 * storage is merged, no earned data is moved." It shipped that way. This is the same move wider.
 *
 * The counter-precedent is functions/ctf-stats.js: three conflicting definitions of "pwned",
 * closable only by making the server authoritative AND removing the client writers in one atomic
 * change alongside a rules tightening. That is what an actual unification costs. It is the right
 * eventual answer for some of these fields and it is emphatically not a side effect of building a
 * home directory.
 *
 * SERVER WINS, ALWAYS. Where a server-held record exists it is authoritative and the client mirror
 * is shown as unconfirmed, never promoted. This module also never DERIVES a grade -- it reports a
 * server-held score. The platform rule is that nothing client-side grades anything.
 */

(function () {
    'use strict';

    /* Sources, in the order a reader should trust them. Kept as data so the render layer and the
       tests describe the same set, rather than each carrying its own copy of the list. */
    var AUTHORITY = {
        SERVER: 'server',        // a Cloud Function or rules-protected doc wrote it
        DERIVED: 'derived',      // recomputed deterministically from server state (XPCalculator)
        LOCAL: 'local'           // client storage only; shown, never trusted
    };

    /**
     * Describe one fact and, when two sources disagree, BOTH of them.
     * Returns a plain object so the caller can render it without knowing how it was resolved.
     */
    function fact(label, value, authority, opts) {
        opts = opts || {};
        return {
            label: label,
            value: value,
            authority: authority,
            // The other source's value, when it exists AND differs. Null means "no disagreement",
            // which is different from "no other source" -- see conflictsIn().
            otherValue: (typeof opts.otherValue === 'undefined') ? null : opts.otherValue,
            otherAuthority: opts.otherAuthority || null,
            // Why the sources can differ at all. Shown to the reader, because "these two numbers
            // disagree" is only actionable with the reason attached.
            note: opts.note || null,
            bug: opts.bug || null
        };
    }

    /** True when this fact carries a live disagreement between two sources. */
    function isConflict(f) {
        return f.otherValue !== null && f.otherValue !== f.value;
    }

    function conflictsIn(model) {
        var out = [];
        Object.keys(model.facts || {}).forEach(function (k) {
            var f = model.facts[k];
            if (isConflict(f)) out.push(f);
        });
        return out;
    }

    /**
     * Build the record. PURE: every input is passed in, nothing is fetched here.
     *
     * @param {object} src
     *   src.profile        users/{uid} document data, or null
     *   src.serverAwards   array of users/{uid}/server_awards docs
     *   src.flagCaptures   count of users/{uid}/flag_captures
     *   src.gates          array of {gateNumber, completed, verified, source}
     *   src.quizAttempts   array of {quizId, percentage|score, passed}
     *   src.local          object of relevant localStorage values, already parsed
     *   src.derivedXp      XPCalculator.recalculate() result, or null
     */
    function build(src) {
        src = src || {};
        var profile = src.profile || {};
        var local = src.local || {};
        var facts = {};

        /* XP. XPCalculator declares itself the deterministic single authority and recomputes from
           state rather than accumulating, so its value is the one shown. The stored profile.xp is
           surfaced when it differs -- that delta is a bug report writing itself, and it is exactly
           the drift that let "942+ garbage entries inflate XP by 10-30K per user" go unseen. */
        var derivedXp = (src.derivedXp && typeof src.derivedXp.xp === 'number') ? src.derivedXp.xp : null;
        var storedXp = typeof profile.xp === 'number' ? profile.xp : null;
        facts.xp = fact('XP', derivedXp !== null ? derivedXp : storedXp,
            derivedXp !== null ? AUTHORITY.DERIVED : AUTHORITY.SERVER, {
                otherValue: (derivedXp !== null && storedXp !== null && storedXp !== derivedXp) ? storedXp : undefined,
                otherAuthority: AUTHORITY.SERVER,
                note: 'XP is recomputed by XPCalculator, which declares itself the single authority. '
                    + 'A stored value that differs means something wrote xp directly.',
                bug: 'BUG-238'
            });

        /* Streak. Two definitions existed; the orphaned server one is gone, but the cross-device
           Math.max reconciliation in FirestoreManager remains and is load-bearing, so local and
           cloud can still legitimately differ mid-sync. */
        var localStreak = typeof local.streak === 'number' ? local.streak : null;
        var cloudStreak = typeof profile.streak === 'number' ? profile.streak : null;
        facts.streak = fact('Streak', cloudStreak !== null ? cloudStreak : localStreak, AUTHORITY.SERVER, {
            otherValue: (localStreak !== null && cloudStreak !== null && localStreak !== cloudStreak) ? localStreak : undefined,
            otherAuthority: AUTHORITY.LOCAL,
            note: 'Cross-device reconciliation keeps the higher of the two, so a difference here is '
                + 'expected mid-sync rather than wrong.',
            bug: 'BUG-237'
        });

        /* Badges. server_awards is the tamper-evident proof store; users/{uid}.achievements is BOTH
           CF-written and client-writable, so a badge present there and absent from server_awards is
           not necessarily forged, but it is not PROVEN either. Say which, rather than merging them
           into one count that means neither. */
        var proven = (src.serverAwards || []).length;
        var claimed = Array.isArray(profile.achievements) ? profile.achievements.length : 0;
        facts.badges = fact('Badges (server-proven)', proven, AUTHORITY.SERVER, {
            otherValue: claimed !== proven ? claimed : undefined,
            otherAuthority: AUTHORITY.LOCAL,
            note: 'server_awards is CF-only and tamper-evident. users/{uid}.achievements is also '
                + 'client-writable, so the larger number is "claimed", not "proven".'
        });

        /* Gates. Provenance is carried rather than flattened -- the whole point of BUG-239. Note
           gates 6-8 are client-attested BY DESIGN, so unverified is not a defect and must not be
           rendered as one. */
        var gates = src.gates || [];
        var gatesDone = gates.filter(function (g) { return g.completed; });
        var gatesVerified = gatesDone.filter(function (g) { return g.verified === true; });
        facts.gates = fact('Gates cleared', gatesDone.length, AUTHORITY.SERVER, {
            otherValue: gatesVerified.length !== gatesDone.length ? gatesVerified.length : undefined,
            otherAuthority: AUTHORITY.SERVER,
            note: 'The second number is server-VALIDATED gates. Gates 6-8 validate in the browser '
                + 'and are client-attested by design, so a gap here is expected, not forged.',
            bug: 'BUG-239'
        });

        /* Quizzes. The summary field and the attempt ledger are separate stores with a history of
           disagreeing, so show the ledger's best beside the summary rather than picking one. */
        var summary = profile.quizzes || {};
        var summaryCount = Object.keys(summary).length;
        var attempts = src.quizAttempts || [];
        var passedIds = {};
        attempts.forEach(function (a) { if (a && a.passed && a.quizId) passedIds[a.quizId] = true; });
        var ledgerCount = Object.keys(passedIds).length;
        facts.quizzes = fact('Quizzes passed', summaryCount, AUTHORITY.SERVER, {
            otherValue: ledgerCount !== summaryCount ? ledgerCount : undefined,
            otherAuthority: AUTHORITY.SERVER,
            note: 'The first is the summary map; the second counts distinct passed quizzes in the '
                + 'attempt ledger. The ledger records every submission and is the recoverable one.',
            bug: 'BUG-241'
        });

        facts.flags = fact('Flags captured', src.flagCaptures || 0, AUTHORITY.SERVER, {
            note: 'Server ledger. CTF counters are recomputed from this set, never accumulated.'
        });

        var model = {
            facts: facts,
            /* Transcript does NOT exist. _docs/architecture/user-transcript-and-skill-anchoring.md
               line 3 says "scoped, not built", and there is no transcript code in functions/ or
               _app/components/. Saying so explicitly is the point: a home directory that silently
               omitted it would read as "you have no transcript entries" rather than "this feature
               does not exist yet". */
            transcript: { exists: false, reason: 'scoped, not built — see user-transcript-and-skill-anchoring.md' }
        };
        model.conflicts = conflictsIn(model);
        return model;
    }

    window.HomeDirectory = {
        AUTHORITY: AUTHORITY,
        build: build,
        conflictsIn: conflictsIn,
        isConflict: isConflict
    };
})();
