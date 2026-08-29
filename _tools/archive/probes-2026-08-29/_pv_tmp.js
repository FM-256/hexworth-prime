const puppeteer = require('puppeteer');
(async () => {
  const b = await puppeteer.launch({args:['--no-sandbox','--disable-dev-shm-usage']});
  const p = await b.newPage();
  const show = () => p.evaluate(() => {
    const w=document.querySelector('.sandbox-launcher__iframe-wrap'); w.style.display='';
    const f=w.querySelector('iframe'); if(f){f.removeAttribute('src'); f.srcdoc='<body style="background:#000"></body>';}
  });
  console.log('  --- terminal height BELOW the breakpoint (must be the component default, not the cap) ---');
  for (const [w,h] of [[1400,900],[900,1200],[1200,800]]) {
    await p.setViewport({width:w,height:h});
    await p.goto('file://'+process.argv[2],{waitUntil:'networkidle2'}); await show();
    const r = await p.evaluate(()=>{ const e=document.querySelector('.sandbox-launcher__iframe-wrap');
      return { th: Math.round(e.getBoundingClientRect().height),
               pos: getComputedStyle(document.querySelector('.term-dock')).position }; });
    console.log(`    ${w}x${h}  terminal=${r.th}px  dock position=${r.pos}`);
  }
  console.log('  --- at the BOTTOM of the page: does the dock cover "Why this transfers"? ---');
  await p.setViewport({width:1600,height:900});
  await p.goto('file://'+process.argv[2],{waitUntil:'networkidle2'}); await show();
  const r2 = await p.evaluate(()=>{
    const H=document.body.scrollHeight; window.scrollTo(0,H-900);
    const dock=document.querySelector('.term-dock').getBoundingClientRect();
    const why=Array.from(document.querySelectorAll('h2')).find(h=>h.textContent.includes('Why this transfers'));
    const wr=why.getBoundingClientRect();
    return { dockTop:Math.round(dock.top), dockBottom:Math.round(dock.bottom),
             whyTop:Math.round(wr.top),
             covered: wr.top < dock.bottom && wr.bottom > dock.top && dock.height>0,
             dockStillPinned: dock.top > 0 && dock.top < 40 };
  });
  console.log(`    dock box ${r2.dockTop}..${r2.dockBottom}   "Why this transfers" heading at y=${r2.whyTop}`);
  console.log(`    heading covered by dock: ${r2.covered}   dock still pinned at bottom: ${r2.dockStillPinned}`);
  await p.screenshot({path: process.argv[3] + '/bottom-after.png'});
  await b.close();
})();
