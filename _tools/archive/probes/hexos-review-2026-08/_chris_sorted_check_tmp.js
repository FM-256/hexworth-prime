const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.evaluateOnNewDocument(() => {
    try { localStorage.setItem('hexworth_house', 'ai'); } catch (e) {}
  });
  await page.goto('http://localhost:8842/dashboard.html', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await new Promise(r => setTimeout(r, 300));
  const result = await page.evaluate(() => {
    return {
      calloutCount: document.querySelectorAll('.hexos-callout').length,
      hbLinkCount: document.querySelectorAll('.hb-link[href="/hex/"]').length,
      house: localStorage.getItem('hexworth_house')
    };
  });
  console.log('SORTED case:', JSON.stringify(result));
  await browser.close();
})();
