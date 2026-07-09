#!/bin/sh
. /opt/mission/env.ip-linecheck 2>/dev/null
test -f /home/student/$MISSION_DEPT/linecheck/gateway.txt && test "$(cat /home/student/$MISSION_DEPT/linecheck/gateway.txt)" = "$(ip route | awk '/^default/{print $3}')"
