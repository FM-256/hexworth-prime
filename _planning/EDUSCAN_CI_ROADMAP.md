# EduScan CI/CD Evolution Roadmap

> Transform EduScan from a local tool into a fully automated content integrity pipeline.

**Created:** 2026-02-07
**Status:** Planning
**Branch:** `architecture/module-registry` → `main`

---

## Vision

EduScan evolves through nine phases:

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   PHASE 1   │ → │   PHASE 2   │ → │   PHASE 3   │ → │   PHASE 4   │ → │   PHASE 5   │
│   Reports   │    │   PR Bot    │    │   Staging   │    │ Production  │    │   Triage    │
│  (observe)  │    │  (propose)  │    │   (test)    │    │  (deploy)   │    │   (learn)   │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
    DONE ✓            NEXT             LATER             EVENTUALLY          INTELLIGENCE

┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   PHASE 6   │ → │   PHASE 7   │ → │   PHASE 8   │ → │   PHASE 9   │
│  Bucketing  │    │  Baseline   │    │   Stamps    │    │ Observability│
│ (classify)  │    │ (regress)   │    │  (audit)    │    │  (upload)   │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
   PLANNED           PLANNED           PLANNED           PLANNED
```

---

## Phase 1: Report Automation (Observe)

**Goal:** Visibility into content health without touching production.

### Deliverables

| Item | Description |
|------|-------------|
| GitHub Action | Runs EduScan on push/PR |
| Artifact Upload | TREASURE_MAP, PATCH_PLAN, status.json |
| PR Comment | Summary of issues found |
| Badge | Content health badge in README |

### Sprint: ES-CI-1

**Duration:** 1 session
**Priority:** HIGH

| Task | Description | Est. |
|------|-------------|------|
| ES-CI-1.1 | Create `.github/workflows/eduscan.yml` | 30m |
| ES-CI-1.2 | Configure artifact upload for reports | 15m |
| ES-CI-1.3 | Add PR comment with issue summary | 30m |
| ES-CI-1.4 | Create `status.json` output format | 15m |
| ES-CI-1.5 | Add health badge to main README | 10m |

### Success Criteria

- [ ] Every PR shows EduScan results in comments
- [ ] Reports downloadable from Actions artifacts
- [ ] Badge shows current issue count

### Files to Create

```
.github/
└── workflows/
    └── eduscan.yml
```

---

## Phase 2: Auto-Fix PR Bot (Propose)

**Goal:** Automated fix proposals with human review gate.

### Deliverables

| Item | Description |
|------|-------------|
| Fix Detection | Identify auto-fixable issues |
| Branch Creation | `eduscan/auto-fix-{date}` |
| Apply Fixes | Run fixers in CI environment |
| PR Creation | Open PR with fix summary |
| Diff Report | Before/after issue counts |

### Sprint: ES-CI-2

**Duration:** 2 sessions
**Priority:** HIGH
**Depends on:** ES-CI-1 complete

| Task | Description | Est. |
|------|-------------|------|
| ES-CI-2.1 | Create `auto-fix.yml` workflow | 45m |
| ES-CI-2.2 | Add `--auto-fix` mode to CLI | 30m |
| ES-CI-2.3 | Configure GitHub token for PR creation | 15m |
| ES-CI-2.4 | PR template with fix summary table | 30m |
| ES-CI-2.5 | Add "safe fix" classification to issues | 30m |
| ES-CI-2.6 | Before/after diff in PR description | 20m |

### Success Criteria

- [ ] Bot creates PR when fixable issues detected
- [ ] PR shows exactly what was fixed
- [ ] Merge applies fixes cleanly
- [ ] No manual intervention required (except review)

### Fix Safety Classification

| Fix Type | Safety | Auto-PR |
|----------|--------|---------|
| Rename to convention | Safe | ✅ |
| Update broken href | Safe | ✅ |
| Reorganize to correct dir | Safe | ✅ |
| Add missing moduleId | Review | ⚠️ |
| Fix HTML structure | Review | ⚠️ |
| Modify JS logic | Manual | ❌ |

### Files to Create

```
.github/
└── workflows/
    ├── eduscan.yml          # (from Phase 1)
    └── eduscan-auto-fix.yml # NEW
```

---

## Phase 3: Staging Deploy (Test)

**Goal:** Automatic preview deployment for content validation.

### Deliverables

| Item | Description |
|------|-------------|
| Staging Environment | Firebase preview channel or subdomain |
| Deploy Gate | Only if CRITICAL = 0 |
| Preview URL | Posted to PR for testing |
| Smoke Tests | Basic page load verification |

### Sprint: ES-CI-3

**Duration:** 2 sessions
**Priority:** MEDIUM
**Depends on:** ES-CI-2 complete, Firebase configured

| Task | Description | Est. |
|------|-------------|------|
| ES-CI-3.1 | Configure Firebase preview channels | 30m |
| ES-CI-3.2 | Create `deploy-staging.yml` workflow | 45m |
| ES-CI-3.3 | Add deploy gate (CRITICAL = 0 check) | 20m |
| ES-CI-3.4 | Post preview URL to PR | 15m |
| ES-CI-3.5 | Basic smoke test (page loads, no 404s) | 45m |
| ES-CI-3.6 | Auto-expire old preview channels | 15m |

### Success Criteria

- [ ] Every PR gets a preview URL
- [ ] Preview blocked if critical issues exist
- [ ] Preview auto-expires after merge/close
- [ ] Smoke tests catch broken pages

### Files to Create

```
.github/
└── workflows/
    ├── eduscan.yml
    ├── eduscan-auto-fix.yml
    └── deploy-staging.yml   # NEW
```

---

## Phase 4: Production Deploy (Ship)

**Goal:** Safe, automated production deployments.

### Deliverables

| Item | Description |
|------|-------------|
| Tag-based Deploy | Only on version tags (v1.x.x) |
| Hard Gates | CRITICAL = 0, HIGH < threshold |
| Rollback | Previous build artifact preserved |
| Notifications | Slack/Discord on deploy success/fail |

### Sprint: ES-CI-4

**Duration:** 2 sessions
**Priority:** LOW (do after Phase 3 proven)
**Depends on:** ES-CI-3 complete, staging tested

| Task | Description | Est. |
|------|-------------|------|
| ES-CI-4.1 | Create `deploy-production.yml` | 45m |
| ES-CI-4.2 | Tag trigger configuration | 15m |
| ES-CI-4.3 | Hard gate implementation | 30m |
| ES-CI-4.4 | Rollback mechanism (keep last 3 builds) | 45m |
| ES-CI-4.5 | Deploy notifications | 30m |
| ES-CI-4.6 | Documentation for release process | 20m |

### Success Criteria

- [ ] `git tag v1.x.x && git push --tags` triggers deploy
- [ ] Deploy blocked if gates fail
- [ ] Can rollback to previous version in < 5 min
- [ ] Team notified on deploy events

### Gate Configuration

```yaml
gates:
  critical: 0      # Must be zero
  high: 10         # Max allowed
  medium: 50       # Max allowed (warning if exceeded)
  low: unlimited   # Informational only
```

---

## Phase 5: Triage & Learning (Intelligence)

**Goal:** Human-in-the-loop feedback system to reduce false positives and improve detection accuracy over time.

### Concept

```
DETECTION FLOW:
                                    ┌─────────────────┐
                                    │  HIGH CONFIDENCE │
Issue Detected ──► Confidence ──►  │  Auto-categorize │
                   Check           │                  │
                                    ├─────────────────┤
                                    │  LOW CONFIDENCE  │
                                    │  → Triage Queue  │
                                    └────────┬────────┘
                                             │
                                    ┌────────▼────────┐
                                    │  Human Reviews   │
                                    │  Labels TP / FP  │
                                    └────────┬────────┘
                                             │
                                    ┌────────▼────────┐
                                    │  Pattern Learned │
                                    │  Future scans    │
                                    │  auto-suppress   │
                                    └─────────────────┘
```

### Deliverables

| Item | Description |
|------|-------------|
| Confidence Scores | Each issue gets a confidence % based on pattern matching |
| Triage Queue | Low-confidence issues flagged for human review |
| Label CLI | `eduscan label <id> --tp/--fp --reason "..."` |
| Labels Database | `eduscan-labels.json` stores human decisions |
| Pattern Learning | Auto-suppress patterns consistently marked FP |
| Feedback Loop | Labeled examples improve future confidence scores |

### Sprint: ES-CI-5

**Duration:** 3 sessions
**Priority:** MEDIUM
**Depends on:** ES-CI-2 complete (need working issue detection first)

| Task | Description | Est. |
|------|-------------|------|
| ES-CI-5.1 | Design confidence scoring algorithm | 45m |
| ES-CI-5.2 | Add confidence field to issue objects | 30m |
| ES-CI-5.3 | Create `eduscan-labels.json` schema | 20m |
| ES-CI-5.4 | Implement `eduscan label` CLI command | 45m |
| ES-CI-5.5 | Add `--triage` flag to show low-confidence issues | 30m |
| ES-CI-5.6 | Implement pattern matching for FP suppression | 60m |
| ES-CI-5.7 | Add `[SUPPRESSED]` status to scan output | 20m |
| ES-CI-5.8 | Feedback stats in status.json | 20m |

### Success Criteria

- [ ] Issues show confidence percentage
- [ ] Low-confidence issues (<70%) go to triage queue
- [ ] Human can label issues via CLI
- [ ] Labeled FP patterns are auto-suppressed in future scans
- [ ] Stats show TP/FP ratio over time

### Labels File Structure

```json
{
  "version": "1.0",
  "labels": [
    {
      "id": "HTML-001-a3f2c",
      "code": "HTML-001",
      "file": "dark-arts/vault/xss-attacks-lab.html",
      "line": 799,
      "verdict": "false_positive",
      "reason": "XSS example in educational content",
      "pattern": "script_tag_in_string_content",
      "labeledAt": "2026-02-07T19:30:00Z",
      "context": "<script>alert(1)</script>"
    }
  ],
  "suppressPatterns": [
    {
      "code": "HTML-001",
      "pattern": "script_tag_in_string_content",
      "matchRule": "script tag inside pre|code|string literal",
      "action": "suppress",
      "confidence": 0.95,
      "learnedFrom": ["HTML-001-a3f2c", "HTML-001-b7d1e"]
    }
  ],
  "stats": {
    "totalLabeled": 15,
    "truePositives": 12,
    "falsePositives": 3,
    "accuracy": 0.80
  }
}
```

### Confidence Scoring (Initial Algorithm)

| Factor | Weight | Description |
|--------|--------|-------------|
| Pattern match to known TP | +30% | Similar to confirmed issues |
| Pattern match to known FP | -40% | Similar to suppressed patterns |
| Code frequency | +10% | Common issue codes more confident |
| File type context | ±15% | XSS in security lab = likely FP |
| Base confidence | 50% | Starting point for new patterns |

### Files to Create

```
_tools/eduscan/
├── triage/
│   ├── confidence.js      # Scoring algorithm
│   ├── labels.js          # Label management
│   └── patterns.js        # Pattern matching
└── eduscan-labels.json    # Human decisions database
```

---

## Phase 6: Issue Bucketing (Classify)

**Goal:** Transform "182 HIGH" from a blob into an actionable plan by classifying issues into remediation categories.

### Concept

```
182 HIGH Issues
      │
      ├─────────────────────────────────────────────────────────┐
      │                                                         │
      ▼                                                         ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  BUCKET A   │    │  BUCKET B   │    │  BUCKET C   │    │  BUCKET D   │
│ Safe Auto   │    │   Review    │    │   Missing   │    │    False    │
│  Fixable    │    │   Needed    │    │   Content   │    │  Positives  │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
  1-command         Human confirms     Manual create      Suppress/label
  remediation       intent             or backlog
```

### Bucket Definitions

| Bucket | Description | Examples | Action |
|--------|-------------|----------|--------|
| **A: Safe Auto-fixable** | Deterministic fixes, no ambiguity | Path depth over/undershoot, anchor mistakes, deterministic renames | `eduscan fix --bucket=A` |
| **B: Review Needed** | Multiple candidates, human picks | Two "nearest match" files, ambiguous paths, duplicate IDs | Interactive prompt or PR |
| **C: Missing Content** | Referenced file doesn't exist anywhere | Broken hrefs to non-existent files, orphaned references | Backlog or create stub |
| **D: False Positives** | Not actually an issue | XSS in security labs, intentional structure | Label and suppress |

### Sprint: ES-CI-6

**Duration:** 2 sessions
**Priority:** HIGH
**Depends on:** ES-CI-5 complete (need triage system)

| Task | Description | Est. |
|------|-------------|------|
| ES-CI-6.1 | Define bucket classification rules | 30m |
| ES-CI-6.2 | Add `--classify` flag to scan output | 45m |
| ES-CI-6.3 | Generate `BUCKET_REPORT.md` with counts per bucket | 30m |
| ES-CI-6.4 | Implement `eduscan fix --bucket=A` for safe fixes | 60m |
| ES-CI-6.5 | Implement `eduscan review --bucket=B` interactive mode | 45m |
| ES-CI-6.6 | Generate content debt backlog from Bucket C | 30m |

### Success Criteria

- [ ] Every issue assigned to exactly one bucket
- [ ] Bucket A can be fixed with single command
- [ ] Bucket B prompts for human decision
- [ ] Bucket C generates prioritized content backlog
- [ ] Bucket D auto-suppressed after labeling

### Files to Create

```
_tools/eduscan/
├── buckets/
│   ├── classifier.js     # Assigns issues to buckets
│   ├── safe-fixer.js     # Bucket A automation
│   ├── reviewer.js       # Bucket B interactive
│   └── backlog.js        # Bucket C tracking
└── reports/
    └── BUCKET_REPORT.md  # Per-bucket breakdown
```

---

## Phase 7: Baseline & Regression (Policy)

**Goal:** Establish a "known debt" baseline and only fail CI on new issues.

### Concept

```
BASELINE CONTRACT:

  ┌──────────────┐
  │  Snapshot    │  Store current issues as
  │  baseline    │  "known debt" (accepted)
  └──────┬───────┘
         │
         ▼
  ┌──────────────┐     ┌──────────────┐
  │  Future Scan │ ──► │   Compare    │
  └──────────────┘     └──────┬───────┘
                              │
              ┌───────────────┴───────────────┐
              ▼                               ▼
       ┌────────────┐                  ┌────────────┐
       │  NEW issue │                  │ KNOWN debt │
       │  → FAIL CI │                  │ → PASS     │
       └────────────┘                  └────────────┘
```

### Baseline File Structure

```json
{
  "version": "1.0",
  "createdAt": "2026-02-07T20:00:00Z",
  "createdFrom": "v3.11.1",
  "gitCommit": "be8d5fb",
  "knownDebt": {
    "CRITICAL": 0,
    "HIGH": 182,
    "MEDIUM": 45,
    "LOW": 12
  },
  "acceptedIssues": [
    {
      "code": "PATH-001",
      "file": "houses/shield/applets/firewall-lab.html",
      "hash": "a3f2c8d1",
      "acceptedAt": "2026-02-07T20:00:00Z",
      "reason": "Tracked in content backlog #47"
    }
  ],
  "policy": {
    "failOnNewCritical": true,
    "failOnNewHigh": true,
    "failOnDebtIncrease": true,
    "warnOnNewMedium": true
  }
}
```

### Sprint: ES-CI-7

**Duration:** 2 sessions
**Priority:** HIGH
**Depends on:** ES-CI-6 complete (need bucketing)

| Task | Description | Est. |
|------|-------------|------|
| ES-CI-7.1 | Create `eduscan baseline create` command | 45m |
| ES-CI-7.2 | Create `eduscan baseline diff` command | 45m |
| ES-CI-7.3 | Implement policy engine (fail/warn rules) | 30m |
| ES-CI-7.4 | Add `--baseline` flag to CI scan | 20m |
| ES-CI-7.5 | Generate regression report | 30m |
| ES-CI-7.6 | Update GitHub Action for baseline mode | 20m |

### Success Criteria

- [ ] `eduscan baseline create` snapshots current state
- [ ] `eduscan baseline diff` shows only new issues
- [ ] CI fails only on new CRITICAL/HIGH
- [ ] Known debt passes silently
- [ ] Regression report shows debt trend over time

### Files to Create

```
_tools/eduscan/
├── baseline/
│   ├── snapshot.js       # Create baseline
│   ├── diff.js           # Compare to baseline
│   └── policy.js         # Fail/warn rules
└── eduscan-baseline.json # Accepted debt snapshot
```

---

## Phase 8: Release Stamps (Audit)

**Goal:** Make every report auditable and shareable with embedded release metadata.

### Report Header Format

```markdown
# EduScan Report

## Release Stamp

| Field | Value |
|-------|-------|
| **Version** | v3.11.1 |
| **Codename** | INTEGRITY |
| **Git Commit** | be8d5fb |
| **Scan Timestamp** | 2026-02-07T20:15:32Z |
| **Scope** | Naming + LearningPaths integrity |

## Issue Summary

| Severity | Count | Delta |
|----------|-------|-------|
| CRITICAL | 0 | — |
| HIGH | 182 | -15 ↓ |
| MEDIUM | 45 | +2 ↑ |
| LOW | 12 | — |

## Known Debt

The 182 HIGH issues are tracked and bounded:
- Bucket A (auto-fix): 89
- Bucket B (review): 42
- Bucket C (content): 51

## Next Release Target

- Reduce HIGH to <100
- Eliminate all PATH-002 issues
- Zero Bucket A (fully automated)
```

### Sprint: ES-CI-8

**Duration:** 1 session
**Priority:** MEDIUM
**Depends on:** ES-CI-7 complete

| Task | Description | Est. |
|------|-------------|------|
| ES-CI-8.1 | Read version.json for release metadata | 15m |
| ES-CI-8.2 | Get git commit hash programmatically | 10m |
| ES-CI-8.3 | Add release stamp header to all reports | 30m |
| ES-CI-8.4 | Add scope section (what this release guarantees) | 20m |
| ES-CI-8.5 | Add known debt summary section | 20m |
| ES-CI-8.6 | Add next release target section | 15m |

### Success Criteria

- [ ] Every report includes version + commit + timestamp
- [ ] Reports state what the release guarantees (scope)
- [ ] Known debt is quantified and categorized
- [ ] Next release has clear reduction targets
- [ ] Reports can be shared externally as release notes

---

## Phase 9: Observability (Upload)

**Goal:** Auto-upload reports on tags and nightly for historical tracking.

### Upload Strategy

| Trigger | What Uploads | Where |
|---------|--------------|-------|
| **Tag (v*.*.*)** | Full reports: TREASURE_MAP, PATCH_PLAN, BUCKET_REPORT, baseline diff | GitHub Release assets |
| **Nightly** | Trend summary only: counts, deltas, debt trajectory | GitHub Actions artifact |
| **PR** | Issue summary comment | PR comment |

### Trend Tracking

```
_tools/eduscan/reports/
├── history/
│   ├── 2026-02-07.json    # Daily snapshots
│   ├── 2026-02-08.json
│   └── ...
└── trends.json            # Aggregated metrics
```

### Trend Summary Format

```json
{
  "generatedAt": "2026-02-08T00:00:00Z",
  "trend": [
    { "date": "2026-02-01", "critical": 2, "high": 210, "medium": 52 },
    { "date": "2026-02-07", "critical": 0, "high": 182, "medium": 45 },
    { "date": "2026-02-08", "critical": 0, "high": 175, "medium": 44 }
  ],
  "velocity": {
    "highPerDay": -5.0,
    "projectedZeroHigh": "2026-03-15",
    "debtBurndown": "on-track"
  }
}
```

### Sprint: ES-CI-9

**Duration:** 2 sessions
**Priority:** MEDIUM
**Depends on:** ES-CI-8 complete

| Task | Description | Est. |
|------|-------------|------|
| ES-CI-9.1 | Create tag-triggered workflow for full upload | 30m |
| ES-CI-9.2 | Upload reports as GitHub Release assets | 30m |
| ES-CI-9.3 | Create nightly cron workflow | 20m |
| ES-CI-9.4 | Implement trend tracking (daily snapshots) | 45m |
| ES-CI-9.5 | Generate trend summary with velocity metrics | 30m |
| ES-CI-9.6 | Add burndown projection | 20m |
| ES-CI-9.7 | Create dashboard view (optional: GitHub Pages) | 60m |

### Success Criteria

- [ ] Every tag uploads full report set to release
- [ ] Nightly cron captures trend data
- [ ] Velocity shows issues-per-day reduction rate
- [ ] Burndown projection estimates zero-HIGH date
- [ ] History preserved for retrospectives

### Files to Create

```
.github/workflows/
├── eduscan.yml           # (existing)
├── eduscan-release.yml   # Tag-triggered upload
└── eduscan-nightly.yml   # Cron trend capture

_tools/eduscan/
├── trends/
│   ├── snapshot.js       # Daily capture
│   ├── velocity.js       # Rate calculation
│   └── projector.js      # Burndown forecast
└── reports/history/      # Historical data
```

---

## Sprint Schedule

| Sprint | Phase | Duration | Target | Status |
|--------|-------|----------|--------|--------|
| ES-CI-1 | Reports | 1 session | Week 1 | ✅ DONE |
| ES-CI-2 | PR Bot | 2 sessions | Week 2 | NEXT |
| ES-CI-3 | Staging | 2 sessions | Week 3-4 | |
| ES-CI-4 | Production | 2 sessions | Week 5-6 | |
| ES-CI-5 | Triage/Learning | 3 sessions | Week 7+ | |
| ES-CI-6 | Bucketing | 2 sessions | Week 8-9 | |
| ES-CI-7 | Baseline | 2 sessions | Week 10-11 | |
| ES-CI-8 | Stamps | 1 session | Week 12 | |
| ES-CI-9 | Observability | 2 sessions | Week 13-14 | |

### Dependencies

```
ES-CI-1 (Reports) ✅ DONE
    │
    ▼
ES-CI-2 (PR Bot)
    │
    ├── Requires: GitHub token with PR permissions
    │
    ▼
ES-CI-3 (Staging)
    │
    ├── Requires: Firebase project configured
    ├── Requires: Preview channels enabled
    │
    ▼
ES-CI-4 (Production)
    │
    ├── Requires: Staging proven stable
    ├── Requires: Rollback mechanism tested
    └── Requires: Notification channels set up
    │
    ▼
ES-CI-5 (Triage/Learning)
    │
    ├── Requires: Enough scan data for patterns
    ├── Requires: Human labeling workflow
    └── Can run in parallel with ES-CI-3/4
    │
    ▼
ES-CI-6 (Bucketing)
    │
    ├── Requires: Triage/labeling system (ES-CI-5)
    └── Turns 182 HIGH into actionable categories
    │
    ▼
ES-CI-7 (Baseline)
    │
    ├── Requires: Bucketing complete (ES-CI-6)
    └── Establishes "known debt" contract
    │
    ▼
ES-CI-8 (Stamps)
    │
    └── Requires: Baseline system (ES-CI-7)
    │
    ▼
ES-CI-9 (Observability)
    │
    ├── Requires: Stamps (ES-CI-8)
    └── Enables auto-upload and trend tracking
```

---

## Current State (Post-Phase 1)

### What Exists

| Component | Status |
|-----------|--------|
| EduScan CLI | ✅ Complete |
| Validators (syntax, paths, naming, LP) | ✅ Complete |
| Fixers (rename, reorg, LP) | ✅ Complete |
| Rollback capability | ✅ Complete |
| Module Registry | ✅ Complete |
| Reports (TREASURE_MAP, PATCH_PLAN) | ✅ Complete |
| GitHub Action workflow | ✅ Complete (ES-CI-1) |
| Artifact upload config | ✅ Complete (ES-CI-1) |
| PR comment integration | ✅ Complete (ES-CI-1) |
| status.json format | ✅ Complete (ES-CI-1) |
| Git hooks (AI attribution block) | ✅ Complete |

### Current Issue Snapshot (v3.11.1)

| Severity | Count | Status |
|----------|-------|--------|
| CRITICAL | 0 | ✅ Zero |
| HIGH | 182 | 📋 Tracked (to be bucketed) |
| MEDIUM | ~45 | ⚠️ Accepted |
| LOW | ~12 | ℹ️ Informational |

### What's Next (Phase 2)

| Component | Status |
|-----------|--------|
| Auto-fix workflow | ❌ Not created |
| `--auto-fix` CLI mode | ❌ Not created |
| Safe fix classification | ❌ Not created |
| PR bot integration | ❌ Not created |

---

## Architecture Overview

```
┌────────────────────────────────────────────────────────────────┐
│                        GitHub Actions                          │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  ┌──────────────┐   ┌──────────────┐   ┌──────────────┐       │
│  │  On: Push    │   │  On: Schedule│   │  On: Tag     │       │
│  │  On: PR      │   │  (weekly)    │   │  (v*.*.*)    │       │
│  └──────┬───────┘   └──────┬───────┘   └──────┬───────┘       │
│         │                  │                  │                │
│         ▼                  ▼                  ▼                │
│  ┌──────────────────────────────────────────────────────┐     │
│  │                    EduScan CLI                        │     │
│  │  node _tools/eduscan/cli.js --syntax=ci --json       │     │
│  └──────────────────────────┬───────────────────────────┘     │
│                             │                                  │
│         ┌───────────────────┼───────────────────┐             │
│         ▼                   ▼                   ▼             │
│  ┌────────────┐      ┌────────────┐      ┌────────────┐       │
│  │  Reports   │      │  Auto-Fix  │      │   Deploy   │       │
│  │  Artifact  │      │  PR Bot    │      │   Gate     │       │
│  └────────────┘      └────────────┘      └────────────┘       │
│                                                                │
└────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │  Firebase Host   │
                    │  (staging/prod)  │
                    └──────────────────┘
```

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Auto-fix breaks content | Safe-fix classification, PR review gate |
| Bad deploy to production | Tag-only deploys, gate checks, rollback |
| Token exposure | GitHub Secrets, minimal permissions |
| CI costs | Cache node_modules, skip unchanged |
| Flaky tests | Retry logic, clear failure messages |

---

## Notes

- All workflows should use `ubuntu-latest` runner
- Cache `node_modules` between runs
- Use `actions/upload-artifact` for reports
- Use `peter-evans/create-pull-request` for auto-fix PRs
- Firebase deploy via `FirebaseExtended/action-hosting-deploy`

---

## Next Action

**ES-CI-2: Auto-Fix PR Bot** — Create automated fix proposals with human review gate.

Priority order:
1. ES-CI-2.5: Add "safe fix" classification to issues (needed for bucketing)
2. ES-CI-2.1: Create `auto-fix.yml` workflow
3. ES-CI-2.2: Add `--auto-fix` mode to CLI

---

## Release Note Template

Use this format for release notes to ensure professional, auditable documentation:

```markdown
# Hexworth Prime v3.11.1 — INTEGRITY

**Released:** 2026-02-07
**Git Commit:** be8d5fb

## Scope

This release guarantees:
- ✅ Naming convention: All files follow `{house}-{name}.{type}.html`
- ✅ LearningPaths integrity: All module hrefs resolve to existing files
- ✅ Analytics sync: Student progress syncs to Firestore for instructor dashboard

## Issue Summary

| Severity | Count | Change |
|----------|-------|--------|
| CRITICAL | 0 | — |
| HIGH | 182 | Tracked |
| MEDIUM | 45 | Accepted |
| LOW | 12 | Info only |

## Known Debt

The 182 HIGH issues are tracked and bounded:
- Will be bucketed in ES-CI-6 (auto-fix vs review vs content debt)
- CI will not fail on these until baseline is established (ES-CI-7)

## Next Release Target (v3.12.0)

- Reduce HIGH to <100
- Bucket A (safe auto-fix) reduced to zero
- All PATH-002 issues eliminated
```
