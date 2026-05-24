# Hex AI Tool Layer — v0.6.0b: First Real Tool + `/chat` Wiring

> Live as of 2026-05-24 · Source: `_tools/hexclass/orchestrator/`
> Builds on: v0.6.0a scaffolding · Sibling to: `hex-ai-tool-layer-design.md`

## What this is

The tool layer's first end-to-end working slice. v0.6.0a built the registry + dispatch validator + exposure filter; v0.6.0b wires those into the `/chat` request path and ships the first real student-facing tool: `search_knowledge_base`.

Why `search_knowledge_base` first, not `get_student_progress`?

The design doc named `get_student_progress` as the v0.6.0b candidate. But that tool needs the orchestrator to query Firestore — which requires `firebase-admin` on hexclass + service-account JSON credential setup. That's a fresh dependency chain that compounds with the still-pending Cloudflare Tunnel + CF deploy gates. `search_knowledge_base` uses only orchestrator-local state (pgvector + nomic-embed-text are already running), so the dispatch loop can be proved end-to-end **without** waiting on operator gates. `get_student_progress` lands in v0.6.0c after the CF chain is live and Firestore access is wired through it.

## The new tool: `search_knowledge_base`

```python
@register_tool(
    name="search_knowledge_base",
    description="Search the Hexworth knowledge base for content relevant to a query.",
    parameters_schema={
        "type": "object",
        "properties": {
            "query": {"type": "string"},
            "max_results": {"type": "integer"},   # clamped 1..5 server-side
        },
        "required": ["query"],
        "additionalProperties": False,
    },
    exposure_rules={
        "min_help_level": 2,        # Directional level — at Level 1 the model
                                    # should name topic areas, not search for them
        "allowed_personas": None,   # all 10 personas can call this
        "instructor_only": False,
        "audit": True,
    },
)
async def search_knowledge_base(ctx, query: str, max_results: int = 3) -> dict:
    chunks = await asyncio.to_thread(rag_retrieve, query, k=max(1, min(5, max_results)))
    return {"query": query, "chunks": [...], "match_count": len(chunks)}
```

Returns the orchestrator's existing pgvector retrieval, but as a deliberate model-driven call rather than the automatic always-on RAG. The model uses it when the auto-RAG didn't surface the right material.

## The dispatch loop

`call_ollama_blocking` now runs the tool-call loop:

```
1. Build messages array (system + user + constitution)
2. POST to ollama /api/chat with `tools` parameter
3. Check response.message.tool_calls
4. If empty → return text (final answer)
5. Otherwise:
   - Append assistant message (with tool_calls intent)
   - Dispatch each tool_call via dispatch_tool_call
   - Append role=tool messages with results
   - Loop back to step 2
6. After MAX_TOOL_ITERATIONS (default 3):
   - Re-prompt without tools + a system note saying "produce a final answer"
   - Return that text
```

The cap prevents runaway loops. The "force a final answer" step matters: a model that keeps wanting to use tools without ever wrapping up still produces text instead of timing out.

### Env vars added in v0.6.0b

| Variable | Default | Purpose |
|---|---|---|
| `HEX_MAX_TOOL_ITERATIONS` | 3 | Max tool-call iterations per chat turn |

## Per-request flow

```
client request
   ↓
auth (FastAPI dependency) → require_api_key
   ↓
_resolve_request:
   - Build context, persona, help_level
   - RAG retrieve (always-on, k=3)
   - filter_tools_for_context(persona, level, role) → tools_list
   - Build tool_ctx {uid, role, persona_slug, help_level}
   ↓
call_ollama_blocking:
   - Pass tools_list + tool_ctx
   - Run tool-call loop (max 3 iterations)
   ↓
Response with:
   - final text
   - tool_invocations[] (for transparency UI)
   - tools_visible[] (when show_thinking=true)
```

## What `show_thinking=true` now surfaces

The `context_packet` field on the response now includes:

```js
{
    user_uid, role, house, mission_id, failed_attempts, hint_used_recently,
    rag_chunks: [...],                     // v0.2.0 — auto-RAG retrieval
    tools_visible: ["search_knowledge_base"],  // v0.6.0b — what the model could call
    tool_invocations: [                    // v0.6.0b — what it actually called
        {
            name: "search_knowledge_base",
            ok: true,
            result: {query: "...", chunks: [...], match_count: 3},
            error: null,
            code: null,
        },
    ],
}
```

This is the transparency surface the UI will eventually use to show students "Dr. Hex looked up the knowledge base for printer spooler" rather than the search being invisible.

## Identity flow (re-emphasized)

Tool handlers receive `ctx` as the first argument. `ctx.uid`, `ctx.role`, `ctx.persona_slug`, `ctx.help_level` come from the orchestrator's per-request resolution — NEVER from the model's `tool_calls.arguments` (the schema doesn't include them, and dispatch validates the schema). The model can suggest WHICH tool to call and WHAT parameters to pass, but not WHO is asking — that's server-side.

## What `/chat/stream` does (and doesn't)

`/chat/stream` accepts the new `_resolve_request` return shape but **does not yet pass tools to ollama** during streaming. The ollama stream API emits `tool_calls` as a single message that breaks the per-token SSE forwarding model; the orchestrator would need to buffer + dispatch + restart the stream after each tool. That orchestration lands in v0.6.0c. For now, streaming = no tools, blocking = tools.

## Test set (v0.6.0b adds 5 integration tests, all passing)

`tests/test_tool_integration.py`:

| Test | Proves |
|---|---|
| `test_tools_visible_at_level_2_for_student` | `search_knowledge_base` appears in `tools_visible` for a default-level student |
| `test_instructor_only_tool_hidden_from_student` | `hex_ai_version` does NOT appear for students |
| `test_instructor_sees_diagnostic_tool` | `hex_ai_version` DOES appear for instructors |
| `test_help_level_2_hides_tool_at_lower_level` | `search_knowledge_base` hidden at help_level=1 |
| `test_model_invokes_search_when_asked_to_look_up` | Model actually calls the tool end-to-end (the load-bearing one) |

Existing sets still pass:
- `test_tools_registry.py` — 17/17
- `test_orchestrator.py` — 10/10 (version assertion bumped to 0.6.0b)
- `tests/test_rag_integration.py` — 4/4
- `tests/test_auth.py` — 8/8

Total regression coverage: **44 tests across 5 sets**.

## Deploy notes

Deployed via the Tailscale path (`ssh hexclass-via-bc1`) after LAN became unreachable mid-session (2026-05-23 23:00 UTC). The fallback path documented in `_docs/operations/hexclass-server-profile.md` worked as designed — zero functionality lost. Important validation of the dual-path access pattern.

## What's NOT in v0.6.0b (deliberate)

- **Streaming tool support** — `/chat/stream` ignores tools (v0.6.0c).
- **`get_student_progress`** — needs Firestore access; deferred to v0.6.0c.
- **Audit log to Firestore** — `tool_invocations` collection write planned for v0.6.0e.
- **Full JSON Schema validation** — still structural-only.
- **Parallel tool dispatch** — current loop runs tools sequentially. Ollama can return multiple tool_calls in one response; they execute one at a time. Parallel landed if tools start having independent expensive I/O.
- **Per-conversation `max_tool_calls`** (vs per-turn `MAX_TOOL_ITERATIONS`) — depends on v0.5.0b Redis memory landing first.

## Related

- `_docs/architecture/hex-ai-tool-layer-design.md` — broader v0.6.0 design
- `_docs/architecture/hex-ai-tool-layer-v0.6.0a.md` — scaffolding doc
- `_docs/architecture/dr-hex-orchestrator.md` — orchestrator architecture

---

*Last Updated: 2026-05-24 · v0.6.0b — first real tool live · 44 tests passing*
