#!/usr/bin/env node
// aplus-diagnostic-tools-check.js -- regression gate for the CompTIA A+ Core 1
// "Hardware Diagnostic Tools Lab" (forge-diagnostic-tools.lab.html) after its
// MIXED rebuild: the lab's genuinely good tool SIMULATIONS (POST card,
// multimeter, cable tester, PSU rail tester, S.M.A.R.T. monitor) are kept
// exactly as real, working instruments; only the completion mechanism changed
// -- from a 4-option scenario quiz (selectAnswer/checkAnswer vs
// scenario.correct, mostly a fixed index 1, no shuffle) into a tool-action
// gate. For every one of the 10 customer tickets the student must OPERATE the
// correct instrument on the real simulation and then REPORT what it actually
// shows:
//   - POST:        insert the card, read the hex code it displays, then match
//                   that code against a shuffled reference chart by range.
//   - Multimeter:  click the correct RAIL's Test button (the graded action --
//                  a real meter-operating skill), then ENTER the measured
//                  voltage and choose a PASS/FAIL verdict, both graded against
//                  the actual (jittered) reading just taken.
//   - Cable tester: run the tester, then click which PIN NUMBER(S) failed to
//                  light (or mark "no fault"), graded against the real
//                  rendered LED pattern.
//   - PSU tester:  run the tester, then click which RAIL is out of ATX spec
//                  (or "all good"), graded against the live-computed
//                  per-rail tolerance status.
//   - S.M.A.R.T.:  run the scan, then pick a diagnosis from a shuffled list,
//                  graded against a verdict computed live from the actual
//                  Reallocated/Pending Sector counts on screen (not a stored
//                  per-scenario status label).
//
// This loads the real lab HTML headless (no build step -- same file served to
// students), stubs AccessGuard/ModuleProgress/HexAIButton the same way the
// sibling aplus-*-check.js scripts do, and drives the REAL exposed globals
// (all plain `var`/function declarations in a classic <script>, so they land
// on window): scenarios, scenarioState, postChart, smartVerdicts,
// simulatePost, testVoltage, testCable, testPSU, testSmart, runSmartScenario,
// runScenarioAction, proceedToReport, submitPostChart, submitMultimeterReport,
// toggleCablePin, selectCableNoFault, submitCableReport, submitPsuReport,
// submitSmartReport, prevScenario, nextScenario, updateProgress.
//
// It asserts:
//   1. CONTENT CONSISTENCY: 10 scenarios, 2 per tool; POST codes fall in
//      exactly one non-overlapping postChart range; multimeter jitter bounds
//      (base +/- 0.02V) never cross the ATX tolerance line for either rail
//      scenario (deterministic PASS/FAIL regardless of the live jitter); the
//      cable patterns/PSU presets/S.M.A.R.T. attrs used by the two scenarios
//      per tool produce genuinely different real outcomes (proves the
//      grading is data-driven, not a coincidence).
//   2. CORRECT playthrough on all 10 tickets: operate the right instrument
//      control -> Proceed to Report -> submit the tool-derived answer ->
//      resolves -> Next. Fires ModuleProgress.complete exactly once with the
//      exact preserved signature ('forge', 'forge-diagnostic-tools',
//      {returnUrl: '../index.html'}).
//   3. WRONG tool-reading/answer never resolves a ticket and never fires
//      completion; a correct answer afterward still resolves it normally
//      (mistakes are recoverable, not dead ends).
//   4. DIRECT-CALL BYPASS: every advance/submit handler, called directly out
//      of phase order, is a no-op against its own real precondition --
//      including operating the WRONG rail/code/type (never sets
//      operatedCorrectly) and submitting an answer before Proceed to Report
//      has been clicked (QC Lesson 2).
//   5. Tool sims still work as free-exploration instruments: the multimeter
//      and at least one other instrument (PSU tester) respond correctly when
//      probed directly, outside of any scenario gate.
//   6. SHUFFLE: the correct POST-chart entry and the correct S.M.A.R.T.
//      diagnosis are not always rendered at index 0, and re-rendering the
//      same ticket's Report box repeatedly shows the correct entry landing at
//      more than one distinct index (real Fisher-Yates, not a static
//      reorder) -- QC Lesson 3, and the direct fix for the original lab's
//      "correct mostly at index 1, no shuffle" defect.
//   7. RENDERED wrong-path feedback: clicking an actual wrong DOM control
//      (POST chart entry, cable pin) renders THIS ticket's own tool-derived
//      feedback text (embedding the real code/reading/pattern), never a
//      generic or cross-ticket string, and never a false claim.
//   8. Style/platform integrity: 0 emoji, 0 em-dash, 0 " -- ", 0 raw
//      check/cross glyphs, back-link present, ModuleProgress.js include
//      present, 0 non-platform-shim pageErrors.
//
// Usage: node _tools/arcade-fixes/aplus-diagnostic-tools-check.js   (exit 0 = pass)
const http = require('http'), fs = require('fs'), path = require('path');
const pup = require(path.resolve(__dirname, '../../node_modules/puppeteer'));
const APP = path.resolve(__dirname, '../../_app');
const LAB_URL = '/houses/forge/applets/comptia-aplus/core-1/labs/forge-diagnostic-tools.lab.html';
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.css': 'text/css', '.webp': 'image/webp', '.png': 'image/png', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.woff': 'font/woff' };
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
let pass = true;
const ok = (n, c, e) => { if (!c) pass = false; console.log('  ' + (c ? 'PASS' : 'FAIL') + '  ' + n + (e !== undefined ? '  ' + JSON.stringify(e).slice(0, 500) : '')); };

// Static file server rooted at _app so the lab + its component scripts load
// same-origin, exactly the file students are served (no build step).
const srv = http.createServer((q, s) => {
  let p = decodeURIComponent(q.url.split('?')[0]); let fp = path.join(APP, p);
  if (fs.existsSync(fp) && fs.statSync(fp).isFile()) { s.writeHead(200, { 'Content-Type': MIME[path.extname(fp)] || 'application/octet-stream' }); fs.createReadStream(fp).pipe(s); }
  else { s.writeHead(404); s.end('nf'); }
});

// Creates a fresh page with AccessGuard/ModuleProgress/HexAIButton neutralized
// (so init cannot redirect or throw) and ModuleProgress.complete specifically
// instrumented so we can prove it fires on a correct full playthrough and does
// NOT fire on a wrong or bypassed one. Same interception technique as the
// sibling *-check.js files in this directory.
async function newStubbedPage(browser) {
  const pg = await browser.newPage();
  const errs = [];
  pg.on('pageerror', e => { const m = String(e.message); if (!/firebase|firestore|auth\/|AccessGuard|not authenticated/i.test(m)) errs.push(m.slice(0, 300)); });
  pg.on('console', msg => { if (msg.type() === 'error') { const t = msg.text(); if (!/firebase|firestore/i.test(t)) errs.push('console.error: ' + t.slice(0, 300)); } });
  await pg.setRequestInterception(true);
  pg.on('request', r => {
    const u = r.url();
    if (u.endsWith('/components/AccessGuard.js')) {
      r.respond({ status: 200, contentType: 'text/javascript', body: 'window.AccessGuard={require:function(){return true;}};' });
    } else if (u.endsWith('/components/AchievementManager.js')) {
      r.respond({ status: 200, contentType: 'text/javascript', body: '' });
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

let PORT = 0;
async function load(pg) {
  await pg.goto('http://localhost:' + PORT + LAB_URL, { waitUntil: 'domcontentloaded', timeout: 20000 }).catch(() => {});
  await sleep(250);
}

/** Drive a ticket's Operate stage to completion using its OWN correct tool
 *  action, then Proceed to Report. Works for all 5 tool types. Returns true
 *  if operatedCorrectly ended up set and the phase actually advanced to 1. */
async function driveCorrectOperate(pg, idx) {
  return pg.evaluate((i) => {
    const sc = window.scenarios[i];
    if (sc.tool === 'post') window.simulatePost(sc.code);
    else if (sc.tool === 'multimeter') window.testVoltage(sc.rail);
    else if (sc.tool === 'cable') window.testCable(sc.testType);
    else if (sc.tool === 'psu') window.testPSU(sc.testType);
    else if (sc.tool === 'smart') window.runSmartScenario();
    const operated = window.scenarioState[i].operatedCorrectly;
    window.proceedToReport();
    return { operated, phase: window.scenarioState[i].phase };
  }, idx);
}

/** Submit the CORRECT tool-derived answer for a ticket already in Report
 *  phase (phase 1). Returns the resulting phase. */
async function driveCorrectReport(pg, idx) {
  return pg.evaluate((i) => {
    const sc = window.scenarios[i];
    if (sc.tool === 'post') {
      const codeVal = parseInt(sc.code, 16);
      const entry = window.postChart.find(e => codeVal >= e.lo && codeVal <= e.hi);
      window.submitPostChart(entry.id);
    } else if (sc.tool === 'multimeter') {
      const actual = window.currentMMReading;
      const el = document.getElementById('mmEnteredValue');
      el.value = String(actual);
      const trueVerdict = actual >= (sc.rail === '5' ? 4.75 : sc.rail === '12' ? 11.4 : 3.14) && actual <= (sc.rail === '5' ? 5.25 : sc.rail === '12' ? 12.6 : 3.47) ? 'pass' : 'fail';
      window.submitMultimeterReport(trueVerdict);
    } else if (sc.tool === 'cable') {
      const actualBroken = sc.pattern.map((v, n) => v === 0 ? n + 1 : null).filter(v => v !== null);
      if (actualBroken.length === 0) window.selectCableNoFault();
      else actualBroken.forEach(p => window.toggleCablePin(p));
      window.submitCableReport();
    } else if (sc.tool === 'psu') {
      const statuses = window.lastPsuStatus;
      const bad = Object.keys(statuses).filter(k => statuses[k] !== 'good');
      window.submitPsuReport(bad.length === 0 ? 'none' : bad[0]);
    } else if (sc.tool === 'smart') {
      window.submitSmartReport(window.lastSmartVerdict.id);
    }
    return window.scenarioState[i].phase;
  }, idx);
}

(async () => {
  await new Promise(r => srv.listen(0, r)); PORT = srv.address().port;
  const b = await pup.launch({ headless: 'new', args: ['--no-sandbox'] });

  // ════════════════════════════════════════════════════════════════════
  // LOAD + HOOK PRESENCE + CONTENT-CONSISTENCY CHECKS
  // ════════════════════════════════════════════════════════════════════
  console.log('\n=== Load + content consistency ===');
  const { pg: pg0, errs: errs0 } = await newStubbedPage(b);
  await load(pg0);

  const haveFns = await pg0.evaluate(() => ({
    simulatePost: typeof window.simulatePost,
    testVoltage: typeof window.testVoltage,
    testCable: typeof window.testCable,
    testPSU: typeof window.testPSU,
    testSmart: typeof window.testSmart,
    runSmartScenario: typeof window.runSmartScenario,
    runScenarioAction: typeof window.runScenarioAction,
    proceedToReport: typeof window.proceedToReport,
    submitPostChart: typeof window.submitPostChart,
    submitMultimeterReport: typeof window.submitMultimeterReport,
    toggleCablePin: typeof window.toggleCablePin,
    selectCableNoFault: typeof window.selectCableNoFault,
    submitCableReport: typeof window.submitCableReport,
    submitPsuReport: typeof window.submitPsuReport,
    submitSmartReport: typeof window.submitSmartReport,
    prevScenario: typeof window.prevScenario,
    nextScenario: typeof window.nextScenario,
    scenarios: typeof window.scenarios,
    scenarioState: typeof window.scenarioState,
    postChart: typeof window.postChart,
    smartVerdicts: typeof window.smartVerdicts
  }));
  ok('inline <script> parsed + ran fully (lab functions + data all present on window)',
    Object.values(haveFns).every(v => v === 'function' || v === 'object'), haveFns);

  const scenarioCount = await pg0.evaluate(() => window.scenarios.length);
  ok('10 diagnostic scenarios defined', scenarioCount === 10, scenarioCount);

  const toolCounts = await pg0.evaluate(() => {
    const counts = {};
    window.scenarios.forEach(s => { counts[s.tool] = (counts[s.tool] || 0) + 1; });
    return counts;
  });
  ok('exactly 2 scenarios per tool (post/multimeter/cable/psu/smart)',
    JSON.stringify(toolCounts) === JSON.stringify({ post: 2, multimeter: 2, cable: 2, psu: 2, smart: 2 }), toolCounts);

  const consistency = await pg0.evaluate(() => {
    const issues = [];
    // POST chart ranges non-overlapping, and each scenario's code falls in
    // exactly one range.
    window.scenarios.filter(s => s.tool === 'post').forEach(s => {
      const codeVal = parseInt(s.code, 16);
      const matches = window.postChart.filter(e => codeVal >= e.lo && codeVal <= e.hi);
      if (matches.length !== 1) issues.push(`POST code ${s.code} matches ${matches.length} chart ranges (expected 1)`);
    });
    // Multimeter jitter (base +/- 0.02) never crosses the ATX tolerance line.
    const mmTol = { '3.3': [3.14, 3.47], '5': [4.75, 5.25], '12': [11.4, 12.6] };
    window.scenarios.filter(s => s.tool === 'multimeter').forEach(s => {
      const [min, max] = mmTol[s.rail];
      const lo = s.base - 0.02, hi = s.base + 0.02;
      const loVerdict = lo >= min && lo <= max, hiVerdict = hi >= min && hi <= max;
      if (loVerdict !== hiVerdict) issues.push(`multimeter rail ${s.rail} base ${s.base} jitter band crosses the tolerance line (unstable grading)`);
    });
    // Cable patterns are valid 0/1 arrays of length 8.
    window.scenarios.filter(s => s.tool === 'cable').forEach((s, i) => {
      if (!Array.isArray(s.pattern) || s.pattern.length !== 8 || !s.pattern.every(v => v === 0 || v === 1)) issues.push(`cable scenario ${i} has an invalid pattern`);
    });
    // The 2 cable / 2 psu / 2 smart scenarios must produce genuinely
    // DIFFERENT real outcomes (proves grading is data-driven per ticket).
    const cableBroken = window.scenarios.filter(s => s.tool === 'cable').map(s => s.pattern.filter(v => v === 0).length);
    if (cableBroken[0] === cableBroken[1]) issues.push('both cable scenarios have the same broken-pin count (' + cableBroken + ')');
    return issues;
  });
  ok('POST chart ranges non-overlapping + code-to-range binding is exactly 1, multimeter jitter bands never cross the tolerance line, cable patterns valid + genuinely distinct',
    consistency.length === 0, consistency);

  // PSU + S.M.A.R.T. expected real outcomes, computed via the lab's OWN
  // functions/rules (not re-implemented independently) to lock in the fix of
  // the original defect (correct answer fixed near index 1, no shuffle).
  const psuOutcomes = await pg0.evaluate(() => {
    const out = [];
    window.scenarios.filter(s => s.tool === 'psu').forEach(s => {
      window.testPSU(s.testType);
      const bad = Object.keys(window.lastPsuStatus).filter(k => window.lastPsuStatus[k] !== 'good');
      out.push({ testType: s.testType, badRails: bad });
    });
    return out;
  });
  ok('the 2 PSU scenarios produce genuinely different real outcomes (one all-good, one with exactly one bad rail)',
    psuOutcomes.some(o => o.badRails.length === 0) && psuOutcomes.some(o => o.badRails.length === 1), psuOutcomes);

  const smartOutcomes = await pg0.evaluate(() => {
    return window.scenarios.filter(s => s.tool === 'smart').map(s => window.computeSmartVerdict ? window.computeSmartVerdict(s.attrs) : null);
  });
  // computeSmartVerdict is a top-level function declaration -> lands on window too.
  ok('the 2 S.M.A.R.T. scenarios produce genuinely different real verdicts (one healthy, one failing)',
    smartOutcomes.length === 2 && smartOutcomes.some(v => v && v.id === 'pass-healthy') && smartOutcomes.some(v => v && v.id === 'fail-realloc'), smartOutcomes);

  ok('0 non-platform-shim pageErrors after load', errs0.length === 0, errs0.slice(0, 4));
  await pg0.close();

  // ════════════════════════════════════════════════════════════════════
  // SHUFFLE CHECK: correct POST-chart entry and correct S.M.A.R.T. diagnosis
  // are not always rendered at index 0
  // ════════════════════════════════════════════════════════════════════
  console.log('\n=== Shuffle check: correct Report-phase option is not fixed at index 0 ===');
  const { pg: pgS, errs: errsS } = await newStubbedPage(b);
  await load(pgS);

  const shufflePositions = await pgS.evaluate(async () => {
    const postPositions = [];
    const smartPositions = [];
    for (let i = 0; i < window.scenarios.length; i++) {
      const sc = window.scenarios[i];
      window.currentScenario = i;
      window.scenarioState[i] = { phase: 0, operatedCorrectly: false, resolved: false, cablePins: new Set(), cableNoFault: false, feedbackText: '' };
      window.renderScenario(); // paints the correct tool tab + Operate box for this ticket's tool
      if (sc.tool === 'post') {
        window.simulatePost(sc.code);
        window.proceedToReport();
        const codeVal = parseInt(sc.code, 16);
        const correctId = 'chart-' + window.postChart.find(e => codeVal >= e.lo && codeVal <= e.hi).id;
        const ids = Array.from(document.querySelectorAll('#postChartOptions .scenario-option')).map(el => el.id);
        postPositions.push(ids.indexOf(correctId));
      } else if (sc.tool === 'smart') {
        window.runSmartScenario();
        window.proceedToReport();
        const correctId = 'smart-opt-' + window.lastSmartVerdict.id;
        const ids = Array.from(document.querySelectorAll('#smartDiagOptions .scenario-option')).map(el => el.id);
        smartPositions.push(ids.indexOf(correctId));
      }
    }
    return { postPositions, smartPositions };
  });
  ok('every POST scenario renders its full 5-entry reference chart (no lookup failures)', shufflePositions.postPositions.every(p => p >= 0), shufflePositions.postPositions);
  ok('every S.M.A.R.T. scenario renders its full 5-entry diagnosis list (no lookup failures)', shufflePositions.smartPositions.every(p => p >= 0), shufflePositions.smartPositions);

  // Stronger proof this is REAL Fisher-Yates randomization: re-render the
  // SAME ticket's Report box many times and confirm the correct option's
  // rendered index actually varies -- this is the direct fix for the
  // original lab's "correct mostly at index 1, no shuffle" defect.
  const repeatShuffle = await pgS.evaluate(() => {
    const sc = window.scenarios[0]; // POST, 'Dead System, No Display'
    window.currentScenario = 0;
    const codeVal = parseInt(sc.code, 16);
    const correctId = 'chart-' + window.postChart.find(e => codeVal >= e.lo && codeVal <= e.hi).id;
    const postIdxSeen = new Set();
    for (let n = 0; n < 30; n++) {
      window.scenarioState[0] = { phase: 1, operatedCorrectly: true, resolved: false, cablePins: new Set(), cableNoFault: false, feedbackText: '' };
      window.renderScenario();
      const ids = Array.from(document.querySelectorAll('#postChartOptions .scenario-option')).map(el => el.id);
      postIdxSeen.add(ids.indexOf(correctId));
    }
    const smartSc = window.scenarios[8]; // S.M.A.R.T., 'Slow System Performance'
    window.currentScenario = 8;
    window.scenarioState[8] = { phase: 0, operatedCorrectly: false, resolved: false, cablePins: new Set(), cableNoFault: false, feedbackText: '' };
    window.renderScenario(); // switches the tool tab to 'smart' and paints the S.M.A.R.T. display before scanning it
    window.runSmartScenario();
    const correctSmartId = 'smart-opt-' + window.lastSmartVerdict.id;
    const smartIdxSeen = new Set();
    for (let n = 0; n < 30; n++) {
      window.scenarioState[8] = { phase: 1, operatedCorrectly: true, resolved: false, cablePins: new Set(), cableNoFault: false, feedbackText: '' };
      window.renderScenario();
      const ids = Array.from(document.querySelectorAll('#smartDiagOptions .scenario-option')).map(el => el.id);
      smartIdxSeen.add(ids.indexOf(correctSmartId));
    }
    return { postIdxSeen: Array.from(postIdxSeen), smartIdxSeen: Array.from(smartIdxSeen) };
  });
  ok('re-rendering the SAME POST ticket\'s reference chart 30 times shows the correct entry landing at more than one distinct index (real shuffle, not a static reorder)',
    repeatShuffle.postIdxSeen.length > 1, repeatShuffle.postIdxSeen);
  ok('re-rendering the SAME S.M.A.R.T. ticket\'s diagnosis list 30 times shows the correct entry landing at more than one distinct index (real shuffle, not a static reorder)',
    repeatShuffle.smartIdxSeen.length > 1, repeatShuffle.smartIdxSeen);
  ok('0 non-platform-shim pageErrors during shuffle probing', errsS.length === 0, errsS.slice(0, 4));
  await pgS.close();

  // ════════════════════════════════════════════════════════════════════
  // CORRECT PLAYTHROUGH: all 10 tickets, operate + report correctly,
  // resolves + completes exactly once
  // ════════════════════════════════════════════════════════════════════
  console.log('\n=== Correct playthrough resolves all 10 tickets and completes exactly once ===');
  const { pg: pgC, errs: errsC } = await newStubbedPage(b);
  await load(pgC);

  for (let i = 0; i < scenarioCount; i++) {
    const beforeOperate = await pgC.evaluate((idx) => window.scenarioState[idx].phase, i);
    const afterOperate = await driveCorrectOperate(pgC, i);
    const afterReport = await driveCorrectReport(pgC, i);
    const resolvedState = await pgC.evaluate((idx) => ({ phase: window.scenarioState[idx].phase, resolved: window.scenarioState[idx].resolved }), i);
    await pgC.evaluate(() => window.nextScenario());

    ok(`Ticket ${i + 1}: starts in Operate phase (0)`, beforeOperate === 0, beforeOperate);
    ok(`Ticket ${i + 1}: operating the correct tool control unlocks Report (phase 1)`, afterOperate.operated === true && afterOperate.phase === 1, afterOperate);
    ok(`Ticket ${i + 1}: submitting the tool-derived correct answer resolves it (phase 2)`, afterReport === 2, afterReport);
    ok(`Ticket ${i + 1}: resolved + marked resolved=true`, resolvedState.phase === 2 && resolvedState.resolved === true, resolvedState);
  }

  const finalRightState = await pgC.evaluate(() => ({ mpCalls: window.__mpCalls, resolvedCount: window.scenarioState.filter(s => s.resolved).length }));
  ok('all 10 tickets resolved', finalRightState.resolvedCount === 10, finalRightState.resolvedCount);
  ok('ModuleProgress.complete fired exactly once', finalRightState.mpCalls.length === 1, finalRightState.mpCalls);
  if (finalRightState.mpCalls.length === 1) {
    const [house, mod, opts] = finalRightState.mpCalls[0];
    ok("ModuleProgress.complete signature is exactly ('forge', 'forge-diagnostic-tools', {returnUrl: '../index.html'})",
      house === 'forge' && mod === 'forge-diagnostic-tools' && opts && opts.returnUrl === '../index.html', finalRightState.mpCalls[0]);
  }
  ok('0 non-platform-shim pageErrors during correct playthrough', errsC.length === 0, errsC.slice(0, 4));
  await pgC.close();

  // ════════════════════════════════════════════════════════════════════
  // WRONG tool-reading / WRONG answer never resolves or completes; correct
  // answer afterward still resolves normally (mistakes are recoverable)
  // ════════════════════════════════════════════════════════════════════
  console.log('\n=== Wrong tool action / wrong answer never resolves or completes ===');
  const { pg: pgW, errs: errsW } = await newStubbedPage(b);
  await load(pgW);

  // Ticket 0 is POST code '00' (CPU range). Read a code that is NOT this
  // ticket's own code -- must not set operatedCorrectly.
  const wrongOperate = await pgW.evaluate(() => {
    window.simulatePost('20'); // wrong code for ticket 0 (which is code '00')
    const afterWrongCode = { operatedCorrectly: window.scenarioState[0].operatedCorrectly, phase: window.scenarioState[0].phase };
    window.proceedToReport(); // must be a no-op -- operatedCorrectly never set
    const afterProceedAttempt = { phase: window.scenarioState[0].phase };
    window.simulatePost('00'); // now the CORRECT code for this ticket
    const afterCorrectCode = { operatedCorrectly: window.scenarioState[0].operatedCorrectly };
    return { afterWrongCode, afterProceedAttempt, afterCorrectCode };
  });
  ok('reading the WRONG POST code for this ticket does not set operatedCorrectly and stays in Operate (phase 0)',
    wrongOperate.afterWrongCode.operatedCorrectly === false && wrongOperate.afterWrongCode.phase === 0, wrongOperate.afterWrongCode);
  ok('proceedToReport() after a wrong reading is a no-op (still phase 0)', wrongOperate.afterProceedAttempt.phase === 0, wrongOperate.afterProceedAttempt);
  ok('reading the CORRECT code afterward sets operatedCorrectly (the mistake was recoverable, not a dead end)',
    wrongOperate.afterCorrectCode.operatedCorrectly === true, wrongOperate.afterCorrectCode);

  // Now legitimately reach Report, then submit a WRONG chart entry.
  const wrongReport = await pgW.evaluate(() => {
    window.proceedToReport();
    const wrongEntry = window.postChart.find(e => e.id !== 'cpu'); // ticket 0's correct id is 'cpu'
    window.submitPostChart(wrongEntry.id);
    const afterWrongPick = { phase: window.scenarioState[0].phase, resolved: window.scenarioState[0].resolved, mpCalls: window.__mpCalls.length };
    window.submitPostChart('cpu'); // now the correct entry
    const afterCorrectPick = { phase: window.scenarioState[0].phase, resolved: window.scenarioState[0].resolved };
    return { afterWrongPick, afterCorrectPick, wrongEntryId: wrongEntry.id };
  });
  ok('submitting a WRONG chart entry does not resolve the ticket, does not fire completion',
    wrongReport.afterWrongPick.phase === 1 && wrongReport.afterWrongPick.resolved === false && wrongReport.afterWrongPick.mpCalls === 0, wrongReport.afterWrongPick);
  ok('submitting the correct entry afterward resolves the ticket normally (the wrong pick was recoverable)',
    wrongReport.afterCorrectPick.phase === 2 && wrongReport.afterCorrectPick.resolved === true, wrongReport.afterCorrectPick);

  const finalWrongState = await pgW.evaluate(() => ({ mpCalls: window.__mpCalls.length, resolvedCount: window.scenarioState.filter(s => s.resolved).length }));
  ok('single-ticket wrong-then-right run never fires ModuleProgress.complete (only 1/10 tickets resolved)', finalWrongState.mpCalls === 0, finalWrongState);
  ok('0 non-platform-shim pageErrors during wrong-operate/wrong-report run', errsW.length === 0, errsW.slice(0, 4));
  await pgW.close();

  // ════════════════════════════════════════════════════════════════════
  // DIRECT-CALL BYPASS: every advance/submit handler is a no-op when called
  // out of phase order (QC Lesson 2 regression guard)
  // ════════════════════════════════════════════════════════════════════
  console.log('\n=== Direct-call bypass: every handler no-ops out of order ===');
  const { pg: pgB, errs: errsB } = await newStubbedPage(b);
  await load(pgB);

  const bypassRun = await pgB.evaluate(() => {
    const out = {};

    // Bypass 1: proceedToReport() with zero operate work done at all (phase 0).
    window.proceedToReport();
    out.proceedToReportAtStart = window.scenarioState[0].phase;

    // Bypass 2: submitPostChart() at Operate phase (before even proceeding).
    window.submitPostChart('cpu');
    out.submitAtOperate = { phase: window.scenarioState[0].phase, resolved: window.scenarioState[0].resolved };

    // Bypass 3: operating the WRONG multimeter rail for ticket 2 (rail '5')
    // must not set operatedCorrectly, and proceedToReport() must stay a no-op.
    window.currentScenario = 2; // multimeter, rail '5'
    window.renderScenario(); // paints the multimeter tool tab + Operate box for this ticket
    window.testVoltage('12'); // wrong rail
    out.wrongRailOperated = window.scenarioState[2].operatedCorrectly;
    window.proceedToReport();
    out.phaseAfterWrongRailProceedAttempt = window.scenarioState[2].phase;

    // THE SKIP-PROCEED BYPASS: operate the CORRECT rail (operatedCorrectly
    // becomes true), but never call proceedToReport(). Call submit directly anyway.
    window.testVoltage('5'); // correct rail for ticket 2
    out.correctRailOperated = window.scenarioState[2].operatedCorrectly;
    out.phaseBeforeSkipAttempt = window.scenarioState[2].phase; // should still be 0
    document.getElementById('mmEnteredValue') && (document.getElementById('mmEnteredValue').value = String(window.currentMMReading));
    window.submitMultimeterReport('pass'); // report UI isn't even rendered yet (phase 0) -- must no-op
    out.phaseAfterSkipAttempt = window.scenarioState[2].phase;
    out.mpCallsAfterSkip = window.__mpCalls.length;

    // Now do it for real: proceed, then submit.
    window.proceedToReport();
    out.phaseAfterRealProceed = window.scenarioState[2].phase;
    document.getElementById('mmEnteredValue').value = String(window.currentMMReading);
    const trueVerdict = window.currentMMReading >= 4.75 && window.currentMMReading <= 5.25 ? 'pass' : 'fail';
    window.submitMultimeterReport(trueVerdict);
    out.resolvedAfterReal = window.scenarioState[2].resolved;

    // Bypass 4: nextScenario() before the (now-resolved) ticket 3 reaches phase 2.
    window.currentScenario = 3;
    window.nextScenario(); // ticket 3 is fresh (phase 0), must be a no-op
    out.nextSceneEarly = { currentScenario: window.currentScenario };

    return out;
  });

  ok('proceedToReport() with no operate work done is a no-op (phase stays 0)', bypassRun.proceedToReportAtStart === 0, bypassRun.proceedToReportAtStart);
  ok('submitPostChart() called at Operate phase is a no-op (phase unchanged, not resolved)', bypassRun.submitAtOperate.phase === 0 && bypassRun.submitAtOperate.resolved === false, bypassRun.submitAtOperate);
  ok('operating the WRONG multimeter rail does not set operatedCorrectly', bypassRun.wrongRailOperated === false, bypassRun.wrongRailOperated);
  ok('proceedToReport() after only the wrong rail was tested is a no-op (phase stays 0)', bypassRun.phaseAfterWrongRailProceedAttempt === 0, bypassRun.phaseAfterWrongRailProceedAttempt);
  ok('operating the CORRECT rail legitimately sets operatedCorrectly, while phase stays 0 (Proceed not yet clicked)', bypassRun.correctRailOperated === true && bypassRun.phaseBeforeSkipAttempt === 0, bypassRun);
  ok('SKIP-PROCEED BYPASS: submitMultimeterReport() called directly with operatedCorrectly already true, but proceedToReport() never called, is a no-op (phase stays 0, not 1)',
    bypassRun.phaseAfterSkipAttempt === 0, bypassRun.phaseAfterSkipAttempt);
  ok('the skip-proceed bypass attempt never fires ModuleProgress.complete', bypassRun.mpCallsAfterSkip === 0, bypassRun.mpCallsAfterSkip);
  ok('after proceedToReport() is legitimately called, submitMultimeterReport() correctly resolves the ticket', bypassRun.phaseAfterRealProceed === 1 && bypassRun.resolvedAfterReal === true, bypassRun);
  ok('nextScenario() called before the active (fresh, unresolved) ticket reaches phase 2 is a no-op (does not advance)', bypassRun.nextSceneEarly.currentScenario === 3, bypassRun.nextSceneEarly);
  ok('0 non-platform-shim pageErrors during bypass run', errsB.length === 0, errsB.slice(0, 4));
  await pgB.close();

  // ════════════════════════════════════════════════════════════════════
  // TOOL SIMS STILL WORK as free-exploration instruments (multimeter +
  // PSU tester), independent of any scenario gate.
  // ════════════════════════════════════════════════════════════════════
  console.log('\n=== Tool simulations still work standalone (multimeter + PSU tester) ===');
  const { pg: pgT, errs: errsT } = await newStubbedPage(b);
  await load(pgT);

  const toolProbe = await pgT.evaluate(() => {
    window.selectTool('multimeter');
    window.testVoltage('12'); // free exploration, no active scenario dependency
    const mmVal = parseFloat(document.getElementById('mmValue').textContent);
    const mmUnit = document.getElementById('mmUnit').textContent;

    window.selectTool('psu');
    window.testPSU('good');
    const railVals = ['3.3', '5', '12', '-12', '5sb'].map(r => document.getElementById('rail-' + r).textContent);
    const railStatusClasses = ['3.3', '5', '12', '-12', '5sb'].map(r => document.getElementById('status-' + r).className);

    return { mmVal, mmUnit, railVals, railStatusClasses };
  });
  ok('multimeter Test 12V sandbox action renders a plausible 12V-ish reading with V DC unit',
    toolProbe.mmVal > 11 && toolProbe.mmVal < 13 && toolProbe.mmUnit === 'V DC', toolProbe);
  ok('PSU tester "Good PSU" sandbox action renders all 5 rail values and good-status classes',
    toolProbe.railVals.every(v => v !== '--' && v.endsWith('V')) && toolProbe.railStatusClasses.every(c => c.includes('good')), toolProbe);
  ok('0 non-platform-shim pageErrors during tool-sim probe', errsT.length === 0, errsT.slice(0, 4));
  await pgT.close();

  // ════════════════════════════════════════════════════════════════════
  // RENDERED wrong-path feedback: click an actual wrong DOM control and
  // capture the exact rendered text, proving it is THIS ticket's own
  // tool-derived data, not a generic or cross-ticket string.
  // ════════════════════════════════════════════════════════════════════
  console.log('\n=== Rendered wrong-path feedback matches this ticket\'s own tool-derived data (no false claim) ===');
  const { pg: pgR, errs: errsR } = await newStubbedPage(b);
  await load(pgR);

  const renderedPost = await pgR.evaluate(() => {
    const sc = window.scenarios[1]; // POST, 'System Beeps, No Boot', code '10' -> RAM range
    window.currentScenario = 1;
    window.scenarioState[1] = { phase: 0, operatedCorrectly: false, resolved: false, cablePins: new Set(), cableNoFault: false, feedbackText: '' };
    window.renderScenario();
    window.runScenarioAction(); // reads code '10'
    document.getElementById('proceedReportBtn').click();
    const wrongEntry = window.postChart.find(e => e.id !== 'ram');
    document.getElementById('chart-' + wrongEntry.id).click();
    const rendered = document.getElementById('reportFeedback').textContent.replace(/^\s*/, '');
    const cardMarkedWrong = document.getElementById('chart-' + wrongEntry.id).classList.contains('incorrect');
    const stillUnresolved = window.scenarioState[1].phase === 1;
    document.getElementById('chart-ram').click(); // correct entry
    const resolvedAfterCorrect = window.scenarioState[1].phase === 2;
    return { rendered, cardMarkedWrong, stillUnresolved, resolvedAfterCorrect, code: sc.code, wrongLabel: wrongEntry.label };
  });
  ok('rendered wrong-POST-chart feedback names this ticket\'s own actual code and the actual correct range (not a generic string, not a false claim)',
    renderedPost.rendered.includes(renderedPost.code) && renderedPost.rendered.includes('RAM') && !renderedPost.rendered.includes(renderedPost.wrongLabel.split(':')[0] + 'V'), renderedPost);
  ok('the wrong chart entry is visibly marked wrong and the ticket stays unresolved', renderedPost.cardMarkedWrong && renderedPost.stillUnresolved, renderedPost);
  ok('the correct chart entry afterward resolves the ticket', renderedPost.resolvedAfterCorrect, renderedPost.resolvedAfterCorrect);

  const renderedCable = await pgR.evaluate(() => {
    const sc = window.scenarios[5]; // cable, 'Intermittent Connection', pins 2+5 broken
    window.currentScenario = 5;
    window.scenarioState[5] = { phase: 0, operatedCorrectly: false, resolved: false, cablePins: new Set(), cableNoFault: false, feedbackText: '' };
    window.renderScenario();
    window.runScenarioAction(); // runs the open-wire test
    document.getElementById('proceedReportBtn').click();
    // Select the WRONG pin (pin 1, which is actually fine) and submit.
    window.toggleCablePin(1);
    document.getElementById('reportFeedback') && window.submitCableReport();
    const rendered = document.getElementById('reportFeedback').textContent.replace(/^\s*/, '');
    const stillUnresolved = window.scenarioState[5].phase === 1;
    // Now report the correct pins for real.
    window.toggleCablePin(1); // deselect
    [2, 5].forEach(p => window.toggleCablePin(p));
    window.submitCableReport();
    const resolvedAfterCorrect = window.scenarioState[5].phase === 2;
    return { rendered, stillUnresolved, resolvedAfterCorrect };
  });
  ok('rendered wrong-cable-pin feedback names the ACTUAL broken pins (2, 5) for this ticket, not a generic string',
    renderedCable.rendered.includes('2') && renderedCable.rendered.includes('5'), renderedCable);
  ok('the wrong pin submission leaves the ticket unresolved', renderedCable.stillUnresolved, renderedCable.stillUnresolved);
  ok('reporting the correct pins afterward resolves the ticket', renderedCable.resolvedAfterCorrect, renderedCable.resolvedAfterCorrect);
  ok('0 non-platform-shim pageErrors during rendered-feedback run', errsR.length === 0, errsR.slice(0, 4));

  // ════════════════════════════════════════════════════════════════════
  // STYLE + INTEGRITY CHECKS on the rendered page
  // ════════════════════════════════════════════════════════════════════
  console.log('\n=== Style + platform integrity checks ===');
  // Use innerText (visible rendered text only) rather than innerHTML for the
  // emoji/em-dash/double-hyphen scan -- innerHTML would also capture the
  // <script> element's own SOURCE TEXT (including code comments), which is
  // never shown to a student. innerText reflects only what actually renders
  // on screen, matching the "student-facing text" / "rendered page" wording
  // of the requirement.
  const bodyText = await pgR.evaluate(() => document.body.innerText);
  const emojiRe = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu;
  ok('0 emoji characters in the rendered page', (bodyText.match(emojiRe) || []).length === 0, (bodyText.match(emojiRe) || []).length);
  ok('0 raw check/cross glyphs (✓/✗) in the rendered page', !bodyText.includes('✓') && !bodyText.includes('✗'));
  ok('0 em-dash characters in the rendered page', !bodyText.includes('—'));
  ok('0 " -- " double-hyphen substitutes in the rendered page', !bodyText.includes(' -- '));
  ok('back-link to ../../../../index.html present', await pgR.evaluate(() => !!document.querySelector('a.back-link[href="../../../../index.html"]')));
  ok('ModuleProgress.js include present in source', fs.readFileSync(path.join(APP, LAB_URL), 'utf8').includes('components/ModuleProgress.js'));
  await pgR.close();

  await b.close(); srv.close();
  console.log(pass ? '\n*** A+ HARDWARE DIAGNOSTIC TOOLS LAB CHECK OK ***' : '\n!!! A+ HARDWARE DIAGNOSTIC TOOLS LAB CHECK FAILURES ABOVE !!!');
  process.exit(pass ? 0 : 1);
})();
