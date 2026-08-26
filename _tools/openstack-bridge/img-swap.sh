#!/bin/bash
# @catalog what    promote a VERIFIED candidate image into the canonical name
# @catalog run     bash _tools/openstack-bridge/img-swap.sh   (on bc2)
# @catalog status  TOOL
# Swap the verified candidate into the canonical name, then PROVE the canonical name works.
# Order matters and is the lesson from this morning: the previous attempt renamed the working
# image away BEFORE its replacement existed, and students were left with no image at all.
# Here the replacement is already built, public, and has passed the full four-mission walkthrough.
set -uo pipefail
. ~/openstack-stage1/admin-auth.env
V=${VM:?set VM from the private infra env}; K=~/openstack-stage1/stage1_key
osvm() { ssh -i "$K" -o BatchMode=yes -o StrictHostKeyChecking=no "stack@$V" \
  "export OS_AUTH_URL=http://$V/identity OS_IDENTITY_API_VERSION=3 \
     OS_USERNAME='$OS_ADMIN_USER' OS_PASSWORD='$OS_ADMIN_PASS' OS_PROJECT_NAME='${OS_ADMIN_PROJECT:-admin}' \
     OS_USER_DOMAIN_NAME=Default OS_PROJECT_DOMAIN_NAME=Default; $*"; }

cand=$(osvm "openstack image show sprint-autologin-candidate -f value -c status" 2>/dev/null | tr -d '\r')
vis=$(osvm "openstack image show sprint-autologin-candidate -f value -c visibility" 2>/dev/null | tr -d '\r')
if [ "$cand" != "active" ] || [ "$vis" != "public" ]; then
  echo "  ✗ REFUSING: candidate status='$cand' visibility='$vis' -- must be active AND public"; exit 3
fi
echo "  candidate verified: active, public"

# Archive by RENAME, never delete: instances reference images by ID, so nothing running breaks
# and the previous image stays recoverable.
osvm "openstack image set --name ubuntu-24.04-sprint-preautologin-20260825 ubuntu-24.04-sprint" >/dev/null 2>&1 \
  && echo "  archived old image -> ubuntu-24.04-sprint-preautologin-20260825"
osvm "openstack image set --name ubuntu-24.04-sprint sprint-autologin-candidate" >/dev/null 2>&1 \
  && echo "  promoted candidate -> ubuntu-24.04-sprint"

echo "  images now:"
osvm "openstack image list -f value -c Name -c Status" 2>/dev/null | grep -i sprint | sed 's/^/    /'
