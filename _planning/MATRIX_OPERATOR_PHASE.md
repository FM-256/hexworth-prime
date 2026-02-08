# Matrix Operator Phase - Implementation Plan

**Status:** Planned (Next Phase)
**Created:** December 2025

---

## Concept Summary

Matrix users bypass the sorting quiz entirely. By choosing "Matrix" they have already declared their identity—they are **Operators**, those who chose to see the code.

This creates two parallel experiences in Hexworth Prime:
- **Magic Path:** Wonder, mystery, sorting, houses
- **Matrix Path:** Logic, control, self-selection, terminal interface

---

## The Philosophy

| Magic Mindset | Matrix Mindset |
|---------------|----------------|
| "Sort me" | "I know who I am" |
| Discovery through questions | Declaration through choice |
| The algorithm reveals nature | You reveal your own nature |
| Passive acceptance | Active assertion |
| Wonder and mystery | Logic and certainty |

> "They rejected the magical worldview. They get a reality that matches their choice."

---

## User Flow

### Current (Magic Only)
```
START.html → index.html (Choose Reality) → sorting.html → dashboard.html
```

### New (Dual Path)
```
START.html → index.html (Choose Reality)
                │
                ├── Magic → sorting.html → dashboard.html
                │
                └── Matrix → connect.html → terminal.html
```

---

## New Files to Create

### 1. `app/connect.html` - Matrix Entry Sequence

A brief "connection" animation before entering the terminal:

```
> ESTABLISHING CONNECTION...
> NEURAL HANDSHAKE COMPLETE
> IDENTITY VERIFIED

Welcome, Operator.

You chose to see the code.
There is no sorting. There is only what you make of it.

[ JACK IN ]
```

**Features:**
- Terminal-style text animation (typewriter effect)
- Green-on-black aesthetic
- Brief but atmospheric
- Sets localStorage: `hexworth_theme: 'matrix'`, `hexworth_house: 'operator'`
- Navigates to `terminal.html` on button click

---

### 2. `app/terminal.html` - Operator Dashboard

A completely different UI from `dashboard.html`:

```
┌─────────────────────────────────────────────────────────────────┐
│ HEXWORTH PRIME v0.1.0                          OPERATOR: ACTIVE │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  > AVAILABLE PROGRAMS                                           │
│                                                                 │
│    [01] NET_PROTOCOLS      Network fundamentals & packet flow   │
│    [02] SEC_FRAMEWORK      Security principles & threat models  │
│    [03] SYS_ARCHITECTURE   Hardware & system internals          │
│    [04] AUTO_SCRIPTS       Automation & scripting               │
│    [05] CLOUD_INFRA        Infrastructure & deployment          │
│    [06] DEV_OPS            Development & CI/CD pipelines        │
│    [07] CRYPTO_SYSTEMS     Encryption & identity                │
│    [08] MON_ANALYSIS       Monitoring & log analysis            │
│    [09] RED_PROTOCOLS      [LOCKED] Requires clearance          │
│                                                                 │
│  > SYSTEM STATUS                                                │
│    Programs completed: 0                                        │
│    Access level: STANDARD                                       │
│    Uptime: 1 day                                                │
│                                                                 │
│  > _                                                            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Features:**
- Monospace font throughout
- Green (#00ff41) on black (#0a0a0a) color scheme
- ASCII box-drawing characters for UI elements
- Blinking cursor prompt
- Same 9 learning paths, different names
- Programs listed as numbered entries
- System status instead of "Your Journey" stats

---

## Program Mapping (Magic ↔ Matrix)

| Magic House | Matrix Program | Domain |
|-------------|----------------|--------|
| House of the Web | NET_PROTOCOLS | Networking |
| House of the Shield | SEC_FRAMEWORK | Security |
| House of the Forge | SYS_ARCHITECTURE | Hardware |
| House of the Script | AUTO_SCRIPTS | Automation |
| House of the Cloud | CLOUD_INFRA | Cloud/Infrastructure |
| House of the Code | DEV_OPS | Development |
| House of the Key | CRYPTO_SYSTEMS | Cryptography |
| House of the Eye | MON_ANALYSIS | Monitoring |
| House of the Dark Arts | RED_PROTOCOLS | Offensive Security |

---

## Operator Identity

Add to houses object (or separate operators object):

```javascript
const operator = {
    name: 'Operator',
    designation: 'OPERATOR',
    domain: 'Those Who See The Code',
    icon: '⌘',  // or '>' or '█'
    description: 'You chose to see reality as it truly is—lines of code, patterns of data, systems within systems. You are not sorted. You are self-selected.'
};
```

---

## Digital Life - Matrix Mode

### Visual Differences

| Aspect | Magic Mode | Matrix Mode |
|--------|------------|-------------|
| Movement | Organic, flowing | Grid-aligned, digital |
| Colors | Warm (gold, purple, blue) | Green phosphor (#00ff41), cyan |
| Entities | "Fireflies" | "Data fragments" |
| Trails | Smooth curves | Pixelated / stepped |
| Shooting stars | Magical streaks | Code rain / falling characters |
| Cosmic events | Solar Flare, Eclipse | MEMORY_LEAK, BUFFER_OVERFLOW |
| Black hole | Gravitational anomaly | DATA_SINK |

### Implementation Options

**Option A: CSS Filter**
Apply a CSS filter to the entire Digital Life canvas for Matrix mode:
```css
.matrix-mode #digital-life-canvas {
    filter: hue-rotate(80deg) saturate(1.5);
}
```
Quick but limited.

**Option B: Color Configuration**
Pass color scheme to Digital Life initialization:
```javascript
DigitalLife.createAmbient({
    colorScheme: 'matrix',  // or 'magic'
    // Internally uses green palette instead of default
});
```
More control, moderate effort.

**Option C: Full Matrix Mode**
Create `DigitalLife.createMatrix()` factory with:
- Different particle shapes (squares instead of circles)
- Code rain effect instead of shooting stars
- Glitch effects instead of cosmic events
- Terminal-style event names

Most immersive, highest effort.

---

## Code Changes Required

### 1. `app/index.html` - Update selectReality()

```javascript
function selectReality(theme) {
    localStorage.setItem('hexworth_theme', theme);

    if (theme === 'matrix') {
        window.location.href = 'connect.html';
    } else {
        window.location.href = 'sorting.html';
    }
}
```

### 2. Theme Detection Throughout

Any page that needs to know the theme:
```javascript
const theme = localStorage.getItem('hexworth_theme') || 'magic';
const isMatrix = theme === 'matrix';
```

### 3. Shared Module Content

Both `dashboard.html` and `terminal.html` will eventually link to the same learning content. The content itself doesn't need to be duplicated—just the UI wrapper differs.

---

## Language Guide

### Magic Vocabulary → Matrix Vocabulary

| Magic | Matrix |
|-------|--------|
| House | Program / Protocol |
| Sorting | Assignment |
| The algorithm knows | System analysis complete |
| You belong to... | Assignment: ... |
| Achievements | Clearance upgrades |
| Modules | Subroutines |
| Complete | Execute |
| Locked | Access denied / Requires clearance |
| The Five Gates | RED_PROTOCOL authentication |
| Welcome to Hexworth | Connection established |
| Your journey | System uptime |

---

## Implementation Order

1. **Phase 1: Basic Dual Path**
   - [ ] Create `connect.html` (Matrix entry)
   - [ ] Create `terminal.html` (basic version)
   - [ ] Update `index.html` to route Matrix users
   - [ ] Add 'operator' to identity system

2. **Phase 2: Terminal Polish**
   - [ ] Terminal aesthetics (fonts, colors, animations)
   - [ ] Typing effect for connection sequence
   - [ ] Blinking cursor
   - [ ] ASCII box-drawing UI

3. **Phase 3: Digital Life Matrix Mode**
   - [ ] Green color scheme option
   - [ ] Code rain effect (optional)
   - [ ] Matrix-themed cosmic events (optional)

4. **Phase 4: Content Integration**
   - [ ] Link both dashboards to same learning modules
   - [ ] Ensure progress syncs regardless of UI theme

---

## Open Questions

1. **Can users switch themes?**
   - If someone chose Magic, can they later switch to Matrix (or vice versa)?
   - Recommendation: Allow in settings, but require confirmation ("This will change your reality")

2. **Does progress carry over?**
   - If a Magic user switches to Matrix, do they keep their completed modules?
   - Recommendation: Yes, progress is identity-agnostic

3. **RED_PROTOCOLS access**
   - Is the Five Gates CTF the same for both paths?
   - Recommendation: Same challenges, different framing (Magic: mystical gates, Matrix: security clearance levels)

---

## Reference Files

- `app/dashboard.html` - Magic dashboard (reference for terminal.html structure)
- `app/sorting.html` - Magic sorting (bypass for Matrix users)
- `_planning/HEXWORTH_PHILOSOPHY.md` - Core philosophy guiding all decisions
- `src/digital-life/index.js` - Digital Life presets (add Matrix mode here)

---

*This document captures the vision. Ready for implementation next session.*
