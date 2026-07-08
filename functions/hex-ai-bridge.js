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
const sandboxServiceKey = defineSecret('SANDBOX_SERVICE_KEY');     // shared with the bc1 lab-manager /grade-for endpoint (sandbox_task_state)

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
const ADMIN_EMAILS = require('./admin-emails'); // single source of truth — see admin-emails.js

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
        // 2026-05-26: page_path + page_title so Dr. Hex always knows
        // WHERE the student is, even on landing pages with no mission_id.
        // Sanitize length to defend against payload bloat (and keep prompt
        // budget bounded — long titles would burn tokens).
        page_path: typeof data.page_path === 'string'
            ? data.page_path.slice(0, 200) : null,
        page_title: typeof data.page_title === 'string'
            ? data.page_title.slice(0, 200) : null,
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
        // 2026-05-26: page_path + page_title for orchestrator location context
        page_path: typeof data.page_path === 'string'
            ? data.page_path.slice(0, 200) : null,
        page_title: typeof data.page_title === 'string'
            ? data.page_title.slice(0, 200) : null,
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

    // ─── sandbox_task_state (Phase 0, Style A) ───────────────────────
    //
    // Returns the learner's per-task pass/fail for a Linux Practice
    // Sandbox session so Dr. Hex can calibrate help WITHOUT seeing the
    // terminal. The sandbox terminal is a cross-origin ttyd iframe that
    // parent-page JS (and therefore Dr. Hex) cannot read, so the lab-
    // manager grader is his only ground-truth channel on this lab.
    //
    // OWNERSHIP (Style A): this NEVER accepts a session_id. Ownership is
    // enforced at the source of truth, the lab-manager, which alone holds
    // the session<->uid binding. We call its service-key-gated /grade-for
    // with the trusted ctx.uid (the same anchor recent_house_activity uses
    // to read a user's own flag data); the lab-manager resolves that uid to
    // ITS OWN session and grades it. Because no sessionId ever crosses a
    // trust boundary from the model, there is no confused-deputy: a learner
    // cannot make Dr. Hex read another learner's state. Read-only; awards
    // nothing. Requires the SANDBOX_SERVICE_KEY secret (shared with bc1).
    'sandbox_task_state': async (parameters, ctx) => {
        // Optional lab scope. Defaults to the Linux Practice Sandbox; the
        // lab-manager 404s any labId it has no challenges for.
        const labId = (typeof parameters.lab_id === 'string' && parameters.lab_id)
            ? parameters.lab_id : 'linux-sandbox';
        if (!/^[a-z][a-z0-9-]{0,40}$/.test(labId)) {
            const err = new Error('lab_id must be a lowercase slug');
            err.code = 'schema_type';
            throw err;
        }

        const serviceKey = sandboxServiceKey.value();
        if (!serviceKey) {
            // Misconfiguration, not a user error: degrade gracefully.
            return { running: false, reason: 'service_key_unset', lab_id: labId, tasks: [], passed: 0, total: 0, complete: false };
        }

        const base = 'https://sandbox.hexworth.tech/api/sandbox';
        const url = `${base}/grade-for?uid=${encodeURIComponent(ctx.uid)}&labId=${encodeURIComponent(labId)}`;

        const notRunning = (reason) => ({
            running: false, reason, lab_id: labId,
            tasks: [], passed: 0, total: 0, complete: false,
        });

        // Bound the call: the lab-manager runs the in-container checks (a
        // few seconds). Abort well inside the function's 30s budget.
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 12000);
        let resp;
        try {
            resp = await fetch(url, {
                method: 'GET',
                headers: { 'X-Service-Key': serviceKey },
                signal: controller.signal,
            });
        } catch (e) {
            return notRunning('grader_unreachable');
        } finally {
            clearTimeout(timer);
        }

        // The endpoint returns 200 for every logical state (no_session,
        // not_running, unsupported_lab) via the running:false body below, so
        // a 404 here means the route itself is missing or misrouted (infra),
        // not that the learner has nothing running.
        if (resp.status === 404) return notRunning('endpoint_missing');
        if (!resp.ok) return notRunning(`grader_status_${resp.status}`);

        const data = await resp.json();
        // The lab-manager returns running:false when the uid has no active
        // session for this lab; surface that as-is.
        if (!data || data.running === false) {
            return notRunning(data && typeof data.reason === 'string' ? data.reason : 'no_session');
        }

        const results = Array.isArray(data.results) ? data.results : [];
        // Pass through the goal (desc) and boolean only. desc is the
        // acceptance criterion the learner already sees, never the command
        // that satisfies it.
        const tasks = results.map((t, i) => ({
            n: i + 1,
            id: (typeof t.id !== 'undefined' && t.id !== null) ? String(t.id) : String(i + 1),
            goal: typeof t.desc === 'string' ? t.desc : '',
            pass: !!t.pass,
        }));

        return {
            running: true,
            lab_id: labId,
            passed: typeof data.passed === 'number' ? data.passed : tasks.filter(t => t.pass).length,
            total: typeof data.total === 'number' ? data.total : tasks.length,
            complete: !!data.complete,
            tasks,
        };
    },
};

exports.hexAiToolDispatch = onRequest({
    region: 'us-central1',
    secrets: [hexAiApiKey, sandboxServiceKey],
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

/**
 * hexAiQualityObservation, AI-26 sink for voice_linter findings that
 * map to dr_hex_quality_observations categories. Parallel to
 * hexAiSecurityEvent: same X-API-Key auth, same orchestrator-callable
 * shape, different target collection.
 *
 * Voice_linter findings already flow to dr_hex_security_events via
 * hexAiSecurityEvent (for forensics). This CF gives the orchestrator a
 * second path that emits to dr_hex_quality_observations (for the
 * operator quality dashboard). The two writes are independent so a
 * Firestore failure on one does not block the other.
 *
 * Dedup is deliberately NOT done here. The CLI flag-quality.js does
 * dedup-before-write, but this is automated emission and we want
 * every fire to land. Operators reconcile duplicates by marking
 * status='duplicate' in the dashboard.
 *
 * Required body fields:
 *   category    (string, one of the drhex-q-* codes)
 *   observation (string, one-line description)
 *   studentQueryFirst60 (string, first 60 chars of the student query)
 *   modelResponseFirst200 (string, first 200 chars of the response)
 *
 * Optional body fields:
 *   conversationId, missionId, persona, helpLevel, priority,
 *   toolInvocationDocIds, flaggedBySource, notes
 *
 * AI-28 autoloop optional body fields (default null when omitted):
 *   defectId         (string)  Loop's defect identifier; format autoloop-pass-NNN-<hash>
 *   retargetCount    (number)  0 on first targeting; incremented on retarget
 *   resolutionSha    (string)  Merge-commit SHA on Task 3 PASS resolution
 *   resolutionLog    (string)  Path + anchor to autoloop-done.md entry
 * See _docs/operations/dr-hex-quality-log.md for full schema + write-path
 * semantics (absent vs null behavior across create paths).
 */
exports.hexAiQualityObservation = onRequest({
    region: 'us-central1',
    secrets: [hexAiApiKey],
    timeoutSeconds: 10,
    memory: '128MiB',
}, async (req, res) => {
    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }
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
        category, observation, studentQueryFirst60, modelResponseFirst200,
        conversationId, missionId, persona, helpLevel, priority,
        toolInvocationDocIds, flaggedBySource, notes,
        // AI-28 autoloop: defect-tracking metadata for loop-emitted observations.
        // All four default null when caller omits — voice_linter/drift_detector
        // never populate these; only the autoloop fills them on docs it processes.
        defectId, retargetCount, resolutionSha, resolutionLog,
    } = body;

    // Required-field validation. Reject early on missing or wrong-typed.
    const VALID_CATEGORIES = new Set([
        'drhex-q-rag-relevance',
        'drhex-q-rag-coverage',
        'drhex-q-help-ceiling',
        'drhex-q-help-floor',
        'drhex-q-persona-drift',
        'drhex-q-hallucination',
        'drhex-q-leak',
        'drhex-q-tool',
        'drhex-q-policy',
    ]);
    if (!VALID_CATEGORIES.has(category)) {
        res.status(400).json({ error: 'category must be one of the drhex-q-* codes' });
        return;
    }
    if (typeof observation !== 'string' || !observation.trim()) {
        res.status(400).json({ error: 'observation required' });
        return;
    }
    if (typeof studentQueryFirst60 !== 'string') {
        res.status(400).json({ error: 'studentQueryFirst60 required (string)' });
        return;
    }
    if (typeof modelResponseFirst200 !== 'string') {
        res.status(400).json({ error: 'modelResponseFirst200 required (string)' });
        return;
    }
    const VALID_PRIORITY = new Set(['P0', 'P1', 'P2', 'P3']);
    const safePriority = VALID_PRIORITY.has(priority) ? priority : null;

    // Use a distinct flaggedBy id so the dashboard can filter
    // automated emissions vs operator-flagged ones if it wants to.
    const flaggedBy = typeof flaggedBySource === 'string' && flaggedBySource
        ? `auto:${flaggedBySource.slice(0, 32)}`
        : 'auto:voice_linter';

    try {
        const docRef = await db.collection('dr_hex_quality_observations').add({
            category,
            observation: observation.slice(0, 500),
            studentQueryFirst60: studentQueryFirst60.slice(0, 60),
            modelResponseFirst200: modelResponseFirst200.slice(0, 200),
            conversationId: typeof conversationId === 'string' ? conversationId : null,
            missionId: typeof missionId === 'string' ? missionId : null,
            toolInvocationDocIds: Array.isArray(toolInvocationDocIds) ? toolInvocationDocIds : [],
            persona: typeof persona === 'string' ? persona : null,
            helpLevel: typeof helpLevel === 'number' ? helpLevel : null,
            status: 'open',
            priority: safePriority,
            flaggedBy,
            flaggedAt: FieldValue.serverTimestamp(),
            notes: typeof notes === 'string' ? notes.slice(0, 500) : null,
            originalObservationId: null,
            fixCommit: null,
            // AI-28 autoloop fields (default null — populated only by the
            // loop on docs it targets/resolves; absent-or-null both mean
            // "loop has not processed this observation yet" per the
            // targeting query in dr-hex-quality-log.md).
            defectId: typeof defectId === 'string' ? defectId : null,
            retargetCount: typeof retargetCount === 'number' ? retargetCount : null,
            resolutionSha: typeof resolutionSha === 'string' ? resolutionSha : null,
            resolutionLog: typeof resolutionLog === 'string' ? resolutionLog : null,
        });
        res.status(200).json({ ok: true, id: docRef.id });
    } catch (e) {
        console.error('hexAiQualityObservation: Firestore write failed:', e.message);
        res.status(500).json({ error: 'Firestore write failed' });
    }
});

/**
 * hexAiAmbientState — server-side state computer for the floating
 * Dr. Hex mood-ring button (v1, 2026-05-25).
 *
 * Reads recent flag_attempts + flag_captures for the calling student
 * filtered by boxId == missionId, classifies recent activity into a
 * state {calm | noticing | active | insistent | celebrating}, returns
 * the state + color + pulse_ms + a state-appropriate suggested prompt.
 *
 * Architectural decisions (Nancy review 2026-05-25):
 *  - Event-driven, not polled. Client fetches on page load + after each
 *    lab attempt-submit event. State literally can't change between
 *    attempts so polling is redundant.
 *  - Per-mission scoping. Both attempt collections are filtered by
 *    boxId server-side. Cross-lab contamination impossible.
 *  - State transitions write to dr_hex_security_events as
 *    'ambient_state_changed' so instructors get forensic visibility.
 *    Mood ring is for student; events are for instructor.
 *  - Drops gate_attempts + activation_attempts from v1 — neither has
 *    a mission_id field. Schema change is its own piece of work.
 *
 * Auth: requires signed-in Firebase user (onCall). The user_uid is
 * derived from request.auth.uid (never client-supplied) so cross-user
 * peeking is structurally impossible.
 *
 * Request (callable):
 *   { mission_id: "lab-py-01", previous_state: "calm" | null }
 *
 * Response:
 *   {
 *     state: "calm" | "noticing" | "active" | "insistent" | "celebrating",
 *     color: "#hex",
 *     pulse_ms: 0 | 4000 | 2000 | 1000 | 700,   // 0 = no pulse
 *     suggested_prompt: "...",
 *     transitioned: true | false,
 *     window_summary: {
 *       attempts_5min: int, incorrect_5min: int,
 *       attempts_10min: int, incorrect_10min: int,
 *       captures_60s: int, captures_20min: int,
 *     }
 *   }
 */
exports.hexAiAmbientState = onCall(cfOptions, async (request) => {
    if (!request.auth) {
        throw new HttpsError('unauthenticated', 'Must be signed in.');
    }
    const data = request.data || {};
    const missionId = (data.mission_id || '').toString().trim();
    if (!missionId || !/^[a-zA-Z0-9_\-]{1,64}$/.test(missionId)) {
        throw new HttpsError('invalid-argument', 'mission_id required (alphanum/_/- ≤64)');
    }
    const previousState = data.previous_state || null;

    const uid = request.auth.uid;

    // ─── Rate limit (cyber-tier harden 2026-05-25) ──────────────
    // 60 calls/minute per uid. Even an authenticated student can't
    // burn unbounded Firestore reads via this endpoint. Single-doc
    // sliding-window counter; cost is 1 read + 1 write per call =
    // ~50% overhead vs the underlying state fetch. Acceptable.
    const rlRef = db.collection('_hex_ai_ambient_rl').doc(uid);
    const RL_WINDOW_MS = 60_000;
    const RL_CAP = 60;
    try {
        const rlSnap = await rlRef.get();
        const now = Date.now();
        if (rlSnap.exists) {
            const rl = rlSnap.data();
            const windowStartMs = rl.windowStart?.toMillis ? rl.windowStart.toMillis() : (rl.windowStart || now);
            if (now - windowStartMs > RL_WINDOW_MS) {
                await rlRef.set({ count: 1, windowStart: FieldValue.serverTimestamp() });
            } else if (rl.count >= RL_CAP) {
                throw new HttpsError('resource-exhausted',
                    `ambient-state rate limit exceeded (${RL_CAP}/min). Slow down.`);
            } else {
                await rlRef.update({ count: FieldValue.increment(1) });
            }
        } else {
            await rlRef.set({ count: 1, windowStart: FieldValue.serverTimestamp() });
        }
    } catch (e) {
        // If the rate-limit machinery itself fails, fail OPEN (do the
        // ambient query) but log loudly. Don't block the student over
        // an infrastructure hiccup.
        if (e instanceof HttpsError) throw e;
        console.warn('hexAiAmbientState rate-limit failed open:', e.message);
    }

    const now = Date.now();
    const since5min  = new Date(now - 5 * 60 * 1000);
    const since10min = new Date(now - 10 * 60 * 1000);
    const since20min = new Date(now - 20 * 60 * 1000);
    const since60s   = new Date(now - 60 * 1000);

    // Read three attempt sources in parallel, scoped per-mission.
    // - flag_attempts + flag_captures: CTF-style boxes (arena, dispatch)
    // - lab_attempts: AI-20 educational labs (Key house pattern)
    //
    // lab_attempts lives in its own collection per Nancy 2026-05-30 to
    // avoid (a) ctfFlagsCaptured count inflation, (b) recent_house_activity
    // tool contamination, (c) deriveFailedAttempts gaming vector.
    // See hexAiRecordLabAttempt above for the full rationale.
    const [attemptsSnap, capturesSnap, labAttemptsSnap] = await Promise.all([
        db.collection(`users/${uid}/flag_attempts`)
            .where('boxId', '==', missionId)
            .where('timestamp', '>=', since20min)
            .orderBy('timestamp', 'desc')
            .limit(50)
            .get(),
        db.collection(`users/${uid}/flag_captures`)
            .where('boxId', '==', missionId)
            .where('capturedAt', '>=', since20min)
            .orderBy('capturedAt', 'desc')
            .limit(20)
            .get(),
        db.collection(`users/${uid}/lab_attempts`)
            .where('missionId', '==', missionId)
            .where('timestamp', '>=', since20min)
            .orderBy('timestamp', 'desc')
            .limit(50)
            .get(),
    ]);

    // Project flag_attempts into {ts, flagId} for the classifier.
    const attempts = attemptsSnap.docs.map(d => ({
        ts: d.data().timestamp?.toMillis ? d.data().timestamp.toMillis() : 0,
        flagId: d.data().flagId,
    })).filter(a => a.ts > 0);

    // Project flag_captures into {ts, flagId} for the classifier.
    const captures = capturesSnap.docs.map(d => ({
        ts: d.data().capturedAt?.toMillis ? d.data().capturedAt.toMillis() : 0,
        flagId: d.data().flagId,
    })).filter(c => c.ts > 0);

    // Project lab_attempts into the classifier's same shape with
    // synthetic flagIds. Every lab attempt becomes an entry in `attempts`
    // (so it counts toward incorrect-attempt windows). On correct=true a
    // hands-on LAB exercise also lands in `captures` (so the celebrating
    // state fires — solving a lab task is a win worth celebrating).
    //
    // QUIZZES are the exception (operator decision 2026-06-13): a passed
    // quiz settles the ring to CALM, not celebrating — 'celebrating' is
    // reserved for CTF flag captures and lab solves, not routine chapter
    // quizzes. So exerciseId==='quiz' is NOT projected into `captures`.
    // It still lands in `attempts` and in capturedFlagIds (below), so the
    // pass reads as "most recent was correct" → calm.
    //
    // CONSEQUENCE (pre-existing, via the all-time `allLabCorrectSnap` query
    // below — NOT scoped to the 20-min window): once a student has EVER
    // passed this quiz, its synthetic flagId is permanently marked captured,
    // so later retake-fails do NOT register as incorrect and the ring stays
    // calm on retakes. Intended: a previously-passed quiz is low-stakes
    // practice and shouldn't alarm. Struggle IS signalled for students who
    // have not yet passed (the common case).
    //
    // SCOPE: this retake-calm applies to STANDALONE quiz pages, where QuizEngine
    // records the whole quiz under exercise_id='quiz'. It does NOT apply to a quiz
    // EMBEDDED in a lab page: the Phase-3 lab observer records each wrong answer
    // under that element's own exercise id (only correct answers use 'quiz'), so a
    // previously-passed embedded quiz CAN still escalate on repeated wrong retakes —
    // which is intended for labs (a struggling student on a lab should get noticed,
    // even on a retake). Standalone quizzes and embedded-lab quizzes differ here by
    // design.
    const labFlagIdFor = (missionId, exerciseId) => `lab:${missionId}:${exerciseId}`;
    for (const d of labAttemptsSnap.docs) {
        const row = d.data();
        const ts = row.timestamp?.toMillis ? row.timestamp.toMillis() : 0;
        if (!ts) continue;
        const fid = labFlagIdFor(row.missionId, row.exerciseId || '');
        attempts.push({ ts, flagId: fid });
        if (row.correct === true && row.exerciseId !== 'quiz') {
            captures.push({ ts, flagId: fid });
        }
    }
    // Re-sort attempts + captures most-recent-first since we pushed lab
    // entries in collection order, not the merged timeline.
    attempts.sort((a, b) => b.ts - a.ts);
    captures.sort((a, b) => b.ts - a.ts);

    // An "incorrect attempt" = a flag_attempts entry whose flagId was
    // never captured (captures with that flagId for this mission).
    // For attempts with no flagId or flagId='__scan__', count as incorrect
    // (no progress signal). Captures-set covers all of mission history,
    // not just the 20-min window — a successful capture at any prior
    // point disqualifies subsequent attempts on that flagId from
    // counting as incorrect.
    //
    // To keep this read-light, we also pull ALL captures (mission-wide)
    // separately. This is a small additional read; tradeoff acceptable.
    //
    // We ALSO include all-time correct lab_attempts for this mission so a
    // lab exercise correctly solved >20min ago still doesn't count as
    // "incorrect" in a fresh attempt within the window.
    const [allCapturesSnap, allLabCorrectSnap] = await Promise.all([
        db.collection(`users/${uid}/flag_captures`)
            .where('boxId', '==', missionId)
            .limit(50)
            .get(),
        db.collection(`users/${uid}/lab_attempts`)
            .where('missionId', '==', missionId)
            .where('correct', '==', true)
            .limit(50)
            .get(),
    ]);
    const capturedFlagIds = new Set(
        allCapturesSnap.docs.map(d => d.data().flagId).filter(Boolean)
    );
    for (const d of allLabCorrectSnap.docs) {
        capturedFlagIds.add(labFlagIdFor(d.data().missionId, d.data().exerciseId || ''));
    }

    // Delegate to the pure classifier (extracted for testability)
    const { classifyAmbientState } = require('./hex-ai-state-classifier');
    const classification = classifyAmbientState({
        attempts,
        captures,
        capturedFlagIds,
        nowMs: now,
    });
    const state = classification.state;
    const cfg = {
        color: classification.color,
        pulse_ms: classification.pulse_ms,
        suggested_prompt: classification.suggested_prompt,
    };
    const incorrect5  = classification.window_summary.incorrect_5min;
    const incorrect10 = classification.window_summary.incorrect_10min;
    const incorrect20 = classification.window_summary.incorrect_20min;
    const captures60s = { length: classification.window_summary.captures_60s };
    const attempts5   = { length: classification.window_summary.attempts_5min };
    const attempts10  = { length: classification.window_summary.attempts_10min };

    // Forensics: log state transitions (not every call) to security events
    const transitioned = previousState && previousState !== state;
    if (transitioned) {
        try {
            await db.collection('dr_hex_security_events').add({
                event_type: 'ambient_state_changed',
                severity: state === 'insistent' ? 'warning' : 'info',
                uid_hash: require('crypto').createHash('sha256').update(uid).digest('hex').slice(0, 16),
                msg_hash: null,
                conversation_id_hash: null,
                pattern_id: null,
                lockout_count: null,
                tool_name: null,
                latency_ms: null,
                metadata: {
                    mission_id: missionId,
                    from_state: previousState,
                    to_state: state,
                    incorrect_5min: incorrect5,
                    incorrect_10min: incorrect10,
                    incorrect_20min: incorrect20,
                    captures_60s: captures60s.length,
                },
                ts: FieldValue.serverTimestamp(),
                ts_iso: new Date().toISOString(),
            });
        } catch (e) {
            console.warn('hexAiAmbientState: state-change event log failed:', e.message);
        }
    }

    return {
        state,
        color: cfg.color,
        pulse_ms: cfg.pulse_ms,
        suggested_prompt: cfg.suggested_prompt,
        transitioned,
        window_summary: {
            attempts_5min: attempts5.length,
            incorrect_5min: incorrect5,
            attempts_10min: attempts10.length,
            incorrect_10min: incorrect10,
            captures_60s: captures60s.length,
            captures_20min: captures.length,
        },
    };
});

// ── TELEMETRY-001: hexAiEngagementEvent ───────────────────────────────────
// Receives client-side engagement beacons from HexAIChatPanel.js. The
// client emits events like intervention_sent, tab_closed, walkthrough_opened,
// downvote_response, external_ai_signal. The CF writes them to the
// dr_hex_engagement_events Firestore collection where the post-intervention
// engagement classifier joins them with flag_attempts/flag_captures.
//
// Auth: Firebase Auth required (callable). No API key — this is client-facing.
// Severity gate: input validation rejects unexpected event_types so a
// malicious client can't pollute the collection.
//
// Spec: _docs/operations/dr-hex-production-stability.md §5
exports.hexAiEngagementEvent = onCall(cfOptions, async (request) => {
    if (!request.auth) {
        throw new HttpsError('unauthenticated', 'Must be signed in.');
    }
    const ALLOWED_EVENTS = new Set([
        'intervention_sent',
        'tab_closed',
        'walkthrough_opened',
        'downvote_response',
        'downvote_response_cleared',
        'external_ai_signal',
        'subsequent_chat_message',
    ]);
    const data = request.data || {};
    const eventType = data.event_type;
    if (typeof eventType !== 'string' || !ALLOWED_EVENTS.has(eventType)) {
        throw new HttpsError('invalid-argument', 'event_type missing or not in allowlist');
    }
    const uid = request.auth.uid;
    // uid_hash for privacy — same hashing convention as security events
    const crypto = require('crypto');
    const uid_hash = crypto.createHash('sha256').update(uid).digest('hex').slice(0, 16);
    const conv = typeof data.conversation_id === 'string' ? data.conversation_id : null;
    const conv_hash = conv
        ? crypto.createHash('sha256').update(conv).digest('hex').slice(0, 16)
        : null;
    // Cap fields to defend against payload bloat
    const cap = (s, n = 200) => (typeof s === 'string' ? s.slice(0, n) : null);
    try {
        await db.collection('dr_hex_engagement_events').add({
            event_type: eventType,
            uid_hash,
            conversation_id_hash: conv_hash,
            mission_id: cap(data.mission_id, 200),
            house: cap(data.house, 60),
            intervention_id: cap(data.intervention_id, 64),
            metadata: (data.metadata && typeof data.metadata === 'object') ? data.metadata : {},
            ts: FieldValue.serverTimestamp(),
            ts_iso: typeof data.ts_iso === 'string' ? data.ts_iso.slice(0, 40) : null,
        });
        return { ok: true };
    } catch (err) {
        console.error('[hexAiEngagementEvent] write failed:', err);
        throw new HttpsError('internal', 'Failed to persist engagement event.');
    }
});

/**
 * hexAiRecordLabAttempt, AI-20 record-lab-attempt for the mood-ring
 * data path on Key-house educational labs (and any other house that
 * follows the same client-side-validation pattern).
 *
 * Architecture decision (Nancy adversarial review 2026-05-30):
 *   Writes to a SEPARATE collection users/{uid}/lab_attempts, NOT to
 *   flag_attempts/flag_captures. Rationale:
 *     1. flag_captures has a `ctfFlagsCaptured` counter sync side-effect
 *        (4 paths in index.js). Reusing it would inflate the CTF metric
 *        for every Key-lab exercise.
 *     2. hexAiToolDispatch's recent_house_activity tool reads
 *        flag_captures and would surface synthetic lab "captures" as
 *        CTF activity to Dr. Hex's model context.
 *     3. deriveFailedAttempts (this file, ~L103) reads flag_attempts and
 *        excludes flagIds present in flag_captures. A student gaming
 *        correct=true here would suppress their own help-level
 *        escalation, reintroducing the gaming vector the v0.4.0 patch
 *        closed by moving failed_attempts derivation server-side.
 *
 *   The separate collection isolates lab telemetry from CTF telemetry.
 *   A student gaming correct=true can only mess with their OWN mood-ring
 *   state. flag_captures, ctfFlagsCaptured, recent_house_activity, and
 *   deriveFailedAttempts all stay clean.
 *
 * The classifier in hex-ai-state-classifier.js is unchanged. The merge
 * happens in hexAiAmbientState (this file) before the classifier call.
 *
 * Request (callable):
 *   { mission_id: "key-hmac", exercise_id: "1", correct: true }
 *
 * Response:
 *   { ok: true, recorded: { mission_id, exercise_id, correct } }
 */
exports.hexAiRecordLabAttempt = onCall(cfOptions, async (request) => {
    if (!request.auth) {
        throw new HttpsError('unauthenticated', 'Must be signed in.');
    }
    const data = request.data || {};
    const missionId = (data.mission_id || '').toString().trim();
    const exerciseId = (data.exercise_id || '').toString().trim();
    if (!missionId || !/^[a-zA-Z0-9_\-]{1,64}$/.test(missionId)) {
        throw new HttpsError('invalid-argument', 'mission_id required (alphanum/_/- <=64)');
    }
    if (!exerciseId || !/^[a-zA-Z0-9_\-]{1,32}$/.test(exerciseId)) {
        throw new HttpsError('invalid-argument', 'exercise_id required (alphanum/_/- <=32)');
    }
    if (typeof data.correct !== 'boolean') {
        throw new HttpsError('invalid-argument', 'correct must be boolean');
    }

    const uid = request.auth.uid;

    // Rate limit: 30/min. Lower than ambient state (60) because lab
    // submissions happen at human-typing pace. A burst above this is
    // either a bug in a lab page or a deliberate ping-flood; both
    // deserve a back-off.
    const rlRef = db.collection('_hex_ai_record_rl').doc(uid);
    const RL_WINDOW_MS = 60_000;
    const RL_CAP = 30;
    try {
        const rlSnap = await rlRef.get();
        const now = Date.now();
        if (rlSnap.exists) {
            const rl = rlSnap.data();
            const windowStartMs = rl.windowStart?.toMillis ? rl.windowStart.toMillis() : (rl.windowStart || now);
            if (now - windowStartMs > RL_WINDOW_MS) {
                await rlRef.set({ count: 1, windowStart: FieldValue.serverTimestamp() });
            } else if (rl.count >= RL_CAP) {
                throw new HttpsError('resource-exhausted',
                    `recordLabAttempt rate limit exceeded (${RL_CAP}/min). Slow down.`);
            } else {
                await rlRef.update({ count: FieldValue.increment(1) });
            }
        } else {
            await rlRef.set({ count: 1, windowStart: FieldValue.serverTimestamp() });
        }
    } catch (e) {
        if (e instanceof HttpsError) throw e;
        console.warn('hexAiRecordLabAttempt rate-limit failed open:', e.message);
    }

    await db.collection(`users/${uid}/lab_attempts`).add({
        missionId,
        exerciseId,
        correct: data.correct,
        timestamp: FieldValue.serverTimestamp(),
    });

    return {
        ok: true,
        recorded: { mission_id: missionId, exercise_id: exerciseId, correct: data.correct },
    };
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
