# Hex AI — `get_student_progress` (v0.6.0c-2)

> Built 2026-05-24 · Live on hexclass as v0.6.4 (DORMANT — CF endpoint not deployed)
> Closes: v0.6.0c-2 design slice
> Implements: Path B from `hex-ai-tool-layer-v0.6.0c-design.md` (CF callback, not orchestrator-side Admin SDK)

## What this is

The first Firestore-backed tool. Dr. Hex can ask "how is this student doing on this mission?" and receive concrete numbers — flags captured, flags total, last attempt timestamp, failed attempts in the last 30 minutes — to ground its hints in real progress instead of generic encouragement.

The tool is **dormant** until the operator deploys the new CF endpoint. With env vars unset, the handler returns `{available: false, reason: "..."}` which the model can apologize for; chat continues normally.

## Why Path B (CF callback) and not Path A (orchestrator firebase-admin)

Decision recorded in `hex-ai-tool-layer-v0.6.0c-design.md`:

- **Path A** = install `firebase-admin` + service-account JSON on hexclass. Introduces a new dependency surface + a new credential to manage.
- **Path B** = orchestrator posts to a new CF endpoint via shared `X-API-Key`. CF runs the Admin SDK query as it already does for `validateFlag`, `recordProgress`, etc. Single Firestore-access codebase.

Path B picked because:
1. Centralizes Firestore access in `functions/` (one auth model, one rules set, one place to debug).
2. No service-account JSON on hexclass.
3. Reuses the X-API-Key the orchestrator already has for the chat path.
4. Latency cost (~50–100ms per tool call) is small relative to overall chat latency (3–25s).

## Architecture

```
[student] → /chat → orchestrator
                      ↓
                   dispatch_tool_call("get_student_progress", {mission_id}, ctx)
                      ↓
                   tools/_progress.py handler
                      ↓ (httpx POST + X-API-Key)
                   HEX_AI_TOOL_DISPATCH_URL (Cloud Function)
                      ↓
                   hexAiToolDispatch:
                      - validate X-API-Key (timingSafeEqual)
                      - lookup handler by tool name
                      - run Firestore queries:
                          users/{uid}/flag_attempts (last 30 min, mission_id match)
                          users/{uid}/flag_captures (all, mission_id match)
                          flag_registry/{mission_id} (for total count)
                      ↓
                   returns { ok: true, result: { flags_captured, flags_total,
                                                  failed_attempts_recent,
                                                  last_attempt_iso, mission_id } }
                      ↓
                   tool result back to orchestrator
                      ↓
                   tool result in ollama re-prompt
                      ↓
                   final answer with progress-grounded hint
```

## Exposure rules

```python
exposure_rules={
    "min_help_level": 1,                # Level 1+ (Conceptual upward)
    "allowed_personas": [
        "dr-hex",      # default
        "shield",      # blue-team — progress-aware hints fit
        "code",        # software house — fit
        "script",      # scripting/automation — fit
        "matrix",      # deep Linux — fit
    ],
    "denied_personas": ["dark-arts"],   # offensive house teaches differently
    "instructor_only": False,
    "audit": True,
}
```

Houses excluded by omission (`forge`, `web`, `eye`, `divergent`) — those `allowed_personas` would need explicit addition before they see the tool. This is the Nancy-2026-05-23 fail-safe default in action: opting in to personas is explicit, never inferred.

## Tool result shape

```json
{
    "mission_id": "nt1",
    "flags_captured": 3,
    "flags_total": 5,                    // null if mission_id not in flag_registry
    "failed_attempts_recent": 2,         // distinct flag IDs attempted but not captured in last 30 min
    "last_attempt_iso": "2026-05-24T02:42:11Z"
}
```

`failed_attempts_recent` counts DISTINCT failed flag IDs in the last 30 minutes, not raw attempt count — five typos on the same flag count as one stuck objective, not five failures. Matches the `deriveFailedAttempts` heuristic in v0.4.0 of the CF chat bridge.

## Privacy + identity

The CF dispatch handler reads `uid` from `ctx.uid` (orchestrator-supplied). Trust chain:

1. Browser holds Firebase ID token → `hexAiChat` callable validates it → `request.auth.uid` derived.
2. CF chat bridge passes `user_uid: request.auth.uid` in the orchestrator's request body.
3. Orchestrator builds `tool_ctx = {uid: req.user_uid, ...}` from that.
4. Tool handler receives `ctx`, passes `ctx` to the CF dispatch endpoint.
5. CF dispatch validates X-API-Key (proves orchestrator is the caller), trusts `ctx.uid` (because the orchestrator authenticated it).
6. Firestore query filtered by `users/{ctx.uid}/...`.

No raw flag values surface — only counts and timestamps. The model sees enough to say "you've got 3 of 5; what's stopping you on the others?" without leaking the answer.

## What the model sees in its context

When the tool returns the result, the orchestrator appends a `role=tool` message:

```json
{"role": "tool", "content": "{\"mission_id\":\"nt1\",\"flags_captured\":3,\"flags_total\":5,\"failed_attempts_recent\":2,\"last_attempt_iso\":\"...\"}"}
```

The model re-prompts with this in context. Its final answer is shaped by the persona/help-level — at Level 1 it might say "you're partway through; what's your current theory?"; at Level 3 it might point at which flag category is unsolved.

## DORMANT — what's missing for activation

Two env vars on the orchestrator side:

```bash
HEX_AI_TOOL_DISPATCH_URL=https://us-central1-hexworth-prime.cloudfunctions.net/hexAiToolDispatch
HEX_AI_API_KEY=<same value as one entry in HEX_API_KEYS>
```

When either is empty, `_is_enabled()` returns False and the handler returns `{available: false}` — the chat path works, the tool is just informational about its own dormancy.

Activation:

1. Deploy `hexAiToolDispatch` CF: `firebase deploy --only functions:hexAiToolDispatch`
2. Set the two env vars in the systemd drop-in: `~/.config/systemd/user/hex-orchestrator.service.d/auth.conf`
3. Restart: `systemctl --user restart hex-orchestrator.service`
4. Verify: `curl -s http://127.0.0.1:8000/health` and trigger a chat with mission_id set — instructor `show_thinking=true` should show the tool in `tools_visible` AND `tool_invocations` if the model uses it.

## Failure modes

| Failure | Behavior |
|---|---|
| `HEX_AI_TOOL_DISPATCH_URL` empty | Tool registered but returns `{available: false, reason: "not configured"}` — model sees concrete error message |
| CF unreachable | httpx timeout → `{available: false, reason: "CF unreachable: ..."}` |
| CF returns 401 (X-API-Key mismatch) | Result includes `error_code: "auth"` — operator should rotate keys |
| CF returns 404 (unknown tool name) | Result includes `error_code: "unknown_tool"` — should never happen unless dispatch list and tool registry drift |
| Firestore query fails | CF returns 500 + `handler_crash`; orchestrator surfaces to model |
| mission_id not in flag_registry | `flags_total: null` (other fields still populated) — model can say "I don't see that mission in our catalog" |

The chat path never breaks; the tool just reports its own brokenness in-band.

## Why DORMANT-by-default is the right shape

The orchestrator is LIVE on hexclass. If the tool registered as fully active before the CF endpoint existed, every call would either crash or return errors — which the test set would catch as regressions, but worse, a misconfigured deploy could leak errors into student chats.

The dormancy pattern: tool registers (so exposure filter math is consistent), handler returns a soft "not available" result (so model sees a clear message), `audit=True` still works (audit module's own enable gate handles the absent URL).

Two env vars flip everything on at once. No code change needed for activation.

## What this slice does NOT do (deliberate)

- **No new orchestrator dependencies.** Reuses `httpx` (already a dep for ollama calls).
- **No service-account JSON on hexclass.** Path A was rejected explicitly.
- **No mutating tools.** This is read-only. Mutating tools (write to Firestore) deferred until read-only has a track record per the v0.6.0 design.
- **No cross-student lookups.** The CF dispatch reads `ctx.uid` from the orchestrator's tool_ctx. An instructor cannot use this tool to look up another student. Instructor-cross-student tools land later as `instructor_only=True` siblings.
- **No raw flag values in the result.** Counts and timestamps only.
- **No retention sweep on the audit log.** Same as v0.6.0c-3 — deferred to a follow-up scheduled CF.

## Test status

- Tool registry tests pass (the new tool registers cleanly, exposure filter math is unchanged)
- Tool integration tests still pass — the test corpus doesn't trigger get_student_progress (no mission_id with real progress data), so the dormancy path is exercised by absence
- An end-to-end test of get_student_progress requires the CF deployed + real Firestore data — that's part of the operator's first session after deploy gate opens

## Operator activation checklist (when ready)

1. Deploy: `firebase deploy --only functions:hexAiToolDispatch`
2. Verify URL: `firebase functions:list` should show `hexAiToolDispatch` in us-central1
3. Set orchestrator env vars in systemd drop-in:
   ```ini
   [Service]
   Environment="HEX_AI_TOOL_DISPATCH_URL=https://us-central1-hexworth-prime.cloudfunctions.net/hexAiToolDispatch"
   Environment="HEX_AI_API_KEY=<key>"
   ```
4. `systemctl --user daemon-reload && systemctl --user restart hex-orchestrator.service`
5. Manual test:
   - Browser → `/admin/ai-chat-test.html` with `mission_id` filled
   - Ask: "Use get_student_progress and tell me how I'm doing on this mission."
   - Expect: model calls the tool, response includes progress numbers

## Related

- `_docs/architecture/hex-ai-tool-layer-v0.6.0c-design.md` — design proposal (Path A vs B decision)
- `_docs/architecture/hex-ai-tool-layer-v0.6.0b.md` — first tool (search_knowledge_base)
- `_docs/architecture/hex-ai-tool-audit-v0.6.0c-3.md` — audit log (used by this tool's invocations)
- `_docs/architecture/dr-hex-orchestrator.md` — orchestrator architecture

---

*Last Updated: 2026-05-24 · v0.6.0c-2 — built, DORMANT until CF deploy*
