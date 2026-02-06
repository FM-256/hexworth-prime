/**
 * EduScan - JavaScript Syntax Validator
 *
 * Detects JS syntax errors in <script> blocks that would cause blank screens.
 * Uses lightweight pattern matching (no external dependencies like acorn).
 */

class JSValidator {
    constructor(options = {}) {
        this.verbose = options.verbose || false;
    }

    /**
     * Validate JavaScript in <script> blocks
     * @param {Object} file - Parsed file object with content
     * @returns {Array} Issues found
     */
    validate(file) {
        const issues = [];
        const content = file.content;

        // Extract all script blocks
        const scriptBlocks = this.extractScriptBlocks(content);

        for (const block of scriptBlocks) {
            // Skip external scripts
            if (block.src) {
                continue;
            }

            // Run syntax checks
            issues.push(...this.checkBracketBalance(file, block));
            issues.push(...this.checkStringQuotes(file, block));
            issues.push(...this.checkCommonErrors(file, block));
            issues.push(...this.checkSyntaxPatterns(file, block));
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

            // Check for src attribute
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
     * Check bracket/brace/paren balance
     */
    checkBracketBalance(file, block) {
        const issues = [];
        const code = this.stripStringsAndComments(block.code);

        const pairs = {
            '(': { close: ')', name: 'parenthesis', stack: [] },
            '{': { close: '}', name: 'brace', stack: [] },
            '[': { close: ']', name: 'bracket', stack: [] }
        };

        const closers = { ')': '(', '}': '{', ']': '[' };
        let lineOffset = 0;

        for (let i = 0; i < code.length; i++) {
            const char = code[i];

            if (char === '\n') {
                lineOffset++;
                continue;
            }

            // Opening bracket
            if (pairs[char]) {
                pairs[char].stack.push({
                    position: i,
                    line: block.line + lineOffset
                });
            }

            // Closing bracket
            if (closers[char]) {
                const opener = closers[char];
                if (pairs[opener].stack.length === 0) {
                    issues.push({
                        code: 'JS-001',
                        severity: 'high',
                        category: 'syntax',
                        message: `Unexpected closing ${pairs[opener].name} '${char}'`,
                        file: file.path,
                        line: block.line + lineOffset,
                        fix: `Remove extra '${char}' or add matching '${opener}'`
                    });
                } else {
                    pairs[opener].stack.pop();
                }
            }
        }

        // Check for unclosed brackets
        for (const [open, info] of Object.entries(pairs)) {
            for (const unclosed of info.stack) {
                issues.push({
                    code: 'JS-002',
                    severity: 'high',
                    category: 'syntax',
                    message: `Unclosed ${info.name} '${open}'`,
                    file: file.path,
                    line: unclosed.line,
                    fix: `Add closing '${info.close}'`
                });
            }
        }

        return issues;
    }

    /**
     * Check for string quote issues
     */
    checkStringQuotes(file, block) {
        const issues = [];
        const code = block.code;

        // Check for unclosed strings
        const lines = code.split('\n');

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const lineNum = block.line + i;

            // Skip lines that look like they continue (template literals, etc.)
            if (line.trim().endsWith('\\')) {
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

                if (!inString && (char === '"' || char === "'" || char === '`')) {
                    inString = true;
                    stringChar = char;
                } else if (inString && char === stringChar) {
                    inString = false;
                    stringChar = null;
                }
            }

            // If we end a line inside a regular string (not template literal)
            if (inString && stringChar !== '`') {
                // Check if next line starts continuing it
                const nextLine = lines[i + 1];
                if (!nextLine || !this.looksContinued(nextLine, stringChar)) {
                    issues.push({
                        code: 'JS-003',
                        severity: 'high',
                        category: 'syntax',
                        message: `Unterminated string literal`,
                        file: file.path,
                        line: lineNum,
                        fix: `Close the string with ${stringChar} or use template literal`
                    });
                }
            }
        }

        return issues;
    }

    /**
     * Check for common JavaScript errors
     */
    checkCommonErrors(file, block) {
        const issues = [];
        const code = block.code;
        const lines = code.split('\n');

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const lineNum = block.line + i;
            const trimmed = line.trim();

            // Skip comments
            if (trimmed.startsWith('//') || trimmed.startsWith('/*')) {
                continue;
            }

            // Check for = in conditions (common typo for ==)
            const assignInCondition = /\bif\s*\([^)]*[^=!<>]=[^=]/g;
            if (assignInCondition.test(line)) {
                issues.push({
                    code: 'JS-004',
                    severity: 'medium',
                    category: 'syntax',
                    message: 'Possible assignment (=) in condition instead of comparison (== or ===)',
                    file: file.path,
                    line: lineNum,
                    fix: 'Use == or === for comparison'
                });
            }

            // Check for missing semicolons before keywords (can cause issues)
            if (i > 0) {
                const prevLine = lines[i - 1].trim();
                if (prevLine && !prevLine.endsWith(';') && !prevLine.endsWith('{') &&
                    !prevLine.endsWith(',') && !prevLine.endsWith(':') &&
                    !prevLine.endsWith('(') && !prevLine.startsWith('//') &&
                    !prevLine.startsWith('*') && !prevLine.endsWith('*/')) {

                    // Check if current line starts with something that could cause ASI issues
                    if (/^[\[(]/.test(trimmed)) {
                        issues.push({
                            code: 'JS-005',
                            severity: 'low',
                            category: 'syntax',
                            message: 'Line starts with [ or ( which can cause ASI issues',
                            file: file.path,
                            line: lineNum,
                            fix: 'Add semicolon to previous line'
                        });
                    }
                }
            }

            // Check for trailing comma before closing bracket (old IE issue, rare now)
            if (/,\s*[}\]]/.test(line) && !line.includes('...')) {
                // Only warn for obvious object/array literals, not destructuring
                const isDestructuring = /^\s*(const|let|var|function)\s/.test(lines.slice(Math.max(0, i - 5), i).join('\n'));
                if (!isDestructuring) {
                    issues.push({
                        code: 'JS-006',
                        severity: 'info',
                        category: 'syntax',
                        message: 'Trailing comma before closing bracket',
                        file: file.path,
                        line: lineNum,
                        fix: 'Remove trailing comma (or ignore if ES5+ target)'
                    });
                }
            }
        }

        return issues;
    }

    /**
     * Check for syntax patterns that indicate errors
     */
    checkSyntaxPatterns(file, block) {
        const issues = [];
        const code = block.code;

        // Check for double operators (typos)
        const doubleOps = /([+\-*/%])\1{2,}|([&|])\2{3,}/g;
        let match;

        while ((match = doubleOps.exec(code)) !== null) {
            const line = this.getLineNumber(code, match.index) + block.line - 1;
            issues.push({
                code: 'JS-007',
                severity: 'high',
                category: 'syntax',
                message: `Suspicious repeated operator: ${match[0]}`,
                file: file.path,
                line,
                fix: 'Check operator usage'
            });
        }

        // Check for function calls without ()
        const funcNoParens = /\b(alert|console\.log|parseInt|parseFloat)\b(?!\s*\()/g;
        while ((match = funcNoParens.exec(code)) !== null) {
            // Skip if it's a property access or method reference
            const after = code.substring(match.index + match[0].length, match.index + match[0].length + 10);
            if (!/^\s*[,;)\]}]/.test(after)) {
                continue;
            }

            const line = this.getLineNumber(code, match.index) + block.line - 1;
            issues.push({
                code: 'JS-008',
                severity: 'medium',
                category: 'syntax',
                message: `Function ${match[1]} referenced without calling it`,
                file: file.path,
                line,
                fix: `Add () to call the function: ${match[1]}()`
            });
        }

        // Check for invalid regex
        const regexPattern = /\/(?![*\/])([^\/\n]+)\/([gimsuvy]*)/g;
        while ((match = regexPattern.exec(code)) !== null) {
            try {
                new RegExp(match[1], match[2]);
            } catch (e) {
                const line = this.getLineNumber(code, match.index) + block.line - 1;
                issues.push({
                    code: 'JS-009',
                    severity: 'high',
                    category: 'syntax',
                    message: `Invalid regular expression: ${e.message}`,
                    file: file.path,
                    line,
                    fix: 'Fix the regular expression syntax'
                });
            }
        }

        return issues;
    }

    /**
     * Strip strings and comments from code for bracket matching
     */
    stripStringsAndComments(code) {
        // Remove single-line comments
        let result = code.replace(/\/\/.*$/gm, '');

        // Remove multi-line comments
        result = result.replace(/\/\*[\s\S]*?\*\//g, '');

        // Replace string contents with spaces (preserve structure)
        result = result.replace(/"(?:[^"\\]|\\.)*"/g, match => ' '.repeat(match.length));
        result = result.replace(/'(?:[^'\\]|\\.)*'/g, match => ' '.repeat(match.length));
        result = result.replace(/`(?:[^`\\]|\\.)*`/g, match => ' '.repeat(match.length));

        return result;
    }

    /**
     * Check if a line looks like it continues a string from previous line
     */
    looksContinued(line, quoteChar) {
        const trimmed = line.trim();
        // Template literal continuation
        if (quoteChar === '`') {
            return true;
        }
        // Ends with string concatenation
        if (trimmed.startsWith('+') || trimmed.startsWith(quoteChar)) {
            return true;
        }
        return false;
    }

    /**
     * Get line number for a position in content
     */
    getLineNumber(content, position) {
        const before = content.substring(0, position);
        return (before.match(/\n/g) || []).length + 1;
    }
}

module.exports = JSValidator;
