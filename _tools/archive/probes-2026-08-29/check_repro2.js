const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({headless: 'new', args: ['--no-sandbox']});
  const page = await browser.newPage();
  await page.setViewport({width: 1920, height: 300});
  await page.goto('file:///home/eq/ai-content/hexworth-prime/test_repro2.html');
  await page.screenshot({path: '/home/eq/ai-content/hexworth-prime/repro2.png'});
  await browser.close();
})();
