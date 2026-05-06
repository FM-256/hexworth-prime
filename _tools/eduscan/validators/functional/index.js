/**
 * EduScan - Functional Validator (Orchestrator)
 *
 * Coordinates browser-based functional validation:
 *   - Runtime checks: Load all HTML pages, capture JS errors/404s/blank screens
 *   - Smoke tests: Verify core systems (XP, achievements, games, gating)
 *
 * This validator runs in a separate phase from static analysis.
 * Requires Puppeteer (headless Chromium).
 */

const path = require('path');
const BrowserPool = require('./browser');
const RuntimeChecker = require('./runtime');
const SmokeTests = require('./smoke');
const SlideOverflowChecker = require('./slide-overflow');

class FunctionalValidator {
    constructor(options = {}) {
        this.rootPath = options.rootPath || './_app';
        this.verbose = options.verbose || false;
        this.smokeOnly = options.smokeOnly || false;
        this.runtimeOnly = options.runtimeOnly || false;
        this.concurrency = options.concurrency || 8;

        this.browserPool = new BrowserPool({
            verbose: this.verbose,
            concurrency: this.concurrency
        });
    }

    /**
     * Run functional validation
     * @param {Array} content - Parsed content files from EduScan pipeline
     * @returns {Object} { issues, summary }
     */
    async validate(content) {
        const startTime = Date.now();
        const allIssues = [];
        let runtimeSummary = { pagesLoaded: 0, pagesWithErrors: 0, totalErrors: 0 };
        let smokeSummary = { total: 0, passed: 0, failed: 0 };

        try {
            // Launch browser
            await this.browserPool.launch();

            // Runtime checks (all HTML pages)
            if (!this.smokeOnly) {
                const htmlFiles = this._getHtmlFiles(content);

                if (this.verbose) {
                    console.log(`[FUNCTIONAL] Runtime checking ${htmlFiles.length} HTML pages...`);
                }

                const runtimeChecker = new RuntimeChecker({
                    browserPool: this.browserPool,
                    rootPath: this.rootPath,
                    verbose: this.verbose,
                    concurrency: this.concurrency
                });

                const runtimeResult = await runtimeChecker.check(htmlFiles);
                allIssues.push(...runtimeResult.issues);
                runtimeSummary = runtimeResult.summary;

                // OVERFLOW-001: slide content overflow detection
                const overflowChecker = new SlideOverflowChecker({
                    browserPool: this.browserPool,
                    rootPath: this.rootPath,
                    verbose: this.verbose
                });
                const overflowResult = await overflowChecker.check(htmlFiles);
                allIssues.push(...overflowResult.issues);
                if (this.verbose) {
                    console.log(`[OVERFLOW] scanned=${overflowResult.summary.scanned} withOverflow=${overflowResult.summary.withOverflow} skipped=${overflowResult.summary.slideStyleSkipped}`);
                }
            }

            // Smoke tests (core systems)
            if (!this.runtimeOnly) {
                if (this.verbose) {
                    console.log('[FUNCTIONAL] Running smoke tests...');
                }

                const smokeTests = new SmokeTests({
                    browserPool: this.browserPool,
                    verbose: this.verbose
                });

                const smokeResult = await smokeTests.run();
                allIssues.push(...smokeResult.issues);
                smokeSummary = smokeResult.summary;
            }

        } finally {
            // Always shut down browser
            await this.browserPool.shutdown();
        }

        return {
            issues: allIssues,
            summary: {
                runtime: runtimeSummary,
                smoke: smokeSummary,
                totalIssues: allIssues.length,
                duration: Date.now() - startTime
            }
        };
    }

    /**
     * Extract HTML file list from parsed content
     * @param {Array} content - Parsed content files
     * @returns {Array} { absolutePath, relativePath } objects
     */
    _getHtmlFiles(content) {
        return content
            .filter(c => c.path && c.path.endsWith('.html'))
            .map(c => ({
                absolutePath: path.resolve(this.rootPath, c.path),
                relativePath: c.path
            }));
    }
}

module.exports = FunctionalValidator;
