#!/bin/sh
# Canonical student solution for grep-investigation, run AS student.
# Pure grep workflow: plain, -i, -c, -v, -n, -w, -r, regex class, -rl.
. /opt/mission/env.grep-investigation
cd "/home/student/$MISSION_DEPT/casework" || exit 1
cat ../BRIEFING8.txt >/dev/null
grep FAILED auth.log > failed.txt
grep -i denied auth.log > denied.txt
grep -c "$MISSION_SUSPECT" auth.log > suspectcount.txt
grep -v FAILED auth.log > clean.txt
grep -n 'escalation to root' auth.log > rootlines.txt
grep -w ops auth.log > opsword.txt
grep -r "$MISSION_SUSPECT" files > traces.txt
grep -E '^0[2-4]:' auth.log > nighthours.txt
grep -rl "$MISSION_SUSPECT" files > warrant.txt
echo "solution applied"
