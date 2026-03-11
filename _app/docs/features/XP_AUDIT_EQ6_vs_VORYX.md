# XP Audit: @EQ6 vs @VORYX

**Date:** 2026-03-08
**Source:** Firestore `users` collection (live production data)
**Purpose:** Compare two real accounts to understand XP discrepancies and identify systemic bugs

---

## The Paradox

| Metric | @VORYX | @EQ6 | Winner |
|--------|-------:|-----:|--------|
| **Firestore XP** | **49,004** | 44,925 | VORYX (+4,079) |
| **Level** | **31** | 30 | VORYX |
| **Unique modules completed** | 32 | **62** | EQ6 (1.9x more) |
| **Labs completed** | 13 | **36** | EQ6 (2.8x more) |
| **Quizzes passed** | 15 | **20** | EQ6 |
| **Streak (days)** | 22 | **27** | EQ6 |
| **CTF boxes pwned** | 0 | **1** | EQ6 |

**EQ6 did nearly 2x the work but has less XP.** That's the bug.

---

## Raw Data Quality

### Data Pollution Summary

Both accounts have severely polluted `modulesCompleted` and `labsCompleted` arrays from sync bugs.

| Pollution Type | @VORYX | @EQ6 | Description |
|---------------|-------:|-----:|-------------|
| **Raw entries** | 76 | 141 | Total items in `modulesCompleted` array |
| **Garbage entries** | 11 (14%) | 15 (11%) | House names, meta fields, doubled nonsense |
| **Duplicate entries** | 33 (43%) | 64 (45%) | Same module stored with 2-3 different ID formats |
| **Unique real modules** | **32** | **62** | After dedup + garbage removal |
| **Inflation ratio** | 2.4x | 2.3x | Raw / Unique (how bloated the arrays are) |

### Garbage Entries (Not Real Modules)

These are Firestore field names and house IDs that leaked into `modulesCompleted` during sync:

**@VORYX (11):** `dark-arts`, `forge`, `dark`, `shield`, `xp`, `updatedAt`, `dark-dark`, `forge-forge`, `shield-shield`, `xp-xp`, `updatedAt-updatedAt`

**@EQ6 (15):** `updatedAt`, `script`, `xp`, `forge`, `shield`, `key`, `code`, `web`, `script-script`, `forge-forge`, `code-code`, `key-key`, `shield-shield`, `updatedAt-updatedAt`, `xp-xp`

**Root cause:** `syncBidirectional()` scans the flat `progress[house][key]` object. When iterating keys, it hits metadata fields like `updatedAt`, `xp`, and bare house entries. These get reconstructed as fake module IDs and pushed to `modulesCompleted` via `arrayUnion`.

### Duplicate ID Formats

The same module appears in 2-3 formats. Example (VORYX's CIA Triad quiz):
```
shield-cia-triad        ← house-prefixed (from ModuleProgress.complete)
shield-shield-cia-triad ← double-prefixed (from sync bug)
cia-triad               ← bare key (from syncBidirectional parsing)
```

Each format is a separate string, so `arrayUnion` treats them as distinct entries. **But each also triggers a separate `recordProgress` CF call**, adding XP via `FieldValue.increment()` each time.

### Suspicious Entries

**@VORYX:** `5000-any_id`, `5000-manual_boost` — These appear in `modulesCompleted`. The "5000" prefix suggests debug/test entries. Currently classified as presentations (100 XP each), but their origin is unknown.

**@EQ6:** `core2-ch18-index` quiz score = 9 — Likely a raw correct count (9/N), not a percentage. Treated as a pass (100 XP) but below the 70% threshold that *should* be required.

**@EQ6:** Game scores recorded as quizzes — `protocol-stack` (406), `subnet-siege` (1149), `terminal-velocity` (301). These are game high scores, not quiz percentages. Since scores >= 90 are treated as "perfect," these award 200 XP each as quiz-perfects.

**@VORYX:** Quiz scores of 6 — `threat-threat-actors` (6), `threat-botnets` (6), `threat-attacks-malware` (6). Also likely raw correct counts, not percentages. Marked `passed: true` despite being well below 70%.

### labsCompleted Pollution

`labsCompleted` is equally polluted. Both users have bare house names and module IDs that are NOT labs:

**@VORYX orphan labs:** `shield`, `forge`, `presentation`, `automation`, `windowsEditionsLab`, `windowsSettingsLab`, `controlPanelLab`

**@EQ6 orphan labs:** `shield`, `forge`, `script`, `code`, `key`, `a1`, `controlPanelLab`, `adminToolsLab`, `systemToolsLab`, `windowsEditionsLab`, `windowsSettingsLab`, `editionSelector`, `hardware`, `intro`, `presentation`

Items like `lm-01-welcome`, `python-chapter1`, `section-1-complete` are also in EQ6's `labsCompleted` despite being presentations/milestones — inflating their lab count and XP classification.

---

## XP Reconstruction

### What XPCalculator Would Derive

Using the same logic as `_categorizeCompletions()` + `_resolveType()`:

| XP Source | @VORYX | @EQ6 | Notes |
|-----------|-------:|-----:|-------|
| Presentations (x100) | 4 = 400 | 6 = 600 | After dedup + classification |
| Labs (x500) | 13 = 6,500 | 36 = 18,000 | Inflated by labsCompleted pollution |
| Quizzes pass (x100) | 4 = 400 | 1 = 100 | Scores < 90% |
| Quizzes perfect (x200) | 11 = 2,200 | 19 = 3,800 | Scores >= 90% (includes game scores) |
| **Module subtotal** | **9,500** | **22,500** | |
| Orphan labs (x500) | 2 = 1,000 | 6 = 3,000 | In labsCompleted but not modulesCompleted |
| Gates (x500) | 10 = 5,000 | 10 = 5,000 | 5 main + 5 Dark Arts |
| Streak (x25/day) | 22 = 550 | 27 = 675 | |
| **Known subtotal** | **16,050** | **31,175** | No badges, no games, no courses |
| Badges + Games + Courses | ??? | ??? | Need AchievementSystem + game_tracker |
| **Firestore XP** | **49,004** | **44,925** | Actual stored value |
| **Unaccounted delta** | **+32,954** | **+13,750** | Firestore - Known subtotal |

### The Delta Problem

**@VORYX has 33K unexplained XP. @EQ6 has 14K unexplained XP.**

Even accounting for badges (typically 10-500 per badge) and games (100 per unique game), the deltas are far too large:
- VORYX: 46 achievements * ~100 avg = ~4,600 badge XP. Still leaves ~28K unexplained.
- EQ6: 41 achievements * ~100 avg = ~4,100 badge XP. 9 game achievements * 100 = ~900. Still leaves ~9K unexplained.

---

## Root Cause Analysis

### Bug #1: FieldValue.increment() Is Not Idempotent

`recordProgress` CF uses `FieldValue.increment(100)` for modules. Unlike `arrayUnion` (which deduplicates), increment is cumulative. When the same module is recorded multiple times with different ID formats:

```
recordProgress({ type: 'module', itemId: 'shield-cia-triad' })  → +100 XP
recordProgress({ type: 'module', itemId: 'cia-triad' })          → +100 XP
recordProgress({ type: 'module', itemId: 'shield-shield-cia-triad' }) → +100 XP
```

Each call increments XP, even though it's the same module. This affects **every duplicated entry** in the arrays.

**VORYX impact:** 33 duplicate entries at current rate = 33 × 100 = 3,300 XP inflated
**EQ6 impact:** 64 duplicate entries at current rate = 64 × 100 = 6,400 XP inflated

### Bug #2: Old CF Rate Was 1000 XP Per Module (Pre-2026-03-07)

Before the 2026-03-07 fix, `recordProgress` type `'module'` awarded **1,000 XP** instead of 100. Any modules completed before that date inflated XP by 10x.

If VORYX completed 30 modules under the old rate with duplicate IDs:
- 30 entries × 1,000 = 30,000 XP (explains most of the 33K delta)

If EQ6 completed 14 modules under the old rate:
- 14 entries × 1,000 = 14,000 XP (explains most of the 14K delta)

### Bug #3: syncProgress Preserves Inflated XP

`syncProgress` CF (line 727):
```javascript
const mergedXP = Math.max(cloudData.xp || 0, localXP);
```

This takes the **higher** of cloud vs local. Once XP is inflated via `FieldValue.increment()`, it can never go down — `Math.max` locks in the inflated value forever.

### Bug #4: labsCompleted Cross-Contamination

Non-lab items in `labsCompleted` cause `_resolveType()` to classify them as labs (500 XP) instead of presentations (100 XP). This over-awards XP by 400 per misclassified item.

**@EQ6 is heavily affected:** Items like `lm-01-welcome` (a Linux presentation), `python-chapter1` (a presentation), `section-1-complete` (a milestone marker), and `intro` are all classified as labs at 500 XP instead of the correct 100 XP.

EQ6 has **36 items** classified as labs. If ~15 of those are actually presentations, that's 15 × 400 = 6,000 XP over-counted in the reconstruction.

### Bug #5: Game Scores Stored as Quiz Scores

EQ6's quizzes contain game high scores:
- `protocol-stack`: 406 (card-matching game)
- `subnet-siege`: 1149 (subnet calculator game)
- `terminal-velocity`: 301 (typing speed game)

Since scores > 90 are treated as "perfect," these award 200 XP each as quiz-perfects. They should be in `game_tracker` (100 XP flat), not quizzes.

### Bug #6: Sub-70% Quizzes Marked as Passed

VORYX's quizzes with score 6 (`threat-threat-actors`, `threat-botnets`, `threat-attacks-malware`) are marked `passed: true`. These are raw correct counts, not percentages. The recording path doesn't normalize scores to percentages before writing to Firestore.

---

## Why VORYX > EQ6 (The Full Explanation)

1. **VORYX accumulated more XP under the old 1000 XP/module rate.** Dark Arts completion (feh-01 through feh-10) with duplicated IDs at 1000 XP each generated massive inflation.

2. **VORYX's module duplication is more concentrated.** 33 duplicates across 32 unique modules means almost every module was doubled. At 1000 XP per duplicate, that's ~33K extra XP.

3. **EQ6's work is more recent.** Many of EQ6's modules (Linux LM series, Git, Python) were completed after the 2026-03-07 rate fix, earning only 100 XP instead of 1000.

4. **Math.max guard locked in VORYX's inflated XP.** Once the cloud XP hit 49K from old-rate inflation, no sync cycle can reduce it.

5. **EQ6 has more "real" completions but they're worth less.** 62 unique modules at the corrected 100 XP rate = 6,200 XP in presentations. VORYX's 32 modules at the old 1000 XP rate = 32,000 XP from CF increments alone.

---

## Full Item Classification

### @VORYX — 32 Unique Modules

| # | Module ID | Type | XP | Notes |
|---|-----------|------|---:|-------|
| 1 | wireless-attacks-lab | lab | 500 | |
| 2 | windowsEditionsLab | lab | 500 | |
| 3 | windowsSettingsLab | lab | 500 | |
| 4 | controlPanelLab | lab | 500 | |
| 5 | cia-triad | quiz-perfect | 200 | Score: 95 |
| 6 | gauntlet-advanced | lab | 500 | |
| 7 | career-explorer | lab | 500 | |
| 8 | threat-threat-actors | quiz | 100 | Score: 6 (raw count, not %) |
| 9 | feh-01 | quiz | 100 | Score: 87 |
| 10 | feh-02 | quiz-perfect | 200 | Score: 100 |
| 11 | feh-03 | quiz-perfect | 200 | Score: 93 |
| 12 | feh-04 | quiz-perfect | 200 | Score: 100 |
| 13 | feh-05 | quiz-perfect | 200 | Score: 100 |
| 14 | feh-06 | quiz-perfect | 200 | Score: 100 |
| 15 | feh-07 | quiz-perfect | 200 | Score: 100 |
| 16 | feh-08 | quiz-perfect | 200 | Score: 100 |
| 17 | feh-09 | quiz-perfect | 200 | Score: 100 |
| 18 | feh-10 | quiz-perfect | 200 | Score: 100 |
| 19 | index | presentation | 100 | Bare "index" from dark-arts-index |
| 20 | threat-botnets | quiz | 100 | Score: 6 (raw count) |
| 21 | foundations-presentation | presentation | 100 | AI house |
| 22 | threat-attacks-malware | quiz | 100 | Score: 6 (raw count) |
| 23 | automation | lab | 500 | Code house |
| 24 | presentation | lab | 500 | Misclassified — bare key in labsCompleted |
| 25 | wifi-lab-00 | lab | 500 | |
| 26 | cmmc-comprehensive | lab | 500 | |
| 27 | security-fundamentals-undefined | lab | 500 | Note: "undefined" suffix |
| 28 | windows-editions | lab | 500 | |
| 29 | ch11-automation-explorer | quiz-perfect | 200 | Score: 100 |
| 30 | azure-fundamentals | lab | 500 | |
| 31 | 5000-any_id | presentation | 100 | Suspicious — debug/test entry? |
| 32 | 5000-manual_boost | presentation | 100 | Suspicious — debug/test entry? |

### @EQ6 — 62 Unique Modules

| # | Module ID | Type | XP | Notes |
|---|-----------|------|---:|-------|
| 1 | clh-001 | lab | 500 | |
| 2 | windowsEditionsLab | lab | 500 | |
| 3 | windowsSettingsLab | lab | 500 | |
| 4 | controlPanelLab | lab | 500 | |
| 5 | core2-ch13-index | quiz-perfect | 200 | Score: 100 |
| 6 | windows-editions | lab | 500 | |
| 7 | adminToolsLab | lab | 500 | |
| 8 | editionSelector | lab | 500 | |
| 9 | core2-ch14-index | quiz-perfect | 200 | Score: 100 |
| 10 | protocol-stack | quiz-perfect | 200 | Score: 406 (GAME score, not quiz) |
| 11 | core2-ch15-index | quiz-perfect | 200 | Score: 100 |
| 12 | subnet-siege | quiz-perfect | 200 | Score: 1149 (GAME score, not quiz) |
| 13 | git-basics | lab | 500 | |
| 14 | five-pillars | lab | 500 | |
| 15 | aes-explorer | quiz-perfect | 200 | Score: 100 |
| 16 | system-tools | lab | 500 | |
| 17 | systemToolsLab | lab | 500 | |
| 18 | core2-ch17-index | quiz-perfect | 200 | Score: 100 |
| 19 | cia-triad | quiz-perfect | 200 | Score: 95 |
| 20 | core2-malware | quiz-perfect | 200 | Score: 100 |
| 21 | core2-ch20-index | quiz-perfect | 200 | Score: 100 |
| 22 | core2-ch19-index | quiz-perfect | 200 | Score: 100 |
| 23 | core2-ch18-index | quiz | 100 | Score: 9 (raw count, not %) |
| 24 | control-panel | lab | 500 | |
| 25 | windows-settings | lab | 500 | |
| 26 | hardware | lab | 500 | |
| 27 | md100-m01 | lab | 500 | |
| 28 | md100-m02 | lab | 500 | |
| 29 | md101-m01 | lab | 500 | |
| 30 | md100-m01-lab | lab | 500 | ID suffix -lab |
| 31 | presentation | lab | 500 | Misclassified — bare key |
| 32 | core2-ch23-index | quiz-perfect | 200 | Score: 100 |
| 33 | core2-ch23-quiz | quiz-perfect | 200 | Score: 100 |
| 34 | core2-ch24-index | quiz-perfect | 200 | Score: 100 |
| 35 | core2-documentation-lab | quiz-perfect | 200 | In quizzes AND has -lab suffix |
| 36 | core2-ch24-quiz | quiz-perfect | 200 | Score: 100 |
| 37 | core2-ch22-index | quiz-perfect | 200 | Score: 100 |
| 38 | core2-ch21-index | quiz-perfect | 200 | Score: 100 |
| 39 | cse-module01 | lab | 500 | |
| 40 | what-are-agents | presentation | 100 | AI house |
| 41 | cost-calculator | presentation | 100 | AI house |
| 42 | foundations-presentation | presentation | 100 | AI house |
| 43 | ehe-01 | presentation | 100 | Dark Arts EHE |
| 44 | clh-016 | lab | 500 | |
| 45 | terminal-velocity | quiz-perfect | 200 | Score: 301 (GAME score, not quiz) |
| 46 | text-adventure-singularity | presentation | 100 | AI house |
| 47 | python-chapter1 | lab | 500 | Should be presentation? |
| 48 | python-chapter8-oop | lab | 500 | Should be presentation? |
| 49 | bh-mod-fundamentals | lab | 500 | |
| 50 | arena-a1 | lab | 500 | CTF box |
| 51 | do-7-git-fundamentals | lab | 500 | |
| 52 | lm-01-welcome | lab | 500 | Should be presentation (Linux intro) |
| 53 | lm-02-first-commands | lab | 500 | Should be presentation |
| 54 | lm-03-getting-help | lab | 500 | Should be presentation |
| 55 | lm-04-terminal-environment | lab | 500 | Should be presentation |
| 56 | lm-08-file-operations | lab | 500 | Should be presentation |
| 57 | wifi-lab-00 | presentation | 100 | Not in labsCompleted |
| 58 | do-8-branches | lab | 500 | |
| 59 | lm-05-section1-practice | lab | 500 | Practice quiz — should be quiz? |
| 60 | section-1-complete | lab | 500 | Milestone marker, not a lab |
| 61 | clh-001-lab | lab | 500 | |
| 62 | intro | lab | 500 | Bare key — should be presentation |

---

## Bugs Identified (Ordered by XP Impact)

| # | Bug | XP Impact | Affects | Status |
|---|-----|-----------|---------|--------|
| 1 | **FieldValue.increment stacks on duplicate IDs** | ~30K+ per user | All users | OPEN |
| 2 | **Old 1000 XP/module CF rate** (pre-3/7) | Historical, locked in by Math.max | All pre-fix users | Partially fixed (rate changed, but old XP locked in) |
| 3 | **labsCompleted pollution** misclassifies presentations as labs | +400 per item | Heavy users (EQ6: ~15 items = ~6K) | OPEN |
| 4 | **Game scores stored in quizzes map** | +100-200 per game | Users who play games | OPEN |
| 5 | **Raw score counts** stored instead of percentages | Quizzes awarded incorrectly | VORYX (3 items), EQ6 (1 item) | OPEN |
| 6 | **Garbage entries** (house names, meta fields) in arrays | 100 XP per garbage entry (if classified) | All users | OPEN |
| 7 | **syncBidirectional parseModuleId** creates duplicate formats | Multiplies all other bugs | All multi-device users | OPEN |

---

## Corrected XP Estimate (What It Should Be)

If we manually correct the misclassifications:

### @VORYX — Corrected

| Source | Count | XP |
|--------|------:|---:|
| Real presentations | 4 | 400 |
| Real labs | 11 | 5,500 |
| Real quizzes (pass, score < 90%) | 4 | 400 |
| Real quizzes (perfect, score >= 90%) | 11 | 2,200 |
| Misclassified "labs" (presentation, automation) | 2 → presentation | 200 |
| Gates (5 main + 5 DA) | 10 | 5,000 |
| Streak | 22 days | 550 |
| Badges (~46 achievements) | ~46 | ~3,000 est. |
| Games | ~3 | ~300 est. |
| **Corrected estimate** | | **~17,550** |
| **Firestore XP** | | **49,004** |
| **Inflation** | | **+31,454 (179%)** |

### @EQ6 — Corrected

| Source | Count | XP |
|--------|------:|---:|
| Real presentations | ~15 | 1,500 |
| Real labs | ~21 | 10,500 |
| Real quizzes (pass) | 1 | 100 |
| Real quizzes (perfect) | 16 | 3,200 |
| Game scores (misclassified as quiz) | 3 → game (100 each) | 300 |
| Gates (5 main + 5 DA) | 10 | 5,000 |
| Streak | 27 days | 675 |
| Badges (~41 achievements) | ~41 | ~2,500 est. |
| Games | ~9 | ~900 est. |
| CTF (1 box, 2 flags) | 1 | 500 |
| **Corrected estimate** | | **~25,175** |
| **Firestore XP** | | **44,925** |
| **Inflation** | | **+19,750 (78%)** |

---

## Key Takeaway

**Both accounts are inflated, but VORYX is inflated 2.3x more than EQ6.** VORYX's inflation is worse because:

1. More modules completed under the old 1000 XP/module rate
2. Concentrated duplication on Dark Arts (feh-01 through feh-10 appear in 3 formats each = 30 extra CF increment calls)
3. Math.max guard preserves the inflated value forever

**EQ6 has nearly 2x the real completions but is penalized by:**
1. Most work done after the rate fix (100 XP instead of 1000)
2. labsCompleted pollution inflating the *estimate* but not the *actual* XP (since CF increment is the real driver)
3. Linux modules (lm-series) completed recently at the correct rate

**The XP system is fundamentally broken in two ways:**
1. **Accumulative:** `FieldValue.increment()` + duplicate IDs = unbounded inflation
2. **Ratcheted:** `Math.max()` guard means inflation can never be corrected downward

The correct fix would be to recalculate XP deterministically from deduplicated completion data and write the corrected value — but this requires first cleaning the polluted arrays.

---

## Related Documents

- [XP Pipeline — Full Code Trace](XP_PIPELINE.md)
- [User Profile Modal](USER_PROFILE_MODAL.md)
- [CTF Arena](CTF_ARENA.md)
