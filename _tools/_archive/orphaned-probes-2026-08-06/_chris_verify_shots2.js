const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({headless: 'new', args: ['--no-sandbox']});
  const page = await browser.newPage();
  await page.evaluateOnNewDocument(() => {
    localStorage.setItem('hexworth_house', 'eye');
    localStorage.setItem('hexworth_tourist_active', 'true');
  });
  await page.setViewport({width: 390, height: 1400});
  await page.goto('http://localhost:8971/houses/eye/applets/osint/eye-google-dorking.applet.html', {waitUntil: 'networkidle0'});
  await new Promise(r => setTimeout(r, 300));

  // remove any FluxCapacitor overlay so we can see the real render
  await page.evaluate(() => {
    document.querySelectorAll('[class*="devtools" i], [id*="devtools" i], [id*="flux" i], [class*="flux" i]').forEach(el => el.remove());
    // also broad sweep: any fixed-position full-screen overlay
    document.querySelectorAll('div').forEach(d => {
      const s = getComputedStyle(d);
      if (s.position === 'fixed' && parseInt(s.zIndex||'0') > 1000) d.remove();
    });
  });
  await new Promise(r => setTimeout(r, 200));

  const cards = await page.$$('section.card');
  await cards[0].screenshot({path: '/tmp/claude-1000/-home-eq-ai-content-hexworth-prime/aaa65191-9601-4464-aadc-9ae84cdea571/scratchpad/card0-390-clean.png'});
  await cards[2].screenshot({path: '/tmp/claude-1000/-home-eq-ai-content-hexworth-prime/aaa65191-9601-4464-aadc-9ae84cdea571/scratchpad/card2-390-clean.png'});
  await page.screenshot({path: '/tmp/claude-1000/-home-eq-ai-content-hexworth-prime/aaa65191-9601-4464-aadc-9ae84cdea571/scratchpad/full-390-clean.png', fullPage: true});

  await browser.close();
})();
