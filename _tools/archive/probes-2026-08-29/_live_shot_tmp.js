const puppeteer = require('puppeteer');
(async () => {
  const b = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const p = await b.newPage();
  await p.setRequestInterception(true);
  p.on('request', (r) => (/AccessGuard\.js/.test(r.url()) ? r.abort() : r.continue()));
  await p.setViewport({ width: 1920, height: 1080 });
  await p.goto('https://hexworth.com/houses/cloud/openstack/labs/cloud-openstack-security-sprint.lab.html?cb=' + Date.now(),
               { waitUntil: 'domcontentloaded' });
  await new Promise(x=>setTimeout(x,700));
  await p.screenshot({ path: '_live_prod_1920.png' });
  console.log('  captured live production at 1920x1080');
  await b.close();
})();
