#!/usr/bin/env node
// aplus-hardware-diagnosis-check.js -- regression gate for the CompTIA A+ Core 1
// "Hardware Diagnosis Simulator" lab after its rebuild from a 4-option
// pick-the-answer quiz (selectComponent + submitDiagnosis, correct at a FIXED
// unshuffled index-0 in 9/10 cases) into a real "decode-and-isolate" engine
// (CompTIA A+ 220-1101 Objective 5.2: POST beep codes, POST/error codes,
// power/diagnostic LED states, no-POST symptoms). The rebuild's whole point
// is that the student must PERFORM the diagnosis on 10 distinct hardware
// faults -- observe the raw signal (a beep/LED pulse pattern they must COUNT,
// or a code/log/field-note readout they must MATCH to its correct technical
// meaning from a shuffled reference chart), only then isolate the failed
// component from a shuffled candidate list graded against the decoded
// evidence tag -- not click one of four labeled buttons with the answer
// always in the same slot.
//
// This loads the real lab HTML headless (no build step -- same file served
// to students), stubs AccessGuard/ModuleProgress/HexAIButton the same way
// the sibling aplus-*-check.js scripts do, and drives the REAL exposed
// globals (proceedFromSignal/adjustPulseCount/submitPulseReading/
// renderLookupOptions/selectLookupMeaning/proceedFromDecode/
// renderIsolateOptions/selectComponent/nextCase/goToCase/showResults/
// retakeLab, plus the CASES data array -- all plain `var`/function
// declarations in a classic <script>, so they land on window) through the
// actual DOM/state path.
//
// It asserts:
//   1. CONTENT CONSISTENCY: 10 distinct cases; every case has exactly one
//      correct component, and that component's `resolves` tag list is bound
//      to the case's own decodedTag (not a bare .correct flag that could
//      drift); every wrong component has real, non-trivial feedback; every
//      lookup-kind case has exactly one correct chart entry (also bound to
//      decodedTag via the isolate-side check) and every wrong chart entry has
//      real feedback; every pulse-kind case's pattern is all 'short'/'long';
//      no two wrong-component/wrong-chart feedback strings anywhere in the
//      lab are identical (proves no generic reused string could be silently
//      false on a different case -- QC Lesson 1).
//   2. CORRECT playthrough on all 10 cases: observe -> decode (count the
//      pulse, or match the lookup chart) -> proceed -> isolate the correct
//      component, in order. Must resolve all 10 and fire
//      ModuleProgress.complete exactly once with the exact preserved
//      signature ('forge', 'forge-hardware-diagnosis', {returnUrl:
//      '../index.html'}).
//   3. WRONG-ISOLATION playthrough: after a correct decode, picking a wrong
//      component never resolves the case and never fires completion; the
//      student can then pick the correct component and resolve normally.
//   4. WRONG-DECODE never unlocks Isolate: a wrong pulse-count log or a wrong
//      lookup-chart pick never sets the decode tag and never unlocks Stage 3.
//   5. DIRECT-CALL BYPASS: every advance/select handler, called directly out
//      of phase order (bypassing the UI entirely), is a no-op against its own
//      real precondition -- including the "skip the isolate gate" bypass:
//      after a CORRECT decode (decodedTag set) but WITHOUT calling
//      proceedFromDecode(), calling selectComponent() directly must NOT
//      resolve the case (phase gate, not just the decodedTag check, QC
//      Lesson 2).
//   6. SHUFFLE: the correct lookup-chart entry and the correct isolate
//      component are NOT always rendered at index 0 across the cases, and
//      re-rendering the same case repeatedly shows the correct option
//      landing at more than one distinct index (real Fisher-Yates, not a
//      static reorder) -- QC Lesson 3.
//   7. RENDERED wrong-path feedback: clicking an actual wrong lookup-chart
//      button and an actual wrong isolate-component button in the live DOM
//      renders exactly that case's own feedback text (not a generic or
//      cross-case string).
//   8. Style/platform integrity: 0 emoji, 0 em-dash, back-link to
//      ../chapters/ch11-troubleshooting/index.html, ModuleProgress.js include
//      present, 0 non-platform-shim pageErrors.
//
// Usage: node _tools/arcade-fixes/aplus-hardware-diagnosis-check.js   (exit 0 = pass)
const http = require('http'), fs = require('fs'), path = require('path');
const pup = require(path.resolve(__dirname, '../../node_modules/puppeteer'));
const APP = path.resolve(__dirname, '../../_app');
const LAB_URL = '/houses/forge/applets/comptia-aplus/core-1/labs/forge-hardware-diagnosis.lab.html';
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

/** Drive a case's Stage-1 decode to completion using its OWN correct data
 *  (works for both 'pulse' and 'lookup' kinds). Returns true if decodedTag
 *  ended up set to the case's tag. */
async function driveCorrectDecode(pg) {
  return pg.evaluate(() => {
    const c = window.CASES[window.caseIndex];
    if (c.signal.kind === 'pulse') {
      const actualShort = c.signal.pattern.filter(p => p === 'short').length;
      const actualLong = c.signal.pattern.filter(p => p === 'long').length;
      for (let i = 0; i < actualShort; i++) window.adjustPulseCount('short', 1);
      for (let i = 0; i < actualLong; i++) window.adjustPulseCount('long', 1);
      window.submitPulseReading();
    } else {
      const correctId = c.signal.chart.filter(e => e.correct)[0].id;
      window.selectLookupMeaning(correctId);
    }
    return window.decodedTag === c.decodedTag;
  });
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
    proceedFromSignal: typeof window.proceedFromSignal,
    adjustPulseCount: typeof window.adjustPulseCount,
    submitPulseReading: typeof window.submitPulseReading,
    renderLookupOptions: typeof window.renderLookupOptions,
    selectLookupMeaning: typeof window.selectLookupMeaning,
    proceedFromDecode: typeof window.proceedFromDecode,
    renderIsolateOptions: typeof window.renderIsolateOptions,
    selectComponent: typeof window.selectComponent,
    nextCase: typeof window.nextCase,
    goToCase: typeof window.goToCase,
    showResults: typeof window.showResults,
    retakeLab: typeof window.retakeLab,
    CASES: typeof window.CASES
  }));
  ok('inline <script> parsed + ran fully (lab functions + CASES present on window)',
    Object.keys(haveFns).filter(k => k !== 'CASES').every(k => haveFns[k] === 'function') && haveFns.CASES === 'object', haveFns);

  const caseCount = await pg0.evaluate(() => window.CASES.length);
  ok('10 distinct hardware-fault cases defined', caseCount === 10, caseCount);

  const consistency = await pg0.evaluate(() => {
    const issues = [];
    const allWrongFeedback = [];
    window.CASES.forEach((c, i) => {
      const correctComps = c.components.filter(x => x.correct);
      if (correctComps.length !== 1) issues.push('case ' + i + ' does not have exactly 1 correct component (' + correctComps.length + ')');
      // The correct component's `resolves` list must contain the case's OWN
      // decodedTag, and no wrong component may also resolve that tag -- this
      // proves grading is bound to the decoded evidence, not a bare .correct
      // flag that could drift out of sync with it.
      const resolvers = c.components.filter(x => x.resolves && x.resolves.indexOf(c.decodedTag) !== -1);
      if (resolvers.length !== 1 || resolvers[0] !== correctComps[0]) issues.push('case ' + i + ' correct component / resolves(decodedTag) binding mismatch');
      c.components.filter(x => !x.correct).forEach(x => {
        if (!x.feedback || x.feedback.length < 20) issues.push('case ' + i + ' wrong component ' + x.id + ' missing/short feedback');
        else allWrongFeedback.push(x.feedback);
        if (x.resolves && x.resolves.length > 0) issues.push('case ' + i + ' wrong component ' + x.id + ' unexpectedly has non-empty resolves');
      });
      if (!c.evidenceSummary || c.evidenceSummary.length < 15) issues.push('case ' + i + ' missing evidenceSummary');

      if (c.signal.kind === 'pulse') {
        if (!Array.isArray(c.signal.pattern) || !c.signal.pattern.every(p => p === 'short' || p === 'long')) {
          issues.push('case ' + i + ' pulse pattern contains invalid entries');
        }
      } else if (c.signal.kind === 'lookup') {
        const correctChart = c.signal.chart.filter(e => e.correct);
        if (correctChart.length !== 1) issues.push('case ' + i + ' does not have exactly 1 correct lookup entry (' + correctChart.length + ')');
        if (!c.signal.readout || c.signal.readout.length < 20) issues.push('case ' + i + ' missing/short readout text');
        c.signal.chart.filter(e => !e.correct).forEach(e => {
          if (!e.feedback || e.feedback.length < 20) issues.push('case ' + i + ' lookup entry ' + e.id + ' missing/short feedback');
          else allWrongFeedback.push(e.feedback);
        });
      } else {
        issues.push('case ' + i + ' has unknown signal.kind ' + c.signal.kind);
      }
    });
    // No two wrong-component/wrong-lookup feedback strings are identical
    // anywhere in the lab -- proves no generic reused string could be
    // silently false on a different case.
    const uniqueCount = new Set(allWrongFeedback).size;
    if (uniqueCount !== allWrongFeedback.length) issues.push('duplicate wrong-feedback strings detected (' + allWrongFeedback.length + ' total, ' + uniqueCount + ' unique)');
    return { issues, totalWrongFeedbackStrings: allWrongFeedback.length };
  });
  ok('all 10 cases: exactly 1 correct component genuinely bound to decodedTag via resolves[] (not a bare flag), wrong components have empty resolves, lookup-kind cases have exactly 1 correct chart entry + real readout, pulse-kind cases have valid patterns, and every wrong-component/wrong-chart feedback string is unique lab-wide',
    consistency.issues.length === 0, consistency.issues);

  ok('0 non-platform-shim pageErrors after load', errs0.length === 0, errs0.slice(0, 4));

  // ════════════════════════════════════════════════════════════════════
  // SHUFFLE CHECK (Chris BLOCK regression guard): the correct lookup entry
  // and the correct isolate component must NOT always render at the same
  // DOM position. renderLookupOptions/renderIsolateOptions are called
  // directly (plain top-level functions, land on window) against each
  // case's own data once its container is on screen, and we read back the
  // actual rendered order from the live DOM.
  // ════════════════════════════════════════════════════════════════════
  console.log('\n=== Shuffle check: correct lookup/isolate option position is not fixed at index 0 ===');

  const shufflePositions = await pg0.evaluate(async () => {
    const lookupPositions = [];
    const isolatePositions = [];
    for (let i = 0; i < window.CASES.length; i++) {
      const c = window.CASES[i];
      window.goToCase(i);
      window.proceedFromSignal(); // -> Decode stage, containers now in DOM

      if (c.signal.kind === 'lookup') {
        window.renderLookupOptions(c);
        const ids = Array.from(document.querySelectorAll('#lookupOptions .component-option')).map(el => el.id);
        const correctId = 'lookup-' + c.signal.chart.filter(e => e.correct)[0].id;
        lookupPositions.push(ids.indexOf(correctId));
        // Actually select the correct entry so decodedTag is set and
        // proceedFromDecode() below legitimately unlocks Isolate.
        window.selectLookupMeaning(c.signal.chart.filter(e => e.correct)[0].id);
      } else {
        // pulse-kind: log the correct reading so we can legitimately reach Isolate.
        const actualShort = c.signal.pattern.filter(p => p === 'short').length;
        const actualLong = c.signal.pattern.filter(p => p === 'long').length;
        for (let k = 0; k < actualShort; k++) window.adjustPulseCount('short', 1);
        for (let k = 0; k < actualLong; k++) window.adjustPulseCount('long', 1);
        window.submitPulseReading();
      }

      window.proceedFromDecode(); // -> Isolate stage, #isolateOptions now in DOM
      window.renderIsolateOptions(c);
      const compIds = Array.from(document.querySelectorAll('#isolateOptions .component-option')).map(el => el.id);
      const correctCompId = 'isolate-' + c.components.filter(x => x.correct)[0].id;
      isolatePositions.push(compIds.indexOf(correctCompId));
    }
    return { lookupPositions, isolatePositions };
  });
  ok('every lookup-kind case renders its full reference chart (no lookup failures)', shufflePositions.lookupPositions.every(p => p >= 0), shufflePositions.lookupPositions);
  ok('every case renders its full set of isolate candidates (no lookup failures)', shufflePositions.isolatePositions.every(p => p >= 0), shufflePositions.isolatePositions);
  ok('the correct LOOKUP entry is NOT always at rendered index 0 across the lookup-kind cases (positional memorization defeated)',
    !shufflePositions.lookupPositions.every(p => p === 0), shufflePositions.lookupPositions);
  ok('the correct ISOLATE component is NOT always at rendered index 0 across all 10 cases (positional memorization defeated -- this is the exact defect the rebuild fixes: 9/10 cases previously had the correct answer fixed at index 0)',
    !shufflePositions.isolatePositions.every(p => p === 0), shufflePositions.isolatePositions);

  // Stronger proof this is REAL Fisher-Yates randomization, not just a fixed
  // alternate order: re-render the SAME case's lookup/isolate options many
  // times and confirm the correct option's rendered index actually varies.
  const repeatShuffle = await pg0.evaluate(() => {
    const c = window.CASES[1]; // lookup-kind case ("Random Shutdowns"), 4 chart entries, 4 components
    window.goToCase(1);
    window.proceedFromSignal();
    const correctChartId = 'lookup-' + c.signal.chart.filter(e => e.correct)[0].id;
    const lookupIdxSeen = new Set();
    for (let n = 0; n < 30; n++) {
      window.renderLookupOptions(c);
      const ids = Array.from(document.querySelectorAll('#lookupOptions .component-option')).map(el => el.id);
      lookupIdxSeen.add(ids.indexOf(correctChartId));
    }
    window.selectLookupMeaning(c.signal.chart.filter(e => e.correct)[0].id);
    window.proceedFromDecode();
    const correctCompId = 'isolate-' + c.components.filter(x => x.correct)[0].id;
    const isolateIdxSeen = new Set();
    for (let n = 0; n < 30; n++) {
      window.renderIsolateOptions(c);
      const ids = Array.from(document.querySelectorAll('#isolateOptions .component-option')).map(el => el.id);
      isolateIdxSeen.add(ids.indexOf(correctCompId));
    }
    return { lookupIdxSeen: Array.from(lookupIdxSeen), isolateIdxSeen: Array.from(isolateIdxSeen) };
  });
  ok('re-rendering the SAME case\'s lookup chart 30 times shows the correct entry landing at more than one distinct index (real shuffle, not a static reorder)',
    repeatShuffle.lookupIdxSeen.length > 1, repeatShuffle.lookupIdxSeen);
  ok('re-rendering the SAME case\'s isolate candidates 30 times shows the correct component landing at more than one distinct index (real shuffle, not a static reorder)',
    repeatShuffle.isolateIdxSeen.length > 1, repeatShuffle.isolateIdxSeen);

  await pg0.close();

  // ════════════════════════════════════════════════════════════════════
  // CORRECT PLAYTHROUGH: all 10 cases, full decode + isolate, resolves +
  // completes exactly once
  // ════════════════════════════════════════════════════════════════════
  console.log('\n=== Correct playthrough resolves all 10 cases and completes exactly once ===');
  const { pg: pgC, errs: errsC } = await newStubbedPage(b);
  await load(pgC);

  for (let i = 0; i < caseCount; i++) {
    await pgC.evaluate((idx) => window.goToCase(idx), i);
    await pgC.evaluate(() => window.proceedFromSignal());
    const decodedOk = await driveCorrectDecode(pgC);
    const phaseAfterDecode = await pgC.evaluate(() => window.currentPhase);
    await pgC.evaluate(() => window.proceedFromDecode());
    const phaseAfterProceed = await pgC.evaluate(() => window.currentPhase);

    const correctCompId = await pgC.evaluate((idx) => window.CASES[idx].components.filter(x => x.correct)[0].id, i);
    await pgC.evaluate((id) => window.selectComponent(id), correctCompId);

    const afterIsolate = await pgC.evaluate(() => ({ phase: window.currentPhase, casesResolved: window.labStats.casesResolved }));
    await pgC.evaluate(() => window.nextCase());

    ok(`Case ${i + 1}: decode succeeded with the correct reading/match`, decodedOk, decodedOk);
    ok(`Case ${i + 1}: Decode stage reached (phase 1) before proceeding`, phaseAfterDecode === 1, phaseAfterDecode);
    ok(`Case ${i + 1}: Isolate stage unlocked (phase 2) after a correct decode`, phaseAfterProceed === 2, phaseAfterProceed);
    ok(`Case ${i + 1}: resolved (phase 3, cases-resolved counter incremented)`, afterIsolate.phase === 3 && afterIsolate.casesResolved === i + 1, afterIsolate);
  }

  const finalRightState = await pgC.evaluate(() => ({ mpCalls: window.__mpCalls, casesResolved: window.labStats.casesResolved }));
  ok('all 10 cases resolved', finalRightState.casesResolved === 10, finalRightState.casesResolved);
  ok('ModuleProgress.complete fired exactly once', finalRightState.mpCalls.length === 1, finalRightState.mpCalls);
  if (finalRightState.mpCalls.length === 1) {
    const [house, mod, opts] = finalRightState.mpCalls[0];
    ok("ModuleProgress.complete signature is exactly ('forge', 'forge-hardware-diagnosis', {returnUrl: '../index.html'})",
      house === 'forge' && mod === 'forge-hardware-diagnosis' && opts && opts.returnUrl === '../index.html', finalRightState.mpCalls[0]);
  }
  ok('0 non-platform-shim pageErrors during correct playthrough', errsC.length === 0, errsC.slice(0, 4));
  await pgC.close();

  // ════════════════════════════════════════════════════════════════════
  // WRONG DECODE never unlocks Isolate; WRONG ISOLATION never resolves the
  // case or fires completion; the student can then correct course.
  // ════════════════════════════════════════════════════════════════════
  console.log('\n=== Wrong decode / wrong isolation never advance or complete ===');
  const { pg: pgW, errs: errsW } = await newStubbedPage(b);
  await load(pgW);

  // Case 0 is pulse-kind (3 short beeps -> RAM). Log a WRONG count.
  const wrongPulse = await pgW.evaluate(() => {
    window.proceedFromSignal();
    window.adjustPulseCount('short', 1); // logs 1 short, actual is 3
    window.submitPulseReading();
    const afterWrong = { phase: window.currentPhase, decodedTag: window.decodedTag };
    window.proceedFromDecode(); // must be a no-op -- decodedTag never set
    const afterProceedAttempt = { phase: window.currentPhase };
    // Now log the CORRECT count and confirm it recovers.
    window.adjustPulseCount('short', 2); // now logs 3 short total
    window.submitPulseReading();
    const afterCorrect = { phase: window.currentPhase, decodedTag: window.decodedTag };
    return { afterWrong, afterProceedAttempt, afterCorrect };
  });
  ok('wrong pulse-count reading does not set decodedTag and stays in Decode (phase 1)',
    wrongPulse.afterWrong.phase === 1 && wrongPulse.afterWrong.decodedTag === null, wrongPulse.afterWrong);
  ok('proceedFromDecode() after a wrong reading is a no-op (still phase 1)', wrongPulse.afterProceedAttempt.phase === 1, wrongPulse.afterProceedAttempt);
  ok('logging the CORRECT count afterward sets decodedTag (the mistake was recoverable, not a dead end)',
    wrongPulse.afterCorrect.decodedTag === 'evi-ram-beep', wrongPulse.afterCorrect);

  // Now legitimately reach Isolate, then pick a WRONG component.
  const wrongIsolate = await pgW.evaluate(() => {
    window.proceedFromDecode();
    const c = window.CASES[0];
    const wrongComp = c.components.filter(x => !x.correct)[0];
    window.selectComponent(wrongComp.id);
    const afterWrongPick = { phase: window.currentPhase, casesResolved: window.labStats.casesResolved, mpCalls: window.__mpCalls.length };
    const correctComp = c.components.filter(x => x.correct)[0];
    window.selectComponent(correctComp.id);
    const afterCorrectPick = { phase: window.currentPhase, casesResolved: window.labStats.casesResolved };
    return { afterWrongPick, afterCorrectPick };
  });
  ok('picking a WRONG component does not resolve the case, does not fire completion', wrongIsolate.afterWrongPick.phase === 2 && wrongIsolate.afterWrongPick.casesResolved === 0 && wrongIsolate.afterWrongPick.mpCalls === 0, wrongIsolate.afterWrongPick);
  ok('picking the correct component afterward resolves the case normally (the wrong pick was recoverable)', wrongIsolate.afterCorrectPick.phase === 3 && wrongIsolate.afterCorrectPick.casesResolved === 1, wrongIsolate.afterCorrectPick);

  const finalWrongState = await pgW.evaluate(() => ({ mpCalls: window.__mpCalls.length, casesResolved: window.labStats.casesResolved }));
  ok('single-case wrong-then-right run never fires ModuleProgress.complete (only 1/10 cases resolved)', finalWrongState.mpCalls === 0, finalWrongState);
  ok('0 non-platform-shim pageErrors during wrong-decode/wrong-isolation run', errsW.length === 0, errsW.slice(0, 4));
  await pgW.close();

  // ════════════════════════════════════════════════════════════════════
  // DIRECT-CALL BYPASS: every advance/select handler is a no-op when
  // called out of phase order, including the "skip the isolate gate"
  // bypass -- a correct decode WITHOUT calling proceedFromDecode() must not
  // let selectComponent() resolve the case (QC Lesson 2 regression guard).
  // ════════════════════════════════════════════════════════════════════
  console.log('\n=== Direct-call bypass: every handler no-ops out of order ===');
  const { pg: pgB, errs: errsB } = await newStubbedPage(b);
  await load(pgB);

  const bypassRun = await pgB.evaluate(() => {
    const c = window.CASES[0]; // pulse-kind, 3 short beeps -> RAM
    const correctCompId = c.components.filter(x => x.correct)[0].id;
    const out = {};

    // Bypass 1: proceedFromDecode() while still in Signal (phase 0).
    window.proceedFromDecode();
    out.proceedFromDecodeEarly = window.currentPhase;

    // Bypass 2: selectComponent() with zero decode work done at all (phase 0).
    window.selectComponent(correctCompId);
    out.selectComponentAtSignal = { phase: window.currentPhase, casesResolved: window.labStats.casesResolved };

    // Bypass 3: submitPulseReading() before Signal has even been advanced
    // past (phase 0) -- must not set decodedTag.
    window.adjustPulseCount('short', 3);
    window.submitPulseReading();
    out.submitAtSignal = { phase: window.currentPhase, decodedTag: window.decodedTag };

    // Now legitimately advance to Decode and log the CORRECT reading --
    // decodedTag becomes set, but proceedFromDecode() is deliberately NOT
    // called yet.
    window.proceedFromSignal();
    window.adjustPulseCount('short', 3);
    window.submitPulseReading();
    out.decodedTagAfterCorrectReading = window.decodedTag;
    out.phaseBeforeSkipAttempt = window.currentPhase; // should still be 1 (Decode)

    // THE SKIP-ISOLATE-GATE BYPASS: decodedTag IS correctly set, but the
    // student never clicked "Proceed to Isolate Component". Call
    // selectComponent() directly anyway.
    window.selectComponent(correctCompId);
    out.phaseAfterBypassAttempt = window.currentPhase;
    out.mpCallsAfterBypass = window.__mpCalls.length;
    out.casesResolvedAfterBypass = window.labStats.casesResolved;

    // Now do it for real: proceed, then select.
    window.proceedFromDecode();
    out.phaseAfterRealProceed = window.currentPhase;
    window.selectComponent(correctCompId);
    out.casesResolvedAfterReal = window.labStats.casesResolved;

    // Bypass 4: nextCase() before the (now-resolved) case count reflects a
    // legitimate resolution attempt on a NOT-yet-resolved second case.
    window.goToCase(1);
    window.nextCase(); // phase is 0 (fresh case), must be a no-op
    out.nextCaseEarly = { caseIndex: window.caseIndex, phase: window.currentPhase };

    return out;
  });

  ok('proceedFromDecode() while still in Signal is a no-op (phase stays 0)', bypassRun.proceedFromDecodeEarly === 0, bypassRun.proceedFromDecodeEarly);
  ok('selectComponent() at Signal phase (no decode attempted) is a no-op (phase unchanged, 0 resolved)', bypassRun.selectComponentAtSignal.phase === 0 && bypassRun.selectComponentAtSignal.casesResolved === 0, bypassRun.selectComponentAtSignal);
  ok('submitPulseReading() while still in Signal (phase 0) is a no-op (decodedTag stays null)', bypassRun.submitAtSignal.phase === 0 && bypassRun.submitAtSignal.decodedTag === null, bypassRun.submitAtSignal);
  ok('a correct pulse reading legitimately sets decodedTag once in Decode (phase 1)', bypassRun.decodedTagAfterCorrectReading === 'evi-ram-beep' && bypassRun.phaseBeforeSkipAttempt === 1, bypassRun);
  ok('SKIP-ISOLATE-GATE BYPASS: selectComponent() called directly with decodedTag already correct, but proceedFromDecode() never called, is a no-op (phase stays 1, not 2)',
    bypassRun.phaseAfterBypassAttempt === 1, bypassRun.phaseAfterBypassAttempt);
  ok('the skip-isolate-gate bypass attempt never fires ModuleProgress.complete', bypassRun.mpCallsAfterBypass === 0, bypassRun.mpCallsAfterBypass);
  ok('the skip-isolate-gate bypass attempt resolves 0 cases', bypassRun.casesResolvedAfterBypass === 0, bypassRun.casesResolvedAfterBypass);
  ok('after proceedFromDecode() is legitimately called, selectComponent() correctly resolves the case', bypassRun.phaseAfterRealProceed === 2 && bypassRun.casesResolvedAfterReal === 1, bypassRun);
  ok('nextCase() called before the active (fresh, unresolved) case reaches phase 3 is a no-op (does not advance case index)', bypassRun.nextCaseEarly.caseIndex === 1 && bypassRun.nextCaseEarly.phase === 0, bypassRun.nextCaseEarly);
  ok('0 non-platform-shim pageErrors during bypass run', errsB.length === 0, errsB.slice(0, 4));
  await pgB.close();

  // ════════════════════════════════════════════════════════════════════
  // RENDERED wrong-path feedback: click an actual wrong lookup-chart button
  // and an actual wrong isolate-component button in the live DOM and
  // capture the exact rendered text, proving the UI shows THIS case's own
  // fault-specific feedback rather than a generic or cross-case string.
  // ════════════════════════════════════════════════════════════════════
  console.log('\n=== Rendered wrong-path feedback matches this case\'s own data (no false generic claim) ===');
  const { pg: pgR, errs: errsR } = await newStubbedPage(b);
  await load(pgR);

  const renderedRun = await pgR.evaluate(() => {
    const c = window.CASES[1]; // "Random Shutdowns" -- lookup-kind
    window.goToCase(1);
    window.proceedFromSignal();

    const wrongChart = c.signal.chart.filter(e => !e.correct)[0];
    const correctChart = c.signal.chart.filter(e => e.correct)[0];

    // Click the actual wrong-lookup BUTTON in the DOM (not just call the
    // function), so this proves what the student literally sees rendered.
    document.getElementById('lookup-' + wrongChart.id).click();
    const renderedLookupFeedback = document.getElementById('decodeFeedback').textContent.replace(/^\s*/, '');
    const lookupCardMarkedWrong = document.getElementById('lookup-' + wrongChart.id).classList.contains('incorrect');
    const decodeStillLocked = document.getElementById('proceedDecodeBtn').style.display !== 'inline-block';

    // Now pick the correct chart entry for real and proceed to Isolate.
    document.getElementById('lookup-' + correctChart.id).click();
    window.proceedFromDecode();

    const wrongComp = c.components.filter(x => !x.correct)[0];
    const correctComp = c.components.filter(x => x.correct)[0];

    // Click the actual wrong-component BUTTON in the DOM.
    document.getElementById('isolate-' + wrongComp.id).click();
    const renderedIsolateFeedback = document.getElementById('isolateFeedback').textContent.replace(/^\s*/, '');
    const isolateCardMarkedWrong = document.getElementById('isolate-' + wrongComp.id).classList.contains('incorrect');
    const stillUnresolved = window.currentPhase === 2;

    // Now pick the correct component for real.
    document.getElementById('isolate-' + correctComp.id).click();
    const resolvedAfterCorrect = window.currentPhase === 3;

    return {
      renderedLookupFeedback, lookupCardMarkedWrong, decodeStillLocked, wrongChartFeedbackData: wrongChart.feedback,
      renderedIsolateFeedback, isolateCardMarkedWrong, stillUnresolved, wrongCompFeedbackData: wrongComp.feedback,
      resolvedAfterCorrect
    };
  });
  ok('rendered wrong-lookup feedback text exactly matches this case\'s own data (not a generic string)',
    renderedRun.renderedLookupFeedback === renderedRun.wrongChartFeedbackData, { rendered: renderedRun.renderedLookupFeedback, expected: renderedRun.wrongChartFeedbackData });
  ok('the wrong-lookup card is visibly marked wrong and Isolate stays locked', renderedRun.lookupCardMarkedWrong && renderedRun.decodeStillLocked, renderedRun);
  ok('rendered wrong-isolate feedback text exactly matches this case\'s own data', renderedRun.renderedIsolateFeedback === renderedRun.wrongCompFeedbackData,
    { rendered: renderedRun.renderedIsolateFeedback, expected: renderedRun.wrongCompFeedbackData });
  ok('the wrong-isolate card is visibly marked wrong and the case stays unresolved', renderedRun.isolateCardMarkedWrong && renderedRun.stillUnresolved, renderedRun);
  ok('the correct component pick afterward resolves the case', renderedRun.resolvedAfterCorrect, renderedRun.resolvedAfterCorrect);
  ok('0 non-platform-shim pageErrors during rendered-feedback run', errsR.length === 0, errsR.slice(0, 4));

  // ════════════════════════════════════════════════════════════════════
  // STYLE + INTEGRITY CHECKS on the rendered page
  // ════════════════════════════════════════════════════════════════════
  console.log('\n=== Style + platform integrity checks ===');
  const bodyHtml = await pgR.evaluate(() => document.body.innerHTML);
  const emojiRe = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu;
  ok('0 emoji characters in the rendered page', (bodyHtml.match(emojiRe) || []).length === 0, (bodyHtml.match(emojiRe) || []).length);
  ok('0 em-dash characters in the rendered page', !bodyHtml.includes('—'));
  ok('back-link to ../chapters/ch11-troubleshooting/index.html present', await pgR.evaluate(() => !!document.querySelector('a.back-link[href="../chapters/ch11-troubleshooting/index.html"]')));
  ok('ModuleProgress.js include present in source', fs.readFileSync(path.join(APP, LAB_URL), 'utf8').includes('components/ModuleProgress.js'));
  await pgR.close();

  await b.close(); srv.close();
  console.log(pass ? '\n*** A+ HARDWARE DIAGNOSIS SIMULATOR CHECK OK ***' : '\n!!! A+ HARDWARE DIAGNOSIS SIMULATOR CHECK FAILURES ABOVE !!!');
  process.exit(pass ? 0 : 1);
})();
