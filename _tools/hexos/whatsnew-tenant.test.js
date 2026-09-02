#!/usr/bin/env node
/**
 * whatsnew-tenant.test.js
 *
 * @catalog what    UpdateManager.isTenantContext() must detect a white-label student from EITHER
 * @catalog what    storage, so the What's New modal never shows Hexworth release notes inside a
 * @catalog what    tenant's branded wrapper.
 * @catalog run     node _tools/hexos/whatsnew-tenant.test.js
 * @catalog status  GATE
 *
 * WHY
 * ---
 * dashboard.html constructs UpdateManager and calls init() unconditionally, and until this guard
 * there was no tenant check anywhere in that chain. The modal renders "Welcome to <version>" plus
 * the platform changelog. The gap was dormant: it only fires on a VERSION BUMP, so shipping a new
 * version is the event that would have exposed every returning tenant student at once. A reviewer
 * found it by scoping the blast radius of a release rather than the release itself.
 *
 * BOTH STORAGES ARE TESTED SEPARATELY, and that is the point. The tenant blob goes to
 * sessionStorage at join and is mirrored to localStorage so it survives a new tab (BUG-242);
 * eleven of twelve join paths historically wrote only one of the two, and a previous check that
 * read a single storage reported "not a tenant" for real tenant students (BUG-236). A fixture
 * that seeds both would pass with a detector that reads either one, and prove nothing.
 *
 * WHAT THIS COVERS, PRECISELY, because I overstated it to a reviewer once and he checked, then
 * miscounted it a second time in the correction itself. There are SEVEN guarded render surfaces:
 *
 *   FIXTURED HERE, both directions unless noted:
 *     1. UpdateManager.showWhatsNew()
 *     2. UpdateManager.showUpdateBanner()
 *     3. UpdateManager.showUpdateModal()          tenant direction only
 *     4. index.html landing badge                 driven on the REAL page
 *
 *   GUARDED BUT NOT FIXTURED, verified by reading only:
 *     5. dashboard.html codenameDisplay
 *     6. dashboard.html footer version line
 *     7. dashboard.html showWhatsNewModal()       a SECOND implementation, separate from (1)
 *     8. SecretFeatures.showVersionInfo()         triple-click the logo
 *     9. SecretFeatures.showCredits()             seven clicks on the footer note
 *
 * Nine, not seven. (8) was guarded a round before (9), in the same file, wired by the same
 * initDiscoveryMechanics(), and I then swept that file and called it clean, because I searched
 * for CATCH BLOCKS, the mechanism of the previous bug, instead of for the brand string reaching
 * the DOM, which is the artifact. Searching by mechanism only ever finds the bug you already
 * know about. Sweep by artifact.
 *
 * So: four proven by fixture, three-plus-one guarded by inspection. "13/13" is not "every surface
 * is proven", and must never be reported as though it were. The obstacle for all the
 * dashboard-hosted ones is the same and is described below.
 *
 * AND THE HONEST LIMIT OF THE WHOLE EXERCISE: this file polices the version and codename, while
 * `dashboard.html:3989` and `index.html:877` render the literal words "Hexworth Prime" as static
 * markup, and TenantShell's branding pass only rewrites document.title. Guarding the codename
 * while the product's NAME is on screen is fixing the whisper and not the shout. Logged as
 * BUG-252, deliberately not fixed here because it is a product decision about how white-labeling
 * should work, not a defect with an obvious right answer.
 *
 * WHAT THIS DOES NOT COVER, stated so nobody reads more into it than it earns: it exercises the
 * DETECTOR, loaded standalone, not the modal on the real dashboard. dashboard.html redirects an
 * unauthenticated headless browser through its sorting flow, and I judged bending the harness far
 * enough to defeat that more likely to produce a probe that measures itself than one that
 * measures the product. The call site is a single guard on one line; the detector is the part
 * with the failure modes.
 */
'use strict';
const http=require('http'),fs=require('fs'),path=require('path');
/* Same exit-code contract as the other Hex OS gates: 2 means "could not test", not "failed".
   post-verify branches on it (RC -eq 2 skips, anything else non-zero sets DIVERGENCE), so a bare
   require() here would crash with MODULE_NOT_FOUND and exit 1, and the operator would be told
   "tenant students could be shown Hexworth release notes" with an empty evidence snippet, when in
   fact nothing had been tested at all. A reviewer reproduced exactly that. */
let puppeteer;
try { puppeteer = require('puppeteer'); } catch (e) {
    console.error('puppeteer not installed; the tenant guard cannot be verified. Refusing to fake a pass.');
    process.exit(2);
}
const APP=path.resolve('/home/eq/ai-content/hexworth-prime/_app'),PORT=9243;
const srv=http.createServer((q,r)=>{
 if(q.url==='/t.html'){r.writeHead(200,{'Content-Type':'text/html'});
   return r.end('<!DOCTYPE html><html><body><script src="/components/UpdateManager.js"></script></body></html>');}
 const p=decodeURIComponent(q.url.split('?')[0]);const f=path.join(APP,p);
 if(!f.startsWith(APP)||!fs.existsSync(f)){r.writeHead(404);return r.end();}
 /* Correct MIME per extension. The first version served EVERYTHING as text/javascript, which
    was fine while the only fixture was a hand-written page loading one script, and silently broke
    the moment a fixture navigated to a real .html page: the browser never parsed it as HTML, the
    badge element did not exist, and the non-tenant CONTROL failed while the tenant case "passed"
    for entirely the wrong reason. A harness that mis-serves the artifact measures the harness. */
 const MIME={'.html':'text/html','.js':'text/javascript','.json':'application/json','.css':'text/css',
             '.webp':'image/webp','.png':'image/png','.svg':'image/svg+xml','.webmanifest':'application/manifest+json'};
 r.writeHead(200,{'Content-Type':MIME[path.extname(f)]||'application/octet-stream'});r.end(fs.readFileSync(f));});
const T=JSON.stringify({slug:'acme',branding:{name:'Acme'},adminUids:[]});
let pass=0,fail=0;const chk=(n,c,d)=>{c?pass++:fail++;console.log(`  ${c?'ok  ':'FAIL'} ${n}${c?'':'  <- '+String(d)}`);};
srv.listen(PORT,'127.0.0.1',async()=>{
 const b=await puppeteer.launch({headless:'new',args:['--no-sandbox']});
 // Six fixtures: the two obvious ones plus the four ways this has broken before.
 const cases=[
  ['no tenant at all',        null, null,  false],
  ['sessionStorage only',     T,    null,  true ],
  ['localStorage only',       null, T,     true ],
  ['both storages',           T,    T,     true ],
  ['blob present but no slug','{"branding":{}}', null, false],
  ['unparseable blob',        'not json', null, false],
 ];
 for(const [label,sess,loc,want] of cases){
  const ctx=await b.createBrowserContext();const pg=await ctx.newPage();
  await pg.evaluateOnNewDocument((s,l)=>{try{
    if(s)sessionStorage.setItem('hexworth_tenant',s);
    if(l)localStorage.setItem('hexworth_tenant',l);}catch(e){}},sess,loc);
  await pg.goto(`http://127.0.0.1:${PORT}/t.html`,{waitUntil:'networkidle0'});
  const got=await pg.evaluate(()=>typeof UpdateManager==='undefined'?'NO CLASS':
    (typeof UpdateManager.isTenantContext!=='function'?'NO METHOD':UpdateManager.isTenantContext()));
  chk(`${label} -> ${want}`,got===want,got);
  await pg.close();await ctx.close().catch(()=>{});
 }
 // ── The SECOND door. A reviewer found dashboard.html carries its own independent What's New
 // implementation, reached from a "Check for Updates" menu item, which the component-side guard
 // did not touch. Testing only the detector, or only UpdateManager, would still miss it, so this
 // drives BOTH renderers directly with a tenant fixture seeded.
 for (const tenant of [true,false]){
  const ctx=await b.createBrowserContext();const pg=await ctx.newPage();
  await pg.evaluateOnNewDocument((t,isT)=>{try{
    if(isT){sessionStorage.setItem('hexworth_tenant',t);localStorage.setItem('hexworth_tenant',t);}
  }catch(e){}},T,tenant);
  await pg.goto(`http://127.0.0.1:${PORT}/t.html`,{waitUntil:'networkidle0'});
  const r=await pg.evaluate(async()=>{
    const um=new UpdateManager();
    let rendered=false;
    try{ await um.showWhatsNew({autoTriggered:false});
         // The component renders `.whatsnew-modal` (no hyphen); dashboard.html renders
         // `#whatsNewOverlay`. My first selector guessed `whats-new` and matched neither, so the
         // non-tenant CONTROL went red and would have made the tenant pass meaningless.
         rendered=!!document.getElementById('whatsNewOverlay')||!!document.querySelector('.whatsnew-modal');
    }catch(e){ rendered='threw: '+e.message; }
    return {rendered, detect: UpdateManager.isTenantContext()};
  });
  const label=tenant?'TENANT':'plain ';
  if(tenant){
    chk(`${label}: a DELIBERATE showWhatsNew renders nothing`, r.rendered===false, JSON.stringify(r));
  }else{
    chk(`${label}: showWhatsNew still renders for non-tenants (guard is not universal)`,
        r.rendered===true, JSON.stringify(r));
  }
  await pg.close();await ctx.close().catch(()=>{});
 }
 // ── EVERY renderer, not just the two found first. A reviewer enumerated five surfaces that
 // put the version or codename on screen; guarding "the renderer" only closes a door if you
 // found every renderer, and the first pass found two of them.
 for (const tenant of [true,false]){
  const ctx=await b.createBrowserContext();const pg=await ctx.newPage();
  await pg.evaluateOnNewDocument((t,isT)=>{try{
    if(isT){sessionStorage.setItem('hexworth_tenant',t);localStorage.setItem('hexworth_tenant',t);}
  }catch(e){}},T,tenant);
  await pg.goto(`http://127.0.0.1:${PORT}/t.html`,{waitUntil:'networkidle0'});
  const r=await pg.evaluate(async()=>{
    const um=new UpdateManager();
    um.remoteRelease={tag_name:'v9.9.9',name:'HARDLINE 9.9.9',body:'notes',html_url:'#'};
    let banner=false,modal=false;
    try{ um.showUpdateBanner(); banner=!!document.querySelector('.update-banner'); }catch(e){}
    try{ await um.showUpdateModal(); modal=!!document.querySelector('.update-modal-overlay:not(.whatsnew-modal)'); }catch(e){}
    return {banner,modal};
  });
  const label=tenant?'TENANT':'plain ';
  if(tenant){
    chk(`${label}: update BANNER does not render`, r.banner===false, JSON.stringify(r));
    chk(`${label}: update MODAL does not render`, r.modal===false, JSON.stringify(r));
  }else{
    chk(`${label}: update BANNER still renders (guard is not universal)`, r.banner===true, JSON.stringify(r));
  }
  await pg.close();await ctx.close().catch(()=>{});
 }

 // ── The landing page renders its own badge and does NOT load UpdateManager, so its check is
 // inlined and needs its own fixture. No auth involved, so this one drives the REAL page.
 for (const tenant of [true,false]){
  const ctx=await b.createBrowserContext();const pg=await ctx.newPage();
  await pg.setRequestInterception(true);
  pg.on('request',rq=>{const u=rq.url();
   if(!u.startsWith(`http://127.0.0.1:${PORT}`))return rq.abort();rq.continue();});
  await pg.evaluateOnNewDocument((t,isT)=>{try{
    if(isT){sessionStorage.setItem('hexworth_tenant',t);localStorage.setItem('hexworth_tenant',t);}
  }catch(e){}},T,tenant);
  try{
   await pg.goto(`http://127.0.0.1:${PORT}/index.html`,{waitUntil:'domcontentloaded',timeout:30000});
   await new Promise(r=>setTimeout(r,1800));
   const txt=await pg.evaluate(()=>{const e=document.getElementById('versionBadge');return e?e.textContent:'(no badge)';});
   const label=tenant?'TENANT':'plain ';
   if(tenant){
     chk(`${label}: landing badge shows no codename`, /^v[\d.]+\s*$/.test(txt.trim())||txt==='(no badge)', txt);
   }else{
     chk(`${label}: landing badge still shows the codename`, /[A-Z]{3,}/.test(txt), txt);
   }
  }catch(e){ chk('landing badge fixture ran', false, e.message); }
  await pg.close();await ctx.close().catch(()=>{});
 }

 await b.close();srv.close();
 console.log(`\n  ${pass}/${pass+fail} passed`);process.exitCode=fail?1:0;
});
