#!/usr/bin/env node
/**
 * gen-catalog-from-tree.js — reconcile the student-facing catalog against the
 * FILESYSTEM hub tree, so no course can hide from the catalog.
 *
 * WHY this exists
 * ---------------
 * Two prior detection methods each had a hole:
 *   - gen-hub-inventory.js keys off renderer SIGNATURES → blind to hand-built
 *     custom pages (clh, linux-mastery had no signature and were invisible).
 *   - curated-list reconciliation is only as complete as the lists we enumerate.
 * This tool walks the filesystem directly (the Course Tree Mapper for houses/,
 * plus every other content root), CLASSIFIES each index.html landing page, and
 * reconciles the "course" ones against HubRegistry. The gap it prints is the set
 * of courses missing from the catalog. It is regenerable → a standing audit.
 *
 * CLASSIFICATION (idiom-independent, derived from real page signals)
 * -----------------------------------------------------------------
 *   house    — /houses/<house>/                                     → skip
 *   plumbing — content/staging folder by basename or ancestor       → skip
 *   redirect — page is a <meta refresh> / location redirect stub     → skip
 *   chapter  — numbered leaf ("m01", "Module 3") OR a track capstone
 *              OR a page that is not a course landing                → skip
 *   course   — a subject LANDING page. Detected by ANY of:
 *                • a roster array  (MODULES|LESSONS|COURSES|LANGUAGES|TRACKS…)
 *                • a registration/coming-soon array (idiom B data)
 *                • high inline card density (idiom B markup)
 *                • many internal child links (idiom-independent fallback)
 *                • renderHub / module-card grid                       → CATALOG
 * A course whose >=2 immediate children are courses is a CONTAINER (grouping
 * hub; members link via parentHref).
 *
 * TWO course-authoring idioms exist and BOTH must classify as course:
 *   A: armory/python, cortex/nlp  → `MODULES = [...]`, cards drawn by JS
 *   B: piverse, network-plus, sc-200 → inline `week-card`/`content-card` HTML,
 *      arrays named `NP_REGISTRATIONS` / `COMING_SOON`, 150-650 card elements
 * The self-QC below is NON-circular: every already-registered hub's page MUST
 * classify as course; any that does not exposes a detector blind spot.
 *
 * Usage:
 *   node _tools/eduscan/gen-catalog-from-tree.js            # human summary
 *   node _tools/eduscan/gen-catalog-from-tree.js --json     # + JSON report
 *   node _tools/eduscan/gen-catalog-from-tree.js --validate # registered-hub QC
 *   node _tools/eduscan/gen-catalog-from-tree.js --gap      # gap hrefs only
 */
'use strict';
const fs = require('fs');
const path = require('path');
const TreeMapper = require('./validators/tree-mapper.js');

const ROOT = path.resolve(__dirname, '..', '..', '_app');
const REGISTRY = path.join(ROOT, 'components', 'HubRegistry.js');
const REPORT = path.resolve(__dirname, '..', 'reports', 'CATALOG_TREE_RECON.json');

// Top-level _app dirs excluded from COURSE discovery. Two kinds, both structural
// (never student courses, so this is honest scoping, not hiding course content):
//   (a) system/asset/tooling: assets, components, config, data, admin, api
//   (b) platform infrastructure: the Arena (CTF), Operator/Dispatch/Tenant admin
//       consoles, Career Launchpad (tools), Funding Hub (grants), game-staging,
//       announcements/join/wall-of-shame marketing. Verified 2026-07 (Nancy sweep)
//       that none hide a course. Everything ELSE is crawled (houses, workshop,
//       signal, arctic, projects, wireshark, dark-arts) — the classifier filters.
const DENY_ROOTS = new Set([
  'assets', 'components', 'config', 'data', 'admin', 'api', 'node_modules',
  'arena', 'career', 'operator', 'dispatch', 'funding', 'tenant', 'join',
  'announcements', 'wall-of-shame', '_games-lab', 'oasis',
]);
const MAX_DEPTH = 4; // dirs below a root (piverse sits 2 under houses/matrix)

// Folder basenames that are never a course: content-type buckets + WIP staging.
const PLUMBING = new Set([
  'applets', 'exams', 'reviews', 'labs', 'quizzes', 'presentations', 'tools',
  'games', 'instructor', '_compare', 'compare', 'hubs', 'modules', 'assessments',
  'workbench', 'sections', 'incubator', 'foundation', 'ide', 'security-guide',
  'challenges', 'presentation', 'quiz', 'lab', 'applet', 'tool', 'game', 'hub',
]);
// Content-type dirs that never CONTAIN a catalog course, so anything nested
// beneath one is plumbing too (e.g. /houses/script/labs/linux/bash → a lab,
// /arena/boxes/ow-01-mole-hunt → a CTF box). NB: 'applets' is deliberately
// ABSENT — real registered hubs live under it (forge/applets/comptia-aplus/
// core-1); and 'modules' is absent too (cloud/modules/wsa is a real course).
const ANCESTOR_PLUMBING = new Set([
  'exams', 'reviews', 'labs', 'quizzes', 'presentations',
  'tools', 'games', 'sections', 'boxes', 'gates',
]);

// The real houses (a /houses/<X>/ landing is a house, not a catalog hub). Cert
// hubs also sit at /houses/<id>/ (ccna, cysa-plus …) but are NOT houses — they
// must classify normally, so depth-2 alone is not enough. Source: catalog.html
// HOUSE_COLOR, minus the non-/houses/ pseudo-houses (signal/arctic/wireshark).
const REAL_HOUSES = new Set([
  'ai', 'cloud', 'code', 'dark-arts', 'divergent', 'eye', 'forge',
  'key', 'matrix', 'script', 'shield', 'web', 'observatory',
]);
// A track's terminal capstone is part of its parent course, not a catalog entry.
const TRACK_TERMINAL = new Set(['capstone', 'final', 'final-exam', 'finale']);
// Retired / staging / internal builds (naming convention) — never catalog. Fixes
// e.g. workshop/old-hive (a real-but-retired hub that trips renderHub by name).
const RETIRED_NAME = /^(old[-_]|_|deprecated|legacy|archive|wip[-_]|draft[-_]|backup[-_])/i;

const CHAPTER_NAME  = /^(m|module|ch|chapter|week|wk|part|unit|day|lesson|les|sec|section|step|ex)[-_ ]?\d+/i;
const NUM_PREFIX    = /^\d+[-_ ]/;
const CHAPTER_TITLE = /^\s*(m\d+\b|(module|chapter|week|wk|part|unit|lesson|day|step)\s+\d+)/i;

// A course landing renders a roster. Names vary by house AND by idiom:
const ROSTER_ARRAY  = /\b(SAMPLE_MODULES|MODULES|LESSONS|COURSES|LANGUAGES|TRACKS|TOPICS|SECTIONS|MISSIONS|CURRICULUM|CHAPTERS|DOMAINS|UNITS|SYLLABUS)\s*=\s*\[/;
const REG_ARRAY     = /\b[A-Z][A-Z0-9_]*(_REGISTRATIONS|_REGISTRATION)\s*=\s*\[|\bCOMING_SOON\s*=\s*\[/;
const CARD_CLASS    = /class="[^"]*(?:\bcard\b|-card\b)[^"]*"/g;
const CARD_DENSITY_MIN = 6;    // courses: 8-646; chapters: 0-1
const CHILD_LINK_MIN   = 12;   // courses: 21-157; chapters: 0-3

function norm(p) {
  return ('/' + String(p).replace(/^\.?\/+/, ''))
    .split('#')[0].split('?')[0]
    .replace(/index\.html$/, '')
    .replace(/\/+$/, '/');
}

function registryHrefs() {
  const src = fs.readFileSync(REGISTRY, 'utf8');
  return new Set([...src.matchAll(/hubHref:\s*['"](\/[^'"\s]+)['"]/g)].map(m => norm(m[1])));
}

// Normalize a cert code for comparison: uppercase, strip all non-alphanumerics.
// "AZ-900" → "AZ900", "N10-009" → "N10009", "200-301" → "200301".
function normCode(s) { return String(s).toUpperCase().replace(/[^A-Z0-9]/g, ''); }
// Broad vendor-exam-code shapes: hyphenated (N10-009, CLF-C02, AZ-900, 200-301,
// SY0-701, 220-1101) or solid (CTS1328C, COP1034C). Broadening is safe because a
// token is only treated as a dup if it matches a REGISTERED catalogCode.
const CERT_CODE = /\b[A-Z0-9]{2,4}-[A-Z0-9]{2,4}\b|\b[A-Z]{2,4}\d{2,4}[A-Z]?\b/g;

/** Map of normalized registry catalogCode → hub id, for duplicate detection. */
function registryCatalogCodes() {
  const src = fs.readFileSync(REGISTRY, 'utf8');
  const map = {};
  for (const m of src.matchAll(/id:\s*['"]([^'"]+)['"][^}]*?catalogCode:\s*['"]([^'"]+)['"]/g))
    map[normCode(m[2])] = m[1];
  return map;
}

/**
 * If a page's title carries a cert code matching a REGISTERED hub, it's a dup.
 * FAILURE DIRECTION (do not silently trust): this is a coincidence-gated heuristic,
 * not a structural guarantee. A future registered catalogCode could normalize to an
 * ordinary title acronym (e.g. "SD-WAN" already matches the CERT_CODE shape and only
 * fails to fire because no registered code is "SDWAN" today) — which would WRONGLY
 * drop a real course from the gap with no signal anywhere (--validate only checks
 * registered hubs). Therefore gapDuplicates is a "flag for MANDATORY human review"
 * list; NEVER promote it to an auto-discard filter, and never treat it as proof the
 * gap is dup-free. (Nancy adversarial review, 2026-07-26.)
 */
function dupOfRegistered(title, codeMap) {
  for (const tok of title.match(CERT_CODE) || []) {
    const id = codeMap[normCode(tok)];
    if (id) return { code: tok, id };
  }
  return null;
}

function read(file) { try { return fs.readFileSync(file, 'utf8'); } catch { return ''; } }
function titleOf(file) { const m = read(file).match(/<title>([^<]*)<\/title>/i); return m ? m[1].trim() : ''; }

/**
 * A <meta refresh> redirect = a stub, not a course. Meta-refresh alone caught
 * 100% of real redirect stubs (31/31); a location.replace-without-meta branch was
 * removed as a dormant landmine — it could vanish a real AccessGuard-gated,
 * JS-card course with no signal (the exact PiVerse failure mode). Keep it strict.
 */
function isRedirect(html) {
  return /<meta[^>]+http-equiv=["']?refresh["']?[^>]*\bcontent=["'][^"']*url=/i.test(html);
}

/** Distinct internal links that point at a page/dir (not an asset). */
function childLinkCount(html) {
  const links = new Set();
  for (const m of html.matchAll(/href=["']([^"'#?]+)["']/g)) {
    const u = m[1];
    if (/^(https?:|mailto:|tel:|javascript:|data:)/.test(u)) continue;
    if (/\.(webp|png|jpg|jpeg|svg|gif|css|js|json|ico|pdf|woff2?)$/i.test(u)) continue;
    links.add(u);
  }
  return links.size;
}

/** Is this landing page a course (renders a roster of children, any idiom)? */
function isCourseLanding(html) {
  if (ROSTER_ARRAY.test(html)) return true;
  if (REG_ARRAY.test(html)) return true;
  if (/\brenderHub\b/.test(html)) return true;
  if (/CertPathRenderer\.(init|render)\s*\(/.test(html)) return true; // cert-prep landing idiom
  if (/class="[^"]*(module-card|module-grid|course-card|hub-grid|-module-card|-module-grid)[^"]*"/.test(html)) return true;
  if ((html.match(CARD_CLASS) || []).length >= CARD_DENSITY_MIN) return true;
  if (childLinkCount(html) >= CHILD_LINK_MIN) return true;
  return false;
}

/** Classify one landing page. Returns { kind, reason }. */
function classify(relPath) {
  const n = norm('/' + relPath);
  const segs = n.split('/').filter(Boolean);
  const base = segs[segs.length - 1] || '';
  const file = path.join(ROOT, n, 'index.html');

  if (segs[0] === 'houses' && segs.length === 2 && REAL_HOUSES.has(segs[1])) return { kind: 'house', reason: 'house root' };
  if (PLUMBING.has(base)) return { kind: 'plumbing', reason: `content/staging folder "${base}"` };
  if (RETIRED_NAME.test(base)) return { kind: 'plumbing', reason: `retired/internal "${base}"` };
  const plumbAncestor = segs.slice(0, -1).find(s => ANCESTOR_PLUMBING.has(s));
  if (plumbAncestor) return { kind: 'plumbing', reason: `nested under "${plumbAncestor}/"` };
  if (!fs.existsSync(file)) return { kind: 'missing', reason: 'no index.html on disk' };

  const html = read(file);
  if (isRedirect(html)) return { kind: 'redirect', reason: 'meta-refresh / location redirect stub' };

  const title = titleOf(file);
  if (TRACK_TERMINAL.has(base)) return { kind: 'chapter', reason: `track terminal "${base}"` };
  if (CHAPTER_NAME.test(base) || NUM_PREFIX.test(base)) return { kind: 'chapter', reason: `numbered name "${base}"` };
  if (CHAPTER_TITLE.test(title)) return { kind: 'chapter', reason: `chapter title "${title}"` };
  if (!isCourseLanding(html)) return { kind: 'chapter', reason: 'leaf: not a course landing' };
  return { kind: 'course', reason: 'subject landing' };
}

/** Shallow walk under a root collecting every subdir that has an index.html. */
function walkRoot(rootName, maxDepth) {
  const out = [];
  if (fs.existsSync(path.join(ROOT, rootName, 'index.html'))) out.push(rootName + '/index.html');
  (function rec(absDir, relDir, depth) {
    if (depth > maxDepth) return;
    let entries;
    try { entries = fs.readdirSync(absDir, { withFileTypes: true }); } catch { return; }
    for (const e of entries) {
      if (!e.isDirectory() || e.name.startsWith('.')) continue;
      const abs = path.join(absDir, e.name);
      const rel = relDir + '/' + e.name;
      if (fs.existsSync(path.join(abs, 'index.html'))) out.push(rel + '/index.html');
      rec(abs, rel, depth + 1);
    }
  })(path.join(ROOT, rootName), rootName, 1);
  return out;
}

/** Discover EVERY hub-landing relative path across the whole _app tree. */
function discoverAll() {
  const tm = new TreeMapper({ rootPath: ROOT });
  const paths = tm.discoverHubs().map(h => h.path);         // houses/ (mapper)
  for (const e of fs.readdirSync(ROOT, { withFileTypes: true })) {
    if (!e.isDirectory() || e.name === 'houses' || e.name.startsWith('.')) continue;
    if (DENY_ROOTS.has(e.name)) continue;
    paths.push(...walkRoot(e.name, MAX_DEPTH));
  }
  return [...new Set(paths)];
}

function reconcile() {
  const reg = registryHrefs();
  const codeMap = registryCatalogCodes();
  const all = discoverAll().map(p => ({ path: p, href: norm('/' + p), ...classify(p) }));

  const courseHrefs = new Set(all.filter(x => x.kind === 'course').map(x => x.href));
  const childCount = {};
  for (const h of courseHrefs) {
    const parent = h.replace(/[^/]+\/$/, '');
    if (courseHrefs.has(parent)) childCount[parent] = (childCount[parent] || 0) + 1;
  }
  const isContainer = h => (childCount[h] || 0) >= 2;

  // collision-safe id: bare basename unless it collides with another course id
  // or an existing registry id, in which case qualify by immediate parent.
  const regIds = new Set([...reg].map(h => h.split('/').filter(Boolean).pop()));
  const baseCount = {};
  for (const h of courseHrefs) { const b = h.split('/').filter(Boolean).pop(); baseCount[b] = (baseCount[b] || 0) + 1; }
  // Ambiguous bare words that read badly / collide-prone as platform-wide ids —
  // parent-qualify them proactively (this registry grows in waves, so an id that is
  // unique today can collide with the next gap-fill). e.g. c → armory-c, math → cortex-math.
  const GENERIC_ID = new Set(['auth', 'design', 'math', 'advanced', 'agents', 'automation',
    'foundations', 'general', 'sql', 'capstone', 'intro', 'basics', 'overview']);
  function makeId(href) {
    const segs = href.split('/').filter(Boolean);
    const b = segs[segs.length - 1];
    if (baseCount[b] > 1 || regIds.has(b) || b.length <= 2 || GENERIC_ID.has(b))
      return (segs[segs.length - 2] || 'x') + '-' + b;
    return b;
  }

  const courses = all.filter(x => x.kind === 'course').map(x => {
    const parent = x.href.replace(/[^/]+\/$/, '');
    const title = titleOf(path.join(ROOT, x.href, 'index.html'));
    return {
      href: x.href,
      id: x.href.split('/').filter(Boolean).pop(),
      suggestedId: makeId(x.href),
      registered: reg.has(x.href),
      container: isContainer(x.href),
      parentHref: courseHrefs.has(parent) ? parent : null,
      title,
      dupOf: reg.has(x.href) ? null : dupOfRegistered(title, codeMap),
    };
  });

  // Gap = unregistered courses. Split out likely duplicates of a REGISTERED hub
  // (same cert code) so they are flagged for a human ruling, never blind-registered.
  const gapAll = courses.filter(c => !c.registered);
  const gap = gapAll.filter(c => !c.dupOf);
  const gapDuplicates = gapAll.filter(c => c.dupOf);

  // NON-CIRCULAR QC: registered hubs are ground truth. Any the detector can NOT
  // independently confirm as a course expose an idiom it may miss for UNregistered
  // courses (applet single-page apps, thin linear courses). Informational, not a
  // gate — the registry, not the detector, is authoritative for these.
  const byHref = Object.fromEntries(all.map(x => [x.href, x]));
  const registryBlind = [...reg].filter(h => {
    const onDisk = fs.existsSync(path.join(ROOT, h, 'index.html'));
    return onDisk && (!byHref[h] || byHref[h].kind !== 'course');
  }).map(h => ({ href: h, kind: byHref[h] ? byHref[h].kind : 'NOT-DISCOVERED', reason: byHref[h] ? byHref[h].reason : 'not reached by crawl' }));

  const discovered = new Set(all.map(x => x.href));
  const drift = [...reg].filter(h => !discovered.has(h) && !fs.existsSync(path.join(ROOT, h, 'index.html')));

  return {
    generated: new Date().toISOString(),
    counts: {
      discovered: all.length,
      house: all.filter(x => x.kind === 'house').length,
      plumbing: all.filter(x => x.kind === 'plumbing').length,
      redirect: all.filter(x => x.kind === 'redirect').length,
      chapter: all.filter(x => x.kind === 'chapter').length,
      course: courses.length,
      courseRegistered: courses.filter(c => c.registered).length,
      courseGap: gap.length,
      gapDuplicates: gapDuplicates.length,
      registryBlind: registryBlind.length,
      driftHrefs: drift.length,
    },
    gap, gapDuplicates, drift, registryBlind, all,
  };
}

function printSummary(r) {
  const c = r.counts;
  console.log('── catalog ↔ course-tree reconciliation ──');
  console.log(`  discovered landings : ${c.discovered}`);
  console.log(`  house / plumbing / redirect / chapter (skip) : ${c.house} / ${c.plumbing} / ${c.redirect} / ${c.chapter}`);
  console.log(`  COURSES             : ${c.course}  (${c.courseRegistered} in catalog, ${c.courseGap} MISSING, ${c.gapDuplicates} likely dup of a registered hub)`);
  if (c.registryBlind)
    console.log(`  note: ${c.registryBlind} registered hub(s) the detector can't self-confirm — registry-authoritative (see --validate)`);
  if (c.driftHrefs) console.log(`  registry href drift : ${c.driftHrefs} (points at a path with no index.html)`);
  console.log('\n  MISSING courses grouped by container:');
  const byParent = {};
  for (const g of r.gap) (byParent[g.parentHref || '(top-level)'] = byParent[g.parentHref || '(top-level)'] || []).push(g.suggestedId);
  for (const [p, kids] of Object.entries(byParent).sort((a, b) => b[1].length - a[1].length))
    console.log(`    ${p}  (${kids.length}): ${kids.sort().join(', ')}`);
  if (r.gapDuplicates.length) {
    console.log('\n  FLAGGED — likely duplicate of a registered hub (do NOT register; human ruling):');
    r.gapDuplicates.forEach(d => console.log(`    ${d.href}  ⇒ dup of "${d.dupOf.id}" (code ${d.dupOf.code})`));
  }
}

function printValidate(r) {
  console.log('── registered-hub validation (non-circular QC) ──');
  if (!r.registryBlind.length) { console.log('  CLEAN: the detector independently classifies every registered hub as a course.'); return; }
  console.log(`  ${r.registryBlind.length} registered hub(s) the detector can't self-confirm (registry is authoritative for these;`);
  console.log(`  each marks an idiom an UNregistered course could hide behind — review that the list stays small + explained):`);
  r.registryBlind.forEach(m => console.log(`    ${m.href}  → ${m.kind}  «${m.reason}»`));
}

if (require.main === module) {
  const args = process.argv.slice(2);
  const r = reconcile();
  if (args.includes('--gap')) r.gap.forEach(g => console.log(g.href));
  else if (args.includes('--validate')) printValidate(r);
  else printSummary(r);
  if (args.includes('--json')) {
    fs.mkdirSync(path.dirname(REPORT), { recursive: true });
    fs.writeFileSync(REPORT, JSON.stringify(r, null, 2));
    console.log('\n  wrote ' + path.relative(path.resolve(__dirname, '..', '..'), REPORT));
  }
}

module.exports = { reconcile, classify, isCourseLanding, isRedirect, norm, registryHrefs };
