// States the earlier sweep never looked at: hover, deep scroll, empty sections, page bottom.
const puppeteer=require('puppeteer');
const BASE=process.env.BASE, SP=process.env.SP;
(async()=>{
 const b=await puppeteer.launch({headless:'new',args:['--no-sandbox']});
 const p=await b.newPage(); await p.setCacheEnabled(false);
 await p.setViewport({width:1440,height:900,deviceScaleFactor:2});
 await p.evaluateOnNewDocument(()=>localStorage.setItem('hexworth_house','cloud'));
 await p.goto(BASE+'/houses/hub/cloud-master',{waitUntil:'domcontentloaded',timeout:40000});
 await new Promise(r=>setTimeout(r,3200));

 // Facts first
 const facts=await p.evaluate(()=>{
   const secs=[...document.querySelectorAll('.section')].map(s=>({
     h:(s.querySelector('h2')||{}).textContent||'', n:s.querySelectorAll('.item').length,
     empty: !!s.querySelector('.empty')}));
   const de=document.documentElement;
   return {sections:secs, pageH:de.scrollHeight, hasPath:!!document.querySelector('.path'),
           emptyCount:secs.filter(x=>x.empty).length};
 });
 facts.sections.forEach(s=>console.log(`  section ${JSON.stringify(s.h.trim()).padEnd(22)} items=${String(s.n).padStart(3)} ${s.empty?'EMPTY':''}`));
 console.log(`  page height ${facts.pageH}px | empty sections ${facts.emptyCount} | path block ${facts.hasPath}`);

 // hover on a cartridge
 const it=await p.$('.item');
 if(it){ await it.hover(); await new Promise(r=>setTimeout(r,400));
   const bx=await p.evaluate(()=>{const i=document.querySelector('.item');i.scrollIntoView({block:'center'});const r=i.getBoundingClientRect();return {x:Math.round(r.x),y:Math.round(r.y),w:Math.round(r.width),h:Math.round(r.height)};});
   await new Promise(r=>setTimeout(r,500));
   await (await p.$('.item')).hover(); await new Promise(r=>setTimeout(r,400));
   await p.screenshot({path:`${SP}/qc-hover.png`, clip:{x:Math.max(0,bx.x-14),y:Math.max(0,bx.y-14),width:bx.w+28,height:bx.h+28}});
   console.log('  hover shot captured'); }

 // page bottom (path block / last section)
 await p.evaluate(()=>window.scrollTo(0,document.documentElement.scrollHeight));
 await new Promise(r=>setTimeout(r,900));
 await p.screenshot({path:`${SP}/qc-bottom.png`});
 console.log('  bottom shot captured');
 await b.close();
})();
