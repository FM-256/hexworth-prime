const puppeteer = require('puppeteer');
const fs = require('fs');
const SHOTDIR = '/tmp/claude-1000/-home-eq-ai-content-hexworth-prime/aaa65191-9601-4464-aadc-9ae84cdea571/scratchpad/shots';

const PAGES = [
  { name: 'shield-house', url: 'https://hexworth.com/houses/shield/index.html' },
];
const VIEWPORTS = {
  desktop: { width: 1440, height: 900 },
  mobile: { width: 390, height: 844, isMobile: true, hasTouch: true },
};

async function setup(page) {
  await page.setRequestInterception(true);
  page.on('request', req => {
    const u = req.url();
    if (u.endsWith('/components/AccessGuard.js')) {
      req.respond({ status: 200, contentType: 'application/javascript',
        body: 'window.AccessGuard={require(){},requireAdmin(){},showContent(){document.body.style.visibility="visible";}};' });
    } else {
      req.continue();
    }
  });
}

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox','--disable-setuid-sandbox'] });
  const results = [];
  for (const vpName of Object.keys(VIEWPORTS)) {
    for (const pg of PAGES) {
      const page = await browser.newPage();
      await page.setViewport(VIEWPORTS[vpName]);
      const consoleErrors = [];
      page.on('console', m => { if (m.type() === 'error') consoleErrors.push(m.text()); });
      await setup(page);
      try {
        await page.goto(pg.url, { waitUntil: 'networkidle2', timeout: 45000 });
        await new Promise(r => setTimeout(r, 1500));
        const fluxInfo = await page.evaluate(() => {
          const btn = document.querySelector('.flux-btn');
          if (!btn) return null;
          const cs = getComputedStyle(btn);
          const r = btn.getBoundingClientRect();
          const img = btn.querySelector('img');
          // get the keyframe/animation info + box-shadow color samples
          return {
            found: true,
            background: cs.backgroundImage || cs.backgroundColor,
            boxShadow: cs.boxShadow,
            borderColor: cs.borderColor,
            animationName: cs.animationName,
            rectW: Math.round(r.width), rectH: Math.round(r.height),
            top: r.top, left: r.left,
            imgSrc: img ? (img.currentSrc || img.src) : null,
            imgNaturalW: img ? img.naturalWidth : null,
          };
        });
        // sample box-shadow color across a short pulse window
        const samples = [];
        for (let i = 0; i < 8; i++) {
          const bs = await page.evaluate(() => {
            const btn = document.querySelector('.flux-btn');
            return btn ? getComputedStyle(btn).boxShadow : null;
          });
          samples.push(bs);
          await new Promise(r => setTimeout(r, 250));
        }
        const shotPath = `${SHOTDIR}/flux-${vpName}.png`;
        await page.screenshot({ path: shotPath, fullPage: false });
        let elShot = null;
        const el = await page.$('.flux-btn');
        if (el) {
          elShot = `${SHOTDIR}/flux-${vpName}-el.png`;
          await el.screenshot({ path: elShot }).catch(()=>{});
        }
        results.push({ page: pg.name, viewport: vpName, fluxInfo, samples, consoleErrors, shotPath, elShot, finalUrl: page.url() });
      } catch (e) {
        results.push({ page: pg.name, viewport: vpName, error: String(e.message||e) });
      }
      await page.close();
    }
  }
  await browser.close();
  fs.writeFileSync(`${SHOTDIR}/../flux-results.json`, JSON.stringify(results, null, 2));
  console.log('DONE');
})();
