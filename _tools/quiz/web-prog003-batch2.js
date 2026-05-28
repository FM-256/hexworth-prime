#!/usr/bin/env node
/**
 * web-prog003-batch2.js — Cluster B follow-up batch.
 *
 * Sibling to web-prog003-batch.js (Cluster A — 14 FLAT pairs shipped in
 * commit 79fd559e5). Cluster B has a different rename side:
 *
 *   FLAT file:         houses/web/presentations/web-{topic}.presentation.html
 *     catalog ID:      web-{topic}        ← key already MATCHES catalog
 *     CURRENT key:     web-{topic}        ← KEEP
 *
 *   Network-plus pair: houses/web/network-plus/presentations/{topic}.presentation.html
 *     catalog ID:      web-np-{topic}-pres
 *     CURRENT key:     web-{topic}        ← collides with FLAT
 *     TARGET key:      web-np-{topic}-pres
 *
 * Per-pair edit applied to the NETWORK-PLUS file:
 *   1. ModuleProgress.complete('web', 'web-{topic}', ...) →
 *      ModuleProgress.complete('web', 'web-np-{topic}-pres', ...)
 *   2. Insert copyLegacyKey shim:
 *      copyLegacyKey('web', 'web-{topic}', 'web-np-{topic}-pres')
 *
 * Safety same as batch1: verifies catalog has the target ID pointing at the
 * network-plus file before editing. Catalog-lookup-by-href, not ID-construction.
 *
 * Usage:
 *   node _tools/quiz/web-prog003-batch2.js --dry-run
 *   node _tools/quiz/web-prog003-batch2.js
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const REPO_ROOT = path.resolve(__dirname, '../..');
const DRY_RUN = process.argv.includes('--dry-run');

const NamingValidator = require(path.join(REPO_ROOT, '_tools/eduscan/validators/syntax/naming.js'));

function loadCatalog() {
    const code = fs.readFileSync(path.join(REPO_ROOT, '_app/components/ContentCatalog.js'), 'utf8');
    const ctx = vm.createContext({ window: {} });
    vm.runInContext(code, ctx);
    const cat = ctx.window.ContentCatalog;
    const hrefToIds = new Map();
    for (const mod of cat.MODULES) {
        const house = cat.HOUSES[mod.house];
        if (!house || !mod.href) continue;
        const resolved = NamingValidator._resolveCatalogHref(house.basePath, mod.href);
        if (!resolved) continue;
        if (!hrefToIds.has(resolved)) hrefToIds.set(resolved, []);
        hrefToIds.get(resolved).push({ id: mod.id, category: mod.category });
    }
    return hrefToIds;
}

const hrefToIds = loadCatalog();

console.log('Web PROG-003 Batch 2 (network-plus pair → -np-*-pres key)');
console.log('═══════════════════════════════════════════════════════════');
console.log('Mode:', DRY_RUN ? 'DRY RUN' : 'LIVE');
console.log('');

// Find current PROG-003 collisions in web house
const { execSync } = require('child_process');
const files = execSync('find _app/houses/web -name "*.html" -not -path "*_archive*" -not -path "*_source*"', { encoding: 'utf8' }).trim().split('\n').filter(Boolean);
const byKey = {};
for (const f of files) {
    const c = fs.readFileSync(f, 'utf8');
    const m = c.match(/ModuleProgress\.complete\(\s*['"]web['"]\s*,\s*['"]([^'"]+)['"]/);
    if (m) {
        const relPath = f.replace(/^_app\//, '');
        if (!byKey[m[1]]) byKey[m[1]] = [];
        byKey[m[1]].push({ relPath, absPath: f });
    }
}

const plans = [];
let skippedBatch1Match = 0;
let skippedNoCollision = 0;
let skippedNotPlusPair = 0;
let skippedNoTargetId = 0;

for (const collisionKey of Object.keys(byKey)) {
    if (byKey[collisionKey].length < 2) { skippedNoCollision++; continue; }
    // Identify which file in the pair is the network-plus pair
    // (path contains 'network-plus/presentations')
    const plusEntry = byKey[collisionKey].find(e => e.relPath.includes('network-plus/presentations'));
    if (!plusEntry) { skippedNotPlusPair++; continue; }
    // Look up the network-plus file's catalog ID
    const ids = hrefToIds.get(plusEntry.relPath) || [];
    // Find the `web-np-*-pres` id (the most-specific catalog id for this file)
    const targetIdEntry = ids.find(x => x.id.startsWith('web-np-') && x.id.endsWith('-pres'));
    if (!targetIdEntry) { skippedNoTargetId++; continue; }
    const targetKey = targetIdEntry.id;
    // Skip if already aligned (collisionKey already matches the target)
    if (collisionKey === targetKey) { skippedBatch1Match++; continue; }
    plans.push({
        collisionKey, targetKey,
        plusEntry,
    });
}

console.log('Plans:');
console.log('  to fix:', plans.length);
console.log('  skipped (no collision):', skippedNoCollision);
console.log('  skipped (no network-plus pair in collision):', skippedNotPlusPair);
console.log('  skipped (no web-np-*-pres target id):', skippedNoTargetId);
console.log('  skipped (already aligned):', skippedBatch1Match);
console.log('');
console.log('Plan preview:');
for (const p of plans.slice(0, 20)) {
    console.log('  ' + p.plusEntry.relPath + ': key ' + p.collisionKey + ' → ' + p.targetKey);
}
if (plans.length > 20) console.log('  ... and ' + (plans.length - 20) + ' more');
console.log('');

if (DRY_RUN) {
    console.log('DRY RUN — no files modified.');
    process.exit(0);
}

let wrote = 0;
for (const p of plans) {
    const content = fs.readFileSync(p.plusEntry.absPath, 'utf8');
    let newContent = content;
    const fromCall = `ModuleProgress.complete('web', '${p.collisionKey}'`;
    const toCall = `ModuleProgress.complete('web', '${p.targetKey}'`;
    if (newContent.indexOf(fromCall) === -1) {
        // try double quotes
        const fromCallDq = `ModuleProgress.complete("web", "${p.collisionKey}"`;
        const toCallDq = `ModuleProgress.complete("web", "${p.targetKey}"`;
        if (newContent.indexOf(fromCallDq) === -1) {
            console.log('  WARN: complete() not found:', p.plusEntry.relPath);
            continue;
        }
        newContent = newContent.replace(fromCallDq, toCallDq);
    } else {
        newContent = newContent.replace(fromCall, toCall);
    }
    // Insert copyLegacyKey shim if missing
    const shimMarker = `copyLegacyKey('web', '${p.collisionKey}', '${p.targetKey}')`;
    if (newContent.indexOf(shimMarker) === -1) {
        const completePos = newContent.indexOf(toCall);
        const lineStart = newContent.lastIndexOf('\n', completePos) + 1;
        const indent = newContent.slice(lineStart, completePos).match(/^(\s*)/)[1];
        const shim = `${indent}if (ModuleProgress.copyLegacyKey) ModuleProgress.copyLegacyKey('web', '${p.collisionKey}', '${p.targetKey}');\n`;
        newContent = newContent.slice(0, lineStart) + shim + newContent.slice(lineStart);
    }
    fs.writeFileSync(p.plusEntry.absPath, newContent, 'utf8');
    console.log('  WROTE', p.plusEntry.relPath);
    wrote++;
}
console.log('');
console.log('Wrote ' + wrote + ' files.');
