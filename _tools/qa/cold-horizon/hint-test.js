/**
 * hint-test.js — the out-of-fiction coaching layer (Sortie Coach).
 * Canon requires: out of fiction, tiered (restate objective -> name the
 * unexamined interface -> name the artifact), visually UNMISTAKABLE from
 * EIDOLON, and a hint cost that is stated rather than silent.
 */
const http=require('http'),fs=require('fs'),path=require('path');
const puppeteer=require('/home/eq/ai-content/hexworth-prime/node_modules/puppeteer');
const ROOT='/home/eq/ai-content/hexworth-prime/_app';
const MIME={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.webp':'image/webp','.png':'image/png'};
const s=http.createServer((q,r)=>{let p=decodeURIComponent(q.url.split('?')[0]);if(p.endsWith('/'))p+='index.html';
 fs.readFile(path.join(ROOT,p),(e,b)=>{if(e){r.writeHead(404);return r.end();}
 r.writeHead(200,{'Content-Type':MIME[path.extname(p)]||'application/octet-stream'});r.end(b);});});
let pass=0,fail=0;
const ck=(l,ok,d)=>{ok?pass++:fail++;console.log(`  ${ok?'PASS':'FAIL'}  ${l}${d?'  -> '+d:''}`);};
(async()=>{
 await new Promise(r=>s.listen(0,'127.0.0.1',r));
 const port=s.address().port;
 const b=await puppeteer.launch({headless:'new',args:['--no-sandbox','--disable-setuid-sandbox',
   '--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const p=await b.newPage(); await p.setViewport({width:1440,height:810});
 const errs=[]; p.on('pageerror',e=>errs.push(e.message));
 await p.evaluateOnNewDocument(()=>{localStorage.clear();localStorage.setItem('hexworth_house','cloud');localStorage.setItem('hexworth_sorted','true');});
 await p.goto(`http://127.0.0.1:${port}/houses/cloud/games/cloud-cold-horizon.html?qa=1`,{waitUntil:'domcontentloaded',timeout:60000});
 await new Promise(r=>setTimeout(r,3500));

 // Wait for the brief to finish typing. Sampling on a fixed delay read a
 // half-rendered brief once the sequence grew; the START button gaining .on is
 // the real "brief complete" signal.
 for(let i=0;i<40;i++){
   const ready=await p.evaluate(()=>document.getElementById('startBtn').classList.contains('on'));
   if(ready) break;
   await new Promise(r=>setTimeout(r,250));
 }
 // plain-language opener must precede any sensor id in the brief
 const boot=await p.evaluate(()=>document.getElementById('bootLine').textContent);
 ck('brief opens in plain language, before any sensor id',
    boot.indexOf('REPAIR DRONE') !== -1 && boot.indexOf('REPAIR DRONE') < boot.indexOf('TH-1'),
    'dronePos='+boot.indexOf('REPAIR DRONE')+' th1Pos='+boot.indexOf('TH-1'));
 ck('brief tells the player how to get help', /press \[H\]/i.test(boot));

 await p.evaluate(()=>document.getElementById('startBtn').click());
 await new Promise(r=>setTimeout(r,1200));

 ck('control legend is persistent, not only on the boot screen',
    await p.evaluate(()=>getComputedStyle(document.getElementById('keys')).display!=='none'));

 // tier escalation on objective 1
 const t1=await p.evaluate(()=>{window.__COLD_HORIZON_QA__.showHex();return window.__COLD_HORIZON_QA__.hexState();});
 ck('H opens the coach at tier 1', t1.open===true && t1.tier===1, 'tier='+t1.tier);
 ck('tier 1 restates the objective', /Objective one/i.test(t1.msg));
 ck('cost is stated, not silent', t1.discipline===97, 'discipline='+t1.discipline);
 ck('coach panel is visually distinct from EIDOLON', t1.hexBg!==t1.eidBg, t1.hexBg+' vs '+t1.eidBg);

 const t2=await p.evaluate(()=>{window.__COLD_HORIZON_QA__.showHex();return window.__COLD_HORIZON_QA__.hexState();});
 ck('second press escalates to tier 2', t2.tier===2, 'tier='+t2.tier);
 ck('tier 2 names the unexamined interface', /thrust|W fires|X cancels/i.test(t2.msg));

 const t3=await p.evaluate(()=>{window.__COLD_HORIZON_QA__.showHex();return window.__COLD_HORIZON_QA__.hexState();});
 ck('third press escalates to tier 3', t3.tier===3, 'tier='+t3.tier);
 ck('tier 3 names the concrete action', /RANGE|press X/i.test(t3.msg));

 const t4=await p.evaluate(()=>{window.__COLD_HORIZON_QA__.showHex();return window.__COLD_HORIZON_QA__.hexState();});
 ck('tier 3 is the floor, cost stops accruing', t4.tier===3 && t4.discipline===t3.discipline,
    'discipline='+t4.discipline);

 // advancing the objective must reset the tier budget
 await p.evaluate(()=>{const q=window.__COLD_HORIZON_QA__;q.aimAt('HELIOS-7',24);});
 await new Promise(r=>setTimeout(r,1200));
 const adv=await p.evaluate(()=>{window.__COLD_HORIZON_QA__.showHex();return window.__COLD_HORIZON_QA__.hexState();});
 ck('tiers reset per objective (new phase starts at tier 1)',
    adv.phase==='ir' && adv.tier===1, 'phase='+adv.phase+' tier='+adv.tier);
 ck('phase-appropriate hint, not a fixed script', /infrared camera/i.test(adv.msg));

 // decision-phase tier 3 must teach the real lesson, not just the answer
 await p.evaluate(()=>{const q=window.__COLD_HORIZON_QA__;q.toggleThermal();
   ['VESTA-2','HELIOS-7','JANUS-4','KEPLER-9'].forEach(i=>q.forceScan(i));});
 await new Promise(r=>setTimeout(r,2200));
 const d=await p.evaluate(()=>{const q=window.__COLD_HORIZON_QA__;
   q.showHex();q.showHex();q.showHex();return q.hexState();});

 // POSITIVE: it must point at the artifact.
 ck('decision tier 3 points at the artifact (bus and clock)',
    /bus/i.test(d.msg) && /clock/i.test(d.msg), 'phase='+d.phase);

 // NEGATIVE — the assertion the first version of this test was missing, which
 // is why it passed while tier 3 restated the correct option almost verbatim
 // and named the decoy to rule it out. Coaching must not become a verdict:
 // dr-hex-constitution.md:120 forbids handing over an answer at ANY help level.
 ck('decision tier 3 does NOT tell the player which option to pick',
    !/corroborated by (my|your) own/i.test(d.msg) && !/\bfile TH-2\b/i.test(d.msg),
    'msg="'+d.msg.slice(0,110)+'..."');
 ck('decision tier 3 does NOT name the decoy to rule it out',
    !/odd one out/i.test(d.msg));

 // Blanket check across EVERY hint in EVERY phase against the REAL option
 // labels, so this cannot regress in a phase the test does not visit.
 const leak = await p.evaluate(()=>{
   const q = window.__COLD_HORIZON_QA__;
   const norm = s => s.toLowerCase().replace(/[^a-z0-9 ]/g,'').replace(/\s+/g,' ').trim();
   const bad = [];
   for(const [phase, tiers] of Object.entries(q.HINTS)){
     tiers.forEach((text, i) => {
       const t = norm(text);
       for(const o of q.OPTIONS){
         // strip the parenthetical value so we compare the CLAIM, not the number
         const label = norm(o.label.replace(/\([^)]*\)/g,''));
         if(label.length > 12 && t.includes(label)) bad.push(`${phase} tier${i+1} contains option "${o.k}"`);
       }
     });
   }
   return bad;
 });
 ck('no hint in any phase reproduces a decision option verbatim',
    leak.length===0, leak.join('; ') || 'clean');

 await p.screenshot({path:'/tmp/claude-1000/-home-eq/d7b814d9-d937-47c0-8ed6-0ba92645deec/scratchpad/hex.png'});
 console.log('\npageerrors:',errs.length,errs.slice(0,3));
 console.log(`${pass} passed, ${fail} failed`);
 await b.close(); s.close();
 process.exit(fail||errs.length?1:0);
})();
