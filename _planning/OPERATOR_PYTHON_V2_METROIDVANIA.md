# Operator Python v2 — Metroidvania Design Document

**Created:** 2026-04-05
**Status:** APPROVED (adversarial-reviewed, PROCEED verdict)
**Authors:** EQ + Claude Code
**Origin:** Multi-hour design session. Three earlier designs rejected before this one emerged.
**Inspiration:** Metroid II: Return of Samus (Game Boy, 1991)

---

## 1. The Core Insight

**Python language features ARE the game mechanics.** Not "learn Python then play a game."
The Python IS the game.

| Game Concept | Python Reality |
|-------------|---------------|
| Equipping a weapon | `gun = agent.terminate` (variable assignment) |
| Building a toolkit | `toolkit = {'fire': agent.extinguish, 'hole': agent.jump}` (dictionary) |
| Automated combat | `toolkit[threat](direction)` (dispatch table) |
| Patrol sweep | `for node in agent.scan():` (for loop + iteration) |
| Crafting a reusable tool | `def safe_advance(dir):` (function definition) |
| Loading a weapon rack | First-class functions assigned to variables |

The student who writes a dispatch table didn't learn "dispatch tables" from a
textbook. They built one because the game made 10-branch if/elif chains unbearable.
The dictionary IS the inventory. The variable IS the weapon. The for loop IS the
patrol. The game taught them real programming patterns through necessity.

---

## 2. Metroidvania Architecture

### The World Is Not Linear

Levels are NOT a ladder. They are a **dependency web**. Progress in level 28 unlocks
the path forward in level 8, which gives you the tool to finish level 22.

```
Level 28 (earn bridge) → Level 8 (bridge hole, find terminate) → Level 22 (terminate villain, exit)
```

The student doesn't know this path. They discover it by:
1. Hitting a wall they can't pass
2. Remembering obstacles they saw in earlier levels
3. Connecting the dots when they earn a new tool
4. Going back and completing what was previously impossible

### Level Completion States

Each level has THREE states:

| State | Meaning | Hub Display |
|-------|---------|-------------|
| **Incomplete** | Required objectives not done | Empty card |
| **Partial** | Required objectives done, bonus locked | "3/4 objectives" with lock icon |
| **Complete** | All objectives including bonus | Green checkmark |

### Hard Blocks

Some levels have required objectives that NEED tools from other levels. The student
MUST leave, progress elsewhere, earn the tool, and return. This is not a bug — it's
the game telling them "you're not ready yet."

The hub shows WHY a level is blocked: "Requires: terminate tool (earned in levels 14-16)"

---

## 3. Tool System

### Two Tiers of Tools

**Per-transit countermeasures** (basic, available early):
- `agent.jump(dir)` — clear one crossing over a hole. Hole remains for return trip.
- `agent.extinguish(dir)` — put out fire for one crossing. Fire remains.
- `agent.fight(dir)` — defeat enemy for one crossing. Enemy remains.
- `agent.sweep(dir)` — disarm trap. (Already exists.)

**Permanent tools** (earned in later levels, usable everywhere):
- `agent.bridge(dir)` — fills hole permanently. No more jumping needed.
- `agent.fireproof(dir)` — fireproofs a path permanently. Walk through freely.
- `agent.tunnel(dir)` — bypasses a wall. Creates permanent passage.
- `agent.terminate(dir)` — permanently removes an enemy/villain.

### Persistent Inventory

Tools earned in ANY level are saved to persistent storage and available in ALL levels:

```python
print(agent.tools)
# ['bridge', 'fireproof', 'terminate']

# Student assigns tool to a variable — THIS IS EQUIPPING
gun = agent.terminate
gun('east')  # kills the villain

# Student builds a toolkit dictionary — THIS IS THE WEAPON RACK
toolkit = {
    'rogue': agent.terminate,
    'fire': agent.extinguish,
    'hole': agent.jump,
    'guard': agent.fight
}

# Student writes a dispatch loop — THIS IS AUTOMATED COMBAT
for node in agent.scan():
    for threat in toolkit:
        if threat in node['name'].lower():
            toolkit[threat](node['direction'])
```

### Storage

```
localStorage key: hexworth_operator_inventory
Value: { tools: ['bridge', 'terminate', 'fireproof'], earnedIn: { bridge: 'python-28', ... } }
```

**CRITICAL (Nancy concern #1):** Must sync to Firebase Auth session for cross-device
persistence. Students use multiple devices. Lost inventory = broken Metroidvania loop.
Use the same pattern as ModuleProgress Firestore sync.

---

## 4. Obstacle System

### Obstacle Types

| Obstacle | Cell Type | Walk Into Without Clearing | Countermeasure | Permanent Tool |
|----------|-----------|---------------------------|---------------|---------------|
| Trap | `honeypot`, `ids-trap` | -1 integrity, bounced | `sweep(dir)` | — |
| Hole | `hole-*` | -1 integrity, bounced | `jump(dir)` | `bridge(dir)` |
| Fire | `fire-*` | -1 integrity, bounced | `extinguish(dir)` | `fireproof(dir)` |
| Enemy | `enemy-*` | -1 integrity, bounced | `fight(dir)` | `terminate(dir)` |
| Wall | `wall` | Blocked, no damage | — | `tunnel(dir)` |
| Locked Door | `locked-*` | Blocked, no damage | `unlock(dir)` + key item | — |

### Bounce Behavior (Locked)

Pre-move reject. Check happens BEFORE state.position is updated.
Agent stays in place. Integrity decremented. Move returns `false`.
Same pattern as existing trap check (AgentBridge.js lines 229-258).

### Per-Transit vs Permanent

- **Per-transit** (jump/extinguish/fight): Marks `state.jumpedCells[destKey] = true`.
  Cleared for THIS crossing. Obstacle remains on the grid for return trips.
- **Permanent** (bridge/fireproof/terminate): Marks `state.permanentCleared[destKey] = true`.
  Obstacle removed from grid permanently. Saved to mission state.

### Config Format

```javascript
var CONFIG = {
    // ... existing fields ...
    traps: ['honeypot', 'ids-trap'],           // existing — sweep to disarm
    obstacles: {                                // NEW
        holes: ['hole-1', 'hole-2'],            // jump or bridge to cross
        fires: ['fire-1'],                      // extinguish or fireproof to clear
        enemies: ['enemy-guard', 'enemy-drone'] // fight or terminate to defeat
    }
};
```

Obstacle nodes defined in `nodes{}` like any other node. Labels must contain
the obstacle type keyword (HOLE, FIRE, GUARD/ENEMY) for scan() string matching.

---

## 5. Dispatch Table Emergence

### The Pedagogical Arc

**Levels 18-20:** Introduce obstacles one at a time.
Student writes: `if 'HOLE' in name: agent.jump(dir)` — single if statement.

**Levels 21-25:** Multiple obstacle types per level.
Student writes:
```python
if 'HOLE' in name:
    agent.jump(dir)
elif 'FIRE' in name:
    agent.extinguish(dir)
elif 'GUARD' in name:
    agent.fight(dir)
elif 'TRAP' in name:
    agent.sweep(dir)
```
This works. But it's 8+ lines per scan result. It's clunky.

**Levels 26-30:** Obstacle density increases. 6+ types per level.
The elif chain becomes 20+ lines. The student FEELS the pain.

**Level 31:** The nudge. Mission briefing or output hints:
"10 obstacles processed in 47 lines. Operators use 8."

**Levels 32+:** The student discovers the dispatch table:
```python
toolkit = {
    'hole': agent.jump,
    'fire': agent.extinguish,
    'guard': agent.fight,
    'trap': agent.sweep
}
for node in agent.scan():
    for threat in toolkit:
        if threat in node['name'].lower():
            toolkit[threat](node['direction'])
```

They didn't learn "dispatch tables." They NEEDED one.

### After the Dispatch Table (Nancy concern #3)

Post-dispatch-table curriculum (levels 35+):
- **Nested dicts:** obstacles with properties (damage amount, tool cost)
- **Parameterized tools:** `agent.fight(dir, weapon='emp')` — different weapons for different enemies
- **Function composition:** combining tools — `bridge_and_cross(dir)` that bridges then moves
- **State machines:** enemies with patterns (patrol routes the student must predict)

Architecture must not prevent these future extensions.

---

## 6. Level Progression (50 levels)

### Phase 1: Foundations (Levels 1-17) — BUILT, LIVE
Current levels. Traps only. Learn Python basics: loops, conditionals, functions, lists.
**Modification:** Add bonus objectives behind obstacles that require tools from later levels.
Main path and required objectives stay untouched.

### Phase 2: Obstacles (Levels 18-25)
Introduce new obstacle types one at a time:
- Level 18: Holes introduced. `agent.jump(dir)`.
- Level 19: Fires introduced. `agent.extinguish(dir)`.
- Level 20: Enemies introduced. `agent.fight(dir)`.
- Level 21: Locked doors + keys. `agent.unlock(dir)`.
- Level 22-25: Combined obstacles. Multiple types per level. If/elif chains grow.

### Phase 3: Permanent Tools (Levels 26-35)
Earn permanent tools. Metroidvania backtracking begins.
- Level 26: Earn `bridge`. Go back to earlier levels, cross holes permanently.
- Level 28: Earn `fireproof`. Earlier fire obstacles now trivial.
- Level 30: Earn `terminate`. Villains in earlier levels can be permanently removed.
- Level 31: Nudge toward dispatch table.
- Level 32-35: Dispatch table is the expected solution. Obstacle density demands it.

### Phase 4: Mastery (Levels 36-50)
Full Metroidvania. Complex dependency web. Advanced Python patterns emerge naturally.
- Nested dispatch tables
- Parameterized combat
- Function composition
- World-level puzzles spanning multiple levels
- Hard blocks requiring backtracking
- 100% completion requires tools from across the entire game

---

## 7. Hub Design

### Tab System (Already Built)
- ALL tab: Everything
- TERMINAL tab: Terminal missions only
- PYTHON tab: Python missions with their own tier structure

### Level Card States
```
[empty circle]     Incomplete — not attempted or required objectives pending
[3/4 + lock icon]  Partial — main objectives done, bonus requires tool
[checkmark]        Complete — all objectives including bonus
[red lock]         Blocked — required objective needs tool from another level
```

### Dependency Hints (Nancy concern #2)
When a level is blocked or has a locked bonus objective, the hub shows:
"Requires: [tool name] — earned in levels [X-Y]"

Not a walkthrough. Just enough to point the student in the right direction.

---

## 8. Technical Implementation

### Engine Changes (AgentBridge.js)

**New methods (~40 lines each, following sweep() pattern):**
- `jump(dir)` — marks `state.jumpedCells[key]`
- `extinguish(dir)` — marks `state.extinguishedCells[key]`
- `fight(dir)` — marks `state.defeatedEnemies[key]`
- `bridge(dir)` — marks `state.permanentCleared[key]`, requires 'bridge' in inventory
- `fireproof(dir)` — marks `state.permanentCleared[key]`, requires 'fireproof' in inventory
- `terminate(dir)` — marks `state.permanentCleared[key]`, requires 'terminate' in inventory
- `unlock(dir)` — marks `state.unlockedDoors[key]`, requires 'key' in `state.items`

**New obstacle checks in move() (~30 lines):**
Same pattern as existing trap check. Pre-move reject. One block per obstacle type.

**destKey helper (Nancy concern — MUST centralize):**
One function `_resolveDestKey(dir)` used by BOTH move() and all countermeasure methods.
No duplicated coordinate math.

**Persistent inventory:**
- Read on init: `JSON.parse(localStorage.getItem('hexworth_operator_inventory'))`
- `agent.tools` property: getter returns the tools array
- Write on tool earn: append to inventory, save to localStorage + Firestore

### Engine Changes (OperatorEngine.js)

**New state fields in createState():**
```javascript
state.jumpedCells = {};
state.extinguishedCells = {};
state.defeatedEnemies = {};
state.permanentCleared = {};
state.unlockedDoors = {};
state.items = [];  // collectible items (keys, etc.)
```

**Save/load:** Add all new fields alongside existing scannedCells pattern.

### CSS (operator.css)

New cell type styles:
- `hole` — dark void, danger red border
- `fire` — orange/red with flicker animation
- `enemy-*` — red with threat icon
- `locked-*` — gold with lock icon
- `tool-*` — cyan/green with sparkle (pickup nodes)

### Files Changed

- `engine/AgentBridge.js` — new methods + obstacle checks + inventory (~200 lines)
- `engine/OperatorEngine.js` — new state fields + save/load (~20 lines)
- `engine/operator.css` — new cell type styles (~30 lines)
- `index.html` — level card states + dependency hints (~40 lines)
- Existing level configs — add bonus objectives + obstacle cells (~5 lines each)
- New level configs (18-50) — full obstacle + tool + Metroidvania design

### Files NOT Changed

- `engine/OperatorInterpreter.js` — Python interpreter unchanged
- `engine/TerminalInterpreter.js` — terminal missions unchanged
- All terminal mission configs — completely untouched
- All terminal mission loaders — completely untouched

---

## 9. Adversarial Review Summary

### Verdict: PROCEED

Nancy's assessment: *"This is genuinely good. The core insight — that the language
construct IS the mechanic, not the subject matter OF the mechanic — is the thing
that separates this from every gamified coding product that has failed before."*

### Concerns Addressed

| Concern | Resolution |
|---------|-----------|
| localStorage fragile across devices | Sync inventory to Firebase Auth session (same as ModuleProgress) |
| "Where do I go?" when blocked | Hub shows "Requires: [tool] — earned in levels [X-Y]" |
| Dispatch table is one-time discovery | Post-dispatch curriculum planned: nested dicts, parameterized tools, composition |
| Pain before awareness = rage-quit | Nudge mechanism at level 31: briefing hints + output comparison |
| destKey computation must be centralized | Single `_resolveDestKey(dir)` helper shared by move() and all methods |
| Cleared-forever vs per-transit | Per-transit for basic tools, permanent for advanced tools. Both coexist. |

### Previous Rejected Designs

1. **RPG inventory system** — Rejected: two overlapping access control systems (tier + inventory)
2. **Game verbs (fight/jump/extinguish) without context** — Rejected: teaches game mechanics, not Python
3. **Bigger grids with same obstacles** — Rejected: scale ≠ complexity, same strategy at every level

The current design resolves all three: one access control system (inventory replaces
tiers for Python), game mechanics ARE Python concepts, and obstacle variety forces
genuine strategy evolution.

---

## 10. Success Criteria

A level is "done" when:
1. Required objectives are completable with tools available at that point in the game
2. Bonus objectives are completable ONLY with tools from specific later levels
3. Hard blocks clearly indicate what tool is needed and where to find it
4. The level teaches (or requires) a specific Python pattern through gameplay
5. The if/elif → dispatch table arc is not shortcut by level design
6. Reference solution exists and runs in the interpreter
7. QC verified: syntax, grid dimensions, node definitions, completability

The game is "done" when:
1. 50 levels form a complete dependency web
2. Every permanent tool has at least 3 levels where it unlocks content
3. The dispatch table emergence happens naturally between levels 26-32
4. 100% completion requires backtracking to at least 10 earlier levels
5. A student can complete the game without external help (all hints in-game)

---

*This document captures the complete Metroidvania design for Operator Python v2.
The design was adversarial-reviewed and approved. Build from this spec.*
