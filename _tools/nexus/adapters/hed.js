#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

/**
 * HED (Health Error Diagnostics) Spoke Adapter
 *
 * Reads a JSON export from the HED panel (browser-side tool).
 * The user exports from the HED panel's "Export JSON" button to a configured path.
 * Returns empty findings if no export exists (graceful degradation).
 *
 * Expected format: array of { code, message, url, source, timestamp, count? }
 */
module.exports = function createHedAdapter({ name, dataPath, projectRoot }) {

    function getExportPath() {
        return path.resolve(__dirname, '..', dataPath);
    }

    function readData() {
        const exportPath = getExportPath();
        if (!fs.existsSync(exportPath)) return null;
        try {
            return JSON.parse(fs.readFileSync(exportPath, 'utf8'));
        } catch (err) {
            return null;
        }
    }

    function codeSeverity(code) {
        if (!code) return 'medium';
        // HED-001/002 are high (runtime errors, load failures)
        if (code === 'HED-001' || code === 'HED-002') return 'high';
        // HED-003/004 are medium (warnings, deprecations)
        if (code === 'HED-003' || code === 'HED-004') return 'medium';
        return 'medium';
    }

    function getFindings() {
        const data = readData();
        if (!data) return [];

        const entries = Array.isArray(data) ? data : (data.errors || data.entries || []);
        if (!entries.length) return [];

        // Dedup by code|message
        const deduped = new Map();
        for (const entry of entries) {
            const key = `${entry.code || ''}|${entry.message || ''}`;
            if (deduped.has(key)) {
                const existing = deduped.get(key);
                existing.meta.count = (existing.meta.count || 1) + 1;
                if (entry.url && !existing.meta.urls.includes(entry.url)) {
                    existing.meta.urls.push(entry.url);
                }
            } else {
                deduped.set(key, {
                    source: name,
                    code: entry.code || 'HED-UNKNOWN',
                    severity: codeSeverity(entry.code),
                    message: entry.message || '(no message)',
                    file: entry.url || null,
                    line: null,
                    timestamp: entry.timestamp || new Date().toISOString(),
                    meta: {
                        hedSource: entry.source || null,
                        count: entry.count || 1,
                        urls: entry.url ? [entry.url] : [],
                    }
                });
            }
        }

        return Array.from(deduped.values());
    }

    function getStatus() {
        const data = readData();
        if (!data) {
            return { available: false, reason: 'HED export not found (run Export JSON from HED panel)' };
        }

        const entries = Array.isArray(data) ? data : (data.errors || data.entries || []);
        const findings = getFindings();

        const bySeverity = {};
        for (const f of findings) {
            bySeverity[f.severity] = (bySeverity[f.severity] || 0) + 1;
        }

        return {
            available: true,
            name: 'HED',
            totalEntries: entries.length,
            uniqueFindings: findings.length,
            bySeverity,
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
