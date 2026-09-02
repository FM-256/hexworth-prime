// HEXOS-5's whole pitch is "installs to a Chromebook or tablet". Nobody has checked it RENDERS at
// those sizes. Horizontal overflow is the classic failure and it makes an installed app feel broken.
const http=require('http'),fs=require('fs'),path=require('path');
const pup=require('/home/eq/ai-content/hexworth-prime/node_modules/puppeteer');
const APP='/home/eq/ai-content/hexworth-prime/_app',PORT=9223;
const T={'.html':'text/html','.js':'text/javascript','.json':'application/json','.css':'text/css','.webp':'image/webp','.png':'image/png','.webmanifest':'application/manifest+json'};
http.createServer((q,r)=>{let p=decodeURIComponent(q.url.split('?')[0]);if(p.endsWith('/'))p+='index.html';
 const f=path.join(APP,p);if(!f.startsWith(APP)||!fs.existsSync(f)||fs.statSync(f).isDirectory())return r.writeHead(404),r.end();
 r.writeHead(200,{'Content-Type':T[path.extname(f)]||'application/octet-stream'});r.end(fs.readFileSync(f));
}).listen(PORT,'127.0.0.1',async()=>{
 const O=`http://localhost:${PORT}`;
 const b=await pup.launch({headless:'new',args:['--no-sandbox']});
 const VIEWPORTS=[
   ['phone      375x667',375,667],
   ['tablet     768x1024',768,1024],
   ['chromebook 1366x768',1366,768],
   ['desktop    1920x1080',1920,1080],
 ];
 const PAGES=['/hex/','/hex/apps.html','/hex/faq.html','/home.html'];
 for(const page of PAGES){
   console.log(`\n  ${page}`);
   for(const [label,w,h] of VIEWPORTS){
     const pg=await b.newPage();
     await pg.setViewport({width:w,height:h});
     await pg.setRequestInterception(true);
     pg.on('request',r=>{const u=r.url();
       if(/AccessGuard\.js$/.test(u))return r.respond({status:200,contentType:'text/javascript',body:'window.AccessGuard={require:function(){}};'});
       if(/FirebaseAuth\.js$/.test(u))return r.respond({status:200,contentType:'text/javascript',body:'window.FirebaseAuth={waitForAuth:async()=>null};'});
       if(!u.startsWith(O))return r.abort(); r.continue();});
     await pg.goto(O+page,{waitUntil:'networkidle0'}).catch(()=>null);
     await new Promise(r=>setTimeout(r,900));
     const m=await pg.evaluate(()=>{
       const de=document.documentElement;
       const over=[...document.querySelectorAll('*')].filter(e=>{
         const r=e.getBoundingClientRect();
         return r.width>0 && r.right>document.documentElement.clientWidth+2;
       });
       // COUNT FIRST, then sample. The archived version sliced to 3 and printed only the
       // sample, so a run with 5 overflowing elements reported 'three spans' and that number
       // went into a commit message as fact. A probe that shows a truncated view must say so.
       const overCount = over.length;
       const overSample = over.slice(0,3).map(e=>e.tagName.toLowerCase()+(e.className&&typeof e.className==='string'?'.'+e.className.split(' ')[0]:''));
       // Tap targets: anything interactive under 32px high is hard to hit on a touch screen.
       const small=[...document.querySelectorAll('a,button,input')].filter(e=>{
         const r=e.getBoundingClientRect(); return r.height>0 && r.height<32;}).length;
       return {scrollW:de.scrollWidth, clientW:de.clientWidth,
               overflowCount:overCount, overflows:overSample, smallTargets:small,
               interactive:document.querySelectorAll('a,button,input').length};
     });
     const bleeds=m.scrollW>m.clientW+2;
     console.log(`     ${label}  ${bleeds?'H-SCROLL '+m.scrollW+'>'+m.clientW:'ok'}`
       + `  small-tap:${m.smallTargets}/${m.interactive}`
       + (m.overflowCount?`  overflowing: ${m.overflowCount} (showing ${m.overflows.length}): ${m.overflows.join(', ')}`:''));
     await pg.close();
   }
 }
 await b.close();process.exit(0);});
