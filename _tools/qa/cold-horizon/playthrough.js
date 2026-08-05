#!/usr/bin/env node
/**
 * playthrough.js — drive COLD HORIZON through a full mission in a real browser.
 *
 * This exercises the SHIPPING code path via the ?qa=1 seam: real raycaster, real
 * scan timer, real objective state machine, real decision handler. Nothing is
 * stubbed. The one concession to wall-clock is that three of the four panels are
 * completed through the same function the [F] hold calls — the FIRST panel is
 * scanned by actually holding the key, which is what proves the input path.
 */
'use strict';
const http = require('http'), fs = require('fs'), path = require('path');
const puppeteer = require('/home/eq/ai-content/hexworth-prime/node_modules/puppeteer');

const ROOT = '/home/eq/ai-content/hexworth-prime/_app';
const SHOTS = '/tmp/claude-1000/-home-eq/d7b814d9-d937-47c0-8ed6-0ba92645deec/scratchpad';
const MIME = {'.html':'text/html','.js':'text/javascript','.css':'text/css',
  '.json':'application/json','.webp':'image/webp','.png':'image/png','.svg':'image/svg+xml'};

const server = http.createServer((req,res)=>{
  let p = decodeURIComponent(req.url.split('?')[0]);
  if(p.endsWith('/')) p += 'index.html';
  const f = path.join(ROOT,p);
  fs.readFile(f,(e,buf)=>{
    if(e){ res.writeHead(404); return res.end('404'); }
    res.writeHead(200,{'Content-Type':MIME[path.extname(f)]||'application/octet-stream'});
    res.end(buf);
  });
});

const results = [];
function check(name, pass, detail){
  results.push({name, pass, detail});
  console.log(`  ${pass?'PASS':'FAIL'}  ${name}${detail?'  -> '+detail:''}`);
}

(async ()=>{
  await new Promise(r=>server.listen(0,'127.0.0.1',r));
  const port = server.address().port;
  const url = `http://127.0.0.1:${port}/houses/cloud/games/cloud-cold-horizon.html?qa=1`;

  const browser = await puppeteer.launch({ headless:'new',
    args:['--no-sandbox','--disable-setuid-sandbox','--use-gl=angle',
          '--use-angle=swiftshader','--enable-unsafe-swiftshader',
          '--window-size=1600,900'] });
  const page = await browser.newPage();
  await page.setViewport({width:1600,height:900});

  const errs=[];
  page.on('pageerror', e=> errs.push('PAGEERROR: '+e.message));
  page.on('console', m=>{ if(m.type()==='error') errs.push('CONSOLE: '+m.text()); });

  await page.evaluateOnNewDocument(()=>{
    localStorage.setItem('hexworth_house','cloud');
    localStorage.setItem('hexworth_sorted','true');
  });
  await page.goto(url,{waitUntil:'domcontentloaded',timeout:60000});
  await new Promise(r=>setTimeout(r,3500));

  const sleep = ms => new Promise(r=>setTimeout(r,ms));
  const Q = (fn,...a) => page.evaluate(fn,...a);

  console.log('\n--- COLD HORIZON playthrough ---\n');

  // 1. QA seam present
  const hasSeam = await Q(()=> !!window.__COLD_HORIZON_QA__);
  check('QA seam attached under ?qa=1', hasSeam);
  if(!hasSeam){ console.log('cannot continue'); await browser.close(); server.close(); process.exit(1); }

  // 2. start
  await Q(()=>document.getElementById('startBtn').click());
  await sleep(1200);
  let s = await Q(()=>window.__COLD_HORIZON_QA__.snapshot());
  check('mission running after ASSUME TELEOPERATION', s.running===true, JSON.stringify({running:s.running}));

  // 3. approach objective fires on proximity
  await Q(()=>window.__COLD_HORIZON_QA__.aimAt('HELIOS-7', 24));
  await sleep(900);
  s = await Q(()=>window.__COLD_HORIZON_QA__.snapshot());
  check('objective 1 (close to 40 m) completes on approach', s.objs[0]===true,
        'range='+s.range+'m');

  // 4. raycast target acquisition — real Raycaster against real geometry
  const aimedId = await Q(()=>window.__COLD_HORIZON_QA__.aimedId());
  check('reticle acquires HELIOS-7 radiator via raycast', aimedId==='HELIOS-7',
        'aimed='+aimedId);

  // 5. thermal camera
  await Q(()=>window.__COLD_HORIZON_QA__.toggleThermal());
  await sleep(700);
  s = await Q(()=>window.__COLD_HORIZON_QA__.snapshot());
  check('IR camera toggles and completes objective 2', s.thermal===true && s.objs[1]===true,
        'thermal='+s.thermal);

  await page.screenshot({path: path.join(SHOTS,'shot-thermal.png')});

  // 6. THE REAL INPUT PATH: hold [F] and let the scan timer run to completion.
  // NB: dt is clamped to 0.05 s/frame to keep the integrator stable, so under
  // software rendering (a few fps) the scan advances well below wall-clock.
  // Poll rather than assume a duration.
  await page.keyboard.down('f');
  let mid = null;
  for(let i=0;i<40;i++){
    await sleep(750);
    mid = await Q(()=>window.__COLD_HORIZON_QA__.snapshot());
    if(i===0) console.log('    [preconditions mid-hold] ' +
      JSON.stringify({keyF:mid.keyF, aimed:mid.aimed, thermal:mid.thermal}));
    if(mid.scanned.includes('HELIOS-7')) break;
  }
  console.log('    [scanT reached] ' + mid.scanT);
  await page.keyboard.up('f');
  await sleep(500);
  s = await Q(()=>window.__COLD_HORIZON_QA__.snapshot());
  check('holding [F] integrates the panel (real timer path)',
        s.scanned.includes('HELIOS-7'), 'scanned='+JSON.stringify(s.scanned));
  check('IR reading is physical truth (58.9) not the 41.3 vote',
        Math.abs((s.readings['HELIOS-7']||0) - 58.9) < 0.01,
        'read='+s.readings['HELIOS-7']);

  // 7. remaining three panels
  for(const id of ['VESTA-2','JANUS-4','KEPLER-9']){
    await Q(nid=>window.__COLD_HORIZON_QA__.forceScan(nid), id);
    await sleep(250);
  }
  await sleep(2200);
  s = await Q(()=>window.__COLD_HORIZON_QA__.snapshot());
  check('all four panels logged -> objective 3', s.objs[2]===true && s.scanned.length===4,
        'n='+s.scanned.length);
  check('decision modal opens automatically', s.decOpen===true);

  await page.screenshot({path: path.join(SHOTS,'shot-decision.png')});

  // 8. the call
  await Q(()=>window.__COLD_HORIZON_QA__.decide('ir'));
  await sleep(900);
  s = await Q(()=>window.__COLD_HORIZON_QA__.snapshot());
  check('choosing the IR reading is scored correct',
        s.correct===true && s.endOpen===true, 'title='+s.endTitle);
  check('objective 4 completes', s.objs[3]===true);

  await page.screenshot({path: path.join(SHOTS,'shot-end.png')});

  // 9. wrong answer path must also resolve (no dead end)
  const wrong = await page.browser().newPage();
  await wrong.setViewport({width:1280,height:720});
  await wrong.evaluateOnNewDocument(()=>{
    localStorage.setItem('hexworth_house','cloud');
    localStorage.setItem('hexworth_sorted','true');
  });
  await wrong.goto(url,{waitUntil:'domcontentloaded',timeout:60000});
  await sleep(3000);
  await wrong.evaluate(()=>{
    document.getElementById('startBtn').click();
    const q = window.__COLD_HORIZON_QA__;
    ['VESTA-2','HELIOS-7','JANUS-4','KEPLER-9'].forEach(id=>q.forceScan(id));
    q.decide('vote');
  });
  await sleep(800);
  const w = await wrong.evaluate(()=>window.__COLD_HORIZON_QA__.snapshot());
  check('incorrect call still reaches a scored end card',
        w.endOpen===true && w.correct===false, 'title='+w.endTitle);
  await wrong.close();

  // 10. "spot the outlier" path — right channel, unsafe reasoning. The box canon
  //     explicitly warns this is the trap, so it must NOT score as a clean win.
  const trap = await page.browser().newPage();
  await trap.setViewport({width:1280,height:720});
  await trap.evaluateOnNewDocument(()=>{
    localStorage.setItem('hexworth_house','cloud');
    localStorage.setItem('hexworth_sorted','true');
  });
  await trap.goto(url,{waitUntil:'domcontentloaded',timeout:60000});
  await sleep(3000);
  await trap.evaluate(()=>{
    document.getElementById('startBtn').click();
    const q = window.__COLD_HORIZON_QA__;
    ['VESTA-2','HELIOS-7','JANUS-4','KEPLER-9'].forEach(id=>q.forceScan(id));
    q.decide('outlier');
  });
  await sleep(800);
  const t = await trap.evaluate(()=>window.__COLD_HORIZON_QA__.snapshot());
  check('picking TH-2 as "the outlier" is NOT scored a clean win',
        t.endOpen===true && t.correct===false, 'title='+t.endTitle);
  check('the outlier path gets its own reasoning-specific ending',
        /UNSAFE REASONING/.test(t.endTitle), 'title='+t.endTitle);
  await trap.close();

  console.log('\n=== ERRORS ('+errs.length+') ===');
  errs.slice(0,20).forEach(e=>console.log('  '+e.slice(0,300)));

  const failed = results.filter(r=>!r.pass).length;
  console.log(`\n${results.length-failed}/${results.length} checks passed, ${errs.length} runtime errors\n`);

  await browser.close(); server.close();
  process.exit(failed || errs.length ? 1 : 0);
})();
