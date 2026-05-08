#!/usr/bin/env node
/**
 * seed-clh-poc-rebalance-2026-05-08.js
 *
 * Atomic reseed for the 3 QC-53 POC rebalanced quizzes:
 *   clh-022, clh-023, clh-027
 *
 * Reads current static functions/quiz_keys.json (which was updated when each
 * quiz was rebalanced and Karl-verified ALL-PASS) and writes the matching
 * Firestore quiz_keys/{moduleId} doc.
 *
 * Source-of-truth verification at top of each step:
 *   - clh-022 must be [0,1,2,3,0]
 *   - clh-023 must be [2,0,1,3,0]
 *   - clh-027 must be [1,3,0,2,0]
 * If static drifts from these expected values, the script ABORTS — refuses
 * to seed unverified state.
 *
 * Karl artifact: /home/eq/hexworth-shared/Solutions/_audit/karl-clh-poc-rebalance-2026-05-08.md
 *
 * Usage:
 *   cd functions
 *   node seed-clh-poc-rebalance-2026-05-08.js --dry-run    # Preview
 *   node seed-clh-poc-rebalance-2026-05-08.js              # Live reseed
 *
 * After this script: run `node verify-quiz-keys.js clh-022 clh-023 clh-027`
 * Then run `./deploy.sh` from repo root.
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

const EXPECTED = {
    'clh-022': [0, 1, 2, 3, 0],
    'clh-023': [2, 0, 1, 3, 0],
    'clh-027': [1, 3, 0, 2, 0],
};

function arrayEq(a, b) {
    if (!Array.isArray(a) || !Array.isArray(b)) return false;
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
    return true;
}

async function main() {
    console.log('QC-53 POC Rebalance Reseed (2026-05-08)');
    console.log('=========================================');
    console.log(`Mode: ${DRY_RUN ? 'DRY RUN (no writes)' : 'LIVE (writing to Firestore)'}`);

    const keys = JSON.parse(fs.readFileSync(KEYS_FILE, 'utf8'));

    // Pre-flight: verify static matches expected Karl-verified state
    console.log('\nPre-flight: verify static vs Karl-verified expected state\n');
    for (const id of Object.keys(EXPECTED)) {
        if (!keys[id]) {
            console.error(`  ABORT — static missing key '${id}'`);
            process.exit(1);
        }
        if (!arrayEq(keys[id].answers, EXPECTED[id])) {
            console.error(`  ABORT — '${id}' static answers ${JSON.stringify(keys[id].answers)} != expected ${JSON.stringify(EXPECTED[id])}`);
            console.error('  Karl re-audit required before reseed.');
            process.exit(1);
        }
        console.log(`  ${id} static = expected ${JSON.stringify(EXPECTED[id])} ✓`);
    }

    console.log('\nPre-flight PASS. Proceeding to seed.\n');

    for (const id of Object.keys(EXPECTED)) {
        const data = {
            answers: keys[id].answers,
            passingScore: keys[id].passingScore || 70,
            questionCount: keys[id].answers.length,
            lastReseedAt: new Date().toISOString(),
            lastReseedBy: 'seed-clh-poc-rebalance-2026-05-08',
            karlAuditArtifact: '/home/eq/hexworth-shared/Solutions/_audit/karl-clh-poc-rebalance-2026-05-08.md',
        };
        console.log(`  ${id}: ${data.questionCount} questions, answers=${JSON.stringify(data.answers)}`);
        if (!DRY_RUN) {
            await db.collection('quiz_keys').doc(id).set(data, { merge: false });
            console.log(`    -> uploaded to quiz_keys/${id}`);
        }
    }

    console.log(`\n${DRY_RUN ? 'Dry run complete.' : 'Live reseed complete.'}`);
    console.log('\nNext steps:');
    console.log('  1. node verify-quiz-keys.js clh-022 clh-023 clh-027');
    console.log('  2. cd .. && ./deploy.sh');
}

main().catch(e => { console.error('FAILED:', e); process.exit(1); });
