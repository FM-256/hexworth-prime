#!/usr/bin/env node
// ad-attack-path-check.js — browser-level regression gate for the AD Attack Path game.
//
// This game teaches BloodHound-style Active Directory attack-path reasoning. It was audited
// to have mislabeled GenericAll as "the Kerberoast prerequisite" (the real prerequisite is the
// target having a registered SPN — MITRE ATT&CK T1558.003) and to play too passively (click
// any node adjacent to a compromised one — no real edge-semantics validation). The fix adds
// an EDGE_SEMANTICS engine + edge-selection mechanic (see cloud-ad-attack-path.applet.html).
// This check loads the real page headless (stubbing only the auth/telemetry dependency
// scripts, same pattern as cockpit-render-check.js), drives the exposed window.ADGame API
// (which calls the SAME attemptTraverse()/edgeVerdict() a real click uses — no bypass), and
// asserts: 0 pageErrors, a VALID chain wins every scenario, an INVALID hop is REJECTED with a
// real reason, and the corrected SPN-based wording is present while the old mislabel is gone.
//
// Usage: node _tools/arcade-fixes/ad-attack-path-check.js   (exit 0 = pass)
const http = require('http'), fs = require('fs'), path = require('path');
const pup = require('puppeteer');
const APP = path.resolve(__dirname, '../../_app');
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.css': 'text/css', '.webp': 'image/webp', '.png': 'image/png', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.woff': 'font/woff' };
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
let pass = true;
const ok = (n, c, e) => { if (!c) pass = false; console.log('  ' + (c ? 'PASS' : 'FAIL') + '  ' + n + (e !== undefined ? '  ' + JSON.stringify(e).slice(0, 400) : '')); };

// Static file server rooted at _app so the applet + its component scripts load same-origin.
const srv = http.createServer((q, s) => {
  let p = decodeURIComponent(q.url.split('?')[0]); let fp = path.join(APP, p);
  if (fs.existsSync(fp) && fs.statSync(fp).isFile()) { s.writeHead(200, { 'Content-Type': MIME[path.extname(fp)] || 'application/octet-stream' }); fs.createReadStream(fp).pipe(s); }
  else { s.writeHead(404); s.end('nf'); }
});

(async () => {
  await new Promise(r => srv.listen(0, r)); const port = srv.address().port;
  const b = await pup.launch({ headless: 'new', args: ['--no-sandbox'] });
  const pg = await b.newPage();
  const errs = [];
  pg.on('pageerror', e => { const m = String(e.message); if (!/firebase|firestore|auth\/|not authenticated/i.test(m)) errs.push(m.slice(0, 200)); });
  await pg.setRequestInterception(true);
  // Stub the page's dependency scripts so it renders standalone instead of redirecting
  // (AccessGuard.require('sorted') would otherwise navigate away after ~100ms) or throwing
  // on undefined globals. None of these are what we're testing — the game logic is.
  pg.on('request', r => {
    const u = r.url();
    if (u.endsWith('AccessGuard.js')) r.respond({ status: 200, contentType: 'text/javascript', body: 'window.AccessGuard={require(){},requireAll(){},requireAny(){}};' });
    else if (u.endsWith('AchievementManager.js')) r.respond({ status: 200, contentType: 'text/javascript', body: 'window.AchievementManager={unlock(){}};' });
    else if (u.endsWith('ModuleProgress.js')) r.respond({ status: 200, contentType: 'text/javascript', body: 'window.ModuleProgress={complete(){}};' });
    else if (u.endsWith('GameTracker.js')) r.respond({ status: 200, contentType: 'text/javascript', body: 'window.GameTracker={record(){}};' });
    else if (u.endsWith('GameScoreboard.js')) r.respond({ status: 200, contentType: 'text/javascript', body: '' });
    else if (u.endsWith('HexAIButton.js')) r.respond({ status: 200, contentType: 'text/javascript', body: '' });
    else r.continue();
  });

  await pg.goto('http://localhost:' + port + '/houses/cloud/games/cloud-ad-attack-path.applet.html', { waitUntil: 'domcontentloaded', timeout: 20000 }).catch(() => {});
  await sleep(400);

  // ── 0. The game's public API proves the whole script parsed + ran (catches a broken
  // template literal or syntax error, same rationale as cockpit-render-check.js).
  const haveApi = await pg.evaluate(() => ({
    load: typeof window.ADGame?.loadScenario, traverse: typeof window.ADGame?.traverse,
    state: typeof window.ADGame?.state, count: window.ADGame?.scenarioCount
  }));
  ok('window.ADGame API present (script ran fully): loadScenario/traverse/state, 8 scenarios', haveApi.load === 'function' && haveApi.traverse === 'function' && haveApi.state === 'function' && haveApi.count === 8, haveApi);

  // ── 1. VALID chain start -> Domain Admin via the edge-selection mechanic, for the
  // scenario that directly corrects the audited Kerberoast/GenericAll mislabel.
  // Greedy solver: repeatedly try every edge whose source is already compromised. Valid
  // edges advance the compromised set; decoys are rejected by the SAME attemptTraverse()
  // a real click uses and simply don't advance it. No scenario-specific hardcoding.
  const solve = async (i) => pg.evaluate((i) => {
    window.ADGame.loadScenario(i);
    let changed = true, passes = 0;
    while (changed && passes < 50) {
      passes++;
      const before = window.ADGame.state().compromised.length;
      window.ADGame.edgesOf(i).forEach(e => {
        const st = window.ADGame.state();
        if (st.compromised.includes(e.from) && !st.compromised.includes(e.to)) window.ADGame.traverse(e.from, e.to);
      });
      changed = window.ADGame.state().compromised.length > before;
    }
    return window.ADGame.state();
  }, i);

  const kerberoastResult = await solve(1); // scenario index 1 = "Kerberoasting" (the audited scenario)
  ok('Scenario 1 (Kerberoasting) reachable via a VALID chosen edge chain -> WIN', kerberoastResult.won === true, kerberoastResult);
  ok('Scenario 1 optimal step count matches the corrected 2-hop path (SPN account -> MemberOf)', kerberoastResult.steps === 2, kerberoastResult);

  // Sanity-check every other scenario also solves via the same generic greedy driver —
  // proves the whole redesign (decoys + real edges) is winnable, not just the one audited case.
  const allResults = [];
  for (let i = 0; i < haveApi.count; i++) allResults.push({ i, ...(await solve(i)) });
  ok('All 8 scenarios reach WIN via chosen valid edges (no scenario stuck on unwinnable decoys-only graph)', allResults.every(r => r.won), allResults.map(r => ({ i: r.i, won: r.won, steps: r.steps })));

  // ── 2. An INVALID hop is REJECTED with a real reason, and the game state is untouched.
  const rejection = await pg.evaluate(() => {
    window.ADGame.loadScenario(1); // fresh Kerberoasting scenario: user1 -(Kerberoast)-> svc_app has no SPN
    const before = window.ADGame.state();
    window.ADGame.traverse('user1', 'svc_app');
    const after = window.ADGame.state();
    const rejected = document.querySelector('.log-entry.log-rejected');
    return {
      stateUnchanged: JSON.stringify(before.compromised) === JSON.stringify(after.compromised),
      stepsUnchanged: before.steps === after.steps,
      rejectedLogText: rejected ? rejected.innerText : null
    };
  });
  ok('Invalid Kerberoast hop (no SPN) rejected: compromised set unchanged', rejection.stateUnchanged, rejection);
  ok('Invalid hop rejected: step counter unchanged (never pushed to attackPath)', rejection.stepsUnchanged);
  ok('Rejection logged in DOM with a real reason (mentions SPN)', !!rejection.rejectedLogText && /SPN/i.test(rejection.rejectedLogText), rejection.rejectedLogText);

  // ── 3. Corrected wording present, old mislabel gone, across the full rendered page +
  // the scenario data itself (hint text, technique text, edge label semantics).
  const pageText = await pg.evaluate(() => document.documentElement.outerHTML);
  const oldMislabelHint = /You have GenericAll on a service account\. Request its TGS ticket and crack it/i.test(pageText);
  const oldMislabelTechnique = /"technique"\s*:\s*"Kerberoast Attack"/i.test(pageText);
  ok('OLD mislabeled hint text ("GenericAll ... Request its TGS ticket") is GONE', !oldMislabelHint);
  ok('OLD mislabeled technique string ("Kerberoast Attack" on a GenericAll edge) is GONE', !oldMislabelTechnique);

  const correctedWording = await pg.evaluate(() => {
    window.ADGame.loadScenario(1);
    return document.getElementById('hintText').textContent;
  });
  ok('Corrected hint present: Kerberoasting scenario now teaches the SPN prerequisite', /SPN/i.test(correctedWording), correctedWording);

  const semanticsCheck = await pg.evaluate(() => {
    // Pull the actual edge that used to be mislabeled and confirm its corrected technique text.
    const edges = window.ADGame.edgesOf(1);
    const kerbEdge = edges.find(e => e.label === 'Kerberoast' && e.to === 'svc_sql');
    return { found: !!kerbEdge, label: kerbEdge && kerbEdge.label };
  });
  ok('Standard Kerberoastable account now reached via a "Kerberoast" edge (not GenericAll)', semanticsCheck.found && semanticsCheck.label === 'Kerberoast', semanticsCheck);

  ok('0 non-firebase pageErrors', errs.length === 0, errs.slice(0, 4));

  await b.close(); srv.close();
  console.log(pass ? '\n*** AD ATTACK PATH CHECK OK ***' : '\n!!! AD ATTACK PATH CHECK FAILURES ABOVE !!!');
  process.exit(pass ? 0 : 1);
})();
