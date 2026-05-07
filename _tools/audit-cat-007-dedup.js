#!/usr/bin/env node
/**
 * audit-cat-007-dedup.js — analysis tool for CAT-007 duplicate catalog ids
 *
 * For each (house, href) pair that has ≥2 catalog entries, finds the
 * reference count of each id across the codebase. The most-referenced id
 * is the canonical winner; the others are remove candidates (but only
 * "safely removable" if their ref count is 0 — this audit usually finds
 * non-zero refs, meaning a rename migration is required).
 *
 * Use:
 *   node _tools/audit-cat-007-dedup.js               # human-readable
 *   node _tools/audit-cat-007-dedup.js --json        # machine-readable
 *
 * Read-only. Reports to stdout. Ref counts come from grep over
 * `_app/` and `_tools/` (excluding ContentCatalog.js itself).
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const REPO = path.resolve(__dirname, '..');
const CATALOG = path.join(REPO, '_app/components/ContentCatalog.js');

const JSON_MODE = process.argv.includes('--json');

function loadCatalogEntries() {
    const text = fs.readFileSync(CATALOG, 'utf8');
    const re = /\{\s*house:\s*['"]([^'"]+)['"]\s*,\s*id:\s*['"]([^'"]+)['"][^}]*href:\s*['"]([^'"]*)['"][^}]*\}/g;
    const entries = [];
    let m;
    while ((m = re.exec(text)) !== null) {
        entries.push({ house: m[1], id: m[2], href: m[3] });
    }
    return entries;
}

function refsInRepo(id) {
    try {
        const out = execSync(
            `grep -rn --include='*.html' --include='*.js' "${id}" "${REPO}/_app/" "${REPO}/_tools/" 2>/dev/null | grep -v 'ContentCatalog.js' | wc -l`,
            { encoding: 'utf8' }
        ).trim();
        return parseInt(out, 10);
    } catch (e) {
        return -1;
    }
}

function audit() {
    const entries = loadCatalogEntries();
    const groups = {};
    for (const e of entries) {
        const k = e.house + '|' + e.href;
        groups[k] = groups[k] || [];
        groups[k].push(e.id);
    }
    const dups = Object.entries(groups).filter(([k, ids]) => ids.length > 1);
    const report = [];
    for (const [key, ids] of dups) {
        const [house, href] = key.split('|');
        const counts = {};
        for (const id of ids) counts[id] = refsInRepo(id);
        const sorted = ids.slice().sort((a, b) => counts[b] - counts[a]);
        const canonical = sorted[0];
        const removeCandidates = sorted.slice(1);
        const allLosersAreZero = removeCandidates.every(id => counts[id] === 0);
        report.push({ house, href, canonical, canonicalRefs: counts[canonical],
                      removeCandidates: removeCandidates.map(id => ({ id, refs: counts[id] })),
                      safeRemove: allLosersAreZero });
    }
    return report;
}

const report = audit();

if (JSON_MODE) {
    console.log(JSON.stringify(report, null, 2));
} else {
    console.log('');
    console.log('CAT-007 DEDUP AUDIT');
    console.log('─'.repeat(72));
    let safeCount = 0, riskyCount = 0;
    for (const r of report) {
        console.log('');
        console.log('  ' + r.house + ' :: ' + r.href);
        console.log('    KEEP:   ' + r.canonical.padEnd(40) + 'refs=' + r.canonicalRefs);
        for (const c of r.removeCandidates) {
            const tag = c.refs === 0 ? '(safe-remove)' : '(rename-migration required)';
            console.log('    REMOVE: ' + c.id.padEnd(40) + 'refs=' + String(c.refs).padStart(3) + '  ' + tag);
        }
        if (r.safeRemove) safeCount++; else riskyCount++;
    }
    console.log('');
    console.log('─'.repeat(72));
    console.log('  Total duplicate groups: ' + report.length);
    console.log('  Safe-remove (loser has 0 refs):       ' + safeCount);
    console.log('  Rename-migration required (≥1 ref):   ' + riskyCount);
    console.log('');
    console.log('  Safe removals can be applied directly. Migration cases need:');
    console.log('    1. Update all references from loser-id to canonical-id');
    console.log('    2. Remove loser entry from ContentCatalog.js');
    console.log('    3. Verify nothing else broke');
    console.log('');
}
