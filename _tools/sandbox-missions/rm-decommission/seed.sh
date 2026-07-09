#!/bin/sh
# Mission seed: rm-decommission ("Mission 05: The Decommission")
# Builds the decommission zone: junk to delete with precision, evidence that
# must survive, a directory to rm -r, a cache to empty-but-keep, a hidden junk
# dotfile, and the classic file named "-rf". DESTRUCTIVE-GUARDED: grading is
# absence-based, so a re-seed would resurrect deleted junk and fail the student.
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
DZ="$DEPT_DIR/decommission"

# Destructive-seed guard (SCHEMA): absence IS the graded artifact here; a
# rebuild on session resume would undo the student's deletions.
if [ -f "$MISSION_DIR/env.rm-decommission" ] && [ -d "$DZ" ]; then
  exit 0
fi

rm -rf "$DZ"
mkdir -p "$DZ/old_builds/v1" "$DZ/cache" "$DZ/keep"

cat > "$DEPT_DIR/BRIEFING5.txt" <<EOF
HEXWORTH DYNAMICS - $DEPT DEPARTMENT - ASSIGNMENT 5
Decommission order for project "$PROJ". The work orders name exactly what goes.
Everything in keep/ is chain-of-custody evidence: touch nothing there. Active
certificates stay; expired ones go. rm does not ask twice and does not undo.
Measure twice, delete once.  - The Director
EOF

# Junk that goes
printf 'scratch scribbles\n' > "$DZ/scratch.tmp"
printf 'stale cert 2019\n' > "$DZ/expired_2019.cert"
printf 'stale cert 2021\n' > "$DZ/expired_2021.cert"
printf 'stale cert 2023\n' > "$DZ/expired_2023.cert"
printf 'build artifact v1\n' > "$DZ/old_builds/v1/app.bin"
printf 'build manifest\n'    > "$DZ/old_builds/manifest.txt"
printf 'cache blob a\n' > "$DZ/cache/blob_a"
printf 'cache blob b\n' > "$DZ/cache/blob_b"
printf 'hidden cache junk\n' > "$DZ/.cache_junk"
printf 'trap file\n' > "$DZ/-rf"

# Evidence that stays
printf 'active cert prod\n'    > "$DZ/active_prod.cert"
printf 'active cert backup\n'  > "$DZ/active_backup.cert"
cat > "$DZ/keep/chain_of_custody.txt" <<EOF
CHAIN OF CUSTODY - $PROJ decommission
Sealed by the director. Do not modify. Do not delete.
EOF

chown -R student:student "$DEPT_DIR"

sha() { sha256sum "$1" | cut -d' ' -f1; }

# ── 2. Mission env (per-mission) ─────────────────────────────────────────────
cat > "$MISSION_DIR/env.rm-decommission" <<EOF
MISSION_ID=rm-decommission
MISSION_DEPT=$DEPT
MISSION_PROJ=$PROJ
MISSION_ACTIVE_COUNT=2
MISSION_SHA_CUSTODY=$(sha "$DZ/keep/chain_of_custody.txt")
EOF
chmod 0644 "$MISSION_DIR/env.rm-decommission"

exit 0
