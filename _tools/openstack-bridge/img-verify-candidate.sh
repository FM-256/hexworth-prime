#!/bin/bash
# @catalog what    boot a candidate image and prove autologin before promoting it
# @catalog run     bash _tools/openstack-bridge/img-verify-candidate.sh   (on bc2)
# @catalog status  TOOL
# PROVE the candidate before swapping anything. Boot an instance from it with NO user-data at all
# -- if autologin is genuinely baked in, the console reaches a shell on its own. This is the step
# that was skipped last time, which is how a broken rename reached students.
set -uo pipefail
. ~/openstack-stage1/admin-auth.env
V=${VM:?set VM from the private infra env}; K=~/openstack-stage1/stage1_key
osvm() { ssh -i "$K" -o BatchMode=yes -o StrictHostKeyChecking=no "stack@$V" \
  "export OS_AUTH_URL=http://$V/identity OS_IDENTITY_API_VERSION=3 \
     OS_USERNAME='$OS_ADMIN_USER' OS_PASSWORD='$OS_ADMIN_PASS' OS_PROJECT_NAME='${OS_ADMIN_PROJECT:-admin}' \
     OS_USER_DOMAIN_NAME=Default OS_PROJECT_DOMAIN_NAME=Default; $*"; }

NET=$(osvm "openstack network list -f value -c ID -c Name" 2>/dev/null | awk '/shared/{print $1}' | head -1 | tr -d '\r')
osvm "openstack server delete cand-verify" >/dev/null 2>&1; sleep 5
echo "  booting cand-verify from the CANDIDATE image, no user-data"
osvm "openstack server create --flavor ds512M --image sprint-autologin-candidate --network $NET cand-verify" >/dev/null 2>&1
for i in $(seq 1 40); do
  s=$(osvm "openstack server show cand-verify -f value -c status" 2>/dev/null | tr -d '\r')
  [ "$s" = "ACTIVE" ] && break; [ "$s" = "ERROR" ] && break; sleep 10
done
echo "  cand-verify: ${s:-<none>}"
[ "$s" != "ACTIVE" ] && exit 3
echo "  waiting for boot, then reading the console..."
sleep 75
osvm "openstack console log show cand-verify --lines 25" 2>/dev/null | tail -14 | sed 's/^/    /'
