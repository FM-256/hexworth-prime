#!/usr/bin/env node
// subnet-siege-winnability.js — frame-by-frame winnability proof for Subnet Siege after the
// isInSubnet targeting gate (a correct tower now fires ONLY at threats inside its own /cidr subnet,
// instead of suppressing the whole board). That stricter rule lowers per-block DPS, and the wave
// table (hp/count/spawnInterval) was tuned against the old board-wide behavior — so every wave must
// be re-proven clearable under a real, legal correct board.
//
// This is NOT a structural/coverage check. It loads the actual applet headless, cancels the real
// rAF loop, and drives the REAL update functions (updatePackets/updateTowers/updateProjectiles/
// checkWaveComplete) tick-by-tick at dt=1.0 with the real range/fireRate/damage/travel constants and
// the game's own one-target-at-a-time contention. Towers are placed through the REAL placement path
// (selectTowerType -> handleSpotClick -> confirmSubnet) so the tower objects are byte-for-byte what
// the game produces (no hand-rolled shape that could drift from reality).
//
// Per wave it escalates the tower budget from "one correct tower per threat block" up to the 10-spot
// max (filling extras as REDUNDANT backup on real blocks, boss lane first) and reports the MINIMAL
// board that clears the wave plus the serverHP margin. A wave that cannot clear even at 10 towers is
// reported as a BALANCE FINDING, not hidden. A lazy negative-control (cover only one block of a
// multi-block wave) must leak, proving the coverage requirement actually bites.
//
// Usage: node _tools/arcade-fixes/subnet-siege-winnability.js   (exit 0 = every wave winnable)
const http = require('http'), fs = require('fs'), path = require('path');
const pup = require('puppeteer');
const APP = path.resolve(__dirname, '../../_app');
const GAME_URL = '/houses/web/games/web-subnet-siege.applet.html';
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.css': 'text/css', '.webp': 'image/webp', '.png': 'image/png', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.woff': 'font/woff' };
const sleep = (ms) => new Promise(r => setTimeout(r, ms)); // await a delay between async driver steps
const TICK_CAP = 8000; // hard ceiling on ticks per wave so a stalled sim can never hang the harness

// Static server rooted at _app so the applet + its component scripts load same-origin.
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
  pg.on('pageerror', e => errs.push(String(e.message).slice(0, 200)));
  await pg.setRequestInterception(true);
  // Neutralize component dependencies (AccessGuard/AchievementManager/etc.) so init can't redirect or
  // throw — we are testing game math, not the platform shell. HexAIButton (ES module) is stubbed too.
  pg.on('request', r => {
    const u = r.url();
    if (/AccessGuard\.js|AchievementManager\.js|ModuleProgress\.js|GameTracker\.js|GameScoreboard\.js|AchievementSystem\.js|HexAIButton\.js/.test(u)) {
      // Catch-all proxies: any method call on these platform shims is a safe no-op, so the game can
      // call GameTracker.record / AchievementManager.unlock / etc. without us enumerating every method.
      r.respond({ status: 200, contentType: 'text/javascript', body:
        'var __noop=function(){};' +
        'window.AccessGuard=new Proxy({},{get:function(){return function(){return true;};}});' +
        'var __shim=function(){return new Proxy({},{get:function(){return __noop;},apply:function(){return undefined;}});};' +
        'window.AchievementManager=__shim();window.ModuleProgress=__shim();window.GameTracker=__shim();window.GameScoreboard=__shim();window.AchievementSystem=__shim();' });
    } else r.continue();
  });
  await pg.goto('http://localhost:' + port + GAME_URL, { waitUntil: 'domcontentloaded', timeout: 20000 }).catch(() => {});
  await sleep(400);

  // RUNS>1 turns on the N-run stress gate: the leak count on a maxed board is a random variable, so a
  // single clean run is not proof of winnability. Set RUNS=30 (or more) to require 0 wipes across all trials.
  const RUNS = parseInt(process.env.RUNS || '1', 10);
  // Everything below runs in the page so it drives the game's own globals/functions directly.
  const report = await pg.evaluate((TICK_CAP, RUNS) => {
    // Stop the real animation loop; we step the logic ourselves for determinism.
    if (typeof rafId !== 'undefined' && rafId) cancelAnimationFrame(rafId);
    const TYPE_BY_CIDR = { 24: 'scanner', 26: 'firewall', 28: 'ids', 30: 'waf' };

    // Run exactly the STATE_WAVE tick body from gameLoop, at normal-speed dt=1.0.
    function simTick() { updatePackets(1.0); updateTowers(); updateProjectiles(); checkWaveComplete(); }

    // Place ONE tower of the given type on a spot via the real path, choosing the correct option the
    // block-aware generator surfaces. Returns the tower's resulting flags for accounting.
    function placeReal(type, spotIndex) {
      selectedTowerType = type; sellMode = false; reconfigureMode = false; pendingReconfigure = false;
      handleSpotClick(spotIndex);                       // generates pendingSubnetOpts + opens chooser
      const idx = pendingSubnetOpts.findIndex(o => o.isCorrect);
      confirmSubnet(idx);                               // pushes the real tower object
      const t = towers.find(tw => tw.spotIndex === spotIndex);
      return t ? { misconfigured: t.misconfigured, redundant: t.redundant, net: t.networkAddr } : null;
    }

    // Build a legal correct board for a wave: one matching-cidr tower per threat block, then fill up
    // to `budget` extra spots as redundant backup, boss /24 lane first (blocks cycled round-robin).
    function buildBoard(waveIdx, budget) {
      initGame();                 // resets towers/credits/hp/state to a clean STATE_PREP
      credits = 9999999;          // winnability tests coverage/DPS, not the credit economy
      towers.length = 0;
      const wd = WAVE_DATA[waveIdx];
      // Order blocks so the /24 boss lane (if any) sorts first for redundant priority.
      const blocks = wd.threatNets.slice().sort((a, b) => a.cidr - b.cidr);
      let spot = 0;
      // one correct tower per distinct block
      for (const n of blocks) { if (spot >= 10) break; placeReal(TYPE_BY_CIDR[n.cidr], spot++); }
      // fill remaining spots up to budget with redundant backup, cycling blocks (boss lane first)
      let bi = 0;
      while (spot < budget && spot < 10) { const n = blocks[bi % blocks.length]; placeReal(TYPE_BY_CIDR[n.cidr], spot++); bi++; }
      return towers.length;
    }

    // Run one wave to completion (or the tick cap) and return the outcome.
    function runWave(waveIdx) {
      currentWave = waveIdx;      // startNextWave does currentWave++ then reads WAVE_DATA[currentWave-1]
      startNextWave();            // -> STATE_WAVE, builds spawnQueue for this wave
      let ticks = 0;
      while (!waveComplete && ticks < TICK_CAP && serverHP > 0) { simTick(); ticks++; }
      const bossLeaked = packets.some(p => p.isBoss && p.reachedEnd);
      return { hp: serverHP, missed: waveMissed, fp: waveFP, ticks, complete: waveComplete, bossLeaked };
    }

    // For each wave, find the minimal tower budget that clears it (serverHP survives), escalating from
    // block-count up to 10, and report the margin at that minimal board.
    const results = [];
    for (let w = 0; w < WAVE_DATA.length; w++) {
      const nBlocks = WAVE_DATA[w].threatNets.length;
      let solved = null;
      for (let budget = nBlocks; budget <= 10; budget++) {
        buildBoard(w, budget);
        const out = runWave(w);
        if (out.hp > 0 && out.complete && !out.bossLeaked) { solved = { budget, ...out }; break; }
        if (budget === 10) solved = { budget: 10, unwinnable: true, ...out };
      }
      results.push({ wave: w + 1, name: WAVE_DATA[w].name, blocks: nBlocks, ...solved });
    }

    // Negative control: a multi-block wave covered LAZILY (only its first block) MUST leak — proves the
    // coverage requirement bites and the isInSubnet gate isn't a no-op. Use the first wave with >1 block.
    let lazy = null;
    const multi = WAVE_DATA.findIndex(wd => wd.threatNets.length > 1);
    if (multi > -1) {
      initGame(); credits = 9999999; towers.length = 0;
      placeReal(TYPE_BY_CIDR[WAVE_DATA[multi].threatNets.slice().sort((a,b)=>a.cidr-b.cidr)[0].cidr], 0); // cover ONE block only
      const out = runWave(multi);
      lazy = { wave: multi + 1, coveredBlocks: 1, totalBlocks: WAVE_DATA[multi].threatNets.length, missed: out.missed, hp: out.hp };
    }
    // Reconfigure-path check: place a tower on a WRONG block (misconfigured), then re-aim it to the
    // correct block. Proves the reconfigure branch mutates the existing tower in place (no duplicate),
    // clears misconfigured, and charges the flat base fee (25c) for a correct re-aim.
    let reconfigure = null;
    {
      initGame(); credits = 9999999; towers.length = 0; currentWave = 0; gameState = STATE_PREP;
      selectedTowerType = 'scanner'; sellMode = false; reconfigureMode = false; pendingReconfigure = false;
      handleSpotClick(0);
      const wrongIdx = pendingSubnetOpts.findIndex(o => !o.isCorrect);
      confirmSubnet(wrongIdx);
      const t0 = towers.find(t => t.spotIndex === 0);
      const beforeNet = t0 ? t0.networkAddr : null;
      const beforeMis = t0 ? t0.misconfigured : null;
      const creditsBefore = credits;
      // now re-aim it correctly
      reconfigureMode = true; selectedTowerType = null; sellMode = false; pendingReconfigure = false;
      handleSpotClick(0);       // reconfigure branch: opens the chooser for the EXISTING tower
      const rIdx = pendingSubnetOpts.findIndex(o => o.isCorrect);
      confirmSubnet(rIdx);
      const t1 = towers.find(t => t.spotIndex === 0);
      reconfigure = {
        wasMisconfigured: beforeMis === true,
        nowCorrect: !!t1 && t1.misconfigured === false,
        netChanged: !!t1 && t1.networkAddr !== beforeNet,
        towerCountStable: towers.length === 1,          // re-aim must NOT add a tower
        chargedBase: (creditsBefore - credits) === 25   // correct re-aim = flat 25c
      };
    }
    // N-run stress gate: at the 10-tower CEILING (the best board any player can build — 10 is the hard
    // TOWER_SPOTS cap), a wave must NEVER wipe. Leak count is a random variable whose upper tail can
    // cross the lethal threshold, so we repeat every wave RUNS times and require 0 failures.
    let stress = null;
    if (RUNS > 1) {
      const s = WAVE_DATA.map((wd, i) => ({ wave: i + 1, name: wd.name, fails: 0, minHp: 100, maxLeak: 0 }));
      for (let run = 0; run < RUNS; run++) {
        for (let w = 0; w < WAVE_DATA.length; w++) {
          buildBoard(w, 10);
          const out = runWave(w);
          if (out.hp <= 0 || !out.complete || out.bossLeaked) s[w].fails++;
          if (out.hp < s[w].minHp) s[w].minHp = out.hp;
          if (out.missed > s[w].maxLeak) s[w].maxLeak = out.missed;
        }
      }
      stress = { runs: RUNS, per: s };
    }
    return { results, lazy, reconfigure, stress };
  }, TICK_CAP, RUNS);

  await b.close(); srv.close();

  // ---- verdict + human-readable report ----
  let pass = true;
  console.log('\n=== Subnet Siege winnability (real tick-sim, dt=1.0, isInSubnet gate) ===');
  let tightest = null;
  for (const r of report.results) {
    if (r.unwinnable) {
      pass = false;
      console.log(`  W${String(r.wave).padStart(2)} ${r.name.padEnd(20)} BALANCE FINDING — UNWINNABLE even at 10 towers (HP ${r.hp}, missed ${r.missed}, bossLeaked ${r.bossLeaked})`);
    } else {
      console.log(`  W${String(r.wave).padStart(2)} ${r.name.padEnd(20)} clears with ${r.budget} towers  | serverHP margin ${r.hp}/100  | leaked ${r.missed}  | ticks ${r.ticks}`);
      if (!tightest || r.hp < tightest.hp) tightest = r;
    }
  }
  if (report.lazy) {
    const l = report.lazy; const bit = l.missed > 0;
    if (!bit) pass = false;
    console.log(`\n  Negative control (W${l.wave}, ${l.coveredBlocks}/${l.totalBlocks} blocks covered): leaked ${l.missed}  -> ${bit ? 'OK, coverage requirement bites' : 'FAIL, lazy board did NOT leak (gate is a no-op!)'}`);
  }
  if (report.reconfigure) {
    const rc = report.reconfigure;
    const rcOk = rc.wasMisconfigured && rc.nowCorrect && rc.netChanged && rc.towerCountStable && rc.chargedBase;
    if (!rcOk) pass = false;
    console.log(`\n  Reconfigure path: misconfigured->re-aimed correct=${rc.nowCorrect}, block changed=${rc.netChanged}, no duplicate tower=${rc.towerCountStable}, charged flat 25c=${rc.chargedBase}  -> ${rcOk ? 'OK' : 'FAIL'}`);
  }
  if (tightest) console.log(`\n  Tightest wave: W${tightest.wave} ${tightest.name} — ${tightest.budget} towers, only ${tightest.hp}/100 HP left.`);

  // N-run stress verdict: any wave that wipes even once at the 10-tower ceiling fails the gate.
  if (report.stress) {
    console.log(`\n=== ${report.stress.runs}-run stress at 10-tower ceiling (winnability must be GUARANTEED, not likely) ===`);
    for (const p of report.stress.per) {
      const bad = p.fails > 0;
      if (bad) pass = false;
      console.log(`  W${String(p.wave).padStart(2)} ${p.name.padEnd(20)} wipes ${p.fails}/${report.stress.runs}  | worst HP ${p.minHp}/100  | max leak ${p.maxLeak}  ${bad ? '<-- FAIL' : ''}`);
    }
  }
  if (errs.length) { console.log('\n  pageErrors:', errs.slice(0, 5)); }
  console.log(pass ? '\n*** ALL WAVES WINNABLE ***' : '\n!!! BALANCE / GATE FINDING ABOVE — surface to operator !!!');
  process.exit(pass ? 0 : 1);
})();
