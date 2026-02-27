/**
 * EduScan — Auto-Fixer
 *
 * Applies safe, automated fixes for issues flagged as autoFixable.
 * Only applies fixes that are string-based search-and-replace operations
 * with deterministic outcomes (no heuristic or context-dependent fixes).
 *
 * Supported issue types:
 *   ID-001:    moduleId malformed (house prefix, -quiz suffix)
 *   SYNC-004:  houseId doesn't match path house
 *   TRACK-001: trackProgress disabled
 *
 * Usage:
 *   const AutoFixer = require('./fixers/auto-fixer');
 *   const fixer = new AutoFixer({ rootPath: './_app', dryRun: true });
 *   const results = fixer.fix(scanIssues);
 */

const fs = require('fs');
const path = require('path');

class AutoFixer {
    constructor(options = {}) {
        this.rootPath = options.rootPath || './_app';
        this.dryRun = options.dryRun !== false; // Default to dry-run for safety
        this.verbose = options.verbose || false;

        // Safety: Only apply fixes for these known-safe issue codes
        this.allowedCodes = new Set([
            'ID-001',     // moduleId malformed (strip house prefix / -quiz suffix)
            'SYNC-004',   // houseId doesn't match path house
            'TRACK-001',  // trackProgress disabled
        ]);
    }

    /**
     * Apply fixes to all autoFixable issues
     * @param {Array} issues - Array of issue objects from EduScan scan
     * @returns {Object} { fixed: [], skipped: [], errors: [], summary: {} }
     */
    fix(issues) {
        const result = {
            fixed: [],
            skipped: [],
            errors: [],
            summary: {
                totalIssues: issues.length,
                autoFixable: 0,
                fixed: 0,
                skipped: 0,
                errors: 0,
                dryRun: this.dryRun
            }
        };

        // Filter to autoFixable issues with known-safe codes
        const fixable = issues.filter(i => {
            if (!i.autoFixable) return false;
            if (!this.allowedCodes.has(i.code)) {
                result.skipped.push({
                    issue: i,
                    reason: `Code ${i.code} not in auto-fix allow list`
                });
                return false;
            }
            if (!i.searchPattern || !i.replaceWith) {
                result.skipped.push({
                    issue: i,
                    reason: 'Missing searchPattern or replaceWith'
                });
                return false;
            }
            return true;
        });

        result.summary.autoFixable = fixable.length;

        // Group fixes by file to batch file operations
        const byFile = {};
        for (const issue of fixable) {
            const filePath = issue.file;
            if (!byFile[filePath]) byFile[filePath] = [];
            byFile[filePath].push(issue);
        }

        // Apply fixes per file
        for (const [relFile, fileIssues] of Object.entries(byFile)) {
            const fullPath = path.join(this.rootPath, relFile);

            if (!fs.existsSync(fullPath)) {
                for (const issue of fileIssues) {
                    result.errors.push({
                        issue,
                        reason: `File not found: ${fullPath}`
                    });
                }
                continue;
            }

            let content;
            try {
                content = fs.readFileSync(fullPath, 'utf8');
            } catch (e) {
                for (const issue of fileIssues) {
                    result.errors.push({
                        issue,
                        reason: `Read error: ${e.message}`
                    });
                }
                continue;
            }

            let modified = content;
            const appliedFixes = [];

            for (const issue of fileIssues) {
                const { searchPattern, replaceWith } = issue;

                // Safety: verify the search pattern exists exactly once
                const occurrences = modified.split(searchPattern).length - 1;

                if (occurrences === 0) {
                    result.skipped.push({
                        issue,
                        reason: `Pattern not found: "${searchPattern}"`
                    });
                    continue;
                }

                if (occurrences > 1) {
                    result.skipped.push({
                        issue,
                        reason: `Pattern found ${occurrences} times (ambiguous): "${searchPattern}"`
                    });
                    continue;
                }

                // Apply the fix
                modified = modified.replace(searchPattern, replaceWith);
                appliedFixes.push(issue);
            }

            // Write the modified content (unless dry-run)
            if (appliedFixes.length > 0) {
                if (!this.dryRun) {
                    try {
                        fs.writeFileSync(fullPath, modified, 'utf8');
                    } catch (e) {
                        for (const issue of appliedFixes) {
                            result.errors.push({
                                issue,
                                reason: `Write error: ${e.message}`
                            });
                        }
                        continue;
                    }
                }

                for (const issue of appliedFixes) {
                    result.fixed.push({
                        file: relFile,
                        code: issue.code,
                        from: issue.searchPattern,
                        to: issue.replaceWith,
                        message: issue.message
                    });
                }
            }
        }

        result.summary.fixed = result.fixed.length;
        result.summary.skipped = result.skipped.length;
        result.summary.errors = result.errors.length;

        return result;
    }

    /**
     * Format fix results for console output
     */
    formatResults(results, colorFn) {
        const c = colorFn || ((t) => t);
        const lines = [];

        if (results.summary.dryRun) {
            lines.push(c('DRY RUN — no files modified', 'yellow', 'bright'));
            lines.push('');
        }

        if (results.fixed.length > 0) {
            lines.push(c(`  ${results.summary.dryRun ? 'Would fix' : 'Fixed'}: ${results.fixed.length} issues`, 'green', 'bright'));
            for (const fix of results.fixed) {
                lines.push(c(`    ${fix.code}`, 'cyan') + ` ${fix.file}`);
                lines.push(c(`      ${fix.from}`, 'red') + ' → ' + c(fix.to, 'green'));
            }
        }

        if (results.skipped.length > 0) {
            lines.push('');
            lines.push(c(`  Skipped: ${results.skipped.length}`, 'yellow'));
            if (results.skipped.length <= 10) {
                for (const skip of results.skipped) {
                    lines.push(`    ${skip.issue.code} ${skip.issue.file || ''}: ${skip.reason}`);
                }
            }
        }

        if (results.errors.length > 0) {
            lines.push('');
            lines.push(c(`  Errors: ${results.errors.length}`, 'red', 'bright'));
            for (const err of results.errors) {
                lines.push(`    ${err.issue.code} ${err.issue.file || ''}: ${err.reason}`);
            }
        }

        if (!results.summary.dryRun && results.fixed.length > 0) {
            lines.push('');
            lines.push(c('  Re-run scan to verify fixes.', 'dim'));
        }

        return lines.join('\n');
    }
}

module.exports = AutoFixer;
