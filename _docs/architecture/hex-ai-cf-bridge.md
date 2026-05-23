# Hex AI Cloud Function Bridge — `hexAiChat` + `hexAiChatStream` + `hexAiHealth`

> Built 2026-05-23 · v0.5.0a (streaming added)
> Source: `functions/hex-ai-bridge.js` · NOT YET DEPLOYED (gated on Cloudflare Tunnel setup)

## Purpose

The bridge is the only path the web app (`hexworth.com` on Firebase Hosting) can use to reach the Dr. Hex orchestrator on `hexclass`. It does three things the client cannot safely do itself:

1. **Hold the orchestrator API key.** The `HEX_AI_API_KEY` lives in Secret Manager; the client never sees it.
2. **Derive role server-side from the admin claim.** The client can claim any `role` it wants; the bridge ignores client `role` and uses `request.auth.token.admin` instead.
3. **Enforce a hard timeout.** Slow or down orchestrator returns a clean `deadline-exceeded` to the client in 30s, not a hung promise.

## Functions

| Name | Type | Auth | Purpose |
|---|---|---|---|
| `hexAiChat` | callable (onCall) | signed-in user (callable handles automatically) | Blocking AI chat — student/operator question → orchestrator → response |
| `hexAiChatStream` | HTTP (onRequest) | Firebase ID token in `Authorization: Bearer` header | Streaming AI chat — SSE forwarded chunk-by-chunk from orchestrator |
| `hexAiHealth` | callable (onCall) | signed-in user | Probe whether orchestrator is reachable from CF runtime |

### Why two chat functions?

Firebase callable functions are unary by design — they buffer the entire response before returning, which defeats streaming. `hexAiChatStream` uses `onRequest` (an HTTP function) so it can pipe the orchestrator's SSE stream straight to the browser. The auth model differs:

- `onCall` validates the user's Firebase ID token internally (zero callsite code).
- `onRequest` requires the client to send `Authorization: Bearer <idToken>` explicitly, and the function calls `getAuth().verifyIdToken()` per request.

The HTTP function uses an explicit CORS allowlist (hexworth.com + Firebase preview channels + localhost emulator). The `cors: true` shortcut is unsafe here because we accept credentials in the Authorization header.

## Request / response shape

### `hexAiChat`

**Request (client → CF):**

```js
{
  message:              "What does 'ls -la' do?",   // required, <= 4000 chars
  house:                "code",                      // optional
  mission_id:           "lab-py-01",                 // optional — drives failed_attempts derivation
  hint_used_recently:   false                        // optional
  // NOTE: failed_attempts is NOT accepted from the client as of v0.4.0.
  //       Derived server-side from Firestore flag_attempts + flag_captures.
}
```

**Response (CF → client):**

```js
{
  response:           "...",
  persona:            "code",
  persona_name:       "Patient Pat",
  help_level:         2,
  help_level_label:   "Directional",
  model:              "qwen2.5:7b",
  latency_ms:         3421
}
```

**Error codes (`HttpsError` codes):**

| Code | Reason |
|---|---|
| `unauthenticated` | No Firebase user (must sign in) |
| `invalid-argument` | Missing message or > 4000 chars |
| `deadline-exceeded` | Orchestrator > 30s |
| `unavailable` | Orchestrator unreachable (network / DNS / tunnel) |
| `internal` | Orchestrator returned non-2xx |

### `hexAiHealth`

```js
// Response:
{
  bridge: "ok",
  orchestrator: "ok" | "unreachable: <reason>",
  orchestrator_version: "0.3.0" | null
}
```

Use this in the web app to detect "CF can talk to hexclass" failures separately from "CF code is broken" failures.

## Security model

| Surface | Defense |
|---|---|
| Client cannot reach hexclass directly | Orchestrator binds `127.0.0.1` on hexclass; Cloudflare Tunnel is the only path |
| Client cannot impersonate instructor | `role` derived from `request.auth.token.admin` claim, not client body |
| Client cannot replay another user's UID | `user_uid` derived from `request.auth.uid`, not client body |
| **Client cannot inflate `failed_attempts`** | **`deriveFailedAttempts()` reads Firestore `users/{uid}/flag_attempts` and `flag_captures` server-side; client value rejected (v0.4.0)** |
| API key cannot leak through code | Stored in Secret Manager, accessed via `defineSecret('HEX_AI_API_KEY').value()` |
| API key cannot leak through error messages | Orchestrator never echoes the supplied key in 401 responses (per `main.py:115`) |
| Slow orchestrator does not hang clients | 30s `AbortController` timeout in `postToOrchestrator()` |
| Stolen API key cannot reach hexclass | Cloudflare Access service-token policy limits the tunnel to the CF runtime |

## Deferred work (called out explicitly)

| Item | Why deferred | When to revisit |
|---|---|---|
| ~~Streaming responses (SSE)~~ | **shipped v0.5.0a** — `hexAiChatStream` HTTP function | done |
| Server-side `hint_used_recently` | No hint-usage tracking collection exists yet | v0.4.1 (when hint analytics ship) |
| Conversation memory | Each call is independent; multi-turn context requires Redis-backed thread store | v0.5.0 |
| Tool calling | Architecture-defining; needs operator design conversation | v0.6.0 |
| Per-user rate limit | Defer until traffic shape is real | After first 100 unique callers |

## Secrets to set before deploy

```bash
# From hexclass operator shell — copy the live key
ssh hexclass 'grep -oP "KEY=\K.*" /tmp/hex-test-key'

# In Firebase project — store the key
firebase functions:secrets:set HEX_AI_API_KEY
#   (paste the key from above when prompted)

# And the orchestrator URL (will be the Cloudflare Tunnel public hostname)
firebase functions:secrets:set HEX_AI_URL
#   (e.g., https://hex-ai.hexworth.com)

# Cloudflare Access service-token credentials (optional — only when
# CF Access policy is in place per the deploy runbook step 2)
firebase functions:secrets:set CF_ACCESS_CLIENT_ID
firebase functions:secrets:set CF_ACCESS_CLIENT_SECRET
```

The CF Access secrets are **optional**: if unset, the bridge simply omits the `CF-Access-Client-Id` / `CF-Access-Client-Secret` headers on outbound calls. This keeps emulator + dev work happy. Production deploys set them once the Cloudflare Access policy is configured.

## Deploy gate

This function is FORBIDDEN to deploy until:

1. Cloudflare Tunnel is provisioned on hexclass with public hostname
2. Cloudflare Access service-token policy is configured (only CF runtime allowed)
3. Both secrets above are set in the Firebase project
4. Operator explicitly authorizes the deploy in chat

Per `CLAUDE.md` rule 10 — production write gate. The functions code is staged in the repo; the deploy is the operator's call.

## Test plan (before deploy)

Local emulator test (`firebase emulators:start --only functions`):

```bash
# In a test client, sign in as a Firebase user, then:
const chat = httpsCallable(functions, 'hexAiChat');
const result = await chat({ message: "What is ls?", house: "code" });
console.log(result.data.response);

const health = httpsCallable(functions, 'hexAiHealth');
const probe = await health();
console.log(probe.data);
// Expected if orchestrator is offline-from-CF (no tunnel yet):
//   { bridge: "ok", orchestrator: "unreachable: ...", orchestrator_version: null }
```

Once the tunnel is up, `orchestrator: "ok"` should appear.

## Related

- `_docs/architecture/dr-hex-orchestrator.md` — the orchestrator this bridge talks to
- `_docs/architecture/hex-ai-network-exposure.md` — Cloudflare Tunnel decision (prerequisite)
- `_docs/operations/hexclass-server-profile.md` — the host that runs the orchestrator

---

*Last Updated: 2026-05-23 · v0.3.0 bridge — built, not yet deployed*
