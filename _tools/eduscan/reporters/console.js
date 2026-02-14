/**
 * EduScan - Console Reporter
 *
 * Generates formatted terminal output with colors and progress.
 */

class ConsoleReporter {
    constructor(options = {}) {
        this.verbose = options.verbose || false;
        this.quiet = options.quiet || false;
        this.useColors = options.colors !== false;
    }

    // ANSI color codes
    colors = {
        reset: '\x1b[0m',
        bright: '\x1b[1m',
        dim: '\x1b[2m',

        red: '\x1b[31m',
        green: '\x1b[32m',
        yellow: '\x1b[33m',
        blue: '\x1b[34m',
        magenta: '\x1b[35m',
        cyan: '\x1b[36m',
        white: '\x1b[37m',

        bgRed: '\x1b[41m',
        bgGreen: '\x1b[42m',
        bgYellow: '\x1b[43m',
        bgBlue: '\x1b[44m'
    };

    /**
     * Apply color to text
     */
    c(text, ...colors) {
        if (!this.useColors) return text;

        const codes = colors.map(c => this.colors[c] || '').join('');
        return `${codes}${text}${this.colors.reset}`;
    }

    /**
     * Print header banner
     */
    printHeader() {
        if (this.quiet) return;

        console.log('');
        console.log(this.c('╔═══════════════════════════════════════════════════════════════╗', 'cyan'));
        console.log(this.c('║', 'cyan') + this.c('                     EDUSCAN v1.4.0                            ', 'bright', 'white') + this.c('║', 'cyan'));
        console.log(this.c('║', 'cyan') + this.c('           Content Topology Scanner for Hexworth Prime         ', 'dim') + this.c('║', 'cyan'));
        console.log(this.c('╚═══════════════════════════════════════════════════════════════╝', 'cyan'));
        console.log('');
    }

    /**
     * Print scan start message
     */
    printScanStart(rootPath) {
        if (this.quiet) return;

        console.log(this.c('[SCAN]', 'blue') + ` Starting scan of: ${this.c(rootPath, 'bright')}`);
    }

    /**
     * Print scan progress
     */
    printProgress(phase, current, total) {
        if (this.quiet) return;

        const percent = Math.round((current / total) * 100);
        const bar = this.progressBar(percent, 20);

        process.stdout.write(`\r${this.c('[' + phase.toUpperCase() + ']', 'blue')} ${bar} ${current}/${total}`);

        if (current === total) {
            console.log(''); // New line when complete
        }
    }

    /**
     * Generate progress bar
     */
    progressBar(percent, width) {
        const filled = Math.round(width * percent / 100);
        const empty = width - filled;

        const filledStr = '█'.repeat(filled);
        const emptyStr = '░'.repeat(empty);

        return this.c(filledStr, 'green') + this.c(emptyStr, 'dim');
    }

    /**
     * Print scan results summary
     */
    printSummary(data) {
        if (this.quiet) return;

        const stats = data.scanStats;
        const content = data.content;
        const issues = data.validation.issues;

        // Count by type
        const quizzes = content.filter(c => c.contentType === 'quiz').length;
        const presentations = content.filter(c => c.contentType === 'presentation').length;
        const labs = content.filter(c => c.contentType === 'lab').length;
        const applets = content.filter(c => c.contentType === 'applet').length;

        // Issue counts by new severity model
        const critical = issues.filter(i => i.severity === 'critical').length;
        const high = issues.filter(i => i.severity === 'high').length;
        const medium = issues.filter(i => i.severity === 'medium').length;
        const low = issues.filter(i => i.severity === 'low').length;
        const suspect = issues.filter(i => i.severity === 'suspect').length;
        const warning = issues.filter(i => i.severity === 'warning').length;
        const autoFixable = issues.filter(i => i.autoFixable).length;

        console.log('');
        console.log(this.c('─'.repeat(60), 'dim'));
        console.log(this.c(' SCAN COMPLETE', 'bright', 'green'));
        console.log(this.c('─'.repeat(60), 'dim'));
        console.log('');

        console.log(this.c('  Files Scanned:', 'dim') + ` ${stats.filesScanned}`);
        console.log(this.c('  Content Found:', 'dim') + ` ${content.length}`);
        console.log('');

        console.log(this.c('  Content Breakdown:', 'bright'));
        console.log(`    Quizzes:       ${this.c(String(quizzes), 'yellow')}`);
        console.log(`    Presentations: ${this.c(String(presentations), 'cyan')}`);
        console.log(`    Labs:          ${this.c(String(labs), 'magenta')}`);
        console.log(`    Applets:       ${this.c(String(applets), 'blue')}`);
        console.log('');

        // ContentCatalog summary
        const catSummary = data.syntax?.summary?.contentCatalog;
        if (catSummary) {
            console.log(this.c('  ContentCatalog:', 'bright'));
            console.log(`    Modules:     ${this.c(String(catSummary.totalModules), 'cyan')} total, ${this.c(String(catSummary.available), 'green')} available`);
            if (catSummary.missingHrefs > 0) {
                console.log(`    Missing:     ${this.c(String(catSummary.missingHrefs), 'red', 'bright')} ${this.c('dead links (CAT-001)', 'dim')}`);
            }
            if (catSummary.undeclared > 0) {
                console.log(`    Undeclared:  ${this.c(String(catSummary.undeclared), 'yellow')} ${this.c('files not in catalog (CAT-002)', 'dim')}`);
            }
            if (catSummary.emptyHrefs > 0) {
                console.log(`    Empty hrefs: ${this.c(String(catSummary.emptyHrefs), 'red')} ${this.c('(CAT-003)', 'dim')}`);
            }
            if (catSummary.missingHrefs === 0 && catSummary.undeclared === 0 && catSummary.emptyHrefs === 0) {
                console.log(`    ${this.c('All hrefs valid', 'green')}`);
            }
            console.log('');
        }

        console.log(this.c('  Issues by Severity:', 'bright'));
        if (critical > 0) {
            console.log(`    ${this.c('CRITICAL:', 'red', 'bright')} ${critical} ${this.c('(breaks sync/grading)', 'dim')}`);
        }
        if (high > 0) {
            console.log(`    ${this.c('HIGH:', 'red')}     ${high} ${this.c('(breaks analytics)', 'dim')}`);
        }
        if (medium > 0) {
            console.log(`    ${this.c('MEDIUM:', 'yellow')}   ${medium} ${this.c('(reporting issues)', 'dim')}`);
        }
        if (low > 0) {
            console.log(`    ${this.c('LOW:', 'blue')}      ${low} ${this.c('(hygiene)', 'dim')}`);
        }
        if (suspect > 0) {
            console.log(`    ${this.c('SUSPECT:', 'magenta')}  ${suspect} ${this.c('(heuristic — needs review)', 'dim')}`);
        }
        if (warning > 0) {
            console.log(`    ${this.c('WARNING:', 'yellow')}  ${warning}`);
        }
        if (issues.length === 0) {
            console.log(`    ${this.c('None!', 'green')} All content properly configured.`);
        }
        if (autoFixable > 0) {
            console.log('');
            console.log(`    ${this.c('Auto-fixable:', 'cyan', 'bright')} ${autoFixable} issues can be fixed automatically`);
        }
        console.log('');

        console.log(this.c('  Sync Status:', 'bright'));
        console.log(`    Ready:     ${this.c(String(data.validation.syncStatus.ready), 'green')}`);
        console.log(`    Not Ready: ${this.c(String(data.validation.syncStatus.notReady), 'red')}`);
        console.log('');

        console.log(this.c(`  Scan Duration: ${stats.duration}ms`, 'dim'));
        console.log('');
    }

    /**
     * Print issues list
     */
    printIssues(issues, limit = 10) {
        if (this.quiet) return;
        if (issues.length === 0) return;

        console.log(this.c('─'.repeat(60), 'dim'));
        console.log(this.c(' TOP ISSUES', 'bright', 'yellow'));
        console.log(this.c('─'.repeat(60), 'dim'));
        console.log('');

        const displayed = issues.slice(0, limit);

        for (const issue of displayed) {
            // Expanded severity colors
            const sevColor = {
                critical: 'red',
                high: 'red',
                medium: 'yellow',
                low: 'blue',
                suspect: 'magenta',
                warning: 'yellow',
                info: 'blue'
            }[issue.severity] || 'white';

            const sevLabel = (issue.severity || 'unknown').toUpperCase();

            console.log(`  ${this.c('[' + issue.code + ']', sevColor, 'bright')} ${this.c(sevLabel, sevColor)} ${issue.message}`);
            if (issue.file) {
                console.log(`    ${this.c('File:', 'dim')} ${issue.file}`);
            }
            if (issue.current && issue.suggested) {
                console.log(`    ${this.c('Current:', 'dim')} ${this.c(issue.current, 'red')}`);
                console.log(`    ${this.c('Suggested:', 'dim')} ${this.c(issue.suggested, 'green', 'bright')}`);
            }
            if (issue.fix) {
                console.log(`    ${this.c('Fix:', 'dim')} ${issue.fix}`);
            }
            if (issue.autoFixable) {
                console.log(`    ${this.c('[Auto-fixable]', 'cyan')}`);
            }
            console.log('');
        }

        if (issues.length > limit) {
            console.log(this.c(`  ... and ${issues.length - limit} more issues. See full report.`, 'dim'));
            console.log('');
        }
    }

    /**
     * Print file output info
     */
    printOutput(jsonResult, mdResult) {
        if (this.quiet) return;

        console.log(this.c('─'.repeat(60), 'dim'));
        console.log(this.c(' REPORTS GENERATED', 'bright', 'cyan'));
        console.log(this.c('─'.repeat(60), 'dim'));
        console.log('');

        if (jsonResult) {
            const sizeKB = Math.round(jsonResult.size / 1024);
            console.log(`  ${this.c('→', 'green')} ${jsonResult.path} (${sizeKB} KB)`);
        }
        if (mdResult) {
            const sizeKB = Math.round(mdResult.size / 1024);
            console.log(`  ${this.c('→', 'green')} ${mdResult.path} (${sizeKB} KB)`);
        }

        console.log('');
    }

    /**
     * Print footer
     */
    printFooter() {
        if (this.quiet) return;

        console.log(this.c('╔═══════════════════════════════════════════════════════════════╗', 'cyan'));
        console.log(this.c('║', 'cyan') + this.c('  SCAN COMPLETE                                                 ', 'green') + this.c('║', 'cyan'));
        console.log(this.c('╚═══════════════════════════════════════════════════════════════╝', 'cyan'));
        console.log('');
    }

    /**
     * Print error
     */
    printError(message) {
        console.error(this.c('[ERROR]', 'red', 'bright') + ' ' + message);
    }

    /**
     * Print warning
     */
    printWarning(message) {
        console.warn(this.c('[WARN]', 'yellow') + ' ' + message);
    }
}

module.exports = ConsoleReporter;
