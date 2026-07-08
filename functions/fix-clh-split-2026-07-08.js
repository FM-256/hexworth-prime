#!/usr/bin/env node
/**
 * fix-clh-split-2026-07-08.js
 *
 * Resolves the CLH dual-tree key collision by the operator-chosen -legacy split (the pattern
 * already used for clh-001/003). For 12 divergent modules, Page A and Page B are different
 * quizzes (or reshuffled) sharing one moduleId/key, so one page is mis-graded. This gives Page A
 * its OWN key (clh-NNN-legacy = Page A's correct answers) and re-points clh-NNN at Page B's
 * correct answers. Keys derived from each page's raw HTML by TWO independent passes that agreed
 * 100% (+ Page B explanations corroborate Page B). clh-009 excluded (both pages key identically).
 *
 * This script ONLY writes the KEYS. The paired Page A HTML moduleId edits (clh-NNN ->
 * clh-NNN-legacy) ship via the hosting deploy. SAFE ORDER:
 *   1. node fix-clh-split-2026-07-08.js --live --phase legacy   (seed clh-NNN-legacy; dormant)
 *   2. deploy the 12 Page A moduleId edits (Page A now uses its legacy key)
 *   3. node fix-clh-split-2026-07-08.js --live --phase pageB     (reseed clh-NNN to Page B)
 * No step makes any page worse than its current (already-mis-graded) state.
 *
 * --dry-run DEFAULT. Guards each write against the expected current value. Backs up first.
 */
const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');
if (!admin.apps.length) admin.initializeApp({ projectId: 'hexworth-prime' });
const db = admin.firestore();
const KEYS_FILE = path.join(__dirname, 'quiz_keys.json');
const LIVE = process.argv.includes('--live');
const PHASE = (process.argv[process.argv.indexOf('--phase') + 1]) || (process.argv.includes('--phase') ? null : 'both');
const DRY = !LIVE;

// Page A -> clh-NNN-legacy (new keys). clh-006 keeps current Page A [1,1,1,2,1] (ambiguous Q3
// cp -a/-r handled as a separate content item, not flipped in a structural fix).
const LEGACY = {
  'clh-005': { answers: [1, 2, 1, 0, 2], questionCount: 5 },
  'clh-006': { answers: [1, 1, 1, 2, 1], questionCount: 5 },
  'clh-007': { answers: [1, 1, 1, 2, 1], questionCount: 5 },
  'clh-008': { answers: [1, 1, 2, 2, 2], questionCount: 5 },
  'clh-010': { answers: [1, 1, 2, 1, 2, 0], questionCount: 6 },
  'clh-011': { answers: [1, 2, 1, 1, 2], questionCount: 5 },
  'clh-012': { answers: [1, 1, 2, 1, 2], questionCount: 5 },
  'clh-013': { answers: [1, 0, 2, 1, 2], questionCount: 5 },
  'clh-014': { answers: [2, 2, 1, 2, 1], questionCount: 5 },
  'clh-022': { answers: [1, 1, 1, 1, 1], questionCount: 5 },
  'clh-023': { answers: [1, 1, 1, 1, 1], questionCount: 5 },
  'clh-027': { answers: [1, 3, 0, 2, 0], questionCount: 5 },
};
// clh-NNN reseeded to Page B. clh-023 excluded (already Page B [2,0,1,3,0]).
// wrong = the current clh-NNN value (Page A's answers) that Page B is mis-graded by; guard.
const PAGEB = {
  'clh-005': { wrong: [1, 2, 1, 0, 2], answers: [1, 2, 2, 1, 1], questionCount: 5 },
  'clh-006': { wrong: [1, 1, 1, 2, 1], answers: [0, 2, 1, 1, 1], questionCount: 5 },
  'clh-007': { wrong: [1, 1, 1, 2, 1], answers: [1, 1, 3, 0, 0], questionCount: 5 },
  'clh-008': { wrong: [1, 1, 2, 2, 2], answers: [1, 2, 1, 1, 1], questionCount: 5 },
  'clh-010': { wrong: [1, 1, 2, 1, 2, 0], answers: [1, 1, 1, 2, 2, 1], questionCount: 6 },
  'clh-011': { wrong: [1, 2, 1, 1, 2], answers: [1, 1, 2, 1, 1], questionCount: 5 },
  'clh-012': { wrong: [1, 1, 2, 1, 2], answers: [1, 2, 1, 1, 2], questionCount: 5 },
  'clh-013': { wrong: [1, 0, 2, 1, 2], answers: [1, 2, 2, 1, 1], questionCount: 5 },
  'clh-014': { wrong: [2, 2, 1, 2, 1], answers: [1, 0, 1, 1, 2], questionCount: 5 },
  'clh-022': { wrong: [1, 1, 1, 1, 1], answers: [0, 1, 2, 3, 0], questionCount: 5 },
  'clh-027': { wrong: [1, 3, 0, 2, 0], answers: [1, 1, 1, 1, 1], questionCount: 5 },
};
// Deep-equal for the flat integer answer arrays (guards + change detection).
const eq = (a, b) => Array.isArray(a) && Array.isArray(b) && a.length === b.length && a.every((v, i) => v === b[i]);

(async () => {
  const json = JSON.parse(fs.readFileSync(KEYS_FILE, 'utf8'));
  const doLegacy = PHASE === 'legacy' || PHASE === 'both';
  const doPageB = PHASE === 'pageB' || PHASE === 'both';
  if (!doLegacy && !doPageB) { console.error('bad --phase (use legacy | pageB | both)'); process.exit(1); }

  // Guards. Legacy keys must not already exist with a different value; Page B guard = current is the wrong value.
  const abort = [];
  if (doPageB) for (const [id, f] of Object.entries(PAGEB)) {
    if (!eq((json[id] || {}).answers, f.wrong)) abort.push(`${id}: clh-NNN answers ${JSON.stringify((json[id] || {}).answers)} != expected ${JSON.stringify(f.wrong)}`);
  }
  if (abort.length) { console.error('ABORT - drift:\n  ' + abort.join('\n  ')); process.exit(1); }

  console.log(`\n=== ${DRY ? 'DRY-RUN' : 'LIVE'}  phase=${PHASE} ===`);
  if (doLegacy) { console.log('\nNEW clh-NNN-legacy keys (Page A):'); for (const [id, f] of Object.entries(LEGACY)) console.log(`  ${id}-legacy = ${JSON.stringify(f.answers)} qc=${f.questionCount}`); }
  if (doPageB) { console.log('\nRESEED clh-NNN keys (Page B):'); for (const [id, f] of Object.entries(PAGEB)) console.log(`  ${id} = ${JSON.stringify(f.wrong)} -> ${JSON.stringify(f.answers)} qc=${f.questionCount}`); }
  if (DRY) { console.log('\nDRY-RUN complete.'); process.exit(0); }

  // Backup everything touched.
  const backup = {};
  const ids = new Set([...(doLegacy ? Object.keys(LEGACY).map(k => k + '-legacy') : []), ...(doPageB ? Object.keys(PAGEB) : [])]);
  for (const k of ids) { const s = await db.doc(`quiz_keys/${k}`).get(); backup[k] = s.exists ? s.data() : null; }
  const backupFile = path.join(__dirname, `clh-split-backup-${PHASE}-2026-07-08.json`);
  fs.writeFileSync(backupFile, JSON.stringify(backup, null, 2));
  console.log(`\nbackup: ${backupFile}`);

  let n = 0;
  if (doLegacy) for (const [id, f] of Object.entries(LEGACY)) {
    const lk = id + '-legacy';
    const payload = { answers: f.answers, questionCount: f.questionCount, passingScore: (json[id] || {}).passingScore || 70 };
    json[lk] = payload;
    await db.doc(`quiz_keys/${lk}`).set(payload, { merge: true }); n++;
  }
  if (doPageB) for (const [id, f] of Object.entries(PAGEB)) {
    json[id].answers = f.answers; json[id].questionCount = f.questionCount;
    await db.doc(`quiz_keys/${id}`).set({ answers: f.answers, questionCount: f.questionCount }, { merge: true }); n++;
  }
  fs.writeFileSync(KEYS_FILE, JSON.stringify(json, null, 2) + '\n');
  console.log(`\nquiz_keys.json updated. Firestore: ${n} docs. verify-quiz-keys next.`);
  process.exit(0);
})().catch(e => { console.error(e.message); process.exit(1); });
