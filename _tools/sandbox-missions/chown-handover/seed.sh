#!/bin/sh
# Mission seed: chown-handover ("Mission 14: The Handover")
# Creates the teammates (user aday, service account reportd, group analysts)
# and the files awaiting transfer. DESTRUCTIVE-GUARDED: graded artifacts are
# the corrected owners; a re-seed would hand everything back to student.
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
HO="$DEPT_DIR/handover"

if [ -f "$MISSION_DIR/env.chown-handover" ] && [ -d "$HO" ]; then
  exit 0
fi

# Teammates (idempotent creation)
getent group analysts >/dev/null 2>&1 || groupadd analysts
id aday    >/dev/null 2>&1 || useradd -M -s /usr/sbin/nologin -G analysts aday
id reportd >/dev/null 2>&1 || useradd -M -s /usr/sbin/nologin -G analysts reportd

rm -rf "$HO"
mkdir -p "$HO/aday_workspace/drafts"

cat > "$DEPT_DIR/BRIEFING14.txt" <<EOF
HEXWORTH DYNAMICS - $DEPT DEPARTMENT - ASSIGNMENT 14
Two teammates joined "$PROJ": analyst aday and service account reportd (both in
group analysts). The work orders transfer specific deeds. Ownership changes
need sudo. Verify with stat -c %U:%G <file>. Transfer EXACTLY what each order
names - recursive transfers aimed too high grab things that are not yours to
give.  - The Director
EOF

cat > "$HO/analysis.txt" <<EOF
Q3 variance analysis for $PROJ - prepared for aday.
EOF
cat > "$HO/shared_notes.txt" <<EOF
Team notes: read-only handoff for the analysts group.
EOF
cat > "$HO/nightly.dat" <<EOF
nightly=1
project=$PROJ
window=02:00-03:00
EOF
cat > "$HO/aday_workspace/drafts/plan.txt" <<EOF
draft plan v1 for aday
EOF
printf 'workspace readme\n' > "$HO/aday_workspace/readme.txt"
printf 'my eyes only\n' > "$HO/my_private_notes.txt"
printf 'template body\n' > "$HO/template.txt"

chown -R student:student "$DEPT_DIR"

sha() { sha256sum "$1" | cut -d' ' -f1; }

cat > "$MISSION_DIR/env.chown-handover" <<EOF
MISSION_ID=chown-handover
MISSION_DEPT=$DEPT
MISSION_PROJ=$PROJ
MISSION_SHA_ANALYSIS=$(sha "$HO/analysis.txt")
MISSION_SHA_NIGHTLY=$(sha "$HO/nightly.dat")
EOF
chmod 0644 "$MISSION_DIR/env.chown-handover"

exit 0
