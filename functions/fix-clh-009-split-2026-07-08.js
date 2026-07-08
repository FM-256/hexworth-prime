#!/usr/bin/env node
/**
 * fix-clh-009-split-2026-07-08.js
 *
 * Completes the CLH dual-tree split for clh-009, which fix-clh-split-2026-07-08.js wrongly excluded
 * on the belief "both pages key identically." clh-divergence.js shows clh-009's two pages are
 * entirely DIFFERENT quizzes (Page A: cut/sort/uniq/awk/sed text-processing; Page B: shadow/usermod/
 * systemctl/cron/w sysadmin). Deriving each page independently, BOTH resolve to the same index array
 * [1,1,1,2,1] by coincidence, so the shared key grades both correctly TODAY and clh-009 is NOT
 * currently mis-grading. But relying on that coincidence is a latent trap: any future edit to either
 * page silently breaks grading. This gives Page A its own key (clh-009-legacy = [1,1,1,2,1]) and
 * leaves clh-009 = [1,1,1,2,1] for Page B, matching the other 12 splits. Functionally a no-op today,
 * structurally correct going forward.
 *
 * Paired with the Page A HTML moduleId edit (clh-009 -> clh-009-legacy), which ships via hosting.
 * SAFE ORDER: seed clh-009-legacy (dormant, identical value) FIRST, then deploy the Page A edit.
 *
 * --dry-run DEFAULT. Guards that clh-009 currently = [1,1,1,2,1]. Backs up first.
 */
const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');
if (!admin.apps.length) admin.initializeApp({ projectId: 'hexworth-prime' });
const db = admin.firestore();
const KEYS_FILE = path.join(__dirname, 'quiz_keys.json');
const LIVE = process.argv.includes('--live');
const DRY = !LIVE;

const EXPECTED = [1, 1, 1, 2, 1];   // both Page A and Page B derive to this
const eq = (a, b) => Array.isArray(a) && Array.isArray(b) && a.length === b.length && a.every((v, i) => v === b[i]);

(async () => {
  const json = JSON.parse(fs.readFileSync(KEYS_FILE, 'utf8'));
  // Guard: clh-009 must currently hold the coincident array; abort on any drift.
  if (!eq((json['clh-009'] || {}).answers, EXPECTED)) {
    console.error(`ABORT - clh-009 answers ${JSON.stringify((json['clh-009'] || {}).answers)} != expected ${JSON.stringify(EXPECTED)}`);
    process.exit(1);
  }
  const payload = { answers: EXPECTED, questionCount: 5, passingScore: (json['clh-009'] || {}).passingScore || 70 };
  console.log(`\n=== ${DRY ? 'DRY-RUN' : 'LIVE'} ===`);
  console.log(`  seed clh-009-legacy = ${JSON.stringify(payload)}`);
  console.log(`  clh-009 (Page B) unchanged = ${JSON.stringify((json['clh-009'] || {}).answers)}`);
  if (DRY) { console.log('\nDRY-RUN complete.'); process.exit(0); }

  // Backup the target key (should not exist yet).
  const s = await db.doc('quiz_keys/clh-009-legacy').get();
  fs.writeFileSync(path.join(__dirname, 'clh-009-legacy-backup-2026-07-08.json'), JSON.stringify({ 'clh-009-legacy': s.exists ? s.data() : null }, null, 2));

  json['clh-009-legacy'] = payload;
  await db.doc('quiz_keys/clh-009-legacy').set(payload, { merge: true });
  fs.writeFileSync(KEYS_FILE, JSON.stringify(json, null, 2) + '\n');
  console.log('\nseeded clh-009-legacy. quiz_keys.json updated. verify-quiz-keys next.');
  process.exit(0);
})().catch(e => { console.error(e.message); process.exit(1); });
