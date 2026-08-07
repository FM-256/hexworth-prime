#!/usr/bin/env node
/**
 * @catalog what    Seeds quiz_keys/{quizId} in Firestore from the canonical functions/quiz_keys.json
 * @catalog run     cd functions && node seed-quiz-key.js <quizId> [...] [--dry-run]
 * @catalog status  TOOL
 *
 * seed-quiz-key.js — publish an answer key so gradeQuiz() can grade a server-graded quiz.
 *
 * WHY A GENERIC ONE. functions/ already holds seed-aplus-core1-keys.js, seed-cse-exam-keys.js,
 * seed-bug-hunting-keys.js, reseed-secplus.js and more, each hardcoded to one course and one
 * side-file. That is how the repo ended up with 1121 scripts and eleven of them wired to
 * anything. This reads the CANONICAL registry (functions/quiz_keys.json), which
 * verify-quiz-keys.js already treats as the source of truth, so the file that the static
 * check validates is the same file that gets published. No side-file to drift.
 *
 * SAFETY
 *   - Seeds ONLY the quizIds named on the command line. Never the whole registry.
 *   - If a doc already exists it is backed up to quiz_keys_backup/{quizId}__{timestamp}
 *     BEFORE being overwritten, and the run reports the diff. We do not destroy.
 *   - --dry-run reads and reports without writing anything.
 *   - Refuses an entry whose answers array length disagrees with questionCount, which is
 *     the shape of the bug that scores a whole cohort 0/N.
 *
 * PRODUCTION WRITE. Per CLAUDE.md rule 10 this targets hexworth-prime directly and must not
 * be run without the operator authorizing that specific seed.
 */

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

if (!admin.apps.length) {
    admin.initializeApp({ projectId: 'hexworth-prime' });
}
const db = admin.firestore();

const REGISTRY = path.join(__dirname, 'quiz_keys.json');
const DRY_RUN = process.argv.includes('--dry-run');
const IDS = process.argv.slice(2).filter(a => !a.startsWith('--'));

function stamp() {
    return new Date().toISOString().replace(/[:.]/g, '-');
}

async function main() {
    console.log('seed-quiz-key.js');
    console.log('================');
    console.log(`Mode: ${DRY_RUN ? 'DRY RUN (no writes)' : 'LIVE (writing to Firestore)'}`);
    console.log('');

    if (!IDS.length) {
        console.error('ERROR: name at least one quizId.');
        console.error('  cd functions && node seed-quiz-key.js core2-ch25 [--dry-run]');
        process.exit(2);
    }
    if (!fs.existsSync(REGISTRY)) {
        console.error(`ERROR: ${REGISTRY} not found.`);
        process.exit(2);
    }

    const registry = JSON.parse(fs.readFileSync(REGISTRY, 'utf8'));
    let failed = 0;

    for (const id of IDS) {
        const entry = registry[id];
        if (!entry) {
            console.error(`  X ${id}: not in quiz_keys.json. Add it there first.`);
            failed++;
            continue;
        }
        if (!Array.isArray(entry.answers) || !entry.answers.length) {
            console.error(`  X ${id}: no answers array.`);
            failed++;
            continue;
        }
        // The shape that silently scores a cohort 0/N.
        if (entry.questionCount != null && entry.answers.length !== entry.questionCount) {
            console.error(`  X ${id}: answers=${entry.answers.length} but questionCount=${entry.questionCount}.`);
            failed++;
            continue;
        }
        if (entry.answers.some(a => !Number.isInteger(a) || a < 0)) {
            console.error(`  X ${id}: answers must be non-negative option indices.`);
            failed++;
            continue;
        }

        const ref = db.doc(`quiz_keys/${id}`);
        const existing = await ref.get();

        if (existing.exists) {
            const prev = existing.data();
            const same = JSON.stringify(prev.answers) === JSON.stringify(entry.answers);
            console.log(`  ! ${id}: already exists (${(prev.answers || []).length} answers)${same ? ', identical' : ', DIFFERENT'}`);
            if (!DRY_RUN) {
                await db.doc(`quiz_keys_backup/${id}__${stamp()}`).set({
                    ...prev, _backedUpFrom: `quiz_keys/${id}`, _backedUpAt: new Date().toISOString()
                });
                console.log(`    backed up before overwrite`);
            }
        } else {
            console.log(`  + ${id}: new document (${entry.answers.length} answers, pass ${entry.passingScore})`);
        }

        if (!DRY_RUN) {
            await ref.set({
                answers: entry.answers,
                passingScore: entry.passingScore != null ? entry.passingScore : 70,
                questionCount: entry.questionCount != null ? entry.questionCount : entry.answers.length,
                ...(entry.note ? { note: entry.note } : {}),
                updatedAt: new Date().toISOString()
            });
            const back = await ref.get();
            const ok = JSON.stringify(back.data().answers) === JSON.stringify(entry.answers);
            console.log(`    ${ok ? 'written and read back OK' : 'READ-BACK MISMATCH'}`);
            if (!ok) failed++;
        }
    }

    console.log('');
    if (failed) {
        console.log(`FAILED (${failed}).`);
        process.exit(1);
    }
    console.log(DRY_RUN ? 'Dry run complete. Nothing written.' : 'Seed complete. Now run: node verify-quiz-keys.js ' + IDS.join(' '));
}

main().catch(e => { console.error('ERROR:', e.message); process.exit(1); });
