#!/usr/bin/env bash
# @catalog what   Isolate Engine 1's Windows CTF boxes from each other and from the internet.
# @catalog run    sudo bash _tools/engine1/provision/netguard.sh    (on bc2)
# @catalog status TOOL
#
# NOT YET APPLIED. The safety classifier refused to run an iptables change on bc2 from the agent
# session, which is a reasonable thing to refuse on a production host's packet filter. It was not
# worked around. An operator runs this by hand.
#
# THE PROBLEM IT SOLVES. Every team box sits on libvirt's default NAT bridge with no
# guest-to-guest filtering, so a student who escalates on their own box, which IS the challenge,
# can reach all five other teams' boxes. Credentials are now unique per box, so they can no longer
# simply log in, but they can still attack. The boxes also have unrestricted outbound internet,
# on machines students are deliberately handed SYSTEM on.
#
# WHAT IT DOES, for Engine 1 MACs only:
#   guest -> guest                    DROP   teams cannot reach each other
#   guest -> anything but the bridge  DROP   no internet from a box students own
# Host -> guest is untouched: that is local delivery, not FORWARD, so the browser terminals and
# all provisioning over SSH keep working. Verify that after applying.
#
# SCOPED TO MACS, NOT THE BRIDGE, ON PURPOSE. This bridge also carries the OpenStack sandbox work
# (bc2-horizon points at 192.168.122.62). A bridge-wide rule would silently break that project the
# next time its VM starts.
#
# NOT PERSISTENT ACROSS A REBOOT OR A LIBVIRT RESTART. libvirt rewrites its own chains, so this
# must be re-run, or wired into a systemd unit ordered after libvirtd. Re-running is safe: the
# chain is flushed and rebuilt.
set -euo pipefail
CHAIN=ENGINE1GUARD

MACS=$(virsh list --all --name | grep "^engine1" | while read -r d; do
  [ -n "$d" ] && virsh dumpxml "$d" 2>/dev/null | grep -oE "mac address='[0-9a-f:]+'" | head -1 | cut -d"'" -f2
done | sort -u)
[ -n "$MACS" ] || { echo "no Engine 1 domains found; refusing to install empty rules"; exit 1; }

iptables -N $CHAIN 2>/dev/null || iptables -F $CHAIN
iptables -C FORWARD -j $CHAIN 2>/dev/null || iptables -I FORWARD 1 -j $CHAIN

n=0
for m in $MACS; do
  iptables -A $CHAIN -m mac --mac-source "$m" -o virbr0 -j DROP
  iptables -A $CHAIN -m mac --mac-source "$m" ! -o virbr0 -j DROP
  n=$((n+1))
done
echo "guard applied to $n Engine 1 MAC(s)"
iptables -L $CHAIN -n | head -8

cat <<'VERIFY'

VERIFY AFTER APPLYING, in this order:
  1. a terminal still works        curl -s -o /dev/null -w '%{http_code}\n' http://127.0.0.1:7691/
  2. provisioning still works      bash provision/inject-flag.sh engine1-team-red-cell <flagfile>
  3. teams cannot reach each other from inside a box, check a peer's port 22 is now unreachable
  4. no internet from inside a box, check 1.1.1.1:443 is now unreachable
If 1 or 2 break, the rules caught host-to-guest traffic that they should not have: flush with
`iptables -F ENGINE1GUARD` and re-examine before retrying.
VERIFY
