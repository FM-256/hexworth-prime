# Symbiosis Sprint — Prerequisite Findings

> Two in-review SYM proposals (SYM-8, SYM-15) depend on platform features that
> need to land BEFORE the proposed bulk work can execute correctly. This doc
> captures the verification results and the small enabling changes required.

## STATUS — 2026-05-04 19:18 UTC

| Prerequisite | State |
|---|---|
| SYM-15: `ModuleProgress.copyLegacyKey` shim | **DONE + DEPLOYED** (commit `841e70a3`). Used by 76 file edits across Sections A+B. Functional test confirmed cross-credit pattern works without inflating `completedModules` analytics. |
| SYM-8: hub renderer `status:"planned"` branch | **NOT NEEDED** — verification revealed HUB-001 broken refs are NOT student-visible defects (cards render fine, links point at real files; missing-catalog only impacts completion stamps + search index). SYM-8 priority dropped from "HIGH active student harm" to "LOW infrastructure cleanup." Renderer change deferred until catalog backfill is independently scheduled. |

The detailed analysis below remains accurate as the verification record.

---

## Verification 1 — `ModuleProgress.migrateLegacyKey` (SYM-15 prerequisite)

**Status: EXISTS at `_app/components/ModuleProgress.js:1239`. ✓**

**Behavior verified by code read:**
- Signature: `migrateLegacyKey(houseId, oldKey, newKey) → boolean`
- Migrates flat-format `progress[houseId][newKey] = progress[houseId][oldKey]`
- Migrates structured `progress.completedModules` array (replace or splice if new already present)
- Migrates `hexworth_completion_stamps` registry (`houseId/oldKey` → `houseId/newKey`)
- Idempotent: returns false if no legacy data; non-clobbering if newKey already populated

**CRITICAL finding for the SYM-15 cross-credit plan:**

The shim is **1-to-1 (move, not copy)**. Line 1255: `delete houseBlock[oldKey]`.

Consequence: cannot call `migrateLegacyKey` N times for an N-way split. The first call works (moves source → target). Subsequent calls see source no longer exists and return false. The 2nd+ targets receive nothing.

```js
// What the SYM-15 plan said would work — DOES NOT WORK with current shim:
ModuleProgress.migrateLegacyKey('forge', 'forge-admin-tools', 'forge-admin-tools-aplus-c2-lab');
//   ✓ moves data from 'forge-admin-tools' → '...-c2-lab'
ModuleProgress.migrateLegacyKey('forge', 'forge-admin-tools', 'forge-admin-tools-aplus-c2-pres');
//   ✗ source 'forge-admin-tools' is now empty, returns false, no migration
```

**Required change before SYM-15 mass-rename can execute:**

Add a sibling function `copyLegacyKey(houseId, oldKey, newKey)` that does the same migration but does NOT delete the source. Same idempotent contract. Same skip-if-target-already-set safety.

Cross-credit pattern then becomes:
```js
// One migrateLegacyKey to one chosen primary inheritor (or to the canonical file)
// Plus N-1 copyLegacyKey calls to credit the rest
ModuleProgress.copyLegacyKey('forge', 'forge-admin-tools', 'forge-admin-tools-aplus-c2-lab');
ModuleProgress.copyLegacyKey('forge', 'forge-admin-tools', 'forge-admin-tools-aplus-c2-pres');
// (optional final migrate to canonical, or omit if canonical already keeps the original key)
```

For collisions where the canonical-keeper file retains the original key (the common case in the SYM-15 plan), only `copyLegacyKey` calls are needed — the source key naturally stays on the canonical file's progress.

This is a small, isolated change to `_app/components/ModuleProgress.js`. ~25 lines added (the copy variant + tests). Independently shippable.

## Verification 2 — Hub renderer `status: "planned"` support (SYM-8 prerequisite)

**Status: NOT IMPLEMENTED. ✗**

Grep across `_app/components/` and `_app/components/**/*.js` for `status === 'planned'` or `status: 'planned'` returned zero matches. No renderer currently differentiates `status: "planned"` cards from regular cards.

**Consequence for SYM-8 stale-ref handling:**

The proposed fix says "add catalog entry with `status: 'planned'`, renderer shows 'coming soon' tile." Without renderer support, a `status: "planned"` entry would render identically to a regular card — students would click and get nothing (the same broken-card problem we're trying to fix).

**Required change before SYM-8 stale-ref fixes can execute:**

The hub renderer (likely in `_app/components/HubRenderer.js` or wherever cards are built) needs to:
1. Read `module.status` from the ContentCatalog entry
2. If `status === 'planned'`:
   - Render the card with a distinct visual treatment (greyed out, lock icon, "coming soon" badge)
   - Disable the click handler (or route to a "request notification" flow)
   - Add `data-status="planned"` to the rendered DOM for QA/regression visibility
3. If `status === 'available'` (the implicit default): unchanged behavior

This is also small and isolated. The new branch is additive — existing entries without `status` field render exactly as today (default to 'available'). Independently shippable; can land before any hub fix.

**One-time discoverability check:** confirm the hub renderer file location.

```bash
grep -rln "data-module" _app/components/ 2>/dev/null | head
grep -rln "moduleCard\|module-card\|renderHubCard" _app/components/ 2>/dev/null | head
```

If multiple renderers handle hub cards (per-house custom + a shared one), the change touches each.

## Verification 3 — `forge/intro-computers/` directory (session-start anomaly)

**Status: COMMITTED, no action needed. ✓**

At session start, git status showed `_app/houses/forge/intro-computers/` as untracked. Verification: `git log -- _app/houses/forge/intro-computers/` shows 4 recent commits (`7b2000ef`, `f34ebf93`, `377260cb`, `63179a5b`). The session-start status was stale; the directory IS version controlled. No action.

---

## Suggested execution order (revised)

Given the prerequisite findings, the in-review SYM items now have a dependency graph:

```
[Independent, ready when approved]
  SYM-1 — branch archival       (proposal at sym-1-branch-archival.md)
  SYM-2 — version date refresh  (manifest already at v7.1.0)
  SYM-6 — smoke gate expansion  (proposal at sym-6-smoke-target-proposal.md)
  SYM-13 — GCP cost monitoring  (runbook needed)

[Need a small enabling change first]
  SYM-15 — needs ModuleProgress.copyLegacyKey added first (~25-line change)
  SYM-8  — needs hub renderer status:"planned" branch added first (~30-line change)

[Blocked on user design decisions]
  SYM-3  — tiered alerts (5 user decisions pending)
  SYM-10 — taxonomy strategy (5 user decisions pending)

[Blocked on SYM-3]
  SYM-4 — Pulse Firestore integration
  SYM-14 — auth probe mode
```

The two enabling changes (`copyLegacyKey` and `status: "planned"` renderer) are small, decoupled, independently testable, and unlock the two biggest in-review pieces. They could land as a single small commit titled "feat(symbiosis): enabling changes for SYM-8 + SYM-15" — gated by the user's approval to make those changes.

## What this doc does NOT recommend

- Does not recommend autonomously making the enabling changes. They're real platform-code edits that need user authorization per CLAUDE.md "Quality Over Speed" + "discuss architecture first" rules.
- Does not recommend skipping the prerequisites by using single-inheritor for SYM-15 or by line-removal for SYM-8 stale refs. Both would violate the we-do-not-destroy rule applied to student progress / source intent.

## Next steps

1. User approves the two enabling changes in concept.
2. I implement `copyLegacyKey` (one isolated commit, includes a tiny unit test).
3. I implement the renderer `status: "planned"` branch (one isolated commit, includes a fixture page).
4. Both land, smoke gate green, runtime monitor stays 5/5.
5. SYM-15 + SYM-8 mass work proceeds against the validated prerequisites.

Each enabling commit is reversible. Each commit is self-verifying. Neither touches existing student data or existing visible behavior — both are additive.
