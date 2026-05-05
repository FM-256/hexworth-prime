# SYM-17 — CLH Three-Layer Investigation

> **Status: investigation only. NO file edits. Awaiting curriculum-owner direction.**
> Surfaced 2026-05-05 while attempting Block A of SYM-15's G work (the 13 CLH curriculum slot collisions).

## What CLH is

**CLH = Command Line Hacker** — its own self-contained course in House of Script, with a dedicated hub at `_app/houses/script/courses/clh/index.html`. Hub title: "Command Line Hacker - House of Script". Currently lists **30 modules** (CLH-001 through CLH-030) across 5 tiers (foundation, operations, analysis, capstone, etc.).

The hub's `MODULES` array is the **canonical source of truth** for slot-to-topic mapping.

## The three file layers (per slot)

For most CLH-NNN slots, content exists in three different directories, each writing to a different progress key:

| Layer | Path pattern | Key written | Topic vs hub |
|---|---|---|---|
| **A. Old applet** | `script/clh/script-clh-NNN-intro.applet.html` | `script-clh-NNN-intro` | **Matches hub** |
| **B. Course module** | `script/courses/clh/modules/clh-NNN/script-intro.module.html` | `script-clh-NNN-intro` | **Differs from hub** |
| **C. Linux applet** | `script/applets/linux/script-clh-NNN-<topic>.applet.html` | `'CLH-NNN'` (uppercase, no house prefix) | Matches hub |

## Why this surfaced as PROG-003

Layers A and B share the same key (`script-clh-NNN-intro`) but teach **different topics**. PROG-003 flagged 13 of these collisions (CLH-003 through CLH-015, excluding CLH-002).

Layer C uses a different key format (`'CLH-NNN'`) so it doesn't collide with A or B in the validator, but it's a third presentation of the same slot.

## Sample mismatches between hub and course module

| Slot | Hub says (canonical) | Layer A applet says | Layer B course module says |
|---|---|---|---|
| 003 | Pattern Hunting | Pattern Hunting | **Network Analysis** |
| 004 | Process Investigation | Process Investigation | **Text Analysis & Pattern Hunting** |
| 005 | Log Analysis | Log Analysis | **Process Investigation** |
| 006 | File Operations | File Operations | **Permissions & Access Control** |
| 007 | Permissions & Access Control | Permissions & Access Control | **Shell Scripting Basics** |
| ... | ... | ... | ... |

The course modules teach **different content than the slot represents.** Looks like off-by-N drift: each module's topic appears to be roughly the topic of an earlier or later CLH slot, suggesting the course modules were authored against a different (perhaps earlier) version of the hub's curriculum and never re-aligned.

## Hub progress migration shim — important constraint

The hub at `script/courses/clh/index.html` (lines 442-468) has a hardcoded migration that maps `script-clh-NNN-intro` → `clh-NNN` for hub progress display:

```js
var oldIntro = 'script-' + canonical + '-intro';
// migrate FROM oldIntro INTO canonical 'clh-NNN'
```

This shim assumes any "real" CLH-NNN completion writes a key matching `script-clh-NNN-intro`. If the rename approach were taken (renaming applets to topic-specific keys), the hub shim would never see those renamed completions — students complete the applet but their hub progress card stays empty.

## Why "module wins, batch all 13" (the original SYM-15 G plan) is wrong

I had inferred from file timestamps and the deferred-renames doc that the modules were canonical (newer = current curriculum). Wrong. The hub's MODULES array agrees with the **applets**, not the modules.

Worse, the original plan would have:
- Renamed applet keys away from `script-clh-NNN-intro` → broke the hub migration shim
- Generated topic-derived applet keys (`script-pattern-hunting-applet`) that would semantically collide with the existing layer C linux applets (e.g., `script-clh-003-pattern-hunting.applet.html` already owns the "Pattern Hunting" framing)
- Required changes to four systems, not one

Nancy (adversarial-reviewer) caught all of this on 2026-05-05 before any file edit.

## What needs to happen (curriculum-level)

1. **Verify hub-as-canonical**: confirm with the curriculum owner that the hub's MODULES array represents the intended 2026 CLH curriculum.
2. **Decide what the layer B course modules ARE**:
   - **Option α**: Stale content from an earlier curriculum. → Move to a different CLH slot where the hub agrees with their topic, OR retire entirely.
   - **Option β**: Intentional alternate ordering for a different track. → Move to a different course or rename their identity.
   - **Option γ**: A platform error (someone authored CLH-005 thinking it should be Process Investigation; hub disagrees). → Fix one or the other.
3. **Decide what the layer C linux applets ARE**:
   - Are these a parallel "Linux track" deliverable separate from CLH?
   - Are they a duplicate of the layer A applets?
   - Are they redundant code that should be retired?
4. **Once topics align**: rename keys appropriately, add cross-credit shims for any student progress migration, update hub shim to cover all canonical keys.

## Files that need review (not edited)

Layer A — old applets (likely canonical for now):
- `_app/houses/script/clh/script-clh-NNN-intro.applet.html` × 13 (CLH-003..015)

Layer B — wrong-topic course modules:
- `_app/houses/script/courses/clh/modules/clh-NNN/script-intro.module.html` × 13

Layer C — linux applets (separate key format, unclear scope):
- `_app/houses/script/applets/linux/script-clh-NNN-<topic>.applet.html` × 19 (CLH-001..019)

Hub:
- `_app/houses/script/courses/clh/index.html` — migration shim at lines 442-468 may need expansion

## Status flag

PROG-003 collision count is currently 13 because of this. They're NOT ordinary key-rename bugs — fixing them properly requires the curriculum review described above, not a code edit.

## Why this is queued and not executed

- Curriculum decisions are not autonomous-agent territory
- The platform serves real students; mis-renaming a slot's canonical content would mean students complete the wrong-titled credit even more visibly than today
- The shim safety net handles progress migration cleanly only when the destination key is correct — a wrong destination means correctness drift across the gradebook

## Re-entry checklist (when ready to work this)

1. Read this doc + `sym-15-deferred-renames.md` for full context
2. Run `grep -rn "ModuleProgress.complete('script', 'CLH-" _app/houses/script/applets/linux/` to inventory layer C
3. Get curriculum owner to confirm hub MODULES array as canonical
4. For each slot CLH-003..015, decide whether layer B content is stale, moved, or a fix-the-content task
5. After curriculum decisions, code work is straightforward (rename keys + shims)
