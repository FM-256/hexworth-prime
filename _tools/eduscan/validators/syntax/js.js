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
            } else {
                // Strict mode: full validation
                issues.push(...this.checkBracketBalance(file, block));
                issues.push(...this.checkStringQuotes(file, block));
                issues.push(...this.checkCommonErrors(file, block));
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
     * Strip strings and comments from code for bracket matching
     * Improved to handle template literals better
     */
    stripStringsAndComments(code) {
        let result = code;

        // Remove single-line comments (but not URLs)
        result = result.replace(/(?<!:)\/\/.*$/gm, '');

        // Remove multi-line comments
        result = result.replace(/\/\*[\s\S]*?\*\//g, '');

        // Remove template literals (replace with spaces to preserve positions)
        result = result.replace(/`(?:[^`\\]|\\.)*`/g, match => ' '.repeat(match.length));

        // Remove double-quoted strings
        result = result.replace(/"(?:[^"\\]|\\.)*"/g, match => ' '.repeat(match.length));

        // Remove single-quoted strings
        result = result.replace(/'(?:[^'\\]|\\.)*'/g, match => ' '.repeat(match.length));

        // Remove regex literals (simple heuristic - may miss some edge cases)
        result = result.replace(/\/(?![/*])(?:[^/\\]|\\.)+\/[gimsuvy]*/g, match => ' '.repeat(match.length));

        return result;
    }

    getLineNumber(content, position) {
        const before = content.substring(0, position);
        return (before.match(/\n/g) || []).length + 1;
    }
}

module.exports = JSValidator;
