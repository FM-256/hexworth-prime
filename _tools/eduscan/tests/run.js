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
const EmojiValidator = require(path.join(EDUSCAN_DIR, 'validators/syntax/emoji'));
const SemanticValidator = require(path.join(EDUSCAN_DIR, 'validators/syntax/semantic'));
const UXValidator = require(path.join(EDUSCAN_DIR, 'validators/syntax/ux'));
const TurtleValidator = require(path.join(EDUSCAN_DIR, 'validators/syntax/turtle'));
const FlexOverflowValidator = require(path.join(EDUSCAN_DIR, 'validators/syntax/flex-overflow'));

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
    new NavigationValidator({ profile: 'strict' }),
    new EmojiValidator({ rootPath: ROOT_PATH, profile: 'strict' }),
    new SemanticValidator({ rootPath: ROOT_PATH, profile: 'strict' }),
    new UXValidator({ rootPath: ROOT_PATH, profile: 'strict' }),
    new TurtleValidator({ rootPath: ROOT_PATH, profile: 'strict' }),
    new FlexOverflowValidator({ rootPath: ROOT_PATH, profile: 'strict' })
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

    const validCodes = ['NAV-001', 'NAV-002', 'NAV-003', 'NAV-004'];
    const badCodes = navIssues.filter(i => !validCodes.includes(i.code));
    if (badCodes.length === 0) {
        console.log(`  \u2713 NavigationValidator — all ${navIssues.length} issues use NAV-001/NAV-002/NAV-003/NAV-004 codes`);
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

// NAV-004: positive detection — path card with no href but hub directory exists
{
    const navValidator = new NavigationValidator({ profile: 'strict', rootPath: ROOT_PATH });

    // Simulate a house index page with a path card missing href
    // python-hub has a real hub at modules/python-hub/index.html
    const mockHouseIndex = {
        path: 'houses/code/index.html',
        content: `
            <script src="../../components/HouseRenderer.js"></script>
            <script>
            HouseRenderer.init({
                houseId: 'code',
                paths: [
                    { id: 'devops-fundamentals', name: 'DevOps Fundamentals', cert: 'Primary Learning Path' },
                    { id: 'python-hub', name: 'Python Hub', cert: '5-Track Curriculum' }
                ]
            });
            </script>`,
        role: 'house-index',
        house: 'code'
    };
    const nav004Result = navValidator.validate(mockHouseIndex);
    const nav004s = nav004Result.filter(i => i.code === 'NAV-004');

    // python-hub should trigger (hub exists), devops-fundamentals should not (no hub dir)
    const hubDetected = nav004s.some(i => i.pathId === 'python-hub');
    const falsePositive = nav004s.some(i => i.pathId === 'devops-fundamentals');

    if (hubDetected && !falsePositive) {
        console.log(`  \u2713 NAV-004 positive — detected missing href on 'python-hub' path card, no false positive on 'devops-fundamentals'`);
        passed++;
    } else {
        const parts = [];
        if (!hubDetected) parts.push("missed 'python-hub' (hub dir exists)");
        if (falsePositive) parts.push("false positive on 'devops-fundamentals' (no hub dir)");
        console.log(`  \u2717 NAV-004 positive — ${parts.join(', ')} (found: ${nav004s.map(i => i.pathId).join(', ') || 'none'})`);
        if (VERBOSE) nav004Result.forEach(i => console.log(`    - ${i.code}: ${i.message}`));
        failed++;
    }
}

// AutoFixer: dry-run produces correct results for mock issues
{
    const AutoFixer = require(path.join(EDUSCAN_DIR, 'fixers/auto-fixer'));

    // Create a temp fixture file for auto-fixer testing
    const tmpDir = path.join(TESTS_DIR, '.tmp-autofixer');
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

    // Cross-house scenario: file lives in houses/eye/ but moduleId has shield- prefix
    const testContent = `const config = {
    moduleId: 'shield-quiz-test-quiz',
    houseId: 'eye',
    trackProgress: false,
    passingScore: 70
};`;
    const testFile = path.join(tmpDir, 'test-quiz.html');
    fs.writeFileSync(testFile, testContent, 'utf8');

    const fixer = new AutoFixer({
        rootPath: tmpDir,
        dryRun: true
    });

    const mockIssues = [
        {
            code: 'ID-001',
            autoFixable: true,
            file: 'test-quiz.html',
            searchPattern: "moduleId: 'shield-quiz-test-quiz'",
            replaceWith: "moduleId: 'eye-quiz-test-quiz'",
            message: 'moduleId has wrong house prefix (cross-house mismatch)'
        },
        {
            code: 'TRACK-001',
            autoFixable: true,
            file: 'test-quiz.html',
            searchPattern: 'trackProgress: false',
            replaceWith: 'trackProgress: true',
            message: 'trackProgress disabled'
        },
        {
            code: 'UNKNOWN-001',
            autoFixable: true,
            file: 'test-quiz.html',
            searchPattern: 'passingScore: 70',
            replaceWith: 'passingScore: 80',
            message: 'Unknown code should be skipped'
        }
    ];

    const result = fixer.fix(mockIssues);

    // Verify: 2 should fix, 1 should be skipped (unknown code)
    const fixOk = result.summary.fixed === 2;
    const skipOk = result.summary.skipped === 1;
    const errOk = result.summary.errors === 0;
    const dryOk = result.summary.dryRun === true;

    // Verify original file is unchanged (dry run)
    const afterContent = fs.readFileSync(testFile, 'utf8');
    const unchangedOk = afterContent === testContent;

    if (fixOk && skipOk && errOk && dryOk && unchangedOk) {
        console.log(`  \u2713 AutoFixer — dry-run: 2 fixes, 1 skip, 0 errors, file unchanged`);
        passed++;
    } else {
        const parts = [];
        if (!fixOk) parts.push(`fixed=${result.summary.fixed} (expected 2)`);
        if (!skipOk) parts.push(`skipped=${result.summary.skipped} (expected 1)`);
        if (!errOk) parts.push(`errors=${result.summary.errors} (expected 0)`);
        if (!dryOk) parts.push('not dry-run');
        if (!unchangedOk) parts.push('file was modified in dry-run!');
        console.log(`  \u2717 AutoFixer — ${parts.join(', ')}`);
        failed++;
    }

    // Cleanup temp files
    try { fs.unlinkSync(testFile); fs.rmdirSync(tmpDir); } catch (_) {}
}

// AutoFixer: live mode actually modifies file
{
    const AutoFixer = require(path.join(EDUSCAN_DIR, 'fixers/auto-fixer'));

    const tmpDir2 = path.join(TESTS_DIR, '.tmp-autofixer2');
    if (!fs.existsSync(tmpDir2)) fs.mkdirSync(tmpDir2, { recursive: true });

    const origContent = "const quiz = { trackProgress: false };";
    const testFile2 = path.join(tmpDir2, 'live-test.html');
    fs.writeFileSync(testFile2, origContent, 'utf8');

    const liveFixer = new AutoFixer({
        rootPath: tmpDir2,
        dryRun: false
    });

    const liveResult = liveFixer.fix([{
        code: 'TRACK-001',
        autoFixable: true,
        file: 'live-test.html',
        searchPattern: 'trackProgress: false',
        replaceWith: 'trackProgress: true',
        message: 'trackProgress disabled'
    }]);

    const liveContent = fs.readFileSync(testFile2, 'utf8');
    const liveOk = liveResult.summary.fixed === 1 && liveContent.includes('trackProgress: true');

    if (liveOk) {
        console.log(`  \u2713 AutoFixer — live mode: file correctly modified`);
        passed++;
    } else {
        console.log(`  \u2717 AutoFixer — live mode: fixed=${liveResult.summary.fixed}, content=${liveContent.includes('trackProgress: true')}`);
        failed++;
    }

    // Cleanup
    try { fs.unlinkSync(testFile2); fs.rmdirSync(tmpDir2); } catch (_) {}
}

console.log('');
console.log(`Results: ${passed}/${passed + failed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
