const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({args: ['--no-sandbox']});
  const page = await browser.newPage();
  await page.evaluateOnNewDocument(() => {
    sessionStorage.setItem('hexworth_master_key_expiry', (Date.now() + 3600000).toString());
  });
  await page.setRequestInterception(true);
  const evilHouse = '<img src=x onerror=window.__PWNED2=true>';
  page.on('request', async (req) => {
    if (req.url().endsWith('/data/hex-apps.json')) {
      const real = await (await fetch('http://127.0.0.1:8791/data/hex-apps.json')).json();
      real.apps.push({ id: 'zzz-xss-ls', name: 'x', house: evilHouse, category: 'course', entry: '/x', clientGuard: 'public', status: 'available' });
      return req.respond({ contentType: 'application/json', body: JSON.stringify(real) });
    }
    req.continue();
  });
  await page.goto('http://127.0.0.1:8791/hex/index.html', {waitUntil: 'networkidle0'});
  await page.waitForFunction(() => document.getElementById('out').innerText.includes('apps from the manifest'));
  async function setLine(s) { await page.evaluate((s) => { document.getElementById('cmd').value = s; }, s); }
  async function pressEnter() { await page.focus('#cmd'); await page.keyboard.press('Enter'); }
  await setLine('cd ' + evilHouse); await pressEnter();
  await setLine('ls'); await pressEnter();
  await new Promise(r => setTimeout(r, 300));
  const pwned = await page.evaluate(() => window.__PWNED2 === true);
  const outHTML = await page.evaluate(() => document.getElementById('out').innerHTML.slice(-500));
  console.log('PWNED2:', pwned);
  console.log('tail of out innerHTML:', outHTML);
  await browser.close();
  process.exit(pwned ? 1 : 0);
})().catch(e=>{console.error(e);process.exit(2);});
