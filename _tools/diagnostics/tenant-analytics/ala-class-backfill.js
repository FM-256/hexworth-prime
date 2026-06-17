/**
 * ALA (adv-linux) class-progress backfill — recovers existing ALA progress that lives only in
 * each student's localStorage mirror (users/{uid}/sync/localStorage) and surfaces it in the
 * tenant class progress doc that the instructor analytics reads.
 *
 * WHY: most ALA students sync module/quiz completions to the class doc normally, but some
 * students' work (a passed quiz, and the gamified flag-capture LABS) only ever reached the
 * localStorage mirror and was never converted to the flat modulesCompleted[]/quizScores{}/
 * labsCompleted[] the class doc + analytics expect — so they show 0% despite real work.
 * Surfaced 2026-06-17 from "Ro B 0% across". See reference_analytics_silo_architecture.
 *
 * SAFETY (operator hard gate — do not weaken):
 *   - DRY RUN by default. Writes ONLY with --apply.
 *   - --apply first writes a full BACKUP of every ALA class progress doc to a timestamped
 *     JSON file under ./backups/ before touching anything.
 *   - ADD-ONLY: modulesCompleted / labsCompleted via arrayUnion (never removes); quizScores
 *     only sets keys that are ABSENT (never overwrites an existing score). Nothing is deleted.
 *   - Idempotent / re-runnable: a second run with no new mirror data writes nothing.
 *   - Reads users/{uid} + the localStorage mirror READ-ONLY; never modifies source records.
 *   - LABS are written to labsCompleted ONLY (a separate field the current compute does NOT
 *     count) — so this backfill changes NO student's displayed percentage. Whether labs COUNT
 *     toward completion is a separate map/denominator decision, intentionally not made here.
 *   - A lab counts as completed ONLY if the student actually found >=1 flag (a key with score
 *     but zero flagsFound is an attempt, not a completion, and is NOT credited).
 *
 * USAGE (run from functions/ so firebase-admin resolves):
 *   NODE_PATH="$PWD/node_modules" node ../_tools/diagnostics/tenant-analytics/ala-class-backfill.js          # dry run
 *   NODE_PATH="$PWD/node_modules" node ../_tools/diagnostics/tenant-analytics/ala-class-backfill.js --apply  # writes (gated)
 */
const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');

const TCLASS = 'tenants/summer-2026/classes/ujIeZwa0KAb4x3Um7LUn';
const APPLY = process.argv.includes('--apply');

// Map ids = the analytics denominator (modules/quizzes). Loaded so we only backfill COUNTABLE
// items that legitimately belong to this course (never foreign cross-course ids from the mirror).
global.ADV_LINUX_MAP = null;
eval(fs.readFileSync(path.join(__dirname, '../../../_app/tenant/adv-linux-map.js'), 'utf8'));
const MAP_IDS = new Set();
ADV_LINUX_MAP.chapters.forEach(c => c.items.forEach(i => MAP_IDS.add(i.id)));

const J = (mirror, k) => { try { return JSON.parse(mirror[k] || 'null'); } catch (e) { return null; } };

/** Pull every completed content id from a mirror, across all known shapes. */
function completedFromMirror(mirror) {
  const done = new Set();
  const qs = J(mirror, 'hexworth_quiz_scores') || {};
  Object.keys(qs).forEach(k => { if (qs[k] && qs[k].passed) done.add(k); });
  const prog = J(mirror, 'hexworth_progress') || {};
  if (prog.houses) Object.values(prog.houses).forEach(h => {
    (h.modulesCompleted || []).forEach(id => done.add(id));
    (h.quizzesPassed || []).forEach(id => done.add(id));
  });
  (prog.completedModules || []).forEach(id => done.add(id));
  Object.keys(prog).forEach(k => { if (prog[k] && typeof prog[k] === 'object' && prog[k].completed) done.add(k); });
  return done;
}

/** Labs the student genuinely completed (>=1 flag found). Returns normalized ala-* lab ids. */
function completedLabs(mirror) {
  const labs = [];
  Object.keys(mirror).forEach(k => {
    const m = k.match(/^hexworth_lab_(ala_[a-z0-9]+)$/);
    if (!m) return;
    let v; try { v = JSON.parse(mirror[k]); } catch (e) { v = null; }
    const flags = (v && Array.isArray(v.flagsFound)) ? v.flagsFound.length : 0;
    if (flags > 0) labs.push(m[1].replace('ala_', 'ala-')); // ala_l01 -> ala-l01, ala_hunt1 -> ala-hunt1
  });
  return labs;
}

(async () => {
  admin.initializeApp({ projectId: 'hexworth-prime' });
  const db = admin.firestore();
  const FieldValue = admin.firestore.FieldValue;

  const snap = await db.collection(TCLASS + '/progress').get();
  console.log(`ALA class: ${snap.size} students | denominator map ids: ${MAP_IDS.size} | mode: ${APPLY ? 'APPLY (writing)' : 'DRY RUN (no writes)'}\n`);

  if (APPLY) {
    const backup = {}; snap.forEach(d => { backup[d.id] = d.data(); });
    const dir = path.join(__dirname, 'backups'); fs.mkdirSync(dir, { recursive: true });
    const ts = new Date().toISOString().replace(/[:.]/g, '-');
    const file = path.join(dir, `ala-class-backup-${ts}.json`);
    fs.writeFileSync(file, JSON.stringify(backup, null, 2));
    console.log(`BACKUP written: ${file} (${snap.size} docs)\n`);
  }

  let totMods = 0, totLabs = 0, touched = 0;
  let mirrorEmpty = 0, mirrorFail = 0, writeFail = 0; // audit: distinguish clean-skip from read/write failure
  for (const d of snap.docs) {
    const uid = d.id;
    const cur = d.data() || {};
    const curDone = new Set([...(cur.modulesCompleted || []), ...Object.keys(cur.quizScores || {})]);
    const curLabs = new Set(cur.labsCompleted || []);
    const name = cur.displayName || '?';

    let mirror = {}, mirrorOk = true;
    try {
      mirror = ((await db.doc('users/' + uid + '/sync/localStorage').get()).data() || {}).data || {};
    } catch (e) {
      mirrorOk = false; mirrorFail++;
      console.warn('  MIRROR READ FAILED for', name, uid.slice(0, 6) + '…', '-', e.message, '(student skipped — NOT a clean no-data skip)');
    }
    if (mirrorOk && !Object.keys(mirror).length) mirrorEmpty++;

    // countable stranded = (mirror-completed ∩ map ids) not already on the class doc
    const stranded = [...completedFromMirror(mirror)].filter(id => MAP_IDS.has(id) && !curDone.has(id));
    // labs (with flags) not already recorded
    const newLabs = completedLabs(mirror).filter(id => !curLabs.has(id));

    if (!stranded.length && !newLabs.length) continue;
    touched++; totMods += stranded.length; totLabs += newLabs.length;
    console.log(`  ${name.padEnd(22)} ${uid.slice(0, 6)}…  +${stranded.length} countable${stranded.length ? ' ['+stranded.join(',')+']' : ''}  +${newLabs.length} labs${newLabs.length ? ' ['+newLabs.join(',')+']' : ''}`);

    if (APPLY) {
      const update = {};
      if (stranded.length) update.modulesCompleted = FieldValue.arrayUnion(...stranded);
      if (newLabs.length) update.labsCompleted = FieldValue.arrayUnion(...newLabs);
      // per-write guard: a single failed update must not abort the run or hide which student
      // was missed. arrayUnion is idempotent, so a clean re-run safely recovers any failure.
      try { await d.ref.update(update); }
      catch (e) { writeFail++; console.error('  WRITE FAILED for', name, uid.slice(0, 6) + '…', '-', e.message, '(re-run --apply to recover; idempotent)'); }
    }
  }

  console.log(`\n${APPLY ? 'WROTE' : 'WOULD WRITE'}: ${totMods} countable completions + ${totLabs} lab completions across ${touched} students.`);
  console.log(`audit: ${mirrorEmpty} students with empty mirror (clean skip) | ${mirrorFail} mirror-read FAILURES | ${writeFail} write FAILURES`);
  if (mirrorFail || writeFail) console.log('  ^ NON-ZERO failures: those students were NOT processed — investigate + re-run (idempotent) before trusting the result.');
  console.log('Add-only (arrayUnion); no deletes; existing scores preserved; idempotent.');
  console.log('Labs -> labsCompleted only (NOT counted by current compute) => zero displayed-percentage change.');
  if (!APPLY) console.log('\nThis was a DRY RUN. Re-run with --apply (after Nancy review + operator go) to write.');
  process.exit(0);
})().catch(e => { console.error(e); process.exit(1); });
