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

## Phase 2 — Scheduled scan refresh (DEFERRED)

The intent was to add a daily scheduled scan so `_quality_reports/latest` refreshes without operator involvement. Three options were considered:

1. **bc1 cron** — uses existing scheduled scraper infrastructure on bc1
2. **Cloud Run job** — mirrors the runtime monitor pattern
3. **GitHub Actions** — standard CI cron

**Selected:** bc1 cron (lowest infrastructure delta — bc1 already runs 14 scrapers via cron).

**Deferred** because two prerequisites need verification before deployment:

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

### Phase 2 cron entry (when prereqs verified)

```cron
0 7 * * * cd /path/to/hexworth-prime && git pull --quiet && NEXUS_HOST_LABEL=bc1 node _tools/nexus/nexus.js scan >> /var/log/hexworth-nexus.log 2>&1
```

- 07:00 UTC = 02:00 ET (off-peak)
- `git pull` ensures the repo is current before scan
- `NEXUS_HOST_LABEL=bc1` makes `scannedBy: "bc1"` in Firestore (more useful than `os.hostname()`)
- The empty/0.8x guards in `publishSpellbook()` make this safe-to-fail — if bc1 has a partial `_spellbook/`, the spellbook write is skipped (with a logged reason) but `_quality_reports/latest` still updates

### Phase 2 monitoring (after deploy)

The `scanHeartbeat` doc IS the staleness detector. A future small enhancement to the Combined dashboard / nexus status output: if `scanHeartbeat.scannedAt` is older than 36h, render a yellow staleness warning. Without this UI surface, the heartbeat data flows silently.

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
