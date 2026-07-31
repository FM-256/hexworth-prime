#!/usr/bin/env node
/*
 * Which pages write completion WITHOUT going through ModuleProgress?
 *
 * WHY: a generic ModuleProgress.reset(house, module) would report success and silently
 * leave those pages completed -- CLH-030 is exactly that case, and it is the module the
 * operator actually asked to reset. I called this "needs an audit" and then did not do
 * the audit, which is how a one-line blocker becomes a standing excuse. This is it.
 *
 * Output is the work-list for a real reset feature: every page that hand-rolls a write
 * needs its own reset, or needs migrating onto ModuleProgress.
 */
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..', '..', '_app');
const hits = { handRolled: [], viaModuleProgress: 0, both: [] };

function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) { walk(p); continue; }
    if (!e.name.endsWith('.html')) continue;
    const s = fs.readFileSync(p, 'utf8');
    const direct = /localStorage\.setItem\(\s*['"]hexworth_progress['"]/.test(s);
    const viaMP  = /ModuleProgress\.complete\s*\(/.test(s);
    const rel = path.relative(ROOT, p);
    if (direct && viaMP) hits.both.push(rel);
    else if (direct)     hits.handRolled.push(rel);
    else if (viaMP)      hits.viaModuleProgress++;
  }
}
walk(ROOT);

const keysFor = (rel) => {
  const s = fs.readFileSync(path.join(ROOT, rel), 'utf8');
  const k = new Set();
  for (const m of s.matchAll(/\bp(?:rogress)?\s*(?:\.|\[['"])([a-z]+)(?:['"]\])?\s*\[\s*['"]([^'"]+)['"]\s*\]\s*=/gi)) k.add(`${m[1]}/${m[2]}`);
  return [...k];
};

console.log(`pages using ModuleProgress.complete only : ${hits.viaModuleProgress}`);
console.log(`pages that ALSO hand-roll a direct write : ${hits.both.length}`);
console.log(`pages that ONLY hand-roll a direct write : ${hits.handRolled.length}`);
console.log('');
const risky = [...hits.handRolled, ...hits.both].sort();
if (!risky.length) { console.log('No hand-rolled writers. A generic reset would be safe.'); process.exit(0); }
console.log('THESE NEED THEIR OWN RESET (a generic ModuleProgress.reset would miss them):');
for (const r of risky) {
  const ks = keysFor(r);
  console.log(`  ${r}`);
  if (ks.length) console.log(`      writes: ${ks.join(', ')}`);
}
