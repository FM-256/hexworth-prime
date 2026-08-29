const puppeteer = require('puppeteer');
(async () => {
  const b = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const p = await b.newPage();
  await p.setRequestInterception(true);
  p.on('request', (r) => (/AccessGuard\.js/.test(r.url()) ? r.abort() : r.continue()));
  const src = process.argv[2];
  for (const [w, h] of [[1920, 1080], [2560, 1440], [1366, 768]]) {
    await p.setViewport({ width: w, height: h });
    await p.goto(src, { waitUntil: 'domcontentloaded' });
    await new Promise((x) => setTimeout(x, 500));
    const m = await p.evaluate(() => {
      const px = (n) => Math.round(n);
      const card = document.querySelector('.card');
      const note = document.querySelector('.mode-note');
      const brief = document.querySelector('.brief');
      const rightmost = Math.max(...[...document.querySelectorAll('.card,.header,.brief,.mode-note')].map(e => e.getBoundingClientRect().right));
      let widest = 0, chars = 0;
      const walk = (n) => {
        if (n.nodeType === 3 && n.textContent.trim().length > 30) {
          const rg = document.createRange(); rg.selectNodeContents(n);
          for (const r of rg.getClientRects()) if (r.width > widest) {
            widest = r.width;
            chars = Math.round(r.width / (parseFloat(getComputedStyle(n.parentElement).fontSize) * 0.5));
          }
        }
        for (const c of n.childNodes) walk(c);
      };
      walk(document.body);
      return { vw: window.innerWidth, wrap: px(document.querySelector('.wrap').getBoundingClientRect().width),
               card: px(card.getBoundingClientRect().width),
               note: note ? px(note.getBoundingClientRect().width) : null,
               brief: brief ? px(brief.getBoundingClientRect().width) : null,
               rightmost: px(rightmost), widest: px(widest), chars,
               overflow: px(document.documentElement.scrollWidth) > window.innerWidth };
    });
    console.log(`  ${w}x${h}: wrap ${m.wrap} (${Math.round(m.wrap/m.vw*100)}%) | card ${m.card} (${Math.round(m.card/m.vw*100)}%) | brief ${m.brief} | note ${m.note} | widest text ${m.widest}px ~${m.chars}ch | h-overflow: ${m.overflow}`);
    if (w === 1920) await p.screenshot({ path: '_sprint_fixed_1920.png' });
  }
  await b.close();
})();
