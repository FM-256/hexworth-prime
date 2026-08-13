#!/usr/bin/env node
/*
 * @catalog what    Every data shape a quiz can leave behind, against the hub's pass/fail gate.
 * @catalog run     node _tools/qa/openstack-quiz-gate-matrix.js
 * @catalog status  GATE
 *
 * WHY. BUG-106: the hub counted a quiz as complete whether the student passed or failed, because
 * it asked whether a score EXISTED. A student who scored 0 on all four got four green chapters.
 *
 * ⚠ AND WHY A MATRIX RATHER THAN ONE CASE. The first fix for that was correct about failure and
 * WRONG about legacy data: a student holding `_score = 85` with no `_passed` beside it lost a
 * chapter they had genuinely passed. Taking away earned work is a worse error than the one being
 * fixed, and the main harness could not see it, because it only ever writes current-shape data.
 * Three signals can each be present or absent, so the shapes are enumerated instead of assumed.
 */
'use strict';
const puppeteer=require('puppeteer'),http=require('http'),fs=require('fs'),path=require('path');
const ROOT='/home/eq/ai-content/hexworth-prime/_app';
const MIME={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.webp':'image/webp'};
const srv=http.createServer((q,r)=>{let p=decodeURIComponent(q.url.split('?')[0]);if(p.endsWith('/'))p+='index.html';
 fs.readFile(path.join(ROOT,p),(e,b)=>{if(e){r.writeHead(404);return r.end('404');}
 r.writeHead(200,{'Content-Type':MIME[path.extname(p)]||'application/octet-stream'});r.end(b);});});
const CASES=[
 {n:'passed: both signals present',        score:'100',passed:'1', struct:true,  want:true},
 {n:'passed: structured record only',      score:null, passed:null,struct:true,  want:true},
 {n:'passed: raw _passed only',            score:'85', passed:'1', struct:false, want:true},
 {n:'LEGACY passing: _score 85, no _passed',score:'85',passed:null,struct:false, want:true},
 {n:'LEGACY boundary: _score exactly 70',  score:'70', passed:null,struct:false, want:true},
 {n:'failed: 0%',                          score:'0',  passed:'0', struct:false, want:false},
 {n:'failed: 69, just under',              score:'69', passed:'0', struct:false, want:false},
 {n:'LEGACY failing: _score 40, no _passed',score:'40',passed:null,struct:false, want:false},
 {n:'never attempted',                     score:null, passed:null,struct:false, want:false},
];
(async()=>{
 await new Promise(r=>srv.listen(0,'127.0.0.1',r)); const port=srv.address().port;
 const b=await puppeteer.launch({headless:'new',args:['--no-sandbox','--disable-setuid-sandbox']});
 let bad=0;
 for(const c of CASES){
   const p=await b.newPage();
   await p.evaluateOnNewDocument(cfg=>{
     localStorage.clear();
     localStorage.setItem('hexworth_house','cloud'); localStorage.setItem('hexworth_sorted','true');
     const cloud={'cloud-openstack-intro':{completed:true},'cloud-openstack-install-lab':{completed:true}};
     if(cfg.struct) cloud['openstack-intro-quiz']={completed:true,score:100};
     localStorage.setItem('hexworth_progress',JSON.stringify({cloud}));
     if(cfg.score!==null) localStorage.setItem('hexworth_openstack_lesson1_quiz_score',cfg.score);
     if(cfg.passed!==null) localStorage.setItem('hexworth_openstack_lesson1_quiz_passed',cfg.passed);
   },c);
   await p.goto(`http://127.0.0.1:${port}/houses/cloud/openstack/index.html`,{waitUntil:'domcontentloaded'});
   await new Promise(r=>setTimeout(r,700));
   const got=await p.evaluate(()=>document.querySelectorAll('.module-card')[0].classList.contains('completed'));
   const ok=got===c.want;
   if(!ok)bad++;
   console.log(`  ${ok?'PASS':'FAIL'}  ${c.n.padEnd(42)} -> complete=${got} (want ${c.want})`);
   await p.close();
 }
 await b.close(); srv.close();
 console.log(`\n  ${CASES.length-bad}/${CASES.length} edge cases correct`);
 process.exit(bad?1:0);
})().catch(e=>{console.error('ERR '+e.message);process.exit(1);});
