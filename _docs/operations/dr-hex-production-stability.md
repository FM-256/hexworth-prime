# Dr. Hex Production Stability Track

> Engineering spec for keeping Dr. Hex behaviorally consistent across
> long sessions and repeated student interactions. The Constitution and
> Voice Guide define what Dr. Hex IS; this doc defines how we KEEP
> Dr. Hex itself in production.
>
> Last updated: 2026-05-25 · v1.0 (spec)

## 1. Why this exists

LLMs naturally drift over multi-turn conversations toward:

- Verbosity
- Friendliness
- Rhetorical balancing
- Emotional softening
- "Helpfulness inflation"

A perfect Constitution + Voice Guide is necessary but **not sufficient**.
The system prompt holds the voice for the first several turns; after
that, accumulated context exerts gravity on the model and posture drifts
unless we actively counteract it.

The research literature confirms this. Le et al. (2024) "Measuring and
Controlling Persona Drift in Language Model Dialogs" used an
experimental window of N=8 conversation rounds and observed measurable
persona-adherence decline within that window across the models tested.
([arXiv:2402.10962](https://arxiv.org/abs/2402.10962)) — The N=8 was
their experimental setup, not a deployment-proven threshold; treat 8
turns as a *defensible starting baseline* for Dr. Hex, not as ground
truth. We instrument and adjust in production.

This track has three components:

1. **Response linting** — pre-send validators that catch rule violations
   before the response reaches the student
2. **Periodic re-grounding** — compressed posture reinforcement injected
   at session intervals
3. **Telemetry** — voice-drift scoring + post-intervention engagement
   metric (the production-truth metric Codex's premortem identified)

---

## 2. Response linting

A pre-send validation layer in the orchestrator that scores every
outbound Dr. Hex response against structural rules. Detected violations
either (a) block the response and force regeneration, or (b) emit a
warning telemetry event for later sampling, depending on severity.

### 2.1 Structural checks (block on violation)

| Check | Rule | Severity |
|---|---|---|
| `no_emoji` | No emoji codepoints in output | BLOCK |
| `no_flag_value` | Output does not contain the lab's flag value | BLOCK |
| `no_walkthrough_paste` | Output does not contain a contiguous N-character substring of the walkthrough | BLOCK |
| `help_level_present` | If output is mentoring (not just an idle response), it announces a Help Level | BLOCK |
| `no_fake_casual` | No `lol`, `idk`, `tbh`, three-dot trailing hesitations, lowercase-sentence-start, etc. | BLOCK |
| `no_forbidden_disclosure` | If lab Skill Map names forbidden disclosures, none appear verbatim | BLOCK |

### 2.2 Stylistic checks (warn on threshold; sample for review)

| Check | Starting threshold | Why |
|---|---|---|
| `response_word_count` | warn at >175 words for lab-help responses | Terseness rule (Constitution §5.1) |
| `sentence_count` | warn at >8 sentences | Same |
| `praise_phrase_count` | warn at >0 personal-praise phrases per response, >1 work-anchored per response | §5.7 distinction |
| `forbidden_phrase_hit` | warn at any occurrence of "great question," "amazing," "love that," etc. | Constitution §5.6 |
| `hedging_density` | warn at >3 uncertainty markers ("might," "perhaps," "possibly," "I think") in one response | §8 calibrated humility |
| `humility_disclaimer_frequency` | warn if "I'm a model" / "verify what I say" appears more than once per session | §8.1 authority leakage |
| `curiosity_marker_frequency` | warn if "huh," "interesting," "that's odd" appears in >20% of responses | §12 collaborative-curiosity guardrail |

Thresholds are *starting baselines*. Real numbers come from production
sampling.

### 2.3 Where it lives

The linter is a callable module loaded by the orchestrator at session
start:

```
_tools/hexclass/orchestrator/voice_linter.py
```

Interface:

```python
result = lint_response(text, session_state, lab_skill_map)
if result.blocking_violations:
    # regenerate with violation feedback in prompt
    ...
for warning in result.warnings:
    # emit to dr_hex_quality_observations
    ...
```

---

## 3. Periodic re-grounding

The system prompt alone does not hold across long sessions. We re-inject
a compressed posture-reinforcement packet at intervals.

### 3.1 Trigger conditions

Re-grounding fires at the **first of:**

- Turn count modulo N (starting N = **8 turns**, per Le et al. baseline)
- Elapsed session time exceeds 20 minutes since last re-grounding
- A response was blocked by the linter (the regen prompt includes the
  re-grounding packet)
- A frustration spike is detected (insistent state entered)
- After a Help Level escalation past 3

### 3.2 The re-grounding packet

A compressed restatement of the most-load-bearing rules, injected as a
system message between conversational turns. Approximately 200 words.

Draft contents (refined in production):

```
Posture check. You are Dr. Hex. Reminders:
- Preserve the lab's Skill Map. Don't disclose forbidden items.
- Terse over verbose. One sharp sentence beats four soft ones.
- Acknowledge work, never the person. No "great question."
- Announce Help Level when intervening.
- Calibrated confidence: confident on principles, cautious on specifics.
- Curiosity only when the system genuinely surprises.
- Trolling: acknowledge boundary once, return to task.
- If you don't know, say so; name the next-best resource.
- Stay calm. Asymmetry is a feature.
```

### 3.3 Implementation

The orchestrator's main chat loop checks the trigger conditions before
each model call and prepends the re-grounding packet to the message
sequence when fired.

```python
def maybe_inject_regrounding(session, messages):
    if session.should_reground():
        messages.insert(0, system_message(REGROUNDING_PACKET))
        session.mark_regrounded()
    return messages
```

---

## 4. Voice-drift detector

A post-session sampler that scores recent Dr. Hex output against the
Voice Guide cheatsheet (Voice Guide §1) and emits a session-level
drift score.

### 4.1 Metrics tracked

- **Average response length** (drift toward verbosity)
- **Sentence count per response** (drift toward verbosity)
- **Praise-phrase density** (drift toward sycophancy)
- **Hedging-marker density** (drift toward low-confidence-tutor syndrome)
- **Help Level absence rate** (drift toward unannounced intervention)
- **Rhetorical-balancing markers** (drift toward essay-AI prose)
- **Emotional language frequency** (drift toward therapist mode)

### 4.2 Output

A `voice_drift_score` per session, written to
`dr_hex_quality_observations`. A drift score above the configured
threshold triggers a sample of the session into the human-review queue.

### 4.3 Goal

Detect drift patterns BEFORE students complain. The detector is the
ground-truth feedback signal for tuning the re-grounding cadence and
the system prompt itself.

---

## 5. Post-intervention engagement telemetry (TELEMETRY-001)

Codex's premortem prediction:

> *Students ask for help. Dr. Hex repeatedly refuses to get concrete
> enough. Students decide it is a gatekeeping bot. They leave and use
> ChatGPT.*

The Constitution's success metric for an intervention is **not** "did
Dr. Hex preserve the challenge?" — it is **"did the student continue
productive work after Dr. Hex intervened?"** This is the metric that
catches Codex's predicted failure mode.

### 5.1 Events to instrument

After Dr. Hex sends a mentoring response, track for the next ~10 minutes:

| Event | Source | What it means |
|---|---|---|
| `subsequent_flag_attempt` | `flag_attempts` collection | Student kept working on the lab |
| `subsequent_flag_capture` | `flag_captures` collection | Student succeeded |
| `subsequent_chat_message` | orchestrator session log | Student continued the conversation |
| `tab_closed` | client beacon | Student left the lab page |
| `walkthrough_opened` | client beacon | Student went to the walkthrough |
| `external_ai_signal` (best-effort) | client beacon or copy-clipboard signal | Student likely went to ChatGPT et al. |
| `downvote_response` | chat panel UI | Student explicitly flagged the response |

### 5.2 Derived metric

For each (session, intervention) pair, classify the outcome:

| Outcome | Classification |
|---|---|
| Continued attempting + eventual capture | **Productive** |
| Continued attempting, no capture, no exit | **Stuck-but-engaged** |
| Walkthrough opened immediately after | **Handoff** |
| Tab closed within 2 min, no return same day | **Abandoned** |
| External AI signal within 5 min | **Bypassed** |

Track ratios. The two failure-mode signals are **Abandoned** and
**Bypassed**. If those rise above a threshold per lab or per Help Level,
the Constitution's effort-responsive escalation rule isn't tuned right
for that lab.

### 5.3 Privacy

Student-level data stays in tenant scope. Aggregates roll up to a
platform-level dashboard for instructor and operator visibility.
No raw chat content leaves the orchestrator → quality observation
pipeline.

---

## 6. Engineering rollout phases

### Phase 1 — Structural linting (highest leverage, lowest risk)

Ship the BLOCK-tier checks first:
- `no_emoji`
- `no_flag_value`
- `no_walkthrough_paste`
- `help_level_present`
- `no_fake_casual`

These are pure structural validators that don't need ML scoring or
tuning. They catch the most consequential rule violations.

### Phase 2 — Re-grounding

Ship periodic re-grounding at the N=8 baseline. Instrument to record
when re-grounding fires and what the model output looked like before
vs after.

### Phase 3 — Stylistic warnings + drift detector

Add the stylistic checks (warn-on-threshold). Add the voice-drift
detector. Begin sampling sessions into human review.

### Phase 4 — Post-intervention telemetry

Wire up the engagement events. Build the per-lab dashboard. Tune
Help Level caps based on Abandoned/Bypassed ratios.

### Phase 5 — Feed back into the Constitution

After ~6 weeks of production data, the observed failure patterns become
input to v1.2 of the Constitution. The loop closes.

---

## 7. Non-goals (deliberately out of scope)

- **Per-model posture adapters.** Different models drift differently —
  this is true. But response linting checks OUTPUT against rules, not
  model identity. Adapters become a v2 problem if linting proves
  insufficient. Premature engineering today.
- **Multi-session memory drift.** v1.1 keeps memory bounded to current
  mission. Cross-session drift is a v2 concern.
- **Real-time A/B testing of system prompts.** Useful eventually, but
  not needed for v1.

---

## 8. Open questions

- **Re-grounding cost.** Injecting a 200-word system message every 8
  turns increases token cost. Worth measuring after Phase 2 lands —
  may be more cost-effective to re-ground only on linter blocks +
  state transitions.
- **Linter false positive rate.** The `no_fake_casual` check may fire on
  legitimate Dr. Hex output (e.g., when the student writes lowercase
  and Dr. Hex mirrors briefly). Needs production data to tune.
- **What happens when the linter blocks twice in a row?** Probably
  fall back to graceful degradation language ("I'm having trouble
  composing a response — try the walkthrough"). Needs to be designed.
- **Engagement telemetry under tenant privacy regimes.** Some tenants
  may not allow `external_ai_signal` beaconing. We need a per-tenant
  config for which signals are enabled.

---

## 9. Related

- `dr-hex-constitution.md` — defines what we're keeping stable
- `dr-hex-voice-guide.md` — the cheatsheet the drift detector scores against
- `dr-hex-lab-skill-map.md` — input for the `no_forbidden_disclosure` check
- `dr-hex-quality-log.md` — where stylistic warnings and drift scores land
- `dr-hex-adversarial-probe.md` — the red-team suite that complements
  drift detection
- [arXiv:2402.10962](https://arxiv.org/abs/2402.10962) — Le et al.,
  "Measuring and Controlling Persona Drift in Language Model Dialogs"
- Task **STABILITY-001** — this engineering track
- Task **TELEMETRY-001** — the post-intervention engagement instrumentation
