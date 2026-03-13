# Desk Toys — Interactive Dispatch Rewards System

**Status:** Planning
**Location:** `_app/dispatch/index.html`, `_app/components/DeskToys.js` (planned)
**Version:** 0.1 (concept)
**Last Updated:** 2026-03-13

---

## Overview

The Dispatch hub simulates sitting at a technician's desk, looking at a flatscreen monitor. The desk surface around the monitor is real estate for **interactive desk toys** that students unlock through progression. These aren't decorative — they're fully interactive physics toys, pranks, and office warfare gear that make the Dispatch hub feel personal and earned.

The flagship toy is a **USB-powered foam missile launcher** with aiming, zeroing, ammo selection, and destructible targets.

---

## Design Philosophy

- **Earned, not given.** Every toy is locked behind a progression gate (technician tier, boxes completed, flags captured).
- **Actually interactive.** Not icons. Not badges. Things you aim, shoot, spin, flick, and break.
- **Desk warfare is real.** Every IT department has USB missile launchers, Nerf guns, and stress balls. This is authentic culture.
- **Sneaky-educational.** The zeroing mechanic teaches calibration methodology. The target scoring teaches precision. Students don't notice they're learning.
- **Personal.** Two students at different tiers see different desks. Your desk reflects your journey.

---

## 1. USB Missile Launcher (Flagship Toy)

### Physical Placement
- **Position:** Lower-left of desk, below/beside the monitor
- **Appearance:** Desktop USB foam dart launcher (inspired by Dream Cheeky Thunder), rendered as detailed SVG
- **USB cable:** Visible trailing off toward the monitor stand (visual detail)

### Controls

| Control | Mechanic | UI Element |
|---------|----------|------------|
| **Elevation** | Adjusts launch angle (10-75 degrees) | Vertical slider or drag on launcher barrel |
| **Windage** | Left-right trim adjustment | Horizontal slider or arrow keys |
| **Fire** | Launches projectile | Big red button or spacebar |
| **Ammo Select** | Cycles ammo type | Ammo tray with clickable rounds |
| **Zero Reset** | Randomizes offset (new challenge) | Small button on launcher base |

### Zeroing Mechanic

This is the core skill loop:

1. Each session (or on reset), the launcher gets a **random zero offset**: elevation bias (-15 to +15 degrees) and windage bias (-20 to +20 pixels).
2. The crosshair/sight shows where you THINK you're aiming, but shots land offset by the bias.
3. The player must fire test shots, observe where they land, and adjust elevation/windage to compensate.
4. Once dialed in, shots land where the sight points.
5. The offset persists for the session — switching targets doesn't reset it.

**Why this matters:** Zeroing a scope is a real diagnostic methodology. Observe the deviation, hypothesize the correction, test, iterate. It's the troubleshooting loop disguised as a toy.

### Ammo Types

| Ammo | Tier | Behavior | Visual |
|------|------|----------|--------|
| **Foam Dart** | T1 | Standard arc, medium speed | Orange dart with suction tip |
| **Suction Cup** | T2 | Sticks to target on hit, accumulates | Dart with visible suction cup |
| **Nerf Ball** | T3 | Bounces on miss, slightly less accurate | Yellow foam ball |
| **Rubber Band** | T4 | Rapid fire (3-shot burst), flat trajectory | Stretched rubber band snap |

### Projectile Physics

Simple 2D ballistic arc:
- `x(t) = x0 + v * cos(angle + elevationBias) * t + windageBias * (t/totalTime)`
- `y(t) = y0 - v * sin(angle + elevationBias) * t + 0.5 * gravity * t^2`
- Total flight time ~0.8-1.2s (fast enough to feel snappy)
- Projectile rendered as animated SVG element along the arc path
- Trail effect: faint dotted line showing arc (fades after 2s)

---

## 2. Target System

### Physical Placement
- **Position:** Upper-right of desk (clear line of sight from launcher across desk surface)
- **Target stand:** Small easel/shelf SVG that holds the active target
- **Target selector:** Row of small icons below the stand to swap targets

### Target Types

#### Bullseye (T1 — Default)
- Classic concentric ring target (5 rings, scored 10/20/30/40/50)
- Dart sticks where it lands (accumulates — don't reset between shots)
- Score displays next to target
- Near-miss shows dart bouncing off edge
- **Visual:** Paper target pinned to a cork board on a small stand

#### Bottle (T2 — Unlocked at Desktop Support)
- Glass bottle sitting on a small shelf
- **Near-miss:** Bottle wobbles, audible "clink" implied (visual shake)
- **Direct hit:** Bottle SHATTERS — glass particle explosion, fragments scatter on desk, liquid splash if "full"
- **Reset:** New bottle slides in from side after 2s
- **Visual:** Green glass bottle (classic soda bottle shape)

#### Clown (T3 — Unlocked at Sysadmin)
- Pop-up clown head on a spring (jack-in-the-box style)
- **Near-miss:** Clown dodges, laughs (visual wobble + "HA" text bubble)
- **Direct hit:** Looney Tunes char effect — face turns black, eyes blink white, smoke wisps rise, springs back after 2s with clean face
- **Bonus:** 3 consecutive hits = clown spins and falls over
- **Visual:** Colorful clown face on a coiled spring base

#### Stack of Cups (T4 — Unlocked at Senior Engineer)
- Pyramid of 6 paper cups (3-2-1)
- Physics-based: hit a bottom cup and top ones tumble
- Each cup knocked off = points
- Full clear = bonus animation (confetti)
- **Visual:** White paper cups with coffee stains

### Hit Detection
- Simple bounding box per target element
- Projectile endpoint at end of arc checked against target zones
- Bullseye: distance from center determines ring score
- Bottle/Clown/Cups: hit box + threshold for "near miss" zone

---

## 3. Progression & Unlock Model

### Tier Gates

Tiers are determined by Dispatch ticket completion (stored in localStorage):

| Tier | Rank | Tickets Required | Toy Unlocks | Target Unlocks | Ammo Unlocks |
|------|------|-----------------|-------------|----------------|--------------|
| T1 | Help Desk | 0 | Missile Launcher | Bullseye | Foam Dart |
| T2 | Desktop Support | 3 | Drinking Bird | Bottle | Suction Cup |
| T3 | Sysadmin | 8 | Newton's Cradle | Clown | Nerf Ball |
| T4 | Senior Engineer | 15 | Plasma Ball | Cup Stack | Rubber Band |

### Data Storage

```javascript
// localStorage key: dispatch_desk_toys
{
    activeToy: 'launcher',       // Currently displayed toy
    activeTarget: 'bullseye',    // Currently displayed target
    activeAmmo: 'foam',          // Selected ammo type
    unlockedToys: ['launcher'],
    unlockedTargets: ['bullseye'],
    unlockedAmmo: ['foam'],
    launcherZero: { elev: 0, wind: 0 },  // Current calibration
    stats: {
        totalShots: 0,
        totalHits: 0,
        bullseyeHighScore: 0,
        bottlesBroken: 0,
        clownsCharred: 0,
        cupsKnocked: 0,
        bestAccuracy: 0           // percentage
    }
}
```

### Unlock Notification

When a student crosses a tier threshold:
1. New items glow/pulse on the desk
2. Tooltip: "NEW DESK TOY UNLOCKED: [name]"
3. Item auto-activates for first interaction
4. Stats panel shows unlock history

---

## 4. Future Desk Toys (Rotation System)

Each toy occupies a "slot" on the desk. The launcher always occupies the lower-left slot. Other toys fill remaining slots based on what's unlocked and what the student has active.

### Planned Toys

| Toy | Slot | Interaction | Unlock |
|-----|------|-------------|--------|
| **Missile Launcher** | Lower-left (permanent) | Aim, zero, shoot | T1 (default) |
| **Drinking Bird** | Left of monitor | Click to start bobbing, bobs for 30s | T2 |
| **Newton's Cradle** | Right of monitor | Click/drag to pull ball, physics swing | T3 |
| **USB Plasma Ball** | Right side | Touch/hover to arc lightning to cursor | T4 |
| **Mini Basketball Hoop** | Upper-right (replaces target) | Flick to shoot, backboard physics | Special: 100% accuracy achievement |
| **Desk Fan** | Lower-right | Click to toggle, blows the post-its | Special: 10 boxes completed |
| **Fidget Spinner** | Near keyboard | Drag to spin, momentum decay | Special: 5-day streak |
| **Stress Ball** | Anywhere | Click to squeeze, satisfying deform animation | Special: fail a box 3 times |

### Toy Selector UI

- Small tray/drawer icon at desk edge
- Opens a grid of unlocked toys (locked ones shown as silhouettes)
- Drag toy to a desk slot to place it
- "Your Desk" customization feel

---

## 5. Technical Architecture

### File Structure

```
_app/
    components/
        DeskToys.js              # Core engine: unlocks, toy rendering, state
        DeskLauncher.js          # Launcher physics, aiming, projectile arcs
        DeskTargets.js           # Target types, hit detection, animations
    dispatch/
        index.html               # Dispatch hub (consumes DeskToys)
```

### DeskToys.js (Core Engine)

```javascript
// Public API
DeskToys.init(containerEl)       // Initialize with desk container
DeskToys.checkUnlocks()          // Read tier data, unlock new items
DeskToys.setActiveToy(id)        // Switch displayed toy
DeskToys.setActiveTarget(id)     // Switch displayed target
DeskToys.getStats()              // Return stats object
DeskToys.render()                // Render current desk state

// Events
DeskToys.on('unlock', callback)  // Fired when new item unlocked
DeskToys.on('shot', callback)    // Fired on launcher shot
DeskToys.on('hit', callback)     // Fired on target hit
```

### DeskLauncher.js (Physics)

```javascript
DeskLauncher.init(config)        // Set position, zero offset
DeskLauncher.setElevation(deg)   // Set barrel angle
DeskLauncher.setWindage(px)      // Set L/R trim
DeskLauncher.setAmmo(type)       // Switch ammo
DeskLauncher.fire()              // Launch projectile, return arc path
DeskLauncher.resetZero()         // Randomize offset for new challenge
```

### DeskTargets.js (Targets)

```javascript
DeskTargets.init(config)         // Set position, active target
DeskTargets.setTarget(type)      // Switch target type
DeskTargets.checkHit(x, y)      // Test projectile endpoint, return result
DeskTargets.playHitEffect(type)  // Trigger hit/miss animation
DeskTargets.reset()              // Reset target to fresh state
```

### Integration with Dispatch Hub

```javascript
// In dispatch/index.html <script>
var toys = DeskToys.init(document.querySelector('.desk-items'));
toys.checkUnlocks(); // reads localStorage tier data
```

No build step. Script tags in dispatch/index.html. Same pattern as BoxEngine.

---

## 6. Stats & Achievements

### Launcher Stats Panel
Accessible via small "stats" icon on launcher base:
- Total shots fired
- Total hits / accuracy %
- Bullseye high score
- Bottles broken
- Clowns charred
- Best 5-shot grouping (precision metric)

### Achievement Integration
These feed into AchievementRegistry:

| Achievement | Condition |
|-------------|-----------|
| First Blood | Fire your first shot |
| Bullseye | Score 50 (center hit) |
| Sharpshooter | 10 consecutive hits |
| Glass Cannon | Break 25 bottles |
| Send in the Clowns | Char the clown 50 times |
| Dead Eye | Achieve 90%+ accuracy over 20 shots |
| Zeroed In | Calibrate launcher in 3 or fewer test shots |
| Cup Sweep | Clear all 6 cups in one volley |
| Desk General | Unlock all toys and targets |

---

## 7. Visual Reference

```
+--------------------------------------------------+
|                                                  |
|  [target stand]                    [plasma ball] |
|     upper-right                     right side   |
|                                                  |
|  [sticky notes hanging from bezel]               |
|  +------------------------------------------+   |
|  |          MONITOR SCREEN                   |   |
|  |       (scrollable content)                |   |
|  |                                           |   |
|  +------------------------------------------+   |
|  [post-its]        [LED]          [post-its] |   |
|              [stand neck]                        |
|              [stand base]                        |
|                                                  |
|  [launcher]    [keyboard area]     [coffee mug]  |
|   lower-left                        right side   |
|                                                  |
|  [pen holder]                    [USB] [cable]   |
|                                                  |
+==================================================+
                    [desk edge]
```

---

## 8. Build Order

1. **Phase 1: Launcher Core** — SVG launcher, elevation/windage controls, fire button, projectile arc animation
2. **Phase 2: Bullseye Target** — Target SVG, hit detection, score display, dart accumulation
3. **Phase 3: Zeroing Mechanic** — Random offset, calibration loop, accuracy tracking
4. **Phase 4: Additional Targets** — Bottle (shatter), Clown (char), Cups (physics tumble)
5. **Phase 5: Ammo Types** — Different projectile behaviors per ammo
6. **Phase 6: Unlock System** — Tier gates, unlock notifications, localStorage persistence
7. **Phase 7: Additional Toys** — Drinking bird, Newton's cradle, plasma ball, etc.
8. **Phase 8: Toy Selector UI** — Desk customization panel, slot system
9. **Phase 9: Achievements** — Wire to AchievementRegistry
10. **Phase 10: Stats Panel** — Accuracy tracking, leaderboard potential

---

## 9. Open Questions

- **Sound effects?** We don't currently use audio anywhere in Hexworth Prime. Adding launch/impact sounds would be a first. Could be optional toggle.
- **Multiplayer desk wars?** If Firestore sync is added later, students could "fire at" each other's desks. Way future.
- **Instructor desk?** Handlers get a different desk toy set? Executive toys (Newton's cradle, desk golf)?
- **Seasonal toys?** Holiday-themed desk items (Santa hat on monitor, pumpkin target, etc.)?
- **Physics complexity?** Start simple (parabolic arc), could add wind, spin, ricochet later.

---

*This document is the source of truth for the Desk Toys system. Update it as features ship.*
