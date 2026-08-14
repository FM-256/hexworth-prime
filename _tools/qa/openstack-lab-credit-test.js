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
 // 4. THE RETURNING STUDENT. Did all five tasks yesterday; comes back to an empty page.
 //    restoreState() restores completedTasks but NOT the inputs, so if the fix re-validated at
 //    FINISH time this student would be blocked, which is worse than the bug being fixed.
 //    Seeded in evaluateOnNewDocument because it re-runs on every navigation: seeding between
 //    loads gets wiped, which made an earlier version of this test report a false failure.
 const back=await b.newPage();
 let alerted=null;
 back.on('dialog',async d=>{alerted=d.message(); await d.dismiss();});
 await back.evaluateOnNewDocument(()=>{
   localStorage.setItem('hexworth_house','cloud'); localStorage.setItem('hexworth_sorted','true');
   localStorage.setItem('hexworth_openstack_lab1_tasks', JSON.stringify([1,2,3,4,5]));
 });
 await back.goto(`http://127.0.0.1:${port}${URL_}`,{waitUntil:'domcontentloaded'});
 await new Promise(r=>setTimeout(r,900));
 const rs=await back.evaluate(()=>({n:completedTasks.size, empty:(document.getElementById('ctrl-mgmt')||{}).value===''}));
 ck('returning student keeps their five tasks', rs.n===5, 'restored '+rs.n);
 ck('  with the inputs genuinely empty', rs.empty===true, 'inputs prefilled, case not exercised');
 await back.evaluate(()=>completeModule());
 await new Promise(r=>setTimeout(r,600));
 ck('  and Finish is NOT blocked for them', await credited(back), 'blocked a legitimate student; alert='+alerted);
 await back.close();

 // 5. THE SAME EXPLOIT, ACROSS ALL THREE MODULE-CARD LABS. The defect was identical in each
 //    (completeModule gated on completedTasks.size), so the guard has to be proven in each.
 //    Only the install lab's legitimate path is walked above; launch-vm and advanced-ops have
 //    their own per-task legitimate checks recorded in the commit that hardened them.
 // 4th element is the lab's OWN task-storage key, read from each lab file rather than guessed:
 // seeding the wrong key would silently restore nothing and the positive case would test itself.
 const LABS=[['install','/houses/cloud/openstack/labs/cloud-openstack-install.lab.html','cloud-openstack-install-lab','hexworth_openstack_lab1_tasks'],
             ['launch-vm','/houses/cloud/openstack/labs/cloud-openstack-launch-vm.lab.html','cloud-openstack-launch-lab','hexworth_openstack_lab2_tasks'],
             ['advanced-ops','/houses/cloud/openstack/labs/cloud-openstack-advanced-ops.lab.html','cloud-openstack-advanced-lab','hexworth_openstack_lab3_tasks']];
 for (const [name,url,moduleId,tasksKey] of LABS) {
   const q=await b.newPage();
   q.on('dialog',async d=>{await d.dismiss();});
   /* ⚠ CLEAR FIRST. localStorage is shared per ORIGIN across pages in one browser, and the
      returning-student case above deliberately seeds hexworth_openstack_lab1_tasks=[1..5].
      Without this the install lab restores those five tasks and completeModule legitimately
      succeeds, which reported a FALSE FAILURE of the guard. Third time this trap has bitten
      this session (feedback_the_harness_carried_state). */
   await q.evaluateOnNewDocument(()=>{
     localStorage.clear();
     localStorage.setItem('hexworth_house','cloud'); localStorage.setItem('hexworth_sorted','true');
   });
   await q.goto(`http://127.0.0.1:${port}${url}`,{waitUntil:'domcontentloaded'});
   await new Promise(r=>setTimeout(r,900));
   await q.evaluate(()=>{ for(let i=97;i<102;i++) markTaskComplete(i);
                          for(let i=1;i<=5;i++) markTaskComplete(i); completeModule(); });
   await new Promise(r=>setTimeout(r,300));
   const got=await q.evaluate(id=>!!((JSON.parse(localStorage.getItem('hexworth_progress')||'{}').cloud||{})[id]||{}).completed, moduleId);
   const n=await q.evaluate(()=>completedTasks.size);
   ck(`${name}: console calls award no credit`, got===false && n===0, `credited=${got} set=${n}`);
   await q.close();

   /* ⚠ BOTH DIRECTIONS, IN EVERY LAB. Chris blocked the first version here: only the install
      lab had its POSITIVE path asserted, so commenting out launch-vm's own
      ModuleProgress.complete left this keeper 12/12 green AND the hub harness 54/54 green on a
      lab that awarded nothing. A guard proven only to REFUSE is half a guard -- the other half,
      "and it still credits a student who did the work", is the half that catches a fix which
      locks legitimate students out. That failure mode is not hypothetical: my first launch-vm
      validator used ids invented from variable names and refused a correct student. */
   const r=await b.newPage();
   let blockedMsg=null;
   r.on('dialog',async d=>{blockedMsg=d.message(); await d.dismiss();});
   await r.evaluateOnNewDocument(key=>{
     localStorage.clear();
     localStorage.setItem('hexworth_house','cloud'); localStorage.setItem('hexworth_sorted','true');
     localStorage.setItem(key, JSON.stringify([1,2,3,4,5]));   // a returning student
   }, tasksKey);
   await r.goto(`http://127.0.0.1:${port}${url}`,{waitUntil:'domcontentloaded'});
   await new Promise(r2=>setTimeout(r2,900));
   const restored=await r.evaluate(()=>completedTasks.size);
   await r.evaluate(()=>completeModule());
   await new Promise(r2=>setTimeout(r2,600));
   const creditedBack=await r.evaluate(id=>!!((JSON.parse(localStorage.getItem('hexworth_progress')||'{}').cloud||{})[id]||{}).completed, moduleId);
   ck(`${name}: a returning student who DID the work still gets credit`,
      restored===5 && creditedBack===true, `restored=${restored} credited=${creditedBack} alert=${blockedMsg}`);
   await r.close();
 }

 await b.close(); srv.close();
 console.log(`\n  ${pass}/${pass+fail} checks passed`);
 process.exit(fail?1:0);
})().catch(e=>{console.error('ERR '+e.message);process.exit(1);});
