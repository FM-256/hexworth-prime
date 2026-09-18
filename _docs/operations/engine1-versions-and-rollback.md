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
