#!/usr/bin/env node
/**
 * @catalog what    A+ ch25 lab stage 3: Type 1 host, capacity, isolation, removal
 * @catalog run     node _tools/lab-tests/lab-s3.js
 * @catalog status  GATE
 *
 * Moved out of a session scratchpad on 2026-08-07. These suites caught the defects
 * that ten review rounds were spent on, and they existed only for the length of one
 * session. Run them before touching the labs they cover, and via run-all.js in the
 * deploy chain.
 */
const REPO = require('path').resolve(__dirname, '..', '..');
/* Stage 3 must teach what stages 1 and 2 cannot: the HOST is the subject, capacity is
   physical and hard-enforced, and no task can be satisfied by pressing a button. */
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

/* injected page helpers -- every one drives the real UI handlers, never the model directly */
const HELPERS=`
 window.mk=(name,ram)=>{openNew();const n=document.getElementById('nvName');n.value=name;
   n.dispatchEvent(new Event('input'));document.getElementById('nvRam').value=ram;onRam();createVM();};
 window.s3=()=>LAB.vms.filter(v=>v.stage===3);
 window.setRam=(id,mb)=>{selectVM(id);openSettings();const s=document.getElementById('stRam');
   s.value=mb;onStRam();closeModal('mSet');};
 window.setCpu=(id,n)=>{selectVM(id);openSettings();const s=document.getElementById('stCpu');
   s.value=n;onStCpu();closeModal('mSet');};
 window.answer=(id,txt)=>{focusTask(id);document.getElementById('ans').value=txt;submitAnswer();};
 window.doStage1=()=>{mk('Win11-Lab',8192);openSettings();attachIso('win11_23h2.iso');
   setNet('internal');closeModal('mSet');startVM();takeSnapshot();
   answer('t3',String(HOST.ram-HOST.reservedRam));};
 window.doStage2=()=>{mk('Win11-Again',8192);openSettings();attachIso('win11_23h2.iso');
   setNet('lanseg');closeModal('mSet');startVM();installTools();takeSnapshot();
   answer('s2t3','.vmdk');};
`;

(async()=>{
 await new Promise(r=>srv.listen(0,'127.0.0.1',r));
 const base=`http://127.0.0.1:${srv.address().port}`;
 const b=await puppeteer.launch({headless:'new',args:['--no-sandbox','--disable-setuid-sandbox']});
 const pg=await b.newPage(); await pg.setViewport({width:1366,height:768});
 await pg.setRequestInterception(true);
 pg.on('request',r=>r.url().includes('AccessGuard.js')?r.abort():r.continue());
 const errs=[]; pg.on('pageerror',e=>{if(!/AccessGuard is not defined/.test(e.message))errs.push(e.message);});
 await pg.goto(base+U,{waitUntil:'networkidle2'});
 await pg.evaluate(()=>closeModal('mBrief'));
 await pg.evaluate(()=>{localStorage.removeItem('hexworth_progress');resetLab();});
 await pg.evaluate(HELPERS); await wait(250);

 console.log('\nGATES');
 await pg.evaluate(()=>goToStage(3));
 ck('goToStage(3) is a NO-OP from stage 1', await pg.evaluate(()=>LAB.stage)===1);
 await pg.evaluate(()=>doStage1()); await wait(200);
 await pg.evaluate(()=>finishStage()); await wait(200);
 ck('stage 1 completed and advanced', await pg.evaluate(()=>LAB.stage)===2);
 await pg.evaluate(()=>goToStage(3));
 ck('goToStage(3) is a NO-OP with stage 2 outstanding', await pg.evaluate(()=>LAB.stage)===2);
 await pg.evaluate(()=>doStage2()); await wait(200);
 ck('stage 2 completed legitimately', await pg.evaluate(()=>stageComplete(2)));
 await pg.evaluate(()=>finishStage()); await wait(300);
 ck('finishing stage 2 advances to stage 3', await pg.evaluate(()=>LAB.stage)===3);
 await pg.evaluate(HELPERS);

 console.log('\nCHROME — this is a bare-metal host, not a third desktop app');
 const ch=await pg.evaluate(()=>({product:document.getElementById('productName').textContent,
   strip:document.getElementById('hostStrip').innerText,
   stripHidden:document.getElementById('hostStrip').hidden,
   rail:document.getElementById('railTitle').textContent,
   pill:document.getElementById('stagePill').textContent,
   page:document.body.innerText}));
 ck('window names ESXi', /ESXi/.test(ch.product), ch.product);
 ck('the host summary strip is showing', ch.stripHidden===false);
 ck('rail says Stage 3', /Stage 3/.test(ch.rail), ch.rail);
 ck('pill says Stage 3 of 3', /Stage 3 of 3/.test(ch.pill), ch.pill);
 ck('stage 3 chrome does not say VirtualBox or Workstation',
    !/VirtualBox|Workstation/.test(ch.product+ch.strip));
 ck('nothing renders "undefined"', !/undefined/.test(ch.page),
    (ch.page.match(/.{0,25}undefined.{0,25}/)||[''])[0]);
 ck('the strip shows the two INPUTS, not the answer',
    /16384/.test(ch.strip) && /768/.test(ch.strip) && !/15616/.test(ch.strip), ch.strip.replace(/\n/g,' | '));

 console.log('\nTASK 2 — the subtraction, computed from HOST and never in the DOM');
 await pg.evaluate(()=>answer('s3t2','12288')); await wait(120);
 ck('stage 1\'s answer is REJECTED here (different host model)',
    await pg.evaluate(()=>LAB.tasksDone.s3t2)!==true);
 await pg.evaluate(()=>answer('s3t2','16384')); await wait(120);
 ck('physical total alone is rejected', await pg.evaluate(()=>LAB.tasksDone.s3t2)!==true);
 await pg.evaluate(()=>answer('s3t2','15616')); await wait(120);
 ck('16384 - 768 is accepted', await pg.evaluate(()=>LAB.tasksDone.s3t2)===true);

 console.log('\nCONSOLIDATION');
 await pg.evaluate(()=>{mk('web01',4096);mk('db01',6144);mk('file01',2048);}); await wait(150);
 ck('three guests built but not yet running -> task 3 NOT credited',
    await pg.evaluate(()=>LAB.tasksDone.s3t3)!==true);
 await pg.evaluate(()=>s3().forEach(v=>{selectVM(v.id);startVM();})); await wait(200);
 const run3=await pg.evaluate(()=>({n:s3().filter(v=>v.running).length,ram:runningRam(),
   t3:LAB.tasksDone.s3t3}));
 ck('three guests run at once on one box', run3.t3===true, `${run3.n} running, ${run3.ram} MB`);

 console.log('\nTHE CEILING — the host must refuse, not warn');
 await pg.evaluate(()=>mk('app01',6144)); await wait(120);
 const before=await pg.evaluate(()=>({ram:runningRam(),refused:LAB.hostRefused}));
 ck('nothing refused yet', before.refused===false);
 await pg.evaluate(()=>{const v=s3().find(x=>x.name==='app01');selectVM(v.id);startVM();}); await wait(200);
 const after=await pg.evaluate(()=>{const v=s3().find(x=>x.name==='app01');
   return {running:v.running,ram:runningRam(),refused:LAB.hostRefused,
     screen:document.getElementById('screen').innerText,t4:LAB.tasksDone.s3t4,t5:LAB.tasksDone.s3t5};});
 ck('the guest did NOT power on', after.running===false);
 ck('allocated memory is unchanged by the refused start', after.ram===before.ram,
    `${before.ram} -> ${after.ram}`);
 ck('the host explains itself on screen', /Insufficient memory/.test(after.screen),
    after.screen.split('\n')[0]);
 ck('task 4 credited by hitting the real limit', after.t4===true);
 ck('task 5 NOT credited -- four are not running', after.t5!==true);

 console.log('\nRIGHT-SIZING (the pool is physical; you cannot buy RAM)');
 await pg.evaluate(()=>{const v=s3().find(x=>x.name==='app01');setRam(v.id,3328);
   selectVM(v.id);startVM();}); await wait(200);
 const fit=await pg.evaluate(()=>({n:s3().filter(v=>v.running).length,ram:runningRam(),
   pool:guestPool(),t5:LAB.tasksDone.s3t5,t6:LAB.tasksDone.s3t6}));
 ck('all four run inside the pool', fit.t5===true, `${fit.n} running, ${fit.ram}/${fit.pool} MB`);
 ck('task 6 not yet -- vCPUs still under the core count', fit.t6!==true);

 console.log('\nCPU IS SHARED, MEMORY IS NOT');
 await pg.evaluate(()=>{const v=s3();setCpu(v[0].id,3);setCpu(v[1].id,3);setCpu(v[2].id,3);}); await wait(200);
 const cpu=await pg.evaluate(()=>({cpus:runningCpus(),cores:HOST.cores,n:s3().filter(v=>v.running).length,
   t6:LAB.tasksDone.s3t6}));
 ck('the host ALLOWS more vCPUs than cores', cpu.n===4 && cpu.cpus>cpu.cores,
    `${cpu.cpus} vCPUs on ${cpu.cores} cores, ${cpu.n} running`);
 ck('task 6 credited', cpu.t6===true);

 console.log('\nISOLATION ON THE VIRTUAL SWITCH');
 const iso0=await pg.evaluate(()=>LAB.tasksDone.s3t7);
 ck('task 7 NOT credited before db01 is isolated', iso0!==true);
 await pg.evaluate(()=>{const db=s3().find(v=>/db/i.test(v.name));
   selectVM(db.id);openSettings();setNet('isolated');closeModal('mSet');}); await wait(200);
 const iso=await pg.evaluate(()=>({t7:LAB.tasksDone.s3t7,
   net:s3().find(v=>/db/i.test(v.name)).net}));
 ck('attaching db01 to the no-uplink port group credits it', iso.t7===true, 'net='+iso.net);
 await pg.evaluate(()=>{const db=s3().find(v=>/db/i.test(v.name));
   selectVM(db.id);openSettings();setNet('vmnet');closeModal('mSet');}); await wait(150);
 ck('moving it back to an uplinked port group REVOKES it',
    await pg.evaluate(()=>LAB.tasksDone.s3t7)!==true);
 await pg.evaluate(()=>{const db=s3().find(v=>/db/i.test(v.name));
   selectVM(db.id);openSettings();setNet('isolated');closeModal('mSet');}); await wait(150);

 console.log('\nDECOY ATTACK + THE RENAME TRAP (Chris, 2026-08-07)');
 const dbOf=(f)=>f;   /* readability only */
 await pg.evaluate(()=>{const db=s3().find(v=>/db01/i.test(v.name));
   selectVM(db.id);openSettings();setNet('vmnet');closeModal('mSet');}); await wait(150);
 ck('credit revoked once the real db01 is exposed again',
    await pg.evaluate(()=>LAB.tasksDone.s3t7)!==true);
 await pg.evaluate(()=>{mk('db-decoy',512);
   const d=s3().find(v=>v.name==='db-decoy');selectVM(d.id);openSettings();setNet('isolated');closeModal('mSet');});
 await wait(200);
 const decoy=await pg.evaluate(()=>({t7:LAB.tasksDone.s3t7,
   real:s3().find(v=>/db01/i.test(v.name)).net, decoy:s3().find(v=>v.name==='db-decoy').net}));
 ck('an isolated DECOY does not credit the task while db01 is exposed',
    decoy.t7!==true, `db01=${decoy.real} decoy=${decoy.decoy}`);
 await pg.evaluate(()=>{const db=s3().find(v=>/db01/i.test(v.name));
   selectVM(db.id);openSettings();setNet('isolated');closeModal('mSet');}); await wait(200);
 ck('isolating the REAL db01 as well credits it',
    await pg.evaluate(()=>LAB.tasksDone.s3t7)===true);

 /* CHRIS REPRO 4: an honest student mis-names a scratch machine, renames it away with the
    General tab, then builds and isolates the real database guest. The pinned-id design
    locked this student out permanently. State-derived must self-heal. */
 await pg.evaluate(()=>{const d=s3().find(v=>v.name==='db-decoy');
   selectVM(d.id);openSettings();
   const f=document.getElementById('stName');f.value='file-scratch';renameVM();
   setNet('vmnet');closeModal('mSet');}); await wait(200);
 const healed=await pg.evaluate(()=>({t7:LAB.tasksDone.s3t7,
   names:s3().map(v=>v.name+':'+v.net).join(' ')}));
 ck('renaming a machine OFF /db/i stops it being graded, credit survives',
    healed.t7===true, healed.names);
 ck('and no machine is stranded: renaming back ON /db/i re-grades it',
    await pg.evaluate(async()=>{const d=s3().find(v=>v.name==='file-scratch');
      selectVM(d.id);openSettings();
      const f=document.getElementById('stName');f.value='db-again';renameVM();closeModal('mSet');
      evaluate(); return LAB.tasksDone.s3t7===false;}));
 await pg.evaluate(()=>{const d=s3().find(v=>v.name==='db-again');
   selectVM(d.id);openSettings();setNet('isolated');closeModal('mSet');}); await wait(200);
 ck('isolating it restores credit, no reset needed',
    await pg.evaluate(()=>LAB.tasksDone.s3t7)===true);
 ck('a student with NO database guest is not credited by an empty match set',
    await pg.evaluate(()=>{
      const saved=s3().filter(v=>/db/i.test(v.name)).map(v=>[v.id,v.name]);
      saved.forEach(([id])=>{const v=LAB.vms.find(x=>x.id===id);v.name='renamed-'+id;});
      evaluate(); const none=LAB.tasksDone.s3t7!==true;
      saved.forEach(([id,n])=>{LAB.vms.find(x=>x.id===id).name=n;}); evaluate();
      return none; }));

 console.log('\nTHE TERM');
 await pg.evaluate(()=>answer('s3t8','type 2')); await wait(120);
 ck('"type 2" is rejected', await pg.evaluate(()=>LAB.tasksDone.s3t8)!==true);
 await pg.evaluate(()=>answer('s3t8','hypervisor')); await wait(120);
 ck('the bare word "hypervisor" is rejected', await pg.evaluate(()=>LAB.tasksDone.s3t8)!==true);
 await pg.evaluate(()=>answer('s3t8','Bare Metal')); await wait(120);
 ck('"Bare Metal" is accepted', await pg.evaluate(()=>LAB.tasksDone.s3t8)===true);

 console.log('\nCOMPLETION + ADVERSARIAL');
 const done=await pg.evaluate(()=>({all:stageComplete(3),btn:document.getElementById('finishBtn').disabled}));
 ck('stage 3 complete on merit', done.all===true);
 ck('the finish button is now enabled', done.btn===false);
 /* revocation: break the machine and the earned tick must go out again */
 await pg.evaluate(()=>{const v=s3().find(x=>x.name==='app01');selectVM(v.id);stopVM();evaluate();});
 await wait(150);
 ck('powering a guest off REVOKES the four-at-once tick',
    await pg.evaluate(()=>LAB.tasksDone.s3t5)!==true);
 await pg.evaluate(()=>{const v=s3().find(x=>x.name==='app01');selectVM(v.id);startVM();evaluate();});
 await wait(150);
 ck('and starting it again restores it', await pg.evaluate(()=>LAB.tasksDone.s3t5)===true);
 /* forgery: hand-edit localStorage to claim every state tick, reload, they must be recomputed */
 await pg.evaluate(()=>{const p=JSON.parse(localStorage.getItem('hexworth_progress'));
   const st=p.forge['core2-ch25-lab'];
   st.vms=st.vms.filter(v=>v.stage!==3);        /* delete the guests, keep the ticks */
   ['s3t1','s3t3','s3t4','s3t5','s3t6'].forEach(k=>st.tasks[k]=true);
   localStorage.setItem('hexworth_progress',JSON.stringify(p));});
 await pg.reload({waitUntil:'networkidle2'}); await wait(400);
 const forged=await pg.evaluate(()=>({stage:LAB.stage,d:LAB.tasksDone,vms:LAB.vms.filter(v=>v.stage===3).length}));
 ck('forged localStorage does not grant ANY state-derived tick',
    ['s3t1','s3t3','s3t4','s3t5','s3t6'].every(k=>forged.d[k]!==true), JSON.stringify(forged.d));
 ck('stage 3 survives a reload', forged.stage===3);
 ck('the refusal tick is session-scoped, not stored', forged.d.s3t4!==true);
 ck('free-text ticks survive the reload', forged.d.s3t2===true && forged.d.s3t8===true);

 console.log('\nREMOVING MACHINES MUST REVOKE STAGE-3 CREDIT (Chris coverage, folded in)');
 /* These were only ever proven by a reviewer's own scripts. They belong in the suite. */
 await pg.evaluate(()=>{localStorage.removeItem('hexworth_progress');location.reload();});
 await wait(700); await pg.evaluate(()=>closeModal('mBrief')); await wait(200);
 await pg.evaluate(HELPERS);
 await pg.evaluate(()=>{doStage1();}); await wait(250);
 await pg.evaluate(()=>finishStage()); await wait(250); await pg.evaluate(HELPERS);
 await pg.evaluate(()=>{doStage2();}); await wait(250);
 await pg.evaluate(()=>finishStage()); await wait(300); await pg.evaluate(HELPERS);
 await pg.evaluate(()=>{
   mk('web01',4096);mk('db01',6144);mk('file01',2048);
   s3().forEach(v=>{selectVM(v.id);startVM();});
   mk('app01',6144);const a=s3().find(x=>x.name==='app01');selectVM(a.id);startVM();
   setRam(a.id,3328);selectVM(a.id);startVM();
   const v3=s3();[0,1,2].forEach(i=>setCpu(v3[i].id,3));
   const db=s3().find(x=>/db01/i.test(x.name));
   selectVM(db.id);openSettings();setNet('isolated');closeModal('mSet');
   answer('s3t2',String(HOST.ram-HOST.hvOverhead));answer('s3t8','bare metal');});
 await wait(300);
 ck('stage 3 is complete before any removal', await pg.evaluate(()=>stageComplete(3))===true);
 await pg.evaluate(()=>{const f=s3().find(v=>v.name==='file01');selectVM(f.id);removeVM();});
 await wait(200);
 const rm=await pg.evaluate(()=>({t3:LAB.tasksDone.s3t3,t5:LAB.tasksDone.s3t5,t6:LAB.tasksDone.s3t6,
   done:stageComplete(3)}));
 /* s3t3 asks for THREE running guests over 12288 MB; removing file01 (2048) still leaves
    web01 + db01 + app01 running at 13568, so it legitimately SURVIVES. The tasks that need
    all four (s3t5, s3t6) are the ones that must revoke. Assert what each task actually
    claims, not "everything goes red". */
 ck('the four-guest tasks revoke when a guest is removed',
    rm.t5!==true && rm.t6!==true, JSON.stringify(rm));
 ck('but the three-guest task correctly survives, since three still run over the bar',
    rm.t3===true);
 ck('and the stage is no longer complete', rm.done===false);
 await pg.evaluate(()=>{const d=s3().find(v=>/db01/i.test(v.name));selectVM(d.id);removeVM();});
 await wait(200);
 ck('removing db01 revokes the isolation task',
    await pg.evaluate(()=>LAB.tasksDone.s3t7)!==true);
 const empty=await pg.evaluate(()=>{
   while (s3().length) { selectVM(s3()[0].id); removeVM(); }
   return { n:s3().length, lab:LAB.labVmId[3], refused:LAB.hostRefused,
            t4:LAB.tasksDone.s3t4, sel:LAB.selected,
            pane:document.getElementById('details').innerText.slice(0,40) };});
 ck('emptying the stage leaves no graded machine', empty.n===0 && empty.lab===null);
 ck('and clears hostRefused, matching resetLab',
    empty.refused===false && empty.t4!==true, 'refused='+empty.refused);
 ck('no dangling selection, and the pane shows the placeholder',
    empty.sel===null && /Select a virtual machine/.test(empty.pane), empty.pane);

 console.log('\nLAYOUT at 1366x768 (host strip adds a row)');
 const lay=await pg.evaluate(()=>{
   const sc=[...document.querySelectorAll('*')].filter(e=>e.scrollHeight>e.clientHeight+2&&
     ['auto','scroll'].includes(getComputedStyle(e).overflowY)).map(e=>e.className||e.tagName);
   return {scrollers:sc,page:document.documentElement.scrollHeight-window.innerHeight,
     btn:document.getElementById('finishBtn').getBoundingClientRect().bottom};});
 ck('nothing on the page scrolls', lay.scrollers.length===0, lay.scrollers.join(', '));
 ck('no leftover page scroll', lay.page<=0, lay.page+'px');
 ck('the finish button is on screen', lay.btn<=768, Math.round(lay.btn)+'px');

 ck('no JS errors', errs.length===0, errs.slice(0,2).join('; '));
 console.log(`\n${P} passed, ${F} failed`);
 await b.close(); srv.close(); process.exitCode=F?1:0;
})();
