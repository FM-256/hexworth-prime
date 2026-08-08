# User Transcript and Skill Anchoring

**Status: scoped, not built.** Taskboard **#300** (transcript) and **#301** (extraction).
Opened 2026-08-08.

> **The full scoping documents live OUTSIDE this repo**, at
> `~/hexworth-shared/User-History/`. This page exists so the work is discoverable from the
> platform side and so the measured findings about *this* codebase are version controlled,
> because `hexworth-shared` is Syncthing-replicated, not git-tracked.
>
> | Doc | Covers |
> |---|---|
> | `User-History/README.md` | index and headline |
> | `User-History/00-measured-current-state.md` | where a student's record actually lives, with `file:line` citations |
> | `User-History/01-user-transcript-scope.md` | #300, the college-style transcript |
> | `User-History/02-transcript-extraction-scope.md` | #301, getting it out and proving deletion |
> | `User-History/03-skill-anchoring-and-badges.md` | #300 Part B, how a skill claim gets pinned |

## What this is

A transcript in the **academic** sense: completed courses and proven skills, in a document a
student can hand to an employer, with the platform standing behind both. It is not an
activity log and not a chat transcript.

It came out of a Trial Run question ("how does a user extract their record?") that found
working export endpoints with no way for a user to reach them after a page refresh, and the
same hole in larger form on the platform itself.

## Measured findings about this codebase, 2026-08-08

All measured by reading the tree. Re-verify before relying on any of them; the counts move.

### The primary student record is localStorage, and remote sync is fail-silent

`_app/components/ModuleProgress.js` calls itself the single source of truth for completion
(`:6`), is loaded by **3,909** pages and called by **2,870**, writes to localStorage
(`:32-34`), and syncs to three remote destinations that are "all non-blocking, fail-silent"
(`:16-19`). So the authoritative copy is on the device and the server copy cannot be assumed
complete.

### There is no course-completion fact and no grade anywhere

- `_app/components/CourseProgress.js` is localStorage-only (`:20`, `:27`), computes a
  percentage (`:95`), persists nothing server-side, and is loaded by **1** page.
- `gradebook`, `finalGrade`, `letterGrade`, `gpa`/`GPA`: **zero hits** across `functions/`
  and `_app/tenant/`.
- No credit or contact-hour model exists.

### `item.attempt` is a schema with no producer and no consumer

| event | schema | client emits | server projects |
|---|---|---|---|
| `item.start` | yes | internally, `AnalyticsEvents.js:292` | `analytics-v2.js:367` |
| `item.complete` | yes | **no caller in `_app/`** | `analytics-v2.js:381` |
| `item.attempt` | yes | **no** | **no branch; `attemptNumber` 0 hits in that file** |

`AnalyticsEvents.js` is loaded by exactly one page, `_app/tenant/instructor.html`, which is an
**instructor** page. The projection path is `tenants/{tid}/classes/{cid}/progress/{uid}/itemState/{itemId}`,
so it is tenant-and-class scoped even when it does run.

**Consequence beyond analytics:** Trial Run's evidence contract
(`~/hexworth-shared/carreer_launchpad/TRIAL_RUN_BUILD_SPEC.md:141-148`) calls Tier A
"platform-emittable today" and rests persistence claims on `attemptNumber` and
`totalSessions`. Neither has production data behind it, so **M4 as written cannot be run
literally**. Its corpus can still be assembled from `users/{uid}/quiz_attempts` and the other
server-side stores.

### The skill model exists, is good, and is partly provable already

`_app/lab-skill-maps/*.yaml` (**34** files) declare per lab a primary and secondary skill,
a cognitive `layer`, an `evidence_required` rule stating what counts as proof, and an
`assessed_artifact`. Artifact types: **26 flag**, 6 written-explanation, 2 command.

Flags land server-side in `users/{uid}/flag_captures` (`functions/ctf-stats.js:50`,
`functions/account-merge.js:216`), so **skill attainment is already server-provable for
roughly 26 labs with no new telemetry.**

The four-layer ladder, from `_docs/operations/dr-hex-lab-skill-map.md:60-63`:

| Layer | The student can... | Count across the 34 maps |
|---|---|---|
| Recognition | explain why an input, system or output is suspicious | 27 |
| Hypothesis | state what they expect before running the action | 14 |
| Execution | craft, adjust and sequence the actual operation | 21 |
| Transfer | explain why X solves the *class* of problem | 3 |

These were authored to gate how much help Dr. Hex may give. They happen to be exactly the
shape a defensible skill claim needs.

### Coverage is the real project

| | count |
|---|---|
| `*.lab.html` in the tree | 810 |
| with a skill map | 34 |
| skill-map labs assessed by flag (server-provable) | 26 |
| labs carrying a MITRE ATT&CK technique ID | 26 |
| **labs with both a technique ID and a skill map** | **2** |
| distinct ATT&CK technique IDs anywhere in `_app/` | 316 |

The taxonomy is sound and almost nothing is built. The work is authoring coverage, not
designing a model.

## The design position

**Anchor on two axes. Badges are the wrapper, not the anchor.**

- **WHAT** (topic): MITRE ATT&CK technique ID, or a cert exam objective. External, closed
  vocabulary, machine-validatable, and it bounds the claim by construction.
- **HOW DEEP** (cognitive layer): Recognition / Hypothesis / Execution / Transfer. **This is
  the anti-overclaim mechanism.** "Recognition of T1003.001" and "Execution of T1003.001" are
  different claims and both are honest. "Credential Access" is neither.
- **PROOF**: the skill map's `evidence_required`.
- **ROLL-UP**: NICE Framework work role, proposed, not present today.

A badge is a claim engineered to travel without its evidence, which is precisely the failure
Trial Run exists to catch. The rule that makes badges safe:

> **A badge is non-detachable from its evidence and its layer.** Anything that renders the
> badge renders what it required and how deep the claim goes.

Local precedent for the risk: taskboard **#261 / BUG-073** records 127
`AchievementManager.unlock()` calls naming ids that do not exist against 116 defined. Badge
sprawl has already happened once here. The transcript must keep a hard separation from the XP
and achievement economy: that is a motivation system, this is an evidence system.

## Constraints found by search, not assumed

- **Dr. Hex conversations are out of scope as a source.** "No transcript export. No 'save
  this conversation' affordance" is a deliberate decision at
  `_docs/architecture/hex-ai-conversation-memory-design.md:194`, paired with a 30-minute
  memory lifetime.
- **Research data is deleted on withdrawal and explicitly never returned.**
  `_docs/research/observatory-consent-amendment-draft-2026-06-22.md` tells participants data
  "cannot be recovered or returned to you", and carries an open `[PI TO CONFIRM]` asking
  whether any export survives deletion. **A transcript is exactly such an export**, so the
  boundary between platform record and research record must be settled before build.
- Trial Run spec §13.3 is the same question in miniature and is already open.

## Decisions fixed now because they are expensive later

1. **Stamp at time of earning, with versions** (ATT&CK version, skill map version,
   requirement set). Otherwise updating a lab silently rewrites history, and live-computed
   completion retroactively un-completes every graduate when a course gains a module.
2. **Expiry**, or at minimum an "as at" date.
3. **Coarse badges, fine evidence.** Per-technique badges yield hundreds of meaningless
   tokens.
4. **Never award a layer the lab did not assess.**
5. **State coverage on the document.** A student who did 40 labs and sees 3 skills will not
   infer "we only show flag-proven work".

## Open, and genuinely the operator's

1. What counts as a course: syllabus-coded (75+ Keiser Master Syllabi exist as `.docx`), cert
   track, platform course, or tenant class.
2. What "completed" means, and whether grades are reported at all.
3. Badge granularity. Recommendation: work-role level, coarse.
4. Do badges expire.
5. External anchor commitment, and whether NICE roll-up is in scope now.
6. Coverage sequencing: ship the 2 fully anchored labs, ship the 26 flag-proven ones without
   external anchoring, or author coverage first.
