#!/bin/sh
# Mission seed: grep-investigation ("Mission 08: The Investigation")
# Deterministic 400-line auth.log with FAILED/denied-case-mix/root-escalation/
# whole-word-ops/night-hour lines + a files/ tree with suspect traces.
# Non-destructive rebuild (log + files regenerated identically; artifacts separate).
set -eu

MISSION_DIR=/opt/mission
mkdir -p "$MISSION_DIR"

H=$(hostname | cksum | cut -d' ' -f1)
pick() {
  n=$1; shift
  eval "echo \${$(( (H % n) + 1 ))}"
}
DEPT=$(set -- finance logistics research; pick 3 "$@")
SUSPECT=$(set -- mgrady kvoss tnolan;     pick 3 "$@")

DEPT_DIR="/home/student/$DEPT"
CW="$DEPT_DIR/casework"
REF_DIR="$MISSION_DIR/.ref"
mkdir -p "$CW/files/hr" "$CW/files/it" "$REF_DIR"
chmod 0700 "$REF_DIR"

cat > "$DEPT_DIR/BRIEFING8.txt" <<EOF
HEXWORTH DYNAMICS - $DEPT DEPARTMENT - ASSIGNMENT 8
Security investigation. Person of interest: $SUSPECT. Evidence: casework/auth.log
(400 lines) and the casework/files tree. Work the patterns in the work orders;
never edit the evidence. Run searches over files/ FROM the casework directory
so filenames in your output match the warrant format.  - The Director
EOF

LOG="$CW/auth.log"
: > "$LOG"
i=1
while [ "$i" -le 400 ]; do
  hh=$(( (i * 7) % 24 )); mm=$(( (i * 13) % 60 ))
  ts=$(printf '%02d:%02d' "$hh" "$mm")
  case $(( i % 23 )) in
    3)  echo "$ts login FAILED for user guest$i from 10.0.4.$((i%250))" >> "$LOG" ;;
    5)  echo "$ts access Denied to payroll share for temp$i" >> "$LOG" ;;
    7)  echo "$ts access DENIED to vault door for temp$i" >> "$LOG" ;;
    9)  echo "$ts access denied to archive for temp$i" >> "$LOG" ;;
    11) echo "$ts escalation to root by $SUSPECT on host db$((i%9))" >> "$LOG" ;;
    13) echo "$ts ops rotation confirmed by shift lead" >> "$LOG" ;;
    15) echo "$ts gridops sync completed normally" >> "$LOG" ;;
    17) echo "$ts devops pipeline finished build $i" >> "$LOG" ;;
    19) echo "$ts session opened for $SUSPECT tty$((i%7))" >> "$LOG" ;;
    *)  echo "$ts heartbeat ok seq $i" >> "$LOG" ;;
  esac
  i=$((i+1))
done

cat > "$CW/files/hr/note_march.txt" <<EOF
HR note: $SUSPECT requested weekend badge access twice in March.
EOF
cat > "$CW/files/hr/roster.txt" <<EOF
Roster: aday, bkey, $SUSPECT, rvex, jcole
EOF
cat > "$CW/files/it/tickets.txt" <<EOF
T-101 printer jam floor 2
T-102 password reset for $SUSPECT approved out of band
EOF
cat > "$CW/files/it/backups.txt" <<EOF
backup rotation normal all month
EOF

chown -R student:student "$DEPT_DIR"

# References computed exactly as the briefs instruct (relative runs from casework/)
cd "$CW"
grep FAILED auth.log                 > "$REF_DIR/failed"
grep -i denied auth.log              > "$REF_DIR/denied"
SUSPECT_COUNT=$(grep -c "$SUSPECT" auth.log)
grep -v FAILED auth.log              > "$REF_DIR/clean"
grep -n 'escalation to root' auth.log > "$REF_DIR/rootlines"
grep -w ops auth.log                 > "$REF_DIR/opsword"
grep -r "$SUSPECT" files             > "$REF_DIR/traces"
grep -E '^0[2-4]:' auth.log          > "$REF_DIR/night"
grep -rl "$SUSPECT" files            > "$REF_DIR/warrant"

sha() { sha256sum "$1" | cut -d' ' -f1; }

cat > "$MISSION_DIR/env.grep-investigation" <<EOF
MISSION_ID=grep-investigation
MISSION_DEPT=$DEPT
MISSION_SUSPECT=$SUSPECT
MISSION_SUSPECT_COUNT=$SUSPECT_COUNT
MISSION_SHA_AUTHLOG=$(sha auth.log)
MISSION_SHA_FAILED=$(sha "$REF_DIR/failed")
MISSION_SHA_DENIED=$(sha "$REF_DIR/denied")
MISSION_SHA_CLEAN=$(sha "$REF_DIR/clean")
MISSION_SHA_ROOTLINES=$(sha "$REF_DIR/rootlines")
MISSION_SHA_OPSWORD=$(sha "$REF_DIR/opsword")
MISSION_SHA_TRACES=$(sha "$REF_DIR/traces")
MISSION_SHA_NIGHT=$(sha "$REF_DIR/night")
MISSION_SHA_WARRANT=$(sha "$REF_DIR/warrant")
EOF
chmod 0644 "$MISSION_DIR/env.grep-investigation"

rm -rf "$REF_DIR"

exit 0
