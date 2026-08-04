/**
 * tenant-real-endpoint.test.js — the test that would have prevented the 2026-08-04 outage.
 *
 * NOTHING HERE IS MOCKED. It seeds a real production tenant slug and lets the page call the
 * real getTenantConfig. That is the entire point.
 *
 * The outage: 4655affae revoked any tenant whose status was not 'active'. Every test written
 * for it mocked getTenantConfig and asserted the mock, so the suite confirmed the shape I
 * assumed instead of the shape production has. All six live tenants are "suspended", so on
 * deploy every tenant student was purged and redirected — unable to leave the dashboard.
 * One unmocked call against any live slug would have shown it instantly.
 *
 * Keep this pointed at real slugs. If a tenant is renamed or removed, update SLUGS rather
 * than mocking the response.
 *
 * RUN (local build):      NODE_PATH=$PWD/node_modules node _tools/qa/tenant-real-endpoint.test.js
 * RUN (production):  BASE=https://hexworth.com NODE_PATH=$PWD/node_modules node _tools/qa/tenant-real-endpoint.test.js
 */
const p=require('puppeteer');
const BASE=process.env.BASE||'http://127.0.0.1:8137';
const PAGE=BASE+'/houses/cloud/modules/wsa/m10-group-policy/cloud-presentation.module.html';
let fail=0; const ok=(c,m)=>{console.log((c?'  PASS  ':'  FAIL  ')+m);if(!c)fail++;};
// REAL production tenants. All six are status "suspended" — NO MOCKING.
const SLUGS=['dr-norfleet','faculty-testing-primus','infosecethics-may-2026',
             'python-april-2026','summer-2026','test-x'];
(async()=>{
 const b=await p.launch({args:['--no-sandbox','--disable-setuid-sandbox']});
 for(const slug of SLUGS){
   const ctx=await (b.createBrowserContext?b.createBrowserContext():b.createIncognitoBrowserContext());
   const pg=await ctx.newPage();
   await pg.evaluateOnNewDocument(s=>{
     localStorage.setItem('hexworth_tenant',JSON.stringify({slug:s,name:s,status:'active',
       branding:{platformName:s,primaryColor:'#06b6d4'}}));
   },slug);
   await pg.goto(PAGE,{waitUntil:'domcontentloaded'}).catch(()=>{});
   await new Promise(r=>setTimeout(r,4500));   // outlast the real round trip
   const s=await pg.evaluate(()=>({u:location.pathname,
     blob:!!localStorage.getItem('hexworth_tenant'),
     msg:sessionStorage.getItem('access_guard_message')}));
   const stuck=s.u.includes('dashboard')||s.u.includes('sorting');
   ok(!stuck && s.blob, `${slug.padEnd(24)} stays put, blob intact -> ${s.u}${s.msg?' ["'+s.msg+'"]':''}`);
   await ctx.close();
 }
 await b.close();
 console.log(fail?`\n${fail} FAILED`:'\nALL PASSED');
})().catch(e=>console.error('HARNESS',e.message));
