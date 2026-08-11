#!/usr/bin/env node
/*
 * @catalog what    Drives Maximize/Restore on the sandbox launcher, including the FALLBACK path
 * @catalog what    taken when the Fullscreen API is unavailable or refused.
 * @catalog run     node _tools/qa/sandbox-launcher-maximize-test.js
 * @catalog status  GATE
 *
 * Saved to the repo because Chris pointed out the original 6/6 for this existed only in a chat
 * message. Evidence that cannot be re-run is not evidence anyone else can check.
 *
 * It nulls requestFullscreen deliberately: that branch never executes in normal testing and
 * would rot unnoticed until a student opened the launcher somewhere fullscreen is denied.
 */
const puppeteer=require('puppeteer'),http=require('http'),fs=require('fs'),path=require('path');
const ROOT='/home/eq/ai-content/hexworth-prime/_app';
const MIME={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.webp':'image/webp','.png':'image/png','.svg':'image/svg+xml'};
const srv=http.createServer((q,r)=>{let p=decodeURIComponent(q.url.split('?')[0]);if(p.endsWith('/'))p+='index.html';
 fs.readFile(path.join(ROOT,p),(e,b)=>{if(e){r.writeHead(404);return r.end('404');}
 r.writeHead(200,{'Content-Type':MIME[path.extname(p)]||'application/octet-stream'});r.end(b);});});
let pass=0,fail=0;
const t=(n,c,d)=>{c?(pass++,console.log('  PASS  '+n+(d?'  -> '+d:''))):(fail++,console.log('  FAIL  '+n+(d?'  -> '+d:'')));};
(async()=>{
 await new Promise(r=>srv.listen(0,'127.0.0.1',r)); const port=srv.address().port;
 const b=await puppeteer.launch({headless:'new',args:['--no-sandbox','--disable-setuid-sandbox']});
 const p=await b.newPage(); await p.setViewport({width:1920,height:1080});
 const errs=[]; p.on('pageerror',e=>errs.push(String(e.message).slice(0,90)));
 await p.evaluateOnNewDocument(()=>{try{localStorage.setItem('hexworth_house','cloud');}catch(e){}});
 await p.goto(`http://127.0.0.1:${port}/rig/index.html`,{waitUntil:'networkidle0',timeout:40000});
 await new Promise(r=>setTimeout(r,1000));
 const before=await p.evaluate(()=>{
   const w=document.querySelector('.sandbox-launcher__iframe-wrap'); w.style.display='';
   return Math.round(document.querySelector('.sandbox-launcher__iframe').getBoundingClientRect().height);
 });
 // simulate the API being unavailable so the FALLBACK path is what gets exercised
 await p.evaluate(()=>{ const w=document.querySelector('.sandbox-launcher__iframe-wrap'); w.requestFullscreen=null; });
 await p.click('.sandbox-launcher__btn--maximize');
 await new Promise(r=>setTimeout(r,600));
 const after=await p.evaluate(()=>({
   h:Math.round(document.querySelector('.sandbox-launcher__iframe').getBoundingClientRect().height),
   tall:document.querySelector('.sandbox-launcher__iframe-wrap').classList.contains('is-tall'),
   label:document.querySelector('.sandbox-launcher__btn--maximize').textContent.trim()
 }));
 t('fallback path grows the sandbox', after.h>before, `${before}px -> ${after.h}px`);
 t('fallback marks the wrapper is-tall', after.tall===true);
 t('button label flips to Restore', after.label==='Restore', after.label);
 await p.click('.sandbox-launcher__btn--maximize');
 await new Promise(r=>setTimeout(r,600));
 const back=await p.evaluate(()=>({
   h:Math.round(document.querySelector('.sandbox-launcher__iframe').getBoundingClientRect().height),
   label:document.querySelector('.sandbox-launcher__btn--maximize').textContent.trim()
 }));
 t('Restore returns to the normal size', back.h===before, `${back.h}px`);
 t('label flips back to Maximize', back.label==='Maximize', back.label);
 t('no page errors', errs.length===0, errs.join('|')||'none');
 console.log(`\n${pass}/${pass+fail} checks passed`);
 await b.close(); srv.close(); process.exit(fail?1:0);
})().catch(e=>{console.error('ERR '+e.message);process.exit(1);});
