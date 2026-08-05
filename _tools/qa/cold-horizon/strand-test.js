/**
 * strand-test.js — NO-BRICK verification.
 * Strand the RSV: zero propellant, far from the station, drifting outward.
 * Before the auto-recall this state was terminal — the mission could never be
 * completed and the only exit was reloading the page.
 */
const http=require('http'),fs=require('fs'),path=require('path');
const puppeteer=require('/home/eq/ai-content/hexworth-prime/node_modules/puppeteer');
const ROOT='/home/eq/ai-content/hexworth-prime/_app';
const MIME={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.webp':'image/webp','.png':'image/png'};
const s=http.createServer((q,r)=>{let p=decodeURIComponent(q.url.split('?')[0]);if(p.endsWith('/'))p+='index.html';
 fs.readFile(path.join(ROOT,p),(e,b)=>{if(e){r.writeHead(404);return r.end();}
 r.writeHead(200,{'Content-Type':MIME[path.extname(p)]||'application/octet-stream'});r.end(b);});});
(async()=>{
 await new Promise(r=>s.listen(0,'127.0.0.1',r));
 const port=s.address().port;
 const b=await puppeteer.launch({headless:'new',args:['--no-sandbox','--disable-setuid-sandbox',
   '--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const p=await b.newPage(); await p.setViewport({width:1280,height:720});
 const errs=[]; p.on('pageerror',e=>errs.push(e.message));
 await p.evaluateOnNewDocument(()=>{localStorage.setItem('hexworth_house','cloud');localStorage.setItem('hexworth_sorted','true');});
 await p.goto(`http://127.0.0.1:${port}/houses/cloud/games/cloud-cold-horizon.html?qa=1`,{waitUntil:'domcontentloaded',timeout:60000});
 await new Promise(r=>setTimeout(r,3500));
 await p.evaluate(()=>document.getElementById('startBtn').click());
 await new Promise(r=>setTimeout(r,1200));

 // STRAND: no fuel, 320 m out, drifting further away
 const start = await p.evaluate(()=>{
   const q=window.__COLD_HORIZON_QA__;
   q.ship.pos.set(120,70,130);
   q.ship.vel.set(2.2,1.1,2.4);      // heading away
   q.ship.fuel = 0;
   return q.snapshot();
 });
 console.log('stranded at range', start.range, 'fuel', start.fuel);

 let last=start, samples=[];
 for(let i=0;i<110;i++){
   await new Promise(r=>setTimeout(r,1000));
   last = await p.evaluate(()=>window.__COLD_HORIZON_QA__.snapshot());
   samples.push(last.range);
   if(last.range <= 40) break;
 }
 const recallSeen = samples.length>1;
 console.log('range trace:', samples.map(n=>Math.round(n)).join(' -> '));
 console.log('final:', JSON.stringify({range:last.range, fuel:last.fuel, recalling:last.recalling}));
 const home = last.range <= 42;
 const refuelled = last.fuel > 5;
 console.log(home ? 'PASS  auto-recall returned the RSV to the station' : 'FAIL  still stranded');
 console.log(refuelled ? 'PASS  re-serviced on arrival, mission can continue' : 'FAIL  no propellant restored');
 console.log('pageerrors:', errs.length, errs.slice(0,3));
 await b.close(); s.close();
 process.exit(home && refuelled && !errs.length ? 0 : 1);
})();
