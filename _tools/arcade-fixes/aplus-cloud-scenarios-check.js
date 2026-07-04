#!/usr/bin/env node
// aplus-cloud-scenarios-check.js — headless self-check for the rebuilt
// forge-cloud-scenarios.lab.html (CompTIA A+ 220-1101 Objective 4.1: cloud
// service models, deployment models, characteristics).
//
// The old version was a 43-option multiple-choice quiz (one click per
// scenario). The rebuild is a "Cloud Solutions Architect Workbench": for
// each of 8 real client scenarios the student CONFIGURES a solution across
// three independent axes (service model, deployment model, and a multi-
// select set of characteristics) and clicks Deploy Configuration. The
// engine grades all three axes together, requires an EXACT characteristic
// set match plus the correct service+deployment pair to mark a scenario
// solved, and only calls ModuleProgress.complete once every one of the 8
// scenarios has been solved at least once.
//
// This check proves that binding is real, not decorative:
//   1. The script parses/loads and the test hooks (window.__cloudArch) and
//      the scenario/reference data are present and internally consistent
//      (every scenario's correctCharacteristics keys are real CHARACTERISTICS
//      keys; every scenario has feedback text for every possible service and
//      deployment choice, not just the correct one).
//   2. A scripted CORRECT playthrough: for every scenario, drive
//      setService/setDeployment/setCharacteristics with the scenario's own
//      declared correct answer (read back via getScenario(i), never
//      hardcoded here, so this test can't drift from the content) and call
//      deploy(). Every scenario must grade passed=true, isComplete() must
//      become true after the 8th, and ModuleProgress.complete must fire
//      exactly once with the exact preserved signature
//      ('forge', 'forge-cloud-scenarios', {returnUrl: '../index.html'}).
//   3. A scripted WRONG playthrough on a fresh page load: deliberately picks
//      SaaS where the client explicitly needs OS-level control (scenario 3,
//      Trailhead DevWorks needs IaaS) and picks Public where the client has
//      an explicit data-sovereignty/dedicated-hardware requirement (scenario
//      2, Meridian Trust Bank needs Private) -- both are called out by name
//      in the task brief. Both must grade passed=false with the specific
//      consequence text, isComplete() must remain false, and
//      ModuleProgress.complete must NOT fire.
//   4. A scripted "almost right" case: correct service+deployment but a
//      characteristic set that is either missing a required tag or has an
//      extra unneeded tag must also grade passed=false (proves the
//      characteristics axis is not decorative either).
//
// Usage: node _tools/arcade-fixes/aplus-cloud-scenarios-check.js   (exit 0 = pass)
const http = require('http'), fs = require('fs'), path = require('path');
const pup = require('puppeteer');
const APP = path.resolve(__dirname, '../../_app');
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.css': 'text/css', '.webp': 'image/webp', '.png': 'image/png', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.woff': 'font/woff' };
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
let pass = true;
const ok = (n, c, e) => { if (!c) pass = false; console.log('  ' + (c ? 'PASS' : 'FAIL') + '  ' + n + (e !== undefined ? '  ' + JSON.stringify(e).slice(0, 400) : '')); };

const LAB_URL_PATH = '/houses/forge/applets/comptia-aplus/core-1/labs/forge-cloud-scenarios.lab.html';

// Static server rooted at _app so the lab + its component scripts load same-origin.
const srv = http.createServer((q, s) => {
  let p = decodeURIComponent(q.url.split('?')[0]); let fp = path.join(APP, p);
  if (fs.existsSync(fp) && fs.statSync(fp).isFile()) { s.writeHead(200, { 'Content-Type': MIME[path.extname(fp)] || 'application/octet-stream' }); fs.createReadStream(fp).pipe(s); }
  else { s.writeHead(404); s.end('nf'); }
});

// Creates a fresh page with AccessGuard/AchievementManager/HexAIButton
// neutralized (so init cannot redirect or throw) and ModuleProgress.complete
// specifically instrumented (not just no-op'd) so we can PROVE it fires on a
// correct full playthrough and does NOT fire on a wrong one. This is the
// same interception technique used by cloud-hop-check.js and
// subnet-siege-winnability.js elsewhere in this directory.
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

  // ── Load + hook presence + content-consistency checks ───────────────────
  const { pg: pg0, errs: errs0 } = await newStubbedPage(b);
  await pg0.goto('http://localhost:' + port + LAB_URL_PATH, { waitUntil: 'domcontentloaded', timeout: 20000 }).catch(() => {});
  await sleep(400);

  const hookInfo = await pg0.evaluate(() => ({
    have: typeof window.__cloudArch === 'object',
    fns: window.__cloudArch ? Object.keys(window.__cloudArch) : [],
    scenarioCount: window.__cloudArch ? window.__cloudArch.scenarioCount : 0
  }));
  ok('window.__cloudArch test hook present (script parsed + ran fully)', hookInfo.have && ['getScenario', 'goTo', 'setService', 'setDeployment', 'setCharacteristics', 'deploy', 'getLastResult', 'getSolvedCount', 'isComplete'].every(k => hookInfo.fns.includes(k)), hookInfo);
  ok('8 client scenarios present', hookInfo.scenarioCount === 8, hookInfo.scenarioCount);

  // Structural sanity: every scenario has a correct service, correct deployment,
  // a non-empty characteristics set, and feedback text for EVERY service/deployment
  // option (not just the correct one) so a wrong pick always has real consequence text.
  const contentCheck = await pg0.evaluate(() => {
    const issues = [];
    const serviceKeys = ['iaas', 'paas', 'saas'];
    const deploymentKeys = ['public', 'private', 'hybrid', 'community'];
    const charKeys = Object.keys(CHARACTERISTICS);
    scenarios.forEach((s, i) => {
      if (!serviceKeys.includes(s.correctService)) issues.push('scenario ' + i + ' bad correctService ' + s.correctService);
      if (!deploymentKeys.includes(s.correctDeployment)) issues.push('scenario ' + i + ' bad correctDeployment ' + s.correctDeployment);
      if (!Array.isArray(s.correctCharacteristics) || s.correctCharacteristics.length === 0) issues.push('scenario ' + i + ' empty correctCharacteristics');
      s.correctCharacteristics.forEach(c => { if (!charKeys.includes(c)) issues.push('scenario ' + i + ' unknown characteristic key ' + c); });
      serviceKeys.forEach(k => { if (!s.serviceFeedback[k] || s.serviceFeedback[k].length < 20) issues.push('scenario ' + i + ' missing/short serviceFeedback for ' + k); });
      deploymentKeys.forEach(k => { if (!s.deploymentFeedback[k] || s.deploymentFeedback[k].length < 20) issues.push('scenario ' + i + ' missing/short deploymentFeedback for ' + k); });
    });
    return issues;
  });
  ok('all 8 scenarios have a valid correct config + full feedback text for every option', contentCheck.length === 0, contentCheck);

  ok('0 non-firebase pageErrors after load', errs0.length === 0, errs0.slice(0, 4));
  await pg0.close();

  // ── Scripted CORRECT playthrough: every scenario configured exactly as the
  // content itself declares correct (read back via getScenario, never
  // hardcoded here), across a fresh page load. ────────────────────────────
  const { pg: pgC, errs: errsC } = await newStubbedPage(b);
  await pgC.goto('http://localhost:' + port + LAB_URL_PATH, { waitUntil: 'domcontentloaded', timeout: 20000 }).catch(() => {});
  await sleep(400);

  const correctRun = await pgC.evaluate(() => {
    const results = [];
    for (let i = 0; i < window.__cloudArch.scenarioCount; i++) {
      window.__cloudArch.goTo(i);
      const meta = window.__cloudArch.getScenario(i);
      window.__cloudArch.setService(meta.correctService);
      window.__cloudArch.setDeployment(meta.correctDeployment);
      window.__cloudArch.setCharacteristics(meta.correctCharacteristics);
      window.__cloudArch.deploy();
      const r = window.__cloudArch.getLastResult();
      results.push({ i, passed: r.passed, serviceOk: r.serviceOk, deploymentOk: r.deploymentOk });
    }
    return { results, solvedCount: window.__cloudArch.getSolvedCount(), complete: window.__cloudArch.isComplete(), mpCalls: window.__mpCalls };
  });

  ok('every scenario grades passed=true when configured exactly per its own declared correct answer', correctRun.results.every(r => r.passed), correctRun.results.filter(r => !r.passed));
  ok('solved count reaches 8/8 after the correct playthrough', correctRun.solvedCount === 8, correctRun.solvedCount);
  ok('isComplete() reports true after all 8 scenarios solved', correctRun.complete === true, correctRun.complete);
  ok('ModuleProgress.complete fired exactly once on full correct completion', correctRun.mpCalls.length === 1, correctRun.mpCalls);
  if (correctRun.mpCalls.length >= 1) {
    const [house, mod, opts] = correctRun.mpCalls[0];
    ok('ModuleProgress.complete signature preserved exactly: (\'forge\', \'forge-cloud-scenarios\', {returnUrl: \'../index.html\'})',
      house === 'forge' && mod === 'forge-cloud-scenarios' && opts && opts.returnUrl === '../index.html',
      correctRun.mpCalls[0]);
  }
  ok('0 non-firebase pageErrors during correct playthrough', errsC.length === 0, errsC.slice(0, 4));
  await pgC.close();

  // ── Scripted WRONG playthrough on a fresh page load: exercises the two
  // wrong-configuration cases named in the task brief. ─────────────────────
  const { pg: pgW, errs: errsW } = await newStubbedPage(b);
  await pgW.goto('http://localhost:' + port + LAB_URL_PATH, { waitUntil: 'domcontentloaded', timeout: 20000 }).catch(() => {});
  await sleep(400);

  const wrongRun = await pgW.evaluate(() => {
    // Case A: scenario 2 (index 2, Trailhead DevWorks) explicitly needs IaaS
    // for OS-level/kernel driver control. Deliberately pick SaaS instead.
    window.__cloudArch.goTo(2);
    const metaA = window.__cloudArch.getScenario(2);
    window.__cloudArch.setService('saas'); // wrong: client needs OS-level control, not a finished app
    window.__cloudArch.setDeployment(metaA.correctDeployment);
    window.__cloudArch.setCharacteristics(metaA.correctCharacteristics);
    window.__cloudArch.deploy();
    const resultA = window.__cloudArch.getLastResult();

    // Case B: scenario 1 (index 1, Meridian Trust Bank) explicitly needs
    // Private deployment for a data-sovereignty/regulatory requirement.
    // Deliberately pick Public instead.
    window.__cloudArch.goTo(1);
    const metaB = window.__cloudArch.getScenario(1);
    window.__cloudArch.setService(metaB.correctService);
    window.__cloudArch.setDeployment('public'); // wrong: regulator requires dedicated hardware, not shared public
    window.__cloudArch.setCharacteristics(metaB.correctCharacteristics);
    window.__cloudArch.deploy();
    const resultB = window.__cloudArch.getLastResult();

    return {
      resultA, resultB,
      solvedCount: window.__cloudArch.getSolvedCount(),
      complete: window.__cloudArch.isComplete(),
      mpCalls: window.__mpCalls
    };
  });

  ok('Case A (SaaS picked where client needs OS-level control/IaaS) grades passed=false', wrongRun.resultA.passed === false, wrongRun.resultA);
  ok('Case A service axis is marked incorrect', wrongRun.resultA.serviceOk === false, wrongRun.resultA.serviceOk);
  ok('Case B (Public picked where client has a data-sovereignty/private requirement) grades passed=false', wrongRun.resultB.passed === false, wrongRun.resultB);
  ok('Case B deployment axis is marked incorrect', wrongRun.resultB.deploymentOk === false, wrongRun.resultB.deploymentOk);
  ok('solved count stays 0 (neither wrong config counts as solved)', wrongRun.solvedCount === 0, wrongRun.solvedCount);
  ok('isComplete() stays false after only wrong configurations', wrongRun.complete === false, wrongRun.complete);
  ok('ModuleProgress.complete NEVER fires on a wrong-configuration run', wrongRun.mpCalls.length === 0, wrongRun.mpCalls);
  ok('0 non-firebase pageErrors during wrong playthrough', errsW.length === 0, errsW.slice(0, 4));
  await pgW.close();

  // ── Characteristics axis is independently graded: correct service +
  // correct deployment but a wrong characteristic set (missing one required
  // tag) must still fail. Proves the third axis isn't decorative. ─────────
  const { pg: pgH, errs: errsH } = await newStubbedPage(b);
  await pgH.goto('http://localhost:' + port + LAB_URL_PATH, { waitUntil: 'domcontentloaded', timeout: 20000 }).catch(() => {});
  await sleep(400);

  const halfRun = await pgH.evaluate(() => {
    window.__cloudArch.goTo(0);
    const meta = window.__cloudArch.getScenario(0);
    window.__cloudArch.setService(meta.correctService);
    window.__cloudArch.setDeployment(meta.correctDeployment);
    // Drop the last required characteristic instead of selecting the full set.
    window.__cloudArch.setCharacteristics(meta.correctCharacteristics.slice(0, meta.correctCharacteristics.length - 1));
    window.__cloudArch.deploy();
    const missingCase = window.__cloudArch.getLastResult();

    // Now the full correct set PLUS one extra unneeded characteristic.
    const allKeys = ['rapidElasticity', 'highAvailability', 'meteredUsage', 'fileSync', 'sharedResources', 'vdi'];
    const excessKey = allKeys.find(k => !meta.correctCharacteristics.includes(k));
    window.__cloudArch.setCharacteristics([...meta.correctCharacteristics, excessKey]);
    window.__cloudArch.deploy();
    const excessCase = window.__cloudArch.getLastResult();

    return { missingCase, excessCase, solvedCount: window.__cloudArch.getSolvedCount() };
  });
  ok('correct service+deployment but a MISSING required characteristic still fails', halfRun.missingCase.passed === false, halfRun.missingCase);
  ok('correct service+deployment but an EXCESS unneeded characteristic still fails', halfRun.excessCase.passed === false, halfRun.excessCase);
  ok('scenario 0 never counted as solved during characteristics-axis probing', halfRun.solvedCount === 0, halfRun.solvedCount);
  ok('0 non-firebase pageErrors during characteristics-axis probe', errsH.length === 0, errsH.slice(0, 4));
  await pgH.close();

  await b.close(); srv.close();
  console.log(pass ? '\n*** APLUS CLOUD SCENARIOS CHECK OK ***' : '\n!!! APLUS CLOUD SCENARIOS CHECK FAILURES ABOVE !!!');
  process.exit(pass ? 0 : 1);
})();
