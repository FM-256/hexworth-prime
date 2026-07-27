#!/usr/bin/env node
/**
 * gen-registry-entries.js — derive HubRegistry entry objects for the catalog GAP
 * found by gen-catalog-from-tree.js, so the ~84 missing courses are registered
 * from data (consistent labels/category/sortOrder), not hand-typed.
 *
 * Reads _tools/reports/CATALOG_TREE_RECON.json (run gen-catalog-from-tree --json
 * first). Emits, to stdout:
 *   1. registry entry lines (compact single-line form matching the derived block)
 *   2. the list of new reserved ids for firestore.rules parity
 * It does NOT edit HubRegistry or rules — review the output, then apply.
 *
 * Field derivation (all student-facing, spot-check before applying):
 *   id         : suggestedId from the report (collision-safe)
 *   category   : container → platform-hub ; cert-code in title → cert-prep ; else course
 *   label      : first title segment, trailing "Course/Track/Hub" stripped
 *   sublabel   : cert code (cert-prep) | parent container label (member) | house name
 *   catalogCode: the cert code, when category is cert-prep
 *   icon       : parent container icon (member) | house default icon
 *   hubHref    : the discovered href + index.html
 *   parent     : container id, when the course is a member of a registered container
 *   origin     : 'derived'  ·  tenantAssignable: true  ·  sortOrder: 400+ sequential
 */
'use strict';
const fs = require('fs');
const path = require('path');

const REPORT = path.resolve(__dirname, '..', 'reports', 'CATALOG_TREE_RECON.json');
const REGISTRY = path.resolve(__dirname, '..', '..', '_app', 'components', 'HubRegistry.js');

// For CATEGORY only: a real vendor cert code is HYPHENATED (MS-102, SC-200, PL-300,
// AI-900, 200-301). Solid college-course codes (CGS1000C, CTS1328C, COP1034C) are
// NOT certs — the existing registry files those as category:'course'. So requiring a
// hyphen matches the platform's own convention and stops CGS1000C being mis-tagged.
const VENDOR_CERT = /\b[A-Z]{2,4}-\d{2,4}[A-Z]?\b|\b\d{3}-\d{2,4}\b/;

// Title segments to drop when extracting a label: boilerplate, house names, bare codes.
const HOUSE_SEG = /^(the\s+)?(forge|eye|backbone|cortex|code\s+armory|proving\s+grounds|matrix|shield|cloud|script|web|divergent|key|dark\s+arts|signal|arctic|wireshark|machine|hive)$/i;
const isDropSeg = s => /^hexworth prime$/i.test(s) || /^house of /i.test(s) || HOUSE_SEG.test(s)
  || /^[A-Z]{2,4}-?\d{2,4}[A-Z]?$/.test(s) || /^\d{3}-\d{2,4}$/.test(s);
const stripDashes = s => (s || '').replace(/\s*[—–]\s*/g, ': ').trim(); // no em/en dashes in output

// Parse existing registry: id → {label, icon, href} so we can resolve container
// labels/icons and a per-house default icon for standalone courses.
const normLabel = s => (s || '').toLowerCase().replace(/^the\s+/, '').replace(/[^a-z0-9]+/g, '');

function parseRegistry() {
  const src = fs.readFileSync(REGISTRY, 'utf8');
  const byId = {}, byHref = {}, houseIcon = {}, labels = new Set();
  const re = /id:\s*['"]([^'"]+)['"][\s\S]*?label:\s*['"]([^'"]*)['"][\s\S]*?icon:\s*['"]([^'"]*)['"][\s\S]*?hubHref:\s*['"]([^'"]+)['"]/g;
  for (const m of src.matchAll(re)) {
    const [, id, label, icon, href] = m;
    const h = ('/' + href.replace(/^\/+/, '')).replace(/index\.html$/, '').replace(/\/+$/, '/');
    byId[id] = { label, icon, href: h };
    byHref[h] = { id, label, icon };
    labels.add(normLabel(label));
    const house = h.startsWith('/houses/') ? h.split('/')[2] : h.split('/')[1];
    if (house && !houseIcon[house]) houseIcon[house] = icon; // first-seen icon per house
  }
  // Highest sortOrder already in use, so a new wave starts strictly above it (this
  // is the 3rd derived wave; hardcoding a floor collided with waves 1-2 at 400+).
  const maxOrder = Math.max(0, ...[...src.matchAll(/sortOrder:\s*(\d+)/g)].map(m => +m[1]));
  return { byId, byHref, houseIcon, labels, maxOrder };
}

function decodeEntities(s) {
  return (s || '')
    .replace(/&mdash;/g, '—').replace(/&ndash;/g, '–').replace(/&amp;/g, '&')
    .replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&nbsp;/g, ' ');
}

// Meaningful title segments, boilerplate/house/code segments removed, in order.
function labelSegs(title) {
  return decodeEntities(title)
    .split(/\s*[|—–]\s*|\s*\/\/\s*|\s+-{1,2}\s+/)
    .map(s => s.trim()).filter(Boolean).filter(s => !isDropSeg(s));
}
function cleanLabel(title) {
  const segs = labelSegs(title);
  let s = (segs[0] || decodeEntities(title))
    .replace(/^[A-Z]{2,5}-?\d+:\s*/, '')             // drop leading module number "API-2: "
    .replace(/\s*\([^)]*\)\s*$/, '')                 // drop trailing "(N10-009)"
    .replace(/\s+(Course|Track|Hub|Path|Lab)$/i, '') // drop trailing type word
    .trim();
  return stripDashes(s) || stripDashes(decodeEntities(title));
}
// The next distinguishing segment, used to disambiguate a label that collides.
function nextSeg(title) { return labelSegs(title)[1] || null; }

// House display names (2-letter acronyms upper-cased, "the" prefixes preserved).
const HOUSE_LABEL = {
  ai: 'AI', web: 'Web', code: 'Code', cloud: 'Cloud', eye: 'The Eye', forge: 'The Forge',
  script: 'Script', shield: 'Shield', matrix: 'Matrix', divergent: 'Divergent', key: 'Key',
  'dark-arts': 'Dark Arts', signal: 'Signal', arctic: 'Arctic', wireshark: 'Wireshark', projects: 'Projects',
};
function prettyHouse(house) {
  return HOUSE_LABEL[house] || (house || '').replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function main() {
  const r = JSON.parse(fs.readFileSync(REPORT, 'utf8'));
  const { byHref, houseIcon, labels, maxOrder } = parseRegistry();
  const usedLabels = new Set(labels); // existing + batch labels, to keep each card distinct

  // Excluded by ruling: WSA is a COURSE (already registered), so these two are its
  // internal checkpoint/exercise pages (modules), not standalone catalog courses —
  // the density fallback surfaced them; a human ruling keeps them out.
  const SKIP = new Set([
    '/houses/cloud/modules/wsa/gauntlet-advanced/',
    '/houses/cloud/modules/wsa/midterm-outpost/',
  ]);

  // containers among the gap (e.g. cloud/api) register as platform-hub FIRST, and
  // are added to the parent lookup so their own members can link parent:'<id>'
  // in the same batch (byHref only knows already-registered hubs otherwise).
  const items = r.gap.filter(g => !SKIP.has(g.href)).sort((a, b) => (b.container ? 1 : 0) - (a.container ? 1 : 0));
  for (const g of items) if (g.container) byHref[g.href] = { id: g.suggestedId, label: cleanLabel(g.title) };
  // Start strictly above the highest existing sortOrder, stepping by 10 (registry
  // convention), so this wave never collides with earlier ones.
  let order = Math.ceil((maxOrder + 10) / 10) * 10;
  const lines = [];
  const ids = [];

  for (const g of items) {
    const href = g.href + 'index.html';
    const house = g.href.startsWith('/houses/') ? g.href.split('/')[2] : g.href.split('/')[1];
    const parentReg = g.parentHref ? byHref[g.parentHref] : null;
    const codeTok = (g.title.match(VENDOR_CERT) || [])[0];   // hyphenated vendor code only
    const isCert = !g.container && !!codeTok;

    const category = g.container ? 'platform-hub' : (isCert ? 'cert-prep' : 'course');

    // Label: keep each catalog card distinct. If the derived label collides with an
    // existing/earlier hub label, append its next distinguishing title segment.
    let label = cleanLabel(g.title);
    if (usedLabels.has(normLabel(label))) {
      const nx = nextSeg(g.title);
      if (nx && normLabel(nx) !== normLabel(label)) label = stripDashes(`${label}: ${nx}`);
    }
    usedLabels.add(normLabel(label));

    // Sublabel: cert code | parent container | house — but never a restatement of the
    // label itself (that produced the "Signal Toolkit / Signal Toolkit" collision).
    let sublabel = isCert ? codeTok : (parentReg ? parentReg.label : prettyHouse(house));
    if (!isCert && normLabel(label).includes(normLabel(sublabel))) sublabel = prettyHouse(house);
    sublabel = stripDashes(sublabel);
    const icon = (parentReg && parentReg.icon) || houseIcon[house] || '/assets/images/icons/icon-book.webp';

    const fields = [`id: '${g.suggestedId}'`, `origin: 'derived'`, `category: '${category}'`];
    if (isCert) fields.push(`catalogCode: '${codeTok}'`);
    fields.push(`label: '${label.replace(/'/g, "\\'")}'`, `sublabel: '${sublabel.replace(/'/g, "\\'")}'`,
      `icon: '${icon}'`, `hubHref: '${href}'`);
    if (parentReg) fields.push(`parent: '${parentReg.id}'`);
    fields.push(`tenantAssignable: true`, `sortOrder: ${order}`);
    lines.push('        { ' + fields.join(', ') + ' },');
    ids.push(g.suggestedId);
    order += 1;
  }

  console.log(`// ${lines.length} derived catalog entries (gap). Review labels/categories before applying.\n`);
  console.log(lines.join('\n'));
  console.log(`\n// firestore.rules reserved ids to add (${ids.length}):`);
  console.log(ids.map(i => `'${i}'`).join(', '));
  console.log(`\n// category tally:`);
  const tally = {};
  lines.forEach(l => { const c = (l.match(/category: '([^']+)'/) || [])[1]; tally[c] = (tally[c] || 0) + 1; });
  console.log('// ' + JSON.stringify(tally));
}

main();
