// Self-verify harness for ObservatoryTelemetry.js (Phase 1 completion + Phase 2 behavioral).
// Proves: content_complete still fires (no Phase 1 regression); page_view + device on init;
// client_error on a JS error; and the redesigned session_end: a tab-switch
// (visibilitychange:hidden) sends an interim snapshot and the REAL leave (pagehide) sends a
// larger final one, SAME sessionId, monotonic duration, with no permanent silencing. With NO
// signed-in user the lib is a fully silent no-op.
const fs=require('fs'),path=require('path'),http=require('http'),pup=require('puppeteer');
const LIB=fs.readFileSync(path.resolve('_app/components/ObservatoryTelemetry.js'),'utf8');
const ENDPOINT='https://us-central1-hexworth-prime.cloudfunctions.net/logObservatoryEvent';
const srv=http.createServer((q,s)=>{s.writeHead(200,{'Content-Type':'text/html'});s.end('<!doctype html><html><head></head><body>harness</body></html>');});
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

  await browser.close();await new Promise(r=>srv.close(r));
  console.log(pass?'\n*** OBSERVATORY TELEMETRY CHECK OK ***':'\n*** CHECK FAILED ***');
  process.exit(pass?0:1);
})();
