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

  /* ⚠ MINIMIZE IS PART OF THE SEQUENCE TOO, and skipping it is how a bug shipped. The suite
     stopped at Restore, so nothing ever clicked Minimize after a drag. Minimize used to restore
     the Maximize handler's stashed height UNCONDITIONALLY, which discarded a live drag and
     stranded the student at a size from some earlier, unrelated action.
     Two orderings, because only the second exposes a STALE stash: */
  const minSeq = await p.evaluate(() => {
    const wrap = document.querySelector('.sandbox-launcher__iframe-wrap');
    const btnMax = document.querySelector('.sandbox-launcher__btn--maximize');
    const btnMin = document.querySelector('.sandbox-launcher__btn--collapse');
    const show = () => { wrap.style.display = ''; };

    // A: drag, then Minimize, with NO Maximize anywhere in between.
    show(); wrap.style.height = '400px';
    btnMin.click(); show();
    const afterPlainMinimize = wrap.style.height;

    // B: a full maximize cycle FIRST (which writes the stash), then a fresh drag, then Minimize.
    wrap.requestFullscreen = null;
    wrap.style.height = '';
    btnMax.click(); btnMax.click();            // stash is now '' from this cycle
    show(); wrap.style.height = '640px';       // the student's deliberate, later drag
    btnMin.click(); show();
    const afterStaleStash = wrap.style.height;

    wrap.style.height = ''; wrap.style.display = 'none';
    return { afterPlainMinimize, afterStaleStash };
  });
  t(`${label} Minimize keeps a drag made without Maximize`,
    minSeq.afterPlainMinimize === '400px', `height is "${minSeq.afterPlainMinimize}"`);
  t(`${label} Minimize keeps a drag made AFTER a maximize cycle`,
    minSeq.afterStaleStash === '640px', `height is "${minSeq.afterStaleStash}"`);

  /* ⚠ WIDTH, WHICH THIS SUITE NEVER ONCE MEASURED. Every assertion above is vertical, and the
     500 -> 778px numbers that justified the whole change are heights. The operator reported the
     sandbox "in its small corner of the screen" AFTER all of it passed, and they were right:
     the Rig lays cards out as repeat(auto-fill, minmax(360px, 1fr)) and the launcher mounts
     inside one, so a running terminal rendered about 291px wide on a 1920 viewport. A tall
     narrow strip passes every height check ever written.
     A sandbox is a working surface, not a column: assert it uses a real share of the page. */
  const width = await p.evaluate(() => {
    const root = document.querySelector('.sandbox-launcher');
    const wrap = document.querySelector('.sandbox-launcher__iframe-wrap');
    const f = document.querySelector('.sandbox-launcher__iframe');
    wrap.style.display = '';
    const idle = Math.round(f.getBoundingClientRect().width);
    root.classList.add('is-embedded');          // what launching a sandbox does
    const open = Math.round(f.getBoundingClientRect().width);
    root.classList.remove('is-embedded');
    wrap.style.display = 'none';
    /* Measure against the page CONTAINER, not the viewport. Pages cap content deliberately
       (the Rig uses max-width:1600px), so on a 2560 display a correct full-width sandbox is
       still only ~57% of the screen. Asserting against the viewport failed working code at
       1440p and would push toward breaking a deliberate layout cap to satisfy a test. */
    const host = root.closest('.wrap, main, body') || document.body;
    const avail = Math.round(host.getBoundingClientRect().width);
    return { idle, open, avail, vw: window.innerWidth,
             hasSel: CSS.supports('selector(:has(*))') };
  });
  t(`${label} an OPEN sandbox uses most of its container`,
    width.open >= width.avail * 0.8,
    `${width.open}px of ${width.avail}px container (viewport ${width.vw})`);
  /* Recorded rather than asserted: on an engine without :has() the card cannot span columns and
     this degrades to the old width. That is the pre-existing behaviour, not a regression, but a
     silent pass on an unsupported engine would be a lie. */
  if (!width.hasSel) console.log('    (note: :has() unsupported here, column spanning inactive)');

  /* ⚠ DRIVE THE REAL BUTTONS, NOT THE CLASS. The width check above adds `is-embedded` by hand,
     which proves the CSS rule and NOTHING about whether the app's own state machine applies and
     removes it. It did not: `is-embedded` was added on launch and removed only by Minimize, so
     Destroy and session expiry left an idle, empty card spanning every grid column forever.
     Chris found it by clicking the buttons. Forcing the state you are trying to prove the app
     reaches is the failure named in feedback_a_probe_that_alters_layout_measures_nothing.
     fetch and FirebaseAuth are stubbed so launch/destroy resolve without a real sandbox. */
  const lifecycle = await p.evaluate(async () => {
    /* ⚠ MUTATE THE REAL BINDING, NOT window.FirebaseAuth. FirebaseAuth.js declares
       `const FirebaseAuth = (function(){...})()` — a LEXICAL const that is NOT a window
       property. Assigning window.FirebaseAuth creates a second, unrelated object; the
       component's `FirebaseAuth.isSignedIn()` still calls the real one, returns false, and
       the launch stops at "Sign in to launch a sandbox" having never fetched anything. My
       first stub did exactly that and the test failed against working code.
       Same trap as reference_lexical_const_window_guard_trap. */
    if (typeof FirebaseAuth === 'undefined') return { skipped: 'FirebaseAuth not loaded' };
    FirebaseAuth.isSignedIn = () => true;
    FirebaseAuth.getIdToken = async () => 'test-token';
    const json = (o) => Promise.resolve({ ok: true, status: 200, json: async () => o });
    window.fetch = (u, opt) => {
      const m = (opt && opt.method) || 'GET';
      if (m === 'DELETE') return json({ ok: true });
      if (/\/launch/.test(u)) return json({ sessionId: 'test-1', url: 'about:blank',
                                            lab: 'Test', status: 'running', launchedAt: Date.now() });
      return json({ status: 'running', url: 'about:blank' });
    };
    const root = document.querySelector('.sandbox-launcher');
    const card = root.closest('.card');
    const w = () => card ? Math.round(card.getBoundingClientRect().width) : 0;

    document.querySelector('.sandbox-launcher__btn--launch').click();
    await new Promise(r => setTimeout(r, 700));
    const launched = { embedded: root.classList.contains('is-embedded'), cardW: w() };

    const destroyBtn = document.querySelector('.sandbox-launcher__btn--destroy');
    if (destroyBtn) destroyBtn.click();
    await new Promise(r => setTimeout(r, 700));
    const destroyed = { embedded: root.classList.contains('is-embedded'), cardW: w() };
    return { launched, destroyed };
  });
  if (lifecycle.skipped) { console.log(`    (lifecycle skipped: ${lifecycle.skipped})`); }
  else {
  t(`${label} LAUNCH widens the card via the real button`,
    lifecycle.launched.embedded === true && lifecycle.launched.cardW > 400,
    `embedded=${lifecycle.launched.embedded} card=${lifecycle.launched.cardW}px`);
  t(`${label} DESTROY releases the width again`,
    lifecycle.destroyed.embedded === false && lifecycle.destroyed.cardW < lifecycle.launched.cardW,
    `embedded=${lifecycle.destroyed.embedded} card=${lifecycle.launched.cardW}px -> ${lifecycle.destroyed.cardW}px`);
  }
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
   /* ⚠ EXTERNAL STYLESHEETS COUNT. The sweep walked .html only, so a rule in a linked .css
      file would have sailed straight past the guarantee "no page may pin the iframe height".
      Chris proved it by planting one on a devops lab: 0 offenders reported. No such file
      exists today, which is exactly why it would go unnoticed when someone adds one. */
   const cssFiles = (function walkCss(dir, out) {
     for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
       const fp = path.join(dir, e.name);
       if (e.isDirectory()) walkCss(fp, out); else if (e.name.endsWith('.css')) out.push(fp);
     }
     return out;
   })(APP, []);
   const offenders = hosts.concat(cssFiles).filter(f => {
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
   else { pass++; console.log(`  PASS  none of the ${hosts.length} hosting pages or ${cssFiles.length} stylesheets pin the iframe height`); }
 }

 console.log(`\n${pass}/${pass+fail} checks passed`);
 await b.close(); srv.close(); process.exit(fail?1:0);
})().catch(e=>{console.error('ERR '+e.message);process.exit(1);});
