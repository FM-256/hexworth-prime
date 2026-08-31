const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({headless: 'new', args: ['--no-sandbox']});
  const page = await browser.newPage();
  page.on('console', msg => console.log('CONSOLE:', msg.type(), msg.text()));
  page.on('pageerror', err => console.log('PAGEERROR:', err.message));
  page.on('requestfailed', req => console.log('REQFAIL:', req.url(), req.failure().errorText));
  await page.goto('http://localhost:8842/dashboard.html', {waitUntil: 'domcontentloaded', timeout: 15000});
  await new Promise(r=>setTimeout(r, 1500));
  const html = await page.content();
  console.log('HTML length:', html.length);
  console.log('has hexos-callout:', html.includes('hexos-callout'));
  const bodyHtmlHead = await page.evaluate(() => document.readyState);
  console.log('readyState:', bodyHtmlHead);
  await browser.close();
})();
