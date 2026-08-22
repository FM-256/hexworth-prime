# TripWire Defense System

**Status:** DEPLOYED (v3.0.0)
**Created:** 2026-03-11
**Files:** 5 new, 7 modified

## Overview

Honeypot defense system that detects student hacking attempts (localStorage manipulation, console injection, DOM tampering, timer fraud, XSS, decoy access) and responds with escalating visual/audio consequences. Educational, not punitive -- getting caught IS the achievement.

## Architecture

```
TripWire.js          Detects attempts (7 sensors), reverts changes, dispatches events
     |
     v
hexworth:tripwire    Custom DOM event fired on every detection
     |
     +---> TripWireEffects.js    Visual chaos + audio engine (10 escalating tiers)
     +---> WallOfShame.js        Renders rap sheet + global stats
     +---> AchievementRegistry   Unlocks secret badges
     +---> Firestore             Anonymized event log (admin-only read)
```

## File Inventory

### Core Files
| File | Purpose | Lines |
|------|---------|-------|
| `_app/components/TripWire.js` | Detection engine -- 7 sensors, dispatch, revert | ~750 |
| `_app/components/TripWireEffects.js` | Visual + audio consequences engine | ~800 |
| `_app/components/WallOfShame.js` | Wall of Shame display component | ~350 |
| `_app/wall-of-shame/index.html` | Wall page -- CRT aesthetic | ~270 |
| `_app/css/wall-of-shame.css` | CRT flicker, scanlines, green-on-black | ~370 |

### Modified Files
| File | Change |
|------|--------|
| `_app/components/FluxCapacitor.js` | Auto-loads TripWire.js + TripWireEffects.js |
| `_app/components/AchievementSystem.js` | 9 TripWire achievement definitions |
| `_app/components/AchievementRegistry.js` | `tripwire` category added |
| `_app/components/XPCalculator.js` | Cross-references tripwire_log in integrity check |
| `_app/arena/engine/BoxEngine.js` | Decoy flag detection in submitFlag() |
| `firestore.rules` | tripwire_events + tripwire_stats collections |

## Sensors (TripWire.js)

### Sensor 1: Storage Integrity (`storage`)
- **Protects:** hexworth_progress, hexworth_achievements, hexworth_xp, hexworth_streak, hexworth_stats, hexworth_house_completions, hexworth_game_tracker, gate1-13_complete
- **Mechanism:** Wraps `Storage.prototype.setItem` with stack trace inspection. Writes from DevTools console/eval are blocked and reverted. Writes from platform code pass through.
- **Poll:** Every 3s, checksums all protected keys against snapshot. Catches Application tab direct edits.
- **On trip:** Revert value, dispatch event, screen crack visual effect

### Sensor 2: Runtime Object Manipulation (`runtime`)
- **API:** `TripWire.protect(obj, key, opts)` -- Proxy set traps with stack trace check
- **On trip:** Reject assignment, dispatch event

### Sensor 3: DOM Manipulation (`dom`)
- **Protects:** Elements with `data-protected="true"` attribute
- **Mechanism:** MutationObserver on document.body
- **On trip:** Revert to cached textContent, dispatch event

### Sensor 4: Console Injection (`console`)
- **Wraps:** AchievementManager.unlock, AchievementSystem.unlock, ProgressManager.completeModule, XPCalculator.recalculate
- **Mechanism:** Error().stack inspection for eval/anonymous markers
- **On trip:** Dispatch event (does NOT block execution -- educational)

### Sensor 5: Timer Manipulation (`timer`)
- **Mechanism:** Native timer refs saved at load time. Heartbeat every 1000ms checks for anomalies. Cross-checks Date.now vs performance.now drift. Detects setTimeout/setInterval replacement.
- **Background tab handling:** Skips checks when `document.hidden === true` and ignores elapsed > 5s (browser throttling, not tampering)
- **On trip:** Flag session, dispatch event

### Sensor 6: Decoy Flags (`decoy`)
- **Plants:** `__hexworth_admin_key`, `__hexworth_debug_xp`, `__hexworth_flag_registry` on window via Object.defineProperty getters
- **Also plants:** HTML comment with fake admin_token
- **Real flags:** `HEX{...}`, decoys: `FLAG{NICE_TRY_...}`
- **BoxEngine integration:** submitFlag() checks for `FLAG{NICE_TRY` pattern
- **On trip:** Instant honeypot overlay + buzz sound

### Sensor 7: XSS Pattern Detection (`xss`)
- **Monitors:** All input/textarea elements via capture-phase `input` event
- **Regex bank:** script tags, event handlers, javascript: URIs, eval patterns
- **Excludes:** `.arena-terminal`, `.operator-editor`, `.operator-input` (legitimate CTF contexts)
- **On trip:** Log but don't block (educational)

## Escalating Effects (TripWireEffects.js v3.0.0)

### Visual Tiers
| Trip | Visual Effect | Duration |
|------|--------------|----------|
| 1 | Screen glitch + shake + warning toast + random elements spin | 3s |
| 2 | Fake trace terminal ("RESOLVING MAC ADDRESS... STUDENT IDENTIFIED") | 8s |
| 3 | Full ACCESS DENIED takeover with Wall of Shame link | 8s |
| 4 | Fake file deletion ("Deleting graduation_status.xml... done." then "Just kidding.") | 10s |
| 5 | Entire page flips upside-down | 8s |
| 6 | Windows BSOD ("Stop code: STUDENT_INTEGRITY_VIOLATION") with fake progress bar | 10s |
| 7 | "Calling campus security" terminal with fake radio chatter | 12s |
| 8 | Page slowly fades to nothing, then "WAS IT WORTH IT?" | 10s |
| 9 | Full Matrix rain takeover ("WAKE UP. The TripWire has you...") | 10s |
| 10+ | Forced redirect to Wall of Shame | 3s countdown |

### Special Visual Effects
| Trigger | Effect |
|---------|--------|
| Storage tampering | Screen cracks like broken glass + impact sound |
| Decoy/honeypot access | Gold HONEYPOT overlay + educational message |

### Audio Tiers (Web Audio API -- zero files, pure synthesis)
| Trip | Sound | Speech Synthesis |
|------|-------|-----------------|
| 1 | Sharp beep | -- |
| 2 | Dial-up modem screech + typing clicks | "Initiating trace protocol." |
| 3 | Klaxon alarm siren | "Access denied." |
| 4 | Hard drive grinding + typing clicks | "Deleting student data." ... "Just kidding." |
| 5 | Gravity whoosh (pitch sweep down + thud) | "Gravity anomaly detected." |
| 6 | Dark minor chord (BSOD "dunnn") | "Your Hexworth ran into a problem." |
| 7 | Phone ringing (3 rings) + typing clicks | "Calling campus security." ... "Unit en route." |
| 8 | Hospital flatline (beeps slow to monotone) | "Was it worth it?" |
| 9 | Cascading random tones + bass drone | "Wake up." ... "The TripWire has you." |
| 10+ | Air raid siren | "Redirecting to the wall of shame." |
| Storage | Glass crack + shatter tinkle | -- |
| Decoy | Angry bee buzz + warning sting | -- |

### Ambient Audio (every trip)
- **Heartbeat:** Escalating BPM (80 at tier 1 -> 180 at tier 5+)
- **Typing clicks:** Per-character clicks during terminal sequences
- **Console flood:** ASCII art + fake admin tracking messages

## Achievements (9 badges, all secret)

| ID | Name | Trigger | Points | Title |
|----|------|---------|--------|-------|
| tripwire_busted | Busted! | First catch (any sensor) | 50 | -- |
| tripwire_repeat | Repeat Offender | Caught 3 times | 75 | -- |
| tripwire_script_kiddie | Script Kiddie | Console injection | 50 | -- |
| tripwire_manipulator | The Manipulator | DOM tampering | 50 | -- |
| tripwire_storage_raider | Storage Raider | localStorage tampering | 50 | -- |
| tripwire_time_bandit | Time Bandit | Timer manipulation | 50 | -- |
| tripwire_decoy_victim | Decoy Victim | Honeypot flag submitted | 100 | -- |
| tripwire_xss_artist | XSS Artist | XSS attempt outside lab | 50 | -- |
| tripwire_hall_of_fame | Hall of Fame | 5+ different sensors | 250 | "the Notorious" |

## Wall of Shame Page

- **URL:** `/wall-of-shame/`
- **Theme:** Green-on-black CRT with scanline + flicker overlays
- **Left panel:** "YOUR RAP SHEET" -- local entries from hexworth_tripwire_log with severity badges and timestamps
- **Right panel:** "GLOBAL STATS" -- anonymized Firestore counts (admin-populated)
- **Badge grid:** Shows 9 TripWire achievements (locked/unlocked state)
- **Live updates:** Listens for `hexworth:tripwire` events, adds new entries in real-time
- **Responsive:** Stacks panels on mobile

## Firestore Schema

```
tripwire_events/{auto-id}:
  uid_hash:  string   (hashed UID, not raw)
  method:    string   (sensor name)
  category:  string   (attack class)
  detail:    string   (sanitized, max 200 chars)
  timestamp: serverTimestamp
  nonce:     string   (12 char random)
  sessionId: string   (per-session identifier)

tripwire_stats/{docId}:
  (Cloud Functions write only)
```

### Security Rules
- `tripwire_events`: auth create only, strict field whitelist, detail max 200 chars, admin read only
- `tripwire_stats`: auth read, Cloud Functions write only

## False Positive Prevention

### Storage Sensor
- **Stack trace inspection:** Only flags writes originating from DevTools console/eval (`<anonymous>`, `debugger eval code`, `eval@`, `eval (`)
- **Internal code passes through:** XPCalculator, ProgressManager, ModuleProgress, QuizEngine, GameTracker, etc. all write to protected keys legitimately -- detected by stack trace and allowed

### Timer Sensor
- **Tab throttling:** Browsers throttle `setInterval` to ~60s in background tabs. Sensor skips checks when `document.hidden === true`
- **Grace period:** Ignores any elapsed > 5s after tab becomes visible (first heartbeat after un-hiding is always large)

## Admin Tools

### Audit Script
```bash
# Check a user's full state
node functions/hackerman-audit.js <uid>
```

### Reset Script (Option 3: Server-validated recalculation)
```bash
# Dry run first
node functions/hackerman-reset.js <uid> --dry-run

# Live reset
node functions/hackerman-reset.js <uid>
```

> **The uid became an argument on 2026-08-21.** It used to be hardcoded, which published a real
> student's Firebase UID in this PUBLIC repo and made both tools single-use. The reset script is
> destructive, so it now refuses to run without a uid and aborts before any write if the uid does
> not resolve to an existing profile — a mistyped argument must not reset the wrong student.
> The uid these were originally pinned to is in `~/hexworth-infra-private/`.

Resets XP/level from server-validated gates + flags + scores only. Wipes sync blob, filters achievements, logs reset event.

## Design Philosophy

**Educational, not punitive:**
- XP never permanently reduced. Progress never deleted.
- The "punishment" IS the achievement -- students WANT to collect them.
- Every effect includes an educational message about real-world security concepts.
- Decoy honeypot teaches about real pentesting traps.
- Escalation teaches about incident response escalation procedures.
- Speech synthesis in a quiet lab = social pressure > technical enforcement.

---

*"Getting caught is the first step to understanding defense."*
