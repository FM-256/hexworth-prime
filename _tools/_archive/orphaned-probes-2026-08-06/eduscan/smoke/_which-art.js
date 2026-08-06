const puppeteer=require('puppeteer');
const BASE=process.env.BASE;
(async()=>{
 const b=await puppeteer.launch({headless:'new',args:['--no-sandbox']});
 const p=await b.newPage();
  await p.setCacheEnabled(false);   // preview redeploys serve max-age=3600; never measure a stale build
 const reqs=[];
 p.on('response',r=>{const u=r.url(); if(/covers\/|backdrops\//.test(u)) reqs.push(r.status()+' '+u.replace(BASE,''));});
 await p.setViewport({width:1440,height:900});
 await p.evaluateOnNewDocument(()=>localStorage.setItem('hexworth_house','cloud'));
 await p.goto(BASE+'/houses/hub/cloud-master',{waitUntil:'networkidle2',timeout:45000});
 await new Promise(r=>setTimeout(r,2500));
 const planes=await p.evaluate(()=>[...document.querySelectorAll('.env-plane')].map(e=>getComputedStyle(e).backgroundImage));
 console.log('  .env-plane background-image:');
 planes.forEach(x=>console.log('    '+x.replace(/^url\(|\)$|"/g,'')));
 const nat=await p.evaluate(async()=>{const i=new Image();i.src=document.querySelector('.env-plane').style.backgroundImage.slice(5,-2);await i.decode();return i.naturalWidth+'x'+i.naturalHeight;});
 console.log('  natural size actually loaded: '+nat);
 console.log('  art requests:'); reqs.slice(0,4).forEach(r=>console.log('    '+r));
 await b.close();
})();
