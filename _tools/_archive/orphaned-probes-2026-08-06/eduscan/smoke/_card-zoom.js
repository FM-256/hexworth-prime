const puppeteer=require('puppeteer');
const BASE=process.env.BASE, SP=process.env.SP, OUT=process.env.OUT||'card-zoom.png';
(async()=>{
 const b=await puppeteer.launch({headless:'new',args:['--no-sandbox']});
 const p=await b.newPage(); await p.setCacheEnabled(false);
 await p.setViewport({width:1440,height:900,deviceScaleFactor:3});
 await p.evaluateOnNewDocument(()=>localStorage.setItem('hexworth_house','cloud'));
 await p.goto(BASE+'/houses/hub/cloud-master',{waitUntil:'domcontentloaded',timeout:40000});
 await new Promise(r=>setTimeout(r,3000));
 const box=await p.evaluate(()=>{ const i=document.querySelector('.item');
   i.scrollIntoView({block:'center'}); return null; });
 await new Promise(r=>setTimeout(r,800));
 const r=await p.evaluate(()=>{ const i=document.querySelector('.item'); const b=i.getBoundingClientRect();
   return {x:Math.round(b.x),y:Math.round(b.y),w:Math.round(b.width),h:Math.round(b.height)}; });
 await p.screenshot({path:`${SP}/${OUT}`, clip:{x:r.x-8,y:r.y-8,width:r.w+16,height:r.h+16}});
 console.log(`  card ${r.w}x${r.h} -> ${OUT}`);
 await b.close();
})();
