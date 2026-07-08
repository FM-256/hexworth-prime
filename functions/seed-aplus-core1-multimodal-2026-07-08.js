#!/usr/bin/env node
/**
 * seed-aplus-core1-multimodal-2026-07-08.js
 *
 * Seeds the 4 A+ Core 1 prep-quiz multi-modal answer keys (from aplus-core1-key-*.json, produced by
 * extract-aplus-core1-keys.js) into Firestore quiz_keys/{aplus-core1-prep-r1..r4} and quiz_keys.json.
 * Each key: { answers:[mc int | gui id string | {terminal:[...]}], types:[], explanations:[],
 * questionCount:10, passingScore, revealToAll:true, multiModal:true }. Pairs with the gradeQuiz
 * terminal extension. The stale wrong-ID forge- keys were already archived+removed separately.
 *
 * --dry-run DEFAULT. Backs up any existing target docs first. Guards questionCount===10.
 */
const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');
if (!admin.apps.length) admin.initializeApp({ projectId: 'hexworth-prime' });
const db = admin.firestore();
const KEYS_FILE = path.join(__dirname, 'quiz_keys.json');
const LIVE = process.argv.includes('--live');
const DRY = !LIVE;
const IDS = ['aplus-core1-prep-r1', 'aplus-core1-prep-r2', 'aplus-core1-prep-r3', 'aplus-core1-prep-r4'];

(async () => {
  const json = JSON.parse(fs.readFileSync(KEYS_FILE, 'utf8'));
  // Load each extracted key file and validate its shape (must be the full 10-question multi-modal form).
  const keys = {};
  for (const id of IDS) {
    const f = path.join(__dirname, `aplus-core1-key-${id}.json`);
    if (!fs.existsSync(f)) { console.error(`missing ${f} - run extract-aplus-core1-keys.js first`); process.exit(1); }
    const k = JSON.parse(fs.readFileSync(f, 'utf8'));
    if (k.questionCount !== 10 || k.answers.length !== 10 || k.types.length !== 10) {
      console.error(`${id}: bad shape (qc=${k.questionCount}, answers=${k.answers.length}, types=${k.types.length})`); process.exit(1);
    }
    keys[id] = k;
  }

  // Preview what will be written (one line per key) so it can be eyeballed before a live run.
  console.log(`\n=== ${DRY ? 'DRY-RUN' : 'LIVE'} — seed 4 multi-modal keys ===`);
  for (const id of IDS) {
    const k = keys[id];
    console.log(`  ${id}: ${k.questionCount}q types=${k.types.join(',')} passingScore=${k.passingScore} revealToAll=${k.revealToAll}`);
  }
  if (DRY) { console.log('\nDRY-RUN complete.'); process.exit(0); }

  // Backup any existing target docs.
  const backup = {};
  for (const id of IDS) { const s = await db.doc(`quiz_keys/${id}`).get(); backup[id] = s.exists ? s.data() : null; }
  fs.writeFileSync(path.join(__dirname, 'aplus-core1-multimodal-backup-2026-07-08.json'), JSON.stringify(backup, null, 2));

  // Write each key to Firestore (merge) and mirror into the quiz_keys.json seed source.
  for (const id of IDS) {
    json[id] = keys[id];
    await db.doc(`quiz_keys/${id}`).set(keys[id], { merge: true });
  }
  fs.writeFileSync(KEYS_FILE, JSON.stringify(json, null, 2) + '\n');
  console.log(`\nseeded ${IDS.length} keys to Firestore + quiz_keys.json. Live gradeQuiz smoke next.`);
  process.exit(0);
})().catch(e => { console.error(e.message); process.exit(1); });
