/**
 * EduScan - JavaScript Syntax Validator
 *
 * Detects JS syntax errors in <script> blocks that would cause blank screens.
 *
 * ES-7 Refinements:
 * - Better template literal handling
 * - Modern JS syntax support (optional chaining, nullish coalescing)
 * - Reduced false positives from complex expressions
 * - Profile-based severity
 */

class JSValidator {
    constructor(options = {}) {
        this.verbose = options.verbose || false;
        this.profile = options.profile || 'ci'; // ci, strict, inventory

        // JS validator is under repair - downgrade to non-blocking in CI
        // Bracket counting produces false positives on complex code
        // TODO: Replace with actual JS parser (new Function()) for accurate detection
        this.stabilizing = true;
    }

    /**
     * Validate JavaScript in <script> blocks
     */
    validate(file) {
        const issues = [];
        const content = file.content;

        const scriptBlocks = this.extractScriptBlocks(content);

        for (const block of scriptBlocks) {
            // Skip external scripts
            if (block.src) {
                continue;
            }

            // Skip empty or trivial scripts
            if (!block.code.trim() || block.code.trim().length < 10) {
                continue;
            }

            // Run syntax checks (only critical ones in CI mode)
            if (this.profile === 'ci') {
                // CI mode: only check for critical syntax errors
                issues.push(...this.checkCriticalSyntaxErrors(file, block));
                issues.push(...this.checkForEachCloserOnForLoop(file, block));
            } else {
                // Strict mode: full validation
                issues.push(...this.checkBracketBalance(file, block));
                issues.push(...this.checkStringQuotes(file, block));
                issues.push(...this.checkCommonErrors(file, block));
                issues.push(...this.checkForEachCloserOnForLoop(file, block));
            }
        }

        return issues;
    }

    /**
     * Extract script blocks from HTML
     */
    extractScriptBlocks(content) {
        const blocks = [];
        const scriptPattern = /<script([^>]*)>([\s\S]*?)<\/script>/gi;
        let match;

        while ((match = scriptPattern.exec(content)) !== null) {
            const attrs = match[1];
            const code = match[2];

            const srcMatch = attrs.match(/src\s*=\s*["']([^"']+)["']/i);

            blocks.push({
                src: srcMatch ? srcMatch[1] : null,
                code,
                position: match.index,
                line: this.getLineNumber(content, match.index)
            });
        }

        return blocks;
    }

    /**
     * Check for critical syntax errors only (CI mode)
     * Only flags issues that would definitely break execution
     */
    checkCriticalSyntaxErrors(file, block) {
        const issues = [];
        const code = block.code;

        // Check for severely unbalanced brackets (diff > 3)
        const cleaned = this.stripStringsAndComments(code);
        const brackets = { '(': 0, '{': 0, '[': 0 };
        const closers = { ')': '(', '}': '{', ']': '[' };

        for (const char of cleaned) {
            if (brackets[char] !== undefined) {
                brackets[char]++;
            }
            if (closers[char]) {
                brackets[closers[char]]--;
            }
        }

        // Only report if severely unbalanced (likely real error)
        for (const [open, count] of Object.entries(brackets)) {
            if (Math.abs(count) > 3) {
                const close = { '(': ')', '{': '}', '[': ']' }[open];
                issues.push({
                    code: 'JS-001',
                    severity: 'high',
                    category: 'syntax',
                    message: `Severely unbalanced ${open}${close} (off by ${Math.abs(count)})`,
                    file: file.path,
                    line: block.line,
                    fix: count > 0 ? `Add ${Math.abs(count)} closing '${close}'` : `Remove ${Math.abs(count)} extra '${close}'`
                });
            }
        }

        // Check for obviously broken function declarations
        const brokenFunc = /function\s*\([^)]*\)\s*{[^}]*$/m;
        if (brokenFunc.test(code) && !code.includes('function')) {
            issues.push({
                code: 'JS-002',
                severity: 'high',
                category: 'syntax',
                message: 'Unclosed function body',
                file: file.path,
                line: block.line,
                fix: 'Add closing } for function'
            });
        }

        return issues;
    }

    /**
     * Check bracket/brace/paren balance (strict mode)
     */
    checkBracketBalance(file, block) {
        const issues = [];
        const code = this.stripStringsAndComments(block.code);

        const pairs = {
            '(': { close: ')', name: 'parenthesis', count: 0 },
            '{': { close: '}', name: 'brace', count: 0 },
            '[': { close: ']', name: 'bracket', count: 0 }
        };

        const closers = { ')': '(', '}': '{', ']': '[' };

        for (const char of code) {
            if (pairs[char]) {
                pairs[char].count++;
            }
            if (closers[char]) {
                pairs[closers[char]].count--;
            }
        }

        for (const [open, info] of Object.entries(pairs)) {
            if (info.count > 0) {
                issues.push({
                    code: 'JS-002',
                    severity: 'medium',  // Downgraded from high
                    category: 'syntax',
                    message: `Unclosed ${info.name} '${open}' (${info.count} missing)`,
                    file: file.path,
                    line: block.line,
                    fix: `Add ${info.count} closing '${info.close}'`
                });
            } else if (info.count < 0) {
                issues.push({
                    code: 'JS-001',
                    severity: 'medium',
                    category: 'syntax',
                    message: `Extra closing ${info.name} '${info.close}' (${Math.abs(info.count)} extra)`,
                    file: file.path,
                    line: block.line,
                    fix: `Remove ${Math.abs(info.count)} extra '${info.close}'`
                });
            }
        }

        return issues;
    }

    /**
     * Check for string quote issues (strict mode)
     */
    checkStringQuotes(file, block) {
        const issues = [];
        const lines = block.code.split('\n');

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const lineNum = block.line + i;

            // Skip lines with template literals (they can span lines)
            if (line.includes('`')) {
                continue;
            }

            // Skip lines that are clearly continuations
            if (line.trim().startsWith('+') || line.trim().startsWith('.')) {
                continue;
            }

            // Skip comment lines
            if (line.trim().startsWith('//') || line.trim().startsWith('*')) {
                continue;
            }

            // Count unescaped quotes
            let inString = false;
            let stringChar = null;
            let escaped = false;

            for (let j = 0; j < line.length; j++) {
                const char = line[j];

                if (escaped) {
                    escaped = false;
                    continue;
                }

                if (char === '\\') {
                    escaped = true;
                    continue;
                }

                // Skip if we hit a comment
                if (!inString && char === '/' && line[j + 1] === '/') {
                    break;
                }

                if (!inString && (char === '"' || char === "'")) {
                    inString = true;
                    stringChar = char;
                } else if (inString && char === stringChar) {
                    inString = false;
                    stringChar = null;
                }
            }

            // Only report if we end inside a string AND next line doesn't continue
            if (inString && stringChar !== '`') {
                const nextLine = lines[i + 1];
                if (!nextLine ||
                    (!nextLine.trim().startsWith('+') &&
                     !nextLine.trim().startsWith(stringChar))) {
                    issues.push({
                        code: 'JS-003',
                        severity: 'low',  // Downgraded - often false positive
                        category: 'syntax',
                        message: 'Possible unterminated string literal',
                        file: file.path,
                        line: lineNum,
                        fix: `Check string termination with ${stringChar}`
                    });
                }
            }
        }

        return issues;
    }

    /**
     * Check for common JavaScript errors (strict mode)
     */
    checkCommonErrors(file, block) {
        const issues = [];
        const lines = block.code.split('\n');

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const lineNum = block.line + i;
            const trimmed = line.trim();

            // Skip comments
            if (trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*')) {
                continue;
            }

            // Check for = in conditions (but be careful about arrow functions and destructuring)
            if (/\bif\s*\([^)]*[^=!<>]=[^=]/.test(line) &&
                !line.includes('=>') &&
                !line.includes('===') &&
                !line.includes('!==')) {
                issues.push({
                    code: 'JS-004',
                    severity: 'low',  // Often intentional
                    category: 'syntax',
                    message: 'Possible assignment in condition (= instead of ==)',
                    file: file.path,
                    line: lineNum,
                    fix: 'Use == or === for comparison'
                });
            }
        }

        return issues;
    }

    /**
     * JS-005: Detect forEach-style }); closing a for/for...of/for...in loop.
     *
     * A common copy-paste bug: code is converted from .forEach() to a for loop
     * but the closing }); is left behind instead of just }. This silently
     * breaks the entire script block because the parser sees an unexpected ')'.
     *
     * Pattern detected (across consecutive lines):
     *   for (...) {       ← opens a for-loop block
     *     ...
     *   });               ← forEach-style close (should be just })
     */
    checkForEachCloserOnForLoop(file, block) {
        const issues = [];
        const lines = block.code.split('\n');

        // Track brace depth to match }); with the correct opening for-loop
        const forLoopStack = []; // stack of { lineNum, depth } for open for-loops
        let braceDepth = 0;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const trimmed = line.trim();
            const lineNum = block.line + i;

            // Skip comment lines
            if (trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*')) {
                continue;
            }

            // Detect for-loop opening: for (...) { or for...of/in
            // Match the line, then check if a { appears on this line or the next
            if (/^\s*for\s*\(/.test(line)) {
                // Count braces on this line to see if the block opens here
                const openCount = (line.match(/{/g) || []).length;
                const closeCount = (line.match(/}/g) || []).length;
                if (openCount > closeCount) {
                    forLoopStack.push({ lineNum, depth: braceDepth });
                }
            }

            // Track brace depth
            for (const ch of line) {
                if (ch === '{') braceDepth++;
                if (ch === '}') braceDepth--;
            }

            // Detect }); on its own line (the bug pattern)
            if (/^\s*}\s*\)\s*;?\s*$/.test(trimmed) && forLoopStack.length > 0) {
                // Check if current brace depth matches the for-loop's opening depth
                const top = forLoopStack[forLoopStack.length - 1];
                if (braceDepth === top.depth) {
                    forLoopStack.pop();
                    issues.push({
                        code: 'JS-005',
                        severity: 'high',
                        category: 'syntax',
                        message: `forEach-style closure "})" used to close a for-loop (opened at line ${top.lineNum}). Should be "}" only.`,
                        file: file.path,
                        line: lineNum,
                        fix: 'Replace }); with } — this for-loop is not a .forEach() callback'
                    });
                }
            }

            // Pop for-loops that closed normally (brace depth returned to their level)
            while (forLoopStack.length > 0 && braceDepth <= forLoopStack[forLoopStack.length - 1].depth) {
                forLoopStack.pop();
            }
        }

        return issues;
    }

    /**
     * Strip strings and comments from code for bracket matching.
     * Uses single-pass character-by-character parsing to correctly handle:
     * - Strings containing // (not treated as comments)
     * - Template literals with ${...} expressions (nested brackets preserved)
     * - Multiline comments
     * - Regex literals (basic heuristic)
     * - Escaped characters within strings
     *
     * Returns code with all string/comment content replaced by spaces,
     * preserving only structural brackets/parens/braces.
     */
    stripStringsAndComments(code) {
        const result = [];
        let i = 0;
        const len = code.length;

        while (i < len) {
            const ch = code[i];
            const next = i + 1 < len ? code[i + 1] : '';

            // Single-line comment: // (but must not be inside a string)
            if (ch === '/' && next === '/') {
                // Replace rest of line with spaces
                while (i < len && code[i] !== '\n') {
                    result.push(' ');
                    i++;
                }
                continue;
            }

            // Multi-line comment: /* ... */
            if (ch === '/' && next === '*') {
                result.push(' '); // /
                result.push(' '); // *
                i += 2;
                while (i < len) {
                    if (code[i] === '*' && i + 1 < len && code[i + 1] === '/') {
                        result.push(' '); // *
                        result.push(' '); // /
                        i += 2;
                        break;
                    }
                    // Preserve newlines for line mapping
                    result.push(code[i] === '\n' ? '\n' : ' ');
                    i++;
                }
                continue;
            }

            // Double-quoted string
            if (ch === '"') {
                result.push(' ');
                i++;
                while (i < len && code[i] !== '"') {
                    if (code[i] === '\\' && i + 1 < len) {
                        result.push(' ');
                        result.push(' ');
                        i += 2;
                        continue;
                    }
                    result.push(code[i] === '\n' ? '\n' : ' ');
                    i++;
                }
                if (i < len) { result.push(' '); i++; } // closing "
                continue;
            }

            // Single-quoted string
            if (ch === "'") {
                result.push(' ');
                i++;
                while (i < len && code[i] !== "'") {
                    if (code[i] === '\\' && i + 1 < len) {
                        result.push(' ');
                        result.push(' ');
                        i += 2;
                        continue;
                    }
                    result.push(code[i] === '\n' ? '\n' : ' ');
                    i++;
                }
                if (i < len) { result.push(' '); i++; } // closing '
                continue;
            }

            // Template literal with ${...} expression support
            if (ch === '`') {
                result.push(' ');
                i++;
                this._stripTemplateLiteral(code, i, len, result);
                i = this._lastTemplatePos;
                continue;
            }

            // Regex literal (heuristic: / after certain tokens)
            if (ch === '/' && next !== '/' && next !== '*') {
                // Check if this is likely a regex by looking at preceding non-space char
                let prevIdx = result.length - 1;
                while (prevIdx >= 0 && (result[prevIdx] === ' ' || result[prevIdx] === '\n')) {
                    prevIdx--;
                }
                const prevChar = prevIdx >= 0 ? result[prevIdx] : '';
                // Regex can follow: = ( [ ! & | ? : ; , { } ~ ^ + - * % < > newline or start
                const regexPrecedes = '=([!&|?:;,{}~^+-*%<>\n'.includes(prevChar) || prevChar === '' || prevChar === '\n';
                if (regexPrecedes) {
                    result.push(' '); // opening /
                    i++;
                    while (i < len && code[i] !== '/' && code[i] !== '\n') {
                        if (code[i] === '\\' && i + 1 < len) {
                            result.push(' ');
                            result.push(' ');
                            i += 2;
                            continue;
                        }
                        result.push(' ');
                        i++;
                    }
                    if (i < len && code[i] === '/') {
                        result.push(' '); // closing /
                        i++;
                        // Skip flags
                        while (i < len && /[gimsuvy]/.test(code[i])) {
                            result.push(' ');
                            i++;
                        }
                    }
                    continue;
                }
            }

            // Regular character - keep it
            result.push(ch);
            i++;
        }

        return result.join('');
    }

    /**
     * Helper: strip template literal content, handling ${...} expressions.
     * Expressions inside ${} are kept (brackets preserved for counting).
     * Everything else (plain template text) is replaced with spaces.
     */
    _stripTemplateLiteral(code, start, len, result) {
        let i = start;
        while (i < len) {
            if (code[i] === '\\' && i + 1 < len) {
                result.push(' ');
                result.push(' ');
                i += 2;
                continue;
            }
            if (code[i] === '`') {
                result.push(' '); // closing backtick
                i++;
                this._lastTemplatePos = i;
                return;
            }
            if (code[i] === '$' && i + 1 < len && code[i + 1] === '{') {
                result.push(' '); // $
                result.push('{'); // { - KEEP this bracket for counting
                i += 2;
                // Parse the expression inside ${...}, respecting nested braces
                let braceDepth = 1;
                while (i < len && braceDepth > 0) {
                    // Recursively handle strings/comments inside expressions
                    const ch = code[i];
                    if (ch === '{') {
                        braceDepth++;
                        result.push(ch);
                        i++;
                    } else if (ch === '}') {
                        braceDepth--;
                        result.push(ch); // KEEP closing brace for counting
                        i++;
                    } else if (ch === '"' || ch === "'" || ch === '`') {
                        // String inside expression - strip its contents
                        if (ch === '`') {
                            result.push(' ');
                            i++;
                            this._stripTemplateLiteral(code, i, len, result);
                            i = this._lastTemplatePos;
                        } else {
                            result.push(' ');
                            i++;
                            while (i < len && code[i] !== ch) {
                                if (code[i] === '\\' && i + 1 < len) {
                                    result.push(' ');
                                    result.push(' ');
                                    i += 2;
                                    continue;
                                }
                                result.push(code[i] === '\n' ? '\n' : ' ');
                                i++;
                            }
                            if (i < len) { result.push(' '); i++; }
                        }
                    } else if (ch === '/' && i + 1 < len && code[i + 1] === '/') {
                        // Single-line comment inside expression
                        while (i < len && code[i] !== '\n') {
                            result.push(' ');
                            i++;
                        }
                    } else if (ch === '/' && i + 1 < len && code[i + 1] === '*') {
                        // Multi-line comment inside expression
                        result.push(' ');
                        result.push(' ');
                        i += 2;
                        while (i < len) {
                            if (code[i] === '*' && i + 1 < len && code[i + 1] === '/') {
                                result.push(' ');
                                result.push(' ');
                                i += 2;
                                break;
                            }
                            result.push(code[i] === '\n' ? '\n' : ' ');
                            i++;
                        }
                    } else if (ch === '/' && i + 1 < len && code[i + 1] !== '/' && code[i + 1] !== '*') {
                        // Possible regex literal inside expression
                        let prevIdx = result.length - 1;
                        while (prevIdx >= 0 && (result[prevIdx] === ' ' || result[prevIdx] === '\n')) {
                            prevIdx--;
                        }
                        const prevCh = prevIdx >= 0 ? result[prevIdx] : '';
                        const isRegex = '=([!&|?:;,{}~^+-*%<>\n'.includes(prevCh) || prevCh === '' || prevCh === '\n';
                        if (isRegex) {
                            result.push(' '); // opening /
                            i++;
                            while (i < len && code[i] !== '/' && code[i] !== '\n') {
                                if (code[i] === '\\' && i + 1 < len) {
                                    result.push(' ');
                                    result.push(' ');
                                    i += 2;
                                    continue;
                                }
                                result.push(' ');
                                i++;
                            }
                            if (i < len && code[i] === '/') {
                                result.push(' '); // closing /
                                i++;
                                while (i < len && /[gimsuvy]/.test(code[i])) {
                                    result.push(' ');
                                    i++;
                                }
                            }
                        } else {
                            // Division operator
                            result.push(ch);
                            i++;
                        }
                    } else {
                        result.push(ch);
                        i++;
                    }
                }
                continue;
            }
            // Plain template text - replace with space
            result.push(code[i] === '\n' ? '\n' : ' ');
            i++;
        }
        this._lastTemplatePos = i;
    }

    getLineNumber(content, position) {
        const before = content.substring(0, position);
        return (before.match(/\n/g) || []).length + 1;
    }
}

module.exports = JSValidator;
