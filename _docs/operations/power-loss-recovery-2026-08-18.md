# Power-loss recovery — 2026-08-18

**Outcome:** all five servers up, all services verified responding, and the estate can now
survive a reboot unattended.

**FOUR defects found.** Two would have kept a machine down indefinitely (1 and 2). Two were
still down *after* every host reported healthy (3 and 4) — which is the point of this document:
"all servers are up" and "all services are up" are different claims, and only the second one
matters to a student.

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

---

# Service-level sweep (same day, after the hosts were up)

"All five servers are up" was true and **not the same as "all services are up."** A sweep found
three things still down after every host reported healthy.

## Defect 3 — nginx lost a boot race for port 80, and PXE was down

`nginx.service` was `failed` on neon:

```
nginx: [emerg] bind() to 0.0.0.0:80 failed (98: Address already in use)
```

The config was valid. **apache2 had taken port 80 first.** Whichever service wins that race at
boot keeps the port; before the reboot nginx happened to win, after it apache2 did.

It matters because of what each serves:

| | sites-enabled | serving |
|---|---|---|
| nginx | `default`, **`pxe`** | the PXE boot server |
| apache2 | `000-default.conf` | the stock "Apache2 Ubuntu Default Page" |

So PXE boot had been down since the reboot while the machine served a placeholder page. apache2
is now `disable`d and nginx holds :80, so the race cannot recur.

## Defect 4 — the CIFS share was failed on three hosts

`mnt-neon-shared.mount` was `failed` on bc1, bc2 and bc4 — collateral from neon being down.
Remounted on all three; the mounts do not retry on their own once they have failed.

## Method note: "failed units" is not a service check

`systemctl --state=failed` only catches what systemd noticed AND flagged. It will not catch a
service that is stopped, disabled, or running-but-not-answering. Two checks that did work:

1. **Containers stopped and staying stopped** (excluding ephemeral sandboxes). Only 4–7 week old
   debris on bc1; nothing from the power loss.
2. **Probing each service for a real response**, not a process state. Every container with a
   published port was hit over HTTP; the internal-only ones were probed from inside their own
   network namespace.

Reading the results needs care — several healthy services do not return 200:

| Service | Response | Meaning |
|---|---|---|
| prometheus, grafana | 302 | redirect to `/graph` and `/login` — normal |
| loki | 404 on `/` | loki has no root route — normal |
| mysql | `Access denied ... using password: NO` | **healthy** — it accepted the connection and rejected a credential-less ping. Connection refused would be the failure. |
| postgres | `accepting connections` | healthy |
| redis | `PONG` | healthy |

An "error" that proves the service is alive is not an outage. Treating that mysql line as a
failure would have sent someone debugging a working database.

## ⚠ Structural finding — the monitor shares a power domain with the monitored

prometheus, alertmanager, grafana, ntfy, webhook-ntfy and loki **all run on neon**, which was
down for hours. The monitoring stack went blind at exactly the moment it was needed, and it was
also the last machine to come back.

This matters for the service-monitor work: a down-detector that dies with the thing it watches
reports nothing rather than reporting an outage. Whatever gets built needs either an off-site
component or a dead-man's-switch that alerts on **silence**, not on a failed check.

## Benign failures, left alone

`systemd-networkd-wait-online` / `NetworkManager-wait-online` (always fail on multi-homed hosts)
and `openipmi` (no IPMI hardware present). Three across the estate, none affecting service.
