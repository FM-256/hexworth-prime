# Incubation Hubs

**Status:** Design (Stragglers branch, 2026-04-30)
**Owner:** Hexworth Prime architecture
**Related:** Strict Orphan Scanner, Placement Recommender (`_tools/eduscan/`)

## Problem

The strict orphan scanner found **1543 catalog modules** (52% of 2996) that are not curated by any hub. Of these:

- **704** map to existing hubs that just need the module ids registered (data-module attrs, inline JS arrays, or LearningPath modules array).
- **293** justify dedicated new hubs (sufficient module mass + clear curriculum scope).
- **57** need cleanup (catalog dedupe / sub-content roll-up).
- **489** are orphans without strong curriculum identity yet — too small for their own hub but needing a home for visibility.

Without a home, the 489 orphans:
- Are invisible to students browsing house pages.
- Drift further from any curriculum as new content is added on top.
- Show up forever in the strict orphan scanner's output, drowning out new orphans.

## Pattern: Per-House Incubation Hub

Each house gets one **incubation hub** at `_app/houses/<house>/incubator/index.html`. It's a real hub (renders cards, shows progress) but flagged as a **holding area**, not a curriculum.

### Visual + UX rules

- Top banner: "INCUBATOR — content here is being evaluated for a permanent home. Topics graduate when they reach ≥10 related modules."
- Modules grouped by id-prefix sub-cluster (e.g., `bash-*`, `pwsh-*`, `docker-*`).
- Each sub-cluster shows its own count + a "promote to dedicated hub" status indicator (e.g., `7/10 modules — 3 to graduate`).
- Standard module-card UI (matches house style).

### Code structure

The incubator hub follows the **inline-JS module-array pattern** (mech 4) so the strict scanner picks up its modules automatically:

```html
<script>
const INCUBATOR_MODULES = [
    { id: 'script-bash-arrays',     subcluster: 'bash',   title: 'Bash Arrays' },
    { id: 'script-bash-basics',     subcluster: 'bash',   title: 'Bash Basics' },
    { id: 'script-pwsh-pipeline',   subcluster: 'pwsh',   title: 'PowerShell Pipeline' },
    // ... full list ...
];
</script>
```

The scanner already recognizes any id appearing as a quoted string inside a verified hub's `<script>` block — the incubator's `HouseRenderer` call (or an explicit `IncubatorRenderer.init`) qualifies it as a verified hub.

### Promotion rule

A sub-cluster **graduates out of the incubator** when:

1. It contains ≥10 modules of clearly related curriculum scope (e.g., all CompTIA Server+ topics; all Bash automation), AND
2. There is a stable curriculum target — either an existing cert/course it can join, or a clear case for a new dedicated hub.

When a sub-cluster graduates:
- Build the dedicated hub at `_app/houses/<house>/<sub-cluster-name>/index.html`.
- Remove the modules from the incubator's `INCUBATOR_MODULES` array.
- Run the strict orphan scanner to confirm no regression.
- Update Confluence Stragglers page with the graduation note.

### Hub structure (file layout)

```
_app/houses/<house>/
├── index.html              # House landing
├── incubator/              # ← NEW
│   ├── index.html          # Incubator hub
│   └── README.md           # Sub-cluster log + graduation history
└── <other curated hubs>/
```

The README.md serves as the **graduation log**: when a sub-cluster moves out, append a one-line entry with date, target hub, module count.

## Cleanup vs. Incubation

Some "orphans" aren't curriculum-orphans at all — they're catalog artifacts (e.g., `cloud-guilab-2`, `cloud-pslab-3` from the WSA course's auto-derived dup ids). These don't need an incubator entry; they need:

- Catalog dedupe (drop the ones with auto-suffixed ids).
- OR roll-up into the parent (m01-m19) modules' sub-content lists.

The placement recommender flags these with the 🧹 cleanup tag separately from incubator-bound items.

## Sub-content vs. true orphan

The orphan-cluster-analyzer distinguishes:

- **True curriculum orphan** (1347 modules) — module not in any hub, AND no in-hub parent module exists.
- **Sub-content orphan** (196 modules) — module's parent IS in a hub (e.g., `script-clh-001-quiz` whose parent `clh-001` is curated), but the child wasn't separately registered.

Sub-content orphans rarely belong in incubators. They either:
- Get rolled up into the parent's sub-card list (existing pattern in CHFI/GCFA cert hubs).
- OR are themselves a clear curriculum unit and get registered with the parent hub directly.

## Anti-patterns

- **Don't use the incubator as permanent storage.** If a sub-cluster sits at <10 modules for >6 months and nothing aligns, the modules are likely abandoned content — flag for archive instead.
- **Don't bypass the scanner with a hidden inline list.** The scanner needs to see the ids as quoted strings in the incubator's `<script>` block. If you load them at runtime from a hidden source, they'll appear orphaned again.
- **Don't promote prematurely.** A 4-module sub-cluster is not a hub. It's a candidate for collaboration with adjacent topics or for archive.

## Related

- `_tools/eduscan/strict-orphan-scanner.js` — orphan detection (4 mechanisms).
- `_tools/eduscan/orphan-cluster-analyzer.js` — sub-content + cluster analysis.
- `_tools/eduscan/placement-recommender.js` — per-cluster placement plan.
- `_tools/reports/PLACEMENT_RECOMMENDATIONS.md` — current matrix.
- Confluence Stragglers page (id 6062082) — branch documentation.
