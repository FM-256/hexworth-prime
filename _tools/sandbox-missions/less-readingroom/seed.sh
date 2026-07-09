#!/bin/sh
# Mission seed: less-readingroom ("Mission 11: The Reading Room")
# Generates a deterministic 3000-line policy manual with a title line, SECTION
# headings, one code-word line at a randomized-but-deterministic position, a
# known line 1500, a revision stamp at the end, and a kiosk notice for more.
# Grading is answer-artifacts (pager use is the natural path; content is what
# is graded, per SCHEMA objective-over-syntax). Non-destructive rebuild.
set -eu

MISSION_DIR=/opt/mission
mkdir -p "$MISSION_DIR"

H=$(hostname | cksum | cut -d' ' -f1)
pick() {
  n=$1; shift
  eval "echo \${$(( (H % n) + 1 ))}"
}
DEPT=$(set -- finance logistics research;      pick 3 "$@")
CODE=$(set -- CANARY-9 LANTERN-4 COMPASS-7;    pick 3 "$@")

DEPT_DIR="/home/student/$DEPT"
RR="$DEPT_DIR/readingroom"
mkdir -p "$RR"

cat > "$DEPT_DIR/BRIEFING11.txt" <<EOF
HEXWORTH DYNAMICS - $DEPT DEPARTMENT - ASSIGNMENT 11
The merger manual (readingroom/manual.txt) is 3,000 lines. Use the reading room
tools: less (space=page, /=search, n=next match, G=end, <number>g=jump, q=quit)
and, on the kiosk, more. The work orders ask for exact lines - the pager shows
them; you transcribe them into answer files. The manual is library property:
read, never edit.  - The Director
EOF

# Deterministic code-word line position: derived from hostname hash, mid-manual.
# NEVER on a multiple of 250 (SECTION headings win those slots) and never 1500
# (the fixed policy line): collisions previously made the code line vanish and
# aborted the seed under set -eu (Nancy wave review, ~0.4% of hashes).
CODEPOS=$(( 400 + (H % 2200) ))   # somewhere between 400 and 2599
if [ $(( CODEPOS % 250 )) -eq 0 ]; then CODEPOS=$(( CODEPOS + 1 )); fi
TITLE="HEXWORTH DYNAMICS UNIFIED POLICY MANUAL - MERGER EDITION"
LASTLINE="REVISION STAMP: merger edition, sealed by the records office"

MAN="$RR/manual.txt"
: > "$MAN"
echo "$TITLE" >> "$MAN"
i=2
while [ "$i" -le 2999 ]; do
  if [ "$i" -eq "$CODEPOS" ]; then
    echo "Emergency procedures activate under code word $CODE only." >> "$MAN"
  elif [ "$i" -eq 1500 ]; then
    echo "Policy 1500: badge audits occur quarterly without notice." >> "$MAN"
  elif [ $(( i % 250 )) -eq 0 ]; then
    echo "SECTION $(( i / 250 )): consolidated policy block" >> "$MAN"
  else
    echo "clause $i: standard operating language applies as filed." >> "$MAN"
  fi
  i=$((i+1))
done
echo "$LASTLINE" >> "$MAN"

cat > "$RR/notice.txt" <<EOF
LOBBY KIOSK NOTICE
Badge required beyond the lobby at all times.
All visitors must sign the ledger and wear an escort tag.
Deliveries route through the dock, not the lobby.
EOF

chown -R student:student "$DEPT_DIR"

SECTION_COUNT=$(grep -c '^SECTION ' "$MAN")
CODE_LINE=$(grep "code word" "$MAN" || true)
# Fail LOUDLY if the payload line is missing: a silent partial seed poisons the
# whole mission (set -eu contract, SCHEMA).
test -n "$CODE_LINE"
LINE_1500=$(sed -n '1500p' "$MAN")
VISITOR_LINE=$(grep -i visitors "$RR/notice.txt")
if [ "$CODEPOS" -le 1500 ]; then CODE_HALF=first; else CODE_HALF=second; fi

sha() { sha256sum "$1" | cut -d' ' -f1; }

# Values are DOUBLE-QUOTED: several contain spaces, and an unquoted spacey
# value breaks `.`-sourcing (vars stay empty and checks go vacuous - caught in
# the Nancy-directed collision verification 2026-07-09).
cat > "$MISSION_DIR/env.less-readingroom" <<EOF
MISSION_ID="less-readingroom"
MISSION_DEPT="$DEPT"
MISSION_CODE="$CODE"
MISSION_TITLE_LINE="$TITLE"
MISSION_LAST_LINE="$LASTLINE"
MISSION_CODE_LINE="$CODE_LINE"
MISSION_LINE_1500="$LINE_1500"
MISSION_SECTION_COUNT="$SECTION_COUNT"
MISSION_VISITOR_LINE="$VISITOR_LINE"
MISSION_CODE_HALF="$CODE_HALF"
MISSION_SHA_MANUAL="$(sha "$MAN")"
EOF
chmod 0644 "$MISSION_DIR/env.less-readingroom"

exit 0
