# Digital Life Evolution - Feature Backlog

**Created:** December 16, 2025
**Status:** Active Development Track
**Priority:** High - Signature Feature

---

## Vision

Transform binary fireflies from decorative ambiance into a living digital ecosystem. The fireflies should feel like **digital organisms** with life cycles, behaviors, and emergent properties - not just floating decorations.

---

## Current State (Academy v7.16.0)

### Implemented Features
- [x] 20 binary fireflies (1s and 0s)
- [x] Organic floating movement (wobble, drift)
- [x] Soft glow using house color variables
- [x] Pulsing opacity
- [x] Occasional digit changes
- [x] Shooting stars every 8-15 seconds
- [x] Binary trail particles on stars
- [x] Firefly scatter when stars pass nearby
- [x] Mouse avoidance interaction
- [x] Screen edge wrapping

---

## Evolution Phases

### Phase 1: Life Cycle (Sprint DL-1)

#### Birth
- Fireflies spawn as small, dim **"0"**
- Fade in gradually over 2-3 seconds
- Start with minimal glow

#### Growth
- Gradually increase in size and brightness
- After threshold time, may flip to **"1"**
- Growth rate slightly randomized

#### Death Triggers
- Age limit reached (e.g., 60-90 seconds)
- Too many collisions
- Random chance (keeps population dynamic)

#### Death Animation
- **Burst Effect:** Particle explosion of mini 0s and 1s
- Particles scatter outward
- Briefly show opposite digit before fading
- Respawn elsewhere as new "0"

#### Implementation Notes
```javascript
// Firefly data structure additions
{
    age: 0,
    maxAge: 60000 + Math.random() * 30000,
    generation: 0,
    collisionCount: 0,
    state: 'birth' | 'growing' | 'mature' | 'dying'
}
```

---

### Phase 2: Collision Behavior (Sprint DL-2)

#### Collision Detection
- Check distance between all firefly pairs
- Collision radius based on firefly size
- Optimize with spatial partitioning if needed

#### Collision Rules

| Collision | Result | Visual |
|-----------|--------|--------|
| **1 + 1** | Both become 0 (overflow) | Flash + ripple |
| **0 + 0** | Both become 1 (quantum flip) | Spark effect |
| **1 + 0** | Brief merge → split into two | Swirl animation |

#### Generation Tracking
- Each firefly tracks generation number
- Offspring = parent generation + 1
- Visual indicators:
  - Gen 0: Small, dim
  - Gen 1-2: Normal
  - Gen 3+: Larger, brighter
  - Gen 5+: Maximum size, golden tint?

#### Collision Cooldown
- Prevent rapid re-collision
- 2-3 second immunity after collision

---

### Phase 3: Ecosystem Dynamics (Sprint DL-3)

#### Predator/Prey System

**1s (Hunters):**
- Slowly drift toward nearest 0
- Slightly faster movement
- More aggressive color (warmer tint?)

**0s (Prey):**
- Flee from nearby 1s
- Tend to cluster together for safety
- When caught by 1 → convert to 1

**Balance Mechanics:**
- If too many 1s → hunting slows (satiation)
- If too many 0s → 1s get faster (hunger)
- Natural oscillation creates waves

#### Energy System
- Fireflies have energy level (0-100)
- Energy slowly decays over time
- Collisions restore energy
- Low energy = dimmer, slower
- Zero energy = death

#### Mitosis (Reproduction)
- Mature fireflies with high energy can split
- Creates two smaller fireflies
- Inherits parent's digit
- Population cap prevents runaway growth

---

### Phase 4: Advanced Behaviors (Sprint DL-4+)

#### Constellation Formation
- Occasionally 4-6 fireflies align
- Form recognizable patterns (triangle, square, line)
- Glow brighter when in formation
- Hold formation for 3-5 seconds
- Could form network topology shapes!

#### Shooting Star Seeds
- Shooting stars leave 2-3 "eggs" in their wake
- Eggs hatch into baby fireflies after delay
- Creates population bursts

#### House Personality
| House | Firefly Behavior |
|-------|------------------|
| **Web** | Clustering, network formation |
| **Shield** | Aggressive, territorial |
| **Forge** | Slow, steady, durable |
| **Script** | Fast, erratic, numerous |
| **Cloud** | Floating higher, lighter |
| **Dark Arts** | Predatory, glitch effects |

#### Binary Arithmetic Display
- On collision, briefly show operation result
- `1 + 1 = 10` (binary!)
- `0 + 0 = 00`
- `1 + 0 = 01`
- Educational tie-in to binary math

#### Swarm Intelligence
- Fireflies can form temporary swarms
- Swarm moves as unit
- Swarm has collective "mood"
- Can chase or flee as group

---

## Future Ideas (Backlog)

### Additional Particle Types

| Type | Visual | Behavior |
|------|--------|----------|
| **Spell Particles** | `{ }`, `< >`, `( )` | Float like runes, magical feel |
| **Data Streams** | Vertical character columns | Soft Matrix aesthetic |
| **Circuit Pulse** | Faint glowing lines | Living technology veins |
| **Packet Bubbles** | Translucent spheres | Float with data inside |
| **Hex Wisps** | Hex digits (A-F) | Rarer, special behavior |

### Environmental Interactions

- **Time of Day:** Behavior changes (more active at "night")
- **User Activity:** More fireflies appear during engagement
- **Achievements:** Special fireflies unlock with progress
- **Seasons/Events:** Holiday-themed variations

### Meta Features

- **Firefly Statistics:** Track births, deaths, collisions
- **Population Graphs:** Visualize ecosystem over time
- **"Rare" Fireflies:** Golden 1, Diamond 0, special spawns
- **User Interaction:** Click to spawn, drag to attract

---

## Technical Considerations

### Performance

- **Target:** 60fps with 50+ fireflies
- **Optimization Strategies:**
  - Spatial partitioning for collision detection
  - Object pooling for particles
  - RequestAnimationFrame batching
  - CSS transforms over position changes
  - Reduce DOM operations

### Architecture

```
digital-life/
├── core/
│   ├── Firefly.js          # Individual firefly class
│   ├── Ecosystem.js        # Population manager
│   ├── CollisionSystem.js  # Collision detection
│   └── LifeCycle.js        # Birth/death logic
├── behaviors/
│   ├── Movement.js         # Organic movement
│   ├── Hunting.js          # Predator/prey
│   └── Swarming.js         # Group behavior
├── effects/
│   ├── Particles.js        # Death burst, trails
│   ├── ShootingStar.js     # Star system
│   └── Constellation.js    # Pattern formation
└── index.js                # Main export
```

### Configuration

```javascript
const ECOSYSTEM_CONFIG = {
    population: {
        initial: 20,
        min: 10,
        max: 50
    },
    lifecycle: {
        birthDuration: 3000,
        minAge: 30000,
        maxAge: 90000
    },
    collision: {
        radius: 20,
        cooldown: 2000
    },
    energy: {
        initial: 100,
        decayRate: 0.5,
        collisionBoost: 30
    },
    hunting: {
        enabled: true,
        huntSpeed: 1.2,
        fleeSpeed: 1.5,
        detectionRadius: 150
    }
};
```

---

## Sprint Breakdown

| Sprint | Focus | Deliverables |
|--------|-------|--------------|
| **DL-1** | Life Cycle | Birth, growth, death, respawn |
| **DL-2** | Collisions | Detection, rules, generation |
| **DL-3** | Ecosystem | Predator/prey, energy, mitosis |
| **DL-4** | Advanced | Constellations, house personality |
| **DL-5** | Polish | Performance, configuration, tuning |

---

## Success Criteria

- [ ] Fireflies feel "alive" - not mechanical
- [ ] Emergent behaviors visible without explanation
- [ ] Performance maintained at 60fps
- [ ] House colors properly inherited
- [ ] Population self-balances (doesn't explode or die out)
- [ ] Death/birth feels natural, not jarring
- [ ] Users notice and appreciate the detail

---

*"They're not just decoration - they're digital life."*
