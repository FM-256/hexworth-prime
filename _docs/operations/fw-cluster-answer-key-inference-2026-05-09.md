# FW Quiz Cluster — Auto-Inferred Answer Key Candidates (2026-05-09)

**Detection:** Marathon tick — running parser against the 5 fw-w* quiz HTML files to infer correct answers from question/option/explanation triples.
**Status:** Candidate keys generated heuristically. Operator + Karl Mode-2 verification required before any reseed.
**Source bug:** MEMORY entry #98 — "9-quiz hand-copy cluster — 8 of 9 keys wrong." The shared static key `[0,0,2,3,2,3,1,0,3,2,1,3,1,0,1]` is in `functions/quiz_keys.json` for all 5 fw-w* + 4 PIS quizzes.

## Surprising finding

The auto-inference matches the shared static key on **65 of 75 questions across all 5 fw-w* quizzes**:

| Quiz | Match rate | Mismatch questions |
|---|---|---|
| fw-w2-wireless | 13/15 | Q8, Q15 |
| fw-w3-os-security | 13/15 | Q3, Q10 |
| fw-w3-workstation | 12/15 | Q4, Q6, Q12 |
| fw-w4-mobile | 13/15 | Q8, Q11 |
| fw-w4-soho | 14/15 | Q15 |

Total: **10 candidate mismatches** out of 75 questions.

## Interpretation

Two possibilities:

**A) "Hand-copy bug confirmed but narrower than feared."** The shared key is mostly-correct because the authors built each quiz to have similar answer-position distribution (perhaps using a template). Only ~10 individual questions per cluster have actual answer-key errors. Fix scope = 10 specific question edits across 5 quizzes, not 5 full-quiz rewrites.

**B) "Heuristic is biased toward matching."** The token-overlap inference may be over-counting agreement. The true correct answer for many questions could differ from what the heuristic detected. Spot-check by Karl Mode-2 needed to verify.

The reality is likely a mix: heuristic gets most right, but Karl semantic verification is the only authoritative source.

## Heuristic methodology

For each `{question, opts, explanation}` triple in the quiz HTML:

1. Tokenize each option's text (split on non-alphanumerics, keep tokens ≥ 3 chars, drop common stopwords like `the`, `and`, `for`, `with`, etc.)
2. Tokenize explanation similarly
3. For each option, count tokens that appear in the explanation
4. Score by `hits / tokenCount` (ratio of option tokens present in explanation)
5. Pick highest-scoring option as inferred correct

**Known weaknesses of heuristic:**
- Fails when explanation paraphrases the option using different vocabulary
- Overcounts when an option uses generic words ("system", "user") that appear in any explanation
- Substring `includes()` doesn't handle word-boundary cases (e.g., "changes" vs "Change")
- **Cannot disambiguate when explanation describes MULTIPLE options.** Spot-check on fw-w3-workstation Q4: question is "Whitelisting differs from blacklisting in that whitelisting:" — explanation describes BOTH concepts. Options 0 and 3 both have tokens in the explanation (option 0 describes blacklisting, option 3 describes whitelisting). Heuristic picked option 0; static key (3) is correct. **The inference for Q4 was a false positive.**

**Reliability assessment after spot-check:** Q4 mismatch verified to be heuristic error, not real mismatch. Static key was right, inference was wrong. This means the 10 "candidate mismatches" likely include several heuristic false positives. Karl Mode-2 verification is non-negotiable — the inference is a STARTING POINT for human/agent review, not a reliable correctness signal.

## Candidate corrections (the 10 mismatches)

For each mismatch, the column "Inferred" shows what the heuristic picked. **Operator must verify each before applying.**

### fw-w2-wireless

| Q | Static says | Inferred says | Operator action |
|---|---|---|---|
| Q8 | 0 | 1 | Read Q8 + explanation; pick correct option |
| Q15 | 1 | 3 | Same |

### fw-w3-os-security

| Q | Static says | Inferred says | Operator action |
|---|---|---|---|
| Q3 | 2 | 0 | Verify |
| Q10 | 2 | 0 | Verify |

### fw-w3-workstation

| Q | Static says | Inferred says | Operator action |
|---|---|---|---|
| Q4 | 3 | 0 | Verify |
| Q6 | 3 | 2 | Verify |
| Q12 | 3 | 2 | Verify |

### fw-w4-mobile

| Q | Static says | Inferred says | Operator action |
|---|---|---|---|
| Q8 | 0 | 1 | Verify |
| Q11 | 1 | 2 | Verify |

### fw-w4-soho

| Q | Static says | Inferred says | Operator action |
|---|---|---|---|
| Q15 | 1 | 0 | Verify |

## Recommended verification path

**Phase 1 — Karl Mode-2 audit on the 10 mismatch questions.**
Per-quiz, for each mismatch Q-number:
- Read question + 4 options
- Read explanation
- Determine which option text the explanation supports
- Compare against static-key index and inferred index
- Pick correct (may be neither)

**Phase 2 — Cross-reference with Confluence solutions.**
Each fw-w* quiz has a Confluence solution page (per memory STR-40 marathon — 12 of 16 Karl-PASSed). The Confluence page is the canonical "Tier 1" source. If solutions disagree with both static and inferred, Confluence wins.

**Phase 3 — Per-quiz answer-key fix.**
For each of the 5 quizzes, build a CORRECT 15-element answer key. Reseed Firestore via existing `seed-str40-pis-keys.js` pattern. Update static `quiz_keys.json`. Deploy.

## Constraints / open questions

1. **Why do 65 of 75 match the shared key?** Likely answer-position distribution was templatized during STR-40 build. Author might have used `[0,0,2,3,...]` as the position pattern across all 5 quizzes intentionally, then authored content to fit. If true, this is by-design rather than hand-copy bug.

2. **Are the 4 PIS quizzes also mostly-correct against this shared key?** Spot-check earlier: pis-w1's static `[0,0,2,3,2,3,1,0,3,2,1,3,1,0,1]` *appears to be Bridget-confirmed-correct* for that quiz (per the InlineQuizShuffler design rationale). The cheatability bug is positional pattern memorization, not key correctness.

3. **What does QC-98 / task #83 actually require?** Memory says "8 of 9 keys wrong." This investigation suggests "8 of 9 quizzes have at most 1-3 wrong answers each" — a less severe scope. Operator should reconcile this finding with the original QC-98 evidence.

## Reproducibility

The parser script is captured inline in this commit's session log. Output produced via the heuristic above. Re-run via the parsing logic in this commit message or by extracting from session history.

## Architecture refs

- Source data: 5 fw-w* HTML files at `_app/houses/shield/intro-security/quizzes/`
- Static keys: `functions/quiz_keys.json`
- Confluence solutions registry: `_tools/quiz-sync/quiz-pages.json` (verified `fw-w4-soho` mapped to pageId 9371650)
- Karl agent: `~/.claude/agents/karl.md` (Mode-2: re-key audit)
- Cluster memory: MEMORY #98, task #83 (P0 reseed batch — Nancy-blocked)
