# PROG-003 — CLH residual triage (operator decision required)

## TL;DR

13 of 14 current PROG-003 findings are CLH course collisions (clh-003-intro through clh-015-intro). **The naming pattern is misleading**: clh-001/002/016+ ARE intentional same-module pairs (allowlisted), but clh-003 through clh-015 are NOT — the two files teach different topics that accidentally share a progress key.

The fix is the RENAME pattern (per `prog003-rename-plan-2026-05-04.md`), NOT allowlist additions. The 14th finding (`dark-arts-ctf-leaderboard`) needs its own triage.

## Verified state

```
Total PROG-003 findings: 14
  CLH cluster:           13 (script-clh-003-intro..script-clh-015-intro)
  dark-arts cluster:      1 (dark-arts-ctf-leaderboard)
  
PROG-003 allowlist (existing): 54 entries
  clh-001-intro: ALLOWLISTED — verified same-content pair
  clh-002-intro: ALLOWLISTED — verified same-content pair
  clh-003..015:  PENDING — flagged "pattern doesn't match" in rename plan
  clh-016-018+:  ALLOWLISTED — verified same-content pair
```

## Critical finding from spot-check (2026-05-07)

I spot-checked file titles for CLH-001 (allowlisted) vs CLH-003, 008, 015 (residual):

| Module | Applet `<h1>` | Module `<h1>` | Same content? |
|---|---|---|---|
| CLH-001 (allowlisted) | "Introduction to the Hacker CLI" | "Introduction to the Hacker CLI" | **YES — identical title** |
| CLH-003 | "Pattern Hunting with grep" | "Network Analysis Fundamentals" | **NO — different topics** |
| CLH-008 | "Shell Scripting Basics" | "Advanced Shell Scripting" | **NO — beginner vs advanced** |
| CLH-015 | "OPERATION MOLE HUNT" | "Capstone Challenge" | **NO — different content** |

The original rename-plan triage was correct. Allowlisting these would silently suppress real progress-tracking bugs where students completing one piece get no XP/credit for completing the other (they're treated as "already done" by `ModuleProgress.isFirstCompletion`).

## Why the pattern superficially looks identical

Both file pairs share the same FILE-PATH structure:
- `houses/script/clh/script-clh-NNN-intro.applet.html`
- `houses/script/courses/clh/modules/clh-NNN/script-intro.module.html`

But for clh-003-015, these paths point to DIFFERENT topics. The applet path is legacy hub-direct content (which apparently was repurposed for different topics over time); the module path is canonical course-tree content. They share a progress key because both still call `ModuleProgress.complete('script', 'script-clh-NNN-intro', ...)` from a copy-paste template.

## Recommended fix per finding

For each of the 13 CLH residuals, apply the rename pattern from `prog003-rename-plan-2026-05-04.md`:
- **Module page** (`courses/clh/modules/clh-NNN/script-intro.module.html`) keeps `script-clh-NNN-intro` (canonical course-tree key)
- **Applet page** (`clh/script-clh-NNN-intro.applet.html`) renames to `script-clh-NNN-applet` (or topic-specific key like `script-clh-003-pattern-hunting`)

Each rename is:
1. Edit the applet's `ModuleProgress.complete('script', 'NEW-KEY', ...)` call
2. Add a `ModuleProgress.copyLegacyKey('script-clh-NNN-intro', 'NEW-KEY')` shim so existing student progress migrates (per memory `reference_module_progress_migrate_legacy_key.md`)
3. Re-run validator → finding clears

13 renames × 2-3 lines per file = ~30-40 lines of edits across 13 applet files.

## What about dark-arts-ctf-leaderboard?

The 14th finding flags 2 files sharing `(dark-arts, dark-arts-ctf-leaderboard)`:
- `_app/dark-arts/ctf-leaderboard.applet.html` (47KB, Apr 22)
- `_app/houses/dark-arts/tools/ctf-leaderboard/index.html` (40KB, May 5)

`diff -q` reports they DIFFER. Sizes differ. Newer file is the canonical hub path; older file may be a legacy duplicate. Two paths:
- **Path A** — they're the same conceptual leaderboard tool: allowlist (single entry)
- **Path B** — the older file is dead code: remove from `_app/dark-arts/` entirely

Operator should pick A or B after spot-checking content. I cannot make this call without verifying intent.

## What I will not do autonomously

- Apply the 13 CLH renames — each requires verifying the new progress key isn't already taken AND the legacy migration shim covers existing student progress
- Allowlist any of the 13 CLH residuals (would silently suppress real bugs)
- Remove or allowlist dark-arts-ctf-leaderboard without operator content review

## Adversarial reviewer credit

This proposal direction was inverted from my initial plan. I had drafted a 13-entry allowlist update assuming the naming-pattern matched clh-001/002/016+. The adversarial reviewer flagged unverified assumption + dismissal of prior triage rationale. Spot-checking 3 file pairs confirmed the original triage was correct: these are real bugs, not allowlist candidates.

## Cross-references

- Existing audit: `_docs/operations/prog003-audit-2026-05-04.md`
- Rename plan (referenced strategy): `_docs/operations/prog003-rename-plan-2026-05-04.md` (sections D + E)
- Stale-progress regression: `_docs/operations/prog003-stale-progress-regression-2026-05-04.md`
- Validator: `_tools/eduscan/validators/syntax/progress-keys.js`
- Allowlist: `_tools/eduscan/config/prog003-allowlist.json`
- Memory: `reference_module_progress_migrate_legacy_key.md` (the `copyLegacyKey` shim for student-progress migration)
- Memory: `reference_clh_three_layer_architecture.md` (CLH file-layer architecture)
