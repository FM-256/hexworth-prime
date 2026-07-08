#!/usr/bin/env node
/**
 * fix-clh-reveal-2026-07-08.js
 *
 * Enables the post-submission answer review for CLH quizzes by setting a reveal field on every CLH
 * quiz answer key (both the served Page A `-legacy` keys and the Page B `clh-NNN` keys). Pairs with
 * the QuizEngine render fix (commit a51f98d0a, browser-render verified) that consumes the revealed
 * `correctAnswer` + `explanation` and highlights the correct option in the review screen.
 *
 * gradeQuiz (functions/index.js ~1644) reveals correctAnswer+explanation when
 * `passed || keyData.revealToAll || revealForReview(reviewAfterFails)`. Without a reveal field a
 * FAILING student sees no correct answer.
 *
 * THREE-WAY SPLIT (per Nancy's adversarial review):
 *   - revealToAll: true       on formative module quizzes (every student sees answers post-submit;
 *                             matches the 74 existing WSA/ALA formative keys).
 *   - reviewAfterFails: 2     on the two CAPSTONES clh-015 ("Final exam ... CLI Engineer
 *                             certification") and clh-031 ("Final Boss", passingScore 80). These are
 *                             gated/high-stakes with retakes; revealing the full key on attempt 1
 *                             would enable memorization-pass. reviewAfterFails matches the existing
 *                             matrix-ala-final / matrix-ala-midterm pattern.
 * clh-009 + clh-009-legacy ARE included in revealToAll: both pages derive to the identical index
 * array [1,1,1,2,1], so the reveal is correct for both (verified against both live pages).
 *
 * --dry-run DEFAULT. Backs up every touched key first. Only ADDS the reveal field (merge); never
 * touches answers/questionCount/passingScore.
 */
const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');
if (!admin.apps.length) admin.initializeApp({ projectId: 'hexworth-prime' });
const db = admin.firestore();
const KEYS_FILE = path.join(__dirname, 'quiz_keys.json');
const LIVE = process.argv.includes('--live');
const DRY = !LIVE;

// Capstones get reviewAfterFails instead of revealToAll (memorization-cheating guard).
const CAPSTONES = new Set(['clh-015', 'clh-031']);
const REVIEW_AFTER_FAILS = 2;

(async () => {
  const json = JSON.parse(fs.readFileSync(KEYS_FILE, 'utf8'));
  // Every CLH quiz key: base (clh-NNN) + -legacy variants (both pages are student-served).
  const ids = Object.keys(json).filter(k => /^clh-\d+(-legacy)?$/.test(k)).sort();
  const reveal = ids.filter(k => !CAPSTONES.has(k));   // -legacy variants of capstones don't exist; base only
  const gated = ids.filter(k => CAPSTONES.has(k));

  console.log(`\n=== ${DRY ? 'DRY-RUN' : 'LIVE'}  keys=${ids.length} ===`);
  console.log(`  revealToAll (${reveal.length}): ${reveal.join(' ')}`);
  console.log(`  reviewAfterFails=${REVIEW_AFTER_FAILS} (${gated.length}): ${gated.join(' ')}`);
  if (DRY) { console.log('\nDRY-RUN complete.'); process.exit(0); }

  // Backup every touched key.
  const backup = {};
  for (const k of ids) { const s = await db.doc(`quiz_keys/${k}`).get(); backup[k] = s.exists ? s.data() : null; }
  fs.writeFileSync(path.join(__dirname, 'clh-reveal-backup-2026-07-08.json'), JSON.stringify(backup, null, 2));
  console.log('\nbackup: clh-reveal-backup-2026-07-08.json');

  let n = 0;
  for (const k of reveal) { const f = { revealToAll: true }; Object.assign(json[k], f); await db.doc(`quiz_keys/${k}`).set(f, { merge: true }); n++; }
  for (const k of gated) { const f = { reviewAfterFails: REVIEW_AFTER_FAILS }; Object.assign(json[k], f); await db.doc(`quiz_keys/${k}`).set(f, { merge: true }); n++; }
  fs.writeFileSync(KEYS_FILE, JSON.stringify(json, null, 2) + '\n');
  console.log(`\nquiz_keys.json updated. Firestore: ${n} docs (${reveal.length} revealToAll + ${gated.length} reviewAfterFails).`);
  process.exit(0);
})().catch(e => { console.error(e.message); process.exit(1); });
