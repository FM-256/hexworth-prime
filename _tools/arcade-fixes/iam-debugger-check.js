#!/usr/bin/env node
// iam-debugger-check.js — hands-on-mechanic verification for the IAM Policy Debugger rewrite.
//
// cloud-iam-debugger.html was converted from a 3-option "spot the fix" multiple-choice quiz into
// a real policy analyzer: the player edits the broken IAM policy JSON directly in a textarea, and
// a real evaluatePolicy() engine re-grades every round's test cases against whatever the player
// typed. This harness proves the mechanic is actually hands-on and actually honest, per round:
//
//   (a) the initial BROKEN policy fails its own test table (there's a real bug to find)
//   (b) applying the round's intendedFixPolicy (full reference policy, stored on the page-global
//       `rounds` array but never shown to the player) makes ALL tests pass (a real fix exists and
//       is reachable through the textarea)
//   (c) a maximally over-permissive policy (Principal:"*", Action:"*", Resource:"*", no Condition)
//       does NOT pass — least privilege is actually enforced, not just cosmetically checked
//   (d) the game is completable end-to-end (all 10 rounds solvable via the intendedFixPolicy path,
//       scoring updates, and the completion screen renders)
//   (e) 0 non-firebase pageErrors across the whole run
//
// Usage: node _tools/arcade-fixes/iam-debugger-check.js   (exit 0 = pass)
const http = require('http'), fs = require('fs'), path = require('path');
const pup = require('puppeteer');
const APP = path.resolve(__dirname, '../../_app');
const GAME_URL = '/houses/cloud/games/cloud-iam-debugger.html';
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.css': 'text/css', '.webp': 'image/webp', '.png': 'image/png', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.woff': 'font/woff' };
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
let pass = true;
const ok = (n, c, e) => { if (!c) pass = false; console.log('  ' + (c ? 'PASS' : 'FAIL') + '  ' + n + (e !== undefined ? '  ' + JSON.stringify(e).slice(0, 300) : '')); };

// The over-permissive "cheese" policy used for the least-privilege check (c). Under the real
// evaluatePolicy() engine this unconditionally matches every statement check (no Condition to
// gate it), so it must flip every round's Deny-expected test rows to Allow and fail the round.
const CHEESE_POLICY = { Version: '2012-10-17', Statement: [{ Effect: 'Allow', Principal: '*', Action: '*', Resource: '*' }] };

// Static file server rooted at _app so the game + its component scripts load same-origin.
const srv = http.createServer((q, s) => {
  let p = decodeURIComponent(q.url.split('?')[0]); let fp = path.join(APP, p);
  if (fs.existsSync(fp) && fs.statSync(fp).isFile()) { s.writeHead(200, { 'Content-Type': MIME[path.extname(fp)] || 'application/octet-stream' }); fs.createReadStream(fp).pipe(s); }
  else { s.writeHead(404); s.end('nf'); }
});

// setPolicyAndRun: types `policyObj` into the #policyEditor textarea and clicks #runBtn, returning
// the live pass/fail state read straight off the rendered table (not re-implementing the grader).
async function setPolicyAndRun(pg, policyObj) {
  await pg.evaluate((json) => {
    const ta = document.getElementById('policyEditor');
    ta.value = json;
  }, JSON.stringify(policyObj, null, 2));
  await pg.click('#runBtn');
  await sleep(120);
  return pg.evaluate(() => {
    const rows = Array.from(document.querySelectorAll('#testResults tbody tr'));
    const results = rows.map(r => {
      const cells = r.querySelectorAll('td');
      return { live: cells[4] ? cells[4].textContent.trim() : null, expected: cells[5] ? cells[5].textContent.trim() : null, matchIcon: cells[6] ? cells[6].textContent.trim() : '' };
    });
    const allPass = results.length > 0 && results.every(r => r.matchIcon === '✓');
    return { results, allPass, jsonErrorShown: document.getElementById('jsonError').style.display !== 'none' };
  });
}

(async () => {
  await new Promise(r => srv.listen(0, r)); const port = srv.address().port;
  const b = await pup.launch({ headless: 'new', args: ['--no-sandbox'] });
  const pg = await b.newPage();
  const errs = [];
  pg.on('pageerror', e => { const m = String(e.message); if (!/firebase|firestore|auth\/|not authenticated/i.test(m)) errs.push(m.slice(0, 200)); });
  pg.on('console', msg => { if (msg.type() === 'error') { const t = msg.text(); if (!/firebase|firestore/i.test(t)) errs.push(('console.error: ' + t).slice(0, 200)); } });

  // Stub AccessGuard so the AccessGuard.require('sorted') gate on this page doesn't redirect us
  // away before the game renders — same pattern as cockpit-render-check.js's auth stubs.
  await pg.setRequestInterception(true);
  pg.on('request', r => {
    const u = r.url();
    if (u.endsWith('/components/AccessGuard.js')) r.respond({ status: 200, contentType: 'text/javascript', body: 'window.AccessGuard = { require: function(){} };' });
    else r.continue();
  });

  await pg.goto('http://localhost:' + port + GAME_URL, { waitUntil: 'domcontentloaded', timeout: 20000 });
  await sleep(300);

  // How-to-play layer (2026-08-02): a first visit (empty localStorage) must show the intro
  // overlay, and Start must dismiss it. Later navigations in this same context assert the
  // seen-flag suppresses it (checked implicitly: the playthrough below would fail to click
  // buttons under a stuck overlay only if it also intercepted programmatic clicks — so the
  // explicit assertions here are the real check).
  const introState = await pg.evaluate(() => {
    const overlay = document.getElementById('introOverlay');
    const hadIntro = !!overlay;
    const startBtn = document.getElementById('startBtn');
    if (startBtn) startBtn.click();
    return { hadIntro, goneAfterStart: !document.getElementById('introOverlay') };
  });
  ok('intro overlay shows on first visit', introState.hadIntro, introState);
  ok('Start Debugging dismisses the intro', introState.goneAfterStart, introState);

  const meta = await pg.evaluate(() => ({
    // `rounds` is a top-level `const` inside the page's inline <script>, so it's a bare global
    // binding (not a `window` property) — read it directly, the way any other script tag on the
    // same page would. `typeof` is safe even if the name were unbound.
    roundCount: typeof rounds !== 'undefined' ? rounds.length : 0,
    hasEvaluatePolicy: typeof evaluatePolicy === 'function',
    hasRunTests: typeof runTests === 'function',
  }));
  ok('page parsed: rounds has 10 rounds', meta.roundCount === 10, meta.roundCount);
  ok('evaluatePolicy() and runTests() are defined (script ran fully)', meta.hasEvaluatePolicy && meta.hasRunTests, meta);

  const roundsData = await pg.evaluate(() => rounds.map(r => ({ title: r.title, policy: r.policy, intendedFixPolicy: r.intendedFixPolicy })));

  // ---- (a) broken policy fails, (b) intended fix passes, (c) cheese fails — per round ----
  for (let i = 0; i < roundsData.length; i++) {
    const r = roundsData[i];
    // Navigate to this round by advancing currentRound directly and re-rendering (fast + exact —
    // avoids relying on the Next-Round click chain, which requirement (d) exercises separately).
    await pg.evaluate((idx) => { currentRound = idx; renderRound(); }, i);
    await sleep(80);

    // Order matters: once a policy makes ALL tests pass, the UI relabels #runBtn to "Next Round"
    // and swaps its click handler to advance the round instead of re-running tests. So the
    // intendedFix (the one check expected to fully pass) must run LAST in this round's checks —
    // each loop iteration re-renders a fresh round anyway via renderRound() above.
    const broken = await setPolicyAndRun(pg, r.policy);
    ok(`[R${i + 1}] broken policy FAILS its test table`, broken.allPass === false, { title: r.title, results: broken.results });

    const cheese = await setPolicyAndRun(pg, CHEESE_POLICY);
    ok(`[R${i + 1}] over-permissive Allow-*-*-* does NOT pass (least privilege enforced)`, cheese.allPass === false, { title: r.title, results: cheese.results });

    const fixed = await setPolicyAndRun(pg, r.intendedFixPolicy);
    ok(`[R${i + 1}] intendedFixPolicy makes ALL tests pass`, fixed.allPass === true, { title: r.title, results: fixed.results });
  }

  // ---- (d) game is completable end-to-end via the real Next-Round button chain ----
  // Reload for a clean single playthrough: the per-round checks above already ran real scoring
  // passes (10x) on this same page/session, so totalScore is already non-zero going in. A fresh
  // navigation resets currentRound/totalScore to their page-load values so the completion score
  // reported below reflects exactly one 10-round run, not two stacked runs.
  await pg.goto('http://localhost:' + port + GAME_URL, { waitUntil: 'domcontentloaded', timeout: 20000 });
  await sleep(300);
  ok('intro overlay suppressed on revisit (seen-flag honored)',
     await pg.evaluate(() => !document.getElementById('introOverlay')), null);
  for (let i = 0; i < 10; i++) {
    const r = await pg.evaluate((idx) => rounds[idx].intendedFixPolicy, i);
    const res = await setPolicyAndRun(pg, r);
    if (!res.allPass) { ok(`[completability] round ${i + 1} intendedFix passes mid-playthrough`, false, res.results); break; }
    const scoreAfter = await pg.evaluate(() => document.getElementById('scoreDisplay').textContent);
    if (i === 0) ok('score updates after first pass', Number(scoreAfter) > 0, scoreAfter);
    await pg.click('#runBtn'); // clicks the now-relabeled Next Round / View Results button
    await sleep(150);
  }
  const completion = await pg.evaluate(() => ({
    hasCompletionTitle: !!document.querySelector('.completion-title'),
    finalScoreText: (document.querySelector('.final-score') || {}).textContent || '',
    scoreboardXp: localStorage.getItem('game_iam_xp_awarded')
  }));
  ok('completion screen rendered after 10 rounds (game is completable)', completion.hasCompletionTitle, completion);
  ok('XP awarded exactly once on completion', completion.scoreboardXp === 'true', completion.scoreboardXp);

  // ---- (e) 0 pageErrors across the whole run ----
  ok('0 non-firebase pageErrors/console-errors for the whole run', errs.length === 0, errs.slice(0, 6));

  await b.close(); srv.close();
  console.log(pass ? '\n*** IAM DEBUGGER CHECK OK ***' : '\n!!! IAM DEBUGGER CHECK FAILURES ABOVE !!!');
  process.exit(pass ? 0 : 1);
})();
