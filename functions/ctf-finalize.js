/*
 * ctf-finalize.js — the tournament results-of-record transaction.
 *
 * WHY THIS IS A MODULE AND NOT THE BODY OF THE CALLABLE
 * ----------------------------------------------------
 * Two reasons, and the second is the one that mattered.
 *
 * 1. TESTABILITY WITHOUT THE FUNCTIONS EMULATOR. Requiring `functions/index.js` loads the whole
 *    Cloud Functions surface, and the functions emulator loads `functions/.env`. This repo has a
 *    logged incident where exactly that fired real Discord webhooks at a live channel for hours
 *    (`feedback_tests_must_not_reach_production_side_effects`). Isolating the logic here means the
 *    test requires ONLY this file plus firebase-admin pointed at the FIRESTORE emulator: `.env` is
 *    never read, no callable is registered, and no webhook can fire even by accident.
 *
 * 2. THE LOGIC WAS NEVER EXECUTED. A quality gate blocked the first version of this work for
 *    precisely that: idempotent-retry, guard-branch ordering, and `transaction.get()` on a
 *    CollectionReference are properties that READ correctly and BEHAVE differently, and none of
 *    them had been run once. "Sound on reading" is not the bar for a write that decides a
 *    credential.
 *
 * DEPENDENCIES ARE INJECTED (`db`, `FieldValue`) rather than imported, so the caller decides
 * whether they point at production or an emulator. This module deliberately knows nothing about
 * HttpsError or firebase-functions: it throws plain Errors carrying a `code`, and the callable maps
 * those to the right HTTPS status. That keeps the transaction runnable from a plain node script.
 *
 * See: _docs/architecture/hexworth-credential-authority.md ("Tournament position integrity"),
 *      taskboard 362.
 */
'use strict';

const { rankTeams } = require('./ctf-standings-rule');

/* Throw shape shared with the callable. `code` is mapped to an HttpsError by the caller. */
function err(code, message) {
    const e = new Error(message);
    e.code = code;
    return e;
}

/**
 * Finalize a tournament: certify its standings and mark it ended, atomically.
 *
 * @param {object}  opts
 * @param {FirebaseFirestore.Firestore} opts.db
 * @param {object}  opts.FieldValue       admin.firestore.FieldValue (injected for testability)
 * @param {string}  opts.tournamentId
 * @param {string?} opts.reason           REQUIRED to re-finalize an already-certified tournament
 * @param {string?} opts.actorUid         recorded on the record for audit
 * @returns {Promise<{ok, alreadyFinalized, version, provenance, standings}>}
 */
async function finalizeTournament({ db, FieldValue, tournamentId, reason, actorUid }) {
    if (!tournamentId) throw err('invalid-argument', 'tournamentId is required.');
    const correctionReason = (typeof reason === 'string' && reason.trim()) ? reason.trim() : null;

    const tRef = db.collection('tournaments').doc(tournamentId);
    const finalRef = tRef.collection('results').doc('final');

    return await db.runTransaction(async (tx) => {
        // ── ALL READS FIRST. Firestore requires every read in a transaction to precede every
        //    write, and reading the whole teams collection here is also what makes the crediting
        //    path in ctfSubmitFlag conflict-detectable against this one.
        const [tSnap, finalSnap, teamsSnap] = await Promise.all([
            tx.get(tRef),
            tx.get(finalRef),
            tx.get(tRef.collection('teams'))
        ]);

        if (!tSnap.exists) throw err('not-found', 'Tournament not found.');
        const tournament = tSnap.data();
        const status = tournament.status || '';
        const already = finalSnap.exists ? finalSnap.data() : null;

        /* ── THE GUARD, AND ITS BRANCH ORDER IS THE POINT ──────────────────────────────────
         * Existence is checked BEFORE status. Reversed, a plain retry of an already-successful
         * call (client timeout, double-click) would hit "status must be active or frozen" and
         * throw — the function would be idempotent only for calls arriving before the first one
         * committed, which is the opposite of retry-safety.
         */
        if (already && !correctionReason) {
            return {
                ok: true, alreadyFinalized: true,
                version: already.version || 1,
                provenance: already.provenance,
                standings: already.standings || []
            };
        }

        let provenance;
        if (already && correctionReason) {
            provenance = 'correction';          // deliberate re-finalize, e.g. a disqualification
        } else if (status === 'active' || status === 'frozen') {
            provenance = 'live';                // witnessed: certified as the event ends
        } else if (status === 'ended') {
            /* First finalize of a tournament that ended BEFORE this existed. Without this branch
               every historical tournament is permanently un-certifiable. Deliberately NOT labelled
               'live': nothing witnessed it at the end instant and `teams` has been admin-writable
               ever since, so it is weaker evidence and the record says so. */
            provenance = 'backfill';
        } else {
            throw err('failed-precondition',
                `Cannot finalize a tournament with status '${status}'. Expected active, frozen, or ` +
                `ended (backfill). To re-finalize a completed tournament, supply a reason.`);
        }

        const version = already ? ((already.version || 1) + 1) : 1;

        // The ONE canonical rule. Never re-implement it at a call site.
        const ranked = rankTeams(teamsSnap.docs.map(d => ({ id: d.id, ...d.data() })));

        /* THE RECORD MUST CARRY EVERYTHING ITS CONSUMERS RENDER, not merely what decides rank.
           A first draft stored only ranking fields and dropped `color`/`memberNames`: nothing about
           the standings would have been WRONG, the Big Screen would simply have rendered every team
           in the same fallback colour and replaced the spotlight roster with "N members" — silently,
           and only once a tournament was finalized. Trimming a snapshot for size is how you blank a
           panel. `members` (uids) is not cosmetic: placement belongs to a TEAM and a credential to a
           PERSON, so the roster AT FINALIZATION is the attribution bridge. */
        const standings = ranked.map((t, i) => ({
            position: i + 1,
            teamId: t.id,
            name: t.name || '',
            color: t.color || '',
            score: t.score || 0,
            solves: Array.isArray(t.solves) ? t.solves : [],
            members: Array.isArray(t.members) ? t.members : [],
            memberNames: Array.isArray(t.memberNames) ? t.memberNames : [],
            lastSolveTime: t.lastSolveTime || null
        }));

        const record = {
            version,
            provenance,
            reason: correctionReason,
            standings,
            teamCount: standings.length,
            tournamentName: tournament.name || '',
            scoringModel: tournament.scoringModel || 'static',
            finalizedAt: FieldValue.serverTimestamp(),
            finalizedBy: actorUid || null
        };

        // ── WRITES. The immutable per-version copy, then the pointer consumers read.
        tx.set(tRef.collection('results').doc('v' + version), record);
        tx.set(finalRef, record);
        tx.update(tRef, { status: 'ended', endedAt: FieldValue.serverTimestamp() });

        return { ok: true, alreadyFinalized: false, version, provenance, standings };
    });
}

module.exports = { finalizeTournament };
