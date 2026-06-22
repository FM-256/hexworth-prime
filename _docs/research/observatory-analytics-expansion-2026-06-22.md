# Hexworth Observatory — Analytics Expansion: Scope, Need & Implementation Plan (2026-06-22)

## TLDR
The Observatory ships with analytics that measure **navigation inside the launcher** (`house_enter`, `course_click`, `house_dwell`) but **not learning behavior or outcomes** in the actual courses. For a study about *gamification's effect on behavior and outcomes* + *CERBI behavioral analysis*, that's the doorway, not the room. The platform **already collects** the outcome/gamification data per student — it is simply **not joined** to the consented cohort. This doc captures the need, scopes the expansion, and lays out a phased plan whose highest-value, lowest-cost first step is joining the cohort to data that already exists.

Prerequisite reading: `_docs/operations/observatory-analytics-plan-2026-06-22.md` (the shipped baseline). Status: **planning — no build yet; green light required.**

---

## Part 1 — The Need (why)

### 1.1 What the study requires
The consented study is **"Gamification in Cybersecurity Training and CERBI Score Analysis"** (consent form, PI Frank Mora). Its stated aims: how gamified training influences **behavior, awareness, and decision-making**, plus **CERBI scoring and behavioral pattern discovery**. The dependent variables are therefore *learning outcomes*, *engagement depth over time*, and *behavioral signals* — not whether a student clicked a course card.

### 1.2 Current state — navigation only
The Observatory captures exactly three event types (`functions/index.js` `logObservatoryEvent`, `ALLOWED = ['house_enter','course_click','house_dwell']`), all within the launcher house. The Observatory is a **pointer/launcher** (cards redirect to courses in their home houses), so the moment a student clicks through to the real course, **tracking stops**. We can see intent ("headed toward Python for IT"), not study, completion, score, or improvement.

### 1.3 The data already exists — it is just unjoined
The platform already records, per student, the exact gamification + outcome data the study needs:

| Where | Data |
|---|---|
| `users/{uid}` (fields) | `xp`, `level`, `modulesCompleted`, `labsCompleted`, `quizzes`, `achievements`, `streak`, `ctfBoxesPwned`, `ctfFlagsCaptured`, `gamesPlayed` |
| `progress`, `projects_progress`, `signal_progress` | module/course progress |
| `quizAttempts`, `submissions`, `pfi_submissions`, `edt_submissions` | quiz/exam/lab attempts + scores |
| `game_scores`, `challenge_leaderboard`, `scores`, `leaderboards` | gamified scoring |
| `gates` (per user) | Dark Arts gate completions |

**Verified gap:** nothing joins `observatory_*` to any of it — the cohort `uid` is the natural key and no code uses it. Joining is low-cost (the data is sitting there) and high-value (it *is* the study's signal).

### 1.4 Cost of leaving the gap
Without the join, the research dataset can describe *who entered the Observatory and what they clicked toward* — but cannot answer the study's actual questions: did gamified students complete more, score higher, persist longer, behave differently? The study would launch instrumented to measure the wrong layer.

---

## Part 2 — Scope

### 2.1 In scope (priority order)
1. **Cohort ↔ outcomes join** — connect each consented (non-withdrawn) `uid` to its `users` gamification fields + progress/quiz/score data; surface per-student and per-class on the dashboard; include in export.
2. **Longitudinal & experimental-design analytics** — engagement over the study timeline (weekly trends), retention (return frequency, days-active), cohort comparison (class A vs B outcomes), and the funnel (consent → enroll → active → completed → withdrawn).
3. **Per-student drill-down + research-grade export** — a per-student profile/timeline, and an uncapped, joined CSV/JSON export of the full dataset (current dashboard + export cap at 5,000 recent events is monitoring-grade, not analysis-grade).
4. **CERBI behavioral instrumentation** — capture whatever the CERBI instrument requires. **BLOCKED on the CERBI spec** (see open questions).
5. **Smaller Observatory capture gaps** — session stitching (sessions/day-active rollups), tab/search/favorite capture, optional baseline/demographic survey at consent.

### 2.2 Out of scope (for now)
- Changing what non-Observatory houses track (we *read* their data, we don't re-instrument them).
- Real-time streaming dashboards (batch/on-demand is sufficient for research).
- Any collection of data outside the consent form's Data-Usage scope.

### 2.3 Constraints (privacy / IRB — non-negotiable)
- **Consented cohort only.** Outcome data is pulled *only* for uids with a current `observatory_enrollment`/`observatory_consent` record.
- **Withdrawal is respected and distinct from account deletion.** A study-withdrawal (`observatory_withdrawals`) means **exclude that uid from all research analytics/exports** — but it does **NOT** delete the student's own learning progress (`users`, `progress`, etc.), which is their platform data, not research data. The join must filter out withdrawn uids.
- **Admin-only.** All joined/outcome reads go through admin-gated paths (CF with admin verification; rules `isAdmin()`).
- **No new client-writable PII**; no new fields outside Data-Usage scope without IRB confirmation.

### 2.4 Open questions (need operator / IRB input)
- **CERBI instrument:** what are CERBI's required inputs (decision events? risk behaviors? awareness signals? a scoring formula)? Cannot instrument an undefined construct.
- **Study design:** is this a between-cohort comparison (which classes are control vs treatment)? Pre/post measures? That shapes the comparison analytics.
- **Baseline:** collect a pre-study survey (prior experience, demographics) at consent, or not?
- **PII scope confirmation** (carried over): roster email/displayName admin-only — confirmed in Data-Usage scope?

---

## Part 3 — Implementation Plan (proposed)

### Phase 1 — Cohort ↔ outcomes join (highest value, data already exists)
- **New admin Cloud Function `getObservatoryCohortOutcomes`** (`onCall`, admin-verified, admin SDK):
  - Loads `observatory_enrollment` (the cohort); subtracts `observatory_withdrawals`.
  - For each uid, reads `users/{uid}` gamification fields + the relevant progress/quiz/score collections.
  - Returns a per-student joined record + per-class aggregates (completion, avg score, XP/level, streak, CTF, etc.).
  - **Why a CF, not client reads:** the join spans many collections (some with stricter rules), N students × M collections is too many client round-trips, and admin-SDK server-side read is cleaner + scales. Mirrors the existing `adminGetStats`/`adminSearchUsers` pattern.
- **Dashboard:** new "Learning Outcomes" section in `_app/admin/observatory.html` consuming the CF — per-student outcomes columns + per-class outcome comparison bars.
- **Export:** extend the events CSV with the joined outcomes (or a second "outcomes" CSV).

### Phase 2 — Longitudinal / experimental-design analytics
- Derive from existing `observatory_activity` + Phase 1 outcomes:
  - **Time-series:** events/active-students per day over the study window (replace/augment the aggregate heatmap with a timeline).
  - **Retention:** distinct active-days and return frequency per uid (group `house_enter` by day).
  - **Cohort comparison:** outcomes split by `classId` (treatment vs control once design is known).
  - **Funnel:** counts at consent → enroll → first-activity → course-click → completion → withdrawal.
- Likely all computable client-side from the CF payload + activity reads at current scale; add server-side rollups only if volume demands.

### Phase 3 — Per-student drill-down + research-grade export
- Per-student profile view (click a roster row → their activity timeline + outcomes).
- **`exportObservatoryDataset` CF** — streams the FULL, uncapped, joined dataset (events + outcomes per consented uid) as CSV/JSON for analysis in R/SPSS/Python. Removes the 5,000-event display cap from the research pull.

### Phase 4 — CERBI instrumentation (BLOCKED on spec)
- Placeholder until the CERBI instrument is defined. Likely: new event subtypes and/or a derived CERBI-score computation in a CF, surfaced on the dashboard.

### Phase 5 — Smaller capture gaps
- Session stitching (sessions / days-active rollup), tab/search/favorite events, optional baseline survey at consent (gated on IRB design).

### Data model additions (proposed)
- No new student-writable collections in Phase 1–3 (reads existing data via admin SDK).
- Possible derived/cache doc `observatory_outcomes_cache/{uid}` only if on-demand joins prove slow (defer until measured).
- Phase 4/5 may add event subtypes / a baseline doc — TBD with IRB.

### Sequencing & dependencies
1. **Phase 1** — buildable now; no external dependency; biggest payoff.
2. **Phase 2** — depends on Phase 1 payload + study-design answer (control vs treatment).
3. **Phase 3** — depends on Phase 1.
4. **Phase 4** — blocked on CERBI spec.
5. **Phase 5** — independent; low priority.

---

## Position
Start with **Phase 1 (cohort ↔ outcomes join)**: it directly closes the core gap, the data already exists (so cost is low), and it unblocks Phases 2–3. Phase 4 (CERBI) proceeds in parallel *as soon as* the instrument spec is provided. Each phase ships behind Nancy + Chris gates, admin-only, withdrawal-respecting, within IRB scope.

## Next step
Decision-protocol review (Nancy) on this plan, then operator green light before building Phase 1.

---

## Nancy review (2026-06-22) — verdict BLOCK; revisions folded in

Adversarial review found the *direction* sound but two hard blockers and four must-fixes. The most important (Blocker B) corrects a real methodological error in the original Phase 1. Revisions:

### Blocker A — IRB consent scope (operator/PI decision, gates Phase 1)
The consent form says *"Interaction and performance data will be collected"* (`ObservatoryConsent.js:53`) and data is for *"academic research… CERBI"* (`:58`). Nancy's point: pulling **full, platform-wide, lifetime** outcome data — including activity in houses unrelated to the Observatory and data generated **before** the student consented — likely exceeds a reasonable IRB reading of that language. The original plan listed this as an "open question" (§2.4) but then planned to build Phase 1 anyway — a contradiction. **Resolution:** Phase 1 is HARD-GATED on explicit IRB confirmation (or a consent amendment). Combined with Blocker B's scoping below, the data pulled is much tighter and more defensible, but the PI/IRB still must sign off.

### Blocker B — attribution error → REVISED Phase 1 scope (the key change)
`users/{uid}` fields (`xp`, `level`, `modulesCompleted`, `ctfBoxesPwned`, …; `firestore.rules:36-39`) are **platform-wide lifetime accumulators**, not scoped to Observatory-routed courses or to the study window. Joining them does NOT measure "what gamification did via the Observatory" — a student with pre-existing platform XP confounds every comparison. The original §1.3 framing ("the study's signal") was wrong.
**REVISED Phase 1:** scope outcomes to **(the student's enrolled course, via `classId` → course mapping) × (after `consentedAt`)** — i.e., pull the *course-scoped* progress/quiz/score records (`progress`, `quizAttempts`, `submissions`, etc.) for the course the cohort is actually enrolled in, dated after consent. This is attributable, study-window-bounded, and far closer to the consent's "interaction and performance data." Platform-wide `users` accumulators, if used at all, are clearly labeled a **proxy with a documented attribution limitation** — never the primary measure. (Avoids inverting the whole plan to do session-stitching first.)

### Must-fix 3 — re-consent vs withdrawal tombstone (CF logic)
`withdrawFromObservatory` writes an `observatory_withdrawals/{uid}` tombstone; re-consent re-creates enrollment but never clears it. Naive "enrollment MINUS withdrawals" would wrongly drop a re-consented student. **Fix:** the cohort CF includes a uid iff enrollment exists AND (no tombstone OR `tombstone.withdrawnAt < enrollment.enrolledAt`); additionally, re-consent (`saveConsent`) should clear the tombstone. Specify the temporal test in the CF.

### Must-fix 4 — parallelize CF reads (scale cliff)
On-demand join is N students × ~13 collections. Serial `await` at 90 students (~1,200 reads) approaches the 60s CF timeout. **Fix:** Phase 1 CF MUST use `Promise.all()` / Firestore `getAll()` for per-student reads. "Defer cache until measured" is only safe with a parallel baseline.

### Must-fix 5 — data minimization (admin-SDK rule bypass)
The admin-SDK CF bypasses owner-only rules (e.g. `signal_progress`, `projects_progress`; `firestore.rules:825-834`). **Fix:** document a per-collection field whitelist — exactly which fields enter the dataset/export vs. what is merely readable. Pull the minimum the study needs.

### Sequencing challenge — CERBI-first? (operator/PI decision)
CERBI is half the study's title; building Phases 1–3's export schema before the CERBI instrument is defined risks rework. Nancy's stronger position: **unblock the CERBI spec first** (a PI/IRB conversation), then build against a known schema. Counter-point: the revised, course-scoped Phase 1 is useful regardless of CERBI and CERBI likely *adds* behavioral events rather than redefining outcome data — so Phase 1 can proceed in parallel *if* its export schema is treated as extensible. **This is a PI sequencing call.**

### Net effect on the plan
- Phase 1 is **re-scoped** (course-scoped × post-consent, not platform-wide totals) and **hard-gated on IRB sign-off**.
- CF spec gains: temporal re-consent test, parallel reads, per-collection field whitelist.
- Two decisions are escalated to the PI (you): **(1)** IRB scope confirmation for the revised, tighter join; **(2)** sequencing — CERBI-spec-first, or course-scoped Phase 1 in parallel with the CERBI conversation.

---

## Part 4 — Vision expansion: the Fishbowl + Dr. Hex (operator directive, 2026-06-22)

Operator directive: make the Observatory a **fishbowl** where *"every action is trackable, traceable, and repeatable,"* and add the **Dr. Hex** element — *"the true AI deity, the goddess of Hex,"* given her ideal home here. This raises the ceiling of the whole initiative; captured before build.

### 4.1 Fishbowl observability (by the three properties)
The Observatory is a launcher, so the fishbowl must extend INTO the cohort's courses — not just the launcher.

- **TRACKABLE** — emit events where learning happens: in-course section/page views, scroll depth, time-on-task per module, focus/blur/idle; quiz **question-level** signals (answer changes, time-per-question, retries — `QuizEngine` already records some struggle signals, currently unjoined); lab/CTF commands, **flag attempts**, errors, hint requests (`BoxEngine`); help-seeking; the full navigation graph.
- **TRACEABLE** — today events are `uid+type+timestamp` with no session grouping. Add **session IDs + stitching** and a **unified event spine** merging `observatory_activity` + `dr_hex_engagement_events` + course outcomes into one ordered per-student timeline with **causal context** (what preceded a struggle → what Dr. Hex did → what followed).
- **REPEATABLE** — the biggest gap. Either **(a) event-sourcing** (a log complete enough to deterministically reconstruct the action sequence — research-grade, tractable) or **(b) DOM-level session replay** (rrweb-style — powerful, heavy, very privacy-intense). Plus reproducible analysis (deterministic pipelines off the immutable log).

### 4.2 Dr. Hex — resident AI deity (existing infra, not yet in the Observatory)
Dr. Hex already exists: `<hex-ai-button>` (`/_lib/HexAIButton.js`, registers `window.__hexLabRecord`), orchestrator at `hex-ai.hexworth.tech` (v0.6.x, pgvector RAG, CF Access), intervention + **post-intervention outcome** logging to `dr_hex_engagement_events`, governed by the Dr. Hex Constitution / 10 Laws / Voice Guide. She is mounted on quizzes/labs/modules elsewhere but **not in the Observatory**. The Observatory is her ideal home because it is **the only consented cohort** — consent is what licenses an omniscient, conversational AI presence.

Missing, to make her shine here:
1. **Presence** — mount Dr. Hex in the Observatory + carry her into the cohort's courses. *Design decision:* relationship to **Polaris** (the north-star mascot). Proposed lore: Polaris is Dr. Hex's Observatory avatar/familiar — the fixed star is her watching.
2. **Omniscience in the fishbowl** — feed the unified event spine (4.1) into her context (she already has page-context + RAG) so she's aware of the whole journey, by name, referencing streaks/history — not just the current page.
3. **Intervention data joined to research** — join `dr_hex_engagement_events` to the cohort; every touch (when/what-she-said/response/outcome) becomes core study data: *does the deity's intervention change behavior + outcomes?* (This is the gamification effect itself.)
4. **Conversational deity** — consented students converse with her; transcripts are data (orchestrator already does chat/RAG).
5. **Experimental lever** — her presence/intensity becomes a *manipulable variable* (intervention style A vs B) directly serving the gamification study.

### 4.3 Consent ceiling (sharpens Blocker A — gates this scope)
A fishbowl this complete — session reconstruction/replay + conversation logging + an omniscient AI — is intensive surveillance. The consent gate is exactly what licenses it, BUT the current language *"interaction and performance data will be collected"* almost certainly does **not** cover session replay or AI-conversation/intervention logging. **Before this scope ships, the consent form must explicitly name:** detailed session-level tracking, session reconstruction/replay, and Dr. Hex interaction + transcript logging. This is an **IRB/consent-amendment decision** and a hard gate on Part 4.

**→ DRAFT amendment language written: `observatory-consent-amendment-draft-2026-06-22.md`** (doctoral-research-scholar drafted, engineering-verified). It honestly revises the false "anonymized/no PII" claim (the new data is identifiable to the research team, de-identified only in publication), escalates the risk disclosure, matches the live withdrawal-deletion behavior, and carries an activation checklist (bump `FORM_VERSION` → auto re-consent — only after IRB approval). Seven `[PI TO CONFIRM]` items remain (retention, access list, FERPA, minors, screen-replay scope, etc.).

### 4.4 Phases added
- **Phase 6 — Fishbowl event capture:** in-course instrumentation (quiz/lab/CTF/module), session IDs + stitching, the unified event spine. (Consent-amendment gated.)
- **Phase 7 — Repeatability:** event-sourcing (a) and/or DOM session replay (b) — choose grade vs. privacy cost. (Consent gated.)
- **Phase 8 — Dr. Hex in the Observatory:** presence + Polaris lore, fishbowl-aware context, `dr_hex_engagement_events` joined to the cohort, conversational deity, optional experimental intervention-style variable. (Consent-amendment gated; coordinates with the Dr. Hex orchestrator + Constitution.)

### 4.5 New decisions for the PI
- **Consent amendment** authorizing detailed session tracking, replay, and AI-interaction logging — yes/scope?
- **Repeatability grade:** event-sourcing (research log) vs. DOM replay (watch-the-screen) — privacy vs. fidelity.
- **Dr. Hex ↔ Polaris lore** — avatar/familiar, or distinct entities?
- **Dr. Hex as experimental variable** — is intervention-style A/B part of the study design, or is she a constant presence for all?
