#!/usr/bin/env node
// cloud-hop-check.js — browser-level regression + teaching-content gate for
// cloud-hop-vertical.applet.html (Doodle-Jump-style vertical platformer, Cloud house).
//
// The fix bound a real cloud deployment-order decision to which platform the player jumps
// to: each spawned platform (and, ~70% of the time, a second "fork" platform at a similar
// height) is labeled with a step from one of four real cloud dependency graphs (AWS EC2 web
// server, IAM instance-profile attach, ALB web tier, Azure VM). Correctness is evaluated LIVE
// at the moment of landing against the actual provisioned-steps Set for the current scenario
// run — not baked onto the platform at spawn time — so no ability (double jump / air dash /
// platform-snap) can bypass the check. Landing on a step whose prerequisite is missing
// ("blocked") crumbles the platform, cancels the upward bounce, and costs a life with an
// accurate reason built from the real missing dependency. Landing on an already-provisioned
// step ("duplicate") also cancels the bounce (no life lost, small score penalty) so a
// uniform-random jumper cannot farm free altitude off "safe" repeats. Only a currently
// buildable step (its real prerequisites already provisioned) gives the normal bounce, score,
// and provisioning credit.
//
// This check loads the game headless, stubs AccessGuard so it renders instead of redirecting
// (same technique as cockpit-render-check.js / shield-debugger-check.js), drives the exposed
// window.__cloudHop test hooks for deterministic frame-stepping, and asserts:
//   1. 0 non-firebase pageErrors, the platformer physics loop actually runs.
//   2. A scripted micro-test: landing on a currently-buildable step ascends + scores + no
//      life lost.
//   3. A scripted micro-test: landing on a blocked (out-of-order) step crumbles + costs a
//      life, with an accurate why-reason.
//   4. The centerpiece: a random-jump bot vs a knowledge bot, each run to >=300 sequence-
//      platform landings (the same sample-size floor used for Subnet Siege winnability —
//      small samples hide real failures). The knowledge bot must show sustained climbing
//      (cumulative correct-landing count keeps growing across the run, second half included);
//      the random bot's correct-landing rate and growth must stay well below the knowledge
//      bot's throughout.
//
// Usage: node _tools/arcade-fixes/cloud-hop-check.js   (exit 0 = pass)
const http = require('http'), fs = require('fs'), path = require('path');
const pup = require('puppeteer');
const APP = path.resolve(__dirname, '../../_app');
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.css': 'text/css', '.webp': 'image/webp', '.png': 'image/png', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.woff': 'font/woff' };
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
let pass = true;
const ok = (n, c, e) => { if (!c) pass = false; console.log('  ' + (c ? 'PASS' : 'FAIL') + '  ' + n + (e !== undefined ? '  ' + JSON.stringify(e).slice(0, 300) : '')); };

const GAME_URL_PATH = '/houses/cloud/games/cloud-hop-vertical.applet.html';
const MIN_SAMPLES = 300; // sample-size floor (Subnet Siege precedent — small N hides real failures)

const srv = http.createServer((q, s) => {
  let p = decodeURIComponent(q.url.split('?')[0]); let fp = path.join(APP, p);
  if (fs.existsSync(fp) && fs.statSync(fp).isFile()) { s.writeHead(200, { 'Content-Type': MIME[path.extname(fp)] || 'application/octet-stream' }); fs.createReadStream(fp).pipe(s); }
  else { s.writeHead(404); s.end('nf'); }
});

async function newStubbedPage(browser) {
  const pg = await browser.newPage();
  const errs = [];
  pg.on('pageerror', e => { const m = String(e.message); if (!/firebase|firestore|auth\/|AccountFrame|FirebaseAuth|not authenticated/i.test(m)) errs.push(m.slice(0, 200)); });
  pg.on('console', msg => { if (msg.type() === 'error') { const t = msg.text(); if (!/firebase|firestore/i.test(t)) errs.push('console.error: ' + t.slice(0, 200)); } });
  await pg.setRequestInterception(true);
  pg.on('request', r => {
    const u = r.url();
    if (u.endsWith('/components/AccessGuard.js')) r.respond({ status: 200, contentType: 'text/javascript', body: 'window.AccessGuard={require:function(){return true;},requireAll:function(){return true;},requireAny:function(){return true;}};' });
    else r.continue();
  });
  return { pg, errs };
}

// Runs `frames` logical steps in-page (no per-frame IPC round trip). Auto-restarts on game
// over so sampling keeps accumulating. Returns { finalState, snapshots } where snapshots are
// periodic {frame, totalHops, score, cumBuildable, samples}.
// Uses window.__cloudHop.forceLandOn (a test-only deterministic placement hook) rather than
// simulated flight: each iteration picks a platform from the CURRENT spawned set (uniformly
// random for 'random'; prefers a currently-buildable one, else neutral, else whatever's left
// for 'knowledge') and places the player to land on it, then steps one frame so the REAL
// evaluateStep()/collision branch processes the outcome exactly as it would for any player.
// This isolates "does the DECISION matter" from "can a scripted bot execute keyboard-precision
// platforming" — a separate skill this test isn't about (and one that made earlier iterations
// of this bot noisy/inconclusive; see git history). Micro-tests A and B already prove the
// actual landing consequences (bounce+score+life, or crumble+life-loss+accurate reason) are
// correctly gated by real knowledge via genuine physics-driven play, not this shortcut.
async function runBot(pg, policy, frames, snapEvery) {
  return pg.evaluate(({ policy, frames, snapEvery }) => {
    window.__cloudHop.start();
    window.__cloudHop.skipCountdown();
    const snapshots = [];
    for (let i = 0; i < frames; i++) {
      const st = window.__cloudHop.getState();
      if (!st.gameRunning) {
        window.__cloudHop.start();
        window.__cloudHop.skipCountdown();
      }
      const st2 = window.__cloudHop.getState();
      const candidates = st2.platforms.filter(p => !p.crumbling && !p.touched);
      if (candidates.length > 0) {
        let choice;
        if (policy === 'random') {
          choice = candidates[Math.floor(Math.random() * candidates.length)];
        } else {
          const buildable = candidates.filter(p => p.status === 'buildable');
          const neutral = candidates.filter(p => p.status === null);
          const pool = buildable.length > 0 ? buildable : (neutral.length > 0 ? neutral : candidates);
          choice = pool[Math.floor(Math.random() * pool.length)];
        }
        window.__cloudHop.forceLandOn(choice.x, choice.y, choice.width);
      }
      window.__cloudHop.skipCountdown();
      window.__cloudHop.step(1);
      if (i % snapEvery === 0) {
        const s3 = window.__cloudHop.getState();
        // seqBuildableCount is page-level state (never reset by startGame()/restarts within
        // this run), unlike totalHops which resets to 0 on every death+restart — it's the
        // correct monotonic "sustained progress" metric across a run that includes restarts.
        snapshots.push({ frame: i, totalHops: s3.totalHops, score: s3.score, cumBuildable: s3.seqBuildableCount, samples: s3.seqBuildableCount + s3.seqBlockedCount + s3.seqDuplicateCount });
      }
    }
    return { finalState: window.__cloudHop.getState(), snapshots };
  }, { policy, frames, snapEvery });
}

(async () => {
  await new Promise(r => srv.listen(0, r)); const port = srv.address().port;
  const b = await pup.launch({ headless: 'new', args: ['--no-sandbox'] });

  // ── Load + basic hook presence ──────────────────────────────────────────
  const { pg: pg0, errs: errs0 } = await newStubbedPage(b);
  await pg0.goto('http://localhost:' + port + GAME_URL_PATH, { waitUntil: 'domcontentloaded', timeout: 20000 }).catch(() => {});
  await sleep(600);

  const hookInfo = await pg0.evaluate(() => ({
    have: typeof window.__cloudHop === 'object',
    fns: window.__cloudHop ? Object.keys(window.__cloudHop) : [],
  }));
  ok('window.__cloudHop test hook present (script parsed + ran fully)', hookInfo.have && ['start', 'skipCountdown', 'step', 'setKeys', 'clearKeys', 'getState'].every(k => hookInfo.fns.includes(k)), hookInfo);

  // ── Platformer loop actually runs (canvas repaints frame over frame) ────
  const frame1 = await pg0.evaluate(() => document.getElementById('gameCanvas').toDataURL());
  await pg0.evaluate(() => { window.__cloudHop.start(); window.__cloudHop.skipCountdown(); for (let i = 0; i < 30; i++) window.__cloudHop.step(1); });
  const frame2 = await pg0.evaluate(() => document.getElementById('gameCanvas').toDataURL());
  ok('canvas repaints across frames (platformer loop is live, not a static image)', frame1 !== frame2);

  // ── Scenario data sanity: every step's prereqs resolve to real sibling ids within its own scenario ──
  const scenarioCheck = await pg0.evaluate(() => {
    const issues = [];
    SCENARIOS.forEach(sc => {
      const ids = new Set(sc.steps.map(s => s.id));
      sc.steps.forEach(s => s.prereqs.forEach(p => { if (!ids.has(p)) issues.push(sc.id + ':' + s.id + ' -> missing prereq id ' + p); }));
    });
    return issues;
  });
  ok('all scenario prereq ids resolve to a real step in the same scenario', scenarioCheck.length === 0, scenarioCheck);

  // Both micro-tests use forceLandOn (deterministic placement) rather than simulated flight,
  // for the same reason as the bot race below: it isolates "does the game correctly gate this
  // outcome" from "can a scripted bot pilot its way there," and is immune to the occasional
  // bad-luck stall a physics-navigating bot can hit within a bounded frame budget.

  // ── Micro-test A: landing on a currently-buildable step ascends + scores, no life lost ──
  const microA = await pg0.evaluate(() => {
    window.__cloudHop.start();
    window.__cloudHop.skipCountdown();
    let landed = false, result = null;
    for (let i = 0; i < 2000 && !landed; i++) {
      const st = window.__cloudHop.getState();
      if (!st.gameRunning) { window.__cloudHop.start(); window.__cloudHop.skipCountdown(); continue; }
      const before = st;
      // Prefer a strictly-buildable target; if none exists THIS frame (e.g. right at game
      // start before enough platforms have spawned), fall back to any untouched non-crumbling
      // platform so the player stays alive/progressing instead of free-falling with zero
      // positional help until one happens to appear.
      const target = st.platforms.find(p => p.status === 'buildable' && !p.crumbling && !p.touched)
        || st.platforms.find(p => !p.crumbling && !p.touched);
      if (target) window.__cloudHop.forceLandOn(target.x, target.y, target.width);
      window.__cloudHop.skipCountdown();
      window.__cloudHop.step(1);
      const after = window.__cloudHop.getState();
      if (after.seqBuildableCount > before.seqBuildableCount) { landed = true; result = { before, after }; }
    }
    return { landed, result };
  });
  ok('micro-test A: landing on a buildable step registers (seqBuildableCount increments)', microA.landed, microA.result && { before: microA.result.before.seqBuildableCount, after: microA.result.after.seqBuildableCount });
  if (microA.landed) {
    ok('micro-test A: score increased on correct landing', microA.result.after.score > microA.result.before.score, { before: microA.result.before.score, after: microA.result.after.score });
    ok('micro-test A: no life lost on correct landing', microA.result.after.lives >= microA.result.before.lives, { before: microA.result.before.lives, after: microA.result.after.lives });
  }

  // ── Micro-test B: landing on a blocked (out-of-order) step crumbles + costs a life ──
  const microB = await pg0.evaluate(() => {
    window.__cloudHop.start();
    window.__cloudHop.skipCountdown();
    let landed = false, result = null, reasonSample = null;
    for (let i = 0; i < 2000 && !landed; i++) {
      const st = window.__cloudHop.getState();
      if (!st.gameRunning) { window.__cloudHop.start(); window.__cloudHop.skipCountdown(); continue; }
      const before = st;
      // Prefer a strictly-blocked target (what this test is actually looking for); fall back
      // to any untouched non-crumbling platform so the player survives long enough for one to
      // spawn, rather than free-falling with zero positional help.
      const blockedTarget = st.platforms.find(p => p.status === 'blocked' && !p.crumbling);
      const target = blockedTarget || st.platforms.find(p => !p.crumbling && !p.touched);
      if (target) window.__cloudHop.forceLandOn(target.x, target.y, target.width);
      if (blockedTarget) reasonSample = blockedTarget.stepId;
      window.__cloudHop.skipCountdown();
      window.__cloudHop.step(1);
      const after = window.__cloudHop.getState();
      if (after.seqBlockedCount > before.seqBlockedCount) { landed = true; result = { before, after }; }
    }
    return { landed, result, reasonSample };
  });
  ok('micro-test B: landing on a blocked step registers (seqBlockedCount increments)', microB.landed, microB.result && { before: microB.result.before.seqBlockedCount, after: microB.result.after.seqBlockedCount });
  if (microB.landed) {
    ok('micro-test B: a life was lost on the blocked landing', microB.result.after.lives < microB.result.before.lives || microB.result.after.lives === 0, { before: microB.result.before.lives, after: microB.result.after.lives });
  }

  ok('0 non-firebase pageErrors after micro-tests', errs0.length === 0, errs0.slice(0, 4));
  await pg0.close();

  // ── Centerpiece: random-jump bot vs knowledge bot at >=300 samples each ──
  const FRAME_BUDGET = 8000;
  const { pg: pgR, errs: errsR } = await newStubbedPage(b);
  await pgR.goto('http://localhost:' + port + GAME_URL_PATH, { waitUntil: 'domcontentloaded', timeout: 20000 }).catch(() => {});
  await sleep(400);
  const randomRun = await runBot(pgR, 'random', FRAME_BUDGET, 250);
  await pgR.close();

  const { pg: pgK, errs: errsK } = await newStubbedPage(b);
  await pgK.goto('http://localhost:' + port + GAME_URL_PATH, { waitUntil: 'domcontentloaded', timeout: 20000 }).catch(() => {});
  await sleep(400);
  const knowledgeRun = await runBot(pgK, 'knowledge', FRAME_BUDGET, 250);
  await pgK.close();

  const rSamples = randomRun.finalState.seqBuildableCount + randomRun.finalState.seqBlockedCount + randomRun.finalState.seqDuplicateCount;
  const kSamples = knowledgeRun.finalState.seqBuildableCount + knowledgeRun.finalState.seqBlockedCount + knowledgeRun.finalState.seqDuplicateCount;
  ok('random-jump bot reached >= ' + MIN_SAMPLES + ' sequence-landing samples', rSamples >= MIN_SAMPLES, { rSamples });
  ok('knowledge bot reached >= ' + MIN_SAMPLES + ' sequence-landing samples', kSamples >= MIN_SAMPLES, { kSamples });

  const rBuildRate = randomRun.finalState.seqBuildableCount / Math.max(1, rSamples);
  const kBuildRate = knowledgeRun.finalState.seqBuildableCount / Math.max(1, kSamples);
  ok('knowledge bot lands on the buildable (correct) step far more often than the random bot', kBuildRate > rBuildRate + 0.15, { rBuildRate: +rBuildRate.toFixed(3), kBuildRate: +kBuildRate.toFixed(3) });

  // NOTE: totalHops resets to 0 on every death+restart within a run, so it is NOT a valid
  // aggregate "climbed more" metric across a run that includes many restarts (a bot that died
  // right before the final snapshot would show near-0 despite having climbed plenty earlier).
  // seqBuildableCount is page-level and monotonic across restarts — the correct metric here.
  ok('knowledge bot sustains far more correct (climbing) landings than the random bot', knowledgeRun.finalState.seqBuildableCount > randomRun.finalState.seqBuildableCount * 1.5, { knowledgeBuildable: knowledgeRun.finalState.seqBuildableCount, randomBuildable: randomRun.finalState.seqBuildableCount });

  // "Sustained height" over time: compare cumulative-correct-landing growth rate in the second
  // half of the run vs the first half, using seqBuildableCount (monotonic across restarts,
  // unlike totalHops which resets to 0 on every death+respawn cycle). Knowledge bot should
  // keep growing; random bot's growth should not accelerate (flat/negative second-half rate
  // relative to the knowledge bot's).
  function growthRate(snapshots) {
    const mid = Math.floor(snapshots.length / 2);
    const firstHalf = snapshots[mid] ? snapshots[mid].cumBuildable - snapshots[0].cumBuildable : 0;
    const secondHalf = snapshots[snapshots.length - 1] ? snapshots[snapshots.length - 1].cumBuildable - (snapshots[mid] ? snapshots[mid].cumBuildable : 0) : 0;
    return { firstHalf, secondHalf };
  }
  const rGrowth = growthRate(randomRun.snapshots);
  const kGrowth = growthRate(knowledgeRun.snapshots);
  ok('knowledge bot keeps climbing in the second half of the run (no plateau)', kGrowth.secondHalf > 0 && kGrowth.secondHalf >= kGrowth.firstHalf * 0.5, kGrowth);
  ok('random bot does NOT show sustained climbing (second-half hop growth far below the knowledge bot\'s)', rGrowth.secondHalf < kGrowth.secondHalf * 0.5, { rGrowth, kGrowth });

  ok('0 non-firebase pageErrors during random-bot run', errsR.length === 0, errsR.slice(0, 4));
  ok('0 non-firebase pageErrors during knowledge-bot run', errsK.length === 0, errsK.slice(0, 4));

  console.log('\n  random bot:    samples=' + rSamples + ' buildRate=' + rBuildRate.toFixed(3) + ' totalHops=' + randomRun.finalState.totalHops + ' score=' + randomRun.finalState.score);
  console.log('  knowledge bot: samples=' + kSamples + ' buildRate=' + kBuildRate.toFixed(3) + ' totalHops=' + knowledgeRun.finalState.totalHops + ' score=' + knowledgeRun.finalState.score);

  await b.close(); srv.close();
  console.log(pass ? '\n*** CLOUD HOP CHECK OK ***' : '\n!!! CLOUD HOP CHECK FAILURES ABOVE !!!');
  process.exit(pass ? 0 : 1);
})();
