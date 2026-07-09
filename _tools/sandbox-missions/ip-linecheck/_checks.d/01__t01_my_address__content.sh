#!/bin/sh
. /opt/mission/env.ip-linecheck 2>/dev/null
test -f /home/student/$MISSION_DEPT/linecheck/myip.txt && test "$(cat /home/student/$MISSION_DEPT/linecheck/myip.txt)" = "$(ip -o -4 addr show eth0 | awk '{print $4}' | cut -d/ -f1)"
