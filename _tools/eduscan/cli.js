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
 *   --no-color             Disable colored output
 *   -h, --help             Show help
 *   --version              Show version
 */

const path = require('path');
const EduScan = require('./index');
const DriftTracker = require('./utils/drift');

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
        help: false,
        version: false
    };

    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        const nextArg = args[i + 1];

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

            case '--no-color':
                options.colors = false;
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
EduScan v1.1.0 - Content Topology Scanner for Educational Platforms

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
  --no-color             Disable colored output
  -h, --help             Show this help message
  --version              Show version

Examples:
  eduscan                            # Scan _app/ with default settings
  eduscan -v                         # Verbose output
  eduscan --issues-only              # Quick issue check
  eduscan --diff                     # Show changes since last scan
  eduscan --archive                  # Save scan for future comparisons
  eduscan --diff --archive           # Compare + save for next time
  eduscan -p ./src -o ./audit        # Custom paths
  eduscan --json | jq '.[]'          # Pipe issues to jq

Severity Levels:
  CRITICAL   Breaks sync/grading/compliance (must fix)
  HIGH       Breaks analytics or progress tracking
  MEDIUM     Affects reporting consistency
  LOW        Hygiene, legacy, informational

Issue Codes:
  ID-*      moduleId issues (house prefix, -quiz suffix)
  SYNC-*    Sync compatibility issues
  REG-*     Registry issues (not registered, orphaned)
  TRACK-*   Progress tracking issues
  CFG-*     Configuration issues

Ignore Directives:
  Add to HTML files to suppress specific issues:
  <!-- eduscan-ignore: ID-001 reason="legacy content" -->
  <!-- eduscan-ignore-all reason="archived module" -->

Reports:
  TREASURE_MAP.json    Machine-readable content map + issues
  TREASURE_MAP.md      Human-readable report
  history/*.json       Archived scans for drift tracking

For more information: _tools/EDUSCAN_DESIGN.md
`);
}

// Print version
function printVersion() {
    console.log('EduScan v1.1.0');
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

    // Resolve paths relative to current working directory
    options.path = path.resolve(process.cwd(), options.path);
    options.outputDir = path.resolve(process.cwd(), options.outputDir);

    try {
        const scanner = new EduScan(options);
        const driftTracker = new DriftTracker({
            historyDir: path.join(options.outputDir, 'history'),
            currentReportPath: path.join(options.outputDir, 'TREASURE_MAP.json')
        });

        if (options.jsonOutput) {
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

            // Exit with error code if critical issues found
            const criticalCount = results.validation.issues.filter(
                i => i.severity === 'critical'
            ).length;

            if (criticalCount > 0) {
                process.exit(1);
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

// Run
main();
