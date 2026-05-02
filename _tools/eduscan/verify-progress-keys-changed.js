#!/usr/bin/env node
/**
 * verify-progress-keys-changed.js — Pre-deploy verification tool.
 *
 * Walks every file modified between `master` and `HEAD` and reports any
 * `ModuleProgress.complete('h', 'KEY', ...)` literal where the (houseId, moduleId)
 * pair differs between master and the working tree.
 *
 * Used to confirm that no progress-key changes slipped through unaudited.
 * Output groups changes into: KNOWN (PROG-003 fix categories — documented in
 * stragglers-progress-safety-audit.md) vs UNKNOWN (must be reviewed).
 *
 * Usage:
 *   node _tools/eduscan/verify-progress-keys-changed.js
 *
 * Exit codes:
 *   0 = all key changes are KNOWN (in PROG-003 fix scope)
 *   1 = unknown key changes detected — operator must review before deploy
 *   2 = git command failed
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '../..');

// PROG-003 fix scope (per stragglers-progress-safety-audit.md Category A)
function inKnownPROG003Scope(filePath, oldKey, newKey) {
    // WSA cloud-{guilab,pslab,presentation}
    const wsaMatch = filePath.match(/cloud\/modules\/wsa\/m(\d{2})-[^/]+\/cloud-(guilab|pslab|presentation)\.module\.html$/);
    if (wsaMatch) {
        const [_, mNN, series] = wsaMatch;
        if (oldKey === `cloud-${series}` && newKey === `cloud-wsa-m${mNN}-${series}`) return true;
    }
    // A+ Core 2 chapters
    const aplusMatch = filePath.match(/forge\/applets\/comptia-aplus\/core-2\/chapters\/ch(\d{2})-[^/]+\/index\.html$/);
    if (aplusMatch) {
        const [_, chNN] = aplusMatch;
        if (oldKey === 'index' && newKey === `forge-aplus-core2-ch${chNN}`) return true;
    }
    return false;
}

function parseCompleteCalls(content) {
    // Match: ModuleProgress.complete('houseId', 'moduleId', ...)
    const re = /ModuleProgress\.complete\s*\(\s*['"]([^'"]+)['"]\s*,\s*['"]([^'"]+)['"]/g;
    const calls = [];
    let m;
    while ((m = re.exec(content)) !== null) {
        // Skip dynamic-key calls (concatenation)
        const after = content.substring(m.index + m[0].length, m.index + m[0].length + 5);
        if (after.includes('+')) continue;
        // Skip 2-arg URL pattern (PROG-002 territory)
        if (m[2].includes('/') || m[2].endsWith('.html')) continue;
        calls.push({ houseId: m[1], moduleId: m[2] });
    }
    return calls;
}

let modifiedFiles;
try {
    modifiedFiles = execSync('git diff master..HEAD --name-only --diff-filter=M', {
        cwd: ROOT, encoding: 'utf8',
    }).trim().split('\n').filter(f => f.endsWith('.html'));
} catch (e) {
    console.error('git diff failed:', e.message);
    process.exit(2);
}

console.log('');
console.log(`  Pre-deploy progress-key change verification`);
console.log(`  Comparing master..HEAD across ${modifiedFiles.length} modified .html files`);
console.log('');

const knownChanges = [];
const unknownChanges = [];

for (const f of modifiedFiles) {
    let oldContent, newContent;
    try {
        oldContent = execSync(`git show master:${f}`, { cwd: ROOT, encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] });
    } catch (e) { oldContent = ''; }  // file may have been added
    try {
        newContent = fs.readFileSync(path.join(ROOT, f), 'utf8');
    } catch (e) { continue; }

    const oldCalls = parseCompleteCalls(oldContent);
    const newCalls = parseCompleteCalls(newContent);

    // Compare set of (houseId, moduleId) pairs
    const oldKeys = new Set(oldCalls.map(c => `${c.houseId}::${c.moduleId}`));
    const newKeys = new Set(newCalls.map(c => `${c.houseId}::${c.moduleId}`));

    // Removed = in old but not new
    // Added = in new but not old
    const removed = [...oldKeys].filter(k => !newKeys.has(k));
    const added = [...newKeys].filter(k => !oldKeys.has(k));

    if (removed.length === 0 && added.length === 0) continue;

    // Pair removals with additions for rename detection
    // (assumption: usually 1:1 rename per file)
    for (let i = 0; i < Math.max(removed.length, added.length); i++) {
        const oldEntry = removed[i] ? removed[i].split('::') : ['?', '?'];
        const newEntry = added[i] ? added[i].split('::') : ['?', '?'];
        const oldKey = oldEntry[1];
        const newKey = newEntry[1];
        const known = inKnownPROG003Scope(f, oldKey, newKey);
        const change = { file: f, oldHouseId: oldEntry[0], oldKey, newHouseId: newEntry[0], newKey };
        if (known) knownChanges.push(change);
        else unknownChanges.push(change);
    }
}

console.log(`  KNOWN PROG-003 fix changes: ${knownChanges.length}`);
console.log(`  UNKNOWN changes (require review): ${unknownChanges.length}`);
console.log('');

if (unknownChanges.length === 0) {
    console.log('  ✓ All progress-key changes are in documented PROG-003 fix scope.');
    console.log('    Reference: _docs/operations/stragglers-progress-safety-audit.md (Category A)');
    console.log('');
    process.exit(0);
}

console.log('  ⚠️  UNKNOWN PROGRESS-KEY CHANGES — operator must review:');
console.log('');
for (const c of unknownChanges) {
    console.log(`    ${c.file}`);
    console.log(`      old: complete('${c.oldHouseId}', '${c.oldKey}')`);
    console.log(`      new: complete('${c.newHouseId}', '${c.newKey}')`);
    console.log('');
}
console.log('  These must be added to the PROG-003 known-scope list in the verifier OR');
console.log('  reverted before deploy. Do NOT deploy until reviewed.');
console.log('');
process.exit(1);
