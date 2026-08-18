# Power-loss recovery — 2026-08-18

**Outcome:** all five servers up and now able to survive a reboot unattended.
Two real defects found, both of which would have kept a machine down indefinitely.

> Node addresses, MACs and SSH details are NOT in this file. This repo is PUBLIC.
> They live in `~/hexworth-infra-private/compute-nodes-inventory.md`.

## What happened

Mains power was lost and everything rebooted. A **second** power event occurred while
diagnosing — bc1 went from 28 days of uptime to 3 minutes mid-session — so this was an ongoing
condition, not a single past event. A UPS is the real fix and is not currently affordable; the
mitigations below are the free half of that problem.

## Final state

| Server | Came back by itself | Notes |
|---|---|---|
| bc1 | yes | 5 core containers restarted (`unless-stopped`) |
| bc2 | host yes, **service no** | the OpenStack VM had `autostart: disable` |
| bc4 | yes | needed a few minutes to re-establish its tailnet path |
| hexclass | yes | `tailscaled` and `ollama` both active |
| neon-server | **no** | booted into a panicking kernel every time — see below |

## Defect 1 — the OpenStack VM did not auto-start

`bc2` rebooted cleanly and every systemd unit came back: `openstack-bridge`,
`openstack-api-bridge`, `libvirtd`, `docker`, and the socat forwarder (which is a real unit with
`Restart=always`, not a stray process). But the DevStack VM itself was `shut off`, because
libvirt autostart was **disabled**.

So the entire OpenStack estate stayed down while every health check on the host reported green.
Fixed with `virsh autostart`, now `enable`.

**The general lesson:** service-level restart policy was already correct everywhere. The gap was
one layer lower — the *virtual machine* those services depend on. An audit of "do services
restart?" would have passed while the platform stayed dead.

## Defect 2 — neon-server booted into a kernel that cannot boot

```
Error! Bad return status for module build on kernel: 7.0.0-28-generic
dkms autoinstall on 7.0.0-28-generic/x86_64 failed for nvidia(10)
dpkg: error processing package linux-image-7.0.0-28-generic (--configure)
```

The NVIDIA DKMS module could not build against kernel `7.0.0-28`. That failed the package
postinst, so `update-initramfs` never ran, so **the kernel had no initramfs at all**. It loads,
cannot mount root, panics.

Then `GRUB_DEFAULT=0` — boot the first entry, which is always the newest kernel. Every reboot
went straight into the panic. **neon was never going to come back from a power cut**, no matter
how many times it tried. Four packages had been half-configured since 2026-08-13.

Not disk space (`/boot` is on `/` with 6 TB free), not the drive, not the OS.

### Fix

1. Pin GRUB to the known-good kernel by **explicit menuentry id**, not by index — an index moves
   when kernels are added or removed.
2. Remove the broken kernel and its headers. This also removes the three `-hwe-24.04`
   metapackages, so the box no longer auto-tracks new HWE kernels.
3. Re-verify the GRUB pin **after** the removal: removing a kernel triggers `update-grub` and
   regenerates `grub.cfg`.

Result: zero half-configured packages, two working kernels, GPU unaffected (driver 570.211.01,
3× Quadro P400), DKMS clean.

### The tradeoff, stated plainly

No automatic HWE kernel updates until the metapackage is reinstalled. That is currently
protective: the GPU is **Pascal**, and NVIDIA has dropped Pascal from the 595 and 610 branches —
they are not even offered for this card. The ceiling is 580; the box runs 570. A newer kernel
would break the GPU again.

Reverse it with `sudo apt install linux-generic-hwe-24.04` once a Pascal-capable driver supports
kernel 7.0.

## Restart posture, audited

- **bc1 docker:** core services `unless-stopped` ✓. Sandboxes are `no`, which is correct — they
  are ephemeral and must not resurrect after a reboot.
- **bc2 systemd:** all relevant units `enabled` ✓.
- **bc2 libvirt:** was the one gap. Fixed.
- **neon:** boot target was the gap. Fixed.

## ⚠ Diagnostic lesson, recorded because it cost real time and nearly caused harm

Three machines were reported "powered off" on the basis of a single `ping` from one host. **Two
of them were up the entire time.** bc4 simply had not finished re-establishing its tailnet path;
hexclass needed its own SSH alias, which was already in the operator's config.

Earlier the same day, bc2 was declared "wedged, needs a power cycle" because every TCP port hung
over the tailnet — while its LAN address answered SSH instantly and the host had 28 days uptime.

> **When one network path fails and another succeeds to the same host, the host is not the
> problem.** Check a second path before declaring a machine down, and never recommend a power
> cycle on single-path evidence — the machine may be serving live sessions.

## Still open

- **A monitor that checks SERVICES, not just hosts.** Every host-level check passed while
  OpenStack was down. The deadman watches machines; nothing watched "can a student get a token".
- **BIOS "Restore on AC Power Loss" → Power On** on any machine that did not self-recover. Free,
  needs one reboot each to set.
- **UPS** when affordable. With the above in place it buys clean shutdowns and rides out brief
  dips, rather than being the only thing standing between a power blip and a manual recovery.
- 205 packages pending upgrade on neon — unrelated backlog, not urgent.
