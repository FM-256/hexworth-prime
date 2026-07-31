// What would the BUG-071 guard fix ACTUALLY fix?
//
// Two independent defects sit on the same call sites:
//   A. the guard `if (window.AchievementManager)` is always false  -> unlock never called
//   B. the id passed to unlock() is not defined in AchievementManager -> unlock warns, returns false
//
// Swapping the guard only helps a site where B is absent. Any site with B stays broken and the
// commit would claim a fix that changed nothing for students — the silent-no-op failure mode.
// This prints the intersection so the fix can be scoped honestly.
//
// READ THIS BEFORE TRUSTING A RUN — the buckets mean different things before and after the
// BUG-071 guard fix (d6bcd61bb). `brokenGuard` is detected by grepping for
// `window.AchievementManager`, which that commit removed. So:
//   pre-fix  (worktree at d6bcd61bb^):  A=13  B=12  C=115  D=52
//   post-fix (current tree):            A=0   B=0   C=127  D=65
// Nothing regressed between those two runs. A folded into D (those 13 now work) and B folded
// into C (those 12 are still blocked on BUG-073's undefined ids), because the guard they were
// keyed on no longer exists. To recover the original split, run this in a worktree at
// d6bcd61bb^. Flagged by Nancy, who noticed the numbers shift with no warning in the output.
//
// REPORT-ONLY.
// usage: node _tools/audit-achievement-fix-scope.js
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const APP = path.resolve(__dirname, '../_app');
const AM = path.join(APP, 'components/AchievementManager.js');

const amSrc = fs.readFileSync(AM, 'utf8');
// Fail LOUDLY if the anchor moves. An unguarded indexOf(-1) restarts the search from 0, so a
// renamed declaration would silently scan the first unrelated '[' in the file and produce a
// bogus id set — misclassifying every call site. A tool written to prevent a silent no-op must
// not have a silent-wrong-output mode of its own.
const anchor = amSrc.indexOf('const achievements = [');
if (anchor === -1) {
  console.error('FATAL: cannot find `const achievements = [` in AchievementManager.js — the anchor moved. Refusing to guess.');
  process.exit(1);
}
const open = amSrc.indexOf('[', anchor);
let d = 0, s = null, esc = false, end = -1;
for (let i = open; i < amSrc.length; i++) {
  const c = amSrc[i];
  if (esc) { esc = false; continue; }
  if (c === '\\') { esc = true; continue; }
  if (s) { if (c === s) s = null; continue; }
  if (c === '"' || c === "'" || c === '`') { s = c; continue; }
  if (c === '[') d++; else if (c === ']') { d--; if (!d) { end = i; break; } }
}
if (end === -1) {
  console.error('FATAL: achievements array never closes — bracket scan failed. Refusing to guess.');
  process.exit(1);
}
const defined = new Set(vm.runInNewContext('(' + amSrc.slice(open, end + 1) + ')').map((a) => a.id));

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) { if (!/node_modules|\.git/.test(e.name)) walk(p, out); }
    else if (/\.(html|js)$/.test(e.name)) out.push(p);
  }
  return out;
}

const buckets = { fixable: [], idMissing: [], alreadyFine: [], guardOnlyNoId: [] };

for (const file of walk(APP)) {
  if (file === AM) continue;
  const src = fs.readFileSync(file, 'utf8');
  const rel = path.relative(path.dirname(APP), file);
  const lines = src.split('\n');
  lines.forEach((text, i) => {
    if (!/AchievementManager\.unlock\(/.test(text)) return;
    if (/^\s*(\/\/|\*)/.test(text)) return;
    const loaded = /components\/AchievementManager\.js/.test(src);
    if (!loaded) return;                       // component not on the page at all
    const m = text.match(/AchievementManager\.unlock\(\s*['"]([^'"]+)['"]/);
    const id = m ? m[1] : null;
    const brokenGuard = /window\.AchievementManager/.test(text);
    const entry = `${rel}:${i + 1}  ${id || '(dynamic)'}`;
    if (!id) return;
    if (brokenGuard && defined.has(id)) buckets.fixable.push(entry);
    else if (brokenGuard && !defined.has(id)) buckets.guardOnlyNoId.push(entry);
    else if (!brokenGuard && !defined.has(id)) buckets.idMissing.push(entry);
    else buckets.alreadyFine.push(entry);
  });
}

console.log(`AchievementManager defines ${defined.size} ids\n`);
console.log(`A. FIXED by the guard swap alone (guard broken, id exists): ${buckets.fixable.length}`);
buckets.fixable.forEach((e) => console.log('     ' + e));
console.log(`\nB. Guard broken AND id undefined — guard swap alone changes NOTHING: ${buckets.guardOnlyNoId.length}`);
buckets.guardOnlyNoId.slice(0, 12).forEach((e) => console.log('     ' + e));
if (buckets.guardOnlyNoId.length > 12) console.log(`     ... and ${buckets.guardOnlyNoId.length - 12} more`);
console.log(`\nC. Guard is fine but id is undefined — silently broken today: ${buckets.idMissing.length}`);
buckets.idMissing.slice(0, 12).forEach((e) => console.log('     ' + e));
if (buckets.idMissing.length > 12) console.log(`     ... and ${buckets.idMissing.length - 12} more`);
console.log(`\nD. Working today (guard fine, id exists): ${buckets.alreadyFine.length}`);
