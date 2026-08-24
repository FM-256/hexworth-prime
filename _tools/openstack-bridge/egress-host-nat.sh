#!/bin/bash
# Runs ON the DevStack VM. Completes the egress path the Neutron router alone cannot finish.
#
# WHAT WAS MISSING
#   The router now has a gateway on 'public' (172.24.x/24), but that external network dead-ends on
#   this host: br-ex carried NO IPv4 address and there was NO NAT rule for the range. So instance
#   -> router -> external network worked, and then nothing forwarded it to the real world.
#   Measured from inside an instance: default route present, DNS lookup FAIL, http 000.
#
#   This host itself reaches the internet fine (measured HTTP 200), so it can NAT for the range.
#
# @catalog what    host half of egress: br-ex address + MASQUERADE + a unit that survives reboot
# @catalog run     bash _tools/openstack-bridge/egress-host-nat.sh   (on the DevStack VM)
# @catalog status  TOOL
#   Normally invoked BY wire-egress.sh, which is the entry point the runbook names.
set -uo pipefail
BR=${BR:-br-ex}

echo "=== discover the external subnet ==="
SUBID=$(openstack subnet list --network public -f value -c ID -c Name 2>/dev/null | awk '$2=="public-subnet"{print $1}' | head -1)
[ -z "$SUBID" ] && SUBID=$(openstack subnet list --network public -f value -c ID 2>/dev/null | head -1)
CIDR=$(openstack subnet show "$SUBID" -f value -c cidr 2>/dev/null)
GW=$(openstack subnet show "$SUBID" -f value -c gateway_ip 2>/dev/null)
echo "  cidr=$CIDR gateway=$GW"
[ -z "$CIDR" ] && { echo "  ✗ could not determine the external CIDR"; exit 1; }

UPLINK=$(ip route | awk '/^default/{print $5; exit}')
echo "  uplink=$UPLINK"

echo
echo "=== 1. the external bridge needs the gateway address ==="
if ! ip -o link show "$BR" >/dev/null 2>&1; then
  echo "  ✗ $BR does not exist -- cannot place the external gateway. Stopping."; exit 1
fi
if ip -4 -o addr show "$BR" | grep -q "${GW}/"; then
  echo "  $BR already holds $GW"
else
  sudo ip addr add "${GW}/${CIDR##*/}" dev "$BR" 2>/dev/null && echo "  added $GW to $BR" || echo "  could not add $GW to $BR"
fi
sudo ip link set "$BR" up 2>/dev/null && echo "  $BR is up"

echo
echo "=== 2. NAT the external range out $UPLINK ==="
if sudo iptables -t nat -C POSTROUTING -s "$CIDR" ! -d "$CIDR" -o "$UPLINK" -j MASQUERADE 2>/dev/null; then
  echo "  MASQUERADE rule already present"
else
  sudo iptables -t nat -A POSTROUTING -s "$CIDR" ! -d "$CIDR" -o "$UPLINK" -j MASQUERADE \
    && echo "  added MASQUERADE for $CIDR"
fi

echo
echo "=== 3. make sure forwarding is not dropped ==="
sudo sysctl -w net.ipv4.ip_forward=1 >/dev/null
for spec in "-i $BR -j ACCEPT" "-o $BR -j ACCEPT"; do
  if sudo iptables -C FORWARD $spec 2>/dev/null; then
    echo "  FORWARD $spec already present"
  else
    sudo iptables -I FORWARD 1 $spec && echo "  added FORWARD $spec"
  fi
done

echo
echo "=== 4. persist across a power cycle ==="
# The estate must survive a reboot -- an egress path that evaporates on restart is a trap for
# whoever teaches the next class.
sudo tee /etc/systemd/system/openstack-egress-nat.service >/dev/null <<UNIT
[Unit]
Description=NAT for the OpenStack external network (restores egress after reboot)
After=network-online.target openvswitch-switch.service
Wants=network-online.target

[Service]
Type=oneshot
RemainAfterExit=yes
ExecStart=/bin/bash -c 'ip addr add ${GW}/${CIDR##*/} dev ${BR} 2>/dev/null; ip link set ${BR} up; \
  iptables -t nat -C POSTROUTING -s ${CIDR} ! -d ${CIDR} -o ${UPLINK} -j MASQUERADE 2>/dev/null || \
  iptables -t nat -A POSTROUTING -s ${CIDR} ! -d ${CIDR} -o ${UPLINK} -j MASQUERADE; \
  iptables -C FORWARD -i ${BR} -j ACCEPT 2>/dev/null || iptables -I FORWARD 1 -i ${BR} -j ACCEPT; \
  iptables -C FORWARD -o ${BR} -j ACCEPT 2>/dev/null || iptables -I FORWARD 1 -o ${BR} -j ACCEPT; \
  sysctl -w net.ipv4.ip_forward=1'

[Install]
WantedBy=multi-user.target
UNIT
sudo systemctl daemon-reload
sudo systemctl enable --now openstack-egress-nat.service >/dev/null 2>&1 \
  && echo "  openstack-egress-nat.service enabled: $(systemctl is-enabled openstack-egress-nat.service 2>/dev/null)" \
  || echo "  ✗ could not enable the persistence unit"

echo
echo "=== state now ==="
ip -4 -o addr show "$BR" | awk '{print "  " $2, $4}'
sudo iptables -t nat -S POSTROUTING | grep MASQUERADE | sed 's/^/  /'
