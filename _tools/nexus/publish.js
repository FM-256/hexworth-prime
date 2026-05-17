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
    // CAT-002 promoted 2026-04-30 by operator after Phase H end-to-end test
    // PASSED 6/6 against real findings. Template + validator + rollback at
    // _tools/nexus/fix-templates/CAT-002.{js,validator.js}. Items still gated
    // by master toggle + per-template enable in _system_config/self_healing.
    'CAT-002',
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
    // scannedBy honors NEXUS_HOST_LABEL env override (e.g., 'bc1' for cron),
    // matching publishSpellbook + publishHeartbeat. Default 'CLI' preserved.
    const scannedBy = process.env.NEXUS_HOST_LABEL || 'CLI';
    const doc = {
        scannedAt: Timestamp.now(),
        scannedBy,
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
    if (!Array.isArray(issues)) {
        return { triageItems: [], autoFixItems: [], allFingerprints: new Set() };
    }

    // Group ALL issues by (rule, normalizedDir) regardless of severity.
    // The severity gate decides what enters the queues; the FULL grouping
    // is needed so reconcileTriageWithScan has every existing-defect
    // fingerprint, not just the queueable ones. Without this, a rule whose
    // severity drops from high to medium would cause its existing queue
    // items to silently auto-resolve as "disappeared" — Nancy round 4 fix.
    //
    // Transient handling: any spoke that emits ephemeral findings (e.g.
    // smoke-test failures, network-blip detections) sets `transient: true`
    // on each issue. The group inherits transient via AND-aggregation —
    // it stays transient only if ALL its issues are transient. A transient
    // group still contributes to deploy-gate severity counts (so smoke
    // failures CAN block a deploy), but it never enters _triage_queue (so
    // smoke failures don't auto-create sprint items that haunt the queue).
    const groups = new Map();
    for (const issue of issues) {
        const rule = issue.code || 'UNKNOWN';
        const sev = issue.severity || 'low';
        const dir = directoryPrefix(issue.file);
        const groupKey = `${rule}::${dir}`;
        if (!groups.has(groupKey)) {
            groups.set(groupKey, { rule, dir, severity: sev, issues: [], transient: !!issue.transient });
        }
        const g = groups.get(groupKey);
        g.issues.push(issue);
        g.transient = g.transient && !!issue.transient;
        // Promote group severity to the highest of any member
        const sevOrder = ['low', 'medium', 'high', 'critical'];
        if (sevOrder.indexOf(sev) > sevOrder.indexOf(g.severity)) {
            g.severity = sev;
        }
    }

    const triageItems = [];
    const autoFixItems = [];
    const allFingerprints = new Set();

    for (const [groupKey, g] of groups) {
        const fingerprint = sha256Hex(`${g.rule}|${g.dir}`);
        // Every group's fingerprint is recorded for reconciliation,
        // independent of whether it makes the severity gate.
        allFingerprints.add(fingerprint);

        const isAutoFix = AUTO_FIX_ELIGIBLE_RULES.has(g.rule);
        // Severity gate: only critical+high enter human triage; auto-fix
        // items bypass the gate (any severity). Items below the gate that
        // aren't auto-fix-eligible get NO queue write — they only contribute
        // their fingerprint to allFingerprints (so reconciliation can detect
        // their continued existence).
        if (!TRIAGE_SEVERITY_GATE.has(g.severity) && !isAutoFix) continue;
        // Transient skip: spoke-emitted ephemeral findings (e.g. smoke-test
        // failures) never enter _triage_queue. They still show up in the
        // status table and deploy gate counts via their spoke's getStatus(),
        // so smoke-detected regressions can block a deploy without polluting
        // long-lived sprint state.
        if (g.transient && !isAutoFix) continue;

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
            autoFixEligible: isAutoFix,
            fixTemplate: null,
            // createdAt / updatedAt are set at write time using server timestamps
            history: [],
        };

        if (isAutoFix) {
            autoFixItems.push({ docId: fingerprint, data: item });
        } else {
            triageItems.push({ docId: fingerprint, data: item });
        }
    }

    return { triageItems, autoFixItems, allFingerprints };
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
 * Reconcile existing nexus-sourced items in both queues against the
 * fingerprint set produced by the current scan.
 *
 * Two transitions:
 *   1. AUTO-RESOLVE: an item is open/claimed/in-progress but its fingerprint
 *      is no longer in the fresh scan → status: resolved, resolvedBy:
 *      'auto-rescan'. This closes the loop for human-fixed items: the human
 *      makes the fix, the next scan no longer detects the defect, the item
 *      auto-disappears from Pulse.
 *
 *   2. AUTO-REOPEN: an item was previously resolved but its fingerprint
 *      reappears in the fresh scan → status: open. Treats the recurrence as
 *      a regression and resurfaces it for triage. Resets owner/claimedAt
 *      because whoever resolved it last time may not be the next claimer.
 *
 * Items in `dismissed` or `deferred` states are NOT touched. A human
 * deliberately set those, and a recurrence shouldn't override that
 * judgement automatically (they can re-open manually if needed).
 *
 * Sprint-master and manual items are skipped (their lifecycle isn't tied
 * to Nexus scans).
 *
 * @param {Set<string>} currentFingerprints - fingerprints from the just-finished scan
 * @returns {Promise<{resolved: number, reopened: number, skipped: number}>}
 */
async function reconcileTriageWithScan(currentFingerprints) {
    process.env.GOOGLE_CLOUD_PROJECT = 'hexworth-prime';
    const admin = require(path.join(FUNCTIONS_DIR, 'node_modules/firebase-admin'));
    if (!admin.apps.length) {
        admin.initializeApp({ projectId: 'hexworth-prime' });
    }
    const db = admin.firestore();
    const { FieldValue } = admin.firestore;

    const RECONCILER_ACTOR = 'agent:rescan-reconciler';
    const ACTIVE_STATUSES = new Set(['open', 'claimed', 'in-progress']);

    let resolved = 0;
    let reopened = 0;
    let skipped = 0;

    async function reconcileCollection(collectionName) {
        // Filter to states the reconciler can act on. Excludes 'dismissed'
        // and 'deferred' which are deliberate human decisions — never override.
        // Also avoids ever-growing read cost as resolved items pile up over
        // time (the 'resolved' state is included only because we may need
        // to auto-reopen). Nancy round 4: scope-narrowed query.
        const snap = await db.collection(collectionName)
            .where('source', '==', 'nexus')
            .where('status', 'in', ['open', 'claimed', 'in-progress', 'resolved'])
            .get();

        for (const doc of snap.docs) {
            const data = doc.data();
            const fp = data.defectFingerprint;
            const status = data.status;
            const inCurrent = currentFingerprints.has(fp);

            let action = null;
            let updates = null;

            if (!inCurrent && ACTIVE_STATUSES.has(status)) {
                action = 'auto-resolve';
                updates = {
                    status: 'resolved',
                    resolvedAt: FieldValue.serverTimestamp(),
                    resolvedBy: 'auto-rescan',
                };
            } else if (inCurrent && status === 'resolved') {
                action = 'auto-reopen';
                updates = {
                    status: 'open',
                    resolvedAt: null,
                    resolvedBy: null,
                    owner: null,
                    claimedAt: null,
                    heartbeatAt: null,
                };
            } else {
                skipped++;
                continue;
            }

            try {
                await db.runTransaction(async (txn) => {
                    const fresh = await txn.get(doc.ref);
                    if (!fresh.exists) return;
                    const f = fresh.data();
                    // Re-check inside transaction to avoid races with Pulse mutations
                    const freshInCurrent = currentFingerprints.has(f.defectFingerprint);
                    if (action === 'auto-resolve' && (freshInCurrent || !ACTIVE_STATUSES.has(f.status))) {
                        return;
                    }
                    if (action === 'auto-reopen' && (!freshInCurrent || f.status !== 'resolved')) {
                        return;
                    }
                    // For auto-reopen, surface the prior resolver in the note
                    // so the audit trail makes clear we overrode a human/agent
                    // resolve decision. Nancy round 4: don't lose context.
                    const priorResolver = f.resolvedBy || 'unknown';
                    const note = action === 'auto-resolve'
                        ? 'defect no longer present in scan'
                        : `defect re-detected after prior resolve by ${priorResolver}`;
                    const historyEntry = {
                        ts: new Date().toISOString(),
                        actor: RECONCILER_ACTOR,
                        action: action,
                        note: note,
                    };
                    const newHistory = (Array.isArray(f.history) ? f.history : [])
                        .concat([historyEntry])
                        .slice(-20);
                    txn.update(doc.ref, Object.assign({}, updates, {
                        updatedAt: FieldValue.serverTimestamp(),
                        history: newHistory,
                    }));
                });
                if (action === 'auto-resolve') resolved++;
                else if (action === 'auto-reopen') reopened++;
            } catch (err) {
                console.warn(`[reconcileTriageWithScan] ${collectionName}/${doc.id} ${action} failed: ${err.message}`);
            }
        }
    }

    await reconcileCollection('_triage_queue');
    await reconcileCollection('_auto_fix_queue');

    return { resolved, reopened, skipped };
}

/**
 * High-level entry point called by nexus.js after a scan.
 * Reads issues from TREASURE_MAP.json, aggregates, writes both queues,
 * then reconciles existing items against the fresh fingerprint set
 * (auto-resolve disappeared defects + auto-reopen regressed ones).
 *
 * @returns {Promise<{triageWrites, autoFixWrites, groupCount, resolved, reopened}>}
 */
/**
 * Mirror the fix-template registry into Firestore at
 * _system_config/self_healing.availableTemplates so Pulse renders
 * the per-template toggle list without a hardcoded mirror.
 *
 * Eliminates the previously-documented drift risk where adding a
 * template server-side required updating window.__SELF_HEALING_TEMPLATES__
 * in pulse.html separately. Now Pulse reads from this single source.
 *
 * Called at the end of publishTriage() so every nexus full --publish
 * keeps the mirror fresh.
 */
async function mirrorTemplateRegistry() {
    try {
        const registry = require('./fix-templates/registry');
        const ruleCodes = registry.listRegisteredRules();
        const available = ruleCodes.map(rc => {
            const t = registry.getTemplate(rc);
            return {
                ruleCode: rc,
                description: t && t.description ? t.description : '',
                touchesExtensions: t && Array.isArray(t.touchesExtensions) ? t.touchesExtensions : [],
            };
        });

        process.env.GOOGLE_CLOUD_PROJECT = 'hexworth-prime';
        const admin = require(path.join(FUNCTIONS_DIR, 'node_modules/firebase-admin'));
        if (!admin.apps.length) admin.initializeApp({ projectId: 'hexworth-prime' });
        const db = admin.firestore();
        const { FieldValue } = admin.firestore;

        // Read existing config to preserve enabled/enabledBy/enabledAt etc.
        const ref = db.doc('_system_config/self_healing');
        const snap = await ref.get();
        const existing = snap.exists ? snap.data() : {};
        await ref.set({
            enabled: !!existing.enabled,
            enabledTemplates: Array.isArray(existing.enabledTemplates) ? existing.enabledTemplates : [],
            enabledBy: existing.enabledBy || null,
            enabledAt: existing.enabledAt || null,
            lastDisabledBy: existing.lastDisabledBy || null,
            lastDisabledAt: existing.lastDisabledAt || null,
            availableTemplates: available,
            availableTemplatesUpdatedAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp(),
        }, { merge: true });

        return { mirroredCount: available.length };
    } catch (err) {
        console.warn('[mirrorTemplateRegistry] failed:', err.message);
        return { mirroredCount: 0, error: err.message };
    }
}

async function publishTriage() {
    const fs = require('fs');
    const reportPath = path.resolve(__dirname, '../reports/TREASURE_MAP.json');
    if (!fs.existsSync(reportPath)) {
        console.warn('[publishTriage] TREASURE_MAP.json not found; skipping triage publish');
        return { triageWrites: 0, autoFixWrites: 0, groupCount: 0, resolved: 0, reopened: 0, skippedReconcile: false };
    }
    const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
    const issues = report.issues || [];
    const items = buildTriageItems(issues);
    const writeResult = await publishTriageQueues(items);

    // EMPTY-SCAN GUARD (Nancy round 4 fix):
    // If a partial / corrupt / pre-init TREASURE_MAP yields zero issues,
    // skip reconciliation entirely. Otherwise every active item would
    // auto-resolve as "disappeared," wiping the queue from one bad scan.
    // Reconciliation only runs when we have positive signal that the scan
    // actually saw the codebase.
    if (items.allFingerprints.size === 0) {
        console.warn('[publishTriage] zero fingerprints in scan — skipping reconciliation to avoid mass auto-resolve');
        return {
            ...writeResult,
            resolved: 0,
            reopened: 0,
            skippedReconcile: true,
            groupCount: 0,
        };
    }

    // Reconcile against ALL fingerprints (not just queue-eligible ones).
    // A defect that was in the queue but is now severity-reclassified down
    // is still "present" — its fingerprint stays in allFingerprints, so
    // reconciliation does not falsely auto-resolve it. (Nancy round 4 fix.)
    const reconcileResult = await reconcileTriageWithScan(items.allFingerprints);

    // Mirror the fix-template registry into _system_config.availableTemplates
    // so Pulse renders the per-template toggle list without a hardcoded mirror.
    const mirrorResult = await mirrorTemplateRegistry();

    return {
        ...writeResult,
        ...reconcileResult,
        skippedReconcile: false,
        groupCount: items.triageItems.length + items.autoFixItems.length,
        templatesMirrored: mirrorResult.mirroredCount,
    };
}

/**
 * Publish spellbook live data to Firestore at _quality_reports/spellbook.
 * Consumed by _app/admin/console.html loadSpellbook() to overlay live status/title
 * onto the curated _sbStaticSpells array.
 *
 * Guards:
 *   - Empty array: refuse the write (would silently overwrite good data with empty if
 *     run from a host with unpopulated _spellbook/spells/, e.g., bc1 without sync).
 *   - 0.8x previousCount: refuse the write if spell count dropped >20% vs prior doc
 *     (catches partial-clone failure modes). First-run path: always accept (no prior doc).
 *
 * @param {Array} spells — output of spellbookAdapter.getSpellsForPublish()
 * @returns {Promise<{ written: boolean, skipped: boolean, reason?: string, count: number }>}
 */
async function publishSpellbook(spells) {
    process.env.GOOGLE_CLOUD_PROJECT = 'hexworth-prime';
    const admin = require(path.join(FUNCTIONS_DIR, 'node_modules/firebase-admin'));
    if (!admin.apps.length) admin.initializeApp({ projectId: 'hexworth-prime' });
    const db = admin.firestore();
    const { Timestamp } = admin.firestore;
    const ref = db.doc('_quality_reports/spellbook');

    if (!Array.isArray(spells) || spells.length === 0) {
        return {
            written: false,
            skipped: true,
            reason: 'spells empty — refusing to overwrite Firestore (verify _spellbook/spells/ filesystem state)',
            count: 0,
        };
    }

    const existing = await ref.get();
    if (existing.exists) {
        const prior = (existing.data().spells || []).length;
        if (prior > 0 && spells.length < 0.8 * prior) {
            return {
                written: false,
                skipped: true,
                reason: `count contraction: ${spells.length} new vs ${prior} prior (>20% drop) — refusing write`,
                count: spells.length,
                priorCount: prior,
            };
        }
    }

    const os = require('os');
    const scannedBy = process.env.NEXUS_HOST_LABEL || os.hostname() || 'unknown';

    await ref.set({
        scannedAt: Timestamp.now(),
        scannedBy,
        spells,
        version: 1,
    });

    return { written: true, skipped: false, count: spells.length };
}

/**
 * Publish a scan heartbeat to Firestore at _quality_reports/scanHeartbeat.
 * MVP-required (per Nancy review 2026-05-07): without it, silent cron failures
 * leave _quality_reports/latest as last-good-write with no age signal — false
 * confidence. Heartbeat is the staleness detector.
 *
 * @param {Object} stats — { gatePass, durationMs, totalFindings }
 */
async function publishHeartbeat(stats) {
    process.env.GOOGLE_CLOUD_PROJECT = 'hexworth-prime';
    const admin = require(path.join(FUNCTIONS_DIR, 'node_modules/firebase-admin'));
    if (!admin.apps.length) admin.initializeApp({ projectId: 'hexworth-prime' });
    const db = admin.firestore();
    const { Timestamp } = admin.firestore;
    const os = require('os');

    const scannedBy = process.env.NEXUS_HOST_LABEL || os.hostname() || 'unknown';

    await db.doc('_quality_reports/scanHeartbeat').set({
        scannedAt: Timestamp.now(),
        scannedBy,
        host: os.hostname(),
        gatePass: !!(stats && stats.gatePass),
        durationMs: (stats && stats.durationMs) || 0,
        totalFindings: (stats && stats.totalFindings) || 0,
        version: 1,
    });

    return { written: true, scannedBy };
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
    // Slice 3b — auto-resolve / auto-reopen via rescan
    reconcileTriageWithScan,
    // QC round 8 — auto-mirror template registry to Firestore
    mirrorTemplateRegistry,
    // 2026-05-07 — spellbook live data + scan staleness heartbeat
    publishSpellbook,
    publishHeartbeat,
};
