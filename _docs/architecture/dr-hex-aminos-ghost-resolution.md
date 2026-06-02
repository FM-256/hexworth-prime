# Dr. Hex / Aminos / Ghost Layer Resolution

> ## ⚠ SUPERSEDED 2026-06-02 — PREMISE WAS WRONG
>
> This doc's Option A (retire Aminos, declare Dr. Hex canonical) was deployed 2026-06-02 and immediately reversed when the operator surfaced the actual architecture: **Dr. Hex on labs only; Aminos on everything else with per-house bots; quizzes and exams get no AI; slides get Aminos (for deeper-content engagement).** Dr. Hex and Aminos serve non-overlapping surfaces by design. The "two-button doubles" the doc treated as an architecture conflict were actually a misplacement bug — Dr. Hex had been incorrectly installed on ~169 non-lab hubs/course-indexes/quiz pages by prior decisions, against the lab-only rule that lives in `feedback_dr_hex_lab_only.md` (2026-05-30).
>
> Nancy reviews 1-5, Karl, the deliberation pro/con, and my own audit all missed the lab-only constraint because it isn't articulated in any single grep-able doc the agents can find. The deliberation has historical value (it documents what we got wrong and why) but the recommendation is invalid. See the **two addendums at the bottom** for the corrected architecture and what shipped to fix it.
>
> Authoritative source on placement: `feedback_dr_hex_lab_only.md` (operator feedback, 2026-05-30).

**Status:** SUPERSEDED — see banner above
**Date:** 2026-05-30 · Superseded 2026-06-02
**Author:** Primary (Claude Opus 4.7)
**Supersedes:** Ghost-layer blocker #1 in `_docs/architecture/hex-ai-ghost-layer-design.md`
**Nancy reviews:** v1 → PAUSE-DESIGN (3 blockers); v2 → PAUSE-AGAIN (3 new corrections: persona fabrication, missing custom element in scope, archive sequencing contradiction); v3 addresses all six. Persona names below are verified against `_app/components/chatbots/bot-specs/*.json` 2026-05-30 — not from memory.

## TLDR

The ghost-layer design memo names "Aminos house-bot overlap" as the #1 blocker. A live audit shows the conflict is not what was assumed. Dr. Hex is the production reactive layer on 2,433 pages. Aminos is LIVE and functional on 25 pages (16 of them double-AI-button pages that also have Dr. Hex installed; 9 of them Aminos-only including the platform landing page and main student dashboard). The recommended resolution is **Option A**: retire Aminos, **add Dr. Hex to the 9 Aminos-only pages as part of the same sweep**, declare Dr. Hex the canonical reactive layer, archive (not delete) the Aminos infrastructure per "we do not destroy", let Ghost build on top of Dr. Hex without further architectural deliberation. This is a load-bearing platform decision requiring explicit operator approval — it is not a routine cleanup.

## Live evidence (verified 2026-05-30, Nancy-confirmed)

| Surface | Pages with embed | Notes |
|---|---|---|
| Aminos chat plugin | 25 | 16 are doubles (both AIs); 9 are Aminos-only |
| Dr. Hex chat panel | 2,433 | Every lab, quiz, box, applet, course hub |
| Both on same page | 16 | Two floating buttons, both at `z-index: 9000`, will visually stack |
| Aminos-only | 9 | Includes `index.html` (landing), `dashboard.html` (main hub), `projects/index.html`, `signal/index.html`, four course hubs, one test page |
| Dr. Hex-only | 2,417 | The entire work surface |
| Ghost layer | 0 | Not built |

The 9 Aminos-only pages, named explicitly:
1. `_app/index.html` — platform landing page
2. `_app/dashboard.html` — primary student hub
3. `_app/projects/index.html` — Projects hub
4. `_app/signal/index.html` — Signal house hub
5. `_app/houses/code/python-for-it/index.html` — course hub
6. `_app/houses/code/python-programming/index.html` — course hub
7. `_app/houses/web/intro-networks/index.html` — course hub
8. `_app/houses/web/net-essentials/index.html` — course hub
9. `_app/bot-test.html` — internal test page

Removing Aminos from items 1-8 with no replacement would silently darken AI on the platform's two most prominent pages plus six course entry points. This is named explicitly here and addressed in Option A's scope below.

## What's actually deployed under "Aminos"

Per direct file inspection 2026-05-30:

- **14 bot-spec JSON files** at `_app/components/chatbots/bot-specs/` — each with full Aminos bot ID, persona prompt (200-400 words), knowledge sources, welcome message, anti-spoiler `globalInstructions`. All marked `"status": "LIVE"`. Verified persona mapping (deployed vs 2026-03 plan, verified by reading each `*-bot.json`):

  | House | 2026-03 plan | Deployed reality | Bot ID |
  |---|---|---|---|
  | AI | Geoffrey Hinton | Alan Turing | 7960 |
  | Cloud | Grace Hopper | J.C.R. Licklider | 7985 |
  | Code | Ada Lovelace | Ada Lovelace ✓ | 7984 |
  | Dark Arts | Kevin Mitnick | Kevin Mitnick ✓ | 7986 |
  | Divergent | (not in plan) | Leonardo da Vinci | 8208 |
  | Eye | Alan Turing | Cliff Stoll | 7987 |
  | Forge | Dennis Ritchie | Steve Wozniak | 7988 |
  | Key | Claude Shannon | Claude Shannon ✓ | 7989 |
  | Matrix | Margaret Hamilton | Sun Tzu | 7990 |
  | Script | Linus Torvalds | Linus Torvalds ✓ | 7991 |
  | Shield | Whitfield Diffie | Dorothy Denning | 8115 |
  | Signal | Nikola Tesla | Nikola Tesla ✓ | 8210 |
  | Web | Vint Cerf | Vint Cerf ✓ | 7983 |
  | General | (Dashboard Assistant) | Hexworth Assistant | 7042 |

  6 of 13 named personas were rebranded between plan and deployment. This itself is signal that the F-53 spike output was not the final design — implementation drifted from the plan, was never re-documented, and the operator's mental model of who-is-where may now be out of date.
- **14 bot-knowledge HTML pages** at `_app/bot-knowledge-*.html` — deployed and serving as Aminos training data sources.
- **`ChatbotRouter.js`** — full smart-routing implementation including iframe loader, CSS, positioning logic. Written, never imported by any page. The intended replacement for the direct `<script>` embeds.
- **25 direct `<script src="https://platform.aminos.ai/...">` embeds** in `_app/` pages — the production surface students actually see.

Sprint state: F-53 (exploration spike) is `done`. F-54 → F-65 (the 12 house-bot build-out items) are all `backlog`. The deployed bots are real and serving students; the sprint plan to deepen them never completed.

Not "dead." Live and functional. The decision is whether to retire live infrastructure in favor of consolidating on Dr. Hex — which is a different decision from "remove a dead spike," and the operator deserves the accurate framing.

## How we arrived at the current state

The 2026-03 plan (per memory `project_house_bots.md`) was: 11 house-specific Aminos bots, full personas, smart routing via `ChatbotRouter.js`, anti-jailbreak tiered guardrails. F-53 was the spike: create the bot accounts, drop direct `<script>` embeds, prove the integration. That worked, and the embeds went into production.

The 2026-04 → 2026-05 work was Dr. Hex: a custom-built reactive AI on hexclass with voice_linter, Help Levels, ambient state, lab-attempt tracking, drift detector, operator quality dashboard. Dr. Hex shipped to 2,433 pages over the 2026-04-21 → 2026-05-30 build window.

The operator's choice was implicit: by investing every architectural cycle in Dr. Hex (orchestrator, voice_linter, Help Levels, AI-19 through AI-27), the operator declared Dr. Hex the platform's AI direction. F-54 → F-65 were never picked up. The Aminos embeds stayed because they had been working and no one had reason to remove them yet. The platform now runs on Dr. Hex with Aminos as a 25-page tail.

This doc proposes finishing what the operator's build pattern already started.

## Four candidate options + pro/con

### Option A — Retire Aminos, Dr. Hex is canonical, Ghost builds on top

Scope (revised post-Nancy round 2 to fix the implementation spec and archive sequencing):

**Phase 1 — single commit, single deploy:**
- Remove the 25 Aminos `<script>` embeds.
- **Add Dr. Hex to the 9 Aminos-only pages** so none go dark: landing, dashboard, projects, signal/index, four course hubs, bot-test. Per-page insertion of BOTH the custom element AND the module script (verified pattern at `_app/houses/key/index.html:150-151`):

  ```html
  <hex-ai-button house="<house-slug>"></hex-ai-button>
  <script type="module" src="/_lib/HexAIButton.js"></script>
  ```

  House slug per page: landing → `"general"`, dashboard → `"general"`, projects → `"general"`, signal/index → `"signal"`, code/python-* → `"code"`, web/intro-networks + net-essentials → `"web"`, bot-test → `"general"`. Slug passes through to `hex-ai-bridge.js` regex `^[a-z][a-z-]{0,20}$` (verified) which accepts all of the above. `"general"` will produce a sparse ambient-state context (no house-specific flag captures); acceptable for the landing/dashboard/projects/bot-test pages where students aren't yet scoped to a house.
- Archive `_app/components/chatbots/bot-specs/` → `_app/_archive/aminos-2026-05-30/bot-specs/` and `ChatbotRouter.js` → `_app/_archive/aminos-2026-05-30/`. These are not served to students and have no live dependency.
- Mark F-54 → F-65 as `deferred` in sprint master with note linking this doc.

**Phase 2 — deferred until Aminos bots are formally deactivated on Aminos platform side:**
- `_app/bot-knowledge-*.html` stay at their current deployed URLs in Phase 1. The Aminos bots fetch them as training sources; moving them under `_archive/` would break the cached knowledge graphs of bots that are still alive on the Aminos dashboard.
- After operator confirms the 14 Aminos bots have been deactivated (or paused, or the Aminos account decommissioned), a follow-up commit archives the 14 bot-knowledge HTML files to `_app/_archive/aminos-2026-05-30/bot-knowledge/`.
- Cancel Aminos Premium subscription at operator's discretion. (Bot deactivation can precede cancellation; cancellation is purely a billing decision.)

Phase 1 is the architectural cleanup. Phase 2 is the orderly wind-down. Conflating them creates the URL-conflict Nancy caught.

Pros:
- Removes the visual two-button stack on 16 production pages today (`z-index: 9000` on both confirms they will collide).
- Closes the Ghost-layer memo's #1 blocker. The conflict was an artifact of two parallel intervention layers; one survives.
- Aligns deployed state with the build direction the operator already committed.
- Voice consistency platform-wide. Students hear one AI across browse → lab → quiz → exam.
- Anti-jailbreak surface unifies. Voice_linter Phase 2 enforces 5 BLOCK codes on Dr. Hex (`no_emoji`, `no_flag_value`, `no_walkthrough_paste`, `no_forbidden_disclosure`, `no_lived_experience`). Aminos bots have anti-spoiler `globalInstructions` in their specs but no voice_linter, no Help Level gate, no operator dashboard visibility, no drift detector, no flag-leak fuzzing. The protection difference is real but narrower than "no guardrail" — Aminos has prompt-level guardrails, Dr. Hex has prompt-level + runtime-enforced guardrails.
- Closes the 9-page AI-gap that exists today by adding Dr. Hex where there's no AI.
- Cleanup is reversible. Aminos bots stay alive on the Aminos platform; embeds can be re-added if direction reverses.

Cons:
- Loses the house-personality experiment (Alan Turing on AI house, Linus Torvalds on script, J.C.R. Licklider on cloud, etc. — see verified persona table above). The personas are well-crafted; some students may have grown attached to them.
- Removes a functional multi-vendor AI hedge. Dr. Hex's availability depends on: CF callable → Cloudflare Tunnel → hexclass server → Ollama on Arc Pro B60. Documented infrastructure pain in `project_hexclass_server.md` (KUSTUDENT blocking, ePaper firmware, board recovery). If hexclass is down, Aminos was a 25-page fallback path. Option A removes that fallback. Mitigation: design a hexclass-down degradation mode for Dr. Hex (cached canned responses, "I'm offline" graceful message) as a follow-up sprint item — but that work doesn't exist today.
- Cancels effective spend on Aminos Premium Unlimited.
- F-53 work (the build-out of the 14 bot-specs and knowledge pages) is shelved. Not deleted (archived), but not in use.
- Students currently mid-conversation with an Aminos bot on those 25 pages have their session terminated when the embed is removed. Coordination: announce window, deploy during low-traffic period.

Risk: medium. Reversible but touches the platform's two highest-traffic pages.

### Option B — Aminos for house personality, Dr. Hex for work, Ghost on top of Dr. Hex only

What it means:
- Leave Aminos embeds on the 16 doubles + 9 Aminos-only pages.
- Remove Dr. Hex from the 16 doubles.
- Dr. Hex stays on all 2,417 work-surface pages.
- Ghost integrates only with Dr. Hex.

Pros:
- Preserves the historical-figure personality on landing, dashboard, house indexes, course hubs — exactly the pages where students browse and Aminos's personality might create stronger brand.
- One AI per page (no double-button stack).
- Dr. Hex retains the work surface where Help Levels and voice_linter matter most.
- Preserves the multi-vendor uptime hedge for the high-traffic landing/dashboard pages.

Cons:
- Two-AI student journey: Alan Turing greets you on the AI house index, then Dr. Hex (no persona) takes over on every AI lab and quiz beneath it. Voice discontinuity. Students will notice.
- F-54 → F-65 (the 11 deeper personas) would need to be either built out properly for the indexes or left as today's spike-era prompts. Building out is the original sprint commitment but means designing personas in parallel to Dr. Hex's continued development.
- Voice_linter has no jurisdiction over Aminos. Two anti-jailbreak postures. Operator dashboard sees Dr. Hex observations only.
- Ghost layer can only intervene on Dr. Hex pages. Detection signals stop at the work-surface boundary; cross-page handoffs are blind.
- Preserves complexity rather than simplifying.

Risk: medium. Stable in the short term but doubles the maintenance surface (two AI stacks, two prompt-engineering surfaces, two failure modes).

### Option C — Migrate Aminos personas INTO Dr. Hex (house-themed persona swap)

What it means:
- Dr. Hex's persona slot becomes house-themed. On script house pages, Dr. Hex speaks as Linus. On code house pages, as Ada. On AI house pages, as Alan.
- All 25 Aminos embeds removed.
- Dr. Hex's voice_linter + Help Levels + Constitution still apply, persona-swapped surface voice.
- Ghost layer builds on this unified Dr. Hex.

Pros:
- Preserves the house-personality experiment.
- Single architectural surface. Single anti-jailbreak path. Single ambient state. Single quality dashboard.
- Persona-swap is partially supported already (HexAIChatPanel constructor takes options; persona-per-house is incremental config).
- Voice_linter + Help Levels remain in force across all personas. Drift detector measures persona-specific baselines.
- Repurposes the 14 already-written bot-spec prompts as persona source material — sunk cost is recovered, not lost.

Cons:
- Significant prompt-engineering work. 11 distinct persona prompts, Karl-verified for historical accuracy, Nancy-reviewed against Dr. Hex Constitution.
- **Voice_linter `no_lived_experience` collision is real.** A persona built on the historical Alan Turing would plausibly say "In my experience with the halting problem…" — which matches `_LIVED_EXPERIENCE_PATTERNS` line 222 (`\bin my experience\b`) and fires `VOICE_LINTER_REFUSAL` in ENFORCE mode. The personas would need either prompt discipline ("speak ABOUT your namesake's work, never AS having lived it") or persona-specific linter exemptions. The latter weakens the linter; the former is achievable but adds prompt-engineering load.
- Naming awkwardness: "Dr. Hex speaking as Linus" is the architectural reality; "Linus" is the student-facing brand. Marketing-level question.
- Latency unchanged but persona switch adds prompt-load overhead. Trivial on Arc Pro B60.
- Doesn't address the multi-vendor uptime hedge concern (still single-stack dependent on hexclass).

Risk: medium-high. Sound architecture but heavy build with real voice_linter design surface.

### Option D — Status quo + add Ghost (three AI surfaces per page)

What it means:
- Leave the 16 doubles as-is.
- Build Ghost as a third surface on top.

Pros:
- No removal. No persona work. Ghost can begin immediately.

Cons:
- Three AI surfaces on house indexes. Students get nudged by Ghost, see Aminos button + Dr. Hex button, don't know which to engage.
- Ghost has no orchestration with Aminos. Aminos has no visibility into Ghost's nudges. Ghost cannot detect "Aminos chat is currently open" — Aminos is a third-party iframe.
- Triples failure modes for "student got bad advice."
- Operator dashboard has no Aminos channel; observability bifurcates further.
- Constitution Law 6 (consistency) violation risk: students cannot trust an AI surface that contradicts itself across personas on the same page.

Risk: high. Compounds the existing double-AI problem.

## Recommendation

**Option A**, with the corrected scope above.

Three reasons in order of strength:

1. **The deployed reality already chose.** 2,433 Dr. Hex pages vs 25 Aminos pages. The operator's work in 2026-04 and 2026-05 made Dr. Hex the platform's AI. F-54 → F-65 sat in backlog for two months while AI-19 through AI-27 shipped. The architectural direction is written in the commit history.

2. **The blocker dissolves cleanly.** Ghost-layer memo's #1 unresolved blocker becomes resolved as soon as Aminos is retired. No tradeoff needed; the conflict was an artifact of two parallel layers.

3. **Runtime enforcement is the harder thing to build.** Aminos bots have anti-spoiler `globalInstructions` (prompt-level). Dr. Hex has those plus voice_linter Phase 2 (runtime-enforced), Help Levels, ambient state, drift detector, operator dashboard. The runtime enforcement is non-trivial to add to Aminos (third-party, no SDK access) and is the piece that protects pedagogical integrity. Keeping the surface that doesn't enforce at runtime is keeping the weaker half of the platform's AI defenses live.

**Option C is the second choice** if the operator's attachment to the personas is strong enough to justify the additional build work and the voice_linter design surface. It is defensible architecture.

**Option B is the worst** active choice — it preserves the two-AI student journey discontinuity.

**Option D should be rejected outright** — it compounds the existing UX problem.

## Concrete next steps if Option A is chosen

**Phase 1 commit (architectural cleanup):**

1. **Sweep + add + archive (non-knowledge) as a single coordinated change.** One commit:
   - Remove 25 Aminos `<script>` tags from the embed pages.
   - Add `<hex-ai-button house="...">` + `<script type="module" src="/_lib/HexAIButton.js">` to the 9 Aminos-only pages with house slug per page (see Scope above).
   - Archive `bot-specs/` and `ChatbotRouter.js` under `_app/_archive/aminos-2026-05-30/`.
   - Leave `_app/bot-knowledge-*.html` in place (they're still serving live Aminos bots).
   - Single EduScan pass, single Nexus pass.
2. **Verify in browser preview channel.** Deploy to `firebase hosting:channel:deploy aminos-retire`. Spot-check: each of the 9 Aminos-only pages now shows exactly one Dr. Hex button; each of the 16 doubles now shows only the Dr. Hex button (no two-button stack); five random Dr. Hex-only pages still work normally. Network tab clean of `aminos.ai` requests.
3. **Coordinate deploy timing.** Announce a low-traffic window; mid-conversation Aminos sessions will terminate when embeds are removed.
4. **Deploy via `./deploy.sh`** (canonical hosting path with smoke + Nexus gates).
5. **Verify post-deploy:** landing + dashboard show Dr. Hex button; AI house index no longer stacks two buttons; admin dashboard still shows Dr. Hex observations flowing; no `aminos.ai` requests in production network traces.
6. **Mark F-54 → F-65 as `deferred` in sprint master** with one-line notes linking this doc.
7. **Update memory files:**
   - `project_house_bots.md` → note "Plan superseded by Dr. Hex 2026-05-30; embeds removed; specs archived; knowledge pages still live pending Phase 2."
   - `project_ai_ghost_layer.md` → strike Aminos as blocker #1; update priority list.
   - `project_dr_hex_live.md` → note "canonical reactive AI as of 2026-05-30."
8. **Open follow-up sprint item: Dr. Hex degradation mode.** When hexclass is unreachable, Dr. Hex returns a graceful "I'm offline right now — try the lab walkthrough or check back in a few minutes" rather than failing silent. Replaces the multi-vendor hedge Aminos provided with a single-vendor graceful-degradation pattern. See "Uptime resilience" note below.

**Phase 2 (deferred — orderly Aminos wind-down):**

9. **Operator deactivates the 14 Aminos bots** on the Aminos platform dashboard (or pauses them, or schedules cancellation).
10. **Second commit archives the 14 bot-knowledge HTML files** to `_app/_archive/aminos-2026-05-30/bot-knowledge/`. EduScan + Nexus + deploy as standard.
11. **Cancel Aminos Premium subscription** at operator's discretion. (Free tier exists if operator wants to preserve the bots for archaeological access.)

## What this doesn't decide

- Whether the Ghost layer's intervention surface is house-mascot-styled, side-rail-styled, or chat-icon-glow. Still open per existing Ghost-design doc.
- Whether the operator wants any persona variation in Dr. Hex (Option C is still on the table as a v2 feature *after* Option A's cleanup, with the 14 archived bot-specs as source material).
- The remaining 7 Ghost-layer blockers from `project_ai_ghost_layer.md` (B1 cue, B2 thresholds, B3 lab map, B4 Help Level gate, latency SLO, eval bar, Help Level 0 opt-out behavior).
- Whether Dr. Hex needs a degradation-mode implementation before Option A ships, or as a follow-up. The hexclass infrastructure has documented stability gaps (KUSTUDENT WiFi blocking on Keiser network, ePaper Room 214 firmware incomplete, board recovery work; see `project_hexclass_server.md`). Calling the regression "brief" understates the documented record. Honest framing: Option A couples the platform's AI surface to hexclass uptime until degradation-mode ships. Recommend treating degradation-mode as a high-priority follow-up — not a v1 prerequisite, but not deferrable either. Operator should pick the sequencing based on their tolerance for AI surface unavailability during hexclass incidents.

## Why this needs explicit operator approval (not a routine choice)

This is a load-bearing platform decision, not cleanup. Specifically:

- It retires functional production infrastructure (14 LIVE Aminos bots with deployed knowledge pages serving 25 student-facing pages).
- It touches the platform's two highest-traffic pages (landing + dashboard) by adding Dr. Hex where there is currently no AI.
- It authorizes cancelling a paid subscription (Aminos Premium Unlimited).
- It unblocks the Ghost layer, which is itself a major architectural direction the operator set as the next priority — and locks the platform onto a single-vendor AI stack until a degradation-mode design ships.
- It supersedes the explicit 16-decision design from 2026-03 (`project_house_bots.md`) that the operator authorized at the time.

The recommendation (Option A with corrected scope) reflects the operator's actual build pattern over the last two months, but the formal decision to decommission the parallel infrastructure should be made deliberately, with this doc as the artifact of record.

## Related

- `_docs/architecture/hex-ai-ghost-layer-design.md` — Ghost design
- `_docs/operations/dr-hex-production-stability.md` — voice_linter, drift detector, quality dashboard
- `_docs/operations/dr-hex-constitution.md` — Help Levels, Laws 1-10
- `_tools/hexclass/orchestrator/voice_linter.py` lines 46-60 (ENFORCE_BLOCK_CODES), lines 215-229 (`no_lived_experience` patterns)
- `_app/_lib/HexAIChatPanel.js` — production reactive surface
- `_app/components/chatbots/bot-specs/*.json` — Aminos bot specs (14 LIVE)
- `_app/components/chatbots/ChatbotRouter.js` — unimported smart-routing implementation
- Memory: `project_ai_ghost_layer.md`, `project_house_bots.md`, `project_dr_hex_live.md`

---

**Decision pending operator approval.** Primary will not proceed to implementation without explicit go-ahead on (a) Option choice, (b) timing window, (c) whether degradation-mode work blocks or follows.

---

## ADDENDUM — 2026-06-02 operator scope correction: Dr. Hex is lab-only

After the v3 doc was approved and the branch `aminos-retire` was deployed to preview channel, the operator surfaced a constraint missed in v1–v5 review: **"Dr. Hex is only available during labs."**

This constraint is grounded in `dr-hex-constitution.md` and `dr-hex-lab-skill-map.md`. Dr. Hex's behavior model (Help Levels 0–5, mood-ring state, drift detector, Skill Map preservation) is lab-anchored: the per-lab Skill Map is the source of truth for which skills are preserved and how Help modulates. On non-lab pages, none of that machinery has a target — the button is decorative at best, off-mission at worst.

**The "add Dr. Hex to 9 Aminos-only pages" item in Option A is invalidated by this constraint.** None of those 9 pages is a lab:

| Page | Type |
|---|---|
| `_app/index.html` | landing |
| `_app/dashboard.html` | hub |
| `_app/projects/index.html` | browse |
| `_app/signal/index.html` | browse |
| `_app/houses/code/python-for-it/index.html` | course hub |
| `_app/houses/code/python-programming/index.html` | course hub |
| `_app/houses/web/intro-networks/index.html` | course hub |
| `_app/houses/web/net-essentials/index.html` | course hub |
| `_app/bot-test.html` | archive target |

### Corrected Phase 1 scope (operator-confirmed 2026-06-02)

1. Remove 25 Aminos `<script>` embeds (unchanged).
2. **Do NOT add Dr. Hex to the 8 non-lab Aminos-only pages.** They end up AI-less. This matches the current production state on landing, where Aminos has been broken (403 from `getBotSettings`) and the landing page has had no working AI button for some time.
3. Archive bot-test.html, ChatbotRouter.js, bot-specs/ (unchanged).
4. Mark F-54 → F-65 deferred (unchanged).
5. **HexAIButton.js auth-prompt patch is reverted** — was only needed because Dr. Hex was going on landing/dashboard where unauth visitors could see the button. With Dr. Hex staying lab-only, those pages are never reached by Dr. Hex unauthenticated.

### Out-of-scope (acknowledged, not addressed by this commit)

There are ~169 pre-existing `index.html` pages (12 house hubs + course hubs + dashboard + etc.) currently carrying `<hex-ai-button>` from prior decisions. By the lab-only constraint, those installations are also out-of-shape. **This commit does NOT sweep them.** Operator chose the minimal correction. A separate sprint item should track the broader cleanup if/when scoped.

### Why this matters

The doc shipped to preview was correct as a deliberation artifact but wrong as a ship plan. Nancy rounds 1–5 caught architectural/correctness/CSS issues but not the lab-only constraint because that constraint isn't articulated anywhere the agents have direct sight of (it lives in the operator's mental model and is implicit in the Constitution's emphasis on lab Skill Maps). This is a documentation gap the Dr. Hex governance doc should close — the lab-only scope rule belongs alongside the Help Levels and persona laws.

---

## ADDENDUM 2 — 2026-06-02 operator reframing: Aminos and Dr. Hex are non-overlapping by design

After the corrected scope shipped (commit `c1d55ff03`), the operator clarified the actual platform architecture in chat. The retirement-of-Aminos premise was wrong from day 1, not just incomplete. The correct model:

| Surface | AI | Rationale |
|---|---|---|
| **Lab pages** (`*.lab.html`, `*-guilab.module.html`, `*-pslab.module.html`, interactive applets, lab equivalents) | **Dr. Hex** | Skill Map preservation, Help Level 0–5, mood-ring tracking attempts. Built for active doing. |
| **Quizzes** (`*.quiz.html`, `*-quizquiz.module.html`) | **None** | Assessment integrity. No AI assistance during graded work. |
| **Exams** | **None** | Same as quizzes. |
| **Slides / presentations** (`*-presentation.module.html`, `*-intro.module.html`) | **Aminos** with per-house bot | Browse-time companion for students who want to go deeper on the lecture content. |
| **Hubs, landing, dashboard, course indexes, browse pages** | **Aminos** with per-house bot | Personality-driven engagement during exploration. Alan Turing on AI house, Ada on Code, Linus on Script, Tesla on Signal, Hexworth Assistant on landing/dashboard. |

**Phase A — Aminos restoration (this branch, `aminos-restore`, 2026-06-02):**

Reversed the Aminos `<script>` removal on the 24 student-facing pages stripped by `d619521ef` + `c1d55ff03`. Used `git checkout 0174c7ac4 -- <files>` to restore the verbatim pre-retirement embed lines. Per-house bot mapping is preserved as it was — no re-decisioning of which bot goes on which page. `bot-test.html` stays archived (genuinely a `noindex` internal test page, not student-facing).

**Phase A scope (24 files restored):**
- 16 house-index doubles → Aminos `<script>` restored; Dr. Hex still present (to be removed in Phase B)
- 8 browse-only pages → Aminos `<script>` restored, Dr. Hex stays out (already correctly absent)

**Phase A does NOT include:**
- Dr. Hex removal from the 16 doubles and the ~145 other pre-existing non-lab installations (course hubs + sub-indexes + quizzes + presentations carrying Dr. Hex against the lab-only rule). That is **Phase B**.
- Extending Aminos to presentation pages and course hubs that don't have it today. That is **Phase C**.
- Un-deferring sprint items F-54 → F-65 (the per-house bot deepening work). The deferral note in `sprints.json` is now invalid (Aminos isn't being retired). Operator decision pending on whether to un-defer.
- Investigation of the production 403 Aminos was throwing on `getBotSettings` pre-retirement. Could be Aminos Premium status, domain allowlist, or bot pause. Operator-side check.

**What this Phase A commit is NOT solving:**

This commit gets the platform back to its pre-retirement Aminos state with the architecture doc finally telling the truth about the model. It does NOT fix every misplaced AI surface on the platform — that's Phase B + C work that needs separate Nancy review and operator sign-off.

### Architectural lesson worth keeping

The doc's whole deliberation chain (Options A–D, pro/con, Nancy v1–v5, Karl, the recommendation) was rigorous within its premise. The premise was wrong. None of the agent reviews — including five rounds of Nancy specifically tasked with finding flaws — surfaced the lab-only rule because:

1. The constraint lives in `feedback_dr_hex_lab_only.md` (operator memory) but isn't articulated in `dr-hex-constitution.md` or any other doc the agents directly grep.
2. `MEMORY.md` is over its load limit (44.7KB vs 24.4KB), so the index entry pointing to the lab-only rule was truncated below the load cut-off when the primary started this session.
3. The doc's own framing ("Dr. Hex on 2,433 pages already") implicitly contradicted the lab-only rule, but no agent was prompted to question the framing itself — only to find flaws within it.

Fix on the doc side: the lab-only rule needs to be added to `dr-hex-constitution.md` as an explicit "WHERE Dr. Hex appears" section, with a corresponding "WHERE Aminos appears" section that names the per-house bot mapping. That makes both rules grep-able and resolves the truncation gap.

Fix on the agent side: future Nancy/Karl prompts for architectural decisions affecting AI surface placement should be primed with the surface-placement rules explicitly, not inferred from Constitution/Skill-Map docs.
