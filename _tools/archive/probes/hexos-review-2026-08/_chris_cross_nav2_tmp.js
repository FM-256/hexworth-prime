const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setRequestInterception(true);
  page.on('request', req => {
    const u = req.url();
    if (u.endsWith('/components/AccessGuard.js')) {
      req.respond({ status: 200, contentType: 'application/javascript', body: 'window.AccessGuard = { require: function(){} };' });
    } else if (u.startsWith('https://sandbox.hexworth.tech/')) {
      req.respond({ status: 200, contentType: 'application/json',
        body: JSON.stringify({ sessionId: 'fake-session-123', url: 'http://fake/console', status: 'running' }) });
    } else req.continue();
  });

  await page.goto('http://localhost:8842/houses/cloud/openstack/index.html', { waitUntil: 'networkidle0' });
  await page.evaluate(async () => {
    try { await window.SandboxLauncher.launch('openstack-cli'); } catch(e){}
  });
  console.log('active after launch on openstack page:', await page.evaluate(() => JSON.stringify(window.SandboxLauncher.getActiveSessions())));

  await page.goto('http://localhost:8842/hex/index.html', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 300));
  console.log('page.url() now:', page.url());
  console.log('document.title:', await page.evaluate(() => document.title));
  console.log('location.pathname:', await page.evaluate(() => location.pathname));
  console.log('typeof SandboxLauncher:', await page.evaluate(() => typeof window.SandboxLauncher));
  console.log('has element #out:', await page.evaluate(() => !!document.getElementById('out')));
  console.log('has element #cmd:', await page.evaluate(() => !!document.getElementById('cmd')));

  await browser.close();
})();
