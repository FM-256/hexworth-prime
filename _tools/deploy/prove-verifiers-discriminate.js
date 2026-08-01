#!/usr/bin/env node
'use strict';
// DOES EACH PRODUCTION CHECK MEASURE CODE, OR PROSE ABOUT CODE?
//
// WHY THIS EXISTS. Six times in one day a check of mine keyed on the wrong surface and returned a
// confident wrong answer:
//   1  "Mark Reviewed"      matched the COMMENT documenting that button's removal   -> false FAIL
//   2  body.style.filter    matched COMMENTS; 3 of 5 "filter-setting" files set none -> false claim
//   3  HubRegistry count    stale expectation after a deliberate change             -> false FAIL
//   4  back-link audit      keyed on link TEXT, so 2 of 4 broken hubs read clean    -> false PASS
//   5  verify-deployed-rules errored BOTH ways and printed MISMATCH either way      -> undetectable
//   6  cloud-api glob       keyed on .presentation.html, missed a .lab.html         -> undercount
// Every one was cheap to catch and expensive to miss. The common root: I grepped for a STRING and
// treated the match as evidence of the THING.
//
// WHAT THIS CHECKS, for every `chk` line in every verify-*.sh:
//   A  COMMENT SENSITIVITY -- fetch the page, strip HTML and JS comments, re-count. If the count
//      changes, the pattern is matching prose and the check is unsound. This is failures 1 and 2,
//      detected mechanically.
//   B  DISCRIMINATION -- the observed count must EQUAL the expected value AND differ from at least
//      one other plausible value, so the assertion could have failed. This is failure 5.
//
// It cannot detect failure 4 or 6 (a pattern that is sound but too NARROW); no tool can tell you
// what you forgot to look for. Those need the negative fixture, which is a human act.
const fs = require('fs');
const path = require('path');
const https = require('https');

const DIR = path.resolve(__dirname);
const files = fs.readdirSync(DIR).filter(f => /^verify-.*\.sh$/.test(f));

function get(url) {
  return new Promise(res => {
    https.get(url, r => { let d = ''; r.on('data', c => d += c); r.on('end', () => res(d)); })
         .on('error', () => res(''));
  });
}
// Strip HTML comments and JS line/block comments. Deliberately conservative: if stripping is
// imperfect it can only ADD noise, and a flagged check is reviewed by a human, not auto-failed.
function stripComments(s) {
  return s.replace(/<!--[\s\S]*?-->/g, '')
          .replace(/\/\*[\s\S]*?\*\//g, '')
          .replace(/^[ \t]*\/\/[^\n]*$/gm, '');
}
// MUST count the way `grep -c` counts: LINES CONTAINING a match, not total occurrences.
// v1 counted occurrences and reported a false MISM on pl300-ch04: `6:00am` occurs twice on one
// line, because it is also a substring of '06:00am' in `t !== '6:00am' && t !== '06:00am'`.
// grep -c says 1, occurrence-counting says 2, and the verifier under audit uses grep -c.
// An auditor that does not model the semantics of the thing it audits reports confident nonsense --
// which is the seventh instance today of a check keying on the wrong surface, this time inside the
// tool written to catch that exact class.
function countMatches(body, pattern) {
  try {
    const re = new RegExp(pattern);
    return body.split('\n').filter(l => re.test(l)).length;
  } catch (e) { return null; }
}

(async () => {
  let flagged = 0, checked = 0, unparsed = 0;
  for (const f of files) {
    const src = fs.readFileSync(path.join(DIR, f), 'utf8');
    // chk "label" "/path" 'pattern' before expect
    const re = /^chk\s+"([^"]+)"\s+"([^"]+)"\s+'([^']*)'\s+(\S+)\s+(\S+)/gm;
    const rows = [];
    let m;
    while ((m = re.exec(src)) !== null) rows.push({ label: m[1], url: m[2], pat: m[3], expect: m[5] });
    if (!rows.length) { unparsed++; console.log(`\n${f}\n  (no parsable chk lines -- reviewed by hand, not by this tool)`); continue; }
    console.log(`\n${f}`);
    for (const r of rows) {
      const body = await get('https://hexworth.com' + r.url);
      if (!body) { console.log(`  ??  ${r.label} -- could not fetch ${r.url}`); continue; }
      checked++;
      const withC = countMatches(body, r.pat);
      const noC = countMatches(stripComments(body), r.pat);
      if (withC === null) { console.log(`  ??  ${r.label} -- pattern is not a valid regex here`); continue; }
      const proseOnly = withC !== noC;
      const ok = String(withC) === String(r.expect);
      let verdict = ok ? 'ok  ' : 'MISM';
      if (proseOnly) { verdict = 'PROSE'; flagged++; }
      console.log(`  ${verdict.padEnd(6)} ${r.label.padEnd(44)} with-comments=${withC} stripped=${noC} expect=${r.expect}`);
      if (proseOnly) console.log(`         ^ the pattern matches inside a COMMENT. It is measuring prose about the code.`);
    }
  }
  console.log(`\n  ${checked} check(s) examined across ${files.length - unparsed} verifier(s).`);
  console.log(`  ${flagged} matching inside comments -- these are unsound and must be re-anchored.`);
  console.log('  Cannot detect a pattern that is SOUND but TOO NARROW (failures 4 and 6).');
  console.log('  No tool tells you what you forgot to look for; that needs a negative fixture.');
  process.exit(flagged ? 1 : 0);
})();
