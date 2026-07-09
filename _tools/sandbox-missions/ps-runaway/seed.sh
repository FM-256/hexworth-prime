#!/bin/sh
# Mission seed: ps-runaway ("Mission 16: The Runaway")
# Launches the process cast as the student user via setsid (survives the exec
# session, reparents to PID 1): report_daemon (protected), runaway_miner (TERM
# target), gridmon_stuck (traps TERM; requires KILL), logger_svc (USR1 writes a
# reload receipt), 3 workers (headcount bonus). DESTRUCTIVE-GUARDED: kills are
# graded by absence; also re-spawn-guarded per process so resume never doubles.
set -eu

MISSION_DIR=/opt/mission
BIN=/opt/mission/bin
mkdir -p "$MISSION_DIR" "$BIN"

H=$(hostname | cksum | cut -d' ' -f1)
pick() {
  n=$1; shift
  eval "echo \${$(( (H % n) + 1 ))}"
}
DEPT=$(set -- finance logistics research;   pick 3 "$@")
PROJ=$(set -- alpha delta kestrel waypoint; pick 4 "$@")

DEPT_DIR="/home/student/$DEPT"
OPS="$DEPT_DIR/ops"

# Destructive guard: absence of killed rogues is the graded artifact.
if [ -f "$MISSION_DIR/env.ps-runaway" ] && [ -d "$OPS" ]; then
  exit 0
fi

mkdir -p "$OPS"

cat > "$DEPT_DIR/BRIEFING16.txt" <<EOF
HEXWORTH DYNAMICS - $DEPT DEPARTMENT - ASSIGNMENT 16
3 AM page for "$PROJ". The process cast: report_daemon (legitimate - protect
it), runaway_miner (terminate politely), gridmon_stuck (ignores polite - you
will see), logger_svc (needs a USR1 reload, NOT a kill), and a pool of workers.
ps aux shows the room; pgrep finds by name; kill SPEAKS to processes - what it
says is up to you. All mission processes are named hexlab_*.  - The Director
EOF

# Process scripts (comm names must start hexlab_* for pgrep -f targeting)
cat > "$BIN/hexlab_report_daemon" <<'EOF'
#!/bin/sh
while :; do sleep 300; done
EOF
cat > "$BIN/hexlab_runaway_miner" <<'EOF'
#!/bin/sh
while :; do sleep 300; done
EOF
cat > "$BIN/hexlab_gridmon_stuck" <<'EOF'
#!/bin/sh
trap '' TERM INT HUP
while :; do sleep 300; done
EOF
cat > "$BIN/hexlab_logger_svc" <<EOF
#!/bin/sh
trap 'touch $OPS/logger_reloaded' USR1
# short sleep: POSIX shells run traps only between commands, so the receipt
# lands within a second of the signal instead of after a long nap
while :; do sleep 1; done
EOF
cat > "$BIN/hexlab_worker_bee" <<'EOF'
#!/bin/sh
while :; do sleep 300; done
EOF
chmod 755 "$BIN"/hexlab_*
chown -R student:student "$DEPT_DIR"

# Launch as student, detached (setsid: survives this exec, reparents to PID 1).
spawn() { # spawn <script> [instance-tag]
  pgrep -f "$1${2:+ $2}" >/dev/null 2>&1 && return 0
  su -s /bin/sh student -c "setsid $BIN/$1 ${2:-} >/dev/null 2>&1 &" || true
}
spawn hexlab_report_daemon
spawn hexlab_runaway_miner
spawn hexlab_gridmon_stuck
spawn hexlab_logger_svc
spawn hexlab_worker_bee w1
spawn hexlab_worker_bee w2
spawn hexlab_worker_bee w3
sleep 1

cat > "$MISSION_DIR/env.ps-runaway" <<EOF
MISSION_ID=ps-runaway
MISSION_DEPT=$DEPT
MISSION_PROJ=$PROJ
EOF
chmod 0644 "$MISSION_DIR/env.ps-runaway"

exit 0
