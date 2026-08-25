#!/bin/bash
# Can a student reach every lab surface from THIS network, with NO tailscale?
#
# WHY THIS EXISTS. Everything students touch is published through Cloudflare and Firebase, so it
# should work from any network. That was verified from a non-tailscale path (routing confirmed
# via the normal interface, no exit node, names resolving to public Cloudflare/Firebase
# addresses). What could NOT be verified from here is a specific corporate network: a filter that
# blocks the .tech TLD, or a proxy that refuses WebSocket upgrades, would break the console while
# every other check stays green.
#
# Run this ON the office network. It needs nothing but curl. It touches no credentials and
# changes nothing.
#
# @catalog what    prove the lab surfaces are reachable from an arbitrary network, no tailscale
# @catalog run     bash _tools/openstack-bridge/office-reachability-check.sh
# @catalog status  TOOL
set -u

PASS=0; FAIL=0
chk() {  # chk <expected> <label> <curl args...>
  local want="$1" label="$2"; shift 2
  local got
  got=$(curl -s -o /dev/null -w '%{http_code}' --max-time 20 "$@" 2>/dev/null)
  if [ "$got" = "$want" ]; then printf '  OK    %-46s %s\n' "$label" "$got"; PASS=$((PASS+1))
  else printf '  FAIL  %-46s got %s, expected %s\n' "$label" "${got:-timeout}" "$want"; FAIL=$((FAIL+1)); fi
}

echo "Lab reachability from this network (no tailscale required)"
echo

# 1. The platform and the lab pages themselves (Firebase Hosting).
chk 200 "hexworth.com"                      https://hexworth.com/
chk 200 "cinder lab page"                   https://hexworth.com/houses/cloud/openstack/labs/cloud-openstack-cinder-live.lab.html
chk 200 "security sprint lab page"          https://hexworth.com/houses/cloud/openstack/labs/cloud-openstack-security-sprint.lab.html
chk 200 "web console lab page"              https://hexworth.com/houses/cloud/openstack/labs/cloud-openstack-console.lab.html

# 2. The sandbox host (Cloudflare tunnel). 401 is the CORRECT answer without a launch cookie --
#    it proves the console gate is reachable AND working. A timeout here means the network is
#    blocking the host or the TLD.
chk 401 "sandbox host reachable (gate answers)" https://sandbox.hexworth.tech/dashboard/auth/login/
chk 401 "console route reachable (gate answers)" https://sandbox.hexworth.tech/novnc/vnc_lite.html

# 3. The WebSocket upgrade the instance console depends on. Some corporate proxies allow HTTPS
#    but silently refuse Upgrade; that breaks ONLY the console, so it is checked separately.
#    401 here still proves the upgrade reached the gate rather than being stripped in transit.
chk 401 "websocket upgrade permitted"        --http1.1 \
    -H 'Connection: Upgrade' -H 'Upgrade: websocket' \
    -H 'Sec-WebSocket-Version: 13' -H 'Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==' \
    'https://sandbox.hexworth.tech/?token=probe'

echo
if [ "$FAIL" -eq 0 ]; then
  echo "  ALL $PASS CHECKS PASSED -- students can work from this network."
else
  echo "  $FAIL of $((PASS+FAIL)) FAILED."
  echo "  A timeout on sandbox.hexworth.tech usually means the network blocks the host or the"
  echo "  .tech TLD. A failure on ONLY the websocket line means HTTPS is fine but the proxy"
  echo "  strips Upgrade, which breaks the instance console and nothing else."
fi
exit $([ "$FAIL" -eq 0 ] && echo 0 || echo 1)
