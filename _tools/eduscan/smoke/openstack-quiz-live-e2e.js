// ZERO-STUB end-to-end against PRODUCTION: real page, real Firebase auth, real gradeQuiz.
//
// The render probe stubs the grading service and the server probe skips the browser. Both can
// be green while the two halves fail to meet in production. This runs the actual student path:
// load hexworth.com, sign in, click an option, and confirm the feedback the student sees is
// correct and came from the server.
//
// usage: node _tools/eduscan/smoke/openstack-quiz-live-e2e.js
const puppeteer = require('puppeteer');
const https = require('https');
const fs = require('fs');
const path = require('path');

const KEYS = JSON.parse(fs.readFileSync(process.env.KEYS_JSON
  || path.resolve(__dirname, '../../../../../tmp/os-keys.json'), 'utf8'));
const FIREBASE_WEB_API_KEY = 'AIzaSyC3tWNETi36DA8Q1I60n7t09YfU9HapA4M';
const SUFFIX = Math.random().toString(36).slice(2, 8);
const EMAIL = `quize2e-${SUFFIX}@hexworth-smoke.local`;
const PASSWORD = 'Qe' + Math.random().toString(36).slice(2, 6) + '9X';
const QUIZ = 'cloud-openstack-intro-quiz';
const URL = `https://hexworth.com/houses/cloud/openstack/quizzes/${QUIZ}.quiz.html`;

function signUp() {
  const body = JSON.stringify({ email: EMAIL, password: PASSWORD, returnSecureToken: true });
  return new Promise((resolve, reject) => {
    const req = https.request({
      method: 'POST', hostname: 'identitytoolkit.googleapis.com',
      path: `/v1/accounts:signUp?key=${FIREBASE_WEB_API_KEY}`,
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body), 'Referer': 'https://hexworth-prime.web.app/' },
    }, (res) => { let d = ''; res.on('data', (c) => d += c); res.on('end', () => { try { const j = JSON.parse(d); j.idToken ? resolve(j) : reject(new Error(d.slice(0, 200))); } catch (e) { reject(e); } }); });
    req.on('error', reject); req.write(body); req.end();
  });
}

let pass = 0, fail = 0; const fails = [];
function check(l, ok, d) { if (ok) { pass++; console.log(`  PASS  ${l}`); } else { fail++; fails.push(`${l}${d ? ': ' + d : ''}`); console.log(`  FAIL  ${l}${d ? ': ' + d : ''}`); } }

(async () => {
  console.log(`LIVE e2e — ${URL}\ntest user: ${EMAIL}`);
  const u = await signUp();
  console.log(`uid: ${u.localId}\n`);

  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  try {
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));

    // Satisfy AccessGuard on the real origin before the guarded page loads.
    await page.goto('https://hexworth.com/favicon.ico', { waitUntil: 'domcontentloaded' }).catch(() => {});
    await page.evaluate((e, p) => {
      localStorage.setItem('hexworth_house', 'cloud');
      sessionStorage.setItem('_e2e_email', e);
      sessionStorage.setItem('_e2e_password', p);
    }, EMAIL, PASSWORD);

    await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 45000 });
    await new Promise((r) => setTimeout(r, 3000));
    check('production quiz page loads', true);

    // ── Signed OUT: the gate must hold on the real page ──
    await page.evaluate(() => startQuiz());
    await new Promise((r) => setTimeout(r, 2500));
    const gated = await page.evaluate(() => ({
      notice: document.getElementById('signInNotice').style.display === 'block',
      quiz: document.getElementById('quizScreen').style.display,
    }));
    check('signed-out student is gated on PRODUCTION', gated.notice && gated.quiz !== 'block',
      `notice=${gated.notice} quizScreen=${gated.quiz}`);

    // ── Sign in for real, through the page's OWN FirebaseAuth API ──
    // Not via a dynamically imported firebase-auth.js: that creates a second SDK module instance
    // with its own app registry, so getAuth() reports "No Firebase App '[DEFAULT]'" even though
    // the page's Firebase is initialized and healthy. Using the page's own signInWithEmail also
    // exercises the same code path a student's sign-in takes.
    const signedIn = await page.evaluate(async () => {
      try {
        const r = await FirebaseAuth.signInWithEmail(
          sessionStorage.getItem('_e2e_email'), sessionStorage.getItem('_e2e_password'));
        const u = FirebaseAuth.getUser();
        return { ok: !!(u && u.uid), uid: u && u.uid, raw: r && r.error ? String(r.error) : null };
      } catch (e) { return { ok: false, error: e.message }; }
    });
    check('real Firebase sign-in on production', signedIn.ok, signedIn.error);
    if (!signedIn.ok) throw new Error('cannot continue without auth');

    await new Promise((r) => setTimeout(r, 2000));
    await page.evaluate(() => startQuiz());
    await new Promise((r) => setTimeout(r, 2500));
    const started = await page.evaluate(() => ({
      quiz: document.getElementById('quizScreen').style.display,
      opts: [...document.querySelectorAll('.option')].map((o) => o.querySelectorAll('span')[1].textContent),
    }));
    check('quiz starts once signed in', started.quiz === 'block' && started.opts.length > 0,
      `display=${started.quiz} options=${started.opts.length}`);

    // ── Answer q0 CORRECTLY, using the real key, mapped through the live shuffle ──
    const key = KEYS[QUIZ];
    const src = await page.evaluate(() => JSON.stringify(questions.map((q) => q.opts)));
    const originals = JSON.parse(src);
    const correctText = originals[0][key.answers[0]];
    const row = started.opts.indexOf(correctText);
    check('shuffled options still contain every original option', row >= 0,
      row < 0 ? 'correct option not present in displayed set' : `correct option at display row ${row}`);

    await page.evaluate((i) => document.querySelectorAll('.option')[i].click(), row);
    await page.evaluate(() => submitAnswer());
    await new Promise((r) => setTimeout(r, 4000));

    const verdict = await page.evaluate(() => ({
      title: document.getElementById('fbTitle').textContent,
      body: document.getElementById('fbBody').textContent,
      highlighted: [...document.querySelectorAll('.option')].findIndex((o) => o.classList.contains('correct')),
      // The internal counter, not the on-screen label. The label is only rewritten by
      // renderQuestion(), so it legitimately lags by one question — behaviour inherited
      // unchanged from the pre-rewrite pages (archived original writes qScore in exactly one
      // place too). Asserting on the label would be asserting a bug that predates this work.
      score: (typeof score !== 'undefined') ? score : -1,
    }));
    check('server graded the correct answer as CORRECT', /correct!/i.test(verdict.title), verdict.title);
    check('explanation came back from the server and is displayed',
      verdict.body.length > 20, `${verdict.body.length} chars: "${verdict.body.slice(0, 60)}"`);
    check('the right row is highlighted (remap holds against the live server)',
      verdict.highlighted === row, `highlighted=${verdict.highlighted} clicked=${row}`);
    check('score incremented', verdict.score === 1, `score=${verdict.score}`);

    // ── A WRONG answer on q1 must be graded wrong ──
    await page.evaluate(() => nextQuestion());
    await new Promise((r) => setTimeout(r, 1200));
    const q1 = await page.evaluate(() => [...document.querySelectorAll('.option')].map((o) => o.querySelectorAll('span')[1].textContent));
    const wrongRow = q1.findIndex((t) => t !== originals[1][key.answers[1]]);
    await page.evaluate((i) => document.querySelectorAll('.option')[i].click(), wrongRow);
    await page.evaluate(() => submitAnswer());
    await new Promise((r) => setTimeout(r, 4000));
    const v1 = await page.evaluate(() => ({
      title: document.getElementById('fbTitle').textContent,
      highlighted: [...document.querySelectorAll('.option')].findIndex((o) => o.classList.contains('correct')),
    }));
    check('server graded a wrong answer as INCORRECT', /incorrect/i.test(v1.title), v1.title);
    check('correct option still revealed on a miss, in the right row',
      v1.highlighted >= 0 && q1[v1.highlighted] === originals[1][key.answers[1]],
      `highlighted row holds "${q1[v1.highlighted]}"`);

    // BUG-072 is a pre-existing ModuleProgress scope error, unrelated to this change and present
    // on any page that loads ModuleProgress.js when auth state changes. Named and excluded
    // explicitly rather than loosening the check — an unrelated known bug must not mask a new
    // one, and must not be quietly swallowed either.
    const known = errors.filter((e) => /firestoreSyncReady is not defined/.test(e));
    const unexpected = errors.filter((e) => !/firestoreSyncReady is not defined/.test(e));
    if (known.length) console.log(`  NOTE  ${known.length} pre-existing BUG-072 error(s) ignored (ModuleProgress scope bug, not from this change)`);
    check('no NEW page errors during the live run', unexpected.length === 0, unexpected.slice(0, 2).join(' | '));
  } finally {
    await browser.close().catch(() => {});
  }

  console.log(`\n${pass} passed, ${fail} failed`);
  fails.forEach((f) => console.log('  - ' + f));
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.error('E2E ERROR: ' + e.message); process.exit(1); });
