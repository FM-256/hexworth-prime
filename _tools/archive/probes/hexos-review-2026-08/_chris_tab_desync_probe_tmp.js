const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({args: ['--no-sandbox']});
  const page = await browser.newPage();

  await page.evaluateOnNewDocument(() => {
    sessionStorage.setItem('hexworth_master_key_expiry', (Date.now() + 3600000).toString());
  });
  await page.goto('http://127.0.0.1:8791/hex/index.html', {waitUntil: 'networkidle0'});
  await page.waitForFunction(() => document.getElementById('out').innerText.includes('apps from the manifest'), {timeout: 5000});

  async function clearScreen() { await page.evaluate(() => { document.getElementById('out').innerHTML = ''; }); }
  async function setLine(s) { await page.evaluate((s) => { document.getElementById('cmd').value = s; }, s); }
  async function pressTab() { await page.focus('#cmd'); await page.keyboard.press('Tab'); }
  async function pressEnter() { await page.focus('#cmd'); await page.keyboard.press('Enter'); }
  async function getVal() { return page.evaluate(() => document.getElementById('cmd').value); }

  await clearScreen();
  await setLine('run se');
  await pressTab(); // arms cycle, value stays 'run se'
  console.log('after 1st tab:', JSON.stringify(await getVal()));
  await pressEnter(); // should clear tabState AND clear cmd.value
  console.log('after enter, value:', JSON.stringify(await getVal()));
  await setLine('run se');
  await pressTab(); // should behave as FRESH first tab (no cycle carried over), so value unchanged 'run se' (lcp=='se')
  console.log('after fresh tab post-enter:', JSON.stringify(await getVal()), '-- expect "run se" unchanged if state correctly reset, "run security-101" if STALE/desynced');

  await browser.close();
})();
