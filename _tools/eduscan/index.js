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
const OrphanDetector = require('./validators/orphans');
const SyntaxValidator = require('./validators/syntax');
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
            colors: options.colors !== false,
            orphansOnly: options.orphansOnly || false,
            deepOrphans: options.deepOrphans || false,
            reachabilityMode: options.reachabilityMode || 'links',
            syntaxOnly: options.syntaxOnly || false,
            enableSyntax: options.enableSyntax !== false,  // Syntax validation enabled by default
            syntaxProfile: options.syntaxProfile || 'ci'   // 'ci', 'strict', or 'inventory'
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

        this.orphanDetector = new OrphanDetector({
            rootPath: this.options.path,
            verbose: this.options.verbose,
            deep: this.options.deepOrphans,
            reachabilityMode: this.options.reachabilityMode || 'links'
        });

        this.syntaxValidator = new SyntaxValidator({
            verbose: this.options.verbose,
            rootPath: this.options.path,
            profile: this.options.syntaxProfile
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

        // Phase 4: Orphan Detection
        if (this.options.verbose) {
            console.log('[ORPHAN] Detecting orphaned content...');
        }

        const orphans = this.orphanDetector.detect(content, registry);

        // Merge orphan issues into validation issues
        validation.issues.push(...orphans.issues);

        // Re-sort issues by severity
        validation.issues.sort((a, b) => {
            const order = { critical: 0, high: 1, medium: 2, low: 3, warning: 4, info: 5 };
            return (order[a.severity] || 6) - (order[b.severity] || 6);
        });

        if (this.options.verbose) {
            console.log(`[ORPHAN] Found ${orphans.summary.registryOrphans} registry orphans, ${orphans.summary.filesystemOrphans} filesystem orphans`);
        }

        // Phase 5: Syntax Validation (if enabled)
        let syntax = { issues: [], summary: {} };
        if (this.options.enableSyntax) {
            if (this.options.verbose) {
                console.log('[SYNTAX] Checking for syntax errors...');
            }

            syntax = this.syntaxValidator.validate(content);

            // Merge syntax issues into validation issues
            validation.issues.push(...syntax.issues);

            // Re-sort issues by severity
            validation.issues.sort((a, b) => {
                const order = { critical: 0, high: 1, medium: 2, low: 3, warning: 4, info: 5 };
                return (order[a.severity] || 6) - (order[b.severity] || 6);
            });

            if (this.options.verbose) {
                console.log(`[SYNTAX] Found ${syntax.summary.totalIssues || 0} syntax issues`);
            }
        }

        // Compile results
        const results = {
            hierarchy: scanResult.hierarchy,
            content,
            validation,
            registry,
            orphans,
            syntax,
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
        const registry = this.validator.loadRegistry();
        const validation = this.validator.validate(content);

        // Include orphan detection
        const orphans = this.orphanDetector.detect(content, registry);
        validation.issues.push(...orphans.issues);

        // Include syntax validation if enabled
        if (this.options.enableSyntax) {
            const syntax = this.syntaxValidator.validate(content);
            validation.issues.push(...syntax.issues);
        }

        return validation.issues;
    }

    /**
     * Syntax-only scan - focuses on syntax validation
     * @returns {Object} Syntax validation results
     */
    syntaxScan() {
        const startTime = Date.now();

        if (!this.options.quiet) {
            this.console.printHeader();
            console.log(this.console.c('[SYNTAX]', 'yellow') + ' Running syntax validation scan...\n');
        }

        // Scan and parse files
        const scanResult = this.scanner.scan();
        const content = this.parser.parseAll(scanResult.files);

        // Run syntax validation
        const syntax = this.syntaxValidator.validate(content);

        if (!this.options.quiet) {
            this.printSyntaxSummary(syntax);
        }

        return {
            syntax,
            scanStats: {
                filesScanned: scanResult.stats.filesScanned,
                contentParsed: content.length,
                duration: Date.now() - startTime
            }
        };
    }

    /**
     * Print syntax summary to console
     */
    printSyntaxSummary(syntax) {
        const c = (text, ...colors) => this.console.c(text, ...colors);
        const profile = syntax.summary.profile || this.options.syntaxProfile;
        const profileLabel = {
            ci: 'CI (critical/high only)',
            strict: 'Strict (full coverage)',
            inventory: 'Inventory (stats only)'
        }[profile] || profile;

        console.log(c('─'.repeat(60), 'dim'));
        console.log(c(' SYNTAX VALIDATION RESULTS', 'bright', 'yellow'));
        console.log(c('─'.repeat(60), 'dim'));
        console.log('');

        console.log(c('  Profile:', 'dim') + ` ${profileLabel}`);
        console.log(c('  Files Checked:', 'dim') + ` ${syntax.summary.filesChecked}`);
        console.log('');

        console.log(c('  Issues by Category:', 'bright'));
        if (syntax.summary.htmlErrors > 0) {
            console.log(`    ${c('HTML:', 'red')}    ${syntax.summary.htmlErrors} structural errors`);
        }
        if (syntax.summary.jsErrors > 0) {
            console.log(`    ${c('JS:', 'yellow')}      ${syntax.summary.jsErrors} JavaScript errors`);
        }
        if (syntax.summary.engineErrors > 0) {
            console.log(`    ${c('Engine:', 'cyan')}  ${syntax.summary.engineErrors} missing engines`);
        }
        if (syntax.summary.pathErrors > 0) {
            console.log(`    ${c('Path:', 'magenta')}    ${syntax.summary.pathErrors} broken paths`);
        }

        if (syntax.summary.totalIssues === 0) {
            console.log(`    ${c('None!', 'green')} All syntax checks passed.`);
        }
        console.log('');

        // Show severity breakdown (useful for inventory mode)
        if (syntax.summary.bySeverity && syntax.summary.totalIssues > 0) {
            console.log(c('  Issues by Severity:', 'bright'));
            const sev = syntax.summary.bySeverity;
            if (sev.critical > 0) console.log(`    ${c('CRITICAL:', 'red', 'bright')} ${sev.critical}`);
            if (sev.high > 0) console.log(`    ${c('HIGH:', 'red')}     ${sev.high}`);
            if (sev.medium > 0) console.log(`    ${c('MEDIUM:', 'yellow')}   ${sev.medium}`);
            if (sev.low > 0) console.log(`    ${c('LOW:', 'blue')}      ${sev.low}`);
            console.log('');
        }

        // Show top issues
        if (syntax.issues.length > 0) {
            console.log(c('  Top Issues:', 'dim'));
            for (const issue of syntax.issues.slice(0, 8)) {
                const sevColor = {
                    critical: 'red',
                    high: 'red',
                    medium: 'yellow',
                    low: 'blue'
                }[issue.severity] || 'white';

                console.log(`    ${c('[' + issue.code + ']', sevColor)} ${issue.message}`);
                if (issue.file) {
                    const loc = issue.line ? `:${issue.line}` : '';
                    console.log(c(`        ${issue.file}${loc}`, 'dim'));
                }
            }
            if (syntax.issues.length > 8) {
                console.log(c(`    ... and ${syntax.issues.length - 8} more`, 'dim'));
            }
            console.log('');
        }

        console.log(c('─'.repeat(60), 'dim'));
        console.log('');
    }

    /**
     * Orphan-only scan - focuses on orphan detection
     * @returns {Object} Orphan detection results
     */
    orphanScan() {
        const startTime = Date.now();

        if (!this.options.quiet) {
            this.console.printHeader();
            console.log(this.console.c('[ORPHAN]', 'magenta') + ' Running orphan detection scan...\n');
        }

        // Scan and parse files
        const scanResult = this.scanner.scan();
        const content = this.parser.parseAll(scanResult.files);
        const registry = this.validator.loadRegistry();

        // Run orphan detection
        const orphans = this.orphanDetector.detect(content, registry);

        if (!this.options.quiet) {
            this.printOrphanSummary(orphans);
        }

        return {
            orphans,
            scanStats: {
                filesScanned: scanResult.stats.filesScanned,
                contentParsed: content.length,
                duration: Date.now() - startTime
            }
        };
    }

    /**
     * Print orphan summary to console
     */
    printOrphanSummary(orphans) {
        const c = (text, ...colors) => this.console.c(text, ...colors);

        console.log(c('─'.repeat(60), 'dim'));
        console.log(c(' ORPHAN DETECTION RESULTS', 'bright', 'magenta'));
        console.log(c('─'.repeat(60), 'dim'));
        console.log('');

        // Registry Orphans
        console.log(c('  Registry Orphans (declared but missing):', 'bright'));
        if (orphans.registryOrphans.length === 0) {
            console.log(`    ${c('None', 'green')} - All registry entries have matching files`);
        } else {
            console.log(`    ${c(String(orphans.registryOrphans.length), 'red', 'bright')} ${c('CRITICAL', 'red')} - Files declared but missing on disk`);
            for (const orphan of orphans.registryOrphans.slice(0, 5)) {
                console.log(`      ${c('→', 'red')} ${orphan.entryId}: ${orphan.declaredPath}`);
            }
            if (orphans.registryOrphans.length > 5) {
                console.log(c(`      ... and ${orphans.registryOrphans.length - 5} more`, 'dim'));
            }
        }
        console.log('');

        // Filesystem Orphans
        if (this.options.deepOrphans) {
            console.log(c('  Filesystem Orphans (exist but unreachable):', 'bright'));
            if (orphans.filesystemOrphans.length === 0) {
                console.log(`    ${c('None', 'green')} - All content files are reachable`);
            } else {
                // Group by severity
                const high = orphans.filesystemOrphans.filter(o => o.severity === 'high');
                const medium = orphans.filesystemOrphans.filter(o => o.severity === 'medium');
                const low = orphans.filesystemOrphans.filter(o => o.severity === 'low');

                if (high.length > 0) {
                    console.log(`    ${c(String(high.length), 'red')} HIGH - Live content unreachable`);
                }
                if (medium.length > 0) {
                    console.log(`    ${c(String(medium.length), 'yellow')} MEDIUM - Content unreachable`);
                }
                if (low.length > 0) {
                    console.log(`    ${c(String(low.length), 'blue')} LOW - Archive/draft content`);
                }

                console.log('');
                console.log(c('  Top unreachable files:', 'dim'));
                for (const orphan of orphans.filesystemOrphans.slice(0, 8)) {
                    const sevColor = { high: 'red', medium: 'yellow', low: 'blue' }[orphan.severity];
                    console.log(`    ${c('[' + orphan.severity.toUpperCase() + ']', sevColor)} ${orphan.path}`);
                    if (orphan.nearestParent) {
                        console.log(c(`         nearest index: ${orphan.nearestParent}`, 'dim'));
                    }
                }
                if (orphans.filesystemOrphans.length > 8) {
                    console.log(c(`    ... and ${orphans.filesystemOrphans.length - 8} more`, 'dim'));
                }
            }
            console.log('');

            // Dead Paths
            if (orphans.deadPaths.length > 0) {
                console.log(c('  Dead Paths (unreferenced directories):', 'bright'));
                console.log(`    ${c(String(orphans.deadPaths.length), 'yellow')} directories with no inbound references`);
                for (const deadPath of orphans.deadPaths.slice(0, 3)) {
                    console.log(`      ${c('→', 'yellow')} ${deadPath.directory} (${deadPath.files.length} files)`);
                }
                if (orphans.deadPaths.length > 3) {
                    console.log(c(`      ... and ${orphans.deadPaths.length - 3} more`, 'dim'));
                }
                console.log('');
            }
        } else {
            console.log(c('  Filesystem Orphans: Use --deep for reachability analysis', 'dim'));
            console.log('');
        }

        console.log(c('─'.repeat(60), 'dim'));
        console.log('');
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

    /**
     * Static orphan scan
     */
    static orphanScan(options = {}) {
        const scanner = new EduScan(options);
        return scanner.orphanScan();
    }

    /**
     * Static syntax scan
     */
    static syntaxScan(options = {}) {
        const scanner = new EduScan(options);
        return scanner.syntaxScan();
    }
}

module.exports = EduScan;
