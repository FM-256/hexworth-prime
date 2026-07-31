// Re-counts EduScan finding classes from the CURRENT findings.json, so nobody scopes work off a
// number that has since moved.
//
// WHY THIS EXISTS: task #239 recorded a 2-module problem that was really a 1-module problem,
// because its note was written against an orphan report generated 18 minutes before the commit
// that fixed one of them. The same hazard applies to every ticket that quotes a finding count.
// Re-measuring takes seconds; re-scoping a week of work off a stale count does not.
//
// TWO TRAPS THIS TOOL EXISTS TO AVOID, both of which caught me:
//  1. The rule id lives in `.code`. Querying `.rule` / `.ruleId` returns 0 for EVERYTHING and
//     reads as "all resolved". A uniform zero is a detector smell, not good news.
//  2. A rule that was DELETED reports 0 identically to a rule with nothing left to find. So this
//     also reports whether the rule still exists in the validator source, and says UNKNOWN rather
//     than "resolved" when it cannot find one.
//
// usage: node _tools/eduscan/recount-classes.js [CODE ...]
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const FINDINGS = path.resolve(__dirname, '../nexus/findings.json');
const EDUSCAN = path.resolve(__dirname, '.');

const codes = process.argv.slice(2).length
  ? process.argv.slice(2)
  : ['CAT-007', 'QUIZ-008', 'HEUR-034', 'PATH-IDX-001', 'NAME-002', 'PROG-003', 'TRACK-001', 'ENG-002', 'NAV-001', 'NAV-002'];

const raw = JSON.parse(fs.readFileSync(FINDINGS, 'utf8'));
const all = raw.findings || raw.items || (Array.isArray(raw) ? raw : []);
const stat = fs.statSync(FINDINGS);

const counts = {};
for (const f of all) { const c = f.code || '?'; counts[c] = (counts[c] || 0) + 1; }

// Locate the validator that owns a code.
//
// MUST exclude this file. Its own default `codes` array contains all ten ids as string literals,
// so an unfiltered grep matches recount-classes.js and reports the tool itself as the rule
// source — which made codes with NO rule print "genuinely resolved", defeating the exact trap
// this file exists to enforce. Caught by the QC hook. Sorted, not `head -1` on arbitrary order,
// so attributions are stable across runs.
const SELF = path.basename(__filename);
function ruleExists(code) {
  try {
    const out = execSync(`grep -rl "${code}" "${EDUSCAN}" --include=*.js 2>/dev/null | grep -v "/tests/" | grep -v "${SELF}" | sort`,
      { encoding: 'utf8' }).trim();
    return out ? out.split('\n')[0] : null;
  } catch (e) { return null; }
}

console.log(`findings.json  : ${all.length} records, ${Object.keys(counts).length} distinct codes`);
console.log(`last modified  : ${stat.mtime.toISOString()}`);
console.log(`lastSync field : ${raw.lastSync || '(none)'}\n`);
console.log('code            count  rule still in validator source?');
console.log('─'.repeat(64));
for (const c of codes) {
  const n = counts[c];
  const src = ruleExists(c);
  let verdict;
  if (n === undefined && !src) verdict = 'UNKNOWN — no findings AND no rule found; do not read as resolved';
  else if (n === undefined) verdict = `0 findings, rule lives in ${path.relative(EDUSCAN, src)} — genuinely resolved`;
  else verdict = src ? path.relative(EDUSCAN, src) : 'rule source not located';
  console.log(`${c.padEnd(15)} ${String(n === undefined ? 0 : n).padStart(5)}  ${verdict}`);
}
