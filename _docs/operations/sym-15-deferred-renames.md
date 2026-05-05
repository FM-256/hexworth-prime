# SYM-15 Deferred — Awaiting User Input

These PROG-003 collisions were identified during marathon-mode triage but
require your judgment because they involve naming/canonical choices that
go beyond the established allowlist pattern.

## "Other" bucket — 4 collisions, all clear bugs

Each is distinct content sharing a key. Fix pattern: rename non-canonical to
identity-derived key + add `copyLegacyKey` shim. Naming choices below are
my proposals; approve as-is or override.

### 1. `dark-arts/dark-arts-index`
Files (neither is the actual house index — both compete for the key):
- `_app/dark-arts/vault/index.html` ("The Vault")
- `_app/houses/dark-arts/tools/ctf-leaderboard/index.html` ("CTF Leaderboard")

**Proposed:** rename BOTH to identity-derived keys, cross-credit from the legacy key
- vault → `dark-arts-vault-index`
- ctf-leaderboard → `dark-arts-ctf-leaderboard`
- copyLegacyKey: `('dark-arts', 'dark-arts-index', 'dark-arts-vault-index')` and `('dark-arts', 'dark-arts-index', 'dark-arts-ctf-leaderboard')`

### 2. `script/script-lab`
Files (two CLH course labs sharing a generic key):
- `_app/houses/script/labs/script-lab.lab.html` ("CLH-001: Introduction to Hacker CLI")
- `_app/houses/script/courses/clh/modules/clh-031/script-lab.lab.html` ("CLH-031: Operation BLACKOUT")

**Proposed:** keep `labs/script-lab.lab.html` at `script-lab` (it's the canonical CLH-001 intro), rename CLH-031
- CLH-031 → `script-clh-031-blackout-lab`
- copyLegacyKey: `('script', 'script-lab', 'script-clh-031-blackout-lab')`

### 3. `script/script-index`
Files (house index + course index sharing key):
- `_app/houses/script/index.html` (House of the Script main index — OWNS this identity)
- `_app/houses/script/courses/grep-pipe-mastery/index.html` ("Grep & Pipe Mastery")

**Proposed:** keep house index at `script-index`, rename course index
- grep-pipe-mastery → `script-grep-pipe-mastery-index`
- copyLegacyKey: `('script', 'script-index', 'script-grep-pipe-mastery-index')`

### 4. `web/web-index`
Files (house index + simulators index sharing key):
- `_app/houses/web/index.html` (House of the Web main index — OWNS this identity)
- `_app/houses/web/simulators/index.html` ("Simulators")

**Proposed:** keep house index at `web-index`, rename simulators
- simulators → `web-simulators-index`
- copyLegacyKey: `('web', 'web-index', 'web-simulators-index')`

## How to approve

Either:
- "Approve all 4 with proposed names" → I execute as a Section C commit
- "Approve N, override naming for M" → tell me which alternate names
- "Defer all to a later cycle" → noted, leave them in the PROG-003 baseline

Files I'd touch (5 edits total — the 5 non-canonical files):
1. `_app/dark-arts/vault/index.html`
2. `_app/houses/dark-arts/tools/ctf-leaderboard/index.html`
3. `_app/houses/script/courses/clh/modules/clh-031/script-lab.lab.html`
4. `_app/houses/script/courses/grep-pipe-mastery/index.html`
5. `_app/houses/web/simulators/index.html`


## CLH curriculum reorganization mismatch — 16 collisions

The CLH course was reorganized (different topic taught at each CLH-NNN slot) but the OLD applet path naming was preserved. Result: `script/clh/script-clh-NNN-intro.applet.html` teaches one topic, `script/courses/clh/modules/clh-NNN/script-intro.module.html` teaches a different topic, both call complete with the same `script-clh-NNN-intro` key. Students complete the wrong-titled credit silently.

This is a bug, but the fix involves choosing WHICH topic owns each CLH-NNN slot — the applet topic or the module topic? That requires curriculum-level judgment about the canonical CLH-NNN sequence.

| CLH | Applet topic | Module topic |
|---|---|---|
| 003 | CLH-003: Pattern Hunting | CLH-003: Network Analysis |
| 004 | CLH-004: Process Investigation | CLH-004: Text Analysis & Pattern Hunting |
| 005 | CLH-005: Log Analysis | CLH-005: Process Investigation |
| 006 | CLH-006: File Operations | CLH-006: Permissions & Access Control |
| 007 | CLH-007: Permissions & Access Control | CLH-007: Shell Scripting Basics |
| 008 | CLH-008: Shell Scripting | CLH-008: Advanced Shell Scripting |
| 009 | CLH-009: Text Processing | CLH-009: System Administration |
| 010 | CLH-010: I/O Redirection | CLH-010: Log Analysis & Forensics |
| 011 | CLH-011: Advanced Grep & Regex | CLH-011: Network Reconnaissance |
| 012 | CLH-012: Network Basics | CLH-012: Web Enumeration |
| 013 | CLH-013: Environment Variables | CLH-013: Incident Response |
| 014 | CLH-014: Process Control | CLH-014: Automation & Tooling |
| 015 | CLH-015: OPERATION MOLE HUNT | CLH-015: Capstone Challenge |

## Other title-mismatch pairs (3)

### forge/forge-core2-roleplay
- houses/forge/applets/comptia-aplus/core-2/labs/forge-core2-roleplay.lab.html :: Core 2 Roleplay Lab - IT Support Scenarios
- houses/forge/labs/forge-core2-roleplay.lab.html :: IT Support Roleplay Lab

### script/script-python-chapter1
- houses/script/applets/python/script-python-chapter1.applet.html :: Zero to Python: Chapter 1 - Interactive Learning Module
- houses/script/presentations/python/script-python-chapter1.presentation.html :: Zero to Python: Chapter 1 - The First Bit

### shield/shield-security-fundamentals
- houses/shield/presentations/shield-security-fundamentals.presentation.html :: Security Fundamentals
- houses/shield/presentations/shield-security.presentation.html :: Network Security Fundamentals - Network+ N10-008

## How to resolve (per pair)

For each title-mismatch pair, decide:

1. **Which topic is the canonical CLH-NNN?** (e.g., is CLH-003 "Pattern Hunting" or "Network Analysis"?)
2. The canonical-topic file keeps the original key.
3. The other file gets renamed to a topic-specific key (e.g., `script-network-analysis-intro`).
4. Add `copyLegacyKey` shim so any prior progress on the legacy key cross-credits.

OR alternative: if BOTH topics belong in the curriculum at separate CLH numbers, both files get renamed (one CLH stays as-is, the other gets reassigned).

Awaiting curriculum direction before any file edits.


---

## Other deferred items surfaced during marathon validator-accuracy run (2026-05-05)

These are NOT SYM-15 PROG-003 work but were surfaced/verified during the same marathon block. Documented here so they don't get lost.

### HEUR-018 — Scroll-triggered auto-completion (398 medium findings)

**Pattern:** files where `ModuleProgress.complete()` fires inside a scroll event listener at an 80% threshold. The student auto-completes the module just by scrolling past the threshold — no deliberate "I'm done" action.

**Why deferred (not autonomous):** the fix is well-defined (replace scroll listener with explicit Mark Complete button), but it CHANGES STUDENT-FACING BEHAVIOR on 398 pages. Students who currently get auto-credit by scrolling will suddenly need to click a button. That's a regression in convenience even if it's pedagogically more correct.

**Decision needed from user:**
1. Bulk-fix: convert all 398 files to Mark Complete button pattern (UX consistency, but adds a click step everyone)
2. Selective fix: only convert pages where scroll-completion is genuinely problematic (which? specific houses/courses?)
3. Accept the pattern: lower HEUR-018 severity to `low` and document the design choice (scroll = engagement signal sufficient for completion)

### HUB-001 — 10 hubs with broken data-module refs (high)

Verified earlier (`symbiosis-prerequisites-2026-05-04.md`) as discoverability gap, NOT student-visible defect. Cards render, links work, files exist. Already documented; this is a reminder.

### QUIZ-002 (5), QUIZ-005 (10), QUIZ-006 (4) — server grading gaps (19 total high)

Quizzes that lack server-graded keys in `quiz_keys.json`. The fix involves running the quiz_keys deployment script (the PD-1 task in-progress: STR-40 quiz keys — operator verification required). NOT autonomous; tied to the existing operator-verification work.

### Bulk LOW-severity buckets

Surveyed but not addressed in this marathon round (decision needed on whether to invest):
- LP-007 (2,295): course modules not in any learning path — fix = add to LearningPaths.js or accept as not-LP-tracked
- NAME-003 (1,904): files missing house prefix — fix = rename files (cascades to many href references)
- SEM-001 (793): heading hierarchy skips (h1→h3 without h2) — accessibility, manual review per-page
- BLOB-001 (612), BLOB-004 (552): large inline style/script blocks — extract to external files (changes deploy-cache behavior)

Each is a multi-day cleanup effort with cascading consequences. User direction on which (if any) to prioritize.
