// Capture the SAME bird across a flap cycle, zoomed, so I can see whether wings actually move.
const puppeteer=require('puppeteer');
const BASE=process.env.BASE, SP=process.env.SP;
(async()=>{
 const b=await puppeteer.launch({headless:'new',args:['--no-sandbox']});
 const p=await b.newPage(); await p.setCacheEnabled(false);
 await p.setViewport({width:1440,height:900,deviceScaleFactor:3});
 await p.evaluateOnNewDocument(()=>localStorage.setItem('hexworth_house','cloud'));
 await p.goto(BASE+'/houses/hub/cloud-master',{waitUntil:'domcontentloaded',timeout:40000});
 await new Promise(r=>setTimeout(r,3000));
 // Freeze horizontal travel and park one bird centre-screen, big, so the wings are legible.
 await p.evaluate(()=>{
   const b=document.querySelector('.bird');
   b.style.animation='none'; b.style.left='600px'; b.style.top='300px';
   b.style.width='150px'; b.style.height='150px'; b.style.opacity='1';
   b.querySelectorAll('path').forEach(x=>{x.style.stroke='#001018';x.style.strokeWidth='2.6';});
 });
 for(let i=0;i<4;i++){
   await p.screenshot({path:`${SP}/bird-f${i}.png`, clip:{x:560,y:260,width:230,height:230}});
   await new Promise(r=>setTimeout(r,160));
 }
 console.log('  4 frames captured');
 await b.close();
})();
