// Extracts answer keys + explanations from the 4 client-graded OpenStack quizzes (BUG-065)
// so they can be moved into Firestore quiz_keys and OUT of the page source.
//
// Runs the page's own `questions` array through a JS parser rather than regexing it: these are
// hand-authored literals with embedded punctuation, em-dashes and quotes inside strings, and a
// regex over that will mis-split silently and produce a plausible-but-wrong key. A wrong key
// grades real students incorrectly, so this reads the actual array.
//
// REPORT-ONLY: prints JSON. Writes nothing.
// usage: node _tools/extract-openstack-quiz-keys.js
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const DIR = path.resolve(__dirname, '../_app/houses/cloud/openstack/quizzes');
const QUIZZES = [
  { file: 'cloud-openstack-intro-quiz.quiz.html', id: 'cloud-openstack-intro-quiz' },
  { file: 'cloud-openstack-install-quiz.quiz.html', id: 'cloud-openstack-install-quiz' },
  { file: 'cloud-openstack-operation-quiz.quiz.html', id: 'cloud-openstack-operation-quiz' },
  { file: 'cloud-openstack-projects-quiz.quiz.html', id: 'cloud-openstack-projects-quiz' },
];

const out = {};
let problems = 0;

for (const q of QUIZZES) {
  const src = fs.readFileSync(path.join(DIR, q.file), 'utf8');
  // Grab the literal from `const questions = [` to the matching close, by brace/bracket depth —
  // string-aware so a `]` inside an explanation cannot terminate it early.
  const start = src.indexOf('const questions = [');
  if (start === -1) { console.error(`${q.id}: no questions array`); problems++; continue; }
  const open = src.indexOf('[', start);
  let depth = 0, end = -1, inStr = null, esc = false;
  for (let i = open; i < src.length; i++) {
    const c = src[i];
    if (esc) { esc = false; continue; }
    if (c === '\\') { esc = true; continue; }
    if (inStr) { if (c === inStr) inStr = null; continue; }
    if (c === '"' || c === "'" || c === '`') { inStr = c; continue; }
    if (c === '[') depth++;
    else if (c === ']') { depth--; if (depth === 0) { end = i; break; } }
  }
  if (end === -1) { console.error(`${q.id}: unbalanced questions array`); problems++; continue; }

  const arr = vm.runInNewContext('(' + src.slice(open, end + 1) + ')');
  const answers = arr.map(x => x.correct);
  const explanations = arr.map(x => x.explanation || '');

  // Sanity gates — a silently wrong key is worse than no key.
  const bad = [];
  arr.forEach((x, i) => {
    if (typeof x.correct !== 'number') bad.push(`q${i}: correct is ${typeof x.correct}`);
    else if (x.correct < 0 || x.correct >= (x.opts || []).length) bad.push(`q${i}: correct ${x.correct} out of range (${(x.opts || []).length} opts)`);
    if (!x.q) bad.push(`q${i}: no question text`);
    if (!x.explanation) bad.push(`q${i}: no explanation`);
  });
  if (bad.length) { console.error(`${q.id} PROBLEMS:\n   ` + bad.join('\n   ')); problems++; }

  // revealToAll is REQUIRED, not optional polish. gradeQuiz gates correctAnswer/explanation
  // behind `passed || revealToAll || revealForReview` (functions/index.js:1764). A partial
  // call submits 1 of 15, scores ~7%, so `passed` is never true, and revealForReview is
  // !isPartial-guarded. Without this flag the per-question feedback box renders EMPTY every
  // time — the quiz would look fine and be silently broken. These are formative module
  // quizzes, which is exactly the case that comment says revealToAll exists for.
  out[q.id] = { answers, explanations, passingScore: 70, questionCount: arr.length, revealToAll: true };
  console.error(`${q.id}: ${arr.length} questions, answers=[${answers.join(',')}]`);
}

if (problems) { console.error(`\n${problems} quiz(zes) had problems — NOT emitting keys`); process.exit(1); }
console.log(JSON.stringify(out, null, 2));
