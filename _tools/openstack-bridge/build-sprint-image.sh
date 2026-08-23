#!/bin/bash
# Build ubuntu-24.04-sprint: the Cloud Security Sprint guest image, with every package the four
# missions need BAKED IN. Run on bc2. Idempotent -- exits early if the image is already in Glance.
#
# WHY BAKE INSTEAD OF LETTING STUDENTS apt install
#   Student instances have NO internet. Measured 2026-08-23 end-to-end from inside a booted
#   instance: archive.ubuntu.com -> HTTP 000, dns=FAIL, every `apt install` -> "Unable to locate
#   package". The `shared` subnet declares a gateway at .1 but NO router has an interface on it and
#   dns_nameservers is empty -- it is an isolated L2 segment. Peer-to-peer works because that is
#   L2; egress is L3 and was never built.
#
#   Baking is also MORE repeatable than fixing egress: the image is a fixed artifact, so class N+1
#   behaves exactly like class N and no package mirror has to be reachable on the day.
#
# ⚠⚠ THE TRAP THAT COST TWO FAILED BUILDS: `apt-get update` EXITS 0 WITH NO NETWORK. It fetches
#   nothing, reports success, and every later install fails with "Unable to locate package". This
#   bit twice -- once inside student instances, and once inside the libguestfs appliance. NEVER
#   read a clean `apt update` as proof of connectivity. Check that package lists actually arrived.
#
# ⚠ WHY NOT virt-customize --install
#   Its appliance has no DNS on this host (measured: dns=FAIL, all candidates empty), and because
#   of the trap above it fails LATE and misleadingly -- naming a different arbitrary pair of
#   "missing" packages each run. qemu-nbd + chroot uses bc2's OWN working resolver instead. No
#   appliance, no appliance networking.
#
# ⚠ `universe` is ALREADY enabled in ubuntu-24.04-minimal (Components: main universe restricted
#   multiverse). Do not "fix" that -- it was never the problem.
#
# @catalog what    build+upload ubuntu-24.04-sprint (nginx/flask/nmap baked in, no egress needed)
# @catalog run     bash _tools/openstack-bridge/build-sprint-image.sh   (on bc2)
# @catalog status  TOOL
set -euo pipefail

# Overridable SO THE BUILD PATH CAN BE EXERCISED without touching the live image. A build script
# whose DO branch has never run is not a tested script -- only its skip branch would be.
NAME=${SPRINT_IMAGE_NAME:-ubuntu-24.04-sprint}
BASE_URL=https://cloud-images.ubuntu.com/minimal/releases/noble/release/ubuntu-24.04-minimal-cloudimg-amd64.img
BASE=/tmp/ubuntu-24.04-minimal.img
OUT=/tmp/${NAME}.img
MNT=/mnt/sprintimg
KEY=${STAGE1_KEY:-$HOME/openstack-stage1/stage1_key}
VMADDR=${STAGE1_VM:-192.168.122.62}
ADMIN_ENV=${ADMIN_ENV:-$HOME/openstack-stage1/admin-auth.env}

# nginx           Mission 1
# nmap ping       the scan / verify steps
# python3-flask   Mission 3 -- system-wide, because `pip install flask` needs PyPI, a SECOND
#                 egress dependency the missions cannot satisfy
# openssh-client  Mission 2 sftp
PKGS="nginx nmap iputils-ping python3-flask openssh-client curl ca-certificates"

[ -r "$ADMIN_ENV" ] || { echo "✗ cannot read $ADMIN_ENV -- run this on bc2"; exit 2; }
set -a; . "$ADMIN_ENV"; set +a

osvm() {  # run an openstack command on the DevStack VM as admin
  ssh -i "$KEY" -o BatchMode=yes -o StrictHostKeyChecking=no "stack@$VMADDR" \
    "export OS_AUTH_URL=http://${VMADDR}/identity OS_IDENTITY_API_VERSION=3 \
       OS_USERNAME='$OS_ADMIN_USER' OS_PASSWORD='$OS_ADMIN_PASS' OS_PROJECT_NAME='$OS_ADMIN_PROJECT' \
       OS_USER_DOMAIN_NAME=Default OS_PROJECT_DOMAIN_NAME=Default; $*"
}

if osvm "openstack image show $NAME -f value -c status" 2>/dev/null | grep -q active; then
  echo "  [skip] $NAME already active in glance"; exit 0
fi

cleanup() {
  set +e
  sudo umount "$MNT/dev/pts" 2>/dev/null
  for d in dev proc sys; do sudo umount "$MNT/$d" 2>/dev/null; done
  sudo umount "$MNT" 2>/dev/null
  [ -n "${NBD:-}" ] && sudo qemu-nbd --disconnect "$NBD" >/dev/null 2>&1
}
trap cleanup EXIT

echo "  [1] base image"
[ -s "$BASE" ] || curl -fsSL -o "$BASE" "$BASE_URL"

echo "  [2] working copy grown to 4G (the base is sized to its content)"
cp -f "$BASE" "$OUT"; qemu-img resize "$OUT" 4G >/dev/null

echo "  [3] map as a block device"
# Bugs that ONLY showed up once the DO path was actually exercised, all four real:
#   1. A prior run can leave a device CONNECTED (it reads 0B); connecting over it yields no
#      partition table.
#   2. Partitions appear a few seconds AFTER connect -- a fixed `sleep` is a coin flip.
#   3. This image has FOUR partitions (p1 root 2.5G, p14 4M, p15/p16); "first row" can pick 4M.
#   4. ⚠ AN INDIVIDUAL nbd DEVICE CAN WEDGE. After repeated connect/disconnect cycles /dev/nbd0
#      accepted a connect but never exposed partitions, while /dev/nbd1 worked instantly on the
#      same image. So do NOT hardcode a device -- find one that demonstrably works.
sudo modprobe nbd max_part=15

NBD=""; PART=""; SZ=0
for n in 0 1 2 3 4 5 6 7; do
  DEV=/dev/nbd$n
  cur=$(lsblk -bdno SIZE "$DEV" 2>/dev/null | tr -dc "0-9" || true)
  if [ -n "$cur" ] && [ "$cur" -ne 0 ]; then continue; fi     # in use by someone else
  sudo qemu-nbd --connect="$DEV" "$OUT" 2>/dev/null || continue
  for i in $(seq 1 8); do
    sudo partprobe "$DEV" >/dev/null 2>&1 || true
    # `|| true` REQUIRED: under `set -o pipefail` a not-yet-ready lsblk makes this assignment
    # non-zero and `set -e` kills the script SILENTLY mid-poll. That is exactly what happened.
    SZ=$(lsblk -bdno SIZE "${DEV}p1" 2>/dev/null | tr -dc "0-9" || true)
    if [ -n "$SZ" ] && [ "$SZ" -gt 1000000000 ]; then NBD="$DEV"; PART="${DEV}p1"; break; fi
    sleep 1
  done
  if [ -n "$PART" ]; then break; fi
  sudo qemu-nbd --disconnect "$DEV" >/dev/null 2>&1 || true    # wedged or unusable: try the next
  echo "  $DEV did not expose a root partition, trying the next"
done
if [ -z "$PART" ]; then echo "  ✗ no usable nbd device found (tried nbd0-7). All wedged or busy."; exit 1; fi
echo "  using $PART ($((SZ/1073741824))GB root)"

echo "  [4] grow the filesystem"
sudo growpart "$NBD" 1 >/dev/null 2>&1 || true
sudo e2fsck -fp "$PART" >/dev/null 2>&1 || true
sudo resize2fs "$PART" >/dev/null 2>&1 || true

echo "  [5] chroot with bc2's OWN resolver"
sudo mkdir -p "$MNT"; sudo mount "$PART" "$MNT"
for d in dev proc sys; do sudo mount --bind "/$d" "$MNT/$d"; done
sudo mount --bind /dev/pts "$MNT/dev/pts" 2>/dev/null || true
sudo rm -f "$MNT/etc/resolv.conf"; sudo cp /etc/resolv.conf "$MNT/etc/resolv.conf"

sudo chroot "$MNT" /bin/bash -c "
  export DEBIAN_FRONTEND=noninteractive
  getent hosts archive.ubuntu.com >/dev/null 2>&1 || { echo '  ✗ chroot has no DNS -- aborting rather than producing a half-baked image'; exit 1; }
  apt-get update -qq
  # The trap: apt-get update exits 0 even having fetched nothing. Assert lists ARRIVED.
  n=\$(ls /var/lib/apt/lists/*Packages* 2>/dev/null | wc -l)
  [ \"\$n\" -gt 0 ] || { echo '  ✗ apt fetched NO package lists (update lied) -- aborting'; exit 1; }
  apt-get install -y -qq $PKGS
  systemctl enable nginx >/dev/null 2>&1 || true
  echo '<h1>MY CLOUD IS ALIVE</h1><p>Student/Team: CHANGE ME</p>' > /var/www/html/index.html
  apt-get clean
"

echo "  [6] verify the binaries are REALLY present, not just that apt exited 0"
miss=0
for b in nginx nmap ping curl sftp python3; do
  sudo chroot "$MNT" bash -c "command -v $b >/dev/null 2>&1" || { echo "  ✗ MISSING $b"; miss=1; }
done
sudo chroot "$MNT" python3 -c 'import flask' 2>/dev/null || { echo "  ✗ MISSING flask"; miss=1; }
if [ "$miss" -eq 0 ]; then echo "  all baked binaries present"; else echo "  ✗ refusing to upload an incomplete image"; exit 1; fi

sudo truncate -s0 "$MNT/etc/machine-id"
sudo rm -f "$MNT"/etc/ssh/ssh_host_* 2>/dev/null || true
cleanup; trap - EXIT

echo "  [7] compress + ship to the DevStack VM (glance reads it there, not on bc2)"
qemu-img convert -O qcow2 -c "$OUT" "${OUT}.z" && mv -f "${OUT}.z" "$OUT"
scp -q -i "$KEY" -o BatchMode=yes -o StrictHostKeyChecking=no "$OUT" "stack@$VMADDR:/tmp/"

echo "  [8] upload"
osvm "openstack image create $NAME --disk-format qcow2 --container-format bare --public \
  --min-disk 4 --min-ram 512 --property os_distro=ubuntu --property os_version=24.04 \
  --file /tmp/$(basename $OUT) -f value -c id" | sed 's/^/      /'
osvm "openstack image show $NAME -f value -c name -c status -c min_disk -c visibility" | tr '\n' ' ' | sed 's/^/      /'; echo
