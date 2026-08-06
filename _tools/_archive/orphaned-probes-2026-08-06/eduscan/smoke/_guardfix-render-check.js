// Boots every page touched by the BUG-071 guard fix and reports runtime errors.
// Parsing clean != running clean: the substitution changed expressions, and a semantic break
// (wrong truthiness, changed operator precedence) only shows at runtime.
const puppeteer = require('puppeteer');
const http = require('http');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.resolve(__dirname, '../../../_app');
const PORT = 8984;
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.webp': 'image/webp', '.png': 'image/png', '.svg': 'image/svg+xml', '.mp3': 'audio/mpeg', '.ogg': 'audio/ogg', '.woff2': 'font/woff2' };

const files = execSync('git show --name-only --pretty=format: d6bcd61bb', { encoding: 'utf8' })
  .split('\n').filter((f) => f.startsWith('_app/') && f.endsWith('.html'));

// Known pre-existing, unrelated to this change (see BUG_TRACKER).
const KNOWN = [/firestoreSyncReady is not defined/];

const srv = http.createServer((req, res) => {
  const p = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]));
  fs.readFile(p, (e, b) => {
    if (e) { res.writeHead(404); res.end('nf'); return; }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream' });
    res.end(b);
  });
});

srv.listen(PORT, async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  let clean = 0; const dirty = [];
  try {
    for (const f of files) {
      const url = '/' + f.replace(/^_app\//, '');
      const page = await browser.newPage();
      const errs = [];
      page.on('pageerror', (e) => errs.push(e.message));
      page.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
      // House satisfies AccessGuard; derived from the path so each page gets its own.
      const house = (f.match(/houses\/([^/]+)\//) || [, 'web'])[1];
      await page.evaluateOnNewDocument((h) => { localStorage.setItem('hexworth_house', h); }, house);
      try {
        await page.goto(`http://localhost:${PORT}${url}`, { waitUntil: 'domcontentloaded', timeout: 20000 });
        await new Promise((r) => setTimeout(r, 1000));
      } catch (e) { errs.push('NAV: ' + e.message); }
      const real = errs.filter((e) => !KNOWN.some((k) => k.test(e)) && !/favicon|404|Failed to load resource/i.test(e));
      if (real.length) dirty.push(`${f}\n      ${real.slice(0, 2).join('\n      ')}`);
      else clean++;
      await page.close();
    }
  } finally { await browser.close().catch(() => {}); srv.close(); }
  console.log(`\n${clean}/${files.length} changed pages boot clean`);
  if (dirty.length) { console.log('\nPAGES WITH RUNTIME ERRORS:'); dirty.forEach((d) => console.log('  ' + d)); }
  process.exit(dirty.length ? 1 : 0);
});
