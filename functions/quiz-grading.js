'use strict';

/**
 * quiz-grading.js — the pure grading core of the gradeQuiz Cloud Function.
 *
 * WHY THIS FILE EXISTS
 * Until 2026-08-07 the grading logic lived inline in index.js and the test suite
 * (tests/gradeQuiz.test.js) held a HAND-COPIED duplicate of it, self-described as
 * mirroring "index.js lines 1547-1573". By the time anyone looked, the real code had
 * moved to 1705+ and had grown a `terminal` branch the copy never got. The suite
 * reported 64/64 green while testing logic that was no longer in production. A test
 * that cannot see the thing it checks is not a test. Now there is one implementation
 * and the suite imports it.
 *
 * THE FUNCTION BOUNDARY, and why it is two functions rather than one
 * Grading cannot be a single pure call, because the reveal decision is not knowable
 * until after an async Firestore read. index.js must: grade -> derive `passed` ->
 * await the reviewAfterFails query (needs `db` and `request.auth.uid`) -> only then
 * decide whether to populate correct answers. So the pure part splits in two, and
 * index.js keeps the orchestration and every I/O call:
 *
 *   1. gradeSubmission()  scores the attempt and builds `results`.   (before the DB read)
 *   2. applyReveal()      fills in correctAnswer/explanation.        (after the DB read)
 *
 * Neither function touches Firestore, auth, or HttpsError. Rejections are RETURNED,
 * not thrown, so the caller owns the error type and the rule stays unit-testable.
 *
 * THE THREE COUNTS (taskboard #295)
 * The original code had a single `total = answerKey.length` doing three different
 * jobs, which is what broke drawn-subset delivery. They are now distinct:
 *
 *   bankSize     how many questions are authored. Loop bound for `results` and reveal.
 *   servedCount  how many the student was actually shown. THE DENOMINATOR.
 *   score        how many of the submitted answers were right.
 *
 * When a quiz does not pool, servedCount === bankSize and every expression reduces to
 * exactly what it computed before. That is the compatibility argument: it is not that
 * the non-pooled path was re-tested into looking the same, it is that it is the same
 * arithmetic. 415 quizzes use serverGrading and none of them pool today.
 */

/** Error codes returned (never thrown) in the `rejected` field. */
const REJECT_TOO_MANY_ANSWERS = 'too-many-answers';

/**
 * Compare one submitted answer against its key entry.
 * Moved verbatim from index.js; the branch ORDER is load-bearing and documented inline.
 *
 * @param {*} submitted  what the client sent for this index (undefined if unanswered)
 * @param {*} expected   the key entry, already unwrapped by unwrapExpected()
 * @param {string|null} qType  'mc' | 'ms' | 'order' | 'terminal' | null
 */
function compareAnswer(submitted, expected, qType) {
    if (submitted === undefined) return false;

    if (qType === 'terminal') {
        // TERMINAL (multi-modal quizzes): submitted is a free-text command string; correct if it
        // matches any accepted variant (case-insensitive, trimmed), mirroring the client's own
        // submitTerminal() comparison. This branch MUST precede the array branch below: submitted
        // is a string, so a terminal question would otherwise fall to the final `submitted ===
        // expected` (string === array) and silently grade 0 for EVERY student.
        const accepted = Array.isArray(expected) ? expected : [];
        const norm = (s) => String(s).trim().toLowerCase();
        return typeof submitted === 'string' && accepted.some((a) => norm(a) === norm(submitted));
    }

    if (Array.isArray(expected) && Array.isArray(submitted)) {
        if (submitted.length !== expected.length) return false;
        if (qType === 'order') {
            // ORDER: exact sequence match
            return submitted.every((v, j) => v === expected[j]);
        }
        // MS (or untyped array): sort both, compare elementwise
        const sortedSub = [...submitted].sort((a, b) => a - b);
        const sortedExp = [...expected].sort((a, b) => a - b);
        return sortedSub.every((v, j) => v === sortedExp[j]);
    }

    // MC: direct equality
    return submitted === expected;
}

/**
 * Unwrap object-wrapped answers: {ms: [0,1]}, {order: [0,1,2,3]}, {terminal: ['a','b']}.
 * Firestore does not allow nested arrays, so MS/ORDER/TERMINAL keys are stored as
 * objects keyed by the type. Returns { expected, qType } with qType overridden when
 * the wrapper names it.
 */
function unwrapExpected(rawExpected, declaredType) {
    let expected = rawExpected;
    let qType = declaredType || null;
    if (expected && typeof expected === 'object' && !Array.isArray(expected)) {
        if (expected.ms) { qType = 'ms'; expected = expected.ms; }
        else if (expected.order) { qType = 'order'; expected = expected.order; }
        else if (expected.terminal) { qType = 'terminal'; expected = expected.terminal; }
    }
    return { expected, qType };
}

/**
 * Which submitted keys are real question indices.
 *
 * The client sends `answers` as a plain object keyed by ORIGINAL question index
 * (QuizEngine.js:477-488). Anything that is not a canonical non-negative integer
 * string inside the bank is ignored rather than trusted: '__proto__', '01', '1.0',
 * '-1', '999', 'x' all drop out here. This matters because the count of these keys
 * is what the anti-forgery cap is measured against, so a caller must not be able to
 * pad or alias its way past the cap. Duplicates are impossible — object keys are
 * unique — and Object.keys() ignores the prototype chain.
 */
function validSubmittedIndices(answers, bankSize) {
    if (!answers || typeof answers !== 'object') return [];
    const out = [];
    for (const k of Object.keys(answers)) {
        if (!/^(0|[1-9][0-9]*)$/.test(k)) continue;   // canonical integer strings only
        const i = Number(k);
        if (i >= 0 && i < bankSize) out.push(i);
    }
    return out;
}

/**
 * How many questions the student was actually shown.
 *
 * Authoritative source is the KEY DOC, never the client — the client already chooses
 * which questions to draw, so letting it also declare how many were drawn would let it
 * pick its own denominator. An absent, malformed, zero, negative or oversized poolSize
 * falls back to the full bank, which is the pre-#295 behaviour.
 */
function resolveServedCount(poolSize, bankSize) {
    const ok = Number.isInteger(poolSize) && poolSize > 0 && poolSize <= bankSize;
    return ok ? poolSize : bankSize;
}

/**
 * Grade one submission. Pure: no Firestore, no auth, no throwing.
 *
 * @param {Object}   args
 * @param {Array}    args.answerKey  correct answers in AUTHORED order
 * @param {Array}    [args.types]    optional per-question type array
 * @param {Object}   args.answers    client submission, keyed by original question index
 * @param {number}   [args.poolSize] served-question count from the key doc (null = no pooling)
 * @param {boolean}  [args.isPartial] QC-57 per-question instant-feedback call
 *
 * @returns {Object} {
 *   score, total, percentage, results,
 *   bankSize, servedCount, submittedCount, pooled,
 *   rejected: null | { code, message }
 * }
 *
 * NOTE ON SHAPE: `results.length` is bankSize, which for a pooled quiz is LARGER than
 * `total` (servedCount). They were equal for the entire life of this function before
 * #295, so do not assume it. results stays bank-length because the client indexes into
 * it by ORIGINAL question index (QuizEngine.js:506) — reindexing it would silently
 * misalign every review screen. Entries for questions that were never served carry
 * `correct: false` and the client skips them via its origToDisplay guard
 * (QuizEngine.js:508).
 */
function gradeSubmission({ answerKey, types, answers, poolSize, isPartial }) {
    const bankSize = answerKey.length;
    const servedCount = resolveServedCount(poolSize, bankSize);
    const pooled = servedCount < bankSize;
    const typeArr = types || [];

    const submitted = validSubmittedIndices(answers, bankSize);

    // ANTI-FORGERY CAP. Without it a pooled quiz is scored against a denominator the
    // client can undercut: answer all 20 of a 20-question bank while the key doc says
    // only 12 were served and the score is 20/12 = 167%. Cannot fire on a non-pooled
    // quiz, because out-of-range keys are already filtered and a bank has bankSize
    // distinct indices — so this adds no new failure mode to the 415 existing quizzes.
    if (submitted.length > servedCount) {
        return {
            score: 0, total: servedCount, percentage: 0, results: [],
            bankSize, servedCount, submittedCount: submitted.length, pooled,
            rejected: {
                code: REJECT_TOO_MANY_ANSWERS,
                message: `Submitted ${submitted.length} answers for a ${servedCount}-question attempt.`
            }
        };
    }

    let score = 0;
    const results = [];

    // Loop the BANK, not the denominator: a drawn subset's original indices are scattered
    // across the whole bank (the client draws after shuffling), so stopping at servedCount
    // would skip real answers and grade phantom ones.
    for (let i = 0; i < bankSize; i++) {
        const given = answers ? answers[String(i)] : undefined;
        const { expected, qType } = unwrapExpected(answerKey[i], typeArr[i]);
        const isCorrect = compareAnswer(given, expected, qType);
        if (isCorrect) score++;
        results.push({ correct: isCorrect });
    }

    // THE DENOMINATOR IS servedCount. An unanswered-but-served question stays wrong
    // (it never incremented score), which is the pre-#295 behaviour for a timed-out
    // attempt; state.answers only holds questions the student actually answered
    // (QuizEngine.js:296-311), so submitting fewer than served is legitimate and must
    // not be mistaken for a smaller exam.
    const percentage = servedCount > 0 ? Math.round((score / servedCount) * 100) : 0;

    return {
        score,
        total: servedCount,
        percentage,
        results,
        bankSize,
        servedCount,
        submittedCount: submitted.length,
        pooled,
        rejected: null
    };
}

/**
 * Populate correctAnswer/explanation on an already-graded results array.
 * Pure and in-place; called by index.js only after it has decided a reveal is allowed.
 *
 * @param {Object} args
 * @param {Array}  args.results       from gradeSubmission()
 * @param {Array}  args.answerKey
 * @param {Array}  [args.explanations]
 * @param {Object} args.answers       the client submission (to know what was asked)
 * @param {boolean} [args.isPartial]
 * @param {boolean} [args.pooled]
 */
function applyReveal({ results, answerKey, explanations, answers, isPartial, pooled }) {
    const exps = Array.isArray(explanations) ? explanations : [];
    const bankSize = answerKey.length;

    for (let i = 0; i < bankSize; i++) {
        if (!results[i]) continue;

        // Partial (per-question) calls only reveal the question actually submitted —
        // otherwise a revealToAll key would leak the full answer set on every click.
        if (isPartial && !(String(i) in answers)) continue;

        // POOLED QUIZZES REVEAL ONLY WHAT WAS ASKED. On a full-bank quiz every question
        // was served, so revealing all of them tells the student nothing they did not
        // just sit. On a drawn subset it would hand over the undrawn remainder of the
        // bank — the exact material the next attempt draws from. Retake pulls a fresh
        // draw (assessment-testing-standard.md:47), so leaking the rest of the bank
        // would defeat the point of pooling on the very first attempt.
        if (pooled && !(String(i) in answers)) continue;

        let expected = answerKey[i];
        if (expected && typeof expected === 'object' && !Array.isArray(expected)) {
            if (expected.ms) expected = expected.ms;
            else if (expected.order) expected = expected.order;
            else if (expected.terminal) expected = expected.terminal; // reveal accepted-command list
        }
        results[i].correctAnswer = expected;
        if (exps[i]) results[i].explanation = exps[i];
    }
    return results;
}

module.exports = {
    gradeSubmission,
    applyReveal,
    // exported for direct unit testing
    compareAnswer,
    unwrapExpected,
    validSubmittedIndices,
    resolveServedCount,
    REJECT_TOO_MANY_ANSWERS
};
