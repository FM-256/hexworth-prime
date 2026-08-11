/**
 * seed-cse-final-key.js — Seed quiz_keys/cloud-cse-final to live Firestore.
 *
 * Source of truth: functions/seed-data/cloud-cse-final.answers.json (Nancy-audited
 * 2026-08-02, all 40 answers independently verified; byte-identical entry also in
 * functions/quiz_keys.json for EduScan's static validation).
 *
 * Run order per _docs/operations/exam-go-live-checklist.md:
 *   node backup-quiz-keys-pre-seed.js   (always first)
 *   node seed-cse-final-key.js
 *   node verify-quiz-keys.js cloud-cse-final   (must print Verification PASSED)
 */
const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

if (!admin.apps.length) admin.initializeApp({ projectId: 'hexworth-prime' });
const db = admin.firestore();

async function main() {
    const seed = JSON.parse(fs.readFileSync(path.join(__dirname, 'seed-data', 'cloud-cse-final.answers.json'), 'utf8'));
    const quizId = 'cloud-cse-final';
    const data = seed[quizId];
    // Refuse to seed anything malformed — the same three fields verify-quiz-keys checks.
    if (!data || !Array.isArray(data.answers) || data.answers.length !== data.questionCount || typeof data.passingScore !== 'number') {
        console.error('ABORT: seed data malformed for', quizId);
        process.exit(1);
    }
    await db.collection('quiz_keys').doc(quizId).set(data);
    console.log(`Seeded quiz_keys/${quizId}: ${data.answers.length} answers, pass ${data.passingScore}%, reviewAfterFails ${data.reviewAfterFails}`);
}

main().then(() => process.exit(0)).catch((e) => { console.error('SEED FAILED:', e.message); process.exit(1); });
