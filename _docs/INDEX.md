# Hexworth Prime -- Documentation Index

> Canonical reference for the Hexworth ecosystem. This directory consolidates internal
> documentation that was previously scattered across `_app/docs/`, `_tools/`, and `_planning/`.
>
> **Version:** 6.0.0 "IRON CURTAIN" | **Last reorganized:** 2026-04-05

---

## Why This Directory Exists

Hexworth Prime accumulated documentation organically across five locations:

| Location | What lived there | Problem |
|----------|-----------------|---------|
| `_app/docs/` | Architecture, audits, feature docs, gap analysis | **Deployed to production** -- internal docs publicly accessible |
| `_tools/` | INTRO.md, NEXUS_DESIGN.md, TOOL_INVENTORY.md | **Gitignored** -- best docs hidden from version control |
| `_planning/` | 184 planning docs, ADRs, sprint trackers | **Unstructured dump** -- no hierarchy, no discoverability |
| `CLAUDE.md` | AI session rules | **Narrow scope** -- only covers Claude Code conventions |
| Various READMEs | Per-directory context | **Fragmented** -- no cross-references |

This directory (`_docs/`) is the **consolidation point** -- not a new silo. Internal docs
were moved out of `_app/` (the deploy directory) so they stop being served to the public.
Student-facing content (lab guides, course catalogs, deployment guides) remains in `_app/docs/`.

**Security note:** The `_app/docs/` files previously included localStorage key names,
access control bypass details (God Mode, Master Key), gate cipher architecture, and full
component inventories -- all publicly accessible via Firebase Hosting. This reorganization
removes that exposure.

---

## Quick Start

**New to the project?** Read these three documents in order:

1. [`_tools/INTRO.md`](../_tools/INTRO.md) -- The ecosystem field guide (platform, toolchain, infrastructure, conventions)
2. [`architecture/platform.md`](architecture/platform.md) -- Platform internals (components, rendering, progress tracking, access control)
3. [`_tools/TOOL_INVENTORY.md`](../_tools/TOOL_INVENTORY.md) -- All 7 developer tools cataloged

**Starting a dev session?** Run:
```bash
cd _tools/sprint-master && node sprint.js dashboard    # What's on the backlog
cd _tools/nexus && node nexus.js status                # QC health across all tools
```

---

## Directory Map

### architecture/ -- How the platform is built

| Document | Lines | Covers |
|----------|-------|--------|
| [platform.md](architecture/platform.md) | 639 | Stack, design principles, file structure, 12 houses, standalone hubs, 131 components, 6 rendering patterns, progress tracking (localStorage keys + Firestore sync), access control (AccessGuard levels, God Mode, gate system), file naming conventions, page load sequences |
| [content-inventory.md](architecture/content-inventory.md) | 454 | Full content audit -- every module, lab, quiz, presentation counted by house |
| [content-map.md](architecture/content-map.md) | 381 | Content organization hierarchy, cross-house relationships, module type definitions |
| [hub-registry.md](architecture/hub-registry.md) | 602 | Hub definitions (Arena, Dispatch, Operator, Signal, Forensics, Arctic, Projects, Hive), sub-hub registry (Armory, Backbone, Cortex, etc.), certification track mappings |

**See also:**
- [`_tools/INTRO.md`](../_tools/INTRO.md) -- Higher-level ecosystem overview (3 products, infrastructure, bc1 server, content pipeline)
- [`_planning/ARCHITECTURE_DECISIONS.md`](../_planning/ARCHITECTURE_DECISIONS.md) -- Architectural Decision Records (AD-001 through AD-011+)

---

### operations/ -- QC, audits, and build tracking

| Document | Lines | Covers |
|----------|-------|--------|
| [gap-analysis.md](operations/gap-analysis.md) | 747 | Cross-house content gaps, missing modules, incomplete tracks, priority backfill list |
| [explore-all-audit.md](operations/explore-all-audit.md) | 222 | Audit of the Explore All tab -- orphaned content, missing links, discovery gaps |
| [hub-index-audit.md](operations/hub-index-audit.md) | 349 | House index page structural audit -- missing categories, broken paths |
| [catalog-validation.md](operations/catalog-validation.md) | 86 | ContentCatalog.js validation rules and known discrepancies |
| [presentation-status.md](operations/presentation-status.md) | 382 | Status of all presentations platform-wide -- completion, speaker notes, slide counts |
| [package-manifest.md](operations/package-manifest.md) | 711 | Build manifest -- every file in the deploy package, sizes, checksums |
| [stragglers-deploy-notes.md](operations/stragglers-deploy-notes.md) | — | v7.1.0 ZION pre-deploy disclosure: PROG-003 student-progress regression scheduling, STR-40 quiz-key workflow, incubator + truncation fixes |
| [stragglers-merge-runbook.md](operations/stragglers-merge-runbook.md) | — | Step-by-step copy-paste runbook for the v7.1.0 ZION merge + deploy + verification + rollback |
| [stragglers-progress-safety-audit.md](operations/stragglers-progress-safety-audit.md) | — | Per-change audit (8 categories) of branch impact on student progress data; recovery procedure |
| [stragglers-pr-body.md](operations/stragglers-pr-body.md) | — | Comprehensive PR description for the Stragglers branch landing |
| [web-flasher-runbook.md](operations/web-flasher-runbook.md) | — | Triage runbook for student "I tried to flash my ESP32 and it didn't work" — 7 failure buckets, what to check, escalation path |
| [web-flasher-smoke.md](operations/web-flasher-smoke.md) | — | Operations guide for the `web-flasher-smoke` Nexus deploy-gate spoke — 38 assertions, severity model, failure-mode triage table mapping every assertion to its likely root cause, off-switch usage, transient-findings mechanism |
| [web-flasher-hardware-smoke-2026-05-17.md](operations/web-flasher-hardware-smoke-2026-05-17.md) | — | Operator-driven hardware smoke test plan — 6 rounds across ESP32 DevKit / XIAO C3 / XIAO S3 / Pi Pico / Arduino Mega / Pi 3/4/5 with explicit PASS criteria |
| [lab-realism-enhancement-protocol.md](operations/lab-realism-enhancement-protocol.md) | — | LREP — methodology for re-skinning lab tool surfaces to mirror real-world security products (VirusTotal, Mandiant, Rapid7, NVD, SCCM, Splunk, etc.). 12 sections covering brand mapping, wave structure, shared-helper patterns, smoke-contract preservation, walkthrough sync. Canonical example: PIS-Final Patient Zero (38 routes, 13 tool surfaces, 73/73 smoke checkpoints). |

#### Safety Net & SYM Sprint (added 2026-05-03 onward)

Docs spawned by the post-fusion safety-net work and the SYM follow-up sprint. These are runbooks, design proposals, and investigation reports — not audits.

| Doc | Purpose |
|-----|---------|
| [safety-net-architecture.md](operations/safety-net-architecture.md) | Foundational document — full 4-stage architecture (validator → smoke → runtime monitor → alerts), what each stage catches, deploy gate flow |
| [eduscan-safety-net-2026-05-03.md](operations/eduscan-safety-net-2026-05-03.md) | HEUR-029 + XREF-001 + smoke-gate landing report |
| [fusion-runbook.md](operations/fusion-runbook.md) | Stragglers fusion (v7.1.0 ZION) operator runbook |
| [incident-response-playbook.md](operations/incident-response-playbook.md) | SYM-12 — when production breaks, who does what; rollback decision tree |
| [symbiosis-prerequisites-2026-05-04.md](operations/symbiosis-prerequisites-2026-05-04.md) | What had to land before SYM sprint could start; current state of HUB-001 verification |
| [prog003-audit-2026-05-04.md](operations/prog003-audit-2026-05-04.md) | Full 132-collision PROG-003 audit results, category breakdown, fix strategy |
| [prog003-rename-plan-2026-05-04.md](operations/prog003-rename-plan-2026-05-04.md) | Per-file rename plan for the ~100 unambiguous PROG-003 collisions |
| [sym-1-branch-archival.md](operations/sym-1-branch-archival.md) | SYM-1 — non-destructive branch archival via refs/archive/* |
| [sym-3-tiered-alerts-design.md](operations/sym-3-tiered-alerts-design.md) | SYM-3 — tiered alert design (PULSE/WARN/PAGE), MVP shipped via Cloud Monitoring log-based alert + email |
| [sym-6-smoke-target-proposal.md](operations/sym-6-smoke-target-proposal.md) | SYM-6 — smoke gate target expansion analysis (Tier 1 Minimal landed, +3 house indices) |
| [sym-8-hub001-fix-proposal.md](operations/sym-8-hub001-fix-proposal.md) | SYM-8 — fix strategy options for 503 broken hub refs (verified non-defect; deferred) |
| [sym-10-untagged-audit.md](operations/sym-10-untagged-audit.md) | SYM-10 — categorization of 2,563 untagged catalog modules (deferred until tag UI exists) |
| [sym-13-gcp-cost-monitoring.md](operations/sym-13-gcp-cost-monitoring.md) | SYM-13 — Cloud Billing budget runbook ($30/mo alerts at 50/100/110%); shipped 2026-05-05 |
| [sym-14-auth-probe-design.md](operations/sym-14-auth-probe-design.md) | SYM-14 — authenticated probe mode design; Secret Manager creds, hybrid same-image two-job pattern; awaits 6 user decisions |
| [sym-15-deferred-renames.md](operations/sym-15-deferred-renames.md) | SYM-15 — PROG-003 deferred renames (4 'other' bucket DONE 2026-05-05; 13 CLH bucket → SYM-17) |
| [sym-17-clh-three-layer-investigation.md](operations/sym-17-clh-three-layer-investigation.md) | SYM-17 — CLH course three-layer architecture investigation (hub + applets + linux applets + course modules); blocks rename work pending curriculum direction |

**See also:**
- [`_tools/NEXUS_DESIGN.md`](../_tools/NEXUS_DESIGN.md) -- Nexus hub-and-spoke QC orchestrator design
- [`_tools/EDUSCAN_DESIGN.md`](../_tools/EDUSCAN_DESIGN.md) -- EduScan code scanner design
- [`_tools/TOOL_INVENTORY.md`](../_tools/TOOL_INVENTORY.md) -- All 7 tools with commands, data paths, and integration points
- [`_planning/FIRESTORE_ANSWER_ARCHITECTURE.md`](../_planning/FIRESTORE_ANSWER_ARCHITECTURE.md) -- Server-side quiz grading architecture

**QC Pipeline (how quality flows through the system):**

```
EduScan scans code        HED captures runtime errors        Audit Tool checks content
  (14 validators)           (JS errors, 404s, promise          (registry sync,
   static analysis)          rejections in browsers)            structural integrity)
        |                           |                                |
        +------ nexus sync ---------+--------------------------------+
                     |
              Findings Store (findings.json)
              1,024 findings, dedup by source::code::file
                     |
         +-----------+-----------+
         |                       |
   nexus triage --apply    nexus gate
   (auto-create Sprint     (deploy.sh calls this --
    Master backlog items)   blocks on critical findings)
         |                       |
   Sprint Master           Firebase deploy
   (sprints.json)          (proceeds or aborts)
         |
   nexus pipe hed-github
   (auto-create GitHub issues
    from recurring HED errors)
```

Each tool is independent -- Nexus connects them without replacing them. Remove Nexus
and all six tools continue working exactly as before. See [`_tools/NEXUS_DESIGN.md`](../_tools/NEXUS_DESIGN.md)
for the full hub-and-spoke architecture, adapter interface, and "Connected But Empty" design pattern.

---

### features/ -- Platform feature documentation

Man pages for shipped features. Each document covers purpose, architecture, and technical decisions.

| Feature | Key Components | Description |
|---------|---------------|-------------|
| [Handler Comms](features/HANDLER_COMMS.md) | ActivityFeed, HandlerDirectives, DailyDirectives | Dashboard activity feed with smart nudges and daily missions |
| [User Profile Modal](features/USER_PROFILE_MODAL.md) | UserProfileModal, FirestoreLeaderboard | Click-to-view public profile dossier from leaderboard entries |
| [CTF Arena](features/CTF_ARENA.md) | BoxEngine, arena/index, ctf-leaderboard | Offensive security CTF boxes with flag capture and scoring |
| [XP Pipeline](features/XP_PIPELINE.md) | XPCalculator, FirestoreManager, Cloud Functions | Deterministic XP derivation, dual-authority reconciliation |
| [Skulpt Integration](features/SKULPT_INTEGRATION.md) | TurtleCanvas, SkulptRunner, vendor/skulpt | In-browser Python interpreter for turtle graphics |
| [Class Progress Tracking](features/CLASS_PROGRESS_TRACKING.md) | handler-dashboard, ProgressManager | Post-mortem: three-layer fix for 100% completion bug |
| [Mascot Animation System](features/MASCOT_ANIMATION_SYSTEM.md) | mascot/ components | Two-layer DOM architecture for continuous looping animations |
| [TripWire Defense](features/TRIPWIRE_DEFENSE.md) | TripWire.js, TripWireEffects.js | Anti-cheat honeypot: DevTools detection, tampering response |
| [Command Hijacking Labs](features/COMMAND_HIJACKING_LABS.md) | Dark Arts / Parrot Division | Linux command hijacking lab design (scoping doc) |
| [Desk Toys](features/DESK_TOYS.md) | DeskToys.js (planned) | Interactive Dispatch reward system (planning stage) |
| [XP Audit](features/XP_AUDIT_EQ6_vs_VORYX.md) | Firestore users collection | Real account comparison exposing XP calculation bugs |
| [Dark Arts Vault & Gates](features/DARK_ARTS_VAULT_GATES.md) | gate-cipher.js, AccessGuard.js, vault/index.html | 8-tier gated progression, cipher rotation, rank system, server-side validation |
| [Tenant System](features/TENANT_SYSTEM.md) | TenantRouter.js, TenantShell.js, TenantFilter.js, tenant-sw.js | White-label: 4-layer encapsulation, 9 dashboard variants, Service Worker injection |
| [Tournament System](features/TOURNAMENT_SYSTEM.md) | tournament-board/lobby/podium.html, ctfSubmitFlag CF | Team CTF competitions, dynamic scoring, flag salting, scoreboard freeze |
| [Achievement System](features/ACHIEVEMENT_SYSTEM.md) | AchievementManager/System/Registry/Panel.js | ~2,000 achievements, auto-generation from content, title system, discovery points |
| [Instructor Dashboard](features/INSTRUCTOR_DASHBOARD.md) | handler-dashboard.js, ClassManager.js, AssignmentManager.js | Class management, 12+ analytics, handler comms, exports, drill-down navigation |
| [Arcade & Game Tracker](features/ARCADE_GAME_TRACKER.md) | GameTracker.js, GameScoreboard.js, MultiPlayer.js | 75+ games, Score Reign passive XP, global leaderboards, 2-player modes |
| [Operator Missions](features/OPERATOR_MISSIONS.md) | OperatorEngine.js, AgentBridge.js, OperatorInterpreter.js | 72-mission Metroidvania: 50 Python levels with obstacles, permanent tools, persistent inventory, dispatch table pedagogy |
| [Arctic CLI Hub](features/ARCTIC_CLI_HUB.md) | ArcticEngine.js, ArcticData.js | 24 Linux districts, 600+ modules, 3 faction paths, section-level fog-of-war |
| [Signal Hub](features/SIGNAL_HUB.md) | SignalEngine.js, SignalData.js | 92 hardware projects, 6 platforms, real parts/costs, 22-tool toolkit |
| [Web Flasher](features/WEB_FLASHER.md) | web-flasher.html, my-devices.html, install-pi-os.html, vendored esptool-js, c2RequestStudentPairingCode CF | Multi-platform: ESP32 (in-browser flash + student device ownership), Pi Pico (UF2 drag-drop), Arduino Mega (IDE handoff), Pi 3/4/5 (Imager walkthrough). 4-way `flasherMode` dispatch. |
| [Forensics Hub](features/FORENSICS_HUB.md) | ForensicsEngine.js, ForensicsData.js, cert-alignment.js | 60 modules, 5 certification alignments, courtroom-ready framework |
| [Sandbox Labs](features/SANDBOX_LABS.md) | lab-manager/server.js, docker-compose.yml, SandboxLauncher.js | Docker containers, Traefik routing, Cloudflare Tunnel, Sablier idle mgmt |
| [Multiplayer & Hive](features/MULTIPLAYER_HIVE.md) | MultiplayerManager.js, HiveManager.js, VsBridge.js | 2-player arcade, ghost replay, Hive exploration, Red Queen, CTF VS mode |
| [Digital Life](features/DIGITAL_LIFE.md) | digital-life/index.js + 30 modules | Binary firefly ecosystem, 8 phases, procedural audio, cosmic events |
| [Incubation Hubs](features/INCUBATION_HUBS.md) | `houses/<h>/incubator/index.html` × 8, `INCUBATOR_MODULES[]` pattern, graduation README | Per-house parking lot for orphan modules without a curriculum yet — graduates at ≥10 modules + clear scope. Placement pipeline tooling in `_tools/eduscan/` |

---

### guides/ -- How-to references

| Document | Covers |
|----------|--------|
| [github-oauth-setup.md](guides/github-oauth-setup.md) | GitHub OAuth configuration for platform authentication |
| [version-control.md](guides/version-control.md) | Git workflow, branching strategy, deploy procedures |

**See also:**
- [`CLAUDE.md`](../CLAUDE.md) -- AI session rules (quality-over-speed mandate, critical rules, communication style)
- [`_tools/INTRO.md`](../_tools/INTRO.md) -- Quick reference section (deploy, scan, sprint, nexus, content shuttle commands)

---

### themes/ -- UI theme documentation

| Document | Covers |
|----------|--------|
| [ui-themes/dark-industrial-terminal.md](themes/ui-themes/dark-industrial-terminal.md) | Dark industrial terminal theme specification |

---

### courses/ -- (Future) Course-specific documentation

Reserved for course-specific architecture docs as courses grow in complexity. Candidates:
- Network+ hub isolation model (currently in `_planning/`)
- Python for IT (COP1034C) sandbox architecture
- Dark Arts FEH + CyberOps structure
- CyberOps terminal lab architecture

---

### products/ -- (Future) Product-level documentation

Reserved for product-level docs beyond Prime:
- Arena (card game) -- architecture, resolver engine, card schema
- Colosseum (Arena v2) -- product sandbox design

---

## What Lives Where (Boundary Guide)

Understanding which directory serves which purpose prevents future drift:

| Directory | Audience | Deployed? | Content type |
|-----------|----------|-----------|--------------|
| **`_docs/`** | Developers, AI agents | No | Internal reference, architecture, audits, feature docs |
| **`_app/docs/`** | Students, instructors | Yes | Course catalogs, lab guides, deployment instructions |
| **`_tools/`** | Developers, AI agents | No (gitignored) | Tool source code, design docs (INTRO.md, NEXUS_DESIGN.md) |
| **`_planning/`** | Developers | No | ADRs, sprint plans, strategies, roadmaps (unstructured) |
| **`CLAUDE.md`** | AI agents | No | Session rules, critical conventions, key references |

**Rule of thumb:** If it describes *how the platform works internally*, it belongs in `_docs/`.
If a *student or instructor would read it*, it belongs in `_app/docs/`.
If it's a *one-time decision or plan*, it belongs in `_planning/`.

---

## Maintenance

This directory is documentation, not code -- but stale docs are worse than no docs.

**When to update:**
- New feature shipped with a feature doc? Add it to `_docs/features/`
- Architecture changed (new rendering pattern, new hub, new component system)? Update `architecture/platform.md`
- New audit run? Update or replace the relevant `operations/` doc

**When NOT to create a new file:**
- Sprint-level planning (use `_planning/`)
- Tool-specific internals (keep in `_tools/`)
- Temporary investigation notes (use `_planning/` or discard)

---

*Reorganized 2026-04-05 from `_app/docs/` (deployed to production) to `_docs/` (internal only).
25 files moved, 5 student-facing files remain in `_app/docs/`.*
