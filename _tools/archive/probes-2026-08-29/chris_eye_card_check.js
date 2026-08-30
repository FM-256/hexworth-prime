const puppeteer = require('puppeteer');
const http = require('http');
const fs = require('fs');
const path = require('path');

const APP = '/home/eq/ai-content/hexworth-prime/_app';
const PORT = 8914;
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css' };

function serve() {
  return new Promise(resolve => {
    const srv = http.createServer((req, res) => {
      let p = decodeURIComponent(req.url.split('?')[0]);
      if (p.endsWith('/')) p += 'index.html';
      const file = path.join(APP, p);
      if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); return res.end('nope'); }
      res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream' });
      res.end(fs.readFileSync(file));
    });
    srv.listen(PORT, '127.0.0.1', () => resolve(srv));
  });
}

(async () => {
  const srv = await serve();
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1180, height: 900 });
  await page.goto(`http://127.0.0.1:${PORT}/career/career-paths.html`, { waitUntil: 'networkidle0' });

  // Find Eye card and click it to expand roadmap
  const clicked = await page.evaluate(() => {
    const cards = [...document.querySelectorAll('.house-card, [data-house], .career-card')];
    return cards.map(c => c.textContent.slice(0,50));
  });
  console.log('cards found sample:', clicked.slice(0,3));

  // try find element containing 'Eye' text and click
  const eyeHandle = await page.evaluateHandle(() => {
    const all = [...document.querySelectorAll('*')];
    return all.find(el => el.children.length===0 && el.textContent.trim()==='Eye');
  });
  const card = await page.evaluateHandle(el => el ? el.closest('[class*="card"]') : null, eyeHandle);
  if (card) {
    await card.asElement().click();
    await new Promise(r=>setTimeout(r,300));
  }

  const result = await page.evaluate(() => {
    const panels = [...document.querySelectorAll('.roadmap-panel.open')];
    if (!panels.length) return { error: 'no open roadmap panel found' };
    const panel = panels[0];
    const steps = [...panel.querySelectorAll('.roadmap-steps li')].map(li => li.textContent.trim());
    const rect = panel.getBoundingClientRect();
    const overflowX = panel.scrollWidth > panel.clientWidth + 1;
    const card = panel.closest('[class*="card"]');
    const cardRect = card ? card.getBoundingClientRect() : null;
    return { steps, rect: {w:rect.width,h:rect.height}, overflowX,
      cardRect, bodyScrollWidth: document.body.scrollWidth, viewportWidth: window.innerWidth };
  });
  console.log(JSON.stringify(result, null, 2));

  await page.screenshot({ path: '/tmp/claude-1000/-home-eq-ai-content-hexworth-prime/2f9c2d95-8de7-4fbb-bf58-ed2b72f793dd/scratchpad/eye_card.png', fullPage:false });

  await browser.close();
  srv.close();
})();
