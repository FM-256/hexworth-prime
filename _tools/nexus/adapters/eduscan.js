#!/usr/bin/env node
'use strict';

const fs = require('fs');

/**
 * EduScan Spoke Adapter
 *
 * Reads TREASURE_MAP.json and exposes findings in the shared Nexus format.
 * This is a read-only spoke — it produces findings but cannot accept them.
 */
module.exports = function createEduScanAdapter({ name, dataPath, projectRoot }) {

    function readData() {
        if (!fs.existsSync(dataPath)) return null;
        try {
            return JSON.parse(fs.readFileSync(dataPath, 'utf8'));
        } catch (err) {
            return null;
        }
    }

    function normalizeSeverity(sev) {
        switch (sev) {
            case 'critical': return 'critical';
            case 'high':     return 'high';
            case 'medium':   return 'medium';
            case 'low':      return 'low';
            case 'warning':  return 'low';
            case 'suspect':  return 'low';
            case 'info':     return 'info';
            default:         return 'medium';
        }
    }

    function getFindings() {
        const data = readData();
        if (!data || !data.issues) return [];

        return data.issues.map(issue => {
            const finding = {
                source: name,
                code: issue.code,
                severity: normalizeSeverity(issue.severity),
                message: issue.message,
                file: issue.file || null,
                line: issue.line || null,
                timestamp: data.meta && data.meta.scannedAt || new Date().toISOString(),
                meta: {}
            };

            // Per-finding id for distinct dedupKey tracking. Without this, validators
            // that emit many findings against the same file (LP-007 2853x against
            // LearningPaths.js, SEM-001 792x, BLOB-001 612x, etc.) collapse to a
            // single dedupKey and only the last carries a fresh timestamp.
            //
            // Priority: composite (moduleId + pathId) > moduleId > line > pathId >
            // catalogId > message-hash (last resort). The composite handles
            // validators like LP-003 where the same moduleId can appear in multiple
            // paths — moduleId alone would still collide. Message-hash handles
            // validators like CAT-007 (491 findings against ContentCatalog.js)
            // that carry no structured distinguishing field.
            //
            // KNOWN LIMITATION: validators that emit duplicate issues at the same
            // file:line:moduleId tuple (e.g., SEM-001 has 2 issues at
            // aoai-05.html:L29) will still collide — this is a validator-side
            // duplicate-emission bug, not an adapter-side limitation. Tracked
            // separately as a follow-up to investigate per-validator.
            let idSuffix = null;
            if (issue.moduleId && issue.pathId) {
                idSuffix = issue.moduleId + '_' + issue.pathId;
            } else if (issue.moduleId) {
                idSuffix = issue.moduleId;
            } else if (issue.line) {
                idSuffix = 'L' + issue.line;
            } else if (issue.pathId) {
                idSuffix = issue.pathId;
            } else if (issue.catalogId) {
                idSuffix = issue.catalogId;
            } else if (issue.message) {
                // Last-resort hash for validators carrying unique data only in message.
                // Lazy-require crypto to keep cold-path adapters cheap.
                const crypto = require('crypto');
                idSuffix = 'M' + crypto.createHash('sha1').update(issue.message).digest('hex').slice(0, 8);
            }
            if (idSuffix) finding.id = `${issue.code}_${idSuffix}`;

            // Carry over extra EduScan fields into meta
            if (issue.category)      finding.meta.category = issue.category;
            if (issue.fix)           finding.meta.fix = issue.fix;
            if (issue.autoFixable)   finding.meta.autoFixable = issue.autoFixable;
            if (issue.details)       finding.meta.details = issue.details;
            if (issue.house)         finding.meta.house = issue.house;
            if (issue.contentType)   finding.meta.contentType = issue.contentType;
            if (issue.moduleId)      finding.meta.moduleId = issue.moduleId;

            return finding;
        });
    }

    function getStatus() {
        const data = readData();
        if (!data) {
            return { available: false, reason: 'TREASURE_MAP.json not found' };
        }

        const summary = data.summary || {};
        const meta = data.meta || {};

        return {
            available: true,
            name: 'EduScan',
            issueCount: summary.issueCount || 0,
            bySeverity: {
                critical: (summary.issuesBySeverity && summary.issuesBySeverity.critical) || 0,
                high:     (summary.issuesBySeverity && summary.issuesBySeverity.high) || 0,
                medium:   (summary.issuesBySeverity && summary.issuesBySeverity.medium) || 0,
                low:      ((summary.issuesBySeverity && summary.issuesBySeverity.low) || 0) +
                          ((summary.issuesBySeverity && summary.issuesBySeverity.warning) || 0) +
                          ((summary.issuesBySeverity && summary.issuesBySeverity.suspect) || 0),
                info:     (summary.issuesBySeverity && summary.issuesBySeverity.info) || 0,
            },
            scannedAt: meta.scannedAt || null,
            filesScanned: summary.totalFilesScanned || 0,
        };
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
