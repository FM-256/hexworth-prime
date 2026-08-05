/**
 * tracker-test.js — prove a WIN is recorded as a WIN.
 * The first draft passed `won:true`/`durationSec`, but GameTracker.record reads
 * `result === 'success'` and `timeElapsed`. With the wrong keys a genuine
 * victory increments LOSSES. This asserts the counters, not the call.
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

 let pass=0,fail=0;
 const ck=(l,ok,d)=>{ ok?pass++:fail++; console.log(`  ${ok?'PASS':'FAIL'}  ${l}${d?'  -> '+d:''}`); };

 // ---------- WIN RUN ----------
 const p=await b.newPage(); await p.setViewport({width:1280,height:720});
 const errs=[]; p.on('pageerror',e=>errs.push(e.message));
 await p.evaluateOnNewDocument(()=>{localStorage.clear();localStorage.setItem('hexworth_house','cloud');localStorage.setItem('hexworth_sorted','true');});
 await p.goto(`http://localhost:${port}/houses/cloud/games/cloud-cold-horizon.html?qa=1`,{waitUntil:'domcontentloaded',timeout:60000});
 await new Promise(r=>setTimeout(r,3500));

 ck('GameTracker binding reachable from module scope', await p.evaluate(()=>typeof GameTracker==='object'));
 ck('AchievementManager binding reachable', await p.evaluate(()=>typeof AchievementManager==='object'));

 await p.evaluate(()=>{
   document.getElementById('startBtn').click();
   const q=window.__COLD_HORIZON_QA__;
   ['VESTA-2','HELIOS-7','JANUS-4','KEPLER-9'].forEach(id=>q.forceScan(id));
   q.decide('ir');
 });
 await new Promise(r=>setTimeout(r,1500));

 const st=await p.evaluate(()=>{
   const s=GameTracker.getGameStats('cold-horizon');
   const ids=AchievementManager.getUnlockedIds?AchievementManager.getUnlockedIds():[];
   return {stats:s, hasAch: ids.indexOf('game_coldhorizon')!==-1};
 });
 console.log('    stats:', JSON.stringify(st.stats));
 ck('a win increments WINS (not losses)', st.stats && st.stats.wins===1 && st.stats.losses===0,
    `wins=${st.stats&&st.stats.wins} losses=${st.stats&&st.stats.losses}`);
 ck('bestTime is populated on a win', st.stats && st.stats.bestTime!=null, 'bestTime='+(st.stats&&st.stats.bestTime));
 ck('achievement game_coldhorizon unlocked by real play', st.hasAch===true);
 await p.close();

 // ---------- LOSS RUN ----------
 const p2=await b.newPage(); await p2.setViewport({width:1280,height:720});
 p2.on('pageerror',e=>errs.push(e.message));
 await p2.evaluateOnNewDocument(()=>{localStorage.clear();localStorage.setItem('hexworth_house','cloud');localStorage.setItem('hexworth_sorted','true');});
 await p2.goto(`http://localhost:${port}/houses/cloud/games/cloud-cold-horizon.html?qa=1`,{waitUntil:'domcontentloaded',timeout:60000});
 await new Promise(r=>setTimeout(r,3500));
 await p2.evaluate(()=>{
   document.getElementById('startBtn').click();
   const q=window.__COLD_HORIZON_QA__;
   ['VESTA-2','HELIOS-7','JANUS-4','KEPLER-9'].forEach(id=>q.forceScan(id));
   q.decide('vote');
 });
 await new Promise(r=>setTimeout(r,1500));
 const st2=await p2.evaluate(()=>{
   const s=GameTracker.getGameStats('cold-horizon');
   const ids=AchievementManager.getUnlockedIds?AchievementManager.getUnlockedIds():[];
   return {stats:s, hasAch: ids.indexOf('game_coldhorizon')!==-1};
 });
 console.log('    stats:', JSON.stringify(st2.stats));
 ck('a wrong call increments LOSSES', st2.stats && st2.stats.losses===1 && st2.stats.wins===0,
    `wins=${st2.stats&&st2.stats.wins} losses=${st2.stats&&st2.stats.losses}`);
 ck('no achievement for a wrong call', st2.hasAch===false);
 await p2.close();

 // ---------- PRODUCTION HOST: QA SEAM MUST NOT EXIST ----------
 const p3=await b.newPage();
 await p3.evaluateOnNewDocument(()=>{localStorage.setItem('hexworth_house','cloud');localStorage.setItem('hexworth_sorted','true');});
 // 127.0.0.1 is allow-listed; use a hosts-style alias to simulate a non-local origin
 await p3.goto(`http://127.0.0.1:${port}/houses/cloud/games/cloud-cold-horizon.html`,{waitUntil:'domcontentloaded',timeout:60000});
 await new Promise(r=>setTimeout(r,3000));
 const noParam=await p3.evaluate(()=>typeof window.__COLD_HORIZON_QA__);
 ck('seam absent without ?qa=1 even on a local host', noParam==='undefined', 'typeof='+noParam);
 await p3.close();

 console.log('\npageerrors:',errs.length, errs.slice(0,3));
 console.log(`${pass} passed, ${fail} failed`);
 await b.close(); s.close();
 process.exit(fail||errs.length?1:0);
})();
