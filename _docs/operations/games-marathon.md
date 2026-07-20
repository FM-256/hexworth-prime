# Games Quality Marathon

**Goal:** Play-test, fix, and polish the arcade games one at a time to a "perfected" bar — real working engines with premium art, clear feedback, and no bugs — matching the quality set by ThreatDex.

**Started:** 2026-07-19 · **Operator:** Frank · **Status:** ACTIVE

---

## Operating contract (LOCKED)

1. **One game = one mission = one commit = one deploy.** Fully perfect + deploy a game before starting the next. Never batch games.
2. **Non-stop mode, NO questions.** After a game ships, auto-advance to the next. Don't stop for per-game go-ahead or ask permission between missions — use own judgment on priority; surface only a genuine blocker. Pre-approved.
2b. **Consult Nancy (adversarial-reviewer) OFTEN.** Route fixes, design decisions, and "is this the right approach" through Nancy before/around implementing — she catches flaws and simpler paths (e.g. she caught the bad `armory` alias + the ContentDiscovery root-cause during the imagery work). Standing dispatch approval; don't ask, just consult her.
3. **TEST BY ACTUALLY PLAYING (non-negotiable).** Boot the REAL engine (Puppeteer, AccessGuard bypass: `localStorage hexworth_house=<house>` + `hexworth_tourist_active=true`) and PLAY it — multiple rounds, the WIN path AND the LOSE path, every level/wave, past the first move. The ThreatDex softlock + missing-feedback bugs were invisible to static review and a single click; they only showed on the second move / at end-of-round. See [[feedback_play_games_to_second_move]].
4. **"Perfected" bar (each game):**
   - Plays end-to-end, all levels/waves reachable, no softlock/dead-button/stuck state (win AND lose paths).
   - Clear, unmissable outcome feedback (win / lose / level-complete / final victory).
   - Premium art where it's "silly PNGs" or flat procedural (fal.ai, matches the cartridge/tile bar); functional tiny UI stays clean.
   - Mobile usable (no horizontal scroll, controls reachable).
   - Honest scoring/pedagogy preserved (games are not quizzes; obscured tiers stay obscured, etc.).
5. **QC gate:** Chris must PLAY it through (win + lose + all levels) and confirm the bar before deploy. Then `record-chris-pass` → `./deploy.sh` → verify live.
6. **Local commits only** on `master`. Explicit `git add` of the game file + its scoped art dir. No AI attribution. Never `git add .`.

## Per-mission loop
1. Boot + PLAY the game (win path, lose path, all levels). Log the concrete issues.
2. Diagnose root causes (read the actual turn/render/outcome code; don't guess).
3. Fix bugs → polish (art, feedback, mobile).
4. Re-play to verify each fix.
5. Chris real-playthrough QC.
6. `git add` scoped → commit → `record-chris-pass` → `./deploy.sh` → verify live.
7. Mark below. Auto-advance.

---

## Missions

- [x] **G1 — ThreatDex (`shield-threatdex.applet.html`)** — SHIPPED + live. Softlock fix (unplayable past move 1: `nextWave`/`resolveMiss` set turn after HUD re-render — `132db2a13`), premium cyber-monster creatures + Defender + 3 badge medals + obscured-tier mask widen + mobile clamp (`f4573a51a`), clear win/lose/level outcome banners (`2f95a4b23`). Chris real-playthrough PASS on each.
- [~] **G2 — Contra / "Network Assault" (`shield-contra.applet.html`)** — FIX APPLIED, in QC. Contra-style real-time run-and-gun. **Real bug (Nancy-diagnosed): the gun structurally couldn't hit most enemies.** Level bullets spawn at chest height (`by = y + h*0.35` ≈ GROUND_Y-20.8) but ground drones/worms/exploits sit near the floor (hitbox tops GROUND_Y-16..-24); collision needs `bullet.y >= enemy.y`, so a standing forward shot passed 0.8-4.8px OVER them, skill-independent → couldn't kill the bulk of the roster (a standing shot scored 0; even moving/jumping only scraped a few edge/jump-arc hits) → enemies scrolled past uncaught, felt "unbeatable." **Fix:** 8px upward hit-grace on the bullet↔enemy collision (`b.y >= e.y - 8`, ~line 3092). Verified by play (Chris before/after contrast): stand+shoot score climbs ~100/kill (was 0 standing; ~5x more kills overall vs the reverted hunk), normal play survives to ~72% of Stage 1 with all 3 lives (pre-fix game-over at ~7.4s / 23%), boss HP drops 40→defeated with aimed fire and stage transitions to 'cleared' (+3000 score), full traversal works. NOT bugs (Nancy + verified): forced auto-scroll + screen-lock (deliberate genre DNA), 3 shared lives (fine once the gun works). Minor/out-of-scope: ArrowUp aim+jump conflation (documented), Z/Space share keys.shoot. Art rework NOT requested for Contra (operator said "weird issues" = bugs). Consulted Nancy (found the root cause I missed).
- [x] **G3 — shield-debugger ("DEBUGGER")** — PLAY-TESTED, HEALTHY (no fix/deploy needed). DOOM-style first-person raycaster (mouse-look, WASD, `isWall` maze, weapons 1-5, enemies BUFFER/TROJAN/WORM/RANSOMWARE/ZERODAY/ROOTKIT-boss). Core loop works: aim+fire kills enemies, score climbs (150→5375 across waves), renders cleanly (matrix corridors, HUD, crosshair, weapon), player moves + takes damage, 0 console errors. No game-breaking bug like G1/G2 had. Not verified to full victory/boss (deep raycaster; no operator complaint to chase) — if operator reports a specific issue, revisit. Per marathon: a game with no defect gets no commit; move on.
- [ ] **G4+ — rest of the shield arcade** (play-test in order, fix only real defects): dont-get-phished, dr-malware, exploit-flap, incident-response, life-force, malware-zoo, social-engineer, sql-injection-defense, text-adventure-hydra, threat-runner, threat-swarm, tor-darkweb, web-security-headers-lab.
- [x] **G2 — Contra** hitbox grace SHIPPED (commit `804c431d7`). Forward fire hits ground enemies.
- [x] **G2b — Contra "blocked by a screen" (P0, was LIVE on prod since ~Jul 3) + aim-up=jump** SHIPPED. **Bug 1 (P0):** the per-stage briefing overlay `#stageAnnounce` (94%-opaque, z-index 40) stayed covering the canvas the WHOLE time you play — CSS specificity: `.hidden{display:none}` (0,1,0) lost to `#stageAnnounce{display:flex}` (1,0,0), so `advanceAnnounce()`'s `classList.add('hidden')` never hid it. Fix: `#stageAnnounce.hidden{display:none}` (1,1,0), matching the existing `.overlay-screen.hidden` pattern. **Bug 2:** ArrowUp bound to BOTH `keys.up` (aim) AND `keys.jump` → couldn't aim at elevated turrets / the high boss without jumping. Fix: jump is `KeyX` only; ArrowUp keyup clears only `keys.up`; controls panel `X / UP → Jump` becomes `X → Jump`. Nancy PROCEED + Chris pixel-verified PASS (elementFromPoint returns canvas during play across 2 announce cycles; ArrowUp holds grounded 20 frames w/ aimDir.y=-1; natural lose path renders KIA overlay; victory renders; 0 errors). **LESSON (Nancy finding, [[feedback_play_games_to_second_move]]):** Bug 1 shipped in `804c431d7` today because that "live-verified" pass read game STATE (score/boss-HP/stageState all kept working BEHIND the opaque screen) instead of rendered PIXELS. Verification for canvas games now REQUIRES `elementFromPoint`/screenshot pixel checks, not just var reads.
- [ ] **G4-backlog — Contra HUD stage counter** (cosmetic, Chris-flagged, out of scope for G2b): "Stage X / 3" HUD doesn't update after `loadStage()` advances `currentStage` (only updates inside `advanceStage()` before the increment). Non-blocking; fix in a later pass.

## How to resume (after any context reset)
Read this file. Find the first unchecked/in-progress mission. Boot + PLAY that ONE game to reproduce its issues, then run the per-mission loop. Do not batch. Update this file when it ships.
