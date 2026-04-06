# Operator Missions — Metroidvania Python Training System

**Status:** SHIPPED (v2 — Metroidvania)
**Components:** `OperatorEngine.js`, `OperatorInterpreter.js` (Python), `TerminalInterpreter.js` (CLI), `AgentBridge.js` (agent API + obstacle system + persistent inventory)
**Location:** `_app/operator/` (72 missions: 22 terminal + 50 Python), `_app/operator/engine/` (4 engine files + CSS)
**Added:** v5.0.0 (original), v6.0.0 (Metroidvania expansion)
**Last reviewed:** 2026-04-05

## Purpose

Operator is a code-driven strategy game that teaches Python through grid-based puzzles.
Students write Python programs that control an agent navigating fog-of-war grids. The
agent moves, scans, fights, jumps, bridges, and terminates — each action is a Python
function call. The game's core insight: **Python language features ARE the game mechanics.**

- Variable assignment = equipping a weapon (`gun = agent.terminate`)
- Dictionary = weapon rack (`toolkit = {'HOLE': agent.bridge, 'FIRE': agent.fireproof}`)
- Dispatch table = automated combat (`toolkit[threat](direction)`)
- For loops = patrol sweeps
- Function definitions = crafting reusable tools

The Metroidvania layer adds persistent tools earned across levels. Tools found in later
levels unlock content in earlier levels, creating an interconnected world where progress
in Level 34 enables backtracking to Level 18.

## Architecture

```
Mission config (JSON)
  |-- Grid: 2D cell array (7x7 to 12x12)
  |-- Nodes: Network devices with IPs, ports, OS, vulnerabilities
  |-- Obstacles: holes (jump/bridge), fires (extinguish/fireproof),
  |              enemies (fight/terminate), locked doors (key+unlock)
  |-- Traps: Honeypots and IDS sensors (sweep to disarm)
  |-- Gates: Firewalls requiring nmap/exploit/spoof/decrypt
  |-- Objectives: Boolean expressions against game state
  |-- completionReward: { tool: 'bridge' } — permanent tool awarded on completion
  |
  v
OperatorEngine.js (state machine + renderer)
  |-- Grid rendering (CSS Grid, fog-of-war, obstacle cell types)
  |-- State: position, visibility, integrity, obstacles cleared,
  |          permanent tools cleared, items collected
  |-- Save/load to localStorage per-mission
  |-- Completion rewards: persistent tool inventory
  |
  v
AgentBridge.js (student-facing API)
  |-- 10 original methods: move, scan, sweep, ping, nmap, exploit, spoof, decrypt, patch, status
  |-- 4 per-transit countermeasures: jump, extinguish, fight, unlock
  |-- 4 permanent tools: bridge, fireproof, terminate, tunnel
  |-- Properties: position, discovered, tools, items, tier, commands
  |-- Persistent inventory: hexworth_operator_inventory (localStorage)
  |
  v
OperatorInterpreter.js (Python interpreter)
  |-- Tokenizer → Parser → Interpreter pipeline
  |-- Supports: if/elif/else, for/while, def/return, variables, lists, dicts
  |-- Built-ins: print, len, range, str, int, float, bool, list, type, abs, max, min
  |-- First-class functions: students assign agent methods to variables
```

## Two Tracks

### Terminal Track (22 missions)
- Tier 1 Sequencing (4): RECON, WINDOWS, LINUX, FIREWALL
- Tier 2 Decision Making (10): Multi-domain CLI missions
- Tier 3 Automation (7): Advanced terminal operations
- Uses `TerminalInterpreter.js` — config-driven CLI command dispatcher

### Python Track (50 missions — Metroidvania)
- **Tier 1 Foundations (4):** For loops, conditionals, functions (7x7-8x8)
- **Tier 2 Operations (6):** Multi-phase, data collection (9x9-10x10)
- **Tier 3 Advanced (7):** Mega grids, full automation (10x10-12x12)
- **Tier 4 Obstacles (10):** Holes, fires, enemies, keys (8x8)
- **Tier 5 Tool Forge (10):** Earn permanent tools, Metroidvania begins (9x9-10x10)
- **Tier 6 Full Metroidvania (13):** All tools, world-level puzzles (10x10-12x12)

Hub has language tabs: ALL / TERMINAL / PYTHON

## The Metroidvania System

### Obstacle Types

| Obstacle | Countermeasure (per-transit) | Permanent Tool | Introduced |
|----------|---------------------------|----------------|-----------|
| Trap | `agent.sweep(dir)` | — | Level 1 |
| Hole | `agent.jump(dir)` | `agent.bridge(dir)` | Level 18 |
| Fire | `agent.extinguish(dir)` | `agent.fireproof(dir)` | Level 20 |
| Enemy | `agent.fight(dir)` | `agent.terminate(dir)` | Level 22 |
| Locked Door | `agent.unlock(dir)` (consumes key) | — | Level 26 |
| Wall | — | `agent.tunnel(dir)` | Level 38 |

Per-transit tools clear one crossing — the obstacle remains for return trips.
Permanent tools clear the obstacle forever. Permanent tools persist in localStorage
across ALL levels.

### Tool Chain

| Tool | Earned At | How | Prerequisites |
|------|-----------|-----|--------------|
| bridge | Level 28 | Completion reward (bootstrap) | None |
| fireproof | Level 31 | Grid pickup behind holes | bridge |
| terminate | Level 34 | Grid pickup behind fires+holes | bridge + fireproof |
| tunnel | Level 37 | Grid pickup behind all 3 | bridge + fireproof + terminate |

Each tool is found behind obstacles requiring all previously earned tools.
This creates the Metroidvania dependency chain.

### Persistent Inventory

```
localStorage key: hexworth_operator_inventory
Value: { tools: ['bridge', 'fireproof', 'terminate', 'tunnel'], earnedIn: {...} }
```

Students access it via: `agent.tools` (Python list)
Students use tools as first-class functions: `gun = agent.terminate; gun('east')`

### Auto-Pickup System

- **Key nodes** (`key-*`): Auto-collected when agent walks onto them. Added to `state.items`.
- **Tool nodes** (`tool-*`): Auto-collected on entry. Added to persistent inventory.
  Displayed: `[TOOL ACQUIRED] *** BRIDGE *** added to permanent inventory!`

### Bonus Objectives & Backtracking

Levels 1-17 have bonus objectives behind obstacles requiring tools from later levels:
- Level 1 bonus: Hidden server behind HOLE (requires bridge from L28)
- Level 3 bonus: Armory behind ENEMY (requires terminate from L34)
- Level 7 bonus: Hidden floor behind WALL (requires tunnel from L37)

Hub shows: `"3/4 objectives — requires: bridge tool (Level 28)"`

### Completion Rewards

Configs with `completionReward: { tool: 'bridge' }` award the tool to the persistent
inventory when the mission is completed. Used by Level 28 (The Bridge) to bootstrap
the Metroidvania loop without a chicken-and-egg problem.

## Agent API (Student-Facing)

### Methods

| Method | Tier | Description |
|--------|------|------------|
| `move(dir)` | 1 | Move N/S/E/W. Triggers obstacle damage if not cleared. Returns false if blocked. |
| `scan()` | 1 | Returns `[{name, ip, direction}]` for adjacent nodes. Reveals fog. Disarms traps. |
| `status()` | 1 | Print position, nodes, integrity, objectives. |
| `sweep(dir)` | 2 | Disarm trap in adjacent cell. |
| `ping(target)` | 2 | Test if revealed node is reachable. |
| `jump(dir)` | 2 | Cross hole (per-transit — consumed on use). |
| `extinguish(dir)` | 2 | Clear fire (per-transit). |
| `fight(dir)` | 2 | Defeat enemy (per-transit). |
| `unlock(dir)` | 2 | Open locked door (consumes key from items). |
| `nmap(target)` | 3 | Deep scan — returns `{label, ip, ports, os, vuln}`. Clears nmap gates. |
| `exploit(target)` | 3 | Exploit vulnerability. Clears exploit gates. |
| `spoof(target)` | 3 | Spoof node identity. Clears spoof gates. |
| `decrypt(target)` | 3 | Decrypt data. Clears decrypt gates. |
| `patch(target)` | 3 | Patch firmware. Clears patch gates. |
| `bridge(dir)` | 3 | Fill hole permanently. Requires 'bridge' in inventory. |
| `fireproof(dir)` | 3 | Fireproof path permanently. Requires 'fireproof' in inventory. |
| `terminate(dir)` | 3 | Eliminate enemy permanently. Requires 'terminate' in inventory. |

### Properties

| Property | Returns |
|----------|---------|
| `agent.position` | Current cell label (lowercase) |
| `agent.discovered` | Array of discovered node type keys |
| `agent.tools` | Persistent inventory (array of tool names) |
| `agent.items` | Current level items — keys, etc. (array) |
| `agent.tier` | Current tier number |
| `agent.commands` | Array of available method names |

## Python Skill Progression

| Levels | What Students Learn Through Gameplay |
|--------|-------------------------------------|
| 1-17 | `def safe_advance()` + lawnmower sweep patterns |
| 18-21 | `if/elif` with 2-3 branches (obstacle type → response) |
| 22-25 | 4-branch `if/elif` chains (trap/hole/fire/enemy) |
| 26-27 | Key collection + sequential planning |
| 28-31 | Permanent vs temporary tools — strategic choice |
| 32-37 | Dict-based dispatch tables: `tools = {'HOLE': agent.bridge}` |
| 38-42 | Function composition: `def clear_and_advance(scan, dispatch)` |
| 43-47 | State management: `inventory = {'keys': 0, 'cleared': []}` |
| 48-50 | Full program design: `def main()` orchestrating all tools |

The dispatch table emergence is the key pedagogical moment. Students discover that
a dictionary mapping threat→action is cleaner than a 10-branch elif chain — not because
a textbook told them, but because the game made the alternative unbearable.

## Grid Mechanics

- **Fog of war:** Cells start hidden. `scan()` reveals adjacent. Moving marks as visited.
- **Bounce behavior:** Walking into an uncleared obstacle = pre-move reject. Agent stays in place. -1 integrity.
- **Per-transit clearing:** `jump/extinguish/fight` mark `state.jumpedCells[key]`. Consumed on crossing — obstacle remains for return trip.
- **Permanent clearing:** `bridge/fireproof/terminate` mark `state.permanentCleared[key]`. Obstacle removed forever.
- **Auto-pickup:** Key and tool nodes collected automatically on entry.
- **Save/load:** Auto-saves to localStorage after every command. Resume on revisit.
- **Completion:** SEC-4 server-side validation via Cloud Function. Offline fallback.

## Storage

| Key | Storage | Purpose |
|-----|---------|---------|
| `hexworth_operator_{id}_save` | localStorage | Per-mission save state |
| `hexworth_operator_{id}` | localStorage | Completion stats |
| `hexworth_operator_inventory` | localStorage | Persistent tool inventory |
| `hexworth_operator_skip_briefing` | localStorage | Skip briefing preference |

## Key Decisions

- **Python IS the game mechanic** — Variable assignment = equip, dictionary = inventory,
  dispatch table = automated combat. The student doesn't learn Python then play — the
  Python IS the gameplay.

- **Metroidvania over linear progression** — Levels form a dependency web, not a ladder.
  Tools earned in later levels unlock content in earlier levels. Backtracking is
  motivated, not punished.

- **Per-transit AND permanent tools** — Per-transit tools (jump/extinguish/fight) teach
  the obstacle. Permanent tools (bridge/fireproof/terminate) are the reward for mastery.
  The distinction teaches that efficiency has real value.

- **Bootstrap at Level 28** — First permanent tool (bridge) is a completion reward, not
  a grid pickup. Solves the chicken-and-egg problem. Every subsequent tool IS a grid
  pickup behind obstacles requiring previous tools.

- **No new engine verbs for game mechanics** — Holes, fires, enemies are handled by the
  same pre-move-reject pattern as existing traps. The engine was extended, not rewritten.

- **Procedural grids for Act IV** — Levels 39-50 use seeded random generation for
  obstacle placement. Grid layouts are deterministic (same seed = same grid) but
  each level has unique topology.

## Known Limitations

- **localStorage inventory** — Persistent tools are device-bound. Students switching
  devices lose their tool inventory. Firebase sync planned but not yet implemented.
  This is the critical gap before the Metroidvania loop ships to students.

- **No tutorial/legend overlay** — New obstacle types are introduced through gameplay
  discovery, not explicit tutorial screens. The mission briefing describes the scenario
  but doesn't explain the new mechanic. Some students may need instructor guidance.

- **Per-transit tools consumed silently** — When `jump()` clears a crossing and the
  student moves through, the jump is consumed without explicit confirmation. Students
  may not realize they need to jump again on return trips.

- **Act IV grids are procedurally generated** — Levels 39-50 have obstacles placed by
  seeded randomness. While all grids are QC-verified as completable, the obstacle
  placement may create unintended difficulty spikes or trivial paths.

- **Dispatch table discovery is not nudged** — The game makes elif chains painful at
  scale but doesn't hint toward the dict solution. Nancy recommended an intercepted
  debrief showing a previous agent's 38-line elif chain. Not yet implemented.

- **tunnel() for walls not yet implemented in move()** — The tunnel permanent tool is
  in AgentBridge but the move() function doesn't yet check `state.permanentCleared`
  for wall cells. Level 38 (Tunnel Vision) requires this to be added.

## File Inventory

- **Engine:** 4 files in `engine/` (OperatorEngine.js, AgentBridge.js, OperatorInterpreter.js, TerminalInterpreter.js) + operator.css
- **Configs:** 50 Python configs + 24 terminal configs in `configs/`
- **Missions:** 50 Python loaders + 24 terminal loaders in `missions/`
- **Hub:** `index.html` with language tabs (ALL/TERMINAL/PYTHON) and 6 Python tiers
- **Archive:** 3 archived configs in `configs/_archive/` (original L1-3)
- **Planning:** `_planning/OPERATOR_PYTHON_V2_METROIDVANIA.md`, `_planning/OPERATOR_WORLD_MAP_PART_I.md`

---

*Inspired by Metroid II: Return of Samus (Game Boy, 1991). Designed in a marathon
session on 2026-04-05. Part I complete (50 levels). Part II (levels 51-100) planned.*
