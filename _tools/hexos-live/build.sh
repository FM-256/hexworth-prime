#!/bin/bash
# @catalog what    HEXOS-6: build the Hex Live bootable image (runs inside the Docker build env)
# @catalog run     _tools/hexos-live/make.sh          (wrapper; do not run this directly on a host)
# @catalog status  TOOL
#
# Approach A, decided 3-1: thin live image, kiosk session on the LIVE platform, hardware tooling.
# No bundled _app. See README.md in this directory for why B and C were rejected.
#
# THIN IS THE DESIGN CONSTRAINT, not a preference. The scope doc: "survivable if the image stays
# thin, fatal if it accumulates." Every package below is here because a browser cannot do it.
set -euo pipefail

ARCH="${ARCH:-amd64}"
DIST="${DIST:-trixie}"         # Debian 13 stable. See the mirror note below for why not Ubuntu.
KIOSK_URL="${KIOSK_URL:-https://hexworth.com/hex/}"
OUT="${OUT:-/out}"

echo "=== Hex Live :: dist=$DIST arch=$ARCH kiosk=$KIOSK_URL ==="

# DEBIAN, NOT UBUNTU, and the reason is evidence rather than taste. Three separate failures came
# from forcing an Ubuntu base through live-build:
#   1. an Ubuntu release name against live-build's default Debian mirror ("Failed getting release
#      file .../debian/dists/noble/Release");
#   2. chromium-browser and firefox on 24.04 are SNAP TRANSITIONAL STUBS (2:1snap1) that cannot
#      install into a chroot at all;
#   3. live-build's ubuntu mode still pulls bootloader themes named for ONEIRIC, which is Ubuntu
#      11.10, and those packages no longer exist.
# That third one is the tell: ubuntu mode is not maintained. Debian is live-build's native path.
# It also WINS the argument the Ubuntu base was chosen for: trixie ships kernel 6.12 against
# 24.04's 6.8, and a newer kernel is exactly where WiFi and SDR driver support lives. The scope
# doc says "Debian or Ubuntu respin"; this is the half that works.
MIRROR="${MIRROR:-http://deb.debian.org/debian/}"

lb config \
    --distribution "$DIST" \
    --architectures "$ARCH" \
    --archive-areas "main contrib non-free non-free-firmware" \
    --parent-mirror-bootstrap "$MIRROR" \
    --parent-mirror-chroot "$MIRROR" \
    --parent-mirror-binary "$MIRROR" \
    --mirror-bootstrap "$MIRROR" \
    --mirror-chroot "$MIRROR" \
    --mirror-binary "$MIRROR" \
    --binary-images iso-hybrid \
    --iso-application "Hex Live" \
    --iso-volume "HEXLIVE"

mkdir -p config/package-lists config/includes.chroot/etc/skel

# ── The package list. Each line has to justify itself against "fatal if it accumulates". ──
cat > config/package-lists/hexlive.list.chroot <<'PKGS'
# Session. X, a minimal WM, and a browser. No desktop environment: a full DE is the single fastest
# way to make this image not-thin, and nothing here needs one.
#
# surf: a WebKit browser with no chrome, no tabs and no address bar, which is precisely what
# "the session IS the shell" means. There is nowhere else to go by construction.
# Measured on the Ubuntu base before the move to Debian: surf 249 packages, epiphany-browser 322.
# Debian additionally has a real chromium .deb (Ubuntu 24.04 only ships a snap stub), so chromium
# is available as a fallback here if surf renders Hex OS badly. Decide that by BOOTING the image
# and looking at the shell, not by reasoning about WebKit.
xserver-xorg
xinit
openbox
surf
unclutter

# THE ONLY REASON THIS PHASE EXISTS: hardware a browser cannot reach.
# WiFi monitor mode, for WiFi Arsenal.
aircrack-ng
iw
wireless-tools
# SDR, for the Signal toolkit. rtl-sdr is the common dongle; gqrx is the visual confirmation a
# student needs to believe it works. GNU Radio is deliberately NOT here: it is enormous and turns
# a thin image into a distribution, which is the failure mode the scope doc names.
rtl-sdr
gqrx-sdr
# Serial and USB, for the hardware projects.
minicom
screen
usbutils
picocom

# Enough to diagnose the above when it does not work in a classroom.
pciutils
usb-modeswitch
firmware-linux-free
PKGS

# ── The session IS the shell. That is the phase's stated identity. ──
cat > config/includes.chroot/etc/skel/.xinitrc <<XINIT
#!/bin/sh
# The session is Hex OS. Not a desktop with a browser on it: the shell IS what boots.
xset s off -dpms          # a classroom machine must not sleep mid-exercise
unclutter -idle 2 &
openbox &
# -F is fullscreen. surf has no chrome, no tabs and no address bar by design, which is exactly
# what "the session IS the shell" means: there is nowhere else to go.
exec surf -F "$KIOSK_URL"
XINIT
chmod +x config/includes.chroot/etc/skel/.xinitrc

echo "=== lb build (this is the long part) ==="
lb build

mkdir -p "$OUT"
cp -v ./*.iso "$OUT"/ 2>/dev/null || cp -v ./*.hybrid.iso "$OUT"/
echo "=== done; artefact in $OUT ==="
ls -lh "$OUT" | sed 's/^/  /'
