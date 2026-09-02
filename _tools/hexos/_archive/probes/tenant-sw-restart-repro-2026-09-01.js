// Does tenant injection survive a service-worker restart? tenantActive is module scope in the
// worker and is set ONLY by a postMessage that only /tenant/ pages send. Browsers terminate idle
// workers. If it resets, injection stops mid-session with nothing to restore it.
const http=require('http'),fs=require('fs'),path=require('path');
const pup=require('/home/eq/ai-content/hexworth-prime/node_modules/puppeteer');
const APP='/home/eq/ai-content/hexworth-prime/_app',PORT=9211;
const T={'.html':'text/html','.js':'text/javascript','.json':'application/json','.css':'text/css','.webp':'image/webp'};
// A plain content page OUTSIDE /tenant/ and /admin/, so tenant-sw should inject into it.
http.createServer((q,r)=>{let p=decodeURIComponent(q.url.split('?')[0]);
 if(p==='/probe.html'){r.writeHead(200,{'Content-Type':'text/html'});
   return r.end('<!doctype html><html><head><meta charset="UTF-8"></head><body><p>content</p></body></html>');}
 if(p.endsWith('/'))p+='index.html';
 const f=path.join(APP,p);if(!f.startsWith(APP)||!fs.existsSync(f)||fs.statSync(f).isDirectory())return r.writeHead(404),r.end();
 r.writeHead(200,{'Content-Type':T[path.extname(f)]||'application/octet-stream'});r.end(fs.readFileSync(f));
}).listen(PORT,'127.0.0.1',async()=>{
 const O=`http://localhost:${PORT}`;
 const b=await pup.launch({headless:'new',args:['--no-sandbox']});
 const ctx=b.createBrowserContext?await b.createBrowserContext():await b.createIncognitoBrowserContext();
 const pg=await ctx.newPage();
 await pg.goto(O+'/probe.html',{waitUntil:'domcontentloaded'});
 await pg.evaluate(async()=>{
   const r=await navigator.serviceWorker.register('/tenant-sw.js',{scope:'/'});
   await navigator.serviceWorker.ready;
   const sw=r.active||navigator.serviceWorker.controller;
   if(sw) sw.postMessage({type:'TENANT_ACTIVATE'});
   await new Promise(x=>setTimeout(x,600));
 });
 const injected=async()=>{await pg.goto(O+'/probe.html',{waitUntil:'networkidle0'});
   return pg.evaluate(()=>!!document.querySelector('script[src="/components/TenantShell.js"]'));};
 console.log('  injection BEFORE worker restart :', await injected());

 // Force the worker to stop, exactly as the browser does when it goes idle.
 const cdp=await pg.target().createCDPSession();
 await cdp.send('ServiceWorker.enable');
 const vers=await new Promise(res=>{cdp.on('ServiceWorker.workerVersionUpdated',e=>res(e.versions));setTimeout(()=>res([]),2500);});
 const running=(vers||[]).filter(v=>v.runningStatus==='running');
 for(const v of running){ try{ await cdp.send('ServiceWorker.stopWorker',{versionId:v.versionId}); }catch(e){} }
 console.log('  stopped', running.length, 'running worker version(s)');
 await new Promise(r=>setTimeout(r,900));

 console.log('  injection AFTER worker restart  :', await injected());
 await b.close();process.exit(0);});
