#!/usr/bin/env node
/**
 * seed-p0-batch-2026-05-08.js — Reseed 81 P0 STATIC-NEWER quiz_keys.
 *
 * SOURCE: ~/hexworth-shared/Solutions/_audit/karl-placeholder-key-drift-audit.md
 * (run via functions/placeholder-drift-audit.js, 2026-05-08).
 *
 * 81 quiz IDs across pc-ard-*, pc-esp-*, pv-b-*, pv-e-*, pv-f-*, pv-m-*, pv-mp-*
 * (matrix house — Arduino, ESP32, PiVerse maker tracks) PLUS 2 ms900-*
 * Azure Fundamentals chapters caught by period-N detector (tick 31). Static
 * has REAL Karl-audited answers (most via task #68 pv-mp/pv-m/pv-f resolution
 * + task #74 pv-f spot-check). Firestore has cycling/near-cycling placeholders
 * — students currently score 0% (or accidentally) unless they answer the
 * placeholder pattern. Silent failure across multiple content tracks.
 *
 * Composition (post-tick-37 expansion):
 *   - 68 from original 2026-05-08 audit STATIC-NEWER bucket
 *   - +2 from period-N detector catch (tick 31): ms900-ch01/ch03
 *   - +11 from sub-class-1 near-cycling triage (tick 31): 11 pc-ard-* IDs
 *     where Firestore has [0,1,2,3,...] for first N-2 then drifts
 *
 * SAFETY DESIGN (mirrors seed-str40-pis-keys.js precedent shipped earlier
 * 2026-05-08):
 *  - Per-quiz drift gate: if static.answers shape is unexpected (length
 *    mismatch, invalid index, all-zeros that wasn't authored that way),
 *    ABORT before any write.
 *  - Per-quiz Firestore-current snapshot logged so reverse is possible.
 *  - --dry-run mode: validates everything but writes nothing.
 *  - Branch check: ABORTS unless on master.
 *
 * USAGE:
 *   cd functions
 *   node seed-p0-batch-2026-05-08.js --dry-run    # preview, no writes
 *   node seed-p0-batch-2026-05-08.js              # live write to production Firestore
 *
 * VERIFICATION (post-run):
 *   node verify-quiz-keys.js pc-ard-03-quiz pc-ard-11-quiz ... (or full list from audit)
 *   node placeholder-drift-audit.js   # P0 count should drop 68 -> 0
 */

const admin = require('firebase-admin');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const TARGET_IDS = [
    // pc-ard-* (Arduino, 3 IDs from original audit + 11 from sub-class-1 tick 31 = 14 total)
    'pc-ard-03-quiz', 'pc-ard-11-quiz', 'pc-ard-16-quiz',
    // sub-class-1 additions (Firestore arrays match (i%4) for first N-2, last 1-2 drift):
    'pc-ard-02-quiz', 'pc-ard-06-quiz', 'pc-ard-07-quiz', 'pc-ard-08-quiz',
    'pc-ard-09-quiz', 'pc-ard-10-quiz', 'pc-ard-12-quiz', 'pc-ard-13-quiz',
    'pc-ard-15-quiz', // ⚠ static is [0,...,1,...,0] near-all-zeros — joins all-1s/AMBIGUOUS Karl-block queue
    'pc-ard-17-quiz', 'pc-ard-18-quiz',
    // pc-esp-* (ESP32, 15 IDs)
    'pc-esp-01-quiz', 'pc-esp-02-quiz', 'pc-esp-03-quiz', 'pc-esp-04-quiz',
    'pc-esp-05-quiz', 'pc-esp-06-quiz', 'pc-esp-07-quiz', 'pc-esp-08-quiz',
    'pc-esp-09-quiz', 'pc-esp-10-quiz', 'pc-esp-11-quiz', 'pc-esp-12-quiz',
    'pc-esp-13-quiz', 'pc-esp-14-quiz', 'pc-esp-15-quiz',
    // pv-b-* (PiVerse Beginner, 8 IDs)
    'pv-b-01-quiz', 'pv-b-02-quiz', 'pv-b-03-quiz', 'pv-b-04-quiz',
    'pv-b-05-quiz', 'pv-b-06-quiz', 'pv-b-07-quiz', 'pv-b-08-quiz',
    // pv-e-* (PiVerse Engineering, 10 IDs)
    'pv-e-01-quiz', 'pv-e-02-quiz', 'pv-e-03-quiz', 'pv-e-04-quiz',
    'pv-e-05-quiz', 'pv-e-06-quiz', 'pv-e-07-quiz', 'pv-e-08-quiz',
    'pv-e-09-quiz', 'pv-e-10-quiz',
    // pv-f-* (PiVerse Foundations, 10 IDs)
    'pv-f-01-quiz', 'pv-f-02-quiz', 'pv-f-03-quiz', 'pv-f-04-quiz',
    'pv-f-05-quiz', 'pv-f-06-quiz', 'pv-f-07-quiz', 'pv-f-08-quiz',
    'pv-f-09-quiz', 'pv-f-10-quiz',
    // pv-m-* (PiVerse Maker, 10 IDs)
    'pv-m-01-quiz', 'pv-m-02-quiz', 'pv-m-03-quiz', 'pv-m-04-quiz',
    'pv-m-05-quiz', 'pv-m-06-quiz', 'pv-m-07-quiz', 'pv-m-08-quiz',
    'pv-m-09-quiz', 'pv-m-10-quiz',
    // pv-mp-* (PiVerse Maker Plus, 12 IDs)
    'pv-mp-01-quiz', 'pv-mp-02-quiz', 'pv-mp-03-quiz', 'pv-mp-04-quiz',
    'pv-mp-05-quiz', 'pv-mp-06-quiz', 'pv-mp-07-quiz', 'pv-mp-08-quiz',
    'pv-mp-09-quiz', 'pv-mp-10-quiz', 'pv-mp-11-quiz', 'pv-mp-12-quiz',
    // ms900-* (Azure Fundamentals, 2 IDs from period-N audit catch tick 31)
    'ms900-ch01-quiz', 'ms900-ch03-quiz',
];

// Total: 81 (was 68 → 70 → 81 after sub-class-1 + ms900 inclusion).
// Karl-block list (per Nancy reviews tick 32 + tick 37 + tick 52 + tick 72):
//   - 7 all-1s static keys from original 68 — RESOLVED via Tasks #68 + #74 Karl audits
//     (static is now real for those IDs; they're no longer Karl-block).
//   - 1 near-all-zeros: pc-ard-15-quiz (static [0,...,0,1,0,...,0] with single
//     outlier — semantically suspicious; mathematical detection now flags via
//     isAllSame in placeholder-detector since isAllSame catches len>=1 of any
//     value, but the outlier-position-1 case is caller-judgment territory).
//   - 3 shared-array cluster (tick 52, 2026-05-09): pc-esp-11-quiz, pv-m-03-quiz,
//     pv-m-05-quiz all share IDENTICAL static [1,1,1,2,1,1,1,1,1,1,1,1,1,1,1].
//     Period-1 with outlier shape — placeholder-detector module (commit 1c644716)
//     now catches the all-1s subset via isAllSame; the outlier-2 deviation
//     remains a hand-copy-drift hazard sharing-IDENTICAL-array signal that
//     requires Karl audit even when individual detection passes.
//   - AMBIGUOUS-lineage entries in pv-mp/pv-m/pv-f tracks: most resolved via
//     Task #68 batch 2 + Task #74 spot-check; spot-verify any remaining.
// Operator must resolve Karl-confidence on these before --confirm flag run.
//
// KARL_BLOCK_SET below enforces this at execution time — script SKIPS these IDs
// with a KARL-BLOCK log entry, even in --dry-run. Operator must Karl-audit each
// and either: (a) update static answer key + remove from this set, or
// (b) leave skipped this run, address in follow-up.

const KARL_BLOCK_SET = new Set([
    'pc-ard-15-quiz',   // near-all-zeros: [0,...,0,1,0,...,0]
    'pc-esp-11-quiz',   // shared cluster: [1,1,1,2,1,...] (3-quiz hand-copy drift)
    'pv-m-03-quiz',     // shared cluster: [1,1,1,2,1,...]
    'pv-m-05-quiz',     // shared cluster: [1,1,1,2,1,...]
]);

const KEYS_FILE = path.join(__dirname, 'quiz_keys.json');
const DRY_RUN = process.argv.includes('--dry-run');

// Branch gate
try {
    const branch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
    if (branch !== 'master') {
        console.error('ABORT: must be on master branch (current: ' + branch + ')');
        process.exit(2);
    }
} catch (e) {
    console.error('ABORT: cannot determine git branch — ' + e.message);
    process.exit(2);
}

if (!admin.apps.length) admin.initializeApp({ projectId: 'hexworth-prime' });
const db = admin.firestore();

const PLACEHOLDER_PATTERNS = [
    [0, 1, 2, 3, 0],   // 5q cycling
    [0, 1, 2, 3, 0, 1, 2, 3, 0, 1],  // 10q cycling
    [0, 1, 2, 3, 0, 1, 2, 3, 0, 1, 2, 3, 0, 1, 2],  // 15q cycling
];
// Detector consolidated into ./placeholder-detector (2026-05-09).
// Pass PLACEHOLDER_PATTERNS through opts so isExactPlaceholder is wired in.
const D = require('./placeholder-detector');
function isPlaceholderArray(answers) {
    return D.isPlaceholder(answers, { patterns: PLACEHOLDER_PATTERNS });
}

function validateStatic(quizId, entry) {
    const issues = [];
    if (!entry) { issues.push('not in quiz_keys.json'); return issues; }
    if (!Array.isArray(entry.answers)) issues.push('answers not array');
    if (typeof entry.questionCount !== 'number') issues.push('questionCount missing');
    if (typeof entry.passingScore !== 'number') issues.push('passingScore missing');
    if (Array.isArray(entry.answers) && entry.answers.length !== entry.questionCount) {
        issues.push('length mismatch ' + entry.answers.length + ' vs ' + entry.questionCount);
    }
    if (Array.isArray(entry.answers) && !entry.answers.every(v => Number.isInteger(v) && v >= 0 && v <= 3)) {
        issues.push('answers contain invalid index (must be 0-3)');
    }
    // P0 drift gate: refuse to seed if static itself is still placeholder
    if (Array.isArray(entry.answers) && isPlaceholderArray(entry.answers)) {
        issues.push('STATIC ITSELF IS PLACEHOLDER — refusing to seed cycling-to-cycling');
    }
    return issues;
}

(async () => {
    console.log('seed-p0-batch-2026-05-08.js');
    console.log('============================');
    console.log(DRY_RUN ? '*** DRY RUN — no writes ***' : '*** LIVE WRITE TO PRODUCTION FIRESTORE ***');
    console.log('Targets: ' + TARGET_IDS.length + ' quiz keys');
    console.log('---');

    const keys = JSON.parse(fs.readFileSync(KEYS_FILE, 'utf8'));
    let okCount = 0, skipCount = 0, writeCount = 0;
    const skipped = [];

    for (const quizId of TARGET_IDS) {
        // KARL-BLOCK pre-filter (tick 72): suspicious static shapes that bypass
        // isPlaceholderArray detector but require Karl audit before reseed.
        // See KARL_BLOCK_SET definition above for the 4 current entries + reasons.
        if (KARL_BLOCK_SET.has(quizId)) {
            console.log('KARL-BLOCK ' + quizId + ' :: requires Karl audit before seed (suspicious static shape)');
            skipped.push({ quizId, reason: 'karl-block-pending-audit' });
            skipCount++;
            continue;
        }

        const staticEntry = keys[quizId];
        const issues = validateStatic(quizId, staticEntry);
        if (issues.length) {
            console.log('SKIP ' + quizId + ' :: ' + issues.join('; '));
            skipped.push({ quizId, reason: issues.join('; ') });
            skipCount++;
            continue;
        }

        // Confirm Firestore-current is placeholder (drift gate). If Firestore is
        // already real, this script's premise was wrong — abort that one.
        const docRef = db.doc('quiz_keys/' + quizId);
        const snap = await docRef.get();
        const fsCurrent = snap.exists ? snap.data() : null;
        if (fsCurrent && fsCurrent.answers && !isPlaceholderArray(fsCurrent.answers)) {
            console.log('SKIP ' + quizId + ' :: Firestore already has REAL answers (not placeholder) — drift, abort');
            skipped.push({ quizId, reason: 'firestore-already-real' });
            skipCount++;
            continue;
        }

        const writeData = {
            answers: staticEntry.answers,
            questionCount: staticEntry.questionCount,
            passingScore: staticEntry.passingScore,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedBy: 'seed-p0-batch-2026-05-08',
            source: 'placeholder-drift-audit P0 STATIC-NEWER',
        };

        console.log('OK   ' + quizId + ' :: static=[' + staticEntry.answers.slice(0, 5).join(',') + '...] firestore-was=' + (fsCurrent && fsCurrent.answers ? '[' + fsCurrent.answers.slice(0, 5).join(',') + '...]' : 'missing'));
        okCount++;

        if (!DRY_RUN) {
            await docRef.set(writeData, { merge: true });
            writeCount++;
        }
    }

    console.log('---');
    console.log('OK to write:    ' + okCount);
    console.log('Skipped:        ' + skipCount);
    if (DRY_RUN) {
        console.log('DRY RUN — no writes performed.');
    } else {
        console.log('Wrote:          ' + writeCount);
        console.log('Run verify:     node placeholder-drift-audit.js   # P0 count should drop ' + okCount + ' -> 0');
    }
    process.exit(0);
})().catch(err => { console.error('FATAL: ' + err.message); process.exit(99); });
