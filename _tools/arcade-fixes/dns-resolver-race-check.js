#!/usr/bin/env node
// dns-resolver-race-check.js — regression gate for the Web House "DNS Resolver Race" review quiz
// after fixing a gameable mechanic (two parts):
//   1. Multiple-choice options were rendered in fixed source order and 21/23 questions had
//      `correct: 0` — "always click the first option" won ~91% with zero DNS knowledge. Fix:
//      renderQuestion now tags each option with correctness BEFORE a Fisher-Yates shuffle, stores
//      the shuffled array as game.currentOptions, and selectOption() grades by IDENTITY
//      (this.currentOptions[index].correct), not by position.
//   2. The match-the-pairs step was unfailable — a wrong left/right pairing just bounced back after
//      500ms so the player could brute-force every combination until every pair landed correct, and
//      submitMatch() only ever checked matchedPairs.length === pairs.length (always true once you
//      persist). Fix: any mismatch now sets game.wrongMatchOccurred = true (permanent for the round,
//      practice-retry UX unchanged), and submitMatch() grades
//      matchedPairs.length === pairs.length && !wrongMatchOccurred.
//
// This loads the real quiz HTML headless (no build step — same file served to students), drives the
// REAL exposed `game` global (not a re-implementation) via renderQuestion/selectOption/selectMatch/
// submitMatch/start, and asserts:
//   - 0 non-platform-shim pageErrors (the inline <script> parses and runs to completion)
//   - across many shuffle trials, the correct MC option is NOT always rendered at index 0
//   - identity survives the shuffle: the option flagged correct always matches the question's real
//     answer text, even for questions where the pre-shuffle correct index was not 0
//   - selecting a WRONG MC option grades wrong (regardless of its position)
//   - selecting the (shuffled-position) CORRECT MC option grades correct
//   - a match round with one wrong pairing along the way grades INCORRECT even after every pair is
//     eventually matched (this is the failability fix)
//   - a match round with zero wrong pairings grades CORRECT
//   - a full 10-round playthrough answered with total DNS knowledge (correct MC by identity, correct
//     drag order, correct-only matches) still finishes at 100% accuracy
//
// Usage: node _tools/arcade-fixes/dns-resolver-race-check.js   (exit 0 = pass)
const http = require('http'), fs = require('fs'), path = require('path');
const pup = require('puppeteer');
const APP = path.resolve(__dirname, '../../_app');
const GAME_URL = '/houses/web/reviews/web-dns-resolver-race.html';
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.css': 'text/css', '.webp': 'image/webp', '.png': 'image/png', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.woff': 'font/woff' };
const sleep = (ms) => new Promise(r => setTimeout(r, ms)); // await a delay in the async driver
let pass = true;
// ok(name, cond, extra): record + print one assertion; flips the global pass flag on failure.
const ok = (n, c, e) => { if (!c) pass = false; console.log('  ' + (c ? 'PASS' : 'FAIL') + '  ' + n + (e !== undefined ? '  ' + JSON.stringify(e).slice(0, 300) : '')); };

// Static file server rooted at _app so the quiz + its component scripts load same-origin.
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
  // Capture uncaught errors, ignoring expected no-creds platform-shim noise (AccessGuard/Firebase).
  pg.on('pageerror', e => { const m = String(e.message); if (!/firebase|firestore|auth\/|AccessGuard|not authenticated/i.test(m)) errs.push(m.slice(0, 200)); });
  await pg.setRequestInterception(true);
  // Neutralize component dependencies so the page renders instead of redirecting/throwing — we're
  // testing quiz logic, not the platform shell.
  pg.on('request', r => {
    const u = r.url();
    if (/AccessGuard\.js|AchievementManager\.js|GameTracker\.js|GameScoreboard\.js/.test(u)) {
      r.respond({ status: 200, contentType: 'text/javascript', body:
        'window.AccessGuard=new Proxy({},{get:function(){return function(){return true;};}});' +
        'var __noop=function(){};var __shim=function(){return new Proxy({},{get:function(){return __noop;}});};' +
        'window.AchievementManager=__shim();window.GameTracker=__shim();window.GameScoreboard=__shim();' });
    } else r.continue();
  });
  // Install a setTimeout interceptor BEFORE any page script runs. The quiz schedules its 500ms
  // match-mismatch bounce and its 2500ms round-advance via setTimeout — both >=400ms get queued
  // instead of auto-firing, so the test drives time deterministically via window.__drain() instead
  // of waiting on wall-clock timers (fast, and immune to real-timer races between isolated tests).
  // __clearPending() discards (without running) any stale queued callback left over from a PRIOR
  // isolated test's handleAnswer() call (every handleAnswer schedules a round-advance regardless of
  // pass/fail) — without this, a later __drain() would fire that stale nextRound() too and stomp the
  // next test's freshly rendered question out of the DOM.
  await pg.evaluateOnNewDocument(() => {
    window.__pending = [];
    const realSetTimeout = window.setTimeout.bind(window);
    window.setTimeout = function (fn, delay, ...args) {
      if (delay >= 400) { window.__pending.push(fn); return -1; }
      return realSetTimeout(fn, delay, ...args);
    };
    window.__drain = function () { const p = window.__pending; window.__pending = []; p.forEach(fn => fn()); };
    window.__clearPending = function () { window.__pending = []; };
  });
  await pg.goto('http://localhost:' + port + GAME_URL, { waitUntil: 'domcontentloaded', timeout: 20000 }).catch(() => {});
  await sleep(300);

  // `game` is a plain top-level const in a classic <script> — NOT a window property (only `var`
  // would be), but reachable as a bare identifier from evaluate() since it shares the page's global
  // lexical scope. `typeof game` is a safe existence check (no ReferenceError) if it never got defined.
  const haveGame = await pg.evaluate(() => {
    if (typeof game === 'undefined') return { start: 'undefined', render: 'undefined', selOpt: 'undefined', selMatch: 'undefined' };
    return { start: typeof game.start, render: typeof game.renderQuestion, selOpt: typeof game.selectOption, selMatch: typeof game.selectMatch };
  });
  ok('game object present (as a global identifier) with expected methods (inline script ran fully)', haveGame.start === 'function' && haveGame.render === 'function' && haveGame.selOpt === 'function' && haveGame.selMatch === 'function', haveGame);

  // --- TEST A: shuffle distribution + identity survives the shuffle -------------------------------
  const shuffleReport = await pg.evaluate(() => {
    const mcQuestions = game.questions.filter(q => q.type === 'multiple');
    const TRIALS = 40;
    let totalTrials = 0, correctAtIndex0 = 0;
    let identityOk = true;
    const identityFails = [];
    for (const q of mcQuestions) {
      const answerText = q.options[q.correct];
      for (let t = 0; t < TRIALS; t++) {
        game.answered = false;
        game.currentQuestion = q;
        game.renderQuestion(q);
        const opts = game.currentOptions;
        const idx = opts.findIndex(o => o.correct);
        totalTrials++;
        if (idx === 0) correctAtIndex0++;
        if (opts[idx].text !== answerText) { identityOk = false; identityFails.push({ q: q.question, expected: answerText, got: opts[idx].text }); }
      }
    }
    return { totalTrials, correctAtIndex0, fractionAtIndex0: correctAtIndex0 / totalTrials, identityOk, identityFails: identityFails.slice(0, 5), mcCount: mcQuestions.length };
  });
  ok('MC shuffle: correct answer NOT always rendered at index 0 across trials', shuffleReport.fractionAtIndex0 < 0.6, { fraction: shuffleReport.fractionAtIndex0, trials: shuffleReport.totalTrials });
  ok('MC shuffle: correct answer DOES land at index 0 sometimes (real shuffle, not "never first")', shuffleReport.correctAtIndex0 > 0, { count: shuffleReport.correctAtIndex0 });
  ok('MC shuffle: identity (answer text) survives the shuffle for every trial, every question', shuffleReport.identityOk, shuffleReport.identityFails);

  // --- TEST B: identity-based grading, both directions --------------------------------------------
  const gradingReport = await pg.evaluate(() => {
    const q = game.questions.find(x => x.type === 'multiple' && x.correct === 1); // a correct:1 case (AAAA)
    // Wrong pick: whichever shuffled index is NOT correct.
    game.answered = false;
    game.streak = 5;
    game.currentQuestion = q;
    game.renderQuestion(q);
    const wrongIdx = game.currentOptions.findIndex(o => !o.correct);
    game.selectOption(wrongIdx);
    const afterWrong = { answered: game.answered, streak: game.streak, cls: document.querySelectorAll('.option')[wrongIdx].className };

    // Correct pick: fresh render, click whichever shuffled index IS correct.
    game.answered = false;
    game.streak = 0;
    game.renderQuestion(q);
    const correctIdx = game.currentOptions.findIndex(o => o.correct);
    game.selectOption(correctIdx);
    const afterCorrect = { answered: game.answered, streak: game.streak, cls: document.querySelectorAll('.option')[correctIdx].className };

    return { afterWrong, afterCorrect };
  });
  ok('MC wrong pick (by identity) grades WRONG (streak reset, incorrect class)', gradingReport.afterWrong.streak === 0 && /incorrect/.test(gradingReport.afterWrong.cls), gradingReport.afterWrong);
  ok('MC correct pick (by identity, regardless of shuffled position) grades CORRECT (streak up, correct class)', gradingReport.afterCorrect.streak === 1 && /\bcorrect\b/.test(gradingReport.afterCorrect.cls), gradingReport.afterCorrect);

  // --- TEST C: match step is now failable -----------------------------------------------------------
  const matchReport = await pg.evaluate(() => {
    const q = game.questions.find(x => x.type === 'match');
    const pairs = q.pairs;

    // Discard any stale queued nextRound() left over from TEST B's selectOption() calls (every
    // handleAnswer schedules one regardless of pass/fail) — otherwise the __drain() below would
    // fire those too and stomp this freshly rendered match question out of the DOM.
    window.__clearPending();

    // C1: one deliberate wrong pairing, then complete every pair correctly, then submit.
    game.answered = false;
    game.streak = 5;
    game.currentQuestion = q;
    game.renderQuestion(q);
    game.selectMatch('left', pairs[0].left);
    game.selectMatch('right', pairs[1].right); // deliberate mismatch (pairs[0].left != pairs[1].right)
    const wrongFlagAfterMismatch = game.wrongMatchOccurred;
    window.__drain(); // simulate the 500ms bounce: clears selection, does NOT clear wrongMatchOccurred
    for (const p of pairs) { game.selectMatch('left', p.left); game.selectMatch('right', p.right); }
    const matchedAll = game.matchedPairs.length === pairs.length;
    const submitEnabled = !document.getElementById('matchSubmitBtn').disabled;
    game.submitMatch();
    const c1 = { wrongFlagAfterMismatch, matchedAll, submitEnabled, answered: game.answered, streak: game.streak, feedback: document.getElementById('feedbackContainer').innerHTML };

    // submitMatch() above just queued its own nextRound(); discard it before C2 so it can't fire
    // mid-test (C2 never calls __drain(), but keep the queue clean regardless).
    window.__clearPending();

    // C2: fresh round, only ever correct pairings, no mismatch.
    game.answered = false;
    game.streak = 0;
    game.renderQuestion(q);
    for (const p of pairs) { game.selectMatch('left', p.left); game.selectMatch('right', p.right); }
    const wrongFlagClean = game.wrongMatchOccurred;
    game.submitMatch();
    const c2 = { wrongFlagClean, answered: game.answered, streak: game.streak, feedback: document.getElementById('feedbackContainer').innerHTML };

    return { c1, c2 };
  });
  ok('match: one wrong pairing sets wrongMatchOccurred', matchReport.c1.wrongFlagAfterMismatch === true, matchReport.c1);
  ok('match: player CAN still complete every pair after a mismatch (practice UX preserved)', matchReport.c1.matchedAll && matchReport.c1.submitEnabled, matchReport.c1);
  ok('match: round with an earlier wrong pairing grades INCORRECT overall (streak reset to 0, incorrect feedback)', matchReport.c1.streak === 0 && /incorrect/.test(matchReport.c1.feedback), matchReport.c1);
  ok('match: clean round (no mismatch) does not carry a stale wrongMatchOccurred flag', matchReport.c2.wrongFlagClean === false, matchReport.c2);
  ok('match: round with zero wrong pairings grades CORRECT (streak up, correct feedback)', matchReport.c2.streak === 1 && /feedback correct/.test(matchReport.c2.feedback), matchReport.c2);

  // --- TEST D: a fully knowledgeable playthrough still wins 100% -----------------------------------
  const playReport = await pg.evaluate(async () => {
    const sleepPg = (ms) => new Promise(r => setTimeout(r, ms)); // real, small-delay sleep (untouched by the >=400ms interceptor)
    // Discard C2's leftover queued nextRound() so this run's own __drain() calls only ever fire
    // rounds this test itself scheduled.
    window.__clearPending();
    game.start();
    for (let round = 0; round < 20; round++) { // safety cap well above totalRounds
      if (document.getElementById('endScreen').classList.contains('active')) break;
      const q = game.currentQuestion;
      if (!q) { window.__drain(); continue; }
      if (q.type === 'multiple') {
        const idx = game.currentOptions.findIndex(o => o.correct);
        game.selectOption(idx);
      } else if (q.type === 'order') {
        const container = document.getElementById('sortableContainer');
        const desired = q.correctOrder.map(i => q.items[i]);
        const els = Array.from(container.querySelectorAll('.sortable-item'));
        desired.forEach(text => {
          const el = els.find(e => e.querySelector('span:last-child').textContent === text && !e.__placed);
          el.__placed = true;
          container.appendChild(el); // moves the node to the end, building the desired final order
        });
        game.submitOrder();
      } else if (q.type === 'match') {
        for (const p of q.pairs) { game.selectMatch('left', p.left); game.selectMatch('right', p.right); }
        game.submitMatch();
      }
      await sleepPg(10);
      window.__drain(); // fire the queued nextRound() (or endGame() on the final round)
      await sleepPg(10);
    }
    return {
      ended: document.getElementById('endScreen').classList.contains('active'),
      correctAnswers: game.correctAnswers,
      totalRounds: game.totalRounds,
      accuracyShown: document.getElementById('accuracy').textContent,
      finalScore: document.getElementById('finalScore').textContent
    };
  });
  ok('full knowledgeable playthrough reaches the end screen', playReport.ended, playReport);
  ok('full knowledgeable playthrough: every round answered correctly (identity-graded MC + correct order + clean matches)', playReport.correctAnswers === playReport.totalRounds, playReport);
  ok('full knowledgeable playthrough: accuracy displayed as 100.0%', playReport.accuracyShown === '100.0%', playReport);

  ok('0 non-platform-shim pageErrors', errs.length === 0, errs.slice(0, 4));

  await b.close(); srv.close();
  console.log(pass ? '\n*** DNS RESOLVER RACE MECHANIC FIX OK ***' : '\n!!! DNS RESOLVER RACE FAILURES ABOVE !!!');
  process.exit(pass ? 0 : 1);
})();
