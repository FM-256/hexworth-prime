const puppeteer=require('puppeteer'),http=require('http'),fs=require('fs'),path=require('path');
const ROOT=path.resolve('_app');
const MIME={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json'};
const srv=http.createServer((q,r)=>{let p=decodeURIComponent(q.url.split('?')[0]);if(p.endsWith('/'))p+='index.html';
fs.readFile(path.join(ROOT,p),(e,b)=>{if(e){r.writeHead(404);return r.end('404');}
r.writeHead(200,{'Content-Type':MIME[path.extname(p)]||'application/octet-stream'});r.end(b);});});
(async()=>{await new Promise(r=>srv.listen(0,'127.0.0.1',r));const port=srv.address().port;
const b=await puppeteer.launch({headless:'new',args:['--no-sandbox','--disable-setuid-sandbox']});
const p=await b.newPage();
p.on('console',m=>console.log('  [page]',m.text().slice(0,120)));
p.on('pageerror',e=>console.log('  [pageerror]',e.message.slice(0,140)));
await p.goto(`http://127.0.0.1:${port}/houses/cloud/openstack/quizzes/cloud-openstack-install-quiz.quiz.html`,{waitUntil:'domcontentloaded'});
await new Promise(r=>setTimeout(r,800));
// EXACT reproduction of what the new test's p.evaluate does:
const res=await p.evaluate(()=>{
  const out={};
  out.graderDefined = typeof InstantQuizGrader !== 'undefined';
  try { out.questionsVisible = (typeof questions !== 'undefined'); } catch(e){ out.questionsVisible='THREW: '+e.message; }
  return out;
});
console.log('RESULT:',JSON.stringify(res,null,2));
await b.close();srv.close();})();
