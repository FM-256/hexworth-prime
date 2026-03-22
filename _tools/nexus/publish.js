#!/usr/bin/env node
'use strict';

// ── publish.js ────────────────────────────────────────────────────────
// Publishes Nexus scan results to Firestore (_quality_reports/latest).
// Called by nexus.js when the --publish flag is passed to `full` or `scan`.
//
// Uses firebase-admin from the functions/ directory (already installed).
// Requires GOOGLE_APPLICATION_CREDENTIALS or gcloud auth for Firestore access.
// ──────────────────────────────────────────────────────────────────────

const path = require('path');

// Resolve firebase-admin from the functions/ directory
const FUNCTIONS_DIR = path.resolve(__dirname, '../../functions');

/**
 * Publish a scan summary to Firestore at _quality_reports/latest.
 *
 * @param {Object} summary - The scan summary object to publish
 * @param {string} summary.gate       - 'PASS' or 'FAIL'
 * @param {number} summary.duration   - Scan duration in ms
 * @param {number} summary.filesScanned - Number of files scanned
 * @param {Object} summary.severity   - Severity counts { critical, high, medium, low, suspect, warning }
 * @param {Object} summary.spokes     - Per-spoke summaries
 * @param {Array}  summary.topIssues  - Top 50 findings by severity
 * @param {Object} summary.ruleBreakdown - Count per rule code
 * @returns {Promise<boolean>} true on success
 */
async function publishToFirestore(summary) {
    // Set project ID for ADC (Application Default Credentials)
    process.env.GOOGLE_CLOUD_PROJECT = 'hexworth-prime';

    // Require firebase-admin from the functions directory
    const admin = require(path.join(FUNCTIONS_DIR, 'node_modules/firebase-admin'));

    // Initialize only if no app exists yet
    if (!admin.apps.length) {
        admin.initializeApp({ projectId: 'hexworth-prime' });
    }

    const db = admin.firestore();
    const { Timestamp } = admin.firestore;

    // Build the Firestore document
    const doc = {
        scannedAt: Timestamp.now(),
        scannedBy: 'CLI',
        duration: summary.duration || 0,
        filesScanned: summary.filesScanned || 0,
        gate: summary.gate || 'PASS',
        severity: summary.severity || {},
        spokes: summary.spokes || {},
        topIssues: (summary.topIssues || []).slice(0, 50),
        ruleBreakdown: summary.ruleBreakdown || {},
    };

    // Write to _quality_reports/latest (overwrite on each publish)
    await db.collection('_quality_reports').doc('latest').set(doc);

    return true;
}

/**
 * Build the summary object from Nexus hub data.
 *
 * @param {Object} hub       - The Nexus hub module
 * @param {Object} config    - Nexus config
 * @param {Object} spokes    - Loaded spoke adapters
 * @param {Object} store     - Findings store
 * @param {Object} gateResult - Result from hub.runGate()
 * @param {number} duration  - Scan duration in ms
 * @returns {Object} Summary object ready for publishToFirestore()
 */
function buildSummary(hub, config, spokes, store, gateResult, duration) {
    const findings = store.findings || [];

    // Severity counts from EduScan report only (not all spokes combined).
    // The TREASURE_MAP.json is the authoritative source for scan findings.
    // Reading from the findings store would inflate counts with sprint items,
    // spellbook entries, and other spoke data.
    const severity = {
        critical: 0, high: 0, medium: 0, low: 0, suspect: 0, warning: 0
    };
    const eduscanFindings = findings.filter(f => f.source === 'eduscan');
    eduscanFindings.forEach(f => {
        if (severity.hasOwnProperty(f.severity)) {
            severity[f.severity]++;
        }
    });

    // Per-spoke summaries
    const spokeData = {};
    for (const [name, adapter] of Object.entries(spokes)) {
        const status = hub.getSpokeStatus(adapter);
        const entry = { total: 0 };

        if (!status.available) {
            spokeData[name] = entry;
            continue;
        }

        if (name === 'eduscan') {
            entry.total = status.issueCount || 0;
            entry.lastSync = status.scannedAt || null;
        } else if (name === 'sprint') {
            entry.total = status.totalItems || 0;
            entry.counts = status.counts || {};
        } else {
            entry.total = status.totalItems || status.totalFindings || status.totalSpells || 0;
            if (status.bySeverity) entry.bySeverity = status.bySeverity;
            if (status.counts) entry.counts = status.counts;
        }

        spokeData[name] = entry;
    }

    // Top 50 EduScan findings sorted by severity priority
    const SEV_PRIORITY = { critical: 0, high: 1, medium: 2, suspect: 3, warning: 4, low: 5, info: 6 };
    const topIssues = eduscanFindings
        .slice()
        .sort((a, b) => (SEV_PRIORITY[a.severity] || 99) - (SEV_PRIORITY[b.severity] || 99))
        .slice(0, 50)
        .map(f => ({
            code: f.code || '',
            severity: f.severity || 'low',
            message: f.message || '',
            file: f.file || '',
            line: f.line || null,
        }));

    // Rule breakdown: count per rule code
    const ruleBreakdown = {};
    findings.forEach(f => {
        if (f.code) {
            ruleBreakdown[f.code] = (ruleBreakdown[f.code] || 0) + 1;
        }
    });

    // Read filesScanned and authoritative severity counts from the
    // TREASURE_MAP report — this is the actual EduScan output, not the
    // findings store which mixes in sprint items and other spoke data
    let filesScanned = 0;
    try {
        const fs = require('fs');
        const reportPath = path.resolve(__dirname, '../reports/TREASURE_MAP.json');
        if (fs.existsSync(reportPath)) {
            const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
            filesScanned = report.summary?.totalFilesScanned || 0;
            // Override severity with authoritative EduScan counts
            if (report.summary?.issuesBySeverity) {
                const s = report.summary.issuesBySeverity;
                severity.critical = s.critical || 0;
                severity.high = s.high || 0;
                severity.medium = s.medium || 0;
                severity.low = s.low || 0;
                severity.suspect = s.suspect || 0;
                severity.warning = s.warning || 0;
            }
        }
    } catch (e) { /* fallback to findings store counts */ }

    return {
        gate: gateResult.passed ? 'PASS' : 'FAIL',
        duration,
        filesScanned,
        severity,
        spokes: spokeData,
        topIssues,
        ruleBreakdown,
    };
}

module.exports = { publishToFirestore, buildSummary };
