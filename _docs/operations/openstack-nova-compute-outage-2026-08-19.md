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

**That check now exists** — `_tools/monitoring/probe/openstack-compute-probe.sh`, cron `*/2` on
bc2, exported via a node_exporter textfile collector (which had to be enabled: the unit shipped
without one, so there was nowhere for a service-level metric to land). Alerts in
`openstack-compute-alerts.yml`, loaded on neon. It reports `nova-compute` liveness and whether
placement can actually place a 1vcpu/128MB VM.

`openstack_token: up` on the bc1 probe still means only "Keystone answers HTTP" — that check was
never the problem, its description was. Read the bc2 metrics for launch capability.

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

## Confirmed resolved

The operator relaunched from the student session at 13:17:18Z and it succeeded — `server-a`
`ACTIVE` on `openstack-vm`, power state running, **ERROR count 0**, all three compute services up.

Worth recording why the screenshot was confusing: `student-03` had retried `server-a` four times
(Aug 18 23:36, Aug 19 12:17, 12:47, 12:49), deleting between attempts, so the ID in the report did
not match the ERROR instance visible to admin — the photographed one was already deleted. All four
attempts landed inside the outage window; the last failed at 12:49:32, **eight minutes before the
repair**. Nothing had been launched between the fix and the report, which is why "still broken"
and "already fixed" were both true-looking. Check the timestamps against the fix time before
concluding a repair did not hold.

## Second casualty of the same power loss: every guest stayed stopped

**Found 2026-08-19 by a user report**, a day after the compute fix, and it was a separate defect.
Six of seven student instances were `SHUTOFF`. Students returning to their persistent project
found a stopped server and no explanation.

Nova does not restart guests when the compute host boots. `resume_guests_state_on_host_boot`
defaults to **False**, so everything running when the power died came back stopped and stayed
stopped. Same shape as the missing `Restart=` policies: no auto-recovery, silent until somebody
trips over it.

**Telling a casualty from an intentional stop.** The discriminator is the `updated` timestamp, not
the status. All seven casualties changed at `2026-08-19T12:58:1x`, the moment nova-compute came
back and reconciled the guests it found stopped. Two other `SHUTOFF` instances
(`demo-instance`, `canary-admin-project`) last changed `2026-07-29` — stopped deliberately weeks
earlier. Starting those would have silently overridden somebody's intent, so they were left alone.

Fixed: the seven were started, and `resume_guests_state_on_host_boot = True` was written under
`[DEFAULT]` in **`/etc/nova/nova-cpu.conf`** — the file `devstack@n-cpu` actually loads. Putting it
in `nova.conf` would look right and do nothing.

⚠ `HTTP 202` from the start action means ACCEPTED, not started. A status check moments later
showed five still `SHUTOFF` and I nearly reported a partial failure; the log said
`num_task_powering-on: 7`. They were mid-transition. All seven reached `ACTIVE`. Same trap as
reading nova-compute's state before its heartbeat lands — wait for the transition, then judge.

## Emergency access, 2026-08-19, and why it was reverted

The operator network blocks the whole `tailscale.com` domain (controlplane, api and login all
reset while ordinary HTTPS works), so the admin node could not come online and bc2 — which is
tailnet-only — was unreachable. bc1 stays reachable over the cloudflared tunnel.

With explicit operator approval, `tcp:22` was added to the existing `bc1 -> bc2` grant, the work
was done through bc1, and the ACL was **restored byte-for-byte immediately after** (verified by
re-fetching and diffing, plus confirming `bc1 -> bc2:22` is blocked again while 9711/8080 still
work).

This is worth resisting by default. bc1 is the internet-facing host; bc2 holds the OpenStack admin
credential and the bridge secret, and the segmentation exists precisely to stop one reaching the
other. It was justified here only because a user-visible outage could not otherwise be fixed, and
it was reverted in the same session rather than left "temporarily" in place.

## Still open

- 9 instances remain `SHUTOFF` from the power-loss reboot. Nothing was deleted or restarted —
  that is an operator call.

## The compute check, and how it was proved

Verified end to end: probe -> textfile -> node_exporter -> prometheus -> rules loaded and healthy
(`hexworth_openstack_up{check="nova_compute"} = 1` queried from prometheus itself).

Both failure modes were tested WITHOUT taking compute down on live students:

```
parser fed a DOWN nova-compute fixture   -> exit 1   (detects the outage)
parser fed an UP fixture                 -> exit 0
probe pointed at an unreachable host     -> checked=0, i.e. BLIND, not DOWN
placement error document                 -> -1 (unknown), NOT 0
```

Those last two are the ones that matter. A probe that reports "down" when it simply cannot see
pages people at 03:00 for a rotated credential; a parser that reads a 404 as "0 candidates"
reports a full cluster when nothing is wrong. Both mistakes were made during this very incident
before the probe existed, which is why each has a dedicated test and a `_checked` metric.
