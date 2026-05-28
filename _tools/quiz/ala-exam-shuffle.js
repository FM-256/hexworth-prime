#!/usr/bin/env node
/**
 * ala-exam-shuffle.js — Deterministic per-question option shuffle for the 2 ALA
 *                      server-graded exams (matrix-ala-midterm, matrix-ala-final).
 *
 * Background:
 *   Phase 1 (commit 69659e8bb) rebalanced the 4 browser-graded ALA quizzes.
 *   The 2 exams are server-graded via gradeQuiz + use a live Math.random
 *   shuffle of options at render time. The static skew (68% and 70% peak at
 *   index 1) is invisible to a student in the moment they take the exam
 *   (every page load shows a fresh shuffle), but ES-1115 / quiz-authoring-rules.md
 *   Rule 6 require we STILL balance the static keys (authorial discipline +
 *   robustness if a future renderer skips the shuffle).
 *
 * Approach (sibling to ala-shuffle.js, separate to handle the exam shape):
 *   - Parse `const examData = [{q, a:[...]}, ...]` from HTML
 *   - Read current answers from functions/quiz_keys.json (source of truth;
 *     mirrors live Firestore)
 *   - Apply seed-search deterministic permutation per question, target the
 *     QUIZ-008 validator threshold (max <=35% for 10+Q)
 *   - In-place rewrite ONLY each question's `a: [...]` substring (preserves
 *     the objective comments and blank lines that separate question groups)
 *   - Update functions/quiz_keys.json so push-quiz-keys.js can sync Firestore
 *
 * NOT in scope:
 *   - Firestore writes (separate step: node push-quiz-keys.js --filter matrix-ala-)
 *   - HTML deploy (separate step: ./deploy.sh)
 *   - ANY non-ALA file. Quizzes (browser-graded) handled by ala-shuffle.js.
 *
 * Usage:
 *   node _tools/quiz/ala-exam-shuffle.js --dry-run
 *   node _tools/quiz/ala-exam-shuffle.js
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const vm = require('vm');

const REPO_ROOT = path.resolve(__dirname, '../..');
const DRY_RUN = process.argv.includes('--dry-run');

const EXAMS = [
    { quizId: 'matrix-ala-midterm', html: '_app/houses/matrix/adv-linux/exams/ala-midterm.exam.html' },
    { quizId: 'matrix-ala-final',   html: '_app/houses/matrix/adv-linux/exams/ala-final.exam.html' },
];

/* ────────────────────────────────────────────────────────────────────────── */
/* Helpers                                                                    */
/* ────────────────────────────────────────────────────────────────────────── */

// Deterministic 4-permutation from seed string (Fisher-Yates over hash bytes).
function seededPermutation(seedStr) {
    const hash = crypto.createHash('sha256').update(seedStr).digest();
    const a = [0, 1, 2, 3];
    for (let i = a.length - 1; i > 0; i--) {
        const j = hash[i] % (i + 1);
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

// Locate the JS array literal that follows an anchor, return start/end offsets.
// Handles nested brackets and both quote styles + escaped quotes.
function findArrayLiteral(text, anchor) {
    const startIdx = text.indexOf(anchor);
    if (startIdx === -1) throw new Error(`anchor not found: ${anchor}`);
    let i = startIdx + anchor.length;
    while (i < text.length && text[i] !== '[') i++;
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

// Find the span of each question's `{q: "...", a: [...]}` object literal.
// Returns array of {start, end, qText, aLiteral, aStart, aEnd}.
function findQuestionSpans(text, arrLitStart, arrLitEnd) {
    const spans = [];
    let i = arrLitStart + 1; // skip the opening [
    while (i < arrLitEnd - 1) {
        // Skip whitespace and comments
        while (i < arrLitEnd) {
            const c = text[i];
            if (c === ' ' || c === '\t' || c === '\n' || c === '\r' || c === ',') { i++; continue; }
            // Line comment
            if (c === '/' && text[i + 1] === '/') {
                while (i < arrLitEnd && text[i] !== '\n') i++;
                continue;
            }
            break;
        }
        if (i >= arrLitEnd - 1) break;
        if (text[i] !== '{') {
            // Unexpected char; stop to avoid infinite loop
            throw new Error(`unexpected char "${text[i]}" at offset ${i} while scanning examData entries`);
        }
        // Find matching closing }
        const objStart = i;
        let depth = 0;
        let inString = false;
        let qc = null;
        let aStart = -1, aEnd = -1;
        let aFieldDetected = false;
        while (i < arrLitEnd) {
            const c = text[i];
            if (inString) {
                if (c === '\\') { i += 2; continue; }
                if (c === qc) { inString = false; i++; continue; }
                i++; continue;
            }
            if (c === "'" || c === '"') { inString = true; qc = c; i++; continue; }
            if (c === '{') { depth++; i++; continue; }
            if (c === '}') {
                depth--;
                if (depth === 0) { i++; break; }
                i++; continue;
            }
            // Detect ` a: [` (inside the object, top-level depth)
            if (!aFieldDetected && depth === 1 && (c === 'a' || c === '"' || c === "'")) {
                // crude detection: look ahead for `a:` after whitespace
                if (c === 'a' && text[i + 1] === ':' && (text[i - 1] === ' ' || text[i - 1] === ',')) {
                    // find the next `[`
                    let j = i + 2;
                    while (j < arrLitEnd && text[j] !== '[') j++;
                    if (j < arrLitEnd) {
                        aFieldDetected = true;
                        aStart = j;
                        // find matching ]
                        let d = 0, inS = false, q2 = null, k = j;
                        while (k < arrLitEnd) {
                            const cc = text[k];
                            if (inS) {
                                if (cc === '\\') { k += 2; continue; }
                                if (cc === q2) { inS = false; k++; continue; }
                                k++; continue;
                            }
                            if (cc === "'" || cc === '"') { inS = true; q2 = cc; k++; continue; }
                            if (cc === '[') { d++; k++; continue; }
                            if (cc === ']') { d--; if (d === 0) { aEnd = k + 1; break; } k++; continue; }
                            k++;
                        }
                    }
                }
            }
            i++;
        }
        const objEnd = i;
        spans.push({ start: objStart, end: objEnd, aStart, aEnd, aLiteral: text.slice(aStart, aEnd) });
    }
    return spans;
}

// Serialize a string array as a JS literal matching the exam file's exact
// style: `["s1", "s2", "s3", "s4"]` — double quotes, ", " separator.
function serializeOptions(opts) {
    function quoteDQ(s) {
        // Escape backslash and double quote; preserve newlines as \n escape;
        // single quotes pass through unchanged inside double-quoted strings.
        return '"' + String(s)
            .replace(/\\/g, '\\\\')
            .replace(/"/g, '\\"')
            .replace(/\n/g, '\\n') + '"';
    }
    return '[' + opts.map(quoteDQ).join(', ') + ']';
}

// Apply permutation: new_a = perm.map(j => old_a[j]); new_ans = perm.indexOf(old_ans)
function permuteQuestion(oldA, oldAns, perm) {
    return {
        a: perm.map(j => oldA[j]),
        ans: perm.indexOf(oldAns),
    };
}

// Mirror the QUIZ-008 validator threshold logic exactly.
function satisfiesValidator(answers) {
    const total = answers.length;
    const dist = [0, 0, 0, 0];
    for (const a of answers) dist[a]++;
    const maxCount = Math.max(...dist);
    if (total <= 7) return maxCount <= 2;
    const maxPct = Math.round((maxCount / total) * 100);
    return maxPct <= 35;
}

// Seed search: try variants vN until one satisfies the validator.
// Returns { variant, perms, newAnswers, dist, maxCount, attempts }.
function findOptimalShuffleSeed(quizId, examData, oldAnswers, maxAttempts = 200) {
    let best = null;
    for (let variant = 1; variant <= maxAttempts; variant++) {
        const perms = examData.map((_, i) => seededPermutation(`${quizId}:v${variant}:${i}`));
        const newAnswers = examData.map((_, i) => perms[i].indexOf(oldAnswers[i]));
        const dist = [0, 0, 0, 0];
        for (const a of newAnswers) dist[a]++;
        const maxCount = Math.max(...dist);
        if (best === null || maxCount < best.maxCount) {
            best = { variant, perms, newAnswers, dist, maxCount };
        }
        if (satisfiesValidator(newAnswers)) {
            return { ...best, variant, perms, newAnswers, dist, maxCount, satisfied: true, attempts: variant };
        }
    }
    return { ...best, satisfied: false, attempts: maxAttempts };
}

/* ────────────────────────────────────────────────────────────────────────── */
/* Per-file processing                                                        */
/* ────────────────────────────────────────────────────────────────────────── */

function processExam(entry, keysJson) {
    const filePath = path.join(REPO_ROOT, entry.html);
    const text = fs.readFileSync(filePath, 'utf8');

    // Parse examData
    const arrLit = findArrayLiteral(text, 'const examData = ');
    const examLitText = text.slice(arrLit.start, arrLit.end);
    const examData = vm.runInNewContext('(' + examLitText + ')');

    // Get current answers from quiz_keys.json (canonical mirror of live Firestore)
    if (!keysJson[entry.quizId]) {
        throw new Error(`quiz_keys.json missing entry for ${entry.quizId}`);
    }
    const oldAnswers = keysJson[entry.quizId].answers;
    if (oldAnswers.length !== examData.length) {
        throw new Error(`answer count mismatch for ${entry.quizId}: HTML examData has ${examData.length} questions, quiz_keys.json has ${oldAnswers.length} answers`);
    }

    // Shape validation
    for (let i = 0; i < examData.length; i++) {
        const q = examData[i];
        if (!q.q || !Array.isArray(q.a) || q.a.length !== 4) {
            throw new Error(`question ${i} shape mismatch in ${entry.quizId}`);
        }
        if (typeof oldAnswers[i] !== 'number' || oldAnswers[i] < 0 || oldAnswers[i] > 3) {
            throw new Error(`answer ${i} out of range in ${entry.quizId}: ${oldAnswers[i]}`);
        }
    }

    // Seed search for a permutation that clears QUIZ-008 threshold
    const search = findOptimalShuffleSeed(entry.quizId, examData, oldAnswers);
    if (!search.satisfied) {
        throw new Error(`SEED SEARCH FAILED for ${entry.quizId}: best max-count=${search.maxCount} after ${search.attempts} attempts`);
    }

    // Build shuffled data
    const shuffled = examData.map((q, i) => {
        const r = permuteQuestion(q.a, oldAnswers[i], search.perms[i]);
        return { q: q.q, a: r.a, ans: r.ans };
    });

    // Semantic verification
    for (let i = 0; i < examData.length; i++) {
        if (shuffled[i].a[shuffled[i].ans] !== examData[i].a[oldAnswers[i]]) {
            throw new Error(`SEMANTIC MISMATCH q${i} ${entry.quizId}: old="${examData[i].a[oldAnswers[i]]}" vs new="${shuffled[i].a[shuffled[i].ans]}"`);
        }
    }

    // Locate each question's `a:[...]` span and prepare in-place replacement
    const spans = findQuestionSpans(text, arrLit.start, arrLit.end);
    if (spans.length !== examData.length) {
        throw new Error(`span count mismatch for ${entry.quizId}: parsed ${examData.length} but found ${spans.length} object spans`);
    }
    for (let i = 0; i < spans.length; i++) {
        if (spans[i].aStart < 0 || spans[i].aEnd < 0) {
            throw new Error(`question ${i} in ${entry.quizId}: a: [...] field not located in source`);
        }
    }

    // Apply in-place replacement of each `a: [...]` literal (right-to-left to
    // keep earlier offsets valid). Replace only the option array — preserve
    // every byte of surrounding comments, whitespace, and `q:` text.
    let newText = text;
    for (let i = spans.length - 1; i >= 0; i--) {
        const span = spans[i];
        const newA = serializeOptions(shuffled[i].a);
        newText = newText.slice(0, span.aStart) + newA + newText.slice(span.aEnd);
    }

    // Distribution stats
    const oldDist = [0, 0, 0, 0];
    for (const a of oldAnswers) oldDist[a]++;
    const newDist = [0, 0, 0, 0];
    for (const q of shuffled) newDist[q.ans]++;

    return {
        entry, examData, shuffled,
        oldAnswers, newAnswers: shuffled.map(q => q.ans),
        oldDist, newDist,
        oldText: text, newText, filePath,
        seedVariant: search.variant, attempts: search.attempts,
    };
}

/* ────────────────────────────────────────────────────────────────────────── */
/* Main                                                                       */
/* ────────────────────────────────────────────────────────────────────────── */

console.log('ALA Exam Shuffle Tool (Phase 2A)');
console.log('═════════════════════════════════');
console.log('Mode:', DRY_RUN ? 'DRY RUN (no writes)' : 'LIVE (will overwrite files)');
console.log('');

const keysPath = path.join(REPO_ROOT, 'functions/quiz_keys.json');
const keysJson = JSON.parse(fs.readFileSync(keysPath, 'utf8'));

const allResults = [];
for (const entry of EXAMS) {
    console.log('Processing', entry.quizId);
    const result = processExam(entry, keysJson);
    allResults.push(result);

    const total = result.shuffled.length;
    const oldMax = Math.max(...result.oldDist);
    const newMax = Math.max(...result.newDist);
    const oldMaxPct = Math.round(100 * oldMax / total);
    const newMaxPct = Math.round(100 * newMax / total);

    console.log(`  old dist: [A=${result.oldDist[0]}, B=${result.oldDist[1]}, C=${result.oldDist[2]}, D=${result.oldDist[3]}] -- max ${oldMax}/${total} = ${oldMaxPct}%`);
    console.log(`  new dist: [A=${result.newDist[0]}, B=${result.newDist[1]}, C=${result.newDist[2]}, D=${result.newDist[3]}] -- max ${newMax}/${total} = ${newMaxPct}%`);
    console.log(`  new ans:  [${result.newAnswers.join(',')}]`);
    console.log(`  seed variant: v${result.seedVariant} (found in ${result.attempts} attempts)`);
    console.log(`  semantic verify: PASS (a[new_ans] === a[old_ans] for all ${total})`);
    console.log('');
}

// Idempotence note (shown in BOTH dry-run and live, per Nancy review a89039b...
// fix #3 -- a developer who runs --dry-run and then live without reading the
// code would never see the warning if it printed only in live mode):
console.log('NOTE: this script is NOT idempotent. Re-running on already-shuffled');
console.log('      files produces a different distribution. If you need to re-run,');
console.log('      first `git checkout` the affected HTML + quiz_keys.json to');
console.log('      restore the pre-shuffle state, then run once.');
console.log('');

if (DRY_RUN) {
    console.log('DRY RUN complete -- no files modified.');
    console.log('Re-run without --dry-run to apply.');
    process.exit(0);
}

// Write HTML files
for (const result of allResults) {
    fs.writeFileSync(result.filePath, result.newText, 'utf8');
    console.log('WROTE', result.entry.html);
}

// Update quiz_keys.json
for (const result of allResults) {
    keysJson[result.entry.quizId].answers = result.newAnswers;
}
fs.writeFileSync(keysPath, JSON.stringify(keysJson, null, 2) + '\n', 'utf8');
console.log('WROTE functions/quiz_keys.json');

console.log('');
console.log('Next steps (in this exact order to minimize the swap race window):');
console.log('  1. git diff to inspect changes');
console.log('  2. cd functions && node verify-quiz-keys.js --static-only           (registry format check)');
console.log('  3. git commit -m "fix(matrix-ala): rebalance exam answer keys..."');
console.log('  4. ./deploy.sh                                                       (HTML to prod)');
console.log('  5. cd functions && node push-quiz-keys.js --filter matrix-ala- --dry-run  (preview push)');
console.log('  6. cd functions && node push-quiz-keys.js --filter matrix-ala- -- run IMMEDIATELY after deploy completes');
console.log('  7. cd functions && node verify-quiz-keys.js matrix-ala-midterm matrix-ala-final  (live parity check)');
console.log('');
console.log('CRITICAL TIMING (Nancy review a89039b...): firebase.json sets no-store on .html,');
console.log('  so the deploy is visible to new page loads the moment step 4 returns. Run');
console.log('  push-quiz-keys.js (step 6) ONLY during a window with no active exam sessions.');
console.log('  A student who loaded the exam before step 4 and submits after step 6 will be');
console.log('  graded with their OLD HTML option indices against the NEW Firestore key,');
console.log('  silently mis-scoring. Check live exam attempts before pushing keys.');
