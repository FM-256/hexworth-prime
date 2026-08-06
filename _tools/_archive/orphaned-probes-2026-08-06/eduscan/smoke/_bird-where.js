const puppeteer=require('puppeteer');
const BASE=process.env.BASE, SP=process.env.SP;
(async()=>{
 const b=await puppeteer.launch({headless:'new',args:['--no-sandbox']});
 const p=await b.newPage(); await p.setCacheEnabled(false);
 await p.setViewport({width:1440,height:900,deviceScaleFactor:2});
 await p.evaluateOnNewDocument(()=>localStorage.setItem('hexworth_house','cloud'));
 await p.goto(BASE+'/houses/hub/cloud-master',{waitUntil:'domcontentloaded',timeout:40000});
 await new Promise(r=>setTimeout(r,3000));
 const info=await p.evaluate(()=>{
   const out=[];
   document.querySelectorAll('.bird').forEach((bd,i)=>{
     const r=bd.getBoundingClientRect(); const cs=getComputedStyle(bd);
     out.push({i, x:Math.round(r.x), y:Math.round(r.y), w:Math.round(r.width), op:cs.opacity});
   });
   const env=document.querySelector('.env');
   const veil=document.querySelector('.env-veil');
   return {birds:out, envZ:getComputedStyle(env).zIndex,
           order:[...env.children].map(c=>c.className||'(flock)'),
           veilBg:getComputedStyle(veil).backgroundImage.slice(0,60)};
 });
 console.log('  .env z-index: '+info.envZ);
 console.log('  child order : '+info.order.join(' | '));
 info.birds.forEach(b=>console.log(`    bird${b.i}  x=${b.x} y=${b.y} w=${b.w} opacity=${b.op}`));
 const on=info.birds.find(b=>b.x>0&&b.x<1300);
 if(on){ await p.screenshot({path:`${SP}/bird-real.png`, clip:{x:Math.max(0,on.x-70),y:Math.max(0,on.y-70),width:200,height:160}});
   console.log('  captured bird'+on.i+' region'); }
 else console.log('  no bird currently on-screen');
 await b.close();
})();
