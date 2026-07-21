#!/usr/bin/env node
/*
 * gen-content-audit.js — Reproducible regenerator for the content inventory.
 *
 * Walks _app/, classifies every .html by TYPE (filename suffix) and HOUSE (path
 * prefix) using the exact taxonomy of the original CA-1 audit (2026-03-18), then:
 *   1. writes a fresh _tools/reports/CONTENT_AUDIT.json (the data spine), and
 *   2. writes _tools/reports/content-audit-derived.json — richer structured data
 *      (per-house per-subdir counts + ContentCatalog cross-reference) that the
 *      content-map.md and catalog-validation.md docs are assembled from.
 *
 * TAXONOMY (reverse-engineered + verified against the original audit):
 *   TYPE:  index.html -> index; *.applet/.lab/.module/.presentation/.tool/.mission.html
 *          -> that type; everything else (incl *.quiz.html, *.exam.html, plain .html) -> page
 *   HOUSE: houses/<X>/...        -> X            dark-arts/...   -> dark-arts-hub
 *          signal/...   -> signal-hub            forensics/...   -> forensics-hub
 *          <top-level>/... -> <top-level>        root file       -> root
 *   EXCLUDE: any path segment starting with "_" (archive, games-lab, lib), node_modules, .git
 *
 * Usage: node _tools/reports/gen-content-audit.js         (writes both JSON files)
 *        node _tools/reports/gen-content-audit.js --print (also prints a summary)
 */
const fs = require('fs');
const path = require('path');

const REPO = path.resolve(__dirname, '..', '..');
const APP = path.join(REPO, '_app');
const OUT_AUDIT = path.join(__dirname, 'CONTENT_AUDIT.json');
const OUT_DERIVED = path.join(__dirname, 'content-audit-derived.json');

// --- recursive walk of _app for .html, honoring the exclusion rule ---------
function walk(dir, rel, acc) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const name = entry.name;
    if (name === 'node_modules' || name === '.git') continue;
    if (name.startsWith('_')) continue; // _archive, _games-lab, _lib, etc.
    const abs = path.join(dir, name);
    const r = rel ? rel + '/' + name : name;
    if (entry.isDirectory()) walk(abs, r, acc);
    else if (entry.isFile() && name.endsWith('.html')) acc.push(r);
  }
  return acc;
}

// --- classifiers -----------------------------------------------------------
function classifyType(relPath) {
  const base = relPath.split('/').pop();
  if (base === 'index.html') return 'index';
  const m = base.match(/\.(applet|lab|module|presentation|tool|mission)\.html$/);
  return m ? m[1] : 'page';
}
function classifyHouse(relPath) {
  const parts = relPath.split('/');
  if (parts.length === 1) return 'root';
  const top = parts[0];
  if (top === 'houses') return parts[1];
  if (top === 'dark-arts') return 'dark-arts-hub';
  if (top === 'signal') return 'signal-hub';
  if (top === 'forensics') return 'forensics-hub';
  return top;
}

// --- build the audit -------------------------------------------------------
const paths = walk(APP, '', []).sort();
const files = paths.map(p => ({ path: p, type: classifyType(p), house: classifyHouse(p) }));

const by_type = {}, by_house = {};
for (const f of files) {
  by_type[f.type] = (by_type[f.type] || 0) + 1;
  by_house[f.house] = (by_house[f.house] || 0) + 1;
}
const sortObj = o => Object.fromEntries(Object.entries(o).sort((a, b) => b[1] - a[1]));

const audit = {
  audit_date: new Date().toISOString().slice(0, 10),
  wave: 'CA-REGEN',
  total_files: files.length,
  summary: { by_type: sortObj(by_type), by_house: sortObj(by_house) },
  files,
};
fs.writeFileSync(OUT_AUDIT, JSON.stringify(audit, null, 2));

// --- per-house per-subdir breakdown (for House Content Breakdown tables) ----
// Group each house's files by their most meaningful sub-path key.
function houseBreakdown(houseFiles, houseKey) {
  // Key = path with the house-locating prefix stripped, then first 2-3 segments.
  const buckets = {};
  for (const f of houseFiles) {
    let rel = f.path;
    if (rel.startsWith('houses/' + houseKey + '/')) rel = rel.slice(('houses/' + houseKey + '/').length);
    else if (houseKey === 'dark-arts-hub' && rel.startsWith('dark-arts/')) rel = rel.slice('dark-arts/'.length);
    else if (houseKey === 'signal-hub' && rel.startsWith('signal/')) rel = rel.slice('signal/'.length);
    else if (houseKey === 'forensics-hub' && rel.startsWith('forensics/')) rel = rel.slice('forensics/'.length);
    else if (rel.startsWith(houseKey + '/')) rel = rel.slice((houseKey + '/').length);
    const segs = rel.split('/');
    const key = segs.length === 1 ? '(root)' : segs.slice(0, Math.min(2, segs.length - 1)).join('/') + '/';
    if (!buckets[key]) buckets[key] = { total: 0, types: {} };
    buckets[key].total++;
    buckets[key].types[f.type] = (buckets[key].types[f.type] || 0) + 1;
  }
  return Object.fromEntries(Object.entries(buckets).sort((a, b) => b[1].total - a[1].total));
}
const filesByHouse = {};
for (const f of files) (filesByHouse[f.house] = filesByHouse[f.house] || []).push(f);
const houseTypeMatrix = {};
for (const [h, fl] of Object.entries(filesByHouse)) {
  const t = {};
  for (const f of fl) t[f.type] = (t[f.type] || 0) + 1;
  houseTypeMatrix[h] = { total: fl.length, types: t, subdirs: houseBreakdown(fl, h) };
}

// --- ContentCatalog cross-reference (for catalog-validation.md) -------------
global.window = {};
require(path.join(APP, 'components', 'ContentCatalog.js'));
const CC = global.window.ContentCatalog;
const MODULES = CC.MODULES;
const HOUSES = CC.HOUSES;
const stats = CC.getStats();

// A catalog module's href is relative to its house basePath:
//   full path (from _app root) = HOUSES[module.house].basePath + module.href
const fsHtmlSet = new Set(paths);
let missingFile = [], hasFile = 0;
const catalogHrefs = new Set();
for (const m of MODULES) {
  const href = (m.href || '').split('#')[0].split('?')[0];
  if (!href) continue;
  const basePath = (HOUSES[m.house] && HOUSES[m.house].basePath) || '';
  const full = basePath + href;
  catalogHrefs.add(full);
  if (fsHtmlSet.has(full) || fs.existsSync(path.join(APP, full))) hasFile++;
  else missingFile.push({ id: m.id, house: m.house, href, resolved: full, status: m.status });
}
// HTML files present on disk but NOT referenced by any catalog href.
const uncataloged = paths.filter(p => !catalogHrefs.has(p));
// Group uncataloged by house/top-2-segments to surface the big uncovered areas.
const uncatalogedByArea = {};
for (const p of uncataloged) {
  const segs = p.split('/');
  const area = segs.slice(0, Math.min(3, segs.length - 1)).join('/') + '/';
  uncatalogedByArea[area] = (uncatalogedByArea[area] || 0) + 1;
}
const topUncatalogedAreas = Object.entries(uncatalogedByArea)
  .sort((a, b) => b[1] - a[1]).slice(0, 40);

const derived = {
  generated: new Date().toISOString().slice(0, 10),
  total_files: files.length,
  by_type: sortObj(by_type),
  by_house: sortObj(by_house),
  houseTypeMatrix,
  catalog: {
    total: stats.total,
    available: MODULES.filter(m => m.status === 'available').length,
    byHouse: stats.byHouse,
    withExistingFile: hasFile,
    missingFileCount: missingFile.length,
    missingFile,
    totalHtmlFiles: files.length,
    uncatalogedCount: uncataloged.length,
    topUncatalogedAreas,
  },
};
fs.writeFileSync(OUT_DERIVED, JSON.stringify(derived, null, 2));

console.log('Wrote', path.relative(REPO, OUT_AUDIT), '(' + files.length + ' files)');
console.log('Wrote', path.relative(REPO, OUT_DERIVED));
if (process.argv.includes('--print')) {
  console.log('\nby_type:', JSON.stringify(by_type));
  console.log('total files:', files.length);
  console.log('catalog total:', stats.total, '| available:', derived.catalog.available,
    '| missing-file hrefs:', missingFile.length, '| uncataloged html:', uncataloged.length);
  console.log('\nby_house:', JSON.stringify(sortObj(by_house)));
}
