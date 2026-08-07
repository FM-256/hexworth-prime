#!/usr/bin/env node
/**
 * @catalog what    A+ ch25 lab stage 2: VMware chrome and transfer tasks
 * @catalog run     node _tools/lab-tests/lab-s2.js
 * @catalog status  GATE
 *
 * Moved out of a session scratchpad on 2026-08-07. These suites caught the defects
 * that ten review rounds were spent on, and they existed only for the length of one
 * session. Run them before touching the labs they cover, and via run-all.js in the
 * deploy chain.
 */
const REPO = require('path').resolve(__dirname, '..', '..');
/* Stage 2 must be a real second stage: gated on stage 1, VMware chrome and vocabulary,
   and tasks that test TRANSFER rather than repeating stage 1 with new colours. */
const http=require('http'),fs=require('fs'),path=require('path');
const puppeteer=require(require('path').join(REPO,'node_modules','puppeteer'));
const ROOT=require('path').join(REPO,'_app');
const MIME={'.html':'text/html','.js':'text/javascript','.webp':'image/webp'};
const srv=http.createServer((q,r)=>{let p=decodeURIComponent(q.url.split('?')[0]);
 fs.readFile(path.join(ROOT,p),(e,b)=>{if(e){r.writeHead(404);return r.end();}
 r.writeHead(200,{'Content-Type':MIME[path.extname(p)]||'application/octet-stream'});r.end(b);});});
let P=0,F=0;const ck=(l,ok,d)=>{ok?P++:F++;console.log(`  ${ok?'PASS':'FAIL'}  ${l}${d?'  -> '+d:''}`);};
const U='/houses/forge/applets/comptia-aplus/core-2/labs/forge-virtualization.lab.html';
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
 await new Promise(r=>setTimeout(r,300));

 ck('starts on Stage 1 with VirtualBox chrome',
    await pg.evaluate(()=>LAB.stage===1 && /VirtualBox/.test(document.getElementById('productName').textContent)));
 // GATE: cannot jump to stage 2
 await pg.evaluate(()=>goToStage(2));
 ck('goToStage(2) is a NO-OP until stage 1 is complete', await pg.evaluate(()=>LAB.stage)===1);
 await pg.evaluate(()=>finishStage());
 ck('finishStage() with tasks outstanding does not advance', await pg.evaluate(()=>LAB.stage)===1);

 // complete stage 1 legitimately
 await pg.evaluate(()=>{
   openNew();const n=document.getElementById('nvName');n.value='Win11-Lab';n.dispatchEvent(new Event('input'));
   document.getElementById('nvRam').value=8192;onRam();createVM();
   openSettings();attachIso('win11_23h2.iso');setNet('internal');closeModal('mSet');startVM();takeSnapshot();
   focusTask('t3');document.getElementById('ans').value=String(HOST.ram-HOST.reservedRam);submitAnswer();});
 await new Promise(r=>setTimeout(r,200));
 ck('stage 1 completes legitimately', await pg.evaluate(()=>stageComplete(1)));

 await pg.evaluate(()=>finishStage());
 await new Promise(r=>setTimeout(r,250));
 ck('finishing stage 1 advances to stage 2', await pg.evaluate(()=>LAB.stage)===2);
 ck('chrome switched to VMware',
    await pg.evaluate(()=>document.getElementById('productName').textContent), 'VMware Workstation Pro');
 ck('stage pill updated',
    /VMware/.test(await pg.evaluate(()=>document.getElementById('stagePill').textContent)));
 ck('the VirtualBox machine is NOT in the VMware library',
    await pg.evaluate(()=>document.getElementById('vmlist').innerText.includes('Win11-Lab'))===false);
 ck('stage 2 tasks are its own set',
    await pg.evaluate(()=>TASKS.every(t=>t.id.startsWith('s2t'))));

 // build the VMware machine
 await pg.evaluate(()=>{openNew();const n=document.getElementById('nvName');n.value='Win11-VMware';
   n.dispatchEvent(new Event('input'));document.getElementById('nvRam').value=8192;onRam();createVM();});
 ck('creating the VMware machine credits its first task', await pg.evaluate(()=>LAB.tasksDone.s2t1===true));
 ck('details show the VMware disk format',
    /\.vmdk/.test(await pg.evaluate(()=>document.getElementById('details').innerText)));
 ck('details name VMware Tools, not Guest Additions',
    await pg.evaluate(()=>{const t=document.getElementById('details').innerText;
      return t.includes('VMware Tools') && !t.includes('Guest Additions');}));

 // network vocabulary must be VMware's, and Internal Network must NOT be offered
 await pg.evaluate(()=>{openSettings();setTab('network');});
 await new Promise(r=>setTimeout(r,200));
 const diag=await pg.evaluate(()=>({stage:LAB.stage, sel:LAB.selected,
   modalOpen:document.getElementById('mSet').classList.contains('open'),
   seg:document.getElementById('netSeg').innerHTML.length,
   txt:document.getElementById('netSeg').textContent}));
 console.log('     [diag]', JSON.stringify(diag).slice(0,160));
 const nets=diag.txt;
 ck('VMware offers LAN Segment', /LAN Segment/.test(nets), nets.replace(/\n/g,' | ').slice(0,90));
 ck('...and does NOT offer "Internal Network"', !/Internal Network/.test(nets));

 // the free-text transfer task
 await pg.evaluate(()=>{focusTask('s2t3');document.getElementById('ans').value='.vdi';submitAnswer();});
 ck('.vdi is rejected in the VMware stage', await pg.evaluate(()=>!LAB.tasksDone.s2t3));
 await pg.evaluate(()=>{document.getElementById('ans').value='.vmdk';submitAnswer();});
 ck('.vmdk is accepted', await pg.evaluate(()=>LAB.tasksDone.s2t3===true));

 // isolation: the VirtualBox answer must not work here
 await pg.evaluate(()=>{setNet('nat');});
 ck('NAT does not satisfy isolation', await pg.evaluate(()=>!LAB.tasksDone.s2t6));
 await pg.evaluate(()=>{setNet('lanseg');});
 ck('LAN Segment satisfies isolation', await pg.evaluate(()=>LAB.tasksDone.s2t6===true));

 // tools must be installed in a RUNNING guest
 await pg.evaluate(()=>{closeModal('mSet');installTools();});
 ck('Install Tools is a no-op while powered off', await pg.evaluate(()=>!LAB.tasksDone.s2t5));
 await pg.evaluate(()=>{openSettings();attachIso('win11_23h2.iso');closeModal('mSet');startVM();installTools();takeSnapshot();});
 ck('installing tools in a running guest credits the task', await pg.evaluate(()=>LAB.tasksDone.s2t5===true));
 ck('all 7 stage-2 tasks complete', await pg.evaluate(()=>stageComplete(2)));

 // stage 1 work survived
 ck('stage 1 remains complete', await pg.evaluate(()=>stageComplete(1)));
 // per-stage reset
 await pg.evaluate(()=>resetLab());
 ck('reset clears THIS stage only', await pg.evaluate(()=>stageComplete(1)&&!stageComplete(2)));
 // ---- chrome consistency: the VMware stage must not wear VirtualBox's clothes ----
 await pg.evaluate(()=>{localStorage.removeItem('hexworth_progress');location.reload();});
 await new Promise(r=>setTimeout(r,700));
 await pg.evaluate(()=>{
   openNew();const n=document.getElementById('nvName');n.value='Win11-Lab';n.dispatchEvent(new Event('input'));
   document.getElementById('nvRam').value=8192;onRam();createVM();
   openSettings();attachIso('win11_23h2.iso');setNet('internal');closeModal('mSet');startVM();takeSnapshot();
   focusTask('t3');document.getElementById('ans').value=String(HOST.ram-HOST.reservedRam);submitAnswer();});
 await new Promise(r=>setTimeout(r,300));
 await pg.evaluate(()=>finishStage());
 await new Promise(r=>setTimeout(r,300));
 await pg.evaluate(()=>{
   openNew();const m=document.getElementById('nvName');m.value='VM-Two';m.dispatchEvent(new Event('input'));
   document.getElementById('nvRam').value=8192;onRam();createVM();
   openSettings();setNet('lanseg');closeModal('mSet');startVM();});
 await new Promise(r=>setTimeout(r,400));
 const chrome=await pg.evaluate(()=>({
   stage:LAB.stage,
   rail:document.getElementById('railTitle').textContent,
   details:document.getElementById('details').innerText,
   screen:(document.getElementById('screen')||{innerText:''}).innerText,
   product:document.getElementById('productName').textContent }));
 ck('setup actually reached stage 2', chrome.stage===2, 'stage '+chrome.stage);
 ck('the task rail says Stage 2', /Stage 2/.test(chrome.rail), chrome.rail);
 ck('LAN Segment renders a label, not "undefined"',
    /LAN Segment/.test(chrome.details) && !/undefined/.test(chrome.details),
    chrome.details.replace(/\n/g,' | ').slice(0,120));
 ck('the VM screen does not say VirtualBox in the VMware stage',
    !/VirtualBox/.test(chrome.screen), chrome.screen.slice(0,90));
 ck('window chrome names VMware', /VMware/.test(chrome.product), chrome.product);
 ck('no JS errors', errs.length===0, errs.slice(0,2).join('; '));
 console.log(`\n${P} passed, ${F} failed`);
 await b.close(); srv.close(); process.exit(F?1:0);
})();
