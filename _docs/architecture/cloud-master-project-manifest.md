# Cloud Master Project 1 — "The Environment Is Data"

The centerpiece project for the OpenStack Cloud Master track. Students have hand-built every
primitive across labs 1-5; this makes them prove the environment is reproducible.

## The arc

1. **Export** — read your live cloud project, emit a provider-neutral JSON manifest
2. **Destroy** — tear the whole environment down
3. **Rebuild** — recreate it from the manifest alone, with an applier you wrote
4. **Prove** — the rebuilt environment matches the manifest AND carries *different resource
   IDs*

Step 4 is the anti-cheat and the lesson in one assertion: **same shape, different identity.**
A student who never destroyed anything fails, because their IDs are unchanged. A student who
destroyed and rebuilt by hand without the manifest also fails, because the applier is what
the manifest must drive.

## Why not Heat or Terraform

- **Heat is not installed** on the DevStack (verified 2026-07-31: neutron, keystone, nova,
  nova_legacy, cinder, glance, placement — no orchestration).
- **Terraform is not in the student image** (verified: no terraform, ansible, yq, git;
  yes to openstack, python3, jq, curl).
- More importantly it would be the wrong lesson here. Writing a ~40-line applier teaches what
  Terraform *does*. Terraform arrives in Project 3 as "the industry version of what you built".

## Manifest schema v1

Provider-neutral **intent**, not API payloads. This is the distinction that makes the
portability claim honest: intent transfers between clouds, API calls do not.

```json
{
  "manifest_version": 1,
  "name": "my-stack",
  "networks": [
    { "name": "app-net", "subnets": [ { "name": "app-subnet", "cidr": "10.20.0.0/24" } ] }
  ],
  "routers": [
    { "name": "app-router", "external": true, "interfaces": ["app-subnet"] }
  ],
  "security_groups": [
    { "name": "app-sg",
      "rules": [ { "direction": "ingress", "protocol": "tcp",
                   "port_min": 22, "port_max": 22, "remote_ip": "10.0.0.0/8" } ] }
  ],
  "volumes": [ { "name": "app-data", "size_gb": 1 } ],
  "servers": [
    { "name": "app-vm", "size": "small", "image": "cirros",
      "networks": ["app-net"], "security_groups": ["app-sg"], "volumes": ["app-data"] }
  ]
}
```

### Deliberate schema choices

- **`size: "small"`, not `flavor: m1.nano`.** A size CLASS is portable; a flavor name is not.
  The adapter maps `small` -> `m1.nano` on OpenStack, and would map it to `t3.micro` on AWS.
  This single field is where the portability lesson lives.
- **`image: "cirros"`, not an image UUID.** Same reason.
- **Names, never IDs, as cross-references.** `servers[].networks` points at a network *name*.
  IDs are per-deployment identity; names are intent. This is also what makes the
  different-IDs check possible.
- **No IDs anywhere in the manifest.** If an ID appears, the student exported state instead of
  intent, and rebuild would be impossible.

## Grader checks (bc1 CLOUD_CHECKS, ids 25+)

Graded server-side from `/verify`, which already surfaces networks (with subnets + cidr),
routers (with `external_gateway` and `interface_subnets`), security groups (with decoded
rules), servers (with `flavor_name`, `addresses`, `security_groups`) and volumes.

| id | check |
|----|-------|
| 25 | a manifest exists in the container, parses as JSON, declares `manifest_version` and contains NO resource IDs |
| 26 | every resource the manifest declares actually exists in the live cloud |
| 27 | the rebuilt resources carry DIFFERENT ids than the GRADER-RECORDED baseline (genuine rebuild) |
| 28 | applier is idempotent — running it twice changes nothing |

Check 27 needs the pre-destroy ids captured. The FIRST design had the student write them to
`~/project/before-ids.json`; that shipped, and it was wrong in both directions — forgeable
(BUG-055) and impassable (BUG-056). It is superseded by the grader-held baseline described
below; `before-ids.json` no longer exists anywhere in the lab. Do not reintroduce a
student-written evidence file for this check: anything gradeable from inside the student's own
container is, by definition, something they can edit.

## Check 27: the baseline store (design accepted 2026-07-31, NOT yet built)

Check 27 is the capstone's whole thesis — *you cannot fake having destroyed something*. The
shipped version was wrong in both directions at once: forgeable by a cheat (BUG-055) and
impassable by an honest student (BUG-056). Nancy blocked the first redesign; what follows is
the accepted one. Read the rejections, not just the conclusion — each one is a trap.

**Accepted design — an EXPLICIT baseline action.**

| Decision | Choice | Why not the alternative |
|----------|--------|-------------------------|
| Who captures | The grader, server-side | A student-written file is authoritative for nobody. BUG-055. |
| When | An explicit "record my pre-destroy baseline" action the student takes | Inferring the moment from "check 26 happened to be true" is what produced every hole below. |
| Overwrite policy | ALWAYS overwrite | A "only if absent" guard permanently disables 27 on every run after the first: an old baseline is trivially disjoint from today's live ids, so 27 passes without the student destroying anything. Strictly worse than the forgeable version, which at least required effort. |
| Key | Firebase uid | NOT slot and NOT OpenStack project id. The 30-slot pool is reclaimed and reassigned (`reclaim-idle-slots.py`), so either would hand a stale baseline to the next student who inherits that slot. A uid is never reused. |
| Where | bc1-local, `./lab-manager/data` bind mount | The container had NO writable mount but `docker.sock`, so anything written inside dies on every rebuild — and rebuilds happen on every grader change. Deliberately off the OpenStack API surface so a student's restricted app credential cannot reach it. |
| What is recorded | ONLY ids of networks and servers NAMED IN the student's own `stack.json` | "Everything owned" is not enough. The OpenStack project persists across the whole course, so leftover Lab 1-5 resources (`lab5-net`, `chain-vm`) satisfy an owned-only test. A student who presses the button once, early, out of curiosity would snapshot unrelated leftovers, and 27 would later compare against them and pass for a reason unconnected to the capstone — a false pass needing zero adversarial effort. |

**Two blockers that must land FIRST.**

1. `grade-for` must stop ignoring `CLOUD_CHECKS` (BUG-057). Moving 27 into `CLOUD_CHECKS` is
   correct, but that route builds its answer from `SANDBOX_CHALLENGES` alone, so the move would
   delete the capstone's anti-cheat from Dr. Hex's view — the channel a student is most likely
   to ask "am I done?" through. A false "you are done" from the tutor is worse than a false fail
   from the page.
2. The capture must NOT depend on array position. `CLOUD_CHECKS['openstack-cli']` is not sorted
   by id (it runs `...,23,26,24`) and gets reordered as routine housekeeping. Today every entry
   is a pure predicate, so order has never mattered; a side-effecting check would silently
   inherit a dependency on where it sits in an array literal. The capture calls the id-26
   predicate directly and explicitly instead.

**Page consequence.** The page must gain a visible checkpoint between "build" and "destroy".
It currently says "press Check My Work" exactly once, at the very end. Making the capture an
explicit student action is also the more honest pedagogy for a project whose thesis is that you
cannot fake a teardown — the student sees the baseline being taken.

**Verification bar.** The fix must be proven in BOTH directions, because this check has already
failed in both: an honest walkthrough must PASS 27, and cheat D (built, described, never
destroyed) must still be REJECTED by 27. `qc-lab.sh` stage 3 now enforces that every check id is
observed both passing and failing in a run, so "the cheat was rejected" can no longer be
mistaken for evidence a check works.

## Projects 2 and 3 (sequenced, not built)

- **P2 Harden** — idempotency under drift: mutate a resource by hand, applier detects and
  corrects it. Adds a reconcile loop to the applier.
- **P3 Translate** — same manifest, produce the mapping table to a second provider's
  primitives and a dry-run adapter. This is where Terraform is introduced, and where the
  "why this transfers" sections stop being prose and become the deliverable.
