#!/usr/bin/env node
/**
 * fix-clh-grading-2026-07-08.js
 *
 * Fixes the CLH grading bug found 2026-07-08:
 *   (1) 11 quizzes whose Firestore/JSON answer key marks the WRONG option
 *       (seed-order drift + a clh-022 key regression after the 2026-05-08 rebalance).
 *   (2) Adds revealToAll:true to the CLH module quizzes so the post-submission review
 *       shows the correct answer to EVERY student (formative learning check), pairing
 *       with the QuizEngine review-render fix shipped in the same batch.
 *
 * Corrected answers were derived from each question's CURRENT HTML options + its own
 * explanation (objective Linux/security facts) and independently cross-checked.
 *
 * SAFETY:
 *   - --dry-run (DEFAULT unless --live) writes NOTHING; prints the full before/after diff.
 *   - Each of the 11 corrections is guarded by its KNOWN-WRONG current value; if the JSON
 *     no longer matches the expected-wrong value, the script ABORTS (refuses to seed
 *     unverified state), mirroring seed-clh-poc-rebalance-2026-05-08.js.
 *   - Before any Firestore write it backs up the current CLH keys to a timestamped file.
 *   - Updates functions/quiz_keys.json (the seed source) so the fix is durable and a
 *     future reseed will not revert it.
 *
 * Usage (from functions/):
 *   node fix-clh-grading-2026-07-08.js --dry-run     # preview, no writes (default)
 *   node fix-clh-grading-2026-07-08.js --live        # PROD WRITE (gated: master + operator OK)
 *
 * After --live: node verify-quiz-keys.js clh-005 clh-006 clh-007 clh-008 clh-010 \
 *   clh-011 clh-012 clh-013 clh-014 clh-022 clh-027   then ./deploy.sh
 */

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

if (!admin.apps.length) admin.initializeApp({ projectId: 'hexworth-prime' });
const db = admin.firestore();

const KEYS_FILE = path.join(__dirname, 'quiz_keys.json');
const LIVE = process.argv.includes('--live');
const DRY = !LIVE;

// The 11 corrections: id -> { wrong: <expected current value>, correct: <verified fix> }.
// `wrong` is a guard: if the current JSON differs, abort (state drifted from what we verified).
const CORRECTIONS = {
  'clh-005': { wrong: [1, 2, 1, 0, 2], correct: [1, 2, 2, 1, 1] },
  'clh-006': { wrong: [1, 1, 1, 2, 1], correct: [0, 2, 1, 1, 1] },
  'clh-007': { wrong: [1, 1, 1, 2, 1], correct: [1, 1, 3, 0, 0] },
  'clh-008': { wrong: [1, 1, 2, 2, 2], correct: [1, 2, 1, 1, 1] },
  'clh-010': { wrong: [1, 1, 2, 1, 2, 0], correct: [1, 1, 1, 2, 2, 1] },
  'clh-011': { wrong: [1, 2, 1, 1, 2], correct: [1, 1, 2, 1, 1] },
  'clh-012': { wrong: [1, 1, 2, 1, 2], correct: [1, 2, 1, 1, 2] },
  'clh-013': { wrong: [1, 0, 2, 1, 2], correct: [1, 2, 2, 1, 1] },
  'clh-014': { wrong: [2, 2, 1, 2, 1], correct: [1, 0, 1, 1, 2] },  // Q2 getopts "o:vh" = idx0 (Bridget catch; old key AND first-pass both had wrong idx2)
  'clh-022': { wrong: [1, 1, 1, 1, 1], correct: [0, 1, 2, 3, 0] },
  'clh-027': { wrong: [1, 3, 0, 2, 0], correct: [1, 1, 1, 1, 1] },
};

// revealToAll:true is applied to every CLH module quiz key that exists (formative reveal).
const REVEAL_IDS = Array.from({ length: 31 }, (_, i) => 'clh-' + String(i + 1).padStart(3, '0'));

const eq = (a, b) => Array.isArray(a) && Array.isArray(b) && a.length === b.length && a.every((v, i) => v === b[i]);

(async () => {
  const json = JSON.parse(fs.readFileSync(KEYS_FILE, 'utf8'));

  // 1. Guard: every correction's current JSON value must equal the expected-wrong value.
  const abort = [];
  for (const [id, { wrong }] of Object.entries(CORRECTIONS)) {
    const cur = (json[id] || {}).answers;
    if (!eq(cur, wrong)) abort.push(`${id}: expected-wrong ${JSON.stringify(wrong)} but JSON has ${JSON.stringify(cur)}`);
  }
  if (abort.length) {
    console.error('ABORT - JSON drifted from the verified-wrong baseline; refusing to seed:\n  ' + abort.join('\n  '));
    process.exit(1);
  }

  // 2. Show the plan.
  console.log(`\n=== ${DRY ? 'DRY-RUN (no writes)' : 'LIVE WRITE'} ===`);
  console.log('\nAnswer-key corrections (11):');
  for (const [id, { wrong, correct }] of Object.entries(CORRECTIONS)) {
    console.log(`  ${id}: ${JSON.stringify(wrong)} -> ${JSON.stringify(correct)}`);
  }
  const revealTargets = REVEAL_IDS.filter(id => json[id]);
  const revealNew = revealTargets.filter(id => !json[id].revealToAll);
  console.log(`\nrevealToAll:true on CLH keys: ${revealTargets.length} exist, ${revealNew.length} newly set`);
  console.log(`  (missing keys, skipped: ${REVEAL_IDS.filter(id => !json[id]).join(', ') || 'none'})`);

  if (DRY) { console.log('\nDRY-RUN complete. Re-run with --live (master + operator authorization) to write.'); process.exit(0); }

  // 3. Backup current Firestore CLH keys before writing.
  const backup = {};
  for (const id of new Set([...Object.keys(CORRECTIONS), ...revealTargets])) {
    const s = await db.doc(`quiz_keys/${id}`).get();
    backup[id] = s.exists ? s.data() : null;
  }
  const backupFile = path.join(__dirname, 'clh-keys-backup-2026-07-08.json');
  fs.writeFileSync(backupFile, JSON.stringify(backup, null, 2));
  console.log(`\nFirestore backup written: ${backupFile}`);

  // 4. Apply corrections + revealToAll to the JSON source, then persist it.
  for (const [id, { correct }] of Object.entries(CORRECTIONS)) json[id].answers = correct;
  for (const id of revealTargets) json[id].revealToAll = true;
  fs.writeFileSync(KEYS_FILE, JSON.stringify(json, null, 2) + '\n');
  console.log(`quiz_keys.json updated (source of truth).`);

  // 5. Seed Firestore (merge: preserve any other fields).
  let writes = 0;
  for (const id of new Set([...Object.keys(CORRECTIONS), ...revealTargets])) {
    const payload = {};
    if (CORRECTIONS[id]) payload.answers = CORRECTIONS[id].correct;
    if (revealTargets.includes(id)) payload.revealToAll = true;
    await db.doc(`quiz_keys/${id}`).set(payload, { merge: true });
    writes++;
  }
  console.log(`\nFirestore: ${writes} quiz_keys docs updated (merge).`);
  console.log('Next: node verify-quiz-keys.js <the 11 ids>  then  ./deploy.sh');
  process.exit(0);
})().catch(e => { console.error(e.message); process.exit(1); });
