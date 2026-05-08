#!/usr/bin/env node
/**
 * heur-025-fix-strategy1.js — apply Strategy 1 HEUR-025 fixes
 *
 * Reads _tools/reports/heur-025-2026-05-08.json (full validator output),
 * filters to Strategy 1 (high-precision data-module + href pairs), and
 * for each finding, opens the target file and changes the
 * ModuleProgress.complete() second arg from the current write-key to
 * the hub-expected key.
 *
 * Safety:
 * - Skip if target file has 0 or >1 matching complete() call (ambiguous)
 * - Skip if the regex doesn't uniquely identify the line
 * - Skip if newKey already appears in file (already partially fixed)
 * - Print a per-file report; mutate files in place; user runs git diff to review
 *
 * Phase 1 ONLY: write-key edits, no migrateLegacyKey blocks
 * (FirestoreManager cloud-sync ping-pong concern, see
 * reference_firestore_sync_migration_pingpong.md).
 *
 * Usage:
 *   node _tools/reports/heur-025-fix-strategy1.js [--dry-run]
 */

const fs = require('fs');
const path = require('path');

const FINDINGS_FILE = path.resolve(__dirname, 'heur-025-2026-05-08.json');
const REPO_ROOT = path.resolve(__dirname, '../..');
const DRY_RUN = process.argv.includes('--dry-run');

const findings = JSON.parse(fs.readFileSync(FINDINGS_FILE, 'utf8'));

// Strategy 1: messages contain "but X.html saves as" with a specific filename
const s1Raw = findings.filter(x => /but [^\s]+\.html saves as/.test(x.message));

// Pre-flight: detect dual-target files (one file referenced by multiple hub keys).
// The first single-key fix would leave the second card without checkmark.
// Skip these — they need operator decision (split file? pick winner? stay broken?).
const targetMap = new Map();
for (const f of s1Raw) {
    const m = f.message.match(/hub expects "([^"]+)" but ([^\s]+\.html) saves as "([^"]+)"/);
    if (!m) continue;
    const [, hubKey, basename] = m;
    const hubContent = fs.readFileSync(f.hub, 'utf8');
    const escBn = basename.replace(/\./g, '\\.');
    const re = new RegExp('href="([^"]+' + escBn + ')"[^>]*data-module="' + hubKey + '"');
    const re2 = new RegExp('data-module="' + hubKey + '"[^>]*href="([^"]+' + escBn + ')"');
    const hm = hubContent.match(re) || hubContent.match(re2);
    if (!hm) continue;
    const tp = path.resolve(path.dirname(f.hub), hm[1]);
    if (!targetMap.has(tp)) targetMap.set(tp, []);
    targetMap.get(tp).push(hubKey);
}
const dualTargetFiles = new Set();
for (const [tp, keys] of targetMap) {
    if (keys.length > 1) dualTargetFiles.add(tp);
}

const s1 = s1Raw.filter(f => {
    const m = f.message.match(/but ([^\s]+\.html) saves as/);
    if (!m) return true;
    const hubContent = fs.readFileSync(f.hub, 'utf8');
    const hubKey = f.message.match(/hub expects "([^"]+)"/)[1];
    const basename = m[1];
    const escBn = basename.replace(/\./g, '\\.');
    const re = new RegExp('href="([^"]+' + escBn + ')"[^>]*data-module="' + hubKey + '"');
    const re2 = new RegExp('data-module="' + hubKey + '"[^>]*href="([^"]+' + escBn + ')"');
    const hm = hubContent.match(re) || hubContent.match(re2);
    if (!hm) return true;
    const tp = path.resolve(path.dirname(f.hub), hm[1]);
    return !dualTargetFiles.has(tp);
});

console.log('Total findings:', findings.length);
console.log('Strategy 1 raw (high-precision):', s1Raw.length);
console.log('Dual-target files excluded (need operator decision):', dualTargetFiles.size);
console.log('Strategy 1 fixable (single-target):', s1.length);
console.log(DRY_RUN ? '*** DRY RUN — no files modified ***' : '*** APPLYING FIXES ***');
console.log('---');

let applied = 0;
let skipped = 0;
const skipReasons = {};

for (const f of s1) {
    // Parse out the hub-expected ID and current write-key from the message.
    // Format: hub expects "X" but Y.html saves as "Z" — completions will silently fail
    const m = f.message.match(/hub expects "([^"]+)" but ([^\s]+\.html) saves as "([^"]+)"/);
    if (!m) {
        const reason = 'unparseable-message';
        skipReasons[reason] = (skipReasons[reason] || 0) + 1;
        skipped++;
        continue;
    }
    const [, hubKey, basename, currentKey] = m;

    // Resolve target file: hub is at f.hub, the basename is the href target.
    // We need the FULL relative href to resolve. The validator stored only basename in message.
    // Strategy: parse the hub HTML and find the matching href + data-module pair.
    const hubContent = fs.readFileSync(f.hub, 'utf8');
    const hrefRe = new RegExp('href="([^"]+' + basename.replace(/\./g, '\\.') + ')"[^>]*data-module="' + hubKey + '"');
    const hrefRe2 = new RegExp('data-module="' + hubKey + '"[^>]*href="([^"]+' + basename.replace(/\./g, '\\.') + ')"');
    const hrefMatch = hubContent.match(hrefRe) || hubContent.match(hrefRe2);
    if (!hrefMatch) {
        const reason = 'href-not-found-in-hub';
        skipReasons[reason] = (skipReasons[reason] || 0) + 1;
        skipped++;
        continue;
    }
    const href = hrefMatch[1];
    const targetPath = path.resolve(path.dirname(f.hub), href);
    if (!fs.existsSync(targetPath)) {
        const reason = 'target-file-missing';
        skipReasons[reason] = (skipReasons[reason] || 0) + 1;
        skipped++;
        continue;
    }

    const targetContent = fs.readFileSync(targetPath, 'utf8');

    // Build the exact match pattern: ModuleProgress.complete('xxx', 'currentKey'
    // We replace ONLY the moduleId (second arg). Preserve quotes + first arg.
    const escapedCurrent = currentKey.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const findRe = new RegExp("(ModuleProgress\\.complete\\s*\\(\\s*['\"][^'\"]*['\"]\\s*,\\s*['\"])" + escapedCurrent + "(['\"])", 'g');
    const matches = [...targetContent.matchAll(findRe)];

    if (matches.length === 0) {
        const reason = 'write-key-not-found-in-target';
        skipReasons[reason] = (skipReasons[reason] || 0) + 1;
        console.log('SKIP', path.relative(REPO_ROOT, targetPath), '— write-key not in file');
        skipped++;
        continue;
    }
    if (matches.length > 1) {
        const reason = 'multiple-matches';
        skipReasons[reason] = (skipReasons[reason] || 0) + 1;
        console.log('SKIP', path.relative(REPO_ROOT, targetPath), '— multiple complete() calls with same key');
        skipped++;
        continue;
    }

    // Safety check: don't introduce a duplicate key
    const newKeyRe = new RegExp("ModuleProgress\\.complete\\s*\\(\\s*['\"][^'\"]*['\"]\\s*,\\s*['\"]" + hubKey.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + "['\"]");
    if (newKeyRe.test(targetContent)) {
        const reason = 'newkey-already-present';
        skipReasons[reason] = (skipReasons[reason] || 0) + 1;
        console.log('SKIP', path.relative(REPO_ROOT, targetPath), '— newKey already present');
        skipped++;
        continue;
    }

    // Apply the replacement
    const newContent = targetContent.replace(findRe, '$1' + hubKey + '$2');
    if (!DRY_RUN) {
        fs.writeFileSync(targetPath, newContent, 'utf8');
    }
    console.log((DRY_RUN ? 'WOULD' : 'APPLY'), path.relative(REPO_ROOT, targetPath), ':', currentKey, '->', hubKey);
    applied++;
}

console.log('---');
console.log('Applied:', applied);
console.log('Skipped:', skipped);
if (Object.keys(skipReasons).length) {
    console.log('Skip reasons:');
    Object.entries(skipReasons).forEach(([r, n]) => console.log('  ' + n + ' ' + r));
}
