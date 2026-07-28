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
const SandboxValidator = require(path.join(EDUSCAN_DIR, 'validators/syntax/sandbox'));
const LinuxTerminalValidator = require(path.join(EDUSCAN_DIR, 'validators/syntax/linux-terminal'));
const ProgressKeysValidator = require(path.join(EDUSCAN_DIR, 'validators/syntax/progress-keys'));
const XPAuditValidator = require(path.join(EDUSCAN_DIR, 'validators/syntax/xp-audit'));
const DependencyCheckValidator = require(path.join(EDUSCAN_DIR, 'validators/syntax/dependency-check'));
const ContentBlobValidator = require(path.join(EDUSCAN_DIR, 'validators/syntax/content-blob'));

// ── Import expectations ──────────────────────────────────────────────
const expectations = require('./expectations');

// ── Path overrides (relative to rootPath, matching scanner convention) ─
const PATH_OVERRIDES = {
    'path-issues.html':        'houses/web/path-issues.html',
    'path-depth-issues.html':  'houses/eye/index.html',
    'naming-issues.html':      'houses/shield/presentations/bad-name.html',
    'path-strict-issues.html': 'houses/web/path-strict-issues.html',
    'naming-full-issues.html': 'houses/web/labs/MyBadFile.html',
    'nav-issues.html':         'houses/web/modules/test-nav.module.html',
    'xp-issues.js':            'components/xp-issues.js',
    'escape-issues.html':      'houses/web/network-plus/exams/escape-issues.html'
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
    new FlexOverflowValidator({ rootPath: ROOT_PATH, profile: 'strict' }),
    new SandboxValidator({ rootPath: ROOT_PATH, profile: 'strict' }),
    new LinuxTerminalValidator({ profile: 'strict' }),
    new ProgressKeysValidator({ profile: 'strict' }),
    new XPAuditValidator({ rootPath: ROOT_PATH, profile: 'strict' }),
    new DependencyCheckValidator({ profile: 'strict' }),
    new ContentBlobValidator({ profile: 'strict' })
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

// CSPValidator: all emitted issues use CSP-001 code; current platform has zero CSP gaps
{
    const CSPValidator = require(path.join(EDUSCAN_DIR, 'validators/syntax/csp'));
    const cspValidator = new CSPValidator({ rootPath: ROOT_PATH });
    const cspResult = cspValidator.validate();
    const validCodes = ['CSP-001'];
    const badCodes = cspResult.issues.filter(i => !validCodes.includes(i.code));
    if (badCodes.length === 0) {
        console.log(`  ✓ CSPValidator — all ${cspResult.issues.length} issues use CSP-001 code`);
        passed++;
    } else {
        console.log(`  ✗ CSPValidator — found ${badCodes.length} issues with invalid codes: ${[...new Set(badCodes.map(i => i.code))].join(', ')}`);
        failed++;
    }
    if (cspResult.issues.length === 0) {
        console.log(`  ✓ CSPValidator — zero uncovered external domains (CSP-001 count: 0, ${cspResult.summary.totalExternalDomains} domains scanned)`);
        passed++;
    } else {
        console.log(`  ✗ CSPValidator — found ${cspResult.issues.length} uncovered external domains:`);
        cspResult.issues.slice(0, 5).forEach(i => console.log(`    - ${i.message}`));
        failed++;
    }
}

// PaletteValidator: all emitted issues use PALETTE-001/002/003 codes; current platform has zero palette drift
{
    const PaletteValidator = require(path.join(EDUSCAN_DIR, 'validators/syntax/palette'));
    const palValidator = new PaletteValidator({ rootPath: ROOT_PATH });
    const palResult = palValidator.validate();
    const validCodes = ['PALETTE-001', 'PALETTE-002', 'PALETTE-003'];
    const badCodes = palResult.issues.filter(i => !validCodes.includes(i.code));
    if (badCodes.length === 0) {
        console.log(`  ✓ PaletteValidator — all ${palResult.issues.length} issues use PALETTE-001/002/003 codes`);
        passed++;
    } else {
        console.log(`  ✗ PaletteValidator — found ${badCodes.length} issues with invalid codes: ${[...new Set(badCodes.map(i => i.code))].join(', ')}`);
        failed++;
    }
    if (palResult.issues.length === 0) {
        console.log(`  ✓ PaletteValidator — zero palette drift (${palResult.summary.housesChecked} houses checked)`);
        passed++;
    } else {
        console.log(`  ✗ PaletteValidator — found ${palResult.issues.length} palette issues:`);
        palResult.issues.slice(0, 5).forEach(i => console.log(`    - ${i.code}: ${i.message}`));
        failed++;
    }
}

// ASGN-005 workshop exemption: quarantined (status:'workshop') hubs are INTENTIONALLY
// unmapped in PATH_HOUSE_MAP and must NOT be flagged — and the rule must still fire for
// them when the exemption is disabled (proving the exemption, not a dead rule, is what
// suppresses the finding). Guards the require()-of-HubRegistry path against silent breakage.
{
    const AssignmentLinkValidator = require(path.join(EDUSCAN_DIR, 'validators/syntax/assignment-links'));
    const v1 = new AssignmentLinkValidator({ rootPath: ROOT_PATH });
    const r1 = v1.validate();
    const wsIds = v1.workshopIds || new Set();
    const wsFlagged = r1.issues.filter(i => i.code === 'ASGN-005' && [...wsIds].some(id => i.message.includes(`'${id}'`)));
    if (wsIds.size > 0 && wsFlagged.length === 0) {
        console.log(`  ✓ ASGN-005 workshop exemption — ${wsIds.size} quarantined hub(s) read from HubRegistry, none flagged`);
        passed++;
    } else if (wsIds.size === 0) {
        console.log(`  ✗ ASGN-005 workshop exemption — workshopIds is EMPTY (HubRegistry require broke, or no workshop hubs exist; expected security-plus-crypto)`);
        failed++;
    } else {
        console.log(`  ✗ ASGN-005 workshop exemption — ${wsFlagged.length} workshop-status hub(s) still flagged`);
        failed++;
    }
    const v2 = new AssignmentLinkValidator({ rootPath: ROOT_PATH, disableWorkshopExemption: true });
    const r2 = v2.validate();
    const wsFlaggedWhenDisabled = r2.issues.filter(i => i.code === 'ASGN-005' && [...wsIds].some(id => i.message.includes(`'${id}'`)));
    if (wsIds.size > 0 && wsFlaggedWhenDisabled.length === wsIds.size) {
        console.log(`  ✓ ASGN-005 rule still fires with exemption disabled (${wsFlaggedWhenDisabled.length}/${wsIds.size}) — exemption, not a dead rule`);
        passed++;
    } else {
        console.log(`  ✗ ASGN-005 with exemption disabled flagged ${wsFlaggedWhenDisabled.length}/${wsIds.size} workshop hub(s) — rule may be dead or exemption leaking`);
        failed++;
    }
}

// Validator-precision tranche 1 (marathon 2026-07-28, task #228): each fix pinned in BOTH
// directions so the rule can neither regress to false-positives nor silently die.
{
    // HEUR-034: decimal opacities (0.8) and '0%'-inside-'50%' must NOT flag; a true
    // 0->1 infinite fade must STILL flag.
    const hv = new HeuristicsValidator({ rootPath: ROOT_PATH });
    const pulseFP = { path: 'synthetic/pulse.html', content:
        '<html><head><style>@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.8; } } .x { animation: pulse 1.2s ease-in-out infinite; }</style></head><body><h1>t</h1></body></html>' };
    const fadeTP = { path: 'synthetic/fade.html', content:
        '<html><head><style>@keyframes fade { 0% { opacity: 0; } 100% { opacity: 1; } } .y { animation: fade 2s infinite; }</style></head><body><h1>t</h1></body></html>' };
    const fpHits = hv.validate(pulseFP).filter(i => i.code === 'HEUR-034');
    const tpHits = hv.validate(fadeTP).filter(i => i.code === 'HEUR-034');
    if (fpHits.length === 0 && tpHits.length === 1) {
        console.log('  ✓ HEUR-034 precision — decimal pulse not flagged, true 0->1 infinite still flagged');
        passed++;
    } else {
        console.log(`  ✗ HEUR-034 precision — pulse FP hits: ${fpHits.length} (want 0), fade TP hits: ${tpHits.length} (want 1)`);
        failed++;
    }

    // SEM-003: redirect stubs (meta refresh) exempt; a normal h1-less page still flags.
    const sv = new SemanticValidator({ rootPath: ROOT_PATH });
    const stub = { path: 'synthetic/stub.html', content:
        '<html><head><meta http-equiv="refresh" content="0; url=../"><title>T</title></head><body><p>Redirecting...</p></body></html>' };
    const bare = { path: 'synthetic/bare.html', content:
        '<html><head><title>T</title></head><body><p>content but no heading</p></body></html>' };
    // Nancy's live regression case: a page that TEACHES meta-refresh (entity-encoded
    // sample) is NOT a redirect and must still flag; nor is a long-delay interstitial.
    const teaches = { path: 'synthetic/teaches.html', content:
        '<html><head><title>T</title></head><body><p>Polling example: &lt;meta http-equiv="refresh" content="30"&gt;</p></body></html>' };
    const interstitial = { path: 'synthetic/interstitial.html', content:
        '<html><head><meta http-equiv="refresh" content="30; url=../"><title>T</title></head><body><p>Moving in 30s...</p></body></html>' };
    const stubHits = sv.validate(stub).filter(i => i.code === 'SEM-003');
    const bareHits = sv.validate(bare).filter(i => i.code === 'SEM-003');
    const teachHits = sv.validate(teaches).filter(i => i.code === 'SEM-003');
    const interHits = sv.validate(interstitial).filter(i => i.code === 'SEM-003');
    if (stubHits.length === 0 && bareHits.length === 1 && teachHits.length === 1 && interHits.length === 1) {
        console.log('  ✓ SEM-003 precision — 0s stub exempt; bare page, meta-refresh TEACHING page, and 30s interstitial all still flagged');
        passed++;
    } else {
        console.log(`  ✗ SEM-003 precision — stub:${stubHits.length}(0) bare:${bareHits.length}(1) teaches:${teachHits.length}(1) interstitial:${interHits.length}(1)`);
        failed++;
    }

    // PATH-IDX-001: underscore-prefixed dirs (_source etc.) exempt; a normal
    // index-less content dir still flags. (Synthetic dirs don't exist on disk, so
    // existsSync is false for both — only the exclusion differentiates them.)
    const SyntaxValidator = require(path.join(EDUSCAN_DIR, 'validators/syntax/index'));
    const sx = new SyntaxValidator({ rootPath: ROOT_PATH });
    const pix = sx.checkMissingDirectoryIndexes([
        { path: 'houses/synthhouse/_source/raw.html' },
        { path: 'houses/synthhouse/exams/final.html' }
    ]).filter(i => i.code === 'PATH-IDX-001');
    const srcFlagged = pix.some(i => String(i.file).includes('_source'));
    const examFlagged = pix.some(i => String(i.file).includes('exams'));
    if (!srcFlagged && examFlagged) {
        console.log('  ✓ PATH-IDX-001 precision — _source exempt, index-less content dir still flagged');
        passed++;
    } else {
        console.log(`  ✗ PATH-IDX-001 precision — _source flagged: ${srcFlagged} (want false), exams flagged: ${examFlagged} (want true)`);
        failed++;
    }
}

// AssignmentLinkValidator: all emitted issues use ASGN-001..006 codes; current platform has zero broken item assignments (ASGN-001)
{
    const AssignmentLinkValidator = require(path.join(EDUSCAN_DIR, 'validators/syntax/assignment-links'));
    const asgnValidator = new AssignmentLinkValidator({ rootPath: ROOT_PATH });
    const asgnResult = asgnValidator.validate();
    const validCodes = ['ASGN-001', 'ASGN-002', 'ASGN-003', 'ASGN-004', 'ASGN-005', 'ASGN-006'];
    const badCodes = asgnResult.issues.filter(i => !validCodes.includes(i.code));
    if (badCodes.length === 0) {
        console.log(`  ✓ AssignmentLinkValidator — all ${asgnResult.issues.length} issues use ASGN-001..006 codes`);
        passed++;
    } else {
        console.log(`  ✗ AssignmentLinkValidator — found ${badCodes.length} issues with invalid codes: ${[...new Set(badCodes.map(i => i.code))].join(', ')}`);
        failed++;
    }
    const asgn001s = asgnResult.issues.filter(i => i.code === 'ASGN-001');
    if (asgn001s.length === 0) {
        console.log(`  ✓ AssignmentLinkValidator — zero broken item assignments (ASGN-001 count: 0, ${asgnResult.stats.itemAssignmentsChecked} item assignments checked)`);
        passed++;
    } else {
        console.log(`  ✗ AssignmentLinkValidator — found ${asgn001s.length} broken item assignments (ASGN-001):`);
        asgn001s.slice(0, 5).forEach(i => console.log(`    - ${i.moduleId}: ${i.message}`));
        failed++;
    }
}

// XRefValidator: cross-layer ID coupling check (progress.js MODULES ↔ hub data-module attrs)
// Currently flags 1 known stale orphan (WSA m20). Test passes as long as no NEW mismatches appear (regression gate).
{
    const XRefValidator = require(path.join(EDUSCAN_DIR, 'validators/syntax/xref'));
    const xrefValidator = new XRefValidator({ rootPath: ROOT_PATH });
    const xrefResult = xrefValidator.validate();
    const validCodes = ['XREF-001'];
    const badCodes = xrefResult.issues.filter(i => !validCodes.includes(i.code));
    if (badCodes.length === 0) {
        console.log(`  ✓ XRefValidator — all ${xrefResult.issues.length} issues use XREF-001 code (${xrefResult.summary.coursesChecked} courses checked)`);
        passed++;
    } else {
        console.log(`  ✗ XRefValidator — found ${badCodes.length} issues with invalid codes: ${[...new Set(badCodes.map(i => i.code))].join(', ')}`);
        failed++;
    }
    // Regression gate: baseline is 0 (WSA m20 orphan resolved on master 2026-05-03; on Stragglers 2026-05-04 P2-3).
    // Any new mismatch must either be fixed or this baseline must be raised with justification.
    const KNOWN_XREF_BASELINE = 0;
    if (xrefResult.issues.length <= KNOWN_XREF_BASELINE) {
        console.log(`  ✓ XRefValidator — at-or-below baseline (${xrefResult.issues.length} ≤ ${KNOWN_XREF_BASELINE} known mismatches)`);
        passed++;
    } else {
        console.log(`  ✗ XRefValidator — NEW coupling regressions (${xrefResult.issues.length} > ${KNOWN_XREF_BASELINE} baseline):`);
        xrefResult.issues.slice(0, 10).forEach(i => console.log(`    - [${i.course}] ${i.message}`));
        failed++;
    }
}

// HubRefsValidator (HUB-001): catches hubs that reference module ids not in ContentCatalog.
// Cherry-picked from Stragglers branch 2026-05-04. Baseline locked at current platform count.
{
    const HubRefsValidator = require(path.join(EDUSCAN_DIR, 'validators/syntax/hub-refs'));
    const hubV = new HubRefsValidator({ rootPath: ROOT_PATH });
    const hubR = hubV.validate();
    const validCodes = ['HUB-001'];
    const badCodes = (hubR.issues || []).filter(i => !validCodes.includes(i.code));
    if (badCodes.length === 0) {
        console.log(`  ✓ HubRefsValidator — all ${(hubR.issues || []).length} issues use HUB-001 code`);
        passed++;
    } else {
        console.log(`  ✗ HubRefsValidator — found ${badCodes.length} issues with invalid codes: ${[...new Set(badCodes.map(i => i.code))].join(', ')}`);
        failed++;
    }
    const HUB_BASELINE = 28;
    const hubCount = (hubR.issues || []).length;
    if (hubCount <= HUB_BASELINE) {
        console.log(`  ✓ HubRefsValidator — at-or-below baseline (${hubCount} ≤ ${HUB_BASELINE} known broken hub refs)`);
        passed++;
    } else {
        console.log(`  ✗ HubRefsValidator — NEW broken hub refs (${hubCount} > ${HUB_BASELINE} baseline):`);
        (hubR.issues || []).slice(0, 5).forEach(i => console.log(`    - ${(i.message || '').substring(0, 120)}`));
        failed++;
    }
}

// TagsValidator (TAG-001/002): catches case-variant tags + tagless-modules summary.
// Cherry-picked from Stragglers branch 2026-05-04. Baseline locked at current platform count.
{
    const TagsValidator = require(path.join(EDUSCAN_DIR, 'validators/syntax/tags'));
    const tagV = new TagsValidator({ rootPath: ROOT_PATH });
    const tagR = tagV.validate();
    const validCodes = ['TAG-001', 'TAG-002'];
    const badCodes = (tagR.issues || []).filter(i => !validCodes.includes(i.code));
    if (badCodes.length === 0) {
        console.log(`  ✓ TagsValidator — all ${(tagR.issues || []).length} issues use TAG-001/002 codes`);
        passed++;
    } else {
        console.log(`  ✗ TagsValidator — found ${badCodes.length} issues with invalid codes: ${[...new Set(badCodes.map(i => i.code))].join(', ')}`);
        failed++;
    }
    const TAG_BASELINE = 24;
    const tagCount = (tagR.issues || []).length;
    if (tagCount <= TAG_BASELINE) {
        console.log(`  ✓ TagsValidator — at-or-below baseline (${tagCount} ≤ ${TAG_BASELINE} known tag issues)`);
        passed++;
    } else {
        console.log(`  ✗ TagsValidator — NEW tag issues (${tagCount} > ${TAG_BASELINE} baseline):`);
        (tagR.issues || []).slice(0, 5).forEach(i => console.log(`    - ${i.code}: ${(i.message || '').substring(0, 120)}`));
        failed++;
    }
}

// ContentBlobValidator + DependencyCheckValidator: regression — production house indices and module HTMLs should not exhibit BLOB or DEP issues at scale
// (per-file fixture coverage is in the fixture suite; integration just confirms validators don't crash on real content)
{
    const blobV = new ContentBlobValidator({ profile: 'strict' });
    const depV = new DependencyCheckValidator({ profile: 'strict' });
    const Scanner = require(path.join(EDUSCAN_DIR, 'scanner'));
    const ParserOrchestrator = require(path.join(EDUSCAN_DIR, 'parsers'));
    const sc = new Scanner({ rootPath: ROOT_PATH, verbose: false });
    const pa = new ParserOrchestrator({ verbose: false });
    const scanRes = sc.scan();
    const files = pa.parseAll(scanRes.files);
    let blobIssues = 0, depIssues = 0, blobThrew = 0, depThrew = 0;
    for (const f of files) {
        if (!f.path.endsWith('.html')) continue;
        let content = f.content;
        if (!content) {
            try { content = fs.readFileSync(path.resolve(ROOT_PATH, f.path), 'utf8'); } catch (_) { continue; }
        }
        const file = { ...f, content };
        try { blobIssues += blobV.validate(file).length; } catch (_) { blobThrew++; }
        try { depIssues += depV.validate(file).length; } catch (_) { depThrew++; }
    }
    if (blobThrew === 0 && depThrew === 0) {
        console.log(`  ✓ ContentBlobValidator + DependencyCheckValidator — ran cleanly across ${files.filter(f => f.path.endsWith('.html')).length} files (BLOB issues: ${blobIssues}, DEP issues: ${depIssues})`);
        passed++;
    } else {
        console.log(`  ✗ BLOB/DEP integration — BlobValidator threw on ${blobThrew} files, DepValidator threw on ${depThrew} files`);
        failed++;
    }
}

// InlineQuizShuffler: regression coverage for the Fisher-Yates anti-cheat
// component shipped 2026-05-09 for client-graded inline-pattern quizzes
// (4 PIS weekly quizzes affected by the cluster cheatability bug).
{
    const InlineQuizShuffler = require(path.join(EDUSCAN_DIR, '../../_app/components/InlineQuizShuffler'));

    let subPassed = 0, subFailed = 0;

    // T1: shuffleQuestion preserves correctness
    {
        const q = { q: 't', opts: ['A', 'B', 'C', 'D'], ans: 2 };
        const correct = q.opts[q.ans];
        InlineQuizShuffler.shuffleQuestion(q);
        if (q.opts[q.ans] === correct) subPassed++; else subFailed++;
    }
    // T2: throws on non-integer ans
    try {
        InlineQuizShuffler.shuffleQuestion({ opts: ['A','B','C','D'], ans: 'C' });
        subFailed++;
    } catch (e) { subPassed++; }
    // T3: throws on out-of-range ans
    try {
        InlineQuizShuffler.shuffleQuestion({ opts: ['A','B','C','D'], ans: 7 });
        subFailed++;
    } catch (e) { subPassed++; }
    // T4: length-1 opts unchanged
    {
        const q = { opts: ['only'], ans: 0 };
        InlineQuizShuffler.shuffleQuestion(q);
        if (q.opts[0] === 'only' && q.ans === 0) subPassed++; else subFailed++;
    }
    // T5: shuffleQuiz preserves correctness across multiple questions.
    // Note: shuffleQuiz runs a serverGrading sniff test on document HTML;
    // in this Node test harness root.document is undefined, so the guard
    // is bypassed (which is the intended fallback for non-browser callers).
    {
        const questions = [
            { q: 'Q1', opts: ['a','b','c','d'], ans: 0 },
            { q: 'Q2', opts: ['a','b','c','d'], ans: 1 },
            { q: 'Q3', opts: ['a','b','c','d'], ans: 2 }
        ];
        const correctTexts = questions.map(q => q.opts[q.ans]);
        InlineQuizShuffler.shuffleQuiz(questions);
        const stillCorrect = questions.every((q, i) => q.opts[q.ans] === correctTexts[i]);
        if (stillCorrect) subPassed++; else subFailed++;
    }
    // T6: distribution uniformity (1000 trials, each of 4 positions ≥ 200 < 300)
    {
        const counts = [0, 0, 0, 0];
        for (let i = 0; i < 1000; i++) {
            const q = { opts: ['a','b','c','d'], ans: 0 };
            InlineQuizShuffler.shuffleQuestion(q);
            counts[q.ans]++;
        }
        const uniform = counts.every(c => c > 200 && c < 300);
        if (uniform) subPassed++; else subFailed++;
    }

    if (subFailed === 0) {
        console.log(`  ✓ InlineQuizShuffler — all ${subPassed} unit tests pass (correctness, type guards, range guards, uniform distribution)`);
        passed++;
    } else {
        console.log(`  ✗ InlineQuizShuffler — ${subFailed}/${subPassed + subFailed} unit tests failed`);
        failed++;
    }
}

// ── strip-noncode shared util — contract pin ─────────────────────────
// Three consumers (validators/syntax/html.js, validators/syntax/
// dependency-check.js, nexus/adapters/deploy-check.js) share these
// functions with different FP/FN tolerances; these tests pin the
// documented guarantees so a change for one consumer can't silently
// regress the others (Nancy condition, 2026-07-23).
{
    const S = require(path.join(EDUSCAN_DIR, 'utils/strip-noncode.js'));
    let subPassed = 0, subFailed = 0;
    const check = (name, cond) => { if (cond) subPassed++; else { subFailed++; console.log(`    ✗ strip-noncode: ${name}`); } };

    // T1: length + line-count preservation across all three exports
    const sample = '<html><!-- multi\nline -->\n<script>var a = "x"; // c\n/* b\nc */ var d = 1;</script>\n<p>t</p></html>';
    for (const fn of ['neutralizeInlineScripts', 'stripHtmlComments', 'stripNonCode']) {
        const out = S[fn](sample);
        check(`${fn} length-preserving`, out.length === sample.length);
        check(`${fn} line-preserving`, out.split('\n').length === sample.split('\n').length);
    }
    // T2: string-before-comment order — `//` inside a string must not eat code after it
    const t2 = '<script>var u = "http://x.io"; Foo.bar();</script>';
    check('URL-in-string does not comment-eat code', S.neutralizeInlineScripts(t2).includes('Foo.bar()'));
    // T3: fake HTML-comment opener inside a JS string cannot fool the HTML-comment pass
    const t3 = '<script>var s = "<!--";</script><p>KEEP</p><script>x();</script> -->';
    check('fake <!-- in JS string does not swallow markup', S.stripNonCode(t3).includes('KEEP'));
    // T4: external <script src> tags untouched (attribute values intact)
    const t4 = '<script src="/components/ModuleProgress.js"></script>';
    check('external src tag preserved', S.stripNonCode(t4).includes('ModuleProgress.js'));
    // T5: comment-wrapped call blanked; live call kept
    const t5 = '<!-- <script>Foo.fire("x");</script> --><script>Bar.keep("y");</script>';
    const t5out = S.stripNonCode(t5);
    check('comment-wrapped call blanked', !t5out.includes('Foo.fire'));
    check('live call kept', t5out.includes('Bar.keep'));
    // T6: commented-out script load removed
    const t6 = '<!-- <script src="/components/ModuleProgress.js"></script> -->';
    check('commented-out load removed', !S.stripNonCode(t6).includes('ModuleProgress.js'));

    if (subFailed === 0) {
        console.log(`  ✓ strip-noncode — all ${subPassed} unit tests pass (length/line preservation, strip ordering, src exclusion, comment neutralization)`);
        passed++;
    } else {
        console.log(`  ✗ strip-noncode — ${subFailed}/${subPassed + subFailed} unit tests failed`);
        failed++;
    }
}

console.log('');
console.log(`Results: ${passed}/${passed + failed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
