const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  const errs = [];
  page.on('pageerror', e => errs.push('PAGEERROR: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errs.push('CONSOLE: ' + m.text()); });
  await page.evaluateOnNewDocument(() => {
    try { localStorage.setItem('hexworth_sorted', 'true'); } catch(e){}
  });
  await page.goto('http://localhost:8842/hex/index.html', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 500));
  const hasSL = await page.evaluate(() => typeof window.SandboxLauncher);
  console.log('typeof window.SandboxLauncher on REAL served hex page:', hasSL);

  async function runCmd(cmdStr) {
    await page.evaluate(() => { const o = document.getElementById('out'); if (o) o.innerHTML = ''; });
    await page.focus('#cmd');
    await page.evaluate(() => { const c = document.getElementById('cmd'); if (c) c.value=''; });
    await page.type('#cmd', cmdStr);
    await page.keyboard.press('Enter');
    await new Promise(r => setTimeout(r, 300));
    return page.evaluate(() => { const o = document.getElementById('out'); return o ? o.innerText : '(no #out)'; });
  }
  console.log('--- ps ---');
  console.log(await runCmd('ps'));
  console.log('--- stop linux-sandbox ---');
  console.log(await runCmd('stop linux-sandbox'));
  console.log('--- ERRORS ---');
  console.log(errs.join('\n') || 'none');
  await browser.close();
})();
