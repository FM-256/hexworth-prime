# Engine 1: state, versions and rollback

Hexworth Prime's first REAL tournament box. Not a browser simulation: a Windows Server 2022
virtual machine running under KVM on bc2.

**This tree is APPEND-ONLY.** Nothing here is deleted or overwritten. A replacement gets a new
`vN` path and the previous version stays exactly where it is. That is the rollback guarantee.

## Where it lives

| | |
|---|---|
| Host | **bc2** (`ssh bc2-cf`). Chosen for 6.0T free, libvirt already installed, and no student workload. |
| Why not bc1 | bc1 runs the student sandbox containers. The fleet-SSH design deliberately avoids routing through it so a container escape cannot become lateral movement. A deliberately vulnerable Windows box does not belong beside that. |
| Root | `/srv/hexworth/engine1` |
| Hypervisor | KVM/QEMU via libvirt. Windows cannot run as a Docker container on a Linux host, so a VM is the only real option. |

## Artifact ledger

| Artifact | Path | Notes |
|---|---|---|
| Install media | `iso/win2022-eval.iso` | 5,044,094,976 bytes. Windows Server 2022 Standard **Evaluation**, 180 days. sha256 in `iso/win2022-eval.iso.sha256`. |
| Answer file v1 | `provision/v1/` | **SUPERSEDED, retained.** Its credential was printed into an operator transcript by a debug trace, so it was never installed from. |
| Answer file v2 | `provision/v2/engine1-unattend-v2.iso` | What the machine was actually built from. 0600. |
| Admin credential | `config/engine1-admin-v2.cred` | 0600, generated ON bc2, never transmitted or printed. v1 credential retained at `config/engine1-admin.cred`, unused. |
| SSH key | `config/engine1_id_ed25519` | Installed to the box's `administrators_authorized_keys`. Key auth verified; the password is not needed for normal access. |
| Aborted disk | `images/engine1-v1.qcow2` | 197 KB empty. First `virt-install` failed (`--disk device=cdrom` is not an install method; `--cdrom` is). Retained rather than deleted, per policy. |
| **GOLDEN BASE** | `images/engine1-v2.qcow2` | 5.91 GiB actual / 60 GiB virtual. **chmod a-w, read-only.** Never write to this file. |
| Live overlay | `images/engine1-live-v1.qcow2` | Copy-on-write, backed by the golden. 197 KB at creation. |

## Domains

| Domain | Disk | State | Purpose |
|---|---|---|---|
| `engine1-v2` | golden (read-only) | shut off | The pristine image. Keep it shut off; it exists to be cloned from. |
| `engine1-live-v1` | overlay | running | The instance students would reach. |
| `openstack-stage1` | (unrelated) | shut off | Pre-existing, belongs to the OpenStack sandbox work. NOT TOUCHED. |

The two Engine 1 domains were given **different MAC addresses** after the clone was found to have
inherited the golden's. Sharing one would have meant an IP collision the moment both ran.

## What is inside the box

Windows Server 2022 Standard Evaluation, **Core** (no desktop shell), hostname `ENGINE1`, built
by unattended install from `autounattend.xml` targeting `/IMAGE/INDEX` 1 rather than a display
name, because indexes are stable across ISO builds and names drift.

Installed and verified at first boot: OpenSSH Server (PowerShell as the default shell, service
automatic), an inbound firewall rule for 22, RDP enabled, and `C:\Hexworth\PROVISIONED.txt`
written as a completion marker the host can poll for.

Hardware is SATA disk and an e1000e NIC on purpose: Windows Setup has inbox drivers for both, so
no virtio driver injection was needed for a first install. virtio is faster and can be swapped in
later against the snapshot, which is exactly why the snapshot exists first.

## Rollback

| To undo | Do this |
|---|---|
| Anything a student or a build step did to the live box | Create a NEW overlay from the golden and define a new domain against it. The golden is read-only and was never written. |
| A bad change to the golden itself | `virsh snapshot-revert engine1-v2 base-clean-v1`. Independent of the overlay chain. |
| Everything | The golden qcow2 and the two ISOs are self-contained. `provision/create-engine1.sh` rebuilds the machine from the install media unattended. |

Both mechanisms are deliberate: the overlay chain protects against normal use, the libvirt
snapshot protects against damage to the base.

## Honest status

**Done and verified:** the VM installs unattended, boots, takes a DHCP lease, answers SSH with
key auth and answers RDP. The golden image is frozen and a live overlay runs from it.

**Not done:** no CTF content, no flag, no tournament wiring, and no browser access path. Students
cannot reach this box: it sits on libvirt's NAT network, reachable only from bc2. Nothing about
Engine 1 is exposed to the internet, and no Cloudflare route has been created.

**Eval clock:** the 180-day evaluation starts at install, 2026-09-18.

---

# Round 2: piping and wiring

## Piping: the flag

`provision/mint-flag.sh` mints a **128-bit CSPRNG flag per instance**, injects it into the box,
and then reads it back out and re-hashes it, so the verification is of what is actually on the
machine rather than of the write having returned success.

This is the payoff of a real box, and it closes by construction the defect the platform voted on
the same day (taskboard 401): every live tournament flag was a dictionary phrase or a string
copied from its own public `boxId`, and all five were recovered from published hashes. A minted
flag has nothing to guess, nothing reused from a box registry, and nothing an author can get
wrong.

| | |
|---|---|
| Location on the box | `C:\Hexworth\loot\proof.txt` |
| ACL | `Administrators:F`, `SYSTEM:F`, inheritance removed |
| Plaintext on bc2 | `config/flags/<domain>-<scenario>-<stamp>.flag`, 0600, never leaves the host |
| Registered to the platform | only `flagSalt` and `flagHash` |

**Proven in both directions.** The `player` account gets
`Access to the path 'C:\Hexworth\loot\proof.txt' is denied`, and Administrator reads 55
characters, which is exactly `flag{engine1_foothold_<32 hex>}`. The player starts unprivileged
and must escalate. That IS the challenge.

## Wiring: how a student would reach it

`player` is a local, non-administrative account (`Users` plus `Remote Desktop Users`), created by
`provision/player-account.sh` with its own 0600 credential. It is the starting position, not the
prize.

A browser terminal runs on bc2 as the container `engine1-wetty` (`wettyoss/wetty`), SSHing into
the box as `player`. It is bound to **127.0.0.1:7681 only** and confirmed not listening on any
external interface.

## What is deliberately NOT done

**Nothing is exposed to the internet.** No Cloudflare hostname, no Access application, no route.
Publishing a deliberately vulnerable Windows box is an outward-facing act and needs an explicit
decision, not an inference from "build an MVP".

**The tournament challenge is not registered.** Today the admin console asks for flag TEXT and
hashes it itself, so registering a real-box flag means an admin reading the plaintext off bc2 and
pasting it in. That works and is legitimate, but a better path is a console field that accepts a
`flagSalt` and `flagHash` directly, so a minted flag's plaintext never has to be handled at all.
Worth building before this scales past one box.

**No per-team isolation yet.** One overlay, one instance. Per-team clones are the same mechanism
as rollback (a new overlay per team off the read-only golden), and 31GB of RAM caps concurrency
near six Windows instances at 4GB each.

## Near-miss recorded

A `docker rm -f engine1-wetty` was used as a pre-clean before the first container run. No
container by that name existed, so nothing was removed, but it is a removal command issued under
a no-destruction constraint. A name-collision check is the correct form and is what should be
used from here.
