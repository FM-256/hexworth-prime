# Operator Python Mission Expansion — Design Document

**Created:** 2026-04-05
**Status:** PLANNING (adversarial-reviewed, scoped to Phase 1)
**Author:** EQ + Claude Code
**Session context:** Marathon session — docs consolidation, Net+ commenting, Operator hub UX improvements completed same night

---

## 1. Problem Statement

The 4 current Python Operator missions (PYTHON-01 through PYTHON-04) are config stubs
that don't deliver on their tier promises. All 4 use identical 4x5 grids, have 4-5
objectives, and are solvable with sequential `agent.move()` calls. No mission requires
conditionals, loops, functions, or variable usage — despite the interpreter supporting
all of these.

| Tier | Hub Promise | Reality |
|------|-----------|---------|
| 1 "Sequencing" | One command at a time | Correct — sequential move/scan/nmap |
| 2 "Decision Making" | Traps punish blind navigation | Partially — traps exist but scan() always disarms |
| 3 "Automation" | Grid too big for manual commands | **False** — 4x5 grid, 10 moves max |
| 4 "Architecture" | Build reusable code | **False** — same sequential pattern |

A student can solve every Python mission by typing `agent.move('east')` one line at a
time — making Python mode functionally identical to terminal mode.

---

## 2. Design Goal

**Force real Python programming through game design, not through quizzes or prompts.**

Students write Python scripts that chain commands. The grid is the game board. The agent
is the hero. Hazards and objectives create problems that can only be solved efficiently
with Python constructs:

- **Conditionals** — scan results vary; student must check before acting
- **Loops** — large grids make manual pathing impractical
- **Functions** — repeated patterns (scan-check-move) should be abstracted
- **Variables** — scan() and nmap() return data that must be stored and compared

The Python IS the gameplay. Not an afterthought.

---

## 3. Core Concept

Students write a Python program in the code editor. Click "Run." Watch the agent execute
the program on the grid — moving, scanning, exploiting, collecting — as an animated
sequence. The program is the strategy.

**Identity:** Field operative running scripted operations on hostile network grids.
NOT a platformer. NOT Mario. The cybersecurity skin is the value proposition.

**Progression:**
- Small grids → large grids (manual becomes impractical)
- Few hazards → many hazards (brute-force fails)
- Single objective → multi-objective (planning required)
- Flat scripts → structured programs (functions, loops, conditionals)

---

## 4. Adversarial Review Summary (2026-04-05)

The initial design proposed 10 levels with new engine verbs (jump, fight, extinguish),
a lives/energy system, collectibles, and villains. The adversarial reviewer flagged:

### Rejected Ideas
- **`agent.fight()`, `agent.jump()`, `agent.extinguish()`** — Game verbs that don't
  map to Python concepts or cybersecurity tools. `agent.nmap()` maps to a real tool.
  `agent.fight()` teaches nothing transferable.
- **Lives + Energy dual system** — Stacks cognitive load without clear Python payoff.
  Energy is resource budgeting, not programming.
- **10 levels in one session** — No reference solutions, no grid validation, no test
  harness. Each grid must be verified solvable by a real program in the interpreter.
- **Levels 9-10 promising "algorithmic optimization"** — Interpreter doesn't support
  imports, classes, or list comprehensions. Can't do real shortest-path without data
  structures.
- **Engine surgery on shared code** — OperatorEngine.js and AgentBridge.js serve all
  24 missions. Modifying them risks breaking terminal missions.

### Accepted Direction
- **Scale grids** (6x6, 7x7, 8x8) to force loops
- **Use EXISTING agent API** — no new verbs. Force Python through scenario design.
- **More complex trap/gate arrangements** that require scan() result inspection
- **Multi-objective missions** where order matters
- **Hidden nodes** that require systematic grid sweeps to discover
- **Can scan results + conditional logic alone drive the pedagogical goals?** YES.

---

## 5. Phase 1 Scope (3-5 Levels)

### Approach: No new engine verbs. Bigger grids. Smarter scenarios.

Use the existing 10 agent methods (move, scan, sweep, ping, nmap, exploit, spoof,
decrypt, patch, status) plus the existing read-only properties (position, discovered,
tier, commands) on grids large enough that sequential code fails.

### Pre-Implementation Checklist
- [ ] Verify grid renderer handles variable dimensions (test 6x6, 8x8 in browser)
- [ ] Verify CSS grid cells scale properly at larger sizes
- [ ] Confirm OP-6 tier table can accommodate new missions without changes
- [ ] Write reference solution for each level BEFORE building the config
- [ ] Test each reference solution in the OperatorInterpreter

### Level 3: PYTHON-03 "Sweep Protocol" (Tier 3, 6x6 grid)
**Concept:** Grid has 8+ nodes scattered across a 6x6 space with 3 traps hidden among
them. Student must scan before every move to avoid traps. Sequential move() without
scan() will hit traps and lose integrity.

**Python skill forced:** `if` statements. Student must check scan() results:
```python
result = agent.scan()
for node in result:
    if node['name'] == 'TRAP':
        agent.sweep(node['direction'])
    else:
        agent.move(node['direction'])
```

**Why it works:** The grid is small enough to navigate but has enough traps that
blind movement fails. scan() returns data the student must actually READ and ACT on.

### Level 4: PYTHON-04 "Grid Search" (Tier 3, 7x7 grid)
**Concept:** 5 data nodes are hidden in a 7x7 grid behind fog of war. Student must
discover all 5. Grid is too large to guess — must systematically sweep.

**Python skill forced:** `for` loop. Student writes a patrol pattern:
```python
for i in range(6):
    agent.move('east')
    agent.scan()
agent.move('south')
for i in range(6):
    agent.move('west')
    agent.scan()
```

**Why it works:** 49 cells. Manual move-by-move is 49+ lines. A nested sweep is 15 lines.
The grid size forces the loop.

### Level 5: PYTHON-05 "Adaptive Recon" (Tier 3, 7x7 grid)
**Concept:** Multiple gate types on the same grid (nmap gate + exploit gate + spoof gate).
Student must scan, identify the gate type, then call the right action.

**Python skill forced:** `if/elif/else` chains based on scan/nmap results:
```python
result = agent.nmap('target')
if result and result['vuln']:
    agent.exploit('target')
elif ...:
    agent.spoof('target')
```

**Why it works:** Different gates require different actions. The student can't hardcode
the solution because they must read the nmap output to decide.

### Level 6: PYTHON-06 "Patrol Route" (Tier 4, 8x8 grid)
**Concept:** Student must write a reusable function that scans, checks for traps,
and moves safely. Then call it repeatedly to traverse a long path.

**Python skill forced:** `def` function definition:
```python
def safe_advance(direction):
    result = agent.scan()
    for node in result:
        if node['direction'] == direction and 'TRAP' in node['name']:
            agent.sweep(direction)
    agent.move(direction)

for i in range(7):
    safe_advance('east')
```

**Why it works:** 64 cells with traps scattered throughout. Writing move+scan+check
for every cell is 200+ lines. A function reduces it to 10.

### Level 7: PYTHON-07 "Full Spectrum" (Tier 4, 8x8 grid)
**Concept:** Combines everything: large grid, multiple gate types, scattered traps,
multi-objective (discover 6 nodes + nmap 3 targets + bypass 2 gates). Must write
a structured program with functions and loops.

**Python skill forced:** Complete program with `def`, `for`, `while`, `if/elif`:
```python
def recon_row(direction, distance):
    for i in range(distance):
        safe_advance(direction)
        result = agent.scan()
        # process results...

# Sweep the grid row by row
for row in range(7):
    if row % 2 == 0:
        recon_row('east', 7)
    else:
        recon_row('west', 7)
    agent.move('south')
```

**Why it works:** The grid is large enough that a flat script is impractical. The
objective count is high enough that systematic sweeping is the only viable strategy.

---

## 6. Phase 2 Vision (Future — After Phase 1 Ships)

If Phase 1 validates the approach, Phase 2 could add:

- **Dynamic hazards** — trap positions change per session (config defines possible
  positions, engine randomizes on init). Forces runtime scan-and-decide, not memorization.
- **Timed objectives** — some nodes disappear after N commands. Forces efficiency.
- **Multi-agent** — student writes code for 2 agents cooperating on the same grid.
  Requires function decomposition and coordination logic.
- **Bounty scoring** — bonus points for fewer commands, no traps triggered, all nodes
  discovered. Leaderboard integration via GameTracker.
- **Custom cell types** (if justified) — but only if the existing API can't create the
  scenario. Game verbs are a last resort, not a first choice.

---

## 7. Open Questions

1. **Grid renderer at 8x8:** Has this been tested? CSS may need adjustment.
2. **scan() return value format:** Does the interpreter correctly handle the returned
   array of objects? Can students iterate it with `for node in result`?
3. **Randomized trap placement:** Can configs define a trap probability instead of
   fixed positions? This prevents solution-sharing between students.
4. **Reference solutions:** Who writes them? They must be tested in the actual
   interpreter, not just "looks right."
5. **Tier 5:** Should we add a new tier to the hub, or fit everything into Tier 3-4?

---

## 8. Files That Will Change

### New Files (Phase 1)
- `configs/python-03.config.js` (REPLACE existing)
- `configs/python-04.config.js` (REPLACE existing)
- `configs/python-05.config.js` (NEW)
- `configs/python-06.config.js` (NEW)
- `configs/python-07.config.js` (NEW)
- `missions/python-05.mission.html` (NEW)
- `missions/python-06.mission.html` (NEW)
- `missions/python-07.mission.html` (NEW)

### Modified Files (Phase 1 — HIGH CAUTION)
- `engine/AgentBridge.js` — possibly NO changes if existing API is sufficient
- `engine/OperatorEngine.js` — possibly grid size CSS only
- `engine/operator.css` — grid cell sizing for 6x6, 7x7, 8x8
- `index.html` — update TIERS data with new missions

### Files NOT Touched
- All 20 terminal mission configs
- All 20 terminal mission loaders
- `engine/OperatorInterpreter.js`
- `engine/TerminalInterpreter.js`
- PYTHON-01 config (Tier 1 stays)
- PYTHON-02 config (Tier 2 stays)

---

## 9. Success Criteria

A mission is "done" when:
1. The config defines a grid that is solvable
2. A reference solution exists that runs in OperatorInterpreter
3. The reference solution REQUIRES the target Python construct (loop, conditional, function)
4. A flat sequential script either fails or is impractically long (30+ lines for what a loop does in 5)
5. The mission has been manually tested in a browser
6. The hub page shows the new mission with correct subtitle and tier placement

---

*This document captures the full design conversation. Return fresh and build Phase 1
with precision. Verify the grid renderer first, then write reference solutions, then
build configs.*
