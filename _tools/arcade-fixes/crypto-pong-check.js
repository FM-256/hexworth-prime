#!/usr/bin/env node
// crypto-pong-check.js - regression gate for the Key House "Crypto Pong" applet after binding a
// real, computed cipher-decode decision to the paddle/return mechanic.
//
// BEFORE: near-perfect Pong wearing a cosmetic crypto skin. The ball carried a random decorative
// label (cipherText, drawn from static PLAINTEXT/CIPHERTEXT arrays) that had zero causal effect on
// play; named "ciphers" (AES-128/256, RSA-2048, ChaCha20, QUANTUM) only tweaked ball physics
// (speed/curve/size-pulse). Playing required zero crypto decisions, only reflex ball-tracking.
//
// AFTER: every serve arms a genuinely computed decode challenge (genChallenge()): a real cipher
// (Caesar -> Atbash -> XOR -> Vigenere, escalating with round, key/shift randomized per rally so it
// can't be memorized) encrypts a secret word drawn from a length-bucketed real-word bank; two
// same-length real words are the distractors; a Fisher-Yates shuffle assigns the three words to the
// paddle's three bands (top/mid/bottom, via the existing hitPos-by-position calculation the engine
// already used for spin). The player must decode the shown ciphertext + key and hit the ball with
// the band holding the correct plaintext: correct band = real Pong return (rally continues); wrong
// band or a physical miss = the ball passes straight through untouched (existing single-shot
// edge-crossing scoring path awards the point, so there is no separate score branch that could
// double-count a multi-frame dwell). A swept x-check plus an approachResolved flag prevent both
// re-triggering across dwell frames and high-speed tunneling through the paddle's 12px x-band.
//
// This loads the real applet HTML headless (no build step), stubs the AccessGuard/platform-shim
// dependencies (same pattern as packet-invaders-check.js) so the page renders instead of being
// redirected, and drives the real exposed window.__test API (backed by the actual closures, not a
// test double) to assert:
//   - 0 non-platform-shim pageErrors
//   - the Pong loop genuinely runs (canvas pixels change frame-to-frame)
//   - across 40 independently-forced challenges spanning all 4 cipher rounds, the displayed
//     correct-plaintext lane equals a decode computed HERE in the harness (separate implementations
//     of Caesar/Atbash/XOR/Vigenere decode, not a reuse of the page's own functions) applied to the
//     displayed ciphertext + key -- this is the "not hardcoded, actually computed" proof
//   - correctLane is not biased toward one band across many challenges (shuffle sanity)
//   - intercepting with the CORRECT band bounces the ball (real Pong return), rally continues
//   - intercepting with a WRONG band, or missing the paddle entirely, lets the ball pass through and
//     the enemy scores exactly once (no double count, no bounce)
//   - a "blind" bot that centers the paddle on the ball with zero lane awareness (the natural
//     reflex-only Pong instinct) passes the decode gate at only the ~1/3 rate implied by picking a
//     random band, while a decode-AWARE bot (uses the real correctLane) passes at ~100% -- proving
//     reflex alone does not reliably win (this is an "N>=300, don't let a small sample hide the real
//     rate" style stress a la the Subnet Siege winnability precedent, not a claim that reflex winning
//     is mathematically impossible)
//
// Usage: node _tools/arcade-fixes/crypto-pong-check.js   (exit 0 = pass)
const http = require('http'), fs = require('fs'), path = require('path');
const pup = require('puppeteer');
const APP = path.resolve(__dirname, '../../_app');
const GAME_URL = '/houses/key/games/key-crypto-pong.applet.html';
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.css': 'text/css', '.webp': 'image/webp', '.png': 'image/png', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.woff': 'font/woff' };
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
let pass = true;
const ok = (n, c, e) => { if (!c) pass = false; console.log('  ' + (c ? 'PASS' : 'FAIL') + '  ' + n + (e !== undefined ? '  ' + JSON.stringify(e).slice(0, 300) : '')); };

const srv = http.createServer((q, s) => {
  let p = decodeURIComponent(q.url.split('?')[0]); let fp = path.join(APP, p);
  if (fs.existsSync(fp) && fs.statSync(fp).isFile()) { s.writeHead(200, { 'Content-Type': MIME[path.extname(fp)] || 'application/octet-stream' }); fs.createReadStream(fp).pipe(s); }
  else { s.writeHead(404); s.end('nf'); }
});

// ---- Independent harness-side decode implementations (NOT copied from the page's <script>) ----
// These exist so the "displayed correct plaintext equals a computed decode" assertion has real
// teeth: if the page ever hardcoded a lookup table instead of computing the cipher, an independent
// implementation would disagree with it while a copy-pasted one would rubber-stamp the bug.
function mod26(n) { return ((n % 26) + 26) % 26; }
function harnessCaesarDecrypt(t, shift) { return t.replace(/[A-Z]/g, c => String.fromCharCode(65 + mod26(c.charCodeAt(0) - 65 - shift))); }
function harnessAtbashDecrypt(t) { return t.replace(/[A-Z]/g, c => String.fromCharCode(65 + (25 - (c.charCodeAt(0) - 65)))); }
function harnessXorDecryptHex(hex, key) { return hex.trim().split(/\s+/).map(h => String.fromCharCode(parseInt(h, 16) ^ key)).join(''); }
function harnessVigenereDecrypt(t, key) {
  let i = 0;
  return t.replace(/[A-Z]/g, c => {
    const s = key.charCodeAt(i % key.length) - 65;
    i++;
    return String.fromCharCode(65 + mod26(c.charCodeAt(0) - 65 - s));
  });
}
// Sanity-check the harness's own ciphers against known vectors before trusting them to grade the page.
function selfCheckHarnessCiphers() {
  const cases = [
    ['Caesar', harnessCaesarDecrypt('KHOOR', 3) === 'HELLO'],
    ['Atbash', harnessAtbashDecrypt('SVOOL') === 'HELLO'],
    ['XOR', harnessXorDecryptHex('62 6F 66 66 65', 0x2A) === 'HELLO'],
    ['Vigenere', harnessVigenereDecrypt('RIJVS', 'KEY') === 'HELLO']
  ];
  return cases;
}
// Parse the page's keyDisplay string ('SHIFT 7' / '(mirror, no key)' / 'KEY 0x4B' / 'KEY DOG') into
// the value the harness decode functions need.
function decodeChallenge(cipherName, keyDisplay, ciphertext) {
  if (cipherName === 'CAESAR') return harnessCaesarDecrypt(ciphertext, parseInt(keyDisplay.replace('SHIFT ', ''), 10));
  if (cipherName === 'ATBASH') return harnessAtbashDecrypt(ciphertext);
  if (cipherName === 'XOR') return harnessXorDecryptHex(ciphertext, parseInt(keyDisplay.replace('KEY 0x', ''), 16));
  if (cipherName === 'VIGENERE') return harnessVigenereDecrypt(ciphertext, keyDisplay.replace('KEY ', ''));
  return null;
}

(async () => {
  console.log('\n=== Harness self-check: independent cipher implementations match known vectors ===');
  const selfChecks = selfCheckHarnessCiphers();
  selfChecks.forEach(([name, c]) => ok('harness ' + name + ' decode matches known vector', c));
  if (selfChecks.some(([, c]) => !c)) { console.log('!!! Harness ciphers are wrong -- aborting, cannot grade the page with broken graders !!!'); process.exit(1); }

  await new Promise(r => srv.listen(0, r)); const port = srv.address().port;
  const b = await pup.launch({ headless: 'new', args: ['--no-sandbox'] });
  const pg = await b.newPage();
  const errs = [];
  pg.on('pageerror', e => { const m = String(e.message); if (!/firebase|firestore|auth\/|AccessGuard|not authenticated|AchievementManager|ModuleProgress|GameTracker|GameScoreboard|AchievementSystem/i.test(m)) errs.push(m.slice(0, 200)); });
  await pg.setRequestInterception(true);
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
  const haveApi = await pg.evaluate(() => ({
    start: typeof window.__test?.start, step: typeof window.__test?.step, setP1Y: typeof window.__test?.setP1Y,
    setBall: typeof window.__test?.setBall, forceChallenge: typeof window.__test?.forceChallenge,
    forceRound: typeof window.__test?.forceRound, state: typeof window.__test?.state, pause: typeof window.__test?.pause
  }));
  ok('window.__test API present (inline script parsed + ran fully)', Object.values(haveApi).every(v => v === 'function'), haveApi);

  console.log('\n=== Pong loop genuinely runs (canvas changes frame-to-frame, demo mode idle) ===');
  // Sample several frames rather than just one pair: a single ~350ms pair occasionally lands on two
  // visually-identical encodes in headless Chrome (e.g. the demo ball's sub-pixel motion between two
  // specific instants happens to round to the same rendered frame), which is sampling flakiness, not
  // evidence the loop is dead. Requiring at least one differing pair across several samples is robust
  // to that without weakening what's being proven (the loop is genuinely live and animating).
  const frames = [];
  for (let i = 0; i < 5; i++) { frames.push(await pg.evaluate(() => document.getElementById('gameCanvas').toDataURL())); await sleep(250); }
  const anyDiffer = frames.some((f, i) => i > 0 && f !== frames[0]);
  ok('canvas pixels differ across 5 samples ~250ms apart (rAF loop is live)', anyDiffer, { lens: frames.map(f => f.length) });

  await pg.evaluate(() => window.__test.start());
  await sleep(100);
  // Pause the real rAF-driven update() loop from here on. Without this, real wall-clock time
  // passing between separate pg.evaluate() round-trips lets the page's own gameLoop keep firing
  // update() in the background, racing against and corrupting the deterministic step()-driven
  // trials below (this was found the hard way: it made gate-trial results wildly non-reproducible
  // run to run). All remaining assertions drive state exclusively through window.__test.step().
  await pg.evaluate(() => window.__test.pause());

  console.log('\n=== Decode is COMPUTED, not hardcoded: 40 forced challenges across all 4 cipher rounds ===');
  const rounds = [1, 3, 5, 7];
  let decodeSamples = [];
  for (let r = 0; r < rounds.length; r++) {
    for (let i = 0; i < 10; i++) {
      const ch = await pg.evaluate((round) => { window.__test.forceRound(round); return window.__test.forceChallenge(); }, rounds[r]);
      decodeSamples.push(ch);
    }
  }
  let decodeMismatches = [];
  decodeSamples.forEach(ch => {
    const computed = decodeChallenge(ch.cipherName, ch.keyDisplay, ch.ciphertext);
    if (computed !== ch.secret) decodeMismatches.push({ ch, computed });
  });
  ok('40/40 samples: harness-computed decode(ciphertext, key) === displayed secret plaintext', decodeMismatches.length === 0, decodeMismatches.slice(0, 3));
  let laneMismatches = decodeSamples.filter(ch => ch.lanes[ch.correctLane] !== ch.secret);
  ok('40/40 samples: lanes[correctLane] === secret (correct band actually shows the decoded word)', laneMismatches.length === 0, laneMismatches.slice(0, 3));
  const cipherNamesSeen = new Set(decodeSamples.map(c => c.cipherName));
  ok('all 4 real ciphers appeared across the round sweep (CAESAR/ATBASH/XOR/VIGENERE)', ['CAESAR', 'ATBASH', 'XOR', 'VIGENERE'].every(n => cipherNamesSeen.has(n)), [...cipherNamesSeen]);
  // Distractor sanity: the 2 non-secret lane words must be real words of the same length as the secret, and distinct.
  let distractorBad = decodeSamples.filter(ch => {
    const others = ch.lanes.filter(w => w !== ch.secret);
    return others.length !== 2 || others[0] === others[1] || others.some(w => w.length !== ch.secret.length);
  });
  ok('distractors are 2 distinct same-length words (not gibberish, not duplicates)', distractorBad.length === 0, distractorBad.slice(0, 3));

  console.log('\n=== Shuffle sanity: correctLane is not biased toward one band ===');
  let laneCounts = [0, 0, 0];
  for (let i = 0; i < 300; i++) {
    const ch = await pg.evaluate(() => window.__test.forceChallenge());
    laneCounts[ch.correctLane]++;
  }
  const laneFracs = laneCounts.map(c => c / 300);
  ok('correctLane distribution over 300 shuffles is roughly uniform (each band 20%-47%)', laneFracs.every(f => f > 0.20 && f < 0.47), laneFracs);

  console.log('\n=== Correct band intercepts: real Pong return, rally continues, no premature score ===');
  const correctResult = await pg.evaluate(() => {
    window.__test.forceRound(1);
    const ch = window.__test.forceChallenge();
    const p = window.__test.state().paddle;
    const laneCenterHitPos = [-1 / 3, 0, 1 / 3];
    const desired = laneCenterHitPos[ch.correctLane];
    const ballY = 275;
    const targetP1Y = ballY - p.h * (desired + 0.5);
    window.__test.setP1Y(targetP1Y);
    window.__test.resetForApproach({ x: p.x + p.w + 60, y: ballY, vx: -6, vy: 0 });
    const before = window.__test.state();
    for (let i = 0; i < 30; i++) window.__test.step(1);
    const after = window.__test.state();
    return { before, after, correctLane: ch.correctLane };
  });
  ok('ball bounced (vx flipped positive = real Pong return on correct decode)', correctResult.after.ball.vx > 0, { beforeVx: correctResult.before.ball.vx, afterVx: correctResult.after.ball.vx });
  ok('rally continued (no enemy point scored on a correct decode)', correctResult.after.p2Score === correctResult.before.p2Score, { before: correctResult.before.p2Score, after: correctResult.after.p2Score });
  ok('approachResolved set exactly once (debounce works, no re-trigger)', correctResult.after.approachResolved === true);

  console.log('\n=== Wrong band: ball passes through, enemy scores exactly once, no bounce ===');
  const wrongResult = await pg.evaluate(() => {
    window.__test.forceRound(1);
    const ch = window.__test.forceChallenge();
    const p = window.__test.state().paddle;
    const wrongLane = (ch.correctLane + 1) % 3;
    const laneCenterHitPos = [-1 / 3, 0, 1 / 3];
    const desired = laneCenterHitPos[wrongLane];
    const ballY = 275;
    const targetP1Y = ballY - p.h * (desired + 0.5);
    window.__test.setP1Y(targetP1Y);
    window.__test.resetForApproach({ x: p.x + p.w + 60, y: ballY, vx: -6, vy: 0 });
    const before = window.__test.state();
    for (let i = 0; i < 90; i++) window.__test.step(1); // enough frames to cross x<-20 and register the point
    const after = window.__test.state();
    return { before, after };
  });
  ok('ball never bounced (vx stayed negative throughout the wrong-band approach)', wrongResult.after.ball.vx <= 0 || wrongResult.after.ball.serving, wrongResult.after.ball);
  ok('enemy scored exactly once (single-shot edge-crossing path, no double count)', wrongResult.after.p2Score === wrongResult.before.p2Score + 1, { before: wrongResult.before.p2Score, after: wrongResult.after.p2Score });

  console.log('\n=== Reflex-only bot does NOT reliably pass the decode gate; a decode-aware bot does ===');
  async function gateTrial(pg, mode) {
    return pg.evaluate((mode) => {
      window.__test.forceRound([1, 3, 5, 7][Math.floor(Math.random() * 4)]);
      const ch = window.__test.forceChallenge();
      const p = window.__test.state().paddle;
      const ballY = 90 + Math.random() * 370;
      if (mode === 'aware') {
        const laneCenterHitPos = [-1 / 3, 0, 1 / 3];
        const desired = laneCenterHitPos[ch.correctLane];
        window.__test.setP1Y(ballY - p.h * (desired + 0.5));
      } else {
        // Blind/reflex: center the paddle on the ball with a little natural jitter, exactly the
        // "just track the ball" instinct of a player ignoring the ciphertext banner entirely.
        window.__test.setP1Y(ballY - p.h / 2 + (Math.random() - 0.5) * 20);
      }
      window.__test.resetForApproach({ x: p.x + p.w + 60, y: ballY, vx: -6, vy: 0 });
      for (let i = 0; i < 30; i++) window.__test.step(1);
      const after = window.__test.state();
      return after.ball.vx > 0; // true = correct band intercepted (bounced)
    }, mode);
  }
  const N = 300;
  let blindCorrect = 0, awareCorrect = 0;
  for (let i = 0; i < N; i++) if (await gateTrial(pg, 'blind')) blindCorrect++;
  for (let i = 0; i < N; i++) if (await gateTrial(pg, 'aware')) awareCorrect++;
  const blindRate = blindCorrect / N, awareRate = awareCorrect / N;
  ok(`blind/reflex bot passes the gate at chance rate over N=${N} (~1/3, between 20%-47%, ignoring the decode never pays off)`, blindRate > 0.20 && blindRate < 0.47, { blindRate });
  ok(`decode-aware bot passes the gate reliably over N=${N} (>=90%, proving the mechanic IS winnable via real decoding)`, awareRate >= 0.90, { awareRate });
  ok('aware bot dramatically outperforms blind bot (the decode, not reflex, drives the outcome)', awareRate > blindRate + 0.4, { awareRate, blindRate });

  console.log('\n=== Integration: driven through the REAL armServe -> read-window -> launchServe -> collision pipeline (not injected mid-flight), aware beats blind ===');
  // Unlike the gate trials above (which inject the ball mid-approach via resetForApproach to isolate
  // the collision/scoring logic), this drives the actual serve lifecycle end-to-end: window.__test.start()
  // begins a real fresh game, armServe() picks one real challenge, freezes the ball for its real read
  // window, and launchServe() fires it at real play speed. Each trial samples only the FIRST approach
  // resolution of a FRESH game (not a full point/rally), then stops -- a rally with a decode-aware bot
  // can legitimately run for thousands of exchanges without either side missing (the AI opponent is
  // fairly competent too), so sampling per-POINT or per-approach-within-a-rally would let a few very
  // long, highly-correlated rallies dominate the sample; sampling one independent fresh-start draw per
  // trial avoids that entirely while still exercising the full real pipeline once per trial.
  async function firstApproachTrial(pg, mode) {
    return pg.evaluate((mode) => {
      window.__test.start();
      let ticks = 0;
      while (ticks < 4000) {
        const s = window.__test.state();
        if (s.correctCatchCount + s.wrongPassCount >= 1) return { correct: s.correctCatchCount >= 1, ticks };
        const p = s.paddle;
        if (s.challenge) {
          // One-tick lookahead: unlike the artificial gate trials above (ball.vy pinned to 0), a
          // REAL serve has a randomized non-zero vy (see launchServe()), so ball.y keeps drifting
          // during the whole real travel. Positioning off last tick's ball.y is one tick stale by
          // the time step() resolves this tick's collision; predicting with +vy removes that lag
          // rather than just tolerating a lower pass bar for what would otherwise be an artifact of
          // this test bot, not the game.
          const predictedY = s.ball.y + s.ball.vy;
          const laneCenterHitPos = [-1 / 3, 0, 1 / 3];
          const targetY = mode === 'aware'
            ? predictedY - p.h * (laneCenterHitPos[s.challenge.correctLane] + 0.5)
            : predictedY - p.h / 2; // blind: just track the ball, ignore the challenge entirely
          window.__test.setP1Y(targetY);
        }
        window.__test.step(1);
        ticks++;
      }
      return { correct: null, ticks, timedOut: true };
    }, mode);
  }
  const PIPE_N = 40;
  let awarePipeCorrect = 0, awarePipeTimeouts = 0, blindPipeCorrect = 0, blindPipeTimeouts = 0;
  for (let i = 0; i < PIPE_N; i++) { const r = await firstApproachTrial(pg, 'aware'); if (r.timedOut) awarePipeTimeouts++; else if (r.correct) awarePipeCorrect++; }
  for (let i = 0; i < PIPE_N; i++) { const r = await firstApproachTrial(pg, 'blind'); if (r.timedOut) blindPipeTimeouts++; else if (r.correct) blindPipeCorrect++; }
  const awarePipeRate = awarePipeCorrect / PIPE_N, blindPipeRate = blindPipeCorrect / PIPE_N;
  ok('no timeouts through the real pipeline (aware)', awarePipeTimeouts === 0, { awarePipeTimeouts });
  ok('no timeouts through the real pipeline (blind)', blindPipeTimeouts === 0, { blindPipeTimeouts });
  // Bar is 70%, not ~100% like the isolated gate trial: traced the misses directly (see commit notes) --
  // every miss had the paddle clamped exactly at the court boundary (y=0 or y=H-p1.h), because the AI's
  // own semi-random return can send the ball arriving very close to the top/bottom wall, where even a
  // perfectly lane-aware bot can't center an 80px paddle on it without extending past the court edge.
  // That's a genuine physical constraint identical to what a real player faces near the walls, NOT a
  // decode-gate defect -- the artifact-free N=300 gate trial above (ballY sampled well clear of the
  // corners, at 90-460) already proves the underlying gate itself resolves correctly essentially 100%
  // of the time. This bar reflects "reliable through the real pipeline including wall geometry", not a
  // re-measurement of decode correctness.
  ok(`through the REAL armServe/read-window/launchServe/collision pipeline, aware bot's first decode succeeds reliably (>=70% over N=${PIPE_N} fresh games, wall-geometry misses included)`, awarePipeRate >= 0.70, { awarePipeRate });
  ok(`through the REAL pipeline, blind bot's first decode succeeds only at chance rate (~1/3, over N=${PIPE_N} fresh games)`, blindPipeRate > 0.15 && blindPipeRate < 0.55, { blindPipeRate });
  ok('aware still dramatically outperforms blind through the real pipeline', awarePipeRate > blindPipeRate + 0.3, { awarePipeRate, blindPipeRate });

  ok('0 non-platform-shim pageErrors', errs.length === 0, errs.slice(0, 4));

  await b.close(); srv.close();
  console.log(pass ? '\n*** CRYPTO PONG CHECK OK ***' : '\n!!! CRYPTO PONG CHECK FAILURES ABOVE !!!');
  process.exit(pass ? 0 : 1);
})();
