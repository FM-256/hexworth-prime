// Does the newly-curated module actually appear on the security-operations course page,
// and does its link resolve? A scanner saying "curated" is not a student seeing it.
const puppeteer=require('puppeteer');const http=require('http');const fs=require('fs');const path=require('path');
const ROOT=path.resolve(__dirname,'../../../_app');const PORT=8991;
const MIME={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.webp':'image/webp','.png':'image/png','.svg':'image/svg+xml'};
const srv=http.createServer((q,s)=>{const p=path.join(ROOT,decodeURIComponent(q.url.split('?')[0]));
 fs.readFile(p,(e,b)=>{if(e){s.writeHead(404);s.end('nf');return;}s.writeHead(200,{'Content-Type':MIME[path.extname(p)]||'application/octet-stream'});s.end(b);});});
srv.listen(PORT,async()=>{
 const b=await puppeteer.launch({headless:'new',args:['--no-sandbox']});
 let ok=false;
 try{
  const p=await b.newPage();const errs=[];
  p.on('pageerror',e=>errs.push(e.message));
  await p.evaluateOnNewDocument(()=>localStorage.setItem('hexworth_house','shield'));
  await p.goto(`http://localhost:${PORT}/houses/security-operations/index.html`,{waitUntil:'domcontentloaded',timeout:30000});
  await new Promise(r=>setTimeout(r,2500));
  const r=await p.evaluate(()=>{
    const txt=document.body.innerText;
    const a=[...document.querySelectorAll('a[href]')].find(x=>x.getAttribute('href').includes('shield-cysa-analyst-toolkit'));
    return {mentions:txt.includes('CySA+ v3 Analyst Toolkit'), href:a?a.getAttribute('href'):null,
            totalCards:document.querySelectorAll('a[href]').length};
  });
  console.log('  page mentions the toolkit :',r.mentions);
  console.log('  link present              :',r.href||'NONE');
  console.log('  page errors               :',errs.length?errs.slice(0,2):'(none)');
  if(r.href){
    const u=new URL(r.href,`http://localhost:${PORT}/houses/security-operations/`);
    const st=await p.goto(u.toString(),{waitUntil:'domcontentloaded'}).then(x=>x.status()).catch(()=>0);
    console.log('  link resolves             :',st);
    ok = r.mentions && st===200;
  }
  await p.close();
 } finally { await b.close().catch(()=>{}); srv.close(); }
 console.log(ok?'\n  RENDER VERIFY PASS':'\n  RENDER VERIFY FAIL');
 process.exit(ok?0:1);
});
