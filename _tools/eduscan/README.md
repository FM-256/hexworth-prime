# EduScan v2.0.0

> **Content integrity, topology enforcement, and runtime validation for large static educational platforms.**

EduScan is the quality infrastructure for Hexworth Prime. It scans 1400+ content files across 9 houses, validates naming conventions, detects broken references, catches missing dependencies, verifies ContentCatalog integrity, runs headless browser smoke tests, and auto-fixes what it can. It powers both local development workflows and CI/CD quality gates.

---

## Quick Start

```bash
# Full scan (all static validators)
npm run scan

# Quick issue check (quiet mode)
npm run scan:quick

# Signature test suite (12 fixture tests + global regression)
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
| `npm run scan:test` | Signature test suite — 12 fixture tests + global regressions |

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
| **JavaScript** | `js.js` | Script block syntax — bracket balance, string quotes, common errors |
| **Engine** | `engine.js` | Missing engines/libraries (QuizEngine, LabEngine, PresentationEngine, etc.) |
| **Path** | `paths.js` | Broken `<script src>`, `<link href>`, `<img src>` — 404 detection with smart bucketing |
| **Naming** | `naming.js` | Enforces `{house}-{name}.{type}.html` naming convention |
| **Heuristics** | `heuristics.js` | Anomaly detection — excessive inline scripts, TODO markers, console.log, duplicate includes |
| **Dependency** | `dependency-check.js` | "Wired but not plugged in" — code calls ProgressManager/GameTracker but never loads the script |

### Static Validation (Global)

| Validator | File | Description |
|-----------|------|-------------|
| **ContentCatalog** | `content-catalog.js` | Validates all 1400+ module hrefs in ContentCatalog.js resolve to real files |
| **LearningPaths** | `learning-paths.js` | Validates cert path hrefs, duplicate module IDs, house folder mapping |
| **AssignmentLinks** | `assignment-links.js` | Simulates student assignment clicks — verifies resolved URLs hit real files |
| **RendererLinks** | `heuristics.js` | Scans shared JS renderers for hardcoded relative hrefs (fragile back links) |
| **MissingIndexes** | `index.js` | Flags content directories with 3+ HTML files but no `index.html` |

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

### ContentCatalog Validator

| Code | Severity | Description |
|------|----------|-------------|
| CAT-001 | critical | Module status `available` but href file doesn't exist on disk |
| CAT-002 | medium | HTML content file on disk not declared in any catalog module |
| CAT-003 | high | Module status `available` with empty or missing href |

### LearningPaths Validator

| Code | Severity | Description |
|------|----------|-------------|
| LP-001 | high | Module href points to non-existent file |
| LP-002 | medium | Path has no houseFolder and uses relative hrefs |
| LP-003 | medium | Duplicate module IDs across paths |

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
| **ci** (default) | PR checks, pre-deploy | Critical/high checks only. HTML-001, JS-001/002, ENG-001, PATH-001/002, PATH-004, all global validators |
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

The test runner (`tests/run.js`) loads 12 fixture HTML files from `tests/fixtures/`, runs validators against each, and compares detected issue codes against expected codes in `tests/expectations.js`.

### Fixture Files

| Fixture | Tests | Expected Codes |
|---------|-------|----------------|
| `clean.html` | Zero false positives | (none) |
| `html-issues.html` | HTML structural errors | HTML-001, 003, 005, 006, 007 |
| `js-issues.html` | JS syntax errors | JS-001, 002 |
| `engine-issues.html` | Missing engines | ENG-001, 002, 003 |
| `path-issues.html` | Broken paths | PATH-001, 002, 003, DUP-001 |
| `path-depth-issues.html` | Depth rule violations | PATH-DEPTH-001, 002 |
| `naming-issues.html` | Naming convention | NAME-002 |
| `html-strict-issues.html` | Strict HTML checks | HTML-004, 008, 009, 010 |
| `js-strict-issues.html` | Strict JS checks | JS-003, 004 |
| `path-strict-issues.html` | Strict path checks | PATH-004, 005 |
| `naming-full-issues.html` | Full naming checks | NAME-003, 004 |
| `heuristic-issues.html` | Anomaly detection | HEUR-001, 002, 003, 004, 005 |

### Global Regression Tests

Beyond fixture tests, the suite also runs:
- **ContentCatalog zero-dead-links**: Validates all `available` modules in ContentCatalog.js resolve to real files (catches CAT-001 regressions)

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
│   ├── index.js                    # Syntax validator orchestrator
│   ├── coverage.js                 # Coverage analysis
│   ├── orphans.js                  # Orphan detection
│   ├── syntax/                     # Static validators (per-file + global)
│   │   ├── index.js                # Orchestrator (10 sub-validators)
│   │   ├── html.js                 # HTML-001 through HTML-010
│   │   ├── js.js                   # JS-001 through JS-004
│   │   ├── engine.js               # ENG-001 through ENG-003
│   │   ├── paths.js                # PATH-001 through PATH-IDX-001
│   │   ├── naming.js               # NAME-001 through NAME-004
│   │   ├── heuristics.js           # HEUR-001 through HEUR-006
│   │   ├── content-catalog.js      # CAT-001 through CAT-003
│   │   ├── learning-paths.js       # LP-001 through LP-003
│   │   ├── assignment-links.js     # ASGN-001 through ASGN-006
│   │   └── dependency-check.js     # DEP-001 through DEP-005
│   └── functional/                 # Headless browser validators
│       ├── index.js                # Functional orchestrator
│       ├── browser.js              # Puppeteer browser pool
│       ├── runtime.js              # FUNC-001 through FUNC-006
│       └── smoke.js                # FUNC-010 through FUNC-017
├── fixers/                         # Auto-fix tools
│   ├── index.js
│   ├── learning-paths-fixer.js
│   ├── rename-mapper.js
│   ├── rename-applier.js
│   ├── rename-undo.js
│   ├── reorg-mapper.js
│   ├── reorg-applier.js
│   ├── reorg-undo.js
│   └── naming-fixer.js
├── registry/                       # Module registry
│   ├── index.js
│   └── module-registry.js
├── reporters/                      # Output formatters
│   ├── console.js
│   ├── json.js
│   └── markdown.js
├── tests/                          # Signature test suite
│   ├── run.js                      # Test runner (12 fixtures + global)
│   ├── expectations.js             # Expected codes per fixture
│   └── fixtures/                   # 16 test HTML files
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
│       ├── functional-issues.html
│       ├── smoke-guard.html
│       └── smoke-harness.html
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

- **v2.0.0** - Functional validation (Puppeteer), smoke tests, CI/CD pipeline, deploy gate, dependency checker, content catalog validator, heuristics engine, assignment link validator, test suite
- **v1.4.0** - Auto-healing system (rename, reorganize, undo)
- **v1.3.0** - LearningPaths validator and fixer
- **v1.2.0** - Module Registry integration
- **v1.1.0** - Syntax validators (HTML, JS, paths, engines)
- **v1.0.0** - Initial release (scanning, orphan detection)

---

## License

Internal tool for Hexworth Prime educational platform.
