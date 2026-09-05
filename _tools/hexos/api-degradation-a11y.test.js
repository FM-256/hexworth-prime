#!/usr/bin/env node
/**
 * @catalog what    Hex OS under a MISBEHAVING sandbox API, plus the two a11y gaps no suite tested
 * @catalog run     node _tools/hexos/api-degradation-a11y.test.js
 * @catalog status  GATE
 *
 * Four defects, all reproduced by a reviewer against the real shell before being fixed. The common
 * thread in the first two: the shell trusted the server to send the shape it promised, and answered
 * confidently when it did not.
 *
 *   1. `(r && r.sandboxes) || []` accepted any TRUTHY value, so a dict instead of a list made
 *      rows.length undefined, `ps` said "nothing running", and `stop arctic` told the student to
 *      START ONE while their session was still consuming capacity. This file's own history records
 *      the response key drifting twice already (r.sessions, r.data), so it is not hypothetical.
 *      Note the first attempt at the fix warned and then fell through to the same false claim;
 *      warning about a lie while still telling it is not a fix, which is why the assertion here
 *      checks the false sentence is ABSENT rather than that a warning is present.
 *   2. A gateway HTML 502 reached the student as
 *      `Unexpected token '<', "<html><hea"... is not valid JSON`, because res.json() was called
 *      unconditionally. The surrounding code plainly intends a clean "the lab service is down"
 *      answer.
 *   3. `#out` had no role/aria-live, so a screen-reader user pressing Enter heard NOTHING back for
 *      any command. apps.html already marked its result count aria-live, so this was one question
 *      answered two ways across the two Hex OS pages.
 *   4. `#cmd` had `outline: 0` and no `:focus-visible` replacement, on the single input the whole
 *      product revolves around, while every other interactive element here has one.
 *
 * The mocks answer CORS preflight deliberately: a first version returned 502 to the OPTIONS request
 * too, so the browser reported "Failed to fetch" and the response body was never parsed, which made
 * the "no raw parser error" assertion pass for entirely the wrong reason.
 */
const http=require('http'),fs=require('fs'),path=require('path'),puppeteer=require('puppeteer');
const APP=path.resolve('/home/eq/ai-content/hexworth-prime/_app'),PORT=9487;
const MIME={'.html':'text/html','.js':'text/javascript','.json':'application/json','.css':'text/css','.webp':'image/webp'};
const srv=http.createServer((q,r)=>{let p=decodeURIComponent(q.url.split('?')[0]);if(p.endsWith('/'))p+='index.html';
 const f=path.join(APP,p);if(!f.startsWith(APP)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end();}
 r.writeHead(200,{'Content-Type':MIME[path.extname(f)]||'application/octet-stream'});r.end(fs.readFileSync(f));});
let pass=0,fail=0;
const chk=(l,c,d)=>{c?(pass++,console.log('  ok   '+l)):(fail++,console.log('  FAIL '+l+(d?'\n         '+String(d).slice(0,200):'')));};

async function boot(apiHandler){
 const b=await puppeteer.launch({headless:'new',args:['--no-sandbox']});
 const pg=await b.newPage(); const errs=[];
 pg.on('pageerror',e=>errs.push(e.message.split('\n')[0]));
 await pg.setRequestInterception(true);
 pg.on('request',r=>{const u=r.url();
  if(/AccessGuard\.js$/.test(u))return r.respond({status:200,contentType:'text/javascript',body:'window.AccessGuard={require(){},redirect(){}};'});
  if(/FirebaseAuth\.js$/.test(u))return r.respond({status:200,contentType:'text/javascript',body:'window.FirebaseAuth={waitForAuth(){return Promise.resolve({uid:"u"})},isSignedIn(){return true},getUser(){return {uid:"u"}},uid(){return "u"},signOut(){return Promise.resolve()},onAuthStateChanged(){},callFunction(){return Promise.resolve({})},getIdToken(){return Promise.resolve("t")},refreshToken(){return Promise.resolve("t")}};'});
  if(/sandbox\.hexworth\.tech/.test(u)) {
    const CORS={'access-control-allow-origin':'*','access-control-allow-headers':'*','access-control-allow-methods':'*'};
    if(r.method()==='OPTIONS') return r.respond({status:204,headers:CORS,body:''});
    return apiHandler(r,CORS);
  }
  if(!u.startsWith(`http://127.0.0.1:${PORT}`))return r.abort();
  r.continue();});
 await pg.goto(`http://127.0.0.1:${PORT}/hex/`,{waitUntil:'networkidle0',timeout:35000});
 await new Promise(r=>setTimeout(r,2000));
 return {b,pg,errs};
}
const run=async(pg,s)=>{await pg.evaluate(()=>{document.getElementById('out').innerHTML='';});
 await pg.click('#cmd'); await pg.type('#cmd',s); await pg.keyboard.press('Enter');
 await new Promise(r=>setTimeout(r,900));
 return pg.evaluate(()=>document.getElementById('out').innerText);};

srv.listen(PORT,'127.0.0.1',async()=>{
 // FIX 1: sandboxes is a truthy NON-ARRAY (a dict). Must NOT claim "nothing running".
 let {b,pg}=await boot((r,CORS)=>r.respond({status:200,headers:{...CORS,'content-type':'application/json'},
   body:JSON.stringify({sandboxes:{'sess-abc':{labId:'arctic',status:'running'}}})}));
 let o=await run(pg,'ps');
 chk('non-array sandboxes does NOT falsely report nothing running', /unexpected shape/i.test(o), o.slice(0,220));
 chk('  -> and does not tell the student to start a second session', !/nothing running\. run/i.test(o), o.slice(0,200));
 await b.close();

 // FIX 2: a gateway HTML 502. Must NOT leak a raw JSON parser error.
 ({b,pg}=await boot((r,CORS)=>r.respond({status:502,headers:{...CORS,'content-type':'text/html'},body:'<html><head><title>502</title></head><body>Bad Gateway</body></html>'})));
 o=await run(pg,'ps');
 chk('a 502 HTML page does not leak a raw JS parser error', !/Unexpected token|not valid JSON/i.test(o), o.slice(0,220));
 chk('  -> and reports the status the student can act on', /502/.test(o), o.slice(0,220));

 // FIX 3 + 4: accessibility, on the same booted page.
 const a11y=await pg.evaluate(()=>{
   const out=document.getElementById('out'), cmd=document.getElementById('cmd');
   cmd.focus();
   const cs=getComputedStyle(cmd);
   return { role:out.getAttribute('role'), live:out.getAttribute('aria-live'),
            label:out.getAttribute('aria-label'),
            focusRing: cs.outlineStyle+' '+cs.outlineWidth, focused: document.activeElement===cmd };
 });
 chk('output transcript is an aria-live log region', a11y.role==='log' && a11y.live==='polite', a11y);
 chk('  -> and is labelled for a screen reader', !!a11y.label, a11y);
 chk('the command input has a visible focus ring', a11y.focused && a11y.focusRing!=='none 0px', a11y);
 await b.close(); srv.close();
 console.log(`\n  ${pass} passed, ${fail} failed`);
 process.exitCode = fail?1:0;
});
