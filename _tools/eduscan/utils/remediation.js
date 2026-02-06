/**
 * EduScan - Remediation Planner
 *
 * Generates actionable remediation plans from scan results.
 * Groups issues by subtree, code, and confidence level.
 * Outputs both PATCH_PLAN.md and PATCH_PLAN.json for different workflows.
 *
 * Categories:
 *   SAFE_AUTO_FIX: autoFixable=true AND confidence >= 0.95
 *   REVIEW_NEEDED: autoFixable=true AND confidence 0.70-0.94
 *   MANUAL_ONLY: autoFixable=false OR confidence < 0.70
 */

const fs = require('fs');
const path = require('path');

// Confidence thresholds for categorization
const CONFIDENCE = {
    HIGH: 0.95,
    MEDIUM: 0.70
};

// Category names
const CATEGORIES = {
    SAFE_AUTO_FIX: 'safeAutoFix',
    REVIEW_NEEDED: 'reviewNeeded',
    MANUAL_ONLY: 'manualOnly'
};

class RemediationPlanner {
    constructor(options = {}) {
        this.outputDir = options.outputDir || './_tools/reports';
        this.jsonFilename = options.jsonFilename || 'PATCH_PLAN.json';
        this.mdFilename = options.mdFilename || 'PATCH_PLAN.md';
        this.verbose = options.verbose || false;
    }

    /**
     * Generate remediation plan from scan results
     * @param {Object} scanResults - Full scan results object from EduScan
     * @returns {Object} Plan object with { json, markdown }
     */
    generatePlan(scanResults) {
        // Extract all issues from scan results
        const allIssues = this.extractIssues(scanResults);

        if (this.verbose) {
            console.log(`[REMEDIATION] Processing ${allIssues.length} issues...`);
        }

        // Categorize issues by auto-fix safety
        const categorized = this.categorizeIssues(allIssues);

        // Group issues within each category by subtree and code
        const grouped = {
            safeAutoFix: this.groupIssues(categorized.safeAutoFix),
            reviewNeeded: this.groupIssues(categorized.reviewNeeded),
            manualOnly: this.groupIssues(categorized.manualOnly)
        };

        // Build summary
        const summary = {
            total: allIssues.length,
            safeAutoFix: categorized.safeAutoFix.length,
            reviewNeeded: categorized.reviewNeeded.length,
            manualOnly: categorized.manualOnly.length,
            bySeverity: this.countBySeverity(allIssues),
            byCode: this.countByCode(allIssues),
            bySubtree: this.countBySubtree(allIssues)
        };

        // Generate outputs
        const jsonPlan = this.buildJsonPlan(summary, grouped, categorized);
        const markdown = this.buildMarkdownPlan(summary, grouped);

        return {
            json: jsonPlan,
            markdown
        };
    }

    /**
     * Extract issues from scan results
     * Handles both full scan and focused scan formats
     */
    extractIssues(scanResults) {
        let issues = [];

        // Full scan format
        if (scanResults.validation && scanResults.validation.issues) {
            issues = [...scanResults.validation.issues];
        }
        // Syntax scan format
        else if (scanResults.syntax && scanResults.syntax.issues) {
            issues = [...scanResults.syntax.issues];
        }
        // Orphan scan format
        else if (scanResults.orphans && scanResults.orphans.issues) {
            issues = [...scanResults.orphans.issues];
        }
        // Coverage scan format
        else if (scanResults.coverage && scanResults.coverage.issues) {
            issues = [...scanResults.coverage.issues];
        }
        // Direct issues array
        else if (Array.isArray(scanResults)) {
            issues = [...scanResults];
        }
        // Issues property at root
        else if (scanResults.issues && Array.isArray(scanResults.issues)) {
            issues = [...scanResults.issues];
        }

        // Normalize issues to ensure required fields
        return issues.map(issue => this.normalizeIssue(issue));
    }

    /**
     * Normalize issue to ensure consistent structure
     */
    normalizeIssue(issue) {
        return {
            code: issue.code || 'UNKNOWN',
            severity: issue.severity || 'medium',
            message: issue.message || 'No message',
            file: issue.file || null,
            line: issue.line || null,
            autoFixable: issue.autoFixable || false,
            confidence: this.extractConfidence(issue),
            fix: issue.fix || null,
            suggestion: issue.suggestion || null,
            suggestions: issue.suggestions || [],
            bucket: issue.bucket || null,
            category: issue.category || null,
            current: issue.current || null,
            suggested: issue.suggested || null,
            // Preserve original for detailed output
            _original: issue
        };
    }

    /**
     * Extract confidence score from issue
     */
    extractConfidence(issue) {
        // Direct confidence field
        if (typeof issue.confidence === 'number') {
            return issue.confidence;
        }
        // Confidence in suggestion object
        if (issue.suggestion && typeof issue.suggestion.confidence === 'number') {
            return issue.suggestion.confidence;
        }
        // Default confidence based on autoFixable
        if (issue.autoFixable) {
            return 0.85; // Medium confidence for generic auto-fixable
        }
        return 0.0; // No confidence for non-auto-fixable
    }

    /**
     * Categorize issues into SAFE_AUTO_FIX, REVIEW_NEEDED, MANUAL_ONLY
     */
    categorizeIssues(issues) {
        const safeAutoFix = [];
        const reviewNeeded = [];
        const manualOnly = [];

        for (const issue of issues) {
            if (!issue.autoFixable || issue.confidence < CONFIDENCE.MEDIUM) {
                // Not auto-fixable or very low confidence
                manualOnly.push(issue);
            } else if (issue.confidence >= CONFIDENCE.HIGH) {
                // High confidence auto-fix
                safeAutoFix.push(issue);
            } else {
                // Medium confidence - needs review
                reviewNeeded.push(issue);
            }
        }

        return { safeAutoFix, reviewNeeded, manualOnly };
    }

    /**
     * Group issues by subtree and then by code
     * @param {Array} issues - Issues array
     * @returns {Map} Nested map: subtree -> code -> issues[]
     */
    groupIssues(issues) {
        const grouped = new Map();

        for (const issue of issues) {
            const subtree = this.getSubtree(issue.file);
            const code = issue.code;

            if (!grouped.has(subtree)) {
                grouped.set(subtree, new Map());
            }
            const subtreeMap = grouped.get(subtree);

            if (!subtreeMap.has(code)) {
                subtreeMap.set(code, []);
            }
            subtreeMap.get(code).push(issue);
        }

        // Sort subtrees and codes
        const sortedGrouped = new Map();
        const sortedSubtrees = Array.from(grouped.keys()).sort();

        for (const subtree of sortedSubtrees) {
            const subtreeMap = grouped.get(subtree);
            const sortedCodes = new Map();
            const codes = Array.from(subtreeMap.keys()).sort();

            for (const code of codes) {
                sortedCodes.set(code, subtreeMap.get(code));
            }
            sortedGrouped.set(subtree, sortedCodes);
        }

        return sortedGrouped;
    }

    /**
     * Extract subtree from file path
     */
    getSubtree(filePath) {
        if (!filePath) {
            return 'unknown';
        }

        // Normalize path separators
        const normalized = filePath.replace(/\\/g, '/');
        const parts = normalized.split('/');

        // Find the relevant subtree
        // Pattern: houses/<house> -> houses/<house>
        // Pattern: components -> components
        // Pattern: dark-arts -> dark-arts
        const houseIndex = parts.indexOf('houses');
        if (houseIndex !== -1 && parts.length > houseIndex + 1) {
            return `houses/${parts[houseIndex + 1]}`;
        }

        // Check for other known top-level directories
        const knownDirs = ['components', 'config', 'utils', 'styles', 'assets', 'dark-arts', 'digital-life'];
        for (const dir of knownDirs) {
            if (parts.includes(dir)) {
                return dir;
            }
        }

        // Fall back to first path segment
        return parts[0] || 'root';
    }

    /**
     * Count issues by severity
     */
    countBySeverity(issues) {
        const counts = { critical: 0, high: 0, medium: 0, low: 0, info: 0, warning: 0 };
        for (const issue of issues) {
            const sev = issue.severity || 'medium';
            counts[sev] = (counts[sev] || 0) + 1;
        }
        return counts;
    }

    /**
     * Count issues by code
     */
    countByCode(issues) {
        const counts = {};
        for (const issue of issues) {
            const code = issue.code || 'UNKNOWN';
            counts[code] = (counts[code] || 0) + 1;
        }
        return counts;
    }

    /**
     * Count issues by subtree
     */
    countBySubtree(issues) {
        const counts = {};
        for (const issue of issues) {
            const subtree = this.getSubtree(issue.file);
            counts[subtree] = (counts[subtree] || 0) + 1;
        }
        return counts;
    }

    /**
     * Build JSON plan object
     */
    buildJsonPlan(summary, grouped, categorized) {
        return {
            generated: new Date().toISOString(),
            tool: 'EduScan RemediationPlanner',
            version: '1.0.0',
            summary,
            safeAutoFix: this.groupedMapToArray(grouped.safeAutoFix),
            reviewNeeded: this.groupedMapToArray(grouped.reviewNeeded),
            manualOnly: this.groupedMapToArray(grouped.manualOnly),
            // Flat arrays for easy processing
            _flat: {
                safeAutoFix: categorized.safeAutoFix,
                reviewNeeded: categorized.reviewNeeded,
                manualOnly: categorized.manualOnly
            }
        };
    }

    /**
     * Convert grouped Map to array format for JSON
     */
    groupedMapToArray(groupedMap) {
        const result = [];

        for (const [subtree, codeMap] of groupedMap) {
            const subtreeEntry = {
                subtree,
                issueCount: 0,
                byCodes: []
            };

            for (const [code, issues] of codeMap) {
                subtreeEntry.byCodes.push({
                    code,
                    count: issues.length,
                    issues: issues.map(i => ({
                        file: i.file,
                        line: i.line,
                        message: i.message,
                        fix: i.fix,
                        confidence: i.confidence,
                        suggestion: i.suggestion
                    }))
                });
                subtreeEntry.issueCount += issues.length;
            }

            result.push(subtreeEntry);
        }

        return result;
    }

    /**
     * Build Markdown plan
     */
    buildMarkdownPlan(summary, grouped) {
        const lines = [];
        const date = new Date().toISOString().split('T')[0];

        // Header
        lines.push('# EduScan Remediation Plan');
        lines.push(`Generated: ${date}`);
        lines.push('');

        // Summary
        lines.push('## Summary');
        lines.push('');
        lines.push(`- **Total issues:** ${summary.total}`);
        lines.push(`- **Safe to auto-fix:** ${summary.safeAutoFix}`);
        lines.push(`- **Need review:** ${summary.reviewNeeded}`);
        lines.push(`- **Manual only:** ${summary.manualOnly}`);
        lines.push('');

        // Severity breakdown
        lines.push('### By Severity');
        lines.push('');
        const sevOrder = ['critical', 'high', 'medium', 'low', 'warning', 'info'];
        for (const sev of sevOrder) {
            if (summary.bySeverity[sev] > 0) {
                lines.push(`- ${sev.toUpperCase()}: ${summary.bySeverity[sev]}`);
            }
        }
        lines.push('');

        // Safe Auto-Fix Section
        if (summary.safeAutoFix > 0) {
            lines.push(`## Safe Auto-Fix (${summary.safeAutoFix} issues)`);
            lines.push('');
            lines.push('These issues have high confidence (>=95%) and can be safely auto-fixed.');
            lines.push('');
            this.appendGroupedSection(lines, grouped.safeAutoFix);
        }

        // Review Needed Section
        if (summary.reviewNeeded > 0) {
            lines.push(`## Review Needed (${summary.reviewNeeded} issues)`);
            lines.push('');
            lines.push('These issues are auto-fixable but have medium confidence (70-94%). Review before applying.');
            lines.push('');
            this.appendGroupedSection(lines, grouped.reviewNeeded);
        }

        // Manual Only Section
        if (summary.manualOnly > 0) {
            lines.push(`## Manual Only (${summary.manualOnly} issues)`);
            lines.push('');
            lines.push('These issues require manual intervention (not auto-fixable or low confidence).');
            lines.push('');
            this.appendGroupedSection(lines, grouped.manualOnly, true);
        }

        // Footer
        lines.push('---');
        lines.push('');
        lines.push('Generated by EduScan RemediationPlanner v1.0.0');

        return lines.join('\n');
    }

    /**
     * Append grouped issues section to markdown
     */
    appendGroupedSection(lines, groupedMap, isManual = false) {
        for (const [subtree, codeMap] of groupedMap) {
            // Count total issues in subtree
            let subtreeTotal = 0;
            for (const [, issues] of codeMap) {
                subtreeTotal += issues.length;
            }

            lines.push(`### ${subtree} (${subtreeTotal} issues)`);
            lines.push('');

            // Create table for each code
            for (const [code, issues] of codeMap) {
                if (issues.length > 10 && !isManual) {
                    // For large groups in auto-fix sections, show summary
                    lines.push(`**${code}** (${issues.length} issues)`);
                    lines.push('');
                    lines.push('| File | Fix |');
                    lines.push('|------|-----|');

                    // Show first 5
                    for (const issue of issues.slice(0, 5)) {
                        const file = this.shortenPath(issue.file);
                        const fix = this.escapeMarkdown(this.shortenFix(issue.fix));
                        lines.push(`| \`${file}\` | ${fix} |`);
                    }

                    if (issues.length > 5) {
                        lines.push(`| ... | *and ${issues.length - 5} more with same pattern* |`);
                    }
                    lines.push('');
                } else {
                    // Full table for smaller groups or manual section
                    lines.push(`**${code}** (${issues.length} issues)`);
                    lines.push('');
                    lines.push('| File | Issue | Fix |');
                    lines.push('|------|-------|-----|');

                    for (const issue of issues) {
                        const file = this.shortenPath(issue.file);
                        const msg = this.escapeMarkdown(this.shortenMessage(issue.message));
                        const fix = this.escapeMarkdown(this.shortenFix(issue.fix));
                        lines.push(`| \`${file}\` | ${msg} | ${fix} |`);
                    }
                    lines.push('');
                }
            }
        }
    }

    /**
     * Shorten file path for display
     */
    shortenPath(filePath) {
        if (!filePath) return 'N/A';
        // Keep last 3 segments
        const parts = filePath.split('/');
        if (parts.length > 3) {
            return '.../' + parts.slice(-3).join('/');
        }
        return filePath;
    }

    /**
     * Shorten message for table
     */
    shortenMessage(message) {
        if (!message) return 'N/A';
        if (message.length > 50) {
            return message.substring(0, 47) + '...';
        }
        return message;
    }

    /**
     * Shorten fix description for table
     */
    shortenFix(fix) {
        if (!fix) return 'Manual review required';
        if (fix.length > 60) {
            return fix.substring(0, 57) + '...';
        }
        return fix;
    }

    /**
     * Escape markdown special characters
     */
    escapeMarkdown(text) {
        if (!text) return '';
        return text
            .replace(/\|/g, '\\|')
            .replace(/\n/g, ' ');
    }

    /**
     * Save plan to files
     * @param {Object} plan - Plan object from generatePlan
     * @returns {Object} Paths to saved files
     */
    savePlan(plan) {
        // Ensure output directory exists
        const absoluteDir = path.resolve(this.outputDir);
        if (!fs.existsSync(absoluteDir)) {
            fs.mkdirSync(absoluteDir, { recursive: true });
        }

        // Save JSON
        const jsonPath = path.join(absoluteDir, this.jsonFilename);
        fs.writeFileSync(jsonPath, JSON.stringify(plan.json, null, 2), 'utf8');

        // Save Markdown
        const mdPath = path.join(absoluteDir, this.mdFilename);
        fs.writeFileSync(mdPath, plan.markdown, 'utf8');

        return {
            json: {
                path: jsonPath,
                size: fs.statSync(jsonPath).size
            },
            markdown: {
                path: mdPath,
                size: fs.statSync(mdPath).size
            }
        };
    }

    /**
     * Format summary for console output
     * @param {Object} plan - Plan object from generatePlan
     * @param {Function} colorFn - Color function (text, ...colors) => coloredText
     * @returns {string} Formatted console output
     */
    formatForConsole(plan, colorFn) {
        const c = colorFn || ((text) => text);
        const summary = plan.json.summary;

        let output = '';

        output += c('=' .repeat(60), 'dim') + '\n';
        output += c(' REMEDIATION PLAN GENERATED', 'bright', 'cyan') + '\n';
        output += c('='.repeat(60), 'dim') + '\n\n';

        output += `  ${c('Total Issues:', 'bright')} ${summary.total}\n\n`;

        // Category breakdown with colors
        output += `  ${c('Safe Auto-Fix:', 'green', 'bright')} ${summary.safeAutoFix} issues\n`;
        output += `  ${c('  (confidence >= 95%, autoFixable=true)', 'dim')}\n\n`;

        output += `  ${c('Review Needed:', 'yellow', 'bright')} ${summary.reviewNeeded} issues\n`;
        output += `  ${c('  (confidence 70-94%, autoFixable=true)', 'dim')}\n\n`;

        output += `  ${c('Manual Only:', 'red', 'bright')} ${summary.manualOnly} issues\n`;
        output += `  ${c('  (low confidence or not auto-fixable)', 'dim')}\n\n`;

        // Top issue codes
        if (Object.keys(summary.byCode).length > 0) {
            output += `  ${c('Top Issue Codes:', 'bright')}\n`;
            const sortedCodes = Object.entries(summary.byCode)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5);

            for (const [code, count] of sortedCodes) {
                output += `    ${c(code, 'cyan')}: ${count}\n`;
            }
            output += '\n';
        }

        // Top subtrees
        if (Object.keys(summary.bySubtree).length > 0) {
            output += `  ${c('Most Affected Areas:', 'bright')}\n`;
            const sortedSubtrees = Object.entries(summary.bySubtree)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5);

            for (const [subtree, count] of sortedSubtrees) {
                output += `    ${c(subtree, 'magenta')}: ${count} issues\n`;
            }
            output += '\n';
        }

        output += c('='.repeat(60), 'dim') + '\n';

        return output;
    }
}

// Export thresholds for external use
RemediationPlanner.CONFIDENCE = CONFIDENCE;
RemediationPlanner.CATEGORIES = CATEGORIES;

module.exports = RemediationPlanner;
