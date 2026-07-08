#!/usr/bin/env node
/**
 * fix-clh-layerA-grading-2026-07-08.js
 *
 * Corrects the THREE CLH quiz keys that are wrong for LAYER A (the student-served quizzes,
 * _app/houses/script/clh/script-clh-NNN.quiz.html). Derived + verified against Layer A raw
 * HTML (objective Linux fact), NOT Layer B. Supersedes the reverted, disabled
 * fix-clh-grading-2026-07-08.js (which used the orphaned Layer B tree).
 *
 *   clh-001: key/questionCount were built for Layer B's 6 Qs; Layer A has 5. Q5 also mis-keyed.
 *   clh-003: key/questionCount were built for Layer B's 5 Qs; Layer A has 6. Q2 + Q5 mis-keyed.
 *   clh-023: 4 of 5 answers wrong for Layer A (enable=boot, journalctl -u, list-units, persistence).
 *
 * Does NOT touch revealToAll. The review-area reveal is coupled to the QuizEngine render fix
 * (commit a51f98d0a), which is undeployed and needs a headless-Chrome pass first (separate batch).
 *
 * SAFETY: --dry-run DEFAULT (writes nothing). Each fix is guarded by its known-wrong current
 * value + current questionCount; aborts on any drift. Backs up Firestore before writing.
 * Updates quiz_keys.json (source) + Firestore (merge answers + questionCount).
 *
 * Usage (from functions/):
 *   node fix-clh-layerA-grading-2026-07-08.js --dry-run   # preview (default)
 *   node fix-clh-layerA-grading-2026-07-08.js --live      # PROD write (master + operator OK + Chris PASS)
 * After --live: node verify-quiz-keys.js clh-001 clh-003 clh-023
 */
// DISABLED 2026-07-08 (Chris BLOCK #2). Superseded: clh-001/003 use SEPARATE -legacy keys for
// Page A (already correct, no fix needed), and clh-023 shares one key with two divergent pages
// (Page A vs Page B different option order) that a value patch cannot fix. This is a dual-tree
// architectural collision (13 divergent modules) awaiting an operator decision, NOT a value patch.
console.error('DISABLED: dual-tree collision; a key-value patch cannot fix it. See QC_NOTES.');
process.exit(1);

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');
if (!admin.apps.length) admin.initializeApp({ projectId: 'hexworth-prime' });
const db = admin.firestore();

const KEYS_FILE = path.join(__dirname, 'quiz_keys.json');
const LIVE = process.argv.includes('--live');
const DRY = !LIVE;

// id -> { wrongAns, wrongQC (guards), ans, qc (verified Layer A fix) }
const FIX = {
  'clh-001': { wrongAns: [1, 1, 1, 1, 2, 1], wrongQC: 6, ans: [1, 1, 1, 1, 1], qc: 5 },
  'clh-003': { wrongAns: [1, 2, 2, 1, 2], wrongQC: 5, ans: [1, 1, 2, 1, 1, 1], qc: 6 },
  'clh-023': { wrongAns: [2, 0, 1, 3, 0], wrongQC: 5, ans: [1, 1, 1, 1, 1], qc: 5 },
};
const eq = (a, b) => Array.isArray(a) && Array.isArray(b) && a.length === b.length && a.every((v, i) => v === b[i]);

(async () => {
  const json = JSON.parse(fs.readFileSync(KEYS_FILE, 'utf8'));
  // Guard: current JSON must match the known-wrong baseline (answers + questionCount).
  const abort = [];
  for (const [id, f] of Object.entries(FIX)) {
    const e = json[id] || {};
    if (!eq(e.answers, f.wrongAns)) abort.push(`${id}: answers ${JSON.stringify(e.answers)} != expected-wrong ${JSON.stringify(f.wrongAns)}`);
    if (e.questionCount !== f.wrongQC) abort.push(`${id}: questionCount ${e.questionCount} != expected-wrong ${f.wrongQC}`);
  }
  if (abort.length) { console.error('ABORT - drifted from verified-wrong baseline:\n  ' + abort.join('\n  ')); process.exit(1); }

  console.log(`\n=== ${DRY ? 'DRY-RUN (no writes)' : 'LIVE WRITE'} ===`);
  for (const [id, f] of Object.entries(FIX)) {
    console.log(`  ${id}: answers ${JSON.stringify(f.wrongAns)} -> ${JSON.stringify(f.ans)} | questionCount ${f.wrongQC} -> ${f.qc}`);
  }
  if (DRY) { console.log('\nDRY-RUN complete. Re-run with --live (master + operator OK + Chris PASS) to write.'); process.exit(0); }

  // Backup current Firestore docs.
  const backup = {};
  for (const id of Object.keys(FIX)) { const s = await db.doc(`quiz_keys/${id}`).get(); backup[id] = s.exists ? s.data() : null; }
  const backupFile = path.join(__dirname, 'clh-layerA-keys-backup-2026-07-08.json');
  fs.writeFileSync(backupFile, JSON.stringify(backup, null, 2));
  console.log(`\nFirestore backup: ${backupFile}`);

  // Apply to JSON source + persist.
  for (const [id, f] of Object.entries(FIX)) { json[id].answers = f.ans; json[id].questionCount = f.qc; }
  fs.writeFileSync(KEYS_FILE, JSON.stringify(json, null, 2) + '\n');
  console.log('quiz_keys.json updated.');

  // Seed Firestore (merge answers + questionCount).
  let n = 0;
  for (const [id, f] of Object.entries(FIX)) { await db.doc(`quiz_keys/${id}`).set({ answers: f.ans, questionCount: f.qc }, { merge: true }); n++; }
  console.log(`\nFirestore: ${n} docs updated. Next: node verify-quiz-keys.js clh-001 clh-003 clh-023`);
  process.exit(0);
})().catch(e => { console.error(e.message); process.exit(1); });
