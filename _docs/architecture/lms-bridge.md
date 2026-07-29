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

## The labs problem, solved in three rungs

Grounded in verified current state: `forge-dont-anger-the-printer.html` completes CLIENT-SIDE
(ModuleProgress + addXP at :1966-1968, no server validation) -- there is nothing trustworthy to
check today, hence screenshot forensics.

1. **Completion codes (build first).** Server-validate the lab's victory (established
   honest-completion pattern: operator missions, gates). On validated completion the server mints
   a short signed code (HMAC over uid+labId+timestamp) the student pastes into the Bb assignment
   instead of uploading a screenshot. Instructor-side verifier (admin console panel) validates a
   pasted batch instantly. DESIGN CONSTRAINT (caught at scoping): `FLAG_SECRET`
   (functions/index.js:35) is per-deploy random -- completion codes need a PERSISTENT secret
   (Firestore-held or env) or every functions deploy invalidates outstanding codes.
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

No answer keys or solution docs in any export. No pretending interactive engines run inside an
LMS. No second authoring surface: exports are generated, never hand-edited (hand-edit = drift).
Export tooling is operator/instructor-facing only -- nothing student-visible ships in P1-P3
except the completion-code display on lab victory screens.
