/*
 * ctf-badges.js: tournament participation and placement awards.
 *
 * WHY THE TWO BADGE KINDS ARE STORED DIFFERENTLY, WHICH IS THE WHOLE DESIGN
 * ------------------------------------------------------------------------
 * `users/{uid}.achievements` is UNION-MERGED, never subtracted, on every sync, by the server
 * (`syncProgress`: `[...new Set([...cloudData.achievements, ...localAchievements])]`) and again
 * client-side in FirestoreManager. That union is GUARD-04, written after BUG-266 deleted earned
 * work: "a validator may refuse to ACCEPT something. It must not DELETE something already earned."
 *
 * The consequence, which an adversarial review caught before this shipped: **anything revocable must
 * never live in `achievements`.** Remove a badge id from the cloud array and the next sync from any
 * stale device (a laptop that was asleep, a second machine never opened since the win) re-uploads
 * the id from its localStorage and the union puts it straight back. The revocation silently reverses
 * itself, with no error and no log line distinguishing it from an ordinary sync. That is the same
 * shape as BUG-263, where stale client-held values were re-legitimised server-side, except
 * self-inflicted by the platform's own earlier award.
 *
 * So the split is by REVOCABILITY, not by taste:
 *
 *   PARTICIPATION (`tournament_competitor`): awarded on JOIN, and NEVER revoked. Joining is a fact;
 *     leaving the team later does not un-happen it. Because it is never revoked, the union is
 *     harmless (resurrecting a true statement changes nothing), so it is safe in `achievements`
 *     where the trophy cabinet can see it.
 *
 *   PLACEMENT (`tournament_champion` / `_runner_up` / `_third`): REVOCABLE, because a corrected
 *     result must be able to take a trophy back. These are written to `server_awards` ONLY, which is
 *     Cloud-Function-written and never merged from a client, so revocation actually sticks. They are
 *     deliberately NOT in `achievements`.
 *
 * NEITHER KIND MINTS XP. `deriveXP` pays achievement XP only for /^(gate_\d+|dark_arts_gate\d+)$/,
 * so a `tournament_*` id is worth exactly 0 XP and cannot inflate progression or trip GUARD-05.
 *
 * PLACEMENTS ARE READ FROM THE CERTIFIED RECORD, NEVER FROM LIVE `teams`. That is the entire point
 * of taskboard 362: `teams` is admin-writable, so a placement derived from it is not evidence of
 * anything. Inherited limit, recorded in BUG-254: the record is tamper-EVIDENT after certification
 * and unprotected before it, so a placement badge is not proof of an unimpeachable result.
 *
 * See: _docs/architecture/hexworth-credential-authority.md (Principle 2: competition never
 *      automatically grants a CREDENTIAL; these are System II competition awards, not credentials),
 *      taskboard 362 and 364.
 */
'use strict';

/* The four ids. Static, not per-tournament: the trophy cabinet renders from a static definition
   list and keys its art off the id (`TrophyCabinet.js`: `art: def.id`), so a dynamic
   `tourn_<id>_1st` would be written and never rendered. Per-tournament detail lives in the
   `placements` map on the award document instead. Ids match /^[a-z][a-z0-9_]{0,60}$/, the shape
   `awardMissionBadge` already enforces, and none collide with an existing achievement id. */
const BADGE = {
    CHAMPION:   'tournament_champion',
    RUNNER_UP:  'tournament_runner_up',
    THIRD:      'tournament_third',
    COMPETITOR: 'tournament_competitor',
};
const PLACEMENT_BY_POSITION = { 1: BADGE.CHAMPION, 2: BADGE.RUNNER_UP, 3: BADGE.THIRD };

/**
 * Award the participation badge for joining a tournament.
 *
 * MUST NEVER THROW INTO THE JOIN PATH. The caller awaits this inside ctfJoinTeam, and a student
 * being unable to join a tournament because a cosmetic badge write failed would be a far worse
 * defect than a missing badge. Same shape as the ALREADY_SOLVED audit write in ctfSubmitFlag:
 * log the failure, return false, let the important operation succeed.
 *
 * @param {object} opts
 * @param {FirebaseFirestore.Firestore} opts.db
 * @param {object}  opts.FieldValue
 * @param {string}  opts.uid
 * @param {string}  opts.tournamentId
 * @param {string}  opts.tournamentName
 * @param {string}  opts.teamId
 * @param {boolean} opts.verifiedJoin  true when a join code was actually checked
 * @returns {Promise<boolean>} true if the award was written
 */
async function awardParticipation({ db, FieldValue, uid, tournamentId, tournamentName, teamId, verifiedJoin }) {
    try {
        const badgeId = BADGE.COMPETITOR;
        /* `verifiedJoin` records whether a join code was actually verified, because a tournament
           with NO code configured is open to any signed-in account (anonymous sign-in included).
           Conflating "verified attendance" with "auth-only walk-in" in one field would hand a
           later audit, or a credential consumer, a claim it cannot qualify. Recorded, not
           blocked: the badge mints no XP, and refusing to award on open tournaments would punish
           students for an admin's configuration choice. */
        const entry = {
            tournamentId,
            name: tournamentName || '',
            teamId,
            verifiedJoin: verifiedJoin === true,
            joinedAt: new Date().toISOString(),
        };

        // server_awards is the tamper-evident proof store: Cloud-Function-written, never merged
        // from a client. merge:true so a second tournament ADDS a key rather than replacing the map.
        await db.doc(`users/${uid}/server_awards/${badgeId}`).set({
            badgeId,
            name: 'Competitor',
            source: 'server',
            kind: 'tournament_participation',
            placements: { [tournamentId]: entry },
            awardedAt: FieldValue.serverTimestamp(),
        }, { merge: true });

        /* Safe in `achievements` ONLY because this badge is never revoked; see the header. If that
           ever changes, this line must move out, or a revocation will silently self-reverse. */
        await db.doc(`users/${uid}`).set({
            achievements: FieldValue.arrayUnion(badgeId),
            updatedAt: FieldValue.serverTimestamp(),
        }, { merge: true });

        return true;
    } catch (e) {
        console.error(`[ctf-badges] participation award failed for ${uid} @ ${tournamentId}:`, e && e.message);
        return false;
    }
}

/**
 * Backfill the participation badge for everyone already on a tournament's roster.
 *
 * WHY THIS IS NEEDED AT ALL. The participation badge fires only when `ctfJoinTeam` is CALLED, so
 * anyone ALREADY on a roster never receives it: they will not call join again. That covers two real
 * populations, not a hypothetical one:
 *   - students who joined before this feature shipped, and
 *   - students an admin placed directly into `members`, which is a supported flow and was the exact
 *     defect an integration test caught inside ctfJoinTeam itself.
 * Without this, "badges are assigned automatically when a user joins" is true going forward and
 * false for everyone already there.
 *
 * `verifiedJoin` IS RECORDED AS FALSE, DELIBERATELY, AND IT IS NOT A DEMOTION. At backfill time
 * there is no way to know whether that student originally typed a join code: the roster carries no
 * record of it. Writing `true` would assert something unknown, and this field exists precisely to
 * keep "verified attendance" separable from "we cannot qualify this". False is the honest value.
 * It is also non-destructive: `merge` with `arrayUnion` means a student who LATER joins properly
 * gets their entry rewritten with the verified value, so backfilling can only ever add.
 *
 * @returns {Promise<{awarded, skipped, members}>}
 */
async function backfillParticipation({ db, FieldValue, tournamentId, tournamentName, teams }) {
    let awarded = 0, skipped = 0, members = 0;
    for (const team of (teams || [])) {
        for (const uid of (Array.isArray(team.members) ? team.members : [])) {
            members++;
            const ref = db.doc(`users/${uid}/server_awards/${BADGE.COMPETITOR}`);
            /* THE SKIP-CHECK AND THE WRITE MUST BE ONE TRANSACTION.
               A plain read-then-write is a TOCTOU: a REAL join landing in the gap would be read as
               "absent", and this backfill would then overwrite that student's genuine
               `verifiedJoin:true` entry with an unverified one. Both paths `set(..., {merge:true})`
               on the same nested key, so last write wins on it and the downgrade is silent. The odds
               are low against one dormant roster, but this is permanent platform logic, not a
               scratch script, and quietly demoting verified attendance to an unqualifiable claim is
               exactly the confusion `verifiedJoin` exists to prevent. (Adversarial review.) */
            try {
                const wrote = await db.runTransaction(async (tx) => {
                    const snap = await tx.get(ref);
                    const held = snap.exists ? (snap.data().placements || {}) : {};
                    if (held[tournamentId]) return false;      // a real join beat us; leave it alone
                    tx.set(ref, {
                        badgeId: BADGE.COMPETITOR,
                        name: 'Competitor',
                        source: 'server',
                        kind: 'tournament_participation',
                        placements: {
                            [tournamentId]: {
                                tournamentId,
                                name: tournamentName || '',
                                teamId: team.id,
                                verifiedJoin: false,
                                backfilled: true,
                                joinedAt: new Date().toISOString(),
                            },
                        },
                        awardedAt: FieldValue.serverTimestamp(),
                    }, { merge: true });
                    return true;
                });
                if (!wrote) { skipped++; continue; }
                /* The achievements union is a separate document and cannot join the transaction
                   above. It is arrayUnion, so it is idempotent and order-independent: worst case a
                   crash between the two leaves the proof doc without the display id, which the next
                   run repairs. The proof store is the one that must not be wrong. */
                await db.doc(`users/${uid}`).set({
                    achievements: FieldValue.arrayUnion(BADGE.COMPETITOR),
                    updatedAt: FieldValue.serverTimestamp(),
                }, { merge: true });
                awarded++;
            } catch (e) {
                console.error(`[ctf-badges] backfill failed for ${uid} @ ${tournamentId}:`, e && e.message);
            }
        }
    }
    return { awarded, skipped, members };
}

/**
 * Award placement badges for a finalized tournament, from its certified results-of-record.
 *
 * Idempotent by CONTENT, not by re-running blindly: a uid is only written when its stored placement
 * for this tournament actually differs from what the record now says. A re-run against an unchanged
 * record performs zero writes, which matters: the fan-out ceiling is 200 teams x 4 members
 * = ~800 users, and a blind strip-and-reapply would be a write storm every time an admin
 * double-checked.
 *
 * @returns {Promise<{version, awarded, revoked, unchanged, teams}>}
 */
async function awardPlacements({ db, FieldValue, tournamentId, record }) {
    if (!record || !Array.isArray(record.standings)) {
        const e = new Error('No certified results-of-record to award from.');
        e.code = 'failed-precondition';
        throw e;
    }
    const version = record.version || 1;
    const tournamentName = record.tournamentName || '';

    /* What the record says each uid should hold now. Only the top three positions carry a placement;
       everyone else holds nothing (participation is a separate, join-time badge). */
    const intended = new Map();   // uid -> { badgeId, entry }
    for (const s of record.standings) {
        const badgeId = PLACEMENT_BY_POSITION[s.position];
        if (!badgeId) continue;
        for (const uid of (Array.isArray(s.members) ? s.members : [])) {
            intended.set(uid, {
                badgeId,
                entry: {
                    tournamentId,
                    name: tournamentName,
                    teamId: s.teamId,
                    teamName: s.name || '',
                    position: s.position,
                    recordVersion: version,
                    provenance: record.provenance || null,
                    awardedAt: new Date().toISOString(),
                },
            });
        }
    }

    /* Everyone who currently holds a placement FOR THIS TOURNAMENT, so a correction can take it
       back. Derived from the record's own standings across ALL positions, plus the intended set:
       a demoted team is still in `standings`, just no longer in the top three. */
    const affected = new Set(intended.keys());
    for (const s of record.standings) {
        for (const uid of (Array.isArray(s.members) ? s.members : [])) affected.add(uid);
    }

    let awarded = 0, revoked = 0, unchanged = 0;
    for (const uid of affected) {
        const want = intended.get(uid) || null;
        for (const badgeId of [BADGE.CHAMPION, BADGE.RUNNER_UP, BADGE.THIRD]) {
            const ref = db.doc(`users/${uid}/server_awards/${badgeId}`);
            const snap = await ref.get();
            const held = snap.exists ? (snap.data().placements || {}) : {};
            const current = held[tournamentId] || null;
            const shouldHold = want && want.badgeId === badgeId;

            if (shouldHold) {
                // Only write when the stored placement actually differs. Compare the fields that
                // define the claim, NOT awardedAt, which changes on every run by construction.
                if (current && !current.revoked &&
                    current.position === want.entry.position &&
                    current.recordVersion === want.entry.recordVersion) { unchanged++; continue; }
                await ref.set({
                    badgeId,
                    name: { [BADGE.CHAMPION]: 'Tournament Champion',
                            [BADGE.RUNNER_UP]: 'Tournament Runner-Up',
                            [BADGE.THIRD]: 'Tournament Third Place' }[badgeId],
                    source: 'server',
                    kind: 'tournament_placement',
                    placements: { [tournamentId]: want.entry },
                    awardedAt: FieldValue.serverTimestamp(),
                }, { merge: true });
                awarded++;
            } else if (current && !current.revoked) {
                /* REVOKED, NOT DELETED. The placement key stays, flipped to revoked with the version
                   that superseded it, so the history of "held 1st under v1, corrected under v2"
                   survives. HCA Principle 5, status changes but history never disappears. Consumers
                   must treat `revoked:true` as not-held.
                   This is why placements are NOT in `achievements`: there, a stale device would
                   union the id straight back and undo this. */
                await ref.set({
                    placements: {
                        [tournamentId]: Object.assign({}, current, {
                            revoked: true,
                            revokedAtVersion: version,
                            revokedReason: record.reason || 'superseded by a corrected result',
                        }),
                    },
                }, { merge: true });
                revoked++;
            }
        }
    }
    return { version, awarded, revoked, unchanged, teams: record.standings.length };
}

module.exports = { awardParticipation, backfillParticipation, awardPlacements, BADGE, PLACEMENT_BY_POSITION };
