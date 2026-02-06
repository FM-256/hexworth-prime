# EduScan - Design Document

**Created:** February 6, 2026
**Status:** DESIGN PHASE
**Author:** Hexworth Prime Development Team
**Version:** 1.0.0-draft

---

## Executive Summary

EduScan is a Content Topology Scanner for Educational Platforms. It scans a codebase, identifies learning content (quizzes, labs, presentations), extracts their tracking configurations, and validates sync compatibility. It produces a comprehensive "Treasure Map" of all educational content plus an audit report of issues.

---

## The Problem

Educational platforms have dozens or hundreds of content files. Each file has configuration that must align with:
- Content registry entries
- Progress tracking systems
- Handler assignment IDs
- Sync mechanisms

Manual auditing is:
- Time-consuming (tokens, human hours)
- Error-prone (easy to miss files)
- Repetitive (must re-audit after changes)
- Inconsistent (different people check different things)

---

## The Solution

An automated scanner that:
1. Walks the file tree
2. Detects content types by parsing actual code
3. Extracts tracking configuration
4. Cross-references against registry
5. Validates sync compatibility
6. Generates machine + human readable reports

---

## What Makes EduScan Novel

### Existing Tools vs EduScan

| Tool Category | Examples | What They Do | Gap |
|---------------|----------|--------------|-----|
| Code Quality | ESLint, SonarQube | Lint code syntax | Don't understand learning content |
| Documentation | JSDoc, Storybook | Generate API docs | Don't extract quiz configs |
| File Utilities | `tree`, `find` | List files | No content intelligence |
| CMS Auditors | WP plugins | Audit WordPress | Platform-specific, not custom LMS |
| Network Scanners | nmap | Map network topology | Files, not ports |

### EduScan's Unique Capabilities

1. **Learning Content Type Detection**
   - Recognizes quiz vs lab vs presentation vs applet
   - Parses embedded JavaScript configuration
   - Understands educational content semantics

2. **Tracking Configuration Extraction**
   - Reads `moduleId`, `houseId`, `trackProgress` from code
   - Understands QuizEngine, ProgressManager, saveProgress patterns
   - Maps configuration to sync requirements

3. **Sync Compatibility Validation**
   - Knows the full tracking chain (content → localStorage → Firestore → handler)
   - Detects mismatches that break progress tracking
   - Understands contentId format requirements

4. **Registry Cross-Reference**
   - Compares actual files against content-registry.js
   - Finds unregistered content
   - Finds orphaned registry entries (file deleted but still registered)

5. **Educational Topology Mapping**
   - Shows content architecture, not just file tree
   - Groups by house, course, module
   - Visualizes learning paths

---

## Analogy

**nmap : network ports :: EduScan : learning content**

| nmap | EduScan |
|------|---------|
| Scans IP addresses | Scans file directories |
| Detects open ports | Detects content files |
| Identifies services (SSH, HTTP) | Identifies content types (quiz, lab) |
| Extracts versions | Extracts configurations |
| Finds vulnerabilities | Finds sync-breaking issues |
| Maps network topology | Maps content topology |

---

## Technical Architecture

### Directory Structure

```
_tools/
├── eduscan/
│   ├── index.js              # Main entry point
│   ├── cli.js                # Command-line interface
│   ├── scanner.js            # File tree walker
│   ├── parsers/
│   │   ├── index.js          # Parser orchestrator
│   │   ├── quiz.js           # QuizEngine pattern detection
│   │   ├── presentation.js   # Presentation/saveProgress detection
│   │   ├── lab.js            # Lab content detection
│   │   ├── applet.js         # Interactive applet detection
│   │   └── registry.js       # content-registry.js parser
│   ├── validators/
│   │   ├── index.js          # Validator orchestrator
│   │   ├── sync.js           # Sync compatibility checks
│   │   ├── registry.js       # Registry coverage checks
│   │   └── paths.js          # URL/path validation
│   ├── reporters/
│   │   ├── json.js           # JSON output generator
│   │   ├── markdown.js       # Markdown output generator
│   │   └── console.js        # Terminal output formatter
│   ├── utils/
│   │   ├── file.js           # File system utilities
│   │   └── patterns.js       # Regex patterns for detection
│   └── package.json          # Dependencies + CLI config
│
├── reports/                  # Generated output (gitignored)
│   ├── TREASURE_MAP.json
│   └── TREASURE_MAP.md
│
└── EDUSCAN_DESIGN.md         # This document
```

### Core Components

#### 1. Scanner (`scanner.js`)
- Recursively walks directory tree
- Filters by file extension (.html, .js)
- Builds hierarchy object
- Passes files to parsers

#### 2. Parsers (`parsers/*.js`)
- Each parser knows one content type
- Uses regex patterns to detect and extract
- Returns structured configuration object

**Quiz Parser Patterns:**
```javascript
// Detect QuizEngine usage
/new\s+QuizEngine\s*\(\s*\{/

// Extract moduleId
/moduleId:\s*['"]([^'"]+)['"]/

// Extract houseId
/houseId:\s*['"]([^'"]+)['"]/

// Extract trackProgress
/trackProgress:\s*(true|false)/

// Extract passingScore
/passingScore:\s*(\d+)/

// Count questions
/questions:\s*\[/ ... count objects
```

**Presentation Parser Patterns:**
```javascript
// Detect saveProgress call
/saveProgress\s*\(/

// Detect ProgressManager usage
/ProgressManager\.completeModule\s*\(/
```

#### 3. Validators (`validators/*.js`)
- Take parsed content + registry
- Apply validation rules
- Generate issue objects

**Sync Validator Rules:**
```javascript
// Rule: moduleId must not contain house prefix
if (config.moduleId.startsWith(config.houseId + '-')) {
  issues.push({ code: 'SYNC-001', ... });
}

// Rule: moduleId must not end with '-quiz'
if (config.moduleId.endsWith('-quiz')) {
  issues.push({ code: 'SYNC-002', ... });
}

// Rule: houseId must be valid house name
const validHouses = ['web', 'shield', 'forge', 'script', 'cloud', 'code', 'key', 'eye'];
if (!validHouses.includes(config.houseId)) {
  issues.push({ code: 'SYNC-003', ... });
}
```

#### 4. Reporters (`reporters/*.js`)
- Take scan results
- Format for output
- Write to files

---

## Output Formats

### JSON (`TREASURE_MAP.json`)

Machine-readable, complete data. Used for:
- Programmatic access
- Claude reading in future sessions
- Integration with other tools

```javascript
{
  "meta": {
    "version": "1.0.0",
    "scannedAt": "2026-02-06T14:32:05Z",
    "rootPath": "_app/",
    "scanDuration": 1247  // ms
  },
  "summary": {
    "totalFiles": 847,
    "contentFiles": 156,
    "byType": {
      "quiz": 42,
      "presentation": 38,
      "lab": 28,
      "applet": 31,
      "other": 17
    },
    "registryCoverage": 0.78,
    "syncReady": 0.65,
    "issueCount": 23,
    "issuesBySeverity": {
      "critical": 8,
      "warning": 12,
      "info": 3
    }
  },
  "hierarchy": { /* nested tree structure */ },
  "content": [ /* array of content objects */ ],
  "issues": [ /* array of issue objects */ ],
  "registry": {
    "entries": [ /* all registry entries */ ],
    "unregistered": [ /* files not in registry */ ],
    "orphaned": [ /* registry entries with no file */ ]
  }
}
```

### Markdown (`TREASURE_MAP.md`)

Human-readable report. Used for:
- Manual review
- Documentation
- Sharing with team

See "Sample Run" section in previous conversation for format.

---

## CLI Interface

```
Usage: eduscan [options]

Options:
  -p, --path <dir>       Root directory to scan (default: ./_app)
  -o, --output <dir>     Output directory (default: ./_tools/reports)
  -f, --format <type>    Output: json, md, both (default: both)
  -v, --verbose          Show detailed progress
  -q, --quiet            Only output errors
  --issues-only          Skip full map, only show issues
  --json                 Output issues as JSON to stdout
  --watch                Watch for changes, rescan automatically
  --fix                  Attempt auto-fix for simple issues (future)
  -h, --help             Show help
  --version              Show version

Examples:
  eduscan                            # Default scan
  eduscan -v                         # Verbose output
  eduscan --issues-only              # Quick issue check
  eduscan -p ./src -o ./audit        # Custom paths
  eduscan --json | jq '.issues'      # Pipe to jq
```

---

## Severity Levels

| Level | Meaning | Action Required |
|-------|---------|-----------------|
| CRITICAL | Breaks sync, grading, or compliance | Must fix immediately |
| HIGH | Breaks analytics or progress tracking | Fix before deploy |
| MEDIUM | Affects reporting consistency | Fix when convenient |
| LOW | Hygiene, legacy, informational | Optional cleanup |

---

## Issue Codes

| Code | Severity | Category | Description |
|------|----------|----------|-------------|
| ID-001 | Critical | Sync | moduleId has house prefix or -quiz suffix |
| SYNC-003 | Critical | Sync | houseId is not valid house name |
| SYNC-004 | High | Sync | houseId doesn't match file path |
| CFG-001 | High | Config | Missing moduleId (progress can't be tracked) |
| CFG-002 | Low | Config | Missing houseId (will auto-detect) |
| TRACK-001 | Medium | Tracking | trackProgress disabled |
| TRACK-002 | Warning | Tracking | Presentation has no progress tracking |
| TRACK-003 | Warning | Tracking | Lab has no progress tracking |
| TRACK-004 | Info | Tracking | Applet has no progress tracking |
| REG-001 | Warning | Registry | Content file not in registry |
| REG-002 | Warning | Registry | Registry entry has no matching file |

---

## Ignore Directives

Add to HTML files to suppress specific issues:

```html
<!-- eduscan-ignore: ID-001 reason="legacy content" -->
<!-- eduscan-ignore: REG-001 reason="experimental module" -->
<!-- eduscan-ignore-all reason="archived content" -->
```

---

## Roadmap

### Phase 1: Core Scanner (COMPLETE - Feb 6, 2026)
- [x] File tree walker
- [x] Quiz parser
- [x] Presentation parser
- [x] Lab parser
- [x] JSON reporter
- [x] Markdown reporter
- [x] Basic CLI

### Phase 2: Validation + Enhancements (COMPLETE - Feb 6, 2026)
- [x] Sync compatibility validator
- [x] Registry cross-reference
- [x] Issue detection rules
- [x] Expanded severity model (CRITICAL, HIGH, MEDIUM, LOW)
- [x] Auto-fix suggestions (suggested values in output)
- [x] Ignore directives (eduscan-ignore comments)
- [x] Drift tracking (--diff, --archive flags)
- [x] Colored terminal output
- [x] npm scripts integration

### Phase 3: Automation (Future)
- [ ] Watch mode (--watch)
- [ ] Auto-fix mode (--fix)
- [ ] Pre-commit hook integration
- [ ] CI/CD pipeline integration

### Phase 4: Distribution (Future)
- [ ] Package as executable (pkg)
- [ ] Cross-platform builds
- [ ] Version management

### Phase 4: Distribution
- [ ] Package as executable (pkg)
- [ ] Cross-platform builds
- [ ] Version management

### Phase 5: Future
- [ ] Auto-fix for simple issues
- [ ] CI/CD integration
- [ ] Web UI for reports
- [ ] Historical comparison (diff between scans)

---

## Potential Applications

1. **Hexworth Prime** — Original use case, audit our own content

2. **Other LMS Platforms** — Adapt parsers for different content patterns

3. **Open Source Tool** — Release as educational platform auditor

4. **Commercial Product** — SaaS for LMS content auditing

5. **Integration** — Plugin for VS Code, CI/CD pipelines

---

## Intellectual Property Notes

**Novel aspects worth protecting:**
- Content type detection via code parsing
- Sync compatibility validation logic
- Educational topology mapping concept
- Issue detection rule system for learning platforms

**Not novel (prior art):**
- File scanning
- CLI tools
- JSON/Markdown output
- Executable packaging

**Recommendation:** Document the methodology, consider provisional patent if commercializing.

---

## References

- `PROGRESS_SYNC_ARCHITECTURE.md` — Documents the sync chain EduScan validates
- `HANDLER_DASHBOARD_AUDIT.md` — The problem that inspired EduScan
- `WORKING_PROTOCOL.md` — Development guidelines

---

*This document defines EduScan's purpose, architecture, and novelty. Revisit here if direction is lost.*
