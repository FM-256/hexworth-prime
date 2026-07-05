#!/usr/bin/env node
// aplus-display-troubleshoot-check.js -- regression gate for the CompTIA A+ Core 1
// "Display Troubleshooting" lab after its rebuild from an 8-scenario pick-the-answer
// quiz (answer-btn + data-correct + selectAnswer) into a real "Display Diagnostics
// Bench" engine (CompTIA A+ 220-1101 Objective 5.4). The rebuild's whole point is
// that the student must PERFORM the diagnosis on 8 distinct display faults --
// investigate (gather evidence), establish a theory grounded in that evidence, test
// it, repair the CONFIRMED cause, then verify + pick a real preventive measure --
// not click one of three/four multiple-choice buttons per scenario.
//
// This loads the real lab HTML headless (no build step -- same file served to
// students), stubs AccessGuard/ModuleProgress/HexAIButton the same way
// aplus-troubleshooting-check.js and aplus-cloud-scenarios-check.js do, and drives
// the REAL exposed globals (doGather/proceedFromGather/selectTheory/proceedFromTheory/
// runTest/returnToTheory/proceedFromTest/selectFix/proceedFromFix/selectPreventive/
// runVerify/submitCase/resetLab, plus the CASES data array -- all plain `var`/function
// declarations in a classic <script>, so they land on window) through the actual
// DOM/state path.
//
// It asserts:
//   1. CONTENT CONSISTENCY: every one of the 8 cases has exactly one correct theory,
//      one correct fix, one correct preventive measure; every wrong fix/preventive has
//      non-trivial feedback text; every theory's required evidence tags are actually
//      produced by some gather action in that same case; and no two wrong-fix/wrong-
//      preventive feedback strings across the whole lab are identical (proves no
//      generic reused string could be silently false on a different case -- QC
//      Lesson 1).
//   2. CORRECT playthrough on all 8 cases: gather -> theory (evidence-grounded) ->
//      test (confirms) -> fix (addresses confirmed cause) -> preventive -> verify ->
//      resolve, in order. Must resolve all 8 and fire ModuleProgress.complete exactly
//      once with the exact preserved signature ('forge', 'forge-display-troubleshoot',
//      {returnUrl: '../index.html'}).
//   3. WRONG-METHODOLOGY playthrough on a fresh load: jump straight to a fix / resolve
//      the case / select the grounded theory before gathering its required evidence.
//      Every one of those calls must be a no-op (phase guard + evidence guard block
//      it, not just a disabled button), and ModuleProgress.complete must never fire.
//   4. DIRECT-CALL BYPASS: every advance/select/submit handler, called directly out of
//      phase order (bypassing the UI entirely), is a no-op against its own real
//      precondition -- including the "skip verify" bypass: after legitimately reaching
//      the Verify phase, calling submitCase() directly with no preventive measure
//      selected and runVerify() never called must NOT resolve the case or fire
//      completion (QC Lesson 2).
//   5. DECOY THEORY: selecting a plausible-but-wrong theory (needs zero evidence) is
//      allowed, but its test DISCONFIRMS it, rules it out, and sends the student back
//      to Theory -- the ruled-out decoy can never be selected again, and the correct,
//      evidence-grounded theory remains reachable.
//   6. RENDERED wrong-path feedback: clicking an actual wrong-fix button and an actual
//      wrong-preventive button in the live DOM renders exactly that case's own
//      feedback text (not a generic or cross-case string).
//   7. Style/platform integrity: 0 emoji, 0 em-dash, back-link to ../index.html,
//      ModuleProgress.js include present, 0 non-platform-shim pageErrors.
//
// Usage: node _tools/arcade-fixes/aplus-display-troubleshoot-check.js   (exit 0 = pass)
const http = require('http'), fs = require('fs'), path = require('path');
const pup = require(path.resolve(__dirname, '../../node_modules/puppeteer'));
const APP = path.resolve(__dirname, '../../_app');
const LAB_URL = '/houses/forge/applets/comptia-aplus/core-1/labs/forge-display-troubleshoot.lab.html';
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

// Creates a fresh page with AccessGuard/ModuleProgress/HexAIButton neutralized
// (so init cannot redirect or throw) and ModuleProgress.complete specifically
// instrumented so we can prove it fires on a correct full playthrough and does
// NOT fire on a wrong or bypassed one. Same interception technique as the sibling
// *-check.js files in this directory.
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

async function load(pg) {
  await pg.goto('http://localhost:' + PORT_PLACEHOLDER() + LAB_URL, { waitUntil: 'domcontentloaded', timeout: 20000 }).catch(() => {});
  await sleep(300);
}
let PORT = 0;
function PORT_PLACEHOLDER() { return PORT; }

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
    doGather: typeof window.doGather, proceedFromGather: typeof window.proceedFromGather,
    selectTheory: typeof window.selectTheory, proceedFromTheory: typeof window.proceedFromTheory,
    runTest: typeof window.runTest, returnToTheory: typeof window.returnToTheory, proceedFromTest: typeof window.proceedFromTest,
    selectFix: typeof window.selectFix, proceedFromFix: typeof window.proceedFromFix,
    selectPreventive: typeof window.selectPreventive, runVerify: typeof window.runVerify, submitCase: typeof window.submitCase,
    resetLab: typeof window.resetLab, CASES: typeof window.CASES
  }));
  ok('inline <script> parsed + ran fully (lab functions + CASES present on window)',
    Object.keys(haveFns).filter(k => k !== 'CASES').every(k => haveFns[k] === 'function') && haveFns.CASES === 'object', haveFns);

  const caseCount = await pg0.evaluate(() => window.CASES.length);
  ok('8 distinct display-fault cases defined', caseCount === 8, caseCount);

  const consistency = await pg0.evaluate(() => {
    const issues = [];
    const allWrongFeedback = [];
    window.CASES.forEach((c, i) => {
      const correctTheories = c.theories.filter(t => t.correct);
      const correctFixes = c.fixes.filter(f => f.correct);
      const correctPrev = c.preventive.filter(p => p.correct);
      if (correctTheories.length !== 1) issues.push('case ' + i + ' does not have exactly 1 correct theory (' + correctTheories.length + ')');
      if (correctFixes.length !== 1) issues.push('case ' + i + ' does not have exactly 1 correct fix (' + correctFixes.length + ')');
      if (correctPrev.length !== 1) issues.push('case ' + i + ' does not have exactly 1 correct preventive (' + correctPrev.length + ')');
      // The reasoning-gate binding: the fix/preventive marked .correct must be
      // EXACTLY the one whose addressesTheory matches the correct theory's id
      // (what the engine actually grades on), and no wrong option may also
      // point at that same theory id. This proves selectFix/selectPreventive
      // are gated on the confirmed-cause link, not a bare .correct flag that
      // could drift out of sync with it.
      const correctTheoryId = correctTheories[0] && correctTheories[0].id;
      const fixesAddressingConfirmed = c.fixes.filter(f => f.addressesTheory === correctTheoryId);
      const prevAddressingConfirmed = c.preventive.filter(p => p.addressesTheory === correctTheoryId);
      if (fixesAddressingConfirmed.length !== 1 || fixesAddressingConfirmed[0] !== correctFixes[0]) issues.push('case ' + i + ' correct fix / addressesTheory binding mismatch');
      if (prevAddressingConfirmed.length !== 1 || prevAddressingConfirmed[0] !== correctPrev[0]) issues.push('case ' + i + ' correct preventive / addressesTheory binding mismatch');
      // Every theory's required evidence tags must be producible by some gather action in this case.
      const producibleTags = c.gather.map(g => g.evidence).filter(Boolean);
      c.theories.forEach(t => {
        t.requires.forEach(tag => { if (!producibleTags.includes(tag)) issues.push('case ' + i + ' theory ' + t.id + ' requires unproducible tag ' + tag); });
      });
      // Every wrong fix/preventive must carry real, non-trivial, case-specific feedback.
      c.fixes.filter(f => !f.correct).forEach(f => {
        if (!f.feedback || f.feedback.length < 20) issues.push('case ' + i + ' wrong fix ' + f.id + ' missing/short feedback');
        else allWrongFeedback.push(f.feedback);
      });
      c.preventive.filter(p => !p.correct).forEach(p => {
        if (!p.feedback || p.feedback.length < 20) issues.push('case ' + i + ' wrong preventive ' + p.id + ' missing/short feedback');
        else allWrongFeedback.push(p.feedback);
      });
      // At least one decoy theory requiring zero evidence (selectable immediately, disconfirmed by test).
      if (!c.theories.some(t => !t.correct && t.requires.length === 0)) issues.push('case ' + i + ' has no zero-evidence decoy theory');
      // The confirmed theory's test must confirm; every other theory's test must disconfirm.
      c.theories.forEach(t => { if (t.test.confirms !== t.correct) issues.push('case ' + i + ' theory ' + t.id + ' test.confirms does not match correct flag'); });
    });
    // No two wrong-fix/wrong-preventive feedback strings are identical anywhere in the
    // lab -- proves no generic reused string could be silently false on a different case.
    const uniqueCount = new Set(allWrongFeedback).size;
    if (uniqueCount !== allWrongFeedback.length) issues.push('duplicate wrong-fix/preventive feedback strings detected (' + allWrongFeedback.length + ' total, ' + uniqueCount + ' unique)');
    return { issues, totalWrongFeedbackStrings: allWrongFeedback.length };
  });
  ok('all 8 cases: exactly 1 correct theory/fix/preventive, correct fix/preventive genuinely bound to the confirmed theory (not a bare flag), evidence tags all producible, test.confirms matches correct flag, a zero-evidence decoy exists, and every wrong-fix/preventive feedback string is unique lab-wide',
    consistency.issues.length === 0, consistency.issues);

  ok('0 non-platform-shim pageErrors after load', errs0.length === 0, errs0.slice(0, 4));

  // ════════════════════════════════════════════════════════════════════
  // SHUFFLE CHECK (Chris BLOCK regression guard): the correct fix and the
  // correct preventive measure must NOT always render at the same DOM
  // position. Repair/renderFixOptions and Verify/renderPreventiveOptions
  // are called directly (window.renderFixOptions / window.renderPreventiveOptions
  // are plain top-level functions, so they land on window same as every
  // other handler) against each of the 8 cases' own data, and we read back
  // the actual rendered button order from the live DOM. This is the
  // positional-gaming defect: before the fix, fixes[0]/preventive[0] was
  // always the correct answer in array order with no shuffle, so a student
  // could win Repair + Verify in every case by blindly clicking "first
  // option" without ever reasoning from the confirmed cause.
  // ════════════════════════════════════════════════════════════════════
  console.log('\n=== Shuffle check: correct fix/preventive position is not fixed at index 0 ===');

  const perCasePositions = await pg0.evaluate(() => {
    const fixPositions = [];
    const prevPositions = [];
    window.CASES.forEach((c) => {
      window.renderFixOptions(c);
      const fixIds = Array.from(document.querySelectorAll('#fix-options .action-card')).map(el => el.id);
      const correctFixId = 'fix-' + c.fixes.filter(f => f.correct)[0].id;
      fixPositions.push(fixIds.indexOf(correctFixId));

      window.renderPreventiveOptions(c);
      const prevIds = Array.from(document.querySelectorAll('#preventive-options .action-card')).map(el => el.id);
      const correctPrevId = 'prev-' + c.preventive.filter(p => p.correct)[0].id;
      prevPositions.push(prevIds.indexOf(correctPrevId));
    });
    return { fixPositions, prevPositions };
  });
  ok('every case renders its full set of fix options (no lookup failures)', perCasePositions.fixPositions.every(p => p >= 0), perCasePositions.fixPositions);
  ok('every case renders its full set of preventive options (no lookup failures)', perCasePositions.prevPositions.every(p => p >= 0), perCasePositions.prevPositions);
  ok('the correct FIX is NOT always at rendered index 0 across the 8 cases (positional memorization defeated)',
    !perCasePositions.fixPositions.every(p => p === 0), perCasePositions.fixPositions);
  ok('the correct PREVENTIVE measure is NOT always at rendered index 0 across the 8 cases (positional memorization defeated)',
    !perCasePositions.prevPositions.every(p => p === 0), perCasePositions.prevPositions);

  // Stronger proof this is REAL Fisher-Yates randomization, not just a fixed
  // alternate order: re-render the SAME case's fix/preventive options many
  // times and confirm the correct option's rendered index actually varies
  // across repeats, not just once per case.
  const repeatShuffle = await pg0.evaluate(() => {
    const c = window.CASES[0]; // has 3 fixes and 2 preventive options
    const correctFixId = 'fix-' + c.fixes.filter(f => f.correct)[0].id;
    const correctPrevId = 'prev-' + c.preventive.filter(p => p.correct)[0].id;
    const fixIdxSeen = new Set();
    const prevIdxSeen = new Set();
    for (let n = 0; n < 30; n++) {
      window.renderFixOptions(c);
      const fixIds = Array.from(document.querySelectorAll('#fix-options .action-card')).map(el => el.id);
      fixIdxSeen.add(fixIds.indexOf(correctFixId));

      window.renderPreventiveOptions(c);
      const prevIds = Array.from(document.querySelectorAll('#preventive-options .action-card')).map(el => el.id);
      prevIdxSeen.add(prevIds.indexOf(correctPrevId));
    }
    return { fixIdxSeen: Array.from(fixIdxSeen), prevIdxSeen: Array.from(prevIdxSeen) };
  });
  ok('re-rendering the SAME case 30 times shows the correct fix landing at more than one distinct index (real shuffle, not a static reorder)',
    repeatShuffle.fixIdxSeen.length > 1, repeatShuffle.fixIdxSeen);
  ok('re-rendering the SAME case 30 times shows the correct preventive measure landing at more than one distinct index (real shuffle, not a static reorder)',
    repeatShuffle.prevIdxSeen.length > 1, repeatShuffle.prevIdxSeen);

  await pg0.close();

  // ════════════════════════════════════════════════════════════════════
  // CORRECT PLAYTHROUGH: all 8 cases, full diagnosis, resolves + completes
  // ════════════════════════════════════════════════════════════════════
  console.log('\n=== Correct playthrough resolves all 8 cases and completes exactly once ===');
  const { pg: pgC, errs: errsC } = await newStubbedPage(b);
  await load(pgC);

  for (let i = 0; i < caseCount; i++) {
    const meta = await pgC.evaluate((idx) => {
      const c = window.CASES[idx];
      return {
        gatherIds: c.gather.map(g => g.id),
        correctTheoryId: c.theories.filter(t => t.correct)[0].id,
        correctFixId: c.fixes.filter(f => f.correct)[0].id,
        correctPreventiveId: c.preventive.filter(p => p.correct)[0].id
      };
    }, i);

    for (const gid of meta.gatherIds) {
      await pgC.evaluate((gid) => window.doGather(gid), gid);
    }
    await pgC.evaluate(() => window.proceedFromGather());
    await pgC.evaluate((id) => window.selectTheory(id), meta.correctTheoryId);
    const theorySelected = await pgC.evaluate(() => window.selectedTheoryId);
    await pgC.evaluate(() => window.proceedFromTheory());
    await pgC.evaluate(() => window.runTest());
    const confirmed = await pgC.evaluate(() => window.confirmedTheoryId);
    await pgC.evaluate(() => window.proceedFromTest());
    await pgC.evaluate((id) => window.selectFix(id), meta.correctFixId);
    const fixSelected = await pgC.evaluate(() => window.selectedFixId);
    await pgC.evaluate(() => window.proceedFromFix());
    await pgC.evaluate((id) => window.selectPreventive(id), meta.correctPreventiveId);
    const preventiveSelected = await pgC.evaluate(() => window.selectedPreventiveId);
    await pgC.evaluate(() => window.runVerify());
    const verified = await pgC.evaluate(() => window.verifiedDone);
    await pgC.evaluate(() => window.submitCase());
    await sleep(150); // submitCase() advances via a short setTimeout that rebuilds the whole case UI/state

    const afterCase = await pgC.evaluate(() => ({ caseIndex: window.caseIndex, casesResolved: window.labStats.casesResolved }));
    ok(`Case ${i + 1}: theory selection succeeded once evidence was grounded`, theorySelected === meta.correctTheoryId, theorySelected);
    ok(`Case ${i + 1}: test CONFIRMED the grounded theory`, confirmed === meta.correctTheoryId, confirmed);
    ok(`Case ${i + 1}: correct fix accepted (addresses confirmed cause)`, fixSelected === meta.correctFixId, fixSelected);
    ok(`Case ${i + 1}: correct preventive measure accepted`, preventiveSelected === meta.correctPreventiveId, preventiveSelected);
    ok(`Case ${i + 1}: verify actually executed (verifiedDone flag set)`, verified === true, verified);
    ok(`Case ${i + 1}: resolved (cases-resolved counter incremented)`, afterCase.casesResolved === i + 1, afterCase);
  }

  const finalRightState = await pgC.evaluate(() => ({ mpCalls: window.__mpCalls, casesResolved: window.labStats.casesResolved }));
  ok('all 8 cases resolved', finalRightState.casesResolved === 8, finalRightState.casesResolved);
  ok('ModuleProgress.complete fired exactly once', finalRightState.mpCalls.length === 1, finalRightState.mpCalls);
  if (finalRightState.mpCalls.length === 1) {
    const [house, mod, opts] = finalRightState.mpCalls[0];
    ok("ModuleProgress.complete signature is exactly ('forge', 'forge-display-troubleshoot', {returnUrl: '../index.html'})",
      house === 'forge' && mod === 'forge-display-troubleshoot' && opts && opts.returnUrl === '../index.html', finalRightState.mpCalls[0]);
  }
  ok('0 non-platform-shim pageErrors during correct playthrough', errsC.length === 0, errsC.slice(0, 4));
  await pgC.close();

  // ════════════════════════════════════════════════════════════════════
  // WRONG-METHODOLOGY playthrough on a fresh load: jump straight to a fix,
  // straight to resolving the case, and pick the grounded theory before
  // gathering the evidence it requires. Every one of these must be blocked
  // by the phase/evidence guards inside the real handler functions, and
  // completion must never fire.
  // ════════════════════════════════════════════════════════════════════
  console.log('\n=== Wrong-methodology playthrough is blocked, never completes ===');
  const { pg: pgW, errs: errsW } = await newStubbedPage(b);
  await load(pgW);

  const beforeState = await pgW.evaluate(() => ({ phase: window.currentPhase, caseIndex: window.caseIndex, mpCalls: window.__mpCalls.length }));
  ok('starts at phase 0 (Investigate), case 0, 0 completion calls', beforeState.phase === 0 && beforeState.caseIndex === 0 && beforeState.mpCalls === 0, beforeState);

  // Jump straight to a fix with ZERO evidence gathered and ZERO theory tested.
  const afterFixAttempt = await pgW.evaluate(() => {
    window.selectFix('f1'); // the correct fix id for case 0, but phase guard should reject it outright
    return { phase: window.currentPhase, selectedFixId: window.selectedFixId };
  });
  ok('selectFix() while still in Investigate phase is a no-op (fix not selected, phase unchanged)',
    afterFixAttempt.phase === 0 && afterFixAttempt.selectedFixId === null, afterFixAttempt);

  // Jump straight to resolving the case.
  const afterSubmitAttempt = await pgW.evaluate(() => {
    window.submitCase();
    return { phase: window.currentPhase, casesResolved: window.labStats.casesResolved, mpCalls: window.__mpCalls.length };
  });
  ok('submitCase() while still in Investigate phase is a no-op (nothing resolved, no completion)',
    afterSubmitAttempt.phase === 0 && afterSubmitAttempt.casesResolved === 0 && afterSubmitAttempt.mpCalls === 0, afterSubmitAttempt);

  // Gather exactly 2 actions that satisfy the raw COUNT gate but are NOT the specific
  // evidence tags the correct theory (case 0's t1) requires -- g3 (flavor evidence,
  // unused by any theory) and g4 (a pure red herring, evidence: null).
  const afterPartialGather = await pgW.evaluate(() => {
    window.doGather('g3');
    window.doGather('g4');
    window.proceedFromGather(); // count gate (2) is met, so this legitimately advances
    const phaseAfterProceed = window.currentPhase;
    window.selectTheory('t1'); // the correct, evidence-grounded theory -- but its evidence isn't on the board
    return { phaseAfterProceed, selectedTheoryId: window.selectedTheoryId };
  });
  ok('2 gather actions satisfy the raw COUNT gate (Investigate -> Theory legitimately unlocks)', afterPartialGather.phaseAfterProceed === 1, afterPartialGather);
  ok('the correct theory is refused because its SPECIFIC required evidence was never gathered (count gate != evidence gate)',
    afterPartialGather.selectedTheoryId === null, afterPartialGather);

  const finalWrongState = await pgW.evaluate(() => ({ mpCalls: window.__mpCalls.length, casesResolved: window.labStats.casesResolved }));
  ok('wrong-methodology playthrough never fires ModuleProgress.complete', finalWrongState.mpCalls === 0, finalWrongState);
  ok('wrong-methodology playthrough resolves 0 cases', finalWrongState.casesResolved === 0, finalWrongState);
  ok('0 non-platform-shim pageErrors during wrong-methodology playthrough', errsW.length === 0, errsW.slice(0, 4));
  await pgW.close();

  // ════════════════════════════════════════════════════════════════════
  // DIRECT-CALL BYPASS: every advance/select/submit handler is a no-op
  // when called out of order, including the "skip verify" bypass after
  // legitimately reaching the Verify phase (QC Lesson 2 regression guard).
  // ════════════════════════════════════════════════════════════════════
  console.log('\n=== Direct-call bypass: every handler no-ops out of order ===');
  const { pg: pgB, errs: errsB } = await newStubbedPage(b);
  await load(pgB);

  const bypassRun = await pgB.evaluate(() => {
    const c = window.CASES[0];
    const correctTheoryId = c.theories.filter(t => t.correct)[0].id;
    const correctFixId = c.fixes.filter(f => f.correct)[0].id;
    const correctPreventiveId = c.preventive.filter(p => p.correct)[0].id;

    const out = {};

    // Bypass 1: proceedFromTheory() while still in Investigate (phase 0).
    window.proceedFromTheory();
    out.proceedFromTheoryEarly = window.currentPhase;

    // Bypass 2: runTest() with no theory selected at all (still phase 0).
    window.runTest();
    out.runTestNoTheory = { phase: window.currentPhase, confirmedTheoryId: window.confirmedTheoryId };

    // Bypass 3: proceedFromFix() before Repair is even unlocked.
    window.proceedFromFix();
    out.proceedFromFixEarly = window.currentPhase;

    // Bypass 4: runVerify() / selectPreventive() before Verify is unlocked.
    window.runVerify();
    window.selectPreventive(correctPreventiveId);
    out.verifyAndPreventiveEarly = { phase: window.currentPhase, verifiedDone: window.verifiedDone, selectedPreventiveId: window.selectedPreventiveId };

    // Now legitimately drive to the Verify phase (gather -> theory -> test -> fix).
    c.gather.forEach(g => window.doGather(g.id));
    window.proceedFromGather();
    window.selectTheory(correctTheoryId);
    window.proceedFromTheory();
    window.runTest();
    window.proceedFromTest();
    window.selectFix(correctFixId);
    window.proceedFromFix();
    out.phaseAtVerify = window.currentPhase; // should be 4 (Verify), legitimately reached

    // THE SKIP-VERIFY BYPASS: try to resolve the case with NO preventive measure
    // selected and NO runVerify() ever called.
    window.submitCase();
    out.phaseAfterBypassAttempt = window.currentPhase;
    out.mpCallsAfterBypass = window.__mpCalls.length;
    out.casesResolvedAfterBypass = window.labStats.casesResolved;

    // Now do it for real: pick the preventive measure, actually run verify, then submit.
    window.selectPreventive(correctPreventiveId);
    window.runVerify();
    out.verifiedFlagSet = window.verifiedDone === true;
    window.submitCase();
    out.casesResolvedAfterReal = window.labStats.casesResolved;

    return out;
  });

  ok('proceedFromTheory() while still in Investigate is a no-op (phase stays 0)', bypassRun.proceedFromTheoryEarly === 0, bypassRun.proceedFromTheoryEarly);
  ok('runTest() with no theory selected is a no-op (phase stays 0, nothing confirmed)', bypassRun.runTestNoTheory.phase === 0 && bypassRun.runTestNoTheory.confirmedTheoryId === null, bypassRun.runTestNoTheory);
  ok('proceedFromFix() before Repair is unlocked is a no-op (phase stays 0)', bypassRun.proceedFromFixEarly === 0, bypassRun.proceedFromFixEarly);
  ok('runVerify() and selectPreventive() before Verify is unlocked are no-ops (phase stays 0, nothing set)',
    bypassRun.verifyAndPreventiveEarly.phase === 0 && bypassRun.verifyAndPreventiveEarly.verifiedDone === false && bypassRun.verifyAndPreventiveEarly.selectedPreventiveId === null,
    bypassRun.verifyAndPreventiveEarly);
  ok('legitimately reaches Verify phase (4) via gather -> theory -> test -> fix', bypassRun.phaseAtVerify === 4, bypassRun.phaseAtVerify);
  ok('submitCase() with NO preventive measure selected and NO runVerify() call is a no-op (phase stays at 4)', bypassRun.phaseAfterBypassAttempt === 4, bypassRun.phaseAfterBypassAttempt);
  ok('the skip-verify bypass attempt never fires ModuleProgress.complete', bypassRun.mpCallsAfterBypass === 0, bypassRun.mpCallsAfterBypass);
  ok('the skip-verify bypass attempt resolves 0 cases', bypassRun.casesResolvedAfterBypass === 0, bypassRun.casesResolvedAfterBypass);
  ok('after selectPreventive + runVerify actually run, submitCase() correctly resolves the case', bypassRun.verifiedFlagSet === true && bypassRun.casesResolvedAfterReal === 1, bypassRun);
  ok('0 non-platform-shim pageErrors during bypass run', errsB.length === 0, errsB.slice(0, 4));
  await pgB.close();

  // ════════════════════════════════════════════════════════════════════
  // DECOY THEORY: picking the plausible-but-wrong theory (available with
  // zero evidence) must be allowed, but the test must DISCONFIRM it, rule
  // it out, and send the student back to Step 2 instead of forward to a
  // fix. The correct theory must then still be reachable.
  // ════════════════════════════════════════════════════════════════════
  console.log('\n=== Decoy theory is disconfirmed and sends the student back to Theory ===');
  const { pg: pgD, errs: errsD } = await newStubbedPage(b);
  await load(pgD);

  const decoyRun = await pgD.evaluate(() => {
    const c = window.CASES[0];
    const decoyId = c.theories.filter(t => !t.correct && t.requires.length === 0)[0].id;
    const correctId = c.theories.filter(t => t.correct)[0].id;

    // Gather everything so the correct theory's evidence requirement is satisfiable.
    c.gather.forEach(g => window.doGather(g.id));
    window.proceedFromGather();

    // Pick the decoy first (needs no evidence, so selection succeeds).
    window.selectTheory(decoyId);
    const decoySelected = window.selectedTheoryId === decoyId;
    window.proceedFromTheory();
    const phaseAfterProceed = window.currentPhase; // should be 2 (Test)

    // Run the test: for the decoy, test.confirms is false -> must disconfirm and rule it out.
    window.runTest();
    const ruledOutDecoy = !!window.ruledOut[decoyId];
    const stillNoConfirmedTheory = window.confirmedTheoryId === null;

    // Student clicks "Re-establish a New Theory" -- must land back in Theory phase.
    window.returnToTheory();
    const phaseAfterReturn = window.currentPhase; // should be back to 1 (Theory)
    const theoryClearedAfterReturn = window.selectedTheoryId === null;

    // The decoy must now be unselectable (ruled out); the correct theory must still work.
    window.selectTheory(decoyId);
    const decoyBlockedSecondTime = window.selectedTheoryId === null;
    window.selectTheory(correctId);
    const correctTheoryStillWorks = window.selectedTheoryId === correctId;

    return { decoySelected, phaseAfterProceed, ruledOutDecoy, stillNoConfirmedTheory, phaseAfterReturn, theoryClearedAfterReturn, decoyBlockedSecondTime, correctTheoryStillWorks };
  });
  ok('decoy theory (no evidence required) can be selected', decoyRun.decoySelected, decoyRun);
  ok('proceeding with the decoy advances to the Test phase (phase 2)', decoyRun.phaseAfterProceed === 2, decoyRun);
  ok('testing the decoy DISCONFIRMS it and rules it out', decoyRun.ruledOutDecoy && decoyRun.stillNoConfirmedTheory, decoyRun);
  ok('"Re-establish a New Theory" sends the student back to Theory (phase 1), clearing the selection', decoyRun.phaseAfterReturn === 1 && decoyRun.theoryClearedAfterReturn, decoyRun);
  ok('the ruled-out decoy can no longer be selected', decoyRun.decoyBlockedSecondTime, decoyRun);
  ok('the correct, evidence-grounded theory is still selectable after the dead end', decoyRun.correctTheoryStillWorks, decoyRun);
  ok('0 non-platform-shim pageErrors during decoy run', errsD.length === 0, errsD.slice(0, 4));
  await pgD.close();

  // ════════════════════════════════════════════════════════════════════
  // RENDERED wrong-path feedback: click an actual wrong-fix button and an
  // actual wrong-preventive button in the live DOM and capture the exact
  // rendered text, proving the UI shows THIS case's own fault-specific
  // feedback rather than a generic or cross-case string.
  // ════════════════════════════════════════════════════════════════════
  console.log('\n=== Rendered wrong-path feedback matches this case\'s own data (no false generic claim) ===');
  const { pg: pgR, errs: errsR } = await newStubbedPage(b);
  await load(pgR);

  const renderedRun = await pgR.evaluate(() => {
    const c = window.CASES[0]; // "No Video Output"
    const correctTheoryId = c.theories.filter(t => t.correct)[0].id;
    const wrongFix = c.fixes.filter(f => !f.correct)[0];
    const correctFixId = c.fixes.filter(f => f.correct)[0].id;
    const wrongPreventive = c.preventive.filter(p => !p.correct)[0];
    const correctPreventiveId = c.preventive.filter(p => p.correct)[0].id;

    c.gather.forEach(g => window.doGather(g.id));
    window.proceedFromGather();
    window.selectTheory(correctTheoryId);
    window.proceedFromTheory();
    window.runTest();
    window.proceedFromTest();

    // Click the actual wrong-fix BUTTON in the DOM (not just call the function),
    // so this proves what the student literally sees rendered.
    document.getElementById('fix-' + wrongFix.id).click();
    const renderedFixFeedback = document.getElementById('fix-feedback').textContent;
    const fixCardMarkedWrong = document.getElementById('fix-' + wrongFix.id).classList.contains('wrong');
    const fixStillUnresolved = window.selectedFixId === null;

    // Now pick the correct fix for real and proceed to Verify.
    document.getElementById('fix-' + correctFixId).click();
    window.proceedFromFix();

    // Click the actual wrong-preventive BUTTON in the DOM.
    document.getElementById('prev-' + wrongPreventive.id).click();
    const renderedPreventiveFeedback = document.getElementById('preventive-feedback').textContent;
    const verifyStillLocked = document.getElementById('btn-run-verify').disabled === true;

    // Now pick the correct preventive measure for real.
    document.getElementById('prev-' + correctPreventiveId).click();
    const verifyUnlocked = document.getElementById('btn-run-verify').disabled === false;

    return {
      renderedFixFeedback, fixCardMarkedWrong, fixStillUnresolved, wrongFixFeedbackData: wrongFix.feedback,
      renderedPreventiveFeedback, verifyStillLocked, verifyUnlocked, wrongPreventiveFeedbackData: wrongPreventive.feedback
    };
  });
  ok('rendered wrong-fix feedback text exactly matches this case\'s own data (not a generic string)',
    renderedRun.renderedFixFeedback === renderedRun.wrongFixFeedbackData, { rendered: renderedRun.renderedFixFeedback, expected: renderedRun.wrongFixFeedbackData });
  ok('the wrong-fix card is visibly marked wrong and the fix stays unresolved', renderedRun.fixCardMarkedWrong && renderedRun.fixStillUnresolved, renderedRun);
  ok('rendered wrong-preventive feedback text exactly matches this case\'s own data', renderedRun.renderedPreventiveFeedback === renderedRun.wrongPreventiveFeedbackData,
    { rendered: renderedRun.renderedPreventiveFeedback, expected: renderedRun.wrongPreventiveFeedbackData });
  ok('a wrong preventive pick keeps Verify locked', renderedRun.verifyStillLocked, renderedRun.verifyStillLocked);
  ok('the correct preventive pick unlocks Verify', renderedRun.verifyUnlocked, renderedRun.verifyUnlocked);
  ok('0 non-platform-shim pageErrors during rendered-feedback run', errsR.length === 0, errsR.slice(0, 4));

  // ════════════════════════════════════════════════════════════════════
  // STYLE + INTEGRITY CHECKS on the rendered page
  // ════════════════════════════════════════════════════════════════════
  console.log('\n=== Style + platform integrity checks ===');
  const bodyHtml = await pgR.evaluate(() => document.body.innerHTML);
  const emojiRe = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu;
  ok('0 emoji characters in the rendered page', (bodyHtml.match(emojiRe) || []).length === 0, (bodyHtml.match(emojiRe) || []).length);
  ok('0 em-dash characters in the rendered page', !bodyHtml.includes('—'));
  ok('back-link to ../index.html present', await pgR.evaluate(() => !!document.querySelector('a.back-link[href="../index.html"]')));
  ok('ModuleProgress.js include present in source', fs.readFileSync(path.join(APP, LAB_URL), 'utf8').includes('components/ModuleProgress.js'));
  await pgR.close();

  await b.close(); srv.close();
  console.log(pass ? '\n*** A+ DISPLAY DIAGNOSTICS BENCH CHECK OK ***' : '\n!!! A+ DISPLAY DIAGNOSTICS BENCH CHECK FAILURES ABOVE !!!');
  process.exit(pass ? 0 : 1);
})();
