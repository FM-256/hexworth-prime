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
 * behavioural test of the transaction belongs in an emulator run with .env neutralised, and is
 * NOT claimed here.
 */

'use strict';
const fs = require('fs');
const path = require('path');
const { shouldReplaceStoredScore } = require('./quiz-score-policy');

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

// ---- The wiring: index.js must actually USE this, not reimplement it ----
// Without this, the policy module could be perfect and recordProgress could still overwrite --
// which is precisely the shape of the original bug (a correct rule stated in two places and
// ignored in the third).
const idx = fs.readFileSync(path.join(__dirname, 'index.js'), 'utf8');
chk('index.js imports the shared policy',
    /require\('\.\/quiz-score-policy'\)/.test(idx));
chk('recordProgress guards the quizzes write with the policy',
    /if \(shouldReplaceStoredScore\(priorScore, quizScore\)\) \{/.test(idx),
    'the write is not gated by the shared decision');

// The unconditional assignment must be gone. Match an assignment to quizzes.{itemId} that is NOT
// preceded within a few lines by the policy call.
const quizWrites = idx.match(/updates\[`quizzes\.\$\{itemId\}`\]\s*=/g) || [];
chk('exactly one place writes the quizzes summary field', quizWrites.length === 1,
    `${quizWrites.length} writers found`);
const guardIdx = idx.indexOf('shouldReplaceStoredScore(priorScore, quizScore)');
const writeIdx = idx.indexOf('updates[`quizzes.${itemId}`] =');
chk('that write sits INSIDE the policy guard, not before it',
    guardIdx !== -1 && writeIdx !== -1 && writeIdx > guardIdx && (writeIdx - guardIdx) < 200,
    `guard@${guardIdx} write@${writeIdx}`);

// The transaction matters: a read-then-write would let a slower lower submission land last.
chk('the compare-and-write runs in a transaction',
    /runTransaction\(async \(tx\) => \{[\s\S]{0,600}?shouldReplaceStoredScore/.test(idx),
    'a plain read-then-write loses a race between two submissions');

console.log(`\n  ${pass}/${pass + fail} passed`);
process.exitCode = fail ? 1 : 0;
