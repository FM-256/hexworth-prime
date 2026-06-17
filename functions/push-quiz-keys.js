#!/usr/bin/env node
/**
 * push-quiz-keys.js — Push quiz answer keys from quiz_keys.json to Firestore
 *
 * Reads quiz_keys.json and pushes selected keys to the Firestore quiz_keys/
 * collection. Supports filtering by prefix so you can target specific quizzes.
 *
 * Usage:
 *   cd functions
 *   node push-quiz-keys.js --dry-run                   # Preview ALL keys
 *   node push-quiz-keys.js --filter clh --dry-run      # Preview CLH keys only
 *   node push-quiz-keys.js --filter clh                # Push CLH keys to Firestore
 *   node push-quiz-keys.js                             # Push ALL keys to Firestore
 *
 * Prerequisites:
 *   - Firebase Admin SDK (npm install in functions/)
 *   - quiz_keys.json in same directory
 */

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Initialize Firebase Admin
if (!admin.apps.length) {
    admin.initializeApp({ projectId: 'hexworth-prime' });
}
const db = admin.firestore();

const KEYS_FILE = path.join(__dirname, 'quiz_keys.json');
const DRY_RUN = process.argv.includes('--dry-run');

// Optional --filter prefix (e.g., --filter clh)
const filterIdx = process.argv.indexOf('--filter');
const FILTER = filterIdx !== -1 ? process.argv[filterIdx + 1] : null;

async function main() {
    console.log('Quiz Key Push Tool');
    console.log('══════════════════');
    console.log(`Mode:   ${DRY_RUN ? 'DRY RUN (no writes)' : 'LIVE (writing to Firestore)'}`);
    console.log(`Filter: ${FILTER || 'ALL keys'}`);
    console.log('');

    if (!fs.existsSync(KEYS_FILE)) {
        console.error('ERROR: ' + KEYS_FILE + ' not found.');
        process.exit(1);
    }

    const allKeys = JSON.parse(fs.readFileSync(KEYS_FILE, 'utf8'));

    // Apply filter if provided
    const quizIds = Object.keys(allKeys)
        .filter(id => FILTER ? id.startsWith(FILTER) : true)
        .sort();

    if (quizIds.length === 0) {
        console.log('No keys matched filter "' + FILTER + '"');
        process.exit(0);
    }

    console.log(`Found ${quizIds.length} keys to push.\n`);

    let pushed = 0;
    let updated = 0;
    let errors = 0;

    for (const quizId of quizIds) {
        const data = allKeys[quizId];
        const docRef = db.doc(`quiz_keys/${quizId}`);

        const summary = `${quizId}: ${data.answers.length} answers, passing ${data.passingScore}%`;

        if (DRY_RUN) {
            console.log(`  [DRY] ${summary}`);
            console.log(`         answers: [${data.answers.join(', ')}]`);
            pushed++;
            continue;
        }

        try {
            // Check current state so we can report new vs updated
            const existing = await docRef.get();
            const isUpdate = existing.exists;

            // Merge: preserves any extra fields (like usage stats) while
            // overwriting the answer data
            await docRef.set({
                answers: data.answers,
                passingScore: data.passingScore,
                questionCount: data.questionCount,
                // Per-question rationales for post-submission answer review (passers only,
                // gated server-side in gradeQuiz). Pushed only when present in the registry.
                ...(Array.isArray(data.explanations) ? { explanations: data.explanations } : {}),
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
            }, { merge: true });

            if (isUpdate) {
                console.log(`  [UPD] ${summary}`);
                updated++;
            } else {
                console.log(`  [NEW] ${summary}`);
            }
            pushed++;
        } catch (e) {
            console.error(`  [ERR] ${quizId}: ${e.message}`);
            errors++;
        }
    }

    console.log('\n─── Summary ───');
    console.log(`  Pushed:  ${pushed} (${updated} updated, ${pushed - updated} new)`);
    console.log(`  Errors:  ${errors}`);
    console.log(`  Total:   ${quizIds.length}`);

    if (!DRY_RUN && pushed > 0) {
        console.log('\nFirestore quiz_keys/ updated. gradeQuiz() will use these immediately.');
    }
}

main().catch(console.error);
