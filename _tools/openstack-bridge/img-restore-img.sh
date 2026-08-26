#!/bin/bash
# @catalog what    restore the canonical sprint image name after a failed rebuild
# @catalog run     bash _tools/openstack-bridge/img-restore-img.sh   (on bc2)
# @catalog status  TOOL
# RESTORE: put the working sprint image back under its canonical name. It was renamed to make
# room for a rebuild, the rebuild failed on wedged nbd devices, and the rename left students with
# no image called ubuntu-24.04-sprint at all.
set -uo pipefail
. ~/openstack-stage1/admin-auth.env
V=${VM:?set VM from the private infra env}; K=~/openstack-stage1/stage1_key
osvm() {
  ssh -i "$K" -o BatchMode=yes -o StrictHostKeyChecking=no "stack@$V" \
    "export OS_AUTH_URL=http://$V/identity OS_IDENTITY_API_VERSION=3 \
       OS_USERNAME='$OS_ADMIN_USER' OS_PASSWORD='$OS_ADMIN_PASS' OS_PROJECT_NAME='${OS_ADMIN_PROJECT:-admin}' \
       OS_USER_DOMAIN_NAME=Default OS_PROJECT_DOMAIN_NAME=Default; $*"
}
if osvm "openstack image show ubuntu-24.04-sprint -f value -c id" >/dev/null 2>&1; then
  echo "  ubuntu-24.04-sprint already exists -- nothing to restore"
else
  osvm "openstack image set --name ubuntu-24.04-sprint ubuntu-24.04-sprint-preautologin-20260825" \
    && echo "  RESTORED: ubuntu-24.04-sprint is back"
fi
echo "  images now:"
osvm "openstack image list -f value -c Name -c Status" | grep -i sprint | sed 's/^/    /'
