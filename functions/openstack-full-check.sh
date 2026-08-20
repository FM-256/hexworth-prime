#!/usr/bin/env bash
# Full OpenStack health sweep: every API endpoint, every service agent, capacity, and Horizon.
#
# @catalog what   READ-ONLY. Checks identity/compute/image/networking/volume/placement endpoints,
# @catalog what   nova + neutron + cinder agent states, scheduler capacity, instances, and Horizon.
# @catalog run    ssh bc2 'bash openstack-full-check.sh'   (needs admin-auth.env, so bc2 only)
# @catalog status TOOL
#
# WHY A SWEEP RATHER THAN A PING
# 2026-08-19: nova-compute was dead for 15h while keystone answered happily and every host-level
# check stayed green. An endpoint returning HTTP is not a working cloud. This asserts what a
# student actually depends on: compute up AND enabled, the scheduler able to place a VM, network
# agents alive, and the web console serving a real login form rather than any 200.
#
# JSON is written to files and parsed by ONE python pass at the end, deliberately. A first version
# used `python3 -c` one-liners inside single-quoted shell strings; every escaped quote became a
# literal backslash in Python and five of six checks died with SyntaxError while the sweep happily
# reported the rest. A health tool that silently drops most of its checks is worse than none.
set -u
set -a; . /home/eq1/openstack-stage1/admin-auth.env; set +a
K=http://192.168.122.62
D=$(mktemp -d); trap 'rm -rf "$D"' EXIT

BODY="{\"auth\":{\"identity\":{\"methods\":[\"password\"],\"password\":{\"user\":{\"name\":\"$OS_ADMIN_USER\",\"domain\":{\"name\":\"Default\"},\"password\":\"$OS_ADMIN_PASS\"}}},\"scope\":{\"project\":{\"name\":\"$OS_ADMIN_PROJECT\",\"domain\":{\"name\":\"Default\"}}}}}"
T=$(curl -sS -i -m 15 -H 'Content-Type: application/json' -d "$BODY" "$K/identity/v3/auth/tokens" \
    | grep -i '^x-subject-token:' | tr -d '\r' | awk '{print $2}')
[ -n "$T" ] || { echo "  AUTH FAILED - cannot continue"; exit 1; }
echo "  admin token: acquired"

echo "=== API endpoints ==="
# 300 is correct for version-discovery roots; demanding 200 everywhere invents outages.
# NOTE the path is 'networking', not 'network' - a first run reported FAIL 404 for a perfectly
# healthy neutron because the endpoint name was wrong in this list, not on the server.
for p in identity compute image networking volume placement; do
  code=$(curl -sS -o /dev/null -m 12 -w '%{http_code}' -H "X-Auth-Token: $T" "$K/$p" 2>/dev/null)
  case "$code" in 200|300|401) v="ok  " ;; *) v="FAIL" ;; esac
  printf "  %s %-11s HTTP %s\n" "$v" "$p" "$code"
done

curl -sS -m 20 -H "X-Auth-Token: $T" "$K/compute/v2.1/os-services"            -o "$D/nova.json"      2>/dev/null
curl -sS -m 20 -H "X-Auth-Token: $T" "$K/networking/v2.0/agents"              -o "$D/neutron.json"   2>/dev/null
curl -sS -m 20 -H "X-Auth-Token: $T" "$K/volume/v3/os-services"               -o "$D/cinder.json"    2>/dev/null
curl -sS -m 20 -H "X-Auth-Token: $T" -H "OpenStack-API-Version: placement 1.38" \
     "$K/placement/allocation_candidates?resources=VCPU:1,MEMORY_MB:128,DISK_GB:1" -o "$D/place.json" 2>/dev/null
curl -sS -m 20 -H "X-Auth-Token: $T" -H "X-OpenStack-Nova-API-Version: 2.87" \
     "$K/compute/v2.1/servers/detail?all_tenants=1"                           -o "$D/servers.json"   2>/dev/null

python3 - "$D" <<'PY'
import sys, json, os
from collections import Counter
D = sys.argv[1]

def load(name):
    p = os.path.join(D, name)
    try:
        with open(p) as fh:
            return json.load(fh)
    except Exception as e:
        print(f"  FAIL could not read {name}: {e}")
        return None

def mark(ok):
    return "ok  " if ok else "FAIL"

print("=== nova services (up AND enabled, not merely present) ===")
d = load("nova.json")
if d is not None:
    svcs = d.get("services", [])
    bad = 0
    for s in svcs:
        ok = s.get("state") == "up" and s.get("status") == "enabled"
        bad += 0 if ok else 1
        print(f"  {mark(ok)} {s.get('binary','?'):<18} state={s.get('state')} status={s.get('status')}")
    print(f"  -> {len(svcs)-bad}/{len(svcs)} healthy")

print("=== neutron agents ===")
d = load("neutron.json")
if d is not None:
    ag = d.get("agents", [])
    for a in ag:
        ok = a.get("alive") and a.get("admin_state_up")
        print(f"  {mark(ok)} {a.get('binary','?'):<30} alive={a.get('alive')} admin_up={a.get('admin_state_up')}")
    print(f"  -> {sum(1 for a in ag if a.get('alive'))}/{len(ag)} alive")

print("=== cinder services ===")
d = load("cinder.json")
if d is not None:
    for s in d.get("services", []):
        ok = s.get("state") == "up" and s.get("status") == "enabled"
        print(f"  {mark(ok)} {s.get('binary','?'):<18} state={s.get('state')} status={s.get('status')}")

print("=== can the scheduler actually place a VM? ===")
d = load("place.json")
if d is not None:
    # An error document is NOT zero capacity. Saying "0 candidates" for a 404 reports a healthy
    # cloud as full - this endpoint 404s without the microversion header, which cost real
    # diagnosis time on 2026-08-19.
    if "errors" in d:
        print("  FAIL placement returned an error document, not a capacity answer")
    else:
        n = len(d.get("allocation_requests", []))
        print(f"  {mark(n > 0)} allocation candidates: {n}")

print("=== instances ===")
d = load("servers.json")
if d is not None:
    servers = d.get("servers", [])
    print(f"  {dict(Counter(s.get('status') for s in servers))}")
    for s in servers:
        if s.get("status") == "ERROR":
            msg = str((s.get("fault") or {}).get("message"))[:70]
            print(f"  FAIL {s.get('name')}: {msg}")
PY

echo "=== Horizon (the GUI), on the VM ==="
code=$(curl -sS -o /dev/null -m 12 -w '%{http_code}' "$K/dashboard/auth/login/" 2>/dev/null)
body=$(curl -sS -m 12 "$K/dashboard/auth/login/" 2>/dev/null)
[ "$code" = "200" ] && echo "  ok   login page HTTP 200" || echo "  FAIL login page HTTP $code"
# Assert a real login FORM. A 200 from an error page or a placeholder is the failure mode that
# let a dead PXE service look healthy for days.
printf '%s' "$body" | grep -q 'csrfmiddlewaretoken' \
  && echo "  ok   CSRF token present (real Django form)" || echo "  FAIL no CSRF token"
printf '%s' "$body" | grep -q 'name="password"' \
  && echo "  ok   password field present" || echo "  FAIL no password field"
printf '%s' "$body" | grep -q 'name="region"' \
  && echo "  ok   region field present" || echo "  note region field absent (single-region deploy)"
