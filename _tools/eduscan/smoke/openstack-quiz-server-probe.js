// Proves the SERVER CONTRACT for the 4 OpenStack quizzes against real production gradeQuiz.
//
// The render probe stubs gradeQuiz and proves the PAGE is right. This proves the other half:
// that the Firestore key actually exists, grades the answers we think it grades, reveals what
// the feedback box needs, and does NOT hand a student the other 14 answers.
//
// Splitting it this way means neither half has to be deployed to be trusted. The alternative —
// deploy and see — is how students find your bugs for you.
//
// READ-ONLY against production: it calls gradeQuiz, which for a partial call writes nothing.
// The final full call DOES log one quiz_attempts row under the throwaway test user; that is the
// function's normal behavior and the only way to verify the real path.
//
// Run AFTER seeding quiz_keys. Before the seed it should FAIL with not-found — that failure is
// itself the proof that rule 9's ordering matters.
//
// usage: node _tools/eduscan/smoke/openstack-quiz-server-probe.js
const https = require('https');
const fs = require('fs');
const path = require('path');

const KEYS = JSON.parse(fs.readFileSync(process.env.KEYS_JSON
  || path.resolve(__dirname, '../../../../../tmp/os-keys.json'), 'utf8'));

// Same web API key the pages use; it is referer-restricted, so send a matching Referer.
const FIREBASE_WEB_API_KEY = 'AIzaSyC3tWNETi36DA8Q1I60n7t09YfU9HapA4M';
const FN_HOST = 'us-central1-hexworth-prime.cloudfunctions.net';
const SUFFIX = Math.random().toString(36).slice(2, 8);
const TEST_EMAIL = `quizprobe-${SUFFIX}@hexworth-smoke.local`;
const TEST_PASSWORD = 'Qp' + Math.random().toString(36).slice(2, 6) + '9X';

function post(hostname, pathname, body, headers) {
  const payload = JSON.stringify(body);
  return new Promise((resolve, reject) => {
    const req = https.request({
      method: 'POST', hostname, path: pathname,
      headers: Object.assign({
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
        'Referer': 'https://hexworth-prime.web.app/',
      }, headers || {}),
    }, (res) => {
      let data = '';
      res.on('data', (c) => data += c);
      res.on('end', () => { try { resolve({ status: res.statusCode, json: JSON.parse(data) }); } catch (e) { resolve({ status: res.statusCode, json: null, raw: data.slice(0, 300) }); } });
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

let pass = 0, fail = 0;
const fails = [];
function check(label, ok, detail) {
  if (ok) { pass++; console.log(`  PASS  ${label}`); }
  else { fail++; fails.push(`${label}${detail ? ': ' + detail : ''}`); console.log(`  FAIL  ${label}${detail ? ': ' + detail : ''}`); }
}

(async () => {
  console.log(`OpenStack quiz SERVER contract probe — test user ${TEST_EMAIL}`);

  const signUp = await post('identitytoolkit.googleapis.com',
    `/v1/accounts:signUp?key=${FIREBASE_WEB_API_KEY}`, { email: TEST_EMAIL, password: TEST_PASSWORD, returnSecureToken: true });
  if (!signUp.json || !signUp.json.idToken) {
    console.error('could not create test user:', signUp.raw || JSON.stringify(signUp.json).slice(0, 300));
    process.exit(1);
  }
  const idToken = signUp.json.idToken;
  console.log(`test uid: ${signUp.json.localId}\n`);

  const auth = { Authorization: `Bearer ${idToken}` };

  for (const [quizId, key] of Object.entries(KEYS)) {
    console.log(`=== ${quizId} ===`);

    // ── 1. A CORRECT answer to question 0, submitted partially ──
    const okRes = await post(FN_HOST, '/gradeQuiz',
      { data: { quizId, answers: { 0: key.answers[0] }, partial: true } }, auth);
    const okResult = okRes.json && okRes.json.result;
    if (!okResult) {
      check('partial call succeeds', false, okRes.raw || JSON.stringify(okRes.json).slice(0, 200));
      console.log('  (if this is not-found, quiz_keys has not been seeded yet — that is rule 9)\n');
      continue;
    }
    check('partial call succeeds', true);
    check('correct answer is graded correct', okResult.results['0'] && okResult.results['0'].correct === true);
    check('correctAnswer revealed (revealToAll is set)',
      okResult.results['0'] && okResult.results['0'].correctAnswer === key.answers[0],
      `got ${okResult.results['0'] && okResult.results['0'].correctAnswer}, want ${key.answers[0]}`);
    check('explanation revealed (feedback box will not be empty)',
      !!(okResult.results['0'] && okResult.results['0'].explanation));

    // ── 2. THE ANTI-LEAK ASSERTION ──
    // A partial call must reveal ONLY the submitted question. If it returned the other 14,
    // revealToAll would have replaced a source-code key leak with a network key leak.
    const revealed = Object.keys(okResult.results || {})
      .filter((i) => okResult.results[i].correctAnswer !== undefined);
    check('partial call reveals ONLY the submitted question, not the other 14',
      revealed.length === 1 && revealed[0] === '0',
      `revealed indices: [${revealed.join(',')}]`);

    // ── 3. A WRONG answer is graded wrong ──
    const wrongIdx = key.answers[0] === 0 ? 1 : 0;
    const badRes = await post(FN_HOST, '/gradeQuiz',
      { data: { quizId, answers: { 0: wrongIdx }, partial: true } }, auth);
    const badResult = badRes.json && badRes.json.result;
    check('wrong answer is graded wrong', !!(badResult && badResult.results['0'] && badResult.results['0'].correct === false));

    // ── 4. Full submission returns a percentage, not a raw count ──
    const allAnswers = {};
    key.answers.forEach((a, i) => { allAnswers[i] = a; });
    const fullRes = await post(FN_HOST, '/gradeQuiz', { data: { quizId, answers: allAnswers } }, auth);
    const full = fullRes.json && fullRes.json.result;
    check('full submission of the true key scores 100%',
      !!(full && full.percentage === 100 && full.passed === true),
      full ? `percentage=${full.percentage} score=${full.score} passed=${full.passed}` : 'no result');
    check('percentage and score are distinct fields (score is a raw count)',
      !!(full && full.score === key.answers.length && full.percentage === 100),
      full ? `score=${full.score} percentage=${full.percentage}` : '');
    console.log('');
  }

  // ── 5. Unauthenticated access is refused — the reason the page needs a sign-in gate ──
  const anon = await post(FN_HOST, '/gradeQuiz',
    { data: { quizId: Object.keys(KEYS)[0], answers: { 0: 1 }, partial: true } }, {});
  check('unauthenticated call is refused (justifies the sign-in gate)',
    anon.status === 401 || (anon.json && anon.json.error && /unauthenticated/i.test(JSON.stringify(anon.json.error))),
    `status=${anon.status}`);

  console.log(`\n${pass} passed, ${fail} failed`);
  fails.forEach((f) => console.log('  - ' + f));
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.error('PROBE ERROR: ' + e.message); process.exit(1); });
