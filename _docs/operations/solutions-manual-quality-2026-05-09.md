# Solutions Manual Quality — Audit Synthesis 2026-05-09

**Status:** Findings memo — operator decision pending on remediation scope

This memo synthesizes 14 Karl citation audits + 1 Bridget structural audit run during the 2026-05-09 marathon session. Karl audited Confluence solution pages against per-question claims and tier-classification rules; Bridget audited the 9-quiz answer-array cluster at the question-text level.

## Headline finding (CRITICAL — student-facing)

**9 production quizzes share the identical answer array `[0,0,2,3,2,3,1,0,3,2,1,3,1,0,1]` despite covering 6+ disjoint subject domains.** Bridget's question-text audit determined this is HAND-COPY-DRIFT, not coincidence. Math: independent-authoring 9-way coincidence on 4-option/15-question space ≈ 10⁻⁹ per pair, vanishingly small.

Affected (all production today): `shield-pis-w1-quiz`, `shield-pis-w2-quiz`, `shield-pis-w3-quiz`, `shield-pis-w4-quiz`, `fw-w2-wireless`, `fw-w3-os-security`, `fw-w3-workstation`, `fw-w4-mobile`, `fw-w4-soho`.

Implication: **8 of 9 quizzes are grading students against wrong answer keys.** Source-of-truth quiz unknown without per-question fact-check. Karl Mode-2 audit cycle initiated; pis-w1-quiz first run in flight.

Operator decision required: quarantine these 9 keys (sentinel value blocks grading) vs leave running while Karl re-keys (~9 audit runs to clear).

## Karl audit results — failure pattern catalog

### Pattern A — CompTIA marketing page bulk-cited

CompTIA certification pages (e.g., `comptia.org/certifications/network`, `comptia.org/certifications/a`) are marketing/exam-overview pages. They list topic names but contain no technical definitions. Authors pattern-cited the same URL across 7-15 questions per quiz.

| Quiz | DENY count | Total cites |
|------|------------|-------------|
| `web-security-quiz` | 15 | 15 (all on `comptia.org/certifications/network`) |
| `hardware-essentials` | 7 | 15 (7 on `comptia.org/certifications/a`) |

**Verdict on the pattern:** The CompTIA marketing page cannot support technical claims. Replacement requires per-question primary sources (NIST SP, RFC, Microsoft Learn, vendor Official). For some claims (e.g., bollard ramming protection) no Primary HTML source readily exists — those become CANNOT_VERIFY_BY_DESIGN with operator override.

### Pattern B — NIST PDF landing page anti-pattern

`csrc.nist.gov/publications/detail/sp/800-XXX/...` URLs are NIST publication metadata pages, not the actual standard text. The standards live at `nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.<id>.pdf` and require `#page=N` deep-link anchors per architecture standard.

| Quiz | DENY count | Notes |
|------|------------|-------|
| `cryptanalysis` | 10 / 10 | Every citation to the same NIST 800-175B landing page; underlying doc doesn't even cover the cryptanalysis attack content claimed |
| `pis-02-quiz` | 4 NIST landing + 1 PCI DSS missing-anchor + 2 blog REJECT (Krebs, ITIL-docs) | 8 BLOCK |
| `fw-final` | 12 DENY (mix of anchor-missing + Wikipedia where Primary exists) | 23 PASS / 5 WEAK / 12 DENY |

### Pattern C — Wrong Microsoft Learn page within correct vendor family

Author identified the right vendor (Microsoft Learn) but cited a sibling page that doesn't actually contain the claim. UAC page cited for Microsoft account auth; Credential Guard page cited for Credential Manager; Windows Firewall Tools page cited for `secpol.msc`.

| Quiz | DENY count |
|------|------------|
| `forge-md100-module-02` (Authorization & Authentication) | 7 / 15 (plus 1 dead 404 link, 5 WEAK, 3 PASS) |

**Verdict on the pattern:** Authors approximated "this looks like a Microsoft Learn topic match" rather than verifying the specific claim text appeared on the page. More insidious than Pattern A/B because pages are real and live — students clicking get a real-looking page that doesn't actually answer the question.

### Pattern D — No citation structure (artifact never extended)

**Expanded scope discovered 2026-05-09 — three clusters, 23 docs, ~311 quiz/exam questions plus ~143 review-game questions (~454 total citation-bearing items).** Karl confirmed the pattern empirically on `forge-md100-module-02` (M02 Auth & Authentication) AND on `MD-100 Quiz-M01` today: artifact contains zero `Source URL:`, zero `Tier:` lines, no embedded hyperlinks. Architecture standard requires per-question source URL + verifying quote, none of which exist in these docs.

Three clusters identified by `grep -c "Source URL:|https?://|Tier:" *_ANSWERS.md` returning 0 across:

| Cluster | Docs | Questions | Notes |
|---------|------|-----------|-------|
| Eye house | 5 (`eye-soc`, `eye-siem`, `eye-correlation`, `eye-hunting`, `eye-traffic`) | ~75 | Already known |
| MD-100 quizzes | 11 (`Quiz-M01` through `Quiz-M11`) | 166 (15-16 each) | Discovered 2026-05-09 |
| MD-100 reviews | 3 (`Comprehensive-Review`, `Midterm-Review`, `Final-Review`) | 51-61 each (jeopardy format, not 15-Q quiz) | Discovered 2026-05-09 |
| PFI (Python for IT) | 4 (`W1-Quiz`, `W2-Quiz`, `W3-Quiz`, `W4-Final-Exam`) | 70 (15+15+15+25) | Discovered 2026-05-09 |

**Verdict:** All 23 docs are not auditable in current form. Karl rotation must skip these until citation-rebuild sprint runs. Listed explicitly in Karl rotation plan below.

## Pattern frequency across audited quizzes

| Pattern | Affected so far | Severity | Remediation |
|---------|----------------|----------|-------------|
| A — CompTIA marketing | 2 quizzes (~22 citations) | High — students see useless source | Per-question Primary swap |
| B — NIST PDF landing | 3 quizzes (~16 citations) | High — wrong anchor + sometimes wrong doc | URL pattern + `#page=N` swap |
| C — Wrong-vendor-page | 1 quiz (7 citations) | Medium — page exists but content mismatch | Per-question source verification |
| D — No-citations (Eye + MD-100 + PFI) | 23 docs (~311 quiz Qs + ~143 review Qs) | Medium — not auditable | Rebuild solutions doc structure |
| Hand-copy cluster | 9 quizzes (135 questions) | **CRITICAL** — wrong keys serving | Per-question Mode-2 re-key |

## Quizzes Karl-cleared so far (PASS or near-PASS)

The STR-40 batch (fw-w1-logical, fw-w2-wireless, fw-w3-os-security, fw-w3-social, fw-w3-workstation, fw-w4-data, fw-w4-mobile) are **citation-cleared by Karl** but **NOW under suspicion from Bridget's cluster finding** for the 5 of 7 that match the cluster array. Citation-passing doesn't mean answer-key-correct.

Net Karl-PASS quizzes today: ~7-8. Net Karl-investigated: ~14. Net BLOCK or BLOCK-pending: 7.

## Recommendations

1. **IMMEDIATE — operator decision on 9-quiz cluster.** Until re-keyed, every student attempt against these 9 quizzes is graded against bad keys. Quarantine option: set `quiz_keys/<id>.answers = []` (empty array → grader CF refuses to grade) for the 8 suspect ones, leaving 1 representative (operator's call which) for re-key reference.

2. **Architecture rule update.** Make Pattern A (CompTIA marketing) and Pattern B (NIST PDF landing) automated DENY in Karl's tier classification — already done in the audit prompt template, should be made a hard validator rule.

3. **Pattern D citation rebuild — 23 docs.** Sprint scope expanded from "Eye house only" to three clusters totaling ~454 citation-bearing items. Estimate as a separate sprint with three sub-batches (Eye 5, MD-100 14, PFI 4). Karl rotation must skip these until rebuild ships.

4. **Solutions manual coverage report.** Current state: ~14 of 70+ quizzes audited. The ~56 remaining quizzes (Task #10) are unknown-quality — historical pattern frequency suggests ~30-40% are likely to fail similar pattern checks. Of those 56, the 23 Pattern D docs above are pre-classified as BLOCK-citation-rebuild.

## Karl rotation plan (in flight)

**Skip list — DO NOT dispatch Karl on these until citation-rebuild sprint runs (otherwise Karl returns BLOCK with no actionable work):**
- Eye house: `eye-soc`, `eye-siem`, `eye-correlation`, `eye-hunting`, `eye-traffic`
- MD-100 quizzes: `Quiz-M01` through `Quiz-M11`
- MD-100 reviews: `Comprehensive-Review`, `Midterm-Review`, `Final-Review`
- PFI: `W1-Quiz`, `W2-Quiz`, `W3-Quiz`, `W4-Final-Exam`

Mode-2 cycle dispatch order (pis-w1-quiz audit currently running):
1. ✅ pis-w1-quiz (in flight)
2. shield-pis-w2-quiz, w3, w4
3. fw-w2-wireless, fw-w3-os-security, fw-w3-workstation, fw-w4-mobile, fw-w4-soho

Each Mode-2 run takes ~3-5 min and produces a proposed corrected answer array + per-Q verifying source. Operator reviews each before seed.

After cluster cleared, return to Mode-1 (citation audit) on remaining citation-bearing solutions docs (i.e., excluding the 23 Pattern D docs above).

## Architecture refs

- Karl agent definition: `~/.claude/agents/karl.md`
- Citation tier hierarchy: Quiz Solutions Manual Architecture (Confluence)
- Bridget agent definition: `~/.claude/agents/bridget.md`
- Sync-helper C9 cluster detector: `_tools/quiz-sync/sync-helper.js`
- Cluster detection in production: `functions/quiz-quality-monitor.js` (weekly Cloud Function)
