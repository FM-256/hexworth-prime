#!/usr/bin/env node
'use strict';

// ── publish.js ────────────────────────────────────────────────────────
// Publishes Nexus scan results to Firestore.
//
// Two outputs:
//   1. _quality_reports/latest — read-only summary for Pulse health/severity
//   2. _triage_queue + _auto_fix_queue — Slice 1 of the bidirectional control
//      plane. Aggregated, fingerprinted, severity-gated. See:
//      _docs/features/SELF_HEALING_PIPELINE.md
//
// Called by nexus.js when the --publish flag is passed to `full` or `scan`.
//
// Uses firebase-admin from the functions/ directory (already installed).
// Requires GOOGLE_APPLICATION_CREDENTIALS or gcloud auth for Firestore access.
// ──────────────────────────────────────────────────────────────────────

const path = require('path');
const crypto = require('crypto');

// ── Self-healing pipeline configuration ────────────────────────────────
// Per Nancy review (2026-04-29) and the design doc's promotion rule:
// classes must have (a) a fix-template document, (b) a FUNC validator
// before being added here. Slice 1 ships EMPTY. Classes added in Slice 3.
const AUTO_FIX_ELIGIBLE_RULES = new Set([
    // Empty in Slice 1 — see _docs/features/SELF_HEALING_PIPELINE.md
]);

// Severity gate: only critical + high enter the live triage queue.
// Medium/low/warning/suspect remain in _quality_reports/latest for
// inspection but do not flood the triage panel.
const TRIAGE_SEVERITY_GATE = new Set(['critical', 'high']);

// Severity → seed priority. Humans can re-rank freely afterward.
const SEVERITY_PRIORITY = {
    critical: 90,
    high: 70,
    medium: 40,
    low: 20,
};

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

// ──────────────────────────────────────────────────────────────────────
// Self-healing pipeline: triage queue + auto-fix queue publishers
// ──────────────────────────────────────────────────────────────────────

/**
 * Normalize a file path for consistent fingerprinting / grouping.
 * Strips the leading _app/ if present, strips trailing whitespace.
 */
function normalizePath(filePath) {
    if (!filePath) return '';
    let p = String(filePath).trim();
    if (p.startsWith('_app/')) p = p.slice(5);
    return p;
}

/**
 * Compute a stable directory prefix for grouping.
 * Returns the first N path segments joined with /. For
 * houses/divergent/cybersecurity-ethics/foo.html, depth=2 gives
 * houses/divergent/.
 */
function directoryPrefix(filePath, depth = 2) {
    const norm = normalizePath(filePath);
    if (!norm) return '';
    const parts = norm.split('/').filter(Boolean);
    return parts.slice(0, Math.min(depth, parts.length - 1)).join('/') + '/';
}

/**
 * sha256 hex of an arbitrary string. 64 chars — matches the rule check.
 */
function sha256Hex(s) {
    return crypto.createHash('sha256').update(String(s)).digest('hex');
}

/**
 * Aggregate Nexus issues into triage queue items.
 *
 * Input: array of issues (from TREASURE_MAP.issues), each like:
 *   { code, severity, message, file, line, fix?, category? }
 *
 * Output: { triageItems: [...], autoFixItems: [...] }
 *   - triageItems: severity-gated, grouped by (rule, directoryPrefix)
 *   - autoFixItems: AUTO_FIX_ELIGIBLE_RULES set, grouped same way
 *
 * Each item includes:
 *   - defectFingerprint: sha256(rule|normalizedDir) — stable across runs
 *   - groupKey: human-readable identifier (e.g. "PATH-001::houses/divergent/")
 *   - childCount: how many raw issues rolled up
 *   - childPaths: up to 50 sample paths
 *   - severity, priority, status: for queue lifecycle
 *
 * @param {Array} issues - raw Nexus findings from TREASURE_MAP.json
 * @returns {{triageItems: Array, autoFixItems: Array}}
 */
function buildTriageItems(issues) {
    if (!Array.isArray(issues)) return { triageItems: [], autoFixItems: [] };

    // Group: (rule, normalizedDir) → array of issues
    const groups = new Map();
    for (const issue of issues) {
        const rule = issue.code || 'UNKNOWN';
        const sev = issue.severity || 'low';

        // Skip severity below the gate UNLESS rule is auto-fix-eligible
        // (auto-fix items can be at any severity per design doc)
        const isAutoFix = AUTO_FIX_ELIGIBLE_RULES.has(rule);
        if (!TRIAGE_SEVERITY_GATE.has(sev) && !isAutoFix) continue;

        const dir = directoryPrefix(issue.file);
        const groupKey = `${rule}::${dir}`;
        if (!groups.has(groupKey)) {
            groups.set(groupKey, { rule, dir, severity: sev, isAutoFix, issues: [] });
        }
        const g = groups.get(groupKey);
        g.issues.push(issue);
        // Promote group severity to the highest of any member
        const sevOrder = ['low', 'medium', 'high', 'critical'];
        if (sevOrder.indexOf(sev) > sevOrder.indexOf(g.severity)) {
            g.severity = sev;
        }
    }

    const triageItems = [];
    const autoFixItems = [];

    for (const [groupKey, g] of groups) {
        const fingerprint = sha256Hex(`${g.rule}|${g.dir}`);
        const sample = g.issues[0] || {};
        const childPaths = g.issues
            .slice(0, 50)
            .map(i => i.file)
            .filter(Boolean);

        const item = {
            defectFingerprint: fingerprint,
            source: 'nexus',
            severity: g.severity,
            rule: g.rule,
            ruleVersion: '1.0.0',
            title: `${g.rule}: ${g.issues.length} finding${g.issues.length === 1 ? '' : 's'} in ${g.dir || 'root'}`,
            description: sample.message || '',
            filePath: sample.file || null,
            lineNumber: sample.line || null,
            groupKey: groupKey,
            childCount: g.issues.length,
            childPaths: childPaths,
            status: 'open',
            priority: Math.round(SEVERITY_PRIORITY[g.severity] || 0),
            owner: null,
            claimedAt: null,
            heartbeatAt: null,
            autoFixEligible: g.isAutoFix,
            fixTemplate: null,
            // createdAt / updatedAt are set at write time using server timestamps
            history: [],
        };

        if (g.isAutoFix) {
            autoFixItems.push({ docId: fingerprint, data: item });
        } else {
            triageItems.push({ docId: fingerprint, data: item });
        }
    }

    return { triageItems, autoFixItems };
}

/**
 * Write triage and auto-fix items to Firestore using upsert semantics.
 * Doc ID = defectFingerprint, so re-runs of nexus update existing items
 * rather than duplicating. createdAt is preserved on existing items;
 * mutable fields (status, priority, owner, etc.) are NOT overwritten by
 * a fresh scan — only the descriptive fields and childCount/childPaths
 * are refreshed. updatedAt always bumps.
 *
 * @param {{triageItems: Array, autoFixItems: Array}} items
 * @returns {Promise<{triageWrites: number, autoFixWrites: number}>}
 */
async function publishTriageQueues(items) {
    process.env.GOOGLE_CLOUD_PROJECT = 'hexworth-prime';
    const admin = require(path.join(FUNCTIONS_DIR, 'node_modules/firebase-admin'));
    if (!admin.apps.length) {
        admin.initializeApp({ projectId: 'hexworth-prime' });
    }
    const db = admin.firestore();
    const { Timestamp, FieldValue } = admin.firestore;

    let triageWrites = 0;
    let autoFixWrites = 0;

    async function upsertOne(collection, docId, data) {
        const ref = db.collection(collection).doc(docId);
        const snap = await ref.get();
        const now = Timestamp.now();

        if (!snap.exists) {
            // Create — set all fields including createdAt
            await ref.set({
                ...data,
                createdAt: now,
                updatedAt: now,
            });
        } else {
            // Update — preserve createdAt and any human-set lifecycle fields.
            // Only refresh descriptive fields + childCount/childPaths + updatedAt.
            const existing = snap.data();
            await ref.update({
                title: data.title,
                description: data.description,
                filePath: data.filePath,
                lineNumber: data.lineNumber,
                childCount: data.childCount,
                childPaths: data.childPaths,
                ruleVersion: data.ruleVersion,
                updatedAt: now,
                // Status/priority/owner/etc preserved from existing doc.
                // If status was 'resolved' but the defect re-appeared, leave
                // it resolved — Slice 2/3 will handle re-open semantics.
            });
        }
    }

    for (const { docId, data } of items.triageItems) {
        await upsertOne('_triage_queue', docId, data);
        triageWrites++;
    }
    for (const { docId, data } of items.autoFixItems) {
        await upsertOne('_auto_fix_queue', docId, data);
        autoFixWrites++;
    }

    return { triageWrites, autoFixWrites };
}

/**
 * High-level entry point called by nexus.js after a scan.
 * Reads issues from TREASURE_MAP.json, aggregates, writes both queues.
 *
 * @returns {Promise<{triageWrites: number, autoFixWrites: number, groupCount: number}>}
 */
async function publishTriage() {
    const fs = require('fs');
    const reportPath = path.resolve(__dirname, '../reports/TREASURE_MAP.json');
    if (!fs.existsSync(reportPath)) {
        console.warn('[publishTriage] TREASURE_MAP.json not found; skipping triage publish');
        return { triageWrites: 0, autoFixWrites: 0, groupCount: 0 };
    }
    const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
    const issues = report.issues || [];
    const items = buildTriageItems(issues);
    const result = await publishTriageQueues(items);
    return {
        ...result,
        groupCount: items.triageItems.length + items.autoFixItems.length,
    };
}

module.exports = {
    publishToFirestore,
    buildSummary,
    // Slice 1 — self-healing pipeline
    publishTriage,
    buildTriageItems,         // exported for unit testing
    normalizePath,            // exported for unit testing
    directoryPrefix,          // exported for unit testing
    sha256Hex,                // exported for unit testing
};
