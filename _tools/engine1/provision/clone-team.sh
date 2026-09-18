#!/usr/bin/env bash
# Engine 1: give a team its own instance, as a copy-on-write overlay off the read-only golden.
#
# WHY PER TEAM. One shared box in a scored tournament means the first team to escalate can
# change the flag file's ACL, patch the path they used, or crash the machine, and they would be
# doing it to everyone else's event. There is no per-team state on a shared box and no way to
# tell a broken box from a sabotaged one.
#
# This is the SAME mechanism as rollback: the golden is never written, so a team's instance can
# be replaced by making a new overlay. Cost is a few MB per team until it diverges.
# CREATE ONLY: refuses if the domain or overlay already exists.
set -euo pipefail
BASE=/srv/hexworth/engine1
GOLD="$BASE/images/engine1-v2.qcow2"
TEAM="${1:?usage: clone-team.sh <team-slug> [start|defined]}"
START="${2:-defined}"
NAME="engine1-team-$TEAM"
OVL="$BASE/images/$NAME.qcow2"

if sudo virsh dominfo "$NAME" >/dev/null 2>&1; then echo "SKIP: domain $NAME already exists"; exit 0; fi
if [ -f "$OVL" ]; then echo "SKIP: overlay $OVL already exists"; exit 0; fi

qemu-img create -f qcow2 -b "$GOLD" -F qcow2 "$OVL" >/dev/null
sudo setfacl -m u:libvirt-qemu:rw "$OVL"

sudo virsh dumpxml engine1-live-v1 > /tmp/$NAME.xml
MAC=$(printf "52:54:00:%02x:%02x:%02x" $((RANDOM%256)) $((RANDOM%256)) $((RANDOM%256)))
sed -i -e "s|engine1-live-v1.qcow2|$NAME.qcow2|" \
       -e "s|<name>engine1-live-v1</name>|<name>$NAME</name>|" \
       -e "s|52:54:00:45:eb:ef|$MAC|" \
       -e "/<uuid>/d" /tmp/$NAME.xml
sudo virsh define /tmp/$NAME.xml >/dev/null
echo "defined $NAME  overlay=$(du -h "$OVL" | cut -f1)  mac=$MAC"
[ "$START" = "start" ] && { sudo virsh start "$NAME" >/dev/null; echo "  started"; } || echo "  left shut off (RAM budget: 4GB each, 31GB total)"
