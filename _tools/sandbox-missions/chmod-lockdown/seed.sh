#!/bin/sh
# Mission seed: chmod-lockdown ("Mission 13: The Lockdown")
# Plants files with deliberately WRONG permissions for the student to fix.
# DESTRUCTIVE-GUARDED: graded artifacts are the corrected modes; a re-seed
# would reset every lock back to broken.
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
LD="$DEPT_DIR/lockdown"

if [ -f "$MISSION_DIR/env.chmod-lockdown" ] && [ -d "$LD" ]; then
  exit 0
fi

rm -rf "$LD"
mkdir -p "$LD/records" "$LD/handouts/week2" "$LD/exchange"

cat > "$DEPT_DIR/BRIEFING13.txt" <<EOF
HEXWORTH DYNAMICS - $DEPT DEPARTMENT - ASSIGNMENT 13
Lockdown for "$PROJ": the sweep's findings get fixed today. Each work order
names an exact permission spec - numeric (600, 644, 700...) or symbolic (u+x,
go-w). stat -c %a <file> shows a lock's current numbers whenever you need to
check your work. Locks change; contents never do.  - The Director
EOF

cat > "$LD/payroll.csv" <<EOF
name,salary
aday,68000
bkey,71500
EOF
cat > "$LD/deploy.sh" <<EOF
#!/bin/sh
echo "deploying $PROJ to staging"
EOF
cat > "$LD/team_report.txt" <<EOF
Team standing report for $PROJ: on schedule.
EOF
printf 'drop files here\n' > "$LD/dropbox.txt"
printf 'records index v1\n' > "$LD/records/index.txt"
printf 'welcome packet\n' > "$LD/handouts/welcome.txt"
printf 'week 2 syllabus\n' > "$LD/handouts/week2/syllabus.txt"
cat > "$LD/final_report.txt" <<EOF
FINAL REPORT - $PROJ - sealed by the director.
EOF

# Deliberately broken starting locks
chmod 644 "$LD/payroll.csv"        # too open -> 600
chmod 644 "$LD/deploy.sh"          # not executable -> u+x = 744
chmod 666 "$LD/team_report.txt"    # wrong -> 640
chmod 666 "$LD/dropbox.txt"        # world-writable -> go-w = 644
chmod 777 "$LD/records"            # open house -> 700
chmod 600 "$LD/handouts/welcome.txt"        # too tight -> 644
chmod 777 "$LD/handouts/week2/syllabus.txt" # wrong -> 644
chmod 664 "$LD/final_report.txt"   # writable -> 444
chmod 755 "$LD/exchange"           # bonus -> 1777

chown -R student:student "$DEPT_DIR"

sha() { sha256sum "$1" | cut -d' ' -f1; }

cat > "$MISSION_DIR/env.chmod-lockdown" <<EOF
MISSION_ID="chmod-lockdown"
MISSION_DEPT="$DEPT"
MISSION_PROJ="$PROJ"
MISSION_SHA_PAYROLL="$(sha "$LD/payroll.csv")"
MISSION_SHA_DEPLOY="$(sha "$LD/deploy.sh")"
MISSION_SHA_RECORDS="$(sha "$LD/records/index.txt")"
EOF
chmod 0644 "$MISSION_DIR/env.chmod-lockdown"

exit 0
