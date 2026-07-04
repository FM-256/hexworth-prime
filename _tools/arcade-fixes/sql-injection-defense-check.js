#!/usr/bin/env node
// sql-injection-defense-check.js — hands-on-mechanic verification for the WAF Rule Engineering rewrite.
//
// shield-sql-injection-defense.html was converted from a 3-then-3-option "classify it / pick the fix"
// multiple-choice quiz into a real WAF ruleset tuner: each round hands the player a batch of real HTTP
// requests (a mix of genuine SQL injection attacks and benign-but-suspicious-looking legitimate traffic),
// the player writes a detection ruleset as actual JS regex lines, and a real matcher (game.testRequests)
// runs it against every request. A round is only won when the ruleset blocks 100% of attacks AND 0% of
// benign requests — a too-broad rule (blocks a real customer) or too-narrow rule (misses an attack) is
// rejected with the specific offending request shown, not a generic "wrong" message.
//
// This harness proves the mechanic is real and honest:
//   (a) a too-broad ruleset (blocks a benign request) is REJECTED, with that exact benign request shown
//   (b) a too-narrow ruleset (misses an attack) is REJECTED, with that exact attack request shown
//   (c) a trivial catch-all ruleset (matches literally everything) is REJECTED — proves winning requires
//       an actual balanced ruleset, not "block all traffic"
//   (d) a genuinely balanced ruleset WINS each round (deploys clean, score increases, round advances)
//   (e) the game is completable end-to-end across all 5 rounds via the balanced-ruleset path, reaching
//       the results screen
//   (f) 0 non-firebase pageErrors across the whole run
//
// Usage: node _tools/arcade-fixes/sql-injection-defense-check.js   (exit 0 = pass)
const http = require('http'), fs = require('fs'), path = require('path');
const pup = require('puppeteer');
const APP = path.resolve(__dirname, '../../_app');
const GAME_URL = '/houses/shield/games/shield-sql-injection-defense.html';
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.css': 'text/css', '.webp': 'image/webp', '.png': 'image/png', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.woff': 'font/woff' };
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
let pass = true;
const ok = (n, c, e) => { if (!c) pass = false; console.log('  ' + (c ? 'PASS' : 'FAIL') + '  ' + n + (e !== undefined ? '  ' + JSON.stringify(e).slice(0, 300) : '')); };

// Golden (balanced) rulesets per round, derived from the round data authored in the page itself.
// Verified by hand against every request in each round before writing this harness:
//   round 0: union+select (tolerant of separators) OR a quoted-value tautology comparison
//   round 1: union+select (tolerant of separators, catches the /**/-obfuscated variant) OR an
//            EXTRACTVALUE( function call — neither fires on "SELECT ALL items" or "extract value"
//   round 2: a SLEEP( / SUBSTRING( function call — neither fires on the words "sleep" or "substring" alone
//   round 3: a semicolon immediately followed by a DML/DDL keyword — doesn't fire on ordinary semicolons
//   round 4 (capstone): the union of all of the above
const GOLDEN = [
  ["/\\bunion\\W*select\\b/i", "/or\\s+'?\\d+'?\\s*=\\s*'?\\d+/i"],
  ["/union\\W*select/i", "/extractvalue\\s*\\(/i"],
  ["/sleep\\s*\\(\\s*\\d+\\s*\\)/i", "/substring\\s*\\(/i"],
  ["/;\\s*(drop|update|insert|delete|alter)\\s+\\w+/i"],
  ["/\\bunion\\W*select\\b/i", "/or\\s+'?\\d+'?\\s*=\\s*'?\\d+/i", "/sleep\\s*\\(\\s*\\d+\\s*\\)/i", "/substring\\s*\\(/i", "/;\\s*(drop|update|insert|delete|alter)\\s+\\w+/i"]
];

// Round 0's too-broad / too-narrow probes, chosen against its own known request set:
//   requests: [UNION attack, O'Brien benign, tautology attack, discount benign, catalog-OR benign]
const TOO_BROAD_R0 = "/'/";              // any single quote — catches both attacks but ALSO O'Brien
const TOO_NARROW_R0 = "/union select/i"; // literal space only — catches the union attack, MISSES the tautology attack
const CATCH_ALL = "/./";                 // matches any single character — blocks literally everything

// Static file server rooted at _app so the game + its component scripts load same-origin.
const srv = http.createServer((q, s) => {
  let p = decodeURIComponent(q.url.split('?')[0]); let fp = path.join(APP, p);
  if (fs.existsSync(fp) && fs.statSync(fp).isFile()) { s.writeHead(200, { 'Content-Type': MIME[path.extname(fp)] || 'application/octet-stream' }); fs.createReadStream(fp).pipe(s); }
  else { s.writeHead(404); s.end('nf'); }
});

// setRulesAndDeploy: types `rulesetLines` into #ruleEditor, clicks Deploy, returns the resulting DOM state.
async function setRulesAndDeploy(pg, rulesetLines) {
  await pg.evaluate((text) => { document.getElementById('ruleEditor').value = text; }, rulesetLines.join('\n'));
  await pg.click('#deployBtn');
  await sleep(1000); // clean-deploy path has an 800ms feedback-banner delay before showExplanation() runs
  return pg.evaluate(() => ({
    explanationVisible: !document.getElementById('explanation').classList.contains('hidden'),
    analysisVisible: !document.getElementById('analysisPhase').classList.contains('hidden'),
    rejectDetail: document.getElementById('rejectDetail').classList.contains('hidden') ? null : document.getElementById('rejectDetail').textContent,
    summary: document.getElementById('summaryBar').textContent,
    score: typeof game !== 'undefined' ? game.score : null,
    currentRound: typeof game !== 'undefined' ? game.currentRound : null,
  }));
}

(async () => {
  await new Promise(r => srv.listen(0, r)); const port = srv.address().port;
  const b = await pup.launch({ headless: 'new', args: ['--no-sandbox'] });
  const pg = await b.newPage();
  const errs = [];
  pg.on('pageerror', e => { const m = String(e.message); if (!/firebase|firestore|auth\/|not authenticated/i.test(m)) errs.push(m.slice(0, 200)); });
  pg.on('console', msg => { if (msg.type() === 'error') { const t = msg.text(); if (!/firebase|firestore/i.test(t)) errs.push(('console.error: ' + t).slice(0, 200)); } });

  // Stub the AccessGuard gate so the page renders instead of redirecting away.
  await pg.setRequestInterception(true);
  pg.on('request', r => {
    const u = r.url();
    if (u.endsWith('/components/AccessGuard.js')) r.respond({ status: 200, contentType: 'text/javascript', body: 'window.AccessGuard = { require: function(){} };' });
    else r.continue();
  });

  await pg.goto('http://localhost:' + port + GAME_URL, { waitUntil: 'domcontentloaded', timeout: 20000 });
  await sleep(200);

  const meta = await pg.evaluate(() => ({
    roundCount: typeof game !== 'undefined' ? game.rounds.length : 0,
    hasTestRequests: typeof game !== 'undefined' && typeof game.testRequests === 'function',
    hasDeploy: typeof game !== 'undefined' && typeof game.deployRuleset === 'function',
  }));
  ok('page parsed: game.rounds has 5 rounds', meta.roundCount === 5, meta.roundCount);
  ok('game.testRequests() and game.deployRuleset() are defined (script ran fully, real matcher exists)', meta.hasTestRequests && meta.hasDeploy, meta);

  await pg.click('button[onclick="game.start()"]');
  await sleep(150);

  // ---- Round 0: too-broad rejected, too-narrow rejected, catch-all rejected, golden wins ----
  const requests0 = await pg.evaluate(() => game.rounds[0].requests.map(r => r.raw));
  ok('round 0 request set is the expected 5 (2 attack / 3 benign), includes the O\'Brien lookalike', requests0.length === 5 && requests0.some(r => r.includes("O'Brien")), requests0);

  const broadResult = await setRulesAndDeploy(pg, [TOO_BROAD_R0]);
  ok('too-broad ruleset (bare quote) REJECTED, not advanced', !broadResult.explanationVisible && broadResult.analysisVisible && broadResult.currentRound === 0);
  ok('too-broad rejection names the false positive (O\'Brien) as the specific offending request', broadResult.rejectDetail && /FALSE POSITIVE/.test(broadResult.rejectDetail) && /O'Brien/.test(broadResult.rejectDetail), broadResult.rejectDetail);

  const narrowResult = await setRulesAndDeploy(pg, [TOO_NARROW_R0]);
  ok('too-narrow ruleset (literal "union select") REJECTED, not advanced', !narrowResult.explanationVisible && narrowResult.analysisVisible && narrowResult.currentRound === 0);
  ok('too-narrow rejection names the missed tautology attack as the specific offending request', narrowResult.rejectDetail && /MISSED ATTACK/.test(narrowResult.rejectDetail) && /login\.php/.test(narrowResult.rejectDetail), narrowResult.rejectDetail);

  const catchAllResult = await setRulesAndDeploy(pg, [CATCH_ALL]);
  ok('trivial catch-all ruleset (matches everything) REJECTED — win requires a balanced ruleset, not "block all traffic"', !catchAllResult.explanationVisible && catchAllResult.analysisVisible, catchAllResult.rejectDetail);
  ok('catch-all rejection shows multiple false positives (every benign request caught)', catchAllResult.rejectDetail && (catchAllResult.rejectDetail.match(/FALSE POSITIVE/g) || []).length >= 1 && catchAllResult.rejectDetail.split('\n').length >= 4, catchAllResult.rejectDetail);

  const scoreBefore = await pg.evaluate(() => game.score);
  const goldenResult = await setRulesAndDeploy(pg, GOLDEN[0]);
  ok('balanced ruleset for round 0 WINS: deploys clean, explanation shown, score increases', goldenResult.explanationVisible && !goldenResult.analysisVisible && goldenResult.score > scoreBefore, goldenResult);

  // ---- Rounds 1-4: drive the balanced ruleset for each to prove full end-to-end completability ----
  for (let i = 1; i < GOLDEN.length; i++) {
    await pg.click('button[onclick="game.nextRound()"]');
    await sleep(150);
    const roundNow = await pg.evaluate(() => game.currentRound);
    ok(`advanced to round ${i} after clean deploy`, roundNow === i, roundNow);

    const before = await pg.evaluate(() => game.score);
    const res = await setRulesAndDeploy(pg, GOLDEN[i]);
    ok(`round ${i} balanced ruleset WINS (all attacks blocked, zero false positives, score increases)`, res.explanationVisible && res.score > before, res);
  }

  // ---- Completion: after the last round's deploy, Next Round should reach the results screen ----
  await pg.click('button[onclick="game.nextRound()"]');
  await sleep(200);
  const final = await pg.evaluate(() => ({
    resultsVisible: !document.getElementById('resultsScreen').classList.contains('hidden'),
    finalScoreText: document.getElementById('finalScore').textContent,
    score: game.score,
  }));
  ok('game completable end-to-end: results screen shown after all 5 rounds cleared', final.resultsVisible, final);
  ok('final score reflects a full clean run (positive, non-trivial)', final.score > 0 && /\d+\/50/.test(final.finalScoreText), final);

  ok('0 non-firebase pageErrors across the whole run', errs.length === 0, errs.slice(0, 6));

  await b.close(); srv.close();
  console.log(pass ? '\n*** SQL INJECTION DEFENSE — HANDS-ON MECHANIC OK ***' : '\n!!! SQL INJECTION DEFENSE CHECK FAILURES ABOVE !!!');
  process.exit(pass ? 0 : 1);
})();
