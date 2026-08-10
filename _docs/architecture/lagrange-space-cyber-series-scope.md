# Lagrange: space cyber as a series (build, attack, defend)

**Status:** SCOPED, NOTHING BUILT. Two architectural decisions are open and both are the operator's.
**Raised:** 2026-08-09, by the operator, immediately after the fifteen-mission Cold Horizon box shipped.
**Lives here, not in hexworth-shared**, because hexworth-shared is Syncthing and not version controlled.
The world-design docx stays there; the engineering scope belongs in git so it survives a disk.

---

## TLDR

The operator wants Lagrange to become a series rather than one box: stand satellites up,
penetration test them, defend them. My assessment is that this is doable, that it is the most
defensible thing on the platform because almost nobody teaches it, and that it is materially
less speculative than it feels. The domain has real standards, a real threat matrix, real
incidents and real open-source flight software to attack.

The hard part is not the terminal. It is choosing what the student attacks.

---

## Why this is less "wild west" than it looks

The operator called the domain theoretical, edge case, unexplored, "comparable to the wild
west". That is the correct instinct about the FIELD and the wrong conclusion about the
MATERIAL. There is a body of real, citable work to anchor to:

| Anchor | What it gives us |
|---|---|
| **MITRE SPARTA** | The ATT&CK-equivalent matrix for spacecraft. Real, maintained, space-specific TTPs. This is the big one. |
| **NIST IR 8270** | Cybersecurity principles for commercial satellite operations. |
| **CCSDS** | The actual space data link and SDLS protocol standards. |
| **Space Policy Directive-5** | Policy framing for cybersecurity in space systems. |
| **DEF CON Hack-A-Sat** | Ran satellite CTFs for years and open-sourced the challenges. Proof the FORM works, and a grounded source of material. |
| **Viasat KA-SAT, 2022** | A real, well documented ground-segment compromise to teach from. GPS spoofing is another. |

SPARTA matters twice over: it is the credibility anchor for the content, AND it is exactly the
"external, machine-validatable" identifier the skill-anchoring work
(`user-transcript-and-skill-anchoring.md`) wants on the WHAT axis. A Lagrange mission that
cites a SPARTA technique id is anchored the same way an ATT&CK-tagged lab is.

### The provenance ledger already solves the credibility problem

Most attempts at space-cyber training die the same way: they invent the systems and a
knowledgeable student can smell it. Lagrange already carries the mechanism that prevents this.
The MVP scope requires every system to be tagged **REAL / EXTRAPOLATED / INVENTED**, with a
citation owed on REAL. That discipline is what makes teaching an under-specified domain honest
instead of fictional. Keep it as a hard requirement for every mission in the series.

---

## What already exists (do not rebuild any of it)

Measured 2026-08-09.

**Terminals: there are SEVEN.** The operator's ask was "Lagrange needs a terminal". It does not
need a new one.

| Component | Lines | What it is |
|---|---|---|
| `components/LinuxTerminal.js` | 4,073 | Full simulator: virtual filesystem, 60+ commands, pipes, redirection |
| `components/SecurityTerminal.js` | 1,178 | **Extends LinuxTerminal** with nmap, tcpdump, dig, traceroute, whois, arp, route |
| `components/PSTerminal.js` | | PowerShell |
| `components/SQLTerminal.js` | | SQL |
| `components/BlacksiteTerminal.js`, `CLHTerminal.js` | | Course-specific |
| `arena/engine/C2Terminal.js` | | Command and control, arena side |
| `components/PythonSandbox.js` | | Python execution |

`SecurityTerminal extends LinuxTerminal` is the platform's own established extension pattern.
A Lagrange terminal should follow it rather than starting an eighth engine.

**Real containers already exist.** `components/SandboxLauncher.js` launches and tears down
Docker-based lab sandboxes on bc1. So the platform already has BOTH a mature simulator and real
container infrastructure. See `reference_sandbox_infrastructure` and the Linux Practice Sandbox.

**The box substrate exists.** `arena/engine/LagrangeEngine.js`, fifteen missions across five
acts, a trust-ledger mechanic, a working server-side flag credit path, and a 3D sortie
(`houses/cloud/games/cloud-cold-horizon.html`).

---

## THE decision that blocks everything: what does the student attack?

A penetration test needs a target that behaves like a ground segment when you attack it. This
choice drives the terminal, the infrastructure, the mission format and the credential value.

### Option A, simulated target

Extend `SecurityTerminal` with space-domain commands and script the responses.

- Cheap, safe, client-side, no infrastructure, no per-student cost.
- Can teach the CONCEPTS: link budgets, replay, spoofing, command authentication, SDLS.
- Ceiling: it can only ever reflect what we scripted. A student cannot honestly claim to have
  attacked real flight software, so it is weak as a credential.

### Option B, real software in containers

Run genuine open-source space software on bc1 and attack it for real.

| Software | Role |
|---|---|
| **NASA cFS** (core Flight System) | Actual flight software, open source, runs on Linux |
| **Yamcs** | Open-source mission control |
| **OpenC3 COSMOS** | Ground segment command and telemetry |
| **gr-satellites** (GNU Radio) | Real signal decoding |

- Teaches real tooling. "I attacked cFS and defended a Yamcs ground segment" is a resume line.
- Matches the operator's standing rules: *labs must be legit engines*, *boot the REAL engine,
  do not execute*.
- Cost: every mission needs a working target environment, and the infrastructure is real.

**My recommendation, on the record:** Option B, but prove it once before committing to a series
shape. Build ONE mission end to end on real cFS in a container. If it works, the rest of the
series is a wiring exercise. If the infrastructure fights us, we learn that on mission one
rather than on mission nine. The failure mode to avoid is the one this box already hit once:
fifteen missions built against an assumption nobody tested.

---

## The series is three products, not one

"Set up satellites, pen test them, defend them" is a curriculum, and naming the three tracks
separately is what stops it collapsing into another undifferentiated pile of missions.

1. **BUILD.** Stand up a bus, a ground segment, a link. Teaches the architecture, and it is the
   prerequisite that makes the other two mean anything.
2. **RED.** Attack it. Anchored to SPARTA technique ids.
3. **BLUE.** Defend and detect. The natural home for the trust-ledger mechanic Cold Horizon
   already teaches: corroboration is not consensus.

Cold Horizon as it stands is a fourth thing, an INVESTIGATION track, and it should stay that.
It is the evidence-reasoning entry point to the world.

---

## Open decisions, all the operator's

1. **Simulated or real target?** Everything else depends on this. My recommendation is real,
   proven by a single-mission cFS proof of concept first.
2. **Terminal first, or the cFS proof of concept first?** If the target is real, the terminal is
   nearly free and should follow. If simulated, the terminal is the product and comes first.
3. **Does the 3D sortie get more missions?** Still open from earlier the same day. Real 3D work
   per mission, and a different discipline from the desk box.
4. **Sequencing against everything else.** This is a large new front opened while Lodestar's
   facets are built but not yet consumed, USAJobs is unstarted, and the sortie is undecided.
   Not an argument against starting, but it should be started deliberately.

---

## Lessons from Cold Horizon that this series must not repeat

Recorded here because the series will be built by whoever reads this, possibly not me.

- **A harness that loads a URL directly proves nothing about reachability.** 121 checks were
  green while all fourteen mission cards opened the same mission.
- **Stale copy that contradicts the content beside it is worse than no copy.** The Mission Board
  said "Acts II-V are not yet built" while listing all fifteen.
- **One name for three things routes people to the wrong artifact.** "Cold Horizon" was the box
  operation, mission 14, and the game.
- **An axis a source does not define is silently skipped by the engine**, so a half-migrated
  mission declares a check that measures nothing and looks fine.
- **Correlated axes are one axis.** Three provenance labels that always move together are a
  single check asked three times, and the student learns one transferable trick.

---

## Related

- `_docs/architecture/user-transcript-and-skill-anchoring.md` (SPARTA ids on the WHAT axis)
- `~/hexworth-shared/workbench/new box design/Lagrange-edge-box/` (world design, MVP scope; Syncthing, not git)
- `_app/arena/boxes/le-01-cold-horizon/` (the shipped box)
- `_tools/qa/cold-horizon/` (missions-test.js, playthrough.js, derive-flag-values.js)
