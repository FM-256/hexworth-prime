#!/bin/sh
# Mission seed: find-sweep ("Mission 12: The Sweep")
# Deep projects/ tree with named configs, *.swp droppings, >100k files,
# world-writable files, empty husks, and two recently-touched files.
# List checks are ORDER-INSENSITIVE (both sides sorted before sha).
# DESTRUCTIVE-GUARDED: t07 deletes the .swp files; a re-seed would resurrect them.
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
SW="$DEPT_DIR/sweep"
REF_DIR="$MISSION_DIR/.ref"

# Destructive-seed guard (SCHEMA): .swp absence is a graded artifact.
if [ -f "$MISSION_DIR/env.find-sweep" ] && [ -d "$SW" ]; then
  exit 0
fi

rm -rf "$SW"
mkdir -p "$SW/projects/portal/cache" "$SW/projects/api/handlers" "$SW/projects/legacy" "$SW/projects/docs" "$REF_DIR"
chmod 0700 "$REF_DIR"

cat > "$DEPT_DIR/BRIEFING12.txt" <<EOF
HEXWORTH DYNAMICS - $DEPT DEPARTMENT - ASSIGNMENT 12
Compliance sweep of the "$PROJ" project tree (sweep/projects). Each work order
names a category: exact names, patterns, types, sizes, permissions, emptiness,
age. Save each list as find prints the paths - and RUN EVERYTHING FROM the
sweep/ directory against the relative name projects, so paths match the
compliance format. Order does not matter; completeness does.  - The Director
EOF

# configs (3, one nested deep)
printf 'mode=live\n'    > "$SW/projects/portal/settings.conf"
printf 'mode=stage\n'   > "$SW/projects/api/settings.conf"
printf 'mode=legacy\n'  > "$SW/projects/api/handlers/settings.conf"
# swp droppings (3)
printf 'x' > "$SW/projects/portal/.index.html.swp"
printf 'x' > "$SW/projects/api/.routes.py.swp"
printf 'x' > "$SW/projects/docs/.readme.md.swp"
# oversized (2 over 100k, 1 under)
head -c 150000 /dev/zero > "$SW/projects/portal/export.dat"
head -c 220000 /dev/zero > "$SW/projects/legacy/dump_$PROJ.bin"
head -c 40000  /dev/zero > "$SW/projects/docs/media.bin"
# world-writable (2)
printf 'temp scratch\n' > "$SW/projects/legacy/scratchpad.txt"
printf 'shared drop\n'  > "$SW/projects/portal/cache/dropbox.txt"
chmod 666 "$SW/projects/legacy/scratchpad.txt"
chmod 666 "$SW/projects/portal/cache/dropbox.txt"
# empty husks (2 files + 1 empty dir that must NOT be listed)
: > "$SW/projects/api/husk_a.tmp"
: > "$SW/projects/docs/husk_b.tmp"
mkdir -p "$SW/projects/legacy/empty_dir"
# normal files, old timestamps
printf 'readme body\n' > "$SW/projects/docs/readme.md"
printf 'main handler\n' > "$SW/projects/api/handlers/main.py"
touch -d '2025-11-02 09:00' "$SW/projects/docs/readme.md" "$SW/projects/api/handlers/main.py" \
  "$SW/projects/portal/settings.conf" "$SW/projects/api/settings.conf" "$SW/projects/api/handlers/settings.conf" \
  "$SW/projects/portal/export.dat" "$SW/projects/legacy/dump_$PROJ.bin" "$SW/projects/docs/media.bin" \
  "$SW/projects/legacy/scratchpad.txt" "$SW/projects/portal/cache/dropbox.txt" \
  "$SW/projects/api/husk_a.tmp" "$SW/projects/docs/husk_b.tmp" \
  "$SW/projects/portal/.index.html.swp" "$SW/projects/api/.routes.py.swp" "$SW/projects/docs/.readme.md.swp"
# two RECENT files (touched now, deterministic per seed run)
printf 'hotfix notes\n' > "$SW/projects/api/hotfix.md"
printf 'release draft\n' > "$SW/projects/docs/release_draft.md"

chown -R student:student "$DEPT_DIR"

# References: same commands the briefs dictate, run from sweep/, sorted.
cd "$SW"
find projects -name settings.conf | sort            > "$REF_DIR/conf"
find projects -name '*.swp' | sort                  > "$REF_DIR/swp"
find projects -type d | sort                        > "$REF_DIR/dirs"
find projects -type f -size +100k | sort            > "$REF_DIR/big"
find projects -type f -perm -002 | sort             > "$REF_DIR/danger"
find projects -type f -empty | sort                 > "$REF_DIR/empty"
find projects -type f -mtime -1 | sort              > "$REF_DIR/recent"
CONF_COUNT=$(find projects -name settings.conf | wc -l)
TOTAL_FILES=$(find projects -type f | wc -l)
SWP_COUNT=$(find projects -name '*.swp' | wc -l)
FILES_AFTER=$(( TOTAL_FILES - SWP_COUNT ))

sha() { sha256sum "$1" | cut -d' ' -f1; }

cat > "$MISSION_DIR/env.find-sweep" <<EOF
MISSION_ID="find-sweep"
MISSION_DEPT="$DEPT"
MISSION_PROJ="$PROJ"
MISSION_SHA_CONF="$(sha "$REF_DIR/conf")"
MISSION_SHA_SWP="$(sha "$REF_DIR/swp")"
MISSION_SHA_DIRS="$(sha "$REF_DIR/dirs")"
MISSION_SHA_BIG="$(sha "$REF_DIR/big")"
MISSION_SHA_DANGER="$(sha "$REF_DIR/danger")"
MISSION_SHA_EMPTY="$(sha "$REF_DIR/empty")"
MISSION_SHA_RECENT="$(sha "$REF_DIR/recent")"
MISSION_CONF_COUNT="$CONF_COUNT"
MISSION_FILES_AFTER="$FILES_AFTER"
MISSION_SHA_PORTALCONF="$(sha projects/portal/settings.conf)"
EOF
chmod 0644 "$MISSION_DIR/env.find-sweep"

rm -rf "$REF_DIR"

exit 0
