# Hex AI — Tool Invocation Audit Log (v0.6.0c-3)

> Built 2026-05-24 · Source: `_tools/hexclass/orchestrator/tools/audit.py` + `functions/hex-ai-bridge.js` (`hexAiToolCallback`)
> Status: orchestrator side LIVE on hexclass; CF endpoint BUILT, awaiting deploy gate
> Closes the v0.6.0b "audit=True with no audit write" gap

## What this is

Every tool invocation marked `audit=True` in its `exposure_rules` is recorded in Firestore. Operators (and the student themselves) can review what Dr. Hex looked up and when. This closes the gap where v0.6.0a/v0.6.0b documented audit intent but had no write path.

Fire-and-forget by design — the chat path NEVER blocks on the audit write.

## Data flow

```
[student] → /chat → orchestrator dispatch loop
                       ↓ (each tool call)
                    dispatch_tool_call → result
                       ↓
                    schedule_invocation(name, params, ctx, result, audit_rule)
                       ↓ (if audit_rule AND audit URL configured)
                    asyncio.create_task(write_invocation(...))      ← detached
                                                ↓
                                  httpx.post(HEX_AI_AUDIT_URL,
                                             X-API-Key: ...,
                                             body)
                                                ↓
                                  Cloud Function: hexAiToolCallback
                                                ↓ (admin SDK)
                                  Firestore collection 'tool_invocations'
```

The chat handler returns to the user as soon as `dispatch_tool_call` completes. The audit task runs concurrently and is allowed to take up to `HEX_AI_AUDIT_TIMEOUT_S` (default 3s) — but its completion is never observed by the chat path.

## Firestore document shape

```
tool_invocations/{auto}
    uid             string    — student UID (orchestrator's tool_ctx.uid)
    tool_name       string
    parameters      map       — schema-validated tool params
    persona         string    — persona slug at call time
    help_level      integer   — help level at call time
    role            string    — student / instructor / operator
    ok              boolean   — whether dispatch succeeded
    result_summary  string    — truncated result (≤500 chars) or null
    error           string    — error message or null
    code            string    — dispatch error code or null
    ts              timestamp — server-side serverTimestamp() (authoritative)
    ts_iso          string    — orchestrator-side ISO ts (cross-check)
```

## Read access (Firestore rules)

```
match /tool_invocations/{docId} {
    allow read: if request.auth != null && (
        resource.data.uid == request.auth.uid || isAdmin()
    );
    allow write: if false;     // only the CF admin-SDK writes
}
```

| Role | Sees |
|---|---|
| Student | Only invocations for their own UID. Transparency: "see what Dr. Hex looked up about you." |
| Instructor / admin | All invocations across the platform. Oversight. |

No client writes. The CF (which authenticates the orchestrator via X-API-Key) is the only writer.

## Configuration

| Env var (orchestrator) | Purpose | Default |
|---|---|---|
| `HEX_AI_AUDIT_URL` | Full URL of `hexAiToolCallback` CF | `""` (audit disabled) |
| `HEX_AI_API_KEY` | Shared secret matching `HEX_API_KEYS` entry + Firebase secret | `""` (audit disabled) |
| `HEX_AI_AUDIT_TIMEOUT_S` | Per-call HTTP timeout | `3.0` |

If `HEX_AI_AUDIT_URL` is empty, `audit.is_enabled()` returns False and `schedule_invocation()` is a no-op. The orchestrator runs in dev/standalone mode without firing any audit writes. This is the current state until the CF is deployed.

## Respecting `exposure_rules.audit`

The orchestrator reads each registered tool's `audit` flag from its exposure rules:

```python
meta = TOOL_REGISTRY.get(name)
audit_rule = bool(meta and meta.exposure_rules.get("audit", True))
tool_audit.schedule_invocation(name, args, tool_ctx, result, audit_rule)
```

| Tool | audit setting | Why |
|---|---|---|
| `hex_ai_version` (`_meta.py`) | False | Operator-self probes; not worth storage |
| `search_knowledge_base` (`_kb.py`) | **True** | Student-facing; transparency matters |
| `get_student_progress` (v0.6.0c-2) | True | Looks at student's own data |

Default is True — silent-by-default would have been an audit gap.

## Result summary truncation

`result_summary` is capped at 500 characters with a "[+N chars]" suffix when truncated. Reason: tool results can be large (RAG search returns 3 chunks of ~500 chars each). The full result is in the orchestrator's per-request `tool_invocations` list (available via `show_thinking=true` to instructors); audit storage is for review-after-the-fact, not replay.

## Security model

| Surface | Defense |
|---|---|
| Orchestrator forging UIDs | Orchestrator's `tool_ctx.uid` came from CF bridge → `request.auth.uid` (Firebase ID token verified). Trusted as long as the CF→orchestrator hop is protected. |
| Forged audit writes by external party | X-API-Key required + constant-time compare (`crypto.timingSafeEqual`) in `hexAiToolCallback`. The same secret protects `/chat` upstream. |
| Audit log used as covert channel | Tool parameters are schema-validated before dispatch — only valid shapes reach the audit. result_summary is server-truncated to 500 chars. |
| Cross-user history leaks | Firestore rule gates reads by `resource.data.uid == request.auth.uid` (or admin). Students cannot read other students' audit entries. |
| CF service-token compromise | The CF itself only writes to `tool_invocations` — no read side-channel from this endpoint. |

## Deferred to follow-up slices

- **Retention CF.** A scheduled function that deletes `tool_invocations` older than 30 days. Plan: simple `pubsub.schedule('every 24 hours')` CF iterating the collection with `where('ts', '<', cutoff)`. Not implemented yet — defer until production traffic justifies the storage cost.
- **Operator dashboard UI.** `_app/admin/ai-tool-audit.html` — admin-gated page listing recent invocations with filters. Doc-only for now; landing once there's audit data to display.
- **Per-tool aggregation views.** "How many times has `search_knowledge_base` been called this week" — Firestore queries are the substrate; UI lands with the dashboard.

## What this slice does NOT do (deliberate)

- **No per-student rate limit on tool calls.** A misbehaving student could trigger many tool calls in a session; audit captures them but doesn't gate them. Per-conversation `max_tool_calls` (separate from per-turn `MAX_TOOL_ITERATIONS`) is a v0.6.0c follow-up if real abuse appears.
- **No PII redaction in result_summary.** RAG results may contain dispatch box descriptions that are operator-curated (no PII). Future tools (e.g., `get_student_progress`) may surface flag counts but no flag values. If sensitive fields ever land in tool results, audit truncation needs an allowlist of safe fields.
- **No audit for non-tool actions.** Chat turns without tool calls are NOT audited. The conversation_id field on the chat request gives operators a way to correlate audit entries with conversation continuity, but the chat itself isn't logged here.

## Deploy steps (operator)

1. Deploy the CF: `firebase deploy --only functions:hexAiToolCallback`
2. Deploy the Firestore rule: `firebase deploy --only firestore:rules`
3. Set the orchestrator env vars in the systemd drop-in:
   ```ini
   [Service]
   Environment="HEX_AI_AUDIT_URL=https://us-central1-hexworth-prime.cloudfunctions.net/hexAiToolCallback"
   # HEX_API_KEYS already set from v0.3.0
   Environment="HEX_AI_API_KEY=<same key as one entry in HEX_API_KEYS>"
   ```
4. Restart: `systemctl --user restart hex-orchestrator.service`
5. Verify: trigger a tool call (instructor `show_thinking=true` request), then query Firestore: `firebase firestore:get tool_invocations --limit=5`

## Related

- `_docs/architecture/hex-ai-tool-layer-v0.6.0c-design.md` — the v0.6.0c design proposal
- `_docs/architecture/hex-ai-tool-layer-v0.6.0a.md` — scaffolding
- `_docs/architecture/hex-ai-tool-layer-v0.6.0b.md` — first real tool
- `_docs/architecture/hex-ai-cf-bridge.md` — CF endpoints (this slice adds `hexAiToolCallback`)

---

*Last Updated: 2026-05-24 · v0.6.0c-3 — orchestrator side live, CF endpoint built awaiting deploy*
