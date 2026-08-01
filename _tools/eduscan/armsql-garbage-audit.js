#!/usr/bin/env node
'use strict';
// CAN A MODULE BE COMPLETED WITH SEMANTIC GARBAGE THAT IS SYNTACTICALLY SQL?
//
// The `ran && !error` gate closes the echo/comment class. It cannot close this one: SQLEngine's
// _evalSingleCondition ends "Cannot evaluate -- pass through (treat as true)", so an unparseable
// WHERE or HAVING returns every row and never errors. The statement genuinely ran and genuinely did
// not fail, so no gate phrased that way can see it. Chris demonstrated full-module completion this
// way on arm-sql-03 and arm-sql-05; this audits all ten rather than assuming the rest.
//
// METHOD: take each module's OWN prescribed command for every task and corrupt the predicate --
// replace whatever follows WHERE/HAVING/ON with nonsense. If the task still credits, the grader is
// matching shape, not meaning.
const fs = require('fs');
const path = require('path');
const puppeteer = require(path.resolve(__dirname, '../../node_modules/puppeteer'));
const BASE = process.env.BASE || 'http://127.0.0.1:8901';
const DIR = path.resolve(__dirname, '../../_app/houses/code/armory/sql');
const HONEST = process.env.HONEST === '1';

function prescribed(html) {
  // TASK_INSTRUCTIONS carries the exact command each task tells the student to run.
  // BOTH quote styles: 01-05,07-08 use single, 06/09/10 use double. My first pass read only
  // single and reported "no prescribed commands" for three modules -- a clean-looking result
  // that was a parser gap, not evidence of safety.
  const out = [];
  for (const m of html.matchAll(/command:\s*'((?:[^'\\]|\\.)*)'/g)) out.push(m[1].replace(/\\'/g, "'"));
  for (const m of html.matchAll(/command:\s*"((?:[^"\\]|\\.)*)"/g)) out.push(m[1].replace(/\\"/g, '"'));
  return out;
}

// The graders match KEYWORDS and nothing else -- arm-sql-03 line 344: `lower.includes('between')`.
// So corruption must PRESERVE every SQL keyword and destroy only the operands. My first pass
// replaced everything after WHERE, which deleted the very keyword the grader looks for, so the
// tasks failed for the wrong reason and the module read "clean". That is the weaker attack, not
// the safer module.
const KEYWORDS = new Set(('select from where and or not in between like is null as on join inner left ' +
  'right outer group by having order limit distinct count sum avg min max union all insert into ' +
  'values update set delete create table drop alter add primary key foreign references unique ' +
  'default int text real blob varchar exists case when then else end asc desc grant revoke to').split(' '));
function corrupt(cmd) {
  // A real cheat knows the table name -- Chris's working exploit kept `FROM users` intact and
  // garbaged only the predicate. Corrupting the table makes the query legitimately error, which
  // the `!error` gate DOES catch, so corrupting it would understate the exposure.
  const keep = new Set();
  for (const m of cmd.matchAll(/\b(?:FROM|JOIN|INTO|UPDATE|TABLE)\s+([A-Za-z_][A-Za-z0-9_]*)/gi)) keep.add(m[1]);
  // TABLE ALIASES. Nancy, 2026-08-01: arm-sql-04's grader is /from\s+\w+\s+[a-z]\s/ -- it needs a
  // single-letter alias. Rewriting `users u` to `users zz1` broke the GRADER, so the module read
  // clean when in fact ONE meaningless line completes it 4/4 and fires the gradebook write. That is
  // verbatim the failure this function's own comment claims to have fixed for keywords: I preserved
  // the tokens I had thought of and destroyed one I had not. Undercounted 4 modules as 7.
  for (const m of cmd.matchAll(/\b(?:FROM|JOIN)\s+[A-Za-z_][A-Za-z0-9_]*\s+(?!ON\b|WHERE\b|INNER\b|LEFT\b|RIGHT\b|OUTER\b|JOIN\b|GROUP\b|ORDER\b|LIMIT\b|HAVING\b|UNION\b)([A-Za-z_][A-Za-z0-9_]*)/gi)) keep.add(m[1]);
  // CTE names -- `WITH fails AS (...) SELECT * FROM fails`
  for (const m of cmd.matchAll(/\bWITH\s+([A-Za-z_][A-Za-z0-9_]*)\s+AS\b/gi)) keep.add(m[1]);
  for (const m of cmd.matchAll(/,\s*([A-Za-z_][A-Za-z0-9_]*)\s+AS\s*\(/gi)) keep.add(m[1]);
  // Column ALIASES introduced by AS and then referenced downstream (HAVING c > 5)
  for (const m of cmd.matchAll(/\bAS\s+([A-Za-z_][A-Za-z0-9_]*)/gi)) keep.add(m[1]);
  let i = 0;
  return cmd.replace(/'[^']*'|"[^"]*"|[A-Za-z_][A-Za-z0-9_]*|\d+/g, (tok) => {
    if (KEYWORDS.has(tok.toLowerCase())) return tok;         // keyword: the grader matches on it
    if (keep.has(tok)) return tok;                           // table name: a cheat would know it
    if (/^['"]/.test(tok)) return "'zzgarbage'";             // literal: meaningless value
    return 'zz' + (++i);                                     // column that does not exist
  });
}

(async () => {
  const mods = fs.readdirSync(DIR).filter(f => f.endsWith('.module.html')).sort();
  const b = await puppeteer.launch({ args: ['--no-sandbox'] });
  const rows = [];
  for (const fn of mods) {
    const html = fs.readFileSync(path.join(DIR, fn), 'utf8');
    // HONEST=1 runs the modules' OWN prescribed commands verbatim -- the positive fixture.
    // A gate that blocks garbage is worthless if it also blocks the assigned work, which is
    // exactly how the bash gate inverted. Both fixtures, every time.
    const cmds = HONEST ? prescribed(html) : prescribed(html).map(corrupt);
    if (!cmds.length) { rows.push({ fn, note: 'no prescribed commands found' }); continue; }
    const p = await b.newPage();
    await p.setCacheEnabled(false);
    await p.evaluateOnNewDocument(() => { try { localStorage.clear(); localStorage.setItem('hexworth_house', 'code'); } catch (e) {} });
    await p.goto(BASE + '/houses/code/armory/sql/' + fn, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await new Promise(r => setTimeout(r, 800));
    const r = await p.evaluate(async (list) => {
      const rec = { wrote: false };
      if (window.ModuleProgress && ModuleProgress.complete) {
        const o = ModuleProgress.complete;
        ModuleProgress.complete = function () { rec.wrote = true; return o.apply(this, arguments); };
      }
      const inp = document.querySelector('#terminal input') || document.querySelector('.terminal-input');
      if (!inp) return { noInput: true };
      for (const c of list) {
        inp.focus(); inp.value = c;
        inp.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', keyCode: 13, which: 13, bubbles: true }));
        await new Promise(r => setTimeout(r, 260));
      }
      return { wrote: rec.wrote,
               chips: document.querySelectorAll('.task-chip.completed').length,
               total: document.querySelectorAll('.task-chip').length };
    }, cmds);
    await p.close();
    rows.push({ fn, ...r, n: cmds.length });
  }
  await b.close();
  console.log('');
  let full = 0, partial = 0, clean = 0;
  for (const r of rows) {
    if (r.note || r.noInput) { console.log(`  ??    ${r.fn}  ${r.note || 'no terminal input'}`); continue; }
    const tag = r.wrote ? 'FULL ' : (r.chips > 0 ? 'PART ' : 'clean');
    if (r.wrote) full++; else if (r.chips > 0) partial++; else clean++;
    console.log(`  ${tag} ${r.fn.padEnd(30)} chips ${r.chips}/${r.total}   gradebook write: ${r.wrote}`);
  }
  if (HONEST) {
    console.log(`\n  POSITIVE FIXTURE: ${full}/10 modules complete using their OWN prescribed commands.`);
    console.log('  Anything below 10 is the gate blocking assigned work -- the bash-gate inversion.');
    process.exit(full === mods.length ? 0 : 1);
  }
  console.log(`\n  ${full} module(s) FULLY completable with corrupted predicates (gradebook write fires)`);
  console.log(`  ${partial} partially · ${clean} resisted`);
  console.log('  LOWER BOUND: commands with no WHERE/HAVING/ON were left intact, so a real');
  console.log('  adversary has more room than this harness used.');
  process.exit(full ? 1 : 0);
})();
