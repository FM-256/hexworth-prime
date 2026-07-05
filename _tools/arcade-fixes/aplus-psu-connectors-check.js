#!/usr/bin/env node
// aplus-psu-connectors-check.js: regression gate for the CompTIA A+ Core 1 "PSU Connector
// Identification Lab" after its rebuild from a 4-option pick-the-answer quiz (selectOption(),
// data-correct attribute, options shuffled but still labeled multiple-choice) into a real
// "Power Harness Workbench" (CompTIA A+ 220-1101 objective 3.5).
//
// The rebuild's whole point: for each of 10 real build tickets the student is given ONE real part
// (a PSU connector pulled from the cable bag, or a component power input still waiting to be
// plugged in, alternating direction) plus a bin of 4 candidates, and must SORT every candidate as
// Compatible (connect) or Incompatible (reject) by reading real specs (pin count, voltage rails,
// wattage rating), not click one of 4 labeled buttons. Correctness is computed by
// evaluateCompatibilityCore()/checkCompatible() comparing real spec fields (connector.pins,
// connector.poweredComponent, trueConnectorFor(componentId).pins), never a stored ".correct" flag
// on any candidate. The rebuild's hardest trap: the 8-pin EPS12V (CPU) connector and the 8-pin
// PCIe (6+2, GPU) connector share a pin count but are keyed/wired differently ("keying" reason),
// which is distinct from every other mismatch in this lab ("pincount" reason).
//
// This loads the real lab HTML headless (no build step, same file served to students), stubs
// AccessGuard/ModuleProgress/HexAIButton the same way aplus-cpu-sockets-check.js does, and drives
// the REAL window.__psuBench test hook, which forwards every call into the SAME functions the
// on-page buttons call (decideCandidate, resetOrder, testHarness, nextOrder, completeLab).
//
// Assertions:
//   1. Hook + content structure: window.__psuBench present with the full method surface; 10
//      orders; every order's direction/targetId/candidateIds are well-formed, and exactly ONE of
//      each order's 4 candidates is genuinely compatible per checkCompatible().
//   2. CORRECT playthrough: for all 10 orders, sort every rendered candidate exactly as
//      checkCompatible() itself says (read back live, never hardcoded here), test the harness, and
//      confirm passed=true each time, solved reaches 10/10, isComplete() is true, and
//      ModuleProgress.complete fires EXACTLY ONCE with the exact preserved signature
//      ('forge', 'forge-psu-connectors', {returnUrl: '../index.html'}).
//   3. WRONG playthrough on a fresh load: sort every candidate as the OPPOSITE of what
//      checkCompatible() says on order 0: testHarness() must grade passed=false, solved stays 0,
//      and ModuleProgress.complete must never fire.
//   4. NOT-FIXED-POSITION check: across all 10 orders, read the RENDERED candidate order via
//      getRenderedCandidates() and find the index of the one genuinely compatible candidate:
//      assert these indices are not all the same/first (proves the shuffle + varied authored
//      indices actually move the correct choice around, not a disguised fixed-index MC quiz).
//   5. DIRECT-CALL BYPASS: decideCandidate()/resetOrder()/testHarness() on a LOCKED (solved) order,
//      testHarness() with an incomplete decision set, nextOrder() before the current order is
//      solved, and completeLab() before every order is solved are all called directly out of order
//      and must be no-ops.
//   6. Rendered wrong-path feedback is captured for a "pincount" mismatch and for the "keying"
//      mismatch (EPS12V vs PCIe 8-pin) separately, asserted to be pair-specific (mentions the real
//      connector names/pin counts involved), to differ from each other, and to never falsely claim
//      a genuinely-compatible connector is wrong (the honest per-candidate explanation is proven to
//      still say "is the correct connector" for the truly compatible candidate even when the
//      student marked it wrong).
//   7. Style/integrity: 0 emoji, 0 em-dash, 0 " -- " double-hyphen, back-link to the motherboards
//      chapter, back-link to Core 1, ModuleProgress.js include present, exactly one
//      ModuleProgress.complete call site, 0 non-platform-shim pageErrors.
//
// Usage: node _tools/arcade-fixes/aplus-psu-connectors-check.js   (exit 0 = pass)
const http = require('http'), fs = require('fs'), path = require('path');
const pup = require(path.resolve(__dirname, '../../node_modules/puppeteer'));
const APP = path.resolve(__dirname, '../../_app');
const LAB_URL = '/houses/forge/applets/comptia-aplus/core-1/labs/forge-psu-connectors.lab.html';
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.css': 'text/css', '.webp': 'image/webp', '.png': 'image/png', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.woff': 'font/woff' };
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
let pass = true;
const ok = (n, c, e) => { if (!c) pass = false; console.log('  ' + (c ? 'PASS' : 'FAIL') + '  ' + n + (e !== undefined ? '  ' + JSON.stringify(e).slice(0, 400) : '')); };

// Static file server rooted at _app so the lab + its component scripts load same-origin, exactly
// the file students are served (no build step).
const srv = http.createServer((q, s) => {
  let p = decodeURIComponent(q.url.split('?')[0]); let fp = path.join(APP, p);
  if (fs.existsSync(fp) && fs.statSync(fp).isFile()) { s.writeHead(200, { 'Content-Type': MIME[path.extname(fp)] || 'application/octet-stream' }); fs.createReadStream(fp).pipe(s); }
  else { s.writeHead(404); s.end('nf'); }
});

// Creates a fresh page with AccessGuard/HexAIButton neutralized (so init cannot redirect or throw)
// and ModuleProgress.complete specifically instrumented (not just no-op'd) so we can PROVE it
// fires on a correct full playthrough and does NOT fire otherwise.
async function newStubbedPage(browser) {
  const pg = await browser.newPage();
  const errs = [];
  pg.on('pageerror', e => { const m = String(e.message); if (!/firebase|firestore|auth\/|AccessGuard|not authenticated|ModuleProgress|GameTracker|GameScoreboard/i.test(m)) errs.push(m.slice(0, 300)); });
  pg.on('console', msg => { if (msg.type() === 'error') { const t = msg.text(); if (!/firebase|firestore/i.test(t)) errs.push('console.error: ' + t.slice(0, 300)); } });
  await pg.setRequestInterception(true);
  pg.on('request', r => {
    const u = r.url();
    if (u.endsWith('/components/AccessGuard.js')) {
      r.respond({ status: 200, contentType: 'text/javascript', body: 'window.AccessGuard={require:function(){return true;},requireAll:function(){return true;},requireAny:function(){return true;}};' });
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

  // ════════════════════════════════════════════════════════════════════
  // LOAD + HOOK PRESENCE + CONTENT STRUCTURE
  // ════════════════════════════════════════════════════════════════════
  console.log('\n=== Load + test hook presence + content structure ===');
  const { pg: pg0, errs: errs0 } = await newStubbedPage(b);
  await pg0.goto('http://localhost:' + port + LAB_URL, { waitUntil: 'domcontentloaded', timeout: 20000 }).catch(() => {});
  await sleep(400);

  const hookInfo = await pg0.evaluate(() => ({
    have: typeof window.__psuBench === 'object',
    fns: window.__psuBench ? Object.keys(window.__psuBench) : [],
    orderCount: window.__psuBench ? window.__psuBench.orderCount : 0
  }));
  ok('window.__psuBench test hook present (script parsed + ran fully)',
    hookInfo.have && ['getOrder', 'getCurrent', 'goTo', 'getRenderedCandidates', 'decide', 'getDecisions', 'reset', 'testHarness', 'getLastResult', 'next', 'previous', 'complete', 'getSolvedCount', 'isComplete', 'checkCompatible'].every(k => hookInfo.fns.includes(k)),
    hookInfo);
  ok('10 work orders present', hookInfo.orderCount === 10, hookInfo.orderCount);

  // Structural + "exactly one correct candidate per order" check, computed via the lab's OWN
  // checkCompatible() function, never a hardcoded A+ fact in this test.
  const contentCheck = await pg0.evaluate(() => {
    const issues = [];
    for (let i = 0; i < window.__psuBench.orderCount; i++) {
      window.__psuBench.goTo(i);
      const order = window.__psuBench.getOrder(i);
      const candidates = window.__psuBench.getRenderedCandidates();
      if (candidates.length !== 4) issues.push('order ' + i + ' does not have 4 candidates (' + candidates.length + ')');
      if (order.direction !== 'connector-to-component' && order.direction !== 'component-to-connector') issues.push('order ' + i + ' has invalid direction ' + order.direction);
      const compatCount = candidates.filter(cid => window.__psuBench.checkCompatible(order.direction, order.targetId, cid).compatible).length;
      if (compatCount !== 1) issues.push('order ' + i + ' has ' + compatCount + ' compatible candidates (expected exactly 1)');
    }
    return issues;
  });
  ok('all 10 orders are well-formed with exactly 1 genuinely compatible candidate each', contentCheck.length === 0, contentCheck);
  ok('0 non-firebase pageErrors after load', errs0.length === 0, errs0.slice(0, 4));

  // ── NOT-FIXED-POSITION check: the rendered index of the one compatible
  // candidate must vary across orders, not sit at a fixed/first index. ────
  console.log('\n=== Rendered position of the correct candidate is not fixed/first ===');
  const positions = await pg0.evaluate(() => {
    const out = [];
    for (let i = 0; i < window.__psuBench.orderCount; i++) {
      window.__psuBench.goTo(i);
      const order = window.__psuBench.getOrder(i);
      const candidates = window.__psuBench.getRenderedCandidates();
      const idx = candidates.findIndex(cid => window.__psuBench.checkCompatible(order.direction, order.targetId, cid).compatible);
      out.push(idx);
    }
    return out;
  });
  ok('every order has a locatable compatible candidate in its rendered list (no -1)', positions.every(p => p >= 0), positions);
  ok('the compatible candidate is NOT always at index 0 across the 10 rendered orders', !positions.every(p => p === 0), positions);
  ok('the compatible candidate does not sit at one single fixed index across all 10 rendered orders', new Set(positions).size > 1, positions);
  await pg0.close();

  // ════════════════════════════════════════════════════════════════════
  // SCENARIO A: CORRECT PLAYTHROUGH: all 10 orders sorted exactly per the
  // lab's own checkCompatible(), reaches genuine completion.
  // ════════════════════════════════════════════════════════════════════
  console.log('\n=== Scenario A: full correct playthrough (10 orders) completes exactly once ===');
  const { pg: pgC, errs: errsC } = await newStubbedPage(b);
  await pgC.goto('http://localhost:' + port + LAB_URL, { waitUntil: 'domcontentloaded', timeout: 20000 }).catch(() => {});
  await sleep(400);

  const correctRun = await pgC.evaluate(() => {
    const results = [];
    for (let i = 0; i < window.__psuBench.orderCount; i++) {
      window.__psuBench.goTo(i);
      const order = window.__psuBench.getOrder(i);
      const candidates = window.__psuBench.getRenderedCandidates();
      candidates.forEach((cid, idx) => {
        const evalR = window.__psuBench.checkCompatible(order.direction, order.targetId, cid);
        window.__psuBench.decide(idx, evalR.compatible ? 'compatible' : 'incompatible');
      });
      const passed = window.__psuBench.testHarness();
      results.push({ i, passed, solvedNow: window.__psuBench.getSolvedCount() });
      window.__psuBench.next();
    }
    return { results, solvedCount: window.__psuBench.getSolvedCount(), complete: window.__psuBench.isComplete(), mpCalls: window.__mpCalls, current: window.__psuBench.getCurrent() };
  });

  ok('every order grades passed=true when sorted exactly per checkCompatible()', correctRun.results.every(r => r.passed), correctRun.results.filter(r => !r.passed));
  ok('solved count reaches 10/10 after the correct playthrough', correctRun.solvedCount === 10, correctRun.solvedCount);
  ok('isComplete() reports true after all 10 orders solved', correctRun.complete === true, correctRun.complete);
  ok('ModuleProgress.complete fired exactly once on full correct completion', correctRun.mpCalls.length === 1, correctRun.mpCalls);
  if (correctRun.mpCalls.length >= 1) {
    const [house, mod, opts] = correctRun.mpCalls[0];
    ok('ModuleProgress.complete signature preserved exactly: (\'forge\', \'forge-psu-connectors\', {returnUrl: \'../index.html\'})',
      house === 'forge' && mod === 'forge-psu-connectors' && opts && opts.returnUrl === '../index.html',
      correctRun.mpCalls[0]);
  }
  ok('0 non-firebase pageErrors during correct playthrough', errsC.length === 0, errsC.slice(0, 4));

  // A repeated post-completion call must not fire a second completion.
  const doubleFireCheck = await pgC.evaluate(() => { window.__psuBench.complete(); window.__psuBench.next(); return window.__mpCalls.length; });
  ok('repeated post-completion calls do not fire a second completion', doubleFireCheck === 1, doubleFireCheck);
  await pgC.close();

  // ════════════════════════════════════════════════════════════════════
  // SCENARIO B: WRONG PLAYTHROUGH on a fresh load: every candidate on
  // order 0 sorted as the OPPOSITE of what checkCompatible() says.
  // ════════════════════════════════════════════════════════════════════
  console.log('\n=== Scenario B: wrong sort grades wrong and never completes ===');
  const { pg: pgW, errs: errsW } = await newStubbedPage(b);
  await pgW.goto('http://localhost:' + port + LAB_URL, { waitUntil: 'domcontentloaded', timeout: 20000 }).catch(() => {});
  await sleep(400);

  const wrongRun = await pgW.evaluate(() => {
    window.__psuBench.goTo(0);
    const order = window.__psuBench.getOrder(0);
    const candidates = window.__psuBench.getRenderedCandidates();
    candidates.forEach((cid, idx) => {
      const evalR = window.__psuBench.checkCompatible(order.direction, order.targetId, cid);
      // Deliberately invert every real answer.
      window.__psuBench.decide(idx, evalR.compatible ? 'incompatible' : 'compatible');
    });
    const passed = window.__psuBench.testHarness();
    const result = window.__psuBench.getLastResult();
    // Attempt to bypass straight to next/complete anyway.
    window.__psuBench.next();
    window.__psuBench.complete();
    return {
      passed, wrongCount: result.rows.filter(r => !r.correct).length,
      solved: window.__psuBench.getSolvedCount(), current: window.__psuBench.getCurrent(),
      mpCalls: window.__mpCalls.length
    };
  });
  ok('inverting every real answer grades passed=false', wrongRun.passed === false, wrongRun);
  ok('all 4 candidates graded wrong when every real answer was inverted', wrongRun.wrongCount === 4, wrongRun.wrongCount);
  ok('order 0 is NOT counted as solved after a wrong sort', wrongRun.solved === 0, wrongRun.solved);
  ok('next() after a failed harness test does not advance past order 0', wrongRun.current === 0, wrongRun.current);
  ok('ModuleProgress.complete never fires on a wrong playthrough', wrongRun.mpCalls === 0, wrongRun.mpCalls);
  ok('0 non-firebase pageErrors during wrong playthrough', errsW.length === 0, errsW.slice(0, 4));
  await pgW.close();

  // ════════════════════════════════════════════════════════════════════
  // SCENARIO C: SCENARIO-ACCURATE FEEDBACK: rendered wrong-path text for a
  // "pincount" mismatch and the "keying" trap (EPS12V vs PCIe 8-pin) must
  // be pair-specific and mutually distinct, never one fixed string reused,
  // and never falsely deny the one genuinely compatible candidate.
  // ════════════════════════════════════════════════════════════════════
  console.log('\n=== Scenario C: wrong-path feedback is pair-specific, not a reused generic string ===');
  const { pg: pgF, errs: errsF } = await newStubbedPage(b);
  await pgF.goto('http://localhost:' + port + LAB_URL, { waitUntil: 'domcontentloaded', timeout: 20000 }).catch(() => {});
  await sleep(400);

  const explanationProbe = await pgF.evaluate(() => {
    // Order 2 (0-indexed), Delacroix Budget Gaming Rig, connector-to-component on PCIE6 (6-pin):
    // every candidate component (GPU_HIGH needs PCIE8/8-pin, CPU_HEADER needs EPS8/8-pin, LEGACY
    // needs MOLEX/4-pin) is a pure pin-COUNT mismatch against this 6-pin connector. Mark every
    // candidate wrong (invert) to force pincount-reason explanations into the report.
    window.__psuBench.goTo(2);
    const order2 = window.__psuBench.getOrder(2);
    const candidates2 = window.__psuBench.getRenderedCandidates();
    candidates2.forEach((cid, idx) => {
      const evalR = window.__psuBench.checkCompatible(order2.direction, order2.targetId, cid);
      window.__psuBench.decide(idx, evalR.compatible ? 'incompatible' : 'compatible');
    });
    window.__psuBench.testHarness();
    const pincountReport = document.getElementById('buildReport').innerText;
    const pincountResult = window.__psuBench.getLastResult();

    // Order 1 (0-indexed), Ashgrove Workstation Refresh, component-to-connector on CPU_HEADER:
    // candidate PCIE8 shares 8 pins with the true EPS8 answer, which is the "keying" trap (same
    // pin count, different keying/pinout), distinct from every other mismatch in this lab. Mark
    // every candidate wrong to force the keying-reason explanation into the report.
    window.__psuBench.goTo(1);
    const order1 = window.__psuBench.getOrder(1);
    const candidates1 = window.__psuBench.getRenderedCandidates();
    candidates1.forEach((cid, idx) => {
      const evalR = window.__psuBench.checkCompatible(order1.direction, order1.targetId, cid);
      window.__psuBench.decide(idx, evalR.compatible ? 'incompatible' : 'compatible');
    });
    window.__psuBench.testHarness();
    const keyingReport = document.getElementById('buildReport').innerText;
    const keyingResult = window.__psuBench.getLastResult();

    return { pincountReport, keyingReport, pincountResult, keyingResult };
  });

  ok('pincount-mismatch order explanation mentions real pin counts (6 pins vs 8 pins)',
    /6[ -]?pin|8[ -]?pin|4[ -]?pin/i.test(explanationProbe.pincountReport), explanationProbe.pincountReport.slice(0, 300));
  ok('pincount-mismatch explanation states the real physical-fit reason ("does not physically seat")',
    /does not physically seat/i.test(explanationProbe.pincountReport), explanationProbe.pincountReport.slice(0, 300));
  ok('keying-trap (EPS12V vs PCIe 8-pin) explanation names both real connectors by name',
    /EPS12V/i.test(explanationProbe.keyingReport) && /PCIe/i.test(explanationProbe.keyingReport), explanationProbe.keyingReport.slice(0, 400));
  ok('keying-trap explanation states the real "keyed and wired differently" reason (distinct from pincount)',
    /keyed and wired differently/i.test(explanationProbe.keyingReport), explanationProbe.keyingReport.slice(0, 400));
  ok('the pincount-mismatch and keying-trap feedback texts are genuinely different (pair-specific, not one reused string)',
    explanationProbe.pincountReport !== explanationProbe.keyingReport, {
      pincount: explanationProbe.pincountReport.slice(0, 120), keying: explanationProbe.keyingReport.slice(0, 120)
    });

  // Honesty check: even though the student marked EVERY candidate wrong on both orders (including
  // the one genuinely compatible candidate, which was marked incompatible), the per-candidate
  // explanation text is computed by explainPair() from real facts only, independent of what the
  // student clicked. So the truly-compatible candidate's row must still read as truthfully correct
  // ("is the correct connector for"), proving feedback never lies to match the student's own wrong
  // decision.
  ok('the genuinely compatible candidate on the pincount order still gets an honest "is the correct connector" explanation, even though the student marked it wrong',
    (() => {
      const row = explanationProbe.pincountResult.rows.find(r => r.expected === 'compatible');
      return !!row && row.decision === 'incompatible' && /is the correct connector for/i.test(row.explanation);
    })(),
    explanationProbe.pincountResult.rows.find(r => r.expected === 'compatible'));
  ok('the genuinely compatible candidate on the keying order still gets an honest "is the correct connector" explanation, even though the student marked it wrong',
    (() => {
      const row = explanationProbe.keyingResult.rows.find(r => r.expected === 'compatible');
      return !!row && row.decision === 'incompatible' && /is the correct connector for/i.test(row.explanation);
    })(),
    explanationProbe.keyingResult.rows.find(r => r.expected === 'compatible'));

  // ════════════════════════════════════════════════════════════════════
  // SCENARIO D: DIRECT-CALL BYPASS: every advance/submit/complete handler
  // is called directly, out of order, and must be a no-op.
  // ════════════════════════════════════════════════════════════════════
  console.log('\n=== Scenario D: direct-call bypass cannot skip a required step ===');

  const bypassBefore = await pgF.evaluate(() => {
    window.__psuBench.goTo(3); // fresh, undecided order
    const beforeSolved = window.__psuBench.getSolvedCount();
    const testWithNoDecisions = window.__psuBench.testHarness(); // gate: not all 4 decided
    const nextBeforeSolved = window.__psuBench.next();           // gate: current order not solved
    window.completeLab();                                         // gate: not all orders solved
    return {
      testWithNoDecisions, nextBeforeSolved,
      currentAfter: window.__psuBench.getCurrent(),
      solvedAfter: window.__psuBench.getSolvedCount(),
      mpCalls: window.__mpCalls.length,
      unchanged: beforeSolved === window.__psuBench.getSolvedCount()
    };
  });
  ok('testHarness() with zero decisions made is a no-op (returns false)', bypassBefore.testWithNoDecisions === false, bypassBefore);
  ok('next() before the current order is solved is a no-op (stays on order 3)', bypassBefore.nextBeforeSolved === false && bypassBefore.currentAfter === 3, bypassBefore);
  ok('window.completeLab() with orders still unsolved never fires ModuleProgress.complete', bypassBefore.mpCalls === 0, bypassBefore);
  ok('solved count is unchanged by the bypass attempts', bypassBefore.unchanged, bypassBefore);

  // Partially decide order 3 (only 2 of 4 candidates), confirm testHarness() still refuses.
  const partialDecisionCheck = await pgF.evaluate(() => {
    window.__psuBench.decide(0, 'compatible');
    window.__psuBench.decide(1, 'incompatible');
    // candidates 2 and 3 left undecided
    const result = window.__psuBench.testHarness();
    return { result, solved: window.__psuBench.getSolvedCount() };
  });
  ok('testHarness() with only 2 of 4 candidates decided is refused (returns false)', partialDecisionCheck.result === false, partialDecisionCheck);
  ok('solved count unaffected by a partial-decision testHarness() attempt', partialDecisionCheck.solved === 0, partialDecisionCheck.solved);

  // Now genuinely solve order 3, then attempt every locked-order bypass directly.
  const lockBypassRun = await pgF.evaluate(() => {
    window.__psuBench.goTo(3);
    const order = window.__psuBench.getOrder(3);
    const candidates = window.__psuBench.getRenderedCandidates();
    candidates.forEach((cid, idx) => {
      const evalR = window.__psuBench.checkCompatible(order.direction, order.targetId, cid);
      window.__psuBench.decide(idx, evalR.compatible ? 'compatible' : 'incompatible');
    });
    const passed = window.__psuBench.testHarness();
    const solvedAfterRealBuild = window.__psuBench.getSolvedCount();

    // Order 3 is now LOCKED (solved). Direct calls to decide/reset/testHarness must all refuse.
    const decideWhileLocked = window.__psuBench.decide(0, 'incompatible');
    const decisionsAfterLockedDecide = window.__psuBench.getDecisions();
    const resetWhileLocked = window.__psuBench.reset();
    const testHarnessWhileLocked = window.__psuBench.testHarness();

    return {
      passed, solvedAfterRealBuild, decideWhileLocked, decisionsAfterLockedDecide,
      resetWhileLocked, testHarnessWhileLocked, mpCallsAfterOneOrder: window.__mpCalls.length
    };
  });
  ok('order 3 is genuinely solved by a real correct harness test', lockBypassRun.passed === true && lockBypassRun.solvedAfterRealBuild === 1, lockBypassRun);
  ok('decide() on a LOCKED (solved) order is refused (returns false, decisions unchanged)', lockBypassRun.decideWhileLocked === false && lockBypassRun.decisionsAfterLockedDecide.every(d => d !== null), lockBypassRun);
  ok('reset() on a LOCKED (solved) order is refused (returns false)', lockBypassRun.resetWhileLocked === false, lockBypassRun.resetWhileLocked);
  ok('testHarness() on a LOCKED (solved) order is refused (returns false, no double-grading)', lockBypassRun.testHarnessWhileLocked === false, lockBypassRun.testHarnessWhileLocked);
  ok('ModuleProgress.complete still has not fired after only 1 of 10 orders solved', lockBypassRun.mpCallsAfterOneOrder === 0, lockBypassRun.mpCallsAfterOneOrder);
  ok('0 non-firebase pageErrors during direct-call bypass probe', errsF.length === 0, errsF.slice(0, 4));
  await pgF.close();

  // ════════════════════════════════════════════════════════════════════
  // STYLE + INTEGRITY CHECKS on the rendered page source
  // ════════════════════════════════════════════════════════════════════
  console.log('\n=== Style + platform integrity checks ===');
  const source = fs.readFileSync(path.join(APP, LAB_URL), 'utf8');
  const emojiRe = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu;
  ok('0 emoji characters in the source', (source.match(emojiRe) || []).length === 0, (source.match(emojiRe) || []).length);
  ok('0 em-dash characters in the source', !source.includes('—'));
  ok('0 " -- " double-hyphen substitutes in the source', !source.includes(' -- '));
  ok('back-link to Core 1 index present', source.includes('href="../index.html"') && source.includes('Back to Core 1'));
  ok('back-link to the motherboards chapter present', source.includes('href="../chapters/ch01-motherboards/index.html"') && source.includes('Return to Motherboards Chapter'));
  ok('AccessGuard.require(\'sorted\') tier preserved', source.includes("AccessGuard.require('sorted')"));
  ok('ModuleProgress.js include present', source.includes('components/ModuleProgress.js'));
  ok('exactly one ModuleProgress.complete call site in the source', (source.match(/ModuleProgress\.complete\(/g) || []).length === 1, (source.match(/ModuleProgress\.complete\(/g) || []).length);
  ok('hex-ai-button mission-id preserved as forge-psu-connectors', source.includes('mission-id="forge-psu-connectors"'));
  ok('no raw checkmark/crossmark glyphs remain (webp icons used instead)', !/[✓✗✔✘]/.test(source));

  await b.close(); srv.close();
  console.log(pass ? '\n*** A+ PSU CONNECTORS (POWER HARNESS WORKBENCH) CHECK OK ***' : '\n!!! A+ PSU CONNECTORS CHECK FAILURES ABOVE !!!');
  process.exit(pass ? 0 : 1);
})();
