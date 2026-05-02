# Stragglers Branch — Deploy Notes (2026-05-02)

> **Purpose:** Pre-deploy disclosure for any operator running the next firebase deploy after the Stragglers branch lands on master. Captures regressions/changes that affect students, with scheduling guidance.

---

## Quick reference

| Pre-deploy gate | Status | Action required before deploy |
|---|---|---|
| STR-40 quiz_keys | TOOL BUILT, operator review needed | See "Quiz key generation" below |
| PROG-003 student progress regression | DOCUMENTED HERE | Read "PROG-003 disclosure" below; schedule deploy outside class hours |
| Incubator visual hierarchy | FIXED on branch | None — visual distinction added |
| Card description truncation | FIXED on branch | None — CSS line-clamp added |

---

## PROG-003 disclosure: WSA + A+ Core 2 students lose phantom completion credit

### What changed

Branch commit `bd3556ab` renamed the `ModuleProgress.complete()` localStorage key in 65 `.module.html` files. Previously, all files in a series wrote to the same shared key (e.g., all 19 WSA `cloud-presentation.module.html` files used key `cloud-presentation`). The fix gives each file a unique module-scoped key (e.g., `cloud-wsa-m04-presentation`).

### Impact on existing students

After deploy, students with localStorage records under the old shared keys will see **0/N progress** on these series:

| House | Series | Files | Old key | New key pattern |
|---|---|---:|---|---|
| Cloud (WSA) | guilab labs | 17 | `cloud-guilab` | `cloud-wsa-mNN-guilab` |
| Cloud (WSA) | pslab labs | 17 | `cloud-pslab` | `cloud-wsa-mNN-pslab` |
| Cloud (WSA) | presentations | 19 | `cloud-presentation` | `cloud-wsa-mNN-presentation` |
| Forge (A+ Core 2) | chapters | 12 | `index` | `forge-aplus-core2-chNN` |

### Why no migration script

The old shared key only retained the LAST writer's completion record (and only the first writer's XP per session, due to the `isFirstCompletion` bug being fixed). So localStorage holds at most ONE completion per series, with no way to identify which of the N modules the student actually completed. Migration option-b (fan out to all N) would lie. Migration option-c (dual-write) would just delay the regression.

Per Nancy round-2 + round-4 audits: **acceptable regression**. Students re-complete the module(s) they actually want credit for, this time receiving correct per-module XP/Firestore sync (which the bug was suppressing for everything beyond their first completion).

### Scheduling recommendation

Deploy this branch **outside active class hours** for these courses:
- WSA (Windows Server Administration) — cloud house
- A+ Core 2 (CompTIA A+ 220-1102) — forge house

If you cannot schedule outside class hours, post a notice at the affected hub indices BEFORE deploy explaining the one-time progress reset and the fix it enables.

---

## Quiz key generation (STR-40)

### What's missing

16 server-graded quizzes call `gradeQuiz()` Cloud Function but have no entries in `functions/quiz_keys.json` (or live Firestore). Students see "Quiz key not found" → 0/N grade. **Pre-existing master defect** (commit 6357eb71), not introduced by Stragglers branch.

| Quiz | Type | Questions |
|---|---|---:|
| fw-w1-logical | weekly | 15 |
| fw-w1-physical | weekly | 15 |
| fw-w2-malware | weekly | 15 |
| fw-w2-wireless | weekly | 15 |
| fw-w3-os-security | weekly | 15 |
| fw-w3-social | weekly | 15 |
| fw-w3-workstation | weekly | 15 |
| fw-w4-data | weekly | 15 |
| fw-w4-mobile | weekly | 15 |
| fw-w4-soho | weekly | 15 |
| fw-midterm | exam | 25 |
| fw-final | exam | 40 |
| fl-midterm | exam | 25 |
| fl-final | exam | 40 |
| divergent-csp-midterm | exam | unknown* |
| divergent-csp-final | exam | unknown* |

\* CSP midterm/final use a non-standard parser-resistant exam structure. Manual extraction needed.

### Operator workflow (per CLAUDE.md Rule #9)

```bash
cd functions

# 1. Generate draft from explanation text + cross-quiz pool matching
node draft-fw-quiz-keys.js
# → produces fw-quiz-keys-DRAFT.json with answers + flags

# 2. Review the flagged questions (~85% of 280 require manual review)
#    The DRAFT.json includes per-question context: question text, options,
#    suggested answer index, confidence flag.
#    Open in editor; for each flagged question, verify the suggested
#    answer against the question + presentation source-of-truth, edit
#    `answers_DRAFT[N]` if wrong.

# 3. Rename to drop _DRAFT
mv fw-quiz-keys-DRAFT.json fw-quiz-keys.json

# 4. Write seed-fw-keys.js (model on functions/seed-aplus-core1-keys.js)

# 5. Dry run, then push
node seed-fw-keys.js --dry-run
node seed-fw-keys.js

# 6. Verify per CLAUDE.md Rule #9
node verify-quiz-keys.js fw-w1-logical fw-w1-physical fw-w2-malware \
  fw-w2-wireless fw-w3-os-security fw-w3-social fw-w3-workstation \
  fw-w4-data fw-w4-mobile fw-w4-soho fw-midterm fw-final \
  fl-midterm fl-final divergent-csp-midterm divergent-csp-final
# Confirm "Verification PASSED" for all.
```

### Why the draft requires review

The auto-extractor matches explanation text against option text (full containment 100pt, first-half presence 30pt, keyword overlap 3pt/word). Tied scores within 15pt → flagged. Cross-quiz pool fallback (for exam questions without explanations) uses Jaccard word similarity — best for identical question text, fragile for paraphrased variants.

237 of 280 questions (85%) flagged for review. The auto-extractor's purpose is to surface the highest-confidence answers and provide structured per-question context to make manual review fast — NOT to replace verified human input.

### Alternative: defer the deploy

If quiz key generation cannot complete before deploy is needed, the alternative is to leave these 16 quizzes returning "Quiz key not found" (current production state — no regression). Document for affected students that the quizzes aren't yet graded; deliver grades manually via instructor.

---

## Incubator visual hierarchy + card-desc truncation (FIXED on branch)

Both fixed in `_app/houses/<house>/incubator/index.html` template + house index pages updated to label incubators "Incubator" with secondary tier styling. No additional pre-deploy action required.

---

## Bottom line

| Action | Required before deploy? |
|---|---|
| Schedule deploy outside WSA/A+ Core 2 class hours | YES (or post a heads-up) |
| Generate + verify 16 quiz keys (STR-40) | YES (or accept current "Quiz key not found" state) |
| Re-test incubator hubs visually on preview channel | YES (always, per QC protocol) |
| Run `node nexus.js full` post-deploy from master | YES (per CLAUDE.md sequence) |

This branch does NOT introduce STR-40. It surfaces the bug via PROG-003 validator (which would also have surfaced it from master). The decision to fix STR-40 before this deploy vs the next is operator's call.
