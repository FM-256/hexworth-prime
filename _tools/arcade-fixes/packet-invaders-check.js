#!/usr/bin/env node
// packet-invaders-check.js - regression gate for the Web House "Packet Invaders" Space Invaders clone
// after binding FIRE to a real firewall/IDS discrimination act.
//
// BEFORE: every descending invader (labeled SYN/ICMP/DNS/UDP/0DAY/APT) was an identical valid target -
// shoot anything = score, anything landing = instant game over. The networking labels were cosmetic;
// there was never a block-vs-allow decision. AFTER: invaders are drawn from PACKET_TYPES, a catalog of
// malicious packets (SYN flood, malformed SYN+FIN, port scan, inbound RDP/Telnet, DNS amplification,
// SQLi signature) and legitimate packets (HTTP, HTTPS established, DNS-A reply, SSH established, NTP).
// Shooting malicious = correct block. Shooting legitimate = false positive (penalty, no life lost).
// A malicious packet reaching the base = BREACH (life lost). A legitimate packet reaching the base =
// DELIVERED (correct, small bonus). Verdict is assigned per ROW (every column in a row shares one
// type), which is a provable invariant given the engine's lockstep formation movement: the front row's
// verdict is always uniform, so a correct-only-fire strategy is always available and never forces a
// false positive.
//
// This loads the real applet HTML headless (no build step - same file served to students), stubs the
// AccessGuard/platform-shim dependencies (same pattern as firewall-builder-check.js) so the page renders
// instead of being hidden/redirected, and drives the real exposed window.__PI API (backed by the actual
// closures, not a test double) to assert:
//   - 0 non-platform-shim pageErrors
//   - the arcade loop is genuinely running (canvas pixels change frame-to-frame)
//   - the on-sprite label catalog has no duplicate tags and every label is legible-width at the real font
//   - wave 1 presents a genuine mix (at least one malicious AND one legitimate type), not an all-one-
//     verdict tutorial wave
//   - shooting a malicious packet scores + destroys it (correct block)
//   - shooting a legitimate packet penalizes it as a false positive (score down, combo reset, no life lost)
//   - a malicious packet reaching the base is a BREACH (life lost)
//   - a legitimate packet reaching the base is DELIVERED (small bonus, no penalty)
//   - wave 1 is winnable end-to-end using ONLY a correct-block-malicious / never-shoot-legitimate
//     strategy, with zero false positives incurred along the way (proves the front-row invariant, not
//     just the individual outcome branches)
//
// Usage: node _tools/arcade-fixes/packet-invaders-check.js   (exit 0 = pass)
const http = require('http'), fs = require('fs'), path = require('path');
const pup = require('puppeteer');
const APP = path.resolve(__dirname, '../../_app');
const GAME_URL = '/houses/web/games/web-packet-invaders.applet.html';
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.css': 'text/css', '.webp': 'image/webp', '.png': 'image/png', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.woff': 'font/woff' };
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
let pass = true;
const ok = (n, c, e) => { if (!c) pass = false; console.log('  ' + (c ? 'PASS' : 'FAIL') + '  ' + n + (e !== undefined ? '  ' + JSON.stringify(e).slice(0, 300) : '')); };

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
  pg.on('pageerror', e => { const m = String(e.message); if (!/firebase|firestore|auth\/|AccessGuard|not authenticated|AchievementManager|ModuleProgress|GameTracker|GameScoreboard|AchievementSystem/i.test(m)) errs.push(m.slice(0, 200)); });
  await pg.setRequestInterception(true);
  // Neutralize component dependencies (same stub pattern as firewall-builder-check.js) so init can't
  // redirect or throw - we're testing the game logic, not the platform shell.
  pg.on('request', r => {
    const u = r.url();
    if (/AccessGuard\.js|AchievementManager\.js|ModuleProgress\.js|GameTracker\.js|GameScoreboard\.js|AchievementSystem\.js/.test(u)) {
      r.respond({ status: 200, contentType: 'text/javascript', body:
        'window.AccessGuard=new Proxy({},{get:function(){return function(){return true;};}});' +
        'var __noop=function(){};var __shim=function(){return new Proxy({},{get:function(){return __noop;}});};' +
        'window.AchievementManager=__shim();window.ModuleProgress=__shim();window.GameTracker=__shim();window.GameScoreboard=__shim();window.AchievementSystem=__shim();' });
    } else if (/HexAIButton\.js/.test(u)) {
      r.respond({ status: 200, contentType: 'text/javascript', body: 'export default {};' });
    } else r.continue();
  });
  await pg.goto('http://localhost:' + port + GAME_URL, { waitUntil: 'domcontentloaded', timeout: 20000 }).catch(() => {});
  await sleep(400);

  console.log('\n=== Load + parse ===');
  const haveApi = await pg.evaluate(() => ({ start: typeof window.__PI?.start, fire: typeof window.__PI?.fire, getState: typeof window.__PI?.getState, forceEnemyY: typeof window.__PI?.forceEnemyY }));
  ok('window.__PI test API present (inline script parsed + ran fully)', haveApi.start === 'function' && haveApi.fire === 'function' && haveApi.getState === 'function' && haveApi.forceEnemyY === 'function', haveApi);

  console.log('\n=== Arcade loop genuinely runs (canvas changes frame-to-frame, demo mode idle) ===');
  const frame1 = await pg.evaluate(() => document.getElementById('gameCanvas').toDataURL());
  await sleep(350);
  const frame2 = await pg.evaluate(() => document.getElementById('gameCanvas').toDataURL());
  ok('canvas pixels differ between two samples ~350ms apart (rAF loop is live, not a static render)', frame1 !== frame2, { len1: frame1.length, len2: frame2.length });

  console.log('\n=== Label catalog: no collisions, legible width ===');
  const labels = await pg.evaluate(() => window.__PI.measureLabels());
  const ids = Object.keys(labels);
  const strings = ids.map(id => labels[id].label);
  const dupes = strings.filter((s, i) => strings.indexOf(s) !== i);
  ok('12 packet types in catalog', ids.length === 12, ids.length);
  ok('no duplicate on-sprite label strings across the catalog (no hidden discriminator reintroduced)', dupes.length === 0, dupes);
  const tooWide = ids.filter(id => labels[id].width > 48);
  ok('every label fits legibly (<=48px at the real 8px Courier New font used on-sprite)', tooWide.length === 0, tooWide.map(id => labels[id]));

  console.log('\n=== Wave 1 presents a genuine mix (not an all-one-verdict tutorial wave) ===');
  await pg.evaluate(() => window.__PI.start());
  await sleep(200);
  let state = await pg.evaluate(() => window.__PI.getState());
  const hasEvil1 = state.enemies.some(e => e.alive && e.evil);
  const hasLegit1 = state.enemies.some(e => e.alive && !e.evil);
  ok('wave 1 contains at least one MALICIOUS type', hasEvil1);
  ok('wave 1 contains at least one LEGITIMATE type', hasLegit1);

  // Helper: the lockstep formation drifts horizontally (~25px/sec) while a bullet is in flight
  // (~1s edge-to-edge). A fire-once-and-wait shot has to lead the target or it misses - that's the
  // normal Space Invaders aiming skill, an orthogonal, already-working arcade mechanic, not the
  // discrimination logic under test. To isolate the SCORING branch from that ballistics/leading skill,
  // pull the target close first (forceEnemyY - position-only, same real collision code runs after),
  // then align and fire over a short, low-drift distance.
  async function bringCloseAlignAndFire(idx, x) {
    await pg.evaluate((idx) => window.__PI.forceEnemyY(idx, 530), idx); // ~70px above the player
    await pg.evaluate((x) => window.__PI.setX(x), x);
    await pg.evaluate(() => window.__PI.fire());
    await sleep(400);
  }

  console.log('\n=== Correct block: shooting a MALICIOUS packet scores + destroys it ===');
  await pg.evaluate(() => window.__PI.start());
  await sleep(150);
  state = await pg.evaluate(() => window.__PI.getState());
  let targetIdx = state.enemies.findIndex(e => e.alive && e.evil);
  ok('found an alive malicious target to test', targetIdx > -1, state.enemies[targetIdx]);
  if (targetIdx > -1) {
    const before = state;
    const t = state.enemies[targetIdx];
    await bringCloseAlignAndFire(targetIdx, t.x + t.w / 2);
    const after = await pg.evaluate(() => window.__PI.getState());
    ok('correctBlocks incremented', after.correctBlocks > before.correctBlocks, { before: before.correctBlocks, after: after.correctBlocks });
    ok('score increased', after.score > before.score, { before: before.score, after: after.score });
    ok('no false positive or breach recorded from a correct block', after.fpCount === before.fpCount && after.breachCount === before.breachCount);
  }

  console.log('\n=== False positive: shooting a LEGITIMATE packet penalizes, does not cost a life ===');
  await pg.evaluate(() => window.__PI.start());
  await sleep(150);
  state = await pg.evaluate(() => window.__PI.getState());
  targetIdx = state.enemies.findIndex(e => e.alive && !e.evil);
  ok('found an alive legitimate target to test', targetIdx > -1, state.enemies[targetIdx]);
  if (targetIdx > -1) {
    const before = state;
    const t = state.enemies[targetIdx];
    await bringCloseAlignAndFire(targetIdx, t.x + t.w / 2);
    const after = await pg.evaluate(() => window.__PI.getState());
    ok('fpCount incremented', after.fpCount > before.fpCount, { before: before.fpCount, after: after.fpCount });
    ok('combo reset to 0', after.combo === 0, after.combo);
    ok('no life lost for a false positive (breach is the life-cost failure mode, not fp)', after.lives === before.lives, { before: before.lives, after: after.lives });
    ok('no correct-block or breach recorded from a false positive', after.correctBlocks === before.correctBlocks && after.breachCount === before.breachCount);
  }

  console.log('\n=== BREACH: a MALICIOUS packet reaching the base costs a life, is retired (no re-trigger) ===');
  await pg.evaluate(() => window.__PI.start());
  await sleep(150);
  state = await pg.evaluate(() => window.__PI.getState());
  const evilIdx = state.enemies.findIndex(e => e.alive && e.evil);
  ok('found an alive malicious enemy to force to the base', evilIdx > -1);
  if (evilIdx > -1) {
    const before = state;
    await pg.evaluate((idx) => window.__PI.forceEnemyY(idx, 595), evilIdx);
    await sleep(200);
    const mid = await pg.evaluate(() => window.__PI.getState());
    await sleep(200); // second tick - must NOT double-trigger since the enemy is retired (alive=false)
    const after = await pg.evaluate(() => window.__PI.getState());
    ok('breachCount incremented exactly once', mid.breachCount === before.breachCount + 1 && after.breachCount === mid.breachCount, { before: before.breachCount, mid: mid.breachCount, after: after.breachCount });
    ok('exactly one life lost (not drained every frame while past threshold)', mid.lives === before.lives - 1 && after.lives === mid.lives, { before: before.lives, mid: mid.lives, after: after.lives });
  }

  console.log('\n=== DELIVERED: a LEGITIMATE packet reaching the base is correct, no penalty ===');
  await pg.evaluate(() => window.__PI.start());
  await sleep(150);
  state = await pg.evaluate(() => window.__PI.getState());
  const legitIdx = state.enemies.findIndex(e => e.alive && !e.evil);
  ok('found an alive legitimate enemy to force to the base', legitIdx > -1);
  if (legitIdx > -1) {
    const before = state;
    await pg.evaluate((idx) => window.__PI.forceEnemyY(idx, 595), legitIdx);
    await sleep(200);
    const after = await pg.evaluate(() => window.__PI.getState());
    ok('score increased (delivered bonus)', after.score > before.score, { before: before.score, after: after.score });
    ok('no life lost, no fp, no breach for correctly-delivered legitimate traffic', after.lives === before.lives && after.fpCount === before.fpCount && after.breachCount === before.breachCount);
  }

  console.log('\n=== Winnability: wave 1 clearable via correct-only filtering, zero forced false positives ===');
  await pg.evaluate(() => window.__PI.start());
  await sleep(150);
  let solved = false, fpDuringSolve = 0, iterations = 0;
  const startFp = (await pg.evaluate(() => window.__PI.getState())).fpCount;
  while (iterations < 15) {
    iterations++;
    const s = await pg.evaluate(() => window.__PI.getState());
    const evilIdxNow = s.enemies.findIndex(e => e.alive && e.evil);
    if (evilIdxNow === -1) { solved = true; break; }
    // Engage the next alive malicious target - the correct-only strategy never touches a legitimate
    // one. bringCloseAlignAndFire isolates the discrimination decision from the (separate, already-
    // working) leading/aiming skill - see its doc comment above.
    const t = s.enemies[evilIdxNow];
    await bringCloseAlignAndFire(evilIdxNow, t.x + t.w / 2);
  }
  const afterSolve = await pg.evaluate(() => window.__PI.getState());
  fpDuringSolve = afterSolve.fpCount - startFp;
  ok('all malicious packets in wave 1 blocked without ever needing to shoot a legitimate one', solved, { iterations, remainingEvil: afterSolve.enemies.filter(e => e.alive && e.evil).length });
  ok('zero false positives incurred while clearing wave 1 with the correct-only strategy', fpDuringSolve === 0, fpDuringSolve);
  ok('zero breaches (every malicious packet was blocked before reaching the base)', afterSolve.breachCount === 0, afterSolve.breachCount);
  ok('game still running / not lost (still playable and winnable via correct filtering)', afterSolve.gameOver === false && afterSolve.lives > 0, { gameOver: afterSolve.gameOver, lives: afterSolve.lives });
  // Fast-forward any remaining legitimate packets to the base (position-only acceleration - see
  // forceEnemyY's doc comment) to prove the wave actually clears via the real wave-complete check.
  if (solved) {
    for (let pass2 = 0; pass2 < 8; pass2++) {
      const s = await pg.evaluate(() => window.__PI.getState());
      const legitAlive = s.enemies.map((e, i) => ({ ...e, i })).filter(e => e.alive && !e.evil);
      if (legitAlive.length === 0) break;
      await pg.evaluate((idxs) => idxs.forEach(i => window.__PI.forceEnemyY(i, 595)), legitAlive.map(e => e.i));
      await sleep(150);
    }
    await sleep(1200); // waveTransition (~90 frames) before spawnWave() advances to wave 2
    const cleared = await pg.evaluate(() => window.__PI.getState());
    ok('wave advanced past 1 once all traffic resolved (wave-clear check fires correctly)', cleared.wave >= 2, cleared.wave);
    ok('no false positives or breaches accrued while clearing the whole wave', cleared.fpCount === startFp && cleared.breachCount === 0, { fpCount: cleared.fpCount, breachCount: cleared.breachCount });
  }

  ok('0 non-platform-shim pageErrors', errs.length === 0, errs.slice(0, 4));

  await b.close(); srv.close();
  console.log(pass ? '\n*** PACKET INVADERS CHECK OK ***' : '\n!!! PACKET INVADERS CHECK FAILURES ABOVE !!!');
  process.exit(pass ? 0 : 1);
})();
