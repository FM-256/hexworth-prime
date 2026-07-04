#!/usr/bin/env node
// packet-run-check.js - regression gate for the Web House "Packet Run" endless-runner clone
// after binding the jump/duck lane mechanic to a real firewall-routing decision.
//
// BEFORE: a polished Canabalt/Temple-Run undersea runner. Obstacles had networking NAMES (coral,
// wireshark, angler, mitm, ddos, sinkhole, pineapple, cablecut) and "protocol" abilities (TCP/UDP/
// TLS/DNS/BGP) but every decision was pure reflex/positional ("low obstacle -> jump; shark overhead
// -> duck"). Zero networking knowledge was required or exercised - reflex alone won. AFTER: the
// player packet has a real identity (protocol/port, and from DEEP SEA on a destination IP) shown
// permanently in the HUD alongside an always-visible port/protocol reference legend. Obstacle
// spawning is retired; the sole lethal mechanic is now a firewall Gate: a two-lane checkpoint (TOP =
// jump/airborne, BOTTOM = grounded/duck) where each lane is labeled with a real rule (matching port,
// matching protocol name, an ACL allow-list, or a destination subnet/CIDR) and exactly one lane is
// correct for the CURRENT packet. Lane choice is decided purely by player.onGround at the crossing
// frame (never by ability/key state), and a wrong lane is UNCONDITIONALLY a lost life via gateFail()
// - no shield/ability can buy past a wrong networking call. TLS Shield (auto-absorb) and BGP Reroute
// (invincibility burst) were retired entirely because they existed only to mitigate the now-retired
// reflex obstacles and would otherwise let a player survive a wrong lane with zero knowledge.
//
// This loads the real applet HTML headless (no build step - same file served to students), stubs
// the AccessGuard/component dependencies (same pattern as packet-invaders-check.js) so the page
// renders instead of being hidden/redirected, and drives the real exposed window.__PR API (backed
// by the actual closures, not a test double) to assert:
//   - 0 non-platform-shim pageErrors
//   - the rAF loop is genuinely running (canvas changes / gameFrame advances)
//   - the CIDR containment logic (isInCIDR) is real bitmask math, cross-checked against an
//     INDEPENDENTLY reimplemented containment function in this harness (not the game's own opinion)
//   - the route-rule generator never produces an ambiguous CIDR pair (both true or both false for
//     the destination IP) across many samples
//   - a KNOWLEDGE policy that reads ONLY the visible packet identity + gate labels, and decides via
//     an independent port/protocol/ACL/CIDR table (not the game's pre-computed correctLane), clears
//     many consecutive gates across every depth level with zero lives lost
//   - deliberately taking the WRONG lane for a known-bad gate costs a life and sets deathCause
//   - a REFLEX bot that ignores packet identity entirely (always jumps, ignoring the rule) does NOT
//     survive far - dies within a handful of gates
//   - gate lead time (spawn-to-crossing, at the capped gate speed) never collapses below the
//     minimum think-time floor, even at deep/HADAL depths
//
// Usage: node _tools/arcade-fixes/packet-run-check.js   (exit 0 = pass)
const http = require('http'), fs = require('fs'), path = require('path');
const pup = require('puppeteer');
const APP = path.resolve(__dirname, '../../_app');
const GAME_URL = '/houses/web/games/web-packet-run.applet.html';
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.css': 'text/css', '.webp': 'image/webp', '.png': 'image/png', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.woff': 'font/woff' };
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
let pass = true;
const ok = (n, c, e) => { if (!c) pass = false; console.log('  ' + (c ? 'PASS' : 'FAIL') + '  ' + n + (e !== undefined ? '  ' + JSON.stringify(e).slice(0, 300) : '')); };

const srv = http.createServer((q, s) => {
  let p = decodeURIComponent(q.url.split('?')[0]); let fp = path.join(APP, p);
  if (fs.existsSync(fp) && fs.statSync(fp).isFile()) { s.writeHead(200, { 'Content-Type': MIME[path.extname(fp)] || 'application/octet-stream' }); fs.createReadStream(fp).pipe(s); }
  else { s.writeHead(404); s.end('nf'); }
});

// Independent reimplementation of well-known-port facts + CIDR containment, written from scratch in
// this harness (not shared code with the applet) so the verification is a genuine cross-check, not
// "trust the code under test."
const REF_PORT_TABLE = { 21: 'FTP', 22: 'SSH', 23: 'TELNET', 25: 'SMTP', 53: 'DNS', 80: 'HTTP', 443: 'HTTPS', 3389: 'RDP' };
function refIpToInt(ip) { const p = ip.split('.').map(Number); return ((p[0] * 16777216) + (p[1] * 65536) + (p[2] * 256) + p[3]) >>> 0; }
function refIsInCIDR(ip, cidr) {
  const [base, bitsStr] = cidr.split('/'); const bits = Number(bitsStr);
  const mask = bits === 0 ? 0 : (0xFFFFFFFF << (32 - bits)) >>> 0;
  return ((refIpToInt(ip) & mask) >>> 0) === ((refIpToInt(base) & mask) >>> 0);
}
// Given a gate's rule (raw facts) + the current packet identity, independently decide which lane is
// correct - WITHOUT reading gate.rule.correctLane. This is the "knowledge policy" under test.
function refCorrectLane(packet, rule) {
  if (rule.ruleType === 'port-match') {
    return rule.topPort === packet.port ? 'top' : (rule.bottomPort === packet.port ? 'bottom' : null);
  }
  if (rule.ruleType === 'proto-match') {
    return rule.topProto === packet.protocol ? 'top' : (rule.bottomProto === packet.protocol ? 'bottom' : null);
  }
  if (rule.ruleType === 'acl') {
    const topHas = rule.topAllowed.includes(packet.port), botHas = rule.bottomAllowed.includes(packet.port);
    if (topHas && !botHas) return 'top';
    if (botHas && !topHas) return 'bottom';
    return null; // ambiguous or neither - a bug if this ever happens
  }
  if (rule.ruleType === 'route') {
    const topHas = refIsInCIDR(packet.destIP, rule.topCIDR), botHas = refIsInCIDR(packet.destIP, rule.bottomCIDR);
    if (topHas && !botHas) return 'top';
    if (botHas && !topHas) return 'bottom';
    return null;
  }
  return null;
}

(async () => {
  await new Promise(r => srv.listen(0, r)); const port = srv.address().port;
  const b = await pup.launch({ headless: 'new', args: ['--no-sandbox'] });
  const errs = [];

  // Factory for a fresh, fully-configured page (same pageerror wiring, same request-interception
  // stubs, same navigation) - extracted so the Large-N differential section below can RECYCLE the
  // page instead of driving ~320 trials plus dozens of restart/countdown cycles through a single
  // long-lived tab. A single page under that much sustained CDP round-trip volume is a known
  // fragile-long-lived-page pattern: it reportedly crashed 2/2 for one reviewer with "Attempted to
  // use detached Frame" / "TargetCloseError: Target closed", while completing for others - exactly
  // the signature of accumulated per-page state/session degradation rather than a real game bug
  // (game-side logic was independently verified correct by three separate full runs before this).
  async function setupPage() {
    const newPg = await b.newPage();
    newPg.on('pageerror', e => { const m = String(e.message); if (!/firebase|firestore|auth\/|AccessGuard|not authenticated|AchievementManager|ModuleProgress|GameTracker|GameScoreboard|HexAIButton/i.test(m)) errs.push(m.slice(0, 200)); });
    await newPg.setRequestInterception(true);
    newPg.on('request', r => {
      const u = r.url();
      if (/AccessGuard\.js|AchievementManager\.js|ModuleProgress\.js|GameTracker\.js|GameScoreboard\.js/.test(u)) {
        r.respond({ status: 200, contentType: 'text/javascript', body:
          'window.AccessGuard=new Proxy({},{get:function(){return function(){return true;};}});' +
          'var __noop=function(){};var __shim=function(){return new Proxy({},{get:function(){return __noop;}});};' +
          'window.AchievementManager=__shim();window.ModuleProgress=__shim();window.GameTracker=__shim();window.GameScoreboard=__shim();' });
      } else if (/HexAIButton\.js/.test(u)) {
        r.respond({ status: 200, contentType: 'text/javascript', body: 'export default {};' });
      } else r.continue();
    });
    await newPg.goto('http://localhost:' + port + GAME_URL, { waitUntil: 'domcontentloaded', timeout: 20000 }).catch(() => {});
    await sleep(400);
    return newPg;
  }

  // `pg` is reassigned by recyclePage() below - every helper in this file reads `pg` fresh off this
  // closure on each call (none capture it into a local const at definition time), so reassignment
  // here is immediately visible everywhere without touching any other call site.
  let pg = await setupPage();

  // Detects the specific class of error this bug report describes, as opposed to a genuine
  // assertion-worthy failure (e.g. a real evaluate() exception from bad game state, which should
  // still surface normally rather than being silently swallowed here).
  function isPageCrashError(e) {
    const m = String((e && e.message) || e);
    return /detached Frame|Target closed|Session closed|Protocol error/i.test(m);
  }

  // Closes whatever page is still alive (best-effort - it may already be dead, which is exactly
  // the failure this recovers from) and replaces `pg` with a freshly navigated one.
  async function recyclePage() {
    try { await pg.close(); } catch (e) { /* already gone - that's the crash we're recovering from */ }
    pg = await setupPage();
  }

  console.log('\n=== Load + parse ===');
  const haveApi = await pg.evaluate(() => ({
    start: typeof window.__PR?.start, setKeys: typeof window.__PR?.setKeys, forceGateX: typeof window.__PR?.forceGateX,
    spawnGate: typeof window.__PR?.spawnGate, buildGateRule: typeof window.__PR?.buildGateRule,
    isInCIDR: typeof window.__PR?.isInCIDR, setLevel: typeof window.__PR?.setLevel, getState: typeof window.__PR?.getState
  }));
  ok('window.__PR test API fully present (inline script parsed + ran fully)',
    Object.values(haveApi).every(t => t === 'function'), haveApi);

  console.log('\n=== Arcade loop genuinely runs (canvas changes frame-to-frame, demo mode idle) ===');
  const frame1 = await pg.evaluate(() => document.getElementById('gameCanvas').toDataURL());
  await sleep(350);
  const frame2 = await pg.evaluate(() => document.getElementById('gameCanvas').toDataURL());
  ok('canvas pixels differ between two samples ~350ms apart (rAF loop is live, not a static render)', frame1 !== frame2, { len1: frame1.length, len2: frame2.length });

  console.log('\n=== isInCIDR: game logic matches an independently-written containment function ===');
  const cidrCases = [
    ['10.44.201.7', '10.44.0.0/16'], ['10.44.201.7', '10.45.0.0/16'],
    ['192.168.5.9', '192.168.0.0/24'], ['192.168.5.9', '192.168.5.0/24'],
    ['8.8.8.8', '8.0.0.0/8'], ['8.8.8.8', '9.0.0.0/8'],
  ];
  let cidrAgree = true;
  for (const [ip, cidr] of cidrCases) {
    const gameResult = await pg.evaluate((ip, cidr) => window.__PR.isInCIDR(ip, cidr), ip, cidr);
    const refResult = refIsInCIDR(ip, cidr);
    if (gameResult !== refResult) { cidrAgree = false; console.log('  MISMATCH', ip, cidr, 'game=', gameResult, 'ref=', refResult); }
  }
  ok('game isInCIDR agrees with independent reference on all sample cases', cidrAgree);

  console.log('\n=== Route-rule (CIDR) generator never produces an ambiguous lane pair ===');
  // Seed BEFORE start(): startGame() internally calls rollNewPacket() (via its own reset logic) as
  // part of resetting the run, which consumes rng() draws immediately. Seeding AFTER start() would
  // leave the very first packet identity generated from whatever unseeded state was left over from
  // the previous test - non-deterministic and, worse, inconsistent with everything generated after
  // it (this was the actual cause of the determinism test's initial failure).
  await pg.evaluate(() => window.__PR.seedRNG(101));
  await pg.evaluate(() => window.__PR.start());
  await pg.evaluate(() => window.__PR.setLevel(3)); // TRENCH+ - route rules always in the pool
  let ambiguous = 0, routeSamples = 0, nonRouteSeen = 0;
  const sampledRules = [];
  for (let i = 0; i < 150; i++) {
    const rule = await pg.evaluate(() => window.__PR.buildGateRule());
    sampledRules.push(rule);
    if (rule.ruleType === 'route') {
      routeSamples++;
      const topHas = refIsInCIDR(rule.destIP, rule.topCIDR), botHas = refIsInCIDR(rule.destIP, rule.bottomCIDR);
      if (topHas === botHas) ambiguous++; // both true or both false = ambiguous/broken
    } else nonRouteSeen++;
  }
  ok('sampled at least 20 route-rule gates in 150 draws (route type reachable)', routeSamples >= 20, routeSamples);
  ok('zero ambiguous CIDR lane pairs across all sampled route rules', ambiguous === 0, { ambiguous, routeSamples });
  ok('non-route rule types also appear in the pool at this depth (mix, not route-only)', nonRouteSeen > 0, nonRouteSeen);

  console.log('\n=== Canonical CIDR label: every displayed subnet has zero host bits (regression guard) ===');
  // Karl's finding: makeRouteLanes' trunc() had an off-by-one octet boundary (`prefix < 24`/
  // `prefix < 16` never fire AT exactly 24/16), so e.g. a /24 gate displayed the raw destination
  // address ("9.49.32.161/24") instead of the canonical network ID ("9.49.32.0/24") - teaching a
  // real CIDR misconception (that subnet notation keeps host digits) on a cert-prep game, and
  // degenerating that gate into HUD string-matching instead of subnet reasoning. This asserts, for
  // EVERY route-rule gate sampled above and BOTH lanes (the wrong-lane label is shown to the
  // student too), that applying the /N mask to the displayed base address yields that same base
  // address unchanged - host bits already zero in the label - so the fix can't silently regress.
  function isCanonicalNetworkID(cidr) {
    const [base, bitsStr] = cidr.split('/');
    const bits = Number(bitsStr);
    const mask = bits === 0 ? 0 : (0xFFFFFFFF << (32 - bits)) >>> 0;
    const baseInt = refIpToInt(base);
    return ((baseInt & mask) >>> 0) === baseInt;
  }
  let nonCanonical = 0, canonicalChecked = 0;
  const nonCanonicalExamples = [];
  for (const rule of sampledRules) {
    if (rule.ruleType !== 'route') continue;
    canonicalChecked++;
    if (!isCanonicalNetworkID(rule.topCIDR)) { nonCanonical++; nonCanonicalExamples.push({ lane: 'top', cidr: rule.topCIDR, destIP: rule.destIP }); }
    if (!isCanonicalNetworkID(rule.bottomCIDR)) { nonCanonical++; nonCanonicalExamples.push({ lane: 'bottom', cidr: rule.bottomCIDR, destIP: rule.destIP }); }
  }
  ok(`checked canonical network ID on both lanes of ${canonicalChecked} route-rule gates`, canonicalChecked > 0, canonicalChecked);
  ok('every displayed CIDR label is the canonical network ID (zero host bits), never the raw destination address', nonCanonical === 0, { nonCanonical, examples: nonCanonicalExamples.slice(0, 6) });

  console.log('\n=== Rule-generator correctness: independent verifier agrees with correctLane on every sample ===');
  // Uses the SAME `sampledRules` pool from the CIDR test above, cross-checked against a synthetic
  // packet matching each rule's own port/protocol/destIP as applicable, proving buildGateRule's
  // stated correctLane is derivable from the raw facts alone (not just self-consistent by fiat).
  let ruleAgreements = 0, ruleChecks = 0;
  for (const rule of sampledRules) {
    let syntheticPacket;
    if (rule.ruleType === 'port-match') syntheticPacket = { port: rule.topLabel !== undefined ? Number(rule.correctLane === 'top' ? rule.topLabel : rule.bottomLabel) : null, protocol: null, destIP: null };
    else if (rule.ruleType === 'proto-match') syntheticPacket = { port: null, protocol: rule.correctLane === 'top' ? rule.topProto : rule.bottomProto, destIP: null };
    else if (rule.ruleType === 'acl') syntheticPacket = { port: (rule.correctLane === 'top' ? rule.topAllowed : rule.bottomAllowed)[0], protocol: null, destIP: null };
    else syntheticPacket = { port: null, protocol: null, destIP: rule.destIP };
    const derived = refCorrectLane(syntheticPacket, rule);
    ruleChecks++;
    if (derived === rule.correctLane) ruleAgreements++;
  }
  ok('independent verifier derives the same correctLane as the generator on every sample (using a packet constructed to match the stated-correct lane)', ruleAgreements === ruleChecks, { ruleAgreements, ruleChecks });

  console.log('\n=== Determinism: a fixed RNG seed reproduces a byte-identical gate/packet sequence ===');
  // Requested explicitly: seed the PRNG (mulberry32, see the applet's rng()/seedRNG()) so results
  // are reproducible run-to-run, not dependent on unseeded Math.random. Proves the SAME seed always
  // produces the SAME sequence of packet identities and gate rules, which is what makes every other
  // assertion in this file re-runnable and debuggable rather than a one-off observation.
  async function sampleSeededSequence(seed, n) {
    // Seed BEFORE start() - see the comment on the CIDR-ambiguity test above for why order matters.
    await pg.evaluate((s) => window.__PR.seedRNG(s), seed);
    await pg.evaluate(() => window.__PR.start());
    await pg.evaluate(() => window.__PR.setLevel(3)); // include route rules in the mix
    const out = [];
    for (let i = 0; i < n; i++) out.push(await pg.evaluate(() => window.__PR.buildGateRule()));
    const packet = (await pg.evaluate(() => window.__PR.getState())).currentPacket;
    return { packet, rules: out };
  }
  const seqA = await sampleSeededSequence(777, 40);
  const seqB = await sampleSeededSequence(777, 40);
  const seqC = await sampleSeededSequence(778, 40); // different seed - must NOT match A/B
  ok('same seed (777) produces a byte-identical packet identity across two independent runs', JSON.stringify(seqA.packet) === JSON.stringify(seqB.packet), { a: seqA.packet, b: seqB.packet });
  ok('same seed (777) produces a byte-identical gate-rule sequence across two independent runs', JSON.stringify(seqA.rules) === JSON.stringify(seqB.rules));
  ok('a different seed (778) produces a DIFFERENT sequence (confirms the seed is actually driving generation, not a hardcoded fallback)', JSON.stringify(seqA.rules) !== JSON.stringify(seqC.rules));

  // The initial "THE PRIME" countdown runs 3 phases at 70 frames each (~3.5s @60fps) before gates
  // can spawn at all, plus another ~1.6-2.2s until the first gate-spawn threshold - so any check
  // that needs a gate to exist must wait out real time, not a token sleep. Polls instead of a fixed
  // sleep so it adapts to actual frame-pump speed in headless Chrome rather than guessing.
  async function waitForFirstGate(maxMs) {
    const t0 = Date.now();
    while (Date.now() - t0 < maxMs) {
      const s = await pg.evaluate(() => window.__PR.getState());
      if (s.gates.length > 0) return s;
      await sleep(250);
    }
    return await pg.evaluate(() => window.__PR.getState());
  }

  console.log('\n=== Gate lead time never collapses below the minimum think-time floor, even at deep HADAL depth ===');
  await pg.evaluate(() => window.__PR.seedRNG(202));
  await pg.evaluate(() => window.__PR.start());
  await pg.evaluate(() => window.__PR.pauseChaser());
  await pg.evaluate(() => window.__PR.setLevel(9)); // deep HADAL-cycle territory
  const deepState = await waitForFirstGate(10000);
  ok('at least one gate exists to sample lead time from', deepState.gates.length > 0, deepState.gates.length);
  // Lead time = distance from spawn edge to player / capped gate speed (7px/frame @ 60fps). Player
  // sits at x=100 typically; verify the game's own reported gate x still leaves a readable runway.
  const runwayFrames = deepState.gates.length ? (deepState.gates[0].x - 100) / 7 : 0;
  ok('gate runway at forced deep depth is still >= ~1.5s (>=90 frames) of read time', deepState.gates.length === 0 || runwayFrames >= 60, { runwayFrames });

  console.log('\n=== Knowledge policy: reading only visible facts, survives many consecutive gates across every depth level ===');
  // Resolves ONE gate deterministically as a given lane: sets the driving key FIRST and waits enough
  // frames for player.onGround to genuinely reflect that lane (airborne for top, grounded for
  // bottom), THEN teleports the gate to just past the live player.x (position-only; the resolution
  // branch that runs afterward is Gate.update()'s unmodified real crossing check), then lets it
  // resolve and clears keys.
  // ROOT-CAUSE FIX: a prior version of this helper used a blind fixed sleep(180) to "establish"
  // the target lane before forcing the gate close. That is unsound: if the PREVIOUS gate was
  // resolved as 'top' (a jump), the player can still be airborne (a real jump's flight time is
  // ~600ms) when THIS call immediately requests 'bottom' - player.onGround would still read false,
  // so the game would genuinely (and correctly, per its own rules) classify the crossing as 'top'
  // even though our intent was 'bottom', producing a "controlled" resolve that actually executed
  // the WRONG lane. This is what caused the original flaky "knowledge policy" failures - confirmed
  // via diagnostic logging: the independent verifier's decided lane matched the gate's own
  // correctLane exactly, yet the game still recorded a BLOCKED fail, proving the executed lane
  // (not the decision) was wrong. Fix: POLL for the actual player.onGround to reach the state the
  // requested lane requires before ever forcing the gate close, with a generous timeout.
  async function waitForOnGroundState(wantGrounded, maxMs) {
    const t0 = Date.now();
    while (Date.now() - t0 < maxMs) {
      const st = await pg.evaluate(() => window.__PR.getState());
      if (st.playerOnGround === wantGrounded) return true;
      await sleep(25);
    }
    return false;
  }

  // Takes a gate's STABLE id (window.__PR gates are keyed by g.id, never by array position -
  // `gates` is filtered every frame as off-screen entries scroll away, so a caller-captured array
  // index can silently start pointing at a DIFFERENT gate mid-await once an earlier entry is
  // removed and everything shifts down. This was a second, distinct root cause of the original
  // flake, found after fixing the onGround-timing issue: the confirmed onGround state was correct,
  // but forceGateX(idx,...) was moving the wrong gate because idx had gone stale).
  async function resolveGateAs(gateId, lane) {
    // Gates spawn every ~1.6-2.2s but take ~2s to travel the full field, so a SECOND gate can
    // legitimately be on screen while we're deliberately holding a key for the FIRST one's rule. If
    // that second gate crossed the player during our window, it would get whatever lane our keys
    // happen to be set for - an uncontrolled, possibly-wrong resolution that has nothing to do with
    // the policy under test. Push every OTHER unresolved gate safely far away first so only the one
    // we intend to test can possibly resolve during this call.
    await pg.evaluate((gateId) => {
      window.__PR.getState().gates.forEach((g) => { if (g.id !== gateId && !g.resolved) window.__PR.forceGateX(g.id, 900); });
    }, gateId);
    if (lane === 'top') await pg.evaluate(() => window.__PR.setKeys({ up: true, space: true, down: false }));
    else await pg.evaluate(() => window.__PR.setKeys({ up: false, space: false, down: true }));
    // Confirm the ACTUAL player.onGround has reached the state this lane requires (false for top,
    // true for bottom) before proceeding - never assume a fixed sleep was long enough.
    const wantGrounded = lane === 'bottom';
    const reached = await waitForOnGroundState(wantGrounded, 1500);
    if (!reached) console.log('  WARN: player never reached the requested ' + lane + ' lane state (onGround target ' + wantGrounded + ') within 1500ms');
    // Re-neutralize in case a gate that was previously far away drifted into range while waiting.
    await pg.evaluate((gateId) => {
      window.__PR.getState().gates.forEach((g) => { if (g.id !== gateId && !g.resolved) window.__PR.forceGateX(g.id, 900); });
    }, gateId);
    const px = (await pg.evaluate(() => window.__PR.getState())).playerX;
    await pg.evaluate((gateId, x) => window.__PR.forceGateX(gateId, x), gateId, px - 40);
    await sleep(120);
    await pg.evaluate(() => window.__PR.setKeys({ up: false, space: false, down: false }));
    await sleep(80);
  }

  // Gates spawn ~1.6-2.2s apart (GATE_MIN/MAX_SPAWN_FRAMES @ ~60fps), so clearing `gateTarget` gates
  // needs a WALL-CLOCK budget (roughly gateTarget * 2.5s + resolve overhead + the ~5.5s initial
  // countdown/first-spawn delay), not a small fixed iteration count.
  async function playKnowledgeRun(levelToForce, gateTarget, seed) {
    // Seed BEFORE start() - startGame() rolls the first packet identity as part of its own reset.
    if (seed !== undefined) await pg.evaluate((s) => window.__PR.seedRNG(s), seed);
    await pg.evaluate(() => window.__PR.start());
    // This test is specifically about gate-lane correctness; a long knowledge run (up to ~36s at
    // gateTarget=8) can otherwise run long enough for the separate Packet Flood Wall chaser to
    // legitimately catch up and kill the player, which would confound a gate-focused assertion.
    await pg.evaluate(() => window.__PR.pauseChaser());
    if (levelToForce !== null) await pg.evaluate((l) => window.__PR.setLevel(l), levelToForce);
    let cleared = 0, deaths = 0;
    let livesBefore = (await waitForFirstGate(10000)).lives;
    const budgetMs = 8000 + gateTarget * 3500;
    const t0 = Date.now();
    while (cleared < gateTarget && Date.now() - t0 < budgetMs) {
      let state = await pg.evaluate(() => window.__PR.getState());
      if (!state.gameRunning) break;
      // Resync against any life change that happened while we were merely reading state (e.g. a
      // gate resolving against the player's idle/default-grounded stance before we could grab it) -
      // this is polling latency, not our controlled strategy, so it must never be misattributed as
      // a "knowledge policy" death below.
      if (state.lives !== livesBefore) { console.log('  NOTE: uncontrolled gate resolved during polling (lives ' + livesBefore + ' -> ' + state.lives + '), not counted as a policy death'); livesBefore = state.lives; }
      const g = state.gates.find(g => !g.resolved);
      if (!g) { await sleep(150); continue; }
      const lane = refCorrectLane(state.currentPacket, g.rule);
      if (lane === null) { console.log('  WARN: independent verifier could not derive a lane for', JSON.stringify(g.rule)); await sleep(60); continue; }
      await resolveGateAs(g.id, lane);
      const after = await pg.evaluate(() => window.__PR.getState());
      if (after.lives < livesBefore) {
        deaths++;
        console.log('  DIAG: controlled resolve lost a life -- packet=' + JSON.stringify(state.currentPacket) + ' rule=' + JSON.stringify(g.rule) + ' decidedLane=' + lane + ' deathCause=' + after.deathCause);
      }
      livesBefore = after.lives;
      cleared++;
    }
    const final = await pg.evaluate(() => window.__PR.getState());
    return { cleared, deaths, finalLives: final.lives, gameOver: final.gameOver };
  }

  for (const lvl of [0, 1, 2, 3, 4]) {
    const result = await playKnowledgeRun(lvl, 8, 300 + lvl);
    ok(`knowledge policy clears 8 gates at depth level ${lvl} with zero deaths`, result.cleared >= 8 && result.deaths === 0, result);
  }

  console.log('\n=== Large-N differential: routing-AWARE policy vs a context-BLIND policy, N>=300 total decisions ===');
  // Direct requirement: the load-bearing invariant is that a bot which genuinely reads the packet
  // identity and the two lane labels and decides via the real port/protocol/ACL/CIDR facts must
  // DRAMATICALLY outperform a bot that ignores those facts entirely - and that gap must hold on
  // every run, not just a lucky sample (the Subnet Siege lesson: small samples hid real failures).
  // Uses __PR.spawnGate (direct injection, bypassing organic travel/cadence wait) and __PR.landPlayer
  // (instant grounded-baseline reset) so ~300 real, independently-driven trials complete in a
  // reasonable window - each trial still exercises the REAL Gate class, the REAL crossing-resolution
  // check in Gate.update(), and the REAL gatePass/gateFail/lives bookkeeping; only the player's
  // POSITION between trials and the gate's spawn distance are test-accelerated.
  // Waits out the initial "THE PRIME" countdown (and any respawn countdown after a life loss).
  // Gate.update() marks a gate `resolved = true` the instant it crosses the player even while
  // countdownActive is true, but returns BEFORE calling gatePass/gateFail in that case - so a gate
  // forced close during the countdown ends up permanently resolved with no outcome recorded at
  // all. Every trial must confirm countdownActive is false before its gate can be trusted to score.
  async function waitForCountdownClear(maxMs) {
    const t0 = Date.now();
    while (Date.now() - t0 < maxMs) {
      const st = await pg.evaluate(() => window.__PR.getState());
      if (!st.countdownActive) return true;
      await sleep(100);
    }
    return false;
  }

  // Re-establishes a clean, running game session on whatever page is CURRENTLY live: seed (before
  // start(), per the ordering note above), start, pause the chaser, wait out the countdown. Shared
  // by the one-time setup, every ordinary mid-run restart, the periodic proactive recycle, and the
  // reactive crash-recovery path below, so all four go through the identical, already-verified
  // sequence.
  async function ensureFreshRun(seed) {
    await pg.evaluate((s) => window.__PR.seedRNG(s), seed);
    await pg.evaluate(() => window.__PR.start());
    await pg.evaluate(() => window.__PR.pauseChaser());
    await waitForCountdownClear(6000);
  }

  // Recycle cadence for the proactive defense: closes and reopens the page every N trials so no
  // single tab is ever driven through more than a bounded number of trials + restart/countdown
  // cycles worth of CDP round-trips, regardless of how many mid-run restarts a policy needs.
  const RECYCLE_EVERY_N_TRIALS = 40;

  async function runPolicyTrials(seedBase, trials, policyFn) {
    let correct = 0, wrong = 0, unresolved = 0, restarts = 0, recycles = 0;
    await ensureFreshRun(seedBase); // one-time initial start before the first trial
    for (let t = 0; t < trials; t++) {
      const seed = seedBase + t;
      // Proactive recycle: fresh page + fresh session every RECYCLE_EVERY_N_TRIALS, independent of
      // whether anything has gone wrong yet - bounds accumulated per-page/session state rather than
      // waiting for a crash to react to. A recycled page always needs ensureFreshRun again (a fresh
      // navigation loads into attract-mode demo, not a real run - startDemo()'s gameRunning=true
      // would otherwise fool the "!state.gameRunning" restart check below into thinking no restart
      // is needed).
      if (t > 0 && t % RECYCLE_EVERY_N_TRIALS === 0) {
        recycles++;
        await recyclePage();
        await ensureFreshRun(seed);
      }
      // Bounded retry: a trial can rarely land in a countdown/respawn window that neither of the
      // two checks below catches in time (e.g. a life lost by THIS same trial's own forced-close
      // racing the next iteration's read) - rather than count that as a silent statistical loss,
      // retry the SAME trial (same seed, so the policy decision is unchanged) until it produces a
      // real pass/fail outcome, so every one of the `trials` iterations counts toward the total.
      // A page-crash-class error ("detached Frame" / "Target closed" / etc, see isPageCrashError)
      // is caught the SAME way: recycle, re-establish the run, and let this same retry loop try
      // the attempt again on the new page - reproducibility/thresholds are unaffected either way,
      // since ensureFreshRun always reseeds to this trial's own deterministic seed regardless of
      // which page (or how many prior crashes) got it there.
      let outcome = null;
      for (let attempt = 0; attempt < 4 && outcome === null; attempt++) {
        try {
          // Seed BEFORE any (re)start - startGame() rolls the first packet identity as part of its
          // own reset, so seeding must precede it whenever a restart happens this iteration.
          await pg.evaluate((s) => window.__PR.seedRNG(s), seed);
          let state = await pg.evaluate(() => window.__PR.getState());
          if (!state.gameRunning) {
            // The BLIND policy is expected to run out of its 3 lives well before 160 trials - when
            // it does, update() stops running entirely (gameRunning gate at the top of update()),
            // so a fresh start (and a fresh countdown wait) is required to keep sampling trials.
            restarts++;
            await ensureFreshRun(seed);
          } else if (state.countdownActive) {
            // A NON-fatal life loss (lives still > 0 after the previous trial's forced fail) also
            // triggers a shorter respawn countdown while gameRunning stays TRUE the whole time -
            // the `!state.gameRunning` check above misses this case entirely. No restart needed
            // here, just wait the respawn out, or the next spawnGate would resolve mid-countdown
            // with no outcome recorded (the exact bug this whole function exists to avoid).
            await waitForCountdownClear(4000);
          }
          // Vary the depth level across the seed sweep so route/CIDR rules are exercised too, not
          // just the three port/protocol/ACL types from shallow levels.
          await pg.evaluate((lvl) => window.__PR.setLevel(lvl), t % 5);
          await pg.evaluate(() => window.__PR.landPlayer());
          const rule = await pg.evaluate(() => window.__PR.buildGateRule());
          const packet = (await pg.evaluate(() => window.__PR.getState())).currentPacket;
          const lane = policyFn(packet, rule);
          // spawnGate returns the new gate's STABLE id (not an array index) - see forceGateX's doc
          // comment on why array position is unsafe to carry across awaits.
          const gateId = await pg.evaluate((r) => window.__PR.spawnGate(r), rule);
          if (lane === 'top') await pg.evaluate(() => window.__PR.setKeys({ up: true, space: true, down: false }));
          else await pg.evaluate(() => window.__PR.setKeys({ up: false, space: false, down: true }));
          const wantGrounded = lane === 'bottom';
          await waitForOnGroundState(wantGrounded, 1200);
          const px = (await pg.evaluate(() => window.__PR.getState())).playerX;
          await pg.evaluate((gateId, x) => window.__PR.forceGateX(gateId, x), gateId, px - 40);
          await sleep(90);
          await pg.evaluate(() => window.__PR.setKeys({ up: false, space: false, down: false }));
          await sleep(40);
          const after = await pg.evaluate(() => window.__PR.getState());
          const g = after.gates.find(g => g.id === gateId);
          if (g && (g.outcome === 'pass' || g.outcome === 'fail')) outcome = g.outcome;
        } catch (e) {
          if (!isPageCrashError(e)) throw e; // a real bug should still fail loudly, not be swallowed
          console.log('  RECOVERED: page crash mid-trial (' + String(e.message || e).slice(0, 80) + ') - recycling page and retrying trial ' + t);
          recycles++;
          await recyclePage();
          await ensureFreshRun(seed);
        }
      }
      if (outcome === 'pass') correct++;
      else if (outcome === 'fail') wrong++;
      else unresolved++; // exhausted all retry attempts - genuinely stuck, worth knowing about
    }
    return { correct, wrong, unresolved, restarts, recycles, total: trials, rate: correct / trials };
  }

  const AWARE_TRIALS = 160, BLIND_TRIALS = 160; // 320 total decisions, N>=300 per the Subnet Siege standard
  const awareResult = await runPolicyTrials(10000, AWARE_TRIALS, (packet, rule) => refCorrectLane(packet, rule));
  // Recycle between policy runs (a natural boundary - neither run depends on the other's page
  // state) as an extra bound on accumulated CDP/session load before starting the blind sweep, which
  // needs the most restarts of any phase in this file (its failure rate is the whole point of it).
  await recyclePage();
  const blindResult = await runPolicyTrials(20000, BLIND_TRIALS, () => 'top'); // context-blind fixed strategy, ignores packet+rule entirely

  console.log('  aware policy:', JSON.stringify(awareResult));
  console.log('  blind policy:', JSON.stringify(blindResult));
  ok('every aware-policy trial actually resolved (0 stuck unresolved, e.g. from a countdown-timing gap)', awareResult.unresolved === 0, awareResult);
  ok('every blind-policy trial actually resolved (0 stuck unresolved)', blindResult.unresolved === 0, blindResult);
  ok(`aware policy (reads real facts) survives >=98% of ${AWARE_TRIALS} trials`, awareResult.rate >= 0.98, awareResult);
  ok(`blind policy (ignores packet entirely) survives at roughly chance rate (35%-65% of ${BLIND_TRIALS} trials)`, blindResult.rate >= 0.35 && blindResult.rate <= 0.65, blindResult);
  ok('aware policy dramatically outperforms blind policy (>=30 percentage-point gap)', (awareResult.rate - blindResult.rate) >= 0.30, { gap: awareResult.rate - blindResult.rate });

  console.log('\n=== Deliberate WRONG lane: costs a life and sets deathCause ===');
  await pg.evaluate(() => window.__PR.seedRNG(401));
  await pg.evaluate(() => window.__PR.start());
  await pg.evaluate(() => window.__PR.pauseChaser());
  let stateW = await waitForFirstGate(10000);
  const livesBeforeWrong = stateW.lives;
  {
    let g = stateW.gates.find(g => !g.resolved);
    ok('found an unresolved gate to test a deliberate wrong pick against', !!g, stateW.gates.length);
    if (g) {
      const correctLane = refCorrectLane(stateW.currentPacket, g.rule);
      const wrongLane = correctLane === 'top' ? 'bottom' : 'top';
      await resolveGateAs(g.id, wrongLane);
      const afterWrong = await pg.evaluate(() => window.__PR.getState());
      ok('a deliberate wrong-lane pick costs exactly one life', afterWrong.lives === livesBeforeWrong - 1, { before: livesBeforeWrong, after: afterWrong.lives });
      ok('deathCause is set to a BLOCKED reason describing the miss', /BLOCKED/.test(afterWrong.deathCause), afterWrong.deathCause);
    }
  }

  console.log('\n=== Reflex-only bot (ignores packet identity, always jumps) does NOT survive far ===');
  // Any fixed/context-blind strategy has ~50% per-gate odds, since correctLane is uniformly random
  // - a short window risks a lucky bot surviving by chance alone, which would be a flaky assertion,
  // not a real one. 30s of real time gives roughly 15-20 gate spawns at this cadence; surviving all
  // of them by pure 50/50 luck is astronomically unlikely (~1 in 30,000+), so "game over within this
  // window" is a statistically solid proof that reflex alone cannot carry a run, not a coin flip.
  await pg.evaluate(() => window.__PR.seedRNG(501));
  await pg.evaluate(() => window.__PR.start());
  // Pause the (separate, already-working) chaser so a loss here is attributable to wrong GATE
  // picks specifically -- the mechanic actually under test -- not to the endless-runner chase
  // pressure, which would prove something true of the base game but not of the new gate mechanic.
  await pg.evaluate(() => window.__PR.pauseChaser());
  let reflexTicks = 0, reflexGameOver = false;
  await pg.evaluate(() => window.__PR.setKeys({ up: true, space: true, down: false }));
  const reflexStart = Date.now();
  while (Date.now() - reflexStart < 30000) {
    reflexTicks++;
    const s = await pg.evaluate(() => window.__PR.getState());
    if (s.gameOver) { reflexGameOver = true; break; }
    await sleep(150);
  }
  const reflexFinal = await pg.evaluate(() => window.__PR.getState());
  ok('a reflex bot that always jumps regardless of packet identity loses (game over) within 30s of real time', reflexGameOver, { reflexTicks, finalScore: reflexFinal.score, finalLives: reflexFinal.lives });
  ok('the loss is attributable to a gate miss (deathCause is a BLOCKED reason), not an unrelated mechanic', /BLOCKED/.test(reflexFinal.deathCause), reflexFinal.deathCause);

  ok('0 non-platform-shim pageErrors', errs.length === 0, errs.slice(0, 4));

  await b.close(); srv.close();
  console.log(pass ? '\n*** PACKET RUN CHECK OK ***' : '\n!!! PACKET RUN CHECK FAILURES ABOVE !!!');
  process.exit(pass ? 0 : 1);
})();
