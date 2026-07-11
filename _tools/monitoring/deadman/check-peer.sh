#!/bin/sh
# check-peer.sh — external dead-man's-switch checker. Runs on BC1 (user eq1) every
# 5 min via /etc/cron.d/hexworth-deadman. This is the "neon watches from bc1" half of
# a MUTUAL watch (the other half is check-bc1.sh, which runs on neon and watches bc1).
#
# Probes neon's monitoring health endpoints over the tailnet from bc1 (a DIFFERENT
# host) and, on sustained failure, pushes a CRITICAL message to bc1's own ntfy
# (topic hexworth-deadman) — a delivery path that does NOT depend on neon being up.
# This closes the gap the on-neon alerter cannot cover: neon dying takes its own
# alerter down with it. See MON-2 and _docs/operations/monitoring-alerting.md.
#
# Design: dead-simple curl + consecutive-failure counter. Idempotent, QUIET on success
# (no alert), and logs every decision to $LOG so a silent failure is still visible.
# POSIX sh, no bashisms. Safe to run by hand any time.
set -u

# --- neon monitoring health endpoints (Tailscale IP 100.65.122.90) --------------
# Prometheus is on host 9091 (Cockpit owns 9090 on neon); Alertmanager is 9093.
# NEON_NTFY is neon's OWN delivery ntfy — the container hexworth-alerts publishes
# through. It MUST be in the probe set (Nancy #1): if Prometheus + Alertmanager stay
# up but this ntfy dies (OOM, disk-full on its volume, bad image), the entire on-neon
# alert-delivery path is dead and only THIS off-neon check can catch it.
NEON_PROM="http://100.65.122.90:9091/-/healthy"
NEON_AM="http://100.65.122.90:9093/-/healthy"
NEON_NTFY="http://100.65.122.90:8090/v1/health"

# --- publish target: bc1's OWN ntfy ---------------------------------------------
# ntfy-deadman binds to the bc1 Tailscale IP (100.96.136.114), NOT 0.0.0.0 — so
# localhost:8090 is NOT listening; publish to the tailnet IP.
NTFY_BASE="http://100.96.136.114:8090"
NTFY="$NTFY_BASE/hexworth-deadman"

STATE_DIR="/home/eq1/hexworth-deadman/state"
COUNTER="$STATE_DIR/fail_count"
ALERTED="$STATE_DIR/alerted"        # presence = a DOWN alert is currently outstanding
LOG="$STATE_DIR/deadman.log"

# 3 consecutive failures at a 5-min cadence = ~15 min sustained before we alert.
# Filters transient blips. DESIGN TRADEOFF (Nancy #4): the counter resets on ANY
# single healthy probe, so a flapping neon (down 4 of every 5 checks) never reaches
# 3-in-a-row and never alerts. Accepted deliberately to avoid false-positive storms;
# a hard outage (the case this exists for) trips it cleanly. Revisit if flapping is
# ever observed in practice.
THRESHOLD=3

mkdir -p "$STATE_DIR"

ts() { date '+%Y-%m-%dT%H:%M:%S%z'; }
logline() { echo "$(ts) $1" >> "$LOG"; }

# probe <url> -> "ok" if HTTP 200 else "down". 8s timeout so a hung endpoint can't
# wedge the check past the cron interval.
probe() {
    code=$(curl -s -m 8 -o /dev/null -w '%{http_code}' "$1" 2>/dev/null)
    if [ "$code" = "200" ]; then echo ok; else echo down; fi
}

# publish <title> <priority> <tags> <body> — sends to bc1 ntfy AND logs the HTTP
# result (Nancy #3: a silent publish failure would reproduce the very "alerter can't
# report its own death" problem this project fixes, one layer down — so log it).
publish() {
    code=$(curl -s -m 8 -o /dev/null -w '%{http_code}' \
        -H "Title: $1" -H "Priority: $2" -H "Tags: $3" -d "$4" "$NTFY" 2>/dev/null)
    logline "PUBLISH '$1' -> HTTP ${code:-000}"
}

# read_count: robust to a missing, empty, or half-written counter file (Nancy #5) —
# an empty or non-numeric value must fall back to 0, else `count + 1` errors under set -u.
read_count() {
    c=$(cat "$COUNTER" 2>/dev/null)
    case "$c" in ''|*[!0-9]*) echo 0 ;; *) echo "$c" ;; esac
}

# Cap the log so permanent-infra append-forever can't grow unbounded (Nancy #4).
# Keep the last 500 lines once it passes 1000.
if [ -f "$LOG" ] && [ "$(wc -l < "$LOG" 2>/dev/null || echo 0)" -gt 1000 ]; then
    tail -n 500 "$LOG" > "$LOG.tmp" 2>/dev/null && mv "$LOG.tmp" "$LOG"
fi

# --- self-precheck (Nancy #5, reboot race) --------------------------------------
# If bc1's OWN ntfy is not reachable we cannot deliver an alert anyway, and it almost
# always means bc1's docker/tailnet is not fully up yet (e.g. mid-reboot). Skip this
# cycle WITHOUT incrementing the neon counter — otherwise a bc1 boot would false-
# positive as "neon down". Log the skip so a real local outage is still visible.
selfcode=$(curl -s -m 5 -o /dev/null -w '%{http_code}' "$NTFY_BASE/v1/health" 2>/dev/null)
if [ "$selfcode" != "200" ]; then
    logline "SKIP local deadman ntfy unreachable (HTTP ${selfcode:-000}) — not probing neon this cycle"
    exit 0
fi

prom=$(probe "$NEON_PROM")
am=$(probe "$NEON_AM")
ntfy=$(probe "$NEON_NTFY")

if [ "$prom" = ok ] && [ "$am" = ok ] && [ "$ntfy" = ok ]; then
    # Healthy. If a DOWN alert was outstanding, announce recovery exactly once.
    if [ -f "$ALERTED" ]; then
        publish "neon monitoring RECOVERED" "default" "white_check_mark" \
            "neon monitoring is back: Prometheus (9091), Alertmanager (9093), and the alert ntfy (8090) all healthy again from bc1."
        rm -f "$ALERTED"
        logline "RECOVERED neon healthy again (counter reset)"
    fi
    echo 0 > "$COUNTER"
    exit 0
fi

# At least one endpoint down — increment the consecutive-failure counter.
count=$(read_count)
count=$((count + 1))
echo "$count" > "$COUNTER"

which=""
if [ "$prom" = down ]; then which="Prometheus(9091)"; fi
if [ "$am" = down ]; then which="${which:+$which, }Alertmanager(9093)"; fi
if [ "$ntfy" = down ]; then which="${which:+$which, }alert-ntfy(8090)"; fi
logline "FAIL ${count}/${THRESHOLD} — ${which} not healthy from bc1"

# Cross the threshold once -> one CRITICAL push. ALERTED suppresses repeats until
# recovery resets it, so the phone gets one alert per outage, not a storm.
if [ "$count" -ge "$THRESHOLD" ] && [ ! -f "$ALERTED" ]; then
    publish "neon monitoring DOWN" "urgent" "rotating_light" \
        "neon monitoring unreachable for ${count} consecutive checks (~$((count * 5)) min): ${which} not answering /-/healthy from bc1. The on-neon alerter may be dead — investigate neon itself."
    touch "$ALERTED"
fi
exit 0
