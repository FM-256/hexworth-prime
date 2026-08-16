# Fleet Monitoring & Alerting (neon / bc1 / bc2)

**TLDR:** The self-hosted box fleet (neon/bc3, bc1, bc2) is monitored by a
Prometheus + Grafana + Loki stack on **neon** at `/home/eq/hexworth-monitoring`,
mirrored in this repo at `_tools/monitoring/`. As of 2026-07-10 it also has
**alerting**: alert rules → Alertmanager → a formatting relay → self-hosted
**ntfy**, which pushes to the operator's devices over Tailscale. Before that date
the stack collected host metrics only, had no alert rules, no Alertmanager, and
Prometheus had silently been detached from its network for ~9 days — which is how
a crash-looping redis went unreported for ~80 days. This doc is the operating
reference so that does not recur.

## Why this exists (the incident)

On 2026-07-10 the `hexworth-redis` container was found crash-looping — Docker
`RestartCount` ~12,942 over ~80 days — with no alert ever raised. Investigation
found the monitoring stack was collecting but not alerting, and was in fact
blind:

1. **Prometheus was detached from its Docker network** for ~9 days. Cockpit's
   `cockpit.socket` (systemd) claimed host port **9090** on a reboot; Prometheus
   could not bind its published `9090:9090` and ended up on no network, so 100%
   of scrapes failed and every Grafana panel showed "No data". Nothing watched
   the watcher, so nobody noticed.
2. **No container-level metrics.** Only host `node_exporter` was scraped, so a
   crash-looping container was not even a metric.
3. **No alert rules and no Alertmanager.** Even a bad metric reached no one.

## Architecture

| Component | Role | Exposure |
|-----------|------|----------|
| `prometheus` | scrape + rule eval | host **9091** (remapped; 9090 is Cockpit's) |
| `alertmanager` | routing/dedup/notify | `<bc3-addr>:9093` (Tailscale only) |
| `docker-restart-exporter` | container restart/health from the Docker API | internal 9101 |
| `webhook-ntfy` | formats Alertmanager JSON → readable ntfy | internal 9099 |
| `ntfy` | notification bus (operator subscribes) | `<bc3-addr>:8090` (Tailscale only) |
| `node_exporter` | host CPU/mem/disk (neon; bc1/bc2 scraped by IP) | 9100 |
| `grafana` | dashboards | host 3000 |
| `loki` / `promtail` | log aggregation | 3100 |

Signal chain: **metric → Prometheus rule → Alertmanager → webhook-ntfy relay →
ntfy → operator device.**

### Why a custom Docker exporter instead of cAdvisor

neon runs Docker with the **containerd image store** (Storage Driver
`overlayfs`, cgroup v2). cAdvisor enriches containers by reading the legacy
`/var/lib/docker/image/<driver>/layerdb/` layout, which does not exist under the
containerd store — so cAdvisor drops every container and reports only the root
cgroup. `config/docker-restart-exporter.py` reads container state straight from
the Docker Engine API over the unix socket (`RestartCount`, running, restarting,
health), which is immune to the storage-driver layout and is the exact signal
(`RestartCount`) that was 12,942 on redis. **Gotcha:** in the Docker inspect
payload `RestartCount` is a **top-level** field, not under `State`.

## Alert rules (`config/rules/alerts.yml`)

| Alert | Expression (summary) | Severity |
|-------|----------------------|----------|
| `ContainerCrashLooping` | `increase(docker_container_restart_count[15m]) > 3` for 2m | critical |
| `ContainerRestarting` | `docker_container_restarting == 1` for 2m | critical |
| `ContainerUnhealthy` | `docker_container_health{status="unhealthy"} == 1` for 5m | warning |
| `ScrapeTargetDown` | `up == 0` for 5m (self-reports the stack going blind) | critical |
| `DiskAlmostFull` | `>85%` full, filesystems `>5GB` only, for 10m | warning |
| `HostMemoryHigh` | `>90%` for 10m | warning |

Prometheus scrapes **itself and Alertmanager** too, so a failure of the alerting
chain one layer up (`up{job="prometheus"|"alertmanager"} == 0`) is caught.

## Operating it

**Subscribe to alerts (do this once, per device):** install the ntfy app (or open
in a browser) and subscribe to topic `hexworth-alerts` at
`http://<bc3-addr>:8090` while on Tailscale. That is where alerts land.

**Change any config:** edit under `_tools/monitoring/config/` in this repo, then:
```
# stage + validate BEFORE touching live (an unparseable rule file refuses
# Prometheus startup and takes the whole stack down):
tar -cf - . | ssh neon 'rm -rf ~/hexworth-monitoring-staging && mkdir -p ~/hexworth-monitoring-staging && tar -C ~/hexworth-monitoring-staging -xf -'
ssh neon 'cd ~/hexworth-monitoring-staging && \
  docker run --rm --entrypoint promtool -v "$PWD/config":/etc/prometheus prom/prometheus:latest check config /etc/prometheus/prometheus.yml && \
  docker run --rm --entrypoint promtool -v "$PWD/config/rules":/rules prom/prometheus:latest check rules /rules/alerts.yml && \
  docker run --rm --entrypoint amtool -v "$PWD/config":/cfg prom/alertmanager:latest check-config /cfg/alertmanager.yml'
# archive live, copy validated files into ~/hexworth-monitoring, then:
ssh neon 'cd ~/hexworth-monitoring && docker compose up -d'
# config-only edits (prometheus.yml / rules) are bind-mounted and need a reload,
# NOT just a compose up (which won't restart an unchanged service):
ssh neon 'docker exec prometheus wget -qO- --post-data="" http://localhost:9090/-/reload'
```

**Change notification channel (Discord/Slack/email):** edit
`config/alertmanager.yml` `receivers:` — `slack_configs`/`email_configs` are
native; the current `webhook_configs` points at the ntfy relay. One-block change.

**Health check the stack:**
```
ssh neon 'docker exec prometheus wget -qO- localhost:9090/api/v1/targets | grep -o "\"health\":\"[a-z]*\""'  # all should be "up"
ssh neon 'docker exec prometheus wget -qO- localhost:9090/api/v1/rules'  # rule health "ok"
```

## Known gotchas

- **Port 9090 belongs to Cockpit** on neon. Prometheus UI is on **9091**. Do not
  move it back to 9090 or it will silently fail to bind and detach from its
  network (the original incident).
- **Config edits need a reload**, not just `compose up` — bind-mounted files
  change in place and Prometheus does not auto-reload.
- **cAdvisor does not work here** (containerd image store). Use the Docker-API
  exporter.

## Mutual dead-man's-switch (MON-2, done 2026-07-11)

The fate-sharing gap below is **closed**. neon and bc1 now watch each other over the
tailnet, each alerting through its own ntfy so a dead host cannot suppress its own
alarm:

- **bc1 → neon:** `check-peer.sh` (5-min cron.d on bc1) probes neon's Prometheus
  (9091), Alertmanager (9093), **and neon's own alert ntfy (8090)**; 3 consecutive
  failures push CRITICAL to a **second ntfy on bc1** (`ntfy-deadman`, topic
  `hexworth-deadman`). Delivery does not traverse neon — proven by a live failover
  test (stopped neon Prom+AM, message landed on the bc1 topic while neon was down).
- **neon → bc1:** `check-bc1.sh` (5-min cron.d on neon) probes bc1's deadman-ntfy
  health; 3 failures push CRITICAL to neon's existing `hexworth-alerts` (no new phone
  subscription needed for this direction).

Both use a self-precheck (skip, don't false-alert, if the local ntfy isn't up — e.g.
mid-reboot; docker is `enabled` on both hosts so it self-heals), one-alert-per-outage
suppression, and a decision log at each host's state dir. Files + full runbook:
`_tools/monitoring/deadman/` (README covers install, the two-direction failover test,
and the honest residuals: live-host-dead-cron and both-hosts-down are out of scope).

**Owner action pending:** subscribe the S25 to a SECOND ntfy — server
`http://<bc1-addr>:8090` (bc1 Tailscale IP), topic `hexworth-deadman` — this is
the channel that fires only when neon's monitoring itself is dark.

## Known follow-ups (not yet done)

- **ntfy off-Tailscale / phone push anywhere:** currently reachable only on
  Tailscale. A Cloudflare Access tunnel (like bc1) would expose it safely for
  push when off-network.
- **ntfy auth:** runs `read-write` default access with no user auth, acceptable
  only because it binds to the Tailscale interface. Adding an ntfy user + token
  is the hardening step if it is ever tunneled publicly.
- **Resolved notifications** arrive when a firing series ages out (up to ~15m for
  `increase()`-based rules); the formatting path is tested but the natural
  resolve was not watched end-to-end.

## Related

- **Admin-facing KBA** (what it is + how to subscribe to alerts): Confluence "Fleet
  Infrastructure Monitoring & Alerting — Prometheus, Alertmanager & ntfy", page id
  `43417601` under Operations and Procedures.
- **Sprint MON-2** — mutual dead-man's-switch, DONE 2026-07-11 (see section above);
  files in `_tools/monitoring/deadman/`. MON-1 is the original neon build.
- Website monitor (separate system): Confluence "Runtime Monitor, Site-Health &
  Alerting — Runbook", page id `33849345`.
- Infra inventory: `_tools/INTRO.md`, memory `reference_sandbox_infrastructure.md`
- bc1 CF tunnel pattern (model for tunneling ntfy): `reference_bc1_ssh_cf_tunnel.md`
