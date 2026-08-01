#!/usr/bin/env node
'use strict';
// DOES THE FUNCTION THAT GRANTS A TASK ACTUALLY CHECK ANYTHING? -- AST version.
//
// WHY THIS IS NOT A REGEX. Five regex attempts at this question failed tonight, each on a shape
// nobody told the pattern about:
//   * matched onclick= but not onchange=, so a real grant was invisible
//   * matched markDone but not completeTask, and then called a perfectly good lab "suspicious"
//   * counted markDone inside COMMENT PROSE as a grant, reporting 3 sites for a task with 1
//   * read dynamic markDone(taskNum) as "unreachable" and nearly sent someone chasing phantoms
//   * matched `function name()` but not `window.name = function()` -- which is how EVERY handler
//     in the labs concerned is declared -- and then reported the whole platform clean
// The last one had a second failure stacked under it: comment-blanking preserves length, so a
// 700-character comment pushed the real code 1,820 chars from the function start, past an
// 1,800-char scan window. The detector said "clean" because the note explaining the bug had
// shoved the bug out of frame.
//
// A parser knows what a function is, what a call is, and what a comment is not. That removes the
// entire class rather than patching instance six.
//
// WHAT IT REPORTS. For every function containing a completion call, whether that function has any
// guard that can PREVENT the call -- an early return, a conditional wrapping it, a throw. A
// function that grants unconditionally is a suspect, NOT a verdict: "click X to explore" is a
// legitimate task where an unconditional grant on X is honest. Judgement stays human.
//
// TWO LIMITS IT CANNOT SEE PAST, both load-bearing. Neither is fixable by looking harder at JS:
//
//   1. DOM-LEVEL SCOPING LOOKS UNGUARDED. releaseQuarantine() and viewHealthIncident() have no
//      internal `if` at all, and both are CORRECT -- each is wired in HTML to exactly one button,
//      on the one row the task names. The constraint lives in the markup, not the function. Those
//      will always report UNGUARDED here. Check what the handler is attached to before believing
//      the flag.
//
//   2. IT FINDS ABSENT GUARDS, NOT WEAK ONES -- and every real defect found on 2026-08-01 was a
//      weak guard. `t.indexOf('6:00')` accepting "6:00 PM"; `if (t && ...)` accepting empty;
//      `if (!dest)` accepting the wrong workspace. Run against the pre-fix pl300-ch04 this tool
//      flags four OTHER functions and misses the bug that was actually there. So a clean run says
//      nothing about whether the guards that exist are strict enough. That question needs a human
//      reading the task description against the condition, which is how all six were found.
//
// usage: node _tools/eduscan/grant-guard-audit.js <file.html> [...]
const fs = require('fs');
const path = require('path');
const esprima = require(path.resolve(__dirname, '../../node_modules/esprima'));

const GRANTS = new Set(['markDone', 'completeTask', 'completeChallenge', 'markComplete']);
const files = process.argv.slice(2).filter((a) => !a.startsWith('--'));
if (!files.length) {
  console.error('usage: node _tools/eduscan/grant-guard-audit.js <file.html> [...]');
  process.exit(2);
}

// Pull inline script bodies. src= scripts are other files and not ours to judge here.
function scripts(html) {
  const out = [];
  const re = /<script(?![^>]*\ssrc=)[^>]*>([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = re.exec(html)) !== null) out.push(m[1]);
  return out;
}

function walk(node, fn, parents) {
  if (!node || typeof node.type !== 'string') return;
  fn(node, parents);
  const next = parents.concat([node]);
  for (const k of Object.keys(node)) {
    if (k === 'type' || k === 'range' || k === 'loc') continue;
    const v = node[k];
    if (Array.isArray(v)) v.forEach((c) => c && typeof c.type === 'string' && walk(c, fn, next));
    else if (v && typeof v.type === 'string') walk(v, fn, next);
  }
}

let suspects = 0, examined = 0, parseFails = 0, skipped = 0;

for (const f of files) {
  if (!fs.existsSync(f)) { console.log(`\n${f}\n  MISSING`); continue; }
  const blocks = scripts(fs.readFileSync(f, 'utf8'));
  const rows = [];
  for (const src of blocks) {
    let ast;
    try {
      // range:true is LOAD-BEARING, not decoration. Without it every node.range is undefined, the
      // positional comparison below silently never fires, and "is there a guard BEFORE the grant"
      // collapses into "is there an if/return/throw ANYWHERE in this function" -- which a handler
      // ending in `return true` satisfies. That reports an unconditional grant as guarded: a false
      // NEGATIVE, silence over a real bug, which is worse than the false positives this tool was
      // written to stop. Caught by the QC hook, which reproduced it end-to-end.
      ast = esprima.parseScript(src, { tolerant: true, range: true });
    } catch (e) { parseFails++; continue; }
    walk(ast, (node, parents) => {
      if (node.type !== 'CallExpression') return;
      const callee = node.callee;
      const name = callee && callee.type === 'Identifier' ? callee.name : null;
      if (!name || !GRANTS.has(name)) return;
      // The nearest enclosing function, whatever syntax declared it.
      const fnNode = [...parents].reverse().find((p) =>
        p.type === 'FunctionDeclaration' || p.type === 'FunctionExpression' || p.type === 'ArrowFunctionExpression');
      const fname = (fnNode && fnNode.id && fnNode.id.name)
        || (fnNode && parents[parents.indexOf(fnNode) - 1] && parents[parents.indexOf(fnNode) - 1].type === 'AssignmentExpression'
            && parents[parents.indexOf(fnNode) - 1].left.property
            && parents[parents.indexOf(fnNode) - 1].left.property.name)
        || '(anonymous)';
      // Guarded if ANY ancestor inside that function is a conditional, OR the function body
      // contains an early return/throw before this call.
      const inside = parents.slice(fnNode ? parents.indexOf(fnNode) : 0);
      const wrapped = inside.some((p) => p.type === 'IfStatement' || p.type === 'ConditionalExpression'
        || p.type === 'LogicalExpression' || p.type === 'SwitchCase');
      // A guard only counts if it sits BEFORE the grant. Requires real ranges (see parse options).
      let early = false;
      const blockBodied = fnNode && fnNode.body && Array.isArray(fnNode.body.body);
      if (blockBodied && node.range) {
        for (const st of fnNode.body.body) {
          if (!st.range) { break; }               // no position = cannot order = do not guess
          if (st.range[1] > node.range[0]) { break; }   // reached the grant; stop looking
          if (st.type === 'IfStatement' || st.type === 'ThrowStatement' || st.type === 'ReturnStatement') { early = true; break; }
        }
      }
      // A concise arrow body -- () => markDone(1) -- has no statement list at all, so there is
      // nowhere for an early return to live. It is unguarded unless an ancestor conditional wraps
      // it, which `wrapped` already covers. Treating it as block-bodied would silently skip it.
      const conciseArrow = fnNode && fnNode.type === 'ArrowFunctionExpression' && !blockBodied;
      const arg = node.arguments[0];
      const task = arg && arg.type === 'Literal' ? arg.value
        : (arg && arg.type === 'Identifier' ? arg.name + ' (dynamic)' : '?');
      rows.push({ fname, task, guarded: (wrapped || early) && !conciseArrow });
    }, []);
  }
  // NOT EXAMINED is not the same as CLEAN. A file with no recognised grant call was not checked;
  // printing "0 grant call(s), 0 unguarded" beside genuinely-audited files reads as a clean bill
  // of health for something this tool never looked at. Twelve labs did exactly that on the first
  // real run -- they complete by some other mechanism entirely.
  if (!rows.length) {
    skipped++;
    console.log(`\n${path.basename(f)}  --  NOT EXAMINED: no ${[...GRANTS].join('/')} call found.`);
    continue;
  }
  examined++;
  const bare = rows.filter((r) => !r.guarded);
  console.log(`\n${path.basename(f)}  --  ${rows.length} grant call(s), ${bare.length} unguarded`);
  bare.forEach((r) => { suspects++; console.log(`  UNGUARDED  task ${String(r.task).padEnd(14)} in ${r.fname}()`); });
}

// A run that parsed nothing must say so instead of printing a clean bill of health.
if (parseFails) console.log(`\n  NOTE: ${parseFails} script block(s) failed to parse and were NOT examined.`);
console.log(`\n  ${examined} file(s) EXAMINED, ${suspects} unguarded grant(s).`);
if (skipped) {
  console.log(`  ${skipped} file(s) NOT EXAMINED -- no recognised grant call. That is silence, not a pass.`);
}
console.log('  Findings are SUSPECTS, not verdicts -- an');
console.log('  unconditional grant is CORRECT when the task is "click X to explore".');
process.exit(0);
