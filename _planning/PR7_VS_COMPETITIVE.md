# PR7 Competitive VS Mode — Architecture Document

## Overview

Transform Operation Shadowgate from a single-player perspective exercise into a live competitive Red vs Blue match. One team attacks while the other defends in real time. Red team actions generate live SIEM alerts on Blue team's console. Blue team containment actions disable Red team capabilities.

## Existing Infrastructure (Already Built)

| Component | Status | Lines | What It Does |
|-----------|--------|-------|-------------|
| CoOpSync.js | READY | 1,010 | Firestore real-time sync, VS mode with alpha/bravo teams, auto-balancing, atomic flag submission, winner detection |
| CoOpLobby.js | READY | 892 | Room creation (6-char code), join flow, player roster, host migration |
| CoOpUI.js | READY | 399 | Lobby overlay UI, player list, team assignment display |
| BlueTeam.js | READY | 1,702 | SOC device types: MonitoringDashboard, LogViewer, FirewallManager, IDSPanel |
| PR7 Config | READY | 1,163 | Both Red and Blue configs with shared scenario data |

## What Needs To Be Built

### 1. Event Bridge (NEW — ~300 lines)
`_app/arena/engine/VsBridge.js`

The missing piece. Translates Red team terminal commands into Blue team SIEM events in real time via Firestore.

```
Red types: nmap 192.168.1.100
  → Firestore event: { type: 'scan', src: '10.10.99.7', dst: '10.10.14.20', ports: '1-1000', timestamp }
    → Blue sees: SIEM alert "Port scan detected from 10.10.99.7"

Red types: curl "http://10.10.14.20/page.php?file=../../../etc/passwd"
  → Firestore event: { type: 'lfi_attempt', src: '10.10.99.7', path: '/etc/passwd', timestamp }
    → Blue sees: WAF alert "Directory traversal attempt blocked/detected"

Red types: ssh devops@10.10.14.20
  → Firestore event: { type: 'ssh_login', user: 'devops', src: '10.10.99.7', timestamp }
    → Blue sees: Auth alert "SSH login from external IP for devops account"
```

### 2. Containment Mechanics (NEW — ~200 lines)
Additions to PR7 config.js

Blue team actions that affect Red team state:
- `firewall block 10.10.99.7` → Disables Red's ability to reach the target
- `revoke-creds devops` → Disables Red's SSH access
- `isolate nexus-web01` → Cuts off the web server
- `kill-session` → Terminates Red's active connections

These write to Firestore. Red team's command handler checks containment state before executing.

### 3. VS Mode Selector Update (MODIFY — ~50 lines)
Update PR7 index.html

Add a third option to the mode selector:
- Red Team (solo)
- Blue Team (solo)
- **VS Mode (competitive)** → Opens CoOpLobby for room creation/joining

### 4. Live Scoreboard (NEW — ~100 lines)
Overlay showing both teams' progress in real time:
- Red: flags captured, current phase, time elapsed
- Blue: alerts triaged, containment actions taken, IOCs documented
- Shared countdown timer

### 5. Win Conditions
- **Red wins:** All 4 offensive flags captured before Blue contains
- **Blue wins:** Attacker fully contained (all 3 containment actions) + incident documented before Red completes exfil
- **Draw:** Time expires (configurable, default 30 min)

## Player Capacity

| Mode | Red Team | Blue Team | Total |
|------|----------|-----------|-------|
| Minimum | 1 | 1 | 2 |
| Recommended | 2 | 2 | 4 |
| Maximum | 4 | 4 | 8 |

Teams auto-balance on join (CoOpSync already handles this).

## Firestore Data Model

```
arena_sessions/{roomCode}
  ├── mode: 'vs'
  ├── boxId: 'pr7-red-vs-blue'
  ├── status: 'lobby' | 'active' | 'completed'
  ├── timer: { startedAt, durationMs: 1800000 }
  ├── winner: null | 'alpha' | 'bravo'
  ├── teams/
  │   ├── alpha (Red)/
  │   │   ├── players: { uid: { name, joinedAt } }
  │   │   ├── state: { score, flagsFound, currentPhase }
  │   │   └── containedBy: { firewall: false, creds: false, isolated: false }
  │   └── bravo (Blue)/
  │       ├── players: { uid: { name, joinedAt } }
  │       ├── state: { score, alertsTriaged, containmentActions, documented }
  │       └── siemAlerts: [ { type, src, dst, timestamp, triaged } ]
  └── eventBridge/
      └── events: [ { type, data, timestamp, fromTeam } ]
```

## Build Order

1. VsBridge.js — event translation layer
2. PR7 config containment mechanics
3. VS mode selector in index.html
4. Live scoreboard overlay
5. Integration testing
6. Deploy

## Estimated Scope

~650 lines of new code + ~200 lines of config modifications.

---

*Created: 2026-03-20*
