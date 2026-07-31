// BUG-076: the deck must offer a way out, and it must survive the no-history case -- opened in
// a fresh tab, which is exactly what middle-click / Ctrl-click / "open in new tab" produce.
const puppeteer=require('puppeteer');
const BASE=process.env.BASE;
let pass=0,fail=0;
function ck(l,ok,d){ if(ok){pass++;console.log('  PASS  '+l);} else {fail++;console.log('  FAIL  '+l+(d?': '+d:''));} }
(async()=>{
 const b=await puppeteer.launch({headless:'new',args:['--no-sandbox']});
 try{
  const p=await b.newPage(); await p.setCacheEnabled(false);
  await p.setViewport({width:1440,height:900});
  // Fresh tab, NO referrer, NO history -- the new-tab case where browser-back does not exist.
  await p.goto(BASE+'/components/slides/admissions-2026.html',{waitUntil:'domcontentloaded',timeout:40000});
  await new Promise(r=>setTimeout(r,2500));
  const hist=await p.evaluate(()=>history.length);
  const st=await p.evaluate(()=>{
    const e=document.getElementById('deck-exit');
    // offsetParent is NULL for position:fixed elements, so the usual offsetParent check reports
    // every fixed element as invisible. This deck's chrome is entirely fixed. Use the rendered
    // box + computed style instead, and prove the method by also measuring #slide-counter, which
    // is known to render.
    const vis=el=>{ if(!el) return false; const cs=getComputedStyle(el); const r=el.getBoundingClientRect();
      return cs.display!=='none' && cs.visibility!=='hidden' && parseFloat(cs.opacity)>0 && r.width>0 && r.height>0; };
    return {present:!!e, visible:vis(e), href:e?e.getAttribute('href'):null,
            anchors:document.querySelectorAll('a[href]').length,
            controlVisible:vis(document.getElementById('slide-counter'))};
  });
  console.log('  history.length in a fresh tab: '+hist+'  (1 = nothing to go back to)');
  ck('deck has an exit anchor at all (was 0 href)', st.anchors>=1, String(st.anchors));
  ck('detector sanity: a known-rendered fixed control reads visible', st.controlVisible===true);
  ck('exit is VISIBLE, not just present', st.visible===true);
  ck('exit points home', st.href==='/', String(st.href));
  if(st.visible){
    await Promise.all([p.waitForNavigation({timeout:15000}).catch(()=>null), p.click('#deck-exit')]);
    ck('clicking it leaves the deck', new URL(p.url()).pathname!=='/components/slides/admissions-2026.html', p.url());
  }
  await p.close();
 } finally { await b.close().catch(()=>{}); }
 console.log('\n'+pass+' passed, '+fail+' failed');
 process.exit(fail?1:0);
})();
