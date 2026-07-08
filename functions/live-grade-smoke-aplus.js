#!/usr/bin/env node
/**
 * live-grade-smoke-aplus.js
 *
 * Post-seed grading smoke for the 4 A+ Core 1 multi-modal keys. verify-quiz-keys.js only checks the
 * answer array is the right shape/length -- it never exercises grading, so a terminal-branch or
 * key-shape bug would silently grade every terminal 0 and still "pass" verify-quiz-keys (Nancy's
 * concern #5). This reads each LIVE seeded Firestore key and grades, per question, a CORRECT answer
 * (from the key itself) and a WRONG answer, using the SAME per-question comparison as the deployed
 * gradeQuiz. Expect all-correct => 10/10 and all-wrong => 0/10 for every quiz. Read-only.
 */
const admin = require('firebase-admin');
if (!admin.apps.length) admin.initializeApp({ projectId: 'hexworth-prime' });
const db = admin.firestore();
const IDS = ['aplus-core1-prep-r1', 'aplus-core1-prep-r2', 'aplus-core1-prep-r3', 'aplus-core1-prep-r4'];

// Exact copy of the deployed gradeQuiz per-question comparison (mc/gui/terminal), kept in sync.
function gradeOne(expected, submitted, qType) {
  if (expected && typeof expected === 'object' && !Array.isArray(expected)) {
    if (expected.ms) { qType = 'ms'; expected = expected.ms; }
    else if (expected.order) { qType = 'order'; expected = expected.order; }
    else if (expected.terminal) { qType = 'terminal'; expected = expected.terminal; }
  }
  if (submitted === undefined) return false;
  if (qType === 'terminal') {
    const acc = Array.isArray(expected) ? expected : [];
    const norm = (s) => String(s).trim().toLowerCase();
    return typeof submitted === 'string' && acc.some((a) => norm(a) === norm(submitted));
  }
  if (Array.isArray(expected) && Array.isArray(submitted)) {
    if (submitted.length !== expected.length) return false;
    if (qType === 'order') return submitted.every((v, j) => v === expected[j]);
    const s = [...submitted].sort((a, b) => a - b), e = [...expected].sort((a, b) => a - b);
    return s.every((v, j) => v === e[j]);
  }
  return submitted === expected;
}

// Build a correct and a wrong submission from a key entry, per type.
function correctAns(exp, type) {
  if (type === 'terminal') return (exp && exp.terminal) ? exp.terminal[0] : '';
  return exp; // mc index / gui id
}
function wrongAns(exp, type) {
  if (type === 'terminal') return '___definitely_wrong_command___';
  if (type === 'gui') return '___no_such_hotspot___';
  return (typeof exp === 'number') ? exp + 100 : -1; // mc: an index that cannot match
}

(async () => {
  let fail = 0;
  for (const id of IDS) {
    const doc = await db.doc(`quiz_keys/${id}`).get();
    if (!doc.exists) { console.log(`  FAIL ${id}: key NOT FOUND in Firestore`); fail++; continue; }
    const k = doc.data();
    const types = k.types || [];
    let right = 0, wrong = 0;
    for (let i = 0; i < k.answers.length; i++) {
      if (gradeOne(k.answers[i], correctAns(k.answers[i], types[i]), types[i])) right++;
      if (gradeOne(k.answers[i], wrongAns(k.answers[i], types[i]), types[i])) wrong++;
    }
    const termCount = types.filter(t => t === 'terminal').length;
    const ok = right === k.answers.length && wrong === 0;
    if (!ok) fail++;
    console.log(`  ${ok ? 'OK  ' : 'FAIL'} ${id}: correct-run ${right}/${k.answers.length}, wrong-run ${wrong}/${k.answers.length} (${termCount} terminal, revealToAll=${k.revealToAll}, multiModal=${k.multiModal})`);
  }
  console.log(fail === 0 ? '\nLIVE GRADE SMOKE PASS (all terminal/gui/mc grade correctly against live keys)' : `\n${fail} FAIL`);
  process.exit(fail === 0 ? 0 : 1);
})().catch(e => { console.error(e.message); process.exit(1); });
