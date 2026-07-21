#!/usr/bin/env node
/*
 * gen-content-docs.js — Assemble content-map.md + catalog-validation.md from the
 * ground-truth data produced by gen-content-audit.js. Every COUNT in the output
 * is computed from _tools/reports/content-audit-derived.json (no hand numbers).
 * The clearly-marked EDITORIAL blocks are curated analysis, refreshed by hand to
 * current reality; they carry no raw counts that would silently go stale.
 *
 * Run order:  node _tools/reports/gen-content-audit.js   (produces the data spine)
 *             node _tools/reports/gen-content-docs.js     (writes the two .md docs)
 */
const fs = require('fs');
const path = require('path');
const REPO = path.resolve(__dirname, '..', '..');
const D = require('./content-audit-derived.json');
const DATE = D.generated;

// ---- house display config -------------------------------------------------
// Primary houses (canonical curriculum houses that hold real content).
const HOUSE_ORDER = ['code', 'script', 'web', 'shield', 'cloud', 'forge', 'matrix', 'ai', 'eye', 'dark-arts', 'divergent', 'key'];
const HOUSE_LABEL = {
  code: 'Code', script: 'Script', web: 'Web', shield: 'Shield', cloud: 'Cloud',
  forge: 'Forge', matrix: 'Matrix', ai: 'AI', eye: 'Eye', 'dark-arts': 'Dark Arts (house)',
  divergent: 'Divergent', key: 'Key',
};
// Standalone hubs + support areas (everything not in HOUSE_ORDER, in display order).
const STANDALONE_ORDER = [
  ['dark-arts-hub', 'Dark Arts Hub / Vault'], ['arena', 'Arena / CTF'], ['signal-hub', 'Signal Hub'],
  ['projects', 'Projects Hub'], ['operator', 'Operator Hub'], ['dispatch', 'Dispatch'],
  ['wireshark', 'Wireshark Range'], ['arctic', 'Arctic'], ['components', 'Components'],
  ['tenant', 'Tenant'], ['workshop', 'Workshop'], ['career', 'Career'], ['root', 'Root pages'],
];
const TYPE_COLS = ['applet', 'lab', 'module', 'page', 'presentation', 'tool', 'mission', 'index'];

const n = x => (x || 0).toLocaleString('en-US');
// Pluralize a content-type label: index -> indexes, everything else -> +s.
const plural = (type, count) => count === 1 ? type : (type === 'index' ? 'indexes' : type + 's');
// Format a types-count object into a readable comma-joined content description
// (e.g. {lab:3, module:1} -> "3 labs, 1 module").
const desc = types => TYPE_COLS.filter(k => types[k]).map(k => `${types[k]} ${plural(k, types[k])}`).join(', ');
const m = D.houseTypeMatrix;

// ---- Module Counts by Hub — Houses table ----------------------------------
function housesTable() {
  const rows = [];
  const tot = { total: 0, applet: 0, lab: 0, module: 0, page: 0, presentation: 0, tool: 0, mission: 0, index: 0 };
  for (const h of HOUSE_ORDER) {
    const e = m[h]; if (!e) continue;
    const t = e.types;
    tot.total += e.total;
    for (const k of TYPE_COLS) tot[k] += t[k] || 0;
    rows.push(`| ${HOUSE_LABEL[h]} | ${n(e.total)} | ${n(t.applet)} | ${n(t.lab)} | ${n(t.module)} | ${n(t.page)} | ${n(t.presentation)} | ${n(t.tool)} | ${n(t.mission)} | ${n(t.index)} |`);
  }
  rows.push(`| **Houses Total** | **${n(tot.total)}** | **${n(tot.applet)}** | **${n(tot.lab)}** | **${n(tot.module)}** | **${n(tot.page)}** | **${n(tot.presentation)}** | **${n(tot.tool)}** | **${n(tot.mission)}** | **${n(tot.index)}** |`);
  return { table: rows.join('\n'), housesTotal: tot.total };
}

// ---- Standalone Hubs table ------------------------------------------------
function standaloneTable() {
  const rows = []; let total = 0;
  for (const [key, label] of STANDALONE_ORDER) {
    const e = m[key]; if (!e) continue;
    total += e.total;
    const t = e.types;
    rows.push(`| ${label} | ${n(e.total)} | ${desc(t)} |`);
  }
  // Catch-all so Houses + Standalone reconciles exactly to the grand total:
  // small cert-index stub pages, oasis/hive/observatory/admin/funding, etc.
  const housesTotalLocal = HOUSE_ORDER.reduce((a, h) => a + (m[h] ? m[h].total : 0), 0);
  const other = D.total_files - housesTotalLocal - total;
  if (other > 0) {
    rows.push(`| Other support & cert-index pages | ${n(other)} | cert landing stubs, oasis, hive, observatory, admin, misc |`);
    total += other;
  }
  return { table: rows.join('\n'), standaloneTotal: total };
}

// ---- House Content Breakdown (per-house top subdirs, real counts) ---------
function houseBreakdownSection() {
  const out = [];
  for (const h of HOUSE_ORDER) {
    const e = m[h]; if (!e) continue;
    out.push(`### ${HOUSE_LABEL[h]} (${n(e.total)} files)\n`);
    out.push('| Section | Files | Content |');
    out.push('|---------|-------|---------|');
    const subs = Object.entries(e.subdirs).filter(([k]) => k !== '(root)').slice(0, 12);
    for (const [key, v] of subs) {
      out.push(`| \`${key}\` | ${n(v.total)} | ${desc(v.types)} |`);
    }
    const rootBucket = e.subdirs['(root)'];
    if (rootBucket) {
      out.push(`| _(hub root)_ | ${n(rootBucket.total)} | ${desc(rootBucket.types)} |`);
    }
    out.push('');
  }
  return out.join('\n');
}

// ---- Standalone Hub Content (per-hub top subdirs) -------------------------
function standaloneBreakdownSection() {
  const out = [];
  for (const [key, label] of STANDALONE_ORDER) {
    const e = m[key]; if (!e || e.total < 5) continue;
    out.push(`### ${label} (${n(e.total)} files)\n`);
    out.push('| Section | Files | Content |');
    out.push('|---------|-------|---------|');
    const subs = Object.entries(e.subdirs).slice(0, 10);
    for (const [k, v] of subs) {
      const kk = k === '(root)' ? '_(hub root)_' : '`' + k + '`';
      out.push(`| ${kk} | ${n(v.total)} | ${desc(v.types)} |`);
    }
    out.push('');
  }
  return out.join('\n');
}

// ---- by_type one-liner ----------------------------------------------------
function byTypeLine() {
  return TYPE_COLS.filter(k => D.by_type[k]).map(k => `${n(D.by_type[k])} ${plural(k, D.by_type[k])}`).join(' · ');
}

const H = housesTable();
const S = standaloneTable();

// ========================= EDITORIAL (curated) =============================
// Refreshed by hand 2026-07-21. Contains analysis + relationships, not raw
// counts (the count-bearing sections above regenerate from real data).
const EDITORIAL_CROSSLINK = `## Cross-Link Table

Content that lives in one hub but is referenced or relevant to others.

| Module/Area | Primary Hub | Cross-linked Hubs | Relationship |
|-------------|-------------|-------------------|--------------|
| Cryptography labs | Key House | Shield House | Shield references crypto concepts; Key owns the deep-dive labs |
| A+ applets | Forge House | Cert: A+ Core 1 / Core 2 | Cert track index pages link to Forge content |
| CySA+ track | Eye House | Cert: CySA+ | Cert index aggregates Eye CySA content |
| Cloud Security Essentials | Cloud House | Cert: AWS CCP, AZ-900 | CSE modules span multiple cloud cert objectives |
| Linux CLI content | Script House | Arctic, Operator | Arctic districts + Operator missions curate paths through Script's Linux content |
| Networking fundamentals | Web House | Cert: Network+, CCNA | Cert indexes reference Web house modules |
| Security+ content | Shield House | Cert: Security+ | Shield applets mapped to SY0-701 objectives |
| Ethical hacking / offensive | Dark Arts (house + Vault) | Cert: CASP+ | Advanced attack content overlaps CASP+ objectives |
| Python content | Script + Code Houses | Projects Hub | Script owns fundamentals; Code owns engineering; Projects has capstones |
| MD-100 / MD-101 | Forge House | (standalone tracks) | Microsoft endpoint-admin tracks inside Forge |
| Linux security labs | Shield House, Dark Arts Vault | Script House | Offensive/defensive Linux labs reference Script CLI foundations |
| Bug Hunting Academy | Dark Arts Vault | Eye House | Bug hunting overlaps SOC detection engineering |
| Hardware / maker (ProtoCore, PiVerse) | Matrix House | Signal Hub | Embedded/electronics tracks complement Signal's RF/firmware work |
| Ethics & policy | Divergent House | Shield, Dark Arts | Governance/ethics framing for security and offensive work |
| API Security | Cloud House | Code, Shield Houses | API track touches DevOps (Code) and security (Shield) |
| Divergent capstones | Projects Hub | Multiple houses | Cross-domain projects not tied to one house |
| Malware analysis | Dark Arts Vault | Eye, Shield Houses | Malware modules relevant to SOC and defense |
| WiFi Arsenal | Dark Arts Vault | Web, Signal Hubs | Wireless attacks cross network (Web) and hardware (Signal) |
| Operator missions | Operator Hub | Script, Shield, Eye, Key | Missions span CLI, forensics, crypto, IR domains |
| Overwatch / CTF boxes | Arena, Dispatch | All houses | Live-fire boxes exercise skills from every curriculum house |
| Cortex ML/AI | AI House | Eye House | Cyber-ML track links to SOC / detection use cases |
`;

const EDITORIAL_CERT = `## Certification Track Mappings

Each cert-track index page aggregates content from its mapped houses (the cert pages
themselves hold no unique modules — they are landing/aggregation pages).

| Certification | Exam | Primary House | Supporting Content |
|---------------|------|---------------|--------------------|
| CompTIA A+ Core 1 | 220-1101 | Forge | A+ applets, hardware applets, hardware labs |
| CompTIA A+ Core 2 | 220-1102 | Forge | MD-100, system tools, Windows admin |
| CompTIA Network+ | N10-009 | Web | Presentations, labs, tools, Network Essentials |
| CompTIA Security+ | SY0-701 | Shield | Applet suites, Cyber Framework, Security 101 |
| Security+ Crypto | SY0-701 | Shield + Key | Shield crypto applets + Key labs |
| CompTIA CySA+ | CS0-003 | Eye | CySA track + CyberOps applets |
| CompTIA CASP+ | CAS-004 | Shield + Dark Arts | Advanced security + offensive techniques |
| CompTIA Linux+ | XK0-005 | Script | Linux Mastery, CLH, Linux labs |
| Cisco CCNA | 200-301 | Web | Backbone tracks, network simulators, routing/switching |
| AWS Cloud Practitioner | CLF-C02 | Cloud | WSA modules, AWS presentations, chapter tools |
| AWS Developer Associate | DVA-C02 | Cloud | API Security track, CSE modules |
| Azure Fundamentals | AZ-900 | Cloud | Azure presentations, cloud fundamentals |
| Cryptography Track | — | Key | Full Key house content |
| DevOps Fundamentals | — | Code | DevOps track |
| Security Operations | — | Eye | SOC labs, SIEM, threat hunting, log analysis |
`;

const EDITORIAL_COVERAGE = `## Coverage Summary by Domain

Depth ratings are editorial; file magnitudes track the regenerated tables above.

| Domain | Houses / Hubs | Depth |
|--------|---------------|-------|
| Linux / CLI | Script, Arctic, Operator, Dark Arts Vault | Deep — CLH, Linux Mastery, dozens of labs + offensive labs |
| Networking | Web (incl. Backbone) | Deep — Backbone tracks, presentations, tools, Network Essentials |
| Cybersecurity Fundamentals | Shield, Security 101, Cyber Framework | Deep — large applet suites, labs, framework modules |
| Programming | Code (Armory + Python), Script (Python) | Deep — many language tracks, Algorithm Chamber |
| Cloud Computing | Cloud, API Security | Deep — WSA, API, cloud tools, OpenStack |
| DevOps | Code (DevOps) | Deep — full section curriculum |
| AI / Machine Learning | AI (Cortex) | Deep — many Cortex tracks, labs, modules |
| SOC / Blue Team | Eye, CySA+ | Deep — CyberOps applets, CySA modules, labs |
| Offensive Security | Dark Arts (house + Vault) | Deep — Vault (Bug Hunting, EHE, WiFi Arsenal, gates), FEH |
| Cryptography | Key, Shield (crypto applets) | Deep — labs, applets, presentations |
| Hardware / IT Support | Forge, Signal | Deep — A+ applets, MD-100/101, Signal builds |
| Embedded / Maker | Matrix (ProtoCore, PiVerse) | Deep — Arduino, ESP32, MicroPython, electronics tracks |
| Ethics / Policy / Governance | Divergent | Moderate — ethics, cyber-policy, cyberspace governance |
| Digital Forensics | Eye (forensics) | Foundation — evidence, disk, memory tracks |
| CTF / Live-fire | Arena, Dispatch | Deep — large box catalog across both ranges |
| Capstone Projects | Projects | Broad — domain-tagged projects across all houses |
| Data Science | Matrix, Projects | Moderate — projects + adjacent Matrix content |
`;

const EDITORIAL_GAP = `## Gap Analysis

| Area | Status | Notes |
|------|--------|-------|
| Forensics | **Foundation** | Evidence / disk / memory tracks under \`houses/eye/forensics/\`; room to grow network + timeline forensics. |
| Cert landing pages | **Index-only** | Cert track pages aggregate from houses and hold no unique content by design. |
| Observatory | **Platform surface** | Analytics/telemetry house, not a curriculum content area. |
| Uncataloged HTML | **Tracked** | See catalog-validation.md — a large tail of on-disk pages (chapter sub-pages, generated views) is intentionally not in ContentCatalog. |
`;

// ========================= content-map.md ==================================
const contentMap = `# Content Map

> Master hub assignment for all ${n(D.total_files)} content files, with cross-link table and coverage summary.
> Regenerated from a live filesystem walk of \`_app/\` on ${DATE} via \`_tools/reports/gen-content-audit.js\` + \`gen-content-docs.js\`.
> Type by filename suffix; hub by path. Excludes \`_\`-prefixed dirs (archive, games-lab).

---

## Table of Contents

1. [Module Counts by Hub](#module-counts-by-hub)
2. [House Content Breakdown](#house-content-breakdown)
3. [Standalone Hub Content](#standalone-hub-content)
4. [Cross-Link Table](#cross-link-table)
5. [Certification Track Mappings](#certification-track-mappings)
6. [Coverage Summary by Domain](#coverage-summary-by-domain)

---

## Module Counts by Hub

### Houses (Primary Content)

| Hub | Total Files | Applets | Labs | Modules | Pages | Presentations | Tools | Missions | Index |
|-----|------------|---------|------|---------|-------|---------------|-------|----------|-------|
${H.table}

### Standalone Hubs & Support Areas

| Hub | Total Files | Primary Content Types |
|-----|------------|----------------------|
${S.table}
| **Standalone Total** | **${n(S.standaloneTotal)}** | — |

### Grand Total: ${n(D.total_files)} files

By type across the whole platform: ${byTypeLine()}.

---

## House Content Breakdown

Top sections per house by file count (live subdirectory tallies).

${houseBreakdownSection()}---

## Standalone Hub Content

${standaloneBreakdownSection()}---

${EDITORIAL_CROSSLINK}
---

${EDITORIAL_CERT}
---

${EDITORIAL_COVERAGE}
---

${EDITORIAL_GAP}
---

*Content Map — regenerated ${DATE} from \`CONTENT_AUDIT.json\` (${n(D.total_files)} files) + \`ContentCatalog.js\` (${n(D.catalog.total)} catalog modules). Count-bearing sections are machine-generated; cross-link / cert / coverage / gap sections are curated analysis.*
`;

// ========================= catalog-validation.md ===========================
const c = D.catalog;
const missingByHouse = {};
for (const mm of c.missingFile) (missingByHouse[mm.house] = missingByHouse[mm.house] || []).push(mm);
const missingRows = c.missingFile.slice(0, 60).map(mm => `| ${mm.house} | \`${mm.resolved}\` | ${mm.status} |`).join('\n');
const uncatRows = c.topUncatalogedAreas.slice(0, 30).map(([area, cnt]) => `| \`${area}\` | ${n(cnt)} |`).join('\n');

const catalogValidation = `# ContentCatalog Validation Report

**Date:** ${DATE}
**Wave:** CA-REGEN (auto-regenerated)
**Catalog:** \`_app/components/ContentCatalog.js\`
**Generator:** \`_tools/reports/gen-content-audit.js\`

---

## Summary

| Metric | Count |
|--------|-------|
| Total catalog modules | ${n(c.total)} |
| Modules marked \`available\` | ${n(c.available)} |
| Modules whose href resolves to an existing file | ${n(c.withExistingFile)} |
| Modules whose href is missing on disk | ${n(c.missingFileCount)} |
| Total HTML content files on disk (excl. \`_\`-dirs) | ${n(c.totalHtmlFiles)} |
| HTML files NOT referenced by the catalog | ${n(c.uncatalogedCount)} |

Href resolution: \`_app/\` + \`HOUSES[module.house].basePath\` + \`module.href\`.

---

## Entries Pointing to Missing Files

All ${n(c.missingFileCount)} entries below are catalog modules whose resolved href does
not exist on disk. Every one is currently marked \`coming-soon\` — placeholder catalog
rows for content not yet built (not broken links to shipped content).

| House | Resolved Path | Status |
|-------|---------------|--------|
${missingRows}

**Recommendation:** These are expected placeholders. Create the file before flipping a
row to \`available\`, or remove the row if the content is abandoned. EduScan rule CAT-004
tracks these continuously.

---

## HTML On Disk But Not In The Catalog

${n(c.uncatalogedCount)} HTML files exist under \`_app/\` that no catalog href points to.
This is largely intentional: chapter sub-pages, per-unit view fragments, generated
box/mission pages, and support surfaces are reachable through their parent module or hub
index rather than being catalog entries themselves. Largest uncataloged areas:

| Area | Uncataloged Files |
|------|-------------------|
${uncatRows}

**Recommendation:** Not every page needs a catalog entry. Review the largest areas only
if a track is meant to be independently discoverable via search/landing pages.

---

*Regenerated ${DATE} from \`ContentCatalog.js\` (${n(c.total)} modules) cross-referenced against a live \`_app/\` filesystem walk (${n(c.totalHtmlFiles)} HTML files). Reproduce with \`node _tools/reports/gen-content-audit.js\`.*
`;

fs.writeFileSync(path.join(REPO, '_docs/architecture/content-map.md'), contentMap);
fs.writeFileSync(path.join(REPO, '_docs/operations/catalog-validation.md'), catalogValidation);
console.log('Wrote _docs/architecture/content-map.md');
console.log('Wrote _docs/operations/catalog-validation.md');
console.log('houses total:', H.housesTotal, '| standalone total:', S.standaloneTotal, '| grand total:', D.total_files);
