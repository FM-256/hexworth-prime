#!/bin/bash
# Creates the SECOND shared tenant network. Run on bc2. Idempotent.
#
# WHY THIS EXISTS: with exactly one shared network, Nova silently auto-attaches it, so
# `--network` is optional and a student cannot fail to attach one. That made lab 2's
# check 16 undefeatable -- it asserted a true outcome but could not discriminate, which
# is a check that cannot fail, i.e. not a check.
#
# With TWO shared networks Nova refuses to guess:
#   Multiple possible networks found, use a Network ID to be more specific. (HTTP 409)
# MEASURED 2026-07-31 via the lab's own adversarial harness, not from docs. That is a
# stronger rejection than the grader could give, and it matches every real cloud.
#
# Rebuild note: DevStack is rebuilt from snapshot each term. THIS MUST BE RE-RUN after
# every rebuild or lab 2 quietly regresses to an undefeatable check 16.
set -euo pipefail
KEY=$(eval echo $(grep -o "VM_KEY=[^ ]*" ~/openstack-stage1/provision-pool.sh | head -1 | cut -d= -f2-))
REMOTE='source ~/devstack/openrc admin admin >/dev/null 2>&1
if openstack network show lab-net >/dev/null 2>&1; then
  echo "lab-net already present"
else
  openstack network create --share lab-net -f value -c name
  openstack subnet create --network lab-net --subnet-range 10.99.0.0/24 --no-dhcp lab-subnet -f value -c name
fi
echo "shared networks: $(openstack network list --share -f value -c Name | tr "\n" " ")"'
ssh -o BatchMode=yes -i "$KEY" stack@192.168.122.62 "echo $(echo "$REMOTE" | base64 -w0) | base64 -d > /tmp/ensure-net.sh; bash /tmp/ensure-net.sh" < /dev/null
