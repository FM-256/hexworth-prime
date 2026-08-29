const puppeteer = require('puppeteer');
(async () => {
  const b = await puppeteer.launch({args:['--no-sandbox','--disable-dev-shm-usage']});
  const p = await b.newPage();
  await p.setViewport({width:1600, height:900});
  await p.goto('file://' + process.argv[2], {waitUntil:'domcontentloaded'});
  const r = await p.evaluate(() => {
    const out=[]; const probe=document.createElement('span');
    probe.style.cssText='visibility:hidden;position:absolute;white-space:pre';
    document.body.appendChild(probe);
    const seen=new Map();
    for (const el of document.querySelectorAll('p, li, div')) {
      const t=(el.textContent||'').trim();
      if (t.length<60) continue;
      if (el.closest('.cmd')) continue;
      if (el.querySelector('p,li,div')) continue;   // leaf text only
      const cs=getComputedStyle(el); probe.style.font=cs.font;
      probe.textContent='abcdefghijklmnopqrstuvwxyz';
      const cw=probe.getBoundingClientRect().width/26;
      const chars=Math.round(el.getBoundingClientRect().width/cw);
      const key=el.className||el.tagName;
      if(!seen.has(key)||seen.get(key)<chars) seen.set(key,chars);
    }
    probe.remove();
    for(const [k,v] of seen) out.push({k,v});
    const side=document.querySelector('.side');
    const wrap=document.querySelector('.wrap').getBoundingClientRect();
    return { rows: out.sort((a,b)=>b.v-a.v).slice(0,6),
             sideRight: side?Math.round(side.getBoundingClientRect().right):null,
             wrapRight: Math.round(wrap.right) };
  });
  console.log('  longest text elements (chars/line):');
  for (const x of r.rows) console.log(`    ${String(x.v).padStart(4)}  ${x.k.slice(0,54)}`);
  console.log(`  sidebar right edge=${r.sideRight}  wrap right edge=${r.wrapRight}  (equal => no dead space)`);
  await b.close();
})();
