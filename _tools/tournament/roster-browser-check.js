#!/usr/bin/env node
/*
 * Do the roster generator and the input clamp behave IN THE REAL PAGE, not extracted from it?
 *
 * @catalog what    browser check of buildTeamRoster/clampInt inside admin/console.html
 * @catalog run     node _tools/tournament/roster-browser-check.js
 * @catalog status  TOOL
 *
 * WHY THIS EXISTS. TOURN-01/02 were validated by slicing the two functions out of console.html
 * and running them under node. That proves the ALGORITHM and nothing about the page: it cannot
 * see a syntax error elsewhere in the script block that stops the whole thing parsing, a name
 * collision with another global, or the functions simply not being reachable from where they
 * are called. Extracting code to test it is testing a copy.
 *
 * WHAT IT CAN AND CANNOT REACH — learned the hard way, recorded so nobody repeats it. The first
 * version tried to call buildTeamRoster/clampInt in page scope and failed. That was NOT a defect
 * in them: admin/console.html redirects any non-admin to ../dashboard.html (lines ~4469/4478/4496)
 * before its script defines anything, so an unauthenticated browser reaches NO console global at
 * all -- window.escHtml and window.saveTournament, both long pre-existing and untouched by this
 * work, are equally undefined. The gate is correct; the test's premise was wrong.
 *
 * So this file asserts what is genuinely observable without credentials: the page loads, its
 * script parses with no SyntaxError/ReferenceError, and the admin gate actually fires. The
 * ALGORITHM is covered separately by running the two functions directly, and both Nancy and
 * Chris re-derived that independently. Driving the real create form needs an authenticated admin
 * session and would write a tournament to production -- that remains an uncovered gap, and it is
 * named here rather than implied away.
 *
 * Reads a local file. Touches no network service and no Firestore.
 *
 * ONE HONEST LIMITATION OF THE file:// APPROACH: the page's sibling <script src="../config/*.js">
 * and ../components/*.js tags cannot be fetched over file://, so they fail to load. Those are
 * NETWORK failures, not SyntaxError/ReferenceError, so the fatal filter below deliberately does
 * not trip on them — the inline script block under test parses and runs regardless, which is the
 * thing being measured. It does mean this check cannot see a defect that only appears once those
 * dependencies are present.
 */
// Bare specifier, resolving from the repo root — every other puppeteer tool under _tools/ does
// the same. An absolute path into _tools/eduscan/node_modules was the first draft and was wrong:
// that directory does not exist, so the script would have thrown before launching a browser and
// its "browser check" claim would have been untestable.
const puppeteer = require('puppeteer');
const path = require('path');

const PAGE = 'file://' + path.resolve(__dirname, '../../_app/admin/console.html');

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();

  // A page-level SyntaxError is exactly what the extracted-function test cannot see, so it is
  // a hard failure here rather than noise to be filtered.
  const fatal = [];
  page.on('pageerror', (e) => { if (/SyntaxError|ReferenceError/.test(String(e))) fatal.push(String(e).slice(0, 160)); });

  await page.goto(PAGE, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await new Promise((r) => setTimeout(r, 1200));   // let the inline script settle

  const landed = page.url();
  const redirected = /dashboard\.html/.test(landed);

  let pass = 0, fail = 0;
  const chk = (name, ok, detail) => {
    console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ' :: ' + detail : ''}`);
    ok ? pass++ : fail++;
  };

  // A SyntaxError anywhere in that 12,000-line inline block would stop the whole console dead,
  // and is exactly what running the functions in isolation cannot see. This is the check that
  // earns its keep.
  chk('console script parses with no SyntaxError/ReferenceError', fatal.length === 0, fatal[0] || '');

  // The admin gate is a security property worth asserting while we are here: an unauthenticated
  // visitor must not land on the console.
  chk('unauthenticated visitor is redirected away from the admin console', redirected,
      'landed on ' + landed);

  console.log('');
  console.log('  NOT COVERED, by design: the roster functions cannot be called without an admin');
  console.log('  session, because the gate above redirects first. Their behaviour is proven by');
  console.log('  running them directly; driving the real create form would write to production.');
  console.log('');

  console.log(`\n  ${pass} passed, ${fail} failed`);
  await browser.close();
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.error('  FAILED:', e.message); process.exit(1); });
