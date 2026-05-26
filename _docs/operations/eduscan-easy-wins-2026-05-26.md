# EduScan/Nexus easy-wins triage — 2026-05-26

Snapshot of Nexus findings + the easy wins surfaced during this triage pass. Total open findings at scan time: **12,956**. Most are low-severity name/style nits, but a handful of medium-severity clusters represent real defects worth chipping at.

Reference data: `_tools/nexus/findings.json` (last sync `2026-05-26T08:46:20Z`).

## Top finding clusters

| Count | Severity | Code | What it means |
|------:|----------|------|---------------|
| 2860 | low | LP-007 | Learning-path inconsistency (cosmetic) |
| 2250 | low | REG-001 | Content-registry hygiene |
| 1912 | low | NAME-003 | Naming convention drift |
| 1196 | low | FLOW-001 | Flow-validator nit |
|  794 | low | SEM-001 | Semantic-tag warning |
|  614 | low | BLOB-001 | Blob asset hygiene |
|  551 | low | BLOB-004 | Blob asset hygiene |
|  491 | medium | CAT-007 | ContentCatalog drift |
|  380 | medium | QUIZ-008 | Quiz answer-key distribution skew |
|  346 | low | BLOB-002 | Blob asset hygiene |
|  333 | info | HEUR-018 | Scroll-completion suspect (mostly FP) |
|  204 | info | TRACK-004 | Tracker hygiene |
|  132 | info | LP-003 | Learning-path nit |
|   67 | medium | PROG-003 | ModuleProgress key drift |
|   58 | low | PATH-004 | Path nit |
|   47 | medium | HTML-012 | Unclosed `<div>` (real defect — see below) |
|   46 | medium | HEUR-RESULT-BUTTON-STANDARD | Quiz result-card uses pre-standard buttons |
|   42 | low | CAT-004 | ContentCatalog drift |
|   39 | medium | SEM-002 | Semantic-tag warning |
|   37 | medium | NAME-002 | Naming convention |

## Easy-win clusters surfaced

### 1. HTML-012 cluster — file-concatenation defect (47 findings, 13 files)

Audit reveals the divs aren't merely unclosed — **the project-page files contain TWO concatenated HTML documents**, each with its own `<head>`/`<body>` pair. Example: `_app/projects/starter-calculator.html` has the structure:

```
Line 1-630: full first document head + style
Line 631-653: first body opens, content begins, never closes 3 divs
Line 654: a second </head> appears mid-stream
Line 655-841: second body with full content (the actually-rendered content)
```

The "Unclosed div" findings are at lines 643, 646, 649 — the openers in the orphan first body. The truly-rendered content is the second body. **Fix shape:** trim lines 631-654 from each affected project file, leaving only the second-document body.

Affected files (3-8 unclosed divs each):
- `_app/projects/cloud-s3-static-site.html` (8)
- `_app/projects/darkarts-kali-setup.html` (8)
- `_app/projects/cloud-ec2-first-server.html` (3)
- `_app/projects/cloud-oracle-free-vm.html` (3)
- `_app/projects/forge-home-lab.html` (3)
- `_app/projects/forge-virtualbox-first-vm.html` (3)
- `_app/projects/forge-vmware-first-vm.html` (3)
- `_app/projects/shield-firewall-iptables.html` (3)
- `_app/projects/starter-calculator.html` (3)
- `_app/projects/starter-first-repo.html` (3)
- `_app/projects/starter-github-profile.html` (3)
- `_app/projects/starter-portfolio-site.html` (3)
- `_app/houses/code/devops/sections/cicd/do-105-security-hardening.presentation.html` (1)

**Risk:** the orphan first-body section may contain content the operator wanted. Manual triage per file before bulk-trimming. Suggested order: starter-* first (simpler), then forge-*, then cloud-*, then darkarts.

### 2. HEUR-RESULT-BUTTON-STANDARD cluster — quiz UX drift (46 findings, 46 files)

Each affected quiz/exam uses the pre-standard `[Back to Hub]` button instead of the current standard pair `[Review Answers]` + `[Return to Hub]`. Pattern is well-defined; fix is mechanical per-file. Course coverage:

- `cb-*` (cloud essentials): 10 files
- `pfi-*` (Python for IT): 4 files
- `sp-*` (Python programming): 3 files
- Plus other quizzes across houses

**Fix shape:** locate `.results-card`, replace the link with the two-button row that calls `showReviewAnswers()` + the existing hub return. Existing canonical example to model from: any quiz under `_app/houses/shield/infosec/quizzes/` should already have the post-standard pattern.

### 3. PROG-003 cluster — ModuleProgress key drift (67 findings, medium severity)

This is a known class — student progress orphans when an applet's storage key is renamed without a migration shim. The `migrateLegacyKey` helper exists for this (`reference_module_progress_migrate_legacy_key.md`). Each finding is one applet that needs a one-line shim added.

### 4. SP 800-37 quiz answer-key triage — task #213

8 SP 800-37 references remain in quiz-option arrays + JS config (`RiskManagementData.js`, `content-registry.js`, `cloud-cse-07.quiz.html`, `cloud-cse-module07.quiz.html`, `cloud-cse-module08.quiz.html`, `shield-cse-07.quiz.html`, `shield-cmmc-framework.applet.html`, `shield-zero-trust.tool.html`). Adding "Rev. 2" qualifier risks breaking quiz grading where the answer-key string-matches the option text. Each needs answer-key cross-check before option update.

## Recommended order

1. **Document this finding** ✓ (this file)
2. Fix one starter-* project file end-to-end (proof of concept). If clean, apply same edit shape to remaining 12 files.
3. HEUR-RESULT-BUTTON-STANDARD — find canonical quiz template, then refactor in waves (10 files / commit).
4. PROG-003 — one-line `migrateLegacyKey` shim per affected applet.
5. SP 800-37 quiz options — per-file answer-key check before changing option text.

## Cross-reference

- `_tools/eduscan/README.md` — EduScan validator framework
- `_docs/operations/html-div-mismatch-finding-2026-05-09.md` — original HTML-012 backlog audit
- `_docs/operations/eduscan-safety-net-2026-05-03.md` — HEUR-029 + XREF-001 + smoke gate
- `~/hexworth-shared/Solutions/_audit/karl-pis-w*-citations-*.md` — Karl citation audits
