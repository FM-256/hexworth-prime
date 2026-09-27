#!/usr/bin/env node
'use strict';
/**
 * answer-length-detail.js
 *
 * @catalog what   Per-QUESTION length-bias detail for a server-graded quiz: option texts, their
 *                 lengths, which one the key marks correct, and how much longer it is than the rest
 * @catalog run    node _tools/eduscan/answer-length-detail.js <quiz.html> [--all]
 * @catalog status TOOL
 *
 * WHY THIS AND NOT answer-balance-audit.js. That tool measures the platform and reports AGGREGATES
 * (correct is longest in 11/15), which is what you need to find the problem and useless for fixing it:
 * it cannot tell you WHICH question or by how much. This prints the per-question view an author needs
 * to lengthen the right distractors, and reuses the same join it does -- options from the page, correct
 * index from functions/quiz_keys.json under the moduleId, in authored order -- so the two cannot
 * disagree about what "correct" means.
 *
 * THE FIX IT SUPPORTS IS LENGTHENING DISTRACTORS, not trimming the correct answer. A uniformly terse
 * key is its own tell, and shortening a correct technical answer usually costs precision. It also
 * never reorders options, because the key stores an INDEX: reordering silently regrades every student.
 */
const fs = require('fs');
const path = require('path');

const file = process.argv[2];
const showAll = process.argv.includes('--all');
if (!file) { console.error('usage: answer-length-detail.js <quiz.html> [--all]'); process.exit(2); }
const REPO = path.join(__dirname, '..', '..');
const src = fs.readFileSync(file, 'utf8');
const keys = JSON.parse(fs.readFileSync(path.join(REPO, 'functions', 'quiz_keys.json'), 'utf8'));

const mid = (src.match(/moduleId:\s*'([^']+)'/) || [])[1];
if (!mid) { console.error('no moduleId in that page'); process.exit(1); }
const key = keys[mid];
if (!key || !Array.isArray(key.answers)) { console.error(`no quiz_keys entry for ${mid}`); process.exit(1); }

/* Questions in AUTHORED order, which is the order the key's answers array is in. */
const qBlocks = [...src.matchAll(/question:\s*(['"`])((?:\\.|(?!\1).)*)\1([\s\S]*?)options:\s*\[([\s\S]*?)\]/g)];
const rows = qBlocks.map(m => {
    const texts = [...m[4].matchAll(/(['"])((?:\\.|(?!\1).)*)\1/g)].map(o => o[2]);
    return { q: m[2], options: texts };
});

console.log(`${file}`);
console.log(`moduleId ${mid}   questions parsed ${rows.length}   key answers ${key.answers.length}`);
if (rows.length !== key.answers.length) {
    console.error(`\nREFUSING to report: parsed ${rows.length} questions but the key holds ${key.answers.length}. `
        + 'A mismatch means the join is wrong, and a per-question report built on a wrong join would point at the wrong text.');
    process.exit(1);
}

let offenders = 0;
rows.forEach((r, i) => {
    const ci = key.answers[i];
    const lens = r.options.map(t => t.length);
    const max = Math.max(...lens);
    const isLongest = lens[ci] === max && new Set(lens).size > 1;
    const tied = lens.filter(l => l === max).length > 1;
    if (isLongest) offenders++;
    if (!isLongest && !showAll) return;
    const gap = max - Math.max(...lens.filter((_, j) => j !== ci), 0);
    console.log(`\nQ${i + 1}${isLongest ? (tied ? '  [LONGEST, tied]' : `  [LONGEST by ${gap} chars]`) : ''}: ${r.q.slice(0, 84)}`);
    r.options.forEach((t, j) => {
        console.log(`   ${j === ci ? '*' : ' '} [${String(lens[j]).padStart(3)}] ${t.slice(0, 92)}`);
    });
});
const pct = rows.length ? (100 * offenders / rows.length).toFixed(1) : '0';
console.log(`\ncorrect is strictly longest in ${offenders}/${rows.length} (${pct}%), chance is ~${(100 / (rows[0] ? rows[0].options.length : 4)).toFixed(0)}%`);
