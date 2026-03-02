/**
 * JavaScript Syntax Checker
 *
 * Purpose: Detect JavaScript syntax errors in critical config files
 * Created: December 29, 2025
 * Issue: ISSUE-001-CERT-FILTER-EMPTY
 *
 * Usage (standalone):
 *   node js-syntax-checker.js [file-path]
 *   node js-syntax-checker.js ../config/content-registry.js
 *
 * Usage (programmatic):
 *   const checker = require('./js-syntax-checker.js');
 *   const result = checker.checkFile('/path/to/file.js');
 *   const result = checker.checkSyntax(jsCodeString, 'filename.js');
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

/**
 * Check JavaScript syntax of a string
 * @param {string} code - JavaScript code to check
 * @param {string} filename - Filename for error reporting
 * @returns {object} - { valid: boolean, error: string|null, line: number|null, column: number|null }
 */
function checkSyntax(code, filename = 'unknown.js') {
    const result = {
        valid: true,
        error: null,
        line: null,
        column: null,
        filename: filename,
        context: null
    };

    try {
        // Attempt to compile the script (does not execute it)
        new vm.Script(code, { filename: filename });
    } catch (err) {
        result.valid = false;
        result.error = err.message;

        // Extract line and column from error
        // Error format: "filename:line" or includes stack trace
        const lineMatch = err.stack?.match(/:(\d+)(?::(\d+))?/);
        if (lineMatch) {
            result.line = parseInt(lineMatch[1], 10);
            result.column = lineMatch[2] ? parseInt(lineMatch[2], 10) : null;
        }

        // Get context around the error line
        if (result.line) {
            const lines = code.split('\n');
            const startLine = Math.max(0, result.line - 3);
            const endLine = Math.min(lines.length, result.line + 2);

            result.context = [];
            for (let i = startLine; i < endLine; i++) {
                const lineNum = i + 1;
                const marker = lineNum === result.line ? '>>> ' : '    ';
                result.context.push({
                    lineNumber: lineNum,
                    isErrorLine: lineNum === result.line,
                    content: lines[i],
                    display: `${marker}${lineNum}: ${lines[i]}`
                });
            }
        }
    }

    return result;
}

/**
 * Check JavaScript syntax of a file
 * @param {string} filePath - Path to JavaScript file
 * @returns {object} - Same as checkSyntax, plus filePath
 */
function checkFile(filePath) {
    const absolutePath = path.resolve(filePath);

    // Check file exists
    if (!fs.existsSync(absolutePath)) {
        return {
            valid: false,
            error: `File not found: ${absolutePath}`,
            line: null,
            column: null,
            filename: path.basename(filePath),
            filePath: absolutePath,
            context: null
        };
    }

    // Read file content
    let code;
    try {
        code = fs.readFileSync(absolutePath, 'utf8');
    } catch (err) {
        return {
            valid: false,
            error: `Cannot read file: ${err.message}`,
            line: null,
            column: null,
            filename: path.basename(filePath),
            filePath: absolutePath,
            context: null
        };
    }

    // Check syntax
    const result = checkSyntax(code, path.basename(filePath));
    result.filePath = absolutePath;
    result.fileSize = code.length;
    result.lineCount = code.split('\n').length;

    return result;
}

/**
 * Check multiple files
 * @param {string[]} filePaths - Array of file paths
 * @returns {object[]} - Array of results
 */
function checkFiles(filePaths) {
    return filePaths.map(fp => checkFile(fp));
}

/**
 * Format result for console output
 * @param {object} result - Result from checkSyntax or checkFile
 * @returns {string} - Formatted string
 */
function formatResult(result) {
    const lines = [];

    if (result.valid) {
        lines.push(`<img src="/assets/images/icons/icon-checkbox.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle"> VALID: ${result.filename || result.filePath}`);
        if (result.lineCount) {
            lines.push(`   ${result.lineCount} lines, ${result.fileSize} bytes`);
        }
    } else {
        lines.push(`<img src="/assets/images/icons/icon-crossmark.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle"> SYNTAX ERROR: ${result.filename || result.filePath}`);
        lines.push(`   Error: ${result.error}`);

        if (result.line) {
            lines.push(`   Location: Line ${result.line}${result.column ? `, Column ${result.column}` : ''}`);
        }

        if (result.context && result.context.length > 0) {
            lines.push('');
            lines.push('   Context:');
            result.context.forEach(ctx => {
                lines.push(`   ${ctx.display}`);
            });
        }
    }

    return lines.join('\n');
}

/**
 * Get result as audit-tool compatible object
 * @param {object} result - Result from checkFile
 * @returns {object} - Audit-compatible format
 */
function toAuditFormat(result) {
    if (result.valid) {
        return {
            status: 'pass',
            check: 'js-syntax',
            file: result.filePath || result.filename,
            message: 'JavaScript syntax valid'
        };
    } else {
        return {
            status: 'fail',
            check: 'js-syntax',
            file: result.filePath || result.filename,
            message: result.error,
            line: result.line,
            column: result.column,
            context: result.context,
            fix: {
                action: 'Review and fix syntax error',
                location: result.line ? `Line ${result.line}` : 'Unknown',
                diagnosis: result.error
            }
        };
    }
}

// CLI execution
if (require.main === module) {
    const args = process.argv.slice(2);

    if (args.length === 0) {
        // Default: check content-registry.js
        const defaultFile = path.join(__dirname, '..', 'config', 'content-registry.js');
        console.log('No file specified. Checking default: content-registry.js\n');
        const result = checkFile(defaultFile);
        console.log(formatResult(result));
        process.exit(result.valid ? 0 : 1);
    } else {
        // Check specified file(s)
        let hasErrors = false;
        args.forEach(filePath => {
            const result = checkFile(filePath);
            console.log(formatResult(result));
            console.log('');
            if (!result.valid) hasErrors = true;
        });
        process.exit(hasErrors ? 1 : 0);
    }
}

// Export for programmatic use
module.exports = {
    checkSyntax,
    checkFile,
    checkFiles,
    formatResult,
    toAuditFormat
};
