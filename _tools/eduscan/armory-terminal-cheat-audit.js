#!/usr/bin/env node
'use strict';
// CAN A STUDENT COMPLETE AN ARMORY TERMINAL MODULE WITHOUT DOING THE WORK?
//
// The Armory terminal modules grade through LinuxTerminal.init(..., { onCommand(cmdLine, output,
// cmd, args) }), which fires per typed command and calls completeTask(id) when a condition matches.
// This tool extracts those conditions and EVALUATES them against crafted cheat inputs.
//
// WHY EVALUATE RATHER THAN PATTERN-MATCH. Reading the conditions and judging them by eye is how
// four earlier scanners produced confident wrong answers this week. Running them answers the only
// question that matters -- does this exact string earn the task -- with no interpretation.
//
// WHAT A FINDING MEANS. Two distinct defects, reported separately because they need different fixes:
//   MULTI  one single line satisfies 2+ tasks at once. The rail implies sequential practice; a line
//          that trips several chips collapses the module into one keystroke.
//   ECHO   a bare `echo "..."` containing the keyword earns the task. The student demonstrated
//          nothing but the ability to read the instruction.
// Neither is automatically wrong: "type a command containing a pipe" is honestly satisfied by any
// line with a pipe. Findings are SUSPECTS. The judgement is whether the task TEXT promised more.
//
// LIMIT, stated because a tool that hides one is worse than no tool: conditions referencing the
// simulator's `output` are evaluated with output='' (we do not run the simulator). Those are
// reported as UNEVALUATED, never as passes -- a null is not a pass.
const fs = require('fs');
const path = require('path');

const files = process.argv.slice(2).filter(a => !a.startsWith('--'));
if (!files.length) { console.error('usage: node armory-terminal-cheat-audit.js <module.html> [...]'); process.exit(2); }

// Cheat inputs. Each is something a student can type in seconds without knowing the topic.
const CHEATS = [
  { label: 'echo with every keyword', mk: kws => `echo "${kws.join(' ')}"` },
  { label: 'bare comment line',       mk: kws => `# ${kws.join(' ')}` },
];

function graderBody(src) {
  const i = src.indexOf('onCommand');
  if (i === -1) return null;
  const sigEnd = src.indexOf('{', src.indexOf('function', i));
  if (sigEnd === -1) return null;
  let depth = 1, j = sigEnd + 1;
  while (j < src.length && depth > 0) {
    const c = src[j];
    if (c === '{') depth++;
    else if (c === '}') depth--;
    j++;
  }
  return src.slice(sigEnd + 1, j - 1);
}

// One `if (COND) completeTask('id');` per line is the shape used throughout.
function rules(body) {
  const out = [];
  const re = /if\s*\(([\s\S]*?)\)\s*completeTask\(\s*['"]([^'"]+)['"]\s*\)/g;
  let m;
  while ((m = re.exec(body)) !== null) out.push({ cond: m[1].trim(), task: m[2] });
  return out;
}

// Literal strings inside a condition are the keywords the grader looks for.
function keywords(cond) {
  const out = [];
  const re = /['"]([^'"]{1,40})['"]/g;
  let m;
  while ((m = re.exec(cond)) !== null) if (m[1].trim()) out.push(m[1]);
  return out;
}

// Run the WHOLE handler body with completeTask stubbed, rather than evaluating each condition in
// isolation. First version did the latter and every SQL module threw "lower is not defined" -- the
// graders open with `var lower = cmdLine.toLowerCase()...` and a per-condition eval never runs that
// preamble. Executing the real body also honours early returns and any shared state, so what this
// records is what the page would actually award.
function runHandler(body, cmdLine) {
  const parts = cmdLine.trim().split(/\s+/);
  const granted = [];
  try {
    // eslint-disable-next-line no-new-func
    const fn = new Function('cmdLine', 'output', 'cmd', 'args', 'completeTask',
      '"use strict";' + body);
    fn(cmdLine, '', parts[0] || '', parts.slice(1), id => { if (!granted.includes(id)) granted.push(id); });
    return { granted };
  } catch (e) { return { granted, err: e.message }; }
}

let totalMulti = 0, totalEcho = 0, examined = 0, noGrader = 0;
for (const f of files) {
  const src = fs.readFileSync(f, 'utf8');
  const body = graderBody(src);
  if (!body) { noGrader++; continue; }
  const rs = rules(body);
  if (!rs.length) { noGrader++; continue; }
  examined++;

  const usesOutput = rs.filter(r => /\boutput\b/.test(r.cond));
  const allKw = [...new Set(rs.flatMap(r => keywords(r.cond)))];

  const findings = [];
  for (const cheat of CHEATS) {
    const line = cheat.mk(allKw);
    const r = runHandler(body, line);
    if (r.err) {
      findings.push({ kind: 'ERR', line, note: r.err, hit: [] });   // UNEVALUATED. Never a pass.
      continue;
    }
    if (r.granted.length >= 2) findings.push({ kind: 'MULTI', line, hit: r.granted });
    else if (r.granted.length === 1) findings.push({ kind: 'ECHO', line, hit: r.granted });
  }

  if (findings.length) {
    console.log(`\n${path.basename(f)}  --  ${rs.length} graded task(s), ${usesOutput.length} depend on output (UNEVALUATED)`);
    for (const fd of findings) {
      if (fd.kind === 'MULTI') totalMulti++;
      if (fd.kind === 'ECHO') totalEcho++;
      if (fd.kind === 'ERR') {
        // Printing errors with a "n/N task(s)" count made UNEVALUATED look like a full sweep of
        // hits. A harness that dresses its own failure as a finding is worse than a silent one.
        console.log(`  ERR   UNEVALUATED -- handler threw, awarded nothing: ${fd.note}`);
        console.log(`        typed: ${fd.line}`);
        continue;
      }
      console.log(`  ${fd.kind.padEnd(5)} ${fd.hit.length}/${rs.length} task(s) from one line: ${fd.hit.join(', ')}`);
      console.log(`        typed: ${fd.line}`);
    }
  }
}

console.log(`\n  ${examined} module(s) examined, ${noGrader} with no extractable onCommand grader.`);
console.log(`  ${totalMulti} multi-task-in-one-line, ${totalEcho} single-task-by-echo.`);
console.log('  SUSPECTS, not verdicts -- compare each against what the task TEXT asked the student to do.');
process.exit(0);
