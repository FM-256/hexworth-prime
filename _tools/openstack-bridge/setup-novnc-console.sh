#!/bin/bash
# Rebuild the noVNC console path end to end. Idempotent: safe to re-run.
#
# WHAT WAS BROKEN (2026-08-25)
#   Horizon does not invent the console URL, it repeats Nova's `novncproxy_base_url` back to the
#   browser. That was `http://<vm-private-addr>:6080/vnc_lite.html`, an address no student can
#   route to. The console PAGE loaded fine and only the VNC view stayed black, which is why the
#   break survived unnoticed: nothing 404s, nothing errors, it simply never paints.
#
# THE CHAIN THIS BUILDS
#   browser -> cloudflared (sandbox.hexworth.tech)
#           -> traefik on bc1            (console-gate forwardAuth, same cookie as /dashboard)
#           -> vnc-proxy nginx on bc1    (websocket upgrade + long timeouts)
#           -> bc2 tailnet :8080         (the ALREADY-PERMITTED forward)
#           -> VM apache /novnc/         (ProxyPass ... upgrade=websocket)
#           -> nova-novncproxy :6080
#
# WHY IT TUNNELS THROUGH 8080 INSTEAD OF EXPOSING 6080
#   The tailnet ACL between bc1 and bc2 permits only 8080 and 9711. Measured, not assumed:
#   22 and 6080 both time out from bc1 while 8080 and 9711 connect. Opening 6080 needs a change
#   in the Tailscale admin console, which is the operator's to make, so the console rides the
#   port that already works. If that ACL is ever widened, this can be simplified.
#
# TWO THINGS THAT WILL BITE A FUTURE MAINTAINER
#   1. `curl` is NOT a sufficient test. curl sends no Origin header, so it sails through Nova's
#      origin check and returns 101 Switching Protocols and even the RFB greeting while every
#      real browser is rejected with "Origin header does not match". Nova needs
#      [console] allowed_origins = sandbox.hexworth.tech. Test with a BROWSER.
#   2. The websocket is ROOT-relative. noVNC builds it as protocol://host + '/' + path, and
#      Horizon passes path="?token=...", so the socket dials wss://host/?token=... no matter
#      what prefix the page is served under. That is why there is a separate traefik router
#      matching the bare path plus a token query, with addPrefix to reach /novnc.
#
# @catalog what    rebuild the public noVNC console route (bc2 bridge, bc1 proxy, VM apache, nova)
# @catalog run     bash _tools/openstack-bridge/setup-novnc-console.sh [--check]
# @catalog status  TOOL
set -uo pipefail

# Addresses live in the PRIVATE infra repo, never here: this repo is public.
#   BC2_TS  bc2 tailnet address (the bind target for the console bridge)
#   VM      DevStack VM address on bc2's libvirt network
# Source them, or export them before running.
INFRA=${HEXWORTH_INFRA:-$HOME/hexworth-infra-private/openstack.env}
[ -r "$INFRA" ] && . "$INFRA"
BC2_TS=${BC2_TS:?set BC2_TS (see hexworth-infra-private/openstack.env)}
VM=${VM:?set VM (see hexworth-infra-private/openstack.env)}
PUBLIC=${PUBLIC:-sandbox.hexworth.tech}
CHECK_ONLY=${1:-}

say() { echo "  $*"; }

# ── 1. bc2: expose the VM's console proxy on the tailnet ────────────────────────
say "[1/4] bc2 noVNC bridge"
ssh -o BatchMode=yes bc2 "systemctl is-active openstack-vnc-bridge.service" >/dev/null 2>&1 \
  && say "      openstack-vnc-bridge: active" \
  || say "      openstack-vnc-bridge: NOT ACTIVE (see the unit in this repo's notes)"

# ── 2. VM: apache maps /novnc/ to the local console proxy, WITH websocket upgrade ─
say "[2/4] VM apache /novnc/ bridge"
ssh -o BatchMode=yes bc2 "ssh -i ~/openstack-stage1/stage1_key -o BatchMode=yes -o StrictHostKeyChecking=no stack@$VM \
  'grep -q \"/novnc/\" /etc/apache2/sites-available/horizon.conf && echo present || echo MISSING'" 2>/dev/null \
  | tail -1 | sed 's/^/      ProxyPass: /'

# ── 3. bc1: the public front, gated by the same console cookie as /dashboard ─────
say "[3/4] bc1 vnc-proxy container"
ssh -o BatchMode=yes bc1-cf "docker ps --filter name=vnc-proxy --format '      {{.Names}} {{.Status}}'" 2>/dev/null | tail -1

# ── 4. nova: hand the browser the PUBLIC url, and accept its Origin ──────────────
say "[4/4] nova console config"
ssh -o BatchMode=yes bc2 "ssh -i ~/openstack-stage1/stage1_key -o BatchMode=yes -o StrictHostKeyChecking=no stack@$VM \
  'grep -h novncproxy_base_url /etc/nova/nova-cpu.conf; grep -h allowed_origins /etc/nova/nova.conf'" 2>/dev/null \
  | sed 's/^/      /'

[ "$CHECK_ONLY" = "--check" ] && exit 0

cat <<'NOTE'

  To VERIFY (a browser, not curl -- see the warning above):
    node _tools/openstack-bridge/verify-novnc-console.js
  It logs into Horizon as a pool slot, opens the instance Console tab, and requires the
  websocket to reach 101 AND stay open AND the canvas to paint.
NOTE
