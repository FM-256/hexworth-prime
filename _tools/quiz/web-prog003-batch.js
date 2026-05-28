#!/usr/bin/env node
/**
 * web-prog003-batch.js — Close PROG-003 collisions for the web-presentation
 *                       FLAT-vs-network-plus pair cluster.
 *
 * Pattern (decoded after the earlier failed batch + the manual web-arp fix
 * shipped in commit c8ebc5558):
 *
 *   FLAT file:         houses/web/presentations/web-{topic}.presentation.html
 *     catalog ID:      web-{topic}-pres
 *     CURRENT key:     web-{topic}    ← collides with network-plus pair
 *     TARGET key:      web-{topic}-pres
 *
 *   Network-plus pair: houses/web/network-plus/presentations/{topic}.presentation.html
 *     catalog ID:      web-{topic}
 *     key:             web-{topic}     ← unchanged
 *
 * Per-pair edit applied to the FLAT file:
 *   1. ModuleProgress.complete('web', 'web-{topic}', ...) →
 *      ModuleProgress.complete('web', 'web-{topic}-pres', ...)
 *   2. Insert copyLegacyKey shim BEFORE the complete() call:
 *      if (ModuleProgress.copyLegacyKey) ModuleProgress.copyLegacyKey('web', 'web-{topic}', 'web-{topic}-pres');
 *
 * Safety:
 *   - Verifies catalog HAS web-{topic}-pres pointing at the flat file BEFORE
 *     editing. Skips files where the pattern doesn't match.
 *   - Verifies file currently calls complete() with the collision key. Skips
 *     idempotent re-runs.
 *   - --dry-run shows exact edits without writing.
 *
 * Usage:
 *   node _tools/quiz/web-prog003-batch.js --dry-run
 *   node _tools/quiz/web-prog003-batch.js
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const REPO_ROOT = path.resolve(__dirname, '../..');
const DRY_RUN = process.argv.includes('--dry-run');

// Load catalog to verify target IDs exist
const NamingValidator = require(path.join(REPO_ROOT, '_tools/eduscan/validators/syntax/naming.js'));
const catalogHrefs = NamingValidator.buildCatalogHrefSet(path.join(REPO_ROOT, '_app'));

// Parse catalog to extract all id -> href mappings
function loadCatalog() {
    const code = fs.readFileSync(path.join(REPO_ROOT, '_app/components/ContentCatalog.js'), 'utf8');
    const ctx = vm.createContext({ window: {} });
    vm.runInContext(code, ctx);
    const cat = ctx.window.ContentCatalog;
    const idToHref = new Map();
    const hrefToId = new Map();
    for (const mod of cat.MODULES) {
        const house = cat.HOUSES[mod.house];
        if (!house || !mod.href) continue;
        const resolved = NamingValidator._resolveCatalogHref(house.basePath, mod.href);
        if (!resolved) continue;
        idToHref.set(mod.id, resolved);
        if (!hrefToId.has(resolved)) hrefToId.set(resolved, []);
        hrefToId.get(resolved).push(mod.id);
    }
    return { idToHref, hrefToId };
}

const { idToHref, hrefToId } = loadCatalog();

// Find all FLAT-pair files: houses/web/presentations/web-*.presentation.html
const flatFiles = fs.readdirSync(path.join(REPO_ROOT, '_app/houses/web/presentations'))
    .filter(f => /^web-.+\.presentation\.html$/.test(f))
    .map(f => `houses/web/presentations/${f}`);

console.log('Web PROG-003 Batch (FLAT-pair → -pres key)');
console.log('═══════════════════════════════════════════');
console.log('Mode:', DRY_RUN ? 'DRY RUN' : 'LIVE');
console.log('Candidate FLAT files found:', flatFiles.length);
console.log('');

let plans = [];
let skipped_pattern = 0, skipped_idempotent = 0, skipped_catalog = 0;

for (const flatPath of flatFiles) {
    const fileTopic = flatPath.match(/web-(.+)\.presentation\.html$/)[1];
    const flatCatalogId = 'web-' + fileTopic + '-pres';
    const collisionKey = 'web-' + fileTopic;
    const targetKey = flatCatalogId;

    // Verify catalog has the target ID pointing at this file
    const expectedHref = idToHref.get(flatCatalogId);
    if (expectedHref !== flatPath) {
        skipped_catalog++;
        continue;
    }

    const absFlat = path.join(REPO_ROOT, '_app', flatPath);
    const content = fs.readFileSync(absFlat, 'utf8');

    // Check current key in complete() call
    const completeRe = /ModuleProgress\.complete\(\s*['"]web['"]\s*,\s*['"]([^'"]+)['"]/;
    const m = content.match(completeRe);
    if (!m) {
        skipped_pattern++;
        continue;
    }
    if (m[1] === targetKey) {
        skipped_idempotent++;
        continue; // already fixed
    }
    if (m[1] !== collisionKey) {
        // Unexpected current key — skip rather than guess
        skipped_pattern++;
        console.log('  SKIP (unexpected key):', flatPath, 'current=' + m[1]);
        continue;
    }

    plans.push({
        flatPath, fileTopic, collisionKey, targetKey, content, absFlat,
    });
}

console.log('Plans:');
console.log('  to fix:', plans.length);
console.log('  skipped (no catalog match):', skipped_catalog);
console.log('  skipped (pattern mismatch):', skipped_pattern);
console.log('  skipped (already fixed):', skipped_idempotent);
console.log('');

if (plans.length === 0) {
    console.log('No work to do.');
    process.exit(0);
}

console.log('Plan preview:');
for (const p of plans.slice(0, 10)) {
    console.log('  ' + p.flatPath + ': key ' + p.collisionKey + ' → ' + p.targetKey);
}
if (plans.length > 10) console.log('  ... and ' + (plans.length - 10) + ' more');
console.log('');

if (DRY_RUN) {
    console.log('DRY RUN — no files modified.');
    process.exit(0);
}

// Apply
let wrote = 0;
for (const p of plans) {
    let newContent = p.content;
    // Step 1: rename the complete() key in-place
    const fromCall = `ModuleProgress.complete('web', '${p.collisionKey}'`;
    const toCall = `ModuleProgress.complete('web', '${p.targetKey}'`;
    if (newContent.indexOf(fromCall) === -1) {
        // Try double-quoted form
        const fromCallDq = `ModuleProgress.complete("web", "${p.collisionKey}"`;
        const toCallDq = `ModuleProgress.complete("web", "${p.targetKey}"`;
        if (newContent.indexOf(fromCallDq) === -1) {
            console.log('  WARN: complete() call not found in expected form:', p.flatPath);
            continue;
        }
        newContent = newContent.replace(fromCallDq, toCallDq);
    } else {
        newContent = newContent.replace(fromCall, toCall);
    }

    // Step 2: insert copyLegacyKey shim if not already present
    const shimMarker = `copyLegacyKey('web', '${p.collisionKey}', '${p.targetKey}')`;
    if (newContent.indexOf(shimMarker) === -1) {
        // Insert before the (now-renamed) complete() call. Find the line.
        const completePattern = newContent.indexOf(toCall);
        if (completePattern === -1) {
            console.log('  WARN: cannot locate renamed complete() to insert shim:', p.flatPath);
            continue;
        }
        // Find the start of the line containing complete()
        const lineStart = newContent.lastIndexOf('\n', completePattern) + 1;
        // Read the indentation of that line
        const indentMatch = newContent.slice(lineStart, completePattern).match(/^(\s*)/);
        const indent = indentMatch ? indentMatch[1] : '                ';
        const shim = `${indent}if (ModuleProgress.copyLegacyKey) ModuleProgress.copyLegacyKey('web', '${p.collisionKey}', '${p.targetKey}');\n`;
        newContent = newContent.slice(0, lineStart) + shim + newContent.slice(lineStart);
    }

    fs.writeFileSync(p.absFlat, newContent, 'utf8');
    wrote++;
    console.log('  WROTE', p.flatPath);
}

console.log('');
console.log('Wrote ' + wrote + ' files.');
