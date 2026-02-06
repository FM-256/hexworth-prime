/**
 * EduScan - JSON Reporter
 *
 * Generates machine-readable JSON output.
 */

const fs = require('fs');
const path = require('path');

class JSONReporter {
    constructor(options = {}) {
        this.outputDir = options.outputDir || './_tools/reports';
        this.filename = options.filename || 'TREASURE_MAP.json';
        this.pretty = options.pretty !== false;
    }

    /**
     * Generate JSON report
     * @param {Object} data - Scan results
     * @returns {Object} Report object
     */
    generate(data) {
        const report = {
            meta: {
                version: '1.0.0',
                tool: 'EduScan',
                scannedAt: new Date().toISOString(),
                rootPath: data.scanStats.rootPath,
                scanDuration: data.scanStats.duration
            },
            summary: this.generateSummary(data),
            hierarchy: this.simplifyHierarchy(data.hierarchy),
            content: this.formatContent(data.content),
            issues: data.validation.issues,
            registry: {
                loaded: !!data.registry,
                entryCount: data.registry ? data.registry.count : 0,
                unregistered: data.validation.registryGaps.unregistered,
                orphaned: data.validation.registryGaps.orphaned
            },
            syncStatus: data.validation.syncStatus
        };

        return report;
    }

    /**
     * Generate summary statistics
     */
    generateSummary(data) {
        const content = data.content;

        // Count by type
        const byType = {};
        for (const item of content) {
            const type = item.contentType || 'unknown';
            byType[type] = (byType[type] || 0) + 1;
        }

        // Count by house
        const byHouse = {};
        for (const item of content) {
            if (item.house) {
                byHouse[item.house] = (byHouse[item.house] || 0) + 1;
            }
        }

        // Count issues by severity
        const issuesBySeverity = {};
        for (const issue of data.validation.issues) {
            const sev = issue.severity || 'unknown';
            issuesBySeverity[sev] = (issuesBySeverity[sev] || 0) + 1;
        }

        // Calculate coverage
        const trackableContent = content.filter(c =>
            ['quiz', 'presentation', 'lab', 'applet'].includes(c.contentType)
        );
        const registeredCount = trackableContent.length - data.validation.registryGaps.unregistered.length;
        const registryCoverage = trackableContent.length > 0
            ? (registeredCount / trackableContent.length)
            : 1;

        const syncReady = data.validation.syncStatus.ready;
        const syncTotal = syncReady + data.validation.syncStatus.notReady;
        const syncReadyPercent = syncTotal > 0 ? (syncReady / syncTotal) : 1;

        return {
            totalFilesScanned: data.scanStats.filesScanned,
            totalDirsScanned: data.scanStats.dirsScanned,
            contentFiles: content.length,
            byType,
            byHouse,
            registryCoverage: Math.round(registryCoverage * 100) / 100,
            syncReady: Math.round(syncReadyPercent * 100) / 100,
            issueCount: data.validation.issues.length,
            issuesBySeverity
        };
    }

    /**
     * Simplify hierarchy for JSON (remove content)
     */
    simplifyHierarchy(node) {
        if (!node) return null;

        const simplified = {
            name: node.name,
            type: node.type,
            path: node.path
        };

        if (node.dirType) {
            simplified.dirType = node.dirType;
        }

        if (node.type === 'file') {
            simplified.extension = node.extension;
            simplified.size = node.size;
            simplified.lines = node.lines;
        }

        if (node.children && Object.keys(node.children).length > 0) {
            simplified.children = {};
            for (const [name, child] of Object.entries(node.children)) {
                simplified.children[name] = this.simplifyHierarchy(child);
            }
        }

        return simplified;
    }

    /**
     * Format content array for output
     */
    formatContent(content) {
        return content.map(item => ({
            name: item.name,
            path: item.path,
            type: item.contentType,
            subTypes: item.subTypes,
            role: item.role,
            house: item.house,
            title: item.title,
            config: item.config,
            components: item.components,
            syncReady: !item.issues || !item.issues.some(i => i.severity === 'critical'),
            issueCount: item.issues ? item.issues.length : 0,
            issues: item.issues
        }));
    }

    /**
     * Write report to file
     */
    write(report) {
        // Ensure output directory exists
        const absoluteDir = path.resolve(this.outputDir);
        if (!fs.existsSync(absoluteDir)) {
            fs.mkdirSync(absoluteDir, { recursive: true });
        }

        const filePath = path.join(absoluteDir, this.filename);
        const content = this.pretty
            ? JSON.stringify(report, null, 2)
            : JSON.stringify(report);

        fs.writeFileSync(filePath, content, 'utf8');

        return {
            path: filePath,
            size: Buffer.byteLength(content, 'utf8')
        };
    }
}

module.exports = JSONReporter;
