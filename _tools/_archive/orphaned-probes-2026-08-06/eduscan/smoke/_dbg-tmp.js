const puppeteer=require('puppeteer');const http=require('http');const fs=require('fs');const path=require('path');
const ROOT=path.resolve('/home/eq/ai-content/hexworth-prime/_app');const PORT=8978;
const MIME={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json'};
const srv=http.createServer((req,res)=>{const p=path.join(ROOT,decodeURIComponent(req.url.split('?')[0]));
 fs.readFile(p,(e,b)=>{if(e){res.writeHead(404);res.end('nf');return;}res.writeHead(200,{'Content-Type':MIME[path.extname(p)]||'application/octet-stream'});res.end(b);});});
srv.listen(PORT,async()=>{
const b=await puppeteer.launch({headless:'new',args:['--no-sandbox']});
const page=await b.newPage();
page.on('pageerror',e=>console.log('PAGEERROR:',e.message));
page.on('console',m=>console.log('CONSOLE['+m.type()+']:',m.text().slice(0,200)));
await page.evaluateOnNewDocument(()=>{
 localStorage.setItem('hexworth_house','cloud');
 window.__signedIn=true;
 window.FirebaseAuth={waitForAuth:()=>Promise.resolve(window.__signedIn?{uid:'u'}:null),isSignedIn:()=>window.__signedIn,
  callFunction:()=>Promise.resolve({data:{results:{}}})};
 window.ModuleProgress={completeQuiz:()=>{}};
});
await page.goto(`http://localhost:${PORT}/houses/cloud/openstack/quizzes/cloud-openstack-intro-quiz.quiz.html`,{waitUntil:'domcontentloaded'});
await new Promise(r=>setTimeout(r,800));
console.log('--- pre-start ---');
console.log(await page.evaluate(()=>({
 url:location.href,
 hasStartQuiz:typeof startQuiz,
 hasIQG:typeof InstantQuizGrader,
 hasFA:typeof FirebaseAuth,
 startDisp:document.getElementById('startScreen')?.style.display,
 quizDisp:document.getElementById('quizScreen')?.style.display,
})));
const r=await page.evaluate(async()=>{ try{ await startQuiz(); return 'ok'; }catch(e){ return 'THREW: '+e.message; } });
console.log('startQuiz ->',r);
await new Promise(r=>setTimeout(r,500));
console.log(await page.evaluate(()=>({
 quizDisp:document.getElementById('quizScreen')?.style.display,
 notice:document.getElementById('signInNotice')?.style.display,
 optCount:document.querySelectorAll('.option').length,
 qtext:document.getElementById('questionText')?.textContent?.slice(0,60),
})));
await b.close();srv.close();});
