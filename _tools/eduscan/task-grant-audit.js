#!/usr/bin/env node
'use strict';
// HOW MANY WAYS CAN A STUDENT BE GRANTED EACH TASK, AND DOES THE GRANT CHECK ANYTHING?
//
// WHY THIS EXISTS. On ms102-ch05 I audited the honesty of three tasks, found the handler that
// granted each one, and reported. I missed that Task 04 had a SECOND, independent grant: a
// "Mark Reviewed" header button calling markQuarantineReviewed(), which read no row and no
// checkbox and handed out the task for clicking it. Nancy found it. Fixing only the handler I
// had found would have left the free door open and I would have called the lab fixed.
//
// The lesson is mechanical and therefore automatable: FIND EVERY PATH TO THE SAME GRANT, not the
// first one. This reports each task id with all of its grant sites, so a task with two doors is
// visible immediately instead of depending on someone reading the whole file.
//
// IT ALSO COMPARES INTENT TO ENFORCEMENT. The task rail states what the student must do. If a
// description names SPECIFIC values ("named 'IT Support Team' with address itsupport@contoso.com")
// but the granting function only tests for non-empty input, that is a false pass -- the lab asked
// for something and accepted anything. That was Task 01's bug, and I originally mis-diagnosed it
// as "free-form, no correct answer" because I read the input PLACEHOLDER instead of the task
// description.
//
// WHAT IT DOES NOT DO: decide. A bare grant is sometimes correct -- ms102-ch05's Task 03 asks for
// "at least one condition and action" and gating on non-empty IS that requirement. I wrongly
// called that one ungated. So this reports SUSPECTS with the evidence to judge them, and a human
// rules. Anything that claims to know which is which is lying about a judgement call.
//
// usage: node _tools/eduscan/task-grant-audit.js <file.html> [more.html ...]
const fs = require('fs');
const path = require('path');

const files = process.argv.slice(2);
if (!files.length) {
  console.error('usage: node _tools/eduscan/task-grant-audit.js <file.html> [more.html ...]');
  process.exit(2);
}

// Words that mean "the task named a specific thing", so accepting anything is a false pass.
const SPECIFIC = /named\s+"|named\s+'|address\s+\S+@|\bthe\s+(legitimate|specific|correct)\b|"[^"]{3,}"/i;
// A grant guarded by nothing but presence.
const PRESENCE_ONLY = /!\s*\w+\s*(\|\||&&)|\.value\.trim\(\)|if\s*\(\s*!\w+\s*\)/;

let anySuspect = 0;

for (const f of files) {
  if (!fs.existsSync(f)) { console.log(`\n${f}\n  MISSING`); continue; }
  const src = fs.readFileSync(f, 'utf8');
  console.log(`\n${path.basename(f)}`);

  // Task rail: name + description, in document order, so index N is task N.
  const names = [...src.matchAll(/class="task-item-name"[^>]*>([^<]*)</g)].map((m) => m[1].trim());
  const descs = [...src.matchAll(/class="task-item-desc"[^>]*>([^<]*)</g)].map((m) => m[1].trim());
  if (!names.length) { console.log('  no task rail found -- different lab shape, read it by hand'); continue; }

  // STRIP COMMENTS BEFORE SCANNING, rather than trying to recognise a comment line by line.
  // The first version skipped a match only if its line STARTED with * or //. A block comment
  // whose interior lines begin with ordinary words -- e.g. prose explaining that markDone(4) was
  // removed -- sailed straight through, and the tool reported three grant sites for a task that
  // has one. Written to catch exactly this class of miss, it committed the same one: a proxy for
  // "is this a comment" instead of removing the comments. Replaced with blanking, which keeps
  // byte offsets stable so enclosing-function lookup still works.
  const blank = (s) => s.replace(/[^\n]/g, ' ');
  const code = src
    .replace(/<!--[\s\S]*?-->/g, blank)     // HTML comments
    .replace(/\/\*[\s\S]*?\*\//g, blank)    // JS block comments
    .replace(/^[ \t]*\/\/.*$/gm, blank);    // JS line comments

  // Does this file grant tasks DYNAMICALLY -- markDone(taskNum) with a variable rather than a
  // literal? The shared checkpoint system does exactly that, and a numeric regex can never
  // attribute those to a task id. Knowing whether such a call exists is what separates "granted
  // somewhere this scan cannot see" from "genuinely never granted".
  const dynamic = /markDone\s*\(\s*[A-Za-z_$]/.test(code);

  // Every grant site, with the function that encloses it.
  const grants = {};
  const re = /markDone\s*\(\s*(\d+)/g;
  let m;
  while ((m = re.exec(code)) !== null) {
    const before = code.slice(0, m.index);
    const fn = [...before.matchAll(/function\s+([A-Za-z0-9_$]+)\s*\(/g)].pop();
    const id = Number(m[1]);
    (grants[id] = grants[id] || []).push(fn ? fn[1] : '(anonymous)');
  }

  for (let i = 0; i < names.length; i++) {
    const id = i + 1;
    const sites = grants[id] || [];
    const desc = descs[i] || '';
    const specific = SPECIFIC.test(desc);

    const flags = [];
    if (sites.length > 1) { flags.push(`${sites.length} GRANT SITES`); }
    // A task with no NUMERIC grant is almost never unreachable -- it is granted dynamically, by
    // the shared checkpoint system calling markDone(taskNum) with a variable this regex cannot
    // attribute to a task id. Saying "unreachable" there would send someone chasing a dozen
    // phantom defects, so say what is actually known instead.
    if (!sites.length) {
      flags.push(dynamic
        ? 'no STATIC grant -- likely granted by the checkpoint system (markDone with a variable); verify by hand'
        : 'NO GRANT SITE AT ALL and no dynamic grant in this file -- genuinely suspicious');
    }
    if (specific) {
      // Does the granting function look like it only tests presence?
      const looksLoose = sites.some((fnName) => {
        const at = src.indexOf('function ' + fnName);
        if (at === -1) { return false; }
        const body = src.slice(at, at + 900);
        return PRESENCE_ONLY.test(body) && !/===|indexOf|match\(|test\(/.test(body.split('markDone')[0]);
      });
      if (looksLoose) { flags.push('DESCRIPTION NAMES SPECIFICS but grant looks presence-only'); }
    }

    if (flags.length) {
      anySuspect++;
      console.log(`  [${String(id).padStart(2)}] ${names[i]}`);
      console.log(`       ${desc.slice(0, 96)}`);
      console.log(`       grants: ${sites.join(', ') || 'none'}`);
      flags.forEach((fl) => console.log(`       -> ${fl}`));
    }
  }
  const clean = names.length - Object.keys(grants).filter((k) => (grants[k] || []).length > 1).length;
  console.log(`  ${names.length} tasks, ${Object.keys(grants).length} with grant sites`);
}

console.log(anySuspect
  ? `\n  ${anySuspect} suspect task(s). These are EVIDENCE, not verdicts -- a bare grant is correct when the task asks for something open-ended.`
  : '\n  no suspects.');
process.exit(0);
