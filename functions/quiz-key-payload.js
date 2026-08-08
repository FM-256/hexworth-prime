/**
 * ONE definition of what a registry entry becomes in Firestore.
 *
 * WHY THIS EXISTS (taskboard #298)
 *
 * Two tools write `quiz_keys/{id}` from the same source (`functions/quiz_keys.json`), and
 * they disagreed about what to write:
 *
 *   push-quiz-keys.js   .set(payload, { merge: true })   answers, passingScore,
 *                                                        questionCount, explanations,
 *                                                        revealToAll, reviewAfterFails,
 *                                                        poolSize, updatedAt
 *   seed-quiz-key.js    .set(payload)   NO MERGE          answers, passingScore,
 *                                                        questionCount, note, poolSize
 *
 * Two separate defects fell out of that.
 *
 * **The field set differed.** Running seed-quiz-key.js on a quiz that had post-submission
 * review configured stripped `explanations`, `revealToAll` and `reviewAfterFails`.
 * Students stopped seeing correct answers after submitting and the escape hatch for
 * repeatedly-failing students disappeared. Nothing errored and nothing logged it.
 *
 * **The write mode differed, and this was worse than recorded.** A non-merge `.set()`
 * replaces the WHOLE document. A field scan of production on 2026-08-07 found 30+ distinct
 * field names across the 621 live docs — `source` (225), `createdAt` (219), `shuffled`
 * (21), `seedSource` (18), `rebalancedAt` (15), `passThreshold` (10), `registeredAt` (10),
 * `updatedBy` (6), `correctIsFirst` (6), `lastReseedAt`/`lastReseedBy` (5),
 * `karlAuditArtifact` (4), `fixNote`/`lastFixedBy` (3), and more. seed-quiz-key.js
 * destroyed every one of them on any doc it touched, not just the three fields the task
 * recorded. `karlAuditArtifact` is a citation-audit receipt; `fixNote` and `lastFixedBy`
 * are history. "We do not destroy" applies to fields, not only files.
 *
 * So both tools now merge, and both build their payload here. A field cannot be added to
 * one writer and forgotten in the other, because there is only one writer.
 *
 * WHAT IS AUTHORITATIVE, AND WHAT IS DELIBERATELY NOT
 *
 * `poolSize` and `revealToAll` are written UNCONDITIONALLY — a value when the registry
 * declares one, an explicit delete (poolSize) or `false` (revealToAll) when it does not.
 * Under merge:true a stray flag left on a live doc would otherwise survive forever, and for
 * poolSize that is the false-PASS case #295 fixed: a student who answers 12 of 20 and stops
 * scores 12/12.
 *
 * `explanations` and `reviewAfterFails` are written ONLY when the registry declares them,
 * and are NOT deleted when it does not. That is inconsistent on purpose. Four live quizzes
 * (cloud-openstack-install-quiz, -intro-quiz, -operation-quiz, -projects-quiz) carry
 * `explanations` and `revealToAll` that the registry does not know about — they were seeded
 * straight to Firestore at some point. Switching them to delete-when-absent would silently
 * remove post-submission review from four quizzes that have it today. That is a
 * student-visible change and it is the operator's call, not a side effect of fixing #298.
 *
 * The consequence, stated rather than buried: for those two fields the registry is NOT
 * authoritative, so a value removed from the registry persists in Firestore forever and the
 * two can drift without anything noticing. `--audit-drift` on push-quiz-keys.js reports it.
 */

'use strict';

const admin = require('firebase-admin');

/** Fields the registry owns and both writers therefore control. */
const REGISTRY_OWNED = ['answers', 'passingScore', 'questionCount', 'note',
    'explanations', 'revealToAll', 'reviewAfterFails', 'poolSize'];

/**
 * Build the Firestore payload for one registry entry.
 *
 * @param {object} entry    the quiz_keys.json entry
 * @param {object} [opts]
 * @param {boolean} [opts.serverTimestamp]  true for push (FieldValue), false for seed
 *                                          (ISO string), preserving each tool's existing
 *                                          updatedAt type so no consumer sees a type change.
 * @returns {object} payload for .set(payload, { merge: true })
 */
function buildPayload(entry, { serverTimestamp = true } = {}) {
    return {
        answers: entry.answers,
        passingScore: entry.passingScore != null ? entry.passingScore : 70,
        questionCount: entry.questionCount != null
            ? entry.questionCount
            : entry.answers.length,

        // Optional free-text note. Conditional: absent means "no note", not "delete it".
        ...(entry.note ? { note: entry.note } : {}),

        // Per-question rationales for post-submission answer review. Conditional -- see the
        // four-quiz exception in the module docstring.
        ...(Array.isArray(entry.explanations) ? { explanations: entry.explanations } : {}),

        // Unconditional: tells gradeQuiz to reveal the correct answer to every student, not
        // just passers. A stray `true` left on a live doc would otherwise leak answers.
        revealToAll: entry.revealToAll === true,

        // Opt-in reveal after N failed attempts. Conditional -- same exception.
        ...(Number.isInteger(entry.reviewAfterFails)
            ? { reviewAfterFails: entry.reviewAfterFails }
            : {}),

        // Drawn-subset delivery (#295). gradeQuiz uses this as the SCORING DENOMINATOR, so
        // it is authoritative in both directions: an explicit delete when the registry does
        // not declare one. Requires merge:true, which is why neither writer may drop it.
        poolSize: (Number.isInteger(entry.poolSize) && entry.poolSize > 0)
            ? entry.poolSize
            : admin.firestore.FieldValue.delete(),

        updatedAt: serverTimestamp
            ? admin.firestore.FieldValue.serverTimestamp()
            : new Date().toISOString(),
    };
}

/**
 * Report fields that live Firestore carries but the registry does not declare.
 *
 * These are the silent-drift cases the conditional fields above allow. Returns an array of
 * { quizId, field } so a caller can print them; it decides nothing and changes nothing.
 */
function findDrift(quizId, liveData, entry) {
    const drift = [];
    if (!liveData) return drift;
    if (Array.isArray(liveData.explanations) && !Array.isArray(entry && entry.explanations)) {
        drift.push({ quizId, field: 'explanations' });
    }
    if (Number.isInteger(liveData.reviewAfterFails)
        && !Number.isInteger(entry && entry.reviewAfterFails)) {
        drift.push({ quizId, field: 'reviewAfterFails' });
    }
    return drift;
}

module.exports = { buildPayload, findDrift, REGISTRY_OWNED };
