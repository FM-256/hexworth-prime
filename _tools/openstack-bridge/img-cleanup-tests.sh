#!/bin/bash
# @catalog what    delete this session's test instances by exact name
# @catalog run     bash _tools/openstack-bridge/img-cleanup-tests.sh   (on bc2)
# @catalog status  TOOL
# Remove ONLY the instances this session created while fixing the console. Documented first,
# then deleted by EXACT name -- no globbing, so nothing a student built can be caught by it.
set -uo pipefail
. ~/openstack-stage1/admin-auth.env
V=${VM:?set VM from the private infra env}; K=~/openstack-stage1/stage1_key
osvm() { ssh -i "$K" -o BatchMode=yes -o StrictHostKeyChecking=no "stack@$V" \
  "export OS_AUTH_URL=http://$V/identity OS_IDENTITY_API_VERSION=3 \
     OS_USERNAME='$OS_ADMIN_USER' OS_PASSWORD='$OS_ADMIN_PASS' OS_PROJECT_NAME='${OS_ADMIN_PROJECT:-admin}' \
     OS_USER_DOMAIN_NAME=Default OS_PROJECT_DOMAIN_NAME=Default; $*"; }

MINE="final-check cand-verify asset-verify img-prep console-test-vm pw-test-vm office-test-vm"

echo "  INVENTORY BEFORE (documented for the record):"
all=$(osvm "openstack server list --all-projects -f value -c ID -c Name -c Status" 2>/dev/null)
for n in $MINE; do
  echo "$all" | awk -v n="$n" '$2==n {printf "    %s  %s  %s\n", substr($1,1,8), $2, $3}'
done

echo "  deleting:"
for n in $MINE; do
  id=$(echo "$all" | awk -v n="$n" '$2==n {print $1}' | head -1)
  [ -z "$id" ] && continue
  osvm "openstack server delete $id" >/dev/null 2>&1 && echo "    deleted $n (${id:0:8})"
done

sleep 20
echo "  INVENTORY AFTER:"
left=$(osvm "openstack server list --all-projects -f value -c Name" 2>/dev/null)
found=0
for n in $MINE; do
  echo "$left" | grep -qx "$n" && { echo "    STILL PRESENT: $n"; found=1; }
done
[ "$found" = "0" ] && echo "    all test instances removed"
echo "  remaining servers on the cloud: $(echo "$left" | grep -c . )"
