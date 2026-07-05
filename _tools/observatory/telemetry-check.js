// Self-verify harness for ObservatoryTelemetry.js (Phase 1 completion + Phase 2 behavioral).
// Proves: content_complete still fires (no Phase 1 regression); page_view + device on init;
// client_error on a JS error; and the redesigned session_end: a tab-switch
// (visibilitychange:hidden) sends an interim snapshot and the REAL leave (pagehide) sends a
// larger final one, SAME sessionId, monotonic duration, with no permanent silencing. With NO
// signed-in user the lib is a fully silent no-op.
const fs=require('fs'),path=require('path'),http=require('http'),pup=require('puppeteer');
const LIB=fs.readFileSync(path.resolve('_app/components/ObservatoryTelemetry.js'),'utf8');
const ENDPOINT='https://us-central1-hexworth-prime.cloudfunctions.net/logObservatoryEvent';
// Stub FirebaseAuth served at /components/FirebaseAuth.js so we can prove the lib's
// self-load path: a page with no FirebaseAuth pulls this in and then captures.
const SELF_LOAD_AUTH='window.FirebaseAuth={waitForAuth:async function(){return {uid:"self-load-stu"};},refreshToken:async function(){return "self-loaded-token";}};';
const srv=http.createServer((q,s)=>{
  if(q.url.indexOf('/components/FirebaseAuth.js')===0){s.writeHead(200,{'Content-Type':'text/javascript'});s.end(SELF_LOAD_AUTH);return;}
  s.writeHead(200,{'Content-Type':'text/html'});s.end('<!doctype html><html><head></head><body>harness</body></html>');
});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));

async function setup(browser,port,user){
  const pg=await browser.newPage();const errs=[];
  pg.on('pageerror',e=>errs.push(String(e.message).slice(0,140)));
  await pg.goto('http://localhost:'+port+'/',{waitUntil:'domcontentloaded'});
  await pg.evaluate((u)=>{
    window.__beacons=[];
    navigator.sendBeacon=function(url,blob){window.__beacons.push({url,_blob:blob});return true;};
    window.FirebaseAuth={waitForAuth:async function(){return u;},refreshToken:async function(){return u?'stub-id-token':null;}};
    window.localStorage.setItem('observatory_consent_'+(u?u.uid:'x'),JSON.stringify({classId:'summer-2026-aplus'}));
  },user);
  await pg.addScriptTag({content:LIB});
  await sleep(350);
  return {pg,errs};
}
async function readBeacons(pg){
  return pg.evaluate(async()=>{const out=[];for(const b of window.__beacons){let body=null;try{body=JSON.parse(await b._blob.text());}catch(e){body={_e:1};}out.push({url:b.url,body});}return out;});
}
async function setVis(pg,state){
  await pg.evaluate((s)=>{Object.defineProperty(document,'visibilityState',{configurable:true,get:()=>s});document.dispatchEvent(new Event('visibilitychange'));},state);
}

(async()=>{
  await new Promise(r=>srv.listen(0,r));const port=srv.address().port;
  const browser=await pup.launch({headless:'new',args:['--no-sandbox']});
  let pass=true;const check=(c,m)=>{console.log((c?'  OK   ':'  FAIL ')+m);if(!c)pass=false;};
  const types=bs=>bs.map(b=>b.body&&b.body.type);

  // Scenario A: signed-in. Completions + error, then tab-switch -> return -> real leave.
  const A=await setup(browser,port,{uid:'stu-123'});
  await A.pg.evaluate(()=>{['forge-ch01-motherboards','forge-aplus-core1-prep-r1'].forEach((id,i)=>window.dispatchEvent(new CustomEvent('completionStamp:marked',{detail:{moduleId:id,score:i?88:null}})));});
  await A.pg.evaluate(()=>window.dispatchEvent(new ErrorEvent('error',{message:'boom test',filename:'/x.js'})));
  await sleep(1200);
  await setVis(A.pg,'hidden');           // tab-switch away -> interim session_end
  await sleep(50);
  await setVis(A.pg,'visible');          // come back (no send)
  await sleep(1200);
  await A.pg.evaluate(()=>window.dispatchEvent(new Event('pagehide')));  // real leave -> final session_end
  await sleep(150);
  const bA=await readBeacons(A.pg);const tA=types(bA);
  console.log('Scenario A types =',JSON.stringify(tA));
  check(A.errs.length===0,'no page errors ('+(A.errs[0]||'none')+')');
  check(tA.filter(t=>t==='page_view').length===1,'page_view on init x1');
  check(tA.filter(t=>t==='device').length===1,'device on init x1');
  check(tA.filter(t=>t==='content_complete').length===2,'content_complete x2 (Phase 1 intact)');
  const q=bA.find(b=>b.body.type==='content_complete'&&b.body.payload.moduleId==='forge-aplus-core1-prep-r1');
  check(q&&q.body.payload.score===88,'quiz content_complete score=88');
  check(tA.filter(t=>t==='client_error').length===1,'client_error x1');
  const ses=bA.filter(b=>b.body.type==='session_end').map(b=>b.body.payload);
  check(ses.length===2,'session_end fired TWICE (tab-switch snapshot + real leave), got '+ses.length);
  check(ses.length===2&&ses[0].sessionId&&ses[0].sessionId===ses[1].sessionId,'both session_end share one sessionId (not permanently silenced)');
  check(ses.length===2&&ses[1].durationSec>ses[0].durationSec,'final session duration > interim (no lost time): '+JSON.stringify(ses.map(s=>s.durationSec)));
  check(ses.every(s=>Number.isFinite(s.activeSec)&&Number.isFinite(s.maxScrollPct)),'session_end carries active + scroll');
  check(bA.every(b=>b.url===ENDPOINT&&b.body.idToken==='stub-id-token'&&b.body.classId==='summer-2026-aplus'),'all beacons: endpoint+token+classId');
  await A.pg.close();

  // Scenario B: no user -> total silence, even after a leave.
  const B=await setup(browser,port,null);
  await B.pg.evaluate(()=>{window.dispatchEvent(new CustomEvent('completionStamp:marked',{detail:{moduleId:'x'}}));window.dispatchEvent(new Event('pagehide'));});
  await setVis(B.pg,'hidden');await sleep(120);
  const bB=await readBeacons(B.pg);
  console.log('Scenario B (no user): beacons =',bB.length);
  check(bB.length===0,'ZERO beacons of any type without a signed-in user');
  check(B.errs.length===0,'no page errors');
  await B.pg.close();

  // Scenario C: malformed completion ignored (page_view/device still fire).
  const C=await setup(browser,port,{uid:'stu-9'});
  await C.pg.evaluate(()=>{window.dispatchEvent(new CustomEvent('completionStamp:marked',{detail:{score:50}}));window.dispatchEvent(new CustomEvent('completionStamp:marked',{detail:{moduleId:''}}));});
  await sleep(120);
  const bC=await readBeacons(C.pg);
  console.log('Scenario C types =',JSON.stringify(types(bC)));
  check(types(bC).filter(t=>t==='content_complete').length===0,'no content_complete for moduleId-less events');
  await C.pg.close();

  // Scenario D: SELF-LOAD. The page has NO FirebaseAuth; the lib must lazy-load
  // /components/FirebaseAuth.js (served by the harness) and then capture. Proves the single
  // telemetry tag is self-sufficient on a page with no separate auth include.
  const D=await browser.newPage();const dErrs=[];
  D.on('pageerror',e=>dErrs.push(String(e.message).slice(0,140)));
  await D.goto('http://localhost:'+port+'/',{waitUntil:'domcontentloaded'});
  await D.evaluate(()=>{
    window.__beacons=[];
    navigator.sendBeacon=function(url,blob){window.__beacons.push({url,_blob:blob});return true;};
    // A cached signed-in user is the cost gate's trigger; set it, but do NOT define
    // window.FirebaseAuth - the lib must fetch FirebaseAuth.js itself.
    window.localStorage.setItem('hexworth_firebase_user',JSON.stringify({uid:'self-load-stu',isAnonymous:false}));
  });
  await D.addScriptTag({content:LIB});
  await sleep(500);
  const bD=await readBeacons(D);const tD=bD.map(b=>b.body&&b.body.type);
  console.log('Scenario D (self-load) types =',JSON.stringify(tD));
  check(await D.evaluate(()=>typeof FirebaseAuth!=='undefined'),'lib lazy-loaded FirebaseAuth on a page that lacked it');
  check(tD.indexOf('page_view')!==-1,'behavioral capture works after self-load (page_view emitted)');
  check(bD.length>0 && bD.every(b=>b.body.idToken==='self-loaded-token' && b.body.type),'self-loaded beacons carry the self-loaded token');
  check(await D.evaluate(()=>document.querySelectorAll('script[src*="/components/FirebaseAuth.js"]').length)===1,'exactly ONE FirebaseAuth.js tag injected (no duplicate)');
  check(dErrs.length===0,'no page errors during self-load ('+(dErrs[0]||'none')+')');
  await D.close();

  // Scenario E: GUARD. A FirebaseAuth.js tag is ALREADY on the page (e.g. statically
  // included, or appended by another loader) when the lib runs. The lib must NOT append a
  // second one (a duplicate would re-run FirebaseAuth's top-level const and throw). Proves
  // loadScriptOnce's querySelector guard branch - the exact branch tied to the ModuleProgress
  // collision Nancy flagged.
  const E=await browser.newPage();const eErrs=[];
  E.on('pageerror',e=>eErrs.push(String(e.message).slice(0,140)));
  await E.goto('http://localhost:'+port+'/',{waitUntil:'domcontentloaded'});
  await E.evaluate(()=>{
    window.__beacons=[];
    navigator.sendBeacon=function(url,blob){window.__beacons.push({url,_blob:blob});return true;};
    window.localStorage.setItem('hexworth_firebase_user',JSON.stringify({uid:'e-stu',isAnonymous:false}));
    // Pre-plant a FirebaseAuth.js tag before the lib runs.
    var s=document.createElement('script');s.src='/components/FirebaseAuth.js';document.head.appendChild(s);
  });
  await E.addScriptTag({content:LIB});
  await sleep(400);
  // Simulate a second guarded loader (as ModuleProgress now is) also trying to load it.
  const eAppended=await E.evaluate(()=>{ if(!document.querySelector('script[src*="FirebaseAuth.js"]')){var s=document.createElement('script');s.src='/components/FirebaseAuth.js';document.head.appendChild(s);return true;} return false; });
  await sleep(100);
  const eTags=await E.evaluate(()=>document.querySelectorAll('script[src*="/components/FirebaseAuth.js"]').length);
  console.log('Scenario E (guard): FirebaseAuth.js tags =',eTags,' second-loader-appended =',eAppended);
  check(eTags===1,'lib did NOT append a duplicate FirebaseAuth.js when one already existed');
  check(eAppended===false,'a second guarded loader also skips (no duplicate tag, no const redeclaration)');
  check(eErrs.length===0,'no SyntaxError / page error with a pre-existing tag ('+(eErrs[0]||'none')+')');
  await E.close();

  // Scenario F: COST GATE. No cached signed-in user and no FirebaseAuth on the page. The lib
  // must stay fully inert: it must NOT fetch FirebaseAuth.js / the Firebase SDK at all, so a
  // public/never-signed-in visitor pays zero third-party cost (Nancy cost review).
  const F=await browser.newPage();
  await F.goto('http://localhost:'+port+'/',{waitUntil:'domcontentloaded'});
  await F.evaluate(()=>{
    window.__beacons=[];
    navigator.sendBeacon=function(url,blob){window.__beacons.push({url,_blob:blob});return true;};
    try{window.localStorage.removeItem('hexworth_firebase_user');}catch(e){}
  });
  await F.addScriptTag({content:LIB});
  await sleep(300);
  const fTags=await F.evaluate(()=>document.querySelectorAll('script[src*="FirebaseAuth.js"]').length);
  const fBeacons=await F.evaluate(()=>window.__beacons.length);
  console.log('Scenario F (cost gate): FirebaseAuth.js tags =',fTags,' beacons =',fBeacons);
  check(fTags===0,'NO FirebaseAuth.js loaded for a visitor with no cached signed-in user (zero cost)');
  check(fBeacons===0,'no beacons without a signed-in hint');
  await F.close();

  await browser.close();await new Promise(r=>srv.close(r));
  console.log(pass?'\n*** OBSERVATORY TELEMETRY CHECK OK ***':'\n*** CHECK FAILED ***');
  process.exit(pass?0:1);
})();
