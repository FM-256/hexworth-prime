/**
 * sextant.js — Sextant Stage 1 (design D): trajectory without a new identified store.
 *
 * Design: _docs/architecture/career-trajectory-navigator.md
 *
 * TWO surfaces, ONE new persisted store:
 *   Self-view (identified): DERIVED LIVE from the learner's own `observatory_activity`
 *     (retained, timestamped, keyed by uid) via deriveTrajectory + the getMyTrajectory
 *     callable. No new identified archive is persisted, so it needs no new consent — it is
 *     the learner's own data shown back to them, like the dashboard, and works for everyone.
 *   Cohort archive (Plane B, tokenized): the ONLY new persisted store. A scheduled snapshot
 *     freezes each CONSENTED, recently-active learner's position under a stable pseudonym
 *     `HMAC(pepper, uid)` in `sextant_cohort_points` — no uid/name/email/classId. This is the
 *     research substrate + the "known-good routes" reference; it genuinely needs point-in-time
 *     capture (the cohort's weekly state can't be reconstructed on demand).
 *
 * Privacy enforced at the pipe:
 *   - Decline gate mirrors the telemetry CF: excluded iff participates===false on EITHER
 *     observatory_enrollment OR observatory_consent (absent/true = consented).
 *   - Recency gate: only learners active within ACTIVE_WINDOW_DAYS get a new cohort point.
 *   - Plane B holds a stable token only; withdrawal purges it (purgeLearner). The self-view
 *     needs no separate purge — withdrawal already deletes the underlying activity.
 *   - Pepper (Secret Manager: SEXTANT_PEPPER) never leaves the server; the snapshot fails loud
 *     if it is missing rather than minting a random pepper (which would fork token identity).
 */
const { onSchedule } = require('firebase-functions/v2/scheduler');
const { defineSecret } = require('firebase-functions/params');
const { getFirestore, Timestamp, FieldValue } = require('firebase-admin/firestore');
const crypto = require('crypto');

// The pepper: one global HMAC key, reused every run so a learner maps to the same token each
// term (cross-class tracking + withdrawal-purge by token). Provisioned in Secret Manager.
const SEXTANT_PEPPER = defineSecret('SEXTANT_PEPPER');

const ACTIVE_WINDOW_DAYS = 90; // only snapshot learners active within this window
const DAY_MS = 86400000;
const BATCH_LIMIT = 400;       // stay under Firestore's 500-op batch cap

// tokenize — stable pseudonym for a uid. HMAC-SHA256(pepper, uid), hex. Not reversible without
// the pepper; matches the house crypto idiom (analytics-v2 session tokens).
function tokenize(uid, pepper) {
    return crypto.createHmac('sha256', pepper).update(String(uid)).digest('hex');
}

// snapshotIdFor — the calendar day (UTC) of the logical run; deterministic so re-runs overwrite.
function snapshotIdFor(date) {
    return date.toISOString().slice(0, 10); // YYYY-MM-DD
}

// weekStartMs — Monday 00:00 UTC of the week containing atMs (the trajectory time bucket).
function weekStartMs(atMs) {
    const d = new Date(atMs);
    const dowMon0 = (d.getUTCDay() + 6) % 7; // 0 = Monday
    return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() - dowMon0);
}

// deriveTrajectory — build a learner's week-by-week trajectory from their OWN activity events
// (live, no persisted store). Each event: { at (Timestamp|ms), seconds?, labId?, path? }. Returns
// weeks ascending, each with that week's metrics plus running cumulative position (for velocity).
function deriveTrajectory(events) {
    const weeks = new Map();
    for (const ev of events || []) {
        const atMs = ev.at && ev.at.toMillis ? ev.at.toMillis() : (typeof ev.at === 'number' ? ev.at : null);
        if (!atMs) continue;
        const wk = weekStartMs(atMs);
        let b = weeks.get(wk);
        if (!b) { b = { events: 0, dwellSeconds: 0, labs: new Set(), paths: new Set() }; weeks.set(wk, b); }
        b.events += 1;
        if (typeof ev.seconds === 'number') b.dwellSeconds += ev.seconds;
        if (ev.labId) b.labs.add(ev.labId);
        if (ev.path) b.paths.add(ev.path);
    }
    const sorted = [...weeks.keys()].sort((a, b) => a - b);
    let cumEvents = 0, cumDwell = 0;
    const cumLabs = new Set();
    return sorted.map((wk) => {
        const b = weeks.get(wk);
        cumEvents += b.events;
        cumDwell += b.dwellSeconds;
        b.labs.forEach((l) => cumLabs.add(l));
        return {
            weekStart: new Date(wk).toISOString().slice(0, 10),
            events: b.events,
            dwellSeconds: b.dwellSeconds,
            distinctLabs: b.labs.size,
            distinctPaths: b.paths.size,
            cumulativeEvents: cumEvents,
            cumulativeDwellSeconds: cumDwell,
            cumulativeDistinctLabs: cumLabs.size,
        };
    });
}

// aggregateCohorts — the Stage 2 reader engine. Group tokenized cohort points by classId +
// snapshot week, average the metrics per cohort per week, and SUPPRESS any (cohort, week) cell
// with fewer than k distinct learners (k-anonymity: a tiny cohort can be re-identified by
// elimination even when tokenized). Returns cohorts keyed by classId with a sorted weekly series,
// plus a suppressed list (counts only) for transparency. Pure + unit-testable.
function aggregateCohorts(points, k = 5) {
    const byClassWeek = new Map(); // classId -> (snapshotId -> {tokens:Set, sums...})
    for (const p of points || []) {
        const cls = p.classId || '(unassigned)';
        const wk = p.snapshotId;
        if (!wk) continue;
        if (!byClassWeek.has(cls)) byClassWeek.set(cls, new Map());
        const weeks = byClassWeek.get(cls);
        let cell = weeks.get(wk);
        if (!cell) { cell = { tokens: new Set(), sumEvents: 0, sumDwell: 0, sumLabs: 0, sumPaths: 0 }; weeks.set(wk, cell); }
        cell.tokens.add(p.token);
        cell.sumEvents += p.events || 0;
        cell.sumDwell += p.dwellSeconds || 0;
        cell.sumLabs += p.distinctLabs || 0;
        cell.sumPaths += p.distinctPaths || 0;
    }
    const cohorts = {};
    const suppressed = [];
    for (const [cls, weeks] of byClassWeek) {
        const series = [];
        for (const [wk, cell] of weeks) {
            const n = cell.tokens.size;
            if (n < k) { suppressed.push({ classId: cls, snapshotId: wk, n }); continue; } // k-anon
            series.push({
                snapshotId: wk, n,
                avgEvents: Math.round(cell.sumEvents / n),
                avgDwellSeconds: Math.round(cell.sumDwell / n),
                avgDistinctLabs: Math.round((cell.sumLabs / n) * 10) / 10,
                avgDistinctPaths: Math.round((cell.sumPaths / n) * 10) / 10,
            });
        }
        series.sort((a, b) => (a.snapshotId < b.snapshotId ? -1 : 1));
        if (series.length) cohorts[cls] = series;
    }
    return { cohorts, suppressed, k };
}

// loadConsentedLearners — Map uid -> classId for learners with a consent/enrollment record
// who have NOT declined. Mirrors the telemetry CF gate exactly: declined iff participates===false
// on EITHER doc. classId (enrollment wins, then consent) is the cohort key for the Stage 2 reader.
async function loadConsentedLearners(db) {
    const [enrollSnap, consentSnap] = await Promise.all([
        db.collection('observatory_enrollment').get(),
        db.collection('observatory_consent').get(),
    ]);
    const declined = new Set();
    const classById = new Map();
    enrollSnap.forEach((d) => { const e = d.data() || {}; if (e.participates === false) declined.add(d.id); classById.set(d.id, e.classId || null); });
    consentSnap.forEach((d) => { const c = d.data() || {}; if (c.participates === false) declined.add(d.id); if (!classById.has(d.id)) classById.set(d.id, c.classId || null); });
    const out = new Map();
    for (const [uid, classId] of classById) if (!declined.has(uid)) out.set(uid, classId);
    return out;
}

// aggregateActivity — cumulative position per consented uid from observatory_activity. v1 reads
// the full collection; switch to an incremental fold if volume grows (noted in the design doc).
async function aggregateActivity(db, consented) {
    const perUid = new Map();
    const snap = await db.collection('observatory_activity').get();
    snap.forEach((d) => {
        const ev = d.data() || {};
        const uid = ev.uid;
        if (!uid || !consented.has(uid)) return;
        let m = perUid.get(uid);
        if (!m) { m = { events: 0, dwellSeconds: 0, labs: new Set(), paths: new Set(), lastAt: null }; perUid.set(uid, m); }
        m.events += 1;
        if (typeof ev.seconds === 'number') m.dwellSeconds += ev.seconds;
        if (ev.labId) m.labs.add(ev.labId);
        if (ev.path) m.paths.add(ev.path);
        const at = ev.at && ev.at.toMillis ? ev.at.toMillis() : null;
        if (at && (!m.lastAt || at > m.lastAt)) m.lastAt = at;
    });
    return perUid;
}

// buildPoint — the v1 position metrics WITHOUT any identifier (Plane B carries no classId).
function buildPoint(m) {
    return {
        events: m ? m.events : 0,
        dwellSeconds: m ? m.dwellSeconds : 0,
        distinctLabs: m ? m.labs.size : 0,
        distinctPaths: m ? m.paths.size : 0,
        lastActivityAt: m && m.lastAt ? Timestamp.fromMillis(m.lastAt) : null,
    };
}

// runSnapshot — the Plane-B-only snapshot core (unit-testable). `now` is the LOGICAL scheduled
// date so a delayed retry can't split a week across two snapshotIds.
async function runSnapshot(db, pepper, now) {
    if (!pepper || pepper.length < 16) {
        throw new Error('[sextant] SEXTANT_PEPPER is missing or too short — aborting to protect token stability.');
    }
    // Belt-and-suspenders: finish any withdrawal whose Plane-B purge failed at withdrawal time.
    const reconciliation = await reconcileWithdrawals(db, pepper);
    const snapshotId = snapshotIdFor(now);
    const cutoff = now.getTime() - ACTIVE_WINDOW_DAYS * DAY_MS;
    const consented = await loadConsentedLearners(db);
    const activity = await aggregateActivity(db, consented);

    let pointsWritten = 0;
    let writes = 0;
    let batch = db.batch();
    const flush = async () => { await batch.commit(); batch = db.batch(); writes = 0; };

    for (const [uid, classId] of consented) {
        const m = activity.get(uid);
        if (!m || !m.lastAt || m.lastAt < cutoff) continue; // recency gate

        const point = buildPoint(m);
        // Plane B — the only persisted store: a tokenized cohort point. NO uid/name/email. Carries
        // classId as the cohort key for the Stage 2 reader; this is admin-read-only and the reader
        // applies k-anonymity (never displays a cohort below k), so classId here is not a re-id vector.
        // Doc id = snapshot__token → idempotent overwrite on re-run. (No Plane A: the self-view is
        // derived live from the learner's own activity, so nothing identified is persisted.)
        const token = tokenize(uid, pepper);
        batch.set(db.collection('sextant_cohort_points').doc(snapshotId + '__' + token), {
            token, classId: classId || null, snapshotId, snapshotAt: Timestamp.fromDate(now), ...point,
        });
        writes++;
        pointsWritten++;
        if (writes >= BATCH_LIMIT) await flush();
    }
    if (writes > 0) await batch.commit();

    const summary = {
        snapshotId,
        startedAt: Timestamp.fromDate(now),
        finishedAt: FieldValue.serverTimestamp(),
        consentedLearners: consented.size,
        pointsWritten,
        reconciledWithdrawals: reconciliation.reconciledLearners,
        reconciledCohortPoints: reconciliation.reconciledPoints,
        reconcileFailures: reconciliation.failed,
    };
    await db.collection('sextant_runs').doc(snapshotId).set(summary); // deterministic id
    return summary;
}

// purgeLearner — withdrawal hook. Under design D the only persisted Sextant store is Plane B, so
// this deletes the learner's tokenized cohort points (found by recomputing their token). The
// self-view needs no purge: withdrawal already deletes the underlying observatory_activity it is
// derived from. FAILS LOUD if the pepper is unavailable: real Plane-B data may exist (the snapshot
// job wrote it with the pepper) and could NOT be found without it, so a silent no-op would falsely
// report a completed deletion. The caller records this failure and reconcileWithdrawals cleans it up.
async function purgeLearner(db, uid, pepper) {
    if (!pepper) {
        throw new Error('[sextant] purgeLearner: SEXTANT_PEPPER unavailable — cannot resolve token to purge Plane B for ' + uid);
    }
    const token = tokenize(uid, pepper);
    let deletedCohortPoints = 0;
    let more = true;
    while (more) {
        const s = await db.collection('sextant_cohort_points').where('token', '==', token).limit(BATCH_LIMIT).get();
        if (s.empty) break;
        const b = db.batch();
        s.docs.forEach((d) => b.delete(d.ref));
        await b.commit();
        deletedCohortPoints += s.size;
        more = s.size === BATCH_LIMIT;
    }
    return { deletedCohortPoints };
}

// reconcileWithdrawals — belt-and-suspenders guarantee for the right-to-withdraw. Any withdrawal
// whose Plane-B purge did not complete at withdrawal time (the pepper was unavailable to that
// callable) leaves an observatory_withdrawals tombstone with sextantPurged===false. This runs at
// the top of every weekly snapshot — which holds a validated pepper — recomputes each such
// learner's token, deletes their cohort points, and marks the tombstone reconciled. Idempotent.
async function reconcileWithdrawals(db, pepper) {
    const snap = await db.collection('observatory_withdrawals').where('sextantPurged', '==', false).get();
    let reconciledLearners = 0, reconciledPoints = 0, failed = 0;
    for (const d of snap.docs) {
        // Isolate the failure domain: one flaky reconciliation must NOT abort the whole weekly
        // snapshot for every consented learner. On error, leave the tombstone sextantPurged:false
        // so the next run retries it, and continue with the rest.
        try {
            const r = await purgeLearner(db, d.id, pepper);
            await d.ref.set({ sextantPurged: true, sextantReconciledAt: FieldValue.serverTimestamp() }, { merge: true });
            reconciledLearners += 1;
            reconciledPoints += r.deletedCohortPoints;
        } catch (e) {
            failed += 1;
            console.error('[sextant] reconcileWithdrawals: could not reconcile ' + d.id + ':', e.message);
        }
    }
    return { reconciledLearners, reconciledPoints, failed };
}

// sextantSnapshot — scheduled entry point. Weekly (Sun 06:00 ET). Uses the logical scheduled
// time for the snapshotId so a delayed retry files under the correct week.
const sextantSnapshot = onSchedule(
    {
        schedule: '0 6 * * 0',
        region: 'us-central1',
        timeZone: 'America/New_York',
        memory: '512MiB',
        timeoutSeconds: 540,
        retryConfig: { retryCount: 1 },
        secrets: [SEXTANT_PEPPER],
    },
    async (event) => {
        const db = getFirestore();
        const logical = event && event.scheduleTime ? new Date(event.scheduleTime) : new Date();
        const summary = await runSnapshot(db, SEXTANT_PEPPER.value(), logical);
        console.log('[sextant] snapshot complete', JSON.stringify(summary));
    }
);

module.exports = {
    sextantSnapshot, runSnapshot, purgeLearner, reconcileWithdrawals, deriveTrajectory,
    aggregateCohorts, tokenize, snapshotIdFor, weekStartMs, buildPoint, loadConsentedLearners,
};
