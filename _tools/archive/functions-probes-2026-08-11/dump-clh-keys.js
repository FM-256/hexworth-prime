// READ-ONLY: dump quiz_keys answers for CLH quizzes and show, per question, which
// HTML option the key marks correct + the explanation, so semantic (seed-order)
// alignment can be eyeballed. Usage: node dump-clh-keys.js clh-002 [clh-003 ...]
const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

if (!admin.apps.length) admin.initializeApp({ projectId: 'hexworth-prime' });
const db = admin.firestore();

const CLH = path.resolve(__dirname, '../_app/houses/script/courses/clh/modules');

// crude-but-adequate parse of the questions array from a quiz HTML file
function parseQuestions(quizId) {
  // quizId clh-002 -> dir clh-002
  const f = path.join(CLH, quizId, 'script-quiz.quiz.html');
  if (!fs.existsSync(f)) return null;
  const txt = fs.readFileSync(f, 'utf8');
  const qs = [];
  // match each { question: '...', options: [ ... ], explanation: '...' }
  const re = /question:\s*'((?:\\'|[^'])*)'[\s\S]*?options:\s*\[([\s\S]*?)\][\s\S]*?explanation:\s*'((?:\\'|[^'])*)'/g;
  let m;
  while ((m = re.exec(txt))) {
    const optsRaw = m[2];
    const opts = [...optsRaw.matchAll(/'((?:\\'|[^'])*)'/g)].map(o => o[1].replace(/<[^>]+>/g, ''));
    qs.push({ q: m[1].replace(/<[^>]+>/g, ''), options: opts, explanation: m[3] });
  }
  return qs;
}

// Entry point: for each requested quizId, read its Firestore key and pair each
// answer index with the HTML option it marks correct + that question's explanation.
(async () => {
  const ids = process.argv.slice(2);
  for (const id of ids) {
    const snap = await db.doc(`quiz_keys/${id}`).get();
    if (!snap.exists) { console.log(`\n### ${id}: NO KEY`); continue; }
    const key = snap.data();
    const answers = key.answers || key.correctAnswers || [];
    const qs = parseQuestions(id) || [];
    console.log(`\n### ${id}  (key answers=${JSON.stringify(answers)}, html questions=${qs.length})`);
    // Print, per question, the option the key marks correct next to the explanation
    // so seed-order misalignment is visible to the eye.
    for (let i = 0; i < qs.length; i++) {
      const ai = answers[i];
      const marked = (typeof ai === 'number' && qs[i].options[ai] !== undefined) ? qs[i].options[ai] : '(out of range)';
      console.log(`  Q${i + 1}: key=${ai} -> "${marked}"`);
      console.log(`        expl: ${qs[i].explanation.slice(0, 90)}`);
    }
  }
  process.exit(0);
})().catch(e => { console.error(e.message); process.exit(1); });
