// Does ModuleProgress.complete/completeQuiz still work after the tryFirestoreSync refactor?
// It is called by hundreds of modules; a throw here breaks completion platform-wide.
const puppeteer=require('puppeteer');const http=require('http');const fs=require('fs');const path=require('path');
const ROOT=path.resolve(__dirname,'../../../_app');const PORT=8986;
const MIME={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.webp':'image/webp','.png':'image/png'};
const srv=http.createServer((req,res)=>{const p=path.join(ROOT,decodeURIComponent(req.url.split('?')[0]));
 fs.readFile(p,(e,b)=>{if(e){res.writeHead(404);res.end('nf');return;}res.writeHead(200,{'Content-Type':MIME[path.extname(p)]||'application/octet-stream'});res.end(b);});});
srv.listen(PORT,async()=>{
 const b=await puppeteer.launch({headless:'new',args:['--no-sandbox']});
 const page=await b.newPage(); const errs=[];
 page.on('pageerror',e=>errs.push(e.message));
 await page.evaluateOnNewDocument(()=>localStorage.setItem('hexworth_house','cloud'));
 await page.goto(`http://localhost:${PORT}/houses/cloud/openstack/quizzes/cloud-openstack-intro-quiz.quiz.html`,{waitUntil:'domcontentloaded'});
 await new Promise(r=>setTimeout(r,1200));
 const out=await page.evaluate(async()=>{
   const r={};
   try{ r.completeQuiz = await ModuleProgress.completeQuiz('cloud','probe-quiz',88,{maxScore:100,showNotification:false}); r.quizOk=true; }
   catch(e){ r.quizOk=false; r.quizErr=e.message; }
   try{ r.complete = await ModuleProgress.complete('cloud','probe-module',{}); r.completeOk=true; }
   catch(e){ r.completeOk=false; r.completeErr=e.message; }
   try{ r.stats = !!ModuleProgress.getStats(); }catch(e){ r.stats='threw: '+e.message; }
   return r;
 });
 console.log(JSON.stringify(out,null,2));
 console.log('page errors:',errs.length?errs.slice(0,3):'(none)');
 await b.close();srv.close();
 process.exit((out.quizOk&&out.completeOk&&out.stats===true)?0:1);
});
