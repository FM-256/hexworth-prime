# Operator Missions

**Status:** SHIPPED
**Components:** `OperatorEngine.js`, `OperatorInterpreter.js` (Python), `TerminalInterpreter.js` (CLI), `AgentBridge.js` (agent tier API)
**Location:** `_app/operator/` (24 missions), `_app/operator/engine/` (4 engine files)
**Added:** v5.0.0
**Last reviewed:** 2026-04-05

## Purpose

Operator Missions are config-driven, grid-based terminal challenges. Students navigate
a fog-of-war grid, discover network nodes, exploit vulnerabilities, and complete objectives
using either Python scripts or terminal commands. Each mission simulates a real offensive
or defensive scenario — corporate AD breaches, EDR bypasses, C2 beacons, forensic
investigations, firewall hardening.

Unlike CTF Arena boxes (which simulate a full filesystem), Operator missions focus on
tactical movement through a network topology with an integrity meter that punishes
mistakes.

## Architecture

```
Mission config (JSON)
  |-- Grid: 2D cell array with node types, walls, traps, gates
  |-- Nodes: Network devices with IPs, ports, OS, vulnerabilities
  |-- Objectives: Boolean conditions evaluated against game state
  |-- Completion: Storage keys, XP hooks
  |
  v
OperatorEngine.js (state machine + renderer)
  |-- Grid rendering (CSS Grid, fog-of-war, cell states)
  |-- State management (position, visibility, integrity, objectives)
  |-- Save/load (localStorage per-mission)
  |-- Completion flow (overlay, stats, ModuleProgress, GameTracker)
  |
  v
Interpreter (one of two modes)
  |-- OperatorInterpreter.js → Python missions (tokenize → parse → interpret)
  |-- TerminalInterpreter.js → CLI missions (config-driven command dispatcher)
  |
  v
AgentBridge.js (OP-6 Tier Framework)
  |-- Tier 1: move, scan
  |-- Tier 2: sweep, ping
  |-- Tier 3: nmap, exploit
  |-- Tier 4: spoof, decrypt
  |-- Tier 5: patch (defensive)
```

## Mission Inventory (24 Missions)

| Category | Count | Examples |
|----------|-------|---------|
| Python Ops | 4 | Corporate AD breach, EDR bypass, C2 beacons, honeypots |
| Network Recon | 3 | Topology mapping, firewall bypass |
| Incident Response | 3 | Breach containment scenarios |
| Forensics | 3 | Digital evidence collection |
| Log Analysis | 2 | Forensic log investigation |
| Crypto | 2 | Cryptographic operations |
| Firewall Ops | 2 | Perimeter hardening |
| Windows Admin | 2 | Windows command operations |
| Linux Filesystem | 3 | File system operations |

**Input modes:** 4 Python missions use OperatorInterpreter (full Python lexer with
INDENT/DEDENT), 20 terminal missions use TerminalInterpreter (custom command handlers
per mission config).

## Grid System & Fog of War

Missions play out on a 2D grid (typically 6x6 to 10x10):

- **Cell types:** empty, wall, node (device), trap, gate, start
- **Visibility states:** hidden (fog), revealed (adjacent to visited), visited (player has been there)
- **Fog of war:** `revealAdjacent()` exposes neighboring cells with a 500ms `just-revealed` animation
- **Traps:** Cells that reduce integrity when stepped on
- **Gates:** Locked cells requiring specific methods/flags to bypass (e.g., exploit a vulnerability first)

### Node Types

Each grid node represents a network device:
```javascript
{
  label: "Web Server",
  abbr: "WEB",
  ip: "10.0.1.5",
  desc: "Apache 2.4 running on Ubuntu",
  ports: [22, 80, 443],
  os: "Ubuntu 22.04",
  vuln: "CVE-2024-XXXX",
  vulnDesc: "Remote code execution via mod_cgi"
}
```

Nodes are resolved by fuzzy matching (type, label, IP, abbreviation) when agents
reference them in commands.

## Integrity Meter

A pip-based health system that punishes mistakes:

- **Default:** 3 pips (configurable per mission)
- **Triggers:** Stepping on traps, failed exploits, wrong commands
- **Critical warning:** Visual alert at <=1 pip
- **Zero integrity:** Mission failure

This teaches operational security — in a real engagement, getting caught has consequences.

## Objective System

Objectives are boolean conditions evaluated against game state:

```javascript
objectives: [
  { id: "discover_dc", label: "Discover Domain Controller", check: "nodesDiscovered.has('dc')" },
  { id: "exploit_web", label: "Exploit Web Server", check: "state.webExploited === true" },
  { id: "exfil_data", label: "Exfiltrate Target Data", check: "state.dataExfiltrated === true" }
]
```

`evaluateCheck()` supports: `Set.has()`, `.size` comparisons, `Array.indexOf()`,
boolean flags, numeric comparisons, and AND/OR logic.

## Server-Side Validation

Mission completion uses SEC-4 validation:

1. `buildStateSnapshot()` serializes game state (objectives, integrity, nodes discovered)
2. Calls `FirebaseAuth.callFunction('validateMissionCompletion')` with snapshot
3. Server verifies objective completion is legitimate
4. XP awarded only after server validation
5. **Offline fallback:** Local completion accepted but XP deferred

## Storage

| Key | Purpose |
|-----|---------|
| `hexworth_operator_{id}_save` | Auto-save (position, visibility, objectives, integrity) |
| `hexworth_operator_{id}` | Completion stats (time, commands, nodes, integrity) |
| `hexworth_operator_skip_briefing` | Skip briefing screen preference |

## Completion Flow

```
All objectives met
  |-- Overlay: stats (nodes discovered, commands used, time, integrity remaining)
  |-- ModuleProgress.complete(missionId)
  |-- GameTracker.record(missionId, { result, time, commands, integrity })
  |-- Server validation (SEC-4) → XP award
```

## Editor UI

Missions include a code editor with:
- Toolbar: RUN / STOP / CLEAR OUTPUT / RESET
- Line numbers with syntax highlighting
- Tab = 4 spaces
- Ctrl+Enter / Cmd+Enter runs code
- Output console: typed lines (system/error/warning/success/info), 200-line cap

## Key Decisions

- **Config-driven missions** — All mission content (grid, nodes, objectives, traps, gates)
  is defined in JSON config files. The engine is generic; adding a new mission requires
  zero engine changes. This separates content authoring from engine development.

- **Two interpreter modes** — Python missions use a real lexer with INDENT/DEDENT
  handling. Terminal missions use a simpler command dispatcher. The split exists because
  Python ops require multi-line script execution while terminal ops need single-command
  responsiveness.

- **Integrity meter over health points** — A small pip count (3-5) makes every mistake
  meaningful. This mirrors real penetration testing where detection = mission failure,
  not just damage.

- **Agent tier progression** — The OP-6 framework progressively unlocks commands as
  students demonstrate proficiency. Tier 1 students can only move and scan; Tier 5
  unlocks defensive patching. This prevents students from brute-forcing missions.

- **Server-side completion validation** — Prevents client-side objective manipulation.
  Students can't set `state.dataExfiltrated = true` in the console and claim completion.

## Known Limitations

- **No mission editor** — Missions are JSON files authored manually. No visual editor
  for creating grids, placing nodes, or defining objectives. New missions require
  developer intervention.

- **Grid size limits** — Large grids (>10x10) become unwieldy on mobile. No responsive
  scaling for the grid cells — they're fixed-size CSS Grid items.

- **No multiplayer** — Missions are strictly single-player. No co-op mission mode exists
  (unlike CTF Arena which has CoOpSync). Adding co-op would require real-time state
  synchronization for grid position and fog of war.

- **Python interpreter limitations** — OperatorInterpreter handles basic Python
  (variables, loops, conditionals, functions) but not the full language. No imports,
  no classes, no list comprehensions. Sufficient for mission scripts but not general
  Python execution.
