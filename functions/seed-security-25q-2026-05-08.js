#!/usr/bin/env node
/**
 * seed-security-25q-2026-05-08.js
 *
 * Atomic reseed for the `security` quiz (QC-55 grading-bug fix).
 *
 * Source-of-truth: functions/quiz_keys.json key `security`, corrected today
 * via Karl Mode-2 audit (commit eb9f4718). Discipline A: 25 questions, all
 * correct answers at options[0], `randomize: true` handles render shuffle.
 *
 * Pre-flight gate ABORTS if static drifts from the Karl-verified state:
 *   - 25-element answers array
 *   - all entries === 0
 * If static does not match, refuse to seed.
 *
 * Karl artifact: ~/hexworth-shared/Solutions/_audit/karl-security-25q-audit-2026-05-08.md
 *
 * Usage:
 *   cd functions
 *   node seed-security-25q-2026-05-08.js --dry-run   # Preview
 *   node seed-security-25q-2026-05-08.js             # Live reseed
 *
 * After live reseed: run `node verify-quiz-keys.js security` then `./deploy.sh`
 * (atomic with any other pending hosting changes).
 */

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

if (!admin.apps.length) {
    admin.initializeApp({ projectId: 'hexworth-prime' });
}
const db = admin.firestore();

const KEYS_FILE = path.join(__dirname, 'quiz_keys.json');
const DRY_RUN = process.argv.includes('--dry-run');
const ID = 'security';

async function main() {
    console.log('QC-55 security 25Q Reseed (2026-05-08)');
    console.log('========================================');
    console.log(`Mode: ${DRY_RUN ? 'DRY RUN (no writes)' : 'LIVE (writing to Firestore)'}`);

    const keys = JSON.parse(fs.readFileSync(KEYS_FILE, 'utf8'));
    const entry = keys[ID];

    if (!entry) {
        console.error(`ABORT — static missing key '${ID}'`);
        process.exit(1);
    }
    if (!Array.isArray(entry.answers) || entry.answers.length !== 25) {
        console.error(`ABORT — '${ID}' static answers length ${entry.answers?.length} != 25`);
        process.exit(1);
    }
    const allZeros = entry.answers.every(v => v === 0);
    if (!allZeros) {
        console.error(`ABORT — '${ID}' static answers not all zeros: ${JSON.stringify(entry.answers)}`);
        console.error('Karl re-audit required before reseed.');
        process.exit(1);
    }

    console.log(`\nPre-flight PASS: ${ID} static = 25 zeros (Discipline A canonical) ✓\n`);

    const data = {
        answers: entry.answers,
        passingScore: entry.passingScore || 70,
        questionCount: 25,
        lastReseedAt: new Date().toISOString(),
        lastReseedBy: 'seed-security-25q-2026-05-08',
        karlAuditArtifact: '/home/eq/hexworth-shared/Solutions/_audit/karl-security-25q-audit-2026-05-08.md',
    };
    console.log(`  ${ID}: ${data.questionCount} questions, all-zeros (Discipline A)`);

    if (!DRY_RUN) {
        await db.collection('quiz_keys').doc(ID).set(data, { merge: false });
        console.log(`    -> uploaded to quiz_keys/${ID}`);
    }

    console.log(`\n${DRY_RUN ? 'Dry run complete.' : 'Live reseed complete.'}`);
    console.log('\nNext steps:');
    console.log('  1. node verify-quiz-keys.js security');
    console.log('  2. cd .. && ./deploy.sh   (atomic with any other hosting changes)');
}

main().catch(e => { console.error('FAILED:', e); process.exit(1); });
