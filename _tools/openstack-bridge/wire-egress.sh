#!/bin/bash
# Give instances on 'shared' real internet access.
#
# WHY THIS WAS MISSING
#   shared-subnet declares a gateway at .1 but NO router ever had an interface on it, and
#   dns_nameservers was empty. It was an isolated L2 segment: peers could reach each other
#   because that is layer 2, but nothing could route out, so apt/pip/nmap-to-the-internet all
#   failed. I worked around it by baking packages into the image instead of fixing the topology.
#
# WHAT THIS DOES
#   Creates one router, gives it a gateway on the external network, attaches it to shared-subnet,
#   and sets DNS resolvers on the subnet. That is outbound (SNAT) for every instance on 'shared',
#   and it is also the prerequisite for floating IPs to associate at all.
#
# @catalog what    wire a router + DNS so instances on 'shared' get internet egress
# @catalog run     bash _tools/openstack-bridge/wire-egress.sh   (on bc2)
# @catalog status  TOOL
set -uo pipefail
KEY=$HOME/openstack-stage1/stage1_key
VM=${STAGE1_VM:-192.168.122.62}
ADMIN_ENV=$HOME/openstack-stage1/admin-auth.env
ROUTER=${ROUTER:-shared-router}
EXTNET=${EXTNET:-public}
SUBNET=${SUBNET:-shared-subnet}
DNS1=${DNS1:-8.8.8.8}
DNS2=${DNS2:-1.1.1.1}

[ -r "$ADMIN_ENV" ] || { echo "✗ need $ADMIN_ENV -- run on bc2"; exit 2; }
set -a; . "$ADMIN_ENV"; set +a
os(){ ssh -i "$KEY" -o BatchMode=yes -o StrictHostKeyChecking=no stack@$VM \
  "export OS_AUTH_URL=http://${VM}/identity OS_IDENTITY_API_VERSION=3 OS_USERNAME='$OS_ADMIN_USER' OS_PASSWORD='$OS_ADMIN_PASS' OS_PROJECT_NAME='$OS_ADMIN_PROJECT' OS_USER_DOMAIN_NAME=Default OS_PROJECT_DOMAIN_NAME=Default; $*"; }

echo "=== before ==="
echo "  routers: $(os "openstack router list -f value -c Name" 2>/dev/null | tr '\n' ' ')${NONE:-}"
os "openstack subnet show $SUBNET -f value -c gateway_ip -c dns_nameservers -c cidr" 2>/dev/null | sed 's/^/  subnet: /'

echo
echo "=== 1. router with a gateway on $EXTNET ==="
if os "openstack router show $ROUTER -f value -c id" >/dev/null 2>&1; then
  echo "  router $ROUTER already exists"
else
  os "openstack router create $ROUTER -f value -c id" >/dev/null 2>&1 && echo "  created $ROUTER"
fi
os "openstack router set --external-gateway $EXTNET $ROUTER" 2>&1 | sed 's/^/  /'
os "openstack router show $ROUTER -f value -c external_gateway_info" 2>/dev/null | head -c 200 | sed 's/^/  gateway: /'; echo

echo
echo "=== 2. attach it to $SUBNET (this is what claims the .1 the subnet always advertised) ==="
os "openstack router add subnet $ROUTER $SUBNET" 2>&1 | sed 's/^/  /'
os "openstack port list --router $ROUTER -f value -c 'Fixed IP Addresses'" 2>/dev/null | head -3 | sed 's/^/  router port: /'

echo
echo "=== 3. DNS on the subnet (empty dns_nameservers is why name resolution failed) ==="
os "openstack subnet set --dns-nameserver $DNS1 --dns-nameserver $DNS2 $SUBNET" 2>&1 | sed 's/^/  /'
os "openstack subnet show $SUBNET -f value -c dns_nameservers" 2>/dev/null | sed 's/^/  dns now: /'

echo
echo "=== 4. the HOST half, without which the router is not enough ==="
# Measured 2026-08-24: with the router in place but br-ex holding no address and no NAT rule,
# an instance had a default route and still got dns=FAIL, http=000. The external network
# dead-ends on this host until it is given the gateway address and a MASQUERADE rule.
HOSTFIX="$(cd "$(dirname "$0")" && pwd)/egress-host-nat.sh"
if [ -r "$HOSTFIX" ]; then
  scp -q -i "$KEY" -o BatchMode=yes -o StrictHostKeyChecking=no "$HOSTFIX" "stack@$VM:/tmp/egress-host-nat.sh"
  ssh -i "$KEY" -o BatchMode=yes -o StrictHostKeyChecking=no "stack@$VM" \
    "export OS_AUTH_URL=http://${VM}/identity OS_IDENTITY_API_VERSION=3 OS_USERNAME='$OS_ADMIN_USER' OS_PASSWORD='$OS_ADMIN_PASS' OS_PROJECT_NAME='$OS_ADMIN_PROJECT' OS_USER_DOMAIN_NAME=Default OS_PROJECT_DOMAIN_NAME=Default; bash /tmp/egress-host-nat.sh" \
    | sed 's/^/  /'
else
  echo "  ✗ egress-host-nat.sh not found beside this script -- the host half did NOT run,"
  echo "    and instances will still have no route out. Run it on the DevStack VM by hand."
fi

echo
echo "=== VERIFY from inside an instance, not from here ==="
echo "  A router that exists is not egress that works. Boot an instance on 'shared' and check"
echo "  dns + http from inside it. See sprint-student-walkthrough.sh for the pattern."

echo
echo "=== after ==="
os "openstack router list -f value -c Name -c Status" 2>/dev/null | sed 's/^/  router: /'
echo "  NOTE: instances already running keep their old DHCP lease. New instances get DNS"
echo "        immediately; existing ones need a lease renew or a reboot."
