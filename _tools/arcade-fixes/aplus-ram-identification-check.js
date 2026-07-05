#!/usr/bin/env node
// aplus-ram-identification-check.js -- regression gate for the CompTIA A+ Core 1
// "RAM Identification Lab" after its rebuild from a 6-question, 4-option multiple-choice
// quiz (checkAnswer(i), correct answer always index 0, "always click first" scored 6/6) into
// a real "decode the module, match it to the system" engine. The rebuild's whole point is that
// the student must READ a candidate RAM module's printed specs (PC-label, form factor,
// capacity, ECC chip count), DECODE the label into a real DDR generation/speed via the JEDEC
// table (A+ 220-1101 obj 3.2: PC4-25600 = DDR4-3200, etc.), and SELECT the module(s) that
// satisfy a stated system requirement (generation, DIMM vs SO-DIMM, minimum speed, capacity
// target, matched-pair dual-channel, ECC support). There is NO .correct flag anywhere in the
// candidate data -- grading is 100% attribute-driven (evaluateSelection() decodes each selected
// module and compares it against the scenario's own requirement fields), so nothing is gameable
// by clicking a fixed position.
//
// It loads the real lab HTML headless (no build step -- same file served to students), stubs
// AccessGuard/AchievementManager/ModuleProgress/HexAIButton the same way
// aplus-dns-config-check.js does, and drives the real window.__ramLab test hook, which forwards
// every call into the SAME functions the on-page module cards/buttons call (toggleSelect,
// confirmInstallation, resetSelection, nextScenario, completeLab).
//
// Assertions:
//   1. Hook + content structure: window.__ramLab present with the full method surface; 6
//      scenarios; every candidate label is a real JEDEC PC-label; every scenario has EXACTLY
//      ONE correct candidate combination (discovered generically via the real evaluateSelection
//      function over all C(n,k) subsets -- never hardcoded ids in this harness).
//   2. CORRECT playthrough: for all 6 scenarios, select the (generically-discovered) correct
//      combination, confirm, and verify passed=true each time, solved reaches 6/6, isComplete()
//      is true, and ModuleProgress.complete fires EXACTLY ONCE with signature
//      ('forge', 'forge-ram-identification', {returnUrl: '../index.html'}).
//   3. WRONG-configuration playthrough on a fresh load: wrong form factor, wrong generation,
//      wrong ECC, insufficient capacity, and a mismatched "pair" (right total capacity, wrong
//      matched-pair speed) each on a different scenario, all must grade passed=false, and
//      isComplete()/mpCalls must never fire.
//   4. DIRECT-CALL BYPASS: completeLab(), nextScenario(), confirmInstallation() with an empty
//      selection, and toggleSelect()/resetSelection() on a LOCKED (solved) scenario are all
//      called directly out of order and must be no-ops.
//   5. Render-order shuffle: getRenderedOrder() across repeated goTo() reloads of the same
//      scenario is NOT identical every time, and the correct module's on-screen index is not
//      fixed at 0 across those reloads (no fixed-position correct answer).
//   6. Rendered wrong-path feedback text is captured for several distinct requirement/status
//      combinations and asserted to be scenario/module-aware (mentions the actual codename,
//      label, or numbers involved) rather than one fixed string blindly reused where it could
//      be false; two distinct wrong cases render DIFFERENT text.
//   7. Style/integrity: 0 emoji, 0 em-dash, back-link present, ModuleProgress.js include
//      present, exactly one ModuleProgress.complete call site, 0 non-platform-shim pageErrors.
//
// Usage: node _tools/arcade-fixes/aplus-ram-identification-check.js   (exit 0 = pass)
const http = require('http'), fs = require('fs'), path = require('path');
const pup = require('puppeteer');
const APP = path.resolve(__dirname, '../../_app');
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.css': 'text/css', '.webp': 'image/webp', '.png': 'image/png', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.woff': 'font/woff' };
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
let pass = true;
const ok = (n, c, e) => { if (!c) pass = false; console.log('  ' + (c ? 'PASS' : 'FAIL') + '  ' + n + (e !== undefined ? '  ' + JSON.stringify(e).slice(0, 400) : '')); };

const LAB_URL_PATH = '/houses/forge/applets/comptia-aplus/core-1/labs/forge-ram-identification.lab.html';

// Static server rooted at _app so the lab + its component scripts load same-origin.
const srv = http.createServer((q, s) => {
  let p = decodeURIComponent(q.url.split('?')[0]); let fp = path.join(APP, p);
  if (fs.existsSync(fp) && fs.statSync(fp).isFile()) { s.writeHead(200, { 'Content-Type': MIME[path.extname(fp)] || 'application/octet-stream' }); fs.createReadStream(fp).pipe(s); }
  else { s.writeHead(404); s.end('nf'); }
});

// Creates a fresh page with AccessGuard/AchievementManager/HexAIButton neutralized (so init
// cannot redirect or throw) and ModuleProgress.complete specifically instrumented (not just
// no-op'd) so we can PROVE it fires on a correct full playthrough and does NOT fire otherwise.
// Same interception technique as aplus-dns-config-check.js.
async function newStubbedPage(browser) {
  const pg = await browser.newPage();
  const errs = [];
  pg.on('pageerror', e => { const m = String(e.message); if (!/firebase|firestore|auth\/|AccessGuard|not authenticated|AchievementManager|ModuleProgress|GameTracker|GameScoreboard/i.test(m)) errs.push(m.slice(0, 300)); });
  pg.on('console', msg => { if (msg.type() === 'error') { const t = msg.text(); if (!/firebase|firestore/i.test(t)) errs.push('console.error: ' + t.slice(0, 300)); } });
  await pg.setRequestInterception(true);
  pg.on('request', r => {
    const u = r.url();
    if (u.endsWith('/components/AccessGuard.js')) {
      r.respond({ status: 200, contentType: 'text/javascript', body: 'window.AccessGuard={require:function(){return true;},requireAll:function(){return true;},requireAny:function(){return true;}};' });
    } else if (u.endsWith('/components/AchievementManager.js')) {
      r.respond({ status: 200, contentType: 'text/javascript', body: 'window.AchievementManager=new Proxy({},{get:function(){return function(){};}});' });
    } else if (u.endsWith('/components/ModuleProgress.js')) {
      r.respond({ status: 200, contentType: 'text/javascript', body:
        'window.__mpCalls=[];' +
        'window.ModuleProgress={complete:function(house,mod,opts){window.__mpCalls.push([house,mod,opts]);},isCompleted:function(){return false;}};'
      });
    } else if (u.endsWith('/_lib/HexAIButton.js')) {
      r.respond({ status: 200, contentType: 'text/javascript', body: '' });
    } else {
      r.continue();
    }
  });
  return { pg, errs };
}

(async () => {
  await new Promise(r => srv.listen(0, r)); const port = srv.address().port;
  const b = await pup.launch({ headless: 'new', args: ['--no-sandbox'] });

  // ── Load + hook presence + content-consistency checks ───────────────────
  const { pg: pg0, errs: errs0 } = await newStubbedPage(b);
  await pg0.goto('http://localhost:' + port + LAB_URL_PATH, { waitUntil: 'domcontentloaded', timeout: 20000 }).catch(() => {});
  await sleep(400);

  const hookInfo = await pg0.evaluate(() => ({
    have: typeof window.__ramLab === 'object',
    fns: window.__ramLab ? Object.keys(window.__ramLab) : [],
    scenarioCount: window.__ramLab ? window.__ramLab.scenarioCount : 0
  }));
  ok('window.__ramLab test hook present (script parsed + ran fully)',
    hookInfo.have && ['getScenario', 'goTo', 'toggleSelect', 'getSelected', 'submit', 'getLastResult', 'getSolvedCount', 'isComplete', 'next', 'complete', 'getRenderedOrder'].every(k => hookInfo.fns.includes(k)),
    hookInfo);
  ok('6 scenarios present', hookInfo.scenarioCount === 6, hookInfo.scenarioCount);

  // Combination search helper + content-integrity check: every scenario's candidate labels
  // decode to a real JEDEC entry, and EXACTLY ONE candidate combination of the scenario's own
  // moduleCount actually passes evaluateSelection -- discovered generically, never hardcoded.
  const contentCheck = await pg0.evaluate(() => {
    function combinations(arr, k) {
      const result = [];
      (function helper(start, combo) {
        if (combo.length === k) { result.push(combo.slice()); return; }
        for (let i = start; i < arr.length; i++) { combo.push(arr[i]); helper(i + 1, combo); combo.pop(); }
      })(0, []);
      return result;
    }
    const issues = [];
    const correctCombos = [];
    scenarios.forEach((s, i) => {
      if (!Array.isArray(s.candidates) || s.candidates.length < s.moduleCount + 2) issues.push('scenario ' + i + ' has too few candidates for depth');
      s.candidates.forEach(c => {
        if (!decodeLabel(c.label)) issues.push('scenario ' + i + ' candidate ' + c.id + ' has an unrecognized JEDEC label ' + c.label);
      });
      const ids = s.candidates.map(c => c.id);
      const combos = combinations(ids, s.moduleCount);
      const passing = combos.filter(combo => evaluateSelection(s, combo).passed);
      if (passing.length !== 1) issues.push('scenario ' + i + ' has ' + passing.length + ' passing combinations (expected exactly 1)');
      correctCombos.push(passing[0] || null);
    });
    return { issues, correctCombos };
  });
  ok('all 6 scenarios have well-formed candidates with real JEDEC labels and EXACTLY ONE correct combination', contentCheck.issues.length === 0, contentCheck.issues);
  ok('0 non-firebase pageErrors after load', errs0.length === 0, errs0.slice(0, 4));
  const correctCombos = contentCheck.correctCombos;
  await pg0.close();

  // ── Scripted CORRECT playthrough: every scenario configured with the (generically
  // discovered, never hardcoded here) correct combination, across a fresh page load. ────────
  const { pg: pgC, errs: errsC } = await newStubbedPage(b);
  await pgC.goto('http://localhost:' + port + LAB_URL_PATH, { waitUntil: 'domcontentloaded', timeout: 20000 }).catch(() => {});
  await sleep(400);

  const correctRun = await pgC.evaluate((combos) => {
    const results = [];
    for (let i = 0; i < window.__ramLab.scenarioCount; i++) {
      window.__ramLab.goTo(i);
      combos[i].forEach(id => window.__ramLab.toggleSelect(id));
      const passed = window.__ramLab.submit();
      results.push({ i, passed, selected: window.__ramLab.getSelected() });
    }
    const completeReturn = window.__ramLab.complete();
    return { results, solvedCount: window.__ramLab.getSolvedCount(), complete: window.__ramLab.isComplete(), completeReturn, mpCalls: window.__mpCalls };
  }, correctCombos);

  ok('every scenario grades passed=true when configured with its own generically-discovered correct combination', correctRun.results.every(r => r.passed), correctRun.results.filter(r => !r.passed));
  ok('solved count reaches 6/6 after the correct playthrough', correctRun.solvedCount === 6, correctRun.solvedCount);
  ok('isComplete() reports true after all 6 scenarios solved', correctRun.complete === true, correctRun.complete);
  ok('window.__ramLab.complete() (completeLab) returns true once all 6 scenarios are genuinely solved', correctRun.completeReturn === true, correctRun.completeReturn);
  ok('ModuleProgress.complete fired exactly once on full correct completion', correctRun.mpCalls.length === 1, correctRun.mpCalls);
  if (correctRun.mpCalls.length >= 1) {
    const [house, mod, opts] = correctRun.mpCalls[0];
    ok('ModuleProgress.complete signature preserved exactly: (\'forge\', \'forge-ram-identification\', {returnUrl: \'../index.html\'})',
      house === 'forge' && mod === 'forge-ram-identification' && opts && opts.returnUrl === '../index.html',
      correctRun.mpCalls[0]);
  }
  ok('0 non-firebase pageErrors during correct playthrough', errsC.length === 0, errsC.slice(0, 4));
  await pgC.close();

  // ── Scripted WRONG-configuration playthrough on a fresh load: wrong form factor, wrong
  // generation, wrong ECC, insufficient capacity, and a capacity-satisfying-but-mismatched pair,
  // each on a different scenario. ─────────────────────────────────────────────────────────────
  const { pg: pgW, errs: errsW } = await newStubbedPage(b);
  await pgW.goto('http://localhost:' + port + LAB_URL_PATH, { waitUntil: 'domcontentloaded', timeout: 20000 }).catch(() => {});
  await sleep(400);

  const wrongRun = await pgW.evaluate(() => {
    // Case A: scenario 0 (laptop upgrade) needs a DDR4 SO-DIMM. Pick the full-size DDR4 DIMM
    // instead (wrong form factor).
    window.__ramLab.goTo(0);
    window.__ramLab.toggleSelect('s1m1');
    window.__ramLab.submit();
    const resultA = window.__ramLab.getLastResult();

    // Case B: scenario 1 (gaming desktop, DDR4-3000+) needs a fast-enough DDR4 DIMM. Pick the
    // slower PC4-19200 (DDR4-2400) instead (speed below the stated threshold).
    window.__ramLab.goTo(1);
    window.__ramLab.toggleSelect('s2m1');
    window.__ramLab.submit();
    const resultB = window.__ramLab.getLastResult();

    // Case C: scenario 4 (server, ECC required) needs an ECC DDR4 DIMM >= 32GB. Pick the
    // non-ECC PC4-21300 32GB instead (right everything else, wrong ECC).
    window.__ramLab.goTo(4);
    window.__ramLab.toggleSelect('s5m1');
    window.__ramLab.submit();
    const resultC = window.__ramLab.getLastResult();

    // Case D: scenario 3 (laptop capacity upgrade, existing 8GB + need 32GB total) needs the new
    // stick to add at least 24GB. Pick the 16GB DDR4 SO-DIMM instead (insufficient capacity:
    // 8 + 16 = 24, short of the 32GB target).
    window.__ramLab.goTo(3);
    window.__ramLab.toggleSelect('s4m3');
    window.__ramLab.submit();
    const resultD = window.__ramLab.getLastResult();

    // Case E: scenario 5 (workstation, matched pair, 64GB, max 32GB/slot) needs two matched
    // DDR4-3200 32GB sticks. Pick one correct stick (s6m1) plus the DDR4-2400 32GB stick (s6m5):
    // total capacity is right (64GB) but the pair is NOT matched (different decoded speeds).
    window.__ramLab.goTo(5);
    window.__ramLab.toggleSelect('s6m1');
    window.__ramLab.toggleSelect('s6m5');
    window.__ramLab.submit();
    const resultE = window.__ramLab.getLastResult();

    return {
      resultA, resultB, resultC, resultD, resultE,
      solvedCount: window.__ramLab.getSolvedCount(),
      complete: window.__ramLab.isComplete(),
      mpCalls: window.__mpCalls
    };
  });

  ok('Case A (full-size DIMM where SO-DIMM is required) grades passed=false', wrongRun.resultA.passed === false, wrongRun.resultA);
  ok('Case B (DDR4-2400 where DDR4-3000+ is required) grades passed=false', wrongRun.resultB.passed === false, wrongRun.resultB);
  ok('Case C (non-ECC where ECC is required) grades passed=false', wrongRun.resultC.passed === false, wrongRun.resultC);
  ok('Case D (insufficient added capacity: 8+16=24 short of 32GB target) grades passed=false', wrongRun.resultD.passed === false, wrongRun.resultD);
  ok('Case E (right total capacity, mismatched pair speed) grades passed=false', wrongRun.resultE.passed === false, wrongRun.resultE);
  ok('solved count stays 0 across all five wrong configurations', wrongRun.solvedCount === 0, wrongRun.solvedCount);
  ok('isComplete() stays false after only wrong configurations', wrongRun.complete === false, wrongRun.complete);
  ok('ModuleProgress.complete NEVER fires on a wrong-configuration run', wrongRun.mpCalls.length === 0, wrongRun.mpCalls);
  ok('0 non-firebase pageErrors during wrong playthrough', errsW.length === 0, errsW.slice(0, 4));

  // Capture rendered wrong-path feedback and assert it is module/requirement-aware, not one
  // fixed string reused across distinct wrong cases. loadScenario() restores each scenario's OWN
  // stored lastResult report on navigation, so explicitly go back to each scenario before
  // reading its report text.
  await pgW.evaluate(() => window.__ramLab.goTo(0));
  const feedbackA = await pgW.evaluate(() => document.getElementById('reportPanel').innerText);
  await pgW.evaluate(() => window.__ramLab.goTo(1));
  const feedbackB = await pgW.evaluate(() => document.getElementById('reportPanel').innerText);
  await pgW.evaluate(() => window.__ramLab.goTo(4));
  const feedbackC = await pgW.evaluate(() => document.getElementById('reportPanel').innerText);
  await pgW.evaluate(() => window.__ramLab.goTo(5));
  const feedbackE = await pgW.evaluate(() => document.getElementById('reportPanel').innerText);

  ok('Case A feedback names the actual module and mentions the real DIMM/SO-DIMM mismatch', /RAM-A1/.test(feedbackA) && /SO-DIMM/.test(feedbackA) && /DIMM/.test(feedbackA), feedbackA.slice(0, 300));
  ok('Case B feedback names the actual module and its real decoded speed (DDR4-2400) against the stated 3000 MT/s minimum', /RAM-B1/.test(feedbackB) && /2400/.test(feedbackB) && /3000/.test(feedbackB), feedbackB.slice(0, 300));
  ok('Case C feedback names the actual module and explains the real ECC/chip-count distinction', /RAM-E1/.test(feedbackC) && /ECC/.test(feedbackC) && /chips per side/.test(feedbackC), feedbackC.slice(0, 300));
  ok('Case E feedback names both actual modules and explains the real matched-pair speed mismatch', /RAM-F1/.test(feedbackE) && /RAM-F5/.test(feedbackE) && /speed/.test(feedbackE), feedbackE.slice(0, 300));
  ok('Case A and Case B rendered feedback text differ (module-aware, not one hardcoded string)', feedbackA !== feedbackB, { feedbackA: feedbackA.slice(0, 120), feedbackB: feedbackB.slice(0, 120) });
  ok('Case C and Case E rendered feedback text differ (module-aware, not one hardcoded string)', feedbackC !== feedbackE, { feedbackC: feedbackC.slice(0, 120), feedbackE: feedbackE.slice(0, 120) });
  await pgW.close();

  // ── Render-order shuffle: repeated goTo() reloads of the SAME scenario must not always
  // render candidates in the same order, and the correct module's index must not be pinned
  // at 0 every time (no fixed-position correct answer). ───────────────────────────────────────
  const { pg: pgS, errs: errsS } = await newStubbedPage(b);
  await pgS.goto('http://localhost:' + port + LAB_URL_PATH, { waitUntil: 'domcontentloaded', timeout: 20000 }).catch(() => {});
  await sleep(400);

  const shuffleRun = await pgS.evaluate((correctCombo) => {
    const orders = [];
    const correctIndices = [];
    for (let n = 0; n < 10; n++) {
      window.__ramLab.goTo(0); // re-render (fresh shuffle) each call, even though already scenario 0
      const order = window.__ramLab.getRenderedOrder(0);
      orders.push(order.join(','));
      correctIndices.push(order.indexOf(correctCombo[0]));
    }
    return { distinctOrders: new Set(orders).size, correctIndices };
  }, correctCombos[0]);
  ok('10 reloads of scenario 0 produce more than one distinct render order (Fisher-Yates shuffle is live)', shuffleRun.distinctOrders > 1, shuffleRun.distinctOrders);
  ok('the correct module\'s rendered index is NOT fixed at 0 across all 10 reloads', !shuffleRun.correctIndices.every(i => i === 0), shuffleRun.correctIndices);
  ok('0 non-firebase pageErrors during shuffle probe', errsS.length === 0, errsS.slice(0, 4));
  await pgS.close();

  // ── DIRECT-CALL BYPASS: every advance/submit/complete handler is called directly, out of
  // order, on a fresh load, and must be a no-op. ──────────────────────────────────────────────
  const { pg: pgB, errs: errsB } = await newStubbedPage(b);
  await pgB.goto('http://localhost:' + port + LAB_URL_PATH, { waitUntil: 'domcontentloaded', timeout: 20000 }).catch(() => {});
  await sleep(400);

  const bypassRun = await pgB.evaluate(() => {
    // completeLab() called directly with NOTHING solved.
    const completeAttempt = window.completeLab();
    const afterCompleteAttempt = { returned: completeAttempt, mpCalls: window.__mpCalls.length, resultsShown: document.getElementById('resultsSection').classList.contains('show') };

    // nextScenario() called directly before the current (first) scenario is solved.
    const nextAttempt = window.nextScenario();
    const afterNextAttempt = { returned: nextAttempt, currentScenario: window.__ramLab.getCurrent() };

    // confirmInstallation() called directly with an EMPTY selection (nothing toggled).
    const emptySubmit = window.confirmInstallation();
    const afterEmptySubmit = { returned: emptySubmit, passed: window.__ramLab.getLastResult().passed, solvedCount: window.__ramLab.getSolvedCount() };

    return { afterCompleteAttempt, afterNextAttempt, afterEmptySubmit, mpCallsSoFar: window.__mpCalls.length };
  });
  ok('window.completeLab() called directly with 0 scenarios solved returns false and never fires ModuleProgress.complete', bypassRun.afterCompleteAttempt.returned === false && bypassRun.afterCompleteAttempt.mpCalls === 0, bypassRun.afterCompleteAttempt);
  ok('window.completeLab() called directly with 0 scenarios solved does not show the results section', bypassRun.afterCompleteAttempt.resultsShown === false, bypassRun.afterCompleteAttempt);
  ok('window.nextScenario() called before the current scenario is solved returns false (no-op, stays on scenario 0)', bypassRun.afterNextAttempt.returned === false && bypassRun.afterNextAttempt.currentScenario === 0, bypassRun.afterNextAttempt);
  ok('window.confirmInstallation() with an empty selection grades passed=false without throwing, and solved count stays 0', bypassRun.afterEmptySubmit.passed === false && bypassRun.afterEmptySubmit.solvedCount === 0, bypassRun.afterEmptySubmit);
  ok('none of the direct-call bypass attempts ever fired ModuleProgress.complete', bypassRun.mpCallsSoFar === 0, bypassRun.mpCallsSoFar);

  // Now solve scenario 0 for real (using the generically-discovered correct combo), then attempt
  // to bypass its lock via direct calls.
  const lockBypassRun = await pgB.evaluate((correctCombo) => {
    correctCombo.forEach(id => window.toggleSelect(id));
    window.confirmInstallation();
    const solvedAfterRealDeploy = window.__ramLab.getSolvedCount();
    const selectionBeforeBypass = window.__ramLab.getSelected().slice();

    // Scenario 0 is now locked (solved). Direct calls to toggle/reset must all refuse.
    const toggleWhileLocked = window.toggleSelect('s1m1'); // a DIFFERENT module than the solved combo
    const selectionAfterLockedToggle = window.__ramLab.getSelected().slice();
    const resetWhileLocked = window.resetSelection();
    const selectionAfterLockedReset = window.__ramLab.getSelected().slice();
    const resubmitWhileLocked = window.confirmInstallation();

    return {
      solvedAfterRealDeploy, selectionBeforeBypass,
      toggleWhileLocked, selectionAfterLockedToggle,
      resetWhileLocked, selectionAfterLockedReset,
      resubmitWhileLocked,
      mpCallsAfterOneScenario: window.__mpCalls.length
    };
  }, correctCombos[0]);
  ok('scenario 0 is genuinely solved by a real correct submit (solved count becomes 1)', lockBypassRun.solvedAfterRealDeploy === 1, lockBypassRun.solvedAfterRealDeploy);
  ok('toggleSelect() on a LOCKED (solved) scenario is refused (returns false, selection unchanged)', lockBypassRun.toggleWhileLocked === false && JSON.stringify(lockBypassRun.selectionAfterLockedToggle) === JSON.stringify(lockBypassRun.selectionBeforeBypass), lockBypassRun);
  ok('resetSelection() on a LOCKED (solved) scenario is refused (returns false, selection unchanged)', lockBypassRun.resetWhileLocked === false && JSON.stringify(lockBypassRun.selectionAfterLockedReset) === JSON.stringify(lockBypassRun.selectionBeforeBypass), lockBypassRun);
  ok('confirmInstallation() called again on a LOCKED (solved) scenario is refused (returns false)', lockBypassRun.resubmitWhileLocked === false, lockBypassRun.resubmitWhileLocked);
  ok('ModuleProgress.complete still has not fired after only 1 of 6 scenarios solved', lockBypassRun.mpCallsAfterOneScenario === 0, lockBypassRun.mpCallsAfterOneScenario);
  ok('0 non-firebase pageErrors during direct-call bypass probe', errsB.length === 0, errsB.slice(0, 4));
  await pgB.close();

  // ════════════════════════════════════════════════════════════════════
  // STYLE + INTEGRITY CHECKS on the rendered page source
  // ════════════════════════════════════════════════════════════════════
  console.log('\n=== Style + platform integrity checks ===');
  const source = fs.readFileSync(path.join(APP, LAB_URL_PATH), 'utf8');
  const emojiRe = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu;
  ok('0 emoji characters in the source', (source.match(emojiRe) || []).length === 0, (source.match(emojiRe) || []).length);
  ok('0 em-dash characters in the source', !source.includes('—'));
  ok('back-link to the Expansion & Storage chapter present', source.includes('Back to Expansion &amp; Storage Chapter'.replace('&amp;', '&')) || source.includes('Back to Expansion & Storage Chapter'));
  ok('ModuleProgress.js include present', source.includes('components/ModuleProgress.js'));
  ok('exactly one ModuleProgress.complete call site in the source', (source.match(/ModuleProgress\.complete\(/g) || []).length === 1, (source.match(/ModuleProgress\.complete\(/g) || []).length);
  ok('no raw checkmark/cross glyphs remain (webp icons used instead)', !/[✓✔✕✖✗✘]/.test(source));
  ok('no .correct flag anywhere in candidate/module data (attribute-driven grading only)', !/\bcorrect\s*:\s*(true|false)/.test(source), (source.match(/\bcorrect\s*:\s*(true|false)/g) || []));

  await b.close(); srv.close();
  console.log(pass ? '\n*** APLUS RAM IDENTIFICATION CHECK OK ***' : '\n!!! APLUS RAM IDENTIFICATION CHECK FAILURES ABOVE !!!');
  process.exit(pass ? 0 : 1);
})();
