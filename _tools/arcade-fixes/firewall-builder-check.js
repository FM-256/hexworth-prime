#!/usr/bin/env node
// firewall-builder-check.js — regression gate for the Key House Firewall Builder ACL lab after two
// fixes: (1) Level 8's title "Rate Limiting" was a conceptual error (an ACL cannot count/throttle
// connections over time — that's a stateful firewall / IPS job, not a match-based ACL rule); the level
// actually teaches source-restricted inbound SSH + allow-ICMP, so it was renamed/reframed and the
// diagram/hint now say plainly that ACLs don't rate-limit. (2) Traffic direction (IN/OUT/BOTH) was
// modeled but not load-bearing anywhere in the original 10 levels — every level was still winnable
// with direction faked out (e.g. every rule set to BOTH, or labeling both flow directions the same).
// Levels 4 and 8 each got one added traffic row whose ONLY discriminator from an already-correctly-
// handled row is direction, so a ruleset that gets the direction wrong now visibly fails.
//
// This loads the real lab HTML headless (no build step — same file served to students), drives the
// REAL exposed globals (loadLevel/addRule/testFirewall — function declarations, not IIFE-hidden) via
// the actual DOM form + button click path, and asserts:
//   - 0 non-platform-shim pageErrors (the page's classic <script> parses and runs to completion)
//   - all 10 levels are winnable with a correct, direction-aware ACL ruleset (first-match-wins)
//   - Level 4 and Level 8 FAIL when the discriminating rule's direction is loosened to BOTH (proves
//     direction is now actually load-bearing, not decorative)
//   - the string "Rate Limiting" no longer appears anywhere in the rendered page (title purge)
//
// Usage: node _tools/arcade-fixes/firewall-builder-check.js   (exit 0 = pass)
const http = require('http'), fs = require('fs'), path = require('path');
const pup = require('puppeteer');
const APP = path.resolve(__dirname, '../../_app');
const GAME_URL = '/houses/key/labs/key-firewall-builder.lab.html';
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.css': 'text/css', '.webp': 'image/webp', '.png': 'image/png', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.woff': 'font/woff' };
const sleep = (ms) => new Promise(r => setTimeout(r, ms)); // await a delay in the async driver
let pass = true;
// ok(name, cond, extra): record + print one assertion; flips the global pass flag on failure.
const ok = (n, c, e) => { if (!c) pass = false; console.log('  ' + (c ? 'PASS' : 'FAIL') + '  ' + n + (e !== undefined ? '  ' + JSON.stringify(e).slice(0, 240) : '')); };

// Static file server rooted at _app so the lab + its component scripts load same-origin.
const srv = http.createServer((q, s) => {
  let p = decodeURIComponent(q.url.split('?')[0]); let fp = path.join(APP, p);
  if (fs.existsSync(fp) && fs.statSync(fp).isFile()) { s.writeHead(200, { 'Content-Type': MIME[path.extname(fp)] || 'application/octet-stream' }); fs.createReadStream(fp).pipe(s); }
  else { s.writeHead(404); s.end('nf'); }
});

// D = the catch-all direction value used for deny-all / non-direction-sensitive rules in the
// canonical solutions below (BOTH matches any packet direction per matchesRule()).
const D = 'BOTH';
// Canonical, direction-aware, first-match-wins rulesets that solve each of the 10 levels as authored.
// Format per rule: [action, source, dest, protocol, port, direction].
const SOL = {
  1: [['ALLOW', 'any', 'any', 'TCP', '80', 'OUT'], ['DENY', 'any', 'any', 'any', 'any', D]],
  2: [['ALLOW', 'any', '10.0.1.10', 'TCP', '80', 'IN'], ['ALLOW', 'any', '10.0.1.10', 'TCP', '443', 'IN'], ['DENY', 'any', 'any', 'any', 'any', D]],
  3: [['ALLOW', 'any', '10.0.1.25', 'TCP', '25', 'IN'], ['ALLOW', 'any', '10.0.1.25', 'TCP', '143', 'IN'], ['ALLOW', 'any', '10.0.1.25', 'TCP', '110', 'IN'], ['DENY', 'any', 'any', 'any', 'any', D]],
  4: [['ALLOW', 'any', '10.0.1.2', 'UDP', '53', 'OUT'], ['DENY', 'any', 'any', 'any', 'any', D]],
  5: [['ALLOW', '10.0.1.0/24', '10.0.2.50', 'TCP', '9100', 'OUT'], ['DENY', '10.0.1.0/24', '10.0.2.0/24', 'any', 'any', 'OUT'], ['ALLOW', '10.0.2.0/24', '10.0.1.0/24', 'any', 'any', 'OUT'], ['DENY', 'any', 'any', 'any', 'any', D]],
  6: [['ALLOW', 'any', '10.0.10.5', 'TCP', '443', 'IN'], ['ALLOW', '10.0.10.5', '10.0.1.50', 'TCP', '3306', 'OUT'], ['ALLOW', '10.0.1.0/24', 'any', 'any', 'any', 'OUT'], ['DENY', 'any', 'any', 'any', 'any', D]],
  7: [['DENY', '198.51.100.66', 'any', 'any', 'any', D], ['ALLOW', 'any', '10.0.1.10', 'TCP', '80', 'IN'], ['ALLOW', 'any', '10.0.1.10', 'TCP', '443', 'IN'], ['DENY', 'any', 'any', 'any', 'any', D]],
  8: [['ALLOW', '10.0.99.0/24', 'any', 'TCP', '22', 'IN'], ['DENY', 'any', 'any', 'TCP', '22', D], ['ALLOW', 'any', 'any', 'ICMP', 'any', D], ['DENY', 'any', 'any', 'any', 'any', D]],
  9: [['DENY', 'any', '10.0.99.0/24', 'any', 'any', D], ['ALLOW', 'any', '10.0.10.5', 'TCP', '443', 'IN'], ['ALLOW', '10.0.10.5', '10.0.1.50', 'TCP', '3306', 'OUT'], ['ALLOW', '10.0.1.0/24', '10.0.10.0/24', 'any', 'any', 'OUT'], ['ALLOW', '10.0.99.0/24', 'any', 'TCP', '22', 'OUT'], ['DENY', 'any', 'any', 'any', 'any', D]],
  10: [['ALLOW', 'any', '10.0.10.5', 'TCP', '443', 'IN'], ['ALLOW', 'any', '10.0.10.25', 'TCP', '25', 'IN'], ['ALLOW', 'any', '10.0.10.25', 'TCP', '143', 'IN'], ['ALLOW', 'any', '10.0.10.25', 'TCP', '993', 'IN'], ['ALLOW', '10.0.10.5', '10.0.1.50', 'TCP', '3306', 'OUT'], ['ALLOW', 'any', '10.0.1.2', 'UDP', '53', 'OUT'], ['ALLOW', 'any', '10.0.1.100', 'UDP', '1194', 'IN'], ['ALLOW', '10.0.99.5', 'any', 'TCP', '22', 'OUT'], ['DENY', 'any', 'any', 'any', 'any', D]]
};
// Negative controls: SOL[4] and SOL[8] with the discriminating rule's direction loosened to BOTH.
// These must FAIL (score < total) — proving direction now actually gates evaluation on these levels.
const WRONG_L4 = [['ALLOW', 'any', '10.0.1.2', 'UDP', '53', D], ['DENY', 'any', 'any', 'any', 'any', D]];
const WRONG_L8 = [['ALLOW', '10.0.99.0/24', 'any', 'TCP', '22', D], ['DENY', 'any', 'any', 'TCP', '22', D], ['ALLOW', 'any', 'any', 'ICMP', 'any', D], ['DENY', 'any', 'any', 'any', 'any', D]];

(async () => {
  await new Promise(r => srv.listen(0, r)); const port = srv.address().port;
  const b = await pup.launch({ headless: 'new', args: ['--no-sandbox'] });
  const pg = await b.newPage();
  const errs = [];
  // Capture uncaught errors, ignoring expected no-creds platform-shim noise (AccessGuard/Firebase).
  pg.on('pageerror', e => { const m = String(e.message); if (!/firebase|firestore|auth\/|AccessGuard|not authenticated/i.test(m)) errs.push(m.slice(0, 200)); });
  await pg.setRequestInterception(true);
  // Neutralize component dependencies so init can't redirect or throw — we're testing lab logic, not
  // the platform shell. HexAIButton/HexAILabAttempt are ES modules; stub as a no-op module.
  pg.on('request', r => {
    const u = r.url();
    if (/AccessGuard\.js|AchievementManager\.js|ModuleProgress\.js|GameTracker\.js|GameScoreboard\.js/.test(u)) {
      r.respond({ status: 200, contentType: 'text/javascript', body:
        'window.AccessGuard=new Proxy({},{get:function(){return function(){return true;};}});' +
        'var __noop=function(){};var __shim=function(){return new Proxy({},{get:function(){return __noop;}});};' +
        'window.AchievementManager=__shim();window.ModuleProgress=__shim();window.GameTracker=__shim();window.GameScoreboard=__shim();' });
    } else if (/HexAIButton\.js|HexAILabAttempt\.js/.test(u)) {
      r.respond({ status: 200, contentType: 'text/javascript', body: 'export function recordLabAttempt(){}' });
    } else r.continue();
  });
  await pg.goto('http://localhost:' + port + GAME_URL, { waitUntil: 'domcontentloaded', timeout: 20000 }).catch(() => {});
  await sleep(400);

  // Public lab functions on window prove the whole inline <script> parsed + ran (catches a broken
  // template literal / stray comma in the hand-edited levels object).
  const haveFns = await pg.evaluate(() => ({ load: typeof window.loadLevel, add: typeof window.addRule, test: typeof window.testFirewall }));
  ok('lab functions on window (inline script ran fully): loadLevel/addRule/testFirewall', haveFns.load === 'function' && haveFns.add === 'function' && haveFns.test === 'function', haveFns);

  // Drives the REAL UI path: fills the rule-builder form fields, clicks addRule() same as a player
  // clicking "Add Rule", then testFirewall() same as clicking "Test Firewall". Returns "correct/total".
  async function solve(level, rules) {
    return await pg.evaluate((level, rules) => {
      window.loadLevel(level);
      for (const r of rules) {
        document.getElementById('ruleAction').value = r[0];
        document.getElementById('ruleSource').value = r[1];
        document.getElementById('ruleDest').value = r[2];
        document.getElementById('ruleProtocol').value = r[3];
        document.getElementById('rulePort').value = r[4];
        document.getElementById('ruleDirection').value = r[5];
        window.addRule();
      }
      window.testFirewall();
      return document.getElementById('scoreValue').textContent;
    }, level, rules);
  }

  console.log('\n=== Winnability: all 10 levels, direction-aware canonical solutions ===');
  for (let l = 1; l <= 10; l++) {
    const score = await solve(l, SOL[l]);
    const [a, t] = score.split('/');
    ok(`Level ${l} winnable (score ${score})`, a === t && t !== undefined, score);
  }

  console.log('\n=== Direction is load-bearing: loosening the discriminating rule to BOTH must FAIL ===');
  const s4 = await solve(4, WRONG_L4);
  const s8 = await solve(8, WRONG_L8);
  const [a4, t4] = s4.split('/');
  const [a8, t8] = s8.split('/');
  ok('Level 4 (DNS Pinhole): allow-rule direction BOTH instead of OUT does NOT incorrectly win', a4 !== t4, s4);
  ok('Level 8: SSH allow-rule direction BOTH instead of IN does NOT incorrectly win', a8 !== t8, s8);

  console.log('\n=== Mislabeled "Rate Limiting" term is purged from the rendered lab ===');
  const bodyHtml = await pg.evaluate(() => document.body.innerHTML);
  ok('rendered page contains no "Rate Limiting" text', !/Rate Limiting/i.test(bodyHtml));
  ok('Level 8 diagram states an ACL does not rate-limit (no false teaching)', /does not count connections or throttle/i.test(bodyHtml));

  ok('0 non-platform-shim pageErrors', errs.length === 0, errs.slice(0, 4));

  await b.close(); srv.close();
  console.log(pass ? '\n*** FIREWALL BUILDER CHECK OK ***' : '\n!!! FIREWALL BUILDER CHECK FAILURES ABOVE !!!');
  process.exit(pass ? 0 : 1);
})();
