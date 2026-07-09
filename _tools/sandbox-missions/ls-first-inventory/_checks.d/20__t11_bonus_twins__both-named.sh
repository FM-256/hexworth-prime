#!/bin/sh
. /opt/mission/env.ls-first-inventory 2>/dev/null
test -f /home/student/$MISSION_DEPT/reports/twins.txt && grep -qx "$MISSION_TWIN_A" /home/student/$MISSION_DEPT/reports/twins.txt && grep -qx "$MISSION_TWIN_B" /home/student/$MISSION_DEPT/reports/twins.txt && test "$(awk 'END{print NR}' /home/student/$MISSION_DEPT/reports/twins.txt)" -eq 2
