const puppeteer=require('puppeteer');const http=require('http');const fs=require('fs');const path=require('path');
const ROOT=path.resolve(__dirname,'../../../_app');const PORT=8992;
const MIME={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.webp':'image/webp','.png':'image/png','.svg':'image/svg+xml'};
const srv=http.createServer((q,s)=>{const p=path.join(ROOT,decodeURIComponent(q.url.split('?')[0]));
 fs.readFile(p,(e,b)=>{if(e){s.writeHead(404);s.end('nf');return;}s.writeHead(200,{'Content-Type':MIME[path.extname(p)]||'application/octet-stream'});s.end(b);});});
srv.listen(PORT,async()=>{
 const b=await puppeteer.launch({headless:'new',args:['--no-sandbox']});let ok=false;
 try{
  const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
  await p.evaluateOnNewDocument(()=>localStorage.setItem('hexworth_house','shield'));
  await p.goto(`http://localhost:${PORT}/houses/shield/incubator/index.html`,{waitUntil:'domcontentloaded',timeout:30000});
  await new Promise(r=>setTimeout(r,1500));
  const r=await p.evaluate(()=>{
    const a=document.querySelector('a[data-module="shield-cysa-toolkit"]');
    return {found:!!a, href:a?a.getAttribute('href'):null, title:a?a.querySelector('.card-title').textContent:null,
            visible:a?!!(a.offsetWidth||a.offsetHeight):false, cards:document.querySelectorAll('[data-module]').length};
  });
  console.log('  card present :',r.found,'| visible:',r.visible);
  console.log('  title        :',r.title);
  console.log('  href         :',r.href);
  console.log('  total cards  :',r.cards);
  if(r.href){const st=await p.goto(`http://localhost:${PORT}${r.href}`,{waitUntil:'domcontentloaded'}).then(x=>x.status()).catch(()=>0);
    console.log('  link resolves:',st); ok=r.found&&r.visible&&st===200;}
  console.log('  page errors  :',errs.length?errs.slice(0,2):'(none)');
  await p.close();
 } finally{await b.close().catch(()=>{});srv.close();}
 console.log(ok?'\n  INCUBATOR CARD VERIFY PASS':'\n  FAIL');process.exit(ok?0:1);
});
