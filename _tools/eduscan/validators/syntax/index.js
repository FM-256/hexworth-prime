/**
 * EduScan - Syntax Validator Orchestrator
 *
 * Coordinates syntax validation across HTML, JS, engines, and paths.
 * Designed to catch "blank screen" failures before students see them.
 */

const fs = require('fs');
const path = require('path');
const HTMLValidator = require('./html');
const JSValidator = require('./js');
const EngineValidator = require('./engine');
const PathValidator = require('./paths');

class SyntaxValidator {
    constructor(options = {}) {
        this.verbose = options.verbose || false;
        this.rootPath = options.rootPath || './_app';

        // Initialize sub-validators
        this.htmlValidator = new HTMLValidator({ verbose: this.verbose });
        this.jsValidator = new JSValidator({ verbose: this.verbose });
        this.engineValidator = new EngineValidator({
            verbose: this.verbose,
            rootPath: this.rootPath
        });
        this.pathValidator = new PathValidator({
            verbose: this.verbose,
            rootPath: this.rootPath
        });
    }

    /**
     * Validate all content files for syntax issues
     * @param {Array} contentFiles - Parsed content from scanner (without raw content)
     * @returns {Object} Validation results
     */
    validate(contentFiles) {
        const startTime = Date.now();

        const results = {
            issues: [],
            summary: {
                filesChecked: 0,
                htmlErrors: 0,
                jsErrors: 0,
                engineErrors: 0,
                pathErrors: 0
            }
        };

        for (const file of contentFiles) {
            // Only validate HTML files
            if (!file.path.endsWith('.html')) {
                continue;
            }

            // Load file content if not present (parser strips it for memory)
            let content = file.content;
            if (!content) {
                content = this.loadFileContent(file.path);
                if (!content) continue;
            }

            const fileWithContent = { ...file, content };
            results.summary.filesChecked++;

            // Run all validators
            const htmlIssues = this.htmlValidator.validate(fileWithContent);
            const jsIssues = this.jsValidator.validate(fileWithContent);
            const engineIssues = this.engineValidator.validate(fileWithContent);
            const pathIssues = this.pathValidator.validate(fileWithContent);

            // Collect issues
            results.issues.push(...htmlIssues);
            results.issues.push(...jsIssues);
            results.issues.push(...engineIssues);
            results.issues.push(...pathIssues);

            // Update counts
            results.summary.htmlErrors += htmlIssues.length;
            results.summary.jsErrors += jsIssues.length;
            results.summary.engineErrors += engineIssues.length;
            results.summary.pathErrors += pathIssues.length;
        }

        // Sort by severity
        results.issues.sort((a, b) => {
            const order = { critical: 0, high: 1, medium: 2, low: 3, warning: 4, info: 5 };
            return (order[a.severity] || 6) - (order[b.severity] || 6);
        });

        results.summary.totalIssues = results.issues.length;
        results.summary.duration = Date.now() - startTime;

        if (this.verbose) {
            console.log(`[SYNTAX] Checked ${results.summary.filesChecked} files in ${results.summary.duration}ms`);
            console.log(`[SYNTAX] Found ${results.summary.totalIssues} syntax issues`);
        }

        return results;
    }

    /**
     * Load file content from disk
     * @param {string} filePath - Relative path to file (relative to rootPath)
     * @returns {string|null} File content or null if failed
     */
    loadFileContent(filePath) {
        // Handle both relative and absolute paths
        let absolutePath = filePath;
        if (!path.isAbsolute(filePath)) {
            // Paths from parser are relative to rootPath (e.g., 'houses/web/...')
            absolutePath = path.resolve(this.rootPath, filePath);
        }

        try {
            return fs.readFileSync(absolutePath, 'utf8');
        } catch (err) {
            if (this.verbose) {
                console.warn(`[SYNTAX] Cannot read file: ${absolutePath}`);
            }
            return null;
        }
    }

    /**
     * Quick validation of a single file
     * @param {Object} file - Parsed file object
     * @returns {Array} Issues found
     */
    validateFile(file) {
        if (!file.path.endsWith('.html')) {
            return [];
        }

        // Load content if needed
        let content = file.content;
        if (!content) {
            content = this.loadFileContent(file.path);
            if (!content) return [];
        }

        const fileWithContent = { ...file, content };

        return [
            ...this.htmlValidator.validate(fileWithContent),
            ...this.jsValidator.validate(fileWithContent),
            ...this.engineValidator.validate(fileWithContent),
            ...this.pathValidator.validate(fileWithContent)
        ];
    }
}

module.exports = SyntaxValidator;
