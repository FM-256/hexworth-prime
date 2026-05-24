# Hex AI Tool Layer — v0.6.0a Scaffolding

> Live as of 2026-05-23 · Source: `_tools/hexclass/orchestrator/tools/`
> Status: scaffolding only — NOT yet wired into `/chat`
> Companion to the v0.6.0 design proposal: `_docs/architecture/hex-ai-tool-layer-design.md`

## What this is

The skeleton of the tool layer. The registry exists, the exposure filter is wired, the dispatch validator runs, but **no student-facing tool ships yet.** The scaffolding ships independently so the architectural shape is established and tested before the first tool exposes student data.

15 tests cover the scaffolding. All pass.

## File layout

```
_tools/hexclass/orchestrator/tools/
    __init__.py        — public surface (register_tool, filter_tools_for_context, dispatch_tool_call)
    registry.py        — TOOL_REGISTRY + @register_tool decorator + ToolMetadata + ToolError
    exposure.py        — filter_tools_for_context() — the 4-gate visibility check
    dispatch.py        — dispatch_tool_call() — validate + execute path
    _meta.py           — the single instructor-only diagnostic tool (hex_ai_version)
tests/
    test_tools_registry.py — 15 tests
```

## Public API

```python
from tools import (
    TOOL_REGISTRY,             # the process-global dict
    register_tool,             # decorator
    filter_tools_for_context,  # per-request visibility filter
    dispatch_tool_call,        # validate + execute
    ToolMetadata,              # the dataclass
    ToolError,                 # raised by dispatch
)
```

## `@register_tool` decorator

Keyword-only by design — positional would be ambiguous given the parameter count.

```python
@register_tool(
    name="hex_ai_version",
    description="Return the orchestrator version. Instructor-only diagnostic.",
    parameters_schema={"type": "object", "properties": {}, "additionalProperties": False},
    returns_schema={"type": "object", "properties": {"version": {"type": "string"}}},
    exposure_rules={
        "min_help_level": 0,
        "instructor_only": True,
        "audit": False,
    },
)
def hex_ai_version(ctx: dict) -> dict:
    return {"version": "0.6.0a", "tool_count": len(TOOL_REGISTRY)}
```

### Registration-time guarantees

| Check | What happens on failure |
|---|---|
| Name already registered | `ValueError` at import — fail-loud, can't silently shadow another tool |
| `parameters_schema` is not a JSON Schema object | `ValueError` at import — can't ship a tool with a malformed contract |
| Default exposure rules | If `exposure_rules` is omitted, defaults to `min_help_level=99` (invisible) — fail-safe |

## The 4-gate exposure filter

`filter_tools_for_context(persona_slug, help_level, role)` returns the subset visible for THIS request. Any gate failing → invisible.

| Gate | Effect |
|---|---|
| `help_level < min_help_level` | Tool not shown |
| `instructor_only and role != "instructor"` | Tool not shown |
| `allowed_personas is not None AND persona not in allowed_personas` | Tool not shown |
| `persona in denied_personas` | Tool not shown |

### `allowed_personas` semantic (Nancy 2026-05-23)

The default is `[]` (empty allowlist = invisible to everyone), NOT `None`. This closes a footgun: an author who provides partial `exposure_rules` and forgets `allowed_personas` would otherwise inherit a permissive default and expose the tool to every persona. With the empty-list default, partial rules fail safe — invisible.

To make a tool persona-agnostic, the author must opt in explicitly: `"allowed_personas": None`. The `hex_ai_version` diagnostic tool does this because `instructor_only=True` is the actual gate; the `None` opt-in is the explicit "yes, I considered persona exposure and I want no allowlist constraint here."

Result is sorted alphabetically — stable across requests for prompt caching.

Output shape is exactly what ollama's `/api/chat` expects in the `tools` parameter:

```json
[
    {
        "type": "function",
        "function": {
            "name": "hex_ai_version",
            "description": "...",
            "parameters": { "type": "object", ... }
        }
    }
]
```

## Dispatch validation chain

`dispatch_tool_call(name, parameters, ctx)` runs six checks before invoking the handler:

| # | Check | Failure code |
|---|---|---|
| 1 | Tool exists in registry | `unknown_tool` |
| 2 | Visible to this persona/level/role (re-check) | `exposure_violation` |
| 3 | `parameters` is a dict | `schema_type` |
| 4 | All required keys present | `schema_required` |
| 5 | No extra keys when `additionalProperties: false` | `schema_additional` |
| 6 | Each named property's type matches schema | `schema_type` |

Then the handler executes. Async handlers are awaited; sync handlers run in `asyncio.to_thread`. Any handler exception → `handler_crash`.

Returns:
- `{"ok": True, "result": <handler return value>}` on success
- `{"ok": False, "error": <message>, "code": <classifier>}` on any failure

## Identity flow (load-bearing)

The model NEVER provides uid, role, persona_slug, or help_level via tool_call parameters. Handlers receive `ctx` as the first positional argument:

```python
def get_student_progress(ctx: dict, mission_id: str) -> dict:
    uid = ctx["uid"]              # from server-side auth, not the LLM
    role = ctx["role"]
    # ...
```

This closes the "model crafts parameters that bypass identity" attack surface. The handler can trust `ctx`; everything else from the model is suspect input.

## What's NOT in v0.6.0a (deliberate)

- **Wiring into `/chat`** — `main.py` doesn't import `tools` yet. Wiring happens in v0.6.0b.
- **Real student-facing tools** — `_meta.py` ships one instructor-only tool to prove the chain. Real tools land in v0.6.0b+.
- **Full JSON Schema validation** — no `jsonschema` dependency. Structural checks only (required keys, additionalProperties, basic type). Enough to catch obvious model misbehavior; not enough to validate `oneOf`/`pattern`/`enum`. Lands with v0.6.0b's first real tool. **Note (Nancy 2026-05-23):** the v0.6.0 design doc §"Risks + mitigations" promised "jsonschema validation before execution" — this slice deliberately ships less. The full validator drops in v0.6.0b alongside the first real student-data tool, where the stricter validation actually matters.
- **`returns_schema` field** — removed from `ToolMetadata` per Nancy review. The field was stored but never consulted; presence implied enforcement that didn't exist. Re-adding in v0.6.0d alongside actual handler-output validation.
- **Audit trail** — `tool_invocations` Firestore writes are planned for v0.6.0e.
- **`max_tool_calls` per conversation** — lands in v0.6.0b when there's a real call path.
- **Result-shaping per help-level** — the `get_lab_hint_progression` tool (v0.6.0d) will introduce this pattern.
- **Parallel tool dispatch** — current `dispatch_tool_call` handles one call. The design doc mentions "execute each tool (parallel where independent)" — that orchestration lands in v0.6.0b's `/chat` wiring, not in the scaffolding.

## Test set (17/17 passing)

| Group | Tests |
|---|---|
| Registry shape | registered-on-import, duplicate-name rejection, non-object-schema rejection |
| Exposure filter | instructor_only blocks/allows correctly, min_help_level boundary, denied_personas, allowed_personas allowlist, **partial-rules-fail-safe**, **explicit-None-opts-in** |
| Dispatch | unknown_tool, exposure_violation, success, additionalProperties rejection, handler_crash |
| Ollama format | shape verification, deterministic ordering |

The two bolded tests landed after Nancy's [PAUSE] review surfaced the `allowed_personas` default footgun. They verify: (a) partial `exposure_rules` (missing `allowed_personas`) makes the tool invisible to every persona, (b) explicit `allowed_personas=None` opts in to the all-personas shape.

Ad-hoc test tools use UUID-suffixed names (`_test_<stem>_<8hex>`) so a test crash mid-flow can't pollute `TOOL_REGISTRY` for the next run.

Run on hexclass:

```bash
ssh hexclass 'cd /opt/hexclass/orchestrator && .venv/bin/python tests/test_tools_registry.py'
```

## Operator checklist before v0.6.0b ships

Per the design doc, the next slice (v0.6.0b) introduces the first real tool: `get_student_progress(mission_id)`. Before that lands, operator decisions needed on:

1. **Tool-call transparency UX.** When Dr. Hex calls a tool, does the student see "Dr. Hex looked up X" in the chat? (Design recommends a collapsible footer; not yet implemented.)
2. **`max_tool_calls` per conversation.** Recommended default: 5. Operator confirm.
3. **Audit retention window.** Firestore TTL on `tool_invocations` — recommended 30 days. Operator confirm.

## Related

- `_docs/architecture/hex-ai-tool-layer-design.md` — full v0.6.0 design proposal (status: published, operator-approved by user "keep going" 2026-05-23)
- `_docs/architecture/dr-hex-orchestrator.md` — orchestrator the tools plug into
- Commit landing v0.6.0a: this commit cluster

---

*Last Updated: 2026-05-23 · v0.6.0a scaffolding — 17/17 tests · Nancy [PAUSE] review applied*
