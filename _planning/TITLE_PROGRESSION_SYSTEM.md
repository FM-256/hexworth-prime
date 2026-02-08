# Hexworth Prime - Title & Progression System

**Created:** December 24, 2025
**Status:** Design Phase - Needs Implementation
**Priority:** High - Core Gamification Feature

---

## Overview

A multi-layered title and progression system that rewards skill mastery with themed ranks, culminating in a GOT-style cumulative title that grows as users complete learning paths.

**Inspiration:** Game of Thrones titles ("Daenerys Targaryen, First of Her Name, Queen of the Andals, Khaleesi of the Great Grass Sea, Breaker of Chains, Mother of Dragons...")

---

## System Architecture

### Layer 1: Identity (Fixed on Selection)

The user's core identity based on their path choice:

| Path | Identity | How Acquired |
|------|----------|--------------|
| Magic (House) | "House of the [X]" | Sorting quiz |
| Magic (Divergent) | "The Factionless" | Multi-select 3+ questions during sorting |
| Matrix | "OPERATOR" | Choose Matrix at reality fork |

### Layer 2: Skill Levels (Per Skill Tree)

Each skill/learning path has 5 progression tiers. User advances through tiers by completing modules within that skill.

```
Tier 1: Entry Level (Complete Part 1)
Tier 2: Foundational (Complete Part 2)
Tier 3: Practitioner (Complete Part 3)
Tier 4: Advanced (Complete Part 4)
Tier 5: Master (Complete Part 5 / Capstone)
```

### Layer 3: GOT Cumulative Title

When a user reaches **Tier 5 (Master)** in any skill, that skill's master title is permanently added to their cumulative title string.

---

## Title Themes by House Type

### Hexworth Theme (Magical/Academic)
*Applies to: Web, Forge, Cloud, Key*

| Tier | Title |
|------|-------|
| 1 | Initiate |
| 2 | Acolyte |
| 3 | Adept |
| 4 | Mage |
| 5 | **Archon** |

### Hacker Theme (Tech/Operator)
*Applies to: Script, Code, Eye, Shield, Dark Arts*

| Tier | Title |
|------|-------|
| 1 | Recruit |
| 2 | Coder |
| 3 | Specialist |
| 4 | Engineer |
| 5 | **Architect** |

### Dark Arts Theme (Edgy/Shadow)
*Applies to: Dark Arts house specifically (optional override)*

| Tier | Title |
|------|-------|
| 1 | Lurker |
| 2 | Grey Hat |
| 3 | Shadow |
| 4 | Phantom |
| 5 | **Specter** |

### Operator Theme (Matrix Path)
*Applies to: Users who chose the Matrix path*

| Tier | Title |
|------|-------|
| 1 | Plugged In |
| 2 | Awakened |
| 3 | Freed |
| 4 | Sentinel |
| 5 | **The One** |

### Factionless Theme (Glitch/Chaos)
*Applies to: Divergent users*

| Tier | Title |
|------|-------|
| 1 | Anomaly |
| 2 | Glitch |
| 3 | Ghost |
| 4 | Phantom |
| 5 | **Specter** |

---

## Skill-Specific Master Titles

When users max out a skill (reach Tier 5), they earn a specific master title:

### Cross-House Learning Paths

| Skill Path | Houses Involved | Master Title |
|------------|-----------------|--------------|
| API Mastery | Web → Script → Code → Tools | **API Architect** |
| Crypto Mastery | Key (all content) | **Crypto Archon** |
| Network Mastery | Web (all content) | **Network Archon** |
| Security Mastery | Shield (all content) | **Shield Architect** |
| Cloud Mastery | Cloud (all content) | **Cloud Archon** |
| DevOps Mastery | Code (all content) | **DevOps Architect** |
| Scripting Mastery | Script (all content) | **Script Architect** |
| Hardware Mastery | Forge (all content) | **Forge Archon** |
| SOC Mastery | Eye (all content) | **Eye Architect** |
| Dark Arts Mastery | Dark Arts (all content) | **Dark Specter** |

### Special Achievement Titles

Bonus titles for special accomplishments:

| Achievement | Title Earned | Requirement |
|-------------|--------------|-------------|
| First Blood | "First of Their Cohort" | First to complete any skill path |
| House Hopper | "Walker of All Paths" | Complete content in 5+ houses (Factionless perk) |
| Completionist | "Master of All Domains" | Max all skill trees |
| Speed Runner | "The Swift" | Complete a skill path in under X days |
| Perfectionist | "The Flawless" | Score 100% on all quizzes in a path |
| Dark Initiate | "Keeper of Forbidden Knowledge" | Complete Five Gates CTF |
| Legacy Builder | "Architect of Worlds" | Create X galaxies in Digital Life |
| Helper | "Guide of the Lost" | Help X other users (future social feature) |

---

## Example GOT Title Progressions

### Matrix User (Operator)

**Starting:**
```
Neo, OPERATOR
```

**After completing API Path:**
```
Neo, OPERATOR, API Architect
```

**After more completions:**
```
Neo, OPERATOR, API Architect, Script Architect,
Defender of the Perimeter, Keeper of Forbidden Knowledge
```

### Magic User (House of the Key)

**Starting:**
```
Alice, House of the Key
```

**After completing Crypto Path:**
```
Alice, House of the Key, Crypto Archon
```

**After more completions:**
```
Alice, House of the Key, Crypto Archon, API Architect,
Network Adept, Keeper of Secrets, The Flawless
```

### Factionless User (Divergent)

**Starting:**
```
Ghost, The Factionless
```

**After completing multiple house content:**
```
Ghost, The Factionless, API Architect, Network Archon,
Walker of All Paths, System Anomaly, Master of None and All
```

---

## Learning Path Example: API Mastery

A cross-house skill path demonstrating the full system:

### Structure

| Part | House | Content Focus | Tier Earned |
|------|-------|---------------|-------------|
| Part 1 | Commons/Fundamentals | What is an API? | API Initiate |
| Part 2 | Web | How APIs Work (HTTP, REST) | API Acolyte |
| Part 3 | Script | How to Use APIs (Python requests) | API Specialist |
| Part 4 | Code | How to Build APIs (Design, OpenAPI) | API Engineer |
| Part 5 | Tools | Professional Tools (Postman) + Capstone | **API Architect** |

### Unlock Mechanism

- Part 1: Always unlocked (entry point)
- Part 2: Locked until Part 1 completed
- Part 3: Locked until Part 2 completed
- Part 4: Locked until Part 3 completed
- Part 5: Locked until Part 4 completed

### Content Components Per Part

Each part should include:

| Component | Purpose |
|-----------|---------|
| Presentation | Theory and concepts |
| Interactive Applet | Hands-on practice |
| Lab Exercise | Applied skill building |
| Quiz | Knowledge verification |
| Challenge (optional) | Advanced test |

### Navigation

- Each part shows "Next Part" link (even if locked - shows lock icon)
- Progress indicator shows overall path completion
- Skill tree visualizes dependencies

---

## Data Structure

```javascript
const ProgressionSystem = {
    // User's identity
    identity: {
        type: 'house' | 'operator' | 'factionless',
        house: 'web' | 'shield' | ... | null,
        username: 'string'
    },

    // Skill progress (per skill)
    skills: {
        'api': {
            tier: 3,
            partsCompleted: ['part1', 'part2', 'part3'],
            currentTitle: 'API Specialist',
            maxed: false
        },
        'crypto': {
            tier: 5,
            partsCompleted: ['part1', 'part2', 'part3', 'part4', 'part5'],
            currentTitle: 'Crypto Archon',
            maxed: true
        }
        // ...
    },

    // Cumulative GOT title
    gotTitle: {
        base: 'Alice, House of the Key',
        earnedTitles: [
            'Crypto Archon',
            'API Architect',
            'The Flawless'
        ],
        fullTitle: 'Alice, House of the Key, Crypto Archon, API Architect, The Flawless'
    },

    // Special achievements
    achievements: [
        { id: 'perfectionist', title: 'The Flawless', earnedDate: '2025-12-24' }
    ]
};
```

---

## UI/UX Considerations

### Title Display Locations

| Location | Display Style |
|----------|---------------|
| Profile Page | Full GOT title with all earned titles |
| Dashboard Header | Abbreviated (Identity + 2 recent titles) |
| Module Cards | Relevant skill tier badge |
| Leaderboards | Full title (scrolling if long) |
| Hover/Tooltip | Full title on hover |

### Visual Indicators

- **Tier Progress Bar:** 5 segments, fills as user progresses
- **Lock Icons:** Greyed out with lock for unavailable parts
- **Completion Checkmarks:** Green check for completed parts
- **Master Badge:** Special badge/glow when Tier 5 reached
- **Title Animation:** Celebratory animation when new title earned

### Sound Effects

- Level up sound when advancing tiers
- Triumphant fanfare when reaching Tier 5
- Special sound for GOT title extension

---

## Implementation Plan

### Phase 1: Data Foundation
- [ ] Create `config/progression-system.js` with skill definitions
- [ ] Add title tier mappings
- [ ] Create localStorage schema for progress tracking
- [ ] Integrate with existing ContentRegistry

### Phase 2: Learning Paths
- [ ] Build first learning path (API Mastery)
- [ ] Implement lock/unlock mechanism
- [ ] Add "Next Part" navigation
- [ ] Create progress indicators

### Phase 3: Title System
- [ ] Implement GOT title builder
- [ ] Create title display components
- [ ] Add title earn animations
- [ ] Build profile title showcase

### Phase 4: UI Integration
- [ ] Add tier badges to module cards
- [ ] Create skill tree visualization
- [ ] Implement dashboard title display
- [ ] Add achievement notifications

### Phase 5: Polish
- [ ] Sound effects
- [ ] Animations
- [ ] Mobile responsiveness
- [ ] Edge case handling

---

## Questions to Resolve

1. **Title Uniqueness:** Should titles be unique per user or can multiple users share "API Architect"?
2. **Title Order:** Should GOT titles appear in earned order or by importance?
3. **Title Retirement:** Can users "hide" certain titles from their display?
4. **Cross-Theme:** If Operator completes Crypto (Hexworth theme), which tier names apply?
5. **Skill Tree Visualization:** FF7-style nodes or linear path display?

---

## Related Documents

- `FACTIONLESS_SKILL_TREE.md` - File tree navigation for Divergent users
- `SECRET_FEATURES.md` - Hidden achievements and easter eggs
- `HOUSE_COMMUNITY.md` - House-specific behaviors and theming
- `IDEAS_BACKLOG.md` - Additional brainstorm ideas

---

*This document captures the Title & Progression System design discussed on December 24, 2025.*
*Move to sprint backlog when ready to implement.*
