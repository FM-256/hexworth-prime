#!/bin/sh
. /opt/mission/env.ps-runaway 2>/dev/null
test -f /home/student/$MISSION_DEPT/ops/daemon_name.txt && test "$(cat /home/student/$MISSION_DEPT/ops/daemon_name.txt)" = "$(ps -o comm= -p "$(pgrep -f hexlab_report_daemon | head -1)")"
