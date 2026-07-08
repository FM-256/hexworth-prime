# Dr. Hex on the Observatory Linux Practice Sandbox (Scope)

**Status:** SCOPED, not started. Blocked on one PI/IRB decision (see Section 1).
**Goal:** Put Dr. Hex on the Observatory Linux Practice Sandbox and make him aware of the
student's live task state (via the grader), so he can answer questions and guide a learner
through the 5 hexpractice tasks without ever handing over the graded command.

Related: [[project_sandbox_terminal_blindness_drhex]] (the constraint this resolves),
`_docs/operations/dr-hex-constitution.md`, `_docs/operations/dr-hex-lab-skill-map.md`,
`_docs/operations/dr-hex-button-integration.md`.

---

## 1. The gating decision (PI / IRB): READ FIRST

The Observatory is an IRB-consented research surface. The approved consent text
(`_app/components/ObservatoryConsent.js:74`) promises participants, verbatim:

> "The platform **does not record the text you type into free-form fields**, and no data is
> shared in a form that identifies you."

Dr. Hex is a free-form chat. His backend writes to Firestore
(`dr_hex_engagement_events`, `dr_hex_quality_observations`, `dr_hex_security_events` at
`functions/hex-ai-bridge.js:1498/1143/1009`) and forwards the typed message to the AI
orchestrator on hexclass for processing.

**Narrow the conflict precisely:** the student's *task state* (which of the 5 tasks pass) is
"learning progress and performance," which the consent explicitly DOES cover under item (a).
So grader-state awareness is fine. The ONLY conflict is the student's **free-form typed
questions** to Dr. Hex, which the consent says are not recorded.

So the decision reduces to one question: **what happens to the text a student types to Dr.
Hex on this consented page?** Options for the PI:

| Option | What it means | Cost |
|--------|---------------|------|
| **A. Re-consent** | Update the approved consent to disclose Dr. Hex chat as a data source; new sign-ins consent to it (v1 signers grandfathered, per the existing FORM_VERSION pattern). | IRB amendment; cleanest, makes chat a first-class disclosed source. |
| **B. No-persist mode** | Dr. Hex runs on the sandbox but writes NO free-form text to the research collections (engagement/quality logging of message bodies disabled on this surface); confirm the orchestrator likewise does not retain it. Transient processing only. | Engineering + PI sign-off that transient LLM processing is not "recording." Must verify the off-repo orchestrator's logging. |
| **C. Off the consented surface** | Keep Dr. Hex off the Observatory; instead surface the Linux Practice Sandbox on a non-consented house lab page where Dr. Hex is already fine. | Sidesteps consent entirely, but does not satisfy "Dr. Hex in the Observatory." |

Nothing that exposes Dr. Hex chat to Observatory participants ships until this is decided.
Everything in Sections 2 to 5 is buildable, but Phase 2+ (the actual mount) waits on this.

---

## 2. Current state

- Observatory (`_app/houses/observatory/index.html`) loads `SandboxLauncher.js` only. **No Dr.
  Hex button today** (Dr. Hex was scoped "labs only"; the Observatory is a launcher page).
- The grader (`checkPractice` -> bc1 `/api/sandbox/check/{sessionId}`) and Dr. Hex
  (`hexAiChat`) are entirely separate subsystems. Nothing bridges them.
- The 5 tasks live client-side in `OBS_TUT_STEPS` (`observatory/index.html:501-517`).

## 3. Proposed architecture

**3a. Mount (frontend, hosting).** Two lines before `</body>` on the Observatory page:
```html
<hex-ai-button mission-id="linux-sandbox" house="observatory"></hex-ai-button>
<script type="module" src="/_lib/HexAIButton.js"></script>
```
Gated behind the SAME consent `ObservatoryConsent.ensureConsent` already enforces, plus
whatever Section 1 decides for chat text. (For decliners: no button, or a no-persist button,
per the decision.)

**3b. Grader-state awareness (backend, the CTF precedent).** Reuse the server-authoritative
tool-dispatch path (NOT client-supplied per-turn context, which is spoofable). The precedent
is `recent_house_activity` in `TOOL_DISPATCH_HANDLERS` (`functions/hex-ai-bridge.js:618/796`):
the orchestrator, mid-turn, POSTs to `/hexAiToolDispatch`; the CF (which holds firebase-admin
and can reach bc1) resolves it and returns data. Add a handler `sandbox_task_state` that calls
the grader and returns the per-task pass/fail (`{results:[{id,desc,pass}]}` shape).
- **Session-id / ownership problem (RESOLVED: Style A, 2026-07-08):** the grader is keyed by
  `sessionId`, not `uid`, and the CF handler holds only a trusted `ctx.uid` (no user token). An
  earlier design trusted a `session_id` the model passes, which Nancy flagged as a confused-
  deputy (a learner could make Dr. Hex read another learner's task state). A client-side Firestore
  `uid->session` write does NOT fix this either: the client controls what it writes, so it can
  name a foreign session. **Chosen fix (Style A): ownership lives at the source of truth, the
  lab-manager.** New endpoint `GET /api/sandbox/grade-for?uid=<uid>&labId=<lab>` (bc1
  `server.js`), gated by a shared 256-bit `SANDBOX_SERVICE_KEY` (`timingSafeEqual`), resolves the
  uid to ITS OWN session via `getExistingSession(uid, labId)` and grades it. The handler passes
  ONLY the trusted `ctx.uid` (same anchor `recent_house_activity` uses); no sessionId ever crosses
  a trust boundary from the model, so the confused-deputy cannot occur. No Firestore/rules/beacon
  needed. Endpoint LIVE + verified on bc1 (auth gate + no_session + unsupported_lab paths;
  full grading-path test pending a live session). Handler in `hex-ai-bridge.js`
  (`sandbox_task_state`, reads `SANDBOX_SERVICE_KEY` secret). See
  [[project_sandbox_terminal_blindness_drhex]].

**3c. Per-lab knowledge (Skill Map).** Author `_app/lab-skill-maps/linux-sandbox.yaml`, seed to
Firestore `lab_skill_maps/linux-sandbox`. The orchestrator injects it by `mission_id`. Encode
the 5 tasks + Linux help; the `why` strings in `OBS_TUT_STEPS` are ready-made Level 1-2 concept
explanations. **Put the exact 5 command strings in `forbidden_disclosures`** so Dr. Hex teaches
the concept (`chmod 600`, `grep >`, `git init`) but never pastes the graded one-liner (the
command is this lab's "flag equivalent" per the Constitution).

## 4. Constitutional guardrails the integration must honor

Per `dr-hex-constitution.md` / `dr-hex-ten-laws.md`:
- Never hand over the exact graded command at any Help Level (`constitution.md:120-123`).
- Execution-syntax skills cap at Help Level 2 by default (`dr-hex-lab-skill-map.md:117`):
  explain what `chmod 600` does, do not write the graded line.
- Use grader state to CALIBRATE escalation (passed tasks 1 to 3, stuck on 4 -> earned a more
  direct hint about `grep` redirection), but do not refuse once effort is demonstrated
  (`constitution.md:143-145`).

## 5. Phased plan

1. **Phase 0 (no student exposure): DONE 2026-07-08 (Nancy PROCEED x2):**
   - `_app/lab-skill-maps/linux-sandbox.yaml` authored (5 tasks, Help cap Level 2, 10
     `forbidden_disclosures` incl. answer-bearing fragments, 5 Socratic `phase_scaffolds` with an
     enforcement note that they are inert until `phase_id` is wired).
   - `sandbox_task_state` handler in `hex-ai-bridge.js` (Style A; reads `SANDBOX_SERVICE_KEY`).
   - bc1 lab-manager `/api/sandbox/grade-for` endpoint LIVE + verified (256-bit service key).
   - REMAINING before deploy: set the Firebase secret `SANDBOX_SERVICE_KEY` to the SAME value as
     bc1 `~/hexworth-sandbox/.env` (`firebase functions:secrets:set SANDBOX_SERVICE_KEY`).
2. **Phase 1 (BLOCKED on Section 1 consent decision):** mount the button on the Observatory
   behind consent; wire the mood-ring signal; orchestrator must register the `sandbox_task_state`
   tool + inject the skill map by `mission_id`; full grading-path test with a live session; QC
   (Nancy + Chris + Karl on the skill-map hints) + the consent gate honored.
3. **Phase 2:** deploy: functions (`hex-ai-bridge` new handler, via smoke-gated
   `_tools/eduscan/smoke/deploy.sh --only functions`, AFTER the Firebase secret is set),
   Firestore skill-map seed, hosting (observatory). Orchestrator change (below) coordinated.

## 6. Off-repo dependency (important)

The system prompt + Skill-Map injection + tool-loop all run on the **orchestrator (hexclass
Python `main.compose_system_prompt`, `skill_map_loader.py`)**, which is NOT in this repo. Making
the orchestrator actually CALL the new `sandbox_task_state` tool and inject the sandbox skill
map is a change to that separate system. Scope must include that coordination; the CF handler
alone does nothing until the orchestrator invokes it.

## 7. Open decisions

1. **[PI/IRB, blocking]** Section 1: free-form chat text on the consented surface (A/B/C).
2. Mood-ring signal: leave `calm` (no per-command state, per the integration doc's known gap)
   or wire task-completion to a state refresh via `hexworth:lab-attempt-submitted`.
3. Does the operator have access / a path to make the orchestrator change (Section 6), or does
   that go through a separate owner?
