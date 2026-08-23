#!/bin/bash
# Makes the cloud able to run the Cloud Security Sprint. Run on bc2. Idempotent.
#
# WHY THIS EXISTS
#   The sprint's four projects (nginx site, SFTP+Cinder drop, Flask API, honeypot) all need a real
#   Linux distro: apt, systemd, adduser, python3-venv. On 2026-08-22 this cloud had exactly one
#   bootable image -- cirros-0.6.3 -- which is BusyBox. No package manager, no systemd, no python.
#   Every build command in the packet failed on its first line.
#
#   The second blocker was quota. Ubuntu 24.04 minimal declares min_ram 512 / min_disk 3, and the
#   per-slot quota was 192MB RAM, which fits only m1.nano (192MB / 1GB disk). m1.micro and m1.tiny
#   are also out -- both have 1GB disk. ds512M (512MB / 5GB) is the smallest flavor that fits.
#
# ⚠ REBUILD NOTE: DevStack is rebuilt from snapshot each term, exactly like ensure-second-network.sh
#   warns. THIS MUST BE RE-RUN AFTER EVERY REBUILD or the sprint quietly reverts to cirros-only and
#   a 192MB quota, and every student hits "No valid host" or a BusyBox prompt.
#
# WHAT IT DOES NOT DO
#   It does not grow the DevStack VM's RAM. That is a libvirt change on bc2 requiring a VM restart
#   (the guest ignores ACPI; see the runbook). Capacity is REPORTED here, never silently changed.
#
# @catalog what    make the cloud sprint-ready: ubuntu image + per-slot quota (idempotent)
# @catalog run     bash _tools/openstack-bridge/ensure-sprint-ready.sh   (on bc2)
# @catalog status  TOOL
set -euo pipefail

IMAGE_NAME=ubuntu-24.04-minimal
IMAGE_URL=https://cloud-images.ubuntu.com/minimal/releases/noble/release/ubuntu-24.04-minimal-cloudimg-amd64.img
FLAVOR=ds512M
QUOTA_RAM=512
KEY=${STAGE1_KEY:-$HOME/openstack-stage1/stage1_key}
VMADDR=${STAGE1_VM:-192.168.122.62}
ADMIN_ENV=${ADMIN_ENV:-$HOME/openstack-stage1/admin-auth.env}

[ -r "$ADMIN_ENV" ] || { echo "✗ cannot read $ADMIN_ENV -- run this on bc2"; exit 2; }
set -a; . "$ADMIN_ENV"; set +a

ssh -i "$KEY" -o BatchMode=yes -o StrictHostKeyChecking=no "stack@$VMADDR" \
  "U='$OS_ADMIN_USER' P='$OS_ADMIN_PASS' PR='$OS_ADMIN_PROJECT' \
   IMAGE_NAME='$IMAGE_NAME' IMAGE_URL='$IMAGE_URL' FLAVOR='$FLAVOR' QUOTA_RAM='$QUOTA_RAM' bash -s" <<'REMOTE'
set -uo pipefail
export OS_AUTH_URL=http://192.168.122.62/identity OS_IDENTITY_API_VERSION=3 \
       OS_USERNAME="$U" OS_PASSWORD="$P" OS_PROJECT_NAME="$PR" \
       OS_USER_DOMAIN_NAME=Default OS_PROJECT_DOMAIN_NAME=Default

rc=0

# ── 0. the SPRINT image (packages baked in; students have no egress) ─────────
# Delegated so the build lives in one place. Idempotent: exits early if already in glance.
if ! openstack image show ubuntu-24.04-sprint -f value -c status 2>/dev/null | grep -q active; then
  echo "  [do]    ubuntu-24.04-sprint missing -- run build-sprint-image.sh on bc2 to create it"
  echo "          (not auto-run here: it needs sudo/qemu-nbd on bc2, not the DevStack VM)"
  rc=1
else
  echo "  [skip]  ubuntu-24.04-sprint already active"
fi

# ── 1. the image ─────────────────────────────────────────────────────────────
st=$(openstack image show "$IMAGE_NAME" -f value -c status 2>/dev/null || true)
if [ "$st" = active ]; then
  echo "  [skip]  image $IMAGE_NAME already active"
else
  echo "  [do]    uploading $IMAGE_NAME (~252MB)"
  F=/tmp/${IMAGE_NAME}.img
  [ -s "$F" ] || curl -fsSL -o "$F" "$IMAGE_URL" || { echo "  ✗ download failed"; exit 1; }
  # PUBLIC so every student project can boot it. min_ram/min_disk are what rule out m1.nano.
  openstack image create "$IMAGE_NAME" --disk-format qcow2 --container-format bare --public \
    --min-disk 3 --min-ram 512 --property os_distro=ubuntu --property os_version=24.04 \
    --file "$F" -f value -c id >/dev/null && echo "  [ok]    image uploaded" || { echo "  ✗ upload failed"; rc=1; }
fi

# ── 2. the flavor must exist and still fit the image ─────────────────────────
fr=$(openstack flavor show "$FLAVOR" -f value -c ram 2>/dev/null || echo 0)
fd=$(openstack flavor show "$FLAVOR" -f value -c disk 2>/dev/null || echo 0)
if [ "${fr:-0}" -ge 512 ] && [ "${fd:-0}" -ge 3 ]; then
  echo "  [ok]    flavor $FLAVOR = ${fr}MB / ${fd}GB (fits min_ram 512, min_disk 3)"
else
  echo "  ✗ flavor $FLAVOR missing or too small (${fr}MB/${fd}GB) -- the image will not boot"; rc=1
fi

# ── 3. quota on every pool slot ──────────────────────────────────────────────
raised=0; already=0
for p in $(openstack project list -f value -c Name | grep -E '^student-[0-9]+$' | sort); do
  cur=$(openstack quota show "$p" 2>/dev/null | awk '/\| ram /{print $4}')
  if [ "${cur:-0}" -ge "$QUOTA_RAM" ] 2>/dev/null; then already=$((already+1)); continue; fi
  openstack quota set --instances 1 --cores 1 --ram "$QUOTA_RAM" "$p" 2>/dev/null \
    && raised=$((raised+1)) || echo "  ✗ quota set failed for $p"
done
echo "  [ok]    quota: raised $raised, already-ok $already"

# ── 4. capacity is REPORTED, never changed ───────────────────────────────────
free=$(openstack hypervisor stats show -f value -c free_ram_mb 2>/dev/null || echo 0)
echo "  [info]  nova free RAM ${free}MB -> about $((free/512)) more ${FLAVOR} instances"
echo "  [info]  if that is below your class size, grow the DevStack VM (see the runbook);"
echo "          this script deliberately does not restart the VM."
exit $rc
REMOTE
