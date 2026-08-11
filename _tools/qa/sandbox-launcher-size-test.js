#!/usr/bin/env node
/*
 * @catalog what    Measures the RENDERED sandbox iframe at three viewport sizes, so the launcher
 * @catalog what    cannot silently go back to a fixed height on 35 pages.
 * @catalog run     node _tools/qa/sandbox-launcher-size-test.js
 * @catalog status  GATE
 *
 * The sandbox was height:500px, hardcoded. On 1440p that is roughly a third of the screen for a
 * terminal, and nothing about it responded to the viewport. This asserts the rendered box, not
 * the CSS text, because a stylesheet that says clamp() proves nothing about what a browser
 * actually laid out.
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
 for(const [w,h,label] of [[1920,1080,'1080p'],[2560,1440,'1440p'],[1366,768,'laptop']]){
  const p=await b.newPage(); await p.setViewport({width:w,height:h});
  const errs=[]; p.on('pageerror',e=>errs.push(String(e.message).slice(0,90)));
  await p.evaluateOnNewDocument(()=>{try{localStorage.setItem('hexworth_house','cloud');}catch(e){}});
  await p.goto(`http://127.0.0.1:${port}/rig/index.html`,{waitUntil:'networkidle0',timeout:40000});
  await new Promise(r=>setTimeout(r,1200));
  const m=await p.evaluate(()=>{
    // force the panel visible so the iframe has a measurable box
    const wrap=document.querySelector('.sandbox-launcher__iframe-wrap');
    if(!wrap) return {none:true};
    wrap.style.display='';
    const f=document.querySelector('.sandbox-launcher__iframe');
    const r=f.getBoundingClientRect();
    const btn=document.querySelector('.sandbox-launcher__btn--maximize');
    return {h:Math.round(r.height), w:Math.round(r.width),
            resize:getComputedStyle(wrap).resize,
            hasMax:!!btn, label:btn?btn.textContent.trim():null};
  });
  if(m.none){ t(`${label}: launcher present`, false, 'no iframe-wrap on the page'); await p.close(); continue; }
  t(`${label} (${w}x${h}) iframe height`, m.h>500, `${m.h}px (was 500 fixed)`);
  t(`${label} maximize button present`, m.hasMax===true, m.label);
  t(`${label} wrapper is resizable`, m.resize==='vertical', m.resize);
  t(`${label} no page errors`, errs.length===0, errs.join('|')||'none');
  await p.close();
 }
 console.log(`\n${pass}/${pass+fail} checks passed`);
 await b.close(); srv.close(); process.exit(fail?1:0);
})().catch(e=>{console.error('ERR '+e.message);process.exit(1);});
