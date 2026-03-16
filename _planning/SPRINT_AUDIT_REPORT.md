# Sprint Backlog Audit Report

**Date:** 2026-03-16
**Auditor:** Automated cross-reference against codebase + git history
**Backlog Version:** sprints.json lastUpdated 2026-03-16T04:25:46Z

---

## 1. Executive Summary

The backlog contains **573 items** across **38 series**. Of those, **405 (71%)** are marked done, **153 (27%)** are in backlog, **6 are blocked**, **4 are marathon-pending**, **4 are partial**, and **1 is open**.

**Critical finding:** The recent marathon waves (Waves 7-19) shipped massive amounts of content that was never reconciled back into the sprint backlog. At least **42 sprint items** are marked "backlog" despite the underlying content already existing in the codebase. This is the single largest integrity issue in the backlog.

Overall backlog health: **Fair.** The done items are genuinely done, the dependency graph is clean (no broken refs, no cycles), and there are no exact duplicates. But the marathon velocity outran sprint bookkeeping, creating a false picture of how much work remains.

---

## 2. Status Drift

### 2.1 Code Armory Languages (PL series) -- 11 items should be DONE

All 16 Code Armory language tracks shipped in Waves 6-9. Each has 11 HTML modules in `_app/houses/code/armory/`. These items are marked "backlog" but the work is complete:

| Item | Title | Shipped In |
|------|-------|-----------|
| PL-5 | C++ | Wave 7 (commit `edd96ec0`) |
| PL-6 | Go | Wave 7 |
| PL-7 | Rust | Wave 7 |
| PL-8 | Java | Wave 8 (commit `b0f24ba3`) |
| PL-9 | C# / .NET | Wave 8 |
| PL-11 | PowerShell | Wave 8 |
| PL-13 | PHP | Wave 8 |
| PL-14 | Ruby | Wave 8 |
| PL-15 | Assembly | Wave 7 |
| PL-16 | Swift & Kotlin | Wave 9 (commit `2536fab0`) |
| PL-17 | Lua, Perl, R | Wave 9 |

### 2.2 Algorithm Chamber (CS series) -- 12 items should be DONE

Wave 13 (commit `014bdbc6`) shipped the entire Algorithm Chamber: 12 courses, 122 files in `_app/houses/code/algorithm-chamber/`. All 12 subdirectories exist (discrete-math, graphs, complexity, data-structures, sorting, greedy, dp, strings, geometry, challenges, capstone, index.html).

| Item | Should be |
|------|-----------|
| CS-1 through CS-12 | **done** |

### 2.3 The Cortex / AI-ML (ML series) -- 15 items should be DONE

Wave 14 (commit `bb54c427`) shipped the complete Cortex track: 155 files in `_app/houses/ai/cortex/`. All 14 subdirectories exist (foundations, math, supervised, unsupervised, deep-learning, cnn, rl, nlp, generative, adversarial, cyber-ml, mlops, transformers, capstone).

| Item | Should be |
|------|-----------|
| ML-1 through ML-15 | **done** |

### 2.4 The Backbone (AN series) -- 14 items should be DONE

Waves 10-12 (commits `8256258f`, `f0d463ec`, `221393a7`) shipped the full Backbone: 166 files across 15 tracks in `_app/houses/web/backbone/`. Every track directory exists with 11 files each.

| Item | Should be |
|------|-----------|
| AN-2 through AN-16 | **done** (AN-1 already marked done) |

### 2.5 API Foundations (API series) -- 2 items should be DONE

Wave 15 (commit `b8e6db9c`) shipped 8 API courses including event-driven (webhooks/WebSockets) and the capstone. Directories `_app/houses/cloud/api/event-driven/` and `_app/houses/cloud/api/capstone/` exist.

| Item | Should be |
|------|-----------|
| API-8 | **done** (Webhooks, WebSockets & Event-Driven APIs) |
| API-9 | **done** (API Capstone) |

### 2.6 Messaging System (F-23 chain) -- Status inconsistency

F-23 is marked "marathon-pending" and F-23A through F-23F are "blocked", but the messaging system **already exists**:
- `_app/components/messaging/MessagingManager.js` (447 lines)
- `_app/components/messaging/inbox.html` (1571 lines)
- `_app/components/messaging/moderation.html` (1125 lines)
- `_app/components/messaging/dashboard-integration.js` (523 lines)
- `_app/components/messaging/SECURITY_RULES.md`

This was shipped in Wave 16-17 (commit `db1a2753`). F-23 and all sub-items (F-23A through F-23F) should be **done**.

### Total Status Drift: **~55 items** incorrectly marked as not-done.

---

## 3. Stale Items

Only 3 items were created before 2026-02-01 and remain not-done:

| Item | Status | Created | Last Updated | Assessment |
|------|--------|---------|-------------|------------|
| AR-4 | marathon-pending | 2025-12-01 | 2026-02-21 | **Legitimate.** IDP review is a manual grading task, not code. Keep as-is. |
| AR-5 | partial | 2025-12-01 | 2026-03-12 | **Active.** Recently updated. IDP drafting is ongoing. Keep. |
| PR-6 | marathon-pending | 2025-12-01 | 2026-02-21 | **Stale.** Marketing/demo assets have not been touched in 3+ weeks. Consider archiving or deprioritizing to low. |

---

## 4. Missing Work (Shipped but Untracked)

These features were shipped via commits but have **no corresponding sprint item**:

| Feature | Commit | Impact |
|---------|--------|--------|
| **Admin Console** (5-tab management UI + 6 Cloud Functions) | `0f37167d` | Major platform feature, no sprint tracking |
| **Dispatch System** (desk toys, launcher, stats panel, 9 achievements) | `26fe23ae`, `9fee8c6f`, `56425181`, `872580e1` | Entire product vertical untracked |
| **Dispatch Boxes** (HW-001, OS-001, PR-001, AD-001) | `0215eaa2`, `13ad4b8b`, `ebe25b86` | 4 troubleshooting boxes, no sprint items |
| **Roxy T-Rex Lockout System** | `e771aa33`, `64d072c8` | Anti-cheat enforcement feature |
| **HoneypotMaze + Desktop Goose + DevTools traps** | `a7a733e1` | Anti-tampering features |
| **SQLEngine** (in-memory SQL query simulator) | `812ef7bc` | Code Armory infrastructure |
| **TripWire bypass hardening** (6 vectors closed) | `19b91434` | Security hardening |
| **Signal Field Prep section** | `8383906d` | New Signal content section (untracked dir `_app/signal/sections/field-prep/`) |

---

## 5. Dependency Issues

### 5.1 No Broken Dependencies
All dependency references resolve to valid item IDs. No circular dependencies detected.

### 5.2 Resolved Blockers (deps done, item still blocked/backlog)
These items have all their dependencies satisfied but haven't been started or updated:

**Immediate unblock candidates (high priority, deps satisfied):**
- AR-24: Colosseum Multiplayer -- Co-op Sync Engine (dep AR-23 done)
- RS-2: Repo Scout -- GitHub API scraper (dep RS-1 done)
- RS-7: Repo Scout -- License compliance tracker (dep RS-1 done)
- HD-8: Engagement Metrics (dep HD-7 done)
- SC-5: Content Classifier & Auto-Tagging Engine (dep SC-2 done)

**Should be closed (content already shipped):**
- PL-5 through PL-17 (11 items, deps PL-1/PL-4 done, content exists)
- AN-2 through AN-16 (14 items, dep AN-1 done, content exists)
- CS-1 through CS-12 (12 items, content exists)
- ML-1 through ML-15 (15 items, content exists)
- API-8, API-9 (2 items, content exists)

### 5.3 F-23 Blocking Chain
F-23 (marathon-pending) blocks F-23A through F-23F (all blocked). Since the messaging system is actually shipped, this entire chain should be marked done, which would unblock F-23E.

---

## 6. Marathon Coverage Gaps

The marathon waves shipped content that maps to these sprint series, but the backlog was not updated:

| Marathon Wave | Sprint Series Affected | Items Not Updated |
|---------------|----------------------|-------------------|
| Wave 7 | PL (C++, Go, Rust, Assembly) | PL-5, PL-6, PL-7, PL-15 |
| Wave 8 | PL (Java, C#, PowerShell, PHP, Ruby) | PL-8, PL-9, PL-11, PL-13, PL-14 |
| Wave 9 | PL (Swift/Kotlin, Lua/Perl/R) | PL-16, PL-17 |
| Waves 10-12 | AN (Backbone networking) | AN-2 through AN-16 |
| Wave 13 | CS (Algorithm Chamber) | CS-1 through CS-12 |
| Wave 14 | ML (Cortex AI/ML) | ML-1 through ML-15 |
| Wave 15 | API (event-driven, capstone) | API-8, API-9 |
| Waves 16-17 | F (Messaging) | F-23, F-23A through F-23F |

**Total: ~55 items shipped by marathon but not reconciled in sprint backlog.**

Additionally, the marathon shipped features with no sprint items at all (see Section 4 -- Admin Console, Dispatch system, Roxy, etc.).

---

## 7. Duplicates Found

**No exact duplicate titles found.** No significant semantic overlaps detected between non-done items across different series.

The ES-15/ES-16 items (security findings auto-triaged by Nexus) may overlap with existing SEC-series items, but they appear to target different specific files. ES-15 (hardcoded passwords) and ES-16 (client-side flags) complement rather than duplicate SEC-1 through SEC-9.

---

## 8. Priority Recommendations

### Items that should be higher priority:
| Item | Current | Recommended | Reason |
|------|---------|-------------|--------|
| ES-15 | high | **critical** | Hardcoded passwords in 17+ client-side files is a live security issue |
| ES-16 | high | **critical** | Exposed flags visible via View Source undermines Arena integrity |
| QC-16 | low | **medium** | BLOB-001/002/004 inline code extraction affects code quality at scale |

### Items that should be lower priority:
| Item | Current | Recommended | Reason |
|------|---------|-------------|--------|
| PR-6 | high | **low** | Marketing assets are premature while product is still in rapid development |
| A-4 | medium | **low** | Tourist visa bypass is a nice-to-have, not blocking anything |
| BR-19 | medium | **low** | Mascot digital life system is polish, not core |

---

## 9. Series Health

| Series | Done/Total | % | Status |
|--------|-----------|---|--------|
| A (Architecture) | 4/5 | 80% | Healthy -- 1 backlog item (Tourist Visa) is low priority |
| AC (Accessibility) | 10/10 | 100% | Complete |
| AI (AI House) | 12/18 | 67% | Blocked on SC-4/SC-5 scraper work |
| AN (Backbone) | 1/16 | 6% | **CRITICAL DRIFT** -- should be 16/16 (100%). All content shipped. |
| API | 7/9 | 78% | **DRIFT** -- should be 9/9 (100%). |
| AR (Arena) | 21/28 | 75% | Healthy. Remaining items are multiplayer (backlog) + IDP review. |
| ARC | 1/1 | 100% | Complete |
| BH (Bug Hunting) | 20/20 | 100% | Complete |
| BR (Branding) | 18/19 | 95% | 1 low-priority backlog item |
| CS (Algorithm Chamber) | 0/12 | 0% | **CRITICAL DRIFT** -- should be 12/12 (100%). All content shipped. |
| DA (Dark Arts) | 29/30 | 97% | 1 low-priority backlog item (DA-20 Tennessee extraction) |
| DL (Digital Life) | 5/5 | 100% | Complete |
| DO (DevOps) | 99/99 | 100% | Complete |
| EHE | 16/16 | 100% | Complete |
| ES (EduScan) | 14/16 | 88% | 2 security items in backlog |
| F (Features) | 28/47 | 60% | Mixed. 6 blocked on F-23 (should be resolved). Several genuine backlog items. |
| GF (Grant Finder) | 0/9 | 0% | Untouched. Genuine backlog -- future product vertical. |
| HD (Handler Dashboard) | 8/11 | 73% | 3 engagement/analytics items in backlog |
| JS (Job Search) | 0/10 | 0% | Untouched. Genuine backlog -- future product vertical. |
| L (Linux Mastery) | 15/15 | 100% | Complete |
| M (Migration) | 11/11 | 100% | Complete |
| ML (Cortex) | 0/15 | 0% | **CRITICAL DRIFT** -- should be 15/15 (100%). All content shipped. |
| MX | 6/6 | 100% | Complete |
| NE (Neon Server) | 0/10 | 0% | Untouched. Hardware project, genuine backlog. |
| NXS (Nexus) | 1/1 | 100% | Complete |
| PL (Code Armory) | 7/22 | 32% | **MAJOR DRIFT** -- should be 18/22 (82%). 11 shipped items unmarked. |
| PR (Product) | 6/7 | 86% | 1 stale marathon-pending item (PR-6) |
| QC (Quality) | 16/18 | 89% | 1 open, 1 marathon-pending |
| R | 10/10 | 100% | Complete |
| RS (Repo Scout) | 1/9 | 11% | Genuine backlog. Infrastructure not yet built. |
| SB (Sandbox) | 0/14 | 0% | Brand new series (created 2026-03-16). Genuine backlog. |
| SC (Scraper Core) | 4/8 | 50% | Active work. 2 partial, 2 backlog. |
| SEC (Security) | 9/9 | 100% | Complete |
| SIG (Signal Visual) | 0/11 | 0% | Brand new series (created 2026-03-15). Genuine backlog. |
| TC | 13/13 | 100% | Complete |
| WSA | 11/11 | 100% | Complete |

**20 of 38 series are 100% complete.** After reconciliation, that number rises to **25 of 38.**

---

## 10. Blocked Item Triage

| Item | Blocked On | Assessment |
|------|-----------|------------|
| F-23A | F-23 (marathon-pending) | **Should be unblocked.** Messaging system is shipped. Mark F-23 and all sub-items done. |
| F-23B | F-23A (blocked) | Same -- already shipped. |
| F-23C | F-23B (blocked) | Same -- MessagingManager.js exists (447 lines). |
| F-23D | F-23C (blocked) | Same -- inbox.html exists (1571 lines). |
| F-23E | F-23D (blocked) | Same -- dashboard-integration.js exists (523 lines). |
| F-23F | F-23A (blocked) | Same -- moderation.html exists (1125 lines). |

**All 6 blocked items should be marked done.** There are no legitimately blocked items remaining in the backlog.

---

## 11. Action Items

### Immediate (bookkeeping fixes):

1. **Mark 55 items as done** -- reconcile marathon wave deliveries:
   - PL-5, PL-6, PL-7, PL-8, PL-9, PL-11, PL-13, PL-14, PL-15, PL-16, PL-17 (11 items)
   - CS-1 through CS-12 (12 items)
   - ML-1 through ML-15 (15 items)
   - AN-2 through AN-16 (14 items, AN-1 already done)
   - API-8, API-9 (2 items)
   - F-23, F-23A, F-23B, F-23C, F-23D, F-23E, F-23F (7 items -- unblock + mark done)

   After this fix: **460 done / 573 total (80%)** instead of current 405/573 (71%).

2. **Escalate ES-15 and ES-16** to critical priority (live security issues).

3. **Create sprint items** for shipped but untracked features:
   - Admin Console (5-tab UI + Cloud Functions)
   - Dispatch System (desk, toys, launcher, achievements)
   - Dispatch Boxes (HW-001, OS-001, PR-001, AD-001)
   - Roxy T-Rex Lockout
   - HoneypotMaze + anti-tampering traps
   - SQLEngine
   - Signal Field Prep section

4. **Deprioritize PR-6** (Marketing & Demo Assets) from high to low.

### Short-term:

5. **Establish a marathon reconciliation step** -- after each marathon wave, run a script to cross-check delivered content against sprint items and auto-mark completions.

6. **Review PL-18, PL-19, PL-20, PL-21** -- these are the only remaining PL backlog items. PL-18 (comparison tool) and PL-20 (security guide) may also have been delivered by the marathon. Verify manually.

7. **Triage SC-4 and SC-6** (partial) -- these scraper items block the AI House content hub items (AI-13 through AI-18). Determine if scraper work is still needed or if marathon content renders it moot.

### Long-term:

8. **Decide on GF, JS, NE, RS series** -- these 4 series (38 items total) are 0% complete and represent future product verticals. They should either be moved to a "future" status or given a target sprint/quarter.

9. **SB series assessment** -- the 14 sandbox items were just created today. The WASM tier (SB-1 through SB-5) is independent. The container tier (SB-6 through SB-14) depends on NE-6 (Neon Server Docker setup). Sequence accordingly.

---

*End of audit. 573 items reviewed, 55 status corrections identified, 7+ untracked features found, 0 broken dependencies, 0 duplicates.*
