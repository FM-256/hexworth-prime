// Seeds quiz_keys/{quizId} for the 4 OpenStack quizzes being moved off client-side grading
// (BUG-065), and mirrors them into the static registry functions/quiz_keys.json.
//
// PRODUCTION FIRESTORE WRITE. Defaults to DRY RUN; --apply writes.
//
// ORDER MATTERS AND IS ENFORCED BELOW: the KEY must exist in Firestore BEFORE the page that
// calls gradeQuiz ships. CLAUDE.md rule 9 — without quiz_keys/{quizId}, gradeQuiz has nothing
// to grade against and EVERY student scores 0/N. So: seed, verify with verify-quiz-keys.js,
// only then deploy the pages.
//
// Input is produced by _tools/extract-openstack-quiz-keys.js, which parses the real questions
// array rather than regexing it and refuses to emit unless every `correct` is an in-range
// number and every explanation is present.
const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

const APPLY = process.argv.includes('--apply');
const KEYS_IN = process.argv[2] && !process.argv[2].startsWith('--') ? process.argv[2] : '/tmp/os-keys.json';
const REGISTRY = path.join(__dirname, 'quiz_keys.json');

(async () => {
  const incoming = JSON.parse(fs.readFileSync(KEYS_IN, 'utf8'));
  const registry = JSON.parse(fs.readFileSync(REGISTRY, 'utf8'));
  if (!admin.apps.length) admin.initializeApp({ projectId: 'hexworth-prime' });
  const db = admin.firestore();

  console.log(`incoming keys : ${Object.keys(incoming).length}`);
  console.log(`registry size : ${Object.keys(registry).length}`);
  console.log('');

  let problems = 0;
  for (const [id, key] of Object.entries(incoming)) {
    // Refuse to overwrite an existing key silently — that would replace a working answer key
    // with an unverified one and could grade every future student wrong.
    const existing = await db.doc(`quiz_keys/${id}`).get();
    const inRegistry = id in registry;
    const n = (key.answers || []).length;
    const ok = n === key.questionCount && n > 0
      && (key.explanations || []).length === n
      && key.answers.every((a) => Number.isInteger(a) && a >= 0);
    console.log(`  ${id}`);
    console.log(`     questions=${n}  answers=[${key.answers.join(',')}]  passing=${key.passingScore}`);
    console.log(`     shape valid: ${ok}   already in Firestore: ${existing.exists}   already in registry: ${inRegistry}`);
    if (!ok) { console.log('     REFUSING: shape invalid'); problems++; }
    if (existing.exists) { console.log('     REFUSING: key already exists — will not overwrite'); problems++; }
  }

  if (problems) { console.error(`\n${problems} problem(s) — nothing written.`); process.exit(1); }
  if (!APPLY) { console.log('\nDRY RUN — pass --apply to write Firestore + registry.'); return; }

  for (const [id, key] of Object.entries(incoming)) {
    await db.doc(`quiz_keys/${id}`).set(key);
    registry[id] = { answers: key.answers, passingScore: key.passingScore, questionCount: key.questionCount };
  }
  // Registry mirrors the graded fields only; explanations live in Firestore so they stay out of
  // any client bundle and out of a file a student could read in the repo mirror.
  fs.writeFileSync(REGISTRY, JSON.stringify(registry, null, 2) + '\n');

  let verified = 0;
  for (const id of Object.keys(incoming)) {
    const d = await db.doc(`quiz_keys/${id}`).get();
    const got = d.exists ? (d.data().answers || []).length : 0;
    const want = incoming[id].answers.length;
    console.log(`  re-read ${id}: ${got}/${want} answers ${got === want ? 'OK' : 'MISMATCH'}`);
    if (got === want) verified++;
  }
  console.log(`\nWROTE ${Object.keys(incoming).length} keys, verified ${verified}. Registry now ${Object.keys(registry).length} entries.`);
  if (verified !== Object.keys(incoming).length) process.exit(1);
})().catch((e) => { console.error('ERR', e.message); process.exit(1); });
