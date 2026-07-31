// Proves BUG-074: ModuleProgress.completeQuiz() must not throw on the first quiz notification,
// and must reach the work that comes AFTER the notification.
//
// "It doesn't throw" is not the whole claim. The throw was skipping the activity-feed event and
// the return-to-destination navigation, so this asserts completeQuiz RESOLVES and that the styles
// it was trying to load actually got injected.
//
// Ablation (--ablate) restores the pre-fix call to the non-existent showCompletionNotification
// and requires the run to FAIL.
//
// usage: node _tools/eduscan/smoke/completequiz-notification-probe.js [--ablate]
const puppeteer = require('puppeteer');
const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '../../../_app');
const PORT = 8988;
const ABLATE = process.argv.includes('--ablate');

const PAGE = `
<!doctype html><meta charset="utf-8"><title>completeQuiz probe</title>
<script>
  const FirebaseAuth = { getUser: function(){ return null; }, waitForAuth: function(){ return Promise.resolve(null); }, init: function(){ return Promise.resolve(); } };
</script>
<script src="/components/ModuleProgress.js"></script>
`;

const srv = http.createServer((req, res) => {
  const url = decodeURIComponent(req.url.split('?')[0]);
  if (url === '/probe.html') { res.writeHead(200, { 'Content-Type': 'text/html' }); res.end(PAGE); return; }
  if (url === '/components/ModuleProgress.js') {
    let src = fs.readFileSync(path.join(ROOT, 'components/ModuleProgress.js'), 'utf8');
    if (ABLATE) {
      // Put back the exact pre-fix call to a function that does not exist.
      src = src.replace('        ensureProgressStyles();\n\n        document.body.appendChild(notification);',
        "        if (!document.getElementById('module-progress-styles')) {\n" +
        "            showCompletionNotification('', '');\n" +
        "        }\n\n        document.body.appendChild(notification);");
    }
    res.writeHead(200, { 'Content-Type': 'text/javascript' }); res.end(src); return;
  }
  const p = path.join(ROOT, url);
  fs.readFile(p, (e, b) => { if (e) { res.writeHead(404); res.end('nf'); return; } res.writeHead(200, { 'Content-Type': 'text/javascript' }); res.end(b); });
});

let pass = 0, fail = 0; const fails = [];
function check(l, ok, d) { if (ok) { pass++; console.log(`  PASS  ${l}`); } else { fail++; fails.push(`${l}${d ? ': ' + d : ''}`); console.log(`  FAIL  ${l}${d ? ': ' + d : ''}`); } }

srv.listen(PORT, async () => {
  console.log(ABLATE ? 'ABLATED run (pre-fix call restored) -- must fail\n' : 'Fixed source\n');
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  try {
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto(`http://localhost:${PORT}/probe.html`, { waitUntil: 'domcontentloaded' });
    await new Promise((r) => setTimeout(r, 500));

    // No stylesheet yet — this is the exact state that triggered the throw.
    check('starts with NO progress stylesheet injected (the trigger condition)',
      await page.evaluate(() => !document.getElementById('module-progress-styles')));

    const r = await page.evaluate(async () => {
      const out = {};
      try {
        // returnToDashboard:false so the probe is not navigated away mid-assert.
        await ModuleProgress.completeQuiz('cloud', 'probe-quiz-074', 88, { returnToDashboard: false });
        out.resolved = true;
      } catch (e) { out.resolved = false; out.err = e.message; }
      out.stylesInjected = !!document.getElementById('module-progress-styles');
      out.notificationShown = !!document.querySelector('.quiz-notification');
      try { out.recorded = !!(ModuleProgress.getModuleProgress('cloud', 'probe-quiz-074')); } catch (e) { out.recorded = 'threw'; }
      return out;
    });

    check('completeQuiz RESOLVES instead of throwing', r.resolved === true, r.err);
    check('the stylesheet it was trying to load is actually injected', r.stylesInjected === true);
    check('the quiz notification renders', r.notificationShown === true);
    check('progress still recorded', r.recorded === true, String(r.recorded));
    const refErr = errors.filter((e) => /showCompletionNotification is not defined/.test(e));
    check('no showCompletionNotification ReferenceError', refErr.length === 0, refErr[0]);

    await page.close();
  } finally { await browser.close().catch(() => {}); srv.close(); }

  console.log(`\n${pass} passed, ${fail} failed`);
  fails.forEach((f) => console.log('  - ' + f));
  if (ABLATE) {
    console.log(fail > 0 ? '\nABLATION OK -- fails against the pre-fix source.'
                         : '\nABLATION FAILED -- passed against BROKEN source. False oracle.');
    process.exit(fail > 0 ? 0 : 1);
  }
  process.exit(fail ? 1 : 0);
});
