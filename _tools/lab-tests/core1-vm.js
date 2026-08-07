#!/usr/bin/env node
/**
 * @catalog what    A+ Core 1 VM lab: gates 3 and 4 must not rubber-stamp (#294)
 * @catalog run     node _tools/lab-tests/core1-vm.js
 * @catalog status  GATE
 *
 * Moved out of a session scratchpad on 2026-08-07. These suites caught the defects
 * that ten review rounds were spent on, and they existed only for the length of one
 * session. Run them before touching the labs they cover, and via run-all.js in the
 * deploy chain.
 */
const REPO = require('path').resolve(__dirname, '..', '..');
/* Taskboard #294: two of five gates were `return true`. They must now require a real
   decision, and the loaded slider positions must NOT satisfy them. */
const http=require('http'),fs=require('fs'),path=require('path');
const puppeteer=require(require('path').join(REPO,'node_modules','puppeteer'));
const ROOT=require('path').join(REPO,'_app');
const srv=http.createServer((q,r)=>{let p=decodeURIComponent(q.url.split('?')[0]);
 fs.readFile(path.join(ROOT,p),(e,b)=>{if(e){r.writeHead(404);return r.end();}
 r.writeHead(200,{'Content-Type':p.endsWith('.js')?'text/javascript':'text/html'});r.end(b);});});
let P=0,F=0;const ck=(l,ok,d)=>{ok?P++:F++;console.log(`  ${ok?'PASS':'FAIL'}  ${l}${d?'  -> '+d:''}`);};
const U='/houses/forge/applets/comptia-aplus/core-1/labs/forge-vm-setup.lab.html';
const wait=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
 await new Promise(r=>srv.listen(0,'127.0.0.1',r));
 const b=await puppeteer.launch({headless:'new',args:['--no-sandbox','--disable-setuid-sandbox']});
 const pg=await b.newPage(); await pg.setViewport({width:1366,height:900});
 await pg.setRequestInterception(true);
 pg.on('request',r=>r.url().includes('AccessGuard.js')?r.abort():r.continue());
 const errs=[]; pg.on('pageerror',e=>{if(!/AccessGuard/.test(e.message))errs.push(e.message);});
 await pg.goto(`http://127.0.0.1:${srv.address().port}`+U,{waitUntil:'networkidle2'});
 await wait(400);

 console.log('\nTHE RUBBER STAMP IS GONE');
 ck('step 3 does NOT pass on load', await pg.evaluate(()=>isStepValid(3))===false);
 ck('step 4 does NOT pass on load', await pg.evaluate(()=>isStepValid(4))===false);
 ck('with no guest OS chosen, neither can pass at ANY slider position',
    await pg.evaluate(()=>{
      document.getElementById('vmType').value='';
      let any=false;
      for (let r=512;r<=16384;r+=512){document.getElementById('ramSlider').value=r;if(isStepValid(3))any=true;}
      for (let d=20;d<=500;d+=10){document.getElementById('diskSlider').value=d;if(isStepValid(4))any=true;}
      return !any; }));

 console.log('\nTHE GATE TRACKS THE GUEST ACTUALLY CHOSEN');
 const win = await pg.evaluate(()=>{
   document.getElementById('vmType').value='windows';
   const at=(r)=>{document.getElementById('ramSlider').value=r;return isStepValid(3);};
   return { below: at(2048), min: at(4096), ceiling: at(8192), over: at(8704), max: at(16384) };});
 ck('Windows 11 rejects 2048 (its stated minimum is 4 GB)', win.below===false);
 ck('accepts 4096, the minimum the page states', win.min===true);
 ck('accepts 8192, half the host RAM', win.ceiling===true);
 ck('rejects 8704, over the page\'s own 50% rule', win.over===false);
 ck('rejects 16384, the whole host', win.max===false);
 const lin = await pg.evaluate(()=>{
   document.getElementById('vmType').value='linux';
   const at=(r)=>{document.getElementById('ramSlider').value=r;return isStepValid(3);};
   return { two: at(2048), one: at(1024) };});
 ck('Linux accepts 2048, which the page says it can run on', lin.two===true);
 ck('Linux still rejects 1024', lin.one===false);
 ck('the SAME 2048 that passes for Linux fails for Windows', win.below===false && lin.two===true);

 console.log('\nDISK TRACKS THE GUEST TOO');
 const disk = await pg.evaluate(()=>{
   const at=(t,d)=>{document.getElementById('vmType').value=t;
     document.getElementById('diskSlider').value=d;return isStepValid(4);};
   /* The slider steps by 10 from 20, so 64 is not a reachable position: the true Windows 11
      figure is 64 GB, and the student must therefore choose 70. Test the reachable values
      either side of the requirement, not the requirement itself. */
   return { linux25: at('linux',30), win30: at('windows',30), win60: at('windows',60),
            win70: at('windows',70), mac70: at('mac',70), mac80: at('mac',80) };});
 ck('30 GB is enough for Linux', disk.linux25===true);
 ck('but not for Windows', disk.win30===false);
 ck('60 GB still fails Windows 11, whose real floor is 64 GB', disk.win60===false);
 ck('70 GB, the first reachable value above it, passes', disk.win70===true);
 ck('macOS needs more than Windows (70 fails, 80 passes)',
    disk.mac70===false && disk.mac80===true);

 console.log('\nTHE HARD GATE STILL HOLDS');
 ck('nextStep() from an unsatisfied step 3 is a no-op', await pg.evaluate(()=>{
    document.getElementById('vmType').value='windows';
    document.getElementById('ramSlider').value=512; updateRam();
    currentStep=3; updateUI(); nextStep(); return currentStep===3; }));
 ck('and the Next button is disabled there',
    await pg.evaluate(()=>document.getElementById('nextBtn').disabled)===true);
 ck('sizing it correctly enables Next and advances', await pg.evaluate(()=>{
    document.getElementById('ramSlider').value=8192; updateRam();
    const enabled=!document.getElementById('nextBtn').disabled; nextStep();
    return enabled && currentStep===4; }));

 console.log('\nTHE STUDENT IS TOLD WHY');
 const hints = await pg.evaluate(()=>{
   document.getElementById('vmType').value='windows';
   document.getElementById('ramSlider').value=1024; updateRam();
   const low=document.getElementById('ramHint').textContent;
   document.getElementById('ramSlider').value=16384; updateRam();
   const high=document.getElementById('ramHint').textContent;
   document.getElementById('ramSlider').value=8192; updateRam();
   return { low, high, ok:document.getElementById('ramHint').textContent,
            cls:document.getElementById('ramHint').className }; });
 ck('too little says what the guest needs', /at least 4096 MB/.test(hints.low), hints.low);
 ck('too much explains the host cost', /half the host/.test(hints.high), hints.high);
 ck('a good value reads as good', /ok/.test(hints.cls), hints.ok);
 console.log('\nSTART OVER MUST NOT HAND THE FREE RIDE BACK (Chris, 2026-08-07)');
 /* The fix was only ever true of the first page load: resetLab() hardcoded 4096/50, which
    passes Linux outright and passes the RAM step for every guest. Drive the REAL button. */
 const reset = await pg.evaluate(()=>{
   resetLab();
   const ram=+document.getElementById('ramSlider').value, disk=+document.getElementById('diskSlider').value;
   const noOS = { s3:isStepValid(3), s4:isStepValid(4) };
   document.getElementById('vmType').value='linux';
   const linux = { s3:isStepValid(3), s4:isStepValid(4) };
   document.getElementById('vmType').value='windows';
   const win = { s3:isStepValid(3), s4:isStepValid(4) };
   return { ram, disk, noOS, linux, win,
            ramText:document.getElementById('ramValue').textContent,
            diskText:document.getElementById('diskValue').textContent,
            hint:document.getElementById('ramHint').textContent };
 });
 ck('Start Over resets the sliders BELOW every minimum', reset.ram===512 && reset.disk===20,
    `ram=${reset.ram} disk=${reset.disk}`);
 ck('the displayed values match the real slider positions',
    /512 MB/.test(reset.ramText) && /20 GB/.test(reset.diskText),
    reset.ramText+' / '+reset.diskText);
 ck('after Start Over, neither step passes with no OS chosen',
    reset.noOS.s3===false && reset.noOS.s4===false);
 ck('nor for Linux, the guest the old default silently cleared',
    reset.linux.s3===false && reset.linux.s4===false);
 ck('nor for Windows', reset.win.s3===false && reset.win.s4===false);
 ck('the hints are repainted, not stale', /operating system|at least/.test(reset.hint), reset.hint);

 /* end to end through the real handlers: complete once, Start Over, then try to walk the
    wizard without touching a slider */
 const walk = await pg.evaluate(()=>{
   resetLab();
   selectHypervisor && selectHypervisor('type2');
   document.getElementById('vmName').value='RetryVM';
   document.getElementById('vmType').value='linux';
   document.getElementById('vmType').dispatchEvent(new Event('change'));
   currentStep=2; updateUI(); nextStep();          /* -> step 3 */
   const atThree = currentStep;
   nextStep();                                      /* must NOT advance */
   return { atThree, stuckAt: currentStep,
            nextDisabled: document.getElementById('nextBtn').disabled };
 });
 ck('a retry cannot walk past step 3 without sizing memory',
    walk.stuckAt===3, 'stopped at step '+walk.stuckAt);
 ck('and Next is disabled there', walk.nextDisabled===true);

 ck('no JS errors', errs.length===0, errs.slice(0,2).join(' | '));
 console.log(`\n${P} passed, ${F} failed`);
 await b.close(); srv.close(); process.exitCode=F?1:0;
})();
