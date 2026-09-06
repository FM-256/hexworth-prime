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

**The bar SPLITS, and only half of it was ever unspecified.** Measured across the course content:
`ch340` appears 7 times, `rtl-sdr` 3, `ubertooth one` 2, `proxmark` and `bus pirate` once each —
**and no WiFi adapter anywhere.** Meanwhile WiFi Arsenal has 11 modules carrying **67 references to
`wlan0mon`** and 8 to `airmon-ng start`: content that teaches real commands students currently have
nowhere to run. So the justification is real and the specification simply never existed.

| half of the bar | hardware | driver | status |
|---|---|---|---|
| SDR + serial + USB | RTL-SDR (V3), any CH340 cable, ubertooth, bus pirate | **all mainline** | testable now, ~US$40 total |
| WiFi monitor mode | never specified by the curriculum | depends entirely on the chipset picked | needs a decision, below |

**For monitor mode, buy the MediaTek, not the Realtek.** The common recommendation is the Alfa
AWUS036ACH (RTL8812AU), which needs an out-of-tree DKMS module — the accumulation the scope doc
calls fatal, rebuilt against every kernel bump forever. The **AWUS036ACM (MediaTek MT7612U)** uses
the mainline `mt76` driver and needs only a firmware blob. Same money, same capability, no
maintenance tail. An `ath9k_htc` adapter is the cheaper mainline fallback.

**Firmware was the real showstopper, and it was not the adapter.** This image shipped
`firmware-linux-free` ONLY, so the right adapter would still have come up dead — including the
laptop's own internal card. `--archive-areas` already enabled `non-free-firmware`; only the
packages were missing. Fixed in `build.sh`: `firmware-misc-nonfree`, `firmware-realtek`,
`firmware-atheros`, `firmware-iwlwifi`. **The image must be rebuilt before any hardware test is
meaningful** — a test against the old ISO measures the missing firmware, not the adapter.
