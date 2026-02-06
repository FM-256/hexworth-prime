#!/usr/bin/env node
/**
 * Apply safe auto-fixes from PATCH_PLAN.json
 */

const fs = require('fs');
const path = require('path');

const planPath = path.join(__dirname, 'reports/PATCH_PLAN.json');
const plan = require(planPath);
const fixes = plan._flat.safeAutoFix;

console.log('EduScan Safe Auto-Fix Applier');
console.log('==============================');
console.log('Total fixes to apply:', fixes.length);
console.log('');

// Group by file
const byFile = {};
fixes.forEach(fix => {
    if (!byFile[fix.file]) byFile[fix.file] = [];
    byFile[fix.file].push(fix);
});

console.log('Files to modify:', Object.keys(byFile).length);
console.log('');

let filesModified = 0;
let fixesApplied = 0;
let skipped = 0;
let duplicates = 0;
let errors = [];

const appRoot = path.join(__dirname, '../_app');

Object.entries(byFile).forEach(([relFile, issues]) => {
    const filePath = path.join(appRoot, relFile);

    if (!fs.existsSync(filePath)) {
        errors.push('File not found: ' + relFile);
        return;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    let fileFixCount = 0;

    // Track which paths we've already fixed in this file to avoid duplicates
    const fixedPaths = new Set();

    issues.forEach(issue => {
        const newPath = issue.suggestion?.path;
        // Get old path from _original
        const oldPath = issue._original?.missingPath || issue.missingPath;

        if (!newPath || !oldPath) {
            skipped++;
            return;
        }

        // Skip if we've already fixed this exact path in this file
        if (fixedPaths.has(oldPath)) {
            duplicates++;
            return;
        }

        // Replace old path with new path (only first occurrence per fix)
        if (content.includes(oldPath)) {
            content = content.replace(oldPath, newPath);
            modified = true;
            fixesApplied++;
            fileFixCount++;
            fixedPaths.add(oldPath);
        } else {
            skipped++;
        }
    });

    if (modified) {
        fs.writeFileSync(filePath, content);
        filesModified++;
        console.log(`  ✓ ${relFile} (${fileFixCount} fixes)`);
    }
});

console.log('');
console.log('==============================');
console.log('Results:');
console.log('  Files modified:', filesModified);
console.log('  Fixes applied:', fixesApplied);
console.log('  Duplicates skipped:', duplicates);
console.log('  Other skipped:', skipped);

if (errors.length > 0) {
    console.log('  Errors:', errors.length);
    errors.forEach(e => console.log('    -', e));
}

console.log('');
console.log('Run `eduscan --syntax=ci` to verify.');
