# Sandbox Day-One QC Audit and Fixes (2026-07-09)

## TLDR

Operator bar: "a person starting on day one can keep up, complete it, and learn
something in the process." Triple audit (pedagogy across all 18 missions, a
real-container walkthrough of missions 1-3 using only student-visible material,
and a UI-surfaces review) found one BLOCKER, six MAJORs, and six MINORs.
Phase 1+2 fixes shipped (this doc); Phase 3 items are operator-held design
calls tracked in sprint-master.

## Method

- Pedagogy audit: all 18 mission.json + solution.sh + field guides, day-one
  beginner persona, forward-reference/difficulty/hidden-task-fairness lenses.
- Functional walkthrough: throwaway container on bc1, missions 1-3 played with
  ONLY brief + field guide + fail-message knowledge; every task graded with the
  literal checks[].cmd after sourcing the mission env (mirrors execCheck).
  Deliberate wrong answers were graded to judge fail-message quality.
- UI audit: Observatory showcase card, missions panel, tutorial scope, in-box
  MOTD, live catalog order.

## Findings (consolidated)

| # | Sev | Where | Finding |
|---|-----|-------|---------|
| B1 | BLOCKER | Mission 1 entry | Dept dir randomized + never named; ls (m2) and cd (m3) required before m1 t01; guide tip failed verbatim from landing dir; MOTD routes to free-play |
| M1 | MAJOR | Missions panel | Cards rendered in alphabetical-id order (01, 03, 13, 14...) with no "do in order" signal |
| M2 | MAJOR | Showcase | Only how-to on the page covers free-play; missions had none |
| M3 | MAJOR | Mission 1 | Longest mission (14 tasks vs ~8.8 avg) placed first (Phase 3) |
| M4 | MAJOR | chmod t06 | Natural `chmod -R 644` breaks dir traversal; fail text said "not 644" which is FALSE (it is 644, unreachable) |
| M5 | MAJOR | ls t02 | Guide teaches -a/-A as siblings; grader accepts only -a; fail text described the option the -A student already used (looping) |
| M6 | MAJOR | cd t05/t06 | Cross-dir writes unscaffolded; relative write through the symlink silently lands in the PHYSICAL tree, then grade says "does not exist" (empirically proven) |
| M7 | MAJOR | mkdir t08 / cd t07 hidden | Hidden checks punish ordinary exploration with no warning and no taught remedy (Phase 3) |
| m1-m6 | MINOR | various | grade button below cards; find -exec never explained; globbing used before taught; raw placeholder in a fail text; cat> typo=retype; grep-heavy t11 in m1 |

Positives that held: 33/33 checks in m1-3 passed with student-derivable
commands once past the stalls; most fail messages teach (line-exact hints);
the field guides closed nearly all forward references; bonus tasks are
labeled; graders are honest.

## Phase 1 fixes (blocker + orientation)

1. START_HERE.txt (engine-level): lab-manager `runSeed` writes a per-mission
   orientation file into /home/student after every successful seed - names the
   student's department directory, gives the two first moves (cd DEPT, cat
   BRIEFING*.txt), and teaches ls/cd in two lines. One change covers all 18
   missions; fail-open (a write failure never fails a launch).
2. Field guide common tips 3 -> 5: ls (see what is here / START_HERE.txt names
   your department), cd (enter it), then the original three.
3. Observatory missions panel: cards sorted by mission tier (1 -> 18), "Do them
   in order" line, and a 4-step missions how-to (pick lowest unfinished ->
   field guide + Start -> work in terminal, lost? cat START_HERE.txt -> grade
   anytime, claim when lit).

## Phase 2 fixes (surgical text)

- ls t02 fail: names the real differentiator (-a includes . and .., -A will
  not match).
- chmod t06 fails (x2): diagnose the -R trap (dirs lost execute; restore 755,
  then FILES only via find).
- cd t05/t06 fails: teach the absolute-path write (`pwd >
  /home/student/$MISSION_DEPT/...`) and name the symlink physical-tree trap.
- cat t02 fail: raw "<your project name>" placeholder replaced with
  $MISSION_PROJ (grader substitutes tokens in fail texts, missions.js:163).
- cd field guide: +2 rows (absolute-path write from anywhere; >> appends).

## Phase 3 (operator-held, tracked)

- Mission 1 length rebalance (M3) and hidden-check philosophy (M7): design
  calls; see sprint-master.

## Related

- `_docs/operations/linux-command-mastery-missions.md` (mission system)
- `_tools/sandbox-missions/fieldguide-drift-check.js` (guide coverage tripwire)
- lab-manager git clone: /home/eq/hexworth-sandbox (bc1 deploy = scp + rebuild)
