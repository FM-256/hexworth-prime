#!/bin/bash
# @catalog what    allow ICMP between student instances on the shared lab subnet
# @catalog run     bash _tools/openstack-bridge/allow-peer-icmp.sh   (on bc2)
# @catalog status  TOOL
# Let student instances PING each other across projects.
#
# Today each project's default group allows all protocols only from ITSELF (remote_group = self),
# so two students -- who are in different projects -- cannot reach each other at all without
# adding rules. That is why the sprint uses `nmap -Pn` and why "can you ping your partner" has
# never worked.
#
# Scoped to the shared lab subnet, NOT 0.0.0.0/0, and ICMP ONLY. TCP still needs the explicit
# per-port, per-peer rules the sprint teaches -- this restores basic reachability testing without
# giving away the security lesson.
# Idempotent: a project that already has the rule is skipped.
set -uo pipefail
. ~/openstack-stage1/admin-auth.env
V=192.168.122.62; K=~/openstack-stage1/stage1_key
CIDR=192.168.233.0/24
osvm() { ssh -i "$K" -o BatchMode=yes -o StrictHostKeyChecking=no "stack@$V" \
  "export OS_AUTH_URL=http://$V/identity OS_IDENTITY_API_VERSION=3 \
     OS_USERNAME='$OS_ADMIN_USER' OS_PASSWORD='$OS_ADMIN_PASS' OS_PROJECT_NAME='${OS_ADMIN_PROJECT:-admin}' \
     OS_USER_DOMAIN_NAME=Default OS_PROJECT_DOMAIN_NAME=Default; $*"; }

added=0; skipped=0; failed=0
for p in $(osvm "openstack project list -f value -c Name" 2>/dev/null | grep -E '^student-[0-9]+' | tr -d '\r' | sort); do
  pid=$(osvm "openstack project show $p -f value -c id" 2>/dev/null | tr -d '\r')
  gid=$(osvm "openstack security group list --project $pid -f value -c ID -c Name" 2>/dev/null | awk '/default/{print $1}' | head -1 | tr -d '\r')
  [ -z "$gid" ] && { failed=$((failed+1)); continue; }
  if osvm "openstack security group rule list $gid -f value -c 'IP Protocol' -c 'IP Range'" 2>/dev/null | grep -q "icmp *$CIDR"; then
    skipped=$((skipped+1)); continue
  fi
  if osvm "openstack security group rule create --protocol icmp --ingress --remote-ip $CIDR $gid" >/dev/null 2>&1; then
    added=$((added+1))
  else
    failed=$((failed+1))
  fi
done
echo "  ICMP ingress from $CIDR -> added=$added already-had=$skipped failed=$failed"
