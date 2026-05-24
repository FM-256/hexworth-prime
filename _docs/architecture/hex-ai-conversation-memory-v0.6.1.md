# Hex AI — Conversation Memory v0.6.1 (was v0.5.0b)

> Live as of 2026-05-24 · Source: `_tools/hexclass/orchestrator/conversation.py`
> Builds on: v0.6.0b shipped tool layer
> Design doc: `hex-ai-conversation-memory-design.md` (operator-approved 2026-05-23)

## What this is

Bounded short-term conversation memory backed by the Redis container that's been running on hexclass since 2026-05-23. Up through v0.6.0b, every `/chat` and `/chat/stream` call was independent — Dr. Hex had no memory of the previous turn. v0.6.1 lets the client carry a `conversation_id` and Dr. Hex remembers the last 10 turns for 30 minutes.

This is NOT a long-term knowledge base (RAG handles that). It's the equivalent of "the student and the AI are mid-conversation" — past 30 minutes idle, the slate clears.

## Why v0.6.1 not v0.5.0b

The design doc was authored before v0.6.0a/b shipped the tool layer. By the time we got to implementing memory, v0.6.0b was already live. Versioning v0.6.1 makes the sequence linear instead of branching back to v0.5.0b under a v0.6 release.

## Data model

### Redis keys

```
hex_ai:conv:<conversation_id>      → JSON list, LPUSH order (newest first)
hex_ai:conv:<conversation_id>:meta → JSON {uid, created_iso, last_used_iso}
```

### Each turn

```json
{
    "role": "user" | "assistant",
    "content": "...",
    "ts": "2026-05-24T03:42:11Z"
}
```

### TTL + cap

| Bound | Value | Why |
|---|---|---|
| TTL after last write | 1800s (30 min) | Matches "class-period" semantic |
| Max stored turns | 20 entries (10 user + 10 assistant) | qwen2.5:7b loses coherence past this |
| Per-Redis-call timeout | 1.5s | Sub-ms LAN; generous |

All tunable via env vars: `HEX_CONV_TTL_S`, `HEX_CONV_MAX_TURNS`, `HEX_CONV_TIMEOUT_S`.

## Identity flow (the security layer)

Every read calls `_meta_key(conversation_id)` first, verifies `meta.uid == requesting_uid`, and refuses to return the list otherwise. Two students cannot share a conversation by guessing each other's IDs:

```python
if stored_uid != uid:
    log.warning("conv: UID mismatch on %s ... refusing read", _redact_id(conversation_id))
    return []
```

Test `test_uid_mismatch_yields_fresh_conversation` proves this end-to-end on hexclass.

Conversation IDs in logs are redacted to first 8 characters (e.g. `c4f15ca7…`). Full IDs never appear in journal entries.

## Composing the ollama messages array

Old order (v0.6.0b):

```
[
  {role: system,  content: COMMON_VOICE + PERSONA + HELP_LEVEL + CONTEXT},
  {role: user,    content: REFERENCE_MATERIAL + user_message},
  {role: system,  content: CONSTITUTION},
]
```

New order (v0.6.1):

```
[
  {role: system,  content: COMMON_VOICE + PERSONA + HELP_LEVEL + CONTEXT},
  ─── prior turns (chronological, capped) ───
  {role: user,      content: "first user message"},
  {role: assistant, content: "first response"},
  ...
  ─── end prior turns ───
  {role: user,    content: REFERENCE_MATERIAL + new_user_message},
  {role: system,  content: CONSTITUTION},
]
```

Prior turns are inserted AFTER the system prompt and BEFORE the new user message. RAG context is only on the latest turn — past turns are preserved verbatim without re-injection of their RAG blocks.

## Failure modes

| Failure | Behavior |
|---|---|
| Redis down | Empty prior turns. Chat works without memory; log.warning surfaces the issue. |
| Missing `conversation_id` | Independent call. Same as v0.6.0b. |
| Conversation doesn't exist (first turn on this ID) | Empty prior turns. Subsequent turns will see history. |
| UID mismatch | Refuse to read OR write. Log.warning. The other user's history is invisible. |
| Invalid stored JSON | Skip that entry silently. Pipeline continues. |
| LTRIM cap hit | Oldest pairs drop silently (no notification). |

Memory is augmentation — `conversation.py` failures NEVER propagate to chat failures.

## Endpoints surface

`/chat` request shape adds an optional field:

```python
class ChatRequest(BaseModel):
    ...
    conversation_id: str | None = Field(None)
```

`/chat` and `/chat/stream` both:

1. Read prior turns via `conversation.fetch_prior_turns(id, uid)` in `_resolve_request`
2. Pass them to `call_ollama_blocking` / `stream_ollama` (inserted between system + new user)
3. After the assistant response, call `conversation.append_turns(id, uid, user_msg, assistant_msg)`

The append is async and non-blocking on the chat hot path — if Redis is slow, the response still returns at normal latency; the persist completes shortly after.

`/health` now reports:

```json
{
    "orchestrator": "ok",
    "version": "0.6.1",
    "ollama": "ok",
    "conversation_memory": {
        "redis": "ok",
        "ttl_seconds": 1800,
        "max_turns": 10
    },
    ...
}
```

`show_thinking=true` surfaces `prior_turn_count` (number of prior turns the model just saw).

## CF bridge passthrough

`functions/hex-ai-bridge.js` — both `hexAiChat` (callable) and `hexAiChatStream` (HTTP) accept `conversation_id` from the client and pass it through unchanged. The bridge does NOT mint IDs (that's the client's job) and does NOT enforce uniqueness (Redis collisions are handled by the orchestrator's UID-mismatch defense).

## Client SDK

```js
const ai = new HexAIClient(functions);

// Start a conversation. The SDK tracks it; subsequent calls reuse the ID.
const id = ai.startConversation();      // mints UUID v4
console.log(id);                         // → 'c4f15ca7-...'

await ai.askDrHex("My favorite color is purple.");
await ai.askDrHex("What did I just tell you?");
// Second call uses the same conversation_id; orchestrator surfaces prior turns.

// Per-call override
await ai.askDrHex("Independent question", { conversation_id: null });
//                                          ↑ explicit null = no memory this call

// End the conversation. Next askDrHex without context.conversation_id = independent.
ai.endConversation();

// Inspect
ai.currentConversationId();              // → 'c4f15ca7-...' or null
```

`crypto.randomUUID()` is browser-standard since Chrome 92 / Safari 15.4 — Hexworth's modern-browser requirement covers this; no polyfill needed.

## Test set (5/5 passing on hexclass)

| Test | Proves |
|---|---|
| `test_health_surfaces_redis_status` | `/health.conversation_memory.redis` reflects backend state |
| `test_first_turn_has_zero_prior_turns` | New `conversation_id` → 0 prior turns |
| `test_no_conversation_id_means_no_memory` | Omitting the field → 0 prior turns (independent) |
| `test_uid_mismatch_yields_fresh_conversation` | UID-match defense — different `user_uid` on same `conversation_id` sees no history |
| `test_second_turn_sees_prior_turn` | **Load-bearing:** model recalls "purple" from turn 1 in turn 2 |

The load-bearing test took ~38 seconds (2 ollama calls). All others ran < 35s including ollama latency.

Total orchestrator regression coverage now: **49 tests across 6 sets** (was 44). All passing.

## Deploy notes

The redis container was already running on hexclass since 2026-05-23 (`docker ps` shows `hex-redis` Up 20+ hours). New work was:

- Install `redis[hiredis]>=5.0` in the orchestrator venv via uv (`/home/hexclass/.local/bin/uv`)
- Add the dependency to `pyproject.toml` (was missing — orchestrator had no `redis` or `psycopg` in deps even though both were used at runtime)
- Deploy `conversation.py` + updated `main.py` + new test file
- Restart `hex-orchestrator.service`

Time from start to all-tests-green: ~40 minutes.

## What v0.6.1 does NOT do

- **No cross-device continuity** — each browser session gets its own conversation ID. Phone + laptop = two conversations.
- **No conversation search** — past 30 min, the chat is gone. No "find the chat about TCP" feature.
- **No transcript export** — no "save this conversation" affordance.
- **No multi-turn tool result memory** — tools are independent per-request. A tool result from turn N doesn't auto-flow into turn N+1 unless the model re-mentions it.
- **No vector index of conversation history** — RAG runs against the static corpus, not against prior turns.

These align with the bounded-memory semantic the design doc committed to.

## Related

- `_docs/architecture/hex-ai-conversation-memory-design.md` — design proposal
- `_docs/architecture/dr-hex-orchestrator.md` — orchestrator architecture
- `_docs/architecture/hex-ai-cf-bridge.md` — CF passthrough
- `_docs/architecture/hex-ai-client-sdk.md` — client SDK
- `_docs/architecture/hexclass-server-profile.md` — host that runs redis

---

*Last Updated: 2026-05-24 · v0.6.1 — bounded conversation memory · 49/49 tests · awaiting Nancy review*
