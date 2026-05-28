#!/usr/bin/env node
/**
 * prog003-generic-batch.js — generalized PROG-003 cleanup across any house.
 *
 * Handles the per-pair pattern uniformly:
 *   - For each PROG-003 collision (key shared by 2+ files):
 *   - For each file in the collision, look up its catalog ID(s)
 *   - File where collision-key MATCHES one of its catalog IDs → KEEP
 *   - File where it doesn't match BUT has a unique catalog ID → RENAME to
 *     its catalog ID + add copyLegacyKey shim
 *   - File with NO catalog ID → SKIP (catalog-orphan, separate concern)
 *
 * Special-case skips:
 *   - Files under /clh/ (CLH 3-layer is intentional per
 *     reference_clh_three_layer_architecture.md)
 *   - Files where the rename would itself produce a new collision (rare;
 *     surface and skip)
 *
 * Usage:
 *   node _tools/quiz/prog003-generic-batch.js --house=<house> --dry-run
 *   node _tools/quiz/prog003-generic-batch.js --house=<house>
 *   node _tools/quiz/prog003-generic-batch.js --all --dry-run
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { execSync } = require('child_process');

const REPO_ROOT = path.resolve(__dirname, '../..');
const DRY_RUN = process.argv.includes('--dry-run');
const houseArg = process.argv.find(a => a.startsWith('--house='));
const HOUSE = houseArg ? houseArg.split('=')[1] : null;
const ALL = process.argv.includes('--all');

if (!HOUSE && !ALL) {
    console.error('usage: --house=<houseName> | --all');
    process.exit(1);
}

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
        hrefToIds.get(resolved).push({ id: mod.id, house: mod.house, category: mod.category });
    }
    return hrefToIds;
}

const hrefToIds = loadCatalog();

const searchRoot = HOUSE
    ? `_app/houses/${HOUSE}`
    : `_app/houses`;
const files = execSync(`find ${searchRoot} -name "*.html" -not -path "*_archive*" -not -path "*_source*"`, { encoding: 'utf8' }).trim().split('\n').filter(Boolean);

console.log('PROG-003 Generic Batch');
console.log('Mode:', DRY_RUN ? 'DRY RUN' : 'LIVE');
console.log('Scope:', HOUSE || 'all houses');
console.log('Files scanned:', files.length);
console.log('');

// Group files by progress key + house
const byKey = {};
for (const f of files) {
    const c = fs.readFileSync(f, 'utf8');
    const m = c.match(/ModuleProgress\.complete\(\s*['"]([^'"]+)['"]\s*,\s*['"]([^'"]+)['"]/);
    if (m) {
        const houseKey = m[1] + '|' + m[2];
        const relPath = f.replace(/^_app\//, '');
        if (!byKey[houseKey]) byKey[houseKey] = { houseArg: m[1], key: m[2], files: [] };
        byKey[houseKey].files.push({ relPath, absPath: f });
    }
}

// Find collisions, build plans
const plans = [];
const skipReasons = { clh: 0, noCollision: 0, noTarget: 0, alreadyAligned: 0, renameCollides: 0 };

for (const k of Object.keys(byKey)) {
    const entry = byKey[k];
    if (entry.files.length < 2) { skipReasons.noCollision++; continue; }
    // Skip CLH-intentional collisions
    if (entry.files.some(f => f.relPath.includes('/clh/'))) { skipReasons.clh++; continue; }
    // For each file, determine action
    for (const file of entry.files) {
        const ids = (hrefToIds.get(file.relPath) || []).map(x => x.id);
        if (ids.length === 0) { /* no catalog id — keep current key, leave the collision (caller can investigate) */ continue; }
        // If collision key matches one of this file's catalog IDs, KEEP it
        if (ids.includes(entry.key)) { skipReasons.alreadyAligned++; continue; }
        // Pick the most-specific catalog ID for this file (prefer -pres if present, else first)
        const target = ids.find(id => id.endsWith('-pres')) || ids[0];
        // Sanity: verify target isn't already in use by another file in this same collision
        // (otherwise the rename produces a new collision)
        const renameCollidesWith = entry.files.find(other => other !== file && (hrefToIds.get(other.relPath) || []).some(x => x.id === target));
        if (renameCollidesWith) { skipReasons.renameCollides++; continue; }
        plans.push({
            collisionHouse: entry.houseArg,
            collisionKey: entry.key,
            targetKey: target,
            file,
        });
    }
}

console.log('Plans:', plans.length);
console.log('Skip reasons:', skipReasons);
console.log('');

// Group by house for readability
const planByHouse = {};
for (const p of plans) {
    const m = p.file.relPath.match(/houses\/([^/]+)\//);
    if (!m) continue;
    const h = m[1];
    if (!planByHouse[h]) planByHouse[h] = [];
    planByHouse[h].push(p);
}
console.log('Plans by house:');
for (const h of Object.keys(planByHouse).sort()) {
    console.log('  ' + h + ': ' + planByHouse[h].length);
}
console.log('');
console.log('Sample plans (first 10):');
for (const p of plans.slice(0, 10)) {
    console.log('  ' + p.file.relPath + ': ' + p.collisionKey + ' → ' + p.targetKey);
}
if (plans.length > 10) console.log('  ... and ' + (plans.length - 10) + ' more');
console.log('');

if (DRY_RUN) {
    console.log('DRY RUN — no files modified.');
    process.exit(0);
}

let wrote = 0;
for (const p of plans) {
    const c = fs.readFileSync(p.file.absPath, 'utf8');
    let newC = c;
    const fromS = `ModuleProgress.complete('${p.collisionHouse}', '${p.collisionKey}'`;
    const toS = `ModuleProgress.complete('${p.collisionHouse}', '${p.targetKey}'`;
    if (newC.indexOf(fromS) !== -1) {
        newC = newC.replace(fromS, toS);
    } else {
        const fromD = `ModuleProgress.complete("${p.collisionHouse}", "${p.collisionKey}"`;
        const toD = `ModuleProgress.complete("${p.collisionHouse}", "${p.targetKey}"`;
        if (newC.indexOf(fromD) === -1) {
            console.log('  WARN complete() not found:', p.file.relPath);
            continue;
        }
        newC = newC.replace(fromD, toD);
    }
    // Insert shim
    const shimMark = `copyLegacyKey('${p.collisionHouse}', '${p.collisionKey}', '${p.targetKey}')`;
    if (newC.indexOf(shimMark) === -1) {
        const completePos = newC.indexOf(toS) >= 0 ? newC.indexOf(toS) : newC.indexOf(`ModuleProgress.complete("${p.collisionHouse}", "${p.targetKey}"`);
        const lineStart = newC.lastIndexOf('\n', completePos) + 1;
        const indent = newC.slice(lineStart, completePos).match(/^(\s*)/)[1];
        const shim = `${indent}if (ModuleProgress.copyLegacyKey) ModuleProgress.copyLegacyKey('${p.collisionHouse}', '${p.collisionKey}', '${p.targetKey}');\n`;
        newC = newC.slice(0, lineStart) + shim + newC.slice(lineStart);
    }
    fs.writeFileSync(p.file.absPath, newC, 'utf8');
    wrote++;
}
console.log('Wrote', wrote, 'files.');
