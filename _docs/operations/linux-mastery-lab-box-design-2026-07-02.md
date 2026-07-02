# Linux Mastery Lab Box — Design (2026-07-02)

**Status:** DESIGN + PROTOTYPE IN PROGRESS (operator directive 2026-07-02: "create a linux box so that the linux mastery course can use it... labs that are resettable and adjustable").
**Pattern source:** cell-sigma (real-container labs on bc1 sandbox infra) — see `_docs/operations/cell-sigma-final-exam-spec-2026-06-24.md`.

## TLDR

One new image on the existing bc1 sandbox stack (`hexworth/linux-mastery:latest`) + an in-box **scenario framework** (`lab` CLI) gives the 53-module Linux Mastery path real, resettable, adjustable terminal labs. Resettable two ways: `lab reset` re-seeds the active scenario in seconds; relaunching the session gives a factory-fresh box (existing lab-manager behavior). Adjustable: scenarios are parameterized (`--level N`, meta.json params), and scenario packs are plain directories — new labs are added by dropping in a folder, no image rebuild needed for content-only changes (scenarios live under one path that can also be volume-mounted).

## Current state

- Linux Mastery path: `_app/components/LearningPaths.js:1505` (`linux-mastery`, script house), 53 modules under `_app/houses/script/modules/linux-mastery/`. **Zero** currently use a real terminal engine (grep TerminalInstance/BoxEngine/sandbox = 0) — they violate [[feedback_labs_must_be_legit_engines]].
- bc1 sandbox stack: lab-manager (`/home/eq1/hexworth-sandbox/lab-manager/server.js`) with `LABS` registry → `POST /api/sandbox/launch` → per-session Docker container → ttyd terminal via traefik path routing at `sandbox.hexworth.tech`. Tiers: terminal-light (85MB), terminal-full (560MB), cell-sigma (225MB, sudo + caps).

## Design

### 1. Image: `hexworth/linux-mastery:latest`
- Base `ubuntu:24.04`. ttyd (static binary, same as other tiers). User `student` (uid 1000) with passwordless sudo (learning box — students SHOULD break things; reset is the safety net).
- systemctl shim (cell-sigma pattern — no systemd in container; shim satisfies `systemctl status/enable/start` for service-flavored labs).
- Toolset: coreutils/findutils/grep/less/man-db + vim + nano + tree + net-tools + iproute2 + cron + tar/gzip/zip + curl + openssh-client + procps + psmisc.
- Scenario framework baked at `/opt/hexlab/` (below). Terminal lands in `/home/student` with a short MOTD (`lab list` to begin).

### 2. Scenario framework (`/opt/hexlab/`)
```
/opt/hexlab/
├── bin/lab                  # the CLI (bash): list | start <id> [--level N] | reset | check | hint | status
├── scenarios/<id>/
│   ├── meta.json            # {title, module (script-lm-NN), levels, default_level, hints: [...]}
│   ├── setup.sh             # seeds state for $LEVEL (idempotent; called by start AND reset)
│   └── check.sh             # graders: inspect real state, print PASS/FAIL per objective, exit 0 only if all pass
└── state/current            # active scenario id + level (what reset re-runs)
```
- `lab start navigate --level 2` → runs setup.sh with LEVEL=2 → prints objectives.
- `lab reset` → wipes the scenario workspace (`/home/student/lab`) → re-runs the SAME setup+level. Seconds, no relaunch.
- `lab check` → real state inspection (files, perms, users, processes — never answer-matching), per-objective PASS/FAIL. **Grading is ADVISORY/formative only** — no flag token, nothing an instructor can trust yet. A student with passwordless sudo can read `check.sh`/seeded answers, acceptable for a practice box (you'd only cheat yourself). **AUTHORITATIVE grading (instructor-visible completion) MUST use the cell-sigma server-verify pattern** (lab-manager `docker exec`s the check + holds the flag server-side in `server.js`, never in the image) — a hard prerequisite before any completion is persisted, NOT deferred-and-forgotten. No `FLAG{}`/`HEX{}` token is emitted in v1, so FLAGS-FIRST (a CTF rule) does not apply; this is an instructional box, stated to avoid the ambiguity FLAGS-FIRST guards against.
- `lab hint` → next unrevealed hint from meta.json (client-side help ladder later plugs into Dr. Hex).
- **Adjustable:** levels change seed complexity inside one scenario (e.g. perms level 1 = one wrong mode; level 3 = nested ownership + setuid decoy). Instructors adjust by editing scenario dirs — content-only changes need no image rebuild if the scenarios dir is volume-mounted (compose option, default = baked for immutability).

### 3. Registry entry (lab-manager, phase 2 — NOT yet applied)
```js
'linux-mastery': {
  name: 'Linux Mastery Workbench',
  image: 'hexworth/linux-mastery:latest',
  tier: 'terminal-full',
  memory: 256 * 1024 * 1024,
  cpus: 1.0,
  port: 7681,
  noNewPrivileges: false,          // student needs sudo (cell-sigma precedent)
  capAdd: ['AUDIT_WRITE', 'SETPCAP', 'FOWNER', 'FSETID', 'KILL', 'SETFCAP'],
}
```
Editing `LABS` + restarting lab-manager touches the LIVE sandbox → do in a maintenance moment with the operator aware (restart drops active ttyd sessions).

### 4. Client wiring (phase 3)
script-lm lab modules embed the launched terminal like the existing sandbox labs (launch via `POST sandbox.hexworth.tech/api/sandbox/launch` with labId `linux-mastery`, then iframe the returned session URL). Each module page tells the student which scenario to `lab start`. Per-module deep-link (`?scenario=navigate`) can auto-start later via a ttyd init hook.

### 5. Scenario roadmap (v1 prototypes → course coverage)
- **v1 (this pass):** `navigate` (fs treasure hunt — script-lm-02/06 family) and `perms` (fix-the-permissions — script-lm permissions section), each with 2 levels + checks + hints.
- **v2:** one scenario per Linux Mastery section (~10), mapped to module ids in meta.json.
- Non-goals now: flag_registry seeding (PROD write — gated), grading-to-Firestore, Dr. Hex integration.

## Reset-scope invariant (Nancy concern, locked)
Scenarios may write ONLY: (1) inside `$WORKSPACE` (`~/lab`), (2) under `/opt/hexlab/answers`, (3) idempotent system changes (`useradd ... || true`). `lab reset` sudo-wipes `~/lab` and re-seeds — restores THIS lab's files and now explicitly TELLS the student that system-level sudo damage needs a session relaunch (not reset). Authors keep gradable state inside `~/lab`; perms-L2's out-of-workspace bits (svc-backup user) are idempotent so re-seed is safe.

## Reset/adjust semantics (the operator's ask, explicitly)
| Action | How | Time |
|---|---|---|
| Reset lab to its start state | `lab reset` in the terminal | seconds |
| Factory-reset whole box | close + relaunch session (existing flow) | ~5s |
| Adjust difficulty | `lab start <id> --level N` | instant |
| Adjust/author content | edit `scenarios/<id>/` (volume-mount mode: live; baked mode: image rebuild ~1 min) | minutes |

## Risks / open questions
- sudo box = students can destroy the container (fine — that IS the reset story) or abuse resources: mitigated by existing per-container mem/cpu caps + sablier idle reaper.
- lab-manager restart drops live sessions (phase 2 timing).
- Flag/grading integration deferred — advisory until the server-verify pattern lands (gated); no completion persisted until then.
- **Capability list (Nancy):** proposed set = cell-sigma's MINUS `NET_ADMIN` + `DAC_READ_SEARCH` — deliberate: v1/v2 do no iptables/netns work, and the student owns their own `~/lab` files. Re-derive empirically during content build; widen only if a real scenario fails.
- **PRE-EXISTING, raise to operator before phase-2 registry write:** lab-manager runs `NODE_ENV=development` → `DEV_MODE` → `verifyAuth` DISABLED (server.js:81/180, confirmed 2026-07-02). Any unauthenticated caller hitting `POST /api/sandbox/launch` can already spin a root-equivalent container (bounded only by MAX_TOTAL=40 / MAX_PER_USER=2); a second sudo box compounds it. Flip to `NODE_ENV=production` independently of this feature.
