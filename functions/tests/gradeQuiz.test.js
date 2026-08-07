#!/usr/bin/env node
'use strict';

/**
 * gradeQuiz Cloud Function — Unit Test Suite
 *
 * Exercises the REAL grading implementation from ../quiz-grading.js, which is the
 * same module functions/index.js calls in production. No Firebase emulator needed:
 * the grading core is pure by construction.
 *
 * Run: cd functions && npm test
 *
 * WHY THIS FILE CHANGED (2026-08-07, taskboard #295)
 * It used to carry its own hand-copied duplicate of the grading loop, introduced with
 * the comment "This mirrors the exact logic in index.js lines 1547-1573. If index.js
 * changes, this must be updated to match." Nobody updated it. Production moved to line
 * 1705 and grew a `terminal` branch that the copy never got, so the suite went on
 * reporting 64/64 green while testing code that no longer existed anywhere. The copy is
 * gone; there is one implementation now and this file imports it.
 *
 * Coverage:
 *   - MC grading (integer comparison)
 *   - MS grading (array, order-insensitive)
 *   - ORDER grading (array, order-sensitive)
 *   - TERMINAL grading (free-text command match)   <- was entirely untested before
 *   - Drawn-subset (poolSize) scoring + the anti-forgery cap   <- #295
 *   - Reveal population, incl. not leaking the undrawn bank
 *   - Edge cases (unanswered, out of range, empty)
 *   - Backward compatibility (no types field)
 *   - Score calculation and pass/fail
 */

const {
    gradeSubmission,
    applyReveal,
    resolveServedCount,
    validSubmittedIndices,
    REJECT_TOO_MANY_ANSWERS
} = require('../quiz-grading');

// Adapter preserving this suite's original positional call shape, so the 64 cases
// written against the old inline copy keep their exact meaning while now running
// against production code. New tests below call gradeSubmission directly.
function gradeQuiz(answers, answerKey, types) {
    return gradeSubmission({ answerKey, types: types || [], answers, poolSize: undefined, isPartial: false });
}

// ─── Test Runner ────────────────────────────────────────────────

let passed = 0;
let failed = 0;
const failures = [];

function assert(condition, testName) {
    if (condition) {
        passed++;
    } else {
        failed++;
        failures.push(testName);
        console.error(`  FAIL: ${testName}`);
    }
}

function assertEq(actual, expected, testName) {
    const eq = JSON.stringify(actual) === JSON.stringify(expected);
    if (!eq) {
        console.error(`  FAIL: ${testName}`);
        console.error(`    Expected: ${JSON.stringify(expected)}`);
        console.error(`    Actual:   ${JSON.stringify(actual)}`);
    }
    assert(eq, testName);
}

// ─── Test Suites ────────────────────────────────────────────────

console.log('\n=== gradeQuiz Test Suite ===\n');

// ── MC Grading (Integer Comparison) ─────────────────────────────

console.log('MC Grading:');

(function testMC_Correct() {
    const r = gradeQuiz({ '0': 2, '1': 1, '2': 3 }, [2, 1, 3]);
    assertEq(r.score, 3, 'MC: all correct → score 3');
    assertEq(r.percentage, 100, 'MC: all correct → 100%');
    assertEq(r.results, [{ correct: true }, { correct: true }, { correct: true }], 'MC: all results true');
})();

(function testMC_AllWrong() {
    const r = gradeQuiz({ '0': 0, '1': 0, '2': 0 }, [2, 1, 3]);
    assertEq(r.score, 0, 'MC: all wrong → score 0');
    assertEq(r.percentage, 0, 'MC: all wrong → 0%');
})();

(function testMC_Partial() {
    const r = gradeQuiz({ '0': 2, '1': 0, '2': 3 }, [2, 1, 3]);
    assertEq(r.score, 2, 'MC: 2 of 3 correct → score 2');
    assertEq(r.percentage, 67, 'MC: 2 of 3 → 67%');
    assertEq(r.results[1].correct, false, 'MC: Q1 wrong');
})();

(function testMC_Unanswered() {
    const r = gradeQuiz({ '0': 2 }, [2, 1, 3]);
    assertEq(r.score, 1, 'MC: 1 answered of 3 → score 1');
    assertEq(r.results[1].correct, false, 'MC: unanswered Q1 → false');
    assertEq(r.results[2].correct, false, 'MC: unanswered Q2 → false');
})();

(function testMC_ZeroIsValid() {
    const r = gradeQuiz({ '0': 0 }, [0]);
    assertEq(r.score, 1, 'MC: answer 0 matches key 0 → correct');
})();

(function testMC_TypeCoercion() {
    // String '2' should NOT match integer 2 (strict equality)
    const r = gradeQuiz({ '0': '2' }, [2]);
    assertEq(r.score, 0, 'MC: string "2" !== integer 2 (strict)');
})();

// ── MS Grading (Array, Order-Insensitive) ───────────────────────

console.log('\nMS Grading:');

(function testMS_ExactOrder() {
    const r = gradeQuiz({ '0': [0, 1] }, [[0, 1]], ['ms']);
    assertEq(r.score, 1, 'MS: [0,1] matches [0,1] → correct');
})();

(function testMS_DifferentOrder() {
    const r = gradeQuiz({ '0': [1, 0] }, [[0, 1]], ['ms']);
    assertEq(r.score, 1, 'MS: [1,0] matches [0,1] (order-insensitive) → correct');
})();

(function testMS_WrongSelection() {
    const r = gradeQuiz({ '0': [0, 2] }, [[0, 1]], ['ms']);
    assertEq(r.score, 0, 'MS: [0,2] does not match [0,1] → wrong');
})();

(function testMS_WrongCount() {
    const r = gradeQuiz({ '0': [0] }, [[0, 1]], ['ms']);
    assertEq(r.score, 0, 'MS: [0] does not match [0,1] (wrong count) → wrong');
})();

(function testMS_ThreeSelections() {
    const r = gradeQuiz({ '0': [2, 0, 1] }, [[0, 1, 2]], ['ms']);
    assertEq(r.score, 1, 'MS: [2,0,1] matches [0,1,2] (3 selections, any order) → correct');
})();

(function testMS_NoTypeField() {
    // When types array is absent, array answers should still work (default = MS behavior)
    const r = gradeQuiz({ '0': [1, 0] }, [[0, 1]]);
    assertEq(r.score, 1, 'MS: no types field, [1,0] matches [0,1] → correct (default sort)');
})();

// ── ORDER Grading (Array, Order-Sensitive) ──────────────────────

console.log('\nORDER Grading:');

(function testORDER_Correct() {
    const r = gradeQuiz({ '0': [0, 1, 2, 3] }, [[0, 1, 2, 3]], ['order']);
    assertEq(r.score, 1, 'ORDER: [0,1,2,3] matches [0,1,2,3] → correct');
})();

(function testORDER_Wrong() {
    const r = gradeQuiz({ '0': [1, 0, 2, 3] }, [[0, 1, 2, 3]], ['order']);
    assertEq(r.score, 0, 'ORDER: [1,0,2,3] does not match [0,1,2,3] → wrong');
})();

(function testORDER_CompletelyReversed() {
    const r = gradeQuiz({ '0': [3, 2, 1, 0] }, [[0, 1, 2, 3]], ['order']);
    assertEq(r.score, 0, 'ORDER: [3,2,1,0] reversed → wrong');
})();

(function testORDER_vsMS_Distinction() {
    // Same data, different type → different result
    const orderResult = gradeQuiz({ '0': [1, 0, 2, 3] }, [[0, 1, 2, 3]], ['order']);
    const msResult = gradeQuiz({ '0': [1, 0, 2, 3] }, [[0, 1, 2, 3]], ['ms']);
    assertEq(orderResult.score, 0, 'ORDER: [1,0,2,3] is wrong order');
    assertEq(msResult.score, 1, 'MS: [1,0,2,3] is correct selection (order irrelevant)');
})();

// ── Mixed Quiz (MC + MS + ORDER) ────────────────────────────────

console.log('\nMixed Quiz:');

(function testMixed_AllCorrect() {
    const answers = {
        '0': 2,          // MC
        '1': [0, 1],     // MS
        '2': 3,          // MC
        '3': [0, 1, 2],  // ORDER
        '4': 1           // MC
    };
    const key = [2, [0, 1], 3, [0, 1, 2], 1];
    const types = ['mc', 'ms', 'mc', 'order', 'mc'];
    const r = gradeQuiz(answers, key, types);
    assertEq(r.score, 5, 'Mixed: all 5 correct');
    assertEq(r.percentage, 100, 'Mixed: 100%');
})();

(function testMixed_Partial() {
    const answers = {
        '0': 2,          // MC correct
        '1': [1, 0],     // MS correct (different order)
        '2': 0,          // MC wrong
        '3': [2, 0, 1],  // ORDER wrong
        '4': 1           // MC correct
    };
    const key = [2, [0, 1], 3, [0, 1, 2], 1];
    const types = ['mc', 'ms', 'mc', 'order', 'mc'];
    const r = gradeQuiz(answers, key, types);
    assertEq(r.score, 3, 'Mixed: 3 of 5 correct');
    assertEq(r.percentage, 60, 'Mixed: 60%');
    assertEq(r.results[0].correct, true, 'Mixed: Q0 MC correct');
    assertEq(r.results[1].correct, true, 'Mixed: Q1 MS correct (reordered)');
    assertEq(r.results[2].correct, false, 'Mixed: Q2 MC wrong');
    assertEq(r.results[3].correct, false, 'Mixed: Q3 ORDER wrong');
    assertEq(r.results[4].correct, true, 'Mixed: Q4 MC correct');
})();

// ── Backward Compatibility ──────────────────────────────────────

console.log('\nBackward Compatibility:');

(function testBackward_NoTypesField() {
    // Simulates existing quiz keys that have no 'types' field
    const r = gradeQuiz({ '0': 2, '1': 1, '2': 0, '3': 3 }, [2, 1, 0, 3]);
    assertEq(r.score, 4, 'Backward: MC-only key without types → all correct');
    assertEq(r.percentage, 100, 'Backward: 100%');
})();

(function testBackward_EmptyTypesArray() {
    const r = gradeQuiz({ '0': 2, '1': 1 }, [2, 1], []);
    assertEq(r.score, 2, 'Backward: empty types array → MC works');
})();

(function testBackward_LargeQuiz() {
    // Simulate a 20-question MC quiz (like the existing midterm keys)
    const key = [2, 2, 1, 0, 2, 1, 2, 2, 3, 1, 2, 1, 1, 1, 2, 0, 2, 2, 1, 2];
    const answers = {};
    key.forEach((v, i) => answers[String(i)] = v);
    const r = gradeQuiz(answers, key);
    assertEq(r.score, 20, 'Backward: 20-question MC all correct');
    assertEq(r.total, 20, 'Backward: total = 20');
    assertEq(r.percentage, 100, 'Backward: 100%');
})();

// ── Edge Cases ──────────────────────────────────────────────────

console.log('\nEdge Cases:');

(function testEdge_EmptyAnswers() {
    const r = gradeQuiz({}, [2, 1, 3]);
    assertEq(r.score, 0, 'Edge: no answers submitted → score 0');
    assertEq(r.total, 3, 'Edge: total still 3');
})();

(function testEdge_EmptyKey() {
    const r = gradeQuiz({ '0': 2 }, []);
    assertEq(r.score, 0, 'Edge: empty answer key → score 0');
    assertEq(r.total, 0, 'Edge: total 0');
    assertEq(r.percentage, 0, 'Edge: 0%');
})();

(function testEdge_ExtraAnswers() {
    // Student submits more answers than questions exist
    const r = gradeQuiz({ '0': 2, '1': 1, '2': 3, '3': 0, '4': 1 }, [2, 1, 3]);
    assertEq(r.score, 3, 'Edge: extra answers ignored → score 3 of 3');
    assertEq(r.total, 3, 'Edge: total = key length, not submission count');
})();

(function testEdge_MSEmptyArray() {
    const r = gradeQuiz({ '0': [] }, [[0, 1]], ['ms']);
    assertEq(r.score, 0, 'Edge: empty array submission → wrong');
})();

(function testEdge_ORDEREmptyArray() {
    const r = gradeQuiz({ '0': [] }, [[0, 1, 2]], ['order']);
    assertEq(r.score, 0, 'Edge: empty order submission → wrong');
})();

// ── Object-Wrapped Answers (Firestore format) ──────────────────

console.log('\nObject-Wrapped Answers (Firestore):');

(function testWrapped_MS() {
    // {ms: [0,1]} instead of [0,1] — Firestore can't store nested arrays
    const r = gradeQuiz({ '0': [0, 1] }, [{ms: [0, 1]}]);
    assertEq(r.score, 1, 'Wrapped MS: {ms:[0,1]} matches [0,1] → correct');
})();

(function testWrapped_MS_Reordered() {
    const r = gradeQuiz({ '0': [1, 0] }, [{ms: [0, 1]}]);
    assertEq(r.score, 1, 'Wrapped MS: {ms:[0,1]} matches [1,0] (order-insensitive) → correct');
})();

(function testWrapped_MS_Wrong() {
    const r = gradeQuiz({ '0': [0, 2] }, [{ms: [0, 1]}]);
    assertEq(r.score, 0, 'Wrapped MS: {ms:[0,1]} does not match [0,2] → wrong');
})();

(function testWrapped_ORDER() {
    const r = gradeQuiz({ '0': [0, 1, 2, 3] }, [{order: [0, 1, 2, 3]}]);
    assertEq(r.score, 1, 'Wrapped ORDER: {order:[0,1,2,3]} matches [0,1,2,3] → correct');
})();

(function testWrapped_ORDER_Wrong() {
    const r = gradeQuiz({ '0': [1, 0, 2, 3] }, [{order: [0, 1, 2, 3]}]);
    assertEq(r.score, 0, 'Wrapped ORDER: {order:[0,1,2,3]} does not match [1,0,2,3] → wrong');
})();

(function testWrapped_Mixed() {
    // Mixed quiz: MC integers + wrapped MS/ORDER objects
    const answers = {
        '0': 0,              // MC
        '1': [0, 1],         // MS
        '2': 0,              // MC
        '3': [0, 1, 2, 3],   // ORDER
        '4': 0               // MC
    };
    const key = [0, {ms: [0, 1]}, 0, {order: [0, 1, 2, 3]}, 0];
    const r = gradeQuiz(answers, key);
    assertEq(r.score, 5, 'Wrapped Mixed: all 5 correct (no types array needed)');
})();

(function testWrapped_Mixed_Partial() {
    const answers = {
        '0': 0,              // MC correct
        '1': [1, 0],         // MS correct (reordered)
        '2': 1,              // MC wrong
        '3': [2, 0, 1, 3],   // ORDER wrong
        '4': 0               // MC correct
    };
    const key = [0, {ms: [0, 1]}, 0, {order: [0, 1, 2, 3]}, 0];
    const r = gradeQuiz(answers, key);
    assertEq(r.score, 3, 'Wrapped Mixed: 3 of 5 correct');
    assertEq(r.results[1].correct, true, 'Wrapped Mixed: Q1 MS reordered → correct');
    assertEq(r.results[3].correct, false, 'Wrapped Mixed: Q3 ORDER wrong sequence → wrong');
})();

(function testWrapped_BackwardCompat() {
    // Existing MC-only keys (no objects) still work
    const r = gradeQuiz({ '0': 2, '1': 1 }, [2, 1]);
    assertEq(r.score, 2, 'Wrapped Backward: MC-only key unchanged → works');
})();

// ── Partial-grading detection (QC-57 per-question calls) ───────
// Mirrors index.js: const isPartial = request.data.partial === true;
// EXPLICIT opt-in only — no length inference (a timed exam's auto-submit
// can legitimately contain a single answer and must stay non-partial).

function detectPartial(requestData) {
    return requestData.partial === true;
}

(function testPartialExplicitTrue() {
    assertEq(detectPartial({ quizId: 'x', answers: { '0': 1 }, partial: true }), true,
        'Partial: explicit partial:true → partial');
})();

(function testPartialAbsent() {
    assertEq(detectPartial({ quizId: 'x', answers: { '0': 1 } }), false,
        'Partial: single-answer WITHOUT flag (timed-exam auto-submit) → NOT partial');
})();

(function testPartialFalsyVariants() {
    assertEq(detectPartial({ partial: false }), false, 'Partial: partial:false → NOT partial');
    assertEq(detectPartial({ partial: 'true' }), false, 'Partial: string "true" → NOT partial (strict ===)');
    assertEq(detectPartial({ partial: 1 }), false, 'Partial: numeric 1 → NOT partial (strict ===)');
})();

(function testPartialFullSubmissionWithFlag() {
    // A client sending partial:true on a full submission only skips its own
    // attempt log + scopes its own reveal — grading itself is unaffected.
    const r = gradeQuiz({ '0': 2, '1': 1 }, [2, 1]);
    assertEq(r.score, 2, 'Partial: grading logic independent of partial flag');
})();

// ── TERMINAL Grading ────────────────────────────────────────────
// Never covered before 2026-08-07: the old hand-copied logic in this file had no
// terminal branch at all, so this whole answer type was unexercised in production.

console.log('\nTERMINAL Grading:');

(function testTerminalExactMatch() {
    const key = [{ terminal: ['ls -la', 'ls -al'] }];
    const r = gradeSubmission({ answerKey: key, types: [], answers: { '0': 'ls -la' }, isPartial: false });
    assertEq(r.score, 1, 'TERMINAL: exact match → correct');
})();

(function testTerminalCaseAndWhitespaceInsensitive() {
    const key = [{ terminal: ['ls -la'] }];
    assertEq(gradeSubmission({ answerKey: key, types: [], answers: { '0': '  LS -LA  ' } }).score, 1,
        'TERMINAL: case + surrounding whitespace ignored');
})();

(function testTerminalAcceptsAnyVariant() {
    const key = [{ terminal: ['ip a', 'ifconfig'] }];
    assertEq(gradeSubmission({ answerKey: key, types: [], answers: { '0': 'ifconfig' } }).score, 1,
        'TERMINAL: any accepted variant counts');
})();

(function testTerminalWrongCommand() {
    const key = [{ terminal: ['ls -la'] }];
    assertEq(gradeSubmission({ answerKey: key, types: [], answers: { '0': 'rm -rf /' } }).score, 0,
        'TERMINAL: non-matching command → wrong');
})();

(function testTerminalBranchPrecedesArrayBranch() {
    // THE REGRESSION THIS GUARDS: `expected` unwraps to an ARRAY of accepted strings.
    // If the array branch ran first, a string submission would fall through to
    // `submitted === expected` (string === array) and grade 0 for EVERY student.
    // Declared via the types array rather than the wrapper, which is the shape that
    // makes branch order actually matter.
    const r = gradeSubmission({
        answerKey: [['ls -la', 'ls -al']], types: ['terminal'], answers: { '0': 'ls -la' }
    });
    assertEq(r.score, 1, 'TERMINAL: string-vs-array handled before the array branch');
})();

(function testTerminalNonStringSubmission() {
    const key = [{ terminal: ['ls'] }];
    assertEq(gradeSubmission({ answerKey: key, types: [], answers: { '0': ['ls'] } }).score, 0,
        'TERMINAL: array submission is not a string → wrong, no crash');
})();

// ── Drawn-subset delivery / poolSize (taskboard #295) ───────────

console.log('\nDrawn Subset (poolSize):');

(function testServedCountResolution() {
    assertEq(resolveServedCount(12, 20), 12, 'served: valid poolSize honoured');
    assertEq(resolveServedCount(undefined, 20), 20, 'served: absent poolSize → full bank');
    assertEq(resolveServedCount(0, 20), 20, 'served: zero rejected → full bank');
    assertEq(resolveServedCount(-5, 20), 20, 'served: negative rejected → full bank');
    assertEq(resolveServedCount(25, 20), 20, 'served: poolSize > bank rejected → full bank');
    assertEq(resolveServedCount(1.5, 20), 20, 'served: non-integer rejected → full bank');
    assertEq(resolveServedCount('12', 20), 20, 'served: string rejected → full bank');
})();

(function testTheActualBug() {
    // THE #295 REPRO. 20-question bank, 12 drawn. The student answers all 12 they were
    // shown, correctly. Before the fix this scored 12/20 = 60% and failed them.
    const answerKey = Array.from({ length: 20 }, (_, i) => i % 4);
    const drawn = [0, 3, 5, 6, 9, 11, 12, 14, 15, 17, 18, 19];   // scattered across the bank
    const answers = {};
    drawn.forEach(i => { answers[String(i)] = answerKey[i]; });

    const r = gradeSubmission({ answerKey, types: [], answers, poolSize: 12, isPartial: false });
    assertEq(r.score, 12, '#295: 12 of 12 correct → score 12');
    assertEq(r.total, 12, '#295: total is the SERVED count, not the 20-question bank');
    assertEq(r.percentage, 100, '#295: a perfect drawn-subset attempt scores 100, not 60');
    assertEq(r.bankSize, 20, '#295: bankSize still reports the full bank');
    assertEq(r.results.length, 20, '#295: results stays bank-length for client index mapping');
    assertEq(r.pooled, true, '#295: pooled flag set');
})();

(function testPooledPartialCredit() {
    const answerKey = Array.from({ length: 20 }, (_, i) => i % 4);
    const drawn = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const answers = {};
    drawn.forEach((i, n) => { answers[String(i)] = n < 7 ? answerKey[i] : (answerKey[i] + 1) % 4; });
    const r = gradeSubmission({ answerKey, types: [], answers, poolSize: 10 });
    assertEq(r.score, 7, 'pooled: 7 of 10 correct → score 7');
    assertEq(r.percentage, 70, 'pooled: 7/10 → 70%, not 7/20 = 35%');
})();

(function testPooledTimeoutSubmitsFewer() {
    // state.answers holds only ANSWERED questions (QuizEngine.js:296-311), so a
    // timed-out attempt legitimately submits fewer than were served. Those unanswered
    // served questions must still count against the student — the denominator is what
    // they were SHOWN, not what they got round to.
    const answerKey = Array.from({ length: 20 }, (_, i) => i % 4);
    const answers = { '0': answerKey[0], '5': answerKey[5], '9': answerKey[9] };
    const r = gradeSubmission({ answerKey, types: [], answers, poolSize: 12 });
    assertEq(r.score, 3, 'pooled timeout: 3 answered correctly → score 3');
    assertEq(r.total, 12, 'pooled timeout: denominator stays at the served count');
    assertEq(r.percentage, 25, 'pooled timeout: 3/12 = 25%, not 3/3 = 100%');
})();

(function testAntiForgeryCap() {
    // Submit the WHOLE bank against a 12-question attempt. Without the cap this is
    // 20/12 = 167%. Must be refused outright rather than clamped, because a client
    // doing this is not a student who mis-clicked.
    const answerKey = Array.from({ length: 20 }, (_, i) => i % 4);
    const answers = {};
    answerKey.forEach((v, i) => { answers[String(i)] = v; });
    const r = gradeSubmission({ answerKey, types: [], answers, poolSize: 12 });
    assert(r.rejected !== null, 'cap: over-submission is rejected');
    // Guarded so a regression that removes the cap reports a clean failure instead of
    // throwing on a null deref and taking the rest of the suite down with it.
    assertEq(r.rejected && r.rejected.code, REJECT_TOO_MANY_ANSWERS, 'cap: reports too-many-answers');
    assert(r.percentage <= 100, 'cap: never returns a percentage above 100');
})();

(function testCapCannotFireOnNonPooledQuiz() {
    // The 415 existing server-graded quizzes must not gain a new way to fail.
    const answerKey = [0, 1, 2, 3];
    const answers = { '0': 0, '1': 1, '2': 2, '3': 3, '99': 1, 'x': 2, '-1': 3, '__proto__': 9 };
    const r = gradeSubmission({ answerKey, types: [], answers });
    assertEq(r.rejected, null, 'cap: cannot fire without pooling, even with junk keys');
    assertEq(r.score, 4, 'cap: junk keys do not affect score');
    assertEq(r.total, 4, 'cap: total is the bank when not pooled');
})();

(function testSubmittedIndexValidation() {
    assertEq(validSubmittedIndices({ '0': 1, '3': 2 }, 5), [0, 3], 'indices: canonical integers accepted');
    assertEq(validSubmittedIndices({ '01': 1, '1.0': 1, '+1': 1, ' 1': 1 }, 5), [],
        'indices: non-canonical integer strings rejected (no cap padding via aliases)');
    assertEq(validSubmittedIndices({ '-1': 1, '99': 1 }, 5), [], 'indices: out-of-range rejected');
    assertEq(validSubmittedIndices({ '__proto__': 1, 'toString': 1 }, 5), [],
        'indices: prototype-shaped keys rejected');
    assertEq(validSubmittedIndices(null, 5), [], 'indices: null answers → empty');
})();

// ── Reveal population ───────────────────────────────────────────

console.log('\nReveal:');

(function testRevealFull() {
    const answerKey = [2, 1, 3];
    const results = [{ correct: true }, { correct: false }, { correct: true }];
    applyReveal({ results, answerKey, explanations: ['a', 'b', 'c'], answers: { '0': 2, '1': 0, '2': 3 }, isPartial: false, pooled: false });
    assertEq(results[1].correctAnswer, 1, 'reveal: correct answer populated');
    assertEq(results[1].explanation, 'b', 'reveal: explanation populated');
})();

(function testRevealPartialScopedToSubmitted() {
    const answerKey = [2, 1, 3];
    const results = [{ correct: true }, { correct: false }, { correct: false }];
    applyReveal({ results, answerKey, explanations: ['a', 'b', 'c'], answers: { '1': 0 }, isPartial: true, pooled: false });
    assertEq(results[0].correctAnswer, undefined, 'reveal: partial does not leak unsubmitted Q0');
    assertEq(results[1].correctAnswer, 1, 'reveal: partial reveals the submitted question');
    assertEq(results[2].correctAnswer, undefined, 'reveal: partial does not leak unsubmitted Q2');
})();

(function testRevealPooledDoesNotLeakUndrawnBank() {
    // Retake pulls a FRESH draw (assessment-testing-standard.md:47). Revealing the
    // undrawn remainder on attempt 1 would hand over the material attempt 2 draws from.
    const answerKey = [0, 1, 2, 3, 0, 1, 2, 3];
    const results = answerKey.map(() => ({ correct: true }));
    applyReveal({ results, answerKey, explanations: [], answers: { '1': 1, '4': 0 }, isPartial: false, pooled: true });
    assertEq(results[1].correctAnswer, 1, 'reveal pooled: asked question revealed');
    assertEq(results[4].correctAnswer, 0, 'reveal pooled: asked question revealed');
    const leaked = results.filter((r, i) => i !== 1 && i !== 4 && r.correctAnswer !== undefined);
    assertEq(leaked.length, 0, 'reveal pooled: ZERO undrawn bank answers leaked');
})();

(function testRevealUnwrapsWrappedTypes() {
    const answerKey = [{ ms: [0, 2] }, { order: [1, 0] }, { terminal: ['ls'] }];
    const results = [{ correct: true }, { correct: true }, { correct: true }];
    applyReveal({ results, answerKey, explanations: [], answers: { '0': [0, 2], '1': [1, 0], '2': 'ls' }, isPartial: false, pooled: false });
    assertEq(results[0].correctAnswer, [0, 2], 'reveal: ms unwrapped');
    assertEq(results[1].correctAnswer, [1, 0], 'reveal: order unwrapped');
    assertEq(results[2].correctAnswer, ['ls'], 'reveal: terminal reveals accepted-command list');
})();

// ── Report ──────────────────────────────────────────────────────

console.log(`\n${'='.repeat(50)}`);
console.log(`  Results: ${passed} passed, ${failed} failed, ${passed + failed} total`);
if (failed > 0) {
    console.log(`\n  Failures:`);
    failures.forEach(f => console.log(`    - ${f}`));
    console.log('');
    process.exit(1);
} else {
    console.log('  All tests passed.\n');
    process.exit(0);
}
