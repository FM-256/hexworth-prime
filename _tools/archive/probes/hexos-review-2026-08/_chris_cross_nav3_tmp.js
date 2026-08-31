const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setCacheEnabled(false);
  await page.setRequestInterception(true);
  page.on('request', req => {
    const u = req.url();
    if (u.endsWith('/components/AccessGuard.js')) {
      req.respond({ status: 200, contentType: 'application/javascript', body: 'window.AccessGuard = { require: function(){} };' });
    } else req.continue();
  });
  page.on('response', async (resp) => {
    if (resp.url().endsWith('/hex/index.html')) {
      const body = await resp.text().catch(()=> '(could not read body)');
      console.log('bytes received for /hex/index.html:', body.length, 'contains SandboxLauncher.js tag:', body.includes('SandboxLauncher.js'));
    }
  });
  await page.goto('http://localhost:8842/hex/index.html', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 300));
  console.log('typeof SandboxLauncher (fresh, first nav, no prior page):', await page.evaluate(() => typeof window.SandboxLauncher));
  await browser.close();
})();
