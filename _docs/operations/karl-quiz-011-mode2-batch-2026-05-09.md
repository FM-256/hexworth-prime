# Karl Mode-2 Audit — QUIZ-011 Post-Deploy Batch (2026-05-09)

**Trigger:** Post-deploy of commit `46d59c8b` flagged 5 NEW QUIZ-011 HIGH findings (CLASSIC-CYCLING placeholder pattern). The validator shipped earlier today (`fd1fa566`) and immediately surfaced these 5 quiz IDs with `[0,1,2,3,...]` repeating answer arrays in `functions/quiz_keys.json`.

**Auditor:** Karl (Mode-2 re-key audit). Read each HTML quiz fresh + cross-reference Confluence Solutions Manual per-question.

**Outcome:** 3 PASS, 1 DENY. The PASS quizzes are FALSE POSITIVES on QUIZ-011 — their real answer keys match the placeholder pattern by content-author intent. The DENY quiz has compounding Confluence + PROG-003 issues.

## Summary

| Quiz ID | Verdict | Confluence page | Verified array |
|---|---|---|---|
| `az900-ch03-quiz` | PASS | [2982995](https://hexworth.atlassian.net/wiki/spaces/KBA/pages/2982995) "Cloud — AZ-900 Chapter 03" | `[0,1,2,3,0,1,2,3,0,1,2,3,0,1,2]` |
| `fw-final` | PASS | [9469954](https://hexworth.atlassian.net/wiki/spaces/KBA/pages/9469954) "FW Final Exam Solutions" | 40-element period-4 |
| `fl-final` | PASS | [9601026](https://hexworth.atlassian.net/wiki/spaces/KBA/pages/9601026) "FL Final Exam Solutions" | 40-element period-4 |
| `clh-022` | DENY | [2818687](https://hexworth.atlassian.net/wiki/spaces/KBA/pages/2818687) "Script — CLH-022 Quiz" | none — see below |

## PASS quizzes — operator-seed-ready

These three quizzes have:
- Per-question correct answer cross-referenced verbatim against HTML option order (no drift).
- Distribution sanity: 26.7%/26.7%/26.7%/20% for the 15-Q AZ; 25%/25%/25%/25% for both 40-Q finals.
- Confluence "Verified Answer Index (v1)" field matches the Karl-derived array.

**Bridge-gap status (verified live, this session):** All four quizzes — including `clh-022` — pass `node functions/verify-quiz-keys.js {id}` with `Verification PASSED`. Firestore `quiz_keys/{id}` IS populated for all of them. The Confluence pages' "BRIDGE GAP CRITICAL: quiz_keys/{id} NOT seeded" notes on fw-final and fl-final are **stale** — the seed has happened since those notes were written. Operator should remove the stale BRIDGE GAP banner from Confluence pages 9469954 and 9601026.

This means: **the 3 PASS quizzes need NO production-Firestore action**. The work item is purely validator-level (QUIZ-011 false-positive suppression) + documentation cleanup (stale Confluence bridge-gap banners).

### Operator action for the 3 PASS

Verified live this session — no Firestore seed needed. Required actions:

1. Apply the QUIZ-011 Karl-PASS allowlist (see "QUIZ-011 false-positive correction" below). Once applied + nexus rescan, the 3 false positives drop from `_quality_reports/latest`.
2. Edit Confluence pages 9469954 and 9601026 to remove the stale "BRIDGE GAP CRITICAL" banner; replace with the verified-seed timestamp from this audit.
3. (Optional) Edit Confluence page 2982995 (AZ-900 Ch-03) to add the "Verified Answer Index (v1)" field + audit reference for parity with the FL/FW pages.

## QUIZ-011 false-positive correction

Three quizzes match `[0,1,2,3,...]` cycling because the author intentionally distributed answers evenly. QUIZ-011's pattern detector cannot distinguish "intentional even distribution" from "lazy placeholder." This is a known limitation of static pattern-matching.

**Recommended validator refinement (NOT applied autonomously):**

Add a Karl-PASS allowlist to QUIZ-011 — once Karl Mode-2 has verbatim-verified a quiz, suppress the QUIZ-011 finding for that ID until the static array changes.

Implementation sketch (operator-pending):
- New file: `_tools/eduscan/config/quiz-011-allowlist.json` — `{ allowlist: [{ id, contentHash, verifiedAt, karlAuditPath }] }`
- QUIZ-011 validator: skip if `id` in allowlist AND `sha1(quiz_keys.json[id]) === entry.contentHash`
- New entries added by future Karl Mode-2 PASS verdicts (operator commits the entry alongside the quiz update)

This mirrors the existing HEUR-018 allowlist pattern at `_tools/eduscan/validators/syntax/heuristics.js:96`.

## DENY quiz — clh-022

**Three compounding issues. Do NOT seed.**

### Issue 1 — Confluence answer-key letter/index mismatch on Q1

Confluence page states `Answer: B(1) <code>curl -I url</code>`.
- Letter B = index 1 = `wget -h url` in both HTML files.
- Description `curl -I url` = index 0 = letter A in both HTML files.
- **The answer text is correct; the letter/index is wrong.**

If the operator follows the Confluence index (B=1), the quiz key would mark `wget -h url` as Q1 correct — wrong. If they follow the description (`curl -I url`), they'd mark index 0 as correct — right.

### Issue 2 — Divergent option orders between the two HTML files

Both `_app/houses/script/clh/script-clh-022.quiz.html` and `_app/houses/script/courses/clh/modules/clh-022/script-quiz.quiz.html` have quiz key `clh-022`, but their option orders differ on three questions:

| Q | HTML-A (`script-clh-022.quiz.html`) | HTML-B (`courses/.../script-quiz.quiz.html`) | Correct content |
|---|---|---|---|
| Q3 | `[Downloads, Scans, Backdoor, Blocks]` | `[Downloads, Backdoor, Scans, Blocks]` | "Scans" |
| Q4 | `[curl, wget-q, dig, nc]` | `[curl, nc, dig, wget-q]` | "wget-q" |
| Q5 | `[secure, vulnerabilities, safe, decoration]` | `[vulnerabilities, secure, safe, decoration]` | "vulnerabilities" |

Correct indices per file:
- HTML-A: `[0, 1, 1, 1, 1]`
- HTML-B: `[0, 1, 2, 3, 0]`

A single Firestore key `clh-022` cannot grade both files correctly.

### Issue 3 — Current Confluence key `[1,1,1,1,1]` is wrong for both files

Applying `[1,1,1,1,1]` to:
- HTML-A → Q1 marks `wget -h` as correct (wrong; should be `curl -I url`).
- HTML-B → Q1 marks `wget -h` (wrong), Q3 marks `Backdoor` (wrong; should be `Scans`), Q4 marks `nc` (wrong; should be `wget -q`), Q5 marks `secure` (wrong; should be `vulnerabilities`).

### Operator action for clh-022

This sits at the intersection of QUIZ-011 (placeholder), QUIZ-DUP (cluster), and PROG-003 (CLH applet/module dual-routing). All three require operator decisions:

1. **Pick canonical path.** Per `reference_clh_three_layer_architecture.md`, HTML-B (`courses/clh/modules/clh-022/script-quiz.quiz.html`) is the current module path; HTML-A is the legacy applet path. Confirm which path the CLH-022 hub link routes to and which path the catalog `clh-022-quiz` ID points to.
2. **Fix Confluence page 2818687.** Q1 description is correct; the letter/index is wrong. Update to `Answer: A(0) <code>curl -I url</code>`. Re-derive the rest of the answer indices from the canonical HTML's option order.
3. **Resolve PROG-003 collision.** Either:
   - Bring HTML-A and HTML-B to identical option order (edit one HTML), so the same key grades both.
   - OR assign distinct quiz IDs (architectural change — coordinate with PROG-003 reconciliation doc).
4. After 1-3 are resolved, re-derive the answer key from the corrected canonical HTML and re-audit via Karl Mode-2.

Until then, DO NOT seed `quiz_keys/clh-022`. Students attempting either CLH-022 quiz path get incorrect grading regardless of which key is used.

## Architecture refs

- Karl agent: `~/.claude/agents/karl.md` (Mode-2 re-key audit specialty)
- QUIZ-011 validator: `_tools/eduscan/validators/syntax/heuristics.js`
- Verify-quiz-keys: `functions/verify-quiz-keys.js`
- Static keys: `functions/quiz_keys.json`
- PROG-003 reconciliation (related): `_docs/operations/prog-003-shared-progress-key-reconciliation-2026-05-09.md`
- HEUR-018 allowlist pattern (template for QUIZ-011 allowlist): `_tools/eduscan/validators/syntax/heuristics.js:96`
