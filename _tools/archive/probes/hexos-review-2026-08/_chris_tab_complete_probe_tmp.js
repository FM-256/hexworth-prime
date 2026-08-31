const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({args: ['--no-sandbox']});
  const page = await browser.newPage();
  page.on('console', m => console.log('[console]', m.text()));
  page.on('pageerror', e => console.log('[pageerror]', e.message));

  await page.evaluateOnNewDocument(() => {
    sessionStorage.setItem('hexworth_master_key_expiry', (Date.now() + 3600000).toString());
  });

  await page.goto('http://127.0.0.1:8791/hex/index.html', {waitUntil: 'networkidle0'});

  // wait for manifest load
  await page.waitForFunction(() => document.getElementById('out').innerText.includes('apps from the manifest'), {timeout: 5000});

  async function clearScreen() {
    await page.evaluate(() => { document.getElementById('out').innerHTML = ''; });
  }
  async function setLine(s) {
    await page.evaluate((s) => { document.getElementById('cmd').value = s; }, s);
  }
  async function pressTab() {
    await page.focus('#cmd');
    await page.keyboard.press('Tab');
  }
  async function getOut() {
    return page.evaluate(() => document.getElementById('out').innerText);
  }
  async function getVal() {
    return page.evaluate(() => document.getElementById('cmd').value);
  }

  async function runCase(name, line, taps) {
    await clearScreen();
    await setLine(line);
    for (let i = 0; i < taps; i++) await pressTab();
    const val = await getVal();
    const outp = await getOut();
    console.log('=== CASE:', name, '===');
    console.log('input line:', JSON.stringify(line), 'taps:', taps);
    console.log('resulting cmd.value:', JSON.stringify(val));
    console.log('out panel:', JSON.stringify(outp));
    console.log('');
  }

  await runCase('empty tab', '', 1);
  await runCase('run + tab (lists apps)', 'run ', 1);
  await runCase('run bug-h unique', 'run bug-h', 1);
  await runCase('run hunting substring', 'run hunting', 1);
  await runCase('ls dark prefix', 'ls dark', 1);
  await runCase('ls + tab lists categories/houses', 'ls ', 1);
  await runCase('run zzzz no completion', 'run zzzz', 1);
  await runCase('repeated tab cycles - run se (2 taps)', 'run se', 2);
  await runCase('repeated tab cycles - run se (3 taps)', 'run se', 3);
  await runCase('sea -> search', 'sea', 1);
  await runCase('cle -> clear', 'cle', 1);
  await runCase('se stays ambiguous', 'se', 1);
  await runCase('he stays ambiguous', 'he', 1);

  // XSS probe: does esc() actually escape candidate names? candidates come from manifest ids so can't inject directly,
  // but check no completion path renders unescaped HTML for injected fragment
  await clearScreen();
  await setLine('run <img src=x onerror=alert(1)>');
  await pressTab();
  console.log('=== CASE: xss fragment in run arg ===');
  console.log('out panel html:', await page.evaluate(() => document.getElementById('out').innerHTML));
  console.log('');

  // desync probe: type text, tab to list (multi-hit), then keep typing - does cmd.value stay consistent?
  await clearScreen();
  await setLine('run s');
  await pressTab(); // lists multiple, extends lcp if any
  let midVal = await getVal();
  console.log('=== CASE: desync check - after tab on "run s" ===');
  console.log('value now:', JSON.stringify(midVal));
  await page.keyboard.type('ecurity-p');
  let afterType = await getVal();
  console.log('value after typing ecurity-p:', JSON.stringify(afterType));
  await pressTab();
  console.log('value after another tab:', JSON.stringify(await getVal()));
  console.log('');

  await browser.close();
})();
