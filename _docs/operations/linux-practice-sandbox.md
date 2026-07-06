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
  native `--storage-opt size=` is unavailable (needs xfs+pquota). Three-part guard instead:
  (1) an `fsize` ulimit caps any *single* file at the quota; (2) `BlkioDeviceWriteBps: 12MB/s`
  (`lab.writeBpsMB`) rate-limits disk writes so a parallel multi-file burst cannot outrun the
  reaper — `fsize` alone is per-file, not per-container, so without the rate cap a student could
  `dd` many ~1GB files in parallel at full disk speed (tens of GB) inside the reaper window;
  (3) a 30s `SizeRw` reaper destroys any container whose writable layer exceeds the quota.
  Verified: 2GB single-file write denied at 1.0G; write rate measured at 12.4 MB/s (throttle
  enforced); a 1.5GB container reaped. **Real bounded ceiling:** at 12MB/s a container can write
  at most ~360MB in the 30s reaper window beyond its 1GB quota, so ~1.4GB before reap, ~54GB
  across the 40-container max — under bc1's free space. This is still a soft/reactive cap; a hard
  real-time quota needs the xfs+pquota infra change (backlog). Note: this bounds the overlay
  writable layer; `tmpfs`/`/dev/shm` writes hit the 512MB memory cgroup instead, not disk.
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
tracker's `emit` guards on context + token). `sandbox_launch` gating was re-verified during
adversarial review: server-side `logObservatoryEvent` fail-closes on the consent record
(`functions/index.js` ~3610, `hasRecord` -> 204), and `labId` only ever comes from the fixed
`LAB_INFO` whitelist, so no arbitrary/PII string reaches the pipeline.

> **FLAGGED FOR THE PI (separate pre-existing issue, discovered during this review, NOT changed
> here):** the Phase-2 behavioral gate is currently mismatched. The Cloud Function requires
> `formVersion === 'cerbi-v2-2026-07-05'` to admit `page_view`/`session_end`/`client_error`/
> `device` (`functions/index.js:3574`, `PHASE2_TYPES`), but `ObservatoryConsent.js:30` stamps new
> consent as `cerbi-v1-2026-06-21`. Commit `18562e5f3` bumped the client to v2 in lockstep with
> the CF; commit `18a90f60e` ("participant class switcher") then reverted ONLY the client back to
> v1 — an unrelated change, so likely accidental. Net effect: those four Phase-2 event types are
> silently dropped (204) for every participant. `sandbox_launch` is Phase-1 and unaffected.
> Re-bumping the client to v2 forces every participant through re-consent, so this is a PI/IRB
> call, not an engineering one — surfaced here for a decision, deliberately not auto-fixed.

## Graded challenges + Linux Practitioner badge

Five state-inspection challenges (create a file with content, an executable script, a mode-600
file, grep ERROR lines to a file, a git repo with a commit). The learner does them in `~/work`
(`hexpractice challenge` lists them, `hexpractice check` is a local preview), then clicks
"Grade my practice" on the Observatory card.

Grading is **server-side**: the check commands live in the lab-manager (`SANDBOX_CHALLENGES`),
NOT in the image, and run AS the `student` user (correct `$HOME`, file execution, git ownership)
via `GET /api/sandbox/check/:sessionId` (`sessionId` is a crypto-random `nanoid(12)` capability,
~72 bits — unguessable, so one student cannot read another's progress; same auth model as the
existing `/commission` endpoint). Exec happens via `docker exec` inside the student's OWN
container, so challenge 2's "runs and prints" check never executes student code on the host.

**Honest scope of the integrity, per adversarial review:** this is a **cosmetic honor-system
badge** (100 gamification points, no grade/credential rides on it), NOT a hardened credential.
Two known limits, both acceptable at this stakes level: (1) the check *strings* are server-side,
but a sudo student can replace the container's own `grep`/`stat`/`git` binaries, so the checks
are not absolutely tamper-proof; (2) the final award is `AchievementSystem.unlock` client-side —
the same client-trust model as every other platform badge (`achievements` is a client-writable
Firestore field), so a student could self-grant it in devtools regardless. Making the badge a
true server-issued credential (signed completion token + CF-only Firestore write) is a
platform-wide change tracked in Backlog, not done here. On `complete:true` the Observatory awards
the achievement, which appears in the profile/achievement gallery. Verified E2E: 0/5 before, 5/5 +
`complete:true` after the tasks; write-throttle enforced at 12.4 MB/s; frontend smoke (9/9) awards
the badge and clears the grader when the session ends.

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
- Disk quota (bc1): `fsize` denies a 2GB single-file write at 1.0G; `BlkioDeviceWriteBps`
  measured at 12.4 MB/s on a live container (throttle enforced); 30s `SizeRw` reaper confirmed.
- Graded practice E2E (bc1): `/api/sandbox/check/:sessionId` returns `passed=0 complete=false`
  on a fresh box, `passed=5 complete=true` after the 5 tasks, per-challenge results correct.
- Grade flow (headless smoke, 9/9): grader reveals on launch, renders 5/5, awards the badge on
  complete, and `onEnd` clears the grader when the session is destroyed/expires.

## Backlog (with owners)

Tracked in `project_arctic_linux_sandbox` (memory) and the marathon backlog:

- **Egress / inter-container policy** (owner: operator + sandbox infra) — `sandbox-net` allows
  outbound internet + ICC; a consented student could pull a miner or scan from bc1's IP, or reach
  another container. Platform-wide (all labs). Options: egress allowlist, per-container network,
  ICC off. NOT yet mitigated beyond auth + bounded lifetime + PidsLimit.
- **Hard disk quota** (owner: sandbox infra) — the current fsize+writeBps+reaper cap is
  soft/reactive; a true real-time quota needs the overlay2->xfs+pquota infra change. Platform-wide.
- **Server-issued badge integrity** (owner: frontend + functions) — the `linux_sandbox_practitioner`
  award is `AchievementSystem.unlock` client-side (platform-wide honor-system pattern; `achievements`
  is client-writable Firestore). Grading is server-verified, but the award isn't. A true credential
  needs a signed completion token from `/check` + a CF-only Firestore write. Cosmetic-only today, so
  low priority — but the "tamper-proof" framing only holds for the *check*, not the *badge*.
- **Phase-2 telemetry FORM_VERSION mismatch** (owner: PI/IRB + functions) — see the FLAGGED note in
  Usage telemetry: client stamps `cerbi-v1`, CF requires `cerbi-v2`, so Phase-2 behavioral events
  are dropped platform-wide. PI/IRB decides whether to re-bump (forces re-consent).
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
