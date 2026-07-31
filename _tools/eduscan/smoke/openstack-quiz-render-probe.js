// Renders each rewritten OpenStack quiz in a real browser and DRIVES it, with gradeQuiz stubbed.
//
// Splits the verification deliberately:
//   this probe  -> the PAGE: shuffle reaches the DOM, the right option index is submitted, the
//                  feedback box fills, the review screen maps back, the sign-in gate fires.
//   the server probe (openstack-quiz-server-probe.js) -> the CONTRACT: real gradeQuiz call with
//                  real auth, proving the Firestore key exists and does not over-reveal.
// Neither needs the change deployed first, which is the point — deploying to find out whether it
// works is the failure mode.
//
// The stub is the ORACLE here: it knows the true key, so it can assert that the index the page
// submitted is the original index of the option the student actually clicked. That is the
// display<->original crossing, checked through the real DOM rather than in isolation.
//
// HOW THE STUB IS INJECTED, AND WHY IT IS NOT A window ASSIGNMENT:
// FirebaseAuth.js declares `const FirebaseAuth = (function(){...})()` at classic-script top
// level. That binds in the global LEXICAL environment, not on window — so assigning
// window.FirebaseAuth does nothing, the page keeps reading the real one, and every quiz stops at
// the sign-in gate. (That is not hypothetical: it is what the first two runs of this probe did,
// and chasing it surfaced a real production bug in InstantQuizGrader.) So the stub is served
// AS the component file: the page's own `const` binding is the stub.
//
// usage: node _tools/eduscan/smoke/openstack-quiz-render-probe.js [--headful]
const puppeteer = require('puppeteer');
const http = require('http');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '../../../_app');
const PORT = 8977;
const KEYS = JSON.parse(fs.readFileSync(process.env.KEYS_JSON
  || path.resolve(__dirname, '../../../../../tmp/os-keys.json'), 'utf8'));

const QUIZZES = [
  'cloud-openstack-intro-quiz',
  'cloud-openstack-install-quiz',
  'cloud-openstack-operation-quiz',
  'cloud-openstack-projects-quiz',
];

const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.webp': 'image/webp', '.svg': 'image/svg+xml' };

// Replacement for the real FirebaseAuth.js. Declared exactly as the real one is (top-level
// const) so the page's identifier resolution is identical to production.
const FIREBASE_AUTH_STUB = `
const FirebaseAuth = (function () {
    function grade(payload) {
        const k = window.__KEY;
        const answers = payload.answers || {};
        const results = {};
        let score = 0;
        Object.keys(answers).forEach(function (i) {
            const idx = Number(i);
            const correct = answers[i] === k.answers[idx];
            if (correct) score++;
            results[idx] = { correct: correct, correctAnswer: k.answers[idx], explanation: k.explanations[idx] };
        });
        const total = payload.partial ? Object.keys(answers).length : k.answers.length;
        return { score: score, total: total, percentage: Math.round((score / total) * 100),
                 passed: (score / total) * 100 >= k.passingScore, results: results };
    }
    return {
        waitForAuth: function () { return Promise.resolve(window.__signedIn ? { uid: 'probe-uid' } : null); },
        isSignedIn: function () { return !!window.__signedIn; },
        getUser: function () { return window.__signedIn ? { uid: 'probe-uid' } : null; },
        callFunction: function (name, payload) {
            window.__calls.push({ name: name, payload: JSON.parse(JSON.stringify(payload)) });
            // __failGrade simulates an unreachable grading service, so the offline scenario can
            // exercise the skip path for real instead of assuming it works.
            if (window.__failGrade && payload.partial) return Promise.reject(new Error('unavailable'));
            return Promise.resolve({ data: grade(payload) });
        }
    };
})();
`;

// ModuleProgress is likewise a top-level const in its own file and would try to reach Firestore.
const MODULE_PROGRESS_STUB = `
const ModuleProgress = { completeQuiz: function () {}, complete: function () {} };
`;

// ORIGINAL option order per question — what the answer-key indices point into. The page ships
// its opts in original order and the grader permutes them only for display, so this is read
// straight from the page source. Without it there is nothing to check the DOM's shuffled order
// against, and the remap assertion would be comparing the page to itself.
function originalOptions(quizId) {
  const src = fs.readFileSync(path.join(ROOT, 'houses/cloud/openstack/quizzes', quizId + '.quiz.html'), 'utf8');
  const s = src.indexOf('const questions = [');
  if (s === -1) throw new Error(`${quizId}: no questions array`);
  const open = src.indexOf('[', s);
  let depth = 0, inStr = null, esc = false, end = -1;
  for (let i = open; i < src.length; i++) {
    const c = src[i];
    if (esc) { esc = false; continue; }
    if (c === '\\') { esc = true; continue; }
    if (inStr) { if (c === inStr) inStr = null; continue; }
    if (c === '"' || c === "'" || c === '`') { inStr = c; continue; }
    if (c === '[') depth++;
    else if (c === ']') { depth--; if (depth === 0) { end = i; break; } }
  }
  if (end === -1) throw new Error(`${quizId}: unbalanced questions array`);
  return vm.runInNewContext('(' + src.slice(open, end + 1) + ')').map((q) => q.opts);
}

const ORIGINALS = {};
for (const q of QUIZZES) ORIGINALS[q] = originalOptions(q);

function serve() {
  return new Promise((resolve) => {
    const srv = http.createServer((req, res) => {
      const url = decodeURIComponent(req.url.split('?')[0]);
      // Swap the two components that would otherwise reach real Firebase.
      if (url.endsWith('/components/FirebaseAuth.js')) {
        res.writeHead(200, { 'Content-Type': 'text/javascript' }); res.end(FIREBASE_AUTH_STUB); return;
      }
      if (url.endsWith('/components/ModuleProgress.js')) {
        res.writeHead(200, { 'Content-Type': 'text/javascript' }); res.end(MODULE_PROGRESS_STUB); return;
      }
      // ABLATE=1 injects an off-by-one into the display->original crossing, served to the page.
      // Proves the remap assertion below is live rather than vacuous, without ever editing the
      // real component. A probe that has not been shown to fail is not evidence.
      if (process.env.ABLATE && url.endsWith('/components/InstantQuizGrader.js')) {
        const real = fs.readFileSync(path.join(ROOT, 'components/InstantQuizGrader.js'), 'utf8');
        res.writeHead(200, { 'Content-Type': 'text/javascript' });
        res.end(real.replace(
          'return permFor(qIndex)[displayIndex];',
          'return permFor(qIndex)[(displayIndex + 1) % permFor(qIndex).length];'));
        return;
      }
      const p = path.join(ROOT, url);
      fs.readFile(p, (err, buf) => {
        if (err) { res.writeHead(404); res.end('nf'); return; }
        res.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream' });
        res.end(buf);
      });
    });
    srv.listen(PORT, () => resolve(srv));
  });
}

let pass = 0, fail = 0;
const fails = [];
function check(label, ok, detail) {
  if (ok) { pass++; console.log(`  PASS  ${label}`); }
  else { fail++; fails.push(`${label}${detail ? ': ' + detail : ''}`); console.log(`  FAIL  ${label}${detail ? ': ' + detail : ''}`); }
}

(async () => {
  const srv = await serve();
  const browser = await puppeteer.launch({
    headless: process.argv.includes('--headful') ? false : 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  // Anything that throws mid-run must still release Chromium and port 8977, or the next run
  // fails to bind and looks like a code defect.
  try {

  for (const quizId of QUIZZES) {
    console.log(`\n=== ${quizId} ===`);
    const key = KEYS[quizId];
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });

    // These must exist BEFORE page scripts run: the house satisfies AccessGuard.require('sorted'),
    // and the stub reads __KEY / __signedIn / __calls at call time.
    await page.evaluateOnNewDocument((k) => {
      localStorage.setItem('hexworth_house', 'cloud');
      window.__KEY = k;
      window.__calls = [];
      window.__signedIn = true;
    }, key);

    await page.goto(`http://localhost:${PORT}/houses/cloud/openstack/quizzes/${quizId}.quiz.html`,
      { waitUntil: 'domcontentloaded' });
    await new Promise((r) => setTimeout(r, 600));

    // ── The sign-in gate: signed OUT must not start the quiz ──
    await page.evaluate(() => { window.__signedIn = false; });
    await page.evaluate(() => startQuiz());
    await new Promise((r) => setTimeout(r, 300));
    const gated = await page.evaluate(() => ({
      noticeShown: document.getElementById('signInNotice').style.display === 'block',
      quizHidden: document.getElementById('quizScreen').style.display !== 'block',
    }));
    check('signed-out student is gated, quiz never starts', gated.noticeShown && gated.quizHidden,
      `notice=${gated.noticeShown} quizHidden=${gated.quizHidden}`);

    // ── Signed in: drive all 15 questions ──
    await page.evaluate(() => { window.__signedIn = true; });
    await page.evaluate(() => startQuiz());
    await new Promise((r) => setTimeout(r, 300));

    let remapOk = true, feedbackOk = true, shuffleSeen = false, remapDetail = '';
    for (let qi = 0; qi < key.answers.length; qi++) {
      // Read what the student SEES, pick a deterministic display slot, click it.
      const view = await page.evaluate(() => ({
        opts: [...document.querySelectorAll('.option')].map((o) => o.querySelectorAll('span')[1].textContent),
      }));
      if (!view.opts.length) {
        remapOk = false; remapDetail = `q${qi}: no options rendered`;
        break;
      }
      const pick = qi % view.opts.length;
      const clickedText = view.opts[pick];

      await page.evaluate((i) => document.querySelectorAll('.option')[i].click(), pick);
      await page.evaluate(() => submitAnswer());
      await new Promise((r) => setTimeout(r, 120));

      const state = await page.evaluate(() => ({
        last: window.__calls[window.__calls.length - 1],
        fbBody: document.getElementById('fbBody').textContent,
        correctRow: [...document.querySelectorAll('.option')].findIndex((o) => o.classList.contains('correct')),
        opts: [...document.querySelectorAll('.option')].map((o) => o.querySelectorAll('span')[1].textContent),
      }));

      // THE LOAD-BEARING ASSERTION: the original index submitted must be the original index of
      // the option the student actually clicked.
      const submitted = state.last && state.last.payload.answers[String(qi)];
      const trueOriginalOfClicked = ORIGINALS[quizId][qi].indexOf(clickedText);
      if (submitted !== trueOriginalOfClicked) {
        remapOk = false;
        remapDetail = remapDetail || `q${qi}: clicked "${clickedText}" (true original ${trueOriginalOfClicked}) but submitted ${submitted}`;
      }
      // The highlighted row must hold the true correct option's text.
      const trueCorrectText = ORIGINALS[quizId][qi][key.answers[qi]];
      if (state.correctRow < 0 || state.opts[state.correctRow] !== trueCorrectText) {
        remapOk = false;
        remapDetail = remapDetail || `q${qi}: highlighted row holds "${state.opts[state.correctRow]}" not "${trueCorrectText}"`;
      }
      if (!state.fbBody || state.fbBody.length < 10) feedbackOk = false;
      if (state.last && state.last.payload.partial !== true) {
        remapOk = false; remapDetail = remapDetail || `q${qi}: per-question call was not partial`;
      }
      if (view.opts.join('|') !== ORIGINALS[quizId][qi].join('|')) shuffleSeen = true;

      await page.evaluate(() => nextQuestion());
      await new Promise((r) => setTimeout(r, 120));
    }

    check('display->original remap correct for all 15 questions through the real DOM', remapOk, remapDetail);
    check('explanation rendered on every question', feedbackOk);
    check('options actually shuffled (not shipped in source order)', shuffleSeen);

    await new Promise((r) => setTimeout(r, 500));
    const results = await page.evaluate(() => ({
      shown: document.getElementById('resultsScreen').classList.contains('show'),
      pct: document.getElementById('scorePct').textContent,
      reviewCount: document.querySelectorAll('.review-item').length,
      fullCall: window.__calls.filter((c) => !c.payload.partial).length,
      lastFull: window.__calls.filter((c) => !c.payload.partial).pop(),
    }));
    check('results screen renders', results.shown, results.pct);
    check('review lists all 15 questions', results.reviewCount === 15, `got ${results.reviewCount}`);
    check('final submission is ONE full (non-partial) call', results.fullCall === 1, `got ${results.fullCall}`);
    check('final call carries all 15 answers', results.lastFull
      && Object.keys(results.lastFull.payload.answers).length === 15,
      results.lastFull ? Object.keys(results.lastFull.payload.answers).length + ' answers' : 'no full call');
    check('no page errors', errors.length === 0, errors.slice(0, 2).join(' | '));

    await page.close();
  }

  // ── OFFLINE SCENARIO ──
  // A dead grading service must not strand the student, and must not quietly count the
  // unreachable questions as wrong. Nancy flagged retry-only as a NEW way to make a quiz
  // un-completable — this proves the fix rather than asserting it.
  {
    const quizId = 'cloud-openstack-intro-quiz';
    console.log(`\n=== ${quizId} [offline grading service] ===`);
    const key = KEYS[quizId];
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));

    await page.evaluateOnNewDocument((k) => {
      localStorage.setItem('hexworth_house', 'cloud');
      window.__KEY = k; window.__calls = []; window.__signedIn = true;
      window.__failGrade = true;          // question 1 cannot be graded
    }, key);
    await page.goto(`http://localhost:${PORT}/houses/cloud/openstack/quizzes/${quizId}.quiz.html`,
      { waitUntil: 'domcontentloaded' });
    await new Promise((r) => setTimeout(r, 600));
    await page.evaluate(() => startQuiz());
    await new Promise((r) => setTimeout(r, 300));

    await page.evaluate(() => document.querySelectorAll('.option')[0].click());
    await page.evaluate(() => submitAnswer());
    await new Promise((r) => setTimeout(r, 200));
    const after1 = await page.evaluate(() => ({
      nextHidden: document.getElementById('nextBtn').style.display === 'none',
      submitEnabled: !document.getElementById('submitBtn').disabled,
      title: document.getElementById('fbTitle').textContent,
    }));
    check('1st failure: honest message, retry offered, no skip yet',
      after1.nextHidden && after1.submitEnabled && /could not verify/i.test(after1.title),
      `next hidden=${after1.nextHidden} submit=${after1.submitEnabled} "${after1.title}"`);

    await page.evaluate(() => submitAnswer());
    await new Promise((r) => setTimeout(r, 200));
    const after2 = await page.evaluate(() => ({
      nextShown: document.getElementById('nextBtn').style.display !== 'none',
      label: document.getElementById('nextBtn').textContent,
      skipFlag: document.getElementById('nextBtn').dataset.skip === '1',
    }));
    check('2nd failure: a way forward appears, labelled as ungraded',
      after2.nextShown && after2.skipFlag && /without grading/i.test(after2.label),
      `shown=${after2.nextShown} flag=${after2.skipFlag} "${after2.label}"`);

    // Skip it, restore the service, finish the remaining 14 normally.
    await page.evaluate(() => { nextQuestion(); window.__failGrade = false; });
    await new Promise((r) => setTimeout(r, 200));
    const labelReset = await page.evaluate(() => ({
      label: document.getElementById('nextBtn').textContent,
      skipFlag: !!document.getElementById('nextBtn').dataset.skip,
    }));
    check('skip label + flag cleared on the next question (no leak)',
      !labelReset.skipFlag && !/without grading/i.test(labelReset.label), `"${labelReset.label}"`);

    for (let qi = 1; qi < key.answers.length; qi++) {
      await page.evaluate(() => document.querySelectorAll('.option')[0].click());
      await page.evaluate(() => submitAnswer());
      await new Promise((r) => setTimeout(r, 100));
      await page.evaluate(() => nextQuestion());
      await new Promise((r) => setTimeout(r, 100));
    }
    await new Promise((r) => setTimeout(r, 500));

    const res = await page.evaluate(() => ({
      shown: document.getElementById('resultsScreen').classList.contains('show'),
      msg: document.getElementById('resultMsg').textContent,
      reviewCount: document.querySelectorAll('.review-item').length,
      notGraded: document.getElementById('reviewWrap').textContent.includes('Not graded'),
    }));
    check('student reaches the results screen despite the outage', res.shown);
    check('results state plainly that a question was not graded',
      /could not be graded/i.test(res.msg) && /not counted as correct/i.test(res.msg), res.msg.slice(0, 90));
    check('review marks the ungraded question, all 15 listed',
      res.notGraded && res.reviewCount === 15, `notGraded=${res.notGraded} count=${res.reviewCount}`);
    check('no page errors during the outage path', errors.length === 0, errors.slice(0, 2).join(' | '));
    await page.close();
  }

  } finally {
    await browser.close().catch(() => {});
    srv.close();
  }

  console.log(`\n${pass} passed, ${fail} failed`);
  fails.forEach((f) => console.log('  - ' + f));
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.error('PROBE ERROR: ' + e.message); process.exit(1); });
