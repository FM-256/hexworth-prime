#!/bin/sh
. /opt/mission/env.ps-runaway 2>/dev/null
test -f /home/student/$MISSION_DEPT/ops/daemon_pid.txt && test "$(cat /home/student/$MISSION_DEPT/ops/daemon_pid.txt)" = "$(pgrep -f hexlab_report_daemon | head -1)"
