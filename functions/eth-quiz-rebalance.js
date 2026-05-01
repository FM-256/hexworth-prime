/**
 * Ethics Quiz Answer-Position Rebalance — Phase 1 (chapter quizzes)
 *
 * Problem: most eth-NN-quiz Firestore answer arrays are [1,1,1,1,1] —
 * 100% answer position B. Students can pass by always picking B.
 *
 * Fix: per-question Fisher-Yates shuffle of the 4 option labels in the
 * HTML form, then update Firestore answers[N] to the new index of the
 * correct option. The radio input value="N" stays as the index 0-3, so
 * gradeQuiz logic is unchanged — only the visible LABEL TEXT is reordered.
 *
 * Idempotency: each question gets an HTML comment marker after shuffle.
 * Re-runs detect the marker and skip.
 *
 * Snapshot: pre-state HTML + Firestore answers saved to
 *   /home/eq/hexworth-shared/eth-quiz-rebalance-2026-04-28/
 *
 * Usage:
 *   node eth-quiz-rebalance.js eth-01           # dry run, single quiz
 *   node eth-quiz-rebalance.js eth-01 --execute # apply
 *   node eth-quiz-rebalance.js --all            # dry run all 15
 *   node eth-quiz-rebalance.js --all --execute  # apply all 15
 */
const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

admin.initializeApp({ projectId: 'hexworth-prime' });
const db = admin.firestore();

const SNAP_DIR = '/home/eq/hexworth-shared/eth-quiz-rebalance-2026-04-28';
const ETH_DIR  = '/home/eq/ai-content/hexworth-prime/_app/houses/divergent/ethics-it';

// Seed the RNG so dry-run and execute produce the same shuffle.
// Different seeds per chapter so all 15 don't shuffle identically.
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

// Build a balanced target-position list for a quiz of `n` questions.
// Each letter (0..3) appears floor(n/4) or floor(n/4)+1 times, then the
// list is shuffled so each question gets a random target. Guarantees
// per-quiz uniform distribution within ±1 question.
function balancedTargets(n, rng) {
    const base = Math.floor(n / 4);
    const remainder = n % 4;
    const counts = [base, base, base, base];
    const extras = fisherYates([0, 1, 2, 3], rng).slice(0, remainder);
    for (const e of extras) counts[e]++;
    const targets = [];
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < counts[i]; j++) targets.push(i);
    }
    return fisherYates(targets, rng);
}

const SHUFFLE_MARKER = '<!-- shuffled-2026-04-28 -->';

// Parse a single ne-question block, extract label texts in order
// Returns { match, labels: [text0, text1, text2, text3] } or null if marker present
function extractQuestion(blockHtml) {
    if (blockHtml.includes(SHUFFLE_MARKER)) return { skipped: true };
    // Find <label for="qNaM">TEXT</label> entries in order
    const labelRe = /<label for="q(\d+)a(\d+)"[^>]*>([\s\S]*?)<\/label>/g;
    const labels = [null, null, null, null];
    let m;
    let qIdx = null;
    while ((m = labelRe.exec(blockHtml)) !== null) {
        if (qIdx === null) qIdx = parseInt(m[1], 10);
        const optIdx = parseInt(m[2], 10);
        if (optIdx >= 0 && optIdx < 4) labels[optIdx] = m[3];
    }
    if (labels.some(l => l === null)) return null;
    return { qIdx, labels };
}

// Apply a permutation [old0, old1, old2, old3] meaning "new pos i should have label from old pos perm[i]"
function applyPermutation(blockHtml, perm) {
    const ext = extractQuestion(blockHtml);
    if (!ext || ext.skipped) return { html: blockHtml, changed: false };
    const newLabels = perm.map(oldIdx => ext.labels[oldIdx]);
    let i = 0;
    const out = blockHtml.replace(/<label for="q\d+a(\d+)"[^>]*>[\s\S]*?<\/label>/g, (full, optIdx) => {
        const idx = parseInt(optIdx, 10);
        if (idx < 0 || idx > 3) return full;
        // Reconstruct label preserving the for= attribute, replacing only inner text
        const newText = newLabels[idx];
        return full.replace(/>[\s\S]*?<\/label>/, '>' + newText + '</label>');
    });
    // Add marker so re-runs skip this question
    return { html: out + '\n                ' + SHUFFLE_MARKER, changed: true };
}

async function processChapter(chapter, execute) {
    const htmlPath = path.join(ETH_DIR, chapter + '.html');
    const quizId = chapter + '-quiz';

    if (!fs.existsSync(htmlPath)) {
        console.log(`  [skip] ${chapter}: HTML not found`);
        return null;
    }

    const html = fs.readFileSync(htmlPath, 'utf8');
    const fsDoc = await db.collection('quiz_keys').doc(quizId).get();
    if (!fsDoc.exists) {
        console.log(`  [skip] ${chapter}: Firestore quiz_keys/${quizId} not found`);
        return null;
    }
    const fsData = fsDoc.data();
    const oldAnswers = (fsData.answers || []).slice();

    // Snapshot pre-state before any change
    if (execute) {
        fs.writeFileSync(path.join(SNAP_DIR, chapter + '.html.pre'), html);
        fs.writeFileSync(path.join(SNAP_DIR, chapter + '-firestore.pre.json'),
            JSON.stringify(fsData, null, 2));
    }

    // Split HTML into question blocks. Each question div has no nested divs
    // (just ul/li), so a non-greedy <div class="ne-question">...</div> match
    // closes at its own first </div>. The previous lookahead version broke on
    // chapters with HTML comments between questions (eth-08+).
    const blocks = [];
    const blockRe = /<div class="ne-question">[\s\S]*?<\/div>/g;
    let m;
    while ((m = blockRe.exec(html)) !== null) {
        blocks.push({ start: m.index, end: m.index + m[0].length, text: m[0] });
    }

    if (blocks.length === 0) {
        console.log(`  [warn] ${chapter}: no <div class="ne-question"> blocks matched`);
        return null;
    }
    if (blocks.length !== oldAnswers.length) {
        console.log(`  [warn] ${chapter}: HTML has ${blocks.length} questions but Firestore has ${oldAnswers.length} — skipping`);
        return null;
    }

    // Seed the RNG deterministically per chapter (so dry/execute match)
    const rng = seededRng(parseInt(chapter.replace('eth-', ''), 10) * 1009 + 31);

    // Build balanced target-position list for this quiz
    const targets = balancedTargets(blocks.length, rng);

    const newAnswers = [];
    let newHtml = html.slice(0, blocks[0].start);
    let blockIdx = 0;
    let alreadyShuffled = 0;

    for (const blk of blocks) {
        const oldCorrect = oldAnswers[blockIdx];
        const ext = extractQuestion(blk.text);
        if (ext && ext.skipped) {
            // Already shuffled — keep as is, preserve answer
            newHtml += blk.text;
            newAnswers.push(oldCorrect);
            alreadyShuffled++;
        } else if (ext === null) {
            console.log(`  [warn] ${chapter} q${blockIdx}: could not extract 4 labels, skipping`);
            newHtml += blk.text;
            newAnswers.push(oldCorrect);
        } else {
            // Move the correct option to the target position; place the other
            // 3 distractors (in random order) in the remaining slots.
            const target = targets[blockIdx];
            const distractors = fisherYates([0, 1, 2, 3].filter(i => i !== oldCorrect), rng);
            const perm = [null, null, null, null];
            perm[target] = oldCorrect;
            let di = 0;
            for (let i = 0; i < 4; i++) if (perm[i] === null) perm[i] = distractors[di++];
            const newCorrect = target;
            const result = applyPermutation(blk.text, perm);
            newHtml += result.html;
            newAnswers.push(newCorrect);
        }
        // Add inter-block content (whitespace between blocks)
        const nextStart = blocks[blockIdx + 1] ? blocks[blockIdx + 1].start : null;
        if (nextStart !== null) {
            newHtml += html.slice(blk.end, nextStart);
        }
        blockIdx++;
    }
    // Append the rest of the HTML after the last question block
    newHtml += html.slice(blocks[blocks.length - 1].end);

    // Distribution stats
    function distrib(arr) {
        const c = [0, 0, 0, 0];
        for (const x of arr) if (x >= 0 && x <= 3) c[x]++;
        return `A:${c[0]} B:${c[1]} C:${c[2]} D:${c[3]}`;
    }

    console.log(`  ${chapter}: ${oldAnswers.length} questions  | already-shuffled: ${alreadyShuffled}`);
    console.log(`    BEFORE [${distrib(oldAnswers)}]: ${oldAnswers.join(',')}`);
    console.log(`    AFTER  [${distrib(newAnswers)}]: ${newAnswers.join(',')}`);

    if (!execute) return { chapter, oldAnswers, newAnswers };

    // Write HTML
    fs.writeFileSync(htmlPath, newHtml);
    // Update Firestore
    await db.collection('quiz_keys').doc(quizId).update({
        answers: newAnswers,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        rebalancedAt: admin.firestore.FieldValue.serverTimestamp(),
        shuffled: true
    });
    console.log(`    ✓ HTML rewritten + Firestore updated`);
    return { chapter, oldAnswers, newAnswers };
}

(async () => {
    const args = process.argv.slice(2);
    const execute = args.includes('--execute');
    const allFlag = args.includes('--all');
    const filtered = args.filter(a => !a.startsWith('--'));

    let chapters;
    if (allFlag) {
        chapters = [];
        for (let i = 1; i <= 15; i++) chapters.push('eth-' + String(i).padStart(2, '0'));
    } else if (filtered.length > 0) {
        chapters = filtered;
    } else {
        console.error('Usage: node eth-quiz-rebalance.js <chapter> [--execute] | --all [--execute]');
        process.exit(1);
    }

    console.log('============================================================');
    console.log(`MODE: ${execute ? 'EXECUTE (writes HTML + Firestore)' : 'DRY RUN (no writes)'}`);
    console.log(`Chapters: ${chapters.join(', ')}`);
    console.log('============================================================\n');

    const results = [];
    for (const ch of chapters) {
        const res = await processChapter(ch, execute);
        if (res) results.push(res);
    }

    console.log('\n============================================================');
    console.log('AGGREGATE');
    console.log('============================================================');
    const totalBefore = [0, 0, 0, 0], totalAfter = [0, 0, 0, 0];
    for (const r of results) {
        for (const a of r.oldAnswers) if (a >= 0 && a <= 3) totalBefore[a]++;
        for (const a of r.newAnswers) if (a >= 0 && a <= 3) totalAfter[a]++;
    }
    const tot = totalBefore[0] + totalBefore[1] + totalBefore[2] + totalBefore[3];
    console.log(`Total questions: ${tot}`);
    console.log(`BEFORE: A:${totalBefore[0]} (${(100*totalBefore[0]/tot).toFixed(0)}%) ` +
                `B:${totalBefore[1]} (${(100*totalBefore[1]/tot).toFixed(0)}%) ` +
                `C:${totalBefore[2]} (${(100*totalBefore[2]/tot).toFixed(0)}%) ` +
                `D:${totalBefore[3]} (${(100*totalBefore[3]/tot).toFixed(0)}%)`);
    console.log(`AFTER:  A:${totalAfter[0]} (${(100*totalAfter[0]/tot).toFixed(0)}%) ` +
                `B:${totalAfter[1]} (${(100*totalAfter[1]/tot).toFixed(0)}%) ` +
                `C:${totalAfter[2]} (${(100*totalAfter[2]/tot).toFixed(0)}%) ` +
                `D:${totalAfter[3]} (${(100*totalAfter[3]/tot).toFixed(0)}%)`);
})();
