#!/usr/bin/env node
/*
 * @catalog what    Asserts the OpenStack learning path and the course hub agree on what the course IS.
 * @catalog run     node _tools/qa/openstack-path-agreement-test.js
 * @catalog status  GATE
 *
 * WHY. BUG-107: LearningPaths.js defined this course as 7 modules (four presentations, three
 * labs) while the hub counted 12 and its own copy told students to complete all 12. Two
 * definitions of the same course, neither derived from the other, and the dashboard renders the
 * 7 -- the number a student is likelier to meet first.
 *
 * ⚠ IT COMPARES THE TWO SOURCES RATHER THAN ASSERTING 12. A test that hardcoded the number
 * would go green again the moment someone edited one side to a new wrong value, which is the
 * failure this bug is made of. It also walks a real chapter to prove path progress tracks what
 * a student actually did, because agreeing on a total is worth nothing if the items are wrong.
 */
'use strict';
const puppeteer=require('puppeteer'),http=require('http'),fs=require('fs'),path=require('path');
const ROOT='/home/eq/ai-content/hexworth-prime/_app';
const MIME={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.webp':'image/webp'};
const srv=http.createServer((q,r)=>{let p=decodeURIComponent(q.url.split('?')[0]);if(p.endsWith('/'))p+='index.html';
 fs.readFile(path.join(ROOT,p),(e,b)=>{if(e){r.writeHead(404);return r.end('404');}
 r.writeHead(200,{'Content-Type':MIME[path.extname(p)]||'application/octet-stream'});r.end(b);});});
let pass=0,fail=0; const ck=(n,c,d)=>{c?pass++:fail++;console.log(`  ${c?'PASS':'FAIL'}  ${n}${c?'':'  -> '+d}`)};
(async()=>{
 await new Promise(r=>srv.listen(0,'127.0.0.1',r)); const port=srv.address().port;
 const b=await puppeteer.launch({headless:'new',args:['--no-sandbox','--disable-setuid-sandbox']});
 const p=await b.newPage();
 p.on('pageerror',e=>console.log('  [PAGEERROR]',String(e.message).slice(0,90)));
 await p.evaluateOnNewDocument(()=>{localStorage.clear();localStorage.setItem('hexworth_house','cloud');localStorage.setItem('hexworth_sorted','true');});
 await p.goto(`http://127.0.0.1:${port}/houses/cloud/openstack/index.html`,{waitUntil:'domcontentloaded'});
 await new Promise(r=>setTimeout(r,900));

 const hubTotal=await p.evaluate(()=>{const m=(document.getElementById('progressText')||{}).textContent.match(/\/\s*(\d+)/); return m?Number(m[1]):-1;});
 // LearningPaths is not on the hub; load it in the page to compare definitions
 await p.addScriptTag({url:`http://127.0.0.1:${port}/components/LearningPaths.js`});
 const pathInfo=await p.evaluate(()=>{
   const ov=LearningPaths.getPathOverview('openstack',[]);
   return {total:ov.totalModules, ids:ov.modules.map(m=>m.id), types:ov.modules.map(m=>m.type)};
 });
 ck('the path and the hub now agree on the total', pathInfo.total===hubTotal, `path=${pathInfo.total} hub=${hubTotal}`);
 ck('  and it includes the quizzes and the review', pathInfo.types.filter(t=>t==='quiz').length===4 && pathInfo.types.includes('review'),
    JSON.stringify(pathInfo.types));

 // a student does chapter 1 for real: presentation, lab, quiz
 const prog=await p.evaluate(()=>{
   ModuleProgress.complete('cloud','cloud-openstack-intro');
   ModuleProgress.complete('cloud','cloud-openstack-install-lab',{type:'lab'});
   ModuleProgress.completeQuiz('cloud','openstack-intro-quiz',90,{silent:true,returnToDashboard:false});
   const done=(JSON.parse(localStorage.getItem('hexworth_progress')||'{}').completedModules)||[];
   const ov=LearningPaths.getPathOverview('openstack',done);
   return {completedCount:ov.completedCount, pct:ov.progressPercent, next:(ov.nextModule||{}).id};
 });
 ck('path progress counts all three of chapter 1', prog.completedCount===3, JSON.stringify(prog));
 ck('  percent is 3/12 = 25%', prog.pct===25, String(prog.pct));
 ck('  and the next module is chapter 2, not another chapter-1 item', prog.next==='cloud-openstack-projects', String(prog.next));
 await b.close(); srv.close();
 console.log(`\n  ${pass}/${pass+fail} checks passed`); process.exit(fail?1:0);
})().catch(e=>{console.error('ERR '+e.message);process.exit(1);});
