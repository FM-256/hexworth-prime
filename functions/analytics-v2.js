/**
 * Cloud Functions for Student Analytics v2 — event log platform.
 * Architecture: _docs/architecture/student-analytics-v2.md
 *
 * Exports:
 *   getSessionToken       — issues a signed JWT-ish token (15min)
 *   refreshSessionToken   — re-issues a token preserving sessionId
 *   ingestEvents          — batched event ingestion (validates, idempotent, writes)
 *   projectEvent          — Firestore onCreate trigger; updates projections
 *   projectorHeartbeatJob — Cloud Scheduler job; writes heartbeat doc
 *
 * Phase 1 scope: dimensions 1, 2, 9, 10. Other dimensions ship in later phases.
 */

const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { onDocumentCreated } = require('firebase-functions/v2/firestore');
const { onSchedule } = require('firebase-functions/v2/scheduler');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
const crypto = require('crypto');

const { validateEventPayload } = require('./schemas/events/validator');
const { listLoadedTypes, getGovernance } = require('./schemas/events');

const cfOptions = { region: 'us-central1', enforceAppCheck: false };

// Token signing secret. In production this is rotated at deploy time; the
// secret is process-local so it auto-rotates per CF revision. For session
// tokens (15-min lifetime) this is acceptable.
const SESSION_TOKEN_SECRET = process.env.SESSION_TOKEN_SECRET ||
    crypto.randomBytes(32).toString('hex');

const TOKEN_TTL_SEC = 15 * 60;       // 15 minutes
const TOKEN_GRACE_SEC = 2 * 60;      // 2-minute refresh grace window

// ─── Token helpers ──────────────────────────────────────────────────

function _b64urlEncode(buf) {
    return Buffer.from(buf).toString('base64')
        .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

function _b64urlDecode(str) {
    let s = str.replace(/-/g, '+').replace(/_/g, '/');
    while (s.length % 4) s += '=';
    return Buffer.from(s, 'base64');
}

/**
 * Sign a token. Tokens are JWT-shaped:
 *   <header>.<payload>.<signature>
 * where header is { alg: 'HS256', typ: 'HX-SESSION' }.
 */
function signToken(payload) {
    const header = { alg: 'HS256', typ: 'HX-SESSION' };
    const h = _b64urlEncode(JSON.stringify(header));
    const p = _b64urlEncode(JSON.stringify(payload));
    const data = `${h}.${p}`;
    const sig = crypto.createHmac('sha256', SESSION_TOKEN_SECRET)
        .update(data).digest();
    return `${data}.${_b64urlEncode(sig)}`;
}

/**
 * Verify token signature, return payload if valid.
 * Returns { ok, payload, expired, reason }.
 */
function verifyToken(token) {
    if (typeof token !== 'string' || token.split('.').length !== 3) {
        return { ok: false, reason: 'malformed' };
    }
    const [h, p, s] = token.split('.');
    const data = `${h}.${p}`;
    const expected = crypto.createHmac('sha256', SESSION_TOKEN_SECRET)
        .update(data).digest();
    const provided = _b64urlDecode(s);
    if (expected.length !== provided.length ||
        !crypto.timingSafeEqual(expected, provided)) {
        return { ok: false, reason: 'bad_signature' };
    }
    let payload;
    try {
        payload = JSON.parse(_b64urlDecode(p).toString('utf8'));
    } catch (e) {
        return { ok: false, reason: 'bad_payload' };
    }
    const now = Math.floor(Date.now() / 1000);
    if (typeof payload.exp !== 'number') {
        return { ok: false, reason: 'no_exp' };
    }
    const expiredHard = (now > payload.exp + TOKEN_GRACE_SEC);
    const expired = (now > payload.exp);
    if (expiredHard) {
        return { ok: false, reason: 'expired_hard', payload, expired: true };
    }
    return { ok: true, payload, expired };
}

// ─── 1. getSessionToken — issue token at page load ─────────────────

/**
 * Issue a fresh session token for an authenticated user.
 * Body: { tenantId, classId? }
 *   - classId may be omitted for tenant-level pages; required for class pages
 * Returns: { token, sessionId, exp, consentVersion }
 *
 * Side effects:
 *   - Creates sessions/{sessionId} doc under the student's progress record
 *   - Records consent version in force at issue time
 */
const getSessionToken = onCall(cfOptions, async (request) => {
    if (!request.auth) {
        throw new HttpsError('unauthenticated', 'Must be signed in.');
    }
    const { tenantId, classId } = request.data || {};
    if (!tenantId || typeof tenantId !== 'string') {
        throw new HttpsError('invalid-argument', 'Missing tenantId.');
    }

    const db = getFirestore();
    const uid = request.auth.uid;
    const sessionId = crypto.randomUUID();
    const now = Math.floor(Date.now() / 1000);
    const exp = now + TOKEN_TTL_SEC;

    // Look up active consent version for tenant (default "v2.0" if not set)
    let consentVersion = 'v2.0';
    try {
        const cs = await db.doc(`tenants/${tenantId}/consent/active`).get();
        if (cs.exists) consentVersion = cs.data().version || 'v2.0';
    } catch (e) {
        // First-time tenant; default to v2.0
    }

    // Create session record (path requires classId; if no class, sessionId
    // sits under a synthetic "_tenant_" classId so security rules cover it)
    const cls = classId || '_tenant_';
    await db.doc(`tenants/${tenantId}/classes/${cls}/progress/${uid}/sessions/${sessionId}`)
        .set({
            sessionId,
            uid,
            tenantId,
            classId: cls,
            startedAt: FieldValue.serverTimestamp(),
            consentVersionAtStart: consentVersion,
            tokenIssuedCount: 1,
        });

    const payload = { uid, tenantId, classId: cls, sessionId, iat: now, exp };
    return {
        token: signToken(payload),
        sessionId,
        exp,
        consentVersion,
        ttlSec: TOKEN_TTL_SEC,
    };
});

// ─── 2. refreshSessionToken — re-issue preserving sessionId ────────

/**
 * Refresh a session token. Preserves sessionId so behavioral sessions
 * survive >15min in length. Used when a near-expired token returns from
 * the client and needs renewal.
 *
 * Body: { priorToken }
 * Returns: { token, sessionId, exp }
 *
 * Validation:
 *   - priorToken signature verifies
 *   - priorToken expired ≤ TOKEN_GRACE_SEC ago (else session is dead, must call getSessionToken)
 *   - request.auth.uid matches priorToken.uid
 */
const refreshSessionToken = onCall(cfOptions, async (request) => {
    if (!request.auth) {
        throw new HttpsError('unauthenticated', 'Must be signed in.');
    }
    const { priorToken } = request.data || {};
    if (!priorToken) {
        throw new HttpsError('invalid-argument', 'Missing priorToken.');
    }

    const v = verifyToken(priorToken);
    if (!v.ok && v.reason !== 'expired_hard') {
        // bad signature, malformed, etc — refuse silently and force fresh
        throw new HttpsError('permission-denied', `Refresh denied: ${v.reason}`);
    }
    if (v.reason === 'expired_hard') {
        throw new HttpsError('failed-precondition',
            'Prior session has timed out (>2min). Call getSessionToken for a fresh session.');
    }
    if (v.payload.uid !== request.auth.uid) {
        throw new HttpsError('permission-denied', 'Token uid does not match auth uid.');
    }

    const db = getFirestore();
    const { uid, tenantId, classId, sessionId } = v.payload;
    const now = Math.floor(Date.now() / 1000);
    const exp = now + TOKEN_TTL_SEC;

    // Increment refresh counter on the session record
    await db.doc(`tenants/${tenantId}/classes/${classId}/progress/${uid}/sessions/${sessionId}`)
        .set({ tokenIssuedCount: FieldValue.increment(1), lastRefreshedAt: FieldValue.serverTimestamp() },
             { merge: true });

    const newPayload = { uid, tenantId, classId, sessionId, iat: now, exp };
    return {
        token: signToken(newPayload),
        sessionId,
        exp,
        ttlSec: TOKEN_TTL_SEC,
    };
});

// ─── 3. ingestEvents — batched event writes ────────────────────────

/**
 * Accept a batch of events from the client. Validates each, writes to Firestore.
 *
 * Body: { sessionToken, events: [ {clientEventId, type, payload, clientTs, context}, ... ] }
 * Returns: { accepted, rejected, errors: [{clientEventId, reason}] }
 *
 * Notes:
 *   - sessionToken (NOT request.auth) supplies uid/tenantId/classId/sessionId.
 *     Client cannot forge these.
 *   - clientEventId is used for idempotency: same id → same Firestore eventId
 *   - server stamps ts, server-side eventId is sha256(uid+sessionId+clientEventId)
 */
const ingestEvents = onCall(cfOptions, async (request) => {
    const { sessionToken, events } = request.data || {};
    if (!sessionToken) {
        throw new HttpsError('invalid-argument', 'Missing sessionToken.');
    }
    if (!Array.isArray(events) || events.length === 0) {
        throw new HttpsError('invalid-argument', 'events must be a non-empty array.');
    }
    if (events.length > 500) {
        throw new HttpsError('invalid-argument', 'Batch too large (>500 events).');
    }

    const v = verifyToken(sessionToken);
    if (!v.ok) {
        throw new HttpsError('unauthenticated', `Token invalid: ${v.reason}`);
    }
    const { uid, tenantId, classId, sessionId } = v.payload;

    // Auth claim must match token claim (defense-in-depth). request.auth may
    // be absent if called without Firebase Auth header — that's allowed here
    // because the session token IS the auth. But if auth IS present, it must
    // agree with the token.
    if (request.auth && request.auth.uid !== uid) {
        throw new HttpsError('permission-denied',
            'auth uid does not match token uid.');
    }

    const db = getFirestore();
    const accepted = [];
    const rejected = [];
    const writes = [];

    for (const ev of events) {
        const { clientEventId, type, payload, clientTs, context } = ev || {};
        if (!clientEventId || typeof clientEventId !== 'string') {
            rejected.push({ clientEventId: clientEventId || '<missing>', reason: 'no clientEventId' });
            continue;
        }
        if (!type || typeof type !== 'string') {
            rejected.push({ clientEventId, reason: 'no type' });
            continue;
        }

        // Validate payload against registered schema
        const result = validateEventPayload(type, payload || {});
        if (!result.valid) {
            rejected.push({
                clientEventId,
                reason: 'schema_validation',
                errors: result.errors.slice(0, 3),
            });
            continue;
        }

        // Determine destination per governance.status
        const gov = getGovernance(type) || {};
        const isIntegrity = (gov.status === 'capture-only') || type.startsWith('integrity.');

        // Stable server-side eventId for idempotency
        const eventId = crypto.createHash('sha256')
            .update(`${uid}|${sessionId}|${clientEventId}`)
            .digest('hex')
            .slice(0, 32);

        // Write target
        const baseProgress = `tenants/${tenantId}/classes/${classId}/progress/${uid}`;
        const target = isIntegrity
            ? `${baseProgress}/integrityEvents/${eventId}`
            : `${baseProgress}/events/${eventId}`;

        writes.push({
            target,
            data: {
                eventId,
                clientEventId,
                uid,
                tenantId,
                classId,
                sessionId,
                type,
                payload,
                context: context || {},
                clientTs: clientTs || null,
                serverTs: FieldValue.serverTimestamp(),
                schemaVersion: 2,
            },
        });
        accepted.push({ clientEventId, eventId });
    }

    // Batched write — Firestore caps at 500 ops/batch
    if (writes.length > 0) {
        const batch = db.batch();
        for (const w of writes) batch.set(db.doc(w.target), w.data, { merge: false });
        await batch.commit();
    }

    return { accepted, rejected };
});

// ─── 4. projectEvent — onCreate trigger for events subcollection ───

/**
 * Fired when a new event lands in tenants/{t}/classes/{c}/progress/{uid}/events/{eventId}.
 * Updates the per-student summary doc, per-item state cache, and per-class
 * aggregate counters.
 *
 * Cost reminder (arch §7.2): each invocation does ~2.5 writes. Phase 2
 * optimization is to time-window itemState updates.
 */
const projectEvent = onDocumentCreated(
    {
        document: 'tenants/{tenantId}/classes/{classId}/progress/{uid}/events/{eventId}',
        region: 'us-central1',
    },
    async (event) => {
        const data = event.data && event.data.data();
        if (!data) return;

        const { tenantId, classId, uid } = event.params;
        const db = getFirestore();

        const progressRef = db.doc(`tenants/${tenantId}/classes/${classId}/progress/${uid}`);
        const aggRef = db.doc(`tenants/${tenantId}/classes/${classId}/aggregates/classStats`);

        const updates = {
            schemaVersion: 2,
            lastEventAt: FieldValue.serverTimestamp(),
            lastEventType: data.type,
            eventCount: FieldValue.increment(1),
        };

        const aggUpdates = {
            totalEvents: FieldValue.increment(1),
            lastUpdated: FieldValue.serverTimestamp(),
            [`eventTypeCounts.${data.type.replace(/\./g, '_')}`]: FieldValue.increment(1),
        };

        // Type-specific projections
        if (data.type === 'item.start') {
            const itemId = data.payload?.itemId;
            if (itemId) {
                const itemStateRef = db.doc(
                    `tenants/${tenantId}/classes/${classId}/progress/${uid}/itemState/${itemId}`
                );
                await itemStateRef.set({
                    itemId,
                    itemType: data.payload.itemType,
                    firstStartedAt: FieldValue.serverTimestamp(),
                    lastTouchedAt: FieldValue.serverTimestamp(),
                    sessionsCount: FieldValue.increment(1),
                }, { merge: true });
            }
        } else if (data.type === 'item.complete') {
            const itemId = data.payload?.itemId;
            if (itemId) {
                const itemStateRef = db.doc(
                    `tenants/${tenantId}/classes/${classId}/progress/${uid}/itemState/${itemId}`
                );
                await itemStateRef.set({
                    itemId,
                    itemType: data.payload.itemType,
                    completedAt: FieldValue.serverTimestamp(),
                    lastTouchedAt: FieldValue.serverTimestamp(),
                    totalActiveMs: data.payload.totalActiveMs || 0,
                    score: data.payload.score ?? null,
                    passed: data.payload.passed ?? null,
                    completed: true,
                }, { merge: true });
                updates.lastCompletedItem = itemId;
            }
        } else if (data.type === 'nav.session_start') {
            updates.activeSessionCount = FieldValue.increment(1);
        } else if (data.type === 'nav.session_end') {
            updates.activeSessionCount = FieldValue.increment(-1);
            // Cap durationMs at 17 minutes (15-min token TTL + 2-min grace).
            // Defends against client-side localStorage manipulation AND
            // against legitimate "tab left open all night" sessions that
            // shouldn't credit hours of "active" time.
            const SESSION_DURATION_CAP_MS = 17 * 60 * 1000;
            const rawDuration = Number(data.payload?.durationMs) || 0;
            const cappedDuration = Math.max(0, Math.min(rawDuration, SESSION_DURATION_CAP_MS));
            updates.totalSessionMs = FieldValue.increment(cappedDuration);
        } else if (data.type === 'nav.heartbeat') {
            // Heartbeats just touch the summary; no per-item update on heartbeat
            // to keep cost down (heartbeat is the highest-frequency event)
            updates.lastHeartbeatAt = FieldValue.serverTimestamp();
        }

        await Promise.all([
            progressRef.set(updates, { merge: true }),
            aggRef.set(aggUpdates, { merge: true }),
        ]);
    }
);

// ─── 5. projectorHeartbeatJob — confirms pipeline alive ────────────

/**
 * Cloud Scheduler job, runs every 1 minute. Writes heartbeat doc.
 * Instructor UI reads this to detect projector lag (arch §7.1).
 */
const projectorHeartbeatJob = onSchedule(
    { schedule: 'every 1 minutes', region: 'us-central1' },
    async () => {
        const db = getFirestore();
        await db.doc('analytics_v2/projectorHeartbeat').set({
            lastBeatAt: FieldValue.serverTimestamp(),
            schemaVersion: 2,
            phase: 1,
            loadedEventTypes: listLoadedTypes(),
        }, { merge: true });
    }
);

module.exports = {
    getSessionToken,
    refreshSessionToken,
    ingestEvents,
    projectEvent,
    projectorHeartbeatJob,
};
