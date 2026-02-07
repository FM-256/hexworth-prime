# EduScan v1.4.0

> **EduScan is a content integrity and topology enforcement tool for large static or semi-dynamic educational platforms.**

*Content Topology Scanner & Auto-Healer for Hexworth Prime*

EduScan is an intelligent content analysis and maintenance system that scans, validates, and auto-fixes educational content. It ensures naming conventions, detects broken references, identifies orphaned files, and maintains content integrity across the platform.

---

## Quick Start

```bash
# Full scan with all validators
node _tools/eduscan/cli.js

# Quick issue check
node _tools/eduscan/cli.js --issues-only

# Syntax validation only (CI-friendly)
node _tools/eduscan/cli.js --syntax-only

# Watch mode for development
node _tools/eduscan/cli.js --watch
```

---

## Features

### Scanning & Validation

| Feature | Description |
|---------|-------------|
| **Content Discovery** | Scans 1000+ HTML files across all houses |
| **Syntax Validation** | HTML structure, JS syntax, engine detection |
| **Path Validation** | Detects broken links, 404s, path mismatches |
| **Naming Convention** | Enforces `{house}-{name}.{type}.html` format |
| **LearningPaths Check** | Validates module hrefs resolve to real files |
| **Orphan Detection** | Finds unreachable or unregistered content |
| **Coverage Analysis** | Identifies modules missing quizzes/labs |
| **Drift Tracking** | Compares scans to detect changes over time |

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

---

## CLI Usage

```bash
node _tools/eduscan/cli.js [options]
```

### Common Options

| Option | Description |
|--------|-------------|
| `-p, --path <dir>` | Root directory to scan (default: `./_app`) |
| `-o, --output <dir>` | Output directory (default: `./_tools/reports`) |
| `-f, --format <type>` | Output: `json`, `md`, `both` (default: both) |
| `-v, --verbose` | Show detailed progress |
| `-q, --quiet` | Only output errors and summary |
| `--json` | Output issues as JSON to stdout |
| `-w, --watch` | Watch mode - re-scan on file changes |

### Scan Modes

```bash
# Full scan (all validators)
node _tools/eduscan/cli.js

# Syntax validation only
node _tools/eduscan/cli.js --syntax-only

# Syntax with profile
node _tools/eduscan/cli.js --syntax=ci       # Critical/high only
node _tools/eduscan/cli.js --syntax=strict   # Full coverage
node _tools/eduscan/cli.js --syntax=inventory # Stats only, no fail

# Orphan detection
node _tools/eduscan/cli.js --orphans-only
node _tools/eduscan/cli.js --orphans-only --deep

# Coverage analysis
node _tools/eduscan/cli.js --coverage

# Issues only (skip full map)
node _tools/eduscan/cli.js --issues-only
```

### CI Integration

```bash
# Fail on critical issues only
node _tools/eduscan/cli.js --fail-on critical

# Fail on critical or high
node _tools/eduscan/cli.js --fail-on critical,high

# Never fail (gradual adoption)
node _tools/eduscan/cli.js --warn-only
```

### Drift Tracking

```bash
# Compare against previous scan
node _tools/eduscan/cli.js --diff

# Save current scan for future comparison
node _tools/eduscan/cli.js --archive

# Compare and save
node _tools/eduscan/cli.js --diff --archive
```

---

## Auto-Fix Tools

### Fix Broken LearningPaths References

```bash
# Preview fixes
node _tools/eduscan/fixers/learning-paths-fixer.js --dry-run

# Apply fixes
node _tools/eduscan/fixers/learning-paths-fixer.js

# Custom confidence threshold
node _tools/eduscan/fixers/learning-paths-fixer.js --min-confidence 0.9
```

### Rename Files to Convention

The naming convention is: `{house}-{name}.{type}.html`

```bash
# Step 1: Generate rename map
node _tools/eduscan/fixers/rename-mapper.js

# Step 2: Preview changes
node _tools/eduscan/fixers/rename-applier.js --dry-run

# Step 3: Apply renames
node _tools/eduscan/fixers/rename-applier.js

# Undo if needed
node _tools/eduscan/fixers/rename-undo.js
```

### Reorganize Directory Structure

Moves files to proper type directories (labs → `/labs/`, quizzes → `/quizzes/`, etc.)

```bash
# Step 1: Generate reorganization map
node _tools/eduscan/fixers/reorg-mapper.js

# Step 2: Preview moves
node _tools/eduscan/fixers/reorg-applier.js --dry-run

# Step 3: Apply moves
node _tools/eduscan/fixers/reorg-applier.js

# Undo if needed
node _tools/eduscan/fixers/reorg-undo.js
```

### Full Auto-Heal Pipeline

```bash
# 1. Scan for issues
node _tools/eduscan/cli.js --issues-only

# 2. Fix LearningPaths references
node _tools/eduscan/fixers/learning-paths-fixer.js

# 3. Standardize file names
node _tools/eduscan/fixers/rename-mapper.js
node _tools/eduscan/fixers/rename-applier.js

# 4. Reorganize directories
node _tools/eduscan/fixers/reorg-mapper.js
node _tools/eduscan/fixers/reorg-applier.js

# 5. Verify
node _tools/eduscan/cli.js --issues-only
```

---

## Issue Codes

### Severity Levels

| Level | Description |
|-------|-------------|
| **CRITICAL** | Breaks sync/grading/compliance (must fix) |
| **HIGH** | Breaks analytics or progress tracking |
| **MEDIUM** | Affects reporting consistency |
| **LOW** | Hygiene, legacy, informational |

### Code Reference

| Code | Severity | Description |
|------|----------|-------------|
| **ID-*** | Various | moduleId issues (house prefix, -quiz suffix) |
| **SYNC-*** | Critical | Sync compatibility issues |
| **REG-*** | Medium | Registry issues (not registered) |
| **REG-ORPHAN-*** | Medium | Registry orphans (declared but missing) |
| **FS-ORPHAN-*** | Low | Filesystem orphans (unreachable) |
| **FS-DEADPATH-*** | Low | Dead directories (no references) |
| **GATE-*** | High | Gate integrity issues |
| **TRACK-*** | High | Progress tracking issues |
| **CFG-*** | High | Configuration issues |
| **HTML-*** | High | HTML structural errors |
| **JS-*** | High | JavaScript syntax errors |
| **ENG-*** | High | Missing engine/library |
| **PATH-*** | High | Broken paths (404) |
| **LP-*** | High | LearningPaths.js issues |
| **NAME-001** | High | File doesn't follow naming convention |
| **NAME-002** | Medium | Wrong/missing type suffix |
| **NAME-003** | Medium | Missing house prefix |
| **NAME-004** | Low | Wrong case (should be kebab-case) |
| **COV-*** | Medium | Coverage gaps |

---

## Reports

EduScan generates reports in `_tools/reports/`:

| File | Description |
|------|-------------|
| `TREASURE_MAP.json` | Machine-readable content map + issues |
| `TREASURE_MAP.md` | Human-readable report |
| `PATCH_PLAN.json` | Remediation plan (grouped fixes) |
| `PATCH_PLAN.md` | Human-readable fix batches |
| `LP_FIX_REPORT.md` | LearningPaths fix results |
| `RENAME_MAP.json` | Planned file renames |
| `RENAME_ROLLBACK.json` | Undo data for renames |
| `REORG_MAP.json` | Planned directory moves |
| `REORG_ROLLBACK.json` | Undo data for moves |
| `MODULE_REGISTRY.json` | moduleId → file path mapping |
| `history/*.json` | Archived scans for drift |

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

### Valid Types

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
├── cli.js              # Command-line interface
├── index.js            # Main module exports
├── scanner.js          # Core file scanner
├── parsers/            # Content type parsers
│   ├── applet.js
│   ├── lab.js
│   ├── presentation.js
│   └── quiz.js
├── validators/         # Issue detection
│   ├── syntax/
│   │   ├── html.js     # HTML structure
│   │   ├── js.js       # JavaScript syntax
│   │   ├── engine.js   # Engine detection
│   │   ├── paths.js    # Path validation
│   │   ├── naming.js   # Naming convention
│   │   └── learning-paths.js
│   ├── coverage.js     # Coverage analysis
│   └── orphans.js      # Orphan detection
├── fixers/             # Auto-fix tools
│   ├── learning-paths-fixer.js
│   ├── rename-mapper.js
│   ├── rename-applier.js
│   ├── rename-undo.js
│   ├── reorg-mapper.js
│   ├── reorg-applier.js
│   ├── reorg-undo.js
│   └── naming-fixer.js
├── registry/           # Module registry
│   └── module-registry.js
├── reporters/          # Output formatters
│   ├── console.js
│   ├── json.js
│   └── markdown.js
└── utils/              # Utilities
    ├── patterns.js
    ├── drift.js
    └── remediation.js
```

---

## Development

### Adding a New Validator

1. Create validator in `validators/syntax/`:

```javascript
class MyValidator {
    validate(file) {
        const issues = [];
        // Detect issues...
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

2. Register in `validators/syntax/index.js`
3. Add to CLI if needed

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
        // 4. Create rollback
    }
}
module.exports = MyFixer;
```

2. Export from `fixers/index.js`

---

## Version History

- **v1.4.0** - Auto-healing system (rename, reorganize, undo)
- **v1.3.0** - LearningPaths validator and fixer
- **v1.2.0** - Module Registry integration
- **v1.1.0** - Syntax validators (HTML, JS, paths, engines)
- **v1.0.0** - Initial release (scanning, orphan detection)

---

## License

Internal tool for Hexworth Prime educational platform.
