#!/bin/sh
. /opt/mission/env.rm-decommission 2>/dev/null
test "$(ls /home/student/$MISSION_DEPT/decommission/active_*.cert 2>/dev/null | awk 'END{print NR}')" = "$MISSION_ACTIVE_COUNT"
