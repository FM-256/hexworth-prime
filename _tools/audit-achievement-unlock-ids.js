// Cross-checks every achievement id the games try to unlock against the ids AchievementManager
// actually defines.
//
// WHY THIS RUNS BEFORE THE GUARD FIX: unlock() looks the id up in its `achievements` array and
// returns false with a console.warn if it is missing. So swapping 31 always-false guards to the
// bare identifier could still unlock nothing, and the fix would look applied while changing
// nothing for students. The dead guard has been masking whether the ids were ever right.
//
// REPORT-ONLY.
// usage: node _tools/audit-achievement-unlock-ids.js
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const APP = path.resolve(__dirname, '../_app');
const AM = path.join(APP, 'components/AchievementManager.js');

// 1. The defined ids. Parse the achievements array rather than regexing ids out of it.
const amSrc = fs.readFileSync(AM, 'utf8');
const start = amSrc.indexOf('const achievements = [');
if (start === -1) { console.error('cannot find achievements array'); process.exit(1); }
const open = amSrc.indexOf('[', start);
let depth = 0, inStr = null, esc = false, end = -1;
for (let i = open; i < amSrc.length; i++) {
  const c = amSrc[i];
  if (esc) { esc = false; continue; }
  if (c === '\\') { esc = true; continue; }
  if (inStr) { if (c === inStr) inStr = null; continue; }
  if (c === '"' || c === "'" || c === '`') { inStr = c; continue; }
  if (c === '[') depth++;
  else if (c === ']') { depth--; if (depth === 0) { end = i; break; } }
}
const defined = new Set(vm.runInNewContext('(' + amSrc.slice(open, end + 1) + ')').map((a) => a.id));
console.log(`AchievementManager defines ${defined.size} achievement ids\n`);

// 2. Every unlock() call site across the app.
function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) { if (!/node_modules|\.git/.test(e.name)) walk(p, out); }
    else if (/\.(html|js)$/.test(e.name)) out.push(p);
  }
  return out;
}

const missing = [];
const ok = [];
const dynamic = [];
for (const file of walk(APP)) {
  if (file === AM) continue;
  const src = fs.readFileSync(file, 'utf8');
  const re = /AchievementManager\.unlock\(\s*([^)]*?)\s*\)/g;
  let m;
  while ((m = re.exec(src)) !== null) {
    const arg = m[1].split(',')[0].trim();
    const line = src.slice(0, m.index).split('\n').length;
    const rel = path.relative(path.dirname(APP), file);
    const lit = arg.match(/^['"]([^'"]+)['"]$/);
    if (!lit) { dynamic.push(`${rel}:${line}  ${arg}`); continue; }
    (defined.has(lit[1]) ? ok : missing).push(`${rel}:${line}  ${lit[1]}`);
  }
}

console.log(`unlock() call sites with a LITERAL id that EXISTS:  ${ok.length}`);
console.log(`unlock() call sites with a LITERAL id that is MISSING: ${missing.length}`);
if (missing.length) {
  console.log('\nMISSING — these would warn and return false even after the guard is fixed:');
  missing.forEach((s) => console.log('   ' + s));
}
if (dynamic.length) {
  console.log(`\nDYNAMIC ids (cannot be checked statically): ${dynamic.length}`);
  dynamic.slice(0, 10).forEach((s) => console.log('   ' + s));
}
