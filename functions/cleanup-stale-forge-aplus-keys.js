#!/usr/bin/env node
/**
 * cleanup-stale-forge-aplus-keys.js
 *
 * Archives then removes the stale, wrong-ID A+ Core 1 quiz keys left by an abandoned 2026-03-18
 * attempt (seed-aplus-core1-keys.js): quiz_keys/forge-aplus-core1-prep-r1..r4. These use the wrong
 * moduleId (live quizzes are aplus-core1-prep-r*, no forge- prefix) and hold only 4 MC answers with
 * questionCount:4, so they are orphaned (no quiz references them) and would confuse the new
 * multi-modal seed. Per the "never destroy" rule: archive both stores to a JSON file FIRST, then
 * remove from quiz_keys.json and delete the Firestore docs. Guarded to touch ONLY these 4 ids and
 * only if they still match the known-stale shape (questionCount:4).
 *
 * --dry-run DEFAULT.
 */
const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');
if (!admin.apps.length) admin.initializeApp({ projectId: 'hexworth-prime' });
const db = admin.firestore();
const KEYS_FILE = path.join(__dirname, 'quiz_keys.json');
const LIVE = process.argv.includes('--live');
const DRY = !LIVE;
const IDS = ['forge-aplus-core1-prep-r1', 'forge-aplus-core1-prep-r2', 'forge-aplus-core1-prep-r3', 'forge-aplus-core1-prep-r4'];

(async () => {
  const json = JSON.parse(fs.readFileSync(KEYS_FILE, 'utf8'));
  const archive = { json: {}, firestore: {} };
  const abort = [];
  for (const id of IDS) {
    archive.json[id] = json[id] || null;
    const snap = await db.doc(`quiz_keys/${id}`).get();
    archive.firestore[id] = snap.exists ? snap.data() : null;
    // Guard: only proceed if this is the known-stale 4-question shape (never touch a real key).
    const qc = (json[id] || {}).questionCount ?? (archive.firestore[id] || {}).questionCount;
    if (qc !== undefined && qc !== 4) abort.push(`${id}: questionCount=${qc} (expected 4) - refusing to touch`);
  }
  if (abort.length) { console.error('ABORT:\n  ' + abort.join('\n  ')); process.exit(1); }

  console.log(`\n=== ${DRY ? 'DRY-RUN' : 'LIVE'} — archive + remove stale forge- keys ===`);
  for (const id of IDS) console.log(`  ${id}: json=${JSON.stringify(archive.json[id])} firestore=${archive.firestore[id] ? 'exists' : 'absent'}`);
  if (DRY) { console.log('\nDRY-RUN complete.'); process.exit(0); }

  // Archive first (never destroy).
  const archiveFile = path.join(__dirname, 'aplus-core1-stale-forge-keys-archive-2026-07-08.json');
  fs.writeFileSync(archiveFile, JSON.stringify(archive, null, 2));
  console.log(`\narchived: ${archiveFile}`);

  // Remove from quiz_keys.json + delete Firestore docs.
  for (const id of IDS) {
    delete json[id];
    await db.doc(`quiz_keys/${id}`).delete();
  }
  fs.writeFileSync(KEYS_FILE, JSON.stringify(json, null, 2) + '\n');
  console.log(`removed ${IDS.length} stale keys from quiz_keys.json + Firestore.`);
  process.exit(0);
})().catch(e => { console.error(e.message); process.exit(1); });
