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
const HeuristicsValidator = require(path.join(EDUSCAN_DIR, 'validators/syntax/heuristics'));
const ContentCatalogValidator = require(path.join(EDUSCAN_DIR, 'validators/syntax/content-catalog'));
const NavigationValidator = require(path.join(EDUSCAN_DIR, 'validators/syntax/navigation'));

// ── Import expectations ──────────────────────────────────────────────
const expectations = require('./expectations');

// ── Path overrides (relative to rootPath, matching scanner convention) ─
const PATH_OVERRIDES = {
    'path-issues.html':        'houses/web/path-issues.html',
    'path-depth-issues.html':  'houses/eye/index.html',
    'naming-issues.html':      'houses/shield/presentations/bad-name.html',
    'path-strict-issues.html': 'houses/web/path-strict-issues.html',
    'naming-full-issues.html': 'houses/web/labs/MyBadFile.html',
    'nav-issues.html':         'houses/web/modules/test-nav.module.html'
};

// ── Instantiate validators ──────────────────────────────────────────
// Both CI and strict HTML profiles: CI catches HTML-001, strict catches the rest
const validators = [
    new HTMLValidator({ profile: 'ci' }),
    new HTMLValidator({ profile: 'strict' }),
    new JSValidator({ profile: 'strict' }),
    new EngineValidator({ profile: 'strict', rootPath: ROOT_PATH }),
    new PathValidator({ profile: 'strict', rootPath: ROOT_PATH }),
    new NamingValidator({ rootPath: ROOT_PATH, strictMode: true }),
    new HeuristicsValidator({ profile: 'strict', rootPath: ROOT_PATH }),
    new NavigationValidator({ profile: 'strict' })
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

// ── Global Validator Tests ───────────────────────────────────────────
console.log('');
console.log('── Global Validators ──');
console.log('');

// FlowValidator: structure test — returns valid shape
{
    const FlowValidator = require(path.join(EDUSCAN_DIR, 'validators/flow-validator'));
    const Scanner = require(path.join(EDUSCAN_DIR, 'scanner'));
    const ParserOrchestrator = require(path.join(EDUSCAN_DIR, 'parsers'));
    const ValidatorOrchestrator = require(path.join(EDUSCAN_DIR, 'validators'));

    const scanner = new Scanner({ rootPath: ROOT_PATH, verbose: false });
    const parser = new ParserOrchestrator({ verbose: false });
    const validatorOrch = new ValidatorOrchestrator({ verbose: false });

    const scanResult = scanner.scan();
    const content = parser.parseAll(scanResult.files);
    const registry = validatorOrch.loadRegistry();

    const flowValidator = new FlowValidator({ rootPath: ROOT_PATH, verbose: false });
    const flowResult = flowValidator.detect(content, registry);

    const hasIssues = Array.isArray(flowResult.issues);
    const hasUnchained = Array.isArray(flowResult.unchained);
    const hasSummary = flowResult.summary && typeof flowResult.summary.totalTrackable === 'number';

    if (hasIssues && hasUnchained && hasSummary) {
        console.log(`  \u2713 FlowValidator — returns valid { issues, unchained, summary } (${flowResult.summary.totalTrackable} trackable, ${flowResult.summary.unchained} unchained)`);
        passed++;
    } else {
        console.log(`  \u2717 FlowValidator — invalid return shape (issues: ${hasIssues}, unchained: ${hasUnchained}, summary: ${hasSummary})`);
        failed++;
    }

    // FlowValidator: all emitted issues use FLOW-001 code
    const nonFlowCodes = flowResult.issues.filter(i => i.code !== 'FLOW-001');
    if (nonFlowCodes.length === 0) {
        console.log(`  \u2713 FlowValidator — all ${flowResult.issues.length} issues use FLOW-001 code`);
        passed++;
    } else {
        console.log(`  \u2717 FlowValidator — found ${nonFlowCodes.length} issues with non-FLOW-001 codes: ${[...new Set(nonFlowCodes.map(i => i.code))].join(', ')}`);
        failed++;
    }
}

// NavigationValidator: all emitted issues use NAV-001 or NAV-002 codes
{
    const navValidator = new NavigationValidator({ profile: 'strict' });
    const Scanner = require(path.join(EDUSCAN_DIR, 'scanner'));
    const ParserOrchestrator = require(path.join(EDUSCAN_DIR, 'parsers'));

    const navScanner = new Scanner({ rootPath: ROOT_PATH, verbose: false });
    const navParser = new ParserOrchestrator({ verbose: false });
    const navScanResult = navScanner.scan();
    const navContent = navParser.parseAll(navScanResult.files);

    const navIssues = [];
    for (const file of navContent) {
        if (!file.path.endsWith('.html')) continue;
        let content = file.content;
        if (!content) {
            try { content = fs.readFileSync(path.resolve(ROOT_PATH, file.path), 'utf8'); } catch (_) { continue; }
        }
        const result = navValidator.validate({ ...file, content });
        navIssues.push(...result);
    }

    const validCodes = ['NAV-001', 'NAV-002', 'NAV-003'];
    const badCodes = navIssues.filter(i => !validCodes.includes(i.code));
    if (badCodes.length === 0) {
        console.log(`  \u2713 NavigationValidator — all ${navIssues.length} issues use NAV-001/NAV-002/NAV-003 codes`);
        passed++;
    } else {
        console.log(`  \u2717 NavigationValidator — found ${badCodes.length} issues with invalid codes: ${[...new Set(badCodes.map(i => i.code))].join(', ')}`);
        failed++;
    }
}

// ContentCatalog: zero dead links regression (CAT-001 count must be 0)
{
    const catValidator = new ContentCatalogValidator({ rootPath: ROOT_PATH });
    const catResult = catValidator.validate();
    const cat001s = catResult.issues.filter(i => i.code === 'CAT-001');

    if (cat001s.length === 0) {
        console.log(`  \u2713 ContentCatalog — zero dead links (CAT-001 count: 0)`);
        passed++;
    } else {
        console.log(`  \u2717 ContentCatalog — found ${cat001s.length} dead links (CAT-001):`);
        cat001s.forEach(i => console.log(`    - ${i.moduleId}: ${i.message}`));
        failed++;
    }
}

// LearningPaths: regression — live codebase must have zero LP-004/LP-005
{
    const LearningPathsValidator = require(path.join(EDUSCAN_DIR, 'validators/syntax/learning-paths'));
    const lpValidator = new LearningPathsValidator({ rootPath: ROOT_PATH });
    const lpResult = lpValidator.validate();

    const lp004s = lpResult.issues.filter(i => i.code === 'LP-004');
    const lp005s = lpResult.issues.filter(i => i.code === 'LP-005');

    if (lp004s.length === 0) {
        console.log(`  \u2713 LearningPaths — zero broken prerequisite refs (LP-004 count: 0)`);
        passed++;
    } else {
        console.log(`  \u2717 LearningPaths — found ${lp004s.length} broken prerequisite refs (LP-004):`);
        lp004s.forEach(i => console.log(`    - ${i.moduleId}: ${i.message}`));
        failed++;
    }

    if (lp005s.length === 0) {
        console.log(`  \u2713 LearningPaths — zero circular prerequisite chains (LP-005 count: 0)`);
        passed++;
    } else {
        console.log(`  \u2717 LearningPaths — found ${lp005s.length} circular chains (LP-005):`);
        lp005s.forEach(i => console.log(`    - ${i.message}`));
        failed++;
    }

    // All emitted LP issues must use recognized codes
    const validLPCodes = ['LP-000', 'LP-001', 'LP-002', 'LP-003', 'LP-004', 'LP-005', 'LP-006', 'LP-007', 'LP-008', 'LP-009', 'LP-010'];
    const badLPCodes = lpResult.issues.filter(i => !validLPCodes.includes(i.code));
    if (badLPCodes.length === 0) {
        console.log(`  \u2713 LearningPaths — all ${lpResult.issues.length} issues use valid LP codes`);
        passed++;
    } else {
        console.log(`  \u2717 LearningPaths — found ${badLPCodes.length} issues with invalid codes: ${[...new Set(badLPCodes.map(i => i.code))].join(', ')}`);
        failed++;
    }

    // LP-006/LP-007 fire on live codebase (cross-reference gaps exist)
    const lp006s = lpResult.issues.filter(i => i.code === 'LP-006');
    const lp007s = lpResult.issues.filter(i => i.code === 'LP-007');
    if (lp006s.length > 0 && lp007s.length > 0) {
        console.log(`  \u2713 LearningPaths — LP-006 fires (${lp006s.length} LP modules not in catalog), LP-007 fires (${lp007s.length} catalog modules not in LP)`);
        passed++;
    } else {
        const parts = [];
        if (lp006s.length === 0) parts.push('LP-006 did not fire');
        if (lp007s.length === 0) parts.push('LP-007 did not fire');
        console.log(`  \u2717 LearningPaths — expected cross-reference issues but: ${parts.join(', ')}`);
        failed++;
    }
}

// LearningPaths: positive detection — fixture with intentional LP-004/LP-005 issues
{
    const LearningPathsValidator = require(path.join(EDUSCAN_DIR, 'validators/syntax/learning-paths'));
    const fixtureLP = path.join(FIXTURES_DIR, 'lp-issues.learningpaths.js');

    // Point validator at the test fixture instead of real LearningPaths.js
    const lpFixtureValidator = new LearningPathsValidator({
        rootPath: ROOT_PATH,
        learningPathsFile: path.relative(ROOT_PATH, fixtureLP)
    });
    const fixtureResult = lpFixtureValidator.validate();
    const fixtureCodes = [...new Set(fixtureResult.issues.map(i => i.code))].sort();

    // LP-004: 'mod-c' references 'ghost-module' which doesn't exist
    const fix004 = fixtureResult.issues.filter(i => i.code === 'LP-004');
    if (fix004.length >= 1 && fix004.some(i => i.prerequisiteId === 'ghost-module')) {
        console.log(`  \u2713 LP-004 positive — detected broken prereq 'ghost-module' in fixture`);
        passed++;
    } else {
        console.log(`  \u2717 LP-004 positive — expected broken prereq 'ghost-module' (found codes: ${fixtureCodes.join(', ')})`);
        if (VERBOSE) fix004.forEach(i => console.log(`    - ${i.message}`));
        failed++;
    }

    // LP-005: cycle-a -> cycle-c -> cycle-b -> cycle-a
    const fix005 = fixtureResult.issues.filter(i => i.code === 'LP-005');
    if (fix005.length >= 1) {
        console.log(`  \u2713 LP-005 positive — detected circular chain in fixture: ${fix005[0].cycle.join(' -> ')}`);
        passed++;
    } else {
        console.log(`  \u2717 LP-005 positive — expected circular chain (found codes: ${fixtureCodes.join(', ')})`);
        failed++;
    }

    // LP-006: all fixture module IDs should be missing from ContentCatalog
    const fix006 = fixtureResult.issues.filter(i => i.code === 'LP-006');
    if (fix006.length >= 1) {
        console.log(`  \u2713 LP-006 positive — detected ${fix006.length} fixture modules missing from ContentCatalog`);
        passed++;
    } else {
        console.log(`  \u2717 LP-006 positive — expected fixture modules absent from catalog (found codes: ${fixtureCodes.join(', ')})`);
        failed++;
    }

    // LP-008: 'mod-mismatch' declares type 'quiz' but href is in presentations/
    const fix008 = fixtureResult.issues.filter(i => i.code === 'LP-008');
    if (fix008.length >= 1 && fix008.some(i => i.moduleId === 'mod-mismatch')) {
        console.log(`  \u2713 LP-008 positive — detected type/href mismatch for 'mod-mismatch' in fixture`);
        passed++;
    } else {
        console.log(`  \u2717 LP-008 positive — expected type/href mismatch for 'mod-mismatch' (found codes: ${fixtureCodes.join(', ')})`);
        if (VERBOSE) fix008.forEach(i => console.log(`    - ${i.message}`));
        failed++;
    }

    // LP-009: 'badcoursepath' has courseHref pointing to non-existent file
    const fix009 = fixtureResult.issues.filter(i => i.code === 'LP-009');
    if (fix009.length >= 1 && fix009.some(i => i.pathId === 'badcoursepath')) {
        console.log(`  \u2713 LP-009 positive — detected bad courseHref for 'badcoursepath' in fixture`);
        passed++;
    } else {
        console.log(`  \u2717 LP-009 positive — expected bad courseHref for 'badcoursepath' (found codes: ${fixtureCodes.join(', ')})`);
        if (VERBOSE) fix009.forEach(i => console.log(`    - ${i.message}`));
        failed++;
    }
}

// ContentCatalog: zero duplicate IDs regression (CAT-005 count must be 0)
{
    const catValidator = new ContentCatalogValidator({ rootPath: ROOT_PATH });
    const catResult = catValidator.validate();
    const cat005s = catResult.issues.filter(i => i.code === 'CAT-005');

    if (cat005s.length === 0) {
        console.log(`  \u2713 ContentCatalog — zero duplicate module IDs (CAT-005 count: 0)`);
        passed++;
    } else {
        console.log(`  \u2717 ContentCatalog — found ${cat005s.length} duplicate module IDs (CAT-005):`);
        cat005s.forEach(i => console.log(`    - ${i.moduleId}: ${i.message}`));
        failed++;
    }
}

// NAV-003: positive detection — simulate a file inside a course subdirectory with bad href
{
    const navValidator = new NavigationValidator({ profile: 'strict', rootPath: ROOT_PATH });

    // Simulate a file at houses/forge/md-100/labs/test.html with ../../index.html back button
    const mockFile = {
        path: 'houses/forge/md-100/labs/test-nav.html',
        content: '<a href="../../index.html" class="back-btn">Back</a>',
        house: 'forge'
    };
    const navResult = navValidator.validate(mockFile);
    const nav003s = navResult.filter(i => i.code === 'NAV-003');

    if (nav003s.length >= 1) {
        console.log(`  \u2713 NAV-003 positive — detected back button href skipping course home in mock file`);
        passed++;
    } else {
        console.log(`  \u2717 NAV-003 positive — expected href skip detection (found: ${navResult.map(i => i.code).join(', ') || 'none'})`);
        if (VERBOSE) navResult.forEach(i => console.log(`    - ${i.code}: ${i.message}`));
        failed++;
    }
}

console.log('');
console.log(`Results: ${passed}/${passed + failed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
