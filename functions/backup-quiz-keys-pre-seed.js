#!/usr/bin/env node
/**
 * backup-quiz-keys-pre-seed.js — Snapshot 18 quiz_keys docs BEFORE seeding.
 *
 * Reads current Firestore state for the STR-40 batch + PIS-W1-W4 IDs and
 * writes a JSON backup. Used as rollback source if seed-str40-pis-keys.js
 * produces wrong values that need to be reverted.
 *
 * Output shape:
 *   {
 *     "<quizId>": { "existed": true, "data": { ... } },
 *     "<quizId>": { "existed": false, "data": null },
 *     ...
 *   }
 *
 * Restore (manual, if needed):
 *   - existed=false → db.doc(`quiz_keys/${id}`).delete()
 *   - existed=true  → db.doc(`quiz_keys/${id}`).set(data)  // overwrite
 *
 * USAGE:
 *   cd functions
 *   node backup-quiz-keys-pre-seed.js
 */

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

const IDS = [
    'fw-w1-logical', 'fw-w1-physical', 'fw-w2-malware', 'fw-w2-wireless',
    'fw-w3-os-security', 'fw-w3-social', 'fw-w3-workstation',
    'fw-w4-data', 'fw-w4-mobile', 'fw-w4-soho',
    'fw-midterm', 'fw-final', 'fl-midterm', 'fl-final',
    'shield-pis-w1-quiz', 'shield-pis-w2-quiz', 'shield-pis-w3-quiz', 'shield-pis-w4-quiz'
];

if (!admin.apps.length) {
    admin.initializeApp({ projectId: 'hexworth-prime' });
}
const db = admin.firestore();

async function main() {
    console.log('quiz_keys pre-seed backup');
    console.log('=========================');
    console.log(`Capturing ${IDS.length} document states...\n`);

    const snapshot = {};
    for (const id of IDS) {
        const doc = await db.doc(`quiz_keys/${id}`).get();
        if (doc.exists) {
            snapshot[id] = { existed: true, data: doc.data() };
            const ansLen = Array.isArray(doc.data().answers) ? doc.data().answers.length : 'NOT_ARRAY';
            console.log(`  EXISTS  ${id}  (answers.length=${ansLen})`);
        } else {
            snapshot[id] = { existed: false, data: null };
            console.log(`  MISSING ${id}`);
        }
    }

    const ts = new Date().toISOString().replace(/[:.]/g, '-');
    const outPath = path.join(__dirname, '_backups', `quiz-keys-pre-seed-${ts}.json`);
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, JSON.stringify(snapshot, null, 2));

    console.log(`\nBackup written: ${outPath}`);
    const existsCount = Object.values(snapshot).filter(s => s.existed).length;
    console.log(`Summary: ${existsCount}/${IDS.length} existed in Firestore, ${IDS.length - existsCount} missing.`);
    process.exit(0);
}

main().catch(err => {
    console.error('Backup failed:', err.message);
    process.exit(1);
});
