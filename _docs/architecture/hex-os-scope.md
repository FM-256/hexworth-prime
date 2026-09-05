# Hex OS — scope

**Status: SHIPPED.** All seven phases are live. HEXOS-0 through HEXOS-5 are in production;
HEXOS-6 remains an open operator decision and is conditional by design, see its section.
Originally scoped 2026-08-30 as marathon Stream 4 background work; delivered 2026-09-02.

This document is kept as the SCOPE it was, with the outcome recorded per phase, because the
reasoning for what was deliberately excluded is still the reason those things are excluded. For
what the system does today, read the phase table below and
[`_docs/architecture/hex-os-home-directory.md`](hex-os-home-directory.md).

| Phase | State |
|---|---|
| HEXOS-0 app manifest | LIVE, 192 apps across 7 categories and 13 houses |
| HEXOS-1 `run` CLI | LIVE, 12 commands, each with a `man` page |
| HEXOS-2 launcher grid | LIVE at `/hex/apps.html` |
| HEXOS-3 dead-entry gate | LIVE, blocking in `deploy.sh` |
| HEXOS-4 home directory | LIVE at `/home.html` |
| HEXOS-5 PWA install | LIVE, Chrome reports zero installability errors |
| HEXOS-6 bootable image | OPEN, operator decision, conditional |

**What shipped after the original scope, because using it exposed them.** The operator typed
`run incubator`, which `ls` had listed, and got "no app called incubator": true and useless. That
one report produced the group-explanation path, a substring fallback for did-you-mean, the FAQ
app, the labelled `ls` listing, and then an eight-site case-sensitivity chain that took five
review rounds to close. Every round found one more site than the round before, twice inside code
that had already been declared clean. The lesson is recorded in the SITREP and is worth carrying:
a sweep that reports itself complete is not evidence that it is.

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

**SHIPPED.** `_app/data/hex-apps.json`, 192 entries. Generated, not hand-maintained.

### HEXOS-1 — `run` *(the CLI)*
Resolves a name to an entry and launches it. `run arena`, `run bug-hunting`, `run openstack-cli`,
plus `ls`, `search`, `help`. Reads the manifest **only**; no hardcoded list anywhere.

This is the forcing function. A registry nothing launches from drifts silently; a registry the CLI
depends on breaks loudly.

**Done when:** every manifest entry is launchable by name and nothing else knows the entry points.

**SHIPPED**, and it grew past the original list: 12 commands (`ls`, `search`, `info`, `run`, `cd`,
`ps`, `stop`, `restart`, `help`, `man`, `pwd`, `clear`), each with a manual page enforced by a
gate so the command list and the manual cannot drift apart. `ps`/`stop`/`restart` drive real
container sessions, which was not in the original scope and turned out to be the part students
need most when a lab freezes. Everything is case-insensitive, which took eight fixes and five
review rounds to actually be true.

### HEXOS-2 — The launcher *(icon grid)*
A second view over the same manifest. Icons, categories, search, recents.

Its real job is falsification: **if the grid needs data the manifest does not have, the manifest is
wrong.** Build it second for that reason, not for the visuals.

**SHIPPED** at `/hex/apps.html`. The falsification worked as intended: building the grid is what
forced icon and sublabel fields into the manifest.

### HEXOS-3 — Dead-entry gate
Every manifest entry must resolve: HTTP 200 *and* reachable by click from somewhere. Extends the
reachability tooling that already exists (`reachability-walk.js`,
`catalog-reachability-audit.js`).

**This subsumes taskboard #272 and #277.** Those were being triaged by hand; this makes the whole
class impossible rather than merely findable.

**SHIPPED** and blocking in `deploy.sh`. A manifest entry pointing at a missing file, or at a page
nothing links to, now fails the deploy rather than waiting to be found.

### HEXOS-4 — Home directory
Unify `ModuleProgress`, badges and transcript into one addressable per-user object. Larger, and
touches student data, so it goes behind the first three.

**SHIPPED** at `/home.html` as a READ MODEL: it renders what the server already knows and never
writes. Each fact is labelled with its authority (server-proven, derived, local), and a read
failure is displayed differently from a real zero, so an empty panel cannot be mistaken for an
honest score of nothing. Shipping it also exposed that two subcollections had no Firestore read
rule at all, which a mocked-SDK test could not have caught and a real emulator did.

### HEXOS-5 — PWA install
Installable to a Chromebook, tablet or laptop. Real icon, opens without browser chrome, works on
hardware already owned. **No flashing required.** This is where most of the "it feels like an OS"
payoff actually lands.

**SHIPPED**, manifest-only, with Chrome reporting zero installability errors. There is
DELIBERATELY no service worker: one scoped to `/hex/` would outrank the root-scoped tenant worker
that white-label containment depends on, because scope matching prefers the longest match, and a
load-time guard cannot fix it since the controller is chosen before the page's own scripts run.
Offline belongs in the root worker and is tracked separately as HEXOS-5b.

**PREMISE CORRECTED 2026-09-05.** The paragraph above was true when written and is no longer.
Commit `8eab9ece1` (2026-09-01) loaded `TenantRouter.js` and `TenantShell.js` STATICALLY on all
three `/hex/` pages, and that was live-tested by forcing a `/hex/`-scoped worker to win the scope
race against a real tenant session: containment held, the back-link still rewrote to the tenant hub.
So a `/hex/`-scoped worker no longer defeats white-label containment on these pages. The blocker
this section describes is GONE, and it stayed written down for four days in four places.

A SECOND correction, found the same day: `tenant-sw.js` is registered from exactly ten `/tenant/`
pages and nowhere else, so it controls ZERO pages for a direct Hexworth student. Any plan that
begins "put it in the root worker that already controls every page" is describing a worker that
most students do not have.

HEXOS-5b is nevertheless still OPEN and NOT built, for a reason that has nothing to do with the
blocker: offline can only cache the launcher, and `run <app>` does a top-level navigation to an
app entry page that is deliberately not cached, so an offline student gets a catalogue of 192
things and a browser error page when they open one. See the vote record in the taskboard.


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
