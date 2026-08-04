/**
 * tenant-white-label-separation.test.js — the two actions must stay separate.
 *
 * A tenant is WHITE-LABEL ACCESS: a branded wrapper over Hexworth. Ending the wrapper and
 * ending someone's Hexworth access are unrelated events. Operator, 2026-08-04: "what you did
 * is kill access to hexworth, instead of killing the tennant. 2 unrelated actions."
 *
 * So a suspended tenant must produce BOTH of these at once, and this suite asserts both:
 *   WRAPPER GONE  — no shell bar, no re-enter pill, no branding
 *   ACCESS KEPT   — blob intact, no redirect, the student keeps browsing Hexworth unbranded
 *
 * Nothing is mocked. It uses the six real production slugs, all of which are status
 * "suspended" — the exact data that broke the first implementation, which deleted the blob
 * and thereby cost every white-label student the AccessGuard bypass and pinned them to the
 * dashboard. Asserting only one half of this is what allowed that to ship.
 *
 * RUN (local):       NODE_PATH=$PWD/node_modules node _tools/qa/tenant-white-label-separation.test.js
 * RUN (production):  BASE=https://hexworth.com NODE_PATH=$PWD/node_modules node _tools/qa/tenant-white-label-separation.test.js
 */
const p=require('puppeteer');
const BASE=process.env.BASE||'http://127.0.0.1:8137';
const PAGE=BASE+'/houses/cloud/modules/wsa/m10-group-policy/cloud-presentation.module.html';
let fail=0; const ok=(c,m)=>{console.log((c?'  PASS  ':'  FAIL  ')+m);if(!c)fail++;};
const SLUGS=['dr-norfleet','faculty-testing-primus','infosecethics-may-2026',
             'python-april-2026','summer-2026','test-x'];
(async()=>{
 const b=await p.launch({args:['--no-sandbox','--disable-setuid-sandbox']});
 for(const slug of SLUGS){
   const ctx=await (b.createBrowserContext?b.createBrowserContext():b.createIncognitoBrowserContext());
   const pg=await ctx.newPage();
   // shellHidden => the PILL branch renders, which is the thing the operator wants gone
   await pg.evaluateOnNewDocument(s=>{
     localStorage.setItem('hexworth_tenant',JSON.stringify({slug:s,name:s,status:'active',
       branding:{platformName:s,primaryColor:'#06b6d4'}}));
     localStorage.setItem('hexworth_tenant_shell_hidden','true');
   },slug);
   await pg.goto(PAGE,{waitUntil:'domcontentloaded'}).catch(()=>{});
   await new Promise(r=>setTimeout(r,4500));
   const s=await pg.evaluate(()=>({u:location.pathname,
     blob:!!localStorage.getItem('hexworth_tenant'),
     pill:!!document.getElementById('tenant-reenter-pill'),
     bar:!!document.getElementById('tenant-shell-bar'),
     len:(document.body?document.body.innerText:'').length}));
   const stuck=s.u.includes('dashboard')||s.u.includes('sorting');
   ok(!stuck,            `${slug.padEnd(24)} ACCESS kept (no redirect) -> ${s.u.split('/').pop()}`);
   ok(s.blob,            `${slug.padEnd(24)} blob intact (Hexworth access preserved)`);
   ok(!s.pill&&!s.bar,   `${slug.padEnd(24)} WRAPPER gone (no pill, no bar)`);
   await ctx.close();
 }
 await b.close();
 console.log(fail?`\n${fail} FAILED`:'\nALL PASSED');
})().catch(e=>console.error('HARNESS',e.message));
