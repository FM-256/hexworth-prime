#!/usr/bin/env node
/**
 * Hexworth Prime — Accessibility Audit Script
 * WCAG 2.1 AA violation scanner for all HTML files in _app/
 *
 * Checks:
 *   A11Y-001  Missing lang attribute on <html> tag
 *   A11Y-002  Images without alt attributes (in HTML context, not JS strings)
 *   A11Y-003  Form inputs without associated labels (no id, aria-label, or aria-labelledby)
 *   A11Y-004  Color contrast risk — inline styles with likely low-contrast combinations
 *   A11Y-005  Missing skip-to-content links (pages with nav + main content)
 *   A11Y-006  Focus indicator removed — :focus { outline: none } without a visual replacement
 *   A11Y-007  Empty interactive elements — buttons/links with no accessible name
 *   A11Y-008  Interactive elements lacking ARIA roles (divs/spans with click handlers)
 *
 * Severity levels:
 *   critical  — WCAG 2.1 AA failure, likely to block assistive tech users
 *   high      — WCAG 2.1 AA failure, significant accessibility barrier
 *   medium    — WCAG 2.1 AA advisory, may cause issues for some users
 *   low       — WCAG 2.1 AA best-practice, minor barrier
 *
 * Usage:
 *   node _tools/a11y-audit.js                    # scan, print summary
 *   node _tools/a11y-audit.js --json             # print full JSON report
 *   node _tools/a11y-audit.js --out report.json  # write JSON to file
 *   node _tools/a11y-audit.js --severity critical,high  # filter by severity
 *   node _tools/a11y-audit.js --limit 50         # cap results per check
 */

'use strict';

const fs = require('fs');
const path = require('path');

// ─── Config ─────────────────────────────────────────────────────────────────

const APP_ROOT = path.resolve(__dirname, '../_app');
const REPORT_DIR = path.resolve(__dirname, 'reports');
const NOW = new Date().toISOString();

const args = process.argv.slice(2);
const FLAG_JSON = args.includes('--json');
const FLAG_SEVERITY = (() => {
    const idx = args.indexOf('--severity');
    if (idx === -1) return null;
    return new Set(args[idx + 1].split(',').map(s => s.trim().toLowerCase()));
})();
const FLAG_OUT = (() => {
    const idx = args.indexOf('--out');
    if (idx === -1) return null;
    return args[idx + 1];
})();
const FLAG_LIMIT = (() => {
    const idx = args.indexOf('--limit');
    if (idx === -1) return 0;
    return parseInt(args[idx + 1], 10) || 0;
})();

// ─── Utilities ───────────────────────────────────────────────────────────────

/**
 * Walk a directory recursively, returning all .html file paths.
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
 * Return the relative path from the repo root for cleaner output.
 */
function rel(absPath) {
    return absPath.replace(path.resolve(__dirname, '..') + '/', '');
}

/**
 * Build a map of line-start byte offsets for a file content string.
 * Used to convert string index → line number.
 */
function buildLineMap(content) {
    const map = [0]; // line 1 starts at index 0
    for (let i = 0; i < content.length; i++) {
        if (content[i] === '\n') map.push(i + 1);
    }
    return map;
}

/**
 * Convert a character index to a 1-based line number using the pre-built line map.
 */
function indexToLine(lineMap, index) {
    let lo = 0;
    let hi = lineMap.length - 1;
    while (lo < hi) {
        const mid = Math.ceil((lo + hi) / 2);
        if (lineMap[mid] <= index) lo = mid;
        else hi = mid - 1;
    }
    return lo + 1;
}

/**
 * Strip all <script> and <style> block content, replacing with whitespace of
 * the same length so that character offsets (and therefore line numbers) remain valid.
 * Used for HTML-context checks that must exclude JS strings.
 */
function blankScriptsAndStyles(content) {
    return content.replace(/<(script|style)\b[\s\S]*?<\/\1>/gi, (match) => {
        // Preserve newlines so line numbers stay accurate; blank out other chars
        return match.replace(/[^\n]/g, ' ');
    });
}

/**
 * Blank out all HTML attribute values (content inside quotes after attr=) except
 * tag names and attribute names. Used to prevent false positives where an attribute
 * value such as placeholder="<img src=x>" contains HTML-like content.
 * Preserves newlines to keep line number accuracy.
 */
function blankAttributeValues(content) {
    // Match attr="value" or attr='value' patterns — blank the value portion only
    return content.replace(/=\s*"[^"]*"/g, (m) => '=' + '"' + ' '.repeat(m.length - 3) + '"')
                  .replace(/=\s*'[^']*'/g, (m) => "=" + "'" + ' '.repeat(m.length - 3) + "'");
}

/**
 * Collect all <script> and <style> block ranges so checks can skip them.
 */
function getScriptStyleRanges(content) {
    const ranges = [];
    const re = /<(script|style)\b[\s\S]*?<\/\1>/gi;
    let m;
    while ((m = re.exec(content)) !== null) {
        ranges.push([m.index, m.index + m[0].length]);
    }
    return ranges;
}

/**
 * Check if a character offset falls inside a script/style block.
 */
function inScriptOrStyle(ranges, index) {
    for (const [start, end] of ranges) {
        if (index >= start && index < end) return true;
    }
    return false;
}

/**
 * Build a violation record.
 * Context is sanitized — control characters stripped — so JSON serialization is clean.
 */
function violation(code, severity, filePath, lineNumber, message, context = '') {
    // Sanitize context: remove control characters that would break JSON serialization
    const safeContext = context.replace(/[\x00-\x1F\x7F]/g, ' ').slice(0, 200);
    return { code, severity, file: rel(filePath), line: lineNumber, message, context: safeContext };
}

// ─── Check Implementations ───────────────────────────────────────────────────

/**
 * A11Y-001: Missing lang attribute on the <html> tag.
 * Only checks the actual document-root <html> tag (in the first 5 lines).
 * Severity: critical — screen readers use lang to select speech synthesizer.
 */
function checkLangAttribute(content, filePath, lineMap) {
    const violations = [];
    const lines = content.split('\n');
    const searchDepth = Math.min(lines.length, 8);
    for (let i = 0; i < searchDepth; i++) {
        const line = lines[i];
        if (/<html\b/i.test(line)) {
            if (!/lang\s*=/i.test(line)) {
                violations.push(violation(
                    'A11Y-001', 'critical', filePath, i + 1,
                    'Missing lang attribute on <html> tag',
                    line.trim().slice(0, 120)
                ));
            }
            break; // Only check the first <html> tag
        }
    }
    return violations;
}

/**
 * A11Y-002: Images without alt attributes (HTML context only, not JS strings).
 * Decorative images should use alt="" — omitting alt entirely is always wrong.
 * Severity: high — images with no alt are invisible to screen readers.
 */
function checkImgAlt(content, filePath, lineMap) {
    const violations = [];
    // Blank scripts, styles, AND attribute values to avoid false positives where
    // placeholder="<img src=x>" gets detected as a real img tag.
    const htmlContent = blankAttributeValues(blankScriptsAndStyles(content));
    const re = /<img\s([^>]*)>/gi;
    let m;
    while ((m = re.exec(htmlContent)) !== null) {
        const attrs = m[1];
        if (!/\balt\s*=/i.test(attrs)) {
            const lineNum = indexToLine(lineMap, m.index);
            // Extract src for context
            const srcM = attrs.match(/src\s*=\s*["']([^"']*)["']/i);
            const src = srcM ? srcM[1] : '(no src)';
            violations.push(violation(
                'A11Y-002', 'high', filePath, lineNum,
                'Image missing alt attribute',
                `src="${src.slice(0, 80)}"`
            ));
        }
    }
    return violations;
}

/**
 * A11Y-003: Form inputs without accessible labels.
 * An input is considered accessible if it has any of: id (for label[for]),
 * aria-label, aria-labelledby, or is type hidden/submit/button/reset/image.
 * Note: placeholder is NOT a label substitute per WCAG 1.3.1.
 * Severity: high — unlabelled inputs are unusable for screen reader users.
 */
function checkInputLabels(content, filePath, lineMap) {
    const violations = [];
    const htmlContent = blankScriptsAndStyles(content);
    const re = /<input([^>]*)>/gi;
    const skipTypes = new Set(['hidden', 'submit', 'button', 'reset', 'image']);
    let m;
    while ((m = re.exec(htmlContent)) !== null) {
        const attrs = m[1];
        const typeM = attrs.match(/\btype\s*=\s*["']([^"']*)["']/i);
        const itype = typeM ? typeM[1].toLowerCase() : 'text';
        if (skipTypes.has(itype)) continue;

        const hasId = /\bid\s*=/i.test(attrs);
        const hasAriaLabel = /\baria-label\s*=/i.test(attrs);
        const hasAriaLabelledby = /\baria-labelledby\s*=/i.test(attrs);

        if (!hasId && !hasAriaLabel && !hasAriaLabelledby) {
            const lineNum = indexToLine(lineMap, m.index);
            const nameM = attrs.match(/\bname\s*=\s*["']([^"']*)["']/i);
            const ctx = nameM ? `name="${nameM[1]}" type="${itype}"` : `type="${itype}"`;
            violations.push(violation(
                'A11Y-003', 'high', filePath, lineNum,
                'Input has no id, aria-label, or aria-labelledby — cannot be associated with a label',
                ctx
            ));
        }
    }
    return violations;
}

/**
 * A11Y-004: Inline style color contrast risk.
 * Detects inline styles combining colors that are likely to produce
 * low contrast (e.g., white-on-white, grey-on-grey, light-on-light).
 * This is heuristic — full contrast ratio calculation is out of scope for static analysis.
 * Severity: medium — manual review required; tool flags suspicious combinations.
 */
function checkInlineContrast(content, filePath, lineMap) {
    const violations = [];
    const htmlContent = blankScriptsAndStyles(content);

    // Light colors that risk low contrast on light backgrounds
    const lightColors = /(?:#(?:fff|ffffff|f[0-9a-f]{5}|e[0-9a-f]{5})|(?:white|ivory|lightyellow|lightcyan|lightgray|lightgrey|snow|ghostwhite|floralwhite|whitesmoke|linen|seashell|cornsilk|mintcream|honeydew|azure|aliceblue|lavender))/i;
    // Dark colors that risk low contrast on dark backgrounds
    const darkColors = /(?:#(?:000|000000|0[0-3][0-9a-f]{4}|1[0-9a-f]{5})|(?:black|darkblue|darkgreen|darkred|maroon|navy|darkolivegreen))/i;

    const styleRe = /style\s*=\s*["']([^"']*)["']/gi;
    let m;
    while ((m = styleRe.exec(htmlContent)) !== null) {
        const styleVal = m[1];
        // Check for both color and background-color in the same inline style
        const hasColor = /\bcolor\s*:/i.test(styleVal);
        const hasBg = /\bbackground(?:-color)?\s*:/i.test(styleVal);
        if (!hasColor || !hasBg) continue;

        const colorM = styleVal.match(/\bcolor\s*:\s*([^;]+)/i);
        const bgM = styleVal.match(/\bbackground(?:-color)?\s*:\s*([^;]+)/i);
        const colorVal = colorM ? colorM[1].trim() : '';
        const bgVal = bgM ? bgM[1].trim() : '';

        // Flag if both are light or both contain 'light' palette hints
        const colorIsLight = lightColors.test(colorVal);
        const bgIsLight = lightColors.test(bgVal);
        const colorIsDark = darkColors.test(colorVal);
        const bgIsDark = darkColors.test(bgVal);

        if ((colorIsLight && bgIsLight) || (colorIsDark && bgIsDark)) {
            const lineNum = indexToLine(lineMap, m.index);
            violations.push(violation(
                'A11Y-004', 'medium', filePath, lineNum,
                'Potential low-contrast inline style — manual review required',
                `color: ${colorVal.slice(0, 40)} | background: ${bgVal.slice(0, 40)}`
            ));
        }
    }
    return violations;
}

/**
 * A11Y-005: Missing skip-to-content link.
 * Pages that have a <nav> or substantial navigation AND a <main> should
 * provide a skip link so keyboard users can bypass repeated navigation.
 * Only flags top-level pages (index.html, dashboard.html) and house index pages.
 * Severity: medium — keyboard users must tab through entire nav on each page.
 */
function checkSkipLink(content, filePath, lineMap) {
    const violations = [];

    // Only check files that are likely "page shells" with primary navigation
    const base = path.basename(filePath);
    const isIndexOrDash = /^(index|dashboard|handler-dashboard|about|career|games|sorting|quickstart)\.html$/.test(base);
    if (!isIndexOrDash) return violations;

    const hasNav = /<nav\b/i.test(content);
    const hasMain = /<main\b/i.test(content);
    if (!hasNav || !hasMain) return violations;

    // Skip link presence: href="#main" or href="#mainContent" or class="skip-nav" etc.
    const hasSkip = /href\s*=\s*["']#(?:main|mainContent|content|skip|primary)[^"']*["']/i.test(content) ||
                    /class\s*=\s*["'][^"']*skip[^"']*["']/i.test(content);

    if (!hasSkip) {
        violations.push(violation(
            'A11Y-005', 'medium', filePath, 1,
            'Page has <nav> and <main> but no skip-to-content link',
            base
        ));
    }
    return violations;
}

/**
 * A11Y-006: Focus indicator removed without replacement.
 * Detects :focus { outline: none } or :focus { outline: 0 } rules where
 * no visual replacement (box-shadow, border-color, background) is provided.
 * Severity: high — keyboard users lose all focus visibility.
 */
function checkFocusIndicator(content, filePath, lineMap) {
    const violations = [];

    // Extract only style block content with its start offsets
    const styleRe = /<style[^>]*>([\s\S]*?)<\/style>/gi;
    let sm;
    while ((sm = styleRe.exec(content)) !== null) {
        const styleContent = sm[1];
        const styleOffset = sm.index + sm[0].indexOf(sm[1]);

        // Find :focus { ... } blocks
        const focusRe = /:focus(?:\s*,\s*[^{]*)?\s*\{([^}]*)\}/gi;
        let fm;
        while ((fm = focusRe.exec(styleContent)) !== null) {
            const block = fm[1];
            if (!/outline\s*:\s*(none|0)/i.test(block)) continue;

            // Accepted replacements: box-shadow, any border-*-color, explicit border shorthand, background-color
            const hasReplacement = /box-shadow|border(?:-\w+)?-color|border\s*:|background(?:-color)?/i.test(block);
            if (hasReplacement) continue;

            // Also accept: a :focus-visible companion rule in the same style block within 300 chars after this rule.
            // This is the pattern written by fix-a11y.js — once the fix is applied we should not re-flag.
            const afterBlock = styleContent.slice(fm.index + fm[0].length, fm.index + fm[0].length + 300);
            const hasFocusVisible = /:focus-visible\s*\{[^}]*outline[^}]*\}/i.test(afterBlock);
            if (hasFocusVisible) continue;

            const absIndex = styleOffset + fm.index;
            const lineNum = indexToLine(lineMap, absIndex);
            violations.push(violation(
                'A11Y-006', 'high', filePath, lineNum,
                ':focus rule removes outline without providing a visual replacement',
                fm[0].trim().slice(0, 100)
            ));
        }
    }
    return violations;
}

/**
 * A11Y-007: Empty interactive elements.
 * Buttons and links that have no accessible name: no text content, no aria-label,
 * no aria-labelledby, no title.
 * Decorative window-chrome buttons (minimize/maximize/close) are excluded.
 * Severity: critical — these elements are completely unusable for screen reader users.
 */
function checkEmptyInteractives(content, filePath, lineMap) {
    const violations = [];
    const htmlContent = blankScriptsAndStyles(content);

    // Decorative class patterns used for window chrome or purely visual indicators — skip these.
    // "close" alone (without "win-close" etc.) is a common window chrome button pattern.
    // "slide-dot", "nav-dot", "carousel-dot" are visual progress indicators.
    const decorativeClasses = [
        'minimize', 'maximize', 'close', 'win-ctrl', 'titlebar-btn', 'window-btn',
        'firewall-toggle', 'nav-dot', 'slide-dot', 'carousel-dot', 'tab-dot'
    ];

    // --- Empty <button></button> ---
    const btnRe = /<button([^>]*)>\s*<\/button>/gi;
    let m;
    while ((m = btnRe.exec(htmlContent)) !== null) {
        const attrs = m[1];
        const classM = attrs.match(/class\s*=\s*["']([^"']*)["']/i);
        const classes = classM ? classM[1].toLowerCase() : '';
        if (decorativeClasses.some(p => classes.includes(p))) continue;

        // Not decorative — check for aria-label or title as accessible name
        const hasAriaLabel = /aria-label\s*=/i.test(attrs);
        const hasTitle = /\btitle\s*=/i.test(attrs);
        // title is not fully reliable — flag it as low severity if title is the only name
        const severity = hasAriaLabel ? null : (hasTitle ? 'low' : 'critical');
        if (severity) {
            const lineNum = indexToLine(lineMap, m.index);
            violations.push(violation(
                'A11Y-007', severity, filePath, lineNum,
                severity === 'low'
                    ? 'Empty button relies on title attribute alone — prefer aria-label'
                    : 'Empty button has no accessible name (no text, aria-label, or title)',
                m[0].trim().slice(0, 120)
            ));
        }
    }

    // --- Empty <a></a> ---
    const anchorRe = /<a([^>]*)>\s*<\/a>/gi;
    while ((m = anchorRe.exec(htmlContent)) !== null) {
        const attrs = m[1];
        const hasAriaLabel = /aria-label\s*=/i.test(attrs);
        const hasTitle = /\btitle\s*=/i.test(attrs);
        const severity = hasAriaLabel ? null : (hasTitle ? 'low' : 'high');
        if (severity) {
            const lineNum = indexToLine(lineMap, m.index);
            violations.push(violation(
                'A11Y-007', severity, filePath, lineNum,
                severity === 'low'
                    ? 'Empty anchor relies on title attribute alone — prefer aria-label'
                    : 'Empty anchor has no accessible name (no text, aria-label, or title)',
                m[0].trim().slice(0, 120)
            ));
        }
    }

    return violations;
}

/**
 * A11Y-008: Interactive div/span elements lacking ARIA roles.
 * Detects divs and spans with onclick handlers that have no role, tabindex,
 * or button/link semantics. These are inaccessible to keyboard and AT users.
 * Severity: medium — interactive intent is present but no semantics communicated.
 */
function checkMissingAriaRoles(content, filePath, lineMap) {
    const violations = [];
    const htmlContent = blankScriptsAndStyles(content);

    const re = /<(div|span)([^>]*)onclick\s*=[^>]*>/gi;
    let m;
    while ((m = re.exec(htmlContent)) !== null) {
        const tag = m[1];
        const attrs = m[2] + m[0].slice(m[0].indexOf('onclick'));
        const hasRole = /\brole\s*=/i.test(attrs);
        const hasTabindex = /\btabindex\s*=/i.test(attrs);
        const hasFocusable = hasRole || hasTabindex;
        if (!hasFocusable) {
            const lineNum = indexToLine(lineMap, m.index);
            violations.push(violation(
                'A11Y-008', 'medium', filePath, lineNum,
                `<${tag}> has onclick but no role or tabindex — not accessible to keyboard users`,
                m[0].trim().slice(0, 120)
            ));
        }
    }
    return violations;
}

// ─── Scanner Core ────────────────────────────────────────────────────────────

/**
 * Run all checks against a single file.
 * Returns an array of violation objects.
 */
function auditFile(filePath) {
    let content;
    try {
        content = fs.readFileSync(filePath, 'utf8');
    } catch (e) {
        return []; // Unreadable file — skip silently
    }

    const lineMap = buildLineMap(content);
    const allViolations = [];

    allViolations.push(...checkLangAttribute(content, filePath, lineMap));
    allViolations.push(...checkImgAlt(content, filePath, lineMap));
    allViolations.push(...checkInputLabels(content, filePath, lineMap));
    allViolations.push(...checkInlineContrast(content, filePath, lineMap));
    allViolations.push(...checkSkipLink(content, filePath, lineMap));
    allViolations.push(...checkFocusIndicator(content, filePath, lineMap));
    allViolations.push(...checkEmptyInteractives(content, filePath, lineMap));
    allViolations.push(...checkMissingAriaRoles(content, filePath, lineMap));

    return allViolations;
}

// ─── Main ────────────────────────────────────────────────────────────────────

function main() {
    if (!fs.existsSync(APP_ROOT)) {
        console.error(`ERROR: App root not found: ${APP_ROOT}`);
        process.exit(1);
    }

    const files = walk(APP_ROOT);
    const allViolations = [];
    let scanned = 0;

    process.stderr.write(`Scanning ${files.length} HTML files...\n`);

    for (const f of files) {
        const fileViolations = auditFile(f);
        allViolations.push(...fileViolations);
        scanned++;
        if (scanned % 200 === 0) {
            process.stderr.write(`  ${scanned}/${files.length} scanned (${allViolations.length} violations found so far)\n`);
        }
    }

    // Apply severity filter if specified
    let results = allViolations;
    if (FLAG_SEVERITY) {
        results = results.filter(v => FLAG_SEVERITY.has(v.severity));
    }

    // Apply per-code limit if specified
    if (FLAG_LIMIT > 0) {
        const countByCode = {};
        results = results.filter(v => {
            countByCode[v.code] = (countByCode[v.code] || 0) + 1;
            return countByCode[v.code] <= FLAG_LIMIT;
        });
    }

    // Build summary by code
    const bySeverity = { critical: 0, high: 0, medium: 0, low: 0 };
    const byCode = {};
    for (const v of allViolations) {
        bySeverity[v.severity] = (bySeverity[v.severity] || 0) + 1;
        byCode[v.code] = (byCode[v.code] || 0) + 1;
    }

    const report = {
        meta: {
            generated: NOW,
            scanned: files.length,
            totalViolations: allViolations.length,
            filteredViolations: results.length,
            bySeverity,
            byCode,
        },
        violations: results,
    };

    if (FLAG_JSON || FLAG_OUT) {
        const json = JSON.stringify(report, null, 2);
        if (FLAG_OUT) {
            fs.mkdirSync(path.dirname(FLAG_OUT), { recursive: true });
            fs.writeFileSync(FLAG_OUT, json, 'utf8');
            console.log(`Report written to ${FLAG_OUT}`);
        } else {
            console.log(json);
        }
    } else {
        // Human-readable summary
        console.log('\n=== Hexworth Prime A11y Audit ===');
        console.log(`Scanned: ${files.length} HTML files`);
        console.log(`Violations: ${allViolations.length} total\n`);

        console.log('By severity:');
        for (const [sev, count] of Object.entries(bySeverity)) {
            if (count > 0) console.log(`  ${sev.padEnd(10)} ${count}`);
        }

        console.log('\nBy check code:');
        const codeDescriptions = {
            'A11Y-001': 'Missing html[lang]',
            'A11Y-002': 'Image missing alt',
            'A11Y-003': 'Input without label',
            'A11Y-004': 'Contrast risk (inline)',
            'A11Y-005': 'Missing skip link',
            'A11Y-006': 'Focus outline removed',
            'A11Y-007': 'Empty interactive element',
            'A11Y-008': 'div/span onclick no role',
        };
        for (const [code, count] of Object.entries(byCode).sort()) {
            const desc = codeDescriptions[code] || code;
            console.log(`  ${code}  ${String(count).padStart(5)}  ${desc}`);
        }

        // Show top 30 critical/high violations
        const important = results.filter(v => v.severity === 'critical' || v.severity === 'high').slice(0, 30);
        if (important.length > 0) {
            console.log('\nTop critical/high violations (first 30):');
            for (const v of important) {
                console.log(`  [${v.severity.toUpperCase()}] ${v.code}  ${v.file}:${v.line}`);
                console.log(`         ${v.message}`);
                if (v.context) console.log(`         Context: ${v.context}`);
            }
        }

        console.log('\nRun with --json to get the full machine-readable report.');
        console.log(`Run with --out _tools/reports/a11y-report.json to save.\n`);
    }

    // Exit code: 1 if any critical violations found
    const criticalCount = bySeverity.critical || 0;
    process.exit(criticalCount > 0 ? 1 : 0);
}

main();
