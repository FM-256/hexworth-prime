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
const { announceTarget } = require('./firestore-target');

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

// `--filter` with no value left FILTER undefined, which fell through the ternary below
// as falsy and pushed EVERY key in the registry — the exact opposite of the narrowing the
// operator asked for. A scoped push is the whole safety model here, so refuse rather than
// silently widen. Raised in review 2026-08-04.
if (filterIdx !== -1 && (!FILTER || FILTER.startsWith('--'))) {
    console.error('ERROR: --filter requires a value (e.g., --filter az104).');
    console.error('       Refusing to run: a valueless --filter would push ALL keys.');
    process.exit(1);
}

async function main() {
    console.log('Quiz Key Push Tool');
    console.log('══════════════════');
    console.log(`Mode:   ${DRY_RUN ? 'DRY RUN (no writes)' : 'LIVE (writing to Firestore)'}`);
    console.log(`Filter: ${FILTER || 'ALL keys'}`);
    // "LIVE (writing to Firestore)" is equally true of the emulator and of production.
    // Say WHICH. See firestore-target.js for the incident that prompted this.
    announceTarget({ writing: !DRY_RUN });
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
        // Exit 1, NOT 0. A typo'd filter ("az-104" instead of "az104") matched nothing and
        // exited success, so the caller — and any script chaining on && — read "pushed
        // fine" when nothing was written. When the HTML is already live and Firestore is
        // stale, that misreport leaves students being mis-graded while the log says OK.
        // Raised in review 2026-08-04.
        console.error('ERROR: no keys matched filter "' + FILTER + '" — nothing was pushed.');
        console.error('       Check the prefix against the ids in quiz_keys.json.');
        process.exit(1);
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
                // Per-question rationales for post-submission answer review. Pushed only
                // when present. revealToAll (formative module quizzes) tells gradeQuiz to
                // reveal the correct answer + explanation to every student, not just passers.
                // Written UNCONDITIONALLY (true/false) so the static registry is authoritative
                // and a stray Firestore flag can never persist under merge:true.
                ...(Array.isArray(data.explanations) ? { explanations: data.explanations } : {}),
                revealToAll: data.revealToAll === true,
                // Opt-in "reveal correct answers after N failed attempts" (gradeQuiz reads
                // this). Written only when present so it never appears on exams that don't use it.
                ...(Number.isInteger(data.reviewAfterFails) ? { reviewAfterFails: data.reviewAfterFails } : {}),
                // Drawn-subset delivery (taskboard #295). gradeQuiz uses this as the SCORING
                // DENOMINATOR, so it is written UNCONDITIONALLY for the same reason revealToAll
                // is: under merge:true a stray poolSize already on the live doc would survive
                // forever, and a live poolSize the registry does not know about is the
                // false-PASS case (a student who answers 12 of 20 and stops gets 12/12 = 100%).
                // Explicit delete when the registry does not declare one, so the registry is
                // the single authority in BOTH directions.
                poolSize: (Number.isInteger(data.poolSize) && data.poolSize > 0)
                    ? data.poolSize
                    : admin.firestore.FieldValue.delete(),
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

    // A key that failed to push means gradeQuiz() will score that quiz against a document
    // that is missing or stale, and students get the wrong grade. Counting the failures and
    // then exiting 0 tells every caller the push succeeded. Report it in the exit code.
    if (errors > 0) {
        console.error(`\n${errors} key(s) FAILED to push. quiz_keys is not in the state the `
            + 'registry describes.');
        process.exitCode = 1;
    }
}

// Not `.catch(console.error)`: that prints the error and exits 0, so a push that crashed
// on its first document was indistinguishable from a clean run to anything reading $?.
// seed-quiz-key.js already got this right; this file did not.
main().catch((e) => {
    console.error('ERROR:', e && e.stack ? e.stack : e);
    process.exit(1);
});
