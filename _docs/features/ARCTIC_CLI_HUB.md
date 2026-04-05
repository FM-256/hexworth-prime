# Arctic CLI Hub

**Status:** SHIPPED
**Components:** `ArcticEngine.js` (2,171 lines), `ArcticData.js` (district definitions)
**Location:** `_app/arctic/` (engine + data), `_app/arctic/districts/` (26 district directories)
**Added:** v5.0.0
**Last reviewed:** 2026-04-05

## Purpose

Arctic is Hexworth Prime's Linux content hub — 24 districts spanning 600+ modules
organized into 3 faction learning paths. It's the primary delivery mechanism for Linux
CLI education, from basic commands through system administration and offensive CLI
hacking. The hub uses fog-of-war progression where completing one section unlocks the
next, creating a structured learning journey through an Antarctic-themed visual experience.

## Architecture

```
ArcticData.js (district definitions)
  |-- 3 factions: Linux Mastery, Command Line Hacker, Linux Administration
  |-- 24 districts with module arrays
  |-- Module types: module, lab, quiz, applet, tool, game, review
  |
  v
ArcticEngine.js (2,171 lines, zero-dependency renderer)
  |-- renderHub() → faction tabs, district grid, overall progress
  |-- renderDistrict(id) → module flow with fog-of-war sections
  |-- Progress auto-detection from multiple house localStorage keys
  |-- Snowfall particle system (40 Unicode flakes)
  |-- Resume system (next incomplete module across all districts)
```

## Factions (3 Learning Paths)

| Faction | Districts | Unlock | Color | Icon |
|---------|-----------|--------|-------|------|
| **Linux Mastery (LM)** | 7 | Always unlocked | `#3ab8e0` (cyan) | Star |
| **Command Line Hacker (CLH)** | 5 | 40% LM completion | `#e0a030` (amber) | Sword |
| **Linux Administration (LA)** | 4 | 40% LM completion | `#3ac8a0` (green) | Diamond |

The unlock threshold (40%) ensures students have CLI fundamentals before accessing
offensive hacking (CLH) or sysadmin (LA) content. CLH and LA unlock independently —
students choose their path.

## Districts (24 Total)

Each district covers a focused Linux topic with progressive modules:

**Linux Mastery (7 districts):**
- CLI fundamentals, shell scripting, text processing, sysadmin basics, networking,
  advanced topics, plus additional foundational districts

**Command Line Hacker (5 districts):**
- CLI hacking techniques, forensic analysis, system exploitation, privilege escalation,
  advanced offensive operations

**Linux Administration (4 districts):**
- System hardening (includes Shield house labs via `progressHouse: shield`), service
  management, network administration, production operations

## Module Flow & Fog of War

Districts render as a vertical learning path with forking branches:

```
Section 1 (always unlocked)
  |-- [Module Head] ← lecture/lesson node
  |     |-- [Lab fork] ← hands-on branch
  |     |-- [Quiz fork] ← assessment branch
  |
Section 2 (unlocks when ALL Section 1 modules complete)
  |-- [Module Head]
  |     |-- [Applet fork]
  |     |-- [Lab fork]
  |
Section 3 (locked — fog of war)
  |-- [Fogged content]
```

**Section building logic (`_buildSections`):**
- `module`-type items start new sections and act as section heads
- `lab`, `quiz`, `applet`, `tool` items after a module become forking branches
- `game` and `review` items are always standalone sections
- Items before the first module form a preamble section (no head)

**Fog of war rules:**
- Section 1 is always unlocked
- Section N unlocks when ALL modules in sections 1 through N-1 are complete
- Locked sections show fogged appearance with unlock requirements displayed

## Progress Auto-Detection

Arctic detects completions from multiple sources — it doesn't require modules to
explicitly report back to Arctic:

1. **Explicit `progressKey`** — Module config specifies exact localStorage key to check
2. **Direct ID match** — Check `hexworth_progress[house][moduleId]`
3. **Href-derived fallback** — Extract filename from href, check across houses

This multi-source detection means modules built for other houses (Script, Shield, etc.)
automatically count toward Arctic progress without any modification.

**`progressHouse` field:** Specifies which house to check for completion. Default is
`script`. The Hardening district uses `progressHouse: 'shield'` because its labs live
in the Shield house.

## Hub Rendering

`renderHub()` builds the full Arctic experience:

1. Load progress from `hexworth_arctic_progress` localStorage
2. Auto-detect completions for ALL districts
3. Inject CSS (base + hub-specific, faction colors as CSS variables)
4. Build snowfall (40 Unicode snowflakes, 10-26s animation durations)
5. Build header with back button
6. Build hero (Tux icon, title, subtitle)
7. Build overall progress bar + resume button
8. Build faction tabs (3 tabs, one panel per faction)
9. Build district cards within each faction panel
10. Build progression diagram (unlock path visualization)

## Storage

| Key | Purpose |
|-----|---------|
| `hexworth_arctic_progress` | Module completions: `{ moduleId: "ISO-timestamp", ... }` |
| `hexworth_arctic_next` | Stashed next-module href for resume |
| `hexworth_progress` | Cross-house detection source |

## Difficulty Scale

| Level | Label |
|-------|-------|
| 1 | Beginner |
| 2 | Intermediate |
| 3 | Advanced |
| 4 | Expert |
| 5 | Elite |
| 6 | Master |

## Key Decisions

- **Zero-dependency engine** — ArcticEngine.js has no external dependencies. All CSS is
  injected as strings, all HTML is generated in JavaScript. This matches the platform's
  no-build-step philosophy and ensures Arctic works on any page that loads the two JS files.

- **Multi-house progress detection** — Arctic aggregates completions from Script, Shield,
  and potentially Dark Arts houses. This avoids forcing students to complete "Arctic
  versions" of content that already exists in other houses. A lab completed in Shield
  counts in Arctic automatically.

- **Faction unlock at 40%** — Not 100%. Students don't need to finish all of Linux
  Mastery before accessing CLH or LA. 40% ensures foundational knowledge while allowing
  motivated students to branch early.

- **Section-based fog** — Unlike Arctic unlocking districts (coarse), fog of war operates
  at the section level within districts (fine). This creates a guided path through each
  district while keeping the overall district selection open.

- **Snowfall particles** — 40 Unicode snowflakes with randomized speeds reinforce the
  Antarctic theme. Performance-optimized with CSS animations (no JavaScript animation
  loop). Each flake has a unique delay and duration (10-26 seconds).

- **Resume system** — `_findGlobalResume()` scans all districts for the next incomplete
  module. `_stashNextModule()` stores the href in `hexworth_arctic_next` so the resume
  button works across page navigations.

## Known Limitations

- **No LearningPaths integration on hub page** — Arctic districts don't appear in the
  platform's LearningPaths system (used by dashboard and content browser). However,
  `LearningPaths.registerArctic()` exists to expose Arctic paths for the instructor
  dashboard's content browser. The two systems are parallel, not unified.

- **Module href resolution** — Module links are relative paths (`../../../houses/script/labs/...`).
  If the Arctic directory moves, all hrefs break. ArcticEngine resolves via
  `new URL(href, window.location.href)` which handles depth correctly but is fragile
  to restructuring.

- **No per-module difficulty** — Difficulty is set at the district level, not per-module.
  A district marked "Advanced" may contain beginner-friendly intro modules alongside
  genuinely advanced labs.

- **Progress detection can false-positive** — The href-derived fallback (method 3) extracts
  filenames and checks across houses. Two modules with the same filename in different
  houses could cross-detect. In practice this is rare because naming conventions include
  house prefixes.
