# Linux Practice Sandbox

A real, disposable Ubuntu machine students launch from the Observatory to practice
Linux hands-on. Unlike the graded course labs, this is a free-play playground: full
`sudo`, break anything, relaunch for a clean box. Built 2026-07-06.

## TLDR

- **Image:** `hexworth/linux-sandbox:latest` on bc1 (Ubuntu 24.04 + ttyd, `student` with
  passwordless sudo, systemctl shim, `hexpractice` guide, starter `~/playground`).
- **Runs on:** the existing bc1 lab-manager infra (`sandbox.hexworth.tech`), a new
  `linux-sandbox` entry in the `LABS` registry. No new server, no new tunnel.
- **Launched from:** a prominent showcase card on the Observatory landing
  (`_app/houses/observatory/index.html`) via the existing `SandboxLauncher.js`.
- **Auth:** Firebase ID token required (lab-manager `NODE_ENV=production`). Bounded:
  2 containers/user, 40 total, 15 min idle / 120 min max lifetime.

## Why reuse, not rebuild

The bc1 sandbox stack already runs everything needed: Traefik v3.7.6, Sablier (idle
reaper), Cloudflare Tunnel, and a Node lab-manager that creates/destroys per-session
Docker containers and validates Firebase tokens. The "Arctic Terminal" (`arctic` labId)
already proves a free Ubuntu terminal works through this path. This feature is a new
image + registry entry + an Observatory card — it adds no infrastructure.

## Architecture / launch flow

```
Observatory card (Launch)  ->  SandboxLauncher.launch('linux-sandbox')
  -> POST https://sandbox.hexworth.tech/api/sandbox/launch  (Bearer Firebase ID token)
  -> lab-manager verifies token, creates hexworth/linux-sandbox container,
     wires a per-session Traefik route /s/{sessionId}
  -> returns { sessionId, url }  ->  ttyd embedded in an iframe on the Observatory
  -> DELETE /destroy/{sessionId} (or 15min idle / 120min max) tears it down
```

## Files

| File | Role |
|---|---|
| `_tools/sandbox-images/linux-sandbox/Dockerfile` | The practice image (tracked; `git add -f`). |
| `_tools/sandbox-images/linux-sandbox/hexpractice` | Guided-practice menu command inside the box. |
| `_tools/sandbox-images/linux-sandbox/systemctl-shim` | Service start/stop/status shim (no systemd in a container). |
| `_app/components/SandboxLauncher.js` | `LAB_INFO['linux-sandbox']` entry (rest pre-existing). |
| `_app/houses/observatory/index.html` | Showcase card + CSS + `renderButton` mount. |
| `_tools/observatory/sandbox-card-smoke.js` | Headless smoke: card renders, mounts, launches. |
| bc1 `/home/eq1/hexworth-sandbox/lab-manager/server.js` | `LABS['linux-sandbox']` registry entry (off-repo). |

## Build / update the image

```
# From the repo (edit sources under _tools/sandbox-images/linux-sandbox/), then:
scp _tools/sandbox-images/linux-sandbox/{Dockerfile,hexpractice,systemctl-shim} \
    bc1:/home/eq1/hexworth-sandbox/images/linux-sandbox/
ssh bc1 'cd /home/eq1/hexworth-sandbox/images/linux-sandbox && docker build -t hexworth/linux-sandbox:latest .'
# New sessions use the new image immediately; running sessions keep the old one until reaped.
```

## Registry / lab-manager

The `linux-sandbox` entry mirrors `linux-mastery`'s security posture (learning box:
passwordless sudo, so `noNewPrivileges:false`; `CapDrop:ALL` then a minimal `CapAdd`).
`server.js` is BAKED into the lab-manager image, so registry edits need a rebuild:

```
ssh bc1 'cd /home/eq1/hexworth-sandbox && docker compose up -d --build lab-manager'
# Drops active ttyd sessions — do it at low usage. Backup: server.js.bak-<date>-linux-sandbox.
```

## Security posture + limits

- **Auth enforced:** unauth `POST /launch` -> 401; only Firebase-authenticated users launch.
- **Isolation:** per-session container, `CapDrop:ALL` + minimal caps (learning box: passwordless
  sudo, so `noNewPrivileges:false`), Memory + NanoCpus caps, disposable (relaunch = clean).
- **Fork-bomb guard:** `PidsLimit: 512` on this lab (added after adversarial review 2026-07-06).
  Verified: cgroup `pids.max=512`, a 700-fork attempt is denied at the cap, the container stays
  responsive, and the shared bc1 host (incl. the live `cell-sigma` exam) is unaffected. This is a
  per-lab field (`lab.pidsLimit`, default 0/unlimited) so existing labs are unchanged.
- **Disk quota:** `lab.diskQuotaMB: 1024` (~1GB writable). bc1 is overlay2-on-ext4, so Docker's
  native `--storage-opt size=` is unavailable (needs xfs+pquota). Two-part guard instead: an
  `fsize` ulimit caps any single file at the quota, and a 90s `SizeRw` reaper destroys a container
  whose writable layer exceeds it. Verified: a 2GB single-file write is denied at 1.0G; a 1.5GB
  multi-file container is reaped within 90s. This is a soft/reactive cap (not a hard real-time
  quota); a hard quota needs the xfs+pquota infra change (backlog). 40 x 1GB = 40GB worst case,
  well under bc1's free space.
- **Bounded:** 2/user, 40 total, 15 min idle (Sablier keys off request traffic, so a closed tab
  reaps regardless of background processes), 120 min hard max lifetime.
- **Network:** `sandbox-net` bridge with outbound internet and ICC enabled (containers can reach
  each other and infra service ports on the bridge). This is the pre-existing posture shared by
  ALL sandbox labs (linux-mastery, cell-sigma), not specific to this one. Inter-container/egress
  hardening is a platform-wide item — see Backlog (owner assigned there, not left implicit).

## Consent / IRB scope

The Observatory landing is an IRB-consented research surface, so a note on scope: this practice
sandbox is an **educational tool**, in the same category as the existing course lab boxes
(`linux-mastery`, `cell-sigma`) that students already launch — real root shells — without any
additional research consent. It collects no new research data; the IRB consent governs data
collection (Observatory activity telemetry), which is unchanged by this feature. The PI (operator)
directed its prominent placement on the Observatory.

RECORDED FOR THE PI: if the PI/IRB judges that offering interactive root compute should be
disclosed in the consent text itself, bump `ObservatoryConsent.FORM_VERSION` (currently
`cerbi-v1-2026-06-21`) and amend `CONSENT_SECTIONS.Procedures` — the re-consent path then forces
every participant through the updated text on next entry. This is a PI/IRB decision, not an
engineering one; it is flagged here so the judgment is on the record either way.

## Usage telemetry

Each launch emits a `sandbox_launch` Observatory activity event (labId) through the existing
consented pipeline: `ObservatoryTracker.logSandbox()` -> `logObservatoryEvent` CF -> the
`observatory_activity` collection the admin dashboard reads. It is a Phase-1 event (in `ALLOWED`,
not `PHASE2_TYPES`), so it is admitted on any consent record, same category as `course_click` —
no re-consent needed. Wiring: `SandboxLauncher.renderButton`'s `onLaunch` hook -> the Observatory
card -> `ObservatoryTracker.logSandbox(labId)`. Withdrawn/pre-consent users emit nothing (the
tracker's `emit` guards on context + token).

## Graded challenges + Linux Practitioner badge

Five state-inspection challenges (create a file with content, an executable script, a mode-600
file, grep ERROR lines to a file, a git repo with a commit). The learner does them in `~/work`
(`hexpractice challenge` lists them, `hexpractice check` is a local preview), then clicks
"Grade my practice" on the Observatory card.

Grading is **server-authoritative**: the check commands live in the lab-manager
(`SANDBOX_CHALLENGES`), NOT in the image — a student has sudo and could edit an in-container
grader, so the logic stays server-side and runs AS the `student` user (correct `$HOME`, file
execution, git ownership) via `GET /api/sandbox/check/:sessionId`. On `complete:true` the
Observatory awards the `linux_sandbox_practitioner` achievement (`AchievementSystem.unlock`),
which appears in the student's profile/achievement gallery. Verified E2E: 0/5 before, 5/5 +
`complete:true` after the tasks; frontend smoke awards the badge on complete.

To edit challenges, change `SANDBOX_CHALLENGES['linux-sandbox']` in the lab-manager AND the
image's `hexpractice challenge`/`do_check` list in lockstep, then rebuild both.

## Verification (2026-07-06)

- Image smoke (bc1): ttyd HTTP 200, `student` + `sudo` -> root, full toolset present,
  `hexpractice` + `~/playground` present.
- Registry E2E (bc1): unauth launch -> 401; authed launch (real anon Firebase token) ->
  live `hexworth/linux-sandbox` container, session URL HTTP 200; destroy route confirmed.
- Frontend headless smoke (`sandbox-card-smoke.js`): panel renders, launcher mounts,
  Launch calls the API + embeds the iframe, zero page errors.
- Fork-bomb guard: `PidsLimit=512` confirmed on a live container (see Security posture).

## Backlog (with owners)

Tracked in `project_arctic_linux_sandbox` (memory) and the marathon backlog:

- **Egress / inter-container policy** (owner: operator + sandbox infra) — `sandbox-net` allows
  outbound internet + ICC; a consented student could pull a miner or scan from bc1's IP, or reach
  another container. Platform-wide (all labs). Options: egress allowlist, per-container network,
  ICC off. NOT yet mitigated beyond auth + bounded lifetime + PidsLimit.
- **Hard disk quota** (owner: sandbox infra) — the current fsize+reaper cap is soft/reactive; a
  true real-time quota needs the overlay2->xfs+pquota infra change. Platform-wide.
- **iframe `sandbox` attribute** (owner: frontend) — `SandboxLauncher.js` iframe has no
  `sandbox=` attr, so no block on top-level navigation. Shared by all 9 lab widgets; fast-follow
  a `sandbox="allow-scripts allow-same-origin allow-forms"` (no `allow-top-navigation`) after
  regression-testing ttyd + code-server labs.
- **Graded-vs-free-play capacity** (owner: sandbox infra) — the 40-total pool is shared with the
  graded `cell-sigma` final exam; add a reserved allotment / priority so recreational usage cannot
  starve a live exam.
- Native SSH access (browser xterm.js + Cloudflare Tunnel) per `_planning/SSH_SANDBOX_SCOPE.md`.
- Curated practice tracks / more graded challenges beyond the first five.

Related: `_docs/operations/linux-mastery-lab-box-design-2026-07-02.md`,
`_planning/SSH_SANDBOX_SCOPE.md`, `reference_sandbox_infrastructure` (memory).
