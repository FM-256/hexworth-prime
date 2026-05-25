/**
 * hex-ai-bridge — Cloud Function bridge from hexworth.com to the Dr. Hex
 * orchestrator on hexclass.
 *
 * Architecture: _docs/architecture/dr-hex-orchestrator.md (v0.3.0)
 * Network shape: _docs/architecture/hex-ai-network-exposure.md (Cloudflare Tunnel)
 *
 * Flow:
 *   1. Client (signed-in Firebase user) calls hexAiChat() with { message,
 *      house, mission_id, failed_attempts, hint_used_recently }
 *   2. CF validates Firebase Auth ID token (onCall handles this)
 *   3. CF derives role from admin claim — never trusts client-supplied role
 *   4. CF reads HEX_AI_URL + HEX_AI_API_KEY from Secret Manager
 *   5. CF POSTs to orchestrator with X-API-Key header
 *   6. CF returns the orchestrator response to the client
 *
 * Streaming: not supported in onCall (Firebase callable functions are
 * unary). Streaming UX will need an HTTP function + SSE bridge — deferred
 * to v0.4.0+.
 *
 * Security notes (per Nancy review pattern):
 * - role is derived server-side from admin custom claim, NOT from client
 * - failed_attempts derived from Firestore (v0.4.0) — client value ignored
 * - HEX_AI_API_KEY is in Secret Manager, NEVER in client code
 * - 30s upstream timeout — if orchestrator is slow or down, client sees
 *   a clean error, not a hung promise
 */
const { onCall, onRequest, HttpsError } = require('firebase-functions/v2/https');
const { defineSecret } = require('firebase-functions/params');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
const { getAuth } = require('firebase-admin/auth');

// firebase-admin is initialized by index.js (initializeApp() at module load)
// before this file is required, so getFirestore() is safe to call at module scope.
const db = getFirestore();

const hexAiUrl = defineSecret('HEX_AI_URL');                       // e.g. https://hex-ai.hexworth.tech
const hexAiApiKey = defineSecret('HEX_AI_API_KEY');                // matches one entry in HEX_API_KEYS on hexclass
const cfAccessClientId = defineSecret('CF_ACCESS_CLIENT_ID');      // optional — Cloudflare Access service token
const cfAccessClientSecret = defineSecret('CF_ACCESS_CLIENT_SECRET'); // optional — paired with above

/**
 * Build outbound headers for orchestrator requests, including Cloudflare
 * Access service-token headers when those secrets are configured.
 *
 * The CF Access headers are OPTIONAL — undefined secrets evaluate to ''
 * and the headers are simply not set. This keeps emulator + dev-mode
 * happy when no tunnel is up. Production deploys MUST set them once
 * the Cloudflare Access policy is in place (per the deploy runbook).
 */
function buildUpstreamHeaders(extra = {}) {
    const headers = {
        'Content-Type': 'application/json',
        'X-API-Key': hexAiApiKey.value(),
        ...extra,
    };
    let cfId = '', cfSecret = '';
    try { cfId = cfAccessClientId.value(); } catch (_) { /* secret not set */ }
    try { cfSecret = cfAccessClientSecret.value(); } catch (_) { /* secret not set */ }
    if (cfId && cfSecret) {
        headers['CF-Access-Client-Id'] = cfId;
        headers['CF-Access-Client-Secret'] = cfSecret;
    }
    return headers;
}

const TIMEOUT_MS = 30000;                              // hard cap; CF max is 540s but UX needs faster fail
const ADMIN_EMAILS = ['f.mora80@gmail.com', 'jorden@hexworth.com'];

// Window over which "recent" failed attempts count toward help-level
// escalation. 30 minutes is the orchestrator-side semantic of "this
// session"; longer windows make the AI more permissive on returning students.
const FAILED_ATTEMPTS_WINDOW_MS = 30 * 60 * 1000;

const cfOptions = {
    region: 'us-central1',
    secrets: [hexAiUrl, hexAiApiKey, cfAccessClientId, cfAccessClientSecret],
    timeoutSeconds: 60,
    memory: '256MiB',
};

/**
 * Derive failed_attempts server-side from Firestore.
 *
 * Closes the v0.3.0 gap where the client could lie about failed_attempts
 * to force help-level auto-escalation. Server reads the same per-user
 * flag_attempts / flag_captures collections that validateFlag writes.
 *
 * Heuristic: number of distinct flagIds attempted in the window but
 * NOT yet captured for this mission. A flagId attempted 5 times in a
 * row without capture counts as 1 failed objective, not 5 — that
 * matches the orchestrator's "this student is stuck on this thing"
 * semantic better than raw attempt count.
 *
 * Failure mode: if Firestore is unreachable or no missionId provided,
 * returns 0 (conservative — never inflates help level on error). Never
 * falls back to a client-supplied value, which would re-open the bypass.
 *
 * @param {string} uid - Firebase auth UID
 * @param {string|null} missionId - the boxId / labId; null if no mission context
 * @returns {Promise<number>}
 */
async function deriveFailedAttempts(uid, missionId) {
    if (!missionId) return 0;
    try {
        const since = new Date(Date.now() - FAILED_ATTEMPTS_WINDOW_MS);

        const [attemptsSnap, capturesSnap] = await Promise.all([
            db.collection(`users/${uid}/flag_attempts`)
                .where('boxId', '==', missionId)
                .where('timestamp', '>=', since)
                .get(),
            db.collection(`users/${uid}/flag_captures`)
                .where('boxId', '==', missionId)
                .get(),
        ]);

        // Distinct flagIds attempted but not captured.
        const capturedFlagIds = new Set(
            capturesSnap.docs.map(d => d.data().flagId).filter(Boolean)
        );
        const attemptedUncapturedFlagIds = new Set();
        for (const doc of attemptsSnap.docs) {
            const fid = doc.data().flagId;
            // '__scan__' is the placeholder for "submitted without a target flagId"
            // — counts as one undifferentiated failed attempt.
            if (!fid || fid === '__scan__') {
                attemptedUncapturedFlagIds.add('__scan__');
                continue;
            }
            if (!capturedFlagIds.has(fid)) {
                attemptedUncapturedFlagIds.add(fid);
            }
        }
        return attemptedUncapturedFlagIds.size;
    } catch (e) {
        console.warn(`deriveFailedAttempts(uid=${uid}, mission=${missionId}) failed:`, e.message);
        return 0;
    }
}

async function postToOrchestrator(url, body) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    try {
        const r = await fetch(`${url}/chat`, {
            method: 'POST',
            headers: buildUpstreamHeaders(),
            body: JSON.stringify(body),
            signal: controller.signal,
        });
        if (!r.ok) {
            const text = await r.text().catch(() => '<unreadable>');
            throw new HttpsError(
                'internal',
                `orchestrator returned ${r.status}: ${text.slice(0, 200)}`
            );
        }
        return await r.json();
    } catch (e) {
        if (e.name === 'AbortError') {
            throw new HttpsError('deadline-exceeded', 'orchestrator timed out');
        }
        if (e instanceof HttpsError) throw e;
        throw new HttpsError('unavailable', `orchestrator unreachable: ${e.message}`);
    } finally {
        clearTimeout(timer);
    }
}

/**
 * hexAiChat — public callable function for student/operator AI chat.
 *
 * Request body (client → CF):
 *   {
 *     message:           string (required)
 *     house:             string | null
 *     mission_id:        string | null
 *     failed_attempts:   integer (default 0 — TODO move to Firestore lookup)
 *     hint_used_recently: boolean (default false)
 *   }
 *
 * Response (CF → client):
 *   {
 *     response:           string (the model output)
 *     persona:            string slug
 *     persona_name:       string
 *     help_level:         integer
 *     help_level_label:   string
 *     model:              string
 *     latency_ms:         integer
 *   }
 *
 * Throws HttpsError on:
 *   - unauthenticated         : no Firebase user
 *   - invalid-argument        : message missing or empty
 *   - deadline-exceeded       : orchestrator > 30s
 *   - unavailable             : orchestrator unreachable
 *   - internal                : orchestrator returned non-200
 */
exports.hexAiChat = onCall(cfOptions, async (request) => {
    if (!request.auth) {
        throw new HttpsError('unauthenticated', 'Must be signed in.');
    }

    const data = request.data || {};
    const message = (data.message || '').toString().trim();
    if (!message) {
        throw new HttpsError('invalid-argument', 'message is required');
    }
    // 2000 char cap, aligned with orchestrator (student-hardening
    // 2026-05-25). Rejecting at the edge is cheaper than at the
    // orchestrator. Real student questions are well under 500 chars.
    if (message.length > 2000) {
        throw new HttpsError('invalid-argument', 'message too long (max 2000 chars)');
    }

    // Derive role server-side from admin claim. Never trust the client.
    // request.auth.token.admin is set by setAdminClaim. Email check is a
    // belt-and-suspenders fallback in case the claim was wiped.
    const email = (request.auth.token.email || '').toLowerCase();
    const isAdmin = request.auth.token.admin === true || ADMIN_EMAILS.includes(email);
    const role = isAdmin ? 'instructor' : 'student';

    // v0.4.0: failed_attempts derived from Firestore, NOT from client.
    // Closes the help-level escalation bypass — a student lying about
    // their failed_attempts can no longer force the AI into a higher
    // disclosure ceiling.
    const failed_attempts = await deriveFailedAttempts(
        request.auth.uid,
        data.mission_id || null
    );

    const body = {
        user_uid: request.auth.uid,
        message,
        house: data.house || null,
        mission_id: data.mission_id || null,
        role,
        failed_attempts,
        // hint_used_recently still client-supplied — no server-side
        // hint-usage tracking exists yet. Defer to v0.4.1 if/when
        // hint analytics ship.
        hint_used_recently: data.hint_used_recently === true,
        // v0.6.1: conversation_id passthrough — client mints UUID v4,
        // CF forwards without inspection. UID-mismatch defense is on
        // the orchestrator side (matches stored uid against this
        // request's request.auth.uid).
        conversation_id: typeof data.conversation_id === 'string'
            ? data.conversation_id : null,
    };

    const orch = await postToOrchestrator(hexAiUrl.value(), body);

    return {
        response: orch.response,
        persona: orch.persona,
        persona_name: orch.persona_name,
        help_level: orch.help_level,
        help_level_label: orch.help_level_label,
        model: orch.model,
        latency_ms: orch.latency_ms,
    };
});

/**
 * hexAiHealth — non-authenticated health probe for the bridge.
 *
 * Returns whether the orchestrator is reachable from the CF runtime.
 * Use this to detect "CF can talk to hexclass" failures separately from
 * "CF code is broken" failures. Returns shape:
 *   {
 *     bridge: "ok",
 *     orchestrator: "ok" | "unreachable: <reason>",
 *     orchestrator_version: string | null,
 *   }
 */
/**
 * hexAiChatStream — HTTP endpoint that forwards SSE from the orchestrator.
 *
 * onCall is unary (Firebase callable functions buffer the entire response
 * before returning), so streaming requires an HTTP function. This endpoint:
 *
 *   1. Reads `Authorization: Bearer <Firebase ID token>` and verifies it
 *      via Firebase Admin SDK (matches what onCall does internally).
 *   2. Derives role + failed_attempts server-side (same logic as hexAiChat).
 *   3. POSTs to orchestrator /chat/stream with X-API-Key.
 *   4. Pipes the SSE response back to the browser chunk-by-chunk.
 *
 * CORS — explicit allowlist of `hexworth.com` and the Firebase preview
 * domains. NOTE (per Nancy 2026-05-23): the CORS allowlist is enforced
 * by BROWSERS, not the server. A non-browser HTTP client (curl, server
 * script) bypasses CORS entirely; only the Authorization: Bearer token
 * gate prevents unauthorized access. CORS exists here to prevent a
 * malicious page on another origin from invoking this endpoint with the
 * user's credentials, NOT to be a primary auth boundary.
 *
 * Auth model rationale:
 *   - Authorization header instead of session cookies: matches the
 *     Firebase Web SDK's `user.getIdToken()` pattern, which the client
 *     already uses for callable functions.
 *   - ID token verified per-request (Admin SDK caches public keys
 *     internally). No request-side caching — auth state can change.
 *
 * Response format:
 *   - 200 OK + `Content-Type: text/event-stream`
 *   - SSE events: meta (persona/level), token (...), done (latency)
 *   - Consumed via fetch + ReadableStream on the client (EventSource
 *     can't POST or send Authorization headers).
 *   - 401 if no/invalid token; 502 if orchestrator unreachable.
 */
const ALLOWED_STREAM_ORIGINS = [
    'https://hexworth.com',
    'https://hexworth-prime.web.app',
    'https://hexworth-prime.firebaseapp.com',
    // Preview channels — Firebase Hosting injects --hexworth-prime.web.app
    // subdomains for `firebase hosting:channel:deploy`. The strict-prefix
    // check below covers them.
];

function applyCors(req, res) {
    const origin = req.headers.origin || '';

    // Same-origin requests (no Origin header) reach this endpoint via the
    // Firebase Hosting rewrite at /api/hex-ai/stream. They cannot be
    // cross-origin attacks by definition — let them through without
    // setting Access-Control-Allow-* headers (which only matter for
    // cross-origin).
    if (!origin) return true;

    const allowed = ALLOWED_STREAM_ORIGINS.includes(origin) ||
        origin.endsWith('.hexworth-prime.web.app') ||
        origin === 'http://localhost:5000' ||      // firebase emulator
        origin === 'http://127.0.0.1:5000';
    if (allowed) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Vary', 'Origin');
        res.setHeader('Access-Control-Allow-Credentials', 'true');
        res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
        res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    }
    return allowed;
}

exports.hexAiChatStream = onRequest({
    region: 'us-central1',
    secrets: [hexAiUrl, hexAiApiKey, cfAccessClientId, cfAccessClientSecret],
    timeoutSeconds: 540,        // streaming can run longer than blocking
    memory: '256MiB',
}, async (req, res) => {
    const corsAllowed = applyCors(req, res);

    if (req.method === 'OPTIONS') {
        res.status(corsAllowed ? 204 : 403).end();
        return;
    }
    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }
    if (!corsAllowed) {
        res.status(403).json({ error: 'Origin not allowed' });
        return;
    }

    // Verify Firebase ID token from Authorization header.
    const authHeader = req.headers.authorization || '';
    const m = authHeader.match(/^Bearer\s+(.+)$/i);
    if (!m) {
        res.status(401).json({ error: 'Missing Bearer token' });
        return;
    }
    let decoded;
    try {
        decoded = await getAuth().verifyIdToken(m[1]);
    } catch (e) {
        res.status(401).json({ error: 'Invalid token' });
        return;
    }
    const uid = decoded.uid;
    const email = (decoded.email || '').toLowerCase();
    const isAdmin = decoded.admin === true || ADMIN_EMAILS.includes(email);

    // Parse body (Firebase auto-parses JSON for onRequest).
    const data = (req.body && typeof req.body === 'object') ? req.body : {};
    const message = (data.message || '').toString().trim();
    if (!message || message.length > 2000) {
        res.status(400).json({ error: 'message required, <= 2000 chars' });
        return;
    }

    const failed_attempts = await deriveFailedAttempts(uid, data.mission_id || null);
    const body = {
        user_uid: uid,
        message,
        house: data.house || null,
        mission_id: data.mission_id || null,
        role: isAdmin ? 'instructor' : 'student',
        failed_attempts,
        hint_used_recently: data.hint_used_recently === true,
        // v0.6.1: conversation_id passthrough for streaming path too
        conversation_id: typeof data.conversation_id === 'string'
            ? data.conversation_id : null,
    };

    // Open the upstream SSE stream from the orchestrator.
    // TWO timeouts:
    //   - controller (manual abort): fires on browser disconnect
    //   - inactivityTimer: aborts upstream if no bytes received for
    //     UPSTREAM_INACTIVITY_MS. Prevents CF instance from being held
    //     for the full 540s timeoutSeconds when orchestrator hangs
    //     mid-stream (per Nancy review 2026-05-23 — that's $$ leaking).
    const controller = new AbortController();
    req.on('close', () => controller.abort());
    const UPSTREAM_INACTIVITY_MS = 60000;   // 60s of no bytes = upstream dead
    let inactivityTimer = setTimeout(
        () => controller.abort(),
        UPSTREAM_INACTIVITY_MS
    );
    const resetInactivity = () => {
        clearTimeout(inactivityTimer);
        inactivityTimer = setTimeout(() => controller.abort(), UPSTREAM_INACTIVITY_MS);
    };

    let upstream;
    try {
        upstream = await fetch(`${hexAiUrl.value()}/chat/stream`, {
            method: 'POST',
            headers: buildUpstreamHeaders({ 'Accept': 'text/event-stream' }),
            body: JSON.stringify(body),
            signal: controller.signal,
        });
    } catch (e) {
        clearTimeout(inactivityTimer);
        res.status(502).json({ error: `orchestrator unreachable: ${e.message}` });
        return;
    }

    if (!upstream.ok) {
        clearTimeout(inactivityTimer);
        const text = await upstream.text().catch(() => '<unreadable>');
        res.status(502).json({ error: `orchestrator status ${upstream.status}: ${text.slice(0, 200)}` });
        return;
    }

    // Stream SSE bytes through to the client.
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('X-Accel-Buffering', 'no');    // disable nginx-style buffering
    res.flushHeaders();

    const reader = upstream.body.getReader();
    try {
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            resetInactivity();
            res.write(value);
        }
    } catch (e) {
        // Connection broken mid-stream — send a final error event to the
        // client, then close. Don't throw — that would crash the function.
        try {
            res.write(`data: ${JSON.stringify({ type: 'error', error: e.message })}\n\n`);
        } catch (_) { /* response already closed */ }
    } finally {
        clearTimeout(inactivityTimer);
        res.end();
    }
});

/**
 * hexAiToolCallback — fire-and-forget audit log sink for the orchestrator.
 *
 * v0.6.0c-3. The orchestrator posts a record after each tool dispatch
 * (where the tool's exposure_rules.audit is True). This CF:
 *   1. Validates X-API-Key (same shared secret as HEX_AI_API_KEYS on
 *      the orchestrator — the orchestrator is the ONLY caller).
 *   2. Writes the record to Firestore `tool_invocations` collection.
 *   3. Returns 204 — orchestrator doesn't care about the response body.
 *
 * The CF is HTTP (not callable) because the orchestrator is not a
 * Firebase-Auth-authenticated client; it speaks API-key. The same
 * Cloudflare Access service-token pattern as the v0.5.0a deploy
 * runbook MAY (operator's call) be put in front of this endpoint
 * as defense-in-depth.
 *
 * Schema (write-only — students read their own via security rules):
 *   tool_invocations/{auto}
 *     uid            string    — student UID (from orchestrator's tool_ctx)
 *     tool_name      string
 *     parameters     map       — schema-validated tool params
 *     persona        string    — persona slug active at call time
 *     help_level     integer   — help level at call time
 *     role           string    — student/instructor/operator
 *     ok             boolean   — whether dispatch succeeded
 *     result_summary string    — truncated result (~500 chars) or null
 *     error          string    — error message or null
 *     code           string    — dispatch error code or null
 *     ts             timestamp — server-side serverTimestamp()
 *     ts_iso         string    — orchestrator-side ISO timestamp (cross-check)
 */
exports.hexAiToolCallback = onRequest({
    region: 'us-central1',
    secrets: [hexAiApiKey],
    timeoutSeconds: 10,
    memory: '256MiB',
}, async (req, res) => {
    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }
    // Validate X-API-Key (constant-time compare via crypto.timingSafeEqual
    // would be ideal, but Firebase Functions Node 22 has it built-in).
    const provided = req.headers['x-api-key'] || '';
    const expected = hexAiApiKey.value();
    if (!provided || !expected) {
        res.status(401).json({ error: 'X-API-Key required' });
        return;
    }
    // Buffer-equality with same-length check defeats timing oracle.
    const a = Buffer.from(provided);
    const b = Buffer.from(expected);
    if (a.length !== b.length) {
        res.status(401).json({ error: 'Invalid X-API-Key' });
        return;
    }
    const crypto = require('crypto');
    if (!crypto.timingSafeEqual(a, b)) {
        res.status(401).json({ error: 'Invalid X-API-Key' });
        return;
    }

    const body = (req.body && typeof req.body === 'object') ? req.body : {};
    const { uid, tool_name, parameters, persona, help_level, role, ok,
            result_summary, error, code, ts_iso } = body;

    // Minimal validation — the orchestrator is the trusted caller, but
    // a malformed payload should still fail loud rather than write garbage.
    if (typeof uid !== 'string' || !uid ||
        typeof tool_name !== 'string' || !tool_name ||
        typeof ok !== 'boolean') {
        res.status(400).json({ error: 'invalid payload: uid + tool_name + ok required' });
        return;
    }

    try {
        await db.collection('tool_invocations').add({
            uid,
            tool_name,
            parameters: (parameters && typeof parameters === 'object') ? parameters : {},
            persona: persona || null,
            help_level: typeof help_level === 'number' ? help_level : null,
            role: role || null,
            ok,
            result_summary: typeof result_summary === 'string' ? result_summary : null,
            error: typeof error === 'string' ? error : null,
            code: typeof code === 'string' ? code : null,
            ts: FieldValue.serverTimestamp(),
            ts_iso: typeof ts_iso === 'string' ? ts_iso : null,
        });
    } catch (e) {
        console.error('hexAiToolCallback: Firestore write failed:', e.message);
        res.status(500).json({ error: 'Firestore write failed' });
        return;
    }

    res.status(204).end();
});

/**
 * hexAiToolDispatch — runs Firestore-backed tool handlers on behalf of
 * the orchestrator (v0.6.0c-2).
 *
 * Why this is a separate CF from the chat path:
 *   Tools that touch Firestore (get_student_progress, future progress
 *   variants, etc.) need Admin SDK access. The orchestrator on hexclass
 *   intentionally does NOT have firebase-admin + service-account JSON.
 *   Per the v0.6.0c design (Path B): orchestrator dispatches the tool
 *   by name + parameters; CF runs the Admin SDK query; result returns
 *   to orchestrator; orchestrator passes back to ollama in the tool
 *   loop. Same X-API-Key as the chat path authenticates the call.
 *
 * Request shape (orchestrator → CF):
 *   POST /hexAiToolDispatch
 *   X-API-Key: <shared secret>
 *   body: {
 *     tool: "get_student_progress",
 *     parameters: { mission_id: "..." },
 *     ctx: { uid, persona_slug, help_level, role }
 *   }
 *
 * Response (CF → orchestrator):
 *   200 + { ok: true, result: {...} } on success
 *   400 + { ok: false, error: "...", code: "..." } on validation failure
 *   404 + { ok: false, error: "unknown tool", code: "unknown_tool" }
 *   500 + { ok: false, error: "...", code: "handler_crash" }
 *
 * Identity: ctx.uid comes from the orchestrator's authenticated user
 * session (which itself came from request.auth.uid in hexAiChat). The
 * CF re-validates: the X-API-Key proves the orchestrator is the caller;
 * ctx.uid is what the orchestrator believes the user is. Trust chain
 * is X-API-Key (CF<->orchestrator) + Firebase ID token (browser->CF).
 */
const TOOL_DISPATCH_HANDLERS = {
    // Each handler: async (parameters, ctx) → result object
    // Errors thrown propagate as 500 + handler_crash to the orchestrator.
    'get_student_progress': async (parameters, ctx) => {
        const missionId = parameters.mission_id;
        if (typeof missionId !== 'string' || !missionId) {
            const err = new Error('mission_id is required');
            err.code = 'schema_required';
            throw err;
        }
        const uid = ctx.uid;
        const sinceMs = Date.now() - 30 * 60 * 1000;
        const since = new Date(sinceMs);

        // Recent attempts (last 30 min) on this mission.
        const attemptsSnap = await db.collection(`users/${uid}/flag_attempts`)
            .where('boxId', '==', missionId)
            .where('timestamp', '>=', since)
            .get();
        // All captures (no time bound — student keeps progress).
        const capturesSnap = await db.collection(`users/${uid}/flag_captures`)
            .where('boxId', '==', missionId)
            .get();
        // Flag registry — to know total count for this mission.
        const registryDoc = await db.doc(`flag_registry/${missionId}`).get();
        const flagsInRegistry = registryDoc.exists
            ? Object.keys(registryDoc.data().flags || {}).length
            : null;

        const capturedFlagIds = new Set(
            capturesSnap.docs.map(d => d.data().flagId).filter(Boolean)
        );
        const attemptedFlagIds = new Set();
        let lastAttemptMs = 0;
        for (const doc of attemptsSnap.docs) {
            const data = doc.data();
            if (data.flagId && data.flagId !== '__scan__') {
                attemptedFlagIds.add(data.flagId);
            }
            const ts = data.timestamp;
            const ms = ts && ts.toMillis ? ts.toMillis() : 0;
            if (ms > lastAttemptMs) lastAttemptMs = ms;
        }
        // Failed-uncaptured = attempted in last 30m but not captured.
        const failedUncapturedFlagIds = [...attemptedFlagIds].filter(
            id => !capturedFlagIds.has(id)
        );

        return {
            mission_id: missionId,
            flags_captured: capturedFlagIds.size,
            flags_total: flagsInRegistry,         // null if mission not in registry
            failed_attempts_recent: failedUncapturedFlagIds.length,
            last_attempt_iso: lastAttemptMs ? new Date(lastAttemptMs).toISOString() : null,
        };
    },

    // ─── check_prerequisite (v0.6.0c-4) ──────────────────────────────
    //
    // Walks flag_registry/{mission_id}.flagOrder and the student's
    // captures, returning the first uncaptured flag in canonical order.
    // Used by the model to ground "what should I do next?" hints in
    // the specific flag the student is currently working toward, not
    // generic mission-level advice.
    //
    // Failure modes:
    //   - mission not in flag_registry → has_ordering=false, ready_for_next=true,
    //     model can still answer but won't be able to name a specific next flag
    //   - flag_registry exists but no flagOrder field → same as above
    //   - all flags captured → next_flag_id=null, ready_for_next=true,
    //     mission_complete=true
    'check_prerequisite': async (parameters, ctx) => {
        const missionId = parameters.mission_id;
        if (typeof missionId !== 'string' || !missionId) {
            const err = new Error('mission_id is required');
            err.code = 'schema_required';
            throw err;
        }
        const uid = ctx.uid;

        const [registryDoc, capturesSnap] = await Promise.all([
            db.doc(`flag_registry/${missionId}`).get(),
            db.collection(`users/${uid}/flag_captures`)
                .where('boxId', '==', missionId)
                .get(),
        ]);

        const capturedFlagIds = new Set(
            capturesSnap.docs.map(d => d.data().flagId).filter(Boolean)
        );

        if (!registryDoc.exists) {
            return {
                mission_id: missionId,
                has_ordering: false,
                ready_for_next: true,
                next_flag_id: null,
                next_flag_index: null,
                total_flags: null,
                flags_captured: capturedFlagIds.size,
                missing_prerequisites: [],
                mission_complete: false,
                reason: 'mission_not_in_flag_registry',
            };
        }

        const registry = registryDoc.data() || {};
        const flagOrder = Array.isArray(registry.flagOrder) ? registry.flagOrder : [];
        const totalFlags = Object.keys(registry.flags || {}).length;

        if (flagOrder.length === 0) {
            // Mission exists but has no enforced ordering. All flags are
            // independently accessible. The student is "ready" in the sense
            // that nothing gates the next attempt.
            return {
                mission_id: missionId,
                has_ordering: false,
                ready_for_next: true,
                next_flag_id: null,
                next_flag_index: null,
                total_flags: totalFlags,
                flags_captured: capturedFlagIds.size,
                missing_prerequisites: [],
                mission_complete: capturedFlagIds.size >= totalFlags && totalFlags > 0,
            };
        }

        // Walk flagOrder. First uncaptured flag is the next target.
        let nextFlagId = null;
        let nextFlagIndex = -1;
        const missingPrereqs = [];
        for (let i = 0; i < flagOrder.length; i++) {
            const fid = flagOrder[i];
            if (!capturedFlagIds.has(fid)) {
                nextFlagId = fid;
                nextFlagIndex = i;
                break;
            }
        }

        // ready_for_next is true if all flags before next_flag_index are captured.
        // The walk above guarantees this — by construction the loop only stops
        // at the first uncaptured. So this field is informational/explicit.
        if (nextFlagId !== null) {
            for (let i = 0; i < nextFlagIndex; i++) {
                if (!capturedFlagIds.has(flagOrder[i])) {
                    missingPrereqs.push(flagOrder[i]);
                }
            }
        }

        return {
            mission_id: missionId,
            has_ordering: true,
            ready_for_next: missingPrereqs.length === 0,
            next_flag_id: nextFlagId,                     // null if mission complete
            next_flag_index: nextFlagId === null ? null : nextFlagIndex,
            total_flags: totalFlags,
            flags_captured: capturedFlagIds.size,
            missing_prerequisites: missingPrereqs,
            mission_complete: nextFlagId === null,
        };
    },

    // ─── recent_house_activity (v0.6.0c-4) ───────────────────────────
    //
    // Lists missions in the student's house that they have touched
    // (captured or attempted) within the last N days. Lets the model
    // open a returning session with present-tense context.
    //
    // Result is capped at 20 missions sorted by last_touch desc, then
    // mission_id asc as a stable tiebreak.
    //
    // The `house` parameter is used as a boxId-prefix filter — the
    // ContentCatalog convention is that all box/lab IDs are prefixed
    // with the house slug (e.g. eye-wireshark-training,
    // script-bash-scripting). Filtering happens in memory after the
    // Firestore reads because Firestore does not support startsWith.
    'recent_house_activity': async (parameters, ctx) => {
        const house = parameters.house;
        if (typeof house !== 'string' || !house) {
            const err = new Error('house is required');
            err.code = 'schema_required';
            throw err;
        }
        // Sanitize the house slug — only lowercase letters and hyphens.
        // This is a defensive belt against a model-supplied prefix that
        // could accidentally match too broadly.
        if (!/^[a-z][a-z-]{0,20}$/.test(house)) {
            const err = new Error('house must be a lowercase slug (a-z, hyphens)');
            err.code = 'schema_type';
            throw err;
        }

        const DAYS_MIN = 1;
        const DAYS_MAX = 30;
        const DAYS_DEFAULT = 7;
        const TOP_K = 20;

        let days = parameters.days;
        if (typeof days !== 'number' || !Number.isFinite(days)) {
            days = DAYS_DEFAULT;
        }
        days = Math.max(DAYS_MIN, Math.min(DAYS_MAX, Math.floor(days)));

        const uid = ctx.uid;
        const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
        const prefix = `${house}-`;

        // Pull captures + attempts in parallel. Per-user subcollections
        // have automatic single-field indexes — no composite index needed.
        const [capturesSnap, attemptsSnap] = await Promise.all([
            db.collection(`users/${uid}/flag_captures`)
                .where('capturedAt', '>=', since)
                .get(),
            db.collection(`users/${uid}/flag_attempts`)
                .where('timestamp', '>=', since)
                .get(),
        ]);

        // Aggregate per mission_id. Track captured count, attempt count,
        // and the latest timestamp across both collections.
        const missions = new Map();   // missionId → { flags_captured, attempts, last_touch_ms }

        const touch = (missionId, ts, kind) => {
            if (!missionId || typeof missionId !== 'string') return;
            if (!missionId.startsWith(prefix)) return;
            let entry = missions.get(missionId);
            if (!entry) {
                entry = { flags_captured: 0, attempts: 0, last_touch_ms: 0 };
                missions.set(missionId, entry);
            }
            if (kind === 'capture') entry.flags_captured++;
            if (kind === 'attempt') entry.attempts++;
            const ms = ts && ts.toMillis ? ts.toMillis() : 0;
            if (ms > entry.last_touch_ms) entry.last_touch_ms = ms;
        };

        for (const doc of capturesSnap.docs) {
            const d = doc.data();
            touch(d.boxId, d.capturedAt, 'capture');
        }
        for (const doc of attemptsSnap.docs) {
            const d = doc.data();
            touch(d.boxId, d.timestamp, 'attempt');
        }

        // Sort by last_touch desc, mission_id asc as tiebreak.
        const sorted = [...missions.entries()]
            .map(([mission_id, v]) => ({
                mission_id,
                last_touch_iso: v.last_touch_ms ? new Date(v.last_touch_ms).toISOString() : null,
                flags_captured: v.flags_captured,
                attempts: v.attempts,
            }))
            .sort((a, b) => {
                const at = a.last_touch_iso || '';
                const bt = b.last_touch_iso || '';
                if (at !== bt) return at < bt ? 1 : -1;  // desc
                return a.mission_id < b.mission_id ? -1 : 1;
            })
            .slice(0, TOP_K);

        return {
            house,
            days,
            missions: sorted,
            mission_count: sorted.length,
        };
    },
};

exports.hexAiToolDispatch = onRequest({
    region: 'us-central1',
    secrets: [hexAiApiKey],
    timeoutSeconds: 30,
    memory: '256MiB',
}, async (req, res) => {
    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }
    // Same X-API-Key check as hexAiToolCallback (constant-time compare).
    const provided = req.headers['x-api-key'] || '';
    const expected = hexAiApiKey.value();
    if (!provided || !expected) {
        res.status(401).json({ ok: false, error: 'X-API-Key required', code: 'auth' });
        return;
    }
    const a = Buffer.from(provided);
    const b = Buffer.from(expected);
    if (a.length !== b.length) {
        res.status(401).json({ ok: false, error: 'Invalid X-API-Key', code: 'auth' });
        return;
    }
    const crypto = require('crypto');
    if (!crypto.timingSafeEqual(a, b)) {
        res.status(401).json({ ok: false, error: 'Invalid X-API-Key', code: 'auth' });
        return;
    }

    const body = (req.body && typeof req.body === 'object') ? req.body : {};
    const { tool, parameters, ctx } = body;

    if (typeof tool !== 'string' || !tool) {
        res.status(400).json({ ok: false, error: 'tool required', code: 'schema_required' });
        return;
    }
    if (!ctx || typeof ctx !== 'object' || typeof ctx.uid !== 'string' || !ctx.uid) {
        res.status(400).json({ ok: false, error: 'ctx.uid required', code: 'schema_required' });
        return;
    }
    const handler = TOOL_DISPATCH_HANDLERS[tool];
    if (!handler) {
        res.status(404).json({ ok: false, error: `unknown tool: ${tool}`, code: 'unknown_tool' });
        return;
    }

    try {
        const result = await handler(parameters || {}, ctx);
        res.json({ ok: true, result });
    } catch (e) {
        console.error(`hexAiToolDispatch ${tool} crashed:`, e.message);
        res.status(e.code ? 400 : 500).json({
            ok: false,
            error: e.message || String(e),
            code: e.code || 'handler_crash',
        });
    }
});

/**
 * hexAiSecurityEvent — fire-and-forget security event sink.
 *
 * Parallel to hexAiToolCallback but for defense-layer events
 * (encoding_bypass_blocked, jailbreak_blocked, rate_limit_exceeded,
 * lockout_triggered, output_flag_scrubbed, tool_budget_exceeded,
 * convo_locked). Writes to dr_hex_security_events Firestore
 * collection for postmortem analysis. Schema documented in
 * _docs/operations/dr-hex-security-events.md (TODO doc).
 *
 * Auth: X-API-Key only (orchestrator is the trusted caller).
 *
 * Frequently-filterable fields are promoted to top-level Firestore
 * columns (Nancy 2026-05-25). The free-form metadata map is for
 * catch-all details.
 */
exports.hexAiSecurityEvent = onRequest({
    region: 'us-central1',
    secrets: [hexAiApiKey],
    timeoutSeconds: 10,
    memory: '128MiB',
}, async (req, res) => {
    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }
    // X-API-Key constant-time compare (same pattern as hexAiToolCallback).
    const provided = req.headers['x-api-key'] || '';
    const expected = hexAiApiKey.value();
    if (!provided || !expected) {
        res.status(401).json({ error: 'X-API-Key required' });
        return;
    }
    const a = Buffer.from(provided);
    const b = Buffer.from(expected);
    if (a.length !== b.length) {
        res.status(401).json({ error: 'Invalid X-API-Key' });
        return;
    }
    const crypto = require('crypto');
    if (!crypto.timingSafeEqual(a, b)) {
        res.status(401).json({ error: 'Invalid X-API-Key' });
        return;
    }

    const body = (req.body && typeof req.body === 'object') ? req.body : {};
    const {
        event_type, severity, uid_hash, msg_hash, conversation_id_hash,
        pattern_id, lockout_count, tool_name, latency_ms, metadata, ts_iso,
    } = body;

    if (typeof event_type !== 'string' || !event_type) {
        res.status(400).json({ error: 'event_type required' });
        return;
    }
    // Severity allowlist — operator queries depend on a small set
    const ALLOWED_SEVERITY = new Set(['info', 'warning', 'critical']);
    const sev = ALLOWED_SEVERITY.has(severity) ? severity : 'warning';

    try {
        await db.collection('dr_hex_security_events').add({
            event_type,
            severity: sev,
            uid_hash: typeof uid_hash === 'string' ? uid_hash : null,
            msg_hash: typeof msg_hash === 'string' ? msg_hash : null,
            conversation_id_hash: typeof conversation_id_hash === 'string' ? conversation_id_hash : null,
            pattern_id: typeof pattern_id === 'string' ? pattern_id : null,
            lockout_count: typeof lockout_count === 'number' ? lockout_count : null,
            tool_name: typeof tool_name === 'string' ? tool_name : null,
            latency_ms: typeof latency_ms === 'number' ? latency_ms : null,
            metadata: (metadata && typeof metadata === 'object') ? metadata : {},
            ts: FieldValue.serverTimestamp(),
            ts_iso: typeof ts_iso === 'string' ? ts_iso : null,
        });
    } catch (e) {
        console.error('hexAiSecurityEvent: Firestore write failed:', e.message);
        res.status(500).json({ error: 'Firestore write failed' });
        return;
    }
    res.status(204).end();
});

exports.hexAiHealth = onCall(cfOptions, async (request) => {
    if (!request.auth) {
        throw new HttpsError('unauthenticated', 'Must be signed in.');
    }
    try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 5000);
        const r = await fetch(`${hexAiUrl.value()}/health`, {
            method: 'GET',
            signal: controller.signal,
        });
        clearTimeout(timer);
        if (!r.ok) {
            return {
                bridge: 'ok',
                orchestrator: `unreachable: status ${r.status}`,
                orchestrator_version: null,
            };
        }
        const j = await r.json();
        return {
            bridge: 'ok',
            orchestrator: j.orchestrator || 'unknown',
            orchestrator_version: j.version || null,
        };
    } catch (e) {
        return {
            bridge: 'ok',
            orchestrator: `unreachable: ${e.name === 'AbortError' ? 'timeout' : e.message}`,
            orchestrator_version: null,
        };
    }
});
