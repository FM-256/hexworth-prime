# Auto-Update Plumbing Architecture

**Last Updated:** 2026-05-07
**Status:** Phase 1 deployed; Phase 2 deferred pending bc1 prereqs

---

## Overview

Hexworth Prime has multiple admin/diagnostic surfaces that must reflect current platform state without manual rebuilds. This document maps each surface to its data source, refresh mechanism, and freshness signal.

---

## Surface inventory (live)

| Surface | Data source | Refresh mechanism | Freshness signal |
|---------|-------------|-------------------|------------------|
| `analytics-v2-status.html` | `analytics_v2/projectorHeartbeat` (Firestore) | Projector trigger writes on every event ingestion | `lastBeatAt` field; 5-min cadence under load |
| `analyticsHealthCheck` CF | `_triage_queue` (Firestore) | Scheduled every 5 min — writes findings only on degradation | Self-resolves stale findings |
| `quizQualityMonitor` CF | `_triage_queue` + reads `quiz_keys` | Scheduled every Monday 04:00 ET | Cluster fingerprints + reconciliation |
| Combined dashboard (`nexus status`) | `_quality_reports/latest` | `nexus scan` (CLI; manual today) | `scannedAt` field |
| Triage queue (admin) | `_triage_queue` | Multi-source writes | Per-doc timestamps |
| Auto-fix queue (admin) | `_auto_fix_queue` | Auto-fix orchestrator | Claim heartbeats |
| **Spellbook panel** *(NEW 2026-05-07)* | `_quality_reports/spellbook` | `nexus scan` publishSpellbook() | `scannedAt` field; "Live data via Firestore" label |
| **Scan staleness** *(NEW 2026-05-07)* | `_quality_reports/scanHeartbeat` | `nexus scan` publishHeartbeat() | `scannedAt` field; future banner if >36h old |
| Smoke gate | (No data layer — runs Puppeteer against 15 hardcoded targets) | `./deploy.sh` blocking gate | Per-deploy |

---

## Phase 1 changes (shipped 2026-05-07, commit `b5da769b`)

### `_quality_reports/spellbook` — Spellbook live overlay

**Problem:** Admin console Spellbook panel rendered a hardcoded 17-entry static array. Filesystem `_spellbook/spells/` has 83 spells. New spells and status changes never surfaced.

**Solution:** Two-phase render in `loadSpellbook()`:
1. Synchronous render with `_sbStaticSpells` (panel never blank)
2. Async upgrade reading `_quality_reports/spellbook` Firestore doc — overlays live status/title onto curated entries; synthesizes placeholder cards for spells missing from static array (marked `_uncurated`)

**Write path:** `_tools/nexus/publish.js publishSpellbook(spells)`:
- Empty-array guard: refuses write if `spells.length === 0` (would erase good data)
- 0.8x previousCount guard: refuses write if count contracts >20% vs prior doc (catches partial-clone failure)
- First-run path: writes unconditionally if doc doesn't exist

**Data shape:**
```
{
  scannedAt: Timestamp,
  scannedBy: string,                  // hostname or NEXUS_HOST_LABEL env override
  spells: [{
    id: string,                        // SPELL-NNN[A]  (matches static array key)
    title: string,
    status: string,                    // PERMANENT|SCRIBED|SEALED|...
    severity: string|null,             // 77% coverage from `**Severity:**` field
    house: string|null,                // 66% coverage
    scribed: string|null,              // 63% coverage
    type: string|null,
    source: string|null,
    filename: string,
  }],
  version: 1
}
```

### `_quality_reports/scanHeartbeat` — Scan freshness signal

**Problem:** `_quality_reports/latest` only refreshes when an operator runs `nexus scan` manually. If a scheduled scan silently fails, the doc stays at the last successful write with no age indicator. False confidence.

**Solution:** Every `nexus scan` writes a heartbeat doc with `scannedAt`, `host`, `gatePass`, `durationMs`, `totalFindings`. The combined dashboard can surface a staleness banner if `scannedAt > 36h ago`.

**Write path:** `_tools/nexus/publish.js publishHeartbeat(stats)`. Always writes; no guards (a fresh scan timestamp is always good news).

---

## Phase 2 — Scheduled scan refresh (LIVE 2026-05-07)

Daily scheduled scan from bc1 keeps `_quality_reports/{latest,spellbook,scanHeartbeat}` and `_triage_queue` fresh without operator involvement.

**Deployed:** 2026-05-07. Cron entry added to bc1's crontab. Manual dry runs verified all four Firestore writes succeed.

### Cron entry (bc1)

```cron
0 7 * * * cd /home/eq1/hexworth/hexworth-prime && \
  git checkout HEAD -- _tools/nexus/findings.json _tools/reports/TREASURE_MAP.json _tools/reports/TREASURE_MAP.md 2>/dev/null; \
  git pull --quiet && \
  GOOGLE_APPLICATION_CREDENTIALS=/home/eq1/.config/hexworth/sa-nexus-scanner.json \
  NEXUS_HOST_LABEL=bc1 \
  node _tools/nexus/nexus.js scan >> /home/eq1/hexworth/logs/nexus.log 2>&1
```

- Schedule: 07:00 UTC daily (02:00 ET, off-peak between existing scraper jobs at 01:00, 04:00, 06:00 UTC)
- The `git checkout HEAD --` step discards regenerable tool-output files BEFORE pull (these are auto-rewritten by the very next scan, no information loss). Avoids `git pull` blocking on local diffs from previous scan runs.
- `GOOGLE_APPLICATION_CREDENTIALS` points at the service-account JSON
- `NEXUS_HOST_LABEL=bc1` makes `scannedBy: "bc1"` in Firestore writes
- Log goes to `/home/eq1/hexworth/logs/nexus.log` (existing log dir, alongside scrapers)

### Service account

- Account: `bc1-nexus-scanner@hexworth-prime.iam.gserviceaccount.com`
- Role: `roles/datastore.user` (Firestore reads/writes for `_quality_reports/*`, `_triage_queue`, `_auto_fix_queue`)
- Key file: `/home/eq1/.config/hexworth/sa-nexus-scanner.json` (mode 600, dir mode 700)
- No expiration on the key (suitable for unattended cron use)

### Phase 2 prerequisites (all verified 2026-05-07)

### Phase 2 prerequisite 1 — `firebase-admin` credentials on bc1

The `nexus scan` publish path uses `firebase-admin` SDK with Application Default Credentials (`process.env.GOOGLE_CLOUD_PROJECT = 'hexworth-prime'`). Existing bc1 scrapers use a Gemini API key from `/etc/environment` — that's a **different** auth mechanism (API key, not ADC).

**Verification step (required before Phase 2):**
```bash
ssh bc1 'gcloud auth application-default print-access-token --quiet >/dev/null 2>&1 && echo "ADC OK" || echo "ADC MISSING"'
```

If ADC is absent, install via:
- `gcloud auth application-default login` (interactive; one-time per machine), OR
- Service account JSON file with `firestore.databases.documents.create` permission for `hexworth-prime`, set as `GOOGLE_APPLICATION_CREDENTIALS=/path/to/sa.json`

### Phase 2 prerequisite 2 — `_spellbook/` populated on bc1

The empty-array guard in `publishSpellbook()` protects against this, but to actually USE the bc1 scan for spellbook updates, `_spellbook/spells/` on bc1 must contain the SPELL-*.md files. Since `_spellbook/` is gitignored, it must be sync'd separately.

**Verification step:**
```bash
ssh bc1 'ls /path/to/repo/_spellbook/spells/SPELL-*.md 2>/dev/null | wc -l'
# Expect 83+; if 0, sync via rsync from operator laptop or skip spellbook publish on bc1
```

### Phase 2 monitoring

The `scanHeartbeat` doc IS the staleness detector. A future small enhancement to the Combined dashboard / nexus status output: if `scanHeartbeat.scannedAt` is older than 36h, render a yellow staleness warning. Without this UI surface, the heartbeat data flows silently. Tracked as a follow-on enhancement.

### What if bc1 cron fails silently?

Failure modes and their detection paths:
- **bc1 offline / Tailscale down**: `scanHeartbeat.scannedAt` stops advancing. Detect via the future >36h banner.
- **`git pull` conflict**: caught by the cron's `git checkout HEAD --` reset step before pull. Tool-output files are regenerable; nothing meaningful lost.
- **Service account key revoked / expired**: nexus scan exits 1 at publish step. Heartbeat stops advancing.
- **Bad commit on master breaks adapter**: scan errors during sync; partial publish possible. The `0.8x previousCount` guard in `publishSpellbook` rejects writes with significant count contraction, preserving the prior good state.
- **Disk full on bc1**: log rotation handled separately (existing log infra); scan itself fails to write the snapshot file.

In all cases, the staleness signal (`scanHeartbeat`) is the primary detection. The empty + contraction guards ensure no destructive writes during partial failures.

---

## Confluence sync (operator-driven, not automated)

`quiz-sync` (`_tools/quiz-sync/sync-helper.js`) detects drift between HTML / Firestore / Confluence quiz answer keys (C7, C9 cluster checks). 14 cluster findings currently in `_triage_queue` from sync-helper runs.

**Not auto-resolved by design:** Confluence page updates require human judgment for content fixes (placeholder keys, hand-copy drift). The detection is automated; the resolution is operator-gated.

The `quiz-pages.json` registry mapping `quizId → Confluence pageId` is updated when new quizzes are added. As of 2026-05-07: 136 mappings.

---

## Discoverability

This doc is referenced from:
- [`_tools/INTRO.md`](../../_tools/INTRO.md) Conventions section
- [`_docs/architecture/private-directories.md`](./private-directories.md) (companion architecture doc)
- The first place to look when a panel shows stale data

---

## Decision log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-05-07 | sessionStorage `sb_last_run` tier RETIRED | Always empty in production; could shadow fresher Firestore data on repeat page loads (Nancy review concern) |
| 2026-05-07 | Spellbook overlay merges static + Firestore (not pure overlay) | Most enriched fields (severity, house, tags, description) live ONLY in curated `_sbStaticSpells`; the .md files have only ~60-80% of derivable fields |
| 2026-05-07 | scanHeartbeat is MVP, not optional polish | Without it, silent scheduled-scan failures provide false confidence (Nancy review pause) |
| 2026-05-07 | bc1 cron deferred until ADC + `_spellbook/` verified | Two unverified prerequisites would cause silent failures |
| 2026-05-07 | bc1 cron LIVE — service account `bc1-nexus-scanner` created with `roles/datastore.user`, key at `~/.config/hexworth/sa-nexus-scanner.json`, `_spellbook/` rsync'd, cron entry installed at 07:00 UTC daily | All prereqs verified; manual dry run confirmed Firestore writes succeed |
| 2026-05-07 | Cron uses `git checkout HEAD --` (not `--autostash`) for regenerable tool-output files | autostash hit chicken-and-egg conflict (scan rewrites stashed files, autostash-pop fails). Tool outputs are not user work; `checkout HEAD --` is acceptable per "We Do Not Destroy" rule (rule applies to user work, not regenerable artifacts). |
| 2026-05-07 | `publishToFirestore` now honors `NEXUS_HOST_LABEL` for consistency with Spellbook + Heartbeat | Without it, `_quality_reports/latest` showed `scannedBy: 'CLI'` even from bc1 cron. |
