// Does the worker ACTUALLY register, activate, and control only /hex/? The previous run could
// not answer this: it served from 127.0.0.1, which is not a secure origin, so registration was
// correctly skipped and I verified the gate rather than the worker.
const http=require('http'),fs=require('fs'),path=require('path'),pup=require('puppeteer');
const APP=path.resolve('_app'),PORT=9173;
const M={'.html':'text/html','.js':'text/javascript','.json':'application/json','.webmanifest':'application/manifest+json','.png':'image/png','.webp':'image/webp'};
const srv=http.createServer((q,r)=>{let p=decodeURIComponent(q.url.split('?')[0]);if(p.endsWith('/'))p+='index.html';
 const f=path.join(APP,p);if(!f.startsWith(APP)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end();}
 r.writeHead(200,{'Content-Type':M[path.extname(f)]||'application/octet-stream'});r.end(fs.readFileSync(f));});
srv.listen(PORT,'127.0.0.1',async()=>{
 const b=await pup.launch({headless:'new',args:['--no-sandbox']});
 const pg=await b.newPage();
 await pg.setRequestInterception(true);
 pg.on('request',r=>{ if(/AccessGuard\.js$/.test(r.url()))
   return r.respond({status:200,contentType:'text/javascript',body:'window.AccessGuard={require:function(){}};'});
   r.continue();});
 let pass=0,fail=0;const chk=(n,c,d)=>{c?pass++:fail++;console.log(`  ${c?'ok  ':'FAIL'} ${n}${c?'':'  <- '+String(d).slice(0,90)}`)};
 // localhost IS a secure origin, so the gate lets registration through here.
 await pg.goto(`http://localhost:${PORT}/hex/`,{waitUntil:'networkidle0'});
 const reg=await pg.evaluate(async()=>{
   try{ const r=await navigator.serviceWorker.register('/hex/hex-sw.js',{scope:'/hex/'});
        await navigator.serviceWorker.ready;
        return {scope:r.scope, active:!!r.active||!!r.installing||!!r.waiting};
   }catch(e){return {err:e.message};}});
 chk('worker registers on a secure origin', reg && !reg.err, JSON.stringify(reg));
 chk('its scope is /hex/, not /', reg && /\/hex\/$/.test(reg.scope||''), reg&&reg.scope);
 // The decisive check: it must control /hex/ and NOT the root, where tenant-sw lives.
 const ctl=await pg.evaluate(async()=>{
   const regs=await navigator.serviceWorker.getRegistrations();
   return regs.map(r=>r.scope);});
 chk('exactly one worker, scoped to /hex/', ctl.length===1 && /\/hex\/$/.test(ctl[0]), JSON.stringify(ctl));
 chk('no worker claims the site root', !ctl.some(s=>/localhost:\d+\/$/.test(s)), JSON.stringify(ctl));
 // Offline: the shell must still open from cache.
 await pg.goto(`http://localhost:${PORT}/hex/apps.html`,{waitUntil:'networkidle0'});
 await new Promise(r=>setTimeout(r,700));
 await pg.setOfflineMode(true);
 let offlineOk=false;
 try{ await pg.goto(`http://localhost:${PORT}/hex/`,{waitUntil:'domcontentloaded',timeout:8000});
      offlineOk=await pg.evaluate(()=>!!document.getElementById('cmd')||document.body.innerText.length>0);
 }catch(e){offlineOk=false;}
 chk('shell still opens OFFLINE from cache', offlineOk, 'offline navigation failed');
 await pg.setOfflineMode(false);
 console.log(`\n  ${pass}/${pass+fail}`);
 await b.close();srv.close();process.exitCode=fail?1:0;});
