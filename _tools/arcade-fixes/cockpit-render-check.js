#!/usr/bin/env node
// cockpit-render-check.js — browser-level regression gate for the Arcade Fixes cockpit.
//
// The admin console (_app/admin/console.html) is ONE ~7,000-line IIFE: a single broken template
// literal takes down every panel, and the page is auth-gated so it doesn't fit run.js's simple-URL
// smoke model. This check loads it headless, stubs the auth guard so it renders instead of
// redirecting, drives the exposed afxLoad/afxOpen against the real merged arcade-health.json, and
// asserts the content-quality dimension (fixed/assessed/pending) renders with 0 pageErrors and no
// null/[object Object] leak. Run it before shipping any change to the cockpit render or the generator.
//
// Usage: node _tools/arcade-fixes/cockpit-render-check.js   (exit 0 = pass)
const http = require('http'), fs = require('fs'), path = require('path');
const pup = require('puppeteer');
const APP = path.resolve(__dirname, '../../_app');
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.css': 'text/css', '.webp': 'image/webp', '.png': 'image/png', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.woff': 'font/woff' };
const sleep = (ms) => new Promise(r => setTimeout(r, ms)); // await a delay in the async driver
let pass = true;
// ok(name, cond, extra): record + print one assertion; flips the global pass flag on failure.
const ok = (n, c, e) => { if (!c) pass = false; console.log('  ' + (c ? 'PASS' : 'FAIL') + '  ' + n + (e !== undefined ? '  ' + JSON.stringify(e).slice(0, 240) : '')); };

// Static file server rooted at _app so console.html + its assets + arcade-health.json load same-origin.
const srv = http.createServer((q, s) => {
  let p = decodeURIComponent(q.url.split('?')[0]); let fp = path.join(APP, p);
  if (fs.existsSync(fp) && fs.statSync(fp).isFile()) { s.writeHead(200, { 'Content-Type': MIME[path.extname(fp)] || 'application/octet-stream' }); fs.createReadStream(fp).pipe(s); }
  else { s.writeHead(404); s.end('nf'); }
});

(async () => {
  await new Promise(r => srv.listen(0, r)); const port = srv.address().port;
  const b = await pup.launch({ headless: 'new', args: ['--no-sandbox'] });
  const pg = await b.newPage();
  const errs = [];
  // Capture uncaught errors, ignoring expected no-creds Firebase/auth noise (matches run.js's ignore set).
  pg.on('pageerror', e => { const m = String(e.message); if (!/firebase|firestore|auth\/|AccountFrame|FirebaseAuth|not authenticated/i.test(m)) errs.push(m.slice(0, 200)); });
  await pg.setRequestInterception(true);
  // Stub the auth guard's two dependencies so guardAdmin() passes (admin) and the page renders
  // instead of redirecting to dashboard.html. The render code is what we regression-test.
  pg.on('request', r => {
    const u = r.url();
    if (u.endsWith('FirebaseAuth.js')) r.respond({ status: 200, contentType: 'text/javascript', body: "window.FirebaseAuth={waitForAuth:async()=>({displayName:'QC',email:'qc@test'}),isAdmin:()=>true};" });
    else if (u.endsWith('AccountFrame.js')) r.respond({ status: 200, contentType: 'text/javascript', body: "window.AccountFrame={getAccountType:()=>'admin'};" });
    else r.continue();
  });
  await pg.goto('http://localhost:' + port + '/admin/console.html', { waitUntil: 'domcontentloaded', timeout: 20000 }).catch(() => {});
  await sleep(500);

  // Public cockpit functions on window prove the whole IIFE parsed + ran (catches a broken template literal).
  const haveFns = await pg.evaluate(() => ({ load: typeof window.afxLoad, open: typeof window.afxOpen, close: typeof window.afxCloseModal }));
  ok('public cockpit functions on window (IIFE ran fully): afxLoad/afxOpen/afxCloseModal', haveFns.load === 'function' && haveFns.open === 'function' && haveFns.close === 'function', haveFns);

  // Drive the real load + render against the served merged snapshot.
  await pg.evaluate(() => window.afxLoad(true));
  await sleep(500);

  const view = await pg.evaluate(() => ({
    stats: (document.getElementById('afxStats') || {}).innerHTML || '',
    list: (document.getElementById('afxList') || {}).innerHTML || '',
    queue: (document.getElementById('afxQueue') || {}).innerHTML || '',
    gen: (document.getElementById('afxGen') || {}).textContent || ''
  }));
  const allHtml = view.stats + view.list + view.queue;
  ok('stat strip shows a Content fixed card', /Content fixed/.test(view.stats));
  ok('inventory rendered rows (non-empty table)', view.list.length > 500 && /<table/.test(view.list), { len: view.list.length });
  ok('fixed badge present (a shipped fix shows fixed)', view.list.indexOf('fixed') > -1);
  ok('assessed badge present (audited-not-fixed games)', view.list.indexOf('assessed') > -1);
  ok('NO literal null / undefined / [object Object] leaked into rendered HTML', !/>\s*null\s*<|>\s*undefined\s*<|\[object Object\]/.test(allHtml));
  ok('generatedAt shown', view.gen.length > 8, view.gen);

  // Compute a fixed + an assessed game index node-side (afxCQ/_afxData are IIFE-internal), drive afxOpen.
  const snap = JSON.parse(fs.readFileSync(path.join(APP, 'arcade-health.json'), 'utf8'));
  const statusOf = (g) => { const c = g.health ? g.health.contentQuality : null; return (c && typeof c === 'object') ? c.status : (c || 'pending'); };
  const fixedI = snap.games.findIndex(g => statusOf(g) === 'fixed');
  const assessedI = snap.games.findIndex(g => statusOf(g) === 'assessed');
  const modal = await pg.evaluate((fixedI, assessedI) => {
    const out = {};
    [['fixed', fixedI], ['assessed', assessedI]].forEach(([k, i]) => {
      document.querySelectorAll('.afx-modal').forEach(m => m.remove());
      if (i > -1) { window.afxOpen(i); const m = document.querySelector('.afx-modal'); out[k] = m ? m.innerHTML : ''; if (m) m.remove(); }
      else out[k] = null;
    });
    return out;
  }, fixedI, assessedI);
  ok('FIXED-game modal shows Content: FIXED + a Fix: line, no null leak', modal.fixed && /Content:/.test(modal.fixed) && /Fix:/.test(modal.fixed) && !/\[object Object\]|>\s*null\s*</.test(modal.fixed));
  ok('ASSESSED-game modal shows Content: ASSESSED, no Fix line, no null leak', modal.assessed && /Content:/.test(modal.assessed) && !/Fix:/.test(modal.assessed) && !/\[object Object\]|>\s*null\s*</.test(modal.assessed));

  ok('0 non-firebase pageErrors', errs.length === 0, errs.slice(0, 4));

  await b.close(); srv.close();
  console.log(pass ? '\n*** COCKPIT RENDER OK ***' : '\n!!! COCKPIT RENDER FAILURES ABOVE !!!');
  process.exit(pass ? 0 : 1);
})();
