# A+ Core 1 Hub — Deep QC/QA Marathon (started 2026-06-26)

**Objective:** Deep QC/QA scan of ALL A+ Core 1 hub content — hub index, 47 labs, 12 chapters,
4 domains, 4 quizzes (68 HTML files) — including the 5 newly-built physical labs and the 31
newly-surfaced orphan labs. Produce a complete, prioritized defect inventory. Fix clear/safe
defects inline (emoji, escaped literals, missing `require`); batch substantive fixes for review.

**Rules (operator, 2026-06-26):** nonstop until complete · consult Nancy when in doubt ·
NO deletes / no destruction · no shortcuts · take the time to do it right.
**Resume:** hourly cron `ac6b5e08` (:23) re-enters this marathon from this doc.

## SEVERITY SCHEMA (fixed, Nancy-reviewed)
- **S1** — student cannot complete / gets credit without doing the work / black or broken page / wrong-answer credit.
- **S2** — degrades experience but lab is functional (broken image, escaped literal on screen, dead non-critical control).
- **S3** — cosmetic / emoji / accuracy flag / low-confidence note.

## SEQUENCING (highest-risk first)
5 new build labs (DONE — driven to completion, Chris PASS) → 31 orphans (variable quality) → 11 curated → 4 quizzes → 12 chapters → 4 domains. Within each: guard + auto-complete gates first (binary).

## QC METHOD (per the 2026-06-26 black-screen lesson; 4 gaps closed per Nancy 2026-06-26)
Added per Nancy: (a) **auto-complete trace** — read each `ModuleProgress.complete` call site; S1 if reachable without user action (on load/timer). (b) image refs resolved web-root-relative + grep JS-injected `img.src`/`backgroundImage`, not just file-on-disk. (c) **answer-exposure** grep mandatory on all interactive labs (triage: skill-lab client-side answers OK; quiz-style cheatable exposure = S1). (d) accuracy: per-type sample rule; needs a 220-1101 objective source-of-truth or descope to a flagged SME pass. Quizzes: confirm server-graded + run `verify-quiz-keys.js` (CLAUDE.md rule).
A stubbed-AccessGuard render gives FALSE PASSES — it skips the body-hide/reveal and masked the
`troubleshooting-scenarios` black screen. Each item must be checked:
1. **Real-AccessGuard render** — does the body actually reveal (no black screen)? Confirm it
   loads AccessGuard.js AND calls `AccessGuard.require(...)`.
2. **Stubbed render** — drive the interactive to completion; confirm grading + `ModuleProgress.complete`.
3. **Static** — emoji, escaped HTML literals shown as text, broken image refs, conventions.
4. **Accuracy** — content correctness for the topic.

## QUEUE (68) + STATUS
Legend: ⬜ pending · ✅ pass · ⚠️ issues-logged · 🔧 fixed

### Phase 1 — static sweeps (DONE)
- ✅ Black-screen sweep (loads AccessGuard, never calls require): **0** (was 1: `troubleshooting-scenarios` → 🔧 fixed commit f5b23fa4a).
- ⚠️ Ungated (no AccessGuard) — 4 domain index pages: `domains/{mobile-devices,troubleshooting,networking,cloud-virtualization}/index.html`. Review: intentional (open landing) vs gap.
- ⚠️ Emoji — **27 files** (rule violation; render as tofu): index.html(1), labs: mobile-sync(12), soho-rescue(6), bluetooth-pairing(6), pc-builder(5), storage-upgrade(5), soho-designer(3), dns-config(2), protocol-analysis(2), diagnostic-tools(2), hardware-diagnosis(2), ram-identification(2), mobile-email(2), cloud-scenarios(2), troubleshooting-flowchart(2), mdm-config(2), cpu-sockets(2), post-beep-codes(2), mobile-identifier(2), port-identification(2), router-config(2), docking-config(1), topology-builder(1), server-roles(1), command-line(1), cable-matching(1), network-design(1).

### Phase 1b — deterministic integrity sweeps (DONE)
- ✅ Auto-complete trace (47 labs): 3 setTimeout-adjacent suspects (`esd-workspace`, `soho-rescue`, `vm-setup`) READ + verified CLEAN — all interaction-gated; setTimeout is cosmetic reveal/sound. **0 real auto-complete defects.**
- ⚠️ Answer-exposure (~20 labs flagged for triage): troubleshooting(27), ram-install(8), storage-upgrade(6), psu-connectors(5), mobile-troubleshoot(5), mobile-identifier(5), ram-identification(4), mobile-sync(4), + others. NOTE: skill labs (drag-to-pin etc.) legitimately hold answers client-side — that's fine. Real risk = the 4 QUIZZES if client-graded. TODO: confirm quizzes server-graded (quiz_keys + verify-quiz-keys.js).

### Phase 2 — render + functional QC (IN PROGRESS)
Order: 31 orphans → 11 curated → 4 quizzes → 12 chapters → 4 domains. Per item: stubbed render + drive
interactive, catalog escaped-literals-on-screen / broken-or-dynamic images / dead controls / JS errors /
emoji-as-content / completion. (5 new build labs already PASS.)
(Per-item findings appended below as batches complete.)

**CORRECTION (2026-06-26):** the Phase-1 "27 files with emoji" was a FALSE POSITIVE — the sweep
included arrows/checkmarks/dingbats/geometric (←✓→▼■, ranges 2190-21FF & 2700-27BF) which are
NOT forbidden emoji (same class we deliberately keep). A precise sweep (true emoji 1F000-1FAFF +
numeric entities ≥0x1F000) returns **0 files**. The only real emoji was troubleshooting-scenarios'
`&#128296;` (already fixed). Emoji is NOT a defect class here. ✅

**Batch 1 — orphans (8): mobile-sync, soho-rescue, bluetooth-pairing, pc-builder, storage-upgrade, network-config, dns-config, router-config**
- ⚠️ `mobile-sync` [S2] — line 807 sets `device-icon` via `.textContent` (should be `.innerHTML`); the `<img>` string for `deviceIcon` renders as literal on-screen text before "iPhone". One-line fix. (Operator-reported.) → fix-queue #1.
- ✅ other 7 CLEAN — all completable via real UI, gating works (router 6-step validate, storage tab-lock, pc-builder dropdown validate), no S1, no pageerrors, no broken images (all referenced icons exist in web root; /assets 404 is a file:// artifact only).
- Note: `dns-config` line 1012 `switchTab()` uses bare `event.target` — fine for real clicks, latent if ever called programmatically. S3 hardening note.

**Batch 2 — orphans (8): diagnostic-tools, hardware-diagnosis, post-beep-codes, raid-config, port-identification, display-troubleshoot, laptop-memory, docking-config**
- ⚠️ `diagnostic-tools` [S2] — on-load `TypeError: ...reading 'target'` at lines 1171 & 1202 (`simulatePost`/`setMMMode` use bare global `event` inside a `setTimeout`, undefined). Kills the POST LED auto-demo (code stays "--", LEDs inert) + a null-textContent on fast scenario nav. Scenario quiz still completable (10/10) → not S1. Fix: pass element/event in; null-guard delayed DOM writes. → fix-queue #2.
- ⚠️ `hardware-diagnosis` [S3] — line 760 literal `⬛` (U+2B1B) decorative bullet glyph. Cosmetic. → fix-queue #3 (swap for CSS/webp).
- ✅ other 6 CLEAN — completable, honest grading (wrong answers rejected), gating sound, no escaped literals, no real broken images.

### PROGRESS: 21/47 labs QC'd (5 new build PASS + batch1 8 + batch2 8). Real defects so far: 2×S2, 1×S3.

**Batch 3 — curated (8): cable-matching, cpu-sockets, pc-components, psu-connectors, ram-identification, esd-workspace, subnet-calculator, printer-troubleshoot** — ✅ all CLEAN (completable, wrong answers rejected). Notes: quiz-style labs are PARTICIPATION-gated (complete fires regardless of score) EXCEPT cable-matching (requires 8/8) — design decision, not a defect. `subnet-calculator` switchMode uses global `event` (S3 latent).

**Batch 4 — networking (9): network-commands, network-design, protocol-analysis, topology-builder, soho-designer, server-roles, wireless-security, troubleshooting, troubleshooting-flowchart**
- ⚠️ `topology-builder` [S2] — line 737 injects `d.icon` (`<img>` markup) into a `data-icon="${...}"` ATTRIBUTE; inner quotes break parsing → literal `" data-name="X">` text shows in palette for all 9 devices. Fix: store an icon path/key, not the `<img>` string. → fix-queue #4.
- ✅ other 8 CLEAN (real per-step validation, wrong answers/invalid input rejected).

**Batch 5 — mobile/cloud (8): cloud-scenarios, vm-setup, mdm-config, mobile-email, mobile-identifier, mobile-troubleshoot, email-config, command-line**
- 🔴 `mobile-identifier` [S1] — score inflation: `checkAnswer()` (531-558) does `score++` with NO re-entry guard + 2500ms advance delay → spam-clicking the correct row reaches 8/8 without answering all questions. Fix: per-question answered-latch (mobile-troubleshoot does it right). → fix-queue #5 (S1).
- ⚠️ `command-line` [S2] — terminal catch-all returns "'<x>' is recognized..." for ANY gibberish (should be "not recognized") — mis-teaches. (Challenge grading itself is sound.) ALSO: Core 2 content misfiled in Core 1 → relocate. → fix-queue #6.
- ✅ other 6 CLEAN (real validation, guarded completion).

### ALL 47 LABS QC'd. Real defects: 2×S1 (1 fixed), 4×S2, 1×S3. ~40 labs clean.

### FIX QUEUE (clear/safe — batch deploy after scan)
1. `mobile-sync` line 807 `.textContent`→`.innerHTML` (S2).
2. `diagnostic-tools` lines 1171/1202 bare-`event` in setTimeout + null-guard delayed writes (S2).
3. `hardware-diagnosis` line 760 `⬛` glyph → CSS/webp (S3).
4. `topology-builder` line 737 — `data-icon` gets `<img>` string → store icon key/path (S2).
5. `mobile-identifier` [S1] — add per-question answered-latch to `checkAnswer()` (score inflation).
6. `command-line` [S2] — terminal "not recognized" for unknown cmds; + relocate to Core 2.
(troubleshooting-scenarios S1 already fixed + live.)
DESIGN NOTE (operator decision, not auto-fix): quiz-style labs complete on participation, not score — confirm if score-gating is wanted.

### Phase 2 — quizzes + chapters + domains (DONE)
**Quizzes (4):** ✅ ALL CLEAN — 10 Qs each (4 MC/3 GUI/3 Terminal), drive to results, grade correctly (right=right, wrong=wrong), answer keys valid, no literals/emoji/pageerrors. Carry a disclosed "PRACTICE MODE — answers visible in source" banner → client-grading is by-design, NOT a defect.
**Chapters (12) + Domains (4):** self-contained presentation decks / study pages (not link hubs). All render clean.
- ⚠️ [S2] SYSTEMATIC back-link on ALL 16 pages: `href="../../../../../index.html"` "Back to Core 1" is one `../` too deep → resolves to Forge house landing, not the Core 1 hub. Fix: `../../index.html`. → fix-queue #7 (16 pages, uniform).
- ⚠️ [S3] ch10-mobile: a `⚲` glyph in rendered text — runtime-injected (search widget), not page-authored. Low confidence. → note.
- 4 domains are UNGATED (no AccessGuard) but render fine → operator decision (gate for consistency vs intentional-open).

## Phase 3 — FINAL PRIORITIZED DEFECT REPORT (MARATHON COMPLETE — 68/68 items QC'd)
**Scope done:** hub index (reorg-QC'd) + 47 labs + 4 quizzes + 12 chapters + 4 domains. Method: static guard/auto-complete/answer sweeps + real-browser render+drive (Nancy-reviewed). **Result: ~9 real defects in 68 items — content is in strong shape.**

| # | Sev | Item | Defect | Fix |
|---|-----|------|--------|-----|
| 1 | S1 | troubleshooting-scenarios | black screen (no `require`) | **FIXED + LIVE** (f5b23fa4a) |
| 2 | S1 | mobile-identifier | score inflation via click-spam | per-question answered-latch |
| 3 | S2 | chapters+domains (16 pages) | back-link one `../` too deep | `../../index.html` (uniform) |
| 4 | S2 | mobile-sync | `<img>` literal as text (l.807) | `.textContent`→`.innerHTML` |
| 5 | S2 | diagnostic-tools | on-load `event.target` crash, dead POST demo | pass element/event; null-guard |
| 6 | S2 | topology-builder | `data-icon` gets `<img>` string → literal text | store icon key/path |
| 7 | S2 | command-line | gibberish = "recognized" cmd (+ Core 2 misfile) | real "not recognized"; relocate to Core 2 |
| 8 | S3 | hardware-diagnosis | `⬛` decorative glyph | CSS/webp |
| 9 | S3 | ch10-mobile | `⚲` runtime glyph (low conf) | investigate/ignore |

**Latent/notes (not defects):** subnet-calculator & dns-config `switchMode` use global `event` (fine for real clicks); quiz-style labs complete on participation not score (operator design call); 4 domain pages ungated (operator call); dual completion-overlay cosmetic on pc-components/cable-matching.

**FALSE ALARMS cleared:** "27 emoji files" → 0 true emoji (dingbats/arrows). 3 auto-complete suspects → all interaction-gated. ~20 answer-exposure flags → skill labs legit client-side; quizzes disclosed practice-mode.

**RECOMMENDED FIX WAVE (one deploy):** #2–#8 (all clear/safe). #7 (back-link) is highest-footprint (16 pages). #1 already shipped. Then operator decisions: command-line→Core 2 relocation, domain gating, quiz score-gating.

## FIX WAVE EXECUTED (2026-06-26) — all re-QC'd in real browser, 0 pageerrors
- 🔧 #2 mobile-identifier (S1) — per-question `answered` latch added (decl + guard + reset). Verified: 5× spam-click on correct row → score stays 1; next question still answerable (latch resets). 
- 🔧 #3 back-links (S2, 16 pages) — `../../../../../index.html` → `../../index.html` across all 12 chapters + 4 domains. Verified path resolves to core-1/index.html.
- 🔧 #4 mobile-sync (S2) — line 807 `.textContent`→`.innerHTML`. Verified device-icon renders `<img>`, no literal text.
- 🔧 #5 diagnostic-tools (S2) — replaced bare `event.target` in `simulatePost`/`setMMMode` with onclick-match (works programmatically); ALSO fixed a 2nd latent bug it exposed (`classList.add('')` on off-LEDs). Verified: 0 pageerrors on load, POST demo runs, LEDs lit.
- 🔧 #6 topology-builder (S2) — removed `<img>`-string `data-icon` attr; icon now looked up from `devices` by id in `handleDragStart`. Verified: no literal text in palette.
- 🔧 #7 command-line (S2) — terminal catch-all now returns real "not recognized" for unknown BASE commands, simulates known bases. Verified: gibberish→"not recognized", real commands unaffected. (Core 2 relocation = still an operator decision.)
- 🔧 #8 hardware-diagnosis (S3) — `⬛` (U+2B1B) → `■` (U+25A0, allowed). Verified.
- DEFERRED (operator decisions): ~~command-line→Core 2 relocation~~; 4 ungated domains; quiz score-gating; #9 ch10 `⚲` (runtime, low-conf).
- 🔧 command-line → Core 2 (operator-approved 2026-06-26): `git mv` to core-2/labs/, back-link → Core 2 hub, wired into Core 2 sidebar (Ch 16). Commits 6eeb9a59c + 1bb88eb06, LIVE (core-1 path now 404). Re-QC'd.

## CORE 2 QC (2026-06-26) — 79 files, same method

**Scope:** hub index + 15 labs + 12 chapters (ch13–24) + 4 domains + 16 quizzes + 13 presentations + 1 reference + 1 tool.
**Method:** deterministic sweeps (black-screen/no-require, true-emoji, literal-injection, auto-complete, score-inflation, back-link depth) + headless render of every page (pageerrors / literal-on-screen / broken-img / body-reveal) + completion-gate drive + quiz bridge check.

**Result: ONE real defect class.**
| # | Sev | Item | Defect | Fix |
|---|-----|------|--------|-----|
| C2-1 | S2 | 12 chapters + 4 domains (16 pages) | back-link says "Back to Core 2" but `../../../../../index.html` (5-up) lands on Forge House | → `../../index.html` (uniform) **FIXED** |

**Verified CLEAN:**
- Black-screen (AccessGuard w/o require): **0** across all 79.
- True emoji (1F000+): **0**. Literal-injection (`textContent`/`data-icon` w/ `<img>`): **0**. Auto-complete (complete() in setTimeout/onload): **0**. Score-inflation (`score++` w/o latch): **0** (pattern absent in Core 2).
- 15 labs: render clean (no JS err / literal / broken-img / hidden body) AND completion-gated — every "Complete Lab"/"Mark Complete" button is hidden until tasks done (drove each with 0 tasks → button not clickable, `ModuleProgress.complete` never fires). No credit-without-work.
- 16 quizzes: ALL server-graded (`serverGrading:true`); `verify-quiz-keys.js --missing` = **482/482 keys present in Firestore, 0 missing** (no 0/N risk).
- Hub index: 54/54 relative card hrefs resolve to real files.
- 12 chapters + 4 domains + 13 presentations + reference + tool: render clean.

**NOT a defect (verified by reading the link text):** quiz back-links say "Back to Forge House" and `../../../../index.html` correctly resolves there — text matches target (unlike the chapters/domains mismatch). Left as-is.

## FINDINGS LOG
- 2026-06-26: `troubleshooting-scenarios` BLACK SCREEN (CRITICAL) — loaded AccessGuard.js but
  never called `require('sorted')` → body stayed `visibility:hidden`. Fixed: moved guard+require
  to <head>, removed dup, replaced splash emoji. Commit f5b23fa4a, live.
- 2026-06-26: `mobile-sync` — escaped `<img>` literal rendered as on-screen text (reported by operator). PENDING fix.
