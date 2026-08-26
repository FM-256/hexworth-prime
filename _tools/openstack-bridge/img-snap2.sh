#!/bin/bash
# @catalog what    snapshot a prepared instance into a candidate sprint image
# @catalog run     bash _tools/openstack-bridge/img-snap2.sh   (on bc2)
# @catalog status  TOOL
# Snapshot by ID: admin cannot resolve a server that lives in a student project by NAME unless
# --all-projects is passed, which is why the previous run found nothing.
set -uo pipefail
. ~/openstack-stage1/admin-auth.env
V=${VM:?set VM from the private infra env}; K=~/openstack-stage1/stage1_key
osvm() { ssh -i "$K" -o BatchMode=yes -o StrictHostKeyChecking=no "stack@$V" \
  "export OS_AUTH_URL=http://$V/identity OS_IDENTITY_API_VERSION=3 \
     OS_USERNAME='$OS_ADMIN_USER' OS_PASSWORD='$OS_ADMIN_PASS' OS_PROJECT_NAME='${OS_ADMIN_PROJECT:-admin}' \
     OS_USER_DOMAIN_NAME=Default OS_PROJECT_DOMAIN_NAME=Default; $*"; }

echo "  candidate instances (all projects):"
osvm "openstack server list --all-projects -f value -c ID -c Name -c Status" 2>/dev/null \
  | grep -iE "img-prep|console-test" | sed 's/^/    /'
ID=$(osvm "openstack server list --all-projects -f value -c ID -c Name" 2>/dev/null | awk '/img-prep/{print $1}' | head -1 | tr -d '\r')
if [ -z "$ID" ]; then echo "  img-prep is gone -- will need a fresh prep instance"; exit 2; fi
echo "  img-prep id: ${ID:0:8}"
osvm "openstack server image create --name sprint-autologin-candidate $ID" >/dev/null 2>&1
for i in $(seq 1 40); do
  s=$(osvm "openstack image show sprint-autologin-candidate -f value -c status" 2>/dev/null | tr -d '\r')
  [ "$s" = "active" ] && break
  sleep 10
done
echo "  candidate status: ${s:-<none>}"
