#!/usr/bin/env node
'use strict';
// EVERY CATALOG ENTRY MARKED `available` SHOULD BE REACHABLE BY CLICKING.
//
// WHY THIS EXISTS. Three instances were confirmed in ONE legacy tree in one afternoon
// (2026-08-01): cloud-ch12-aws-practitioner-final (a 20-question "final exam"),
// cloud-ch06-aws-tools, and cloud-ch11-automation. All three carry status:'available' in the
// live catalog, all three serve HTTP 200, all three are findable by catalog search, and none is
// click-reachable from its hub. Chris ruled that a pattern, not a one-off, and asked for a
// standing check rather than a cleanup.
//
// HOW THIS DIFFERS FROM strict-orphan-scanner.js, which already exists and is NOT redundant
// with this. That scanner asks "is this module CURATED -- does a recognised curriculum signal
// claim it". This asks the blunter question "does ANY page in the app link to this file at
// all". A module can be uncurated but clickable (4 of the 5 current cloud orphans are, via a
// hub in another house directory), and it can be curated-looking but unclickable. Two
// questions, two answers, both worth having.
//
// STATIC BY DESIGN, with a confirmation step. Walking ~4,000 catalog entries in a browser is
// not practical, so this greps for inbound references and reports candidates. A hit here is a
// STRONG signal but not proof -- pages that build cards at runtime are invisible to grep, which
// is exactly the trap that made a dead quiz look referenced earlier today (292 gitignored .bak
// files were matching). So anything flagged must be confirmed with:
//     BASE=https://hexworth.com node _tools/eduscan/smoke/reachability-walk.js <hub> <id>
//
// usage: node _tools/eduscan/catalog-reachability-audit.js [--limit N] [--json]
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '../..');
const APP = path.join(ROOT, '_app');
const CATALOG = path.join(APP, 'components/ContentCatalog.js');

// Directories whose contents are NOT served, so a reference from inside them proves nothing.
// firebase.json ignores _archive and _source; .bak files are ignored too and were actively
// poisoning greps until 292 of them were archived out of _app/components on 2026-08-01.
const DEAD_DIR = /(^|\/)(_archive|_source|_drafts)(\/|$)/;
const DEAD_FILE = /\.(bak|backup)$|\.bak\./;

function walk(dir, out) {
  let entries;
  try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch (e) { return out; }
  for (const e of entries) {
    const full = path.join(dir, e.name);
    const rel = path.relative(APP, full);
    if (DEAD_DIR.test(rel) || DEAD_FILE.test(e.name)) continue;
    if (e.isDirectory()) { walk(full, out); }
    else if (/\.(html|js|json)$/.test(e.name)) { out.push(full); }
  }
  return out;
}

function main() {
  const asJson = process.argv.includes('--json');
  const li = process.argv.indexOf('--limit');
  const LIMIT = li !== -1 ? Number(process.argv[li + 1]) : Infinity;

  // EVALUATE the catalog rather than regex-parsing it, the same way strict-orphan-scanner.js
  // does. A first pass here scraped entries with a brace-matching regex; it resolved only 56 of
  // 536 flagged ids back to a house basePath, because the shapes vary more than the pattern
  // assumed. Running the real file gives the real objects and removes a whole class of my own
  // parsing error -- of which today has produced twelve.
  const vm = require('vm');
  const ctx = vm.createContext({ window: {}, console });
  vm.runInContext(fs.readFileSync(CATALOG, 'utf8'), ctx);
  const catalog = ctx.window.ContentCatalog;
  if (!catalog || !Array.isArray(catalog.MODULES)) {
    console.error('  ContentCatalog failed to load -- this audit checked NOTHING.');
    process.exit(2);
  }
  const HOUSES = catalog.HOUSES || {};
  const entries = catalog.MODULES
    .filter((e) => e && e.href && e.status === 'available' && e.id)
    .map((e) => {
      // `|| default` is WRONG here: the platform house's basePath is the empty string (its
      // content lives at the app root, e.g. /career/index.html), and '' is falsy, so a `||`
      // fallback silently rewrote it to houses/platform/ and reported 9 real, HTTP-200 pages
      // as missing files. Check for absence explicitly, not for falsiness.
      const h = HOUSES[e.house];
      const bp = (h && typeof h.basePath === 'string') ? h.basePath : ('houses/' + e.house + '/');
      return { id: e.id, href: e.href, house: e.house, abs: path.join(APP, bp, e.href) };
    });

  // ONLY HTML, and only what appears inside an href/src attribute.
  //
  // The first version of this check read every served .html/.js/.json and asked "does the
  // basename appear anywhere in it". It reported ALL 3,289 available entries as referenced --
  // including the three that were independently PROVEN unreachable against production the same
  // afternoon. The reason: config/content-registry.js and data/accountability-map.json list
  // those files, and a registry naming a page is not a student being able to click it. A check
  // that cannot fail on a known-positive is decoration, and this one could not.
  const files = walk(APP, []).filter((f) => f !== CATALOG && /\.html$/.test(f));
  const hrefs = new Set();
  for (const f of files) {
    let t;
    try { t = fs.readFileSync(f, 'utf8'); } catch (e) { continue; }
    let a;
    const ATTR = /(?:href|src)\s*=\s*["']([^"']+)["']/g;
    while ((a = ATTR.exec(t)) !== null) {
      const v = a[1].split(/[?#]/)[0];
      if (v) hrefs.add(path.basename(v));
    }
  }

  // A detector that examined nothing must say so rather than reporting a clean bill of health.
  if (!entries.length || !files.length) {
    console.error('  parsed ' + entries.length + ' available entries across ' + files.length
      + ' files -- this audit checked NOTHING. Treat as a failure of the audit, not a pass.');
    process.exit(2);
  }

  const unreferenced = [];   // file exists, but nothing links it -- CANDIDATE, needs the walker
  const missingFile = [];    // catalog says available, file is not there at all -- hard defect
  for (const e of entries.slice(0, LIMIT)) {
    // Match on the filename appearing as a real href/src target somewhere in served HTML.
    // Deliberately NOT "the id appears somewhere in the file" -- that is what made the first
    // version report every entry as reachable, because registries mention ids constantly.
    const base = path.basename(e.href);
    // Two DIFFERENT defects, reported separately because they need different responses.
    // A missing FILE is unambiguous -- a student clicking it from search gets a 404, and no
    // runtime-built-card caveat applies. An unlinked but present file is a candidate only.
    if (!fs.existsSync(e.abs)) { missingFile.push(e); continue; }
    if (!hrefs.has(base)) unreferenced.push(e);
  }

  if (asJson) {
    console.log(JSON.stringify({
      checked: Math.min(entries.length, LIMIT), missingFile, unreferenced,
    }, null, 2));
  } else {
    console.log('\n  Catalog reachability audit');
    console.log('  ' + Math.min(entries.length, LIMIT) + " entries marked status:'available' checked against "
      + files.length + ' served HTML files\n');

    // Reported first and separately: this one needs no confirmation step.
    if (missingFile.length) {
      console.log('  ' + missingFile.length + " entry(s) are marked 'available' but THE FILE DOES NOT EXIST.");
      console.log('  A student who finds these by catalog search gets a 404. No caveat applies here.');
      for (const e of missingFile.slice(0, 40)) console.log('    ' + e.id.padEnd(38) + e.href);
      if (missingFile.length > 40) console.log('    ... and ' + (missingFile.length - 40) + ' more (use --json)');
      console.log('');
    }

    if (!unreferenced.length) {
      console.log('  Every available entry whose file exists is linked from served HTML.');
    } else {
      console.log('  ' + unreferenced.length + ' entry(s) exist but have NO inbound href from any served HTML:');
      for (const e of unreferenced.slice(0, 40)) console.log('    ' + e.id.padEnd(38) + e.href);
      if (unreferenced.length > 40) console.log('    ... and ' + (unreferenced.length - 40) + ' more (use --json)');
      console.log('\n  These are CANDIDATES, not verdicts. Pages that build their cards at runtime are');
      console.log('  invisible to a static scan. Confirm before acting on any of them:');
      console.log('    BASE=https://hexworth.com node _tools/eduscan/smoke/reachability-walk.js <startPath> <id> 2');
    }
  }
  process.exit((unreferenced.length || missingFile.length) ? 1 : 0);
}

main();
