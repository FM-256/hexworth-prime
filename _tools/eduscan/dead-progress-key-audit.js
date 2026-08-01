#!/usr/bin/env node
'use strict';
// PROGRESS KEYS THAT ARE READ BUT NEVER WRITTEN.
//
// WHY. The API Security course had two hub pages checking
// `localStorage.getItem('hp_module_' + id) === 'complete'` -- a key NOTHING on the platform writes.
// Every student who finished a module saw "0 Completed" and every card stuck on Available, forever.
// It was well-formed, readable code pointing at nothing, and it was found BY ACCIDENT while chasing
// a different bug. Nothing would have surfaced it otherwise.
//
// This asks the question directly, platform-wide: for every localStorage key the app READS, does
// anything WRITE it?
//
// TWO FIXTURES, per the rule that came out of today. Validated against known answers before use:
//   hp_module_        was read, never written  -> MUST be reported (it is now fixed, so it is gone)
//   hexworth_progress is read AND written      -> MUST NOT be reported
// A sweep that cannot tell those apart is not a sweep.
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '../../_app');
const files = [];
(function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    if (e.name.startsWith('.') || e.name === 'node_modules' || e.name === '_archive' || e.name === '_source') continue;
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p);
    else if (/\.(html|js)$/.test(e.name) && !/\.bak$/.test(e.name)) files.push(p);
  }
})(ROOT);

const reads = new Map();   // key -> Set(file)
const writes = new Set();  // key

// A key can be a literal, or a literal PREFIX concatenated with a variable:
//   getItem('hexworth_progress')          -> hexworth_progress
//   getItem('hp_module_' + mod.id)        -> hp_module_        (prefix form)
const RE_READ  = /(?:localStorage|sessionStorage)\s*\.\s*getItem\s*\(\s*['"`]([^'"`]+)['"`]/g;
const RE_WRITE = /(?:localStorage|sessionStorage)\s*\.\s*setItem\s*\(\s*['"`]([^'"`]+)['"`]/g;
const RE_REMOVE= /(?:localStorage|sessionStorage)\s*\.\s*removeItem\s*\(\s*['"`]([^'"`]+)['"`]/g;

for (const f of files) {
  const s = fs.readFileSync(f, 'utf8');
  let m;
  RE_READ.lastIndex = 0;
  while ((m = RE_READ.exec(s)) !== null) {
    if (!reads.has(m[1])) reads.set(m[1], new Set());
    reads.get(m[1]).add(path.relative(ROOT, f));
  }
  for (const re of [RE_WRITE, RE_REMOVE]) {
    re.lastIndex = 0;
    while ((m = re.exec(s)) !== null) writes.add(m[1]);
  }
}

// A read key is satisfied if it is written exactly, OR if some written key starts with it (prefix
// read, e.g. read 'hexworth_' while 'hexworth_house' is written), OR it is a prefix of a written key.
function isWritten(k) {
  if (writes.has(k)) return true;
  for (const w of writes) { if (w.startsWith(k) || k.startsWith(w)) return true; }
  return false;
}

const dead = [...reads.keys()].filter(k => !isWritten(k)).sort();
console.log(`\n  scanned ${files.length} file(s) under _app`);
console.log(`  distinct keys READ: ${reads.size}   distinct keys WRITTEN: ${writes.size}\n`);
if (!dead.length) {
  console.log('  No read-but-never-written keys found.');
} else {
  console.log(`  ${dead.length} key(s) READ but never WRITTEN anywhere in _app:\n`);
  for (const k of dead) {
    const fl = [...reads.get(k)];
    console.log(`    ${k}`);
    fl.slice(0, 4).forEach(f => console.log(`        read by ${f}`));
    if (fl.length > 4) console.log(`        ...and ${fl.length - 4} more`);
  }
  console.log('\n  SUSPECTS, not verdicts. A key may legitimately be written by a Cloud Function,');
  console.log('  by an external script, or be a defensive read of something another app sets.');
  console.log('  Check each against what the READING code concludes when it is absent.');
}
process.exit(0);
