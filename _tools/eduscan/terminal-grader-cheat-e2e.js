#!/usr/bin/env node
'use strict';
// DOES ONE TYPED LINE COMPLETE THE PAGE? -- browser-confirmed, not inferred.
//
// WHY THIS EXISTS. A static sibling (armory-terminal-cheat-audit.js) reads the grader source and
// reports SUSPECTS. Nancy's blocking objection to acting on it was correct: that tool class has
// already been wrong twice in one night -- once formatting its own errors as "4/4 task(s)", once
// reporting "0/3 completed" that was really AccessGuard redirecting over file://. So this one runs
// the actual page in a browser and watches the actual completion call.
//
// WHAT IT DOES per page:
//   1. reads the page's onCommand body and harvests the string literals its conditions test
//   2. builds ONE line -- echo "<all of them>" -- which runs a single harmless command
//   3. loads the page over http as a sorted student, wraps completeTask and
//      ModuleProgress.complete to RECORD rather than to judge, types the line, and reports
//
// THE VERDICT IS ModuleProgress.complete FIRING. Chip counts differ per page and some pages have
// no chips at all; the completion call is the thing that writes progress, so it is the only
// signal that means the same thing everywhere.
//
// A PAGE THAT DOES NOT BOOT IS REPORTED AS DIDNOTBOOT, NEVER AS CLEAN. That distinction is the
// whole reason this file exists rather than a one-line puppeteer script.
const fs = require('fs');
const path = require('path');
const puppeteer = require(path.resolve(__dirname, '../../node_modules/puppeteer'));
const BASE = process.env.BASE || 'http://127.0.0.1:8901';
const APP = path.resolve(__dirname, '../../_app');

// Brace matching must SKIP braces inside strings, comments and regex-ish literals. A naive
// counter breaks on real code here: arm-bash-06-functions tests `cmdLine.includes('() {')`, whose
// literal `{` incremented the depth and made the extracted body run one `}` too long. The static
// sibling then threw "Unexpected token '}'" and reported the file UNEVALUATED -- I nearly recorded
// that as the page's defect rather than my own. Same class as the pl300 task-7 sanitizer: a
// character-level job needs a scanner, not a count.
function matchBrace(src, open) {
  let d = 0, i = open, q = null, line = false, block = false;
  while (i < src.length) {
    const c = src[i], n = src[i + 1];
    if (block) { if (c === '*' && n === '/') { block = false; i += 2; continue; } i++; continue; }
    if (line) { if (c === '\n') line = false; i++; continue; }
    if (q) { if (c === '\\') { i += 2; continue; } if (c === q) q = null; i++; continue; }
    if (c === '/' && n === '*') { block = true; i += 2; continue; }
    if (c === '/' && n === '/') { line = true; i += 2; continue; }
    if (c === '"' || c === "'" || c === '`') { q = c; i++; continue; }
    if (c === '{') d++;
    else if (c === '}') { d--; if (d === 0) return i; }
    i++;
  }
  return -1;
}

function graderBody(src) {
  const i = src.indexOf('onCommand');
  if (i === -1) return null;
  const fi = src.indexOf('function', i);
  if (fi === -1) return null;
  const j = src.indexOf('{', fi);
  if (j === -1) return null;
  const close = matchBrace(src, j);
  if (close === -1) return null;
  return src.slice(j + 1, close);
}
// String literals inside the grader are the tokens it looks for. Skip ones that are obviously
// not command text (ids used in completeTask calls are captured separately and excluded).
function cheatLine(body) {
  const granted = new Set();   // kept for reporting only -- NOT used to filter keywords
  let m;
  const gRe = /completeTask\(\s*['"]([^'"]+)['"]\s*\)/g;
  while ((m = gRe.exec(body)) !== null) granted.add(m[1]);
  // Do NOT exclude literals that match a completeTask id. First version did, and on
  // arm-sql-07-crud the task ids ARE the keywords ('begin', 'rollback'), so the cheat line lost
  // two real triggers and the page reported PARTIAL 3/5 when a hand-typed line had already been
  // browser-proven to complete it 5/5. The harness was understating the defect -- the safe
  // direction, but it would have let me call pages clean that are not. Task-id noise inside an
  // echo string is harmless; a dropped keyword is not.
  const kws = [];
  const sRe = /['"]([^'"\n]{1,30})['"]/g;
  while ((m = sRe.exec(body)) !== null) {
    const v = m[1];
    if (!v.trim()) continue;
    if (/[<>]/.test(v)) continue;
    kws.push(v);
  }
  const uniq = [...new Set(kws)];
  if (!uniq.length) return null;
  return 'echo "' + uniq.join(' ').replace(/"/g, '') + '"';
}
function houseOf(rel) {
  if (rel.startsWith('dark-arts/')) return 'dark-arts';
  const m = rel.match(/^houses\/([^/]+)\//);
  return m ? m[1] : 'code';
}

(async () => {
  const files = process.argv.slice(2).filter(a => !a.startsWith('--'));
  if (!files.length) { console.error('usage: node terminal-grader-cheat-e2e.js <page.html> [...]'); process.exit(2); }
  const b = await puppeteer.launch({ args: ['--no-sandbox'] });
  const rows = [];
  for (const f of files) {
    const src = fs.readFileSync(f, 'utf8');
    const body = graderBody(src);
    const rel = path.relative(APP, path.resolve(f)).split(path.sep).join('/');
    const line = body ? cheatLine(body) : null;
    if (!line) { rows.push({ rel, verdict: 'NOCHEAT', note: 'no extractable grader literals' }); continue; }
    const house = houseOf(rel);
    const p = await b.newPage();
    await p.setCacheEnabled(false);
    await p.evaluateOnNewDocument(h => {
      try { localStorage.clear(); sessionStorage.clear(); localStorage.setItem('hexworth_house', h); } catch (e) {}
    }, house);
    let booted = false;
    try {
      await p.goto(BASE + '/' + rel, { waitUntil: 'networkidle0', timeout: 25000 });
      await new Promise(r => setTimeout(r, 350));
      booted = await p.evaluate(r => location.pathname.endsWith(r.split('/').pop()), rel);
    } catch (e) { booted = false; }
    if (!booted) { await p.close(); rows.push({ rel, verdict: 'DIDNOTBOOT', note: 'redirected or failed to load' }); continue; }
    const res = await p.evaluate((cheat) => {
      const rec = { tasks: [], moduleComplete: false, hadFn: typeof window.completeTask === 'function' };
      if (typeof window.completeTask === 'function') {
        const o = window.completeTask;
        window.completeTask = function (id) { if (!rec.tasks.includes(id)) rec.tasks.push(id); return o.apply(this, arguments); };
      }
      if (window.ModuleProgress && typeof ModuleProgress.complete === 'function') {
        const o = ModuleProgress.complete;
        ModuleProgress.complete = function () { rec.moduleComplete = true; return o.apply(this, arguments); };
      }
      const inp = document.querySelector('#terminal input') || document.querySelector('.terminal-input')
               || document.querySelector('input[type=text]');
      if (!inp) { rec.noInput = true; return rec; }
      inp.focus(); inp.value = cheat;
      inp.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', keyCode: 13, which: 13, bubbles: true }));
      return rec;
    }, line);
    await new Promise(r => setTimeout(r, 450));
    const after = await p.evaluate(() => ({
      chips: document.querySelectorAll('.task-chip.completed, .task-item.completed, .objective.completed').length,
      total: document.querySelectorAll('.task-chip, .task-item, .objective').length,
    }));
    await p.close();
    let verdict;
    if (res.noInput) verdict = 'NOINPUT';
    else if (!res.hadFn && !after.total) verdict = 'NOSIGNAL';
    else if (res.moduleComplete) verdict = 'COMPLETED';
    else if (res.tasks.length >= 2) verdict = 'PARTIAL';
    else verdict = 'held';
    rows.push({ rel, verdict, tasks: res.tasks.length, chips: `${after.chips}/${after.total}`, line });
  }
  await b.close();

  const by = v => rows.filter(r => r.verdict === v);
  console.log('');
  for (const r of rows) {
    const tag = r.verdict.padEnd(11);
    console.log(`  ${tag} ${r.rel}`);
    if (r.verdict === 'COMPLETED' || r.verdict === 'PARTIAL') {
      console.log(`              ${r.tasks} task(s), chips ${r.chips}`);
      console.log(`              typed: ${r.line.slice(0, 120)}`);
    } else if (r.note) console.log(`              ${r.note}`);
  }
  console.log('');
  console.log(`  ${rows.length} page(s) run in a browser.`);
  console.log(`    COMPLETED  ${by('COMPLETED').length}   one line fired ModuleProgress.complete`);
  console.log(`    PARTIAL    ${by('PARTIAL').length}   one line granted 2+ tasks but not the module`);
  console.log(`    held       ${by('held').length}   one line granted at most one task`);
  const unk = by('DIDNOTBOOT').length + by('NOINPUT').length + by('NOSIGNAL').length + by('NOCHEAT').length;
  console.log(`    UNVERIFIED ${unk}   did not boot / no input / no signal / no literals -- NOT clean`);
  process.exit(0);
})();
