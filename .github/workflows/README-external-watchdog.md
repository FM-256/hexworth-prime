# External watchdog — setup and what it is for

## The gap it closes

Every other monitor Hexworth has runs **on-premises**: Prometheus, Alertmanager, Grafana, and
**both** ntfy instances live on neon and bc1. The mutual dead-man (neon ↔ bc1) is well built and
does its job — but both halves sit on the same power circuit.

On 2026-08-18 the site lost power twice. The monitoring stack went dark at exactly the moment it
was needed, and nobody was told anything. A watcher inside the failure domain does not report an
outage; it reports **nothing**, and nothing looks identical to healthy.

This workflow runs on GitHub's infrastructure. A total site outage is precisely when it still
works.

## Two things you must do once

**1. Set the repository secret.** The workflow refuses to run without it, deliberately — a
silently-unset alert channel is the failure this exists to prevent.

```
gh secret set NTFY_EXTERNAL_TOPIC --repo FM-256/hexworth-prime
# paste the topic name when prompted (it is NOT written down in this repo)
```

**2. Subscribe to that topic in the ntfy app on your phone**, using the **public ntfy.sh server**
— not the self-hosted ones. You already subscribe to `hexworth-alerts` and `hexworth-deadman`;
this is a third subscription, and the only one that reaches you when the site is dark.

> ⚠ The topic name is the *only* access control on a public ntfy.sh topic — anyone who knows it
> can read and post to it. That is why it is a repository secret and not in this file, and why
> the generated name is random rather than something guessable like `hexworth-alerts`.

## What it checks, and why those response codes

Only **public** endpoints, because it has no tailnet access and must never be given any. It sees
exactly what a student on the internet sees.

| Check | Expect | Why |
|---|---|---|
| `hexworth.com/` | 200 | the site is serving |
| `sandbox/health` | 200 | the lab API is alive |
| `sandbox/list` | **401** | alive **and enforcing auth**. A 200 here is a security incident, not health. |

It cannot see OpenStack, PXE, the CIFS shares, or any host metric — the on-prem service probe
(`_tools/monitoring/probe/`) covers those. This one answers a narrower and more important
question: *is Hexworth reachable from the outside world at all.*

## ⚠ This is a poller, not yet a true dead-man's switch

If the site goes down, this fires. **If this stops running** — workflow disabled, Actions quota
exhausted, repo archived — nothing fires, and the silence looks like health. That is the same
failure it was built to fix, relocated one level outward.

Closing it properly needs an external endpoint that alerts when **pings stop**, rather than when
a check fails:

```
site up  →  workflow succeeds  →  pings healthchecks.io  →  quiet
site down OR workflow stopped  →  no ping  →  healthchecks.io alerts you
```

A free healthchecks.io tier covers this. Until then, the honest statement is: this detects a site
outage, not its own death.

## Testing it

`workflow_dispatch` is enabled, so it can be run on demand from the Actions tab without waiting
for the schedule. A failing run also exits non-zero so it shows up red there — the notification
is not the only signal.

Schedule is `*/10`, which is GitHub's practical floor. Delays of several minutes are normal and
expected; this is a safety net, not a latency-sensitive alarm.
