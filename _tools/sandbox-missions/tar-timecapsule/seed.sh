#!/bin/sh
# Mission seed: tar-timecapsule ("Mission 15: The Time Capsule")
# Builds yearbook/ + ledgers/ source trees and the mystery_2021.tgz capsule
# (created by the seed itself). List-checks compare tar -tf listings sorted.
# Non-destructive rebuild EXCEPT the t01 tar depends on student artifacts NOT
# existing... actually sources rebuild identically and artifacts are separate
# files, so plain rebuild is safe (yearbook.tar list-sha depends only on tree).
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
CP="$DEPT_DIR/capsule"
REF_DIR="$MISSION_DIR/.ref"
mkdir -p "$CP/yearbook/photos" "$CP/ledgers" "$CP/opened" "$CP/rescued" "$REF_DIR"
chmod 0700 "$REF_DIR"

cat > "$DEPT_DIR/BRIEFING15.txt" <<EOF
HEXWORTH DYNAMICS - $DEPT DEPARTMENT - ASSIGNMENT 15
Fiscal year end for "$PROJ". Seal the yearbook and ledgers for the vault, and
open the 2021 mystery capsule records sent over - but INSPECT before you
extract, always. Create archives FROM INSIDE capsule/ so their internal paths
start with the directory name. tar seals and opens; gzip crushes; -C aims.
  - The Director
EOF

cat > "$CP/yearbook/awards.txt" <<EOF
Team awards $PROJ: recovery of the year.
EOF
cat > "$CP/yearbook/photos/team.txt" <<EOF
[photo placeholder: the $DEPT team at the annex opening]
EOF
cat > "$CP/ledgers/q4.csv" <<EOF
month,closed
oct,yes
nov,yes
dec,yes
EOF
cat > "$CP/ledgers/summary.txt" <<EOF
Year closed in the black.
EOF

# Mystery capsule from 2021 (seed builds it, then removes the plain source)
MYST="$REF_DIR/vault_2021"
mkdir -p "$MYST"
cat > "$MYST/deposits.txt" <<EOF
2021 deposits ledger - sealed at year end.
EOF
cat > "$MYST/note_to_future.txt" <<EOF
To whoever opens this: the server room key is taped under the third drawer.
EOF
( cd "$REF_DIR" && tar -czf "$CP/mystery_2021.tgz" vault_2021 )

chown -R student:student "$DEPT_DIR"

# References
( cd "$CP" && tar -cf "$REF_DIR/yearbook.tar" yearbook )
tar -tf "$REF_DIR/yearbook.tar" | sort > "$REF_DIR/yb_list"
( cd "$CP" && tar -czf "$REF_DIR/ledgers.tgz" ledgers )
tar -tzf "$REF_DIR/ledgers.tgz" | sort > "$REF_DIR/lg_list"
tar -tzf "$CP/mystery_2021.tgz" > "$REF_DIR/manifest"
TAR_BYTES=$(wc -c < "$REF_DIR/yearbook.tar")

sha() { sha256sum "$1" | cut -d' ' -f1; }

cat > "$MISSION_DIR/env.tar-timecapsule" <<EOF
MISSION_ID="tar-timecapsule"
MISSION_DEPT="$DEPT"
MISSION_PROJ="$PROJ"
MISSION_SHA_YEARBOOK_LIST="$(sha "$REF_DIR/yb_list")"
MISSION_SHA_LEDGERS_LIST="$(sha "$REF_DIR/lg_list")"
MISSION_SHA_MANIFEST="$(sha "$REF_DIR/manifest")"
MISSION_SHA_DEPOSITS="$(sha "$MYST/deposits.txt")"
MISSION_SHA_NOTE="$(sha "$MYST/note_to_future.txt")"
MISSION_SHA_AWARDS="$(sha "$CP/yearbook/awards.txt")"
MISSION_TAR_BYTES="$TAR_BYTES"
EOF
chmod 0644 "$MISSION_DIR/env.tar-timecapsule"

rm -rf "$REF_DIR"

exit 0
