/**
 * Audit a static WSA module slide-by-slide.
 * Usage: node _tools/scratch/wsa-audit-static-module.js <module-folder>
 * Reports: parent (should be slide-container or slide-area), height, content-clip, left-images, broadcast-wave usage
 */
const puppeteer = require('puppeteer');
const path = require('path');

const mod = process.argv[2];
if (!mod) { console.log('usage: node wsa-audit-static-module.js <m08-dns>'); process.exit(1); }

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox','--disable-setuid-sandbox','--disable-dev-shm-usage'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720 });
  await page.evaluateOnNewDocument(() => { try { localStorage.setItem('hexworth_house','cloud'); localStorage.setItem('hexworth_sorted','true'); } catch(_){} });
  await page.goto('file:///home/eq/ai-content/hexworth-prime/_app/houses/cloud/modules/wsa/' + mod + '/cloud-presentation.module.html', { waitUntil: 'networkidle0', timeout: 5000 });
  await new Promise(r => setTimeout(r, 1000));

  const count = await page.evaluate(() => document.querySelectorAll('.slide').length);
  console.log('Module ' + mod + ': ' + count + ' slides');
  console.log('Slide  Parent          h   tvtH  over imgs  Issue/title');

  let issues = [];

  for (let i = 1; i <= count; i++) {
    const r = await page.evaluate((idx) => {
      const slides = document.querySelectorAll('.slide');
      slides.forEach(s => s.classList.remove('active'));
      const slide = slides[idx];
      slide.classList.add('active');
      void slide.offsetHeight;
      const tvt = slide.querySelector('.tv-text') || slide.querySelector('.slide-text');
      const t = slide.querySelector('h2.slide-title') || slide.querySelector('h2') || slide.querySelector('h1');
      const dupTitle = slide.querySelectorAll('h2.slide-title').length;
      return {
        title: (t?.textContent || '').trim().slice(0,45),
        h: Math.round(slide.getBoundingClientRect().height),
        tvtH: tvt ? Math.round(tvt.getBoundingClientRect().height) : 0,
        parent: slide.parentElement.className || 'BODY',
        leftImgs: tvt ? tvt.querySelectorAll('img').length : 0,
        bwaves: slide.querySelectorAll('.anim-broadcast-wave').length,
        dupTitle: dupTitle > 1 ? dupTitle : 0
      };
    }, i-1);
    const over = Math.max(0, r.tvtH - r.h);
    const badParent = !['slide-container','slide-area','presentation-container'].includes(r.parent);
    const tooSmall = r.h < 100;
    const flagged = over > 30 || badParent || tooSmall || r.bwaves > 0 || r.dupTitle > 0;
    const mark = flagged ? '⚠' : '✓';
    if (flagged) {
      let why = [];
      if (over > 30) why.push('over=' + over + 'px');
      if (badParent) why.push('parent=' + r.parent);
      if (tooSmall) why.push('h=' + r.h);
      if (r.bwaves) why.push('bwaves=' + r.bwaves);
      if (r.dupTitle) why.push('dupTitle=' + r.dupTitle);
      if (r.leftImgs > 0) why.push('imgs=' + r.leftImgs);
      issues.push({i, why: why.join(' '), title: r.title});
    }
    console.log('S' + String(i).padStart(2) + '   ' + r.parent.padEnd(15) + ' ' + String(r.h).padStart(3) + ' ' + String(r.tvtH).padStart(4) + ' ' + String(over).padStart(4) + ' ' + String(r.leftImgs).padStart(4) + '   ' + mark + ' ' + r.title);
  }
  console.log('\nFlagged slides: ' + issues.length);
  for (const x of issues) console.log('  S' + x.i + ': ' + x.why + ' — ' + x.title);
  await browser.close();
})();
