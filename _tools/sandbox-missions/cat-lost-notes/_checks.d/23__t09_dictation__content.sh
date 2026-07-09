#!/bin/sh
. /opt/mission/env.cat-lost-notes 2>/dev/null
grep -qx "Recovered by hand for project $MISSION_PROJ" /home/student/$MISSION_DEPT/dictation.txt && test "$(awk 'END{print NR}' /home/student/$MISSION_DEPT/dictation.txt)" -eq 1
