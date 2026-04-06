# Operator World Map — Part I (Levels 1-50)

**Created:** 2026-04-05
**Status:** DESIGNED (ready to build)
**Dependency:** OPERATOR_PYTHON_V2_METROIDVANIA.md (approved design spec)

---

## 4 Acts

| Act | Levels | Focus | Grid Range |
|-----|--------|-------|------------|
| I — Foundations | 1-17 | Python basics (existing, add bonus objectives) | 7x7 → 12x12 |
| II — Obstacles | 18-25 | New obstacle types introduced one at a time | 8x8 |
| III — Tool Forge | 26-35 | Earn permanent tools, Metroidvania begins | 9x9 → 10x10 |
| IV — Full Metroidvania | 36-50 | All tools, complex puzzles, world dependencies | 10x10 → 12x12 |

---

## Tool Chain

| Tool | Type | Earned At | How | Prerequisites | First Used |
|------|------|-----------|-----|---------------|-----------|
| jump | per-transit | L18 | Always available | — | L18 |
| extinguish | per-transit | L20 | Always available | — | L20 |
| fight | per-transit | L22 | Always available | — | L22 |
| key/unlock | per-transit | L25 | Always available | — | L25 |
| **bridge** | permanent | L26 | Completion reward | — | L26 |
| **fireproof** | permanent | L29 | Found on grid | bridge | L29 |
| **terminate** | permanent | L32 | Found on grid | bridge + fireproof | L32 |
| **tunnel** | permanent | L35 | Found on grid | bridge + fireproof + terminate | L35 |

---

## Act I — Foundations (Levels 1-17, EXISTING)

Keep as-is. Add bonus objectives behind obstacles requiring later tools.

| Lvl | Name | Bonus Objective | Requires |
|-----|------|----------------|----------|
| 1 | Grid Search | Hidden server behind HOLE | bridge (L26) |
| 2 | Adaptive Recon | Data cache behind FIRE | fireproof (L29) |
| 3 | Patrol Route | Armory behind ENEMY | terminate (L32) |
| 4 | Data Heist | Shortcut through WALL | tunnel (L35) |
| 5 | Full Spectrum | Secret exit behind HOLE+FIRE | bridge + fireproof |
| 6 | Night Raid | Weapon cache behind ENEMY | terminate (L32) |
| 7 | Ghost Protocol | Hidden floor behind WALL | tunnel (L35) |
| 8 | Fork in the Road | Locked armory — KEY behind HOLE | bridge (L26) |
| 9 | Chain Reaction | Reactor behind FIRE wall | fireproof (L29) |
| 10 | Scattered Ops | 7th server behind ENEMY patrol | terminate (L32) |
| 11 | VLAN Hopper | Bypass segment via TUNNEL | tunnel (L35) |
| 12 | Stealth Run | Zero-cost path through BRIDGED holes | bridge (L26) |
| 13 | Double Tap | Hidden data behind FIRE+ENEMY | fireproof + terminate |
| 14 | Supply Chain | Backdoor vendor entry via TUNNEL | tunnel (L35) |
| 15 | Perimeter Breach | Inner sanctum behind triple HOLE | bridge (L26) |
| 16 | Maze Runner | Wall-bypass shortcut via TUNNEL | tunnel (L35) |
| 17 | Mega Grid | Hidden 4th floor behind ENEMY+FIRE+HOLE | all 3 tools |

---

## Act II — Obstacle Introduction (Levels 18-25)

| Lvl | Grid | Name | New Element | Obstacles |
|-----|------|------|-------------|-----------|
| 18 | 8x8 | Pit Stop | HOLES | 3 holes, 2 traps, 1 gate |
| 19 | 8x8 | Chasm Run | Hole mastery | 5 holes, 1 trap, 1 gate |
| 20 | 8x8 | Firestorm | FIRES | 3 fires, 2 holes, 2 traps |
| 21 | 8x8 | Inferno Alley | Fire mastery | 5 fires, 2 holes, 1 trap |
| 22 | 8x8 | Hostile Zone | ENEMIES | 3 enemies, 2 fires, 2 holes, 1 trap |
| 23 | 8x8 | Gauntlet | All 3 types mixed | 3 each + 2 traps |
| 24 | 8x8 | Resource Crunch | Per-transit awareness | 4 each + 2 traps |
| 25 | 8x8 | Dead Ends | LOCKED DOORS + KEYS | 2 doors, 2 keys, mixed obstacles |

---

## Act III — Tool Forge (Levels 26-35)

| Lvl | Grid | Name | Tool Earned | Tool Required | Key Feature |
|-----|------|------|-------------|---------------|-------------|
| 26 | 9x9 | The Bridge | **bridge** | — | Completion reward (bootstrap) |
| 27 | 9x9 | Backtrack: Pit Stop | — | bridge | Revisit L18 bonus |
| 28 | 9x9 | Sinkhole | — | bridge | Bridge 4, jump 4. Dict dispatch emerges. |
| 29 | 9x9 | The Crucible | **fireproof** | bridge | Found behind bridged holes |
| 30 | 10x10 | Backtrack: Inferno | — | fireproof | Revisit L21 bonus |
| 31 | 10x10 | Scorched Earth | — | bridge, fireproof | Nested: hole → fire → server |
| 32 | 10x10 | The Armory | **terminate** | bridge, fireproof | Found behind fire+hole gauntlet |
| 33 | 10x10 | Backtrack: Hostile | — | terminate | Revisit L22 bonus |
| 34 | 10x10 | Fortress | — | all 3 tools | Full dispatch table required |
| 35 | 10x10 | The Excavator | **tunnel** | all 3 tools | Found behind enemy+fire+hole |

---

## Act IV — Full Metroidvania (Levels 36-50)

| Lvl | Grid | Name | Focus | Tools Required |
|-----|------|------|-------|---------------|
| 36 | 10x10 | Tunnel Vision | Tunnel mastery | tunnel |
| 37 | 10x10 | Backtrack: Maze | Revisit L16 | tunnel |
| 38 | 10x10 | The Switch | Tool-gated branching (4 paths) | all 4 |
| 39 | 10x10 | Locksmith | Key management + tools | all 4 |
| 40 | 11x11 | Layer Cake | Stacked obstacles in sequence | all 4 |
| 41 | 11x11 | Backtrack: Mega | Revisit L17 | all 4 |
| 42 | 11x11 | Island Hopping | Disconnected zones | bridge, tunnel |
| 43 | 11x11 | Scorched Maze | Fire + walls | fireproof, tunnel |
| 44 | 11x11 | War Zone | Dense enemy grid | terminate, fireproof, bridge |
| 45 | 11x11 | The Vault | 3 keys behind 3 tool paths | all 4 |
| 46 | 12x12 | Deep State | Multi-floor + tunneling | all 4 |
| 47 | 12x12 | No Man's Land | All obstacles, max density | all 4 |
| 48 | 12x12 | Backtrack Blitz | Complete all L1-17 bonuses | all 4 |
| 49 | 12x12 | The Architect | Open-ended, student designs approach | all 4 |
| 50 | 12x12 | Iron Curtain | PART I FINALE | all 4 + keys |

---

## Dependency Web

```
LINEAR PATH:
L1 → L2 → ... → L17 → L18 → L19 → L20 → L21 → L22 → L23 → L24 → L25

TOOL CHAIN:
L25 → L26(bridge) → L27 → L28 → L29(fireproof) → L30 → L31 → L32(terminate) → L33 → L34 → L35(tunnel)

POST-TOOLS:
L35 → L36 → L37 → L38 → ... → L49 → L50

BACKTRACK BRANCHES (bridge earned):
L26 → L1 bonus, L8 bonus, L12 bonus, L15 bonus, L18 bonus

BACKTRACK BRANCHES (fireproof earned):
L29 → L2 bonus, L9 bonus, L21 bonus

BACKTRACK BRANCHES (terminate earned):
L32 → L3 bonus, L6 bonus, L10 bonus, L22 bonus

BACKTRACK BRANCHES (tunnel earned):
L35 → L4 bonus, L7 bonus, L11 bonus, L14 bonus, L16 bonus

MULTI-TOOL BONUSES:
L26+L29 → L5 bonus (bridge + fireproof)
L29+L32 → L13 bonus (fireproof + terminate)
L26+L29+L32 → L17 bonus (all 3 combat tools)
```

---

## Python Skill Progression

| Levels | Pattern |
|--------|---------|
| 1-17 | `def safe_advance()` + lawnmower sweep |
| 18-19 | `if 'HOLE': jump` — first elif branch |
| 20-21 | 3-branch elif (trap/hole/fire) |
| 22-25 | 4-branch elif (trap/hole/fire/enemy) + keys |
| 26-28 | Permanent vs temporary: `if has_tool: bridge else: jump` |
| 29-35 | Dict dispatch: `tools = {'HOLE': agent.bridge, ...}` |
| 36-40 | Function composition: `def clear_and_advance(scan, dispatch)` |
| 41-45 | State management: `inventory = {'keys': 0, 'cleared': []}` |
| 46-49 | Algorithmic design: `def plan_route(grid, tools)` |
| 50 | `def main()` orchestrating full tool library |

---

## Level 50: IRON CURTAIN — Part I Finale

12x12 grid. 4 quadrants, each dominated by one obstacle type:
- NW: Hole field (bridge)
- NE: Fire corridor (fireproof)
- SW: Enemy stronghold (terminate)
- SE: Wall labyrinth (tunnel)
- Center: Locked vault (3 keys, scattered in quadrants)

Requires a complete 80-120 line Python program with dispatch table, sweep functions, key tracking, and multi-quadrant orchestration.

---

## Build Order

1. ~~Level 18 (Pit Stop) — BUILT, LIVE~~
2. Engine: Add CSS for hole/fire/enemy cell types
3. Levels 19-25 (one obstacle type per level)
4. Level 26 (bridge tool bootstrap + inventory system)
5. Retrofit L1-L17 with bonus objectives + obstacle cells
6. Levels 27-35 (tool acquisition + backtrack)
7. Levels 36-50 (full Metroidvania)
8. QC: recursive pass until zero issues

---

*Part II (Levels 51-100) will require all Part I permanent tools.
Design separately after Part I ships and is validated with students.*
