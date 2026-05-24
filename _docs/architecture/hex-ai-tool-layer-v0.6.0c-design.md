# Hex AI Tool Layer — v0.6.0c Design

> Status: **DESIGN PROPOSAL — covers items deferred from v0.6.0b**
> Authored 2026-05-24 · Builds on: v0.6.0b shipped (`hex-ai-tool-layer-v0.6.0b.md`)

## What this slice does

v0.6.0c closes three gaps left open by v0.6.0b:

1. **Streaming tool support** — `/chat/stream` currently ignores tools because the ollama stream API emits `tool_calls` as a single message that breaks per-token SSE forwarding.
2. **`get_student_progress`** — the first Firestore-backed tool. Requires the CF bridge to be deployed AND a callback path from the orchestrator to Firestore.
3. **Tool invocation audit log** — `exposure_rules.audit=True` is documented but no write path exists. v0.6.0c adds the `tool_invocations` Firestore collection writes.

Each is a self-contained sub-slice (v0.6.0c-1/2/3); they can ship in any order based on operator-gate sequencing.

---

## v0.6.0c-1 — Streaming tool support

### Problem

ollama's `/api/chat` stream emits `tool_calls` as a single message (the model decides to call tools BEFORE emitting tokens). The current SSE forwarder pipes ollama bytes straight through to the client; it doesn't peek at message structure. So either:

- The client receives `tool_calls` in an SSE event but no infrastructure to execute them, OR
- The orchestrator interrupts the stream, dispatches the call, then opens a new stream — which the client SDK doesn't expect.

### Proposed shape

The orchestrator buffers the upstream stream until it has the full first message. Three paths:

| Upstream message | Orchestrator action |
|---|---|
| Plain text (no tool_calls) | Forward tokens as-is — current v0.5.0a behavior |
| Has tool_calls | Buffer, dispatch each, re-prompt ollama (still streaming), forward the SECOND stream's tokens |
| Mixed (content + tool_calls) | Send content as a "preamble" SSE event, then dispatch + re-prompt as above |

### New SSE event types

| Type | Payload | When |
|---|---|---|
| `meta` (existing) | persona, level, model, rag_hits, rag_titles | First event |
| `tool_call_start` | `{name, parameters}` | When orchestrator dispatches a tool |
| `tool_call_done` | `{name, ok, result_summary}` | When dispatch returns |
| `token` (existing) | content chunk | After all tools resolve, during final stream |
| `done` (existing) | latency_ms, total_tool_calls | End of stream |
| `error` (existing) | error message | On any failure |

The SDK consumer (`askDrHexStream`) gains two new optional callbacks: `onToolCallStart`, `onToolCallDone`. UI can show "Dr. Hex is looking up the knowledge base..." between the meta event and the first token.

### Iteration cap during streaming

`MAX_TOOL_ITERATIONS` (default 3) still bounds the loop. On cap hit during streaming, the same fallback as blocking applies: re-prompt without tools + system note, stream the final answer.

---

## v0.6.0c-2 — `get_student_progress`

### Problem

The orchestrator runs on hexclass; it can't directly query Firebase Firestore without `firebase-admin` + service-account JSON. That's a new dependency + secret to manage.

### Two implementation paths

**Path A: orchestrator-side firebase-admin**

```
pip install firebase-admin   # ~100MB transitive deps
ssh hexclass and place service-account.json at /opt/hexclass/orchestrator/.fb-creds.json
Set GOOGLE_APPLICATION_CREDENTIALS env var in systemd drop-in
```

Pros: same SDK CF uses, identical query shape, no extra hop.
Cons: new dependency, new secret, hexclass becomes a place a Firestore-write bug could fire.

**Path B: orchestrator calls back to a CF endpoint**

```
New CF: hexAiToolCallback (HTTP, X-API-Key auth from orchestrator)
Orchestrator's get_student_progress handler posts to this CF
CF runs the Firestore query as the existing admin SDK
Returns result to orchestrator
```

Pros: centralizes Firestore access in functions/. No new hexclass dependency. Single auth path.
Cons: extra network hop (~50-100ms). CF cold start risk.

### Recommendation: Path B

The latency cost (50-100ms per tool call) is small relative to overall chat latency (3-25s). The architectural cleanness — Firestore stays in one codebase, no new secrets on hexclass — outweighs the hop. If latency becomes a concern after real traffic, Path A is a one-day migration.

### Tool definition

```python
@register_tool(
    name="get_student_progress",
    description="Look up the student's progress on a specific mission/lab.",
    parameters_schema={
        "type": "object",
        "properties": {
            "mission_id": {"type": "string"},
        },
        "required": ["mission_id"],
        "additionalProperties": False,
    },
    exposure_rules={
        "min_help_level": 1,
        "allowed_personas": ["dr-hex", "shield", "code", "script", "matrix"],
        "denied_personas": ["dark-arts"],   # offensive house doesn't get progress lookups
        "instructor_only": False,
        "audit": True,
    },
)
async def get_student_progress(ctx, mission_id: str) -> dict:
    return await _call_cf_tool("get_student_progress", {"mission_id": mission_id}, ctx)
```

`_call_cf_tool` is the new helper in `tools/_cf.py` that signs the request with the orchestrator's X-API-Key and POSTs to `${HEX_AI_CF_CALLBACK_URL}/tool`. Pass ctx (uid, role, etc.) as part of the body — the CF re-validates the orchestrator's key on every callback.

### Cloud Function shape

```js
exports.hexAiToolCallback = onRequest({
    region: 'us-central1',
    secrets: [hexAiApiKey],
    timeoutSeconds: 30,
}, async (req, res) => {
    // Validate X-API-Key from orchestrator
    if (req.headers['x-api-key'] !== hexAiApiKey.value()) {
        return res.status(401).end();
    }
    const { tool, parameters, ctx } = req.body;
    if (tool === 'get_student_progress') {
        const uid = ctx.uid;
        const mission_id = parameters.mission_id;
        // Re-use the existing flag_attempts + flag_captures query
        const result = await fetchProgressForMission(uid, mission_id);
        return res.json(result);
    }
    return res.status(404).json({ error: 'unknown tool' });
});
```

### What the model sees

```json
{
    "ok": true,
    "result": {
        "mission_id": "lab-py-01",
        "flags_captured": 3,
        "flags_total": 5,
        "last_activity_iso": "2026-05-23T19:42:11Z",
        "attempted_uncaptured_flag_ids": 2,
        "session_age_minutes": 47
    }
}
```

No raw flag values, no actual flag IDs — just counts and timestamps. The model sees enough to say "you've got 3 of 5 flags; what's stopping you on the others?" without leaking the answers.

---

## v0.6.0c-3 — Audit log

### Problem

`exposure_rules.audit=True` is documented as "every invocation is written to `tool_invocations` collection in Firestore for review." No code does this yet.

### Proposed shape

Audit writes go through the same CF callback used by `get_student_progress` (one less code path on hexclass). New CF endpoint or new method on the same:

```js
// In hexAiToolCallback or sibling
if (body.action === 'audit') {
    await db.collection('tool_invocations').add({
        uid: ctx.uid,
        persona: ctx.persona_slug,
        help_level: ctx.help_level,
        tool_name: body.tool_name,
        parameters: body.parameters,         // already schema-validated
        ok: body.ok,
        result_summary: body.result_summary, // truncated to ~500 chars
        error: body.error || null,
        timestamp: FieldValue.serverTimestamp(),
    });
    return res.status(204).end();
}
```

The orchestrator calls this AFTER a tool dispatch completes (non-blocking — fire-and-forget). Failures to audit log a warning but don't fail the chat — audit is observability, not security boundary.

### Retention

Cloud Function (scheduled, daily): delete `tool_invocations` entries older than 30 days. Single 5-line CF. Confluence parent: Operations and Procedures.

### Operator dashboard view

`_app/admin/ai-tool-audit.html` — admin-gated page showing:

- Last 100 invocations sorted by timestamp desc
- Filter by tool name, persona, ok/error
- Per-student view: "show me all tool calls for this uid in the last week"
- Failure heatmap (which tools failed most)

Doc-only for now — UI lands when audit log has real data.

---

## Implementation order recommendation

| # | Slice | Operator gate? | Why this order |
|---|---|---|---|
| 1 | v0.6.0c-3 audit log | Needs CF callback endpoint deployed | Closes the smallest gap (one CF, fire-and-forget). Lays the CF callback foundation that v0.6.0c-2 reuses. |
| 2 | v0.6.0c-2 `get_student_progress` | Same CF callback; needs the same gate | Reuses the audit-log CF infra; minimal new code |
| 3 | v0.6.0c-1 streaming tools | None (orchestrator-only) | Most isolated, can ship without operator action; defer until 1+2 ship so the operator-visible feature lands all at once |

All three ship within the same operator deploy event. Total operator action: one `firebase deploy --only functions:hexAiToolCallback` after secrets are set.

## What's STILL not in v0.6.0c

- **Mutating tools** (write-to-Firestore) — explicitly deferred per the design doc until read-only tools have a track record
- **Cross-student tools** (instructor-only) — defer until role-aware filtering is battle-tested
- **Tool-call parallelism** — current loop runs tools sequentially within a turn
- **Per-conversation `max_tool_calls`** — depends on v0.5.0b Redis memory landing first

## Related

- `_docs/architecture/hex-ai-tool-layer-design.md` — v0.6.0 broader design
- `_docs/architecture/hex-ai-tool-layer-v0.6.0a.md` — scaffolding
- `_docs/architecture/hex-ai-tool-layer-v0.6.0b.md` — first real tool + /chat wiring
- `_docs/architecture/hex-ai-cf-bridge.md` — the CF bridge to which this adds endpoints

---

*Last Updated: 2026-05-24 · v0.6.0c design — awaiting operator review*
