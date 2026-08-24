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
# The lab assets baked into /opt/sprint-assets. Defaults to the copy that sits beside this script
# so a fresh clone works; SPRINT_ASSETS overrides it when the assets are staged elsewhere on bc2.
ASSETS=${SPRINT_ASSETS:-$(cd "$(dirname "$0")" && pwd)/sprint-assets}

# nginx           Mission 1
# nmap ping       the scan / verify steps
# python3-flask   Mission 3 -- system-wide, because `pip install flask` needs PyPI, a SECOND
#                 egress dependency the missions cannot satisfy
# openssh-server  Mission 2 -- the student's own instance is the SFTP TARGET
# openssh-client  Mission 2 -- and it is also the peer doing the uploading
#
# ⚠ openssh-SERVER was missed in the first build. ubuntu-24.04-MINIMAL does not ship it (standard
# cloud images do), so the image had the sftp CLIENT and no sshd. A four-mission end-to-end run
# caught it: the server reported sshd=inactive and Mission 2 could not work at all.
#
# ⚠ nano AND tmux were BOTH missing from the first asset-baked build, and both were introduced by
# my own packet edits. ubuntu-24.04-MINIMAL ships NO editor at all -- measured on the built image:
# nano, vi, vim, ed all absent. Mission 1 step 3 says "nano ~/project1_index.html", so every
# student would have hit "nano: command not found" one command after the bug this whole effort
# exists to fix. tmux is the same story from the other direction: Mission 4 tells the student to
# watch the log "in a SECOND terminal", but the only access is a single noVNC console and neither
# tmux nor screen was present, so there was no second terminal to be had.
PKGS="nginx nmap iputils-ping python3-flask openssh-server openssh-client curl ca-certificates nano tmux"

# Checked BEFORE the expensive chroot build, not at the point of use: a missing asset dir should
# cost a second, not a full apt install and image convert.
for a in project1_index.html project2_cinder_guest_setup.sh project3_api.py \
         project4_generate_traffic.sh project4_honeypot.py README.md; do
  [ -s "$ASSETS/$a" ] || { echo "✗ lab asset missing: $ASSETS/$a"; echo "  copy _tools/openstack-bridge/sprint-assets/ to bc2, or set SPRINT_ASSETS"; exit 2; }
done

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
  # WARNING: systemctl enable is a NO-OP in a chroot -- it prints 'Running in chroot, ignoring
  # request' and does nothing. The build printed that twice and it was missed, which is how the
  # first image shipped with openssh-server INSTALLED but sshd never starting. Link by hand.
  mkdir -p /etc/systemd/system/multi-user.target.wants
  for svc in nginx ssh; do
    for base in /usr/lib/systemd/system /lib/systemd/system; do
      if [ -f \"\$base/\$svc.service\" ]; then
        ln -sf \"\$base/\$svc.service\" /etc/systemd/system/multi-user.target.wants/\$svc.service
        break
      fi
    done
  done
  # Every sudo on these instances printed 'sudo: unable to resolve host <name>: Temporary failure
  # in name resolution' -- there is no DNS here and nothing maps the instance's own hostname.
  # Harmless, but a student sees it on EVERY command and will ask. cloud-init writes the entry
  # itself when told to, which handles the per-instance hostname it cannot know at build time.
  if ! grep -q '^manage_etc_hosts' /etc/cloud/cloud.cfg; then
    echo 'manage_etc_hosts: true' >> /etc/cloud/cloud.cfg
  fi
  # MISSION 2 CANNOT WORK WITHOUT THIS, measured: sshd -T reported passwordauthentication=no on a
  # booted instance. The mission says 'use SFTP from an approved peer', but Ubuntu cloud images set
  # ssh_pwauth false, and a peer has no way to obtain the target's private key -- so the peer had
  # NO usable authentication method at all and the mission was undoable as written.
  #
  # Passwords, not keys, because the student's only access is the Horizon noVNC console: pasting a
  # public key through noVNC is exactly the kind of step that eats a class period. The student sets
  # the password themselves with 'sudo passwd ubuntu' -- no credential is baked into the image.
  # Acceptable here because 'shared' is an isolated segment with no route off the cloud; on a
  # routable network this would not be.
  if ! grep -q '^ssh_pwauth' /etc/cloud/cloud.cfg; then
    echo 'ssh_pwauth: true' >> /etc/cloud/cloud.cfg
  fi
  echo '<h1>MY CLOUD IS ALIVE</h1><p>Student/Team: CHANGE ME</p>' > /var/www/html/index.html
  apt-get clean
"

# ── the LAB ASSETS themselves ────────────────────────────────────────────────
# The packet says `cp project1_index.html ...` and `python3 project4_honeypot.py`. Nothing ever
# put those files on the instance. There is NO egress, and students reach the instance only
# through the Horizon noVNC console -- so there is no scp, no wget, and no clipboard worth
# trusting for a 43-line python file. Every mission's first command was "No such file or
# directory" for a student, and my own end-to-end test never caught it because the test harness
# injected the assets via cloud-init: it handed itself the key the student is not given.
# Baking them is the same argument as baking the packages: a fixed artifact, no network on the day.
echo "  [5b] bake the lab assets into /opt/sprint-assets"
[ -d "$ASSETS" ] || { echo "  ✗ asset dir $ASSETS not found on this host -- copy sprint-assets/ to bc2 first"; exit 1; }
sudo mkdir -p "$MNT/opt/sprint-assets"
# Copy an EXACT list, never a glob. `project*.*` would sweep an editor .bak, a merge .orig or any
# other stray in the staging dir straight into the dir students are told is pristine.
for a in project1_index.html project2_cinder_guest_setup.sh project3_api.py \
         project4_generate_traffic.sh project4_honeypot.py README.md; do
  sudo cp -f "$ASSETS/$a" "$MNT/opt/sprint-assets/$a"
done
sudo chmod 0644 "$MNT"/opt/sprint-assets/*
sudo chmod 0755 "$MNT"/opt/sprint-assets/*.sh    # the generator is run as ./project4_generate_traffic.sh

echo "  [6] verify the binaries are REALLY present, not just that apt exited 0"
miss=0
# nano/tmux are in this list because the PACKET NAMES THEM. Anything a student is told to type
# has to be asserted here -- that is the whole lesson of the openssh-server miss.
for b in nginx nmap ping curl sftp python3 nano tmux; do
  sudo chroot "$MNT" bash -c "command -v $b >/dev/null 2>&1" || { echo "  ✗ MISSING $b"; miss=1; }
done
sudo chroot "$MNT" python3 -c 'import flask' 2>/dev/null || { echo "  ✗ MISSING flask"; miss=1; }
sudo test -x "$MNT/usr/sbin/sshd" || { echo "  ✗ MISSING sshd (openssh-server)"; miss=1; }
# A binary that is present but never started is the sshd bug all over again. Assert ENABLEMENT.
for svc in nginx ssh; do
  sudo test -L "$MNT/etc/systemd/system/multi-user.target.wants/$svc.service" \
    && echo "  enabled at boot: $svc" \
    || { echo "  ✗ $svc installed but NOT enabled at boot"; miss=1; }
done
# The assets are what the packet's very first command reaches for. "Present" is not enough --
# a truncated copy fails at student time, so the python must actually compile and the shell
# scripts must actually parse.
for a in project1_index.html project2_cinder_guest_setup.sh project3_api.py \
         project4_generate_traffic.sh project4_honeypot.py README.md; do
  sudo test -s "$MNT/opt/sprint-assets/$a" \
    && echo "  asset: $a" \
    || { echo "  ✗ MISSING or EMPTY asset $a"; miss=1; }
done
for p in project3_api.py project4_honeypot.py; do
  # ast.parse, NOT py_compile. py_compile writes __pycache__ *by design* and ignores
  # PYTHONDONTWRITEBYTECODE (that variable governs import-time caching, not an explicit compile).
  # The first attempt used it and shipped a __pycache__ into the students' pristine asset dir --
  # measured on the image, the same debris that shipped inside the v2 zip. ast.parse writes nothing.
  sudo chroot "$MNT" python3 -c "import ast,sys;ast.parse(open(sys.argv[1]).read())" "/opt/sprint-assets/$p" 2>/dev/null \
    || { echo "  ✗ asset $p does not compile inside the image"; miss=1; }
done
for s in project2_cinder_guest_setup.sh project4_generate_traffic.sh; do
  sudo chroot "$MNT" bash -n "/opt/sprint-assets/$s" 2>/dev/null \
    || { echo "  ✗ asset $s is not valid shell"; miss=1; }
  sudo test -x "$MNT/opt/sprint-assets/$s" \
    || { echo "  ✗ asset $s is not executable (packet runs it as ./$s)"; miss=1; }
done
sudo grep -q '^manage_etc_hosts: true' "$MNT/etc/cloud/cloud.cfg" \
  && echo "  cloud-init will write /etc/hosts (kills the sudo hostname warning)" \
  || { echo "  ✗ manage_etc_hosts not set -- every sudo will warn"; miss=1; }
sudo grep -q '^ssh_pwauth: true' "$MNT/etc/cloud/cloud.cfg" \
  && echo "  ssh password auth enabled (Mission 2 peer SFTP is impossible without it)" \
  || { echo "  ✗ ssh_pwauth not set -- Mission 2 peer SFTP cannot authenticate"; miss=1; }
# The asset dir the student is told to treat as pristine must not contain build debris.
# Assert nothing EXTRA shipped, not just that the six expected files are there. Checking only for
# what should be present cannot catch what should not be.
extra=$(sudo ls -A "$MNT/opt/sprint-assets" | grep -vxE 'project1_index.html|project2_cinder_guest_setup.sh|project3_api.py|project4_generate_traffic.sh|project4_honeypot.py|README.md' || true)
if [ -n "$extra" ]; then
  echo "  ✗ unexpected files in /opt/sprint-assets: $(echo "$extra" | tr '\n' ' ')"; miss=1
else
  echo "  asset dir clean (exactly the 6 expected files, no debris)"
fi
if [ "$miss" -eq 0 ]; then echo "  all baked binaries present AND enabled"; else echo "  ✗ refusing to upload an incomplete image"; exit 1; fi

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
