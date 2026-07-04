#!/usr/bin/env node
// git-bisect-check.js -- proves code-git-bisect.html enforces REAL binary search.
//
// Ground-truth defects this closes: (1) the game let players free-inspect ANY commit and
// win by directly marking the known-bad commit -- binary search was never enforced; (2) it
// misrepresented real `git bisect`, which auto-checks-out the MIDPOINT of the current
// [good,bad] range each step, not a player-picked commit; (3) Round 1's "breaking" diff was
// a no-op (byte-identical deletion/addition lines -- no visible bug).
//
// This harness (a) statically parses the `rounds` data literal out of the page source to
// verify Round 1's diff for real (Node-side, no browser needed), then (b) loads the page
// headless and drives it through all 8 rounds via REAL DOM clicks on the current bisect
// midpoint only, asserting at every step that exactly one commit is interactive and the
// range collapses correctly, and (c) separately proves that calling the underlying
// inspectCommit/markCommit functions directly on a NON-midpoint commit -- bypassing the
// disabled DOM buttons entirely -- is a no-op (function-level enforcement, not just a UI
// affordance a user could re-enable via devtools).
//
// Usage: node _tools/arcade-fixes/git-bisect-check.js   (exit 0 = pass)
const http = require('http'), fs = require('fs'), path = require('path');
const pup = require('puppeteer');
const APP = path.resolve(__dirname, '../../_app');
const GAME_URL = '/houses/code/games/code-git-bisect.html';
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.css': 'text/css', '.webp': 'image/webp', '.png': 'image/png', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.woff': 'font/woff' };
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
let pass = true;
const ok = (n, c, e) => { if (!c) pass = false; console.log('  ' + (c ? 'PASS' : 'FAIL') + '  ' + n + (e !== undefined ? '  ' + JSON.stringify(e).slice(0, 300) : '')); };

// ---- (d) Round 1 diff must contain a real, non-identical add/delete pair. Parse the
// `rounds` data literal straight out of the HTML source -- no browser needed for this part.
const html = fs.readFileSync(path.join(APP, GAME_URL.slice(1)), 'utf8');
const roundsStart = html.indexOf('const rounds = [');
const marker = '\n        ];';
const roundsEnd = html.indexOf(marker, roundsStart);
if (roundsStart === -1 || roundsEnd === -1) { console.log('FAIL  could not locate `rounds` array in source'); process.exit(1); }
const closeIdx = roundsEnd + marker.indexOf(']') + 1;
const arrText = html.slice(roundsStart + 'const rounds = '.length, closeIdx);
const rounds = new Function('return ' + arrText)();

ok('rounds array parsed (8 rounds found)', Array.isArray(rounds) && rounds.length === 8, rounds.length);

const r1 = rounds[0].breakingDiff.changes;
const del = r1.find(c => c.type === 'deletion');
const add = r1.find(c => c.type === 'addition');
ok('Round 1 breakingDiff has a deletion line', !!del, del);
ok('Round 1 breakingDiff has an addition line', !!add, add);
ok('Round 1 deletion/addition are NOT byte-identical (real bug, not a no-op diff)',
  !!del && !!add && del.line.replace(/^-/, '') !== add.line.replace(/^\+/, ''),
  { del: del && del.line, add: add && add.line });

// Static server rooted at _app so the game + its component scripts load same-origin.
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
  pg.on('pageerror', e => errs.push(String(e.message).slice(0, 200)));
  await pg.setRequestInterception(true);
  // Neutralize platform shell dependencies (auth gate, achievements, tracker, scoreboard) so
  // the page renders instead of redirecting -- we are testing the bisect game logic itself.
  pg.on('request', r => {
    const u = r.url();
    if (/AccessGuard\.js|AchievementManager\.js|GameTracker\.js|GameScoreboard\.js/.test(u)) {
      r.respond({
        status: 200, contentType: 'text/javascript', body:
          'var __noop=function(){};' +
          'var __shim=function(){return new Proxy({},{get:function(){return __noop;},apply:function(){return undefined;}});};' +
          'window.AccessGuard=__shim();window.AchievementManager=__shim();window.GameTracker=__shim();window.GameScoreboard=__shim();'
      });
    } else r.continue();
  });
  await pg.goto('http://localhost:' + port + GAME_URL, { waitUntil: 'domcontentloaded', timeout: 20000 }).catch(() => {});
  await sleep(300);

  ok('start screen rendered (AccessGuard stub did not redirect)',
    await pg.evaluate(() => !!document.getElementById('startScreen') && getComputedStyle(document.getElementById('startScreen')).display !== 'none'));

  await pg.click('.start-btn');
  await sleep(200);
  ok('game screen visible after Start Debugging',
    await pg.evaluate(() => document.getElementById('gameScreen').style.display === 'block'));

  // ---- helpers that read/drive the live DOM ----
  const readCommits = () => pg.evaluate(() => [...document.querySelectorAll('.commit')].map(el => {
    const insp = el.querySelector('.btn-inspect');
    const good = el.querySelector('.btn-good');
    const bad = el.querySelector('.btn-bad');
    return {
      idx: parseInt(el.id.replace('commit-', ''), 10),
      classes: [...el.classList],
      inspectDisabled: insp ? insp.disabled : null,
      goodDisabled: good ? good.disabled : null,
      badDisabled: bad ? bad.disabled : null
    };
  }));
  const remainingText = () => pg.evaluate(() => document.getElementById('commitsRemaining').textContent);
  const roundResultVisible = () => pg.evaluate(() => document.getElementById('roundResult').style.display === 'block');
  const revealedBreakingIdx = () => pg.evaluate(() => {
    const el = document.querySelector('.commit.revealed-breaking');
    return el ? parseInt(el.id.replace('commit-', ''), 10) : null;
  });

  let cheatAttempts = 0, cheatBlocked = 0;

  for (let roundIdx = 0; roundIdx < rounds.length; roundIdx++) {
    const truth = rounds[roundIdx];
    ok(`round ${roundIdx + 1} header shows "Round ${roundIdx + 1} / 8"`,
      (await pg.evaluate(() => document.getElementById('roundInfo').textContent)) === `Round ${roundIdx + 1} / 8`);

    let steps = 0;
    while (steps < 10) {
      steps++;
      let commits = await readCommits();
      let currents = commits.filter(c => c.classes.includes('current-target'));

      if (currents.length === 0) {
        if (await roundResultVisible()) break;
        await sleep(150);
        commits = await readCommits();
        currents = commits.filter(c => c.classes.includes('current-target'));
        if (currents.length === 0) {
          if (await roundResultVisible()) break;
          ok(`round ${roundIdx + 1} step ${steps}: a midpoint is presented or round resolved`, false, { commits: commits.length });
          break;
        }
      }

      // (a) exactly ONE commit is the live bisect target; every other commit's
      // Inspect/Mark buttons must be disabled -- proves interaction is restricted to the
      // current midpoint, not free-pick of any commit in the range.
      const onlyOneCurrent = currents.length === 1;
      const others = commits.filter(c => !c.classes.includes('current-target'));
      const othersAllDisabled = others.every(c => c.inspectDisabled === true && c.goodDisabled === true && c.badDisabled === true);
      ok(`round ${roundIdx + 1} step ${steps}: exactly one midpoint presented, all other commits locked`,
        onlyOneCurrent && othersAllDisabled,
        { onlyOneCurrent, currents: currents.map(c => c.idx), unlockedOthers: others.filter(c => !(c.inspectDisabled === true && c.goodDisabled === true && c.badDisabled === true)).map(c => c.idx) });

      const curIdx = currents[0].idx;

      // ---- cheat attempt #1: call inspectCommit/markCommit directly on a DIFFERENT in-range
      // commit, bypassing the disabled DOM buttons entirely. Must be a total no-op.
      const other = others.find(c => !c.classes.includes('eliminated'));
      if (other) {
        cheatAttempts++;
        const before = await pg.evaluate(() => ({
          modal: document.getElementById('diffModal').style.display,
          remaining: document.getElementById('commitsRemaining').textContent,
          classes: [...document.querySelectorAll('.commit')].map(el => el.className)
        }));
        await pg.evaluate((idx) => {
          window.inspectCommit(idx);
          window.markCommit(idx, 'bad');
          window.markCommit(idx, 'good');
        }, other.idx);
        await sleep(80);
        const after = await pg.evaluate(() => ({
          modal: document.getElementById('diffModal').style.display,
          remaining: document.getElementById('commitsRemaining').textContent,
          classes: [...document.querySelectorAll('.commit')].map(el => el.className)
        }));
        const noChange = before.remaining === after.remaining && before.modal === after.modal
          && JSON.stringify(before.classes) === JSON.stringify(after.classes);
        if (noChange) cheatBlocked++;
        ok(`round ${roundIdx + 1} step ${steps}: direct inspect/mark on non-midpoint commit #${other.idx} is a no-op`, noChange, { before, after });
      }

      // ---- cheat attempt #2: mark the CURRENT midpoint before testing it. Must be rejected.
      {
        cheatAttempts++;
        const before = await pg.evaluate(() => document.getElementById('commitsRemaining').textContent);
        await pg.evaluate((idx) => { window.markCommit(idx, 'bad'); }, curIdx);
        await sleep(50);
        const after = await pg.evaluate(() => document.getElementById('commitsRemaining').textContent);
        if (before === after) cheatBlocked++;
        ok(`round ${roundIdx + 1} step ${steps}: marking midpoint #${curIdx} before testing it is rejected`, before === after, { before, after });
      }

      // ---- legitimate move: click Inspect on the midpoint (real DOM click).
      const remBefore = parseInt(await remainingText(), 10);
      await pg.click(`#commit-${curIdx} .btn-inspect`);
      await sleep(100);
      const diffText = await pg.evaluate(() => document.getElementById('diffContent').textContent);
      const isBad = /BUG PRESENT/.test(diffText);
      const isGood = /BUG ABSENT/.test(diffText);
      ok(`round ${roundIdx + 1} step ${steps}: inspecting midpoint #${curIdx} reveals a clear verdict`, isBad || isGood, diffText.slice(0, 60));
      const trulyBad = curIdx >= truth.breakingCommitIndex;
      ok(`round ${roundIdx + 1} step ${steps}: revealed verdict matches ground truth for #${curIdx}`, isBad === trulyBad);

      await pg.evaluate(() => { document.getElementById('diffModal').style.display = 'none'; });
      await pg.click(`#commit-${curIdx} .btn-${isBad ? 'bad' : 'good'}`);
      await sleep(150);

      const remAfter = parseInt(await remainingText(), 10);
      // (b) the candidate range must strictly collapse after a correct mark.
      ok(`round ${roundIdx + 1} step ${steps}: candidate range collapsed (${remBefore} -> ${remAfter})`, remAfter < remBefore, { remBefore, remAfter });

      if (remAfter === 1) {
        await sleep(600); // completeRound() fires 400ms after convergence
        break;
      }
    }

    ok(`round ${roundIdx + 1}: resolved with the round-result panel visible`, await roundResultVisible());
    const revealed = await revealedBreakingIdx();
    // (c) the game must identify the TRUE culprit, reached only via the forced bisection above.
    ok(`round ${roundIdx + 1}: identified commit #${truth.breakingCommitIndex} as the culprit (got #${revealed})`, revealed === truth.breakingCommitIndex);

    const insp = parseInt(await pg.evaluate(() => document.getElementById('resultInspections').textContent), 10);
    const opt = parseInt(await pg.evaluate(() => document.getElementById('resultOptimal').textContent), 10);
    // ceil(log2(N)) is the WORST-CASE step count for binary search; forced correct bisection
    // must never exceed it (it can finish sooner when the culprit's position lets the final
    // 2-candidate range resolve by deduction without an extra inspection).
    ok(`round ${roundIdx + 1}: inspections used (${insp}) never exceed optimal (${opt}) -- forced bisection is never worse than optimal`, insp <= opt);

    await pg.click('.next-round-btn');
    await sleep(250);
    if (roundIdx === rounds.length - 1) {
      ok('all 8 rounds complete: end screen shown', await pg.evaluate(() => document.getElementById('endScreen').style.display === 'block'));
    }
  }

  ok('cheat attempts were all blocked (no free-inspect/mark exploit anywhere in the run)',
    cheatAttempts > 0 && cheatBlocked === cheatAttempts, { cheatAttempts, cheatBlocked });
  ok('0 pageErrors', errs.length === 0, errs.slice(0, 5));

  await b.close(); srv.close();
  console.log(pass ? '\n*** GIT BISECT ENFORCEMENT OK ***' : '\n!!! GIT BISECT FAILURES ABOVE !!!');
  process.exit(pass ? 0 : 1);
})();
