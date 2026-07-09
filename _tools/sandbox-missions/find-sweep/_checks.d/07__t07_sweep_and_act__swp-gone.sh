#!/bin/sh
. /opt/mission/env.find-sweep 2>/dev/null
test -z "$(find /home/student/$MISSION_DEPT/sweep/projects -name '*.swp' -print -quit)"
