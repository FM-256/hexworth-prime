/**
 * EduScan - Drift Tracker
 *
 * Compares current scan against previous scan to detect:
 * - New issues (regressions)
 * - Fixed issues (improvements)
 * - Unchanged issues
 * - Trend over time
 */

const fs = require('fs');
const path = require('path');

class DriftTracker {
    constructor(options = {}) {
        this.historyDir = options.historyDir || './_tools/reports/history';
        this.currentReportPath = options.currentReportPath || './_tools/reports/TREASURE_MAP.json';
    }

    /**
     * Compare current scan against previous
     * @param {Object} currentReport - Current scan results
     * @param {Object} previousReport - Previous scan results (or null to load from file)
     * @returns {Object} Drift analysis
     */
    compare(currentReport, previousReport = null) {
        // Load previous report if not provided
        if (!previousReport) {
            previousReport = this.loadPreviousReport();
        }

        if (!previousReport) {
            return {
                hasPrevious: false,
                message: 'No previous scan to compare against',
                isFirstScan: true
            };
        }

        const current = this.extractIssueSet(currentReport);
        const previous = this.extractIssueSet(previousReport);

        // Find new issues (regressions)
        const newIssues = current.issues.filter(ci =>
            !previous.issues.some(pi => this.issueMatches(ci, pi))
        );

        // Find fixed issues (improvements)
        const fixedIssues = previous.issues.filter(pi =>
            !current.issues.some(ci => this.issueMatches(ci, pi))
        );

        // Find unchanged issues
        const unchangedIssues = current.issues.filter(ci =>
            previous.issues.some(pi => this.issueMatches(ci, pi))
        );

        // Calculate trends
        const trend = {
            issuesDelta: current.totalIssues - previous.totalIssues,
            criticalDelta: current.critical - previous.critical,
            syncReadyDelta: current.syncReady - previous.syncReady,
            direction: this.calculateDirection(current, previous)
        };

        return {
            hasPrevious: true,
            previousScanDate: previousReport.meta?.scannedAt,
            currentScanDate: currentReport.meta?.scannedAt,

            summary: {
                previous: {
                    totalIssues: previous.totalIssues,
                    critical: previous.critical,
                    syncReady: previous.syncReady
                },
                current: {
                    totalIssues: current.totalIssues,
                    critical: current.critical,
                    syncReady: current.syncReady
                }
            },

            newIssues,
            fixedIssues,
            unchangedIssues,
            trend,

            regressionCount: newIssues.length,
            improvementCount: fixedIssues.length
        };
    }

    /**
     * Extract comparable issue set from report
     */
    extractIssueSet(report) {
        const issues = report.issues || [];

        return {
            issues: issues.map(i => ({
                code: i.code,
                file: i.file,
                message: i.message,
                severity: i.severity,
                current: i.current,
                suggested: i.suggested
            })),
            totalIssues: issues.length,
            critical: issues.filter(i => i.severity === 'critical').length,
            high: issues.filter(i => i.severity === 'high').length,
            syncReady: report.syncStatus?.ready || 0
        };
    }

    /**
     * Check if two issues match (same issue)
     */
    issueMatches(a, b) {
        // Same code + same file = same issue
        return a.code === b.code && a.file === b.file;
    }

    /**
     * Calculate overall direction (improving, regressing, stable)
     */
    calculateDirection(current, previous) {
        const criticalChange = current.critical - previous.critical;
        const totalChange = current.totalIssues - previous.totalIssues;

        if (criticalChange < 0 || (criticalChange === 0 && totalChange < 0)) {
            return 'improving';
        }
        if (criticalChange > 0 || totalChange > 5) {
            return 'regressing';
        }
        return 'stable';
    }

    /**
     * Load previous report from history
     */
    loadPreviousReport() {
        // First check for latest in history
        const historyPath = path.resolve(this.historyDir);
        if (fs.existsSync(historyPath)) {
            const files = fs.readdirSync(historyPath)
                .filter(f => f.endsWith('.json'))
                .sort()
                .reverse();

            if (files.length > 0) {
                const latestPath = path.join(historyPath, files[0]);
                try {
                    return JSON.parse(fs.readFileSync(latestPath, 'utf8'));
                } catch (e) {
                    console.warn(`Failed to load history file: ${e.message}`);
                }
            }
        }

        // Fall back to current report as "previous" (first run after history enabled)
        const currentPath = path.resolve(this.currentReportPath);
        if (fs.existsSync(currentPath)) {
            try {
                return JSON.parse(fs.readFileSync(currentPath, 'utf8'));
            } catch (e) {
                console.warn(`Failed to load current report: ${e.message}`);
            }
        }

        return null;
    }

    /**
     * Archive current report to history
     */
    archiveReport(report) {
        const historyPath = path.resolve(this.historyDir);

        // Ensure history directory exists
        if (!fs.existsSync(historyPath)) {
            fs.mkdirSync(historyPath, { recursive: true });
        }

        // Generate filename with timestamp
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
        const filename = `scan-${timestamp}.json`;
        const filepath = path.join(historyPath, filename);

        fs.writeFileSync(filepath, JSON.stringify(report, null, 2), 'utf8');

        // Keep only last 30 reports
        this.pruneHistory(30);

        return filepath;
    }

    /**
     * Prune old history files
     */
    pruneHistory(keepCount) {
        const historyPath = path.resolve(this.historyDir);
        if (!fs.existsSync(historyPath)) return;

        const files = fs.readdirSync(historyPath)
            .filter(f => f.endsWith('.json'))
            .sort()
            .reverse();

        if (files.length > keepCount) {
            const toDelete = files.slice(keepCount);
            for (const file of toDelete) {
                fs.unlinkSync(path.join(historyPath, file));
            }
        }
    }

    /**
     * Format drift report for console
     */
    formatForConsole(drift, colors) {
        const c = colors || ((text) => text);

        if (!drift.hasPrevious) {
            return c('  First scan - no previous data to compare', 'dim');
        }

        let output = '';

        // Header
        output += c('─'.repeat(60), 'dim') + '\n';
        output += c(' DRIFT ANALYSIS', 'bright', 'magenta') + '\n';
        output += c('─'.repeat(60), 'dim') + '\n\n';

        // Direction indicator
        const directionIcon = {
            improving: c('↑ IMPROVING', 'green', 'bright'),
            regressing: c('↓ REGRESSING', 'red', 'bright'),
            stable: c('→ STABLE', 'yellow')
        }[drift.trend.direction];

        output += `  Trend: ${directionIcon}\n\n`;

        // Summary comparison
        output += `  Issues:     ${drift.summary.previous.totalIssues} → ${drift.summary.current.totalIssues}`;
        output += ` (${drift.trend.issuesDelta >= 0 ? '+' : ''}${drift.trend.issuesDelta})\n`;

        output += `  Critical:   ${drift.summary.previous.critical} → ${drift.summary.current.critical}`;
        output += ` (${drift.trend.criticalDelta >= 0 ? '+' : ''}${drift.trend.criticalDelta})\n`;

        output += `  Sync Ready: ${drift.summary.previous.syncReady} → ${drift.summary.current.syncReady}`;
        output += ` (${drift.trend.syncReadyDelta >= 0 ? '+' : ''}${drift.trend.syncReadyDelta})\n\n`;

        // New issues (regressions)
        if (drift.newIssues.length > 0) {
            output += c(`  NEW ISSUES (${drift.newIssues.length}):\n`, 'red', 'bright');
            for (const issue of drift.newIssues.slice(0, 5)) {
                output += `    ${c('[' + issue.code + ']', 'red')} ${issue.file}\n`;
            }
            if (drift.newIssues.length > 5) {
                output += c(`    ... and ${drift.newIssues.length - 5} more\n`, 'dim');
            }
            output += '\n';
        }

        // Fixed issues (improvements)
        if (drift.fixedIssues.length > 0) {
            output += c(`  FIXED ISSUES (${drift.fixedIssues.length}):\n`, 'green', 'bright');
            for (const issue of drift.fixedIssues.slice(0, 5)) {
                output += `    ${c('[' + issue.code + ']', 'green')} ${issue.file}\n`;
            }
            if (drift.fixedIssues.length > 5) {
                output += c(`    ... and ${drift.fixedIssues.length - 5} more\n`, 'dim');
            }
            output += '\n';
        }

        return output;
    }
}

module.exports = DriftTracker;
