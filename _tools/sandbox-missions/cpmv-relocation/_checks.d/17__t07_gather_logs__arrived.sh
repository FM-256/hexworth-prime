#!/bin/sh
. /opt/mission/env.cpmv-relocation 2>/dev/null
test "$(ls /home/student/$MISSION_DEPT/office_new/logs/*.log 2>/dev/null | awk 'END{print NR}')" = "$MISSION_LOG_COUNT"
