// Proves BUG-072 is fixed: the cloud pull on sign-in must run, not throw.
//
// "No ReferenceError" is NOT the claim worth checking on its own — the throw has been masking
// whether FirestoreManager.syncBidirectional was ever reached. So this asserts the sync is
// ACTUALLY CALLED, with the right uid.
//
// Includes an ABLATION: served with the pre-fix source, the probe must FAIL. A probe that has
// not been shown to fail is not evidence.
//
// usage: node _tools/eduscan/smoke/moduleprogress-cloudpull-probe.js [--ablate]
const puppeteer = require('puppeteer');
const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '../../../_app');
const PORT = 8985;
const ABLATE = process.argv.includes('--ablate');

// Stub FirestoreManager that RECORDS the call. Declared as a top-level const exactly like the
// real one, so identifier resolution on the page matches production.
const FIRESTORE_STUB = `
window.__syncCalls = [];
const FirestoreManager = {
    init: function () { return Promise.resolve(true); },
    syncBidirectional: function (uid) { window.__syncCalls.push(uid); return Promise.resolve(true); }
};
`;

const AUTH_STUB = `
const FirebaseAuth = {
    init: function () { return Promise.resolve(); },
    waitForAuth: function () { return Promise.resolve({ uid: 'probe-uid' }); },
    getUser: function () { return { uid: 'probe-uid' }; },
    isSignedIn: function () { return true; },
    callFunction: function () { return Promise.resolve({ data: {} }); }
};
`;

const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.webp': 'image/webp', '.png': 'image/png' };

// The pre-fix version of the consumer, for the ablation.
const PREFIX_BROKEN = `            if (!firestoreSyncReady) {
                firestoreSyncReady = ensureFirestoreDeps().catch(function () { return false; });
            }
            firestoreSyncReady.then(function () {`;

const srv = http.createServer((req, res) => {
  const url = decodeURIComponent(req.url.split('?')[0]);
  if (url.endsWith('/components/FirestoreManager.js')) { res.writeHead(200, { 'Content-Type': 'text/javascript' }); res.end(FIRESTORE_STUB); return; }
  if (url.endsWith('/components/FirebaseAuth.js')) { res.writeHead(200, { 'Content-Type': 'text/javascript' }); res.end(AUTH_STUB); return; }
  if (url.endsWith('/components/ModuleProgress.js')) {
    let src = fs.readFileSync(path.join(ROOT, 'components/ModuleProgress.js'), 'utf8');
    if (ABLATE) {
      // Put the out-of-scope references back.
      src = src.replace(/\/\/ Reach the memo through the public API:[\s\S]*?ModuleProgress\._ensureFirestoreReady\(\)\.then\(function \(\) \{/, PREFIX_BROKEN);
    }
    res.writeHead(200, { 'Content-Type': 'text/javascript' }); res.end(src); return;
  }
  const p = path.join(ROOT, url);
  fs.readFile(p, (e, b) => {
    if (e) { res.writeHead(404); res.end('nf'); return; }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream' });
    res.end(b);
  });
});

let pass = 0, fail = 0; const fails = [];
function check(l, ok, d) { if (ok) { pass++; console.log(`  PASS  ${l}`); } else { fail++; fails.push(`${l}${d ? ': ' + d : ''}`); console.log(`  FAIL  ${l}${d ? ': ' + d : ''}`); } }

srv.listen(PORT, async () => {
  console.log(ABLATE ? 'ABLATED run (pre-fix source) — these checks MUST fail\n' : 'Fixed source\n');
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  try {
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
    await page.evaluateOnNewDocument(() => { localStorage.setItem('hexworth_house', 'cloud'); });

    // Any page that loads ModuleProgress.js. A quiz page pulls in all three components.
    await page.goto(`http://localhost:${PORT}/houses/cloud/openstack/quizzes/cloud-openstack-intro-quiz.quiz.html`,
      { waitUntil: 'domcontentloaded' });
    await new Promise((r) => setTimeout(r, 1000));

    check('_ensureFirestoreReady is exported', await page.evaluate(
      () => typeof ModuleProgress._ensureFirestoreReady === 'function'));

    // Fire the real event the bootstrap listens for.
    await page.evaluate(() => {
      window.dispatchEvent(new CustomEvent('firebaseAuthStateChanged', { detail: { user: { uid: 'probe-uid' } } }));
    });
    await new Promise((r) => setTimeout(r, 1500));

    const refErrors = errors.filter((e) => /firestoreSyncReady is not defined|ensureFirestoreDeps is not defined/.test(e));
    check('no ReferenceError on auth-state change', refErrors.length === 0, refErrors[0]);

    const calls = await page.evaluate(() => window.__syncCalls || []);
    check('syncBidirectional WAS actually called (the cloud pull runs)', calls.length > 0,
      `${calls.length} call(s)`);
    check('called with the signed-in uid', calls[0] === 'probe-uid', String(calls[0]));

    await page.close();
  } finally { await browser.close().catch(() => {}); srv.close(); }

  console.log(`\n${pass} passed, ${fail} failed`);
  fails.forEach((f) => console.log('  - ' + f));
  if (ABLATE) {
    console.log(fail > 0 ? '\nABLATION OK — the probe fails against the pre-fix source, so it is live.'
                         : '\nABLATION FAILED — probe passed against BROKEN source. It is a false oracle.');
    process.exit(fail > 0 ? 0 : 1);
  }
  process.exit(fail ? 1 : 0);
});
