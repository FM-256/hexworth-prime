const http=require('http'),fs=require('fs'),path=require('path'),pup=require('puppeteer');
const APP=path.resolve('_app'),PORT=9161;
const M={'.html':'text/html','.js':'text/javascript','.json':'application/json','.webp':'image/webp'};
let MODE='ok';
const real=JSON.parse(fs.readFileSync(path.join(APP,'data/hex-apps.json'),'utf8'));
const srv=http.createServer((q,r)=>{let p=decodeURIComponent(q.url.split('?')[0]);if(p.endsWith('/'))p+='index.html';
 if(/hex-apps\.json$/.test(p)&&MODE!=='ok'){
   const d=JSON.parse(JSON.stringify(real));
   if(MODE==='badrow'){d.apps[5]={id:'x'};d.apps[9]={name:null,id:'y'};}
   if(MODE==='allbad'){d.apps=[{id:'a'},{id:'b'}];}
   r.writeHead(200,{'Content-Type':'application/json'});return r.end(JSON.stringify(d));}
 const f=path.join(APP,p);if(!f.startsWith(APP)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end();}
 r.writeHead(200,{'Content-Type':M[path.extname(f)]||'application/octet-stream'});r.end(fs.readFileSync(f));});
srv.listen(PORT,'127.0.0.1',async()=>{
 const b=await pup.launch({headless:'new',args:['--no-sandbox']});
 let pass=0,fail=0;const chk=(n,c,d)=>{c?pass++:fail++;console.log(`  ${c?'ok  ':'FAIL'} ${n}${c?'':'  <- '+String(d).slice(0,90)}`)};
 async function load(){const pg=await b.newPage();await pg.setRequestInterception(true);
  pg.on('request',r=>{if(/AccessGuard\.js$/.test(r.url()))return r.respond({status:200,contentType:'text/javascript',body:'window.AccessGuard={require:function(){}};'});r.continue();});
  await pg.goto(`http://127.0.0.1:${PORT}/hex/apps.html`,{waitUntil:'networkidle0'});await new Promise(r=>setTimeout(r,600));return pg;}
 MODE='badrow'; let pg=await load();
 let st=await pg.evaluate(()=>({tiles:document.querySelectorAll('.app').length,note:document.getElementById('note').textContent,out:document.getElementById('out').innerText}));
 chk('two malformed rows do NOT take the page down',st.tiles>180,'tiles='+st.tiles);
 chk('  -> and the drop is reported',/dropped as malformed/.test(st.note),st.note.slice(0,100));
 chk('  -> no raw JS error leaks to the DOM',!/localeCompare|undefined \(reading/.test(st.out),st.out.slice(0,80));
 await pg.close();
 MODE='allbad'; pg=await load();
 st=await pg.evaluate(()=>document.getElementById('out').innerText);
 chk('ALL rows malformed says so, not "nothing matches"',/malformed|could not load/i.test(st)&&!/nothing matches/i.test(st),st.slice(0,90));
 await pg.close();
 MODE='ok'; pg=await load();
 st=await pg.evaluate(()=>document.querySelectorAll('.app').length);
 chk('clean manifest still renders every app',st===190,'tiles='+st);
 console.log(`\n  ${pass}/${pass+fail}`);
 await b.close();srv.close();process.exitCode=fail?1:0;});
