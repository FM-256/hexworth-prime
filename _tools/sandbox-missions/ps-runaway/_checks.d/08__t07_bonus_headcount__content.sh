#!/bin/sh
. /opt/mission/env.ps-runaway 2>/dev/null
test -f /home/student/$MISSION_DEPT/ops/workercount.txt && test "$(cat /home/student/$MISSION_DEPT/ops/workercount.txt)" = "$(pgrep -fc "hexlab_[w]orker_")"
