#!/bin/sh
. /opt/mission/env.wc-census 2>/dev/null
test -f /home/student/$MISSION_DEPT/census/minutes_lines.txt && grep -qxE " *$MISSION_MINUTES_LINES" /home/student/$MISSION_DEPT/census/minutes_lines.txt
