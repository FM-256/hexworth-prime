#!/usr/bin/env bash
# Answer the student's question about OpenStack: can I actually launch a lab?
#
# @catalog what    Probes nova-compute liveness and placement capacity, emits node_exporter
#                  textfile metrics. Runs on bc2, which holds the admin credential.
# @catalog run     _tools/monitoring/probe/openstack-compute-probe.sh   (cron */2 on bc2)
# @catalog status  GATE
#
# WHY THIS EXISTS
# On 2026-08-19 nova-compute was dead for 15 hours and every existing check was green. The bc1
# probe has a check named `openstack_token` whose comment claimed it "proves the whole chain".
# It does not issue a token — it is an unauthenticated GET that passes on any HTTP status.
# Keystone was genuinely healthy the whole time, so a TRUE check sat under a FALSE claim while
# students got "No valid host was found. There are not enough hosts available."
#
# Proving a launch is possible requires credentials. bc1 holds none by design, so the check could
# not live there. bc2 has the admin credential and is already scraped on :9100, so this is the
# honest home for it. See _docs/operations/openstack-nova-compute-outage-2026-08-19.md.
#
# TWO METRICS, NOT ONE — the same pattern the bc1 probe uses and for the same reason:
#   hexworth_openstack_checked   1 = the probe actually ran this check
#   hexworth_openstack_up        1 = it passed
# A missing credential, a dead curl or an unparseable response must read as BLIND, never as
# healthy and never as an outage. One metric cannot express "I could not tell", and a monitor
# that reports a guess is how the last 15-hour outage stayed invisible.
#
# THE TRAP THIS PROBE WAS BUILT AROUND: /placement/allocation_candidates returns 404 without an
# OpenStack-API-Version header, and a naive parse reads that error as "0 candidates" — which is
# indistinguishable from genuine capacity exhaustion. The header below is load-bearing. During
# the outage this cost real diagnosis time.

set -u

AUTH_ENV="${OS_AUTH_ENV:-/home/eq1/openstack-stage1/admin-auth.env}"
OS_HOST="${OS_HOST:-192.168.122.62}"
OUT_DIR="${TEXTFILE_DIR:-/var/lib/node_exporter/textfile_collector}"
OUT="$OUT_DIR/openstack_compute.prom"
CURL_T="${CURL_T:-15}"
PLACEMENT_MV="placement 1.38"

emit() { printf '%s\n' "$1" >> "$TMP"; }

TMP="$(mktemp)" || exit 1
trap 'rm -f "$TMP"' EXIT

# Defaults are BLIND. Every check must explicitly prove itself; nothing is healthy by omission.
compute_checked=0; compute_up=0
capacity_checked=0; capacity_up=0
candidates=-1

if [ -r "$AUTH_ENV" ]; then
    # shellcheck disable=SC1090
    set -a; . "$AUTH_ENV"; set +a

    BODY=$(printf '{"auth":{"identity":{"methods":["password"],"password":{"user":{"name":"%s","domain":{"name":"Default"},"password":"%s"}}},"scope":{"project":{"name":"%s","domain":{"name":"Default"}}}}}' \
        "${OS_ADMIN_USER:-}" "${OS_ADMIN_PASS:-}" "${OS_ADMIN_PROJECT:-}")

    TOK=$(curl -sS -i -m "$CURL_T" -H 'Content-Type: application/json' -d "$BODY" \
          "http://${OS_HOST}/identity/v3/auth/tokens" 2>/dev/null \
          | grep -i '^x-subject-token:' | tr -d '\r' | awk '{print $2}')

    if [ -n "${TOK:-}" ]; then
        # ── nova-compute liveness ────────────────────────────────────────────────────────────
        # A hypervisor that is 'enabled' but 'down' is the exact state that produced the outage:
        # nova accepts the boot request and then finds nowhere to put it.
        SVC=$(curl -sS -m "$CURL_T" -H "X-Auth-Token: $TOK" \
              "http://${OS_HOST}/compute/v2.1/os-services" 2>/dev/null)
        if printf '%s' "$SVC" | grep -q 'nova-compute'; then
            compute_checked=1
            if printf '%s' "$SVC" | python3 -c '
import sys, json
try:
    svcs = json.load(sys.stdin).get("services", [])
except Exception:
    sys.exit(2)
alive = [s for s in svcs if s.get("binary") == "nova-compute"
         and s.get("state") == "up" and s.get("status") == "enabled"]
sys.exit(0 if alive else 1)' 2>/dev/null; then
                compute_up=1
            fi
        fi

        # ── placement capacity ───────────────────────────────────────────────────────────────
        # The microversion header is REQUIRED. Without it this 404s and a naive parser reports
        # zero candidates, which looks exactly like a full cluster.
        CAND=$(curl -sS -m "$CURL_T" -H "X-Auth-Token: $TOK" \
               -H "OpenStack-API-Version: ${PLACEMENT_MV}" \
               "http://${OS_HOST}/placement/allocation_candidates?resources=VCPU:1,MEMORY_MB:128,DISK_GB:1" 2>/dev/null)
        N=$(printf '%s' "$CAND" | python3 -c '
import sys, json
try:
    d = json.load(sys.stdin)
except Exception:
    print(-1); sys.exit(0)
# An error document is NOT zero capacity. Say "unknown" so it cannot be alerted on as an outage.
if "errors" in d:
    print(-1)
else:
    print(len(d.get("allocation_requests", [])))' 2>/dev/null)
        if [ -n "${N:-}" ] && [ "$N" -ge 0 ] 2>/dev/null; then
            capacity_checked=1
            candidates=$N
            [ "$N" -gt 0 ] && capacity_up=1
        fi
    fi
fi

emit '# HELP hexworth_openstack_checked 1 if the probe was able to evaluate this check at all.'
emit '# TYPE hexworth_openstack_checked gauge'
emit "hexworth_openstack_checked{check=\"nova_compute\"} ${compute_checked}"
emit "hexworth_openstack_checked{check=\"placement_capacity\"} ${capacity_checked}"
emit '# HELP hexworth_openstack_up 1 if the check passed. Meaningless unless _checked is 1.'
emit '# TYPE hexworth_openstack_up gauge'
emit "hexworth_openstack_up{check=\"nova_compute\"} ${compute_up}"
emit "hexworth_openstack_up{check=\"placement_capacity\"} ${capacity_up}"
emit '# HELP hexworth_openstack_placement_candidates Hosts that can take a 1vcpu/128MB/1GB VM. -1 = unknown.'
emit '# TYPE hexworth_openstack_placement_candidates gauge'
emit "hexworth_openstack_placement_candidates ${candidates}"
emit '# HELP hexworth_openstack_probe_timestamp_seconds When this probe last completed.'
emit '# TYPE hexworth_openstack_probe_timestamp_seconds gauge'
emit "hexworth_openstack_probe_timestamp_seconds $(date +%s)"

# Atomic replace: a scrape landing mid-write must never see a truncated file and read a missing
# series as zero.
mkdir -p "$OUT_DIR" 2>/dev/null
mv -f "$TMP" "$OUT" 2>/dev/null && chmod 0644 "$OUT" 2>/dev/null
trap - EXIT
