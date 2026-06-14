# Analytics Silo-Bridging — Scope & Progress-Preservation Plan

| | |
|---|---|
| **Status** | Scoped — not yet built (decision pending: tactical bridge vs advance analytics-v2) |
| **Effective** | 2026-06-14 |
| **Prereq shipped** | ContentRegistry path alignment (`ala-w` + `wsa`), commit `d0579cd8f` |
| **Related** | `_docs/architecture/student-analytics-v2.md` · memory `reference_analytics_silo_architecture` |

## TLDR

Student progress lives in **three silos**; the instructor dashboard reads only **one**. We shipped a safe, config-only fix that lights up module/presentation completions for ALA + WSA (silo 1). The remaining gap — **arena labs (`flag_captures`) and quizzes (`quizScores`) never reach the dashboard** — is the "silo-bridging" work scoped here. **Recommended approach: Cloud-Function triggers that mirror those silos into the dashboard's silo, add-only.** The non-negotiable constraint is **no loss of saved user progress**; the preservation plan (below) makes progress structurally incapable of being lost — source silos are never modified, every write is additive, and any historical backfill is snapshot-backed and idempotent.

---

## 1 — Background: the three silos and the two gates

The canonical instructor dashboard is `dashboard.html` → `InstructorDashboard.js` → ContentRegistry. (`handler-dashboard.html` + `LearningPaths.PATHS` is legacy.) It computes completion = (student completions whose id is in the assigned path's modules) ÷ total.

| Silo | Firestore path | Written by | Holds | Dashboard reads |
|---|---|---|---|---|
| **1** | `classes/{c}/progress/{uid}.completions` | `ProgressManager.syncToFirestore` → `AssignmentManager.submitProgress` (two-gated) | module / presentation completions | **yes** |
| **2** | `users/{uid}/flag_captures/{boxId}_{flagId}` (per-user) | BoxEngine (server `validateFlag`/`validateAction`) | arena boxes + **ALA labs** (`ala-l01..12`, `ala-hunt1` — BoxEngine boxes under `houses/matrix/adv-linux/labs/*/index.html`) | no |
| **3** | `tenants/{t}/classes/{c}/progress/{uid}.quizScores` | `syncClassProgress` CF (`functions/index.js`) | quiz scores (incl. WSA `m01`..`m19`) | no |

A completion only reaches silo 1 if it passes both gates (`ProgressManager.js:409-442`):

- **Gate 1 (page-side):** module pages do not load ContentRegistry, so it uses a prefix heuristic — `normalize(moduleId).includes(normalize(assignedPathId))` (`:422-426`).
- **Gate 2 (dashboard-side):** `getAssignedModuleIds()` = `ContentRegistry.paths[assignedId].modules`; only matching completions are counted (`InstructorDashboard.js:957`, `:975-986`).

## 2 — What already shipped (prereq)

`ContentRegistry.paths['ala-w']` (16 presentation ids) + `['wsa']` (55 ids) — 1:1 with emitted ids. Fixes silo-1 attribution: WSA labs/presentations count retroactively (data already in silo 1 via the Gate-1 heuristic); ALA presentations count going forward. Config-only, progress-safe. Commit `d0579cd8f`.

## 3 — The remaining gap

Silos 2 and 3 are never read by the dashboard:
- **ALA labs** are BoxEngine boxes → `flag_captures` (silo 2). Invisible.
- **Quizzes** (WSA + any) → `quizScores` (silo 3, in the `tenants/...` doc, which the dashboard does not read). Invisible.

## 4 — Options

| | Approach | Pros | Cons |
|---|---|---|---|
| **H (recommended)** | CF Firestore triggers mirror `flag_captures` + `quizScores` → silo-1 completions | Centralized; reuses existing `analytics-v2.js` `onDocumentCreated` trigger infra; no per-page or dashboard edits; backfillable | Needs a box/quiz → course mapping + an idempotent historical backfill; a functions deploy |
| **U** | BoxEngine/QuizEngine write to silo 1 directly | One write path | Box ids `ala-l*` and bare quiz ids `m01` fail the Gate-1 heuristic → id/path rework across many pages (emission-adjacent, riskier) |
| **R** | Dashboard cross-reads all three silos and merges | No writes, no migration | Adds cross-collection reads to the 10k-line high-risk dashboard; `flag_captures` is per-user (awkward fan-out) |

**Recommendation: H.** On a box completion (all flags captured) or quiz pass, a trigger writes `completions[id] = {completed:true, score?}` (merge) into the student's class progress doc; a course manifest maps box/quiz ids → course; a one-time idempotent backfill mirrors history.

**Strategic note.** This is what **analytics-v2** (`_docs/architecture/student-analytics-v2.md`, "Phase 1 cleared," already trigger-based) was designed to unify. The real fork is **tactical bridge (H) now** vs **advance analytics-v2** (the durable architecture). H is the faster contained win; analytics-v2 is the long-term unification. Decide before building.

## 5 — Progress-Preservation Plan (non-negotiable)

**Core guarantee:** user progress is never the thing we change. We only ever *read* a source silo and *add* a derived completion to silo 1. Every store that holds real student progress (`flag_captures`, `quizScores`, `completions`) remains the source of truth, untouched. If everything we add were deleted, no student would lose anything.

Six mechanisms enforce this (all already in the codebase):

1. **Add-only writes (`merge:true`).** `AssignmentManager.submitProgress` (`:258-272`) deep-merges a single nested completion key — it never overwrites the `completions` map, never flips a completion to false. The only write the bridge performs is this one.
2. **Completion monotonicity.** `ProgressRestore.js` + `SyncUtils.deepMerge` (truthy-wins / `Math.max`) ensure cross-device sync only moves completion forward, never reverts.
3. **Snapshot before backfill.** The one-time historical backfill runs only after a read-only snapshot of every affected progress doc (the `functions/snapshot-prog003-affected-progress.js` pattern) — the restore point.
4. **Idempotent by construction.** A completion is boolean-true; re-running a trigger or the backfill yields the same write. Safe to re-run; no double-count, no corruption.
5. **No emission changes, no key renames.** The bridge changes nothing about what pages save or how keys are named. If a future cleanup ever needs a rename (bare `m01` quiz ids, `quizquiz`), it uses `ModuleProgress.migrateLegacyKey` + a **server-side** migration first (to avoid the documented `syncBidirectional` ping-pong) — but the bridge itself never requires it.
6. **Ongoing capture undisturbed.** Students keep saving via the same paths (`ModuleProgress.complete`, BoxEngine `flag_captures`, QuizEngine). The bridge sits on top; the save flow is unaltered, so there is no window where new progress stops being recorded.

**Operational playbook (build order):**

1. Build the trigger/mirror logic; verify on a throwaway **test class** with synthetic students — confirm completions appear and source silos are byte-for-byte unchanged.
2. **Snapshot** production progress (restore point).
3. Deploy behind the Nancy → Chris gate.
4. Run the **idempotent backfill**; reconcile counts against the snapshot.
5. **Reversible:** triggers can be disabled and mirrored completions removed without touching any source silo (the mirror is purely additive).

**Worst case** is a missing *derived* count — fixed by re-running the idempotent, snapshot-backed backfill. Saved progress itself is structurally protected: data only ever flows source → (read) → additive mirror.

## 6 — Open decisions

1. **Tactical bridge (H) vs advance analytics-v2** — which path.
2. **Course-manifest shape for non-module items** — how box ids (`ala-l*`) and quiz ids (`m01`..`m19`) map to a course (extend the ContentRegistry path `.modules`, or a separate map).
3. **Quiz id cleanup** — leave bare `m01` (works once bridged) or namespace them (`cloud-wsa-m01-quiz`) via a guarded migration. Not required for bridging.
