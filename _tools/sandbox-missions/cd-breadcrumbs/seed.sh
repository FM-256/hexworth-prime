#!/bin/sh
# Mission seed: cd-breadcrumbs ("Mission 03: Breadcrumbs")
# Builds the campus wing (deep tree), the /opt/campus/annex outside $HOME (forces
# an absolute cd), and the campus/shortcut symlink into the server room (logical
# vs physical pwd). Contract per SCHEMA.md: set -eu, idempotent, per-mission env.
set -eu

MISSION_DIR=/opt/mission
mkdir -p "$MISSION_DIR"

# ── 1. Randomization (deterministic per container via hostname hash) ────────
H=$(hostname | cksum | cut -d' ' -f1)
pick() {
  n=$1; shift
  eval "echo \${$(( (H % n) + 1 ))}"
}
DEPT=$(set -- finance logistics research; pick 3 "$@")
WING=$(set -- north east west;            pick 3 "$@")

DEPT_DIR="/home/student/$DEPT"
CAMPUS="$DEPT_DIR/campus"
ROOM="$CAMPUS/$WING-wing/floor2/suite_b/server_room"

# Idempotency: rebuild campus + annex fresh each run (student breadcrumbs land
# INSIDE these trees, so re-seed preserves correct work: mkdir -p never deletes,
# and we only remove the shortcut to re-link it).
mkdir -p "$ROOM" "$CAMPUS/$WING-wing/floor1/lobby" "$CAMPUS/$WING-wing/floor2/suite_a"
rm -f "$CAMPUS/shortcut"
ln -s "$WING-wing/floor2/suite_b/server_room" "$CAMPUS/shortcut"
mkdir -p /opt/campus/annex
chown -R student:student "$DEPT_DIR" /opt/campus/annex

cat > "$DEPT_DIR/BRIEFING3.txt" <<EOF
HEXWORTH DYNAMICS - $DEPT DEPARTMENT - ASSIGNMENT 3
The campus wing is unmapped. Survey it: at each waypoint named by the mission
tasks, drop the requested breadcrumb file containing pwd's output for that spot.
Waypoints: the server room (campus/$WING-wing/floor2/suite_b/server_room), the
floor above it, your home, and the annex at /opt/campus/annex (NOT under your
home). Facilities also installed campus/shortcut - check where it really leads.
End every dictated file's input with Ctrl+D if you take notes with cat.
  - The Director
EOF
chown student:student "$DEPT_DIR/BRIEFING3.txt"

# ── 2. Mission env (per-mission file; no checksums needed, all paths static) ─
cat > "$MISSION_DIR/env.cd-breadcrumbs" <<EOF
MISSION_ID=cd-breadcrumbs
MISSION_DEPT=$DEPT
MISSION_WING=$WING
EOF
chmod 0644 "$MISSION_DIR/env.cd-breadcrumbs"

exit 0
