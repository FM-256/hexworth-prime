#!/usr/bin/env node
'use strict';
// BUG-082. Remove the dead `hexworth_uid` guard so server-side XP sync actually fires.
//
// WHY THE GUARD GOES RATHER THAN THE KEY GETTING WRITTEN. FirestoreManager.addXP(uid, amount,
// reason) at FirestoreManager.js:474 NEVER READS uid -- it checks FirebaseAuth.isSignedIn() and
// calls the Cloud Function with {amount, reason}; the CF derives the user from auth context. The
// parameter is vestigial. `hexworth_uid` is written nowhere (0 setItem across _app/functions/_tools),
// so `if (uid)` is always false and the sync never happens.
//
// TWO SHAPES, both matched as COMPLETE UNITS including any closing brace. Nothing here counts or
// balances braces by hand -- the regex either matches the whole block or the file is left alone and
// reported. Partial matches are the way a sweep like this corrupts 85 student-facing pages.
//
//   A (87 sites)   const uid = localStorage.getItem('hexworth_uid');
//                  if (uid) FirestoreManager.addXP(uid, 50, 'Reason');
//
//   B (13 sites)   const uid = localStorage.getItem('hexworth_uid');
//                  if (uid) {
//                      FirestoreManager.addXP(uid, 50, 'Reason');
//                  }
//
// Both become a single unconditional call preserving the original indentation, amount and reason.
//
// usage: node fix-dead-uid-guard.js [--apply] [file ...]     (dry run by default)
const fs = require('fs');
const path = require('path');

const APPLY = process.argv.includes('--apply');
let targets = process.argv.slice(2).filter(a => !a.startsWith('--'));
if (!targets.length) {
  const ROOT = path.resolve(__dirname, '../../_app');
  targets = [];
  (function walk(d) {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      if (e.name.startsWith('.') || ['_archive', '_source', 'node_modules'].includes(e.name)) continue;
      const p = path.join(d, e.name);
      if (e.isDirectory()) walk(p);
      else if (/\.(html|js)$/.test(e.name) && !/\.bak$/.test(e.name)) targets.push(p);
    }
  })(ROOT);
}

// (indent)(decl) uid = localStorage.getItem('hexworth_uid');  \n  (indent)if (uid) <call>;
const SHAPE_A = /([ \t]*)(?:const|let|var)\s+(\w+)\s*=\s*localStorage\.getItem\('hexworth_uid'\)\s*;[ \t]*\r?\n[ \t]*if\s*\(\2\)\s*(FirestoreManager\.addXP\()\2\s*,([^;\n]*)\)\s*;/g;
// same, but braced
const SHAPE_B = /([ \t]*)(?:const|let|var)\s+(\w+)\s*=\s*localStorage\.getItem\('hexworth_uid'\)\s*;[ \t]*\r?\n[ \t]*if\s*\(\2\)\s*\{[ \t]*\r?\n[ \t]*(FirestoreManager\.addXP\()\2\s*,([^;\n]*)\)\s*;[ \t]*\r?\n[ \t]*\}/g;

let changed = 0, sitesA = 0, sitesB = 0, leftovers = [];
for (const f of targets) {
  const src = fs.readFileSync(f, 'utf8');
  if (!src.includes("getItem('hexworth_uid')")) continue;
  const before = (src.match(/getItem\('hexworth_uid'\)/g) || []).length;
  let out = src;
  let a = 0, b = 0;
  out = out.replace(SHAPE_B, (m, ind, v, call, args) => { b++; return `${ind}${call}null,${args}); // BUG-082: uid arg is ignored by addXP; the CF derives the user from auth`; });
  out = out.replace(SHAPE_A, (m, ind, v, call, args) => { a++; return `${ind}${call}null,${args}); // BUG-082: uid arg is ignored by addXP; the CF derives the user from auth`; });
  const after = (out.match(/getItem\('hexworth_uid'\)/g) || []).length;
  if (a + b === 0) { leftovers.push({ f, before, note: 'no shape matched' }); continue; }
  // MUST `continue`. Without it a MIXED file -- some sites matched, some residual reads left --
  // was pushed to `leftovers` for "review by hand" and then WRITTEN ANYWAY on the next two lines.
  // That is the exact opposite of the invariant this tool is sold on ("either the whole block
  // matches or the file is left alone and REPORTED"), and it is the branch that would corrupt a
  // student-facing page while telling me it had been skipped. Nancy caught it; this run happened to
  // dodge it because the one flagged file took the clean a+b===0 path above.
  if (after !== 0) {
    leftovers.push({ f, before, note: `${after} read(s) remain after ${a + b} replacement(s) -- NOT written` });
    continue;
  }
  sitesA += a; sitesB += b; changed++;
  if (APPLY) fs.writeFileSync(f, out);
}

console.log(`\n  ${changed} file(s) ${APPLY ? 'REWRITTEN' : 'would change'}`);
console.log(`  shape A (single-line guard): ${sitesA}`);
console.log(`  shape B (braced guard)     : ${sitesB}`);
if (leftovers.length) {
  console.log(`\n  ${leftovers.length} file(s) NOT fully handled -- LEFT ALONE, review by hand:`);
  leftovers.forEach(l => console.log(`    ${l.f.replace(/.*_app\//, '')}  (${l.note})`));
}
console.log(APPLY ? '\n  APPLIED.' : '\n  DRY RUN. Re-run with --apply.');
process.exit(0);
