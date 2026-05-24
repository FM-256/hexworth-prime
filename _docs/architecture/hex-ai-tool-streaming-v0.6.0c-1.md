# Hex AI — Streaming Tool Support (v0.6.0c-1)

> Built 2026-05-24 · Live on hexclass as v0.6.3
> Builds on: v0.6.0b blocking tool dispatch + v0.5.0a SSE streaming
> Closes the v0.6.0b "streaming path ignores tools" deferral

## What this is

Streaming `/chat/stream` now uses the same tool dispatch loop as blocking `/chat`. When the model decides to call a tool during a streamed conversation, the orchestrator pauses, dispatches the tool, emits `tool_call_start` and `tool_call_done` SSE events to the client, then opens a SECOND upstream ollama stream and forwards the final-answer tokens as they arrive.

The student sees: `meta → tool_call_start → tool_call_done → token → token → ... → done`. UI can render "Dr. Hex is looking up X..." between the start and done events.

## Why this needed its own slice

ollama's streaming API doesn't yield tokens when the model calls a tool — instead it sends a single message with `tool_calls` and `done: true`. So the orchestrator can't just forward bytes through; it needs to:

1. Detect "is this stream emitting tokens or tool_calls?"
2. If tool_calls: buffer them, dispatch, augment the messages array
3. Open a NEW upstream stream with the augmented messages
4. Forward THAT stream's tokens to the client

The v0.6.0b blocking path handles this naturally with a `for iteration in range(...)` loop. The streaming path needs the same loop but yielded as event tuples to keep the SSE forwarder generic.

## Implementation

`stream_ollama` is now an async generator that yields `(event_type, payload)` tuples:

| Event type | Payload | When |
|---|---|---|
| `"token"` | `str` (chunk) | The model is streaming the final answer |
| `"tool_call_start"` | `{name, parameters}` | A tool dispatch is about to run |
| `"tool_call_done"` | `{name, ok, code, error?}` | The tool dispatch returned |
| `"error"` | `str` | Upstream ollama error |

The `/chat/stream` handler iterates and renders each tuple as an SSE event with the matching type.

### Cap behavior

Same `MAX_TOOL_ITERATIONS` (default 3) bound as the blocking path. On cap:

1. Open a final NON-STREAMING ollama call with messages + `"Do NOT call more tools"` system note
2. Read the full response
3. Emit it as a single `("token", final)` event

The client doesn't notice the cap was hit — they get tokens just like a normal final answer, just all at once instead of progressively.

### Audit + memory in the streaming loop

The streaming version fires the same audit calls as the blocking version after each dispatch — `tool_audit.schedule_invocation(...)` runs fire-and-forget. Conversation memory persistence (`conversation.append_turns(...)`) happens after the stream completes in the existing v0.6.1 code path.

## SSE event timeline

```
client → POST /chat/stream {message, conversation_id, ...}
                ↓
server emits:
    data: {"type":"meta","persona":"shield","persona_name":"Sergeant Stoic",
           "help_level":2,"model":"qwen2.5:7b","rag_hits":3,
           "rag_titles":[...],"prior_turn_count":2,"tools_visible":2}

    [if model calls a tool:]
    data: {"type":"tool_call_start","name":"search_knowledge_base",
           "parameters":{"query":"printer spooler"}}
    data: {"type":"tool_call_done","name":"search_knowledge_base",
           "ok":true,"code":null,"error":null}

    [final-answer tokens stream:]
    data: {"type":"token","content":"The printer spooler"}
    data: {"type":"token","content":" service handles"}
    data: {"type":"token","content":" print queue requests..."}
    ...

    data: {"type":"done","latency_ms":12480}
```

## Client SDK changes

`HexAI.js askDrHexStream` gains two new optional callbacks:

```js
await ai.askDrHexStream(
    "Search the knowledge base for printer issues",
    { house: 'shield' },
    {
        getIdToken: () => auth.currentUser.getIdToken(),
        onMeta:           (m) => /* persona, level, tools_visible */,
        onToolCallStart:  (t) => {
            // t = {name, parameters}
            console.log(`Dr. Hex is calling ${t.name}...`);
        },
        onToolCallDone:   (t) => {
            // t = {name, ok, code, error}
            console.log(`${t.name} → ${t.ok ? 'OK' : 'failed'}`);
        },
        onToken:          (chunk) => responseEl.textContent += chunk,
        onDone:           (d) => /* latency_ms */,
    }
);
```

Both new callbacks are optional. Callers that don't need tool transparency can ignore them — the stream still works.

## What this slice does NOT do (deliberate)

- **No fine-grained progress events.** A long-running tool (e.g., a future `analyze_lab_attempt` that takes 10s) doesn't emit progress events between `start` and `done`. Tools should be fast enough that this isn't needed; if it becomes one, add a third event type.
- **No tool cancellation.** If the client disconnects mid-tool, the dispatch completes server-side and the result is discarded. Cancellation would require propagating the request's `is_disconnected()` check into `dispatch_tool_call`.
- **No retry on tool failure.** If a tool returns `ok: false`, the model sees the error in its context (via the role=tool message) and decides how to respond. No automatic retry.
- **No parallel tool dispatch.** Tools execute sequentially within an iteration. Matches the blocking path.

## Test status

- 17/17 tool registry tests pass
- 6/6 conversation memory tests pass
- Base `test_orchestrator.py` includes `test_streaming_sse_shape` which exercises the streaming pipeline; the v0.6.0c-1 changes preserve the meta → token → done sequence for non-tool-using queries.
- A streaming-with-tools integration test is a follow-up — verifying tool_call_start/done emission requires capturing all SSE events, not just probing the message at the end. The orchestrator's blocking-mode `test_model_invokes_search_when_asked_to_look_up` already proves the tool-dispatch chain works end-to-end; this slice rewires the streaming path through the same chain.

## Related

- `_docs/architecture/hex-ai-tool-layer-v0.6.0b.md` — blocking-mode tool dispatch
- `_docs/architecture/hex-ai-tool-layer-v0.6.0c-design.md` — v0.6.0c design covering this slice
- `_docs/architecture/hex-ai-cf-bridge.md` — `hexAiChatStream` HTTP function that proxies SSE to the browser
- `_docs/architecture/hex-ai-client-sdk.md` — `askDrHexStream` callback shape

---

*Last Updated: 2026-05-24 · v0.6.0c-1 — streaming tool support*
