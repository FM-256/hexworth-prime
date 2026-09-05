# Hex Live (HEXOS-6)

The last Hex OS phase: a bootable image whose session IS the shell.

## Why this exists, and the one thing that justifies it

Per `_docs/architecture/hex-os-scope.md`, HEXOS-6 is **only justified by hardware**: WiFi Arsenal
needs monitor mode, and the Signal toolkit's 112 projects need USB, serial and SDR. A browser cannot
open a radio. Everything else Hex OS does is already reachable from any browser via HEXOS-5.

So the bar for this phase is not "the image boots". It is **monitor mode produces frames, and an SDR
produces samples, on the laptop the lab actually owns.**

## Approach A, decided 3-1

Nancy, Mallory, Chris and the primary agent voted on three shapes. A won:

| | |
|---|---|
| **A (chosen)** | thin live image, kiosk session on the LIVE platform, plus hardware tooling |
| B (rejected) | A plus a bundled 1.2GB `_app` for offline reading |
| C (rejected) | hardware-only appliance, no browser session |

**B was rejected** for three independent reasons. Offline can never be complete: 196 quizzes are
server-graded (never-client-grade is a platform rule), 812 labs need a remote container, 150 arena
boxes are remote sessions, so bundling buys static READING and nothing a student is graded on. It
would ship pages that render then silently fail to submit, which needs its own honesty layer across
the whole manifest, a second project. And a naive `cp -r _app` re-opens what deploy gate 3.6 closes:
answer-key content lives INSIDE `_app` and is kept off the wire only by `firebase.json`'s hosting
ignore, which is a property of one tool, not of the filesystem.

**B is also self-defeating under PXE**, which is the operator's stated next step: PXE's own
precondition is a working network, so the one deployment mode this is heading for is the mode where
offline content has least reason to exist.

**C was rejected** because the scope doc specifies "a respin whose session is the shell". Dropping
the session drops the identity the phase was scoped around, and it gets worse under PXE: booting a
room into a generic desktop with radio tools attached is not Hex OS.

## Thin is the whole design constraint

The scope doc prices this honestly: "the build is one week; the commitment is years of kernel CVEs,
driver regressions on the one laptop model that matters, and re-imaging a lab. Survivable if the
image stays thin. **Fatal if it accumulates.**"

Every package here has to earn its place against that sentence.

## Built in a container, deliberately

The build runs inside Docker rather than on a host. bc2 runs a live cloudflared tunnel, and
installing `live-build` and `debootstrap` onto it to produce an artefact would be a permanent host
change for a one-off. A container also makes the recipe the source of truth rather than the state of
somebody's machine.

## OPEN, and it gates the phase

**Nobody has named the WiFi/SDR adapter model.** The curriculum mentions `rtl-sdr`, `ubertooth` and
`rtl8720` only in passing. Whether the real adapters have mainline Ubuntu LTS drivers, or need
out-of-tree/DKMS modules, decides whether this image stays thin or becomes the accumulation the
scope doc calls fatal. Until that is answered this ships with mainline drivers only.
