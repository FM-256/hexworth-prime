#!/usr/bin/env node
// aplus-printer-troubleshoot-check.js -- regression gate for the CompTIA A+ Core 1
// "Printer Troubleshooting" lab after its rebuild from a 6-scenario pick-the-answer
// quiz (option-btn + correct:true + selectOption) into a real "Print Engine
// Diagnostic Bench" engine (CompTIA A+ 220-1101 Objective 5.6). The rebuild's whole
// point is that the student must PERFORM the diagnosis on 6 distinct print-quality
// faults -- run real diagnostic actions (toner/density check, drum inspection,
// cleaning-cycle run, fuser thermal-sensor read, paper-path check, an internal
// engine self-test, and for one case an actual ruler-measurement tool), isolate
// which STATION of the laser imaging (EP) process is actually at fault, apply the
// repair bound to the CONFIRMED station, then verify on a fresh test page -- not
// click one of four labeled multiple-choice buttons per scenario.
//
// This loads the real lab HTML headless (no build step -- same file served to
// students), stubs AccessGuard/ModuleProgress/HexAIButton the same way the sibling
// aplus-display-troubleshoot-check.js / aplus-troubleshooting-flowchart-check.js
// checks do, and drives the REAL exposed globals (runDiagnostic/confirmMeasurement/
// proceedToIsolate/chooseStation/proceedToRepair/chooseFix/proceedToVerify/
// printTestPage/resolveCase/resetLab, plus the CASES/STATIONS data arrays -- all
// plain `var`/function declarations in a classic <script>, so they land on window)
// through the actual DOM/state path.
//
// It asserts:
//   1. CONTENT CONSISTENCY: 6 distinct cases, each isolated to exactly one of the 6
//      STATIONS; each case has exactly one fix whose addressesStation matches its
//      correctStation; every wrong-station and wrong-fix feedback string is real,
//      non-trivial, case-specific text; no two wrong-path feedback strings are
//      identical anywhere in the lab (proves no generic reused string could be
//      silently false on a different case -- QC Lesson 1).
//   2. CORRECT playthrough on all 6 cases: diagnose (>= minDiagnostics actions) ->
//      isolate (confirms the correct station) -> repair (addresses the confirmed
//      station) -> verify (prints the test page) -> resolve, in order. Must resolve
//      all 6 and fire ModuleProgress.complete exactly once with the exact preserved
//      signature ('forge', 'forge-printer-troubleshoot', {returnUrl: '../index.html'}).
//   3. WRONG-METHODOLOGY playthrough on a fresh load: jump straight to isolating a
//      station / choosing a repair / resolving the ticket, and running only 2 of 3
//      required diagnostics. Every one of those must be a no-op (phase guard + count
//      gate blocks it, not just a disabled button), and ModuleProgress.complete must
//      never fire.
//   4. DIRECT-CALL BYPASS: every advance/select/submit handler, called directly out
//      of phase order (bypassing the UI entirely), is a no-op against its own real
//      precondition -- including the "skip verify" bypass: after legitimately
//      reaching the Verify phase, calling resolveCase() directly with printTestPage()
//      never called must NOT resolve the ticket or fire completion (QC Lesson 2).
//   5. RULER TOOL (the 'repeat' case): an out-of-tolerance measurement is a free,
//      un-penalized retry (no evidence logged, diagCount unchanged); a within-
//      tolerance measurement counts exactly like a diagnostic action.
//   6. SHUFFLE: the correct station and the correct fix do NOT always render at the
//      same DOM index across the 6 cases, and re-rendering the same case repeatedly
//      shows the correct option landing at more than one distinct index (real
//      Fisher-Yates, not a static reorder) -- QC Lesson 3.
//   7. RENDERED wrong-path feedback: clicking an actual wrong-station button and an
//      actual wrong-fix button in the live DOM renders exactly that case's own
//      feedback text (not a generic or cross-case string).
//   8. Style/platform integrity: 0 emoji, 0 em-dash, 0 " -- " double-hyphen, back-link
//      preserved, ModuleProgress.js include present, 0 non-platform-shim pageErrors.
//
// Usage: node _tools/arcade-fixes/aplus-printer-troubleshoot-check.js   (exit 0 = pass)
const http = require('http'), fs = require('fs'), path = require('path');
const pup = require(path.resolve(__dirname, '../../node_modules/puppeteer'));
const APP = path.resolve(__dirname, '../../_app');
const LAB_URL = '/houses/forge/applets/comptia-aplus/core-1/labs/forge-printer-troubleshoot.lab.html';
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
// NOT fire on a wrong or bypassed one.
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

let PORT = 0;
async function load(pg) {
  await pg.goto('http://localhost:' + PORT + LAB_URL, { waitUntil: 'domcontentloaded', timeout: 20000 }).catch(() => {});
  await sleep(300);
}

// Drives a full, correct playthrough of one case (by index) and returns the
// per-phase state actually observed, so both the "correct playthrough" and
// "direct-call bypass" sections can reuse the same real driving logic.
async function driveCorrect(pg, idx) {
  return pg.evaluate((idx) => {
    const c = window.CASES[idx];
    c.diagnostics.forEach(d => window.runDiagnostic(d.id));
    if (c.hasRuler) {
      const input = document.getElementById('ruler-input');
      input.value = String(c.rulerTarget);
      window.confirmMeasurement();
    }
    window.proceedToIsolate();
    window.chooseStation(c.correctStation);
    const stationConfirmed = window.stationConfirmed;
    window.proceedToRepair();
    const correctFixId = c.fixes.filter(f => f.addressesStation === c.correctStation)[0].id;
    window.chooseFix(correctFixId);
    const fixConfirmed = window.fixConfirmed;
    window.proceedToVerify();
    window.printTestPage();
    const verifiedDone = window.verifiedDone;
    window.resolveCase();
    return { stationConfirmed, fixConfirmed, verifiedDone, correctFixId };
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
    runDiagnostic: typeof window.runDiagnostic, confirmMeasurement: typeof window.confirmMeasurement,
    proceedToIsolate: typeof window.proceedToIsolate, chooseStation: typeof window.chooseStation,
    proceedToRepair: typeof window.proceedToRepair, chooseFix: typeof window.chooseFix,
    proceedToVerify: typeof window.proceedToVerify, printTestPage: typeof window.printTestPage,
    resolveCase: typeof window.resolveCase, resetLab: typeof window.resetLab,
    renderStationOptions: typeof window.renderStationOptions, renderFixOptions: typeof window.renderFixOptions,
    CASES: typeof window.CASES, STATIONS: typeof window.STATIONS
  }));
  ok('inline <script> parsed + ran fully (lab functions + CASES/STATIONS present on window)',
    Object.keys(haveFns).filter(k => k !== 'CASES' && k !== 'STATIONS').every(k => haveFns[k] === 'function') && haveFns.CASES === 'object' && haveFns.STATIONS === 'object', haveFns);

  const caseCount = await pg0.evaluate(() => window.CASES.length);
  ok('6 distinct print-quality-fault cases defined', caseCount === 6, caseCount);

  const stationCount = await pg0.evaluate(() => window.STATIONS.length);
  ok('6 distinct EP-process/paper-path stations defined', stationCount === 6, stationCount);

  const consistency = await pg0.evaluate(() => {
    const issues = [];
    const allWrongFeedback = [];
    const stationIds = window.STATIONS.map(s => s.id);
    window.CASES.forEach((c, i) => {
      if (!stationIds.includes(c.correctStation)) issues.push('case ' + i + ' correctStation "' + c.correctStation + '" is not a real station id');
      // Every station id must have feedback text defined (correct + all 5 wrong).
      stationIds.forEach(sid => {
        const fb = c.stationFeedback[sid];
        if (!fb || fb.length < 20) issues.push('case ' + i + ' station ' + sid + ' missing/short feedback');
        else if (sid !== c.correctStation) allWrongFeedback.push(fb);
      });
      // Exactly one fix addresses the confirmed cause; grading in chooseFix() binds
      // against the live stationConfirmed variable, not a bare boolean flag.
      const fixesAddressingConfirmed = c.fixes.filter(f => f.addressesStation === c.correctStation);
      if (fixesAddressingConfirmed.length !== 1) issues.push('case ' + i + ' does not have exactly 1 fix addressing correctStation (' + fixesAddressingConfirmed.length + ')');
      c.fixes.filter(f => f.addressesStation !== c.correctStation).forEach(f => {
        if (!f.feedback || f.feedback.length < 20) issues.push('case ' + i + ' wrong fix ' + f.id + ' missing/short feedback');
        else allWrongFeedback.push(f.feedback);
      });
      // minDiagnostics must be satisfiable by the case's own diagnostics (+ ruler, if present).
      const maxPossible = c.diagnostics.length + (c.hasRuler ? 1 : 0);
      if (c.minDiagnostics > maxPossible) issues.push('case ' + i + ' minDiagnostics (' + c.minDiagnostics + ') exceeds available actions (' + maxPossible + ')');
    });
    const uniqueCount = new Set(allWrongFeedback).size;
    if (uniqueCount !== allWrongFeedback.length) issues.push('duplicate wrong-station/fix feedback strings detected (' + allWrongFeedback.length + ' total, ' + uniqueCount + ' unique)');
    return { issues, totalWrongFeedbackStrings: allWrongFeedback.length };
  });
  ok('all 6 cases: correctStation is real, every station has real feedback text, exactly 1 fix addresses the confirmed station (not a bare flag), minDiagnostics is satisfiable, and every wrong-station/fix feedback string is unique lab-wide',
    consistency.issues.length === 0, consistency.issues);
  console.log('    (' + consistency.totalWrongFeedbackStrings + ' unique wrong-path feedback strings verified)');

  ok('0 non-platform-shim pageErrors after load', errs0.length === 0, errs0.slice(0, 4));

  // ════════════════════════════════════════════════════════════════════
  // SHUFFLE CHECK: correct station and correct fix must not sit at a fixed
  // rendered index. renderStationOptions()/renderFixOptions(c) are plain
  // top-level functions, so they land on window same as every other handler.
  // ════════════════════════════════════════════════════════════════════
  console.log('\n=== Shuffle check: correct station/fix position is not fixed ===');

  const perCasePositions = await pg0.evaluate(() => {
    const stationPositions = [];
    const fixPositions = [];
    window.CASES.forEach((c) => {
      window.renderStationOptions();
      const stationIds = Array.from(document.querySelectorAll('#station-options .action-card')).map(el => el.id);
      stationPositions.push(stationIds.indexOf('station-' + c.correctStation));

      window.renderFixOptions(c);
      const fixIds = Array.from(document.querySelectorAll('#fix-options .action-card')).map(el => el.id);
      const correctFixId = 'fix-' + c.fixes.filter(f => f.addressesStation === c.correctStation)[0].id;
      fixPositions.push(fixIds.indexOf(correctFixId));
    });
    return { stationPositions, fixPositions };
  });
  ok('every case renders its full station grid (no lookup failures)', perCasePositions.stationPositions.every(p => p >= 0), perCasePositions.stationPositions);
  ok('every case renders its full fix list (no lookup failures)', perCasePositions.fixPositions.every(p => p >= 0), perCasePositions.fixPositions);
  ok('the correct STATION is NOT always at rendered index 0 across the 6 cases (positional memorization defeated)',
    !perCasePositions.stationPositions.every(p => p === 0), perCasePositions.stationPositions);
  ok('the correct FIX is NOT always at rendered index 0 across the 6 cases (positional memorization defeated)',
    !perCasePositions.fixPositions.every(p => p === 0), perCasePositions.fixPositions);

  const repeatShuffle = await pg0.evaluate(() => {
    const c = window.CASES[0];
    const correctStationId = 'station-' + c.correctStation;
    const correctFixId = 'fix-' + c.fixes.filter(f => f.addressesStation === c.correctStation)[0].id;
    const stationIdxSeen = new Set();
    const fixIdxSeen = new Set();
    for (let n = 0; n < 30; n++) {
      window.renderStationOptions();
      const ids = Array.from(document.querySelectorAll('#station-options .action-card')).map(el => el.id);
      stationIdxSeen.add(ids.indexOf(correctStationId));

      window.renderFixOptions(c);
      const fixIds = Array.from(document.querySelectorAll('#fix-options .action-card')).map(el => el.id);
      fixIdxSeen.add(fixIds.indexOf(correctFixId));
    }
    return { stationIdxSeen: Array.from(stationIdxSeen), fixIdxSeen: Array.from(fixIdxSeen) };
  });
  ok('re-rendering the SAME case 30 times shows the correct station landing at more than one distinct index (real shuffle, not a static reorder)',
    repeatShuffle.stationIdxSeen.length > 1, repeatShuffle.stationIdxSeen);
  ok('re-rendering the SAME case 30 times shows the correct fix landing at more than one distinct index (real shuffle, not a static reorder)',
    repeatShuffle.fixIdxSeen.length > 1, repeatShuffle.fixIdxSeen);

  await pg0.close();

  // ════════════════════════════════════════════════════════════════════
  // CORRECT PLAYTHROUGH: all 6 cases, full diagnosis, resolves + completes
  // ════════════════════════════════════════════════════════════════════
  console.log('\n=== Correct playthrough resolves all 6 cases and completes exactly once ===');
  const { pg: pgC, errs: errsC } = await newStubbedPage(b);
  await load(pgC);

  for (let i = 0; i < caseCount; i++) {
    const result = await driveCorrect(pgC, i);
    await sleep(150); // resolveCase() advances via a short setTimeout that rebuilds the whole case UI/state

    const afterCase = await pgC.evaluate(() => ({ caseIndex: window.caseIndex, ticketsResolved: window.labStats.ticketsResolved }));
    ok(`Case ${i + 1}: station isolation confirmed the ground-truth correctStation`, result.stationConfirmed === (await pgC.evaluate((idx) => window.CASES[idx].correctStation, i)), result.stationConfirmed);
    ok(`Case ${i + 1}: repair accepted (addresses the confirmed station)`, result.fixConfirmed === result.correctFixId, result.fixConfirmed);
    ok(`Case ${i + 1}: verify actually executed (verifiedDone flag set)`, result.verifiedDone === true, result.verifiedDone);
    ok(`Case ${i + 1}: resolved (tickets-resolved counter incremented)`, afterCase.ticketsResolved === i + 1, afterCase);
  }

  const finalRightState = await pgC.evaluate(() => ({ mpCalls: window.__mpCalls, ticketsResolved: window.labStats.ticketsResolved }));
  ok('all 6 tickets resolved', finalRightState.ticketsResolved === 6, finalRightState.ticketsResolved);
  ok('ModuleProgress.complete fired exactly once', finalRightState.mpCalls.length === 1, finalRightState.mpCalls);
  if (finalRightState.mpCalls.length === 1) {
    const [house, mod, opts] = finalRightState.mpCalls[0];
    ok("ModuleProgress.complete signature is exactly ('forge', 'forge-printer-troubleshoot', {returnUrl: '../index.html'})",
      house === 'forge' && mod === 'forge-printer-troubleshoot' && opts && opts.returnUrl === '../index.html', finalRightState.mpCalls[0]);
  }
  ok('0 non-platform-shim pageErrors during correct playthrough', errsC.length === 0, errsC.slice(0, 4));
  await pgC.close();

  // ════════════════════════════════════════════════════════════════════
  // WRONG-METHODOLOGY playthrough on a fresh load: jump straight to isolate
  // / repair / resolve, and satisfy the diagnostics COUNT gate short of the
  // case's real minimum. Every one of these must be blocked by the phase/
  // count guards inside the real handler functions, and completion must
  // never fire.
  // ════════════════════════════════════════════════════════════════════
  console.log('\n=== Wrong-methodology playthrough is blocked, never completes ===');
  const { pg: pgW, errs: errsW } = await newStubbedPage(b);
  await load(pgW);

  const beforeState = await pgW.evaluate(() => ({ phase: window.phase, caseIndex: window.caseIndex, mpCalls: window.__mpCalls.length }));
  ok('starts at phase 0 (Diagnose), case 0, 0 completion calls', beforeState.phase === 0 && beforeState.caseIndex === 0 && beforeState.mpCalls === 0, beforeState);

  // Jump straight to isolating a station with ZERO diagnostics run.
  const afterIsolateAttempt = await pgW.evaluate(() => {
    window.chooseStation(window.CASES[0].correctStation); // correct id, but phase guard should reject it outright
    return { phase: window.phase, stationConfirmed: window.stationConfirmed };
  });
  ok('chooseStation() while still in Diagnose phase is a no-op (station not confirmed, phase unchanged)',
    afterIsolateAttempt.phase === 0 && afterIsolateAttempt.stationConfirmed === null, afterIsolateAttempt);

  // Jump straight to resolving the ticket.
  const afterResolveAttempt = await pgW.evaluate(() => {
    window.resolveCase();
    return { phase: window.phase, ticketsResolved: window.labStats.ticketsResolved, mpCalls: window.__mpCalls.length };
  });
  ok('resolveCase() while still in Diagnose phase is a no-op (nothing resolved, no completion)',
    afterResolveAttempt.phase === 0 && afterResolveAttempt.ticketsResolved === 0 && afterResolveAttempt.mpCalls === 0, afterResolveAttempt);

  // Run only 2 of the 3 required diagnostics: the count gate must hold.
  const afterPartialDiagnose = await pgW.evaluate(() => {
    const c = window.CASES[0];
    window.runDiagnostic(c.diagnostics[0].id);
    window.runDiagnostic(c.diagnostics[1].id);
    const diagCountAfterTwo = window.diagCount;
    window.proceedToIsolate(); // should be blocked: minDiagnostics is 3
    return { diagCountAfterTwo, phaseAfterAttempt: window.phase };
  });
  ok('2 diagnostics run, count gate correctly reports 2', afterPartialDiagnose.diagCountAfterTwo === 2, afterPartialDiagnose);
  ok('proceedToIsolate() with only 2 of 3 required diagnostics is a no-op (phase stays 0)', afterPartialDiagnose.phaseAfterAttempt === 0, afterPartialDiagnose);

  const finalWrongState = await pgW.evaluate(() => ({ mpCalls: window.__mpCalls.length, ticketsResolved: window.labStats.ticketsResolved }));
  ok('wrong-methodology playthrough never fires ModuleProgress.complete', finalWrongState.mpCalls === 0, finalWrongState);
  ok('wrong-methodology playthrough resolves 0 tickets', finalWrongState.ticketsResolved === 0, finalWrongState);
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
    const correctFixId = c.fixes.filter(f => f.addressesStation === c.correctStation)[0].id;
    const out = {};

    // Bypass 1: proceedToRepair() while still in Diagnose (phase 0).
    window.proceedToRepair();
    out.proceedToRepairEarly = window.phase;

    // Bypass 2: chooseFix() with no station confirmed at all (still phase 0).
    window.chooseFix(correctFixId);
    out.chooseFixNoStation = { phase: window.phase, fixConfirmed: window.fixConfirmed };

    // Bypass 3: proceedToVerify() before Repair is even unlocked.
    window.proceedToVerify();
    out.proceedToVerifyEarly = window.phase;

    // Bypass 4: printTestPage() / resolveCase() before Verify is unlocked.
    window.printTestPage();
    window.resolveCase();
    out.verifyAndResolveEarly = { phase: window.phase, verifiedDone: window.verifiedDone, ticketsResolved: window.labStats.ticketsResolved };

    // Now legitimately drive to the Verify phase (diagnose -> isolate -> repair).
    c.diagnostics.forEach(d => window.runDiagnostic(d.id));
    window.proceedToIsolate();
    window.chooseStation(c.correctStation);
    window.proceedToRepair();
    window.chooseFix(correctFixId);
    window.proceedToVerify();
    out.phaseAtVerify = window.phase; // should be 3 (Verify), legitimately reached

    // THE SKIP-VERIFY BYPASS: try to resolve the ticket with printTestPage()
    // never called.
    window.resolveCase();
    out.phaseAfterBypassAttempt = window.phase;
    out.mpCallsAfterBypass = window.__mpCalls.length;
    out.ticketsResolvedAfterBypass = window.labStats.ticketsResolved;

    // Now do it for real: actually print the test page, then resolve.
    window.printTestPage();
    out.verifiedFlagSet = window.verifiedDone === true;
    window.resolveCase();
    out.ticketsResolvedAfterReal = window.labStats.ticketsResolved;

    return out;
  });

  ok('proceedToRepair() while still in Diagnose is a no-op (phase stays 0)', bypassRun.proceedToRepairEarly === 0, bypassRun.proceedToRepairEarly);
  ok('chooseFix() with no station confirmed is a no-op (phase stays 0, nothing set)', bypassRun.chooseFixNoStation.phase === 0 && bypassRun.chooseFixNoStation.fixConfirmed === null, bypassRun.chooseFixNoStation);
  ok('proceedToVerify() before Repair is unlocked is a no-op (phase stays 0)', bypassRun.proceedToVerifyEarly === 0, bypassRun.proceedToVerifyEarly);
  ok('printTestPage() and resolveCase() before Verify is unlocked are no-ops (phase stays 0, nothing set)',
    bypassRun.verifyAndResolveEarly.phase === 0 && bypassRun.verifyAndResolveEarly.verifiedDone === false && bypassRun.verifyAndResolveEarly.ticketsResolved === 0,
    bypassRun.verifyAndResolveEarly);
  ok('legitimately reaches Verify phase (3) via diagnose -> isolate -> repair', bypassRun.phaseAtVerify === 3, bypassRun.phaseAtVerify);
  ok('resolveCase() with printTestPage() never called is a no-op (phase stays at 3)', bypassRun.phaseAfterBypassAttempt === 3, bypassRun.phaseAfterBypassAttempt);
  ok('the skip-verify bypass attempt never fires ModuleProgress.complete', bypassRun.mpCallsAfterBypass === 0, bypassRun.mpCallsAfterBypass);
  ok('the skip-verify bypass attempt resolves 0 tickets', bypassRun.ticketsResolvedAfterBypass === 0, bypassRun.ticketsResolvedAfterBypass);
  ok('after printTestPage() actually runs, resolveCase() correctly resolves the ticket', bypassRun.verifiedFlagSet === true && bypassRun.ticketsResolvedAfterReal === 1, bypassRun);
  ok('0 non-platform-shim pageErrors during bypass run', errsB.length === 0, errsB.slice(0, 4));
  await pgB.close();

  // ════════════════════════════════════════════════════════════════════
  // RULER TOOL: an out-of-tolerance measurement is a free retry (no
  // evidence, diagCount unchanged); a within-tolerance measurement counts
  // exactly like a diagnostic action.
  // ════════════════════════════════════════════════════════════════════
  console.log('\n=== Ruler measurement tool (repeating-marks case) ===');
  const { pg: pgU, errs: errsU } = await newStubbedPage(b);
  await load(pgU);

  const rulerRun = await pgU.evaluate(() => {
    const idx = window.CASES.findIndex(c => c.hasRuler);
    // Jump straight to that case for a focused test.
    window.caseIndex = idx;
    window.renderCase(idx);
    const c = window.CASES[idx];

    const input = document.getElementById('ruler-input');
    input.value = '40'; // far outside tolerance of c.rulerTarget (94 +/- 6)
    window.confirmMeasurement();
    const afterWrong = { diagCount: window.diagCount, measureRun: !!window.diagRun['measure-interval'] };

    input.value = String(c.rulerTarget); // dead on target
    window.confirmMeasurement();
    const afterCorrect = { diagCount: window.diagCount, measureRun: !!window.diagRun['measure-interval'], evidence: !!window.evidenceTags['interval-confirmed'] };

    // A second confirm after already being logged must be a no-op (no double count).
    window.confirmMeasurement();
    const afterDoubleConfirm = { diagCount: window.diagCount };

    return { rulerTarget: c.rulerTarget, afterWrong, afterCorrect, afterDoubleConfirm };
  });
  ok('an out-of-tolerance measurement does not log evidence or advance diagCount', rulerRun.afterWrong.diagCount === 0 && rulerRun.afterWrong.measureRun === false, rulerRun.afterWrong);
  ok('a within-tolerance measurement logs evidence and counts as a diagnostic action', rulerRun.afterCorrect.diagCount === 1 && rulerRun.afterCorrect.measureRun === true && rulerRun.afterCorrect.evidence === true, rulerRun.afterCorrect);
  ok('confirming again after a successful measurement is a no-op (no double count)', rulerRun.afterDoubleConfirm.diagCount === 1, rulerRun.afterDoubleConfirm);
  ok('0 non-platform-shim pageErrors during ruler-tool run', errsU.length === 0, errsU.slice(0, 4));
  await pgU.close();

  // ════════════════════════════════════════════════════════════════════
  // RENDERED wrong-path feedback: click an actual wrong-station button and
  // an actual wrong-fix button in the live DOM and capture the exact
  // rendered text, proving the UI shows THIS case's own fault-specific
  // feedback rather than a generic or cross-case string.
  // ════════════════════════════════════════════════════════════════════
  console.log('\n=== Rendered wrong-path feedback matches this case\'s own data (no false generic claim) ===');
  const { pg: pgR, errs: errsR } = await newStubbedPage(b);
  await load(pgR);

  const renderedRun = await pgR.evaluate(() => {
    const c = window.CASES[0]; // "Recurring Paper Jams at Pickup"
    const wrongStationId = window.STATIONS.filter(s => s.id !== c.correctStation)[0].id;
    const correctFixId = c.fixes.filter(f => f.addressesStation === c.correctStation)[0].id;
    const wrongFix = c.fixes.filter(f => f.addressesStation !== c.correctStation)[0];

    c.diagnostics.forEach(d => window.runDiagnostic(d.id));
    window.proceedToIsolate();

    // Click the actual wrong-station BUTTON in the DOM (not just call the function).
    document.getElementById('station-' + wrongStationId).click();
    const renderedStationFeedback = document.getElementById('station-feedback').textContent;
    const stationCardMarkedWrong = document.getElementById('station-' + wrongStationId).classList.contains('wrong');
    const stationStillUnconfirmed = window.stationConfirmed === null;

    // Now pick the correct station for real and proceed to Repair.
    document.getElementById('station-' + c.correctStation).click();
    window.proceedToRepair();

    // Click the actual wrong-fix BUTTON in the DOM.
    document.getElementById('fix-' + wrongFix.id).click();
    const renderedFixFeedback = document.getElementById('fix-feedback').textContent;
    const fixCardMarkedWrong = document.getElementById('fix-' + wrongFix.id).classList.contains('wrong');
    const continueStillHidden = document.getElementById('btn-continue-2').style.display !== 'inline-block';

    // Now pick the correct fix for real.
    document.getElementById('fix-' + correctFixId).click();
    const continueNowShown = document.getElementById('btn-continue-2').style.display === 'inline-block';

    return {
      renderedStationFeedback, stationCardMarkedWrong, stationStillUnconfirmed, wrongStationFeedbackData: c.stationFeedback[wrongStationId],
      renderedFixFeedback, fixCardMarkedWrong, continueStillHidden, continueNowShown, wrongFixFeedbackData: wrongFix.feedback
    };
  });
  ok('rendered wrong-station feedback text exactly matches this case\'s own data (not a generic string)',
    renderedRun.renderedStationFeedback === renderedRun.wrongStationFeedbackData, { rendered: renderedRun.renderedStationFeedback, expected: renderedRun.wrongStationFeedbackData });
  ok('the wrong-station card is visibly marked wrong and stays unconfirmed', renderedRun.stationCardMarkedWrong && renderedRun.stationStillUnconfirmed, renderedRun);
  ok('rendered wrong-fix feedback text exactly matches this case\'s own data', renderedRun.renderedFixFeedback === renderedRun.wrongFixFeedbackData,
    { rendered: renderedRun.renderedFixFeedback, expected: renderedRun.wrongFixFeedbackData });
  ok('a wrong fix pick keeps "Continue to Verify" hidden', renderedRun.continueStillHidden, renderedRun.continueStillHidden);
  ok('the correct fix pick reveals "Continue to Verify"', renderedRun.continueNowShown, renderedRun.continueNowShown);
  ok('0 non-platform-shim pageErrors during rendered-feedback run', errsR.length === 0, errsR.slice(0, 4));

  // ════════════════════════════════════════════════════════════════════
  // STYLE + INTEGRITY CHECKS on the rendered page
  // ════════════════════════════════════════════════════════════════════
  console.log('\n=== Style + platform integrity checks ===');
  const bodyHtml = await pgR.evaluate(() => document.body.innerHTML);
  const emojiRe = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu;
  ok('0 emoji characters in the rendered page', (bodyHtml.match(emojiRe) || []).length === 0, (bodyHtml.match(emojiRe) || []).length);
  ok('0 em-dash characters in the rendered page', !bodyHtml.includes('—'));
  ok('0 " -- " double-hyphen substitutes in the rendered page', !bodyHtml.includes(' -- '));
  ok('back-link to ../chapters/ch04-printers/index.html present (preserved from original)',
    await pgR.evaluate(() => !!document.querySelector('a.back-link[href="../chapters/ch04-printers/index.html"]')));
  ok('ModuleProgress.js include present in source', fs.readFileSync(path.join(APP, LAB_URL), 'utf8').includes('components/ModuleProgress.js'));
  const rawSource = fs.readFileSync(path.join(APP, LAB_URL), 'utf8');
  ok('0 em-dash characters in the raw source file', !rawSource.includes('—'));
  ok('0 " -- " double-hyphen substitutes in the raw source file', !rawSource.includes(' -- '));
  await pgR.close();

  await b.close(); srv.close();
  console.log(pass ? '\n*** A+ PRINT ENGINE DIAGNOSTIC BENCH CHECK OK ***' : '\n!!! A+ PRINT ENGINE DIAGNOSTIC BENCH CHECK FAILURES ABOVE !!!');
  process.exit(pass ? 0 : 1);
})();
