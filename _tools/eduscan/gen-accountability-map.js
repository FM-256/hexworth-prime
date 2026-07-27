#!/usr/bin/env node
/**
 * gen-accountability-map.js — account for EVERY destination in _app. No exclusions,
 * no DENY_ROOTS, no silent "plumbing" drops. The point is the opposite of a tidy
 * catalog: surface everything that exists so nothing floats unaccounted.
 *
 * For every directory in _app that has an index.html (a "landing"/destination), record:
 *   - href (where it lives)
 *   - registered:  is it a HubRegistry hub?
 *   - linkedFrom:  how many OTHER pages link to it (reachability)
 *   - klass:       a best-effort class (house/course/container/incubator/feature/
 *                  admin/stub/module-or-chapter/system/unknown) — informational only,
 *                  NEVER used to drop anything from the count
 *   - floating:    true if NOT registered AND NOT linked from anywhere → orphaned
 *
 * Output: _tools/reports/ACCOUNTABILITY_MAP.json + a summary. Floating destinations
 * are the accountability gap — things that exist but nothing points to and the
 * catalog doesn't know about.
 *
 * Usage:
 *   node _tools/eduscan/gen-accountability-map.js            # summary
 *   node _tools/eduscan/gen-accountability-map.js --floating # list only the orphans
 *   node _tools/eduscan/gen-accountability-map.js --json     # write the full map
 */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..', '_app');
const REGISTRY = path.join(ROOT, 'components', 'HubRegistry.js');
const REPORT = path.resolve(__dirname, '..', 'reports', 'ACCOUNTABILITY_MAP.json');
// SERVED copy the Hub Health HUD (admin/console.html) fetches at runtime — the
// browser can't walk the filesystem, so accountability must be pre-generated.
const SERVED = path.join(ROOT, 'data', 'accountability-map.json');

const norm = p => ('/' + String(p).replace(/^\.?\/+/, '')).split('#')[0].split('?')[0]
  .replace(/index\.html$/, '').replace(/\/+$/, '/');

const REAL_HOUSES = new Set(['ai', 'cloud', 'code', 'dark-arts', 'divergent', 'eye',
  'forge', 'key', 'matrix', 'script', 'shield', 'web', 'observatory']);
const SYSTEM_DIRS = new Set(['assets', 'components', 'config', 'data', 'css', 'js',
  'vendor', '_lib', 'scripts', 'utils', 'styles', 'templates', 'bot-avatars',
  'bot-widgets', 'api', 'digital-life', 'lab-skill-maps', 'docs']);
const FEATURE_ROOTS = new Set(['career', 'arena', 'hive', 'oasis', 'workshop',
  'dispatch', 'announcements', 'join', 'wall-of-shame']);
const ADMIN_ROOTS = new Set(['operator', 'tenant', 'funding', 'admin', '_games-lab',
  '_archive']);
const CHAPTER = /^(m|module|ch|chapter|week|wk|part|unit|day|lesson|sec|section|step|ex)[-_ ]?\d+/i;

function read(f) { try { return fs.readFileSync(f, 'utf8'); } catch { return ''; } }

function registryHrefs() {
  return new Set([...read(REGISTRY).matchAll(/hubHref:\s*['"](\/[^'"\s]+)['"]/g)].map(m => norm(m[1])));
}
function titleOf(file) { const m = read(file).match(/<title>([^<]*)<\/title>/i); return m ? m[1].trim() : ''; }

// ── duplicate detection: a landing page that carries the same certification/course
// code as an ALREADY-REGISTERED catalog hub is a likely duplicate. Marked (not
// removed) so the Hub Health HUD can label it "duplicate of <hub>". Coincidence-
// gated (only fires on an exact registered-code match), so treat as flag-for-review.
const normCode = s => String(s).toUpperCase().replace(/[^A-Z0-9]/g, '');
const CERT_CODE = /\b[A-Z0-9]{2,4}-[A-Z0-9]{2,4}\b|\b[A-Z]{2,4}\d{2,4}[A-Z]?\b/g;
function registryCatalogCodes() {
  const src = read(REGISTRY), map = {};
  for (const m of src.matchAll(/id:\s*['"]([^'"]+)['"][^}]*?catalogCode:\s*['"]([^'"]+)['"]/g)) map[normCode(m[2])] = m[1];
  return map;
}
function dupOf(title, codeMap) {
  for (const tok of title.match(CERT_CODE) || []) { const id = codeMap[normCode(tok)]; if (id) return { code: tok, ofId: id }; }
  return null;
}

// Walk ALL of _app; collect EVERY .html file (not just index.html) as a
// destination — a lesson page exists and so must be accounted for. index.html
// normalizes to its dir href (/x/); a standalone page keeps its name (/x/foo.html).
function allLandings() {
  const out = [];
  (function rec(abs, rel) {
    let e; try { e = fs.readdirSync(abs, { withFileTypes: true }); } catch { return; }
    for (const x of e) {
      if (x.isDirectory()) { if (!x.name.startsWith('.') && x.name !== 'node_modules') rec(path.join(abs, x.name), rel + '/' + x.name); continue; }
      if (x.name.endsWith('.html')) out.push(norm(rel + '/' + x.name));
    }
  })(ROOT, '');
  return [...new Set(out)];
}

// Every node path across all generated course-tree files — a page that appears
// in some hub's tree is reachable-by-navigation (the tree IS the reachability
// proof), so it counts as accounted even if nothing else links it statically.
function treeNodePaths() {
  const set = new Set();
  const dir = path.join(ROOT, 'data', 'course-trees');
  let manifest;
  try { manifest = JSON.parse(read(path.join(dir, 'manifest.json'))); } catch { return set; }
  const visit = n => { if (!n) return; if (n.path) set.add(norm('/' + n.path)); (n.children || []).forEach(visit); };
  for (const h of (manifest.hubs || [])) {
    set.add(norm('/' + h.hub));
    try { visit(JSON.parse(read(path.join(dir, h.file))).tree); } catch { /* skip */ }
  }
  return set;
}

// Every internal link target across every _app html/js — for reachability.
// Returns { counts, rawRefs }:
//   counts   — resolved-path → count (file-relative resolution; good for <a href>)
//   rawRefs  — a Set of RAW href suffixes (leading ./ and / stripped). A page is
//              reachable if any rawRef is a suffix of its path. This is convention-
//              agnostic: it doesn't matter whether a catalog file (ContentCatalog.js,
//              SignalData.js, ForgeData.js) meant its href to be house-, section-, or
//              root-relative — if 'labs/key-aes.lab.html' appears anywhere and a page
//              lives at /houses/key/labs/key-aes.lab.html, the suffix matches.
function linkIndex() {
  const counts = {};
  const multiRefs = new Set();   // raw refs with >=2 path segments (strong suffix evidence)
  const bareRefs = new Set();    // bare basenames (ambiguous — only trusted when unique)
  (function rec(abs) {
    let e; try { e = fs.readdirSync(abs, { withFileTypes: true }); } catch { return; }
    for (const x of e) {
      const f = path.join(abs, x.name);
      // Skip GENERATED data — the course-tree JSONs and our own accountability map
      // list every path, so scanning them would make every page self-referentially
      // "reachable" (a false 0-floating). Tree membership is handled separately.
      if (x.isDirectory()) { if (!x.name.startsWith('.') && x.name !== 'node_modules' && x.name !== 'course-trees') rec(f); continue; }
      if (x.name === 'accountability-map.json') continue;
      if (!/\.(html|js|json)$/.test(x.name)) continue;
      const html = read(f);
      const fromDir = '/' + path.relative(ROOT, abs).split(path.sep).join('/');
      const record = u => {
        if (!u || /^(https?:|mailto:|tel:|javascript:|data:|#)/.test(u)) return;
        const abspath = u.startsWith('/') ? u : path.posix.normalize(fromDir + '/' + u);
        counts[norm(abspath)] = (counts[norm(abspath)] || 0) + 1;
        // raw suffix (only real page/dir refs, not assets) for convention-agnostic match
        const clean = u.split('#')[0].split('?')[0];
        if (/\.html?$/.test(clean) || clean.endsWith('/')) {
          const raw = clean.replace(/^\.\//, '').replace(/^\//, '').replace(/^(?:\.\.\/)+/, '');
          if (raw.includes('/')) multiRefs.add(raw); else if (raw) bareRefs.add(raw);
        }
      };
      // keyed path string: HTML attr (href=/src=), unquoted JS prop (href: '…'),
      // or quoted JSON/manifest key ("href": "…"). src= catches iframe .html;
      // engine= catches the games-lab game-card loader (engine: 'kahoot.html').
      for (const m of html.matchAll(/["']?\b(?:href|hubHref|courseHref|data-href|data-path-href|src|engine)\b["']?\s*[:=]\s*["']([^"'\s#?]+)["']/g)) record(m[1]);
      for (const m of html.matchAll(/location\.(?:href\s*=|replace\s*\()\s*["']([^"'\s#?]+)["']/g)) record(m[1]);
    }
  })(ROOT);
  return { counts, multiRefs, bareRefs };
}

// Reachable pages built by SLUG CONSTRUCTION, where the filename never appears as a
// literal string (no static scan can see them). Each source is a known, bounded
// builder — not open-ended. projects/: the hub renders /projects/<id>.html from
// ProjectsData.js `id`. Add new builders here as they're diagnosed.
function constructedReachable() {
  const set = new Set();
  const pd = read(path.join(ROOT, 'projects', 'ProjectsData.js'));
  for (const m of pd.matchAll(/\bid:\s*['"]([^'"]+)['"]/g)) set.add(norm('/projects/' + m[1] + '.html'));
  return set;
}

// Reachable via a raw href suffix? Multi-segment refs (labs/x.html) suffix-match
// directly. A bare basename (do-3.html) only counts when it is UNIQUE across all
// pages — otherwise it's too ambiguous to prove which page it reaches (uniqueBase
// holds only the basenames that occur exactly once among all destinations).
function referencedBySuffix(href, multiRefs, bareRefs, uniqueBase) {
  const parts = href.replace(/^\//, '').split('/').filter(Boolean);
  for (let i = 0; i < parts.length - 1; i++) {           // multi-segment suffixes only
    if (multiRefs.has(parts.slice(i).join('/'))) return true;
  }
  const base = parts[parts.length - 1];
  return !!base && bareRefs.has(base) && uniqueBase.has(base);
}

function classify(href) {
  const segs = href.split('/').filter(Boolean);
  const top = segs[0], base = segs[segs.length - 1] || '';
  const isPage = href.endsWith('.html');   // standalone page vs an index.html landing
  const html = read(isPage ? path.join(ROOT, href) : path.join(ROOT, href, 'index.html'));
  if (segs.includes('_archive')) return 'archived';   // intentionally parked (archive-don't-destroy)
  if (/<meta[^>]+http-equiv=["']?refresh/i.test(html)) return 'stub-redirect';
  if (SYSTEM_DIRS.has(top)) return 'system';
  if (isPage) return 'page';               // a non-landing content page (lesson/applet/etc.)
  if (top === 'houses' && segs.length === 2 && REAL_HOUSES.has(base)) return 'house-root';
  if (segs.includes('incubator')) return 'incubator';
  if (ADMIN_ROOTS.has(top)) return 'admin';
  if (FEATURE_ROOTS.has(top)) return 'feature';
  if (CHAPTER.test(base)) return 'module-or-chapter';
  return 'other';
}

function build() {
  const reg = registryHrefs();
  const { counts: links, multiRefs, bareRefs } = linkIndex();
  const inTree = treeNodePaths();
  const constructed = constructedReachable();
  const landings = allLandings();
  // basenames that occur exactly once across ALL destinations — only these are safe
  // to resolve from a bare (single-segment) href, since there's no ambiguity.
  const baseCount = {};
  landings.forEach(h => { const b = h.replace(/\/$/, '').split('/').pop(); if (b) baseCount[b] = (baseCount[b] || 0) + 1; });
  const uniqueBase = new Set(Object.keys(baseCount).filter(b => baseCount[b] === 1));
  const codeMap = registryCatalogCodes();
  const rows = landings.map(href => {
    const registered = reg.has(href);
    const linkedFrom = links[href] || 0;
    const treed = inTree.has(href);
    const referenced = referencedBySuffix(href, multiRefs, bareRefs, uniqueBase) || constructed.has(href);
    const klass = classify(href);
    // Accounted = catalogued, OR resolved-linked, OR present in a hub's tree, OR its
    // path suffix is referenced anywhere (convention-agnostic), OR built by a known
    // slug-constructor, OR intentionally archived. Floating = none hold → unaccounted.
    const floating = !registered && linkedFrom === 0 && !treed && !referenced && klass !== 'archived';
    // Duplicate flag: an UNregistered index.html landing carrying a registered hub's
    // cert code (marked, not removed — the HUD labels it "duplicate of <hub>").
    // Excludes CTF boxes / sub-pages / lesson dirs (which merely mention a code, not a
    // duplicate hub) and already-redirected stubs (a resolved dup, not an active one).
    let duplicateOf = null;
    if (!registered && href.endsWith('/') && klass !== 'stub-redirect'
        && !/\/(boxes|reviews|sections|labs|quizzes|exams|modules)\//.test(href)) {
      const d = dupOf(titleOf(path.join(ROOT, href, 'index.html')), codeMap);
      if (d) duplicateOf = d;
    }
    return { href, registered, linkedFrom, inTree: treed, referenced, klass, floating, duplicateOf };
  });
  // registered hubs whose href has no index.html on disk = broken registry pointer
  const onDisk = new Set(landings);
  const brokenRegistry = [...reg].filter(h => !onDisk.has(h) && !fs.existsSync(path.join(ROOT, h, 'index.html')));
  return { generated: new Date().toISOString(), total: rows.length, rows, brokenRegistry };
}

function summary(m) {
  const byClass = {}, floatByClass = {};
  let reg = 0, floating = 0;
  for (const r of m.rows) {
    byClass[r.klass] = (byClass[r.klass] || 0) + 1;
    if (r.registered) reg++;
    if (r.floating) { floating++; floatByClass[r.klass] = (floatByClass[r.klass] || 0) + 1; }
  }
  console.log('── platform accountability map ──');
  console.log(`  total destinations (index.html landings): ${m.total}`);
  console.log(`  registered in catalog: ${reg}`);
  console.log(`  FLOATING (not registered AND not linked from anywhere): ${floating}`);
  if (m.brokenRegistry.length) console.log(`  broken registry pointers (href → no page): ${m.brokenRegistry.length} [${m.brokenRegistry.join(', ')}]`);
  console.log('\n  by class (count | floating):');
  for (const k of Object.keys(byClass).sort((a, b) => byClass[b] - byClass[a]))
    console.log(`    ${k.padEnd(20)} ${String(byClass[k]).padStart(4)}  | ${floatByClass[k] || 0} floating`);
}

// Admin / internal routes to keep OUT of the PUBLIC served map (they remain in the
// full internal report). Their paths are withheld; an aggregate count is still
// published so admin destinations stay accounted-for without being publicly listed.
const INTERNAL_TOP = new Set(['admin', 'operator', 'tenant', 'funding', '_games-lab', '_archive']);
function isInternal(r) {
  const top = r.href.split('/').filter(Boolean)[0];
  return INTERNAL_TOP.has(top) || r.klass === 'system' || r.klass === 'admin' || r.klass === 'archived';
}
// Public view: internal rows stripped, replaced by an aggregate {withheld} so the
// HUD can still report "N internal destinations (paths withheld)".
function publicView(m) {
  const kept = m.rows.filter(r => !isInternal(r));
  const withheld = m.rows.length - kept.length;
  const withheldFloating = m.rows.filter(r => isInternal(r) && r.floating).length;
  return { generated: m.generated, total: kept.length, rows: kept,
    withheld: { count: withheld, floating: withheldFloating, note: 'admin/internal destinations — paths withheld from public map' } };
}

if (require.main === module) {
  const args = process.argv.slice(2);
  const m = build();
  if (args.includes('--floating')) {
    m.rows.filter(r => r.floating).sort((a, b) => a.href.localeCompare(b.href)).forEach(r => console.log(`${r.klass.padEnd(20)} ${r.href}`));
  } else summary(m);
  if (args.includes('--json')) {
    fs.mkdirSync(path.dirname(REPORT), { recursive: true });
    fs.writeFileSync(REPORT, JSON.stringify(m, null, 2));
    console.log('\n  wrote ' + path.relative(path.resolve(__dirname, '..', '..'), REPORT));
  }
  // Refresh the PUBLIC served copy the HUD reads — internal/admin paths stripped
  // (kept only in the internal REPORT above). Aggregate withheld count is retained.
  if (!args.includes('--no-serve')) {
    const pub = publicView(m);
    fs.mkdirSync(path.dirname(SERVED), { recursive: true });
    fs.writeFileSync(SERVED, JSON.stringify(pub));
    console.log(`  wrote ${path.relative(path.resolve(__dirname, '..', '..'), SERVED)} (served, public: ${pub.total} rows, ${pub.withheld.count} internal withheld)`);
  }
}

module.exports = { build, classify, allLandings };
