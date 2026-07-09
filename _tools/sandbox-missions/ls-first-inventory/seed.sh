#!/bin/sh
# Mission seed: ls-first-inventory ("Mission 02: The Inventory")
# Seeded continuity: same Hexworth Dynamics department as Mission 01; the story
# assumes the report recovery already happened. Builds a messy archive with
# hidden files, subdirectories, distinct sizes, deterministic mtimes and a
# hardlink pair; records expected names/counts/checksums in /opt/mission/env.
# Contract per SCHEMA.md: set -eu, idempotent, refs deleted after hashing.
set -eu

MISSION_DIR=/opt/mission
REF_DIR="$MISSION_DIR/.ref"
mkdir -p "$REF_DIR"
chmod 0700 "$REF_DIR"

# ── 1. Randomization (deterministic per container via hostname hash) ────────
H=$(hostname | cksum | cut -d' ' -f1)
pick() {
  n=$1; shift
  eval "echo \${$(( (H % n) + 1 ))}"
}
DEPT=$(set -- finance logistics research;   pick 3 "$@")
PROJ=$(set -- alpha delta kestrel waypoint; pick 4 "$@")

DEPT_DIR="/home/student/$DEPT"
ARC="$DEPT_DIR/archive"
REPORTS="$DEPT_DIR/reports"
# Idempotency: rebuild the archive from scratch every run (student never edits
# it; their work lives in reports/, which is preserved).
rm -rf "$ARC"
mkdir -p "$ARC/quarterly" "$ARC/personnel" "$ARC/.config" "$REPORTS"

cat > "$DEPT_DIR/BRIEFING2.txt" <<EOF
HEXWORTH DYNAMICS - $DEPT DEPARTMENT - ASSIGNMENT 2
Nice recovery work on project "$PROJ". Next up: the archive/ directory nobody
has dared to open since the merger. I want a full inventory in the reports/
directory I set up for you. Every file, including whatever is hiding in there.
Sizes, ages, structure - the works. Tip: when a listing scrolls past, remember
you can always redirect it into a file.  - The Director
EOF

# ── 2. Archive content: distinct sizes, deterministic mtimes, dotfiles, links ─
# Sizes are strictly distinct so "largest" has exactly one right answer.
head -c 51200 /dev/zero > "$ARC/backup_$PROJ.img"          # 50 KB  (largest)
head -c 9200  /dev/zero > "$ARC/staff_directory.csv"       # 9.2 KB
head -c 4100  /dev/zero > "$ARC/merger_notes.txt"          # 4.1 KB
head -c 1500  /dev/zero > "$ARC/vendor_list.txt"           # 1.5 KB
printf 'legacy=true\n' > "$ARC/.forgotten_flag"            # hidden file 1
printf '[settings]\ntheme=old\n' > "$ARC/.config/legacy.ini"
printf 'do not delete\n' > "$ARC/.retention_note"          # hidden file 2
printf 'Q1 summary pending\n' > "$ARC/quarterly/q1.txt"
printf 'Q2 summary pending\n' > "$ARC/quarterly/q2.txt"
printf 'roster v2\n' > "$ARC/personnel/roster.txt"
# Hardlink twins (same inode, two names) for the bonus.
printf 'shared ledger content\n' > "$ARC/ledger.dat"
ln "$ARC/ledger.dat" "$ARC/ledger_copy.dat"

# Deterministic modification times (fixed dates; newest and oldest unambiguous).
touch -d '2025-01-15 09:00' "$ARC/merger_notes.txt"        # oldest
touch -d '2025-06-01 09:00' "$ARC/backup_$PROJ.img"
touch -d '2025-09-10 09:00' "$ARC/vendor_list.txt"
touch -d '2026-02-02 09:00' "$ARC/ledger.dat" "$ARC/ledger_copy.dat"
touch -d '2026-05-20 09:00' "$ARC/.forgotten_flag" "$ARC/.retention_note"
touch -d '2026-06-30 09:00' "$ARC/staff_directory.csv"     # newest
touch -d '2025-03-01 09:00' "$ARC/quarterly" "$ARC/personnel" "$ARC/.config"

chown -R student:student "$DEPT_DIR"

# ── 3. Reference artifacts (computed exactly as the briefs instruct: from the
#      department directory, against the relative name "archive") ─────────────
cd "$DEPT_DIR"
ls archive          > "$REF_DIR/inventory"
ls -a archive       > "$REF_DIR/all"
ls -R archive       > "$REF_DIR/tree"
ls -r archive       > "$REF_DIR/reverse"
ls -d archive/*/    > "$REF_DIR/dirs"

sha() { sha256sum "$1" | cut -d' ' -f1; }

# Hidden entries directly in archive, excluding . and .. themselves.
HIDDEN_COUNT=$(ls -A archive | grep -c '^\.')

cat > "$MISSION_DIR/env.ls-first-inventory" <<EOF
MISSION_ID=ls-first-inventory
MISSION_DEPT=$DEPT
MISSION_PROJ=$PROJ
MISSION_SHA_INVENTORY=$(sha "$REF_DIR/inventory")
MISSION_SHA_ALL=$(sha "$REF_DIR/all")
MISSION_SHA_TREE=$(sha "$REF_DIR/tree")
MISSION_SHA_REVERSE=$(sha "$REF_DIR/reverse")
MISSION_SHA_DIRS=$(sha "$REF_DIR/dirs")
MISSION_HIDDEN_COUNT=$HIDDEN_COUNT
MISSION_LARGEST=backup_$PROJ.img
MISSION_NEWEST=staff_directory.csv
MISSION_OLDEST=merger_notes.txt
MISSION_TWIN_A=ledger.dat
MISSION_TWIN_B=ledger_copy.dat
EOF
chmod 0644 "$MISSION_DIR/env.ls-first-inventory"

# Refs only exist to compute the hashes above; remove the answer files.
rm -rf "$REF_DIR"

exit 0
