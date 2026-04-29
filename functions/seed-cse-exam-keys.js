#!/usr/bin/env node
/**
 * seed-cse-exam-keys.js — Upload CIS2253 Cybersecurity Ethics exam keys to Firestore
 *
 * Reads cse-exam-keys.json and writes each entry to quiz_keys/{quizId}.
 * Without this, gradeQuiz() returns 0/25 for every attempt.
 *
 * Usage:
 *   cd functions
 *   node seed-cse-exam-keys.js              # Upload to Firestore
 *   node seed-cse-exam-keys.js --dry-run    # Preview without writing
 */

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

if (!admin.apps.length) {
    admin.initializeApp({ projectId: 'hexworth-prime' });
}
const db = admin.firestore();

const KEYS_FILE = path.join(__dirname, 'cse-exam-keys.json');
const DRY_RUN = process.argv.includes('--dry-run');

async function main() {
    console.log('CIS2253 Exam Key Seeder');
    console.log('=======================');
    console.log(`Mode: ${DRY_RUN ? 'DRY RUN (no writes)' : 'LIVE (writing to Firestore)'}`);

    if (!fs.existsSync(KEYS_FILE)) {
        console.error(`ERROR: ${KEYS_FILE} not found.`);
        process.exit(1);
    }

    const keys = JSON.parse(fs.readFileSync(KEYS_FILE, 'utf8'));
    const quizIds = Object.keys(keys);
    console.log(`\nFound ${quizIds.length} exam keys to upload:\n`);

    for (const quizId of quizIds) {
        const data = keys[quizId];
        console.log(`  ${quizId}: ${data.questionCount} questions, ${data.passingScore}% to pass`);

        if (!DRY_RUN) {
            await db.collection('quiz_keys').doc(quizId).set(data);
            console.log(`    -> uploaded to quiz_keys/${quizId}`);
        }
    }

    console.log(`\n${DRY_RUN ? 'Dry run complete.' : 'Live seeding complete.'}`);
    process.exit(0);
}

main().catch(err => {
    console.error('Seeding failed:', err);
    process.exit(1);
});
