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
const LearningPathsValidator = require('./learning-paths');
const AssignmentLinkValidator = require('./assignment-links');
const NamingValidator = require('./naming');

class SyntaxValidator {
    constructor(options = {}) {
        this.verbose = options.verbose || false;
        this.rootPath = options.rootPath || './_app';
        this.profile = options.profile || 'ci';  // 'ci', 'strict', or 'inventory'

        // Initialize sub-validators with profile
        this.htmlValidator = new HTMLValidator({
            verbose: this.verbose,
            profile: this.profile
        });
        this.jsValidator = new JSValidator({
            verbose: this.verbose,
            profile: this.profile
        });
        this.engineValidator = new EngineValidator({
            verbose: this.verbose,
            rootPath: this.rootPath,
            profile: this.profile
        });
        this.pathValidator = new PathValidator({
            verbose: this.verbose,
            rootPath: this.rootPath,
            profile: this.profile
        });
        this.learningPathsValidator = new LearningPathsValidator({
            verbose: this.verbose,
            rootPath: this.rootPath
        });
        this.assignmentLinkValidator = new AssignmentLinkValidator({
            verbose: this.verbose,
            rootPath: this.rootPath
        });
        this.namingValidator = new NamingValidator({
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
                profile: this.profile,
                filesChecked: 0,
                htmlErrors: 0,
                jsErrors: 0,
                engineErrors: 0,
                pathErrors: 0,
                learningPathErrors: 0,
                assignmentLinkErrors: 0,
                namingErrors: 0,
                // Severity counts (populated at end)
                bySeverity: {
                    critical: 0,
                    high: 0,
                    medium: 0,
                    low: 0
                }
            }
        };

        // Run LearningPaths validation (global, not per-file)
        const lpResults = this.learningPathsValidator.validate();
        if (lpResults.issues.length > 0) {
            results.issues.push(...lpResults.issues);
            results.summary.learningPathErrors = lpResults.issues.length;
            if (this.verbose) {
                console.log(`[SYNTAX] LearningPaths: ${lpResults.issues.length} issues`);
            }
        }

        // Run Assignment Link validation (global, not per-file)
        const alResults = this.assignmentLinkValidator.validate();
        if (alResults.issues.length > 0) {
            results.issues.push(...alResults.issues);
            results.summary.assignmentLinkErrors = alResults.issues.length;
            if (this.verbose) {
                console.log(`[SYNTAX] AssignmentLinks: ${alResults.issues.length} issues`);
            }
        }

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
            const namingIssues = this.namingValidator.validate(fileWithContent);

            // Collect issues
            results.issues.push(...htmlIssues);
            results.issues.push(...jsIssues);
            results.issues.push(...engineIssues);
            results.issues.push(...pathIssues);
            results.issues.push(...namingIssues);

            // Update counts
            results.summary.htmlErrors += htmlIssues.length;
            results.summary.jsErrors += jsIssues.length;
            results.summary.engineErrors += engineIssues.length;
            results.summary.pathErrors += pathIssues.length;
            results.summary.namingErrors += namingIssues.length;
        }

        // Sort by severity
        results.issues.sort((a, b) => {
            const order = { critical: 0, high: 1, medium: 2, low: 3, warning: 4, info: 5 };
            return (order[a.severity] || 6) - (order[b.severity] || 6);
        });

        results.summary.totalIssues = results.issues.length;
        results.summary.duration = Date.now() - startTime;

        // Count by severity
        for (const issue of results.issues) {
            const sev = issue.severity || 'low';
            if (results.summary.bySeverity[sev] !== undefined) {
                results.summary.bySeverity[sev]++;
            }
        }

        if (this.verbose) {
            console.log(`[SYNTAX] Profile: ${this.profile}`);
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
