# EduScan v2.2.0

> **Content integrity, topology enforcement, and runtime validation for large static educational platforms.**

EduScan is the quality infrastructure for Hexworth Prime. It scans 1400+ content files across 9 houses, validates naming conventions, detects broken references, catches missing dependencies, verifies ContentCatalog integrity, runs headless browser smoke tests, and auto-fixes what it can. It powers both local development workflows and CI/CD quality gates.

---

## Quick Start

```bash
# Full scan (all static validators)
npm run scan

# Quick issue check (quiet mode)
npm run scan:quick

# Signature test suite (18 fixture tests + 18 global/positive detection tests)
npm run scan:test

# Headless browser validation (runtime errors + smoke tests)
npm run scan:functional

# Deploy with pre-flight quality gate
npm run deploy
```

---

## npm Scripts

All scan commands are defined in `package.json`. Use these instead of raw `node` commands.

### Scanning

| Script | Description |
|--------|-------------|
| `npm run scan` | Full scan — all static validators, outputs TREASURE_MAP |
| `npm run scan:verbose` | Full scan with detailed progress logging |
| `npm run scan:quick` | Issues only, quiet mode (fastest feedback) |
| `npm run scan:issues` | Issues only (normal verbosity) |
| `npm run scan:json` | Output issues as JSON to stdout |
| `npm run scan:syntax` | Syntax validators only (no orphan/coverage) |
| `npm run scan:syntax:strict` | Syntax with strict profile, fail on critical+high |
| `npm run scan:orphans` | Orphan detection only |
| `npm run scan:orphans:deep` | Deep orphan detection with reachability crawl |

### Drift Tracking

| Script | Description |
|--------|-------------|
| `npm run scan:diff` | Compare current scan against last archived baseline |
| `npm run scan:archive` | Save current scan to `_tools/reports/history/` |
| `npm run scan:ci` | Diff + archive combined (standard CI workflow) |

### CI / Gating

| Script | Description |
|--------|-------------|
| `npm run scan:ci:strict` | Fail on critical or high issues |
| `npm run scan:ci:warn` | Never fail (gradual adoption mode) |

### Functional (Headless Browser)

| Script | Description |
|--------|-------------|
| `npm run scan:functional` | Full functional — runtime checks + smoke tests |
| `npm run scan:functional:smoke` | Smoke tests only (~15s, 8 scenarios) |
| `npm run scan:functional:runtime` | Runtime checks only (loads all HTML pages) |

Requires Puppeteer (`npm install` to install).

### Tests

| Script | Description |
|--------|-------------|
| `npm run scan:test` | Signature test suite — 36 tests (18 fixture + 18 global/positive detection) |

### Deploy

| Script | Description |
|--------|-------------|
| `npm run deploy` | Pre-flight scan → blocks on CRITICAL → `firebase deploy` |
| `npm run deploy:force` | Skip scan, deploy immediately |
| `npm run deploy:strict` | Block on CRITICAL or HIGH before deploying |

---

## Features

### Static Validation (Per-File)

| Validator | File | Description |
|-----------|------|-------------|
| **HTML** | `html.js` | Structural errors — unclosed tags, missing doctype, malformed attributes |
| **JavaScript** | `js.js` | Script block syntax — bracket balance, forEach/for-loop closure mismatch, await-in-sync-callback, const IIFE scoping |
| **Engine** | `engine.js` | Missing engines/libraries (QuizEngine, LabEngine, PresentationEngine, etc.) |
| **Path** | `paths.js` | Broken `<script src>`, `<link href>`, `<img src>` — 404 detection with smart bucketing |
| **Naming** | `naming.js` | Enforces `{house}-{name}.{type}.html` naming convention |
| **Heuristics** | `heuristics.js` | Anomaly detection — excessive inline scripts, TODO markers, console.log, duplicate includes, unguarded parseInt, localStorage coercion |
| **Dependency** | `dependency-check.js` | "Wired but not plugged in" — code calls ProgressManager/GameTracker but never loads the script |
| **Navigation** | `navigation.js` | Back navigation checks — missing back buttons, dashboard links, back links that skip course home, and path cards without hrefs |
| **Emoji** | `emoji.js` | Detects emoji usage in JS icon props, badge elements, and UI containers (platform uses WebP icons instead) |
| **Palette** | `palette.js` | Validates house index pages define required CSS custom properties and match expected color values |
| **ContentBlob** | `content-blob.js` | Flags oversized inline content — large style blocks, innerHTML templates, base64 data URIs, long script blocks |
| **Semantic** | `semantic.js` | Heading hierarchy, duplicate/missing h1, missing `<main>` landmark, unsemantic nav link lists |
| **UX** | `ux.js` | Dynamic visual element (canvas/video/iframe) inserted into DOM without `scrollIntoView` |
| **Turtle** | `turtle.js` | Skulpt canvas rendering issues — opaque canvas backgrounds, textarea code with template indentation |
| **FlexOverflow** | `flex-overflow.js` | Flex column containers with `flex:1` missing `min-height:0` — causes page expansion instead of internal scroll |

### Static Validation (Global)

| Validator | File | Description |
|-----------|------|-------------|
| **ContentCatalog** | `content-catalog.js` | Validates all 1400+ module hrefs in ContentCatalog.js resolve to real files |
| **LearningPaths** | `learning-paths.js` | Validates cert path hrefs, duplicate module IDs, prerequisite chains, and cross-references with ContentCatalog |
| **AssignmentLinks** | `assignment-links.js` | Simulates student assignment clicks — verifies resolved URLs hit real files |
| **RendererLinks** | `heuristics.js` | Scans shared JS renderers for hardcoded relative hrefs (fragile back links) |
| **MissingIndexes** | `index.js` | Flags content directories with 3+ HTML files but no `index.html` |
| **CSP** | `csp.js` | Cross-references external domains in code against `firebase.json` Content-Security-Policy |
| **Emoji (Global)** | `emoji.js` | Scans shared JS config/component files for emoji usage (icon props, badge elements) |
| **Palette** | `palette.js` | Validates all house index pages define required CSS variables with correct color values |
| **FixedOverlays** | `heuristics.js` | Scans component JS files for `position:fixed` in dynamic elements (breaks under `body.style.filter`) |

### Functional Validation (Headless Browser)

Loads every HTML page in Puppeteer and captures runtime failures students would see.

| Code | Severity | Description |
|------|----------|-------------|
| FUNC-001 | high | JavaScript runtime errors (ReferenceError, TypeError, etc.) |
| FUNC-002 | high | Uncaught promise rejections |
| FUNC-003 | medium | `console.error()` calls (excluding benign patterns) |
| FUNC-004 | medium | Resource load failures (script/CSS 404) |
| FUNC-005 | high | Blank screen — no visible text content after page load |
| FUNC-006 | medium | Dead anchor links — rendered `<a href>` points to missing file |

### Smoke Tests (Core Systems)

Runs 8 targeted tests against core platform systems in a real browser.

| Code | System Under Test |
|------|-------------------|
| FUNC-010 | ProgressManager XP award |
| FUNC-011 | AchievementRegistry persistence |
| FUNC-012 | GameTracker record |
| FUNC-013 | AccessGuard blocks unauthorized access |
| FUNC-014 | QuizEngine instantiation |
| FUNC-015 | Achievement v1/v2 bridge |
| FUNC-016 | ProgressManager level calculation |
| FUNC-017 | GameTracker top scores |

### Auto-Fixing (Self-Healing)

| Fixer | Purpose |
|-------|---------|
| `learning-paths-fixer.js` | Fixes broken hrefs in LearningPaths.js |
| `rename-mapper.js` | Plans file renames to standard convention |
| `rename-applier.js` | Applies renames + updates all references |
| `rename-undo.js` | Rollback renames safely |
| `reorg-mapper.js` | Plans directory reorganization |
| `reorg-applier.js` | Moves files + updates references |
| `reorg-undo.js` | Rollback reorganization |
| `naming-fixer.js` | Orchestrates naming convention fixes |

### Other Capabilities

| Feature | Description |
|---------|-------------|
| **Drift Tracking** | Archive scans and compare over time to detect regressions |
| **Scan Profiles** | `ci` (critical/high), `strict` (full coverage), `inventory` (stats only) |
| **Quarantine Allowlist** | `quarantine-allowlist.json` — suppress known false positives by file+code |
| **Watch Mode** | `--watch` flag re-scans on file changes during development |
| **Coverage Analysis** | Identifies modules missing quizzes, labs, or presentations |
| **Orphan Detection** | Finds unreachable or unregistered content files |
| **Remediation Plans** | Generates `PATCH_PLAN.md` with grouped, prioritized fix batches |

---

## Issue Code Reference

### Severity Levels

| Level | Meaning | CI Behavior |
|-------|---------|-------------|
| **CRITICAL** | Breaks sync, grading, or compliance | Blocks merge and deploy |
| **SLA** | Contractual — affects paying tenant customers | Blocks in strict mode, immediate attention |
| **HIGH** | Breaks analytics, progress tracking, or student UX | Blocks in strict mode |
| **MEDIUM** | Affects reporting consistency | Reported, does not block |
| **LOW** | Hygiene, legacy patterns | Reported, does not block |
| **SUSPECT** | Heuristic anomaly — may be false positive | Human review recommended |
| **WARNING** | Naming/convention deviation | Informational |
| **INFO** | Statistics and metadata | Informational |

### HTML Validator

| Code | Severity | Profile | Description |
|------|----------|---------|-------------|
| HTML-001 | high | ci | Unclosed `<script>` or `<style>` tag |
| HTML-003 | medium | ci | Missing `<!DOCTYPE html>` |
| HTML-004 | low | strict | Unclosed structural tag (`<div>`, `<form>`, `<table>`) |
| HTML-005 | medium | ci | Missing `<title>` element |
| HTML-006 | low | ci | Duplicate `id` attributes |
| HTML-007 | low | ci | Empty `<script>` block |
| HTML-008 | low | strict | Unclosed standard tag |
| HTML-009 | low | strict | Malformed attribute |
| HTML-010 | low | strict | Empty `href` or `src` attribute |

### JavaScript Validator

| Code | Severity | Profile | Description |
|------|----------|---------|-------------|
| JS-001 | high | ci | Critical syntax error in `<script>` block |
| JS-002 | high | ci | Unclosed string literal |
| JS-003 | medium | strict | Bracket imbalance (`{`, `[`, `(`) |
| JS-004 | low | strict | Common error pattern (undefined var, etc.) |
| JS-005 | high | ci | forEach-style `});` used to close a `for`/`for...of`/`for...in` loop |
| JS-006 | high | ci | `await` used inside non-async `.forEach()`/`.map()`/`.filter()` callback |
| SCOPE-001 | high | ci | `const`/`let` IIFE not accessible via `window.Name` — use `var` instead |

### Engine Validator

| Code | Severity | Description |
|------|----------|-------------|
| ENG-001 | high | Missing critical engine (QuizEngine, LabEngine, PresentationEngine) |
| ENG-002 | medium | Missing jQuery (`$` used but no jQuery script tag) |
| ENG-003 | medium | Missing non-critical engine/library |

### Path Validator

| Code | Severity | Description |
|------|----------|-------------|
| PATH-001 | high | Broken `<script src>` — file not found |
| PATH-002 | high | Broken `<link href>` — stylesheet not found |
| PATH-003 | medium | Broken `<img src>` — image not found |
| PATH-004 | medium | Dead `<a href>` — anchor points to missing file |
| PATH-005 | low | Suspicious dynamic import path |
| PATH-DUP-001 | low | Doubled directory segment in path (e.g., `houses/shield/houses/shield/`) |
| PATH-DEPTH-001 | medium | Too few `../` (undershoot — won't reach target) |
| PATH-DEPTH-002 | medium | Too many `../` (overshoot — resolves past root) |
| PATH-IDX-001 | medium | Content directory with 3+ HTML files but no `index.html` |

### Naming Validator

| Code | Severity | Description |
|------|----------|-------------|
| NAME-001 | warning | File doesn't follow `{house}-{name}.{type}.html` convention |
| NAME-002 | warning | Wrong or missing type suffix |
| NAME-003 | warning | Missing house prefix |
| NAME-004 | warning | Wrong case (should be kebab-case) |

### Heuristics Validator

| Code | Severity | Description |
|------|----------|-------------|
| HEUR-001 | suspect | Excessive inline scripts (>8 `<script>` blocks without `src`) |
| HEUR-002 | suspect | Commented-out code (HTML comments containing `<script>` or `<link>`) |
| HEUR-003 | suspect | TODO/FIXME/HACK markers inside `<script>` blocks |
| HEUR-004 | suspect | `console.log` in inline scripts (production hygiene) |
| HEUR-005 | suspect | Duplicate script includes (same `src` on multiple tags) |
| HEUR-006 | medium | Hardcoded relative href in shared JS renderer (fragile back links) |
| HEUR-007 | medium | Monospace font class missing `white-space: pre-wrap` — multi-line code renders as single paragraph |
| HEUR-008 | suspect | `position:fixed` in dynamically created element — breaks when body/ancestor has CSS transform or filter |
| HEUR-009 | suspect | Empty template literal `${}` in inline scripts (SyntaxError kills entire script block) |
| HEUR-010 | suspect | `querySelector` targets heading tag not present in HTML (null crash) |
| HEUR-011 | high | Literal `</script>` inside JS string — HTML parser terminates script block early |
| HEUR-012 | high | JS syntax error via `new Function()` parse check (unclosed strings, missing quotes, etc.) |
| HEUR-013 | medium | `innerHTML` assignment with unsanitized template literal (XSS risk) |
| HEUR-014 | medium | `onclick` with hardcoded `window.location` redirect (bypasses routing, breaks tenant encapsulation) |
| HEUR-015 | medium | `eval()` usage in non-sandbox code (code injection risk) |
| HEUR-016 | warning | `document.write()` usage (DOM clobbering, breaks page if called after load) |
| HEUR-017 | high | Platform component lazy-loaded via `createElement('script')` — should be static `<script src>` |
| HEUR-018 | medium | Scroll-triggered auto-completion — `ModuleProgress.complete()` fires on scroll threshold instead of deliberate user action |
| HEUR-019 | sla | Tenant config missing required fields (`slug`, `branding`, `licensing`, or `adminUids`) — dashboard cannot initialize |
| HEUR-020 | medium | Tenant dashboard broken asset references — absolute image/icon/CSS paths that don't resolve within `_app/` |
| HEUR-021 | sla | Tenant licenses house with no content in registry — paying for empty content |
| QUIZ-001 | high | Quiz has `serverGrading: true` but still contains client-side `correct:` fields (answer leak) |
| QUIZ-002 | high | Quiz has client-side `correct:` fields without `serverGrading` (answers visible via View Source) |
| QUIZ-003 | high | Quiz has no `serverGrading` and no `correct:` fields (grades 0% — broken) |
| QUIZ-004 | critical | Quiz REGRESSION — was server-graded in baseline but `serverGrading` is now missing |
| QUIZ-005 | critical | Quiz KEY MISMATCH — answer key count doesn't match question count, or answer index out of range |
| QUIZ-006 | high | Custom inline quiz calls `gradeQuiz` Cloud Function but no matching key in `quiz_keys.json` — server returns "Quiz key not found" |
| QUIZ-007 | high | `quiz_keys.json` `questionCount` disagrees with actual question count in HTML — keys are stale after question add/remove |
| QUIZ-008 | medium | Answer key has skewed distribution — one index exceeds 35% in 10+ question quiz or >2 same index in short quiz. Students can pattern-exploit without reading. |
| MATH-001 | suspect | Unguarded `parseInt()` in arithmetic — NaN will propagate if input is invalid |
| DATA-001 | suspect | `localStorage.getItem()` in `+=` or arithmetic without `Number()` coercion |

### CSP Validator

| Code | Severity | Description |
|------|----------|-------------|
| CSP-001 | medium | External domain used in code but not covered by Content-Security-Policy in `firebase.json` |

### ContentCatalog Validator

| Code | Severity | Description |
|------|----------|-------------|
| CAT-001 | critical | Module status `available` but href file doesn't exist on disk |
| CAT-002 | medium | HTML content file on disk not declared in any catalog module |
| CAT-003 | high | Module status `available` with empty or missing href |
| CAT-004 | warning | Module status not `available` but href doesn't exist on disk |
| CAT-005 | high | Duplicate module IDs in ContentCatalog |

### LearningPaths Validator

| Code | Severity | Description |
|------|----------|-------------|
| LP-001 | high | Module href points to non-existent file |
| LP-002 | medium | Path has no houseFolder and uses relative hrefs |
| LP-003 | medium | Duplicate module IDs across paths |
| LP-004 | high | Broken prerequisite reference — prereq ID not found in any path |
| LP-005 | high | Circular prerequisite chain (DFS cycle detected) |
| LP-006 | medium | LearningPaths module not found in ContentCatalog |
| LP-007 | low | ContentCatalog course module not in any learning path |
| LP-008 | medium | Module type/href mismatch (e.g., `type: 'quiz'` but href in `presentations/`) |
| LP-009 | high | `courseHref` points to non-existent file |
| LP-010 | medium | Prerequisite module has non-available catalog status (blocks progression) |

### Assignment Link Validator

| Code | Severity | Description |
|------|----------|-------------|
| ASGN-001 | high | Item-type assignment resolves to nonexistent file |
| ASGN-002 | medium | Path-type assignment can't derive `index.html` |
| ASGN-003 | high | Path-type assignment `index.html` doesn't exist on disk |
| ASGN-004 | medium | PATH_HOUSE_MAP entry points to nonexistent house directory |
| ASGN-005 | medium | Certification path in LearningPaths has no PATH_HOUSE_MAP entry |
| ASGN-006 | low | PATH_HOUSE_MAP has entry for path not in LearningPaths (stale) |

### Dependency Check Validator

| Code | Severity | Description |
|------|----------|-------------|
| DEP-001 | high | `trackProgress: true` in QuizEngine config but `ProgressSystem.js` not loaded |
| DEP-002 | high | Calls `ProgressManager.completeModule()` but no ProgressSystem/ProgressManager script |
| DEP-003 | medium | Calls `GameTracker.record()` but `GameTracker.js` not loaded |
| DEP-004 | high | Calls `ModuleProgress.complete()` but `ModuleProgress.js` not loaded |
| DEP-005 | medium | Calls `AchievementSystem.unlock()` but no Achievement script loaded |

### Navigation Validator

| Code | Severity | Description |
|------|----------|-------------|
| NAV-001 | medium | Content page has no back/return navigation |
| NAV-002 | medium | House/course index page has no dashboard link |
| NAV-003 | high | Content page inside course subdirectory has returnUrl or back button href that skips course home |
| NAV-004 | high | Path card in house index has no `href` but hub directory exists — clicking the card will 404 |

### Emoji Validator

| Code | Severity | Description |
|------|----------|-------------|
| EMOJI-001 | low | Emoji in JS icon/category property — replace with WebP image path |
| EMOJI-002 | low | Emoji in badge/icon HTML element — replace with `<img>` tag |
| EMOJI-003 | warning | Emoji in UI container — replace with image or CSS icon |
| EMOJI-004 | medium | Emoji in hero/emblem container — replace with `<img src="/assets/images/emblems/...">` |

### Palette Validator

| Code | Severity | Description |
|------|----------|-------------|
| PALETTE-001 | high | CSS variable value mismatch — house page defines a color that doesn't match the expected palette |
| PALETTE-002 | medium | Missing CSS variable — house page lacks a required `:root` custom property |
| PALETTE-003 | high | House page missing `:root` color block entirely |

### ContentBlob Validator

| Code | Severity | Description |
|------|----------|-------------|
| BLOB-001 | medium | Oversized inline `<style>` block — consider externalizing to a CSS file |
| BLOB-002 | low | Large `innerHTML` template literal — consider extracting to a template function |
| BLOB-003 | low | Base64 data URI detected — consider using an external file |
| BLOB-004 | low | Oversized inline `<script>` block — consider externalizing |

### Semantic Validator

| Code | Severity | Description |
|------|----------|-------------|
| SEM-001 | high | Heading hierarchy skip (e.g., h2 → h4, missing h3) |
| SEM-002 | medium | Multiple `<h1>` elements — page should have exactly one |
| SEM-003 | medium | Missing `<h1>` element — every page should have a main heading |
| SEM-004 | low | Missing `<main>` landmark element |
| SEM-005 | low | Navigation contains links without semantic list structure |

### UX Validator

| Code | Severity | Description |
|------|----------|-------------|
| UX-001 | suspect | Dynamic visual element (canvas/video/iframe) inserted into DOM without `scrollIntoView` — content may appear off-screen |

### Turtle Validator

| Code | Severity | Description |
|------|----------|-------------|
| TURTLE-001 | high | Opaque `background` on `.turtle-canvas-container canvas` — hides Skulpt drawing layer behind sprite layer |
| TURTLE-002 | medium | Textarea turtle code has common leading indent from HTML template — may cause Python syntax errors |

### Flex Overflow Validator

| Code | Severity | Description |
|------|----------|-------------|
| FLEX-001 | medium | Flex column container with `flex:1` missing `min-height:0` — children with `overflow-y:auto` expand the page instead of scrolling |

### Legacy / Registry Codes

| Code | Severity | Description |
|------|----------|-------------|
| ID-* | various | moduleId issues (house prefix, -quiz suffix) |
| SYNC-* | critical | Sync compatibility issues |
| REG-* | medium | Registry issues (not registered) |
| REG-ORPHAN-* | medium | Registry orphans (declared but missing) |
| FS-ORPHAN-* | low | Filesystem orphans (unreachable) |
| FS-DEADPATH-* | low | Dead directories (no references) |
| GATE-* | high | Gate integrity issues |
| TRACK-* | high | Progress tracking issues |
| CFG-* | high | Configuration issues |
| COV-* | medium | Coverage gaps (missing quiz/lab) |

---

## Scan Profiles

Profiles control which validators run and at what sensitivity.

| Profile | Use Case | What Runs |
|---------|----------|-----------|
| **ci** (default) | PR checks, pre-deploy | Critical/high checks only. HTML-001, JS-001/002/005/006, SCOPE-001, ENG-001, PATH-001/002, PATH-004, all global validators (incl. CSP-001) |
| **strict** | Deep audits | Everything in `ci` plus bracket balance, common errors, structural tags, dynamic imports, strict naming |
| **inventory** | Statistics gathering | Counts and metadata only — no issue flagging, never fails |

```bash
# Profile examples
npm run scan                          # ci profile (default)
npm run scan:syntax:strict            # strict profile
node _tools/eduscan/cli.js --syntax=strict
node _tools/eduscan/cli.js --syntax=inventory
```

---

## CI/CD Integration

### GitHub Actions

EduScan runs automatically on every PR to `master` via `.github/workflows/eduscan.yml`.

**What it does:**
1. Runs `npm run scan:ci` (diff + archive)
2. Parses TREASURE_MAP.json for severity counts
3. Posts/updates a scan report comment on the PR
4. Blocks merge if any CRITICAL issues are found

The workflow uses a marker comment (`<!-- eduscan-ci-comment -->`) to update the same comment on subsequent pushes, avoiding comment spam.

### Deploy Gate

The `deploy.sh` script (invoked via `npm run deploy`) runs a pre-flight scan before deploying to Firebase:

```bash
./deploy.sh          # Scan → block on CRITICAL → firebase deploy
./deploy.sh --force  # Skip scan, deploy immediately
./deploy.sh --strict # Block on CRITICAL or HIGH
```

Non-critical issues are reported but do not block deployment.

---

## Test Suite

Run the signature test suite with:

```bash
npm run scan:test
```

### How It Works

The test runner (`tests/run.js`) loads fixture files from `tests/fixtures/`, runs validators against each, and compares detected issue codes against expected codes in `tests/expectations.js`.

### Fixture Files

| Fixture | Tests | Expected Codes |
|---------|-------|----------------|
| `clean.html` | Zero false positives | (none) |
| `html-issues.html` | HTML structural errors | HTML-001, 003, 005, 006, 007 |
| `js-issues.html` | JS syntax errors | JS-001, 002, 005, 006 |
| `engine-issues.html` | Missing engines | ENG-001, 002, 003 |
| `path-issues.html` | Broken paths | PATH-001, 002, 003, DUP-001 |
| `path-depth-issues.html` | Depth rule violations | PATH-DEPTH-001, 002 |
| `naming-issues.html` | Naming convention | NAME-002 |
| `html-strict-issues.html` | Strict HTML checks | HTML-004, 008, 009, 010 |
| `js-strict-issues.html` | Strict JS checks | JS-003, 004, SCOPE-001 |
| `path-strict-issues.html` | Strict path checks | PATH-004, 005 |
| `naming-full-issues.html` | Full naming checks | NAME-003, 004 |
| `heuristic-issues.html` | Anomaly detection | HEUR-001 through HEUR-021, QUIZ-001 through QUIZ-005, MATH-001, DATA-001 |
| `nav-issues.html` | Navigation issues | NAV-001 |
| `emoji-issues.html` | Emoji usage | EMOJI-001, 002, 003, 004 |
| `semantic-issues.html` | Semantic structure | SEM-001, 002 |
| `ux-issues.html` | UX heuristics | UX-001 |
| `turtle-issues.html` | Turtle canvas issues | TURTLE-001, 002 |
| `flex-overflow-issues.html` | Flex column overflow | FLEX-001 |

### Global Regression Tests

Beyond fixture tests, the suite also runs:
- **ContentCatalog zero-dead-links**: Validates all `available` modules in ContentCatalog.js resolve to real files (catches CAT-001 regressions)
- **ContentCatalog zero-duplicate-IDs**: Verifies no duplicate module IDs exist (catches CAT-005 regressions)
- **LearningPaths prerequisite integrity**: Verifies zero broken prereq refs (LP-004) and zero circular chains (LP-005) on the live codebase
- **LearningPaths valid codes**: Confirms all emitted LP issues use recognized LP codes
- **LearningPaths positive detection**: Fixture-based tests for LP-004, LP-005, LP-006, LP-008, LP-009
- **NAV-003 positive detection**: Simulates a course subdirectory file with bad back button href
- **NAV-004 positive detection**: Simulates a house index with missing path card href where hub directory exists
- **AutoFixer dry-run**: Validates dry-run produces correct fix/skip counts without modifying files
- **AutoFixer live mode**: Validates live mode correctly modifies files

---

## Reports

EduScan generates reports in `_tools/reports/` (gitignored):

| File | Description |
|------|-------------|
| `TREASURE_MAP.json` | Machine-readable content map + all issues + severity counts |
| `TREASURE_MAP.md` | Human-readable report with issue tables |
| `PATCH_PLAN.json` | Remediation plan (grouped fix batches) |
| `PATCH_PLAN.md` | Human-readable fix batches |
| `LP_FIX_REPORT.md` | LearningPaths fix results |
| `RENAME_MAP.json` | Planned file renames |
| `RENAME_ROLLBACK.json` | Undo data for renames |
| `REORG_MAP.json` | Planned directory moves |
| `REORG_ROLLBACK.json` | Undo data for moves |
| `MODULE_REGISTRY.json` | moduleId → file path mapping |
| `history/*.json` | Archived scans for drift comparison |

---

## New Validators (Stragglers, 2026-04-30)

Six new checks added during the Stragglers branch QA pass. All wired into the main `SyntaxValidator` pipeline (STR-34 done) — `npm run scan` picks them up automatically. Standalone runners exist for ad-hoc inspection.

| Code | Severity | What it catches | Runner |
|------|----------|-----------------|--------|
| **PROG-003** | critical (≥5 files), medium (2–4) | Cross-file shared `ModuleProgress.complete('house', 'sameKey', ...)` calls. Bug: `isFirstCompletion` uses bare moduleId (no house) — only the first file's completion pushes XP/badges to Firestore; subsequent completions are silently suppressed. Found 5 critical clusters / 70 buggy files (WSA `cloud-guilab/pslab/presentation` series + A+ Core 2 chapters using `'forge', 'index'` template leftover). 4 of 5 critical clusters fixed in branch (65 files renamed). | `node _tools/eduscan/run-prog-003.js` |
| **CAT-006** | medium | Catalog ids ending in `.module/.tool/.lab/.quiz/.applet` — CAT-002 deriveModuleId artifact (file extensions leaked into ID generation). Hub inline arrays use the clean form, requiring scanner Mech 4 to apply a suffix-stripping workaround. Found 164 polluted ids (160 armory + 4 CCNA tools); cleaned in same branch (164 → 0). | `node _tools/eduscan/run-cat-006.js` (also runs as part of `ContentCatalogValidator.validate()`) |
| **CAT-007** | medium | Multiple catalog entries pointing to the same `(house, href)`. Indicates dual-naming (legacy + new id during migration) OR dead code. Found 51 duplicate pairs / 104 modules (mostly CLH parent dual-naming `clh-001` + `script-clh-001` × 31, plus `web-ip-*` triples). Operator decision pending — STR-33. | runs as part of `ContentCatalogValidator.validate()` |
| **TAG-001** | medium | Tag case variants (`SIEM` vs `siem`). Tag filtering is case-sensitive — variants split the discovery surface. Found 23 case-variant pairs; auto-fixed via lowercase canonicalization (23 → 0). | runs as part of `TagsValidator.validate()` |
| **TAG-002** | info | Modules with no tags (discoverability gap). One summary issue, not per-module. Currently 2564 of 2997 modules (~85%) lack tags. Large-scope content cleanup; flagged INFO not blocker. | (same) |
| **HUB-001** | medium / high (20+) | Hub `data-module="X"` references where X has no matching catalog entry (after house-prefix tolerance). Renderer creates card slots for nonexistent modules — students see broken/empty/silent-skip cards. Found 503 broken refs across 27 hubs (10 hubs ≥20 broken). Operator decision per hub — STR-44. | runs as part of `HubRefsValidator.validate()` |

`PROG-003` lives in `validators/syntax/progress-keys.js` alongside PROG-001 (individual key reads) and PROG-002 (2-arg complete missing houseId). Cross-file analysis — runs as global validator, loads its own content via `fs.readFileSync`.

`CAT-006` and `CAT-007` live in `validators/syntax/content-catalog.js` alongside CAT-001..CAT-005.

---

## Orphan Placement Pipeline (Stragglers, 2026-04-30)

> **Positioning:** these scripts are a **post-scan placement pipeline**, not a replacement for `npm run scan:orphans` / `scan:orphans:deep`. Those existing commands surface raw orphans at scan time. The placement pipeline starts from the strict scanner's report and produces an actionable per-cluster placement plan (existing hub vs new hub vs incubation vs cleanup). They are not registered as `npm run scan:*` because they output planning artifacts, not pass/fail validation results.

Run order (each step writes to `_tools/reports/` and feeds the next):

```bash
# 1. Strict orphan detection (4 mechanisms — see definition v2 in scanner header)
node _tools/eduscan/strict-orphan-scanner.js
#    → _tools/reports/STRICT_ORPHAN_MAP.json

# 2. Sub-content + cluster analysis + existing hub inventory
node _tools/eduscan/orphan-cluster-analyzer.js
#    → _tools/reports/ORPHAN_CLUSTER_MATRIX.{json,md}

# 3. Per-cluster placement recommendations (existing/new/incubation/cleanup)
node _tools/eduscan/placement-recommender.js
#    → _tools/reports/PLACEMENT_RECOMMENDATIONS.{json,md}

# 4. Generate per-house incubation hubs from the recommendations
node _tools/eduscan/incubator-generator.js
#    → _app/houses/<h>/incubator/index.html  (× 8 houses)
#    → _app/houses/<h>/incubator/README.md   (graduation log per hub)
```

**Strict-orphan definition vs `scan:orphans:deep`:** the existing scan commands consider a module reachable via 6 mechanisms (data-module attrs, getHouseModules() catalog dumps, LearningPaths, bespoke `<a href>`, ContentDiscovery search, dedicated *Engine renderers). The strict scanner only counts the *curated* subset (data-module attrs, LearningPaths, dedicated-engine, inline-hub script ids — see scanner header). It will report *more* orphans than `scan:orphans:deep` because it rejects loose mechanisms.

See `_docs/features/INCUBATION_HUBS.md` for the incubation hub design + graduation rule.

---

## Auto-Fix Tools

### Fix Broken LearningPaths References

```bash
node _tools/eduscan/fixers/learning-paths-fixer.js --dry-run   # Preview
node _tools/eduscan/fixers/learning-paths-fixer.js              # Apply
node _tools/eduscan/fixers/learning-paths-fixer.js --min-confidence 0.9
```

### Rename Files to Convention

The naming convention is: `{house}-{name}.{type}.html`

```bash
node _tools/eduscan/fixers/rename-mapper.js        # Generate rename map
node _tools/eduscan/fixers/rename-applier.js --dry-run  # Preview
node _tools/eduscan/fixers/rename-applier.js        # Apply
node _tools/eduscan/fixers/rename-undo.js           # Rollback
```

### Reorganize Directory Structure

Moves files to proper type directories (`labs/`, `quizzes/`, `presentations/`, etc.)

```bash
node _tools/eduscan/fixers/reorg-mapper.js          # Generate move map
node _tools/eduscan/fixers/reorg-applier.js --dry-run  # Preview
node _tools/eduscan/fixers/reorg-applier.js         # Apply
node _tools/eduscan/fixers/reorg-undo.js            # Rollback
```

---

## Quarantine Allowlist

Known false positives can be suppressed via `quarantine-allowlist.json`:

```json
[
    { "file": "houses/web/labs/some-legacy-file.html", "code": "HEUR-001" }
]
```

The heuristics validator checks this file and skips matching entries.

---

## Verified False Positives (HITL)

The Human-in-the-Loop (HITL) verification system is the primary method for suppressing confirmed false positives. Unlike the quarantine allowlist (which matches file+code), verified findings use a **content hash** that expires automatically when the flagged code changes.

### How It Works

1. EduScan flags a finding during a scan
2. A human reviews the finding and confirms it is a false positive
3. The human labels it via CLI (see below)
4. A signature is stored in `verified-findings.json` with:
   - `code` -- the rule ID (e.g., QUIZ-001)
   - `file` -- relative file path from `_app/`
   - `line` -- line number where the finding occurs
   - `hash` -- SHA-256 (first 12 chars) of the trimmed line content
   - `verifiedBy` -- who reviewed it
   - `date` -- when it was reviewed
   - `reason` -- why it is a false positive
5. On future scans, matched findings are suppressed
6. **If the line content changes, the hash won't match and the label expires** -- the finding gets re-flagged for human review

### CLI Commands

**Add a verified false positive:**

```bash
node cli.js --verify <CODE> \
  --verify-file <relative-path-from-_app> \
  --verify-line <line-number> \
  --reason "explanation of why this is a false positive"
```

**Example:**

```bash
node cli.js --verify QUIZ-001 \
  --verify-file houses/shield/applets/compliance/cmmc_quiz/shield-cmmc-comprehensive.quiz.html \
  --verify-line 287 \
  --reason "correct: fields are domain score counters, not answer keys"
```

**Remove a verification (re-flag for review):**

```bash
node cli.js --unverify <CODE> \
  --verify-file <relative-path> \
  --verify-line <line-number>
```

**List all verified false positives:**

```bash
node cli.js --show-verified
```

### Data File

Verified findings are stored in `_tools/eduscan/verified-findings.json`. Each entry looks like:

```json
{
  "code": "QUIZ-001",
  "file": "houses/shield/applets/compliance/cmmc_quiz/shield-cmmc-comprehensive.quiz.html",
  "line": 287,
  "hash": "18239ab442c7",
  "verifiedBy": "eq",
  "date": "2026-04-22",
  "reason": "correct: fields are domain score counters, not answer keys"
}
```

### Hash Expiration

The hash is computed as: `SHA-256(line_content.trim()).substring(0, 12)`

If someone edits the flagged line (even changing whitespace beyond leading/trailing), the hash changes and the verification expires. This prevents stale suppressions from hiding real problems introduced by code changes.

### When to Use What

| Method | Use When | Expiration |
|--------|----------|------------|
| `verified-findings.json` (HITL) | Confirmed false positive on a specific line | Auto-expires on code change |
| `quarantine-allowlist.json` | Blanket suppress a rule for an entire file | Never expires (manual removal) |
| `<!-- eduscan-ignore: CODE reason="..." -->` | Inline suppression in the HTML file itself | Lives with the code |

**Prefer HITL verification** for individual findings. Use quarantine allowlist only for files that need blanket suppression. Use inline directives sparingly.

---

## Naming Convention

### Standard Format

```
{house}-{name}.{type}.html
```

**Examples:**
- `web-ospf.presentation.html`
- `shield-firewall-builder.applet.html`
- `forge-hardware-troubleshooting.lab.html`
- `script-python-basics.quiz.html`

### Valid Houses

`web`, `shield`, `forge`, `script`, `cloud`, `code`, `key`, `eye`

### Valid Content Types

`presentation`, `quiz`, `lab`, `applet`, `module`, `tool`, `simulator`, `reference`, `exam`

### Directory Structure

```
houses/{house}/
├── presentations/    # *.presentation.html
├── quizzes/          # *.quiz.html
├── labs/             # *.lab.html
├── applets/          # *.applet.html
├── tools/            # *.tool.html
├── modules/          # *.module.html (course containers)
└── references/       # *.reference.html
```

---

## Lifecycle Directives

Add directives to HTML files to control EduScan behavior:

```html
<!-- eduscan-lifecycle: status="draft" owner="John" -->
<!-- eduscan-lifecycle: status="live" -->
<!-- eduscan-lifecycle: status="archive" -->
<!-- eduscan-lifecycle: status="gated" gates=5 reason="Puzzle progression" -->
```

### Ignore Directives

```html
<!-- eduscan-ignore: ID-001 reason="legacy content" -->
<!-- eduscan-ignore-all reason="archived module" -->
```

---

## Architecture

```
_tools/eduscan/
├── cli.js                          # Command-line interface
├── index.js                        # Main module exports
├── scanner.js                      # Core file scanner
├── quarantine-allowlist.json       # Heuristic false-positive suppressions
├── parsers/                        # Content type parsers
│   ├── index.js
│   ├── applet.js
│   ├── lab.js
│   ├── presentation.js
│   └── quiz.js
├── validators/
│   ├── index.js                    # Validator orchestrator
│   ├── coverage.js                 # Coverage analysis
│   ├── orphans.js                  # Orphan detection
│   ├── flow-validator.js           # FLOW-001 — unchained content detection
│   ├── syntax/                     # Static validators (per-file + global)
│   │   ├── index.js                # Orchestrator (19 sub-validators)
│   │   ├── html.js                 # HTML-001 through HTML-010
│   │   ├── js.js                   # JS-001 through JS-006, SCOPE-001
│   │   ├── engine.js               # ENG-001 through ENG-003
│   │   ├── paths.js                # PATH-001 through PATH-IDX-001
│   │   ├── naming.js               # NAME-001 through NAME-004
│   │   ├── heuristics.js           # HEUR-001 through HEUR-021, QUIZ-001 through QUIZ-005, MATH-001, DATA-001
│   │   ├── csp.js                  # CSP-001
│   │   ├── content-catalog.js      # CAT-001 through CAT-005
│   │   ├── learning-paths.js       # LP-001 through LP-010
│   │   ├── navigation.js           # NAV-001 through NAV-004
│   │   ├── assignment-links.js     # ASGN-001 through ASGN-006
│   │   ├── dependency-check.js     # DEP-001 through DEP-005
│   │   ├── emoji.js                # EMOJI-001 through EMOJI-004
│   │   ├── palette.js              # PALETTE-001 through PALETTE-003
│   │   ├── content-blob.js         # BLOB-001 through BLOB-004
│   │   ├── semantic.js             # SEM-001 through SEM-005
│   │   ├── ux.js                   # UX-001
│   │   ├── turtle.js               # TURTLE-001, TURTLE-002
│   │   └── flex-overflow.js        # FLEX-001
│   ├── impact/                     # Impact analysis validators
│   │   ├── index.js
│   │   ├── contract-validator.js
│   │   └── dependency-map.js
│   └── functional/                 # Headless browser validators
│       ├── index.js                # Functional orchestrator
│       ├── browser.js              # Puppeteer browser pool
│       ├── runtime.js              # FUNC-001 through FUNC-006
│       └── smoke.js                # FUNC-010 through FUNC-017
├── fixers/                         # Auto-fix tools
│   ├── index.js
│   ├── auto-fixer.js               # Generic auto-fixer (ID-001, TRACK-001, etc.)
│   ├── learning-paths-fixer.js
│   ├── link-fixer.js
│   ├── games-href-fixer.js
│   ├── rename-mapper.js
│   ├── rename-applier.js
│   ├── rename-undo.js
│   ├── reorg-mapper.js
│   ├── reorg-applier.js
│   ├── reorg-undo.js
│   ├── naming-fixer.js
│   ├── tutorial-gen.js
│   └── unbarricade.js
├── generators/                     # Code generators
│   └── registry-generator.js
├── registry/                       # Module registry
│   ├── index.js
│   └── module-registry.js
├── reporters/                      # Output formatters
│   ├── console.js
│   ├── json.js
│   └── markdown.js
├── tests/                          # Signature test suite
│   ├── run.js                      # Test runner (18 fixtures + 18 global)
│   ├── expectations.js             # Expected codes per fixture
│   └── fixtures/                   # 23 test files
│       ├── clean.html
│       ├── html-issues.html
│       ├── html-strict-issues.html
│       ├── js-issues.html
│       ├── js-strict-issues.html
│       ├── engine-issues.html
│       ├── path-issues.html
│       ├── path-depth-issues.html
│       ├── path-strict-issues.html
│       ├── naming-issues.html
│       ├── naming-full-issues.html
│       ├── heuristic-issues.html
│       ├── nav-issues.html
│       ├── emoji-issues.html
│       ├── semantic-issues.html
│       ├── ux-issues.html
│       ├── turtle-issues.html
│       ├── flex-overflow-issues.html
│       ├── lp-issues.learningpaths.js
│       ├── functional-issues.html
│       ├── smoke-guard.html
│       ├── smoke-harness.html
│       └── smoke-sync.html
└── utils/                          # Utilities
    ├── patterns.js
    ├── drift.js
    └── remediation.js

# Related files at project root:
deploy.sh                           # Deploy script with quality gate
.github/workflows/eduscan.yml       # GitHub Actions CI workflow
package.json                        # npm scripts (scan:*, deploy:*)
```

---

## Two-Layer Defense Model

EduScan uses a two-layer defense for catching broken content:

**Layer 1 — Static Analysis** (fast, runs every scan):
- Parses HTML, checks paths against filesystem, validates catalog entries
- Catches: missing files, broken script tags, dead hrefs, naming issues, dependency gaps

**Layer 2 — Functional Validation** (slower, requires Puppeteer):
- Loads every page in a headless browser, captures what students would actually see
- Catches: runtime JS errors, uncaught promises, resource 404s, blank screens, dead rendered links

The two layers complement each other. Static analysis catches problems before they ship. Functional validation catches problems that only manifest at runtime (e.g., JS-generated links, conditional script loading, timing issues).

---

## Development

### Adding a New Validator

1. Create validator in `validators/syntax/`:

```javascript
class MyValidator {
    constructor(options = {}) {
        this.profile = options.profile || 'ci';
    }

    validate(file) {
        const issues = [];
        if (problem) {
            issues.push({
                code: 'MY-001',
                severity: 'high',
                category: 'my-category',
                message: 'Description of issue',
                file: file.path,
                autoFixable: true,
                fix: 'How to fix it'
            });
        }
        return issues;
    }
}
module.exports = MyValidator;
```

2. Register in `validators/syntax/index.js` (import + instantiate + call in `validate()`)
3. Add test fixture in `tests/fixtures/` and expected codes in `tests/expectations.js`
4. Run `npm run scan:test` to verify

### Adding a New Fixer

1. Create fixer in `fixers/`:

```javascript
class MyFixer {
    constructor(options = {}) {
        this.dryRun = options.dryRun || false;
    }

    fix() {
        // 1. Detect issues
        // 2. Generate fixes
        // 3. Apply (if not dry run)
        // 4. Create rollback data
    }
}
module.exports = MyFixer;
```

2. Export from `fixers/index.js`

---

## Version History

- **v2.2.0** - Flex Overflow validator (FLEX-001), 36 tests (18 fixture + 18 global)
- **v2.1.0** - 6 new validators (Emoji, Palette, ContentBlob, Semantic, UX, Turtle), HEUR-007/008, NAV-004, AutoFixer, FlowValidator, impact analysis, 35 tests (17 fixture + 18 global)
- **v2.0.0** - Functional validation (Puppeteer), smoke tests, CI/CD pipeline, deploy gate, dependency checker, content catalog validator, heuristics engine, assignment link validator, test suite
- **v1.4.0** - Auto-healing system (rename, reorganize, undo)
- **v1.3.0** - LearningPaths validator and fixer
- **v1.2.0** - Module Registry integration
- **v1.1.0** - Syntax validators (HTML, JS, paths, engines)
- **v1.0.0** - Initial release (scanning, orphan detection)

---

## License

Internal tool for Hexworth Prime educational platform.
