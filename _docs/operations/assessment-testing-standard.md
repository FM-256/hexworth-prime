# Assessment Testing Standard

Status: ACTIVE standard as of 2026-07-15. Applies to all NEW quizzes, midterms, and finals across the platform. Reference implementation: the A+ Core 1 Domains 1-3 midterm at `_app/houses/forge/applets/comptia-aplus/core-1/exams/forge-aplus-core1-midterm-domains-1-3.html`.

## TLDR

An assessment is legit only if the single way to score above chance is to know the content. Every score a test-wise student can extract from wording, length, format, or answer position is a defect. This standard defines (1) the anti-test-wiseness rules every item must pass, (2) the difficulty bar, (3) the grounding requirement, (4) the delivery model (question pool with per-attempt draw, answer options NOT shuffled), and (5) the QC pipeline that gates any assessment before it ships.

## Why this exists

Two failure modes drove this standard:

1. **Gameability.** A first draft of the A+ midterm was scenario-rich and grounded, but the correct answer was the longest option in 49 of 60 questions, and most "is the coworker right?" scenarios resolved to "no." A student could beat it well above 25 percent chance without knowing the material. "Looks hard" is not "is hard."
2. **Answer-key drift.** Shuffling answer options at render time has repeatedly desynced the correct-answer key on this platform. Moving randomization from the answer options to the question set removes that bug class entirely.

## 1. Anti-test-wiseness rules (every item must pass)

The correct option must not be identifiable by any signal other than being correct. Reviewers check for each of these tells:

| Tell | Rule |
|------|------|
| Length | Correct answer is not systematically the longest or most-qualified. Across the pool, correct-is-longest stays near chance (about 1 in 4), no pattern. Pad distractors with equally specific but wrong justifications; trim verbose correct answers. |
| "Is X right?" framing | In yes/no scenario items, the person in the scenario is correct in roughly half. Never let "no, they are wrong" become the safe guess. Also cap how many items use this one template. |
| Format monotony | Vary stems: direct "which of the following," best-answer scenario, ordering/step, calculation, plain factual. No single format guessable as a class. |
| Absolute qualifiers | Words like always, never, every, only, all must not cluster in the wrong answers. Hedges like usually, typically, may must not cluster in the correct answers. |
| Grammar and word-match | Every option grammatically fits the stem. The correct answer does not echo a distinctive stem keyword more than the distractors (no clang association). |
| Odd-man-out | The correct answer is not the lone option structurally different from three lookalikes, nor the reverse. |
| Answer position | Correct answers are spread across A/B/C/D in the authored keys. Because options are not shuffled at runtime (see section 4), the authored spread is the final spread and must be balanced. |
| All / None of the above | Used in some items, correct in about half of those and a plausible distractor in the other half, so their presence signals nothing. When used, the AOTA/NOTA option is authored LAST and worded to start with "All of the above" or "None of the above." |

## 2. Difficulty bar

- Lean scenario and best-answer over bare recall. The taker reasons, not just recognizes a term.
- All four options plausible to someone with partial knowledge. Distractors are the real neighbors people confuse (SATA vs NVMe, CCMP vs GCMP, 587 vs 465 vs 25, IMEI vs IMSI vs ICCID), never absurd throwaways. If three options are obviously silly, the item is too easy; rewrite it.
- Include trap distractors where the naive first-instinct answer is deliberately wrong.
- **Deliberately mix in a few genuinely easy or common-sense items** (about 5 to 10 percent) where the scenario is simply true as stated, no trick. Uniform trap difficulty is itself gameable: a student learns to "expect a trap." Variety removes that meta-edge. The exam stays hard overall.

## 3. Grounding requirement

Every correct answer must be (a) true for the target certification or syllabus, AND (b) explicitly supported by the course's own source content (chapter pages, lesson slides). A reviewer greps each correct answer back to its source file. Anything not found there is rejected, even if independently true. Each authored item carries a `source` tag naming the chapter or lesson it is grounded in.

## 4. Delivery model: question pool with per-attempt draw

- Author a **pool** larger than one sitting (the A+ midterm pool is about 100 for a 60-question exam).
- Each attempt **draws** a weighted random subset (the midterm draws 15 Mobile / 20 Networking / 25 Hardware to match domain weights) and randomizes **question order**.
- **Answer options are NEVER shuffled at runtime.** They render in authored order so the correct key cannot drift. Randomization lives in the question draw and order, not the options. This is a deliberate reversal of the older inline answer-shuffle approach (see `inline-quiz-shuffler-design-2026-05-09.md`), which caused key desync.
- Retake pulls a fresh draw from the pool, so the assessment is genuinely repeatable.
- Data shape: `EXAM_DATA.domains[]` each with `id`, `name`, `weight`, `draw` (count per attempt), and `questions[]` (the pool for that domain). Each question: `question`, `options[4]`, `correct` (index into authored options), `explanation`, `source`.

## 5. Exam-feel mechanics (midterms and finals)

- No per-question right/wrong reveal. The taker answers all, then submits to score.
- Free navigation (Previous/Next plus a question navigator), flag-for-review, and a countdown timer that auto-submits at zero.
- Results show overall percentage against a stated pass mark (A+ uses 75 percent, approximating the real 675/900 scaled score), a per-domain breakdown, and a review of every missed item with its explanation.
- Practice quizzes may instead use instant per-question feedback; the anti-test-wiseness rules and (for new work) the no-answer-shuffle rule still apply.

## 6. Platform conventions (unchanged)

Client-side only where the assessment is ungraded; AccessGuard `require('sorted')` gate; full viewport width (never narrow-centered); Forge or house theme tokens; webp icons only; no emoji; no em-dashes; no raw HTML entities in question, option, or explanation text; options escaped via `textContent`.

## 7. QC pipeline (mandatory before ship)

1. **Automated difficulty check** (author/primary): structure (counts, index spread, 4 options, no dup questions or options), house style, dedup against sibling assessments, and the anti-test-wiseness heuristics in section 1 (especially the length and framing tells). Fail any tell, send back for rewrite.
2. **Grounding audit**: grep every correct answer back to its source file.
3. **Nancy (adversarial-reviewer)**: technical accuracy of every answer plus an explicit hunt for easy items and absurd distractors.
4. **Chris (QC gate)**: purpose, bar, and evidence; independent re-verification of a sample of answers against source.
5. Live-browser boot of the real engine (gate, draw, answer, submit, score, review, retake) with zero console errors before deploy.

## Migration note

Existing shipped quizzes that shuffle answer options at runtime (for example the A+ Core 1 practice quizzes) are grandfathered as working content. When one is next substantially touched, migrate it to the no-answer-shuffle rule in section 4. Do not rush-change working shipped content without direction.

## Related

- Reference implementation engine: `_app/houses/forge/applets/comptia-aplus/core-1/exams/forge-aplus-core1-midterm-domains-1-3.html`
- Prior answer-shuffle approach this supersedes: `_docs/operations/inline-quiz-shuffler-design-2026-05-09.md`
- Citation and grounding discipline: `_docs/operations/security-plus-lesson-citation-standard.md`
- Final-exam spec precedent: `_docs/operations/cell-sigma-final-exam-spec-2026-06-24.md`
- QC gates: `_docs/operations/chris-qc-gate.md`, Nancy (adversarial-reviewer)

*Last updated: 2026-07-15*
