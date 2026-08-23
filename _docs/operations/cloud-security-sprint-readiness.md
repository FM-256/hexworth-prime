# Cloud Security Sprint — cloud readiness runbook

**TLDR:** the sprint runs on our OpenStack. It did not on 2026-08-22, for two fixable reasons.
Both are fixed, and both revert when DevStack is rebuilt. Run one script to fix, one to check.

```
bash _tools/openstack-bridge/sprint-preflight.sh 20      # read-only. Is it ready for 20 students?
bash _tools/openstack-bridge/ensure-sprint-ready.sh      # idempotent. Make it ready.
```

Both run **on bc2**. Preflight changes nothing and is safe five minutes before class.

---

## Why it did not work, and what changed

| | before 2026-08-22 | after |
|---|---|---|
| Guest image | `cirros-0.6.3` only — BusyBox: no `apt`, no `systemd`, no `python` | `ubuntu-24.04-minimal`, public, boots in 24s |
| Per-slot quota | 1 instance / 1 core / **192 MB** | 1 / 1 / **512 MB**, all 50 slots |
| Usable flavor | `m1.nano` (192MB / **1GB disk**) | `ds512M` (512MB / 5GB) |
| DevStack VM RAM | 20GB allocated, **9.1GB really free** | **26GB, 19.8GB free** |
| Class capacity | ~15 | **~42** (nova: 21630MB free) |

Every build command in the packet — `apt install nginx`, `python3-venv`, `pip install flask`,
`adduser`, `systemctl enable` — fails on the first line under CirrOS. That was the hard stop.

**Flavor arithmetic that is easy to get wrong.** The image declares `min_ram 512, min_disk 3`.
`m1.nano`, `m1.micro` and `m1.tiny` all have a **1GB disk**, so all three are excluded — the RAM
is not the only constraint. `ds512M` is the smallest flavor that fits.

**`ds512M` is the floor because of DISK, not RAM.** The image needs `min_disk 3`; `m1.tiny` has
512MB RAM and only 1GB disk, so it is rejected. Measured inside a running guest: Ubuntu 24.04
minimal uses **136MB of 458MB** available. (An earlier note here said `rss=446MB` — that was the
QEMU *process* on the hypervisor, which counts allocated guest pages, not guest usage.)

---

## ⚠ This reverts on every DevStack rebuild

DevStack is rebuilt from snapshot each term. That wipes the Glance image and the per-project
quotas, exactly as `ensure-second-network.sh` already warns for the `lab-net` decoy.

**After any rebuild, re-run `ensure-sprint-ready.sh` or the sprint silently reverts** to a
cirros-only cloud with a 192MB quota. It fails in a confusing way: students see either a BusyBox
prompt or `No valid host was found`, neither of which points at the cause.

---

## Growing the DevStack VM (only if preflight check 4 fails)

Capacity is the one thing `ensure-sprint-ready.sh` deliberately will **not** change, because it
requires stopping every student instance.

```
bc2 physical:  31GB
VM allocated:  26GB   <- leaves ~5GB for bc2's host OS, docker, socat, the identity bridge
```

⚠ **The guest ignores `virsh shutdown`.** ACPI went unanswered for 200 seconds. Do **not** reach
for `virsh destroy` — that is a power cut on a running cloud. Shut it down from inside:

```bash
sudo virsh -c qemu:///system dumpxml openstack-stage1 > BACKUP.xml     # verify it before proceeding
# edit <memory> and <currentMemory> (KiB), then:
sudo virsh -c qemu:///system define NEW.xml                            # validates; takes effect next boot
ssh -i ~/openstack-stage1/stage1_key stack@<vm> 'sudo systemctl poweroff --no-block'   # ~55s
sudo virsh -c qemu:///system start openstack-stage1
```

There are no memory-hotplug slots in the domain XML (`<maxMemory slots=…>` is absent), which is
why this needs a restart at all. Adding them would make future growth outage-free.

**Recovery is automatic and has now been proven twice:** `resume_guests_state_on_host_boot=True`
brought all 15 instances back ACTIVE, 20/20 devstack units started, and keystone answered through
the bc1→bc2 bridge ~50s after start.

**Pick a quiet window and verify it, don't assume it.** The 2026-08-22 change was made at
Sat 19:26 EDT with 0 launches in the preceding 3 hours and 0 live sandbox containers.

---

## What was actually proven, and how

**Peer-to-peer works.** This was the question gating the whole sprint: Projects 1-4 all need one
student's machine to consume another's service.

There is no data-plane path from bc1/bc2 to instances, so this could not be observed from outside.
Instead the instance tested the network **for** us and reported through its console log — a channel
that needs no network:

```
round=1   tcp22=BLOCKED     cross-project default-deny
round=2   tcp22=OPEN        after an ingress rule was added to the TARGET's security group
arp       REACHABLE         L2 works across projects
```

Two instances in **different student projects** on `shared`. The prober was never touched; it
flipped on its own when the rule landed. That is the sprint's core mechanic — scan, restrict,
rescan — demonstrated end to end.

**Shell access needs no new infrastructure.** `openstack console url show <server>` returns a
working noVNC URL, served through the horizon-proxy deployed 2026-08-19. Students get a terminal
on their own instance with zero routing work.

**Consequence: do not build a shared "client" or jump VM.** It was scoped and then dropped — a
student consoles into their own instance and curls their peer from there. Their own VM is the
client. Building one would be infrastructure that solves an already-solved problem.

---

## Traps to brief the class on

These are correct behaviour, not faults, and each one costs an hour if discovered live.

| trap | what the student sees | the truth |
|---|---|---|
| `--network public` | accepted → `BUILD` → `ERROR`, and the instance **cannot be rebooted** | `public` is external + not shared. Visible to every project because that is how a router gets a gateway; not attachable. Delete and recreate with `--network shared`. |
| `--network lab-net` | `ACTIVE` with **no address** | Deliberate decoy: its subnet was created `--no-dhcp` so that `--network` cannot be omitted. |
| `ping` fails | "I allowed ICMP and it still fails" | ICMP does not pass even with a correct `icmp` ingress rule, while tcp/22 through the same group works. **Unresolved.** The existing secgroup lab already uses `nmap -Pn`, which skips ICMP discovery. |
| floating IP | "my peer can't load my page" | Floating IPs are `172.24.4.0/24`, the DevStack default, and bc2 has no interface on that range. **Peer verification must be VM→VM on `shared`.** The v2 packet assumes floating IPs and needs this edit. |
| missing tools | `nmap: command not found` | `curl` IS present in ubuntu-24.04-minimal — **measured**. `nmap` and `iputils-ping` are not. |
| `apt update` succeeds, install fails | `Unable to locate package nginx` | **`apt update` exits 0 even with no internet** — it fetches nothing and reports success. The install is where it surfaces. Do not read a clean `apt update` as proof of egress. |

---

## Proving the preflight works

A check that has never failed has not been tested. `sprint-preflight.sh` takes `SPRINT_IMAGE` and
`SPRINT_FLAVOR` overrides for exactly this reason:

```bash
bash sprint-preflight.sh 999                       # capacity check must FAIL
SPRINT_IMAGE=no-such-image bash sprint-preflight.sh 20   # image check must FAIL
```

Both were run on 2026-08-22 and both produced the expected failures with a non-zero exit.

---

## Outstanding

- **Debris that needs operator deletion** (cloud deletion is denied to the assistant):
  `sprint-image-verify-2026-08-22` in student-49, `sprint-peer-probe-2026-08-22` in student-48,
  two ingress rules on student-49's `default` SG, and `aclverify-srv` in student-50 left from
  2026-08-18 — that last one is why a boot test failed on quota.
- **The v2 packet needs three edits** before hand-out: peer verification via `shared` not floating
  IP; `apt install` the missing tooling; Project 4 formally pairs students (quota is 1 instance).
- **This cloud runs OVN** (`br-ex`/`br-int`, `ovnmeta-*` namespaces, no `qrouter`). The 2026-07-30
  "no data-plane reachability" scoping note predates this stack — re-derive rather than inherit it.

## Related

- `_tools/openstack-bridge/ensure-sprint-ready.sh` · `sprint-preflight.sh`
- `_tools/openstack-bridge/ensure-second-network.sh` — the `lab-net` decoy and the same rebuild warning
- `_docs/handouts/openstack-build-reference.md` — student-facing flavor/quota reference (**its
  "1 instance, 1 core, 192 MB" table is now stale**)
- `_docs/operations/openstack-sandbox-scoping.md` — the 2026-07-30 data-plane finding
