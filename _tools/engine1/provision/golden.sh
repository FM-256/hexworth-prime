#!/usr/bin/env bash
# Engine 1: freeze the installed disk as a READ-ONLY golden base and run the live instance from
# a copy-on-write overlay. This is the rollback mechanism AND the per-team clone mechanism:
#   rollback  = point a new overlay at the same base (the base is never written)
#   per-team  = one overlay per team, each a few MB until it diverges
# CREATE ONLY. The base is chmod'd read-only, never removed. The original domain stays defined.
set -euo pipefail
BASE=/srv/hexworth/engine1
GOLD="$BASE/images/engine1-v2.qcow2"
LIVE="$BASE/images/engine1-live-v1.qcow2"

echo "=== 1. clean shutdown ==="
sudo virsh shutdown engine1-v2 >/dev/null 2>&1 || true
for i in $(seq 1 30); do
  st=$(sudo virsh domstate engine1-v2 2>/dev/null || echo unknown)
  [ "$st" = "shut off" ] && break
  sleep 5
done
echo "state: $(sudo virsh domstate engine1-v2 2>/dev/null)"

echo "=== 2. record what the golden image IS ==="
qemu-img info "$GOLD" | grep -E "file format|virtual size|disk size"
sudo chmod a-w "$GOLD"
echo "base is now read-only: $(ls -l "$GOLD" | awk '{print $1}')"

echo "=== 3. libvirt snapshot as a second, independent restore point ==="
sudo virsh snapshot-create-as engine1-v2 base-clean-v1 "Windows Server 2022 Core eval, OpenSSH + RDP up, key installed, before any CTF content" --atomic 2>&1 | tail -1
sudo virsh snapshot-list engine1-v2 2>/dev/null | tail -3

echo "=== 4. copy-on-write overlay for the live instance ==="
if [ -f "$LIVE" ]; then echo "REFUSING: $LIVE exists; append-only tree, use a new version."; exit 1; fi
qemu-img create -f qcow2 -b "$GOLD" -F qcow2 "$LIVE" >/dev/null
sudo setfacl -m u:libvirt-qemu:rw "$LIVE"
sudo setfacl -m u:libvirt-qemu:r "$GOLD"
echo "overlay: $(ls -la "$LIVE" | awk '{print $5" bytes"}') backed by $(basename "$GOLD")"

echo "=== 5. define the live domain (the golden domain stays defined and untouched) ==="
sudo virsh dumpxml engine1-v2 > /tmp/engine1-live-v1.xml
sed -i -e "s|engine1-v2.qcow2|engine1-live-v1.qcow2|" \
       -e "s|<name>engine1-v2</name>|<name>engine1-live-v1</name>|" \
       -e "/<uuid>/d" /tmp/engine1-live-v1.xml
sudo virsh define /tmp/engine1-live-v1.xml 2>&1 | tail -1
sudo virsh start engine1-live-v1 2>&1 | tail -1
sleep 45
sudo virsh list --all
