#!/bin/sh
# Mission seed: ip-linecheck ("Mission 18: The Line Check")
# Grades against the container's LIVE network state (dynamic compares), so the
# seed only builds the workspace + briefing. Non-destructive rebuild.
set -eu

MISSION_DIR=/opt/mission
mkdir -p "$MISSION_DIR"

H=$(hostname | cksum | cut -d' ' -f1)
pick() {
  n=$1; shift
  eval "echo \${$(( (H % n) + 1 ))}"
}
DEPT=$(set -- finance logistics research;   pick 3 "$@")
PROJ=$(set -- alpha delta kestrel waypoint; pick 4 "$@")

DEPT_DIR="/home/student/$DEPT"
LC="$DEPT_DIR/linecheck"
mkdir -p "$LC"

cat > "$DEPT_DIR/BRIEFING18.txt" <<EOF
HEXWORTH DYNAMICS - $DEPT DEPARTMENT - FINAL ASSIGNMENT
The connectivity audit for "$PROJ". Survey THIS box: its eth0 address and
prefix, the default gateway, loopback state, the :7681 listener serving your
own terminal, and a 4-count loopback pulse. ip reads wiring and routes; ss
reads sockets (-tln for TCP listeners, numeric); ping proves the pulse (cap
the count or it never ends). Answers in linecheck/. Sign the audit.
  - The Director
EOF

chown -R student:student "$DEPT_DIR"

sha() { sha256sum "$1" | cut -d' ' -f1; }

cat > "$MISSION_DIR/env.ip-linecheck" <<EOF
MISSION_ID="ip-linecheck"
MISSION_DEPT="$DEPT"
MISSION_PROJ="$PROJ"
MISSION_SHA_BRIEFING="$(sha "$DEPT_DIR/BRIEFING18.txt")"
EOF
chmod 0644 "$MISSION_DIR/env.ip-linecheck"

exit 0
