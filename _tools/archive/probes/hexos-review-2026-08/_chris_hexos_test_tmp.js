const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  const consoleErrors = [];
  page.on('pageerror', e => consoleErrors.push('PAGEERROR: ' + e.message));
  page.on('console', msg => { if (msg.type() === 'error') consoleErrors.push('CONSOLE: ' + msg.text()); });

  // Standard EduScan probe pattern (card-click-probe.js etc): set sorted status before nav.
  await page.evaluateOnNewDocument(() => {
    try {
      localStorage.setItem('hexworth_sorted', 'true');
      localStorage.setItem('hexworth_house', 'shield');
    } catch (e) {}
  });

  await page.goto('http://localhost:8842/hex/index.html', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 500));
  console.log('URL after load:', page.url());

  async function runCmd(cmdStr) {
    await page.evaluate(() => { const o = document.getElementById('out'); if (o) o.innerHTML = ''; });
    await page.focus('#cmd');
    await page.evaluate(() => { const c = document.getElementById('cmd'); if (c) c.value = ''; });
    await page.type('#cmd', cmdStr);
    await page.keyboard.press('Enter');
    await new Promise(r => setTimeout(r, 250));
    const text = await page.evaluate(() => { const o = document.getElementById('out'); return o ? o.innerText : '(#out missing, url=' + location.href + ')'; });
    return text;
  }

  console.log('=== initial load ===');
  const initial = await page.evaluate(() => { const o = document.getElementById('out'); return o ? o.innerText : 'NO #out — url=' + location.href; });
  console.log(initial);

  const tests = ['help', 'ls', 'search arena', 'search bounty', 'search hunting', 'info arena', 'run nonexistent-app-xyz', 'ls dark-arts'];
  for (const t of tests) {
    const r = await runCmd(t);
    console.log('--- CMD: ' + t + ' ---');
    console.log(r);
  }

  console.log('=== ERRORS ===');
  console.log(consoleErrors.join('\n') || 'none');

  await browser.close();
})();
