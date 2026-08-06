const puppeteer=require('puppeteer');
(async()=>{
 const b=await puppeteer.launch({headless:'new',args:['--no-sandbox']});
 const p=await b.newPage(); const errs=[];
 p.on('pageerror',e=>errs.push(e.message));
 await p.goto('https://hexworth.com/favicon.ico',{waitUntil:'domcontentloaded'}).catch(()=>{});
 await p.evaluate(()=>localStorage.setItem('hexworth_house','web'));
 await p.goto('https://hexworth.com/houses/web/net-essentials/quizzes/cr-w2-network.quiz.html',{waitUntil:'domcontentloaded',timeout:45000});
 await new Promise(r=>setTimeout(r,4000));
 console.log('page errors on an untouched page:', errs.length?errs:'(none yet -- fires on auth state change)');
 await b.close();
})();
