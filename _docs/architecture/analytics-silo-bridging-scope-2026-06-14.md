# Tenant-Class Analytics — State, Verdict & Resume Doc

| | |
|---|---|
| **Status** | Fully diagnosed · model confirmed · right component identified · **NOT YET BUILT** (no code changed to the tenant system) |
| **Updated** | 2026-06-14 |
| **Verdict** | **Fixable** — contained, read/compute-only fix in one file; progress guaranteed safe |
| **Related** | `student-analytics-v2.md` · memory `reference_analytics_silo_architecture` |

## VERDICT (read this first)
Student progress **is saved and safe** (51 students). Analytics are blank due to a **compute gap in one component**, not lost data or a read-path problem. **Fixable**, low-risk, read/compute-only for modules+quizzes.

## ELEVATED REQUIREMENT (operator, 2026-06-14): TRACK ALL CONTENT
The fix must surface **all content types**, not just modules+quizzes. Two dimensions:
- **Measure:** include modules + quizzes **+ labs**. Labs live in silo 2 (`users/{uid}/flag_captures`) → the labs bridge is **NO LONGER deferrable**; it's required for full tracking (else lab progress stays invisible).
- **Capture (audit):** verify every content type each course uses actually emits a saved completion. Known gaps to audit: uneven module wiring (some WSA presentations emit nothing — 2 id formats `cloud-wsa-m*-presentation` vs `wsa-m*-pres`), `labsCompleted`/`chaptersCompleted`/`totalTimeSpent` unused. Catch any content that silently emits nothing.
This changes the build from "modules+quizzes now, labs later" to "all-content tracking." The labs bridge (silo 2 → surfaced in `instructor.html`) is in-scope. Bridge stays **add-only / progress-safe** (see §Progress Safety).

## THE 2 LIVE CLASSES (the whole reason for this work)
Tenant `summer-2026`, instructorUid `PjfqXptQ6sdLJbgPHr6DB2geZ5y2`:
- WSA — `tenants/summer-2026/classes/87KLCXr9hYSgdIKNuqXE`, `courseId=wsa`, 17 students
- ALA — `tenants/summer-2026/classes/ujIeZwa0KAb4x3Um7LUn`, `courseId=adv-linux`, 34 students

Both have real saved progress (verified via prod read) in their tenant-nested `progress/{uid}` docs as **`modulesCompleted[]` + `quizScores{}`** (e.g. ALA: `ala-w1-cli`×11, `ala-w1-quiz`×13, `ala-r1`×7). Empty/unused: `labsCompleted`, `chaptersCompleted`, `currentChapter`(=1), `totalTimeSpent`(=0).

## ROOT CAUSE — two parallel, incompatible class systems
| | Handler/top-level system | **Tenant system (the live classes)** |
|---|---|---|
| Location | `classes/{c}` | `tenants/{t}/classes/{c}` |
| Owner field | `handlerUid` | **`instructorUid`** |
| Class code | `classCode` | `joinCode` |
| Progress field | `completions{}` | **`modulesCompleted[]` / `quizScores{}`** |
| Served by | `ClassManager` / `AssignmentManager` (top-level reads only) | **Cloud Functions** `getStudentProgress`, `getAssignments`, `getTenantConfig` |
| Client view | `InstructorDashboard.js`, `handler-dashboard.js` | **`_app/tenant/instructor.html`** |

The summer classes live ENTIRELY in the tenant system.

## RIGHT COMPONENT + why blank
- **The view the instructor opens = `_app/tenant/instructor.html`** (4199 lines). It calls `getStudentProgress` (CF `functions/index.js:3935`) which **correctly reads `tenants/.../classes/{c}/progress` and returns raw `modulesCompleted`/`quizScores`** (CF lines 35/49). Also calls `getAssignments` (CF `:3771`).
- **THE READ IS CORRECT.** The CF returns raw data; `instructor.html` computes completion **client-side** (~lines 1415-1561, 1709-1749, ref `courseId` at :11/:1749).
- **Why blank:** it computes completion **against assignments** (your classes have none) and/or has **no `courseId → modules` denominator** → 0/`--`. A compute/display gap, NOT a data or read gap.

## CONFIRMED MEASUREMENT MODEL (locked 2026-06-14)
- Component **complete** if in `modulesCompleted`, OR a quiz with `quizScores[id] >= 70`.
- **% = complete ÷ course non-lab components** (denominator from a `courseId → module-list` manifest).
- Display: Modules X/Y (headline %) · Quizzes A/B passed + avg · **Labs separate "pending"** (silo-3 bridge, deferred).
- Quizzes counted in % AND shown separately. Pass threshold 70%.

## DENOMINATOR SOURCE (#4)
The **course hub** is authoritative and matches saved ids: `houses/matrix/adv-linux/index.html` (~54 ids) and `houses/cloud/modules/wsa/index.html` (~57 ids). ContentRegistry `ala-w`(16) is a subset; LearningPaths diverges. Hub includes labs (`ala-l01..12`) which live in a different silo → exclude from the % denominator. NOTE: completion ids are emitted via several mechanisms (incl. `ModuleProgress.complete(VAR, VAR)` with variables on review pages like `ala-r1.html:452`), so grepping literal args is unreliable — derive the manifest from the hub.

## THE THREE PROGRESS SILOS
1. `classes/{c}/progress.completions` (top-level) — handler system; EMPTY for tenant classes.
2. `users/{uid}/flag_captures/{boxId}_{flagId}` (per-user) — arena boxes + **ALA labs** (`ala-l01..12` are BoxEngine boxes). Deferred bridge.
3. `tenants/{t}/classes/{c}/progress` (`modulesCompleted`/`quizScores`) — **the live per-class progress** (what `getStudentProgress` reads).

## THE FIX (scoped, not built)
In `_app/tenant/instructor.html`: replace the assignment-based completion computation with the confirmed model, computing from the `modulesCompleted`/`quizScores` that `getStudentProgress` already returns, against a `courseId → module-list` manifest (hub-derived; `wsa`, `adv-linux`; labs excluded). **No read change** (CF already correct). **Read/compute only → zero progress writes → progress-safe.** Then Nancy → Chris → deploy → read-only verify the 2 classes.

## PROGRESS SAFETY (operator's hard gate — locked)
Data flows source → (read) → display. The fix performs **no writes**. The deferred labs bridge would be **add-only** (`submitProgress` merge:true; `ProgressRestore` completion-monotonic; `snapshot-prog003` backup; idempotent). Verified: nothing prunes/reverts progress.

## WHAT WE SHIPPED (and its real status)
- `d0579cd8f` — ContentRegistry paths `ala-w`(16) + `wsa`(55). These serve the **handler system** (InstructorDashboard/assignments), which does NOT run the tenant classes → **INERT for the summer classes** (harmless; leave or back out).
- Commits `f27b9a8a6`/`bb5bfc93b`/`e1e1870ed`/`4b95fdb32`/`1a84668bf` = the Dr. Hex mood-ring work (separate, shipped, live).

## RULED OUT (wrong components — don't re-investigate)
`InstructorDashboard.js`, `handler-dashboard.js`, `AssignmentManager`, `ClassManager` — all the top-level handler system; cannot see tenant classes (query `handlerUid` on top-level `classes`; tenant classes have `instructorUid` + are tenant-nested).

## RESUME — how to continue in a fresh session
1. Re-read this doc + memory `reference_analytics_silo_architecture`.
2. Read `_app/tenant/instructor.html` completion-compute (~1415-1561, 1709-1749) — confirm the assignment-dependency / missing-denominator.
3. Build the `courseId → modules` manifest from the two hubs (labs excluded).
4. Apply the model in `instructor.html`; Nancy → Chris → `./deploy.sh`.
5. Verify read-only against the 2 classes via `getStudentProgress` or a prod read.

**Prod read capability:** ADC present (`~/.config/gcloud/application_default_credentials.json`), project `hexworth-prime`, `firebase-admin` in `functions/node_modules`. Run read-only diagnostics with `NODE_PATH="$PWD/node_modules" node script.js` from `functions/`, `admin.initializeApp({projectId:'hexworth-prime'})`. Reads allowed per CLAUDE.md Rule #10 (no writes); print ids/counts only, never student PII.
