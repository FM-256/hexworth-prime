# OpenStack Sandbox — Feasibility and Staged Plan

**Status:** SCOPED, NOT BUILT. No software installed, no machine modified.
**Date:** 2026-07-29
**Verdict:** Feasible on bc2 without hurting existing services, provided DevStack runs inside a
KVM virtual machine rather than on bc2's host OS.

---

## TLDR

Frank asked for an OpenStack sandbox for Cloud Master, "just like the Linux sandbox," on the
condition it can live on a server "without hurting us too much." It can. bc2 is idle, has four
physical NICs with two free, and already has nested virtualization enabled, so the recommended
design needs no risky host changes.

The one thing that does **not** carry over from the Linux sandbox is the per-student-container
model. OpenStack cannot give every student their own cloud (8GB+ each). The correct shape is
**one shared cloud, one Keystone project per student, quotas per project** — which is also how
real clouds work, so the compromise is pedagogically free.

---

## Stage 0 verification — COMPLETE (read-only, 2026-07-29)

Every value below was read directly off bc2. Nothing was changed.

| Question | Finding | Consequence |
|---|---|---|
| NIC count | `eno1` (192.168.1.212), `eno2` (192.168.1.192), **`eno3` and `eno4` present with no address**, plus `tailscale0`, `docker0` | Two free physical NICs. Kolla-Ansible's hard 2-NIC requirement is satisfiable, and DevStack has a dedicated NIC available for `br-ex`. This was previously an open blocker. |
| Nested virtualization | `/sys/module/kvm_intel/parameters/nested` = **`Y`**; `kvm_intel` + `kvm` loaded | Already on. The recommended VM-wrapped design gets full KVM speed with **no host module reload required**. |
| Current occupancy | 0 Docker containers, load average 0.03, up 8 days, no libvirt VMs (libvirt not installed) | bc2 is genuinely idle. The VM can be sized generously. |
| Existing roles | `tailscaled`, `node_exporter`, `docker` all active. Listening: `:22`, `:9100` (node_exporter), `:631` (cups), systemd-resolved stubs | Roles to preserve: SSH jump host to hexclass, Prometheus scrape on :9100, Tailscale node 100.125.36.2. |
| Hardware | Xeon E5-2680 v3 (Haswell-EP), 48 CPUs, VT-x, `/dev/kvm` present, 31GB RAM (~29GB free), 6.1TB free on `/` | RAM is the binding constraint. Disk and CPU are not. |

---

## Why a VM, not bare metal

DevStack's own documentation is the argument, verbatim from its `README.rst`:

> "DevStack runs rampant over the system it runs on, installing things and uninstalling other
> things. Running this on a system you care about is a recipe for disappointment, or worse."
> "We strongly recommend that you run `stack.sh` in a clean and disposable vm."

The concrete "hurt us" vector on bc2 is **netfilter and interface contention**. Bare-metal
DevStack installs Open vSwitch, creates bridges, may claim a physical NIC into `br-ex`, and
rewrites iptables/nftables. bc2 already runs Docker (its own iptables chains), Tailscale (its own
routing and netfilter rules), and fail2ban. A mistake there takes out the hexclass fallback SSH
route and the monitoring scrape simultaneously, and silently.

Inside a VM none of that touches the host, and a VM snapshot becomes the reset primitive — the
OpenStack equivalent of "relaunch for a clean box," which bare metal has no answer for. That is not
an inference; DevStack's README endorses exactly this, verbatim:

> "Alas, we're all in the virtualization business here, so run it in a VM. And take advantage of the
> snapshot capabilities of your hypervisor of choice to reduce testing cycle times."

The same README states the support policy plainly: "DevStack attempts to support the two latest LTS
releases of Ubuntu, Rocky Linux 9 and openEuler."

| | Bare metal on bc2 | KVM VM on bc2 (recommended) |
|---|---|---|
| Guest VM performance | full KVM speed | full speed — nested virt already `Y` |
| Blast radius | bc2 host rewritten by DevStack | delete the VM; bc2 unchanged |
| Reset primitive | none | VM snapshot restore |
| bc2 keeps jump-host + monitoring roles | no | yes |
| Doc-endorsed | explicitly warned against | explicitly recommended |

---

## Deployment method

**Recommendation: DevStack, release 2026.1 "Gazpacho", inside a dedicated KVM VM.**

| | DevStack | Kolla-Ansible | Canonical Sunbeam |
|---|---|---|---|
| Ubuntu 24.04 (Noble) | Yes — DevStack docs call Noble "the most tested" | Yes | Yes (Desktop specified) |
| Stated min RAM | 4GB ("performs best with 4GB or more"); 8–12GB with cinder+swift | 8GB | **16 GiB** |
| NICs required | 1 workable | **2, unconditional** | not stated |
| Release currency | tracks git branches | 2026.1 | **2024.1 Caracal — upstream calls it Unmaintained** |
| Production-safe | **No, explicitly** | yes | yes |

- Sunbeam is eliminated: 16 GiB consumes over half of bc2's RAM before a single student instance,
  and its stable channel is two years behind upstream.
- Kolla-Ansible is now *possible* (eno3/eno4 are free) but is heavier and aimed at production. It
  remains the fallback if the maintenance model below proves unacceptable.
- **MicroStack is dead.** The snap store states verbatim: "The microstack snap is no longer
  actively developed. Please use the openstack snap instead." Do not plan around it.

Release cadence: 2026.1 Gazpacho released 2026-04-01 (a SLURP release); 2026.2 Hibiscus planned
2026-09-30. Six-month cadence.

---

## RAM math

31GB total, ~29GB available. Proposed split: **20GB to the OpenStack VM, 11GB left to bc2's host.**

Inside the 20GB VM: budget 8–10GB for the control plane plus guest OS, leaving roughly 10–12GB
for student instances.

| Flavor | Guest RAM | Est. real cost | Concurrent in ~11GB |
|---|---|---|---|
| `m1.nano` (CirrOS) | 64MB | ~200–300MB with QEMU overhead | 35–55 |
| `m1.tiny` | 512MB | ~700MB | ~15 |
| `m1.small` | 2048MB | ~2.2GB | ~5 |

**This is the capacity decision.** The course already teaches `m1.nano` —
`cloud-openstack-operation-quiz.quiz.html:490` states the installation guide creates "m1.nano
(1 vCPU, 64 MB RAM, 1 GB disk) for CirrOS testing", and `cloud-openstack-launch-vm.lab.html` uses
it. Capping students to CirrOS on `m1.nano` removes RAM as the binding constraint. Allowing Ubuntu
cloud images at `m1.small` yields about five concurrent instances platform-wide, which is not a class.

**Honest caveats:** the per-instance QEMU overhead figures are an engineering estimate, not
doc-backed — no authoritative OpenStack figure for all-in-one idle consumption exists (checked
releases.openstack.org, docs.openstack.org performance-docs, and the OpenStack wiki). Measure it in
Stage 1 before making any capacity claim. Also, Nova overcommits RAM by default via an allocation
ratio; pin it to 1.0 for a teaching box or the scheduler will oversubscribe into swap.

---

## The pedagogical case (independent of the infrastructure case)

**Every "lab" in House of the Cloud is a quiz in disguise.** Verified: `grep -c SandboxLauncher`
returns 0 for all three OpenStack labs, all six AZ-104 labs, and every file in
`_app/houses/cloud/labs/`. Their own task tags say it — "Command Builder / Dropdown Selection",
"Fill-in-the-Blank / CLI Commands", "Interactive Rule Builder", "Scenario-Based / Multiple Choice"
(`cloud-openstack-launch-vm.lab.html:627,692,760`; `cloud-openstack-install.lab.html:793,1009`;
`cloud-openstack-advanced-ops.lab.html:727`).

That is precisely the failure mode named in memory `feedback_labs_must_be_legit_engines`:
*"you create quizzes disguised as labs... we want labs to be legit."* Shield got arena boxes,
Script got the Linux Mastery box, Matrix got Cell-Sigma. **Cloud is the last major house with zero
real-engine labs.**

### High-transfer labs to build

| Lab | Maps to | Why it must be real |
|---|---|---|
| Security groups: default-deny, then allow SSH + ICMP | AWS Security Groups, Azure NSGs | A dropdown builder cannot make a student feel a connection time out |
| **Cinder volume lifecycle** — create, attach, partition, mount, write, detach, delete instance, re-attach | AWS EBS, Azure Managed Disks | Persistence is only demonstrable if it is real. Highest-value lab on the list |
| Full launch chain: image → flavor → key pair → network → security group → floating IP → SSH | EC2 wizard, Azure VM create | Six dependencies that must all be right; failure at any step teaches the dependency |
| Troubleshooting: stuck in BUILD; SSH refused on floating IP; "No valid host found" | universal cloud ops | Already written as multiple choice; convert to seeded broken states |
| Quota exhaustion: hit the wall, read the error | AWS service quotas, Azure limits | Every cloud engineer meets this in week one |
| Keystone: projects, roles, act with reduced privilege | IAM, Azure RBAC | Being denied is the lesson |
| Neutron self-service network, subnet, router, floating IP | VPC, subnets, NAT, Elastic IP | Hardest and most transferable mental model in cloud networking |
| Horizon vs CLI on the same task | console vs CLI/SDK everywhere | Teaches why professionals script |

### Do NOT build

- **Manual installation (module 3).** The sandbox structurally cannot teach it — the cloud is
  already installed. Teaching install needs a throwaway box per student, which 31GB will not
  support. Module 3 stays simulated; say so plainly rather than implying otherwise.
- **Service-name recall.** Four existing 15-question quizzes already cover it.
- **RabbitMQ / MariaDB / memcached internals.** Near-zero transfer to AWS or Azure.
- **Heat orchestration.** Moderate transfer, but costs RAM for a concept better taught with
  Terraform. Stage 3 at the earliest.

**Certification caveat:** the course claims COA and CKA alignment
(`cloud-openstack-installation.presentation.html`). Whether the OpenInfra Certified OpenStack
Administrator program still exists was **not verified** — verify before repeating it to students.
Safer framing: these labs teach concepts assessed by Cloud Essentials+ (CTS2145C), AZ-900, CLF-C02
and AZ-104. An OpenStack security group is not on the AZ-104 exam; the reason inbound traffic is
denied by default is.

---

## Architecture: reuse the client, not the cloud

The reusable pattern is the **CLI container**, not the cloud itself. Build a
`hexworth/openstack-cli` ttyd image and register it as a new lab in the existing bc1 lab-manager
`LABS` map, carrying the `openstack` client and a `clouds.yaml` scoped to that student's project on
bc2.

That reuses 100% of the proven stack: Firebase ID-token auth, Traefik per-session `PathPrefix`
routing, Sablier 15-minute idle reap, `PidsLimit`, the 40-container cap, the disk reaper, the
readiness gate, and the `GET /api/sandbox/check/:sessionId` grader.

Horizon is separate — just a URL, exposed through a **new** cloudflared tunnel on bc2 following the
documented one-tunnel-per-host pattern in `reference_cloudflare_account.md`. `hexworth.tech` is on
Cloudflare; `hexworth.com` is at IONOS pointing at Firebase Hosting and **must not be touched**.

**Carried-over constraint:** per `project_sandbox_terminal_blindness_drhex`, the ttyd iframe is
cross-origin, so page JS cannot see keystrokes or output. The only channel into a running box is the
server-side check endpoint. **All OpenStack grading must be state-verification, not observation.**

### Identity bridge (the only net-new backend work)

Firebase uid must map to a Keystone project plus a credential.

- **(a) Fixed pre-provisioned project pool** — `student-01`..`student-30`, quotas pre-set, handed
  out on launch, recycled on release. No Keystone admin calls at request time, and the pool size
  becomes a natural capacity bound mirroring the existing 40-container cap. **Recommended.**
- (b) On-demand project creation keyed to uid. More code, unbounded growth, needs a reaper.

Keystone **application credentials** are the right credential type (scoped, revocable, no password
in the container).

---

## Isolation, quotas, egress

Keystone primitives: a **project** is "a container that groups or isolates resources or identity
objects"; a **domain** is "a collection of projects and users that define administrative
boundaries." One domain per cohort with per-student projects inside is the natural shape.

| Service | Clamp | Note |
|---|---|---|
| Nova | `instances`, `cores`, `ram` | Precedence trap: a `default` quota class takes precedence over config-file changes |
| Cinder | `gigabytes`, `volumes`, `snapshots`, `per-volume-gigabytes` | The last one stops a student allocating a 2TB volume |
| Neutron | `quota_floatingip` (default 50), `quota_router` (default 10) | Floating IPs are the scarce real resource. Per-project quotas need `quota_driver = ...DbQuotaNoLockDriver`. **Negative values mean unlimited — audit for them.** |

### Egress — the open risk

`_docs/operations/linux-practice-sandbox.md:198-201` and memory `reference_sandbox_infrastructure`
carry an **open, unmitigated backlog item**: `sandbox-net` allows outbound internet, so a student
can pull a miner or scan from bc1's IP. Adding full VMs with a second unrestricted egress path
would make that materially worse.

**Recommended design: an isolated fake-external network.** Create an admin-owned "external" network
on a bridge *inside* the OpenStack VM that is not routed to the internet. Students then build
routers, attach external gateways, allocate floating IPs and SSH into instances — learning the
entire workflow with **zero internet exposure**, because the floating IPs reach nowhere outside the
VM. The metadata service stays reachable so cloud-init works. CirrOS and Ubuntu images are
admin-uploaded to Glance, so no tenant internet access is needed to obtain them.

Alternatives considered and why they rank lower:
1. Withhold the external-gateway router — clean, but teaches less.
2. `--disable-snat` — Launchpad bug #1922089 reports `enable_snat` cannot be disabled once enabled
   under OVN. Verify on the chosen backend.
3. Security-group egress rules — soft control; students with a project role can edit their own. Also,
   locking egress requires whitelisting 169.254.169.254 or cloud-init breaks.
4. FWaaS v2 — shipped with 2026.1, but the project was deprecated for lack of maintainers once and
   later reinstated. Highest-risk dependency of the four.

### Consent / IRB

Precedent is already written: `_docs/operations/linux-practice-sandbox.md:105-118` records the
sandbox as an educational tool in the same category as existing course lab boxes where students get
real root shells without additional research consent. An OpenStack CLI box on a course hub page (not
on the Observatory consented surface) sits further from the IRB question than the Linux sandbox did.

---

## Staged plan

**Stage 0 — verification.** COMPLETE (see table above). No install, no cost, nothing changed.

**Stage 1 — instructor-only, zero student exposure.** DevStack 2026.1 in a 20GB KVM VM on bc2,
reachable only over Tailscale. Frank drives Horizon and the CLI himself. Measure the actual idle
control-plane RSS (the number that does not exist in the docs) and real per-instance overhead.
Confirm it survives a reboot — **DevStack's reboot behavior is undocumented folklore, not a
doc-backed claim.** Snapshot the working VM.

This is the real decision point: Frank learns from direct experience whether OpenStack is a thing he
wants to own, having spent nothing that cannot be deleted.

**Stage 2 — student-visible, read-mostly.** Two surfaces: Horizon via a new bc2 cloudflared tunnel
behind Cloudflare Access into a shared demo project with a read-only role; and a new `openstack-cli`
lab in the bc1 lab-manager `LABS` registry (a ttyd container, exactly the `linux-sandbox` shape).
Students run real `openstack server list`, `flavor list`, `network list` against a real cloud. Zero
write risk. **This alone removes the biggest lie in the current course** and exercises the whole
plumbing chain before any per-student state exists.

**Stage 3 — full build.** Pre-provisioned project pool, application credentials, Nova/Cinder/Neutron
quotas, the isolated fake-external network, and graded challenges through
`GET /api/sandbox/check/:sessionId` where check commands are server-side `openstack ...`
invocations. Wire the hub card into `_app/houses/cloud/openstack/index.html`, add a `LAB_INFO` entry
in `SandboxLauncher.js:27-37`, and add catalog entries near `_app/components/ContentCatalog.js:2004-2012`.

---

## Decisions still needed from Frank

Blockers 1 and 2 from the original scoping are now **resolved by Stage 0** (bc2 has free NICs;
nested virt is already on; bc2 is idle). What remains is policy, not engineering:

1. **Flavor policy.** CirrOS on `m1.nano` (35–55 concurrent) versus Ubuntu cloud images on
   `m1.small` (~5 concurrent). The capacity story is entirely different. Recommend `m1.nano`.
2. **Maintenance cadence / ownership.** DevStack installs from git and has **no supported in-place
   upgrade path**; upstream ships every six months. The operating model is "rebuild the VM each term
   from a snapshot." If unacceptable, the alternative is Kolla-Ansible (now viable — eno3/eno4 are
   free) at higher RAM and complexity. This is a standing cost, and the item most likely to bite later.
3. **Egress policy.** Recommend the isolated fake-external network. Real tenant internet would
   compound an already-open backlog item and should be declined.
4. **Identity bridge shape.** Fixed pool (recommended) versus on-demand creation.
5. **Capacity contention.** bc1's 40-container pool already has a documented graded-vs-free-play
   contention item. An OpenStack CLI lab adds load to that pool while the cloud has a separate,
   smaller instance ceiling on bc2. Both need explicit numbers before students arrive.

---

## Provenance

Nine load-bearing citations in this document were independently re-verified verbatim against
upstream sources in a second pass: the 2026.1 Gazpacho release and date, `stack.sh`'s
`SUPPORTED_DISTROS` string, the "Noble is the most tested" line, both DevStack "substantial
changes" / "runs rampant" warnings, the "clean and disposable vm" recommendation, Kolla's
8GB/40GB/2-NIC trio, Sunbeam's 16 GiB / 100 GiB / Desktop / spare-disk requirements, and the
MicroStack deprecation notice. **Nine for nine exact.**

One caution worth recording: an initial fetch of `releases.openstack.org` returned **stale cached
content** listing 2025.1 Epoxy as current. The 2026.1 claim was confirmed correct against
`releases.openstack.org/gazpacho/` and `docs.openstack.org/2026.1/`. Treat a single fetch of that
index as unreliable.

Second-hand (sourced by the research pass, not independently re-checked): the 2026.2 Hibiscus date,
the Octavia 8GB/12GB figures, the `single-vm.rst` 4GB figure, the Neutron quota driver name,
Launchpad bug #1922089, the Nova QEMU performance quote, the security-group/metadata-service
warning, the Keystone project/domain definitions, Cinder `per-volume-gigabytes`, and
neutron-fwaas 24.0.0.

## Explicitly unverified

Stated so nothing here is mistaken for a checked fact: whether the COA certification still exists;
DevStack's reboot survival; DevStack's minimum disk requirement (no current doc-owned figure);
Nova's current default RAM allocation ratio; per-instance QEMU memory overhead (estimate);
Keystone application-credential docs (not re-read this session); and whether a dummy NIC satisfies
Kolla's two-interface requirement (not documented anywhere in the Kolla docs — now moot, since
bc2 has real free NICs).

## Related

- `_docs/operations/linux-practice-sandbox.md` — the stack this reuses
- memory `reference_sandbox_infrastructure` — bc1/bc2/bc3 fleet
- memory `feedback_labs_must_be_legit_engines` — why the quiz-shaped labs must be replaced
- memory `project_sandbox_terminal_blindness_drhex` — the cross-origin grading constraint
- memory `reference_cloudflare_account` — tunnel and DNS pattern
