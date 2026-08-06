// Verifies BUG-074 on a deployed lane using a REAL quiz page (not a synthetic harness page).
// Calls completeQuiz on the deployed ModuleProgress and asserts it does not throw and that the
// stylesheet it needed is injected. returnToDashboard:false so the probe is not navigated away.
const puppeteer=require('puppeteer');
const BASE=process.env.BASE;
const URL=BASE+'/houses/cloud/openstack/quizzes/cloud-openstack-intro-quiz.quiz.html';
(async()=>{
 const b=await puppeteer.launch({headless:'new',args:['--no-sandbox']});
 let ok=true;
 try{
  const p=await b.newPage(); const errs=[];
  p.on('pageerror',e=>errs.push(e.message));
  await p.evaluateOnNewDocument(()=>{localStorage.clear();localStorage.setItem('hexworth_house','cloud');});
  await p.goto(URL,{waitUntil:'domcontentloaded',timeout:40000});
  await new Promise(r=>setTimeout(r,2500));
  const r=await p.evaluate(async()=>{
    const o={hasEnsure:false,stylesBefore:!!document.getElementById('module-progress-styles')};
    try{ await ModuleProgress.completeQuiz('cloud','lane-verify-074',88,{returnToDashboard:false}); o.resolved=true; }
    catch(e){ o.resolved=false; o.err=e.message; }
    o.stylesAfter=!!document.getElementById('module-progress-styles');
    o.notification=!!document.querySelector('.quiz-notification');
    return o;});
  const refErr=errs.filter(e=>/showCompletionNotification is not defined/.test(e));
  console.log(`  completeQuiz resolved on lane : ${r.resolved}${r.err?' ('+r.err+')':''}`);
  console.log(`  stylesheet injected           : ${r.stylesBefore} -> ${r.stylesAfter}`);
  console.log(`  notification rendered         : ${r.notification}`);
  console.log(`  ReferenceError seen           : ${refErr.length}`);
  ok = r.resolved===true && r.stylesAfter===true && r.notification===true && refErr.length===0;
  await p.close();
 } finally { await b.close().catch(()=>{}); }
 console.log(ok?'\n  LANE VERIFY PASS':'\n  LANE VERIFY FAIL');
 process.exit(ok?0:1);
})();
