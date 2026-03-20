#!/usr/bin/env node

/**
 * EduScan CLI - Command Line Interface
 *
 * Usage:
 *   node cli.js [options]
 *   npx eduscan [options]
 *
 * Options:
 *   -p, --path <dir>       Root directory to scan (default: ./_app)
 *   -o, --output <dir>     Output directory (default: ./_tools/reports)
 *   -f, --format <type>    Output: json, md, both (default: both)
 *   -v, --verbose          Show detailed progress
 *   -q, --quiet            Only output errors
 *   --issues-only          Skip full map, only show issues
 *   --json                 Output issues as JSON to stdout
 *   --diff                 Compare against previous scan (drift analysis)
 *   --archive              Save scan to history for future comparisons
 *   --orphans-only         Only run orphan detection
 *   --deep                 Enable deep reachability crawl for filesystem orphans
 *   --syntax-only          Only run syntax validation
 *   --syntax=<profile>     Syntax profile: ci (default), strict, inventory
 *   --coverage             Run coverage analysis (curriculum gaps)
 *   --remediation          Generate PATCH_PLAN.md and PATCH_PLAN.json
 *   --no-syntax            Disable syntax validation in full scans
 *   --watch                Watch mode - re-scan on file changes
 *   --functional           Run functional validation (headless browser)
 *   --smoke-only           Only run smoke tests (with --functional)
 *   --runtime-only         Only run runtime checks (with --functional)
 *   --fix                  Auto-fix safe issues (dry-run by default)
 *   --fix --apply          Auto-fix and write changes to disk
 *   --dry-run              Explicit dry-run (default with --fix)
 *   --no-color             Disable colored output
 *   -h, --help             Show help
 *   --version              Show version
 */

const path = require('path');
const fs = require('fs');
const EduScan = require('./index');
const DriftTracker = require('./utils/drift');
const RemediationPlanner = require('./utils/remediation');
const AutoFixer = require('./fixers/auto-fixer');

// Parse command line arguments
function parseArgs(args) {
    const options = {
        path: './_app',
        outputDir: './_tools/reports',
        format: 'both',
        verbose: false,
        quiet: false,
        issuesOnly: false,
        jsonOutput: false,
        colors: true,
        diff: false,
        archive: false,
        orphansOnly: false,
        deepOrphans: false,
        syntaxOnly: false,
        enableSyntax: true,         // Syntax validation enabled by default
        syntaxProfile: 'ci',        // 'ci', 'strict', or 'inventory'
        coverageOnly: false,        // Only run coverage analysis
        flowOnly: false,            // Only run flow validation
        enableFlow: true,           // Flow validation enabled by default
        remediation: false,         // Generate remediation plan
        reachabilityMode: 'links',  // 'links' or 'links+registry'
        failOn: null,               // 'critical', 'critical,high', etc.
        warnOnly: false,
        watch: false,               // Watch mode - re-scan on changes
        functional: false,          // Run functional validation (headless browser)
        smokeOnly: false,           // Only run smoke tests (with --functional)
        runtimeOnly: false,         // Only run runtime checks (with --functional)
        impactOnly: false,          // Run impact analysis (dependency map + contracts)
        impactFile: null,           // Analyze impact of specific file
        fix: false,                 // Run auto-fixer on scan results
        dryRun: true,               // Dry-run mode for --fix (default: true)
        help: false,
        version: false
    };

    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        const nextArg = args[i + 1];

        // Handle --syntax=<profile> format (before switch)
        if (arg.startsWith('--syntax=')) {
            const profile = arg.split('=')[1];
            if (['ci', 'strict', 'inventory'].includes(profile)) {
                options.syntaxProfile = profile;
                options.syntaxOnly = true;
            } else {
                console.error(`Invalid syntax profile: ${profile}`);
                console.error('Valid profiles: ci, strict, inventory');
                process.exit(1);
            }
            continue;
        }

        switch (arg) {
            case '-p':
            case '--path':
                options.path = nextArg;
                i++;
                break;

            case '-o':
            case '--output':
                options.outputDir = nextArg;
                i++;
                break;

            case '-f':
            case '--format':
                options.format = nextArg;
                i++;
                break;

            case '-v':
            case '--verbose':
                options.verbose = true;
                break;

            case '-q':
            case '--quiet':
                options.quiet = true;
                break;

            case '--issues-only':
                options.issuesOnly = true;
                break;

            case '--json':
                options.jsonOutput = true;
                options.quiet = true;
                break;

            case '--diff':
                options.diff = true;
                break;

            case '--archive':
                options.archive = true;
                break;

            case '--orphans-only':
            case '--orphans':
                options.orphansOnly = true;
                break;

            case '--deep':
                options.deepOrphans = true;
                break;

            case '--syntax-only':
                options.syntaxOnly = true;
                break;

            case '--coverage':
            case '--coverage-only':
                options.coverageOnly = true;
                break;

            case '--flow':
            case '--flow-only':
                options.flowOnly = true;
                break;

            case '--no-flow':
                options.enableFlow = false;
                break;

            case '--remediation':
            case '--patch-plan':
                options.remediation = true;
                break;

            case '--no-syntax':
                options.enableSyntax = false;
                break;

            case '--reachability':
                options.reachabilityMode = nextArg || 'links';
                i++;
                break;

            case '--fail-on':
                options.failOn = nextArg || 'critical';
                i++;
                break;

            case '--warn-only':
                options.warnOnly = true;
                break;

            case '--no-color':
                options.colors = false;
                break;

            case '-w':
            case '--watch':
                options.watch = true;
                break;

            case '--functional':
                options.functional = true;
                break;

            case '--smoke-only':
                options.smokeOnly = true;
                options.functional = true;
                break;

            case '--runtime-only':
                options.runtimeOnly = true;
                options.functional = true;
                break;

            case '--fix':
                options.fix = true;
                break;

            case '--dry-run':
                options.dryRun = true;
                break;

            case '--apply':
                options.fix = true;
                options.dryRun = false;
                break;

            case '--impact':
            case '--impact-only':
                options.impactOnly = true;
                break;

            case '--impact-file':
                options.impactOnly = true;
                options.impactFile = nextArg;
                i++;
                break;

            // ── Verification: Human-in-the-loop false positive labeling ──
            case '--verify':
                // Usage: --verify <code> <file> [line] --reason "explanation"
                options.verifyMode = true;
                options.verifyCode = nextArg;
                i++;
                break;

            case '--verify-file':
                options.verifyFile = nextArg;
                i++;
                break;

            case '--verify-line':
                options.verifyLine = parseInt(nextArg, 10);
                i++;
                break;

            case '--reason':
                options.verifyReason = nextArg;
                i++;
                break;

            case '--unverify':
                // Remove a verification label
                options.unverifyMode = true;
                options.verifyCode = nextArg;
                i++;
                break;

            case '--show-verified':
                // List all verified false positives
                options.showVerified = true;
                break;

            case '-h':
            case '--help':
                options.help = true;
                break;

            case '--version':
                options.version = true;
                break;
        }
    }

    return options;
}

// Print help
function printHelp() {
    console.log(`
EduScan v1.4.0 - Content Topology Scanner for Educational Platforms

Usage: eduscan [options]

Options:
  -p, --path <dir>       Root directory to scan (default: ./_app)
  -o, --output <dir>     Output directory (default: ./_tools/reports)
  -f, --format <type>    Output: json, md, both (default: both)
  -v, --verbose          Show detailed progress
  -q, --quiet            Only output errors and final summary
  --issues-only          Skip full map, only show issues
  --json                 Output issues as JSON to stdout (implies --quiet)
  --diff                 Compare against previous scan (drift analysis)
  --archive              Save scan to history for future --diff comparisons
  --orphans-only         Only run orphan detection (registry + filesystem)
  --deep                 Enable deep reachability crawl for filesystem orphans
  --syntax-only          Only run syntax validation (HTML, JS, engines, paths)
  --syntax=<profile>     Syntax validation profile (implies --syntax-only):
                           ci        Critical/high issues only, conservative rules (default)
                           strict    Full coverage including hygiene issues
                           inventory Collect all stats, never fail (exit code 0)
  --no-syntax            Disable syntax validation in full scans
  --coverage             Run coverage analysis (modules without quizzes/labs)
  --flow                 Run flow validation only (unchained content detection)
  --no-flow              Disable flow validation in full scans
  --remediation          Generate PATCH_PLAN.md/json with grouped fixes
  --reachability <mode>  Reachability mode: links (default), links+registry
  --fail-on <severities> Exit with error if issues found (e.g., "critical,high")
  --warn-only            Never exit with error code (for CI adoption)
  -w, --watch            Watch mode - re-scan automatically on file changes
  --functional           Run functional validation (headless browser, Puppeteer)
  --smoke-only           Only run smoke tests (with --functional)
  --runtime-only         Only run runtime checks (with --functional)
  --fix                  Auto-fix safe issues (dry-run by default, shows what would change)
  --fix --apply          Auto-fix safe issues and write changes to disk
  --dry-run              Explicit dry-run mode (default with --fix)
  --impact               Run impact analysis (dependency map + contract validation)
  --impact-file <path>   Analyze impact of a specific file change
  --no-color             Disable colored output

Verification (Human-in-the-Loop False Positive Labeling):
  --verify <CODE>        Label a finding as verified false positive
    --verify-file <FILE>   File path (relative to _app/)
    --verify-line <N>      Line number (optional, enables hash expiration)
    --reason "text"        Why this is a false positive (required)
  --unverify <CODE>      Remove a verification label
    --verify-file <FILE>   File path to un-verify
    --verify-line <N>      Line number (optional)
  --show-verified        List all verified false positive labels

  -h, --help             Show this help message
  --version              Show version

Examples:
  eduscan                            # Scan _app/ with default settings
  eduscan -v                         # Verbose output
  eduscan --issues-only              # Quick issue check
  eduscan --diff                     # Show changes since last scan
  eduscan --archive                  # Save scan for future comparisons
  eduscan --diff --archive           # Compare + save for next time
  eduscan --orphans-only             # Quick orphan check (registry only)
  eduscan --orphans-only --deep      # Full orphan scan with reachability
  eduscan --deep --reachability links+registry  # Include registry as reachable
  eduscan --syntax-only              # Check for syntax errors only (ci profile)
  eduscan --syntax=strict            # Full syntax coverage
  eduscan --syntax=inventory         # Collect stats only, no failures
  eduscan --no-syntax                # Skip syntax validation
  eduscan --coverage                 # Analyze curriculum coverage gaps
  eduscan --flow                     # Detect unchained content (no learning path)
  eduscan --remediation              # Generate PATCH_PLAN with fix batches
  eduscan --syntax-only --remediation  # Syntax scan + remediation plan
  eduscan --fail-on critical         # CI gate: fail only on critical
  eduscan --fail-on critical,high    # CI gate: fail on critical or high
  eduscan --warn-only                # Never fail (for gradual adoption)
  eduscan --watch                    # Watch mode - re-scan on file changes
  eduscan --syntax=ci --watch        # Watch with syntax-only CI profile
  eduscan --functional               # Full functional scan (runtime + smoke)
  eduscan --functional --smoke-only  # Quick smoke tests only (~15s)
  eduscan --functional --runtime-only  # Runtime checks only (all pages)
  eduscan --fix                       # Dry-run: show what auto-fixer would change
  eduscan --fix --apply              # Apply auto-fixes to disk
  eduscan -p ./src -o ./audit        # Custom paths

  # Verification workflow (label false positives):
  eduscan --verify HEUR-009 --verify-file houses/code/quizzes/code-cloudformation.quiz.html --verify-line 108 --reason "CloudFormation !Sub syntax in quiz question"
  eduscan --show-verified              # Audit all labels
  eduscan --unverify HEUR-009 --verify-file houses/code/quizzes/code-cloudformation.quiz.html  # Remove label
  eduscan --json | jq '.[]'          # Pipe issues to jq

Severity Levels:
  CRITICAL   Breaks sync/grading/compliance (must fix)
  HIGH       Breaks analytics or progress tracking
  MEDIUM     Affects reporting consistency
  LOW        Hygiene, legacy, informational

Issue Codes:
  ID-*           moduleId issues (house prefix, -quiz suffix)
  SYNC-*         Sync compatibility issues
  REG-*          Registry issues (not registered)
  REG-ORPHAN-*   Registry orphans (declared but file missing)
  FS-ORPHAN-*    Filesystem orphans (exist but unreachable)
  FS-DEADPATH-*  Dead directories (no inbound references)
  GATE-*         Gate integrity issues (broken progression)
  TRACK-*        Progress tracking issues
  CFG-*          Configuration issues
  HTML-*         HTML structural errors (unclosed tags, duplicate IDs)
  JS-*           JavaScript syntax errors (brackets, quotes)
  ENG-*          Missing engine/library (undefined globals)
  PATH-*         Broken paths (404 resources)
  COV-*          Coverage gaps (missing quizzes, labs, assessments)
  FLOW-*         Unchained content (not in any learning progression)
  NAV-*          Navigation issues (missing back buttons, dashboard links)
  FUNC-*         Functional issues (runtime errors, smoke test failures)

Orphan Reason Codes (with --deep):
  NOT-IN-REGISTRY    File not declared in content-registry.js
  NOT-LINKED         Not linked from any crawled page
  ROUTER-ONLY        Only accessible via dynamic routing (dashboard)
  PATH-MISMATCH      Case sensitivity or path format issue
  LIFECYCLE-ARCHIVE  Marked as archived via directive
  LIFECYCLE-DRAFT    Marked as draft via directive

Lifecycle Directives:
  <!-- eduscan-lifecycle: status="draft|live|archive|gated" owner="Name" -->
  <!-- eduscan-lifecycle: status="gated" gates=5 reason="Puzzle progression" -->

Ignore Directives:
  <!-- eduscan-ignore: ID-001 reason="legacy content" -->
  <!-- eduscan-ignore-all reason="archived module" -->

Reports:
  TREASURE_MAP.json    Machine-readable content map + issues
  TREASURE_MAP.md      Human-readable report
  PATCH_PLAN.json      Remediation plan (grouped by subtree/code)
  PATCH_PLAN.md        Human-readable fix batches
  history/*.json       Archived scans for drift tracking

For more information: _tools/EDUSCAN_DESIGN.md
`);
}

// Print version
function printVersion() {
    console.log('EduScan v1.4.0');
}

// Main execution
function main() {
    const args = process.argv.slice(2);
    const options = parseArgs(args);

    // Handle help and version
    if (options.help) {
        printHelp();
        process.exit(0);
    }

    if (options.version) {
        printVersion();
        process.exit(0);
    }

    // ── Verification Commands ──────────────────────────────────
    // Human-in-the-loop labeling for false positives.
    // These commands manage the verified-findings.json store without
    // running a full scan. Think of it like labeling training data —
    // the human reviews a finding, decides it's a false positive,
    // and labels it so the scanner respects that decision on future runs.
    if (options.showVerified) {
        const VerificationEngine = require('./utils/verification');
        const verifier = new VerificationEngine({ verbose: true });
        const entries = verifier.getAll();
        const stats = verifier.getStats();

        console.log('');
        console.log('\x1b[1mVERIFIED FALSE POSITIVES\x1b[0m');
        console.log('\x1b[2m' + '─'.repeat(60) + '\x1b[0m');

        if (entries.length === 0) {
            console.log('  \x1b[2mNo verified findings.\x1b[0m');
        } else {
            entries.forEach(e => {
                console.log(`  \x1b[33m${e.code}\x1b[0m  ${e.file}${e.line ? ':' + e.line : ''}`);
                console.log(`    \x1b[2mReason: ${e.reason}\x1b[0m`);
                console.log(`    \x1b[2mVerified by: ${e.verifiedBy} on ${e.date}${e.hash ? ' [hash:' + e.hash + ']' : ''}\x1b[0m`);
            });
            console.log('');
            console.log(`  \x1b[1m${stats.total}\x1b[0m label(s) total`);
            for (const [code, count] of Object.entries(stats.byCode)) {
                console.log(`    ${code}: ${count}`);
            }
        }
        console.log('');
        process.exit(0);
    }

    if (options.verifyMode) {
        const VerificationEngine = require('./utils/verification');
        const verifier = new VerificationEngine({ verbose: true });

        const code = options.verifyCode;
        const file = options.verifyFile;
        const line = options.verifyLine || null;
        const reason = options.verifyReason;

        if (!code || !file || !reason) {
            console.error('\x1b[31mUsage: eduscan --verify <CODE> --verify-file <FILE> [--verify-line <N>] --reason "explanation"\x1b[0m');
            console.error('  Example: eduscan --verify HEUR-009 --verify-file houses/code/quizzes/code-cloudformation.quiz.html --verify-line 108 --reason "CloudFormation !Sub syntax in quiz question text"');
            process.exit(1);
        }

        // Read the line content for hash fingerprinting
        let lineContent = '';
        if (line) {
            try {
                const fullPath = path.resolve(process.cwd(), '_app', file);
                const content = require('fs').readFileSync(fullPath, 'utf8');
                const lines = content.split('\n');
                lineContent = lines[line - 1] || '';
            } catch (e) {
                console.log(`\x1b[33m[WARN]\x1b[0m Could not read line content for hashing: ${e.message}`);
            }
        }

        const entry = verifier.addVerification({
            code,
            file,
            line,
            reason,
            verifiedBy: require('os').userInfo().username,
            lineContent
        });

        console.log('');
        console.log('\x1b[32m[VERIFIED]\x1b[0m False positive labeled:');
        console.log(`  Code:     ${entry.code}`);
        console.log(`  File:     ${entry.file}`);
        if (entry.line) console.log(`  Line:     ${entry.line}`);
        console.log(`  Hash:     ${entry.hash || '(none)'}`);
        console.log(`  Reason:   ${entry.reason}`);
        console.log(`  Verified: ${entry.verifiedBy} on ${entry.date}`);
        console.log('');
        console.log('\x1b[2mThis finding will be suppressed on future scans.\x1b[0m');
        console.log('\x1b[2mIf the code changes, the label expires and it will be re-flagged.\x1b[0m');
        console.log('');
        process.exit(0);
    }

    if (options.unverifyMode) {
        const VerificationEngine = require('./utils/verification');
        const verifier = new VerificationEngine({ verbose: true });

        const code = options.verifyCode;
        const file = options.verifyFile;
        const line = options.verifyLine;

        if (!code || !file) {
            console.error('\x1b[31mUsage: eduscan --unverify <CODE> --verify-file <FILE> [--verify-line <N>]\x1b[0m');
            process.exit(1);
        }

        const removed = verifier.removeVerification(code, file, line);
        console.log(`\x1b[33m[REMOVED]\x1b[0m ${removed} verification label(s) for ${code} in ${file}`);
        console.log('');
        process.exit(0);
    }

    // Resolve paths relative to current working directory
    options.path = path.resolve(process.cwd(), options.path);
    options.outputDir = path.resolve(process.cwd(), options.outputDir);

    // Color function for console output
    const colorFn = options.colors
        ? (text, ...colors) => {
            const ansi = {
                reset: '\x1b[0m', bright: '\x1b[1m', dim: '\x1b[2m',
                red: '\x1b[31m', green: '\x1b[32m', yellow: '\x1b[33m',
                blue: '\x1b[34m', magenta: '\x1b[35m', cyan: '\x1b[36m'
            };
            const codes = colors.map(c => ansi[c] || '').join('');
            return `${codes}${text}${ansi.reset}`;
        }
        : (text) => text;

    // Watch mode - run watcher instead of single scan
    if (options.watch) {
        runWatch(options, colorFn);
        return; // Watch mode runs indefinitely
    }

    try {
        const scanner = new EduScan(options);
        const driftTracker = new DriftTracker({
            historyDir: path.join(options.outputDir, 'history'),
            currentReportPath: path.join(options.outputDir, 'TREASURE_MAP.json')
        });

        // Initialize remediation planner if flag is set
        const remediationPlanner = options.remediation ? new RemediationPlanner({
            outputDir: options.outputDir,
            verbose: options.verbose
        }) : null;

        if (options.fix) {
            // Auto-fixer mode
            runFix(options, colorFn);
            return;
        }

        if (options.impactOnly) {
            // Impact analysis (dependency map + contract validation)
            runImpact(options, colorFn);
            return;
        }

        if (options.functional) {
            // Functional validation (async - headless browser)
            runFunctional(options, colorFn);
            return;
        }

        if (options.orphansOnly) {
            // Orphan-only scan
            const results = scanner.orphanScan();

            if (options.jsonOutput) {
                console.log(JSON.stringify(results.orphans, null, 2));
            }

            // Generate remediation plan if requested
            if (options.remediation) {
                const plan = remediationPlanner.generatePlan(results);
                const saved = remediationPlanner.savePlan(plan);
                if (!options.quiet) {
                    console.log(remediationPlanner.formatForConsole(plan, colorFn));
                    console.log(`  Saved: ${saved.json.path}`);
                    console.log(`  Saved: ${saved.markdown.path}`);
                    console.log('');
                }
            }

            // Determine exit code based on orphan issues
            const exitCode = determineExitCode(results.orphans.issues, options);
            if (exitCode !== 0) {
                process.exit(exitCode);
            }
        } else if (options.syntaxOnly) {
            // Syntax-only scan
            const results = scanner.syntaxScan();

            if (options.jsonOutput) {
                console.log(JSON.stringify(results.syntax, null, 2));
            }

            // Generate remediation plan if requested
            if (options.remediation) {
                const plan = remediationPlanner.generatePlan(results);
                const saved = remediationPlanner.savePlan(plan);
                if (!options.quiet) {
                    console.log(remediationPlanner.formatForConsole(plan, colorFn));
                    console.log(`  Saved: ${saved.json.path}`);
                    console.log(`  Saved: ${saved.markdown.path}`);
                    console.log('');
                }
            }

            // Determine exit code based on syntax issues
            const exitCode = determineExitCode(results.syntax.issues, options);
            if (exitCode !== 0) {
                process.exit(exitCode);
            }
        } else if (options.flowOnly) {
            // Flow-only scan
            const results = scanner.flowScan();

            if (options.jsonOutput) {
                console.log(JSON.stringify(results.flow, null, 2));
            }

            // Generate remediation plan if requested
            if (options.remediation) {
                const plan = remediationPlanner.generatePlan(results);
                const saved = remediationPlanner.savePlan(plan);
                if (!options.quiet) {
                    console.log(remediationPlanner.formatForConsole(plan, colorFn));
                    console.log(`  Saved: ${saved.json.path}`);
                    console.log(`  Saved: ${saved.markdown.path}`);
                    console.log('');
                }
            }

            // Determine exit code based on flow issues
            const exitCode = determineExitCode(results.flow.issues, options);
            if (exitCode !== 0) {
                process.exit(exitCode);
            }
        } else if (options.coverageOnly) {
            // Coverage analysis scan
            const results = scanner.coverageScan();

            if (options.jsonOutput) {
                // Output simplified report format for JSON
                const CoverageAnalyzer = require('./validators/coverage');
                const analyzer = new CoverageAnalyzer();
                const simpleReport = analyzer.getSimpleReport(results.coverage);
                console.log(JSON.stringify(simpleReport, null, 2));
            }

            // Generate remediation plan if requested
            if (options.remediation) {
                const plan = remediationPlanner.generatePlan(results);
                const saved = remediationPlanner.savePlan(plan);
                if (!options.quiet) {
                    console.log(remediationPlanner.formatForConsole(plan, colorFn));
                    console.log(`  Saved: ${saved.json.path}`);
                    console.log(`  Saved: ${saved.markdown.path}`);
                    console.log('');
                }
            }

            // Determine exit code based on coverage issues
            const exitCode = determineExitCode(results.coverage.issues, options);
            if (exitCode !== 0) {
                process.exit(exitCode);
            }
        } else if (options.jsonOutput) {
            // Quick scan, output JSON to stdout
            const issues = scanner.quickScan();
            console.log(JSON.stringify(issues, null, 2));
        } else {
            // Full scan
            const results = scanner.scan();

            // Drift analysis if requested
            if (options.diff) {
                const jsonReport = {
                    meta: { scannedAt: new Date().toISOString() },
                    issues: results.validation.issues,
                    syncStatus: results.validation.syncStatus
                };

                const drift = driftTracker.compare(jsonReport);
                console.log(driftTracker.formatForConsole(drift, colorFn));
            }

            // Archive if requested
            if (options.archive) {
                const jsonReport = {
                    meta: { scannedAt: new Date().toISOString() },
                    issues: results.validation.issues,
                    syncStatus: results.validation.syncStatus,
                    summary: {
                        totalIssues: results.validation.issues.length,
                        critical: results.validation.issues.filter(i => i.severity === 'critical').length,
                        syncReady: results.validation.syncStatus.ready
                    }
                };

                const archivePath = driftTracker.archiveReport(jsonReport);
                if (!options.quiet) {
                    console.log(`  Archived to: ${archivePath}`);
                    console.log('');
                }
            }

            // Generate remediation plan if requested
            if (options.remediation) {
                const plan = remediationPlanner.generatePlan(results);
                const saved = remediationPlanner.savePlan(plan);
                if (!options.quiet) {
                    console.log(remediationPlanner.formatForConsole(plan, colorFn));
                    console.log(`  Saved: ${saved.json.path}`);
                    console.log(`  Saved: ${saved.markdown.path}`);
                    console.log('');
                }
            }

            // Determine exit code based on --fail-on and --warn-only
            const exitCode = determineExitCode(results.validation.issues, options);
            if (exitCode !== 0) {
                process.exit(exitCode);
            }
        }

    } catch (err) {
        console.error(`Error: ${err.message}`);
        if (options.verbose) {
            console.error(err.stack);
        }
        process.exit(2);
    }
}

/**
 * Determine exit code based on issues and policy options
 * @param {Array} issues - Array of issue objects
 * @param {Object} options - CLI options
 * @returns {number} Exit code (0 = success, 1 = issues found)
 */
function determineExitCode(issues, options) {
    // --warn-only always returns success
    if (options.warnOnly) {
        return 0;
    }

    // Inventory mode never fails (syntax=inventory)
    if (options.syntaxProfile === 'inventory') {
        return 0;
    }

    // Parse --fail-on severities
    const failOnSeverities = options.failOn
        ? options.failOn.toLowerCase().split(',').map(s => s.trim())
        : ['critical']; // Default: only fail on critical

    // Count issues by severity
    const counts = {
        critical: issues.filter(i => i.severity === 'critical').length,
        high: issues.filter(i => i.severity === 'high').length,
        medium: issues.filter(i => i.severity === 'medium').length,
        low: issues.filter(i => i.severity === 'low').length
    };

    // Check if any fail-on severity has issues
    for (const severity of failOnSeverities) {
        if (counts[severity] > 0) {
            return 1;
        }
    }

    return 0;
}

/**
 * Run a single scan cycle (used by both normal and watch modes)
 * @param {Object} options - CLI options
 * @param {Function} colorFn - Color function
 * @returns {Object} Scan results and exit code
 */
function runScanCycle(options, colorFn) {
    const EduScan = require('./index');
    const RemediationPlanner = require('./utils/remediation');

    const scanner = new EduScan(options);
    const remediationPlanner = options.remediation ? new RemediationPlanner({
        outputDir: options.outputDir,
        verbose: options.verbose
    }) : null;

    let results = null;
    let exitCode = 0;

    if (options.orphansOnly) {
        results = scanner.orphanScan();
        if (options.remediation && remediationPlanner) {
            const plan = remediationPlanner.generatePlan(results);
            remediationPlanner.savePlan(plan);
        }
        exitCode = determineExitCode(results.orphans.issues, options);
    } else if (options.syntaxOnly) {
        results = scanner.syntaxScan();
        if (options.remediation && remediationPlanner) {
            const plan = remediationPlanner.generatePlan(results);
            remediationPlanner.savePlan(plan);
        }
        exitCode = determineExitCode(results.syntax.issues, options);
    } else if (options.flowOnly) {
        results = scanner.flowScan();
        if (options.remediation && remediationPlanner) {
            const plan = remediationPlanner.generatePlan(results);
            remediationPlanner.savePlan(plan);
        }
        exitCode = determineExitCode(results.flow.issues, options);
    } else if (options.coverageOnly) {
        results = scanner.coverageScan();
        if (options.remediation && remediationPlanner) {
            const plan = remediationPlanner.generatePlan(results);
            remediationPlanner.savePlan(plan);
        }
        exitCode = determineExitCode(results.coverage.issues, options);
    } else {
        results = scanner.scan();
        if (options.remediation && remediationPlanner) {
            const plan = remediationPlanner.generatePlan(results);
            remediationPlanner.savePlan(plan);
        }
        exitCode = determineExitCode(results.validation.issues, options);
    }

    return { results, exitCode };
}

/**
 * Watch mode - re-scan on file changes
 * @param {Object} options - CLI options
 * @param {Function} colorFn - Color function
 */
function runWatch(options, colorFn) {
    const c = colorFn;
    let debounceTimer = null;
    let isScanning = false;
    let scanCount = 0;

    // Clear console helper
    const clearConsole = () => {
        process.stdout.write('\x1b[2J\x1b[0f');
    };

    // Run scan and show results
    const doScan = () => {
        if (isScanning) return;
        isScanning = true;
        scanCount++;

        clearConsole();

        console.log(c('╔═══════════════════════════════════════════════════════════════╗', 'cyan'));
        console.log(c('║', 'cyan') + c('                     EDUSCAN WATCH MODE                        ', 'bright', 'cyan') + c('║', 'cyan'));
        console.log(c('╚═══════════════════════════════════════════════════════════════╝', 'cyan'));
        console.log('');
        console.log(c(`  Scan #${scanCount} at ${new Date().toLocaleTimeString()}`, 'dim'));
        console.log('');

        try {
            const { results, exitCode } = runScanCycle(options, colorFn);

            console.log('');
            console.log(c('─'.repeat(60), 'dim'));

            if (exitCode === 0) {
                console.log(c('  ✓ No blocking issues', 'green'));
            } else {
                console.log(c('  ✗ Issues detected (would fail CI)', 'red'));
            }

            console.log('');
            console.log(c('  Watching for changes... (Ctrl+C to stop)', 'dim'));
            console.log('');
        } catch (err) {
            console.error(c(`  Error: ${err.message}`, 'red'));
            if (options.verbose) {
                console.error(err.stack);
            }
            console.log('');
            console.log(c('  Watching for changes... (Ctrl+C to stop)', 'dim'));
        }

        isScanning = false;
    };

    // Debounced change handler
    const onFileChange = (eventType, filename) => {
        // Skip hidden files, node_modules, and report files
        if (filename && (
            filename.startsWith('.') ||
            filename.includes('node_modules') ||
            filename.includes('TREASURE_MAP') ||
            filename.includes('PATCH_PLAN')
        )) {
            return;
        }

        // Clear existing timer
        if (debounceTimer) {
            clearTimeout(debounceTimer);
        }

        // Set new timer (debounce 500ms)
        debounceTimer = setTimeout(doScan, 500);
    };

    // Initial scan
    doScan();

    // Set up file watcher
    try {
        const watchPath = options.path;

        // Use recursive watch (Node 14+)
        const watcher = fs.watch(watchPath, { recursive: true }, onFileChange);

        // Handle watcher errors
        watcher.on('error', (err) => {
            console.error(c(`  Watch error: ${err.message}`, 'red'));
        });

        // Handle Ctrl+C gracefully
        process.on('SIGINT', () => {
            console.log('');
            console.log(c('  Watch mode stopped.', 'dim'));
            watcher.close();
            process.exit(0);
        });

    } catch (err) {
        console.error(c(`  Failed to start watch: ${err.message}`, 'red'));
        console.error(c('  Make sure the path exists and is accessible.', 'dim'));
        process.exit(1);
    }
}

/**
 * Run auto-fixer on scan results
 * @param {Object} options - CLI options
 * @param {Function} colorFn - Color function
 */
function runFix(options, colorFn) {
    const c = colorFn;

    console.log('');
    console.log(c('╔═══════════════════════════════════════════════════════════════╗', 'cyan'));
    console.log(c('║', 'cyan') + c('              EDUSCAN AUTO-FIXER                               ', 'bright', 'cyan') + c('║', 'cyan'));
    console.log(c('╚═══════════════════════════════════════════════════════════════╝', 'cyan'));
    console.log('');

    // Step 1: Run a full scan to collect all issues (parser + syntax + validation)
    if (!options.quiet) {
        console.log(c('  [1/3] Running full scan to find fixable issues...', 'dim'));
    }

    // Run scan with quiet output to suppress the normal report
    const scanOptions = { ...options, quiet: true, jsonOutput: false };
    const scanner = new EduScan(scanOptions);
    const scanResults = scanner.scan();
    const validationIssues = scanResults.validation ? scanResults.validation.issues : [];
    const syntaxIssues = scanResults.syntax ? scanResults.syntax.issues : [];
    const allIssues = [...validationIssues, ...syntaxIssues];

    // Count autoFixable issues
    const fixableCount = allIssues.filter(i => i.autoFixable).length;

    if (!options.quiet) {
        console.log(c(`        Found ${allIssues.length} total issues, ${fixableCount} auto-fixable`, 'dim'));
        console.log('');
    }

    if (fixableCount === 0) {
        console.log(c('  No auto-fixable issues found.', 'green'));
        console.log('');
        return;
    }

    // Step 2: Run auto-fixer
    if (!options.quiet) {
        console.log(c(`  [2/3] Applying fixes (${options.dryRun ? 'DRY RUN' : 'LIVE'})...`, 'dim'));
        console.log('');
    }

    const fixer = new AutoFixer({
        rootPath: options.path,
        dryRun: options.dryRun,
        verbose: options.verbose
    });

    const fixResults = fixer.fix(allIssues);

    // Step 3: Display results
    if (!options.quiet) {
        console.log(c('  [3/3] Results:', 'dim'));
        console.log('');
        console.log(fixer.formatResults(fixResults, c));
        console.log('');
    }

    // JSON output mode
    if (options.jsonOutput) {
        console.log(JSON.stringify(fixResults, null, 2));
    }

    // Summary line
    if (!options.quiet) {
        console.log(c('═'.repeat(60), 'dim'));
        const statusColor = fixResults.summary.errors > 0 ? 'red' :
                           fixResults.summary.fixed > 0 ? 'green' : 'yellow';
        console.log(c(`  ${fixResults.summary.dryRun ? 'Would fix' : 'Fixed'}: ${fixResults.summary.fixed}  Skipped: ${fixResults.summary.skipped}  Errors: ${fixResults.summary.errors}`, statusColor));

        if (options.dryRun && fixResults.summary.fixed > 0) {
            console.log('');
            console.log(c('  To apply fixes: eduscan --fix --apply', 'yellow', 'bright'));
        }
        console.log('');
    }
}

/**
 * Run impact analysis (dependency map + contract validation)
 * @param {Object} options - CLI options
 * @param {Function} colorFn - Color function
 */
function runImpact(options, colorFn) {
    const c = colorFn;
    const ImpactAnalyzer = require('./validators/impact');
    const analyzer = new ImpactAnalyzer({
        rootPath: options.path,
        verbose: options.verbose
    });

    if (options.impactFile) {
        // Analyze impact of a specific file
        const impact = analyzer.analyzeFile(options.impactFile);
        if (!options.quiet) {
            console.log('');
            console.log(c('  Impact Analysis', 'cyan', 'bright'));
            console.log(c(`  File: ${options.impactFile}`, 'dim'));
            console.log('');

            if (impact.isComponent) {
                const sevColor = impact.severity === 'critical' ? 'red' :
                                impact.severity === 'high' ? 'yellow' : 'green';
                console.log(c(`  Component: ${impact.componentName}`, 'bright'));
                console.log(c(`  Severity:  ${impact.severity.toUpperCase()}`, sevColor, 'bright'));
                console.log(c(`  Affected:  ${impact.affectedCount} files`, 'bright'));
                console.log('');
                if (impact.affectedFiles.length > 0) {
                    console.log('  Downstream files:');
                    for (const f of impact.affectedFiles.slice(0, 30)) {
                        console.log(c(`    ${f}`, 'dim'));
                    }
                    if (impact.affectedFiles.length > 30) {
                        console.log(c(`    ... and ${impact.affectedFiles.length - 30} more`, 'dim'));
                    }
                }
            } else {
                console.log(c(`  Uses ${impact.usedComponentCount} components:`, 'bright'));
                for (const comp of impact.usedComponents) {
                    console.log(c(`    ${comp}`, 'dim'));
                }
            }
            console.log('');
        }

        if (options.jsonOutput) {
            console.log(JSON.stringify(impact, null, 2));
        }
        return;
    }

    // Full impact analysis
    const results = analyzer.analyze();

    if (options.jsonOutput) {
        console.log(JSON.stringify(results, null, 2));
        return;
    }

    if (!options.quiet) {
        console.log('');
        console.log(c('  EduScan Impact Analyzer', 'cyan', 'bright'));
        console.log(c('  ─────────────────────', 'dim'));
        console.log('');

        // Summary
        console.log(c(`  Components: ${results.summary.totalComponents} total`, 'bright'));
        console.log(c(`    Used:     ${results.summary.usedComponents}`, 'green'));
        console.log(c(`    Unused:   ${results.summary.unusedComponents}`, 'yellow'));
        console.log(c(`  Most depended: ${results.summary.mostDepended} (${results.summary.mostDependedCount} files)`, 'bright'));
        console.log('');

        // Contract results
        console.log(c(`  Contracts: ${results.summary.contractsChecked} components, ${results.summary.methodsChecked} methods`, 'bright'));
        if (results.summary.contractsFailed === 0) {
            console.log(c(`  Status:    All contracts pass`, 'green', 'bright'));
        } else {
            console.log(c(`  Status:    ${results.summary.contractsFailed} FAILURES`, 'red', 'bright'));
            console.log('');
            for (const issue of results.issues) {
                const sevColor = issue.severity === 'critical' ? 'red' :
                                issue.severity === 'high' ? 'yellow' : 'dim';
                console.log(c(`    [${issue.code}] ${issue.severity.toUpperCase()}: ${issue.message}`, sevColor));
            }
        }

        // Top components
        console.log('');
        console.log(c('  Top 10 Most-Depended Components:', 'bright'));
        const top = analyzer.getTopComponents(10);
        for (const comp of top) {
            const bar = '█'.repeat(Math.min(Math.ceil(comp.dependencyCount / 100), 20));
            console.log(c(`    ${comp.name.padEnd(22)} ${String(comp.dependencyCount).padStart(5)} files  ${bar}`, 'dim'));
        }

        // Unused components
        const unused = analyzer.getUnusedComponents();
        if (unused.length > 0) {
            console.log('');
            console.log(c(`  Unused Components (${unused.length}):`, 'yellow'));
            for (const u of unused) {
                console.log(c(`    ${u.name} (${u.path})`, 'dim'));
            }
        }

        console.log('');
        console.log(c(`  Duration: ${results.summary.duration}ms`, 'dim'));
        console.log('');
    }

    // Determine exit code
    const exitCode = determineExitCode(results.issues, options);
    if (exitCode !== 0) {
        process.exit(exitCode);
    }
}

/**
 * Run functional validation
 */
async function runFunctional(options, colorFn) {
    const c = colorFn;
    const FunctionalValidator = require('./validators/functional');

    try {
        // Print header
        console.log('');
        console.log(c('╔═══════════════════════════════════════╗', 'cyan'));
        console.log(c('║', 'cyan') + c('  FUNCTIONAL VALIDATION                ', 'bright', 'cyan') + c('║', 'cyan'));
        console.log(c('╚═══════════════════════════════════════╝', 'cyan'));
        console.log('');

        // We need to scan + parse files first (for runtime checks)
        const scanner = new EduScan(options);
        let content = [];

        if (!options.smokeOnly) {
            const scanResult = scanner.scanner.scan();
            content = scanner.parser.parseAll(scanResult.files);
            console.log(c(`  Discovered ${content.filter(f => f.path && f.path.endsWith('.html')).length} HTML pages`, 'dim'));
        }

        // Run functional validator
        const validator = new FunctionalValidator({
            rootPath: options.path,
            verbose: options.verbose,
            smokeOnly: options.smokeOnly,
            runtimeOnly: options.runtimeOnly
        });

        const results = await validator.validate(content);

        // Print results
        const rs = results.summary.runtime;
        const ss = results.summary.smoke;

        if (!options.smokeOnly) {
            const errColor = rs.pagesWithErrors > 0 ? 'red' : 'green';
            const skipNote = rs.pagesSkipped ? c(` (${rs.pagesSkipped} skipped)`, 'dim') : '';
            console.log(`  Runtime checks: ${c(String(rs.pagesLoaded), 'bright')} pages loaded${skipNote}, ${c(String(rs.totalErrors), errColor)} errors found`);
        }

        if (!options.runtimeOnly) {
            const smokeColor = ss.failed > 0 ? 'red' : 'green';
            console.log(`  Smoke tests:    ${c(`${ss.passed}/${ss.total}`, smokeColor)} passed`);
        }

        console.log(c(`  Duration:       ${(results.summary.duration / 1000).toFixed(1)}s`, 'dim'));
        console.log('');

        // Print issues
        if (results.issues.length > 0) {
            for (const issue of results.issues) {
                const sevColor = {
                    critical: 'red',
                    high: 'red',
                    medium: 'yellow',
                    low: 'blue'
                }[issue.severity] || 'white';

                console.log(`  ${c('[' + issue.code + ']', sevColor)} ${c(issue.severity.toUpperCase(), sevColor)}  ${issue.message}`);
                if (issue.file) {
                    console.log(c(`    File: ${issue.file}`, 'dim'));
                }
                if (issue.fix) {
                    console.log(c(`    Fix:  ${issue.fix}`, 'dim'));
                }
                console.log('');
            }
        } else {
            console.log(c('  No functional issues detected.', 'green'));
            console.log('');
        }

        console.log(c('─'.repeat(40), 'dim'));
        console.log('');

        // Exit code
        const exitCode = determineExitCode(results.issues, options);
        process.exit(exitCode);

    } catch (err) {
        console.error(c(`  Error: ${err.message}`, 'red'));
        if (options.verbose) {
            console.error(err.stack);
        }
        process.exit(2);
    }
}

// Run
main();
