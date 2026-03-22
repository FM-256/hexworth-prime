#!/usr/bin/env node
/**
 * EduScan Fix: HEUR-007 Code Block White-Space
 *
 * Scans HTML files for CSS rules that use monospace font-family but are
 * missing white-space: pre or pre-wrap. Without this property, multi-line
 * command examples and code snippets render as flowing paragraphs.
 *
 * Targets these CSS selector patterns:
 *   .code-block, .code-block-sm, .code-block pre, .command-block,
 *   .terminal-code, .code-example, and similar variants.
 *
 * Usage:
 *   node heur-007-whitespace-fix.js [directory]              # Scan only (dry-run)
 *   node heur-007-whitespace-fix.js [directory] --fix        # Scan and fix
 *   node heur-007-whitespace-fix.js [directory] --json       # Output JSON report
 *   node heur-007-whitespace-fix.js --file path/to/file.html # Single file
 */

const fs = require('fs');
const path = require('path');

// --- Configuration ---

const DEFAULT_ROOT = path.resolve(__dirname, '../../../_app');

// CSS selectors that represent code/command containers.
// These are matched as patterns inside <style> blocks.
const CODE_SELECTOR_PATTERN =
    /(\.(code-block(?:-[a-zA-Z0-9]+)?|command-block|terminal-code|code-example)(?:\s+pre)?)\s*\{([^}]+)\}/g;

// --- Utilities ---

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
            if (entry.name.startsWith('.') || entry.name === 'node_modules') continue;
            results.push(...walkDir(full));
        } else if (entry.name.endsWith('.html')) {
            results.push(full);
        }
    }
    return results;
}

function getLineNumber(content, index) {
    return content.substring(0, index).split('\n').length;
}

// --- Core Functions ---

/**
 * Scan a single file for HEUR-007 violations.
 *
 * Returns an array of issue objects describing each CSS rule that has
 * monospace font-family but no white-space: pre/pre-wrap.
 */
function scanFile(filePath) {
    let content;
    try {
        content = fs.readFileSync(filePath, 'utf8');
    } catch (err) {
        return [{ code: 'HEUR-007', file: filePath, error: `Cannot read: ${err.code}` }];
    }

    if (!content.includes('<style')) return [];

    const issues = [];
    const stylePattern = /<style[^>]*>([\s\S]*?)<\/style>/gi;
    let styleMatch;

    while ((styleMatch = stylePattern.exec(content)) !== null) {
        const styleContent = styleMatch[1];
        const styleStartPos = styleMatch.index;

        // Reset the regex lastIndex for each style block
        const ruleRegex = new RegExp(CODE_SELECTOR_PATTERN.source, 'g');
        let ruleMatch;

        while ((ruleMatch = ruleRegex.exec(styleContent)) !== null) {
            const selector = ruleMatch[1];
            const ruleBody = ruleMatch[3];

            // Must have monospace font to be relevant
            const hasMonospace = /font-family\s*:.*monospace/i.test(ruleBody);
            if (!hasMonospace) continue;

            // Already has white-space: pre or pre-wrap? Skip.
            const hasWhiteSpace = /white-space\s*:\s*pre(?:-wrap)?/i.test(ruleBody);
            if (hasWhiteSpace) continue;

            const line = getLineNumber(content, styleStartPos + ruleMatch.index);

            issues.push({
                code: 'HEUR-007',
                severity: 'medium',
                file: filePath,
                line,
                selector,
                message: `${selector} uses monospace font but missing white-space: pre-wrap`
            });
        }
    }

    return issues;
}

/**
 * Fix HEUR-007 violations in a single file.
 *
 * For each CSS rule matching code-block selectors that has monospace
 * font-family but no white-space property, inject `white-space: pre-wrap;`
 * immediately after the font-family declaration.
 */
function fixFile(filePath, dryRun) {
    if (typeof dryRun === 'undefined') dryRun = true;

    let content;
    try {
        content = fs.readFileSync(filePath, 'utf8');
    } catch (err) {
        return { filePath, error: `Cannot read: ${err.code}`, fixCount: 0, changed: false };
    }

    if (!content.includes('<style')) {
        return { filePath, fixCount: 0, changed: false };
    }

    const issuesBefore = scanFile(filePath).length;
    if (issuesBefore === 0) {
        return { filePath, issuesBefore: 0, issuesAfter: 0, fixCount: 0, changed: false };
    }

    let fixCount = 0;

    // Process each <style> block
    const stylePattern = /<style[^>]*>([\s\S]*?)<\/style>/gi;
    let result = content;
    let offset = 0;

    // We need to replace inside style blocks. Collect all replacements first.
    const replacements = [];

    let styleMatch;
    while ((styleMatch = stylePattern.exec(content)) !== null) {
        const styleContent = styleMatch[1];
        const styleStart = styleMatch.index + styleMatch[0].indexOf(styleContent);

        const ruleRegex = new RegExp(CODE_SELECTOR_PATTERN.source, 'g');
        let ruleMatch;

        while ((ruleMatch = ruleRegex.exec(styleContent)) !== null) {
            const selector = ruleMatch[1];
            const ruleBody = ruleMatch[3];

            const hasMonospace = /font-family\s*:.*monospace/i.test(ruleBody);
            if (!hasMonospace) continue;

            const hasWhiteSpace = /white-space\s*:\s*pre(?:-wrap)?/i.test(ruleBody);
            if (hasWhiteSpace) continue;

            // Find the font-family declaration to insert after it
            const fontMatch = ruleBody.match(/font-family\s*:[^;]+;/i);
            if (!fontMatch) continue;

            const fontDeclEnd = styleStart + ruleMatch.index + ruleMatch[0].indexOf(ruleBody) + fontMatch.index + fontMatch[0].length;

            replacements.push({
                position: fontDeclEnd,
                insert: ' white-space: pre-wrap;',
                selector
            });
        }
    }

    if (replacements.length === 0) {
        return { filePath, issuesBefore, issuesAfter: issuesBefore, fixCount: 0, changed: false };
    }

    // Apply replacements from end to start so positions stay valid
    replacements.sort((a, b) => b.position - a.position);
    for (const rep of replacements) {
        result = result.substring(0, rep.position) + rep.insert + result.substring(rep.position);
        fixCount++;
    }

    // Verify fix
    let issuesAfter = 0;
    if (!dryRun && fixCount > 0) {
        fs.writeFileSync(filePath, result, 'utf8');
    }

    // Re-scan to verify (use the modified content)
    const tempCheck = result;
    const checkStylePattern = /<style[^>]*>([\s\S]*?)<\/style>/gi;
    let checkMatch;
    while ((checkMatch = checkStylePattern.exec(tempCheck)) !== null) {
        const checkContent = checkMatch[1];
        const checkRuleRegex = new RegExp(CODE_SELECTOR_PATTERN.source, 'g');
        let checkRule;
        while ((checkRule = checkRuleRegex.exec(checkContent)) !== null) {
            const body = checkRule[3];
            if (/font-family\s*:.*monospace/i.test(body) && !/white-space\s*:\s*pre(?:-wrap)?/i.test(body)) {
                issuesAfter++;
            }
        }
    }

    return {
        filePath,
        issuesBefore,
        issuesAfter,
        fixCount,
        changed: fixCount > 0
    };
}

/**
 * Batch scan a directory tree.
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

function generateReport(scanResult) {
    const lines = [];
    lines.push('='.repeat(60));
    lines.push('  HEUR-007 Code Block White-Space Report');
    lines.push('='.repeat(60));
    lines.push('');
    lines.push(`Directory:         ${scanResult.directory}`);
    lines.push(`Files scanned:     ${scanResult.files}`);
    lines.push(`Files with issues: ${scanResult.filesWithIssues}`);
    lines.push(`Total violations:  ${scanResult.totalIssues}`);
    lines.push('');

    if (scanResult.totalIssues === 0) {
        lines.push('No HEUR-007 violations found.');
        return lines.join('\n');
    }

    // Group by file
    const byFile = {};
    for (const issue of scanResult.issues) {
        if (!byFile[issue.file]) byFile[issue.file] = [];
        byFile[issue.file].push(issue);
    }

    // Breakdown by selector
    const selectors = {};
    for (const issue of scanResult.issues) {
        const s = issue.selector || 'unknown';
        selectors[s] = (selectors[s] || 0) + 1;
    }

    lines.push('-'.repeat(60));
    lines.push('  Selector Breakdown');
    lines.push('-'.repeat(60));
    const sorted = Object.entries(selectors).sort((a, b) => b[1] - a[1]);
    for (const [sel, count] of sorted) {
        lines.push(`  ${sel.padEnd(30)} ${count}`);
    }
    lines.push('');

    lines.push('-'.repeat(60));
    lines.push(`  Files with Violations (${scanResult.filesWithIssues})`);
    lines.push('-'.repeat(60));
    const fileEntries = Object.entries(byFile).sort((a, b) => b[1].length - a[1].length);
    for (const [file, issues] of fileEntries.slice(0, 30)) {
        const relPath = path.relative(process.cwd(), file);
        lines.push(`  ${relPath} (${issues.length})`);
    }
    if (fileEntries.length > 30) {
        lines.push(`  ... and ${fileEntries.length - 30} more files`);
    }

    return lines.join('\n');
}

// --- CLI ---

function main() {
    const args = process.argv.slice(2);
    const flags = {
        fix: args.includes('--fix'),
        json: args.includes('--json'),
        help: args.includes('--help') || args.includes('-h'),
        file: null,
        directory: null
    };

    const fileIdx = args.indexOf('--file');
    if (fileIdx !== -1 && args[fileIdx + 1]) {
        flags.file = path.resolve(args[fileIdx + 1]);
    }

    for (const arg of args) {
        if (!arg.startsWith('--') && !arg.startsWith('-')) {
            if (!flags.file) {
                flags.directory = path.resolve(arg);
            }
            break;
        }
    }

    if (flags.help) {
        console.log('HEUR-007 Code Block White-Space Fix Tool');
        console.log('');
        console.log('Usage:');
        console.log('  node heur-007-whitespace-fix.js [directory]          Scan (dry-run)');
        console.log('  node heur-007-whitespace-fix.js [directory] --fix    Scan and fix');
        console.log('  node heur-007-whitespace-fix.js [directory] --json   JSON report');
        console.log('  node heur-007-whitespace-fix.js --file <path>        Single file');
        console.log('  node heur-007-whitespace-fix.js --file <path> --fix  Single file fix');
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
                    console.log(`  ${result.fixCount} rule(s) patched`);
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

    console.log(`HEUR-007 Code Block White-Space ${flags.fix ? 'Fix' : 'Scan'}`);
    console.log(`Target: ${dir}`);
    console.log(`Mode: ${flags.fix ? 'LIVE FIX' : 'DRY RUN (use --fix to apply)'}`);
    console.log('');

    if (flags.fix) {
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
                console.log(`  FIXED: ${rel} (${result.fixCount} rules, ${result.issuesBefore} -> ${result.issuesAfter} issues)`);
            }
        }

        console.log('');
        console.log('-'.repeat(60));
        console.log(`Files scanned:    ${files.length}`);
        console.log(`Files fixed:      ${totalFixed}`);
        console.log(`Rules patched:    ${totalFixCount}`);

        if (flags.json) {
            const jsonPath = path.join(process.cwd(), 'heur-007-fix-report.json');
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
        const scanResult = batchScan(dir);
        const report = generateReport(scanResult);
        console.log(report);

        if (flags.json) {
            const jsonPath = path.join(process.cwd(), 'heur-007-scan-report.json');
            fs.writeFileSync(jsonPath, JSON.stringify({
                timestamp: new Date().toISOString(),
                ...scanResult,
                issues: scanResult.issues.map(i => ({
                    file: path.relative(process.cwd(), i.file),
                    line: i.line,
                    selector: i.selector,
                    message: i.message
                }))
            }, null, 2));
            console.log(`\nJSON report: ${jsonPath}`);
        }
    }
}

// --- Exports ---

module.exports = { scanFile, fixFile, batchScan, generateReport };

if (require.main === module) {
    main();
}
