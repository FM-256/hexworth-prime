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
| 27 | the rebuilt resources carry DIFFERENT ids than the pre-destroy export recorded (genuine rebuild) |
| 28 | applier is idempotent — running it twice changes nothing |

Check 27 needs the pre-destroy ids captured. The seed/exec path already writes evidence files
into the container (`~/notes/` pattern from the Cinder lab), so the export step writes
`~/project/before-ids.json` and check 27 compares against live state.

## Projects 2 and 3 (sequenced, not built)

- **P2 Harden** — idempotency under drift: mutate a resource by hand, applier detects and
  corrects it. Adds a reconcile loop to the applier.
- **P3 Translate** — same manifest, produce the mapping table to a second provider's
  primitives and a dry-run adapter. This is where Terraform is introduced, and where the
  "why this transfers" sections stop being prose and become the deliverable.
