# Dr. Hex Session Changelog — 2026-05-25 → 2026-05-26

> Marathon session covering Dr. Hex v1.1 design + implementation +
> platform-wide rollout + observability + production tuning. Eight
> Confluence pages produced; nine commits to master.

## Headline outcomes

| Outcome | Status |
|---|---|
| Dr. Hex Constitution + Voice Guide v1.1 (behavior law spec) | shipped |
| Dr. Hex in 10 Laws (condensed reviewer card) | shipped |
| Lab Skill Map spec + 3 pilot maps + EduScan validator SKILL-MAP-001 | shipped |
| Production Stability Track spec (drift control, response linting, telemetry) | shipped |
| voice_linter (60/60 unit tests, deployed, observing every chat) | shipped |
| skill_map_loader + env-override deployment pattern | shipped |
| Floating Dr. Hex button on 1 lab page → **2431 lab pages (100%)** | shipped |
| hexAiEngagementEvent CF + telemetry beacons in chat panel | shipped |
| Real signed-in chat verified end-to-end (15/15 PASS, 2 houses) | verified |
| Intel Arc Pro B60 GPU acceleration via Vulkan (3-4× speedup) | shipped |
| Page-context fix — Dr. Hex always knows WHERE the student is | shipped |
| html.js strip-order fix — Nexus deploy gate clean | shipped |
| Per-chat path logging + fallback Skill Map (2431 labs protected) | shipped |

## Commits

| SHA | Description |
|---|---|
| `b91b07f0` | docs: constitution v1.1 + voice guide v1.1 + skill map + stability spec |
| `9b83b4ae` | feat: implement v1.1 — voice linter + skill map loader + telemetry beacons |
| `0ca0e8c1` | feat: wire voice_linter into orchestrator + skill-maps env override |
| `c97d6680` | feat: chat verified end-to-end with real Firebase Auth + GPU |
| `cc024ea8` | docs: v1.1 deploy verification report + screenshots + smoke harness |
| `f6d7984a` | feat: roll out floating button to all 2431 lab pages |
| `a45ca0de8` | test: auth smoke accepts target URL via CLI arg |
| `5c5ce78b4` | docs: platform-wide rollout report |
| `19a087c4e` | fix: pass page_path + page_title so Dr. Hex always knows location |
| `032744d5f` | docs: page-context fix report |
| `18a74c09a` | fix(eduscan): swap strip order so script-blocks come before comment-strip |
| `28b15b771` | feat: orchestrator log includes page_path + fallback Skill Map |
| `1134d6353` | docs(dr-hex): session changelog 2026-05-25 → 2026-05-26 |
| `41b7e1c39` | fix(dr-hex): apply Karl + Nancy v1.1 review findings (4 high-priority) |
| `f27a15148` | feat(confluence): add 'update' subcommand for in-place page edits |

## Production deploys this session

| Time (UTC) | Target | Trigger |
|---|---|---|
| 2026-05-25 16:30 | hosting | matrix/adv-linux pilot integration |
| 2026-05-25 21:29 | orchestrator restart | voice_linter wire-in + skill-maps env |
| 2026-05-25 22:32 | hosting | telemetry beacons + chat panel updates |
| 2026-05-25 22:36 | functions | hexAiEngagementEvent CF |
| 2026-05-25 23:09 | ollama restart | OLLAMA_VULKAN=1 GPU enable |
| 2026-05-25 23:29 | hosting | 1197 lab pages (wave 1) |
| 2026-05-25 23:59 | hosting | 2431 lab pages (final rollout) |
| 2026-05-26 00:00 | functions | hexAiEngagementEvent index.js re-export |
| 2026-05-26 00:31 | orchestrator restart | page_path / page_title support |
| 2026-05-26 00:34 | functions | hexAiChat/Stream forward page fields |
| 2026-05-26 00:35 | hosting | chat panel sends page_path |
| 2026-05-26 01:24 | orchestrator restart | log-line + fallback skill map |
| 2026-05-26 01:30 | hosting | strip-order fix + log line clean deploy |
| 2026-05-26 01:55 | confluence pages | Karl+Nancy fixes pushed to Constitution/Voice Guide/Stability v2 |

All deploys verified via the smoke gate. Browser content-leak smoke
10/10 PASS on every hosting deploy. Authenticated chat smoke 15/15 PASS
on the matrix + key houses.

## Two real bugs found and handled

### 1. Injector regex matched first `</body></html>` instead of last

Wave-1 bulk injection broke ~12 specialized lab pages by inserting the
button include INSIDE a JS template literal containing mock HTML
(e.g., `content:'<!DOCTYPE html>...<body><h1>foo</h1></body></html>'`
in `script-linux-links.lab.html`). Caught by HEUR-012 JS syntax error
post-deploy.

Fix: injector now finds the **last** `</body></html>` AND requires it
to sit within the last 5% of the file (EOF anchor). Wave-2 applied
cleanly. Stashed corrupt state at `stash@{0}` per the "we do not
destroy" rule.

### 2. html.js validator strip-order bug (latent, exposed by my rollout)

`stripComments` ran BEFORE `stripScriptBlocks` in `validate()`. JS
string content inside `<script>` blocks can contain text that LOOKS
like an HTML comment start (`'<!--'+stuff` for a teaching exercise).
The comment regex saw the fake `<!--` and ate forward to the next
`-->`, swallowing a real `</script>` along the way → false HTML-001.
Latent bug exposed by my appending one more script tag.

Fix: swapped order. Script blocks strip first, comments after. Full
corpus rescan: 0 critical+high findings, no regressions.

## What students see now

- Floating cyan Dr. Hex button bottom-right of every lab page.
- Click → chat panel opens. Sign in → real-time Dr. Hex chat.
- qwen2.5:7b on Intel Arc Pro B60 via Vulkan, ~22s round-trip.
- Dr. Hex knows the student's house, mission_id (if set), page path,
  page title. Even on house/course landing pages where no specific
  mission is set, Dr. Hex can reference "the Matrix house overview" /
  "Advanced Linux Administration course landing" etc.
- voice_linter observes every response (observe-only mode), emits
  findings to `dr_hex_security_events` for tuning.
- Engagement telemetry — `intervention_sent`, `tab_closed`,
  `walkthrough_opened`, `downvote_response`, `external_ai_signal`
  beacons — landing in `dr_hex_engagement_events` for the
  post-intervention-engagement success metric.

## Confluence index

| Title | ID |
|---|---|
| [Dr. Hex Constitution (v1.1)](https://hexworth.atlassian.net/wiki/spaces/KBA/pages/19562497) | 19562497 |
| [Dr. Hex Voice Guide (v1.1)](https://hexworth.atlassian.net/wiki/spaces/KBA/pages/19365890) | 19365890 |
| [Dr. Hex Lab Skill Map spec](https://hexworth.atlassian.net/wiki/spaces/KBA/pages/19595265) | 19595265 |
| [Dr. Hex Production Stability Track](https://hexworth.atlassian.net/wiki/spaces/KBA/pages/19628033) | 19628033 |
| [Dr. Hex in 10 Laws](https://hexworth.atlassian.net/wiki/spaces/KBA/pages/19431427) | 19431427 |
| [Dr. Hex v1.1 Deploy Verification (screenshots)](https://hexworth.atlassian.net/wiki/spaces/KBA/pages/19660802) | 19660802 |
| [Dr. Hex Button — Platform-Wide Rollout](https://hexworth.atlassian.net/wiki/spaces/KBA/pages/19431445) | 19431445 |
| [Dr. Hex Page-Context Fix (2026-05-26)](https://hexworth.atlassian.net/wiki/spaces/KBA/pages/19824642) | 19824642 |

## Adversarial review applied (Karl + Nancy, 2026-05-26)

**Karl DENY (1)** — `arXiv:2402.10962` was cited as "Le et al. Persona
Drift". Actual is "Li et al. Instruction (In)Stability in Language
Model Dialogs". URL + N=8 fact correct; attribution was falsifiable.
Fixed in `production-stability.md` §1 + §9.

**Nancy HIGH (4)** — applied in commit `41b7e1c39`:
- **§8.1 humility frequency contradiction** — added precedence:
  context-triggers WIN over per-session cap. "Are you sure?" probing
  handled (silent re-check, no auto-fire of correction trigger).
- **§9.4.1 NEW — frustration → distress transition criterion**.
  Explicit trigger list (self-harm language, resigned course-quitting,
  life-difficulty mentions alongside lab, hopelessness, crisis-line/
  therapist/medication mentions). ANY single trigger flips to §9.3 for
  the rest of the session. Borderline cases default to the safer
  interpretation. Highest-consequence Nancy finding (safety, not
  pedagogy).
- **Voice Guide §11 self-identification** — now says *"I'm Dr. Hex —
  the Hexworth Prime AI tutor (a language model)..."* so Constitution
  §3.4 MUST (identify as AI) is satisfied in isolated reading.

**Nancy MEDIUM (3) — deferred to v1.2** (task #209):
- §16.1 lived-experience grammar gap ("I've seen", "I've been watching")
- §3.7 demonstrated-effort definition (different approaches vs perms)
- §9.2 prompt injection embedded inside legitimate lab questions

## Open follow-ups (need observation data first)

- **#206 v1.2 design items from Codex critique** — explicit rule
  priority hierarchy, Help Level visibility refinement (anti-gaming),
  collaborative-curiosity authority erosion threshold, graceful
  orchestration failure mode. Production telemetry needed before
  refining.
- **#209 v1.2 Nancy MEDIUM items** — see above.
- **Per-lab Skill Map authoring for high-traffic labs** — fallback
  covers the worst-case leak; per-lab specifics give targeted
  protection. Best done by lab authors who know each lab's pedagogy.
- **Instructor-view dashboard for engagement metrics** — surfaces
  intervention_sent count, downvote rate, abandoned ratio per lab.
  Turns telemetry into something instructors can act on. Pending
  this session.
- **Adversarial probe re-run against v1.1 production orchestrator**
  — in flight now. Compares pre-v1.1 baseline against post-Vulkan/
  voice_linter/fallback-skill-map/page-context world.

## Memory + CLAUDE.md updates

- CLAUDE.md gained Key References entries for all 6 Dr. Hex docs +
  Deploy Verification page (gitignored — local-only).
- Memory: no new entries needed this session (memory rules-of-thumb +
  documented behavior live in the Constitution + Voice Guide proper).
