#!/usr/bin/env node
// aplus-protocol-analysis-check.js -- regression gate for the CompTIA A+ Core 1
// "Protocol Analysis Lab" after its rebuild from a ~25-option pick-the-answer
// quiz (option-btn + data-correct) into a real Firewall Rule Workbench
// (CompTIA A+ 220-1101 objective 2.1: common networking protocols and ports).
//
// The rebuild's whole point: for each of 9 real business work orders the
// student CONSTRUCTS a firewall rule (transport protocol via toggle, port
// number via free-typed numeric input, service via a 12-item select drawn
// from the same SERVICES table used for grading) and clicks Test Rule, then
// must click every packet in a live capture that the EXACT rule they typed
// would actually allow through and click Confirm Traffic Match. Nothing here
// is a 4-option multiple-choice click.
//
// This loads the real lab HTML headless (no build step, same file served to
// students), stubs AccessGuard/AchievementManager/ModuleProgress/HexAIButton
// the same way aplus-cloud-scenarios-check.js and aplus-troubleshooting-check.js
// do, and drives the REAL exposed globals (selectProtocol/setPort/selectService/
// testRule/togglePacket/confirmTraffic/proceedToNext, all plain function
// declarations in a classic <script>, so they land on window) through the
// actual DOM/state path.
//
// It asserts:
//   1. CORRECT playthrough: for all 9 work orders, submit the order's own
//      correctService (read back from SERVICES/ORDERS via window.__portAnalyst,
//      never hardcoded here so this test cannot drift from the content),
//      the service's real port and an accepted protocol, test the rule, then
//      select exactly the packets that match that exact rule and confirm.
//      Every order must end up solved, and ModuleProgress.complete must fire
//      exactly once with the exact preserved signature
//      ('forge', 'forge-protocol-analysis', {returnUrl: '../index.html'}).
//   2. WRONG playthrough on a fresh load: submit a wrong port/protocol/service
//      combination. testRule() must grade it wrong (ruleBuilt stays false),
//      the traffic phase must stay locked, and ModuleProgress.complete must
//      never fire.
//   3. DIRECT-CALL BYPASS: on a fresh load, call confirmTraffic() and
//      proceedToNext() directly before any rule has ever been built/tested --
//      both must be no-ops. Then build and pass a correct rule for order 0
//      WITHOUT ever calling confirmTraffic(), and call proceedToNext()
//      directly -- it must still be a no-op (traffic never verified). Then
//      actually confirm traffic and prove proceedToNext() now works.
//   4. The rendered wrong-path feedback text for a specific known decoy
//      (HTTP submitted for the HTTPS order) is captured and asserted to make
//      no false situation-specific claim -- it must state the real, factual
//      reason (HTTP is unencrypted) rather than a reused generic string.
//   5. Style/integrity: 0 emoji, 0 em-dash, ModuleProgress.js include present,
//      back-link present, 0 non-platform-shim pageErrors.
//
// Usage: node _tools/arcade-fixes/aplus-protocol-analysis-check.js   (exit 0 = pass)
const http = require('http'), fs = require('fs'), path = require('path');
const pup = require(path.resolve(__dirname, '../../node_modules/puppeteer'));
const APP = path.resolve(__dirname, '../../_app');
const LAB_URL = '/houses/forge/applets/comptia-aplus/core-1/labs/forge-protocol-analysis.lab.html';
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.css': 'text/css', '.webp': 'image/webp', '.png': 'image/png', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.woff': 'font/woff' };
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
let pass = true;
const ok = (n, c, e) => { if (!c) pass = false; console.log('  ' + (c ? 'PASS' : 'FAIL') + '  ' + n + (e !== undefined ? '  ' + JSON.stringify(e).slice(0, 400) : '')); };

// Static file server rooted at _app so the lab + its component scripts load
// same-origin, exactly the file students are served (no build step).
const srv = http.createServer((q, s) => {
  let p = decodeURIComponent(q.url.split('?')[0]); let fp = path.join(APP, p);
  if (fs.existsSync(fp) && fs.statSync(fp).isFile()) { s.writeHead(200, { 'Content-Type': MIME[path.extname(fp)] || 'application/octet-stream' }); fs.createReadStream(fp).pipe(s); }
  else { s.writeHead(404); s.end('nf'); }
});

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
      // Recording stub: pushes every complete() call (with its real args) onto
      // window.__mpCalls so the test can assert both "fired exactly once with
      // the exact signature" and "never fired" scenarios.
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
  // LOAD + HOOK PRESENCE
  // ════════════════════════════════════════════════════════════════════
  console.log('\n=== Load + test hook presence ===');
  const { pg: pg0, errs: errs0 } = await newStubbedPage(b);
  await pg0.goto('http://localhost:' + port + LAB_URL, { waitUntil: 'domcontentloaded', timeout: 20000 }).catch(() => {});
  await sleep(400);

  const haveFns = await pg0.evaluate(() => ({
    selectProtocol: typeof window.selectProtocol, setPort: typeof window.setPort, selectService: typeof window.selectService,
    testRule: typeof window.testRule, togglePacket: typeof window.togglePacket, confirmTraffic: typeof window.confirmTraffic,
    proceedToNext: typeof window.proceedToNext, goToOrder: typeof window.goToOrder,
    portAnalyst: typeof window.__portAnalyst
  }));
  ok('inline <script> parsed + ran fully (lab functions present on window)',
    Object.entries(haveFns).every(([k, v]) => v === 'function' || (k === 'portAnalyst' && v === 'object')), haveFns);

  const orderCount = await pg0.evaluate(() => window.__portAnalyst.orderCount);
  ok('9 distinct work orders present', orderCount === 9, orderCount);

  // Every order must name a real SERVICES key and expose at least one packet
  // so the traffic-verification phase always has something to grade.
  const contentCheck = await pg0.evaluate(() => {
    const issues = [];
    for (let i = 0; i < window.__portAnalyst.orderCount; i++) {
      const o = window.__portAnalyst.getOrder(i);
      if (!o.correctService) issues.push(`order ${i} missing correctService`);
      if (!o.packetCount || o.packetCount < 4) issues.push(`order ${i} has too few packets (${o.packetCount})`);
    }
    return issues;
  });
  ok('every order defines a correct service and a real packet capture', contentCheck.length === 0, contentCheck);

  // ════════════════════════════════════════════════════════════════════
  // SCENARIO A: DIRECT-CALL BYPASS -- confirmTraffic()/proceedToNext()
  // before anything has been built must be no-ops. Then a correct rule
  // WITHOUT confirming traffic still must not let proceedToNext() advance.
  // ════════════════════════════════════════════════════════════════════
  console.log('\n=== Scenario A: direct-call bypass cannot skip a required step ===');

  const bypassBefore = await pg0.evaluate(() => {
    window.confirmTraffic(); // nothing built yet at all
    window.proceedToNext();  // nothing solved yet at all
    return { current: window.__portAnalyst.getCurrent(), solved: window.__portAnalyst.getSolvedCount(), mpCalls: window.__mpCalls.length };
  });
  ok('confirmTraffic() with no rule built yet is a no-op (0 solved)', bypassBefore.solved === 0, bypassBefore);
  ok('proceedToNext() with nothing solved is a no-op (still on order 0)', bypassBefore.current === 0, bypassBefore);
  ok('no completion fired from the bypass attempt', bypassBefore.mpCalls === 0, bypassBefore);

  // Build and PASS a correct rule for order 0, but deliberately never call
  // confirmTraffic(). proceedToNext() must still refuse to advance.
  const order0Facts = await pg0.evaluate(() => {
    const o = window.__portAnalyst.getOrder(0);
    return o; // { dept, correctService, packetCount }
  });
  // Pull the real port/protocol for order 0's correct service directly out of
  // the rendered reference grid (built from the same SERVICES table the lab
  // grades against), so this test never hardcodes A+ port facts itself.
  const svc0 = await pg0.evaluate((svcKey) => {
    const grid = document.getElementById('portRefGrid');
    const item = [...grid.querySelectorAll('.port-item')].find(el => el.textContent.includes(svcKey));
    return item ? item.querySelector('.port-num').textContent : null;
  }, order0Facts.correctService);
  ok('order 0 correct service resolves to a real port via the reference grid', !!svc0, { correctService: order0Facts.correctService, svc0 });

  const firstPort0 = svc0.split('/')[0];

  const ruleWithoutVerify = await pg0.evaluate((svcKey, portVal) => {
    window.selectProtocol('TCP');
    window.setPort(String(portVal));
    window.selectService(svcKey);
    window.testRule();
    const ruleState = window.__portAnalyst.getRuleState(0);
    // Attempt the bypass: skip confirmTraffic entirely.
    window.proceedToNext();
    return { ruleBuilt: ruleState.ruleBuilt, currentAfterBypass: window.__portAnalyst.getCurrent(), solvedAfterBypass: window.__portAnalyst.getSolvedCount() };
  }, order0Facts.correctService, firstPort0);
  // Note: TCP may not be an accepted protocol for every service (e.g. DHCP is
  // UDP-only); if the rule did not pass with TCP, retry with UDP so this
  // scenario reaches a genuinely built rule before testing the real bypass.
  let confirmedRuleBuilt = ruleWithoutVerify.ruleBuilt;
  if (!confirmedRuleBuilt) {
    const retry = await pg0.evaluate((svcKey, portVal) => {
      window.selectProtocol('UDP');
      window.setPort(String(portVal));
      window.selectService(svcKey);
      window.testRule();
      const ruleState = window.__portAnalyst.getRuleState(0);
      window.proceedToNext();
      return { ruleBuilt: ruleState.ruleBuilt, currentAfterBypass: window.__portAnalyst.getCurrent(), solvedAfterBypass: window.__portAnalyst.getSolvedCount() };
    }, order0Facts.correctService, firstPort0);
    confirmedRuleBuilt = retry.ruleBuilt;
    ruleWithoutVerify.currentAfterBypass = retry.currentAfterBypass;
    ruleWithoutVerify.solvedAfterBypass = retry.solvedAfterBypass;
  }
  ok('a correct rule was actually built for order 0 (precondition for this scenario)', confirmedRuleBuilt === true, confirmedRuleBuilt);
  ok('proceedToNext() with a built rule but UNVERIFIED traffic is a no-op (still on order 0, still 0 solved)',
    ruleWithoutVerify.currentAfterBypass === 0 && ruleWithoutVerify.solvedAfterBypass === 0, ruleWithoutVerify);

  const bypassAfterBuild = await pg0.evaluate(() => ({ mpCalls: window.__mpCalls.length }));
  ok('no completion fired from the unverified-traffic bypass attempt', bypassAfterBuild.mpCalls === 0, bypassAfterBuild);

  // Now do it for real: select the packets that match this exact rule and confirm.
  const realVerify = await pg0.evaluate(() => {
    const sub = window.__portAnalyst.getRuleState(0);
    const order = { packets: null }; // packets are private to module scope; select via DOM instead
    // togglePacket() is only meaningful once ruleBuilt=true (already true here).
    // Determine which rows are "matching" by reading the packet table's own
    // rendered port/proto cells and comparing against the submitted rule.
    const rows = [...document.querySelectorAll('#trafficConsole tbody tr')];
    let selectedAny = false;
    rows.forEach((row, i) => {
      const proto = row.children[4].textContent.trim();
      const portTxt = row.children[5].textContent.trim();
      if (proto === sub.protocol && Number(portTxt) === Number(sub.port)) {
        window.togglePacket(i);
        selectedAny = true;
      }
    });
    window.confirmTraffic();
    return { selectedAny, solved: window.__portAnalyst.getSolvedCount(), current: window.__portAnalyst.getCurrent() };
  });
  ok('at least one packet in the capture genuinely matches the submitted rule', realVerify.selectedAny, realVerify);
  ok('confirmTraffic() with the correct packet set solves order 0', realVerify.solved === 1, realVerify);

  const advanceForReal = await pg0.evaluate(() => {
    window.proceedToNext();
    return window.__portAnalyst.getCurrent();
  });
  ok('proceedToNext() now genuinely advances once traffic is verified', advanceForReal === 1, advanceForReal);

  // ════════════════════════════════════════════════════════════════════
  // SCENARIO B: WRONG-RULE PLAYTHROUGH (fresh page) -- grades wrong,
  // never unlocks traffic verification, never completes.
  // ════════════════════════════════════════════════════════════════════
  console.log('\n=== Scenario B: wrong rule grades wrong and never completes ===');
  const { pg: pg1 } = await newStubbedPage(b);
  await pg1.goto('http://localhost:' + port + LAB_URL, { waitUntil: 'domcontentloaded', timeout: 20000 }).catch(() => {});
  await sleep(400);

  // Deliberately submit HTTP (port 80/TCP) against order 0, which requires
  // HTTPS (port 443/TCP) -- a wrong service on a real, well-formed port.
  const wrongRun = await pg1.evaluate(() => {
    const order0 = window.__portAnalyst.getOrder(0); // correctService: 'HTTPS'
    window.selectProtocol('TCP');
    window.setPort('80');
    window.selectService('HTTP');
    window.testRule();
    const ruleState = window.__portAnalyst.getRuleState(0);
    const feedbackText = document.getElementById('ruleFeedback').textContent;
    // Attempt to bypass straight to traffic confirmation and completion anyway.
    window.togglePacket(0);
    window.confirmTraffic();
    window.proceedToNext();
    return {
      correctService: order0.correctService,
      ruleBuilt: ruleState.ruleBuilt,
      selectedPackets: ruleState.selectedPackets,
      solved: window.__portAnalyst.getSolvedCount(),
      current: window.__portAnalyst.getCurrent(),
      mpCalls: window.__mpCalls.length,
      feedbackText
    };
  });
  ok('wrong service (HTTP for an HTTPS requirement) grades ruleBuilt=false', wrongRun.ruleBuilt === false, wrongRun);
  ok('togglePacket() is refused while ruleBuilt is false (no packet selected)', wrongRun.selectedPackets.length === 0, wrongRun);
  ok('confirmTraffic() on an unbuilt rule never solves the order', wrongRun.solved === 0, wrongRun);
  ok('proceedToNext() never advances on a wrong/unsolved order', wrongRun.current === 0, wrongRun);
  ok('ModuleProgress.complete never fires on a wrong playthrough', wrongRun.mpCalls === 0, wrongRun);

  // ════════════════════════════════════════════════════════════════════
  // SCENARIO C: SCENARIO-ACCURATE FEEDBACK -- the rendered wrong-path text
  // for this specific decoy (HTTP submitted for an HTTPS requirement) must
  // make the real, factual claim (HTTP is unencrypted), not a reused
  // generic string that could be false in a different order.
  // ════════════════════════════════════════════════════════════════════
  console.log('\n=== Scenario C: wrong-path feedback makes no false situation-specific claim ===');
  ok('feedback text explains the REAL reason (HTTP is unencrypted / plain text)',
    /plain text|unencrypted/i.test(wrongRun.feedbackText), wrongRun.feedbackText);
  ok('feedback text explicitly names HTTPS as the encrypted alternative (situation-accurate, not generic)',
    /HTTPS/i.test(wrongRun.feedbackText), wrongRun.feedbackText);
  ok('feedback text does not silently claim the rule was correct', !/^Correct\./i.test(wrongRun.feedbackText.trim()), wrongRun.feedbackText);

  // ════════════════════════════════════════════════════════════════════
  // SCENARIO D: FULL CORRECT PLAYTHROUGH across all 9 orders -- reaches
  // genuine completion and fires ModuleProgress.complete exactly once with
  // the exact preserved signature.
  // ════════════════════════════════════════════════════════════════════
  console.log('\n=== Scenario D: full correct playthrough (9 orders) completes exactly once ===');
  const { pg: pg2 } = await newStubbedPage(b);
  await pg2.goto('http://localhost:' + port + LAB_URL, { waitUntil: 'domcontentloaded', timeout: 20000 }).catch(() => {});
  await sleep(400);

  const perOrderResults = [];
  for (let i = 0; i < 9; i++) {
    const stepResult = await pg2.evaluate((idx) => {
      window.goToOrder(idx);
      const order = window.__portAnalyst.getOrder(idx);
      const grid = document.getElementById('portRefGrid');
      const item = [...grid.querySelectorAll('.port-item')].find(el => el.textContent.includes(order.correctService));
      const ports = item.querySelector('.port-num').textContent.split('/');
      return { correctService: order.correctService, firstPort: ports[0] };
    }, i);

    // Try TCP first, then UDP, since this test does not hardcode which
    // protocol(s) each service accepts -- the lab itself is the source of
    // truth via testRule()'s own grading.
    let built = false;
    for (const proto of ['TCP', 'UDP']) {
      built = await pg2.evaluate((proto, svcKey, portVal) => {
        window.selectProtocol(proto);
        window.setPort(String(portVal));
        window.selectService(svcKey);
        window.testRule();
        return window.__portAnalyst.getRuleState(window.__portAnalyst.getCurrent()).ruleBuilt;
      }, proto, stepResult.correctService, stepResult.firstPort);
      if (built) break;
    }

    const verifyResult = await pg2.evaluate((idx) => {
      const sub = window.__portAnalyst.getRuleState(idx);
      const rows = [...document.querySelectorAll('#trafficConsole tbody tr')];
      rows.forEach((row, i) => {
        const proto = row.children[4].textContent.trim();
        const portTxt = row.children[5].textContent.trim();
        if (proto === sub.protocol && Number(portTxt) === Number(sub.port)) window.togglePacket(i);
      });
      window.confirmTraffic();
      const solvedNow = window.__portAnalyst.getSolvedCount();
      window.proceedToNext();
      return { solvedNow, currentAfter: window.__portAnalyst.getCurrent() };
    }, i);

    perOrderResults.push({ order: i, correctService: stepResult.correctService, ruleBuilt: built, solvedNow: verifyResult.solvedNow });
    ok(`Order ${i + 1} (${stepResult.correctService}): correct rule accepted and traffic verified (solved count ${verifyResult.solvedNow})`,
      built === true && verifyResult.solvedNow === i + 1, perOrderResults[perOrderResults.length - 1]);
  }

  const finalState = await pg2.evaluate(() => ({
    solved: window.__portAnalyst.getSolvedCount(),
    isComplete: window.__portAnalyst.isComplete(),
    mpCalls: window.__mpCalls
  }));
  ok('all 9 work orders solved', finalState.solved === 9, finalState.solved);
  ok('isComplete() reports true', finalState.isComplete === true, finalState.isComplete);
  ok('ModuleProgress.complete fired exactly once', finalState.mpCalls.length === 1, finalState.mpCalls);
  if (finalState.mpCalls.length === 1) {
    const [house, moduleId, opts] = finalState.mpCalls[0];
    ok("ModuleProgress.complete signature is exactly ('forge', 'forge-protocol-analysis', {returnUrl:'../index.html'})",
      house === 'forge' && moduleId === 'forge-protocol-analysis' && opts && opts.returnUrl === '../index.html', finalState.mpCalls[0]);
  }

  // A second manual call to proceedToNext() / confirmTraffic() after full
  // completion must not fire a second completion signal.
  const doubleFireCheck = await pg2.evaluate(() => {
    window.confirmTraffic();
    window.proceedToNext();
    return window.__mpCalls.length;
  });
  ok('repeated post-completion calls do not fire a second completion', doubleFireCheck === 1, doubleFireCheck);

  // ════════════════════════════════════════════════════════════════════
  // STYLE + INTEGRITY CHECKS
  // ════════════════════════════════════════════════════════════════════
  console.log('\n=== Style + platform integrity checks ===');
  const bodyHtml = await pg2.evaluate(() => document.body.innerHTML);
  const emojiRe = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu;
  ok('0 emoji characters in the rendered page', (bodyHtml.match(emojiRe) || []).length === 0, (bodyHtml.match(emojiRe) || []).length);
  ok('0 em-dash characters in the rendered page', !bodyHtml.includes('—'));
  ok('back-link to ../chapters/ch06-tcpip/index.html present', await pg2.evaluate(() => !!document.querySelector('a.back-link[href="../chapters/ch06-tcpip/index.html"]')));
  ok('ModuleProgress.js include present in source', fs.readFileSync(path.join(APP, LAB_URL), 'utf8').includes('components/ModuleProgress.js'));
  ok('hex-ai-button mission-id preserved as forge-protocol-analysis', fs.readFileSync(path.join(APP, LAB_URL), 'utf8').includes('mission-id="forge-protocol-analysis"'));

  ok('0 non-platform-shim pageErrors (page 0)', errs0.length === 0, errs0.slice(0, 4));

  await b.close(); srv.close();
  console.log(pass ? '\n*** A+ PROTOCOL ANALYSIS (FIREWALL RULE WORKBENCH) CHECK OK ***' : '\n!!! A+ PROTOCOL ANALYSIS CHECK FAILURES ABOVE !!!');
  process.exit(pass ? 0 : 1);
})();
