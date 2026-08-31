const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  page.on('console', msg => console.log('CONSOLE:', msg.text()));
  page.on('pageerror', err => console.log('PAGEERROR:', err.message));
  page.on('requestfailed', req => console.log('REQFAIL:', req.url(), req.failure()?.errorText));

  const filePath = 'file://' + path.resolve('_app/dashboard.html');
  await page.goto(filePath, { waitUntil: 'domcontentloaded', timeout: 20000 }).catch(e => console.log('nav warn:', e.message));

  await new Promise(r => setTimeout(r, 3000));
  const info = await page.evaluate(() => ({
    href: location.href,
    hasPageTransition: typeof window.PageTransition,
    house: localStorage.getItem('hexworth_house'),
  }));
  console.log(JSON.stringify(info));
  await browser.close();
})();
