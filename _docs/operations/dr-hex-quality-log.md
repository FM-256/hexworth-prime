# Dr. Hex Response-Quality Observation Log

> System for operators to flag and dedup AI response-quality issues caught
> while running Dr. Hex in production. **Distinct from code/chain bugs**
> (which live in Sprint Master) and **validator findings** (Nexus triage).

## What goes here

Anything the model said or did *that wasn't a code failure* but still
warrants a fix or a content/RAG/exposure-rule change. The chain returned
HTTP 200 and the model produced output — the output just wasn't right.

If a question would be answered "fix this in the orchestrator", "ingest
this missing chunk into pgvector", "tighten this persona prompt", or
"this exposure rule is too loose/strict" — log it here.

If the answer is "the CF crashed" / "the tunnel was down" / "the index
was missing" — that's a code bug, not a quality observation.

## Taxonomy (9 codes)

| Code | Triggers when... | Severity profile |
|---|---|---|
| `drhex-q-rag-relevance` | Retrieved chunks matched on keywords, not intent. Answer is plausible but off-topic. | P2-P3 |
| `drhex-q-rag-coverage` | Operator-canonical answer exists, but no chunk in pgvector covers it. Model fabricates or punts. | P2 |
| `drhex-q-help-ceiling` | **Disclosure ceiling violated upward** — model leaked an answer at a help level that shouldn't have it. (E.g., gave a flag at L1, gave full walkthrough at L3.) | **P0-P1 — security** |
| `drhex-q-help-floor` | **Disclosure ceiling too restrictive** — model gave so little that the student couldn't proceed. UX issue, not security. | P2-P3 |
| `drhex-q-persona-drift` | Voice/tone broke the persona contract (Patient Pat answered like a textbook, Calculus Cat dropped slang). | P3 |
| `drhex-q-hallucination` | Invented facts not in retrieved context, tool result, or system prompt. | P1-P2 |
| `drhex-q-leak` | Exposed an internal detail that's **real** — internal URLs, IDs, prompts, console links. (Distinct from hallucination: leak = real-but-shouldn't-show, hallucination = fabricated.) | P1 |
| `drhex-q-tool` | Wrong tool called, missed a tool that would've helped, or passed bad parameters. | P2 |
| `drhex-q-policy` | Tool call was correctly formed but **exposure rule rejected it incorrectly** — over-restricted (rule too tight) or under-restricted (rule too loose). | P1 (loose) / P3 (tight) |

### Tie-break rules

- **`leak` vs `hallucination`** — if the content was **fabricated**, tag `hallucination`. If the content was **real but exposed inappropriately**, tag `leak`. Primary cause wins.
- **`help-ceiling` vs `help-floor`** — separate codes, not a continuum. Security violation (ceiling) is **not** the same incident as UX shortfall (floor). They route differently.
- **`tool` vs `policy`** — if the model never tried the tool: `drhex-q-tool` (missed tool). If the model tried but the exposure filter blocked it: `drhex-q-policy`.

## Dedup key

`(category, first_60_chars_of_student_query)`. Two observations sharing
this key are the same incident. Before logging, query the collection:

```bash
node _tools/dr-hex/flag-quality.js --check <category> "<student-query-first-60-chars>"
```

If a match exists, add a `repeat: true` row pointing at the original
`originalObservationId` instead of opening a duplicate.

## Storage

Firestore collection: `dr_hex_quality_observations`

Schema:

| Field | Type | Notes |
|---|---|---|
| `category` | string | One of the 9 codes above |
| `observation` | string | One-line description of the problem |
| `studentQueryFirst60` | string | First 60 chars of the student's question (dedup key) |
| `modelResponseFirst200` | string | First 200 chars of model's response, for diff/grep |
| `conversationId` | string\|null | Links to orchestrator's Redis-backed conversation thread |
| `toolInvocationDocIds` | string[] | Doc IDs from `tool_invocations` collection for this turn |
| `persona` | string\|null | Persona slug active at the time |
| `helpLevel` | number\|null | Help level active at the time |
| `status` | string | `open` \| `triaged` \| `fixing` \| `fixed` \| `wontfix` \| `duplicate` |
| `priority` | string\|null | `P0` ... `P3` |
| `flaggedBy` | string | UID of operator who flagged |
| `flaggedAt` | timestamp | Server timestamp |
| `notes` | string\|null | Free-form |
| `originalObservationId` | string\|null | If `status: duplicate`, points at the original |
| `fixCommit` | string\|null | When fixed, set to the commit hash that addressed it |
| `statusChangedBy` | string\|null | UID of last operator to change `status`. Required by rules on any update that mutates `status`. |
| `statusChangedAt` | timestamp\|null | When `status` was last changed. Required by rules on any update that mutates `status`. |

Security: admin-only read/write per `firestore.rules`. No delete (append-only —
fix the issue, don't erase the record). The CLI helper uses Admin SDK
which bypasses rules; client writes (dashboard, flag button) hit the rules.

**Audit trail enforcement (Nancy 2026-05-24):** any update that changes
`status` must also write `statusChangedBy == auth.uid` and a
`statusChangedAt` timestamp. The rule blocks status changes that omit
these fields. Updates that don't touch `status` (e.g., notes edit) are
unaffected.

**Re-open path:** to undo a misclick on `wontfix` or `duplicate`, change
`status` back to `open` — this triggers the audit-field requirement, so
the unintended close is preserved in the change history rather than
silently erased.

## Intake recipe (v1 — CLI)

While we're a single-operator system, log via:

```bash
node _tools/dr-hex/flag-quality.js \
    --category drhex-q-rag-relevance \
    --query "what is the very first course I should explore in hexworth?" \
    --response "It seems you're looking for a starting point within Hexworth..." \
    --notes "RAG retrieved tactical labs (Intermittent Connectivity, Supply Chain Alert) instead of onboarding content. No chunk covers 'where does a new student start?'"
```

Flag fields:
- `--category` (required) — one of the 9 codes
- `--query` (required) — the student's question
- `--response` (required) — what the model returned
- `--persona`, `--help-level`, `--conversation-id`, `--mission-id`, `--tool-doc-ids` (optional context)
- `--priority` (optional — `P0`–`P3`)
- `--notes` (optional free-form)
- `--check` mode — runs the dedup query and prints existing matches without writing

## Intake recipe (v2 — deferred)

When EITHER log entries > 20 OR a second operator joins:

1. Add a **"Flag this response"** button to `_app/admin/ai-chat-test.html`
2. Modal: category dropdown + 1-line note
3. Pre-fills `studentQueryFirst60`, `modelResponseFirst200`, `conversationId`, `persona`, `helpLevel`, `toolInvocationDocIds` from page state
4. Writes via Firebase JS SDK directly (security rule already permits admin writes)

No data migration — same collection, same schema.

## Where to triage / batch-fix

| Category | Owner | Fix mechanism |
|---|---|---|
| `drhex-q-rag-*` | RAG corpus owner | Add missing chunks; re-tune retrieval threshold |
| `drhex-q-help-ceiling` | Persona system owner | **Drop everything** — security. Tighten persona prompt + add adversarial test |
| `drhex-q-help-floor` | Persona system owner | Loosen disclosure rule or add tool to compensate |
| `drhex-q-persona-drift` | Persona system owner | Tighten persona prompt; add few-shot examples |
| `drhex-q-hallucination` | Model/prompt owner | Tighten "do not invent" instructions; lower temperature |
| `drhex-q-leak` | Tool error handler | Wrap tool errors, sanitize before model sees them |
| `drhex-q-tool` | Tool exposure_rules / system prompt | Adjust min_help_level, persona allowlist, or tool description |
| `drhex-q-policy` | exposure_rules in tool registry | Re-tune the exposure_rules in `_tools/hexclass/orchestrator/tools/*.py` |

## Related

- `_docs/architecture/dr-hex-orchestrator.md` — the system being observed
- `_docs/architecture/hex-ai-tool-layer-v0.6.0a.md` — exposure rules + tool registry (target of `drhex-q-policy`)
- `tool_invocations` Firestore collection — chain-level audit log (orchestrator → tool result)

---

*v1 — 2026-05-24. CLI intake. Test-page flag button deferred.*
