# Cloud Master Strategy — OpenStack as the Platform's First Real Cloud

**Created:** 2026-07-30
**Owner:** Frank (operator)
**Status:** STRATEGY — nothing here is authorized to build. Sequencing recommendation only.
**Origin:** Frank brought an external analysis (2026-07-30) proposing "Hexworth Cloud Master:
OpenStack Academy" — a 10-gate box track, Dr. Hex tiered help, a COA prep lane, and later expansion
into Kubernetes / Proxmox / VMware / Ceph with OpenInfra ecosystem positioning. This doc keeps what
survives contact with measured reality, states plainly what does not, and orders the work.

---

## TLDR

The strategic thesis is sound and the differentiator is real: **Cloud is the last major house on the
platform with zero real-engine labs**, and we now have a live OpenStack cloud that no competitor at
this price point offers students. The COA prep angle is the strongest single lead and the
certification is **confirmed live and purchasable** (it was previously an unverified claim in our
own docs).

Four things in the proposal collide with measured constraints and must be resized before they become
promises to students:

1. "No two students receive identical infrastructure" collides with a **measured ~45-50 instance
   ceiling** and a 30-project pool.
2. A 10-gate graded box requires server-side grading that **does not exist yet** — gates 6/7 are
   stashed, gate 8 is deliberately deferred.
3. COA requires **Horizon UI competency**, which makes Stage 2b (read-only web ingress) a
   prerequisite rather than an optional nicety.
4. Kubernetes / Proxmox / VMware / Ceph expansion is a **new-hardware conversation**, not a config
   conversation — bc2's VM has 13.3GB available and OpenStack already owns it.

**Recommended order:** close the Stage 3 identity rulings → build the eight already-designed labs
(Cinder first) → then, and only then, layer the gate/box structure and the COA map on top of real
labs that exist. Build content on the cloud we have before buying a cloud we don't.

---

## The one-line honest statement of where we are

We have a **real cloud with almost no real curriculum on it.** Measured 2026-07-30:

| Surface | OpenStack today | Linux sandbox (the standard to match) |
|---|---|---|
| Real-engine labs | **1** (`openstack-cli`) | 18 missions |
| Graded checks | **2** | 159 graded tasks |
| Presentations | 4 (7 slides each) | — |
| Quizzes | 4 (61 questions total) | — |
| Quiz-shaped "labs" | 3 | 0 |
| Review games | 1 (not catalogued — taskboard #246) | — |
| Files / catalogued entries | 13 files / 15 entries | — |

That 2-versus-159 gap is the entire strategy in one number. Everything else in this doc is about
closing it in the right order.

---

## What is verified true

### The COA certification is live (previously unverified in our own docs)

`_docs/operations/openstack-sandbox-scoping.md` § "Explicitly unverified" listed "whether the COA
certification still exists" as an open question, and the OpenStack course presentation claims COA
alignment. **Verified 2026-07-30 against the official source:**

| Fact | Verbatim from https://www.openstack.org/coa/ |
|---|---|
| Name | "Certified OpenStack Administrator (COA)" |
| Price | "$400" |
| Duration | "3 hours" |
| Retakes | "There are no retakes for this exam." |
| Release tested | "Caracal" (= OpenStack 2024.1) |
| Interface | "a combination of the command line & Horizon UI" |
| Audience | written for professionals with at least six months of OpenStack operations experience |
| Retirement notice | none present |

So the course's COA claim can stay — with two caveats now on the record:

- **A search-aggregated summary contradicted the official page** (claiming 2 hours and one free
  retake). The official page wins. Do not repeat the 2-hour/free-retake figures to students.
- **The exam targets Caracal (2024.1); our DevStack runs 2026.1 Gazpacho.** A two-release gap. Core
  CLI verbs are stable across that span, but any objective map must be spot-checked against Caracal
  behavior rather than assumed identical.

### The COA objectives list is currently unreachable — this blocks the objective map

Both https://www.openstack.org/coa/ and
https://wiki.openstack.org/wiki/Foundation/ProfessionalCertification direct readers to
`https://www.openstack.org/coa/requirements` for the content domains. **That URL returns HTTP 404 as
of 2026-07-30** (tested with and without trailing slash). The official Candidate Handbook PDF
(`COA-Candidate-Handbook-V1.4.14.pdf`) is a policy/proctoring document dated "Effective April 20,
2016" and contains **no domain list and no percentage weights.**

Consequence: **a COA objective map cannot be authored from an official source right now.** Options
are (a) contact OpenInfra for the current objectives document, (b) map to the exam's stated service
coverage only (identity, compute, block/object storage, networking, image, orchestration,
troubleshooting) and label it as inferred, or (c) defer the COA lane and lead with the labs. Do not
publish a domain-weighted objective map assembled from third-party cram sites — that is exactly the
citation-fabrication failure mode.

### Cloud is genuinely the last house without real labs

Independently verified in the scoping doc: `grep -c SandboxLauncher` returns 0 for all three
OpenStack labs, all six AZ-104 labs, and every file in `_app/houses/cloud/labs/`. Their own task
tags say it: "Command Builder / Dropdown Selection", "Fill-in-the-Blank / CLI Commands",
"Interactive Rule Builder". Shield got arena boxes, Script got Linux Mastery, Matrix got Cell-Sigma.
Cloud got dropdowns. That is the gap worth being loud about, internally and eventually externally.

### Cloud Master already exists as a container hub

`_app/components/HubRegistry.js` carries six children under `parent: 'cloud-master'`: AWS Cloud
Practitioner (CLF-C02), AWS Developer Associate (DVA-C02), Azure Fundamentals (AZ-900), Azure
Administrator (AZ-104), Cloud Essentials (CTS2145C), and OpenStack Cloud. The "OpenStack Academy"
does not need a new hub invented for it — it needs the OpenStack child to stop being the weakest
member of a hub whose other five members are cert-prep tracks.

**Known gap:** `catalog.html` has zero Firestore wiring, so the dynamic `cloud-master` hub does not
appear to catalog browsers (taskboard #243). A distribution hub invisible to the catalog defeats its
purpose. This is a prerequisite for any external positioning play.

---

## The four collisions

These are the places where the proposal, taken literally, would become a promise we cannot keep.

### 1. "No two students receive identical infrastructure" versus the measured ceiling

Measured in Stage 1 (2026-07-29, control plane settled in a 19,998MB VM):

- Idle control plane: **6,691MB used / 13,306MB available**
- First `m1.nano` CirrOS instance: **+507MB** (includes one-time allocations)
- Instances 2-5: **+221MB average each**
- Realistic ceiling: **~45-50 concurrent `m1.nano`** against 13.3GB available

The adopted identity model is a fixed pool of 30 pre-provisioned projects (`student-01`..`student-30`)
at roughly 1 instance each ≈ 7GB. That is comfortable. What it is **not** is per-student unique
infrastructure — it is 30 identical project shells, recycled. Uniqueness has to come from **seeded
scenario state inside the instance** (a broken security group, a detached volume, an exhausted
quota), not from bespoke topology per student. That is the honest and cheaper design anyway: seeded
broken states are the single highest-transfer lab pattern on the list.

Also note these are **two separate pools that get conflated**: bc1 runs a 40-concurrent *container*
pool (split 28 lab / 12 free-play, ruled 2026-07-30, live), while bc2's OpenStack VM has its own
~45-50 *instance* ceiling. An OpenStack CLI lab consumes one bc1 container **and** one or more bc2
instances. Any class-size promise must satisfy both, and the binding constraint today is the bc1
container pool at 40, not the cloud.

### 2. A 10-gate graded box needs grading that isn't built

The gate/box pattern is proven on this platform, but the OpenStack gates would inherit a known hole:
`submitGateAnswers` (gates 6/7 server grading) is **stashed, not committed** —
`stash@{0}: gate6/7 server-grading WIP`. Gate 8 was deliberately deferred because its fuzzy keyword
validators need faithful porting. Taskboard #237 tracks that gates 6-8 have no server-side
completion path.

Designing 10 new gates before closing the existing gate-grading gap would ship a graded track whose
grades are client-asserted. That is the BUG-044 forgery surface, widened. **Gate grading closes
before new gates are designed**, not after.

### 3. COA requires Horizon, so Stage 2b is not optional

The exam requires "a combination of the command line & Horizon UI." Our student-facing surface today
is CLI-only; Horizon read-only web ingress is **Stage 2b, still planned** (taskboard #244, needs a
Nancy plan pass because it opens new public ingress). One of the eight designed labs is explicitly
"Horizon vs CLI on the same task."

If COA prep is the lead, Stage 2b is a **hard prerequisite**, not a later enhancement. If Stage 2b
is unacceptable on security grounds, then COA prep is not honestly claimable and the lead should
change to "real cloud CLI skills that transfer to AWS/Azure" — which is a perfectly strong pitch and
is what the labs already deliver.

### 4. Multi-platform expansion is a hardware conversation

Kubernetes, Proxmox, VMware, and Ceph each want RAM measured in whole gigabytes. OpenStack's VM
already holds bc2's allocation with 13.3GB available, most of which the 30-project pool claims. The
adopted maintenance model is "rebuild the VM each term from a snapshot" — a model that works
precisely because there is one VM to rebuild.

Expansion is not blocked by architecture; it is blocked by physical memory. Treat it as a **future
hardware-purchase decision with a number attached**, and keep it out of any near-term roadmap
commitment. Saying "OpenStack today, others when hardware allows" is credible. Publishing a
four-platform roadmap on current hardware is not.

---

## Recommended strategy

### Position on what is already true, not on what is planned

The defensible claim today is narrow and strong: **students drive a real OpenStack cloud from a real
CLI, and the skills transfer directly to AWS and Azure.** Not "OpenStack Academy," not
"multi-platform private cloud mastery" — those describe a future state. The transfer framing is
already written and already correct in the scoping doc: an OpenStack security group is not on the
AZ-104 exam; *the reason inbound traffic is denied by default* is.

### Sequence

**Phase A — unblock (no new content).** Close Stage 3's five open identity rulings (claim service
location, application credentials versus passwords, pool and quota numbers, term reset behavior,
Fork F Horizon widening). Without an identity bridge, every lab is instructor-driven and the track
cannot scale past a demo. This is the true critical path.

**Phase B — build the eight labs that are already designed.** They exist as a table in the scoping
doc with per-lab transfer justification. Recommended order, highest value first:

1. **Cinder volume lifecycle** — create, attach, partition, mount, write, detach, delete instance,
   re-attach. Highest-value lab on the list: persistence is only demonstrable if it is real, and
   this is the lab a dropdown builder categorically cannot fake.
2. **Full launch chain** — image → flavor → key pair → network → security group → floating IP → SSH.
   Six dependencies that must all be right.
3. **Security groups** — default-deny, then allow SSH + ICMP. A dropdown cannot make a student feel
   a connection time out.
4. **Troubleshooting with seeded broken states** — stuck in BUILD, SSH refused on a floating IP, "No
   valid host found." Already written as multiple choice; convert to real seeded failures. This is
   also where per-student variation actually comes from (collision 1).
5. **Neutron self-service networking** — network, subnet, router, floating IP.
6. **Keystone roles** — act with reduced privilege. Being denied is the lesson.
7. **Quota exhaustion** — hit the wall, read the error.
8. **Horizon versus CLI on the same task** — gated behind Stage 2b.

Each lab should follow the platform's real-engine standard with server-side checks, not client
assertions.

**Phase C — structure, once there is content to structure.** Gate/box packaging, Dr. Hex tiered
help, and the COA objective map all sit *on top of* labs. Sequenced after Phase B, and after the
gates 6-8 grading hole is closed. The COA map additionally waits on a reachable objectives source.

**Phase D — ecosystem and expansion.** OpenInfra community positioning and any second platform.
Genuinely promising, genuinely not now.

### What not to build (carried forward from the scoping doc, still correct)

Manual OpenStack installation (the sandbox structurally cannot teach it — the cloud is already
installed; module 3 stays simulated and we say so plainly), service-name recall (four quizzes
already cover it), RabbitMQ/MariaDB/memcached internals (near-zero transfer), and Heat orchestration
(a concept better taught with Terraform).

---

## Open decisions for Frank

1. **Lead with COA prep, or lead with cloud-skill transfer?** COA needs Stage 2b plus a reachable
   objectives document. Transfer framing needs neither and is claimable today.
2. **Stage 2b Horizon ingress: proceed?** Already a "get it done" from 2026-07-29 but awaiting a
   Nancy plan pass on new public ingress. It gates both COA honesty and lab 8.
3. **Does the gate/box structure wait for Phase C, or run parallel with Phase B?** Recommendation:
   wait — but the blocker is the gates 6-8 grading hole, which could be closed independently.
4. **Contact OpenInfra for the current COA objectives document?** That is the clean fix to the 404.
5. **Is "OpenStack Academy" a name we want?** It implies breadth we do not have yet. Cloud Master
   already exists as the hub; OpenStack is one child of six.

---

## Explicitly unverified

Stated so nothing here reads as a checked fact: the COA content domains and their weights (official
URL 404s); whether Caracal-era CLI behavior differs from 2026.1 in any way that affects a lab; any
claim about competitor pricing or offerings (not researched); the RAM cost of a second platform
(Kubernetes/Proxmox/VMware/Ceph — no measurement taken); and whether OpenInfra community positioning
has any concrete enrollment or grant effect (asserted in the source analysis, untested).

---

## Related

- `_docs/operations/openstack-sandbox-scoping.md` — feasibility, Stage 0-2a execution records,
  the eight-lab table, adopted policies, Stage 3 open rulings
- `_docs/architecture/openstack-identity-bridge.md` — Stage 3 design and the five forks
- `_docs/architecture/the-rig-sandbox-hub.md` — the free-play front door and capacity split
- `_docs/architecture/lms-bridge.md` — how graded lab work reaches Blackboard/Canvas
- `_docs/operations/BUG_TRACKER.md` — BUG-044 (forged gate progress), BUG-050 (anonymous launch)
- Taskboard #237 (gates 6-8 grading), #241 (Cloud Master QC), #243 (catalog dynamic hubs),
  #244 (Stage 2b), #246 (review game not catalogued)
- memory `feedback_labs_must_be_legit_engines` — why the quiz-shaped labs must be replaced
- memory `project_openstack_sandbox` — live project state
