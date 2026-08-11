// READ-ONLY verification: for each of the 11 misaligned CLH quizzes, print every option
// with its index, the CURRENT Firestore key, and the PROPOSED corrected key, so each
// corrected index can be eyeballed against the question's own explanation before any
// Firestore write. No writes performed. Usage: node verify-clh-corrections.js
const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');
if (!admin.apps.length) admin.initializeApp({ projectId: 'hexworth-prime' });
const db = admin.firestore();
const CLH = path.resolve(__dirname, '../_app/houses/script/courses/clh/modules');

// Proposed corrected answer arrays, derived from the audit + spot-verification.
const PROPOSED = {
  'clh-005': [1, 2, 2, 1, 1],
  'clh-006': [0, 2, 1, 1, 1],
  'clh-007': [1, 1, 3, 0, 0],
  'clh-008': [1, 2, 1, 1, 1],
  'clh-010': [1, 1, 1, 2, 2, 1],
  'clh-011': [1, 1, 2, 1, 1],
  'clh-012': [1, 2, 1, 1, 2],
  'clh-013': [1, 2, 2, 1, 1],
  'clh-014': [1, 2, 1, 1, 2],
  'clh-022': [0, 1, 2, 3, 0],
  'clh-027': [1, 1, 1, 1, 1],
};

// Parse the questions array (question/options/explanation) from a quiz HTML file.
function parseQuestions(quizId) {
  const f = path.join(CLH, quizId, 'script-quiz.quiz.html');
  if (!fs.existsSync(f)) return null;
  const txt = fs.readFileSync(f, 'utf8');
  const qs = [];
  const re = /question:\s*'((?:\\'|[^'])*)'[\s\S]*?options:\s*\[([\s\S]*?)\][\s\S]*?explanation:\s*'((?:\\'|[^'])*)'/g;
  let m;
  while ((m = re.exec(txt))) {
    const opts = [...m[2].matchAll(/'((?:\\'|[^'])*)'/g)].map(o => o[1].replace(/<[^>]+>/g, ''));
    qs.push({ q: m[1].replace(/<[^>]+>/g, ''), options: opts, explanation: m[3] });
  }
  return qs;
}

// Entry: pair every question's options with current vs proposed key + explanation.
(async () => {
  for (const id of Object.keys(PROPOSED)) {
    const snap = await db.doc(`quiz_keys/${id}`).get();
    const cur = (snap.data() || {}).answers || [];
    const prop = PROPOSED[id];
    const qs = parseQuestions(id) || [];
    console.log(`\n### ${id}  current=${JSON.stringify(cur)}  proposed=${JSON.stringify(prop)}`);
    for (let i = 0; i < qs.length; i++) {
      const changed = cur[i] !== prop[i] ? '  <== CHANGED' : '';
      console.log(`  Q${i + 1}${changed}  expl: ${qs[i].explanation.slice(0, 100)}`);
      qs[i].options.forEach((o, oi) => {
        const mark = oi === prop[i] ? ' [PROPOSED-CORRECT]' : (oi === cur[i] ? ' (current-key)' : '');
        console.log(`      ${oi}: ${o}${mark}`);
      });
    }
  }
  process.exit(0);
})().catch(e => { console.error(e.message); process.exit(1); });
