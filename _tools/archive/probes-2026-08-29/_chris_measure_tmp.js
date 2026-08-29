const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({args:['--no-sandbox']});
  const page = await browser.newPage();
  page.on('console', () => {});
  page.on('pageerror', () => {});
  await page.setRequestInterception(true);
  page.on('request', (req) => {
    if (req.url().includes('AccessGuard.js') || req.url().includes('FirebaseAuth.js') || req.url().includes('firebase')) {
      req.abort();
    } else {
      req.continue();
    }
  });
  const fileUrl = 'file:///home/eq/ai-content/hexworth-prime/_app/houses/cloud/openstack/labs/cloud-openstack-cinder-live.lab.html';
  for (const vp of [{width:1366,height:768},{width:1440,height:900},{width:1920,height:1080}]) {
    await page.setViewport(vp);
    await page.goto(fileUrl, {waitUntil:'networkidle0', timeout:15000}).catch(e=>console.log('goto err', e.message));
    // simulate the button existing regardless of SandboxLauncher load success by checking DOM
    const info = await page.evaluate(() => {
      function rectOf(sel) {
        const el = document.querySelector(sel);
        if (!el) return null;
        const r = el.getBoundingClientRect();
        return {top: r.top, bottom: r.bottom, text: el.textContent.trim().slice(0,60)};
      }
      // find step2 paragraph containing 'Record the attachment'
      const paras = Array.from(document.querySelectorAll('p'));
      const stepPara = paras.find(p => p.textContent.includes('Record the attachment'));
      const stepRect = stepPara ? stepPara.getBoundingClientRect() : null;
      const termDock = document.querySelector('.term-dock');
      const termRect = termDock ? termDock.getBoundingClientRect() : null;
      const btns = Array.from(document.querySelectorAll('button')).map(b=>b.textContent.trim());
      return {
        pageHeight: document.body.scrollHeight,
        stepParaTop: stepRect ? stepRect.top + window.scrollY : null,
        termDockTop: termRect ? termRect.top + window.scrollY : null,
        termDockBottom: termRect ? termRect.bottom + window.scrollY : null,
        buttons: btns,
        sandboxLauncherDefined: typeof window.SandboxLauncher !== 'undefined',
      };
    });
    console.log(vp, JSON.stringify(info));
  }
  await browser.close();
})();
