#!/usr/bin/env node
/**
 * missions-test.js — Lagrange Edge box missions, in a real browser.
 *
 * @catalog what    Verifies every built mission of le-01-cold-horizon: Act I (1,2,3) plus
 *                  mission 4. Asserts each mission's TRAP is rejected and its solution
 *                  accepted, and that earlier missions stay unregressed as new ones land.
 * @catalog run     node _tools/qa/cold-horizon/missions-test.js
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

  console.log('\n--- LAGRANGE EDGE, box missions ---\n');

  // ── config-level invariants ────────────────────────────────────────────────
  const cfgPage = await open(base+'gateway.html?m=2&qa=1');
  const cfgFacts = await cfgPage.evaluate(()=>{
    const C = ColdHorizonConfig;
    return {
      flags: C.flags.map(f=>f.id),
      missions: C.missions.map(m=>({id:m.id, flagId:m.flagId, zone:m.zone})),
      zones: C.zones.map(z=>({id:z.id, page:z.page, status:z.status})),
      hintKeys: Object.keys(C.hints),
      missionData: C.missionData || {},
      m1axes: C.forMission(1).independenceAxes,
      m2axes: C.forMission(2).independenceAxes,
      m3axes: C.forMission(3).independenceAxes,
      m1store: C.forMission(1).storageKey,
      m2store: C.forMission(2).storageKey,
      m3store: C.forMission(3).storageKey,
    };
  });

  /* Derived, not hardcoded. This read `=== 3` and went stale the moment mission
     4 landed, which is the same class of bug as a registry that declares more
     canonical flags than the box can yield. */
  check('exactly one canonical flag per declared mission',
        cfgFacts.flags.length === cfgFacts.missions.length,
        `${cfgFacts.flags.length} flags, ${cfgFacts.missions.length} missions`);
  check('every mission points at a flag that exists',
        cfgFacts.missions.every(m => cfgFacts.flags.includes(m.flagId)));
  check('every mission has hints under its own flag id',
        cfgFacts.missions.every(m => cfgFacts.hintKeys.includes(m.flagId)),
        cfgFacts.hintKeys.join(', '));
  // The scope doc's rule, and the bug that left 88 boxes uncompletable: a zone may
  // be declared unbuilt, but it may never be reachable while unbuilt.
  /* DERIVED FROM THE DIRECTORY, not hand-listed. This was
     `['index.html','telemetry.html','gateway.html']`, which meant the check could only ever
     be as current as someone's memory: building a legitimate new zone page made a CORRECT
     configuration fail, and, far worse, deleting a page would have left the list asserting a
     file that no longer existed. Reading the tree is the only version that cannot go stale,
     and it is the same rule the script catalog follows: a thing cannot lie about existing. */
  const BOX_DIR = '/home/eq/ai-content/hexworth-prime/_app/arena/boxes/le-01-cold-horizon';
  const built = require('fs').readdirSync(BOX_DIR).filter(f => f.endsWith('.html'));
  check('no ACTIVE zone points at a page that does not exist',
        cfgFacts.zones.filter(z=>z.status==='active').every(z=>built.includes(z.page)),
        cfgFacts.zones.filter(z=>z.status==='active').map(z=>z.page).join(', '));
  check('unbuilt zones are still locked',
        cfgFacts.zones.filter(z=>!built.includes(z.page)).every(z=>z.status==='locked'));
  /* The derived check above passes vacuously if the directory read returns nothing, so prove
     it found real files. A guard that cannot fail is not a guard. */
  check('the built-page list was actually derived from disk',
        built.length >= 4 && built.includes('index.html'), built.join(', '));

  /* ── THE ARENA CARD MUST NOT CLAIM FLAGS THE BOX CANNOT YIELD ───────────
     Chris blocked twice on this and the suite was blind to it both times: it
     compared the box's INTERNAL flag and mission counts, which agree with each
     other and say nothing about what the storefront advertises.

     The card's `flags:` field is the completion denominator. Claiming more than
     is seeded is the 2026-08-04 bug that left 88 boxes solvable and never
     creditable, and the MVP-0 acceptance record fixes the rule: the card states
     what is SEEDED AND CREDITABLE today, not what is built.

     Read from the arena HTML on disk and compared against the count of
     gradable:true flags, so drift fails here instead of in production. */
  const arenaSrc = fs.readFileSync(
    '/home/eq/ai-content/hexworth-prime/_app/arena/index.html','utf8');
  const cardMatch = arenaSrc.match(/\{ id: 'le01',[\s\S]*?\},/);
  const cardFlags = cardMatch ? parseInt((cardMatch[0].match(/flags: (\d+)/)||[])[1],10) : NaN;
  const gradableCount = await cfgPage.evaluate(()=>
    ColdHorizonConfig.flags.filter(f=>f.gradable === true).length);
  check('the arena card advertises exactly the number of CREDITABLE flags',
        cardFlags === gradableCount,
        `card says ${cardFlags}, ${gradableCount} flag(s) gradable`);
  check('and the card was found at all, so a rename cannot silently skip this',
        !!cardMatch && !isNaN(cardFlags), cardMatch ? 'found' : 'CARD NOT FOUND');

  /* The edit that caused this touched 14 OTHER boxes, because the anchor
     `difficulty: 4, flags: 3,` is shared by dozens of cards and the replace was
     uncounted. Assert no other card moved, so a future careless anchor is caught
     by the suite rather than by a reviewer reading a diff. */
  const flagCensus = {};
  arenaSrc.replace(/\{ id: '([a-z0-9]+)',[\s\S]*?flags: (\d+)/g,
    (m,id,n)=>{ flagCensus[id]=+n; return m; });
  check('no collateral cards: ops02 still yields 4, ow01 still 3',
        flagCensus.ops02 === 4 && flagCensus.ow01 === 3,
        `ops02=${flagCensus.ops02} ow01=${flagCensus.ow01}`);

  /* gateway.html is BUILT and deliberately HELD. Two things must agree or the
     hold is only half real: the zone must be locked, and the file must be
     excluded from hosting. Locking the zone alone leaves a directly typeable URL
     and quietly undoes the MVP-0 acceptance criterion that it 404s. */
  // firebase.json's `hosting` is an object here, but the schema also permits an
  // array of targets. Handle both, or this check breaks the day a second target
  // is added and it breaks by reading `undefined`, not by failing loudly.
  const fbHosting = JSON.parse(fs.readFileSync(
    '/home/eq/ai-content/hexworth-prime/firebase.json','utf8')).hosting;
  const fbIgnore = (Array.isArray(fbHosting) ? fbHosting[0] : fbHosting).ignore || [];
  const heldPath = 'arena/boxes/le-01-cold-horizon/gateway.html';
  const heldPayload = 'arena/boxes/le-01-cold-horizon/missions-held.js';
  const z1 = cfgFacts.zones.filter(z=>z.id==='z1')[0];
  check('a HELD page is locked in config AND excluded from hosting, not just one',
        (z1.status === 'locked') === fbIgnore.includes(heldPath),
        `z1=${z1.status}, hosting-excluded=${fbIgnore.includes(heldPath)}`);

  /* Nancy: holding the ENTRY POINT is not holding the CONTENT. config-shared.js is
     loaded by index.html and telemetry.html, both of which ship, so unlaunched
     mission text sitting in it would be one curl away from production. The suite
     was green through that, because it only ever asked whether the page was
     reachable. Assert the served config carries none of the held missions' text,
     and that the payload file is excluded exactly like the page. */
  /* The pairing is the invariant, in BOTH directions. While the missions were held,
     the page and its payload had to be excluded together or the hold was cosmetic.
     Now that z1 is active they must SHIP together, or the page loads and finds no
     mission data. Asserting "excluded" absolutely was asserting a moment, not a rule. */
  check('page and payload are held together or shipped together, never split',
        fbIgnore.includes(heldPath) === fbIgnore.includes(heldPayload),
        `page-excluded=${fbIgnore.includes(heldPath)} payload-excluded=${fbIgnore.includes(heldPayload)}`);
  check('an ACTIVE zone ships its payload',
        z1.status !== 'active' || !fbIgnore.includes(heldPayload),
        `z1=${z1.status}, payload-excluded=${fbIgnore.includes(heldPayload)}`);
  const servedCfg = fs.readFileSync(
    '/home/eq/ai-content/hexworth-prime/_app/arena/boxes/le-01-cold-horizon/config-shared.js','utf8');
  const leaks = ['GHOST SESSION','LAST GOOD CONTACT','SIGNED IN ASH',
                 'badge-log','range-fix','f-1131','sso-audit']
                .filter(w => servedCfg.includes(w));
  check('the SERVED config leaks no held-mission text (traps, evidence, hints)',
        leaks.length === 0, leaks.length ? 'LEAKED: '+leaks.join(', ') : 'clean');
  const idxSrc = fs.readFileSync(
    '/home/eq/ai-content/hexworth-prime/_app/arena/boxes/le-01-cold-horizon/index.html','utf8');
  const telSrc = fs.readFileSync(
    '/home/eq/ai-content/hexworth-prime/_app/arena/boxes/le-01-cold-horizon/telemetry.html','utf8');
  check('no SHIPPING page pulls the held payload in',
        !idxSrc.includes('missions-held.js') && !telSrc.includes('missions-held.js'));

  // The axes MUST differ per mission. If mission 2 inherited mission 1's thermal
  // axes, its sources would share nothing and every pair would read independent.
  check('mission 1 keeps its own axes untouched',
        cfgFacts.m1axes.join() === 'collectionPath,clockSource,signingAuthority',
        cfgFacts.m1axes.join());
  check('mission 2 asks about IDENTITY, not thermal buses',
        cfgFacts.m2axes.join() === 'issuer,logPipeline,clockSource', cfgFacts.m2axes.join());
  /* Every mission's axes must have a human label, or the UI prints a raw config key
     at the player. Cheap to break: a new mission adds an axis and nobody notices. */
  const labelled = await cfgPage.evaluate(()=>{
    const src = document.documentElement.innerHTML;   // AXIS_LABEL lives in this page
    const C = ColdHorizonConfig;
    const missing = [];
    Object.keys(C.missionData||{}).forEach(n=>{
      (C.missionData[n].axes||[]).forEach(a=>{
        if (!new RegExp('\\b'+a+'\\s*:').test(src)) missing.push(n+':'+a);
      });
    });
    return missing;
  });
  check('every axis every mission declares has a human label in the UI',
        labelled.length === 0, labelled.join(', ') || 'all labelled');

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

  // ── MISSION 4 — Signed in Ash. Act II, and a DIFFERENT mechanic. ─────────
  console.log('\n  mission 4 — Signed in Ash (PKI + replay)');
  const p4 = await open(base+'gateway.html?m=4&qa=1');
  const s4 = await p4.evaluate(()=>({
    title: document.getElementById('mTitle').textContent,
    framePanel: getComputedStyle(document.getElementById('framePanel')).display !== 'none',
    frameOpts: document.querySelectorAll('#frmA option').length,
    prompt: document.getElementById('prompt').textContent,
  }));
  check('mission 4 renders its own title', /SIGNED IN ASH/i.test(s4.title), s4.title);
  check('the frame audit panel appears for a mission that declares frames',
        s4.framePanel === true && s4.frameOpts === 3, `panel=${s4.framePanel} opts=${s4.frameOpts}`);

  // The panel must NOT appear where no frames are declared, or every earlier
  // mission grows a control that does nothing.
  const p2b = await open(base+'gateway.html?m=2&qa=1');
  const hidden = await p2b.evaluate(()=>
    getComputedStyle(document.getElementById('framePanel')).display === 'none');
  check('the frame panel stays hidden on missions with no frames', hidden === true);
  await p2b.close();

  /* THE CORE OF THE MISSION. Every frame is individually valid, so a check that
     only asked "does the signature verify" would pass on the replay. Drive the
     page's own audit. */
  const audit = (a,b) => p4.evaluate((a,b)=>{
    const F = window.__LE_QA__.cfg.frames;
    const A = F.filter(x=>x.id===a)[0], B = F.filter(x=>x.id===b)[0];
    return window.__LE_QA__.auditFrames(A,B).map(r=>({bad:r.bad, text:r.text}));
  }, a, b);

  let f = await audit('f-1131','f-1131-r');
  check('REPLAY is caught: the disputed frame reuses counter 1131',
        f.some(r=>r.bad && /REPLAY/.test(r.text)), f.map(r=>r.text.split('.')[0]).join(' | '));
  check('and the identical payload is named, so it reads as re-sent not re-signed',
        f.some(r=>r.bad && /IDENTICAL PAYLOAD/.test(r.text)));
  check('the SCOPE failure is caught: aud names thermal, command accepted it',
        f.some(r=>r.bad && /SCOPE/.test(r.text)));

  // Both signatures verify. If a "valid signature" reading were the mission, this
  // pair would look clean, which is precisely the lesson.
  const sigs = await p4.evaluate(()=>window.__LE_QA__.cfg.frames.map(f=>f.sig));
  check('every frame in the mission has a VALID signature, including the replay',
        sigs.every(x=>x==='VALID'), sigs.join(','));

  // A legitimate pair must come back clean, or the mechanic just says "bad" always.
  f = await audit('f-1131','f-1132');
  check('a legitimate pair is NOT flagged as replay or identical payload',
        !f.some(r=>r.bad && /REPLAY|IDENTICAL/.test(r.text)),
        f.map(r=>r.text.split('.')[0]).join(' | '));
  await p4.close();

  /* ── MISSIONS 8-12 — each trap rejected, each solution accepted ──────────
     Table-driven, because the failure mode is identical in every mission and
     writing it out five times invites a copy-paste that asserts mission 8's trap
     against mission 9's data. A mission whose TRAP passes teaches the inverse of
     its own lesson and looks perfect on screen, which is exactly what a render
     check cannot see. */
  const LATER = [
    { m: 8,  title: /PARTITION ZERO/i,
      trap:   ['sm-table','sm-config'],      // the SM and its own config
      trap2:  ['sm-table','sm-audit'],       // and the log it writes about itself
      sol:    ['sm-table','port-counter'],   // hardware counts frames regardless
      // The standby SM shares the state path and signing authority with the PRIMARY.
      // A second Subnet Manager is not a second opinion. (port-counter vs sm-standby
      // genuinely IS independent -- hardware shares nothing with the control plane --
      // so asserting that pair was my error, not the data's.)
      notInd: ['sm-table','sm-standby'] },
    { m: 9,  title: /NIGHTJAR/i,
      trap:   ['img-tag','img-attest'],      // build farm attesting to its own output
      trap2:  ['img-attest','sbom'],         // same pipeline, same inputs
      sol:    ['img-tag','layer-hash'],      // what is actually executing
      notInd: ['layer-hash','egress-flow'] },
    { m: 10, title: /REDUNDANT TRUTH/i,
      trap:   ['rep-a','rep-b'],             // one writer feeding both
      trap2:  ['rep-a','rep-c'],             // different store, same writer
      sol:    ['rep-a','downlink-tape'],     // write-once, off-platform
      notInd: ['rep-a','rep-checksum'] },
    { m: 11, title: /EIDOLON/i,
      trap:   ['eid-conf','eid-selfcheck'],  // the system reporting on itself
      trap2:  ['input-provenance','policy-diff'],
      sol:    ['eid-conf','replay-harness'], // off-platform replay
      notInd: ['eid-conf','eid-policy'] },
    { m: 12, title: /HEAT DEBT/i,
      trap:   ['cap-telemetry','load-forecast'],   // same bad telemetry family
      trap2:  ['cap-telemetry','pump-margin'],
      sol:    ['cap-telemetry','ir-survey'],       // measured, off-platform
      // pump-margin is OFFERED as corroboration and shares basis, path and signing
      // authority with the very telemetry family it would confirm. That is the
      // mission's lesson: a witness from inside the suspect family is not a witness.
      // (ir-survey vs degradation genuinely IS independent -- an off-platform IR
      // measurement and a hand-recorded walkdown share nothing -- so asserting that
      // pair was my error, not the data's.)
      notInd: ['load-forecast','pump-margin'] },
  ];
  for (const L of LATER) {
    console.log(`\n  mission ${L.m}`);
    const pg = await open(base+`gateway.html?m=${L.m}&qa=1`);
    const shown = await pg.evaluate(()=>({
      title: document.getElementById('mTitle').textContent,
      sensors: document.querySelectorAll('#sensorGrid .le-sensor').length,
      tabs: document.querySelectorAll('#missionTabs a').length,
      prompt: document.getElementById('prompt').textContent.length,
    }));
    check(`m${L.m} renders its own title`, L.title.test(shown.title), shown.title);
    check(`m${L.m} renders 3 sources and has a prompt`,
          shown.sensors === 3 && shown.prompt > 30, `${shown.sensors} sources`);
    // Tabs are generated from the config, so every built mission must be reachable.
    check(`m${L.m} tab strip lists every built mission`,
          shown.tabs === Object.keys(cfgFacts.missionData || {}).length || shown.tabs >= 8,
          `${shown.tabs} tabs`);

    let r = await testPair(pg, L.trap[0], L.trap[1]);
    check(`m${L.m} TRAP rejected: ${L.trap.join(' vs ')}`,
          r.ok === false && r.shared.length > 0, 'shared: '+r.shared.join(','));
    r = await testPair(pg, L.trap2[0], L.trap2[1]);
    check(`m${L.m} second trap rejected: ${L.trap2.join(' vs ')}`,
          r.ok === false && r.shared.length > 0, 'shared: '+r.shared.join(','));
    r = await testPair(pg, L.sol[0], L.sol[1]);
    check(`m${L.m} SOLUTION accepted: ${L.sol.join(' vs ')}`,
          r.ok === true, 'shared: '+r.shared.join(','));
    // Two witnesses can each be independent of the accused and not of each other.
    r = await testPair(pg, L.notInd[0], L.notInd[1]);
    check(`m${L.m} two corroborators are NOT independent of each other`,
          r.ok === false, 'shared: '+r.shared.join(','));
    await pg.close();
  }

  /* ── MISSIONS 5-7, the Act II/III gaps ─────────────────────────────────── */
  for (const L of [
    { m:5, t:/QUIET DISH/i,   trap:['gs-cm','gs-approval'],   sol:['gs-cm','gs-door'],       notInd:['gs-cm','gs-config'] },
    { m:6, t:/DEAD AIR/i,     trap:['ch-primary','ch-backup'], sol:['ch-primary','ch-emergency'], notInd:['ch-backup','ch-relay'] },
    { m:7, t:/BORROWED HANDS/i, trap:['kvm-hostlog','kvm-audit'], sol:['kvm-hostlog','kvm-sel'], notInd:['kvm-sel','kvm-power'] },
  ]) {
    console.log(`\n  mission ${L.m}`);
    const pg = await open(base+`gateway.html?m=${L.m}&qa=1`);
    const t = await pg.evaluate(()=>document.getElementById('mTitle').textContent);
    check(`m${L.m} renders its own title`, L.t.test(t), t);
    let r = await testPair(pg, L.trap[0], L.trap[1]);
    check(`m${L.m} TRAP rejected: ${L.trap.join(' vs ')}`, r.ok===false && r.shared.length>0, 'shared: '+r.shared.join(','));
    r = await testPair(pg, L.sol[0], L.sol[1]);
    check(`m${L.m} SOLUTION accepted: ${L.sol.join(' vs ')}`, r.ok===true, 'shared: '+r.shared.join(','));
    r = await testPair(pg, L.notInd[0], L.notInd[1]);
    check(`m${L.m} a second same-family source is NOT independent`, r.ok===false, 'shared: '+r.shared.join(','));
    await pg.close();
  }

  /* Story order, not build order: the tab strip is generated from the config and
     a player should meet mission 5 before mission 8. */
  // A fresh page: cfgPage was closed after the config-invariant block, and reusing
  // it throws "Attempted to use detached Frame". The sort happens at load time, so
  // this has to be read from a live page rather than from the file on disk.
  const ordPage = await open(base+'gateway.html?m=5&qa=1');
  const order = await ordPage.evaluate(()=>ColdHorizonConfig.missions.map(m=>m.id));
  await ordPage.close();
  check('missions are in story order despite being authored out of order',
        order.join(',') === [...order].sort((a,b)=>a-b).join(','), order.join(','));

  /* ── ACT V ──────────────────────────────────────────────────────────────
     13 is a SEQUENCING mission and needs its own assertions: the independence
     mechanic cannot express "in what order", which is the whole question. */
  console.log('\n  mission 13 — Severance (sequencing)');
  const p13 = await open(base+'gateway.html?m=13&qa=1');
  const s13 = await p13.evaluate(()=>({
    title: document.getElementById('mTitle').textContent,
    seqShown: getComputedStyle(document.getElementById('seqPanel')).display !== 'none',
    frameHidden: getComputedStyle(document.getElementById('framePanel')).display === 'none',
    items: document.querySelectorAll('#seqList li').length,
  }));
  check('m13 renders its own title', /SEVERANCE/i.test(s13.title), s13.title);
  check('m13 shows the sequencing panel and NOT the frame audit',
        s13.seqShown && s13.frameHidden, `seq=${s13.seqShown} frameHidden=${s13.frameHidden}`);
  check('m13 lists every containment action', s13.items === 5, String(s13.items));

  const seq = (order) => p13.evaluate((o)=>window.__LE_QA__.auditSequence(o), order);
  // The canonical safe order: capture, close the door, remove the member, cool it,
  // then reopen. Nothing irrecoverable.
  let v = await seq(['a-snapshot','a-revoke','a-isolate','a-thermal','a-restore']);
  check('a safe ordering reports NO irrecoverable violation',
        v.hard.length === 0, `${v.hard.length} hard, ${v.soft.length} trade-off`);
  // Isolating before snapshotting destroys the volatile state permanently.
  v = await seq(['a-isolate','a-snapshot','a-revoke','a-thermal','a-restore']);
  check('isolating before the snapshot is caught as IRRECOVERABLE',
        v.hard.some(c=>c.before==='a-snapshot' && c.after==='a-isolate'),
        v.hard.map(c=>c.before+'->'+c.after).join(' '));
  // Restoring the path before revoking hands the credential straight back.
  v = await seq(['a-snapshot','a-isolate','a-thermal','a-restore','a-revoke']);
  check('restoring before revoking is caught: the credential is handed back',
        v.hard.some(c=>c.before==='a-revoke' && c.after==='a-restore'));
  /* The soft constraint must NOT be reported as irrecoverable. A mission where
     every rule is hard teaches rule-following, not risk-based containment. */
  v = await seq(['a-snapshot','a-revoke','a-isolate','a-restore','a-thermal']);
  check('spending thermal margin on forensics is a TRADE-OFF, not a violation',
        v.soft.some(c=>c.before==='a-thermal') && !v.hard.some(c=>c.before==='a-thermal'),
        `${v.hard.length} hard, ${v.soft.length} soft`);
  // The worst case must report every hard violation, not just the first.
  v = await seq(['a-restore','a-thermal','a-isolate','a-revoke','a-snapshot']);
  check('the worst ordering reports EVERY violation, not just the first',
        v.hard.length >= 4, `${v.hard.length} hard`);
  check('every reported violation carries a reason the player can act on',
        v.hard.every(c=>c.reason && c.reason.length > 40));
  await p13.close();

  for (const L of [{m:14,t:/COLD HORIZON/i,trap:['r-narrative','r-session'],sol:['r-narrative','r-badge'],notInd:['r-timeline','r-evidence-seal']},
                   {m:15,t:/BLACK RELAY/i,trap:['ep-a','ep-b'],sol:['ep-a','ep-flow'],notInd:['ep-flow','ep-tls']}]) {
    console.log(`\n  mission ${L.m}`);
    const pg = await open(base+`gateway.html?m=${L.m}&qa=1`);
    const t = await pg.evaluate(()=>document.getElementById('mTitle').textContent);
    check(`m${L.m} renders its own title`, L.t.test(t), t);
    let r = await testPair(pg, L.trap[0], L.trap[1]);
    check(`m${L.m} TRAP rejected: ${L.trap.join(' vs ')}`, r.ok===false && r.shared.length>0, 'shared: '+r.shared.join(','));
    r = await testPair(pg, L.sol[0], L.sol[1]);
    check(`m${L.m} SOLUTION accepted: ${L.sol.join(' vs ')}`, r.ok===true, 'shared: '+r.shared.join(','));
    r = await testPair(pg, L.notInd[0], L.notInd[1]);
    check(`m${L.m} two corroborators are NOT independent of each other`, r.ok===false, 'shared: '+r.shared.join(','));
    // Sequencing belongs to 13 alone.
    const noSeq = await pg.evaluate(()=>getComputedStyle(document.getElementById('seqPanel')).display === 'none');
    check(`m${L.m} does not grow a sequencing panel it has no actions for`, noSeq);
    await pg.close();
  }

  /* ── CROSS-MISSION CREDIT ───────────────────────────────────────────────
     Several missions legitimately accept the SAME shared-dependency value as
     their answer: astraea-telemetry-ca is correct for missions 1, 10 and 12.
     validateFlag without a flagId loops every flag and the first match wins, so
     a student solving mission 12 would have been credited for mission 10.
     Silent, and it would have looked like the box working. */
  const dup = await (async () => {
    const D = require('./derive-flag-values.js');
    const m1 = ['PLAT-CLK-A','bus-a/thermal/aggregator-1','astraea-telemetry-ca'];
    const all = Object.assign({1:m1}, D), seen = {};
    for (const [n,v] of Object.entries(all)) for (const x of v) (seen[x]=seen[x]||[]).push(n);
    return Object.entries(seen).filter(([,ms])=>ms.length>1);
  })();
  check('collisions exist, so a flagId is REQUIRED not optional',
        dup.length > 0, `${dup.length} values accepted by more than one mission`);
  const gwSrc = fs.readFileSync(
    '/home/eq/ai-content/hexworth-prime/_app/arena/boxes/le-01-cold-horizon/gateway.html','utf8');
  const telSrc2 = fs.readFileSync(
    '/home/eq/ai-content/hexworth-prime/_app/arena/boxes/le-01-cold-horizon/telemetry.html','utf8');
  const engSrc = fs.readFileSync(
    '/home/eq/ai-content/hexworth-prime/_app/arena/engine/LagrangeEngine.js','utf8');
  check('every page submits WITH its own flag id, so credit lands on the right mission',
        /submitFlag\(v,\s*flag\.id\)/.test(gwSrc) && /submitFlag\(v,\s*\(cfg\.flags/.test(telSrc2));
  check('the engine forwards flagId to validateFlag when given one',
        /if \(flagId\) payload\.flagId = flagId/.test(engSrc));

  /* Derived, never hand-written: a hand-written answer is one edit from disagreeing
     with the fixture it describes, and the player is told they are wrong for reading
     the evidence correctly. */
  const derived = require('./derive-flag-values.js');
  check('every built mission has at least one derived accepted answer',
        Object.keys(derived).length >= 14 &&
        Object.values(derived).every(v => v.length > 0),
        `${Object.keys(derived).length} missions derived`);

  /* ── FALSE-NEGATIVE GRADING ────────────────────────────────────────────
     Chris blocked the deploy on this and he was right. validateFlag answers a
     MISSING registry entry with {correct:false} -- byte-identical to a genuinely
     wrong answer -- so submitFlag took the wrong-answer branch, subtracted
     wrongAnswerPenalty and rendered "Rejected". A student who solved mission 2
     correctly would have been told they were wrong AND docked points.

     Asserted on BEHAVIOUR, not on the config flag: spy on the real submitFlag
     and watch the real score. */
  console.log('\n  grading honesty');
  /* Every flag is seeded and gradable as of 2026-08-09, so the ungraded PATH can no
     longer be exercised through a real mission. The guard still matters: it is what
     protects mission 16 the day it is authored and not yet seeded. So assert both
     halves -- a gradable mission really does submit, and the guard that would stop an
     ungradable one is still present and still keyed on the flag. */
  const pg = await open(base+'gateway.html?m=2&qa=1');
  const graded2 = await pg.evaluate(async ()=>{
    const Q = window.__LE_QA__;
    let called = 0;
    const real = Q.eng.submitFlag.bind(Q.eng);
    Q.eng.submitFlag = function(v, id){ called++; return Promise.resolve({correct:false, offline:true}); };
    document.getElementById('flagInput').value = 'FLAG{x}';
    document.getElementById('submitBtn').click();
    await new Promise(r=>setTimeout(r,400));
    Q.eng.submitFlag = real;
    return { called, btn: document.getElementById('submitBtn').textContent };
  });
  check('a SEEDED mission submits for real', graded2.called === 1, `called ${graded2.called}x`);
  check('and its button is not labelled ungradable', !/not gradable/i.test(graded2.btn), graded2.btn);
  const gwSrc2 = fs.readFileSync(
    '/home/eq/ai-content/hexworth-prime/_app/arena/boxes/le-01-cold-horizon/gateway.html','utf8');
  check('the ungradable guard still exists for the next unseeded mission',
        /flag\.gradable === false/.test(gwSrc2) && /cannot be graded yet/.test(gwSrc2));
  check('no flag is left marked ungradable while the box claims it',
        (await pg.evaluate(()=>ColdHorizonConfig.flags.filter(f=>f.gradable===false).length)) === 0);
  await pg.close();

  /* (The ungraded-path behaviour test lived here. It could only run while a
     mission was unseeded, which is no longer a state this box can be in. The
     guard it covered is now asserted above by presence and by its inverse.) */

  /* A guard that blocked EVERYTHING would pass all four checks above. Mission 1
     is seeded, so its submit path must still run. */
  const pg1 = await open(base+'telemetry.html?qa=1');
  const graded = await pg1.evaluate(async ()=>{
    // telemetry.html has no seam, so reach the engine through the click path and
    // observe the message it produces. Not signed in, so the honest outcome is
    // the offline branch -- what matters is that the gradable guard did NOT fire.
    document.getElementById('flagInput').value = 'FLAG{x}';
    document.getElementById('submitBtn').click();
    await new Promise(r=>setTimeout(r,3200));
    return { msg: document.getElementById('submitMsg').textContent };
  });
  check('a SEEDED mission is not blocked by the guard (it reaches the real path)',
        !/cannot be graded/i.test(graded.msg), JSON.stringify(graded.msg.slice(0,90)));
  await pg1.close();

  console.log('\n=== ERRORS ('+errs.length+') ===');
  errs.slice(0,15).forEach(e=>console.log('  '+e.slice(0,220)));

  const passed = results.filter(r=>r.pass).length;
  console.log(`\n${passed}/${results.length} checks passed, ${errs.length} runtime errors\n`);
  await browser.close(); server.close();
  process.exit(passed === results.length && errs.length === 0 ? 0 : 1);
})();
