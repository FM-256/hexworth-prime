const http=require('http'),fs=require('fs'),path=require('path'),pup=require('puppeteer');
const APP=path.resolve('_app'),PORT=9151;
const M={'.html':'text/html','.js':'text/javascript','.json':'application/json','.webp':'image/webp','.css':'text/css'};
const srv=http.createServer((q,r)=>{let p=decodeURIComponent(q.url.split('?')[0]);if(p.endsWith('/'))p+='index.html';
 const f=path.join(APP,p);if(!f.startsWith(APP)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end();}
 r.writeHead(200,{'Content-Type':M[path.extname(f)]||'application/octet-stream'});r.end(fs.readFileSync(f));});
srv.listen(PORT,'127.0.0.1',async()=>{
 const b=await pup.launch({headless:'new',args:['--no-sandbox']});
 let pass=0,fail=0;const chk=(n,c,d)=>{c?pass++:fail++;console.log(`  ${c?'ok  ':'FAIL'} ${n}${c?'':'  <- '+String(d).slice(0,80)}`)};
 async function count(house){const pg=await b.newPage();
   await pg.evaluateOnNewDocument(h=>{try{h?localStorage.setItem('hexworth_house',h):localStorage.removeItem('hexworth_house')}catch(e){}},house);
   try{await pg.goto(`http://127.0.0.1:${PORT}/dashboard.html`,{waitUntil:'domcontentloaded',timeout:25000});}catch(e){}
   await new Promise(r=>setTimeout(r,500));
   const n=await pg.evaluate(()=>({shell:document.querySelectorAll('.hb-link[href="/hex/"]').length,
     grid:document.querySelectorAll('.hb-link[href="/hex/apps.html"]').length,
     pill:document.querySelectorAll('.hexos-callout').length}));
   await pg.close();return n;}
 const un=await count(null), so=await count('matrix');
 chk('SORTED sees the shell link',so.shell===1,JSON.stringify(so));
 chk('SORTED sees the grid link',so.grid===1,JSON.stringify(so));
 chk('SORTED sees the pill',so.pill===1,JSON.stringify(so));
 chk('UNSORTED sees NEITHER link',un.shell===0&&un.grid===0,JSON.stringify(un));
 chk('UNSORTED sees no pill',un.pill===0,JSON.stringify(un));
 const pg=await b.newPage();
 await pg.goto(`http://127.0.0.1:${PORT}/hex/apps.html`,{waitUntil:'domcontentloaded'}).catch(()=>{});
 chk('the grid page itself still loads',(await pg.evaluate(()=>!!document.getElementById('cats'))),'');
 console.log(`\n  ${pass}/${pass+fail}`);
 await b.close();srv.close();process.exitCode=fail?1:0;});
