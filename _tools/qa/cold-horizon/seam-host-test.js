/**
 * seam-host-test.js — prove the QA seam is absent on a NON-LOCAL hostname even
 * when ?qa=1 is present. Nancy correctly flagged that the previous check only
 * proved "absent without the param on an allowed host", which is the weaker
 * claim. Chrome's --host-resolver-rules maps a production-looking hostname onto
 * the loopback server, so location.hostname is genuinely not in QA_HOSTS.
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
 let pass=0,fail=0;
 const ck=(l,ok,d)=>{ok?pass++:fail++;console.log(`  ${ok?'PASS':'FAIL'}  ${l}${d?'  -> '+d:''}`);};

 const b=await puppeteer.launch({headless:'new',args:['--no-sandbox','--disable-setuid-sandbox',
   '--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader',
   `--host-resolver-rules=MAP hexworth.com 127.0.0.1, MAP www.hexworth.com 127.0.0.1`]});

 // 1. PRODUCTION-LOOKING HOST + ?qa=1  -> seam must NOT exist
 const p=await b.newPage();
 await p.evaluateOnNewDocument(()=>{localStorage.setItem('hexworth_house','cloud');localStorage.setItem('hexworth_sorted','true');});
 await p.goto(`http://hexworth.com:${port}/houses/cloud/games/cloud-cold-horizon.html?qa=1`,{waitUntil:'domcontentloaded',timeout:60000});
 await new Promise(r=>setTimeout(r,4000));
 const r1=await p.evaluate(()=>({host:location.hostname, seam:typeof window.__COLD_HORIZON_QA__,
   started:!!document.getElementById('startBtn')}));
 ck('page really loaded under a non-local hostname', r1.host==='hexworth.com' && r1.started, 'host='+r1.host);
 ck('QA seam ABSENT on hexworth.com even with ?qa=1', r1.seam==='undefined', 'typeof='+r1.seam);
 await p.close();

 // 2. control: same param on an allowed host -> seam MUST exist (proves the
 //    test is capable of observing a seam at all, i.e. not vacuously passing)
 const p2=await b.newPage();
 await p2.evaluateOnNewDocument(()=>{localStorage.setItem('hexworth_house','cloud');localStorage.setItem('hexworth_sorted','true');});
 await p2.goto(`http://127.0.0.1:${port}/houses/cloud/games/cloud-cold-horizon.html?qa=1`,{waitUntil:'domcontentloaded',timeout:60000});
 await new Promise(r=>setTimeout(r,4000));
 const r2=await p2.evaluate(()=>({host:location.hostname, seam:typeof window.__COLD_HORIZON_QA__}));
 ck('CONTROL: seam PRESENT on 127.0.0.1 with ?qa=1', r2.seam==='object', 'typeof='+r2.seam);
 await p2.close();

 console.log(`\n${pass} passed, ${fail} failed`);
 await b.close(); s.close();
 process.exit(fail?1:0);
})();
