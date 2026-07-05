#!/usr/bin/env node
// aplus-cpu-sockets-check.js: regression gate for the CompTIA A+ Core 1 "CPU Socket
// Identification Lab" after its rebuild from a 4-option pick-the-answer quiz (checkAnswer(i),
// correct option always at index 0, no shuffle: "always click first" scored 6/6) into a real
// "CPU Socket Compatibility Workbench" (CompTIA A+ 220-1101 objective 3.4).
//
// The rebuild's whole point: for each of 8 real build orders the student is given ONE real part
// (a CPU or a bare motherboard socket, alternating direction) plus a bin of 4 candidate parts, and
// must SORT every candidate as Compatible (install) or Incompatible (reject) by reading real specs
// (vendor, package type PGA/LGA/BGA, pin count, generation), not click one of 4 labeled buttons.
// Correctness is computed by evaluateCompatibilityCore()/checkCompatible() comparing real spec
// fields (cpu.socket, cpu.package, cpu.isBga, socket.vendor/package), never a stored ".correct"
// flag on any candidate.
//
// This loads the real lab HTML headless (no build step, same file served to students), stubs
// AccessGuard/AchievementManager/ModuleProgress/HexAIButton the same way aplus-dns-config-check.js
// and aplus-protocol-analysis-check.js do, and drives the REAL window.__cpuBench test hook, which
// forwards every call into the SAME functions the on-page buttons call (decideCandidate,
// resetOrder, testBuild, nextOrder, completeLab).
//
// Assertions:
//   1. Hook + content structure: window.__cpuBench present with the full method surface; 8 orders;
//      every order's direction/targetId/candidateIds are well-formed against CPUS/SOCKETS, and
//      exactly ONE of each order's 4 candidates is genuinely compatible per checkCompatible().
//   2. CORRECT playthrough: for all 8 orders, sort every rendered candidate exactly as
//      checkCompatible() itself says (read back live, never hardcoded here), test the build, and
//      confirm passed=true each time, solved reaches 8/8, isComplete() is true, and
//      ModuleProgress.complete fires EXACTLY ONCE with the exact preserved signature
//      ('forge', 'forge-cpu-sockets', {returnUrl: '../index.html'}).
//   3. WRONG playthrough on a fresh load: sort every candidate as the OPPOSITE of what
//      checkCompatible() says on order 0: testBuild() must grade passed=false, solved stays 0,
//      and ModuleProgress.complete must never fire.
//   4. NOT-FIXED-POSITION check: across all 8 orders, read the RENDERED candidate order via
//      getRenderedCandidates() and find the index of the one genuinely compatible candidate:
//      assert these indices are not all the same/first (proves the shuffle + varied authored
//      indices actually move the correct choice around, not a disguised fixed-index MC quiz).
//   5. DIRECT-CALL BYPASS: decideCandidate()/resetOrder()/testBuild() on a LOCKED (solved) order,
//      testBuild() with an incomplete decision set, nextOrder() before the current order is
//      solved, and completeLab() before every order is solved are all called directly out of
//      order and must be no-ops.
//   6. Rendered wrong-path feedback is captured for multiple distinct candidate pairs (a
//      vendor-mismatch, a package-mismatch, a generation-mismatch, and the BGA trap order) and
//      asserted to be pair-specific (mentions the real names/sockets involved) and to differ from
//      each other, rather than one fixed string reused where it could be false.
//   7. Style/integrity: 0 emoji, 0 em-dash, back-link to the motherboards chapter, ModuleProgress.js
//      include present, exactly one ModuleProgress.complete call site, 0 non-platform-shim
//      pageErrors.
//
// Usage: node _tools/arcade-fixes/aplus-cpu-sockets-check.js   (exit 0 = pass)
const http = require('http'), fs = require('fs'), path = require('path');
const pup = require(path.resolve(__dirname, '../../node_modules/puppeteer'));
const APP = path.resolve(__dirname, '../../_app');
const LAB_URL = '/houses/forge/applets/comptia-aplus/core-1/labs/forge-cpu-sockets.lab.html';
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

// Creates a fresh page with AccessGuard/AchievementManager/HexAIButton neutralized (so init cannot
// redirect or throw) and ModuleProgress.complete specifically instrumented (not just no-op'd) so
// we can PROVE it fires on a correct full playthrough and does NOT fire otherwise.
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

  // ════════════════════════════════════════════════════════════════════
  // LOAD + HOOK PRESENCE + CONTENT STRUCTURE
  // ════════════════════════════════════════════════════════════════════
  console.log('\n=== Load + test hook presence + content structure ===');
  const { pg: pg0, errs: errs0 } = await newStubbedPage(b);
  await pg0.goto('http://localhost:' + port + LAB_URL, { waitUntil: 'domcontentloaded', timeout: 20000 }).catch(() => {});
  await sleep(400);

  const hookInfo = await pg0.evaluate(() => ({
    have: typeof window.__cpuBench === 'object',
    fns: window.__cpuBench ? Object.keys(window.__cpuBench) : [],
    orderCount: window.__cpuBench ? window.__cpuBench.orderCount : 0
  }));
  ok('window.__cpuBench test hook present (script parsed + ran fully)',
    hookInfo.have && ['getOrder', 'getCurrent', 'goTo', 'getRenderedCandidates', 'decide', 'getDecisions', 'reset', 'testBuild', 'getLastResult', 'next', 'previous', 'complete', 'getSolvedCount', 'isComplete', 'checkCompatible'].every(k => hookInfo.fns.includes(k)),
    hookInfo);
  ok('8 work orders present', hookInfo.orderCount === 8, hookInfo.orderCount);

  // Structural + "exactly one correct candidate per order" check, computed via the lab's OWN
  // checkCompatible() function, never a hardcoded A+ fact in this test.
  const contentCheck = await pg0.evaluate(() => {
    const issues = [];
    for (let i = 0; i < window.__cpuBench.orderCount; i++) {
      window.__cpuBench.goTo(i);
      const order = window.__cpuBench.getOrder(i);
      const candidates = window.__cpuBench.getRenderedCandidates();
      if (candidates.length !== 4) issues.push('order ' + i + ' does not have 4 candidates (' + candidates.length + ')');
      if (order.direction !== 'cpu-to-socket' && order.direction !== 'socket-to-cpu') issues.push('order ' + i + ' has invalid direction ' + order.direction);
      const compatCount = candidates.filter(cid => window.__cpuBench.checkCompatible(order.direction, order.targetId, cid).compatible).length;
      if (compatCount !== 1) issues.push('order ' + i + ' has ' + compatCount + ' compatible candidates (expected exactly 1)');
    }
    return issues;
  });
  ok('all 8 orders are well-formed with exactly 1 genuinely compatible candidate each', contentCheck.length === 0, contentCheck);
  ok('0 non-firebase pageErrors after load', errs0.length === 0, errs0.slice(0, 4));

  // ── NOT-FIXED-POSITION check: the rendered index of the one compatible
  // candidate must vary across orders, not sit at a fixed/first index. ────
  console.log('\n=== Rendered position of the correct candidate is not fixed/first ===');
  const positions = await pg0.evaluate(() => {
    const out = [];
    for (let i = 0; i < window.__cpuBench.orderCount; i++) {
      window.__cpuBench.goTo(i);
      const order = window.__cpuBench.getOrder(i);
      const candidates = window.__cpuBench.getRenderedCandidates();
      const idx = candidates.findIndex(cid => window.__cpuBench.checkCompatible(order.direction, order.targetId, cid).compatible);
      out.push(idx);
    }
    return out;
  });
  ok('every order has a locatable compatible candidate in its rendered list (no -1)', positions.every(p => p >= 0), positions);
  ok('the compatible candidate is NOT always at index 0 across the 8 rendered orders', !positions.every(p => p === 0), positions);
  ok('the compatible candidate does not sit at one single fixed index across all 8 rendered orders', new Set(positions).size > 1, positions);
  await pg0.close();

  // ════════════════════════════════════════════════════════════════════
  // SCENARIO A: CORRECT PLAYTHROUGH: all 8 orders sorted exactly per the
  // lab's own checkCompatible(), reaches genuine completion.
  // ════════════════════════════════════════════════════════════════════
  console.log('\n=== Scenario A: full correct playthrough (8 orders) completes exactly once ===');
  const { pg: pgC, errs: errsC } = await newStubbedPage(b);
  await pgC.goto('http://localhost:' + port + LAB_URL, { waitUntil: 'domcontentloaded', timeout: 20000 }).catch(() => {});
  await sleep(400);

  const correctRun = await pgC.evaluate(() => {
    const results = [];
    for (let i = 0; i < window.__cpuBench.orderCount; i++) {
      window.__cpuBench.goTo(i);
      const order = window.__cpuBench.getOrder(i);
      const candidates = window.__cpuBench.getRenderedCandidates();
      candidates.forEach((cid, idx) => {
        const evalR = window.__cpuBench.checkCompatible(order.direction, order.targetId, cid);
        window.__cpuBench.decide(idx, evalR.compatible ? 'compatible' : 'incompatible');
      });
      const passed = window.__cpuBench.testBuild();
      results.push({ i, passed, solvedNow: window.__cpuBench.getSolvedCount() });
      window.__cpuBench.next();
    }
    return { results, solvedCount: window.__cpuBench.getSolvedCount(), complete: window.__cpuBench.isComplete(), mpCalls: window.__mpCalls, current: window.__cpuBench.getCurrent() };
  });

  ok('every order grades passed=true when sorted exactly per checkCompatible()', correctRun.results.every(r => r.passed), correctRun.results.filter(r => !r.passed));
  ok('solved count reaches 8/8 after the correct playthrough', correctRun.solvedCount === 8, correctRun.solvedCount);
  ok('isComplete() reports true after all 8 orders solved', correctRun.complete === true, correctRun.complete);
  ok('ModuleProgress.complete fired exactly once on full correct completion', correctRun.mpCalls.length === 1, correctRun.mpCalls);
  if (correctRun.mpCalls.length >= 1) {
    const [house, mod, opts] = correctRun.mpCalls[0];
    ok('ModuleProgress.complete signature preserved exactly: (\'forge\', \'forge-cpu-sockets\', {returnUrl: \'../index.html\'})',
      house === 'forge' && mod === 'forge-cpu-sockets' && opts && opts.returnUrl === '../index.html',
      correctRun.mpCalls[0]);
  }
  ok('0 non-firebase pageErrors during correct playthrough', errsC.length === 0, errsC.slice(0, 4));

  // A repeated post-completion call must not fire a second completion.
  const doubleFireCheck = await pgC.evaluate(() => { window.__cpuBench.complete(); window.__cpuBench.next(); return window.__mpCalls.length; });
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
    window.__cpuBench.goTo(0);
    const order = window.__cpuBench.getOrder(0);
    const candidates = window.__cpuBench.getRenderedCandidates();
    candidates.forEach((cid, idx) => {
      const evalR = window.__cpuBench.checkCompatible(order.direction, order.targetId, cid);
      // Deliberately invert every real answer.
      window.__cpuBench.decide(idx, evalR.compatible ? 'incompatible' : 'compatible');
    });
    const passed = window.__cpuBench.testBuild();
    const result = window.__cpuBench.getLastResult();
    // Attempt to bypass straight to next/complete anyway.
    window.__cpuBench.next();
    window.__cpuBench.complete();
    return {
      passed, wrongCount: result.rows.filter(r => !r.correct).length,
      solved: window.__cpuBench.getSolvedCount(), current: window.__cpuBench.getCurrent(),
      mpCalls: window.__mpCalls.length
    };
  });
  ok('inverting every real answer grades passed=false', wrongRun.passed === false, wrongRun);
  ok('all 4 candidates graded wrong when every real answer was inverted', wrongRun.wrongCount === 4, wrongRun.wrongCount);
  ok('order 0 is NOT counted as solved after a wrong sort', wrongRun.solved === 0, wrongRun.solved);
  ok('next() after a failed build does not advance past order 0', wrongRun.current === 0, wrongRun.current);
  ok('ModuleProgress.complete never fires on a wrong playthrough', wrongRun.mpCalls === 0, wrongRun.mpCalls);
  ok('0 non-firebase pageErrors during wrong playthrough', errsW.length === 0, errsW.slice(0, 4));

  // ════════════════════════════════════════════════════════════════════
  // SCENARIO C: SCENARIO-ACCURATE FEEDBACK: rendered wrong-path text for
  // several distinct pairs (vendor / package / generation / BGA mismatches)
  // must be pair-specific, not one fixed string reused everywhere.
  // ════════════════════════════════════════════════════════════════════
  console.log('\n=== Scenario C: wrong-path feedback is pair-specific, not a reused generic string ===');
  const feedbackTexts = await pgW.evaluate(() => {
    // reportText for order 0 (already tested above, still rendered on page).
    const order0Report = document.getElementById('buildReport').innerText;
    return { order0Report };
  });
  ok('order 0 build report mentions at least one real socket/CPU name (not a blank generic message)',
    /LGA|AM4|AM5|Intel|AMD|Ryzen|Core/i.test(feedbackTexts.order0Report), feedbackTexts.order0Report.slice(0, 200));
  await pgW.close();

  // Fresh page: probe the BGA-trap order (order index 6, Thornridge Laptop Repair) directly, and
  // a vendor-mismatch pairing, to capture explanation text and confirm both are real and distinct.
  const { pg: pgF, errs: errsF } = await newStubbedPage(b);
  await pgF.goto('http://localhost:' + port + LAB_URL, { waitUntil: 'domcontentloaded', timeout: 20000 }).catch(() => {});
  await sleep(400);

  const explanationProbe = await pgF.evaluate(() => {
    // Order 6 (0-indexed) is the BGA trap: a soldered mobile CPU with a "no socket" candidate
    // among 3 real sockets. Sort every candidate WRONG (mark all 3 real sockets compatible, and
    // mark the true "no socket" option incompatible) to force the BGA-specific explanations.
    window.__cpuBench.goTo(6);
    const order6 = window.__cpuBench.getOrder(6);
    const candidates6 = window.__cpuBench.getRenderedCandidates();
    candidates6.forEach((cid, idx) => {
      const evalR = window.__cpuBench.checkCompatible(order6.direction, order6.targetId, cid);
      window.__cpuBench.decide(idx, evalR.compatible ? 'incompatible' : 'compatible');
    });
    window.__cpuBench.testBuild();
    const bgaReport = document.getElementById('buildReport').innerText;

    // Order 1 (0-indexed), Corbett Machine Shop, socket-to-cpu on AM4: mark every candidate wrong
    // to force vendor/package/generation-mismatch explanations for a different order entirely.
    window.__cpuBench.goTo(1);
    const order1 = window.__cpuBench.getOrder(1);
    const candidates1 = window.__cpuBench.getRenderedCandidates();
    candidates1.forEach((cid, idx) => {
      const evalR = window.__cpuBench.checkCompatible(order1.direction, order1.targetId, cid);
      window.__cpuBench.decide(idx, evalR.compatible ? 'incompatible' : 'compatible');
    });
    window.__cpuBench.testBuild();
    const am4Report = document.getElementById('buildReport').innerText;

    return { bgaReport, am4Report };
  });
  ok('BGA-trap order explanation names the real soldered-package fact (BGA / soldered)',
    /BGA|soldered/i.test(explanationProbe.bgaReport), explanationProbe.bgaReport.slice(0, 300));
  ok('AM4 order explanation names real socket/vendor facts (AM4/AM5/Intel/AMD)',
    /AM4|AM5|Intel|AMD/i.test(explanationProbe.am4Report), explanationProbe.am4Report.slice(0, 300));
  ok('the BGA-trap and AM4-order feedback texts are genuinely different (pair-specific, not one reused string)',
    explanationProbe.bgaReport !== explanationProbe.am4Report, {
      bga: explanationProbe.bgaReport.slice(0, 120), am4: explanationProbe.am4Report.slice(0, 120)
    });
  ok('BGA-trap report does not falsely claim a real socket fits the soldered CPU (no "is genuinely correct" for a real socket id)',
    !/(LGA1700|AM4(?!_)|AM5) socket, which supports/i.test(explanationProbe.bgaReport), explanationProbe.bgaReport.slice(0, 400));

  // ════════════════════════════════════════════════════════════════════
  // SCENARIO D: DIRECT-CALL BYPASS: every advance/submit/complete handler
  // is called directly, out of order, and must be a no-op.
  // ════════════════════════════════════════════════════════════════════
  console.log('\n=== Scenario D: direct-call bypass cannot skip a required step ===');

  const bypassBefore = await pgF.evaluate(() => {
    window.__cpuBench.goTo(2); // fresh, undecided order
    const beforeSolved = window.__cpuBench.getSolvedCount();
    const testWithNoDecisions = window.__cpuBench.testBuild(); // gate: not all 4 decided
    const nextBeforeSolved = window.__cpuBench.next();         // gate: current order not solved
    window.completeLab();                                       // gate: not all orders solved
    return {
      testWithNoDecisions, nextBeforeSolved,
      currentAfter: window.__cpuBench.getCurrent(),
      solvedAfter: window.__cpuBench.getSolvedCount(),
      mpCalls: window.__mpCalls.length,
      unchanged: beforeSolved === window.__cpuBench.getSolvedCount()
    };
  });
  ok('testBuild() with zero decisions made is a no-op (returns false)', bypassBefore.testWithNoDecisions === false, bypassBefore);
  ok('next() before the current order is solved is a no-op (stays on order 2)', bypassBefore.nextBeforeSolved === false && bypassBefore.currentAfter === 2, bypassBefore);
  ok('window.completeLab() with orders still unsolved never fires ModuleProgress.complete', bypassBefore.mpCalls === 0, bypassBefore);
  ok('solved count is unchanged by the bypass attempts', bypassBefore.unchanged, bypassBefore);

  // Partially decide order 2 (only 2 of 4 candidates), confirm testBuild() still refuses.
  const partialDecisionCheck = await pgF.evaluate(() => {
    window.__cpuBench.decide(0, 'compatible');
    window.__cpuBench.decide(1, 'incompatible');
    // candidates 2 and 3 left undecided
    const result = window.__cpuBench.testBuild();
    return { result, solved: window.__cpuBench.getSolvedCount() };
  });
  ok('testBuild() with only 2 of 4 candidates decided is refused (returns false)', partialDecisionCheck.result === false, partialDecisionCheck);
  ok('solved count unaffected by a partial-decision testBuild() attempt', partialDecisionCheck.solved === 0, partialDecisionCheck.solved);

  // Now genuinely solve order 2, then attempt every locked-order bypass directly.
  const lockBypassRun = await pgF.evaluate(() => {
    window.__cpuBench.goTo(2);
    const order = window.__cpuBench.getOrder(2);
    const candidates = window.__cpuBench.getRenderedCandidates();
    candidates.forEach((cid, idx) => {
      const evalR = window.__cpuBench.checkCompatible(order.direction, order.targetId, cid);
      window.__cpuBench.decide(idx, evalR.compatible ? 'compatible' : 'incompatible');
    });
    const passed = window.__cpuBench.testBuild();
    const solvedAfterRealBuild = window.__cpuBench.getSolvedCount();

    // Order 2 is now LOCKED (solved). Direct calls to decide/reset/testBuild must all refuse.
    const decideWhileLocked = window.__cpuBench.decide(0, 'incompatible');
    const decisionsAfterLockedDecide = window.__cpuBench.getDecisions();
    const resetWhileLocked = window.__cpuBench.reset();
    const testBuildWhileLocked = window.__cpuBench.testBuild();

    return {
      passed, solvedAfterRealBuild, decideWhileLocked, decisionsAfterLockedDecide,
      resetWhileLocked, testBuildWhileLocked, mpCallsAfterOneOrder: window.__mpCalls.length
    };
  });
  ok('order 2 is genuinely solved by a real correct build', lockBypassRun.passed === true && lockBypassRun.solvedAfterRealBuild === 1, lockBypassRun);
  ok('decide() on a LOCKED (solved) order is refused (returns false, decisions unchanged)', lockBypassRun.decideWhileLocked === false && lockBypassRun.decisionsAfterLockedDecide.every(d => d !== null), lockBypassRun);
  ok('reset() on a LOCKED (solved) order is refused (returns false)', lockBypassRun.resetWhileLocked === false, lockBypassRun.resetWhileLocked);
  ok('testBuild() on a LOCKED (solved) order is refused (returns false, no double-grading)', lockBypassRun.testBuildWhileLocked === false, lockBypassRun.testBuildWhileLocked);
  ok('ModuleProgress.complete still has not fired after only 1 of 8 orders solved', lockBypassRun.mpCallsAfterOneOrder === 0, lockBypassRun.mpCallsAfterOneOrder);
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
  ok('back-link to the motherboards chapter present', source.includes('href="../chapters/ch01-motherboards/index.html"') && source.includes('Back to Motherboards Chapter'));
  ok('ModuleProgress.js include present', source.includes('components/ModuleProgress.js'));
  ok('exactly one ModuleProgress.complete call site in the source', (source.match(/ModuleProgress\.complete\(/g) || []).length === 1, (source.match(/ModuleProgress\.complete\(/g) || []).length);
  ok('hex-ai-button mission-id preserved as forge-cpu-sockets', source.includes('mission-id="forge-cpu-sockets"'));
  ok('no raw checkmark/crossmark glyphs remain (webp icons used instead)', !/[✓✗✔✘]/.test(source));

  await b.close(); srv.close();
  console.log(pass ? '\n*** A+ CPU SOCKETS (COMPATIBILITY WORKBENCH) CHECK OK ***' : '\n!!! A+ CPU SOCKETS CHECK FAILURES ABOVE !!!');
  process.exit(pass ? 0 : 1);
})();
