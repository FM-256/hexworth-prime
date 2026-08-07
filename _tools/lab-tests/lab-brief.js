#!/usr/bin/env node
/**
 * @catalog what    A+ ch25 lab briefing: content, real links, fits without scrolling
 * @catalog run     node _tools/lab-tests/lab-brief.js
 * @catalog status  GATE
 *
 * Moved out of a session scratchpad on 2026-08-07. These suites caught the defects
 * that ten review rounds were spent on, and they existed only for the length of one
 * session. Run them before touching the labs they cover, and via run-all.js in the
 * deploy chain.
 */
const REPO = require('path').resolve(__dirname, '..', '..');
/* The briefing must actually brief: say what the lab is, name the software, and point at
   pages we really host. A dead link here is worse than no link. */
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
 await pg.evaluateOnNewDocument(()=>localStorage.removeItem('hexworth_progress'));
 await pg.goto(base+U,{waitUntil:'networkidle2'}); await wait(300);
 /* NOTE: this page clears storage on EVERY document, so the "second visit" checks below use a
    SECOND page without that hook -- same origin, same localStorage. */

 console.log('\nFIRST RUN');
 ck('the briefing opens itself on a first visit',
    await pg.evaluate(()=>document.getElementById('mBrief').classList.contains('open')));
 const txt=await pg.evaluate(()=>document.getElementById('mBrief').innerText);
 ck('it says what each stage is',
    /VirtualBox/.test(txt)&&/VMware Workstation/.test(txt)&&/Type 1/.test(txt));
 ck('it names the licence terms', /GPLv3/.test(txt)&&/personal use/i.test(txt));
 ck('it is honest that this is a simulation', /simulation, not the real binary/i.test(txt));
 ck('it tells you it can be reopened', /reopen/i.test(txt));

 console.log('\nTHE LINKS MUST BE REAL');
 const links=await pg.evaluate(()=>[...document.querySelectorAll('#mBrief a')].map(a=>a.getAttribute('href')));
 ck('the briefing carries links', links.length>=3, links.length+' links');
 let bad=[];
 for (const href of [...new Set(links)]) {
   if (!href.startsWith('/')) { bad.push(href+' (not site-absolute)'); continue; }
   const onDisk = fs.existsSync(path.join(ROOT, href));
   const r = await pg.evaluate(async u=>(await fetch(u)).status, base+href);
   if (!onDisk || r!==200) bad.push(`${href} [disk:${onDisk} http:${r}]`);
 }
 ck('every briefing link resolves to a page we actually host', bad.length===0, bad.join(' · '));
 ck('the toolkit pages are the ones linked',
    links.some(h=>/virtualbox\.tool\.html$/.test(h)) && links.some(h=>/vmware-workstation\.tool\.html$/.test(h)));

 console.log('\nIT MUST FIT — same no-scroll rule as the lab');
 const fit=await pg.evaluate(()=>{const d=document.querySelector('#mBrief .dlg');
   return {sh:d.scrollHeight,ch:d.clientHeight,vh:window.innerHeight};});
 ck('the briefing fits without scrolling inside itself at 1366x768',
    fit.sh<=fit.ch+2, `content ${fit.sh}px in ${fit.ch}px`);

 console.log('\nIT MUST GET OUT OF THE WAY');
 await pg.evaluate(()=>closeModal('mBrief')); await wait(150);
 ck('it closes', await pg.evaluate(()=>!document.getElementById('mBrief').classList.contains('open')));
 const pg2=await b.newPage(); await pg2.setViewport({width:1366,height:768});
 await pg2.setRequestInterception(true);
 pg2.on('request',r=>r.url().includes('AccessGuard.js')?r.abort():r.continue());
 pg2.on('pageerror',e=>{if(!/AccessGuard is not defined/.test(e.message))errs.push(e.message);});
 await pg2.goto(base+U,{waitUntil:'networkidle2'}); await wait(400);
 ck('it does NOT reopen on the next visit',
    await pg2.evaluate(()=>!document.getElementById('mBrief').classList.contains('open')));
 await pg2.evaluate(()=>openBrief()); await wait(150);
 ck('the header button reopens it on demand',
    await pg2.evaluate(()=>document.getElementById('mBrief').classList.contains('open')));
 await pg2.evaluate(()=>closeModal('mBrief')); await wait(120);
 const lay=await pg2.evaluate(()=>({sc:[...document.querySelectorAll('*')].filter(e=>e.scrollHeight>e.clientHeight+2&&
    ['auto','scroll'].includes(getComputedStyle(e).overflowY)).map(e=>e.className||e.tagName),
    page:document.documentElement.scrollHeight-window.innerHeight}));
 ck('the lab page still does not scroll', lay.sc.length===0 && lay.page<=0,
    lay.sc.join(', ')+' page:'+lay.page);

 ck('no JS errors', errs.length===0, errs.slice(0,2).join('; '));
 console.log(`\n${P} passed, ${F} failed`);
 await b.close(); srv.close(); process.exitCode=F?1:0;
})();
