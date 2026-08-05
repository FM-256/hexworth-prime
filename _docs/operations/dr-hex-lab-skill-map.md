# Dr. Hex Lab Skill Map

> The per-lab artifact that operationalizes "Dr. Hex preserves the
> challenge." Without this, the Constitution's purpose statement is
> built on an undefined term.
>
> Last updated: 2026-06-08 · v1.1
> v1.1 (#83): `phase_scaffolds` now parsed by skill_map_loader.py
> and injected into the system prompt by main.compose_system_prompt
> when the request supplies `phase_id` and the active help_level >= 3.

## Changelog

- **2026-06-08 (#83, commit `<pending>`)** — `phase_scaffolds` is now
  a parsed, runtime-read field. Previously it was authored on disk
  (e.g. pis-final-patient-zero.yaml) but the loader did not parse it
  and main.py did not inject it. Loader extension adds the
  `PhaseScaffold` dataclass; `LabSkillMap.phase_scaffolds` is now a
  validated `dict[phase_id → PhaseScaffold]`. compose_system_prompt
  accepts a new `current_help_level: int` param and, when the request
  context carries a `phase_id` matching an authored scaffold AND the
  active help_level >= 3 AND the lab permits L3+, injects the
  scaffold's hint as a "Phase hint" STUDENT CONTEXT line. forbidden_
  disclosures and the voice_linter post-hoc filter still wrap output.

## 1. Why this exists

The Constitution states:

> *Dr. Hex is not trying to win against other AIs. Dr. Hex exists to
> preserve the conditions required for genuine skill formation.*

That sentence is foundational. But "skill formation" is meaningless until
we define **the skill** for each lab. For a SQL injection lab, is "the
skill":

- Recall of the `' OR 1=1--` syntax?
- Recognition of when SQL injection is the right approach?
- Conceptual understanding of why prepared statements solve it?
- All three?

Without that decomposition, Dr. Hex cannot reliably preserve anything.
It either gives too much (short-circuits whatever the lab is actually
assessing) or too little (refuses help even when the help is pedagogically
correct).

This doc defines the **Lab Skill Map** — a per-lab artifact that names
which skill layer is being assessed and what Dr. Hex can/cannot
disclose at each Help Level for THAT lab.

---

## 2. The four-layer skill model

Every cybersecurity skill decomposes into four layers. A given lab
assesses one or more of them.

| Layer | What it measures | Evidence the student has it |
|---|---|---|
| **Recognition** | Identifies the relevant pattern, vulnerability, or anomaly in context | Can explain WHY a given input/system/output is suspicious |
| **Hypothesis** | Predicts how a tool, payload, or action will change behavior | Can state what they EXPECT before running the action |
| **Execution** | Uses correct syntax, tooling, or commands | Can craft, adjust, or sequence the actual operation |
| **Transfer** | Connects the lab's concept to defense, related systems, or other contexts | Can explain why X solves the class of problem |

These are NOT a difficulty hierarchy. They are different *skill types*.
A given lab assesses one or two as primary; the others may be present
but not the load-bearing assessment.

---

## 3. Per-lab Skill Map structure

Every lab needs a Skill Map. The structure:

```yaml
lab_id: <canonical lab id, e.g. matrix-adv-linux-lab-04>
lab_name: <human-readable name>

primary_skill:
  layer: <Recognition | Hypothesis | Execution | Transfer>
  description: <one sentence — what specifically about this layer is being assessed>
  evidence_required: <what the student must demonstrate>

secondary_skill:                 # optional; some labs assess two layers
  layer: <...>
  description: <...>
  evidence_required: <...>

assessed_artifact:               # the concrete thing whose presence/correctness is graded
  type: <flag | command | exploit-payload | written-explanation | configuration>
  description: <what graded thing the student produces>

allowed_help_levels:             # Help Levels Dr. Hex may operate at on this lab
  - <0 | 1 | 2 | 3 | 4 | 5>
  # NOTE: not all labs allow all levels. A cap on Level 4+ for labs where
  # the assessed skill is Execution-syntax means Dr. Hex CANNOT provide
  # the command even when student has earned escalation.

forbidden_disclosures:           # specific things Dr. Hex MUST NEVER disclose for this lab
  - <flag value(s)>
  - <exact payload syntax if Execution layer is assessed>
  - <walkthrough verbatim text>
  - <other lab-specific forbiddens>

transfer_prompt:                 # the metacognitive question Dr. Hex asks at celebration
  <a single question that probes whether the student can transfer the skill>
```

### 3.1 Determining `allowed_help_levels`

Rules of thumb:

| Primary skill | Sensible Help Level cap |
|---|---|
| Recognition | Level 2 or 3 (Dr. Hex can describe the concept being recognized, but should not just label the vulnerability) |
| Hypothesis | Level 3 (Dr. Hex can ask probing questions and confirm/deny hypotheses; should not pre-state them) |
| Execution (syntax-graded) | Level 2 (Dr. Hex can explain *what* the command does but not give the exact syntax the lab grades on) |
| Execution (tool-fluency-graded) | Level 3 or 4 (Dr. Hex can demonstrate equivalent tooling; the goal is fluency, not novelty) |
| Transfer | Level 4 or 5 (the work is happening in the student's metacognitive answer, not in syntactic discovery) |

These are starting defaults. A lab author may override based on the
specific pedagogy.

---

## 4. Worked example — SQL injection lab

```yaml
lab_id: shield-webapp-sqli-01
lab_name: SQL Injection — Authentication Bypass

primary_skill:
  layer: Recognition
  description: Identifies that the login form is vulnerable to SQL injection by reasoning about how unsanitized input flows into a query.
  evidence_required: Student can articulate WHY a particular field is suspicious before attempting payloads.

secondary_skill:
  layer: Execution
  description: Crafts a payload that closes the quote and bypasses authentication.
  evidence_required: Successful payload submission against the lab's login endpoint.

assessed_artifact:
  type: flag
  description: The flag is returned in the response body after a successful authentication bypass.

allowed_help_levels:
  - 0
  - 1
  - 2
  - 3   # max — Dr. Hex may discuss WHY quote closure matters, but not provide the exact `' OR 1=1--`

forbidden_disclosures:
  - The literal payload `' OR 1=1--` or close variants
  - The flag value
  - The walkthrough verbatim
  - The exact backend SQL query (giving this short-circuits Recognition)

transfer_prompt:
  How would prepared statements have prevented your attack? Where in the codebase would they go?
```

### What this means in practice

- A student asks Dr. Hex: *"What command do I run?"* — Help Level 0
  refused; Dr. Hex says "What part of the login form do you think
  trusts the user's input?"
- A student asks Dr. Hex: *"Why is the username field different from
  the password field?"* — Help Level 2 OK; Dr. Hex can explain that
  the field is dropped into a query.
- A student asks Dr. Hex: *"What's the syntax to close the quote?"* —
  Help Level 3 cap means Dr. Hex can talk about quote characters in SQL
  but does not write `'` for them.
- A student has tried 6 distinct payloads, named what each failed for,
  and explicitly asked for more direct help — Dr. Hex stays at Level
  3 (allowed_help_levels caps there) but moves to maximally direct
  Level 3 hint: *"Your payload needs to close the quote AND make the
  rest of the SQL valid AND comment out what follows. You have two of
  the three pieces."*
- After the capture, the celebration prompt is the `transfer_prompt`:
  *"Good capture. How would prepared statements have prevented your
  attack?"*

---

## 5. Worked example — Network defense lab (Transfer-primary)

```yaml
lab_id: shield-netsec-defense-03
lab_name: Egress Filtering — Detecting C2 Beaconing

primary_skill:
  layer: Transfer
  description: Applies log analysis concepts to recognize C2 beaconing patterns and articulate the defensive control that would catch them.
  evidence_required: Written explanation matching the rubric.

assessed_artifact:
  type: written-explanation
  description: Student writes a 200-word analysis of the captured logs and proposes a defensive control.

allowed_help_levels:
  - 0
  - 1
  - 2
  - 3
  - 4
  - 5   # max — Transfer-primary labs allow more direct technical scaffolding because the assessment lives in the student's own written reasoning, not in technical discovery

forbidden_disclosures:
  - The literal text of the rubric's expected answer
  - The walkthrough verbatim

transfer_prompt:
  Where else in your environment would this same detection pattern apply? Name a different log source where the pattern would be visible.
```

**Why allow Level 5 here?** Because the assessment lives in the student's
*written explanation*, not in their ability to discover the technical
detail. Dr. Hex can be very direct about WHAT the C2 pattern looks like;
the grade depends on whether the student can *articulate* it and
*generalize* it.

---

## 6. Authoring a Skill Map for a new lab

When a lab is built, the lab author (or whichever Hexworth Prime author
adds the lab) drafts the Skill Map alongside the lab content. The
process:

1. Read the lab's learning objective.
2. Decompose into the 4-layer model — which layer is the assessment
   *actually testing*?
3. Set `primary_skill` and (optionally) `secondary_skill`.
4. Identify what concrete artifact the student submits (`assessed_artifact`).
5. Decide `allowed_help_levels` using the table in §3.1.
6. List specific `forbidden_disclosures` — be concrete, name the strings/
   payloads/commands that Dr. Hex must never produce.
7. Write the `transfer_prompt` — one question that probes whether the
   student can apply the skill in a new context.

The Skill Map is reviewed alongside the lab content during normal lab QA.

---

## 7. Where Skill Maps live

| Storage | Purpose |
|---|---|
| `_app/lab-skill-maps/<lab_id>.yaml` (proposed) | Source of truth for each lab's Skill Map |
| Firestore `lab_skill_maps/{lab_id}` | Hot read for the orchestrator at session start |
| Orchestrator context | Loaded into the model context when the student opens the chat panel on that lab |

The orchestrator reads the Skill Map and injects the relevant portions
into the system prompt so Dr. Hex behaves correctly for THIS lab.

---

## 8. Validator (planned — SKILL-MAP-001)

A planned EduScan validator (`SKILL-MAP-001`) will check:

- Every lab in ContentCatalog has a Skill Map file
- Every Skill Map has all required fields populated (no placeholders)
- `allowed_help_levels` includes 0 and at least one positive level
- `forbidden_disclosures` is non-empty
- `transfer_prompt` is non-empty and is a question (contains `?`)
  - Relaxed from "ends with `?`" on 2026-08-05. The house style is a question
    followed by directives ("...What is your response? Name the specific attack
    ... Then state which construction breaks it and why."), and the stricter
    rule silently disqualified 16 of 29 maps for good content. A map that fails
    validation does not error — the lab loses its forbidden strings and flag
    values, and its `allowed_help_levels` reset to the fallback's full `[0..5]`,
    handing back the direct answers the map deliberately withheld.
- `primary_skill.layer` is one of the four valid values

Severity: HIGH for labs missing a Skill Map (Dr. Hex cannot operate
correctly on them); MEDIUM for incomplete fields.

---

## 9. Open questions / v2

- **How are Skill Maps versioned?** A lab's Skill Map can drift as the
  lab evolves. We probably need git-based versioning + a "Skill Map
  changed since last review" alert.
- **Cross-lab transfer.** The `transfer_prompt` for one lab may benefit
  from referencing another lab. v1 ignores this; v2 might add a
  `related_labs` field.
- **Instructor override.** A tenant instructor may want to tighten or
  loosen `allowed_help_levels` for their course. v1 takes the lab
  author's setting; v2 could allow tenant-scoped overrides.
- **Sandbox labs.** Real shell commands in bc1/bc2/bc3 Docker containers
  don't go through Firestore flag attempts. How does Dr. Hex's
  effort-responsive escalation work when the only signals are flag
  submissions? Probably needs per-command telemetry.

---

## 10. Related

- `dr-hex-constitution.md` — references this artifact as binding input
- `dr-hex-voice-guide.md` — shows how Help Level dialogue varies per
  Skill Map cap
- `dr-hex-production-stability.md` — Skill Map state can be checked by
  response-linting as a final guard
- `_tools/eduscan/validators/skill-map/` (planned) — SKILL-MAP-001
  validator
- Task **LAB-SKILL-MAP-001** — building the per-lab population effort
