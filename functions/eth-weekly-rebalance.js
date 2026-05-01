/**
 * Phase 2: Rebalance ethics weekly aggregate quizzes (client-side JS).
 *
 * Files: _app/houses/divergent/ethics-it/quizzes/eth-w[1-3].quiz.html
 * Structure: var questions = [{ q, opts: [...4...], ans: idx, exp }, ...]
 *
 * Strategy: same as chapter rebalance — balanced target distribution
 * (each letter ~25% per quiz), shuffle opts and update ans per question.
 * No Firestore — these are graded client-side from the JS array.
 */
const fs = require('fs');
const path = require('path');

const SNAP_DIR = '/home/eq/hexworth-shared/eth-quiz-rebalance-2026-04-28';
const QUIZ_DIR = '/home/eq/ai-content/hexworth-prime/_app/houses/divergent/ethics-it/quizzes';
const FILES = ['eth-w1.quiz.html', 'eth-w2.quiz.html', 'eth-w3.quiz.html'];

function seededRng(seed) {
    return function () {
        seed = (seed * 9301 + 49297) % 233280;
        return seed / 233280;
    };
}
function fisherYates(arr, rng) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}
function balancedTargets(n, rng) {
    const base = Math.floor(n / 4);
    const remainder = n % 4;
    const counts = [base, base, base, base];
    const extras = fisherYates([0,1,2,3], rng).slice(0, remainder);
    for (const e of extras) counts[e]++;
    const targets = [];
    for (let i = 0; i < 4; i++) for (let j = 0; j < counts[i]; j++) targets.push(i);
    return fisherYates(targets, rng);
}

const MARKER = '/* shuffled-2026-04-28 */';

function processFile(filename, execute) {
    const filePath = path.join(QUIZ_DIR, filename);
    const html = fs.readFileSync(filePath, 'utf8');

    if (html.includes(MARKER)) {
        console.log(`  ${filename}: already shuffled (marker present), skipping`);
        return null;
    }

    // Find the questions array. Match `var questions = [` then walk to matching `]`
    const startMatch = html.match(/var\s+questions\s*=\s*\[/);
    if (!startMatch) {
        console.log(`  ${filename}: no 'var questions = [' found`);
        return null;
    }
    const arrayStart = startMatch.index + startMatch[0].length - 1; // position of '['

    // Walk forward tracking bracket depth to find the closing ']'
    let depth = 0, inString = null, escape = false, arrayEnd = -1;
    for (let i = arrayStart; i < html.length; i++) {
        const c = html[i];
        if (escape) { escape = false; continue; }
        if (inString) {
            if (c === '\\') { escape = true; continue; }
            if (c === inString) inString = null;
            continue;
        }
        if (c === '"' || c === "'") { inString = c; continue; }
        if (c === '[') depth++;
        else if (c === ']') {
            depth--;
            if (depth === 0) { arrayEnd = i; break; }
        }
    }
    if (arrayEnd === -1) {
        console.log(`  ${filename}: array close not found`);
        return null;
    }

    const arrayLiteral = html.substring(arrayStart, arrayEnd + 1);
    let questions;
    try {
        // Use eval-like parse via Function constructor (safe in this script context)
        questions = (new Function('return ' + arrayLiteral))();
    } catch (e) {
        console.log(`  ${filename}: parse failed:`, e.message);
        return null;
    }
    if (!Array.isArray(questions)) {
        console.log(`  ${filename}: parsed non-array`);
        return null;
    }

    // Snapshot pre-state
    if (execute) {
        fs.writeFileSync(path.join(SNAP_DIR, filename + '.pre'), html);
    }

    // Seed RNG deterministically per file
    const seed = parseInt(filename.match(/eth-w(\d+)/)[1], 10) * 7919 + 41;
    const rng = seededRng(seed);
    const targets = balancedTargets(questions.length, rng);

    const beforeCounts = [0,0,0,0], afterCounts = [0,0,0,0];
    questions.forEach((q, i) => {
        const oldAns = q.ans;
        if (oldAns >= 0 && oldAns <= 3) beforeCounts[oldAns]++;
        const target = targets[i];
        const distractors = fisherYates([0,1,2,3].filter(x => x !== oldAns), rng);
        const perm = [null, null, null, null];
        perm[target] = oldAns;
        let di = 0;
        for (let j = 0; j < 4; j++) if (perm[j] === null) perm[j] = distractors[di++];
        // Apply: new opts[j] = old opts[perm[j]]
        const oldOpts = q.opts.slice();
        q.opts = perm.map(idx => oldOpts[idx]);
        q.ans = target;
        afterCounts[target]++;
    });

    function distribLine(c) {
        return `A:${c[0]} B:${c[1]} C:${c[2]} D:${c[3]}`;
    }
    console.log(`  ${filename}: ${questions.length} questions`);
    console.log(`    BEFORE [${distribLine(beforeCounts)}]: ans=[${questions.map((_,i) => '?').join(',')}]`);
    console.log(`    AFTER  [${distribLine(afterCounts)}]: ans=[${questions.map(q => q.ans).join(',')}]`);

    if (!execute) return { filename, beforeCounts, afterCounts, count: questions.length };

    // Reconstruct the array literal. Use JSON.stringify with custom formatting
    // to preserve readability — match the original indent level.
    const newLiteral = JSON.stringify(questions, null, 12)
        .replace(/^\[/, '[')
        .replace(/\]$/, '\n        ]');

    let newHtml = html.substring(0, arrayStart) + newLiteral + html.substring(arrayEnd + 1);
    // Add marker at the top of the JS block
    newHtml = newHtml.replace(/var\s+questions\s*=/,
        MARKER + '\n        var questions =');

    fs.writeFileSync(filePath, newHtml);
    console.log(`    ✓ Written`);
    return { filename, beforeCounts, afterCounts, count: questions.length };
}

(async () => {
    const execute = process.argv.includes('--execute');
    console.log('============================================================');
    console.log(`MODE: ${execute ? 'EXECUTE' : 'DRY RUN'}`);
    console.log('============================================================\n');

    const totBefore = [0,0,0,0], totAfter = [0,0,0,0];
    let totQ = 0;
    for (const f of FILES) {
        const r = processFile(f, execute);
        if (r) {
            for (let i = 0; i < 4; i++) {
                totBefore[i] += r.beforeCounts[i];
                totAfter[i]  += r.afterCounts[i];
            }
            totQ += r.count;
        }
    }
    console.log('\n============================================================');
    console.log('AGGREGATE');
    console.log('============================================================');
    console.log(`Total questions: ${totQ}`);
    if (totQ > 0) {
        console.log(`BEFORE: A:${totBefore[0]} (${(100*totBefore[0]/totQ).toFixed(0)}%) B:${totBefore[1]} (${(100*totBefore[1]/totQ).toFixed(0)}%) C:${totBefore[2]} (${(100*totBefore[2]/totQ).toFixed(0)}%) D:${totBefore[3]} (${(100*totBefore[3]/totQ).toFixed(0)}%)`);
        console.log(`AFTER:  A:${totAfter[0]} (${(100*totAfter[0]/totQ).toFixed(0)}%) B:${totAfter[1]} (${(100*totAfter[1]/totQ).toFixed(0)}%) C:${totAfter[2]} (${(100*totAfter[2]/totQ).toFixed(0)}%) D:${totAfter[3]} (${(100*totAfter[3]/totQ).toFixed(0)}%)`);
    }
})();
