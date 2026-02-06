/**
 * EduScan - Content Topology Scanner for Educational Platforms
 *
 * Main entry point that orchestrates scanning, parsing, validation, and reporting.
 *
 * Usage:
 *   const EduScan = require('./eduscan');
 *   const results = EduScan.scan({ path: './_app', verbose: true });
 */

const Scanner = require('./scanner');
const ParserOrchestrator = require('./parsers');
const ValidatorOrchestrator = require('./validators');
const JSONReporter = require('./reporters/json');
const MarkdownReporter = require('./reporters/markdown');
const ConsoleReporter = require('./reporters/console');

class EduScan {
    constructor(options = {}) {
        this.options = {
            path: options.path || './_app',
            outputDir: options.outputDir || './_tools/reports',
            verbose: options.verbose || false,
            quiet: options.quiet || false,
            format: options.format || 'both', // 'json', 'md', 'both'
            issuesOnly: options.issuesOnly || false,
            registryPath: options.registryPath || './_app/config/content-registry.js',
            colors: options.colors !== false
        };

        // Initialize components
        this.scanner = new Scanner({
            rootPath: this.options.path,
            verbose: this.options.verbose
        });

        this.parser = new ParserOrchestrator({
            verbose: this.options.verbose
        });

        this.validator = new ValidatorOrchestrator({
            verbose: this.options.verbose,
            registryPath: this.options.registryPath
        });

        this.console = new ConsoleReporter({
            verbose: this.options.verbose,
            quiet: this.options.quiet,
            colors: this.options.colors
        });

        this.jsonReporter = new JSONReporter({
            outputDir: this.options.outputDir
        });

        this.markdownReporter = new MarkdownReporter({
            outputDir: this.options.outputDir
        });
    }

    /**
     * Run the full scan
     * @returns {Object} Scan results
     */
    scan() {
        const startTime = Date.now();

        // Print header
        this.console.printHeader();
        this.console.printScanStart(this.options.path);

        // Phase 1: Scan file system
        if (this.options.verbose) {
            console.log('[SCAN] Discovering files...');
        }

        let scanResult;
        try {
            scanResult = this.scanner.scan();
        } catch (err) {
            this.console.printError(`Scan failed: ${err.message}`);
            throw err;
        }

        if (this.options.verbose) {
            console.log(`[SCAN] Found ${scanResult.stats.filesScanned} files`);
        }

        // Phase 2: Parse content files
        if (this.options.verbose) {
            console.log('[PARSE] Analyzing content files...');
        }

        const content = this.parser.parseAll(scanResult.files);

        if (this.options.verbose) {
            console.log(`[PARSE] Parsed ${content.length} content files`);
        }

        // Phase 3: Load registry and validate
        if (this.options.verbose) {
            console.log('[VALIDATE] Cross-referencing registry...');
        }

        const registry = this.validator.loadRegistry();
        const validation = this.validator.validate(content);

        if (this.options.verbose) {
            console.log(`[VALIDATE] Found ${validation.issues.length} issues`);
        }

        // Compile results
        const results = {
            hierarchy: scanResult.hierarchy,
            content,
            validation,
            registry,
            scanStats: {
                ...scanResult.stats,
                totalDuration: Date.now() - startTime
            }
        };

        // Phase 4: Generate reports
        let jsonResult = null;
        let mdResult = null;

        if (!this.options.issuesOnly) {
            if (this.options.verbose) {
                console.log('[REPORT] Generating reports...');
            }

            if (this.options.format === 'json' || this.options.format === 'both') {
                const jsonReport = this.jsonReporter.generate(results);
                jsonResult = this.jsonReporter.write(jsonReport);
            }

            if (this.options.format === 'md' || this.options.format === 'both') {
                const mdReport = this.markdownReporter.generate(results);
                mdResult = this.markdownReporter.write(mdReport);
            }
        }

        // Print summary
        this.console.printSummary(results);
        this.console.printIssues(validation.issues);

        if (jsonResult || mdResult) {
            this.console.printOutput(jsonResult, mdResult);
        }

        this.console.printFooter();

        return {
            ...results,
            reports: {
                json: jsonResult,
                markdown: mdResult
            }
        };
    }

    /**
     * Quick scan - returns only issues
     * @returns {Array} Issues array
     */
    quickScan() {
        this.options.issuesOnly = true;
        this.options.quiet = true;

        const scanResult = this.scanner.scan();
        const content = this.parser.parseAll(scanResult.files);
        this.validator.loadRegistry();
        const validation = this.validator.validate(content);

        return validation.issues;
    }

    /**
     * Static convenience method
     */
    static scan(options = {}) {
        const scanner = new EduScan(options);
        return scanner.scan();
    }

    /**
     * Static quick scan
     */
    static quickScan(options = {}) {
        const scanner = new EduScan(options);
        return scanner.quickScan();
    }
}

module.exports = EduScan;
