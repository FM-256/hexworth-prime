# Service monitor — asking whether things WORK

**Built 2026-08-18**, after two outages in one day that every existing check reported as healthy.

> Node addresses and the ntfy topic are NOT in this file. This repo is PUBLIC.
> Config lives in `/etc/default/hexworth-probe` on bc1; the topic is a GitHub repository secret.

## Why host monitoring was not enough

| Outage | What every check said | What students experienced |
|---|---|---|
| Tailnet ACL closed the OpenStack API for 4 days | lab pages 200 · sandbox API 200 · host up 28 days · bridge logging success · all containers healthy | every live lab hung on the first command |
| Power loss left the DevStack VM `shut off` | bc2 rebooted cleanly · every systemd unit green | the entire cloud was down |

Both are the same shape: **the layer below reported healthy.** Nothing asked the student's
question, so nothing alerted. Neither outage was detected by monitoring — one was reported by the
operator, the other found while looking at something else.

## Two pieces, deliberately in different failure domains

```
  ON-PREM PROBE                          OFF-SITE WATCHDOG
  bc1, every 2 min                       GitHub Actions, every 10 min
  ↓ textfile collector                   ↓ public endpoints only
  node_exporter :9100                    ↓
  ↓ scraped by                           ntfy.sh (public)  →  phone
  prometheus on neon  →  alerts  →  self-hosted ntfy  →  phone
```

The on-prem probe sees everything but dies with the site. The off-site watchdog sees only what
the internet sees but survives the site going dark. Neither alone is sufficient.

## What the probe checks, and what "good" means

`_tools/monitoring/probe/service-probe.sh`, installed on bc1, cron `*/2`.

| Check | Healthy = | Note |
|---|---|---|
| `site` | 200 | hexworth.com serving |
| `sandbox_api` | 200 | lab API alive |
| `sandbox_auth_enforced` | **401** | alive **and** refusing anonymous access. A 200 here is a security incident, not health. |
| `keystone` | any HTTP response | 300 is correct for version discovery. Demanding 200 would report a permanent false outage. |
| `openstack_token` | token issues | **the check that would have caught both outages** — proves the whole chain: tailnet grant → socat → VM → keystone |
| `pxe` | nginx autoindex on **:8080** | asserts index CONTENT, not just "something answered" |
| `neon_share` | mounted **and** listable | a hung mount counts as down |

### The design rule that matters most

Every check emits **two** metrics:

- `hexworth_probe_up` — the verdict
- `hexworth_probe_checked` — did we actually get an answer?

Every alert is gated on `checked == 1`. A prober whose own network breaks must not page about a
healthy platform; a few false pages and people stop reading alerts. "We are blind" gets its own
lower-urgency alert (`ProbeCannotCheck`), because it is a real condition — just not the same
condition as "it is down".

`ProbeStopped` fires when metrics go stale. **Silence is what actually killed monitoring on
2026-08-18** — a monitor that has stopped reporting looks exactly like one reporting healthy.

## ⚠ A detector that accepted the wrong page

The first PXE check grepped the response for `images|menus|kickstart`. Aimed at hexworth.com it
**passed**, because the site's HTML contains `/assets/images/` paths. It would have reported PXE
healthy while never reaching it.

A detector that accepts the wrong target is worse than no detector: it converts an outage into a
green light. It now requires the nginx autoindex signature, and both directions are verified —
**down** on the wrong page, **up** on the real one.

The general rule: **point every new check at something that should FAIL, and confirm it does.**
A check that has never failed has not been tested.

## ⚠ Second casualty of the 2026-08-14 segmentation

Found while wiring this up: **prometheus had been unable to scrape bc1 or bc2 for four days.**
That change closed `*:9100`, with the note *"No monitoring rule is needed: hexclass
prometheus.yml scrapes only localhost"* — which checked the wrong host. The active prometheus
runs on **neon** and scrapes over the tailnet.

Same change, same class of error as the `8080` omission that broke the labs: **a port closed
without checking who was using it.** Both now granted, narrowly and by source.

## Verification

- cron confirmed firing at `:40 :42 :44` — every 2 minutes
- `7/7` checks report `checked=1` under cron's own environment (a missing config would show
  `checked=0`, which is what that metric is for)
- 7 probe series present in prometheus, 9 alert rules loaded, 0 firing
- both `bc1` and `bc2` scrape targets recovered to `up`

> A misread worth recording: the metric timestamp "not advancing" over a 100-second sample looked
> like staleness. It was not — a 2-minute cycle sampled inside one window shows no movement. The
> conclusive evidence was the cron log plus an age of 6s immediately after a run.

## ⚠ Still a poller, not a true dead-man's switch

The external watchdog fires when the **site** goes down. If the **watchdog** stops — workflow
disabled, Actions quota, repo archived — nothing fires and the silence reads as health. That is
the same failure it was built to fix, relocated one level outward.

Closing it needs a free healthchecks.io-style endpoint that the workflow pings on success, and
which alerts when the pings stop:

```
site up   → workflow succeeds → ping sent    → quiet
site down OR workflow dead    → no ping      → external service alerts you
```

## Operator setup still owed

1. `gh secret set NTFY_EXTERNAL_TOPIC --repo FM-256/hexworth-prime`
2. Subscribe to that topic in the ntfy app on the **public ntfy.sh server** — a third
   subscription alongside `hexworth-alerts` and `hexworth-deadman`, and the only one that
   reaches you when the site is dark.

Until step 1 is done the workflow fails loudly rather than silently, by design.
