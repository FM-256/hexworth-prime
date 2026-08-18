# OpenStack labs timing out — tailnet ACL omission (2026-08-14 → 2026-08-18)

**Status:** RESOLVED 2026-08-18. Verified by running a lab to completion.
**Duration:** ~4 days.
**Blast radius:** every `-live` OpenStack lab (neutron, cinder, secgroup, rescue, launch-chain,
advanced-ops, launch-vm). Students could start a lab and never complete one.

> Node addresses, the ACL text and the pool credentials are NOT in this file. This repo is
> PUBLIC. They live in `~/hexworth-infra-private/` — see `tailnet-security-2026-08-14.md` and the
> archived `tailscale-acl-LIVE-*.hujson`.

## Symptom

Students reported the labs "timing out". Everything a diagnostic would normally check was green:

| Layer | State during the outage |
|---|---|
| Lab pages on prod | 200, ~1s |
| `sandbox.hexworth.tech` API | `/health` 200; correct 401s in ~1s |
| Sandbox host (`<bc1>`) | up 28 days, load 0.07, 9 containers |
| Identity bridge | **working** — slots assigned, "personal cloud injected" in logs |
| Container launch | **succeeded** — terminal opened normally |
| Any `openstack` command | **hung until the CLI gave up** |

## Root cause

The tailnet segmentation applied 2026-08-14 granted `<bc1> → <bc2>` **one port**: `tcp:9711`, the
identity bridge. It never granted `tcp:8080`, the OpenStack API.

```jsonc
// before
"ip": ["tcp:9711"],
// after
"ip": ["tcp:9711", "tcp:8080"],
```

**Why it presented as a timeout rather than an error.** Tailscale DROPS traffic that no grant
permits; it does not reject it. A drop is indistinguishable from a slow server, so every layer
reported healthy and the failure surfaced only as a hang inside the lab.

**Why the labs still launched.** The bridge (9711) was granted, so slot assignment, credential
injection and container start all worked perfectly. The student got a working terminal and a
valid project. Only the first `openstack` command revealed anything was wrong. The lab-manager
log showed students relaunching 2–3 times each, which is the signature of this shape of failure:
the visible part works, so users assume they did something wrong.

## Diagnostic trap, recorded because it cost time

`<bc2>` answered ICMP but hung on **every** TCP port over the tailnet — including SSH. That reads
as a wedged host, and it was reported as one. **It was not.** `<bc2>` was up 4 weeks at 3% disk
with the OpenStack VM healthy; from `<bc2>` itself the full path returned HTTP 300 in 6ms.

The tell: the LAN address answered SSH instantly while the tailnet address did not. **When one
network path fails and another succeeds to the same host, the host is not the problem.** Testing
the tailnet path alone produced a confident and wrong diagnosis that would have led to power-
cycling a working machine serving live sessions.

## Fix

1. Fetch the LIVE policy from the Tailscale API and archive it. **The live policy differed from
   the local working copy** — editing the local file would have deployed stale policy alongside
   the fix.
2. Add `tcp:8080` to the existing `<bc1> → <bc2>` grant. Anchor the edit on the whole
   `src`/`dst`/`ip` block, not on the string `tcp:9711`, and refuse rather than guess if that
   block is not found.
3. Validate against `/acl/validate` before applying. It runs the `tests` block and refuses a
   policy that breaks admin SSH.
4. `POST` to `/acl`.
5. Verify from inside a real sandbox container, not from a workstation.

## Verification

A full lab run in an unclaimed pool slot, after the fix:

```
auth (token issue)              1s   ok
create network                  4s   ok
create subnet                   5s   ok
create router                   3s   ok
router -> external gateway      9s   ok
router += subnet                7s   ok
create security group           2s   ok
sg rule SSH 22 / ICMP           3s   ok
boot m1.nano (cirros 0.6.3)     3s   ok
server ACTIVE                  20s   ok, address assigned
```

Read-only checks alone were NOT sufficient: they proved keystone answered, not that nova could
schedule. The boot is the check that matters.

## Quota note — not a fault

Pool projects carry **1 instance / 1 core / 192 MB RAM**. Only `m1.nano` (192 MB) fits;
`m1.tiny` at 512 MB does not. This is deliberate and the lab documents it explicitly
(`cloud-openstack-launch-vm.lab.html:995`). All 35 flavor references across the OpenStack labs
are `m1.nano`. Do not "fix" this quota.

## Follow-ups

- **A pre-flight check before handing the student a terminal.** The launcher currently reports
  success for a lab that cannot work. One keystone call before the terminal opens would turn a
  silent hang into "the cloud is unreachable — this is not your fault".
- **A monitor for `<bc1> → <bc2>:8080`.** Nothing noticed for four days. The deadman watches
  hosts; this was a path between two healthy hosts.
- **Revoke the Tailscale API access token** created 2026-08-14. It can rewrite network policy and
  was used from a laptop to apply this fix. Already listed as open in
  `tailnet-security-2026-08-14.md`.
- **Any future tailnet policy change should be followed by one lab run**, not a port check.
