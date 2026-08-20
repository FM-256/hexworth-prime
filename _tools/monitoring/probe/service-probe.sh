#!/usr/bin/env bash
# Hexworth service probe — asks whether things WORK, not whether hosts are up.
#
# WHY THIS EXISTS
#   On 2026-08-18 the platform had two outages in one day. Both were invisible to every existing
#   check, because every existing check was about HOSTS and CONTAINERS:
#
#     · A tailnet ACL omission killed the OpenStack API for 4 days. Lab pages 200, sandbox API
#       200, host up 28 days, bridge logging success, containers all healthy. Every student lab
#       hung. Nothing alerted, because nothing asked "can a student get a token".
#     · A power loss left the OpenStack VM shut off. bc2 rebooted cleanly, every systemd unit
#       came back green, and the entire cloud stayed down underneath them.
#
#   Both were "the layer below reported healthy". This probe asks the user's question instead.
#
# DESIGN RULES, each earned the same day
#   1. RUNS ON bc1, NOT ON WHAT IT WATCHES. A probe on bc2 that checks OpenStack goes down with
#      bc2 and reports nothing — which is silence, not an alarm. bc1 is covered in turn by neon's
#      check-bc1.sh and by the external dead-man's switch.
#   2. A CHECK THAT COULD NOT RUN IS NOT A PASS, AND NOT A FAILURE EITHER. Every probe emits
#      _up (the verdict) AND _checked (did we actually get an answer). A curl that times out
#      because the prober's own network is broken must not read as "the service is down" — that
#      is how a broken instrument becomes a false outage.
#   3. NEVER HANG. Every external call has an explicit timeout. A monitoring script that blocks
#      forever stops reporting, and stopped reporting looks exactly like healthy.
#   4. WRITE ATOMICALLY. Prometheus may scrape mid-write; a half-written .prom file is a parse
#      error that silently drops every metric in it. Write .tmp, then mv.
#   5. READ RESPONSES CAREFULLY. mysql answering "Access denied" is HEALTHY — it accepted the
#      connection. 302 from grafana and 404 from loki's root are healthy. A probe that demands
#      200 everywhere invents outages. Each check below states what "good" means for that service.
#
# @catalog what    probe real service behaviour and expose it to prometheus via node_exporter
# @catalog run     _tools/monitoring/probe/service-probe.sh   (cron: every 2 min on bc1)
# @catalog status  GATE

set -u

TEXTFILE_DIR="${TEXTFILE_DIR:-/var/lib/node_exporter/textfile_collector}"
OUT="${TEXTFILE_DIR}/hexworth_services.prom"
TMP="${OUT}.$$.tmp"
# Second output, for the Pulse dashboard. Served over the EXISTING public path
# (traefik -> cloudflared -> sandbox.hexworth.tech) and read by an ADMIN-GATED Cloud Function,
# so no credential of any kind lives on this host. See _docs/operations/service-monitor.md.
JSON_DIR="${JSON_DIR:-/home/eq1/hexworth-status}"
JSON_OUT="${JSON_DIR}/status.json"
JSON_TMP="${JSON_OUT}.$$.tmp"

# Endpoints. Addresses come from the environment so this file can live in a PUBLIC repo.
KEYSTONE="${HEXWORTH_KEYSTONE_URL:-}"          # e.g. http://<bc2>:8080/identity
PXE_HOST="${HEXWORTH_PXE_URL:-}"               # e.g. http://<neon>/
SANDBOX_API="${HEXWORTH_SANDBOX_API:-https://sandbox.hexworth.tech/api/sandbox}"
SITE="${HEXWORTH_SITE:-https://hexworth.com/}"
SHARE_PATH="${HEXWORTH_SHARE:-/mnt/neon-shared}"
# Prometheus lives on neon's LAN address, on a NON-obvious port. Unset = the check reports
# BLIND rather than down, which is the honest state for "not configured here".
PROM_URL="${HEXWORTH_PROM_URL:-}"
CURL_T="${HEXWORTH_PROBE_TIMEOUT:-10}"

emit() { printf '%s\n' "$1" >> "$TMP"; }

# check <name> <expected-desc> <command...>
#   The command must print the observed value on stdout and exit 0 when the service is HEALTHY,
#   exit 1 when it is genuinely DOWN, and exit 2 when the check itself could not run.
run_check() {
  local name="$1"; shift
  local start end dur rc out
  start=$(date +%s.%N)
  out=$("$@" 2>/dev/null); rc=$?
  end=$(date +%s.%N)
  dur=$(awk "BEGIN{printf \"%.3f\", $end - $start}")

  case "$rc" in
    0) emit "hexworth_probe_up{service=\"$name\"} 1"
       emit "hexworth_probe_checked{service=\"$name\"} 1" ;;
    1) emit "hexworth_probe_up{service=\"$name\"} 0"
       emit "hexworth_probe_checked{service=\"$name\"} 1" ;;
    *) # Rule 2: could not run. Report UNKNOWN, never a verdict.
       emit "hexworth_probe_up{service=\"$name\"} 0"
       emit "hexworth_probe_checked{service=\"$name\"} 0" ;;
  esac
  emit "hexworth_probe_duration_seconds{service=\"$name\"} $dur"

  # same three states as the metrics: up / down / blind. Kept identical on purpose — two
  # renderings of one truth must not be able to disagree.
  local state
  case "$rc" in 0) state=up ;; 1) state=down ;; *) state=blind ;; esac
  RESULTS="${RESULTS}{\"service\":\"$name\",\"state\":\"$state\",\"seconds\":$dur},"
}
RESULTS=""

# ── the checks ────────────────────────────────────────────────────────────────────────────────

# keystone: ANY HTTP response means the API is answering. 300 is what version discovery returns
# and is correct — demanding 200 here would report a permanent false outage.
chk_keystone() {
  [ -n "$KEYSTONE" ] || return 2
  local code
  code=$(curl -sS -o /dev/null -m "$CURL_T" -w '%{http_code}' "$KEYSTONE" 2>/dev/null) || return 1
  [ "$code" = "000" ] && return 1
  return 0
}

# Proves the NETWORK PATH to keystone from inside the sandbox network is intact:
# tailnet grant -> socat -> VM -> keystone. That is what caught the 2026-08-18 outages.
#
# ⚠ IT DOES NOT ISSUE A TOKEN, despite the name. It is an unauthenticated GET that passes on any
# HTTP status. An earlier version of this comment claimed it proved token issuance; on 2026-08-19
# nova-compute sat dead for 15 HOURS while this check stayed green, because keystone really was
# answering the whole time. The check was true; the claim above it was not. Students got
# "No valid host was found" while the monitor showed seven of seven up.
#
# Proving a student can LAUNCH something needs credentials (read os-services, or ask placement for
# allocation candidates). bc1 holds none by design. bc2 does, and is already scraped, so that check
# belongs there as a textfile collector — see
# _docs/operations/openstack-nova-compute-outage-2026-08-19.md. Until it exists, this metric means
# "keystone answers HTTP from the sandbox network" and nothing more. Do not read it as "labs work".
chk_openstack_token() {
  [ -n "$KEYSTONE" ] || return 2
  command -v docker >/dev/null 2>&1 || return 2
  local img c
  img=$(docker images --format '{{.Repository}}:{{.Tag}}' 2>/dev/null | grep -m1 'openstack-cli') || return 2
  [ -n "$img" ] || return 2
  # A running student container is not required; use a throwaway so the probe never disturbs one.
  timeout $((CURL_T * 3)) docker run --rm --network sandbox-net "$img" \
      curl -sS -o /dev/null -m "$CURL_T" -w '%{http_code}' "$KEYSTONE" 2>/dev/null | grep -qE '^[1-5]' || return 1
  return 0
}

# sandbox API: 401 on an unauthenticated call is HEALTHY — it proves the API is up AND enforcing
# auth. 200 would actually be alarming here.
chk_sandbox_api() {
  local code
  code=$(curl -sS -o /dev/null -m "$CURL_T" -w '%{http_code}' "${SANDBOX_API}/health" 2>/dev/null) || return 1
  [ "$code" = "200" ] && return 0
  [ "$code" = "000" ] && return 1
  return 1
}

chk_sandbox_auth_enforced() {
  local code
  code=$(curl -sS -o /dev/null -m "$CURL_T" -w '%{http_code}' "${SANDBOX_API}/list" 2>/dev/null) || return 1
  [ "$code" = "401" ] && return 0      # correct: alive and refusing anonymous access
  [ "$code" = "000" ] && return 1
  return 1
}

# Prometheus, checked FROM HERE because it cannot check itself.
#
# 2026-08-20: prometheus sat Exited(255) on neon after a power loss until a human went looking.
# Nothing went red, and nothing could have: with prometheus down no rules evaluate, so the one
# component whose absence disables every alert is the one component alerting cannot cover. bc1 is
# a different host, which is the whole point of asking from here.
#
# ⚠ ASSERT THAT PROMETHEUS ANSWERED, NOT THAT SOMETHING DID. During that incident
# `curl :9090/-/healthy` returned 200 from COCKPIT-TLS, which owns 9090 on that host, while
# prometheus (published on 9091) was dead. A port check aimed at the obvious number reported the
# outage as healthy. That is the same failure chk_pxe below was written for, and it still cost
# real diagnosis time. So this matches the BODY text: a wrong service on the right port fails.
#
# LAN address, like PXE: the tailnet grant deliberately does not include neon's web ports.
chk_prometheus() {
  [ -n "$PROM_URL" ] || return 2
  local body
  body=$(curl -sS -m "$CURL_T" "${PROM_URL%/}/-/healthy" 2>/dev/null) || return 1
  printf '%s' "$body" | grep -qi 'Prometheus Server is Healthy' || return 1
  return 0
}

# PXE: the boot content is served by nginx on :8080 (NOT :80 — that is a different vhost).
# "Something answered" is not sufficient: apache2 won the port-80 boot race on 2026-08-18 and the
# host kept serving a placeholder while PXE was dead. So this asserts the INDEX CONTENT, which
# only the real PXE root produces.
#   ⚠ Must use a LAN address. neon is multi-homed (four LAN NICs) and the tailnet grant does not
#   include its web ports — correctly, since PXE is a LAN service. Probing the tailnet address
#   returns 000 and looks like an outage.

chk_pxe() {
  [ -n "$PXE_HOST" ] || return 2
  local body
  body=$(curl -sS -m "$CURL_T" "$PXE_HOST" 2>/dev/null) || return 1
  printf '%s' "$body" | grep -qi 'Apache2 Ubuntu Default Page' && return 1   # apache squatting
  # ⚠ REQUIRE THE AUTOINDEX SIGNATURE, not just the directory names. A first version grepped for
  # 'images|menus|kickstart' and PASSED when pointed at hexworth.com, whose HTML contains
  # /assets/images/ paths. A detector that accepts the wrong page is worse than no detector: it
  # reports healthy for a service it never reached. Caught by deliberately aiming it at a page
  # that should fail.
  printf '%s' "$body" | grep -qiE '<title>Index of|<h1>Index of' || return 1
  printf '%s' "$body" | grep -qiE 'images/|menus/|kickstart/' || return 1
  return 0
}

chk_site() {
  local code
  code=$(curl -sS -o /dev/null -m "$CURL_T" -w '%{http_code}' "$SITE" 2>/dev/null) || return 1
  [ "$code" = "200" ] && return 0
  return 1
}

chk_share() {
  [ -d "$SHARE_PATH" ] || return 2
  mountpoint -q "$SHARE_PATH" 2>/dev/null || return 1
  timeout "$CURL_T" ls "$SHARE_PATH" >/dev/null 2>&1 || return 1   # mounted but hung counts as down
  return 0
}

# ── run ───────────────────────────────────────────────────────────────────────────────────────

mkdir -p "$TEXTFILE_DIR" 2>/dev/null
: > "$TMP"

emit '# HELP hexworth_probe_up 1 = service behaving correctly, 0 = down OR not checked (see _checked)'
emit '# TYPE hexworth_probe_up gauge'
emit '# HELP hexworth_probe_checked 1 = the probe got a real answer. 0 = the CHECK failed, which is not a verdict about the service.'
emit '# TYPE hexworth_probe_checked gauge'
emit '# HELP hexworth_probe_duration_seconds how long the check took'
emit '# TYPE hexworth_probe_duration_seconds gauge'

# ── the lab pipeline: the checks that would have caught 2026-08-20 ────────────────────────────
# WHY THESE EXIST. On 2026-08-20 every personal-cloud claim failed for roughly six hours with
# APP_CRED_CREATE_FAILED and NOTHING alerted. It surfaced only because students reported that the
# demo server "looked stopped". Every check above was green the whole time: keystone answered, the
# sandbox API answered, the bridge's own /health answered with free RAM. Health of the PARTS is not
# health of the PIPELINE, which is the same lesson nova-compute taught on 2026-08-19. These assert
# the outcome a student actually depends on: that claims and seeds are not failing.
#
# ⚠ NO TRAFFIC READS AS UP. That is a real limitation, stated rather than hidden: these count
# failures inside a window, and a quiet window has nothing to fail in it. They catch a BREAKAGE
# quickly; they do NOT prove the pipeline works when nobody is using it. Never read green here as
# "claims work" — read it as "nothing has failed recently".
LOGWIN="${HEXWORTH_LOG_WINDOW:-20m}"

# Reads lab-manager's own log rather than re-running a claim, because a synthetic claim would
# consume a real pool slot and rotate a real student's password on every probe cycle.
_lab_log() {
    command -v docker >/dev/null 2>&1 || return 2
    docker ps --format '{{.Names}}' 2>/dev/null | grep -qx lab-manager || return 2
    timeout "$CURL_T" docker logs --since "$LOGWIN" lab-manager 2>&1 || return 2
}

# GOOD = zero claim failures in the window. Any failure is a real student who could not get their
# personal cloud, so there is no acceptable non-zero rate to tolerate here.
chk_lab_claims() {
    local log fails
    log=$(_lab_log) || return 2
    fails=$(printf '%s\n' "$log" | grep -c 'claim failed')
    printf '%s claim failures in %s\n' "$fails" "$LOGWIN"
    [ "$fails" -gt 0 ] && return 1
    return 0
}

# GOOD = zero seed FAULTS in the window. PROJECT_NOT_EMPTY is deliberately NOT counted: that is a
# 409 refusal describing the student's own project state, working exactly as designed, and paging
# on it would train everyone to ignore this check.
chk_lab_seed() {
    local log fails
    log=$(_lab_log) || return 2
    fails=$(printf '%s\n' "$log" | grep -c -e '\[seed\] failed' -e '\[seed\] unreachable')
    printf '%s seed faults in %s\n' "$fails" "$LOGWIN"
    [ "$fails" -gt 0 ] && return 1
    return 0
}

run_check site                  chk_site
run_check lab_claims            chk_lab_claims
run_check lab_seed              chk_lab_seed
run_check sandbox_api           chk_sandbox_api
run_check sandbox_auth_enforced chk_sandbox_auth_enforced
run_check prometheus            chk_prometheus
run_check keystone              chk_keystone
run_check openstack_token       chk_openstack_token
run_check pxe                   chk_pxe
run_check neon_share            chk_share

emit '# HELP hexworth_probe_last_run_timestamp_seconds unix time of the last completed probe run'
emit '# TYPE hexworth_probe_last_run_timestamp_seconds gauge'
emit "hexworth_probe_last_run_timestamp_seconds $(date +%s)"

# Rule 4: atomic swap. A partial .prom is a parse error that drops EVERY metric in the file.
mv -f "$TMP" "$OUT"
chmod 644 "$OUT" 2>/dev/null

# ── the Pulse feed ────────────────────────────────────────────────────────────────────────────
# Same atomic-write rule as the .prom: a reader must never see a half-written document.
mkdir -p "$JSON_DIR" 2>/dev/null
printf '{"generated_at":%s,"generated_iso":"%s","probe_host":"%s","services":[%s]}\n' \
  "$(date +%s)" "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "$(hostname)" "${RESULTS%,}" > "$JSON_TMP"
mv -f "$JSON_TMP" "$JSON_OUT"
chmod 644 "$JSON_OUT" 2>/dev/null
