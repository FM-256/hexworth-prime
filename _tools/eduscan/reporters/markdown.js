/**
 * EduScan - Markdown Reporter
 *
 * Generates human-readable Markdown output.
 */

const fs = require('fs');
const path = require('path');

class MarkdownReporter {
    constructor(options = {}) {
        this.outputDir = options.outputDir || './_tools/reports';
        this.filename = options.filename || 'TREASURE_MAP.md';
    }

    /**
     * Generate Markdown report
     * @param {Object} data - Scan results
     * @returns {string} Markdown content
     */
    generate(data) {
        const lines = [];

        // Header
        lines.push(this.generateHeader(data));

        // Summary
        lines.push(this.generateSummary(data));

        // File Hierarchy
        lines.push(this.generateHierarchy(data.hierarchy));

        // Content Inventory by House
        lines.push(this.generateInventory(data.content));

        // Issues
        lines.push(this.generateIssues(data.validation.issues));

        // Registry Gaps
        lines.push(this.generateRegistryGaps(data.validation.registryGaps));

        // Footer
        lines.push(this.generateFooter(data));

        return lines.join('\n');
    }

    /**
     * Generate header section
     */
    generateHeader(data) {
        const date = new Date().toISOString().split('T')[0];
        const time = new Date().toLocaleTimeString();

        return `${'═'.repeat(70)}
                         EDUSCAN REPORT
                    Hexworth Prime Content Map
                    Scanned: ${date} ${time}
${'═'.repeat(70)}

`;
    }

    /**
     * Generate summary section
     */
    generateSummary(data) {
        const stats = data.scanStats;
        const content = data.content;
        const issues = data.validation.issues;

        // Count by type
        const byType = {};
        for (const item of content) {
            const type = item.contentType || 'other';
            byType[type] = (byType[type] || 0) + 1;
        }

        // Issue counts
        const critical = issues.filter(i => i.severity === 'critical').length;
        const warning = issues.filter(i => i.severity === 'warning').length;
        const info = issues.filter(i => i.severity === 'info').length;

        let summary = `## SUMMARY
${'─'.repeat(70)}

| Metric | Value |
|--------|-------|
| Files Scanned | ${stats.filesScanned} |
| Directories | ${stats.dirsScanned} |
| Content Files | ${content.length} |
| Scan Duration | ${stats.duration}ms |

### Content by Type

| Type | Count |
|------|-------|
`;

        for (const [type, count] of Object.entries(byType).sort((a, b) => b[1] - a[1])) {
            summary += `| ${type} | ${count} |\n`;
        }

        summary += `
### Issues Summary

| Severity | Count |
|----------|-------|
| Critical | ${critical} |
| Warning | ${warning} |
| Info | ${info} |
| **Total** | **${issues.length}** |

### Sync Status

| Status | Count |
|--------|-------|
| Ready | ${data.validation.syncStatus.ready} |
| Not Ready | ${data.validation.syncStatus.notReady} |
| Unknown | ${data.validation.syncStatus.unknown} |

`;

        return summary;
    }

    /**
     * Generate hierarchy section
     */
    generateHierarchy(node, depth = 0, isLast = true, prefix = '') {
        if (!node) return '';

        let output = '';

        if (depth === 0) {
            output += `## FILE HIERARCHY
${'═'.repeat(70)}

\`\`\`
`;
        }

        // Current node
        const connector = depth === 0 ? '' : (isLast ? '└── ' : '├── ');
        const icon = this.getNodeIcon(node);
        const annotation = this.getNodeAnnotation(node);

        output += `${prefix}${connector}${icon} ${node.name}${annotation}\n`;

        // Children
        if (node.children) {
            const children = Object.values(node.children);
            const childPrefix = prefix + (depth === 0 ? '' : (isLast ? '    ' : '│   '));

            children.forEach((child, index) => {
                const isChildLast = index === children.length - 1;
                output += this.generateHierarchy(child, depth + 1, isChildLast, childPrefix);
            });
        }

        if (depth === 0) {
            output += `\`\`\`

`;
        }

        return output;
    }

    /**
     * Get icon for node type
     */
    getNodeIcon(node) {
        if (node.type === 'directory') {
            if (node.dirType && node.dirType.startsWith('house:')) {
                return '🏠';
            }
            return '📁';
        }

        // File icons based on content type
        const name = node.name || '';
        if (name.includes('quiz')) return '❓';
        if (name.includes('lab')) return '🔬';
        if (name.includes('presentation')) return '📊';
        if (name === 'index.html') return '📍';

        return '📄';
    }

    /**
     * Get annotation for node
     */
    getNodeAnnotation(node) {
        if (node.type === 'directory') {
            if (node.dirType && node.dirType.startsWith('house:')) {
                return ` [${node.dirType}]`;
            }
            if (node.dirType && node.dirType !== 'directory') {
                return ` [${node.dirType}]`;
            }
            return '';
        }

        return '';
    }

    /**
     * Generate content inventory section
     */
    generateInventory(content) {
        let output = `## CONTENT INVENTORY
${'═'.repeat(70)}

`;

        // Group by house
        const byHouse = {};
        for (const item of content) {
            if (!['quiz', 'presentation', 'lab', 'applet'].includes(item.contentType)) {
                continue;
            }

            const house = item.house || 'unassigned';
            if (!byHouse[house]) {
                byHouse[house] = [];
            }
            byHouse[house].push(item);
        }

        // House info
        const houseNames = {
            web: 'WEB (Networking)',
            shield: 'SHIELD (Security)',
            forge: 'FORGE (Systems)',
            script: 'SCRIPT (Automation)',
            cloud: 'CLOUD (Cloud Computing)',
            code: 'CODE (DevOps)',
            key: 'KEY (Cryptography)',
            eye: 'EYE (Monitoring)',
            unassigned: 'UNASSIGNED'
        };

        for (const [house, items] of Object.entries(byHouse).sort()) {
            const houseName = houseNames[house] || house.toUpperCase();

            output += `### ${houseName}
${'─'.repeat(50)}

| ID/Name | Type | Sync | Issues |
|---------|------|------|--------|
`;

            for (const item of items) {
                const id = item.config?.moduleId || item.name.replace('.html', '');
                const type = item.contentType;
                const syncIcon = item.issues?.some(i => i.severity === 'critical') ? '❌' : '✓';
                const issueCount = item.issues?.length || 0;

                output += `| ${id} | ${type} | ${syncIcon} | ${issueCount} |\n`;
            }

            output += '\n';
        }

        return output;
    }

    /**
     * Generate issues section
     */
    generateIssues(issues) {
        let output = `## ISSUES DETECTED
${'═'.repeat(70)}

`;

        if (issues.length === 0) {
            output += `No issues detected! All content is properly configured.

`;
            return output;
        }

        // Group by severity
        const critical = issues.filter(i => i.severity === 'critical');
        const warning = issues.filter(i => i.severity === 'warning');
        const info = issues.filter(i => i.severity === 'info');

        if (critical.length > 0) {
            output += `### CRITICAL (${critical.length})

`;
            for (const issue of critical) {
                output += this.formatIssue(issue);
            }
        }

        if (warning.length > 0) {
            output += `### WARNING (${warning.length})

`;
            for (const issue of warning) {
                output += this.formatIssue(issue);
            }
        }

        if (info.length > 0) {
            output += `### INFO (${info.length})

`;
            for (const issue of info) {
                output += this.formatIssue(issue);
            }
        }

        return output;
    }

    /**
     * Format a single issue
     */
    formatIssue(issue) {
        let output = `**[${issue.code}]** ${issue.message}
`;
        if (issue.file) {
            output += `  File: \`${issue.file}\`
`;
        }
        if (issue.current) {
            output += `  Current: \`${issue.current}\`
`;
        }
        if (issue.expected) {
            output += `  Expected: \`${issue.expected}\`
`;
        }
        if (issue.fix) {
            output += `  Fix: ${issue.fix}
`;
        }
        output += '\n';

        return output;
    }

    /**
     * Generate registry gaps section
     */
    generateRegistryGaps(gaps) {
        let output = `## REGISTRY GAPS
${'═'.repeat(70)}

`;

        output += `### Unregistered Content (${gaps.unregistered.length})

`;

        if (gaps.unregistered.length === 0) {
            output += `All content files are registered.

`;
        } else {
            output += `| Path | Type | House |
|------|------|-------|
`;
            for (const item of gaps.unregistered) {
                output += `| ${item.path} | ${item.type} | ${item.house || '-'} |\n`;
            }
            output += '\n';
        }

        output += `### Orphaned Registry Entries (${gaps.orphaned.length})

`;

        if (gaps.orphaned.length === 0) {
            output += `All registry entries have matching files.

`;
        } else {
            output += `| ID | Path |
|-----|------|
`;
            for (const item of gaps.orphaned) {
                output += `| ${item.id} | ${item.path} |\n`;
            }
            output += '\n';
        }

        return output;
    }

    /**
     * Generate footer section
     */
    generateFooter(data) {
        return `${'═'.repeat(70)}
                         SCAN COMPLETE
        Generated by EduScan v1.0.0 - Content Topology Scanner
${'═'.repeat(70)}
`;
    }

    /**
     * Write report to file
     */
    write(content) {
        // Ensure output directory exists
        const absoluteDir = path.resolve(this.outputDir);
        if (!fs.existsSync(absoluteDir)) {
            fs.mkdirSync(absoluteDir, { recursive: true });
        }

        const filePath = path.join(absoluteDir, this.filename);
        fs.writeFileSync(filePath, content, 'utf8');

        return {
            path: filePath,
            size: Buffer.byteLength(content, 'utf8')
        };
    }
}

module.exports = MarkdownReporter;
