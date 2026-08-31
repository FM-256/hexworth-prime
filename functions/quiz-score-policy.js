/**
 * quiz-score-policy.js — the single definition of "which quiz score is the student's score".
 *
 * WHY THIS FILE EXISTS
 * --------------------
 * This fact had THREE implementations and they did not agree. Two kept the higher score and said
 * so in a comment (`mergeQuizzes` in account-merge.js, `mergeQuizScores` in FirestoreManager.js);
 * the third, `recordProgress` in index.js, assigned unconditionally with no comparison at all.
 * The third is the one on the path students actually take, so a student who retook a quiz and
 * passed again with a LOWER score had their better result destroyed. BUG-241.
 *
 * The remedy is the one ctf-stats.js already established for "boxes pwned", which had the same
 * shape of defect: put the definition in ONE module and import it, so two callers cannot drift.
 * A comment saying "keep in sync!" is not a mechanism; this is.
 *
 * THE POLICY IS BEST-SCORE, AND IT IS A DEFAULT
 * ---------------------------------------------
 * Best-score is right for a teaching platform: a student who retakes a quiz to revise should not
 * be punished for practising, and being shown a lower grade for studying more is the wrong
 * incentive to build into the product.
 *
 * It is NOT a closed pedagogical question. For an assessment of record, latest-score is the more
 * defensible academic policy, and an instructor may specifically need the most recent attempt. If
 * that becomes a requirement, the answer is a per-quiz `policy` field resolved here, not a
 * different global default and not a second implementation somewhere else. Everything routes
 * through this function so that change stays a one-file change.
 *
 * NOTHING IS EVER LOST EITHER WAY. `users/{uid}/quiz_attempts` records every submission
 * (index.js, gradeQuiz), so the losing scores remain recoverable and a future policy change can
 * be applied retroactively from that ledger. This function decides only the SUMMARY field
 * `users/{uid}.quizzes.{quizId}`.
 */

'use strict';

/**
 * Decide whether a newly submitted score should replace the stored one.
 *
 * @param {number|null|undefined} priorScore  the currently stored score, or null/undefined if
 *                                            the student has no recorded score for this quiz
 * @param {number} newScore                   the score just submitted
 * @returns {boolean}                         true if the new score should be written
 */
function shouldReplaceStoredScore(priorScore, newScore) {
    // A non-numeric new score is never written. `parseInt` upstream can yield NaN, and NaN
    // comparisons are always false, which would silently drop the write with no explanation.
    if (typeof newScore !== 'number' || Number.isNaN(newScore)) return false;

    // No prior score of any kind means the first submission always lands. Note that a stored
    // score of 0 is a REAL score and must not be treated as absent, which is why this tests the
    // type rather than falsiness.
    if (typeof priorScore !== 'number' || Number.isNaN(priorScore)) return true;

    // Ties replace. The scores are equal so the student's grade does not change, and refreshing
    // passedAt keeps the timestamp meaningful as "when they most recently achieved this".
    return newScore >= priorScore;
}

/**
 * Build the update payload for one quiz write attempt.
 *
 * RETURNS A NEW OBJECT, ALWAYS. This exists because the first version of the fix mutated a shared
 * `updates` object inside a Firestore transaction callback. Firestore re-invokes that same closure
 * on a contention retry without resetting anything, so:
 *
 *   attempt 1  prior=null  -> decides WRITE, sets updates['quizzes.X'] = {score: 60}
 *              ...commit aborts, another write landed on users/{uid} first
 *   attempt 2  prior=95    -> decides SKIP, so the `if` body never runs
 *                            ...but updates['quizzes.X'] = {score: 60} is STILL THERE from
 *                            attempt 1, and commits, overwriting the 95.
 *
 * The retry path therefore reintroduced the exact race BUG-241 was written to close. Copying the
 * object at the call site would fix it, but only until someone forgets; returning a fresh object
 * from a pure function makes the stale-key state unrepresentable. The same idiom is used by
 * submitScore's top-10 transaction in index.js, which rebuilds its payload from the fresh read on
 * every attempt rather than carrying anything in from outside.
 *
 * @param {object} baseUpdates  fields written regardless of the score decision (updatedAt,
 *                              houseProgress counters). Not mutated.
 * @param {string} itemId       the quiz id
 * @param {number|null} priorScore  score currently stored, or null if none
 * @param {number} newScore     the score just submitted
 * @param {string} nowIso       timestamp for passedAt, passed in so this stays pure
 * @returns {object}            a new payload; includes the quizzes field only if it should be written
 */
function buildQuizUpdate(baseUpdates, itemId, priorScore, newScore, nowIso) {
    const payload = Object.assign({}, baseUpdates);
    if (shouldReplaceStoredScore(priorScore, newScore)) {
        payload[`quizzes.${itemId}`] = { score: newScore, passedAt: nowIso };
    }
    return payload;
}

module.exports = { shouldReplaceStoredScore, buildQuizUpdate };
