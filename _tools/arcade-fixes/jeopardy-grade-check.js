#!/usr/bin/env node
// jeopardy-grade-check.js — browser-level regression gate for the solo auto-grade
// mode added to the A+ Jeopardy review game.
//
// forge-aplus-jeopardy.applet.html gates its whole body behind
// AccessGuard.require('sorted') in <head>, which — for a non-sorted/non-tourist
// headless load — hides the page and navigates away after ~100ms (see
// AccessGuard.js require()/redirect()). Unlike cockpit-render-check.js (which
// stubs FirebaseAuth.js/AccountFrame.js for console.html's admin guard), this
// page uses AccessGuard directly, so we intercept AccessGuard.js itself and
// serve a stub that no-ops require() to true. HexAIButton.js is also stubbed
// (it statically imports Firebase from a CDN — irrelevant to grading logic and
// not worth a live network dependency in this test).
//
// Asserts: (a) opening a clue in Solo Play offers typed-answer entry, (b) a
// correct typed answer plus shorthand variants grades CORRECT and adds the
// clue's $ value to Solo Score, (c) a wrong answer grades INCORRECT and
// deducts, (d) every one of the 30 clues' accepted-answer set is non-empty AND
// actually accepts both its canonical answer and at least one shorthand
// variant (no clue is ungradeable), (e) 0 pageErrors.
//
// Usage: node _tools/arcade-fixes/jeopardy-grade-check.js   (exit 0 = pass)
const http = require('http'), fs = require('fs'), path = require('path');
const pup = require('puppeteer');
const APP = path.resolve(__dirname, '../../_app');
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.css': 'text/css', '.webp': 'image/webp', '.png': 'image/png', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.woff': 'font/woff' };
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
let pass = true;
const ok = (n, c, e) => { if (!c) pass = false; console.log('  ' + (c ? 'PASS' : 'FAIL') + '  ' + n + (e !== undefined ? '  ' + JSON.stringify(e).slice(0, 300) : '')); };

const srv = http.createServer((q, s) => {
  let p = decodeURIComponent(q.url.split('?')[0]); let fp = path.join(APP, p);
  if (fs.existsSync(fp) && fs.statSync(fp).isFile()) { s.writeHead(200, { 'Content-Type': MIME[path.extname(fp)] || 'application/octet-stream' }); fs.createReadStream(fp).pipe(s); }
  else { s.writeHead(404); s.end('nf'); }
});

// Stub bodies served in place of the real network dependencies.
const ACCESS_GUARD_STUB = "window.AccessGuard={require:function(){return true;},requireAll:function(){return true;},requireAny:function(){return true;},hasGodMode:function(){return false;},isFirebaseAdmin:function(){return false;},isSorted:function(){return true;},isTourist:function(){return false;},showContent:function(){},hideContent:function(){},showIndicatorIfActive:function(){}};";
const HEX_AI_BUTTON_STUB = "if (!customElements.get('hex-ai-button')) { customElements.define('hex-ai-button', class extends HTMLElement { connectedCallback(){} }); }";

(async () => {
  await new Promise(r => srv.listen(0, r)); const port = srv.address().port;
  const b = await pup.launch({ headless: 'new', args: ['--no-sandbox'] });
  const pg = await b.newPage();
  const errs = [];
  pg.on('pageerror', e => errs.push(String(e.message).slice(0, 300)));
  pg.on('console', msg => { if (msg.type() === 'error') { /* console.error noise (e.g. Firebase-less env) is not a pageerror; ignored here */ } });

  await pg.setRequestInterception(true);
  pg.on('request', r => {
    const u = r.url();
    if (u.endsWith('AccessGuard.js')) r.respond({ status: 200, contentType: 'text/javascript', body: ACCESS_GUARD_STUB });
    else if (u.endsWith('HexAIButton.js')) r.respond({ status: 200, contentType: 'text/javascript', body: HEX_AI_BUTTON_STUB });
    else r.continue();
  });

  await pg.goto('http://localhost:' + port + '/houses/forge/reviews/forge-aplus-jeopardy.applet.html', { waitUntil: 'domcontentloaded', timeout: 20000 }).catch(() => {});
  await sleep(400);

  // Sanity: the board actually rendered (proves the inline script parsed + ran,
  // and would catch a broken template literal the same way cockpit-render-check.js does).
  const boardCells = await pg.evaluate(() => document.querySelectorAll('.question-cell').length);
  ok('board rendered all 30 clue cells (6 categories x 5 clues)', boardCells === 30, boardCells);

  const haveFns = await pg.evaluate(() => ({
    open: typeof window.openQuestion, submit: typeof window.submitSoloAnswer, toggle: typeof window.toggleSoloMode,
    isCorrect: typeof window.isAnswerCorrect, norm: typeof window.normalizeAnswer, cats: Array.isArray(window.categories) ? window.categories.length : -1
  }));
  ok('public test hooks present (IIFE-free script ran fully): openQuestion/submitSoloAnswer/toggleSoloMode/isAnswerCorrect/normalizeAnswer/categories', haveFns.open === 'function' && haveFns.submit === 'function' && haveFns.toggle === 'function' && haveFns.isCorrect === 'function' && haveFns.norm === 'function' && haveFns.cats === 6, haveFns);

  // ── Turn on Solo Play via a REAL UI click (not just calling the JS fn) ──
  await pg.click('#soloModeToggle');
  await sleep(100);
  const modeUI = await pg.evaluate(() => ({
    group: document.getElementById('groupScoreboard').style.display,
    solo: document.getElementById('soloScoreboard').style.display
  }));
  ok('Solo Play toggle swaps scoreboard to Solo Score', modeUI.group === 'none' && modeUI.solo === 'flex', modeUI);

  // ── (a) Opening a clue in Solo Play offers typed-answer entry — via a REAL click ──
  // Windows Editions / $100 = "What is Windows 10 Pro?"
  await pg.click('.question-cell[data-cat="0"][data-q="0"]');
  await sleep(100);
  const openState = await pg.evaluate(() => ({
    modalActive: document.getElementById('modal').classList.contains('active'),
    soloPanel: document.getElementById('modalSolo').style.display,
    inputExists: !!document.getElementById('soloInput'),
    inputTag: document.getElementById('soloInput') ? document.getElementById('soloInput').tagName : null
  }));
  ok('opening a clue in Solo Play shows a typed-answer <input> (modalSolo visible)', openState.modalActive && openState.soloPanel === 'flex' && openState.inputExists && openState.inputTag === 'INPUT', openState);

  // ── (b) Correct typed answer grades CORRECT and adds the $ value ──
  const scoreBefore1 = await pg.evaluate(() => parseInt(document.getElementById('soloScoreValue').textContent, 10));
  await pg.type('#soloInput', 'Windows 10 Pro');
  await pg.click('#soloSubmitBtn');
  await sleep(150);
  const afterCorrect1 = await pg.evaluate(() => ({
    result: document.getElementById('modalResult').textContent,
    resultClass: document.getElementById('modalResult').className,
    score: parseInt(document.getElementById('soloScoreValue').textContent, 10)
  }));
  ok('correct typed answer ("Windows 10 Pro") grades CORRECT', /CORRECT/.test(afterCorrect1.result) && !/INCORRECT/.test(afterCorrect1.result) && /right/.test(afterCorrect1.resultClass), afterCorrect1);
  ok('correct answer adds the clue value ($100) to Solo Score', afterCorrect1.score === scoreBefore1 + 100, { before: scoreBefore1, after: afterCorrect1.score });
  await pg.click('.modal-btn.close');
  await sleep(100);

  // Re-open the SAME clue programmatically (the board cell is no longer clickable
  // once revealed — this drives the identical openQuestion/submitSoloAnswer code
  // path a real click would use) and try a shorthand variant + the full canonical
  // "What is X?" phrasing, per spec: "'What is' prefix optional".
  const scoreBefore2 = await pg.evaluate(() => parseInt(document.getElementById('soloScoreValue').textContent, 10));
  await pg.evaluate(() => window.openQuestion(0, 0));
  await sleep(50);
  await pg.type('#soloInput', 'win 10 pro');
  await pg.evaluate(() => window.submitSoloAnswer());
  await sleep(100);
  const afterCorrect2 = await pg.evaluate(() => ({ result: document.getElementById('modalResult').textContent, score: parseInt(document.getElementById('soloScoreValue').textContent, 10) }));
  ok('accepted shorthand variant ("win 10 pro") also grades CORRECT', /CORRECT/.test(afterCorrect2.result) && !/INCORRECT/.test(afterCorrect2.result) && afterCorrect2.score === scoreBefore2 + 100, afterCorrect2);
  await pg.evaluate(() => window.closeModal());

  const scoreBefore3 = await pg.evaluate(() => parseInt(document.getElementById('soloScoreValue').textContent, 10));
  await pg.evaluate(() => window.openQuestion(0, 0));
  await sleep(50);
  await pg.type('#soloInput', 'What is Windows 10 Pro?');
  await pg.evaluate(() => window.submitSoloAnswer());
  await sleep(100);
  const afterCorrect3 = await pg.evaluate(() => ({ result: document.getElementById('modalResult').textContent, score: parseInt(document.getElementById('soloScoreValue').textContent, 10) }));
  ok('full canonical phrasing ("What is Windows 10 Pro?") also grades CORRECT (prefix optional either way)', /CORRECT/.test(afterCorrect3.result) && !/INCORRECT/.test(afterCorrect3.result) && afterCorrect3.score === scoreBefore3 + 100, afterCorrect3);
  await pg.evaluate(() => window.closeModal());

  // ── (c) Wrong answer grades incorrect and deducts ──
  // Command Line / $100 = "What is cd?" — a fresh, never-graded clue.
  const scoreBefore4 = await pg.evaluate(() => parseInt(document.getElementById('soloScoreValue').textContent, 10));
  await pg.click('.question-cell[data-cat="1"][data-q="0"]');
  await sleep(100);
  await pg.type('#soloInput', 'a banana sandwich');
  await pg.click('#soloSubmitBtn');
  await sleep(150);
  const afterWrong = await pg.evaluate(() => ({
    result: document.getElementById('modalResult').textContent,
    resultClass: document.getElementById('modalResult').className,
    score: parseInt(document.getElementById('soloScoreValue').textContent, 10)
  }));
  ok('wrong typed answer grades INCORRECT', /INCORRECT/.test(afterWrong.result) && /wrong/.test(afterWrong.resultClass), afterWrong);
  ok('wrong answer deducts the clue value ($100) from Solo Score', afterWrong.score === scoreBefore4 - 100, { before: scoreBefore4, after: afterWrong.score });
  await pg.click('.modal-btn.close');
  await sleep(100);

  // ── Double-scoring guard: once a clue is graded via typed submit, the
  // fallback reveal/correct/wrong buttons must not be able to fire again for it. ──
  const lockState = await pg.evaluate(() => {
    window.openQuestion(2, 0); // Security / $100
    document.getElementById('soloInput').value = 'AutoRun';
    window.submitSoloAnswer();
    const revealHidden = document.getElementById('revealBtn').style.display === 'none';
    const soloHidden = document.getElementById('modalSolo').style.display === 'none';
    const scoreBeforeRetry = parseInt(document.getElementById('soloScoreValue').textContent, 10);
    window.markWrong(); // should no-op: clue already locked
    const scoreAfterRetry = parseInt(document.getElementById('soloScoreValue').textContent, 10);
    return { revealHidden, soloHidden, scoreBeforeRetry, scoreAfterRetry };
  });
  ok('after typed-submit grading, fallback UI is hidden (reveal + solo input both gone)', lockState.revealHidden && lockState.soloHidden, lockState);
  ok('clueLocked guard blocks a second scoring action (markWrong) on the same graded clue', lockState.scoreAfterRetry === lockState.scoreBeforeRetry, lockState);
  await pg.evaluate(() => window.closeModal());

  // ── (d) Every one of the 30 clues has a non-empty, non-ungradeable accepted-answer set ──
  const clueAudit = await pg.evaluate(() => {
    const rows = [];
    window.categories.forEach((cat, ci) => {
      cat.questions.forEach((q, qi) => {
        const hasAccepts = Array.isArray(q.accepts) && q.accepts.length > 0;
        const canonicalGrades = window.isAnswerCorrect(ci, qi, q.answer);
        const shorthandGrades = hasAccepts ? window.isAnswerCorrect(ci, qi, q.accepts[0]) : false;
        const blankRejected = window.isAnswerCorrect(ci, qi, '') === false && window.isAnswerCorrect(ci, qi, '   ') === false;
        rows.push({ cat: cat.name, points: q.points, hasAccepts, canonicalGrades, shorthandGrades, blankRejected });
      });
    });
    return rows;
  });
  const badAccepts = clueAudit.filter(r => !r.hasAccepts);
  const badCanonical = clueAudit.filter(r => !r.canonicalGrades);
  const badShorthand = clueAudit.filter(r => !r.shorthandGrades);
  const badBlank = clueAudit.filter(r => !r.blankRejected);
  ok('all 30 clues have a non-empty accepts[] (not left to the tautological canonical-only check)', clueAudit.length === 30 && badAccepts.length === 0, badAccepts.map(r => r.cat + ' $' + r.points));
  ok('all 30 clues: typing the clue\'s real canonical answer grades CORRECT (none ungradeable)', badCanonical.length === 0, badCanonical.map(r => r.cat + ' $' + r.points));
  ok('all 30 clues: typing the first accepted shorthand variant also grades CORRECT', badShorthand.length === 0, badShorthand.map(r => r.cat + ' $' + r.points));
  ok('all 30 clues: blank/whitespace-only input is rejected (no free correct-by-blank)', badBlank.length === 0, badBlank.map(r => r.cat + ' $' + r.points));

  // ── Content fixes: MFA (Security $300) and diskpart (Command Line $400) ──
  const fixed = await pg.evaluate(() => ({
    mfaQ: window.categories[2].questions[2].question,
    diskpartQ: window.categories[1].questions[3].question
  }));
  ok('Security-300 no longer conflates MFA with SMS-PIN specifically (rewritten)', !/PIN sent via text/i.test(fixed.mfaQ) && /two or more independent factors/i.test(fixed.mfaQ), fixed.mfaQ);
  ok('Command Line-400 diskpart claim is now precise (clean vs clean all)', !/completely wipes a hard drive/i.test(fixed.diskpartQ) && /clean all/i.test(fixed.diskpartQ), fixed.diskpartQ);

  // ── Facilitated group mode still works unchanged (toggle back off) ──
  await pg.click('#soloModeToggle');
  await sleep(100);
  const groupUI = await pg.evaluate(() => ({
    group: document.getElementById('groupScoreboard').style.display,
    solo: document.getElementById('soloScoreboard').style.display
  }));
  ok('toggling Solo Play off restores the facilitated 3-team scoreboard', groupUI.group === 'flex' && groupUI.solo === 'none', groupUI);
  await pg.click('.question-cell[data-cat="3"][data-q="0"]'); // Troubleshooting / $100
  await sleep(100);
  const facilitatedState = await pg.evaluate(() => document.getElementById('modalSolo').style.display);
  ok('facilitated mode does not show the typed-answer input', facilitatedState === 'none', facilitatedState);
  await pg.click('#revealBtn');
  await sleep(100);
  const facilitatedButtons = await pg.evaluate(() => ({ correct: document.getElementById('correctBtn').style.display, wrong: document.getElementById('wrongBtn').style.display }));
  ok('facilitated Show Answer -> Correct/Wrong buttons still work (group play unaffected)', facilitatedButtons.correct === 'inline-block' && facilitatedButtons.wrong === 'inline-block', facilitatedButtons);
  await pg.click('#correctBtn');

  ok('0 pageErrors', errs.length === 0, errs.slice(0, 6));

  await b.close(); srv.close();
  console.log(pass ? '\n*** JEOPARDY GRADE CHECK OK ***' : '\n!!! JEOPARDY GRADE CHECK FAILURES ABOVE !!!');
  process.exit(pass ? 0 : 1);
})();
