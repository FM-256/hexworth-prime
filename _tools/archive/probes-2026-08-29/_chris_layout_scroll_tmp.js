const puppeteer = require('puppeteer');
const path = require('path');

const files = [
  'cloud-openstack-cinder-live.lab.html',
  'cloud-openstack-neutron-live.lab.html',
  'cloud-openstack-secgroup-live.lab.html',
  'cloud-openstack-launch-chain-live.lab.html',
  'cloud-openstack-rescue-live.lab.html',
];
const dir = '/home/eq/ai-content/hexworth-prime/_app/houses/cloud/openstack/labs';
const outDir = '/tmp/claude-1000/-home-eq-ai-content-hexworth-prime/2f9c2d95-8de7-4fbb-bf58-ed2b72f793dd/scratchpad/shots';

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  for (const f of files) {
    const page = await browser.newPage();
    await page.setRequestInterception(true);
    page.on('request', (req) => {
      const u = req.url();
      if (u.includes('AccessGuard.js') || u.includes('FirebaseAuth.js') || u.includes('ModuleProgress.js') || u.includes('SandboxLauncher.js')) {
        req.respond({ status: 200, contentType: 'application/javascript', body: 'window.AccessGuard={require:function(){}}; window.SandboxLauncher={renderButton:function(el){ if(el) el.innerHTML="<button>Launch</button><div style=\\"height:200px;background:#111;color:#0f0\\">FAKE TERMINAL IFRAME AREA</div>"; }};' });
      } else req.continue();
    });
    await page.setViewport({ width: 1600, height: 900 });
    await page.goto('file://' + path.join(dir, f), { waitUntil: 'networkidle0' });
    await page.evaluate(() => window.scrollTo(0, 1200));
    await page.screenshot({ path: path.join(outDir, f.replace('.lab.html','') + '_scrolled_1600.png') });
    await page.close();
  }
  await browser.close();
})();
