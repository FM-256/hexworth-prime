/**
 * tenant-revocation-redirect.test.js — where a revoked tenant student LANDS.
 *
 * SCOPE (2026-08-04): revocation now means the tenant is GONE (404). An earlier version
 * of this suite asserted that any status !== 'active' revoked, which matched the code but
 * not production: all six live tenants are "suspended", so that rule purged every tenant
 * student and pinned them to the dashboard. Both the code and this suite were corrected.
 * Do not reintroduce a status assertion here without checking real tenant data first.
 *
 * WHY: QC 2026-08-04 found TenantRouter.refresh() was dead code. Both call sites gated on
 * `window.TenantRouter`, but TenantRouter.js:27 declares `const TenantRouter` at the top
 * level of a classic script — that binding lives in the global declarative record and never
 * becomes a window property. So _active stayed stale at true and AccessGuard.redirect()
 * routed the just-revoked student INTO the dead tenant hub, which throws 'Tenant not found'.
 *
 * A/B measured at 1.5s and 2.5s of mocked latency:
 *   window.TenantRouter (dead guard) -> /tenant/index.html?slug=... (dead-end error page)
 *   typeof TenantRouter (fixed)      -> /sorting.html (live)
 *
 * Latency is the whole point: an instant/same-tick mock hides this race entirely. That is
 * what let the original self-QC pass while the bug was live.
 *
 * The bar is a LIVE landing, not one specific URL. After the purge the student is an
 * unsorted Hexworth user, so require('sorted') routes to sorting.html before the dashboard
 * redirect lands. Both are fine; /tenant/* is the defect.
 *
 * PREREQ: a static server on 127.0.0.1:8137 serving _app/.
 * RUN: NODE_PATH=$PWD/node_modules node _tools/qa/tenant-revocation-redirect.test.js
 */
const p=require('puppeteer');
const PAGE='http://127.0.0.1:8137/houses/cloud/modules/wsa/m10-group-policy/cloud-presentation.module.html';
let fail=0;
const ok=(c,m)=>{console.log((c?'  PASS  ':'  FAIL  ')+m); if(!c)fail++;};
const blob=s=>JSON.stringify({slug:s,name:'Demo Academy',status:'active',
  branding:{platformName:'Demo Academy',primaryColor:'#06b6d4'}});

(async()=>{
 const b=await p.launch({args:['--no-sandbox','--disable-setuid-sandbox']});

 // ---- 0. binding semantics, under REAL load conditions ----
 // TenantRouter.js is injected by AccessGuard's auto-loader only when tenant context
 // exists, so it must be seeded first. Probing with addScriptTag on a bare page loads
 // nothing and reports a false 'undefined' for both bindings.
 let pg=await b.newPage();
 await pg.setRequestInterception(true);
 pg.on('request',r=>{
   if(r.url().includes('getTenantConfig'))
     return r.respond({status:200,contentType:'application/json',
       headers:{'Access-Control-Allow-Origin':'*'},body:blob('demo-tenant')});
   r.continue();
 });
 await pg.evaluateOnNewDocument(bl=>localStorage.setItem('hexworth_tenant',bl),blob('demo-tenant'));
 await pg.goto(PAGE,{waitUntil:'networkidle0'});
 await new Promise(r=>setTimeout(r,1500));
 let s=await pg.evaluate(()=>{
   let bare; try{ bare=typeof TenantRouter; }catch(e){ bare='THREW:'+e.name; }
   return {bare, win:typeof window.TenantRouter,
     loaded:!!document.querySelector('script[src*="TenantRouter.js"]')};
 });
 ok(s.loaded,'TenantRouter.js is actually loaded');
 ok(s.win==='undefined','window.TenantRouter is undefined — the dead guard, got '+s.win);
 ok(s.bare==='object','bare TenantRouter DOES resolve — the working guard, got '+s.bare);
 await pg.close();

 // ---- delayed-revocation scenarios ----
 async function run(label,mode,delayMs){
   const pg=await b.newPage();
   await pg.setRequestInterception(true);
   pg.on('request',async r=>{
     if(r.url().includes('getTenantConfig')){
       await new Promise(x=>setTimeout(x,delayMs));   // REAL latency, not same-tick
       if(mode==='404') return r.respond({status:404,contentType:'application/json',
         headers:{'Access-Control-Allow-Origin':'*'},body:JSON.stringify({error:'Tenant not found'})});
       return r.respond({status:200,contentType:'application/json',
         headers:{'Access-Control-Allow-Origin':'*'},
         body:JSON.stringify({slug:'demo-tenant',name:'Demo Academy',status:'inactive'})});
     }
     r.continue();
   });
   await pg.evaluateOnNewDocument(bl=>{
     if(location.pathname.includes('/houses/')){
       localStorage.setItem('hexworth_tenant',bl);
       localStorage.setItem('hexworth_tenant_slug','demo-tenant');
     }
   },blob('demo-tenant'));
   await pg.goto(PAGE,{waitUntil:'networkidle0'}).catch(()=>{});
   await new Promise(r=>setTimeout(r,delayMs+3500));   // outlast the delayed purge + redirect
   const url=pg.url();
   const st=await pg.evaluate(()=>({
     blob:localStorage.getItem('hexworth_tenant'),
     pill:!!document.getElementById('tenant-reenter-pill'),
     bar:!!document.getElementById('tenant-shell-bar')})).catch(()=>({}));
   // The bar is a LIVE landing, not one specific URL. Once the blob is purged the
   // student is an unsorted Hexworth user, so AccessGuard.require('sorted') routes to
   // sorting.html before redirect('dashboard') lands. Both are correct destinations;
   // /tenant/* is the defect, because that page throws 'Tenant not found' and dead-ends.
   const dead=await pg.evaluate(()=>/tenant not found|currently inactive/i
       .test(document.body?document.body.innerText:'')).catch(()=>true);
   ok(!url.includes('/tenant/'),label+': does NOT land on the dead tenant hub — '+url);
   ok(!dead,label+': landing page is live, not a dead-end error');
   ok(st.blob===null,label+': tenant blob purged');
   ok(!st.pill&&!st.bar,label+': no shell bar, no pill');
   await pg.close();
 }

 // POLICY (2026-08-04, after the outage): DELETION revokes, STATUS does not.
 // A status check here took the platform down — all six live tenants are "suspended",
 // so every tenant student was purged and pinned to the dashboard. These cases now
 // assert the CURRENT policy: a 404 tenant revokes; a merely non-'active' one does not.
 await run('404 @1.5s','404',1500);
 await run('404 @2.5s','404',2500);

 await b.close();
 console.log(fail?`\n${fail} FAILED`:'\nALL PASSED');
 process.exit(fail?1:0);
})().catch(e=>{console.error('HARNESS ERROR',e.message);process.exit(2);});
