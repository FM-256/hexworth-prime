#!/bin/sh
# Mission seed: headtail-logwatch ("Mission 07: The Log Watch")
# Generates a deterministic 500-line service log (content varies by SVC pick but
# is stable per container) and records slice checksums. Non-destructive rebuild:
# the log is regenerated identically; student artifacts are separate files.
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
SVC=$(set -- authd queued cached;         pick 3 "$@")

DEPT_DIR="/home/student/$DEPT"
LW="$DEPT_DIR/logwatch"
REF_DIR="$MISSION_DIR/.ref"
mkdir -p "$LW" "$REF_DIR"
chmod 0700 "$REF_DIR"

cat > "$DEPT_DIR/BRIEFING7.txt" <<EOF
HEXWORTH DYNAMICS - $DEPT DEPARTMENT - ASSIGNMENT 7
Night shift. The $SVC service log (logwatch/service.log) is 500 lines and
climbing. Nobody reads whole logs: we slice them. The work orders name every
slice. The log itself is evidence - read it, never edit it.  - The Director
EOF

# Deterministic 500-line log: boot block, steady state, an incident at line 42,
# shutdown noise in the last 20 lines.
LOG="$LW/service.log"
: > "$LOG"
i=1
while [ "$i" -le 500 ]; do
  if [ "$i" -le 10 ]; then
    echo "[boot] $SVC stage $i initialized" >> "$LOG"
  elif [ "$i" -eq 42 ]; then
    echo "[ALERT] $SVC incident opened: watchdog timeout on worker 7" >> "$LOG"
  elif [ "$i" -gt 480 ]; then
    echo "[shutdown] $SVC drain step $i" >> "$LOG"
  else
    echo "[info] $SVC heartbeat seq $i ok" >> "$LOG"
  fi
  i=$((i+1))
done

chown -R student:student "$DEPT_DIR"

# ── 2. Reference slices + checksums ──────────────────────────────────────────
head "$LOG"           > "$REF_DIR/first10"
tail "$LOG"           > "$REF_DIR/last10"
head -n 25 "$LOG"     > "$REF_DIR/boot25"
tail -n 3 "$LOG"      > "$REF_DIR/alert3"
head -n 42 "$LOG" | tail -n 1 > "$REF_DIR/line42"
head -n -20 "$LOG"    > "$REF_DIR/trimmed"
tail -n +100 "$LOG"   > "$REF_DIR/from100"
head -c 32 "$LOG"     > "$REF_DIR/magic"

sha() { sha256sum "$1" | cut -d' ' -f1; }

cat > "$MISSION_DIR/env.headtail-logwatch" <<EOF
MISSION_ID=headtail-logwatch
MISSION_DEPT=$DEPT
MISSION_SVC=$SVC
MISSION_SHA_LOG=$(sha "$LOG")
MISSION_SHA_FIRST10=$(sha "$REF_DIR/first10")
MISSION_SHA_LAST10=$(sha "$REF_DIR/last10")
MISSION_SHA_BOOT25=$(sha "$REF_DIR/boot25")
MISSION_SHA_ALERT3=$(sha "$REF_DIR/alert3")
MISSION_SHA_LINE42=$(sha "$REF_DIR/line42")
MISSION_SHA_TRIMMED=$(sha "$REF_DIR/trimmed")
MISSION_SHA_FROM100=$(sha "$REF_DIR/from100")
MISSION_SHA_MAGIC=$(sha "$REF_DIR/magic")
EOF
chmod 0644 "$MISSION_DIR/env.headtail-logwatch"

rm -rf "$REF_DIR"

exit 0
