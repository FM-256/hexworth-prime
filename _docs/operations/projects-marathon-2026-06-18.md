# Projects Marathon — render-QC sweep + beginner-detail uplift (started 2026-06-18)

## Goal (operator directive)
"Start a marathon on the projects: run the full project-page sweep and make all our
projects more detailed so beginners can complete it."

Two workstreams:
- **A — Render-QC sweep + fix** (mechanical, decision-free): every project page renders
  correctly, no mobile overflow, no JS errors.
- **B — Beginner-detail uplift** (content): bring projects up to the zero-knowledge
  executability bar proven on `starter-first-webpage.html`.

## Scope
**127 HTML pages** in `_app/projects/` (126 projects + `index.html`), across 13 houses:
ai, cloud, code, darkarts, divergent, eye, forge, key, matrix, script, shield, starter, web.

## The beginner-executability bar (from the webpage exemplar)
A project PASSES "a beginner can complete it" only if a true novice can follow it
click-by-click, unaided, and finish with a working result. Concretely:
1. **Real tool/UI names** as they exist today (verified, not from memory).
2. **OS-level steps** where needed (make folder, create file, install, run) — not "create a file".
3. **Full-file / full-state snapshots** at each phase so there's always a whole-artifact model.
4. **Paste-ready text/code/commands** where the student must author something.
5. **Anticipated failure modes** with named fixes (the #1 beginner traps).
6. **What to ignore** — name the options to skip.
7. **Accurate prerequisites + licensing/access** (free tiers, accounts).
8. **Observable win condition + checkpoint** per phase.
9. **Honest caveats** where the simple path differs from "the real thing."

Gate each substantive content change: **Nancy (adversarial) + Chris (executability)**, plus the
**headless render-QC probe** (text gates miss render bugs).

## Workstream A — render-QC sweep
Probe: `/tmp/qc-fullsweep.js` — loads each page at 360/390, reports
`documentElement.scrollWidth - clientWidth` and JS errors. Results JSON:
`/tmp/qc-fullsweep-results.json`.

Known bug class: `.cf-req-list li { display:flex }` text won't wrap below min-content without
`overflow-wrap:anywhere`. Fix = 4-line CSS guard (proven on webpage/agent/workflow). Likely
present on every case-file page with a long requirement line.

### Sweep status
- [x] Sweep complete: **126 pages, 20 offenders, 0 JS errors, 0 load failures.**
- [x] Root mechanism diagnosed: `.cf-evidence-card { display:flex }` → `.cf-evidence-body
  { flex:1 }` has **no `min-width:0`**, so a long token anywhere in the body pins the body to
  its min-content width and every block child renders at that width (e.g. a short title showing
  553px wide). Same min-content/flex bug as `.cf-req-list li`. Pages differ only by *content*
  (a long word/URL/command), which is why only 20 of 126 tripped it.
- [x] **Universal recipe** (validated by render-time injection → all 20 go to 0px at 360/390):
  ```
  .cf-evidence-body { min-width: 0; overflow-wrap: anywhere; }
  .cf-req-list li { overflow-wrap: anywhere; }
  code { overflow-wrap: break-word; word-break: break-word; }
  .cf-code, pre { overflow-x: auto; }
  ```
  Applied to all 20 (inserted before final `</style>`).
- [ ] Re-sweep confirms 0 offenders (running)
- [ ] Deployed + verified live

Offenders fixed: starter-first-pipeline, code-arduino-pipeline, key-password-vault,
starter-github-profile, forge-virtualbox-first-vm, code-serial-console, ai-threat-classifier,
script-data-logger, darkarts-metasploit, ai-rag-chatbot, divergent-field-terminal,
starter-first-bot, cloud-container-checker, starter-first-repo, starter-first-hack,
darkarts-recon-automation, starter-first-app, matrix-traffic-dashboard, ai-intrusion-detector,
shield-ids-ml.

## Workstream B — beginner-detail uplift (prioritized)

### Depth audit (2026-06-18) — the gap is concrete
Signals: # of `.cf-steps` walkthroughs / `.cf-fix` failure boxes / `.cf-code` paste blocks / words.
- **Exemplars:** webpage = 5 steps / 2 fix / 17 code / 6,102 w; agent = 5 steps / 6,282 w;
  workflow = 3 steps / 4,591 w.
- **Everything else (19 starter pages + calculator/github-profile/portfolio):** **0 `.cf-steps`,
  0 `.cf-fix`, 0 `.cf-code`, ~3,000 w.** They have the 4-5 phase cards + checkpoints but only
  *describe the outcome* — no click-by-click steps, no paste-ready code/commands, no failure
  modes. This is the exact "outcome-description" defect the My First audit caught on Agent L1.

So Tier-1 work = give each of these the walkthrough treatment: real per-phase `.cf-steps`,
paste-ready commands/code, `.cf-fix` boxes for the top beginner traps, full-state snapshots where
it helps. Tools are real (git, Docker, nmap, Flask, SQLite, etc.) — commands must be verified
(Karl-grade), not from memory.

Tier 1 — **starter-first-\*** + 3 starters. DONE: webpage, agent, workflow.
  Pending (need walkthroughs): knowledge-base, tool, first-app, first-api, first-bot,
  first-container, first-database, first-firewall, first-gui, first-hack, first-network,
  first-pipeline, first-repo, first-scan, first-script, first-server, calculator,
  github-profile, portfolio-site.
Tier 2 — house-themed beginner projects (intro-level ai/cloud/code/etc.).
Tier 3 — intermediate/advanced house projects (detail helps, "zero-knowledge" bar relaxed).

### Scale reality
~19 Tier-1 rewrites, each comparable to the agent/webpage rebuild (multi-pass, tool-verified,
dual-gated). This is a multi-session marathon. Approach: one page (or small batch) at a time,
each grounded in current tool docs, each through Nancy + Chris + render-QC before deploy. No
mass-generation without per-page verification (avoids the "advertising-flyer" failure mode).

### Workstream B — completed pages
- **starter-portfolio-site** (DONE 2026-06-18): rebuilt 805→1290 lines. 5 phases now full
  walkthroughs (HTML skeleton w/ boilerplate, About/Skills, Projects + Contact fill-in, CSS w/
  Google Fonts + responsive grid, GitHub Pages deploy verified vs current docs). Authored by
  edu-content-designer (exemplar-grounded), then gated: Chris PASS; Nancy PAUSE→fixed (wrong
  "update nav links" claim removed; `&display=swap`→valid `&amp;display=swap`; Contact placeholder
  now filled via a real step; sticky-nav `scroll-margin-top`; Phase-3 desc mismatch). 0px overflow
  360/390/768/1280, no JS errors. **Pattern proven: delegate authoring → hard-gate → fix → ship.**

## Progress log (newest first)
- 2026-06-18: Marathon started. Enumerated 127 pages. Full render-QC sweep launched.
  Prior: webpage brought to tutorial standard (`b046e5768`); agent+workflow overflow fixed
  (`c083584c2`). See `my-first-series-audit-2026-06-17.md`.
