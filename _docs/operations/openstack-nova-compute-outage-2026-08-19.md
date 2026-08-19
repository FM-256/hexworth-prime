# nova-compute was dead for 15 hours and every monitor was green

**2026-08-19.** Students could not launch instances. `nova-compute` had been `failed` since
21:29:28 UTC the previous evening — 15 hours — while the service probe reported all seven checks
up the entire time.

## What students saw

```
server-a   ERROR   "No valid host was found. There are not enough hosts available."
```

Nova had a scheduler, two conductors, and healthy network agents. It had no compute service, so
there was nothing to schedule onto.

## Root cause: a startup race with no retry

```
nova-compute[1217]: ERROR nova keystoneauth1.exceptions.discovery.DiscoveryFailure:
  Could not find versioned identity endpoints... Unable to establish connection to
  http://<vm>/identity: [Errno 111] ECONNREFUSED
devstack@n-cpu.service: Main process exited, code=exited, status=1/FAILURE
```

At boot `nova-compute` came up before Apache was serving `/identity`, got `ECONNREFUSED`,
and exited 1. Nothing restarted it. Identity came up seconds later and stayed healthy — the
dependency it needed was available almost immediately, and would have been there on any retry.

**There was no retry, because no devstack unit had one.** All 20 `devstack@*.service` files
shipped without a `Restart=` policy, so *any* transient dependency failure at boot is permanent
until a human notices. `n-cpu` is simply the one that lost the race this time; `keystone`,
`placement-api`, `g-api` and 16 others were equally exposed.

## Why the monitor did not catch it

`_tools/monitoring/probe/service-probe.sh` has a check named `openstack_token` whose comment
claims it is *"the check that would have caught BOTH of the 2026-08-18 outages, and the only one
that proves the whole chain"*. It does not issue a token. It runs:

```
docker run --rm --network sandbox-net "$img" curl -sS -o /dev/null -w '%{http_code}' "$KEYSTONE"
```

— an unauthenticated GET against the Keystone URL, passing on any 1xx-5xx response. Keystone was
genuinely healthy throughout, so the check was genuinely green while the thing it claimed to
prove was false. **The check is named for a capability it never exercises.** That is the same
defect class the probe was built to fix: a layer below reporting healthy while the student's
actual question — *can I launch a lab?* — is answered no.

A check that proved this would have to authenticate and read `os-services`, or ask placement for
allocation candidates. Both need credentials, which bc1 does not hold. bc2 does
(`/home/eq1/openstack-stage1/admin-auth.env`) and is already scraped by Prometheus, so the honest
home for a compute-liveness check is a bc2-side textfile collector, not bc1.

**Until that exists, treat `openstack_token: up` as meaning "Keystone answers HTTP", nothing more.**

## Fix applied

1. `sudo systemctl reset-failed devstack@n-cpu && sudo systemctl start devstack@n-cpu`
2. Drop-ins at `/etc/systemd/system/devstack@<unit>.service.d/restart.conf` for **all 20** units:
   `Restart=on-failure`, `RestartSec=15`, `StartLimitIntervalSec=600`, `StartLimitBurst=10`.
   Drop-ins, not edits — the original unit files are untouched.
   `on-failure` rather than `always` so a deliberate `systemctl stop` still stops the service.

Verified by breaking it on purpose rather than by reading the config:

```
before: active, pid=107281
kill -9 107281
t+3s : activating
t+23s: active pid=108516      <- self-healed; previously this was a permanent outage
```

Then end to end: `nova-compute=up`, `placement_candidates=1` (the scheduler can place a VM).

## A measurement trap worth remembering

Mid-diagnosis, placement appeared to report **0 allocation candidates** despite a hypervisor with
9/12 vCPU used and 17.7 GB free. That looked like a second, deeper fault. It was not — the
`/placement/allocation_candidates` endpoint requires a microversion header, and without it returns
**404**, which the parser read as an empty candidate list:

```
no header  -> {"errors":[{"status":404,...}]}          read as "0 candidates"
1.38       -> 1 candidate
```

An error response parsed as valid-but-empty data reads exactly like a real capacity failure. Check
the query before believing the answer.

## Access, for next time

```
ssh -i /home/eq1/openstack-stage1/stage1_key stack@<vm-ip>        # from bc2 only
```

bc1 cannot reach the VM on 22 (tailnet grants cover the bridge and API ports only), and bc2 has no
guest agent and had never SSH'd to the VM. The key path is recorded in
`_docs/operations/openstack-sandbox-scoping.md:292`; searching that file first would have saved a
detour through `virsh`, port scans and credential hunting.

## Still open

- The bc2-side compute-liveness check described above does not exist yet.
- 9 instances are `SHUTOFF` and 1 is `ERROR` (`server-a`, from the failed scheduling). Nothing was
  deleted or restarted — that is an operator call.
