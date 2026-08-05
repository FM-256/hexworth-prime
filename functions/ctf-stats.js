/**
 * ctf-stats.js — the ONE definition of a user's CTF counters.
 *
 * Extracted from index.js so account-merge.js can use the identical logic. Before this, three
 * different notions of "pwned" existed in this codebase — index.js counted canonical registry
 * flags, hackerman-reset.js treated any single flag as one box, and account-merge.js took
 * Math.max of two stored values without recomputing anything. Definitions that live in more
 * than one place drift, and a counter nobody can reproduce is a counter nobody can trust.
 *
 * @module ctf-stats
 */

// ─── CTF stat recompute (server-authoritative) ───────────────────────────────
/**
 * Recompute a user's CTF counters from server-held evidence and write them to the profile.
 *
 * WHY THIS EXISTS. `ctfBoxesPwned` and `ctfFlagsCaptured` had TWO independent writers with
 * different sources of truth: the client (BoxEngine._aggregateCTFStats and a near-duplicate
 * in dashboard.html) scanned localStorage and self-reported, while these Cloud Functions
 * counted validated captures. Last write won, so a displayed number depended on which writer
 * ran most recently rather than on what the student did. Worse, routine drift (second device,
 * cleared storage, a flag found but never submitted) made a forged value indistinguishable
 * from an honest one — the dual-writer design removed the ability to detect tampering.
 *
 * PHASE A of the fix: make the SERVER number correct. Purely additive — the client still
 * writes today and can still overwrite this. Removing the client writers and tightening the
 * firestore.rules allowlist is Phase B, and must ship as one change because dashboard.html
 * bundles these fields with quizzes/labsCompleted/gamesPlayed in a single setUserProfile
 * call: a rules `hasOnly` check evaluates the WHOLE write, so dropping these two fields from
 * the allowlist would silently reject that entire call and break quiz/lab/game sync.
 *
 * DEFINITIONS, both deliberate:
 *   flagsCaptured — every capture doc, tournament ones included. This PRESERVES the existing
 *                   semantics (a raw count()) so no user's number moves in Phase A.
 *   boxesPwned    — a box counts when the distinct flags captured for it reach the number of
 *                   flags its flag_registry doc declares. This is a NEW decision, not a
 *                   refactor: the codebase already contained a conflicting definition in
 *                   hackerman-reset.js ("any flag at all = 1 box"). Captures with no
 *                   flag_registry doc (tournament submissions, keyed by tournamentId) are
 *                   skipped for this count — they have no notion of "all flags" to complete.
 *
 * @param {string} uid
 * @returns {Promise<{boxesPwned:number, flagsCaptured:number}>}
 */
const _flagTotalsCache = new Map();   // boxId -> flag count. Instances are reused between
                                      // invocations, so this avoids re-reading flag_registry
                                      // on every submission. Registry docs are write:false
                                      // and seeded out-of-band, so staleness is not a concern.
async function _recomputeCtfStats(db, FieldValue, uid) {
    const caps = await db.collection(`users/${uid}/flag_captures`).get();

    // Unchanged semantics: every capture counts, whatever its source.
    const flagsCaptured = caps.size;

    // Group the box-sourced captures by box, de-duplicating flag ids.
    const byBox = new Map();
    caps.forEach(doc => {
        const d = doc.data() || {};
        if (d.source === 'tournament') return;      // no flag_registry doc to complete
        if (!d.boxId) return;
        if (!byBox.has(d.boxId)) byBox.set(d.boxId, new Set());
        byBox.get(d.boxId).add(d.flagId || doc.id);
    });

    let boxesPwned = 0;
    for (const [boxId, captured] of byBox) {
        let total = _flagTotalsCache.get(boxId);
        if (total === undefined) {
            const reg = await db.doc(`flag_registry/${boxId}`).get();
            // Skip and log rather than throw: an unknown boxId must never break a submission
            // the student got RIGHT. It only means we cannot judge completion for that box.
            if (!reg.exists) {
                console.warn(`[ctf-stats] no flag_registry/${boxId} — skipped for boxesPwned`);
                _flagTotalsCache.set(boxId, 0);
                continue;
            }
            /* COUNT CANONICAL FLAGS, NOT REGISTRY KEYS. A registry doc may list several
               accepted spellings that all alias to ONE flag — validateFlag resolves them via
               `aliases[fid] || fid` before writing the capture, so a student can only ever
               produce as many distinct capture docs as there are CANONICAL ids. Using the raw
               key count demanded more captures than the box can yield: measured on production,
               6 boxes were affected, five of them dispatch boxes with 5 keys collapsing to a
               single flag — a student who fully completed one showed 1/5 and could never be
               credited with the box. Found immediately after seeding a 6th such box. */
            const regFlags = reg.data().flags || {};
            const regAliases = reg.data().aliases || {};
            total = new Set(Object.keys(regFlags).map(k => regAliases[k] || k)).size;
            _flagTotalsCache.set(boxId, total);
        }
        if (total > 0 && captured.size >= total) boxesPwned++;
    }

    await db.doc(`users/${uid}`).set({
        ctfBoxesPwned: boxesPwned,
        ctfFlagsCaptured: flagsCaptured,
        updatedAt: FieldValue.serverTimestamp()
    }, { merge: true });

    return { boxesPwned, flagsCaptured };
}

module.exports = { recomputeCtfStats: _recomputeCtfStats, _flagTotalsCache };
