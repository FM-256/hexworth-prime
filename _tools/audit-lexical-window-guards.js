// Counts sites where a component is guarded via `window.X` but X is a top-level `const` in its
// own file, so `window.X` is undefined and the guarded feature silently never fires.
//
// Precision matters here: a `window.X` reference on a page that never loads X is dead code, not
// a live defect. Only sites where the component IS loaded on that page are counted as broken.
// (I overstated a bug 34x earlier today by measuring the wrong thing and extrapolating.)
//
// The premise was verified in a browser first, not inferred:
//   AchievementManager -> bare typeof 'object', window.AchievementManager undefined.
//
// REPORT-ONLY. Writes nothing.
// usage: node _tools/audit-lexical-window-guards.js
const fs = require('fs');
const path = require('path');

const APP = path.resolve(__dirname, '../_app');
const COMPONENTS = path.join(APP, 'components');

// 1. Which components are lexical-only (declared `const X = ...`, never assigned to window)?
const lexical = new Set();
for (const f of fs.readdirSync(COMPONENTS).filter((x) => x.endsWith('.js'))) {
  const src = fs.readFileSync(path.join(COMPONENTS, f), 'utf8');
  const m = src.match(/^const (\w+) = /m);
  if (!m) continue;
  const name = m[1];
  // Any form of self-registration makes window.X valid.
  if (new RegExp(`window\\.${name}\\s*=|window\\[['"]${name}['"]\\]\\s*=|globalThis\\.${name}\\s*=`).test(src)) continue;
  lexical.add(name);
}

// 2. Walk every page, find `window.X` READS for those components, and check whether the page
//    actually loads X.
function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) { if (!/node_modules|\.git/.test(e.name)) walk(p, out); }
    else if (/\.(html|js)$/.test(e.name)) out.push(p);
  }
  return out;
}

const findings = {};
let liveSites = 0, deadSites = 0;

for (const file of walk(APP)) {
  const src = fs.readFileSync(file, 'utf8');
  const rel = path.relative(path.dirname(APP), file);
  for (const name of lexical) {
    // Its own definition file is not a call site.
    if (path.basename(file) === name + '.js') continue;
    const re = new RegExp(`window\\.${name}\\b`, 'g');
    let m;
    while ((m = re.exec(src)) !== null) {
      // Skip assignments (a page legitimately creating its own window.X).
      const after = src.slice(m.index + m[0].length, m.index + m[0].length + 4);
      if (/^\s*=[^=]/.test(after)) continue;
      const line = src.slice(0, m.index).split('\n').length;
      // Is the component actually loaded here? Either script-included, or defined in-file.
      const loaded = new RegExp(`components/${name}\\.js|const ${name} = `).test(src);
      const rec = findings[name] || (findings[name] = { live: [], dead: [] });
      (loaded ? rec.live : rec.dead).push(`${rel}:${line}`);
      if (loaded) liveSites++; else deadSites++;
    }
  }
}

const names = Object.keys(findings).sort((a, b) => findings[b].live.length - findings[a].live.length);
console.log(`lexical-only components: ${lexical.size}\n`);
console.log('BROKEN GUARDS — component IS loaded on the page, but window.X is undefined,');
console.log('so the guard is always false and the feature silently never fires:\n');
for (const n of names) {
  if (!findings[n].live.length) continue;
  console.log(`  ${n}  —  ${findings[n].live.length} live site(s)`);
  findings[n].live.slice(0, 6).forEach((s) => console.log(`      ${s}`));
  if (findings[n].live.length > 6) console.log(`      ... and ${findings[n].live.length - 6} more`);
}
console.log('\nDEAD REFERENCES — window.X on a page that never loads X (harmless, still wrong):');
for (const n of names) {
  if (findings[n].dead.length) console.log(`  ${n}: ${findings[n].dead.length}`);
}
console.log(`\nTOTAL: ${liveSites} live broken guard(s), ${deadSites} dead reference(s)`);
