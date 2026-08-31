const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  // Stub AccessGuard so the page doesn't redirect, mirroring only auth bypass, NOT SandboxLauncher.
  await page.evaluateOnNewDocument(() => {
    // do nothing to SandboxLauncher; only fake whatever AccessGuard needs.
  });
  await page.setRequestInterception(true);
  page.on('request', req => {
    if (req.url().endsWith('/components/AccessGuard.js')) {
      req.respond({ status: 200, contentType: 'application/javascript',
        body: 'window.AccessGuard = { require: function(){}, };' });
    } else req.continue();
  });
  await page.goto('http://localhost:8842/hex/index.html', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 400));
  console.log('URL:', page.url());
  console.log('has #cmd:', await page.evaluate(() => !!document.getElementById('cmd')));
  console.log('typeof SandboxLauncher:', await page.evaluate(() => typeof window.SandboxLauncher));

  async function runCmd(cmdStr) {
    await page.evaluate(() => { document.getElementById('out').innerHTML=''; });
    await page.focus('#cmd');
    await page.type('#cmd', cmdStr);
    await page.keyboard.press('Enter');
    await new Promise(r => setTimeout(r, 300));
    return page.evaluate(() => document.getElementById('out').innerText);
  }
  console.log('--- ps (real page, no stub of SandboxLauncher) ---');
  console.log(await runCmd('ps'));
  console.log('--- stop linux-sandbox ---');
  console.log(await runCmd('stop linux-sandbox'));
  console.log('--- restart linux-sandbox ---');
  console.log(await runCmd('restart linux-sandbox'));
  await browser.close();
})();
