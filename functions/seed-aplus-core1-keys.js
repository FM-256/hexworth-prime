#!/usr/bin/env node
/**
 * seed-aplus-core1-keys.js — Upload A+ Core 1 quiz answer keys to Firestore
 *
 * Reads aplus-core1-quiz-keys.json and writes each entry to quiz_keys/{quizId}.
 * This makes the gradeQuiz() Cloud Function able to grade these quizzes.
 *
 * Usage:
 *   cd functions
 *   node seed-aplus-core1-keys.js              # Upload to Firestore
 *   node seed-aplus-core1-keys.js --dry-run    # Preview without writing
 *
 * Prerequisites:
 *   - Firebase Admin SDK initialized (uses service account or local emulator)
 *   - aplus-core1-quiz-keys.json in same directory
 */

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Initialize Firebase Admin with explicit project ID
if (!admin.apps.length) {
    admin.initializeApp({ projectId: 'hexworth-prime' });
}
const db = admin.firestore();

const KEYS_FILE = path.join(__dirname, 'aplus-core1-quiz-keys.json');
const DRY_RUN = process.argv.includes('--dry-run');

async function main() {
    console.log('A+ Core 1 Quiz Key Seeder');
    console.log('=========================');
    console.log(`Mode: ${DRY_RUN ? 'DRY RUN (no writes)' : 'LIVE (writing to Firestore)'}`);
    console.log('');

    // Load keys
    if (!fs.existsSync(KEYS_FILE)) {
        console.error('ERROR: ' + KEYS_FILE + ' not found.');
        console.error('Run the extraction script first.');
        process.exit(1);
    }

    const keys = JSON.parse(fs.readFileSync(KEYS_FILE, 'utf8'));
    const quizIds = Object.keys(keys);
    console.log(`Found ${quizIds.length} quiz keys to upload.\n`);

    // Upload each key
    let uploaded = 0;
    let skipped = 0;

    for (const quizId of quizIds) {
        const data = keys[quizId];
        const docRef = db.doc(`quiz_keys/${quizId}`);

        console.log(`  ${quizId}: ${data.questionCount} questions, passing: ${data.passingScore}%`);

        if (DRY_RUN) {
            console.log(`    [DRY RUN] Would write to quiz_keys/${quizId}`);
            uploaded++;
            continue;
        }

        try {
            // Check if already exists
            const existing = await docRef.get();
            if (existing.exists) {
                console.log(`    [EXISTS] Already in Firestore — overwriting`);
            }

            await docRef.set({
                answers: data.answers,
                passingScore: data.passingScore,
                questionCount: data.questionCount,
                source: 'aplus-core1',
                createdAt: admin.firestore.FieldValue.serverTimestamp()
            });

            console.log(`    [OK] Written to Firestore`);
            uploaded++;
        } catch (e) {
            console.error(`    [ERROR] ${e.message}`);
            skipped++;
        }
    }

    console.log('\n─── Summary ───');
    console.log(`  Uploaded: ${uploaded}`);
    console.log(`  Skipped:  ${skipped}`);
    console.log(`  Total:    ${quizIds.length}`);

    if (!DRY_RUN && uploaded > 0) {
        console.log('\nKeys are now in Firestore. The gradeQuiz() Cloud Function can grade these quizzes.');
    }
}

main().catch(console.error);
