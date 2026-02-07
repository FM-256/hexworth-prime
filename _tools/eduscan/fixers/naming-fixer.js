#!/usr/bin/env node

/**
 * EduScan - Naming Convention Fixer
 *
 * Automatically fixes naming convention issues (NAME-* codes) detected by
 * NamingValidator. Uses RenameMapper to generate correct names and
 * RenameApplier to apply the fixes.
 *
 * Usage:
 *   node naming-fixer.js [--dry-run] [--verbose]
 *
 * Created: 2026-02-07
 */

const fs = require('fs');
const path = require('path');
const NamingValidator = require('../validators/syntax/naming');
const RenameMapper = require('./rename-mapper');
const RenameApplier = require('./rename-applier');

class NamingFixer {
    constructor(options = {}) {
        this.verbose = options.verbose || false;
        this.dryRun = options.dryRun || false;
        this.rootPath = options.rootPath || './_app';
        this.housesPath = options.housesPath || 'houses';
        this.reportPath = options.reportPath || './_tools/reports/NAMING_FIX_REPORT.md';

        // Initialize components
        this.namingValidator = new NamingValidator({
            verbose: this.verbose,
            rootPath: this.rootPath
        });

        this.renameMapper = new RenameMapper({
            verbose: this.verbose,
            dryRun: true, // Always dry-run mapper, we apply ourselves
            rootPath: this.rootPath,
            housesPath: this.housesPath
        });

        this.renameApplier = new RenameApplier({
            verbose: this.verbose,
            dryRun: this.dryRun,
            rootPath: this.rootPath,
            housesPath: this.housesPath,
            updateReferences: true
        });
    }

    /**
     * Scan files and find naming issues
     * @returns {Array} Array of naming issues
     */
    findNamingIssues() {
        const housesDir = path.resolve(this.rootPath, this.housesPath);
        const files = [];

        // Recursively find HTML files
        // Use rootPath as base so paths include 'houses/' prefix for house detection
        this.walkDirectory(housesDir, files, path.resolve(this.rootPath));

        // Run naming validator on each file
        const issues = [];
        for (const file of files) {
            // Load file content for better type detection
            try {
                const content = fs.readFileSync(file.absolutePath, 'utf8');
                const fileObj = {
                    path: file.relativePath,
                    content: content
                };
                const fileIssues = this.namingValidator.validate(fileObj);
                issues.push(...fileIssues);
            } catch (err) {
                if (this.verbose) {
                    console.warn(`[FIXER] Could not read file: ${file.relativePath}`);
                }
            }
        }

        return issues;
    }

    /**
     * Walk directory recursively to find HTML files
     */
    walkDirectory(dir, files, baseDir) {
        try {
            const entries = fs.readdirSync(dir, { withFileTypes: true });

            for (const entry of entries) {
                const fullPath = path.join(dir, entry.name);

                if (entry.isDirectory()) {
                    this.walkDirectory(fullPath, files, baseDir);
                } else if (entry.isFile() && entry.name.endsWith('.html')) {
                    const relativePath = path.relative(baseDir, fullPath);
                    files.push({
                        absolutePath: fullPath,
                        relativePath: relativePath,
                        fileName: entry.name,
                        directory: path.dirname(relativePath)
                    });
                }
            }
        } catch (err) {
            // Skip unreadable directories
        }
    }

    /**
     * Convert naming issues to rename operations
     * @param {Array} issues - Array of naming issues from validator
     * @returns {Array} Array of rename operations
     */
    issuesToRenames(issues) {
        const renames = [];
        const seenPaths = new Set();

        for (const issue of issues) {
            // Skip if not auto-fixable
            if (!issue.autoFixable) {
                continue;
            }

            // Skip duplicates (same file, multiple issues)
            if (seenPaths.has(issue.file)) {
                continue;
            }
            seenPaths.add(issue.file);

            // Build rename operation
            const oldPath = issue.file;
            const directory = path.dirname(oldPath);
            const newPath = path.join(directory, issue.suggestedFilename);

            renames.push({
                oldPath: oldPath,
                newPath: newPath,
                oldName: issue.currentFilename,
                newName: issue.suggestedFilename,
                moduleId: this.generateModuleId(issue.suggestedFilename, issue.details?.house),
                type: issue.details?.detectedType || 'unknown',
                house: issue.details?.house || 'unknown',
                issueCode: issue.code,
                severity: issue.severity
            });
        }

        return renames;
    }

    /**
     * Generate a module ID from filename and house
     */
    generateModuleId(filename, house) {
        const baseName = filename.replace(/\.html$/, '');
        // Remove type suffix to get clean module ID
        const parts = baseName.split('-');
        if (parts.length > 2) {
            // Remove last part if it's a content type
            const contentTypes = ['presentation', 'quiz', 'lab', 'applet', 'module', 'tool'];
            if (contentTypes.includes(parts[parts.length - 1])) {
                parts.pop();
            }
        }
        return parts.join('-');
    }

    /**
     * Run the naming fixer
     * @returns {Object} Fix results
     */
    fix() {
        const results = {
            timestamp: new Date().toISOString(),
            dryRun: this.dryRun,
            stats: {
                issuesFound: 0,
                issuesFixed: 0,
                issuesSkipped: 0,
                referencesUpdated: 0,
                filesWithRefsUpdated: 0
            },
            byCode: {
                'NAME-001': { found: 0, fixed: 0 },
                'NAME-002': { found: 0, fixed: 0 },
                'NAME-003': { found: 0, fixed: 0 },
                'NAME-004': { found: 0, fixed: 0 }
            },
            fixes: [],
            skipped: [],
            errors: []
        };

        console.log('[FIXER] Scanning for naming convention issues...');

        // Find all naming issues
        const issues = this.findNamingIssues();
        results.stats.issuesFound = issues.length;

        // Count by code
        for (const issue of issues) {
            if (results.byCode[issue.code]) {
                results.byCode[issue.code].found++;
            }
        }

        if (issues.length === 0) {
            console.log('[FIXER] No naming issues found. All files follow the convention!');
            return results;
        }

        if (this.verbose) {
            console.log(`[FIXER] Found ${issues.length} naming issues:`);
            for (const [code, counts] of Object.entries(results.byCode)) {
                if (counts.found > 0) {
                    console.log(`  ${code}: ${counts.found}`);
                }
            }
        }

        // Convert issues to rename operations
        const renames = this.issuesToRenames(issues);

        if (renames.length === 0) {
            console.log('[FIXER] No auto-fixable issues found.');
            return results;
        }

        console.log(`[FIXER] ${renames.length} files will be renamed`);

        if (this.dryRun) {
            console.log('[FIXER] DRY RUN - No files will be modified');
        }

        // Apply renames
        const applyResults = this.renameApplier.applyRenames(renames);

        // Update stats
        results.stats.issuesFixed = applyResults.stats.success;
        results.stats.issuesSkipped = applyResults.stats.failed;

        if (applyResults.references) {
            results.stats.referencesUpdated = applyResults.references.referencesUpdated;
            results.stats.filesWithRefsUpdated = applyResults.references.filesUpdated;
        }

        // Track fixes by code
        for (const success of applyResults.successful) {
            const rename = renames.find(r => r.oldPath === success.oldPath);
            if (rename && results.byCode[rename.issueCode]) {
                results.byCode[rename.issueCode].fixed++;
            }
            results.fixes.push({
                oldPath: success.oldPath,
                newPath: success.newPath,
                oldName: success.oldName,
                newName: success.newName,
                code: rename?.issueCode,
                severity: rename?.severity
            });
        }

        // Track skipped
        for (const failed of applyResults.failed) {
            results.skipped.push({
                path: failed.oldPath,
                error: failed.error
            });
        }

        // Generate and save report
        if (!this.dryRun) {
            const report = this.generateReport(results);
            this.saveReport(report);
        }

        // Print summary
        this.printSummary(results);

        return results;
    }

    /**
     * Generate a markdown report
     */
    generateReport(results) {
        const lines = [
            '# Naming Convention Fix Report',
            '',
            `Generated: ${results.timestamp}`,
            `Mode: ${results.dryRun ? 'DRY RUN' : 'APPLIED'}`,
            '',
            '## Summary',
            '',
            `- Issues Found: ${results.stats.issuesFound}`,
            `- Issues Fixed: ${results.stats.issuesFixed}`,
            `- Issues Skipped: ${results.stats.issuesSkipped}`,
            `- References Updated: ${results.stats.referencesUpdated}`,
            `- Files with Refs Updated: ${results.stats.filesWithRefsUpdated}`,
            '',
            '## Issues by Code',
            '',
            '| Code | Description | Found | Fixed |',
            '|------|-------------|-------|-------|',
            `| NAME-001 | Convention violation | ${results.byCode['NAME-001'].found} | ${results.byCode['NAME-001'].fixed} |`,
            `| NAME-002 | Wrong type suffix | ${results.byCode['NAME-002'].found} | ${results.byCode['NAME-002'].fixed} |`,
            `| NAME-003 | Missing house prefix | ${results.byCode['NAME-003'].found} | ${results.byCode['NAME-003'].fixed} |`,
            `| NAME-004 | Wrong case | ${results.byCode['NAME-004'].found} | ${results.byCode['NAME-004'].fixed} |`,
            ''
        ];

        if (results.fixes.length > 0) {
            lines.push('## Fixes Applied', '');
            lines.push('| Old Name | New Name | Code | Severity |');
            lines.push('|----------|----------|------|----------|');
            for (const fix of results.fixes) {
                lines.push(`| \`${fix.oldName}\` | \`${fix.newName}\` | ${fix.code} | ${fix.severity} |`);
            }
            lines.push('');
        }

        if (results.skipped.length > 0) {
            lines.push('## Skipped (Manual Review Required)', '');
            lines.push('| Path | Error |');
            lines.push('|------|-------|');
            for (const skip of results.skipped) {
                lines.push(`| \`${skip.path}\` | ${skip.error} |`);
            }
            lines.push('');
        }

        return lines.join('\n');
    }

    /**
     * Save report to file
     */
    saveReport(report) {
        const reportDir = path.dirname(this.reportPath);
        if (!fs.existsSync(reportDir)) {
            fs.mkdirSync(reportDir, { recursive: true });
        }
        fs.writeFileSync(this.reportPath, report, 'utf8');
        console.log(`[FIXER] Report saved to: ${this.reportPath}`);
    }

    /**
     * Print summary to console
     */
    printSummary(results) {
        console.log('');
        console.log('=== Naming Fix Summary ===');
        console.log(`Issues Found:      ${results.stats.issuesFound}`);
        console.log(`Issues Fixed:      ${results.stats.issuesFixed}`);
        console.log(`Issues Skipped:    ${results.stats.issuesSkipped}`);
        console.log(`Refs Updated:      ${results.stats.referencesUpdated}`);

        if (results.dryRun && results.stats.issuesFixed > 0) {
            console.log('');
            console.log('Run without --dry-run to apply fixes.');
        }
    }
}

// CLI handling
function parseArgs(args) {
    const options = {
        dryRun: false,
        verbose: false,
        rootPath: './_app',
        help: false
    };

    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        const nextArg = args[i + 1];

        switch (arg) {
            case '--dry-run':
            case '-n':
                options.dryRun = true;
                break;
            case '--verbose':
            case '-v':
                options.verbose = true;
                break;
            case '--path':
            case '-p':
                if (nextArg && !nextArg.startsWith('-')) {
                    options.rootPath = nextArg;
                    i++;
                }
                break;
            case '--help':
            case '-h':
                options.help = true;
                break;
        }
    }

    return options;
}

function showHelp() {
    console.log(`
EduScan Naming Fixer - Fix file naming convention issues

Usage:
  node naming-fixer.js [options]

Options:
  -n, --dry-run          Show what would be done without making changes
  -v, --verbose          Show detailed output
  -p, --path <dir>       Root app directory (default: ./_app)
  -h, --help             Show this help

Issue Codes:
  NAME-001  Convention violation (high severity)
  NAME-002  Wrong type suffix (medium severity)
  NAME-003  Missing house prefix (medium severity)
  NAME-004  Wrong case (low severity)

Convention:
  Files should follow: {house}-{name}-{type}.html

Examples:
  node naming-fixer.js --dry-run --verbose
  node naming-fixer.js --path /path/to/_app
`);
}

// Main execution
if (require.main === module) {
    const args = process.argv.slice(2);
    const options = parseArgs(args);

    if (options.help) {
        showHelp();
        process.exit(0);
    }

    console.log('============================================================');
    console.log('           EDUSCAN - Naming Convention Fixer                ');
    console.log('============================================================');
    console.log('');

    const fixer = new NamingFixer(options);
    const results = fixer.fix();

    // Exit code based on results
    if (results.errors && results.errors.length > 0) {
        process.exit(1);
    }

    process.exit(0);
}

module.exports = NamingFixer;
