# CompTIA A+ Core 1 (220-1101): Content QC and Lab Rebuild Status

*Live as of 2026-07-04. Course path: `_app/houses/forge/applets/comptia-aplus/core-1/`.*

## TLDR

A+ Core 1 (Forge house) shipped a full em-dash/punctuation sweep and a set of CompTIA fact corrections across all 12 chapters, both domain pages, and all 4 prep-round quizzes. A separate pass cleaned 13 labs of em-dashes and fixed 2 emoji-hygiene issues. Net result: 0 em-dashes across the entire course (content + labs), confirmed by direct grep. Two of the course's quiz-shaped labs (`forge-cloud-scenarios`, `forge-troubleshooting`) are mid-rebuild into real interactive engines as of this writing, in progress and not yet committed. The remaining prep quizzes are still client-graded and are next in line for the QC-57 server-grading pattern.

Course is otherwise stable: 12/12 chapters live, 46 labs, 4 prep-round quizzes, 4 domain index pages.

## Content Inventory

| Area | Path | Count | Grading |
|---|---|---|---|
| Chapters | `chapters/ch01-motherboards/` through `ch12-hw-network-troubleshooting/` | 12 | Client-side (15q/chapter, 70% threshold) |
| Domain pages | `domains/{mobile-devices,networking,cloud-virtualization,troubleshooting}/` | 4 | N/A (reference pages) |
| Labs | `labs/*.lab.html` | 46 | ModuleProgress.complete signal, no server grade |
| Prep-round quizzes | `quizzes/forge-aplus-core1-prep-round-{1..4}.quiz.html` | 4 | Client-side, no `quiz_keys` bridge, no `gradeQuiz` call |

## QC Pass 1: Content Em-Dash Sweep and Fact Fixes

Commit `a59ea82ff`, 18 files changed (12 chapters, 2 domain pages, 4 prep quizzes; the commit subject line says "20 files," the actual diffstat is 18, see the note below).

Em-dash sweep: every em-dash rewritten to correct punctuation (colon, comma, or period), not substituted with a double-hyphen. Word-integrity was verified: no words were altered, only punctuation.

Fact fixes (Karl-passed, Chris-passed methodology):

| Fix | File | What changed |
|---|---|---|
| 6-step troubleshooting order | `chapters/ch11-troubleshooting/index.html` | Restored the canonical CompTIA order; the Verify step had been dropped/reordered |
| Wi-Fi generation labels | `chapters/ch07-wireless/index.html` | 802.11a/b/g corrected to carry no Wi-Fi generation label (n/a, since generation numbering starts at Wi-Fi 4 / 802.11n) |
| Channel width | `chapters/ch07-wireless/index.html` | Corrected to "20 MHz wide, centers spaced 5 MHz apart" |
| Wi-Fi 5 speed | `chapters/ch09-laptops/index.html` | Corrected to 6.9 Gbps |
| Beep-code attribution | `quizzes/forge-aplus-core1-prep-round-4.quiz.html` | Prep-round-4 beep-code question reattributed from "AMI BIOS" to IBM/legacy POST |
| Teredo note | `chapters/ch06-tcpip/index.html` | Corrected |
| USB port colors | `chapters/ch03-peripherals/index.html` | Corrected |

**Discrepancy flagged, not silently resolved:** the commit message and this session's build notes both state "20 files." `git show --stat a59ea82ff` lists 18 files changed (verified by direct count of the diffstat and by recounting the file list). The 18-file total is what shipped; the "20" figure appears to be an off-by-two error carried in the commit subject line itself. Anyone auditing this commit later should treat 18 as ground truth.

## QC Pass 2: Lab Em-Dash Sweep and Emoji Hygiene

Commit `e5fb40a3e`, 15 files changed (13 labs for the em-dash sweep, 2 of those same-or-different labs for emoji hygiene; totals reconcile against the diffstat).

Em-dash removal: 366 em-dashes removed across 13 labs, rewritten to proper punctuation. Word-integrity verified, HTML structure unchanged, all files confirmed parse-clean.

Notable non-mechanical fix: the hardware-diagnosis beep-code lab's long-beep glyph had been rendered as an em-dash. **Why:** a flat em-dash collapses the dot/dash distinction a beep-code decoding exercise depends on, so it was changed to a filled bar instead of a plain hyphen, preserving the Morse-style dot-vs-dash meaning the lab teaches.

Emoji hygiene (2 labs):

| Lab | Fix |
|---|---|
| `labs/forge-soho-rescue.lab.html` | Back-arrow emoji replaced with a safe glyph; empty-checkbox emoji replaced with a CSS-drawn checkbox |
| `labs/forge-bluetooth-pairing.lab.html` | Power-symbol emoji replaced with plain button text |

**Verified independently:** `grep -rP '\x{2014}' _app/houses/forge/applets/comptia-aplus/core-1/` returns 0 matches across the entire course tree (content and labs) as of this writing. The "0 em-dashes" claim in the commit message checks out.

## In Progress: Quiz-Shaped Lab Rebuilds

Separate from the two QC passes above, an ongoing effort is converting the course's quiz-shaped labs (pick-the-answer multiple choice) into real interactive engines where the student performs the skill instead of recognizing the answer. This follows the same doctrine and harness pattern documented in the companion engineering note "Arcade and Lab Skill-Binding Rebuild Pattern" under Platform Documentation.

| Lab | Old shape | New shape | Status |
|---|---|---|---|
| `forge-cloud-scenarios.lab.html` | Multiple-choice quiz (per-scenario single click) | "Cloud Solutions Architect Workbench": 8 real client scenarios, student configures service model, deployment model, and a multi-select characteristics set per scenario, graded on an exact match across all three axes | In progress (uncommitted as of this writing) |
| `forge-troubleshooting.lab.html` | 6-question multiple-choice quiz | "Support Ticket Workbench": student performs the CompTIA 6-step methodology (identify, theory, test, plan+implement, verify, document) on 3 distinct support tickets, in order, grounded in evidence gathered in-lab | In progress (uncommitted as of this writing) |

Both keep the existing `ModuleProgress.complete` signal and ship with a headless self-check harness under `_tools/arcade-fixes/` (`aplus-cloud-scenarios-check.js`, `aplus-troubleshooting-check.js`) ahead of a Chris QC gate. Neither is committed yet; do not treat this section as shipped state.

An approximate count of ~16 quiz-shaped labs remain across the course (identifier/matcher-style multiple choice); the two above are the first two converted. This is a running effort, not a scoped-and-scheduled sprint.

## Planned Next

Server-grade the 4 prep-round quizzes (`forge-aplus-core1-prep-round-1` through `-4`). Currently client-graded: no `quiz_keys/{quizId}` document exists in Firestore for any of the four, so there is no server-side bridge to break, but there is also no server-side grade of record. Plan is to apply the QC-57 pattern (`quiz_keys` + `gradeQuiz`) used platform-wide for exams and quizzes. Before deploying, run `cd functions && node verify-quiz-keys.js <quizId>` for each round per the standing server-graded-exam bridge check.

## Related

- Companion engineering note: [Arcade and Lab Skill-Binding Rebuild Pattern](https://hexworth.atlassian.net/wiki/spaces/KBA/pages/40075265/Arcade+and+Lab+Skill-Binding+Rebuild+Pattern) (Platform Documentation), covering the harness/proof/gate pattern this lab-rebuild effort follows.
- QC-57 server-grading pattern (`quiz_keys` + `gradeQuiz`), the reference implementation the planned prep-quiz server-grading work will follow.

*Last Updated: 2026-07-04 · v1.0.0*
