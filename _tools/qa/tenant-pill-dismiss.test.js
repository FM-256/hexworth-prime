/**
 * tenant-pill-dismiss.test.js — the manual "remove the pill" control (TenantShell.js).
 *
 * WHY: operator, 2026-08-04: "the pill stay on the screen even after class is done, or the
 * tennant deactivated or the user removed from tennant" / "we need to have a way to remove
 * the pills". Two of those three cases have no unauthenticated signal reachable from a
 * content page, so a manual control is the only mechanism that closes them.
 *
 * The control is DESTRUCTIVE: the tenant blob doubles as an access credential that
 * AccessGuard.js re-reads on every require() call, and 81 of the 96 pages loading
 * TenantShell call require(). So the suite asserts the confirm gate in BOTH directions —
 * cancel must leave blob and pill intact, confirm must purge and route to the lobby. That
 * opposition is what makes the suite falsifiable rather than vacuous.
 *
 * PREREQ: a static server on 127.0.0.1:8137 serving _app/.
 * RUN: NODE_PATH=$PWD/node_modules node _tools/qa/tenant-pill-dismiss.test.js
 */
const p=require('puppeteer');
const URL='http://127.0.0.1:8137/houses/cloud/modules/wsa/m10-group-policy/cloud-presentation.module.html';
const BLOB=JSON.stringify({slug:'demo-tenant',name:'Demo Academy',status:'active',
  branding:{platformName:'Demo Academy',primaryColor:'#06b6d4'}});
let fail=0;
const ok=(c,m)=>{console.log((c?'  PASS  ':'  FAIL  ')+m); if(!c)fail++;};

(async()=>{
 const b=await p.launch({args:['--no-sandbox','--disable-setuid-sandbox']});

 async function boot(confirmAnswer){
   const pg=await b.newPage();
   await pg.setRequestInterception(true);
   pg.on('request',r=>{
     if(r.url().includes('getTenantConfig'))
       return r.respond({status:200,contentType:'application/json',
         headers:{'Access-Control-Allow-Origin':'*'},body:BLOB});
     r.continue();
   });
   await pg.evaluateOnNewDocument((blob,ans)=>{
     // Seed ONLY on the content page. This hook re-fires on every navigation, so
     // re-seeding after the purge would overwrite the very state under test and
     // report a false failure on the lobby page we land on.
     if(!location.pathname.includes('lobby')){
     localStorage.setItem('hexworth_tenant',blob);
     localStorage.setItem('hexworth_tenant_slug','demo-tenant');
     localStorage.setItem('hexworth_tenant_shell_hidden','true');
     }
     window.__confirms=[];
     window.confirm=(m)=>{window.__confirms.push(m); return ans;};
   },BLOB,confirmAnswer);
   await pg.goto(URL,{waitUntil:'networkidle0'});
   await new Promise(r=>setTimeout(r,1200));
   return pg;
 }

 // ---- render + hidden-by-default ----
 let pg=await boot(true);
 let s=await pg.evaluate(()=>{
   const d=document.getElementById('tenant-pill-dismiss');
   const pl=document.getElementById('tenant-reenter-pill');
   return {pill:!!pl,dis:!!d,
     op:d&&getComputedStyle(d).opacity, pe:d&&getComputedStyle(d).pointerEvents,
     nested:!!(pl&&pl.querySelector('button')),
     tag:d&&d.tagName};
 });
 ok(s.pill,'re-enter pill renders');
 ok(s.dis,'dismiss badge renders');
 ok(s.tag==='BUTTON','dismiss is a <button>');
 ok(!s.nested,'dismiss is NOT nested inside the pill button (valid HTML)');
 ok(s.op==='0','dismiss starts invisible (opacity 0), got '+s.op);
 ok(s.pe==='none','dismiss is unclickable while invisible, got '+s.pe);

 // ---- reveal on hover ----
 await pg.hover('#tenant-reenter-pill');
 await new Promise(r=>setTimeout(r,350));
 s=await pg.evaluate(()=>{const d=document.getElementById('tenant-pill-dismiss');
   return {op:getComputedStyle(d).opacity,pe:getComputedStyle(d).pointerEvents};});
 ok(s.op==='1','hovering the pill reveals the dismiss badge');
 ok(s.pe==='auto','revealed badge is clickable');

 // ---- geometry: badge on the pill's top-right corner, on screen ----
 s=await pg.evaluate(()=>{
   const a=document.getElementById('tenant-reenter-pill').getBoundingClientRect();
   const c=document.getElementById('tenant-pill-dismiss').getBoundingClientRect();
   return {ov:!(c.right<a.left||c.left>a.right||c.bottom<a.top||c.top>a.bottom),
     inView:c.top>=0&&c.left>=0&&c.right<=innerWidth&&c.bottom<=innerHeight};
 });
 ok(s.ov,'badge overlaps the pill corner');
 ok(s.inView,'badge is fully on screen');

 // ---- CANCEL leaves everything intact ----
 await pg.close();
 pg=await boot(false);
 await pg.hover('#tenant-reenter-pill');
 await new Promise(r=>setTimeout(r,300));
 await pg.click('#tenant-pill-dismiss');
 await new Promise(r=>setTimeout(r,700));
 s=await pg.evaluate(()=>({blob:!!localStorage.getItem('hexworth_tenant'),
   pill:!!document.getElementById('tenant-reenter-pill'),
   asked:window.__confirms.length,url:location.pathname}));
 ok(s.asked===1,'cancel path asked for confirmation once, got '+s.asked);
 ok(s.blob,'CANCEL keeps the tenant blob (no access revocation)');
 ok(s.pill,'CANCEL keeps the pill');
 ok(!s.url.includes('lobby'),'CANCEL does not navigate');

 // ---- CONFIRM purges and routes to lobby ----
 await pg.close();
 pg=await boot(true);
 await pg.hover('#tenant-reenter-pill');
 await new Promise(r=>setTimeout(r,300));
 const nav=pg.waitForNavigation({timeout:8000}).catch(()=>null);
 await pg.click('#tenant-pill-dismiss');
 await nav;
 await new Promise(r=>setTimeout(r,600));
 s=await pg.evaluate(()=>({
   blob:localStorage.getItem('hexworth_tenant'),
   slug:localStorage.getItem('hexworth_tenant_slug'),
   hidden:localStorage.getItem('hexworth_tenant_shell_hidden'),
   sess:sessionStorage.getItem('hexworth_tenant'),
   pill:!!document.getElementById('tenant-reenter-pill'),
   dis:!!document.getElementById('tenant-pill-dismiss'),
   url:location.pathname}));
 ok(s.blob===null,'CONFIRM purges localStorage blob');
 ok(s.slug===null,'CONFIRM purges tenant slug');
 ok(s.hidden===null,'CONFIRM clears the shell-hidden flag');
 ok(s.sess===null,'CONFIRM purges sessionStorage blob');
 ok(!s.pill&&!s.dis,'CONFIRM removes pill and badge from the DOM');
 ok(s.url.includes('lobby'),'CONFIRM routes to the lobby (a way back in), at '+s.url);

 await b.close();
 console.log(fail?`\n${fail} FAILED`:'\nALL PASSED');
 process.exit(fail?1:0);
})().catch(e=>{console.error('HARNESS ERROR',e.message);process.exit(2);});
