#!/bin/sh
# Mission seed: cpmv-relocation ("Mission 04: The Relocation")
# Builds office_old (files, drafts/, assets/branding/, logs, timestamped ledger,
# typo'd report) and office_new (its own config.ini + empty logs/). Records the
# checksums/counts the grader compares against. SCHEMA contract: set -eu,
# idempotent, per-mission env, refs deleted (none needed here: all shas come
# from seeded sources that the student must not destroy).
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
OLD="$DEPT_DIR/office_old"
NEW="$DEPT_DIR/office_new"

# Idempotency guard: this seed is DESTRUCTIVE (rebuilding wipes the student's
# moves/copies), so if the mission is already seeded on this box, keep the
# world exactly as the student left it. /launch re-runs seeds on resume; a
# refresh must never destroy completed work. (SCHEMA: destructive seeds skip.)
if [ -f "$MISSION_DIR/env.cpmv-relocation" ] && [ -d "$OLD" ]; then
  exit 0
fi

rm -rf "$OLD" "$NEW" "$DEPT_DIR/office_archive"
mkdir -p "$OLD/drafts" "$OLD/assets/branding" "$NEW/logs"

cat > "$DEPT_DIR/BRIEFING4.txt" <<EOF
HEXWORTH DYNAMICS - $DEPT DEPARTMENT - ASSIGNMENT 4
Moving day for project "$PROJ". office_old relocates to office_new, but READ the
work orders carefully: some items are COPIES (original stays), some are MOVES
(nothing left behind), one is a rename, and the ledger's timestamp is legal
evidence - preserve it. The old office structure stays standing until the audit
clears. Work orders are the mission tasks; grade when done.  - The Director
EOF

# office_old content
cat > "$OLD/master_list.txt" <<EOF
MASTER INVENTORY - $DEPT / $PROJ
desks: 14
chairs: 28
servers: 3
EOF
cat > "$OLD/drafts/proposal.txt" <<EOF
PROPOSAL: expansion of project $PROJ into the annex.
Status: awaiting director signature.
EOF
cat > "$OLD/report_finel.txt" <<EOF
FINAL REPORT (typo victim): relocation readiness confirmed for $PROJ.
EOF
cat > "$OLD/assets/branding/logo_$PROJ.svg" <<EOF
<svg><!-- $PROJ brand mark v3 --><rect width="10" height="10"/></svg>
EOF
cat > "$OLD/assets/floorplan.txt" <<EOF
floorplan rev2: 14 desks, 3 server racks
EOF
cat > "$OLD/ledger.csv" <<EOF
date,amount,memo
2026-01-05,1200.00,movers deposit
2026-02-11,340.50,crate rental
EOF
touch -d '2026-03-03 08:15' "$OLD/ledger.csv"
printf 'old-office settings: theme=beige\n' > "$OLD/config.ini"
printf '10.0.0.1 - GET /index 200\n' > "$OLD/access_1.log"
printf '10.0.0.2 - GET /login 401\n' > "$OLD/access_2.log"
printf 'renewal notice sent\n'        > "$OLD/lease.log"

# office_new content (its config differs from old's on purpose)
printf 'new-office settings: theme=slate\n' > "$NEW/config.ini"

chown -R student:student "$DEPT_DIR"

sha() { sha256sum "$1" | cut -d' ' -f1; }

# ── 2. Mission env (per-mission; shas of the SOURCES the student relocates) ──
cat > "$MISSION_DIR/env.cpmv-relocation" <<EOF
MISSION_ID=cpmv-relocation
MISSION_DEPT=$DEPT
MISSION_PROJ=$PROJ
MISSION_SHA_MASTER=$(sha "$OLD/master_list.txt")
MISSION_SHA_PROPOSAL=$(sha "$OLD/drafts/proposal.txt")
MISSION_SHA_REPORT=$(sha "$OLD/report_finel.txt")
MISSION_SHA_LOGO=$(sha "$OLD/assets/branding/logo_$PROJ.svg")
MISSION_SHA_CONFIG_NEW=$(sha "$NEW/config.ini")
MISSION_SHA_CONFIG_OLD=$(sha "$OLD/config.ini")
MISSION_SHA_LOG1=$(sha "$OLD/access_1.log")
MISSION_LOG_COUNT=3
EOF
chmod 0644 "$MISSION_DIR/env.cpmv-relocation"

exit 0
