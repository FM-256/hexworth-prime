#!/usr/bin/env node
/**
 * seed-netplus-final-practice-key.js — Seed quiz_keys/web-netplus-final-practice
 *
 * Part of QC-57a-1 cert-hub server-grading migration.
 * Reads functions/quiz_keys.json registry, finds the
 * web-netplus-final-practice entry, writes it to Firestore.
 *
 * Usage:
 *   cd functions
 *   node seed-netplus-final-practice-key.js              # write to Firestore
 *   node seed-netplus-final-practice-key.js --dry-run    # preview only
 *   node seed-netplus-final-practice-key.js --verify     # read back + confirm
 *
 * Pre-deploy gate per CLAUDE.md Rule 10: branch=master + operator approval.
 */

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

if (!admin.apps.length) admin.initializeApp({ projectId: 'hexworth-prime' });
const db = admin.firestore();

const QUIZ_ID = 'web-netplus-final-practice';
const REGISTRY = path.join(__dirname, 'quiz_keys.json');
const DRY_RUN = process.argv.includes('--dry-run');
const VERIFY  = process.argv.includes('--verify');

async function main() {
  console.log('seed-netplus-final-practice-key.js');
  console.log('==================================');
  console.log(`Mode: ${VERIFY ? 'VERIFY (read back)' : DRY_RUN ? 'DRY RUN' : 'LIVE (write to Firestore)'}`);

  const all = JSON.parse(fs.readFileSync(REGISTRY, 'utf8'));
  const entry = all[QUIZ_ID];
  if (!entry) { console.error(`ERROR: ${QUIZ_ID} not in ${REGISTRY}`); process.exit(2); }

  console.log(`\nRegistry entry:`);
  console.log(`  questionCount: ${entry.questionCount}`);
  console.log(`  passingScore:  ${entry.passingScore}`);
  console.log(`  answers.length: ${entry.answers.length}`);
  if (entry.answers.length !== entry.questionCount) {
    console.error('ERROR: answers.length !== questionCount'); process.exit(2);
  }

  if (VERIFY) {
    const snap = await db.doc(`quiz_keys/${QUIZ_ID}`).get();
    if (!snap.exists) { console.error(`Firestore: quiz_keys/${QUIZ_ID} does NOT exist`); process.exit(1); }
    const data = snap.data();
    console.log(`\nFirestore state:`);
    console.log(`  questionCount: ${data.questionCount}`);
    console.log(`  passingScore:  ${data.passingScore}`);
    console.log(`  answers.length: ${data.answers ? data.answers.length : 'N/A'}`);
    const match = JSON.stringify(data.answers) === JSON.stringify(entry.answers)
               && data.questionCount === entry.questionCount
               && data.passingScore === entry.passingScore;
    console.log(`\nRegistry ↔ Firestore match: ${match ? 'YES' : 'NO'}`);
    process.exit(match ? 0 : 1);
  }

  if (DRY_RUN) {
    console.log(`\n[DRY RUN] Would write to quiz_keys/${QUIZ_ID}`);
    process.exit(0);
  }

  // Backup existing state (if any) before write
  const existing = await db.doc(`quiz_keys/${QUIZ_ID}`).get();
  if (existing.exists) {
    const backup = path.join(__dirname, `backup-${QUIZ_ID}-${new Date().toISOString().slice(0,10)}.json`);
    fs.writeFileSync(backup, JSON.stringify(existing.data(), null, 2));
    console.log(`\nBacked up existing state to: ${backup}`);
  } else {
    console.log(`\nNo prior Firestore entry — fresh seed.`);
  }

  await db.doc(`quiz_keys/${QUIZ_ID}`).set(entry);
  console.log(`\n✓ Wrote quiz_keys/${QUIZ_ID}`);
}

main().catch(e => { console.error('FAILED:', e); process.exit(2); });
