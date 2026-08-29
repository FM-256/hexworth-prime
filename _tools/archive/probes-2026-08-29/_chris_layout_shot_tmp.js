const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const files = [
  'cloud-openstack-cinder-live.lab.html',
  'cloud-openstack-console.lab.html',
  'cloud-openstack-launch-chain-live.lab.html',
  'cloud-openstack-neutron-live.lab.html',
  'cloud-openstack-project-iac.lab.html',
  'cloud-openstack-rescue-live.lab.html',
  'cloud-openstack-secgroup-live.lab.html',
  'cloud-openstack-security-sprint.lab.html',
];
const dir = '/home/eq/ai-content/hexworth-prime/_app/houses/cloud/openstack/labs';
const outDir = '/tmp/claude-1000/-home-eq-ai-content-hexworth-prime/2f9c2d95-8de7-4fbb-bf58-ed2b72f793dd/scratchpad/shots';
fs.mkdirSync(outDir, { recursive: true });

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  for (const f of files) {
    const page = await browser.newPage();
    // stub out auth/guard scripts that might redirect
    await page.setRequestInterception(true);
    page.on('request', (req) => {
      const u = req.url();
      if (u.includes('AccessGuard.js') || u.includes('FirebaseAuth.js') || u.includes('ModuleProgress.js') || u.includes('SandboxLauncher.js')) {
        req.respond({ status: 200, contentType: 'application/javascript', body: 'window.AccessGuard={require:function(){}}; window.SandboxLauncher={renderButton:function(el){ if(el) el.innerHTML="<button>Launch</button>"; }};' });
      } else {
        req.continue();
      }
    });
    for (const width of [1280, 1600]) {
      await page.setViewport({ width, height: 900 });
      await page.goto('file://' + path.join(dir, f), { waitUntil: 'networkidle0' });
      // measure overflow
      const overflow = await page.evaluate(() => {
        const results = [];
        document.querySelectorAll('body *').forEach(el => {
          if (el.scrollWidth > el.clientWidth + 2 && el.clientWidth > 0) {
            const cls = el.className && el.className.toString ? el.className.toString() : '';
            if (!/^(cmd|io__how)/.test(cls)) { // .cmd is expected to scroll-x
              results.push({tag: el.tagName, cls, scrollWidth: el.scrollWidth, clientWidth: el.clientWidth});
            }
          }
        });
        return results.slice(0, 20);
      });
      const shotPath = path.join(outDir, f.replace('.lab.html','') + '_' + width + '.png');
      await page.screenshot({ path: shotPath, fullPage: true });
      console.log('=== ' + f + ' @' + width + ' ===');
      console.log('overflow candidates:', JSON.stringify(overflow));
    }
    await page.close();
  }
  await browser.close();
})();
