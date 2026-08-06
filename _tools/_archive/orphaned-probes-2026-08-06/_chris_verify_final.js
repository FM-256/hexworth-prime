const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({headless: 'new', args: ['--no-sandbox']});
  const page = await browser.newPage();
  await page.setViewport({width: 390, height: 900, deviceScaleFactor: 2});
  await page.evaluateOnNewDocument(() => {
    localStorage.setItem('hexworth_house', 'eye');
    localStorage.setItem('hexworth_tourist_active', 'true');
    // neutralize FluxCapacitor devtools-detection interference for clean QC screenshots
    Object.defineProperty(window, '__CHRIS_QC__', {value: true});
  });
  await page.goto('http://localhost:8971/houses/eye/applets/osint/eye-google-dorking.applet.html', {waitUntil: 'networkidle0'});
  await new Promise(r => setTimeout(r, 300));

  // Kill FluxCapacitor's interval/listeners by removing its script effects each loop, then screenshot immediately
  const removeOverlay = async () => {
    await page.evaluate(() => {
      document.querySelectorAll('div').forEach(d => {
        const s = getComputedStyle(d);
        if (s.position === 'fixed' && (parseInt(s.zIndex||'0') > 1000)) d.remove();
      });
    });
  };

  await removeOverlay();
  const card = await page.$('section.card');
  const box = await card.boundingBox();
  // full-context viewport screenshot at the scroll position where card top is visible, WITHOUT captureBeyondViewport
  await page.evaluate((y) => window.scrollTo(0, y - 20), box.y);
  await new Promise(r => setTimeout(r, 100));
  await removeOverlay();
  await page.screenshot({path: '/tmp/claude-1000/-home-eq-ai-content-hexworth-prime/aaa65191-9601-4464-aadc-9ae84cdea571/scratchpad/context-1.png'});

  // measure overflow at each width to see if it's width-specific
  for (const w of [390, 768, 900]) {
    await page.setViewport({width: w, height: 900});
    await page.goto('http://localhost:8971/houses/eye/applets/osint/eye-google-dorking.applet.html', {waitUntil: 'networkidle0'});
    await new Promise(r => setTimeout(r, 200));
    const m = await page.evaluate(() => {
      const card = document.querySelectorAll('section.card')[0];
      const table = card.querySelector('table');
      const cRect = card.getBoundingClientRect();
      const tRect = table.getBoundingClientRect();
      const cs = getComputedStyle(card);
      return {
        width: window.innerWidth,
        cardRight: cRect.right, cardPaddingBoxRight: cRect.right - parseFloat(cs.paddingRight),
        tableRight: tRect.right,
        overflowPx: tRect.right - (cRect.right - parseFloat(cs.paddingRight))
      };
    });
    console.log(JSON.stringify(m));
  }

  await browser.close();
})();
