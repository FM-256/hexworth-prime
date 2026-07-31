// Fixes `window.X` guards for components that are top-level `const` (BUG-071, BUG-068, BUG-069).
//
// `const X = (function(){...})()` at classic-script top level binds LEXICALLY and never becomes a
// window property, so `if (window.X)` is always false and the guarded code never runs. Measured
// in-browser: typeof AchievementManager === 'object' while window.AchievementManager is undefined.
//
// HONESTY NOTE — this fix does NOT make 31 games award achievements. Only 13 of the guarded sites
// pass an achievement id that AchievementManager actually defines; the other 12 pass ids that do
// not exist, so unlock() will now be reached and will warn "Achievement not found" instead of
// being skipped. That is progress (the defect becomes visible instead of silent) but it is not a
// student-visible fix for those 12. See _tools/audit-achievement-fix-scope.js for the split.
//
// Only rewrites shapes it recognises. Anything unmatched is REPORTED, never guessed at.
// DEFAULTS TO DRY RUN. --apply writes.
const fs = require('fs');
const path = require('path');

const APP = path.resolve(__dirname, '../_app');
const APPLY = process.argv.includes('--apply');

// Components verified lexical-only by _tools/audit-lexical-window-guards.js.
const NAMES = ['AchievementManager', 'FirestoreManager', 'GameTracker', 'AchievementRegistry', 'FirebaseAuth'];

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) { if (!/node_modules|\.git/.test(e.name)) walk(p, out); }
    else if (/\.(html|js)$/.test(e.name)) out.push(p);
  }
  return out;
}

let changedFiles = 0, changedSites = 0;
const unmatched = [];

for (const file of walk(APP)) {
  const src = fs.readFileSync(file, 'utf8');
  const rel = path.relative(path.dirname(APP), file);
  if (path.basename(file).replace('.js', '') === 'AchievementManager') continue;

  let out = src;
  let fileHits = 0;

  for (const name of NAMES) {
    // Only touch a file that actually loads the component (or defines it inline). Elsewhere the
    // reference is dead code and rewriting it would imply a fix that does not exist.
    const loaded = new RegExp(`components/${name}\\.js`).test(src) || path.dirname(file) === path.join(APP, 'components');
    if (!loaded) continue;

    const shapes = [
      // typeof window.X !== 'undefined'  ->  typeof X !== 'undefined'
      { re: new RegExp(`typeof\\s+window\\.${name}\\s*(!==|===)\\s*(['"])undefined\\2`, 'g'),
        to: (m, op, q) => `typeof ${name} ${op} ${q}undefined${q}` },
      // typeof window.X.member  ->  typeof X.member   (guarding a method's existence)
      { re: new RegExp(`typeof\\s+window\\.${name}\\.`, 'g'), to: () => `typeof ${name}.` },
      // bare truthiness guard: window.X  ->  typeof X !== 'undefined' && X
      { re: new RegExp(`window\\.${name}\\b(?!\\s*=[^=])`, 'g'),
        to: () => `(typeof ${name} !== 'undefined' && ${name})` },
    ];

    // Line-by-line, skipping COMMENTS. Two files document this exact trap in prose
    // (operator/index.html:1255, InstantQuizGrader.js:41) — a whole-file replace rewrites the
    // explanation of the bug into broken English and counts it as a fix.
    out = out.split('\n').map((line) => {
      const trimmed = line.trimStart();
      if (trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('/*')) return line;
      let edited = line;
      for (const s of shapes) {
        // Only rewrite the portion before an inline // comment.
        const cut = edited.indexOf('//');
        const code = cut === -1 ? edited : edited.slice(0, cut);
        const rest = cut === -1 ? '' : edited.slice(cut);
        const next = code.replace(s.re, (...args) => { fileHits++; return s.to(...args); });
        edited = next + rest;
      }
      return edited;
    }).join('\n');

    // Anything left that still reads window.X and is not an assignment is a shape we do not know.
    const leftover = new RegExp(`window\\.${name}\\b(?!\\s*=[^=])`, 'g');
    let m;
    while ((m = leftover.exec(out)) !== null) {
      const line = out.slice(0, m.index).split('\n').length;
      unmatched.push(`${rel}:${line}`);
    }
  }

  if (fileHits && out !== src) {
    changedFiles++; changedSites += fileHits;
    console.log(`  ${rel}  (${fileHits} site(s))`);
    if (APPLY) fs.writeFileSync(file, out);
  }
}

console.log(`\n${changedSites} site(s) across ${changedFiles} file(s)`);
if (unmatched.length) {
  console.log(`\nUNMATCHED shapes — NOT rewritten, review by hand:`);
  [...new Set(unmatched)].forEach((u) => console.log('   ' + u));
}
console.log(APPLY ? '\nWROTE.' : '\nDRY RUN — pass --apply to write.');
