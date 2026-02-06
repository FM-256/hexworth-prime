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
 *   --no-color             Disable colored output
 *   -h, --help             Show help
 *   --version              Show version
 */

const path = require('path');
const EduScan = require('./index');

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
EduScan v1.0.0 - Content Topology Scanner for Educational Platforms

Usage: eduscan [options]

Options:
  -p, --path <dir>       Root directory to scan (default: ./_app)
  -o, --output <dir>     Output directory (default: ./_tools/reports)
  -f, --format <type>    Output: json, md, both (default: both)
  -v, --verbose          Show detailed progress
  -q, --quiet            Only output errors and final summary
  --issues-only          Skip full map, only show issues
  --json                 Output issues as JSON to stdout (implies --quiet)
  --no-color             Disable colored output
  -h, --help             Show this help message
  --version              Show version

Examples:
  eduscan                            # Scan _app/ with default settings
  eduscan -v                         # Verbose output
  eduscan --issues-only              # Quick issue check
  eduscan -p ./src -o ./audit        # Custom paths
  eduscan --json | jq '.[]'          # Pipe issues to jq

Reports:
  TREASURE_MAP.json    Machine-readable content map + issues
  TREASURE_MAP.md      Human-readable report

Issue Codes:
  SYNC-*    Sync compatibility issues (will break progress tracking)
  REG-*     Registry issues (content not registered or orphaned)
  TRACK-*   Progress tracking issues
  CFG-*     Configuration issues

For more information: _tools/EDUSCAN_DESIGN.md
`);
}

// Print version
function printVersion() {
    console.log('EduScan v1.0.0');
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

        if (options.jsonOutput) {
            // Quick scan, output JSON to stdout
            const issues = scanner.quickScan();
            console.log(JSON.stringify(issues, null, 2));
        } else {
            // Full scan
            const results = scanner.scan();

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
