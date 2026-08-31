const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  // No localStorage seeded -> unsorted visitor
  const navPromise = new Promise(resolve => {
    page.on('framenavigated', frame => {
      if (frame === page.mainFrame()) resolve(frame.url());
    });
  });
  const filePath = 'file://' + path.resolve('_app/dashboard.html');
  await page.goto(filePath, { waitUntil: 'domcontentloaded', timeout: 20000 }).catch(e => console.log('nav warn:', e.message));

  const finalUrl = await Promise.race([
    navPromise,
    new Promise(r => setTimeout(() => r('TIMEOUT-no-redirect'), 4000))
  ]);
  console.log('final/redirected URL:', finalUrl);
  await browser.close();
})();
