#!/usr/bin/env node
'use strict';

const path = require('path');
const fs = require('fs');

// ── Paths ────────────────────────────────────────────────────────────
const TESTS_DIR   = __dirname;
const FIXTURES_DIR = path.join(TESTS_DIR, 'fixtures');
const EDUSCAN_DIR  = path.resolve(TESTS_DIR, '..');
const ROOT_PATH    = path.resolve(EDUSCAN_DIR, '../../_app');
const VERBOSE      = process.argv.includes('-v') || process.argv.includes('--verbose');

// ── Import validators ────────────────────────────────────────────────
const HTMLValidator   = require(path.join(EDUSCAN_DIR, 'validators/syntax/html'));
const JSValidator     = require(path.join(EDUSCAN_DIR, 'validators/syntax/js'));
const EngineValidator = require(path.join(EDUSCAN_DIR, 'validators/syntax/engine'));
const PathValidator   = require(path.join(EDUSCAN_DIR, 'validators/syntax/paths'));
const NamingValidator = require(path.join(EDUSCAN_DIR, 'validators/syntax/naming'));

// ── Import expectations ──────────────────────────────────────────────
const expectations = require('./expectations');

// ── Path overrides (relative to rootPath, matching scanner convention) ─
const PATH_OVERRIDES = {
    'path-issues.html':       'houses/web/path-issues.html',
    'path-depth-issues.html': 'houses/eye/index.html',
    'naming-issues.html':     'houses/shield/presentations/bad-name.html'
};

// ── Instantiate validators ──────────────────────────────────────────
// Both CI and strict HTML profiles: CI catches HTML-001, strict catches the rest
const validators = [
    new HTMLValidator({ profile: 'ci' }),
    new HTMLValidator({ profile: 'strict' }),
    new JSValidator({ profile: 'strict' }),
    new EngineValidator({ profile: 'strict', rootPath: ROOT_PATH }),
    new PathValidator({ profile: 'strict', rootPath: ROOT_PATH }),
    new NamingValidator({ rootPath: ROOT_PATH, strictMode: true })
];

// ── Run ──────────────────────────────────────────────────────────────
let passed = 0;
let failed = 0;

console.log('');
console.log('═══ EduScan Test Suite ═══');
console.log('');

for (const [fixture, expectedCodes] of Object.entries(expectations)) {
    const fixturePath = path.join(FIXTURES_DIR, fixture);

    if (!fs.existsSync(fixturePath)) {
        console.log(`  \u2717 ${fixture} — FIXTURE NOT FOUND`);
        failed++;
        continue;
    }

    const content = fs.readFileSync(fixturePath, 'utf-8');
    const simulatedPath = PATH_OVERRIDES[fixture] || fixturePath;
    const file = { path: simulatedPath, content };

    // Run every validator and collect issues
    const allIssues = [];
    for (const validator of validators) {
        try {
            const result = validator.validate(file);
            if (Array.isArray(result)) {
                allIssues.push(...result);
            } else if (result && Array.isArray(result.issues)) {
                allIssues.push(...result.issues);
            }
        } catch (err) {
            if (VERBOSE) {
                console.log(`    [warn] ${validator.constructor.name} threw: ${err.message}`);
            }
        }
    }

    // Extract unique codes
    const foundCodes = [...new Set(allIssues.map(i => i.code))].sort();

    // Check: all expected codes must be present
    const missingCodes = expectedCodes.filter(c => !foundCodes.includes(c));

    // For the clean fixture (empty expectations): any code is unexpected
    const unexpectedCodes = expectedCodes.length === 0 ? foundCodes : [];

    const ok = missingCodes.length === 0 && unexpectedCodes.length === 0;

    if (ok) {
        if (expectedCodes.length === 0) {
            console.log(`  \u2713 ${fixture} — 0 issues (expected 0)`);
        } else {
            console.log(`  \u2713 ${fixture} — ${expectedCodes.length} codes matched: ${expectedCodes.join(', ')}`);
        }
        passed++;
    } else {
        const parts = [];
        if (missingCodes.length > 0)    parts.push(`MISSING: ${missingCodes.join(', ')}`);
        if (unexpectedCodes.length > 0) parts.push(`UNEXPECTED: ${unexpectedCodes.join(', ')}`);
        console.log(`  \u2717 ${fixture} — ${parts.join(' | ')}`);

        if (VERBOSE) {
            console.log(`    Expected: [${expectedCodes.join(', ')}]`);
            console.log(`    Found:    [${foundCodes.join(', ')}]`);
            allIssues.forEach(i =>
                console.log(`      ${i.code} (${i.severity}): ${i.message}`)
            );
        }
        failed++;
    }
}

console.log('');
console.log(`Results: ${passed}/${passed + failed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
