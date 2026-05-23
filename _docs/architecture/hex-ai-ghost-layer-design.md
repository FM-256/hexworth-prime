# Hex AI — Ghost Layer Design (v0.7.0 proposal)

> Status: **DESIGN PROPOSAL — Nancy-reviewed, operator-discussed, 8 blockers open**
> Authored 2026-05-21 · Updated 2026-05-23 (this doc consolidates the memory thread)
> Sibling to: `_docs/architecture/dr-hex-orchestrator.md`, `_docs/architecture/hex-ai-tool-layer-design.md`

## What this is

The Ghost Layer is the v0.7.0 architectural slice — the *proactive* layer of the AI entity. Up through v0.6.0 (tool layer), Dr. Hex is **reactive**: students ask, Dr. Hex answers. The Ghost is the AI watching the room and deciding *on its own* to speak.

Operator's framing (verbatim):

> a ghost in the machine that looks at what all the users are doing and looks at the analytics and can tell if a person is stuck and needs a hand or some tutoring or something. I want it to be some type of omniscient deity as if we were in the classroom and the deity would represent me walking around the classroom verifying what users are doing and making sure they are on track. looking at their screen and if i notice them do something off, I ask them why did you do that, why not try this or that, keep it short not shotgunning but leaving the window open so they can ask questions if they want.

UX tone: **casual classroom voice**. Not an alert. Not a tutor announcing itself. The instructor pausing by the desk for thirty seconds, one short observation, then walking on. The student engages or doesn't.

## Architectural shape

```
┌─────────────────────────────────────────────────────────────┐
│  Telemetry Stream  ←  events from every student surface     │
│  (lab progress, hint usage, attempts, navigation, idle)     │
└────────┬────────────────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────────────────────────┐
│  Signal Detector  →  "is this student stuck?"               │
│  Rule-based first pass (cheap, transparent)                 │
│  → confidence + reason                                      │
└────────┬────────────────────────────────────────────────────┘
         ↓ (if confidence > threshold)
┌─────────────────────────────────────────────────────────────┐
│  Intervention Decision  →  speak? what type? when?          │
│  - per-student debounce + cooldown                          │
│  - per-student baseline calibration                         │
│  - permission gate (instructor mode never gets nudged)      │
│  - HELP LEVEL GATE (added per Nancy B4 review)              │
└────────┬────────────────────────────────────────────────────┘
         ↓ (if intervene)
┌─────────────────────────────────────────────────────────────┐
│  Intervention Generator  →  the actual nudge                │
│  Local model (Dr. Hex persona system)                       │
│  Receives: full Context Packet + struggle signal + level    │
│  Produces: ONE short question or observation                │
└────────┬────────────────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────────────────────────┐
│  UX Surface  →  how the student sees it                     │
│  Non-modal · dismissible · response path optional           │
│  Persistent environmental cue (Nancy B1)                    │
└────────┬────────────────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────────────────────────┐
│  Feedback Loop  →  did it help?                             │
│  Track engagement + post-nudge progress                     │
│  Per-student preference update                              │
└─────────────────────────────────────────────────────────────┘
```

**Structural insight:** detection is cheap (rules), generation is the only expensive part (LLM). Rules run continuously across all students; LLM only invoked at the moment to speak. Cost stays linear with intervention frequency, not session count.

## Components

### 1. Telemetry Stream

Real-time event feed. Existing sources:

- `ModuleProgress.complete()` calls
- Hint button clicks
- BoxEngine command attempts (success/fail)
- EDT phase transitions
- Quiz submissions
- Page navigation timestamps
- Idle detection

Sources to add for v0.7.0:

- Step time (how long on current step of current lab)
- Click-without-thinking heuristic (rapid repeated clicks)
- Re-read detection (scroll back to brief, re-scroll)

Storage: short-lived per-session ring buffer. No long-term retention by default (subject to feedback-loop persistence boundary — see open question #1).

### 2. Signal Detector — Rule-Based First Pass

Cheap heuristics running constantly:

| Signal | Threshold | Confidence shift |
|---|---|---|
| Failed-attempt count on same step | ≥ 3 | +0.4 |
| Time on same step | ≥ 10 min without state change | +0.3 |
| Rapid repeated identical actions | 5+ in 30s | +0.5 (frustration) |
| Hint already used max | yes | +0.2 |
| Re-read brief 2+ times | yes | +0.2 |
| Navigated away from lab and back | yes | +0.1 |
| Mouse motion absent | 5+ min | +0.1 (stuck or away) |
| Long idle without progress | 15+ min | +0.4 |

**v1 confidence threshold: 1.0+ (raised per Nancy B2).** Initial design at 0.6 fired too eagerly on realistic non-stuck behavior — a student re-reading the brief once + coming back from a tab + spending 11 min on a complex step would cross the original threshold. Start strict, lower only after baseline data is collected.

Future enhancement: ML-based anomaly detection on telemetry sequences. Not v1.

### 3. Intervention Decision

Even when confidence > threshold, don't always speak. Gating:

- **Debounce.** Don't fire within 5 min of last detection (let signals stabilize).
- **Cooldown.** Don't fire again within 10 min of last intervention with same student.
- **Per-student baseline.** Some students take longer to think. Learn baseline pace and adjust individually.
- **Permission gate.** Instructor mode → never nudged. Admin → never nudged.
- **Time-of-day check.** Past midnight → tired-student voice.
- **Class-wide check.** Many students stuck same step → that's a content problem; surface to instructor dashboard, not nudge students.
- **HELP LEVEL GATE (Nancy B4 required):** the intervention generator MUST receive and be gated by student's current Help Level. Process-questions only at Level 0 ("what are you expecting?"). Directional nudges only at higher levels the student already earned. Without this gate, the Ghost is a structural hole in the reactive layer's core protection.

### 4. Intervention Generator

Local LLM produces one short question or observation. Input:

- Context Packet (from existing architecture)
- Struggle signal (what fired and why)
- Per-student preference (terse vs warmer)
- Persona of student's current house
- **Student's current Help Level** (gates the generator's allowed output shape)

Output: **one sentence, optionally followed by a question.** Not a hint. Not a solution. The instructor pausing by the desk.

**Example outputs** (from a stuck student in PIS-L11):

- "You've tried that scan three times — what are you expecting it to find?"
- "What did the last output tell you?"
- "Quick check: how does this connect to the briefing's bit about port filtering?"
- "Take a breath. What's the smallest test you could run to learn one thing?"

**NOT examples** (these would be shotgunning):

- "You should try X. Or maybe Y. Or check Z. Did you read the briefing? Try the hints!"
- "It looks like you're stuck. Here's the solution..."

### 5. UX Surface

Non-modal. Dismissible. Possible shapes:

- **House mascot pop-in.** House mascot appears briefly with a speech bubble. 15s auto-dismiss. Click to engage.
- **Side rail toast.** Less character, more utility. Same dismiss behavior.
- **Subtle chat icon glow.** Most subtle. Student knows they could ask.

**Persistent environmental cue required (Nancy B1).** The classroom analogy gives the student 8-10 seconds of visual warning the instructor is approaching. The Ghost has none of that. A small corner icon students learn to ignore doesn't satisfy this. The design must specify a cue students cannot stop noticing after day one.

UX choice not yet made.

### 6. Feedback Loop

After each intervention, track:

- Did student dismiss immediately?
- Did student engage (click into conversation)?
- Did student make progress within next 5 min?
- Did student abandon the lab within next 10 min?

Used to:

- Adjust per-student thresholds (some students hate nudges → fire less)
- Aggregate-improve intervention voice (which phrasings led to engagement)
- Flag intervention failures for operator review (especially "abandoned after nudge")

### 7. Privacy / Consent

The Ghost is observing students. Explicit UX signaling required.

- **Always-visible indicator.** Small status: "Your instructor's AI is here" (when active).
- **Inspect what's tracked.** Settings page shows telemetry categories.
- **Opt-out flow.** Probably not for credit-bearing labs; should be for self-paced. Operator's call.
- **No external egress.** Telemetry never leaves the platform without explicit instructor-action export.

Note: this is a UX/trust decision, not a legal one. FERPA does NOT apply — Hexworth Prime is the operator's personal platform on Firebase Auth (Firestore UIDs, not Keiser institutional records). Keiser is not the data custodian. The sole-possession exception (34 CFR § 99.3) covers this posture.

### 8. Instructor Dashboard

Operator's view of what the Ghost is doing:

- **Students currently stuck.** Live feed, sorted by confidence × duration.
- **Recent interventions.** Per-student timeline. What fired, what was said, what happened next.
- **Class patterns.** If 8 of 12 students stuck on same step → content problem flag.
- **Override + take over.** Operator can pause the Ghost on a student and personally take the conversation.
- **Eval mode.** Operator marks interventions as "good nudge" / "bad nudge".

## Updated blocker priority (post-Nancy + operator review)

| # | Blocker | Status |
|---|---|---|
| 1 | **Aminos overlap** — settle relationship to existing 11 house bots | OPEN — must resolve before build |
| 2 | B4: Help Level gate on intervention generator | OPEN — architectural change to spec |
| 3 | B3: Per-lab struggle-signature map | OPEN — operator-tagged manually for v1 |
| 4 | B1: Persistent environmental cue (vs hidden corner icon) | OPEN — UX decision |
| 5 | B2: Threshold math — start at 1.0+, lower from baseline data | OPEN — math + data plan |
| 6 | Help Level 0 opt-out behavior (strict vs soft) | OPEN — policy decision |
| 7 | Latency budget SLO (detection → intervention) | OPEN — bounds model choice |
| 8 | Eval bar with downstream-progress signal | OPEN — design pending |

### Top blocker — Aminos overlap

The 11 Aminos house bots (F-53 to F-65) ARE the existing intervention layer. They speak in house voices, sit in chat, address students directly. Ghost would create a second intervention system. Decision needed BEFORE build:

- **Feed:** Ghost detects → Aminos speaks?
- **Replace:** One unified intervention layer?
- **Coexist:** Aminos = reactive chat answers; Ghost = proactive nudges?

Leaving this unresolved means building a competing system on top of unfinished infrastructure.

### Why B3 (per-lab calibration) is not deferrable

Ethics-IT EDT case rooms (eth-l11, eth-l14) require sustained thinking — 10 min on a step IS the correct behavior. Pentest CTFs expect 10+ failures as the learning mechanism. A single global threshold is uniformly miscalibrated to whatever the worst case is per lab. Per-lab struggle-signature map `{lab_id, min_expected_time_per_step, expected_failure_count_range, expected_hint_usage}` is required. Operator-tagged manually for v1 is acceptable; ML-generated later.

### Why B4 (Help Level gate) is the architectural keystone

The reactive layer's Help Level 0-5 is the structural defense against the system becoming a homework-completion service. As originally drafted, the Ghost generated nudges based on struggle signal alone, NOT the student's current Help Level state. The example "Quick check: how does this connect to the briefing's bit about port filtering?" is a Level 2 directional hint delivered unprompted to a student who may be at Level 0. Without the Help Level gate, the Ghost is a structural hole in the reactive layer's core protection. **NOT optional.**

## v2 design-debt items (logged for tracking)

- Local model quality bar unproven — 7-14B model on Arc Pro may or may not produce human-comparable intervention output consistently.
- Engagement-rate is gameable (students dismiss-click annoying nudges); need downstream-progress signal in eval.
- Aminos house bot conflict (also #1 above; design conflict + product conflict).
- Collaborative + accessibility gaps. Paired student work (one device, two students) breaks "idle = stuck" detection. Screen-reader users with auto-dismissing speech-bubble pop-ins — timer must suspend on focus.

## Open Questions (need operator answer)

1. **The intervention voice.** Does the Ghost speak in the house persona's voice, in a neutral instructor voice, or specifically in the operator's voice?

2. **Failure modes for students who hate being watched.** Some will perceive this as surveillance even with the indicator. Fully opt-out, lower intervention rate, alternative help model?

3. **Eval / quality bar.** A nudge that gets engagement but doesn't lead to learning is bad. Need downstream-progress + quality signal beyond engagement.

4. **Cost of detection across all sessions.** At platform scale (1000+ concurrent students), rules need a queue/scheduler. v1 can ignore; production can't.

5. **Conflict with reactive layer.** What happens if Ghost decides to intervene WHILE student is actively chatting with reactive AI? Need orchestration.

6. **Training data for intervention generator.** Fine-tune on operator's real classroom interventions if transcripts exist? Or prompt-engineering with curated examples? Path?

7. **Feedback-loop data retention.** "No long-term retention" claim for ring buffer conflicts with feedback loop's need to track per-student outcomes. Persistence boundary needed.

## What's NOT in this design (deliberate)

- **Cross-student observation.** Ghost watches one student at a time; class-wide patterns aggregate from individual observations, not from cross-student inference.
- **Speech / audio.** Text only.
- **External egress.** No telemetry to third-party cloud models.
- **Pre-emptive content suggestion.** Ghost does not push new content at students; it observes existing student work.

## Implementation order (if approved)

| Phase | What |
|---|---|
| v0.7.0-blockers | Resolve all 8 blockers above (design doc updates only — no code yet) |
| v0.7.0a | Telemetry stream additions (step time, click rate, re-read detection) |
| v0.7.0b | Signal detector rules + persistence boundary |
| v0.7.0c | Intervention Decision layer (debounce, cooldown, Help Level gate) |
| v0.7.0d | Intervention Generator + per-lab calibration map |
| v0.7.0e | UX surface (persistent environmental cue + non-modal pop-in) |
| v0.7.0f | Feedback Loop + Instructor Dashboard |

## Related

- `_docs/architecture/dr-hex-orchestrator.md` — reactive layer (the Ghost's complement)
- `_docs/architecture/hex-ai-tool-layer-design.md` — v0.6.0 sibling layer
- `[[ai-ghost-layer]]` (memory) — primary thread, Nancy review, operator follow-up

---

*Last Updated: 2026-05-23 · v0.7.0 design proposal — 8 blockers open before build*
