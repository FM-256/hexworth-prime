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
// poseAsInstructor() aborts the AccessGuard.js request, so the inline
// AccessGuard.require('instructor') call necessarily throws a ReferenceError on every
// page this suite opens. That one error is debris from the harness, not a defect in the
// deck — filter it EXACTLY, so any other page error still fails the run. The guard's
// presence in source is asserted separately above.
const GUARD_ABORT=/AccessGuard is not defined/;
const realErrs=a=>a.filter(e=>!GUARD_ABORT.test(e));
// Deck under test. Defaults to the merged all-chapters deck; pass a path to test a
// single chapter file instead (the seven un-merged chapters have no presenter view,
// so only cse-lecture-ch1.html and cse-lecture.html can pass this suite).
const DECK=process.argv[2]||'/houses/cloud/cse/instructor/cse-lecture.html';
const DECK_SRC=path.join(ROOT,DECK);
console.log('deck under test: '+DECK+'\n');
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
{const src=fs.readFileSync(DECK_SRC,'utf8');
  ck('deck still carries AccessGuard.require (not weakened by this work)',
     src.includes("AccessGuard.require('instructor')"));}
 // HTML WELL-FORMEDNESS. 18/18 passed with an orphaned </div> in the body,
 // because browsers silently drop a stray end tag — the DOM was right at
 // runtime while the source was not. This file is about to be copied into 8
 // chapters, so the malformed structure would have been copied 8 times.
 {const src=fs.readFileSync(DECK_SRC,'utf8');
  let body=src.slice(src.indexOf('<body>'), src.indexOf('</body>'));
  body=body.replace(/<script[\s\S]*?<\/script>/g,'').replace(/<!--[\s\S]*?-->/g,'');
  const o=(body.match(/<div\b/g)||[]).length, c=(body.match(/<\/div>/g)||[]).length;
  const so=(body.match(/<section\b/g)||[]).length, sc=(body.match(/<\/section>/g)||[]).length;
  ck('body div tags balance', o===c, `open=${o} close=${c}`);
  ck('body section tags balance', so===sc, `open=${so} close=${sc}`);}
 const total=await deck.evaluate(()=>document.querySelectorAll('.slide').length);
 ck('deck loads and finds slides', total>0, 'slides='+total);

 // advance the class deck to slide 4 BEFORE opening presenter
 await deck.evaluate(()=>{for(let k=0;k<3;k++)document.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowRight'}));});
 await new Promise(r=>setTimeout(r,300));
 ck('deck moved to slide 4', await cur(deck)===3);

 // Open presenter the way an instructor does: press P, and use the URL the deck
 // itself builds. Typing the presenter URL by hand would skip the pair token and
 // silently test an unpaired window — which is exactly how the pathname-collision
 // regression slipped past the assertions the first time.
 const pvUrl = await deck.evaluate(()=>{
   let captured=null; const real=window.open;
   // Return a truthy stub, not null: a null return sends the deck down its
   // popup-blocked branch and raises an alert() that would stall the harness.
   window.open=(u)=>{captured=u; return {focus(){}};};
   document.dispatchEvent(new KeyboardEvent('keydown',{key:'p'}));
   window.open=real; return captured;
 });
 ck('pressing P builds a presenter URL carrying the pair token',
    !!pvUrl && /[?&]pair=/.test(pvUrl) && /[?&]presenter=1/.test(pvUrl), pvUrl);
 ck('the presenter URL opens on the CURRENT slide, not slide 1',
    /[?&]i=3(&|$)/.test(pvUrl||''), pvUrl);

 const pv=await b.newPage(); await pv.setViewport({width:1100,height:760}); await poseAsInstructor(pv);
 pv.on('pageerror',e=>errs.push('PV: '+e.message));
 await pv.goto(base+pvUrl,{waitUntil:'domcontentloaded',timeout:45000});
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

 // ── CHAPTER NAVIGATION (merged all-chapters deck only) ───────────────────
 // Skipped for a single-chapter file so this suite still runs against ch1.
 const isMerged = await deck.evaluate(()=>document.querySelectorAll('[data-ch]').length>0);
 if (isMerged) {
   console.log('\n  -- chapter navigation --');
   // Every slide must declare a chapter. A slide with no data-ch would fall back to
   // chapter 1 in chapterOf() and silently mislabel the top bar mid-lecture.
   ck('every slide declares a chapter',
      await deck.evaluate(()=>[...document.querySelectorAll('.slide')]
        .every(s=>/^[1-8]$/.test(s.dataset.ch||''))));
   const perCh = await deck.evaluate(()=>{const m={};
     document.querySelectorAll('.slide').forEach(s=>{m[s.dataset.ch]=(m[s.dataset.ch]||0)+1;});return m;});
   ck('all 8 chapters present with the expected slide counts',
      JSON.stringify(perCh)===JSON.stringify({1:7,2:5,3:5,4:5,5:5,6:5,7:4,8:5}),
      JSON.stringify(perCh));
   ck('deck holds all 41 slides', total===41, 'slides='+total);

   // Exactly one slide visible at a time. With 41 slides in one file, a broken
   // .active rule would stack every chapter on top of the last.
   ck('exactly one slide is visible',
      await deck.evaluate(()=>[...document.querySelectorAll('.slide')]
        .filter(s=>s.getBoundingClientRect().height>0).length)===1);

   // C opens the menu, and it must list all eight.
   await deck.evaluate(()=>document.dispatchEvent(new KeyboardEvent('keydown',{key:'c'})));
   await new Promise(r=>setTimeout(r,300));
   ck('C opens the chapter menu',
      await deck.evaluate(()=>{const m=document.getElementById('chapMenu');
        return m.classList.contains('open') && m.getBoundingClientRect().height>200;}));
   ck('chapter menu lists 8 chapters',
      await deck.evaluate(()=>document.querySelectorAll('#chapList button').length)===8);

   // Jump to chapter 5 by pressing its number, the way you would mid-class.
   await deck.evaluate(()=>document.dispatchEvent(new KeyboardEvent('keydown',{key:'5'})));
   await new Promise(r=>setTimeout(r,500));
   ck('pressing 5 jumps to chapter 5 and closes the menu',
      await deck.evaluate(()=>{const a=document.querySelector('.slide.active');
        return a.dataset.ch==='5' && !document.getElementById('chapMenu').classList.contains('open');}),
      'landed on ch'+await deck.evaluate(()=>document.querySelector('.slide.active').dataset.ch));
   ck('the jump lands on that chapter COVER, not mid-chapter',
      await deck.evaluate(()=>!!document.querySelector('.slide.active').querySelector('h1')));
   ck('top bar names the chapter you are in',
      (await deck.evaluate(()=>document.getElementById('chapLabel').textContent))
        .includes('Chapter 5'),
      await deck.evaluate(()=>document.getElementById('chapLabel').textContent));
   ck('the chapter jump moved the PRESENTER window too',
      await deck.evaluate(()=>[...document.querySelectorAll('.slide')].findIndex(s=>s.classList.contains('active')))
      === await cur(pv));
   ck('presenter names the chapter, not just a slide number',
      (await pv.evaluate(()=>document.getElementById('pvPos').textContent)).includes('Ch 5'),
      await pv.evaluate(()=>document.getElementById('pvPos').textContent));

   // ?ch=N deep link — this is how the instructor index links each chapter.
   const dl=await b.newPage(); await dl.setViewport({width:1280,height:720}); await poseAsInstructor(dl);
   const dlErrs=[]; dl.on('pageerror',e=>dlErrs.push('DEEPLINK: '+e.message));
   await dl.goto(base+DECK+'?ch=7',{waitUntil:'domcontentloaded',timeout:45000});
   await new Promise(r=>setTimeout(r,1000));
   ck('?ch=7 opens the deck AT chapter 7',
      await dl.evaluate(()=>document.querySelector('.slide.active').dataset.ch)==='7');
   ck('deep link renders a visible slide (not a blank deck)',
      await dl.evaluate(()=>{const a=document.querySelector('.slide.active').getBoundingClientRect();
        return a.width>400 && a.height>200;}));
   ck('deep link produced no page errors', realErrs(dlErrs).length===0, realErrs(dlErrs).slice(0,2).join('; '));
   await dl.close();

   // The presenter window must not carry the class-facing chapter menu.
   ck('presenter window never shows the chapter menu',
      await pv.evaluate(()=>{const m=document.getElementById('chapMenu');
        if(!m) return true; const r=m.getBoundingClientRect();
        return r.width===0||r.height===0;}));

   // ── PAIR ISOLATION ────────────────────────────────────────────────────
   // The regression the merge introduced: with eight chapters in ONE file every
   // window shares a pathname, so a pathname-keyed channel let ANY third window
   // drive the projected deck. This is the check that catches it — a second deck
   // window navigates, and the established pair must not budge. The screenshots,
   // not the assertions, are what exposed this the first time.
   const deckAt = await cur(deck), pvAt = await cur(pv);
   const intruder=await b.newPage(); await intruder.setViewport({width:1280,height:720});
   await poseAsInstructor(intruder);
   await intruder.goto(base+DECK+'?ch=2',{waitUntil:'domcontentloaded',timeout:45000});
   await new Promise(r=>setTimeout(r,700));
   await intruder.evaluate(()=>{for(let k=0;k<3;k++)
     document.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowRight'}));});
   await new Promise(r=>setTimeout(r,900));
   ck('a SECOND deck window cannot move the established class deck',
      await cur(deck)===deckAt, 'was '+deckAt+' now '+await cur(deck));
   ck('a SECOND deck window cannot hijack the presenter window',
      await cur(pv)===pvAt, 'was '+pvAt+' now '+await cur(pv));
   // ...and the pair must still work after the intruder has been talking.
   await pv.evaluate(()=>document.getElementById('pvNext2').click());
   await new Promise(r=>setTimeout(r,700));
   ck('the real pair still syncs after an intruder window existed',
      await cur(deck)===deckAt+1 && await cur(pv)===deckAt+1,
      'deck='+await cur(deck)+' pv='+await cur(pv));
   await intruder.close();

   // Chris blocked the original deploy on this: mirrored displays put the notes on
   // the projector, and no API can detect it. Assert the warning is really on screen.
   ck('presenter carries a visible mirror-mode warning',
      await pv.evaluate(()=>{const w=document.querySelector('.pv-warn');
        if(!w) return false; const r=w.getBoundingClientRect();
        return r.width>200 && r.height>10 && /mirror/i.test(w.textContent);}));
 }

 await pv.screenshot({path:'pv-presenter.png'});
 await deck.screenshot({path:'pv-deck.png'});
 // Report both: the filtered count is what gates the run, the raw count is printed so
 // a suppressed error can never become invisible.
 console.log('\npageerrors:',realErrs(errs).length,realErrs(errs).slice(0,3),
             `(${errs.length-realErrs(errs).length} AccessGuard-abort errors suppressed by the harness)`);
 console.log(`${P} passed, ${F} failed`);
 await b.close(); s.close(); process.exit(F||realErrs(errs).length?1:0);
})();
