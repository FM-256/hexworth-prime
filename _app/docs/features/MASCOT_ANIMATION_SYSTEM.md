# Mascot Animation System — Maintenance Guide

**Version:** 2.0.0
**Last Updated:** 2026-03-18
**Location:** `_app/components/mascot/`

---

## Overview

The Mascot system renders animated house mascots across Hexworth Prime — in the dashboard widget, the terrarium, encounters, and seasonal overlays. Each of the 11 houses has a unique mascot with its own shape, idle animation, and reaction set.

The system is **pure CSS animation** — no canvas, no WebGL, no external libraries.

---

## File Inventory

| File | Purpose |
|------|---------|
| `MascotManager.js` | Singleton manager: mascot configs, DOM rendering, state machine, reaction queue |
| `mascot-animations.css` | All keyframes, idle/reaction selectors, shapes, speech bubbles, terrarium, responsive |
| `mascot-effects.css` | Per-house signature FX (loaded by HouseRenderer.js and dashboard) |
| `mascot-encounters.js` | Cross-mascot dialogue system with 20+ pair-specific dialogues |
| `mascot-seasonal.js` | Date-based seasonal overlays (spring/summer/fall/winter/halloween/holiday) |
| `mascot-widget.html` | Embeddable widget demo page |
| `mascot-terrarium.html` | Full terrarium view with wandering mascots |

---

## Two-Layer Animation Architecture

### The Problem (v1)

In v1, idle and reaction animations both targeted the `.mascot-entity` element via CSS class swaps. When a reaction fired:

1. Remove idle class (e.g. `mascot-idle-breathe`) --> animation resets to keyframe 0%
2. Add reaction class (e.g. `mascot-react-happy`) --> reaction plays
3. Remove reaction class, re-add idle class --> animation resets AGAIN

This caused visible "jumps" every time. The mascot would freeze between states, and the idle loop would restart from the beginning instead of continuing smoothly.

### The Solution (v2)

Split idle and reaction onto **separate DOM layers**:

```
.mascot-entity                      <-- holds class names for both
  .mascot-reaction-layer            <-- reaction keyframes animate THIS
    .mascot-body                    <-- idle keyframes animate THIS (never stops)
    .mascot-eyes                    <-- blink animation (independent, infinite)
    .mascot-detail                  <-- house accent shape
  .mascot-name-tag                  <-- stable label, outside reaction layer
```

**Why it works:** CSS transforms stack through the DOM hierarchy. When `.mascot-body` has `transform: scale(1.05)` (breathing) and `.mascot-reaction-layer` has `transform: translateY(-15px)` (happy bounce), the browser composes both. The mascot breathes AND bounces simultaneously.

### CSS Selector Pattern

```css
/* IDLE — targets .mascot-body, runs forever */
.mascot-idle-breathe .mascot-body {
    animation: mascot-breathe 4s ease-in-out infinite;
}

/* REACTION — targets > .mascot-reaction-layer, plays once */
.mascot-react-happy > .mascot-reaction-layer {
    animation: mascot-happy 0.8s ease-out;
}
```

The idle class is **never removed**. It stays on `.mascot-entity` for the lifetime of the mascot. Reactions are added/removed on the same `.mascot-entity`, but their CSS selectors target the reaction-layer child instead.

---

## State Machine

```
IDLE  --[triggerReaction]--> REACTING --[animationend]--> IDLE
                                |
                                +--> if queue not empty: 300ms delay --> REACTING
```

- **IDLE:** Mascot loops its idle animation. Ready for reactions.
- **REACTING:** Reaction class added, speech bubble shown. Waits for `animationend` on `.mascot-reaction-layer` (with 2s fallback timeout).
- **Queue:** If `triggerReaction()` is called while REACTING, the reaction is pushed to `reactionQueue[]` and played after the current one finishes (300ms gap between queued reactions).

---

## Speech Bubbles

- **Appear:** CSS keyframe `speech-appear` (0.3s fade + slide up)
- **Disappear:** JS adds `.speech-leaving` class (CSS `opacity: 0` over 400ms transition), then removes from DOM after 450ms
- **Replacement:** If a new bubble is shown while one exists, the old one is removed immediately (no fade) to prevent stacking

---

## Adding a New House Mascot

1. **MascotManager.js** — Add entry to `MASCOTS` object:
   ```js
   newhouse: {
       name: 'DisplayName',
       cssClass: 'mascot-newhouse',
       color: '#hexcolor',
       house: 'NewHouse',
       domain: 'What It Teaches',
       idleAnimation: 'mascot-idle-breathe', // pick from existing or create new
       personality: 'One-liner personality.',
       reactions: {
           achievement: { text: '...', anim: 'mascot-react-achievement' },
           // ... all 6 reaction types
       }
   }
   ```

2. **mascot-animations.css** — Add shape styles:
   ```css
   .mascot-newhouse .mascot-body {
       width: XXpx; height: XXpx;
       background: linear-gradient(...);
       /* clip-path, border-radius, etc. */
   }
   ```

3. **mascot-effects.css** — Add signature FX:
   ```css
   .mascot-fx-newhouse { animation: mascotBreath Xs ease-in-out infinite; }
   .mascot-fx-newhouse::before { /* glow/shimmer overlay */ }
   ```

4. **mascot-encounters.js** — Add dialogue pairs for interactions with other houses

---

## Adding a New Idle Animation

1. Define the keyframes in `mascot-animations.css`:
   ```css
   @keyframes mascot-yourname {
       0%, 100% { transform: ...; }
       50% { transform: ...; }
   }
   ```

2. Add the selector targeting `.mascot-body`:
   ```css
   .mascot-idle-yourname .mascot-body {
       animation: mascot-yourname Xs ease-in-out infinite;
   }
   ```

3. Reference it in `MascotManager.js` MASCOTS entry: `idleAnimation: 'mascot-idle-yourname'`

---

## Adding a New Reaction Animation

1. Define the keyframes in `mascot-animations.css`:
   ```css
   @keyframes mascot-yourreaction { ... }
   ```

2. Add the selector targeting `> .mascot-reaction-layer`:
   ```css
   .mascot-react-yourreaction > .mascot-reaction-layer {
       animation: mascot-yourreaction Xs ease-out;
   }
   ```

3. Reference in MASCOTS reactions: `{ text: '...', anim: 'mascot-react-yourreaction' }`

---

## Common Pitfalls

| Pitfall | Why | Fix |
|---------|-----|-----|
| Reaction animation doesn't play | `animationend` fires immediately if animation was already cached | Ensure reaction class is removed before re-adding (force reflow if needed) |
| Idle animation jumps on house switch | `setHouse()` replaces the entire entity DOM | Expected behavior — the new mascot starts fresh |
| Mascot body invisible | `.mascot-body` has no width/height | Every house needs explicit dimensions in its shape CSS |
| `forwards` fill-mode on reaction | Reaction stays in final state, blocks idle | Only use `forwards` on reactions that should persist (like sad droop) |
| Speech bubble stacks | `_showSpeech()` not clearing old one | Always calls `_hideSpeech()` first — check it's not being bypassed |

---

## Performance Notes

- All animations use `transform` and `opacity` only (GPU-composited, no layout thrashing)
- Eye blink uses `--blink-offset` CSS var for staggered timing (no JS timer)
- Reaction cleanup uses native `animationend` event (no polling)
- `prefers-reduced-motion` is respected in `mascot-effects.css` — all FX disabled

---

## Integration Points

- **Dashboard widget:** Imports via `<script src="mascot-seasonal.js">` then `<script src="MascotManager.js">`, calls `MascotWidget.init()`
- **HouseRenderer.js:** Applies `.mascot-fx-{house}` classes from `mascot-effects.css`
- **Encounter system:** Listens for `mascot-encounter` CustomEvent on `document`
- **Terrarium:** Uses `.mascot-terrarium-wander` and `.mascot-terrarium-approach` classes for movement

---

*Maintained as part of Hexworth Prime Digital Life subsystem.*
