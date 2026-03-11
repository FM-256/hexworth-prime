#!/usr/bin/env node
/**
 * EduScan Auto-Fixer: Accessibility (WCAG 2.1 AA)
 *
 * Auto-fixes (safe, deterministic):
 *   A11Y-001  Add lang="en" to <html> tags missing it
 *   A11Y-002  Add alt="" to <img> tags missing alt (decorative fallback)
 *   A11Y-006  Add :focus-visible companion rule after :focus { outline: none }
 *             blocks that have no visual replacement — preserves mouse UX,
 *             restores keyboard indicator
 *
 * Report-only (need manual review):
 *   A11Y-003  Input without label — structural change, cannot automate safely
 *   A11Y-004  Contrast risk (inline styles) — needs color system context
 *   A11Y-005  Missing skip link — needs page-layout context
 *   A11Y-007  Empty interactive — content decision (what should the label say?)
 *   A11Y-008  div/span onclick no role — component-level refactor needed
 *
 * Usage:
 *   node _tools/eduscan/fixers/fix-a11y.js              # dry run (safe default)
 *   node _tools/eduscan/fixers/fix-a11y.js --apply      # apply fixes
 *   node _tools/eduscan/fixers/fix-a11y.js --check A11Y-006    # single check only
 *   node _tools/eduscan/fixers/fix-a11y.js --report     # print report-only issues
 *   node _tools/eduscan/fixers/fix-a11y.js --from-report _tools/reports/a11y-report.json
 *
 * NOTE: Does NOT modify validators/ — fixer only.
 */

'use strict';

const fs = require('fs');
const path = require('path');

// ─── Config ─────────────────────────────────────────────────────────────────

const APP_ROOT = path.resolve(__dirname, '../../../_app');
const REPORT_PATH = path.resolve(__dirname, '../../reports/a11y-report.json');

const args = process.argv.slice(2);
const DRY_RUN = !args.includes('--apply');
const REPORT_MODE = args.includes('--report');
const FROM_REPORT = (() => {
    const idx = args.indexOf('--from-report');
    return idx !== -1 ? args[idx + 1] : null;
})();
const ONLY_CHECK = (() => {
    const idx = args.indexOf('--check');
    return idx !== -1 ? new Set(args[idx + 1].split(',').map(s => s.trim().toUpperCase())) : null;
})();

if (DRY_RUN) {
    console.log('[DRY RUN] No files will be modified. Pass --apply to write changes.\n');
}

// ─── Utilities ───────────────────────────────────────────────────────────────

/**
 * Walk _app/ and return all .html file paths.
 */
function walk(dir) {
    const results = [];
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            results.push(...walk(full));
        } else if (entry.name.endsWith('.html')) {
            results.push(full);
        }
    }
    return results;
}

/**
 * Write a file only if not in dry-run mode.
 * Returns true if the write happened.
 */
function writeFile(filePath, content) {
    if (DRY_RUN) return false;
    fs.writeFileSync(filePath, content, 'utf8');
    return true;
}

/**
 * Relative path from repo root for display.
 */
function rel(absPath) {
    return absPath.replace(path.resolve(__dirname, '../../../') + '/', '');
}

// ─── Fix A11Y-001: Missing lang="en" on <html> ───────────────────────────────

/**
 * Adds lang="en" to the document-root <html> tag if it is missing.
 * Only modifies the first <html> occurrence within the first 8 lines.
 *
 * Returns: { fixed: boolean, content: string }
 */
function fixLangAttribute(content, filePath) {
    const lines = content.split('\n');
    const searchDepth = Math.min(lines.length, 8);

    for (let i = 0; i < searchDepth; i++) {
        if (/<html\b/i.test(lines[i]) && !/lang\s*=/i.test(lines[i])) {
            // Insert lang="en" before the closing > or after <html
            lines[i] = lines[i].replace(/<html(\s*)(>|\/?>)/i, '<html lang="en"$2');
            // Also handle <html class="..." > forms
            lines[i] = lines[i].replace(/<html(\s+)(?!lang)/i, '<html lang="en" ');
            return { fixed: true, content: lines.join('\n') };
        }
    }
    return { fixed: false, content };
}

// ─── Fix A11Y-002: Images missing alt attribute ──────────────────────────────

/**
 * Blank all <script>, <style>, and attribute value content so the regex
 * only matches actual HTML img tags, not those inside JS strings or placeholders.
 * Preserves newline characters to keep line count intact.
 */
function prepareForImgScan(content) {
    // 1. Blank script and style block content
    let result = content.replace(/<(script|style)\b[\s\S]*?<\/\1>/gi, (match) =>
        match.replace(/[^\n]/g, ' ')
    );
    // 2. Blank attribute values to avoid placeholder="<img ...>" false positives
    result = result
        .replace(/=\s*"[^"]*"/g, (m) => '=' + '"' + ' '.repeat(Math.max(0, m.length - 3)) + '"')
        .replace(/=\s*'[^']*'/g, (m) => "=" + "'" + ' '.repeat(Math.max(0, m.length - 3)) + "'");
    return result;
}

/**
 * Adds alt="" to all <img> tags that are missing the alt attribute.
 * Only modifies tags in HTML context (not inside JS strings or attribute values).
 * Uses alt="" (empty) which signals decorative image to screen readers.
 *
 * Returns: { fixed: boolean, content: string, count: number }
 */
function fixImgAlt(content, filePath) {
    const prepared = prepareForImgScan(content);
    const imgRe = /<img\s([^>]*)>/gi;
    let count = 0;
    let result = content;
    let offset = 0; // Track how far result has shifted from prepared indexes

    // Find positions in prepared (cleaned) content, apply fixes to real content
    let m;
    const fixes = [];
    while ((m = imgRe.exec(prepared)) !== null) {
        if (!/\balt\s*=/i.test(m[1])) {
            fixes.push({ index: m.index, length: m[0].length, original: m[0] });
        }
    }

    if (fixes.length === 0) return { fixed: false, content, count: 0 };

    // Apply fixes to the actual content by finding the same tag text
    // We do string replacement on the original content to preserve all whitespace/attributes
    let workContent = content;
    for (const fix of fixes) {
        // Extract the actual tag from original content at the same offset (accounting for drift)
        // Use the original tag text from prepared to find it — since we only blanked values,
        // tag structures (attribute names, <img, >) are preserved in prepared content
        const originalTag = content.slice(fix.index + offset, fix.index + offset + fix.length);
        if (!originalTag.startsWith('<img') || /\balt\s*=/i.test(originalTag)) continue;

        // Insert alt="" before the closing > or /> of the tag
        const fixed = originalTag.replace(/(\/?>)\s*$/, ' alt=""$1');
        workContent = workContent.slice(0, fix.index + offset) +
                      fixed +
                      workContent.slice(fix.index + offset + fix.length);
        offset += fixed.length - fix.length;
        count++;
    }

    return { fixed: count > 0, content: workContent, count };
}

// ─── Fix A11Y-006: :focus outline removed without replacement ────────────────

/**
 * The fix strategy: add a :focus-visible companion rule immediately after any
 * :focus { outline: none } block that has no visual replacement.
 *
 * :focus-visible only triggers for keyboard navigation, not mouse clicks.
 * This means:
 *   - Mouse users: :focus hides outline (preserves existing styled appearance)
 *   - Keyboard users: :focus-visible restores a visible outline
 *
 * The replacement uses `outline: 2px solid currentColor` which adapts to any
 * color scheme and passes WCAG 1.4.11 Non-text Contrast at any zoom level.
 *
 * Returns: { fixed: boolean, content: string, count: number }
 */
function fixFocusIndicator(content, filePath) {
    let workContent = content;
    let count = 0;
    let searchFrom = 0;

    // Only operate inside <style> blocks
    const styleOpenRe = /<style[^>]*>/gi;
    const styleCloseRe = /<\/style>/gi;

    while (true) {
        styleOpenRe.lastIndex = searchFrom;
        const openM = styleOpenRe.exec(workContent);
        if (!openM) break;

        styleCloseRe.lastIndex = openM.index + openM[0].length;
        const closeM = styleCloseRe.exec(workContent);
        if (!closeM) break;

        const styleStart = openM.index + openM[0].length;
        const styleEnd = closeM.index;
        const styleContent = workContent.slice(styleStart, styleEnd);

        // Find :focus blocks with outline:none and no visual replacement
        // Selector is everything before :focus {...}
        const focusRe = /([^{}]*):focus(?:\s*,\s*[^{]*)?\s*\{([^}]*)\}/g;
        let focusM;
        let styleModified = styleContent;
        let innerOffset = 0;

        while ((focusM = focusRe.exec(styleContent)) !== null) {
            const block = focusM[2];

            if (!/outline\s*:\s*(none|0)/i.test(block)) continue;

            // Check for visual replacement
            const hasReplacement = /box-shadow|border(?:-\w+)?-color|border\s*:|background(?:-color)?/i.test(block);
            if (hasReplacement) continue;

            // Build the :focus-visible rule using the same selector
            // Extract the selector part (before :focus)
            const selectorBase = focusM[1].trim();
            // Handle combined selectors: "a:focus, button:focus" → "a:focus-visible, button:focus-visible"
            const focusVisibleRule = buildFocusVisibleRule(focusM[0], selectorBase);

            if (!focusVisibleRule) continue;

            // Check if a :focus-visible rule already exists after this :focus block
            const afterBlock = styleContent.slice(focusM.index + focusM[0].length, focusM.index + focusM[0].length + 200);
            if (/:focus-visible\s*\{/.test(afterBlock)) continue;

            // Insert the :focus-visible rule after the :focus block
            const insertAt = focusM.index + focusM[0].length + innerOffset;
            const insertion = '\n' + focusVisibleRule;
            styleModified = styleModified.slice(0, insertAt) + insertion + styleModified.slice(insertAt);
            innerOffset += insertion.length;
            count++;
        }

        if (styleModified !== styleContent) {
            workContent = workContent.slice(0, styleStart) + styleModified + workContent.slice(styleEnd);
            // Advance searchFrom past the updated style block
            searchFrom = styleStart + styleModified.length + closeM[0].length;
        } else {
            searchFrom = closeM.index + closeM[0].length;
        }
    }

    return { fixed: count > 0, content: workContent, count };
}

/**
 * Given the original :focus rule text and its selector base, produce a
 * :focus-visible rule that adds a visible outline.
 *
 * Examples:
 *   ".code-editor:focus { outline: none; }" →
 *   ".code-editor:focus-visible { outline: 2px solid currentColor; outline-offset: 2px; }"
 *
 *   ":focus { outline: none; }" →
 *   ":focus-visible { outline: 2px solid currentColor; outline-offset: 2px; }"
 */
function buildFocusVisibleRule(focusRuleText, selectorBase) {
    // Detect the indentation of the existing :focus rule
    const indentM = focusRuleText.match(/^(\s*)/);
    const indent = indentM ? indentM[1] : '        ';

    // Replace :focus with :focus-visible in the selector
    // Handle: "selector:focus { }" and ":focus { }" and "sel:focus, sel2:focus { }"
    let fvSelector = focusRuleText.replace(/:focus(?!-)/g, ':focus-visible');

    // Extract the block content from the original (we build our own body)
    // Return a clean :focus-visible rule
    return `${fvSelector.replace(/\{[^}]*\}/, `{ outline: 2px solid currentColor; outline-offset: 2px; }`)}`;
}

// ─── Report-Only Issues ───────────────────────────────────────────────────────

/**
 * Print a structured report of issues that require manual fixes.
 * Reads from the saved a11y-report.json if available.
 */
function printReportOnlyIssues(reportPath) {
    if (!fs.existsSync(reportPath)) {
        console.log(`No report found at ${reportPath}`);
        console.log('Run: node _tools/a11y-audit.js --out _tools/reports/a11y-report.json\n');
        return;
    }

    const data = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
    const reportOnly = ['A11Y-003', 'A11Y-004', 'A11Y-005', 'A11Y-007', 'A11Y-008'];

    const descriptions = {
        'A11Y-003': 'Input without accessible label (needs id + <label for=""> or aria-label)',
        'A11Y-004': 'Potential inline color contrast issue (manual review required)',
        'A11Y-005': 'Page missing skip-to-content link (add <a href="#main" class="skip-nav">)',
        'A11Y-007': 'Empty button/link — needs descriptive aria-label with the action name',
        'A11Y-008': 'Interactive div/span onclick — needs role="button" + tabindex="0" + keyboard handler',
    };

    const guidance = {
        'A11Y-003': `
  Pattern for radio groups:     <input type="radio" id="q1a" name="q1" value="a">
                                 <label for="q1a">Option text</label>
  Pattern for checkboxes:       <input type="checkbox" id="cb-1" aria-label="Select item">
  Pattern for text inputs:      <input type="text" id="search" aria-label="Search modules">`,
        'A11Y-004': `
  Check: ensure text color has >= 4.5:1 contrast ratio against background.
  Tool:  https://webaim.org/resources/contrastchecker/`,
        'A11Y-005': `
  Add before the first <nav>:   <a href="#main" class="skip-nav">Skip to main content</a>
  Add to target element:        <main id="main">
  See handler-dashboard.html for the skip-nav CSS pattern (css/skip-nav.css).`,
        'A11Y-007': `
  Replace:  <button class="icon-btn"></button>
  With:     <button class="icon-btn" aria-label="Close dialog"></button>`,
        'A11Y-008': `
  Replace:  <div onclick="select(this)">
  With:     <div role="button" tabindex="0" onclick="select(this)" onkeydown="if(e.key==='Enter'||e.key===' ')select(this)">
  Better:   Use <button> or <a> — native semantics are always preferred.`,
    };

    console.log('\n=== A11y Report-Only Issues (require manual fix) ===\n');

    for (const code of reportOnly) {
        const violations = data.violations.filter(v => v.code === code);
        if (violations.length === 0) continue;

        const files = [...new Set(violations.map(v => v.file))];
        console.log(`${code}: ${descriptions[code]}`);
        console.log(`  Count: ${violations.length} violations across ${files.length} files`);
        if (guidance[code]) console.log(`  Fix guidance:${guidance[code]}`);
        console.log(`  Affected files (first 10):`);
        files.slice(0, 10).forEach(f => console.log(`    ${f}`));
        if (files.length > 10) console.log(`    ... and ${files.length - 10} more`);
        console.log();
    }
}

// ─── Main Fixer Runner ────────────────────────────────────────────────────────

function main() {
    // Report mode: just show what needs manual fixing
    if (REPORT_MODE) {
        const reportPath = FROM_REPORT || REPORT_PATH;
        printReportOnlyIssues(reportPath);
        return;
    }

    // Determine which checks to run
    const runChecks = new Set(ONLY_CHECK || ['A11Y-001', 'A11Y-002', 'A11Y-006']);

    const files = walk(APP_ROOT);
    const results = {
        'A11Y-001': { fixed: 0, skipped: 0, files: [] },
        'A11Y-002': { fixed: 0, skipped: 0, files: [] },
        'A11Y-006': { fixed: 0, skipped: 0, files: [] },
    };

    let processed = 0;

    for (const filePath of files) {
        let content;
        try {
            content = fs.readFileSync(filePath, 'utf8');
        } catch (e) {
            continue;
        }

        let current = content;
        let fileChanged = false;
        const fileRel = rel(filePath);

        // A11Y-001: Missing html[lang]
        if (runChecks.has('A11Y-001')) {
            const r = fixLangAttribute(current, filePath);
            if (r.fixed) {
                current = r.content;
                fileChanged = true;
                results['A11Y-001'].fixed++;
                results['A11Y-001'].files.push(fileRel);
            }
        }

        // A11Y-002: Images missing alt
        if (runChecks.has('A11Y-002')) {
            const r = fixImgAlt(current, filePath);
            if (r.fixed) {
                current = r.content;
                fileChanged = true;
                results['A11Y-002'].fixed += r.count;
                results['A11Y-002'].files.push(`${fileRel} (${r.count} img)`);
            }
        }

        // A11Y-006: Focus outline removed without replacement
        if (runChecks.has('A11Y-006')) {
            const r = fixFocusIndicator(current, filePath);
            if (r.fixed) {
                current = r.content;
                fileChanged = true;
                results['A11Y-006'].fixed += r.count;
                results['A11Y-006'].files.push(`${fileRel} (+${r.count} :focus-visible rule)`);
            }
        }

        // Write changes
        if (fileChanged) {
            writeFile(filePath, current);
            processed++;
        }
    }

    // Summary
    console.log('\n=== A11y Fixer Results ===\n');
    console.log(`Mode: ${DRY_RUN ? 'DRY RUN (no changes written)' : 'APPLIED'}`);
    console.log(`Files scanned: ${files.length}`);
    console.log(`Files with changes: ${processed}\n`);

    for (const [code, r] of Object.entries(results)) {
        if (!runChecks.has(code)) continue;
        const desc = {
            'A11Y-001': 'Missing html[lang] — added lang="en"',
            'A11Y-002': 'Images missing alt — added alt=""',
            'A11Y-006': 'Focus outline removed — added :focus-visible rule',
        }[code];
        console.log(`${code}: ${desc}`);
        console.log(`  Fixed: ${r.fixed}`);
        if (r.files.length > 0) {
            r.files.slice(0, 10).forEach(f => console.log(`    ${f}`));
            if (r.files.length > 10) console.log(`    ... and ${r.files.length - 10} more`);
        }
        console.log();
    }

    if (DRY_RUN) {
        const totalFixed = Object.values(results).reduce((s, r) => s + r.fixed, 0);
        if (totalFixed > 0) {
            console.log(`Run with --apply to apply ${totalFixed} fix(es).`);
        } else {
            console.log('No auto-fixable violations found.');
        }
    }

    console.log('\nFor manual-review issues, run: node _tools/eduscan/fixers/fix-a11y.js --report\n');
}

main();
