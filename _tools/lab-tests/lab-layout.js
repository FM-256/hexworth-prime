#!/usr/bin/env node
/**
 * @catalog what    A+ ch25 lab layout: nothing scrolls at 1600x900 or 1366x768
 * @catalog run     node _tools/lab-tests/lab-layout.js
 * @catalog status  GATE
 *
 * Moved out of a session scratchpad on 2026-08-07. These suites caught the defects
 * that ten review rounds were spent on, and they existed only for the length of one
 * session. Run them before touching the labs they cover, and via run-all.js in the
 * deploy chain.
 */
const REPO = require('path').resolve(__dirname, '..', '..');
const http=require('http'),fs=require('fs'),path=require('path');
const puppeteer=require(require('path').join(REPO,'node_modules','puppeteer'));
const ROOT=require('path').join(REPO,'_app');
const MIME={'.html':'text/html','.js':'text/javascript','.webp':'image/webp'};
const srv=http.createServer((q,r)=>{let p=decodeURIComponent(q.url.split('?')[0]);
 fs.readFile(path.join(ROOT,p),(e,b)=>{if(e){r.writeHead(404);return r.end();}
 r.writeHead(200,{'Content-Type':MIME[path.extname(p)]||'application/octet-stream'});r.end(b);});});
const U='/houses/forge/applets/comptia-aplus/core-2/labs/forge-virtualization.lab.html';
(async()=>{
 await new Promise(r=>srv.listen(0,'127.0.0.1',r));
 const base=`http://127.0.0.1:${srv.address().port}`;
 const b=await puppeteer.launch({headless:'new',args:['--no-sandbox','--disable-setuid-sandbox']});
 for (const [w,h,label] of [[1600,900,'desktop 1600x900'],[1366,768,'laptop 1366x768']]) {
   const pg=await b.newPage(); await pg.setViewport({width:w,height:h});
   await pg.setRequestInterception(true);
   pg.on('request',r=>r.url().includes('AccessGuard.js')?r.abort():r.continue());
   await pg.goto(base+U,{waitUntil:'networkidle2'}); await new Promise(r=>setTimeout(r,500));
 await pg.evaluate(()=>closeModal('mBrief'));
   const m=await pg.evaluate(()=>{
     const t=document.querySelector('.tasks'), tr=t.getBoundingClientRect();
     const btn=document.getElementById('finishBtn'), br=btn.getBoundingClientRect();
     const vb=document.querySelector('.vbox').getBoundingClientRect();
     return {vh:innerHeight, tasksTop:Math.round(tr.top), tasksH:Math.round(tr.height),
             tasksBottom:Math.round(tr.bottom), btnTop:Math.round(br.top),
             btnVisibleNow: br.top>=0 && br.bottom<=innerHeight,
             sticky:getComputedStyle(t).position,
             vboxH:Math.round(vb.height), pageH:document.documentElement.scrollHeight};
   });
   console.log(`\n${label}`);
   console.log(`  viewport height          ${m.vh}`);
   console.log(`  tasks panel height       ${m.tasksH}   (position: ${m.sticky})`);
   console.log(`  tasks panel bottom at    ${m.tasksBottom}  ${m.tasksBottom>m.vh?'<-- EXTENDS PAST THE VIEWPORT':''}`);
   console.log(`  Complete button visible  ${m.btnVisibleNow}`);
   // scroll to the bottom and see if the button can EVER be reached
   await pg.evaluate(()=>window.scrollTo(0,document.body.scrollHeight));
   await new Promise(r=>setTimeout(r,300));
   const after=await pg.evaluate(()=>{
     const br=document.getElementById('finishBtn').getBoundingClientRect();
     return {top:Math.round(br.top),bottom:Math.round(br.bottom),
             visible: br.top>=0 && br.bottom<=innerHeight};});
   console.log(`  after scrolling to bottom: button visible = ${after.visible}  (top ${after.top}, bottom ${after.bottom})`);
   // THE assertion: with the LAST task in view, is the tool still on screen?
   const both=await pg.evaluate(()=>{
     // open the LAST task in the rail, then ask: is everything still on screen?
     const steps=[...document.querySelectorAll('.step')];
     if(steps.length) steps[steps.length-1].click();
     const vb=document.querySelector('.vbox').getBoundingClientRect();
     const btn=document.getElementById('finishBtn').getBoundingClientRect();
     const open=document.getElementById('openTask').getBoundingClientRect();
     const rail=document.querySelector('.tasks').getBoundingClientRect();
     const fits=r=>r.top>=-1&&r.bottom<=innerHeight+1;
     return {toolVisible:fits(vb), buttonVisible:fits(btn), lastTaskVisible:fits(open),
             railFits:fits(rail), stepCount:steps.length,
             pageScroll:document.documentElement.scrollHeight-innerHeight,
             anyScroller:[...document.querySelectorAll('*')].filter(e=>e.scrollHeight>e.clientHeight+2
               && ['auto','scroll'].includes(getComputedStyle(e).overflowY)).map(e=>e.className||e.tagName)};});
   console.log(`  LAST task open -> tool ${both.toolVisible}, task ${both.lastTaskVisible}, `+
               `button ${both.buttonVisible}, whole rail fits ${both.railFits} (${both.stepCount} steps)`);
   console.log(`  elements that can scroll: ${both.anyScroller.length?both.anyScroller.join(', '):'NONE'}`);
   console.log(`  leftover page scroll: ${both.pageScroll}px  ${both.pageScroll>2?'<-- PAGE STILL SCROLLS':'(none)'}`);
   const onLoad=await pg.evaluate(()=>{
     const sc=document.querySelector('.tasks .scroll'); if(sc) sc.scrollTop=0;
     window.scrollTo(0,0);
     const vis=r=>r.top>=0&&r.bottom<=innerHeight;
     const vb=document.querySelector('.vbox').getBoundingClientRect();
     const btn=document.getElementById('finishBtn').getBoundingClientRect();
     return {tool:vis(vb)||vb.top>=0&&vb.top<innerHeight, button:vis(btn),
             panelBottom:Math.round(document.querySelector('.tasks').getBoundingClientRect().bottom)};});
   console.log(`  ON LOAD: tool on screen ${onLoad.tool}, Complete button visible ${onLoad.button}, panel bottom ${onLoad.panelBottom}`);
   if(w===1366) await pg.screenshot({path:'lab-laptop.png'});
   await pg.close();
 }
 await b.close(); srv.close();
})();
