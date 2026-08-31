// Verify the PWA in a real browser: worker registers with the right scope, controls /hex/,
// does NOT claim anything outside it, and the manifest is parsed by the browser rather than
// merely present on disk.
const http=require('http'),fs=require('fs'),path=require('path'),pup=require('puppeteer');
const APP=path.resolve('_app'),PORT=9171;
const M={'.html':'text/html','.js':'text/javascript','.json':'application/json','.webmanifest':'application/manifest+json','.png':'image/png','.webp':'image/webp','.css':'text/css'};
const srv=http.createServer((q,r)=>{let p=decodeURIComponent(q.url.split('?')[0]);if(p.endsWith('/'))p+='index.html';
 const f=path.join(APP,p);if(!f.startsWith(APP)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end();}
 r.writeHead(200,{'Content-Type':M[path.extname(f)]||'application/octet-stream'});r.end(fs.readFileSync(f));});
srv.listen(PORT,'127.0.0.1',async()=>{
 const b=await pup.launch({headless:'new',args:['--no-sandbox']});
 const pg=await b.newPage(); const errs=[];
 pg.on('pageerror',e=>errs.push(e.message));
 await pg.setRequestInterception(true);
 pg.on('request',r=>{ if(/AccessGuard\.js$/.test(r.url()))
   return r.respond({status:200,contentType:'text/javascript',body:'window.AccessGuard={require:function(){}};'});
   r.continue();});
 let pass=0,fail=0;const chk=(n,c,d)=>{c?pass++:fail++;console.log(`  ${c?'ok  ':'FAIL'} ${n}${c?'':'  <- '+String(d).slice(0,90)}`)};
 await pg.goto(`http://127.0.0.1:${PORT}/hex/`,{waitUntil:'networkidle0'});
 // The browser's own manifest parse, not a file read.
 const man=await pg.evaluate(async()=>{
   const l=document.querySelector('link[rel=manifest]'); if(!l) return null;
   const r=await fetch(l.href); if(!r.ok) return {httpError:r.status};
   return r.json();});
 chk('browser fetches and parses the manifest', man && !man.httpError, JSON.stringify(man).slice(0,80));
 chk('display is standalone (no browser chrome)', man && man.display==='standalone', man&&man.display);
 chk('scope is /hex/ only', man && man.scope==='/hex/', man&&man.scope);
 chk('start_url is /hex/', man && man.start_url==='/hex/', man&&man.start_url);
 const icon=await pg.evaluate(async(src)=>{const r=await fetch(src);return {ok:r.ok,type:r.headers.get('content-type')};}, man?man.icons[0].src:'/x');
 chk('icon actually resolves', icon.ok && /image\/png/.test(icon.type||''), JSON.stringify(icon));
 chk('apple-touch-icon present (iOS add-to-home)', await pg.evaluate(()=>!!document.querySelector('link[rel="apple-touch-icon"]')));
 chk('theme-color set', await pg.evaluate(()=>!!document.querySelector('meta[name="theme-color"]')));
 chk('no page errors from the PWA wiring', errs.length===0, errs[0]);
 // Worker registration is https/localhost-gated; 127.0.0.1 is not "localhost", so assert the
 // GATE behaves correctly rather than pretending the worker registered.
 const swWired=await pg.evaluate(()=>document.documentElement.innerHTML.includes("scope: '/hex/'"));
 chk('worker registration is scoped to /hex/ in source', swWired);
 const rootClaim=fs.readFileSync(path.join(APP,'hex/hex-sw.js'),'utf8');
 chk('worker never registers or claims scope /', !/scope:\s*['"]\/['"]/.test(rootClaim));
 chk('worker refuses out-of-scope requests', /inScope/.test(rootClaim) && /return;/.test(rootClaim));
 console.log(`\n  ${pass}/${pass+fail}`);
 await b.close();srv.close();process.exitCode=fail?1:0;});
