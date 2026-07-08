#!/usr/bin/env node
/**
 * fix-clh-022-fixnote-2026-07-08.js
 *
 * Corrects the misattributed metadata on quiz_keys/clh-022 (Firestore AND quiz_keys.json seed source).
 * Bridget's three-way audit found the doc's `disciplineB:true` flag + `fixNote` are boilerplate wrongly
 * stamped by seed-clh-022-disciplineB-2026-05-12: clh-022 was NEVER part of that 2026-05-12 Discipline-B
 * batch (confirmed against qc49-architecture-audit-2026-05-12.md). The false note claims the key should
 * be options[1]/[1,1,1,1,1], that content verification was never done, and that 4 students passed under
 * a "broken key". ALL FALSE: [0,1,2,3,0] is the verified-correct key (Karl audit 2026-05-08 + HTML
 * explanations + Confluence 2818687), and the answers array was never actually changed. Only clh-022 is
 * affected (audited the whole collection). This ONLY rewrites the metadata narrative; answers untouched.
 *
 * --dry-run DEFAULT. Guards answers==[0,1,2,3,0] in both stores. Backs up first.
 */
const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');
if (!admin.apps.length) admin.initializeApp({ projectId: 'hexworth-prime' });
const db = admin.firestore();
const KEYS_FILE = path.join(__dirname, 'quiz_keys.json');
const LIVE = process.argv.includes('--live');
const DRY = !LIVE;

const EXPECTED = [0, 1, 2, 3, 0];
// Deep-equal check for two numeric arrays (used to guard against answer drift before any write).
const eq = (a, b) => Array.isArray(a) && Array.isArray(b) && a.length === b.length && a.every((v, i) => v === b[i]);

// The corrected, truthful note (replaces the misattributed boilerplate). No em-dashes.
const CORRECT_NOTE =
  '[CORRECTED 2026-07-08] Key [0,1,2,3,0] is the verified-correct answer key from the 2026-05-08 Rule-6 '
  + 'rebalance (commit a66cedbd1, [1,1,1,1,1] to [0,1,2,3,0]); the cycling shape is coincidental, not a '
  + 'placeholder. Verified ALL-PASS three ways: Karl Mode-2 (karl-clh-poc-rebalance-2026-05-08.md), the '
  + 'HTML inline explanations, and Confluence 2818687 (Bridget three-way audit 2026-07-08). Allowlisted in '
  + 'QUIZ-011 (see _docs/operations/clh-022-cycling-verification-2026-07-08.md). The prior disciplineB flag '
  + 'and fixNote were misattributed Discipline-B boilerplate wrongly stamped by '
  + 'seed-clh-022-disciplineB-2026-05-12; clh-022 was NEVER in that 2026-05-12 batch (per '
  + 'qc49-architecture-audit-2026-05-12.md). Its claims (key should be options[1]/[1,1,1,1,1], content '
  + 'verification never done, 4 students passed under a broken key) were ALL FALSE; the answers array was '
  + 'never actually changed.';

(async () => {
  const json = JSON.parse(fs.readFileSync(KEYS_FILE, 'utf8'));
  const jEntry = json['clh-022'] || {};
  const fsDoc = (await db.doc('quiz_keys/clh-022').get()).data() || {};

  // Guard: both stores must still hold the verified-correct answers. Abort on any drift.
  const abort = [];
  if (!eq(jEntry.answers, EXPECTED)) abort.push(`quiz_keys.json answers ${JSON.stringify(jEntry.answers)} != ${JSON.stringify(EXPECTED)}`);
  if (!eq(fsDoc.answers, EXPECTED)) abort.push(`Firestore answers ${JSON.stringify(fsDoc.answers)} != ${JSON.stringify(EXPECTED)}`);
  if (abort.length) { console.error('ABORT - drift:\n  ' + abort.join('\n  ')); process.exit(1); }

  console.log(`\n=== ${DRY ? 'DRY-RUN' : 'LIVE'} ===`);
  console.log('  REMOVE  disciplineB (currently:', jEntry.disciplineB, '/', fsDoc.disciplineB, ')');
  console.log('  SET     lastFixedAt = 2026-07-08 (was', jEntry.lastFixedAt || fsDoc.lastFixedAt, ')');
  console.log('  SET     lastFixedBy = clh-022-fixnote-correction-2026-07-08');
  console.log('  SET     fixNote = corrected note (answers/questionCount/passingScore/revealToAll UNCHANGED)');
  if (DRY) { console.log('\nDRY-RUN complete.'); process.exit(0); }

  // Backup both stores.
  fs.writeFileSync(path.join(__dirname, 'clh-022-fixnote-backup-2026-07-08.json'),
    JSON.stringify({ firestore: fsDoc, json: jEntry }, (k, v) => (v && v._seconds !== undefined ? `ts:${v._seconds}` : v), 2));

  // Correct quiz_keys.json (seed source): delete disciplineB, rewrite note + stamps. Preserve the rest.
  delete json['clh-022'].disciplineB;
  json['clh-022'].fixNote = CORRECT_NOTE;
  json['clh-022'].lastFixedAt = '2026-07-08';
  json['clh-022'].lastFixedBy = 'clh-022-fixnote-correction-2026-07-08';
  fs.writeFileSync(KEYS_FILE, JSON.stringify(json, null, 2) + '\n');

  // Correct Firestore: merge the same, delete disciplineB, stamp updatedBy/updatedAt. Answers untouched.
  await db.doc('quiz_keys/clh-022').set({
    disciplineB: admin.firestore.FieldValue.delete(),
    fixNote: CORRECT_NOTE,
    lastFixedAt: '2026-07-08',
    lastFixedBy: 'clh-022-fixnote-correction-2026-07-08',
    updatedBy: 'clh-022-fixnote-correction-2026-07-08',
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  }, { merge: true });

  console.log('\nCorrected Firestore + quiz_keys.json. backup: clh-022-fixnote-backup-2026-07-08.json');
  process.exit(0);
})().catch(e => { console.error(e.message); process.exit(1); });
