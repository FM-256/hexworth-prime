// Injects a malicious house name into the manifest response (network-level, no source file
// modification) to prove setPrompt()'s esc(cwd) actually neutralizes it when cwd is exercised
// with attacker-controlled text, not just "the gate should prevent it" reasoning.
const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({args: ['--no-sandbox']});
  const page = await browser.newPage();
  await page.evaluateOnNewDocument(() => {
    sessionStorage.setItem('hexworth_master_key_expiry', (Date.now() + 3600000).toString());
  });

  await page.setRequestInterception(true);
  page.on('request', async (req) => {
    if (req.url().endsWith('/data/hex-apps.json')) {
      const real = await (await fetch('http://127.0.0.1:8791/data/hex-apps.json')).json();
      const evilHouse = '<img src=x onerror=window.__PWNED=true>';
      real.apps.push({
        id: 'zzz-xss-test-app', name: 'XSS Test', house: evilHouse, category: 'course',
        entry: '/houses/zzz/index.html', clientGuard: 'public', status: 'available'
      });
      return req.respond({ contentType: 'application/json', body: JSON.stringify(real) });
    }
    req.continue();
  });

  await page.goto('http://127.0.0.1:8791/hex/index.html', {waitUntil: 'networkidle0'});
  await page.waitForFunction(() => document.getElementById('out').innerText.includes('apps from the manifest'));

  async function setLine(s) { await page.evaluate((s) => { document.getElementById('cmd').value = s; }, s); }
  async function pressEnter() { await page.focus('#cmd'); await page.keyboard.press('Enter'); }

  const evilHouse = '<img src=x onerror=window.__PWNED=true>';
  await setLine('cd ' + evilHouse);
  await pressEnter();
  await new Promise(r => setTimeout(r, 300));

  const pwned = await page.evaluate(() => window.__PWNED === true);
  const promptHTML = await page.evaluate(() => document.getElementById('ps1').innerHTML);
  const promptText = await page.evaluate(() => document.getElementById('ps1').innerText);

  console.log('PWNED (onerror fired):', pwned);
  console.log('prompt innerHTML:', promptHTML);
  console.log('prompt innerText:', promptText);

  await browser.close();
  process.exit(pwned ? 1 : 0);
})().catch(e => { console.error('PROBE_ERROR', e); process.exit(2); });
