#!/usr/bin/env node
/**
 * @catalog what    A+ ch25 lab stage 1 + the graded-machine naming trap
 * @catalog run     node _tools/lab-tests/lab-check.js
 * @catalog status  GATE
 *
 * Moved out of a session scratchpad on 2026-08-07. These suites caught the defects
 * that ten review rounds were spent on, and they existed only for the length of one
 * session. Run them before touching the labs they cover, and via run-all.js in the
 * deploy chain.
 */
const REPO = require('path').resolve(__dirname, '..', '..');
/* Stage 1 lab: prove it is a LAB, not a quiz.
   The three failure modes this must rule out, per the platform standard:
     1. navigation credit  -- opening a dialog / switching a tab / loading credits nothing
     2. soft gates         -- a direct function call must be a no-op unless state allows it
     3. brute-forceable    -- the free-text checkpoint must not be guessable or DOM-readable
*/
const http=require('http'),fs=require('fs'),path=require('path');
const puppeteer=require(require('path').join(REPO,'node_modules','puppeteer'));
const ROOT=require('path').join(REPO,'_app');
const MIME={'.html':'text/html','.js':'text/javascript','.webp':'image/webp'};
const srv=http.createServer((q,r)=>{let p=decodeURIComponent(q.url.split('?')[0]);
 fs.readFile(path.join(ROOT,p),(e,b)=>{if(e){r.writeHead(404);return r.end();}
 r.writeHead(200,{'Content-Type':MIME[path.extname(p)]||'application/octet-stream'});r.end(b);});});
let P=0,F=0;const ck=(l,ok,d)=>{ok?P++:F++;console.log(`  ${ok?'PASS':'FAIL'}  ${l}${d?'  -> '+d:''}`);};
const U='/houses/forge/applets/comptia-aplus/core-2/labs/forge-virtualization.lab.html';
const done=pg=>pg.evaluate(()=>Object.keys(LAB.tasksDone).filter(k=>LAB.tasksDone[k]).length);
(async()=>{
 await new Promise(r=>srv.listen(0,'127.0.0.1',r));
 const base=`http://127.0.0.1:${srv.address().port}`;
 const b=await puppeteer.launch({headless:'new',args:['--no-sandbox','--disable-setuid-sandbox']});
 const pg=await b.newPage(); await pg.setViewport({width:1600,height:1000});
 await pg.setRequestInterception(true);
 pg.on('request',r=>r.url().includes('AccessGuard.js')?r.abort():r.continue());
 const errs=[]; pg.on('pageerror',e=>{if(!/AccessGuard is not defined/.test(e.message))errs.push(e.message);});
 await pg.goto(base+U,{waitUntil:'networkidle2'}); await new Promise(r=>setTimeout(r,700));
 await pg.evaluate(()=>closeModal('mBrief'));

 ck('page loads, model reachable from another script tag',
    await pg.evaluate(()=>typeof window.LAB==='object'&&typeof window.HOST==='object'&&Array.isArray(window.TASKS)));
 ck('ZERO selection widgets on the page (no quiz mechanics)',
    await pg.evaluate(()=>document.querySelectorAll('input[type=radio],input[type=checkbox],select').length)===0);
 ck('starts with 0 tasks credited', await done(pg)===0);

 // ---- 1. NAVIGATION CREDIT ----
 await pg.evaluate(()=>{openNew(); closeModal('mNew');});
 await pg.evaluate(()=>{try{openSettings();}catch(e){} try{setTab('network'); setTab('system');}catch(e){}});
 ck('opening dialogs / switching tabs credits NOTHING', await done(pg)===0, 'credited '+await done(pg));

 // ---- 2. DIRECT-CALL BYPASS on every gate ----
 const bypass=await pg.evaluate(()=>{
   const before=JSON.stringify(LAB.tasksDone);
   try{startVM();}catch(e){}        // no VM selected
   try{takeSnapshot();}catch(e){}
   try{attachIso('win11_23h2.iso');}catch(e){}
   try{setNet('internal');}catch(e){}
   let fired=false;
   const MP=window.ModuleProgress||(window.ModuleProgress={});
   const real=MP.complete; MP.complete=function(){fired=true;};
   try{finishStage();}catch(e){}
   if(real) MP.complete=real; else delete MP.complete;
   return {same:JSON.stringify(LAB.tasksDone)===before, fired};
 });
 ck('every action is a no-op with no VM (direct call cannot skip ahead)', bypass.same, JSON.stringify(bypass));
 ck('finishStage() called directly does NOT record completion', bypass.fired===false, JSON.stringify(bypass));

 // ---- 3. BUILD THE MACHINE FOR REAL ----
 await pg.evaluate(()=>{
   openNew();
   const n=document.getElementById('nvName'); n.value='Win11-Lab';
   n.dispatchEvent(new Event('input'));
   document.getElementById('nvRam').value=4096; onRam();
   createVM();
 });
 await new Promise(r=>setTimeout(r,150));
 ck('creating a Windows 11 VM credits task 1', await pg.evaluate(()=>LAB.tasksDone.t1===true));
 ck('and the guest OS was DETECTED from the name',
    await pg.evaluate(()=>LAB.vms[0].os), 'Windows 11 (64-bit)');

 // RAM below the floor must NOT credit
 await pg.evaluate(()=>{openSettings(); document.getElementById('stRam').value=2048; onStRam();});
 ck('2048 MB does not satisfy the >=4096 memory task', await pg.evaluate(()=>!LAB.tasksDone.t2));
 // over the safe max must NOT credit either
 await pg.evaluate(()=>{document.getElementById('stRam').value=16384; onStRam();});
 ck('16384 MB (starves the host) does not satisfy it either', await pg.evaluate(()=>!LAB.tasksDone.t2));
 await pg.evaluate(()=>{document.getElementById('stRam').value=8192; onStRam();});
 ck('8192 MB does satisfy it', await pg.evaluate(()=>LAB.tasksDone.t2===true));
 await pg.evaluate(()=>{document.getElementById('stRam').value=1024; onStRam();});
 ck('breaking the machine REVOKES the tick (not sticky)', await pg.evaluate(()=>LAB.tasksDone.t2===false));
 await pg.evaluate(()=>{document.getElementById('stRam').value=8192; onStRam();});

 // ---- the free-text checkpoint ----
 const expect=await pg.evaluate(()=>String(HOST.ram-HOST.reservedRam));
 const inDom=await pg.evaluate(e=>{
   const t=document.body.innerText;
   return (t.match(new RegExp(e,'g'))||[]).length;}, expect);
 ck('the expected value is NOT sitting in the page text to be copied', inDom===0, `"${expect}" appears ${inDom}x`);
 await pg.evaluate(()=>{focusTask('t3'); document.getElementById('ans').value='9999'; submitAnswer();});
 ck('a wrong free-text answer is rejected', await pg.evaluate(()=>!LAB.tasksDone.t3));
 ck('...and does not reveal the answer',
    await pg.evaluate(e=>!document.getElementById('fb').textContent.includes(e), expect));
 await pg.evaluate(e=>{focusTask('t3'); document.getElementById('ans').value=e; submitAnswer();}, expect);
 ck('the correct free-text answer is accepted', await pg.evaluate(()=>LAB.tasksDone.t3===true));

 // ---- boot with no ISO must show the real failure, and not credit t4 ----
 await pg.evaluate(()=>{closeModal('mSet'); startVM();});
 const scr=await pg.evaluate(()=>document.getElementById('screen').innerText);
 ck('booting with an empty optical drive shows "No bootable medium"', /No bootable medium/i.test(scr));
 ck('...and does NOT credit the attach-an-ISO task', await pg.evaluate(()=>!LAB.tasksDone.t4));

 await pg.evaluate(()=>{stopVM(); openSettings(); attachIso('win11_23h2.iso');});
 ck('attaching an ISO credits task 4', await pg.evaluate(()=>LAB.tasksDone.t4===true));
 await pg.evaluate(()=>{setNet('nat');});
 ck('NAT does NOT satisfy the isolate-it task', await pg.evaluate(()=>!LAB.tasksDone.t6));
 await pg.evaluate(()=>{setNet('internal'); closeModal('mSet'); startVM(); takeSnapshot();});
 ck('Internal network satisfies isolation', await pg.evaluate(()=>LAB.tasksDone.t6===true));
 ck('snapshot credited', await pg.evaluate(()=>LAB.tasksDone.t7===true));
 ck('all 7 tasks now complete', await done(pg)===7, 'done='+await done(pg));
 const emptyName=await pg.evaluate(()=>{const before=LAB.vms.length;
   openNew(); document.getElementById('nvName').value='   '; createVM();
   const made=LAB.vms.length>before;
   const msg=document.getElementById('nvNameErr').textContent; closeModal('mNew');
   return {made, msg};});
 ck('empty name does NOT create a machine, and says so inline (no alert)',
    emptyName.made===false && emptyName.msg.length>10, JSON.stringify(emptyName).slice(0,90));
 console.log('\nTHE NAMING TRAP (labVmId pins the FIRST machine of a stage)');
 /* Before the General tab existed, a student who named their first VM badly could never
    satisfy task 1: grading stays pinned to that machine, a second correct VM does not help,
    and there was no rename and no delete. Reset lab was the only escape and it wiped the
    stage. */
 await pg.evaluate(()=>{localStorage.removeItem('hexworth_progress');location.reload();});
 await new Promise(r=>setTimeout(r,700));
 await pg.evaluate(()=>closeModal('mBrief'));
 const trap = await pg.evaluate(()=>{
   openNew();const n=document.getElementById('nvName');n.value='test';
   n.dispatchEvent(new Event('input'));document.getElementById('nvRam').value=8192;onRam();createVM();
   const stuck = STAGE_TASKS[1][0].check();
   openNew();const m=document.getElementById('nvName');m.value='Win11-Lab';
   m.dispatchEvent(new Event('input'));createVM();
   const stillStuck = STAGE_TASKS[1][0].check();      /* grading is pinned to the first */
   return { stuck, stillStuck, pinned: LAB.labVmId[1] === LAB.vms[0].id };
 });
 ck('a badly named first machine fails task 1', trap.stuck===false);
 ck('grading stays pinned to it, so a second machine does not rescue them',
    trap.stillStuck===false && trap.pinned===true);
 const fixed = await pg.evaluate(()=>{
   const first = LAB.vms[0]; selectVM(first.id); openSettings();
   const f = document.getElementById('stName'); f.value = 'Win11-Lab'; renameVM();
   closeModal('mSet');
   return { os: labVM().os, t1: STAGE_TASKS[1][0].check(),
            listed: document.getElementById('vmlist').innerText.includes('Win11-Lab'),
            stillPinned: LAB.labVmId[1] === LAB.vms[0].id };
 });
 ck('renaming it in Settings re-detects the guest', /Windows 11/.test(fixed.os), fixed.os);
 ck('and task 1 is now satisfiable', fixed.t1===true);
 ck('the machine list shows the new name', fixed.listed===true);
 ck('the graded machine is still pinned (the earlier fix is not undone)', fixed.stillPinned===true);
 const blank = await pg.evaluate(()=>{
   const first = LAB.vms[0]; selectVM(first.id); openSettings();
   const f = document.getElementById('stName'); f.value = '   '; renameVM();
   return labVM().name; });
 ck('a blank rename is refused, the machine keeps its name', blank==='Win11-Lab', blank);

 console.log('\nGUEST DETECTION MUST NOT CARE ABOUT SEPARATORS');
 /* Reported live 2026-08-07: task 1 would not read the name. "Windows-11", "Win_11", "Win.11"
    and "W11" all detected as Other/Unknown because the pattern only allowed spaces. */
 const names = await pg.evaluate(()=>{
   const want11 = ['Windows 11','Win11','win 11','Windows-11','Win-11','Windows_11',
                   'windows11','W11','Win11 Lab','My Windows 11 VM','Windows 11 Pro',
                   'Win.11','Windows Eleven','Windows 11 (test)'];
   const wantNot = ['test','lab-vm','sw11','vmware11','ubuntu-server','Windows-10'];
   return { bad: want11.filter(n=>!guessOS(n).startsWith('Windows 11')),
            falsePos: wantNot.filter(n=>guessOS(n).startsWith('Windows 11')),
            ubuntu: guessOS('ubuntu-server'), win10: guessOS('Windows-10') };
 });
 ck('every ordinary spelling of Windows 11 is detected', names.bad.length===0, names.bad.join(' | '));
 ck('and nothing that is not Windows 11 is', names.falsePos.length===0, names.falsePos.join(' | '));
 ck('other guests still detect through separators too',
    /Ubuntu/.test(names.ubuntu) && /Windows 10/.test(names.win10), names.ubuntu+' / '+names.win10);
 ck('a hyphenated name satisfies task 1 end to end', await pg.evaluate(()=>{
    localStorage.removeItem('hexworth_progress'); resetLab();
    openNew();const n=document.getElementById('nvName');n.value='Windows-11';
    n.dispatchEvent(new Event('input'));document.getElementById('nvRam').value=8192;onRam();createVM();
    return STAGE_TASKS[1][0].check()===true; }));

 console.log('\nOPERATOR REPORT: three VMs built, task 1 never completes, no way to delete');
 await pg.evaluate(()=>{localStorage.removeItem('hexworth_progress');location.reload();});
 await new Promise(r=>setTimeout(r,700));
 await pg.evaluate(()=>closeModal('mBrief'));
 const rep = await pg.evaluate(()=>{
   const mk=(n)=>{openNew();const e=document.getElementById('nvName');e.value=n;
     e.dispatchEvent(new Event('input'));document.getElementById('nvRam').value=8192;onRam();createVM();};
   mk('vm1'); mk('vm2'); mk('Win11-Lab');        /* first one is not a Windows 11 name */
   return { t1: STAGE_TASKS[1][0].check(), pinnedName: labVM().name, count: LAB.vms.length };
 });
 ck('reproduces the report: 3 VMs and task 1 still false',
    rep.t1===false && rep.count===3, `pinned=${rep.pinnedName}`);
 const pinFix = await pg.evaluate(()=>{
   const w = LAB.vms.find(v=>v.name==='Win11-Lab'); selectVM(w.id); setLabVM();
   return { t1: STAGE_TASKS[1][0].check(), pinned: labVM().name }; });
 ck('"Use as Lab VM" on the right machine completes task 1',
    pinFix.t1===true, 'pinned='+pinFix.pinned);
 const del = await pg.evaluate(()=>{
   const junk = LAB.vms.find(v=>v.name==='vm1'); selectVM(junk.id); removeVM();
   return { count: LAB.vms.length, names: LAB.vms.map(v=>v.name).join(','),
            t1: STAGE_TASKS[1][0].check() }; });
 ck('Remove discards a machine', del.count===2, del.names);
 ck('and removing a non-graded machine does not disturb grading', del.t1===true);
 const delLab = await pg.evaluate(()=>{
   selectVM(labVM().id); removeVM();
   return { pinned: labVM() ? labVM().name : null, count: LAB.vms.length }; });
 ck('removing the GRADED machine re-pins rather than stranding the stage',
    delLab.pinned!==null && delLab.count===1, 'now graded: '+delLab.pinned);
 const delAll = await pg.evaluate(()=>{
   while (LAB.vms.length) { selectVM(LAB.vms[0].id); removeVM(); }
   return { count: LAB.vms.length, lab: LAB.labVmId[1],
            t1: STAGE_TASKS[1][0].check(),
            pinBtn: document.getElementById('btnPin').disabled,
            rmBtn: document.getElementById('btnRemove').disabled }; });
 ck('removing every machine leaves no graded machine and no credit',
    delAll.count===0 && delAll.lab===null && delAll.t1===false);
 ck('and both buttons switch off with nothing selected',
    delAll.pinBtn===true && delAll.rmBtn===true);

 ck('no JS errors', errs.length===0, errs.slice(0,2).join('; '));
 await pg.screenshot({path:'lab-stage1.png'});
 console.log(`\n${P} passed, ${F} failed`);
 await b.close(); srv.close(); process.exit(F?1:0);
})();
