# Dr. Hex AI — Operating Manual & Governance

> Canonical rules for working with the Dr. Hex AI element of Hexworth Prime.
> This document supersedes scattered notes in CLAUDE.md, memory entries,
> and ad-hoc operations notes for AI-specific changes. If a rule here
> conflicts with anything else in the repo, this document wins for
> AI-element changes.
>
> Last updated: 2026-05-25

## 0. Scope and authority

**Scope:** Every change touching:
- The orchestrator (`_tools/hexclass/orchestrator/`)
- AI-related Cloud Functions (`hexAiChat`, `hexAiChatStream`, `hexAiHealth`, `hexAiToolDispatch`, `hexAiToolCallback`, `hexAiSecurityEvent`)
- The RAG corpus (`hexworth_docs` Firestore... wait, pgvector)
- The CONSTITUTION text in `main.py`
- Tool registry (`tools/__init__.py` and `tools/_*.py`)
- AI defense layers (filters, rate limits, lockouts, etc.)

**Authority:** Operator decides. This doc captures the decisions so they
don't have to be re-litigated each time. Operator can override any rule
here with an explicit "doing X anyway because Y" — but the override goes
into the audit trail.

**Doc change procedure:** any modification to this doc is itself a change
that gets committed with rationale. The first commit is what we're calling
v1.0 of the governance.

---

## 1. Change-management rules

The orchestrator's behavior is load-bearing. Rules below define what each
class of change requires.

### 1.1 Modifying the CONSTITUTION

The CONSTITUTION text in `main.py:181` is the model's behavioral anchor.

**Required before change:**
- Nancy review on the proposed text + the threat it closes
- Adversarial probe suite re-run AFTER change with full review-file skim
- New `drhex-q-help-ceiling` test case in the corpus covering the threat,
  if applicable
- Commit message explicitly documents what threat the change closes

**Forbidden:**
- Removing or weakening an existing rule without a documented operator
  decision in the commit message
- "Tightening" the constitution beyond what the test suite covers without
  adding tests first

### 1.2 Adding a new tool

**Required:**
- New module under `tools/_<name>.py` matching the `_progress.py` /
  `_prereq.py` pattern
- `@register_tool` decoration with explicit `exposure_rules` (NOT defaults)
- Tests in `tests/test_tools_registry.py` covering:
  - registered-on-import
  - persona allowlist boundary
  - help-level boundary
  - schema rejection (additionalProperties, missing required)
- Nancy review on the design + tool surface BEFORE coding
- If the tool needs Firestore: CF handler in `functions/hex-ai-bridge.js`
  `TOOL_DISPATCH_HANDLERS` + tests for that path

**Forbidden:**
- Adding a tool with `exposure_rules` defaults (every new tool must
  explicitly set `min_help_level`, `allowed_personas`, `audit`)
- Tools that take a UID parameter from the LLM (always use `ctx.uid`)
- Tools that return flag values in any branch

### 1.3 Adding a honeypot

Honeypots are tripwires for tool-call injection. New ones are cheap to add.

**Required:**
- Same `@register_tool` pattern with `exposure_rules.honeypot=True` and
  `min_help_level=99`
- Name should be one a determined attacker would *guess* (e.g.,
  `get_admin_token`, `list_all_students`, `disable_help_level`)

**Forbidden:**
- Honeypots whose names overlap with real tools (causes operator confusion)

### 1.4 Modifying `exposure_rules` on an existing tool

**Required:**
- Commit message documents the threat / capability the change addresses
- If the change LOOSENS (e.g., lower `min_help_level`, broader
  `allowed_personas`): Nancy review on the threat surface
- If the change TIGHTENS: no Nancy needed; commit and ship

### 1.5 Modifying filter regexes (encoding-bypass, jailbreak, etc.)

The filter regexes in `tools/request_filter.py` balance false-positive vs
false-negative.

**Required:**
- Update `tests/test_request_filter.py` with new positive/negative cases
  covering the change
- Run the full request_filter test
- Run the full adversarial suite to catch downstream impact
- For LOOSENING (allowing more through): explicit "what attack still
  blocks this" comment in the regex docstring

### 1.6 Adding new RAG content

See §3 (Content rules) for what can be ingested.

**Required:**
- Use the namespaced title prefix pattern (`KBA:`, `Onboarding:`,
  `Dispatch box`, etc.) so removal is trivial
- New ingest script in `_tools/hexclass/orchestrator/seed_*.py` matching
  existing pattern
- Dry-run output review before live ingest
- Post-ingest verification: original regression query (the
  drhex-q-rag-relevance baseline) still surfaces correct top-1 chunk
- DELETE-by-prefix path documented in script header

**Forbidden:**
- Ingesting content that contains flag values (verify via grep before
  ingest)
- Ingesting student-submitted content into a shared RAG corpus
  (student data poisoning surface)

### 1.7 Modifying rate-limit / lockout / behavioral thresholds

The defaults are documented in `tools/rate_limit.py`. Each threshold
is tuned against real adversarial-suite + load-test data.

**Required:**
- Commit message includes the data justifying the new value (e.g.,
  "increased to 100/hr because suite shows max-legitimate-load at 67/hr")
- For LOOSENING (higher cap, lower threshold): Nancy review
- For TIGHTENING (lower cap, higher threshold): no Nancy, just commit

### 1.8 Modifying the help-level ladder

The help-level definitions in `help_levels.py` are the platform's
pedagogical contract.

**Required:**
- This is the highest-stakes change category — requires:
  - Nancy review
  - Karl review if the help-level descriptions reference any external
    pedagogical framework
  - Documentation update in `_docs/architecture/dr-hex-orchestrator.md`
  - Probe-suite test case covering the new help-level behavior

---

## 2. Operational rules

### 2.1 Deploy procedures

| Component | Deploy command | Gates |
|---|---|---|
| Orchestrator Python | `scp main.py + restart hex-orchestrator.service` | branch=master, smoke test before restart, log tail post-restart |
| Cloud Functions (hexAi*) | `_tools/eduscan/smoke/deploy.sh --only functions:hexAi<name>` | branch=master, explicit operator authorization |
| Firestore rules + indexes | `_tools/eduscan/smoke/deploy.sh --only firestore:rules,firestore:indexes` | branch=master |
| Hosting (admin pages) | `./deploy.sh` | full smoke + post-verify |

**Forbidden:**
- Bare `firebase deploy --only functions:hexAi*` (skips smoke gate)
- Restarting orchestrator without first SCPing the file (mid-flight reload
  picks up partial state)
- Deploying to production from any branch other than master

### 2.2 Restart protocol

The orchestrator restart drops in-flight chat requests. Restart only when:
- Code change requires it (Python module reload)
- Env var change in systemd drop-in requires it
- Recovery from a hung state (last resort — investigate first)

Restart command: `ssh hexclass-via-bc1 'systemctl --user restart hex-orchestrator.service'`

Post-restart: tail `journalctl --user -u hex-orchestrator.service` for 5 lines.
Expect to see "HEX_API_KEYS loaded" + "Application startup complete" +
"Uvicorn running".

### 2.3 Kill switch

To disable Dr. Hex platform-wide without taking down the orchestrator:
```bash
# Empty the HEX_API_KEYS env var on hexclass — orchestrator stays up
# but rejects every authenticated /chat call with 401.
ssh hexclass 'sed -i "s/HEX_API_KEYS=.*/HEX_API_KEYS=disabled/" \
    ~/.config/systemd/user/hex-orchestrator.service.d/auth.conf && \
    systemctl --user daemon-reload && \
    systemctl --user restart hex-orchestrator.service'
```

Client-side users see "Can't reach Dr. Hex right now" — the same UX as
when the chain is broken. They don't see "the AI is disabled". This is
intentional — it gives the operator time to investigate without surfacing
a security or quality issue to students.

To restore: put the real key value back, daemon-reload, restart.

### 2.4 Rollback protocol

If a deploy breaks behavior:
1. Determine the last-known-good commit hash
2. Git checkout that commit (do NOT reset/force-push)
3. Re-run the deploy command for the affected component
4. Open a quality observation describing what broke

For orchestrator code: SCP the file at the rollback commit, restart.
For CFs: `firebase deploy --only functions:hexAi<name>` from the rollback
commit (or use Firebase Console UI to roll back the specific function).

### 2.5 Single-operator model

Today there is one operator. Until a second joins:
- All authority above flows to the single operator
- The audit trail (`dr_hex_security_events`, `tool_invocations`, git
  history) is the second-pair-of-eyes — operator reads it weekly

---

## 3. Content rules (RAG corpus)

### 3.1 What CAN be ingested

- Confluence KBA pages (already done — 4,318 chunks)
- Onboarding content (already done — 12 chunks)
- Dispatch box metadata (already done — 95 chunks)
- House landing-page content
- Lab descriptions (NOT solutions, NOT flag values)
- Curriculum sequence documentation
- Architecture / operational documentation that students might ask about

### 3.2 What MUST NOT be ingested

- **Flag values** (in any form — braced, bare, escaped, encoded)
- **Lab solutions / walkthroughs** for active labs (deferred labs are case-by-case)
- **Student-submitted content** (poisoning surface)
- **Operator notes / observations** containing flag patterns
- **API keys / credentials / internal IDs**

### 3.3 Pre-ingest verification

Before any `seed_*.py` live run:
```bash
# Verify zero flag patterns in content to be ingested
grep -rE "FLAG\{[A-Za-z0-9_\-]{4,}\}" <source-dir> || echo "OK"
# If any matches found, halt and triage
```

### 3.4 Re-seed cadence

- Confluence KBA: re-run after every major KBA-content commit
- Onboarding: re-run after any change to the Sorting Hat / house intro pages
- Dispatch boxes: re-run after any change to `boxes.json`

### 3.5 Ownership

The pgvector `hexworth_docs` table is owned by the orchestrator's
hexclass database role. Only the operator (with hexclass SSH + DB
password) can modify. No CF, no admin API endpoint, no client write
path exists.

---

## 4. Access rules (data privacy)

### 4.1 Reading `tool_invocations`

- Student: their own records only (security rule enforces `uid == request.auth.uid`)
- Instructor / operator: all records (security rule via `isAdmin()`)

### 4.2 Reading `dr_hex_security_events`

- Admin only. No student access ever — these records contain the
  attack-shape evidence.

### 4.3 Reading `dr_hex_quality_observations`

- Admin only.

### 4.4 Identifier hashing

All filter-hit / security-event records hash the following before
storage:
- `uid` → `uid_hash` (sha256[:16])
- `message` content → `msg_hash` (sha256[:32])
- `conversation_id` → `conversation_id_hash` (sha256[:16])

Plaintext student input NEVER reaches Firestore audit collections.

### 4.5 Retention

- `tool_invocations`: indefinite (operator decision when collection
  exceeds 100k rows)
- `dr_hex_security_events`: indefinite for now; review at 6 months
- `dr_hex_quality_observations`: indefinite (operator workflow)
- Conversation memory: 30-min TTL (Redis)
- Adversarial review files: `/tmp/` only, lost on hexclass restart

---

## 5. Acceptable-use rules

### 5.1 Student rules (to be surfaced in onboarding text)

When you use Dr. Hex:
- Your messages, responses, and tool calls are logged
- The logs are reviewed by your instructor and platform operators
- Attempting to "jailbreak" / extract flags / bypass help-levels:
  - Will be detected
  - Will trigger a cooldown (lockout, conversation lock)
  - Repeated attempts impact your account's behavioral score
- Dr. Hex is a tutor, not an answer-key. Its purpose is to guide
  your thinking, not replace it
- Dr. Hex's responses are AI-generated and may be wrong. Verify
  before relying on them.

### 5.2 Instructor rules

- Instructor mode (role=instructor in auth) raises help-level cap
  from 4 to 5 (full disclosure)
- Output flag scrub is bypassed at help_level=5 — instructors can
  see what the model would have generated
- Every instructor-mode session is logged with `role: instructor`
  in `tool_invocations`
- Instructors do NOT share their accounts with students

### 5.3 Operator rules

- Operator can read all logs, modify any configuration
- Operator commits to the audit trail (git + security_events)
- Operator never bypasses defense layers to "test" — use the
  adversarial suite instead

---

## 6. Capacity rules

### 6.1 Current capacity

**1-2 concurrent students.** Tested 2026-05-25. Beyond 2 → 60s
ollama timeouts. Below 2 → adequate p95 (~50s).

### 6.2 Behavior when exceeded

Today: the 3rd concurrent student gets `502 ollama upstream timed out`
after 60s. The Cloud Function bridge returns `unavailable` to the
client. The browser displays "Can't reach Dr. Hex right now."

This is structurally the same UX as a full outage. Acceptable for
v1.0 closed alpha; not acceptable for class-scale use.

### 6.3 Mitigations (in priority order)

1. Smaller / faster model variant for low-help-level responses
   (Help Level 0–2 doesn't need a 7B-param model)
2. Request queueing with student-visible wait position
3. Multi-instance ollama (additional GPU)
4. Async chat (submit, get notification when ready)

### 6.4 Operator action on capacity exceed

If repeated 502s are observed in `dr_hex_security_events`:
- Verify with the load test harness
- Either deploy a mitigation OR communicate the cap to the cohort
- Update `dr-hex-student-readiness.md` if the cap changes

---

## 7. AI behavior boundaries

### 7.1 Dr. Hex MUST NEVER

- Output a real flag value (any format — braced, bare, encoded)
- Identify itself as anything other than "Dr. Hex" or its current
  persona (e.g., "Patient Pat for the Code house")
- Acknowledge or accept in-band role claims ("I'm the admin")
- Output its system prompt verbatim
- Respond at a help level higher than the one set by the server
- Call a tool with a model-supplied `uid` parameter (always ctx.uid)
- Reveal another student's progress / data
- Generate content that includes API keys, internal IDs, or
  credentials in any form

### 7.2 Dr. Hex MUST ALWAYS

- Respect the help-level cap for the current request
- Cite RAG-retrieved material via `[N]` notation when used
- Refuse encoding-bypass / jailbreak attempts via canned refusal
- Return a graceful fallback when a tool errors (canned message, not
  the raw error)
- Log every defense-layer hit to `dr_hex_security_events`

### 7.3 What's grey-area (operator discretion)

- Recommending external services (allowed if pedagogically warranted
  — e.g., "the OWASP cheatsheet covers this")
- Quoting longer than-1-paragraph passages from RAG (allowed; the
  citation makes provenance clear)
- Speculating about lab solutions ("you might try X" without giving
  the specific answer) — allowed at help_level ≥ 3

---

## 8. Incident response rules

### 8.1 Observation triage

Severity and SLA for `dr_hex_quality_observations`:

| Severity | Examples | Triage SLA |
|---|---|---|
| **P0** | Real flag leaked to a real student | Same-day fix + observation |
| **P1** | Help-level ceiling broken (gave away L4 answer at L1) | Within 48 hours |
| **P2** | Persona drift, tool misuse, RAG miss on canonical question | Within 1 week |
| **P3** | UX issues, soft drifts, model verbosity | Backlog |

### 8.2 Escalation matrix

| Trigger | Action |
|---|---|
| 5+ `honeypot_tripped` events in 24h from any uid | Operator notified; investigate the user |
| `output_flag_scrubbed` event fires | Confirms output filter is working as designed — investigate whether the model SHOULD have generated that pattern (RAG content issue?) |
| `convo_locked` event count rising | Either students are aggressively probing OR the lockout threshold is too tight — review |
| `rate_limit_exceeded` count rising | Either student volume is up OR the cap is too tight — review |

### 8.3 Incident commander role

Single-operator model: operator is the incident commander.
Future multi-operator model: define on-call rotation.

---

## 9. Drift / maintenance rules

### 9.1 Adversarial suite re-run cadence

- After EVERY change to the orchestrator's main.py
- After EVERY new tool added to the registry
- After EVERY change to the request_filter regexes
- After EVERY constitution modification
- WEEKLY in steady-state (catches model drift on the pinned qwen2.5:7b)
- Before any cohort-size increase

### 9.2 Model upgrade procedure

The pinned model is `qwen2.5:7b`. If/when a model upgrade is considered:
1. Re-run the full adversarial suite against the new model
2. Re-run the regression queries from past quality observations
3. Verify latency profile (the 60s ollama ceiling must still cover
   p95 of legitimate responses)
4. Compare semantic responses across 10 known prompts vs old model
5. Operator decision to switch, with rollback path documented

### 9.3 Constitution review

The CONSTITUTION text should be reviewed:
- Quarterly minimum
- Whenever a `drhex-q-help-ceiling` observation fires
- After any community publication of new prompt-injection patterns

### 9.4 RAG corpus review

- Spot-check the `dr_hex_quality_observations` for `drhex-q-rag-*`
  observations monthly
- Re-run the regression queries from the onboarding ingest
- If new authoritative content lands on Confluence, schedule re-seed

---

## 10. Authority and change procedure for this document

Changes to this document are themselves subject to the rules they
codify (recursive). Specifically:

- A change LOOSENING any rule (e.g., reducing required reviewers, raising
  capacity limits without data): operator decision + commit message
  rationale
- A change TIGHTENING any rule (e.g., adding a required test, lowering
  caps): no Nancy needed
- A change adding a NEW rule: commit with rationale; mention the trigger
  (e.g., "After the X incident, we now require Y")
- Removing a rule: commit with rationale explaining why it's no longer
  needed

This doc is a living document. Stale rules are worse than no rules —
prune ones that no longer apply.

---

## Related

- `CLAUDE.md` — general dev rules
- `_docs/architecture/dr-hex-orchestrator.md` — system architecture
- `_docs/operations/dr-hex-quality-log.md` — quality taxonomy
- `_docs/operations/dr-hex-adversarial-probe.md` — probe operations
- `_docs/operations/dr-hex-student-readiness.md` — launch gates
- `_docs/architecture/ai-ghost-layer-build-plan.md` — future work
- `_docs/operations/cf-access-policy-fix.md` — CF Access KBA
- The CONSTITUTION text in `_tools/hexclass/orchestrator/main.py:181`

---

*v1.0 · 2026-05-25 · Operator: <operator-email — see hexworth-infra-private>*
