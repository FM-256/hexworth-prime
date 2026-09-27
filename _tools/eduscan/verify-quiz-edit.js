#!/usr/bin/env node
'use strict';
/**
 * verify-quiz-edit.js
 *
 * @catalog what   Proves an edit to a server-graded quiz did not regrade anyone: same questions, same
 *                 option counts, and the option at every key index byte-identical to before
 * @catalog run    node _tools/eduscan/verify-quiz-edit.js <before.html> <after.html>
 * @catalog status TOOL
 *
 * WHY IT EXISTS. quiz_keys stores an INDEX, not answer text. So editing a quiz's options is a
 * regrading operation waiting to happen: reorder them, drop one, or rewrite the wrong string, and every
 * student who already took it is silently marked against a different answer. Nothing about the page
 * looks wrong afterwards, and gradeQuiz has no way to notice.
 *
 * This compares a pre-edit copy against the live file and fails on any of the four ways that happens.
 * It is deliberately a DIFF against a saved copy rather than a check of the file alone: "the correct
 * answer looks plausible" is not a property you can evaluate from one side.
 */
const fs = require('fs');
const path = require('path');

const [before, after] = process.argv.slice(2);
if (!before || !after) { console.error('usage: verify-quiz-edit.js <before.html> <after.html>'); process.exit(2); }
const keys = JSON.parse(fs.readFileSync(path.join(__dirname, '..', '..', 'functions', 'quiz_keys.json'), 'utf8'));

function parse(p) {
    const s = fs.readFileSync(p, 'utf8');
    const mid = (s.match(/moduleId:\s*'([^']+)'/) || [])[1];
    const qs = [...s.matchAll(/question:\s*(['"`])((?:\\.|(?!\1).)*)\1([\s\S]*?)options:\s*\[([\s\S]*?)\]/g)]
        .map(m => ({ q: m[2], options: [...m[4].matchAll(/(['"])((?:\\.|(?!\1).)*)\1/g)].map(o => o[2]) }));
    return { mid, qs };
}
const A = parse(before), B = parse(after);
const fail = [];
if (A.mid !== B.mid) fail.push(`moduleId changed: ${A.mid} -> ${B.mid}`);
const key = keys[B.mid];
if (!key || !Array.isArray(key.answers)) fail.push(`no quiz_keys entry for ${B.mid}`);
if (A.qs.length !== B.qs.length) fail.push(`question count ${A.qs.length} -> ${B.qs.length}`);
if (key && key.answers && B.qs.length !== key.answers.length) {
    fail.push(`page has ${B.qs.length} questions but the key holds ${key.answers.length}`);
}
if (!fail.length) {
    B.qs.forEach((b, i) => {
        const a = A.qs[i], ci = key.answers[i];
        if (a.q !== b.q) fail.push(`Q${i + 1}: question text changed`);
        if (a.options.length !== b.options.length) fail.push(`Q${i + 1}: option count ${a.options.length} -> ${b.options.length}`);
        else if (a.options[ci] !== b.options[ci]) fail.push(`Q${i + 1}: CORRECT ANSWER at index ${ci} changed — this regrades students`);
        if (new Set(b.options).size !== b.options.length) fail.push(`Q${i + 1}: duplicate option text introduced`);
    });
}
console.log(`${path.basename(after)}  moduleId=${B.mid}  questions=${B.qs.length}`);
if (fail.length) { console.error('FAIL:'); fail.forEach(f => console.error('  ' + f)); process.exit(1); }
console.log('  PASS: same questions, same option counts, correct answer byte-identical at every key index');
