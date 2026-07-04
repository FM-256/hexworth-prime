#!/usr/bin/env node
// aplus-dns-config-check.js -- regression gate for the CompTIA A+ Core 1 "DNS Configuration"
// lab after its rebuild from a ~15-option multiple-choice quiz (option buttons with
// data-correct) into a real "DNS Zone Architect" engine. The rebuild's whole point is that
// the student must CONFIGURE DNS: given a client's real requirement, add the actual A, AAAA,
// CNAME, MX, TXT, NS, or PTR records (with the right name, value, priority, and TTL where it
// matters) that satisfy it, not click through 4-option multiple choice.
//
// This ALSO regression-tests the known completion-credit bug: the previous version only ever
// called ModuleProgress.complete from a separate 10-question MC quiz tab gated at 70%, entirely
// disconnected from the DNS-building "Practice" tab. That MC path is gone; completion is now
// reachable ONLY by actually building 8 correct client zones. This harness proves completion now
// fires on a genuinely correct playthrough and stays unreachable otherwise.
//
// It loads the real lab HTML headless (no build step -- same file served to students), stubs
// AccessGuard/AchievementManager/ModuleProgress/HexAIButton the same way
// aplus-cloud-scenarios-check.js and aplus-troubleshooting-check.js do, and drives the real
// window.__dnsZone test hook, which forwards every call into the SAME functions the on-page
// modal/buttons call (addOrUpdateRecord, deleteRecord, deployZone, nextScenario, completeLab).
//
// Assertions:
//   1. Hook + content structure: window.__dnsZone present with the full method surface; 8
//      scenarios; every scenario's requiredRecords reference real TYPE_FACTS record types.
//   2. CORRECT playthrough: for all 8 scenarios, add exactly the records the scenario's own
//      data declares required (read back via getScenario(), never hardcoded here), deploy, and
//      confirm passed=true each time, solved reaches 8/8, isComplete() is true, and
//      ModuleProgress.complete fires EXACTLY ONCE with signature
//      ('forge', 'forge-dns-config', {returnUrl: '../index.html'}).
//   3. WRONG-configuration playthrough on a fresh load: wrong record TYPE, wrong VALUE, and
//      wrong MX PRIORITY, each on a different scenario, all must grade passed=false, and
//      isComplete()/mpCalls must never fire.
//   4. Zone-integrity (CNAME conflict) case: scenario 6 (Corvid Media) starts with a seeded
//      root A record; adding a CNAME at the same name must be flagged as a conflict and fail
//      deployment, and the seeded record must be un-deletable.
//   5. DIRECT-CALL BYPASS: completeLab(), nextScenario(), addOrUpdateRecord()/deleteRecord() on a
//      locked (solved) scenario, and deployZone() with an empty zone are all called directly out
//      of order and must be no-ops that cannot force completion or corrupt a locked zone.
//   6. Rendered wrong-path feedback text is captured for multiple distinct requirement/status
//      combinations and asserted to be requirement-aware (mentions the actual name/type/value
//      involved) rather than one fixed string blindly reused where it could be false.
//   7. Style/integrity: 0 emoji, 0 em-dash, back-link to ../index.html, ModuleProgress.js
//      include present, 0 non-platform-shim pageErrors.
//
// Usage: node _tools/arcade-fixes/aplus-dns-config-check.js   (exit 0 = pass)
const http = require('http'), fs = require('fs'), path = require('path');
const pup = require('puppeteer');
const APP = path.resolve(__dirname, '../../_app');
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.css': 'text/css', '.webp': 'image/webp', '.png': 'image/png', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.woff': 'font/woff' };
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
let pass = true;
const ok = (n, c, e) => { if (!c) pass = false; console.log('  ' + (c ? 'PASS' : 'FAIL') + '  ' + n + (e !== undefined ? '  ' + JSON.stringify(e).slice(0, 400) : '')); };

const LAB_URL_PATH = '/houses/forge/applets/comptia-aplus/core-1/labs/forge-dns-config.lab.html';

// Static server rooted at _app so the lab + its component scripts load same-origin.
const srv = http.createServer((q, s) => {
  let p = decodeURIComponent(q.url.split('?')[0]); let fp = path.join(APP, p);
  if (fs.existsSync(fp) && fs.statSync(fp).isFile()) { s.writeHead(200, { 'Content-Type': MIME[path.extname(fp)] || 'application/octet-stream' }); fs.createReadStream(fp).pipe(s); }
  else { s.writeHead(404); s.end('nf'); }
});

// Creates a fresh page with AccessGuard/AchievementManager/HexAIButton neutralized (so init
// cannot redirect or throw) and ModuleProgress.complete specifically instrumented (not just
// no-op'd) so we can PROVE it fires on a correct full playthrough and does NOT fire otherwise.
// Same interception technique as aplus-cloud-scenarios-check.js and aplus-troubleshooting-check.js.
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
    have: typeof window.__dnsZone === 'object',
    fns: window.__dnsZone ? Object.keys(window.__dnsZone) : [],
    scenarioCount: window.__dnsZone ? window.__dnsZone.scenarioCount : 0
  }));
  ok('window.__dnsZone test hook present (script parsed + ran fully)',
    hookInfo.have && ['getScenario', 'goTo', 'addRecord', 'editRecord', 'deleteRecord', 'resetZone', 'getZone', 'deploy', 'next', 'complete', 'getLastResult', 'getSolvedCount', 'isComplete'].every(k => hookInfo.fns.includes(k)),
    hookInfo);
  ok('8 client scenarios present', hookInfo.scenarioCount === 8, hookInfo.scenarioCount);

  const contentCheck = await pg0.evaluate(() => {
    const issues = [];
    const validTypes = ['A', 'AAAA', 'CNAME', 'MX', 'TXT', 'NS', 'PTR'];
    scenarios.forEach((s, i) => {
      if (!Array.isArray(s.requiredRecords) || s.requiredRecords.length === 0) issues.push('scenario ' + i + ' has no requiredRecords');
      s.requiredRecords.forEach(r => {
        if (!validTypes.includes(r.type)) issues.push('scenario ' + i + ' requirement ' + r.key + ' has invalid type ' + r.type);
        if (!r.value) issues.push('scenario ' + i + ' requirement ' + r.key + ' missing value');
        if (!r.desc || r.desc.length < 20) issues.push('scenario ' + i + ' requirement ' + r.key + ' missing/short desc');
        if (r.type === 'MX' && r.priority == null) issues.push('scenario ' + i + ' MX requirement ' + r.key + ' missing priority');
      });
    });
    return issues;
  });
  ok('all 8 scenarios have well-formed requiredRecords with real types + own desc text', contentCheck.length === 0, contentCheck);
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
    for (let i = 0; i < window.__dnsZone.scenarioCount; i++) {
      window.__dnsZone.goTo(i);
      const meta = window.__dnsZone.getScenario(i);
      meta.requiredRecords.forEach(req => {
        window.__dnsZone.addRecord({ name: req.name, type: req.type, value: req.value, priority: req.priority, ttl: req.ttlMax != null ? Math.min(300, req.ttlMax) : (req.ttlMin != null ? req.ttlMin : 3600) });
      });
      window.__dnsZone.deploy();
      const r = window.__dnsZone.getLastResult();
      results.push({ i, passed: r.passed, statuses: r.requirementResults.map(x => x.status) });
    }
    return { results, solvedCount: window.__dnsZone.getSolvedCount(), complete: window.__dnsZone.isComplete(), mpCalls: window.__mpCalls };
  });

  ok('every scenario grades passed=true when configured exactly per its own declared requirements', correctRun.results.every(r => r.passed), correctRun.results.filter(r => !r.passed));
  ok('solved count reaches 8/8 after the correct playthrough', correctRun.solvedCount === 8, correctRun.solvedCount);
  ok('isComplete() reports true after all 8 scenarios solved', correctRun.complete === true, correctRun.complete);
  ok('ModuleProgress.complete fired exactly once on full correct completion (the completion-credit bug fix)', correctRun.mpCalls.length === 1, correctRun.mpCalls);
  if (correctRun.mpCalls.length >= 1) {
    const [house, mod, opts] = correctRun.mpCalls[0];
    ok('ModuleProgress.complete signature preserved exactly: (\'forge\', \'forge-dns-config\', {returnUrl: \'../index.html\'})',
      house === 'forge' && mod === 'forge-dns-config' && opts && opts.returnUrl === '../index.html',
      correctRun.mpCalls[0]);
  }
  ok('0 non-firebase pageErrors during correct playthrough', errsC.length === 0, errsC.slice(0, 4));
  await pgC.close();

  // ── Scripted WRONG-configuration playthrough on a fresh load: wrong TYPE,
  // wrong VALUE, and wrong MX PRIORITY, each on a different scenario. ─────
  const { pg: pgW, errs: errsW } = await newStubbedPage(b);
  await pgW.goto('http://localhost:' + port + LAB_URL_PATH, { waitUntil: 'domcontentloaded', timeout: 20000 }).catch(() => {});
  await sleep(400);

  const wrongRun = await pgW.evaluate(() => {
    // Case A: scenario 0 (Northbridge Realty) needs A records. Add a CNAME instead (wrong type).
    window.__dnsZone.goTo(0);
    const metaA = window.__dnsZone.getScenario(0);
    window.__dnsZone.addRecord({ name: metaA.requiredRecords[0].name, type: 'CNAME', value: 'somewhere-else.example.com.', ttl: 3600 });
    window.__dnsZone.addRecord({ name: metaA.requiredRecords[1].name, type: metaA.requiredRecords[1].type, value: metaA.requiredRecords[1].value, ttl: 3600 });
    window.__dnsZone.deploy();
    const resultA = window.__dnsZone.getLastResult();

    // Case B: scenario 1 (Ferro and Vale Law) MX record needs value mail.ferrovalelaw.com. Use a
    // different (wrong) hostname value instead.
    window.__dnsZone.goTo(1);
    const metaB = window.__dnsZone.getScenario(1);
    window.__dnsZone.addRecord({ name: metaB.requiredRecords[0].name, type: 'MX', value: 'wrong-mailhost.example.com.', priority: metaB.requiredRecords[0].priority, ttl: 3600 });
    window.__dnsZone.addRecord({ name: metaB.requiredRecords[1].name, type: metaB.requiredRecords[1].type, value: metaB.requiredRecords[1].value, ttl: 3600 });
    window.__dnsZone.deploy();
    const resultB = window.__dnsZone.getLastResult();

    // Case C: scenario 4 (Beacon Freight, index 4) needs mail1 at priority 10, mail2 at priority
    // 20. Swap the priorities (wrong priority, right hostnames).
    window.__dnsZone.goTo(4);
    const metaC = window.__dnsZone.getScenario(4);
    window.__dnsZone.addRecord({ name: metaC.requiredRecords[0].name, type: 'MX', value: metaC.requiredRecords[0].value, priority: 20, ttl: 3600 }); // wrong: should be 10
    window.__dnsZone.addRecord({ name: metaC.requiredRecords[1].name, type: 'MX', value: metaC.requiredRecords[1].value, priority: 10, ttl: 3600 }); // wrong: should be 20
    window.__dnsZone.addRecord({ name: metaC.requiredRecords[2].name, type: metaC.requiredRecords[2].type, value: metaC.requiredRecords[2].value, ttl: 3600 });
    window.__dnsZone.addRecord({ name: metaC.requiredRecords[3].name, type: metaC.requiredRecords[3].type, value: metaC.requiredRecords[3].value, ttl: 3600 });
    window.__dnsZone.deploy();
    const resultC = window.__dnsZone.getLastResult();

    return {
      resultA, resultB, resultC,
      solvedCount: window.__dnsZone.getSolvedCount(),
      complete: window.__dnsZone.isComplete(),
      mpCalls: window.__mpCalls
    };
  });

  ok('Case A (CNAME where an A record is required) grades passed=false with a wrongType status', wrongRun.resultA.passed === false && wrongRun.resultA.requirementResults[0].status === 'wrongType', wrongRun.resultA.requirementResults.map(r => r.status));
  ok('Case B (wrong MX target hostname) grades passed=false with a wrongValue status', wrongRun.resultB.passed === false && wrongRun.resultB.requirementResults[0].status === 'wrongValue', wrongRun.resultB.requirementResults.map(r => r.status));
  ok('Case C (mail1/mail2 MX priorities swapped) grades passed=false with wrongPriority on both MX requirements', wrongRun.resultC.passed === false && wrongRun.resultC.requirementResults[0].status === 'wrongPriority' && wrongRun.resultC.requirementResults[1].status === 'wrongPriority', wrongRun.resultC.requirementResults.map(r => r.status));
  ok('solved count stays 0 across all three wrong configurations', wrongRun.solvedCount === 0, wrongRun.solvedCount);
  ok('isComplete() stays false after only wrong configurations', wrongRun.complete === false, wrongRun.complete);
  ok('ModuleProgress.complete NEVER fires on a wrong-configuration run', wrongRun.mpCalls.length === 0, wrongRun.mpCalls);
  ok('0 non-firebase pageErrors during wrong playthrough', errsW.length === 0, errsW.slice(0, 4));

  // Capture rendered wrong-path feedback and assert it is requirement-aware, not one fixed
  // string reused across the three distinct wrong cases above. loadScenario() restores each
  // scenario's OWN stored lastResult report on navigation, so explicitly go back to each
  // scenario before reading its report text (the harness left currentScenario on 4 after Case C).
  await pgW.evaluate(() => window.__dnsZone.goTo(0));
  const feedbackA = await pgW.evaluate(() => document.getElementById('deploymentReport').innerText);
  await pgW.evaluate(() => window.__dnsZone.goTo(1));
  const feedbackB = await pgW.evaluate(() => document.getElementById('deploymentReport').innerText);
  ok('wrongType feedback (Case A, still visible since B was rendered after navigating back) mentions the specific record types involved', /CNAME/.test(feedbackA) && /A record/.test(feedbackA), feedbackA.slice(0, 300));
  ok('wrongValue feedback (Case B) mentions the specific wrong and expected hostnames, not a generic reused sentence', feedbackB.includes('wrong-mailhost.example.com') && feedbackB.includes('mail.ferrovalelaw.com'), feedbackB.slice(0, 300));
  ok('Case A and Case B rendered feedback text differ (requirement-aware, not one hardcoded string)', feedbackA !== feedbackB, { feedbackA: feedbackA.slice(0, 120), feedbackB: feedbackB.slice(0, 120) });
  await pgW.close();

  // ── Zone-integrity (CNAME conflict) case: scenario 5 (index 5, Corvid
  // Media) starts with a seeded root A record. Adding a CNAME at the same
  // name must be flagged as a conflict, fail deployment, and the seeded
  // record must remain un-deletable. ──────────────────────────────────────
  const { pg: pgI, errs: errsI } = await newStubbedPage(b);
  await pgI.goto('http://localhost:' + port + LAB_URL_PATH, { waitUntil: 'domcontentloaded', timeout: 20000 }).catch(() => {});
  await sleep(400);

  const integrityRun = await pgI.evaluate(() => {
    window.__dnsZone.goTo(5);
    const meta = window.__dnsZone.getScenario(5);
    const seededBefore = window.__dnsZone.getZone();

    // Try to delete the seeded root A record directly -- must be refused.
    const deleteAttempt = window.__dnsZone.deleteRecord(0);
    const zoneAfterDeleteAttempt = window.__dnsZone.getZone();

    // Add the correct required ftp CNAME, then ALSO add a wrong extra CNAME at "@" (root),
    // which the seeded A record already occupies -- a real, universal CNAME conflict.
    meta.requiredRecords.forEach(req => window.__dnsZone.addRecord({ name: req.name, type: req.type, value: req.value, ttl: 3600 }));
    window.__dnsZone.addRecord({ name: '@', type: 'CNAME', value: 'somewhere.example.net.', ttl: 3600 });
    window.__dnsZone.deploy();
    const result = window.__dnsZone.getLastResult();
    const reportText = document.getElementById('deploymentReport').innerText;

    return { seededCount: seededBefore.length, deleteAttempt, zoneAfterDeleteAttemptCount: zoneAfterDeleteAttempt.length, passed: result.passed, integrityOk: result.zoneIntegrity.ok, conflicts: result.zoneIntegrity.conflicts, reportText, solvedCount: window.__dnsZone.getSolvedCount() };
  });
  ok('scenario 6 (Corvid Media) starts with 1 seeded existing record', integrityRun.seededCount === 1, integrityRun.seededCount);
  ok('deleteRecord() on a seeded record is refused (returns false, zone unchanged)', integrityRun.deleteAttempt === false && integrityRun.zoneAfterDeleteAttemptCount === 1, integrityRun);
  ok('adding a CNAME at "@" where a seeded A record already exists is flagged as a zone-integrity conflict', integrityRun.integrityOk === false && integrityRun.conflicts.includes('@'), integrityRun.conflicts);
  ok('the CNAME-conflict deployment grades passed=false even though the required ftp CNAME was itself correct', integrityRun.passed === false, integrityRun.passed);
  ok('the rendered report explains the CNAME-coexistence rule by name', /CNAME/.test(integrityRun.reportText) && /coexist/.test(integrityRun.reportText), integrityRun.reportText.slice(0, 300));
  ok('scenario 6 not counted as solved while a zone-integrity conflict exists', integrityRun.solvedCount === 0, integrityRun.solvedCount);
  ok('0 non-firebase pageErrors during zone-integrity probe', errsI.length === 0, errsI.slice(0, 4));
  await pgI.close();

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
    const afterNextAttempt = { currentScenario: window.__dnsZone.getCurrent() };

    // deployZone() called directly with an empty zone (no records added at all).
    window.deployZone();
    const afterEmptyDeploy = { passed: window.__dnsZone.getLastResult().passed, solvedCount: window.__dnsZone.getSolvedCount() };

    // addOrUpdateRecord() called directly with missing fields (no type, no value).
    const addEmptyResult = window.addOrUpdateRecord({ name: 'x' }, null);
    const zoneAfterEmptyAdd = window.__dnsZone.getZone().length;

    return { afterCompleteAttempt, afterNextAttempt, afterEmptyDeploy, addEmptyResult, zoneAfterEmptyAdd, mpCallsSoFar: window.__mpCalls.length };
  });
  ok('window.completeLab() called directly with 0 scenarios solved never fires ModuleProgress.complete', bypassRun.afterCompleteAttempt.mpCalls === 0, bypassRun.afterCompleteAttempt);
  ok('window.completeLab() called directly with 0 scenarios solved does not show the results panel', bypassRun.afterCompleteAttempt.resultsShown === false, bypassRun.afterCompleteAttempt);
  ok('window.nextScenario() called before the current scenario is solved is a no-op (stays on scenario 0)', bypassRun.afterNextAttempt.currentScenario === 0, bypassRun.afterNextAttempt);
  ok('window.deployZone() on an empty zone grades passed=false without throwing, and solved count stays 0', bypassRun.afterEmptyDeploy.passed === false && bypassRun.afterEmptyDeploy.solvedCount === 0, bypassRun.afterEmptyDeploy);
  ok('window.addOrUpdateRecord() called directly with missing type/value is refused (returns false, zone unchanged)', bypassRun.addEmptyResult === false && bypassRun.zoneAfterEmptyAdd === 0, bypassRun);
  ok('none of the direct-call bypass attempts ever fired ModuleProgress.complete', bypassRun.mpCallsSoFar === 0, bypassRun.mpCallsSoFar);

  // Now solve scenario 0 for real, then attempt to bypass its lock via direct calls.
  const lockBypassRun = await pgB.evaluate(() => {
    const meta = window.__dnsZone.getScenario(0);
    meta.requiredRecords.forEach(req => window.__dnsZone.addRecord({ name: req.name, type: req.type, value: req.value, ttl: 3600 }));
    window.__dnsZone.deploy();
    const solvedAfterRealDeploy = window.__dnsZone.getSolvedCount();

    // Scenario 0 is now locked (solved). Direct calls to add/edit/delete/reset must all refuse.
    const addWhileLocked = window.addOrUpdateRecord({ name: 'extra', type: 'A', value: '9.9.9.9', ttl: 3600 }, null);
    const zoneSizeAfterLockedAdd = window.__dnsZone.getZone().length;
    const deleteWhileLocked = window.deleteRecord(0);
    const resetWhileLocked = window.resetZone();

    return { solvedAfterRealDeploy, addWhileLocked, zoneSizeAfterLockedAdd, deleteWhileLocked, resetWhileLocked, mpCallsAfterOneScenario: window.__mpCalls.length };
  });
  ok('scenario 0 is genuinely solved by a real correct deploy (solved count becomes 1)', lockBypassRun.solvedAfterRealDeploy === 1, lockBypassRun.solvedAfterRealDeploy);
  ok('addOrUpdateRecord() on a LOCKED (solved) scenario is refused (returns false, zone size unchanged)', lockBypassRun.addWhileLocked === false && lockBypassRun.zoneSizeAfterLockedAdd === 2, lockBypassRun);
  ok('deleteRecord() on a LOCKED (solved) scenario is refused (returns false)', lockBypassRun.deleteWhileLocked === false, lockBypassRun.deleteWhileLocked);
  ok('resetZone() on a LOCKED (solved) scenario is refused (returns false)', lockBypassRun.resetWhileLocked === false, lockBypassRun.resetWhileLocked);
  ok('ModuleProgress.complete still has not fired after only 1 of 8 scenarios solved', lockBypassRun.mpCallsAfterOneScenario === 0, lockBypassRun.mpCallsAfterOneScenario);
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
  ok('back-link to ../index.html present', source.includes('href="../index.html"') && source.includes('Back to Core 1'));
  ok('ModuleProgress.js include present', source.includes('components/ModuleProgress.js'));
  ok('exactly one ModuleProgress.complete call site in the source', (source.match(/ModuleProgress\.complete\(/g) || []).length === 1, (source.match(/ModuleProgress\.complete\(/g) || []).length);

  await b.close(); srv.close();
  console.log(pass ? '\n*** APLUS DNS CONFIG CHECK OK ***' : '\n!!! APLUS DNS CONFIG CHECK FAILURES ABOVE !!!');
  process.exit(pass ? 0 : 1);
})();
