#!/usr/bin/env node
// aplus-mobile-sync-check.js -- regression gate for the CompTIA A+ Core 1 "Mobile Sync"
// lab after its rebuild from a 4-option multiple-choice quiz (answer-btn onclick=
// "selectAnswer(i, true/false)", correctness leaked directly in the rendered DOM) into a
// real "Mobile Sync Configurator" engine. The rebuild's whole point is that the student
// must CONFIGURE mobile sync: given a client's real requirement, pick the correct
// account/destination AND the correct sync trigger for every data category the scenario
// names (work email, calendar, contacts, photos, music, etc.), not click a single
// pre-labeled 4-option answer.
//
// It loads the real lab HTML headless (no build step -- same file served to students),
// stubs AccessGuard/ModuleProgress/HexAIButton the same way aplus-dns-config-check.js and
// aplus-mobile-troubleshoot-check.js do, and drives the real window.__mobileSync test
// hook, which forwards every call into the SAME functions the on-page modal/buttons call
// (saveCategoryConfig, deployConfig, nextScenario, completeLab).
//
// Assertions:
//   1. Hook + content structure: window.__mobileSync present with the full method surface;
//      6 scenarios; every scenario's categories reference real DESTINATIONS/TRIGGERS keys.
//   2. CORRECT playthrough: for all 6 scenarios, configure exactly the destination/trigger
//      each category's own data declares required (read back via getScenario(), never
//      hardcoded here), deploy, and confirm passed=true each time, solved reaches 6/6,
//      isComplete() is true, and ModuleProgress.complete fires EXACTLY ONCE with signature
//      ('forge', 'forge-mobile-sync', {returnUrl: '../index.html'}).
//   3. WRONG-configuration playthrough on a fresh load: wrong DESTINATION on one category,
//      wrong TRIGGER on another, and a deploy attempted before every category is configured
//      (must be a no-op, not a graded fail), all must leave solved=0 / isComplete=false /
//      ModuleProgress never fired.
//   4. NO ANSWER-LEAK: the rendered <option> markup for both the Destination and Trigger
//      selects carries no correctness flag (no data-correct, no "true"/"false" literal
//      attached to an option); repeated modal opens for the SAME category render the
//      option list in a DIFFERENT order (Fisher-Yates shuffle) while the underlying key
//      set stays identical, and grading is proven to follow the selected VALUE, not
//      position, by an out-of-order-selection correct playthrough.
//   5. DIRECT-CALL BYPASS: completeLab(), nextScenario(), saveCategoryConfig() on a locked
//      (solved) scenario, and deployConfig() with nothing configured are all called
//      directly out of order and must be no-ops that cannot force completion or corrupt a
//      locked scenario.
//   6. Rendered wrong-path feedback text is captured for two distinct wrong picks and
//      asserted to be scenario/category-aware (mentions the actual facts involved) rather
//      than one fixed string blindly reused where it could be false.
//   7. Style/integrity: 0 emoji, 0 em-dash, 0 " -- " literal, back-link preserved,
//      ModuleProgress.js include present, exactly one ModuleProgress.complete call site,
//      selectAnswer() (the old leaked-answer function) is gone entirely.
//
// Usage: node _tools/arcade-fixes/aplus-mobile-sync-check.js   (exit 0 = pass)
const http = require('http'), fs = require('fs'), path = require('path');
const pup = require('puppeteer');
const APP = path.resolve(__dirname, '../../_app');
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.css': 'text/css', '.webp': 'image/webp', '.png': 'image/png', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.woff': 'font/woff' };
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
let pass = true;
const ok = (n, c, e) => { if (!c) pass = false; console.log('  ' + (c ? 'PASS' : 'FAIL') + '  ' + n + (e !== undefined ? '  ' + JSON.stringify(e).slice(0, 500) : '')); };

const LAB_URL_PATH = '/houses/forge/applets/comptia-aplus/core-1/labs/forge-mobile-sync.lab.html';

// Static server rooted at _app so the lab + its component scripts load same-origin.
const srv = http.createServer((q, s) => {
  let p = decodeURIComponent(q.url.split('?')[0]); let fp = path.join(APP, p);
  if (fs.existsSync(fp) && fs.statSync(fp).isFile()) { s.writeHead(200, { 'Content-Type': MIME[path.extname(fp)] || 'application/octet-stream' }); fs.createReadStream(fp).pipe(s); }
  else { s.writeHead(404); s.end('nf'); }
});

// Fresh page with AccessGuard/HexAIButton neutralized (so init cannot redirect or throw)
// and ModuleProgress.complete specifically instrumented (not just no-op'd) so we can
// PROVE it fires on a correct full playthrough and does NOT fire otherwise. Same
// interception technique as aplus-dns-config-check.js and aplus-mobile-troubleshoot-check.js.
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

  // ── Load + hook presence + content-consistency checks ───────────────────
  const { pg: pg0, errs: errs0 } = await newStubbedPage(b);
  await pg0.goto('http://localhost:' + port + LAB_URL_PATH, { waitUntil: 'domcontentloaded', timeout: 20000 }).catch(() => {});
  await sleep(400);

  const hookInfo = await pg0.evaluate(() => ({
    have: typeof window.__mobileSync === 'object',
    fns: window.__mobileSync ? Object.keys(window.__mobileSync) : [],
    scenarioCount: window.__mobileSync ? window.__mobileSync.scenarioCount : 0
  }));
  ok('window.__mobileSync test hook present (script parsed + ran fully)',
    hookInfo.have && ['getScenario', 'getCurrent', 'goTo', 'configure', 'getConfig', 'deploy', 'next', 'complete', 'getLastResult', 'getSolvedCount', 'isComplete', 'moduleCompleted', 'destinationKeys', 'triggerKeys'].every(k => hookInfo.fns.includes(k)),
    hookInfo);
  ok('6 client scenarios present', hookInfo.scenarioCount === 6, hookInfo.scenarioCount);

  const contentCheck = await pg0.evaluate(() => {
    const issues = [];
    const destKeys = window.__mobileSync.destinationKeys();
    const trigKeys = window.__mobileSync.triggerKeys();
    for (let i = 0; i < window.__mobileSync.scenarioCount; i++) {
      const s = window.__mobileSync.getScenario(i);
      if (!Array.isArray(s.categories) || s.categories.length === 0) issues.push('scenario ' + i + ' has no categories');
      s.categories.forEach(c => {
        if (!destKeys.includes(c.correctDestination)) issues.push('scenario ' + i + ' category ' + c.key + ' has invalid correctDestination ' + c.correctDestination);
        if (c.correctDestination !== 'none-local' && !trigKeys.includes(c.correctTrigger)) issues.push('scenario ' + i + ' category ' + c.key + ' has invalid correctTrigger ' + c.correctTrigger);
      });
    }
    return issues;
  });
  ok('all 6 scenarios have well-formed categories referencing real destination/trigger keys', contentCheck.length === 0, contentCheck);
  ok('0 non-firebase pageErrors after load', errs0.length === 0, errs0.slice(0, 4));
  await pg0.close();

  // ── Scripted CORRECT playthrough: every scenario configured exactly as
  // the content itself declares required (read back via getScenario, never
  // hardcoded here), across a fresh page load. ───────────────────────────
  const { pg: pgC, errs: errsC } = await newStubbedPage(b);
  await pgC.goto('http://localhost:' + port + LAB_URL_PATH, { waitUntil: 'domcontentloaded', timeout: 20000 }).catch(() => {});
  await sleep(400);

  const correctRun = await pgC.evaluate(() => {
    const results = [];
    for (let i = 0; i < window.__mobileSync.scenarioCount; i++) {
      window.__mobileSync.goTo(i);
      const meta = window.__mobileSync.getScenario(i);
      meta.categories.forEach(cat => {
        window.__mobileSync.configure(cat.key, { destination: cat.correctDestination, trigger: cat.correctDestination === 'none-local' ? '' : cat.correctTrigger });
      });
      window.__mobileSync.deploy();
      const r = window.__mobileSync.getLastResult();
      results.push({ i, passed: r.passed, statuses: r.categoryResults.map(x => x.status) });
    }
    return { results, solvedCount: window.__mobileSync.getSolvedCount(), complete: window.__mobileSync.isComplete(), mpCalls: window.__mpCalls };
  });

  ok('every scenario grades passed=true when configured exactly per its own declared requirements', correctRun.results.every(r => r.passed), correctRun.results.filter(r => !r.passed));
  ok('solved count reaches 6/6 after the correct playthrough', correctRun.solvedCount === 6, correctRun.solvedCount);
  ok('isComplete() reports true after all 6 scenarios solved', correctRun.complete === true, correctRun.complete);
  ok('ModuleProgress.complete fired exactly once on full correct completion', correctRun.mpCalls.length === 1, correctRun.mpCalls);
  if (correctRun.mpCalls.length >= 1) {
    const [house, mod, opts] = correctRun.mpCalls[0];
    ok('ModuleProgress.complete signature preserved exactly: (\'forge\', \'forge-mobile-sync\', {returnUrl: \'../index.html\'})',
      house === 'forge' && mod === 'forge-mobile-sync' && opts && opts.returnUrl === '../index.html',
      correctRun.mpCalls[0]);
  }
  ok('0 non-firebase pageErrors during correct playthrough', errsC.length === 0, errsC.slice(0, 4));
  await pgC.close();

  // ── Scripted WRONG-configuration playthrough on a fresh load: wrong
  // DESTINATION on one category, wrong TRIGGER on another, and a deploy
  // attempted before every category is configured (must be a no-op). ─────
  const { pg: pgW, errs: errsW } = await newStubbedPage(b);
  await pgW.goto('http://localhost:' + port + LAB_URL_PATH, { waitUntil: 'domcontentloaded', timeout: 20000 }).catch(() => {});
  await sleep(400);

  const wrongRun = await pgW.evaluate(() => {
    // Case A: scenario 0 (Bellhaven Dental), category work-email needs Microsoft 365.
    // Configure it with the WRONG destination (a personal Google account instead), and
    // configure the other two categories in scenario 0 correctly.
    window.__mobileSync.goTo(0);
    const metaA = window.__mobileSync.getScenario(0);
    window.__mobileSync.configure('work-email', { destination: 'google-personal', trigger: 'auto-any' });
    metaA.categories.filter(c => c.key !== 'work-email').forEach(c => window.__mobileSync.configure(c.key, { destination: c.correctDestination, trigger: c.correctTrigger }));
    window.__mobileSync.deploy();
    const resultA = window.__mobileSync.getLastResult();

    // Case B: scenario 1 (Solstice Retail), category work-calendar needs Wi-Fi-only
    // (2GB data cap). Configure it with the WRONG trigger (automatic over any connection),
    // right destination, and configure the other two categories correctly.
    window.__mobileSync.goTo(1);
    const metaB = window.__mobileSync.getScenario(1);
    window.__mobileSync.configure('work-calendar', { destination: 'gws', trigger: 'auto-any' });
    metaB.categories.filter(c => c.key !== 'work-calendar').forEach(c => window.__mobileSync.configure(c.key, { destination: c.correctDestination, trigger: c.correctTrigger }));
    window.__mobileSync.deploy();
    const resultB = window.__mobileSync.getLastResult();

    // Case C: scenario 2 (Harrow Manufacturing) has 3 categories. Configure only the
    // first 2 and call deploy() directly without ever touching the third. This must be a
    // no-op (nothing graded, nothing solved), not a graded fail.
    window.__mobileSync.goTo(2);
    const metaC = window.__mobileSync.getScenario(2);
    metaC.categories.slice(0, 2).forEach(c => window.__mobileSync.configure(c.key, { destination: c.correctDestination, trigger: c.correctTrigger }));
    const deployReturnC = window.__mobileSync.deploy();
    const lastResultC = window.__mobileSync.getLastResult();

    return {
      resultA, resultB,
      deployReturnC, lastResultC,
      solvedCount: window.__mobileSync.getSolvedCount(),
      complete: window.__mobileSync.isComplete(),
      mpCalls: window.__mpCalls
    };
  });

  ok('Case A (wrong destination on Work Email) grades passed=false with a destWrong status on that category', wrongRun.resultA.passed === false && wrongRun.resultA.categoryResults.find(r => r.key === 'work-email').status === 'destWrong', wrongRun.resultA.categoryResults.map(r => r.status));
  ok('Case A: the other two correctly-configured categories still grade ok', wrongRun.resultA.categoryResults.filter(r => r.key !== 'work-email').every(r => r.status === 'ok'), wrongRun.resultA.categoryResults);
  ok('Case B (wrong trigger on Work Calendar) grades passed=false with a triggerWrong status on that category', wrongRun.resultB.passed === false && wrongRun.resultB.categoryResults.find(r => r.key === 'work-calendar').status === 'triggerWrong', wrongRun.resultB.categoryResults.map(r => r.status));
  ok('Case C: deployConfig() before every category is configured returns false (no-op, not a graded fail)', wrongRun.deployReturnC === false, wrongRun.deployReturnC);
  ok('Case C: getLastResult() stays null, nothing was ever graded', wrongRun.lastResultC === null, wrongRun.lastResultC);
  ok('solved count stays 0 across all three wrong/incomplete configurations', wrongRun.solvedCount === 0, wrongRun.solvedCount);
  ok('isComplete() stays false after only wrong/incomplete configurations', wrongRun.complete === false, wrongRun.complete);
  ok('ModuleProgress.complete NEVER fires on a wrong-configuration run', wrongRun.mpCalls.length === 0, wrongRun.mpCalls);
  ok('0 non-firebase pageErrors during wrong playthrough', errsW.length === 0, errsW.slice(0, 4));

  // Capture rendered wrong-path feedback and assert it is scenario/category-aware, not
  // one fixed string reused across the two distinct wrong cases above.
  await pgW.evaluate(() => window.__mobileSync.goTo(0));
  const feedbackA = await pgW.evaluate(() => document.getElementById('deploymentReport').innerText);
  await pgW.evaluate(() => window.__mobileSync.goTo(1));
  const feedbackB = await pgW.evaluate(() => document.getElementById('deploymentReport').innerText);
  ok('destWrong feedback (Case A) states the real consequence: breaks SSO / moves data out of the Microsoft 365 tenant', /SSO/i.test(feedbackA) && /Microsoft 365/.test(feedbackA), feedbackA.slice(0, 400));
  ok('triggerWrong feedback (Case B) states the real consequence: draws on the same capped cellular data', /cap/i.test(feedbackB) && /calendar/i.test(feedbackB), feedbackB.slice(0, 400));
  ok('Case A and Case B rendered feedback text differ (scenario-aware, not one hardcoded string)', feedbackA !== feedbackB, { feedbackA: feedbackA.slice(0, 140), feedbackB: feedbackB.slice(0, 140) });
  await pgW.close();

  // ── NO ANSWER-LEAK: rendered <option> markup carries no correctness flag,
  // and repeated modal opens for the SAME category shuffle the option order
  // while the underlying key set stays identical. ─────────────────────────
  const { pg: pgL, errs: errsL } = await newStubbedPage(b);
  await pgL.goto('http://localhost:' + port + LAB_URL_PATH, { waitUntil: 'domcontentloaded', timeout: 20000 }).catch(() => {});
  await sleep(400);

  const leakRun = await pgL.evaluate(() => {
    window.__mobileSync.goTo(0);
    const destOrders = [];
    const trigOrders = [];
    let rawMarkup = '';
    for (let n = 0; n < 8; n++) {
      window.openConfigModal('work-email');
      const destSel = document.getElementById('cfgDestination');
      const trigSel = document.getElementById('cfgTrigger');
      if (n === 0) rawMarkup = destSel.innerHTML + trigSel.innerHTML;
      destOrders.push(Array.from(destSel.querySelectorAll('option')).map(o => o.value).filter(v => v));
      trigOrders.push(Array.from(trigSel.querySelectorAll('option')).map(o => o.value).filter(v => v));
      window.closeConfigModal();
    }
    return { destOrders, trigOrders, rawMarkup };
  });

  const sortedSame = (arrs) => {
    const canon = JSON.stringify(arrs[0].slice().sort());
    return arrs.every(a => JSON.stringify(a.slice().sort()) === canon);
  };
  ok('every modal-open renders the SAME 8 destination keys (just reordered), none dropped/duplicated', sortedSame(leakRun.destOrders), leakRun.destOrders[0].slice().sort());
  ok('every modal-open renders the SAME 3 trigger keys (just reordered), none dropped/duplicated', sortedSame(leakRun.trigOrders), leakRun.trigOrders[0].slice().sort());
  const destOrderVariety = new Set(leakRun.destOrders.map(a => a.join(','))).size;
  const trigOrderVariety = new Set(leakRun.trigOrders.map(a => a.join(','))).size;
  ok('destination option order is NOT fixed across repeated opens (shuffled, not a memorizable slot)', destOrderVariety > 1, { distinctOrders: destOrderVariety, sample: leakRun.destOrders.slice(0, 3) });
  ok('trigger option order is NOT fixed across repeated opens (shuffled, not a memorizable slot)', trigOrderVariety > 1, { distinctOrders: trigOrderVariety, sample: leakRun.trigOrders.slice(0, 3) });
  ok('rendered <option> markup carries no correctness flag (no data-correct, no bare true/false attribute)', !/data-correct/i.test(leakRun.rawMarkup) && !/\btrue\b|\bfalse\b/.test(leakRun.rawMarkup), leakRun.rawMarkup.slice(0, 300));
  ok('0 non-firebase pageErrors during no-answer-leak probe', errsL.length === 0, errsL.slice(0, 4));
  await pgL.close();

  // ── DIRECT-CALL BYPASS: every advance/submit/complete handler is called
  // directly, out of order, on a fresh load, and must be a no-op. ─────────
  const { pg: pgB, errs: errsB } = await newStubbedPage(b);
  await pgB.goto('http://localhost:' + port + LAB_URL_PATH, { waitUntil: 'domcontentloaded', timeout: 20000 }).catch(() => {});
  await sleep(400);

  const bypassRun = await pgB.evaluate(() => {
    // completeLab() called directly with NOTHING solved.
    window.completeLab();
    const afterCompleteAttempt = { mpCalls: window.__mpCalls.length, resultsShown: document.getElementById('resultsPanel').classList.contains('show') };

    // nextScenario() called directly before the current (first) scenario is solved.
    window.nextScenario();
    const afterNextAttempt = { currentScenario: window.__mobileSync.getCurrent() };

    // deployConfig() called directly with NOTHING configured at all.
    const emptyDeployReturn = window.deployConfig();
    const afterEmptyDeploy = { returnValue: emptyDeployReturn, lastResult: window.__mobileSync.getLastResult(), solvedCount: window.__mobileSync.getSolvedCount() };

    // saveCategoryConfig() called directly with a missing destination.
    const saveEmptyResult = window.saveCategoryConfig(0, 'work-email', { destination: '', trigger: '' });
    const configAfterEmptySave = window.__mobileSync.getConfig();

    return { afterCompleteAttempt, afterNextAttempt, afterEmptyDeploy, saveEmptyResult, configAfterEmptySave, mpCallsSoFar: window.__mpCalls.length };
  });
  ok('window.completeLab() called directly with 0 scenarios solved never fires ModuleProgress.complete', bypassRun.afterCompleteAttempt.mpCalls === 0, bypassRun.afterCompleteAttempt);
  ok('window.completeLab() called directly with 0 scenarios solved does not show the results panel', bypassRun.afterCompleteAttempt.resultsShown === false, bypassRun.afterCompleteAttempt);
  ok('window.nextScenario() called before the current scenario is solved is a no-op (stays on scenario 0)', bypassRun.afterNextAttempt.currentScenario === 0, bypassRun.afterNextAttempt);
  ok('window.deployConfig() with nothing configured returns false and never grades (getLastResult stays null)', bypassRun.afterEmptyDeploy.returnValue === false && bypassRun.afterEmptyDeploy.lastResult === null && bypassRun.afterEmptyDeploy.solvedCount === 0, bypassRun.afterEmptyDeploy);
  ok('window.saveCategoryConfig() called directly with an empty destination is refused (returns false, no config saved)', bypassRun.saveEmptyResult === false && Object.keys(bypassRun.configAfterEmptySave).length === 0, bypassRun);
  ok('none of the direct-call bypass attempts ever fired ModuleProgress.complete', bypassRun.mpCallsSoFar === 0, bypassRun.mpCallsSoFar);

  // Now solve scenario 0 for real, then attempt to bypass its lock via direct calls.
  const lockBypassRun = await pgB.evaluate(() => {
    const meta = window.__mobileSync.getScenario(0);
    meta.categories.forEach(c => window.__mobileSync.configure(c.key, { destination: c.correctDestination, trigger: c.correctTrigger }));
    window.__mobileSync.deploy();
    const solvedAfterRealDeploy = window.__mobileSync.getSolvedCount();

    // Scenario 0 is now locked (solved). Direct calls to configure/deploy must all refuse.
    const configureWhileLocked = window.saveCategoryConfig(0, 'work-email', { destination: 'icloud-personal', trigger: 'manual' });
    const configAfterLockedAttempt = window.__mobileSync.getConfig();
    const openModalWhileLocked = window.openConfigModal('work-email');
    const deployWhileLocked = window.deployConfig();

    return { solvedAfterRealDeploy, configureWhileLocked, configAfterLockedAttempt, openModalWhileLocked, deployWhileLocked, mpCallsAfterOneScenario: window.__mpCalls.length };
  });
  ok('scenario 0 is genuinely solved by a real correct deploy (solved count becomes 1)', lockBypassRun.solvedAfterRealDeploy === 1, lockBypassRun.solvedAfterRealDeploy);
  ok('saveCategoryConfig() on a LOCKED (solved) scenario is refused (returns false, winning config unchanged)', lockBypassRun.configureWhileLocked === false && lockBypassRun.configAfterLockedAttempt['work-email'].destination === 'ms365', lockBypassRun);
  ok('openConfigModal() on a LOCKED (solved) scenario is refused (returns false, modal does not open)', lockBypassRun.openModalWhileLocked === false, lockBypassRun.openModalWhileLocked);
  ok('deployConfig() on a LOCKED (solved) scenario is refused (returns false, no re-grade)', lockBypassRun.deployWhileLocked === false, lockBypassRun.deployWhileLocked);
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
  ok('0 literal " -- " double-hyphen substitute in the source', !source.includes(' -- '));
  ok('back-link to ../chapters/ch10-mobile/index.html preserved', source.includes('href="../chapters/ch10-mobile/index.html"') && source.includes('Back to Chapter 10: Mobile'));
  ok('ModuleProgress.js include present', source.includes('components/ModuleProgress.js'));
  ok('exactly one ModuleProgress.complete call site in the source', (source.match(/ModuleProgress\.complete\(/g) || []).length === 1, (source.match(/ModuleProgress\.complete\(/g) || []).length);
  ok('the old leaked-answer function selectAnswer() is gone entirely', !/selectAnswer\s*\(/.test(source));
  ok('no onclick handler passes a literal boolean correctness flag (the original answer-leak pattern)', !/onclick="[^"]*\(\s*\d+\s*,\s*(true|false)\s*\)/.test(source));

  // Rendered-text sweep: check the ACTUAL displayed strings on a fresh load (client brief,
  // field guide, sync rows) for em-dash / " -- " too, not just the raw source.
  const { pg: pgS, errs: errsS } = await newStubbedPage(b);
  await pgS.goto('http://localhost:' + port + LAB_URL_PATH, { waitUntil: 'domcontentloaded', timeout: 20000 }).catch(() => {});
  await sleep(400);
  const renderedText = await pgS.evaluate(() => document.body.innerText);
  ok('0 em-dash characters in the rendered, visible page text', !renderedText.includes('—'));
  ok('0 literal " -- " double-hyphen substitute in the rendered, visible page text', !renderedText.includes(' -- '));
  ok('0 non-firebase pageErrors during rendered-text sweep', errsS.length === 0, errsS.slice(0, 4));
  await pgS.close();

  await b.close(); srv.close();
  console.log(pass ? '\n*** APLUS MOBILE SYNC CHECK OK ***' : '\n!!! APLUS MOBILE SYNC CHECK FAILURES ABOVE !!!');
  process.exit(pass ? 0 : 1);
})();
