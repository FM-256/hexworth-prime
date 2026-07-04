#!/usr/bin/env node
// aplus-troubleshooting-check.js -- regression gate for the CompTIA A+ Core 1 "Troubleshooting
// Methodology" lab after its rebuild from a 6-question pick-the-answer quiz (option-btn +
// data-correct + checkAnswer) into a real Support Ticket Workbench engine. The rebuild's whole
// point is that the student must PERFORM the CompTIA 6-step methodology (identify, theory, test,
// plan+implement, verify, document) on 3 distinct support tickets, in order, grounded in evidence
// they actually gathered -- not click through 4-option multiple choice.
//
// This loads the real lab HTML headless (no build step -- same file served to students), stubs
// AccessGuard/ModuleProgress/HexAIButton the same way firewall-builder-check.js and
// rack-stack-check.js do, and drives the REAL exposed globals (doGather/selectTheory/runTest/
// selectFix/selectPreventive/runVerify/toggleDoc/submitTicket/proceedFrom*, all plain function
// declarations in a classic <script>, so they land on window) through the actual DOM/state path.
//
// It asserts two end-to-end playthroughs on all 3 tickets:
//   1. CORRECT-METHODOLOGY: gather -> theory (evidence-grounded) -> test (confirms) -> fix
//      (addresses confirmed cause) -> verify -> document, in order, for all 3 tickets. This MUST
//      reach completion and fire ModuleProgress.complete('forge','forge-troubleshooting',
//      {returnUrl:'../index.html'}) exactly once.
//   2. WRONG-METHODOLOGY: on a fresh load, try to jump straight to a fix (and straight to
//      document, and pick a theory before gathering any grounding evidence) without gathering
//      information or testing a theory first. Every one of those calls must be a no-op (phase
//      guard blocks it) and ModuleProgress.complete must NEVER fire.
//
// It also asserts:
//   - 0 non-platform-shim pageErrors (the inline <script> parses and runs to completion)
//   - 0 emoji and 0 em-dash characters in the rendered page (platform style rules)
//   - the exact ModuleProgress.complete call signature (house id, module id, options object)
//
// Usage: node _tools/arcade-fixes/aplus-troubleshooting-check.js   (exit 0 = pass)
const http = require('http'), fs = require('fs'), path = require('path');
const pup = require(path.resolve(__dirname, '../../node_modules/puppeteer'));
const APP = path.resolve(__dirname, '../../_app');
const LAB_URL = '/houses/forge/applets/comptia-aplus/core-1/labs/forge-troubleshooting.lab.html';
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.css': 'text/css', '.webp': 'image/webp', '.png': 'image/png', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.woff': 'font/woff' };
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
let pass = true;
const ok = (n, c, e) => { if (!c) pass = false; console.log('  ' + (c ? 'PASS' : 'FAIL') + '  ' + n + (e !== undefined ? '  ' + JSON.stringify(e).slice(0, 300) : '')); };

// Static file server rooted at _app so the lab + its component scripts load same-origin,
// exactly the file students are served (no build step).
const srv = http.createServer((q, s) => {
  let p = decodeURIComponent(q.url.split('?')[0]); let fp = path.join(APP, p);
  if (fs.existsSync(fp) && fs.statSync(fp).isFile()) { s.writeHead(200, { 'Content-Type': MIME[path.extname(fp)] || 'application/octet-stream' }); fs.createReadStream(fp).pipe(s); }
  else { s.writeHead(404); s.end('nf'); }
});

(async () => {
  await new Promise(r => srv.listen(0, r)); const port = srv.address().port;
  const b = await pup.launch({ headless: 'new', args: ['--no-sandbox'] });
  const pg = await b.newPage();
  const errs = [];
  pg.on('pageerror', e => { const m = String(e.message); if (!/firebase|firestore|auth\/|AccessGuard|not authenticated/i.test(m)) errs.push(m.slice(0, 200)); });
  await pg.setRequestInterception(true);
  // Neutralize component dependencies so init can't redirect or throw -- we're testing the
  // lab's own methodology logic, not the platform shell (same pattern as sibling *-check.js
  // files). ModuleProgress.complete is captured into window.__mpCalls so we can assert both
  // that it fires on the correct path and that it NEVER fires on the wrong-methodology path.
  pg.on('request', r => {
    const u = r.url();
    if (/AccessGuard\.js/.test(u)) {
      r.respond({ status: 200, contentType: 'text/javascript', body: "window.AccessGuard={require:function(){return true;}};" });
    } else if (/ModuleProgress\.js/.test(u)) {
      r.respond({ status: 200, contentType: 'text/javascript', body:
        "window.__mpCalls=[];" +
        "window.ModuleProgress={" +
          "complete:function(house,moduleId,opts){window.__mpCalls.push([house,moduleId,opts]);}," +
          "isCompleted:function(){return false;}" +
        "};" });
    } else if (/HexAIButton\.js/.test(u)) {
      r.respond({ status: 200, contentType: 'text/javascript', body: 'export default {};' });
    } else r.continue();
  });

  async function load() {
    await pg.goto('http://localhost:' + port + LAB_URL, { waitUntil: 'domcontentloaded', timeout: 20000 }).catch(() => {});
    await sleep(300);
  }

  // ════════════════════════════════════════════════════════════════════
  // SCENARIO 1: WRONG METHODOLOGY -- jump straight to a fix / document /
  // an ungrounded theory, on a fresh ticket, with nothing gathered or
  // tested. Every one of these must be blocked by the phase guard inside
  // the real handler functions (not just a disabled button in the DOM),
  // and completion must never fire.
  // ════════════════════════════════════════════════════════════════════
  console.log('\n=== Scenario 1: wrong-methodology playthrough is blocked, never completes ===');
  await load();

  const haveFns = await pg.evaluate(() => ({
    doGather: typeof window.doGather, selectTheory: typeof window.selectTheory, runTest: typeof window.runTest,
    selectFix: typeof window.selectFix, submitTicket: typeof window.submitTicket, proceedFromIdentify: typeof window.proceedFromIdentify
  }));
  ok('inline <script> parsed + ran fully (lab functions present on window)',
    Object.values(haveFns).every(v => v === 'function'), haveFns);

  const beforeState = await pg.evaluate(() => ({ phase: window.currentPhase, ticketIndex: window.ticketIndex, mpCalls: window.__mpCalls.length }));
  ok('starts at phase 0 (Identify), ticket 0, 0 completion calls', beforeState.phase === 0 && beforeState.ticketIndex === 0 && beforeState.mpCalls === 0, beforeState);

  // Attempt: jump straight to implementing a fix with ZERO evidence gathered and ZERO theory tested.
  const afterFixAttempt = await pg.evaluate(() => {
    window.selectFix('f1'); // the correct fix id, but phase guard should reject it outright
    return { phase: window.currentPhase, selectedFixId: window.selectedFixId };
  });
  ok('selectFix() while still in Identify phase is a no-op (fix not selected, phase unchanged)',
    afterFixAttempt.phase === 0 && afterFixAttempt.selectedFixId === null, afterFixAttempt);

  // Attempt: jump straight to submitting/closing the ticket.
  const afterSubmitAttempt = await pg.evaluate(() => {
    window.submitTicket();
    return { phase: window.currentPhase, ticketsResolved: window.labStats.ticketsResolved, mpCalls: window.__mpCalls.length };
  });
  ok('submitTicket() while still in Identify phase is a no-op (nothing resolved, no completion)',
    afterSubmitAttempt.phase === 0 && afterSubmitAttempt.ticketsResolved === 0 && afterSubmitAttempt.mpCalls === 0, afterSubmitAttempt);

  // Attempt: pick the grounded (correct) theory BEFORE gathering the evidence it requires.
  // The engine must refuse the selection (theory grounded in evidence never actually gathered).
  const afterUngroundedTheory = await pg.evaluate(() => {
    window.proceedFromIdentify(); // also should no-op: fewer than 2 gather actions taken
    window.selectTheory('t2');    // t2 is the correct theory for every ticket, requires evidence
    return { phase: window.currentPhase, selectedTheoryId: window.selectedTheoryId, evidence: window.evidence };
  });
  ok('proceedFromIdentify() blocked with 0 gather actions taken (still phase 0)', afterUngroundedTheory.phase === 0, afterUngroundedTheory);
  ok('selectTheory() on the correct theory is refused with no evidence gathered (not selected)',
    afterUngroundedTheory.selectedTheoryId === null, afterUngroundedTheory);

  // Even forcing 2 gather clicks (meeting only the raw COUNT gate) without the SPECIFIC
  // evidence tags the correct theory requires must still refuse that theory selection.
  const afterPartialGather = await pg.evaluate(() => {
    // g4/g5 on ticket 1 are the irrelevant actions (evidence: null) -- pure time-wasters.
    window.doGather('g4');
    window.doGather('g5');
    window.proceedFromIdentify();
    window.selectTheory('t2'); // still missing 'storm' and 'outlet-tripped' evidence tags
    return { phase: window.currentPhase, selectedTheoryId: window.selectedTheoryId };
  });
  ok('2 IRRELEVANT gather actions satisfy the count gate but NOT the evidence-grounding gate (theory still refused)',
    afterPartialGather.phase === 1 && afterPartialGather.selectedTheoryId === null, afterPartialGather);

  const finalWrongState = await pg.evaluate(() => ({ mpCalls: window.__mpCalls.length, ticketsResolved: window.labStats.ticketsResolved }));
  ok('wrong-methodology playthrough never fires ModuleProgress.complete', finalWrongState.mpCalls === 0, finalWrongState);
  ok('wrong-methodology playthrough resolves 0 tickets', finalWrongState.ticketsResolved === 0, finalWrongState);

  // ════════════════════════════════════════════════════════════════════
  // SCENARIO 1b: SKIP-VERIFY BYPASS (regression for the Chris-blocked bug).
  // After a LEGITIMATE gather -> theory -> test -> fix, calling
  // proceedFromVerify() directly, WITHOUT ever selecting a preventive
  // measure or running runVerify(), must be a no-op: currentPhase must
  // stay at PHASE_VERIFY (4) and completion must never fire. Then the
  // normal path (selectPreventive + runVerify, then proceedFromVerify)
  // must still advance correctly, proving the fix does not overtighten.
  // ════════════════════════════════════════════════════════════════════
  console.log('\n=== Scenario 1b: proceedFromVerify() cannot be skipped by a direct call ===');
  await load();

  const skipVerifyRun = await pg.evaluate(() => {
    const tk = window.TICKETS[0];
    const correctTheoryId = tk.theories.filter(th => th.correct)[0].id;
    const correctFixId = tk.fixes.filter(f => f.correct)[0].id;
    const correctPreventiveId = tk.preventive.filter(p => p.correct)[0].id;

    // Legitimate gather -> theory -> test -> fix, exactly like Scenario 2.
    tk.gather.forEach(g => window.doGather(g.id));
    window.proceedFromIdentify();
    window.selectTheory(correctTheoryId);
    window.proceedFromTheory();
    window.runTest();
    window.proceedFromTest();
    window.selectFix(correctFixId);
    window.proceedFromFix();

    const phaseAtVerify = window.currentPhase; // should be 4 (Verify), legitimately reached

    // THE BUG: try to skip straight to Document with NO preventive measure selected and
    // NO runVerify() ever called.
    window.proceedFromVerify();
    const phaseAfterBypassAttempt = window.currentPhase;
    const mpCallsAfterBypass = window.__mpCalls.length;

    // Now do it for real: pick a preventive measure, actually run verify, then proceed.
    window.selectPreventive(correctPreventiveId);
    window.runVerify();
    const verifiedFlagSet = window.verifiedDone === true;
    window.proceedFromVerify();
    const phaseAfterRealVerify = window.currentPhase;

    return { phaseAtVerify, phaseAfterBypassAttempt, mpCallsAfterBypass, verifiedFlagSet, phaseAfterRealVerify };
  });
  ok('legitimately reaches Verify phase (4) via gather -> theory -> test -> fix', skipVerifyRun.phaseAtVerify === 4, skipVerifyRun);
  ok('proceedFromVerify() with NO preventive measure selected and NO runVerify() call is a no-op (phase stays at 4)',
    skipVerifyRun.phaseAfterBypassAttempt === 4, skipVerifyRun);
  ok('the bypass attempt never fires ModuleProgress.complete', skipVerifyRun.mpCallsAfterBypass === 0, skipVerifyRun);
  ok('runVerify() sets the real verifiedDone flag once it actually executes', skipVerifyRun.verifiedFlagSet === true, skipVerifyRun);
  ok('after selectPreventive + runVerify actually run, proceedFromVerify() correctly advances to Document (5)',
    skipVerifyRun.phaseAfterRealVerify === 5, skipVerifyRun);

  // ════════════════════════════════════════════════════════════════════
  // SCENARIO 2: CORRECT METHODOLOGY -- gather -> theory -> test -> fix ->
  // verify -> document, in order, grounded in real evidence, for all 3
  // tickets. Must reach completion and fire ModuleProgress.complete
  // exactly once with the required signature.
  // ════════════════════════════════════════════════════════════════════
  console.log('\n=== Scenario 2: correct-methodology playthrough resolves all 3 tickets and completes ===');
  await load(); // fresh page: fresh window.__mpCalls, fresh lab state

  const ticketCount = await pg.evaluate(() => window.TICKETS.length);
  ok('lab data defines 3 distinct tickets', ticketCount === 3, ticketCount);

  for (let t = 0; t < ticketCount; t++) {
    const ticketMeta = await pg.evaluate((idx) => {
      const tk = window.TICKETS[idx];
      return {
        gatherIds: tk.gather.map(g => g.id),
        correctTheoryId: tk.theories.filter(th => th.correct)[0].id,
        correctFixId: tk.fixes.filter(f => f.correct)[0].id,
        correctPreventiveId: tk.preventive.filter(p => p.correct)[0].id
      };
    }, t);

    // Step 1: Identify -- gather every available action (relevant + irrelevant) for this ticket.
    for (const gid of ticketMeta.gatherIds) {
      await pg.evaluate((gid) => window.doGather(gid), gid);
    }
    const afterGather = await pg.evaluate(() => ({ phase: window.currentPhase }));
    await pg.evaluate(() => window.proceedFromIdentify());

    // Step 2: Theory -- select the theory grounded in the evidence just gathered.
    await pg.evaluate((thId) => window.selectTheory(thId), ticketMeta.correctTheoryId);
    const theorySelected = await pg.evaluate(() => window.selectedTheoryId);
    await pg.evaluate(() => window.proceedFromTheory());

    // Step 3: Test -- run the test tied to the selected theory; must CONFIRM (it is the correct one).
    await pg.evaluate(() => window.runTest());
    const confirmed = await pg.evaluate(() => window.confirmedTheoryId);
    await pg.evaluate(() => window.proceedFromTest());

    // Step 4: Plan & Implement -- pick the fix that addresses the confirmed cause.
    await pg.evaluate((fxId) => window.selectFix(fxId), ticketMeta.correctFixId);
    const fixSelected = await pg.evaluate(() => window.selectedFixId);
    await pg.evaluate(() => window.proceedFromFix());

    // Step 5: Verify -- pick a preventive measure, then verify full functionality.
    await pg.evaluate((pvId) => window.selectPreventive(pvId), ticketMeta.correctPreventiveId);
    await pg.evaluate(() => window.runVerify());
    await pg.evaluate(() => window.proceedFromVerify());

    // Step 6: Document -- check all 4 required elements, write a real note, submit.
    await pg.evaluate(() => {
      ['d1', 'd2', 'd3', 'd4'].forEach((id) => {
        document.getElementById('doc-check-' + id).checked = true;
        window.toggleDoc(id);
      });
      document.getElementById('docNote').value =
        'Problem confirmed with the user, root cause identified and tested, fix implemented and verified, preventive measure recommended.';
      window.checkDocReady();
    });
    const submitEnabled = await pg.evaluate(() => !document.getElementById('btn-submit-ticket').disabled);
    await pg.evaluate(() => window.submitTicket());
    // submitTicket() advances to the next ticket via a short setTimeout (renderTicket rebuilds
    // the whole DOM/state for the new ticket) -- give it time to actually fire before the next
    // loop iteration starts driving the (now-rebuilt) UI for the next ticket.
    await sleep(150);

    const afterTicket = await pg.evaluate(() => ({ ticketIndex: window.ticketIndex, ticketsResolved: window.labStats.ticketsResolved }));

    ok(`Ticket ${t + 1}: theory selection succeeded once evidence was grounded`, theorySelected === ticketMeta.correctTheoryId, theorySelected);
    ok(`Ticket ${t + 1}: test CONFIRMED the grounded theory`, confirmed === ticketMeta.correctTheoryId, confirmed);
    ok(`Ticket ${t + 1}: correct fix accepted (addresses confirmed cause)`, fixSelected === ticketMeta.correctFixId, fixSelected);
    ok(`Ticket ${t + 1}: documentation checklist + note unlocked Submit`, submitEnabled === true, submitEnabled);
    ok(`Ticket ${t + 1}: resolved (tickets resolved counter incremented)`, afterTicket.ticketsResolved === t + 1, afterTicket);
  }

  const finalRightState = await pg.evaluate(() => ({ mpCalls: window.__mpCalls, ticketsResolved: window.labStats.ticketsResolved }));
  ok('all 3 tickets resolved', finalRightState.ticketsResolved === 3, finalRightState.ticketsResolved);
  ok('ModuleProgress.complete fired exactly once', finalRightState.mpCalls.length === 1, finalRightState.mpCalls);
  if (finalRightState.mpCalls.length === 1) {
    const [house, moduleId, opts] = finalRightState.mpCalls[0];
    ok('ModuleProgress.complete signature is exactly (\'forge\', \'forge-troubleshooting\', {returnUrl:\'../index.html\'})',
      house === 'forge' && moduleId === 'forge-troubleshooting' && opts && opts.returnUrl === '../index.html', finalRightState.mpCalls[0]);
  }

  // ════════════════════════════════════════════════════════════════════
  // SCENARIO 3: DECOY THEORY -- picking the plausible-but-wrong theory
  // (available with zero evidence) must be allowed, but the test must
  // DISCONFIRM it, rule it out, and send the student back to Step 2
  // instead of forward to a fix. The correct theory must then still be
  // reachable and the ticket still resolvable.
  // ════════════════════════════════════════════════════════════════════
  console.log('\n=== Scenario 3: decoy theory is disconfirmed and sends the student back to Step 2 ===');
  await load();

  const decoyRun = await pg.evaluate(() => {
    const tk = window.TICKETS[0];
    const decoyId = tk.theories.filter(th => !th.correct)[0].id;
    const correctId = tk.theories.filter(th => th.correct)[0].id;

    // Gather everything so the correct theory's evidence requirement is satisfiable.
    tk.gather.forEach(g => window.doGather(g.id));
    window.proceedFromIdentify();

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

  // ════════════════════════════════════════════════════════════════════
  // SCENARIO 4: BUDGET DEPLETION -- real consequences, not just "wrong,
  // try again". Draining the time budget (repeatedly testing the
  // disconfirmed decoy) must escalate the ticket (fail-modal) instead of
  // silently letting the student keep working, and Retry must give a
  // clean restart of the SAME ticket.
  // ════════════════════════════════════════════════════════════════════
  console.log('\n=== Scenario 4: time-budget depletion escalates the ticket (real consequence) ===');
  await load();

  const budgetRun = await pg.evaluate(() => {
    const tk = window.TICKETS[0];
    const decoyId = tk.theories.filter(th => !th.correct)[0].id;

    // Force the budget low without touching the modal path: repeatedly re-run the costly
    // decoy dead end (gather -> decoy theory -> disconfirm -> return -> decoy theory again)
    // until the ticket escalates. Cap the loop generously so a logic bug can't hang the test.
    let loops = 0;
    while (window.timeBudget > 0 && loops < 20) {
      loops++;
      if (window.currentPhase === 0) {
        tk.gather.forEach(g => window.doGather(g.id));
        if (window.timeBudget <= 0) break;
        window.proceedFromIdentify();
      }
      if (window.currentPhase === 1) {
        window.selectTheory(decoyId);
        if (window.selectedTheoryId !== decoyId) break; // decoy got ruled out, nothing left to spend on
        window.proceedFromTheory();
      }
      if (window.currentPhase === 2 && window.timeBudget > 0) {
        window.runTest();
      }
    }
    const failModalActive = document.getElementById('fail-modal').classList.contains('active');
    const budgetAtEnd = window.timeBudget;
    return { failModalActive, budgetAtEnd, loops };
  });
  ok('draining the time budget shows the "Ticket Escalated" fail modal (real consequence, not silent)', budgetRun.failModalActive, budgetRun);

  const retryRun = await pg.evaluate((ticketNum) => {
    window.retryTicket();
    return {
      modalClosed: !document.getElementById('fail-modal').classList.contains('active'),
      phase: window.currentPhase,
      budgetRestored: window.timeBudget === window.TICKETS[window.ticketIndex].startBudget,
      sameTicket: window.ticketIndex === 0
    };
  });
  ok('Retry This Ticket closes the modal and restarts the SAME ticket at phase 0 with a full budget', retryRun.modalClosed && retryRun.phase === 0 && retryRun.budgetRestored && retryRun.sameTicket, retryRun);

  // ════════════════════════════════════════════════════════════════════
  // STYLE + INTEGRITY CHECKS on the rendered page
  // ════════════════════════════════════════════════════════════════════
  console.log('\n=== Style + platform integrity checks ===');
  const bodyHtml = await pg.evaluate(() => document.body.innerHTML);
  const emojiRe = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu;
  ok('0 emoji characters in the rendered page', (bodyHtml.match(emojiRe) || []).length === 0, (bodyHtml.match(emojiRe) || []).length);
  ok('0 em-dash characters in the rendered page', !bodyHtml.includes('—'));
  ok('back-link to ../index.html present', await pg.evaluate(() => !!document.querySelector('a.back-link[href="../index.html"]')));
  ok('ModuleProgress.js include present in source', fs.readFileSync(path.join(APP, LAB_URL), 'utf8').includes("components/ModuleProgress.js"));

  ok('0 non-platform-shim pageErrors', errs.length === 0, errs.slice(0, 4));

  await b.close(); srv.close();
  console.log(pass ? '\n*** A+ TROUBLESHOOTING WORKBENCH CHECK OK ***' : '\n!!! A+ TROUBLESHOOTING WORKBENCH CHECK FAILURES ABOVE !!!');
  process.exit(pass ? 0 : 1);
})();
