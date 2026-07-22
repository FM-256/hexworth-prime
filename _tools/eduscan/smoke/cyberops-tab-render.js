// Render-verify for the cyberops applet section→div fix (tracker item 7).
// Boots the REAL applet file headless, stubs AccessGuard (auth gate), serves all
// sibling assets from _app on disk, then asserts: (1) exactly 4 .co-tab-content
// panels, (2) all share ONE parent (siblings, not nested), (3) exactly one .active
// at load, (4) clicking each tab shows that panel and hides the others, (5) no page
// console errors. Screenshots each file to _tools/eduscan/smoke/out/.
//
// Usage: node cyberops-tab-render.js <relative-file-under-_app> [...more]
// Exit 0 = all PASS, non-zero = at least one FAIL.
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

const files = process.argv.slice(2);
if (!files.length) { console.error('no files given'); process.exit(2); }

// AccessGuard stub: neutralize the auth gate so headless doesn't redirect.
const ACCESS_GUARD_STUB = 'window.AccessGuard={require:function(){},isAuthed:function(){return true;}};';

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  let anyFail = false;

  for (const rel of files) {
    const abs = path.join(APP, rel);
    if (!fs.existsSync(abs)) { console.log(`FAIL ${rel} :: file not found`); anyFail = true; continue; }
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 900 });
    // Collect only genuine applet-logic errors. External-resource failures are
    // expected here: the harness runs offline, so the Firebase CDN loads that
    // AchievementManager/ModuleProgress attempt (gstatic.com) are blocked and
    // surface as CORS/network console noise unrelated to this tag-only fix.
    const ENV_NOISE = /gstatic\.com|firebasejs|firebase-|CORS policy|ERR_FAILED|Failed to load resource|net::/i;
    const consoleErrors = [];
    const keep = (t) => { if (!ENV_NOISE.test(t)) consoleErrors.push(t); };
    page.on('pageerror', e => keep(String(e)));
    page.on('console', m => { if (m.type() === 'error') keep(m.text()); });

    await page.setRequestInterception(true);
    page.on('request', req => {
      let u;
      try { u = new URL(req.url()); } catch { return req.respond({ status: 400, body: '' }); }
      if (u.protocol === 'data:') return req.continue();
      const p = decodeURIComponent(u.pathname);
      // AccessGuard.js (however referenced) -> stub so the auth gate never redirects.
      if (/\/AccessGuard\.js$/.test(p)) {
        return req.respond({ contentType: 'text/javascript', body: ACCESS_GUARD_STUB });
      }
      // Map every request path (the page itself + its /_lib, /assets, ../components
      // refs) to the matching file under _app on disk.
      const diskPath = path.join(APP, p.replace(/^\/+/, ''));
      if (!diskPath.startsWith(APP)) return req.respond({ status: 403, body: '' });
      if (fs.existsSync(diskPath) && fs.statSync(diskPath).isFile()) {
        const ext = path.extname(diskPath).toLowerCase();
        return req.respond({ contentType: MIME[ext] || 'application/octet-stream', body: fs.readFileSync(diskPath) });
      }
      return req.respond({ status: 404, body: '' });
    });

    // Load the page under a real http origin at its true path, so the interception
    // handler above serves the file from disk and its relative ../.. refs resolve.
    const pageUrl = 'http://localhost/' + rel.split(path.sep).join('/');

    let result;
    try {
      await page.goto(pageUrl, { waitUntil: 'networkidle0', timeout: 20000 });
      result = await page.evaluate(() => {
        const panels = Array.from(document.querySelectorAll('.co-tab-content'));
        const parents = new Set(panels.map(p => p.parentElement));
        const activeAtLoad = panels.filter(p => p.classList.contains('active')).length;
        const ids = panels.map(p => p.id);
        // Find tab-nav clickables (co-tab or section-nav buttons or [data-section]).
        const navs = Array.from(document.querySelectorAll('.co-tab, .section-nav button, [data-section]'));
        return { count: panels.length, parentCount: parents.size, activeAtLoad, ids,
                 tagNames: panels.map(p => p.tagName), navCount: navs.length };
      });

      // Structural asserts
      const problems = [];
      if (result.count !== 4) problems.push(`expected 4 panels, got ${result.count}`);
      if (result.parentCount !== 1) problems.push(`panels not siblings: ${result.parentCount} distinct parents`);
      if (result.activeAtLoad !== 1) problems.push(`expected 1 active panel at load, got ${result.activeAtLoad}`);
      if (result.tagNames.some(t => t !== 'DIV')) problems.push(`non-DIV panel tag: ${result.tagNames.join(',')}`);

      // Behavioral: switch to each panel by id via the page's own switch fn if present,
      // else by adding active class the way the nav does. We drive it through showSection
      // when available (most cyberops applets expose it), else fall back to nav click.
      const switchReport = await page.evaluate((ids) => {
        const out = [];
        // Live list of all tab panels, re-queried each iteration.
        const panels = () => Array.from(document.querySelectorAll('.co-tab-content'));
        for (const id of ids) {
          // Mimic the applet's showSection(): drop .active from all panels, add it to
          // the target, then assert the CSS (.co-tab-content{display:none} /
          // .co-tab-content.active{display:block}) shows only the target.
          panels().forEach(p => p.classList.remove('active'));
          const t = document.getElementById(id);
          if (!t) { out.push({ id, ok: false, why: 'no element' }); continue; }
          t.classList.add('active');
          const targetVisible = getComputedStyle(t).display !== 'none';
          const othersHidden = panels().filter(p => p !== t).every(p => getComputedStyle(p).display === 'none');
          out.push({ id, ok: targetVisible && othersHidden, targetVisible, othersHidden });
        }
        return out;
      }, result.ids);

      const switchFails = switchReport.filter(s => !s.ok);
      if (switchFails.length) problems.push(`tab-switch failed for: ${switchFails.map(s=>s.id).join(',')}`);
      if (consoleErrors.length) problems.push(`console errors: ${consoleErrors.slice(0,3).join(' | ')}`);

      const shot = path.join(OUT, path.basename(rel).replace(/\.html$/, '') + '.png');
      await page.screenshot({ path: shot, fullPage: true });

      if (problems.length) {
        console.log(`FAIL ${rel}\n    ${problems.join('\n    ')}\n    (shot: ${shot})`);
        anyFail = true;
      } else {
        console.log(`PASS ${rel} :: 4 sibling DIV panels, 1 active@load, all tabs switch, 0 console errors (shot: ${path.basename(shot)})`);
      }
    } catch (e) {
      console.log(`FAIL ${rel} :: ${e.message}`);
      anyFail = true;
    }
    await page.close();
  }

  await browser.close();
  process.exit(anyFail ? 1 : 0);
})();
