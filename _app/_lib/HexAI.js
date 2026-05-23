/* ============================================================
   HexAI.js — Web app client SDK for the Dr. Hex AI orchestrator.

   Wraps the `hexAiChat` and `hexAiHealth` Cloud Functions in a
   small, no-build-step ES module. Vanilla JS, zero dependencies
   beyond the Firebase SDKs the caller already loaded.

   Usage:
     import { HexAIClient, HexAIError } from '/_lib/HexAI.js';
     import { getFunctions, httpsCallable }
       from 'https://www.gstatic.com/firebasejs/12.7.0/firebase-functions.js';

     const functions = getFunctions(app, 'us-central1');
     const ai = new HexAIClient(functions);

     try {
       const r = await ai.askDrHex("What does 'ls -la' do?", { house: 'code' });
       console.log(r.response);
     } catch (e) {
       if (e.code === 'unreachable') showOfflineBanner();
       else showError(ai.prettyError(e));
     }

   Architecture: _docs/architecture/dr-hex-orchestrator.md
   CF bridge:    _docs/architecture/hex-ai-cf-bridge.md
   ============================================================ */

export class HexAIError extends Error {
    constructor(code, message, cause = null) {
        super(message);
        this.name = 'HexAIError';
        this.code = code;     // 'auth' | 'invalid' | 'timeout' | 'unreachable' | 'orchestrator' | 'unknown'
        this.cause = cause;
    }
}

const FIREBASE_ERROR_MAP = {
    'unauthenticated':     ['auth',         "Sign in to talk to Dr. Hex."],
    'invalid-argument':    ['invalid',      "That message can't be sent — make sure it's not empty and under 4000 characters."],
    'deadline-exceeded':   ['timeout',      "Dr. Hex is taking too long to respond. Try again in a moment."],
    'unavailable':         ['unreachable',  "Can't reach Dr. Hex right now. The AI tutor will be back shortly."],
    'internal':            ['orchestrator', "Dr. Hex ran into a problem. Try rephrasing your question."],
};

export class HexAIClient {
    /**
     * @param {*} functions - Firebase functions instance from getFunctions()
     * @param {object} [options]
     * @param {string} [options.chatFnName='hexAiChat']
     * @param {string} [options.healthFnName='hexAiHealth']
     * @param {function} [options.httpsCallable] - dependency injection for tests
     */
    constructor(functions, options = {}) {
        if (!functions) {
            throw new Error('HexAIClient: functions instance required');
        }
        this._functions = functions;
        this._chatFnName = options.chatFnName || 'hexAiChat';
        this._healthFnName = options.healthFnName || 'hexAiHealth';

        // Lazy-bind httpsCallable — caller can inject a mock for tests.
        // In production, dynamic import is needed because we're a no-build-step
        // ES module and can't have a top-level await everywhere.
        this._callableOverride = options.httpsCallable || null;
        this._chatFn = null;
        this._healthFn = null;

        // Optional override for the streaming endpoint URL — handy for
        // emulator testing or hosting rewrites.
        this._explicitStreamUrl = options.streamUrl || null;

        // In-flight tracking for cancel-previous semantics. Each askDrHex
        // call gets an AbortController; calling askDrHex again while one
        // is in flight aborts the previous (Firebase callable doesn't
        // natively support cancel, so we mark the result as superseded
        // and ignore it on resolution).
        this._currentCallId = 0;
    }

    async _ensureCallables() {
        if (this._chatFn && this._healthFn) return;
        let httpsCallable;
        if (this._callableOverride) {
            httpsCallable = this._callableOverride;
        } else {
            const mod = await import('https://www.gstatic.com/firebasejs/12.7.0/firebase-functions.js');
            httpsCallable = mod.httpsCallable;
        }
        this._chatFn = httpsCallable(this._functions, this._chatFnName);
        this._healthFn = httpsCallable(this._functions, this._healthFnName);
    }

    /**
     * Send a question to Dr. Hex. Returns the orchestrator response shape.
     *
     * @param {string} message - the student/operator question
     * @param {object} [context]
     * @param {string} [context.house]
     * @param {string} [context.mission_id] - drives server-side failed_attempts derivation
     * @param {boolean} [context.hint_used_recently=false]
     * @param {boolean} [context.allowSuperseded=false] - if true, this call
     *        won't cancel prior in-flight calls (useful for background probes)
     *
     * NOTE: `failed_attempts` is NOT accepted from the client as of CF v0.4.0.
     * The server derives it from Firestore using `mission_id`. Passing
     * `failed_attempts` here is silently ignored.
     * @returns {Promise<{response: string, persona: string, persona_name: string,
     *                    help_level: number, help_level_label: string,
     *                    model: string, latency_ms: number}>}
     * @throws {HexAIError}
     */
    async askDrHex(message, context = {}) {
        if (typeof message !== 'string' || !message.trim()) {
            throw new HexAIError('invalid', "Message can't be empty.");
        }
        if (message.length > 4000) {
            throw new HexAIError('invalid', "Message is too long (max 4000 characters).");
        }

        await this._ensureCallables();

        // Cancel-previous: bump the call id; older results check this
        // before resolving to the caller.
        const callId = context.allowSuperseded ? -1 : ++this._currentCallId;

        try {
            const r = await this._chatFn({
                message: message.trim(),
                house: context.house || null,
                mission_id: context.mission_id || null,
                // failed_attempts intentionally omitted — CF derives it from Firestore.
                hint_used_recently: context.hint_used_recently === true,
            });
            if (callId !== -1 && callId !== this._currentCallId) {
                throw new HexAIError('superseded', 'A newer question was sent before this response arrived.');
            }
            return r.data;
        } catch (e) {
            if (e instanceof HexAIError) throw e;
            throw this._mapFirebaseError(e);
        }
    }

    /**
     * Streaming variant of askDrHex. Yields tokens as they arrive.
     *
     * @param {string} message
     * @param {object} [context] - same shape as askDrHex
     * @param {object} callbacks
     * @param {function} [callbacks.onMeta] - fired once with { persona, persona_name, help_level, model, rag_hits, rag_titles }
     * @param {function} callbacks.onToken - fired per token chunk with the string content
     * @param {function} [callbacks.onDone] - fired once with { latency_ms }
     * @param {function} [callbacks.onError] - fired on error with a HexAIError
     * @param {AbortSignal} [callbacks.signal] - cancel the stream early
     * @returns {Promise<void>} resolves when the stream completes (or rejects on error)
     *
     * Requires the caller's Firebase auth instance to mint a fresh ID token:
     *   const idToken = await auth.currentUser.getIdToken();
     * Pass either as `callbacks.idToken` (string) or as `callbacks.getIdToken`
     * (async function returning the token).
     *
     * The streaming endpoint URL defaults to the project's CF region; override
     * via options.streamUrl in the constructor if running against an emulator.
     */
    async askDrHexStream(message, context = {}, callbacks = {}) {
        if (typeof message !== 'string' || !message.trim()) {
            throw new HexAIError('invalid', "Message can't be empty.");
        }
        if (message.length > 4000) {
            throw new HexAIError('invalid', "Message is too long (max 4000 characters).");
        }
        if (typeof callbacks.onToken !== 'function') {
            throw new Error('askDrHexStream: callbacks.onToken is required');
        }

        const idToken = callbacks.idToken ||
            (callbacks.getIdToken ? await callbacks.getIdToken() : null);
        if (!idToken) {
            throw new HexAIError('auth', "Sign in to talk to Dr. Hex.");
        }

        const streamUrl = this._streamUrl();

        let response;
        try {
            response = await fetch(streamUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${idToken}`,
                    'Accept': 'text/event-stream',
                },
                body: JSON.stringify({
                    message: message.trim(),
                    house: context.house || null,
                    mission_id: context.mission_id || null,
                    hint_used_recently: context.hint_used_recently === true,
                }),
                signal: callbacks.signal,
            });
        } catch (e) {
            if (e.name === 'AbortError') {
                throw new HexAIError('aborted', 'Streaming was cancelled.');
            }
            throw new HexAIError('unreachable', "Can't reach Dr. Hex right now.", e);
        }

        if (response.status === 401) {
            throw new HexAIError('auth', "Sign in to talk to Dr. Hex.");
        }
        if (!response.ok) {
            throw new HexAIError('orchestrator', `Streaming failed: ${response.status}`);
        }

        // Parse SSE: lines starting with "data: ", separated by \n\n.
        // The reader is consumed once, then the buffer is FLUSHED — per
        // Nancy review 2026-05-23, the trailing event (if not terminated
        // by \n\n) would otherwise be silently dropped. Most commonly
        // this affects the final `done` event from FastAPI ASGI servers
        // that don't always emit a trailing blank line.
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        const processEvent = (block) => {
            const line = block.split('\n').find(l => l.startsWith('data: '));
            if (!line) return;
            let event;
            try { event = JSON.parse(line.slice(6)); }
            catch (_) { return; }
            if (event.type === 'meta' && callbacks.onMeta) {
                callbacks.onMeta(event);
            } else if (event.type === 'token') {
                callbacks.onToken(event.content || '');
            } else if (event.type === 'done' && callbacks.onDone) {
                callbacks.onDone(event);
            } else if (event.type === 'error') {
                // Throw only — do NOT fire onError separately. Per Nancy
                // review: double-delivery (callback + throw) makes
                // try/catch + onError combo fire twice.
                throw new HexAIError('orchestrator', event.error || 'Stream error');
            }
        };
        try {
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                buffer += decoder.decode(value, { stream: true });
                const events = buffer.split('\n\n');
                buffer = events.pop();             // keep the partial final event
                for (const block of events) processEvent(block);
            }
            // Flush any final partial block — handles servers that don't
            // emit a trailing \n\n after the last event.
            buffer += decoder.decode();    // flush pending multi-byte UTF-8
            if (buffer.trim()) processEvent(buffer);
        } finally {
            try { reader.releaseLock(); } catch (_) {}
        }
    }

    _streamUrl() {
        // Preferred: a Firebase Hosting rewrite to /api/hex-ai/stream
        // (configured in firebase.json) lets the client use a same-origin
        // relative URL — no CORS preflight, no cloudfunctions.net domain
        // exposed, and the URL is stable across project renames.
        //
        // If the caller has explicitly provided options.streamUrl (e.g.
        // for the emulator), that wins. Otherwise default to the rewrite.
        if (this._explicitStreamUrl) return this._explicitStreamUrl;
        return '/api/hex-ai/stream';
    }

    /**
     * Health probe — does the CF bridge work AND can it reach the orchestrator?
     *
     * @returns {Promise<{bridge: string, orchestrator: string, orchestrator_version: string|null}>}
     * @throws {HexAIError}
     */
    async probeHexAi() {
        await this._ensureCallables();
        try {
            const r = await this._healthFn();
            return r.data;
        } catch (e) {
            throw this._mapFirebaseError(e);
        }
    }

    /**
     * Convenience: returns true if Dr. Hex is reachable end-to-end.
     * Swallows errors and returns false instead of throwing.
     */
    async isOnline() {
        try {
            const r = await this.probeHexAi();
            return r.orchestrator === 'ok';
        } catch (_) {
            return false;
        }
    }

    /**
     * Convert any error from askDrHex/probeHexAi to a string suitable
     * for surfacing in the UI. Hides Firebase implementation details.
     */
    prettyError(err) {
        if (err instanceof HexAIError) return err.message;
        return "Something went wrong reaching Dr. Hex. Try again.";
    }

    // ── internal ──────────────────────────────────────────────────────────

    _mapFirebaseError(e) {
        // Firebase callable errors have e.code = "functions/<code>"
        // where <code> is the HttpsError code from server-side.
        const rawCode = (e && e.code) || '';
        const code = rawCode.startsWith('functions/') ? rawCode.slice('functions/'.length) : rawCode;
        const mapped = FIREBASE_ERROR_MAP[code];
        if (mapped) {
            return new HexAIError(mapped[0], mapped[1], e);
        }
        return new HexAIError('unknown', "Something went wrong reaching Dr. Hex.", e);
    }
}
