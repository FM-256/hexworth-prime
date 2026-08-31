const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({args: ['--no-sandbox']});
  const page = await browser.newPage();
  let alertFired = false;
  page.on('dialog', async d => { alertFired = true; console.log('[ALERT FIRED]', d.message()); await d.dismiss(); });

  await page.evaluateOnNewDocument(() => {
    sessionStorage.setItem('hexworth_master_key_expiry', (Date.now() + 3600000).toString());
  });

  await page.setRequestInterception(true);
  page.on('request', async (req) => {
    if (req.url().endsWith('/data/hex-apps.json')) {
      const body = JSON.stringify({ apps: [
        { id: '<img src=x onerror=alert(1)>', name: 'evil', category: 'course', house: 'matrix', entry: '/x' },
        { id: '<script>alert(2)</script>', name: 'evil2', category: 'course', house: 'matrix', entry: '/x' }
      ]});
      req.respond({ status: 200, contentType: 'application/json', body });
    } else {
      req.continue();
    }
  });

  await page.goto('http://127.0.0.1:8791/hex/index.html', {waitUntil: 'networkidle0'});
  await page.waitForFunction(() => document.getElementById('out').innerText.includes('apps from the manifest'), {timeout: 5000});

  async function clearScreen() { await page.evaluate(() => { document.getElementById('out').innerHTML = ''; }); }
  async function setLine(s) { await page.evaluate((s) => { document.getElementById('cmd').value = s; }, s); }
  async function pressTab() { await page.focus('#cmd'); await page.keyboard.press('Tab'); }
  async function getOutHTML() { return page.evaluate(() => document.getElementById('out').innerHTML); }

  await clearScreen();
  await setLine('run <');
  await pressTab();
  console.log('out innerHTML after tab with 2 malicious candidates:', await getOutHTML());
  console.log('alertFired:', alertFired);

  await browser.close();
})();
