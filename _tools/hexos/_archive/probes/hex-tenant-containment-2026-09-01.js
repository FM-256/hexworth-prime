// LIVE containment test. Nancy's instruction: do not accept this on code-reading, mine or hers.
// Drives a real tenant session and asks what the "back to Hexworth" link actually points at.
const http=require('http'),fs=require('fs'),path=require('path');
const pup=require('/home/eq/ai-content/hexworth-prime/node_modules/puppeteer');
const APP='/home/eq/ai-content/hexworth-prime/_app',PORT=9199;
const T={'.html':'text/html','.js':'text/javascript','.json':'application/json','.css':'text/css','.webp':'image/webp','.png':'image/png','.webmanifest':'application/manifest+json'};
http.createServer((q,r)=>{let p=decodeURIComponent(q.url.split('?')[0]);if(p.endsWith('/'))p+='index.html';
 const f=path.join(APP,p);if(!f.startsWith(APP)||!fs.existsSync(f)||fs.statSync(f).isDirectory())return r.writeHead(404),r.end();
 r.writeHead(200,{'Content-Type':T[path.extname(f)]||'application/octet-stream'});r.end(fs.readFileSync(f));
}).listen(PORT,'127.0.0.1',async()=>{
 const O=`http://localhost:${PORT}`;
 const b=await pup.launch({headless:'new',args:['--no-sandbox']});
 const ctx=b.createBrowserContext?await b.createBrowserContext():await b.createIncognitoBrowserContext();
 const pg=await ctx.newPage(); const errs=[]; pg.on('pageerror',e=>errs.push(e.message.split('\n')[0]));
 await pg.setRequestInterception(true);
 pg.on('request',r=>{const u=r.url();
   if(/AccessGuard\.js$/.test(u)) return r.respond({status:200,contentType:'text/javascript',
     body:'window.AccessGuard={require:function(){},redirect:function(){}};'});
   if(/getTenantConfig/.test(u)) return r.respond({status:200,contentType:'application/json',
     headers:{'Access-Control-Allow-Origin':'*'},
     body:JSON.stringify({slug:'acme',status:'active',name:'Acme',branding:{name:'Acme Academy',dashboardVariant:null},adminUids:[]})});
   if(!u.startsWith(O)&&!u.startsWith('data:')) return r.abort();
   r.continue();});

 // A REAL tenant session: seed the blob the join flow writes, and activate tenant-sw at scope '/'.
 await pg.evaluateOnNewDocument(()=>{
   const cfg=JSON.stringify({slug:'acme',branding:{name:'Acme Academy'},adminUids:[]});
   try{sessionStorage.setItem('hexworth_tenant',cfg);localStorage.setItem('hexworth_tenant',cfg);}catch(e){}
 });
 await pg.goto(`${O}/tenant/`,{waitUntil:'networkidle0'}).catch(()=>null);
 await pg.evaluate(async()=>{
   const r=await navigator.serviceWorker.register('/tenant-sw.js',{scope:'/'});
   await navigator.serviceWorker.ready;
   const sw=r.active||navigator.serviceWorker.controller;
   if(sw) sw.postMessage({type:'TENANT_ACTIVATE'});
   await new Promise(x=>setTimeout(x,500));
 });


 // THE DECISIVE STEP. Register hex-sw at /hex/ so it WINS the scope race and tenant-sw is shut
 // out of these pages entirely -- exactly the condition that made this a one-click escape. If the
 // static includes work, containment must survive with tenant-sw NOT injecting.
 await pg.evaluate(async()=>{
   await navigator.serviceWorker.register('/hex/hex-sw.js',{scope:'/hex/'});
   await new Promise(x=>setTimeout(x,600));
 });
 await pg.goto(`${O}/hex/`,{waitUntil:'networkidle0'});
 await pg.goto(`${O}/hex/`,{waitUntil:'networkidle0'});   // second nav: hex-sw now controls
 await new Promise(r=>setTimeout(r,3500));   // overrideLinks runs on a 1s/3s timer

 const out=await pg.evaluate(()=>{
   const a=[...document.querySelectorAll('a')].find(x=>/back to Hexworth/i.test(x.textContent||''));
   return {
     routerLoaded: typeof TenantRouter!=='undefined',
     shellLoaded: typeof window.__tenantShellExecuted!=='undefined',
     routerActive: (typeof TenantRouter!=='undefined'&&TenantRouter.isActive)?TenantRouter.isActive():null,
     backLinkText: a?a.textContent.trim():'(not found)',
     backLinkHref: a?a.getAttribute('href'):null,
     backLinkResolved: a?a.href:null,
     controller: navigator.serviceWorker.controller&&navigator.serviceWorker.controller.scriptURL
   };
 });
 console.log('  controller            :', (out.controller||'none').replace(O,''));
 console.log('  TenantRouter loaded   :', out.routerLoaded);
 console.log('  TenantShell executed  :', out.shellLoaded);
 console.log('  TenantRouter.isActive :', out.routerActive);
 console.log('  back-link text        :', out.backLinkText);
 console.log('  back-link href        :', out.backLinkHref);
 console.log('  resolves to           :', (out.backLinkResolved||'').replace(O,'') || '(none)');
 console.log('  page errors           :', errs.length?errs[0].slice(0,90):'none');
 const contained = out.routerLoaded && out.routerActive===true && out.backLinkHref!=='/';
 console.log('\n  ' + (contained
   ? 'CONTAINED: the escape link no longer points at raw Hexworth.'
   : 'NOT CONTAINED: back-link still ' + out.backLinkHref));
 await b.close();process.exit(0);});
