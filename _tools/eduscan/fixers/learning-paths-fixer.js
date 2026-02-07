/**
 * EduScan - LearningPaths Auto-Fixer
 *
 * Automatically fixes broken hrefs in LearningPaths.js using the Module Registry.
 *
 * Flow:
 * 1. Run LearningPathsValidator to detect LP-001 issues
 * 2. For each issue with a high-confidence suggestion, apply the fix
 * 3. Write the updated LearningPaths.js
 *
 * Usage:
 *   node learning-paths-fixer.js [--dry-run] [--min-confidence 0.8]
 *
 * Created: 2026-02-07 (architecture/module-registry branch)
 */

const fs = require('fs');
const path = require('path');
const LearningPathsValidator = require('../validators/syntax/learning-paths');
const ModuleRegistryGenerator = require('../registry/module-registry');

class LearningPathsFixer {
    constructor(options = {}) {
        this.verbose = options.verbose || false;
        this.dryRun = options.dryRun || false;
        this.minConfidence = options.minConfidence || 0.85;
        this.rootPath = options.rootPath || './_app';
        this.learningPathsFile = options.learningPathsFile || './components/LearningPaths.js';

        // Initialize validator
        this.validator = new LearningPathsValidator({
            verbose: this.verbose,
            rootPath: this.rootPath,
            learningPathsFile: this.learningPathsFile
        });
    }

    /**
     * Run the auto-fixer
     * @returns {Object} Fix results
     */
    fix() {
        const results = {
            timestamp: new Date().toISOString(),
            dryRun: this.dryRun,
            minConfidence: this.minConfidence,
            issuesFound: 0,
            issuesFixed: 0,
            issuesSkipped: 0,
            fixes: [],
            skipped: [],
            errors: []
        };

        // First, ensure registry is up to date
        this.updateRegistry();

        // Run validation to find issues
        const validation = this.validator.validate();
        const lpIssues = validation.issues.filter(i => i.code === 'LP-001');
        results.issuesFound = lpIssues.length;

        if (lpIssues.length === 0) {
            if (this.verbose) {
                console.log('[FIXER] No LP-001 issues found. LearningPaths.js is clean!');
            }
            return results;
        }

        if (this.verbose) {
            console.log(`[FIXER] Found ${lpIssues.length} LP-001 issues`);
        }

        // Load the LearningPaths.js content
        const absolutePath = path.resolve(this.rootPath, this.learningPathsFile);
        let content = fs.readFileSync(absolutePath, 'utf8');
        let modified = false;

        // Process each issue
        for (const issue of lpIssues) {
            const fixResult = this.processIssue(issue, content);

            if (fixResult.fixed) {
                content = fixResult.newContent;
                modified = true;
                results.issuesFixed++;
                results.fixes.push({
                    moduleId: issue.moduleId,
                    oldHref: issue.href,
                    newHref: fixResult.newHref,
                    confidence: fixResult.confidence,
                    source: fixResult.source
                });

                if (this.verbose) {
                    console.log(`[FIXER] ✓ Fixed: ${issue.moduleId}`);
                    console.log(`         ${issue.href} → ${fixResult.newHref}`);
                }
            } else {
                results.issuesSkipped++;
                results.skipped.push({
                    moduleId: issue.moduleId,
                    href: issue.href,
                    reason: fixResult.reason,
                    suggestion: fixResult.suggestion,
                    confidence: fixResult.confidence
                });

                if (this.verbose) {
                    console.log(`[FIXER] ✗ Skipped: ${issue.moduleId} - ${fixResult.reason}`);
                }
            }
        }

        // Write the fixed content
        if (modified && !this.dryRun) {
            // Backup original
            const backupPath = absolutePath + '.backup';
            fs.writeFileSync(backupPath, fs.readFileSync(absolutePath, 'utf8'));

            // Write fixed version
            fs.writeFileSync(absolutePath, content);

            if (this.verbose) {
                console.log(`[FIXER] Saved fixes to ${this.learningPathsFile}`);
                console.log(`[FIXER] Backup saved to ${this.learningPathsFile}.backup`);
            }
        } else if (modified && this.dryRun) {
            if (this.verbose) {
                console.log('[FIXER] Dry run - no changes written');
            }
        }

        return results;
    }

    /**
     * Process a single LP-001 issue
     */
    processIssue(issue, content) {
        const suggestion = issue.suggestion;

        // No suggestion available
        if (!suggestion || !suggestion.path) {
            return {
                fixed: false,
                reason: 'No suggestion available',
                suggestion: null,
                confidence: 0
            };
        }

        // Check confidence threshold
        if (suggestion.confidence < this.minConfidence) {
            return {
                fixed: false,
                reason: `Confidence too low (${suggestion.confidence} < ${this.minConfidence})`,
                suggestion: suggestion.path,
                confidence: suggestion.confidence
            };
        }

        // Verify the suggested file actually exists
        const suggestedPath = path.resolve(this.rootPath, suggestion.path);
        if (!fs.existsSync(suggestedPath)) {
            return {
                fixed: false,
                reason: 'Suggested file does not exist',
                suggestion: suggestion.path,
                confidence: suggestion.confidence
            };
        }

        // Build the replacement
        const oldHref = issue.href;
        const newHref = suggestion.path;

        // Find and replace in content
        // We need to be precise - match the exact href in the module context
        const hrefPattern = new RegExp(
            `(id:\\s*['"]${this.escapeRegex(issue.moduleId)}['"][^}]*href:\\s*['"])${this.escapeRegex(oldHref)}(['"])`,
            'g'
        );

        // Also try the reverse order (href before id)
        const hrefPatternAlt = new RegExp(
            `(href:\\s*['"])${this.escapeRegex(oldHref)}(['"][^}]*id:\\s*['"]${this.escapeRegex(issue.moduleId)}['"])`,
            'g'
        );

        let newContent = content;
        let replaced = false;

        if (hrefPattern.test(content)) {
            newContent = content.replace(hrefPattern, `$1${newHref}$2`);
            replaced = true;
        } else if (hrefPatternAlt.test(content)) {
            newContent = content.replace(hrefPatternAlt, `$1${newHref}$2`);
            replaced = true;
        } else {
            // Fallback: simple string replacement (less safe but works)
            const simpleOld = `href: '${oldHref}'`;
            const simpleNew = `href: '${newHref}'`;
            if (content.includes(simpleOld)) {
                newContent = content.replace(simpleOld, simpleNew);
                replaced = true;
            }
        }

        if (!replaced) {
            return {
                fixed: false,
                reason: 'Could not locate href in file',
                suggestion: suggestion.path,
                confidence: suggestion.confidence
            };
        }

        return {
            fixed: true,
            newContent,
            newHref,
            confidence: suggestion.confidence,
            source: suggestion.source || 'unknown'
        };
    }

    /**
     * Update the module registry before fixing
     */
    updateRegistry() {
        if (this.verbose) {
            console.log('[FIXER] Updating module registry...');
        }

        const generator = new ModuleRegistryGenerator({
            rootPath: this.rootPath,
            verbose: false,
            outputPath: './_tools/reports/MODULE_REGISTRY.json'
        });

        generator.generateAndSave();
    }

    /**
     * Escape special regex characters
     */
    escapeRegex(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    /**
     * Generate a fix report
     */
    generateReport(results) {
        const lines = [
            '# LearningPaths Auto-Fix Report',
            '',
            `Generated: ${results.timestamp}`,
            `Mode: ${results.dryRun ? 'DRY RUN' : 'APPLIED'}`,
            `Minimum Confidence: ${results.minConfidence}`,
            '',
            '## Summary',
            '',
            `- Issues Found: ${results.issuesFound}`,
            `- Issues Fixed: ${results.issuesFixed}`,
            `- Issues Skipped: ${results.issuesSkipped}`,
            ''
        ];

        if (results.fixes.length > 0) {
            lines.push('## Fixes Applied', '');
            lines.push('| Module | Old href | New href | Confidence | Source |');
            lines.push('|--------|----------|----------|------------|--------|');
            for (const fix of results.fixes) {
                lines.push(`| ${fix.moduleId} | \`${fix.oldHref}\` | \`${fix.newHref}\` | ${fix.confidence} | ${fix.source} |`);
            }
            lines.push('');
        }

        if (results.skipped.length > 0) {
            lines.push('## Skipped (Manual Review Required)', '');
            lines.push('| Module | href | Reason | Suggestion | Confidence |');
            lines.push('|--------|------|--------|------------|------------|');
            for (const skip of results.skipped) {
                lines.push(`| ${skip.moduleId} | \`${skip.href}\` | ${skip.reason} | ${skip.suggestion || 'none'} | ${skip.confidence} |`);
            }
            lines.push('');
        }

        return lines.join('\n');
    }
}

// CLI interface
if (require.main === module) {
    const args = process.argv.slice(2);
    const dryRun = args.includes('--dry-run');
    const verbose = args.includes('--verbose') || args.includes('-v');

    let minConfidence = 0.85;
    const confIndex = args.indexOf('--min-confidence');
    if (confIndex !== -1 && args[confIndex + 1]) {
        minConfidence = parseFloat(args[confIndex + 1]);
    }

    console.log('╔═══════════════════════════════════════════════════════════════╗');
    console.log('║           EDUSCAN - LearningPaths Auto-Fixer                  ║');
    console.log('╚═══════════════════════════════════════════════════════════════╝');
    console.log('');

    const fixer = new LearningPathsFixer({
        verbose: true,
        dryRun,
        minConfidence,
        rootPath: './_app'
    });

    const results = fixer.fix();

    console.log('');
    console.log('────────────────────────────────────────────────────────────');
    console.log('RESULTS');
    console.log('────────────────────────────────────────────────────────────');
    console.log(`  Issues Found:   ${results.issuesFound}`);
    console.log(`  Issues Fixed:   ${results.issuesFixed}`);
    console.log(`  Issues Skipped: ${results.issuesSkipped}`);

    if (dryRun && results.issuesFixed > 0) {
        console.log('');
        console.log('  Run without --dry-run to apply fixes.');
    }

    // Save report
    const report = fixer.generateReport(results);
    const reportPath = './_tools/reports/LP_FIX_REPORT.md';
    fs.writeFileSync(reportPath, report);
    console.log(`\n  Report saved to: ${reportPath}`);
}

module.exports = LearningPathsFixer;
