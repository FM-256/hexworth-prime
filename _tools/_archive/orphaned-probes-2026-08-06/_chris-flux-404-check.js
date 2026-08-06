const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox','--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  await page.setRequestInterception(true);
  page.on('request', req => {
    const u = req.url();
    if (u.endsWith('/components/AccessGuard.js')) {
      req.respond({ status: 200, contentType: 'application/javascript',
        body: 'window.AccessGuard={require(){},requireAdmin(){},showContent(){document.body.style.visibility="visible";}};' });
    } else req.continue();
  });
  const failed = [];
  page.on('response', res => { if (res.status() >= 400) failed.push(res.status() + ' ' + res.url()); });
  await page.goto('https://hexworth.com/houses/shield/index.html', { waitUntil: 'networkidle2', timeout: 45000 });
  await new Promise(r=>setTimeout(r,1500));
  console.log(JSON.stringify(failed, null, 2));
  await browser.close();
})();
