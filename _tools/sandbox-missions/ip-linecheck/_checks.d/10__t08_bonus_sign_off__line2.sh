#!/bin/sh
. /opt/mission/env.ip-linecheck 2>/dev/null
test "$(sed -n 2p /home/student/$MISSION_DEPT/linecheck/AUDIT.txt)" = "$(ip route | awk '/^default/{print $3}')"
