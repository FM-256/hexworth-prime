const puppeteer=require('puppeteer');
const BASE=process.env.BASE;
(async()=>{
 const b=await puppeteer.launch({headless:'new',args:['--no-sandbox']});
 const p=await b.newPage(); await p.setCacheEnabled(false);
 await p.setViewport({width:1440,height:900});
 await p.evaluateOnNewDocument(()=>localStorage.setItem('hexworth_house','cloud'));
 await p.goto(BASE+'/houses/hub/cloud-master',{waitUntil:'domcontentloaded',timeout:40000});
 await new Promise(r=>setTimeout(r,4000));
 const info=await p.evaluate(()=>{
   const s=document.querySelector('.bird svg');
   if(!s) return {found:false};
   const cs=getComputedStyle(s);
   return {found:true, animName:cs.animationName, animDur:cs.animationDuration,
           transform:cs.transform, birdCount:document.querySelectorAll('.bird').length};
 });
 console.log('  .bird svg animation-name : '+info.animName);
 console.log('  .bird svg animation-dur  : '+info.animDur);
 // Sample the SVG transform over ~1.2s -- one full flap cycle at 1.1s.
 const samples=[];
 for(let i=0;i<8;i++){
   samples.push(await p.evaluate(()=>getComputedStyle(document.querySelector('.bird svg')).transform));
   await new Promise(r=>setTimeout(r,150));
 }
 const uniq=[...new Set(samples)];
 console.log('  distinct svg transforms over 1.2s: '+uniq.length);
 uniq.slice(0,4).forEach(t=>console.log('    '+t));
 console.log(uniq.length>1 ? '\n  WINGS ARE MOVING' : '\n  WINGS ARE STATIC -- the flap is not running');
 await b.close();
})();
