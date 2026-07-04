#!/usr/bin/env node
// aplus-troubleshooting-flowchart-check.js -- regression gate for the CompTIA A+ Core 1
// "Troubleshooting Flowchart" lab after its rebuild from a ~22-option pick-the-answer quiz
// (option-btn + data-correct + checkAnswer/showExplanation) into a real Flowchart Navigator
// engine. The rebuild's whole point is that the student must NAVIGATE a real branching
// diagnostic decision tree on 4 distinct faults -- picking the next diagnostic branch/test
// at each decision node, observing the actual (fault-specific) result, hitting real dead
// ends that cost a diagnostic strike, and isolating a confirmed root cause before picking
// the matching fix -- not click through 4-option multiple choice.
//
// This is deliberately NOT a duplicate of the sibling "Troubleshooting Methodology" lab's
// Support Ticket Workbench (gather/theory/test/fix/verify/document, time+patience meters).
// This lab has no 6-step methodology framing at all: it is pure decision-tree navigation,
// with its own distinct consequence model (diagnostic strikes) and its own distinct UI
// (a flowchart trail board that grows as the student branches, not an evidence board or
// ticket queue).
//
// This loads the real lab HTML headless (no build step -- same file served to students),
// stubs AccessGuard/ModuleProgress/HexAIButton the same way the sibling *-check.js files do,
// and drives the REAL exposed globals (chooseBranch/chooseFix/retryFault/resetLab, all plain
// function declarations in a classic <script>, so they land on window) through the actual
// DOM/state path.
//
// It asserts:
//   1. CORRECT playthrough: navigate the real correct branch at every decision node for all
//      4 faults, reach the root cause each time, pick the correct fix each time. MUST reach
//      completion and fire ModuleProgress.complete('forge','forge-troubleshooting-flowchart',
//      {returnUrl:'../index.html'}) exactly once.
//   2. WRONG-PATH playthrough: picking a dead-end branch (or a wrong fix) does not complete
//      the fault or the lab; it stays at the same decision point / corrective phase.
//   3. DIRECT-CALL BYPASS: chooseFix() called before the root cause has been reached is a
//      no-op (mode guard). chooseBranch() called with an option id that belongs to a LATER
//      node (not the current node) is a no-op (option-lookup guard, not just CSS visibility).
//      Re-calling chooseBranch() on an already-ruled-out dead end a second time is a no-op
//      (no double strike, no duplicate trail entry) -- proves the gate is a real state check,
//      not a one-time UI disable.
//   4. Scenario-accurate feedback: the rendered dead-end reason text for one fault's dead end
//      is captured and checked against that EXACT fault-specific string (not a generic
//      reused "wrong answer" message), and checked that it does NOT contain another fault's
//      confirmed-cause language (proving no false claim bleeds across faults).
//   5. Diagnostic-strike depletion escalates the fault (fail modal), and Retry restarts the
//      SAME fault at its first decision node with a full strike budget.
//   6. 0 non-platform-shim pageErrors, 0 emoji, 0 em-dash, back-link + ModuleProgress.js
//      include present.
//
// Usage: node _tools/arcade-fixes/aplus-troubleshooting-flowchart-check.js   (exit 0 = pass)
const http = require('http'), fs = require('fs'), path = require('path');
const pup = require(path.resolve(__dirname, '../../node_modules/puppeteer'));
const APP = path.resolve(__dirname, '../../_app');
const LAB_URL = '/houses/forge/applets/comptia-aplus/core-1/labs/forge-troubleshooting-flowchart.lab.html';
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.css': 'text/css', '.webp': 'image/webp', '.png': 'image/png', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.woff': 'font/woff' };
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
let pass = true;
const ok = (n, c, e) => { if (!c) pass = false; console.log('  ' + (c ? 'PASS' : 'FAIL') + '  ' + n + (e !== undefined ? '  ' + JSON.stringify(e).slice(0, 400) : '')); };

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
  // lab's own flowchart-navigation logic, not the platform shell (same pattern as sibling
  // *-check.js files). ModuleProgress.complete is captured into window.__mpCalls so we can
  // assert both that it fires on the correct path and that it NEVER fires on the wrong path.
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
    } else if (/AchievementManager\.js/.test(u)) {
      r.respond({ status: 200, contentType: 'text/javascript', body: 'window.AchievementManager={};' });
    } else r.continue();
  });

  async function load() {
    await pg.goto('http://localhost:' + port + LAB_URL, { waitUntil: 'domcontentloaded', timeout: 20000 }).catch(() => {});
    await sleep(300);
  }

  // ════════════════════════════════════════════════════════════════════
  // SCENARIO 1: WRONG PATH -- pick a dead-end branch at the very first
  // decision node of Fault 1 and confirm it does NOT advance the tree,
  // does NOT reach the root cause, and does NOT complete anything.
  // ════════════════════════════════════════════════════════════════════
  console.log('\n=== Scenario 1: dead-end branch does not advance the tree or complete ===');
  await load();

  const haveFns = await pg.evaluate(() => ({
    chooseBranch: typeof window.chooseBranch, chooseFix: typeof window.chooseFix,
    retryFault: typeof window.retryFault, resetLab: typeof window.resetLab, renderFault: typeof window.renderFault
  }));
  ok('inline <script> parsed + ran fully (lab functions present on window)',
    Object.values(haveFns).every(v => v === 'function'), haveFns);

  const beforeState = await pg.evaluate(() => ({ mode: window.mode, faultIndex: window.faultIndex, nodeId: window.currentNodeId, strikes: window.strikes, mpCalls: window.__mpCalls.length }));
  ok('starts at fault 0, node A0, mode NAVIGATE, full strikes, 0 completion calls',
    beforeState.mode === 'NAVIGATE' && beforeState.faultIndex === 0 && beforeState.nodeId === 'A0' && beforeState.strikes === 3 && beforeState.mpCalls === 0, beforeState);

  const deadEndRun = await pg.evaluate(() => {
    const fault = window.FAULTS[0];
    const node = fault.nodes[fault.rootNodeId];
    const deadOpt = node.options.filter(o => o.dead)[0];
    window.chooseBranch(deadOpt.id);
    const feedbackText = document.getElementById('node-feedback').textContent;
    return {
      deadOptId: deadOpt.id, expectedReason: deadOpt.reason,
      nodeIdAfter: window.currentNodeId, strikesAfter: window.strikes,
      ruledOutSet: !!window.ruledOut[deadOpt.id], feedbackText,
      nodesPassed: window.nodesPassed, mpCalls: window.__mpCalls.length
    };
  });
  ok('dead-end branch keeps currentNodeId at the SAME node (A0), does not advance the tree',
    deadEndRun.nodeIdAfter === 'A0', deadEndRun);
  ok('dead-end branch spends exactly one diagnostic strike (3 -> 2)', deadEndRun.strikesAfter === 2, deadEndRun);
  ok('dead-end branch marks itself ruled out', deadEndRun.ruledOutSet, deadEndRun);
  ok('dead-end branch does not count toward Isolation Progress (nodesPassed stays 0)', deadEndRun.nodesPassed === 0, deadEndRun);
  ok('dead-end branch never fires ModuleProgress.complete', deadEndRun.mpCalls === 0, deadEndRun);

  // Scenario-accurate feedback check: the rendered feedback for THIS dead end must contain
  // the EXACT fault-specific reason text, and must NOT contain another fault's confirmed-cause
  // claim (proving no generic/false reused feedback string).
  ok('rendered dead-end feedback contains the exact fault-specific reason text',
    deadEndRun.feedbackText.indexOf(deadEndRun.expectedReason) !== -1, { feedbackText: deadEndRun.feedbackText.slice(0, 160) });
  const otherFaultClaims = [
    "the installed power supply cannot deliver",
    "generic driver that cannot correctly interpret",
    "bent internal pin and debris inside the laptop's charging port"
  ];
  ok('rendered dead-end feedback does not bleed in another fault\'s confirmed-cause claim',
    otherFaultClaims.every(c => deadEndRun.feedbackText.indexOf(c) === -1), deadEndRun.feedbackText.slice(0, 160));

  // Re-clicking (direct call) the SAME already-ruled-out dead end must be a total no-op:
  // no second strike spent, no duplicate trail entry.
  const repeatDeadEnd = await pg.evaluate((deadOptId) => {
    const strikesBefore = window.strikes;
    const trailCountBefore = document.querySelectorAll('#trail-list .trail-entry').length;
    window.chooseBranch(deadOptId);
    return {
      strikesUnchanged: window.strikes === strikesBefore,
      trailCountUnchanged: document.querySelectorAll('#trail-list .trail-entry').length === trailCountBefore
    };
  }, deadEndRun.deadOptId);
  ok('re-calling chooseBranch() on an already-ruled-out dead end is a no-op (no double strike, no duplicate trail entry)',
    repeatDeadEnd.strikesUnchanged && repeatDeadEnd.trailCountUnchanged, repeatDeadEnd);

  // ════════════════════════════════════════════════════════════════════
  // SCENARIO 2: DIRECT-CALL BYPASS -- chooseFix() called before the root
  // cause has ever been reached (mode is still NAVIGATE) must be a no-op,
  // and chooseBranch() called with an option id belonging to a LATER node
  // (not the current node) must also be a no-op.
  // ════════════════════════════════════════════════════════════════════
  console.log('\n=== Scenario 2: direct-call bypass of the corrective phase and of node order ===');
  await load();

  const bypassRun = await pg.evaluate(() => {
    const fault = window.FAULTS[0];
    const correctFixId = fault.fixes.filter(x => x.correct)[0].id;
    // Attempt: jump straight to picking the correct fix with the root cause never reached.
    window.chooseFix(correctFixId);
    const modeAfterFixAttempt = window.mode;
    const faultResolvedAfter = window.faultResolved;
    const mpCallsAfterFixAttempt = window.__mpCalls.length;

    // Attempt: call chooseBranch() with an option id that belongs to node A2 (two levels
    // deeper than the current node A0). Since A0's option list does not contain this id,
    // it must be silently ignored -- proving the guard checks the CURRENT node's real option
    // list, not just whether SOME option somewhere in the fault has this id.
    const deepOptionId = fault.nodes.A2.options.filter(o => !o.dead)[0].id;
    window.chooseBranch(deepOptionId);
    const nodeIdAfterForeignAttempt = window.currentNodeId;
    const nodesPassedAfterForeignAttempt = window.nodesPassed;

    return { modeAfterFixAttempt, faultResolvedAfter, mpCallsAfterFixAttempt, nodeIdAfterForeignAttempt, nodesPassedAfterForeignAttempt };
  });
  ok('chooseFix() called while mode is still NAVIGATE (root cause never reached) is a no-op',
    bypassRun.modeAfterFixAttempt === 'NAVIGATE' && bypassRun.faultResolvedAfter === false, bypassRun);
  ok('chooseFix() bypass attempt never fires ModuleProgress.complete', bypassRun.mpCallsAfterFixAttempt === 0, bypassRun);
  ok('chooseBranch() with an option id foreign to the CURRENT node (A0) is a no-op (stays at A0, 0 nodes passed)',
    bypassRun.nodeIdAfterForeignAttempt === 'A0' && bypassRun.nodesPassedAfterForeignAttempt === 0, bypassRun);

  // ════════════════════════════════════════════════════════════════════
  // SCENARIO 3: CORRECT PLAYTHROUGH -- navigate the real correct branch
  // at every decision node for all 4 faults, reach the root cause each
  // time, and pick the correct fix each time. Must complete exactly once
  // with the required ModuleProgress signature.
  // ════════════════════════════════════════════════════════════════════
  console.log('\n=== Scenario 3: correct playthrough isolates all 4 faults and completes ===');
  await load();

  const faultCount = await pg.evaluate(() => window.FAULTS.length);
  ok('lab data defines 4 distinct faults', faultCount === 4, faultCount);

  for (let i = 0; i < faultCount; i++) {
    const faultMeta = await pg.evaluate((idx) => {
      const f = window.FAULTS[idx];
      return { rootNodeId: f.rootNodeId, nodeCount: Object.keys(f.nodes).length, correctFixId: f.fixes.filter(x => x.correct)[0].id };
    }, i);

    // Walk the correct branch at every node until the root cause is reached.
    let guard = 0;
    let reachedRoot = false;
    while (!reachedRoot && guard < 10) {
      guard++;
      const stepResult = await pg.evaluate(() => {
        const f = window.FAULTS[window.faultIndex];
        const node = f.nodes[window.currentNodeId];
        const correctOpt = node.options.filter(o => !o.dead)[0];
        window.chooseBranch(correctOpt.id);
        return { rootCauseReached: window.rootCauseReached, mode: window.mode };
      });
      reachedRoot = stepResult.rootCauseReached;
    }
    const afterNav = await pg.evaluate(() => ({ mode: window.mode, rootCauseReached: window.rootCauseReached, nodesPassed: window.nodesPassed }));
    ok(`Fault ${i + 1}: correct-branch navigation reaches the root cause and unlocks CORRECTIVE mode`,
      afterNav.mode === 'CORRECTIVE' && afterNav.rootCauseReached === true && afterNav.nodesPassed === faultMeta.nodeCount, afterNav);

    // Pick the correct fix.
    await pg.evaluate((fixId) => window.chooseFix(fixId), faultMeta.correctFixId);
    await sleep(150); // submitTicket-style setTimeout advance to the next fault

    const afterFix = await pg.evaluate(() => ({ faultIndex: window.faultIndex, faultsResolved: window.labStats.faultsResolved }));
    ok(`Fault ${i + 1}: correct fix resolves the fault (faultsResolved counter incremented)`,
      afterFix.faultsResolved === i + 1, afterFix);
  }

  const finalRightState = await pg.evaluate(() => ({ mpCalls: window.__mpCalls, faultsResolved: window.labStats.faultsResolved }));
  ok('all 4 faults resolved', finalRightState.faultsResolved === 4, finalRightState.faultsResolved);
  ok('ModuleProgress.complete fired exactly once', finalRightState.mpCalls.length === 1, finalRightState.mpCalls);
  if (finalRightState.mpCalls.length === 1) {
    const [house, moduleId, opts] = finalRightState.mpCalls[0];
    ok('ModuleProgress.complete signature is exactly (\'forge\', \'forge-troubleshooting-flowchart\', {returnUrl:\'../index.html\'})',
      house === 'forge' && moduleId === 'forge-troubleshooting-flowchart' && opts && opts.returnUrl === '../index.html', finalRightState.mpCalls[0]);
  }

  // ════════════════════════════════════════════════════════════════════
  // SCENARIO 4: WRONG FIX -- once the root cause is reached, picking a
  // wrong fix must not resolve the fault or complete the lab, must spend
  // a strike, and the fault-specific wrong-fix reason must render.
  // ════════════════════════════════════════════════════════════════════
  console.log('\n=== Scenario 4: wrong fix in the corrective phase does not resolve the fault ===');
  await load();

  const wrongFixRun = await pg.evaluate(() => {
    const f = window.FAULTS[0];
    // Legitimately reach the root cause first.
    let nodeId = f.rootNodeId;
    let reached = false;
    for (let guard = 0; guard < 10 && !reached; guard++) {
      const node = f.nodes[window.currentNodeId];
      const correctOpt = node.options.filter(o => !o.dead)[0];
      window.chooseBranch(correctOpt.id);
      reached = window.rootCauseReached;
    }
    const wrongFix = f.fixes.filter(x => !x.correct)[0];
    const strikesBefore = window.strikes;
    window.chooseFix(wrongFix.id);
    return {
      reachedRoot: reached, strikesAfter: window.strikes, strikesBefore,
      faultResolved: window.faultResolved, mpCalls: window.__mpCalls.length,
      feedbackText: document.getElementById('fix-feedback').textContent,
      expectedReason: wrongFix.reason
    };
  });
  ok('reached root cause before testing the wrong fix', wrongFixRun.reachedRoot, wrongFixRun);
  ok('wrong fix spends a diagnostic strike and does not resolve the fault',
    wrongFixRun.strikesAfter === wrongFixRun.strikesBefore - 1 && wrongFixRun.faultResolved === false, wrongFixRun);
  ok('wrong fix never fires ModuleProgress.complete', wrongFixRun.mpCalls === 0, wrongFixRun);
  ok('rendered wrong-fix feedback contains the exact fault-specific reason text',
    wrongFixRun.feedbackText.indexOf(wrongFixRun.expectedReason) !== -1, wrongFixRun.feedbackText.slice(0, 160));

  // ════════════════════════════════════════════════════════════════════
  // SCENARIO 5: STRIKE DEPLETION -- real consequences, not just "wrong,
  // try again". Repeatedly hitting dead ends must deplete the diagnostic
  // strikes and escalate the fault (fail modal), and Retry must give a
  // clean restart of the SAME fault at its first decision node.
  // ════════════════════════════════════════════════════════════════════
  console.log('\n=== Scenario 5: diagnostic-strike depletion escalates the fault (real consequence) ===');
  await load();

  const strikeRun = await pg.evaluate(() => {
    const f = window.FAULTS[0];
    const node = f.nodes[f.rootNodeId];
    const deadOptions = node.options.filter(o => o.dead);
    // This fault's first node has exactly 2 dead-end options and 3 starting strikes,
    // so hitting both dead ends spends 2 of 3 strikes without depleting them yet.
    deadOptions.forEach(o => window.chooseBranch(o.id));
    const strikesAfterBothDeadEnds = window.strikes;
    const failModalActiveEarly = document.getElementById('fail-modal').classList.contains('active');
    // The correct branch is now the only one left; take it, then repeat the same dead-end
    // pattern at the next node to fully deplete the strike budget and trigger escalation.
    const correctOpt = node.options.filter(o => !o.dead)[0];
    window.chooseBranch(correctOpt.id);
    const nextNode = f.nodes[window.currentNodeId];
    const nextDeadOptions = nextNode.options.filter(o => o.dead);
    nextDeadOptions.forEach(o => window.chooseBranch(o.id));
    const failModalActive = document.getElementById('fail-modal').classList.contains('active');
    const strikesAtEnd = window.strikes;
    return { strikesAfterBothDeadEnds, failModalActiveEarly, failModalActive, strikesAtEnd };
  });
  ok('hitting 2 dead ends spends 2 strikes without escalating yet (strikes at 1, modal not active)',
    strikeRun.strikesAfterBothDeadEnds === 1 && strikeRun.failModalActiveEarly === false, strikeRun);
  ok('depleting the diagnostic strike budget shows the "Fault Escalated" fail modal (real consequence, not silent)',
    strikeRun.failModalActive === true && strikeRun.strikesAtEnd <= 0, strikeRun);

  const retryRun = await pg.evaluate(() => {
    window.retryFault();
    const f = window.FAULTS[window.faultIndex];
    return {
      modalClosed: !document.getElementById('fail-modal').classList.contains('active'),
      nodeId: window.currentNodeId,
      strikesRestored: window.strikes === f.startStrikes,
      sameFault: window.faultIndex === 0,
      modeReset: window.mode === 'NAVIGATE'
    };
  });
  ok('Retry This Fault closes the modal and restarts the SAME fault at its first node with full strikes',
    retryRun.modalClosed && retryRun.nodeId === 'A0' && retryRun.strikesRestored && retryRun.sameFault && retryRun.modeReset, retryRun);

  // ════════════════════════════════════════════════════════════════════
  // SCENARIO 6: ANTI-POSITIONAL-GAMING SHUFFLE AUDIT -- a follow-up audit
  // found that every node's correct branch and every fault's correct fix
  // was array-index 0 and rendered first, every time, with no shuffle: a
  // student could win the whole lab by always clicking the first card,
  // with zero reasoning. That is disguised multiple choice. This scenario
  // proves (a) the shuffle() helper itself actually randomizes, as pure
  // math, independent of any DOM/render timing, and (b) the REAL rendered
  // card order for both branch options and fix options is not fixed at
  // index 0 -- it varies across repeated renders of the same node/fault.
  // ════════════════════════════════════════════════════════════════════
  console.log('\n=== Scenario 6: anti-positional-gaming shuffle audit ===');
  await load();

  // (a) Pure statistical proof that shuffle() randomizes: shuffle a known
  // reference array many times and confirm the tracked element does NOT
  // land in the same slot every single time. With 4 elements and 40
  // trials, the odds of a real Fisher-Yates producing the same index all
  // 40 times are astronomically small (~1 in 4^39); this is not a
  // meaningful flake risk.
  const shuffleStats = await pg.evaluate(() => {
    const indices = [];
    for (let t = 0; t < 40; t++) {
      const shuffled = window.shuffle(['ref-A', 'ref-B', 'ref-C', 'ref-D']);
      indices.push(shuffled.indexOf('ref-A'));
    }
    return { distinctIndices: Array.from(new Set(indices)), sample: indices.slice(0, 10) };
  });
  ok('shuffle() is exposed on window and actually randomizes (tracked element lands at more than one index across 40 trials)',
    shuffleStats.distinctIndices.length > 1, shuffleStats);

  // (b) Real rendered DOM order for BRANCH options: call the real renderNode()
  // repeatedly for fault 0's root node (a pure render function -- no state
  // mutation) and record the on-screen index of the correct (non-dead)
  // option's card each time.
  const branchPositions = await pg.evaluate(() => {
    const f = window.FAULTS[0];
    const node = f.nodes[f.rootNodeId];
    const correctId = node.options.filter(o => !o.dead)[0].id;
    const positions = [];
    for (let t = 0; t < 15; t++) {
      window.renderNode();
      const ids = Array.from(document.querySelectorAll('#branch-options .action-card')).map(el => el.id);
      positions.push(ids.indexOf('branch-' + correctId));
    }
    return { positions, distinct: Array.from(new Set(positions)) };
  });
  ok('rendered BRANCH option order varies across repeated renders of the same node (correct branch is not fixed at index 0)',
    branchPositions.distinct.length > 1 && branchPositions.distinct.some(p => p !== 0), branchPositions);

  // (c) Real rendered DOM order for FIX options: legitimately reach the root
  // cause on fault 0 once, then call the real renderCorrective() repeatedly
  // (also a pure render function) and record the on-screen index of the
  // correct fix's card each time.
  const fixPositions = await pg.evaluate(() => {
    const f = window.FAULTS[0];
    let reached = false;
    for (let guard = 0; guard < 10 && !reached; guard++) {
      const node = f.nodes[window.currentNodeId];
      const correctOpt = node.options.filter(o => !o.dead)[0];
      window.chooseBranch(correctOpt.id);
      reached = window.rootCauseReached;
    }
    const correctFixId = f.fixes.filter(x => x.correct)[0].id;
    const positions = [];
    for (let t = 0; t < 15; t++) {
      window.renderCorrective();
      const ids = Array.from(document.querySelectorAll('#fix-options .action-card')).map(el => el.id);
      positions.push(ids.indexOf('fix-' + correctFixId));
    }
    return { reached, positions, distinct: Array.from(new Set(positions)) };
  });
  ok('reached root cause before auditing fix-option render order', fixPositions.reached, fixPositions);
  ok('rendered FIX option order varies across repeated renders of the corrective panel (correct fix is not fixed at index 0)',
    fixPositions.distinct.length > 1 && fixPositions.distinct.some(p => p !== 0), fixPositions);

  // (d) Grading-by-id sanity check: even with rendering shuffled, navigating
  // and fixing by id must still work end-to-end (re-verify on a fresh load,
  // separate from the Scenario 3 full run, specifically after having just
  // hammered renderNode()/renderCorrective() above). A fresh load is required
  // here because (b)/(c) above left currentNodeId/mode past node A0.
  await load();
  const postShuffleNav = await pg.evaluate(() => {
    const f = window.FAULTS[0];
    const node = f.nodes[f.rootNodeId];
    const correctOpt = node.options.filter(o => !o.dead)[0];
    // Click the actual rendered card (not a raw function call) to prove the
    // shuffled DOM element for the correct id is wired to the correct handler.
    document.getElementById('branch-' + correctOpt.id).click();
    return { nodeIdAfter: window.currentNodeId, expectedNext: correctOpt.leadsTo };
  });
  ok('clicking the (shuffled-position) rendered card for the correct branch id still advances the tree correctly',
    postShuffleNav.nodeIdAfter === postShuffleNav.expectedNext, postShuffleNav);

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
  console.log(pass ? '\n*** A+ TROUBLESHOOTING FLOWCHART NAVIGATOR CHECK OK ***' : '\n!!! A+ TROUBLESHOOTING FLOWCHART NAVIGATOR CHECK FAILURES ABOVE !!!');
  process.exit(pass ? 0 : 1);
})();
