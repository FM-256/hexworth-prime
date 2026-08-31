const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({headless: 'new', args: ['--no-sandbox']});
  const page = await browser.newPage();
  // No hexworth_house set -> unsorted visitor
  await page.goto('http://localhost:8842/hex/', {waitUntil: 'networkidle0', timeout: 20000});
  await new Promise(r=>setTimeout(r,1000));
  console.log('unsorted visit to /hex/ landed on:', page.url());
  await browser.close();
})();
