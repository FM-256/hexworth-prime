# QC Investigation — Midterm "Outpost": Multi-Tab State Clobber

*Status: Investigation only. No code changed. Date: 2026-06-16.*

## TLDR

Students intermittently lose AD user creations and group assignments in the WSA
"Midterm: Outpost" simulation. Root cause is a **multi-browser-tab last-write-wins
localStorage clobber**: all progress lives in one localStorage key, the page reads
that key only once (at load), `saveState()` overwrites the whole key with a full
snapshot, and there is no cross-tab reconciliation anywhere. When a student has the
midterm open in two browser tabs, whichever tab saves last overwrites the other tab's
work. It is intermittent because it only triggers with two or more tabs open, and the
casualties are AD users and assignments because those are the high-frequency
incremental mutations. Recommended fix: merge-on-save plus a refocus reload.

| | |
|---|---|
| **Subject** | `_app/houses/cloud/modules/wsa/midterm-outpost/cloud-simulation.module.html` (~4581 lines) |
| **Shared component** | `_app/components/StateFederation.js` |
| **Reported symptom** | Intermittent loss of AD user creation and group assignments "when users switch midterm tabs" |
| **Severity** | Data loss (student work), conditional on multi-tab usage |
| **Reproducibility** | Deterministic with two tabs open; invisible with a single tab |

## Reproduction

1. Open the midterm in two browser tabs (Tab A and Tab B). This also covers the common
   case of reopening the midterm in a new tab without closing the old one.
2. In Tab A, create several AD users and add them to groups (GUI or PowerShell).
3. In Tab B, perform any action that triggers a save (create an OU, change a setting,
   create a user).
4. Reload Tab A, or switch back to it and trigger a save. The users and assignments
   made in the tab that did not save last are gone.

## Root cause

Three facts combine into the bug.

1. **Single localStorage key, all state.** All simulation progress lives in one global
   `state` object persisted to the key `outpost-simulation-state`
   (`cloud-simulation.module.html:785`).

2. **State is read only once.** `loadState()` is defined at
   `cloud-simulation.module.html:850` and called exactly once, at initialization
   (`cloud-simulation.module.html:4538`). Nothing re-reads localStorage afterward.

3. **Saves are blind full-snapshot overwrites.** `saveState()`
   (`cloud-simulation.module.html:876`) calls `_fed.save(state)`, and
   `StateFederation.save()` performs
   `localStorage.setItem(this._storageKey, JSON.stringify(fullState))`
   (`StateFederation.js:77`). This replaces the entire stored snapshot; it is not a
   merge of changes.

4. **No cross-tab reconciliation exists.** There is no `storage` event listener, no
   `visibilitychange` / `focus` / `pageshow` handler, and no `BroadcastChannel` —
   confirmed across `cloud-simulation.module.html`, `StateFederation.js`, and
   `_app/components/FirestoreManager.js`.

5. **The federation merge path does not apply here.** The federation is registered with
   `merge: null` and `fromSync: null` (`cloud-simulation.module.html:833-848`).
   `StateFederation`'s merge logic only folds the lightweight *sync* key into state for
   cross-device completion detection; it does nothing to reconcile concurrent
   full-state writes for this midterm.

### Failure sequence (two tabs)

1. Both tabs load the same snapshot into independent in-memory `state`.
2. Tab A creates users and assigns group members, writing its full snapshot to the key.
3. Tab B, still holding its older in-memory `state`, calls `saveState()` for any reason
   and overwrites the key with its snapshot — erasing Tab A's users and assignments.
4. Neither tab is notified. The loss surfaces on the next reload or when switching back.

### Why it matches the reported symptom

- **"Intermittent"** — it only triggers when two or more tabs are open, and which data
  survives depends on save interleaving. Single-tab students never see it.
- **"AD user creation and assignments"** — these are the high-frequency incremental
  mutations the midterm drives (objectives require 10+ users at
  `cloud-simulation.module.html:915` and group members of 2+ at `:917`), so they are the
  most visible casualties. One-time settings such as server configuration rarely show it.
- **"When users switch midterm tabs"** — switching between two open browser tabs of the
  midterm.

## Ruled out

| Suspect | Evidence | Verdict |
|---|---|---|
| In-page workspace tabs (GUI / PowerShell / Documentation) | `switchTab()` (`cloud-simulation.module.html:1030`) only toggles `.active` CSS classes; it mutates no state and triggers no destructive re-render | Not the cause; cannot lose data |
| Surgical ADUC refresh | `refreshADUC()` (`cloud-simulation.module.html:1269`) correctly re-renders tree, users, and groups from state | Sound |
| Terminal command persistence | `New-ADUser` (`:4046`), `New-ADGroup` (`:4072`), `Add-ADGroupMember` (`:4145`) all call `saveState()` | Single-page persistence sound |

## Secondary observation (minor; not the reported symptom)

Terminal `Add-ADGroupMember` (`cloud-simulation.module.html:4156`) does not verify that
the named user exists, and its membership check is case-sensitive. The GUI adds members
from a dropdown filtered to real users (`:1777`). A student mixing the GUI and the
terminal with differing case can create phantom or duplicate group members.

## Remediation options

None implemented. Listed for a follow-up fix decision.

| # | Option | Effect | Notes |
|---|--------|--------|-------|
| 1 | Merge-on-save | Re-read the key and union users / groups / members before writing | Eliminates the clobber even without listeners. Most robust. |
| 2 | `storage` event listener | When another tab writes the key, reload and re-render this tab | Reconciles on the fly |
| 3 | `visibilitychange` / focus reload | On tab refocus, call `loadState()` and re-render | Cheap; safe here because every mutation saves immediately |
| 4 | Single-active-tab guard via `BroadcastChannel` | Warn the student that a second tab is open | Prevention rather than reconciliation |

**Recommendation:** combine option 1 (merge-on-save) and option 3 (refocus reload) for
defense in depth — the merge prevents loss at write time, and the refocus reload keeps a
returning tab consistent with what other tabs have written.

## Related

- [[reference_firestore_sync_migration_pingpong]] — broader pattern of state-sync
  reconciliation hazards on this platform.
