const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({args: ['--no-sandbox']});
  const page = await browser.newPage();
  page.on('pageerror', e => console.log('[pageerror]', e.message));
  page.on('dialog', async d => { console.log('[ALERT FIRED]', d.message()); await d.dismiss(); });

  await page.evaluateOnNewDocument(() => {
    sessionStorage.setItem('hexworth_master_key_expiry', (Date.now() + 3600000).toString());
  });
  await page.goto('http://127.0.0.1:8791/hex/index.html', {waitUntil: 'networkidle0'});
  await page.waitForFunction(() => document.getElementById('out').innerText.includes('apps from the manifest'), {timeout: 5000});

  async function clearScreen() { await page.evaluate(() => { document.getElementById('out').innerHTML = ''; }); }
  async function setLine(s) { await page.evaluate((s) => { document.getElementById('cmd').value = s; }, s); }
  async function pressTab() { await page.focus('#cmd'); await page.keyboard.press('Tab'); }
  async function getOutHTML() { return page.evaluate(() => document.getElementById('out').innerHTML); }
  async function getVal() { return page.evaluate(() => document.getElementById('cmd').value); }

  // no-completion path with HTML-bearing single-token fragment
  await clearScreen();
  await setLine('run <img/src=x/onerror=alert(1)>');
  await pressTab();
  console.log('=== no-completion XSS fragment ===');
  console.log('cmd.value:', JSON.stringify(await getVal()));
  console.log('out innerHTML:', await getOutHTML());
  console.log('');

  // Inject a malicious app id directly into the live APPS array in the page's closure via a manifest reload isn't
  // possible (closure var), so instead verify by re-fetching manifest with a poisoned entry: intercept the request.
  await browser.close();
})();
