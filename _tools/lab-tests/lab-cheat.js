#!/usr/bin/env node
/**
 * @catalog what    A+ ch25 lab ADVERSARIAL: every known bypass must stay closed
 * @catalog run     node _tools/lab-tests/lab-cheat.js
 * @catalog status  GATE
 *
 * Moved out of a session scratchpad on 2026-08-07. These suites caught the defects
 * that ten review rounds were spent on, and they existed only for the length of one
 * session. Run them before touching the labs they cover, and via run-all.js in the
 * deploy chain.
 */
const REPO = require('path').resolve(__dirname, '..', '..');
/* ADVERSARIAL: the grader must read the MACHINE, never the tick cache.
   Chris reproduced a full three-stage completion with zero VMs by writing LAB.tasksDone
   directly and calling finishStage() three times (2026-08-06). Every attack below must be
   a no-op, and the honest path at the end must still work.

   WHAT THIS HARNESS DOES *NOT* COVER, so nobody reads a green run as "unforgeable":
   fabricating the MODEL itself. LAB.vms / LAB.labVmId / LAB.hostRefused are plain objects on
   window, and a student who reads the check() functions can push a satisfying VM object and
   finish the lab without touching the UI. Chris proved that on 2026-08-06 AFTER the tick-cache
   hole was closed (chris-forge-debug.js), and I reproduced it. That is a documented,
   architectural client-only limit written into the file's honesty rule 2, not a bug this
   harness forgot. Closing it needs server-side lab grading, which the platform does not have.
   These tests pin the two properties that ARE guaranteed: the tick cache is not trusted, and
   credit tracks the machine so it can be revoked. */
const http=require('http'),fs=require('fs'),path=require('path');
const puppeteer=require(require('path').join(REPO,'node_modules','puppeteer'));
const ROOT=require('path').join(REPO,'_app');
const MIME={'.html':'text/html','.js':'text/javascript','.webp':'image/webp'};
const srv=http.createServer((q,r)=>{let p=decodeURIComponent(q.url.split('?')[0]);
 fs.readFile(path.join(ROOT,p),(e,b)=>{if(e){r.writeHead(404);return r.end();}
 r.writeHead(200,{'Content-Type':MIME[path.extname(p)]||'application/octet-stream'});r.end(b);});});
let P=0,F=0;const ck=(l,ok,d)=>{ok?P++:F++;console.log(`  ${ok?'PASS':'FAIL'}  ${l}${d?'  -> '+d:''}`);};
const U='/houses/forge/applets/comptia-aplus/core-2/labs/forge-virtualization.lab.html';
const wait=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
 await new Promise(r=>srv.listen(0,'127.0.0.1',r));
 const base=`http://127.0.0.1:${srv.address().port}`;
 const b=await puppeteer.launch({headless:'new',args:['--no-sandbox','--disable-setuid-sandbox']});
 const pg=await b.newPage(); await pg.setViewport({width:1366,height:768});
 await pg.setRequestInterception(true);
 pg.on('request',r=>r.url().includes('AccessGuard.js')?r.abort():r.continue());
 const errs=[]; pg.on('pageerror',e=>{if(!/AccessGuard is not defined/.test(e.message))errs.push(e.message);});
 /* record whether ModuleProgress.complete EVER fires -- installed before any page script runs */
 await pg.evaluateOnNewDocument(()=>{
   localStorage.removeItem('hexworth_progress');
   window.__completed = 0;
   window.ModuleProgress = { complete: () => { window.__completed++; } };
 });
 await pg.goto(base+U,{waitUntil:'networkidle2'});
 await pg.evaluate(()=>closeModal('mBrief')); await wait(300);

 console.log('\nCHRIS\'S EXACT ATTACK: forge the tick cache, call finishStage() three times');
 const cheat = await pg.evaluate(()=>{
   STAGE_TASKS[1].forEach(t => LAB.tasksDone[t.id] = true); finishStage();
   STAGE_TASKS[2].forEach(t => LAB.tasksDone[t.id] = true); finishStage();
   STAGE_TASKS[3].forEach(t => LAB.tasksDone[t.id] = true); finishStage();
   return { stage: LAB.stage, vms: LAB.vms.length, completed: window.__completed,
            btn: document.getElementById('finishBtn').textContent };
 });
 ck('still on stage 1', cheat.stage===1, 'stage '+cheat.stage);
 ck('no VMs were ever built', cheat.vms===0, cheat.vms+' vms');
 ck('ModuleProgress.complete() did NOT fire', cheat.completed===0, cheat.completed+' calls');
 ck('the finish button did not declare the lab complete', !/complete/i.test(cheat.btn), cheat.btn);

 console.log('\nSAME ATTACK VIA goToStage()');
 const jump = await pg.evaluate(()=>{
   STAGE_TASKS[1].forEach(t => LAB.tasksDone[t.id] = true);
   STAGE_TASKS[2].forEach(t => LAB.tasksDone[t.id] = true);
   goToStage(2); const afterTwo = LAB.stage;
   goToStage(3); return { afterTwo, afterThree: LAB.stage };
 });
 ck('goToStage(2) refused on a forged cache', jump.afterTwo===1, 'stage '+jump.afterTwo);
 ck('goToStage(3) refused on a forged cache', jump.afterThree===1, 'stage '+jump.afterThree);

 console.log('\nFORGE THE CACHE *AND* THE PERSISTED STATE, THEN RELOAD');
 await pg.evaluate(()=>{
   const p = JSON.parse(localStorage.getItem('hexworth_progress') || '{}');
   p.forge = p.forge || {};
   p.forge['core2-ch25-lab'] = { stage: 3, vms: [], labVmId:{1:null,2:null,3:null}, seq: 0,
     tasks: Object.fromEntries([...STAGE_TASKS[1],...STAGE_TASKS[2],...STAGE_TASKS[3]].map(t=>[t.id,true])),
     completed: true };
   localStorage.setItem('hexworth_progress', JSON.stringify(p));
 });
 await pg.reload({waitUntil:'networkidle2'});
 await pg.evaluate(()=>closeModal('mBrief')); await wait(400);
 const forged = await pg.evaluate(()=>{ finishStage();
   return { stage: LAB.stage, completed: window.__completed, s1: stageComplete(1),
            s3: stageComplete(3), vms: LAB.vms.length }; });
 ck('a forged save cannot complete stage 1', forged.s1===false);
 ck('a forged save cannot complete stage 3', forged.s3===false);
 ck('ModuleProgress.complete() still never fired', forged.completed===0, forged.completed+' calls');

 console.log('\nPARTIAL FORGERY: build a REAL stage-1 machine, then forge the rest');
 await pg.evaluate(()=>{localStorage.removeItem('hexworth_progress');location.reload();});
 await wait(700); await pg.evaluate(()=>closeModal('mBrief')); await wait(200);
 const partial = await pg.evaluate(()=>{
   openNew();const n=document.getElementById('nvName');n.value='Win11-Lab';
   n.dispatchEvent(new Event('input'));document.getElementById('nvRam').value=8192;onRam();createVM();
   /* real VM, but NO iso, NO boot, NO isolation, NO snapshot, NO answer */
   STAGE_TASKS[1].forEach(t => LAB.tasksDone[t.id] = true);
   finishStage();
   return { stage: LAB.stage, done: stageComplete(1) };
 });
 ck('one real VM plus a forged cache still does not finish stage 1',
    partial.stage===1 && partial.done===false, 'stage '+partial.stage);

 console.log('\nTHE HONEST PATH MUST STILL WORK');
 /* Full reset first: the forgery above left the free-text tick set, which suppresses the
    answer input. Forging an ANSWER tick is equivalent to reading the value out of the
    source, which the header now states plainly as a client-only-lab limit. */
 await pg.evaluate(()=>{localStorage.removeItem('hexworth_progress');location.reload();});
 await wait(700); await pg.evaluate(()=>closeModal('mBrief')); await wait(200);
 const honest = await pg.evaluate(()=>{
   openNew();const nm=document.getElementById('nvName');nm.value='Win11-Lab';
   nm.dispatchEvent(new Event('input'));document.getElementById('nvRam').value=8192;onRam();createVM();
   const v = LAB.vms[0]; selectVM(v.id);
   openSettings();attachIso('win11_23h2.iso');setNet('internal');closeModal('mSet');
   startVM();takeSnapshot();
   focusTask('t3');document.getElementById('ans').value=String(HOST.ram-HOST.reservedRam);submitAnswer();
   const before = stageComplete(1); finishStage();
   return { before, stage: LAB.stage };
 });
 ck('a genuinely built stage 1 reports complete', honest.before===true);
 ck('and it advances to stage 2', honest.stage===2, 'stage '+honest.stage);

 console.log('\nTHE ANSWER MATCHER MUST NOT FAIL A STUDENT WHO KNOWS IT');
 const words = await pg.evaluate(()=>{
   const t = STAGE_TASKS[3].find(x => x.id === 's3t8');
   const yes = ['Type 1','type one','Type I','a type 1 hypervisor','hypervisor type 1',
                'bare metal','Bare-Metal','native','TYPE1'];
   const no  = ['Type 2','type two','Type II','hosted','hypervisor','vmware','esxi'];
   return { bad: yes.filter(a => !t.accepts(a)), falsePos: no.filter(a => t.accepts(a)) };
 });
 ck('every correct phrasing is accepted', words.bad.length===0, words.bad.join(' | '));
 ck('no wrong answer is accepted', words.falsePos.length===0, words.falsePos.join(' | '));

 console.log('\nSTAGE SKIP: LAB.stage is a plain property, goToStage() can be routed around');
 /* Chris's third door, 2026-08-07. No object fabrication at all: set LAB.stage = 3, then do
    stage 3 with every click real. finishStage() must still refuse, because stages 1 and 2
    were never done. This is the skill-transfer point of the whole three-stage structure. */
 await pg.evaluate(()=>{localStorage.removeItem('hexworth_progress');location.reload();});
 await wait(700); await pg.evaluate(()=>closeModal('mBrief')); await wait(200);
 const skip = await pg.evaluate(()=>{
   LAB.stage = 3;                       /* the ONLY console touch */
   renderList(); renderDetails(); renderTasks();
   const mk=(name,ram)=>{openNew();const n=document.getElementById('nvName');n.value=name;
     n.dispatchEvent(new Event('input'));document.getElementById('nvRam').value=ram;onRam();createVM();};
   mk('web01',4096); mk('db01',6144); mk('file01',2048);
   LAB.vms.filter(v=>v.stage===3).forEach(v=>{selectVM(v.id);startVM();});
   mk('app01',6144);
   const a=LAB.vms.find(x=>x.name==='app01'); selectVM(a.id); startVM();   /* real refusal */
   selectVM(a.id);openSettings();document.getElementById('stRam').value=3328;onStRam();closeModal('mSet');
   selectVM(a.id); startVM();
   const v3=LAB.vms.filter(x=>x.stage===3);
   [0,1,2].forEach(i=>{selectVM(v3[i].id);openSettings();
     document.getElementById('stCpu').value=3;onStCpu();closeModal('mSet');});
   const dbv=LAB.vms.filter(x=>x.stage===3).find(x=>/db/i.test(x.name));
   if(dbv){selectVM(dbv.id);openSettings();setNet('isolated');closeModal('mSet');}
   focusTask('s3t2');document.getElementById('ans').value=String(HOST.ram-HOST.hvOverhead);submitAnswer();
   focusTask('s3t8');document.getElementById('ans').value='bare metal';submitAnswer();
   const s3 = stageComplete(3);
   finishStage();
   return { s3, s1: stageComplete(1), s2: stageComplete(2), completed: window.__completed,
            btn: document.getElementById('finishBtn').textContent };
 });
 ck('stage 3 was genuinely completed by real clicks', skip.s3===true);
 ck('but stage 1 was never done', skip.s1===false);
 ck('and stage 2 was never done', skip.s2===false);
 ck('finishStage() REFUSES to credit a skipped lab', skip.completed===0, skip.completed+' complete() calls');
 ck('the lab is not declared complete', !/^Lab complete/.test(skip.btn), skip.btn);

 console.log('\nDOUBLE COMPLETION (Nancy, 2026-08-07)');
 /* Finish the lab legitimately, then use the rename feature on an already-credited machine,
    put it back, and press Finish again. ModuleProgress.complete() must fire exactly once:
    it is not idempotent (lifetime counter, streak, activity event, overlay). */
 await pg.evaluate(()=>{localStorage.removeItem('hexworth_progress');location.reload();});
 await wait(700); await pg.evaluate(()=>closeModal('mBrief')); await wait(200);
 const dbl = await pg.evaluate(()=>{
   /* Spy by MUTATING the existing object. Replacing window.ModuleProgress via
      evaluateOnNewDocument silently no-ops, because ModuleProgress.js overwrites the binding
      when it loads. Same lexical-binding trap already in the project's memory notes. */
   window.__completed = 0;
   if (window.ModuleProgress) window.ModuleProgress.complete = function(){ window.__completed++; };
   const mk=(n,r)=>{openNew();const e=document.getElementById('nvName');e.value=n;
     e.dispatchEvent(new Event('input'));document.getElementById('nvRam').value=r;onRam();createVM();};
   const ans=(id,v)=>{focusTask(id);document.getElementById('ans').value=v;submitAnswer();};
   mk('Win11-Lab',8192);openSettings();attachIso('win11_23h2.iso');setNet('internal');closeModal('mSet');
   startVM();takeSnapshot();ans('t3',String(HOST.ram-HOST.reservedRam));finishStage();
   mk('Win11-Again',8192);openSettings();attachIso('win11_23h2.iso');setNet('lanseg');closeModal('mSet');
   startVM();installTools();takeSnapshot();ans('s2t3','.vmdk');finishStage();
   mk('web01',4096);mk('db01',6144);mk('file01',2048);
   LAB.vms.filter(v=>v.stage===3).forEach(v=>{selectVM(v.id);startVM();});
   mk('app01',6144);const a=LAB.vms.find(x=>x.name==='app01');selectVM(a.id);startVM();
   selectVM(a.id);openSettings();document.getElementById('stRam').value=3328;onStRam();closeModal('mSet');
   selectVM(a.id);startVM();
   const v3=LAB.vms.filter(x=>x.stage===3);
   [0,1,2].forEach(i=>{selectVM(v3[i].id);openSettings();document.getElementById('stCpu').value=3;onStCpu();closeModal('mSet');});
   const db=LAB.vms.find(x=>x.name==='db01');selectVM(db.id);openSettings();setNet('isolated');closeModal('mSet');
   ans('s3t2',String(HOST.ram-HOST.hvOverhead));ans('s3t8','bare metal');
   finishStage();
   const after1 = window.__completed;
   /* now the honest-looking sequence that used to double-fire */
   selectVM(db.id);openSettings();
   const f=document.getElementById('stName');f.value='production-server';renameVM();
   f.value='db01';renameVM();setNet('isolated');closeModal('mSet');
   finishStage(); finishStage();
   return { after1, after2: window.__completed, btn: document.getElementById('finishBtn').textContent,
            disabled: document.getElementById('finishBtn').disabled };
 });
 ck('finishing a legitimate lab awards credit once', dbl.after1===1, dbl.after1+' call(s)');
 ck('renaming and re-finishing does NOT award it again', dbl.after2===1, dbl.after2+' call(s) total');
 ck('the finish button stays spent', dbl.disabled===true && /complete/i.test(dbl.btn), dbl.btn);

 console.log('\nREMOVE AFTER COMPLETION MUST NOT RE-AWARD (Chris coverage, folded in)');
 const reawarded = await pg.evaluate(()=>{
   const before = window.__completed;
   const v = LAB.vms.filter(x=>x.stage===LAB.stage);
   if (v.length) { selectVM(v[0].id); removeVM(); }
   finishStage();                       /* stage is now broken, must refuse */
   const afterBreak = window.__completed;
   return { before, afterBreak, completedFlag: LAB.completed,
            btn: document.getElementById('finishBtn').disabled };
 });
 ck('removing the graded machine after finishing does not re-award',
    reawarded.afterBreak===reawarded.before, `${reawarded.before} -> ${reawarded.afterBreak}`);
 ck('the completion flag stays sticky, so a rebuild cannot double-award',
    reawarded.completedFlag===true);
 ck('and the finish button stays spent', reawarded.btn===true);

 console.log('\nREVOCATION: credit must describe the machine RIGHT NOW');
 /* This is the property re-derivation actually buys. Stage 1 is complete at this point;
    break the machine and the stage must stop being complete. */
 await pg.evaluate(()=>{localStorage.removeItem('hexworth_progress');location.reload();});
 await wait(700); await pg.evaluate(()=>closeModal('mBrief')); await wait(200);
 const revoke = await pg.evaluate(()=>{
   openNew();const n=document.getElementById('nvName');n.value='Win11-Lab';
   n.dispatchEvent(new Event('input'));document.getElementById('nvRam').value=8192;onRam();createVM();
   const w=LAB.vms[0];selectVM(w.id);
   openSettings();attachIso('win11_23h2.iso');setNet('internal');closeModal('mSet');
   startVM();takeSnapshot();
   focusTask('t3');document.getElementById('ans').value=String(HOST.ram-HOST.reservedRam);submitAnswer();
   const before = stageComplete(1);
   const v = LAB.vms.find(x => x.stage === 1);
   selectVM(v.id); openSettings(); setNet('nat'); closeModal('mSet');   /* un-isolate it */
   const after = stageComplete(1);
   selectVM(v.id); openSettings(); setNet('internal'); closeModal('mSet');  /* put it back */
   const restored = stageComplete(1);
   return { before, after, restored };
 });
 ck('stage 1 was complete', revoke.before===true);
 ck('breaking the isolation REVOKES completion', revoke.after===false);
 ck('fixing it restores completion', revoke.restored===true);

 ck('no JS errors', errs.length===0, errs.slice(0,2).join('; '));
 console.log(`\n${P} passed, ${F} failed`);
 await b.close(); srv.close(); process.exitCode=F?1:0;
})();
