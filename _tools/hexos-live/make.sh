#!/bin/bash
# @catalog what    HEXOS-6: build Hex Live on a real build host, in Docker, host left untouched
# @catalog run     _tools/hexos-live/make.sh [--host bc2] [--out ~/hexlive]
# @catalog status  TOOL
#
# WHY DOCKER AND NOT THE HOST. bc2 runs a live cloudflared tunnel serving the sandbox. Installing
# live-build and debootstrap onto it permanently, to produce a one-off artefact, is a host change
# nobody would remember making. A container also makes this recipe the source of truth rather than
# the accumulated state of one machine, which is the same reason CATALOG.md derives its wiring
# column from the tree instead of trusting a hand-written list.
#
# WHY NOT THE DEV BOX. It is WSL2: no real block devices and Microsoft's kernel. live-build needs
# loop mounts and a normal kernel.
#
# THE BUILD NEEDS PRIVILEGE. debootstrap and loop-mounting a squashfs require it. That is a real
# cost of building images and the reason this is scoped to a container on a chosen host rather than
# run casually.
set -euo pipefail

HOST="bc2"; OUT="\$HOME/hexlive"
while [ $# -gt 0 ]; do
    case "$1" in
        --host) HOST="$2"; shift 2 ;;
        --out)  OUT="$2";  shift 2 ;;
        *) echo "usage: make.sh [--host <ssh-host>] [--out <dir on host>]" >&2; exit 2 ;;
    esac
done

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REMOTE="/tmp/hexlive-build"

echo "  host: $HOST   out: $OUT"
echo "  --- shipping the recipe (not the artefact) ---"
ssh "$HOST" "mkdir -p $REMOTE"
scp -q "$HERE/Dockerfile" "$HERE/build.sh" "$HOST:$REMOTE/"

echo "  --- building the build environment ---"
ssh "$HOST" "cd $REMOTE && docker build -q -t hexlive-builder . " | sed 's/^/    /'

echo "  --- building the image (long; live-build fetches a base system) ---"
ssh "$HOST" "mkdir -p $OUT && docker run --rm --privileged -v $OUT:/out hexlive-builder" 2>&1 | tail -20 | sed 's/^/    /'

echo "  --- artefact ---"
ssh "$HOST" "ls -lh $OUT/*.iso 2>/dev/null || echo '    no iso produced'" | sed 's/^/  /'
