# Marathon Status — 2026-06-06

**Branch:** `marathon` (off master HEAD `92db2e98a`)
**Preview channel:** https://hexworth-prime--marathon-yoj3gm8e.web.app
**Merge status:** AWAITING operator review and approval

---

## Commits delivered

| Commit | Subject | Files | EduScan delta |
|---|---|---|---|
| `3beea3d03` | fix(lobby): Phase A — tenant-context storage-contract refactor | 1 (lobby.html) | 0 critical/high, 11,736 total |
| `600390d1b` | feat(lobby): Phase B — per-card × leave button on multi-state cards | 1 (lobby.html) | 0 critical/high, 11,736 total |
| `f56244604` | feat(eduscan): add QUIZ-002b — inline-graded quiz detector (QC-57 Pattern A) | 1 (heuristics.js) | +46 high QUIZ-002b, 11,782 total |
| `e8c118aca` | feat(eduscan): HEUR-030f absolute hexworth.com URL leak + HEUR-030d line-index fix | 1 (heuristics.js) | 0 new findings, 11,782 total |

---

## EduScan rules added

### QUIZ-002b — inline-graded quiz (QC-57 Pattern A) — 46 findings (HIGH)

**What it catches:** quizzes that don't use `QuizEngine` but have inline grading via `"ans": N` in question objects. The existing QUIZ-002 had a guard at L1296 (`if (!content.includes('QuizEngine')) return issues;`) that skipped these files entirely.

**Scope:** `.quiz.html` (38 findings) + `.exam.html` (8 findings).

**Severity:** HIGH default, MEDIUM via `<html data-practice-mode="true">` marker (matches QUIZ-002's demotion rule per `feedback_severity_demotion_pattern`).

**Why it matters:** QC-57 sprint covers 95 client-graded quizzes. Existing QUIZ-002 only caught the QuizEngine-based ones (~10). QUIZ-002b surfaces the bulk (~85, of which ~38 quizzes + 8 exams remain after the SEC-4/5 migration waves since 2026-05-08). Provides EduScan-based progress tracking for the migration sprint.

**Action enabled (post-merge):** operator can use `eduscan --code QUIZ-002b` to track progress as quizzes get migrated.

### HEUR-030f — absolute hexworth.com URL leak — 0 findings (HIGH, regression protection)

**What it catches:** hard-coded `https://hexworth.com/...` URLs as nav targets on tenant-context pages. Bypass TenantRouter and TenantShell's runtime `overrideLinks()` rewriter (which only catches RELATIVE `/dashboard.html` etc.).

**Patterns:**
1. `<a href="https://hexworth.com/...">`
2. `<form action="https://hexworth.com/...">`
3. `location.href/assign/replace("https://hexworth.com/...")` inside un-guarded inline scripts
4. `PageTransition.navigateTo("https://hexworth.com/...")` inside un-guarded inline scripts

**Patterns 3-4 use the same per-script-block TenantRouter-guard precedent as HEUR-030b/c** — won't false-positive on TenantRouter-wrapped fallback branches.

**Intentional non-flags:**
- `<link rel="canonical">`, `<meta og:url>`, JSON-LD blocks — SEO, not nav
- `<img src>`, `<script src>`, `<link href>` stylesheets — resources
- Variable-assignment strings — audited 2026-06-06, only `pis-kahoot-host.review.html` joinUrl (correct platform URL, not a leak)

**Scope:** `_app/houses/**` + `_app/tenant/**`, excluding `_app/tenant/dashboard-X.html`.

**Why it matters:** completes the HEUR-030 family coverage. The five rules together (030, 030b, 030c, 030d, 030e, 030f) cover the static-detectable tenant nav-leak surface comprehensively.

### HEUR-030d — line-index regression fix (cosmetic)

**What changed:** the existing HEUR-030d (form/iframe nav leak) used `content.indexOf(m[0])` to resolve line numbers for matches, which returns the FIRST occurrence in the file. Repeated matches all reported the same line number (the first match's). Replaced with `m.index` against a length-preserving comment mask (`replace(/<!--[\s\S]*?-->/g, m => ' '.repeat(m.length))`) so each match reports its own line.

**Why it matters:** finding count unchanged (still 0 platform-wide today). But future regressions with multiple matches in the same file will report correctly. Same fix shape used in the new HEUR-030f.

---

## Application changes

### Lobby Phase A — tenant storage-contract correctness (commit `3beea3d03`)

`_app/lobby.html` — single file, 167 insertions, 45 deletions.

**Closes 6 pre-existing cross-tenant correctness bugs in the lobby's tenant-state storage layer.** Surfaced by 6 rounds of Nancy adversarial review during task #90.

**Changes:**
1. NEW `_escAttr` — HTML entity escape (5 chars: `& " ' < >`). Safe for both attribute interpolation and text-node-in-innerHTML.
2. NEW `_enterEnrolledState` — canonical "make this enrollment the active single class." Owns the full 7-key storage contract: sessionStorage `hexworth_tenant` (JSON) + `hexworth_class`, localStorage `hexworth_tenant` (JSON) + `hexworth_tenant_slug` + `hexworth_class_id` + `hexworth_course_id` + `hexworth_class_name`. Preserve-when-matching pattern keeps existing tenant JSON (with `branding.dashboardVariant` — set on 100% of production tenants per Firestore audit) when slug matches. Defensive guard fails closed to `state-code` on malformed enrollment.
3. `_removeEnrollment` auto-promote stripped. Single ownership: callers responsible for routing active-class state via `_enterEnrolledState` or explicit clear.
4. `onAuthStateChanged` localStorage single-enrollment path → `_enterEnrolledState(enrollments[0])`.
4-bis. `_showMultiEnrolled` template — `_escAttr` applied to 6 interpolation sites (closes XSS surface).
5. `onAuthStateChanged` Firestore restore path — replaced forEach last-write-wins bug. Hydrates the enrollments array only, then routes (1 → `_enterEnrolledState` / multi → clear active-class keys + render picker).
6. `btn-leave` handler — 3-way routing: 0 remaining → state-code, 1 remaining → `_enterEnrolledState(remaining[0])`, 2+ remaining → clear active-class keys + render picker.
7. `_showMultiEnrolled` card click handler — writes full 7-key contract (was 4-key, missing sessionStorage tenant/class + localStorage tenant JSON). Same preserve-when-matching pattern.

**Cross-tenant security impact (before this fix):** multi-tenant students could trigger AccessGuard bypass to the wrong tenant via stale `hexworth_tenant` JSON pointing at a just-removed class's tenant. Affects all 6 production tenants (dr-norfleet, faculty-testing-primus, infosecethics-may-2026, keiser-university, python-april-2026, test-x).

### Lobby Phase B — per-card × leave button (commit `600390d1b`)

`_app/lobby.html` — single file, 60 insertions, 14 deletions.

**The visible feature operator originally asked for.**

**Changes:**
1. Card structure restructured: single `<button class="info-card">` → `<div class="info-card-row">` wrapper containing sibling `<button class="info-card-enter">` + `<button class="info-card-leave">`. `<button>` inside `<button>` is invalid HTML; wrapper div required.
2. Click handler split: existing pick logic narrowed to `.info-card-enter` selector. NEW leave handler on `.info-card-leave` with 3-way routing identical to btn-leave's pattern from Phase A.
3. × button visual: muted gray `#64748b`, red `#ef4444` on hover with light-red background. Left border divider separates leave area from enter area. `aria-label="Leave <classname>"` + `title="Leave this class"` for accessibility.

---

## Nancy gate stats

| Item | Rounds | Verdict | Issues caught |
|---|---|---|---|
| Lobby Phase A | 6 | PROCEED on R6 | Storage contract incompleteness, var-collision risks, security gap on dashboardVariant, scope ownership, line-index bugs |
| Lobby Phase B | 1 | PROCEED on R1 | Verification gates around `_clearEnrollment` array wipe |
| QUIZ-002b | 1 | PROCEED on R1 | Expected count was stale (~85), extend scope to `.exam.html` |
| HEUR-030f | 4 | PROCEED on R5 (empirical dry-run) | Over-estimate, Pattern 5 over-broad, HEUR-030d same-bug discovery, JSON-LD false-positive question |

Every round caught real bugs that would have shipped otherwise. Nancy gate is working as designed.

---

## Verification on preview channel

Per marathon orders: no merge to master until operator confirms after visual verification.

**Branch preview URL:** https://hexworth-prime--marathon-yoj3gm8e.web.app (expires 2026-06-13)

**Suggested verifications:**

1. **Lobby × button** (`/lobby.html` with 2+ enrollments fixture in localStorage):
   - × visible on each card, muted gray
   - Hover → red color + light-red background
   - Click × → confirm prompt with quoted class name
   - "OK" → enrollment removed; if 1 remains, transitions to state-enrolled correctly; if 2+ remain, picker re-renders; if 0, state-code
   - "Cancel" → no change
   - Enter area click still works without triggering leave

2. **Cross-tenant leave security smoke** (`/lobby.html` with 2 enrollments tenants X and Y):
   - State-enrolled showing class for tenant X
   - Click Leave (btn-leave)
   - Verify `localStorage.getItem('hexworth_tenant')` parses to `{slug: "Y"}` (NOT `"X"`)
   - Verify `localStorage.getItem('hexworth_tenant_slug') === "Y"`
   - Verify `sessionStorage.getItem('hexworth_tenant')` matches

3. **XSS / apostrophe smoke**:
   - Inject className `"He said <\"Hi\"> Class"` — confirm no broken HTML, prompt shows escaped name
   - Inject className `"O'Brien's Lab Class"` — confirm raw apostrophe preserved, no broken HTML

---

## Pending / out-of-scope

- **Quiz migration to server-grading** (task #2 actual implementation) — requires production-write gate per CLAUDE.md Rule 10. Detection shipped via QUIZ-002b; migration is a separate authorized session.
- **OVERFLOW-001 extension to labs/quizzes** (#12) — needs operator input on WSA-specific container patterns (lab-tab, etc.).
- **WSA labs/quizzes no-scroll structural fix** (#13) — depends on #12 detection.
- **WSA Phase 2 sizing pass m01→end** (#85) — needs operator artifacts.
- **Dr. Hex phase_scaffolds wiring** (#83) — no codebase grounding for the term.
- **Dr. Hex autoloop runner build** (#86) — substantial new code, paused for separate session.
- **Lobby tenant config schema migration** — store `tenantConfig` (with branding) in enrollments array so cross-tenant leaves don't degrade `dashboardVariant`. Currently same degradation as `_saveEnrollment(..., null)`. Future enhancement.

---

## How to merge (operator authorization required)

```bash
git checkout master
git merge --no-ff marathon -m "merge marathon: lobby storage refactor + 3 EduScan rules"
./deploy.sh
```

After deploy, run a Karl/Bridget audit on the lobby flows if you want adversarial sign-off before clearing the preview channel.
