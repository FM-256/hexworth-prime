#!/usr/bin/env node
/**
 * seed-bug-hunting-keys.js — Upload Bug Hunting quiz answer keys to Firestore
 *
 * Reads bug-hunting-quiz-keys.json and writes each entry to quiz_keys/{quizId}.
 * This makes the gradeQuiz() Cloud Function able to grade these quizzes.
 *
 * Usage:
 *   cd functions
 *   node seed-bug-hunting-keys.js              # Upload to Firestore
 *   node seed-bug-hunting-keys.js --dry-run    # Preview without writing
 */

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

if (!admin.apps.length) {
    admin.initializeApp({ projectId: 'hexworth-prime' });
}
const db = admin.firestore();

const KEYS_FILE = path.join(__dirname, 'bug-hunting-quiz-keys.json');
const DRY_RUN = process.argv.includes('--dry-run');

async function main() {
    if (!fs.existsSync(KEYS_FILE)) {
        console.error('Key file not found:', KEYS_FILE);
        process.exit(1);
    }

    const data = JSON.parse(fs.readFileSync(KEYS_FILE, 'utf8'));
    const quizIds = Object.keys(data);

    console.log(`Found ${quizIds.length} quiz key(s) to seed.`);
    if (DRY_RUN) console.log('[DRY RUN MODE]');

    for (const quizId of quizIds) {
        const entry = data[quizId];
        console.log(`  ${quizId}: ${entry.questionCount} questions, passing=${entry.passingScore}%`);

        if (!DRY_RUN) {
            await db.doc(`quiz_keys/${quizId}`).set(entry, { merge: false });
            console.log(`    Written to quiz_keys/${quizId}`);
        } else {
            console.log(`    [DRY RUN] Would write to quiz_keys/${quizId}`);
        }
    }

    console.log('Done.');
}

main().catch(err => {
    console.error('Seed failed:', err);
    process.exit(1);
});
