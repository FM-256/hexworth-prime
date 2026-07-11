#!/bin/sh
# check-bc1.sh — reverse half of the mutual dead-man's-switch. Runs on NEON (user eq)
# every 5 min via /etc/cron.d/hexworth-watch-bc1. Watches BC1's liveness so that if
# bc1 dies, its half of the watch (check-peer.sh) going dark is itself noticed.
#
# WHY: check-peer.sh on bc1 covers "neon died". But if BC1 dies, check-peer.sh stops
# running and nobody is told — the blind spot would just relocate to bc1 (Nancy #2).
# This closes the loop: neon probes bc1 and, on sustained failure, alerts via neon's
# EXISTING hexworth-alerts ntfy (Frank is already subscribed — no new subscription
# needed for this direction). Each host now watches the other.
#
# LIMITATION (documented, proportionate): this probes bc1's deadman-ntfy health, which
# proves bc1 host + docker + tailnet are up. It does NOT prove bc1's check-peer cron is
# actually firing (a live bc1 with a dead cron would pass here). That narrower failure
# is a known smaller residual; host-death — the case Nancy #2 named — is caught.
set -u

# bc1 liveness signal: its deadman ntfy health endpoint (Tailscale IP 100.96.136.114).
BC1_HEALTH="http://100.96.136.114:8090/v1/health"

# publish target: neon's OWN existing ntfy (binds to 100.65.122.90, not 0.0.0.0),
# topic hexworth-alerts — the one Frank already subscribes to.
NTFY_BASE="http://100.65.122.90:8090"
NTFY="$NTFY_BASE/hexworth-alerts"

STATE_DIR="/home/eq/hexworth-watch-bc1/state"
COUNTER="$STATE_DIR/fail_count"
ALERTED="$STATE_DIR/alerted"
LOG="$STATE_DIR/watch-bc1.log"

# 3 consecutive failures at 5-min cadence = ~15 min before alerting. Same flapping
# tradeoff as check-peer.sh: resets on any healthy probe (avoids false-positive storms).
THRESHOLD=3

mkdir -p "$STATE_DIR"

ts() { date '+%Y-%m-%dT%H:%M:%S%z'; }
logline() { echo "$(ts) $1" >> "$LOG"; }

publish() {
    code=$(curl -s -m 8 -o /dev/null -w '%{http_code}' \
        -H "Title: $1" -H "Priority: $2" -H "Tags: $3" -d "$4" "$NTFY" 2>/dev/null)
    logline "PUBLISH '$1' -> HTTP ${code:-000}"
}

# read_count: robust to missing/empty/half-written counter (Nancy #5) — empty or
# non-numeric must fall back to 0 or `count + 1` errors under set -u.
read_count() {
    c=$(cat "$COUNTER" 2>/dev/null)
    case "$c" in ''|*[!0-9]*) echo 0 ;; *) echo "$c" ;; esac
}

# Cap the log so append-forever can't grow unbounded (Nancy #4): last 500 past 1000.
if [ -f "$LOG" ] && [ "$(wc -l < "$LOG" 2>/dev/null || echo 0)" -gt 1000 ]; then
    tail -n 500 "$LOG" > "$LOG.tmp" 2>/dev/null && mv "$LOG.tmp" "$LOG"
fi

# self-precheck (reboot race): if neon's own ntfy is unreachable we can't deliver and
# it usually means neon isn't fully up — skip without incrementing so a neon boot
# doesn't false-positive as "bc1 down".
selfcode=$(curl -s -m 5 -o /dev/null -w '%{http_code}' "$NTFY_BASE/v1/health" 2>/dev/null)
if [ "$selfcode" != "200" ]; then
    logline "SKIP local ntfy unreachable (HTTP ${selfcode:-000}) — not probing bc1 this cycle"
    exit 0
fi

code=$(curl -s -m 8 -o /dev/null -w '%{http_code}' "$BC1_HEALTH" 2>/dev/null)

if [ "$code" = "200" ]; then
    if [ -f "$ALERTED" ]; then
        publish "bc1 RECOVERED" "default" "white_check_mark" \
            "bc1 is back: its deadman ntfy is reachable again from neon. The bc1->neon watch is live once more."
        rm -f "$ALERTED"
        logline "RECOVERED bc1 healthy again (counter reset)"
    fi
    echo 0 > "$COUNTER"
    exit 0
fi

count=$(read_count)
count=$((count + 1))
echo "$count" > "$COUNTER"
logline "FAIL ${count}/${THRESHOLD} — bc1 deadman ntfy not healthy (HTTP ${code:-000})"

if [ "$count" -ge "$THRESHOLD" ] && [ ! -f "$ALERTED" ]; then
    publish "bc1 DOWN" "urgent" "rotating_light" \
        "bc1 unreachable for ${count} consecutive checks (~$((count * 5)) min) from neon. bc1 runs the student sandboxes AND the bc1->neon dead-man watch — if bc1 is dead, that watch is dark too. Investigate bc1."
    touch "$ALERTED"
fi
exit 0
