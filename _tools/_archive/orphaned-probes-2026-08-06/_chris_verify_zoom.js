const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({headless: 'new', args: ['--no-sandbox']});
  const page = await browser.newPage({});
  await page.setViewport({width: 390, height: 900, deviceScaleFactor: 3});
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
  await new Promise(r => setTimeout(r, 100));

  const table = await page.$('section.card table');
  await table.screenshot({path: '/tmp/claude-1000/-home-eq-ai-content-hexworth-prime/aaa65191-9601-4464-aadc-9ae84cdea571/scratchpad/table-zoom.png'});

  // pixel-check: is any text actually rendered outside the card's visible box (clipped by ancestor overflow)?
  const clipCheck = await page.evaluate(() => {
    const card = document.querySelectorAll('section.card')[0];
    const cardStyle = getComputedStyle(card);
    const wrap = document.querySelector('main.wrap');
    const wrapStyle = getComputedStyle(wrap);
    return {
      cardOverflow: cardStyle.overflow,
      cardOverflowX: cardStyle.overflowX,
      wrapOverflow: wrapStyle.overflow,
      bodyOverflowX: getComputedStyle(document.body).overflowX,
      htmlOverflowX: getComputedStyle(document.documentElement).overflowX,
    };
  });
  console.log(JSON.stringify(clipCheck, null, 2));

  await browser.close();
})();
