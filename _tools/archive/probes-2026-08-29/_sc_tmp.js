const puppeteer = require('puppeteer');
(async () => {
  const b = await puppeteer.launch({args:['--no-sandbox','--disable-dev-shm-usage']});
  const p = await b.newPage();
  await p.setViewport({width:1600, height:1150});
  await p.goto('file://' + process.argv[2], {waitUntil:'networkidle2'});
  await new Promise(r => setTimeout(r,1000));
  const m = await p.evaluate(() => {
    const cols = document.querySelector('.cols');
    const side = document.querySelector('.side');
    const main = cols && cols.children[0];
    const g = getComputedStyle(cols);
    const deadRight = (() => {
      // widest painted content vs container right edge
      const els = Array.from(document.querySelectorAll('.card, .cmd, .io2, .brief, .mode-note'));
      const wrapR = document.querySelector('.wrap').getBoundingClientRect().right;
      const maxR = Math.max(...els.map(e => e.getBoundingClientRect().right));
      return Math.round(wrapR - maxR);
    })();
    return { grid: g.gridTemplateColumns,
             mainW: main ? Math.round(main.getBoundingClientRect().width) : 0,
             sideW: side ? Math.round(side.getBoundingClientRect().width) : 0,
             sideSticky: side ? getComputedStyle(side).position : 'none',
             deadRightPx: deadRight,
             pageOverflow: document.documentElement.scrollWidth > window.innerWidth + 1 };
  });
  console.log(`  grid=${m.grid}  main=${m.mainW}px  side=${m.sideW}px  sticky=${m.sideSticky}  deadRight=${m.deadRightPx}px  overflow=${m.pageOverflow}`);
  for (let i=0;i<3;i++){ await p.evaluate(v=>window.scrollTo(0,v), i*1100);
    await new Promise(r=>setTimeout(r,250));
    await p.screenshot({path:`${process.argv[3]}/two-col-${i}.png`}); }
  await b.close();
})();
