/**
 * sextant.js — Sextant Stage 1: the consented learner-trajectory snapshot pipeline.
 *
 * Design: _docs/architecture/career-trajectory-navigator.md
 *
 * On a schedule, freeze each CONSENTED, RECENTLY-ACTIVE learner's cumulative position
 * into two planes:
 *   Plane A (identified, self-view): /users/{uid}/sextant_trajectory/{snapshotId}
 *                                    — the learner reads only their own (firestore.rules).
 *   Plane B (tokenized, research):   /sextant_cohort_points/{snapshotId__token}
 *                                    — NO PII: uid replaced by HMAC(pepper, uid); no classId
 *                                      (dropped until k-anonymity suppression lands).
 *
 * Privacy is enforced at THIS pipe, so every downstream reader is born clean:
 *   - Decline gate mirrors the telemetry CF: a learner is excluded iff participates===false
 *     on EITHER observatory_enrollment OR observatory_consent (absent/true = consented).
 *   - Recency gate: only learners with activity inside ACTIVE_WINDOW_DAYS get new points,
 *     so the two archives do not accrete near-empty rows forever.
 *   - Plane B carries a stable pseudonymous token, never a uid/name/email/classId.
 *   - Withdrawal purges both planes (see purgeLearner + withdrawFromObservatory).
 *   - The pepper is a crown-jewel secret (Secret Manager: SEXTANT_PEPPER); never leaves the
 *     server. Token stability across runs REQUIRES reusing the same pepper, so the function
 *     fails loud if the secret is missing rather than silently minting a random pepper.
 */
const { onSchedule } = require('firebase-functions/v2/scheduler');
const { defineSecret } = require('firebase-functions/params');
const { getFirestore, Timestamp, FieldValue } = require('firebase-admin/firestore');
const crypto = require('crypto');

// The pepper: a single global HMAC key shared across all learners and all runs. Retained
// (not per-record) so a learner maps to the same token every term — what enables cross-class
// tracking and withdrawal-purge by token. Provisioned out-of-band in Secret Manager.
const SEXTANT_PEPPER = defineSecret('SEXTANT_PEPPER');

// Only snapshot learners active within this window; dormant learners keep their existing
// history but stop getting new near-empty points written each week.
const ACTIVE_WINDOW_DAYS = 90;
const DAY_MS = 86400000;
const BATCH_LIMIT = 400; // stay under Firestore's 500-op batch cap

// tokenize — stable pseudonym for a uid. HMAC-SHA256(pepper, uid), hex. Not reversible
// without the pepper; matches the house crypto idiom (analytics-v2 session tokens).
function tokenize(uid, pepper) {
    return crypto.createHmac('sha256', pepper).update(String(uid)).digest('hex');
}

// snapshotId — the calendar day (UTC) of the logical run. One trajectory point per learner
// per day; deterministic so re-runs of the same day overwrite rather than duplicate.
function snapshotIdFor(date) {
    return date.toISOString().slice(0, 10); // YYYY-MM-DD
}

// loadConsentedLearners — map uid -> { classId, className } for learners who have a consent
// or enrollment record and have NOT declined research. Mirrors the telemetry CF gate exactly:
// declined iff participates===false on EITHER doc; a learner with only a consent doc is still
// admitted (record existence, not classId, is the gate).
async function loadConsentedLearners(db) {
    const [enrollSnap, consentSnap] = await Promise.all([
        db.collection('observatory_enrollment').get(),
        db.collection('observatory_consent').get(),
    ]);
    const declined = new Set();
    const info = new Map();
    enrollSnap.forEach((d) => {
        const e = d.data() || {};
        if (e.participates === false) declined.add(d.id);
        info.set(d.id, { classId: e.classId || null, className: e.className || null });
    });
    consentSnap.forEach((d) => {
        const c = d.data() || {};
        if (c.participates === false) declined.add(d.id);
        if (!info.has(d.id)) info.set(d.id, { classId: c.classId || null, className: null });
    });
    const out = new Map();
    for (const [uid, v] of info) if (!declined.has(uid)) out.set(uid, v);
    return out;
}

// aggregateActivity — cumulative position per uid from observatory_activity. v1 reads the
// full collection and folds it into per-learner metrics. Volume is modest today; if it grows,
// switch to an incremental fold keyed off the previous snapshot (noted in the design doc).
async function aggregateActivity(db, consented) {
    const perUid = new Map();
    const snap = await db.collection('observatory_activity').get();
    snap.forEach((d) => {
        const ev = d.data() || {};
        const uid = ev.uid;
        if (!uid || !consented.has(uid)) return; // only consented learners
        let m = perUid.get(uid);
        if (!m) {
            m = { events: 0, dwellSeconds: 0, labs: new Set(), paths: new Set(), lastAt: null };
            perUid.set(uid, m);
        }
        m.events += 1;
        if (typeof ev.seconds === 'number') m.dwellSeconds += ev.seconds;
        if (ev.labId) m.labs.add(ev.labId);
        if (ev.path) m.paths.add(ev.path);
        const at = ev.at && ev.at.toMillis ? ev.at.toMillis() : null;
        if (at && (!m.lastAt || at > m.lastAt)) m.lastAt = at;
    });
    return perUid;
}

// buildPoint — the v1 trajectory metrics (position scalars), WITHOUT any identifier. classId
// is added onto Plane A only by the caller; Plane B never receives it.
function buildPoint(m) {
    return {
        events: m ? m.events : 0,
        dwellSeconds: m ? m.dwellSeconds : 0,
        distinctLabs: m ? m.labs.size : 0,
        distinctPaths: m ? m.paths.size : 0,
        lastActivityAt: m && m.lastAt ? Timestamp.fromMillis(m.lastAt) : null,
    };
}

// runSnapshot — the core, factored out of the schedule wrapper so it is unit-testable.
// `now` is the LOGICAL scheduled date (not wall-clock at retry) so a delayed retry cannot
// split one week across two snapshotIds. Returns the run summary.
async function runSnapshot(db, pepper, now) {
    if (!pepper || pepper.length < 16) {
        // Fail loud: a missing/short pepper would fork token identity and corrupt the
        // archive. Never proceed with a weak or absent key.
        throw new Error('[sextant] SEXTANT_PEPPER is missing or too short — aborting to protect token stability.');
    }
    const snapshotId = snapshotIdFor(now);
    const cutoff = now.getTime() - ACTIVE_WINDOW_DAYS * DAY_MS;
    const consented = await loadConsentedLearners(db);
    const activity = await aggregateActivity(db, consented);

    let pointsWritten = 0;
    let writes = 0;
    let batch = db.batch();
    const flush = async () => { await batch.commit(); batch = db.batch(); writes = 0; };

    for (const [uid, enroll] of consented) {
        const m = activity.get(uid);
        // Recency gate: skip learners with no activity or activity older than the window.
        if (!m || !m.lastAt || m.lastAt < cutoff) continue;

        const point = buildPoint(m);
        const stampedA = { classId: enroll.classId || null, ...point, snapshotId, snapshotAt: Timestamp.fromDate(now) };
        // Plane A — identified, the learner's own trajectory point (they read only this).
        batch.set(db.collection('users').doc(uid).collection('sextant_trajectory').doc(snapshotId), stampedA);
        writes++;

        // Plane B — tokenized cohort point. NO uid/name/email/classId. Doc id = snapshot__token
        // so re-running a day is idempotent (overwrites, never duplicates).
        const token = tokenize(uid, pepper);
        batch.set(db.collection('sextant_cohort_points').doc(snapshotId + '__' + token), {
            token, snapshotId, snapshotAt: Timestamp.fromDate(now), ...point,
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
        pointsWritten, // learners with a point written this run (active within the window)
    };
    // Deterministic id → a re-run of the same day overwrites its own summary, not duplicates.
    await db.collection('sextant_runs').doc(snapshotId).set(summary);
    return summary;
}

// purgeLearner — the withdrawal hook. Deletes a learner's Sextant data from BOTH planes so
// the platform's right-to-withdraw covers this feature. Plane A by subcollection scan; Plane B
// by token (needs the pepper — but if the pepper is absent no Plane B data could have been
// written, so there is nothing to purge). Idempotent and safe to call for a never-snapshotted uid.
async function purgeLearner(db, uid, pepper) {
    let deletedTrajectory = 0;
    const aSnap = await db.collection('users').doc(uid).collection('sextant_trajectory').get();
    if (!aSnap.empty) {
        let b = db.batch(), n = 0;
        for (const d of aSnap.docs) { b.delete(d.ref); if (++n >= BATCH_LIMIT) { await b.commit(); b = db.batch(); n = 0; } }
        if (n > 0) await b.commit();
        deletedTrajectory = aSnap.size;
    }
    let deletedCohortPoints = 0;
    if (pepper) {
        const token = tokenize(uid, pepper);
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
    }
    return { deletedTrajectory, deletedCohortPoints };
}

// sextantSnapshot — the scheduled entry point. Weekly (Sun 06:00 ET). Uses the logical
// scheduled time (event.scheduleTime) for the snapshotId, not wall-clock, so a delayed retry
// files under the correct week.
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

module.exports = { sextantSnapshot, runSnapshot, purgeLearner, tokenize, snapshotIdFor, buildPoint, loadConsentedLearners };
