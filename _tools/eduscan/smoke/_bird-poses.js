// Park one bird, big, and capture both wing poses to confirm the flap actually reads.
const puppeteer=require('puppeteer');
const BASE=process.env.BASE, SP=process.env.SP;
(async()=>{
 const b=await puppeteer.launch({headless:'new',args:['--no-sandbox']});
 const p=await b.newPage(); await p.setCacheEnabled(false);
 await p.setViewport({width:1440,height:900,deviceScaleFactor:2});
 await p.evaluateOnNewDocument(()=>localStorage.setItem('hexworth_house','cloud'));
 await p.goto(BASE+'/houses/hub/cloud-master',{waitUntil:'domcontentloaded',timeout:40000});
 await new Promise(r=>setTimeout(r,3000));
 // Show each pose deterministically rather than hoping to catch both by timing.
 for (const pose of ['f-up','f-mid','f-down']) {
   await p.evaluate((show)=>{
     const bd=document.querySelector('.bird');
     bd.style.animation='none'; bd.style.left='1120px'; bd.style.top='120px';
     bd.style.width='170px'; bd.style.height='170px'; bd.style.opacity='1'; bd.style.transform='none';
     bd.querySelectorAll('img').forEach(x=>{ x.style.animation='none';
       x.style.opacity = x.classList.contains(show) ? '1' : '0'; });
   }, pose);
   await new Promise(r=>setTimeout(r,300));
   await p.screenshot({path:`${SP}/sp-${pose}.png`, clip:{x:1100,y:100,width:210,height:210}});
 }
 console.log('  both poses captured');
 await b.close();
})();
