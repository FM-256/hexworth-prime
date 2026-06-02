# Game-Show Review System + Procedural Audio

*Live as of 2026-06-01 · master*

---

## TLDR

Two courses ship a "Week R" (Comprehensive Review) section each containing four game-show review formats. Nine files total (4 PIS + 4 Ethics-IT + 1 host-only variant). A shared procedural audio engine (`_app/components/HexworthGameAudio.js`) synthesizes all in-game sound via the Web Audio API with no MP3 assets. Multi-player live Kahoot uses Firestore for real-time state sync with anonymous player auth and server-enforced field whitelist + score cap.

Status: shipped and deployed. 8 commits across 8 branches merged to master.

---

## Shipped Files

### PIS Course (CIS2350C) — Shield house

Base path: `_app/houses/shield/infosec/exams/`

| File | Format | Description |
|---|---|---|
| `pis-jeopardy.review.html` | Jeopardy | 5x5 board, 5 categories, Daily Double, 30s think-timer |
| `pis-wheel.review.html` | Wheel of Fortune | 8 puzzles, vowel-buy ($250 each), solve bonus |
| `pis-5th-grader.review.html` | Are You Smarter | 11-question $1k-$1M money ladder, 3 lifelines |
| `pis-kahoot.review.html` | Kahoot solo | 20-question timed self-paced review |
| `pis-kahoot-host.review.html` | Kahoot host | Live classroom host view, QR join, leaderboard |

### Ethics-IT Course (CIS4253) — Divergent house

Base path: `_app/houses/divergent/ethics-it/exams/`

| File | Format | Description |
|---|---|---|
| `eth-jeopardy.review.html` | Jeopardy | 5x5 board, Daily Double, 30s think-timer |
| `eth-wheel.review.html` | Wheel of Fortune | 8 puzzles, vowel-buy, solve bonus |
| `eth-5th-grader.review.html` | Are You Smarter | 11-question $1k-$1M money ladder, 3 lifelines |
| `eth-kahoot.review.html` | Kahoot solo | 20-question timed self-paced review |

### Shared Infrastructure

| File | Purpose |
|---|---|
| `_app/components/HexworthGameAudio.js` | Procedural Web Audio engine, 415 lines |
| `_app/components/qrcode.min.js` | Vendored QR code library (davidshimjs/qrcodejs, ~20KB) |
| `_app/houses/shield/infosec/exams/kahoot-firebase.js` | Firebase adapter for Kahoot (anon auth + Firestore) |
| `_app/join/index.html` | Anonymous player join page at hexworth.com/join |

---

## Game-Show Authoring Pattern

Each game file is self-contained HTML. No build step; Firebase Hosting serves raw files per platform convention.

**Standard file structure** (all 8 game files follow this):

1. `AccessGuard.require('sorted')` — blocks unauthenticated users immediately (`_app/houses/shield/infosec/exams/pis-jeopardy.review.html:6`)
2. `AchievementManager.js` and `ModuleProgress.js` loaded before any game logic
3. `HexworthGameAudio.js` loaded last in the head script block
4. `ModuleProgress.complete(house, moduleId, opts)` called on game completion, writing to `hexworth_progress.<house>.<moduleId>`

**Module IDs:**

| File | house | moduleId |
|---|---|---|
| `pis-jeopardy.review.html` | `shield` | `pis-jeopardy` |
| `pis-wheel.review.html` | `shield` | `pis-wheel` |
| `pis-5th-grader.review.html` | `shield` | `pis-5th-grader` |
| `pis-kahoot.review.html` | `shield` | `pis-kahoot` |
| `pis-kahoot-host.review.html` | `shield` | `pis-kahoot-host` |
| `eth-jeopardy.review.html` | `divergent` | `eth-jeopardy` |
| `eth-wheel.review.html` | `divergent` | `eth-wheel` |
| `eth-5th-grader.review.html` | `divergent` | `eth-5th-grader` |
| `eth-kahoot.review.html` | `divergent` | `eth-kahoot` |

**Hub wiring:** Each course's `index.html` declares a `wkR` section. The `weeks.wkR` array lists the module IDs in display order. PIS carries 5 entries (includes the host-mode card); Ethics-IT carries 4.

- PIS: `_app/houses/shield/infosec/index.html:2288`
- Ethics-IT: `_app/houses/divergent/ethics-it/index.html:2294`

---

## Daily Double Mechanic (Jeopardy only)

The Daily Double is one randomly-placed cell per board. Its location is re-rolled on every `buildBoard()` call (`pis-jeopardy.review.html:858`).

**Flow:**

1. Player clicks a cell. `openClue()` checks `catIdx === dailyDoubleCat && rowIdx === dailyDoubleRow` (`pis-jeopardy.review.html:889`).
2. If Daily Double: `openDailyDoubleSplash()` fires, `HexworthGameAudio.dailyDouble()` plays the ~1.2s rising sting.
3. Wager input accepts integers only. Strict parsing at `pis-jeopardy.review.html:986`: `if (/^\d+$/.test(raw))` rejects partial-string values like "500abc" that `parseInt` would accept silently. Minimum $5, maximum `max(currentScore, $500)`.
4. On "Lock In Wager": `dailyDoubleFound = true`, the clue renders, think loop starts.
5. Judging scores the wager, not the cell value. Category stats also use the wager so the breakdown remains accurate.

**Re-entry guard:** `openClue()` returns immediately if the modal overlay is already active (`pis-jeopardy.review.html:883`). Prevents a fast double-click on the DD cell spawning a second splash before the first renders.

**Reset:** `resetGame()` calls `closeModal()` first (`pis-jeopardy.review.html:1208`), closing any in-flight modal before rebuilding the board. Prevents a stale overlay sitting over a fresh board if the player hits Reset during DD wager entry.

**Display clamping:** Final score percentage display is clamped to 100 at `pis-jeopardy.review.html:1126`. The grade-ladder comparison uses the uncapped raw value so a player who doubles up on the DD can still clear S-RANK by margin.

---

## Jeopardy Think-Timer: Music IS the Clock

The most recent feature (commit `641965bca`). The think loop is not decorative; it drives the 30-second clue clock.

**Mechanism:**

- `startThink(CLUE_TIMER_SECONDS, onClueTimeExpired)` receives the duration and a callback (`pis-jeopardy.review.html:906`)
- The audio loop schedules an `expireTimer = setTimeout(fn, durationSec * 1000)` internally (`_app/components/HexworthGameAudio.js:177`)
- When that timer fires naturally: `onClueTimeExpired()` is called once, auto-reveals the answer, plays `wrong()` buzzer
- Manual reveal or close calls `stopThink()` which clears `expireTimer`, so the callback never fires

**Visual sync:** A `.clue-timer-bar` div uses a CSS `scaleX` transition pegged to the same 30s duration (`pis-jeopardy.review.html:823`). The bar resets to `scaleX(1)`, then gets class `running` which triggers `transform: scaleX(0)` in 30s. The gold-amber-red gradient signals urgency as time drains.

Why: this approach keeps audio and visual on the same clock source without a JS interval poll. The audio module owns the canonical timer; the CSS transition is purely cosmetic.

---

## Multi-Player Kahoot Live Mode

### Architecture

| Component | File | Responsibility |
|---|---|---|
| Host view | `pis-kahoot-host.review.html` | Creates room, advances questions, pushes leaderboard |
| Player join page | `_app/join/index.html` | Anonymous join, answer submission, real-time state |
| Firebase adapter | `kahoot-firebase.js` | Idempotent Firebase init, dual auth path |
| Firestore rules | `firestore.rules:871` | Room and player document security |

### Room Lifecycle

1. Host (logged-in tenant) clicks "Create Room": 6-digit room code generated, `kahoot_rooms/{code}` document created with `status: 'lobby'` and `hostUid`.
2. QR code rendered via `qrcode.min.js` pointing at `hexworth.com/join?code=XXXXXX` (`pis-kahoot-host.review.html:887`).
3. Players navigate to `hexworth.com/join`, enter code + nickname, sign in anonymously, write `players/{uid}` subdocument.
4. Host starts game: `status` flips to `'live'`, `currentQuestionIdx` increments per question.
5. Players receive updates via `onSnapshot` on the room document. State machine in `_handleRoomUpdate()` drives screen transitions (`_app/join/index.html:715`).
6. After each question: host reads all player docs, sorts by score, pushes snapshot as `leaderboard` array onto the room doc.
7. Players read rank from `lastLeaderboard` cached in the room snapshot, avoiding ~30 `getDocs` reads per reveal per player (`_app/join/index.html:976`).
8. `status: 'finished'` triggers final screen on all clients.

### Host Heartbeat

The host writes `hostLastSeenAt: serverTimestamp()` every 10 seconds during live and reveal phases (`pis-kahoot-host.review.html:1045`). Players check freshness on every room snapshot (`_app/join/index.html:700`). If `hostLastSeenAt` is more than 60 seconds old and `status` is `'live'` or `'reveal'`, the stale-host banner appears (`_app/join/index.html:49`). The heartbeat stops when the game finishes (`pis-kahoot-host.review.html:1322`).

Why: a 30-student class is stranded on a frozen question if the instructor's laptop sleeps and there is no signal. The banner surfaces the problem immediately rather than leaving students waiting silently.

### Firebase Auth Split

The `kahoot-firebase.js` adapter handles two entry paths (`_app/houses/shield/infosec/exams/kahoot-firebase.js:139`):

| Path | Who | Auth |
|---|---|---|
| Host | Logged-in tenant (FirebaseAuth.js present) | Uses existing session, no override |
| Player | Anonymous (no FirebaseAuth.js) | `signInAnonymously()` on first visit |

The adapter checks `typeof FirebaseAuth !== 'undefined'` to detect which path it is on. This allows `kahoot-firebase.js` to be a single file serving both pages.

### Firestore Security Rules

Rules at `firestore.rules:871`:

| Rule | Constraint |
|---|---|
| Room create | Non-anonymous auth only; `hostUid` must equal `request.auth.uid` |
| Room update | Only `hostUid` can advance questions or push leaderboard |
| Player create | `request.auth.uid` must equal the document ID |
| Player update | Field whitelist: `score`, `streak`, `bestStreak`, `correctCount`, `wrongCount`, `lastAnswerIdx`, `lastAnswerTimeMs`, `lastAnswerCorrect` only |
| Score cap | `score <= 25000` (20 questions x (1000 base + 200 streak bonus) = 24,000 theoretical max; 25,000 leaves headroom) |

Why the score cap: any anonymous-authenticated player can call `updateDoc(playerDoc, {score: 9999999})` from the browser console. The cap and field whitelist block this. Caught in adversarial review before deploy.

### Page Teardown

Both host and join pages use `pagehide` (not `beforeunload`) to unsubscribe Firestore listeners and stop the heartbeat interval. `pagehide` fires on mobile backgrounding and tab close more reliably than `beforeunload`.

---

## Procedural Audio Engine

### Overview

`_app/components/HexworthGameAudio.js` (415 lines) synthesizes all game audio via the Web Audio API. No MP3 files. Modeled on `_app/components/BlacksiteAudio.js`.

Why procedural: MP3 files for 6 tracks would be approximately 3MB of hosting payload plus a per-file CC0 licensing audit. Procedural synthesis is ~12KB JS, zero licensing concerns, and tweakable by changing oscillator parameters without re-rendering assets.

### Public API

| Method | Category | Description |
|---|---|---|
| `init()` | Lifecycle | Create `AudioContext` + master gain; idempotent |
| `resume()` | Lifecycle | Resume suspended context |
| `startThink(durationSec?, onExpire?)` | Jeopardy | Start C-minor-7 arpeggio loop; optional timer mode |
| `stopThink()` | Jeopardy | Stop loop, cancel expire timer |
| `dailyDouble()` | Jeopardy | Rising C-major triad sting (~1.2s) |
| `finalFanfare()` | Jeopardy | 3-note rise + sustained chord (~2.5s) |
| `startTimer(durationSec)` | Kahoot | Countdown tick loop, quickens in final 5s |
| `stopTimer()` | Kahoot | Stop tick loop |
| `streak()` | Shared | C-E-G-C ascending arpeggio (~0.25s) |
| `correct()` | Shared | C5-E5 two-note ding (~0.4s) |
| `wrong()` | Shared | 220Hz-110Hz descending sawtooth (~0.3s) |
| `setVolume(0..1)` | Volume | Set master gain |
| `getVolume()` | Volume | Read master volume level |
| `mute()` | Volume | Zero master gain, stop active loops |
| `unmute()` | Volume | Restore master gain |
| `toggleMute()` | Volume | Toggle and persist to localStorage |
| `isMuted()` | Volume | Synchronous mute state check |
| `isEnabled()` | Volume | Read localStorage pref (default: on) |
| `setEnabled(bool)` | Volume | Write pref + apply immediately |

### Sound Design

| Sound | Oscillator / Notes | Duration |
|---|---|---|
| Think loop | C-minor-7 arpeggio (C4/Eb4/G4/Bb4) over C3/G3 bass pulse; 84 BPM | Loops |
| Daily Double | Rising C-major triad (C5/E5/G5) + C6 shimmer, sawtooth + lowpass | ~1.2s |
| Final fanfare | C5-E5-G5 lead, then sustained C-major chord (triangle wave) | ~2.5s |
| Countdown ticks | 600Hz square pulse at 1Hz cadence; 1000Hz at 5Hz in final 5s | Loops |
| Correct | C5-E5 triangle wave, two-note major third | ~0.4s |
| Wrong | 220Hz-110Hz exponential ramp, sawtooth through 600Hz lowpass | ~0.3s |
| Streak | C-E-G-C ascending arpeggio, triangle wave | ~0.25s |

The think loop is not a copy of Merv Griffin's "Think!" (Sony-owned). It uses a C-minor-7 arpeggio with alternating bass at 84 BPM, structurally distinct from the original. This was an explicit design constraint.

### ensureRunning() and the First-Click Init Race

Every sound-producing method calls `ensureRunning()` at entry (`_app/components/HexworthGameAudio.js:81`). This combined `init()` + `resume()` call creates the `AudioContext` inline, inside the user-gesture callback that triggered the sound request.

Why: the original design used a board-level lazy-init handler on `{ once: true }`. The handler ran `init()` on first board click. But `openClue()` called `startThink()` in the same click handler, and `startThink()` ran before the bubble reached the board listener. The `AudioContext` did not yet exist, so `startThink()` silently no-oped. The second cell click onwards worked correctly.

The puppeteer trace that surfaced the root cause:
```
CALL startThink ctxExists=false ctxState=undefined  <- silent
CALL init ctxExists=false
CALL resume ctxExists=true ctxState=running
CALL startThink ctxExists=true ctxState=running     <- second cell onward
```

Fix: `ensureRunning()` satisfies the Web Audio user-gesture requirement inline, in the same gesture that produced the sound call. The board-level lazy-init handler is retained as a belt-and-suspenders path.

### Mute Behavior on Active Loops

`mute()` stops the currently-playing think loop and timer ticks immediately. `unmute()` restores `masterGain` but does not restart whatever loop was active before the mute (`_app/components/HexworthGameAudio.js:338`). A student who mutes mid-clue then unmutes gets silence for the remainder of that clue. The next game event re-enters the correct playing state.

Why: restarting loops after unmute would require the module to track which game is active and which event fired the loop, adding state the module does not currently maintain. Acceptable tradeoff for a self-paced review tool.

### Audio Toggle UX

- Default: ON for first visit
- Persistence: `localStorage` key `hexworth_audio_pref` = `'on'` | `'off'` (`_app/components/HexworthGameAudio.js:38`)
- Single key across all 8 games: toggling on Jeopardy persists to Kahoot, etc.
- Implementation: top-right header speaker icon, `aria-pressed="true"` when muted, CSS swaps between volume and mute SVG icons (`pis-jeopardy.review.html:54`)
- House theme colors: Shield files use `--forge` (blue); Divergent files use `--div-primary`

---

## Adding the Audio System to a New Game File

1. Add `<script src="../../../../components/HexworthGameAudio.js"></script>` after `ModuleProgress.js` in `<head>`.
2. Wrap the back-link in `<div class="header-right">` and add the speaker toggle button using the standard SVG pair (ico-on / ico-off).
3. Add the audio-toggle CSS block (uses `--shield-primary` or equivalent house variable for border/color).
4. Wire game events to `HexworthGameAudio` methods at the points where sound is appropriate.
5. Add the `wireAudioToggle()` IIFE at the end of the script block. It reads `isEnabled()` from localStorage on page load and syncs the button state.
6. No separate lazy-init handler is required. `ensureRunning()` inside each method handles context creation on first call.

---

## Firestore Deploy Ordering

The live Kahoot feature requires Firestore rules to deploy before the hosting payload. If rules deploy after hosting, room creation fails with PERMISSION_DENIED for any session started between the two deploys.

Deploy sequence:

```
_tools/eduscan/smoke/deploy.sh --only firestore:rules
./deploy.sh
```

Do not reverse the order. Do not use bare `firebase deploy --only hosting` for sessions that include new Firestore rules.

---

## Post-Deploy Verification Notes

Post-verify (`_tools/deploy/post-verify.sh`) exits 2 if any HIGH findings remain in the Nexus backlog. During this session, 17 HEUR-032 (missing icon) findings were cleared in commit `3c914539e`. Two transient flags remained at deploy time. Exit 2 is non-blocking on the deploy itself; Confluence regen is skipped on exit 2 and can be re-run manually.

---

## Bug History

### Audio Silent on First Cell Click

Reported after the initial audio deploy. Audio worked from the second cell click onward.

**Trace** (puppeteer with patched AudioContext instrumentation against production):
```
CALL startThink ctxExists=false ctxState=undefined
CALL init ctxExists=false
CALL resume ctxExists=true ctxState=running
CALL startThink ctxExists=true ctxState=running
```

**Root cause:** `openClue()` called `startThink()` synchronously. The board-level `{ once: true }` lazy-init listener also ran on the same click event, but event bubbling meant `startThink()` executed before the listener called `init()`. The `AudioContext` was not yet initialized.

**Fix:** `ensureRunning()` private helper at `_app/components/HexworthGameAudio.js:81`. Every sound-producing method calls it first. No external caller needs to call `init()` before playing a sound.

### Kahoot Score-Injection via Console

Any anonymous Firebase user can call `updateDoc(playerDoc, {score: 9999999})` from the browser console. On a 30-person classroom leaderboard displayed on a projector, a student placing themselves at rank 1 this way is a visible disruption.

**Fix:** Firestore field whitelist + score cap at `firestore.rules:904`. The whitelist rejects any update that touches a field outside the permitted set. The 25,000 cap rejects scores above the theoretical maximum (20 x 1200 = 24,000 with full streak bonus). Caught during adversarial review before the live-mode deploy.

---

## Commit History

All commits on master, chronological:

| Commit | Merge | Description |
|---|---|---|
| `b65ab5517` | Merge pis-game-shows | PIS Week R + 4 initial game-shows (Jeopardy, Wheel, 5th Grader, Kahoot) |
| `3f582978a` | Merge pis-daily-double | Daily Double mechanic + adversarial-review edge fixes |
| `c30d0f20e` | Merge pis-kahoot-live | Multi-player live mode + Firestore rules |
| `c9aae4472` | Merge eth-game-shows | Ethics-IT Week R + 4 game-shows |
| `254acd9fa` | Merge pis-theme-music | HexworthGameAudio.js + audio on 2 PIS files |
| `3c914539e` | Merge fix-audio-init-and-icons | `ensureRunning()` fix + 17 HEUR-032 findings cleared |
| `3c0667bba` | Merge audio-fan-out | Audio on all 8 game-show files |
| `641965bca` | feat(jeopardy-timer) | Think music IS the 30s clock; visual timer bar |

---

## Related

- [[reference_wes_technical_writer]] — doc conventions reference
- [[project_dr_hex_live]] — Dr. Hex AI system (parallel platform feature)
- [[reference_confluence_kba]] — Confluence credentials and structure
- `_docs/operations/eduscan-safety-net-2026-05-03.md` — smoke gate that gates all deploys
- `firestore.rules:871` — full Kahoot rules text
- `_app/components/BlacksiteAudio.js` — pattern source for HexworthGameAudio

---

*Last Updated: 2026-06-02 · v1.0.0*
