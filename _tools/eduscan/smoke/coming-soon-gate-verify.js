// Verify the BUG-012 coming-soon gate on a hub page: every not-yet-built
// content-card is dimmed (.is-coming-soon), carries a "Coming soon" badge, and
// its click is intercepted (no navigation); a known-built card is NOT gated and
// keeps a working href. Boots the REAL hub headless, stubs auth/Firebase, serves
// all assets from _app on disk.
//
// Usage: node coming-soon-gate-verify.js <rel-hub-under-_app> <expectedGatedCount> <builtSampleHref>
// Exit 0 = PASS, non-zero = FAIL.
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const REPO = path.resolve(__dirname, '../../..');
const APP = path.join(REPO, '_app');
const OUT = path.join(__dirname, 'out');
fs.mkdirSync(OUT, { recursive: true });

const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
  '.webp': 'image/webp', '.png': 'image/png', '.svg': 'image/svg+xml',
  '.json': 'application/json', '.woff2': 'font/woff2', '.woff': 'font/woff' };

const rel = process.argv[2];
const expectedGated = parseInt(process.argv[3], 10);
const builtSample = process.argv[4];
if (!rel || !expectedGated || !builtSample) { console.error('args: <rel> <count> <builtHref>'); process.exit(2); }

// Neutralize auth/tenant/firebase so headless doesn't redirect or hang.
const STUBS = {
  AccessGuard: 'window.AccessGuard={require:function(){},isAuthed:function(){return true;}};',
  FirebaseAuth: 'window.FirebaseAuth={onReady:function(cb){try{cb&&cb(null)}catch(e){}},getUser:function(){return null;}};',
  TenantRouter: 'window.TenantRouter={isActive:function(){return false;},getUrl:function(p){return "/"+p;}};'
};

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 1000 });

  // Only count genuine page-logic errors; external CDN/network noise is expected offline.
  const ENV_NOISE = /gstatic\.com|firebasejs|firebase-|CORS policy|ERR_FAILED|Failed to load resource|net::/i;
  const errors = [];
  page.on('pageerror', e => { if (!ENV_NOISE.test(String(e))) errors.push(String(e)); });
  page.on('console', m => { if (m.type() === 'error' && !ENV_NOISE.test(m.text())) errors.push(m.text()); });

  // Serve every request from _app on disk; swap in JS stubs for the auth/tenant deps.
  await page.setRequestInterception(true);
  page.on('request', req => {
    let u;
    try { u = new URL(req.url()); } catch { return req.respond({ status: 400, body: '' }); }
    if (u.protocol === 'data:') return req.continue();
    const p = decodeURIComponent(u.pathname);
    const base = path.basename(p).replace(/\.js$/, '');
    if (STUBS[base]) return req.respond({ contentType: 'text/javascript', body: STUBS[base] });
    const diskPath = path.join(APP, p.replace(/^\/+/, ''));
    if (!diskPath.startsWith(APP)) return req.respond({ status: 403, body: '' });
    if (fs.existsSync(diskPath) && fs.statSync(diskPath).isFile()) {
      const ext = path.extname(diskPath).toLowerCase();
      return req.respond({ contentType: MIME[ext] || 'application/octet-stream', body: fs.readFileSync(diskPath) });
    }
    return req.respond({ status: 404, body: '' });
  });

  const pageUrl = 'http://localhost/' + rel.split(path.sep).join('/');
  const problems = [];
  try {
    await page.goto(pageUrl, { waitUntil: 'networkidle0', timeout: 25000 });

    // Structural + behavioral assertions, evaluated in the page.
    const r = await page.evaluate((builtHref) => {
      const gated = Array.from(document.querySelectorAll('a.content-card.is-coming-soon'));
      const gatedWithBadge = gated.filter(a => a.querySelector('.cs-badge'));
      // A built sample card must exist, not be gated, and keep a real href.
      const built = document.querySelector('a.content-card[href="' + builtHref + '"]');
      return {
        gatedCount: gated.length,
        gatedWithBadge: gatedWithBadge.length,
        builtExists: !!built,
        builtGated: built ? built.classList.contains('is-coming-soon') : null,
        builtHrefIntact: built ? built.getAttribute('href') === builtHref : null,
        firstGatedHref: gated.length ? gated[0].getAttribute('href') : null
      };
    }, builtSample);

    if (r.gatedCount !== expectedGated) problems.push(`expected ${expectedGated} gated cards, got ${r.gatedCount}`);
    if (r.gatedWithBadge !== r.gatedCount) problems.push(`${r.gatedCount - r.gatedWithBadge} gated cards missing a .cs-badge`);
    if (!r.builtExists) problems.push(`built sample card not found: ${builtSample}`);
    if (r.builtGated) problems.push(`built sample card was wrongly gated`);
    if (r.builtExists && !r.builtHrefIntact) problems.push(`built sample href was altered`);

    // Behavioral: clicking a gated card must NOT navigate away.
    if (r.firstGatedHref) {
      await page.evaluate(() => { window.__origHref = location.href; window.alert = function(){}; });
      await page.evaluate((href) => {
        const a = document.querySelector('a.content-card.is-coming-soon[href="' + href + '"]');
        if (a) a.click();
      }, r.firstGatedHref);
      await new Promise(res => setTimeout(res, 150));
      const stayed = await page.evaluate(() => location.href === window.__origHref);
      if (!stayed) problems.push('clicking a gated card navigated away (should be blocked)');
    }

    if (errors.length) problems.push('page errors: ' + errors.slice(0, 3).join(' | '));

    const shot = path.join(OUT, path.basename(rel).replace(/\.html$/, '') + '-gate.png');
    await page.screenshot({ path: shot, fullPage: true });

    if (problems.length) { console.log(`FAIL ${rel}\n    ` + problems.join('\n    ') + `\n    (shot: ${shot})`); }
    else { console.log(`PASS ${rel} :: ${r.gatedCount} gated+badged, built card navigates, click blocked, 0 page errors (shot: ${path.basename(shot)})`); }
  } catch (e) {
    problems.push('exception: ' + e.message);
    console.log(`FAIL ${rel} :: ${e.message}`);
  }

  await browser.close();
  process.exit(problems.length ? 1 : 0);
})();
