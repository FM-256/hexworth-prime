const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox','--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('https://hexworth.com/', { waitUntil: 'networkidle2', timeout: 45000 });
  await new Promise(r=>setTimeout(r,1500));
  const el = await page.$('.nav-brand');
  await el.screenshot({ path: '/tmp/claude-1000/-home-eq-ai-content-hexworth-prime/aaa65191-9601-4464-aadc-9ae84cdea571/scratchpad/shots/navbrand-el.png' });
  // also zoom in via clip at 4x by evaluating a devicePixelRatio-esque manual zoom: use page.screenshot with clip
  const box = await el.boundingBox();
  await page.evaluate(() => { document.body.style.zoom = '4'; });
  await new Promise(r=>setTimeout(r,300));
  const el2 = await page.$('.nav-brand img');
  await el2.screenshot({ path: '/tmp/claude-1000/-home-eq-ai-content-hexworth-prime/aaa65191-9601-4464-aadc-9ae84cdea571/scratchpad/shots/navbrand-zoomed.png' });
  await browser.close();
})();
