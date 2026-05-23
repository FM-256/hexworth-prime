# Hex AI Client SDK — `HexAI.js`

> Built 2026-05-23 · Source: `_app/_lib/HexAI.js` · Live URL: `/_lib/HexAI.js`
> Test page: `_app/admin/ai-chat-test.html` (admin auth required)

## Purpose

`HexAI.js` is the browser-side SDK that wraps the `hexAiChat` + `hexAiHealth` Cloud Functions. It exists so that lab pages, applets, and the dispatch UI don't need to know about Firebase callable shapes or Cloud-Function error codes — they just call `ai.askDrHex(message)` and get back the orchestrator response.

This is a no-build-step ES module — vanilla JavaScript imported directly from the served `_app/_lib/` directory. Matches the Hexworth "no bundler" rule.

## API

### Construction

```js
import { HexAIClient, HexAIError } from '/_lib/HexAI.js';
import { getFunctions } from 'https://www.gstatic.com/firebasejs/12.7.0/firebase-functions.js';

const functions = getFunctions(app, 'us-central1');
const ai = new HexAIClient(functions);
```

The constructor takes the caller's already-initialized Firebase `functions` instance. The SDK does NOT initialize Firebase itself — that's the caller's responsibility (and matches the pattern in `lobby.html` and `accept-invite.html`).

### `ai.askDrHex(message, context)`

Send a question. Returns a Promise resolving to the orchestrator response shape.

```js
const r = await ai.askDrHex("What does 'ls -la' do?", {
    house:              'code',
    mission_id:         'lab-py-01',     // optional — drives server-side failed_attempts
    hint_used_recently: false,            // optional, default false
});
// Note: failed_attempts is not accepted from the client as of CF v0.4.0.
// The server derives it from Firestore using mission_id.

console.log(r.response);          // "ls lists directory contents. -l shows..."
console.log(r.persona_name);      // "Patient Pat"
console.log(r.help_level);        // 2
console.log(r.help_level_label);  // "Directional"
console.log(r.model);             // "qwen2.5:7b"
console.log(r.latency_ms);        // 3421
```

### `ai.askDrHexStream(message, context, callbacks)`

Streaming variant. Yields tokens as they arrive via the `onToken` callback. The browser sees the response materialize chunk-by-chunk instead of waiting for the full reply.

```js
await ai.askDrHexStream(
    "Explain TLS handshake in detail",
    { house: 'web' },
    {
        getIdToken: () => auth.currentUser.getIdToken(),
        onMeta:  (m) => console.log('persona:', m.persona_name, 'level:', m.help_level),
        onToken: (chunk) => responseEl.textContent += chunk,
        onDone:  (d) => console.log('total ms:', d.latency_ms),
        signal:  controller.signal,    // optional AbortSignal for cancel
    }
);
```

Callbacks:

| Callback | Required | Fired | Payload |
|---|---|---|---|
| `onMeta` | no | once at stream start | `{ persona, persona_name, help_level, help_level_label, model, rag_hits, rag_titles }` |
| `onToken` | **yes** | per chunk | string (the token content) |
| `onDone` | no | once at stream end | `{ latency_ms }` |
| `onError` | no | on error | `HexAIError` |

Auth: pass either `callbacks.idToken` (a fresh string) or `callbacks.getIdToken` (an async function — the SDK calls it to mint the token at request time). The Firebase auth instance is the caller's responsibility — the SDK does NOT import `getAuth` itself.

### Endpoint URL

By default `askDrHexStream` POSTs to `/api/hex-ai/stream` — a Firebase Hosting rewrite (in `firebase.json`) that forwards to the `hexAiChatStream` function. Same-origin, no CORS preflight, stable across project renames.

Override via constructor: `new HexAIClient(functions, { streamUrl: 'http://localhost:5001/.../' })` for emulator work.

Cancellation: pass an `AbortSignal` via `callbacks.signal`. Aborting the signal closes the connection on both sides (browser drops the EventSource; CF's `req.on('close')` cancels the upstream fetch via AbortController).

### `ai.probeHexAi()`

Health check — does the bridge work AND can it reach the orchestrator?

```js
const probe = await ai.probeHexAi();
// { bridge: "ok", orchestrator: "ok", orchestrator_version: "0.3.0" }
//   or { bridge: "ok", orchestrator: "unreachable: ...", orchestrator_version: null }
```

### `ai.isOnline()`

Convenience wrapper — returns `true` iff `orchestrator === 'ok'`. Swallows errors.

```js
if (await ai.isOnline()) {
    showAskDrHexButton();
} else {
    hideAskDrHexButton();
}
```

### `ai.prettyError(err)`

Converts any error from the SDK to a UI-suitable string. Hides Firebase internals.

```js
try {
    await ai.askDrHex(...);
} catch (e) {
    showToast(ai.prettyError(e));
}
```

## Error model

All errors thrown by the SDK are `HexAIError` instances with a `code` field:

| `code` | Meaning | Suggested UX |
|---|---|---|
| `auth` | User not signed in | Show sign-in prompt |
| `invalid` | Empty / too-long message | Show inline form validation |
| `timeout` | Orchestrator > 30s | "Try again in a moment" toast |
| `unreachable` | CF can't reach orchestrator | "AI tutor is offline" banner |
| `orchestrator` | Orchestrator returned non-200 | "Try rephrasing" toast |
| `superseded` | A newer `askDrHex` call started before this one resolved | Silent — caller already replaced the UI |
| `unknown` | Unmapped error | Generic error toast |

The mapping happens in `HexAI.js` via `FIREBASE_ERROR_MAP` — Firebase's `functions/<code>` strings → SDK codes + user-friendly messages.

## Cancel-previous semantics

Each `askDrHex` call increments an internal call counter. If a newer call is made before the current one resolves, the older Promise rejects with `code: 'superseded'` instead of resolving. This means:

- The UI handler for the older call gets a clean signal to ignore its result
- The newer call replaces the rendered response without race conditions
- Callers can opt out by passing `{ allowSuperseded: true }` (e.g., for background health probes that shouldn't fight foreground chat)

Firebase callable functions don't natively support cancellation — the older call still runs server-side and consumes orchestrator capacity. This is acceptable until traffic shape is real; rate-limiting on the CF will close the loop later.

## Test page

`_app/admin/ai-chat-test.html` exercises the full chain:

1. Probe health on page load
2. Provides UI controls for `house` / `mission_id` / `failed_attempts`
3. Sends arbitrary messages and renders the response + metadata
4. Surfaces SDK errors with `prettyError()` and the error code

This page is admin-gated (route under `/admin/`). It's the operator's verification surface once the CF is deployed.

## What this does NOT do (yet)

- ~~No streaming UI~~ — **shipped v0.5.0a** via `askDrHexStream()`.
- **No conversation memory** — each call is independent. Multi-turn UX requires v0.5.0b Redis-backed memory.
- **No retry logic** — a failed call returns the error to the caller; no auto-retry. Reason: retries on `auth` or `invalid` errors would mask real bugs.
- **No optimistic UI** — the caller renders the "thinking" state manually. The SDK is logic-only.
- **No rate limiting at the SDK** — defer until the CF has rate-limit headers to honor.

## Files

| Path | Purpose |
|---|---|
| `_app/_lib/HexAI.js` | The SDK |
| `_app/admin/ai-chat-test.html` | Admin-gated end-to-end test page |

## Related

- `_docs/architecture/dr-hex-orchestrator.md` — what the SDK ultimately talks to
- `_docs/architecture/hex-ai-cf-bridge.md` — the Cloud Functions the SDK calls
- `_docs/architecture/hex-ai-network-exposure.md` — Cloudflare Tunnel that connects the chain

---

*Last Updated: 2026-05-23 · v0.3.0 — initial SDK + test page*
