# Digital Life (Binary Firefly Ecosystem)

**Status:** SHIPPED (all 8 phases complete)
**Components:** `index.js` (main entry), 30+ module files across `core/`, `entities/`, `behaviors/`, `events/`, `interactions/`, `meta/`, `audio/`
**Location:** `_app/digital-life/`
**Added:** v5.0.0
**Last reviewed:** 2026-04-05

## Purpose

Digital Life is a self-contained ecosystem simulation featuring binary fireflies (0s and 1s)
that exhibit emergent behaviors — hunting, swarming, reproducing, evolving, responding to
cosmic events, and interacting with player tools. It serves as Hexworth Prime's ambient
living element, running either as a non-intrusive background decoration or as a full
immersive experience.

Binary arithmetic drives the core mechanic: when two 1s collide they overflow to 0,
when two 0s collide they quantum-flip to 1. This makes the simulation inherently
educational — students observe binary operations through emergent ecosystem behavior.

## 8 Phases (All Complete)

| Phase | Name | What it adds |
|-------|------|-------------|
| 1 | Visual Polish | Trails, death particles, planet visuals, CRT scanline effects |
| 2 | Ecosystem Depth | Energy wells, genetics (trait inheritance), pheromone trails, predator stars |
| 3 | Cosmic Events | Solar flare, meteor shower, void storm, eclipse, nebula drift |
| 4 | Planet Expansion | Moons, volcanoes, lifecycle, collapse mechanics, terraforming |
| 5 | Predator Variety | Shadow fireflies, void serpent (segmented), parasites |
| 6 | Player Tools | Energy Blessing, Gravity Well, Shield Bubble, Spawn Beacon, Evolution Catalyst + Portals & Sanctuaries |
| 7 | Meta Systems | ~35 achievements, real-time statistics HUD, scrolling event log |
| 8 | Audio | Procedural Web Audio API sounds, ambient layer, event-specific audio |

## Two Modes

| Mode | Population | UI | Pointer Events | Z-Index | Use Case |
|------|-----------|-----|----------------|---------|----------|
| **Ambient** | 15-30 | Disabled (no HUD, no log) | `none` (clicks pass through) | 1 | Background behind main content |
| **Full** | 20-50 | All enabled | Active (tools, debug) | 50 | Dedicated viewing experience |

```javascript
DigitalLife.createAmbient();  // Background decoration, reduced complexity
DigitalLife.createFull();     // All features, debug controls available
```

## Core Mechanic: Binary Collisions

| Collision | Type | Result |
|-----------|------|--------|
| 1 + 1 | Overflow | Both become 0, energy boost |
| 0 + 0 | Quantum | Both become 1, energy boost |
| 1 + 0 | Merge | Stay same or merge, small energy |

Each collision increments an evolution meter. Reaching thresholds triggers tier evolution.

## Firefly Entity

**Life cycle:** BIRTH → GROWING → MATURE → DYING → DEAD

**Evolution tiers (5):**

| Tier | Name | Color | Life Multiplier | Gravity Resist | Special |
|------|------|-------|----------------|----------------|---------|
| 0 | Basic | White | 1.0x | 0% | Standard |
| 1 | Charged | Purple | 1.5x | 15% | Stronger |
| 2 | Radiant | Cyan | 2.0x | 30% | Faster, longer life |
| 3 | Prismatic | Gold | 3.0x | 50% | High abilities |
| 4 | Ascended | Green | 5.0x | 75% | Can sacrifice to create planets |

**Properties:** Position, velocity, wobble/pulse animations, energy (decays over time),
age (120-240s base, multiplied by tier), generation (tracks ancestry lineage).

**Rare variants:** Golden (attracts others), Diamond (invulnerable), Glitch (teleports),
Ancient (long-lived, creates energy wells).

## Entity Types

| Entity | Behavior | Max Concurrent |
|--------|---------|----------------|
| **BlackHole** | Gravity well, pulls fireflies inward | varies |
| **Planet** | Formed from Ascended sacrifice, has moons, volcanoes | 20 |
| **Moon** | Orbits planet, aesthetic + gravitational | per planet |
| **EnergyWell** | Stationary energy source (Standard/Volatile/Ancient) | 3 |
| **PredatorStar** | Hunts opposite-digit fireflies (Hunter/Lurker/Drifter) | 2 |
| **ShadowFirefly** | Corrupted variant, hunts regular fireflies | 3 |
| **VoidSerpent** | Segmented worm, spawns during void storms | 1 (3-min cooldown) |
| **Parasite** | Attaches to fireflies, drains energy | 10 |
| **Portal** | Player-placed teleportation pair | 3 pairs |
| **Sanctuary** | Player-placed safe zone with healing | 5 |

## Behavior Systems

| System | What it does |
|--------|-------------|
| **Hunting** | 1-fireflies hunt 0s (and vice versa), chase/flee logic |
| **Swarming** | Boids model — cohesion, alignment, separation |
| **Constellation** | Pattern-based groupings, spawns rare fireflies |
| **Reproduction** | High-energy fireflies give birth (mitotic division, gen+1) |
| **Genetics** | Trait inheritance (speed, color, efficiency), 15% mutation rate |
| **Pheromones** | Chemical trail grid (40px cells) — food, danger, mate markers |
| **HousePersonality** | Reads `hexworth_house`, applies house-specific behavior mods |
| **Interaction** | Mouse hover avoidance (100px radius), click for tools |

## Cosmic Events

Randomly scheduled, max 2 concurrent:

| Event | Duration | Effect | Audio |
|-------|----------|--------|-------|
| **Solar Flare** | 15-30s | Energy boost, more births | Rising energy sweep |
| **Meteor Shower** | 20-40s | Mass spawn wave, chaos | Whistling descents |
| **Void Storm** | 30-60s | Spawns shadows, serpent, parasites | Ominous low rumble |
| **Eclipse** | 45-90s | Visual darkening, aggressive predators | Ethereal descending drone |
| **Nebula Drift** | 30-45s | Healing aura, calmed fireflies | Soft ambient chord |

Each event has a 6% chance per check interval. Events stack atmosphere — a void storm
during an eclipse creates genuine chaos.

## Player Tools (5)

| Tool | Charges | Cooldown | Effect |
|------|---------|----------|--------|
| **Energy Blessing** | 3 | 8s | Heal and boost nearby fireflies |
| **Gravity Well** | 2 | 10s | Create temporary attractor |
| **Shield Bubble** | 2 | 10s | Protect area from predators (10s) |
| **Spawn Beacon** | 3 | 6s | Attract new spawns to location |
| **Evolution Catalyst** | 1 | 15s | Force evolution of nearby fireflies |

UI: Bottom-left corner, shows charges and recharge timers.

## Meta Systems

### Achievements (~35)

Categories: Population milestones, evolution tiers, rare encounters, cosmic event
survival, interaction mastery, special (Planet Creator, Perfect Game).

**Storage:** `digitalLifeAchievements` localStorage key.

### Statistics HUD (Top-Left)

```
Population: 32/50
Births: 142 | Deaths: 110
Avg Age: 45s | Avg Energy: 68%
Collisions: 89 | Events: 3 active
```

Updated every 500ms.

### Event Log (Bottom-Right, Collapsible)

Scrolling log of ecosystem events: evolutions, rare spawns, cosmic events, deaths.

## Audio (Web Audio API)

All sound is procedurally generated — no audio files:

| Category | Examples |
|----------|---------|
| **Lifecycle** | Birth chime, evolution ascending tones, death fade |
| **Collisions** | 1+1 (high pitch), 0+0 (mid), 1+0 (triangle wave) |
| **Rare Spawns** | Golden shimmer, Diamond crystal, Glitch noise burst |
| **Cosmic** | Flare sweep, meteor whistles, void rumble, eclipse drone |
| **Predators** | Shadow dark tone, serpent ominous, parasite buzz |
| **Tools** | Blessing heal tones, shield hum, portal whoosh |
| **Meta** | Achievement fanfare (3-note or 4-note for legendary) |

Audio disabled by default (browser autoplay policy). User enables via button or keypress.

## Rendering

- **Fireflies:** DOM-based (absolute positioning, CSS transforms) — efficient to 50-100
- **Trails:** Canvas-based, fades over 400ms
- **Particles:** Canvas particle system with object pooling (max 500)
- **CRT effect:** CSS pseudo-element with repeating linear gradient (scanlines)
- **Performance target:** 60fps via requestAnimationFrame
- **Memory:** ~2-5MB for full ecosystem + sounds

## Debug Controls

Press `D` to toggle:
- `SPACE` — Pause/Resume
- `S` — Trigger shooting star
- `E` — Force cosmic event (cycles types)
- `R` — Spawn rare firefly (cycles: golden, diamond, glitch, ancient)
- `P` — Spawn planet
- `A` — Toggle audio
- `H` — Toggle stats HUD
- `L` — Toggle event log
- `G` — Toggle pheromone grid visualization

## Integration with Platform

- **Theme:** Reads `hexworth_theme` from localStorage, adjusts colors
- **House personality:** Reads `hexworth_house`, applies house-specific behavior mods
  (e.g., Shield house = defensive swarming, Dark Arts = aggressive hunting)
- **Achievements:** Currently localStorage-only, not synced to main achievement system
- **XP:** Currently standalone, no XP integration

## Key Decisions

- **Procedural audio over audio files** — Web Audio API generates all sounds
  mathematically. Zero audio file downloads, infinite variation, responsive to
  ecosystem state. The ambient layer reacts to population density and event activity.

- **DOM-based fireflies** — Each firefly is a positioned `<div>`, not a canvas sprite.
  This allows CSS animations (pulse, wobble) and keeps rendering simple. Canvas is
  used only for trails and particles where per-pixel control matters.

- **Binary arithmetic as core mechanic** — The 1+1=0 / 0+0=1 collision rules make this
  inherently educational. Students see binary overflow and quantum bit-flip through
  ecosystem behavior rather than textbook definitions.

- **Ambient vs Full separation** — The same engine powers both modes. Ambient mode
  disables UI, reduces population, and sets `pointer-events: none`. This lets Digital
  Life enhance any page without interfering with actual content.

- **Self-contained with no backend** — Entirely client-side. No Firestore, no Cloud
  Functions, no server calls. The simulation runs in the browser and persists only
  achievements to localStorage. This keeps it lightweight and universally deployable.

## Known Limitations

- **No save/load for ecosystem state** — Closing the tab destroys the entire ecosystem.
  Only achievements persist. There's no way to save a particularly interesting ecosystem
  and resume it later.

- **Performance degrades above ~80 fireflies** — DOM-based rendering hits limits. The
  O(n^2) collision detection compounds the problem. Population caps (default 50) prevent
  this in practice but limit epic-scale simulations.

- **No multiplayer ecosystem** — Each browser runs its own independent simulation. No
  shared ecosystem viewing. A classroom projecting Digital Life sees a different ecosystem
  than each student's screen.

- **Achievement system is standalone** — Digital Life achievements don't integrate with
  the main platform AchievementManager. A student who unlocks "Planet Creator" in Digital
  Life doesn't see it in their Hexworth Prime achievement panel.

- **House personality effects are subtle** — The behavior mods based on `hexworth_house`
  exist but are minor tweaks. Most students wouldn't notice the difference between
  Shield house and Dark Arts house firefly behavior without being told.
