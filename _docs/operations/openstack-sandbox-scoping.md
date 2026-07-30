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
Confirm it survives a **guest (VM) reboot — the bc2 host is never rebooted in Stage 1** (a host
reboot would take down the jump-host and Prometheus roles and is out of scope; DevStack reboot
folklore is about the guest anyway). **DevStack's reboot behavior is undocumented folklore, not a
doc-backed claim.** Snapshot the working VM BEFORE the reboot test, so a reboot failure is
restored-from-snapshot and documented, not re-stacked and papered over.

This is the real decision point: Frank learns from direct experience whether OpenStack is a thing he
wants to own, having spent nothing that cannot be deleted.

### Stage 1 — EXECUTED 2026-07-29 (Nancy PROCEED, both netfilter gates green)

Built: `openstack-stage1` KVM VM on bc2 (20GB RAM, 12 vCPUs pinned to NUMA node0
cpuset 0,2..22 — bc2's nodes are interleaved, even CPUs = node0; topology archived beside the
measurements), 200G thin qcow2 from SHA256-verified Noble cloud image, libvirt default NAT
(192.168.122.62, unreachable off-host). DevStack `stable/2026.1`, `ram_allocation_ratio=1.0`
pinned. `stack.sh` completed in 1,299s. Nested KVM confirmed in-guest (`/dev/kvm` present).

Safety evidence (all archived in `bc2:~/openstack-stage1/`): five pre-install baselines
(iptables/ip6tables/ip link/ss/topology) + post-libvirtd and post-first-boot diffs — every
delta scoped to virbr0/LIBVIRT_* chains; fail2ban jail, sshd, node_exporter, Tailscale verified
live at each gate. Admin password in `bc2:~/openstack-stage1/vm-credentials.txt` (0600, not in repo).

**The two numbers the docs don't publish, now measured** (control plane settled, 19,998MB VM):

| Measurement | Value |
|---|---|
| Idle control plane | **6,691MB used / 13,306MB available** (aggregate RSS 8.8GB incl shared; mysqld 794MB + 3 uwsgi ~200MB each on top) |
| First m1.nano CirrOS instance | **+507MB** (includes one-time allocations) |
| Instances 2-5, average | **+221MB each** (5 instances total: +1,390MB over idle) |
| Realistic m1.nano ceiling in this VM | **~45-50** at ~250MB steady-state against 13.3GB available — consistent with the 35-55 estimate, now measurement-backed |

**Reboot survival: PASSED** (guest reboot only, per policy). Snapshot taken BEFORE the test
(`/var/lib/libvirt/images/openstack-stage1/snapshots/openstack-vm-stacked-20260729.qcow2`, 6.5GB
sparse, `qemu-img check` clean). After clean shutdown + cold boot: all 20 `devstack@*` units
active, compute services up, Horizon 302, and a fresh CirrOS instance reached ACTIVE — the
folklore did not bite this all-in-one OVN config. The snapshot remains the reset primitive.

**Instructor access (Frank):** `ssh -L 8080:192.168.122.62:80 bc2` then http://localhost:8080/dashboard —
login `admin` / password from `bc2:~/openstack-stage1/vm-credentials.txt`. CLI: `ssh bc2` then
`ssh -i ~/openstack-stage1/stage1_key stack@192.168.122.62`, `source ~/devstack/openrc admin admin`.

### Stage 2a — EXECUTED 2026-07-29 (Nancy PROCEED after her leak-canary gate closed with transcript)

Built and live on the infrastructure side; the repo half (hub launcher card + LAB_INFO) ships with
the next hosting deploy. **STAGE-BOUNDARY RECONCILIATION (Nancy):** the original staging placed
LAB_INFO/hub-card/catalog wiring in Stage 3; pulling the launcher wiring forward into 2a is a
DELIBERATE call — a student-visible CLI lab is unreachable without its launcher, and Stage 2's own
definition says student-visible. Stage 3 keeps quotas, the per-student project pool, and graded
challenges.

What exists: keystone project `demo-readonly` + user `student-view` with PROJECT-SCOPED `reader`
only (assignment table shows System=empty; cross-project canary instance invisible;
`--all-projects` and writes both 403 — transcript in session record). `canary-admin-project`
instance KEPT DELIBERATELY as a standing regression trip-wire for future role changes.
`openstack-api-bridge.service` on bc2: socat bound ONLY to the tailscale IP (100.125.36.2:8080 ->
VM:80), Restart=always/RestartSec=3, zero iptables changes. **THE CREDENTIAL SCOPE IS THE SECURITY
CONTROL, NOT THE NETWORK BIND** — every tailnet peer can reach the combined API/Horizon vhost; what
they hold determines what they can do (Nancy's framing, verbatim, accepted risk: the tailnet peer
set is our tagged servers + Frank's devices). `hexworth/openstack-cli` image on bc1 (LOCAL ONLY,
never pushed): linux-sandbox pattern + python3-openstackclient + baked clouds.yaml with per-service
endpoint overrides through the bridge; credential rotated NO-ECHO at bake time. lab-manager LABS +
CHECKS entries live (server.js backup kept beside it); end-to-end verified: production API launch
of the lab, in-container `openstack server list` returns real data, write 403, teardown clean,
existing linux-sandbox lab regression-launched clean.

**Capacity numbers (the doc demanded these before students arrive):** bc1 pool = 40 total, 2/user
(live env, 2026-07-29), 5 containers running at wiring time = 35 headroom. bc2 cloud ceiling =
~45-50 concurrent m1.nano measured in Stage 1 — but Stage 2a students consume ZERO instances
(read-only project; the demo instance is shared and pre-existing). The CLI lab's cost is bc1
containers only. The graded-vs-free-play split of the 40 remains OPEN with Frank.
**CAPACITY CAVEAT (Chris, blocking review): BUG-050 applies to `openstack-cli` identically to
every lab in the shared pool** -- the lab-manager accepts anonymous Firebase tokens, and anon
uids are free to re-mint, so the 2-per-user bound is not actually enforced against a determined
anonymous visitor and the 40-pool is consumable without an account. The numbers above describe
configured limits, not adversarial guarantees, until BUG-050 is ruled and fixed.

**Maintenance policy update (Nancy):** term rebuilds restore from the POST-2a snapshot
(`openstack-vm-stage2a-20260729.qcow2`), not the Stage-1 pristine one, or the demo project and
reader credential silently vanish and the CLI lab breaks with auth failures. The Stage-1 snapshot
is retained as the known-good pre-2a baseline.

### Stage 2b — PLAN (Frank "get it done" 2026-07-29; Nancy PAUSE conditions folded, awaiting her PROCEED)

**CATEGORY CHANGE, named plainly (Nancy):** this is bc2's FIRST public ingress ever. The trust
boundary moves from "closed tailnet -- network admission before any HTTP" to "internet-reachable
identity wall at Cloudflare's edge." Not an incremental extension of 2a; reviewed as such.

Plan, with her conditions integrated:
1. Dedicated cloudflared tunnel ON BC2 (own credentials, not bc1's), hostname
   **`bc2-horizon.hexworth.tech`** (host-prefixed per the bc1-* naming convention -- her catch;
   grep-able ownership), routing to http://192.168.122.62:80. Outbound-only; zero listeners,
   zero netfilter changes; Stage-1 artifact-diff standard applies.
2. CF Access app scoped to the FULL HOSTNAME, all paths -- and PROVEN by curl against a
   non-/dashboard API path (e.g. /identity/v3/auth/tokens) returning the Access challenge, not
   just the /dashboard test. Access = the sole gate against internet noise; Horizon's login form
   is only ever reachable by an Access-authenticated identity, which is what bounds the
   no-rate-limit concern.
3. Policy: FRANK-ONLY at launch. **Widening to any student group is a MANDATORY fresh Nancy
   pass** (the shared-credential concern only becomes live at that point), stated here so it
   cannot happen as a silent extension. Access session duration: 8h; and the verification tests
   the CF-session/Horizon-session relationship explicitly (log out of Access, confirm whether the
   in-browser Horizon/Django session survives; Horizon's keystone token expiry ~1h bounds the
   residual; result recorded honestly either way).
4. Credential: the `student-view` plaintext EXISTS in `bc2:~/openstack-stage1/vm-credentials.txt`
   (0600) -- the no-echo bake kept it out of session transcripts, not out of existence. Frank
   reads it from that file; no reset, CLI lab untouched. Browser-typed use is a REAL exposure
   downgrade vs the baked CLI path (devtools/autofill/shoulder-surf) -- accepted for Frank-only,
   and exactly why widening requires re-review.
5. Verification (the claim, not a proxy -- her condition): anonymous -> Access challenge on
   /dashboard AND on a raw API path; authorized -> Horizon login; student-view session exercised
   against MULTIPLE write surfaces, not one create button: instance launch, instance power
   actions, volume create, security-group rule add, key-pair create -- each must fail (Horizon's
   policy layer is a separate code path from the API RBAC the 2a canary proved); unauthorized
   identity blocked; bc2 listener/netfilter diff empty; tunnel survives cloudflared restart;
   2a CLI lab regression-launched.
6. Rollback: delete tunnel + DNS record + Access app; bc2 loses nothing else.

**EXECUTED 2026-07-29 evening (machine-verifiable half):** tunnel `bc2-horizon`
(32e96c00, created via bc1's origin cert -- the Access API token has no tunnel scope), cloudflared
installed on bc2 as a systemd service (config at /etc/cloudflared/), DNS CNAME live, Access app
e7a9dc29 with 8h sessions + auto-identity-redirect + frank-only email policy. VERIFIED: anonymous
requests to /dashboard AND to the raw API path /identity/v3/auth/tokens both 302 to the Access
login (Nancy's full-hostname-scope proof); tunnel survives cloudflared restart; listener diff vs
the Stage-1 baseline shows exactly three named additions (2a socat bridge, cloudflared metrics on
127.0.0.1:20241 loopback-only, libvirt dnsmasq) and nothing else; 2a CLI lab regression-launched
clean. **HONEST DISCLOSURE: a propagation window of under a minute existed** between the DNS
route going live and the Access app propagating, during which one anonymous /dashboard request
reached Horizon's own login page. Lesson recorded: create the Access app BEFORE the DNS route on
any future ingress. **REMAINING -- Frank-driven identity tests** (cannot be automated with his
identity): his Access login end-to-end; student-view Horizon login showing demo-readonly
read-only; the FIVE write surfaces each failing in the UI (instance launch, power actions,
volume create, security-group rule, key pair); the Access-logout-vs-Horizon-session test.
Results to be recorded here when he drives it.

**Stage 2 — student-visible, read-mostly.** (original definition follows) Two surfaces: Horizon via a new bc2 cloudflared tunnel
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

### Stage 3 — EXECUTED 2026-07-30 (marathon; Nancy design pass + implementation review, conditions applied)

The identity bridge is LIVE: pool of 30 (`student-01..30`, member role, quota 1 instance / 1 core /
128MB = m1.nano exactly), claim service on bc2 (tailnet-only :9711, systemd Restart=always,
shared-secret AND independently-verified Firebase ID token, anonymous rejected server-side),
per-session RESTRICTED application credentials injected into the container's clouds.yaml, sticky
uid->slot mapping in Keystone project properties, credential deletion on destroy/expiry/orphan +
a 10-min reconcile sweep keyed to container labels. bc1 lab-manager patched (9 anchored
replacements); launch responses carry `cloudMode: personal|read-only` + `cloudSlot`; any bridge
failure degrades to the read-only telescope, stated, never silent. Full record:
`_docs/architecture/openstack-identity-bridge.md` (DEPLOYED section). E2E: real password-provider
test account -> personal claim -> `openstack server create` (the write that was impossible before)
-> destroy -> relaunch -> same slot, instance survived; isolation (`--all-projects` refused).

### Roadmap — Stages 4-5 (updated 2026-07-30; strategy: `_docs/architecture/cloud-master-strategy.md`)

**Stage 4 — the eight real labs** (order fixed by the strategy doc, Cinder first): volume
lifecycle, full launch chain, security groups, seeded-broken-state troubleshooting, Neutron
self-service networking, Keystone reduced-privilege, quota exhaustion, Horizon-vs-CLI (this last
gated on Stage 2b). Stage 3 unblocked 7 of 8; each ships as a real-engine lab with server-side
checks in the bc1 grader, page objectives in lockstep with grader paths (the BUG-052 rule: page
hints, server cmds, and image motd move together or not at all).

**Stage 5 — graded track + COA lane.** Gate/box packaging and Dr. Hex tiered help AFTER the
gates 6-8 server-grading hole closes; the COA objective map waits on a reachable official
objectives source (the openstack.org requirements URL 404s -- recorded blocker) or OpenInfra
contact. Multi-platform expansion (Kubernetes/Proxmox/VMware/Ceph) is a hardware-purchase
decision, not a config decision; excluded from any near-term commitment.

## Adopted policies (2026-07-29)

Adopted per Frank's directive to proceed with Nancy-approved recommendations (Nancy PROCEED on all
four, 2026-07-29, with the conditions folded in below). Adoption is policy only: **no build starts
without a separate explicit go.**

1. **Flavor policy: CirrOS on `m1.nano` is the course standard.** The 35-55 concurrent figure is an
   estimate, not a measurement; the original caveat carries forward verbatim: "the per-instance QEMU
   overhead figures are an engineering estimate, not doc-backed — no authoritative OpenStack figure
   for all-in-one idle consumption exists." **Measure real per-instance cost in Stage 1 before any
   class-size promise is made.** Ubuntu `m1.small` (~5 concurrent) stays available for instructor
   demos, never as the class default.
2. **Maintenance model: rebuild the VM each term from a snapshot.** DevStack has no supported
   in-place upgrade. Named default (Nancy condition: adoption without an owner is a policy that
   quietly lapses; Frank may veto): owner = Frank as operator, executed by Claude in a pre-term
   maintenance session; trigger = the week before each term's first class day; rebuild = restore
   base-VM snapshot, run `stack.sh` from the pinned current release, re-seed the project pool,
   smoke-boot one instance. Kolla-Ansible remains the documented fallback if this cadence proves
   unacceptable in practice.
3. **Egress policy: isolated fake-external provider network.** Student instances get zero real
   internet exposure; routers / floating IPs / SSH are taught against the fake-external net. Real
   tenant internet is declined (it would compound the still-open Linux-sandbox egress backlog item).
4. **Identity bridge: fixed pre-provisioned project pool** (`student-01`..`student-30`, quotas
   pre-set). Roster check (Nancy condition, measured 2026-07-29): prod Firestore has 7 classes and
   190 users total; per-class membership is not modeled in Firestore (user docs carry no class
   field), so no roster source contradicts a pool of 30 — but the check is weak by construction.
   **Standing rule: confirm the actual enrolled headcount against the pool size before each term's
   rebuild; if any class exceeds 30, resize the pool first** (pre-provisioning is scripted, so this
   is cheap).

## Decisions still needed from Frank

Blockers 1 and 2 from the original scoping are now **resolved by Stage 0** (bc2 has free NICs;
nested virt is already on; bc2 is idle). Remaining:

1. **Green light to build Stage 1** (the KVM VM + DevStack install on bc2). Policies above are
   adopted; the build itself was explicitly excluded from the 2026-07-29 authorization.
2. **Capacity contention.** bc1's 40-container pool already has a documented graded-vs-free-play
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

---

## Stage 4 build log

### Lab 1 — Cinder volume lifecycle ("The Volume Outlives the Server"), built 2026-07-30

First real-engine lab in House of the Cloud. Page:
`_app/houses/cloud/openstack/labs/cloud-openstack-cinder-live.lab.html`. Grader: bc1
`SANDBOX_CHALLENGES['openstack-cli']` ids 3-6 (2 live-cloud checks, 2 captured-evidence).
QC harness: `_tools/openstack-bridge/walkthrough-cinder.js` performs the ENTIRE student
journey with real credentials against the real cloud, then calls the real `/check` endpoint
and requires 4/4 -- the walkthrough IS the QC, per `feedback_walkthrough_verbatim_qc`.

**The harness earned its keep on first run.** It performed the lab correctly and check 6 still
FAILED. Two stacked bugs, neither visible to inspection:
1. The check grepped the volume JSON for `server_id` via nested `sh -c '...'` inside
   execCheck's `bash -lc` -- the quoting did not survive.
2. Rewriting it with shell parameter expansion (`${VC%%.*}`) broke `node --check`: inside a JS
   template literal `${...}` is INTERPOLATION, not shell syntax.

Fix: no JSON parsing and no `${...}` anywhere. The 1-instance quota means the single server in
the project IS the attached one, so the check compares the volume's `created_at` against that
server's `created` using `cut`/`tr`. Verified exit 0 against the exact live state that failed
the first version, then the whole walkthrough re-run.

**Rule reinforced for every remaining Stage 4 lab:** a grader command that is only
syntax-checked is not verified. Run the walkthrough before the lab ships.

**Nancy BLOCK on lab 1 (same night) -- the QC gap behind the QC gap.** The walkthrough passed
4/4, so I brought it for review. Nancy found the lab was beatable by a **five-command shortcut**:
create volume, create ONE server, attach, `echo in-use > attach-proof.txt`,
`echo available > detach-proof.txt`. Never delete anything, never rebuild. Check 6 v2 only
asserted "the currently-attached server postdates the volume", which the shortcut satisfies
trivially -- and MORE easily on a return visit, because Stage 3 volumes persist and are older
than everything.

**Why the walkthrough could not catch it:** the honest path is a strict superset of the cheat
path. Proving the honest path PASSES says nothing about whether a shortcut also passes. That is
a permanent lesson for every remaining lab:

> A walkthrough proves the lab is completable. It does NOT prove the lab is not beatable.
> Both need their own harness: `walkthrough-*.js` (honest path must pass) and
> `adversarial-*.js` (named cheats must fail).

Check v3 closes it: evidence files must contain the volume's REAL id (so `echo` fails), and
check 6 requires the volume to be attached to a server that is NOT the one recorded in
attach-proof AND for that first server to no longer exist. Page copy was corrected in the same
pass -- "Nothing is self-reported" was false given the evidence-file tier, and a promise that
"the launcher will tell you which mode you got" had no implementation behind it (now implemented
from the launch response's `cloudMode`).

**Reconcile sweep PROVEN in production (2026-07-30).** Nancy's gap-2 concern (credentials
orphaned when the in-memory session Map is lost) was closed by design with container labels +
a reconcile sweep; tonight it was verified live. After several runs whose containers were removed
with `docker rm -f` (bypassing the destroy hook entirely), the pool held 5 app credentials against
1 live container. Driving `/reconcile` with the live containers' `hexworth.oscred` labels returned
`{"checked": 4, "deleted": 3}` -- it reclaimed every stray and kept exactly the live one.

**Operational note worth remembering:** the sweep runs on a 10-minute `setInterval`, and every
`docker compose up -d lab-manager` restarts that timer. During a build session with frequent
rebuilds the sweep may never fire, so strays accumulate until things settle. That is not a code
defect, but it means "no reconcile log lines" during active development proves nothing about the
mechanism -- drive the endpoint directly to verify it.

**Chris BLOCK on lab 1 -- "verbatim" was not verbatim.** After Nancy's PROCEED, Chris found that
`walkthrough-cinder.js` inserted a poll between `server remove volume` and the evidence capture
that the PAGE never instructed. Detach is asynchronous (we had hit the resulting HTTP 400
ourselves during cleanup), so an honest student typing the page's two lines back to back could
capture a mid-`detaching` volume and fail check 5. The harness had been proving its own safer
sequence, not the lab. Fixed by putting the wait ON the page (better teaching anyway: async
operations are a real cloud lesson), making the harness cite each page line it executes, and
making it FAIL LOUDLY if the page's stated wait ever proves insufficient.

**Then the corrected harness immediately found a third defect neither reviewer had:** a returning
student's `lab-vol` still exists (persistence is the headline feature), so re-running step 1
creates a SECOND volume with the same name and every later `openstack volume show lab-vol` dies
with "More than one volume exists with the name 'lab-vol'". This would have hit every student on
their second visit. Step 1 now opens with a list-and-clear, framed as the lesson it actually is:
real cloud resources outlive your session and cleanup is part of the job.

**Chris found the deeper version of the same thing on the next pass:** a SUCCESSFUL run leaves
the volume in-use AND the server still running, and with a 1-instance quota that leftover server
blocks the next run's `server create` outright. My "second run" testing had never seen that
state, because the harness tears down on success -- it had only ever met debris from runs that
CRASHED before cleanup. Both halves fixed: the page's clean-start step now clears the leftover
SERVER as well as the volume (and says why: "your quota allows one instance at a time"), and the
harness now runs the entire lab TWICE with no cleanup in between, so run 2 starts from exactly
what a real returning student faces.

**Pattern worth carrying to labs 2-8:** persistence changes what "start of lab" means. Every
Stage 4 lab must state its own clean-start step covering EVERY resource type it creates, and its
harness must exercise the second run starting from a COMPLETED first run -- a harness that
cleans up on success can never see its own product's steady state unless you make it skip the
teardown.

### Stage 4 scoping finding (2026-07-30): NO DATA-PLANE REACHABILITY from lab containers

Measured, not assumed, before designing lab 2. From a lab container on `sandbox-net`:

| Target | Result |
|---|---|
| OpenStack API via the tailnet bridge (`100.125.36.2:8080`) | **REACHABLE** |
| The VM's own interface (`192.168.122.62`) | unreachable |
| Instance data plane / subnet gateway (`192.168.233.1`) | **unreachable** |

The socat bridge forwards the API port only. Students can fully COMMAND the cloud but cannot
reach the machines they build. Combined with the 1-instance quota (so there is no second VM to
connect *from*), three of the eight designed labs cannot deliver their stated core experience:

- **Security groups** — the whole point was "a dropdown builder cannot make a student feel a
  connection time out." The timeout is not reachable, so that feeling is not deliverable today.
- **Full launch chain** — ends in `ssh` to a floating IP. Not possible.
- **Neutron self-service networking** — router + floating IP + SSH. Same.

What IS fully buildable today (API-observable, no data plane needed): **quota exhaustion**,
**seeded troubleshooting of API-visible failures** (stuck in BUILD, "No valid host found",
volumes in the wrong state), **Keystone role behaviour**, and the Cinder lifecycle lab already
shipped. Horizon-vs-CLI still waits on Stage 2b.

**Options for restoring data-plane labs, none taken unilaterally (Frank/Nancy call):**
1. Route `192.168.233.0/24` from bc1 to the VM. Cheapest technically, but it exposes student
   instances to bc1's network and needs a fresh netfilter review under the Stage 1 standard.
2. Give each student a second small instance to connect from. Blocked by the capacity math
   Nancy already corrected: a second m1.nano per student is +5.8GB of quota-legal demand.
3. Accept API-only labs for now and sequence the connectivity labs after a routing decision.
   **Recommended**, because it keeps shipping without touching the netfilter boundary that
   Stages 1-2 were careful to leave alone.

Recorded so lab 2 is chosen on evidence rather than on the original list order.

### Stage 4 lab-2 design finding: error-reading labs are not gradeable to our bar

Lab 2 ("Read the Wall": quota exhaustion + the volume state machine) was scoped, its grader
checks written and deployed, and BOTH harnesses written before the page -- applying the Lab 1
doctrine from the start. Writing the adversarial harness first is what caught the problem, which
is precisely why the doctrine exists.

**The problem:** the cloud records nothing when it refuses you. A quota 403 and an in-use-volume
400 leave no server-side trace. So the only evidence a student "hit the wall" is output they
captured themselves, and grep-based evidence checks are forgeable with a plausible request id.
The adversarial cheat (skip both walls, forge two evidence lines, boot the end-state instance
directly) scores full marks. End-state checks cannot close this: there is no end state unique to
having been refused.

**Consequence, stated rather than papered over:** this lab cannot meet the standard Nancy set on
Lab 1 ("a student who shortcuts CANNOT pass"). Shipping it graded would put a beatable lab next
to an unbeatable one under the same badge.

**Options (operator/Nancy call, taskboard #251):**
1. Ship it **ungraded** as an exploration exercise, clearly labelled, with no checks and no
   completion credit. Honest, cheap, still useful reading practice.
2. Fold the error-reading into labs that ARE gradeable, as steps whose *resolution* is
   real-state verifiable (e.g. the Cinder lab already makes students meet the in-use refusal
   naturally when they try to delete before detaching).
3. Build **seeded-failure** labs instead, where the lab-manager creates a genuinely broken state
   in the student's project and the check verifies they REPAIRED it. Repair is real state, so it
   is gradeable. This needs new cloud-seeding plumbing (the Linux missions have `runSeed`; the
   cloud path has no equivalent) -- the largest of the three, and the only one that yields a
   real graded troubleshooting lab.

**Recommendation: 2 now, 3 as the real Stage 4 investment.** Option 3 is what turns "seeded
troubleshooting" on the original eight-lab list into something that can actually be graded.

Grader checks 7-9 are deployed on bc1 but NO page references them, so they are inert. Harnesses
`walkthrough-wall.js` / `adversarial-wall.js` are committed as the executable record of this
finding; if option 2 or 3 is chosen they are the starting point, not wasted work.

### Seed engine SHIPPED 2026-07-30 -- and the design that makes repair-grading unbeatable

`POST /seed {slot, scenario}` on the bc2 claim service, live and verified (seeded
student-25 with real ids; re-seed correctly returned `seeded:false already present`;
resulting state `ghost-srv ACTIVE` + `orphan-vol in-use`, quota fully consumed). Runs as the
POOL USER, never admin, so a seed can only ever create what the student could create.

**The remaining wiring, and the one decision that matters.** A repair check must prove the
student SAVED the seeded resource rather than deleting it and making a same-named replacement.
Comparing names cannot do that; comparing ids can -- but the check runs inside the container and
does not know the seeded id.

**Answer: pass the seeded id as a container ENV VAR at launch** (`SEED_VOL_ID=<uuid>`). A student
cannot alter a running container's env, and `docker exec` inherits the container's config, so
`execCheck` reads a value the student cannot forge. The repair check then becomes:

    test "$(openstack volume show orphan-vol -f value -c id)" = "$SEED_VOL_ID" \
      && volume is in-use \
      && attached server is NOT ghost-srv \
      && ghost-srv no longer exists

Delete-and-recreate produces a different id and fails. That is a genuinely unbeatable
troubleshooting check -- the thing lab 2 could not have.

**Concrete remaining steps (mechanical, each needs its own QC):**
1. Page passes `scenario` through `renderButton` -> `SandboxLauncher.launch` -> launch body.
2. lab-manager: on a scenario launch, call `/seed`, then set `SEED_VOL_ID` in the container Env
   (alongside the existing `hexworth.oscred` label pattern) before start.
3. Grader checks 10-12 for the repair, using `$SEED_VOL_ID`.
4. Page + BOTH harnesses (walkthrough honest path, adversarial: same-name recreate MUST fail).
5. Nancy + Chris.

Stopped here deliberately: the engine is proven and committed, and the rest is a client+server
change that deserves a full QC pass rather than a rushed one at the end of a long session.

### Lab 2 (real): "Rescue the Data" -- seeded troubleshooting, built 2026-07-30

The lab error-reading could not be. The student inherits a genuinely broken state in their own
project (`ghost-srv` holding `orphan-vol`, quota fully consumed) and must reclaim the quota
WITHOUT destroying the data: detach, delete, rebuild, re-attach the same volume.

**Why it is gradeable when the error-reading version was not:** the checks compare against
`SEED_VOL_ID` / `SEED_SRV_ID`, injected into the container env by lab-manager from the bc2 seed.
A running container's env cannot be changed from inside and `docker exec` inherits it, so a
student cannot forge the identity. Delete-the-volume-and-make-a-same-named-one is the obvious
cheat and it fails check 12 by construction -- names match, identity does not.

**Wiring:** page declares `scenario:'orphaned-volume'` -> `SandboxLauncher` (slug-validated)
-> launch body -> lab-manager calls `POST /seed` on bc2 -> ids injected as container env.

**Bug caught by running the adversarial harness FIRST (before the honest path, deliberately):**
`bridgeCall` had a flat 15s timeout. A claim is a few fast API calls; a SEED boots a server and
takes minutes. Every seed aborted silently and the launch continued WITHOUT env vars, which
would have made checks 10-12 inert -- passing or failing for reasons unrelated to student work.
Fixed with a per-call timeout (420s for seed) and, more importantly, made **fail-closed**: a
seeded lab whose seed failed now refuses the launch (503 SEED_FAILED) instead of handing the
student a world that was never built. Silent degradation is worse than refusal here.

### CRITICAL: seeded-check forgery via shell profile, found and fixed 2026-07-30

The seeded-lab design rested on one claim: a student cannot forge the seeded resource id,
because it is injected as a container env var and `docker exec` inherits the container config.

**The claim was FALSE.** `execCheck` runs `bash -lc` -- a LOGIN shell -- which sources
`~/.bashrc` and `~/.profile`, both owned and writable by the student. Proven in a container:

    echo 'export SEED_VOL_ID=ATTACKER-FORGED' >> ~/.bashrc
    docker exec <c> bash -lc 'test "$SEED_VOL_ID" = "REAL-SEEDED-ID"'   -> CHECK-POISONED

So a student could delete the seeded volume, create their own, export its id in `.bashrc`,
and pass every seeded check. That would have made the entire gradeable-troubleshooting
program worthless -- and it is exactly the failure the lab was invented to avoid.

**Root fix, not a hardening patch.** Shell hardening (non-login shells, `BASH_ENV`, chown
games) all leave the value reachable from student-controlled state. Instead the checks no
longer read the container at all for trusted values: the SERVER substitutes seeded ids into
the command string it builds, from the session record (`resolveSeedPlaceholders`, keyed on
`{{SEED_VOL_ID}}` / `{{SEED_SRV_ID}}`). A placeholder with no recorded value, or one whose
value is not a plain uuid, renders the command `false` -- so a mis-seeded session fails
HONESTLY instead of passing vacuously.

**Doctrine for every future seeded lab:** a check may read student-controlled state only to
observe what the student DID. Any value the check TRUSTS must come from the server. The
container environment is student-controlled state, whatever the Docker docs imply.

`adversarial-rescue.js` now carries this as **cheat D** permanently, so no future change can
silently reintroduce it.

### CRITICAL #2: container-side grading of CLOUD state is fundamentally unsound

Nancy's review found what the profile-poisoning fix did not cover, and it invalidates the whole
grading approach for cloud labs -- including the SHIPPED Cinder lab.

**CORRECTED 2026-07-30 -- I overstated this. Read the correction before the claim.**

What I first wrote: that a student could `sudo` and replace `/usr/bin/openstack` with a shim,
making every container-side cloud check forgeable. I "verified" it with a bare `docker run`
against the image -- WITHOUT the security options lab-manager actually applies.

In the DEPLOYED configuration that attack does not work. Launched sandboxes set
`no-new-privileges:true` and `CapDrop: ALL`, and sudo is refused outright:
`sudo: The "no new privileges" flag is set, which prevents sudo from running as root.`
Measuring the image instead of the deployed container is the proxy-not-the-claim error, made
while investigating an integrity finding -- exactly where it least belongs.

**What IS real, proven in an actual launched container:**
- `student ALL=(ALL) NOPASSWD:ALL` is baked into the image (true, but inert in production).
- PROFILE POISONING needs no sudo at all: `execCheck` runs `bash -lc`, a LOGIN shell, which
  sources student-owned `~/.bashrc` / `~/.profile`. `export SEED_VOL_ID=<mine>` forged every
  seeded check -- demonstrated live by adversarial cheat D, twice.
- PATH poisoning is the same class and equally sudo-free: `export PATH=~/bin:$PATH` plus a
  `~/bin/openstack` shim, exported from the same profile files.

**Why the earlier fix is not enough.** Server-side id substitution (`resolveSeedPlaceholders`)
correctly defeats `.bashrc` env poisoning -- adversarial cheat D confirms it. But it only makes
the COMMAND trustworthy. The command still runs inside the student's container and calls a binary
the student controls. Even without sudo, `bash -lc` sources `~/.bashrc`, so PATH poisoning
(`export PATH=~/bin:$PATH` plus `~/bin/openstack`) reaches the same result.

**Therefore: every check that asks the student's container about CLOUD state is forgeable**
-- via profile/PATH poisoning, which needs no privileges. That included the live Cinder lab
(checks 3 and 6; 4/5 are evidence-tier by design) and the read-only checks 1-2.

**The correct architecture: grade the cloud from the SERVER, not from the container.**
The cloud is the source of truth and bc1 can already reach it through the bridge. Cloud checks
should become a server-side query (a `/verify` endpoint on the bc2 claim service answering
questions about a slot's real state, called by lab-manager) instead of a `docker exec`. The
container stays what it should be: the student's workspace, never the grader's witness.

Container-side `execCheck` remains valid for labs whose subject IS the container's own
filesystem (linux-sandbox, missions): there the student-controlled state is exactly what is
being graded, so there is no trusted value to forge.

**Live-risk assessment, corrected:** the Cinder lab remains deployed. Forging required a
student to deliberately poison their own shell profile -- no privilege escalation, but
deliberate; the only prize is a lab badge, and no data or other student is exposed. It is an integrity defect, not a safety one -- but it IS a defect in live
content and must be fixed rather than tolerated. Lab 2 must NOT ship until grading moves
server-side (Nancy: BLOCK).
