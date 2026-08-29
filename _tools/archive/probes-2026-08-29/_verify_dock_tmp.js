// Render-verify the terminal dock. Served over HTTP so absolute asset paths resolve, with
// AccessGuard blocked: headless has no signed-in user, so the guard replaces the whole page
// with the sorting prompt and every selector returns null. A uniform "not found" across all
// eight pages was the detector failing, not the pages.
const puppeteer = require('puppeteer');
const fs = require('fs');

const DIR = '/home/eq/ai-content/hexworth-prime/_app/houses/cloud/openstack/labs';
const BASE = 'http://127.0.0.1:8899/houses/cloud/openstack/labs/';

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setRequestInterception(true);
  page.on('request', (r) => (/AccessGuard\.js/.test(r.url()) ? r.abort() : r.continue()));
  await page.setViewport({ width: 1600, height: 950 });

  for (const f of fs.readdirSync(DIR).filter((n) => n.endsWith('.lab.html')).sort()) {
    await page.goto(BASE + f, { waitUntil: 'domcontentloaded' });
    await new Promise((r) => setTimeout(r, 400));
    const m = await page.evaluate(() => {
      const dock = document.querySelector('.term-dock');
      if (!dock) return { none: true, cards: document.querySelectorAll('.card').length };
      const steps = [...document.querySelectorAll('.step')];
      const d = dock.getBoundingClientRect();
      const before = steps.length ? d.top < steps[0].getBoundingClientRect().top : null;
      const sticky = getComputedStyle(dock).position;
      let visibleAtEnd = null;
      if (steps.length) {
        steps[steps.length - 1].scrollIntoView({ block: 'center' });
        const d2 = dock.getBoundingClientRect();
        visibleAtEnd = d2.bottom > 0 && d2.top < window.innerHeight;
      }
      return { before, sticky, h: Math.round(d.height), steps: steps.length, visibleAtEnd };
    });
    if (m.none) { console.log(`  ${f.padEnd(44)} no term-dock (cards=${m.cards})`); continue; }
    const ok = m.before !== false && m.sticky === 'sticky' && m.visibleAtEnd !== false;
    console.log(`  ${f.padEnd(44)} ${(ok ? 'DOCKED' : 'BROKEN').padEnd(6)} ` +
                `above-steps=${m.before} pos=${m.sticky} h=${m.h} steps=${m.steps} ` +
                `visible-at-last-step=${m.visibleAtEnd}`);
  }
  await browser.close();
})();
