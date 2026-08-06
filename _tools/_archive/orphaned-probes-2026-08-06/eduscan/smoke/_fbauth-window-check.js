// Measures whether `window.FirebaseAuth` is actually undefined on a real page that loads
// FirebaseAuth.js. Reasoning from "it's a top-level const" is a prediction; this is the check.
const puppeteer = require('puppeteer');
const http = require('http');
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '../../../_app');
const PORT = 8981;
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json' };
const srv = http.createServer((req, res) => {
  const p = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]));
  fs.readFile(p, (e, b) => { if (e) { res.writeHead(404); res.end('nf'); return; } res.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream' }); res.end(b); });
});
srv.listen(PORT, async () => {
  const b = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await b.newPage();
  await page.evaluateOnNewDocument(() => { localStorage.setItem('hexworth_house', 'cloud'); });
  // Any page that loads FirebaseAuth.js. Uses one of the untouched sibling quizzes.
  await page.goto(`http://localhost:${PORT}/houses/web/net-essentials/quizzes/cr-w2-network.quiz.html`, { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 1500));
  console.log(await page.evaluate(() => ({
    bareIdentifier: typeof FirebaseAuth,
    onWindow: typeof window.FirebaseAuth,
    windowGuardTruthy: !!window.FirebaseAuth,
    hasOwn: Object.prototype.hasOwnProperty.call(window, 'FirebaseAuth'),
  })));
  await b.close(); srv.close();
});
