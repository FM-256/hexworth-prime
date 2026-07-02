#!/usr/bin/env node
'use strict';

/**
 * gradeQuiz Cloud Function — Unit Test Suite
 *
 * Tests the grading comparison logic extracted from the gradeQuiz function.
 * Does NOT require Firebase emulator — tests pure logic only.
 *
 * Run: cd functions && npm test
 *
 * Coverage:
 *   - MC grading (integer comparison)
 *   - MS grading (array, order-insensitive)
 *   - ORDER grading (array, order-sensitive)
 *   - Edge cases (unanswered, out of range, empty)
 *   - Backward compatibility (no types field)
 *   - Score calculation and pass/fail
 */

// ─── Extract the comparison logic from gradeQuiz ────────────────
// This mirrors the exact logic in index.js lines 1547-1573.
// If index.js changes, this must be updated to match.

function compareAnswer(submitted, expected, type) {
    if (submitted === undefined) return false;

    if (Array.isArray(expected) && Array.isArray(submitted)) {
        if (submitted.length !== expected.length) return false;

        if (type === 'order') {
            return submitted.every((v, j) => v === expected[j]);
        } else {
            const sortedSub = [...submitted].sort((a, b) => a - b);
            const sortedExp = [...expected].sort((a, b) => a - b);
            return sortedSub.every((v, j) => v === sortedExp[j]);
        }
    }

    return submitted === expected;
}

function gradeQuiz(answers, answerKey, types) {
    types = types || [];
    const total = answerKey.length;
    let score = 0;
    const results = [];

    for (let i = 0; i < total; i++) {
        const submitted = answers[String(i)];
        let expected = answerKey[i];
        let qType = types[i] || null;

        // Unwrap object-wrapped answers: {ms: [0,1]} or {order: [0,1,2,3]}
        if (expected && typeof expected === 'object' && !Array.isArray(expected)) {
            if (expected.ms) { qType = 'ms'; expected = expected.ms; }
            else if (expected.order) { qType = 'order'; expected = expected.order; }
        }

        const isCorrect = compareAnswer(submitted, expected, qType);
        if (isCorrect) score++;
        results.push({ correct: isCorrect });
    }

    const percentage = total > 0 ? Math.round((score / total) * 100) : 0;
    return { score, total, percentage, results };
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
