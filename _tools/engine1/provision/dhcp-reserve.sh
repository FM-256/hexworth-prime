#!/usr/bin/env bash
# Engine 1: pin each team's VM to a fixed address by MAC.
#
# THE PROBLEM. Addresses are DHCP leases. A host or VM reboot can reshuffle them, and the browser
# terminals hold a fixed target address. A team would then silently land on ANOTHER TEAM'S BOX,
# which is worse than an outage because nothing looks broken.
#
# Reservations are added --live --config so running VMs keep their current lease and the mapping
# survives a restart. CREATE ONLY: an existing reservation for a MAC is left alone.
set -euo pipefail
declare -A WANT=( [blue-shield-v3]=192.168.122.18 [cyan-storm]=192.168.122.91 [gold-strike]=192.168.122.134
                  [green-ops]=192.168.122.131 [purple-haze]=192.168.122.191 [red-cell]=192.168.122.173 )
for t in "${!WANT[@]}"; do
  d="engine1-team-$t"; ip="${WANT[$t]}"
  mac=$(sudo virsh dumpxml "$d" 2>/dev/null | grep -oE "mac address='[0-9a-f:]+'" | head -1 | cut -d"'" -f2)
  [ -n "$mac" ] || { echo "  $t: no MAC, skipped"; continue; }
  if sudo virsh net-dumpxml default | grep -q "$mac"; then echo "  $t: reservation already present"; continue; fi
  if sudo virsh net-update default add ip-dhcp-host \
      "<host mac='$mac' name='$d' ip='$ip'/>" --live --config >/dev/null 2>&1; then
    echo "  $t: $mac pinned to $ip"
  else
    echo "  $t: reservation FAILED (is the address already leased to another MAC?)"
  fi
done
echo "--- reservations now in the network definition ---"
sudo virsh net-dumpxml default | grep "dhcp-host\|<host mac" | sed 's/^/  /' | head -8
