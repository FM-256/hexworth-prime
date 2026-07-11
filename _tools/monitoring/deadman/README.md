# Mutual dead-man's-switch (MON-2) — neon and bc1 watch each other

## The gap this closes

The primary monitoring stack — Prometheus, Alertmanager, and the `hexworth-alerts`
ntfy — all run **on neon**. That stack watches everything *except itself*: if neon
dies, its alerter dies silently with it and nobody is told. An alerter that cannot
report its own death is a blind spot.

Putting a watcher only on bc1 would just *relocate* that blind spot to bc1 (if bc1
dies, its watcher goes dark). So this is a **mutual** watch — each host probes the
other over the tailnet and alerts through **its own** ntfy, a delivery path that does
not depend on the host being watched:

```
   bc1 (user eq1)                                    neon (user eq)
  ┌────────────────────────┐                    ┌────────────────────────┐
  │ check-peer.sh  (5-min) │ ─ probe 9091/9093/─▶│ Prometheus + Alertmgr  │
  │                        │        8090         │  + neon's own ntfy      │
  │  neon down? → push ───┐ │                    │                        │
  │ ntfy-deadman :8090   ◀┘ │◀── probe :8090 ── │ check-bc1.sh   (5-min) │
  │  topic hexworth-deadman│                    │  bc1 down? → push ───┐  │
  └────────┬───────────────┘                    │ ntfy :8090          ◀┘  │
           │                                     │  topic hexworth-alerts │
           ▼ (neon-down alerts)                  └───────────┬────────────┘
      📱 Frank's S25  ◀──────────────────────────────────────┘ (bc1-down alerts)
        subscribes BOTH: hexworth-deadman (bc1) + hexworth-alerts (neon)
```

- **neon dies** → bc1's `check-peer.sh` pushes to `hexworth-deadman` (on bc1).
- **bc1 dies** → neon's `check-bc1.sh` pushes to `hexworth-alerts` (on neon, existing sub).

The one case NOT covered is neon **and** bc1 dying simultaneously — that is a
site-wide outage Frank would notice by other means, and is out of scope for MON-2.

## Files

| File | Host | Role |
|------|------|------|
| `deadman-compose.yml` | bc1 | Second ntfy (`ntfy-deadman`, topic `hexworth-deadman`), bound to bc1 Tailscale IP `100.96.136.114:8090`. Distinct compose project `hexworth-deadman` + distinct volumes so it never collides with the `hexworth-sandbox` (lab-manager) stack. |
| `check-peer.sh` | bc1 | Probes neon Prometheus (9091) + Alertmanager (9093) `/-/healthy` **and neon's own alert-delivery ntfy (8090)** — the ntfy is in the set because the delivery container can die while Prom/AM stay up. 3 consecutive failures → one CRITICAL to `hexworth-deadman`; one "recovered" on return. |
| `check-bc1.sh` | neon | Probes bc1's deadman-ntfy health; 3 consecutive failures → one CRITICAL to `hexworth-alerts`; one "recovered" on return. |
| `cron/hexworth-deadman.cron` | bc1 | `/etc/cron.d` drop-in (user eq1). |
| `cron/hexworth-watch-bc1.cron` | neon | `/etc/cron.d` drop-in (user eq). |

## Why cron.d drop-ins, not `crontab -e` (Nancy #1)

bc1's user crontab is **full of critical jobs** (scraper farm, the daily Hexworth
Prime nexus quality scan, JunkTrunk pipelines, a nightly Firebase deploy). The naive
`crontab -l | grep -v X | crontab -` install idiom silently **wipes the entire
crontab** if `crontab -l` ever fails transiently. So we install a `/etc/cron.d/`
drop-in file instead — it never reads or rewrites the user crontab, so it cannot
disturb those jobs. Both hosts have passwordless sudo for the `install` step.

## Install

**bc1 (neon-watcher + delivery ntfy):**
```sh
ssh bc1-cf 'mkdir -p /home/eq1/hexworth-deadman/state'
scp _tools/monitoring/deadman/deadman-compose.yml _tools/monitoring/deadman/check-peer.sh \
    bc1-cf:/home/eq1/hexworth-deadman/
ssh bc1-cf 'chmod +x /home/eq1/hexworth-deadman/check-peer.sh && \
  cd /home/eq1/hexworth-deadman && \
  docker compose -p hexworth-deadman -f deadman-compose.yml up -d && \
  curl -s -o /dev/null -w "ntfy-deadman /v1/health: %{http_code}\n" http://100.96.136.114:8090/v1/health'
# cron.d drop-in (does NOT touch the user crontab)
scp _tools/monitoring/deadman/cron/hexworth-deadman.cron bc1-cf:/tmp/
ssh bc1-cf 'sudo install -m 0644 /tmp/hexworth-deadman.cron /etc/cron.d/hexworth-deadman && rm /tmp/hexworth-deadman.cron'
```

**neon (bc1-watcher; reuses neon's existing ntfy):**
```sh
ssh neon 'mkdir -p /home/eq/hexworth-watch-bc1/state'
scp _tools/monitoring/deadman/check-bc1.sh neon:/home/eq/hexworth-watch-bc1/
ssh neon 'chmod +x /home/eq/hexworth-watch-bc1/check-bc1.sh'
scp _tools/monitoring/deadman/cron/hexworth-watch-bc1.cron neon:/tmp/
ssh neon 'sudo install -m 0644 /tmp/hexworth-watch-bc1.cron /etc/cron.d/hexworth-watch-bc1 && rm /tmp/hexworth-watch-bc1.cron'
```

## Owner action (one-time)

Frank subscribes his S25 to a **SECOND** ntfy subscription (in addition to the
existing `hexworth-alerts`):

- Server: `http://100.96.136.114:8090` (bc1 Tailscale IP) · Topic: `hexworth-deadman`

`hexworth-alerts` (neon) already covers the bc1-down direction — no change there.

**Delivery-path notes (so there are no hidden assumptions):**
- The tailnet is single-owner — Frank's own devices only (bc1, bc2, his Windows/Linux,
  the S25). neon is **not** a DERP relay/subnet-router/exit-node for this tailnet
  (`tailscale status`: the phone reaches bc1 **direct** on the home LAN), so the
  bc1→phone path genuinely does not traverse neon. The no-auth read-write ntfy on the
  tailnet is acceptable at that trust level (same posture as the primary neon ntfy),
  but note: anyone on the tailnet *could* publish a spoof "RECOVERED" — acceptable for
  a 5-device personal tailnet, revisit if the tailnet ever widens.
- When the phone is off the home LAN (cellular), the ntfy Android app's delivery
  depends on its own transport (instant-delivery persistent connection, or FCM). Either
  is neon-independent; just be aware the phone buzzing also needs the phone's own
  internet, which is true of any push system.

## Failover test (proves BOTH directions)

```sh
# --- neon-down direction ---
ssh neon 'docker stop prometheus alertmanager'      # take neon monitoring down
ssh bc1-cf '/home/eq1/hexworth-deadman/check-peer.sh; \
  /home/eq1/hexworth-deadman/check-peer.sh; /home/eq1/hexworth-deadman/check-peer.sh'  # 3 fails
ssh bc1-cf 'curl -s "http://100.96.136.114:8090/hexworth-deadman/json?poll=1"'  # confirm DOWN msg landed
ssh neon 'docker start prometheus alertmanager'     # restore; next check sends RECOVERED

# --- bc1-down direction (simulate by stopping bc1's deadman ntfy only — never the
#     lab-manager stack) ---
ssh bc1-cf 'docker stop ntfy-deadman'
ssh neon 'S=/home/eq/hexworth-watch-bc1/check-bc1.sh; $S; $S; $S'                # 3 fails
ssh neon 'curl -s "http://100.65.122.90:8090/hexworth-alerts/json?poll=1"'      # confirm DOWN msg
ssh bc1-cf 'docker start ntfy-deadman'              # restore; next check sends RECOVERED
```

## Operate / troubleshoot

```sh
# bc1 side
ssh bc1-cf 'docker ps --filter name=ntfy-deadman; tail -n 20 /home/eq1/hexworth-deadman/state/deadman.log'
ssh bc1-cf 'cat /home/eq1/hexworth-deadman/state/fail_count 2>/dev/null'   # 0 = healthy
# neon side
ssh neon 'tail -n 20 /home/eq/hexworth-watch-bc1/state/watch-bc1.log'
ssh neon 'cat /home/eq/hexworth-watch-bc1/state/fail_count 2>/dev/null'
```

Both checkers log every decision (probe result, publish HTTP code, skip-on-local-outage)
to their state-dir log, so a silent cron/publish failure is still visible on inspection.

## Known residuals (stated honestly, not swept under)

1. **Live-host-but-dead-cron** is not caught: each reverse probe verifies the *host* is
   up (ntfy health), not that the peer's checker cron is actually firing. Host death —
   the primary case — is caught; a hung cron on a live host is a narrower, smaller gap.
2. **Both hosts down at once** is out of scope (site-wide outage, noticed otherwise).
3. **Flapping** (down 4-of-5 checks, never 3-in-a-row) does not alert — deliberate, to
   avoid false-positive storms on a jittery link. Revisit if observed.
