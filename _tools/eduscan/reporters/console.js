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
        console.log(this.c('║', 'cyan') + this.c('                     EDUSCAN v1.0.0                            ', 'bright', 'white') + this.c('║', 'cyan'));
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

        // Issue counts
        const critical = issues.filter(i => i.severity === 'critical').length;
        const warning = issues.filter(i => i.severity === 'warning').length;

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

        console.log(this.c('  Issues:', 'bright'));
        if (critical > 0) {
            console.log(`    ${this.c('Critical:', 'red', 'bright')} ${critical}`);
        }
        if (warning > 0) {
            console.log(`    ${this.c('Warning:', 'yellow')}  ${warning}`);
        }
        if (issues.length === 0) {
            console.log(`    ${this.c('None!', 'green')} All content properly configured.`);
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
            const sevColor = {
                critical: 'red',
                warning: 'yellow',
                info: 'blue'
            }[issue.severity] || 'white';

            console.log(`  ${this.c('[' + issue.code + ']', sevColor, 'bright')} ${issue.message}`);
            if (issue.file) {
                console.log(`    ${this.c('File:', 'dim')} ${issue.file}`);
            }
            if (issue.fix) {
                console.log(`    ${this.c('Fix:', 'dim')} ${issue.fix}`);
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
