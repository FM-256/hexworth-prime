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

---

# Round 3: exposure, per-team isolation, and the roster

## Exposure: live behind Cloudflare Access

`https://engine1.hexworth.tech` serves the browser terminal through bc2's existing tunnel.

**The Access application and its policy were created BEFORE the DNS record and the ingress rule
existed.** That ordering is the whole safety property: at no point was a deliberately vulnerable
Windows machine reachable without authentication. Verified by request, not by assumption: an
unauthenticated GET lands on `hexworth.cloudflareaccess.com/cdn-cgi/access/login/...` with
`auth_status: NONE`, and the terminal is not served.

| | |
|---|---|
| Access app | `Engine 1 CTF box terminal`, self-hosted, 8h session |
| Policy | `frank-only`, matching the `bc2-horizon` precedent |
| Tunnel | the existing bc2 tunnel; `config.yml` copied to `config.yml.bak-20260918T194350Z` first, `cloudflared tunnel ingress validate` returned OK before any restart |
| Restart | scheduled detached with `systemd-run --on-active=3`, because this host's own SSH runs through the same tunnel and a direct restart kills the command issuing it |
| After | `bc2-cf` SSH still works, cloudflared active, all three hostnames intact |

## Per-team isolation

Six instances, one per team on the live tournament, each a copy-on-write overlay off the
read-only golden with its own MAC. **Total disk cost for all six: 1.2 MB.**

Proven rather than assumed: `engine1-team-blue-shield` boots to its own address
(`192.168.122.109`) separate from the shared instance (`192.168.122.165`), so it has its own disk
state. Two instances running used 9GB of 31GB, so six at 4GB each fits with headroom.

This matters because on a shared box the first team to escalate can change the flag file's ACL,
patch the path they used, or crash the machine, and they would be doing it to everyone else's
event. Isolation also makes rollback per team: a new overlay replaces a wrecked instance.

Clones come off the GOLDEN, which has no flag, so a clone is not tournament-ready until
`provision/inject-flag.sh` puts the minted flag on it. That script verifies by reading the value
back off the machine and re-hashing it, and separately proves the `player` account is denied.
Confirmed on blue-shield.

**A real limitation, stated rather than hidden:** every team's box carries the SAME flag, because
the platform stores one `flagHash` per CHALLENGE and has no per-team dimension. A real box could
mint a different flag per team trivially, which would defeat one team simply telling another the
answer. The data model cannot express it today.

## The roster: why it is not automatic

"Open it to the tournament roster" cannot be resolved by this system on its own:

- the roster is Firestore team members, which are 28-character **Firebase UIDs**
- Cloudflare Access can only authenticate an **email**; one-time PIN is the only IdP configured
- a Firebase UID is not an Access subject, and most platform accounts are anonymous, so they have
  no email at all
- the live tournament's roster currently holds **one member across six teams**

`_tools/engine1/roster-open.sh` makes the widening a single reviewable command that always prints
the before and after: `--emails <file>` for a precise, individually revocable list, or
`--domain <d>` which warns that a domain is broader than a roster. An Access GROUP would be
tidier, but the available API token can create apps and policies and NOT groups.

**Access remains `frank-only` until a real list exists.** Guessing a domain would either lock
every student out or expose a machine built to be broken into.

---

# Round 4: end to end, and what the test found

The full student path is proven on a pristine clone: unprivileged login, discover the privileged
task, exploit a writable script, escalate, log in again, read the flag, and that flag hashes to
exactly the value `ctfSubmitFlag` would grade against.

## The scenario

A scheduled task, `HexMaintenance`, runs as SYSTEM every two minutes and executes
`C:\Scripts\maintenance.ps1`. `BUILTIN\Users` holds `(OI)(CI)(M)` on that directory. The task is
privileged; the code it runs is not protected. That is the entire vulnerability, and it is a real
and common Windows misconfiguration rather than an invented puzzle.

Intended path: list `C:\`, read the task definition and see it runs as SYSTEM, read the script,
check the ACL, replace the script, wait one interval, log in again, read the flag.

## What the end-to-end test found that nothing else would have

1. **Clones had no `player` account.** The golden was frozen before the account existed, so a
   clone refused the player SSH outright. No student could have logged in.
2. **Clones had no flag.** Same root cause; the clone read it back as length 0 where the live
   instance read 55.
3. **Clones had no escalation path.** It had been installed on one instance by hand, not baked
   into provisioning, so a fresh clone was a locked box with no key. That is the os003 defect
   class: a challenge whose solution was never implemented.
4. **The task was invisible to an unprivileged account.** `schtasks /query` was refused and the
   task file was unreadable, so the intended first step could not be performed. Fixed by granting
   `Users:(R)` on `C:\Windows\System32\Tasks\HexMaintenance`, READ only, verified to reveal the
   path without conceding privilege: the player is still not in `S-1-5-32-544` afterwards.

All four are now handled by `provision/prepare-clone.sh`, so a clone is playable in one command.

## Instruments that lied, recorded so the next person does not chase them

- **`Get-LocalGroupMember` silently returns a truncated list** on this image. It reported
  Administrators as a single entry while `net localgroup` reported `error 1378, already a member`.
  On the strength of that I twice stated the box was not completable. It was.
- **`Get-ScheduledTask` hangs the SSH session outright**, producing empty output that reads like
  a failed command rather than a broken cmdlet.
- **A privilege check reused a stale logon token.** Windows applies a new group membership only
  to new sessions, so the flag read was denied in the session that had just escalated.
- **A clean-box check raced the task interval by seconds** and reported no escalation where a
  forced run proved it worked.
- **Discovery routes measured on an already-compromised box looked available** because the player
  had been made an admin by the previous test. Re-measuring on a clean clone is what exposed it.

Use `net localgroup` and `schtasks`, not the CIM-backed cmdlets, and re-test privilege changes in
a new session.

## Instance ledger after the re-clone

| Instance | State | Why it still exists |
|---|---|---|
| `engine1-team-blue-shield` | shut off | dirty from the first solve, overlay retained at 2.13 GB |
| `engine1-team-blue-shield-v2` | shut off | solved during testing, retained |
| `engine1-team-blue-shield-v3` | running, clean, playable | the current instance |

Nothing was deleted. Each re-clone is a new overlay off the read-only golden, which is the same
mechanism as rollback.

## Still not done

The challenge is not registered in a tournament, no student-facing walkthrough exists, Access is
still `frank-only`, and the other five teams have instances defined but not prepared. A future
golden v3 should bake in the player account and the escalation path so clone prep is only the
flag injection.
