// Diagnostic: load a real A+ Core 1 chapter, click Mark Complete, observe what happens.
// Stubs ONLY AccessGuard + FirebaseAuth (so auth doesn't redirect) but loads the REAL
// ModuleProgress.js so we see the actual complete() behavior a student would hit.
const http=require('http'),fs=require('fs'),path=require('path'),pup=require('puppeteer');
const APP=path.resolve('_app');
const MIME={'.html':'text/html','.js':'text/javascript','.css':'text/css','.webp':'image/webp','.png':'image/png','.svg':'image/svg+xml','.json':'application/json','.woff2':'font/woff2'};
const srv=http.createServer((q,s)=>{let p=decodeURIComponent(q.url.split('?')[0]);let fp=path.join(APP,p);if(fs.existsSync(fp)&&fs.statSync(fp).isFile()){s.writeHead(200,{'Content-Type':MIME[path.extname(fp)]||'application/octet-stream'});fs.createReadStream(fp).pipe(s);}else{s.writeHead(404);s.end('nf');}});
const URLP='/houses/forge/applets/comptia-aplus/core-1/chapters/ch01-motherboards/index.html';
(async()=>{
  await new Promise(r=>srv.listen(0,r));const port=srv.address().port;
  const b=await pup.launch({headless:'new',args:['--no-sandbox']});
  const pg=await b.newPage();
  const errs=[],logs=[];
  pg.on('pageerror',e=>errs.push('PAGEERROR: '+String(e.message).slice(0,200)));
  pg.on('console',m=>{if(m.type()==='error')logs.push('console.error: '+m.text().slice(0,200));});
  await pg.setRequestInterception(true);
  pg.on('request',r=>{const u=r.url();
    if(u.endsWith('/components/AccessGuard.js'))r.respond({status:200,contentType:'text/javascript',body:'window.AccessGuard={require:function(){return true;},requireAll:function(){return true;},requireAny:function(){return true;}};'});
    else if(u.endsWith('/components/FirebaseAuth.js'))r.respond({status:200,contentType:'text/javascript',body:'window.FirebaseAuth={currentUser:function(){return {uid:"probe"};},onAuth:function(){}};'});
    else r.continue();
  });
  const resp=await pg.goto('http://localhost:'+port+URLP,{waitUntil:'domcontentloaded',timeout:20000}).catch(e=>({err:e.message}));
  await new Promise(r=>setTimeout(r,600));
  const pre=await pg.evaluate(()=>({
    hasModuleProgress: typeof ModuleProgress!=='undefined',
    mpType: typeof (window.ModuleProgress&&window.ModuleProgress.complete),
    hasMarkComplete: typeof markComplete!=='undefined',
    btn: !!document.getElementById('complete-btn'),
  }));
  // instrument complete to see if it gets called + capture navigation
  await pg.evaluate(()=>{ if(window.ModuleProgress){const o=window.ModuleProgress.complete;window.__called=false;window.ModuleProgress.complete=function(){window.__called=true;window.__args=[].slice.call(arguments);try{return o.apply(this,arguments);}catch(e){window.__completeErr=String(e.message);}};}});
  const beforeUrl=pg.url();
  await pg.evaluate(()=>{const b=document.getElementById('complete-btn');if(b)b.click();});
  await new Promise(r=>setTimeout(r,900));
  const post=await pg.evaluate(()=>({called:window.__called,args:window.__args,completeErr:window.__completeErr||null,overlay:!!document.querySelector('[class*="completion"],[id*="completion"],[class*="overlay"]'),ls:localStorage.getItem('hexworth_progress')?'set':'empty'}));
  const afterUrl=pg.url();
  console.log('goto:',JSON.stringify(resp).slice(0,80));
  console.log('preclick:',JSON.stringify(pre));
  console.log('postclick:',JSON.stringify(post));
  console.log('urlChanged:',beforeUrl!==afterUrl,'->',afterUrl.replace('http://localhost:'+port,''));
  console.log('pageerrors:',errs.length?errs.slice(0,4):'none');
  console.log('consoleerrors:',logs.length?logs.slice(0,4):'none');
  await b.close();await new Promise(r=>srv.close(r));
})();
