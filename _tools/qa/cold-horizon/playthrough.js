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
// Screenshots go somewhere that exists. The previous path was a scratchpad from
// a session that has since ended, so every screenshot silently threw.
const SHOTS = process.env.CH_SHOTS || '/tmp/ch-playthrough';
fs.mkdirSync(SHOTS, {recursive:true});
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
  /* THIS SUITE IS LOCAL-ONLY, AND THAT IS DELIBERATE. Do not add a base-URL override to
     point it at hexworth.com: every check here drives window.__COLD_HORIZON_QA__, and that
     seam requires BOTH ?qa=1 AND a localhost hostname (cloud-cold-horizon.html:2200), so on
     production it does not exist and check #1 fails instantly. That is the seam working as
     designed, not a broken deploy. I tried the override on 2026-08-10 and this is what it
     cost. To verify a DEPLOY, boot the live page cold and assert zero uncaught errors plus a
     reachable start state; to verify BEHAVIOUR, run this suite locally. */
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

  /* Poll a page's snapshot until `pred` holds, or give up. Returns the snapshot
     that satisfied it, or null on timeout. A fixed sleep long enough to cover
     the outcome would also pass if the sequence stalled and something else
     opened the card, so the wait has to be a condition, not a duration. */
  async function waitFor(pg, pred, ms){
    const t0 = Date.now();
    while(Date.now() - t0 < ms){
      const snap = await pg.evaluate(()=>window.__COLD_HORIZON_QA__.snapshot());
      if(pred(snap)) return snap;
      await sleep(250);
    }
    return null;
  }

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

  // 5. thermal camera — pressed as a REAL key, not called through the seam.
  // The flight model moved to lib/rsv-flight.js on 2026-08-10 and owns the keydown listener
  // now, routing non-movement keys back to the mission via onKey. Calling toggleThermal()
  // directly would still pass with that wire cut, so the key itself is what gets pressed:
  // this check covers the mission function AND the module boundary that reaches it.
  await page.keyboard.press('v');
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

  // 8. the call, and the CONSEQUENCE that now follows it.
  //    Before 2026-08-08 the end card came up ~instantly and this test slept
  //    900 ms. The call now has a physical outcome the operator watches, so the
  //    wait is real. Polling rather than a fixed sleep, because a fixed sleep
  //    that happens to exceed the hold would pass even if the sequence stalled.
  await Q(()=>window.__COLD_HORIZON_QA__.decide('ir'));
  await sleep(700);
  s = await Q(()=>window.__COLD_HORIZON_QA__.snapshot());
  check('the end card does NOT appear immediately; the outcome plays first',
        s.endOpen===false && s.seq.on===true, 'endOpen='+s.endOpen+' seq.on='+s.seq.on);
  check('the correct call vents a CONTROLLED purge, not a rupture',
        s.fx && s.fx.live > 0 && s.fx.frags === 0,
        s.fx ? `live=${s.fx.live} frags=${s.fx.frags}` : 'no fx');

  s = await waitFor(page, x => x.endOpen === true, 22000);
  check('the correct call reaches its end card after the outcome',
        !!s && s.correct===true && s.endOpen===true, s ? 'title='+s.endTitle : 'TIMED OUT');
  check('every narration beat fired, none skipped',
        !!s && s.seq.beat === s.seq.beats, s ? `${s.seq.beat}/${s.seq.beats}` : '-');
  check('HELIOS-7 SURVIVES the correct call (panel never shears)',
        !!s && s.panelShorn === false && s.fx.freed === false);
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
  await sleep(1000);
  let w = await wrong.evaluate(()=>window.__COLD_HORIZON_QA__.snapshot());
  check('the majority call opens on a weeping seal, not a bang',
        w.seq.on===true && w.endOpen===false && w.fx && w.fx.freed===false,
        w.fx ? `t=${w.fx.t} live=${w.fx.live}` : 'no fx');

  // The uncontained case is the only one that destroys the node. Assert the
  // destruction, not just that a card eventually appeared: an outcome that
  // silently no-oped would still reach the card and read as a pass.
  w = await waitFor(wrong, x => x.fx && x.fx.freed === true, 12000);
  check('the majority call TEARS the assembly open', !!w,
        w ? `frags=${w.fx.frags} vents=${w.fx.vents}` : 'panel never sheared');
  check('the shorn panel actually leaves the assembly',
        !!w && w.panelShorn === true);
  check('debris is thrown, and the rib cascade opens more vents than the header',
        !!w && w.fx.frags > 0 && w.fx.vents > 1,
        w ? `frags=${w.fx.frags} vents=${w.fx.vents}` : '-');

  w = await waitFor(wrong, x => x.endOpen === true, 25000);
  check('incorrect call still reaches a scored end card',
        !!w && w.endOpen===true && w.correct===false,
        w ? 'title='+w.endTitle : 'TIMED OUT — dead end');
  check('the RSV takes the debris strike it was standing in the path of',
        !!w && w.seq.struck === true);
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
  const t = await waitFor(trap, x => x.endOpen === true, 22000);
  check('picking TH-2 as "the outlier" is NOT scored a clean win',
        !!t && t.endOpen===true && t.correct===false, t ? 'title='+t.endTitle : 'TIMED OUT');
  check('the outlier path gets its own reasoning-specific ending',
        !!t && /UNSAFE REASONING/.test(t.endTitle), t ? 'title='+t.endTitle : '-');
  // TH-2 really was the right channel, so the NODE survives even though the
  // reasoning does not. Physical outcome and grade are deliberately separate.
  check('the outlier call still SAVES the node, because the channel was right',
        !!t && t.panelShorn === false, t ? 'shorn='+t.panelShorn : '-');
  await trap.close();

  // 11. escalation path. Declaring the channel unreliable is defensible and
  //     must not dead-end, and it must not destroy the node either.
  const esc = await page.browser().newPage();
  await esc.setViewport({width:1280,height:720});
  await esc.evaluateOnNewDocument(()=>{
    localStorage.setItem('hexworth_house','cloud');
    localStorage.setItem('hexworth_sorted','true');
  });
  await esc.goto(url,{waitUntil:'domcontentloaded',timeout:60000});
  await sleep(3000);
  await esc.evaluate(()=>{
    document.getElementById('startBtn').click();
    const q = window.__COLD_HORIZON_QA__;
    ['VESTA-2','HELIOS-7','JANUS-4','KEPLER-9'].forEach(id=>q.forceScan(id));
    q.decide('none');
  });
  const n = await waitFor(esc, x => x.endOpen === true, 22000);
  check('the escalation call reaches an end card',
        !!n && n.endOpen===true, n ? 'title='+n.endTitle : 'TIMED OUT — dead end');
  check('escalation breaches but is CONTAINED: node degraded, not destroyed',
        !!n && n.panelShorn === false && n.fx && n.fx.live >= 0,
        n ? `shorn=${n.panelShorn}` : '-');
  await esc.close();

  console.log('\n=== ERRORS ('+errs.length+') ===');
  errs.slice(0,20).forEach(e=>console.log('  '+e.slice(0,300)));

  const failed = results.filter(r=>!r.pass).length;
  console.log(`\n${results.length-failed}/${results.length} checks passed, ${errs.length} runtime errors\n`);

  await browser.close(); server.close();
  process.exit(failed || errs.length ? 1 : 0);
})();
