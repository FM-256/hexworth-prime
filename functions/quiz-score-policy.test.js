#!/usr/bin/env node
/**
 * quiz-score-policy.test.js
 *
 * @catalog what    Proves a passing retake with a LOWER score cannot overwrite a higher one, and
 * @catalog what    proves recordProgress actually routes through the shared policy (BUG-241).
 * @catalog run     node functions/quiz-score-policy.test.js
 * @catalog status  GATE
 *
 * WHY
 * ---
 * BUG-241: `recordProgress` assigned `quizzes.{itemId}` unconditionally, so a student who retook
 * a quiz and passed again with a lower score lost their better result. Two other implementations
 * of the same merge already kept the higher score, which is why this was a drift bug rather than
 * a design disagreement.
 *
 * NO EMULATOR, DELIBERATELY. The Firebase emulator loads functions/.env, so running the real
 * callable would fire real webhooks -- that has already posted fake flags to the live Discord for
 * hours once. These tests exercise the pure policy function directly, plus a source-level check
 * that index.js has not quietly gone back to writing the field without consulting it. A
 * behavioural test of the transaction belongs in an emulator run with .env neutralised.
 *
 * WHAT IS AND IS NOT COVERED HERE. The RETRY SEQUENCE is covered: buildQuizUpdate is pure, so
 * calling it twice with the two reads a contention retry would see reproduces the exact scenario
 * that broke the first version of this fix, without a database. What is NOT covered is that
 * Firestore actually retries the way this assumes, or that tx.update commits what we hand it --
 * that needs the emulator, and is not claimed.
 */

'use strict';
const fs = require('fs');
const path = require('path');
const { shouldReplaceStoredScore, buildQuizUpdate } = require('./quiz-score-policy');

let pass = 0, fail = 0;
const chk = (name, cond, detail) => {
    cond ? pass++ : fail++;
    console.log(`  ${cond ? 'ok  ' : 'FAIL'} ${name}${cond ? '' : '  <- ' + detail}`);
};

// ---- The defect itself ----
chk('a passing retake with a LOWER score does NOT replace the higher one',
    shouldReplaceStoredScore(95, 72) === false, 'this is BUG-241 exactly');
chk('a retake with a HIGHER score does replace', shouldReplaceStoredScore(72, 95) === true);
chk('an equal retake replaces, refreshing passedAt', shouldReplaceStoredScore(88, 88) === true);

// ---- Absence vs a real zero, the classic falsiness trap ----
chk('a first-ever submission always lands (prior null)', shouldReplaceStoredScore(null, 60) === true);
chk('a first-ever submission always lands (prior undefined)',
    shouldReplaceStoredScore(undefined, 60) === true);
chk('a stored 0 is a REAL score, not "absent": 0 then 0 replaces',
    shouldReplaceStoredScore(0, 0) === true);
chk('a stored 50 is not beaten by 0', shouldReplaceStoredScore(50, 0) === false,
    'treating 0 as falsy/absent would wrongly overwrite');
chk('a stored 0 IS beaten by 1', shouldReplaceStoredScore(0, 1) === true);

// ---- Garbage in ----
chk('NaN new score is never written', shouldReplaceStoredScore(50, NaN) === false,
    'NaN comparisons are always false, which would drop the write silently and unexplained');
chk('non-numeric new score is never written', shouldReplaceStoredScore(50, '90') === false);
chk('a corrupt prior score does not block a good new one',
    shouldReplaceStoredScore(NaN, 70) === true);

// ---- THE RETRY BUG, which the first version of this fix actually had ----
// Firestore re-invokes a transaction callback on contention WITHOUT resetting anything the
// closure captured. The original fix mutated a shared `updates` object, so an aborted attempt
// left its quizzes field behind and the retry committed it over a freshly-read higher score --
// the exact race the transaction was added to prevent. These simulate that sequence.
const base = { updatedAt: 'SERVER_TS', 'houseProgress.web.quizzesPassed': 'INC(1)' };

const attempt1 = buildQuizUpdate(base, 'quiz-x', null, 60, 't1');   // no prior -> writes 60
chk('attempt 1 (no prior score) writes the score',
    attempt1['quizzes.quiz-x'] && attempt1['quizzes.quiz-x'].score === 60,
    JSON.stringify(attempt1));

// ...that attempt aborts. A concurrent higher submission lands. The SAME closure runs again.
const attempt2 = buildQuizUpdate(base, 'quiz-x', 95, 60, 't2');
chk('RETRY after a concurrent 95 does NOT carry attempt 1\'s stale 60',
    !('quizzes.quiz-x' in attempt2),
    'stale key survived the retry: ' + JSON.stringify(attempt2));

chk('the retry still writes the non-score fields',
    attempt2.updatedAt === 'SERVER_TS' && attempt2['houseProgress.web.quizzesPassed'] === 'INC(1)',
    JSON.stringify(attempt2));

chk('the shared base object is never mutated', !('quizzes.quiz-x' in base),
    'buildQuizUpdate mutated its input, which is how the retry bug worked: ' + JSON.stringify(base));

chk('two calls return independent objects', attempt1 !== attempt2);

// ---- The wiring: index.js must actually USE this, not reimplement it ----
// Without this, the policy module could be perfect and recordProgress could still overwrite --
// which is precisely the shape of the original bug (a correct rule stated in two places and
// ignored in the third).
const idx = fs.readFileSync(path.join(__dirname, 'index.js'), 'utf8');
chk('index.js imports the shared policy',
    /require\('\.\/quiz-score-policy'\)/.test(idx));
chk('recordProgress builds its payload through the shared policy',
    /buildQuizUpdate\(updates, itemId, priorScore, quizScore,/.test(idx),
    'the write is not gated by the shared decision');
chk('recordProgress does NOT mutate the shared updates object inside the transaction',
    !/runTransaction\(async \(tx\) => \{[\s\S]*?updates\[`quizzes/.test(idx),
    'mutating the captured object is the retry bug');
chk('the transaction commits the per-attempt payload, not the shared object',
    /tx\.update\(userRef, txUpdates\)/.test(idx));

// index.js must not write the summary field ITSELF any more. The only writer is buildQuizUpdate
// in quiz-score-policy.js -- that is what makes the policy unavoidable rather than merely
// available. Note this counts writes in index.js only; the policy module's own write is expected.
const directWrites = idx.match(/\[`quizzes\.\$\{itemId\}`\]\s*=/g) || [];
chk('index.js contains NO direct write to the quizzes summary field',
    directWrites.length === 0,
    `${directWrites.length} direct writer(s) in index.js; the policy module must be the only one`);

const pol = fs.readFileSync(path.join(__dirname, 'quiz-score-policy.js'), 'utf8');
const polWrites = pol.match(/payload\[`quizzes\.\$\{itemId\}`\]\s*=/g) || [];
chk('the policy module is the single writer', polWrites.length === 1,
    `${polWrites.length} writer(s) in quiz-score-policy.js`);

// The transaction matters: a read-then-write would let a slower lower submission land last.
chk('the payload is built INSIDE the transaction, from that attempt\'s own read',
    /runTransaction\(async \(tx\) => \{[\s\S]{0,900}?buildQuizUpdate\(/.test(idx),
    'a plain read-then-write loses a race between two submissions');

console.log(`\n  ${pass}/${pass + fail} passed`);
process.exitCode = fail ? 1 : 0;
