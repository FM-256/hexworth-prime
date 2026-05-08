# Quiz Authoring Rules

**Audience**: Authors building quiz/exam HTML for the platform; QC reviewers; Karl + Nancy review agents.
**Authoritative**: yes. EduScan validators enforce these rules. Karl Mode-2 audits them.
**Origin**: extracted from prior tribal knowledge / project memory references / EduScan validator code, formalized 2026-05-08.

---

## Rule 1 — Every question needs an explanation

Every multiple-choice question must include an inline `explanation:` field that explicitly identifies the correct answer and *why* it is correct. The explanation must mention the correct option's content distinctly enough that a Karl Mode-2 audit can resolve which option index is right.

**Why**: the explanation is the canonical evidence for content correctness. Without it, AMBIGUOUS classifications proliferate and inference engines have to guess.

**Validator**: pending — track as future EduScan rule (currently inferred via Karl static-verify).

## Rule 2 — Server-graded quizzes need Firestore keys

Any quiz where `serverGrading: true` AND `moduleId` is set MUST have a corresponding `quiz_keys/{moduleId}` Firestore document with `answers`, `questionCount`, `passingScore`. Without the document, students score 0/N regardless of answers.

**Validator**: `cd functions && node verify-quiz-keys.js <quizId>` confirms the document exists and lengths match.
**Pre-deploy gate**: per CLAUDE.md rule 9. Run before deploying any new server-graded quiz.

## Rule 3 — Static and Firestore must agree

`functions/quiz_keys.json` (static registry) and the live Firestore `quiz_keys/` collection must agree on every entry that exists in both. Drift is a bug class — Karl `placeholder-drift-audit.js` enumerates it.

**Allowed exception**: ONLY-IN-FIRESTORE entries (Firestore has data not yet backfilled to static) are tolerated short-term but must be backfilled before the next bulk seed.

**Validator**: `node functions/placeholder-drift-audit.js` (read-only, surfaces drift categories).

## Rule 4 — JS must parse

Every `.quiz.html` file's QuizEngine config block must parse as valid JavaScript. Embedded single-quotes inside single-quoted option strings (e.g. `'Pin(17, 'out')'`) cause `SyntaxError: Unexpected identifier` and the quiz fails to render entirely. Use `\'` to escape inner quotes.

**Validator**: `node` eval against `obj.questions` block. Tracked as PARSE-SUSPECT class. Enforced via Karl content-verify pass.

## Rule 5 — Question count must match key count

The number of questions in `obj.questions` must equal `quiz_keys/{moduleId}.questionCount` and `.answers.length`. Off-by-one or extra trailing answers in static cause graders to compare against dead positions.

**Validator**: `verify-quiz-keys.js` flags as OPT-COUNT-MISMATCH. Karl content-verify also catches.

## Rule 6 — Answer distribution must be balanced

For multiple-choice quizzes (any quiz where every question has 4+ options of equal weight), the **correct-answer index distribution** across the quiz's answer key must be balanced:

- **15-35%** of answers per option index for 4-option quizzes (target ~25% per slot)
- **No single index** may exceed 35% of the answer key
- Short quizzes (≤7 questions): no index more than 2 times

**Why this matters even when the engine shuffles options at render**:

1. **Authorial discipline**: an author who places the correct answer at the same slot for every question has not built four equally-plausible options — they're padding the wrong slots with weak distractors. Even after shuffle, the question quality is poor.
2. **Robustness**: if the quiz is ever rendered without shuffle (debug mode, alternative renderer, exam-style without QuizEngine), an unshuffled all-at-slot-1 quiz lets students pattern-exploit by always picking option B.
3. **Content quality signal**: a 14/15-at-slot-1 distribution proves the author wrote the question with the right answer in mind first and the distractors as afterthoughts. Good distractors are nearly-correct, plausibly-confused, or instructively-wrong — they're work the author did, and they should appear at any index.

**Resolution when violated**:
- Reorder options in the HTML so correct answers spread across [0..3]
- Update the matching index in `static.answers` and Firestore `quiz_keys/{moduleId}.answers`
- Karl audit + Nancy adversarial review before re-deploy
- Reference: STR-40 batch (commits `952a34c0`, `8ecfb36e`) for proven rebalance pattern; PIS-W1-W4 with template `[0,0,2,3,2,3,1,0,3,2,1,3,1,0,1]`

**Documented intentional exceptions**:
- `quiz_keys/fw-final` (40 Q): `[0,1,2,3,0,1,2,3,...]` cycling — DELIBERATELY perfect 10/10/10/10 distribution per Rule 6 rebalance
- `quiz_keys/fl-final` (40 Q): same pattern, same justification
- `quiz_keys/az900-ch03-quiz` (15 Q): `[0,1,2,3,0,1,2,3,0,1,2,3,0,1,2]` cycling — verified 2026-05-08 by spot-check on Q1-Q4: explanations align with options[i%4]. Author wrote questions ordered to balance distribution. Content-correct, not placeholder.
- These cycling patterns appear superficially as placeholders (and trip placeholder-detection tooling) but are DELIBERATE and content-verified. Project memory `project_placeholder_keys_audit.md` allowlists them.

**Validator**: EduScan `QUIZ-008` at `_tools/eduscan/validators/syntax/heuristics.js:1700-1735`. Severity: medium.

**Karl flag**: WARN-SKEWED in static-verify reports.

**Common authorial slip**: putting correct option at slot 1 for "what is X?" definition questions because authors instinctively lead with a slightly-wrong-sounding distractor first. Catch this during review.

## Rule 7 — Each question's explanation must be findable

The `explanation:` field text must be discoverable by Karl Mode-2 reading. Truncated explanations (under ~50 chars), explanations that don't mention the correct option's distinctive vocabulary, and explanations that list every option neutrally without indicating which is correct → all produce AMBIGUOUS verdicts that block confident validation.

**Style**: lead the explanation with the correct option's key term + why it's right. Then describe what the wrong options would mean.

## Rule 8 — Citation tier hierarchy

Per Solutions Manual standard: every quiz answer key entry should cite a Primary or Vendor Official source for the verifying claim. Karl audits this via Mode-2 citation pass. Required tiers (best to acceptable):
- **Primary**: NIST SP, RFC, FIPS, ISO standard, vendor official documentation
- **Vendor Official**: Microsoft Learn, AWS docs, Cisco DocWiki, etc.
- **Secondary**: textbook reference, IEEE/ACM paper, well-regarded practitioner blog

Tertiary sources (random tutorial sites) are not allowed without operator override.

**Reference**: `~/.claude/projects/-home-eq-ai-content-hexworth-prime/memory/reference_karl_citation_auditor.md`

---

## Cross-references

- EduScan validators: `_tools/eduscan/validators/syntax/heuristics.js`
- Karl Mode-2 protocol: memory file `reference_karl_citation_auditor.md`
- Drift audit: `functions/placeholder-drift-audit.js`
- Per-quiz audits: `~/hexworth-shared/Solutions/_audit/`
- Rebalance pattern reference: STR-40 marathon commits `952a34c0`, `8ecfb36e`
- Solutions Manual standard: `_docs/operations/karl-prompts/`

## Maintenance

This document is canonical. When EduScan validators change behavior, when new rule classes are added, when intentional exceptions are documented (e.g., fw-final cycling allowlist), update this file. Do not rely on tribal knowledge.
