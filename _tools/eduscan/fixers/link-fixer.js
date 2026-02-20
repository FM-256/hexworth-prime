#!/usr/bin/env node

/**
 * EduScan - Link Fixer
 *
 * Fixes broken internal links (PATH-004) detected by EduScan.
 *
 * Three fix strategies:
 * - WRONG_RELATIVE_DEPTH: Recomputes correct relative path using suggestion.location
 * - MOVED_RENAMED: Same as above
 * - MISSING_LOCAL: Disables link with "Barricaded" marker, preserves original href
 *
 * Special handling for index.html back-links: computes path to house index
 * rather than trusting scanner suggestions (which often point to wrong index files).
 *
 * Usage:
 *   node link-fixer.js [--dry-run] [--verbose]
 *
 * Created: 2026-02-19
 */

const fs = require('fs');
const path = require('path');

class LinkFixer {
    constructor(options = {}) {
        this.verbose = options.verbose || false;
        this.dryRun = options.dryRun || false;
        this.rootPath = path.resolve(options.rootPath || './_app');
        this.reportPath = options.reportPath || './_tools/reports/LINK_FIX_REPORT.md';
        this.treasureMapPath = options.treasureMapPath || './_tools/reports/TREASURE_MAP.json';

        this.stats = {
            autoFixed: 0,
            disabled: 0,
            skipped: 0,
            errors: 0,
            filesModified: 0
        };
        this.changes = [];
    }

    run() {
        console.log('=== EduScan Link Fixer ===');
        console.log(`Mode: ${this.dryRun ? 'DRY RUN (no files will be modified)' : 'APPLY'}`);
        console.log(`Root: ${this.rootPath}`);
        console.log();

        // Load TREASURE_MAP.json
        const data = JSON.parse(fs.readFileSync(this.treasureMapPath, 'utf8'));
        const issues = data.issues.filter(i => i.code === 'PATH-004');
        console.log(`Found ${issues.length} PATH-004 issues`);

        // Categorize issues
        const { autoFix, disable } = this.categorize(issues);
        console.log(`  Auto-fix: ${autoFix.length}`);
        console.log(`  Disable (Barricaded): ${disable.length}`);
        console.log();

        // Group by source file for batch processing
        const autoFixByFile = this.groupByFile(autoFix);
        const disableByFile = this.groupByFile(disable);

        // Merge all affected files
        const allFiles = new Set([...Object.keys(autoFixByFile), ...Object.keys(disableByFile)]);

        for (const file of [...allFiles].sort()) {
            this.processFile(file, autoFixByFile[file] || [], disableByFile[file] || []);
        }

        this.printSummary();

        if (!this.dryRun) {
            this.writeReport();
        }
    }

    /**
     * Categorize each issue into auto-fix or disable
     */
    categorize(issues) {
        const autoFix = [];
        const disable = [];

        for (const issue of issues) {
            const fixInfo = this.determineFix(issue);
            if (fixInfo.action === 'auto-fix') {
                autoFix.push({ ...issue, correctedPath: fixInfo.correctedPath, reason: fixInfo.reason });
            } else {
                disable.push({ ...issue, reason: fixInfo.reason });
            }
        }

        return { autoFix, disable };
    }

    /**
     * Determine the correct fix strategy for a single issue
     */
    determineFix(issue) {
        const { file, missingPath, bucket, suggestion } = issue;

        // --- MISSING_LOCAL: always disable ---
        if (bucket === 'MISSING_LOCAL') {
            return { action: 'disable', reason: 'File does not exist anywhere in codebase' };
        }

        // --- Index.html links need special handling ---
        if (missingPath.endsWith('index.html')) {
            return this.handleIndexLink(issue);
        }

        // --- WRONG_RELATIVE_DEPTH / MOVED_RENAMED with suggestion ---
        if (suggestion && suggestion.location) {
            return this.fixFromSuggestion(issue);
        }

        return { action: 'disable', reason: 'No valid suggestion available' };
    }

    /**
     * Fix using the scanner's suggestion.location field
     */
    fixFromSuggestion(issue) {
        const { file, suggestion } = issue;
        const sourceDir = path.dirname(file);

        // suggestion.location is like "_app/houses/cloud/tools/file.html"
        // Strip "_app/" prefix to get path relative to _app/
        const targetRelToApp = suggestion.location.replace(/^_app\//, '');

        // Verify target exists on disk
        const absTarget = path.join(this.rootPath, targetRelToApp);
        if (!fs.existsSync(absTarget)) {
            return { action: 'disable', reason: `Suggestion target missing: ${suggestion.location}` };
        }

        const correctedPath = path.relative(sourceDir, targetRelToApp);
        return { action: 'auto-fix', correctedPath, reason: `File found at ${targetRelToApp}` };
    }

    /**
     * Special handling for index.html links
     *
     * Generic back-links (../../index.html) → point to house index
     * Chapter/module links → use suggestion if good, else disable
     */
    handleIndexLink(issue) {
        const { file, missingPath, suggestion } = issue;
        const sourceDir = path.dirname(file);

        // Check if missingPath targets a house-level index (e.g., ../../forge/index.html)
        // If the house index exists, use it directly — don't trust scanner suggestions
        // which may point to random chapter indexes
        const houseNameMatch = missingPath.match(/(?:^|\/)([\w-]+)\/index\.html$/);
        if (houseNameMatch) {
            const candidateHouse = houseNameMatch[1];
            const houseIndex = `houses/${candidateHouse}/index.html`;
            const absTarget = path.join(this.rootPath, houseIndex);
            if (fs.existsSync(absTarget)) {
                const correctedPath = path.relative(sourceDir, houseIndex);
                return { action: 'auto-fix', correctedPath, reason: `House index link to ${candidateHouse}` };
            }
        }

        // Check if suggestion is trustworthy (not the catch-all arctic/arena index)
        if (suggestion && suggestion.location && !suggestion.location.includes('arctic/districts/arena')) {
            const targetRelToApp = suggestion.location.replace(/^_app\//, '');
            const absTarget = path.join(this.rootPath, targetRelToApp);
            if (fs.existsSync(absTarget)) {
                const correctedPath = path.relative(sourceDir, targetRelToApp);
                return { action: 'auto-fix', correctedPath, reason: `Verified suggestion: ${targetRelToApp}` };
            }
        }

        // Generic back-link pattern: ../../index.html, ../../../index.html, ./index.html
        if (/^(\.\.\/)+index\.html$/.test(missingPath) || missingPath === './index.html') {
            return this.fixGenericBackLink(issue);
        }

        // Specific path (chapters, fundamentals, subnetting, etc.) — target doesn't exist
        return { action: 'disable', reason: 'Index target does not exist' };
    }

    /**
     * Fix generic "back to index" links by computing path to house index
     */
    fixGenericBackLink(issue) {
        const { file, missingPath } = issue;
        const sourceDir = path.dirname(file);

        // Extract house from source path: houses/{house}/...
        const houseMatch = file.match(/^houses\/([^/]+)\//);
        if (houseMatch) {
            const house = houseMatch[1];
            const houseIndex = `houses/${house}/index.html`;
            const absTarget = path.join(this.rootPath, houseIndex);

            if (fs.existsSync(absTarget)) {
                const correctedPath = path.relative(sourceDir, houseIndex);
                return { action: 'auto-fix', correctedPath, reason: `Back-link to ${house} house index` };
            }
        }

        // Workshop or other non-house files
        if (file.startsWith('workshop/')) {
            // Extract target house from the broken path if possible
            const forgeMatch = missingPath.match(/forge/);
            if (forgeMatch) {
                const target = 'houses/forge/index.html';
                if (fs.existsSync(path.join(this.rootPath, target))) {
                    const correctedPath = path.relative(sourceDir, target);
                    return { action: 'auto-fix', correctedPath, reason: 'Workshop back-link to forge house' };
                }
            }
        }

        return { action: 'disable', reason: 'Cannot determine correct back-link target' };
    }

    /**
     * Group issues by their source file
     */
    groupByFile(issues) {
        const groups = {};
        for (const issue of issues) {
            if (!groups[issue.file]) groups[issue.file] = [];
            groups[issue.file].push(issue);
        }
        return groups;
    }

    /**
     * Process a single source file: apply all auto-fixes and disables
     */
    processFile(file, autoFixIssues, disableIssues) {
        const absPath = path.join(this.rootPath, file);
        if (!fs.existsSync(absPath)) {
            if (this.verbose) console.log(`  SKIP (not found): ${file}`);
            this.stats.skipped += autoFixIssues.length + disableIssues.length;
            return;
        }

        let content = fs.readFileSync(absPath, 'utf8');
        let modified = false;
        let fixCount = 0;
        let disableCount = 0;

        // Apply auto-fixes
        for (const issue of autoFixIssues) {
            const result = this.applyAutoFix(content, issue);
            if (result.changed) {
                content = result.content;
                modified = true;
                fixCount++;
                this.stats.autoFixed++;
                this.changes.push({
                    file, type: 'auto-fix',
                    from: issue.missingPath,
                    to: issue.correctedPath,
                    reason: issue.reason
                });
                if (this.verbose) {
                    console.log(`    FIX: ${issue.missingPath}`);
                    console.log(`      -> ${issue.correctedPath}`);
                }
            } else {
                this.stats.skipped++;
                if (this.verbose) {
                    console.log(`    SKIP: href="${issue.missingPath}" not found in source`);
                }
            }
        }

        // Apply disables
        for (const issue of disableIssues) {
            const result = this.applyDisable(content, issue);
            if (result.changed) {
                content = result.content;
                modified = true;
                disableCount++;
                this.stats.disabled++;
                this.changes.push({
                    file, type: 'disable',
                    href: issue.missingPath,
                    reason: issue.reason
                });
                if (this.verbose) {
                    console.log(`    DISABLE: ${issue.missingPath}`);
                }
            } else {
                this.stats.skipped++;
                if (this.verbose) {
                    console.log(`    SKIP: href="${issue.missingPath}" not found in source`);
                }
            }
        }

        if (modified) {
            this.stats.filesModified++;
            if (!this.dryRun) {
                fs.writeFileSync(absPath, content, 'utf8');
            }
            const label = this.dryRun ? '[DRY]' : '  OK ';
            const parts = [];
            if (fixCount > 0) parts.push(`${fixCount} fixed`);
            if (disableCount > 0) parts.push(`${disableCount} disabled`);
            console.log(`  ${label} ${file} (${parts.join(', ')})`);
        }
    }

    /**
     * Replace a broken href with the correct relative path
     */
    applyAutoFix(content, issue) {
        const escaped = this.escapeRegex(issue.missingPath);
        // Match href="<missingPath>" or href='<missingPath>'
        const regex = new RegExp(`(href\\s*=\\s*)(["'])${escaped}\\2`, 'g');

        if (!regex.test(content)) {
            return { content, changed: false };
        }

        regex.lastIndex = 0;
        const newContent = content.replace(regex, (match, prefix, quote) => {
            return `${prefix}${quote}${issue.correctedPath}${quote}`;
        });

        return { content: newContent, changed: true };
    }

    /**
     * Disable a broken link by removing href and adding Barricaded markers
     */
    applyDisable(content, issue) {
        const escaped = this.escapeRegex(issue.missingPath);
        // Match href="<missingPath>" or href='<missingPath>'
        const regex = new RegExp(`href\\s*=\\s*(["'])${escaped}\\1`, 'g');

        if (!regex.test(content)) {
            return { content, changed: false };
        }

        regex.lastIndex = 0;
        const replacement = `data-planned-href="${issue.missingPath}" title="Barricaded" style="opacity:0.4;cursor:default;pointer-events:none"`;
        const newContent = content.replace(regex, replacement);

        return { content: newContent, changed: true };
    }

    /**
     * Escape special regex characters in a string
     */
    escapeRegex(str) {
        return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    printSummary() {
        console.log();
        console.log('=== Summary ===');
        console.log(`  Auto-fixed:     ${this.stats.autoFixed}`);
        console.log(`  Disabled:       ${this.stats.disabled}`);
        console.log(`  Skipped:        ${this.stats.skipped}`);
        console.log(`  Files modified: ${this.stats.filesModified}`);
        if (this.stats.errors > 0) {
            console.log(`  Errors:         ${this.stats.errors}`);
        }
        if (this.dryRun) {
            console.log();
            console.log('  (Dry run - no files were modified. Remove --dry-run to apply.)');
        }
    }

    writeReport() {
        const autoFixes = this.changes.filter(c => c.type === 'auto-fix');
        const disables = this.changes.filter(c => c.type === 'disable');

        const lines = [
            '# Link Fix Report',
            '',
            `**Generated:** ${new Date().toISOString()}`,
            `**Total changes:** ${this.changes.length}`,
            `**Files modified:** ${this.stats.filesModified}`,
            '',
            '---',
            '',
            `## Auto-Fixed Links (${autoFixes.length})`,
            '',
            '| Source File | Old Path | New Path |',
            '|------------|----------|----------|'
        ];

        for (const c of autoFixes) {
            lines.push(`| \`${c.file}\` | \`${c.from}\` | \`${c.to}\` |`);
        }

        lines.push('');
        lines.push(`## Disabled Links — Barricaded (${disables.length})`);
        lines.push('');
        lines.push('| Source File | Disabled Href | Reason |');
        lines.push('|------------|---------------|--------|');

        for (const c of disables) {
            lines.push(`| \`${c.file}\` | \`${c.href}\` | ${c.reason} |`);
        }

        lines.push('');
        lines.push('---');
        lines.push('');
        lines.push('*To restore disabled links when content is created, search for `data-planned-href` attributes.*');
        lines.push('');

        fs.writeFileSync(this.reportPath, lines.join('\n'), 'utf8');
        console.log(`\nReport written to: ${this.reportPath}`);
    }
}

// --- CLI ---
const args = process.argv.slice(2);
const options = {
    dryRun: args.includes('--dry-run'),
    verbose: args.includes('--verbose')
};

const fixer = new LinkFixer(options);
fixer.run();
