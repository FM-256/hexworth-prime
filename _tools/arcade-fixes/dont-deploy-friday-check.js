#!/usr/bin/env node
// dont-deploy-friday-check.js -- proves the two fixes to code-dont-deploy-on-friday.html hold.
//
// Ground-truth defects this closes:
// (1) FAKE VERB -- the game taught `kubectl rollback`, which is not a real kubectl subcommand,
//     as the winning rollback move (and printed it in the help menu). Real kubectl uses
//     `kubectl rollout undo`. This harness statically asserts the fake string is gone from the
//     file entirely, then drives the REAL command through the input field and asserts it wins.
// (2) UNREACHABLE WIN PATH -- `hotfixPushed` gated a second win condition
//     ((rolledBack || hotfixPushed) && healthCheckPassed) but nothing in the game ever set it,
//     so the git-revert/rebuild/deploy path could never win. A `git push` command (after
//     `git revert HEAD` + a build) now sets it. This harness plays that exact sequence through
//     the real input field on a fresh game (after restart) and asserts it wins WITHOUT ever
//     touching the rollback command, proving hotfixPushed alone carries the victory.
//
// Usage: node _tools/arcade-fixes/dont-deploy-friday-check.js   (exit 0 = pass)
const http = require('http'), fs = require('fs'), path = require('path');
const pup = require('puppeteer');
const APP = path.resolve(__dirname, '../../_app');
const GAME_URL = '/houses/code/games/code-dont-deploy-on-friday.html';
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.css': 'text/css', '.webp': 'image/webp', '.png': 'image/png', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.woff': 'font/woff' };
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
let pass = true;
const ok = (n, c, e) => { if (!c) pass = false; console.log('  ' + (c ? 'PASS' : 'FAIL') + '  ' + n + (e !== undefined ? '  ' + JSON.stringify(e).slice(0, 300) : '')); };

// ---- static source checks (no browser needed) ----
const html = fs.readFileSync(path.join(APP, GAME_URL.slice(1)), 'utf8');
ok('fake verb "kubectl rollback" does NOT appear anywhere in the file', !/kubectl rollback/i.test(html));
ok('real verb "kubectl rollout undo" DOES appear in the file', /kubectl rollout undo/.test(html));

// Static server rooted at _app so the game + its component scripts load same-origin.
const srv = http.createServer((q, s) => {
  let p = decodeURIComponent(q.url.split('?')[0]); let fp = path.join(APP, p);
  if (fs.existsSync(fp) && fs.statSync(fp).isFile()) { s.writeHead(200, { 'Content-Type': MIME[path.extname(fp)] || 'application/octet-stream' }); fs.createReadStream(fp).pipe(s); }
  else { s.writeHead(404); s.end('nf'); }
});

// Types text into the #input field and presses Enter, same as a real player.
async function runCommand(pg, text) {
  await pg.click('#input');
  await pg.type('#input', text);
  await pg.keyboard.press('Enter');
  await sleep(120);
}

async function outputText(pg) {
  return pg.evaluate(() => document.getElementById('output').innerText);
}

(async () => {
  await new Promise(r => srv.listen(0, r)); const port = srv.address().port;
  const b = await pup.launch({ headless: 'new', args: ['--no-sandbox'] });
  const pg = await b.newPage();
  const errs = [];
  pg.on('pageerror', e => errs.push(String(e.message).slice(0, 200)));
  await pg.setRequestInterception(true);
  // Neutralize platform shell dependencies (auth gate, achievements, tracker, scoreboard) so the
  // page renders and plays instead of redirecting -- we are testing the game logic itself.
  pg.on('request', r => {
    const u = r.url();
    if (/AccessGuard\.js|AchievementManager\.js|ModuleProgress\.js|GameTracker\.js|GameScoreboard\.js|AchievementSystem\.js/.test(u)) {
      r.respond({
        status: 200, contentType: 'text/javascript', body:
          'var __noop=function(){};' +
          'var __shim=function(){return new Proxy(function(){},{get:function(){return __noop;},apply:function(){return undefined;}});};' +
          'window.AccessGuard=__shim();window.AchievementManager=__shim();window.ModuleProgress=__shim();' +
          'window.GameTracker=__shim();window.GameScoreboard=__shim();window.AchievementSystem=__shim();'
      });
    } else r.continue();
  });
  await pg.goto('http://localhost:' + port + GAME_URL, { waitUntil: 'domcontentloaded', timeout: 20000 }).catch(() => {});
  await sleep(400);

  ok('title screen rendered (AccessGuard stub did not redirect)',
    (await outputText(pg)).includes("DON'T DEPLOY ON FRIDAY"));

  // ---- Path A: rollback via the REAL kubectl command ----
  await runCommand(pg, 'start');
  ok('path A: game started (playing phase reached)', (await outputText(pg)).includes('PRODUCTION DEPLOYMENT IN PROGRESS'));

  await runCommand(pg, 'kubectl rollout undo');
  let out = await outputText(pg);
  ok('path A: "kubectl rollout undo" is accepted and performs the rollback', out.includes('ROLLBACK SUCCESSFUL'));
  ok('path A: rollback not yet a win (health not checked)', !out.includes('CRISIS AVERTED'));

  await runCommand(pg, 'curl localhost:3000/health');
  out = await outputText(pg);
  ok('path A: health check passes after rollback', out.includes('Health check passed'));
  ok('path A: game WON via rollback path', out.includes('CRISIS AVERTED'));

  // ---- reset for Path B ----
  await runCommand(pg, 'restart');
  ok('restart returns to title screen', (await outputText(pg)).includes("Type 'start' to begin"));

  // ---- Path B: hotfix via git revert + rebuild + push (never touches rollback) ----
  await runCommand(pg, 'start');
  ok('path B: game started (playing phase reached)', (await outputText(pg)).includes('PRODUCTION DEPLOYMENT IN PROGRESS'));

  await runCommand(pg, 'git push');
  out = await outputText(pg);
  ok('path B: pushing before revert is rejected (guards the flag)', out.includes('Nothing to push'));

  await runCommand(pg, 'git revert head');
  out = await outputText(pg);
  ok('path B: git revert HEAD reverts the bad commit', out.includes("Revert 'Quick fix"));

  await runCommand(pg, 'git push');
  out = await outputText(pg);
  ok('path B: pushing before build is rejected (guards the flag)', out.includes('never rebuilt'));

  await runCommand(pg, 'npm run build');
  out = await outputText(pg);
  ok('path B: build completes on reverted code', out.includes('Build completed successfully'));

  await runCommand(pg, 'git push');
  out = await outputText(pg);
  ok('path B: "git push" deploys the hotfix and sets hotfixPushed', out.includes('HOTFIX DEPLOYED'));
  ok('path B: rollback command was NEVER used this run', !out.includes('ROLLBACK SUCCESSFUL'));

  await runCommand(pg, 'curl localhost:3000/health');
  out = await outputText(pg);
  ok('path B: health check passes after hotfix deploy', out.includes('Health check passed'));
  ok('path B: game WON via the hotfix path alone (rollback never used)',
    out.includes('CRISIS AVERTED') && !out.includes('ROLLBACK SUCCESSFUL'));

  ok('0 pageErrors', errs.length === 0, errs.slice(0, 5));

  await b.close(); srv.close();
  console.log(pass ? '\n*** DONT DEPLOY ON FRIDAY: BOTH WIN PATHS OK, FAKE VERB GONE ***' : '\n!!! FAILURES ABOVE !!!');
  process.exit(pass ? 0 : 1);
})();
