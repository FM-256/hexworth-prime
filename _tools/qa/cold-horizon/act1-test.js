#!/usr/bin/env node
/**
 * act1-test.js — Lagrange Edge Act I: missions 1, 2 and 3 in a real browser.
 *
 * @catalog what    Verifies Act I of le-01-cold-horizon: mission 1 still works after the
 *                  config gained two missions, and missions 2/3 teach the right lesson.
 * @catalog run     node _tools/qa/cold-horizon/act1-test.js
 * @catalog status  TOOL
 *
 * WHAT THIS IS FOR, beyond "does it render".
 *
 * Act I is one lesson taught three times against three kinds of evidence: thermal,
 * identity, time. The thing that can silently break is not the markup, it is the
 * TRAP. Each mission contains a pair of sources that agree with each other and share
 * a dependency, and a pair that genuinely corroborates. If the trap pair is ever
 * accepted as independent, the mission teaches the inverse of its own lesson and
 * still looks completely fine on screen.
 *
 * So this asserts the mechanic's VERDICTS, in both directions, per mission:
 *   - the trap pair must be REJECTED and must name the shared axes
 *   - the physical/out-of-band pair must be ACCEPTED
 *
 * It also asserts mission 1 is unregressed, because config-shared.js was edited to
 * add missions 2 and 3 and mission 1 reads the same file.
 */
'use strict';
const http = require('http'), fs = require('fs'), path = require('path');
const puppeteer = require('/home/eq/ai-content/hexworth-prime/node_modules/puppeteer');

const ROOT = '/home/eq/ai-content/hexworth-prime/_app';
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
  results.push({name, pass});
  console.log(`  ${pass?'PASS':'FAIL'}  ${name}${detail?'  -> '+detail:''}`);
}

/* Drive the page's OWN independence test through the engine the page built, so a
   verdict here is the verdict a player gets. Reimplementing the comparison in the
   test would only prove the test agrees with itself. */
const testPair = (page, a, b) => page.evaluate((a,b)=>{
  const eng = window.__LE_QA__.eng;
  const r = eng.independenceOf(a,b);
  return { ok:r.ok, shared:r.shared, error:r.error||null };
}, a, b);

(async ()=>{
  await new Promise(r=>server.listen(0,'127.0.0.1',r));
  const port = server.address().port;
  const base = `http://127.0.0.1:${port}/arena/boxes/le-01-cold-horizon/`;

  const browser = await puppeteer.launch({ headless:'new',
    args:['--no-sandbox','--disable-setuid-sandbox'] });

  const errs = [];
  async function open(url){
    const p = await browser.newPage();
    p.on('pageerror', e=> errs.push(url+' PAGEERROR: '+e.message));
    p.on('console', m=>{ if(m.type()==='error') errs.push(url+' CONSOLE: '+m.text()); });
    await p.evaluateOnNewDocument(()=>{
      localStorage.setItem('hexworth_house','cloud');
      localStorage.setItem('hexworth_sorted','true');
    });
    await p.goto(url,{waitUntil:'domcontentloaded',timeout:45000});
    await new Promise(r=>setTimeout(r,900));
    return p;
  }

  console.log('\n--- LAGRANGE EDGE, Act I ---\n');

  // ── config-level invariants ────────────────────────────────────────────────
  const cfgPage = await open(base+'gateway.html?m=2&qa=1');
  const cfgFacts = await cfgPage.evaluate(()=>{
    const C = ColdHorizonConfig;
    return {
      flags: C.flags.map(f=>f.id),
      missions: C.missions.map(m=>({id:m.id, flagId:m.flagId, zone:m.zone})),
      zones: C.zones.map(z=>({id:z.id, page:z.page, status:z.status})),
      hintKeys: Object.keys(C.hints),
      m1axes: C.forMission(1).independenceAxes,
      m2axes: C.forMission(2).independenceAxes,
      m3axes: C.forMission(3).independenceAxes,
      m1store: C.forMission(1).storageKey,
      m2store: C.forMission(2).storageKey,
      m3store: C.forMission(3).storageKey,
    };
  });

  check('three canonical flags declared, one per mission',
        cfgFacts.flags.length === 3, cfgFacts.flags.join(', '));
  check('every mission points at a flag that exists',
        cfgFacts.missions.every(m => cfgFacts.flags.includes(m.flagId)));
  check('every mission has hints under its own flag id',
        cfgFacts.missions.every(m => cfgFacts.hintKeys.includes(m.flagId)),
        cfgFacts.hintKeys.join(', '));
  // The scope doc's rule, and the bug that left 88 boxes uncompletable: a zone may
  // be declared unbuilt, but it may never be reachable while unbuilt.
  const built = ['index.html','telemetry.html','gateway.html'];
  check('no ACTIVE zone points at a page that does not exist',
        cfgFacts.zones.filter(z=>z.status==='active').every(z=>built.includes(z.page)),
        cfgFacts.zones.filter(z=>z.status==='active').map(z=>z.page).join(', '));
  check('unbuilt zones are still locked',
        cfgFacts.zones.filter(z=>!built.includes(z.page)).every(z=>z.status==='locked'));

  // The axes MUST differ per mission. If mission 2 inherited mission 1's thermal
  // axes, its sources would share nothing and every pair would read independent.
  check('mission 1 keeps its own axes untouched',
        cfgFacts.m1axes.join() === 'collectionPath,clockSource,signingAuthority',
        cfgFacts.m1axes.join());
  check('mission 2 asks about IDENTITY, not thermal buses',
        cfgFacts.m2axes.join() === 'issuer,logPipeline,clockSource', cfgFacts.m2axes.join());
  check('mission 3 asks about TIME, including where each clock GETS its time',
        cfgFacts.m3axes.join() === 'timeSource,timeRoot,logPipeline,signingAuthority',
        cfgFacts.m3axes.join());
  check('each mission has its own saved state, so trust cannot leak between them',
        new Set([cfgFacts.m1store, cfgFacts.m2store, cfgFacts.m3store]).size === 3,
        [cfgFacts.m1store, cfgFacts.m2store, cfgFacts.m3store].join(' / '));
  await cfgPage.close();

  // ── MISSION 2 — Ghost Session ──────────────────────────────────────────────
  console.log('\n  mission 2 — Ghost Session (identity)');
  const p2 = await open(base+'gateway.html?m=2&qa=1');
  const s2 = await p2.evaluate(()=>({
    title: document.getElementById('mTitle').textContent,
    sensors: document.querySelectorAll('#sensorGrid .le-sensor').length,
    corrs: document.querySelectorAll('#corrList .le-res').length,
    prompt: document.getElementById('prompt').textContent,
    axesNote: document.getElementById('axesNote').textContent,
    // no thermal vocabulary should survive into an identity mission
    thermalWords: /collection path|signing authority/i.test(
      document.getElementById('axesNote').textContent),
  }));
  check('mission 2 renders its own title', /GHOST SESSION/i.test(s2.title), s2.title);
  check('mission 2 renders three sources and its corroborators',
        s2.sensors === 3 && s2.corrs === 3, `${s2.sensors} sources, ${s2.corrs} corroborators`);
  check('mission 2 does NOT carry mission 1 thermal vocabulary',
        s2.thermalWords === false, s2.axesNote.slice(0,80));
  check('mission 2 asks a question about attribution',
        /who issued|attribut/i.test(s2.prompt), s2.prompt.slice(0,70));

  // THE TRAP: a token and that token's own audit log are one source.
  let r = await testPair(p2,'sess-token','sso-audit');
  check('TRAP rejected: the session token and its own SSO audit log are ONE source',
        r.ok === false && r.shared.length === 3, 'shared: '+r.shared.join(','));
  // Partial overlap must still be a rejection: sharing ANY axis is enough.
  r = await testPair(p2,'sess-token','vpn-log');
  check('partial overlap still rejected: the VPN log is SSO-integrated',
        r.ok === false && r.shared.includes('issuer'), 'shared: '+r.shared.join(','));
  // THE SOLUTION: the physical record shares no issuer, pipeline or clock.
  r = await testPair(p2,'sess-token','badge-log');
  check('SOLUTION accepted: the facility badge record is independent of the IdP',
        r.ok === true, 'shared: '+r.shared.join(','));
  // Two witnesses can each be independent of the accused and not of each other.
  r = await testPair(p2,'badge-log','cam-still');
  check('badge and camera are NOT independent of each other (same clock + pipeline)',
        r.ok === false && r.shared.length >= 2, 'shared: '+r.shared.join(','));
  await p2.close();

  // ── MISSION 3 — Last Good Contact ──────────────────────────────────────────
  console.log('\n  mission 3 — Last Good Contact (time)');
  const p3 = await open(base+'gateway.html?m=3&qa=1');
  const s3 = await p3.evaluate(()=>({
    title: document.getElementById('mTitle').textContent,
    sensors: document.querySelectorAll('#sensorGrid .le-sensor').length,
    situation: document.getElementById('situation').textContent,
    body: document.body.textContent,
  }));
  check('mission 3 renders its own title', /LAST GOOD CONTACT/i.test(s3.title), s3.title);
  check('mission 3 renders three time sources', s3.sensors === 3, String(s3.sensors));
  check('the light-delay bound is stated to the player, since it is the tool',
        /round-trip light delay|2\.18/i.test(s3.situation + s3.body));
  // The impossible pair must actually be present in the data, or the mission has
  // no solution: the MOC log claims transmission 0.21 s before the platform
  // recorded reception, at a range where 2.18 s is the floor.
  const impossible = await p3.evaluate(()=>{
    const m = ColdHorizonConfig.missionData[3].sensors;
    const moc = m.filter(x=>x.id==='moc-log')[0].reading;
    const plat = m.filter(x=>x.id==='plat-log')[0].reading;
    const secs = t => { const p = t.replace('Z','').split(':'); return +p[1]*60 + parseFloat(p[2]); };
    return { delta: +(secs(plat) - secs(moc)).toFixed(3),
             floor: ColdHorizonConfig.link.roundTripMs/1000 };
  });
  check('the logs contain a PHYSICALLY IMPOSSIBLE round trip, which is the solution',
        impossible.delta < impossible.floor,
        `apparent ${impossible.delta}s vs ${impossible.floor}s floor`);

  r = await testPair(p3,'plat-log','moc-log');
  /* The sharpest trap in Act I: these two clocks have DIFFERENT NAMES. Comparing
     names finds nothing. They are the same time because one is disciplined from the
     other, so the rejection must cite the shared ROOT specifically. */
  check('TRAP rejected: platform and MOC clocks are one hierarchy despite different names',
        r.ok === false && r.shared.includes('timeRoot'), 'shared: '+r.shared.join(','));
  r = await testPair(p3,'moc-log','sso-time');
  check('TRAP rejected: the SSO timestamp shares the MOC time source',
        r.ok === false && r.shared.includes('timeSource'), 'shared: '+r.shared.join(','));
  r = await testPair(p3,'moc-log','range-fix');
  check('SOLUTION accepted: the ranging fix measures distance, not a clock',
        r.ok === true, 'shared: '+r.shared.join(','));
  r = await testPair(p3,'range-fix','gs-maser');
  check('ranging fix and maser are NOT two independent accounts (same RF front end)',
        r.ok === false, 'shared: '+r.shared.join(','));
  await p3.close();

  // ── MISSION 1 — regression. Its config file was edited to add 2 and 3. ─────
  console.log('\n  mission 1 — Three Temperatures (regression)');
  const p1 = await open(base+'telemetry.html');
  const s1 = await p1.evaluate(()=>({
    sensors: document.querySelectorAll('#sensorGrid .le-sensor').length,
    prompt: document.getElementById('prompt').textContent,
    firstReading: (document.querySelector('#sensorGrid .value')||{}).textContent || '',
  }));
  check('mission 1 still renders its three thermal sensors', s1.sensors === 3, String(s1.sensors));
  check('mission 1 still shows the mission 1 prompt, not a later one',
        /containment decision/i.test(s1.prompt), s1.prompt.slice(0,60));
  check('mission 1 readings unchanged (41.2 first)', /41\.2/.test(s1.firstReading), s1.firstReading);
  await p1.close();

  console.log('\n=== ERRORS ('+errs.length+') ===');
  errs.slice(0,15).forEach(e=>console.log('  '+e.slice(0,220)));

  const passed = results.filter(r=>r.pass).length;
  console.log(`\n${passed}/${results.length} checks passed, ${errs.length} runtime errors\n`);
  await browser.close(); server.close();
  process.exit(passed === results.length && errs.length === 0 ? 0 : 1);
})();
