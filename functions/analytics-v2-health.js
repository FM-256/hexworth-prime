/**
 * Analytics v2 — Scheduled Self-Heal Health Monitor.
 *
 * Architecture: _docs/architecture/student-analytics-v2.md §7.1, §7.3
 *
 * Runs every 5 minutes via Cloud Scheduler. Reads the projector heartbeat
 * doc and detects:
 *   - Heartbeat doc missing entirely (projector never ran)
 *   - Heartbeat doc stale (>5 min since last beat)
 *   - Schema version drift (lost the schemaVersion field)
 *
 * On detection, writes a self-heal incident to /_triage_queue/, which
 * the existing self-healing pipeline picks up and surfaces.
 *
 * This is the platform-level self-heal observability surface — it does
 * NOT auto-restart the projector, but it ensures we know within 5 min
 * if the projector pipeline is silent.
 */

const { onSchedule } = require('firebase-functions/v2/scheduler');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');

const STALENESS_THRESHOLD_SEC = 5 * 60;  // 5 minutes — match arch §7.1

/**
 * Scheduled self-heal check. Runs every 5 minutes.
 * Writes a _triage_queue item if projector appears stale or absent.
 */
const analyticsHealthCheck = onSchedule(
    { schedule: 'every 5 minutes', region: 'us-central1' },
    async () => {
        const db = getFirestore();
        const heartbeatRef = db.doc('analytics_v2/projectorHeartbeat');

        let heartbeatExists = false;
        let lastBeatMs = null;
        let schemaVersion = null;

        try {
            const snap = await heartbeatRef.get();
            heartbeatExists = snap.exists;
            if (snap.exists) {
                const data = snap.data();
                if (data.lastBeatAt && data.lastBeatAt.toMillis) {
                    lastBeatMs = data.lastBeatAt.toMillis();
                }
                schemaVersion = data.schemaVersion;
            }
        } catch (e) {
            // Read failure — log and exit; cannot diagnose without the doc
            console.error('[analyticsHealthCheck] heartbeat read failed:', e.message);
            return;
        }

        const now = Date.now();
        const issues = [];

        if (!heartbeatExists) {
            issues.push({
                code: 'AV2-HEALTH-001',
                severity: 'high',
                message: 'Projector heartbeat doc not found — projector pipeline never ran or doc was deleted',
            });
        } else {
            if (lastBeatMs === null) {
                issues.push({
                    code: 'AV2-HEALTH-002',
                    severity: 'medium',
                    message: 'Heartbeat doc exists but lastBeatAt is missing or unreadable',
                });
            } else {
                const ageSec = (now - lastBeatMs) / 1000;
                if (ageSec > STALENESS_THRESHOLD_SEC) {
                    const ageMin = Math.floor(ageSec / 60);
                    issues.push({
                        code: 'AV2-HEALTH-003',
                        severity: 'high',
                        message: `Projector heartbeat stale — last beat ${ageMin} minute(s) ago (threshold ${STALENESS_THRESHOLD_SEC / 60} min)`,
                    });
                }
            }
            if (schemaVersion !== 2) {
                issues.push({
                    code: 'AV2-HEALTH-004',
                    severity: 'medium',
                    message: `Heartbeat doc has unexpected schemaVersion=${schemaVersion} (expected 2)`,
                });
            }
        }

        // Write a triage item per issue (or close any prior open items if all clear)
        const triageCol = db.collection('_triage_queue');

        if (issues.length === 0) {
            // All healthy — close any prior open AV2-HEALTH items
            const openSnap = await triageCol
                .where('code', 'in', ['AV2-HEALTH-001', 'AV2-HEALTH-002', 'AV2-HEALTH-003', 'AV2-HEALTH-004'])
                .where('status', '==', 'open')
                .limit(20)
                .get();
            const batch = db.batch();
            openSnap.forEach(doc => {
                batch.update(doc.ref, {
                    status: 'resolved',
                    resolvedAt: FieldValue.serverTimestamp(),
                    resolution: 'auto-closed: projector heartbeat now healthy',
                });
            });
            if (!openSnap.empty) await batch.commit();
            return { healthy: true, openClosed: openSnap.size };
        }

        // Issues detected — write/refresh triage items, idempotent on code
        for (const iss of issues) {
            const docId = `health_${iss.code}`;
            const ref = triageCol.doc(docId);
            await ref.set({
                code: iss.code,
                severity: iss.severity,
                source: 'analyticsHealthCheck',
                message: iss.message,
                file: 'functions/analytics-v2.js (projector pipeline)',
                status: 'open',
                detectedAt: FieldValue.serverTimestamp(),
                lastSeenAt: FieldValue.serverTimestamp(),
                occurrences: FieldValue.increment(1),
                phase: 1,
            }, { merge: true });
        }

        return { healthy: false, issueCount: issues.length, codes: issues.map(i => i.code) };
    }
);

module.exports = { analyticsHealthCheck };
