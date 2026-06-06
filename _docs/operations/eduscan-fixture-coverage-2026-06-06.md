# EduScan Fixture Coverage — pattern inconsistency note

**Surfaced:** 2026-06-06 cron heartbeat post-marathon. Nancy REJECT on proposed fixtures for QUIZ-002b + HEUR-030f revealed a pre-existing inconsistency in how the test harness handles HEUR-family rules.

---

## The pattern (as it actually exists)

Files in `_tools/eduscan/tests/fixtures/heur-NNN-issues.html` fall into two categories:

### Category 1: Wired regression gates (REGISTERED in `expectations.js`)
- `heur-018-issues.html` → `['HEUR-018']`
- `heur-029-issues.html` → `['HEUR-029']`

These get loaded by `run.js`, have their simulated paths set via `PATH_OVERRIDES` (when needed to bypass scope guards), and produce verified regression coverage.

### Category 2: Documentation-only fixtures (NOT registered)
- `heur-030-leak.html`
- `heur-031-issues.html` through `heur-036-issues.html`
- `heur-037-issues.html` (added during marathon 2026-06-06)

These files exist as visual documentation of the rule pattern but are NOT loaded by `run.js` and provide ZERO active regression coverage. The fact that a scan picks them up via the normal scanner is also blocked by their scope guards (e.g., HEUR-030f requires `_app/houses/|tenant/` path; fixtures live under `_tools/...`).

## What broke this cycle

A proposal to add `quiz-002b-issues.html` and `heur-030f-issues.html` was rejected because:
1. **QUIZ-002b** has a `.quiz.html` / `.exam.html` extension scope guard. A `*-issues.html` filename never fires the rule. Either rename to `*.quiz.html` OR add a `PATH_OVERRIDES` entry simulating a `.quiz.html` path.
2. **HEUR-030f** has a `_app/houses/|tenant/` path scope guard. A fixture in `_tools/eduscan/tests/fixtures/` never fires the rule. Same `PATH_OVERRIDES` fix needed.
3. Neither was proposed for `expectations.js` — would be Category 2 (documentation-only) by default.

## What's actually needed for full coverage

For each scope-guarded HEUR/QUIZ rule that should have an active regression gate:

1. Create the fixture HTML demonstrating positive + negative cases
2. Add a `PATH_OVERRIDES` entry in `run.js` mapping the fixture filename to a path that satisfies the rule's scope guard:
   ```js
   'quiz-002b-issues.html': 'houses/code/python-for-it/quizzes/quiz-002b-issues.quiz.html',
   'heur-030f-issues.html': 'houses/web/heur-030f-issues.html',
   ```
3. Add a registration in `expectations.js`:
   ```js
   'quiz-002b-issues.html': ['QUIZ-002b'],
   'heur-030f-issues.html': ['HEUR-030f'],
   ```

## Recommendation (for operator-scoped session)

The Category 1 / Category 2 split is technical debt. Two options:

- **Promote all HEUR-030..037 to Category 1** by adding `PATH_OVERRIDES` + `expectations.js` registrations for each existing fixture. Materially expands regression coverage; touches `run.js` + `expectations.js` for ~8 entries.
- **Document Category 2 as intentional** — fixtures-as-documentation pattern is acceptable for rules with simple regex semantics where additional tests don't materially improve coverage; the test harness gates on the more complex rules (HEUR-018, HEUR-029) via Category 1.

Either is defensible. Pick consciously rather than perpetuate the inconsistency.

## Linked

- Nancy REJECT verdict: 2026-06-06 cron heartbeat (post-marathon)
- HEUR-037 marathon commit `b47965e1e` — shipped fixture without wiring, matching Category 2 precedent
- `_tools/eduscan/tests/run.js` PATH_OVERRIDES at line 39
- `_tools/eduscan/tests/expectations.js` — current wired set
