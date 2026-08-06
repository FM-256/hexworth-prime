const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({headless: 'new', args: ['--no-sandbox']});
  const page = await browser.newPage();
  await page.setRequestInterception(true);
  page.on('request', req => {
    if (req.url().includes('FluxCapacitor.js')) return req.respond({status: 200, contentType: 'application/javascript', body: '// blocked for QC clarity'});
    req.continue();
  });
  await page.setViewport({width: 390, height: 900, deviceScaleFactor: 2});
  await page.evaluateOnNewDocument(() => {
    localStorage.setItem('hexworth_house', 'eye');
    localStorage.setItem('hexworth_tourist_active', 'true');
  });
  await page.goto('http://localhost:8971/houses/eye/applets/osint/eye-google-dorking.applet.html', {waitUntil: 'networkidle0'});
  await new Promise(r => setTimeout(r, 300));
  const card = await page.$('section.card');
  const box = await card.boundingBox();
  await page.evaluate((y) => window.scrollTo(0, y - 10), box.y);
  await new Promise(r => setTimeout(r, 100));
  await page.screenshot({path: '/tmp/claude-1000/-home-eq-ai-content-hexworth-prime/aaa65191-9601-4464-aadc-9ae84cdea571/scratchpad/refix-390-check.png'});
  await browser.close();
})();
