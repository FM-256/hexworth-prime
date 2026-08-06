// Temp diagnostic for forge-soho-rescue empty-render. Loads headless behind stubbed
// auth guards and reports runtime visible-content + hidden containers + page errors.
import http from 'http'; import fs from 'fs'; import path from 'path'; import puppeteer from 'puppeteer';
const APP = path.resolve('_app');
// MIME map so the local static server serves each asset with the right content type.
const MIME={'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.json':'application/json','.css':'text/css','.webp':'image/webp','.png':'image/png','.svg':'image/svg+xml','.woff2':'font/woff2','.jpg':'image/jpeg'};
// Static file server rooted at _app so the lab loads same-origin with its real relative assets.
const srv=http.createServer((q,s)=>{let p=decodeURIComponent(q.url.split('?')[0]);let fp=path.join(APP,p);if(fp.startsWith(APP)&&fs.existsSync(fp)&&fs.statSync(fp).isFile()){s.writeHead(200,{'Content-Type':MIME[path.extname(fp)]||'application/octet-stream'});fs.createReadStream(fp).pipe(s);}else{s.writeHead(404);s.end('nf');}});
await new Promise(r=>srv.listen(0,r)); const port=srv.address().port;
const b=await puppeteer.launch({headless:'new',args:['--no-sandbox']});
const pg=await b.newPage();
// Capture uncaught page errors so we can tell a real crash from a benign empty-render.
const errs=[]; pg.on('pageerror',e=>errs.push(String(e.message).slice(0,180)));
await pg.setRequestInterception(true);
// Stub the auth-guard scripts so the lab renders its content instead of redirecting to the dashboard.
pg.on('request',r=>{const u=r.url();
 if(u.endsWith('AccessGuard.js'))r.respond({status:200,contentType:'text/javascript',body:"window.AccessGuard={require:()=>Promise.resolve({allowed:true,account:{type:'admin'}}),guard:()=>Promise.resolve(true),init:()=>{},check:()=>Promise.resolve(true)};"});
 else if(u.endsWith('FirebaseAuth.js'))r.respond({status:200,contentType:'text/javascript',body:"window.FirebaseAuth={waitForAuth:async()=>({displayName:'QC',uid:'q'}),isAdmin:()=>true,onReady:cb=>cb&&cb({})};"});
 else if(u.endsWith('AccountFrame.js'))r.respond({status:200,contentType:'text/javascript',body:"window.AccountFrame={getAccountType:()=>'admin',init:()=>{}};"});
 else r.continue();});
await pg.goto('http://localhost:'+port+'/houses/forge/applets/comptia-aplus/core-1/labs/forge-soho-rescue.lab.html',{waitUntil:'domcontentloaded',timeout:20000});
await new Promise(r=>setTimeout(r,1200));
// Inspect the live DOM: measure visible text, count visible elements, and list hidden
// id-containers (game "screens" toggled display:none) to explain the low runtime innerText.
const info=await pg.evaluate(()=>{
  const vis=[...document.body.querySelectorAll('*')].filter(e=>{const s=getComputedStyle(e);return s.display!=='none'&&s.visibility!=='hidden'&&e.offsetParent!==null;});
  const hidden=[...document.querySelectorAll('*')].filter(e=>getComputedStyle(e).display==='none'&&e.id).map(e=>'#'+e.id).slice(0,12);
  return {innerTextLen:document.body.innerText.trim().length, innerTextSample:document.body.innerText.trim().slice(0,160), visibleEls:vis.length, hiddenIdContainers:hidden, bodyChildren:[...document.body.children].map(c=>c.tagName+(c.id?'#'+c.id:'')+' disp='+getComputedStyle(c).display)};
});
console.log(JSON.stringify({pageErrors:errs, ...info},null,2));
await b.close(); srv.close();
