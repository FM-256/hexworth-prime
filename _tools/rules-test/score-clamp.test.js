#!/usr/bin/env node
'use strict';
/**
 * @catalog what    Proves syncClassProgress's score clamp rejects non-finite input and bounds 0-100
 * @catalog run     node _tools/rules-test/score-clamp.test.js
 * @catalog status  TOOL
 *
 * WHY NOT THE EMULATOR. The functions emulator loads functions/.env, so its webhooks FIRE against
 * live services — that is how fake CTF flags once reached the real Discord for hours
 * (memory: feedback_tests_must_not_reach_production_side_effects). This change is four lines of
 * arithmetic inside one branch, so it is tested by running THOSE FOUR LINES, extracted from the
 * shipped file, with no emulator and no network.
 *
 * It extracts rather than restates them: a copy here would keep passing after production drifted.
 */
const fs = require('fs');
const path = require('path');
const SRC = fs.readFileSync(path.resolve(__dirname, '../../functions/index.js'), 'utf8');

// Pull the shipped clamp out of syncClassProgress.
const START = "const _n = Number(score);";
const END = "updates[`quizScores.${moduleId}`] = Math.max(0, Math.min(100, Math.round(_n)));";
const i = SRC.indexOf(START), j = SRC.indexOf(END);
if (i === -1 || j === -1 || j < i) {
    console.error('SETUP FAILED: could not locate the shipped clamp in functions/index.js.');
    console.error('It was renamed or removed — refusing to report a pass against code that is not there.');
    process.exit(2);
}
const shipped = SRC.slice(i, j + END.length);

class HttpsError extends Error { constructor(code, msg){ super(msg); this.code = code; } }
// Run the shipped lines with `score`, `updates` and `moduleId` supplied.
function applyShipped(score) {
    const updates = {}, moduleId = 'web-security-quiz';
    const fn = new Function('score', 'updates', 'moduleId', 'HttpsError', shipped + '\nreturn updates;');
    return fn(score, updates, moduleId, HttpsError);
}

let pass = 0, fail = 0;
function ok(name, got, want) {
    const good = got === want;
    console.log(`  ${good ? '\x1b[32mPASS\x1b[0m' : '\x1b[31mFAIL\x1b[0m'}  ${name}${good ? '' : `  -> got ${JSON.stringify(got)}, want ${JSON.stringify(want)}`}`);
    good ? pass++ : fail++;
}
function throws(name, score) {
    try { applyShipped(score); console.log(`  \x1b[31mFAIL\x1b[0m  ${name} -> did not throw`); fail++; }
    catch (e) {
        const good = e instanceof HttpsError && e.code === 'invalid-argument';
        console.log(`  ${good ? '\x1b[32mPASS\x1b[0m' : '\x1b[31mFAIL\x1b[0m'}  ${name}${good ? ' [invalid-argument]' : ` -> threw ${e.code || e.message}`}`);
        good ? pass++ : fail++;
    }
}
const K = 'quizScores.web-security-quiz';
// Legitimate values must survive untouched — the clamp must not cost a real submission.
ok('0 passes through',            applyShipped(0)[K],   0);
ok('73 passes through',           applyShipped(73)[K],  73);
ok('100 passes through',          applyShipped(100)[K], 100);
ok('"85" (string) coerces to 85', applyShipped('85')[K], 85);
// Rounding: documented behaviour, so a fractional score is not silently truncated.
ok('86.4 rounds to 86',           applyShipped(86.4)[K], 86);
ok('86.5 rounds to 87',           applyShipped(86.5)[K], 87);
// THE ATTACK and its neighbours.
ok('999999 clamps to 100',        applyShipped(999999)[K], 100);
ok('101 clamps to 100',           applyShipped(101)[K], 100);
ok('-5 clamps to 0',              applyShipped(-5)[K],   0);
ok('-999999 clamps to 0',         applyShipped(-999999)[K], 0);
// Non-finite must be REFUSED, not silently coerced — a NaN in the gradebook is worse than an error.
throws('NaN is rejected',          NaN);
throws('"abc" is rejected',        'abc');
throws('Infinity is rejected',     Infinity);
throws('-Infinity is rejected',    -Infinity);
throws('null is rejected',         null === null ? 'not-a-number-at-all' : null);
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
