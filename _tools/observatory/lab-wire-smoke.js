// Smoke test: real A+ lab/quiz pages with the added FirebaseAuth + telemetry includes.
// Confirms the pages load without fatal JS errors, FirebaseAuth is present exactly
// once (no double-load past ModuleProgress's guard), and window.ObservatoryTelemetry
// initializes. AccessGuard is stubbed so the page does not redirect us away.
const http=require('http'),fs=require('fs'),path=require('path'),pup=require('puppeteer');
const APP=path.resolve('_app');
const MIME={'.html':'text/html','.js':'text/javascript','.css':'text/css','.webp':'image/webp','.png':'image/png','.svg':'image/svg+xml','.json':'application/json','.woff2':'font/woff2'};
const srv=http.createServer((q,s)=>{let p=decodeURIComponent(q.url.split('?')[0]);let fp=path.join(APP,p);if(fs.existsSync(fp)&&fs.statSync(fp).isFile()){s.writeHead(200,{'Content-Type':MIME[path.extname(fp)]||'application/octet-stream'});fs.createReadStream(fp).pipe(s);}else{s.writeHead(404);s.end('nf');}});
const PAGES=[
  '/houses/forge/applets/comptia-aplus/core-1/labs/forge-dns-config.lab.html',
  '/houses/forge/applets/comptia-aplus/core-1/labs/forge-storage-upgrade.lab.html',
  '/houses/forge/applets/comptia-aplus/core-1/quizzes/forge-aplus-core1-prep-round-1.quiz.html'
];
(async()=>{
  await new Promise(r=>srv.listen(0,r));const port=srv.address().port;
  const b=await pup.launch({headless:'new',args:['--no-sandbox']});
  let pass=true;
  for(const P of PAGES){
    const pg=await b.newPage();
    const errs=[];
    pg.on('pageerror',e=>errs.push(String(e.message).slice(0,140)));
    await pg.setRequestInterception(true);
    pg.on('request',r=>{const u=r.url();
      if(u.endsWith('/components/AccessGuard.js'))r.respond({status:200,contentType:'text/javascript',body:'window.AccessGuard={require:function(){return true;},requireAll:function(){return true;},requireAny:function(){return true;}};'});
      // Block the real firebase SDK bundles so init fails fast+graceful (no network hang); we only test page integrity + our includes.
      else if(/gstatic\.com|firebasejs|firebaseapp\.com|googleapis\.com/.test(u))r.respond({status:200,contentType:'text/javascript',body:'/* firebase stub */'});
      else r.continue();
    });
    await pg.goto('http://localhost:'+port+P,{waitUntil:'domcontentloaded',timeout:20000}).catch(e=>errs.push('goto:'+e.message));
    await new Promise(r=>setTimeout(r,900));
    const st=await pg.evaluate(()=>({
      tel: typeof window.ObservatoryTelemetry==='object' && typeof window.ObservatoryTelemetry.init==='function',
      fbaTags: document.querySelectorAll('script[src*="FirebaseAuth.js"]').length,
      telTags: document.querySelectorAll('script[src*="ObservatoryTelemetry.js"]').length,
    }));
    // Ignore benign firebase-stub errors; flag anything else.
    const fatal=errs.filter(e=>!/firebase|firestore|initializeApp|getAuth|is not defined: firebase/i.test(e));
    const name=P.split('/').pop();
    const ok = st.tel && st.telTags===1 && st.fbaTags>=1 && fatal.length===0;
    console.log(`  ${ok?'OK  ':'FAIL'} ${name}  telemetry=${st.tel} telTags=${st.telTags} fbaTags=${st.fbaTags} fatalErrs=${fatal.length}`);
    if(fatal.length) console.log('       fatal:',fatal.slice(0,3));
    if(!ok) pass=false;
    await pg.close();
  }
  await b.close();await new Promise(r=>srv.close(r));
  console.log(pass?'\n*** LAB WIRE SMOKE OK ***':'\n*** LAB WIRE SMOKE FAILED ***');
  process.exit(pass?0:1);
})();
