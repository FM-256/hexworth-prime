#!/usr/bin/env node
/*
 * @catalog what    Tries to get lab credit WITHOUT doing the lab, and checks real work still counts.
 * @catalog run     node _tools/qa/openstack-lab-credit-test.js
 * @catalog status  GATE
 *
 * WHY. BUG-104: completeModule() gated on `completedTasks.size < TOTAL_TASKS` -- the SIZE of a
 * Set, never WHICH tasks were in it. Five calls with any numbers at all awarded full module
 * credit from the console with zero correct answers.
 *
 * ⚠ THIS TESTS BOTH DIRECTIONS ON PURPOSE. A gate that refuses everything passes the exploit
 * half and fails students, which is a worse bug than the one being fixed. So it also asserts
 * that doing task 1 correctly DOES credit it, and that a wrong answer does not.
 */
'use strict';
const puppeteer=require('puppeteer'),http=require('http'),fs=require('fs'),path=require('path');
const ROOT='/home/eq/ai-content/hexworth-prime/_app';
const MIME={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.webp':'image/webp'};
const srv=http.createServer((q,r)=>{let p=decodeURIComponent(q.url.split('?')[0]);if(p.endsWith('/'))p+='index.html';
 fs.readFile(path.join(ROOT,p),(e,b)=>{if(e){r.writeHead(404);return r.end('404');}
 r.writeHead(200,{'Content-Type':MIME[path.extname(p)]||'application/octet-stream'});r.end(b);});});
const URL_='/houses/cloud/openstack/labs/cloud-openstack-install.lab.html';
let pass=0,fail=0; const ck=(n,c,d)=>{c?pass++:fail++;console.log(`  ${c?'PASS':'FAIL'}  ${n}${c?'':'  -> '+d}`)};
(async()=>{
 await new Promise(r=>srv.listen(0,'127.0.0.1',r)); const port=srv.address().port;
 const b=await puppeteer.launch({headless:'new',args:['--no-sandbox','--disable-setuid-sandbox']});
 const fresh=async()=>{const p=await b.newPage();
   p.on('dialog',async d=>{await d.dismiss();});
   await p.evaluateOnNewDocument(()=>{localStorage.clear();localStorage.setItem('hexworth_house','cloud');localStorage.setItem('hexworth_sorted','true');});
   await p.goto(`http://127.0.0.1:${port}${URL_}`,{waitUntil:'domcontentloaded'});
   await new Promise(r=>setTimeout(r,900)); return p;};
 const credited=p=>p.evaluate(()=>!!((JSON.parse(localStorage.getItem('hexworth_progress')||'{}').cloud||{})['cloud-openstack-install-lab']||{}).completed);

 // 1. the original exploit: five bogus task ids
 let p=await fresh();
 await p.evaluate(()=>{for(let i=97;i<102;i++) markTaskComplete(i); completeModule();});
 await new Promise(r=>setTimeout(r,400));
 ck('bogus task ids (97..101) award nothing', !(await credited(p)), 'still credited');
 ck('  and they do not enter the set', (await p.evaluate(()=>completedTasks.size))===0);
 await p.close();

 // 2. the real ids, still without doing the work
 p=await fresh();
 await p.evaluate(()=>{for(let i=1;i<=5;i++) markTaskComplete(i); completeModule();});
 await new Promise(r=>setTimeout(r,400));
 ck('calling markTaskComplete(1..5) by hand awards nothing', !(await credited(p)), 'still credited');
 ck('  because each call re-validates the page', (await p.evaluate(()=>completedTasks.size))===0);
 await p.close();

 // 3. a student who actually does task 1 gets task 1
 p=await fresh();
 const t1=await p.evaluate(()=>{
   const a={'ctrl-mgmt':'10.0.0.11/24','ctrl-gw':'10.0.0.1','comp-mgmt':'10.0.0.31/24','comp-gw':'10.0.0.1'};
   Object.entries(a).forEach(([id,v])=>{const el=document.getElementById(id); if(el) el.value=v;});
   checkTask1();
   return completedTasks.has(1);
 });
 ck('doing task 1 correctly DOES credit task 1', t1===true, 'legitimate work refused');
 const t1bad=await p.evaluate(()=>{
   document.getElementById('ctrl-mgmt').value='10.0.0.99/24';
   completedTasks.delete(1); checkTask1(); return completedTasks.has(1);
 });
 ck('a wrong answer does NOT credit task 1', t1bad===false, 'wrong answer credited');
 await p.close();
 await b.close(); srv.close();
 console.log(`\n  ${pass}/${pass+fail} checks passed`);
 process.exit(fail?1:0);
})().catch(e=>{console.error('ERR '+e.message);process.exit(1);});
