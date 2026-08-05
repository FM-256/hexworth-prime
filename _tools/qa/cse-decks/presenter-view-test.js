/**
 * pv-test.js — presenter view, two real windows, real BroadcastChannel.
 * Asserts the thing that actually matters in a lecture: the two windows agree,
 * navigation works from EITHER, and opening the presenter never moves the class.
 */
const http=require('http'),fs=require('fs'),path=require('path');
const puppeteer=require('/home/eq/ai-content/hexworth-prime/node_modules/puppeteer');
const ROOT='/home/eq/ai-content/hexworth-prime/_app';
const MIME={'.html':'text/html','.js':'text/javascript','.css':'text/css','.webp':'image/webp','.png':'image/png','.mp4':'video/mp4','.json':'application/json'};
const s=http.createServer((q,r)=>{let p=decodeURIComponent(q.url.split('?')[0]);if(p.endsWith('/'))p+='index.html';
 fs.readFile(path.join(ROOT,p),(e,b)=>{if(e){r.writeHead(404);return r.end();}
 r.writeHead(200,{'Content-Type':MIME[path.extname(p)]||'application/octet-stream'});r.end(b);});});

// The decks are gated with AccessGuard.require('instructor'), which correctly
// blanks the page for an unauthenticated headless browser. This test is about
// presenter-view SYNC, not access control, so the guard request is aborted —
// and the guard's PRESENCE is asserted from source below so this can never
// quietly become a test that passes on an ungated deck.
async function poseAsInstructor(pg){
  await pg.setRequestInterception(true);
  pg.on('request', r => {
    if (r.url().includes('AccessGuard.js')) return r.abort();
    r.continue();
  });
}

let P=0,F=0; const ck=(l,ok,d)=>{ok?P++:F++;console.log(`  ${ok?'PASS':'FAIL'}  ${l}${d?'  -> '+d:''}`);};
const DECK='/houses/cloud/cse/instructor/cse-lecture-ch1.html';
(async()=>{
 await new Promise(r=>s.listen(0,'127.0.0.1',r));
 const port=s.address().port, base=`http://127.0.0.1:${port}`;
 const b=await puppeteer.launch({headless:'new',protocolTimeout:180000,args:['--no-sandbox','--disable-setuid-sandbox','--force-prefers-reduced-motion']});
 const errs=[];
 const deck=await b.newPage(); await deck.setViewport({width:1280,height:720}); await poseAsInstructor(deck);
 deck.on('pageerror',e=>errs.push('DECK: '+e.message));
 await deck.evaluateOnNewDocument(()=>{localStorage.setItem('hexworth_house','cloud');});
 await deck.goto(base+DECK,{waitUntil:'domcontentloaded',timeout:45000});
 await new Promise(r=>setTimeout(r,1200));

 // NB: slides/idx/show are lexically scoped inside the deck script, so they are
// NOT reachable from page.evaluate — the same const-is-not-on-window trap that
// produced today's dead guards. Assert through the DOM instead, which is what
// the instructor actually sees anyway.
const cur = pg => pg.evaluate(()=>[...document.querySelectorAll('.slide')].findIndex(s=>s.classList.contains('active')));
{const src=fs.readFileSync('/home/eq/ai-content/hexworth-prime/_app/houses/cloud/cse/instructor/cse-lecture-ch1.html','utf8');
  ck('deck still carries AccessGuard.require (not weakened by this work)',
     src.includes("AccessGuard.require('instructor')"));}
 const total=await deck.evaluate(()=>document.querySelectorAll('.slide').length);
 ck('deck loads and finds slides', total>0, 'slides='+total);

 // advance the class deck to slide 4 BEFORE opening presenter
 await deck.evaluate(()=>{for(let k=0;k<3;k++)document.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowRight'}));});
 await new Promise(r=>setTimeout(r,300));
 ck('deck moved to slide 4', await cur(deck)===3);

 // open presenter the way an instructor does
 const pv=await b.newPage(); await pv.setViewport({width:1100,height:760}); await poseAsInstructor(pv);
 pv.on('pageerror',e=>errs.push('PV: '+e.message));
 await pv.goto(base+DECK+'?presenter=1&i=3',{waitUntil:'domcontentloaded',timeout:45000});
 await new Promise(r=>setTimeout(r,1200));

 ck('presenter renders presenter chrome, not the deck',
    await pv.evaluate(()=>document.body.classList.contains('presenter')));
 ck('presenter opens on the SAME slide (does not reset the class)',
    await cur(pv)===3 && await cur(deck)===3,
    'pv='+await cur(pv)+' deck='+await cur(deck));
 ck('the projected deck hides its notes overlay',
    await deck.evaluate(()=>!document.getElementById('notes').classList.contains('open')));
 ck('presenter shows notes for the current slide',
    (await pv.evaluate(()=>document.getElementById('pvNotes').textContent)).length>60);
 ck('presenter shows what is coming next',
    (await pv.evaluate(()=>document.getElementById('pvNext').textContent)).toLowerCase().includes('up next'));

 // navigate FROM the presenter — the instructor is looking at this screen
 await pv.evaluate(()=>document.getElementById('pvNext2').click());
 await new Promise(r=>setTimeout(r,600));
 ck('advancing from PRESENTER moves the class deck',
    await cur(deck)===4 && await cur(pv)===4,
    'deck='+await cur(deck)+' pv='+await cur(pv));

 // navigate from the class deck — should also sync
 await deck.evaluate(()=>document.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowLeft'})));
 await new Promise(r=>setTimeout(r,600));
 ck('advancing from DECK moves the presenter',
    await cur(pv)===3 && await cur(deck)===3,
    'deck='+await cur(deck)+' pv='+await cur(pv));

 // no ping-pong: one nav must produce exactly one settled index
 await deck.evaluate(()=>document.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowRight'})));
 await new Promise(r=>setTimeout(r,1200));
 ck('no feedback loop (index settles, does not run away)',
    await cur(deck)===4 && await cur(pv)===4,
    'deck='+await cur(deck)+' pv='+await cur(pv));

 // the class deck must never render presenter chrome
 // The bug the sync tests could not see: the presenter panel rendered ON TOP of
 // a live slide because the hide rule named a class that does not exist. Assert
 // the deck shell is genuinely gone, not merely that .pv is displayed.
 ck('presenter hides the slide deck entirely (no slide bleeding through)',
    await pv.evaluate(()=>{const a=document.querySelector('.app');
      return !a || getComputedStyle(a).display==='none';}));
 // ASSERT PRESENCE, not just absence. Hiding .app blanked the whole window and
 // every absence-based check still passed — "no slide visible" is trivially true
 // when nothing is visible. These require the panel to actually have size and text.
 // .nav is a SIBLING of .app — hiding .app alone left the deck footer floating
 // over the presenter controls. Assert every deck chrome element is gone.
 ck('no deck chrome bleeds into the presenter window',
    await pv.evaluate(()=>['.app','.bar','.stage','.nav','.notes'].every(sel=>{
      const e=document.querySelector(sel); if(!e) return true;
      const r=e.getBoundingClientRect(); return r.width===0 || r.height===0;})));
 ck('presenter panel is actually VISIBLE and has size',
    await pv.evaluate(()=>{const r=document.querySelector('.pv').getBoundingClientRect();
      return r.width>400 && r.height>300;}));
 ck('presenter notes are visible on screen, not just in the DOM',
    await pv.evaluate(()=>{const n=document.getElementById('pvNotes');
      const r=n.getBoundingClientRect();
      return r.width>100 && r.height>50 && n.textContent.trim().length>60;}));
 ck('presenter clock is running',
    await pv.evaluate(()=>/^\d\d:\d\d$/.test(document.getElementById('pvClock').textContent)));
 ck('presenter shows no visible slide image',
    await pv.evaluate(()=>[...document.querySelectorAll('.slide img')]
      .every(i=>i.getBoundingClientRect().width===0)));
 ck('class deck never shows the presenter panel',
    await deck.evaluate(()=>getComputedStyle(document.querySelector('.pv')).display)==='none');

 await pv.screenshot({path:'pv-presenter.png'});
 await deck.screenshot({path:'pv-deck.png'});
 console.log('\npageerrors:',errs.length,errs.slice(0,3));
 console.log(`${P} passed, ${F} failed`);
 await b.close(); s.close(); process.exit(F||errs.length?1:0);
})();
