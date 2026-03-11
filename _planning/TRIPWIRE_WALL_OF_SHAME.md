# TripWire + Wall of Shame -- Implementation Plan

**Status:** PLANNED (Sprint ready)
**Created:** 2026-03-11

## Concept

Honeypot defense system. Instead of silently blocking attack attempts, the system detects, neutralizes, logs, and publicly displays caught attempts on a "Wall of Shame." Getting caught becomes an achievement with a badge.

## Architecture

```
+------------------------------------------------------------------+
|                         BROWSER RUNTIME                           |
|                                                                   |
|  +------------------------------------------------------------+  |
|  |                    TripWire.js (IIFE)                       |  |
|  |  Self-initializes on <script> load, zero config needed      |  |
|  |                                                              |  |
|  |  +----------+  +----------+  +----------+  +-----------+   |  |
|  |  | SENSOR:  |  | SENSOR:  |  | SENSOR:  |  | SENSOR:   |   |  |
|  |  | Storage  |  | Runtime  |  | DOM      |  | Console   |   |  |
|  |  | Integrity|  | Freeze + |  | Mutation |  | Injection |   |  |
|  |  |          |  | Proxy    |  | Observer |  | Detect    |   |  |
|  |  +----+-----+  +----+-----+  +----+-----+  +-----+-----+   |  |
|  |       |              |              |               |        |  |
|  |  +----+-----+  +----+-----+  +----------+                  |  |
|  |  | SENSOR:  |  | SENSOR:  |  | SENSOR:  |                  |  |
|  |  | Timer    |  | Decoy    |  | XSS      |                  |  |
|  |  | Guard    |  | Flags    |  | Pattern  |                  |  |
|  |  +----+-----+  +----+-----+  +----+-----+                  |  |
|  |       |              |              |                        |  |
|  |  +----+--------------+--------------+--------+              |  |
|  |  |         TripWire._dispatch(event)         |              |  |
|  |  |  - Log to hexworth_tripwire_log            |              |  |
|  |  |  - Revert to last known good state         |              |  |
|  |  |  - Fire custom event 'hexworth:tripwire'   |              |  |
|  |  |  - Unlock achievement via Registry          |              |  |
|  |  |  - Send to Firestore (anonymized)           |              |  |
|  |  +------+------------------------------------+              |  |
|  +-----------|----------------------------------------------+  |  |
|              v                                                   |
|  +------------------------------------------------------------+  |
|  |                   WallOfShame.js (IIFE)                     |  |
|  |  - Renders wall-of-shame/index.html                         |  |
|  |  - Reads hexworth_tripwire_log (local detail)               |  |
|  |  - Reads Firestore tripwire_events (global anonymized)      |  |
|  |  - CRT/hacker aesthetic                                     |  |
|  +------------------------------------------------------------+  |
+------------------------------------------------------------------+
```

## File Inventory

### New Files (5)
| File | Purpose | Est. Lines |
|------|---------|-----------|
| `_app/components/TripWire.js` | Detection engine -- 7 sensors, dispatch, state | ~650 |
| `_app/components/WallOfShame.js` | Display component, Firestore sync, render API | ~400 |
| `_app/wall-of-shame/index.html` | Wall page -- CRT aesthetic, entries, leaderboard | ~350 |
| `_app/css/wall-of-shame.css` | CRT flicker, scanlines, green-on-black | ~200 |

### Modified Files (8)
| File | Change |
|------|--------|
| `_app/components/FluxCapacitor.js` | Auto-load TripWire.js (same pattern as HED.js) |
| `_app/components/AchievementSystem.js` | Add 9 TripWire achievement definitions |
| `_app/components/AchievementRegistry.js` | Add tripwire category |
| `_app/components/XPCalculator.js` | Cross-reference tripwire_log in integrity check |
| `_app/arena/engine/BoxEngine.js` | Decoy flag detection in submitFlag() |
| `_app/operator/engine/OperatorEngine.js` | Decoy command support |
| `firestore.rules` | tripwire_events + tripwire_stats collections |
| `_app/config/version.json` | Version bump |

## Sprint Waves

### Wave 1: Foundation (2 parallel agents)
- **T1**: TripWire.js core + Sensors 1-3 (Storage, Runtime, DOM) ~3h
- **T2**: Firestore rules + schema ~1h

### Wave 2: Remaining Sensors (2 parallel agents)
- **T3**: Sensors 4-5 (Console + Timer) ~2h
- **T4**: Sensors 6-7 (Decoy + XSS) ~2h
- Depends on: T1

### Wave 3: Wall of Shame (1 agent)
- **T5**: WallOfShame.js display component ~2h
- **T6**: wall-of-shame/index.html + CSS ~2h
- Depends on: T1, T2

### Wave 4: Integration + Achievements (3 parallel agents)
- **T7**: Achievement definitions (9 badges) ~1h
- **T8**: FluxCapacitor auto-load ~30min
- **T9**: Engine integration (BoxEngine, Operator, XPCalc) ~1h
- Depends on: T1, T5

### Wave 5: Polish + Validation (1 agent)
- **T10**: EduScan compliance, functional testing ~1h
- Depends on: All previous

## Sensor Specifications

### Sensor 1: Storage Integrity (`storage`)
- Protects: hexworth_progress, hexworth_achievements, hexworth_xp, etc.
- Mechanism: Checksum (simpleHash of key+value+sessionSalt) stored in closure, polled every 3s
- Wraps Storage.prototype.setItem with "authorized write" microtask flag
- On trip: revert to last known good value, dispatch event

### Sensor 2: Runtime Object Manipulation (`runtime`)
- Protects: BoxEngine.state, OperatorEngine state, XPCalculator rates
- Mechanism: Object.freeze on critical sub-objects + Proxy set traps with stack trace check
- API: TripWire.protect(obj, key, options) -- engines call after init
- On trip: reject assignment, dispatch event

### Sensor 3: DOM Manipulation (`dom`)
- Protects: Elements with `data-protected` attribute
- Mechanism: MutationObserver on document.body, filtered to protected elements only
- On trip: revert to cached textContent, dispatch event

### Sensor 4: Console Injection (`console`)
- Protects: AchievementManager.unlock, ProgressManager.completeModule, etc.
- Mechanism: Proxy wrapper with Error().stack inspection for expected origins
- Heuristic detection -- bypassable, that's fine (educational)

### Sensor 5: Timer Manipulation (`timer`)
- Protects: Game timers, timed challenges
- Mechanism: Native refs at load time, heartbeat check (1000ms expected), Date.now vs performance.now drift
- On trip: flag session, dispatch event

### Sensor 6: Decoy Flags (`decoy`)
- Plants: HTML comments, hidden JS variables, BoxEngine config decoyFlags[]
- Real flags use HEX{...}, decoys use FLAG{NICE_TRY_...}
- On trip: instant Wall entry with HONEYPOT label

### Sensor 7: XSS Pattern Detection (`xss`)
- Regex bank on input fields OUTSIDE legitimate CTF contexts
- Excludes .arena-terminal, .operator-editor
- On trip: log but don't block (educational)

## Achievement Definitions (9 badges, all secret: true)

| ID | Name | Trigger | Points |
|----|------|---------|--------|
| tripwire_busted | Busted! | First catch (any sensor) | 50 |
| tripwire_repeat | Repeat Offender | Caught 3 times | 75 |
| tripwire_script_kiddie | Script Kiddie | Console injection caught | 50 |
| tripwire_manipulator | The Manipulator | DOM tampering caught | 50 |
| tripwire_storage_raider | Storage Raider | localStorage tampering caught | 50 |
| tripwire_time_bandit | Time Bandit | Timer manipulation caught | 50 |
| tripwire_decoy_victim | Decoy Victim | Submitted honeypot flag | 100 |
| tripwire_xss_artist | XSS Artist | XSS attempt outside lab | 50 |
| tripwire_hall_of_fame | Hall of Fame | 5+ different sensors triggered | 250 |

Hall of Fame grants title: "the Notorious"

## Wall of Shame Page Design

- Green-on-black CRT theme with scanline overlay
- Left panel: "YOUR RAP SHEET" (local entries with full detail)
- Right panel: "GLOBAL STATS" (anonymized Firestore counts by method)
- Top 10 Creative Attempts leaderboard
- Running counter animation (total incidents site-wide)
- Achievement badges display at bottom
- Responsive: stacked on mobile

## Firestore Schema

```
tripwire_events/{auto-id}:
  uid: hashed-firebase-uid
  method: string (sensor name)
  category: string (attack class)
  detail: string (sanitized)
  timestamp: serverTimestamp
  nonce: string
  sessionId: string

tripwire_stats/global:
  totalCaught: number (increment)
  methodCounts: { storage: N, runtime: N, dom: N, ... }
  lastEvent: timestamp
```

## Security Rules
- tripwire_events: auth create only, field whitelist, admin read only
- tripwire_stats: auth read, Cloud Function write only
- Rate limit: max 10 events per user per hour

## Design Philosophy

**Educational, not punitive:**
- 1st offense: "Flagged and logged. Welcome to the Wall."
- 3rd offense: "You clearly enjoy this. Have a badge."
- 5+ sensors: "Hall of Fame inductee. Impressive range."
- XP never permanently reduced. Progress never deleted.
- The "punishment" IS the achievement -- students will WANT to collect them.

---
*"Getting caught is the first step to understanding defense."*
