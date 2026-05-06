#!/usr/bin/env node
/**
 * seed-str40-pis-keys.js — Seed quiz_keys/{quizId} for STR-40 batch + PIS-W1-W4.
 *
 * Closes the bridge gap identified by CLAUDE.md rule 9: 14 STR-40 quizzes
 * (10 FW weeklies + 4 exams) + 4 PIS quizzes had no Firestore answer keys,
 * causing server-graded students to score 0/N.
 *
 * Source of truth: functions/quiz_keys.json (verified arrays come from
 * Karl-PASSed Confluence solution pages; cross-verified that
 * HTML[options][answer[i]] matches Confluence-stated correct text for all
 * 290 STR-40 questions).
 *
 * Pushes 18 IDs by EXPLICIT NAME LIST. Does not use --filter prefix because
 * 'shield-pis-' would also match shield-pis-midterm/final, which are NOT in
 * scope for this seed.
 *
 * Pre-seed backup: run `node backup-quiz-keys-pre-seed.js` first to capture
 * current Firestore state to functions/_backups/quiz-keys-pre-seed-*.json.
 *
 * USAGE:
 *   cd functions
 *   node seed-str40-pis-keys.js --dry-run    # preview, no writes
 *   node seed-str40-pis-keys.js              # live write to production Firestore
 */

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

const TARGET_IDS = [
    'fw-w1-logical', 'fw-w1-physical', 'fw-w2-malware', 'fw-w2-wireless',
    'fw-w3-os-security', 'fw-w3-social', 'fw-w3-workstation',
    'fw-w4-data', 'fw-w4-mobile', 'fw-w4-soho',
    'fw-midterm', 'fw-final', 'fl-midterm', 'fl-final',
    'shield-pis-w1-quiz', 'shield-pis-w2-quiz', 'shield-pis-w3-quiz', 'shield-pis-w4-quiz'
];
const FORBIDDEN_IDS = ['shield-pis-midterm', 'shield-pis-final'];

const KEYS_FILE = path.join(__dirname, 'quiz_keys.json');
const DRY_RUN = process.argv.includes('--dry-run');

if (!admin.apps.length) {
    admin.initializeApp({ projectId: 'hexworth-prime' });
}
const db = admin.firestore();

function validateEntry(quizId, entry) {
    const issues = [];
    if (!entry) issues.push('not in quiz_keys.json');
    else {
        if (!Array.isArray(entry.answers)) issues.push('answers not array');
        if (typeof entry.questionCount !== 'number') issues.push('questionCount missing');
        if (typeof entry.passingScore !== 'number') issues.push('passingScore missing');
        if (Array.isArray(entry.answers) && entry.answers.length !== entry.questionCount) {
            issues.push(`length mismatch ${entry.answers.length} vs ${entry.questionCount}`);
        }
        if (Array.isArray(entry.answers) && !entry.answers.every(v => Number.isInteger(v) && v >= 0 && v <= 3)) {
            issues.push('answers contain invalid index (must be 0-3)');
        }
        if (![15, 25, 40].includes(entry.questionCount)) {
            issues.push(`unexpected questionCount ${entry.questionCount}`);
        }
    }
    return issues;
}

async function main() {
    console.log('STR-40 + PIS quiz_keys seeder');
    console.log('==============================');
    console.log(`Mode: ${DRY_RUN ? 'DRY RUN (no writes)' : 'LIVE (writing to production Firestore)'}`);
    console.log(`Project: hexworth-prime`);
    console.log('');

    if (!fs.existsSync(KEYS_FILE)) {
        console.error('ERROR: quiz_keys.json not found.');
        process.exit(1);
    }

    const allKeys = JSON.parse(fs.readFileSync(KEYS_FILE, 'utf8'));

    // Acceptance check 1: TARGET_IDS set is what we expect
    if (TARGET_IDS.length !== 18) {
        console.error(`ERROR: TARGET_IDS length is ${TARGET_IDS.length}, expected 18`);
        process.exit(1);
    }
    if (new Set(TARGET_IDS).size !== TARGET_IDS.length) {
        console.error('ERROR: TARGET_IDS has duplicates');
        process.exit(1);
    }

    // Acceptance check 2: forbidden IDs not in TARGET_IDS
    for (const f of FORBIDDEN_IDS) {
        if (TARGET_IDS.includes(f)) {
            console.error(`ERROR: forbidden id ${f} in TARGET_IDS`);
            process.exit(1);
        }
    }

    // Acceptance check 3: validate each entry pre-write
    let totalQuestions = 0;
    const validated = [];
    for (const quizId of TARGET_IDS) {
        const entry = allKeys[quizId];
        const issues = validateEntry(quizId, entry);
        if (issues.length) {
            console.error(`  X ${quizId}: ${issues.join('; ')}`);
            process.exit(1);
        }
        validated.push({ quizId, entry });
        totalQuestions += entry.questionCount;
    }

    // Acceptance check 4: total question count
    if (totalQuestions !== 340) {
        console.error(`ERROR: total questionCount sum is ${totalQuestions}, expected 340 (280 STR-40 + 60 PIS)`);
        process.exit(1);
    }

    console.log(`Acceptance checks PASSED:`);
    console.log(`  - 18 target IDs (no duplicates, no forbidden)`);
    console.log(`  - All 18 entries present and well-formed`);
    console.log(`  - Sum of questionCount = ${totalQuestions} (expected 340)`);
    console.log('');

    // Push (or preview)
    let writes = 0;
    let errors = 0;
    for (const { quizId, entry } of validated) {
        const summary = `${quizId.padEnd(22)}  ans.length=${String(entry.answers.length).padStart(2)}  pass=${entry.passingScore}%  qcount=${entry.questionCount}`;

        if (DRY_RUN) {
            console.log(`  [DRY] ${summary}`);
            console.log(`         answers: [${entry.answers.join(', ')}]`);
            writes++;
            continue;
        }

        try {
            const docRef = db.doc(`quiz_keys/${quizId}`);
            await docRef.set({
                answers: entry.answers,
                passingScore: entry.passingScore,
                questionCount: entry.questionCount,
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                seedSource: 'seed-str40-pis-keys.js (Karl-PASSed Confluence solution pages, 2026-05-06)'
            }, { merge: true });
            console.log(`  [OK]  ${summary}`);
            writes++;
        } catch (e) {
            console.error(`  [ERR] ${quizId}: ${e.message}`);
            errors++;
        }
    }

    console.log('');
    console.log('─── Summary ───');
    console.log(`  ${DRY_RUN ? 'Would write' : 'Wrote'}: ${writes}/${TARGET_IDS.length}`);
    if (!DRY_RUN) {
        console.log(`  Errors:      ${errors}`);
    }

    if (!DRY_RUN && writes === TARGET_IDS.length && errors === 0) {
        console.log('\nNext steps:');
        console.log('  1. node verify-quiz-keys.js fw-w1-logical fw-w1-physical fw-w2-malware fw-w2-wireless fw-w3-os-security fw-w3-social fw-w3-workstation fw-w4-data fw-w4-mobile fw-w4-soho fw-midterm fw-final fl-midterm fl-final shield-pis-w1-quiz shield-pis-w2-quiz shield-pis-w3-quiz shield-pis-w4-quiz');
        console.log('  2. ./deploy.sh');
    }

    process.exit(errors > 0 ? 1 : 0);
}

main().catch(err => {
    console.error('Seed failed:', err.message);
    process.exit(1);
});
