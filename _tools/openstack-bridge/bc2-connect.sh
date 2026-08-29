#!/bin/bash
# Connect to bc2 over the first address that actually answers. Used as an ssh ProxyCommand.
#
# @catalog what    stdio proxy to bc2 that survives ISP prefix rotation and DHCP changes
# @catalog run     installed on bc1 as ~/bin/bc2-connect; ssh uses it via ~/.ssh/config
# @catalog status  TOOL
#
# WHY THIS EXISTS. `ssh bc2` from bc1 died repeatedly on 2026-08-28/29, blocking every admin
# path to the cloud while the cloud itself stayed perfectly healthy. It was never sshd: bc2's
# uptime showed no reboot, and ports 8080/9711 answered throughout. The cause was NAME
# RESOLUTION. bc1 had no ~/.ssh/config at all, so `bc2` resolved through the router's DNS to a
# GLOBAL IPv6 address under an ISP-delegated prefix -- and the ISP rotated that prefix.
# Measured side by side: the router's DNS still handed back the OLD /64 while tailscale was
# reaching the same host on a DIFFERENT one. Every SSH went to an address nobody was listening
# on any more, and timed out. (Prefix values deliberately not written down -- they identify the
# site, and only the mismatch matters. Reproduce with `getent hosts bc2` vs `tailscale ping bc2`.)
#
# The tailnet is NOT a fallback: its ACL permits only 8080 and 9711 between these hosts, so
# port 22 over tailscale times out by policy (that predates this and is documented in
# setup-novnc-console.sh). Opening 22 there needs the Tailscale admin console, which is the
# operator's to do -- so this fixes the problem with what is already available.
#
# ORDER MATTERS, and each entry earns its place:
#   1. LAN IPv4        readable, routable across the LAN, unaffected by ISP prefixes.
#   2. second NIC      bc2 is dual-homed; the second port survives the first one going down.
#   3. link-local IPv6 derived from the MAC via EUI-64, so it CANNOT rotate and needs no DHCP
#                      server, no router and no DNS. It is the address of last resort, and the
#                      only one that still worked during the outage that prompted this file.
# Deliberately NOT in the list: the DNS name. Resolving `bc2` is the thing that broke.
#
# Addresses come from the private infra repo, never from here -- this repo is public.
set -u

INFRA=${HEXWORTH_INFRA:-$HOME/hexworth-infra-private/openstack.env}

# An explicitly-exported BC2_ADDRS must WIN over the file. Captured before sourcing, because
# sourcing would otherwise silently overwrite it -- which would make the fallback order
# impossible to exercise, and an untested fallback is decoration. This is how the
# link-local-only path gets proven without unplugging a NIC.
_env_addrs="${BC2_ADDRS:-}"
[ -r "$INFRA" ] && . "$INFRA"

PORT="${1:-22}"
# Space-separated, in preference order. Intentionally NOT hardcoded here: a wrong address
# would send an admin session somewhere unexpected, and a loud failure beats a silent
# misconnect.
ADDRS="${_env_addrs:-${BC2_ADDRS:-}}"

if [ -z "$ADDRS" ]; then
  echo "bc2-connect: no BC2_ADDRS set (looked in $INFRA)." >&2
  echo "bc2-connect: set BC2_ADDRS='<lan-ipv4> <lan-ipv4-2> <link-local%iface>' there." >&2
  exit 1
fi

for a in $ADDRS; do
  # Probe before committing. A 3s TCP check costs nothing next to ssh's own connect timeout,
  # and it is what lets a dead first address fall through instead of hanging the session.
  if timeout 3 bash -c "</dev/tcp/$a/$PORT" 2>/dev/null; then
    exec nc -w 30 "$a" "$PORT"
  fi
done

echo "bc2-connect: no candidate address answered on port $PORT." >&2
echo "bc2-connect: tried: $ADDRS" >&2
echo "bc2-connect: bc2 may genuinely be down -- check 'tailscale ping bc2' and the bridge on 9711." >&2
exit 1
