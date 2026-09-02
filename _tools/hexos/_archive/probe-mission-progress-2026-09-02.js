#!/usr/bin/env node
/**
 * @catalog what    BUG-248: proves 52 Operator missions never load ModuleProgress.js, so their
 * @catalog what    completion hook is skipped. Runs WITH CONTROLS (python-03/40 must show present).
 * @catalog run     NODE_PATH=$(pwd)/node_modules node _tools/hexos/_archive/probe-mission-progress-2026-09-02.js
 * @catalog status  PROBE
 *
 * Kept because BUG-248 cites its output. Re-run it before trusting that entry: if the missions
 * have since been given the script tag, the EXPECT ABSENT rows flip and the bug is closed.
 */
/* BUG-248 measured, not grepped. Does a JS mission page actually lack ModuleProgress at runtime,
 * and does a python mission that loads it actually have it? Two fixtures, always: a detector that
 * only ever sees the broken case cannot tell you it is detecting the right thing. Read-only. */
'use strict';
const http=require('http'),fs=require('fs'),path=require('path');
let puppeteer; try{puppeteer=require('puppeteer');}catch(e){console.error('puppeteer missing');process.exit(2);}
const APP=path.resolve('/home/eq/ai-content/hexworth-prime/_app'),PORT=9315;
const MIME={'.html':'text/html','.js':'text/javascript','.json':'application/json','.css':'text/css'};
const PAGES=[
  ['/operator/missions/js-01.mission.html','EXPECT ABSENT'],
  ['/operator/missions/js-25.mission.html','EXPECT ABSENT'],
  ['/operator/missions/python-01.mission.html','EXPECT ABSENT'],
  ['/operator/missions/python-03.mission.html','EXPECT PRESENT (control)'],
  ['/operator/missions/python-40.mission.html','EXPECT PRESENT (control)'],
];
const srv=http.createServer((q,r)=>{let p=decodeURIComponent(q.url.split('?')[0]);if(p.endsWith('/'))p+='index.html';
  const f=path.join(APP,p);if(!f.startsWith(APP)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end();}
  r.writeHead(200,{'Content-Type':MIME[path.extname(f)]||'application/octet-stream'});r.end(fs.readFileSync(f));});
srv.on('error',e=>{console.error('bind failed',e.code);process.exit(1);});
srv.listen(PORT,'127.0.0.1',async()=>{
  const b=await puppeteer.launch({headless:'new',args:['--no-sandbox']});
  console.log('  page                                        window.MP  typeof MP   expectation');
  let bad=0;
  for(const [u,exp] of PAGES){
    const pg=await b.newPage();
    await pg.setRequestInterception(true);
    pg.on('request',r=>{const url=r.url();
      if(/AccessGuard\.js$/.test(url))return r.respond({status:200,contentType:'text/javascript',body:'window.AccessGuard={require:function(){},redirect:function(){}};'});
      if(!url.startsWith(`http://127.0.0.1:${PORT}`))return r.abort();
      r.continue();});
    try{await pg.goto(`http://127.0.0.1:${PORT}${u}`,{waitUntil:'domcontentloaded',timeout:15000});}
    catch(e){console.log(`  ${u.padEnd(44)} LOAD FAIL`);await pg.close();continue;}
    await new Promise(r=>setTimeout(r,800));
    const res=await pg.evaluate(()=>({
      win:typeof window.ModuleProgress,
      lex:(function(){try{return typeof ModuleProgress;}catch(e){return 'throw';}})(),
    }));
    const present=res.win!=='undefined';
    const shouldBe=exp.startsWith('EXPECT PRESENT');
    if(present!==shouldBe)bad++;
    console.log(`  ${u.replace('/operator/missions/','').padEnd(44)} ${res.win.padEnd(10)} ${res.lex.padEnd(11)} ${exp}${present===shouldBe?'':'   <-- MISMATCH'}`);
    await pg.close();
  }
  await b.close();srv.close();
  console.log(`\n  expectation mismatches: ${bad}`);
});
