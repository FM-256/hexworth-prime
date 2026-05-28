#!/usr/bin/env node
/**
 * ala-shuffle.js — Deterministic per-question option shuffle for ALA browser-graded quizzes.
 *
 * Background:
 *   The 4 ALA weekly quizzes (matrix-ala-w{1,2,3,4}-quiz) are BROWSER-graded
 *   (line 423 comment in each HTML file lies about server-grading; actual grading
 *   compares `idx === q.ans` in selectAnswer()). The Firestore quiz_keys/{id}
 *   doc is inert at runtime for these. Sonnet generated all 4 with the correct
 *   answer at position 1 (B) ~80% of the time, making them gameable.
 *
 * Approach:
 *   Per-question deterministic shuffle, seeded by sha256(quizId + ':' + qIndex).
 *   Reorders `opts[]` and updates `ans:` in the HTML in lockstep. Independently
 *   verifies opts[new_ans] === original opts[old_ans] for every question
 *   (Nancy HIGH #4 semantic verification). Also mirrors the new answer indices
 *   into functions/quiz_keys.json so the QUIZ-008 validator clears.
 *
 * Scope:
 *   - HTML: 4 quiz files in _app/houses/matrix/adv-linux/quizzes/
 *   - JSON: functions/quiz_keys.json entries for matrix-ala-w{1,2,3,4}-quiz
 *
 * NOT in scope:
 *   - Firestore writes (separate step via push-quiz-keys.js; needs explicit auth)
 *   - Exam files (live-shuffle architecture; validator update path chosen)
 *
 * Usage:
 *   node _tools/quiz/ala-shuffle.js --dry-run   # preview without writing
 *   node _tools/quiz/ala-shuffle.js             # apply (writes HTML + JSON)
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const vm = require('vm');

const REPO_ROOT = path.resolve(__dirname, '../..');
const DRY_RUN = process.argv.includes('--dry-run');

const QUIZZES = [
    { quizId: 'matrix-ala-w1-quiz', html: '_app/houses/matrix/adv-linux/quizzes/ala-w1.quiz.html' },
    { quizId: 'matrix-ala-w2-quiz', html: '_app/houses/matrix/adv-linux/quizzes/ala-w2.quiz.html' },
    { quizId: 'matrix-ala-w3-quiz', html: '_app/houses/matrix/adv-linux/quizzes/ala-w3.quiz.html' },
    { quizId: 'matrix-ala-w4-quiz', html: '_app/houses/matrix/adv-linux/quizzes/ala-w4.quiz.html' },
];

/* ────────────────────────────────────────────────────────────────────────── */
/* Helpers                                                                    */
/* ────────────────────────────────────────────────────────────────────────── */

// Deterministic 4-permutation from seed string.
// Returns array of 4 indices that is a permutation of [0,1,2,3].
function seededPermutation(seedStr) {
    const hash = crypto.createHash('sha256').update(seedStr).digest();
    const a = [0, 1, 2, 3];
    // Fisher-Yates using hash bytes as randomness source
    for (let i = a.length - 1; i > 0; i--) {
        const j = hash[i] % (i + 1);
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

// Find the JS array literal that follows `var questions = ` and return its
// start/end character offsets, handling nested brackets and quoted strings.
function findQuestionsArrayLiteral(text) {
    const anchor = 'var questions = ';
    const startIdx = text.indexOf(anchor);
    if (startIdx === -1) throw new Error('no "var questions = " anchor in file');
    let i = startIdx + anchor.length;
    while (i < text.length && text[i] !== '[') i++;
    if (i >= text.length) throw new Error('no opening [ found');
    const arrStart = i;
    let depth = 0;
    let inString = false;
    let quote = null;
    while (i < text.length) {
        const c = text[i];
        if (inString) {
            if (c === '\\') { i += 2; continue; }
            if (c === quote) { inString = false; i++; continue; }
            i++; continue;
        }
        if (c === "'" || c === '"') { inString = true; quote = c; i++; continue; }
        if (c === '[') { depth++; i++; continue; }
        if (c === ']') { depth--; if (depth === 0) return { start: arrStart, end: i + 1 }; i++; continue; }
        i++;
    }
    throw new Error('unterminated array literal');
}

// Escape a string for JS single-quoted literal output.
// Order matters: backslash first, then quote and newline.
function jsQuote(str) {
    const esc = String(str)
        .replace(/\\/g, '\\\\')
        .replace(/'/g, "\\'")
        .replace(/\n/g, '\\n');
    return "'" + esc + "'";
}

// Serialize one question object to JS source, matching the file's indentation.
// indent = column of the `{`; fields go at indent+4, option strings at indent+8.
function serializeQuestion(q, indent) {
    const padBrace = ' '.repeat(indent);
    const padField = ' '.repeat(indent + 4);
    const padOpt = ' '.repeat(indent + 8);
    const optsStr = q.opts.map(o => padOpt + jsQuote(o)).join(',\n');
    return [
        padBrace + '{',
        padField + 'q: ' + jsQuote(q.q) + ',',
        padField + 'opts: [',
        optsStr,
        padField + '],',
        padField + 'ans: ' + q.ans + ',',
        padField + 'exp: ' + jsQuote(q.exp),
        padBrace + '}'
    ].join('\n');
}

// Apply permutation to a single question:
//   new opts = perm.map(i => old.opts[i])
//   new ans = perm.indexOf(old.ans)
function permuteQuestion(q, perm) {
    return {
        q: q.q,
        opts: perm.map(i => q.opts[i]),
        ans: perm.indexOf(q.ans),
        exp: q.exp,
    };
}

/* ────────────────────────────────────────────────────────────────────────── */
/* Per-file processing                                                        */
/* ────────────────────────────────────────────────────────────────────────── */

// Test whether a given set of permutations would satisfy the QUIZ-008 validator.
// Mirrors the validator logic exactly so a "pass" here means the validator clears.
//   _tools/eduscan/validators/syntax/heuristics.js line 1755-1763
function satisfiesValidator(original, perms) {
    const total = original.length;
    const dist = [0, 0, 0, 0];
    for (let i = 0; i < total; i++) {
        const newAns = perms[i].indexOf(original[i].ans);
        dist[newAns]++;
    }
    const maxCount = Math.max(...dist);
    if (total <= 7) return maxCount <= 2;
    const maxPct = Math.round((maxCount / total) * 100);
    return maxPct <= 35;
}

// Seed search: try variants `quizId:vN:idx` for N=1..maxAttempts and pick the
// FIRST variant whose resulting distribution satisfies the QUIZ-008 validator.
// If none satisfies, falls back to the variant with the lowest max-count.
// Deterministic given the algorithm — the chosen variant index is always
// reproducible from the same input.
function findOptimalShuffleSeed(quizId, original, maxAttempts = 200) {
    let best = null;
    for (let variant = 1; variant <= maxAttempts; variant++) {
        const perms = original.map((_, i) => seededPermutation(`${quizId}:v${variant}:${i}`));
        const dist = [0, 0, 0, 0];
        for (let i = 0; i < original.length; i++) {
            dist[perms[i].indexOf(original[i].ans)]++;
        }
        const maxCount = Math.max(...dist);
        if (best === null || maxCount < best.maxCount) {
            best = { variant, perms, dist, maxCount };
        }
        if (satisfiesValidator(original, perms)) {
            return { ...best, variant, perms, dist, maxCount, satisfied: true, attempts: variant };
        }
    }
    return { ...best, satisfied: false, attempts: maxAttempts };
}

function processFile(entry) {
    const filePath = path.join(REPO_ROOT, entry.html);
    const text = fs.readFileSync(filePath, 'utf8');

    // Locate and parse `var questions = [...]`
    const { start, end } = findQuestionsArrayLiteral(text);
    const arrLiteral = text.slice(start, end);
    const original = vm.runInNewContext('(' + arrLiteral + ')');

    // Validate parsed shape
    for (let i = 0; i < original.length; i++) {
        const q = original[i];
        if (!q.q || !Array.isArray(q.opts) || q.opts.length !== 4
            || typeof q.ans !== 'number' || !q.exp) {
            throw new Error(`question ${i} shape mismatch in ${entry.quizId}`);
        }
        if (q.ans < 0 || q.ans > 3) {
            throw new Error(`question ${i} ans out of range in ${entry.quizId}: ${q.ans}`);
        }
    }

    // Seed search: find the first deterministic seed variant whose resulting
    // distribution satisfies the QUIZ-008 validator (maxPct <= 35 for 10+ Q,
    // maxCount <= 2 for short quizzes). The chosen variant is recorded so the
    // shuffle is reproducible.
    const search = findOptimalShuffleSeed(entry.quizId, original);
    if (!search.satisfied) {
        throw new Error(`SEED SEARCH FAILED for ${entry.quizId}: best max-count=${search.maxCount} after ${search.attempts} attempts (target: validator threshold)`);
    }
    const shuffled = original.map((q, i) => permuteQuestion(q, search.perms[i]));

    // SEMANTIC VERIFICATION (Nancy HIGH #4):
    // opts[new_ans] must equal the original correct option text for every question.
    for (let i = 0; i < original.length; i++) {
        const newCorrect = shuffled[i].opts[shuffled[i].ans];
        const oldCorrect = original[i].opts[original[i].ans];
        if (newCorrect !== oldCorrect) {
            throw new Error(`SEMANTIC MISMATCH q${i} ${entry.quizId}: old="${oldCorrect}" vs new="${newCorrect}"`);
        }
    }

    // Detect indentation of the `{` from the source so output matches
    const sample = text.slice(start, start + 200);
    const indentMatch = sample.match(/\[\s*\n(\s*)\{/);
    const indent = indentMatch ? indentMatch[1].length : 12;

    // Rebuild the array literal
    const newArr = '[\n'
        + shuffled.map(q => serializeQuestion(q, indent)).join(',\n')
        + '\n' + ' '.repeat(indent - 4) + ']';
    const newText = text.slice(0, start) + newArr + text.slice(end);

    // Distribution check
    const oldDist = [0, 0, 0, 0];
    for (const q of original) oldDist[q.ans]++;
    const newDist = [0, 0, 0, 0];
    for (const q of shuffled) newDist[q.ans]++;

    return {
        entry, original, shuffled,
        oldDist, newDist,
        oldText: text, newText, filePath,
        seedVariant: search.variant, attempts: search.attempts,
    };
}

/* ────────────────────────────────────────────────────────────────────────── */
/* Main                                                                       */
/* ────────────────────────────────────────────────────────────────────────── */

console.log('ALA Quiz Shuffle Tool');
console.log('═════════════════════');
console.log('Mode:', DRY_RUN ? 'DRY RUN (no writes)' : 'LIVE (will overwrite files)');
console.log('');

const allResults = [];
for (const entry of QUIZZES) {
    console.log('Processing', entry.quizId);
    const result = processFile(entry);
    allResults.push(result);

    const total = result.original.length;
    const oldMax = Math.max(...result.oldDist);
    const newMax = Math.max(...result.newDist);
    const oldMaxPct = Math.round(100 * oldMax / total);
    const newMaxPct = Math.round(100 * newMax / total);

    console.log(`  old dist: [A=${result.oldDist[0]}, B=${result.oldDist[1]}, C=${result.oldDist[2]}, D=${result.oldDist[3]}] -- max ${oldMax}/${total} = ${oldMaxPct}%`);
    console.log(`  new dist: [A=${result.newDist[0]}, B=${result.newDist[1]}, C=${result.newDist[2]}, D=${result.newDist[3]}] -- max ${newMax}/${total} = ${newMaxPct}%`);
    console.log(`  new ans:  [${result.shuffled.map(q => q.ans).join(',')}]`);
    console.log(`  seed variant: v${result.seedVariant} (found in ${result.attempts} attempts)`);
    console.log(`  semantic verify: PASS (opts[new_ans] === opts[old_ans] for all ${total})`);
    console.log('');
}

if (DRY_RUN) {
    console.log('DRY RUN complete -- no files modified.');
    console.log('Re-run without --dry-run to apply.');
    process.exit(0);
}

// Idempotence warning (Nancy review a901b... required fix #2):
// Re-running on already-shuffled files produces a different third state
// because the same deterministic permutation applied twice is not identity.
console.log('NOTE: this script is NOT idempotent. Re-running on already-shuffled');
console.log('      files will produce a different distribution. If you need to');
console.log('      re-run, first `git checkout` the affected HTML + quiz_keys.json');
console.log('      to restore the pre-shuffle state, then run once.');
console.log('');

// Write HTML files
for (const result of allResults) {
    fs.writeFileSync(result.filePath, result.newText, 'utf8');
    console.log('WROTE', result.entry.html);
}

// Update functions/quiz_keys.json
const keysPath = path.join(REPO_ROOT, 'functions/quiz_keys.json');
const keys = JSON.parse(fs.readFileSync(keysPath, 'utf8'));
for (const result of allResults) {
    if (!keys[result.entry.quizId]) {
        throw new Error(`quiz_keys.json missing entry for ${result.entry.quizId}`);
    }
    keys[result.entry.quizId].answers = result.shuffled.map(q => q.ans);
    keys[result.entry.quizId].questionCount = result.shuffled.length;
}
fs.writeFileSync(keysPath, JSON.stringify(keys, null, 2) + '\n', 'utf8');
console.log('WROTE functions/quiz_keys.json');

console.log('');
console.log('Next steps:');
console.log('  1. git diff to inspect the changes');
console.log('  2. cd functions && node verify-quiz-keys.js --static-only        (format/consistency check of static registry)');
console.log('  3. node push-quiz-keys.js --filter matrix-ala-w --dry-run        (preview Firestore push)');
console.log('  4. node push-quiz-keys.js --filter matrix-ala-w                  (LIVE Firestore push -- needs auth)');
console.log('  5. cd functions && node verify-quiz-keys.js matrix-ala-w1-quiz   (post-push HTML <-> live Firestore parity)');
console.log('  6. ./deploy.sh                                                   (HTML deploy)');
