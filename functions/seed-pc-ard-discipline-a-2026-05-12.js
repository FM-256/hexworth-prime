#!/usr/bin/env node
/**
 * seed-pc-ard-discipline-a-2026-05-12.js
 *
 * Targeted one-shot seed: push the QC-50 audit-verified Discipline A keys
 * for pc-ard-04-quiz + pc-ard-14-quiz from static `quiz_keys.json` to live
 * Firestore.
 *
 * Background:
 *   - Prior Firestore key (both quizzes): [0,1,2,3,0,1,2,3,0,1,2,3,0,1,0]
 *     (placeholder cycling). Students picking the actual correct answer
 *     (always options[0] per per-question audit) were scoring 5 of 15.
 *   - Corrected static key (commit 45fd462e): [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
 *     plus `disciplineA: true` flag.
 *   - Audit: ~/hexworth-shared/Solutions/_audit/qc50-handcopy-drift-2026-05-12.md
 *
 * Why not use seed-placeholder-fix-2026-05-08.js?
 *   That script's safety check refuses to push arrays detected as "placeholder
 *   pattern" (all-zeros qualifies). For Discipline A architecture, all-zeros
 *   is the CORRECT key. This targeted script bypasses that check because
 *   the disciplineA flag is the architectural assertion.
 *
 * Usage:
 *   cd functions
 *   node seed-pc-ard-discipline-a-2026-05-12.js --dry-run    # preview
 *   node seed-pc-ard-discipline-a-2026-05-12.js              # LIVE write
 *
 * Per CLAUDE.md rule 10: explicit operator authorization required. Operator
 * authorized in chat 2026-05-12 via "push pc-ard to firestore".
 */

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

const DRY_RUN = process.argv.includes('--dry-run');

if (!admin.apps.length) admin.initializeApp({ projectId: 'hexworth-prime' });
const db = admin.firestore();

const QUIZ_IDS = ['pc-ard-04-quiz', 'pc-ard-14-quiz'];
const STATIC_PATH = path.join(__dirname, 'quiz_keys.json');
const EXPECTED_KEY = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

async function main() {
    const staticKeys = JSON.parse(fs.readFileSync(STATIC_PATH, 'utf8'));

    console.log('Mode: ' + (DRY_RUN ? 'DRY RUN (no writes)' : 'LIVE WRITE'));
    console.log('Targets: ' + QUIZ_IDS.join(', '));
    console.log();

    for (const qid of QUIZ_IDS) {
        const entry = staticKeys[qid];
        if (!entry) {
            console.error('FAIL ' + qid + ': missing from static quiz_keys.json');
            process.exitCode = 1;
            continue;
        }

        // Sanity gate 1: static key must match the expected all-zeros shape
        if (JSON.stringify(entry.answers) !== JSON.stringify(EXPECTED_KEY)) {
            console.error('FAIL ' + qid + ': static answers do not match expected Discipline A key');
            console.error('  expected: ' + JSON.stringify(EXPECTED_KEY));
            console.error('  got:      ' + JSON.stringify(entry.answers));
            process.exitCode = 1;
            continue;
        }

        // Sanity gate 2: disciplineA flag must be present (architectural assertion)
        if (entry.disciplineA !== true) {
            console.error('FAIL ' + qid + ': disciplineA flag missing on static entry');
            process.exitCode = 1;
            continue;
        }

        // Read current Firestore state for the pre-write log
        let priorAnswers = null;
        try {
            const snap = await db.doc('quiz_keys/' + qid).get();
            if (snap.exists) priorAnswers = snap.data().answers;
        } catch (e) {
            console.error('WARN ' + qid + ': could not read prior Firestore state — ' + e.message);
        }

        const payload = {
            answers: entry.answers,
            questionCount: entry.questionCount || entry.answers.length,
            passingScore: entry.passingScore || 70,
            disciplineA: true,
            lastFixedAt: '2026-05-12',
            lastFixedBy: 'qc50-handcopy-drift-2026-05-12',
            fixNote: entry.fixNote || 'QC-50 audit reseed — Discipline A architecture confirmed per-question.',
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedBy: 'seed-pc-ard-discipline-a-2026-05-12',
            source: 'static-quiz_keys.json',
        };

        console.log('---');
        console.log(qid);
        console.log('  prior Firestore: ' + (priorAnswers ? JSON.stringify(priorAnswers) : '(not found)'));
        console.log('  new (static):    ' + JSON.stringify(entry.answers));

        if (DRY_RUN) {
            console.log('  [DRY] would set quiz_keys/' + qid + ' merge:true');
        } else {
            try {
                await db.doc('quiz_keys/' + qid).set(payload, { merge: true });
                console.log('  WROTE quiz_keys/' + qid);
            } catch (e) {
                console.error('  ERROR ' + qid + ': ' + e.message);
                process.exitCode = 1;
            }
        }
    }

    console.log();
    console.log(DRY_RUN ? 'Dry run complete — no writes.' : 'Live run complete. Run verify-quiz-keys.js to confirm.');
}

main().catch(e => { console.error('FATAL:', e); process.exit(2); });
