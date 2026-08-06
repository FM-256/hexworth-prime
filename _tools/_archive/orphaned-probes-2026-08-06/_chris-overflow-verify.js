const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox','--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  await page.goto('https://hexworth.com/', { waitUntil: 'networkidle2', timeout: 45000 });
  await new Promise(r=>setTimeout(r,2000));
  const info = await page.evaluate(() => {
    return {
      htmlScrollWidth: document.documentElement.scrollWidth,
      htmlClientWidth: document.documentElement.clientWidth,
      bodyScrollWidth: document.body.scrollWidth,
      bodyClientWidth: document.body.clientWidth,
      bodyOverflowX: getComputedStyle(document.body).overflowX,
      htmlOverflowX: getComputedStyle(document.documentElement).overflowX,
    };
  });
  console.log('before scroll attempt', JSON.stringify(info, null, 2));
  const beforeX = await page.evaluate(() => window.scrollX);
  await page.evaluate(() => window.scrollTo(1000, 0));
  await new Promise(r=>setTimeout(r,300));
  const afterX = await page.evaluate(() => window.scrollX);
  console.log('scrollX before/after forced scrollTo(1000,0):', beforeX, afterX);
  await browser.close();
})();
