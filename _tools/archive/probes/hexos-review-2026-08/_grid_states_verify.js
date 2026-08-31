const http=require('http'),fs=require('fs'),path=require('path'),pup=require('puppeteer');
const APP=path.resolve('_app'),PORT=9141;
const M={'.html':'text/html','.js':'text/javascript','.json':'application/json','.webp':'image/webp'};
let MODE='ok';
const srv=http.createServer((q,r)=>{let p=decodeURIComponent(q.url.split('?')[0]);if(p.endsWith('/'))p+='index.html';
 if(/hex-apps\.json$/.test(p)){
   if(MODE==='malformed'){r.writeHead(200,{'Content-Type':'application/json'});return r.end('{"items":[]}');}
   if(MODE==='empty'){r.writeHead(200,{'Content-Type':'application/json'});return r.end('{"apps":[]}');}}
 const f=path.join(APP,p);if(!f.startsWith(APP)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end();}
 r.writeHead(200,{'Content-Type':M[path.extname(f)]||'application/octet-stream'});r.end(fs.readFileSync(f));});
srv.listen(PORT,'127.0.0.1',async()=>{
 const b=await pup.launch({headless:'new',args:['--no-sandbox']});
 let pass=0,fail=0;const chk=(n,c,d)=>{c?pass++:fail++;console.log(`  ${c?'ok  ':'FAIL'} ${n}${c?'':'  <- '+String(d).slice(0,90)}`)};
 async function load(){const pg=await b.newPage();await pg.setRequestInterception(true);
   pg.on('request',r=>{if(/AccessGuard\.js$/.test(r.url()))return r.respond({status:200,contentType:'text/javascript',body:'window.AccessGuard={require:function(){}};'});r.continue();});
   await pg.goto(`http://127.0.0.1:${PORT}/hex/apps.html`,{waitUntil:'networkidle0'});
   await new Promise(r=>setTimeout(r,600));return pg;}
 let pg=await load();
 const st=await pg.evaluate(()=>({tiles:document.querySelectorAll('.app').length,
   count:document.getElementById('count').textContent,
   live:document.getElementById('count').getAttribute('aria-live'),
   guard:[...document.querySelectorAll('.tag')].filter(t=>/sorted|open/.test(t.textContent)).length}));
 chk('renders 189',st.tiles===189,st.tiles);
 chk('count is a live region',st.live==='polite',st.live);
 chk('count populated',/all apps/.test(st.count),st.count);
 chk('clientGuard now actually rendered on tiles',st.guard>100,'tiles showing a guard: '+st.guard);
 await pg.close();
 MODE='malformed'; pg=await load();
 let t=await pg.evaluate(()=>document.getElementById('out').innerText);
 chk('malformed body says BROKEN, not "nothing matches"',/malformed|could not load/i.test(t)&&!/nothing matches/i.test(t),t.slice(0,90));
 await pg.close();
 MODE='empty'; pg=await load();
 t=await pg.evaluate(()=>document.getElementById('out').innerText);
 chk('empty manifest says EMPTY, not "nothing matches"',/empty|could not load/i.test(t)&&!/nothing matches/i.test(t),t.slice(0,90));
 await pg.close();
 console.log(`\n  ${pass}/${pass+fail}`);
 await b.close();srv.close();process.exitCode=fail?1:0;});
