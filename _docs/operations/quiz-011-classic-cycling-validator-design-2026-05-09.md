# QUIZ-011 Classic-Cycling Placeholder Validator — Design + Deferred Implementation (2026-05-09)

**Status:** Design verified, implementation deferred. Ready for next-tick pickup.
**Reason for deferral:** Nancy 4-round review surfaced concern that all 4 current target keys are already tracked in `_docs/operations/p0-placeholder-live-keys-2026-05-09.md`. Validator value is forward-prevention (catch FUTURE placeholder seeds automatically), not surfacing existing known set.

## Goal

Add `QUIZ-011: Answer key matches CLASSIC-CYCLING placeholder pattern` to `_tools/eduscan/validators/syntax/heuristics.js`. Closes a validator gap: QUIZ-008 (skew detection) misses cycling patterns with even distribution.

## Verified data

| Pattern | Keys | QUIZ-008 result | QUIZ-011 (proposed) |
|---|---|---|---|
| CLASSIC-CYCLING | 4 (`az900-ch03-quiz`, `clh-022`, `fw-final`, `fl-final`) | All pass (25-40% maxPct) | All fire |
| PERIOD-CYCLING | 5 (`cert`, `clh-015`, `eye-cysa-ch13-quiz`, `threat-hunting`, `wsa-m15`) | All fire (80% on dominant index) | Skipped — defer to QUIZ-008 |
| NEAR-CYCLING | 3 (`pc-ard-04/05/14-quiz`) | Mixed (2 pass, 1 fires) | Skipped to avoid double-fire |

**Scope decision:** Fire only on `CLASSIC-CYCLING` to guarantee zero overlap with QUIZ-008. Period-cycling and near-cycling are caught either by QUIZ-008 (period) or via the manual P0 audit (near).

## Implementation specification

### Module load (top of `heuristics.js`)

```js
let PlaceholderDetector;
try {
    PlaceholderDetector = require('../../../../functions/placeholder-detector');
} catch (e) {
    console.warn('[heuristics] QUIZ-011 disabled: failed to load placeholder-detector module:', e.message);
    PlaceholderDetector = null;
}
```

Path verified: from `/home/eq/ai-content/hexworth-prime/_tools/eduscan/validators/syntax/heuristics.js` → `../../../../functions/placeholder-detector.js` → `/home/eq/ai-content/hexworth-prime/functions/placeholder-detector.js` (exists). Same depth as existing QUIZ-008's `quiz_keys.json` import.

The `console.warn` (per Nancy round-4 concern) ensures silent failure is visible in EduScan's stdout if module is moved or refactored.

### Method body

Insert after `checkAnswerDistribution(file)` at line 1664:

```js
/**
 * QUIZ-011: Answer key matches CLASSIC-CYCLING placeholder pattern
 *
 * Detects answer arrays that exactly match the i%4 pattern
 * ([0,1,2,3,0,1,2,3,...]). These bypass QUIZ-008 (skew detection)
 * because their distribution is perfectly even (~25% per index).
 *
 * Complements QUIZ-008 — fires ONLY on CLASSIC-CYCLING. Other
 * placeholder shapes (ALL-ZEROS, ALL-SAME, PERIOD-CYCLING with
 * dominant value) trigger QUIZ-008's >35% skew threshold and are
 * not duplicated here.
 *
 * Scope is intentionally narrow: zero double-fire with QUIZ-008.
 * Triage gate (high) escalates these into the sprint queue, while
 * QUIZ-008's medium fires stay in the hygiene queue.
 *
 * Skipped if PlaceholderDetector module is unavailable.
 */
checkAnswerPlaceholder(file) {
    const issues = [];
    if (!PlaceholderDetector) return issues;
    if (file.path.endsWith('index.html')) return issues;

    if (!this._quizKeys) {
        try {
            const keysPath = require('path').resolve(__dirname, '../../../../functions/quiz_keys.json');
            this._quizKeys = JSON.parse(require('fs').readFileSync(keysPath, 'utf8'));
        } catch (e) {
            this._quizKeys = {};
        }
    }

    const content = file.content;
    let keyId = null;
    const qeMatch = content.match(/moduleId\s*:\s*['"]([^'"]+)['"]/);
    if (qeMatch) keyId = qeMatch[1];
    if (!keyId) {
        const qidMatch = content.match(/QUIZ_ID\s*=\s*['"]([^'"]+)['"]/);
        if (qidMatch) keyId = qidMatch[1];
    }
    if (!keyId) return issues;

    const key = this._quizKeys[keyId];
    if (!key || !Array.isArray(key.answers)) return issues;

    const mcAnswers = key.answers.filter(a => typeof a === 'number');
    if (mcAnswers.length < 4) return issues;

    const cls = PlaceholderDetector.classify(mcAnswers);
    if (cls !== 'CLASSIC-CYCLING') return issues;

    issues.push({
        code: 'QUIZ-011',
        severity: 'high',
        category: 'quiz',
        message: `Answer key for "${keyId}" matches CLASSIC-CYCLING placeholder pattern: ${JSON.stringify(mcAnswers).slice(0, 80)}. Students get incorrect grading.`,
        file: file.path,
        line: 1,
        fix: `Replace placeholder answers in functions/quiz_keys.json with real answers from the quiz HTML or solutions doc. Karl Mode-2 verify before reseeding to Firestore.`,
    });

    return issues;
}
```

### Dispatch (around line 145)

Add after `checkAnswerDistribution`:

```js
issues.push(...this.checkAnswerPlaceholder(file));
```

### Doc comment (around line 33)

```js
 * - QUIZ-011: Answer key matches CLASSIC-CYCLING placeholder pattern (i%4 cycle, even distribution bypasses QUIZ-008's skew threshold). Complements QUIZ-008 — fires only on CLASSIC-CYCLING; ALL-ZEROS/ALL-SAME/PERIOD-CYCLING are covered by QUIZ-008 already.
```

## Expected initial fires

4 HIGH findings on first scan after merge:
- `az900-ch03-quiz` (length 15)
- `clh-022` (length 5)
- `fw-final` (length 40)
- `fl-final` (length 40)

All 4 already in `_docs/operations/p0-placeholder-live-keys-2026-05-09.md` (the "Comprehensive Final Exams" + "AZ Cluster" + "CLH Cluster" sections). The validator surfaces them through automated detection rather than relying on the operator-pull P0 audit.

## Forward-prevention value

The validator's primary win is detecting **future** placeholder seeds. If a developer seeds a new quiz with classic-cycling test data and forgets to replace before merge, QUIZ-011 fires on the next scan. Without the validator, the bug ships silently and students get 25% scores until manually audited.

## Why deferred

Nancy 4-round review chain consumed significant cycles. Two concerns resolved (period-cycling lengths verified ≥8, paths verified, double-fire prevented). One remaining concern: 4 current target keys are already tracked manually, so the immediate-state value is zero — the win is forward-prevention.

Implementation is low-risk and well-specified per above. A future tick can apply this design directly without further review iteration. Total work: ~50 lines added to one file plus 1 dispatch line.

## Architecture refs

- Detector: `functions/placeholder-detector.js` (consolidated commit `1c644716`)
- Existing QUIZ-008 dispatch: `_tools/eduscan/validators/syntax/heuristics.js` line 1664
- P0 audit: `_docs/operations/p0-placeholder-live-keys-2026-05-09.md` (current commit)
- Nancy review chain: 4 rounds, this session 2026-05-09
