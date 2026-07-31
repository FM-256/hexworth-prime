// Tests the thing BUG-074 actually broke: after passing a quiz, does the student get RETURNED?
//
// The sibling probe (completequiz-notification-probe.js) asserts completeQuiz resolves, but it
// passes returnToDashboard:false so the browser is not navigated away mid-assertion — which
// means it never exercises the navigation itself. That is the exact behaviour the ReferenceError
// was skipping (the nav block sits at ModuleProgress.js:777, AFTER the throw at :763), so
// "resolves without throwing" is a proxy for the claim, not the claim. This closes that gap.
//
// Drives a real browser and asserts the URL actually changed to the return target.
// Ablation (--ablate) restores the pre-fix broken call and requires the navigation NOT to happen.
//
// usage: node _tools/eduscan/smoke/completequiz-navigation-probe.js [--ablate]
const puppeteer = require('puppeteer');
const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '../../../_app');
const PORT = 8989;
const ABLATE = process.argv.includes('--ablate');
const RETURN_TARGET = '/returned-to-hub.html';

const QUIZ_PAGE = `
<!doctype html><meta charset="utf-8"><title>quiz</title>
<script>
  const FirebaseAuth = { getUser: function(){ return null; }, waitForAuth: function(){ return Promise.resolve(null); }, init: function(){ return Promise.resolve(); } };
</script>
<script src="/components/ModuleProgress.js"></script>
`;
const HUB_PAGE = '<!doctype html><meta charset="utf-8"><title>hub</title><h1 id="hub">back at the hub</h1>';

const srv = http.createServer((req, res) => {
  const url = decodeURIComponent(req.url.split('?')[0]);
  if (url === '/quiz.html') { res.writeHead(200, { 'Content-Type': 'text/html' }); res.end(QUIZ_PAGE); return; }
  if (url === RETURN_TARGET) { res.writeHead(200, { 'Content-Type': 'text/html' }); res.end(HUB_PAGE); return; }
  if (url === '/components/ModuleProgress.js') {
    let src = fs.readFileSync(path.join(ROOT, 'components/ModuleProgress.js'), 'utf8');
    if (ABLATE) {
      src = src.replace('        ensureProgressStyles();\n\n        document.body.appendChild(notification);',
        "        if (!document.getElementById('module-progress-styles')) {\n" +
        "            showCompletionNotification('', '');\n" +
        "        }\n\n        document.body.appendChild(notification);");
    }
    res.writeHead(200, { 'Content-Type': 'text/javascript' }); res.end(src); return;
  }
  res.writeHead(404); res.end('nf');
});

let pass = 0, fail = 0; const fails = [];
function check(l, ok, d) { if (ok) { pass++; console.log(`  PASS  ${l}`); } else { fail++; fails.push(`${l}${d ? ': ' + d : ''}`); console.log(`  FAIL  ${l}${d ? ': ' + d : ''}`); } }

srv.listen(PORT, async () => {
  console.log(ABLATE ? 'ABLATED run -- navigation must NOT happen\n' : 'Fixed source\n');
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  try {
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto(`http://localhost:${PORT}/quiz.html`, { waitUntil: 'domcontentloaded' });
    await new Promise((r) => setTimeout(r, 400));

    check('starts on the quiz page with no stylesheet (the trigger condition)',
      await page.evaluate(() => location.pathname === '/quiz.html' && !document.getElementById('module-progress-styles')));

    // A PASSING score with an explicit return target. This is the real student path.
    // Catch INSIDE the page. On the pre-fix source completeQuiz throws synchronously, and an
    // uncaught rejection out of page.evaluate crashes the probe instead of failing it — the
    // ablation must report a clean verdict, not a stack trace.
    const call = await page.evaluate((target) => {
      // Fire and forget exactly as a quiz page does; the nav happens asynchronously.
      try { ModuleProgress.completeQuiz('cloud', 'nav-probe-quiz', 88, { returnUrl: target }); return { threw: false }; }
      catch (e) { return { threw: true, err: e.message }; }
    }, RETURN_TARGET);
    check('completeQuiz did not throw synchronously', call.threw === false, call.err);

    // Navigation is gated on Promise.race([syncPromise, 8s timeout]), so allow for it.
    let landed = false;
    for (let i = 0; i < 20; i++) {
      await new Promise((r) => setTimeout(r, 500));
      if (new URL(page.url()).pathname === RETURN_TARGET) { landed = true; break; }
    }

    check('student is RETURNED to the hub after passing', landed, `still at ${new URL(page.url()).pathname}`);
    if (landed) {
      check('the hub page actually rendered', await page.evaluate(() => !!document.getElementById('hub')));
    }
    const refErr = errors.filter((e) => /showCompletionNotification is not defined/.test(e));
    check('no showCompletionNotification ReferenceError', refErr.length === 0, refErr[0]);

    await page.close();
  } finally { await browser.close().catch(() => {}); srv.close(); }

  console.log(`\n${pass} passed, ${fail} failed`);
  fails.forEach((f) => console.log('  - ' + f));
  if (ABLATE) {
    console.log(fail > 0 ? '\nABLATION OK -- navigation does not happen against the pre-fix source.'
                         : '\nABLATION FAILED -- navigation happened even with the broken call. False oracle.');
    process.exit(fail > 0 ? 0 : 1);
  }
  process.exit(fail ? 1 : 0);
});
