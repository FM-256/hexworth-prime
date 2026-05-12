#!/usr/bin/env node
/**
 * seed-clh-022-disciplineB-2026-05-12.js
 *
 * Targeted one-shot seed: push the Karl-audit-verified Discipline B
 * answer key for clh-022 (Linux network recon quiz) from static
 * quiz_keys.json to live Firestore.
 *
 * Background:
 *   - Prior Firestore key: [0,1,2,3,0] (placeholder cycling, mis-labeled
 *     as rule6-rebalance-poc 2026-05-08 — no content verification was done)
 *   - QUIZ-011 validator flagged HIGH on every deploy since
 *   - Per-question Karl Mode-2 audit (2026-05-12) confirmed all 5 correct
 *     answers at options[1] via canonical sources:
 *       Q1 curl -I:  https://man7.org/linux/man-pages/man1/curl.1.html
 *       Q2 dig MX:   https://www.rfc-editor.org/rfc/rfc1035#section-3.3.9
 *       Q3 nc -zv:   https://man7.org/linux/man-pages/man1/ncat.1.html
 *       Q4 wget -q:  https://man7.org/linux/man-pages/man1/wget.1.html
 *       Q5 nginx ver: https://owasp.org/www-project-web-security-testing-guide/.../02-Fingerprint_Web_Server
 *   - Discipline B family — joins the 8-quiz set in QC-49 architecture audit.
 *     Renderer applies randomize:true so students don't see the all-options[1] pattern.
 *
 * Student impact (preserve-progress policy):
 *   - 4 users have recorded clh-022 scores under the broken key (audit-clh-022.js).
 *   - All show passed:true score:80. Their pass status is GRANDFATHERED — not
 *     invalidated. Going forward, new attempts will be correctly graded.
 *
 * Why not use seed-pc-ard-discipline-a-2026-05-12.js?
 *   That script enforces a Discipline A all-zeros gate. clh-022 is Discipline B
 *   (all-ones). This targeted script enforces the all-ones gate + disciplineB flag.
 *
 * Usage:
 *   cd functions
 *   node seed-clh-022-disciplineB-2026-05-12.js --dry-run    # preview
 *   node seed-clh-022-disciplineB-2026-05-12.js              # LIVE write
 *
 * Per CLAUDE.md rule 10: explicit operator authorization required.
 * Operator authorized in chat 2026-05-12 via "get it done".
 */

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

const DRY_RUN = process.argv.includes('--dry-run');

if (!admin.apps.length) admin.initializeApp({ projectId: 'hexworth-prime' });
const db = admin.firestore();

const QUIZ_ID = 'clh-022';
const STATIC_PATH = path.join(__dirname, 'quiz_keys.json');
const EXPECTED_KEY = [1, 1, 1, 1, 1];

async function main() {
    const staticKeys = JSON.parse(fs.readFileSync(STATIC_PATH, 'utf8'));

    console.log('Mode: ' + (DRY_RUN ? 'DRY RUN (no writes)' : 'LIVE WRITE'));
    console.log('Target: ' + QUIZ_ID);
    console.log();

    const entry = staticKeys[QUIZ_ID];
    if (!entry) {
        console.error('FAIL ' + QUIZ_ID + ': missing from static quiz_keys.json');
        process.exit(1);
    }

    // Sanity gate 1: static key must match the expected all-ones shape
    if (JSON.stringify(entry.answers) !== JSON.stringify(EXPECTED_KEY)) {
        console.error('FAIL ' + QUIZ_ID + ': static answers do not match expected Discipline B key');
        console.error('  expected: ' + JSON.stringify(EXPECTED_KEY));
        console.error('  got:      ' + JSON.stringify(entry.answers));
        process.exit(1);
    }

    // Sanity gate 2: disciplineB flag must be present (architectural assertion)
    if (entry.disciplineB !== true) {
        console.error('FAIL ' + QUIZ_ID + ': disciplineB flag missing on static entry');
        process.exit(1);
    }

    // Read current Firestore state for the pre-write log
    let priorAnswers = null;
    try {
        const snap = await db.doc('quiz_keys/' + QUIZ_ID).get();
        if (snap.exists) priorAnswers = snap.data().answers;
    } catch (e) {
        console.error('WARN ' + QUIZ_ID + ': could not read prior Firestore state — ' + e.message);
    }

    const payload = {
        answers: entry.answers,
        questionCount: entry.questionCount || entry.answers.length,
        passingScore: entry.passingScore || 70,
        disciplineB: true,
        lastFixedAt: '2026-05-12',
        lastFixedBy: 'seed-clh-022-disciplineB-2026-05-12',
        fixNote: entry.fixNote,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedBy: 'seed-clh-022-disciplineB-2026-05-12',
        source: 'static-quiz_keys.json',
    };

    console.log('---');
    console.log(QUIZ_ID);
    console.log('  prior Firestore: ' + (priorAnswers ? JSON.stringify(priorAnswers) : '(not found)'));
    console.log('  new (static):    ' + JSON.stringify(entry.answers));

    if (DRY_RUN) {
        console.log('  [DRY] would set quiz_keys/' + QUIZ_ID + ' merge:true');
    } else {
        try {
            await db.doc('quiz_keys/' + QUIZ_ID).set(payload, { merge: true });
            console.log('  WROTE quiz_keys/' + QUIZ_ID);
        } catch (e) {
            console.error('  ERROR: ' + e.message);
            process.exit(1);
        }
    }

    console.log();
    console.log(DRY_RUN ? 'Dry run complete — no writes.' : 'Live run complete. Run `node verify-quiz-keys.js clh-022` to confirm.');
}

main().catch(e => { console.error('FATAL:', e); process.exit(2); });
