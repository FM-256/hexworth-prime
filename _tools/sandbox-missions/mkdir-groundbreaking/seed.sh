#!/bin/sh
# Mission seed: mkdir-groundbreaking ("Mission 06: Groundbreaking")
# Plants the two scaffoldings (one empty, one occupied) and the empty temp chain.
# The student BUILDS everything else. DESTRUCTIVE-GUARDED: grading includes
# absence checks (demolitions) that a re-seed would resurrect.
set -eu

MISSION_DIR=/opt/mission
mkdir -p "$MISSION_DIR"

# ── 1. Randomization (deterministic per container via hostname hash) ────────
H=$(hostname | cksum | cut -d' ' -f1)
pick() {
  n=$1; shift
  eval "echo \${$(( (H % n) + 1 ))}"
}
DEPT=$(set -- finance logistics research;   pick 3 "$@")
PROJ=$(set -- alpha delta kestrel waypoint; pick 4 "$@")

DEPT_DIR="/home/student/$DEPT"

# Destructive-seed guard (SCHEMA): demolition absences are graded artifacts.
if [ -f "$MISSION_DIR/env.mkdir-groundbreaking" ] && [ -d "$DEPT_DIR" ]; then
  exit 0
fi

mkdir -p "$DEPT_DIR"
rm -rf "$DEPT_DIR/scaffolding_empty" "$DEPT_DIR/scaffolding_occupied" "$DEPT_DIR/temp" "$DEPT_DIR/expansion"
mkdir -p "$DEPT_DIR/scaffolding_empty" "$DEPT_DIR/scaffolding_occupied" "$DEPT_DIR/temp/deep/deeper/deepest"

cat > "$DEPT_DIR/BRIEFING6.txt" <<EOF
HEXWORTH DYNAMICS - $DEPT DEPARTMENT - ASSIGNMENT 6
Groundbreaking day for the "$PROJ" annex. Build the expansion structure exactly
to the architect's plan (the work orders name every directory). Then demolition:
rmdir only takes down EMPTY directories - that is a safety feature, not a
limitation. The occupied scaffolding must be emptied before it comes down.
  - The Director
EOF

cat > "$DEPT_DIR/scaffolding_occupied/blueprint.txt" <<EOF
ANNEX BLUEPRINT - $PROJ
floor1: suite_a, suite_b, suite_c
vault: private, mode 700 at creation
EOF

chown -R student:student "$DEPT_DIR"

sha() { sha256sum "$1" | cut -d' ' -f1; }

# ── 2. Mission env (per-mission) ─────────────────────────────────────────────
cat > "$MISSION_DIR/env.mkdir-groundbreaking" <<EOF
MISSION_ID=mkdir-groundbreaking
MISSION_DEPT=$DEPT
MISSION_PROJ=$PROJ
MISSION_SHA_BLUEPRINT=$(sha "$DEPT_DIR/scaffolding_occupied/blueprint.txt")
EOF
chmod 0644 "$MISSION_DIR/env.mkdir-groundbreaking"

exit 0
