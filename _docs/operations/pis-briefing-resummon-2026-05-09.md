# PIS CTF Lab — Briefing Re-summon (UX Plan)

**Status:** PLAN — Nancy review pending
**Created:** 2026-05-09
**Course:** CIS2350C — Principles of Information Security (PIS)
**Scope:** 12 PIS CTF labs at `_app/houses/shield/infosec/labs/pis-l{01..12}-*/`

## Problem (operator-reported)

Students enter a PIS CTF lab and have no clue of direction. They don't know the scenario, the objectives, or the success criteria. After ~30 seconds they're guessing or alt-tabbing back to the LMS to look for instructions.

## Discovery (what actually exists)

The briefing infrastructure is **already built**:
- `_app/arena/engine/BriefingPage.js` — full overlay component with title, scenario briefing, learning objectives, MITRE tags, toolkit, "First Time?" FAQ collapsible
- All 12 PIS labs invoke it: `BriefingPage.show(<Config>, function() { BoxEngine.init(<Config>); });`
- Each lab's `config.js` populates the briefing fields: `title`, `subtitle`, `description`, `lore.intro`, `certObjectives.mappings`, `flags`, `hints`

So the briefing DOES show on first entry. The problem is **after dismissal**:
1. Student clicks "Launch Mission" → briefing fades out, BoxEngine boots → briefing GONE
2. Or worse: student clicks "Skip briefing next time" → `localStorage['hexworth_skip_briefing'] = 'true'` is set GLOBALLY (not per-lab) → student never sees ANY briefing on ANY lab again, even on first entry to a new lab
3. Mid-lab, student forgets the scenario → no way to re-open the briefing

## Root cause

Two compounding UX defects:

**Defect 1:** No re-summon button in the lab desktop. Once dismissed, briefing is unrecoverable until next session (or never, if "skip next time" was clicked).

**Defect 2:** `STORAGE_KEY = 'hexworth_skip_briefing'` is a single global flag, not per-lab. Clicking skip on ANY lab silences briefings everywhere.

## Fix (v2 — Nancy v1 concerns folded in)

**Two-part change. NO BoxEngine modification.**

Nancy v1 surfaced that BoxEngine.js:1110-1115 already exposes `default: this.config.onAppLaunch(iconDef, this)` as the extension point for custom desktop apps. Using this keeps BoxEngine untouched, scopes the change entirely to per-lab config + a small BriefingPage option.

### Part A — Per-lab config.js (PIS-L01 first, pattern-rollout L02-L12 after)

Each PIS lab's `config.js` has a `desktop.icons` array. Add a `briefing` icon AND an `onAppLaunch` handler:

```js
desktop: {
    icons: [
        { id: 'briefing', label: 'Briefing',    icon: '📋', app: 'briefing' }, // NEW
        { id: 'terminal', label: 'Terminal',    icon: '🖥️', app: 'terminal' },
        { id: 'notes',    label: 'Notes',       icon: '📝',    app: 'notes'    },
        { id: 'hints',    label: 'Hints',       icon: '💡',    app: 'hints'    },
        { id: 'flags',    label: 'Submit Flag', icon: '🚩',    app: 'flags'    }
    ]
},

// Custom app dispatch — handles `briefing` icon click via existing
// BoxEngine `default:` extension point (BoxEngine.js:1110-1115).
// No BoxEngine modification needed.
onAppLaunch: function(iconDef, engine) {
    if (iconDef.app === 'briefing') {
        // Re-summon — bypass the skip-next-time localStorage check.
        // Lab is already running; callback is a no-op.
        BriefingPage.show(this, function() {}, { force: true });
    }
}
```

The `this` inside `onAppLaunch` resolves to the config object itself (the lab's own config) — same one BriefingPage was invoked with on initial boot.

### Part B — BriefingPage `force` option + hide skip button on forced opens

Modify `BriefingPage.show(config, callback, options)` to accept `{ force: true }`. When `force` is set:

1. Bypass the `localStorage[STORAGE_KEY] === 'true'` check (re-open even if previously skipped)
2. **Hide the "Skip briefing next time" button** — a student opening the briefing intentionally mid-lab should NOT be one misclick away from silencing all future briefings (Nancy v1 concern 4)

```js
// In BriefingPage._buildOverlay, replace the skip-button render with:
if (!options || !options.force) {
    html += '<button class="bp-skip-link">Skip briefing next time</button>';
} else {
    html += '<button class="bp-skip-link bp-close-only">Close</button>';
    // Close-only variant: dismisses without writing to localStorage
}
```

## Out of scope (intentionally)

- Changing the global `hexworth_skip_briefing` to per-lab. That's a separate UX decision (operator may legitimately want global skip for power users); this fix gives students the re-summon option, which is the primary need.
- Briefing copy edits per lab. Each lab's `config.lore.intro` is already populated by the lab author. If the briefing TEXT itself is inadequate, that's a content task, not a UX/wiring task. This plan only fixes the access-during-lab gap.
- FW labs at `_app/houses/shield/intro-security/labs/`. Those are a different course (First Watch, not PIS). They use the same `arena/engine/` infrastructure though, so the fix will benefit them automatically once shipped — but the operator-stated scope is PIS, so we ship for PIS first and let pattern-rollout to FW be a separate decision.
- The 11 Dispatch boxes at `_app/houses/shield/dispatch/`, the CTF arena boxes, the dark-arts CTF labs. Same pattern — if their `config.js` has a `desktop.icons` array, adding the briefing icon is one-line; but operator scope is PIS-first.

## Pilot (one lab, then rollout)

**PIS-L01 first** — operator visual approval before L02-L12. Honest framing per Nancy v1 concern 3:

- The BriefingPage `force` option ships globally — every lab's `BriefingPage.show()` call could in principle pass `{ force: true }` once the option exists. PIS-L01's config is the only one wiring it up via `onAppLaunch`. No other lab will hit the new code path until its config also adds the icon + handler.
- L02-L12 rollout is per-lab config.js edits (one icon entry + one onAppLaunch handler each). Operator visually verifies PIS-L01 first, then approves the same diff for L02-L12 in a follow-on commit.
- No BoxEngine.js modification. The `default: onAppLaunch` extension hook at BoxEngine.js:1110 already exists for exactly this purpose.

## CLAUDE.md rule 5 verification (position: fixed under filter)

Nancy v1 concern 1: BriefingPage uses `position: fixed`. CLAUDE.md rule 5 says position:fixed breaks when `body.style.filter` is set. Verified:

- `grep "body.style.filter\|body.style.transform" arena/engine/*` — zero matches in BoxEngine or arena.css
- BoxEngine has multiple existing overlays via `document.body.appendChild(overlay)` (survey at line 380, god-banner at line 510, etc.) — all use position:fixed and work in production
- The re-summoned BriefingPage uses identical DOM-attachment pattern → safe by existing-overlay precedent

## Testing

- Open PIS-L01 fresh (clear localStorage). Briefing shows on boot. Click Launch. Lab boots. Click Briefing icon on desktop. Briefing re-opens. Click Launch again. Briefing dismisses, lab still running cleanly.
- Repeat with `localStorage['hexworth_skip_briefing'] = 'true'` set. Open PIS-L01 fresh. Briefing skipped on boot (correct). Click Briefing icon on desktop. Briefing opens (force flag bypasses the skip check). Click Launch. Briefing dismisses.
- EduScan smoke test on PIS-L01 — confirm no critical/high regressions.
- 60/60 EduScan tests should still pass.

## Files changed

1. `_app/arena/engine/BriefingPage.js` — accept `options.force` parameter
2. `_app/houses/shield/infosec/labs/pis-l01-specimen-classification/config.js` — add briefing icon + onAppLaunch handler
3. (operator-deferred): L02-L12 config.js additions — same pattern, one icon entry + one onAppLaunch handler each

**No BoxEngine.js modification.** The `default: this.config.onAppLaunch(iconDef, this)` extension hook at BoxEngine.js:1110-1115 already exists for exactly this purpose.

## Emoji decision (Nancy v2 concern 3 — explicit call)

The new briefing icon uses `'📋'` (📋 clipboard) as a unicode escape, matching the four pre-existing icons in pis-l01/config.js (`🖥️`, `📝`, `💡`, `🚩`). Decision rationale:

- EduScan's emoji validator (`_tools/eduscan/validators/syntax/emoji.js:121-127`) `GLOBAL_JS_DIRS` covers `components`, `config`, `utils`, `digital-life`, `workshop` — NOT `houses/`. Lab `config.js` files are a known EduScan coverage gap and have been since the labs were built.
- The four existing emoji in this file are the same policy violation; adding a fifth in the same convention does not introduce new debt — the debt is the file-level pattern, not the icon count.
- Switching to webp icons would require migrating ALL 5 icons (existing 4 + new 1) for visual consistency, AND verifying BoxEngine renders icon paths for desktop icons, AND auditing the same pattern across all 12 PIS labs + dispatch + dark-arts + colosseum labs that use the same `desktop.icons` schema. That is a separate cleanup task, not part of the briefing re-summon UX fix.
- Operator-known accepted debt: the plan ships emoji-as-unicode-escape consistent with the file's existing convention, with a code comment marking the known EduScan blind spot.

If the operator wants the broader emoji-to-webp migration, that becomes a separate sprint item (suggest: tracked under emoji validator coverage expansion rather than per-lab config rewrite).

## Nancy review checkpoints

- Is `options.force` the right API surface, or should we expose a separate `BriefingPage.reopen()` function?
- Does BoxEngine already have a generic "open arbitrary app" pattern, or does each app type need its own switch case? If generic, the briefing case is one entry; if not, we should match existing convention.
- Any concerns about the briefing overlay re-mounting while a lab terminal session is active (focus stealing, keyboard event leakage, BoxEngine state)?
- Per `feedback_no_emoji` — emoji clipboard glyph in the icon is consistent with the existing terminal/notes/hints/flags icons (which all use emoji). Or should we replace with a webp icon from `/assets/images/icons/`?
