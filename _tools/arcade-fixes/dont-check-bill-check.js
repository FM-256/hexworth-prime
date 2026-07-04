#!/usr/bin/env node
// dont-check-bill-check.js — regression + winnability gate for the cloud cost-control incident sim
// (cloud-dont-check-the-bill.html). Two fixes are under test:
//
//   (1) COSMETIC: the 'bitcoin_check' achievement used a raw '₿' (bitcoin sign) glyph as its
//       icon. Replaced with the same <img src=".../icon-money.webp"> pattern every other achievement
//       in this file uses. This harness asserts the raw glyph is gone from the page source and that
//       the achievement gallery (innerHTML context) renders an <img> for it instead of the bare glyph.
//
//   (2) SKILL_EXERCISED: three commands (fix auto-scaling, delete the Lambda, fix IAM) used to accept
//       a bare canned verb ("fix autoscaling", "kill lambda", "revoke intern") with no real parameter.
//       They now require the actual resource name stated in the scenario text (intern-test-asg,
//       process-data, mchen respectively) — a bare verb now returns a "which one?" error instead of
//       silently succeeding. This harness proves: (a) the bare/old form no longer flips game state,
//       (b) the new parameterized form does, and (c) a full playthrough using ONLY the new
//       parameterized commands (plus the unchanged stop-instances) still reaches the WIN screen
//       ("CRISIS CONTAINED") before time runs out — i.e. the game remains completable.
//
// Usage: node _tools/arcade-fixes/dont-check-bill-check.js   (exit 0 = pass)
const http = require('http'), fs = require('fs'), path = require('path');
const pup = require('puppeteer');
const APP = path.resolve(__dirname, '../../_app');
const GAME_URL = '/houses/cloud/games/cloud-dont-check-the-bill.html';
const GAME_PATH = path.join(APP, 'houses/cloud/games/cloud-dont-check-the-bill.html');
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.css': 'text/css', '.webp': 'image/webp', '.png': 'image/png', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.woff': 'font/woff' };
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
let pass = true;
const ok = (n, c, e) => { if (!c) pass = false; console.log('  ' + (c ? 'PASS' : 'FAIL') + '  ' + n + (e !== undefined ? '  ' + JSON.stringify(e).slice(0, 300) : '')); };

// Static file server rooted at _app so the game + its component scripts load same-origin.
const srv = http.createServer((q, s) => {
  let p = decodeURIComponent(q.url.split('?')[0]); let fp = path.join(APP, p);
  if (fs.existsSync(fp) && fs.statSync(fp).isFile()) { s.writeHead(200, { 'Content-Type': MIME[path.extname(fp)] || 'application/octet-stream' }); fs.createReadStream(fp).pipe(s); }
  else { s.writeHead(404); s.end('nf'); }
});

// runCmd: types `text` into #input and presses Enter, exactly like a player would. Returns the
// current #output text (for assertion) after a short settle delay.
async function runCmd(pg, text) {
  await pg.evaluate((t) => {
    const el = document.getElementById('input');
    el.value = t;
    el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
  }, text);
  await sleep(60);
  return pg.evaluate(() => document.getElementById('output').textContent);
}

(async () => {
  // ---- (0) static source check: raw bitcoin glyph must be gone from the file entirely ----
  const src = fs.readFileSync(GAME_PATH, 'utf8');
  ok('raw U+20BF bitcoin glyph is NOT present anywhere in the file source', !src.includes('₿'));
  ok('bitcoin_check achievement now uses an <img icon-money.webp> icon (same pattern as siblings)', /bitcoin_check:\s*\{[^}]*icon-money\.webp/.test(src));
  // "aws iam remove-policy" is not a real AWS CLI subcommand (no such subcommand exists under
  // `aws iam`). The real fix for an AWS-managed policy like AdministratorAccess is
  // detach-user-policy (delete-user-policy is for inline policies only, not applicable here).
  ok('fake command "remove-policy" does NOT appear anywhere in the file (not a real AWS CLI subcommand)', !src.includes('remove-policy'));

  // ---- (0b) STATIC ALLOWLIST GATE: every "aws <service> <subcommand>" pattern displayed anywhere
  // in the file (help text, error hints, inline instructions) must be a real AWS CLI subcommand.
  // This is the hardening Chris required after finding "aws ce get-cost" (fake — no bare get-cost
  // subcommand exists under `aws ce`; the real one is get-cost-and-usage) DISPLAYED as correct
  // syntax alongside the earlier "aws iam remove-policy" fake. Both were real bugs in a *teaching*
  // sim, so this check exists to make the whole class of "displays a command that doesn't exist"
  // regression impossible to reintroduce silently. Every entry below was independently confirmed
  // against the real AWS CLI reference (verified by Chris, cross-checked here).
  const REAL_AWS_COMMANDS = new Set([
    'aws autoscaling update-auto-scaling-group',
    'aws budgets create-budget',
    'aws ce get-cost-and-usage',
    'aws cloudtrail lookup-events',
    'aws cloudwatch put-metric-alarm',
    'aws ec2 describe-instances',
    'aws ec2 stop-instances',
    'aws ec2 terminate-instances',
    'aws iam detach-user-policy',
    'aws iam list-users',
    'aws lambda delete-function',
    'aws lambda list-functions',
    'aws s3 ls',
    'aws s3api put-public-access-block',
    'aws support create-case',
  ]);
  // Match "aws <service-token> <subcommand-token>" wherever it's displayed as literal text in the
  // file (help/hint strings). Tokens are lowercase-hyphenated CLI words; this deliberately does NOT
  // match the flag portion (--foo bar) that follows, only the service+subcommand pair.
  const foundCmds = new Set((src.match(/aws [a-z0-9]+(?:-[a-z0-9]+)* [a-z][a-z0-9]*(?:-[a-z0-9]+)*/g) || []));
  const unknownCmds = [...foundCmds].filter(c => !REAL_AWS_COMMANDS.has(c));
  ok('every displayed "aws <service> <subcommand>" is in the verified-real allowlist (no fake CLI verbs)', unknownCmds.length === 0, unknownCmds);
  ok('allowlist scan actually found commands to check (not a vacuous pass)', foundCmds.size >= REAL_AWS_COMMANDS.size, { found: foundCmds.size, allowlist: REAL_AWS_COMMANDS.size });

  await new Promise(r => srv.listen(0, r)); const port = srv.address().port;
  const b = await pup.launch({ headless: 'new', args: ['--no-sandbox'] });
  const pg = await b.newPage();
  const errs = [];
  pg.on('pageerror', e => { const m = String(e.message); if (!/firebase|firestore|auth\/|not authenticated/i.test(m)) errs.push(m.slice(0, 200)); });
  pg.on('console', msg => { if (msg.type() === 'error') { const t = msg.text(); if (!/firebase|firestore/i.test(t)) errs.push(('console.error: ' + t).slice(0, 200)); } });

  // Stub AccessGuard so AccessGuard.require('sorted') doesn't redirect us away before the game
  // renders — same pattern as iam-debugger-check.js / cockpit-render-check.js.
  await pg.setRequestInterception(true);
  pg.on('request', r => {
    const u = r.url();
    if (u.endsWith('/components/AccessGuard.js')) r.respond({ status: 200, contentType: 'text/javascript', body: 'window.AccessGuard = { require: function(){ return true; } };' });
    else r.continue();
  });

  await pg.goto('http://localhost:' + port + GAME_URL, { waitUntil: 'domcontentloaded', timeout: 20000 });
  await sleep(300);

  // ---- (1) parse confirmation: the inline script's IIFE ran fully (no broken template literal) ----
  const parsed = await pg.evaluate(() => ({
    hasInit: typeof Game !== 'undefined' && typeof Game.init === 'function',
    hasGallery: typeof Game !== 'undefined' && typeof Game.showGallery === 'function',
  }));
  ok('inline script parsed: window.Game exposes init/showGallery (IIFE ran fully)', parsed.hasInit && parsed.hasGallery, parsed);

  // Boot the game (DOMContentLoaded already fired Game.init via the page's own listener since we
  // used waitUntil: domcontentloaded after the fact — call init defensively in case of a race).
  await pg.evaluate(() => { if (document.getElementById('output').children.length === 0) Game.init(); });
  await sleep(200);

  // ---- (2) achievement gallery renders an <img>, not the bare glyph, for bitcoin_check ----
  // Force-unlock bitcoin_check via the same localStorage key the game itself writes, then open
  // the gallery through the real Game.showGallery() path (innerHTML render).
  await pg.evaluate(() => {
    localStorage.setItem('hexworth_dontcheckbill_achievements', JSON.stringify({ bitcoin_check: { unlockedAt: Date.now() } }));
    Game.showGallery();
  });
  await sleep(100);
  const gallery = await pg.evaluate(() => document.getElementById('gallery').innerHTML);
  ok('gallery HTML contains NO raw bitcoin glyph', !gallery.includes('₿'), gallery.length);
  ok('gallery renders an <img> icon for the unlocked Crypto Curious achievement', /Crypto Curious[\s\S]*?<img[^>]*icon-money\.webp/.test(gallery) || /<img[^>]*icon-money\.webp[\s\S]{0,400}Crypto Curious/.test(gallery));
  await pg.evaluate(() => { Game.hideGallery(); localStorage.removeItem('hexworth_dontcheckbill_achievements'); });

  // Restart to a clean state for the command-behavior + playthrough tests below.
  // NOTE: the title screen's keydown handler only calls handleInput() when the trimmed input is
  // non-empty (`if (raw) handleInput(raw)`), so a bare Enter on an empty field does nothing — a
  // pre-existing UX quirk unrelated to this fix. Any non-empty keystroke does start the game
  // (handleInput() unconditionally calls startGame() while phase==='title'), matching how a real
  // player who types anything before pressing Enter would experience it.
  await pg.goto('http://localhost:' + port + GAME_URL, { waitUntil: 'domcontentloaded', timeout: 20000 });
  await sleep(300);
  await runCmd(pg, 'start'); // title screen: any non-empty input + Enter starts the game
  await sleep(150);

  // ---- (3) bare canned verbs no longer flip state; error message names the missing param ----
  const bareAsg = await runCmd(pg, 'fix autoscaling');
  ok('bare "fix autoscaling" does NOT fix it (asks which group)', /Which auto-scaling group/.test(bareAsg), bareAsg.slice(-200));
  const bareLambda = await runCmd(pg, 'kill lambda');
  ok('bare "kill lambda" does NOT delete it (asks which function)', /Which Lambda function/.test(bareLambda), bareLambda.slice(-200));
  const bareIam = await runCmd(pg, 'revoke intern');
  ok('bare "revoke intern" does NOT fix IAM (asks which user)', /Which IAM user/.test(bareIam), bareIam.slice(-200));

  const stateAfterBare = await pg.evaluate(() => window.__stateProbe || null);
  // (state isn't exposed on window by the game; instead verify indirectly via checkWinCondition
  // never having fired — the win screen must NOT appear yet.)
  const noWinYet = await pg.evaluate(() => document.getElementById('output').textContent.includes('CRISIS CONTAINED'));
  ok('no premature win after bare/incomplete commands', !noWinYet);

  // ---- (3b) the REAL cost-explorer command now shown in help/hints (get-cost-and-usage) still
  // routes to the cost-explorer handler — the matcher (`lower.includes('get-cost')`) is a substring
  // check, and "get-cost-and-usage" still contains "get-cost", so this must still work live. ----
  const realCostCmd = await runCmd(pg, 'aws ce get-cost-and-usage');
  ok('real "aws ce get-cost-and-usage" command routes to the Cost Explorer handler', /AWS COST EXPLORER/.test(realCostCmd), realCostCmd.slice(-300));

  // ---- (4) parameterized forms DO flip state (the real fix path) ----
  const realAsg = await runCmd(pg, 'aws autoscaling update-auto-scaling-group --auto-scaling-group-name intern-test-asg --max-size 5');
  ok('parameterized autoscaling command succeeds (Max: 5)', /Max: 5/.test(realAsg));
  const realLambda = await runCmd(pg, 'aws lambda delete-function --function-name process-data');
  ok('parameterized lambda delete succeeds (Deleted Lambda function)', /Deleted Lambda function/.test(realLambda));
  const realIam = await runCmd(pg, 'aws iam detach-user-policy --user-name mchen --policy-arn arn:aws:iam::aws:policy/AdministratorAccess');
  ok('parameterized iam fix succeeds (Revoked AdministratorAccess)', /Revoked AdministratorAccess/.test(realIam));

  // ---- (5) full win playthrough using ONLY real commands, incl. the new required params ----
  // Fresh run: stop the instances (unchanged command) + the newly-parameterized lambda fix satisfies
  // the win condition (instancesStopped/Terminated) && (lambdaFixed || autoscalingFixed).
  await pg.goto('http://localhost:' + port + GAME_URL, { waitUntil: 'domcontentloaded', timeout: 20000 });
  await sleep(300);
  await runCmd(pg, 'start');
  await sleep(150);
  await runCmd(pg, 'aws ec2 stop-instances');
  await runCmd(pg, 'aws s3api put-public-access-block --bucket company-backups-prod');
  await runCmd(pg, 'aws lambda delete-function --function-name process-data');
  await runCmd(pg, 'aws iam detach-user-policy --user-name mchen --policy-arn arn:aws:iam::aws:policy/AdministratorAccess');
  await runCmd(pg, 'aws autoscaling update-auto-scaling-group --auto-scaling-group-name intern-test-asg --max-size 5');
  await runCmd(pg, 'aws budgets create-budget');
  await runCmd(pg, 'aws cloudwatch put-metric-alarm');
  await sleep(1800); // win screen fires 1500ms after the winning command via setTimeout

  const finalOutput = await pg.evaluate(() => document.getElementById('output').textContent);
  ok('WIN reached: "CRISIS CONTAINED" renders after playing the real (parameterized) commands', /CRISIS CONTAINED/.test(finalOutput));
  ok('win screen lists all actions taken (stopped, lambda, s3, iam, budget)', /Stopped GPU instances/.test(finalOutput) && /Killed recursive Lambda/.test(finalOutput) && /Secured S3 buckets/.test(finalOutput) && /Fixed IAM permissions/.test(finalOutput) && /Set budget alerts/.test(finalOutput));

  const endState = await pg.evaluate(() => ({
    placeholder: document.getElementById('input').placeholder,
    achievements: JSON.parse(localStorage.getItem('hexworth_dontcheckbill_achievements') || '{}'),
  }));
  ok('game reached "ended" phase (restart/achievements prompt shown)', /restart/i.test(endState.placeholder), endState.placeholder);
  ok('by_the_book + full_cleanup + budget_hero achievements unlocked via the real (parameterized) command path', endState.achievements.by_the_book && endState.achievements.full_cleanup && endState.achievements.budget_hero, endState.achievements);

  // ---- (5b) MINIMAL/quick win path still works too — the "Quick and decisive" narrative branch
  // (instancesStopped + autoscalingFixed only, skipping Lambda/S3/IAM/budget entirely) must still
  // be reachable now that autoscaling requires the real ASG name. ----
  await pg.goto('http://localhost:' + port + GAME_URL, { waitUntil: 'domcontentloaded', timeout: 20000 });
  await sleep(300);
  await runCmd(pg, 'start');
  await sleep(150);
  await runCmd(pg, 'aws ec2 stop-instances');
  await runCmd(pg, 'aws autoscaling update-auto-scaling-group --auto-scaling-group-name intern-test-asg --max-size 5');
  await sleep(1800);
  const quickWinOutput = await pg.evaluate(() => document.getElementById('output').textContent);
  ok('MINIMAL win path (stop instances + fix autoscaling only) still reaches CRISIS CONTAINED', /CRISIS CONTAINED/.test(quickWinOutput));
  ok('minimal win shows the "Quick and decisive" narrative (not the full-cleanup one)', /Quick and decisive/.test(quickWinOutput));

  // ---- (6) 0 pageErrors across the whole run ----
  ok('0 non-firebase pageErrors/console-errors for the whole run', errs.length === 0, errs.slice(0, 6));

  await b.close(); srv.close();
  console.log(pass ? '\n*** DONT CHECK THE BILL CHECK OK ***' : '\n!!! DONT CHECK THE BILL CHECK FAILURES ABOVE !!!');
  process.exit(pass ? 0 : 1);
})();
