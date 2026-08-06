// Measures, on a REAL page, whether the components guarded via `window.X` are actually
// reachable that way. The grep says they are lexical consts; this is the check that the grep's
// conclusion is true in a browser, before any of it gets written down as a bug.
const puppeteer = require('puppeteer');
const http = require('http');
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '../../../_app');
const PORT = 8982;
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.webp': 'image/webp', '.png': 'image/png' };
const srv = http.createServer((req, res) => {
  const p = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]));
  fs.readFile(p, (e, b) => { if (e) { res.writeHead(404); res.end('nf'); return; } res.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream' }); res.end(b); });
});

// A page that loads the components in question and guards on window.*
const TARGET = process.env.TARGET || '/houses/key/games/key-cipher-bubbles.applet.html';
const NAMES = ['AchievementManager', 'FirestoreManager', 'GameTracker', 'AchievementRegistry', 'FirebaseAuth'];

srv.listen(PORT, async () => {
  const b = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await b.newPage();
  await page.evaluateOnNewDocument(() => { localStorage.setItem('hexworth_house', 'key'); });
  await page.goto(`http://localhost:${PORT}${TARGET}`, { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 2000));
  const out = await page.evaluate((names) => {
    const r = {};
    names.forEach((n) => {
      let bare = 'not-loaded';
      try { bare = eval(`typeof ${n}`); } catch (e) { bare = 'throws'; }
      r[n] = { bare, onWindow: typeof window[n], guardPasses: !!window[n] };
    });
    return r;
  }, NAMES);
  console.log(`page: ${TARGET}`);
  for (const [n, v] of Object.entries(out)) {
    const verdict = v.bare === 'undefined' || v.bare === 'not-loaded'
      ? 'not loaded on this page (no conclusion)'
      : (v.guardPasses ? 'window guard WORKS' : 'window guard ALWAYS FALSE  <-- feature never fires');
    console.log(`  ${n.padEnd(22)} bare=${String(v.bare).padEnd(10)} window=${String(v.onWindow).padEnd(10)} ${verdict}`);
  }
  await b.close(); srv.close();
});
