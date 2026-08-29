const puppeteer = require('puppeteer');
const pages = ['cloud-openstack-launch-chain-live','cloud-openstack-neutron-live','cloud-openstack-secgroup-live'];
(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  for (const slug of pages) {
    const page = await browser.newPage();
    await page.setViewport({ width: 1600, height: 900 });
    await page.setRequestInterception(true);
    page.on('request', req => { if (req.url().includes('AccessGuard.js')) req.abort(); else req.continue(); });
    await page.goto(`http://localhost:8899/houses/cloud/openstack/labs/${slug}.lab.html`, { waitUntil: 'networkidle0', timeout: 20000 });
    await page.screenshot({ path: `/tmp/claude-1000/-home-eq-ai-content-hexworth-prime/2f9c2d95-8de7-4fbb-bf58-ed2b72f793dd/scratchpad/chris_shots/${slug}_atload.png` });
    await page.close();
  }
  await browser.close();
})();
