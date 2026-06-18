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
Tier 1 — **starter-first-\*** (the explicit beginner on-ramps, ~24 pages). Highest leverage.
  - DONE to bar: webpage (exemplar), agent (L1-L5), workflow (L1/L2/L4; L3/L5 premium-flagged).
  - Pending: first-app, first-api, first-bot, first-container, first-database, first-firewall,
    first-gui, first-hack, first-network, first-pipeline, first-repo, first-scan, first-script,
    first-server, calculator, github-profile, portfolio-site, knowledge-base, tool.
Tier 2 — house-themed beginner projects (intro-level ai/cloud/code/etc.).
Tier 3 — intermediate/advanced house projects (detail helps, "zero-knowledge" bar relaxed).

## Progress log (newest first)
- 2026-06-18: Marathon started. Enumerated 127 pages. Full render-QC sweep launched.
  Prior: webpage brought to tutorial standard (`b046e5768`); agent+workflow overflow fixed
  (`c083584c2`). See `my-first-series-audit-2026-06-17.md`.
