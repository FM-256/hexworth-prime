#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

/**
 * Audit Spoke Adapter
 *
 * Tier 1: Reads audit-latest.json (future structured output).
 * Tier 2: Regex-parses audit-report-latest.html for category-level findings.
 * Tier 3: Returns empty if neither exists.
 */
module.exports = function createAuditAdapter({ name, dataPath, projectRoot }) {

    function getReportsDir() {
        return path.resolve(projectRoot, dataPath);
    }

    function readJsonReport() {
        const jsonPath = path.join(getReportsDir(), 'audit-latest.json');
        if (!fs.existsSync(jsonPath)) return null;
        try {
            return JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
        } catch (err) {
            return null;
        }
    }

    function readHtmlReport() {
        const htmlPath = path.join(getReportsDir(), 'audit-report-latest.html');
        if (!fs.existsSync(htmlPath)) return null;
        try {
            return fs.readFileSync(htmlPath, 'utf8');
        } catch (err) {
            return null;
        }
    }

    function parseHtmlFindings(html) {
        const findings = [];

        // Look for stat-badge patterns: <span class="stat-badge fail">3</span>
        // or similar patterns showing category results
        const categoryPattern = /<(?:h[2-3]|div)[^>]*>([^<]+)<\/(?:h[2-3]|div)>\s*[\s\S]*?stat-badge\s+(fail|warn|pass)">(\d+)/gi;
        let match;

        while ((match = categoryPattern.exec(html)) !== null) {
            const category = match[1].trim();
            const status = match[2].toLowerCase();
            const count = parseInt(match[3], 10);

            if (status === 'pass' || count === 0) continue;

            findings.push({
                source: name,
                code: `AUDIT-${category.replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, 12)}`,
                severity: status === 'fail' ? 'high' : 'medium',
                message: `${category}: ${count} ${status} finding${count !== 1 ? 's' : ''}`,
                file: null,
                line: null,
                timestamp: new Date().toISOString(),
                meta: {
                    category,
                    status,
                    count,
                }
            });
        }

        return findings;
    }

    function getFindings() {
        // Tier 1: structured JSON
        const jsonData = readJsonReport();
        if (jsonData) {
            const entries = jsonData.findings || jsonData.issues || [];
            return entries.map(entry => ({
                source: name,
                code: entry.code || 'AUDIT-UNKNOWN',
                severity: entry.severity || 'medium',
                message: entry.message || '(no message)',
                file: entry.file || null,
                line: entry.line || null,
                timestamp: entry.timestamp || jsonData.scannedAt || new Date().toISOString(),
                meta: {
                    category: entry.category || null,
                }
            }));
        }

        // Tier 2: parse HTML report
        const html = readHtmlReport();
        if (html) {
            return parseHtmlFindings(html);
        }

        // Tier 3: nothing available
        return [];
    }

    function getStatus() {
        const jsonData = readJsonReport();
        if (jsonData) {
            const findings = jsonData.findings || jsonData.issues || [];
            const bySeverity = {};
            for (const f of findings) {
                const sev = f.severity || 'medium';
                bySeverity[sev] = (bySeverity[sev] || 0) + 1;
            }
            return {
                available: true,
                name: 'Audit',
                source: 'json',
                totalFindings: findings.length,
                bySeverity,
                scannedAt: jsonData.scannedAt || null,
            };
        }

        const html = readHtmlReport();
        if (html) {
            const findings = parseHtmlFindings(html);
            return {
                available: true,
                name: 'Audit',
                source: 'html',
                totalFindings: findings.length,
                bySeverity: findings.reduce((acc, f) => {
                    acc[f.severity] = (acc[f.severity] || 0) + 1;
                    return acc;
                }, {}),
            };
        }

        return { available: false, reason: 'no audit report found' };
    }

    function acceptFinding() {
        return { accepted: false, reason: 'read-only spoke' };
    }

    return {
        name,
        getFindings,
        getStatus,
        acceptFinding,
    };
};
