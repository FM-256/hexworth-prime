#!/bin/sh
# Mission seed: wc-census ("Mission 10: The Census")
# Deterministic files with known line/word/byte counts, a long-line banner,
# an ERROR-seeded build log, three quarterly reports, and an empty file.
# Non-destructive rebuild.
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
CS="$DEPT_DIR/census"
REF_DIR="$MISSION_DIR/.ref"
mkdir -p "$CS" "$REF_DIR"
chmod 0700 "$REF_DIR"

cat > "$DEPT_DIR/BRIEFING10.txt" <<EOF
HEXWORTH DYNAMICS - $DEPT DEPARTMENT - ASSIGNMENT 10
Census day for "$PROJ". HQ wants counts: lines, words, bytes, widths, totals.
Answers are NUMBERS in files (the work orders name each one). Tip: wc prints a
filename when you hand it one; feed it from a pipe or a redirect when the order
says "just the number". Sources are read-only.  - The Director
EOF

# minutes.txt: deterministic 37 lines
i=1; : > "$CS/minutes.txt"
while [ "$i" -le 37 ]; do echo "minute item $i recorded" >> "$CS/minutes.txt"; i=$((i+1)); done

cat > "$CS/contract.txt" <<EOF
This service agreement binds Hexworth Dynamics and the vendor of record
for project $PROJ under the master terms filed with the county clerk.
Payment follows delivery. Disputes resolve by arbitration in good faith.
EOF

head -c 2048 /dev/zero > "$CS/export.bin"

printf 'short\nmedium banner line here\nTHE GRAND OPENING OF THE %s ANNEX WING WELCOMES ALL DEPARTMENTS\nshort again\n' "$PROJ" > "$CS/banner.txt"

i=1; : > "$CS/build.log"
while [ "$i" -le 60 ]; do
  if [ $((i % 9)) -eq 0 ]; then echo "step $i ERROR: link failure" >> "$CS/build.log"
  else echo "step $i ok" >> "$CS/build.log"; fi
  i=$((i+1))
done

printf 'q1 summary line one\nq1 line two\n' > "$CS/report_q1.txt"
printf 'q2 had three lines\nof careful text\nthis quarter\n' > "$CS/report_q2.txt"
printf 'q3 wrap-up\n' > "$CS/report_q3.txt"
: > "$CS/blank.txt"

chown -R student:student "$DEPT_DIR"

cd "$CS"
wc report_q1.txt report_q2.txt report_q3.txt > "$REF_DIR/totals"

sha() { sha256sum "$1" | cut -d' ' -f1; }

cat > "$MISSION_DIR/env.wc-census" <<EOF
MISSION_ID=wc-census
MISSION_DEPT=$DEPT
MISSION_PROJ=$PROJ
MISSION_MINUTES_LINES=$(wc -l < minutes.txt)
MISSION_CONTRACT_WORDS=$(wc -w < contract.txt)
MISSION_EXPORT_BYTES=$(wc -c < export.bin)
MISSION_BANNER_WIDTH=$(wc -L < banner.txt)
MISSION_ERROR_COUNT=$(grep ERROR build.log | wc -l)
MISSION_SHA_TOTALS=$(sha "$REF_DIR/totals")
MISSION_SHA_MINUTES=$(sha minutes.txt)
EOF
chmod 0644 "$MISSION_DIR/env.wc-census"

rm -rf "$REF_DIR"

exit 0
