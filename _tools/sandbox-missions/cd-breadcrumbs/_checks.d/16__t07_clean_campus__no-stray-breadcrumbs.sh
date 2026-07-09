#!/bin/sh
. /opt/mission/env.cd-breadcrumbs 2>/dev/null
test -z "$(find /home/student/$MISSION_DEPT/campus -maxdepth 1 -name '*.txt' -print -quit)"
