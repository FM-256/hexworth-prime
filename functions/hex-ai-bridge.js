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
 * - failed_attempts is currently trusted from client (deferred to v0.4.0
 *   when Firestore live-pull lands; logged for now so misuse is auditable)
 * - HEX_AI_API_KEY is in Secret Manager, NEVER in client code
 * - 10s upstream timeout — if orchestrator is slow or down, client sees
 *   a clean error, not a hung promise
 */
const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { defineSecret } = require('firebase-functions/params');

const hexAiUrl = defineSecret('HEX_AI_URL');           // e.g. https://hex-ai.hexworth.com
const hexAiApiKey = defineSecret('HEX_AI_API_KEY');    // matches one entry in HEX_API_KEYS on hexclass

const TIMEOUT_MS = 30000;                              // hard cap; CF max is 540s but UX needs faster fail
const ADMIN_EMAILS = ['f.mora80@gmail.com', 'jorden@hexworth.com'];

const cfOptions = {
    region: 'us-central1',
    secrets: [hexAiUrl, hexAiApiKey],
    timeoutSeconds: 60,
    memory: '256MiB',
};

async function postToOrchestrator(url, apiKey, body) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    try {
        const r = await fetch(`${url}/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-API-Key': apiKey,
            },
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
    if (message.length > 4000) {
        throw new HttpsError('invalid-argument', 'message too long (max 4000 chars)');
    }

    // Derive role server-side from admin claim. Never trust the client.
    // request.auth.token.admin is set by setAdminClaim. Email check is a
    // belt-and-suspenders fallback in case the claim was wiped.
    const email = (request.auth.token.email || '').toLowerCase();
    const isAdmin = request.auth.token.admin === true || ADMIN_EMAILS.includes(email);
    const role = isAdmin ? 'instructor' : 'student';

    const body = {
        user_uid: request.auth.uid,
        message,
        house: data.house || null,
        mission_id: data.mission_id || null,
        role,
        // failed_attempts comes from client in v0.3.0. v0.4.0 will read this
        // from Firestore server-side and ignore the client value.
        failed_attempts: Math.max(0, parseInt(data.failed_attempts, 10) || 0),
        hint_used_recently: data.hint_used_recently === true,
    };

    const orch = await postToOrchestrator(
        hexAiUrl.value(),
        hexAiApiKey.value(),
        body
    );

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
