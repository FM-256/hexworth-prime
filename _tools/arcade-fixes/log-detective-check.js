#!/usr/bin/env node
// log-detective-check.js — browser-level regression + factual-naming gate for the Eye House
// "Log Detective" SOC log-triage lab (_app/houses/eye/labs/eye-log-detective.lab.html).
//
// The lab classifies each log line under a security framework. An audit found it used MITRE ATT&CK
// TACTIC names (Initial Access, Persistence, Lateral Movement, Exfiltration, ...) while labeling the
// framework "Cyber Kill Chain" (a different Lockheed Martin model). This check loads the lab headless,
// stubs the auth guard + optional components so it renders, drives the real triage mechanic to a
// perfect completion (proves still playable/winnable with 0 pageErrors), and asserts the framework is
// now consistently named: the wrong label ("kill chain") is ABSENT and the correct one ("MITRE ATT&CK")
// is PRESENT — in both the rendered DOM and the raw source (catches JS string literals the DOM misses).
//
// Server+stub pattern copied from _tools/arcade-fixes/cockpit-render-check.js.
// Usage: node _tools/arcade-fixes/log-detective-check.js   (exit 0 = pass)
const http = require('http'), fs = require('fs'), path = require('path');
const pup = require('puppeteer');
const APP = path.resolve(__dirname, '../../_app');
const LAB = path.join(APP, 'houses/eye/labs/eye-log-detective.lab.html');
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.css': 'text/css', '.webp': 'image/webp', '.png': 'image/png', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.woff': 'font/woff' };
const sleep = (ms) => new Promise(r => setTimeout(r, ms)); // await a delay in the async driver
let pass = true;
// ok(name, cond, extra): record + print one assertion; flips the global pass flag on failure.
const ok = (n, c, e) => { if (!c) pass = false; console.log('  ' + (c ? 'PASS' : 'FAIL') + '  ' + n + (e !== undefined ? '  ' + JSON.stringify(e).slice(0, 240) : '')); };

// Static file server rooted at _app so the lab + its assets load same-origin.
const srv = http.createServer((q, s) => {
  let p = decodeURIComponent(q.url.split('?')[0]); let fp = path.join(APP, p);
  if (fs.existsSync(fp) && fs.statSync(fp).isFile()) { s.writeHead(200, { 'Content-Type': MIME[path.extname(fp)] || 'application/octet-stream' }); fs.createReadStream(fp).pipe(s); }
  else { s.writeHead(404); s.end('nf'); }
});

// Components we neutralize so the page isolates the lab's own game logic (no Firebase/auth noise).
// AccessGuard MUST expose require() as a no-op or the inline AccessGuard.require('sorted') throws.
const STUB = {
  'AccessGuard.js': "window.AccessGuard={require:function(){return true;}};",
  'ModuleProgress.js': "window.ModuleProgress={isCompleted:function(){return true;},complete:function(){},};",
  'AchievementManager.js': "window.AchievementManager={unlock:function(){}};",
  'GameTracker.js': "window.GameTracker={record:function(){}};",
  'GameScoreboard.js': "window.GameScoreboard={};",
  'HexAIButton.js': "/* stubbed */"
};

(async () => {
  await new Promise(r => srv.listen(0, r)); const port = srv.address().port;
  const b = await pup.launch({ headless: 'new', args: ['--no-sandbox'] });
  const pg = await b.newPage();
  const errs = [];
  pg.on('pageerror', e => { const m = String(e.message); if (!/firebase|firestore|auth\//i.test(m)) errs.push(m.slice(0, 200)); });
  await pg.setRequestInterception(true);
  pg.on('request', r => {
    const u = r.url(); const base = u.split('?')[0].split('/').pop();
    if (STUB[base] !== undefined) r.respond({ status: 200, contentType: 'text/javascript', body: STUB[base] });
    else r.continue();
  });
  await pg.goto('http://localhost:' + port + '/houses/eye/labs/eye-log-detective.lab.html', { waitUntil: 'domcontentloaded', timeout: 20000 }).catch(() => {});
  await sleep(300);

  // The game object + top-level CASES/tactic-list bindings prove the inline script parsed and ran.
  // game/CASES/ATTACK_TACTICS are top-level `const` bindings (global lexical scope, NOT on window),
  // so reference them bare via typeof-guards rather than window.*.
  const boot = await pg.evaluate(() => ({
    game: (typeof game !== 'undefined') ? typeof game : 'undefined',
    cases: (typeof CASES !== 'undefined') ? CASES.length : -1,
    tactics: (typeof ATTACK_TACTICS !== 'undefined') ? ATTACK_TACTICS.slice() : null
  }));
  ok('game object present (inline script ran)', boot.game === 'object', boot.game);
  ok('CASES dataset loaded (8 cases)', boot.cases === 8, boot.cases);
  ok('ATTACK_TACTICS list present with 8 tactics', Array.isArray(boot.tactics) && boot.tactics.length === 8, boot.tactics);
  // Every offered answer must be a real ATT&CK tactic (not a Kill Chain stage like Weaponization/Delivery).
  const ATTACK = ['Reconnaissance', 'Resource Development', 'Initial Access', 'Execution', 'Persistence', 'Privilege Escalation', 'Defense Evasion', 'Credential Access', 'Discovery', 'Lateral Movement', 'Collection', 'Command and Control', 'Command & Control', 'Exfiltration', 'Impact'];
  ok('all offered labels are valid MITRE ATT&CK tactics', Array.isArray(boot.tactics) && boot.tactics.every(t => ATTACK.includes(t)), boot.tactics);

  // Render the tactic zones so we can confirm the classification targets show up.
  const zonesBefore = await pg.evaluate(() => { game.startGame(); return Array.from(document.querySelectorAll('#phasesContainer .phase-zone-name')).map(e => e.textContent); });
  ok('8 tactic zones render on the game screen', zonesBefore.length === 8, zonesBefore);

  // Drive the real triage mechanic to a PERFECT run across all 8 cases: select each log, classify with
  // its correct tactic, submit, advance. If the mechanic is broken this never reaches the end screen.
  const outcome = await pg.evaluate(() => {
    game.startGame();
    let guard = 0;
    while (document.getElementById('gameScreen').classList.contains('active') && guard < 25) {
      const cs = CASES[game.currentCaseIndex];
      cs.logs.forEach((log, i) => {
        game.selectLog(i);
        game.classifyLog(ATTACK_TACTICS.indexOf(log.correctPhase));
      });
      game.submitCase(); // -> result screen
      game.nextCase();   // -> next game screen, or end screen after the last case
      guard++;
    }
    return {
      endActive: document.getElementById('endScreen').classList.contains('active'),
      rank: (document.getElementById('detectiveRank') || {}).textContent || '',
      accuracy: (document.getElementById('finalAccuracy') || {}).textContent || '',
      solved: (document.getElementById('casesSolved') || {}).textContent || '',
      score: parseInt((document.getElementById('finalScore') || {}).textContent || '0', 10),
      guard
    };
  });
  ok('reached End screen (game is completable/winnable)', outcome.endActive === true, outcome);
  ok('perfect run scores 100% accuracy', outcome.accuracy === '100%', outcome.accuracy);
  ok('all 8 cases solved', outcome.solved === '8/8', outcome.solved);
  ok('top rank awarded on a perfect run', /Master Detective/.test(outcome.rank), outcome.rank);
  ok('final score is positive', outcome.score > 0, outcome.score);

  // --- Factual naming: the wrong framework label must be gone, the right one present. ---
  // Rendered DOM text (all screens live in the DOM, hidden or not). Use textContent so HTML entities
  // decode (&amp; -> &), letting us match "MITRE ATT&CK" directly.
  const domText = await pg.evaluate(() => document.body.textContent);
  ok('rendered DOM does NOT contain the wrong label "kill chain"', !/kill.?chain/i.test(domText));
  ok('rendered DOM DOES contain the correct label "MITRE ATT&CK"', /MITRE ATT&CK/i.test(domText));

  // Raw source — catches JS string literals + CSS/identifier names the runtime DOM never surfaces.
  // Allow the HTML-escaped ampersand (ATT&amp;CK) as well as the raw JS-string form (ATT&CK).
  const src = fs.readFileSync(LAB, 'utf8');
  const killHits = (src.match(/kill.?chain/gi) || []);
  ok('raw source has ZERO "kill chain" occurrences (text, CSS classes, JS identifiers)', killHits.length === 0, killHits.slice(0, 6));
  ok('raw source contains "MITRE ATT&CK" (raw or HTML-escaped)', /MITRE ATT&(amp;)?CK/.test(src));

  ok('0 non-firebase pageErrors', errs.length === 0, errs.slice(0, 4));

  await b.close(); srv.close();
  console.log(pass ? '\n*** LOG DETECTIVE OK ***' : '\n!!! LOG DETECTIVE FAILURES ABOVE !!!');
  process.exit(pass ? 0 : 1);
})();
