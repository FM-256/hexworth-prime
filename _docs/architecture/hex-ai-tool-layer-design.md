# Hex AI — Tool Layer Design (v0.6.0 proposal)

> Status: **DESIGN PROPOSAL — not yet implemented**
> Authored 2026-05-23 for operator review
> Sibling to: `_docs/architecture/dr-hex-orchestrator.md`

## What this is

The Tool Layer is the v0.6.0 architectural slice that lets Dr. Hex *do things*, not just *answer things*. Up through v0.5.0, the orchestrator is read-only: it returns text, conditioned on persona + help-level + RAG context. v0.6.0 introduces a registry of tools the model can invoke during a conversation.

Tools turn the AI from a textbook into a teaching assistant who can look up the student's actual progress, peek at a lab artifact, or run a diagnostic check — without surrendering control of disclosure depth.

## What a "tool" is in this context

Three terms get conflated; this doc keeps them distinct:

| Term | Meaning here |
|---|---|
| **Tool** | A server-side function the orchestrator can call mid-conversation, with structured input/output. Examples: "look up student's last 5 flag attempts on this box", "fetch the lab's hint progression". |
| **LLM tool-calling** | The mechanism by which the model emits a structured call request. Ollama supports this via the `tools` parameter in `/api/chat`; the model returns `tool_calls` in the response, the orchestrator executes them, then re-prompts with the results. |
| **Operator tools** | The CLI utilities under `_tools/` (EduScan, sprint-master, etc.). Separate concern; not part of this layer. |

For the rest of this doc, "tool" means the first row.

## Why this needs operator buy-in BEFORE implementation

The tool layer changes the trust boundary:

- v0.5.0 orchestrator: read-only. Worst case of a prompt injection: the model says something it shouldn't.
- v0.6.0 orchestrator: tool-enabled. Worst case of a prompt injection: the model *does* something it shouldn't (e.g., reads another student's data, queries production Firestore with wide permissions).

Every tool added widens the attack surface. The design must answer **before** code lands:

1. Which tools are exposed?
2. Who decides which persona/help-level can call which tool?
3. How are tool inputs sanitized?
4. What happens if a tool fails?
5. How is tool usage audited?

## Proposed shape

### Tool registry

A central registry in `_tools/hexclass/orchestrator/tools/` — one file per tool category. Each tool:

```python
@register_tool(
    name="get_student_progress",
    description="Look up the student's progress on a specific mission/lab.",
    parameters_schema={
        "type": "object",
        "properties": {
            "mission_id": {"type": "string", "description": "The lab/box ID"},
        },
        "required": ["mission_id"],
    },
    returns_schema={
        "type": "object",
        "properties": {
            "flags_captured": {"type": "integer"},
            "flags_total": {"type": "integer"},
            "last_activity_iso": {"type": "string"},
            "failed_attempts": {"type": "integer"},
        },
    },
    exposure_rules={
        "min_help_level": 1,
        "allowed_personas": ["dr-hex", "shield", "code", "script", "matrix"],
        "denied_personas": ["dark-arts"],
        "instructor_only": False,
        "audit": True,
    },
)
async def get_student_progress(ctx, mission_id: str) -> dict:
    # ctx provides authenticated uid + role; never trust LLM-supplied uid
    ...
```

### Exposure rules

Tools are NOT all available to all personas. The rules are declarative on the tool itself:

| Field | Purpose |
|---|---|
| `min_help_level` | Below this level, the tool is invisible to the model (not in the `tools` list sent to ollama). |
| `allowed_personas` / `denied_personas` | Per-persona allowlist. Defaults to "all allowed". |
| `instructor_only` | If true, only role=instructor can trigger this tool. |
| `audit` | If true, every invocation is written to `tool_invocations` collection in Firestore for review. |

The orchestrator filters the `tools` list per-request based on the current persona + help-level + role, BEFORE sending to ollama. The model never sees a tool it isn't allowed to call.

### Tool execution flow

```
[user message] → orchestrator builds system prompt with allowed-tools list
                ↓
              ollama returns response with tool_calls: [...] (or text)
                ↓
              orchestrator validates each tool_call:
                - tool name is in allowed set for this persona/level?
                - parameters match schema?
                - ctx.uid + ctx.role satisfy tool's policy?
                ↓
              execute each tool (parallel where independent)
                ↓
              orchestrator re-prompts ollama with tool results
                ↓
              ollama returns final text response
                ↓
              orchestrator returns text + tool_calls_executed metadata
                to client (for transparency UI: "Dr. Hex looked up your progress")
```

### Audit trail

Every tool invocation writes to `tool_invocations` collection:

```js
{
    uid: "...",
    persona: "code",
    help_level: 2,
    tool_name: "get_student_progress",
    parameters: { mission_id: "lab-py-01" },
    result_summary: "5/8 flags captured",
    error: null,
    timestamp: <serverTimestamp>,
    conversation_id: "...",        // ties to v0.5.0b Redis thread
}
```

This is operator-visible AND student-visible (students should see what Dr. Hex looked up about them — transparency is the teaching value).

## Initial proposed tool catalog (for v0.6.0 ship)

Conservative set. Each is read-only; no mutation tools in the first cut.

| Tool | What it does | Risk class |
|---|---|---|
| `get_student_progress(mission_id)` | Flags captured / total + last activity timestamp | Low (already exposed via existing dashboard) |
| `list_house_missions(house)` | Names + difficulty of missions in a house | Very low (public catalog) |
| `get_lab_hint_progression(mission_id, current_step?)` | Returns the hint ladder for the lab (Levels 1-4 hints in order) | Medium (the AI could leak high-level hints if it ignores `help_level` ceiling) |
| `get_recent_chat_history(limit=5)` | Last N turns of THIS user's conversation (for context recall) | Low (user's own data) |
| `search_knowledge_base(query, k=3)` | RAG retrieval at higher k than the auto-RAG (currently k=3 hardcoded) | Low (same surface as auto-RAG) |
| `check_command_safety(command)` | Static check whether a shell command is destructive (rm -rf, dd, etc.) | Very low |

### NOT in the initial cut (deliberately deferred)

- Any tool that writes to Firestore (mark a flag captured, advance a stage, etc.) — too much blast radius.
- Tools that execute code (`run_python(snippet)`, etc.) — would need a sandboxed runtime.
- Tools that read OTHER students' data — instructor-only versions can come in v0.6.1.
- Network tools (curl, dns lookup) — would let the AI reach the public internet from a residential network, never.

## Risks + mitigations

| Risk | Mitigation |
|---|---|
| LLM hallucinates a tool name not in the allowed set | Orchestrator validates against the per-request allow-list; unknown tool → error message back to the model, no execution |
| LLM crafts parameters that bypass schema | jsonschema validation before execution; type-coercion only, no `eval`-like patterns |
| Prompt injection causes the model to call a tool with a wrong UID | Tools never accept UID as a parameter — `ctx.uid` is the only source. UID never reaches the LLM context. |
| Tool result leaks PII into the model context | Each tool defines a `redact_fields` list; redacted fields stripped before model sees the result. |
| Cost explosion via runaway tool calls | Per-conversation `max_tool_calls=5` cap; orchestrator refuses further calls and tells the model to wrap up. |
| Audit log fills up Firestore | Audit collection has TTL field (30 days); older docs auto-deleted by scheduled CF. |

## Help-level interaction

Tools respect the help-level ceiling in two ways:

1. **Visibility:** A tool with `min_help_level: 3` is not even visible to the model when the student is at Level 2.
2. **Result-shaping:** Tool results are filtered by help-level BEFORE re-prompting. Example: `get_lab_hint_progression` returns all 4 hint levels, but the orchestrator only injects hints up to `help_level + 1` into the prompt the model sees. Even if the model wanted to dump all hints, it doesn't have them in context.

This means a single tool can have safe-at-low-level behavior AND useful-at-high-level behavior, without separate tools per level.

## Open design questions (need operator input)

1. **Tool-call transparency UX.** When Dr. Hex calls `get_student_progress`, does the student see "Dr. Hex looked up your progress on lab-py-01" in the chat UI? Pro: transparency. Con: clutter. Recommend: a collapsible "Dr. Hex used these tools" footer per response.

2. **Instructor override of help-level for tool exposure.** Instructor role caps at Level 5. Should some tools be Level-5-only? Example: a hypothetical `view_class_progress_summary` that's only useful to an instructor anyway.

3. **Conversation continuity for tool context.** Tool results in turn N: should they persist into turn N+1's context (Redis-backed in v0.5.0b)? If yes, how long? If no, the student asks "how am I doing?" twice in a row and the model re-calls the tool — wasteful but safe.

4. **Per-house tool catalog vs global.** Should Dark Arts house have access to enumeration tools (`scan_open_ports`, etc.) that other houses don't? Or do we keep tools global and trust the persona system to gate disclosure?

5. **Tool versioning.** When a tool's parameters change, do we register `get_student_progress_v2` or migrate in place? Recommend: in-place with strict schema, backed by a `tools_changelog.md`.

## What's NOT in this design (deliberate)

- **Mutating tools** — write operations. Wait until at least v0.7.0 after read-only tools have a track record.
- **Cross-student tool calls** — instructor-only versions; defer until role-aware filtering is battle-tested.
- **Multi-model tool routing** — using a smaller model for tool execution decisions. Premature optimization.
- **LangChain / DSPy / etc.** — adding a framework dependency to gain features we can build with 200 lines of Python. Hexworth ethos rejects unnecessary frameworks.

## Implementation order (if approved)

| Phase | What |
|---|---|
| v0.6.0a | Tool registry scaffolding + `register_tool` decorator + filter-by-persona/level logic. ZERO actual tools yet. |
| v0.6.0b | First tool: `get_student_progress` (lowest risk, highest signal — proves the chain works). |
| v0.6.0c | Next two tools: `list_house_missions` + `search_knowledge_base`. |
| v0.6.0d | The hint-progression tool with help-level-result-filtering — the rule-validating shape. |
| v0.6.0e | Audit collection + Firestore TTL CF. |
| v0.6.0f | Tool-transparency UI in the chat widget. |

## Related

- `_docs/architecture/dr-hex-orchestrator.md` — what the tool layer plugs into
- `_docs/architecture/hex-ai-cf-bridge.md` — how the CF passes ctx.uid + ctx.role through
- `[[ai-entity-architecture]]` (memory) — the broader Hexworth AI vision; tool layer is a pillar

---

*Last Updated: 2026-05-23 · v0.6.0 design proposal — awaiting operator review*
