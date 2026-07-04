#!/usr/bin/env node
// shield-debugger-check.js — browser-level regression + teaching-content gate for
// shield-debugger.applet.html (Debugger, Shield house raycasting FPS).
//
// The fix bound real malware fact + defense content to each of the 7 threat types
// (Buffer Overflow, Trojan, Worm, Ransomware, Zero-Day, Leak, Rootkit) across three
// teaching surfaces: the sidebar Threat Index, an on-kill intel toast, and a
// sector/run debrief. This check loads the game headless, stubs AccessGuard so it
// renders instead of redirecting (same technique as cockpit-render-check.js stubs
// FirebaseAuth), confirms the raycasting loop is actually running (not just a
// static paint), plays through all 3 sectors via the window.DebuggerTest QC hook,
// and asserts the real fact/defense text is present for every threat type across
// all three surfaces. Run before shipping any change to this file.
//
// Usage: node _tools/arcade-fixes/shield-debugger-check.js   (exit 0 = pass)
const http = require('http'), fs = require('fs'), path = require('path');
const pup = require('puppeteer');
const APP = path.resolve(__dirname, '../../_app');
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.css': 'text/css', '.webp': 'image/webp', '.png': 'image/png', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.woff': 'font/woff' };
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
let pass = true;
const ok = (n, c, e) => { if (!c) pass = false; console.log('  ' + (c ? 'PASS' : 'FAIL') + '  ' + n + (e !== undefined ? '  ' + JSON.stringify(e).slice(0, 300) : '')); };

const THREAT_TYPES = ['buffer', 'trojan', 'worm', 'ransomware', 'zeroday', 'leak', 'rootkit'];

// Static file server rooted at _app so the game + its relative/absolute asset
// references (components/*, _lib/HexAIButton.js, sprites) load same-origin.
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
  pg.on('pageerror', e => { const m = String(e.message); if (!/firebase|firestore|auth\/|AccountFrame|FirebaseAuth|not authenticated/i.test(m)) errs.push(m.slice(0, 200)); });
  pg.on('console', msg => { if (msg.type() === 'error') { const t = msg.text(); if (!/firebase|firestore/i.test(t)) errs.push('console.error: ' + t.slice(0, 200)); } });

  await pg.setRequestInterception(true);
  // Stub AccessGuard.require so the sorted-house gate passes and the page renders
  // instead of redirecting to sorting.html. The gameplay/render code under test is
  // everything AFTER this gate, same rationale as cockpit-render-check.js.
  pg.on('request', r => {
    const u = r.url();
    if (u.endsWith('/components/AccessGuard.js')) r.respond({ status: 200, contentType: 'text/javascript', body: 'window.AccessGuard={require:function(){return true;},requireAll:function(){return true;},requireAny:function(){return true;}};' });
    else r.continue();
  });

  await pg.goto('http://localhost:' + port + '/houses/shield/games/shield-debugger.applet.html', { waitUntil: 'domcontentloaded', timeout: 20000 }).catch(() => {});
  await sleep(600); // let the RAF loop start rendering the title screen

  // ── 1. Script parsed fully (proves no broken template literal / syntax swallowed by parser) ──
  const haveHook = await pg.evaluate(() => typeof window.DebuggerTest === 'object' && typeof window.DebuggerTest.start === 'function' && typeof window.DebuggerTest.state === 'function' && typeof window.DebuggerTest.killAllEnemies === 'function' && typeof window.DebuggerTest.finishSector === 'function' && typeof window.DebuggerTest.toast === 'function');
  ok('window.DebuggerTest QC hook present with expected methods (script ran to completion)', haveHook);

  // ── 2. Raycasting loop is actually running (canvas repaints frame over frame), not a static image ──
  const frame1 = await pg.evaluate(() => document.getElementById('gameCanvas').toDataURL());
  await sleep(300);
  const frame2 = await pg.evaluate(() => document.getElementById('gameCanvas').toDataURL());
  ok('canvas repaints across frames on the title screen (raycasting demo loop running)', frame1 !== frame2, { len1: frame1.length, len2: frame2.length });

  // ── 3. Canvas actually has rendered content (not blank/transparent) ──
  const pixelStats = await pg.evaluate(() => {
    const c = document.getElementById('gameCanvas');
    const ctx = c.getContext('2d');
    const data = ctx.getImageData(0, 0, c.width, c.height).data;
    let nonZero = 0;
    for (let i = 0; i < data.length; i += 400) if (data[i] || data[i+1] || data[i+2]) nonZero++;
    return { sampled: Math.ceil(data.length / 400), nonZero };
  });
  ok('canvas has non-blank rendered pixels', pixelStats.nonZero > 5, pixelStats);

  // ── 4. Sidebar Threat Index enriched with Real:/Defense: for all 7 types (surface b) ──
  const sidebar = await pg.evaluate((types) => {
    const out = {};
    for (const t of types) {
      const item = document.querySelector(`.enemy-item[data-type="${t}"]`);
      const real = item ? item.querySelector('.enemy-item-real') : null;
      const def = item ? item.querySelector('.enemy-item-defense') : null;
      out[t] = { real: real ? real.textContent : null, def: def ? def.textContent : null };
    }
    return out;
  }, THREAT_TYPES);
  for (const t of THREAT_TYPES) {
    ok(`sidebar Threat Index has Real: fact for ${t}`, !!(sidebar[t].real && sidebar[t].real.startsWith('Real:') && sidebar[t].real.length > 20), sidebar[t].real);
    ok(`sidebar Threat Index has Defense: mitigation for ${t}`, !!(sidebar[t].def && sidebar[t].def.startsWith('Defense:') && sidebar[t].def.length > 20), sidebar[t].def);
  }

  // ── 5. Pull the in-page THREAT_INTEL data to cross-check toast/debrief text against it later ──
  const threatIntel = await pg.evaluate(() => window.DebuggerTest.threatIntel());
  ok('THREAT_INTEL has all 7 threat types with fact+defense', THREAT_TYPES.every(t => threatIntel[t] && threatIntel[t].fact && threatIntel[t].defense), Object.keys(threatIntel));

  // ── 6. Start a real run and play through all 3 sectors via the QC hook, forcing every ──
  //       type (including runtime-spawned LEAK, via Buffer-kill cascade) to be killed at least once.
  await pg.evaluate(() => window.DebuggerTest.start());
  await sleep(150);
  let stateAfterStart = await pg.evaluate(() => window.DebuggerTest.state());
  ok('gameState is playing after start()', stateAfterStart.gameState === 'playing', stateAfterStart);

  let toastSeenAtLeastOnce = false;
  for (let level = 0; level < 3; level++) {
    // Kill everything alive (loops a few times to catch cascade spawns: Buffer -> Leak, Rootkit -> Leak).
    for (let i = 0; i < 6; i++) {
      await pg.evaluate(() => window.DebuggerTest.killAllEnemies());
      await sleep(250); // let RAF ticks drain the intel queue / process spawns
      const s = await pg.evaluate(() => window.DebuggerTest.state());
      if (s.enemiesAlive === 0) break;
    }
    // Check the intel toast fired for at least one newly-seen type during this sector.
    const toast = await pg.evaluate(() => window.DebuggerTest.toast());
    if (toast.visible) toastSeenAtLeastOnce = true;

    await pg.evaluate(() => window.DebuggerTest.finishSector());
    await sleep(150);
    const s2 = await pg.evaluate(() => window.DebuggerTest.state());

    if (level < 2) {
      // Sector-clear debrief check.
      const overlayHtml = await pg.evaluate(() => document.getElementById('overlay').innerHTML);
      ok(`sector ${level} clear debrief shows THREAT DEBRIEF heading`, /THREAT DEBRIEF/.test(overlayHtml));
      ok(`sector ${level} clear debrief content matches THREAT_INTEL for at least one seen type`, s2.sectorTypesSeen.length > 0 && s2.sectorTypesSeen.some(t => overlayHtml.includes(threatIntel[t].defense)), { sectorTypesSeen: s2.sectorTypesSeen });
      // Advance to next sector (Enter key, same as a real player).
      await pg.keyboard.press('Enter');
      await sleep(150);
      const s3 = await pg.evaluate(() => window.DebuggerTest.state());
      ok(`advances to sector ${level + 1} after Enter`, s3.currentLevel === level + 1 && s3.gameState === 'playing', s3);
    } else {
      // Final sector -> victory screen.
      const overlayHtml = await pg.evaluate(() => document.getElementById('overlay').innerHTML);
      ok('victory screen shows SYSTEM CLEAN', /SYSTEM CLEAN/.test(overlayHtml));
      ok('victory debrief shows THREAT DEBRIEF heading (full-run scope)', /THREAT DEBRIEF/.test(overlayHtml));
      ok('gameState is victory', s2.gameState === 'victory', s2.gameState);
    }
  }
  ok('intel toast became visible at least once during play (on-kill teaching surface fired)', toastSeenAtLeastOnce);

  // ── 7. Full-run debrief (victory) covers all 7 threat types, including runtime-spawned LEAK ──
  const finalState = await pg.evaluate(() => window.DebuggerTest.state());
  ok('run encountered all 7 threat types (including cascade-spawned Leak/Rootkit-spawned Leak)', THREAT_TYPES.every(t => finalState.runTypesSeen.includes(t)), finalState.runTypesSeen);

  const victoryHtml = await pg.evaluate(() => document.getElementById('overlay').innerHTML);
  for (const t of THREAT_TYPES) {
    ok(`victory debrief includes real defense text for ${t}`, victoryHtml.includes(threatIntel[t].defense), { type: t });
  }

  // ── 8. Debrief block is structurally scroll-capped, not just visually assumed to fit ──
  const debriefBox = await pg.evaluate(() => {
    const el = document.querySelector('.threat-debrief');
    if (!el) return null;
    const cs = getComputedStyle(el);
    return { maxHeight: cs.maxHeight, overflowY: cs.overflowY, scrollHeight: el.scrollHeight, clientHeight: el.clientHeight };
  });
  ok('debrief block has a bounded max-height + overflow-y:auto (cannot blow out the overlay regardless of type count)', !!debriefBox && debriefBox.overflowY === 'auto' && debriefBox.maxHeight !== 'none', debriefBox);

  // Small helper: kill everything + finishSector, looped through all 3 levels, ending
  // on the victory screen. Used twice below (once per restart mechanism under test)
  // so each restart test starts from a fresh, real victory overlay.
  async function playToVictory() {
    for (let level = 0; level < 3; level++) {
      for (let i = 0; i < 6; i++) {
        await pg.evaluate(() => window.DebuggerTest.killAllEnemies());
        await sleep(250);
        const s = await pg.evaluate(() => window.DebuggerTest.state());
        if (s.enemiesAlive === 0) break;
      }
      await pg.evaluate(() => window.DebuggerTest.finishSector());
      await sleep(150);
      if (level < 2) { await pg.keyboard.press('Enter'); await sleep(150); }
    }
  }

  // ── 9. REGRESSION: click on the .threat-debrief box must restart (was a dead zone) ──
  // Chris found the debrief box (pointer-events:auto, 480x190, front-and-center) ate
  // clicks that used to fall through to canvas's click-to-restart listener, since the
  // debrief is a sibling of canvas (inside #overlay), never reachable by a listener
  // bound to the canvas element itself. Fixed via a delegated document click handler.
  const preClickState = await pg.evaluate(() => window.DebuggerTest.state());
  ok('sanity: on victory screen before regression test', preClickState.gameState === 'victory', preClickState.gameState);
  const debriefHandle = await pg.$('.threat-debrief');
  ok('.threat-debrief element exists on victory screen to click-test', !!debriefHandle);
  if (debriefHandle) await debriefHandle.click();
  await sleep(200);
  const postClickState = await pg.evaluate(() => window.DebuggerTest.state());
  ok('REGRESSION FIX: click on .threat-debrief restarts the game (gameState -> playing, level -> 0)', postClickState.gameState === 'playing' && postClickState.currentLevel === 0, postClickState);

  // ── 10. Keyboard restart fallback (Enter/Space) on a fresh victory screen ──
  await playToVictory();
  const preKeyState = await pg.evaluate(() => window.DebuggerTest.state());
  ok('sanity: reached victory screen again for keyboard-restart test', preKeyState.gameState === 'victory', preKeyState.gameState);
  await pg.keyboard.press('Enter');
  await sleep(200);
  const postEnterState = await pg.evaluate(() => window.DebuggerTest.state());
  ok('keyboard Enter restarts the game from victory screen', postEnterState.gameState === 'playing' && postEnterState.currentLevel === 0, postEnterState);

  // Repeat once more for Space, on a fresh victory screen (defense-in-depth key).
  await playToVictory();
  const preSpaceState = await pg.evaluate(() => window.DebuggerTest.state());
  ok('sanity: reached victory screen a third time for Space-restart test', preSpaceState.gameState === 'victory', preSpaceState.gameState);
  await pg.keyboard.press('Space');
  await sleep(200);
  const postSpaceState = await pg.evaluate(() => window.DebuggerTest.state());
  ok('keyboard Space restarts the game from victory screen', postSpaceState.gameState === 'playing' && postSpaceState.currentLevel === 0, postSpaceState);

  ok('0 non-firebase pageErrors/console-errors across full playthrough (incl. regression re-tests)', errs.length === 0, errs.slice(0, 6));

  await b.close(); srv.close();
  console.log(pass ? '\n*** SHIELD DEBUGGER TEACHING CONTENT CHECK OK ***' : '\n!!! SHIELD DEBUGGER CHECK FAILURES ABOVE !!!');
  process.exit(pass ? 0 : 1);
})();
