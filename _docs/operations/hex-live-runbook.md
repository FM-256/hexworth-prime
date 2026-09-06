# Hex Live (HEXOS-6) — operations runbook

**Status: BUILT AND BOOT-VERIFIED. NOT hardware-verified.** Read the "What is not proven" section
before handing this to a student.

TLDR: a bootable Debian image whose desktop session *is* Hex OS. It exists for one reason — radio
and USB hardware a browser cannot reach — and everything else about it is deliberately thin.

---

## How it works

Four moving parts, no magic:

1. **`make.sh` ships the recipe, not the artefact.** It copies `Dockerfile` and `build.sh` to a
   build host and builds there. The host installs nothing: `live-build` and `debootstrap` live
   inside the container. bc2 serves a live cloudflared tunnel and should not acquire a permanent
   toolchain to produce a one-off file.
2. **`live-build` respins Debian.** It debootstraps trixie, installs the package list from
   `build.sh`, applies anything under `config/includes.chroot/`, and emits a hybrid ISO.
3. **The session is the shell.** `config/includes.chroot/etc/skel/.xinitrc` is baked into the image,
   so the live user's X session runs `surf -F https://hexworth.com/hex/` and nothing else. No
   desktop, no file manager, no menu. surf has no tabs and no address bar, so there is nowhere else
   to go by construction.
4. **Hybrid ISO** means the same file boots as a CD image *or* written raw to a USB stick.

```
make.sh ──scp──> build host ──docker──> live-build ──> live-image-amd64.hybrid.iso
                                            │
                                            ├── package list      (radio/USB/serial tooling)
                                            └── includes.chroot   (.xinitrc = the session)
```

## Build it

```
_tools/hexos-live/make.sh --host bc2 --out ~/hexlive
```

Takes roughly 15-25 minutes; most of it is `live-build` fetching a base system. Output is
`~/hexlive/live-image-amd64.hybrid.iso`, about 1.6GB.

The ISO is **not** in git. A build output is not source. The recipe is in git and reproducible.

## Write it to a USB stick

```
lsblk                                    # FIND THE RIGHT DEVICE FIRST
sudo dd if=live-image-amd64.hybrid.iso of=/dev/sdX bs=4M status=progress oflag=sync
```

`of=` takes the DEVICE (`/dev/sdb`), not a partition (`/dev/sdb1`). `dd` will not ask twice and
will not warn you. Run `lsblk` immediately before, and read it.

## Boot it

Boot menu appears for **5 seconds**, then auto-boots the live system. The timeout exists because a
classroom of machines waiting on a keypress is a classroom that never starts, and because PXE has
nobody standing there at all. Press a key within those 5 seconds to reach fail-safe mode.

Expect: boot menu → X → the platform, full screen, no browser chrome.

## Test it without hardware

The build host can boot the ISO in QEMU, which is how the auto-boot defect below was found:

```
qemu-system-x86_64 -accel tcg -m 4096 -smp 4 -cdrom <iso> -boot d -nic user \
  -display none -monitor unix:/tmp/qmon.sock,server,nowait -daemonize
sleep 200
echo "screendump /tmp/shot.ppm" | socat - UNIX-CONNECT:/tmp/qmon.sock
```

Use `-accel tcg` unless your user is in the `kvm` group; `-enable-kvm` fails with
"Could not access KVM kernel module: Permission denied" and that is a group membership issue, not
a broken image.

**Screendump the running VM rather than inspecting the ISO.** Inspecting the ISO showed a correct
bootloader with every expected file. Only a screenshot showed it sitting on the menu forever.

## What is not proven

**The bar for this phase is not "the image boots".** Per `_docs/architecture/hex-os-scope.md`,
HEXOS-6 is justified ONLY by hardware: monitor mode for WiFi Arsenal, USB/serial/SDR for the Signal
toolkit. So the real test is:

- a real WiFi adapter enters **monitor mode** and `airodump-ng` shows frames
- a real SDR is claimed by `rtl_test` and produces samples
- a serial device is reachable from `minicom`/`picocom`

None of that has been done, because **nobody has named the adapter or the laptop model**. Until
someone does, this is a built, boot-verified, hardware-unproven image and should be described that
way.

## Known open issue: it lands on the tourist wall

Boot-verified in QEMU, the session loads the platform and is stopped by
`AccessGuard.require('sorted')`, which redirects an unauthenticated visitor to the tourist-visa
page. So a student boots "Hex OS" and sees **WELCOME, EXPLORER**, not the shell.

That is the platform's real access model working correctly. It is still wrong for an image whose
stated identity is "the session is the shell". Options are pointing the kiosk at a surface that does
not require sorting, provisioning a kiosk identity, or accepting the wall as the first screen. That
interacts with the access model, so it is a panel decision rather than a quiet edit.

## Defects found by building and booting it

Recorded because each cost a rebuild and none were visible from reading:

| symptom | cause |
|---|---|
| `dists/noble/Release` not found | an Ubuntu release name against live-build's default **Debian** mirror |
| `firmware-linux-free` uninstallable | a Debian package name on an Ubuntu base (Ubuntu's is `linux-firmware`) |
| `chromium-browser`/`firefox` uninstallable | both are **snap stubs** on Ubuntu 24.04 and cannot install into a chroot |
| `syslinux-themes-ubuntu-oneiric` missing | live-build's ubuntu mode still references **Ubuntu 11.10** packages |
| `trixie/updates` has no Release file | Ubuntu's older live-build against a Debian target; Debian renamed it `trixie-security` |
| booted to a menu and waited forever | no bootloader timeout; found only by screendumping the running VM |

The fourth was the tell that live-build's ubuntu mode is unmaintained. Moving to Debian trixie fixed
three at once **and** gave kernel 6.12 against Ubuntu 24.04's 6.8, which is where WiFi and SDR
driver support actually lives.

## Published

Confluence: [Hex Live (HEXOS-6) — Build, Boot and Verification Runbook](https://hexworth.atlassian.net/wiki/spaces/KBA/pages/72482817), page id `72482817`, under *Platform Documentation > Hex OS — Architecture and Operations*.

Re-publish after edits:
```
python3 _tools/confluence/publish-solution.py update 72482817 _docs/operations/hex-live-runbook.md
```

## Related

- `_docs/architecture/hex-os-scope.md` — why this phase exists and what it costs
- `_tools/hexos-live/README.md` — why approach A was chosen 3-1 over B and C
- Taskboard 326 — HEXOS-6
