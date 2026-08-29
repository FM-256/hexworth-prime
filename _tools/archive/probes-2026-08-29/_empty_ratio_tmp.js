// Chris's metric: how much of a coloured callout box is blank? A bordered, tinted box that is
// mostly empty reads as broken content, so this is measured rather than judged by eye.
const puppeteer = require('puppeteer');
(async () => {
  const b = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const p = await b.newPage();
  await p.setRequestInterception(true);
  p.on('request', (r) => (/AccessGuard\.js/.test(r.url()) ? r.abort() : r.continue()));
  for (const [w, h] of [[1920,1080],[2560,1440],[1366,768]]) {
    await p.setViewport({ width: w, height: h });
    await p.goto('http://127.0.0.1:8899/houses/cloud/openstack/labs/cloud-openstack-security-sprint.lab.html', { waitUntil: 'domcontentloaded' });
    await new Promise(x=>setTimeout(x,450));
    const m = await p.evaluate(() => {
      const px = n => Math.round(n);
      const ratio = (sel) => {
        const el = document.querySelector(sel); if (!el) return null;
        const box = el.getBoundingClientRect().width;
        const kid = el.querySelector('p');
        const txt = kid ? kid.getBoundingClientRect().width : 0;
        return { box: px(box), txt: px(txt), empty: Math.round((1 - txt/box) * 100) };
      };
      return { vw: window.innerWidth,
               wrap: px(document.querySelector('.wrap').getBoundingClientRect().width),
               card: px(document.querySelector('.card').getBoundingClientRect().width),
               brief: ratio('.brief'), note: ratio('.mode-note'),
               overflow: px(document.documentElement.scrollWidth) > window.innerWidth };
    });
    console.log(`  ${w}: wrap ${m.wrap} (${Math.round(m.wrap/m.vw*100)}%) card ${m.card} | brief box ${m.brief.box} text ${m.brief.txt} EMPTY ${m.brief.empty}% | note box ${m.note.box} text ${m.note.txt} EMPTY ${m.note.empty}% | overflow ${m.overflow}`);
    if (w === 2560) await p.screenshot({ path: '_sprint_final_2560.png' });
  }
  await b.close();
})();
