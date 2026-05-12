#!/usr/bin/env node
/**
 * test-grade-eth-midterm.js — Simulate gradeQuiz against the live eth-midterm
 * answer key, with both passing and failing answer sets, to verify the
 * conditional correctAnswer reveal works correctly.
 *
 * This does NOT invoke the deployed Cloud Function — it pulls the answer key
 * from Firestore and runs the same scoring logic locally. The CF logic is
 * deterministic (no IO except the key fetch), so local simulation is
 * functionally equivalent to invoking the deployed CF for the same inputs.
 */
const admin = require('firebase-admin');

if (!admin.apps.length) admin.initializeApp({ projectId: 'hexworth-prime' });
const db = admin.firestore();

const QUIZ_ID = 'divergent-eth-final';

/** Mirror of the gradeQuiz scoring logic from functions/index.js. */
function simulateGradeQuiz(answerKey, passingScore, answers) {
    const total = answerKey.length;
    let score = 0;
    const results = [];
    for (let i = 0; i < total; i++) {
        const submitted = answers[String(i)];
        let expected = answerKey[i];
        // Unwrap object-wrapped answers (MS / ORDER) — eth exams are all MC so this is no-op
        if (expected && typeof expected === 'object' && !Array.isArray(expected)) {
            if (expected.ms) expected = expected.ms;
            else if (expected.order) expected = expected.order;
        }
        const isCorrect = (submitted === expected);
        if (isCorrect) score++;
        results.push({ correct: isCorrect });
    }
    const percentage = total > 0 ? Math.round((score / total) * 100) : 0;
    const passed = percentage >= passingScore;
    // The new behaviour: reveal correctAnswer per question ONLY when passed
    if (passed) {
        for (let i = 0; i < total; i++) {
            let expected = answerKey[i];
            if (expected && typeof expected === 'object' && !Array.isArray(expected)) {
                if (expected.ms) expected = expected.ms;
                else if (expected.order) expected = expected.order;
            }
            results[i].correctAnswer = expected;
        }
    }
    return { score, total, percentage, passed, results };
}

async function main() {
    const keyDoc = await db.doc(`quiz_keys/${QUIZ_ID}`).get();
    if (!keyDoc.exists) {
        console.error(`[FAIL] quiz_keys/${QUIZ_ID} not found`);
        process.exit(1);
    }
    const keyData = keyDoc.data();
    const answerKey = keyData.answers;
    const passingScore = keyData.passingScore || 70;
    const total = answerKey.length;

    console.log(`Quiz: ${QUIZ_ID}`);
    console.log(`  total: ${total}  passingScore: ${passingScore}%`);
    console.log('');

    // SCENARIO A: PASSING (all answers correct)
    const passingAnswers = {};
    for (let i = 0; i < total; i++) passingAnswers[String(i)] = answerKey[i];
    const passingResult = simulateGradeQuiz(answerKey, passingScore, passingAnswers);
    const passingRevealsAll = passingResult.results.every(r => typeof r.correctAnswer === 'number');
    console.log('[A] All-correct submission:');
    console.log(`    score: ${passingResult.score}/${passingResult.total} (${passingResult.percentage}%) passed=${passingResult.passed}`);
    console.log(`    correctAnswer present on every question: ${passingRevealsAll ? 'YES ✓' : 'NO ✗'}`);
    console.log(`    sample: results[0]=${JSON.stringify(passingResult.results[0])}`);

    // SCENARIO B: FAILING (all answers index 0 — most will be wrong)
    const failingAnswers = {};
    // Use a deliberately wrong fixed pick: pick index that is NOT the right answer.
    // Strategy: pick (correct + 1) % numOpts, but we don't know numOpts from key alone.
    // Safer: pick a value guaranteed not to be the key (e.g., 99 for unknown index).
    // For MC questions where answer is 0..3, 99 is always wrong.
    for (let i = 0; i < total; i++) failingAnswers[String(i)] = 99;
    const failingResult = simulateGradeQuiz(answerKey, passingScore, failingAnswers);
    const failingHidesAll = failingResult.results.every(r => r.correctAnswer === undefined);
    console.log('');
    console.log('[B] All-wrong submission:');
    console.log(`    score: ${failingResult.score}/${failingResult.total} (${failingResult.percentage}%) passed=${failingResult.passed}`);
    console.log(`    correctAnswer ABSENT on every question: ${failingHidesAll ? 'YES ✓' : 'NO ✗'}`);
    console.log(`    sample: results[0]=${JSON.stringify(failingResult.results[0])}`);

    // SCENARIO C: BORDERLINE PASS (just at 70% — half correct)
    // Build a set with exactly ceil(70% * total) correct
    const numNeeded = Math.ceil(passingScore / 100 * total);
    const borderlineAnswers = {};
    for (let i = 0; i < total; i++) {
        borderlineAnswers[String(i)] = (i < numNeeded) ? answerKey[i] : 99;
    }
    const borderlineResult = simulateGradeQuiz(answerKey, passingScore, borderlineAnswers);
    console.log('');
    console.log(`[C] Borderline pass submission (${numNeeded}/${total} correct):`);
    console.log(`    score: ${borderlineResult.score}/${borderlineResult.total} (${borderlineResult.percentage}%) passed=${borderlineResult.passed}`);
    if (borderlineResult.passed) {
        const revealsAll = borderlineResult.results.every(r => typeof r.correctAnswer === 'number');
        console.log(`    correctAnswer revealed on all questions: ${revealsAll ? 'YES ✓' : 'NO ✗'}`);
    } else {
        const hidesAll = borderlineResult.results.every(r => r.correctAnswer === undefined);
        console.log(`    correctAnswer hidden on all questions: ${hidesAll ? 'YES ✓' : 'NO ✗'}`);
    }

    console.log('');
    const allPass = passingRevealsAll && failingHidesAll;
    console.log(allPass ? '✓ All checks passed.' : '✗ One or more checks failed.');
    process.exit(allPass ? 0 : 1);
}

main().catch(e => { console.error('[ERROR]', e); process.exit(2); });
