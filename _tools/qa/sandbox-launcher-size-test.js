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
 /* ⚠ MORE THAN ONE PAGE, because both regressions Chris found were invisible to a suite that
    only ever loaded /rig/index.html. The Observatory pins the iframe height with a
    two-class selector that outranks the component's own rule, which reintroduced the
    decoupled-heights bug on that page alone. A component used by 35 pages cannot be tested
    on one of them. */
 const PAGES = [['/rig/index.html','rig']];
 for(const [pagePath,pageName] of PAGES)
 for(const [w,h,label0] of [[1920,1080,'1080p'],[2560,1440,'1440p'],[1366,768,'laptop']]){
  const label = pageName+' '+label0;
  const p=await b.newPage(); await p.setViewport({width:w,height:h});
  const errs=[]; p.on('pageerror',e=>errs.push(String(e.message).slice(0,90)));
  await p.evaluateOnNewDocument(()=>{try{localStorage.setItem('hexworth_house','cloud');}catch(e){}});
  await p.goto(`http://127.0.0.1:${port}${pagePath}`,{waitUntil:'networkidle0',timeout:40000});
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

  /* ⚠ DOES DRAGGING ACTUALLY RESIZE THE SANDBOX? The first version of this feature put
     resize:vertical on the WRAPPER while the iframe kept its own fixed clamp height. The two
     were decoupled, so a drag changed the wrapper and left the sandbox exactly as it was:
     smaller CLIPPED it (overflow:hidden, no scrollbar), larger added dead black space. It
     looked like a working handle. Chris measured 824 -> 300 with the iframe stuck at 778.
     So this simulates the drag by setting the wrapper height, and asserts the IFRAME followed. */
  const drag = await p.evaluate(() => {
    const wrap = document.querySelector('.sandbox-launcher__iframe-wrap');
    const f = document.querySelector('.sandbox-launcher__iframe');
    const before = Math.round(f.getBoundingClientRect().height);
    wrap.style.height = '300px';
    const smaller = Math.round(f.getBoundingClientRect().height);
    /* RELATIVE to the current height, not an absolute 900px. The absolute value was smaller
       than the 72vh default on a 1440p display, so the "bigger" assertion failed against
       working code — the test asserting the wrong thing, again. */
    wrap.style.height = (before + 200) + 'px';
    const bigger = Math.round(f.getBoundingClientRect().height);
    wrap.style.height = '';
    return { before, smaller, bigger };
  });
  t(`${label} dragging SMALLER shrinks the iframe`, drag.smaller < drag.before,
    `${drag.before}px -> ${drag.smaller}px`);
  t(`${label} dragging BIGGER grows the iframe`, drag.bigger > drag.before,
    `${drag.before}px -> ${drag.bigger}px`);

  /* ⚠ COMPOSED, not each in isolation. A native resize drag writes an INLINE height, which
     beats the .is-tall class rule, so Maximize did nothing after a drag while still flipping
     the label to "Restore". Each feature passed alone; the sequence was broken. */
  const seq = await p.evaluate(() => {
    const wrap = document.querySelector('.sandbox-launcher__iframe-wrap');
    const f = document.querySelector('.sandbox-launcher__iframe');
    wrap.requestFullscreen = null;                       // force the fallback path
    wrap.style.height = '360px';                         // as a real drag leaves it
    const dragged = Math.round(f.getBoundingClientRect().height);
    document.querySelector('.sandbox-launcher__btn--maximize').click();
    const maxed = Math.round(f.getBoundingClientRect().height);
    document.querySelector('.sandbox-launcher__btn--maximize').click();
    const restored = Math.round(f.getBoundingClientRect().height);
    wrap.style.height = '';
    return { dragged, maxed, restored };
  });
  t(`${label} Maximize works AFTER a drag`, seq.maxed > seq.dragged,
    `${seq.dragged}px -> ${seq.maxed}px`);
  t(`${label} Restore returns to the dragged height`, seq.restored === seq.dragged,
    `${seq.maxed}px -> ${seq.restored}px (dragged was ${seq.dragged}px)`);
  await p.close();
 }
 /* ── CROSS-PAGE OVERRIDE SWEEP ────────────────────────────────────────────────────
    The rendered checks above run on the Rig, because that is where the launcher mounts at
    load. Observatory injects its launcher on demand, so a rendered-element check cannot see
    it there — and Observatory is exactly where the regression lived: a two-class rule pinning
    .sandbox-launcher__iframe to 66vh, outranking the component's height:100% and decoupling
    the iframe from the wrapper on that page alone.

    So this asserts the PROPERTY that broke, across every page hosting the launcher: no page
    may set a height on .sandbox-launcher__iframe. The height belongs to the wrapper. */
 console.log('\n--- cross-page: no page may pin the iframe height ---\n');
 {
   const APP = path.resolve(__dirname, '../../_app');
   const walk = (dir, out) => {
     for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
       const fp = path.join(dir, e.name);
       if (e.isDirectory()) walk(fp, out); else if (e.name.endsWith('.html')) out.push(fp);
     }
     return out;
   };
   const hosts = walk(APP, []).filter(f => fs.readFileSync(f, 'utf8').includes('SandboxLauncher'));
   const offenders = hosts.filter(f => {
     /* Strip CSS and HTML comments FIRST. Without this the check flags prose: the Observatory
        fix carries a comment explaining the old rule, quoting
        `.sandbox-launcher__iframe { height:100% }`, and the scan matched the explanation of
        the bug as the bug. A checker that cannot tell code from a comment about code will
        cry wolf until someone stops reading it. */
     const css = fs.readFileSync(f, 'utf8')
                   .replace(/\/\*[\s\S]*?\*\//g, '')
                   .replace(/<!--[\s\S]*?-->/g, '');
     return /\.sandbox-launcher__iframe(?!-wrap)[^{}]*\{[^}]*height\s*:/.test(css);
   }).map(f => path.relative(APP, f));
   if (offenders.length) { fail++; console.log(`  FAIL  ${offenders.length} page(s) pin the iframe height: ${offenders.join(', ')}`); }
   else { pass++; console.log(`  PASS  none of the ${hosts.length} launcher-hosting pages pin the iframe height`); }
 }

 console.log(`\n${pass}/${pass+fail} checks passed`);
 await b.close(); srv.close(); process.exit(fail?1:0);
})().catch(e=>{console.error('ERR '+e.message);process.exit(1);});
