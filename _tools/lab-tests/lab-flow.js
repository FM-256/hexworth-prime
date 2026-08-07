#!/usr/bin/env node
/**
 * @catalog what    A+ ch25 lab task rail: auto-advance, flash, scroll into view
 * @catalog run     node _tools/lab-tests/lab-flow.js
 * @catalog status  GATE
 *
 * Moved out of a session scratchpad on 2026-08-07. These suites caught the defects
 * that ten review rounds were spent on, and they existed only for the length of one
 * session. Run them before touching the labs they cover, and via run-all.js in the
 * deploy chain.
 */
const REPO = require('path').resolve(__dirname, '..', '..');
/* The rail must drive itself: complete a task and the next one opens, with no clicking. */
const http=require('http'),fs=require('fs'),path=require('path');
const puppeteer=require(require('path').join(REPO,'node_modules','puppeteer'));
const ROOT=require('path').join(REPO,'_app');
const srv=http.createServer((q,r)=>{let p=decodeURIComponent(q.url.split('?')[0]);
 fs.readFile(path.join(ROOT,p),(e,b)=>{if(e){r.writeHead(404);return r.end();}
 r.writeHead(200,{'Content-Type':p.endsWith('.js')?'text/javascript':'text/html'});r.end(b);});});
let P=0,F=0;const ck=(l,ok,d)=>{ok?P++:F++;console.log(`  ${ok?'PASS':'FAIL'}  ${l}${d?'  -> '+d:''}`);};
const U='/houses/forge/applets/comptia-aplus/core-2/labs/forge-virtualization.lab.html';
const wait=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
 await new Promise(r=>srv.listen(0,'127.0.0.1',r));
 const b=await puppeteer.launch({headless:'new',args:['--no-sandbox','--disable-setuid-sandbox']});
 const pg=await b.newPage(); await pg.setViewport({width:1366,height:768});
 await pg.setRequestInterception(true);
 pg.on('request',r=>r.url().includes('AccessGuard.js')?r.abort():r.continue());
 const errs=[]; pg.on('pageerror',e=>{if(!/AccessGuard/.test(e.message))errs.push(e.message);});
 await pg.goto(`http://127.0.0.1:${srv.address().port}`+U,{waitUntil:'networkidle2'});
 await pg.evaluate(()=>closeModal('mBrief')); await wait(300);
 const open=()=>pg.evaluate(()=>document.querySelector('.open .t').textContent.replace(/^✓\s*/,''));

 console.log('\nTHE RAIL DRIVES ITSELF (no clicking between tasks)');
 ck('opens on task 1', /Create a virtual machine/.test(await open()), await open());
 await pg.evaluate(()=>{openNew();const n=document.getElementById('nvName');n.value='Win11-Lab';
   n.dispatchEvent(new Event('input'));document.getElementById('nvRam').value=8192;onRam();createVM();});
 await wait(200);
 /* 8192 satisfies t1 AND t2 in one action, so the correct landing spot is the first
    UNFINISHED task, not literally task 2. Assert the property, not a hardcoded title. */
 ck('creating the VM advances to the first unfinished task by itself',
    await pg.evaluate(()=>{
      const shown=document.querySelector('.open .t').textContent.replace(/^\u2713\s*/,'');
      const t=TASKS.find(x=>x.title===shown);
      const firstUndone=TASKS.find(x=>!LAB.tasksDone[x.id]);
      return !!t && !!firstUndone && t.id===firstUndone.id;
    }), await open());
 ck('task 1 is ticked', await pg.evaluate(()=>LAB.tasksDone.t1)===true);
 /* t2 is satisfied by the same 8192 already set, so the rail should already be past it */
 ck('a task satisfied in passing does not strand the student',
    await pg.evaluate(()=>LAB.tasksDone.t2)===true);
 await pg.evaluate(()=>{openSettings();attachIso('win11_23h2.iso');closeModal('mSet');}); await wait(200);
 ck('attaching the ISO ticks task 4 without a click', await pg.evaluate(()=>LAB.tasksDone.t4)===true);
 await pg.evaluate(()=>startVM()); await wait(200);
 ck('booting ticks task 5 and moves on', await pg.evaluate(()=>LAB.tasksDone.t5)===true);
 const after=await open();
 ck('the open card is now an UNFINISHED task', await pg.evaluate(()=>{
    const t=TASKS.find(x=>x.title===document.querySelector('.open .t').textContent.replace(/^✓\s*/,''));
    return t ? !LAB.tasksDone[t.id] : false; }), after);

 console.log('\nMANUAL FOCUS IS RESPECTED');
 await pg.evaluate(()=>focusTask('t3')); await wait(150);
 ck('opening a specific task keeps it open', /Read the safe maximum/.test(await open()), await open());
 await pg.evaluate(()=>{openSettings();setNet('internal');closeModal('mSet');}); await wait(200);
 ck('completing a DIFFERENT task does not yank the student away',
    /Read the safe maximum/.test(await open()), await open());
 ck('and that other task still ticked', await pg.evaluate(()=>LAB.tasksDone.t6)===true);

 console.log('\nNANCY: free-text answers must flash too');
 await pg.evaluate(()=>{localStorage.removeItem('hexworth_progress');location.reload();});
 await wait(700); await pg.evaluate(()=>closeModal('mBrief')); await wait(200);
 const fl = await pg.evaluate(()=>{
   const seen={};
   const origRender = window.renderTasks;
   window.renderTasks = function(){ origRender.apply(this,arguments);
     document.querySelectorAll('.step.flash').forEach(e=>{ seen[e.dataset.step]=true; }); };
   openNew();const n=document.getElementById('nvName');n.value='Win11-Lab';
   n.dispatchEvent(new Event('input'));document.getElementById('nvRam').value=8192;onRam();createVM();
   const stateFlash = Object.keys(seen).slice();
   focusTask('t3');document.getElementById('ans').value=String(HOST.ram-HOST.reservedRam);submitAnswer();
   const answerFlash = seen['t3']===true;
   window.renderTasks = origRender;
   return { stateFlash, answerFlash, multi: stateFlash.length };
 });
 ck('a state-derived task flashes', fl.stateFlash.length>0, fl.stateFlash.join(','));
 ck('a FREE-TEXT answer flashes too', fl.answerFlash===true);
 ck('one action satisfying two tasks flashes BOTH', fl.multi>=2, fl.multi+' flashed');

 console.log('\nNANCY: re-reading a finished task must not be yanked away');
 const yank = await pg.evaluate(()=>{
   const shown=()=>document.querySelector('.open .t').textContent.replace(/^\u2713\s*/,'');
   focusTask('t1');                       /* t1 is finished; student re-reads it */
   const opened = shown();
   openSettings(); setNet('internal'); closeModal('mSet');   /* unrelated action ticks t6 */
   return { opened, after: shown(), t6: LAB.tasksDone.t6 };
 });
 ck('clicking a FINISHED step actually opens it', /Create a virtual machine/.test(yank.opened), yank.opened);
 ck('an unrelated completion does NOT yank the card away', yank.opened===yank.after, yank.after);
 ck('and the unrelated task still ticked', yank.t6===true);

 console.log('\nVISIBILITY');
 const vis=await pg.evaluate(()=>{
   const cur=document.querySelector('.step.cur'); const r=cur.getBoundingClientRect();
   const panel=document.querySelector('.tasks').getBoundingClientRect();
   return { inView: r.top>=panel.top-1 && r.bottom<=panel.bottom+1,
            scroll: document.documentElement.scrollHeight-window.innerHeight };});
 ck('the current step is inside the visible rail', vis.inView===true);
 ck('page still does not scroll', vis.scroll<=0, vis.scroll+'px');
 ck('no JS errors', errs.length===0, errs.slice(0,2).join(' | '));
 console.log(`\n${P} passed, ${F} failed`);
 await b.close(); srv.close(); process.exitCode=F?1:0;
})();
