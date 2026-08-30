# Hex OS — scope

**Status:** scoped, not started. Marathon **Stream 4 (background)**: worked in downtime once a
stream's main unit is done, per operator direction 2026-08-30.

---

## TLDR

Hexworth already has applications, documents, processes, a scheduler, permissions and per-user
state. What it lacks is a **single authoritative list of what can be launched, and a single way to
launch it**. Every surface hand-wires its own launching, which is why things silently become
unreachable.

Hex OS is that list plus that launch path. The icon grid and the `run` command are two views over
one manifest. The desktop metaphor is the presentation; the manifest is the product.

---

## The evidence this is a real problem

Not theoretical. All of this is already true today:

| Symptom | Where |
|---|---|
| Five Vault cards rendered `cursor: pointer` and did nothing. `<div href>` with no handler, so Bug Hunting and EHE were dead too | `_app/dark-arts/vault/index.html`, fixed 2026-08-30 |
| A final exam students cannot reach from its own hub | taskboard **#272** |
| 551 catalog entries with no inbound href | taskboard **#277** |
| 13 careers pages describing careers and linking to no course that teaches them | fixed 2026-08-29 |
| Three separate career vocabularies that had drifted apart | `CareerPaths.js`, `CareerExplorerEngine.js`, `career-paths.html` |
| A house with 50 content files that nothing which reads links can see | House of the Key |
| 668 scripts nothing calls | `_tools/CATALOG.md` |

Every one is the same failure: **something exists, and nothing authoritative knows it exists.**

---

## What already maps to OS concepts

The parts exist. They are not addressable as one system.

| OS concept | Today | Gap |
|---|---|---|
| Applications | `HubRegistry` | not authoritative, not what anything launches from |
| Documents | `ContentCatalog` | separate vocabulary from HubRegistry |
| Processes + scheduler | lab-manager, 80-slot OpenStack pool, sticky uid binding, free-play caps | genuinely real; BUG-233 was a scheduler race |
| Permissions | `AccessGuard`, tenancy | fine |
| Home directory | `ModuleProgress`, badges, transcript | scattered across three stores |
| Launcher | **nothing** | this is the missing piece |

`run openstack-cli` is not a metaphor. That already forks a container against a real scheduler
with real quotas.

---

## Phases

Sized for downtime work. Each is independently shippable and useful alone.

### HEXOS-0 — The app manifest  *(foundation, everything reads it)*
One record per launchable thing: `id`, `name`, `house`, `entry`, `verb`, `permission`, `icon`,
`category`, `status`. Back-filled from `HubRegistry` + `ContentCatalog` + the Vault tracks.

Generated, with a `--check` drift gate wired into post-verify. This exact pattern is already
proven on the platform by `gen-house-tracks.js` and `audit-card-salaries.js`, both of which block
a deploy when their artefact stops matching its source.

**Done when:** every launchable thing on the platform appears exactly once, and the gate fails if
one moves.

### HEXOS-1 — `run` *(the CLI)*
Resolves a name to an entry and launches it. `run arena`, `run bug-hunting`, `run openstack-cli`,
plus `ls`, `search`, `help`. Reads the manifest **only**; no hardcoded list anywhere.

This is the forcing function. A registry nothing launches from drifts silently; a registry the CLI
depends on breaks loudly.

**Done when:** every manifest entry is launchable by name and nothing else knows the entry points.

### HEXOS-2 — The launcher *(icon grid)*
A second view over the same manifest. Icons, categories, search, recents.

Its real job is falsification: **if the grid needs data the manifest does not have, the manifest is
wrong.** Build it second for that reason, not for the visuals.

### HEXOS-3 — Dead-entry gate
Every manifest entry must resolve: HTTP 200 *and* reachable by click from somewhere. Extends the
reachability tooling that already exists (`reachability-walk.js`,
`catalog-reachability-audit.js`).

**This subsumes taskboard #272 and #277.** Those are being triaged by hand today; this makes the
whole class impossible rather than merely findable.

### HEXOS-4 — Home directory
Unify `ModuleProgress`, badges and transcript into one addressable per-user object. Larger, and
touches student data, so it goes behind the first three.

### HEXOS-5 — PWA install
Installable to a Chromebook, tablet or laptop. Real icon, opens without browser chrome, works on
hardware already owned. **No flashing required.** This is where most of the "it feels like an OS"
payoff actually lands.

### HEXOS-6 — Hex Live (bootable image)  *(LAST, and conditional)*
Debian or Ubuntu respin whose session is the shell, lab tooling preinstalled, flashable to a USB
stick or laptop.

**Only justified by hardware.** WiFi Arsenal needs monitor mode; the Signal toolkit's 112 projects
need USB, serial and SDR. A browser cannot reach a radio, and no amount of shell polish changes
that. If HEXOS-6 happens, that is the reason, not the aesthetics.

**Stated cost:** a distro is a product with a security-update obligation. The build is one week;
the commitment is years of kernel CVEs, driver regressions on the one laptop model that matters,
and re-imaging a lab. Survivable if the image stays thin. Fatal if it accumulates.

---

## Explicitly not doing

- **Chromebook and tablet flashing.** Chromebooks need write-protect defeated per model and it
  resets every hardware refresh. Android tablets effectively cannot take a custom OS. A Chromebook
  in kiosk mode pointed at HEXOS-5 gets ~90% of the outcome for a fraction of the work.
- **Chrome before manifest.** A dock and a boot animation built before HEXOS-0 would leave the
  dead-card class of bug intact underneath, with a nicer login screen on top. If the first visible
  artefact is a window manager, the project has gone wrong.

---

## How it runs in marathon

Background stream. Picked up when a main unit is done, dropped when a main unit arrives. Each
phase still goes **Nancy, then Chris, then documented** before "done", and deploys still need
explicit operator go. Discoveries go to the backlog rather than being chased mid-phase.

Order is deliberate: **0, 1, 3, 2, 5**, then 4, then 6 only if the hardware labs demand it.
HEXOS-3 comes before the icon grid because a launcher over unverified entries is a prettier
version of the current problem.
