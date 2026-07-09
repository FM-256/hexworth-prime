#!/bin/sh
. /opt/mission/env.chmod-lockdown 2>/dev/null
test "$(stat -c %a /home/student/$MISSION_DEPT/lockdown/final_report.txt)" = "444"
