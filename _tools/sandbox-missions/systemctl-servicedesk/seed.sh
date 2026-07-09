#!/bin/sh
# Mission seed: systemctl-servicedesk ("Mission 17: The Service Desk")
# Uses the image's systemctl shim (/run/hexlab-svc marker files). Seed sets the
# opening ticket states: hexweb stopped+disabled, hexqueue stopped+disabled,
# legacyd RUNNING+ENABLED (to retire), hexreportd stopped+disabled (the liar).
# DESTRUCTIVE-GUARDED: graded artifacts are the corrected switch states.
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
SD="$DEPT_DIR/servicedesk"

if [ -f "$MISSION_DIR/env.systemctl-servicedesk" ] && [ -d "$SD" ]; then
  exit 0
fi

mkdir -p "$SD"

cat > "$DEPT_DIR/BRIEFING17.txt" <<EOF
HEXWORTH DYNAMICS - $DEPT DEPARTMENT - ASSIGNMENT 17
You hold the pager for "$PROJ" now. Services have TWO switches: running-now
(start/stop, check with is-active) and wakes-on-boot (enable/disable, check
with is-enabled). They are independent - that is the whole exam. Queue:
hexweb (down, tickets 1-2), hexqueue (full bring-up), legacyd (retire
completely), hexreportd (diagnose FIRST, then fix). Answers and receipts go
in servicedesk/.  - The Director
EOF

# Opening states via the shim
D=/run/hexlab-svc; mkdir -p "$D"
rm -f "$D/hexweb.active" "$D/hexweb.enabled" \
      "$D/hexqueue.active" "$D/hexqueue.enabled" \
      "$D/hexreportd.active" "$D/hexreportd.enabled"
touch "$D/legacyd.active" "$D/legacyd.enabled"
# Positive seed-side verification (Nancy wave-4-5): t04 is graded by negative
# assertions only, so prove legacyd actually opened ACTIVE+ENABLED before the
# env is written (set -eu aborts the seed otherwise).
systemctl is-active legacyd >/dev/null
systemctl is-enabled legacyd >/dev/null

chown -R student:student "$DEPT_DIR"

cat > "$MISSION_DIR/env.systemctl-servicedesk" <<EOF
MISSION_ID="systemctl-servicedesk"
MISSION_DEPT="$DEPT"
MISSION_PROJ="$PROJ"
EOF
chmod 0644 "$MISSION_DIR/env.systemctl-servicedesk"

exit 0
