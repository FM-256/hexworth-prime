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

module.exports = { shouldReplaceStoredScore };
