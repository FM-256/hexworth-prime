#!/bin/sh
. /opt/mission/env.chmod-lockdown 2>/dev/null
test "$(stat -c %a /home/student/$MISSION_DEPT/lockdown/team_report.txt)" = "640"
