const puppeteer=require('puppeteer');
const BASE=process.env.BASE, SP=process.env.SP, W=+(process.env.W||820), H=+(process.env.H||1180);
(async()=>{
 const b=await puppeteer.launch({headless:'new',args:['--no-sandbox']});
 const p=await b.newPage(); await p.setCacheEnabled(false);
 await p.setViewport({width:W,height:H,deviceScaleFactor:2});
 await p.evaluateOnNewDocument(()=>localStorage.setItem('hexworth_house','cloud'));
 await p.goto(BASE+'/houses/hub/cloud-master',{waitUntil:'domcontentloaded',timeout:40000});
 await new Promise(r=>setTimeout(r,3200));
 await p.evaluate(()=>{ const s=[...document.querySelectorAll('.section h2')].find(h=>/SLIDES/i.test(h.textContent));
   if(s) s.scrollIntoView({block:'start'}); });
 await new Promise(r=>setTimeout(r,900));
 await p.screenshot({path:`${SP}/${process.env.OUT}`});
 console.log('  shot -> '+process.env.OUT);
 await b.close();
})();
