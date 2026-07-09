#!/bin/sh
. /opt/mission/env.ip-linecheck 2>/dev/null
test "$(sed -n 3p /home/student/$MISSION_DEPT/linecheck/AUDIT.txt)" = "pulse confirmed"
