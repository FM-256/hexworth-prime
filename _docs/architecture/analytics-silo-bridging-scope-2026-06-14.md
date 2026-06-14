# Tenant-Class Analytics — Diagnosis, Measurement Model & Fix Scope

| | |
|---|---|
| **Status** | Explored + measurement model CONFIRMED — not yet built (no code changed) |
| **Effective** | 2026-06-14 |
| **Scope driver** | 2 live classes in the `summer-2026` tenant (WSA, ALA) whose instructor analytics read blank |
| **Prereq shipped** | ContentRegistry path alignment (`ala-w` + `wsa`), commit `d0579cd8f` — see note in §7 |
| **Related** | `_docs/architecture/student-analytics-v2.md` · memory `reference_analytics_silo_architecture` |

## TLDR

The instructor analytics in the **tenant instructor area** (`dashboard.html` → `InstructorDashboard.js`) read blank for the live `summer-2026` WSA and ALA classes. Root cause: **the dashboard reads the wrong document, the wrong field, and depends on assignments that aren't used.** Student progress *is* saved (34 ALA / 17 WSA students) — in `tenants/{t}/classes/{c}/progress` as `modulesCompleted`/`quizScores` — but the dashboard reads top-level `classes/{c}/progress.completions` (empty) and short-circuits when a class has no assignments. This is **universal across all tenants**, not ALA/WSA-specific. The fix is **read-side only**: read the tenant-nested doc, compute a % from `modulesCompleted` + passed `quizScores` against a `courseId → module-list` manifest derived from the course hub. **Zero progress writes** (labs, a third silo, are a deferred add-only follow-on). The measurement model is confirmed in §3.

---

## 1 — Root cause

The canonical instructor view is `dashboard.html` → `InstructorDashboard.js` (TenantShell opens `/dashboard.html`). It computes per-student completion = (completions matching assigned module ids) ÷ (assignment module count).

Three independent breakers, all in that view:

1. **Wrong document.** `AssignmentManager.getClassProgress` reads top-level `classes/{c}/progress` (`AssignmentManager.js:302`). The live data is **tenant-nested** at `tenants/{t}/classes/{c}/progress` — top-level is empty for every tenant class.
2. **Wrong field/schema.** The dashboard reads `studentData.completions{}` (`InstructorDashboard.js:975, 983`). Tenant docs hold `modulesCompleted[]` / `quizScores{}` / `labsCompleted[]` (written by the `syncClassProgress` CF) — there is no `completions` map.
3. **Assignment dependency.** `updateCompletionStats` short-circuits to `--` when `classAssignments.length === 0` (`:1150`), and `getAssignedModuleIds`/`getTotalModuleCount` derive everything from assignments (`:940-983`). The live classes use no assignments.

Three progress silos exist; the dashboard reads only silo 1 (which is empty for tenant classes):

| Silo | Path | Holds | Dashboard reads |
|---|---|---|---|
| 1 | `classes/{c}/progress.completions` (top-level) | (empty for tenant classes) | yes |
| 2 | `users/{uid}/flag_captures/{boxId}_{flagId}` | arena boxes + **ALA labs** | no |
| 3 | `tenants/{t}/classes/{c}/progress` (`modulesCompleted`/`quizScores`/`labsCompleted`) | **the real per-class progress** | no |

## 2 — Exploration findings

- **#1 Universal.** Every tenant (`summer-2026`, `infosecethics-may-2026`, `python-april-2026`, `test-x`, `keiser-university`, `faculty-testing-primus`, `dr-norfleet`) shows the same pattern: real progress tenant-nested as `modulesCompleted`/`quizScores`; top-level `completions` = 0; mostly no assignments. Even the 44-student `ethics-it` class (which has 1 assignment) is invisible. So the tenant-instructor analytics view has never surfaced tenant-class progress.
- **#2 What the instructor sees today.** Enrolled count is correct (roster loads from `ClassManager.getClassMembers`, `:875`). The roster lists students (names/emails). But every student's Progress shows **0%** (`calculateStudentProgress` reads the empty top-level `completions`, `:914/975`), and the aggregate shows **`Completion = --`, `Labs = 0`, `At-Risk = 0`** (the `classAssignments.length===0` short-circuit, `:1150`).
- **#5 Schema (what's populated).** Per-student tenant doc fields: `modulesCompleted[]` (**primary signal** — ALA avg 1.2/max 10; WSA avg 0.1), `quizScores{}` (**secondary** — ALA `ala-w1-quiz` ~13/34), `lastActive`, `enrolledAt`, identity fields. **Empty/unused:** `labsCompleted` (labs are in silo 2), `chaptersCompleted`, `currentChapter` (all = 1), `totalTimeSpent` (all = 0).
- **#4 Denominator.** The authoritative course module set is the **course hub** — `houses/matrix/adv-linux/index.html` (~54 ids) and `houses/cloud/modules/wsa/index.html` (~57 ids). Its ids match what students save (`ala-r1..r5`, `ala-w1-cli`, `ala-w1-quiz`, `cloud-wsa-m*`, `wsa-m*-pres`). ContentRegistry `ala-w` (16) is a subset; LearningPaths diverges. The hub denominator includes labs (`ala-l01..12`), which live in silo 2 — so labs must be excluded from the % denominator (or bridged) to keep 100% reachable.

## 3 — Measurement model (CONFIRMED 2026-06-14)

- **Component complete** if it's in `modulesCompleted`, **or** it's a quiz with `quizScores[id] >= 70`.
- **Per-student %** = complete components ÷ **course non-lab components** (denominator = a `courseId → module-list` manifest derived from the hub, labs excluded).
- **Display:** Modules X/Y (headline %) · Quizzes A/B passed + avg score · **Labs = separate "pending"** (delivered later via the silo-2 bridge).
- **Quizzes:** counted in the % *and* shown separately. **Labs:** deferred. **Pass threshold:** 70%.
- **Numerator source:** `modulesCompleted` + `quizScores` from the tenant-nested doc (both already populated).
- **Implementation is read-side only** for modules+quizzes → zero progress writes.

## 4 — Blast radius (`InstructorDashboard.js`, 4,128 lines)

Contained to ~6 functions in one feature path; the large Arena/CTF analytics block is a separate concern.

| Function | Lines | Change |
|---|---|---|
| `loadClassProgress` → `getClassProgress` | 1123-1137 (+ `AssignmentManager.js:302`) | read **tenant-nested** progress |
| `calculateStudentProgress` | 973-987 | count `modulesCompleted` + passed `quizScores` ÷ courseId manifest |
| `getTotalModuleCount` / `getAssignedModuleIds` / `getAssignmentModuleCount` | 940-983 | courseId-manifest-derived denominator |
| `updateCompletionStats` | 1141-1185 | drop the `classAssignments.length===0` short-circuit; compute from model |
| `renderAnalytics` charts | 1235-1489 | recompute; the **assignment chart** has no data for assignment-less classes (hide/repurpose) |
| `showStudentDetail` | 2292-2313 | same model rework |
| `renderRoster` badge | 915 | works once `calculateStudentProgress` is fixed |

**Trap — two different `completions`:** lines **1593-2024** build `studentMap[uid].completions[boxId]` from **Arena flag activity** (`arenaActivity`), not the progress-doc `completions`. That is a **separate feature; out of scope** — the module-model change must not touch it.

**Lowest-risk shape:** add a **courseId-driven branch** that activates when a class has no assignments (read tenant-nested, compute against the hub manifest), leaving the existing assignment path intact for assignment-using classes. Additive, not a rewrite.

**New data needed:** a `courseId → module-list` manifest (from the hub) for `wsa` and `adv-linux`, labs excluded.

## 5 — Progress-preservation plan (non-negotiable)

**Core guarantee:** data only ever flows **source → (read) → display**. For modules+quizzes the fix performs **no writes at all** — it reads already-saved `modulesCompleted`/`quizScores` and computes a number. The deferred labs piece is the only write, and it is **add-only**. Mechanisms (all in-codebase):

1. **Modules+quizzes view: zero writes.** Pure read/compute; no progress doc is written.
2. **Add-only writes (`merge:true`)** — only relevant to the labs bridge (`AssignmentManager.submitProgress:258-272` deep-merges one key; never overwrites/reverts).
3. **Completion monotonicity** — `ProgressRestore.js` + `SyncUtils.deepMerge` keep completion moving only forward.
4. **Snapshot before any backfill** — `functions/snapshot-prog003-affected-progress.js` pattern (restore point).
5. **Idempotent** — re-runnable triggers/backfill; no double-count.
6. **No emission changes, no key renames** — students keep saving via the same paths; the save flow is untouched.

## 6 — Labs (deferred silo-2 bridge)

Labs (`ala-l01..12`, arena boxes) live in `users/{uid}/flag_captures` (per-user), not the per-class doc. Surfacing them is a separate, add-only effort. Options (recommend **H**):

| | Approach | Pros | Cons |
|---|---|---|---|
| **H** | CF trigger mirrors `flag_captures` → per-class progress (add-only) | reuses `analytics-v2.js` trigger infra; backfillable; no per-page edits | box→course mapping + idempotent backfill; functions deploy |
| **U** | Box completion writes to the class doc client-side | one write path | box ids fail the page heuristic; per-page rework |
| **R** | Dashboard cross-reads `flag_captures` | no writes | per-user fan-out; reads in the large dashboard file |

Strategic note: this overlaps with **analytics-v2** (`student-analytics-v2.md`, trigger-based, "Phase 1 cleared"). Fork: tactical bridge (H) vs advance analytics-v2.

## 7 — Notes & open items

- **The shipped registry fix (`d0579cd8f`, paths `ala-w`/`wsa`) is INERT for these tenant classes** — it serves the assignment+`completions` pipeline, which tenant classes don't use. It is additive/progress-safe (leave it, or back it out — no effect on the tenant-class fix).
- **Open:** build the `courseId → module-list` manifest (hub-derived) for `wsa` + `adv-linux`; decide assignment-chart handling for assignment-less classes; then implement the courseId branch through the Nancy → Chris gate; deploy; read-only verify against the 2 live classes.
