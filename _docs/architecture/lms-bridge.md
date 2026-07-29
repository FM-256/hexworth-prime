# LMS Bridge -- Hexworth content and grades into Blackboard / Canvas

**Status:** SCOPE -- awaiting Nancy design review, then Frank ruling on phase order.
**Origin:** 2026-07-29. Frank shipped the A+ Core 1 final to Blackboard Ultra via the one-off
`_tools/blackboard-export/` builder, then named the real workflow pain: he links Hexworth labs
inside Bb assignments ("Don't Anger the Printer"), students upload screenshots as proof, he
hand-checks every one, and Bb cannot auto-grade any of it.

## Thesis

Hexworth stays the single source of truth (authoring, QC, server-side validation). The LMS is a
delivery shell we EXPORT to and, eventually, push grades INTO. Nothing is authored twice; keys
never leave the platform; drift is impossible because every export is generated from the same
banks the platform serves.

## What exports cleanly vs what does not (honest table)

| Content type | Export path | Reality |
|---|---|---|
| Quizzes / exams (MC etc.) | QTI 2.1 (Bb Ultra), QTI 1.2/2.x (Canvas), tab-TXT backup | PROVEN today (A+ final). Generalize: any server-graded quiz id -> package |
| Content pages (chapters, slides) | Common Cartridge (IMSCC) of chrome-stripped HTML | Good fit; requires a stripping pass (AccessGuard, house nav, progress JS must not ship) |
| Labs / games / engines | DO NOT CONVERT. Link-out now; LTI 1.3 launch + grade passback later | A lab is a live container + engine; "uploading" it is a lie. The link is the product |
| Answer keys / solutions | NEVER exported | Policy line, non-negotiable |

## Nancy design review 2026-07-29 -- PAUSE conditions, all folded in below

Her seven conditions reshaped this doc: identity-binding is a hard requirement; codes are
Firestore-record-backed, not stateless; the secret uses `defineSecret`; the server-validation gap
is stated plainly instead of implied solved; a roster-only P0 is a real candidate pending ONE
Frank answer; the keys policy is split into precise lines; and the toolchain gets `git add -f`
(her audit also found `_tools/blackboard-export/` -- the builder behind the SHIPPED A+ final --
was never git-tracked at all; fixed same day).

**THE QUESTION THAT DECIDES P1's SHAPE (Frank):** does Blackboard Ultra's assignment need a
student-submitted artifact for your gradebook/records workflow (or Keiser policy), or can you
grade straight off an instructor-only roster grid with NO student paste step? If roster-only is
acceptable, the entire completion-code subsystem (mint, display, transcribe, verify, revoke) is
unnecessary complexity for P1 and rung 2 alone ships first. Codes only earn their keep if Bb
must hold a per-student artifact.

## The labs problem, solved in three rungs

Grounded in verified current state: `forge-dont-anger-the-printer.html` completes CLIENT-SIDE
(ModuleProgress + addXP at :1966-1968, no server validation) -- there is nothing trustworthy to
check today, hence screenshot forensics.

1. **Completion codes (IF Frank's answer above requires a student artifact).** On completion the
   server writes a **Firestore record** (uid, labId, timestamp, status) and mints a short code
   signed via **`defineSecret`** (the `SEXTANT_PEPPER` precedent in functions/index.js -- NOT a
   Firestore-held secret, NOT the per-deploy-random `FLAG_SECRET`). Verification looks up the
   RECORD (revocation = flip one record's status, the invite-code pattern at
   functions/index.js:2392; never secret rotation, whose blast radius is every outstanding code).
   **HARD REQUIREMENT (Nancy): the verifier's output displays the BOUND IDENTITY** (name / email /
   studentId), never bare valid/invalid -- codes are plain text and students can share them; the
   instructor cross-checks the shown identity against the submitting student, or the check is
   theater. **HONEST SCOPE (Nancy): rung 1 proves IDENTITY + CLAIM, not honest play.** The
   printer lab's win state is pure client JS; its `addXP` callable is a BUG-044-class rubber
   stamp. True play-validation is per-lab engine work: start with labs that already produce a
   server-checkable artifact (the `validateFlag` pattern, functions/index.js:198); client-only
   arcade games need engine redesign to emit an artifact at all, priced separately. Codes still
   beat screenshots, which prove neither identity nor play.
2. **Roster panel (build with 1).** Completions are server-recorded per uid; user docs carry
   email + studentId. Instructor panel: class roster x lab x verified-completion timestamp. The
   student upload ritual disappears entirely; Frank reads the grid into the Bb gradebook.
3. **LTI 1.3 + AGS grade passback (endgame, own project).** Bb launches the lab as an LTI tool;
   the server-validated score posts back to the Bb gradebook automatically. HONEST BLOCKER:
   registering an LTI tool in Keiser's Blackboard requires their LMS ADMIN, not faculty access.
   Frank starts that conversation in parallel; we do not build LTI until the registration path
   is real. Security-sensitive (OIDC, JWKS, deployment ids) -- gets its own design + Nancy arc.

## File structure (created 2026-07-29)

Repo toolchain (`_tools/lms-export/`):
```
_tools/lms-export/
  README.md                 what lives here, formats, policy lines
  bb-ultra/                 Blackboard Ultra generators (QTI 2.1 + tab-TXT)
  canvas/                   Canvas generators (QTI for New Quizzes; Common Cartridge)
  common-cartridge/         IMSCC content-page packager + chrome-stripper
  completion-codes/         mint/verify tooling (phase 1 of the labs ladder)
  _shared/                  format-agnostic extraction: quiz banks -> neutral JSON
```
(`_tools/blackboard-export/` stays as-is: the shipped A+ final's deterministic builder is a
frozen artifact; the general toolchain supersedes it without rewriting history.)

Deliverables share (`~/hexworth-shared/Blackboard/`):
```
Blackboard/
  README.md                 how Frank uses this folder
  aplus-core1-final/        (existing) the shipped final + keys + STATUS
  packages/<course>/        future generated upload packages, one dir per course
  completion-codes/         verifier outputs / batch results for grading sessions
```

## Phases for Frank's ruling

- **P1 (recommended first): labs ladder rungs 1+2** -- printer-lab server validation +
  persistent-secret completion codes + verifier + roster panel. Kills the screenshot workflow.
- **P2: quiz/exam exporter generalization** -- any server-graded quiz -> Bb Ultra package via
  admin-console export panel (Canvas flag alongside).
- **P3: content pages via Common Cartridge** w/ chrome-stripping.
- **P4: LTI 1.3** -- contingent on Keiser IT registration path.

## Non-goals / policy

Keys policy, split precisely (Nancy: the old single line contradicted both existing practice and
QTI mechanics):
1. Solution DOCUMENTS and answer-key files never ship inside anything a STUDENT can access.
2. QTI packages necessarily embed correct-answer fields -- that is the LMS's grading data,
   delivered only into the instructor-controlled import. Permitted and unavoidable.
3. The instructor shared folder (`~/hexworth-shared/Blackboard/`) carries keys BY DESIGN for
   Frank's eyes; that is existing practice, not a violation.

Also: rung 2's roster panel must read a NEW server-recorded completion event (admin-SDK-write-only,
the gates-subcollection pattern) -- `labsCompleted`/`modulesCompleted` are in the CLIENT-writable
whitelist (firestore.rules:34-36) and a roster built on them would be console-forgeable, worse
than screenshots. No pretending interactive engines run inside an LMS. No second authoring
surface: exports are generated, never hand-edited. Export tooling is operator/instructor-facing
only. TOOLING NOTE: everything under `_tools/` requires `git add -f` (repo gitignore); the
blackboard-export builder behind the shipped A+ final was untracked until Nancy's audit caught it.
