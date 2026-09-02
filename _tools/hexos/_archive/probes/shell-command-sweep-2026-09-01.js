// Exercise every Hex OS command the way a student would, including the ways they get it wrong.
// The operator found `run incubator` by USING the shell; no gate saw it. This is that, systematic.
const http=require('http'),fs=require('fs'),path=require('path');
const pup=require('/home/eq/ai-content/hexworth-prime/node_modules/puppeteer');
const APP='/home/eq/ai-content/hexworth-prime/_app',PORT=9213;
const T={'.html':'text/html','.js':'text/javascript','.json':'application/json','.css':'text/css','.webp':'image/webp','.webmanifest':'application/manifest+json'};
http.createServer((q,r)=>{let p=decodeURIComponent(q.url.split('?')[0]);if(p.endsWith('/'))p+='index.html';
 const f=path.join(APP,p);if(!f.startsWith(APP)||!fs.existsSync(f)||fs.statSync(f).isDirectory())return r.writeHead(404),r.end();
 r.writeHead(200,{'Content-Type':T[path.extname(f)]||'application/octet-stream'});r.end(fs.readFileSync(f));
}).listen(PORT,'127.0.0.1',async()=>{
 const b=await pup.launch({headless:'new',args:['--no-sandbox']});const pg=await b.newPage();
 const errs=[];pg.on('pageerror',e=>errs.push(e.message.split('\n')[0]));
 await pg.setRequestInterception(true);
 pg.on('request',r=>{const u=r.url();
   if(/AccessGuard\.js$/.test(u))return r.respond({status:200,contentType:'text/javascript',body:'window.AccessGuard={require:function(){}};'});
   if(!u.startsWith(`http://localhost:${PORT}`))return r.abort();
   r.continue();});
 await pg.goto(`http://localhost:${PORT}/hex/`,{waitUntil:'networkidle0'});
 await new Promise(r=>setTimeout(r,1200));
 const run=async(cmd)=>{
   const before=await pg.evaluate(()=>(document.getElementById('out')||document.body).innerText.length);
   await pg.evaluate(c=>{const i=document.getElementById('cmd');if(!i)return;i.value=c;
     i.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true}));},cmd);
   await new Promise(r=>setTimeout(r,420));
   return pg.evaluate(b=>{const o=document.getElementById('out')||document.body;
     return o.innerText.slice(b).trim();},before);
 };
 const CASES=[
  // valid
  'help','ls','ls incubator','ls cloud','search linux','info az-104','man run','man ls',
  // the operator's bug and neighbours
  'run incubator','run course','run house','run platform','cd incubator','cd cloud','ls',
  // empty / missing args
  'run','search','info','man','cd','ls ','stop','restart',
  // nonsense and hostile
  'run zzzz','info zzzz','ls zzzz','man zzzz','search @@@@','run ../../etc/passwd',
  'run <script>alert(1)</script>','ls <img src=x onerror=alert(1)>','notacommand',
  // case and whitespace
  'RUN az-104','  ls  ','LS','Help',
 ];
 const findings=[];
 for(const c of CASES){
   const out=await run(c);
   const flat=out.replace(/\s+/g,' ').trim();
   let flag='';
   if(!flat) flag='NO OUTPUT';
   else if(/undefined|null|NaN|\[object/.test(flat)) flag='LEAKED INTERNAL';
   else if(/<script|onerror=/i.test(out) && !/&lt;/.test(out)) flag='UNESCAPED INPUT';
   findings.push({c,flat:flat.slice(0,88),flag});
 }
 findings.forEach(f=>console.log(`  ${f.flag?'!! ':'   '}$ ${f.c.padEnd(30)} ${f.flag||''} ${f.flat}`));
 console.log('\n  page errors:',errs.length?errs.join(' | ').slice(0,140):'none');
 await b.close();process.exit(0);});
