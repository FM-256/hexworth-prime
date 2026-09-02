// The launcher grid is the other half of Hex OS and has never had the sweep the shell just got.
// Same method: use it the way a student would, including the ways they get it wrong.
const http=require('http'),fs=require('fs'),path=require('path');
const pup=require('/home/eq/ai-content/hexworth-prime/node_modules/puppeteer');
const APP='/home/eq/ai-content/hexworth-prime/_app',PORT=9217;
const T={'.html':'text/html','.js':'text/javascript','.json':'application/json','.css':'text/css','.webp':'image/webp','.png':'image/png','.webmanifest':'application/manifest+json'};
http.createServer((q,r)=>{let p=decodeURIComponent(q.url.split('?')[0]);if(p.endsWith('/'))p+='index.html';
 const f=path.join(APP,p);if(!f.startsWith(APP)||!fs.existsSync(f)||fs.statSync(f).isDirectory())return r.writeHead(404),r.end();
 r.writeHead(200,{'Content-Type':T[path.extname(f)]||'application/octet-stream'});r.end(fs.readFileSync(f));
}).listen(PORT,'127.0.0.1',async()=>{
 const O=`http://localhost:${PORT}`;
 const b=await pup.launch({headless:'new',args:['--no-sandbox']});const pg=await b.newPage();
 const errs=[];pg.on('pageerror',e=>errs.push(e.message.split('\n')[0]));
 const missing=[];
 await pg.setRequestInterception(true);
 pg.on('request',r=>{const u=r.url();
   if(/AccessGuard\.js$/.test(u))return r.respond({status:200,contentType:'text/javascript',body:'window.AccessGuard={require:function(){}};'});
   if(!u.startsWith(O))return r.abort();
   r.continue();});
 pg.on('response',r=>{if(r.status()>=400&&r.url().startsWith(O))missing.push(`${r.status()} ${r.url().replace(O,'')}`);});
 await pg.goto(O+'/hex/apps.html',{waitUntil:'networkidle0'});
 await new Promise(r=>setTimeout(r,1800));

 const g=await pg.evaluate(()=>{
   const cards=[...document.querySelectorAll('a[href], .app-card, [data-app]')];
   const links=[...document.querySelectorAll('a[href]')];
   const imgs=[...document.querySelectorAll('img')];
   return {
     linkCount:links.length,
     brokenImgs:imgs.filter(i=>i.complete&&i.naturalWidth===0).length,
     totalImgs:imgs.length,
     imgsNoAlt:imgs.filter(i=>!i.hasAttribute('alt')).length,
     offOrigin:links.filter(a=>a.href&&!a.href.startsWith(location.origin)).map(a=>a.href).slice(0,5),
     emptyHrefs:links.filter(a=>{const h=a.getAttribute('href');return !h||h==='#'||h==='';}).length,
     hasSearch:!!document.querySelector('input[type=search],input[type=text],#q,#search'),
     bodyText:document.body.innerText.length
   };});
 console.log('  links on the grid        :',g.linkCount);
 console.log('  images                   :',g.totalImgs,' broken:',g.brokenImgs,' missing alt:',g.imgsNoAlt);
 console.log('  empty/# hrefs            :',g.emptyHrefs);
 console.log('  off-origin links         :',g.offOrigin.length?g.offOrigin.join(', '):'none');
 console.log('  has a search/filter box  :',g.hasSearch);
 console.log('  rendered text length     :',g.bodyText);
 console.log('  4xx/5xx requests         :',missing.length?missing.slice(0,6).join(' | '):'none');
 console.log('  page errors              :',errs.length?errs.join(' | ').slice(0,160):'none');

 // Does every card href resolve, and does the grid cover the manifest?
 const manifest=JSON.parse(fs.readFileSync(path.join(APP,'data/hex-apps.json'),'utf8')).apps;
 const hrefs=await pg.evaluate(()=>[...document.querySelectorAll('a[href]')].map(a=>a.getAttribute('href')));
 const entrySet=new Set(manifest.map(a=>a.entry));
 const linkedEntries=hrefs.filter(h=>entrySet.has(h));
 console.log('  manifest apps            :',manifest.length);
 console.log('  cards linking a manifest entry:',linkedEntries.length);
 const unlinked=manifest.filter(a=>!hrefs.includes(a.entry)).map(a=>a.id);
 console.log('  manifest apps NOT on grid:',unlinked.length, unlinked.length?('e.g. '+unlinked.slice(0,6).join(', ')):'');
 await b.close();process.exit(0);});
