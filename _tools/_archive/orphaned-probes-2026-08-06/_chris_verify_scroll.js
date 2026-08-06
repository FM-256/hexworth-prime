const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({headless: 'new', args: ['--no-sandbox']});
  const page = await browser.newPage();
  await page.setViewport({width: 390, height: 900, deviceScaleFactor: 2});
  await page.evaluateOnNewDocument(() => {
    localStorage.setItem('hexworth_house', 'eye');
    localStorage.setItem('hexworth_tourist_active', 'true');
  });
  await page.goto('http://localhost:8971/houses/eye/applets/osint/eye-google-dorking.applet.html', {waitUntil: 'networkidle0'});
  await new Promise(r => setTimeout(r, 300));
  await page.evaluate(() => {
    document.querySelectorAll('div').forEach(d => {
      const s = getComputedStyle(d);
      if (s.position === 'fixed' && parseInt(s.zIndex||'0') > 1000) d.remove();
    });
  });

  // scroll table's right column into the middle of the viewport, screenshot plain viewport (no captureBeyondViewport)
  const card = await page.$('section.card');
  await card.evaluate(el => el.scrollIntoView({block: 'start'}));
  await new Promise(r => setTimeout(r, 200));
  await page.screenshot({path: '/tmp/claude-1000/-home-eq-ai-content-hexworth-prime/aaa65191-9601-4464-aadc-9ae84cdea571/scratchpad/viewport-scrolled-1.png'});

  await page.evaluate(() => window.scrollBy(0, 800));
  await new Promise(r => setTimeout(r, 200));
  await page.screenshot({path: '/tmp/claude-1000/-home-eq-ai-content-hexworth-prime/aaa65191-9601-4464-aadc-9ae84cdea571/scratchpad/viewport-scrolled-2.png'});

  await browser.close();
})();
