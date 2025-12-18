# Digital Life - Binary Firefly Ecosystem

**Version:** 3.8.0 (8-Phase Expansion Complete)
**Status:** Feature Complete - Ready for Integration
**Last Updated:** December 2025

---

## Overview

Digital Life is a living, breathing ecosystem simulation featuring binary fireflies (1s and 0s) that exhibit emergent behaviors, evolve, hunt, reproduce, and respond to cosmic events. It serves as the signature magical element of Hexworth Prime.

The simulation uses procedural generation for both visuals and audio, with no external dependencies beyond the browser's Web Audio API and Canvas/DOM rendering.

---

## Current Standing

### All 8 Development Phases Complete

| Phase | Name | Description | Status |
|-------|------|-------------|--------|
| 1 | Visual Polish | Trails, death particles, planet visuals | ✅ Complete |
| 2 | Ecosystem Depth | Energy wells, genetics, pheromones, predator stars | ✅ Complete |
| 3 | Cosmic Events | Solar flare, meteor shower, void storm, eclipse, nebula | ✅ Complete |
| 4 | Planet Expansion | Moons, volcanoes, lifecycle, collapse mechanics | ✅ Complete |
| 5 | Predator Variety | Shadow fireflies, void serpent, parasites | ✅ Complete |
| 6 | Player Tools | 5 tools, portals, sanctuaries | ✅ Complete |
| 7 | Meta Systems | Achievements, statistics HUD, event log | ✅ Complete |
| 8 | Audio | Procedural sounds, ambient atmosphere | ✅ Complete |

---

## File Structure

```
src/digital-life/
├── index.js                    # Main entry point (DigitalLife class)
│
├── core/
│   ├── Firefly.js              # Individual firefly entity with tiers
│   └── Ecosystem.js            # Core ecosystem management
│
├── entities/
│   ├── BlackHole.js            # Gravitational predator
│   ├── Planet.js               # Formed from Ascended sacrifices
│   ├── Moon.js                 # Orbiting planetary bodies
│   ├── EnergyWell.js           # Stationary energy sources
│   ├── PredatorStar.js         # Mobile hunting entities
│   ├── ShadowFirefly.js        # Corrupted firefly predator
│   ├── VoidSerpent.js          # Segmented void creature
│   ├── Parasite.js             # Energy-draining parasite
│   ├── Portal.js               # Teleportation system
│   └── Sanctuary.js            # Safe zones with healing
│
├── behaviors/
│   ├── Hunting.js              # Predator-prey dynamics (1s hunt 0s)
│   ├── Swarming.js             # Flocking/schooling behavior
│   ├── Constellation.js        # Pattern formation
│   ├── Reproduction.js         # Mitosis/breeding system
│   ├── HousePersonality.js     # House-themed behavior modifiers
│   ├── RareFireflies.js        # Golden/Diamond/Glitch/Ancient spawns
│   ├── InteractionSystem.js    # Mouse/touch interaction
│   ├── EnvironmentalSystem.js  # Time of day effects
│   ├── Genetics.js             # Trait inheritance system
│   ├── Pheromones.js           # Chemical trail communication
│   └── PredatorManager.js      # Multi-predator coordination
│
├── effects/
│   ├── Particles.js            # Particle system for effects
│   ├── ShootingStar.js         # Shooting stars with eggs
│   ├── AmbientEffects.js       # Background atmosphere
│   └── Trails.js               # Movement trail rendering
│
├── events/
│   ├── CosmicEventManager.js   # Event scheduling and coordination
│   ├── SolarFlare.js           # Energy boost event
│   ├── MeteorShower.js         # Mass spawn event
│   ├── VoidStorm.js            # Dangerous void incursion
│   ├── Eclipse.js              # Visual/behavior modifier
│   └── NebulaDrift.js          # Beneficial cosmic cloud
│
├── interactions/
│   └── PlayerTools.js          # 5 player intervention tools
│
├── meta/
│   ├── Achievements.js         # ~35 achievements with persistence
│   ├── Statistics.js           # Real-time HUD display
│   └── EventLog.js             # Scrolling event history
│
└── audio/
    ├── SoundManager.js         # Web Audio API infrastructure
    ├── EventSounds.js          # Procedural event sounds
    └── AmbientLayer.js         # Ecosystem-reactive background
```

---

## Quick Start

### Ambient Mode (Background Decoration)

For use as a **non-intrusive ambient backdrop** behind main content:

```javascript
// Use the ambient factory method
const digitalLife = DigitalLife.createAmbient();
digitalLife.init(document.body);
```

**Ambient mode automatically:**
- Disables all UI overlays (stats HUD, event log, achievements)
- Reduces population (15-30 fireflies)
- Lowers cosmic event frequency
- Disables aggressive predators (serpent, parasites)
- Turns off player tools
- Uses `pointer-events: none` so clicks pass through

The fireflies will float peacefully behind your content at `z-index: 1`.

### Full Experience Mode

For dedicated viewing pages or the Digital Life "room":

```javascript
// Use the full experience factory
const digitalLife = DigitalLife.createFull();
digitalLife.init(document.body);

// Show debug controls
digitalLife.createDebugControls();
```

### Basic Usage

```javascript
// Create and initialize with defaults
const digitalLife = new DigitalLife();
digitalLife.init(document.body);

// That's it! The ecosystem is now running
```

### With Configuration

```javascript
const digitalLife = new DigitalLife({
    population: {
        initial: 25,
        min: 15,
        max: 50
    },
    shootingStars: {
        minInterval: 8000,
        maxInterval: 15000
    },
    audio: {
        enabled: true,           // Enable procedural audio
        masterVolume: 0.5,
        ambientEnabled: true
    },
    achievements: {
        enabled: true,
        showUI: true
    }
});

digitalLife.init(containerElement);

// Show debug controls (or press 'D' on test page)
digitalLife.createDebugControls();
```

---

## Configuration Options

### Population Settings
```javascript
population: {
    initial: 20,      // Starting firefly count
    min: 10,          // Minimum before auto-spawn
    max: 50           // Maximum population cap
}
```

### Behavior Systems
```javascript
behaviors: {
    hunting: { enabled: true },        // 1s hunt 0s
    swarming: { enabled: true },       // Flocking behavior
    constellation: { enabled: true },  // Pattern formation
    reproduction: { enabled: true },   // Mitosis
    housePersonality: { enabled: true },
    rareFireflies: { enabled: true },
    interaction: { enabled: true },
    environmental: { enabled: true },
    ambientEffects: { enabled: true }
}
```

### Cosmic Events
```javascript
cosmicEvents: {
    enabled: true,
    eventCheckInterval: 15000,   // Check every 15s
    baseEventChance: 0.12,       // 12% per check
    maxConcurrentEvents: 2,
    announceEvents: true
}
```

### Audio System
```javascript
audio: {
    enabled: false,              // Disabled by default (browser policy)
    masterVolume: 0.5,
    ambientVolume: 0.3,
    eventVolume: 0.6,
    ambientEnabled: true,
    eventsEnabled: true
}
```

### Meta Systems
```javascript
achievements: {
    enabled: true,
    showUI: true,
    toastDuration: 4000,
    storageKey: 'digitalLifeAchievements'
},
statistics: {
    enabled: true,
    showHUD: true,
    updateInterval: 500,
    position: 'top-left'
},
eventLog: {
    enabled: true,
    showUI: true,
    maxEntries: 100,
    position: 'bottom-right',
    collapsed: true
}
```

---

## Key Methods

### Lifecycle
| Method | Description |
|--------|-------------|
| `init(container)` | Initialize and start the ecosystem |
| `pause()` | Pause simulation |
| `resume()` | Resume simulation |
| `destroy()` | Clean up all resources |

### Debug & Testing
| Method | Description |
|--------|-------------|
| `createDebugControls()` | Show debug panel |
| `toggleDebugControls()` | Toggle debug panel visibility |
| `triggerShootingStar()` | Force spawn a shooting star |
| `forceCosmicEvent(type)` | Trigger specific cosmic event |
| `spawnRare(type)` | Spawn rare firefly variant |
| `spawnPlanet(digit)` | Spawn a planet (0 or 1) |

### Audio Controls
| Method | Description |
|--------|-------------|
| `toggleAudio()` | Enable/disable audio |
| `toggleAmbient()` | Toggle ambient layer |
| `testSound(type)` | Test specific sound |
| `setMasterVolume(vol)` | Set master volume (0-1) |

### Statistics
| Method | Description |
|--------|-------------|
| `getStats()` | Get current ecosystem stats |
| `getAchievementProgress()` | Get achievement progress |
| `exportEventLog()` | Export event log as text |

---

## Evolution Tiers

Fireflies can evolve through 5 tiers based on age and experience:

| Tier | Name | Color | Features |
|------|------|-------|----------|
| 0 | Basic | White | Standard firefly |
| 1 | Charged | Purple | Slight gravity resistance |
| 2 | Radiant | Cyan | Faster, longer life |
| 3 | Prismatic | Gold | Strong abilities |
| 4 | Ascended | Green | Can sacrifice to form planets |

---

## Rare Firefly Types

Rare variants spawn with special abilities:

| Type | Appearance | Special Ability |
|------|------------|-----------------|
| Golden | Gold glow | Attracts others, energy boost |
| Diamond | Crystal shimmer | Invulnerable, reflects predators |
| Glitch | Distorted | Teleports, disrupts nearby |
| Ancient | Rune markings | Long-lived, creates energy |

---

## Cosmic Events

| Event | Effect | Duration |
|-------|--------|----------|
| Solar Flare | Energy boost to all fireflies | 15-30s |
| Meteor Shower | Mass firefly spawns | 20-40s |
| Void Storm | Dangerous, spawns predators | 30-60s |
| Eclipse | Visual change, behavior shift | 45-90s |
| Nebula Drift | Beneficial cloud, healing | 30-45s |

---

## Player Tools

| Tool | Charges | Effect |
|------|---------|--------|
| Energy Blessing | 3 | Heal nearby fireflies |
| Gravity Well | 2 | Create temporary attractor |
| Shield Bubble | 2 | Protect area from predators |
| Spawn Beacon | 3 | Attract new spawns |
| Evolution Catalyst | 1 | Force evolution nearby |

---

## Audio System Notes

**Browser Autoplay Policy:** Audio is disabled by default because modern browsers require user interaction before playing sounds. The audio system uses lazy initialization - it will automatically start on the first click or keypress after being enabled.

To enable audio:
```javascript
// Via config
const digitalLife = new DigitalLife({ audio: { enabled: true } });

// Or at runtime
digitalLife.toggleAudio();
```

All sounds are procedurally generated using the Web Audio API - no external audio files required.

### Sound Reference

Each event has a unique signature sound:

| Category | Event | Sound Characteristics |
|----------|-------|----------------------|
| **Lifecycle** | Birth | Rising two-note chime (pitch varies by tier) |
| | Death (natural) | Soft falling fade |
| | Death (predator) | Quick sharp cutoff |
| | Death (blackhole) | Descending sweep into void |
| | Evolution | Ascending arpeggio (more notes for higher tiers) |
| **Collisions** | 1+1 | Bright click (high square wave) |
| | 0+0 | Soft pop (mid sine wave) |
| | 1+0 | Gentle chime (triangle wave) |
| **Rare Spawns** | Golden | Triumphant G-major chord + shimmer |
| | Diamond | High crystalline tinkles |
| | Glitch | Digital noise bursts (chaotic) |
| | Ancient | Deep bass drone + harmonics |
| **Cosmic** | Shooting Star | Magical whoosh + sparkle chimes |
| | Solar Flare | Warning tone + rising energy sweep |
| | Meteor Shower | Multiple whistling descents |
| | Void Storm | Ominous low rumble (brown noise) |
| | Eclipse | Ethereal descending drone |
| | Nebula Drift | Soft ambient chord |
| **Predators** | Shadow | Dark whisper (reversed envelope) |
| | Void Serpent | Low growl + hiss |
| | Parasite | Quick squelch |
| **Player Tools** | Energy Blessing | Ascending healing tones |
| | Shield Bubble | Protective hum |
| | Portal | Swirling whoosh |
| **Meta** | Achievement | Triumphant fanfare (C-E-G-C + chord) |
| | UI Click | Quick high beep |

Test sounds with: `digitalLife.testSound('birth')`, `digitalLife.testSound('shootingStar')`, etc.

---

## Achievements System

The ecosystem tracks ~35 achievements across 7 categories:

- **Population** - Colony size milestones
- **Evolution** - Tier progression achievements
- **Rare** - Discovering rare variants
- **Cosmic** - Witnessing cosmic events
- **Survival** - Longevity records
- **Interaction** - Using player tools
- **Special** - Unique events

Progress is saved to localStorage and persists between sessions.

---

## Future Expansion Plans

### Potential Phase 9+:
1. **Save/Load System** - Export/import ecosystem state
2. **House Theming** - Visual themes per Hexworth house
3. **Mobile Optimization** - Touch gestures, performance
4. **Advanced Genetics** - Visual trait inheritance
5. **Seasonal Events** - Time-based special events
6. **Multiplayer** - Shared ecosystem viewing

### Integration Roadmap:
1. Integrate with Hexworth Prime main application
2. Add house-specific ecosystem variations
3. Connect achievements to main progression system
4. Add ecosystem "rooms" with different rules

---

## Technical Architecture

### Rendering Strategy
- DOM-based rendering for fireflies (CSS transforms)
- Canvas fallback for particle effects
- RequestAnimationFrame for smooth updates
- Object pooling for trails and particles

### Audio Strategy
- Web Audio API for all sounds
- Procedural oscillator-based generation
- Category-based gain control
- Concurrent sound limiting

### State Management
- Central ecosystem state in index.js
- Observer pattern for event hooks
- LocalStorage for persistence

---

## Test Page

A test page is provided at `app/test-digital-life.html` that includes:
- Full ecosystem initialization
- Keyboard shortcuts (D = debug, P = pause)
- All phase features enabled
- Version badge display

---

## Dependencies

**None!** Digital Life is completely standalone and uses only:
- Native DOM APIs
- Web Audio API
- CSS3 Transforms
- RequestAnimationFrame
- LocalStorage

No external libraries, frameworks, or assets required.

---

## Using as Ambient Backdrop

Digital Life was designed to work as a **magical ambient background** for the Hexworth Prime platform. Here's how to integrate it properly:

### Z-Index Layering

```
z-index: 10000+  Debug controls, achievement toasts (disabled in ambient mode)
z-index: 1000    Stats HUD, event log (disabled in ambient mode)
z-index: 100+    Your main content (modals, navigation, etc.)
z-index: 10      Your main content container
z-index: 1       Digital Life fireflies (ambient layer)
z-index: 0       Page background
```

### Integration Example

```html
<!DOCTYPE html>
<html>
<head>
    <style>
        /* Your content sits above the fireflies */
        .main-content {
            position: relative;
            z-index: 10;
        }

        .modal {
            position: fixed;
            z-index: 100;
        }
    </style>
</head>
<body>
    <!-- Your main application -->
    <div class="main-content">
        <h1>Welcome to Hexworth Prime</h1>
        <!-- Fireflies float behind this content -->
    </div>

    <!-- Digital Life scripts -->
    <script src="src/digital-life/core/Firefly.js"></script>
    <script src="src/digital-life/core/Ecosystem.js"></script>
    <!-- ... other scripts ... -->
    <script src="src/digital-life/index.js"></script>

    <script>
        // Start ambient mode
        const digitalLife = DigitalLife.createAmbient();
        digitalLife.init(document.body);
    </script>
</body>
</html>
```

### Customizing Ambient Mode

```javascript
// Start with ambient preset, then customize
const digitalLife = DigitalLife.createAmbient({
    population: {
        initial: 20,  // Slightly more fireflies
        max: 40
    },
    cosmicEvents: {
        enabled: false  // No events at all for pure calm
    },
    blackHole: {
        enabled: false  // No black hole
    }
});
```

### Switching Modes at Runtime

```javascript
// Can't easily switch presets, but can toggle features:
digitalLife.toggleStatisticsHUD();  // Show/hide stats
digitalLife.toggleEventLog();       // Show/hide event log

// Or destroy and recreate with different config
digitalLife.destroy();
const newLife = DigitalLife.createFull();
newLife.init(document.body);
```

---

## License

Part of Hexworth Prime educational platform.
Internal use only.

---

*Created with care for the Hexworth Prime project*
