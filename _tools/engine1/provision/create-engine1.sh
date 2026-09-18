#!/usr/bin/env bash
# Engine 1: create the base VM and start the unattended install.
# CREATE ONLY. New disk at a versioned path; nothing existing is touched or removed.
set -euo pipefail
BASE=/srv/hexworth/engine1
V="${1:-v1}"
NAME="engine1-$V"
DISK="$BASE/images/$NAME.qcow2"

if sudo virsh dominfo "$NAME" >/dev/null 2>&1; then
  echo "REFUSING: domain $NAME already exists. Pick a new version rather than replacing it."
  exit 1
fi
if [ -f "$DISK" ]; then
  echo "REFUSING: $DISK already exists. This tree is append-only; use a new version."
  exit 1
fi

qemu-img create -f qcow2 "$DISK" 60G
sudo setfacl -m u:libvirt-qemu:rw "$DISK"
echo "disk created: $(ls -la "$DISK" | awk '{print $5" bytes (sparse) "$9}')"

# SATA + e1000e on purpose: Windows Setup has inbox drivers for both, so no virtio driver
# injection is needed for a first install. Slower I/O, far fewer moving parts. virtio can be
# swapped in later against a snapshot, which is why the snapshot comes before any tuning.
sudo virt-install \
  --name "$NAME" \
  --memory 4096 --vcpus 2 \
  --cpu host-passthrough \
  --disk path="$DISK",format=qcow2,bus=sata \
  --cdrom "$BASE/iso/win2022-eval.iso" \
  --disk path="$BASE/provision/v2/engine1-unattend-v2.iso",device=cdrom,bus=sata,readonly=on \
  --network network=default,model=e1000e \
  --graphics vnc,listen=127.0.0.1 \
  --os-variant win2k19 \
  --noautoconsole \
  --wait -1 &
sleep 25
sudo virsh list --all
echo "install started. This runs unattended for roughly 10-20 minutes."
