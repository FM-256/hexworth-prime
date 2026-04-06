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
| [Forensics Hub](features/FORENSICS_HUB.md) | ForensicsEngine.js, ForensicsData.js, cert-alignment.js | 60 modules, 5 certification alignments, courtroom-ready framework |
| [Sandbox Labs](features/SANDBOX_LABS.md) | lab-manager/server.js, docker-compose.yml, SandboxLauncher.js | Docker containers, Traefik routing, Cloudflare Tunnel, Sablier idle mgmt |
| [Multiplayer & Hive](features/MULTIPLAYER_HIVE.md) | MultiplayerManager.js, HiveManager.js, VsBridge.js | 2-player arcade, ghost replay, Hive exploration, Red Queen, CTF VS mode |
| [Digital Life](features/DIGITAL_LIFE.md) | digital-life/index.js + 30 modules | Binary firefly ecosystem, 8 phases, procedural audio, cosmic events |

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
