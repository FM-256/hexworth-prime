#!/usr/bin/env node
/**
 * EduScan Fix: SEM-001 Heading Hierarchy
 *
 * Scans HTML files for heading hierarchy violations (skipped levels)
 * and optionally auto-fixes them by adjusting heading levels.
 *
 * Usage:
 *   node sem-001-heading-fix.js [directory]              # Scan only (dry-run)
 *   node sem-001-heading-fix.js [directory] --fix         # Scan and fix
 *   node sem-001-heading-fix.js [directory] --json        # Output JSON report
 *   node sem-001-heading-fix.js --file path/to/file.html  # Single file
 *
 * Rules:
 *   - h1 -> h2 OK, h2 -> h3 OK (sequential)
 *   - h1 -> h3 BAD (skipped h2)
 *   - h3 -> h1 OK (going back up is always fine)
 *   - Headings inside <script> and <style> blocks are ignored
 *
 * ES-14
 */

const fs = require('fs');
const path = require('path');

// ─── Configuration ──────────────────────────────────────────

const DEFAULT_ROOT = path.resolve(__dirname, '../../../_app');

// ─── Utilities ──────────────────────────────────────────────

/**
 * Recursively walk a directory tree and collect .html files.
 */
function walkDir(dir) {
    const results = [];
    let entries;
    try {
        entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch (err) {
        console.error(`Cannot read directory: ${dir} (${err.code})`);
        return results;
    }
    for (const entry of entries) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            // Skip hidden dirs, node_modules
            if (entry.name.startsWith('.') || entry.name === 'node_modules') continue;
            results.push(...walkDir(full));
        } else if (entry.name.endsWith('.html')) {
            results.push(full);
        }
    }
    return results;
}

/**
 * Check if a character position is inside a <script> or <style> block.
 */
function isInsideScriptOrStyle(content, index) {
    const blockRegex = /<(script|style)\b[\s\S]*?<\/\1>/gi;
    let match;
    while ((match = blockRegex.exec(content)) !== null) {
        if (index >= match.index && index < match.index + match[0].length) {
            return true;
        }
    }
    return false;
}

/**
 * Strip <script> and <style> blocks for analysis purposes.
 */
function stripScriptsAndStyles(content) {
    return content
        .replace(/<script[\s\S]*?<\/script>/gi, '')
        .replace(/<style[\s\S]*?<\/style>/gi, '');
}

/**
 * Get line number from character index.
 */
function getLineNumber(content, index) {
    return content.substring(0, index).split('\n').length;
}

/**
 * Detect JS-rendered pages that generate headings dynamically.
 */
function isJSRendered(content) {
    if (/HouseRenderer\.init\s*\(/i.test(content)) return true;
    if (/new\s+QuizEngine\s*\(/i.test(content)) return true;
    if (/quiz\.start\s*\(\s*\)/i.test(content)) return true;
    if (/ArcticEngine\.render/i.test(content)) return true;
    return false;
}

// ─── Core Functions ─────────────────────────────────────────

/**
 * Scan a single file for SEM-001 heading hierarchy violations.
 *
 * @param {string} filePath - Absolute path to HTML file
 * @returns {Array<Object>} Array of issue objects
 */
function scanFile(filePath) {
    let content;
    try {
        content = fs.readFileSync(filePath, 'utf8');
    } catch (err) {
        return [{ code: 'SEM-001', file: filePath, error: `Cannot read: ${err.code}` }];
    }

    if (isJSRendered(content)) return [];

    const cleanContent = stripScriptsAndStyles(content);
    const issues = [];
    const headingRegex = /<h([1-6])\b[^>]*>/gi;
    let match;
    let lastLevel = 0;

    while ((match = headingRegex.exec(cleanContent)) !== null) {
        const level = parseInt(match[1], 10);
        const line = getLineNumber(cleanContent, match.index);

        if (lastLevel > 0 && level > lastLevel + 1) {
            const skipped = [];
            for (let i = lastLevel + 1; i < level; i++) {
                skipped.push('h' + i);
            }
            issues.push({
                code: 'SEM-001',
                severity: 'low',
                file: filePath,
                line: line,
                from: 'h' + lastLevel,
                to: 'h' + level,
                skipped: skipped,
                message: `Heading skip: h${lastLevel} -> h${level} (missing ${skipped.join(', ')})`
            });
        }

        lastLevel = level;
    }

    return issues;
}

/**
 * Fix heading hierarchy violations in a single file.
 *
 * Strategy: Walk all headings outside script/style blocks. When a heading
 * skips a level (e.g., h2 -> h4), demote it to lastLevel + 1. Iterate
 * until no more skips remain (handles cascading adjustments).
 *
 * @param {string} filePath - Absolute path to HTML file
 * @param {boolean} dryRun - If true, do not write changes to disk
 * @returns {Object} { filePath, issuesBefore, issuesAfter, fixCount, changed }
 */
function fixFile(filePath, dryRun) {
    if (typeof dryRun === 'undefined') dryRun = true;

    let content;
    try {
        content = fs.readFileSync(filePath, 'utf8');
    } catch (err) {
        return { filePath, error: `Cannot read: ${err.code}`, fixCount: 0, changed: false };
    }

    if (isJSRendered(content)) {
        return { filePath, fixCount: 0, changed: false, skipped: 'JS-rendered page' };
    }

    const issuesBefore = scanFile(filePath);
    if (issuesBefore.length === 0) {
        return { filePath, issuesBefore: 0, issuesAfter: 0, fixCount: 0, changed: false };
    }

    let totalFixes = 0;
    let iterations = 0;
    const MAX_ITERATIONS = 10;

    while (iterations < MAX_ITERATIONS) {
        iterations++;
        const fixes = [];

        // Collect all headings outside script/style
        const headingRegex = /<h([1-6])\b([^>]*)>/gi;
        let match;
        let lastLevel = 0;
        const headings = [];

        while ((match = headingRegex.exec(content)) !== null) {
            if (isInsideScriptOrStyle(content, match.index)) continue;
            headings.push({
                index: match.index,
                fullMatch: match[0],
                level: parseInt(match[1], 10),
                attrs: match[2]
            });
        }

        // Determine corrections
        lastLevel = 0;
        for (const h of headings) {
            if (lastLevel > 0 && h.level > lastLevel + 1) {
                const newLevel = lastLevel + 1;
                fixes.push({
                    index: h.index,
                    oldTag: h.fullMatch,
                    oldLevel: h.level,
                    newLevel: newLevel,
                    attrs: h.attrs
                });
                lastLevel = newLevel;
            } else {
                lastLevel = h.level;
            }
        }

        if (fixes.length === 0) break;

        // Apply fixes from end to start so indices stay valid
        for (let i = fixes.length - 1; i >= 0; i--) {
            const fix = fixes[i];
            const pos = fix.index;
            const openTag = `<h${fix.newLevel}${fix.attrs}>`;

            // Replace opening tag
            content = content.substring(0, pos) + openTag +
                content.substring(pos + fix.oldTag.length);

            // Find and replace corresponding closing tag
            const searchAfter = pos + openTag.length;
            const closeRegex = new RegExp(`<\\/h${fix.oldLevel}>`, 'i');
            const afterContent = content.substring(searchAfter);
            const closeMatch = afterContent.match(closeRegex);
            if (closeMatch) {
                const closePos = searchAfter + closeMatch.index;
                content = content.substring(0, closePos) +
                    `</h${fix.newLevel}>` +
                    content.substring(closePos + closeMatch[0].length);
            }
        }

        totalFixes += fixes.length;
    }

    // Verify fix worked by re-scanning the modified content
    const tempPath = filePath + '.sem001-check';
    let issuesAfter = 0;
    // Re-scan in memory by writing to a temp approach -- just use the content directly
    const afterClean = stripScriptsAndStyles(content);
    const afterRegex = /<h([1-6])\b[^>]*>/gi;
    let afterMatch;
    let afterLast = 0;
    while ((afterMatch = afterRegex.exec(afterClean)) !== null) {
        const level = parseInt(afterMatch[1], 10);
        if (afterLast > 0 && level > afterLast + 1) {
            issuesAfter++;
        }
        afterLast = level;
    }

    if (!dryRun && totalFixes > 0) {
        fs.writeFileSync(filePath, content, 'utf8');
    }

    return {
        filePath,
        issuesBefore: issuesBefore.length,
        issuesAfter,
        fixCount: totalFixes,
        changed: totalFixes > 0
    };
}

/**
 * Scan an entire directory tree for SEM-001 violations.
 *
 * @param {string} directory - Root directory to scan
 * @returns {Object} { files: total, filesWithIssues, totalIssues, issues: [] }
 */
function batchScan(directory) {
    const dir = path.resolve(directory || DEFAULT_ROOT);
    const files = walkDir(dir);
    const allIssues = [];
    let filesWithIssues = 0;

    for (const filePath of files) {
        const issues = scanFile(filePath);
        if (issues.length > 0) {
            filesWithIssues++;
            allIssues.push(...issues);
        }
    }

    return {
        directory: dir,
        files: files.length,
        filesWithIssues,
        totalIssues: allIssues.length,
        issues: allIssues
    };
}

/**
 * Generate a summary report from scan results.
 *
 * @param {Object} scanResult - Output from batchScan()
 * @returns {string} Formatted report string
 */
function generateReport(scanResult) {
    const lines = [];
    lines.push('='.repeat(60));
    lines.push('  SEM-001 Heading Hierarchy Report');
    lines.push('='.repeat(60));
    lines.push('');
    lines.push(`Directory:        ${scanResult.directory}`);
    lines.push(`Files scanned:    ${scanResult.files}`);
    lines.push(`Files with issues: ${scanResult.filesWithIssues}`);
    lines.push(`Total violations:  ${scanResult.totalIssues}`);
    lines.push('');

    if (scanResult.totalIssues === 0) {
        lines.push('No heading hierarchy violations found.');
        return lines.join('\n');
    }

    // Group by file
    const byFile = {};
    for (const issue of scanResult.issues) {
        if (!byFile[issue.file]) byFile[issue.file] = [];
        byFile[issue.file].push(issue);
    }

    // Breakdown by skip type
    const skipTypes = {};
    for (const issue of scanResult.issues) {
        if (issue.from && issue.to) {
            const key = `${issue.from} -> ${issue.to}`;
            skipTypes[key] = (skipTypes[key] || 0) + 1;
        }
    }

    lines.push('-'.repeat(60));
    lines.push('  Skip Type Breakdown');
    lines.push('-'.repeat(60));
    const sorted = Object.entries(skipTypes).sort((a, b) => b[1] - a[1]);
    for (const [type, count] of sorted) {
        lines.push(`  ${type.padEnd(20)} ${count}`);
    }
    lines.push('');

    lines.push('-'.repeat(60));
    lines.push('  Files with Violations');
    lines.push('-'.repeat(60));
    const fileEntries = Object.entries(byFile).sort((a, b) => b[1].length - a[1].length);
    for (const [file, issues] of fileEntries) {
        const relPath = path.relative(process.cwd(), file);
        lines.push(`  ${relPath} (${issues.length} violation${issues.length > 1 ? 's' : ''})`);
        for (const issue of issues) {
            lines.push(`    Line ${issue.line}: ${issue.message}`);
        }
    }

    return lines.join('\n');
}

// ─── CLI ────────────────────────────────────────────────────

function main() {
    const args = process.argv.slice(2);
    const flags = {
        fix: args.includes('--fix'),
        json: args.includes('--json'),
        help: args.includes('--help') || args.includes('-h'),
        file: null,
        directory: null
    };

    // Parse --file flag
    const fileIdx = args.indexOf('--file');
    if (fileIdx !== -1 && args[fileIdx + 1]) {
        flags.file = path.resolve(args[fileIdx + 1]);
    }

    // First non-flag argument is directory
    for (const arg of args) {
        if (!arg.startsWith('--') && !arg.startsWith('-')) {
            if (!flags.file) {
                flags.directory = path.resolve(arg);
            }
            break;
        }
    }

    if (flags.help) {
        console.log('SEM-001 Heading Hierarchy Fix Tool (ES-14)');
        console.log('');
        console.log('Usage:');
        console.log('  node sem-001-heading-fix.js [directory]          Scan (dry-run)');
        console.log('  node sem-001-heading-fix.js [directory] --fix    Scan and fix');
        console.log('  node sem-001-heading-fix.js [directory] --json   JSON report');
        console.log('  node sem-001-heading-fix.js --file <path>        Single file scan');
        console.log('  node sem-001-heading-fix.js --file <path> --fix  Single file fix');
        console.log('');
        console.log('Default directory: _app/');
        return;
    }

    // Single file mode
    if (flags.file) {
        if (!fs.existsSync(flags.file)) {
            console.error(`File not found: ${flags.file}`);
            process.exit(1);
        }

        if (flags.fix) {
            const result = fixFile(flags.file, false);
            if (flags.json) {
                console.log(JSON.stringify(result, null, 2));
            } else {
                if (result.changed) {
                    console.log(`FIXED: ${path.relative(process.cwd(), flags.file)}`);
                    console.log(`  ${result.fixCount} heading(s) adjusted`);
                    console.log(`  Issues: ${result.issuesBefore} -> ${result.issuesAfter}`);
                } else {
                    console.log(`OK: ${path.relative(process.cwd(), flags.file)} (no issues)`);
                }
            }
        } else {
            const issues = scanFile(flags.file);
            if (flags.json) {
                console.log(JSON.stringify(issues, null, 2));
            } else {
                if (issues.length === 0) {
                    console.log(`OK: ${path.relative(process.cwd(), flags.file)} (no issues)`);
                } else {
                    console.log(`${path.relative(process.cwd(), flags.file)}: ${issues.length} violation(s)`);
                    for (const issue of issues) {
                        console.log(`  Line ${issue.line}: ${issue.message}`);
                    }
                }
            }
        }
        return;
    }

    // Batch mode
    const dir = flags.directory || DEFAULT_ROOT;

    if (!fs.existsSync(dir)) {
        console.error(`Directory not found: ${dir}`);
        process.exit(1);
    }

    console.log(`SEM-001 Heading Hierarchy ${flags.fix ? 'Fix' : 'Scan'}`);
    console.log(`Target: ${dir}`);
    console.log(`Mode: ${flags.fix ? 'LIVE FIX' : 'DRY RUN (use --fix to apply)'}`);
    console.log('');

    if (flags.fix) {
        // Fix mode: scan and fix all files
        const files = walkDir(dir);
        const results = [];
        let totalFixed = 0;
        let totalFixCount = 0;

        for (const filePath of files) {
            const result = fixFile(filePath, false);
            if (result.changed) {
                totalFixed++;
                totalFixCount += result.fixCount;
                results.push(result);
                const rel = path.relative(process.cwd(), filePath);
                console.log(`  FIXED: ${rel} (${result.fixCount} headings, ${result.issuesBefore} -> ${result.issuesAfter} issues)`);
            }
        }

        console.log('');
        console.log('-'.repeat(60));
        console.log(`Files scanned:   ${files.length}`);
        console.log(`Files fixed:     ${totalFixed}`);
        console.log(`Headings adjusted: ${totalFixCount}`);

        if (flags.json) {
            const jsonPath = path.join(process.cwd(), 'sem-001-fix-report.json');
            fs.writeFileSync(jsonPath, JSON.stringify({
                timestamp: new Date().toISOString(),
                directory: dir,
                filesScanned: files.length,
                filesFixed: totalFixed,
                totalFixes: totalFixCount,
                details: results
            }, null, 2));
            console.log(`\nJSON report: ${jsonPath}`);
        }
    } else {
        // Scan-only mode
        const scanResult = batchScan(dir);
        const report = generateReport(scanResult);
        console.log(report);

        if (flags.json) {
            const jsonPath = path.join(process.cwd(), 'sem-001-scan-report.json');
            fs.writeFileSync(jsonPath, JSON.stringify({
                timestamp: new Date().toISOString(),
                directory: scanResult.directory,
                filesScanned: scanResult.files,
                filesWithIssues: scanResult.filesWithIssues,
                totalViolations: scanResult.totalIssues,
                issues: scanResult.issues.map(i => ({
                    file: path.relative(process.cwd(), i.file),
                    line: i.line,
                    from: i.from,
                    to: i.to,
                    skipped: i.skipped,
                    message: i.message
                }))
            }, null, 2));
            console.log(`\nJSON report: ${jsonPath}`);
        }
    }
}

// ─── Exports (for use as module) ────────────────────────────

module.exports = { scanFile, fixFile, batchScan, generateReport };

// ─── Run CLI if invoked directly ────────────────────────────

if (require.main === module) {
    main();
}
