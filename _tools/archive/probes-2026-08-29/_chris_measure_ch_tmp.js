const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setRequestInterception(true);
  page.on('request', req => {
    const url = req.url();
    if (url.includes('AccessGuard.js') || url.includes('FirebaseAuth.js') || url.includes('ModuleProgress.js') || url.includes('SandboxLauncher.js')) {
      req.respond({ status: 200, contentType: 'application/javascript', body: '/* stubbed */' });
    } else req.continue();
  });
  await page.setViewport({ width: 2560, height: 1080 });
  await page.goto('http://localhost:8791/houses/cloud/openstack/labs/cloud-openstack-security-sprint.lab.html', { waitUntil: 'networkidle0' });
  const r = await page.evaluate(() => {
    const brief = document.querySelector('.brief').getBoundingClientRect();
    const briefP = document.querySelector('.brief > p').getBoundingClientRect();
    const emptyPx = brief.width - briefP.width;
    const emptyPct = (emptyPx / brief.width * 100).toFixed(1);
    // measure a card with a bulleted list
    const cards = [...document.querySelectorAll('.card')];
    const termCard = cards.find(c => c.querySelector('ul'));
    const cardRect = termCard.getBoundingClientRect();
    const li = termCard.querySelector('li').getBoundingClientRect();
    return { brief, briefP, emptyPx, emptyPct, cardWidth: cardRect.width, liWidth: li.width, liEmptyPct: ((cardRect.width - li.width)/cardRect.width*100).toFixed(1) };
  });
  console.log(JSON.stringify(r, null, 2));
  await browser.close();
})();
