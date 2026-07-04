# Arcade and Lab Skill-Binding Rebuild Pattern

*Live as of 2026-07-04.*

## Purpose

Hexworth Prime's arcade games and hands-on labs must make the player perform the real skill through the game's or lab's core mechanic, not recognize a correct answer from a list. A "pick the correct fix from 3 options" loop is a quiz wearing a game skin, and it is rejected regardless of how polished the surrounding presentation is. This note documents the repeatable pattern used to convert a quiz-shaped or cosmetically-skinned game/lab into one where the mechanic itself is the skill check, and the verification standard used to prove the conversion is real rather than decorative.

This is a cross-cutting engineering pattern, not tied to one engine. It has been applied to four arcade games this session (a Tetris clone, a Pong clone, and two endless-runner/platformer clones) and is being applied to two CompTIA A+ Core 1 labs as of this writing.

## The Defect Class

A game or lab is quiz-shaped when its scoring or completion signal is gated by a decorative layer sitting on top of an otherwise-generic engine: the underlying mechanic (block placement, paddle return, platform jump, lane change) scores or advances regardless of whether the player's domain knowledge was correct. Renaming assets or labels (a Tetris block painted with a server-rack icon, a Pong ball tagged "AES") does not change this: the mechanic must gate on the domain fact, not just display it.

The only acceptable alternative to a hands-on/skill-bound mechanic is a genuine choose-your-own-adventure: branching choices with narrative or state consequences. A single-correct-answer multiple-choice loop is not CYOA even if it is dressed as one.

## The Rebuild Pattern

Each rebuild in this session followed the same four-stage loop:

1. **Identify the cosmetic layer.** Find what currently varies by label/skin only, and what the underlying mechanic actually gates on (usually nothing domain-specific: any Tetris row clears regardless of component weight; any Pong return scores regardless of what the ball was labeled).
2. **Bind the domain fact to the mechanic's win condition.** The player must perform the actual reasoning to succeed at the core action, not as a side popup, not as a pre-check before the "real" game resumes. Wrong domain reasoning must cost the player inside the mechanic itself (a zeroed row, a passed-through ball, a crumbled platform, a lane-miss life loss), and any previously decorative/validity-blind scoring channel that let a player win without the reasoning must be removed, not just left running in parallel.
3. **Prove it with a deterministic aware-vs-blind harness (the Subnet-Siege standard).** A headless harness drives the real in-page state machine, not a mock and not a re-implementation, and runs two bot strategies at volume: one that reasons about the domain fact (aware/knowledge bot) and one that does not (blind/reflex/random bot). The rebuild is only considered proven when the aware bot dramatically and reproducibly outperforms the blind bot at N>=300 trials (or a documented smaller N with an explicit justification), through the actual collision/state/scoring code path, not a shortcut.
4. **Karl + Chris gate before shipping.** Karl verifies the domain facts embedded in the mechanic against the real technical standard (CompTIA objective, cloud provider API behavior, cipher correctness). Chris independently reproduces the harness and confirms the previously-removed decorative scoring channel is actually gone from the code, not just unused.

## Games Rebuilt This Session

| Game | House | Old mechanic | Bound skill | Proof (N>=300 unless noted) | Commit |
|---|---|---|---|---|---|
| Rack Stack | Forge | Tetris, any full row clears | Data-center rack placement: heavy-at-bottom weight/category gate on `validateRow`; both prior validity-blind score channels removed | 6-seed deterministic sweep: mindless bot ~45-60, never clears level 1, vs informed weight-aware bot ~1.8M-4.8M, reaches level 9-13 | `0ba6352eb` |
| Crypto Pong | Key | Pong, any paddle return scores | Real Caesar/Atbash/XOR/Vigenere decoding: paddle band = candidate plaintext, correct band required to return | N=300: blind/reflex passes the decode gate only at chance (~26-40%) vs decode-aware 100%; through the full serve/read-window/collision pipeline (N=40) aware ~78-85% vs blind ~37-40% | `e938a0f57` |
| Cloud Hop: Vertical | Cloud | Doodle-Jump-style runner, any platform bounces | Cloud deployment-ordering: each platform is a step in a real dependency graph, evaluated live at landing (not baked), wrong order costs a life | N>=300: knowledge bot lands on the correct/buildable step ~66% vs random ~30%, and only the knowledge bot sustains a climb in the second half | `b9b3c0d38` (mechanic), `b1f5c5f09` (em-dash fix) |
| Packet Run | Web | Endless runner, lane choice cosmetic | Firewall CIDR routing: each packet carries a persistent src/dst identity, must be routed TOP=allow/BOTTOM=block by matching it against route-rules (real CIDR subnet match) | N=160: aware bot 160/160 vs blind ~57% (chance band) | `4b6d9fc61` |

Karl-verified domain facts, per commit record: rack heavy-at-bottom placement, UPS-heaviest, blanking-panel airflow, top-of-rack cabling practice (one flavor-text correction made: a NAS line falsely implied a T-shaped chassis); all four cipher implementations reversible and hand-verified against an independent reference; all four cloud dependency graphs checked against live AWS/Azure API docs (four create-vs-attach edges corrected on first pass, then re-audited to PASS); canonical CIDR labels (zero host bits) on the packet-routing game.

## Harness Hardening Note

The Packet Run self-check harness (`_tools/arcade-fixes/packet-run-check.js`) recycles its puppeteer page every 40 trials (`RECYCLE_EVERY_N_TRIALS = 40`, `packet-run-check.js:434`) rather than running all trials on one page instance. **Why:** a long-running single-page harness accumulates detached-frame and closed-session errors ("detached Frame" / "Target closed" / "Session closed" / "Protocol error") over enough trials to make a large-N run unreliable. A proactive periodic page recycle, plus the same recycle triggered reactively on any page-crash-class error, keeps a 300+ trial run stable end to end. This is a reusable fix for any future harness in this pattern that needs N in the hundreds.

## Labs Rebuilt Under the Same Pattern

Two CompTIA A+ Core 1 labs are being converted using this pattern as of this writing (in progress, not yet committed):

| Lab | Old shape | New shape | Harness |
|---|---|---|---|
| `forge-cloud-scenarios.lab.html` | 43-option multiple-choice quiz | "Cloud Solutions Architect Workbench": 8 scenarios, student configures service model, deployment model, and a multi-select characteristics set, graded on an exact three-axis match | `_tools/arcade-fixes/aplus-cloud-scenarios-check.js` |
| `forge-troubleshooting.lab.html` | 6-question multiple-choice quiz | "Support Ticket Workbench": student performs the CompTIA 6-step methodology (identify, theory, test, plan+implement, verify, document) on 3 support tickets, phase-guarded so a step cannot be skipped | `_tools/arcade-fixes/aplus-troubleshooting-check.js` |

Both harnesses drive the lab's real exposed functions against the actual DOM/state path (not a mock), assert a correct end-to-end playthrough reaches `ModuleProgress.complete` exactly once with the preserved call signature, and assert that an incorrect-order playthrough (skipping straight to a fix, or to documentation, without gathering evidence first) is blocked by a phase guard and never fires completion.

## What This Pattern Does NOT Cover

- It does not cover graphics/presentation quality (a separate visual-fidelity axis tracked elsewhere in the arcade improvement work).
- It does not mandate rebuilding every quiz-shaped game or lab at once. This is a worst-first, one-at-a-time loop, each individually gated.
- It does not apply to genuine choose-your-own-adventure content, which is explicitly exempt from the "no multiple choice" rule.
- It does not replace server-side grading. A lab passing this pattern's harness proves the client-side mechanic is skill-bound; it says nothing about whether the lab's completion signal is verified server-side.

## Why the One-at-a-Time Gate

Each rebuild touches a live student-facing page and changes its scoring logic. Shipping without an independent aware-vs-blind proof risks re-shipping a game that merely looks skill-bound (correct-sounding labels) without the mechanic actually gating on the domain fact, the same failure mode being corrected. The Karl+Chris double gate exists because the two failure modes are independent: Karl catches a wrong domain fact baked correctly into the mechanic; Chris catches a correct domain fact that the mechanic doesn't actually enforce (a leftover decorative scoring path, a harness that doesn't touch the real code).

## Related

- Companion status page: [CompTIA A+ Core 1 (220-1101): Content QC and Lab Rebuild Status](https://hexworth.atlassian.net/wiki/spaces/KBA/pages/40042497/CompTIA+A+Core+1+220-1101+Content+QC+and+Lab+Rebuild+Status) (Course & Hub Inventory), covering the two labs currently being converted under this pattern.

*Last Updated: 2026-07-04 · v1.0.0*
