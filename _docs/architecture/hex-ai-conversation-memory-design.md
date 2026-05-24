# Hex AI — Conversation Memory Design (v0.5.0b proposal)

> Status: **DESIGN PROPOSAL — Nancy review pending, implementation gated on operator review**
> Authored 2026-05-23 · Sibling to: `_docs/architecture/dr-hex-orchestrator.md`

## What this is

Every chat call in v0.5.0a is **independent** — Dr. Hex has no memory of the previous turn. A student asks "explain TCP", gets an answer, asks "why does it need three handshakes?", and the model has to re-derive from scratch that "it" means TCP. v0.5.0b adds short-lived conversation memory backed by Redis (the container is already running on hexclass, unused).

This is a **bounded** memory: keyed by `conversation_id`, TTL'd to ~30 minutes of inactivity, capped at ~10 turns. It is NOT a long-term knowledge base — that's RAG's job. It is the equivalent of "the student and the AI are mid-conversation".

## Why bounded (and not "remember everything")

Long-term per-student conversation history would:

1. Inflate every prompt's context window (cost + latency).
2. Make help-level escalation incoherent (yesterday's failures still leak into today's session).
3. Create a non-trivial privacy surface (rolling transcript of every student conversation).
4. Force a non-trivial UI ("clear history" affordance, retention controls).

A 30-min TTL + 10-turn cap matches the "mid-conversation" semantic. Past that, the slate clears — which is what a teaching assistant does anyway between class periods.

## Data model

### Redis key shape

```
hex_ai:conv:<conversation_id>      → JSON list of turn objects (LPUSH/LTRIM)
hex_ai:conv:<conversation_id>:meta → JSON {uid, created_iso, last_used_iso}
```

Each turn:

```json
{
    "role": "user" | "assistant",
    "content": "...",
    "ts": "2026-05-23T18:42:11Z",
    "tokens_in": 42,     // for cost telemetry; optional
    "tokens_out": 188
}
```

### TTL strategy

- Both keys get `EXPIRE 1800` (30 min) on every write.
- LTRIM keeps the list capped at 20 entries (10 user + 10 assistant).
- The `:meta` key lets the operator audit active conversations without touching the transcript.

### Why JSON list vs Redis Streams

Streams have richer semantics but the orchestrator's needs are simple: read last N items + append new item + trim. List + LTRIM is one fewer abstraction layer. If we later need consumer groups (multiple workers reading the same conversation), upgrade to Streams.

### Why not Firestore

Latency. Each `/chat` already has RAG embed (~50ms) + ollama (~3-25s). Adding a Firestore round-trip (~80-150ms p50) would push p50 latency over 5s for short queries. Redis on `127.0.0.1` is sub-ms.

## Conversation lifecycle

```
[client opens chat surface]
   ↓ generates conversation_id (UUID v4 in browser)
   ↓ POST /chat with conversation_id
[orchestrator]
   ↓ LRANGE hex_ai:conv:<id> 0 19  → prior turns (most recent first)
   ↓ reverse + truncate to last N
   ↓ include in ollama messages array AFTER system prompt
   ↓ LPUSH user message + LPUSH assistant response
   ↓ EXPIRE 1800s
[client]
   ↓ next message — re-uses same conversation_id
   ↓ ... (until 30 min idle or user starts a new chat)
[Redis]
   ↓ EXPIRE fires; conversation gone
```

## Request shape changes

### Orchestrator `/chat` and `/chat/stream`

New optional field on the request:

```python
class ChatRequest(BaseModel):
    user_uid: str
    message: str
    house: str | None = None
    mission_id: str | None = None
    role: Literal[...] = "student"
    failed_attempts: int = 0
    hint_used_recently: bool = False
    base_help_level: int | None = None
    model: str | None = None
    show_thinking: bool = False
    conversation_id: str | None = None    # NEW — UUID from client
```

If `conversation_id` is null → independent call (same as v0.5.0a). If provided → orchestrator includes prior turns and persists this turn.

### CF bridge

`hexAiChat` + `hexAiChatStream` pass `conversation_id` through transparently. The bridge does NOT mint conversation IDs (that's the client's job) and does NOT enforce uniqueness (Redis handles collisions naturally — different students can't share an ID because the client generates UUIDs).

### Client SDK

```js
const ai = new HexAIClient(functions);
const conversationId = crypto.randomUUID();

await ai.askDrHex("Explain TCP", { conversationId, house: 'web' });
await ai.askDrHex("Why three handshakes?", { conversationId, house: 'web' });
// → second call has the first in its context

ai.startConversation();   // generates a new ID, replaces ai._currentConversationId
```

## Composing the ollama messages array

Current v0.5.0a shape (no memory):

```python
messages = [
    {"role": "system", "content": full_system_prompt},   # voice + persona + help_level + context
    {"role": "user",   "content": augmented_user_message}, # RAG block + user message
    {"role": "system", "content": CONSTITUTION},
]
```

v0.5.0b shape (with memory):

```python
messages = [
    {"role": "system", "content": full_system_prompt},
    # Prior turns inserted here, oldest first, capped at MAX_CONV_TURNS:
    {"role": "user",      "content": "Explain TCP"},
    {"role": "assistant", "content": "TCP is..."},
    {"role": "user",      "content": "Why three handshakes?"},      # — new turn
    {"role": "system",    "content": CONSTITUTION},
]
```

The augmented_user_message (RAG block prepended to the new user message) is only on the LATEST turn — prior turns are preserved verbatim without re-injection of their RAG context. Reason: RAG retrieval was relevant to the original question, not to the current re-querying of the corpus, and including N copies of RAG blocks balloons context size.

## Memory bounds

| Limit | Value | Why |
|---|---|---|
| Max turns retrieved per request | 10 (5 user + 5 assistant pairs) | Past this, qwen2.5:7b loses coherence on which thread we're in |
| TTL after last write | 1800s (30 min) | Matches class-period semantic |
| Max message length per turn | 4000 chars (same as user input cap) | Already enforced upstream |
| Total context budget | ~8000 tokens for prior turns | qwen2.5:7b has 32k window; reserve majority for system prompt + RAG + reply |

Tunables via env vars: `HEX_CONV_TTL_S`, `HEX_CONV_MAX_TURNS`, `HEX_CONV_TOTAL_TOKEN_BUDGET`.

## Failure modes

| Failure | Behavior |
|---|---|
| Redis down | Treat as no-memory — orchestrator logs warning, proceeds with empty prior turns |
| Conversation ID missing from request | Independent call (no memory) |
| Conversation ID supplied but no Redis history | Independent call (new conversation, history will be created on this turn) |
| Turn count exceeds cap mid-conversation | LTRIM drops oldest pairs; orchestrator only sees the last N |
| Two clients send same conversation_id | They share history (a feature, not a bug — paired-work scenario) |

The "Redis down → no memory" path is the load-bearing safety property. Memory is augmentation, not a dependency. Conversation works at lower quality without it.

## Security + privacy

| Surface | Defense |
|---|---|
| Cross-user history leak | Each conversation has an embedded UID in `:meta`; orchestrator refuses to serve a conversation if the requesting uid doesn't match the stored uid |
| Conversation ID guessing | UUIDs v4 are 122 bits of entropy — not enumerable. Plus the UID-match check above |
| PII retention beyond intent | 30-min TTL is hard-floor; no operator override; no "remember forever" affordance |
| Audit trail | Conversation IDs logged at orchestrator INFO level with first 8 chars only; full IDs never logged |
| Cross-orchestrator-restart persistence | Redis is in-memory; restart drops conversations — by design |

## Implementation order

| Phase | What | Touches |
|---|---|---|
| v0.5.0b-1 | `conversation.py` module: get/append/trim/expire helpers | new file, orchestrator |
| v0.5.0b-2 | Wire into `_resolve_request` — accept conversation_id, fetch prior turns | `main.py` |
| v0.5.0b-3 | Compose messages array with prior turns + LPUSH after success | `main.py`, `call_ollama_blocking`, `stream_ollama` |
| v0.5.0b-4 | UID-match defense at conversation read | `conversation.py` |
| v0.5.0b-5 | Regression tests: memory present, memory absent, Redis down, UID mismatch | `tests/test_conversation_memory.py` |
| v0.5.0b-6 | CF bridge passthrough — `hexAiChat` + `hexAiChatStream` accept + forward `conversation_id` | `functions/hex-ai-bridge.js` |
| v0.5.0b-7 | Client SDK — `conversationId` option + `startConversation()` helper | `_app/_lib/HexAI.js` |
| v0.5.0b-8 | Test page UI — conversation panel, "new conversation" button, persistence indicator | `_app/admin/ai-chat-test.html` |

## What this design does NOT do (deliberate)

- **No cross-device conversation continuity.** Each browser session gets its own conversation ID. If a student opens Hexworth on phone + laptop, two conversations. Reason: solving this needs server-side conversation indexing per UID, which adds Firestore latency on every chat call.
- **No conversation search.** "Find the chat where we discussed TCP" isn't a feature. Past 30 min, the chat is gone.
- **No transcript export.** No "save this conversation" affordance. Aligns with the 30-min memory model — the value is in continuity, not in recordkeeping.
- **No multi-turn tool calls** — tools are independent per-request. A tool result from turn N doesn't auto-flow into turn N+1's context unless the model re-mentions it. (Could revisit in v0.6.0c.)
- **No vector-index of conversation history.** RAG runs against the static corpus, not against prior turns. Mixing the two surfaces complexity for marginal value.

## Open design questions

1. **Conversation ID minting.** Browser `crypto.randomUUID()` is fine for v0.5.0b. Should the CF bridge issue conversation IDs instead, so the operator has a server-side audit point? Tradeoff: extra round-trip for the first message vs cleaner audit.

2. **Help-level changes mid-conversation.** If a student crosses `failed_attempts >= 3` partway through a conversation, the help_level jumps. Do prior turns get "promoted" to higher disclosure in retrospect, or stay at original level? Recommend: stay original (don't rewrite history), but flag the level change in the prompt.

3. **Persona switches mid-conversation.** A student moving from Web house to Shield house mid-conversation. Does the assistant memory persist across personas (potentially confusing — "wait, who am I again?") or reset? Recommend: persist; the persona is set per-turn anyway, and the model handles "the same person asked me this" naturally.

4. **Conversation memory + RAG interaction.** If turn 1 RAG-retrieved chunk X and turn 3 doesn't re-retrieve it, the model has no context-prompt copy of X anymore (since prior-turn RAG blocks are stripped). Is this acceptable, or should we cache the union of prior RAG chunks for the conversation? Recommend: don't cache — let the current turn's RAG retrieval surface what's relevant.

## Related

- `_docs/architecture/dr-hex-orchestrator.md` — orchestrator the memory plugs into
- `_docs/architecture/hex-ai-cf-bridge.md` — CF bridge that proxies conversation_id
- `_docs/architecture/hex-ai-client-sdk.md` — client SDK that mints/owns conversation_id
- `_docs/architecture/hex-ai-tool-layer-design.md` — sibling slice; conversation memory comes BEFORE tool layer because tools benefit from conversation context

---

*Last Updated: 2026-05-23 · v0.5.0b design proposal — awaiting operator review*
