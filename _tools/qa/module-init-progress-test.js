#!/usr/bin/env node
/*
 * @catalog what    Proves the Wireshark/Forensics module pages record progress and the hub moves.
 * @catalog run     node _tools/qa/module-init-progress-test.js
 * @catalog status  GATE
 *
 * WHY (BUG-099). 93 module pages across two courses called ModuleProgress.init({moduleId, hubKey})
 * and it did not exist -- `init:` was NEVER in ModuleProgress.js, so this was an integration that
 * never happened rather than a regression. Every page threw TypeError on load, and the real damage
 * was bigger: WiresharkEngine reads hexworth_wireshark_progress to render the hub, and NOTHING
 * wrote that key. Both courses showed 0% permanently.
 *
 * ⚠ IT ASSERTS THE HUB MOVES, not just that the error is gone. "No TypeError" would have passed
 * while a SECOND defect (below) still made the modules uncountable. Measure the outcome, not the
 * symptom.
 *
 * ⚠ SECOND DEFECT THIS FOUND, and only this assertion could: six protocol-analysis pages passed a
 * moduleId the hub had never heard of (page said 'ws-pa-01', WiresharkData calls that same href
 * 'ws-07'). Two enumerations of one course disagreeing -- the same class as BUG-107. Realigned to
 * the hub's ids, which are authoritative because the hub renders progress from them.
 */
const puppeteer=require('puppeteer'),http=require('http'),fs=require('fs'),path=require('path');
const ROOT='/home/eq/ai-content/hexworth-prime/_app';
const MIME={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.webp':'image/webp','.png':'image/png','.svg':'image/svg+xml'};
const srv=http.createServer((q,r)=>{let p=decodeURIComponent(q.url.split('?')[0]);if(p.endsWith('/'))p+='index.html';
 fs.readFile(path.join(ROOT,p),(e,b)=>{if(e){r.writeHead(404);return r.end('404');}
 r.writeHead(200,{'Content-Type':MIME[path.extname(p)]||'application/octet-stream'});r.end(b);});});
let pass=0,fail=0; const ck=(n,c,d)=>{c?pass++:fail++;console.log(`  ${c?'PASS':'FAIL'}  ${n}${c?'':'  -> '+d}`)};
(async()=>{
 await new Promise(r=>srv.listen(0,'127.0.0.1',r)); const port=srv.address().port;
 const b=await puppeteer.launch({headless:'new',args:['--no-sandbox','--disable-setuid-sandbox']});
 const errs=[]; const p=await b.newPage(); p.on('pageerror',e=>errs.push(String(e.message)));
 // 1. hubKey form (86 callers)
 await p.goto(`http://127.0.0.1:${port}/wireshark/sections/fundamentals/ws-01-interface-tour.module.html`,{waitUntil:'domcontentloaded'});
 await new Promise(r=>setTimeout(r,600));
 ck('no TypeError on a module page (was: 93 pages threw)', errs.filter(e=>/init is not a function/.test(e)).length===0, errs[0]);
 const w=await p.evaluate(()=>JSON.parse(localStorage.getItem('hexworth_wireshark_progress')||'{}'));
 ck('  the module is recorded in the course store', !!w['ws-01'], JSON.stringify(w));
 // 2. houseId form (7 callers) resolves by PATH, not by the ambiguous houseId
 await p.goto(`http://127.0.0.1:${port}/wireshark/sections/protocol-analysis/ws-pa-01-ethernet.module.html`,{waitUntil:'domcontentloaded'});
 await new Promise(r=>setTimeout(r,600));
 const w2=await p.evaluate(()=>JSON.parse(localStorage.getItem('hexworth_wireshark_progress')||'{}'));
 ck('  houseId-only callers resolve to the right course by path', !!w2['ws-07'], JSON.stringify(w2));
 ck('  and did NOT land in the forensics store',
    (await p.evaluate(()=>localStorage.getItem('hexworth_forensics_progress')))===null);
 // 3. THE POINT: the hub now renders real progress
 await p.goto(`http://127.0.0.1:${port}/wireshark/index.html`,{waitUntil:'domcontentloaded'});
 await new Promise(r=>setTimeout(r,900));
 const done=await p.evaluate(()=>{const t=document.body.innerText.match(/(\d+)\s*\/\s*32/); return t?Number(t[1]):-1;});
 ck('THE HUB NOW MOVES: 2 of 32 modules complete', done===2, 'hub reads '+done);
 // 4. idempotent
 await p.goto(`http://127.0.0.1:${port}/wireshark/sections/fundamentals/ws-01-interface-tour.module.html`,{waitUntil:'domcontentloaded'});
 await new Promise(r=>setTimeout(r,500));
 const again=await p.evaluate(()=>JSON.parse(localStorage.getItem('hexworth_wireshark_progress')||'{}'));
 ck('  revisiting does not duplicate or move the timestamp',
    !!(again['ws-01'] && w['ws-01']) && again['ws-01'].at===w['ws-01'].at,
    'nothing was recorded to compare: ' + JSON.stringify(again));
 await b.close(); srv.close();
 console.log(`\n  ${pass}/${pass+fail} checks passed`); process.exit(fail?1:0);
})().catch(e=>{console.error('ERR '+e.message);process.exit(1);});
