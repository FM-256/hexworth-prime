# User Profile Modal

**Component:** UserProfileModal.js
**Location:** `_app/components/`
**Dashboard Section:** Leaderboard entries (click any entry)
**Added:** v5.0.0 (2026-03-01)

## Purpose

Clicking a leaderboard entry previously did nothing. The User Profile Modal makes every leaderboard entry interactive — click any name and a dossier card opens showing that user's public profile pulled from Firestore.

This serves two goals: social visibility (students can see how peers are progressing) and aspiration (seeing a higher-level student's stats motivates continued engagement). It also reinforces the spy aesthetic — viewing another agent's dossier.

## What It Does

Click any entry on the global or house leaderboard. A modal overlay appears with a loading spinner, fetches the user's Firestore profile via `FirestoreManager.getUserProfile(uid)`, and renders a full-color dossier card.

### Profile Card Contents

**Hero banner:** House-specific mascot image (`/assets/images/mascots/{house}-hero.webp`) with gradient overlay and CRT scanlines. Falls back gracefully if image missing.

**Identity section:**
- Avatar (Firestore `photoURL`, generated identicon via `generateAvatar()`, or initials fallback)
- Avatar ring glows in house color
- Callsign with `@` prefix
- "YOU" badge (green pill) if viewing own profile
- House name and domain (e.g., "House of the Shield — Security & Defense")
- House emblem icon

**Tier badge:** Pill-shaped badge showing account tier with icon from the fal.ai icon library:
- Founding Member — diamond icon, gold
- Early Adopter — target icon, sky blue
- Beta Tester — microscope icon, purple
- Operative (free) — detective icon, gray

**Level + XP bar:** Current level badge, total XP count, animated progress bar showing progress toward next level. Bar color matches house theme. Includes a sliding shine animation.

**Stats grid (5 columns):**
- Modules completed (books icon)
- Achievements unlocked (trophy icon)
- Labs completed (flask icon)
- Quizzes taken (clipboard icon)
- Current streak (lightning icon, or explosion icon with pulse animation if streak >= 3)

All stat icons are real webp images from `/assets/images/icons/`, not emoji.

**CTF + Games Stats row** (3 columns):
- Boxes Pwned (skull icon) — count of completed CTF arena boxes
- Flags Captured (footprint icon) — total flags found across all boxes
- Games (joystick icon) — unique arcade games played with recorded activity, synced from `GameTracker.getAggregate().gamesPlayed`

CTF stats are synced to Firestore on box completion via `BoxEngine._reportCompletion()`, which aggregates all `hexworth_ctf_*` localStorage keys and writes `ctfBoxesPwned` and `ctfFlagsCaptured` to the user profile.

**Footer:** Green pulsing dot + "Agent active since {month} {year}" from Firestore `createdAt` timestamp.

### Stats Data Pipeline

The profile modal reads all stats from the Firestore user profile document. Stats must be synced FROM localStorage TO Firestore to appear. The backfill runs on every dashboard auth callback (`firebaseAuthStateChanged`).

**Working correctly:**
- Modules (68) — `modulesCompleted[]` in Firestore, synced by bidirectional sync
- Achievements (40) — `achievements[]` in Firestore, synced by bidirectional sync
- Streak (19) — `streak` in Firestore, synced on login
- Boxes Pwned / Flags — `ctfBoxesPwned` / `ctfFlagsCaptured`, backfilled from `hexworth_ctf_*` localStorage keys

**Labs backfill** reads from 5 sources, merged via `Set()`:
1. `hexworth_lab_progress` standalone key (array)
2. `progress.labsCompleted[]` (structured top-level)
3. `progress.houses[*].labsCompleted[]` (structured per-house)
4. Flat-format entries `progress[houseId][moduleId]` where `.completed=true` and `.score==null` or ID matches `/lab|arena|tool|ctf/i`
5. CTF box keys (`hexworth_ctf_a1`–`a20`, b/c/d/e series) — completed boxes added as `arena-{prefix}{num}`

**Quizzes backfill** reads from 5 sources, merged by module ID key:
1. `hexworth_quiz_scores` standalone key (object)
2. `progress.houses[*].quizzesPassed[]` (structured per-house)
3. `progress.quizHistory[]` (legacy array, filtered by `score >= 70`)
4. Flat-format entries `progress[houseId][moduleId]` where `.completed=true` and `.score != null`
5. Course-specific standalone keys: `core2-ch01-quiz` through `core2-ch24-quiz`

**Storage formats** (the platform has 4 overlapping formats accumulated over versions):
1. **Structured format** — `hexworth_progress` with `houses.{id}.modulesCompleted[]`, `labsCompleted[]`, `quizzesPassed[]`
2. **Flat format** — within the same `hexworth_progress` object: `progress[houseId][moduleId] = {completed, score, completedAt}`
3. **Standalone keys** — `hexworth_quiz_scores`, `hexworth_lab_progress`, `hexworth_modules_completed`
4. **Course-specific keys** — `core2-ch{NN}-quiz`, `hexworth_progress_core1`, `hexworth_progress_core2`, `aplus-core1-progress`

**Reconciliation reference:** `ProgressManager._reconcileCounts()` (line ~890) uses `Math.max()` across structured, flat, and localStorage counter sources. The backfill mirrors this approach but collects IDs (not just counts) since Firestore stores arrays/objects.

### Firestore Security Rules

All profile fields must be whitelisted in `firestore.rules` (line 22-29) or client writes silently fail with "Missing or insufficient permissions." Current whitelist includes:

```
callsign, callsignLower, displayName, photoURL, house, theme, favorites,
settings, updatedAt, deviceId, accountType, firstName, lastName, studentId,
isAnonymous, lastActivity, xp, level, modulesCompleted, labsCompleted,
quizzes, achievements, streak, ctfBoxesPwned, ctfFlagsCaptured
```

When adding new profile fields, ALWAYS update both the component code AND firestore.rules.

### Public Data Only

The modal shows only safe public data. It does **not** expose:
- Email address
- Quiz scores or individual results
- Authentication details
- Internal user IDs (beyond what's needed for the query)

### Interactions

- **Open:** Click any leaderboard entry (`.fsl-entry` div has `onclick` handler)
- **Close:** Click overlay background, click X button (top-left), or press Escape
- **Loading state:** Spinner with "Retrieving agent dossier..." animated dots
- **Error state:** Siren icon with error message (e.g., "Agent dossier not found")

## Architecture

**IIFE** exposing two globals:
- `window.viewUserProfile(uid)` — open modal for given user ID
- `window.viewUserProfile.close()` — close modal

**Modal element:** Static `<div class="modal-overlay" id="userProfileModal">` in dashboard.html. Falls back to dynamically creating one if the static element is missing.

**Positioning fix:** Uses `position: absolute` with `top: window.scrollY` and `height: window.innerHeight` instead of `position: fixed`. This is required because the dashboard's easter egg effects set `document.body.style.filter`, which creates a new containing block and breaks `position: fixed` positioning. This is a known platform-wide issue tracked by EduScan rule HEUR-008.

**Styles:** Injected via `<style>` tag on DOMContentLoaded. All classes prefixed with `upm-` to avoid collisions. Uses CSS custom properties (`--hc`, `--hg`, `--hbg`) set per-profile based on house colors.

**Dependencies:**
- `FirestoreManager.getUserProfile(uid)` — fetches full user document
- `FirebaseAuth.getUser()` — detects if viewing own profile (for "YOU" badge)
- `generateAvatar()` — identicon generator (global in dashboard scope)
- `escapeHtml()` — XSS protection (global in dashboard scope). Must escape both `"` → `&quot;` and `'` → `&#39;` in addition to standard `<>&` — see Badge Grid section below.

**Script load order:** After FirestoreLeaderboard.js, before AchievementManager.js.

### FirestoreLeaderboard.js Changes

Two locations modified to add click handlers:

- `renderEntry()` — Each `.fsl-entry` div gets `onclick="if(typeof viewUserProfile==='function')viewUserProfile('${entry.id}')"` and `cursor: pointer`
- `renderUserRank()` — Same handler using `currentUser.uid` for the "your rank" entry below the fold

The `typeof` guard ensures the leaderboard works even if UserProfileModal.js fails to load.

## Theming

The modal is fully house-themed via CSS custom properties:
- `--hc` (house color) — used for avatar ring, XP bar, level badge, stat hover states
- `--hg` (house glow) — used for card border shadow, avatar ring shadow
- `--hbg` (house background) — used for stat hover backgrounds

Supports all 11 houses: web, shield, cloud, forge, script, code, key, eye, dark-arts, matrix, divergent.

**Responsive:** At 500px and below, the layout adjusts — smaller avatar, 3-column stats grid instead of 5, tighter padding.

## Level Calculation

XP-to-level formula (matches platform-wide calculation):

```
level = max(1, floor((1 + sqrt(1 + xp/12.5)) / 2))
xpForLevel(n) = floor(12.5 * (2n - 1)^2 - 12.5)
```

The XP bar shows progress from current level's XP threshold to next level's threshold.

## Badge Grid (Profile Tab)

The profile tab displays up to 12 earned achievement badges in a 4x3 grid. Each badge is a 100px circle with layered CSS backgrounds.

### Rendering

`buildBadgesGridHTML()` iterates earned achievements (v2 via `AchievementRegistry.getUnlockedIds()`, v1 fallback from `achievements[]` array). Each badge renders as:

```html
<div class="profile-badge-emoji"
     style="background-image: url('/assets/images/badges/{achId}.webp'),
                              url('/assets/images/icons/icon-trophy.webp')">
</div>
```

The two-layer `background-image` provides automatic fallback: if a badge-specific `.webp` exists in `/assets/images/badges/`, it renders full-size as the top layer. If not (e.g. auto-generated achievements from `generateFromCatalog()`), the transparent miss falls through to the trophy icon underneath. No `<img>` elements or `onerror` handlers needed.

**CSS:**
```css
.profile-badge-emoji {
    width: 100px; height: 100px;
    border-radius: 50%;
    background-color: rgba(255,255,255,0.04);
    background-size: cover, 45%;
    background-position: center, center;
    background-repeat: no-repeat, no-repeat;
    box-shadow: 0 0 8px rgba(0,255,255,0.3);
}
```

Clicking a badge opens a popover with the achievement name, description, and icon. Data attributes (`data-ach-name`, `data-ach-desc`, `data-ach-icon`) on each badge element carry the popover content.

### Badge Art Sources

- **304 static achievements** — all have matching `.webp` files in `/assets/images/badges/`
- **Auto-generated achievements** (`generateFromCatalog()`) — IDs like `complete_pres_{moduleId}`, no badge files; trophy fallback displays instead
- **OVERLAP_IDS** (13 IDs) — shared between AchievementSystem (plain URL icons) and AchievementManager (`<img>` HTML icons); the Registry merges System descriptions with Manager styles

### escapeHtml() Quote Escaping (Bug Fix, 2026-03-03)

**Root cause:** The standard `div.textContent`/`div.innerHTML` XSS escape technique only converts `<`, `>`, and `&`. It does NOT escape `"` or `'`. Achievement icons from AchievementManager are full `<img>` HTML strings containing many double quotes:

```
<img src="/assets/images/icons/icon-star.webp" alt="" style="width:1.1em;height:1.1em;...">
```

When placed into a `data-ach-icon="..."` attribute, the unescaped `"` inside the value terminated the attribute early, corrupting the HTML tag and every subsequent badge element in the grid.

**Symptom:** Only badges with plain URL icons (OVERLAP_IDS that inherit from AchievementSystem) rendered correctly. All others collapsed to tiny broken elements.

**Fix:** `escapeHtml()` now chains `.replace(/"/g, '&quot;').replace(/'/g, '&#39;')` after the standard innerHTML pass, plus a null guard (`if (str == null) return ''`). The browser's `dataset` API auto-decodes `&quot;` back to `"` when read, so popover rendering is unaffected.

**Lesson:** Any time `escapeHtml()` output is placed inside an HTML attribute value (not just element content), quote escaping is mandatory. This applies to all `data-*` attributes across the platform.

## Why It Exists

1. **Social proof** — Seeing real peers with high levels, long streaks, and many completions validates the platform and motivates continued use.
2. **Leaderboard depth** — A leaderboard is just a list of names until you can click into someone's profile. This makes it interactive and meaningful.
3. **Identity investment** — Students who see their own profile displayed attractively are more likely to keep building it (completing modules, maintaining streaks, earning achievements).
4. **Narrative consistency** — Viewing another agent's dossier fits the spy world. The loading state ("Retrieving agent dossier..."), the mascot banner, and the tier badges all reinforce the fiction.
5. **House identity** — Every profile card is colored by the student's house, reinforcing house affiliation as a core part of the platform identity.
