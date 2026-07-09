#!/bin/sh
. /opt/mission/env.ip-linecheck 2>/dev/null
test "$(sed -n 1p /home/student/$MISSION_DEPT/linecheck/AUDIT.txt)" = "$(ip -o -4 addr show eth0 | awk '{print $4}' | cut -d/ -f1)"
