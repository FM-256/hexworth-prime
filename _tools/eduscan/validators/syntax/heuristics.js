/**
 * EduScan - Heuristics Validator
 *
 * Anomaly detection layer for patterns that don't match known signatures
 * but "smell wrong." Uses the antivirus quarantine model: flag suspects
 * with a new 'suspect' severity for human review.
 *
 * Rules:
 * - HEUR-001: Excessive inline scripts (>8 <script> blocks without src)
 * - HEUR-002: Commented-out code references (<!-- containing <script or <link)
 * - HEUR-003: TODO/FIXME/HACK markers inside <script> blocks
 * - HEUR-004: console.log in inline scripts (production hygiene)
 * - HEUR-005: Duplicate script includes (same src on multiple <script> tags)
 * - HEUR-006: Hardcoded relative href in shared JS renderer (fragile back links)
 * - HEUR-007: Code block CSS missing white-space: pre/pre-wrap (commands render as paragraph)
 * - HEUR-008: position:fixed in dynamically created overlay (breaks when body has filter/transform)
 * - HEUR-009: Empty template literal ${} in inline scripts (SyntaxError kills entire script block)
 * - HEUR-010: querySelector targets heading tag not present in HTML (e.g., h3 in selector but h2 in markup — null crash)
 * - HEUR-011: Literal </script> inside JS string or comment (HTML parser terminates script block early, killing all JS below it)
 * - HEUR-012: JS syntax error via new Function() parse check (catches unclosed strings, missing quotes, etc.)
 */

const fs = require('fs');
const path = require('path');

class HeuristicsValidator {
    constructor(options = {}) {
        this.verbose = options.verbose || false;
        this.profile = options.profile || 'ci';
        this.rootPath = options.rootPath || './_app';

        // Load quarantine allowlist
        this.allowlist = this.loadAllowlist();
    }

    /**
     * Load quarantine allowlist from JSON file
     * @returns {Array} Allowlist entries
     */
    loadAllowlist() {
        const allowlistPath = path.resolve(__dirname, '../../quarantine-allowlist.json');
        try {
            const raw = fs.readFileSync(allowlistPath, 'utf8');
            return JSON.parse(raw);
        } catch (err) {
            if (this.verbose) {
                console.log('[HEURISTICS] No allowlist found, using empty list');
            }
            return [];
        }
    }

    /**
     * Check if an issue is allowlisted
     * @param {string} filePath - Relative file path
     * @param {string} code - Issue code (e.g., HEUR-001)
     * @returns {boolean} True if allowlisted
     */
    isAllowlisted(filePath, code) {
        const normalized = filePath.replace(/\\/g, '/');
        return this.allowlist.some(entry =>
            normalized.includes(entry.file) && entry.code === code
        );
    }

    /**
     * Validate a single file for heuristic anomalies
     * @param {Object} file - { path, content }
     * @returns {Array} Issues found
     */
    validate(file) {
        if (this.profile === 'inventory') {
            return [];
        }

        const issues = [];

        issues.push(...this.checkExcessiveInlineScripts(file));
        issues.push(...this.checkCommentedOutCode(file));
        issues.push(...this.checkTodoMarkers(file));
        issues.push(...this.checkConsoleLog(file));
        issues.push(...this.checkDuplicateScriptSrc(file));
        issues.push(...this.checkUnguardedParseInt(file));
        issues.push(...this.checkUnguardedLocalStorageArithmetic(file));
        issues.push(...this.checkCodeBlockWhitespace(file));
        issues.push(...this.checkEmptyTemplateLiterals(file));
        issues.push(...this.checkHeadingTagMismatch(file));
        issues.push(...this.checkScriptCloserInJS(file));
        issues.push(...this.checkJSSyntaxErrors(file));

        // Filter out allowlisted issues
        return issues.filter(issue => !this.isAllowlisted(file.path, issue.code));
    }

    /**
     * HEUR-001: Excessive inline scripts (>8 <script> blocks without src)
     */
    checkExcessiveInlineScripts(file) {
        const issues = [];
        const content = file.content;

        // Match <script> tags without src attribute
        const inlineScriptPattern = /<script(?![^>]*\bsrc\b)[^>]*>/gi;
        const matches = content.match(inlineScriptPattern);
        const count = matches ? matches.length : 0;

        if (count > 8) {
            issues.push({
                code: 'HEUR-001',
                severity: 'suspect',
                category: 'heuristic',
                message: `Excessive inline scripts: ${count} <script> blocks without src (threshold: 8)`,
                file: file.path,
                fix: 'Consider extracting inline scripts to external .js files'
            });
        }

        return issues;
    }

    /**
     * HEUR-002: Commented-out code references
     * Detects <!-- comments containing <script or <link patterns
     */
    checkCommentedOutCode(file) {
        const issues = [];
        const content = file.content;

        const commentPattern = /<!--([\s\S]*?)-->/g;
        let match;

        while ((match = commentPattern.exec(content)) !== null) {
            const commentBody = match[1];

            if (/<script\b/i.test(commentBody) || /<link\b/i.test(commentBody)) {
                const line = this.getLineNumber(content, match.index);
                issues.push({
                    code: 'HEUR-002',
                    severity: 'suspect',
                    category: 'heuristic',
                    message: 'Commented-out code reference (script or link tag in HTML comment)',
                    file: file.path,
                    line,
                    fix: 'Remove commented-out code or restore it if needed'
                });
            }
        }

        return issues;
    }

    /**
     * HEUR-003: TODO/FIXME/HACK markers inside <script> blocks
     */
    checkTodoMarkers(file) {
        const issues = [];
        const content = file.content;

        const scriptPattern = /<script(?![^>]*\bsrc\b)[^>]*>([\s\S]*?)<\/script>/gi;
        let scriptMatch;

        while ((scriptMatch = scriptPattern.exec(content)) !== null) {
            const scriptContent = scriptMatch[1];
            const scriptStart = scriptMatch.index;
            const lines = scriptContent.split('\n');

            for (let i = 0; i < lines.length; i++) {
                const lineText = lines[i];
                const markerMatch = lineText.match(/\/\/\s*(TODO|FIXME|HACK)\b/i);

                if (markerMatch) {
                    const absolutePos = scriptStart + scriptContent.indexOf(lineText);
                    const line = this.getLineNumber(content, absolutePos);
                    issues.push({
                        code: 'HEUR-003',
                        severity: 'suspect',
                        category: 'heuristic',
                        message: `${markerMatch[1].toUpperCase()} marker in script: ${lineText.trim().substring(0, 60)}`,
                        file: file.path,
                        line,
                        fix: `Resolve or remove ${markerMatch[1].toUpperCase()} comment`
                    });
                }
            }
        }

        return issues;
    }

    /**
     * HEUR-004: console.log in inline scripts
     * Strips JS comments before checking to avoid false positives
     */
    checkConsoleLog(file) {
        const issues = [];
        const content = file.content;

        const scriptPattern = /<script(?![^>]*\bsrc\b)[^>]*>([\s\S]*?)<\/script>/gi;
        let scriptMatch;

        while ((scriptMatch = scriptPattern.exec(content)) !== null) {
            const scriptContent = scriptMatch[1];
            const scriptStart = scriptMatch.index;

            // Strip single-line and multi-line JS comments
            const stripped = scriptContent
                .replace(/\/\/.*$/gm, '')
                .replace(/\/\*[\s\S]*?\*\//g, '');

            // Find console.log calls in stripped content
            const logPattern = /console\.log\s*\(/g;
            let logMatch;

            while ((logMatch = logPattern.exec(stripped)) !== null) {
                // Map back to original line number approximately
                const precedingContent = stripped.substring(0, logMatch.index);
                const lineOffset = precedingContent.split('\n').length - 1;
                const absolutePos = scriptStart + scriptContent.indexOf('console.log');
                const line = this.getLineNumber(content, absolutePos);

                issues.push({
                    code: 'HEUR-004',
                    severity: 'suspect',
                    category: 'heuristic',
                    message: 'console.log() in inline script (production hygiene)',
                    file: file.path,
                    line,
                    fix: 'Remove console.log or replace with proper logging'
                });
                break; // One report per script block is enough
            }
        }

        return issues;
    }

    /**
     * HEUR-005: Duplicate script includes (same src on multiple <script> tags)
     */
    checkDuplicateScriptSrc(file) {
        const issues = [];
        const content = file.content;

        const srcPattern = /<script[^>]*\bsrc\s*=\s*["']([^"']+)["'][^>]*>/gi;
        const srcMap = new Map(); // src -> [line numbers]
        let match;

        while ((match = srcPattern.exec(content)) !== null) {
            const src = match[1];
            const line = this.getLineNumber(content, match.index);

            if (!srcMap.has(src)) {
                srcMap.set(src, []);
            }
            srcMap.get(src).push(line);
        }

        for (const [src, lines] of srcMap) {
            if (lines.length > 1) {
                issues.push({
                    code: 'HEUR-005',
                    severity: 'suspect',
                    category: 'heuristic',
                    message: `Duplicate script include: "${src}" loaded ${lines.length} times (lines ${lines.join(', ')})`,
                    file: file.path,
                    line: lines[1], // Report at second occurrence
                    fix: `Remove duplicate <script src="${src}"> tag`
                });
            }
        }

        return issues;
    }

    /**
     * MATH-001: Unguarded parseInt() — missing fallback for NaN.
     *
     * parseInt() returns NaN when the input can't be parsed. Without a
     * fallback (|| 0), NaN propagates through arithmetic and corrupts
     * displayed values ("NaN%", "NaN GB", etc.).
     *
     * Detects: parseInt(x) not followed by || or ?? on the same line.
     * Ignores: parseInt(x, radix) used in a comparison or return statement
     *          where NaN is handled at the call site.
     */
    checkUnguardedParseInt(file) {
        const issues = [];
        const content = file.content;
        let fileHit = false; // One report per file max

        const scriptPattern = /<script(?![^>]*\bsrc\b)[^>]*>([\s\S]*?)<\/script>/gi;
        let scriptMatch;

        while ((scriptMatch = scriptPattern.exec(content)) !== null) {
            if (fileHit) break;
            const scriptContent = scriptMatch[1];
            const scriptStart = scriptMatch.index;
            const lines = scriptContent.split('\n');

            for (let i = 0; i < lines.length; i++) {
                if (fileHit) break;
                const line = lines[i];

                // Skip comments
                const trimmed = line.trim();
                if (trimmed.startsWith('//') || trimmed.startsWith('*')) continue;

                // Only flag: parseInt() combined with + - * / on the SAME line
                // AND not guarded with || or ??
                if (!/\bparseInt\s*\(/.test(line)) continue;

                // Find the FULL parseInt(...) call by tracking paren depth
                // This avoids false positives from nested parens and regex literals
                const parseIntStart = line.search(/\bparseInt\s*\(/);
                if (parseIntStart === -1) continue;
                const openIdx = line.indexOf('(', parseIntStart + 8);
                let depth = 1, closeIdx = -1;
                for (let c = openIdx + 1; c < line.length; c++) {
                    if (line[c] === '(') depth++;
                    else if (line[c] === ')') { depth--; if (depth === 0) { closeIdx = c; break; } }
                }
                if (closeIdx === -1) continue;

                // Check what follows the full parseInt(...) call
                const afterCall = line.slice(closeIdx + 1).trimStart();
                // Check what precedes parseInt
                const beforeCall = line.slice(0, parseIntStart).trimEnd();

                // Must have arithmetic operator OUTSIDE the call
                const hasArithmeticAfter = /^[+\-*/]/.test(afterCall);
                const hasArithmeticBefore = /[+\-*/]$/.test(beforeCall);
                if (!hasArithmeticAfter && !hasArithmeticBefore) continue;

                // Check if guarded: parseInt(...) || or parseInt(...) ??
                if (/^(\|\||[?][?])/.test(afterCall)) continue;

                const absolutePos = scriptStart + scriptContent.indexOf(line);
                const lineNum = this.getLineNumber(content, absolutePos);

                issues.push({
                    code: 'MATH-001',
                    severity: 'suspect',
                    category: 'heuristic',
                    message: `Unguarded parseInt() in arithmetic — NaN will propagate if input is invalid`,
                    file: file.path,
                    line: lineNum,
                    fix: 'Add fallback: (parseInt(value, 10) || 0)'
                });
                fileHit = true;
            }
        }

        return issues;
    }

    /**
     * DATA-001: localStorage.getItem() in arithmetic without Number() coercion.
     *
     * localStorage stores strings. Using getItem() directly in arithmetic
     * causes string concatenation instead of addition:
     *   xp += localStorage.getItem('xp')  // "50" + "10" = "5010" not 60
     *
     * Detects: getItem() used with += or + without Number()/parseInt()/parseFloat().
     */
    checkUnguardedLocalStorageArithmetic(file) {
        const issues = [];
        const content = file.content;

        const scriptPattern = /<script(?![^>]*\bsrc\b)[^>]*>([\s\S]*?)<\/script>/gi;
        let scriptMatch;

        while ((scriptMatch = scriptPattern.exec(content)) !== null) {
            const scriptContent = scriptMatch[1];
            const scriptStart = scriptMatch.index;
            const lines = scriptContent.split('\n');

            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                const trimmed = line.trim();

                // Skip comments
                if (trimmed.startsWith('//') || trimmed.startsWith('*')) continue;

                // Pattern 1: += localStorage.getItem(...) without Number wrapper
                if (/\+=\s*localStorage\.getItem\s*\(/.test(line) &&
                    !/Number\s*\(\s*localStorage\.getItem/.test(line) &&
                    !/parseInt\s*\(\s*localStorage\.getItem/.test(line) &&
                    !/parseFloat\s*\(\s*localStorage\.getItem/.test(line)) {
                    const absolutePos = scriptStart + scriptContent.indexOf(line);
                    const lineNum = this.getLineNumber(content, absolutePos);

                    issues.push({
                        code: 'DATA-001',
                        severity: 'suspect',
                        category: 'heuristic',
                        message: `localStorage.getItem() used in += without Number() coercion — causes string concatenation instead of addition`,
                        file: file.path,
                        line: lineNum,
                        fix: 'Wrap with Number(): += Number(localStorage.getItem(...))'
                    });
                    continue;
                }

                // Pattern 2: arithmetic operator with getItem on either side
                if (/localStorage\.getItem\s*\([^)]*\)\s*[+\-*/]/.test(line) ||
                    /[+\-*/]\s*localStorage\.getItem\s*\(/.test(line)) {
                    // Check it's not already wrapped
                    if (/Number\s*\(\s*localStorage\.getItem/.test(line) ||
                        /parseInt\s*\(\s*localStorage\.getItem/.test(line) ||
                        /parseFloat\s*\(\s*localStorage\.getItem/.test(line)) {
                        continue;
                    }

                    const absolutePos = scriptStart + scriptContent.indexOf(line);
                    const lineNum = this.getLineNumber(content, absolutePos);

                    issues.push({
                        code: 'DATA-001',
                        severity: 'suspect',
                        category: 'heuristic',
                        message: `localStorage.getItem() in arithmetic expression without Number() coercion — returns string, not number`,
                        file: file.path,
                        line: lineNum,
                        fix: 'Wrap with Number(): Number(localStorage.getItem(...))'
                    });
                }
            }
        }

        return issues;
    }

    /**
     * HEUR-009: Empty template literal ${} in inline scripts
     *
     * Detects empty expressions inside template literals within <script> blocks.
     * An empty ${} is a JavaScript SyntaxError that prevents the entire script
     * block from parsing — killing all constructors, event listeners, and
     * initialization code in that block. This pattern was introduced when
     * automated tag conversion (e.g., h4→h3) stripped template expressions
     * from inside heading tags: <h4>${current.task}</h4> → <h3>${}</h3>.
     */
    checkEmptyTemplateLiterals(file) {
        const issues = [];
        const content = file.content;

        // Extract inline <script> blocks (no src attribute)
        const scriptPattern = /<script(?![^>]*\bsrc\b)[^>]*>([\s\S]*?)<\/script>/gi;
        let scriptMatch;

        while ((scriptMatch = scriptPattern.exec(content)) !== null) {
            const scriptContent = scriptMatch[1];
            const scriptStart = scriptMatch.index;

            // Find empty template expressions: ${}
            const emptyExprPattern = /\$\{\s*\}/g;
            let exprMatch;

            while ((exprMatch = emptyExprPattern.exec(scriptContent)) !== null) {
                // Skip if inside a comment
                const lineStart = scriptContent.lastIndexOf('\n', exprMatch.index) + 1;
                const lineText = scriptContent.substring(lineStart, scriptContent.indexOf('\n', exprMatch.index) || scriptContent.length);
                if (lineText.trim().startsWith('//') || lineText.trim().startsWith('*')) continue;

                const absolutePos = scriptStart + scriptMatch[0].indexOf(scriptContent) + exprMatch.index;
                const lineNum = this.getLineNumber(content, absolutePos);

                issues.push({
                    code: 'HEUR-009',
                    severity: 'critical',
                    category: 'heuristic',
                    message: 'Empty template literal ${} — SyntaxError kills entire <script> block (terminal, event listeners, and init code will not execute)',
                    file: file.path,
                    line: lineNum,
                    fix: 'Restore the missing expression inside ${}, e.g., ${current.task} or ${obj.task}'
                });
            }
        }

        return issues;
    }

    /**
     * HEUR-010: querySelector targets heading tag not in HTML
     *
     * Detects when a querySelector() call references a heading level
     * (e.g., .mission-header h3) that doesn't match the actual heading
     * tag in the HTML (e.g., <h2>). querySelector returns null, and
     * accessing .textContent on null throws a TypeError that crashes the
     * function. Common after automated semantic tag conversion (h3→h2, h4→h3).
     */
    checkHeadingTagMismatch(file) {
        const issues = [];
        const content = file.content;

        // Only check HTML files with both <style> and <script> blocks
        if (!file.path.endsWith('.html')) return issues;

        // Find querySelector calls that target parent + heading combinator
        // e.g., querySelector('.mission-header h3')
        const qsPattern = /querySelector\s*\(\s*['"]([^'"]+\s+h([2-6]))['"]\s*\)/g;
        let qsMatch;

        while ((qsMatch = qsPattern.exec(content)) !== null) {
            const selector = qsMatch[1];
            const headingLevel = qsMatch[2];

            // Extract the parent class from the selector (e.g., ".mission-header" from ".mission-header h3")
            const parentMatch = selector.match(/\.([a-zA-Z0-9_-]+)\s+h[2-6]/);
            if (!parentMatch) continue;
            const parentClass = parentMatch[1];

            // Check if the HTML contains that parent class with a DIFFERENT heading level
            const htmlPattern = new RegExp(
                `class\\s*=\\s*["'][^"']*\\b${parentClass}\\b[^"']*["'][\\s\\S]*?<h([2-6])>`,
                'i'
            );
            const htmlMatch = content.match(htmlPattern);

            if (htmlMatch && htmlMatch[1] !== headingLevel) {
                const lineNum = this.getLineNumber(content, qsMatch.index);
                issues.push({
                    code: 'HEUR-010',
                    severity: 'high',
                    category: 'heuristic',
                    message: `querySelector targets .${parentClass} h${headingLevel} but HTML has <h${htmlMatch[1]}> — returns null, crashes on property access`,
                    file: file.path,
                    line: lineNum,
                    fix: `Change selector to '.${parentClass} h${htmlMatch[1]}' to match the actual HTML heading level`
                });
            }
        }

        return issues;
    }

    /**
     * HEUR-006: Hardcoded relative href in shared JS renderer
     *
     * Scans .js files in the components/ directory for hardcoded relative
     * href attributes (e.g., href="../../index.html"). These are fragile
     * because shared renderers are loaded by consumer pages at different
     * directory depths, so the relative path resolves differently depending
     * on which page loads the renderer.
     *
     * This is a GLOBAL scan — called once, not per-file.
     * @returns {Array} Issues found
     */
    validateRendererLinks() {
        const issues = [];
        const componentsDir = path.resolve(this.rootPath, 'components');

        let jsFiles;
        try {
            jsFiles = fs.readdirSync(componentsDir)
                .filter(f => f.endsWith('.js') && /renderer/i.test(f));
        } catch (err) {
            return issues;
        }

        for (const filename of jsFiles) {
            const filePath = path.join(componentsDir, filename);
            let content;
            try {
                content = fs.readFileSync(filePath, 'utf8');
            } catch (err) {
                continue;
            }

            // Match href="..." with relative paths (starts with ../ or ./)
            const hrefPattern = /href\s*=\s*["'](\.\.\/[^"']+)["']/g;
            let match;

            while ((match = hrefPattern.exec(content)) !== null) {
                const href = match[1];
                const line = this.getLineNumber(content, match.index);

                if (this.isAllowlisted(`components/${filename}`, 'HEUR-006')) {
                    continue;
                }

                issues.push({
                    code: 'HEUR-006',
                    severity: 'suspect',
                    category: 'heuristic',
                    message: `Hardcoded relative href in shared renderer: ${href} — resolves differently depending on consumer page depth`,
                    file: `components/${filename}`,
                    line,
                    fix: `Use absolute path from site root (e.g., /houses/shield/index.html) instead of relative path`
                });
            }
        }

        return issues;
    }

    /**
     * HEUR-007: Code block CSS missing white-space: pre or pre-wrap
     *
     * Detects <style> blocks that define .code-block (or similar code container
     * classes) using monospace font-family but without white-space: pre or
     * pre-wrap. Without this property, browsers collapse newlines and the
     * multi-line command content renders as a single paragraph.
     */
    checkCodeBlockWhitespace(file) {
        const issues = [];
        const content = file.content;

        // Only check HTML files with inline <style> blocks
        if (!content.includes('<style>') && !content.includes('<style ')) return issues;

        // Extract all <style> blocks
        const stylePattern = /<style[^>]*>([\s\S]*?)<\/style>/gi;
        let styleMatch;

        while ((styleMatch = stylePattern.exec(content)) !== null) {
            const styleContent = styleMatch[1];
            const styleStartPos = styleMatch.index;

            // Find CSS rules that look like code/command containers:
            // .code-block, .code-block-sm, .command-block, .terminal-code, etc.
            const rulePattern = /\.(code-block(?:-\w+)?|command-block|terminal-code)\s*\{([^}]+)\}/g;
            let ruleMatch;

            while ((ruleMatch = rulePattern.exec(styleContent)) !== null) {
                const className = ruleMatch[1];
                const ruleBody = ruleMatch[2];

                // Check for monospace font (confirms this is a code container)
                const hasMonospace = /font-family\s*:.*monospace/i.test(ruleBody);
                if (!hasMonospace) continue;

                // Check for white-space: pre or pre-wrap
                const hasWhiteSpace = /white-space\s*:\s*pre(?:-wrap)?/i.test(ruleBody);
                if (hasWhiteSpace) continue;

                // This is a code block with monospace but no white-space preservation
                const line = this.getLineNumber(content, styleStartPos + ruleMatch.index);

                issues.push({
                    code: 'HEUR-007',
                    severity: 'medium',
                    category: 'heuristic',
                    message: `.${className} uses monospace font but missing white-space: pre-wrap — multi-line code/commands will render as a single paragraph`,
                    file: file.path,
                    line,
                    fix: `Add 'white-space: pre-wrap;' to the .${className} CSS rule`
                });
            }
        }

        return issues;
    }

    /**
     * HEUR-008: position:fixed in dynamically created overlay
     *
     * Scans component JS files for CSS strings containing position: fixed
     * inside dynamically created elements (createElement + appendChild).
     * position:fixed breaks when any ancestor (including body) has a CSS
     * transform, filter, or will-change property — the element becomes
     * positioned relative to that ancestor instead of the viewport.
     *
     * On dashboards with easter-egg effects that set body.style.filter,
     * this causes modals to appear at the top of the document instead of
     * the viewport, making them invisible when the user is scrolled down.
     *
     * Fix: use position:absolute with JS-calculated top (window.scrollY)
     * and height (window.innerHeight), or use a static DOM element that
     * already exists in the HTML.
     */
    validateFixedPositionOverlays() {
        const issues = [];
        const componentsDir = path.resolve(this.rootPath, 'components');

        let jsFiles;
        try {
            jsFiles = fs.readdirSync(componentsDir).filter(f => f.endsWith('.js'));
        } catch (err) {
            return issues;
        }

        for (const filename of jsFiles) {
            const filePath = path.join(componentsDir, filename);
            let content;
            try {
                content = fs.readFileSync(filePath, 'utf8');
            } catch (err) {
                continue;
            }

            // Only flag files that dynamically create elements (not static HTML)
            const createsElements = /createElement|\.innerHTML\s*=|\.className\s*=/.test(content);
            if (!createsElements) continue;

            // Look for position: fixed in CSS strings or template literals
            const fixedPattern = /position\s*:\s*fixed/gi;
            let match;

            while ((match = fixedPattern.exec(content)) !== null) {
                const line = this.getLineNumber(content, match.index);

                // Skip if in a JS comment (// or /* */)
                const lineStart = content.lastIndexOf('\n', match.index) + 1;
                const lineText = content.substring(lineStart, content.indexOf('\n', match.index));
                const trimmedLine = lineText.trim();
                if (trimmedLine.startsWith('//') || trimmedLine.startsWith('*') || trimmedLine.startsWith('/*')) {
                    continue;
                }

                if (this.isAllowlisted(`components/${filename}`, 'HEUR-008')) {
                    continue;
                }

                issues.push({
                    code: 'HEUR-008',
                    severity: 'suspect',
                    category: 'heuristic',
                    message: `position:fixed in dynamically created element — breaks when body/ancestor has CSS transform or filter (e.g., dashboard easter-egg effects set body.style.filter)`,
                    file: `components/${filename}`,
                    line,
                    fix: `Use position:absolute with JS-calculated top/height from window.scrollY/innerHeight, or use a pre-existing static DOM element from the HTML`
                });
            }
        }

        return issues;
    }

    /**
     * HEUR-011: Literal </script> inside JS string or comment
     *
     * The HTML parser doesn't understand JavaScript. When it encounters
     * </script> (case-insensitive) inside a JS string literal, template
     * literal, or comment, it terminates the <script> block. All JS after
     * that point is dead — parsed as HTML, never executed.
     *
     * The fix is to escape as <\/script> (backslash is a JS no-op but
     * breaks the HTML parser's pattern match).
     *
     * This check extracts inline script blocks using a greedy approach
     * (not the naive regex that itself falls victim to this bug), then
     * scans the raw text for </script> patterns that aren't the actual
     * closing tag.
     */
    checkScriptCloserInJS(file) {
        const issues = [];
        const content = file.content;

        // Strategy: find each inline <script> opening, then count how many
        // </script> (case-insensitive) occur before the NEXT <script> opening
        // or end of file. If count > 1, the first N-1 are inside JS code —
        // each one terminates the script block prematurely.
        //
        // We must NOT use regex to extract script blocks, because the regex
        // itself falls victim to the same </script> bug we're trying to detect.

        // Collect all <script> openings (with and without src)
        const allOpens = [];
        const openPattern = /<script\b[^>]*>/gi;
        let m;
        while ((m = openPattern.exec(content)) !== null) {
            const hasSrc = /\bsrc\s*=/i.test(m[0]);
            allOpens.push({ index: m.index, end: m.index + m[0].length, hasSrc });
        }

        // Collect all </script> closings
        const allCloses = [];
        const closePattern = /<\/script\s*>/gi;
        while ((m = closePattern.exec(content)) !== null) {
            // Skip escaped ones (preceded by backslash, like <\/script>)
            if (m.index > 0 && content[m.index - 1] === '\\') continue;
            allCloses.push(m.index);
        }

        // For each inline script opening, find how many </script> occur
        // before the next <script> tag (or end of file)
        for (let i = 0; i < allOpens.length; i++) {
            if (allOpens[i].hasSrc) continue; // skip external scripts

            const codeStart = allOpens[i].end;
            const nextOpenStart = (i + 1 < allOpens.length) ? allOpens[i + 1].index : content.length;

            // Count </script> between this code start and the next <script> opening
            const closesInRange = allCloses.filter(pos => pos >= codeStart && pos < nextOpenStart);

            // First one is legitimate; any extras are bugs
            if (closesInRange.length > 1) {
                // Flag all but the last one (the last is the real closing tag)
                for (let j = 0; j < closesInRange.length - 1; j++) {
                    const line = this.getLineNumber(content, closesInRange[j]);
                    issues.push({
                        code: 'HEUR-011',
                        severity: 'high',
                        category: 'heuristic',
                        message: 'Literal </script> inside JS code — HTML parser will terminate the script block here, killing all JS below this point',
                        file: file.path,
                        line,
                        fix: 'Escape as <\\/script> — the backslash is invisible to JS but prevents HTML parser termination'
                    });
                }
            }
        }

        return issues;
    }

    /**
     * HEUR-012: JS syntax error detection via new Function() parse
     *
     * Uses the JS engine's own parser to detect syntax errors in inline
     * script blocks. This catches missing quotes, unclosed strings,
     * unbalanced brackets, and other errors that would cause blank screens.
     *
     * Only checks inline scripts (not external .js files loaded via src).
     * Skips blocks shorter than 50 characters (trivial one-liners).
     */
    checkJSSyntaxErrors(file) {
        const issues = [];
        const content = file.content;

        // Extract inline script blocks
        const scriptPattern = /<script(?![^>]*\bsrc\b)[^>]*>([\s\S]*?)<\/script>/gi;
        let match;

        while ((match = scriptPattern.exec(content)) !== null) {
            const code = match[1];

            // Skip trivial scripts
            if (!code.trim() || code.trim().length < 50) continue;

            try {
                // new Function() parses the code without executing it
                new Function(code);
            } catch (err) {
                if (err instanceof SyntaxError) {
                    const line = this.getLineNumber(content, match.index);

                    issues.push({
                        code: 'HEUR-012',
                        severity: 'high',
                        category: 'heuristic',
                        message: `JS syntax error: ${err.message}`,
                        file: file.path,
                        line,
                        fix: 'Fix the syntax error — this kills the entire script block'
                    });
                }
            }
        }

        return issues;
    }

    /**
     * Get line number from character position
     */
    getLineNumber(content, position) {
        return content.substring(0, position).split('\n').length;
    }
}

module.exports = HeuristicsValidator;
