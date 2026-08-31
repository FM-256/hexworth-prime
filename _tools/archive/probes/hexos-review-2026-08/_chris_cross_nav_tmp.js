const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();

  // Stub AccessGuard globally (both pages use it) so we don't get bounced.
  await page.setRequestInterception(true);
  page.on('request', req => {
    const u = req.url();
    if (u.endsWith('/components/AccessGuard.js')) {
      req.respond({ status: 200, contentType: 'application/javascript', body: 'window.AccessGuard = { require: function(){} };' });
    } else if (u.startsWith('https://sandbox.hexworth.tech/')) {
      // Fake the launch API response so SandboxLauncher.launch() succeeds without real backend/auth.
      req.respond({ status: 200, contentType: 'application/json',
        body: JSON.stringify({ sessionId: 'fake-session-123', url: 'http://fake/console', status: 'running' }) });
    } else req.continue();
  });

  // Step 1: load a page that DOES include SandboxLauncher.js and actually launch a lab.
  await page.goto('http://localhost:8842/houses/cloud/openstack/index.html', { waitUntil: 'networkidle0' });
  const beforeType = await page.evaluate(() => typeof window.SandboxLauncher);
  console.log('on openstack page, typeof SandboxLauncher:', beforeType);

  const launchResult = await page.evaluate(async () => {
    try {
      const r = await window.SandboxLauncher.launch('openstack-cli');
      return { ok: true, r, active: window.SandboxLauncher.getActiveSessions() };
    } catch (e) { return { ok: false, err: e.message }; }
  });
  console.log('launch() result on openstack page:', JSON.stringify(launchResult));

  // Step 2: navigate (full page nav, like `run` does) to the hex shell.
  await page.goto('http://localhost:8842/hex/index.html', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 300));
  const afterType = await page.evaluate(() => typeof window.SandboxLauncher);
  console.log('on hex shell page AFTER navigation, typeof SandboxLauncher:', afterType);

  await page.focus('#cmd');
  await page.type('#cmd', 'ps');
  await page.keyboard.press('Enter');
  await new Promise(r => setTimeout(r, 300));
  const psOutput = await page.evaluate(() => document.getElementById('out').innerText);
  console.log('--- ps on hex shell, after launching openstack-cli from the other page ---');
  console.log(psOutput);

  await browser.close();
})();
