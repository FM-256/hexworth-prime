const puppeteer = require('puppeteer');

async function testLaunch(browser, appName) {
  const page = await browser.newPage();
  await page.evaluateOnNewDocument(() => {
    try {
      localStorage.setItem('hexworth_sorted', 'true');
      localStorage.setItem('hexworth_house', 'shield');
    } catch (e) {}
  });
  await page.goto('http://localhost:8842/hex/index.html', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 400));
  await page.focus('#cmd');
  await page.type('#cmd', 'run ' + appName);
  await Promise.all([
    page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 5000 }).catch(e => 'NAV_TIMEOUT: ' + e.message),
    page.keyboard.press('Enter'),
  ]);
  await new Promise(r => setTimeout(r, 300));
  const url = page.url();
  const status = await page.evaluate(() => document.title + ' | bodyLen=' + document.body.innerHTML.length);
  console.log(appName, '->', url, '|', status);
  await page.close();
}

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  for (const app of ['arena', 'hex', 'bug-hunting', 'dojo', 'cve-evaluator', 'career', 'hub']) {
    await testLaunch(browser, app);
  }
  await browser.close();
})();
