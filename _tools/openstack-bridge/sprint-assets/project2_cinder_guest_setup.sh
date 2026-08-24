#!/usr/bin/env bash
# Run INSIDE the guest only after the instructor confirms the attached Cinder device.
# Usage: sudo ./project2_cinder_guest_setup.sh /dev/vdb
set -euo pipefail
DEV="${1:-/dev/vdb}"
MOUNT="/srv/clouddrop"

echo "WARNING: This formats $DEV. Confirm this is the newly attached EMPTY Cinder volume."
read -r -p "Type FORMAT to continue: " answer
[[ "$answer" == "FORMAT" ]] || { echo "Cancelled."; exit 1; }

sudo mkfs.ext4 -F "$DEV"
sudo mkdir -p "$MOUNT"
sudo mount "$DEV" "$MOUNT"
if ! id clouddrop >/dev/null 2>&1; then
  sudo adduser --gecos "" clouddrop
fi
sudo chown clouddrop:clouddrop "$MOUNT"
UUID=$(sudo blkid -s UUID -o value "$DEV")
echo "UUID=$UUID $MOUNT ext4 defaults,nofail 0 2" | sudo tee -a /etc/fstab

echo "Mounted $DEV at $MOUNT"
df -h "$MOUNT"
